// =========================================================
//   CONQUISTAR O MUNDO — campanha por territórios (mapa e nomes inventados, nada copiado)
//   Cada turno você ataca um território vizinho: a batalha é uma partida normal num mapa pequeno.
//   Vencer dá o território; tomar a capital de um rival dá tudo o que era dele. Depois os rivais jogam.
// =========================================================
const CWK='imperio_cw1';
const CW_T=[
 {n:'Costa Dourada',x:11,y:41,m:'litoral'},{n:'Vale do Sol',x:27,y:30,m:'terra'},{n:'Serra Cinzenta',x:25,y:11,m:'cordilheira'},
 {n:'Mata Velha',x:41,y:18,m:'floresta'},{n:'Planície Central',x:43,y:35,m:'estepe'},{n:'Delta Largo',x:57,y:47,m:'delta'},
 {n:'Lagos Altos',x:56,y:25,m:'lagos'},{n:'Deserto Rubro',x:71,y:38,m:'arabia'},{n:'Oásis Perdido',x:84,y:48,m:'oasis'},
 {n:'Passo do Vento',x:70,y:13,m:'cordilheira'},{n:'Minas do Norte',x:87,y:9,m:'ouro'},{n:'Selva Funda',x:30,y:49,m:'amazonia'},
 {n:'Três Rios',x:89,y:28,m:'rios'},{n:'Campo dos Reis',x:12,y:21,m:'terra'}];
const CW_E=[[0,1],[0,11],[0,13],[1,13],[1,2],[1,3],[1,4],[2,13],[2,3],[3,6],[3,4],[4,11],[4,5],[4,6],[5,11],[5,7],[6,7],[6,9],[7,8],[7,12],[7,9],[8,12],[9,10],[9,12],[10,12]];
const CW_CAP=[0,10,8,2];// capital do jogador e dos 3 rivais
const CW_BONUS=30,CW_BONUS_MAX=300;
let CW=null,cwSel=-1,cwReturn=false;
function cwNb(t){const o=[];for(const[a,b]of CW_E){if(a===t)o.push(b);else if(b===t)o.push(a)}return o}
function cwLoad(){try{const s=JSON.parse(localStorage.getItem(CWK));CW=s&&s.v===1&&s.own&&s.own.length===CW_T.length?s:null}catch(e){CW=null}return CW}
function cwSave(){try{if(CW)localStorage.setItem(CWK,JSON.stringify(CW));else localStorage.removeItem(CWK)}catch(e){}}
function cwNew(civ,diff){const pool=CIVS.map(c=>c.id).filter(c=>c!==civ);const riv=[];for(let i=0;i<3;i++)riv.push(pool.splice((Math.random()*pool.length)|0,1)[0]);
  CW={v:1,civ,diff,turn:1,civs:[civ,...riv],own:CW_T.map(()=>-1),alive:[1,1,1,1],log:['A campanha começou. Tome as capitais (★) dos três rivais.'],won:0,lost:0,done:0};
  CW_CAP.forEach((t,o)=>CW.own[t]=o);cwSave()}
function cwCount(o){return CW.own.filter(x=>x===o).length}
function cwCanAttack(t){return CW&&!CW.done&&CW.own[t]!==0&&cwNb(t).some(n=>CW.own[n]===0)}
function cwCivN(o){return o<0?'Tribos livres':(CIVS.find(c=>c.id===CW.civs[o])||{n:'?'}).n}
// ---------- batalha ----------
function cwAttack(t){if(!cwCanAttack(t))return;const o=CW.own[t],T=CW_T[t],cap=o>0&&CW_CAP[o]===t;
  const cfg={civ:CW.civ,map:T.m,size:'peq',diff:o<0?'facil':CW.diff,ai:o<0?'rand':CW.civs[o],fim:String(MAXAGE),cfg:{hora:'dia',est:(CW.turn-1)%4,clima:'clear',vic:'conq',era:0,res:'normal'}};
  loading(()=>{newGame(cfg);G.cw={t,o,cap};const b=Math.min(CW_BONUS_MAX,CW_BONUS*(cwCount(0)-1));if(b>0){const r=G.P[0].res;r.food+=b;r.wood+=b;r.gold+=b}
    startGame();toast('🌍 Batalha por '+T.n+(b>0?' · bônus dos seus territórios: +'+b+' de cada recurso':''));musicStart()})}
