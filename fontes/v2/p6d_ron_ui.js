
// =========================================================
//   PACOTE RISE — tela: botões das linhas, habilidade do General, fichas,
//   desenhos dos raros, ruínas, moedas, carroças e mercadores
// =========================================================
window.__RA.newGame=newGame;
Object.assign(ROLE,{caravana:'Leva mercadorias entre o Mercado e outra cidade sozinha: cada viagem rende riqueza. Quanto mais longe, mais riqueza.',
  mercador:'Trabalha um recurso raro dentro da sua fronteira: rende riqueza e liga o bônus do recurso. Vai sozinho ao raro livre mais perto.',
  general:'Comandante: tropas perto dele (5 quadrados) ganham +15% de ataque e +1 de armadura. Habilidade: Marcha forçada.',
  carroca:'Tropas perto dela não sofrem atrito em terra inimiga e se curam aos poucos.'});
Object.assign(BDESC,{biblioteca:'Linhas de pesquisa do império: Cívica (mais cidades, fronteira e impostos), Comércio (coleta e caravanas) e Ciência (pesquisas mais rápidas).',
  forte:'Fortaleza: amplia a fronteira, atira flechas fortes e treina o General e a Carroça de Suprimentos.'});
// ---------- ícones das linhas ----------
const LCOL={cvc:['#5a8ae0','#10285a'],com:['#e0b040','#5a3a08'],sci:['#5ac0a0','#0e3a30']};
function lineIcon(k,v){const key='ln'+k+v;if(!ICO[key]){const[c,g]=icoC(),cc=LCOL[k];medal(g,cc[0],cc[1]);g.font='32px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(LINES[k].ic,40,38);if(v)numeral(g,ROMAN[v]);ICO[key]=c.toDataURL()}return ICO[key]}
function marchIcon(){const key='march';if(!ICO[key]){const[c,g]=icoC();medal(g,'#e0a040','#5a2a08');g.font='34px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('📯',40,41);ICO[key]=c.toDataURL()}return ICO[key]}
// ---------- botões ----------
const getCmds2=getCmds;
getCmds=function(){const out=getCmds2();const s=selEnts();const e=s[0];if(!e||e.o!==0)return out;
  if(e.k==='b'&&e.type==='biblioteca'&&e.done>=1){
    for(const k of['cvc','com','sci']){const v=lvl(0,k);if(v>=LN_N)continue;const r=lineCan(0,k);
      out.push({img:lineIcon(k,v+1),nm:LINES[k].n+' '+ROMAN[v+1],kind:'ln',key:k,d:LINES[k].d,cost:LN_COST[v],dis:r,lock:G.P[0].age<LN_AGE[v],cnt:e.q.includes('ln:'+k)?1:0,act:()=>{pay(0,LN_COST[v]);e.q.push('ln:'+k)}})}}
  if(e.k==='u'){const gs=s.filter(u=>u.k==='u'&&u.o===0&&u.type==='general');
    if(gs.length){const g=gs[0],cd=Math.max(0,(g.abT||0)-G.t);out.splice(0,0,{img:marchIcon(),nm:'Marcha forçada',dis:cd>0?'Pronta em '+Math.ceil(cd)+'s':null,act:()=>forcedMarch(g)})}}
  return out.slice(0,12)};
const cardInfo0=cardInfo;
cardInfo=function(c){if(c.kind==='ln'){const k=c.key,v=lvl(0,k);
    return{t:'Linha '+LINES[k].n+' '+ROMAN[v+1],sub:'Biblioteca · nível '+(v+1)+' de '+LN_N+' · '+AGES[LN_AGE[v]],txt:LINES[k].d+(k==='cvc'?'<br><b>Agora:</b> até '+cityMax(0)+' cidades · impostos '+5*v+' de riqueza/min por cidade':k==='com'?'<br><b>Agora:</b> coleta +'+5*v+'% · caravanas +'+20*v+'%':'<br><b>Agora:</b> pesquisas '+10*v+'% mais rápidas'),time:Math.round(LN_T[v]*sciMul(0)),btn:'📜 Pesquisar'}}
  return cardInfo0(c)};
// ---------- tocar num recurso raro ou numa ruína ----------
function ronPick(sx,sy){let best=null,bd=26;
  for(const r of G.rare||[]){if(!G.exp[idx(r.x,r.y)])continue;const p=w2s((r.x+.5)*TS,(r.y+.5)*TS);const d=hyp(p.x-sx,p.y-12*Z-sy);if(d<bd){bd=d;best={k:'rare',r}}}
  for(const r of G.ruins||[]){if(!G.exp[idx(r.x,r.y)])continue;const p=w2s((r.x+.5)*TS,(r.y+.5)*TS);const d=hyp(p.x-sx,p.y-12*Z-sy);if(d<bd){bd=d;best={k:'ruin',r}}}
  return best}
const clickAt0=clickAt;
clickAt=function(sx,sy,add){
  if(!placing&&G){const h=ronPick(sx,sy);if(h){const own=selEnts().filter(e=>e.k==='u'&&e.o===0);
      if(h.k==='rare'){const ms=own.filter(u=>u.type==='mercador');const R=RARE[h.r.kind],dm=DOM[idx(h.r.x,h.r.y)];
        if(ms.length){if(dm!==0){toast('🚩 '+R.n+' está fora da sua fronteira: amplie a fronteira primeiro');return}
          const i=G.rare.indexOf(h.r);for(const m of ms.slice(0,1)){m.rare=i;m.st='rare';m.goal=null}mark((h.r.x+.5)*TS,(h.r.y+.5)*TS,'#ffe08a');return}
        if(!own.length){const w=h.r.w&&E.get(h.r.w);toast(R.ic+' <b>'+R.n+'</b> (recurso raro): '+R.d+'<br>'+(dm===0?(w&&!w.dead&&w.o===0?'✅ Sendo trabalhado pelo seu Mercador':'Treine um Mercador no Mercado para ativar'):dm===1?'⛔ Na fronteira inimiga':'Fora das fronteiras: amplie a sua para usar'));return}}
      else if(!own.length){toast('🏺 Ruínas antigas'+(h.r.done?' (já exploradas)':': mande qualquer unidade até aqui para ganhar um prêmio'));return}}}
  clickAt0(sx,sy,add)};

// ---------- desenho: raros, ruínas, moedas ----------
const RARE_IMG={};
function rareImg(kind){if(!RARE_IMG[kind]){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
    g.font='38px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor='#000a';g.shadowBlur=4;g.fillText(RARE[kind].ic,32,34);RARE_IMG[kind]=c}return RARE_IMG[kind]}
function drawRonGround(){if(!G.rare)return;const t=performance.now()/1000;
  for(const r of G.rare){if(!G.exp[idx(r.x,r.y)])continue;const x=(r.x+.5)*TS,y=(r.y+.5)*TS,dm=DOM[idx(r.x,r.y)];const w=r.w&&E.get(r.w),on=w&&!w.dead&&RAREON[w.o]&&RAREON[w.o][r.kind];
    ctx.strokeStyle=on?(w.o===0?'rgba(90,160,255,.85)':'rgba(255,90,70,.85)'):'rgba(255,224,138,'+(.45+.25*Math.sin(t*2+r.x))+')';ctx.lineWidth=2.2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(x,y,TS*.95,0,7);ctx.stroke();ctx.setLineDash([])}}
function drawRonUp(){if(!G.rare)return;const t=performance.now()/1000;
  for(const r of G.rare){if(!G.exp[idx(r.x,r.y)])continue;const I=(r.x-r.y)*TS,J=(r.x+r.y+1)*TS/2;
    const ra=SPR['x_raro_'+r.kind+'_0'];
    if(ra)ctx.drawImage(ra.c,I-ra.ax,J-ra.ay,ra.w,ra.h);
    else{ctx.fillStyle='#6d6458';ctx.beginPath();ctx.ellipse(I,J,14,7,0,0,7);ctx.fill();ctx.fillStyle='#9a9080';ctx.beginPath();ctx.ellipse(I,J-3,13,6.2,0,0,7);ctx.fill();
      ctx.fillStyle='#b8ae9c';ctx.beginPath();ctx.ellipse(I,J-4,10,4.6,0,0,7);ctx.fill();ctx.drawImage(rareImg(r.kind),I-14,J-34+Math.sin(t*1.6+r.x)*1.5,28,28)}
    const w=r.w&&E.get(r.w);if(w&&!w.dead&&RAREON[w.o]&&RAREON[w.o][r.kind]){ctx.strokeStyle='#3a2a18';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(I+11,J-2);ctx.lineTo(I+11,J-24);ctx.stroke();ctx.fillStyle=COL[w.o].m;ctx.beginPath();ctx.moveTo(I+11,J-24);ctx.lineTo(I+21,J-20);ctx.lineTo(I+11,J-16);ctx.fill()}}
  G.ruins.forEach((r,i)=>{r.vi=i});
  for(const r of G.ruins){if(!G.exp[idx(r.x,r.y)])continue;const I=(r.x-r.y)*TS,J=(r.x+r.y+1)*TS/2;
    // arte do GPT: 4 jeitos de ruína intacta; explorada ganha a bandeira de quem chegou primeiro
    const ru=SPR[r.done?'x_ruina'+(r.vi%2?4:3)+'_'+(r.by===1?1:0):'x_ruina'+[0,1,2,5][r.vi%4]+'_0'];
    if(ru){ctx.drawImage(ru.c,I-ru.ax,J-ru.ay,ru.w,ru.h);if(!r.done){ctx.globalAlpha=.55+.45*Math.sin(t*3+r.y);ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.arc(I,J-ru.ay+4,2.4,0,7);ctx.fill();ctx.globalAlpha=1}continue}
    ctx.globalAlpha=r.done?.55:1;
    ctx.fillStyle='#7a7060';ctx.beginPath();ctx.ellipse(I,J,18,8,0,0,7);ctx.fill();
    const col=(x,h,lean)=>{ctx.save();ctx.translate(I+x,J-2);ctx.rotate(lean);ctx.fillStyle='#d8cfbc';ctx.fillRect(-3,-h,6,h);ctx.fillStyle='#b0a690';ctx.fillRect(1,-h,2,h);ctx.fillStyle='#e8e0cc';ctx.fillRect(-4.5,-h-3,9,3);ctx.restore()};
    if(!r.done){col(-10,22,0);col(0,14,.05);col(9,26,-.04);ctx.fillStyle='#c8bea8';ctx.fillRect(I-6,J-4,12,5);
      ctx.globalAlpha=.6+.4*Math.sin(t*3+r.y);ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.arc(I+2,J-32,2.2,0,7);ctx.fill()}
    else{col(-9,8,0);col(6,6,.1);ctx.fillStyle='#a89e88';ctx.fillRect(I-12,J-3,24,4)}
    ctx.globalAlpha=1}
  for(const f of G.fx){const I=f.x-f.y,J=(f.x+f.y)/2;
    if(f.k==='coin'){ctx.globalAlpha=clamp(1.6-f.t,0,1);ctx.font='bold 11px Georgia,serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#2a1804';ctx.strokeText('+'+f.v+' riqueza',I,J-40-f.t*16);ctx.fillStyle='#ffd84a';ctx.fillText('+'+f.v+' riqueza',I,J-40-f.t*16)}
    else if(f.k==='loot'){ctx.globalAlpha=clamp(1-f.t/1.6,0,1);ctx.strokeStyle='#ffe08a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(I,J-10,8+f.t*30,0,7);ctx.stroke()}}
  ctx.globalAlpha=1}
const drawMM0=drawMM;
drawMM=function(){drawMM0();if(!G||!G.rare)return;
  for(const r of G.rare){if(!G.exp[idx(r.x,r.y)])continue;const p=mmXY((r.x+.5)*TS,(r.y+.5)*TS);mg.fillStyle='#c070ff';mg.fillRect(p[0]-2.5,p[1]-2.5,5,5);mg.strokeStyle='#fff';mg.lineWidth=1;mg.strokeRect(p[0]-2.5,p[1]-2.5,5,5)}
  for(const r of G.ruins){if(r.done||!G.exp[idx(r.x,r.y)])continue;const p=mmXY((r.x+.5)*TS,(r.y+.5)*TS);mg.fillStyle='#ffe08a';mg.fillRect(p[0]-2,p[1]-2,4,4)}};

// ---------- folhas das unidades novas (desenho original em código) ----------
function wagon(g,ax,ay,C,fr,kind){
  const ph=fr>=1&&fr<=4?(fr-1)/4:0,step=Math.sin(ph*Math.PI*2),gy=ay;
  // animal (burro/boi) na frente
  const bx=ax+16,by=gy-15;g.fillStyle=kind==='caravana'?'#8a6a48':'#6a5038';
  for(const[lx,o]of[[bx-7,step],[bx+6,-step]]){g.strokeStyle='#3a2818';g.lineWidth=2.6;g.beginPath();g.moveTo(lx,by+3);g.lineTo(lx+o*2.5,gy-1);g.stroke()}
  g.beginPath();g.ellipse(bx,by,11,6.5,0,0,7);g.fill();g.strokeStyle='#2a1808';g.lineWidth=1;g.stroke();
  g.beginPath();g.ellipse(bx+12,by-5,4.5,3.6,-.4,0,7);g.fill();g.stroke();g.fillStyle='#2a1808';g.fillRect(bx+10,by-11,1.6,4);g.fillRect(bx+13,by-11,1.6,4);
  // varal
  g.strokeStyle='#5a3a1a';g.lineWidth=1.8;g.beginPath();g.moveTo(ax-2,gy-11);g.lineTo(bx-4,by+1);g.stroke();
  // carroça
  const cx=ax-12,cy=gy-12;g.fillStyle='#8a5a2a';g.fillRect(cx-14,cy-8,28,10);g.strokeStyle='#3a2210';g.lineWidth=1.2;g.strokeRect(cx-14,cy-8,28,10);
  for(let i=-10;i<14;i+=6){g.beginPath();g.moveTo(cx+i,cy-8);g.lineTo(cx+i,cy+2);g.stroke()}
  if(kind==='caravana'){g.fillStyle=C.m;g.beginPath();g.moveTo(cx-15,cy-8);g.quadraticCurveTo(cx,cy-26,cx+15,cy-8);g.fill();g.strokeStyle='#1a1008';g.stroke();
    g.fillStyle='#e8d8b0';g.beginPath();g.moveTo(cx-10,cy-8);g.quadraticCurveTo(cx,cy-21,cx+10,cy-8);g.fill()}
  else{g.fillStyle='#a8743a';g.fillRect(cx-12,cy-17,10,9);g.strokeRect(cx-12,cy-17,10,9);g.fillStyle='#7a4a1e';g.beginPath();g.ellipse(cx+6,cy-13,5,6,0,0,7);g.fill();g.stroke();
    g.strokeStyle='#3a2818';g.lineWidth=1.2;g.beginPath();g.moveTo(cx+13,cy-8);g.lineTo(cx+13,cy-30);g.stroke();g.fillStyle=C.m;g.fillRect(cx+13,cy-30,9,6)}
  // roda girando
  const wx=cx-2,wy=gy-5,rot=ph*Math.PI*2;g.fillStyle='#5a3a1a';g.beginPath();g.arc(wx,wy,6,0,7);g.fill();g.strokeStyle='#2a1808';g.lineWidth=1.4;g.stroke();
  g.strokeStyle='#c8a070';g.lineWidth=1;for(let k=0;k<4;k++){const a=rot+k*Math.PI/4;g.beginPath();g.moveTo(wx-Math.cos(a)*5,wy-Math.sin(a)*5);g.lineTo(wx+Math.cos(a)*5,wy+Math.sin(a)*5);g.stroke()}
  g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(ax,gy,30,5,0,0,7);g.globalCompositeOperation='destination-over';g.fill();g.globalCompositeOperation='source-over';
}
function extraSheets(o,C,skin){
  const H=[46,64,23,58];
  mkSheet('mercador'+o,H[0],H[1],H[2],H[3],(g,ax,ay,fr,dir,meta)=>drawHuman(g,ax,ay,{hat:'hood',wpn:'staff',robe:'#8a52b8'},C,skin,fr,dir===1,meta));
  mkSheet('general'+o,H[0],H[1],H[2],H[3],(g,ax,ay,fr,dir,meta)=>drawHuman(g,ax,ay,{hat:'crest',wpn:'sword',shield:'round',armor:'#e2bd62',greaves:1},C,skin,fr,dir===1,meta));
  for(const k of['caravana','carroca']){const sp=UT[k].spr;mkSheet(k+o,sp[0],sp[1],sp[2],sp[3],(g,ax,ay,fr)=>wagon(g,ax,ay,C,fr,k))}
}

// =========================================================
//   ORDENS SEGURAS NO TOQUE: o 1º toque marca o alvo e mostra o que vai acontecer;
//   o 2º toque no mesmo lugar (ou toque duplo rápido) confirma. Selecionar unidade sua continua com 1 toque.
// =========================================================
let TAPCTX=false;
function orderLabel(us,t){const vill=us.some(u=>u.type==='vill');
  if(!t)return'🚶 Mover';
  if(t.k==='u'&&t.o===0){if(t.type==='trans')return'⛵ Embarcar';if(us.every(u=>u.type==='sac'))return'✨ Curar';return'🚶 Mover'}
  if(t.o!==0&&t.o<NP)return us.every(u=>u.type==='sac')?'✨ Converter':'⚔ Atacar';
  if(t.k==='u'&&t.o===GAIA)return vill?'🏹 Caçar':'⚔ Atacar';
  if(t.k==='r')return vill||us.some(u=>u.type==='pesc')?(t.sub==='tree'?'🪓 Cortar madeira':t.sub==='gold'||t.sub==='stone'?'⛏ Minerar metal':t.sub==='fish'?'🎣 Pescar':t.sub==='carc'?'🍖 Recolher carne':'🧺 Colher frutas'):'🚶 Mover';
  if(t.k==='b'&&t.o===0)return t.done<1?'🔨 Construir':t.type==='fazenda'?'🌾 Cultivar':t.hp<t.mhp?'🔧 Consertar':'📦 Levar recursos';
  return'🚶 Mover'}
const smartOrder0=smartOrder;
smartOrder=function(us,tgt,x,y,o){
  if(TAPCTX&&OPT.tap2!==0&&us.length&&us[0].o===0){
    // recurso: vale o mesmo TIPO bem perto (árvores vizinhas na floresta); unidade/prédio: o mesmo alvo; chão: o mesmo lugar
    const key=!tgt?'p':tgt.k==='r'?'r'+tgt.sub:'e'+tgt.id,P=UI.pend,now=performance.now(),sel=SEL.join(','),tc=tgt?ctr(tgt):{x,y};
    const same=P&&now-P.wall<3500&&P.sel===sel&&P.key===key&&(key.startsWith('e')||hyp(P.x-tc.x,P.y-tc.y)<TS*(key==='p'?1.7:2.2));
    if(!same){UI.pend={key,x:tgt?ctr(tgt).x:x,y:tgt?ctr(tgt).y:y,wall:now,sel,lbl:orderLabel(us,tgt)};
      if(!OPT.tapTip){OPT.tapTip=1;saveOpt();toast('👆 Toque de novo no mesmo lugar para confirmar a ordem (ou toque duas vezes rápido). Dá para mudar na Pausa.')}
      return'pend'}
    UI.pend=null}
  return smartOrder0(us,tgt,x,y,o)};
const clickAt2=clickAt;
clickAt=function(sx,sy,add){TAPCTX=inputMode==='touch';try{return clickAt2(sx,sy,add)}finally{TAPCTX=false}};
// desenho do alvo marcado (por cima de tudo, até das árvores e da noite): anel pulsando e a etiqueta "toque de novo"
function drawPending(){const P=UI.pend;if(!P)return;const age=performance.now()-P.wall;if(age>3500||P.sel!==SEL.join(',')){UI.pend=null;return}
  const p=w2s(P.x,P.y),ph=(age/600)%1,a=clamp(1-(age-2800)/700,0,1),g=ctx;g.save();g.globalAlpha=a;
  g.strokeStyle='#ffe08a';g.lineWidth=2.4;g.beginPath();g.ellipse(p.x,p.y,(14+ph*10)*Z,(7+ph*5)*Z,0,0,7);g.stroke();g.lineWidth=1.5;g.beginPath();g.ellipse(p.x,p.y,10*Z,5*Z,0,0,7);g.stroke();
  const t='👆 Toque de novo: '+P.lbl;g.font='bold 13px Georgia,serif';const w=g.measureText(t).width+16,h=22,x=clamp(p.x-w/2,4,VW-w-4),y=clamp(p.y-24*Z-h-8,TOPH+6,VH-h-4);
  g.fillStyle='rgba(6,14,34,.92)';g.strokeStyle='#f0c55a';g.lineWidth=1.2;g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,7);else g.rect(x,y,w,h);g.fill();g.stroke();
  g.fillStyle='#fff6d8';g.textAlign='left';g.textBaseline='middle';g.fillText(t,x+8,y+h/2+1);g.restore()}
const drawAtmos0=drawAtmos;
drawAtmos=function(){drawAtmos0();try{drawPending()}catch(e){}};


// ---------- Universidade e Erudito (textos e desenho) ----------
Object.assign(ROLE,{erudito:'Estuda na Universidade e gera conhecimento (até 7 por Universidade). Vai sozinho para a Universidade com vaga.'});
Object.assign(BDESC,{universidade:'Treina Eruditos. Cada erudito estudando aqui gera conhecimento, que paga as linhas da Biblioteca e as eras.',mercado:'Rende riqueza todo minuto. Pesquisas que melhoram a coleta. Treina Caravanas e Mercadores. Libera a Fazenda.'});
const extraSheets1=extraSheets;
extraSheets=function(o,C,skin){extraSheets1(o,C,skin);const H=[46,64,23,58];
  mkSheet('erudito'+o,H[0],H[1],H[2],H[3],(g,ax,ay,fr,dir,meta)=>drawHuman(g,ax,ay,{hat:'hood',wpn:'staff',robe:'#2f5fb0'},C,skin,fr,dir===1,meta))};
