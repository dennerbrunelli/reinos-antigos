
// =========================================================
//   EXÉRCITO DO RISE (etapa 5)
//   Novo: espião (mostra o que a base inimiga tem), patrulha (🔁 vai e volta entre dois pontos)
//         e melhoria por era (tropas ficam mais fortes a cada era, como no Rise)
//   Já existiam: contra-ataque, atrito em território inimigo, carroça, general, formações e posturas
// =========================================================

// ---------- espião ----------
UT.espia={n:'Espião',hp:45,atk:3,arm:0,rng:0,spd:2.1,cd:1.2,los:9,cost:{food:50,wealth:50},t:25,age:1,at:'quartel',cls:'inf',spr:[46,64,23,58]};
if(BT.quartel&&BT.quartel.train&&!BT.quartel.train.includes('espia'))BT.quartel.train.push('espia');
// sabotagem (como no Rise): mandado atacar um prédio inimigo, o Espião não bate nele — trava
// a produção e o ataque do prédio por um tempo, em vez do dano ridículo que teria de verdade
const SABO_T=25,SABO_CD=40;
Object.assign(ROLE,{espia:'Espião: rápido e frágil, enxerga longe. Perto de uma base inimiga, mostra o que ela tem de comida, madeira e ouro. Mandado atacar um prédio inimigo, sabota: trava a produção e o ataque dele por '+SABO_T+'s (recarrega em '+SABO_CD+'s).'});
const extraSheets0=extraSheets;
extraSheets=function(o,C,skin){extraSheets0(o,C,skin);const H=[46,64,23,58];
  mkSheet('espia'+o,H[0],H[1],H[2],H[3],(g,ax,ay,fr,dir,meta)=>drawHuman(g,ax,ay,{hat:'hood',robe:'#3a3f4a'},C,skin,fr,dir===1,meta))};
const doAttackSab=doAttack;
doAttack=function(u,T,dt){
  if(u.type!=='espia'){doAttackSab(u,T,dt);return}
  const t=E.get(u.tg);
  if(t&&t.k==='b'&&!t.dead&&t.o!==u.o&&!t.inT){
    if(!approach(u,t,dt,24))return;
    u.work=true;const c=ctr(t);faceTo(u,c.x,c.y);
    if(u.cd<=0){u.cd=SABO_CD;t.sabo=G.t+SABO_T;G.fx.push({k:'glow',x:t.x,y:t.y,t:0});
      if(t.o===0){toast('🕵️ Um espião inimigo sabotou '+BT[t.type].n+'! Parado por '+SABO_T+'s');snd('alert')}
      else if(u.o===0){toast('🕵️ Sabotagem! '+BT[t.type].n+' inimigo parado por '+SABO_T+'s');snd('done')}}
    return}
  doAttackSab(u,T,dt)};
const updBldSab=updBld;
updBld=function(b,dt){if(b.sabo>G.t)return;updBldSab(b,dt)};
// IA: treina um Espião de vez em quando e manda sabotar um prédio seu
const ronAIesp=ronAI;
ronAI=function(p,blds,has,any,build,htx,hty,toward,vills,army,res){
  ronAIesp(p,blds,has,any,build,htx,hty,toward,vills,army,res);
  if(p!==1)return;
  const qt=blds.find(b=>b.type==='quartel'&&b.done>=1);
  const mine=G.U.filter(u=>!u.dead&&u.o===p);
  const cnt=t=>mine.filter(u=>u.type===t).length+blds.reduce((s,b)=>s+b.q.filter(q=>q===t).length,0);
  if(qt&&qt.q.length<2&&army.length>=6&&cnt('espia')<1&&afford(p,costOf(p,'espia'))){pay(p,costOf(p,'espia'));qt.q.push('espia')}
  for(const u of mine){if(u.type!=='espia'||u.st!=='idle')continue;
    const tgt=G.B.find(b=>!b.dead&&b.o===0&&!(b.sabo>G.t)&&(b.type==='tc'||b.type==='quartel'||b.type==='fundicao'||b.type==='biblioteca'));
    if(tgt)orderAttack(u,tgt)}};

