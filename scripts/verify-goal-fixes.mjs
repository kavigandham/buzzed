import puppeteer from 'puppeteer-core';
import os from 'os';
import path from 'path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.env.SHOT_DIR || os.tmpdir();
const URL = 'http://localhost:8081';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--window-size=420,900'],
  defaultViewport: { width: 420, height: 900 },
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
const shot = (name) => page.screenshot({ path: path.join(OUT, name) });
const readText = () => page.evaluate(() => document.body.innerText);

async function clickTab(label) {
  const r = await page.evaluate((label) => {
    const tab = [...document.querySelectorAll('[role="tab"]')].find((e) => (e.innerText || '').includes(label));
    if (!tab) return null;
    const b = tab.getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }, label);
  if (!r) throw new Error(`no tab ${label}`);
  await page.mouse.click(r.x, r.y);
}
async function rectByText(text, exact = true) {
  return page.evaluate((text, exact) => {
    let best = null;
    for (const el of document.querySelectorAll('div,span,a,button,input,[role]')) {
      const t = (el.innerText || '').trim();
      if (exact ? t !== text : !t.includes(text)) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.top < 0 || r.top > window.innerHeight) continue;
      const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
      const top = document.elementFromPoint(cx, cy);
      if (!top || !(top === el || el.contains(top) || top.contains(el))) continue;
      if (!best || t.length < best.len) best = { x: cx, y: cy, len: t.length };
    }
    return best;
  }, text, exact);
}
async function clickText(text, exact = true) {
  const r = await rectByText(text, exact);
  if (!r) throw new Error(`no text ${text}`);
  await page.mouse.click(r.x, r.y, { delay: 70 });
}
const focusLastInput = () =>
  page.evaluate(() => {
    const a = [...document.querySelectorAll('input')];
    if (a.length) a[a.length - 1].focus();
  });

console.log('Loading…');
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(8000);

// ============ FIX 1: Configure-slot modal safe area ============
await clickTab('Settings');
await sleep(1200);
await clickText('Slot 1', false);
await sleep(1200); // modal opens
await shot('goal-1-slot-modal.png');

// Measure the modal title geometry: must be a single, fully visible element
// at/below the top of the viewport, with the close button on the same row and
// the search input below it (no overlap).
const modal = await page.evaluate(() => {
  const find = (txt) => {
    let best = null;
    for (const el of document.querySelectorAll('div,span,a,button,input,[role]')) {
      const t = (el.innerText || '').trim();
      if (t !== txt) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (!best || t.length < best.len) best = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, h: r.height, len: t.length };
    }
    return best;
  };
  const title = find('Configure slot 1');
  // close button "✕"
  let close = null;
  for (const el of document.querySelectorAll('div,span,a,button,[role]')) {
    if ((el.innerText || '').trim() === '✕') {
      const r = el.getBoundingClientRect();
      if (r.width > 0) { close = { top: r.top, right: r.right, vw: window.innerWidth }; break; }
    }
  }
  const inputs = [...document.querySelectorAll('input')];
  const lastInput = inputs.length ? inputs[inputs.length - 1].getBoundingClientRect() : null;
  return {
    title,
    close,
    searchTop: lastInput ? lastInput.top : null,
    vw: window.innerWidth,
  };
});
console.log('FIX1 title:', JSON.stringify(modal.title));
console.log('FIX1 title top >= 0 (below viewport edge):', modal.title && modal.title.top >= 0);
console.log('FIX1 title single line (height < 40):', modal.title && modal.title.h < 40);
console.log('FIX1 close button visible & top-right:', !!modal.close && modal.close.right <= modal.vw + 1 && modal.close.right > modal.vw / 2);
console.log('FIX1 search input below title (no overlap):', modal.searchTop != null && modal.title && modal.searchTop >= modal.title.bottom - 1);

// Close the slot modal (choosing a drink here only sets the slot, it does not
// log a drink), then populate the Cabinet by logging a drink from Library.
await clickText('✕', true);
await sleep(800);
await clickTab('Library');
await sleep(1200);
await clickText('Bud Light', false); // card
await sleep(900);
await clickText('Log This Drink', false);
await sleep(1000);

// ============ FIX 2: Cabinet sort pills on one line ============
await clickTab('Cabinet');
await sleep(1500);
await shot('goal-2-cabinet-pills.png');

const pills = await page.evaluate(() => {
  const labels = ['Favorites', 'Most consumed', 'Recent', 'A-Z'];
  const out = {};
  for (const label of labels) {
    let best = null;
    for (const el of document.querySelectorAll('div,span')) {
      const t = (el.innerText || '').trim();
      if (t !== label) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      // single-line detection: scrollHeight ~ clientHeight and height < ~24px
      if (!best || t.length < best.len) {
        best = {
          h: Math.round(r.height),
          scrollH: el.scrollHeight,
          clientH: el.clientHeight,
          len: t.length,
        };
      }
    }
    out[label] = best;
  }
  return out;
});
const heights = Object.values(pills).filter(Boolean).map((m) => m.h);
const minH = Math.min(...heights);
let allOneLine = true;
for (const [label, m] of Object.entries(pills)) {
  // Wrapped text overflows its box (scrollH > clientH) OR is taller than the
  // shortest pill by more than ~1px (a 2nd line ≈ +16px).
  const wrapped = !m || m.scrollH > m.clientH + 2 || m.h > minH + 2;
  if (wrapped) allOneLine = false;
  console.log(`FIX2 "${label}":`, JSON.stringify(m), wrapped ? 'WRAPPED ✗' : 'one-line ✓');
}
console.log('FIX2 all pill heights equal (no wrap):', JSON.stringify(heights));
console.log('FIX2 ALL pills on one line:', allOneLine);

// Verify active highlight still works: tap "Most consumed" then check it has the accent bg.
await clickText('Most consumed', true);
await sleep(600);
await shot('goal-3-cabinet-active.png');
const activeBg = await page.evaluate(() => {
  // find the pill text, walk up to the touchable, read its background color
  let node = null;
  for (const el of document.querySelectorAll('div,span')) {
    if ((el.innerText || '').trim() === 'Most consumed') { node = el; break; }
  }
  if (!node) return null;
  // climb to find a colored ancestor
  let cur = node;
  for (let i = 0; i < 5 && cur; i++) {
    const bg = getComputedStyle(cur).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
    cur = cur.parentElement;
  }
  return 'none';
});
console.log('FIX2 active pill background (should be a solid accent color):', activeBg);

await browser.close();
console.log('done');
