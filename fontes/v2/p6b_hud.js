
// =========================================================
//   INTERFACE POR PAINÉIS (v10)
//   Objetivos · Alertas · Seleção · Comandos · Mapa
//   cada painel encolhe (—), some (✕) e muda de lugar (arrastando o título);
//   3 modos prontos; tudo fica salvo no celular; "Restaurar" volta ao padrão.
//   Esconder um painel não para nada no jogo: só tira da tela.
// =========================================================
const HUDK='imperio_ui2',PNL=['obj','al','sel','cmd','map'];
const PNAME={obj:'🎯 Objetivos',al:'⚠️ Alertas',sel:'👤 Seleção',cmd:'⚡ Comandos',map:'🗺 Mapa'};
const PEL={obj:'pObj',al:'pAl',sel:'pSel',cmd:'pCmd',map:'pMap'};
const PRESET={
  rise:{nm:'Rise',p:{obj:[1,0],al:[1,0],sel:[1,0],cmd:[1,0],map:[1,0]},dock:1,big:0,one:0},
  modern:{nm:'Moderno',p:{obj:[1,1],al:[1,0],sel:[1,0],cmd:[1,0],map:[1,0]},dock:0,big:0,one:0,clean:1},
  equil:{nm:'Equilibrado',p:{obj:[1,0],al:[1,0],sel:[1,0],cmd:[1,0],map:[1,0]},dock:0,big:0,one:0},
  classic:{nm:'Clássico',p:{obj:[1,0],al:[1,0],sel:[1,0],cmd:[1,0],map:[1,0]},dock:1,big:1,one:0},
  // Tela Livre: quase tudo é campo. Barra de recursos em cima, minimapa no canto, e a seleção e os
  // comandos só aparecem quando há algo selecionado, sem barras de título.
  livre:{nm:'Tela Livre',p:{obj:[1,1],al:[1,1],sel:[1,0],cmd:[1,0],map:[1,0]},dock:0,big:0,one:1,free:1},
  battle:{nm:'Campo de Batalha',p:{obj:[1,1],al:[1,0],sel:[0,0],cmd:[1,0],map:[1,1]},dock:0,big:0,one:1}};
function hudDefault(pre){pre=pre||'livre';const P=PRESET[pre],o={v:1,pre,size:1,p:{}};for(const k of PNL)o.p[k]={v:P.p[k][0],m:P.p[k][1],pos:null};return o}
let HS=hudDefault();
try{const s=JSON.parse(localStorage.getItem(HUDK)||'null');if(s&&s.v===1&&PRESET[s.pre]){HS=s;for(const k of PNL)if(!HS.p[k])HS.p[k]={v:1,m:0,pos:null}}
  // uma vez só: quem já tinha o jogo passa para a Tela Livre (dá para voltar ao modo antigo no 🧩)
  if(!localStorage.getItem('imperio_ui_livre1')){localStorage.setItem('imperio_ui_livre1','1');HS=hudDefault('livre');localStorage.setItem(HUDK,JSON.stringify(HS))}}catch(e){}
function hudSave(){try{localStorage.setItem(HUDK,JSON.stringify(HS))}catch(e){}}
const hudScale=()=>HS.size*clamp(Math.min(innerWidth/914,innerHeight/411),.8,1.3);

