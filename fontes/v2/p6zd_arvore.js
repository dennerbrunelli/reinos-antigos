// =========================================================
// ÁRVORE DE EVOLUÇÃO ARRUMADA (base do Age + Rise of Nations)
//   · cada prédio cuida de uma coisa e pesquisa só o que é dele
//   · Celeiro/Serraria/Fundição/Refinaria: reforço de +30% na cidade só por existir (Rise)
//     e as pesquisas de coleta daquele recurso (Age: Moinho, Acampamento, Mineração)
//   · Serraria faz o papel do antigo Acampamento de lenhadores
//   · Quartel treina todos a pé (Rise): espadas, lanças, arcos → armas de fogo
//   · Estábulo: toda a cavalaria (inclui Arqueiro a Cavalo) · Oficina vira Fábrica na Era Industrial
//   · LINHAS DE EVOLUÇÃO: ao pesquisar "Evoluir", as tropas antigas viram as novas (Age e Rise)
// =========================================================
// ---------- prédios que saem do menu (continuam existindo em partidas salvas) ----------
const ARV_OUT={deposito:1,arquearia:1,academia:1};
ECO.length=0;ECO.push('tc','fazenda','celeiro','serraria','fundicao','refinaria','doca','mercado');
MIL.length=0;MIL.push('quartel','estabulo','oficina','forte','torre','muralha','silo');
CIV.length=0;CIV.push('biblioteca','universidade','templo','maravilha');
BT.serraria.age=0;BT.serraria.cost={wood:50};BT.fundicao.age=0;BT.fundicao.cost={wood:75};BT.celeiro.age=0;
Object.assign(NEUTRAL_OK,{serraria:1,fundicao:1,refinaria:1});
// ---------- quem treina o quê ----------
BT.quartel.train=['guer','espa','hopl','arq','arqc','mosq','fuzil','assalto','espia'];
BT.estabulo.train=['bat','carro','cav','arqcav','elef'];
BT.oficina.train=['pedra','canhao','bal'];
BT.fabrica.train=['pedra','canhao','artilharia','bal','tanque'];
for(const t of['hopl','arq','arqc','arqcav'])UT[t].at=t==='arqcav'?'estabulo':'quartel';
BT.arquearia.train=['arq','arqc'];BT.academia.train=['hopl'];
// ---------- linhas de evolução ----------
const UPL={atir:['arq','arqc','mosq','fuzil','assalto'],espada:['guer','espa'],cerco:['pedra','canhao','artilharia'],navio:['bguer','trir','galeao','encour']};
const UPL_OF={};for(const k in UPL)for(const t of UPL[k])UPL_OF[t]=k;
const upAt=t=>t==='artilharia'?'fabrica':UT[t].at==='fabrica'?'fabrica':UT[t].at;
for(const k in UPL){const L=UPL[k];for(let i=1;i<L.length;i++){const to=L[i],U=UT[to],c={};for(const r in U.cost)c[r]=Math.round(U.cost[r]*3/5)*5;
  TECH['up_'+to]={n:'Evoluir: '+U.n,ic:'⏫',at:upAt(to),age:U.age,req:i>1?'up_'+L[i-1]:null,cost:c,t:25+U.age*8,up:{line:k,to},
    d:'Todos os '+UT[L[i-1]].n+(i>1?' (e os mais antigos)':'')+' viram '+U.n+' e o prédio passa a treinar '+U.n+'.',fx:()=>{}}}}
