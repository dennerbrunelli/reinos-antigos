// =========================================================
// DIPLOMACIA: alianças e guerra entre nações (painel 🤝, só aparece com 3+ jogadores)
// G.rel[a][b]=1 → aliados. Aliados não se atacam, dividem a visão do mapa e vencem juntos.
// =========================================================
const DIP_CD=60,DIP_PEACE=90,DIP_GRUDGE=300,DIP_GIFT=150,DIP_OFFER_T=60,DIP_OFFER_CD=300;
function dipAlive(p){return G.U.some(u=>!u.dead&&u.o===p)||G.B.some(b=>!b.dead&&b.o===p&&b.type!=='fazenda'&&b.type!=='muralha')}
function dipInit(){if(!G.rel||G.rel.length!==NP){G.rel=[];for(let p=0;p<NP;p++)G.rel.push(new Array(NP).fill(0))}
  if(!G.dip||G.dip.hit.length!==NP)G.dip={hit:new Array(NP).fill(-999),ask:new Array(NP).fill(-999),war:new Array(NP).fill(-999),off:new Array(NP).fill(-999),offer:null}
  if(!G.dip.off)G.dip.off=new Array(NP).fill(-999)}
function dipJoin(p){setRel(0,p,1);for(let q=1;q<NP;q++)if(q!==p)setRel(p,q,ally(q,0)?1:0);domDirty=true}
// tributo: manda ouro. Para aliado é ajuda; para inimigo, acalma (apaga o "atacou há pouco" e encurta a mágoa da traição)
function dipGift(p){dipInit();if(!dipAlive(p))return;const c={gold:DIP_GIFT};if(!afford(0,c)){toast('🪙 Faltam '+DIP_GIFT+' de metal para o tributo');return}
  pay(0,c);G.P[p].res.gold+=DIP_GIFT;const D=G.dip;D.hit[p]=-999;D.ask[p]=-999;D.war[p]-=150;
  toast('🎁 Tributo de '+DIP_GIFT+' de metal enviado aos '+civOf(p).n+(ally(p,0)?'':' · eles ficaram mais dispostos a conversar'));snd('coin');dipDraw()}
function dipStr(p){let n=0;for(const u of G.U)if(!u.dead&&u.o===p&&isMil(u))n++;return n}
// a IA também propõe: quando está em guerra com você e existe um terceiro reino mais forte que ela ameaçando os dois
function dipAITick(){if(NP<3||!G.dip)return;const D=G.dip;
  if(D.offer&&(G.t>D.offer.until||!dipAlive(D.offer.p)||ally(D.offer.p,0))){D.offer=null;dipDraw()}
  if(D.offer)return;
  for(let p=1;p<NP;p++){if(ally(p,0)||!dipAlive(p)||G.t<240||G.t-D.off[p]<DIP_OFFER_CD||G.t-D.hit[p]<DIP_PEACE||G.t-D.war[p]<DIP_GRUDGE)continue;
    const sp=dipStr(p);let thr=false;for(let q=1;q<NP;q++)if(q!==p&&dipAlive(q)&&!ally(q,0)&&!ally(q,p)&&dipStr(q)>sp+2)thr=true;
    if(!thr)continue;D.off[p]=G.t;D.offer={p,until:G.t+DIP_OFFER_T};
    if(running){toast('🤝 Os '+civOf(p).n+' propõem uma aliança! Toque no 🤝 para responder.');snd('alert')}dipDraw();return}}
function dipAnswer(yes){const D=G.dip;if(!D||!D.offer)return;const p=D.offer.p;D.offer=null;
  if(yes){dipJoin(p);toast('🤝 Aliança firmada com os '+civOf(p).n+'!');snd('done')}else toast('✋ Você recusou a aliança dos '+civOf(p).n);dipDraw()}
const ronTickDip=ronTick;let dipAcc=0;
ronTick=function(dt){ronTickDip(dt);dipAcc+=dt;if(dipAcc>=5){dipAcc=0;dipAITick();const b=$('bdip');if(b)b.style.outline=G.dip&&G.dip.offer?'2px solid #7dffa0':''}};
// guarda quando o jogador feriu cada nação (a IA não aceita paz de quem acabou de atacar)
const onHitDip=onHit;
onHit=function(t,att){if(att&&att.o===0&&t.o>0&&t.o<NP&&G.dip)G.dip.hit[t.o]=G.t;onHitDip(t,att)};
// a IA decide se aceita a aliança. Devolve '' se aceita, ou o motivo da recusa.
function dipWhyNot(p){dipInit();const D=G.dip;
  if(!dipAlive(p))return'Esse reino já caiu.';
  if(ally(p,0))return'Vocês já são aliados.';
  if(G.t-D.ask[p]<DIP_CD)return'Eles ainda estão pensando na última proposta. Espere '+Math.ceil(DIP_CD-(G.t-D.ask[p]))+' s.';
  if(G.t-D.war[p]<DIP_GRUDGE)return'Você quebrou a aliança com eles há pouco. Não confiam em você ainda.';
  if(G.t-D.hit[p]<DIP_PEACE)return'Você atacou esse reino há pouco. Pare de atacar por '+Math.ceil(DIP_PEACE-(G.t-D.hit[p]))+' s.';
  let other=false;for(let q=1;q<NP;q++)if(q!==p&&dipAlive(q)&&!ally(q,0))other=true;
  if(!other)return'Não sobraria nenhum inimigo. Eles preferem lutar.';
  return''}
