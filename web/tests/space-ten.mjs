import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
async function get(id){const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto(base+id,{waitUntil:'networkidle'});await p.waitForTimeout(300);return p;}
// orbit
{
 const p=await get('space-x1'); for(let i=0;i<120;i++){const a=Number(await p.locator('.orbit-board').getAttribute('data-angle')); const t=Number(await p.locator('.orbit-board').getAttribute('data-target')); const diff=Math.abs(((a-t+540)%360)-180); if(diff<15){await p.keyboard.press('Enter');break;} await p.waitForTimeout(50);} await p.waitForTimeout(400);console.log('orbit',await p.locator('.complete-screen').count());await p.close();
}
// asteroid
{
 const p=await get('space-x2'); for(let i=0;i<80 && !(await p.locator('.complete-screen').count());i++){const data=await p.evaluate(()=>{const board=document.querySelector('.asteroid-board');if(!board)return null;const stars=[...document.querySelectorAll('.asteroid-lane')].map((e,i)=>e.querySelector('.asteroid-star')?i:-1).filter(i=>i>=0);const rocks=[...document.querySelectorAll('.asteroid-lane')].map((e,i)=>e.classList.contains('is-rock')?i:-1).filter(i=>i>=0);const cur=[...document.querySelectorAll('.asteroid-lane')].findIndex(e=>e.classList.contains('is-focused'));return{stars,rocks,cur};}); if(data && data.stars.length){const target=data.stars.find(s=>!data.rocks.includes(s)); if(target>=0){for(let n=0;n<5;n++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.asteroid-lane')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===target)break; await p.keyboard.press(cur<target?'ArrowRight':'ArrowLeft'); await p.waitForTimeout(30);} await p.keyboard.press('Enter');}} await p.waitForTimeout(120);} console.log('asteroid',await p.locator('.complete-screen').count());await p.close();
}
// starmap + gravity + subspace + warp + launch + alien
{
 const p=await get('space-x3'); const r=Number(await p.locator('.starmap-board').getAttribute('data-target-row'))-1; const c=Number(await p.locator('.starmap-board').getAttribute('data-target-col'))-1; for(let i=0;i<r;i++)await p.keyboard.press('ArrowDown'); for(let i=0;i<c;i++)await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);console.log('starmap',await p.locator('.complete-screen').count());await p.close();
}
{
 const p=await get('space-x4'); const pattern=(await p.locator('.hatchcode-board').getAttribute('data-pattern')).split(','); const map={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'}; for(const x of pattern){await p.keyboard.press(map[x]);await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('hatch',await p.locator('.complete-screen').count());await p.close();
}
{
 const p=await get('space-x5'); for(let i=0;i<3;i++){for(let n=0;n<5;n++){const ps=(await p.locator('.satellite-board').getAttribute('data-panels')).split(',').map(Number); if(ps[i]===0)break; await p.keyboard.press('Enter'); await p.waitForTimeout(80);} await p.keyboard.press('ArrowRight'); await p.waitForTimeout(50);} await p.waitForTimeout(500);console.log('satellite',await p.locator('.complete-screen').count());await p.close();
}
{
 const p=await get('space-x6'); const target=Number(await p.locator('.gravity-board').getAttribute('data-target')); const key=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'][target]; await p.keyboard.press(key); await p.keyboard.press('Enter'); await p.waitForTimeout(500);console.log('gravity',await p.locator('.complete-screen').count());await p.close();
}
{
 const p=await get('space-x7'); const kinds=await p.evaluate(()=>[...document.querySelectorAll('.alien-card')].map(e=>e.dataset.kind)); for(const k of ['green','purple','orange']){const ids=[];kinds.forEach((x,i)=>{if(x===k)ids.push(i)}); for(const id of ids){for(let n=0;n<8;n++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.alien-card')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===id)break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(60);}} await p.waitForTimeout(600);console.log('alien',await p.locator('.complete-screen').count());await p.close();
}
{
 const p=await get('space-x8'); const target=Number(await p.locator('.fuel-board').getAttribute('data-target')); await p.keyboard.down('Enter'); await p.waitForFunction((t)=>Number(document.querySelector('.fuel-board')?.getAttribute('data-fuel')||0)>=t-0.2,target,{timeout:6000}); await p.keyboard.up('Enter'); await p.waitForTimeout(600);console.log('fuel',target,await p.locator('.complete-screen').count());await p.close();
}
{
 const p=await get('space-x9'); for(let s=0;s<8;s++){const d=await p.evaluate(()=>{const board=document.querySelector('.warp-board');if(!board)return null;const hero=Number(board.getAttribute('data-hero'));const vals=[...document.querySelectorAll('.warp-tile')].map(e=>Number(e.dataset.value));const idx=vals.indexOf(Number(board.getAttribute('data-step'))+1);if(idx<0)return null;const r=Math.floor(hero/5),c=hero%5,nr=Math.floor(idx/5),nc=idx%5;return{key:nr<r?'ArrowUp':nr>r?'ArrowDown':nc<c?'ArrowLeft':'ArrowRight'}});if(!d)break;await p.keyboard.press(d.key);await p.waitForTimeout(80);if(await p.locator('.complete-screen').count())break;}console.log('warp',await p.locator('.complete-screen').count());await p.close();
}
{
 const p=await get('space-x10'); const order=(await p.locator('.launch-board').getAttribute('data-order')).split(',').map(Number); for(const idx of order){for(let n=0;n<5;n++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.launch-button')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===idx)break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('launch',await p.locator('.complete-screen').count());await p.close();
}
await b.close();
