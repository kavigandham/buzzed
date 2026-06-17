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
// Focus the topmost (last in DOM) text input — the modal search when open,
// otherwise the name field.
const focusLastInput = () =>
  page.evaluate(() => {
    const a = [...document.querySelectorAll('input')];
    if (a.length) a[a.length - 1].focus();
  });
const profileStore = () =>
  page.evaluate(() => {
    const raw = localStorage.getItem('@buzzed_profile');
    return raw ? JSON.parse(raw) : null;
  });

console.log('Loading…');
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(8000);

// 1) Settings renders
await clickTab('Settings');
await sleep(1200);
await shot('set-1-render.png');
let t = (await readText()).toLowerCase();
console.log('STEP1 has name section + slots + version + clear-all?',
  t.includes('your name') && t.includes('slot 1') && t.includes('buzzed. v1.0.0') && t.includes('clear all data'));
console.log('STEP1 slot1 "Not configured"?', t.includes('not configured'));

// 2) Type a name
await focusLastInput();
await page.keyboard.type('Alex');
await sleep(600);
console.log('STEP2 profile in storage:', JSON.stringify(await profileStore()));

// 3) MainScreen reflects the name
await clickTab('Home');
await sleep(1000);
t = await readText();
console.log('STEP3 Home greets "Hey, Alex"?', t.includes('Hey, Alex'));
await shot('set-2-home-greeting.png');

// 4) Configure slot 1 -> Busch Light
await clickTab('Settings');
await sleep(1000);
await clickText('Slot 1', false);
await sleep(1000); // picker modal opens
await focusLastInput(); // the modal's search input
await page.keyboard.type('Busch Light');
await sleep(800);
await clickText('Busch Light', false); // pick from list
await sleep(900);
console.log('STEP4 profile after slot set:', JSON.stringify(await profileStore()));

// 5) MainScreen slot shows Busch Light, tap logs it
await clickTab('Home');
await sleep(1000);
await shot('set-3-home-slot.png');
t = await readText();
console.log('STEP5 Home quick slot shows "Busch Light"?', t.includes('Busch Light'));
await clickText('Busch Light', false); // tap quick slot -> logs
await sleep(1200);
t = await readText();
const active = (t.match(/(\d\.\d{3})/) || ['?'])[0];
console.log('STEP5 active std drinks after tapping slot:', active, '(Busch Light ~0.86)');
await shot('set-4-home-logged.png');

// 6) Persistence: reload, settings persist
await page.reload({ waitUntil: 'networkidle2', timeout: 120000 });
await sleep(8000);
await clickTab('Settings');
await sleep(1200);
t = await readText();
console.log('STEP6 after reload name=Alex?', (await profileStore())?.name === 'Alex');
console.log('STEP6 after reload slot1 shows Busch Light?', t.includes('Busch Light'));
await shot('set-5-after-reload.png');

await browser.close();
console.log('done');
