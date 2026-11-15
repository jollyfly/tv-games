import { chromium } from 'playwright-core';
import fs from 'fs';
const content=JSON.parse(fs.readFileSync('src/content.json','utf8'));
const audioDir='public/audio-v4';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const p=await b.newPage({viewport:{width:1920,height:1080}});
const errors=[]; p.on('pageerror',e=>errors.push(e.message));
const rows=[];
for(const level of content.levels){
 await p.goto('http://127.0.0.1:5173/?preview='+level.id,{waitUntil:'domcontentloaded'});
 await p.waitForTimeout(280);
 const state=await p.evaluate(()=>({
  board:!!document.querySelector('.micro-board'),
  title:document.querySelector('.micro-title')?.textContent?.trim()||'',
  caption:document.querySelector('.micro-caption')?.textContent?.trim()||'',
  controls:document.querySelectorAll('.control-legend .legend-item').length,
  buttons:document.querySelectorAll('.micro-board button, .micro-board [role=button]').length,
  stageOverflow:document.documentElement.scrollWidth>1921||document.documentElement.scrollHeight>1081,
 }));
 const voiceKey=`micro-${level.id}`;
 const hasText=!!content.voices[voiceKey];
 const hasAudio=fs.existsSync(`${audioDir}/${voiceKey}.m4a`);
 rows.push({id:level.id,number:level.number,...state,hasText,hasAudio});
}
fs.writeFileSync('/tmp/final-qa.json',JSON.stringify(rows,null,2));
const bad=rows.filter(r=>!r.board||!r.title||!r.caption||r.controls===0||r.buttons===0||r.stageOverflow||!r.hasText||!r.hasAudio);
console.log('levels',rows.length,'bad',bad.length,'errors',errors.slice(0,10));
console.log('voice coverage',rows.filter(r=>r.hasAudio).length+'/'+rows.length,'text',rows.filter(r=>r.hasText).length);
if(bad.length) console.log(bad.slice(0,20));
await b.close();
