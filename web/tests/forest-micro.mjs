import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
async function pageFor(id){const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.log(id,'pageerror',e.message));await p.goto(base+id,{waitUntil:'networkidle'});await p.waitForTimeout(500);return p;}

// seed
{
 const p=await pageFor('forest-1');
 const target=Number(await p.locator('.seed-board').getAttribute('data-target'));
 for(let i=0;i<target;i++){await p.keyboard.press('Enter');await p.waitForTimeout(80);}
 await p.waitForTimeout(900);
 console.log('seed', {target, complete: await p.locator('.complete-screen').count(), star: await p.locator('.complete-star').count()});
 await p.screenshot({path:'/tmp/forest-1-done.png'}); await p.close();
}
// water
{
 const p=await pageFor('forest-2');
 const target=Number(await p.locator('.water-board').getAttribute('data-target'));
 await p.keyboard.down('Enter');
 await p.waitForFunction((t)=>Number(document.querySelector('.water-board')?.getAttribute('data-level')||0) >= t-0.2, target, {timeout:5000});
 await p.keyboard.up('Enter');
 await p.waitForTimeout(700);
 console.log('water', {target, complete: await p.locator('.complete-screen').count()});
 await p.screenshot({path:'/tmp/forest-2-done.png'}); await p.close();
}
// bridge
{
 const p=await pageFor('forest-3');
 const stones=(await p.locator('.bridge-board').getAttribute('data-stones')).split(',').map(Number);
 for(let next=1;next<=5;next++){
   for(let i=0;i<10;i++){
     const value=Number(await p.locator('.bridge-stone.is-focused').getAttribute('data-stone'));
     if(value===next) break;
     await p.keyboard.press('ArrowRight'); await p.waitForTimeout(40);
   }
   await p.keyboard.press('Enter'); await p.waitForTimeout(100);
 }
 await p.waitForTimeout(500);
 console.log('bridge', {stones, complete: await p.locator('.complete-screen').count()});
 await p.screenshot({path:'/tmp/forest-3-done.png'}); await p.close();
}
await b.close();
