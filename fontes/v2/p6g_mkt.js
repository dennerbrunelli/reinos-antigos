
// =========================================================
//   MERCADO DE TROCA E LIMITE DE COMÉRCIO (como no Rise)
//   · no Mercado: comprar e vender comida, madeira e metal por riqueza; o preço sobe quando compram
//     e desce quando vendem, e volta devagar ao normal (conhecimento não se negocia)
//   · limite de comércio: cada recurso coletado por aldeões/barcos rende no máximo X por minuto;
//     o que passa do limite se perde. A linha Comércio e as eras aumentam o limite.
// =========================================================
const TRADE_K=['food','wood','gold'],TRADE_N=100,TRADE_IC={food:'🍖',wood:'🪵',gold:'⛓'};
const CAP_BASE=300,CAP_AGE=60,CAP_COM=120;
function capOf(o,k){return Math.round((CAP_BASE+CAP_AGE*G.P[o].age+CAP_COM*lvl(o,'com'))*(o!==0&&o<NP?Math.max(1,DIFF[G.diff].gm):1))}
function capInit(){if(!G.cap||G.cap.length<NP){G.cap=[];for(let p=0;p<NP;p++)G.cap.push({})}
  if(!G.capHit||G.capHit.length<NP){G.capHit=[];for(let p=0;p<NP;p++)G.capHit.push({})}
  if(!G.mkt||G.mkt.length<NP){G.mkt=[];for(let p=0;p<NP;p++)G.mkt.push({food:1,wood:1,gold:1})}}
// quanto deste depósito entra (o resto passa do limite)
function capAdd(o,k,a){if(o>=NP||!TRADE_K.includes(k))return a;capInit();const C=G.cap[o];if(C[k]==null)C[k]=capOf(o,k)/3;
  const ok=Math.min(a,C[k]);C[k]-=ok;if(ok<a-.01){G.capHit[o][k]=G.t;if(o===0&&G.t-(UI.capT&&UI.capT[k]||-99)>90){UI.capT=UI.capT||{};UI.capT[k]=G.t;
      toast('📈 Limite de comércio de '+RNM[k]+': '+capOf(0,k)+'/min. Pesquise ⚖️ Comércio na Biblioteca ou mande aldeões para outro recurso.')}}
  return ok}
// o limite se recarrega a cada segundo; os preços voltam aos poucos para 1
const ronTick3=ronTick;
ronTick=function(dt){ronTick3(dt);capInit();
  for(let o=0;o<NP;o++){for(const k of TRADE_K){const m=capOf(o,k);G.cap[o][k]=Math.min(m/3,(G.cap[o][k]??m/3)+m/60*dt);const p=G.mkt[o][k];G.mkt[o][k]=p+(1-p)*Math.min(1,dt*.004)}}};
// ---------- comprar e vender ----------
const buyPrice=(o,k)=>Math.round(TRADE_N*G.mkt[o][k]);
const sellPrice=(o,k)=>Math.round(TRADE_N*G.mkt[o][k]*.75);
function trade(o,k,buy){capInit();const P=G.P[o],p=G.mkt[o];
  if(buy){const c=buyPrice(o,k);if(P.res.wealth<c)return false;P.res.wealth-=c;P.res[k]+=TRADE_N;p[k]=Math.min(4,p[k]*1.07)}
  else{if(P.res[k]<TRADE_N)return false;P.res[k]-=TRADE_N;const g=sellPrice(o,k);P.res.wealth+=g;p[k]=Math.max(.25,p[k]*.94)}
  return true}
