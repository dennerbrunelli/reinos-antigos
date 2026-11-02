
// =========================================================
//   ECONOMIA IGUAL AO RISE OF NATIONS
//   · o aldeão não carrega: trabalha no lugar e o recurso entra direto (respeitando o limite de comércio)
//   · florestas, minas, petróleo, peixes e fazendas NÃO acabam; cada um aceita poucos trabalhadores
//   · madeira só perto de um Acampamento de lenhadores; até 5 fazendas por cidade, 1 aldeão por fazenda
//   · prédios de reforço: Celeiro (comida), Serraria (madeira), Fundição (metal), Refinaria (petróleo)
//   · caça e frutas continuam (escolha do Denner) e essas acabam
// =========================================================
const CAMP_R=8,FARMS_CITY=5,BOOST_R=16,BOOST=1.3;
const NODE_MAX={tree:1,gold:2,stone:2,oil:2,fish:2,berry:3};
BT.deposito.n='Acampamento de lenhadores';BT.deposito.cost={wood:40};BT.fazenda.age=0;delete BT.fazenda.req;
BT.serraria={n:'Serraria',sz:2,hp:450,cost:{wood:100},t:35,age:1,los:3,pg:0,h:46};
BT.fundicao={n:'Fundição',sz:2,hp:550,cost:{wood:120,gold:40},t:40,age:1,los:3,pg:0,h:58};
BT.refinaria={n:'Refinaria',sz:2,hp:600,cost:{wood:150,gold:150},t:45,age:5,los:3,pg:0,h:60};
Object.assign(BDESC,{deposito:'Madeira só sai das árvores perto dele (ou do Centro da cidade, que aceita 3 lenhadores) (até '+CAMP_R+' quadrados). Leva de 2 a 10 lenhadores, conforme as árvores em volta.',
  celeiro:'Reforça as fazendas da cidade (+30% de comida).',serraria:'Reforça a madeira da cidade (+30%).',fundicao:'Reforça as minas de metal da cidade (+30%).',refinaria:'Reforça o petróleo (+30%). Era Industrial.',
  fazenda:'Comida que nunca acaba. 1 aldeão por fazenda, até '+FARMS_CITY+' fazendas por cidade.'});
// três páginas de construção: economia, cidade e militar
const ECO2=['tc','fazenda','celeiro','deposito','serraria','fundicao','refinaria','doca','mercado'];
const CIV2=['biblioteca','universidade','templo','maravilha'];
const MIL2=['quartel','arquearia','estabulo','academia','oficina','fabrica','forte','torre','muralha','silo'];
const CIV=[];ECO.length=0;ECO.push(...ECO2.filter(t=>BT[t]));CIV.length=0;CIV.push(...CIV2.filter(t=>BT[t]));MIL.length=0;MIL.push(...MIL2.filter(t=>BT[t]));
// ---------- quem está trabalhando em cada lugar ----------
let WKT=-1,WK=new Map();
function workers(){if(WKT===G.t)return WK;WKT=G.t;WK=new Map();for(const u of G.U)if(!u.dead&&u.st==='gather'&&u.tg)WK.set(u.tg,(WK.get(u.tg)||0)+1);return WK}
function campsOf(o){return G.B.filter(b=>!b.dead&&b.o===o&&(b.type==='deposito'||b.type==='tc')&&b.done>=1)}
function campNear(o,r){const c=ctr(r);let best=null,bd=CAMP_R*TS;for(const b of campsOf(o)){const d=hyp(ctr(b).x-c.x,ctr(b).y-c.y);if(d<bd){bd=d;best=b}}return best}
function campCap(b){if(b.type==='tc')return 3;if(b._capT>G.t-20)return b._cap;const c=ctr(b);let n=0;for(const r of G.R)if(!r.dead&&r.sub==='tree'&&hyp(ctr(r).x-c.x,ctr(r).y-c.y)<CAMP_R*TS)n++;b._cap=clamp(Math.floor(n/2),2,10);b._capT=G.t;return b._cap}
function campUsed(o,b){let n=0;const c=ctr(b);for(const u of G.U)if(!u.dead&&u.o===o&&u.st==='gather'&&u.lsub==='tree'){const r=E.get(u.tg);if(r&&hyp(ctr(r).x-c.x,ctr(r).y-c.y)<CAMP_R*TS)n++}return n}
// pode trabalhar aqui? (null = pode; texto = motivo)
function nodeBlock(u,r){if(!r||r.k!=='r'||r.walk)return null;const o=u.o,max=NODE_MAX[r.sub];
  if(max&&(workers().get(r.id)||0)>=max&&!(u.st==='gather'&&u.tg===r.id))return'cheio';
  if(r.sub==='tree'&&u.type==='vill'&&o<2){const cp=campNear(o,r);if(!cp)return'Madeira: construa um Acampamento de lenhadores perto da floresta';
    if(!(u.st==='gather'&&u.tg===r.id)&&campUsed(o,cp)>=campCap(cp))return'Este acampamento já está com '+campCap(cp)+' lenhadores (máximo pelas árvores em volta)'}
  return null}
