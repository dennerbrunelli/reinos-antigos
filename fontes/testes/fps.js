const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['Galaxy S9+ landscape']});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const cdp=await ctx.newCDPSession(pg);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});
 for(const np of [2,8]){
 await pg.evaluate(np=>{__RA.newGame({civ:'babilonios',diff:'normal',np,size:np>2?'gig':'med',map:'terra'});__RA.startGame();OPT.snd=false},np);
 await pg.waitForTimeout(3000);
 const r=await pg.evaluate(()=>new Promise(res=>{const ts=[];let last=performance.now();const g0=G.t;function f(t){ts.push(t-last);last=t;if(ts.length<240)requestAnimationFrame(f);else{ts.sort((a,b)=>a-b);res({med:ts[120].toFixed(1),p95:ts[228].toFixed(1),max:ts[239].toFixed(1),gt:(G.t-g0).toFixed(1)})}}requestAnimationFrame(f)}));
 console.log('nações',np,JSON.stringify(r))}
 console.log('ERROS',errs.slice(0,4));await b.close()})();