function upCur(o,t){const k=UPL_OF[t];if(!k||o>=NP||!G||!G.P[o])return t;const L=UPL[k],T=G.P[o].techs;let c=0;for(let i=1;i<L.length;i++)if(T.includes('up_'+L[i]))c=i;return L[c]}
// ---------- pesquisas novas ----------
const melee=(T,n,f)=>{for(const k in T){const t=T[k];if(t.cls===n&&!t.rng)f(t)}};
Object.assign(TECH,{
  tear:{n:'Tear',ic:'🧵',at:'tc',age:0,cost:{food:75},t:30,d:'Aldeões +15 de vida e +1 de armadura',fx:T=>{T.vill.hp+=15;T.vill.arm+=1}},
  rede:{n:'Redes de Pesca',ic:'🎣',at:'celeiro',age:1,cost:{food:100,wood:100},t:40,d:'Barcos pesqueiros e pesca +25%',fx:(T,m)=>{m.gath.fish*=1.25;m.gath.fishb*=1.25}},
  adubo:{n:'Adubo',ic:'🧺',at:'celeiro',age:4,req:'irrigacao',cost:{food:400,wood:250,gold:100},t:60,d:'Fazendas +20%',fx:(T,m)=>{m.gath.farm*=1.2}},
  machadoF:{n:'Machado de Ferro',ic:'🪓',at:'serraria',age:2,req:'serra',cost:{food:200,wood:100},t:50,d:'Madeira +20%',fx:(T,m)=>{m.gath.wood*=1.2}},
  serraV:{n:'Serra a Vapor',ic:'⚙️',at:'serraria',age:5,req:'machadoF',cost:{food:400,gold:200},t:60,d:'Madeira +25%',fx:(T,m)=>{m.gath.wood*=1.25}},
  poco:{n:'Poço de Mina',ic:'🕳️',at:'fundicao',age:2,req:'picareta',cost:{food:200,wood:150},t:50,d:'Metal +20%',fx:(T,m)=>{m.gath.gold*=1.2;m.gath.stone*=1.2}},
  dinamite:{n:'Dinamite',ic:'🧨',at:'fundicao',age:5,req:'poco',cost:{food:400,wood:200,gold:100},t:60,d:'Metal +25%',fx:(T,m)=>{m.gath.gold*=1.25;m.gath.stone*=1.25}},
  perfura:{n:'Perfuração Profunda',ic:'🛢️',at:'refinaria',age:5,cost:{food:300,gold:250},t:60,d:'Petróleo +25%',fx:(T,m)=>{m.gath.oil*=1.25}},
  oleoduto:{n:'Oleoduto',ic:'🛤️',at:'refinaria',age:6,req:'perfura',cost:{food:450,gold:350},t:60,d:'Petróleo +25%',fx:(T,m)=>{m.gath.oil*=1.25}},
  alvenaria:{n:'Alvenaria',ic:'🧱',at:'universidade',age:1,cost:{food:150,wood:150},t:45,d:'Todos os prédios +15% de vida',fx:(T,m)=>{for(const t in BT)m.bldHp[t]=(m.bldHp[t]||1)*1.15}},
  arquitetura:{n:'Arquitetura',ic:'🏛️',at:'universidade',age:3,req:'alvenaria',cost:{food:300,wood:250},t:60,d:'Todos os prédios +20% de vida',fx:(T,m)=>{for(const t in BT)m.bldHp[t]=(m.bldHp[t]||1)*1.2}},
  barda:{n:'Barda de Couro',ic:'🐎',at:'estabulo',age:1,cost:{food:150,gold:50},t:45,d:'Cavalaria, elefantes e arqueiros a cavalo +1 de armadura',fx:T=>forCls(T,['cav','elef','arqcav'],t=>t.arm+=1)},
  ferradura:{n:'Ferraduras',ic:'🧲',at:'estabulo',age:1,cost:{food:150,wood:100},t:45,d:'Cavalaria e arqueiros a cavalo 15% mais rápidos',fx:T=>forCls(T,['cav','arqcav'],t=>t.spd*=1.15)},
  lancaF:{n:'Lanças de Ferro',ic:'🔱',at:'estabulo',age:2,req:'barda',cost:{food:250,gold:120},t:55,d:'Cavalaria e elefantes +2 de ataque',fx:T=>forCls(T,['cav','elef'],t=>t.atk+=2)},
  engenharia:{n:'Engenharia de Cerco',ic:'📐',at:'oficina',age:2,cost:{wood:200,gold:150},t:55,d:'Armas de cerco +1 de alcance e +15% de ataque',fx:T=>forCls(T,['cerco'],t=>{t.rng+=1;t.atk=Math.round(t.atk*1.15)})},
  dizimo:{n:'Dízimo',ic:'🪙',at:'templo',age:1,cost:{food:150,gold:75},t:45,d:'Cada Templo rende +20 de riqueza por minuto',fx:()=>{}},
  guildas:{n:'Guildas',ic:'⚖️',at:'mercado',age:1,cost:{food:150,wood:150},t:45,d:'Mercado: compra 15% mais barata e venda 15% mais cara',fx:()=>{}}});