const orderGather7=orderGather;
orderGather=function(u,r){const why=nodeBlock(u,r);
  if(why){if(why==='cheio'){const alt=findRes(r.sub,ctr(r).x,ctr(r).y,8,u.o);if(alt&&alt!==r)return orderGather7(u,alt)}if(u.o===0&&why!=='cheio')toast('🪓 '+why);return false}
  return orderGather7(u,r)};
const findRes7=findRes;
findRes=function(sub,x,y,maxD,o){if(!NODE_MAX[sub]||sub==='berry')return findRes7(sub,x,y,maxD,o);
  let best=null,bd=maxD*TS;const W=workers(),cps=sub==='tree'&&o!=null&&o<2?campsOf(o):null;
  for(const r of G.R){if(r.dead||r.sub!==sub||(r.bad&&G.t-r.bad<120))continue;if((W.get(r.id)||0)>=NODE_MAX[sub])continue;const c=ctr(r),d=hyp(c.x-x,c.y-y);if(d>=bd)continue;
    if(cps&&!cps.some(b=>hyp(ctr(b).x-c.x,ctr(b).y-c.y)<CAMP_R*TS))continue;bd=d;best=r}
  return best};
const findResLimited7=findResLimited;
findResLimited=function(sub,hb,maxD,tgc,lim){if(sub!=='tree'&&!NODE_MAX[sub])return findResLimited7(sub,hb,maxD,tgc,lim);
  const o=DOM[idx(clamp(hb.x/TS|0,0,MW-1),clamp(hb.y/TS|0,0,MH-1))];return findRes(sub,hb.x,hb.y,maxD,o>=0&&o<2?o:undefined)};
// ---------- reforço dos prédios (um de cada por cidade, até 16 quadrados) ----------
const BOOSTB={farm:'celeiro',food:'celeiro',wood:'serraria',gold:'fundicao',stone:'fundicao',oil:'refinaria'};
function boostOf(o,cat,r){const t=BOOSTB[cat==='farm'?'farm':cat];if(!t||o>1)return 1;const c=ctr(r);
  return G.B.some(b=>!b.dead&&b.o===o&&b.type===t&&b.done>=1&&hyp(ctr(b).x-c.x,ctr(b).y-c.y)<BOOST_R*TS)?BOOST:1}
