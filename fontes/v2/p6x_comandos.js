
// =========================================================
//   COMANDOS NO PADRÃO DO AGE II E DO RISE (Versão 72)
//   · Tropas reagem sozinhas: atacam quem entra no campo de visão e acodem quem da sua cidade apanha
//   · Sino nos prédios de defesa (Centro Urbano, Torre, Forte): aldeões próximos se abrigam;
//     tocar de novo manda todos de volta ao que estavam fazendo
//   · Explorar de verdade: a unidade segue revelando o mapa até não sobrar terra escondida
//   · Atacar e avançar e Patrulhar escolhendo o ponto no mapa; Excluir unidade ou prédio
// =========================================================
function isFighter(u){return u&&!u.dead&&u.k==='u'&&!u.inT&&u.o<NP&&ST(u).atk>0&&UT[u.type].cls!=='vill'&&UT[u.type].cls!=='sac'&&u.type!=='pesc'&&u.type!=='trans'&&u.type!=='mercador'&&u.type!=='caravana'&&u.type!=='erudito'}

// ---------- 1. acudir quem apanha (raio de 9 quadrados) ----------
const HELP_T={};
{const dOld=dealDmg;dealDmg=function(att,t,base){const wasEx=t&&t.explore&&!t.dead;const r=dOld(att,t,base);
  // quem está explorando não para para revidar: segue o caminho (como o batedor do Age)
  if(wasEx&&!t.dead&&!t.explore&&t.st==='attack'){t.st='idle';t.explore=true;exploreNext(t)}
  // quem bate vem como um registro {o,id}: acha a unidade de verdade (flechas também valem)
  try{const A=att&&att.id?E.get(att.id):null;if(A&&A.k==='u'&&!A.dead&&t&&t.o<NP&&A.o!==t.o&&foe(A.o,t.o)){att=A;
    const k=t.o+':'+att.id;if(!HELP_T[k]||G.t-HELP_T[k]>.8){HELP_T[k]=G.t;
      const c=t.k==='b'?ctr(t):t,R=9*TS;
      for(const u of G.U){if(!isFighter(u)||u.o!==t.o||u===t)continue;if(u.st!=='idle'&&!(u.st==='move'&&u.amove))continue;
        const S=u.o===0?stanceOf(u):'agr';if(S==='sem'||S==='firme')continue;
        if(isNav(u)!==isNav(att)&&!(ST(u).rng>0))continue;
        if(hyp(u.x-c.x,u.y-c.y)>R)continue;if(u.st==='idle'){u.gx=u.x;u.gy=u.y}const am=u.amove;u._keep=1;orderAttack(u,att);u._keep=0;u.amove=am;u.auto=1}}}}catch(e){}
  return r}}

// ---------- ordens do jogador cancelam explorar / atacar-e-avançar ----------
{const rOld=reset;reset=function(u){if(!u._keep){u.explore=false;u.amove=null;u.guard=0}return rOld(u)}}

// ---------- 2. sino ----------
const BELL_B={tc:1,torre:1,forte:1};
function bellSnd(){if(!OPT.snd||!audio())return;const o=voice(0,1,.45);for(let i=0;i<3;i++)metal([1046,1568,2093,2637],1.1,.16,i*.34,o)}
function bellActive(){return G.U.some(u=>!u.dead&&u.o===0&&u.bell)}
function ringBell(b){const c=ctr(b),R=22*TS;const room=new Map();
  const defs=G.B.filter(x=>!x.dead&&x.o===0&&x.done>=1&&BELL_B[x.type]&&garCap(x)>0);
  for(const d of defs)room.set(d.id,garCap(d)-(d.cargo||[]).length-G.U.filter(u=>!u.dead&&u.st==='gar'&&u.tg===d.id&&!u.inT).length);
  const vs=G.U.filter(u=>!u.dead&&!u.inT&&u.o===0&&u.type==='vill'&&hyp(u.x-c.x,u.y-c.y)<R).sort((a,b)=>hyp(a.x-c.x,a.y-c.y)-hyp(b.x-c.x,b.y-c.y));
  let n=0,fora=0;
  for(const u of vs){let best=null,bd=1e9;for(const d of defs){if(room.get(d.id)<=0)continue;const p=ctr(d),dd=hyp(p.x-u.x,p.y-u.y);if(dd<bd){bd=dd;best=d}}
    u.bell={st:u.st,tg:u.tg,bt:u.bt,x:u.x,y:u.y};
    if(!best){fora++;u._keep=1;orderMove(u,c.x+(Math.random()-.5)*3*TS,c.y+(b.sz+1)*TS);u._keep=0;continue}
    room.set(best.id,room.get(best.id)-1);reset(u);u.patrol=null;u.st='gar';u.tg=best.id;u.mv=false;u.fail=0;n++}
  bellSnd();toast('🔔 Sino tocado! '+n+' aldeões correm para se abrigar'+(fora?' · '+fora+' sem lugar ficam perto do prédio':''));UI.sig=''}
