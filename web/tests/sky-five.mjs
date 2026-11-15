import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
// plane
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'sky-x1',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const target=Number(await p.locator('.sky-board').getAttribute('data-target'));
 const enemies=(await p.locator('.sky-board').getAttribute('data-enemies')).split(',').map(Number);
 let idx=enemies.indexOf(target); for(let i=0;i<idx;i++) await p.keyboard.press('ArrowRight');
 await p.keyboard.press('Enter'); await p.waitForTimeout(500); console.log('plane',await p.locator('.complete-screen').count()); await p.close();
}
// gate: press when nearest target
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'sky-x2',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 for(let i=0;i<60;i++){
   const data=await p.evaluate(()=>({near:document.querySelector('.gate-board')?.getAttribute('data-near'),dist:Number(document.querySelector('.gate-board')?.getAttribute('data-distance'))}));
   if(data.near===String(await p.locator('.gate-board').getAttribute('data-target')) && data.dist<90){await p.keyboard.press('Enter');break;}
   await p.waitForTimeout(80);
 }
 await p.waitForTimeout(500); console.log('gate',await p.locator('.complete-screen').count()); await p.close();
}
// balloon
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'sky-x3',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const target=Number(await p.locator('.balloon-board').getAttribute('data-target'));
 await p.keyboard.down('Enter');
 await p.waitForFunction((t)=>Number(document.querySelector('.balloon-board')?.getAttribute('data-altitude')||0)>=t-0.2,target,{timeout:6000});
 await p.keyboard.up('Enter'); await p.waitForTimeout(600); console.log('balloon',target,await p.locator('.complete-screen').count()); await p.close();
}
// stars: sweep
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'sky-x4',{waitUntil:'networkidle'});
 for(let i=0;i<100 && !(await p.locator('.complete-screen').count());i++){await p.keyboard.press(i%10<5?'ArrowRight':'ArrowLeft'); await p.waitForTimeout(120);}
 console.log('stars',await p.locator('.complete-screen').count()); await p.close();
}
// hop: press when in zone
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'sky-1',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 for(let i=0;i<200 && !(await p.locator('.complete-screen').count());i++){
   const inZone=await p.locator('.hop-board').getAttribute('data-in-zone');
   if(inZone==='1') await p.keyboard.press('Enter');
   await p.waitForTimeout(70);
 }
 console.log('hop',await p.locator('.complete-screen').count()); await p.close();
}
await b.close();
