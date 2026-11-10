
// =========================================================
//   PACOTE RISE (v13): Biblioteca e linhas de pesquisa, Caravanas e rotas de comércio,
//   Mercadores e recursos raros, Ruínas, Impostos, Forte, General e Carroça de Suprimentos.
//   Nomes e desenhos originais; as ideias vêm do Rise of Nations.
// =========================================================

// ---------- prédios e unidades novas ----------
BT.biblioteca={n:'Biblioteca',sz:3,hp:450,cost:{wood:125},t:40,age:0,los:3,pg:0,h:60};
BT.forte={n:'Forte',sz:3,hp:1400,cost:{wood:150,gold:200},t:70,age:2,los:8,pg:1,shoot:{atk:4,rng:7,cd:1.6},train:['general','carroca'],h:72};
BT.mercado.train=['caravana','mercador'];
UT.caravana={n:'Caravana',hp:70,atk:0,arm:1,rng:0,spd:1.35,cd:1,los:4,cost:{food:60,wood:40},t:20,age:1,at:'mercado',cls:'merc',civ:1,spr:[70,58,35,50]};
UT.mercador={n:'Mercador',hp:30,atk:0,arm:0,rng:0,spd:1.3,cd:1,los:5,cost:{food:50,wealth:20},t:16,age:1,at:'mercado',cls:'merc',civ:1,spr:[46,64,23,58]};
UT.general={n:'General',hp:160,atk:9,arm:2,rng:0,spd:1.4,cd:1.4,los:7,cost:{food:120,wealth:120},t:35,age:2,at:'forte',cls:'inf',gen:1,spr:[46,64,23,58]};
UT.carroca={n:'Carroça de Suprimentos',hp:120,atk:0,arm:1,rng:0,spd:1.2,cd:1,los:5,cost:{food:70,wood:80},t:25,age:2,at:'forte',cls:'merc',civ:1,spr:[70,58,35,50]};
ECO.splice(ECO.indexOf('mercado')+1,0,'biblioteca');
MIL.splice(MIL.indexOf('torre'),0,'forte');
AGEREQ[1].push('biblioteca');

// ---------- linhas de pesquisa da Biblioteca (como as do Rise) ----------
const LINES={
  cvc:{n:'Cívica',ic:'🏛️',d:'+1 cidade no limite · fronteira +1 · impostos: cada cidade rende riqueza'},
  com:{n:'Comércio',ic:'⚖️',d:'coleta de tudo +5% · caravanas e mercadores +20%'},
  sci:{n:'Ciência',ic:'🔭',d:'pesquisas, eras e Organização Militar 10% mais rápidas'}};
const LN_N=4,LN_AGE=[0,1,2,3],LN_T=[30,40,50,60];
const LN_COST=[{food:90,wood:60},{food:120,know:60},{food:180,know:140},{food:240,know:240,wealth:120}];
const lvl=(o,k)=>(G.P[o]&&G.P[o][k])||0;
function cityMax(o){return CITY_MAX-1+lvl(o,'cvc')}   // começa com 3 e vai até 7
function sciMul(o){return 1-.1*lvl(o,'sci')}
function lineCan(o,k){const v=lvl(o,k),P=G.P[o];if(v>=LN_N)return'Linha completa';if(G.B.some(b=>!b.dead&&b.o===o&&b.q.includes('ln:'+k)))return'Já está pesquisando';
  if(P.age<LN_AGE[v])return'Requer '+AGES[LN_AGE[v]];if(!afford(o,LN_COST[v]))return'Faltam recursos: '+costTxt(LN_COST[v]);return null}
// tempo e custo: pesquisas ficam mais rápidas com a Ciência
const itemTime0=itemTime;
itemTime=function(b,it){if(it.startsWith('ln:'))return LN_T[lvl(b.o,it.slice(3))]*sciMul(b.o);const t=itemTime0(b,it);return(it==='age'||it==='mil'||it.startsWith('t:'))?t*sciMul(b.o):t};
const itemCost0=itemCost;
itemCost=function(p,it){if(it.startsWith('ln:'))return LN_COST[lvl(p,it.slice(3))];return itemCost0(p,it)};
// fim da pesquisa de uma linha
function lineDone(b,it){const k=it.slice(3),P=G.P[b.o];P[k]=lvl(b.o,k)+1;b.q.shift();b.qt=0;b.wait=false;if(k==='cvc')domDirty=true;
  if(b.o===0){toast(LINES[k].ic+' '+LINES[k].n+' '+ROMAN[P[k]]+' concluída: '+LINES[k].d);snd('done')}}

