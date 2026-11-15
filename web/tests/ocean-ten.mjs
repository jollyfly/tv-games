import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
async function get(id){const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto(base+id,{waitUntil:'networkidle'});await p.waitForTimeout(300);return p;}
// fishing
{
 const p=await get('ocean-1'); const fish=(await p.locator('.fishing-board').getAttribute('data-target'));
 for(let n=0;n<3;n++){const lanes=await p.evaluate(()=>[...document.querySelectorAll('.fishing-lane')].map(e=>Number(e.dataset.fish))); const idx=lanes.findIndex(v=>v>0); for(let i=0;i<idx;i++)await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(80);}
 await p.waitForTimeout(500);console.log('fishing',await p.locator('.complete-screen').count());await p.close();
}
// starfish
{
 const p=await get('ocean-2'); const target=4;
 for(let n=0;n<target;n++){await p.keyboard.press('Enter'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(60);}
 await p.waitForTimeout(500);console.log('starfish',await p.locator('.complete-screen').count());await p.close();
}
// pearl
{
 const p=await get('ocean-3'); const target=Number(await p.locator('.pearl-board').getAttribute('data-target')); await p.keyboard.down('Enter'); await p.waitForFunction((t)=>Number(document.querySelector('.pearl-board')?.getAttribute('data-depth')||0)>=t-0.2,target,{timeout:6000}); await p.keyboard.up('Enter'); await p.waitForTimeout(600);console.log('pearl',target,await p.locator('.complete-screen').count());await p.close();
}
// coral
{
 const p=await get('ocean-4'); const target=Number(await p.locator('.coral-board').getAttribute('data-target')); for(let n=0;n<target;n++){await p.keyboard.press('Enter');await p.keyboard.press('ArrowRight');await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('coral',target,await p.locator('.complete-screen').count());await p.close();
}
// submarine
{
 const p=await get('ocean-5'); for(let s=0;s<8;s++){const d=await p.evaluate(()=>{const board=document.querySelector('.sub-board');if(!board)return null;const sub=Number(board.getAttribute('data-sub'));const vals=[...document.querySelectorAll('.sub-tile')].map(e=>Number(e.dataset.value));const idx=vals.indexOf(Number(board.getAttribute('data-step'))+1);if(idx<0)return null;const r=Math.floor(sub/5),c=sub%5,nr=Math.floor(idx/5),nc=idx%5;return{key:nr<r?'ArrowUp':nr>r?'ArrowDown':nc<c?'ArrowLeft':'ArrowRight'}});if(!d)break;await p.keyboard.press(d.key);await p.waitForTimeout(80);if(await p.locator('.complete-screen').count())break;}console.log('submarine',await p.locator('.complete-screen').count());await p.close();
}
// jelly
{
 const p=await get('ocean-6'); const order=(await p.locator('.jelly-board').getAttribute('data-order')).split(',').map(Number); const nums=[...Array(5).keys()];
 for(const target of order){const idx=target; for(let i=0;i<6;i++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.jelly')].findIndex(e=>e.classList.contains('is-focused')));if(cur===idx)break;await p.keyboard.press('ArrowRight');await p.waitForTimeout(30);}await p.keyboard.press('Enter');await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('jelly',await p.locator('.complete-screen').count());await p.close();
}
// crab
{
 const p=await get('ocean-7'); const target=Number(await p.locator('.crab-board').getAttribute('data-target')); for(let i=0;i<target;i++){await p.keyboard.press(i%2===0?'ArrowLeft':'ArrowRight');await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('crab',target,await p.locator('.complete-screen').count());await p.close();
}
// bubble
{
 const p=await get('ocean-8'); for(let i=0;i<100 && !(await p.locator('.complete-screen').count());i++){await p.keyboard.press(i%10<5?'ArrowRight':'ArrowLeft');await p.waitForTimeout(120);} console.log('bubble',await p.locator('.complete-screen').count());await p.close();
}
// treasure
{
 const p=await get('ocean-9'); const row=Number(await p.locator('.treasure-board').getAttribute('data-target-row'))-1; const col=Number(await p.locator('.treasure-board').getAttribute('data-target-col'))-1; for(let r=0;r<row;r++)await p.keyboard.press('ArrowDown'); for(let c=0;c<col;c++)await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(500);console.log('treasure',row,col,await p.locator('.complete-screen').count());await p.close();
}
// palace
{
 const p=await get('ocean-10'); for(let s=0;s<8;s++){const d=await p.evaluate(()=>{const board=document.querySelector('.palace-board');if(!board)return null;const hero=Number(board.getAttribute('data-hero'));const vals=[...document.querySelectorAll('.palace-tile')].map(e=>Number(e.dataset.value));const idx=vals.indexOf(Number(board.getAttribute('data-step'))+1);if(idx<0)return null;const r=Math.floor(hero/4),c=hero%4,nr=Math.floor(idx/4),nc=idx%4;return{key:nr<r?'ArrowUp':nr>r?'ArrowDown':nc<c?'ArrowLeft':'ArrowRight'}});if(!d)break;await p.keyboard.press(d.key);await p.waitForTimeout(80);if(await p.locator('.complete-screen').count())break;}console.log('palace',await p.locator('.complete-screen').count());await p.close();
}
await b.close();
