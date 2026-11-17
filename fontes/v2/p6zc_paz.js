// =========================================================
// PAZ: o terceiro estado da diplomacia (como no Rise of Nations: Aliança · Paz · Guerra)
// e a TRÉGUA DO COMEÇO (as "Regras de Ataque" do Rise / o "Tratado" do Age III):
//   · Paz por tempo (2 a 30 min) ou até alguém chegar numa era escolhida.
//   · Em paz ninguém ataca ninguém: tropas, torres, fortes e navios ignoram o outro povo.
//   · Tropas no território de quem está em paz com você sofrem atrito forte e morrem em ~6 s
//     (o batedor é a exceção: pode espiar). Aldeões e mercadores não sofrem.
//   · Ninguém constrói no território do outro (já valia).
// G.rel[a][b]: 0 guerra · 1 aliança · 2 paz. G.pz = trégua do começo {on,t,age,val}.
// =========================================================
const PZ_ATR_T=1.5,PZ_ATR_RATE=.18,PZ_GRACE=20,PZ_MIN_KEEP=420;
const PZ_OPTS=[['0','⚔ Sem paz'],['2','2 min'],['5','5 min'],['10','10 min'],['15','15 min'],['20','20 min'],['30','30 min'],
  ...AGES.slice(1).map((n,i)=>['a'+(i+1),'Até a '+n])];
function pzLbl(v){const o=PZ_OPTS.find(x=>x[0]===String(v));return o?o[1]:'⚔ Sem paz'}
// ---------- opção na Batalha Rápida ----------
SOPT.partida.splice(1,0,{k:'paz',n:'Paz no início',v:PZ_OPTS});
SDEF.paz='0';if(SETUP.paz==null)SETUP.paz='0';
function pzValid(v,o){o=o||SETUP;v=String(v||'0');if(v[0]!=='a')return v;const a=+v.slice(1),ini=+o.era||0,fim=o.fim!=null?+o.fim:MAXAGE;return a>ini&&a<=fim?v:'0'}
function pzPick(){let ov=$('pzpick');if(ov)ov.remove();ov=document.createElement('div');ov.id='pzpick';
  const ini=+SETUP.era||0,fim=SETUP.fim!=null?+SETUP.fim:MAXAGE;
  const bt=([v,l])=>{const ok=v[0]!=='a'||(+v.slice(1)>ini&&+v.slice(1)<=fim);return'<button class="mb'+(String(SETUP.paz)===v?' on':'')+'" data-v="'+v+'"'+(ok?'':' disabled')+'>'+l+'</button>'};
  ov.innerHTML='<div class="pzbox"><div class="pzh">🕊 Paz no início</div>'
    +'<p>Ninguém pode atacar ninguém até o tempo acabar ou até o primeiro povo chegar na era escolhida. Use a paz para crescer. Tropas que entram no território de outro povo durante a paz sofrem atrito e morrem em segundos (o batedor pode espiar).</p>'
    +'<div class="pzs">Por tempo</div><div class="pzg">'+PZ_OPTS.slice(0,7).map(bt).join('')+'</div>'
    +'<div class="pzs">Até uma era</div><div class="pzg">'+PZ_OPTS.slice(7).map(bt).join('')+'</div>'
    +'<button class="mb pzok">Fechar</button></div>';
  document.body.appendChild(ov);
  ov.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{SETUP.paz=b.dataset.v;snd('click');ov.remove();updSetup()});
  ov.querySelector('.pzok').onclick=()=>{snd('click');ov.remove()};ov.onclick=e=>{if(e.target===ov)ov.remove()}}
{const css=document.createElement('style');css.textContent=`
#pzpick{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:10px}
#pzpick .pzbox{background:linear-gradient(#f3e4be,#d8c08c);color:#2a1a08;border:2px solid #8a6a2a;border-radius:8px;padding:10px 12px;max-width:520px;width:100%;max-height:92vh;overflow:auto;box-shadow:0 6px 20px #000c}
#pzpick .pzh{font:700 18px Georgia,serif;margin-bottom:4px}
#pzpick p{font-size:13px;margin:0 0 6px;line-height:1.35}
#pzpick .pzs{font-weight:700;font-size:13px;margin:6px 0 3px}
#pzpick .pzg{display:flex;flex-wrap:wrap;gap:5px}
#pzpick .pzg .mb{flex:1 1 22%;min-width:90px;padding:7px 4px;font-size:13px;justify-content:center;text-align:center}
#pzpick .mb[disabled]{opacity:.35}
#pzpick .pzok{margin-top:8px;width:100%;justify-content:center}
#pzc{position:absolute;top:36px;right:calc(8px + env(safe-area-inset-right));z-index:55;padding:3px 12px;border-radius:14px;font:700 13px Georgia,serif;color:#fff;
  background:linear-gradient(#5b84c8,#2c4f8a);border:1.5px solid #f2d27a;box-shadow:0 2px 6px #000a;white-space:nowrap;pointer-events:auto;display:none}
#pzc.fim{background:linear-gradient(#b8452e,#6e1d10)}
#dipp .dr{padding:5px 0;border-top:1px solid #d8b46826}
#dipp .dh{display:flex;align-items:center;gap:6px}
#dipp .dbs{display:flex;gap:4px;margin-top:4px;flex-wrap:wrap}
#dipp .dbs button{flex:1 1 auto;font-size:12px;padding:5px 6px;border-radius:4px;font-weight:700;color:#fff}
#dipp .b-paz{border:1px solid #a9c8f0;background:linear-gradient(#4f7fc0,#284b80)}
#dipp .b-ali{border:1px solid #c5dba0;background:linear-gradient(#6f8f45,#3f5a25)}
#dipp .b-war{border:1px solid #d98a78;background:linear-gradient(#8f2a20,#4a120c)}
#dipp .b-gift{flex:0 0 auto!important;border:1px solid #7d6233;background:linear-gradient(#30251a,#17110a);color:#efe3c4!important}
#dipp .pzt{background:rgba(70,110,180,.2);border:1px solid #7fa3d8;border-radius:4px;padding:5px 6px;margin-bottom:6px;font-size:12px}`;document.head.appendChild(css)}
// linha "Paz no início" nas regras da Batalha Rápida (abre a lista de escolhas)
{const qb0=qbRender;qbRender=function(){qb0();const q=$('qb');if(!q)return;const t=q.querySelector('[data-k="times"]');if(!t)return;
  SETUP.paz=pzValid(SETUP.paz);const row=document.createElement('div');row.className='qr';
  row.innerHTML='<span>🕊 Paz no início</span><button class="mb qv" id="qbpz">'+pzLbl(SETUP.paz)+'</button>';
  t.closest('.qr').after(row);$('qbpz').onclick=()=>{snd('click');pzPick()}}}
{const us0=updSetup;updSetup=function(){us0();const s=$('sumr');if(s&&!s.querySelector('.pzsum')){const d=document.createElement('div');d.className='pzsum';s.appendChild(d)}
  const d=s&&s.querySelector('.pzsum');if(d)d.innerHTML='<b>Paz no início:</b> '+pzLbl(pzValid(SETUP.paz))}}
