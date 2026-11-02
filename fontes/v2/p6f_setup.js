
// =========================================================
//   PARTIDA SOLO (como os menus de escaramuça do Rise e do Age)
//   Povo · Partida (mapa, inimigo, recursos, era inicial, vitória, velocidade) · Ambiente (hora, estação, clima)
//   Hora, estação e clima ficam FIXOS a partida inteira (sem ciclo de dia/noite e sem chuva aleatória).
// =========================================================
const SOPT={
  partida:[
    {k:'diff',n:'Inimigo',v:[['facil','🙂 Fácil'],['normal','😐 Normal'],['dificil','😠 Difícil']]},
    {k:'res',n:'Recursos iniciais',v:[['pouco','Pouco'],['normal','Normal'],['muito','Muito']]},
    {k:'era',n:'Era inicial',v:[['0','🏺 Antiga'],['1','🏛 Clássica'],['2','🏰 Medieval'],['3','💥 Pólvora']]},
    {k:'vic',n:'Vitória',v:[['padrao','🏆 Padrão','conquista, território ou Maravilha'],['conq','⚔ Conquista','só derrotando o inimigo']]},
    {k:'vel',n:'Velocidade',v:[['1','1x'],['1.5','1,5x'],['2','2x']]}],
  amb:[
    {k:'hora',n:'Hora do dia',v:[['aman','🌅 Amanhecer'],['dia','☀️ Dia'],['tarde','🌇 Entardecer'],['noite','🌙 Noite'],['rand','🎲']]},
    {k:'est',n:'Estação',v:[['0','🌸 Primavera'],['1','☀️ Verão'],['2','🍂 Outono'],['3','❄️ Inverno'],['rand','🎲']]},
    {k:'clima',n:'Clima',v:[['clear','🌤 Limpo'],['rain','🌧 Chuva'],['storm','⛈ Tempestade'],['snow','🌨 Neve'],['rand','🎲']]}]};
const SDEF={size:'med',map:'mar',diff:'normal',res:'normal',era:'0',vic:'padrao',vel:'1',hora:'dia',est:'0',clima:'clear'};
SETUP=Object.assign({civ:'gregos'},SDEF,OPT.setup||{},{civ:OPT.civ||'gregos',map:OPT.map||'mar',diff:OPT.diff||'normal'});
const SRES={pouco:{food:100,wood:100,gold:50,wealth:20,know:0},normal:null,muito:{food:600,wood:600,gold:300,wealth:200,know:100}};
const optLbl=(k,v)=>{if(k==='map')return v==='rand'?'🎲 Aleatório':(MAPS[v]?MAPS[v].ic+' '+MAPS[v].n:v);if(k==='size')return MAPSZ[v]?MAPSZ[v].n+' ('+MAPSZ[v].s+'×'+MAPSZ[v].s+')':v;for(const g of[...SOPT.partida,...SOPT.amb])if(g.k===k){const c=g.v.find(x=>x[0]===v);return c?c[1]+(v==='rand'?' Aleatório':''):v}return v};
function buildOpts(box,list){box.innerHTML='';for(const g of list){const d=document.createElement('div');
    d.innerHTML='<div class="sht">'+g.n+'</div><div class="seg">'+g.v.map(c=>'<button class="mb" data-ok="'+g.k+'" data-ov="'+c[0]+'">'+c[1]+(c[2]?'<small>'+c[2]+'</small>':'')+'</button>').join('')+'</div>';box.appendChild(d)}}
buildSetup=function(){
  const g=$('civg');g.innerHTML='';
  for(const c of CIVS){const b=document.createElement('button');b.className='mb';b.dataset.civ=c.id;b.innerHTML='<i style="background:'+STY[c.st].sw+'"></i><span>'+c.n+'<small>arquitetura '+STY[c.st].nm.toLowerCase()+'</small></span>';b.onclick=()=>{SETUP.civ=c.id;updSetup();snd('click')};g.appendChild(b)}
  buildOpts($('optP'),SOPT.partida);buildOpts($('optA'),SOPT.amb);
  $('szg').innerHTML=Object.entries(MAPSZ).map(([k,z])=>'<button class="mb" data-ok="size" data-ov="'+k+'">'+z.n+'<small>'+z.s+'×'+z.s+' · até '+z.pl+' jogadores</small></button>').join('');
  $('mapgrid').innerHTML=MAP_ORD.map(k=>{const m=MAPS[k];return'<button class="mb" data-ok="map" data-ov="'+k+'"><b>'+m.ic+'</b><span>'+m.n+'<small><em>'+m.src+'</em>'+'★'.repeat(m.dif)+'</small></span></button>'}).join('')+'<button class="mb" data-ok="map" data-ov="rand"><b>🎲</b><span>Aleatório<small>surpresa</small></span></button>';
  document.querySelectorAll('#setup [data-ok]').forEach(b=>b.onclick=()=>{const k=b.dataset.ok,v=b.dataset.ov;SETUP[k]=v;
    // neve só no inverno; estação que não é inverno tira a neve
    if(k==='clima'&&v==='snow')SETUP.est='3';if(k==='est'&&v!=='3'&&v!=='rand'&&SETUP.clima==='snow')SETUP.clima='clear';
    updSetup();snd('click')});
  document.querySelectorAll('#setup [data-tab]').forEach(b=>b.onclick=()=>{setTab(b.dataset.tab);snd('click')});
  setTab('povo');updSetup();ARTP.then(updSetup)};