function dipPropose(p){const w=dipWhyNot(p);if(w){toast('🤝 '+civOf(p).n+': '+w);snd('click');if(G.dip&&dipAlive(p)&&!ally(p,0)&&G.t-G.dip.ask[p]>=DIP_CD)G.dip.ask[p]=G.t;dipDraw();return false}
  G.dip.ask[p]=G.t;dipJoin(p);// entra no seu time: fica aliado dos seus aliados e rompe com os seus inimigos
  toast('🤝 Aliança firmada com os '+civOf(p).n+'!');snd('done');dipDraw();return true}
function dipWar(p){if(!ally(p,0)||p===0)return;dipInit();setRel(0,p,0);for(let q=1;q<NP;q++)if(q!==p&&ally(q,0))setRel(p,q,0);G.dip.war[p]=G.t;toast('⚔ Você declarou guerra aos '+civOf(p).n+'!');snd('alert');dipDraw()}
function dipDraw(){const el=$('dipp');if(!el||el.style.display==='none')return;dipInit();
  let h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b>🤝 Diplomacia</b><button id="dipx" class="tb">✕</button></div>';
  const of=G.dip.offer;if(of)h+='<div style="background:#bfe3b0;border:1px solid #4a7a3a;border-radius:4px;padding:6px;margin-bottom:6px"><b>Os '+civOf(of.p).n+' propõem aliança</b> <small>('+Math.max(0,Math.ceil(of.until-G.t))+' s)</small><div style="display:flex;gap:6px;margin-top:4px"><button id="dipy" style="flex:1;padding:5px;font-weight:700;border-radius:4px;border:1px solid #4a7a3a;background:#7dd08a;color:#12300f">Aceitar</button><button id="dipn" style="flex:1;padding:5px;font-weight:700;border-radius:4px;border:1px solid #6b5434;background:#e9d6b0;color:#2a1a08">Recusar</button></div></div>';
  for(let p=1;p<NP;p++){const al=dipAlive(p),a=ally(p,0);
    h+='<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-top:1px solid #0003">'
      +'<span style="width:14px;height:14px;border-radius:3px;border:1px solid #000;background:'+COL[p].m+';flex:none"></span>'
      +'<span style="flex:1;min-width:0"><b>'+civOf(p).n+'</b><br><small>'+(!al?'☠ Derrotado':a?'🤝 Aliado':'⚔ Em guerra')+'</small></span>'
      +(al?'<button class="dipb" data-p="'+p+'" data-a="'+(a?'war':'ally')+'" style="font-size:12px;padding:5px 8px;border-radius:4px;border:1px solid #6b5434;background:'+(a?'#e9b0a4':'#bfe3b0')+';color:#2a1a08;font-weight:700">'+(a?'Declarar guerra':'Propor aliança')+'</button><button class="dipg" data-p="'+p+'" title="Tributo" style="font-size:12px;padding:5px 6px;border-radius:4px;border:1px solid #6b5434;background:#f3cf6a;color:#2a1a08;font-weight:700">🎁</button>':'')
      +'</div>'}
  h+='<small style="display:block;margin-top:6px;opacity:.8">Aliados não se atacam, dividem a visão do mapa e vencem juntos. 🎁 manda '+DIP_GIFT+' de metal: ajuda um aliado ou acalma um inimigo.</small>';
  el.innerHTML=h;$('dipx').onclick=()=>{el.style.display='none'};
  if($('dipy')){$('dipy').onclick=()=>dipAnswer(true);$('dipn').onclick=()=>dipAnswer(false)}
  el.querySelectorAll('.dipg').forEach(b=>b.onclick=()=>dipGift(+b.dataset.p));
  el.querySelectorAll('.dipb').forEach(b=>b.onclick=()=>{const p=+b.dataset.p;if(b.dataset.a==='ally')dipPropose(p);else dipWar(p)})}
function dipSetup(){dipInit();
  let b=$('bdip');if(!b){b=document.createElement('button');b.id='bdip';b.className='tb';b.setAttribute('aria-label','Diplomacia');b.textContent='🤝';$('bui').parentNode.insertBefore(b,$('bui'));
    b.onclick=()=>{snd('click');const el=$('dipp');el.style.display=el.style.display==='none'?'block':'none';dipDraw()}}
  let el=$('dipp');if(!el){el=document.createElement('div');el.id='dipp';
    el.style.cssText='display:none;position:absolute;top:40px;right:8px;width:250px;max-width:70vw;max-height:70vh;overflow:auto;z-index:60;background:linear-gradient(#f3e4be,#d8c08c);color:#2a1a08;border:2px solid #8a6a2a;border-radius:6px;padding:8px;font-size:13px;box-shadow:0 4px 14px #000a';
    $('hud').appendChild(el)}
  el.style.display='none';b.style.display=NP>2?'':'none'}
const startGameDip=startGame;
startGame=function(){startGameDip();dipSetup()};
window.__RA.startGame=startGame;