function backToWork(){let n=0;
  const casas=new Set();for(const u of G.U)if(!u.dead&&u.o===0&&u.bell&&u.inT)casas.add(u.inT);
  for(const id of casas){const b=E.get(id);if(!b)continue;const outros=(b.cargo||[]).map(i=>E.get(i)).filter(u=>u&&!u.bell);garEject(b);if(outros.length)garrisonOrder(outros,b)}
  for(const u of G.U){if(u.dead||u.o!==0||!u.bell)continue;const p=u.bell;u.bell=null;n++;
    const t=p.tg&&E.get(p.tg);
    if(t&&!t.dead&&(p.st==='gather'||p.st==='return')&&canGather(u,t))orderGather(u,t);
    else if(t&&!t.dead&&p.st==='build'&&t.k==='b')orderBuild(u,t);
    else{u.st='idle';u.mv=false}}
  snd('done');toast('🔨 De volta ao trabalho: '+n+' aldeões');UI.sig=''}

// ---------- 3. explorar sem parar ----------
let EXQ=null;
function exploreTarget(u){let s=tileOf(u.x,u.y);
  if(!pass[s]){const bx=s%MW,by=(s/MW)|0;s=-1;for(const[dx,dy,d2]of SPIRAL){if(d2>9)break;const x=bx+dx,y=by+dy;if(inMap(x,y)&&pass[idx(x,y)]){s=idx(x,y);break}}if(s<0)return null}
  const bad=u.exBad||(u.exBad=new Set());
  if(!EXQ||EXQ.length<N)EXQ=new Int32Array(N);const seen=new Uint8Array(N);let h=0,t=0;EXQ[t++]=s;seen[s]=1;let first=-1,fd=0;const cand=[];
  while(h<t){const i=EXQ[h++];const x=i%MW,y=(i/MW)|0;
    if(!G.exp[i]&&!bad.has(i)){const d=hyp(x-(s%MW),y-((s/MW)|0));if(first<0){first=i;fd=d}cand.push(i);if(cand.length>40||d>fd+8)break}
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<1||ny<1||nx>=MW-1||ny>=MH-1)continue;const j=ny*MW+nx;if(seen[j])continue;seen[j]=1;
      if(pass[j])EXQ[t++]=j}}
  if(!cand.length)return null;
  // entre os mais perto, prefere seguir na mesma direção (anda em linha, não fica indo e voltando)
  const hx=u.exDir?u.exDir[0]:0,hy=u.exDir?u.exDir[1]:0;let best=cand[0],bs=1e9;
  for(const i of cand){const dx=i%MW-(s%MW),dy=((i/MW)|0)-((s/MW)|0),d=hyp(dx,dy)||1;const sc=d-(hx*dx+hy*dy)/d*3;if(sc<bs){bs=sc;best=i}}
  return best}