// depois da batalha: aplica o resultado e deixa os rivais jogarem
function cwAfter(win,b){if(!cwLoad())return;const L=[];const T=CW_T[b.t];
  if(win){CW.won++;const o=CW.own[b.t];
    if(o>0&&CW_CAP[o]===b.t){CW.alive[o]=0;let n=0;CW.own=CW.own.map(x=>{if(x===o){n++;return 0}return x});L.push('👑 Você tomou '+T.n+', capital dos '+cwCivN(o)+'! Todas as '+n+' terras deles agora são suas.')}
    else{CW.own[b.t]=0;L.push('🏴 '+T.n+' agora é sua.')}}
  else{CW.lost++;L.push('💀 Seu exército foi derrotado em '+T.n+'.')}
  if(![1,2,3].some(o=>CW.alive[o])){CW.done=1;L.push('🌍 Não resta nenhum rival. O mundo é seu!')}
  else{for(let o=1;o<=3;o++){if(!CW.alive[o])continue;
      const fr=[];CW.own.forEach((x,t)=>{if(x===o)for(const n of cwNb(t))if(CW.own[n]!==o&&!fr.includes(n))fr.push(n)});if(!fr.length)continue;
      const free=fr.filter(t=>CW.own[t]<0);const t=free.length?free[(Math.random()*free.length)|0]:fr[(Math.random()*fr.length)|0];const d=CW.own[t];
      if(d<0){CW.own[t]=o;L.push('⚑ Os '+cwCivN(o)+' ocuparam '+CW_T[t].n+'.')}
      else if(CW_CAP[d]===t)continue;// capitais só caem em batalha de verdade
      else if(d===0){if(Math.random()<.2){CW.own[t]=o;L.push('⚠️ Os '+cwCivN(o)+' tomaram '+CW_T[t].n+' de você!')}else L.push('🛡 Você repeliu um ataque dos '+cwCivN(o)+' em '+CW_T[t].n+'.')}
      else if(Math.random()<.35){CW.own[t]=o;L.push('⚔ Os '+cwCivN(o)+' tomaram '+CW_T[t].n+' dos '+cwCivN(d)+'.')}}
    CW.turn++}
  CW.log=L;cwSave();cwReturn=true;$('bend').textContent='🌍 Voltar ao mapa do mundo'}
const endGameCW=endGame;
endGame=function(win,msg){const b=G&&G.cw;endGameCW(win,msg);if(b){try{cwAfter(win,b)}catch(e){console.warn('cw',e)}}};
{const old=$('bend').onclick;$('bend').onclick=()=>{if(cwReturn){cwReturn=false;$('bend').textContent='🏛 Voltar ao início';cwOpen()}else old()}}
// ---------- tela ----------
{const css=document.createElement('style');css.textContent=`
#cw{flex-direction:row;align-items:stretch;gap:8px;padding:8px;background:radial-gradient(ellipse at 40% 40%,#1d3a5c,#0a1626 75%);text-align:left}
#cw .cwm{flex:1.7;min-width:0;border:2px solid #c9a35a;border-radius:10px;background:linear-gradient(#2a5a86,#1b3f63);position:relative;overflow:hidden}
#cw svg{width:100%;height:100%;display:block}
#cw .cws{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;overflow:auto}
#cw .cwc{background:rgba(20,12,4,.6);border:1px solid rgba(232,196,106,.4);border-radius:8px;padding:7px 9px;font-size:12.5px;line-height:1.3;color:#f4e8c8}
#cw .cwc b{color:#f0c860}#cw .cwc small{opacity:.8}
#cw .mb{min-width:0;width:100%;height:auto;min-height:34px;padding:4px 8px;font-size:14px}
#cw .lg{font-size:11.5px;margin:2px 0}
#cw text{font:700 2.6px Georgia,serif;fill:#fff;paint-order:stroke;stroke:#0a1626;stroke-width:.7px;text-anchor:middle;pointer-events:none}`;document.head.appendChild(css);
 const d=document.createElement('div');d.id='cw';d.className='screen';d.innerHTML='<div class="cwm" id="cwmap"></div><div class="cws" id="cwside"></div>';$('menu').after(d)}
