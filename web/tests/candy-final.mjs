import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
// pipe
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto('http://127.0.0.1:5173/?preview=candy-x8',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 for(let i=0;i<3;i++){
   for(let n=0;n<5;n++){
     const ori=Number((await p.locator('.pipe-board').getAttribute('data-orientations')).split(',')[i]);
     if(ori===0) break;
     await p.keyboard.press('Enter'); await p.waitForTimeout(80);
   }
   await p.keyboard.press('ArrowRight'); await p.waitForTimeout(60);
 }
 await p.waitForTimeout(600); console.log('pipe',await p.locator('.complete-screen').count()); await p.close();
}
// slot: stop each when current value 0
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto('http://127.0.0.1:5173/?preview=candy-x9',{waitUntil:'networkidle'});
 for(let i=0;i<3;i++){
   await p.waitForFunction(()=>{const board=document.querySelector('.slot-board'); if(!board) return false; const active=Number(board.getAttribute('data-active')); const reels=(board.getAttribute('data-reels')||'').split(','); return reels[active]==='0';},{timeout:5000});
   await p.keyboard.press('Enter'); await p.waitForTimeout(120);
 }
 await p.waitForTimeout(500); console.log('slot',await p.locator('.complete-screen').count()); await p.close();
}
// pachinko
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto('http://127.0.0.1:5173/?preview=candy-x10',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const target=Number(await p.locator('.pachinko-board').getAttribute('data-target'));
 for(let i=1;i<target;i++) await p.keyboard.press('ArrowRight');
 await p.keyboard.press('Enter'); await p.waitForTimeout(500);
 console.log('pachinko target',target,'complete',await p.locator('.complete-screen').count()); await p.close();
}
await b.close();