function exploreNext(u){
  if(u.exT!=null){const tx=(u.exT%MW+.5)*TS,ty=(((u.exT/MW)|0)+.5)*TS;if(hyp(u.x-tx,u.y-ty)>2.5*TS&&!G.exp[u.exT])(u.exBad||(u.exBad=new Set())).add(u.exT)}
  const i=exploreTarget(u);
  if(i==null){u.exMiss=(u.exMiss||0)+1;if(u.exMiss<4)return;u.explore=false;u.exT=null;if(u.o===0&&!G._exMsg){G._exMsg=G.t;toast('🔭 Não há mais terra escondida ao alcance desta unidade')}return}
  u.exMiss=0;const x=(i%MW+.5)*TS,y=(((i/MW)|0)+.5)*TS;const d=hyp(x-u.x,y-u.y)||1;u.exDir=[(x-u.x)/d,(y-u.y)/d];u.exT=i;
  u._keep=1;orderMove(u,x,y);u._keep=0;u.explore=true}
cmdScout=function(us){let n=0;G._exMsg=0;for(const u of us){if(u.dead||isNav(u))continue;u.exBad=new Set();u.exT=null;u.explore=true;exploreNext(u);if(u.explore)n++}
  toast(n?'🔭 Explorando até revelar o mapa todo (qualquer outra ordem para)':'Não há terra escondida ao alcance')};

// ---------- 4. atacar e avançar / patrulha que combate ----------
function amoveScan(u){u.amS=(u.amS||0)-.05;if(u.amS>0)return false;u.amS=.4;
  const T=UT[u.type],R=Math.max(T.los||4,5)*TS*losMul()+(T.rng?TS:0);const en=nearestEnemy(u,R,true);
  if(en){const am=u.amove,pt=u.patrol;u._keep=1;u._pat=1;orderAttack(u,en);u._keep=0;u._pat=0;u.amove=am;u.patrol=pt;u.auto=1;return true}return false}
{const uOld=updUnit;updUnit=function(u,dt){
  if(u.k==='u'&&u.o<NP&&!u.dead&&!u.inT){
    if(u.explore&&u.st==='idle'){u.scan=Math.max(u.scan||0,.6);// explorando: não para para brigar com bicho ou inimigo
      exploreNext(u)}
    else if((u.amove||u.patrol)&&u.st==='move'&&isFighter(u))amoveScan(u);
    else if(u.guard&&(u.st==='idle'||u.st==='move')){const g=E.get(u.guard);
      if(!g||g.dead){u.guard=0}else{const gc=g.k==='b'?ctr(g):g;u.gS=(u.gS||0)-dt;
        if(u.gS<=0){u.gS=.4;const en=nearestEnemy({x:gc.x,y:gc.y,o:u.o,type:u.type,k:'u',id:u.id},6*TS,true);
          if(en){const gd=u.guard;u._keep=1;orderAttack(u,en);u._keep=0;u.guard=gd;u.auto=1}
          else if(hyp(u.x-gc.x,u.y-gc.y)>(g.k==='b'?g.sz*TS*.8+TS*1.5:2.2*TS)&&u.st==='idle'){const gd=u.guard;u._keep=1;orderMove(u,gc.x+(Math.random()-.5)*TS*1.6,gc.y+(Math.random()-.5)*TS*1.6+(g.k==='b'?g.sz*TS*.6:0));u._keep=0;u.guard=gd}}}}
    else if(u.amove&&u.st==='idle'){const a=u.amove;if(hyp(u.x-a.x,u.y-a.y)>1.5*TS){u._keep=1;orderMove(u,a.x,a.y);u._keep=0;u.amove=a}else u.amove=null}}
  return uOld(u,dt)}}
