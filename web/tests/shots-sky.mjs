import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
for (const id of ['q10','q11','q12','q13','q14','q15','map']) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors=[]; page.on('pageerror', e=>errors.push(e.message)); page.on('console', m=>{if(m.type()==='error') errors.push(m.text())});
  await page.goto(`http://127.0.0.1:5173/?preview=${id}`, {waitUntil:'networkidle'});
  await page.waitForTimeout(700);
  await page.screenshot({path:`/tmp/sky-${id}.png`});
  console.log(id, errors);
  await page.close();
}
await browser.close();
