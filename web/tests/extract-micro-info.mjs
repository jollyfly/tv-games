import { chromium } from 'playwright-core';
import fs from 'fs';
const content=JSON.parse(fs.readFileSync('src/content.json','utf8'));
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const p=await b.newPage({viewport:{width:1920,height:1080}});
const out=[];
for(const level of content.levels){
 await p.goto('http://127.0.0.1:5173/?preview='+level.id,{waitUntil:'domcontentloaded'});
 await p.waitForTimeout(260);
 const info=await p.evaluate(()=>({
   title:document.querySelector('.micro-title')?.textContent?.trim()||'',
   verb:document.querySelector('.micro-verb')?.textContent?.trim()||'',
   controls:[...document.querySelectorAll('.control-legend .legend-item, .control-legend [class*=label]')].map(e=>e.textContent?.trim()).filter(Boolean),
   board:!!document.querySelector('.micro-board'),
 }));
 out.push({id:level.id,number:level.number,world:level.world,contentTitle:level.title,...info});
}
fs.writeFileSync('/tmp/micro-info.json',JSON.stringify(out,null,2));
console.log('extracted',out.length,'missing boards',out.filter(x=>!x.board).map(x=>x.id));
await b.close();
