const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const pg=await b.newPage({viewport:{width:800,height:360},deviceScaleFactor:2,hasTouch:true});
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(300);
 const info=await pg.evaluate(()=>{__RA.newGame({civ:'gregos',map:'terra',diff:'normal',size:'med'});__RA.startGame();OPT.snd=false;OPT.mus=false;for(let i=0;i<N;i++)G.exp[i]=1;
   // árvores encostadas em raros/ruínas?
   let perto=0;for(const r of G.R){if(r.dead||r.sub!=='tree')continue;for(const p of G.rare.concat(G.ruins)){const dx=r.tx-p.x,dy=r.ty-p.y;if(Math.hypot(dx,dy)<=1.6||(dx>=0&&dy>=0&&dx+dy<=3))perto++}}
   const s=G.starts[0];let r=G.rare.slice().sort((a,b)=>Math.hypot(a.x-s[0],a.y-s[1])-Math.hypot(b.x-s[0],b.y-s[1]))[0];
   for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)DOM[idx(r.x+dx,r.y+dy)]=0;
   const m=spawnUnit('mercador',0,(r.x+.5)*TS,(r.y+1.4)*TS);m.st='rare';m.rare=G.rare.indexOf(r);
   const m2=spawnUnit('mercador',0,(r.x+3)*TS,(r.y+3)*TS);
   Z=1.1;centerOn((r.x+.5)*TS,(r.y+.5)*TS);window.__r=r;return{perto,rare:[r.x,r.y,r.kind]}});
 console.log(JSON.stringify(info));
 for(let i=0;i<30;i++){await pg.evaluate(()=>{for(let k=0;k<4;k++)__RA.step(.05);const r=__r;DOM[idx(r.x,r.y)]=0});await pg.waitForTimeout(30)}
 await pg.waitForTimeout(800);await pg.screenshot({path:'/home/claude/trab/raro69.png'});
 console.log(await pg.evaluate(()=>JSON.stringify(RAREON[0])),'ERROS',errs.slice(0,5));await b.close()})();