// ---------- posição de cada painel ----------
// pos = {ax:'l'|'c'|'r', ay:'t'|'b', dx, dy} em pixels da tela, medidos a partir da borda escolhida
function defPos(k){
  const pre=HS.pre,s=hudScale();
  if(pre==='rise'){
    if(k==='obj')return{ax:'l',ay:'t',dx:6,dy:TOPH+8};
    if(k==='al'){const o=$('pObj');const below=HS.p.obj.v&&!HS.p.obj.pos&&o.offsetParent;return{ax:'l',ay:'t',dx:6,dy:below?o.getBoundingClientRect().bottom+6:TOPH+8}}
    if(k==='map')return{ax:'l',ay:'b',dx:4,dy:4};
    if(k==='cmd')return{ax:'r',ay:'b',dx:4,dy:4};
    {const m=$('pMap'),L=HS.p.map.v&&m.offsetParent?m.getBoundingClientRect().right+6:4;return{ax:'l',ay:'b',dx:L,dy:4}}}
  if(pre==='modern'){
    if(k==='obj')return{ax:'l',ay:'t',dx:6,dy:TOPH+10};
    if(k==='al'){const o=$('pObj');const below=HS.p.obj.v&&!HS.p.obj.pos&&o.offsetParent;return{ax:'l',ay:'t',dx:6,dy:below?o.getBoundingClientRect().bottom+6:TOPH+10}}
    if(k==='map')return{ax:'l',ay:'b',dx:4,dy:4};
    if(k==='cmd')return{ax:'r',ay:'b',dx:4,dy:4};
    {const m=$('pMap'),c=$('pCmd'),L=HS.p.map.v&&m.offsetParent&&!m.classList.contains('big')?m.getBoundingClientRect().right+6:4,R=HS.p.cmd.v&&c.offsetParent?c.getBoundingClientRect().left-6:innerWidth-4,w=$('pSel').offsetWidth*s;
     return{ax:'l',ay:'b',dx:Math.max(L,L+(R-L-w)/2),dy:4}}}
  // Objetivos e Alertas começam logo à direita dos botões redondos (aldeão parado, exército, cidade), sem cobrir nenhum
  const qL=(()=>{const q=$('quick');const r=q&&q.offsetParent?q.getBoundingClientRect():null;return r&&r.width?r.right+6:52})();
  if(k==='obj')return{ax:'l',ay:'t',dx:qL,dy:TOPH+6};
  if(k==='al'){const o=$('pObj');const below=HS.p.obj.v&&!HS.p.obj.pos&&o.offsetParent;return{ax:'l',ay:'t',dx:qL,dy:below?o.getBoundingClientRect().bottom+6:TOPH+6}}
  if(k==='map')return{ax:'r',ay:'b',dx:4,dy:4};
  if(k==='cmd'){if(pre==='battle'||pre==='livre')return{ax:'c',ay:'b',dx:0,dy:4};
    const m=$('pMap'),mw=HS.p.map.v&&!HS.p.map.pos?m.offsetWidth*s+8:0;return{ax:'r',ay:'b',dx:4+mw,dy:4}}
  return{ax:'l',ay:'b',dx:4,dy:4};// sel
}
function placeEl(el,p){const s=hudScale(),w=el.offsetWidth*s,h=el.offsetHeight*s;
  const sf=safeLR();let x=p.ax==='l'?Math.max(p.dx,sf.l+p.dx*(p.dx<20?1:0)):p.ax==='r'?innerWidth-p.dx-sf.r-w:(innerWidth-w)/2+p.dx;
  let y=p.ay==='t'?p.dy:innerHeight-p.dy-h;
  const tabH=el.classList.contains('tab')?22*s:0;
  x=clamp(x,0,Math.max(0,innerWidth-w));y=clamp(y,TOPH+tabH,Math.max(TOPH,innerHeight-h));
  el.style.left=x+'px';el.style.top=y+'px';el.style.right='auto';el.style.bottom='auto';
  el.style.transform=s===1?'':'scale('+s+')';el.style.transformOrigin='0 0'}
