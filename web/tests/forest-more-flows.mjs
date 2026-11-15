import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
async function get(id){const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto(base+id,{waitUntil:'networkidle'});await p.waitForTimeout(500);return p;}
// firefly
{
 const p=await get('forest-x4');
 for(let n=0;n<3;n++){
   for(let i=0;i<8;i++){
     const has=await p.locator('.firefly-slot.is-focused .firefly-bug').count();
     if(has) break;
     await p.keyboard.press('ArrowRight'); await p.waitForTimeout(40);
   }
   await p.keyboard.press('Enter'); await p.waitForTimeout(120);
 }
 await p.waitForTimeout(600);
 console.log('firefly complete',await p.locator('.complete-screen').count());
 await p.close();
}
// sort
{
 const p=await get('forest-x5');
 for(let n=0;n<4;n++){
   const value=Number(await p.locator('.sort-leaf.is-focused').getAttribute('data-value'));
   await p.keyboard.press('Enter'); await p.waitForTimeout(80);
   if(value!==3) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(40); }
   await p.keyboard.press('Enter'); await p.waitForTimeout(120);
 }
 await p.waitForTimeout(700);
 console.log('sort complete',await p.locator('.complete-screen').count());
 await p.close();
}
// climb
{
 const p=await get('forest-x6');
 const target=Number(await p.locator('.climb-board').getAttribute('data-target'));
 for(let i=1;i<target;i++) await p.keyboard.press('ArrowUp');
 await p.keyboard.press('Enter'); await p.waitForTimeout(500);
 console.log('climb',target,'complete',await p.locator('.complete-screen').count());
 await p.close();
}
// memory
{
 const p=await get('forest-x7');
 const kinds=await p.evaluate(()=>[...document.querySelectorAll('.memory-card')].map(e=>e.dataset.kind));
 for(const kind of ['flower','star','candy']){
   const ids=[]; kinds.forEach((k,i)=>{if(k===kind) ids.push(i)});
   for(const id of ids){
     // navigate by pressing right until focused card index is id
     for(let n=0;n<8;n++){
       const idx=await p.evaluate(()=>[...document.querySelectorAll('.memory-card')].findIndex(e=>e.classList.contains('is-focused')));
       if(idx===id) break;
       await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);
     }
     await p.keyboard.press('Enter'); await p.waitForTimeout(60);
   }
 }
 await p.waitForTimeout(800);
 console.log('memory kinds',kinds,'complete',await p.locator('.complete-screen').count());
 await p.close();
}
await b.close();