// ---------- começo da partida ----------
function pzInit(v){v=String(v||'0');G.pz={on:0,t:0,age:-1,val:'0',w:0};
  if(v[0]==='a'){let a=+v.slice(1);const fim=ENDAGE();a=Math.min(a,fim);if(a>(G.cfg&&G.cfg.era|0)){G.pz.on=1;G.pz.age=a;G.pz.val=v}}
  else if(+v>0){G.pz.on=1;G.pz.t=(G.t||0)+(+v)*60;G.pz.val=v}}
{const ng=newGame;newGame=function(o){ng(o);pzInit(o&&o.paz!=null?pzValid(o.paz,o):'0')};window.__RA.newGame=newGame}
function pzLeft(){return G.pz&&G.pz.on&&G.pz.t?Math.max(0,G.pz.t-G.t):0}
function pzTxt(){if(!G.pz||!G.pz.on)return'';return G.pz.t?'🕊 Paz · '+fmtT(pzLeft()):'🕊 Paz até a '+AGES[G.pz.age]}
function pzEnd(why){if(!G.pz||!G.pz.on)return;G.pz.on=0;
  // quem estava atacando e parou por causa da paz volta a procurar inimigo sozinho
  if(running){toast('⚔️ A PAZ ACABOU! '+(why||'')+'<br>Agora os povos podem se atacar. Prepare as defesas!');snd('trumpet')}
  domDirty=true;dipDraw()}
