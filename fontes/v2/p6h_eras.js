
// =========================================================
//   AS 7 ERAS: Pedra · Ferramentas · Bronze · Ferro · PÓLVORA · INDUSTRIAL · INTELIGÊNCIA ARTIFICIAL
//   Era 5 (Pólvora): Mosqueteiro, Canhão, Galeão
//   Era 6 (Industrial): Fuzileiro, Artilharia, Encouraçado, Fábrica, PETRÓLEO
//   Era 7 (IA): Soldado de Assalto, Tanque, Silo de Mísseis: Bomba nuclear (Relógio do Armagedom) e Pulso EMP
//   (desenhos feitos por código até chegar a arte do GPT/Gemini)
// =========================================================
// prédios que contam para avançar (2 de cada lista)
AGEREQ[4]=['universidade','forte','oficina','templo'];
AGEREQ[5]=['forte','universidade','mercado','academia'];
AGEREQ[6]=['fabrica','universidade','forte'];
// ---------- unidades novas ----------
const HM=[46,64,23,58];
Object.assign(UT,{
  mosq:{n:'Mosqueteiro',hp:70,atk:11,arm:1,rng:5,spd:1.1,cd:2.2,los:7,cost:{food:55,gold:45},t:20,age:4,at:'quartel',cls:'inf',pk:'g',gun:1,bon:{cav:4,elef:6},spr:HM},
  fuzil:{n:'Fuzileiro',hp:95,atk:16,arm:2,rng:6,spd:1.15,cd:1.9,los:8,cost:{food:70,gold:60},t:22,age:5,at:'quartel',cls:'inf',pk:'g',gun:1,bon:{cav:6,elef:8},spr:HM},
  assalto:{n:'Soldado de Assalto',hp:135,atk:24,arm:3,rng:6,spd:1.25,cd:1.4,los:9,cost:{food:80,gold:80,oil:20},t:24,age:6,at:'quartel',cls:'inf',pk:'g',gun:1,bon:{cav:8},spr:HM},
  canhao:{n:'Canhão',hp:150,atk:46,arm:1,rng:10,spd:.75,cd:5,los:11,cost:{wood:150,gold:150},t:32,age:4,at:'oficina',cls:'cerco',splash:1,pk:'s',gun:1,bon:{bld:60},spr:[72,56,36,48]},
  artilharia:{n:'Artilharia',hp:180,atk:62,arm:2,rng:12,spd:.85,cd:4.5,los:12,cost:{gold:200,oil:50},t:34,age:5,at:'fabrica',cls:'cerco',splash:1.5,pk:'s',gun:1,bon:{bld:70},spr:[76,58,38,50]},
  tanque:{n:'Tanque',hp:620,atk:40,arm:6,rng:7,spd:1.55,cd:2.4,los:9,cost:{gold:250,oil:150},t:40,age:6,at:'fabrica',cls:'tanque',splash:.8,pk:'s',gun:1,bon:{bld:30,inf:8},spr:[88,66,44,56]},
  galeao:{n:'Galeão',hp:330,atk:14,arm:2,rng:8,spd:1.7,cd:2,los:9,cost:{wood:220,gold:80},t:38,age:4,at:'doca',cls:'navio',naval:1,war:1,pk:'s',gun:1,spr:[112,104,56,78]},
  encour:{n:'Encouraçado',hp:540,atk:26,arm:4,rng:9,spd:1.9,cd:2.2,los:10,cost:{gold:250,oil:80},t:42,age:5,at:'doca',cls:'navio',naval:1,war:1,pk:'s',gun:1,spr:[116,90,58,66]},
});
BT.quartel.train.push('mosq','fuzil','assalto');
BT.oficina.train.push('canhao');
BT.doca.train.push('galeao','encour');
// ---------- prédios novos ----------
BT.fabrica={n:'Fábrica',sz:3,hp:900,cost:{wood:300,gold:200},t:60,age:5,los:5,pg:1,train:['artilharia','tanque'],h:74};
BT.silo={n:'Silo de Mísseis',sz:2,hp:1200,cost:{gold:600,oil:300,know:400},t:70,age:6,los:6,pg:1,h:64};
ECO.push('fabrica');MIL.push('silo');
Object.assign(ROLE,{mosq:'Arma de fogo: atira de longe e é forte contra cavalaria. Era da Pólvora.',fuzil:'Fuzileiro: mais alcance e dano que o mosqueteiro.',assalto:'Infantaria moderna: rápida e muito forte.',
  canhao:'Derruba prédios e muralhas de longe, com estilhaços.',artilharia:'Artilharia pesada: alcance enorme contra prédios e tropas juntas.',tanque:'Blindado: muita vida e armadura, atira com explosão.',
  galeao:'Navio de canhões da Era da Pólvora.',encour:'Navio de aço com torres de canhão (usa petróleo).'});