// pesquisas antigas: lugar certo, efeito que faz sentido na economia do Rise (fazenda não acaba)
Object.assign(TECH.enxada,{at:'celeiro',d:'Fazendas +15%',fx:(T,m)=>{m.gath.farm*=1.15}});
Object.assign(TECH.arado,{at:'celeiro',d:'Fazendas +15%',fx:(T,m)=>{m.gath.farm*=1.15}});
Object.assign(TECH.irrigacao,{at:'celeiro',d:'Fazendas +20%',fx:(T,m)=>{m.gath.farm*=1.2}});
Object.assign(TECH.serra,{at:'serraria'});
Object.assign(TECH.picareta,{at:'fundicao',d:'Metal +20%',fx:(T,m)=>{m.gath.gold*=1.2;m.gath.stone*=1.2}});
Object.assign(TECH.roda,{at:'tc'});
Object.assign(TECH.sentinela,{at:'universidade'});Object.assign(TECH.muralhaF,{at:'universidade'});
Object.assign(TECH.couro,{at:'quartel',d:'Infantaria e arqueiros a pé +1 de armadura'});
Object.assign(TECH.ferraria,{at:'quartel',n:'Lâminas de Bronze',ic:'🗡️',d:'Infantaria de corpo a corpo +2 de ataque',fx:T=>melee(T,'inf',t=>t.atk+=2)});
Object.assign(TECH.forja,{at:'quartel',d:'Infantaria de corpo a corpo +3 de ataque',fx:T=>melee(T,'inf',t=>t.atk+=3)});
Object.assign(TECH.escudo,{at:'quartel',d:'Infantaria +1 de armadura',fx:T=>forCls(T,['inf'],t=>t.arm+=1)});
Object.assign(TECH.arcos,{at:'quartel'});
Object.assign(TECH.falange,{at:'quartel',req:null});
Object.assign(TECH.espadaL,{req:'up_espa'});
TECH.up_espa.req='machado';TECH.machado.d='Guerreiros viram Machadeiros: +2 de ataque e +10 de vida (primeiro passo da linha das espadas)';
// ---------- o que cada prédio pesquisa ----------
BT.tc.res=['tear','roda'];
BT.celeiro.res=['enxada','arado','irrigacao','rede','adubo'];
BT.serraria.res=['serra','machadoF','serraV'];
BT.fundicao.res=['picareta','poco','dinamite'];
BT.refinaria.res=['perfura','oleoduto'];
BT.mercado.res=['guildas'];
BT.universidade.res=['alvenaria','arquitetura','sentinela','muralhaF'];
BT.templo.res=['fe','medicina','dizimo'];
BT.quartel.res=['up_espa','machado','espadaL','falange','up_arqc','up_mosq','up_fuzil','up_assalto','couro','ferraria','escudo','forja','arcos'];
BT.estabulo.res=['barda','ferradura','lancaF'];
BT.oficina.res=['up_canhao','engenharia'];
BT.fabrica.res=['up_canhao','up_artilharia','engenharia'];
BT.doca.res=['up_trir','up_galeao','up_encour','velas','casco'];
BT.deposito.res=[];BT.arquearia.res=[];BT.academia.res=[];
// o poder dos gregos tinha o mesmo nome da pesquisa Falange
try{if(POWER.gregos)POWER.gregos.n='Fúria Espartana'}catch(e){}
Object.assign(BDESC,{
  serraria:'Lenhadores só cortam árvores perto dela (até '+CAMP_R+' quadrados, de 2 a 10 lenhadores, conforme as árvores). Reforça a madeira da cidade em +30%. Pesquisa as melhorias de madeira.',
  fundicao:'Reforça as minas de metal da cidade em +30%. Pesquisa as melhorias de mineração.',
  celeiro:'Reforça as fazendas da cidade em +30%. Pesquisa as melhorias de fazenda e de pesca.',
  refinaria:'Reforça o petróleo em +30%. Pesquisa as melhorias de petróleo. Era Industrial.',
  quartel:'Treina toda a infantaria: espadas, lanças, arcos e depois armas de fogo. Pesquisa as melhorias da infantaria e as evoluções.',
  estabulo:'Treina toda a cavalaria, inclusive o Arqueiro a Cavalo. Pesquisa as melhorias da cavalaria.',
  oficina:'Armas de cerco. Na Era Industrial vira Fábrica (artilharia e tanques).',
  universidade:'Eruditos estudam e geram conhecimento. Pesquisa a resistência dos prédios, das torres e das muralhas.',
  mercado:'Compra e venda de recursos, caravanas e mercadores. Pesquisa Guildas.'});
