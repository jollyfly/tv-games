import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
// gears
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'castle-3',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 for(let i=0;i<3;i++){
   for(let n=0;n<5;n++){const gs=(await p.locator('.gears-board').getAttribute('data-gears')).split(',').map(Number); if(gs[i]===0) break; await p.keyboard.press('Enter'); await p.waitForTimeout(80);}
   await p.keyboard.press('ArrowRight'); await p.waitForTimeout(50);
 }
 await p.waitForTimeout(500); console.log('gears',await p.locator('.complete-screen').count()); await p.close();
}
// knight maze
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'castle-x7',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 for(let s=0;s<10;s++){
  const data=await p.evaluate(()=>{const board=document.querySelector('.knight-board'); if(!board) return null; const fox=Number(board.getAttribute('data-knight')); const vals=[...document.querySelectorAll('.knight-tile')].map(e=>Number(e.dataset.value)); const next=Number(board.getAttribute('data-step'))+1; const idx=vals.indexOf(next); if(idx<0)return null; const r=Math.floor(fox/5),c=fox%5,nr=Math.floor(idx/5),nc=idx%5; return {key:nr<r?'ArrowUp':nr>r?'ArrowDown':nc<c?'ArrowLeft':'ArrowRight'};});
  if(!data) break; await p.keyboard.press(data.key); await p.waitForTimeout(80); if(await p.locator('.complete-screen').count()) break;
 }
 console.log('knight',await p.locator('.complete-screen').count()); await p.close();
}
// windows
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'castle-x8',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const target=Number(await p.locator('.windows-board').getAttribute('data-target'));
 for(let i=0;i<9;i++){const lights=Number(await p.locator('.castle-window').nth(i).getAttribute('data-lights')); if(lights===target) break; await p.keyboard.press((i%3)<2?'ArrowRight':'ArrowDown'); await p.waitForTimeout(30);}
 await p.keyboard.press('Enter'); await p.waitForTimeout(400); console.log('windows',target,await p.locator('.complete-screen').count()); await p.close();
}
// throne
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'castle-x9',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 for(let n=0;n<12;n++){
  const order=(await p.locator('.throne-board').getAttribute('data-order')).split(',').map(Number);
  if(order.join('')==='123') break;
  await p.keyboard.press('Enter'); await p.waitForTimeout(80);
 }
 await p.waitForTimeout(500); console.log('throne',await p.locator('.complete-screen').count()); await p.close();
}
// dance
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'castle-x10',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const pattern=(await p.locator('.dance-board').getAttribute('data-pattern')).split(',');
 const map={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'};
 for(const step of pattern){await p.keyboard.press(map[step]); await p.waitForTimeout(60);}
 await p.waitForTimeout(500); console.log('dance',await p.locator('.complete-screen').count()); await p.close();
}
await b.close();