Object.assign(BDESC,{fabrica:'Indústria: treina Artilharia e Tanques.',silo:'Fabrica e lança a Bomba nuclear e o Pulso EMP. Cada bomba avança o Relógio do Armagedom: no fim, o mundo acaba e ninguém vence.'});
// ---------- petróleo: poças no mapa, coletado por aldeões a partir da Era Industrial ----------
const OIL_AGE=5;
function placeOil(){const S=MW/72,spots=[];const ok=(x,y)=>inMap(x,y)&&x>3&&y>3&&x<MW-4&&y<MH-4&&!G.terr[idx(x,y)]&&!occ[idx(x,y)]&&pass[idx(x,y)];
  const put=(x,y)=>{if(!ok(x,y))return false;const r={id:G.nid++,k:'r',rt:'oil',sub:'oil',tx:x,ty:y,amt:900,v:0};G.R.push(r);E.set(r.id,r);occ[idx(x,y)]=r.id;pass[idx(x,y)]=0;return true};
  const near=(cx,cy,r0,r1)=>{for(let k=0;k<200;k++){const a=RNG()*6.283,r=r0+RNG()*(r1-r0);if(put(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r)))return true}return false};
  for(const s of G.starts){near(s[0],s[1],7,11);near(s[0],s[1],10,15)}
  for(let i=0;i<Math.round(4*S*S);i++)near(MW/2,MH/2,0,18*S)}
const newGame4=newGame;
newGame=function(o){newGame4(o);try{placeOil()}catch(e){}G.arma=0};
window.__RA.newGame=newGame;
const canGather0=canGather;
canGather=function(u,r){if(r&&r.sub==='oil'&&u.type==='vill'&&G.P[u.o].age<OIL_AGE)return false;return canGather0(u,r)};
const orderGather0=orderGather;
orderGather=function(u,r){if(r&&r.sub==='oil'&&u.type==='vill'&&G.P[u.o].age<OIL_AGE){if(u.o===0)toast('🛢 Petróleo só na Era Industrial');return false}return orderGather0(u,r)};
// ---------- Silo: fabricar e lançar ----------
const NUKE_COST={gold:1500,oil:1000,know:1000,wealth:800},EMP_COST={gold:500,oil:400,know:400},ARMA_MAX=6;
const itemTime1=itemTime;itemTime=function(b,it){if(it==='nuke')return 60;if(it==='emp')return 30;return itemTime1(b,it)};
const itemCost1=itemCost;itemCost=function(p,it){if(it==='nuke')return NUKE_COST;if(it==='emp')return EMP_COST;return itemCost1(p,it)};
UI.target=null;
function launch(silo,kind,tx,ty){const k=kind==='nuke'?'nk':'ep';if(!(silo[k]>0))return false;silo[k]--;const c=ctr(silo);
  G.fx.push({k:'missile',x:c.x,y:c.y,sx:c.x,sy:c.y,tx,ty,t:0,T:kind==='nuke'?4.5:3,kind,o:silo.o});snd('catapult',c);
  if(kind==='nuke'){G.arma=(G.arma||0)+1;toast('☢️ Bomba nuclear lançada! Relógio do Armagedom: '+G.arma+'/'+ARMA_MAX);snd('alert')}
  else if(silo.o===0)toast('⚡ Pulso EMP lançado!');else toast('⚠️ O inimigo lançou um Pulso EMP!');
  if(silo.o!==0&&kind==='nuke'){UI.lastAlert={x:tx,y:ty,t:G.t}}
  return true}
