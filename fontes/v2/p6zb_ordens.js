
// =========================================================
//   MAIS COMANDOS DO AGE II E DO RISE (Versão 74)
//   · Fila de ordens: liga o botão e cada toque no mapa vira uma etapa (andar, coletar, atacar, construir…),
//     cumpridas uma depois da outra, com as bandeirinhas numeradas mostrando o caminho
//   · Portão na muralha: os seus passam, o inimigo não; pode ser trancado
//   · Reparar: no prédio danificado, chama os aldeões mais perto
//   · Soldado parado: botão redondo que acha tropas sem ordem, uma por vez
// =========================================================

// ---------- 1. fila de ordens ----------
{const rOld=reset;reset=function(u){if(!u._keep&&!u._oq)u.oq=null;return rOld(u)}}
function oqRun(u){const o=u.oq.shift();if(!u.oq.length)u.oq=null;
  let e=o.id?E.get(o.id):null;if(e&&e.dead)e=null;
  u._oq=1;u._keep=1;try{if(e)smartOrder([u],e,o.x,o.y,0);else orderMove(u,o.x,o.y)}finally{u._oq=0;u._keep=0}
  u.oqT=G.t}
{const uOld=updUnit;updUnit=function(u,dt){
  // terminou a etapa (ficou parado) → próxima. Coleta não "termina": depois de ~1 viagem de trabalho segue a fila.
  if(u.oq&&u.oq.length&&u.k==='u'&&!u.dead&&!u.inT){const T=G.t-(u.oqT||0);
    if((u.st==='idle'&&!u.mv&&T>.3)||((u.st==='gather'||u.st==='return')&&T>25))oqRun(u)}
  return uOld(u,dt)}}
{const cOld=clickAt;clickAt=function(sx,sy,add){
  if(UI.chain&&!UI.aim&&!placing){const us=selEnts().filter(x=>x.k==='u'&&x.o===0&&!x.inT);
    if(us.length){const w=scrToW(sx,sy),e=pickAt(sx,sy);
      // tocar numa unidade sua só muda a seleção; o resto vira etapa
      if(!(e&&e.k==='u'&&e.o===0)){const first=UI.chain===1;
        us.forEach((u,i)=>{const a=i*2.4,r=i&&!e?TS*(.7+(i%6)*.33):0;const o={x:w.x+Math.cos(a)*r,y:w.y+Math.sin(a)*r,id:e?e.id:0};
          if(first){u.oq=[o];oqRun(u)}else{(u.oq||(u.oq=[])).push(o);if(u.oq.length>12)u.oq.shift();if(u.st==='idle'&&!u.mv)oqRun(u)}});
        UI.chain=2;mark(w.x,w.y,'#ffd84a');UI.sig='';return}}}
  return cOld(sx,sy,add)}}
// bandeirinhas numeradas mostrando o caminho das unidades escolhidas
{const dOld=drawParts;drawParts=function(){dOld();try{if(!G||!SEL.length)return;let n=0;
  for(const id of SEL){const u=E.get(id);if(!u||u.dead||u.k!=='u'||!u.oq||!u.oq.length||u.o!==0)continue;if(++n>12)break;
    ctx.save();ctx.strokeStyle='rgba(255,216,74,.75)';ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();
    let px=u.x,py=u.y;const g=u.goal||{x:u.x,y:u.y};ctx.moveTo(px-py,(px+py)/2);if(u.mv){ctx.lineTo(g.x-g.y,(g.x+g.y)/2);px=g.x;py=g.y}
    for(const o of u.oq)ctx.lineTo(o.x-o.y,(o.x+o.y)/2);ctx.stroke();ctx.setLineDash([]);
    if(n===1)u.oq.forEach((o,k)=>{const I=o.x-o.y,J=(o.x+o.y)/2;ctx.fillStyle='#3a2a12';ctx.fillRect(I-.8,J-17,1.6,17);ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.moveTo(I+.8,J-17);ctx.lineTo(I+13,J-13);ctx.lineTo(I+.8,J-9);ctx.fill();
      ctx.fillStyle='#1b1206';ctx.font='bold 8px Georgia';ctx.fillText(k+1,I+3,J-11)});
    ctx.restore()}}catch(e){}}}

// ---------- 2. portão ----------
function isGate(b){return b&&b.type==='muralha'&&b.gate}
function gateFriend(b,o){return ally(b.o,o)&&!b.lock}
// caminho: para os seus o portão está aberto; para o inimigo é parede
{const pOld=computePath;computePath=function(u){const gs=G.gates||[];const opened=[];
  if(gs.length&&!isNav(u))for(const id of gs){const b=E.get(id);if(!b||b.dead)continue;if(gateFriend(b,u.o)){const i=idx(b.tx,b.ty);if(!pass[i]){pass[i]=1;opened.push(i)}}}
  try{return pOld(u)}finally{for(const i of opened)pass[i]=0}}}
