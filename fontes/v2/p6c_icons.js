
// =========================================================
//   ÍCONES DESENHADOS PARA CADA BOTÃO + FICHA ANTES DE CONSTRUIR
//   tocar uma vez = ver a ficha (o que é, custo, tempo, para que serve)
//   tocar de novo (ou no botão verde da ficha) = fazer
// =========================================================
const ICO={};
function icoC(){const c=document.createElement('canvas');c.width=c.height=80;const g=c.getContext('2d');g.lineCap='round';g.lineJoin='round';return[c,g]}
// medalhão: aro dourado e fundo da cor do assunto
function medal(g,c1,c2){const r=g.createRadialGradient(34,30,4,40,40,36);r.addColorStop(0,c1);r.addColorStop(1,c2);
  g.beginPath();g.arc(40,40,36,0,7);g.fillStyle=r;g.fill();g.lineWidth=4;const a=g.createLinearGradient(0,4,0,76);a.addColorStop(0,'#fff0b0');a.addColorStop(.5,'#c9952e');a.addColorStop(1,'#6a4410');g.strokeStyle=a;g.stroke();
  g.beginPath();g.arc(40,40,31,0,7);g.lineWidth=1;g.strokeStyle='#0006';g.stroke()}
function stroke2(g,f,w,c1,c2){g.lineWidth=w+3;g.strokeStyle=c2||'#1a0e04';f();g.stroke();g.lineWidth=w;g.strokeStyle=c1;f();g.stroke()}
function path(g,pts,close){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);if(close)g.closePath()}
function fillP(g,pts,col,out){path(g,pts,true);g.fillStyle=col;g.fill();g.lineWidth=2;g.strokeStyle=out||'#1a0e04';g.stroke()}
function sword(g,x,y,ang,len,blade){g.save();g.translate(x,y);g.rotate(ang);
  fillP(g,[[-3.5,-6],[3.5,-6],[3.5,-len+8],[0,-len],[-3.5,-len+8]],blade||'#e6eaf0');
  g.beginPath();g.moveTo(0,-8);g.lineTo(0,-len+6);g.strokeStyle='#ffffff99';g.lineWidth=1;g.stroke();
  fillP(g,[[-11,-8],[11,-8],[11,-3],[-11,-3]],'#c9952e');fillP(g,[[-2.5,-3],[2.5,-3],[2.5,9],[-2.5,9]],'#6a3e1a');
  g.beginPath();g.arc(0,11.5,3.6,0,7);g.fillStyle='#e2bd62';g.fill();g.lineWidth=1.5;g.strokeStyle='#1a0e04';g.stroke();g.restore()}