function detonate(f){const R=(f.kind==='nuke'?6:8)*TS;
  if(f.kind==='nuke'){
    for(const u of G.U){if(u.dead||u.inT)continue;if(hyp(u.x-f.tx,u.y-f.ty)<R)kill(u,f.o)}
    for(const b of G.B){if(b.dead)continue;const c=ctr(b),d=hyp(c.x-f.tx,c.y-f.ty);if(d<R+b.sz*TS/2){const dm=b.mhp*(d<R*.5?1.2:.85);dealDmg({o:f.o,id:0},b,dm)}}
    for(const r of G.R){if(r.dead||r.walk||r.sub==='fish')continue;const c=ctr(r);if(hyp(c.x-f.tx,c.y-f.ty)<R*.8&&r.sub==='tree')kill(r)}
    G.fx.push({k:'nukefx',x:f.tx,y:f.ty,t:0});snd('boom',{x:f.tx,y:f.ty});setTimeout(()=>snd('collapse'),180);setTimeout(()=>snd('boom'),420);
    if(G.arma>=ARMA_MAX)setTimeout(()=>{if(G&&!G.over)endGame(false,'☢️ O Relógio do Armagedom chegou ao fim: o mundo foi destruído pelas bombas. Ninguém venceu.')},1500)}
  else{for(const u of G.U){if(u.dead||u.inT||u.o===GAIA)continue;if(hyp(u.x-f.tx,u.y-f.ty)<R){u.stun=G.t+20;u.mv=false;u.path=null}}
    for(const b of G.B){if(b.dead)continue;const c=ctr(b);if(hyp(c.x-f.tx,c.y-f.ty)<R)b.emp=G.t+20}
    G.fx.push({k:'nukefx',x:f.tx,y:f.ty,t:0,emp:1});snd('convert',{x:f.tx,y:f.ty})}}
// EMP: unidades e prédios ficam parados por 20 s
const updUnit3=updUnit;updUnit=function(u,dt){if(u.stun>G.t){u.mv=false;u.work=false;return}updUnit3(u,dt)};
const updBld0=updBld;updBld=function(b,dt){if(b.emp>G.t)return;updBld0(b,dt)};
const ronTick4=ronTick;
ronTick=function(dt){ronTick4(dt);for(const f of G.fx){if(f.k!=='missile'||f.boom)continue;const p=Math.min(1,f.t/f.T);f.x=f.sx+(f.tx-f.sx)*p;f.y=f.sy+(f.ty-f.sy)*p;if(f.t>=f.T){f.boom=1;detonate(f)}}};
// ---------- botões ----------
const getCmds5=getCmds;
getCmds=function(){const out=getCmds5();const e=selEnts()[0];if(!e||e.o!==0||e.k!=='b'||e.type!=='silo'||e.done<1)return out;
  const busy=k=>e.q.includes(k);
  out.push({img:nukeIcon('nuke',0),nm:'Fabricar Bomba nuclear',kind:'nukeb',cost:NUKE_COST,dis:busy('nuke')?'Já está fabricando':!afford(0,NUKE_COST)?'Faltam recursos: '+costTxt(NUKE_COST):null,cnt:e.q.filter(q=>q==='nuke').length,act:()=>{pay(0,NUKE_COST);e.q.push('nuke')}});
  out.push({img:nukeIcon('emp',0),nm:'Fabricar Pulso EMP',kind:'empb',cost:EMP_COST,dis:busy('emp')?'Já está fabricando':!afford(0,EMP_COST)?'Faltam recursos: '+costTxt(EMP_COST):null,cnt:e.q.filter(q=>q==='emp').length,act:()=>{pay(0,EMP_COST);e.q.push('emp')}});
  if(e.nk>0)out.push({img:nukeIcon('nuke',1),trade:1,nm:'Lançar Bomba nuclear',cnt:e.nk,act:()=>{UI.target={silo:e.id,kind:'nuke'};toast('☢️ Toque no mapa onde a bomba vai cair · toque no botão de novo para cancelar')}});
  if(e.ep>0)out.push({img:nukeIcon('emp',1),trade:1,nm:'Lançar Pulso EMP',cnt:e.ep,act:()=>{UI.target={silo:e.id,kind:'emp'};toast('⚡ Toque no mapa onde lançar o EMP')}});
  return out.slice(0,12)};
