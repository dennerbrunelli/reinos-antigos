const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['Galaxy S9+ landscape']});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});
 await pg.evaluate(()=>{__RA.newGame({civ:'gregos',map:'terra',diff:'facil',size:'med'});__RA.startGame();OPT.snd=false;const s=G.starts[0];const hs=[0,1,2].map(i=>spawnUnit('hopl',0,(s[0]+4+i)*TS,(s[1]+5)*TS));SEL=hs.map(u=>u.id);updHUD(true)});await pg.waitForTimeout(900);
 await pg.tap('#grp .add');await pg.waitForTimeout(600);await pg.evaluate(()=>{SEL=[];updHUD(true)});await pg.waitForTimeout(600);
 console.log(await pg.evaluate(()=>$('grp').innerText+' sel='+SEL.length));await pg.tap('#grp button');await pg.waitForTimeout(600);console.log('após tocar na bandeira sel=',await pg.evaluate(()=>SEL.length));
 await pg.screenshot({path:'/home/claude/trab/grp.png'});console.log('ERROS',errs);await b.close()})();
