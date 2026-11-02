
// =========================================================
//   COLETA AUTOMÁTICA (como no Rise e nos Age mais novos)
//   · aldeão parado vai trabalhar sozinho no recurso que mais falta (segue o Plano de coleta)
//   · quem termina um Celeiro/Depósito/Centro Urbano começa a coletar ali perto
//   · barcos de pesca parados voltam a pescar
//   · fila automática de aldeões no Centro Urbano (liga/desliga)
//   Vale só para o jogador; o inimigo tem a IA dele.
// =========================================================
if(OPT.autoV==null)OPT.autoV=1;
const PLANS={
  eq:{n:'Equilibrado',ic:'⚖️',w:[{food:.6,wood:.4,gold:0,stone:0},{food:.48,wood:.34,gold:.14,stone:.04},{food:.4,wood:.32,gold:.22,stone:.06},{food:.38,wood:.3,gold:.24,stone:.08}]},
  food:{n:'Mais comida',ic:'🍖',w:[{food:.75,wood:.25,gold:0,stone:0},{food:.62,wood:.26,gold:.1,stone:.02},{food:.55,wood:.25,gold:.16,stone:.04},{food:.5,wood:.24,gold:.2,stone:.06}]},
  wood:{n:'Mais madeira',ic:'🪵',w:[{food:.45,wood:.55,gold:0,stone:0},{food:.38,wood:.5,gold:.1,stone:.02},{food:.34,wood:.44,gold:.16,stone:.06},{food:.32,wood:.4,gold:.2,stone:.08}]},
  gold:{n:'Mais ouro',ic:'🪙',w:[{food:.55,wood:.35,gold:.1,stone:0},{food:.4,wood:.28,gold:.28,stone:.04},{food:.34,wood:.26,gold:.34,stone:.06},{food:.32,wood:.24,gold:.36,stone:.08}]}};
for(const k in PLANS)for(const w of PLANS[k].w){w.gold+=w.stone;w.stone=0}PLANS.gold.n='Mais metal';PLANS.gold.ic='⛓';
const PLAN_ORD=['eq','food','wood','gold'];
const RCAT=s=>s==='tree'?'wood':s==='gold'||s==='stone'?'gold':'food';
const RNAME={food:'🍖 comida',wood:'🪵 madeira',gold:'⛓ metal',stone:'⛓ metal'};
function autoOn(){return OPT.autoV&&G&&!G.P[0].ai}
// alvo de cada tipo perto de um ponto (sem lotar: no máximo 3 por arbusto/carcaça, 6 por árvore/mina)
function autoTarget(cat,x,y,cnt){
  const lim=r=>{const n=cnt.get(r.id)||0;return n<(r.sub==='tree'||r.sub==='gold'||r.sub==='stone'?6:r.k==='u'?3:3)};
  const pick=(sub,R)=>{let best=null,bd=R*TS;
    if(sub==='farm')return findRes('farm',x,y,R,0);
    if(UT[sub]){for(const a of G.U){if(a.dead||a.o!==2||a.type!==sub||!G.exp[tileOf(a.x,a.y)]||!lim(a))continue;if(UT[sub].fight)continue;const d=hyp(a.x-x,a.y-y);if(d<bd){bd=d;best=a}}return best}
    for(const r of G.R){if(r.dead||r.sub!==sub||(r.bad&&G.t-r.bad<120)||!G.exp[r.walk?tileOf(r.x,r.y):idx(r.tx,r.ty)]||!lim(r))continue;if(r.sub==='fish'&&r.deep)continue;
      if(!r.walk&&DOM[idx(r.tx,r.ty)]===1)continue;const c=ctr(r),d=hyp(c.x-x,c.y-y);if(d<bd){bd=d;best=r}}return best};
  if(cat==='food')return pick('carc',14)||pick('berry',16)||pick('farm',18)||pick('gaz',14)||pick('fish',10);
  if(cat==='wood')return pick('tree',22);if(cat==='gold')return pick('gold',26);return pick('stone',26)}
