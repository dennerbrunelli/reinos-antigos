// =========================================================
// FRONTEIRAS, CIDADES E COLETA IGUAIS AO RISE OF NATIONS
// (pesquisado: manual do Rise, wiki do Rise, guias da comunidade)
//   FRONTEIRA
//   · nada se constrói fora da sua fronteira (em terra aliada: só militares e pontos de coleta)
//   · a fronteira cresce com Cidades e Fortes; a Torre NÃO mexe na fronteira
//   · Cidade nova e Forte só dentro da fronteira; o Forte não pode ficar colado em cidade ou outro forte
//   · cada Cidade tem o seu RAIO ECONÔMICO (o círculo): fazendas, Celeiro, Serraria, Fundição,
//     Refinaria, Biblioteca, Mercado, Universidade e Templo só dentro dele, UM de cada por cidade;
//     até 5 fazendas por cidade. Prédios militares e pontos de coleta: em qualquer lugar da fronteira
//   COLETA (ninguém tira direto do recurso: trabalha num prédio de coleta)
//   · Acampamento de lenhadores: perto das árvores; vagas conforme as árvores em volta (até 10)
//   · Mina: encostada num monte de minério; vagas conforme o tamanho do monte (até 10);
//     cada povo só faz UMA mina por monte; a partir da Era Clássica
//   · Poço de Petróleo: ao lado da mancha de petróleo; 1 trabalhador que rende muito
//   · Fazenda: 1 trabalhador. Nada disso acaba.
//   · ao ficar pronto, cada prédio de coleta dá um bônus: +5 por vaga (fazenda +20, poço +50)
//   · Celeiro/Serraria/Fundição reforçam só os pontos de coleta da MESMA cidade (+50%),
//     e as 3 pesquisas de cada um sobem o reforço para +100%, +150% e +200%. A Refinaria vale para todos os poços.
//   · cada Cidade rende sozinha um pouco de comida e madeira
// =========================================================
const CITY_R=11,FORT_GAP=10,CITY_INCOME=20;   // raio econômico; distância mínima do forte; comida e madeira por minuto por cidade
const GSITE={deposito:'wood',mina:'gold',petro:'oil'};
const SITE_SUB={deposito:'tree',mina:'gold',petro:'oil'};
const SUB_SITE={tree:'deposito',gold:'mina',stone:'mina',oil:'petro'};
const SITE_MUL={wood:1,gold:1,oil:4.5};
const CITYB={fazenda:1,celeiro:1,serraria:1,fundicao:1,refinaria:1,biblioteca:1,mercado:1,universidade:1,templo:1};
const ONE_CITY={celeiro:1,serraria:1,fundicao:1,refinaria:1,biblioteca:1,mercado:1,universidade:1,templo:1};
const MILB={quartel:1,estabulo:1,oficina:1,fabrica:1,doca:1,torre:1,muralha:1,silo:1,arquearia:1,academia:1};
const BOOST_OF={fazenda:'celeiro',deposito:'serraria',mina:'fundicao',petro:'refinaria'};
const BOOST_TECH={celeiro:['enxada','arado','irrigacao'],serraria:['serra','machadoF','serraV'],fundicao:['picareta','poco','dinamite'],refinaria:['perfura','oleoduto']};
// ---------- prédios de coleta ----------
Object.assign(BT.deposito,{n:'Acampamento de lenhadores',cost:{food:50},t:20,age:0,drop:['wood']});delete BT.deposito.res;
BT.mina={n:'Mina',sz:2,hp:400,cost:{wood:50},t:20,age:1,los:3,pg:0,h:40,drop:['gold']};
BT.petro={n:'Poço de Petróleo',sz:1,hp:300,cost:{wood:100,gold:50},t:25,age:5,los:3,pg:0,h:50,drop:['oil']};
BT.serraria.drop=null;BT.fundicao.drop=null;BT.refinaria.drop=null;BT.fundicao.age=1;
for(const k in NEUTRAL_OK)delete NEUTRAL_OK[k];
ECO.length=0;ECO.push('tc','fazenda','deposito','mina','petro','celeiro','serraria','fundicao','refinaria','doca','mercado');
// ---------- pesquisas de reforço (3 níveis, como no Rise) ----------
{const lv=[1,3,5];for(const k in BOOST_TECH)BOOST_TECH[k].forEach((id,i)=>{const T=TECH[id];T.age=k==='refinaria'?[6,7][i]:lv[i];T.req=i?BOOST_TECH[k][i-1]:null;
  T.d=BT[k].n+': reforço sobe para +'+(50*(i+2))+'% nos pontos de coleta da cidade'+(k==='refinaria'?' (todos os poços)':'');T.fx=()=>{}})}