function setTab(t){document.querySelectorAll('#setup [data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));document.querySelectorAll('#setup [data-tc]').forEach(c=>c.classList.toggle('on',c.dataset.tc===t))}
const updSetup0=updSetup;
updSetup=function(){updSetup0();
  document.querySelectorAll('#setup [data-ok]').forEach(b=>b.classList.toggle('on',String(SETUP[b.dataset.ok])===b.dataset.ov));
  const m=MAPS[SETUP.map];$('mapd').innerHTML=SETUP.map==='rand'?'🎲 Um dos 15 mapas, sorteado na hora.':m?'<b>'+m.ic+' '+m.n+'</b> ('+m.src+', dificuldade '+'★'.repeat(m.dif)+'): '+m.d:'';
  const sum=[['📐','size'],['🗺','map'],['😐','diff'],['💰','res'],['📜','era'],['🏆','vic'],['⏩','vel'],['🕐','hora'],['🍃','est'],['🌤','clima']];
  $('sumr').innerHTML=sum.map(([ic,k])=>'<div><b>'+{size:'Tamanho',map:'Mapa',diff:'Inimigo',res:'Recursos',era:'Era',vic:'Vitória',vel:'Velocidade',hora:'Hora',est:'Estação',clima:'Clima'}[k]+':</b> '+optLbl(k,String(SETUP[k]))+'</div>').join('');
  const S=SEASONS[SETUP.est==='rand'?0:+SETUP.est],tip=[];
  if(SETUP.est!=='rand')tip.push(S.ic+' '+S.n+': '+SEFX[+SETUP.est]);
  if(SETUP.clima!=='clear'&&SETUP.clima!=='rand')tip.push(WXFX[SETUP.clima]);
  if(SETUP.hora==='noite')tip.push('🌙 Noite: tropas enxergam 30% menos');
  $('ambtip').innerHTML=tip.length?'Na partida: '+tip.join(' · '):'Ambiente sem efeito especial nas regras.'};
// aplica as escolhas na partida nova
function rollCfg(){const pick=(k,list)=>SETUP[k]==='rand'?list[(Math.random()*list.length)|0]:SETUP[k];
  const est=+pick('est',['0','1','2','3']);let clima=pick('clima',est===3?['clear','snow','snow','storm']:['clear','clear','rain','storm']);
  if(clima==='snow'&&est!==3)clima='clear';
  return{hora:pick('hora',['aman','dia','dia','tarde','noite']),est,clima,vic:SETUP.vic,era:+SETUP.era,res:SETUP.res}}
const newGame3=newGame;
newGame=function(o){newGame3(o);G.cfg=o.cfg||rollCfg();
  const R=SRES[G.cfg.res];for(const P of G.P){if(R)Object.assign(P.res,R);P.age=Math.max(P.age,G.cfg.era|0)}};
window.__RA.newGame=newGame;
const loadGame2=loadGame;
loadGame=function(){const ok=loadGame2();if(ok&&!G.cfg)G.cfg={hora:'dia',est:0,clima:'clear',vic:'padrao',era:0,res:'normal'};return ok};
$('bstart').onclick=()=>{OPT.civ=SETUP.civ;OPT.map=SETUP.map;OPT.diff=SETUP.diff;OPT.setup=Object.assign({},SETUP);OPT.spd=+SETUP.vel||1;saveOpt();updOptBtns();
  loading(()=>{newGame(SETUP);startGame();const c=G.cfg,S=SEASONS[c.est];
    toast(S.ic+' '+S.n+' · '+{aman:'🌅 amanhecer',dia:'☀️ dia',tarde:'🌇 entardecer',noite:'🌙 noite'}[c.hora]+(c.clima!=='clear'?' · '+{rain:'🌧 chuva',storm:'⛈ tempestade',snow:'🌨 neve'}[c.clima]:'')+'<br>Dica: selecione os aldeões e mande coletar!')})};
// o ícone do tempo no topo: estação + hora + clima (fixos)
