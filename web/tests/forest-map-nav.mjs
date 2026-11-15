import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
// map -> forest -> level 1
const p=await b.newPage({viewport:{width:1920,height:1080}});
const errors=[]; p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:5173/?preview=map',{waitUntil:'networkidle'}); await p.waitForTimeout(500);
await p.keyboard.press('Enter'); await p.waitForTimeout(700);
console.log('map title',await p.locator('.map-title').textContent(),'nodes',await p.locator('.map-node').count());
await p.screenshot({path:'/tmp/forest-10-map.png'});
await p.keyboard.press('Enter'); await p.waitForTimeout(500);
console.log('micro title',await p.locator('.micro-title').textContent());
// seed complete
const target=Number(await p.locator('.seed-board').getAttribute('data-target'));
for(let i=0;i<target;i++){await p.keyboard.press('Enter');await p.waitForTimeout(70);}
await p.waitForTimeout(800);
await p.keyboard.press('Enter'); await p.waitForTimeout(500);
console.log('next micro title',await p.locator('.micro-title').textContent(),'errors',errors.slice(0,3));
await p.screenshot({path:'/tmp/forest-level2.png'});
await p.close(); await b.close();
