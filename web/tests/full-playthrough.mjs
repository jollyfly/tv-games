import { chromium } from 'playwright-core';
import fs from 'node:fs';
const content = JSON.parse(fs.readFileSync(new URL('../src/content.json', import.meta.url), 'utf8'));
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('pageerror', e => errors.push(`PAGE: ${e.message}`));
page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(`CONSOLE: ${m.text()}`); });
const press = async (key, wait = 180) => { await page.keyboard.press(key); await page.waitForTimeout(wait); };
const wait = (ms) => page.waitForTimeout(ms);

await page.goto(process.env.BASE_URL ?? 'http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await wait(500);
// tutorial
await press('Enter', 300);
await page.waitForSelector('.tutorial-card');
await press('ArrowRight', 200);
await press('Enter', 200);
await press('ArrowUp', 200);
await press('Enter', 300);
await page.waitForSelector('.intro-panel');

for (let li = 0; li < content.levels.length; li++) {
  const level = content.levels[li];
  await page.waitForSelector('.intro-panel');
  await press('Enter', 800);
  await page.waitForSelector('.question-screen');
  for (let ri = 0; ri < 3; ri++) {
    if (level.kind === 'maze') {
      const round = level.rounds[ri];
      const cols = round.cols;
      const cellOf = (n) => round.grid.indexOf(n);
      for (let p = 1; p < round.path.length; p++) {
        const a = cellOf(round.path[p - 1]);
        const b = cellOf(round.path[p]);
        const dr = Math.floor(b / cols) - Math.floor(a / cols);
        const dc = (b % cols) - (a % cols);
        if (dr === 0 && dc === 1) await press('ArrowRight', 260);
        else if (dr === 0 && dc === -1) await press('ArrowLeft', 260);
        else if (dr === 1 && dc === 0) await press('ArrowDown', 260);
        else if (dr === -1 && dc === 0) await press('ArrowUp', 260);
        else throw new Error(`non-adjacent maze path ${level.id} r${ri}: ${a}->${b}`);
      }
      await wait(2300);
    } else {
      const round = level.rounds[ri];
      if (level.kind === 'coord') {
        for (let c = 1; c < round.targetCol; c++) await press('ArrowRight', 90);
        for (let r = 1; r < round.targetRow; r++) await press('ArrowDown', 90);
        await press('Enter', 450);
        await press('Enter', 550);
        if (ri < 2) await page.waitForSelector('.question-screen');
        continue;
      }
      let want;
      if (level.kind === 'count' || level.kind === 'quantity' || level.kind === 'plane') want = round.target;
      else if (level.kind === 'sequence' || level.kind === 'pattern' || level.kind === 'ordinal') want = round.answer;
      else if (level.kind === 'relation' || level.kind === 'share') want = round.answer;
      else if (level.kind === 'odd') {
        const values = await page.evaluate(() => [...document.querySelectorAll('.answer-option')].map((el) => el.dataset.choiceValue));
        const counts = new Map(); for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
        want = values.find((v) => counts.get(v) === 1);
      }
      else if (level.kind === 'compare') {
        const panels = await page.evaluate(() => [...document.querySelectorAll('.compare-panel')].map((el) => ({ side: el.dataset.choiceValue, count: el.querySelectorAll('.mini-object').length })));
        const sorted = [...panels].sort((a, b) => a.count - b.count);
        want = round.ask === 'more' ? sorted[sorted.length - 1].side : sorted[0].side;
      }
      const correct = await page.evaluate((value) => [...document.querySelectorAll('.answer-option')].findIndex((el) => el.dataset.choiceValue === String(value)), want);
      if (correct < 0) throw new Error(`could not find choice ${want} at ${level.id} round ${ri + 1}`);
      for (let i = 0; i < correct; i++) await press('ArrowRight', 90);
      await press('Enter', 450);
      await press('Enter', 550);
      if (ri < 2) await page.waitForSelector('.question-screen');
    }
  }
  await page.waitForSelector('.complete-panel', { timeout: 5000 });
  console.log(`level ${li + 1}/${content.levels.length} complete: ${level.title}`);
  await press('Enter', 600);
}
await page.waitForTimeout(800);
const screen = await page.evaluate(() => ({
  map: Boolean(document.querySelector('.map-header')),
  stars: document.querySelector('.map-starcount')?.textContent?.trim(),
  complete: Boolean(document.querySelector('.complete-panel')),
}));
console.log('final screen', screen);
await page.screenshot({ path: '/tmp/full-playthrough-final.png' });
console.log('errors', errors);
if (!screen.map || !screen.stars?.includes(String(content.levels.length))) {
  console.error(`Full playthrough did not finish on a ${content.levels.length}-star map`);
  process.exitCode = 1;
}
await browser.close();