function layoutHUD(){
  if(!G||$('hud').style.display==='none')return;
  const P=PRESET[HS.pre],s=hudScale();
  document.body.classList.toggle('big-cls',!!P.big);document.body.classList.toggle('clean',!!P.clean);document.body.classList.toggle('free',!!P.free);
  $('pCmd').classList.toggle('one',!!P.one);
  for(const k of PNL){const el=$(PEL[k]),st=HS.p[k];
    el.classList.toggle('hide',!st.v);el.classList.toggle('min',!!st.m);
    const pos=st.pos||defPos(k);el.classList.toggle('tab',!P.clean&&!P.free&&pos.ay==='b'&&k!=='obj'&&k!=='al');
    el.querySelector('[data-a="min"]').textContent=st.m?'□':'—'}
  // seleção: ocupa o espaço que sobra até os comandos (no Clássico enche tudo)
  const si=$('info');si.style.width='';
  if(HS.p.sel.v&&!HS.p.sel.pos){const c=$('pCmd'),cw=HS.p.cmd.v?c.offsetWidth*s:0,mw=HS.p.map.v?$('pMap').offsetWidth*s:0;
    const free=(innerWidth-(HS.pre==='battle'?0:cw+mw)-30)/s-16;si.style.width=Math.round(P.free?clamp(((innerWidth-cw)/2-14)/s-14,130,230):clamp(P.big?free:Math.min(free,P.clean?360:300),170,560))+'px'}
  $('objl').style.maxHeight=$('all').style.maxHeight='';
  for(const k of['obj','al','map','cmd','sel']){const el=$(PEL[k]);if(!HS.p[k].v)continue;placeEl(el,HS.p[k].pos||defPos(k))}
  // altura livre embaixo: o centro da câmera fica no meio da parte que sobra do mapa
  let low=0;for(const k of['sel','cmd','map']){const el=$(PEL[k]);if(!HS.p[k].v||HS.p[k].m||el.classList.contains('big'))continue;const r=el.getBoundingClientRect();if(r.top>innerHeight*.45)low=Math.max(low,innerHeight-r.top+(el.classList.contains('tab')?22*s:0))}
  PANH=Math.round(clamp(low,0,innerHeight*.34));
  const dk=$('dock');dk.style.display=P.dock?'block':'none';dk.style.height=Math.max(0,PANH-14*s)+'px';
  $('placebar').style.bottom=(PANH+12)+'px';
  // botões rápidos: no Moderno ficam numa fileira em cima do minimapa
  const q=$('quick');if(P.clean&&HS.p.map.v){const r=$('pMap').getBoundingClientRect();q.style.left=Math.max(4,r.left)+'px';q.style.top=Math.max(TOPH+40,r.top-48)+'px'}else{q.style.left='';q.style.top=''}
  // objetivos e alertas não podem descer por cima dos painéis de baixo: a lista ganha rolagem
  fitTopStack();
}
function hudObstacles(skip){const L=[];for(const k of PNL){if(k===skip||!HS.p[k].v)continue;const el=$(PEL[k]);if(!el.offsetParent||getComputedStyle(el).display==='none')continue;const r=el.getBoundingClientRect();const ph=el.classList.contains('tab')&&!el.classList.contains('min')?el.querySelector('.ph').getBoundingClientRect():null;L.push({k,l:r.left,r:r.right,t:Math.min(r.top,ph?ph.top:r.top),b:r.bottom})}
  const q=$('quick');if(q.offsetParent){const r=q.getBoundingClientRect();L.push({k:'quick',l:r.left,r:r.right,t:r.top,b:r.bottom})}
  {const t=$('toast');if(skip===null&&t.style.display==='block'){const r=t.getBoundingClientRect();L.push({k:'#toast',l:r.left,r:r.right,t:r.top,b:r.bottom})}}
  for(const s of['#top .tl','#top .tr']){const e=document.querySelector(s);if(e){const r=e.getBoundingClientRect();if(r.width)L.push({k:s,l:r.left,r:r.right,t:r.top,b:r.bottom})}}return L}
function fitTopStack(){const s=hudScale();
  for(const [k,list] of[['obj','objl'],['al','all']]){const el=$(PEL[k]);if(!HS.p[k].v||HS.p[k].m||!el.offsetParent)continue;const r=el.getBoundingClientRect();
    let lim=innerHeight-4;for(const o of hudObstacles(k)){if(o.k==='obj'||o.k==='al'||o.k.startsWith('#'))continue;if(o.r>r.left&&o.l<r.right&&o.t>r.top)lim=Math.min(lim,o.t-6)}
    el.classList.remove('sq');const r2=el.getBoundingClientRect();
    if(r2.bottom>lim){const pc=$(list),pr=pc.getBoundingClientRect(),room=(lim-pr.top)/s;if(room<34)el.classList.add('sq');else pc.style.maxHeight=room+'px'}}}
function noOverlapXY(el,x,y){const w=el.offsetWidth,h=el.offsetHeight,obs=hudObstacles(null),hit=(X,Y)=>obs.some(o=>X<o.r&&X+w>o.l&&Y<o.b&&Y+h>o.t);
  if(!hit(x,y))return[x,y];
  // tenta: subir, ir para o meio da tela, canto de cima à direita
  for(const [X,Y] of[[x,Math.min(y,Math.min(...obs.filter(o=>o.r>x&&o.l<x+w&&o.t>innerHeight/2).map(o=>o.t),innerHeight)-h-6)],[(innerWidth-w)/2,(innerHeight-h)/2],[innerWidth-w-6,TOPH+44],[(innerWidth-w)/2,TOPH+44]]){const XX=clamp(X,4,innerWidth-w-4),YY=clamp(Y,TOPH+4,innerHeight-h-4);if(!hit(XX,YY))return[XX,YY]}
  return[clamp((innerWidth-w)/2,4,innerWidth-w-4),clamp((innerHeight-h)/2,TOPH+4,innerHeight-h-4)]
}
addEventListener('resize',()=>setTimeout(layoutHUD,60));

