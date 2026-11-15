import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
async function open(id) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors=[]; page.on('pageerror', e=>errors.push(e.message)); page.on('console', m=>{if(m.type()==='error') errors.push(m.text())});
  await page.goto(`http://127.0.0.1:5173/?preview=${id}`, {waitUntil:'networkidle'});
  await page.waitForTimeout(500);
  return {page, errors};
}
// wrong answer on plane
{
  const {page, errors}=await open('q10');
  await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  await page.screenshot({path:'/tmp/plane-wrong.png'});
  console.log('plane wrong errors', errors, 'toast', await page.locator('.feedback-toast').count());
  await page.close();
}
// correct answer on plane
{
  const {page, errors}=await open('q10');
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter'); await page.waitForTimeout(450);
  await page.screenshot({path:'/tmp/plane-correct.png'});
  console.log('plane correct errors', errors, 'hit', await page.locator('.enemy-plane.is-hit').count());
  await page.close();
}
// wrong / correct relation
{
  const {page, errors}=await open('q14');
  await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  await page.screenshot({path:'/tmp/relation-wrong.png'});
  console.log('relation wrong errors', errors, 'toast', await page.locator('.feedback-toast').count());
  await page.close();
}
{
  const {page, errors}=await open('q14');
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter'); await page.waitForTimeout(450);
  await page.screenshot({path:'/tmp/relation-correct.png'});
  console.log('relation correct errors', errors);
  await page.close();
}
await browser.close();