function makeGate(w){const P=G.P[0],cost={wood:25,gold:10};
  if(!afford(0,cost)){toast('Faltam recursos para o portão: '+costTxt(cost));return}
  // o portão ocupa o trecho escolhido e um vizinho de cada lado, na direção da muralha
  const at=(x,y)=>{const id=occ[idx(x,y)],b=id&&E.get(id);return b&&!b.dead&&b.type==='muralha'&&b.o===0&&b.done>=1&&!b.gate?b:null};
  const h=(at(w.tx-1,w.ty)?1:0)+(at(w.tx+1,w.ty)?1:0),v=(at(w.tx,w.ty-1)?1:0)+(at(w.tx,w.ty+1)?1:0);
  const dir=h>=v?[1,0]:[0,1];const seg=[w];for(const s of[-1,1]){const b=at(w.tx+dir[0]*s,w.ty+dir[1]*s);if(b)seg.push(b)}
  pay(0,cost);const gid=G.nid++;G.gates=G.gates||[];
  for(const b of seg){b.gate=gid;b.gdir=dir[0]?'x':'y';b.mhp=Math.round(b.mhp*1.5);b.hp=Math.min(b.mhp,b.hp*1.5);G.gates.push(b.id)}
  snd('done');toast('🚪 Portão feito: os seus passam, o inimigo não. Toque nele para trancar.');UI.sig=''}
{const kOld=kill;kill=function(e,by){kOld(e,by);if(e&&e.k==='b'&&e.gate&&G.gates)G.gates=G.gates.filter(id=>id!==e.id)}}
// porta aberta quando tem gente sua por perto (só enfeite: quem decide a passagem é o caminho)
function gateOpen(b){if(b.lock)return false;const c={x:(b.tx+.5)*TS,y:(b.ty+.5)*TS};
  for(const u of G.U){if(u.dead||u.inT||!ally(u.o,b.o))continue;if(Math.abs(u.x-c.x)<2*TS&&Math.abs(u.y-c.y)<2*TS)return true}return false}
