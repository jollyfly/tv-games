import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
// claw
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'candy-x4',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 for(let n=0;n<3;n++){
  for(let i=0;i<8;i++){const has=await p.locator('.claw-lane.is-focused .claw-candy').count(); if(has) break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(40);}
  await p.keyboard.press('Enter'); await p.waitForTimeout(100);
 }
 await p.waitForTimeout(600); console.log('claw',await p.locator('.complete-screen').count()); await p.close();
}
// elevator
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'candy-x5',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const target=Number(await p.locator('.elevator-board').getAttribute('data-target'));
 for(let i=1;i<target;i++) await p.keyboard.press('ArrowUp');
 await p.keyboard.press('Enter'); await p.waitForTimeout(500); console.log('elevator',target,await p.locator('.complete-screen').count()); await p.close();
}
// tray: press Enter target times on distinct cells
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'candy-x6',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const target=Number(await p.locator('.tray-board').getAttribute('data-target'));
 for(let n=0;n<target;n++){await p.keyboard.press('Enter'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(60);}
 await p.waitForTimeout(600); console.log('tray',target,await p.locator('.complete-screen').count()); await p.close();
}
// jar: hold until target, release
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'candy-x7',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const target=Number(await p.locator('.jar-board').getAttribute('data-target'));
 await p.keyboard.down('Enter');
 await p.waitForFunction((t)=>Number(document.querySelector('.jar-board')?.getAttribute('data-count')||0)>=t-1,target,{timeout:5000});
 await p.keyboard.up('Enter'); await p.waitForTimeout(600);
 console.log('jar',target,await p.locator('.complete-screen').count()); await p.close();
}
await b.close();
