import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
async function get(id){const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto(base+id,{waitUntil:'networkidle'});await p.waitForTimeout(300);return p;}
// echo
{
 const p=await get('music-x1'); const pattern=(await p.locator('.echo-board').getAttribute('data-pattern')).split(',').map(Number); for(const note of pattern){for(let i=0;i<4;i++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.echo-choice')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===note)break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(70);} await p.waitForTimeout(500);console.log('echo',await p.locator('.complete-screen').count());await p.close();
}
// queue
{
 const p=await get('music-x2'); const nums=(await p.locator('.queue-board').getAttribute('data-notes')).split(',').map(Number); for(let n=1;n<=5;n++){const idx=nums.indexOf(n); for(let i=0;i<8;i++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.queue-note')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===idx)break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('queue',await p.locator('.complete-screen').count());await p.close();
}
// instrument memory
{
 const p=await get('music-x3'); const kinds=await p.evaluate(()=>[...document.querySelectorAll('.inst-card')].map(e=>e.dataset.kind)); for(const k of ['drum','harp','flute']){const ids=[];kinds.forEach((x,i)=>{if(x===k)ids.push(i)}); for(const id of ids){for(let n=0;n<8;n++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.inst-card')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===id)break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(60);}} await p.waitForTimeout(600);console.log('memory',await p.locator('.complete-screen').count());await p.close();
}
// baton
{
 const p=await get('music-x4'); for(let i=0;i<200 && !(await p.locator('.complete-screen').count());i++){if(await p.locator('.baton-board').getAttribute('data-in-zone')==='1')await p.keyboard.press('Enter'); await p.waitForTimeout(70);} console.log('baton',await p.locator('.complete-screen').count());await p.close();
}
// pitch
{
 const p=await get('music-x5'); const target=Number(await p.locator('.pitch-board').getAttribute('data-target')); for(let i=1;i<target;i++)await p.keyboard.press('ArrowUp'); await p.keyboard.press('Enter'); await p.waitForTimeout(500);console.log('pitch',target,await p.locator('.complete-screen').count());await p.close();
}
// bubble beat
{
 const p=await get('music-x6'); for(let i=0;i<200 && !(await p.locator('.complete-screen').count());i++){if(await p.locator('.bubblebeat-board').getAttribute('data-in-zone')==='1')await p.keyboard.press('Enter'); await p.waitForTimeout(70);} console.log('bubblebeat',await p.locator('.complete-screen').count());await p.close();
}
// drum
{
 const p=await get('music-x7'); for(let i=0;i<200 && !(await p.locator('.complete-screen').count());i++){if(await p.locator('.drum-board').getAttribute('data-beat')==='0')await p.keyboard.press('Enter'); await p.waitForTimeout(90);} console.log('drum',await p.locator('.complete-screen').count());await p.close();
}
// music maze
{
 const p=await get('music-x8'); for(let s=0;s<8;s++){const d=await p.evaluate(()=>{const board=document.querySelector('.music-maze-board');if(!board)return null;const hero=Number(board.getAttribute('data-hero'));const vals=[...document.querySelectorAll('.music-maze-tile')].map(e=>Number(e.dataset.value));const idx=vals.indexOf(Number(board.getAttribute('data-step'))+1);if(idx<0)return null;const r=Math.floor(hero/5),c=hero%5,nr=Math.floor(idx/5),nc=idx%5;return{key:nr<r?'ArrowUp':nr>r?'ArrowDown':nc<c?'ArrowLeft':'ArrowRight'}});if(!d)break;await p.keyboard.press(d.key);await p.waitForTimeout(80);if(await p.locator('.complete-screen').count())break;}console.log('musicmaze',await p.locator('.complete-screen').count());await p.close();
}
// choir
{
 const p=await get('music-x9'); for(let n=0;n<10;n++){const order=(await p.locator('.choir-board').getAttribute('data-order')).split(',').map(Number); if(order.join('')==='123')break; const i=order.findIndex((v,idx)=>v!==idx+1); for(let k=0;k<i;k++)await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(70); if(await p.locator('.complete-screen').count())break;} console.log('choir',await p.locator('.complete-screen').count());await p.close();
}
// stage
{
 const p=await get('music-x10'); const pattern=(await p.locator('.stage-board').getAttribute('data-pattern')).split(','); const map={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'}; for(const step of pattern){await p.keyboard.press(map[step]); await p.waitForTimeout(60);} await p.waitForTimeout(500);console.log('stage',await p.locator('.complete-screen').count());await p.close();
}
await b.close();
