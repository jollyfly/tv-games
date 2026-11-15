import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
for (const id of ['q16','q17','q18','q19','q20','q21','q22','q23','q24','q25','ocean']) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors=[]; page.on('pageerror', e=>errors.push(e.message)); page.on('console', m=>{if(m.type()==='error') errors.push(m.text())});
  await page.goto(`http://127.0.0.1:5173/?preview=${id}`, {waitUntil:'networkidle'});
  await page.waitForTimeout(500);
  await page.screenshot({path:`/tmp/ocean-${id}.png`});
  console.log(id, errors.slice(0,3));
  await page.close();
}
await browser.close();
