import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
// mirror: toggle differing tiles
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'castle-x1',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const target=(await p.locator('.mirror-board').getAttribute('data-target')).split('').map(Number);
 const current=(await p.locator('.mirror-board').getAttribute('data-current')).split('').map(Number);
 for(let i=0;i<6;i++){ if(target[i]===current[i]) continue;
   for(let n=0;n<8;n++){const focused=await p.evaluate(()=>[...document.querySelectorAll('.mirror-tile')].findIndex(e=>e.classList.contains('is-focused'))); if(focused===i) break; await p.keyboard.press(i>focused?'ArrowRight':'ArrowLeft'); await p.waitForTimeout(30);}
   await p.keyboard.press('Enter'); await p.waitForTimeout(60);
 }
 await p.waitForTimeout(600); console.log('mirror',await p.locator('.complete-screen').count()); await p.close();
}
// stars
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'castle-x2',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const nums=(await p.locator('.stars-board').getAttribute('data-numbers')).split(',').map(Number);
 for(let next=1;next<=5;next++){const idx=nums.indexOf(next); for(let n=0;n<8;n++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.star-node')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===idx) break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(60);}
 await p.waitForTimeout(500); console.log('stars',await p.locator('.complete-screen').count()); await p.close();
}
// candles
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'castle-x3',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const target=Number(await p.locator('.candles-board').getAttribute('data-target'));
 for(let i=0;i<target;i++){await p.keyboard.press('Enter'); await p.keyboard.press(i<target-1?'ArrowRight':'ArrowLeft'); await p.waitForTimeout(50);}
 await p.waitForTimeout(500); console.log('candles',target,await p.locator('.complete-screen').count()); await p.close();
}
// clock
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'castle-1',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const target=Number(await p.locator('.clock-board').getAttribute('data-target'));
 for(let i=1;i<target;i++) await p.keyboard.press('ArrowRight');
 await p.keyboard.press('Enter'); await p.waitForTimeout(500); console.log('clock',target,await p.locator('.complete-screen').count()); await p.close();
}
// drawbridge hold
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'castle-2',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const target=Number(await p.locator('.drawbridge-board').getAttribute('data-target'));
 await p.keyboard.down('Enter');
 await p.waitForFunction((t)=>Number(document.querySelector('.drawbridge-board')?.getAttribute('data-level')||0)>=t-0.2,target,{timeout:6000});
 await p.keyboard.up('Enter'); await p.waitForTimeout(600);
 console.log('drawbridge',target,await p.locator('.complete-screen').count()); await p.close();
}
await b.close();
