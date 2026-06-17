import puppeteer from 'puppeteer-core';
import os from 'os';
import path from 'path';
import fs from 'fs';

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

// Before any app code runs: seed a profile name + today's calendar entry, and
// stub navigator.share (the OS share sheet boundary) to record what the app
// hands off. Everything up to that call is the app's real code path.
await page.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem(
      '@buzzed_profile',
      JSON.stringify({ name: 'Alex', quickSlots: [null, null, null] })
    );
    localStorage.setItem(
      '@buzzed_calendar',
      JSON.stringify([
        {
          date: '2026-06-17',
          maxLevel: 'relaxed',
          totalStandardDrinks: 0.84,
          drinkCount: 1,
          drinks: [{ name: 'Bud Light', count: 1 }],
        },
      ])
    );
  } catch (e) {}
  window.__shared = [];
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: async (data) => {
      window.__shared.push(data);
    },
  });
});

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
async function clickText(text) {
  const r = await page.evaluate((text) => {
    let best = null;
    for (const el of document.querySelectorAll('div,span,a,button,[role]')) {
      if ((el.innerText || '').trim() !== text) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.top < 0 || r.top > window.innerHeight) continue;
      const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
      const top = document.elementFromPoint(cx, cy);
      if (!top || !(top === el || el.contains(top) || top.contains(el))) continue;
      if (!best || (el.innerText || '').length < best.len) best = { x: cx, y: cy, len: (el.innerText || '').length };
    }
    return best;
  }, text);
  if (!r) throw new Error(`no text ${text}`);
  await page.mouse.click(r.x, r.y, { delay: 80 });
}
// Click the Switch (react-native-web renders it as a checkbox input).
async function toggleSwitch() {
  const r = await page.evaluate(() => {
    const sw =
      document.querySelector('input[type="checkbox"]') ||
      document.querySelector('[role="switch"]');
    if (!sw) return null;
    const b = sw.getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2, checked: sw.checked };
  });
  if (!r) throw new Error('no switch');
  await page.mouse.click(r.x, r.y);
  return r;
}

async function doShare() {
  await page.evaluate(() => (window.__shared = []));
  await clickText('Share');
  await sleep(4000); // html2canvas capture
  return page.evaluate(() => window.__shared.map((s) => (s.url || '').slice(0, 30) + `…(${(s.url || '').length} chars)`));
}
async function lastSharedDataUri() {
  return page.evaluate(() => (window.__shared[0] && window.__shared[0].url) || null);
}

console.log('Loading…');
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(8000);

await clickTab('Calendar');
await sleep(1500);

// Toggle name ON
const sw = await toggleSwitch();
await sleep(600);
console.log('Switch was checked before toggle:', sw.checked);
let t = await readText();
console.log('Shareable shows "Shared by Alex"?', t.includes('Shared by Alex'));
await shot('share-1-name-on.png');

// Share WITH name
let meta = await doShare();
console.log('SHARE (name on) -> navigator.share called with:', JSON.stringify(meta));
const uriWithName = await lastSharedDataUri();
if (uriWithName && uriWithName.startsWith('data:image/png')) {
  fs.writeFileSync(
    path.join(OUT, 'share-image-name.png'),
    Buffer.from(uriWithName.split(',')[1], 'base64')
  );
  console.log('Saved share-image-name.png');
}

// Toggle name OFF and share again
await toggleSwitch();
await sleep(600);
t = await readText();
console.log('After toggling off, shows name?', t.includes('Shared by Alex'));
meta = await doShare();
console.log('SHARE (name off) -> navigator.share called with:', JSON.stringify(meta));
const uriNoName = await lastSharedDataUri();
if (uriNoName && uriNoName.startsWith('data:image/png')) {
  fs.writeFileSync(
    path.join(OUT, 'share-image-noname.png'),
    Buffer.from(uriNoName.split(',')[1], 'base64')
  );
  console.log('Saved share-image-noname.png');
}

await browser.close();
console.log('done');