const cardInfo2=cardInfo;
cardInfo=function(c){if(c.kind==='nukeb')return{t:'Bomba nuclear',sub:'Silo de Mísseis · Era da Inteligência Artificial',txt:'Destrói tudo num raio de 6 quadrados (as suas tropas também!) e arrasa os prédios. Cada bomba lançada avança o <b>Relógio do Armagedom ('+(G.arma||0)+'/'+ARMA_MAX+')</b>: quando chegar ao fim, o mundo acaba e todos perdem.',time:60,btn:'☢️ Fabricar'};
  if(c.kind==='empb')return{t:'Pulso EMP',sub:'Silo de Mísseis',txt:'Um clarão eletromagnético num raio de 8 quadrados: unidades e prédios ficam parados por 20 segundos. Não conta para o Armagedom.',time:30,btn:'⚡ Fabricar'};
  return cardInfo2(c)};
// mirar: o próximo toque no mapa escolhe o alvo
const clickAt3=clickAt;
clickAt=function(sx,sy,add){if(UI.target){const T=UI.target;UI.target=null;const s=E.get(T.silo);if(s&&!s.dead){const w=scrToW(sx,sy);launch(s,T.kind,w.x,w.y)}return}clickAt3(sx,sy,add)};
// ---------- IA: tropas novas, Fábrica, petróleo e o Silo ----------
const ronAI3=ronAI;
ronAI=function(p,blds,has,any,build,htx,hty,toward,vills,army,res){ronAI3(p,blds,has,any,build,htx,hty,toward,vills,army,res);const P=G.P[p];
  // falta pouco para a próxima era? compra no Mercado com a riqueza que sobra (como no Rise)
  if(P.age>=3&&P.age<MAXAGE&&blds.some(b=>b.type==='mercado'&&b.done>=1)){const need=AGECOST[P.age+1];capInit();
    for(const k of TRADE_K){if(need[k]&&res[k]<need[k]&&res.wealth>buyPrice(p,k)+(need.wealth||0)+150){trade(p,k,1);break}}}
  if(P.age>=5&&!any('fabrica'))build('fabrica',htx,hty,5,15);
  if(P.age>=BT.silo.age&&!any('silo')&&G.diff!=='facil')build('silo',htx,hty,5,14);
  // petróleo: até 5 aldeões no petróleo dentro da fronteira
  if(P.age>=OIL_AGE&&res.oil<(P.age>=6?2200:900)){const on=vills.filter(v=>v.lsub==='oil'&&(v.st==='gather'||v.st==='return')).length;
    if(on<Math.min(P.age>=6?9:5,vills.length/(P.age>=6?4:7)|0)){const v=vills.find(x=>x.st==='idle'||(x.lsub==='tree'&&x.st==='gather'&&x.carry<3));if(v){let best=null,bd=40*TS;for(const r of G.R){if(r.dead||r.sub!=='oil')continue;const c=ctr(r);if(DOM[idx(r.tx,r.ty)]!==p&&!blds.some(b=>b.type==='tc'&&hyp(ctr(b).x-c.x,ctr(b).y-c.y)<16*TS))continue;const d=hyp(c.x-v.x,c.y-v.y);if(d<bd){bd=d;best=r}}if(best)orderGather(v,best)}}}
  // silo: fabrica e lança
  const si=blds.find(b=>b.type==='silo'&&b.done>=1);if(!si)return;
  if(!si.q.length){if(G.diff==='dificil'&&!(si.nk>0)&&(G.arma||0)<ARMA_MAX-2&&afford(p,NUKE_COST)){pay(p,NUKE_COST);si.q.push('nuke')}else if(!(si.ep>0)&&afford(p,EMP_COST)&&res.gold>EMP_COST.gold+300){pay(p,EMP_COST);si.q.push('emp')}}
  const F=1-p;const foe=G.B.filter(b=>!b.dead&&b.o===F&&b.done>=1&&b.type!=='muralha').sort((a,b)=>(b.type==='tc')-(a.type==='tc'))[0];
  if(foe&&!(P.siloT>G.t)){const c=ctr(foe);let ok=false;if(si.nk>0&&G.diff==='dificil'&&(G.arma||0)<ARMA_MAX-1)ok=launch(si,'nuke',c.x,c.y);else if(si.ep>0){const us=G.U.filter(u=>!u.dead&&u.o===F&&isMil(u));const t=us.length>6?us[(us.length/2)|0]:null;if(t)ok=launch(si,'emp',t.x,t.y)}if(ok)P.siloT=G.t+(G.diff==='dificil'?90:180)}};
