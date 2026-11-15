import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
async function shot(url, path, action) {
 const p=await b.newPage({viewport:{width:1920,height:1080}});
 const errors=[]; p.on('pageerror',e=>errors.push(e.message)); p.on('console',m=>{if(m.type()==='error') errors.push(m.text())});
 await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(500);
 if(action) await action(p);
 await p.screenshot({path}); console.log(path, errors.slice(0,2));
 await p.close();
}
await shot('http://127.0.0.1:5173/?preview=worlds','/tmp/v2-worlds.png');
await shot('http://127.0.0.1:5173/?preview=worlds','/tmp/v2-forest-map.png', async p=>{await p.keyboard.press('Enter'); await p.waitForTimeout(600);});
await shot('http://127.0.0.1:5173/?preview=q51','/tmp/v2-dino.png');
await shot('http://127.0.0.1:5173/?preview=q61','/tmp/v2-space.png');
await b.close();