BT.celeiro.res=['enxada','arado','irrigacao','rede'];
Object.assign(BDESC,{
  deposito:'Ponto de coleta de madeira. Construa perto das árvores: as vagas (até 10) dependem de quantas árvores há em volta. Ao ficar pronto, dá +5 de madeira por vaga.',
  mina:'Ponto de coleta de metal. Encoste num monte de minério: o tamanho do monte dá as vagas (até 10). Cada povo só faz uma mina por monte. Era Clássica.',
  petro:'Ponto de coleta de petróleo, ao lado da mancha. 1 trabalhador que rende muito. Era Industrial.',
  celeiro:'Um por cidade, dentro do círculo. Reforça as fazendas da MESMA cidade em +50% (pesquisas: +100%, +150%, +200%).',
  serraria:'Uma por cidade, dentro do círculo. Reforça os acampamentos de lenhadores da MESMA cidade em +50% (pesquisas até +200%).',
  fundicao:'Uma por cidade, dentro do círculo. Reforça as minas da MESMA cidade em +50% (pesquisas até +200%). Era Clássica.',
  refinaria:'Uma por cidade. Reforça TODOS os seus poços de petróleo em +50% (pesquisas até +150%).',
  forte:'Defesa forte e treina Generais. Amplia a fronteira como uma cidade. Só dentro da sua fronteira e longe de cidades e de outros fortes.',
  torre:'Defesa: atira flechas. Não amplia a fronteira.',
  tc:'Coração da cidade: treina aldeões, amplia a fronteira e tem o círculo econômico onde ficam fazendas e prédios da cidade. Rende sozinho um pouco de comida e madeira.'});
// ---------- cidade dona de um ponto (raio econômico) ----------
cityOf=function(o,x,y){let best=null,bd=CITY_R*TS+.01;for(const b of G.B){if(b.dead||b.o!==o||b.type!=='tc')continue;const d=hyp(ctr(b).x-x,ctr(b).y-y);if(d<bd){bd=d;best=b}}return best};
function cityOfB(b){const c=ctr(b);return cityOf(b.o,c.x,c.y)}
// ---------- fronteira: cidades e fortes; torre não ----------
infR=function(b){const cv=(G.P[b.o]&&G.P[b.o].cvc)||0;if(b.type==='forte')return 12+cv;if(b.type==='tc')return(b.id===G.P[b.o].capId?INF_CAP:INF_CITY+1)+cv;return 0};
// ---------- onde pode construir ----------
domWhy=function(type,tx,ty,o){
  if(o>=NP||!G)return'';const T=BT[type],sz=T.sz,cx=tx+sz/2,cy=ty+sz/2;let ally2=false;
  for(let y=ty;y<ty+sz;y++)for(let x=tx;x<tx+sz;x++){const d=DOM[y*MW+x];
    if(d===o)continue;
    if(d>=0&&d<NP&&!ally(d,o))return'⛔ Não dá para construir no território inimigo';
    if(d>=0&&d<NP){ally2=true;continue}
    return'🚩 Só dentro da sua fronteira (a linha '+(o===0?'azul':'da cor do seu reino')+')'}
  if(ally2&&!MILB[type]&&!GSITE[type])return'🤝 Em terra aliada só prédios militares e pontos de coleta';
  if(type==='tc'){let n=0;
    for(const b of G.B){if(b.dead||b.type!=='tc')continue;const d=hyp(b.tx+b.sz/2-cx,b.ty+b.sz/2-cy);
      if(b.o===o){n++;if(d<CITY_MIN_OWN)return'🏘 Cidade nova: pelo menos '+CITY_MIN_OWN+' quadrados longe das suas cidades'}
      else if(b.o<NP&&d<CITY_MIN_EN)return'🏘 Cidade nova: pelo menos '+CITY_MIN_EN+' quadrados longe das outras cidades'}
    if(n>=cityMax(o))return'🏘 Limite de '+cityMax(o)+' cidades · pesquise Cívica na Biblioteca para fundar mais'}
  if(type==='forte'){for(const b of G.B){if(b.dead||(b.type!=='tc'&&b.type!=='forte'))continue;if(hyp(b.tx+b.sz/2-cx,b.ty+b.sz/2-cy)<FORT_GAP)return'🏰 O Forte precisa ficar a '+FORT_GAP+' quadrados de cidades e de outros fortes'}}
  if(CITYB[type]){const c=cityOf(o,cx*TS,cy*TS);if(!c)return'🏘 Só dentro do círculo de uma cidade sua';
    if(type==='fazenda'&&farmsOf(c)>=FARMS_CITY)return'🌾 Esta cidade já tem '+FARMS_CITY+' fazendas';
    if(ONE_CITY[type]&&G.B.some(b=>!b.dead&&b.o===o&&b.type===type&&cityOfB(b)===c))return'🏘 Esta cidade já tem '+BT[type].n+' (um por cidade)'}
  if(type==='mina'){const m=mineMtn(tx,ty,sz,o);if(m==null)return'⛏ Encoste a mina num monte de minério';if(m<0)return'⛏ Você já tem uma mina neste monte (uma por monte)'}
  if(type==='petro'){if(!wellOil(tx,ty,sz))return'🛢 Construa ao lado de uma mancha de petróleo livre'}
  if(type==='deposito'){if(treesNear(cx*TS,cy*TS)<2)return'🪓 Construa perto das árvores'}
  return''};