// ---------- recursos raros (precisam de um Mercador e estar dentro da sua fronteira) ----------
const RARE={
  cavalos:{n:'Cavalos',ic:'🐎',d:'Cavalaria 10% mais rápida'},
  uvas:{n:'Vinhedos',ic:'🍇',d:'Comida +8%'},
  sal:{n:'Sal',ic:'🧂',d:'Caça e pesca +15%'},
  cedro:{n:'Cedros',ic:'🌲',d:'Madeira +10%'},
  gemas:{n:'Gemas',ic:'💎',d:'Metal +10%'},
  marmore:{n:'Mármore',ic:'🪨',d:'Mercados rendem +50% de riqueza'},
  seda:{n:'Seda',ic:'🧵',d:'Caravanas +25%'},
  ervas:{n:'Ervas',ic:'🌿',d:'Tropas se curam devagar dentro da sua fronteira'}};
let RAREON=[{},{}];// reposto com tamanho NP a cada ronTick
function rareGath(o,cat){const R=RAREON[o]||{};let m=1;
  if(R.uvas&&(cat==='food'||cat==='farm'||cat==='hunt'))m*=1.08;
  if(R.sal&&(cat==='hunt'||cat==='fish'||cat==='fishb'))m*=1.15;
  if(R.cedro&&cat==='wood')m*=1.1;if(R.gemas&&cat==='gold')m*=1.1;return m}
function ronGath(o,cat){return o>=NP?1:(1+.05*lvl(o,'com'))*rareGath(o,cat)}
function ronSpd(u){let m=1;if(u.haste>G.t)m*=1.4;if(u.o<NP&&RAREON[u.o]&&RAREON[u.o].cavalos){const c=UT[u.type].cls;if(c==='cav'||c==='arqcav')m*=1.1}return m}

// ---------- mapa: recursos raros e ruínas ----------
function ronMap(){
  G.rare=[];G.ruins=[];const st=G.starts;
  const free=(x,y)=>inMap(x,y)&&x>2&&y>2&&x<MW-3&&y<MH-3&&!G.terr[idx(x,y)]&&!occ[idx(x,y)]&&pass[idx(x,y)];
  const farFrom=(x,y,L,d)=>L.every(p=>hyp(p.x-x,p.y-y)>=d);
  const kinds=Object.keys(RARE).sort(()=>RNG()-.5);let ki=0;
  const place=(cx,cy,r0,r1,list,mk,minSep)=>{for(let k=0;k<160;k++){const a=RNG()*6.283,r=r0+RNG()*(r1-r0),x=Math.round(cx+Math.cos(a)*r),y=Math.round(cy+Math.sin(a)*r);
      if(!free(x,y)||!farFrom(x,y,G.rare.concat(G.ruins),minSep)||!st.every(s=>hyp(s[0]-x,s[1]-y)>=7))continue;list.push(mk(x,y));return true}return false};
  // 2 raros perto de cada jogador (o mesmo tipo dos dois lados, para ser justo) e 3 no meio
  for(let i=0;i<2;i++){const kind=kinds[ki++%kinds.length];for(const s of st)place(s[0],s[1],9,15,G.rare,(x,y)=>({x,y,kind,w:0}),5)}
  const SC=MW/72;
  for(let i=0;i<Math.round(3*SC*SC);i++)place(MW/2,MH/2,0,16*SC,G.rare,(x,y)=>({x,y,kind:kinds[ki++%kinds.length],w:0}),7);
  // ruínas: longe das bases, espalhadas
  for(let i=0;i<Math.round(7*SC*SC);i++)place(MW/2,MH/2,6*SC,30*SC,G.ruins,(x,y)=>({x,y,done:0}),9);
}
const newGame0=newGame;
newGame=function(o){newGame0(o);try{ronMap()}catch(e){G.rare=G.rare||[];G.ruins=G.ruins||[]}};

