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

// Return the center rect of the first element matching a text test, optionally
// requiring an extra substring (to disambiguate cards vs labels).
async function rectByText(text, mustAlsoContain) {
  return page.evaluate(
    (text, also) => {
      const els = [...document.querySelectorAll('div,span,a,input,button,[role]')];
      // smallest element whose text contains `text` (+ optional `also`)
      let best = null;
      for (const el of els) {
        const t = (el.innerText || '').trim();
        if (!t.includes(text)) continue;
        if (also && !t.includes(also)) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (!best || t.length < best.len) {
          best = { x: r.x + r.width / 2, y: r.y + r.height / 2, len: t.length };
        }
      }
      return best;
    },
    text,
    mustAlsoContain
  );
}

async function clickText(text, mustAlsoContain) {
  const r = await rectByText(text, mustAlsoContain);
  if (!r) throw new Error(`no element with text "${text}"`);
  await page.mouse.click(r.x, r.y);
}

async function tabRect(label) {
  return page.evaluate((label) => {
    const tab = [...document.querySelectorAll('[role="tab"]')].find((e) =>
      (e.innerText || '').includes(label)
    );
    if (!tab) return null;
    const r = tab.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, label);
}

async function clickTab(label) {
  const r = await tabRect(label);
  if (!r) throw new Error(`no tab "${label}"`);
  await page.mouse.click(r.x, r.y);
}

const readText = () => page.evaluate(() => document.body.innerText);
const showing = (t) => {
  const m = t.match(/Showing\s+(\d+)\s+of\s+(\d+)\s+drinks/);
  return m ? { x: +m[1], y: +m[2] } : null;
};

console.log('Loading…');
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(8000);

// 1) Go to Library
await clickTab('Library');
await sleep(1500);
await shot('lib-1-all.png');
let t = await readText();
console.log('STEP1 library count:', JSON.stringify(showing(t)));
console.log('STEP1 has empty-state text?', t.includes('No drinks match your search'));

// 2) Search "IPA"
const input = await page.$('input');
await input.click();
await page.keyboard.type('IPA');
await sleep(700); // > 300ms debounce
await shot('lib-2-search-ipa.png');
t = await readText();
console.log('STEP2 search "IPA" count:', JSON.stringify(showing(t)));
console.log('STEP2 sample rows include IPA?', /IPA/.test(t));

// 3) Clear search, filter by Beer pill
await input.click();
await page.keyboard.down('Control');
await page.keyboard.press('KeyA');
await page.keyboard.up('Control');
await page.keyboard.press('Backspace');
await sleep(600);
await clickText('Beer', undefined);
await sleep(700);
await shot('lib-3-beer.png');
t = await readText();
console.log('STEP3 Beer pill count:', JSON.stringify(showing(t)));

// 4) Tap a drink card -> detail modal
await clickText('Bud Light', 'oz'); // the card (name + " oz")
await sleep(1000);
await shot('lib-4-detail.png');
t = await readText();
console.log('STEP4 detail has "standard drinks"?', /standard drinks/.test(t));
console.log('STEP4 detail has "Log This Drink"?', t.includes('Log This Drink'));
const calcMatch = t.match(/=\s*([\d.]+)\s*standard drinks/);
console.log('STEP4 calc shown:', calcMatch ? calcMatch[1] : '(none)');

// 5) Log it
await clickText('Log This Drink', undefined);
await sleep(1200);
await shot('lib-5-after-log.png');

// 6) Home reflects the logged drink (active std drinks > 0)
await clickTab('Home');
await sleep(1500);
await shot('lib-6-home-after.png');
t = await readText();
const active = t.match(/(\d\.\d{3})\s*\n?active standard drinks/) || t.match(/([\d.]+)\s*active/);
console.log('STEP6 home active std drinks region:', t.split('\n').slice(0, 6).join(' | '));

await browser.close();
console.log('done');