// ---------- melhoria por era: +6% de ataque e de vida por era do dono ----------
const EM=o=>1+.06*(G&&G.P&&G.P[o]?G.P[o].age:0);
const ST_UP=new WeakMap();
const ST0=ST;
ST=function(u){const T=ST0(u);if(!u||u.k!=='u'||u.o>=NP||typeof G==='undefined'||!G||!T||!isMil(u))return T;
  const m=EM(u.o);if(m<=1.0001)return T;
  let c=ST_UP.get(T);if(!c){c={};ST_UP.set(T,c)}let v=c[m];if(!v){v=c[m]=Object.assign({},T,{atk:T.atk*m,hp:T.hp*m})}return v};

// ---------- espião, melhoria e lembrete de era: rodam junto com a economia ----------
function exTick(){if(!G||!G.P||!G.U)return;
  if(!G._em||G._em.length<NP){G._em=[];for(let p=0;p<NP;p++)G._em.push(EM(p))}
  for(let o=0;o<NP;o++){const m=EM(o),old=G._em[o];if(Math.abs(m-old)<1e-9)continue;
    const k=m/old;for(const u of G.U){if(u.dead||u.o!==o||!isMil(u))continue;u.hp=Math.min(u.hp*k,ST(u).hp)}
    G._em[o]=m;if(o===0&&m>old)toast('⬆ Exército na '+AGES[G.P[0].age]+': +'+Math.round((m-1)*100)+'% de ataque e de vida')}
  // espião: perto de uma base inimiga, mostra o que ela tem (uma vez a cada 30 s por espião)
  for(const u of G.U){if(u.dead||u.o!==0||u.type!=='espia'||u.inT)continue;if((u.spyT||0)>G.t)continue;
    let e=null,bd=6*TS;for(const b of G.B){if(b.dead||b.o===0)continue;const d=distTo(u,b);if(d<bd){bd=d;e=b}}
    if(!e)continue;u.spyT=G.t+30;const P=G.P[e.o].res||{};
    toast('🕵️ Espião na base inimiga · 🍖'+(P.food|0)+' 🪵'+(P.wood|0)+' 🪙'+(P.gold|0)+' · riqueza '+(P.wealth|0))}
  // patrulha: quem fica parado volta para o outro ponto
  for(const u of G.U){if(u.dead||!u.patrol||u.st!=='idle')continue;
    const to=u.patrol.to==='b'?u.patrol.b:u.patrol.a;u.patrol.to=u.patrol.to==='b'?'a':'b';
    u._pat=1;orderMove(u,to.x,to.y);u._pat=0}
}
const ronTickEx=ronTick;
ronTick=function(dt){ronTickEx(dt);exTick()};

// ---------- patrulha: escolhe um ponto a 4-6 quadrados e vai e volta ----------
function cmdPatrol(us){let n=0;
  for(const u of us){if(u.dead)continue;const cx=Math.floor(u.x/TS),cy=Math.floor(u.y/TS);let b=null;
    for(let k=0;k<160&&!b;k++){const x=cx+((Math.random()*13)|0)-6,y=cy+((Math.random()*13)|0)-6;
      if(!inMap(x,y)||!pass[idx(x,y)]||hyp(x-cx,y-cy)<4)continue;b={x:(x+.5)*TS,y:(y+.5)*TS}}
    if(!b)continue;u.patrol={a:{x:u.x,y:u.y},b,to:'b'};u._pat=1;orderMove(u,b.x,b.y);u._pat=0;n++}
  toast(n?'🔁 Patrulhando: as tropas vão e voltam entre dois pontos':'Não achei onde patrulhar')}
// ordem de movimento ou ataque do jogador cancela a patrulha
const orderMoveP=orderMove;
orderMove=function(u,x,y){if(!u._pat)u.patrol=null;return orderMoveP(u,x,y)};
const cmdAttackP=cmdAttack;
cmdAttack=function(us){for(const u of us)u.patrol=null;return cmdAttackP(us)};
const getCmdsP=getCmds;
getCmds=function(){const out=getCmdsP();const s=selEnts();
  if(s.length&&s.every(u=>u.k==='u'&&u.o===0&&isMil(u)&&!isNav(u)&&ST(u).atk>0)){
    out.splice(0,0,{ic:'🔁',nm:'Patrulhar',act:()=>cmdPatrol(s.slice())});if(out.length>12)out.length=12}
  return out};