// ---------- montes de minério (grupos de pedras de metal) ----------
function mtnInit(){G.mtn={};let id=0;const at=new Map();for(const r of G.R)if(!r.dead&&(r.sub==='gold'||r.sub==='stone')){r.mt=0;at.set(r.tx+','+r.ty,r)}
  for(const r of at.values()){if(r.mt)continue;id++;let n=0;const st=[r];r.mt=id;
    while(st.length){const a=st.pop();n++;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const b=at.get((a.tx+dx)+','+(a.ty+dy));if(b&&!b.mt){b.mt=id;st.push(b)}}}
    G.mtn[id]={n}}
  for(const b of G.B)if(b.type==='mina'&&!b.dead)b.mt=mineMtn(b.tx,b.ty,b.sz,-1)}
function mtnSlots(id){const m=G.mtn&&G.mtn[id];return m?clamp(Math.round(m.n*.6),2,10):0}
// devolve o monte encostado (id), null se nenhum, -1 se o povo já tem mina em todos os montes encostados
function mineMtn(tx,ty,sz,o){let found=null;
  for(let y=ty-1;y<=ty+sz;y++)for(let x=tx-1;x<=tx+sz;x++){if(!inMap(x,y))continue;const r=E.get(occ[idx(x,y)]);if(!r||r.k!=='r'||!r.mt)continue;
    if(o>=0&&G.B.some(b=>!b.dead&&b.o===o&&b.type==='mina'&&b.mt===r.mt)){if(found==null)found=-1;continue}
    if(found==null||found<0||mtnSlots(r.mt)>mtnSlots(found))found=r.mt}
  return found}