function autoTick(){
  if(!autoOn())return;const P=G.P[0];
  const vs=G.U.filter(u=>!u.dead&&!u.inT&&u.o===0&&u.type==='vill');if(!vs.length)return;
  const cnt={food:0,wood:0,gold:0,stone:0},tg=new Map();
  for(const v of vs){if(v.st==='gather'||v.st==='return'){cnt[RCAT(v.lsub)]++;if(v.st==='gather')tg.set(v.tg,(tg.get(v.tg)||0)+1)}}
  const plan=PLANS[G.plan||'eq']||PLANS.eq,want=plan.w[Math.min(P.age,3)],n=vs.length;
  let moved=0;
  for(const v of vs){
    if(v.st!=='idle'){v.idleT=0;continue}
    v.idleT=(v.idleT||0)+.5;
    if(v.hold>G.t)continue;                                   // você mandou parar: respeita por um tempo
    if(SEL.includes(v.id)){v.idleT=Math.min(v.idleT,2);continue}   // selecionado: você vai dar a ordem
    if(v.idleT<(v.fresh?1:4))continue;                         // espera um pouco: pode ser que você vá dar uma ordem
    v.fresh=0;let t=null,cat=null;
    // 1) acabou de construir um ponto de coleta: trabalha ali perto (como no Age IV)
    const nb=v.nearB&&E.get(v.nearB);v.nearB=0;
    if(nb&&!nb.dead){const c=ctr(nb),D=BT[nb.type].drop||[];
      const order=nb.type==='celeiro'?['food']:nb.type==='deposito'?['wood','gold','stone'].sort((a,b)=>(want[b]*n-cnt[b])-(want[a]*n-cnt[a])):D;
      for(const k of order){t=autoTarget(k,c.x,c.y,tg);if(t){cat=k;break}}}
    // 2) volta para o que estava fazendo, se ainda tem perto
    if(!t&&v.lsub&&v.lastRes){const k=RCAT(v.lsub);if(want[k]>0||k==='food'){t=autoTarget(k,v.x,v.y,tg);if(t)cat=k}}
    // 3) o recurso que mais falta segundo o plano
    if(!t){const sc=k=>want[k]*n-cnt[k]-P.res[k]/600+(want[k]>0&&P.res[k]<100?1.5:0);
      for(const k of['food','wood','gold','stone'].sort((a,b)=>sc(b)-sc(a))){if(want[k]<=0&&k!=='wood')continue;t=autoTarget(k,v.x,v.y,tg);if(t){cat=k;break}}}
    if(t&&orderGather(v,t)!==false){cnt[cat]++;tg.set(t.id,(tg.get(t.id)||0)+1);moved++;v.autoT=G.t;if(!UI.autoCnt)UI.autoCnt=0;UI.autoCnt++;
      if(!OPT.autoTip){OPT.autoTip=1;saveOpt();toast('🤖 Aldeão parado foi trabalhar sozinho ('+RNAME[cat]+'). Ajuste o Plano de coleta no Centro Urbano.')}}
  }
  // sem comida natural: com Mercado e madeira sobrando, um aldeão automático planta uma fazenda
  const sc0=k=>want[k]*n-cnt[k]-P.res[k]/600+(want[k]>0&&P.res[k]<100?1.5:0);
  if(sc0('food')>1.5&&hasReq(0,'mercado')&&P.res.wood>=BT.fazenda.cost.wood+60&&!autoTarget('food',(G.starts[0][0]+.5)*TS,(G.starts[0][1]+.5)*TS,tg)&&G.t-(UI.autoFarmT||-99)>8){
    const v=vs.find(u=>u.st==='idle'&&!(u.hold>G.t))||vs.find(u=>u.autoT&&(u.st==='gather'||u.st==='return')&&RCAT(u.lsub)!=='food'&&u.carry<1);
    const home=G.B.find(b=>!b.dead&&b.o===0&&b.type==='celeiro'&&b.done>=1)||G.B.find(b=>!b.dead&&b.o===0&&b.type==='tc'&&b.done>=1);
    if(v&&home){const c=ctr(home);const ap=AIP;AIP=0;let st=null;try{st=findSite('fazenda',c.x/TS,c.y/TS,2,9)||findSite('fazenda',c.x/TS,c.y/TS,9,16)}finally{AIP=ap}
      if(st){pay(0,BT.fazenda.cost);const f=placeBld('fazenda',0,st[0],st[1],false);orderBuild(v,f);v.autoT=G.t;UI.autoFarmT=G.t;cnt.food++;
        if(!OPT.farmTip){OPT.farmTip=1;saveOpt();toast('🌾 Acabou a comida natural: um aldeão foi plantar uma Fazenda (−'+BT.fazenda.cost.wood+' madeira)')}}}}
  // rebalanço: recurso sobrando e outro faltando → um aldeão automático troca (nunca mexe em quem você mandou)
  if(G.t-(UI.rebT||-99)>10){UI.rebT=G.t;const ks=['food','wood','gold','stone'];
    const hi=ks.filter(k=>want[k]>0).sort((a,b)=>sc0(b)-sc0(a))[0],lo=ks.filter(k=>cnt[k]>0).sort((a,b)=>sc0(a)-sc0(b))[0];
    if(hi&&lo&&hi!==lo&&sc0(hi)-sc0(lo)>=2.5&&P.res[lo]>350){const v=vs.find(u=>u.autoT&&!u.sel0&&(u.st==='gather'||u.st==='return')&&RCAT(u.lsub)===lo&&!SEL.includes(u.id));
      if(v){const t=autoTarget(hi,v.x,v.y,tg);if(t&&orderGather(v,t)!==false){cnt[lo]--;cnt[hi]++}}}}
  // barcos de pesca parados voltam a pescar
  for(const b of G.U){if(b.dead||b.o!==0||b.type!=='pesc'||b.st!=='idle')continue;b.idleT=(b.idleT||0)+.5;if(b.idleT<3||b.hold>G.t)continue;
    let best=null,bd=30*TS;for(const r of G.R){if(r.dead||r.sub!=='fish'||!G.exp[idx(r.tx,r.ty)])continue;const c=ctr(r),d=hyp(c.x-b.x,c.y-b.y);if(d<bd){bd=d;best=r}}if(best)orderGather(b,best)}
  // fila automática de aldeões
  if(P.autoQ){for(const tc of G.B){if(tc.dead||tc.o!==0||tc.type!=='tc'||tc.done<1||tc.down)continue;
    if(tc.q.length===0&&P.pop<P.cap&&canTrain(tc,'vill')==null){pay(0,costOf(0,'vill'));tc.q.push('vill')}}}
}
// ganchos: tique, construção pronta, unidade nova, botão Parar
let autoAcc=0;const ronTick1=ronTick;
ronTick=function(dt){ronTick1(dt);autoAcc+=dt;if(autoAcc>=.5){autoAcc=0;try{autoTick()}catch(e){console.warn('auto',e)}}};
const onBuilt1=onBuilt;
onBuilt=function(b){onBuilt1(b);if(b.o!==0||!BT[b.type].drop)return;for(const v of G.U)if(!v.dead&&v.o===0&&v.type==='vill'&&v.st==='build'&&v.tg===b.id){v.nearB=b.id;v.fresh=1}};
const spawnUnit1=spawnUnit;
spawnUnit=function(t,o,x,y){const u=spawnUnit1(t,o,x,y);if(u&&o===0)u.fresh=1;return u};
// comandos: Parar segura o aldeão; no Centro Urbano: coleta automática, plano e fila automática
const smartOrder1=smartOrder;
smartOrder=function(us,tgt,x,y,o){const r=smartOrder1(us,tgt,x,y,o);if(r!=='pend'&&us[0]&&us[0].o===0)for(const u of us)u.autoT=0;return r};
const getCmds3=getCmds;
getCmds=function(){const out=getCmds3();const s=selEnts(),e=s[0];if(!e||e.o!==0)return out;
  for(const c of out)if(c.ic==='✋'&&!c._h){c._h=1;const a=c.act;c.act=()=>{a();for(const u of selEnts())if(u.k==='u')u.hold=G.t+45}}
  if(e.k==='b'&&e.type==='tc'&&e.done>=1){const P=G.P[0],pl=PLANS[G.plan||'eq'];
    out.push({img:autoIcon('auto',OPT.autoV),nm:'Coleta automática: '+(OPT.autoV?'LIGADA':'desligada'),act:()=>{OPT.autoV=OPT.autoV?0:1;saveOpt();toast(OPT.autoV?'🤖 Coleta automática ligada: aldeões parados vão trabalhar sozinhos':'🤖 Coleta automática desligada')}});
    out.push({img:autoIcon('plan_'+(G.plan||'eq'),1),nm:'Plano de coleta: '+pl.n,act:()=>{const i=PLAN_ORD.indexOf(G.plan||'eq');G.plan=PLAN_ORD[(i+1)%PLAN_ORD.length];const p=PLANS[G.plan],w=p.w[Math.min(P.age,3)];
      toast(p.ic+' Plano: <b>'+p.n+'</b> · '+Object.keys(w).filter(k=>w[k]>0).map(k=>RNAME[k]+' '+Math.round(w[k]*100)+'%').join(' · '))}});
    out.push({img:autoIcon('queue',P.autoQ),nm:'Fila automática de aldeões: '+(P.autoQ?'LIGADA':'desligada'),act:()=>{P.autoQ=P.autoQ?0:1;toast(P.autoQ?'🔁 Fila automática ligada: o Centro Urbano treina aldeões sem parar':'🔁 Fila automática desligada')}})}
  return out.slice(0,12)};
// ícones dos botões novos
function autoIcon(k,on){const key='auto_'+k+(on?1:0);if(!ICO[key]){const[c,g]=icoC();
    const col=k==='auto'?['#5ac0a0','#0e3a30']:k==='queue'?['#5a8ae0','#10285a']:['#e0b040','#5a3a08'];medal(g,on?col[0]:'#777',on?col[1]:'#333');
    g.font='32px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';
    g.fillText(k==='auto'?'🤖':k==='queue'?'🔁':PLANS[k.slice(5)].ic,40,40);if(k==='queue'){g.font='18px sans-serif';g.fillText('👷',58,58)}
    if(!on){g.strokeStyle='#e04030';g.lineWidth=6;g.beginPath();g.moveTo(16,64);g.lineTo(64,16);g.stroke()}
    ICO[key]=c.toDataURL()}return ICO[key]}
// botão rápido 💤 mostra quantos foram trabalhar sozinhos
const cardInfo1=cardInfo;
cardInfo=function(c){return cardInfo1(c)};
window.__RA.autoTick=autoTick;