// ---------- desenhos (código) ----------
const weapon0=weapon;
weapon=function(g,hx,hy,wa,cfg,C,p,bh){if(cfg.wpn!=='gun')return weapon0(g,hx,hy,wa,cfg,C,p,bh);
  const dx=Math.sin(wa),dy=Math.cos(wa),fire=p.draw>0;
  ln(g,hx-dx*5,hy-dy*5,hx+dx*4,hy+dy*4,'#5a3a1e',3.4);ln(g,hx+dx*3,hy+dy*3,hx+dx*17,hy+dy*17,'#2e3038',2.2);ln(g,hx+dx*3,hy+dy*3,hx+dx*17,hy+dy*17,'#7a7e88',1);
  if(fire){g.fillStyle='rgba(255,210,90,.9)';g.beginPath();g.arc(hx+dx*19,hy+dy*19,2.4,0,7);g.fill();g.fillStyle='rgba(230,230,230,.5)';g.beginPath();g.arc(hx+dx*23,hy+dy*21,3.4,0,7);g.fill()}};
function cannon(g,ax,ay,C,fr,big){const gy=ay,cx=ax,rec=fr>=5?[3,1.5,0][fr-5]:0,mv=fr>=1&&fr<=4,rot=mv?(fr-1)*.8:0,L=big?34:28;
  ell(g,cx,gy,26,5.5,'rgba(0,0,0,.3)');
  g.save();g.translate(cx-4-rec,gy-14);g.rotate(-.18);g.fillStyle=big?'#3c4048':'#2e3036';g.beginPath();if(g.roundRect)g.roundRect(-6,-4.5,L,9,4);else g.rect(-6,-4.5,L,9);g.fill();g.strokeStyle=OL;g.lineWidth=.7;g.stroke();
  g.fillStyle='#55585f';g.fillRect(L-9,-5.5,4,11);g.restore();
  polyS(g,[[cx-18,gy-12],[cx+8,gy-12],[cx+12,gy-6],[cx-20,gy-6]],big?'#5a5040':'#7a5230',cx-20,cx+12);ibx(g,cx-14,gy-12,16,2,C.m);
  for(const w of[cx-12,cx+6]){g.strokeStyle='#2a1a0a';g.lineWidth=2.6;g.beginPath();g.ellipse(w,gy-6,6.5,6.5,0,0,7);g.stroke();for(let a=0;a<3;a++){const t=rot+a*1.05;ln(g,w+Math.cos(t)*6,gy-6+Math.sin(t)*6,w-Math.cos(t)*6,gy-6-Math.sin(t)*6,'#6a4a2a',1.2)}}
  if(fr===5){g.fillStyle='rgba(255,200,80,.9)';g.beginPath();g.arc(cx+L-4,gy-21,4,0,7);g.fill();g.fillStyle='rgba(220,220,220,.55)';g.beginPath();g.arc(cx+L+4,gy-24,6,0,7);g.fill()}}
function tank(g,ax,ay,C,fr){const gy=ay,cx=ax,mv=fr>=1&&fr<=4,ph=mv?(fr-1)/4:0,rec=fr>=5?[3,1.5,0][fr-5]:0;
  ell(g,cx,gy,34,6,'rgba(0,0,0,.35)');
  polyS(g,[[cx-32,gy-12],[cx+30,gy-12],[cx+34,gy-4],[cx+28,gy+1],[cx-28,gy+1],[cx-34,gy-4]],'#3a3e30',cx-34,cx+34);
  for(let i=0;i<7;i++){const x=cx-27+i*9+((ph*9)%9);circ(g,x,gy-4,3.4,'#2a2c24');circ(g,x,gy-4,1.4,'#55584a')}
  polyS(g,[[cx-26,gy-24],[cx+24,gy-24],[cx+30,gy-13],[cx-30,gy-13]],'#5a6248',cx-30,cx+30);ibx(g,cx-22,gy-22,10,3,C.m);
  g.save();g.translate(cx-2,gy-28);polyS(g,[[-14,-8],[12,-8],[15,2],[-16,2]],'#6a7254',-16,15);g.fillStyle='#4a5038';g.fillRect(12-rec,-5,30,4.5);g.strokeStyle=OL;g.lineWidth=.6;g.strokeRect(12-rec,-5,30,4.5);circ(g,-2,-10,3,'#4a5038');g.restore();
  if(fr===5){g.fillStyle='rgba(255,200,80,.9)';g.beginPath();g.arc(cx+44,gy-31,4.5,0,7);g.fill()}}