function wellOil(tx,ty,sz){for(let y=ty-1;y<=ty+sz;y++)for(let x=tx-1;x<=tx+sz;x++){if(!inMap(x,y))continue;const r=E.get(occ[idx(x,y)]);if(r&&r.k==='r'&&r.sub==='oil'&&!G.B.some(b=>!b.dead&&b.type==='petro'&&b.oil===r.id))return r}return null}
function treesNear(x,y){let n=0;for(const r of G.R)if(!r.dead&&r.sub==='tree'&&hyp(ctr(r).x-x,ctr(r).y-y)<CAMP_R*TS)n++;return n}
{const pb=placeBld;placeBld=function(type,o,tx,ty,done){const b=pb(type,o,tx,ty,done);if(type==='mina')b.mt=mineMtn(tx,ty,b.sz,-1);if(type==='petro'){const r=wellOil(tx,ty,b.sz);if(r)b.oil=r.id}return b}}
// ---------- vagas ----------
function siteCap(b){if(b.type==='petro')return 1;if(b.type==='mina')return mtnSlots(b.mt)||2;if(b.type==='deposito')return campCap(b);return 1}
function siteFree(b,u){let n=0;for(const v of G.U)if(!v.dead&&v!==u&&v.st==='gather'&&v.tg===b.id)n++;return n<siteCap(b)}
function siteSpots(b){if(b._spT>G.t-15)return b._sp;const c=ctr(b),L=[];
  if(b.type==='deposito'){for(const r of G.R)if(!r.dead&&r.sub==='tree'&&hyp(ctr(r).x-c.x,ctr(r).y-c.y)<CAMP_R*TS)L.push(r)}
  else if(b.type==='mina'){for(const r of G.R)if(!r.dead&&r.mt===b.mt&&hyp(ctr(r).x-c.x,ctr(r).y-c.y)<5*TS)L.push(r)}
  else if(b.type==='petro'){const r=E.get(b.oil);if(r&&!r.dead)L.push(r)}
  L.sort((a,d)=>hyp(ctr(a).x-c.x,ctr(a).y-c.y)-hyp(ctr(d).x-c.x,ctr(d).y-c.y));b._sp=L;b._spT=G.t;return L}
function pickSpot(b,u){const L=siteSpots(b);if(!L.length)return null;const used=new Map();
  for(const v of G.U)if(!v.dead&&v!==u&&v.st==='gather'&&v.tg===b.id&&v.ws)used.set(v.ws,(used.get(v.ws)||0)+1);
  let best=null,bu=1e9;for(const r of L){const n=used.get(r.id)||0;if(n<bu){bu=n;best=r}}return best}
// ---------- dar a ordem ----------
function siteFor(o,r,x,y){const want=SUB_SITE[r?r.sub:null];if(!want)return null;let best=null,bd=1e9;
  for(const b of G.B){if(b.dead||b.o!==o||b.type!==want||b.done<1||!siteFree(b,null))continue;
    if(r){if(want==='mina'&&b.mt!==r.mt)continue;if(want==='petro'&&b.oil!==r.id)continue;if(want==='deposito'&&hyp(ctr(b).x-ctr(r).x,ctr(b).y-ctr(r).y)>CAMP_R*TS)continue}
    const d=hyp(ctr(b).x-x,ctr(b).y-y);if(d<bd){bd=d;best=b}}return best}
function siteWhy(r){return r.sub==='tree'?'🪓 Para cortar madeira, construa um Acampamento de lenhadores perto destas árvores (ou o que existe está cheio)':
  r.sub==='oil'?'🛢 Construa um Poço de Petróleo ao lado da mancha (ou o poço já tem trabalhador)':'⛏ Para tirar metal, construa uma Mina encostada neste monte (ou a mina está cheia)'}
{const og=orderGather;orderGather=function(u,r){
  if(r&&u&&u.type==='vill'&&u.o<NP){
    if(r.k==='b'&&GSITE[r.type]){if(r.o!==u.o||r.done<1){const c=ctr(r);orderMove(u,c.x,c.y);return false}
      if(!siteFree(r,u)){if(u.o===0&&!(UI.siteT>G.t)){UI.siteT=G.t+3;toast('👥 '+BT[r.type].n+' cheio: '+siteCap(r)+' vagas')}return false}
      reset(u);u.st='gather';u.tg=r.id;u.lastRes=r.id;u.lsub=SITE_SUB[r.type];u.ws=0;u.mv=false;u.fail=0;return true}
    if(r.k==='r'&&SUB_SITE[r.sub]){const s=siteFor(u.o,r,u.x,u.y);if(s)return orderGather(u,s);
      if(u.o===0&&!(UI.siteT>G.t)){UI.siteT=G.t+3;toast(siteWhy(r))}return false}}
  return og(u,r)}}
