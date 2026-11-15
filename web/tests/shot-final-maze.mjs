import { chromium } from 'playwright-core';
import fs from 'node:fs';
const content = JSON.parse(fs.readFileSync(new URL('../src/content.json', import.meta.url), 'utf8'));
const level = content.levels.find((l) => l.id === 'ocean-10');
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('http://127.0.0.1:5173/?preview=q25', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const press = async (key, wait = 180) => { await page.keyboard.press(key); await page.waitForTimeout(wait); };
for (let ri = 0; ri < 2; ri++) {
  const round = level.rounds[ri]; const cols = round.cols;
  const cellOf = (n) => round.grid.indexOf(n);
  for (let p = 1; p < round.path.length; p++) {
    const a = cellOf(round.path[p - 1]); const b = cellOf(round.path[p]);
    const dr = Math.floor(b / cols) - Math.floor(a / cols); const dc = (b % cols) - (a % cols);
    await press(dr === 0 ? (dc === 1 ? 'ArrowRight' : 'ArrowLeft') : (dr === 1 ? 'ArrowDown' : 'ArrowUp'), 260);
  }
  await page.waitForTimeout(2300);
}
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/ocean-q25-final.png' });
console.log('final maze captured', await page.locator('.maze-tile').count());
await browser.close();
