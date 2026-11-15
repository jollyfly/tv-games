import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
// rain
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'forest-x8',{waitUntil:'networkidle'});
 await p.waitForSelector('.complete-screen',{timeout:20000}).catch(()=>{});
 console.log('rain complete',await p.locator('.complete-screen').count(),await p.locator('.rain-board').count());
 await p.screenshot({path:'/tmp/forest-x8.png'}); await p.close();
}
// pollinate
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'forest-x9',{waitUntil:'networkidle'}); await p.waitForTimeout(400);
 for(let n=0;n<5;n++){ await p.keyboard.press('Enter'); await p.waitForTimeout(80); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(50); }
 await p.waitForTimeout(600);
 console.log('pollinate complete',await p.locator('.complete-screen').count());
 await p.screenshot({path:'/tmp/forest-x9.png'}); await p.close();
}
// maze
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'forest-x10',{waitUntil:'networkidle'}); await p.waitForTimeout(400);
 for(let step=0;step<10;step++){
  const data=await p.evaluate(()=>{
   const board=document.querySelector('.forest-maze-board'); if(!board) return null;
   const fox=Number(board.getAttribute('data-fox')); const tiles=[...document.querySelectorAll('.forest-maze-tile')];
   const values=tiles.map(e=>Number(e.dataset.value)); const cols=5; const r=Math.floor(fox/cols),c=fox%cols;
   const find=(v)=>values.indexOf(v);
   const next=find(Number(board.getAttribute('data-step'))+1);
   if(next<0) return null;
   const nr=Math.floor(next/cols),nc=next%cols;
   return {key:nr<r?'ArrowUp':nr>r?'ArrowDown':nc<c?'ArrowLeft':'ArrowRight',step:board.getAttribute('data-step')};
  });
  if(!data) break;
  await p.keyboard.press(data.key); await p.waitForTimeout(100);
  if(await p.locator('.complete-screen').count()) break;
 }
 await p.waitForTimeout(400);
 console.log('maze complete',await p.locator('.complete-screen').count());
 await p.screenshot({path:'/tmp/forest-x10.png'}); await p.close();
}
await b.close();
