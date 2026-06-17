// Verifies the time-dependent behaviors as live runtime observations using a
// simulated clock (the goal allows "or simulated"). The ticker, decay, and
// hysteresis are platform-agnostic JS — identical code under Expo Go and web.
import puppeteer from 'puppeteer-core';
import os from 'os';
import path from 'path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.env.SHOT_DIR || os.tmpdir();
const URL = 'http://localhost:8081';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MIN = 60_000;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--window-size=420,900'],
  defaultViewport: { width: 420, height: 900 },
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));

// Install a controllable virtual clock BEFORE any app code runs. Date.now() —
// which the ticker, decay math, and hysteresis all read — is advanced by
// window.__offset. setInterval still fires on real time, so each real tick
// recomputes against the advanced virtual time.
await page.evaluateOnNewDocument(() => {
  const RealNow = Date.now.bind(Date);
  window.__base = RealNow();
  window.__offset = 0;
  Date.now = () => RealNow() + window.__offset;
});
const setVirtual = (ms) => page.evaluate((ms) => { window.__offset = ms; }, ms);

const shot = (name) => page.screenshot({ path: path.join(OUT, name) });
async function clickTab(label) {
  const r = await page.evaluate((label) => {
    const tab = [...document.querySelectorAll('[role="tab"]')].find((e) => (e.innerText || '').includes(label));
    if (!tab) return null;
    const b = tab.getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }, label);
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
  await page.mouse.click(r.x, r.y, { delay: 60 });
}
const chip = () =>
  page.evaluate(() => {
    const names = ['Sober', 'Relaxed', 'Tipsy', 'Buzzed', 'Impaired', 'Very Impaired', 'Severely Impaired', 'Danger'];
    for (const el of document.querySelectorAll('div,span')) {
      const t = (el.innerText || '').trim();
      if (!names.includes(t)) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.top < 0 || r.top > window.innerHeight) continue;
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      if (top && (top === el || el.contains(top) || top.contains(el))) return t;
    }
    return null;
  });
const active = () =>
  page.evaluate(() => {
    const m = document.body.innerText.match(/(\d+\.\d{3})\s*\n?active standard drinks/);
    return m ? parseFloat(m[1]) : null;
  });
async function logBusch() {
  await clickTab('Library');
  await sleep(500);
  await clickText('Busch Light', false);
  await sleep(400);
  await clickText('Log This Drink', true);
  await sleep(500);
}

console.log('Loading…');
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(8000);
await clickTab('Home');
await sleep(800);

// ---- 1) DECAY TO SOBER (simulated ~55 min) ----
await logBusch();
await clickTab('Home');
await sleep(1200);
console.log('DECAY t=0   ->', await chip(), await active());
await setVirtual(25 * MIN);
await sleep(1400);
console.log('DECAY t=25m ->', await chip(), await active());
await setVirtual(55 * MIN); // 0.86 std drinks fully decays at ~51.6 min
await sleep(1400);
console.log('DECAY t=55m ->', await chip(), await active(), '(active 0.000; chip still falling via 3-min hysteresis)');
// Advance past the hysteresis fall-hold so the chip itself reaches Sober.
await setVirtual(60 * MIN);
await sleep(1400);
console.log('DECAY t=60m ->', await chip(), await active(), '(expect Sober / 0.000)');
await shot('time-1-sober.png');

// ---- 2) HYSTERESIS 3-MIN HOLD ----
// Log 3 fresh Busch Lights at the current virtual time -> ~2.58 (Buzzed).
const base = 60 * MIN;
await logBusch();
await logBusch();
await logBusch();
await clickTab('Home');
await sleep(1200);
console.log('HYST start ->', await chip(), await active(), '(Buzzed, >2.0)');

// Step virtual time forward 1 minute at a time and watch the level. As active
// crosses below 2.0 (raw -> Tipsy), the displayed level should HOLD at Buzzed
// for ~3 minutes before dropping.
let droppedAt = null;
let firstBelow2 = null;
for (let m = 8; m <= 22; m++) {
  await setVirtual(base + m * MIN);
  await sleep(1300);
  const lv = await chip();
  const a = await active();
  if (a !== null && a < 2.0 && firstBelow2 === null) firstBelow2 = m;
  if (lv === 'Tipsy' && droppedAt === null && firstBelow2 !== null) droppedAt = m;
  console.log(`HYST t=55+${String(m).padStart(2)}m  active=${a}  level=${lv}` +
    (a !== null && a < 2.0 && lv === 'Buzzed' ? '   <-- raw Tipsy, HOLDING' : '') +
    (lv === 'Tipsy' ? '   <-- dropped' : ''));
  if (droppedAt !== null) break;
}
console.log(`HYST: active first <2.0 at +${firstBelow2}m, level dropped to Tipsy at +${droppedAt}m ` +
  `=> held ~${droppedAt !== null && firstBelow2 !== null ? droppedAt - firstBelow2 : '?'} min`);
await shot('time-2-hysteresis.png');

// ---- 3) APPSTATE FOREGROUND RECALC ----
// react-native-web maps AppState to document visibility. Background (hidden),
// advance virtual time, then foreground (visible) -> context's AppState
// handler runs tick() immediately -> UI reflects elapsed time (not frozen).
const beforeBg = await active();
await page.evaluate(() => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
  document.dispatchEvent(new Event('visibilitychange'));
});
await setVirtual(base + 30 * MIN); // big jump while "backgrounded"
await sleep(300);
await page.evaluate(() => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
  document.dispatchEvent(new Event('visibilitychange'));
});
await sleep(900);
const afterFg = await active();
console.log(`APPSTATE: active before bg=${beforeBg}, after 30m bg+fg=${afterFg} (jumped forward, not frozen?`,
  afterFg !== null && beforeBg !== null && afterFg < beforeBg, ')');

await browser.close();
console.log('done');