// prêmio de ruína
function ruinLoot(r,u){r.done=1;r.by=u.o;const o=u.o,P=G.P[o],roll=RNG();let msg;
  if(roll<.2){P.res.food+=200;msg='+200 de comida'}
  else if(roll<.4){P.res.wood+=200;msg='+200 de madeira'}
  else if(roll<.58){P.res.gold+=150;msg='+150 de metal'}
  else if(roll<.72){P.res.wealth+=120;P.res.know+=40;msg='+120 de riqueza e +40 de conhecimento'}
  else if(roll<.86){if(o===0){for(let y=-14;y<=14;y++)for(let x=-14;x<=14;x++)if(x*x+y*y<=196&&inMap(r.x+x,r.y+y))G.exp[idx(r.x+x,r.y+y)]=1;mmDirty=true}msg='um mapa antigo: a região em volta foi revelada'}
  else{const v=spawnUnit('bat',o,(r.x+.5)*TS,(r.y+1.5)*TS);P.pop++;msg='um Batedor se juntou ao seu povo'}
  if(o===0){toast('🏺 Ruínas exploradas! Você ganhou '+msg);snd('done')}else if(vis[idx(r.x,r.y)])toast('🏺 O inimigo saqueou ruínas antigas');
  G.fx.push({k:'loot',x:(r.x+.5)*TS,y:(r.y+.5)*TS,t:0})}

// ---------- comportamento das unidades novas ----------
function homeMarket(u){let m=u.mk&&E.get(u.mk);if(m&&!m.dead&&m.o===u.o&&m.done>=1)return m;let best=null,bd=1e9;
  for(const b of G.B){if(b.dead||b.o!==u.o||b.type!=='mercado'||b.done<1)continue;const c=ctr(b),d=hyp(c.x-u.x,c.y-u.y);if(d<bd){bd=d;best=b}}u.mk=best?best.id:0;return best}
function tradeDest(u,m){const mc=ctr(m);let best=null,bd=10*TS;
  for(const b of G.B){if(b.dead||b.o!==u.o||b===m||b.done<1||b.down||(b.type!=='tc'&&b.type!=='mercado'))continue;const c=ctr(b),d=hyp(c.x-mc.x,c.y-mc.y);if(d>bd){bd=d;best=b}}return best}
function caravanThink(u,dt){
  const m=homeMarket(u);if(!m){u.st='idle';return}
  if(!u.tr||!E.get(u.tr.b)||E.get(u.tr.b).dead){const d=tradeDest(u,m);if(!d){if(u.o===0&&!u.warn){u.warn=1;toast('🐫 A caravana precisa de uma 2ª cidade ou Mercado longe (10+ quadrados) para fazer rota')}u.st='idle';return}
    u.tr={a:m.id,b:d.id,leg:1}}
  const tg=E.get(u.tr.leg?u.tr.b:u.tr.a);if(!tg||tg.dead){u.tr=null;return}
  if(u.st!=='trade'||!u.goal){u.st='trade';const c=ctr(tg);setGoal(u,{x:c.x,y:c.y+TS*1.6})}
  const c=ctr(tg);if(hyp(c.x-u.x,c.y-u.y)<tg.sz*TS*.75+TS*1.4||moveAlong(u,dt)){
    if(hyp(c.x-u.x,c.y-u.y)<tg.sz*TS*.75+TS*2.6){const a=ctr(E.get(u.tr.a)||tg),b=ctr(E.get(u.tr.b)||tg),dist=hyp(a.x-b.x,a.y-b.y)/TS;
      const g=(2+dist*.55)*(1+.2*lvl(u.o,'com'))*(RAREON[u.o].seda?1.25:1);G.P[u.o].res.wealth+=g;G.st.gath[u.o]+=g;if(u.o===0)incAdd('wealth',g);
      if(u.o===0&&vis[tileOf(u.x,u.y)]){G.fx.push({k:'coin',x:u.x,y:u.y,t:0,v:Math.round(g)});snd('coin',u)}}
    u.tr.leg^=1;u.goal=null;u.mv=false;u.st='trade'}
}
function merchantThink(u,dt){
  let r=u.rare!=null?G.rare[u.rare]:null;
  const okR=x=>x&&DOM[idx(x.x,x.y)]===u.o&&(!x.w||x.w===u.id||!E.get(x.w)||E.get(x.w).dead||E.get(x.w).rare!==G.rare.indexOf(x));
  if(!okR(r)){r=null;u.rare=null;let bd=40*TS;G.rare.forEach((x,i)=>{if(!okR(x))return;const d=hyp((x.x+.5)*TS-u.x,(x.y+.5)*TS-u.y);if(d<bd){bd=d;r=x;u.rare=i}});
    if(!r){if(u.st==='rare'){u.st='idle';if(u.o===0)toast('🧺 O mercador não achou recurso raro livre dentro da sua fronteira')}return}}
  r.w=u.id;const tx=(r.x+.5)*TS,ty=(r.y+1.4)*TS;
  if(hyp(tx-u.x,ty-u.y)>TS*1.2){if(u.st!=='rare'||!u.goal){u.st='rare';setGoal(u,{x:tx,y:ty})}if(moveAlong(u,dt)){u.goal=null;u.mv=false}return}
  u.st='rare';u.mv=false;u.work=true;u.an+=dt*4;faceTo(u,tx,ty-TS);
  const g=.45*dt*(1+.2*lvl(u.o,'com'));G.P[u.o].res.wealth+=g;G.st.gath[u.o]+=g;if(u.o===0)incAdd('wealth',g)}