function pzTick(){const P=G.pz;if(!P||!P.on)return;
  if(P.t){const l=pzLeft();if(l<=0)return pzEnd('O tempo de paz terminou.');
    if(l<=60&&P.w<1){P.w=1;if(running){toast('⏳ A paz acaba em 1 minuto!');snd('bell')}}
    else if(l<=10&&P.w<2){P.w=2;if(running)toast('⏳ A paz acaba em 10 segundos!')}}
  else if(P.age>=0){for(let p=0;p<NP;p++)if(dipAlive(p)&&G.P[p].age>=P.age)return pzEnd((p===0?'Você chegou':'Os '+civOf(p).n+' chegaram')+' na '+AGES[P.age]+'.');
    if(P.w<1){for(let p=0;p<NP;p++){const b=G.B.find(b=>!b.dead&&b.o===p&&b.q&&b.q[0]==='age'&&G.P[p].age+1>=P.age);if(b){P.w=1;if(running){toast(p===0?'⏳ Você está subindo para a '+AGES[P.age]+': quando chegar, a paz acaba!':'⏳ Os '+civOf(p).n+' estão subindo para a '+AGES[P.age]+': a paz vai acabar!');snd('bell')}break}}}}}
// ---------- aviso quando o jogador tenta atacar quem está em paz ----------
let pzWarnT=-99;
function pzWarn(o){if(G.t-pzWarnT<4)return;pzWarnT=G.t;
  if(G.pz&&G.pz.on)toast('🕊 Ainda é tempo de paz: ninguém pode atacar. '+(G.pz.t?'Faltam '+fmtT(pzLeft())+'.':'Até alguém chegar na '+AGES[G.pz.age]+'.'));
  else toast('🕊 Vocês estão em paz com os '+civOf(o).n+'. Para atacar, declare guerra no 🤝.');snd('click')}
{const oa=orderAttack;orderAttack=function(u,t){if(u&&t&&!t.dead&&u.o===0&&t.o<NP&&peace(t.o,0)){pzWarn(t.o);return}return oa(u,t)}}
{const so=smartOrder;smartOrder=function(us,tgt,x,y,o){if(o===0&&tgt&&(tgt.k==='u'||tgt.k==='b')&&tgt.o<NP&&peace(tgt.o,0)&&us.some(u=>ST(u).atk>0&&u.type!=='vill'))pzWarn(tgt.o);return so(us,tgt,x,y,o)}}
// golpe que já estava no ar quando a paz foi assinada não machuca
{const dd=dealDmg;dealDmg=function(att,t,base){if(att&&t&&att.o!=null&&att.o<NP&&t.o<NP&&peace(att.o,t.o))return;return dd(att,t,base)}}
// ---------- atrito da paz: tropa no território de quem está em paz com você ----------
const pzExempt=u=>u.type==='bat'||!isMil(u);
let pzAtWarn=-99,pzAcc=0;
function pzAttr(dt){
  for(const u of G.U){if(u.dead||u.inT||u.o>=NP||pzExempt(u)){continue}
    const d=DOM[tileOf(u.x,u.y)];
    if(d>=0&&d<NP&&d!==u.o&&peace(d,u.o)&&!(u.pzg>G.t)){u.pza=(u.pza||0)+dt;
      if(u.pza>PZ_ATR_T){const mh=ST(u).hp;u.hp-=mh*PZ_ATR_RATE*dt;
        if(u.o===0&&G.t-pzAtWarn>8){pzAtWarn=G.t;toast('🕊 Suas tropas estão no território dos '+civOf(d).n+' durante a paz e morrem pelo atrito. Saia de lá!');snd('alert')}
        if(u.hp<=0){u.hp=0;kill(u)}}}
    else if(u.pza)u.pza=0}}
// quem fica em paz recua: tropas dentro do território do outro voltam para casa e têm 20 s para sair
function pzRetreat(a,b){const home=o=>{const t=G.B.find(x=>!x.dead&&x.o===o&&x.type==='tc');return t?ctr(t):null};
  for(const u of G.U){if(u.dead||u.inT||(u.o!==a&&u.o!==b)||pzExempt(u))continue;const other=u.o===a?b:a;const d=DOM[tileOf(u.x,u.y)];
    if(u.st==='attack'||u.st==='convert'){const t=E.get(u.tg);if(t&&t.o===other){u.st='idle';u.tg=0;u.mv=false}}
    if(d===other){u.pzg=G.t+PZ_GRACE;const h=home(u.o);if(h)orderMove(u,h.x,h.y)}}}