// ---------- botões do título e arrastar ----------
for(const k of PNL){const el=$(PEL[k]),ph=el.querySelector('.ph');
  ph.addEventListener('click',ev=>{const b=ev.target.closest('.pbn');if(!b)return;ev.stopPropagation();snd('click');
    if(b.dataset.a==='min')HS.p[k].m=HS.p[k].m?0:1;
    else{HS.p[k].v=0;if(k==='map')mmBig(false);toast('Painel '+PNAME[k]+' escondido · toque em 🧩 para mostrar de novo')}
    hudSave();layoutHUD()});
  let d=null;
  ph.addEventListener('pointerdown',ev=>{if(ev.target.closest('.pbn')||el.classList.contains('big'))return;const r=el.getBoundingClientRect();d={id:ev.pointerId,x:ev.clientX,y:ev.clientY,l:r.left,t:r.top,mv:false};try{ph.setPointerCapture(ev.pointerId)}catch(_){}});
  ph.addEventListener('pointermove',ev=>{if(!d||ev.pointerId!==d.id)return;const dx=ev.clientX-d.x,dy=ev.clientY-d.y;
    if(!d.mv&&Math.hypot(dx,dy)<8)return;d.mv=true;el.classList.add('drag');
    const s=hudScale(),w=el.offsetWidth*s,h=el.offsetHeight*s,tabH=el.classList.contains('tab')?22*s:0;
    el.style.left=clamp(d.l+dx,0,innerWidth-w)+'px';el.style.top=clamp(d.t+dy,TOPH+tabH,innerHeight-h)+'px'});
  const up=ev=>{if(!d||ev.pointerId!==d.id)return;el.classList.remove('drag');
    if(d.mv){const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      const ax=cx<innerWidth/3?'l':cx>innerWidth*2/3?'r':'c',ay=cy<innerHeight/2?'t':'b';
      HS.p[k].pos={ax,ay,dx:ax==='l'?r.left:ax==='r'?innerWidth-r.right:cx-innerWidth/2,dy:ay==='t'?r.top:innerHeight-r.bottom};
      hudSave();layoutHUD()}
    else if(!ev.target.closest('.pbn')&&(HS.p[k].m||PRESET[HS.pre].clean)&&(k==='obj'||k==='al'||HS.p[k].m)){HS.p[k].m=HS.p[k].m?0:1;hudSave();layoutHUD();snd('click')}
    d=null};
  ph.addEventListener('pointerup',up);ph.addEventListener('pointercancel',up);
}