// patrulha antiga escolhia um ponto aleatório: agora o jogador toca no mapa
function aimMode(kind,us,msg){UI.aim={kind,ids:us.map(u=>u.id)};toast(msg+' · toque no mapa (ou no botão de novo para cancelar)');UI.sig=''}
{const cOld=clickAt;clickAt=function(sx,sy,add){
  if(UI.aim){const A=UI.aim;UI.aim=null;UI.sig='';const w=scrToW(sx,sy);const us=A.ids.map(id=>E.get(id)).filter(u=>u&&!u.dead&&!u.inT);
    if(!us.length)return;const ti=tileOf(w.x,w.y);
    if(A.kind==='amove'){us.forEach((u,i)=>{const a=i*2.4,r=i?TS*(.8+(i%6)*.35):0;const x=w.x+Math.cos(a)*r,y=w.y+Math.sin(a)*r;u.patrol=null;orderMove(u,x,y);u.amove={x,y}});mark(w.x,w.y,'#ff5a4a');toast('⚔️ Avançando e atacando o que aparecer no caminho')}
    if(A.kind==='guard'){let alvo=null,bd=40;for(const v of G.U){if(v.dead||v.inT||v.o!==0||A.ids.includes(v.id))continue;const p=w2s(v.x,v.y),d=hyp(p.x-sx,p.y-sy);if(d<bd){bd=d;alvo=v}}
      if(!alvo){for(const b of G.B){if(b.dead||b.o!==0)continue;const p=w2s(ctr(b).x,ctr(b).y);if(hyp(p.x-sx,p.y-sy)<b.sz*TS*Z*.6){alvo=b;break}}}
      if(!alvo){toast('🛡️ Toque numa unidade ou prédio seu para proteger');return}
      us.forEach(u=>{u.patrol=null;u._keep=1;reset(u);u._keep=0;u.amove=null;u.explore=false;u.guard=alvo.id;u.st='idle'});mark(alvo.x||ctr(alvo).x,alvo.y||ctr(alvo).y,'#7cf');
      toast('🛡️ Protegendo '+(alvo.k==='b'?BT[alvo.type].n:UT[alvo.type].n)+': seguem e atacam quem chegar perto');return}
    if(A.kind==='patrol'){us.forEach((u,i)=>{const a=i*2.4,r=i?TS*(.8+(i%6)*.35):0;const b={x:w.x+Math.cos(a)*r,y:w.y+Math.sin(a)*r};u.patrol={a:{x:u.x,y:u.y},b,to:'b'};u._pat=1;orderMove(u,b.x,b.y);u._pat=0});mark(w.x,w.y,'#ffd84a');toast('🔁 Patrulhando entre aqui e o ponto marcado (atacam quem aparecer)')}
    return}
  return cOld(sx,sy,add)}}

// ---------- 5. excluir (pede confirmação com um segundo toque) ----------
function cmdDelete(es){if(!UI.delArm||performance.now()-UI.delArm>3500){UI.delArm=performance.now();toast('💀 Toque em Excluir de novo para confirmar');return}
  UI.delArm=0;let n=0;for(const e of es){if(e.dead||e.o!==0)continue;if(e.k==='b'&&e.cargo&&e.cargo.length)garEject(e);kill(e,null);n++}
  SEL=[];updHUD(true);toast('💀 '+n+' excluído'+(n>1?'s':''))}

// ---------- montagem dos botões ----------
{const gOld=getCmds;getCmds=function(){let out=gOld().filter(c=>!(c.nm&&/^Alarme/.test(c.nm)));const s=selEnts();if(!s.length)return out;
  const own=s.filter(e=>e.o===0);
  // prédio de defesa: sino
  if(s.length===1&&s[0].k==='b'&&s[0].o===0&&BELL_B[s[0].type]&&s[0].done>=1){const b=s[0];
    out.unshift(bellActive()?{ic:'🔔',nm:'Voltar ao trabalho',act:()=>backToWork()}:{ic:'🔔',nm:'Tocar o sino: aldeões se abrigam',act:()=>ringBell(b)})}
  // tropas: patrulha e atacar-e-avançar escolhendo o ponto
  const mil=own.filter(u=>u.k==='u'&&isFighter(u)&&!isNav(u));
  if(mil.length&&mil.length===s.length){
    const pi=out.findIndex(c=>c.nm==='Patrulhar');const pat={ic:'🔁',nm:'Patrulhar até um ponto',act:()=>{if(UI.aim){UI.aim=null;toast('Cancelado');return}aimMode('patrol',mil,'🔁 Patrulha')}};
    if(pi>=0)out[pi]=pat;else out.unshift(pat);
    out.splice(2,0,{ic:'🛡️',nm:'Proteger (escoltar)',act:()=>{if(UI.aim){UI.aim=null;toast('Cancelado');return}aimMode('guard',mil,'🛡️ Proteger')}});
    out.splice(1,0,{ic:'⚔️',nm:'Atacar e avançar',act:()=>{if(UI.aim){UI.aim=null;toast('Cancelado');return}aimMode('amove',mil,'⚔️ Atacar e avançar')}})}
  // excluir: unidades ou prédio próprios
  if(own.length&&own.length===s.length&&!(s.length===1&&s[0].k==='b'&&s[0].type==='tc'&&G.B.filter(b=>!b.dead&&b.o===0&&b.type==='tc').length<2))
    out.push({ic:'💀',nm:'Excluir',act:()=>cmdDelete(own)});
  const seen=new Set();out=out.filter(c=>{const k=c.nm||c.ic;if(seen.has(k))return false;seen.add(k);return true});
  return out.slice(0,12)}}
