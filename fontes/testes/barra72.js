const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['Galaxy S9+ landscape']});const pg=await ctx.newPage();
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});
 await pg.evaluate(()=>{__RA.newGame({civ:'gregos',map:'terra',diff:'facil',size:'med'});__RA.startGame();OPT.snd=false});await pg.waitForTimeout(1500);
 await pg.evaluate(()=>{const s=G.starts[0];const hs=[0,1,2].map(i=>spawnUnit('hopl',0,(s[0]+4+i)*TS,(s[1]+5)*TS));SEL=hs.map(u=>u.id);updHUD(true)});await pg.waitForTimeout(600);await pg.screenshot({path:'/home/claude/trab/barra_sold.png'});
 await pg.evaluate(()=>{const t=G.B.find(b=>b.o===0&&b.type==='tc');SEL=[t.id];updHUD(true)});await pg.waitForTimeout(600);await pg.screenshot({path:'/home/claude/trab/barra_tc.png'});
 await b.close()})();