// ---------- tela de ajuste (🧩) ----------
function uiSetOpen(){if(!running)return;paused=true;uiSetUpd();show('uiset')}
function uiSetClose(){paused=false;show(null);setTimeout(layoutHUD,30)}
function uiSetUpd(){
  document.querySelectorAll('#uiset [data-pre]').forEach(b=>b.classList.toggle('on',b.dataset.pre===HS.pre));
  document.querySelectorAll('#uiset [data-sz]').forEach(b=>b.classList.toggle('on',+b.dataset.sz===HS.size));
  // miniatura de cada modo: onde ficam os painéis na tela
  const PV={rise:[[0,0,100,12],[1,15,26,22],[1,70,20,28],[23,70,55,28],[79,70,20,28]],modern:[[1,3,48,13],[66,3,33,13],[1,21,22,11],[1,70,24,28],[33,76,34,22],[71,70,28,28]],
    classic:[[0,0,100,12],[1,15,26,22],[0,68,100,32]],livre:[[0,0,100,10],[30,84,40,14],[82,74,17,24]],
    equil:[[0,0,100,12],[8,16,26,26],[1,70,34,28],[40,70,28,28],[71,66,28,32]],
    battle:[[0,0,100,12],[1,15,20,9],[30,78,40,20],[80,86,19,12]]};
  document.querySelectorAll('#uiset [data-pre]').forEach(b=>{const pv=b.querySelector('.pv');if(pv&&!pv.childElementCount)pv.innerHTML=PV[b.dataset.pre].map(r=>'<u style="left:'+r[0]+'%;top:'+r[1]+'%;width:'+r[2]+'%;height:'+r[3]+'%"></u>').join('')});
  const box=$('uipn');box.innerHTML='';
  for(const k of PNL){const b=document.createElement('button');b.className='mb chip'+(HS.p[k].v?' on':'');const nm=PNAME[k],sp=nm.indexOf(' ');
    b.innerHTML='<span>'+nm.slice(0,sp)+' '+nm.slice(sp+1)+'<small>'+(!HS.p[k].v?'escondido':HS.p[k].m?'encolhido':'à mostra')+'</small></span><em></em>';
    b.onclick=()=>{snd('click');HS.p[k].v=HS.p[k].v?0:1;if(HS.p[k].v)HS.p[k].m=0;hudSave();uiSetUpd()};box.appendChild(b)}
}
document.querySelectorAll('#uiset [data-pre]').forEach(b=>b.onclick=()=>{snd('click');const sz=HS.size;HS=hudDefault(b.dataset.pre);HS.size=sz;hudSave();uiSetUpd()});
document.querySelectorAll('#uiset [data-sz]').forEach(b=>b.onclick=()=>{snd('click');HS.size=+b.dataset.sz;hudSave();uiSetUpd()});
$('uirst').onclick=()=>{snd('click');HS=hudDefault('livre');hudSave();uiSetUpd();toast('↺ Interface padrão restaurada')};
$('uiok').onclick=uiSetClose;$('uiok2').onclick=uiSetClose;
$('bui').onclick=()=>{snd('click');uiSetOpen()};

// ---------- minimapa: zoom e tela cheia ----------
function mmBig(on){const p=$('pMap');p.classList.toggle('big',!!on);if(on){HS.p.map.v=1;HS.p.map.m=0;p.classList.remove('hide','min','tab')}PAD.big=!!on;setTimeout(layoutHUD,0)}
$('zin').onclick=()=>{Z=clamp(Z*1.2,.45,1.7);snd('click')};
$('zout').onclick=()=>{Z=clamp(Z/1.2,.45,1.7);snd('click')};
$('mbig').onclick=()=>{snd('click');mmBig(!$('pMap').classList.contains('big'))};
mm.addEventListener('pointerup',()=>{if($('pMap').classList.contains('big')&&inputMode!=='pad')mmBig(false)});

// ---------- ritmo de coleta (por minuto) ----------
UI.inc=[];
function incAdd(k,a){UI.inc.push([G.t,k,a])}
function incRates(){const t0=G.t-60;while(UI.inc.length&&UI.inc[0][0]<t0)UI.inc.shift();
  const r={food:0,wood:0,gold:0,stone:0,wealth:0,know:0,oil:0};for(const[,k,a]of UI.inc)r[k]=(r[k]||0)+a;const win=Math.max(30,Math.min(60,G.t));for(const k in r)r[k]=Math.round(r[k]*60/win);return r}

// ---------- alertas ----------
UI.alerts=[];
function pushAlert(m){const t=G?G.t:0;const ex=UI.alerts.find(a=>a.m===m);if(ex){ex.t=t;ex.x=null;return}UI.alerts.unshift({m,t,x:null,y:null});if(UI.alerts.length>6)UI.alerts.pop();UI.alSig=''}
const toast0=toast;
toast=function(m){toast0(m);if(/^(⚠️|⏳|🏁)/.test(m)&&G)pushAlert(m)};
$('all').addEventListener('click',ev=>{const a=ev.target.closest('[data-ai]');if(!a)return;const al=UI.alerts[+a.dataset.ai];if(!al)return;snd('click');
  if(ev.target.closest('.alx')){UI.alerts.splice(+a.dataset.ai,1);UI.alSig='';hudExtra();return}
  if(al.x!=null)centerOn(al.x,al.y);else toast('Este aviso não tem um lugar no mapa')});