function cwCol(o){return o<0?'#9a8a66':COL[o].m}
function cwDraw(){const M=$('cwmap'),S=$('cwside');
  if(!CW){M.innerHTML='';const civ=SETUP.civ||'gregos',df=SETUP.diff||'normal';
    S.innerHTML='<div class="cwc"><b>🌍 Conquistar o Mundo</b><br>Um mapa de 14 territórios e três impérios rivais. A cada turno você ataca um território vizinho; a batalha é uma partida de verdade. Tome as três capitais para vencer.</div>'
      +'<div class="cwc">Seu povo: <b>'+(CIVS.find(c=>c.id===civ)||{n:civ}).n+'</b><br>Dificuldade: <b>'+optLbl('diff',df)+'</b><br><small>Para mudar, escolha o povo e o inimigo na Batalha Rápida antes de começar.</small></div>'
      +'<button class="mb go" id="cwgo">🌍 Começar campanha</button><button class="mb" id="cwback">↩ Voltar</button>';
    $('cwgo').onclick=()=>{snd('click');cwNew(civ,df);cwSel=-1;cwDraw()};$('cwback').onclick=()=>{snd('click');show('menu')};return}
  let h='<svg viewBox="0 0 100 58" preserveAspectRatio="xMidYMid meet">';
  for(const[a,b]of CW_E){const A=CW_T[a],B=CW_T[b];h+='<line x1="'+A.x+'" y1="'+A.y+'" x2="'+B.x+'" y2="'+B.y+'" stroke="#e8d7a8" stroke-opacity=".45" stroke-width=".5" stroke-dasharray="1.2 1"/>'}
  CW_T.forEach((T,t)=>{const o=CW.own[t],cap=o>=0&&CW_CAP[o]===t,can=cwCanAttack(t),sel=t===cwSel;
    h+='<g data-t="'+t+'" style="cursor:pointer"><circle cx="'+T.x+'" cy="'+T.y+'" r="7" fill="transparent"/>'
      +(can?'<circle cx="'+T.x+'" cy="'+T.y+'" r="5.6" fill="none" stroke="#ffe08a" stroke-width=".5" stroke-dasharray="1.4 1"/>':'')
      +'<circle cx="'+T.x+'" cy="'+T.y+'" r="4.3" fill="'+cwCol(o)+'" stroke="'+(sel?'#fff':'#1a1208')+'" stroke-width="'+(sel?1:.5)+'"/>'
      +(cap?'<text x="'+T.x+'" y="'+(T.y+1.3)+'" style="font-size:4px;stroke-width:.4px">★</text>':'')
      +'<text x="'+T.x+'" y="'+(T.y+7.6)+'">'+T.n+'</text></g>'});
  M.innerHTML=h+'</svg>';M.querySelectorAll('g[data-t]').forEach(g=>g.onclick=()=>{cwSel=+g.dataset.t;snd('click');cwDraw()});
  let s='<div class="cwc"><b>🌍 Turno '+CW.turn+'</b> · '+cwCivN(0)+'<br>';
  for(let o=0;o<4;o++)s+='<span style="display:inline-block;width:9px;height:9px;border:1px solid #000;background:'+COL[o].m+'"></span> '+(o?cwCivN(o):'Você')+': '+(CW.alive[o]?cwCount(o)+' terras':'☠ caiu')+'<br>';
  s+='</div>';
  if(CW.log&&CW.log.length)s+='<div class="cwc">'+CW.log.map(l=>'<div class="lg">'+l+'</div>').join('')+'</div>';
  if(CW.done)s+='<div class="cwc"><b>👑 VITÓRIA TOTAL</b><br>Em '+(CW.turn)+' turnos · '+CW.won+' batalhas vencidas · '+CW.lost+' perdidas.</div><button class="mb go" id="cwnew">🌍 Nova campanha</button>';
  else if(cwSel>=0){const T=CW_T[cwSel],o=CW.own[cwSel],cap=o>=0&&CW_CAP[o]===cwSel,can=cwCanAttack(cwSel);
    s+='<div class="cwc"><b>'+T.n+'</b>'+(cap?' ★ capital':'')+'<br>Dono: '+(o===0?'você':cwCivN(o))+'<br>Terreno: '+optLbl('map',T.m)+'<br><small>'+(o===0?'Território seu. Cada um dá +'+CW_BONUS+' de cada recurso no começo das batalhas.':can?(o<0?'Defendido por tribos locais (fácil).':cap?'Capital rival: vencer aqui derruba o império inteiro.':'Defendido pelos '+cwCivN(o)+'.'):'Longe demais: só dá para atacar vizinhos das suas terras.')+'</small></div>';
    if(can)s+='<button class="mb go" id="cwatk">⚔ Atacar '+T.n+'</button>'}
  else s+='<div class="cwc"><small>Toque num território. Os de contorno tracejado estão ao alcance.</small></div>';
  s+='<button class="mb" id="cwback">↩ Menu</button>'+(CW.done?'':'<button class="mb" id="cwquit" style="opacity:.75;font-size:12px;min-height:28px">🗑 Abandonar campanha</button>');
  S.innerHTML=s;
  if($('cwatk'))$('cwatk').onclick=()=>{snd('click');cwAttack(cwSel)};
  if($('cwnew'))$('cwnew').onclick=()=>{CW=null;cwSave();cwDraw()};
  $('cwback').onclick=()=>{snd('click');$('bcont').style.display=hasSave()?'flex':'none';show('menu')};
  if($('cwquit')){let arm=false;$('cwquit').onclick=()=>{if(!arm){arm=true;$('cwquit').textContent='Toque de novo para apagar a campanha';return}CW=null;cwSave();cwSel=-1;cwDraw()}}}
function cwOpen(){cwLoad();show('cw');cwDraw()}
window.__RA.cw={open:cwOpen,get:()=>CW,after:cwAfter,attack:cwAttack};