// ---------- coleta sem carregar ----------
const FINITE={berry:1,carc:1};const INCA={};let INCT=0;
doGather=function(u,T,dt){
  let r=E.get(u.tg);
  if(!r&&G.carc[u.tg]){const c=E.get(G.carc[u.tg]);if(c){u.tg=c.id;u.lastRes=c.id;u.lsub='carc';r=c}}
  if(r&&r.k==='u'){// caçando um animal vivo
    if(r.dead||r.o!==2){u.st='idle';return}
    const HW=HUNTW[huntTier(u.o)];if(!approach(u,r,dt,HW.rng*TS))return;
    faceTo(u,r.x,r.y);u.work=true;u.hunting=G.t;
    if(u.cd<=0){u.cd=HW.cd;u.an+=2;u.shotT=G.t;G.pj.push({x:u.x,y:u.y-12,sx:u.x,sy:u.y-12,tx:r.x,ty:r.y,tg:r.id,dmg:ST(u).atk+HW.bon,att:{o:u.o,id:u.id},t:0,T:Math.max(.12,hyp(r.x-u.x,r.y-u.y)/HW.v),kind:HW.pk,home:true});snd(HW.snd,u)}
    return}
  const bad=!r||r.dead||(r.k==='r'&&FINITE[r.sub]&&r.amt<=0)||(r.k==='b'&&(r.done<1||farmTaken(r,u)));
  if(bad||u.fail>3){if(r&&!r.dead&&u.fail>3&&r.k==='r')r.bad=G.t;const c=r&&!r.dead?ctr(r):{x:u.x,y:u.y};if(r&&r.k==='b'&&r.wk===u.id)r.wk=0;
    let nr=findRes(u.lsub,c.x,c.y,u.lsub==='farm'?10:9,u.o);if(!nr&&u.lsub==='carc'&&u.hunt)nr=findRes(u.hunt,c.x,c.y,10,u.o);
    if(nr&&(u.fail<=3||nr!==r)){if(orderGather(u,nr)===false)u.st='idle';u.fail=0}else u.st='idle';return}
  // madeira sem acampamento (o acampamento caiu): para
  if(r.k==='r'&&r.sub==='tree'&&u.type==='vill'&&u.o<2&&!campNear(u.o,r)){u.st='idle';if(u.o===0&&!(UI.campT>G.t)){UI.campT=G.t+20;toast('🪓 Lenhadores parados: falta um Acampamento de lenhadores perto da floresta')}return}
  if(!approach(u,r,dt,r.walk?18:(isNav(u)?30:24)))return;
  u.work=true;u.an+=dt*8;const c=ctr(r);faceTo(u,c.x,c.y);
  const cat=gatherCat(u,r),rt=r.k==='r'?r.rt:'food';
  const rate=GATH[cat]*(u.o<2?MODS[u.o].gath[cat]:1)*gmult(u.o)*seasonGath(cat)*ronGath(u.o,cat)*boostOf(u.o,cat,r)*(cat==='farm'?FARM_MUL:1);
  let a=rate*dt;if(r.k==='r'&&FINITE[r.sub]){a=Math.min(a,r.amt);r.amt-=a;if(r.amt<=.001)kill(r)}
  if(u.o<2){const g=capAdd(u.o,rt,a);G.P[u.o].res[rt]+=g;G.st.gath[u.o]+=g;if(u.o===0){INCA[rt]=(INCA[rt]||0)+g;if(G.t-INCT>=1||G.t<INCT){for(const k in INCA)if(INCA[k]>0)incAdd(k,INCA[k]);for(const k in INCA)INCA[k]=0;INCT=G.t}}}
  u.carry=0;
  {const ber=u.lsub==='berry',ph=ber?(u.an/2|0)%3:(u.an/1.4|0)%3;if(ph!==u._ph&&(ber||ph===0)){const k=cat==='wood'?'chop':cat==='gold'||cat==='stone'?'mine':cat==='farm'?'hoe':cat==='hunt'?'flesh':ber?'leaves':cat==='fish'||cat==='fishb'?'splash':'';if(k&&(ber?ph===0:true))snd(k,u)}u._ph=ph}};