// ---------- objetivos (vêm do estado do jogo; tocar leva até onde resolver) ----------
function selVill(){const vs=G.U.filter(u=>!u.dead&&!u.inT&&u.o===0&&u.type==='vill');if(!vs.length){toast('Você não tem aldeões');return}
  const u=vs.find(v=>v.st==='idle')||vs[0];SEL=[u.id];UI.page=0;centerOn(u.x,u.y);updHUD(true)}
let OBJ=[];
function objList(){
  const P=G.P[0],a=P.age,out=[];
  const nv=G.U.filter(u=>!u.dead&&u.o===0&&u.type==='vill').length,vt=[16,24,32,40][a]||40;
  out.push({t:'Tenha '+vt+' aldeões ('+Math.min(nv,vt)+'/'+vt+')',ok:nv>=vt,go:quickTC});
  if(a<ENDAGE()){const need=AGEREQ[a+1],got=need.filter(t=>hasReq(0,t)),miss=need.filter(t=>!hasReq(0,t));
    out.push({t:got.length>=2?'Biblioteca pronta para pesquisar a era':'Construa uma Biblioteca (lá se avança de era)',ok:got.length>=2,go:selVill});
    const ab=G.B.find(b=>!b.dead&&b.o===0&&b.q[0]==='age');
    out.push({t:'Avance para a '+AGES[a+1]+' na Biblioteca'+(ab?' ('+Math.floor(ab.qt/AGETIME[a+1]*100)+'%)':''),ok:false,go:quickLib})}
  else{const w=G.B.find(b=>!b.dead&&b.o===0&&b.type==='maravilha');out.push({t:w?(w.done<1?'Termine a Maravilha ('+Math.floor(w.done*100)+'%)':'Proteja a Maravilha ('+fmtT(WONDER_T-G.won[0])+')'):'Construa uma Maravilha',ok:false,go:selVill})}
  if(a>=1&&hasReq(0,'biblioteca')&&!hasReq(0,'universidade'))out.push({t:'Construa uma Universidade e treine Eruditos (conhecimento)',ok:false,go:selVill});
  if(a>=1&&!hasReq(0,'biblioteca'))out.push({t:'Construa uma Biblioteca (linhas Cívica, Comércio e Ciência)',ok:false,go:selVill});
  const ml=P.mil||0;if(ml<MIL_N&&P.age>=MILAGE[ml])out.push({t:'Linha Militar '+ROMAN[ml+1]+' na Biblioteca (população +'+POP_STEP+')',ok:false,go:()=>{const b=G.B.find(x=>!x.dead&&x.o===0&&x.type==='biblioteca'&&x.done>=1);if(!b){selVill();toast('Construa uma Biblioteca primeiro');return}SEL=[b.id];const c=ctr(b);centerOn(c.x,c.y);updHUD(true)}});
  const nc=G.B.filter(b=>!b.dead&&b.o===0&&b.type==='tc'&&b.done>=1).length;
  if(a>=1&&nc<2)out.push({t:'Funde uma 2ª cidade (Centro Urbano)',ok:false,go:selVill});
  if(a>=2)out.push({t:'Domine 65% da terra (agora '+Math.round(domShare(0)*100)+'%)',ok:domShare(0)>=.65,go:null});
  return out.slice(0,4);
}
$('objl').addEventListener('click',ev=>{const o=ev.target.closest('[data-oi]');if(!o)return;const ob=OBJ[+o.dataset.oi];if(ob&&ob.go){snd('click');ob.go()}});

// ---------- seleção: grupos com vida; tocar num grupo deixa só ele ----------
$('info').addEventListener('click',ev=>{const g=ev.target.closest('[data-grp]');if(!g)return;const k=g.dataset.grp;
  SEL=selEnts().filter(e=>(e.k==='u'?'u'+e.type:'b'+e.type)===k).map(e=>e.id);snd('sel');updHUD(true)});
const infoHTML0=infoHTML;
infoHTML=function(s){
  if(s.length<2)return infoHTML0(s);
  const c={};for(const e of s){const k=e.k==='u'?'u'+e.type:'b'+e.type;const h=e.k==='u'?e.hp/ST(e).hp:e.hp/e.mhp;(c[k]=c[k]||{n:0,h:0}).n++;c[k].h+=h}
  return'<button class="cb x">✖</button><div class="bd"><div class="grp">'+Object.entries(c).map(([k,v])=>'<span data-grp="'+k+'"><img src="'+(THUMB[k==='uguer'&&ST({type:'guer',o:0}).axe?'uguerA':k]||'')+'"><b>'+v.n+'</b><u><em style="width:'+Math.round(clamp(v.h/v.n,0,1)*100)+'%"></em></u></span>').join('')+'</div><div class="st" style="font-size:10.5px;opacity:.75;margin-top:2px">Toque num grupo para ficar só com ele</div></div>'};