// achar trabalho de madeira/metal/petróleo = achar um prédio de coleta com vaga
{const fr=findRes;findRes=function(sub,x,y,maxD,o){if(SUB_SITE[sub]&&o!=null&&o<NP){const want=SUB_SITE[sub];let best=null,bd=maxD*TS*1.5;
    for(const b of G.B){if(b.dead||b.o!==o||b.type!==want||b.done<1||!siteFree(b,null))continue;const d=hyp(ctr(b).x-x,ctr(b).y-y);if(d<bd){bd=d;best=b}}return best}
  return fr(sub,x,y,maxD,o)}}
canGather=(cg=>function(u,r){if(r&&r.k==='b'&&GSITE[r.type])return u.type==='vill'&&r.o===u.o;return cg(u,r)})(canGather);
// ---------- o trabalho no ponto de coleta ----------
const SINC={};let SINCT=0;
{const dg=doGather;doGather=function(u,T,dt){const b=E.get(u.tg);if(!(b&&b.k==='b'&&GSITE[b.type]))return dg(u,T,dt);
  if(b.dead||b.done<1||b.o!==u.o){u.st='idle';return}
  let s=u.ws&&E.get(u.ws);if(!s||s.dead||!siteSpots(b).includes(s)){s=pickSpot(b,u);u.ws=s?s.id:0}
  if(!s){u.st='idle';return}
  if(!approach(u,s,dt,24))return;
  u.work=true;u.an+=dt*8;const c=ctr(s);faceTo(u,c.x,c.y);
  const cat=GSITE[b.type],rt=cat;
  const rate=GATH[cat]*MODS[u.o].gath[cat]*gmult(u.o)*seasonGath(cat)*ronGath(u.o,cat)*boostOf(u.o,cat,b)*SITE_MUL[cat];
  const g=capAdd(u.o,rt,rate*dt);G.P[u.o].res[rt]+=g;G.st.gath[u.o]+=g;
  if(u.o===0){SINC[rt]=(SINC[rt]||0)+g;if(G.t-SINCT>=1||G.t<SINCT){for(const k in SINC)if(SINC[k]>0){incAdd(k,SINC[k]);SINC[k]=0}SINCT=G.t}}
  u.carry=0;const ph=(u.an/1.4|0)%3;if(ph!==u._ph&&ph===0)snd(cat==='wood'?'chop':cat==='gold'?'mine':'splash',u);u._ph=ph}}
// ---------- reforço: só na mesma cidade (a Refinaria vale para todos os poços) ----------
function boostLv(o,bt){return(BOOST_TECH[bt]||[]).filter(id=>G.P[o].techs.includes(id)).length}
boostOf=function(o,cat,r){if(o>=NP||!r||r.k!=='b')return 1;const bt=BOOST_OF[r.type];if(!bt)return 1;
  if(bt==='refinaria')return G.B.some(b=>!b.dead&&b.o===o&&b.type==='refinaria'&&b.done>=1)?1+.5*(1+boostLv(o,bt)):1;
  const c=cityOfB(r);if(!c)return 1;
  return G.B.some(b=>!b.dead&&b.o===o&&b.type===bt&&b.done>=1&&cityOfB(b)===c)?1+.5*(1+boostLv(o,bt)):1};
// ---------- bônus ao ficar pronto ----------
{const ob=onBuilt;onBuilt=function(b){ob(b);if(b.o>=NP)return;const P=G.P[b.o];let k=null,a=0;
  if(b.type==='deposito'){k='wood';a=5*siteCap(b)}else if(b.type==='mina'){k='gold';a=5*siteCap(b)}else if(b.type==='petro'){k='oil';a=50}else if(b.type==='fazenda'){k='food';a=20}
  if(k){P.res[k]+=a;if(b.o===0&&b.type!=='fazenda')toast('✅ '+BT[b.type].n+' pronto: '+siteCap(b)+(siteCap(b)>1?' vagas':' vaga')+' · +'+a+' de '+RNM[k])}
  // aldeões que construíram já começam a trabalhar nele
  if(GSITE[b.type])for(const v of G.U)if(!v.dead&&v.o===b.o&&v.type==='vill'&&v.st==='build'&&v.tg===b.id){if(orderGather(v,b)===false)v.st='idle'}}}
