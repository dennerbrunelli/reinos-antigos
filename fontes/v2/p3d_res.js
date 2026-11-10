
// =========================================================
//   OS 6 RECURSOS DO RISE (na fusão: o aldeão continua levando comida, madeira e metal)
//   · Metal: minas (o antigo ouro; as pedreiras viraram minério de metal)
//   · Riqueza: caravanas, mercadores nos raros, impostos e Mercados
//   · Conhecimento: Eruditos estudando na Universidade (até 7 por Universidade)
//   · Petróleo: chega com as eras industriais (ainda escondido)
// =========================================================
BT.universidade={n:'Universidade',sz:3,hp:500,cost:{wood:140,food:60},t:45,age:1,req:'biblioteca',los:4,pg:0,train:['erudito'],h:66};
UT.erudito={n:'Erudito',hp:20,atk:0,arm:0,rng:0,spd:1.05,cd:1,los:4,cost:{food:60,wood:25},t:18,age:1,at:'universidade',cls:'merc',civ:1,spr:[46,64,23,58]};
ECO.splice(ECO.indexOf('biblioteca')+1,0,'universidade');
const UNI_MAX=7,KNOW_RATE=.32,MARKET_WEALTH=4;   // conhecimento por erudito por segundo; riqueza por Mercado por minuto
// ---------- mapa: pedra vira minério de metal ----------
function stoneToMetal(){for(const r of G.R){if(r.sub==='stone'){r.sub='gold';r.rt='gold'}}}
const newGame1=newGame;
newGame=function(o){newGame1(o);stoneToMetal()};
// jogos salvos antes da v20: pedra vira metal e entram os recursos novos
const loadGame1=loadGame;
loadGame=function(){const ok=loadGame1();if(!ok)return ok;
  for(const P of G.P){const r=P.res;if(r.stone){r.gold=(r.gold||0)+r.stone;delete r.stone}for(const k of['wealth','know','oil'])if(r[k]==null)r[k]=k==='wealth'?50:0}
  stoneToMetal();return ok};
// ---------- Erudito: vai sozinho até uma Universidade com vaga e estuda ----------
function uniFor(u){let b=u.uni&&E.get(u.uni);const okB=x=>x&&!x.dead&&x.o===u.o&&x.type==='universidade'&&x.done>=1;
  if(okB(b))return b;let best=null,bd=1e9;
  for(const x of G.B){if(!okB(x))continue;const n=G.U.filter(s=>!s.dead&&s.type==='erudito'&&s.uni===x.id&&s!==u).length;if(n>=UNI_MAX)continue;const c=ctr(x),d=hyp(c.x-u.x,c.y-u.y);if(d<bd){bd=d;best=x}}
  u.uni=best?best.id:0;return best}
function scholarThink(u,dt){
  const b=uniFor(u);if(!b){if(u.st==='study')u.st='idle';return}
  const n=G.U.filter(s=>!s.dead&&s.type==='erudito'&&s.uni===b.id&&s.id<u.id).length,a=n/UNI_MAX*Math.PI*2+.4,c=ctr(b);
  const tx=c.x+Math.cos(a)*TS*2.1,ty=c.y+Math.sin(a)*TS*2.1;
  if(hyp(tx-u.x,ty-u.y)>TS*.8){if(u.st!=='study'||!u.goal){u.st='study';setGoal(u,{x:tx,y:ty})}if(moveAlong(u,dt)){u.goal=null;u.mv=false}return}
  u.st='study';u.mv=false;u.work=true;u.an+=dt*3;faceTo(u,c.x,c.y);
  const k=KNOW_RATE*dt*(u.o<NP?MODS[u.o].gath.know:1)*(1+.1*lvl(u.o,'sci'))*gmult(u.o);
  G.P[u.o].res.know+=k;G.st.gath[u.o]+=k;if(u.o===0)incAdd('know',k)}
const updUnit2=updUnit;
updUnit=function(u,dt){if(u.type==='erudito'&&(u.st==='idle'||u.st==='study')){if(u.cd>0)u.cd-=dt;u.work=false;scholarThink(u,dt);return}updUnit2(u,dt)};
// ---------- Mercados rendem riqueza ----------
const ronTick2=ronTick;
ronTick=function(dt){ronTick2(dt);
  for(let o=0;o<NP;o++){const n=G.B.filter(b=>!b.dead&&b.o===o&&b.type==='mercado'&&b.done>=1).length;if(!n)continue;
    const g=n*MARKET_WEALTH*(RAREON[o]&&RAREON[o].marmore?1.5:1)*(1+.2*lvl(o,'com'))*dt/60;G.P[o].res.wealth+=g;if(o===0)incAdd('wealth',g)}};
// ---------- IA: Universidade e eruditos ----------
const ronAI1=ronAI;
ronAI=function(p,blds,has,any,build,htx,hty,toward,vills,army,res){
  ronAI1(p,blds,has,any,build,htx,hty,toward,vills,army,res);
  const P=G.P[p];if(P.age<1)return;
  if(has('biblioteca')&&vills.length>=12&&!any('universidade'))build('universidade',htx,hty,4,12);
  const u=blds.find(b=>b.type==='universidade'&&b.done>=1);if(!u)return;
  const want={facil:3,normal:5,dificil:7}[G.diff]+(P.age>=2?2:0);
  const n=G.U.filter(x=>!x.dead&&x.o===p&&x.type==='erudito').length+u.q.filter(q=>q==='erudito').length;
  if(n<want&&u.q.length<2&&afford(p,costOf(p,'erudito'))&&P.pop+2<P.cap){pay(p,costOf(p,'erudito'));u.q.push('erudito')}};