// ---------- comandos militares de verdade (usam as mesmas ordens do jogo) ----------
function grpCenter(us){return us.reduce((a,u)=>({x:a.x+u.x/us.length,y:a.y+u.y/us.length}),{x:0,y:0})}
function cmdAttack(us){const c=grpCenter(us);let best=null,bd=1e9;
  for(const u of G.U){if(u.dead||u.inT||!foe(u.o,0)||!vis[tileOf(u.x,u.y)])continue;const d=hyp(u.x-c.x,u.y-c.y);if(d<bd){bd=d;best=u}}
  for(const b of G.B){if(b.dead||!foe(b.o,0)||!G.exp[idx(b.tx,b.ty)])continue;const p=ctr(b),d=hyp(p.x-c.x,p.y-c.y)*1.3;if(d<bd){bd=d;best=b}}
  if(!best){toast('Nenhum inimigo à vista · explore primeiro');return}
  us.forEach(u=>orderAttack(u,best));const p=ctr(best);mark(p.x,p.y,'#ff5a4a')}
function cmdScout(us){let n=0;for(const u of us){let p=null;for(let k=0;k<80&&!p;k++){const i=(Math.random()*N)|0;if(!G.exp[i]&&pass[i])p=i}
    if(!p)for(let k=0;k<80&&!p;k++){const i=(Math.random()*N)|0;if(pass[i]&&!vis[i])p=i}
    if(p!=null){orderMove(u,(p%MW+.5)*TS,((p/MW|0)+.5)*TS);n++}}
  toast(n?'🔭 Explorando o desconhecido':'Não achei lugar para explorar')}
function cmdRetreat(us){const tcs=G.B.filter(b=>!b.dead&&b.o===0&&b.type==='tc');if(!tcs.length){toast('Sem Centro Urbano para recuar');return}
  const c=grpCenter(us);let t=tcs[0],bd=1e9;for(const b of tcs){const p=ctr(b),d=hyp(p.x-c.x,p.y-c.y);if(d<bd){bd=d;t=b}}
  const p=ctr(t);us.forEach((u,i)=>{const a=i*2.4,r=TS*(2.4+(i%5)*.45);orderMove(u,p.x+Math.cos(a)*r,p.y+Math.sin(a)*r)});mark(p.x,p.y,'#7cf');toast('↩️ Recuando para a cidade')}
const getCmds0=getCmds;
getCmds=function(){const out=getCmds0();const us=selEnts().filter(e=>e.k==='u'&&e.o===0);
  if(us.length&&us[0]===selEnts()[0]&&!us.some(u=>u.type==='vill'||u.type==='pesc'||u.type==='trans')){
    const fight=us.filter(u=>ST(u).atk>0);const ex=[];
    if(fight.length)ex.push({ic:'⚔️',nm:'Atacar o inimigo mais perto',act:()=>cmdAttack(fight)});
    if(!us.every(isNav))ex.push({ic:'🔭',nm:'Explorar',act:()=>cmdScout(us.filter(u=>!isNav(u)))});
    ex.push({ic:'↩️',nm:'Recuar para a cidade',act:()=>cmdRetreat(us)});
    const i=out.findIndex(c=>c.ic==='✋');out.splice(i<0?out.length:i,0,...ex)}
  return out.slice(0,12)};

