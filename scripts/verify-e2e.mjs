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

const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push('console.error: ' + m.text().slice(0, 160));
});

const shot = (name) => page.screenshot({ path: path.join(OUT, name) });
const readText = () => page.evaluate(() => document.body.innerText);
const active = async () => {
  const t = await readText();
  const m = t.match(/(\d+\.\d{3})/);
  return m ? parseFloat(m[1]) : null;
};
// Read the actual visible level chip (exact text + on-screen), not body text —
// avoids the "Buzzed." title and the still-mounted Calendar legend.
const levelChip = async () => {
  return page.evaluate(() => {
    const names = ['Sober', 'Relaxed', 'Tipsy', 'Buzzed', 'Impaired', 'Very Impaired', 'Severely Impaired', 'Danger'];
    for (const el of document.querySelectorAll('div,span')) {
      const t = (el.innerText || '').trim();
      if (!names.includes(t)) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.top < 0 || r.top > window.innerHeight) continue;
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      if (!top || !(top === el || el.contains(top) || top.contains(el))) continue;
      return t;
    }
    return null;
  });
};

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
async function clickText(text, exact = false) {
  const r = await page.evaluate((text, exact) => {
    let best = null;
    for (const el of document.querySelectorAll('div,span,a,button,[role]')) {
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
  if (!r) throw new Error(`no text ${text}`);
  await page.mouse.click(r.x, r.y, { delay: 70 });
}
// Log Busch Light once via the Library detail modal.
async function logBuschLight() {
  await clickTab('Library');
  await sleep(700);
  await clickText('Busch Light', false);
  await sleep(500);
  await clickText('Log This Drink', true);
  await sleep(700);
}

console.log('Loading… (also validates the new splash plugin boots Metro)');
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(8000);

// A) Sober at open
await clickTab('Home');
await sleep(800);
console.log('A) open ->', await levelChip(), await active());

// B) Log Busch Light -> Relaxed ~0.86
await logBuschLight();
await clickTab('Home');
await sleep(1000);
const lvl1 = await levelChip();
const a0 = await active();
console.log('B) after 1 Busch Light ->', lvl1, a0);
await shot('e2e-1-relaxed.png');

// C) Ticker ticks DOWN every second (Date.now-based, not frozen)
await sleep(5000);
const a1 = await active();
console.log('C) active after 5s:', a0, '->', a1, '(decreased?', a1 !== null && a0 !== null && a1 < a0, ')');

// D) Cabinet shows Busch Light x1
await clickTab('Cabinet');
await sleep(1000);
let t = await readText();
console.log('D) cabinet has Busch Light x1?', t.includes('Busch Light') && /×1\b/.test(t));

// E) Calendar today colored
await clickTab('Calendar');
await sleep(1000);
await shot('e2e-2-calendar.png');
console.log('E) calendar today(17) color:', await page.evaluate(() => {
  const els = [...document.querySelectorAll('div,span')].filter((e) => (e.innerText || '').trim() === '17');
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.top < 0 || r.top > window.innerHeight) continue;
    const inner = el.parentElement; // cellInner carries the bg
    const bg = inner ? getComputedStyle(inner).backgroundColor : null;
    if (bg && bg !== 'rgba(0, 0, 0, 0)') return bg;
  }
  return null;
}));

// F) Reach Impaired: log 4 more (total 5 ~4.3 std drinks)
for (let i = 0; i < 4; i++) await logBuschLight();
await clickTab('Home');
await sleep(1200);
const lvlN = await levelChip();
const aN = await active();
console.log('F) after 5 Busch Lights ->', lvlN, aN, '(Impaired expected >3.5)');
await shot('e2e-3-impaired.png');

// G) console errors
console.log('G) console errors during run:', consoleErrors.length);
consoleErrors.slice(0, 8).forEach((e) => console.log('   -', e));

await browser.close();
console.log('done');