function tradeIcon(k,buy){const key='tr_'+k+(buy?1:0);if(!ICO[key]){const[c,g]=icoC();medal(g,buy?'#5ac07a':'#e0a040',buy?'#0e3a1e':'#5a3a08');
    g.font='30px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(TRADE_IC[k],38,40);badge(g,buy?'+':'−',buy?'#2e8a2a':'#b03020');ICO[key]=c.toDataURL()}return ICO[key]}
function mktIcon(){const key='mkt';if(!ICO[key]){const[c,g]=icoC();medal(g,'#e0b040','#5a3a08');g.font='32px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('💱',40,41);ICO[key]=c.toDataURL()}return ICO[key]}
UI.mktPage=0;
const getCmds4=getCmds;
getCmds=function(){const s=selEnts(),e=s[0];
  if(e&&e.o===0&&e.k==='b'&&e.type==='mercado'&&e.done>=1&&UI.mktPage){capInit();const out=[];
    for(const k of TRADE_K){const bp=buyPrice(0,k),sp=sellPrice(0,k);
      out.push({img:tradeIcon(k,1),trade:1,cnt:bp,nm:'Comprar '+TRADE_N+' de '+RNM[k]+' por '+bp+' de riqueza',dis:G.P[0].res.wealth<bp?'Faltam '+(bp-(G.P[0].res.wealth|0))+' de riqueza':null,
        act:()=>{if(trade(0,k,1)){snd('coin');toast('🛒 +'+TRADE_N+' '+RNM[k]+' (−'+bp+' riqueza) · próximo: '+buyPrice(0,k))}}});
      out.push({img:tradeIcon(k,0),trade:1,cnt:sp,nm:'Vender '+TRADE_N+' de '+RNM[k]+' por '+sp+' de riqueza',dis:G.P[0].res[k]<TRADE_N?'Precisa de '+TRADE_N+' de '+RNM[k]:null,
        act:()=>{if(trade(0,k,0)){snd('coin');toast('💰 −'+TRADE_N+' '+RNM[k]+' (+'+sp+' riqueza) · próximo: '+sellPrice(0,k))}}})}
    out.push({ic:'↩️',trade:1,nm:'Voltar',act:()=>{UI.mktPage=0;UI.sig=''}});
    return out}
  const out=getCmds4();
  if(e&&e.o===0&&e.k==='b'&&e.type==='mercado'&&e.done>=1)out.splice(Math.min(out.length,11),0,{img:mktIcon(),trade:1,nm:'Comprar e vender',act:()=>{UI.mktPage=1;UI.sig=''}});
  return out.slice(0,12)};
// botões de troca agem com um toque só (sem ficha)
const cmdTap1=cmdTap;
cmdTap=function(i){const c=getCmds()[i];if(c&&c.trade){runCmd(c);updHUD(true);return}cmdTap1(i)};
// trocar de seleção volta à página normal do Mercado
const updHUD3=updHUD;
updHUD=function(f){if(G&&UI.mktPage){const e=selEnts()[0];if(!e||e.type!=='mercado'){UI.mktPage=0;UI.sig=''}}updHUD3(f);
  if(G&&UI.mktPage){const t=$('cmdt');if(t)t.textContent='💱 Mercado · preços: '+TRADE_K.map(k=>TRADE_IC[k]+' '+buyPrice(0,k)+'/'+sellPrice(0,k)).join(' ')}};
// ---------- painel: mostra quando um recurso bateu no limite ----------
const hudExtra1=hudExtra;
hudExtra=function(){hudExtra1();if(!G||!G.capHit)return;
  for(const[k,id]of[['food','rtf'],['wood','rtw'],['gold','rtg']]){const el=$(id);if(!el)continue;const hit=G.t-(G.capHit[0][k]||-99)<4;
    if(hit&&!el.textContent.includes('🔒'))el.textContent+=' 🔒';el.style.color=hit?'#ffb070':''}};
// ---------- ficha da linha Comércio mostra o limite ----------
LINES.com.d='coleta +5% · caravanas e mercadores +20% · limite de comércio +'+CAP_COM+'/min por recurso';
// ---------- IA: vende o que sobra e compra o que falta ----------
const ronAI2=ronAI;
ronAI=function(p,blds,has,any,build,htx,hty,toward,vills,army,res){ronAI2(p,blds,has,any,build,htx,hty,toward,vills,army,res);
  if(!blds.some(b=>b.type==='mercado'&&b.done>=1))return;capInit();
  const nx=G.P[p].age<MAXAGE?AGECOST[G.P[p].age+1]:{};for(const k of TRADE_K){if(res[k]>Math.max(1400,(nx[k]||0)+500)&&G.mkt[p][k]>.6)trade(p,k,0);else if(res[k]<60&&res.wealth>buyPrice(p,k)+250)trade(p,k,1)}};
