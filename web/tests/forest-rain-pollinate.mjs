import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
// rain: sweep bucket until complete
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto('http://127.0.0.1:5173/?preview=forest-x8',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 for(let i=0;i<80 && !(await p.locator('.complete-screen').count());i++){await p.keyboard.press(i%8<4?'ArrowRight':'ArrowLeft');await p.waitForTimeout(180);}
 console.log('rain complete',await p.locator('.complete-screen').count());
 await p.screenshot({path:'/tmp/forest-x8-done.png'}); await p.close();
}
// pollinate: visit five unvisited cells
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto('http://127.0.0.1:5173/?preview=forest-x9',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 for(const key of ['Enter','ArrowRight','Enter','ArrowRight','Enter','ArrowDown','Enter','ArrowDown','Enter']){await p.keyboard.press(key);await p.waitForTimeout(70);}
 await p.waitForTimeout(600);
 console.log('pollinate complete',await p.locator('.complete-screen').count());
 await p.screenshot({path:'/tmp/forest-x9-done.png'}); await p.close();
}
// visuals after fixes
for(const id of ['forest-x5','forest-x6','forest-x7','forest-x4']){
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto('http://127.0.0.1:5173/?preview='+id,{waitUntil:'networkidle'}); await p.waitForTimeout(300); await p.screenshot({path:`/tmp/${id}-fixed.png`}); await p.close();
}
await b.close();
