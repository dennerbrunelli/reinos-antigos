
// =========================================================
//   MENU E BATALHA RÁPIDA (organização como no Rise of Nations, visual próprio)
//   Menu: Batalha Rápida · Conquistar o Mundo · Multijogador · Aprender a jogar · Opções
//   Batalha Rápida: jogadores à esquerda, regras à direita (com Era inicial e Era final)
// =========================================================
function ENDAGE(){return G&&G.cfg&&G.cfg.endAge!=null?G.cfg.endAge:MAXAGE}
// ---------- menu principal ----------
{const bn=$('bnew');bn.innerHTML='<b>⚔</b><span>Batalha Rápida<small>Você contra o computador: escolha os povos, o mapa e as regras</small></span>';
  const cw=document.createElement('button');cw.className='mb mi lock';cw.id='bcw';cw.innerHTML='<b>🌍</b><span>Conquistar o Mundo <em class="tag">EM BREVE</em><small>Campanha no mapa do mundo, território por território</small></span>';
  cw.onclick=()=>{toast('🌍 Conquistar o Mundo chega numa atualização futura');snd('click')};bn.after(cw);
  const h=$('bhelp');h.innerHTML='<b>📜</b><span>Aprender a jogar<small>Regras, toque e controle Xbox</small></span>';
  // opções reunidas num botão (música e atualizar continuam lá dentro)
  const op=document.createElement('button');op.className='mb mi';op.id='bopts';op.innerHTML='<b>⚙️</b><span>Opções<small>Música e atualização do jogo</small></span>';
  const mus=$('bmus'),upd=$('bupd');mus.style.display='none';upd.style.display='none';let open=false;
  op.onclick=()=>{open=!open;mus.style.display=upd.style.display=open?'':'none';snd('click')};h.after(op);op.after(mus);mus.after(upd)}
// ---------- Batalha Rápida ----------
SDEF.fim='7';if(SETUP.fim==null)SETUP.fim='7';if(SETUP.ai==null)SETUP.ai='rand';
const ERAS_OPT=AGES.map((n,i)=>[String(i),ROMAN[i+1]+' · '+n.replace(/^Era (da |do |)/,'')]);
{const css=document.createElement('style');css.textContent=`
#setup .tabs{display:none}
#qb{display:grid;grid-template-columns:1fr 1.15fr;gap:8px;flex:1;min-height:0;overflow:auto;touch-action:pan-y}
#qb .qh{font:700 12px Georgia,serif;letter-spacing:2px;color:#f0c860;border-bottom:1px solid rgba(232,196,106,.5);padding:2px 2px 3px;margin-bottom:3px}
#qb .qp{display:flex;align-items:center;gap:6px;padding:4px 5px;margin-bottom:4px;border-radius:7px;background:rgba(20,12,4,.55);border:1px solid rgba(232,196,106,.35)}
#qb .qp i{width:9px;align-self:stretch;border-radius:3px;flex:none}
#qb .qp .qn{flex:1;min-width:0;font-size:12.5px;line-height:1.1}#qb .qp .qn small{display:block;font-size:9.5px;opacity:.75;font-style:italic}
#qb .qp.off{opacity:.42}
#qb .qr{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:3px 2px;border-bottom:1px dashed rgba(232,196,106,.22)}
#qb .qr span{font-size:12px;opacity:.9}
#qb .qv{min-width:0;height:auto;min-height:28px;padding:2px 9px;font-size:12px;border-radius:6px;white-space:nowrap;max-width:62%;overflow:hidden;text-overflow:ellipsis}
#setup .qback{height:auto;min-height:28px;padding:2px 10px;font-size:12px;margin-bottom:4px;align-self:flex-start}`;document.head.appendChild(css)}
{const spl=document.querySelector('#setup .spl');const tc=document.createElement('div');tc.className='tabc';tc.dataset.tc='qb';tc.innerHTML='<div id="qb"></div>';
  spl.querySelector('.tabs').after(tc);document.querySelector('#setup .shh b').textContent='⚔ Batalha Rápida';document.querySelector('#setup .shh small').textContent='Jogadores à esquerda, regras à direita · toque para mudar · tudo fica salvo';
  // nas sub-telas (povo, mapa, partida, ambiente) um botão volta para a Batalha Rápida
  for(const t of['povo','mapa','partida','amb']){const c=spl.querySelector('[data-tc="'+t+'"]');const b=document.createElement('button');b.className='mb qback';b.textContent='↩ Batalha Rápida';b.onclick=()=>{setTab('qb');snd('click')};c.prepend(b)}}