// ícone de excluir: caveira com ossos cruzados, como nos clássicos (desenhado à mão no código)
Object.assign(CMD_ART,{skull:g=>{medal(g,'#5a1d16','#120404');
  // ossos cruzados atrás
  const osso=(a)=>{g.save();g.translate(40,46);g.rotate(a);const L=27;g.fillStyle='#e9dcc0';g.strokeStyle='#1a0e04';g.lineWidth=2;
    g.beginPath();g.roundRect(-L,-3.2,L*2,6.4,3);g.fill();g.stroke();
    for(const s of[-1,1])for(const t of[-1,1]){g.beginPath();g.arc(s*L,t*3.6,4.4,0,7);g.fill();g.stroke()}g.restore()};
  osso(.62);osso(-.62);
  // crânio
  const cr=g.createRadialGradient(34,26,3,40,34,22);cr.addColorStop(0,'#fffaf0');cr.addColorStop(.7,'#e6d8b8');cr.addColorStop(1,'#b8a37c');
  g.fillStyle=cr;g.strokeStyle='#1a0e04';g.lineWidth=2.2;g.beginPath();g.moveTo(22,38);g.bezierCurveTo(20,16,60,16,58,38);g.lineTo(55,45);g.lineTo(52,46);g.lineTo(52,53);g.lineTo(28,53);g.lineTo(28,46);g.lineTo(25,45);g.closePath();g.fill();g.stroke();
  // olhos fundos, nariz e dentes
  g.fillStyle='#1a0e04';for(const x of[32,48]){g.beginPath();g.ellipse(x,36,5.6,6.4,0,0,7);g.fill()}
  g.fillStyle='#c0392b';for(const x of[32,48]){g.beginPath();g.arc(x+.6,37,1.6,0,7);g.fill()}
  g.fillStyle='#1a0e04';g.beginPath();g.moveTo(40,41);g.lineTo(37,47);g.lineTo(43,47);g.closePath();g.fill();
  g.strokeStyle='#1a0e04';g.lineWidth=1.4;for(const x of[33,37,41,45]){g.beginPath();g.moveTo(x+1,48.5);g.lineTo(x+1,53);g.stroke()}
  g.beginPath();g.moveTo(29,50);g.lineTo(51,50);g.stroke();
  // rachadura
  g.lineWidth=1.3;g.beginPath();g.moveTo(45,21);g.lineTo(43,26);g.lineTo(46,29);g.stroke()}});
Object.assign(CMD_ART,{
  amove:g=>{medal(g,'#c87a2c','#4a2208');
    // seta grossa para frente com uma espada por cima: "vai atacando pelo caminho"
    fillP(g,[[16,46],[44,46],[44,56],[64,40],[44,24],[44,34],[16,34]],'#fff1c0');
    g.save();g.translate(38,40);g.rotate(-.78);g.fillStyle='#d8dee6';g.strokeStyle='#1a0e04';g.lineWidth=1.8;
    g.beginPath();g.moveTo(-3,-22);g.lineTo(0,-28);g.lineTo(3,-22);g.lineTo(3,10);g.lineTo(-3,10);g.closePath();g.fill();g.stroke();
    g.fillStyle='#e0b040';g.beginPath();g.rect(-9,10,18,4);g.fill();g.stroke();g.fillStyle='#6a3a16';g.beginPath();g.rect(-2.2,14,4.4,9);g.fill();g.stroke();g.restore()},
  guard:g=>{medal(g,'#4a6c9a','#101c34');
    // escudo com a cruz: "fica junto e defende"
    const sh=[[40,15],[60,22],[58,42],[40,63],[22,42],[20,22]];fillP(g,sh,'#e8c45a');
    fillP(g,[[40,20],[55,25],[53,41],[40,57],[27,41],[25,25]],'#2a5aa0','#1a0e04');
    g.fillStyle='#f4ead0';g.fillRect(37,24,6,30);g.fillRect(28,33,24,6)}});
