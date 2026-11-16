const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const pg=await b.newPage({viewport:{width:800,height:360}});pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});
 const r=await pg.evaluate(()=>{__RA.newGame({civ:'gregos',map:'terra',diff:'facil',size:'med'});__RA.startGame();OPT.snd=false;
  window.aiTick=function(){};
  const s=G.starts[0],X=(s[0]+8)*TS,Y=(s[1]+8)*TS;const out={};
  // caso 1: soldados parados, inimigo passa a 5 tiles
  const mine=[0,1,2].map(i=>spawnUnit('hopl',0,X+i*TS*.6,Y));
  const vil=spawnUnit('vill',0,X+5*TS,Y+2*TS);
  const en=spawnUnit('guer',1,X+9*TS,Y+3*TS);orderAttack(en,vil);
  for(let i=0;i<20*8;i++)__RA.step(.05);
  out.caso1={meus:mine.map(u=>u.st+(u.tg===en.id?'→inimigo':'')),inimigoVivo:!en.dead,vilVivo:!vil.dead,vilhp:vil.hp,enSt:en.st,enTg:en.tg===vil.id,dist:mine.map(u=>(hyp(u.x-en.x,u.y-en.y)/TS).toFixed(1)),vilDist:(hyp(vil.x-en.x,vil.y-en.y)/TS).toFixed(1),dom:DOM[tileOf(en.x,en.y)]};
  // caso 2: soldados que chegaram de uma ordem de mover
  const m2=[0,1].map(i=>spawnUnit('hopl',0,X-10*TS+i*TS,Y));m2.forEach(u=>orderMove(u,X-6*TS,Y));for(let i=0;i<20*6;i++)__RA.step(.05);
  const en2=spawnUnit('arq',1,X-3*TS,Y+TS);for(let i=0;i<20*6;i++)__RA.step(.05);
  out.caso2={meus:m2.map(u=>u.st+(u.tg===en2.id?'→inimigo':'')),inimigoVivo:!en2.dead,hp:en2.hp};
  return out});
 console.log(JSON.stringify(r,null,1));console.log('ERROS',errs);await b.close()})();
