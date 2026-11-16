const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['Galaxy S9+ landscape']});const pg=await ctx.newPage();
 await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(1500);await pg.tap('#bopts');await pg.waitForTimeout(400);
 const st=()=>pg.evaluate(()=>document.querySelector('#menu .mpanel').scrollTop);
 const cdp=await ctx.newCDPSession(pg);const sw=async(y0,y1)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:150,y:y0}]});for(let i=1;i<=10;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:150,y:y0+(y1-y0)*i/10}]});await pg.waitForTimeout(16)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pg.waitForTimeout(400)};
 console.log('início',await st());await sw(260,80);console.log('após arrastar para cima',await st());await sw(80,300);console.log('após arrastar para baixo',await st());
 await sw(280,40);await sw(280,40);console.log('fim',await st());await pg.screenshot({path:'/home/claude/trab/menu2.png'});await b.close()})();
