const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const pg=await b.newPage({viewport:{width:900,height:420}});pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});
 const r=await pg.evaluate(()=>{__RA.newGame({civ:'gregos',map:'terra',diff:'facil',size:'med'});__RA.startGame();OPT.snd=false;window.aiTick=function(){};const out={};
  const s=G.starts[0];for(let i=0;i<N;i++)G.exp[i]=1;Z=1;
  // fila: 3 etapas
  const h=spawnUnit('hopl',0,(s[0]+4)*TS,(s[1]+6)*TS);SEL=[h.id];UI.chain=1;
  const pts=[[s[0]+8,s[1]+6],[s[0]+8,s[1]+10],[s[0]+4,s[1]+10]];
  for(const[x,y]of pts){centerOn(x*TS,y*TS);const p=w2s((x+.5)*TS,(y+.5)*TS);clickAt(p.x,p.y,false)}
  out.fila=h.oq?h.oq.length:0;const vis=[];
  for(let i=0;i<20*20;i++){__RA.step(.05);if(i%20===0)vis.push((h.x/TS).toFixed(0)+','+(h.y/TS).toFixed(0))}
  out.caminho=[...new Set(vis)].join(' ');out.final=[(h.x/TS).toFixed(1),(h.y/TS).toFixed(1)];out.esperado=pts[2];
  UI.chain=0;
  // muralha + portão
  const up=s[1]>MH/2;const wy=up?s[1]-9:s[1]+9,sg=up?-1:1;const ws=[];for(let x=s[0]-4;x<=s[0]+8;x++){const i=idx(x,wy);if(occ[i]){const e=E.get(occ[i]);if(e&&e.k==='r'){e.dead=true;E.delete(e.id);occ[i]=0;pass[i]=1}}ws.push(placeBld('muralha',0,x,wy,true))}
  // parede cobrindo de lado a lado do mapa para o teste
  for(let x=1;x<MW-1;x++){if(x>=s[0]-4&&x<=s[0]+8)continue;const i=idx(x,wy);if(occ[i]){const e=E.get(occ[i]);if(e&&e.k==='r'){e.dead=true;E.delete(e.id);occ[i]=0}}if(G.terr[i]!==1){occ[i]=999999;pass[i]=0}}
  G.P[0].res.wood=500;G.P[0].res.gold=500;
  const mid=ws[6];SEL=[mid.id];const cs=getCmds();out.botoesMuralha=cs.map(c=>c.nm).join('|');
  cs.find(c=>c.nm==='Fazer portão').act();out.gates=G.gates.length;
  G.P[0].auto=0;const v=spawnUnit('hopl',0,(s[0]+2)*TS,(wy-3*sg)*TS);orderMove(v,(s[0]+2.5)*TS,(wy+4*sg)*TS);
  const en=spawnUnit('guer',1,(s[0]+2)*TS,(wy+5*sg)*TS);orderMove(en,(s[0]+2.5)*TS,(wy-4*sg)*TS);
  for(let i=0;i<20*25;i++)__RA.step(.05);
  out.vill=[v.st,(v.x/TS).toFixed(1),(v.y/TS).toFixed(1),v.pok,wy];out.aldeaoPassou=sg>0?v.y>(wy+1)*TS:v.y<wy*TS;out.inimigoPassou=sg>0?en.y<wy*TS:en.y>(wy+1)*TS;out.inimigoSt=en.st;
  // reparar
  const tc=G.B.find(b=>b.o===0&&b.type==='tc');tc.hp=tc.mhp*.5;SEL=[tc.id];const c2=getCmds();out.botoesTC=c2.map(c=>c.nm).slice(0,4).join('|');c2.find(c=>c.nm==='Reparar').act();
  for(let i=0;i<20*30;i++)__RA.step(.05);out.tcHp=(tc.hp/tc.mhp).toFixed(2);
  return out});
 console.log(JSON.stringify(r,null,1));
 await pg.evaluate(()=>{const g=E.get(G.gates[0]);centerOn((g.tx+.5)*TS,(g.ty+.5)*TS);Z=1.6;SEL=[g.id];updHUD(true)});await pg.waitForTimeout(600);await pg.screenshot({path:'/home/claude/trab/portao.png'});
 console.log('ERROS',errs);await b.close()})();
