import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
async function get(id){const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto(base+id,{waitUntil:'networkidle'});await p.waitForTimeout(300);return p;}
// box
{
 const p=await get('donut-x1'); const target=Number(await p.locator('.box-board').getAttribute('data-target')); for(let n=0;n<target;n++){await p.keyboard.press('Enter');await p.keyboard.press(n===2?'ArrowDown':'ArrowRight');await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('box',target,await p.locator('.complete-screen').count());await p.close();
}
// catch
{
 const p=await get('donut-x2'); for(let i=0;i<100 && !(await p.locator('.complete-screen').count());i++){await p.keyboard.press(i%10<5?'ArrowRight':'ArrowLeft');await p.waitForTimeout(120);} console.log('catch',await p.locator('.complete-screen').count());await p.close();
}
// icing
{
 const p=await get('donut-x3'); const pattern=(await p.locator('.icing-board').getAttribute('data-pattern')).split(','); const order=['pink','yellow','mint']; for(const color of pattern){const target=order.indexOf(color); for(let i=0;i<4;i++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.icing-choice')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===target)break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('icing',await p.locator('.complete-screen').count());await p.close();
}
// split
{
 const p=await get('donut-x4'); const target=Number(await p.locator('.split-board').getAttribute('data-target')); for(let i=0;i<target;i++){await p.keyboard.press('ArrowLeft');await p.waitForTimeout(30);} for(let i=0;i<target;i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(30);} await p.waitForTimeout(600);console.log('split',target,await p.locator('.complete-screen').count());await p.close();
}
// oven
{
 const p=await get('donut-x5'); for(let i=0;i<300 && !(await p.locator('.complete-screen').count());i++){if(await p.locator('.oven-board').getAttribute('data-in-zone')==='1')await p.keyboard.press('Enter');await p.waitForTimeout(60);} console.log('oven',await p.locator('.complete-screen').count());await p.close();
}
// stack
{
 const p=await get('donut-x6'); for(let i=0;i<300 && !(await p.locator('.complete-screen').count());i++){if(await p.locator('.stack-board').getAttribute('data-in-zone')==='1')await p.keyboard.press('Enter');await p.waitForTimeout(60);} console.log('stack',await p.locator('.complete-screen').count());await p.close();
}
// sort
{
 const p=await get('donut-x7'); for(let n=0;n<4;n++){const val=Number(await p.locator('.topping-donut.is-focused').getAttribute('data-value')); await p.keyboard.press('Enter');await p.waitForTimeout(60); if(val!==3)await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter');await p.waitForTimeout(80);} await p.waitForTimeout(500);console.log('donutsort',await p.locator('.complete-screen').count());await p.close();
}
// maze
{
 const p=await get('donut-x8'); for(let s=0;s<8;s++){const d=await p.evaluate(()=>{const board=document.querySelector('.donut-maze-board');if(!board)return null;const hero=Number(board.getAttribute('data-hero'));const vals=[...document.querySelectorAll('.donut-maze-tile')].map(e=>Number(e.dataset.value));const idx=vals.indexOf(Number(board.getAttribute('data-step'))+1);if(idx<0)return null;const r=Math.floor(hero/5),c=hero%5,nr=Math.floor(idx/5),nc=idx%5;return{key:nr<r?'ArrowUp':nr>r?'ArrowDown':nc<c?'ArrowLeft':'ArrowRight'}});if(!d)break;await p.keyboard.press(d.key);await p.waitForTimeout(80);if(await p.locator('.complete-screen').count())break;}console.log('donutmaze',await p.locator('.complete-screen').count());await p.close();
}
// order
{
 const p=await get('donut-x9'); const target=Number(await p.locator('.order-board').getAttribute('data-target')); const boxes=await p.evaluate(()=>[...document.querySelectorAll('.order-box')].map(e=>Number(e.dataset.number))); const idx=boxes.indexOf(target); for(let i=0;i<idx;i++)await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(500);console.log('order',target,idx,await p.locator('.complete-screen').count());await p.close();
}
// night
{
 const p=await get('donut-x10'); const pattern=(await p.locator('.night-board').getAttribute('data-pattern')).split(','); const map={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'}; for(const step of pattern){await p.keyboard.press(map[step]);await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('night',await p.locator('.complete-screen').count());await p.close();
}
await b.close();
