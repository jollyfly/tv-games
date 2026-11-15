import { chromium } from 'playwright-core';
import fs from 'fs';
const content=JSON.parse(fs.readFileSync('../web/src/content.json','utf8'));
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const p=await b.newPage({viewport:{width:1920,height:1080}});
const errors=[]; p.on('pageerror',e=>errors.push(e.message));
const missing=[];
for(const level of content.levels){
 await p.goto('http://127.0.0.1:5173/?preview='+level.id,{waitUntil:'domcontentloaded'});
 await p.waitForTimeout(300);
 const count=await p.locator('.micro-board').count();
 if(!count) missing.push(level.id);
}
console.log('levels',content.levels.length,'missing',missing,'errors',errors.slice(0,5));
await b.close();
