import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base='http://127.0.0.1:5173/?preview=';
// wind
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'sky-3',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const pattern=(await p.locator('.wind-board').getAttribute('data-pattern')).split(',');
 const map={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'};
 for(const step of pattern){await p.keyboard.press(map[step]); await p.waitForTimeout(60);}
 await p.waitForTimeout(500); console.log('wind',await p.locator('.complete-screen').count()); await p.close();
}
// birds
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'sky-4',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const nums=(await p.locator('.birds-board').getAttribute('data-numbers')).split(',').map(Number);
 for(let next=1;next<=5;next++){const idx=nums.indexOf(next); for(let i=0;i<8;i++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.bird')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===idx)break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(60);}
 await p.waitForTimeout(500); console.log('birds',await p.locator('.complete-screen').count()); await p.close();
}
// rainbow
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'sky-5',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 const pattern=(await p.locator('.rainbow-board').getAttribute('data-pattern')).split(','); const order=['red','orange','yellow','green','blue'];
 for(const color of pattern){const target=order.indexOf(color); for(let i=0;i<5;i++){const cur=await p.evaluate(()=>[...document.querySelectorAll('.rainbow-color')].findIndex(e=>e.classList.contains('is-focused'))); if(cur===target)break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);} await p.keyboard.press('Enter'); await p.waitForTimeout(60);}
 await p.waitForTimeout(500); console.log('rainbow',await p.locator('.complete-screen').count()); await p.close();
}
// sky maze
{
 const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto(base+'lighthouse-1',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
 for(let s=0;s<8;s++){const data=await p.evaluate(()=>{const board=document.querySelector('.skymaze-board'); if(!board)return null; const hero=Number(board.getAttribute('data-hero')); const vals=[...document.querySelectorAll('.sky-maze-tile')].map(e=>Number(e.dataset.value)); const idx=vals.indexOf(Number(board.getAttribute('data-step'))+1); if(idx<0)return null; const r=Math.floor(hero/4),c=hero%4,nr=Math.floor(idx/4),nc=idx%4; return {key:nr<r?'ArrowUp':nr>r?'ArrowDown':nc<c?'ArrowLeft':'ArrowRight'};}); if(!data)break; await p.keyboard.press(data.key); await p.waitForTimeout(80); if(await p.locator('.complete-screen').count())break;}
 console.log('skymaze',await p.locator('.complete-screen').count()); await p.close();
}
await b.close();
