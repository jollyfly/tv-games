import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
// conveyor: press OK when scanner target
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto(base+'candy-1',{waitUntil:'networkidle'}); await p.waitForTimeout(400);
 const target=Number(await p.locator('.conveyor-board').getAttribute('data-target'));
 for(let i=0;i<20;i++){
   const val=await p.evaluate(()=>{const s=Number(document.querySelector('.conveyor-board')?.getAttribute('data-scanner')||0);return Number(document.querySelectorAll('.conveyor-candy')[s]?.dataset.value)});
   if(val===target){await p.keyboard.press('Enter');break;}
   await p.waitForTimeout(300);
 }
 await p.waitForTimeout(600);
 console.log('conveyor target',target,'complete',await p.locator('.complete-screen').count(),'errs',errs);
 await p.screenshot({path:'/tmp/candy-1.png'}); await p.close();
}
// balance: add left/right target
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'candy-2',{waitUntil:'networkidle'}); await p.waitForTimeout(400);
 const target=Number(await p.locator('.balance-board').getAttribute('data-target'));
 for(let i=0;i<target;i++){await p.keyboard.press('ArrowLeft');await p.waitForTimeout(60);}
 for(let i=0;i<target;i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(60);}
 await p.waitForTimeout(700);
 console.log('balance target',target,'complete',await p.locator('.complete-screen').count());
 await p.screenshot({path:'/tmp/candy-2.png'}); await p.close();
}
// wrap: match pattern
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'candy-3',{waitUntil:'networkidle'}); await p.waitForTimeout(400);
 const pattern=(await p.locator('.wrap-board').getAttribute('data-pattern')).split(',');
 const order=['strawberry','lemon','mint'];
 for(const color of pattern){
   const target=order.indexOf(color);
   for(let i=0;i<3;i++){
     const focus=await p.evaluate(()=>[...document.querySelectorAll('.wrap-color')].findIndex(e=>e.classList.contains('is-focused')));
     if(focus===target) break;
     await p.keyboard.press('ArrowRight'); await p.waitForTimeout(40);
   }
   await p.keyboard.press('Enter'); await p.waitForTimeout(80);
 }
 await p.waitForTimeout(600);
 console.log('wrap complete',await p.locator('.complete-screen').count());
 await p.screenshot({path:'/tmp/candy-3.png'}); await p.close();
}
await b.close();