const cyc=(k,vals)=>{const i=vals.indexOf(String(SETUP[k]));SETUP[k]=vals[(i+1)%vals.length];
  if(k==='era'&&+SETUP.fim<+SETUP.era)SETUP.fim=SETUP.era;if(k==='fim'&&+SETUP.fim<+SETUP.era)SETUP.era=SETUP.fim;updSetup();snd('click')};
// vagas 3 a 8: '' fechada, 'rand' ou o id do povo. Só valem as que cabem no tamanho do mapa.
function qbSlots(){if(!Array.isArray(SETUP.slots)||SETUP.slots.length!==6)SETUP.slots=['','','','','',''];return SETUP.slots}
function qbMaxPl(){return Math.min(MAX_PLAYERS,(MAPSZ[SETUP.size]||MAPSZ.med).pl||2)}
// monta np e a lista de povos das IAs a partir das vagas abertas
function setupPlayers(){const sl=qbSlots(),mx=qbMaxPl(),ais=[SETUP.ai||'rand'];for(let i=0;i<6;i++)if(sl[i]&&ais.length+1<mx)ais.push(sl[i]);SETUP.ais=ais;SETUP.np=ais.length+1}
function qbRender(){const q=$('qb');if(!q)return;const civN=id=>id==='rand'?'🎲 Aleatório':(CIVS.find(c=>c.id===id)||{n:id}).n;
  const P=(col,nm,sub,btns,off)=>'<div class="qp'+(off?' off':'')+'"><i style="background:'+col+'"></i><div class="qn">'+nm+'<small>'+sub+'</small></div>'+btns+'</div>';
  const sz=Object.keys(MAPSZ),ops=k=>(SOPT.partida.find(g=>g.k===k)||{v:[]}).v.map(v=>v[0]);
  const R=(lab,k,val,act)=>'<div class="qr"><span>'+lab+'</span><button class="mb qv" data-q="'+act+'" data-k="'+k+'">'+val+'</button></div>';
  let h='<div><div class="qh">JOGADORES</div>'+P('#3a6fd8','Você','Time 1','<button class="mb qv" data-q="tab" data-k="povo">'+civN(SETUP.civ)+'</button>')+
    P('#d23a2a','Computador','Time 2 · '+optLbl('diff',SETUP.diff),'<button class="mb qv" data-q="ai">'+civN(SETUP.ai)+'</button><button class="mb qv" data-q="cyc" data-k="diff">'+optLbl('diff',SETUP.diff).replace(/^\S+ /,'')+'</button>');
  {const sl=qbSlots(),mx=qbMaxPl(),tm=SETUP.times||'ffa';let pi=1;const team=p=>tm==='vs'?(p?2:1):tm==='t2'?(p%2?2:1):p+1;
    h=h.replace('Time 2 · ','Time '+team(1)+' · ');
    for(let i=0;i<6;i++){const n=i+3,c=COL[n-1].m;
      if(n>mx){h+=P(c,'Vaga '+n,'Mapa '+(MAPSZ[SETUP.size]||MAPSZ.med).n+' não comporta · aumente o tamanho','',1);continue}
      if(!sl[i]){h+=P(c,'Vaga '+n,'Fechada','<button class="mb qv" data-q="slot" data-k="'+i+'">＋ Abrir</button>',1);continue}
      pi++;h+=P(c,'Computador '+pi,'Time '+team(pi),'<button class="mb qv" data-q="slotc" data-k="'+i+'">'+civN(sl[i])+'</button><button class="mb qv" data-q="slotx" data-k="'+i+'">✕</button>')}}
  h+='</div><div><div class="qh">REGRAS DA PARTIDA</div>'+
    R('🗺 Mapa','mapa',optLbl('map',SETUP.map),'tab')+R('📐 Tamanho','size',optLbl('size',SETUP.size),'cyc')+R('💰 Recursos','res',optLbl('res',SETUP.res),'cyc')+
    R('📜 Era inicial','era',(ERAS_OPT.find(e=>e[0]===String(SETUP.era))||ERAS_OPT[0])[1],'cyc')+R('🏁 Era final','fim',(ERAS_OPT.find(e=>e[0]===String(SETUP.fim))||ERAS_OPT[7])[1],'cyc')+
    R('🤝 Alianças','times',optLbl('times',SETUP.times||'ffa'),'cyc')+R('🏆 Vitória','vic',optLbl('vic',SETUP.vic),'cyc')+R('⏩ Velocidade','vel',optLbl('vel',SETUP.vel),'cyc')+R('🌤 Ambiente','amb',optLbl('est',String(SETUP.est))+' · '+optLbl('hora',SETUP.hora).replace(/^\S+ /,''),'tab')+'</div>';
  q.innerHTML=h;
  q.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const a=b.dataset.q,k=b.dataset.k;
    if(a==='tab'){setTab(k);snd('click');return}
    if(a==='slot'){qbSlots()[+k]='rand';updSetup();snd('click');return}
    if(a==='slotx'){qbSlots()[+k]='';updSetup();snd('click');return}
    if(a==='slotc'){const ids=['rand',...CIVS.map(c=>c.id)],sl=qbSlots();sl[+k]=ids[(ids.indexOf(sl[+k])+1)%ids.length];updSetup();snd('click');return}
    if(a==='ai'){const ids=['rand',...CIVS.map(c=>c.id)];SETUP.ai=ids[(ids.indexOf(SETUP.ai)+1)%ids.length];updSetup();snd('click');return}
    if(k==='size')return cyc('size',sz);if(k==='era')return cyc('era',['0','1','2','3']);if(k==='fim')return cyc('fim',ERAS_OPT.map(e=>e[0]));
    return cyc(k,ops(k))})}
