import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
for (const id of ['forest-1','forest-2','forest-3']) {
 const p=await b.newPage({viewport:{width:1920,height:1080}});
 const errors=[]; p.on('pageerror',e=>errors.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404')) errors.push(m.text())});
 await p.goto(`http://127.0.0.1:5173/?preview=${id}`,{waitUntil:'networkidle'}); await p.waitForTimeout(700);
 await p.screenshot({path:`/tmp/${id}.png`});
 console.log(id, errors.slice(0,3));
 await p.close();
}
await b.close();
