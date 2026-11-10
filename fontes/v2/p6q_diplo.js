// =========================================================
// DIPLOMACIA: alianças e guerra entre nações (painel 🤝, só aparece com 3+ jogadores)
// G.rel[a][b]=1 → aliados. Aliados não se atacam, dividem a visão do mapa e vencem juntos.
// =========================================================
const DIP_CD=60,DIP_PEACE=90,DIP_GRUDGE=300;
function dipAlive(p){return G.U.some(u=>!u.dead&&u.o===p)||G.B.some(b=>!b.dead&&b.o===p&&b.type!=='fazenda'&&b.type!=='muralha')}
function dipInit(){if(!G.rel||G.rel.length!==NP){G.rel=[];for(let p=0;p<NP;p++)G.rel.push(new Array(NP).fill(0))}
  if(!G.dip||G.dip.hit.length!==NP)G.dip={hit:new Array(NP).fill(-999),ask:new Array(NP).fill(-999),war:new Array(NP).fill(-999)}}
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
  G.dip.ask[p]=G.t;setRel(0,p,1);
  // entra no seu time: fica aliado dos seus aliados e rompe com os seus inimigos
  for(let q=1;q<NP;q++)if(q!==p)setRel(p,q,ally(q,0)?1:0);domDirty=true;toast('🤝 Aliança firmada com os '+civOf(p).n+'!');snd('done');dipDraw();return true}
function dipWar(p){if(!ally(p,0)||p===0)return;dipInit();setRel(0,p,0);for(let q=1;q<NP;q++)if(q!==p&&ally(q,0))setRel(p,q,0);G.dip.war[p]=G.t;toast('⚔ Você declarou guerra aos '+civOf(p).n+'!');snd('alert');dipDraw()}
function dipDraw(){const el=$('dipp');if(!el||el.style.display==='none')return;dipInit();
  let h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b>🤝 Diplomacia</b><button id="dipx" class="tb">✕</button></div>';
  for(let p=1;p<NP;p++){const al=dipAlive(p),a=ally(p,0);
    h+='<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-top:1px solid #0003">'
      +'<span style="width:14px;height:14px;border-radius:3px;border:1px solid #000;background:'+COL[p].m+';flex:none"></span>'
      +'<span style="flex:1;min-width:0"><b>'+civOf(p).n+'</b><br><small>'+(!al?'☠ Derrotado':a?'🤝 Aliado':'⚔ Em guerra')+'</small></span>'
      +(al?'<button class="dipb" data-p="'+p+'" data-a="'+(a?'war':'ally')+'" style="font-size:12px;padding:5px 8px;border-radius:4px;border:1px solid #6b5434;background:'+(a?'#e9b0a4':'#bfe3b0')+';color:#2a1a08;font-weight:700">'+(a?'Declarar guerra':'Propor aliança')+'</button>':'')
      +'</div>'}
  h+='<small style="display:block;margin-top:6px;opacity:.8">Aliados não se atacam, dividem a visão do mapa e vencem juntos.</small>';
  el.innerHTML=h;$('dipx').onclick=()=>{el.style.display='none'};
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