const updSetup9=updSetup;
updSetup=function(){updSetup9();qbRender();const on=document.querySelector('#setup [data-tc="qb"]');$('sumr').style.display=on&&on.classList.contains('on')?'none':'';document.querySelector('#setup .setp').classList.toggle('qbon',!!(on&&on.classList.contains('on')))};
const setTab9=setTab;
setTab=function(t){setTab9(t);const on=t==='qb';$('sumr').style.display=on?'none':'';document.querySelector('#setup .setp').classList.toggle('qbon',on);if(on)qbRender()};
const buildSetup9=buildSetup;
buildSetup=function(){buildSetup9();setTab('qb')};
// a partida nova leva a Era final e o povo do computador
const newGame9=newGame;
newGame=function(o){newGame9(o);if(!G.cfg)G.cfg={};const f=o&&o.fim!=null?+o.fim:MAXAGE;G.cfg.endAge=clamp(Math.max(f,G.cfg.era|0),0,MAXAGE)};
window.__RA.newGame=newGame;
const ageReqMsg9=ageReqMsg;
ageReqMsg=function(p){if(G.P[p].age>=ENDAGE())return'Era final desta partida: '+AGES[ENDAGE()];return ageReqMsg9(p)};
// ---------- muralhas do mapa (Arena): nada embaixo nem colado nelas ----------
function wallClean(){const W=G.B.filter(b=>!b.dead&&b.type==='muralha');if(!W.length)return;
  const near=new Uint8Array(N);for(const b of W)for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const x=b.tx+dx,y=b.ty+dy;if(!inMap(x,y))continue;const d=Math.max(Math.abs(dx),Math.abs(dy));const i=idx(x,y);near[i]=Math.max(near[i],3-d)}
  // recursos no muro ou a 1 quadrado dele saem (o desenho deles é maior que o quadrado)
  for(const r of G.R){if(r.dead||r.walk||r.sub==='fish')continue;const i=idx(r.tx,r.ty);if(near[i]>=2){r.dead=true;E.delete(r.id);if(occ[i]===r.id){occ[i]=0;if(!G.terr[i])pass[i]=1}}}
  G.R=G.R.filter(r=>!r.dead);
  // raros e ruínas a menos de 2 quadrados do muro mudam de lugar
  const ok=(x,y)=>inMap(x,y)&&x>2&&y>2&&x<MW-3&&y<MH-3&&!G.terr[idx(x,y)]&&!occ[idx(x,y)]&&pass[idx(x,y)]&&!near[idx(x,y)]&&!(G.rare||[]).concat(G.ruins||[]).some(p=>p.x===x&&p.y===y);
  for(const p of(G.rare||[]).concat(G.ruins||[])){if(!inMap(p.x,p.y)||!near[idx(p.x,p.y)])continue;for(const[a,b]of SPIRAL){if(ok(p.x+a,p.y+b)){p.x+=a;p.y+=b;break}}}
  mmDirty=true}
const newGameW=newGame;
newGame=function(o){newGameW(o);try{wallClean()}catch(e){}};
window.__RA.newGame=newGame;