// ---------- atualização dos painéis ----------
function hudExtra(){
  if(!G)return;const P=G.P[0];
  const r=incRates(),vc={food:0,wood:0,gold:0,stone:0,know:0,wealth:0};
  for(const u of G.U){if(u.dead||u.o!==0)continue;if(u.type==='pesc'&&(u.st==='gather'||u.st==='return')){vc.food++;continue}
    if(u.type!=='vill'||(u.st!=='gather'&&u.st!=='return'))continue;const s=u.lsub;vc[s==='tree'?'wood':s==='gold'||s==='stone'?'gold':'food']++}
  for(const u of G.U){if(u.dead||u.o!==0)continue;if(u.type==='erudito'&&u.st==='study'&&!u.mv)vc.know++;else if((u.type==='mercador'&&u.st==='rare')||u.type==='caravana')vc.wealth++}
  for(const[k,id]of[['food','rtf'],['wood','rtw'],['gold','rtg'],['wealth','rts'],['know','rtk'],['oil','rto']]){const t=(vc[k]?(k==='know'?'🎓':k==='wealth'?'🐫':'👷')+vc[k]+' ':'')+(r[k]?'+'+r[k]+'/min':'');if($(id).textContent!==t)$(id).textContent=t}
  // objetivos
  OBJ=objList();const oh=OBJ.map((o,i)=>'<div class="ob'+(o.ok?' ok':'')+(o.go?' go':'')+'" data-oi="'+i+'"><i>'+(o.ok?'✔':'')+'</i><span>'+o.t+'</span></div>').join('');
  let relay=false;const ol=$('objl');if(oh!==ol._h){ol._h=oh;ol.innerHTML=oh;relay=true}
  // alertas (somem sozinhos depois de 2 minutos)
  UI.alerts=UI.alerts.filter(a=>G.t-a.t<120);
  for(const a of UI.alerts)if(a.x==null&&UI.lastAlert&&Math.abs(UI.lastAlert.t-a.t)<1.5){a.x=UI.lastAlert.x;a.y=UI.lastAlert.y}
  const ah=UI.alerts.length?UI.alerts.slice(0,3).map((a,i)=>'<div class="al" data-ai="'+i+'"><span>'+a.m+'</span>'+(a.x!=null?'<b>›</b>':'')+'<button class="pbn alx">✕</button></div>').join(''):'';
  const al=$('all');if(ah!==al._h){al._h=ah;al.innerHTML=ah;relay=true}
  $('alt').textContent=UI.alerts.length?'⚠️ Alertas ('+UI.alerts.length+')':'✓ Alertas · tudo calmo';$('pAl').classList.toggle('calm',!UI.alerts.length);
  $('pAl').style.borderColor=UI.alerts.length&&G.t-UI.alerts[0].t<8&&((G.t*3|0)%2)?'#ff6a50':'';
  // títulos
  const s=selEnts();const mil=s.filter(e=>e.k==='u'&&e.o===0&&isMil(e)).length;
  $('selt').textContent=!s.length?'👤 Seleção':s.length===1?(s[0].k==='u'?ST(s[0]).n:s[0].k==='b'?BT[s[0].type].n:'Recurso'):(mil===s.length?'⚔️ Soldados selecionados ('+s.length+')':'👥 Selecionados ('+s.length+')');
  $('cmdt').textContent=s.length?'⚡ Comandos':'⚡ Comandos · selecione algo';
  const ns=!s.length;if(ns!==$('pSel').classList.contains('empty')){$('pSel').classList.toggle('empty',ns);relay=true}
  const nd=OBJ.filter(o=>o.ok).length;$('objt').textContent='🎯 Objetivos '+nd+'/'+OBJ.length;
  const emp=!$('cmds').children.length;if(emp!==$('pCmd').classList.contains('empty')){$('pCmd').classList.toggle('empty',emp);relay=true}
  if(relay)layoutHUD();
}
const updHUD0=updHUD;
updHUD=function(force){updHUD0(force);if(G&&running)hudExtra()};
const startGame0=startGame;
startGame=function(){UI.inc=[];UI.alerts=[];startGame0();mmBig(false);setTimeout(()=>{layoutHUD();hudExtra();layoutHUD()},0)};
window.__RA.startGame=startGame;window.__RA.layoutHUD=layoutHUD;

// recorte da câmera/entalhe do celular (deitado): o painel não pode ficar embaixo dele
function safeLR(){let d=$('safeprobe');if(!d){d=document.createElement('div');d.id='safeprobe';d.style.cssText='position:fixed;visibility:hidden;pointer-events:none;left:0;top:0;padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)';document.body.appendChild(d)}
  const cs=getComputedStyle(d);return{l:parseFloat(cs.paddingLeft)||0,r:parseFloat(cs.paddingRight)||0}}