// ---------- serraria = acampamento de lenhadores ----------
campsOf=function(o){return G.B.filter(b=>!b.dead&&b.o===o&&(b.type==='serraria'||b.type==='deposito'||b.type==='tc')&&b.done>=1)};
// ---------- treinar: o prédio só oferece a tropa atual de cada linha ----------
{const ct=canTrain;canTrain=function(b,t){const c=upCur(b.o,t);if(c!==t)return UPL[UPL_OF[t]].indexOf(t)<UPL[UPL_OF[t]].indexOf(c)?'Esta tropa já evoluiu para '+STAT[b.o][c].n:'Pesquise antes: '+TECH['up_'+t].n;return ct(b,t)}}
// quem estiver na fila ou for treinado com o nome antigo sai já evoluído (vale para a IA também)
{const su=spawnUnit;spawnUnit=function(t,o,x,y){return su(o<NP?upCur(o,t):t,o,x,y)}}
// ao pesquisar a evolução: as tropas antigas viram as novas (mantém a % de vida)
{const rc=recompute;recompute=function(p){rc(p);if(!G||!G.P[p])return;
  for(const u of G.U){if(u.dead||u.o!==p)continue;const c=upCur(p,u.type);if(c===u.type)continue;const f=u.hp/Math.max(1,STAT[p][u.type].hp);u.type=c;u.hp=Math.max(1,Math.round(f*STAT[p][c].hp))}
  for(const b of G.B){if(b.dead||b.o!==p||!b.q)continue;for(let i=0;i<b.q.length;i++){const q=b.q[i];if(UT[q])b.q[i]=upCur(p,q)}}}}
// ---------- Oficina vira Fábrica na Era Industrial ----------
function arvOficina(){for(const b of G.B){if(b.dead||b.type!=='oficina'||b.o>=NP||G.P[b.o].age<5)continue;const f=b.hp/Math.max(1,b.mhp);b.type='fabrica';b.mhp=bldMaxHp(b);b.hp=Math.round(f*b.mhp);
  if(b.o===0&&running){toast('🏭 A Oficina de Cerco virou Fábrica: artilharia e tanques!')}G.dirty=true;mmDirty=true}}
// ---------- Dízimo: riqueza por templo ----------
let arvAcc=0;
{const rt=ronTick;ronTick=function(dt){rt(dt);if(!G)return;arvAcc+=dt;if(arvAcc<1)return;const s=arvAcc;arvAcc=0;arvOficina();
  for(let o=0;o<NP;o++){if(!G.P[o].techs.includes('dizimo'))continue;const n=G.B.filter(b=>!b.dead&&b.o===o&&b.type==='templo'&&b.done>=1).length;if(!n)continue;
    const g=capAdd(o,'wealth',n*20/60*s);G.P[o].res.wealth+=g;G.st.gath[o]+=g;if(o===0)incAdd('wealth',g)}}}
// ---------- menu e painéis do jogador ----------
function arvHideRes(o,list){const P=G.P[o];return(list||[]).filter(id=>{const T=TECH[id];if(!T)return false;if(P.techs.includes(id))return false;if(T.req&&!P.techs.includes(T.req))return false;return T.age<=P.age+1})}
{const g0=getCmds;getCmds=function(){const s=selEnts(),e=s[0];
  if(!e||e.o!==0)return g0();
  const P=G.P[0],sv=[],swap=(o,k,v)=>{sv.push([o,k,o[k]]);o[k]=v};
  // menu de construção: some a Oficina e entra a Fábrica na Era Industrial
  if(e.k==='u'&&P.age>=5){const i=MIL.indexOf('oficina');if(i>=0){swap(MIL,i,'fabrica')}}
  if(e.k==='b'&&e.done>=1){const T=BT[e.type];
    if(T.train)swap(T,'train',T.train.filter(t=>!UPL_OF[t]||upCur(0,t)===t));
    if(T.res)swap(T,'res',arvHideRes(0,T.res))}
  let out;try{out=g0()}finally{for(let i=sv.length-1;i>=0;i--){const[o,k,v]=sv[i];o[k]=v}}
  // botão de evolução mostra a tropa nova
  for(const c of out){if(c.tech==='⏫'){const id=Object.keys(TECH).find(k=>TECH[k].up&&TECH[k].n===c.nm);if(id){c.img=THUMB['u'+TECH[id].up.to];c.tech=null;c.ic=null;c.up=1}}}
  return out}}
