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
async function rectByText(text, also) {
  return page.evaluate((text, also) => {
    let best = null;
    for (const el of document.querySelectorAll('div,span,a,input,button,[role]')) {
      const t = (el.innerText || '').trim();
      if (t !== text && !(also && t.includes(text) && t.includes(also))) {
        if (t !== text) continue;
      }
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.top < 0 || r.top > window.innerHeight) continue;
      const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
      const top = document.elementFromPoint(cx, cy);
      if (!top || !(top === el || el.contains(top) || top.contains(el))) continue;
      if (!best || t.length < best.len) best = { x: cx, y: cy, len: t.length };
    }
    return best;
  }, text, also);
}
async function clickText(text, also) {
  const r = await rectByText(text, also);
  if (!r) throw new Error(`no text ${text}`);
  await page.mouse.click(r.x, r.y, { delay: 80 });
}

// Background color of the visible day cell showing `dayNum`.
async function cellColor(dayNum) {
  return page.evaluate((dayNum) => {
    const els = [...document.querySelectorAll('div,span')].filter((e) => (e.innerText || '').trim() === String(dayNum));
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.top < 0 || r.top > window.innerHeight) continue;
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      if (!top || !(top === el || el.contains(top) || top.contains(el))) continue;
      let node = el;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
        node = node.parentElement;
      }
    }
    return null;
  }, dayNum);
}

console.log('Loading…');
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(8000);

// 1) Calendar tab
await clickTab('Calendar');
await sleep(1200);
await shot('cal-1-month.png');
let t = await readText();
console.log('STEP1 month label June 2026?', /June\s+2026/.test(t));
console.log('STEP1 weekday labels?', ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].every((d) => t.includes(d)));
console.log('STEP1 legend has levels?', ['Sober', 'Relaxed', 'Tipsy', 'Buzzed', 'Impaired', 'Very Impaired', 'Severely Impaired', 'Danger'].every((l) => t.includes(l)));
console.log('STEP1 today(17) cell color BEFORE log:', await cellColor(17));

// 2) Log Bud Light
await clickTab('Library');
await sleep(1000);
await clickText('Bud Light', 'oz');
await sleep(700);
await clickText('Log This Drink');
await sleep(1000);

// 3) Back to Calendar — today's cell should be colored (Relaxed green)
await clickTab('Calendar');
await sleep(1200);
await shot('cal-2-today-colored.png');
console.log('STEP3 today(17) cell color AFTER log:', await cellColor(17));

// 4) Month navigation
await clickText('‹');
await sleep(800);
t = await readText();
console.log('STEP4 prev -> May 2026?', /May\s+2026/.test(t));
await clickText('›');
await clickText('›');
await sleep(800);
t = await readText();
console.log('STEP4 next x2 -> July 2026?', /July\s+2026/.test(t));
await shot('cal-3-nav-july.png');

await browser.close();
console.log('done');
