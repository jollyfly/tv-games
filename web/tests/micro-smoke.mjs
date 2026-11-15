import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const p=await b.newPage({viewport:{width:1920,height:1080}}); const errors=[]; p.on('pageerror',e=>errors.push(e.message));
for(const id of ['forest-1','forest-x4','forest-x6','forest-x7','forest-x8','forest-x9','forest-x10','candy-1','candy-2','candy-3']){
 await p.goto('http://127.0.0.1:5173/?preview='+id,{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const ok=await p.locator('.micro-board').count();
 console.log(id, ok?'micro-ok':'MISSING');
}
console.log('errors',errors);
await b.close();
