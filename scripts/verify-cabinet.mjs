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
    const tab = [...document.querySelectorAll('[role="tab"]')].find((e) =>
      (e.innerText || '').includes(label)
    );
    if (!tab) return null;
    const b = tab.getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }, label);
  if (!r) throw new Error(`no tab ${label}`);
  await page.mouse.click(r.x, r.y);
}

async function rectByText(text, also) {
  return page.evaluate(
    (text, also) => {
      let best = null;
      for (const el of document.querySelectorAll('div,span,a,input,button,[role]')) {
        const t = (el.innerText || '').trim();
        if (!t.includes(text)) continue;
        if (also && !t.includes(also)) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.top < 0 || r.top > window.innerHeight) continue;
        // Only accept if this element is actually the topmost (visible) one at
        // its center — skips duplicates on inactive, still-mounted screens.
        const cx = r.x + r.width / 2;
        const cy = r.y + r.height / 2;
        const top = document.elementFromPoint(cx, cy);
        if (!top || !(top === el || el.contains(top) || top.contains(el))) continue;
        if (!best || t.length < best.len)
          best = { x: cx, y: cy, len: t.length, rx: r.x, ry: r.y, rw: r.width, rh: r.height };
      }
      return best;
    },
    text,
    also
  );
}
async function clickText(text, also) {
  const r = await rectByText(text, also);
  if (!r) throw new Error(`no text ${text}`);
  await page.mouse.click(r.x, r.y, { delay: 90 });
  return r;
}

const modalOpen = () => page.evaluate(() => document.body.innerText.includes('Log This Drink'));

console.log('Loading…');
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(8000);

// 1) Cabinet empty state
await clickTab('Cabinet');
await sleep(1200);
await shot('cab-1-empty.png');
let t = await readText();
console.log('STEP1 empty-state shown?', t.includes('No drinks logged yet. Start by logging your first drink!'));

// 2) Log Bud Light from Library
await clickTab('Library');
await sleep(1200);
await clickText('Bud Light', 'oz'); // card
await sleep(800);
await clickText('Log This Drink');
await sleep(1000);

// 3) Cabinet shows ×1
await clickTab('Cabinet');
await sleep(1200);
await shot('cab-2-after-log.png');
t = await readText();
console.log('STEP3 has Bud Light?', t.includes('Bud Light'));
console.log('STEP3 count line:', (t.match(/\d+ drinks? in your cabinet/) || ['(none)'])[0]);
console.log('STEP3 shows ×1?', /×1\b/.test(t));

const favFromStorage = () =>
  page.evaluate(() => {
    const raw = localStorage.getItem('@buzzed_cabinet');
    if (!raw) return null;
    const arr = JSON.parse(raw);
    const e = arr.find((x) => x.drinkId === 'bud-light');
    return e ? { count: e.totalCount, favorite: e.favorite } : null;
  });

// 4) Quick-log again (center-click the card) -> ×2
await clickText('Bud Light');
await sleep(400);
console.log('STEP4 detail modal opened by the tap?', await modalOpen());
await sleep(900);
await shot('cab-3-after-2nd.png');
t = await readText();
console.log('STEP4 shows ×2?', /×2\b/.test(t));
console.log('STEP4 count still 1 unique?', (t.match(/\d+ drinks? in your cabinet/) || ['(none)'])[0]);
console.log('STEP4 storage:', JSON.stringify(await favFromStorage()));

// 5) Tap favorite star (right edge of the card row)
const card2 = await rectByText('Bud Light');
console.log('STEP5 card row rect:', JSON.stringify({ rx: card2.rx, ry: card2.ry, rw: card2.rw, y: card2.y }));
console.log('STEP5 favorite before toggle:', JSON.stringify(await favFromStorage()));
await page.mouse.click(384, card2.y, { delay: 90 }); // star sits near the right edge
await sleep(900);
await shot('cab-4-favorited.png');
const favAfter = await favFromStorage();
console.log('STEP5 favorite after toggle:', JSON.stringify(favAfter));

// 6) Reload (simulates kill/restart) -> favorite persists via storage
await page.reload({ waitUntil: 'networkidle2', timeout: 120000 });
await sleep(8000);
await clickTab('Cabinet');
await sleep(1500);
await shot('cab-5-after-reload.png');
t = await readText();
const favReload = await favFromStorage();
console.log('STEP6 after reload has Bud Light?', t.includes('Bud Light'));
console.log('STEP6 after reload shows ×2?', /×2\b/.test(t));
console.log('STEP6 favorite persisted?', favReload && favReload.favorite === true);
console.log('STEP6 storage after reload:', JSON.stringify(favReload));

await browser.close();
console.log('done');