// ---------- diplomacia com três estados ----------
function pzDipInit(){dipInit();const D=G.dip;if(!D.pt||D.pt.length!==NP)D.pt=new Array(NP).fill(-999);if(!D.gift||D.gift.length!==NP)D.gift=new Array(NP).fill(-999)}
function relOf(p){return!G.rel||!G.rel[0]?0:G.rel[0][p]|0}
// quem entra na sua aliança copia a sua postura: amigo dos seus amigos, em paz com quem você está em paz
dipJoin=function(p){setRel(0,p,1);for(let q=1;q<NP;q++)if(q!==p)setRel(p,q,relOf(q));domDirty=true};
{const g0=dipGift;dipGift=function(p){pzDipInit();const had=G.P[0].res.gold;g0(p);if(G.P[0].res.gold<had)G.dip.gift[p]=G.t}}
// a IA aceita a paz? '' = aceita; senão, o motivo
function dipPeaceWhyNot(p){pzDipInit();const D=G.dip;
  if(!dipAlive(p))return'Esse reino já caiu.';
  if(ally(p,0))return'Vocês são aliados. Para ficar só em paz, use 🕊 Só paz.';
  if(relOf(p)===2)return'Vocês já estão em paz.';
  if(G.t-D.ask[p]<DIP_CD)return'Eles ainda estão pensando na última proposta. Espere '+Math.ceil(DIP_CD-(G.t-D.ask[p]))+' s.';
  if(G.t-D.war[p]<DIP_GRUDGE)return'Você rompeu um acordo com eles há pouco. Não confiam em você ainda.';
  if(G.t-D.hit[p]<DIP_PEACE)return'Você atacou esse reino há pouco. Pare de atacar por '+Math.ceil(DIP_PEACE-(G.t-D.hit[p]))+' s.';
  const me=dipStr(0),them=dipStr(p),gift=G.t-D.gift[p]<180;
  if(them>me*(gift?2.6:1.6)+6)return gift?'Mesmo com o tributo, eles se acham fortes demais para a paz.':'Eles se acham mais fortes e querem a sua terra. Mande um tributo 🎁 ou mostre força.';
  return''}
function dipMakePeace(p,msg){pzDipInit();const was=ally(p,0);setRel(0,p,2);G.dip.pt[p]=G.t;
  if(was)for(let q=1;q<NP;q++)if(q!==p&&ally(q,0)&&ally(q,p))setRel(p,q,2);
  pzRetreat(0,p);toast(msg||'🕊 Acordo de paz firmado com os '+civOf(p).n+'! Ninguém ataca ninguém. Tirem as tropas do território do outro.');snd('bell');domDirty=true;dipDraw()}
function dipProposePeace(p){const w=dipPeaceWhyNot(p);const D=G.dip;
  if(w){toast('🕊 '+civOf(p).n+': '+w);snd('click');if(dipAlive(p)&&relOf(p)===0&&G.t-D.ask[p]>=DIP_CD)D.ask[p]=G.t;dipDraw();return false}
  D.ask[p]=G.t;dipMakePeace(p);return true}
// desfazer a aliança sem brigar: vira paz
function dipUnally(p){if(!ally(p,0)||p===0)return;dipMakePeace(p,'🕊 A aliança com os '+civOf(p).n+' acabou, mas a paz continua: não dividem mais a visão.')}
dipWar=function(p){if(p===0||!dipAlive(p))return;pzDipInit();
  if(G.pz&&G.pz.on){toast('🕊 A paz do começo da partida ainda vale para todos. '+(G.pz.t?'Faltam '+fmtT(pzLeft())+'.':'Até alguém chegar na '+AGES[G.pz.age]+'.'));snd('click');return}
  const r=relOf(p);if(r===0)return;
  if(r===1)for(let q=1;q<NP;q++)if(q!==p&&ally(q,0))setRel(p,q,0);
  setRel(0,p,0);G.dip.war[p]=G.t;
  toast(r===2?'⚔ Você rompeu a paz e declarou guerra aos '+civOf(p).n+'!':'⚔ Você declarou guerra aos '+civOf(p).n+'!');snd('trumpet');domDirty=true;dipDraw()};