// ---------- renda fixa de cada cidade (comida e madeira) ----------
{let acc=0;const rt=ronTick;ronTick=function(dt){rt(dt);if(!G)return;acc+=dt;if(acc<2)return;const s=acc;acc=0;
  for(let o=0;o<NP;o++){const n=G.B.filter(b=>!b.dead&&b.o===o&&b.type==='tc'&&b.done>=1&&!b.down).length;if(!n)continue;
    for(const k of['food','wood']){const g=capAdd(o,k,n*CITY_INCOME/60*s);G.P[o].res[k]+=g;G.st.gath[o]+=g;if(o===0)incAdd(k,g)}}}}
// ---------- tocar no prédio de coleta com aldeões ----------
{const so=smartOrder;smartOrder=function(us,tgt,x,y,o){if(tgt&&tgt.k==='b'&&tgt.o===o&&GSITE[tgt.type]&&tgt.done>=1&&tgt.hp>=tgt.mhp){const vs=us.filter(u=>u.type==='vill'&&!isNav(u)),rest=us.filter(u=>!vs.includes(u));
    let full=false;for(const u of vs){if(orderGather(u,tgt)===false){full=true;const p=freeAround(tgt,u,false);orderMove(u,p.x,p.y)}}
    if(rest.length)so(rest,tgt,x,y,o);return vs.length?'res':so(us,tgt,x,y,o)}
  return so(us,tgt,x,y,o)}}
// ---------- novo jogo / jogo salvo ----------
{const ng=newGame;newGame=function(o){ng(o);mtnInit()};window.__RA.newGame=newGame}
{const lg=loadGame;loadGame=function(){const ok=lg();if(ok&&G)mtnInit();return ok}}
// ---------- círculo da cidade ao posicionar prédio da cidade ----------
{const dp=drawPlacingFlat;drawPlacingFlat=function(){dp();if(!placing)return;const t=placing.type;
  if(CITYB[t]||t==='tc'||t==='forte'){ctx.save();ctx.setLineDash([TS*.5,TS*.35]);ctx.lineWidth=3;
    for(const b of G.B){if(b.dead||b.o!==0||b.type!=='tc')continue;const c=ctr(b);
      if(CITYB[t]){ctx.strokeStyle='rgba(255,226,140,.9)';ctx.beginPath();ctx.arc(c.x,c.y,CITY_R*TS,0,Math.PI*2);ctx.stroke()}
      else{ctx.strokeStyle='rgba(255,120,100,.8)';ctx.beginPath();ctx.arc(c.x,c.y,(t==='tc'?CITY_MIN_OWN:FORT_GAP)*TS,0,Math.PI*2);ctx.stroke()}}
    ctx.restore()}}}
// ---------- desenhos da Mina e do Poço ----------
{const pb7=paintBld;paintBld=function(g,P,type,st,C,S){const m=C.m;
  if(type==='mina'){shadowB(g,P,4,4,60,60,30);ibox(g,P,4,4,60,60,0,4,'#6b5a45');
    ibox(g,P,6,6,36,40,4,16,'#7d756a');ibox(g,P,9,9,33,37,20,7,'#8f877a');ibox(g,P,13,13,29,33,27,4,'#9d9588');
    ibox(g,P,34,12,38,36,4,15,'#6a4222');ibox(g,P,30,12,40,16,19,3,'#5a3418');ibox(g,P,30,32,40,36,19,3,'#5a3418');ibox(g,P,35,16,37,32,4,13,'#120c08');
    ibox(g,P,42,14,46,58,4,1,'#4a4a50');ibox(g,P,50,14,54,58,4,1,'#4a4a50');ibox(g,P,42,40,54,52,5,7,'#7a5230');ibox(g,P,43,41,53,51,12,3,'#c9a640');
    ibox(g,P,8,44,24,58,4,5,'#b8963a');flagP(g,P,30,8,30,m,10);return}
  if(type==='petro'){shadowB(g,P,4,4,60,60,46);ibox(g,P,6,6,58,58,0,4,'#4a4a4a');
    ibox(g,P,26,26,38,38,4,36,'#7a5a3a');ibox(g,P,22,22,42,42,40,4,'#5a3a20');ibox(g,P,12,28,52,36,44,4,'#3a3a3e');
    ibox(g,P,10,26,18,38,30,14,'#2a2a2e');ibox(g,P,44,40,56,54,4,10,'#a83a2a');band(g,P,26,26,38,38,24,m);return}
  return pb7(g,P,type,st,C,S)}}
