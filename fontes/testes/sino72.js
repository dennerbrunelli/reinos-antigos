const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const pg=await b.newPage({viewport:{width:800,height:360}});pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});
 const r=await pg.evaluate(()=>{__RA.newGame({civ:'gregos',map:'terra',diff:'facil',size:'med'});__RA.startGame();OPT.snd=false;window.aiTick=function(){};const out={};
  for(let i=0;i<20*20;i++)__RA.step(.05);
  const tc=G.B.find(b=>b.o===0&&b.type==='tc');const vs=G.U.filter(u=>u.o===0&&u.type==='vill');out.antes=vs.map(u=>u.st);
  SEL=[tc.id];const c1=getCmds();out.botao1=c1[0].nm;c1[0].act();
  for(let i=0;i<20*20;i++)__RA.step(.05);out.abrigados=vs.filter(u=>u.inT).length+'/'+vs.length;
  SEL=[tc.id];const c2=getCmds();out.botao2=c2[0].nm;c2[0].act();
  for(let i=0;i<20*15;i++)__RA.step(.05);out.depois=vs.map(u=>u.st);out.dentro=vs.filter(u=>u.inT).length;
  // explorar
  const sc=G.U.find(u=>u.o===0&&u.type==='bat')||spawnUnit('bat',0,tc.tx*TS,(tc.ty+4)*TS);
  const exp0=G.exp.reduce((a,b)=>a+(b?1:0),0);cmdScout([sc]);let idle=0;
  const lg=[];for(let i=0;i<20*180;i++){__RA.step(.05);if(sc.st==='idle'&&!sc.explore)idle++;if(i%400===0)lg.push([sc.st,sc.explore,(sc.x/TS).toFixed(0),(sc.y/TS).toFixed(0),sc.exT,sc.exBad&&sc.exBad.size,pass[tileOf(sc.x,sc.y)]].join(','))}out.lg=lg;
  out.explorado=[exp0,G.exp.reduce((a,b)=>a+(b?1:0),0),N];out.batedor=[sc.st,sc.explore,sc.dead];out.tempoParado=(idle/20).toFixed(0)+'s';
  // atacar e avançar
  const h=[0,1,2].map(i=>spawnUnit('hopl',0,(tc.tx+5+i)*TS,(tc.ty+5)*TS));const en=spawnUnit('guer',1,(tc.tx+12)*TS,(tc.ty+12)*TS);
  UI.aim={kind:'amove',ids:h.map(u=>u.id)};const p=w2s((tc.tx+20)*TS,(tc.ty+20)*TS);clickAt(p.x,p.y,false);
  for(let i=0;i<20*20;i++)__RA.step(.05);out.amove={en:en.dead?'morto':'vivo',st:h.map(u=>u.st)};
  return out});
 console.log(JSON.stringify(r,null,1));console.log('ERROS',errs);await b.close()})();
