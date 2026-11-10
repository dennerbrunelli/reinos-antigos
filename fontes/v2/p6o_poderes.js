
// =========================================================
//   PODERES DOS POVOS (etapa 6)
//   Cada povo tem um poder especial, usado pelo Centro Urbano (⚡), com tempo de espera.
//   Os poderes passivos (CIVS) já existiam; aqui entra o poder que você aciona.
//   Tropas únicas por povo: ainda não (dependem de arte nova).
// =========================================================
const POWER={
  egipcios:{n:'Bênção do Nilo',ic:'🌊',d:'Metal, madeira e comida colhidos 50% mais rápido por 30 s.',cd:180,dur:30,on(o){bfSet(o,'gath',1.5,30)}},
  assirios:{n:'Carros de Assur',ic:'🏹',d:'Arqueiros atiram 40% mais forte e os cavalos andam 20% mais rápido por 30 s.',cd:180,dur:30,on(o){bfSet(o,'atk',1.4,30,['arq','arqcav']);bfSet(o,'spd',1.2,30,['cav','arqcav','carro'])}},
  sumerios:{n:'Zigurate',ic:'🏛',d:'Cura 30% da vida de todas as suas tropas perto da capital.',cd:150,dur:0,on(o){healNear(o,30)}},
  gregos:{n:'Falange',ic:'🛡',d:'Infantaria 40% mais forte por 25 s.',cd:170,dur:25,on(o){bfSet(o,'atk',1.4,25,['inf'])}},
  fenicios:{n:'Rota Comercial',ic:'⛵',d:'Recebe 150 de riqueza na hora.',cd:150,dur:0,on(o){G.P[o].res.wealth+=150}},
  minoicos:{n:'Labirinto',ic:'🌀',d:'Revela o mapa inteiro.',cd:240,dur:0,on(){G.exp.fill(1);if(typeof updVis==='function')updVis()}},
  babilonios:{n:'Jardins Suspensos',ic:'🌿',d:'Colheita e conhecimento 30% mais rápidos por 45 s.',cd:180,dur:45,on(o){bfSet(o,'gath',1.3,45)}},
  persas:{n:'Carga Persa',ic:'🐎',d:'Cavalaria e elefantes 40% mais rápidos por 30 s.',cd:160,dur:30,on(o){bfSet(o,'spd',1.4,30,['cav','elef','arqcav'])}},
  hititas:{n:'Forja de Cerco',ic:'⚒',d:'Armas de cerco 50% mais fortes por 30 s.',cd:170,dur:30,on(o){bfSet(o,'atk',1.5,30,['cerco'])}},
  yamato:{n:'Bushido',ic:'⚔',d:'Todas as tropas 20% mais fortes e 15% mais rápidas por 25 s.',cd:170,dur:25,on(o){bfSet(o,'atk',1.2,25);bfSet(o,'spd',1.15,25)}},
  shang:{n:'Oráculo',ic:'🔮',d:'Mostra na hora o que a base inimiga tem.',cd:150,dur:0,on(o){const P=G.P[1-o].res||{};toast('🔮 Oráculo · inimigo: 🍖'+(P.food|0)+' 🪵'+(P.wood|0)+' 🪙'+(P.gold|0)+' · riqueza '+(P.wealth|0))}},
  choson:{n:'Hino de Guerra',ic:'🎺',d:'Todas as tropas 15% mais fortes por 20 s.',cd:150,dur:20,on(o){bfSet(o,'atk',1.15,20)}},
};
// buffs por jogador: G.bf[o][chave] = {m, until, cls}
function bfSet(o,k,m,secs,cls){if(!G.bf)G.bf=[];while(G.bf.length<=o)G.bf.push({});G.bf[o][k]={m,until:G.t+secs,cls:cls||null}}
function bfm(u,k){const B=G.bf&&G.bf[u.o];if(!B)return 1;const b=B[k];if(!b||G.t>=b.until)return 1;if(b.cls&&!b.cls.includes(UT[u.type].cls))return 1;return b.m}
function pwO(o,k){const b=G.bf&&G.bf[o]&&G.bf[o][k];return b&&G.t<b.until?b.m:1}
function healNear(o,pct){const c=ctr(G.B.find(b=>!b.dead&&b.o===o&&b.type==='tc')||{tx:0,ty:0,sz:1});let n=0;
  for(const u of G.U){if(u.dead||u.o!==o||!isMil(u)||u.inT)continue;if(hyp(u.x-c.x,u.y-c.y)>10*TS)continue;const mh=ST(u).hp;if(u.hp<mh){u.hp=Math.min(mh,u.hp+mh*pct/100);n++}}
  return n}
// tempo de espera por jogador
function pwUse(o){const P=civOf(o),pw=POWER[P.id];if(!pw){toast('Este povo não tem poder especial');return}
  G.pwT=G.pwT||[];while(G.pwT.length<=o)G.pwT.push(0);if(G.t<G.pwT[o]){toast('⚡ '+pw.n+' pronto em '+Math.ceil(G.pwT[o]-G.t)+' s');return}
  G.pwT[o]=G.t+pw.cd;pw.on(o);snd('click');
  if(o===0&&pw.dur===0&&pw.n!=='Oráculo')toast(pw.ic+' '+pw.n+': '+pw.d);
  if(o===0&&pw.dur>0)toast(pw.ic+' '+pw.n+' ativo por '+pw.dur+' s')}
// o poder aparece quando você escolhe o Centro Urbano
const getCmdsPw=getCmds;
getCmds=function(){const out=getCmdsPw();const s=selEnts();const e=s[0];
  if(s.length===1&&e.k==='b'&&e.o===0&&e.type==='tc'&&e.done>=1&&POWER[civOf(0).id]){
    const pw=POWER[civOf(0).id],cd=Math.max(0,(G.pwT&&G.pwT[0]||0)-G.t);
    const act=G.bf&&G.bf[0]&&Object.values(G.bf[0]).some(b=>G.t<b.until);
    out.splice(0,0,{ic:pw.ic,nm:pw.n+(cd>0?' · '+Math.ceil(cd)+'s':act?' · ativo':''),act:()=>pwUse(0)});
    if(out.length>12)out.length=12}
  return out};
// velocidade, ataque e colheita passam pelos buffs
const STPw=ST;
ST=function(u){const T=STPw(u);if(!u||u.k!=='u'||u.o>=NP||typeof G==='undefined'||!G||!G.bf||!T)return T;
  const ma=bfm(u,'atk'),ms=bfm(u,'spd');if(ma===1&&ms===1)return T;
  let c=PW_UP.get(T);if(!c){c={};PW_UP.set(T,c)}const key=ma+'|'+ms;let v=c[key];
  if(!v){v=c[key]=Object.assign({},T,{atk:T.atk*ma,spd:T.spd*ms})}return v};
const PW_UP=new WeakMap();
const gmultPw=gmult;
gmult=function(o){return gmultPw(o)*pwO(o,'gath')};