function ironship(g,ax,ay,C,fr,kind){const gy=ay,cx=ax,mv=fr>=1&&fr<=4,os=mv?[0,.5,1,.5][fr-1]:.3;
  if(kind==='galeao'){boat(g,cx,gy,'trir',C,fr);for(let i=0;i<5;i++)ibx(g,cx-30+i*13,gy-17,4,3,'#1a1a1a');return}
  const L=96;ell(g,cx,gy-5,L*.6,7,'rgba(255,255,255,.2)');
  polyS(g,[[cx-L*.5,gy-16],[cx+L*.45,gy-16],[cx+L*.56,gy-20],[cx+L*.46,gy-6],[cx-L*.42,gy-4],[cx-L*.52,gy-12]],'#5a606a',cx-L*.5,cx+L*.5);
  ln(g,cx-L*.48,gy-14,cx+L*.45,gy-14,C.m,2.2);ibx(g,cx-18,gy-30,28,14,'#6e7480');ibx(g,cx-6,gy-46,8,16,'#3a3c42');
  g.fillStyle='rgba(60,60,60,.45)';g.beginPath();g.arc(cx-2-os*3,gy-52,5+os*2,0,7);g.fill();
  for(const x of[cx-34,cx+24]){ibx(g,x,gy-24,12,7,'#4a4e56');ln(g,x+11,gy-21,x+24,gy-22,'#2e3036',2.4)}}
const HUMX={mosq:{hat:'band',wpn:'gun',armor:'#3a5a9a'},fuzil:{hat:'helm',wpn:'gun',armor:'#4a5a3a'},assalto:{hat:'helm',wpn:'gun',armor:'#2e3830',greaves:1}};
const extraSheets2=extraSheets;
extraSheets=function(o,C,skin){extraSheets2(o,C,skin);
  for(const t in HUMX)mkSheet(t+o,HM[0],HM[1],HM[2],HM[3],(g,ax,ay,fr,dir,meta)=>drawHuman(g,ax,ay,HUMX[t],C,skin,fr,dir===1,meta));
  for(const t of['canhao','artilharia']){const sp=UT[t].spr;mkSheet(t+o,sp[0],sp[1],sp[2],sp[3],(g,ax,ay,fr)=>cannon(g,ax,ay,C,fr,t==='artilharia'))}
  {const sp=UT.tanque.spr;mkSheet('tanque'+o,sp[0],sp[1],sp[2],sp[3],(g,ax,ay,fr)=>tank(g,ax,ay,C,fr))}
  for(const t of['galeao','encour']){const sp=UT[t].spr;mkSheet(t+o,sp[0],sp[1],sp[2],sp[3],(g,ax,ay,fr)=>ironship(g,ax,ay,C,fr,t))}};
// prédios novos e a poça de petróleo
const paintBld0=paintBld;
paintBld=function(g,P,type,st,C,S){const m=C.m,dk='#2c1b0c';
  if(type==='fabrica'){shadowB(g,P,4,4,92,92,74);ibox(g,P,4,4,92,92,0,6,'#7a7468');ibox(g,P,10,14,86,82,6,34,'#9a4a34');courses(g,P,10,14,86,82,6,34,5,.18);
    for(const x of[24,40,56,72])faceL(g,P,x,x+8,82,14,30,'#2a2a30');pyr(g,P,8,12,88,84,40,10,'#4a4a52');band(g,P,10,14,86,82,30,m);
    for(const[x,y]of[[22,26],[44,26]]){ibox(g,P,x,y,x+8,y+8,40,40,'#6a3a2a');ibox(g,P,x-1,y-1,x+9,y+9,80,3,'#3a3a3a')}flagP(g,P,74,70,44,m,16);return}
  if(type==='silo'){shadowB(g,P,4,4,60,60,60);ibox(g,P,4,4,60,60,0,8,'#8a8e94');ibox(g,P,12,12,52,52,8,6,'#5a5e66');
    ibox(g,P,22,22,42,42,14,40,'#d8dce2');pyr(g,P,22,22,42,42,54,12,'#b03028');band(g,P,22,22,42,42,30,m);
    for(const[x,y]of[[8,8],[52,8],[8,52],[52,52]])ibox(g,P,x,y,x+4,y+4,8,14,'#e0c030');flagP(g,P,54,54,22,m,14);return}
  return paintBld0(g,P,type,st,C,S)};