const updUnit0=updUnit;
updUnit=function(u,dt){
  const T=UT[u.type];
  if(u.type==='caravana'&&(u.st==='idle'||u.st==='trade')){if(u.cd>0)u.cd-=dt;u.work=false;caravanThink(u,dt);return}
  if(u.type==='mercador'&&(u.st==='idle'||u.st==='rare')){if(u.cd>0)u.cd-=dt;u.work=false;merchantThink(u,dt);return}
  if(T.civ&&u.st==='idle'){u.work=false;return}   // carroça e outros civis não atacam ninguém
  updUnit0(u,dt)};

// ---------- tique do pacote: auras, cura, impostos, ruínas, raros ----------
let ronAcc=0;
function ronTick(dt){
  if(!G.rare){G.rare=[];G.ruins=[]}
  // impostos: cada cidade rende riqueza conforme a Cívica
  for(let o=0;o<NP;o++){const c=lvl(o,'cvc');if(!c)continue;const n=G.B.filter(b=>!b.dead&&b.o===o&&b.type==='tc'&&b.done>=1&&!b.down).length;const g=n*5*c*dt/60;G.P[o].res.wealth+=g;if(o===0)incAdd('wealth',g)}
  ronAcc+=dt;if(ronAcc<.5)return;const st=ronAcc;ronAcc=0;
  // raros ativos
  RAREON=[];for(let p=0;p<NP;p++)RAREON.push({});for(const r of G.rare){const w=r.w&&E.get(r.w);if(w&&!w.dead&&w.type==='mercador'&&w.st==='rare'&&!w.mv&&DOM[idx(r.x,r.y)]===w.o&&hyp((r.x+.5)*TS-w.x,(r.y+1.4)*TS-w.y)<TS*1.6)RAREON[w.o][r.kind]=1}
  // general: aura de coragem; carroça: cura e protege do atrito
  for(const a of G.U){if(a.dead||a.inT||a.o>=NP)continue;
    if(a.type==='general'){for(const u of G.U){if(u.dead||u.o!==a.o||u===a||!isMil(u))continue;if(hyp(u.x-a.x,u.y-a.y)<5*TS)u.aura=G.t+.7}}
    else if(a.type==='carroca'){for(const u of G.U){if(u.dead||u.o!==a.o||u.inT||u===a||isNav(u))continue;if(hyp(u.x-a.x,u.y-a.y)<6*TS){u.sup=G.t+.7;u.att=0;const mh=ST(u).hp;if(u.hp<mh)u.hp=Math.min(mh,u.hp+1.5*st)}}}}
  // ervas: cura lenta dentro da fronteira
  for(let o=0;o<NP;o++)if(RAREON[o].ervas)for(const u of G.U){if(u.dead||u.o!==o||u.inT)continue;if(DOM[tileOf(u.x,u.y)]===o){const mh=ST(u).hp;if(u.hp<mh)u.hp=Math.min(mh,u.hp+.3*st)}}
  // ruínas: o primeiro que chegar leva o prêmio
  for(const r of G.ruins){if(r.done)continue;const x=(r.x+.5)*TS,y=(r.y+.5)*TS;for(const u of G.U){if(u.dead||u.inT||u.o>=NP||isNav(u))continue;if(Math.abs(u.x-x)<TS*1.5&&Math.abs(u.y-y)<TS*1.5){ruinLoot(r,u);break}}}
}
// general: marcha forçada (tropas perto andam 40% mais rápido por 12 s; espera 60 s)
function forcedMarch(g){if(g.abT>G.t)return false;g.abT=G.t+60;for(const u of G.U){if(u.dead||u.o!==g.o||!isMil(u))continue;if(hyp(u.x-g.x,u.y-g.y)<6*TS)u.haste=G.t+12}
  if(g.o===0){toast('📯 Marcha forçada! Tropas perto do General 40% mais rápidas por 12 s');snd('alert',g)}return true}