function numeral(g,t,col){g.font='bold 15px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=4;g.strokeStyle='#1a0e04';g.strokeText(t,40,64);g.fillStyle=col||'#fff1c0';g.fillText(t,40,64)}
function badge(g,txt,bg){g.beginPath();g.arc(62,62,13,0,7);g.fillStyle=bg;g.fill();g.lineWidth=2.5;g.strokeStyle='#fff3c4';g.stroke();g.font='bold 17px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText(txt,62,63)}
// ---------- eras: um emblema diferente para cada uma ----------
const ERA_ART=[
  g=>{medal(g,'#a07a50','#4a3018');// Pedra: machado de pedra lascada
    stroke2(g,()=>{g.beginPath();g.moveTo(27,58);g.lineTo(50,22)},5,'#8a5a2a');
    fillP(g,[[42,14],[60,20],[62,34],[50,36],[40,28]],'#9a958d');path(g,[[46,20],[56,24]]);g.strokeStyle='#d8d2c6';g.lineWidth=1.5;g.stroke();
    stroke2(g,()=>{g.beginPath();g.moveTo(42,30);g.lineTo(50,24)},2.5,'#c8a060')},
  g=>{medal(g,'#7aa060','#2c4a1a');// Ferramentas: martelo e cinzel
    stroke2(g,()=>{g.beginPath();g.moveTo(24,60);g.lineTo(46,30)},5,'#9a6a32');
    g.save();g.translate(46,28);g.rotate(-.95);fillP(g,[[-14,-6],[12,-6],[12,6],[-14,6]],'#b8bcc4');g.restore();
    stroke2(g,()=>{g.beginPath();g.moveTo(50,58);g.lineTo(58,36)},4,'#c8ccd2')},
  g=>{medal(g,'#d89a50','#6a3a10');// Bronze: escudo redondo e lança
    stroke2(g,()=>{g.beginPath();g.moveTo(20,60);g.lineTo(60,16)},3,'#8a5a2a');fillP(g,[[60,16],[54,18],[58,24]],'#e8c070');
    const r=g.createRadialGradient(36,36,2,40,42,17);r.addColorStop(0,'#ffe0a0');r.addColorStop(1,'#a8641c');g.beginPath();g.arc(40,42,17,0,7);g.fillStyle=r;g.fill();g.lineWidth=2.5;g.strokeStyle='#1a0e04';g.stroke();
    g.beginPath();g.arc(40,42,5,0,7);g.fillStyle='#f6d080';g.fill();g.stroke()},
  g=>{medal(g,'#7a8aa8','#22283a');sword(g,40,56,0,44,'#d8dee8')}// Ferro: espada de ferro
];
function eraIcon(a){const k='era'+a;if(!ICO[k]){const[c,g]=icoC();ERA_ART[a](g);numeral(g,ROMAN[a+1]);ICO[k]=c.toDataURL()}return ICO[k]}
function eraUpIcon(a){const k='eraUp'+a;if(!ICO[k]){const[c,g]=icoC();ERA_ART[a](g);numeral(g,ROMAN[a+1]);badge(g,'▲','#2e8a2a');ICO[k]=c.toDataURL()}return ICO[k]}
// ---------- comandos ----------
const CMD_ART={
  stop:g=>{medal(g,'#c85040','#5a140c');const p=[];for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;p.push([40+Math.cos(a)*22,40+Math.sin(a)*22])}fillP(g,p,'#e04030','#fff');
    g.fillStyle='#fff';g.fillRect(27,36,26,8)},
  atk:g=>{medal(g,'#c85a40','#4a1008');sword(g,30,58,-.75,40);sword(g,50,58,.75,40)},
  scout:g=>{medal(g,'#5a9ac8','#163452');g.save();g.translate(40,40);g.rotate(-.6);fillP(g,[[-24,-5],[2,-7],[2,7],[-24,5]],'#c9952e');fillP(g,[[2,-8],[20,-9],[20,9],[2,8]],'#a8743a');
    g.beginPath();g.ellipse(21,0,3,9,0,0,7);g.fillStyle='#bfe6ff';g.fill();g.lineWidth=2;g.strokeStyle='#1a0e04';g.stroke();g.restore()},
  back:g=>{medal(g,'#5aa0a0','#163a3a');fillP(g,[[44,34],[58,22],[72-6,34],[66-4,34],[66-4,50],[48,50],[48,34]],'#e8d8b0');fillP(g,[[42,35],[58,20],[70,35]],'#b0402a');
    g.beginPath();g.moveTo(40,58);g.quadraticCurveTo(14,56,18,34);stroke2(g,()=>{g.beginPath();g.moveTo(40,58);g.quadraticCurveTo(14,56,18,32)},4,'#fff');fillP(g,[[10,36],[18,24],[26,36]],'#fff')},
  anchor:g=>{medal(g,'#4a8ac0','#10284a');stroke2(g,()=>{g.beginPath();g.moveTo(40,20);g.lineTo(40,60);g.moveTo(30,28);g.lineTo(50,28);g.moveTo(22,48);g.quadraticCurveTo(26,62,40,60);g.quadraticCurveTo(54,62,58,48)},4,'#d8dee8');
    g.beginPath();g.arc(40,17,5,0,7);g.lineWidth=3;g.strokeStyle='#d8dee8';g.stroke()},
  eco:g=>{medal(g,'#8ab060','#2a4a14');fillP(g,[[24,40],[40,24],[56,40]],'#b0402a');fillP(g,[[28,40],[52,40],[52,58],[28,58]],'#e8d8b0');fillP(g,[[36,46],[44,46],[44,58],[36,58]],'#6a3e1a')},
  mil:g=>{medal(g,'#b05a48','#3a0e08');sword(g,52,58,.5,38);const r=g.createLinearGradient(20,24,50,60);r.addColorStop(0,'#5a8ae0');r.addColorStop(1,'#1a3a8a');
    fillP(g,[[22,24],[44,24],[44,42],[33,58],[22,42]],r);fillP(g,[[30,30],[36,30],[36,44],[30,44]],'#e2bd62')},
  milorg:g=>{medal(g,'#c09040','#4a2a08');stroke2(g,()=>{g.beginPath();g.moveTo(26,16);g.lineTo(26,64)},3,'#8a5a2a');
    fillP(g,[[27,18],[58,18],[52,30],[58,42],[27,42]],'#b0302a');for(let i=0;i<2;i++){path(g,[[33,24+i*8],[40,30+i*8],[47,24+i*8]]);g.strokeStyle='#ffd870';g.lineWidth=2.5;g.stroke()}},
  army:g=>{medal(g,'#c85a40','#4a1008');sword(g,30,58,-.75,40);sword(g,50,58,.75,40)},
  idle:g=>{medal(g,'#a08a60','#3a2a10');g.font='bold 30px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff1c0';g.strokeStyle='#1a0e04';g.lineWidth=4;g.strokeText('Zz',40,42);g.fillText('Zz',40,42)},
};
function cmdIcon(k,extra){const key='c'+k+(extra||'');if(!ICO[key]){const[c,g]=icoC();CMD_ART[k](g);if(extra)numeral(g,extra);ICO[key]=c.toDataURL()}return ICO[key]}
// pesquisas: medalhão com a cor do assunto e o símbolo da pesquisa
const TCOL={mercado:['#8ab060','#2a4a14'],deposito:['#b07a58','#3a1a0a'],celeiro:['#a0a080','#3a3a1a'],doca:['#5a9ac8','#10284a'],templo:['#a07ac8','#2a1448'],quartel:['#c85a40','#4a1008'],academia:['#c85a40','#4a1008'],oficina:['#a08060','#3a2410']};
function techIcon(id){const key='t'+id;if(!ICO[key]){const T=TECH[id],[c,g]=icoC(),cc=TCOL[T.at]||['#a08a60','#3a2a10'];medal(g,cc[0],cc[1]);
  g.font='34px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor='#000a';g.shadowBlur=4;g.fillText(T.ic,40,42);ICO[key]=c.toDataURL()}return ICO[key]}

// ---------- textos da ficha ----------
const ROLE={vill:'Coleta comida, madeira e metal; constrói e conserta prédios.',inf:'Infantaria de corpo a corpo. Boa para defender e para derrubar prédios.',arq:'Ataca de longe. Fraco de perto: proteja com infantaria.',
  cav:'Rápido e forte. Ótimo contra arqueiros e para invadir.',arqcav:'Arqueiro a cavalo: rápido e atira de longe.',elef:'Muito forte e resistente; o golpe acerta vários de uma vez.',
  cerco:'Derruba prédios e muralhas de longe. Lento e fraco de perto.',sac:'Cura os seus e converte inimigos para o seu lado.',
  pesc:'Barco que pesca no mar e leva o peixe para a Doca.',trans:'Carrega tropas pela água.',bguer:'Barco de guerra.',trir:'Barco de guerra forte (trirreme).'};
const BDESC={tc:'Coração da cidade: treina aldeões, avança de era, aumenta a população e amplia a sua fronteira. Atira flechas.',casa:'Mais espaço para a população.',
  celeiro:'Recebe comida. Pesquisas de torre e muralha.',deposito:'Recebe madeira e metal. Pesquisas de armas e armaduras.',doca:'Barcos de pesca, transporte e guerra.',
  mercado:'Pesquisas que melhoram a coleta. Libera a Fazenda.',fazenda:'Comida sem fim: um aldeão cultiva. Quando acaba, replanta.',maravilha:'Se ficar de pé por 5 minutos, você vence!',
  quartel:'Treina infantaria.',arquearia:'Treina arqueiros.',estabulo:'Treina cavalaria, carros e elefantes.',academia:'Treina hoplitas.',templo:'Treina sacerdotes; pesquisas de fé.',
  oficina:'Treina máquinas de cerco.',torre:'Atira flechas nos inimigos que chegam perto.',muralha:'Bloqueia a passagem do inimigo. Arraste do começo ao fim.'};
const costHTML=c=>Object.entries(c||{}).filter(([,v])=>v).map(([k,v])=>'<span class="cc'+(G.P[0].res[k]<v?' no':'')+'">'+rimg(k)+' '+v+'</span>').join('')||'<span class="cc">grátis</span>';
function cardInfo(c){
  // devolve {ico,t,sub,txt,cost,time,ok,btn}
  const P=G.P[0];
  if(c.kind==='b'){const T=BT[c.key];const tr=(T.train||[]).map(t=>STAT[0][t].n);
    return{t:T.n,sub:'Prédio · '+AGES[T.age]+(T.req?' · precisa de '+BT[T.req].n:''),txt:(BDESC[c.key]||'')+(tr.length?'<br><b>Treina:</b> '+tr.join(', '):''),stats:'❤️ '+T.hp+' · tamanho '+T.sz+'×'+T.sz,time:T.t,btn:'🔨 Construir'}}
  if(c.kind==='u'){const T=STAT[0][c.key],U=UT[c.key];
    return{t:T.n,sub:'Unidade · '+AGES[U.age],txt:ROLE[c.key]||ROLE[U.cls]||'',stats:'❤️ '+T.hp+(T.atk?' · ⚔️ '+T.atk:'')+(T.arm?' · 🛡️ '+T.arm:'')+(T.rng?' · 🎯 '+T.rng:'')+' · 👟 '+(+T.spd.toFixed(1)),time:T.t,btn:'✔ Treinar',multi:1}}
  if(c.kind==='t'){const T=TECH[c.key];return{t:T.n,sub:'Pesquisa · '+AGES[T.age]+(T.req?' · precisa de '+TECH[T.req].n:''),txt:T.d,time:T.t,btn:'📜 Pesquisar'}}
  if(c.kind==='age'){const a=P.age+1,nu=Object.keys(UT).filter(t=>UT[t].age===a&&UT[t].cls!=='animal').map(t=>STAT[0][t].n),nb=Object.keys(BT).filter(t=>BT[t].age===a).map(t=>BT[t].n);
    return{t:'Avançar para a '+AGES[a]+' ('+ROMAN[a+1]+')',sub:'Você está na '+AGES[P.age]+' ('+ROMAN[P.age+1]+')',txt:'Pesquisado na Biblioteca (como no Rise).'+(nb.length?'<br><b>Libera prédios:</b> '+nb.join(', '):'')+(nu.length?'<br><b>Libera tropas:</b> '+nu.join(', '):''),time:AGETIME[a],btn:'🎺 Avançar de era'}}
  if(c.kind==='mil'){const ml=P.mil||0;return{t:'Organização Militar '+ROMAN[ml+1],sub:'Linha Militar da Biblioteca · nível '+(ml+1)+' de '+MIL_N,txt:'Diminui o atrito das tropas em terra inimiga (−12% por nível). Aumenta a população máxima em +'+POP_STEP+' (agora '+P.cap+', máximo '+POP_MIL+' sem Maravilha).',time:MILTIME[ml],btn:'🎖️ Pesquisar'}}
  return{t:c.nm,sub:'',txt:c.d||'',btn:'✔ Fazer'}
}
// ---------- liga ícones e tipo de cada comando ----------
const getCmds1=getCmds;
getCmds=function(){const out=getCmds1();const s=selEnts()[0];
  for(const c of out){
    if(c.ic==='⬆️'){c.kind='age';c.img=eraUpIcon(G.P[0].age+1)}
    else if(c.ic==='🎖️'){c.kind='mil';c.img=cmdIcon('milorg',ROMAN[(G.P[0].mil||0)+1])}
    else if(c.ic==='✋'){c.img=cmdIcon('stop')}
    else if(c.ic==='⚔️'&&c.act&&c.nm.startsWith('Atacar')){c.img=cmdIcon('atk')}
    else if(c.ic==='⚔️'){c.img=cmdIcon('mil')}
    else if(c.ic==='🏠'){c.img=cmdIcon('eco')}
    else if(c.ic==='🔭'){c.img=cmdIcon('scout')}
    else if(c.ic==='↩️'){c.img=cmdIcon('back')}
    else if(c.ic==='⚓'){c.img=cmdIcon('anchor')}
    else if(c.tech){const id=Object.keys(TECH).find(k=>TECH[k].n===c.nm);if(id){c.kind='t';c.key=id;c.img=techIcon(id)}}
    else if(c.img&&s&&s.k==='u'){const t=Object.keys(BT).find(k=>BT[k].n===c.nm);if(t){c.kind='b';c.key=t}}
    else if(c.img&&s&&s.k==='b'){const t=Object.keys(UT).find(k=>STAT[0][k]&&STAT[0][k].n===c.nm);if(t){c.kind='u';c.key=t}}
  }
  return out};
// ---------- ficha ----------
UI.card=null;
function cardOpen(i){const cs=getCmds(),c=cs[i];if(!c)return;UI.card={i,nm:c.nm,sel:SEL.join(',')};cardDraw();snd('click')}
function cardClose(){UI.card=null;$('card').style.display='none';document.querySelectorAll('#cmds .cb.pick').forEach(b=>b.classList.remove('pick'))}
function cardCmd(){if(!UI.card)return null;const c=getCmds()[UI.card.i];if(!c||c.nm!==UI.card.nm||SEL.join(',')!==UI.card.sel)return null;return c}
function cardDraw(){const c=cardCmd();if(!c){cardClose();return}const f=cardInfo(c),el=$('card');
  const h='<div class="ch"><img src="'+(c.img||'')+'"><div><b>'+f.t+'</b><small>'+f.sub+'</small></div><button class="pbn" id="cdx">✕</button></div>'+
    '<div class="cd">'+f.txt+(f.stats?'<div class="cs">'+f.stats+'</div>':'')+'</div>'+
    '<div class="cf">'+(c.cost?costHTML(c.cost):'')+(f.time?'<span class="cc">⏱ '+f.time+'s</span>':'')+'</div>'+
    (c.dis?'<div class="cw">🔒 '+c.dis+'</div>':'')+
    '<div class="cbt"><button class="mb go'+(c.dis?' off':'')+'" id="cdo">'+f.btn+'</button>'+(f.multi?'<button class="mb go'+(c.dis?' off':'')+'" id="cdo5">×5</button>':'')+'</div>';
  if(h!==el._h){el._h=h;el.innerHTML=h;
    $('cdx').onclick=()=>{snd('click');cardClose()};
    $('cdo').onclick=()=>cardDo(1);if($('cdo5'))$('cdo5').onclick=()=>cardDo(5)}
  el.style.display='block';
  document.querySelectorAll('#cmds .cb').forEach((b,j)=>b.classList.toggle('pick',j===UI.card.i));
  // em cima do painel de comandos
  const r=$('pCmd').getBoundingClientRect(),w=el.offsetWidth,hh=el.offsetHeight;
  let x=clamp(r.left+r.width/2-w/2,4,innerWidth-w-4),y=r.top-hh-(($('pCmd').classList.contains('tab')&&!$('pCmd').classList.contains('min'))?28:6);
  if(y<TOPH+4)y=TOPH+4;[x,y]=noOverlapXY(el,x,y);el.style.left=x+'px';el.style.top=y+'px'}
function cardDo(n){const c=cardCmd();if(!c){cardClose();return}
  if(c.dis){toast(c.dis);snd('click');return}
  runCmd(c,n);
  if(c.kind==='u'&&!placing){toast('✔ '+(n>1?n+'× ':'')+c.nm+' na fila');cardDraw()}else cardClose()}
// toque nos botões: com custo → ficha primeiro; sem custo (parar, atacar...) → faz na hora
function cmdTap(i){const c=getCmds()[i];if(!c)return;
  if(!c.cost&&!c.kind){runCmd(c);toast(c.nm);cardClose();return}
  if(UI.card&&UI.card.i===i&&cardCmd())cardDo(1);else cardOpen(i)}
const updHUD1=updHUD;
updHUD=function(force){if(G&&UI.milS!==G.P[0].mil){UI.milS=G.P[0].mil;UI.sig=''}updHUD1(force);if(!G)return;
  const box=$('cmds');[...box.children].forEach((b,i)=>{if(b._v10)return;b._v10=1;b.onclick=()=>cmdTap(i)});
  if(UI.card)cardDraw();
  if(typeof seasonIdx==='function'){const S=SEASONS[seasonIdx()],W=G.wx||{i:0};const cl=document.body.classList.contains('clean'),wi=W.i>.2?(W.k==='snow'?'❄️':W.k==='storm'?'⛈':'🌧'):'';const t=cl?S.ic+dayIcon()+wi:S.ic+' '+S.n+' · '+dayIcon()+' '+hourTxt()+(wi?' · '+wi+({snow:' neve',storm:' tempestade',rain:' chuva'}[W.k]||''):'');if($('wx').textContent!==t)$('wx').textContent=t}
  const P=G.P[0];if(UI.eraShown!==P.age){UI.eraShown=P.age;$('eran').innerHTML='<img src="'+eraIcon(P.age)+'">'}};
// botões rápidos com ícones desenhados
function quickIcons(){$('qidle').innerHTML='<img src="'+cmdIcon('idle')+'"><i id="nidle"></i>';$('qarmy').innerHTML='<img src="'+cmdIcon('army')+'"><i id="narmy"></i>';if(THUMB.btc)$('qtc').innerHTML='<img src="'+THUMB.btc+'">'}
const startGame1=startGame;
startGame=function(){cardClose();UI.eraShown=-1;startGame1();quickIcons()};
window.__RA.startGame=startGame;

// tocar no tempo/estação mostra o que ela muda no jogo
$('wx').onclick=()=>{if(G){snd('click');toast(seasonInfo())}};