// ---------- legenda e ajuda ----------
{const p=[...document.querySelectorAll('p')].find(e=>/ECONOMIA \(como no Rise\)/.test(e.innerHTML));if(p)p.innerHTML='<b>ECONOMIA E FRONTEIRA (iguais ao Rise)</b><br>'+
  'O aldeão trabalha num <b>prédio de coleta</b> e o recurso entra direto. Nada acaba (só caça e frutas).<br>'+
  '🪓 <b>Acampamento de lenhadores</b> perto das árvores: até 10 vagas, conforme as árvores.<br>⛏ <b>Mina</b> encostada num monte de minério (Era Clássica): o tamanho do monte dá as vagas (até 10); uma mina por monte para cada povo.<br>'+
  '🛢 <b>Poço de Petróleo</b> (Era Industrial): 1 vaga que rende muito.<br>🌾 Até <b>5 fazendas</b> por cidade, 1 aldeão em cada.<br>'+
  '🏘 Cada cidade tem um <b>círculo econômico</b>: fazendas, Celeiro, Serraria, Fundição, Refinaria, Biblioteca, Mercado, Universidade e Templo ficam dentro dele, um de cada por cidade. Celeiro, Serraria e Fundição reforçam só a própria cidade (+50%, com pesquisas até +200%).<br>'+
  '🚩 Nada se constrói fora da fronteira. A fronteira cresce com <b>Cidades</b> e <b>Fortes</b> (a Torre não mexe nela).'}
// menu de construção: some o que ainda está a mais de uma era de distância (sobra lugar para Parar)
{const g0=getCmds;getCmds=function(){const e=selEnts()[0];if(!e||e.o!==0||e.k!=='u')return g0();const P=G.P[0],sv=ECO.slice();
  ECO.length=0;ECO.push(...sv.filter(t=>BT[t].age<=P.age+1));try{return g0()}finally{ECO.length=0;ECO.push(...sv)}}}
// ---------- IA: minas nos montes da fronteira e poços no petróleo ----------
{const ra=ronAI;ronAI=function(p,blds,has,any,build,htx,hty,toward,vills,army,res){ra(p,blds,has,any,build,htx,hty,toward,vills,army,res);const P=G.P[p];
  if(P.age>=BT.mina.age){const mines=blds.filter(b=>b.type==='mina');
    if(mines.length<1+Math.floor(vills.length/14)&&!mines.some(b=>b.done<1)&&afford(p,BT.mina.cost)){let best=null,bd=1e9;
      for(const r of G.R){if(r.dead||!r.mt||DOM[idx(r.tx,r.ty)]!==p||(r.badMine&&G.t-r.badMine<90))continue;if(mines.some(b=>b.mt===r.mt))continue;const d=hyp(r.tx-htx,r.ty-hty)-mtnSlots(r.mt)*.6;if(d<bd){bd=d;best=r}}
      if(best&&!build('mina',best.tx,best.ty,1,3))best.badMine=G.t}}
  if(P.age>=BT.petro.age){const wells=blds.filter(b=>b.type==='petro');
    if(wells.length<(P.age>=6?8:4)&&!wells.some(b=>b.done<1)&&afford(p,BT.petro.cost)){let best=null,bd=1e9;
      for(const r of G.R){if(r.dead||r.sub!=='oil'||DOM[idx(r.tx,r.ty)]!==p||(r.badMine&&G.t-r.badMine<90))continue;if(G.B.some(b=>!b.dead&&b.type==='petro'&&b.oil===r.id))continue;const d=hyp(r.tx-htx,r.ty-hty);if(d<bd){bd=d;best=r}}
      if(best&&!build('petro',best.tx,best.ty,1,2))best.badMine=G.t}}}}