// ---------- IA usa o pacote também ----------
function ronAI(p,blds,has,any,build,htx,hty,toward,vills,army,res){
  const P=G.P[p],lib=blds.find(b=>b.type==='biblioteca'&&b.done>=1),mk=blds.find(b=>b.type==='mercado'&&b.done>=1),fo=blds.find(b=>b.type==='forte'&&b.done>=1);
  const mine=G.U.filter(u=>!u.dead&&u.o===p);const cnt=t=>mine.filter(u=>u.type===t).length+blds.reduce((s,b)=>s+b.q.filter(q=>q===t).length,0);
  if(vills.length>=9&&!any('biblioteca'))build('biblioteca',htx,hty,4,12);
  if(P.age>=2&&vills.length>=18&&!any('forte')&&afford(p,BT.forte.cost))build('forte',toward.x,toward.y,6,14);
  // linhas: Cívica quando a cidade bate no limite; senão Comércio e Ciência
  if(lib&&!lib.q.length&&vills.length>=12&&P.age>=1&&G.diff!=='facil'&&!(P.age<MAXAGE&&blds.some(b=>b.q.includes('age')))){const cities=blds.filter(b=>b.type==='tc').length;
    const order=cities>=cityMax(p)-1?['cvc','com','sci']:['com','cvc','sci'];for(const k of order){if(lineCan(p,k))continue;const c=LN_COST[lvl(p,k)];const ag=P.age<3?AGECOST[P.age+1]:{food:0,gold:0};if(res.food<c.food+150+(ag.food||0)*.5||(c.gold&&res.gold<c.gold+(ag.gold||0)*.5))continue;pay(p,c);lib.q.push('ln:'+k);break}}
  const cities=blds.filter(b=>b.type==='tc'&&b.done>=1).length;
  if(mk&&mk.q.length<2&&cities>=2&&cnt('caravana')<Math.min(6,cities+1)&&afford(p,costOf(p,'caravana'))&&P.pop+2<P.cap){pay(p,costOf(p,'caravana'));mk.q.push('caravana')}
  const freeRare=G.rare.filter(r=>DOM[idx(r.x,r.y)]===p).length;
  if(mk&&mk.q.length<2&&cnt('mercador')<freeRare&&afford(p,costOf(p,'mercador'))&&P.pop+2<P.cap){pay(p,costOf(p,'mercador'));mk.q.push('mercador')}
  if(fo&&!fo.q.length&&army.length>=8&&cnt('general')<1&&afford(p,costOf(p,'general'))){pay(p,costOf(p,'general'));fo.q.push('general')}
  if(fo&&!fo.q.length&&army.length>=10&&cnt('carroca')<1&&afford(p,costOf(p,'carroca'))){pay(p,costOf(p,'carroca'));fo.q.push('carroca')}
  // carroça e general acompanham o exército
  if(army.length&&(G.t|0)%6===0){const c=army.reduce((a,u)=>({x:a.x+u.x/army.length,y:a.y+u.y/army.length}),{x:0,y:0});
    for(const u of mine){if(u.type==='carroca'&&(u.st==='idle'||u.st==='move')&&hyp(u.x-c.x,u.y-c.y)>4*TS)orderMove(u,c.x,c.y);
      if(u.type==='general'){if(u.st==='idle'&&hyp(u.x-c.x,u.y-c.y)>4*TS)orderMove(u,c.x,c.y);if(army.some(a=>a.st==='attack'))forcedMarch(u)}}}
}