// fazenda com 1 aldeão rende mais (no Rise a fazenda é a base da comida)
const FARM_MUL=1.6;
// ninguém mais volta ao depósito
startReturn=function(u){u.carry=0;const r=E.get(u.lastRes);if(r&&!r.dead&&orderGather(u,r)!==false)return;u.st='idle'};
const updUnit7=updUnit;
updUnit=function(u,dt){if(u.st==='return'){u.carry=0;startReturn(u)}updUnit7(u,dt)};
// ---------- 5 fazendas por cidade ----------
function cityOf(o,x,y){let best=null,bd=18*TS;for(const b of G.B){if(b.dead||b.o!==o||b.type!=='tc')continue;const d=hyp(ctr(b).x-x,ctr(b).y-y);if(d<bd){bd=d;best=b}}return best}
function farmsOf(tc){let n=0;for(const b of G.B)if(!b.dead&&b.o===tc.o&&b.type==='fazenda'&&cityOf(tc.o,ctr(b).x,ctr(b).y)===tc)n++;return n}
const validSite7=validSite;
validSite=function(type,tx,ty,margin,o){if(!validSite7(type,tx,ty,margin,o))return false;
  if(type==='fazenda'&&o<2){const tc=cityOf(o,(tx+1.5)*TS,(ty+1.5)*TS);if(!tc||farmsOf(tc)>=FARMS_CITY)return false}return true};
const canBuildType7=canBuildType;
canBuildType=function(p,t){const r=canBuildType7(p,t);if(r)return r;if(t==='fazenda'){const tcs=G.B.filter(b=>!b.dead&&b.o===p&&b.type==='tc');if(tcs.length&&tcs.every(tc=>farmsOf(tc)>=FARMS_CITY))return'Máximo de '+FARMS_CITY+' fazendas por cidade: funde outra cidade'}return null};
// ---------- desenhos dos prédios novos ----------
const paintBld7=paintBld;
paintBld=function(g,P,type,st,C,S){const m=C.m;
  if(type==='serraria'){shadowB(g,P,4,4,60,60,40);ibox(g,P,4,4,60,60,0,5,'#7a6a4a');ibox(g,P,8,10,42,54,5,22,'#a8743a');pyr(g,P,6,8,44,56,27,14,'#6a3a1a');band(g,P,8,10,42,54,18,m);
    for(let i=0;i<3;i++)ibox(g,P,46,8+i*15,58,20+i*15,5,7,'#8a5a2a');ibox(g,P,46,52,58,58,5,3,'#c89a5a');flagP(g,P,40,52,30,m,12);return}
  if(type==='fundicao'){shadowB(g,P,4,4,60,60,50);ibox(g,P,4,4,60,60,0,5,'#6a6a6a');ibox(g,P,8,8,48,56,5,22,'#8a8a8e');courses(g,P,8,8,48,56,5,22,4,.2);pyr(g,P,6,6,50,58,27,10,'#4a4a50');band(g,P,8,8,48,56,20,m);
    ibox(g,P,40,14,50,24,27,26,'#5a5a5e');ibox(g,P,42,16,48,22,53,2,'#ff8a2a');ibox(g,P,50,30,58,42,5,8,'#3a2a20');return}
  if(type==='refinaria'){shadowB(g,P,4,4,60,60,52);ibox(g,P,4,4,60,60,0,4,'#5a5a5a');
    for(const[x,y,h]of[[10,10,26],[30,10,20],[10,34,18]])ibox(g,P,x,y,x+16,y+16,4,h,'#c8ccd2');ibox(g,P,40,38,48,46,4,40,'#7a7e86');ibox(g,P,41,39,47,45,44,3,'#ff9a3a');band(g,P,10,10,26,26,18,m);return}
  return paintBld7(g,P,type,st,C,S)};
// ajuda
{const p=[...document.querySelectorAll('p')].find(e=>/^OS 6 RECURSOS/.test(e.textContent));if(p){const n=document.createElement('p');
  n.innerHTML='<b>ECONOMIA (como no Rise)</b><br>O aldeão não carrega: trabalha no lugar e o recurso entra direto. Florestas, minas, petróleo, peixes e fazendas não acabam (caça e frutas acabam).<br>🪓 Madeira só perto de um <b>Acampamento de lenhadores</b> (2 a 10 lenhadores, conforme as árvores) ou do Centro da cidade (3).<br>🌾 Até <b>5 fazendas por cidade</b>, 1 aldeão em cada: para ter mais comida, funde mais cidades.<br>⛏ Cada mina aceita 2 mineiros.<br>Reforço de +30% na cidade: Celeiro (comida), Serraria (madeira), Fundição (metal), Refinaria (petróleo).';p.after(n)}}