// ícone ⏫ por cima da foto da tropa no botão de evolução
{const bh=btnHTML;btnHTML=function(c){const h=bh(c);return c.up?h+'<span class="upb">⏫</span>':h}}
{const css=document.createElement('style');css.textContent='#cmds .cb{position:relative}#cmds .cb .upb{position:absolute;left:1px;top:1px;font-size:13px;line-height:1;filter:drop-shadow(0 1px 1px #000)}';document.head.appendChild(css)}
// partidas salvas antes desta versão: fazendas e madeira continuam funcionando; o Acampamento antigo segue valendo
BT.serraria.drop=['wood'];BT.fundicao.drop=['gold','stone'];BT.refinaria.drop=['oil'];
// ---------- IA: pesquisa as evoluções e as melhorias nos prédios certos ----------
const ARV_AI=['machado','up_espa','up_arqc','up_mosq','up_fuzil','up_assalto','up_canhao','up_artilharia','up_trir','up_galeao','up_encour',
  'serra','picareta','enxada','tear','rede','arado','machadoF','poco','irrigacao','alvenaria','guildas','dizimo','serraV','dinamite','adubo','perfura','oleoduto','roda',
  'couro','ferraria','barda','arcos','escudo','machado','ferradura','forja','lancaF','engenharia','falange','espadaL','sentinela','muralhaF','arquitetura','velas','casco','fe','medicina'];
function arvAI(p){const P=G.P[p],res=P.res,nx=P.age<ENDAGE()?AGECOST[P.age+1]:{};
  const blds=G.B.filter(b=>!b.dead&&b.o===p&&b.done>=1&&!b.down);
  for(const id of ARV_AI){const T=TECH[id];if(!T||P.techs.includes(id)||T.age>P.age||(T.req&&!P.techs.includes(T.req)))continue;
    if(G.B.some(x=>!x.dead&&x.o===p&&x.q.includes('t:'+id)))continue;
    const b=blds.find(x=>(BT[x.type].res||[]).includes(id)&&(x.q.length===0||(x.type!=='tc'&&x.q.length<2&&T.up)));if(!b)continue;
    const keep=T.up?.4:.8;let ok=true;for(const k in T.cost)if(res[k]-(nx[k]||0)*keep<T.cost[k]){ok=false;break}
    if(!ok)continue;pay(p,T.cost);b.q.push('t:'+id);return}}
{let acc=0;const rt=ronTick;ronTick=function(dt){rt(dt);if(!G)return;acc+=dt;if(acc<3)return;acc=0;for(let p=1;p<NP;p++)if(G.P[p]&&!G.P[p]._out)arvAI(p)}}
// rótulo curto do botão de evolução: "→ Composto", "→ Mosqueteiro"
{const cs=cmdShort;cmdShort=function(c){if(c&&c.up){const w=String(c.nm).replace(/^Evoluir: /,'').split(' ');return'→ '+w[w.length-1].slice(0,10)}return cs(c)}}
// IA: Fundição perto do metal (reforço +30% e pesquisas de mineração)
{const ra=ronAI;ronAI=function(p,blds,has,any,build,htx,hty,toward,vills,army,res){ra(p,blds,has,any,build,htx,hty,toward,vills,army,res);
  if(!any('fundicao')&&vills.length>=12&&afford(p,BT.fundicao.cost)){const hb={x:(htx+.5)*TS,y:(hty+.5)*TS};const m=findRes('gold',hb.x,hb.y,18,p);if(m)build('fundicao',m.tx,m.ty,1,4);else build('fundicao',htx,hty,3,9)}}}
