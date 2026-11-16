const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=user-gesture-required']});const ctx=await b.newContext({...devices['Galaxy S9+ landscape']});const pg=await ctx.newPage();const errs=[];
 pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(1500);
 await pg.evaluate(async()=>{await navigator.serviceWorker.register('sw.js');const r=await navigator.serviceWorker.ready;return !!r.active});await pg.waitForTimeout(4000);
 const cached=await pg.evaluate(async()=>{const ks=await caches.keys();let n=0;for(const k of ks){n+=(await (await caches.open(k)).keys()).length}return ks.join(',')+' '+n});console.log('cache',cached);
 await ctx.setOffline(true);await pg.reload();await pg.waitForTimeout(2500);
 await pg.tap('#bnew');await pg.waitForTimeout(800);await pg.tap('#bstart');await pg.waitForTimeout(6000);
 // manda os aldeões andarem e mede se se movem durante 40 s de jogo real
 const p0=await pg.evaluate(()=>{const vs=G.U.filter(u=>u.o===0&&!u.dead);return vs.map(u=>[u.id,u.x|0,u.y|0,u.st])});
 await pg.waitForTimeout(40000);
 const p1=await pg.evaluate(()=>{const vs=G.U.filter(u=>u.o===0&&!u.dead);return {t:G.t.toFixed(1),paused,running,u:vs.map(u=>[u.id,u.x|0,u.y|0,u.st]),res:G.P[0].res,img:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length}});
 console.log('antes',JSON.stringify(p0));console.log('depois',JSON.stringify(p1));
 await pg.screenshot({path:'/home/claude/trab/offline.png'});
 console.log('ERROS',errs.slice(0,10));await b.close()})();