// a IA também negocia: propõe aliança quando um terceiro ameaça, pede paz quando está perdendo e rompe a paz quando fica muito forte
dipAITick=function(){if(NP<2||!G.dip)return;pzDipInit();const D=G.dip;
  if(D.offer){const o=D.offer,done=o.k==='paz'?relOf(o.p)!==0:ally(o.p,0);if(G.t>o.until||!dipAlive(o.p)||done){D.offer=null;dipDraw()}}
  // rompe a paz: só depois de 7 min de paz e se estiver muito mais forte que você
  if(!(G.pz&&G.pz.on))for(let p=1;p<NP;p++){if(relOf(p)!==2||!dipAlive(p)||G.t-D.pt[p]<PZ_MIN_KEEP)continue;
    if(dipStr(p)>dipStr(0)*2+8&&G.t-D.gift[p]>180&&RNG()<.05){setRel(0,p,0);D.war[p]=G.t-DIP_GRUDGE*.5;
      if(running){toast('⚔ Os '+civOf(p).n+' romperam a paz e declararam guerra a você!');snd('trumpet')}domDirty=true;dipDraw();return}}
  if(D.offer||G.t<240)return;
  for(let p=1;p<NP;p++){if(ally(p,0)||!dipAlive(p)||G.t-D.off[p]<DIP_OFFER_CD||G.t-D.hit[p]<DIP_PEACE||G.t-D.war[p]<DIP_GRUDGE)continue;
    const sp=dipStr(p);let thr=false;if(NP>2)for(let q=1;q<NP;q++)if(q!==p&&dipAlive(q)&&!ally(q,0)&&!ally(q,p)&&dipStr(q)>sp+2)thr=true;
    if(thr){D.off[p]=G.t;D.offer={p,k:'ali',until:G.t+DIP_OFFER_T};if(running){toast('🤝 Os '+civOf(p).n+' propõem uma aliança! Toque no 🤝 para responder.');snd('alert')}dipDraw();return}
    if(relOf(p)===0&&!(G.pz&&G.pz.on)&&G.t>=300&&sp*1.5+2<dipStr(0)){D.off[p]=G.t;D.offer={p,k:'paz',until:G.t+DIP_OFFER_T};
      if(running){toast('🕊 Os '+civOf(p).n+' pedem um acordo de paz! Toque no 🤝 para responder.');snd('bell')}dipDraw();return}}};
dipAnswer=function(yes){const D=G.dip;if(!D||!D.offer)return;const{p,k}=D.offer;D.offer=null;
  if(yes){if(k==='paz')dipMakePeace(p);else{dipJoin(p);toast('🤝 Aliança firmada com os '+civOf(p).n+'!');snd('done')}}
  else toast(k==='paz'?'✋ Você recusou a paz dos '+civOf(p).n:'✋ Você recusou a aliança dos '+civOf(p).n);dipDraw()};
