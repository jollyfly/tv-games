import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
async function get(id){const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto(base+id,{waitUntil:'networkidle'});await p.waitForTimeout(300);return p;}
// potion
{
 const p=await get('magic-x1'); const pattern=(await p.locator('.potion-board').getAttribute('data-pattern')).split(',').map(Number); for(const note of pattern){for(let i=0;i<4;i++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.potion-choice')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===note)break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('potion',await p.locator('.complete-screen').count());await p.close();
}
// transform
{
 const p=await get('magic-x2'); const target=Number(await p.locator('.transform-board').getAttribute('data-target')); for(let i=0;i<3;i++){const shape=Number(await p.locator('.transform-board').getAttribute('data-shape')); if(shape===target)break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(50);} await p.keyboard.press('Enter'); await p.waitForTimeout(500);console.log('transform',target,await p.locator('.complete-screen').count());await p.close();
}
// mirror
{
 const p=await get('magic-x3'); const target=(await p.locator('.magic-mirror-board').getAttribute('data-target')).split('').map(Number); const current=(await p.locator('.magic-mirror-board').getAttribute('data-current')).split('').map(Number); for(let i=0;i<6;i++){if(target[i]===current[i])continue; for(let n=0;n<8;n++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.magic-mirror')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===i)break; await p.keyboard.press(cur<i?'ArrowRight':'ArrowLeft'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(50);} await p.waitForTimeout(500);console.log('mirror',await p.locator('.complete-screen').count());await p.close();
}
// spell
{
 const p=await get('magic-x4'); for(let i=0;i<3;i++){for(let n=0;n<5;n++){const rings=(await p.locator('.spell-board').getAttribute('data-rings')).split(',').map(Number); if(rings[i]===0)break; await p.keyboard.press('Enter'); await p.waitForTimeout(70);} await p.keyboard.press('ArrowRight'); await p.waitForTimeout(40);} await p.waitForTimeout(500);console.log('spell',await p.locator('.complete-screen').count());await p.close();
}
// broom
{
 const p=await get('magic-x5'); for(let i=0;i<100 && !(await p.locator('.complete-screen').count());i++){await p.keyboard.press(i%10<5?'ArrowRight':'ArrowLeft');await p.waitForTimeout(120);}console.log('broom',await p.locator('.complete-screen').count());await p.close();
}
// creature memory
{
 const p=await get('magic-x6'); const kinds=await p.evaluate(()=>[...document.querySelectorAll('.creature-card')].map(e=>e.dataset.kind)); for(const k of ['fairy','dragon','unicorn']){const ids=[];kinds.forEach((x,i)=>{if(x===k)ids.push(i)}); for(const id of ids){for(let n=0;n<8;n++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.creature-card')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===id)break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(60);}} await p.waitForTimeout(600);console.log('creature',await p.locator('.complete-screen').count());await p.close();
}
// maze
{
 const p=await get('magic-x7'); for(let s=0;s<8;s++){const d=await p.evaluate(()=>{const board=document.querySelector('.magic-maze-board');if(!board)return null;const hero=Number(board.getAttribute('data-hero'));const vals=[...document.querySelectorAll('.magic-maze-tile')].map(e=>Number(e.dataset.value));const idx=vals.indexOf(Number(board.getAttribute('data-step'))+1);if(idx<0)return null;const r=Math.floor(hero/5),c=hero%5,nr=Math.floor(idx/5),nc=idx%5;return{key:nr<r?'ArrowUp':nr>r?'ArrowDown':nc<c?'ArrowLeft':'ArrowRight'}});if(!d)break;await p.keyboard.press(d.key);await p.waitForTimeout(80);if(await p.locator('.complete-screen').count())break;}console.log('magicmaze',await p.locator('.complete-screen').count());await p.close();
}
// stars
{
 const p=await get('magic-x8'); for(let n=0;n<4;n++){await p.keyboard.press('Enter');await p.keyboard.press('ArrowRight');await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('stars',await p.locator('.complete-screen').count());await p.close();
}
// balance
{
 const p=await get('magic-x9'); const target=Number(await p.locator('.magic-balance-board').getAttribute('data-target')); for(let i=0;i<target;i++)await p.keyboard.press('ArrowLeft'); for(let i=0;i<target;i++)await p.keyboard.press('ArrowRight'); await p.waitForTimeout(600);console.log('balance',target,await p.locator('.complete-screen').count());await p.close();
}
// finale
{
 const p=await get('magic-x10'); const pattern=(await p.locator('.finale-board').getAttribute('data-pattern')).split(','); const map={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'}; for(const step of pattern){await p.keyboard.press(map[step]);await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('finale',await p.locator('.complete-screen').count());await p.close();
}
await b.close();
