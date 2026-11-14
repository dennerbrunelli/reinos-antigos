const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const pg=await b.newPage({viewport:{width:800,height:360},deviceScaleFactor:2,hasTouch:true});
 pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(500);
 const r=await pg.evaluate(()=>{__RA.newGame({civ:'russos',map:'terra',diff:'facil',size:'gig',np:8});__RA.startGame();OPT.snd=false;OPT.mus=false;running=true;paused=false;
   for(let i=0;i<20*480;i++)__RA.step(.05);
   const S=G.st;return {tl:S.tl.length,gt0:S.gt[0],army:S.army,vmax:S.vmax,ageT:S.ageT.map(a=>a.length),sc:G.P.map((_,p)=>scoreOf(p).tot)}});
 console.log(JSON.stringify(r));
 await pg.evaluate(()=>endGame(true,'Você derrotou todos os reinos inimigos!'));await pg.waitForTimeout(500);
 for(const k of['res','mil','eco','tec','tl']){await pg.evaluate(k=>{PL_TAB=k;plRender()},k);await pg.waitForTimeout(250);await pg.screenshot({path:'/home/claude/trab/pl_'+k+'.png'})}
 const fit=await pg.evaluate(()=>{const t=$('endt').getBoundingClientRect(),bt=$('bend').getBoundingClientRect();return{tTop:t.top,btBot:bt.bottom,vh:innerHeight}});
 console.log(JSON.stringify(fit));console.log('ERROS',errs.slice(0,6));await b.close()})();