// ---------- grupos de tropas (os "Ctrl+1, 2, 3" do Age e do Rise, feitos para o dedo) ----------
// Com tropas escolhidas aparece a bandeira "＋ Grupo": um toque guarda o grupo. Depois, tocar na bandeira
// numerada escolhe o grupo inteiro de qualquer lugar do mapa; tocar de novo leva a câmera até ele.
{const css=document.createElement('style');css.textContent='#grp{position:fixed;z-index:21;display:none;gap:5px;align-items:flex-end}#grp button{min-width:44px;height:38px;padding:0 8px;border-radius:7px 7px 2px 2px;border:2px solid #c9952f;background:linear-gradient(#3a2a12,#1c1206);color:#f3e2b4;font:700 15px Georgia,serif;box-shadow:0 2px 6px #000a}#grp button small{font-size:10.5px;opacity:.8;margin-left:3px}#grp button.on{background:linear-gradient(#f3d37a,#c9952f);color:#1b1206}#grp button.add{border-style:dashed;font-size:13px}';document.head.appendChild(css);
  const bar=document.createElement('div');bar.id='grp';document.body.appendChild(bar);let sig='';
  const vivos=g=>g.ids.map(id=>E.get(id)).filter(u=>u&&!u.dead&&u.o===0);
  function draw(){if(!G||!running){bar.style.display='none';return}G.grp=(G.grp||[]).filter(g=>vivos(g).length);
    const sel=selEnts().filter(e=>e.k==='u'&&e.o===0),selK=sel.map(u=>u.id).sort().join(',');
    const s=G.grp.map(g=>g.n+':'+vivos(g).length+(vivos(g).map(u=>u.id).sort().join(',')===selK?'*':'')).join('|')+'#'+(sel.length?1:0);
    const ps=$('pSel'),r=ps&&ps.offsetParent?ps.getBoundingClientRect():null;const y=r?r.top-44:innerHeight-52,x=r?r.left:8;
    bar.style.left=x+'px';bar.style.top=Math.max(TOPH+4,y)+'px';bar.style.display=(G.grp.length||sel.length)?'flex':'none';
    if(s===sig)return;sig=s;bar.innerHTML='';
    for(const g of G.grp){const us=vivos(g),b=document.createElement('button');const on=us.map(u=>u.id).sort().join(',')===selK;b.className=on?'on':'';b.innerHTML='⚑'+g.n+'<small>'+us.length+'</small>';
      b.onclick=()=>{snd('click');const us2=vivos(g);if(on){const c=grpCenter(us2);centerOn(c.x,c.y)}else{SEL=us2.map(u=>u.id);updHUD(true)}sig=''};bar.appendChild(b)}
    if(sel.length&&!G.grp.some(g=>vivos(g).map(u=>u.id).sort().join(',')===selK)){const b=document.createElement('button');b.className='add';b.textContent='＋ Grupo';
      b.onclick=()=>{let n=1;while(G.grp.some(g=>g.n===n))n++;if(n>5){G.grp.shift();n=1;while(G.grp.some(g=>g.n===n))n++}
        G.grp.push({n,ids:sel.map(u=>u.id)});G.grp.sort((a,b)=>a.n-b.n);snd('done');toast('⚑ Grupo '+n+' guardado: toque na bandeira para chamar, toque de novo para ir até ele');sig=''};bar.appendChild(b)}}
  setInterval(()=>{try{draw()}catch(e){}},300)}
