import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
async function get(id){const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto(base+id,{waitUntil:'networkidle'});await p.waitForTimeout(300);return p;}
// brush all cells
{
 const p=await get('dino-x1'); for(let i=0;i<9;i++){await p.keyboard.press('Enter'); await p.keyboard.press(i===2||i===5?'ArrowDown':'ArrowRight'); await p.waitForTimeout(60); if(await p.locator('.complete-screen').count())break;} await p.waitForTimeout(500);console.log('brush',await p.locator('.complete-screen').count());await p.close();
}
// egg
{
 const p=await get('dino-x2'); const target=Number(await p.locator('.egg-board').getAttribute('data-target')); const nums=await p.evaluate(()=>[...document.querySelectorAll('.dino-egg')].map(e=>Number(e.dataset.number))); const idx=nums.indexOf(target); for(let i=0;i<idx;i++)await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(500);console.log('egg',target,idx,await p.locator('.complete-screen').count());await p.close();
}
// bone
{
 const p=await get('dino-x3'); const nums=(await p.locator('.bone-board').getAttribute('data-numbers')).split(',').map(Number); for(let n=1;n<=5;n++){const idx=nums.indexOf(n); for(let i=0;i<8;i++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.bone-piece')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===idx)break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('bone',await p.locator('.complete-screen').count());await p.close();
}
// volcano
{
 const p=await get('dino-x4'); for(let s=0;s<8;s++){const d=await p.evaluate(()=>{const board=document.querySelector('.volcano-board');if(!board)return null;const hero=Number(board.getAttribute('data-hero'));const vals=[...document.querySelectorAll('.volcano-tile')].map(e=>Number(e.dataset.value));const idx=vals.indexOf(Number(board.getAttribute('data-step'))+1);if(idx<0)return null;const r=Math.floor(hero/4),c=hero%4,nr=Math.floor(idx/4),nc=idx%4;return{key:nr<r?'ArrowUp':nr>r?'ArrowDown':nc<c?'ArrowLeft':'ArrowRight'}});if(!d)break;await p.keyboard.press(d.key);await p.waitForTimeout(80);if(await p.locator('.complete-screen').count())break;}console.log('volcano',await p.locator('.complete-screen').count());await p.close();
}
// footprint
{
 const p=await get('dino-x5'); const pattern=(await p.locator('.footprint-board').getAttribute('data-pattern')).split(','); const map={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'}; for(const x of pattern){await p.keyboard.press(map[x]);await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('footprint',await p.locator('.complete-screen').count());await p.close();
}
// hatch
{
 const p=await get('dino-x6'); const target=Number(await p.locator('.hatch-board').getAttribute('data-target')); await p.keyboard.down('Enter'); await p.waitForFunction((t)=>Number(document.querySelector('.hatch-board')?.getAttribute('data-warmth')||0)>=t-0.2,target,{timeout:6000}); await p.keyboard.up('Enter'); await p.waitForTimeout(600);console.log('hatch',target,await p.locator('.complete-screen').count());await p.close();
}
// feed
{
 const p=await get('dino-x7'); const target=Number(await p.locator('.feed-board').getAttribute('data-target')); for(let n=0;n<target;n++){await p.keyboard.press('Enter'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(70);} await p.waitForTimeout(500);console.log('feed',target,await p.locator('.complete-screen').count());await p.close();
}
// fossil sort
{
 const p=await get('dino-x8'); for(let n=0;n<4;n++){const val=Number(await p.locator('.fossil-card.is-focused').getAttribute('data-value')); await p.keyboard.press('Enter'); await p.waitForTimeout(60); if(val!==3) await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(80);} await p.waitForTimeout(500);console.log('fossilsort',await p.locator('.complete-screen').count());await p.close();
}
// maze
{
 const p=await get('dino-x9'); for(let s=0;s<8;s++){const d=await p.evaluate(()=>{const board=document.querySelector('.dino-maze-board');if(!board)return null;const hero=Number(board.getAttribute('data-hero'));const vals=[...document.querySelectorAll('.dino-tile')].map(e=>Number(e.dataset.value));const idx=vals.indexOf(Number(board.getAttribute('data-step'))+1);if(idx<0)return null;const r=Math.floor(hero/5),c=hero%5,nr=Math.floor(idx/5),nc=idx%5;return{key:nr<r?'ArrowUp':nr>r?'ArrowDown':nc<c?'ArrowLeft':'ArrowRight'}});if(!d)break;await p.keyboard.press(d.key);await p.waitForTimeout(80);if(await p.locator('.complete-screen').count())break;}console.log('dinomaze',await p.locator('.complete-screen').count());await p.close();
}
// museum
{
 const p=await get('dino-x10'); for(let n=0;n<10;n++){const order=(await p.locator('.museum-board').getAttribute('data-order')).split(',').map(Number); if(order.join('')==='123')break; const i=order.findIndex((v,idx)=>v!==idx+1); for(let k=0;k<i;k++)await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(80); if(await p.locator('.complete-screen').count())break;} console.log('museum',await p.locator('.complete-screen').count());await p.close();
}
await b.close();