const buildSprites2=buildSprites;
buildSprites=function(){buildSprites2();
  const c=document.createElement('canvas');c.width=60*SS;c.height=48*SS;const g=c.getContext('2d');g.scale(SS,SS);
  ell(g,30,38,20,7,'#0c0c10');ell(g,30,37,16,5,'#22222a');ell(g,26,36,5,1.6,'rgba(160,160,190,.5)');
  ln(g,40,36,44,12,'#5a3a1e',2);ln(g,48,36,44,12,'#5a3a1e',2);ln(g,41,28,47,28,'#5a3a1e',1.4);ln(g,42,20,46,20,'#5a3a1e',1.2);poly(g,[[42,12],[46,12],[44,8]],'#7a5a2e');
  SPR.oil={c,dk:darkCopy(c),w:60,h:48,ax:30,ay:40};THUMB.roil=c.toDataURL();
  const r=document.createElement('canvas');r.width=r.height=40;const q=r.getContext('2d');q.scale(2,2);
  q.fillStyle='#3a3e48';q.fillRect(4,5,11,13);q.fillStyle='#e07a20';q.fillRect(4,8,11,1.6);q.fillRect(4,14,11,1.6);q.fillStyle='#5a606c';q.beginPath();q.ellipse(9.5,5,5.5,1.8,0,0,7);q.fill();
  q.fillStyle='#111';q.strokeStyle='#e8e8f0';q.lineWidth=.9;q.beginPath();q.moveTo(15.5,6);q.quadraticCurveTo(20,12,18.5,14.5);q.arc(16,14.2,2.6,.1,Math.PI-.1);q.quadraticCurveTo(12,12,15.5,6);q.fill();q.stroke();
  // arte do GPT/Gemini para a poça, se carregou
  {const m=GPTART.n&&GPTART.n.oil,img=m&&GA['n_'+m.at];if(img){const c=gaCut(img,m.r);SPR.oil={c,dk:darkCopy(c),w:m.W,h:m.H,ax:m.xc,ay:m.cy+5};THUMB.roil=gaThumb(c,40)}}
  RIMG.oil=r.toDataURL();document.querySelectorAll('[data-ri="oil"]').forEach(el=>el.src=RIMG.oil)};
