const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:800,height:360},deviceScaleFactor:1.5});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(300);
 const r=await pg.evaluate(()=>{const out={};__RA.newGame({civ:'gregos',map:'terra',size:'gra',np:3,diff:'normal'});__RA.startGame();running=true;paused=false;OPT.snd=false;
  const P=G.P[0];P.age=3;Object.assign(P.res,{food:5000,wood:5000,gold:5000,wealth:2000,know:2000});
  const tc=G.B.find(b=>b.o===0&&b.type==='tc');const q=placeBld('quartel',0,tc.tx+6,tc.ty+6,true);q.done=1;
  const g1=spawnUnit('guer',0,(tc.tx+5)*TS,(tc.ty+9)*TS),a1=spawnUnit('arq',0,(tc.tx+6)*TS,(tc.ty+9)*TS);g1.hp=20;
  q.q.push('guer','arq');
  out.canMosq=canTrain(q,'mosq');out.canEspa=canTrain(q,'espa');
  q.q.unshift('t:up_espa');for(let i=0;i<4*60;i++)step(.25);
  out.after=g1.type+' hp'+Math.round(g1.hp)+'/'+STAT[0].espa.hp+' arq='+a1.type+' q='+q.q.join(',');
  out.canGuer=canTrain(q,'guer');
  SEL=[q.id];out.cmds=getCmds().map(c=>c.nm+(c.up?'⏫':'')).join(' | ');
  P.techs.push('up_arqc');recompute(0);P.techs.push('up_mosq');recompute(0);out.arqNow=a1.type;
  const n=spawnUnit('arq',0,(tc.tx+7)*TS,(tc.ty+9)*TS);out.spawned=n.type;
  // fábrica
  P.age=5;const of=placeBld('oficina',0,tc.tx-8,tc.ty+6,true);of.done=1;for(let i=0;i<8;i++)step(.25);out.ofi=of.type;
  // dízimo
  const t=placeBld('templo',0,tc.tx+10,tc.ty-6,true);t.done=1;P.techs.push('dizimo');const w0=P.res.wealth;for(let i=0;i<4*30;i++)step(.25);out.diz=Math.round(P.res.wealth-w0);
  SEL=[q.id];return out});
 console.log(JSON.stringify(r,null,1));await pg.evaluate(()=>{running=false;UI.sig='';updHUD(true)});await pg.waitForTimeout(400);await pg.screenshot({path:'arv_q.png'});
 console.log('ERROS',errs.slice(0,4));await b.close()})();