dipDraw=function(){const el=$('dipp');if(!el||el.style.display==='none')return;pzDipInit();
  let h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b>🤝 Diplomacia</b><button id="dipx" class="tb">✕</button></div>';
  if(G.pz&&G.pz.on)h+='<div class="pzt"><b>🕊 Paz do começo</b> vale para todos '+(G.pz.t?'por mais <b>'+fmtT(pzLeft())+'</b>':'até alguém chegar na <b>'+AGES[G.pz.age]+'</b>')+'. Ninguém ataca; tropa em terra alheia sofre atrito.</div>';
  const of=G.dip.offer;if(of)h+='<div style="background:rgba(111,143,69,.22);border:1px solid #c5dba0;border-radius:4px;padding:6px;margin-bottom:6px"><b>Os '+civOf(of.p).n+(of.k==='paz'?' pedem um acordo de paz':' propõem aliança')+'</b> <small>('+Math.max(0,Math.ceil(of.until-G.t))+' s)</small><div style="display:flex;gap:6px;margin-top:4px"><button id="dipy" style="flex:1;padding:5px;font-weight:700;border-radius:4px;border:1px solid #c5dba0;background:linear-gradient(#6f8f45,#3f5a25);color:#fff">Aceitar</button><button id="dipn" style="flex:1;padding:5px;font-weight:700;border-radius:4px;border:1px solid #7d6233;background:linear-gradient(#30251a,#17110a);color:#efe3c4">Recusar</button></div></div>';
  for(let p=1;p<NP;p++){const al=dipAlive(p),r=relOf(p);
    const st=!al?'☠ Derrotado':r===1?'🤝 Aliado':r===2?'🕊 Em paz'+(G.dip.pt[p]>0?' há '+fmtT(G.t-G.dip.pt[p]):''):'⚔ Em guerra';
    const B=(c,a,t)=>'<button class="'+c+'" data-p="'+p+'" data-a="'+a+'">'+t+'</button>';
    h+='<div class="dr"><div class="dh"><span style="width:14px;height:14px;border-radius:3px;border:1px solid #000;background:'+COL[p].m+';flex:none"></span><span style="flex:1;min-width:0"><b>'+civOf(p).n+'</b><br><small>'+st+'</small></span></div>';
    if(al)h+='<div class="dbs">'+(r===0?B('b-paz','paz','🕊 Propor paz')+B('b-ali','ali','🤝 Aliança'):r===2?B('b-ali','ali','🤝 Aliança')+B('b-war','war','⚔ Romper a paz'):B('b-paz','unali','🕊 Só paz')+B('b-war','war','⚔ Guerra'))+B('b-gift','gift','🎁')+'</div>';
    h+='</div>'}
  h+='<small style="display:block;margin-top:6px;opacity:.85;line-height:1.3">🤝 <b>Aliança</b>: não se atacam, dividem a visão e vencem juntos.<br>🕊 <b>Paz</b>: não se atacam, mas cada um tem sua visão; tropa no território do outro morre pelo atrito (o batedor pode espiar). Para vencer, ainda precisa derrotar quem está só em paz.<br>⚔ <b>Guerra</b>: tudo liberado.<br>🎁 manda '+DIP_GIFT+' de metal: ajuda um aliado ou amolece um inimigo.</small>';
  el.innerHTML=h;$('dipx').onclick=()=>{el.style.display='none'};
  if($('dipy')){$('dipy').onclick=()=>dipAnswer(true);$('dipn').onclick=()=>dipAnswer(false)}
  el.querySelectorAll('.dbs button').forEach(b=>b.onclick=()=>{const p=+b.dataset.p,a=b.dataset.a;
    if(a==='paz')dipProposePeace(p);else if(a==='ali')dipPropose(p);else if(a==='war')dipWar(p);else if(a==='unali')dipUnally(p);else if(a==='gift')dipGift(p)})};
// painel de diplomacia agora vale também no 1 contra 1 (dá para fazer paz)
{const ds=dipSetup;dipSetup=function(){ds();pzDipInit();const b=$('bdip');if(b)b.style.display='';const el=$('dipp');if(el)el.style.width='270px';
  let c=$('pzc');if(!c){c=document.createElement('div');c.id='pzc';$('hud').appendChild(c);c.onclick=()=>{snd('click');const d=$('dipp');d.style.display='block';dipDraw()}}pzHud()}}
function pzHud(){const c=$('pzc');if(!c)return;const on=G&&G.pz&&G.pz.on;c.style.display=on?'block':'none';if(!on)return;
  const t=pzTxt();if(c.textContent!==t)c.textContent=t;c.classList.toggle('fim',!!(G.pz.t&&pzLeft()<=60))}
{const rt=ronTick;let acc=0,dacc=0;ronTick=function(dt){rt(dt);if(!G)return;pzAcc+=dt;if(pzAcc>=.25){pzAttr(pzAcc);pzAcc=0}
  acc+=dt;if(acc>=1){acc=0;pzTick();pzHud()}
  dacc+=dt;if(dacc>=1&&G.pz&&G.pz.on){dacc=0;const el=$('dipp');if(el&&el.style.display!=='none')dipDraw()}}}
{const sg=startGame;startGame=function(){sg();pzHud()};window.__RA.startGame=startGame}
// legendas ao segurar
try{HELP_ID.bdip=['Diplomacia','Aliança, paz ou guerra com cada povo, e tributo de metal. Em paz ninguém ataca; aliados também dividem a visão e vencem juntos.'];
  HELP_ID.pzc=['Paz do começo','Ninguém pode atacar até o tempo acabar ou até alguém chegar na era escolhida. Tropas no território de outro povo morrem pelo atrito.']}catch(e){}