// ícones das eras novas e da bomba
ERA_ART[4]=g=>{medal(g,'#a07050','#3a2010');g.save();g.translate(40,42);g.rotate(-.6);ln(g,-20,0,16,0,'#5a3a1e',5);ln(g,0,0,24,0,'#3a3c44',3);g.restore();ell(g,26,52,8,5,'#6a4a2a');ell(g,26,50,6,3,'#8a6a3a')};
ERA_ART[5]=g=>{medal(g,'#9aa0aa','#2a2e36');g.fillStyle='#e2bd62';g.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=i%2?20:14;g.lineTo(40+Math.cos(a)*r,40+Math.sin(a)*r)}g.closePath();g.fill();g.strokeStyle='#5a3a08';g.lineWidth=2;g.stroke();circ(g,40,40,6,'#2a2e36')};
ERA_ART[6]=g=>{medal(g,'#4ac0e0','#0a2a44');g.fillStyle='#0e3a5a';g.fillRect(24,24,32,32);g.strokeStyle='#9ef';g.lineWidth=2;g.strokeRect(24,24,32,32);for(let i=0;i<4;i++){ln(g,28+i*8,18,28+i*8,24,'#9ef',2);ln(g,28+i*8,56,28+i*8,62,'#9ef',2);ln(g,18,28+i*8,24,28+i*8,'#9ef',2);ln(g,56,28+i*8,62,28+i*8,'#9ef',2)}g.font='bold 14px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#9ef';g.fillText('IA',40,41)};
function nukeIcon(k,go){const key='nk'+k+go;if(!ICO[key]){const[c,g]=icoC();medal(g,k==='nuke'?(go?'#e0402a':'#c8a030'):(go?'#40a0ff':'#4a6a9a'),k==='nuke'?'#3a0a04':'#0a1a3a');
    g.font='34px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(go?'🚀':k==='nuke'?'☢️':'⚡',40,41);if(go)badge(g,k==='nuke'?'☢':'⚡',k==='nuke'?'#b02010':'#2050b0');ICO[key]=c.toDataURL()}return ICO[key]}
// míssil, cogumelo e clarão do EMP; Relógio do Armagedom no topo
const drawRonUp1=drawRonUp;
drawRonUp=function(){drawRonUp1();for(const f of G.fx){
  if(f.k==='missile'&&!f.boom){const p=Math.min(1,f.t/f.T),I=f.x-f.y,J=(f.x+f.y)/2,h=Math.sin(p*Math.PI)*220;ctx.fillStyle=f.kind==='nuke'?'#e8e8e8':'#9ef';ctx.beginPath();ctx.ellipse(I,J-h,3,6,0,0,7);ctx.fill();
    ctx.fillStyle='rgba(255,170,60,.85)';ctx.beginPath();ctx.arc(I,J-h+7,3,0,7);ctx.fill();ctx.strokeStyle='rgba(220,220,220,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(I,J-h+8);ctx.lineTo(I-8,J-h+30);ctx.stroke();
    const tI=f.tx-f.ty,tJ=(f.tx+f.ty)/2;ctx.strokeStyle='rgba(255,60,40,'+(.5+.5*Math.sin(f.t*12))+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(tI,tJ,(f.kind==='nuke'?6:8)*TS,(f.kind==='nuke'?3:4)*TS,0,0,7);ctx.stroke()}
  else if(f.k==='nukefx'){const I=f.x-f.y,J=(f.x+f.y)/2,t=f.t,R=(f.emp?8:6)*TS;
    if(f.emp){ctx.globalAlpha=Math.max(0,1-t/2.5);ctx.strokeStyle='#9ef';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(I,J,R*Math.min(1,t*1.5),R*.5*Math.min(1,t*1.5),0,0,7);ctx.stroke();ctx.globalAlpha=1;continue}
    ctx.globalAlpha=Math.max(0,1-t/8);const r=Math.min(1,t/1.2);
    const gr=ctx.createRadialGradient(I,J,4,I,J,R*r);gr.addColorStop(0,'rgba(255,250,210,.95)');gr.addColorStop(.4,'rgba(255,150,40,.8)');gr.addColorStop(1,'rgba(90,40,20,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(I,J,R*r,R*.5*r,0,0,7);ctx.fill();
    const h=Math.min(1,t/2)*150;ctx.fillStyle='rgba(120,90,70,.8)';ctx.fillRect(I-10,J-h,20,h);const cap=ctx.createRadialGradient(I,J-h,4,I,J-h,60);cap.addColorStop(0,'rgba(255,200,120,.95)');cap.addColorStop(1,'rgba(110,80,60,.0)');
    ctx.fillStyle=cap;ctx.beginPath();ctx.ellipse(I,J-h,62*Math.min(1,t/1.5),36*Math.min(1,t/1.5),0,0,7);ctx.fill();ctx.globalAlpha=1}}};
const drawAtmos2=drawAtmos;
drawAtmos=function(){drawAtmos2();if(!G)return;for(const f of G.fx)if(f.k==='nukefx'&&!f.emp&&f.t<.6){ctx.fillStyle='rgba(255,255,240,'+(.85*(1-f.t/.6))+')';ctx.fillRect(0,0,VW,VH)}
  if(G.arma>0){const t='☢️ Armagedom '+G.arma+'/'+ARMA_MAX;ctx.font='bold 13px Georgia,serif';const w=ctx.measureText(t).width+14;ctx.fillStyle='rgba(120,10,0,.85)';const x=VW-w-10;ctx.fillRect(x,TOPH+8,w,22);ctx.fillStyle='#ffe0d0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x+w/2,TOPH+19);ctx.textBaseline='alphabetic'}};
