import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
for (const [id,path] of [['q61','/tmp/v2-coord.png'],['q83','/tmp/v2-share.png'],['q52','/tmp/v2-odd.png']]) {
 const p=await b.newPage({viewport:{width:1920,height:1080}});
 const errors=[]; p.on('pageerror',e=>errors.push(e.message)); p.on('console',m=>{if(m.type()==='error' && !m.text().includes('404')) errors.push(m.text())});
 await p.goto(`http://127.0.0.1:5173/?preview=${id}`,{waitUntil:'networkidle'}); await p.waitForTimeout(600);
 await p.screenshot({path}); console.log(id,errors.slice(0,2));
 await p.close();
}
await b.close();
