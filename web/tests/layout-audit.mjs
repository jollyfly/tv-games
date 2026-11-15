import { chromium } from 'playwright-core';
import fs from 'fs';
const content=JSON.parse(fs.readFileSync('src/content.json','utf8'));
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const p=await b.newPage({viewport:{width:1920,height:1080}});
const results=[];
for(const level of content.levels){
 await p.goto('http://127.0.0.1:5173/?preview='+level.id,{waitUntil:'domcontentloaded'});
 await p.waitForTimeout(320);
 await p.screenshot({path:`/tmp/micro-layout/${level.id}.png`});
 const data=await p.evaluate(()=>{
  const q=(s)=>document.querySelector(s);
  const rect=(s)=>{const e=q(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
  const overlap=(a,b)=>a&&b&&Math.max(0,Math.min(a.right,b.right)-Math.max(a.x,b.x))>4&&Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y))>4;
  const header=rect('.micro-header'), board=rect('.micro-board'), controls=rect('.control-legend');
  const texts=[];
  for(const sel of ['.micro-board-title','.micro-caption','.micro-progress','.micro-toast','.micro-verb','.micro-title']){
   const e=q(sel); if(!e) continue;
   const r=e.getBoundingClientRect();
   const fs=parseFloat(getComputedStyle(e).fontSize)||0;
   texts.push({sel,fs:Math.round(fs),w:Math.round(r.width),h:Math.round(r.height),overflowX:e.scrollWidth>e.clientWidth+2,overflowY:e.scrollHeight>e.clientHeight+2});
  }
  const outside=[];
  for(const el of document.querySelectorAll('.micro-board button, .micro-board svg')){
   const r=el.getBoundingClientRect();
   if(r.width&&r.height&&(r.left<-2||r.top<-2||r.right>1922||r.bottom>1082)) outside.push((el.className||el.tagName).toString().slice(0,60));
  }
  return {
   board:!!board, header, boardRect:board, controls,
   overlaps:{headerBoard:overlap(header,board),boardControls:overlap(board,controls),headerControls:overlap(header,controls)},
   outOfStage:[header,board,controls].some(r=>r&&(r.x<0||r.y<0||r.right>1922||r.bottom>1082)),
   outside:outside.slice(0,6),
   texts,
   title:q('.micro-title')?.textContent?.trim()||'',
   caption:q('.micro-caption')?.textContent?.trim()||'',
  };
 });
 results.push({id:level.id,number:level.number,...data});
}
fs.writeFileSync('/tmp/layout-audit.json',JSON.stringify(results,null,2));
const problems=results.filter(r=>!r.board||r.overlaps.headerBoard||r.overlaps.boardControls||r.outOfStage||r.texts.some(t=>t.overflowX||t.overflowY)||r.outside.length);
console.log('levels',results.length,'problems',problems.length);
for(const r of problems) console.log(r.id,JSON.stringify({overlaps:r.overlaps,out:r.outOfStage,outside:r.outside,texts:r.texts.filter(t=>t.overflowX||t.overflowY)}));
const fonts=[...new Set(results.flatMap(r=>r.texts.map(t=>`${t.sel}:${t.fs}`)))].sort();
console.log('fonts',fonts);
await b.close();