function drawGate(b){const I0=(b.tx-b.ty)*TS,J0=(b.tx+b.ty)*TS/2;const op=gateOpen(b);
  // face comprida da muralha: x → face de baixo-esquerda, y → face de baixo-direita
  const L=b.gdir==='x'?[I0-TS,J0+TS/2]:[I0+TS,J0+TS/2],R=[I0,J0+TS];
  const P=(s,h)=>[L[0]+(R[0]-L[0])*s,L[1]+(R[1]-L[1])*s-h];const H=26;
  ctx.save();ctx.beginPath();const a=P(.2,0),bb=P(.8,0);ctx.moveTo(...a);ctx.lineTo(...P(.2,H*.62));
  for(let k=0;k<=8;k++){const t=k/8,s=.2+.6*t,hh=H*.62+Math.sin(t*Math.PI)*H*.3;ctx.lineTo(...P(s,hh))}ctx.lineTo(...bb);ctx.closePath();
  if(op){ctx.fillStyle='rgba(18,10,4,.9)';ctx.fill()}
  else{ctx.fillStyle=b.lock?'#5a2a14':'#7a4e24';ctx.fill();ctx.strokeStyle='rgba(30,16,6,.8)';ctx.lineWidth=1;
    for(let k=1;k<6;k++){const s=.2+.6*k/6;ctx.beginPath();ctx.moveTo(...P(s,0));ctx.lineTo(...P(s,H*.82));ctx.stroke()}
    ctx.strokeStyle='#2a2a2a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(...P(.2,H*.25));ctx.lineTo(...P(.8,H*.25));ctx.moveTo(...P(.2,H*.55));ctx.lineTo(...P(.8,H*.55));ctx.stroke()}
  ctx.strokeStyle='#2a1a0a';ctx.lineWidth=1.4;ctx.stroke();
  if(b.lock){const c=P(.5,H*.42);ctx.fillStyle='#e8c46a';ctx.beginPath();ctx.arc(c[0],c[1],3,0,7);ctx.fill()}
  ctx.restore()}
{const rOld=drawRonUp;drawRonUp=function(){rOld();if(!G.gates)return;for(const id of G.gates){const b=E.get(id);if(!b||b.dead)continue;if(b.o!==0&&!G.exp[idx(b.tx,b.ty)])continue;drawList.push({k:'ron',t:'gate',b,_d:(b.tx+b.ty+1)*TS+.5})}}}
{const dOld=drawUnit;drawUnit=function(e,s){if(e.k==='ron'&&e.t==='gate'){drawGate(e.b);return}return dOld(e,s)}}

// ---------- 3. reparar ----------
function cmdRepair(b){const vs=G.U.filter(u=>!u.dead&&!u.inT&&u.o===0&&u.type==='vill'&&!(u.st==='build'&&u.tg===b.id));
  const c=ctr(b);vs.sort((a,z)=>(a.st==='idle'?0:1)-(z.st==='idle'?0:1)||hyp(a.x-c.x,a.y-c.y)-hyp(z.x-c.x,z.y-c.y));
  const n=Math.min(vs.length,b.sz>=3?5:3);if(!n){toast('Sem aldeões para reparar');return}
  for(let i=0;i<n;i++)orderBuild(vs[i],b);snd('hammer');toast('🔨 '+n+' aldeões indo reparar '+BT[b.type].n+' (reparar é de graça)')}

// ---------- 4. soldado parado ----------
{const css=document.createElement('style');css.textContent='#qmidle i{position:absolute;right:2px;bottom:0;font:700 12px Georgia;color:#fff;text-shadow:0 0 3px #000}#qmidle.off{opacity:.45}';document.head.appendChild(css);
  const q=$('qarmy'),b=document.createElement('button');b.id='qmidle';b.className=q.className;b.style.position='relative';q.after(b);
  const pic=()=>{try{b.innerHTML='<img src="'+cmdIcon('army')+'" style="filter:grayscale(.7) brightness(.85)"><span style="position:absolute;left:3px;top:0;font-size:13px">💤</span><i id="nmidle"></i>'}catch(e){b.textContent='⚔💤'}};pic();
  let k=0;b.onclick=()=>{const us=G.U.filter(u=>!u.dead&&!u.inT&&u.o===0&&isFighter(u)&&u.st==='idle'&&!u.mv&&!u.guard&&!u.patrol);
    if(!us.length){toast('Nenhum soldado parado');return}snd('sel');const u=us[k++%us.length];SEL=[u.id];centerOn(u.x,u.y);updHUD(true)};
  setInterval(()=>{if(!G||!running)return;const n=G.U.filter(u=>!u.dead&&!u.inT&&u.o===0&&isFighter(u)&&u.st==='idle'&&!u.mv&&!u.guard&&!u.patrol).length;const i=$('nmidle');if(i)i.textContent=n||'';b.classList.toggle('off',!n)},700);
  if(typeof HELP_ID!=='undefined')HELP_ID.qmidle=['Soldado parado','Acha, um por vez, as tropas que estão sem ordem (como a tecla de "militar parado" do Age). O número mostra quantas.']}

// ---------- botões ----------
{const gOld=getCmds;getCmds=function(){let out=gOld();const s=selEnts();if(!s.length)return out;const own=s.filter(e=>e.o===0);
  const us=own.filter(e=>e.k==='u');
  if(us.length&&us.length===s.length){
    out.push(UI.chain?{ic:'📍',nm:'Fila de ordens: LIGADA',act:()=>{UI.chain=0;toast('Fila de ordens desligada')}}
      :{ic:'📍',nm:'Fila de ordens',act:()=>{UI.chain=1;toast('📍 Fila de ordens: cada toque no mapa vira uma etapa, cumpridas em ordem. Toque no botão de novo para desligar.')}})}
  if(s.length===1&&s[0].k==='b'&&s[0].o===0){const b=s[0];
    if(b.done>=1&&b.hp<b.mhp&&b.type!=='fazenda')out.unshift({ic:'🔨',nm:'Reparar',act:()=>cmdRepair(b)});
    if(b.type==='muralha'&&b.done>=1&&!b.gate)out.unshift({ic:'🚪',nm:'Fazer portão',cost:{wood:25,gold:10},d:'Este trecho e um vizinho de cada lado viram portão: os seus passam, o inimigo não. Pode ser trancado.',act:()=>makeGate(b)});
    if(b.gate)out.unshift({ic:b.lock?'🔒':'🔓',nm:b.lock?'Destrancar portão':'Trancar portão',act:()=>{const lk=!b.lock;for(const id of G.gates){const x=E.get(id);if(x&&x.gate===b.gate)x.lock=lk}snd('click');toast(lk?'🔒 Portão trancado: ninguém passa':'🔓 Portão aberto para os seus');UI.sig=''}})}
  return out.slice(0,12)}}
{const sOld=updHUD;updHUD=function(f){if(UI.chain&&!selEnts().some(e=>e.k==='u'&&e.o===0))UI.chain=0;return sOld(f)}}
if(typeof HELP_CMD!=='undefined')HELP_CMD.push(
 ['Fila de ordens','Ligado, cada toque no mapa vira uma etapa: andar, coletar, atacar ou construir. As tropas cumprem uma depois da outra e as bandeirinhas numeradas mostram o caminho.'],
 ['Fazer portão','Transforma este trecho da muralha (e um vizinho de cada lado) num portão: os seus passam, o inimigo não.'],
 ['Trancar portão','Fecha o portão para todos, inclusive os seus.'],['Destrancar portão','Deixa os seus passarem de novo.'],
 ['Reparar','Chama os aldeões mais perto para consertar o prédio. Reparar não custa nada.']);
