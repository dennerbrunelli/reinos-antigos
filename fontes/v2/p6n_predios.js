
// =========================================================
//   PRÉDIOS E GUARNIÇÃO (etapa 5, pedido do Denner)
//   · Universidade, Serraria, Fundição e Refinaria redesenhadas
//   · Guarnecer: cidadãos, tropas e eruditos entram nos prédios (como no Rise)
//       - Universidade: só eruditos; eles estudam lá dentro
//       - Torre e Forte: soldados guarnecidos dão mais flechas (+1 a cada 2)
//       - Ao destruir um prédio, quem estava dentro sai vivo
// =========================================================

// ---------- desenhos (seguem o estilo do povo: egípcio, grego, babilônico ou oriental) ----------
const paintBldN_prev=paintBld;
paintBld=function(g,P,type,st,C,S){const m=C.m,W=st.wall,W2=st.wall2,R=st.roof,ST=st.stone,WD=st.wood,A=st.acc,dk='#2c1b0c';
  const EG=st===STY.egito,BA=st===STY.babilonia,OR=st===STY.oriental;
  if(type==='universidade'){
    shadowB(g,P,4,4,92,92,70);ibox(g,P,4,4,92,92,0,5,ST);courses(g,P,4,4,92,92,0,5,3,.18);
    if(EG){ // templo de pedra: corpo em talude, pilares e pilão central com pirâmide
      frustum(g,P,10,30,86,70,5,26,4,W);faceL(g,P,36,52,70,5,18,dk);
      for(let i=0;i<6;i++){const x=16+i*12;ibox(g,P,x,70,x+3,73,5,20,W2);ibox(g,P,x-1,70,x+4,74,25,2,A)}
      roofS(g,P,st,10,30,86,70,31,4);
      ibox(g,P,36,36,60,58,31,14,W2);band(g,P,36,36,60,58,40,A);pyr(g,P,34,34,62,60,45,14,ST);flagP(g,P,48,40,80,m,12);return}
    if(BA){ // zigurate com azulejo azul no topo e cúpula dourada
      frustum(g,P,4,4,92,92,0,16,6,W);frustum(g,P,16,16,80,80,16,16,6,W2);frustum(g,P,28,28,68,68,32,16,4,W);
      ibox(g,P,36,36,60,60,48,18,A);courses(g,P,36,36,60,60,48,18,3,.2);pyr(g,P,34,34,62,62,66,12,'#d9b24a');flagP(g,P,48,48,92,m,14);return}
    if(OR){ // pagode: três andares com telhado de pirâmide e pilares vermelhos
      for(let i=0;i<3;i++){const a0=14+i*12,b0=82-i*12,z=i*24;ibox(g,P,a0,a0,b0,b0,z+4,18,i%2?W2:W);
        for(const[x,y]of[[a0+2,a0+2],[b0-4,a0+2],[a0+2,b0-4],[b0-4,b0-4]])ibox(g,P,x,y,x+2,y+2,z+4,18,A);
        pyr(g,P,a0-6,a0-6,b0+6,b0+6,z+22,12,R)}
      ibox(g,P,40,40,50,50,70,8,A);ln(g,...P(45,45,78),...P(45,45,92),'#c9a24a',2);return}
    // grega: colunata, frontão, cúpula
    ibox(g,P,12,30,84,68,5,26,W);courses(g,P,12,30,84,68,5,26,4,.1);
    faceL(g,P,30,50,68,5,20,dk);faceR(g,P,84,36,56,8,18,dk);band(g,P,12,30,84,68,30,A);
    for(let i=0;i<6;i++){const x=16+i*12;ibox(g,P,x,70,x+3,73,5,22,'#f2ead2');ibox(g,P,x-1,70,x+4,74,5,2,ST);ibox(g,P,x-1,70,x+4,74,27,2,ST)}
    roofS(g,P,st,12,30,84,68,32,12);
    ibox(g,P,36,36,60,58,32,10,W2);band(g,P,36,36,60,58,40,A);pyr(g,P,34,34,62,60,42,16,A);
    ibox(g,P,46,46,50,50,58,6,'#f2ead2');flagP(g,P,48,46,76,m,14);return}
  if(type==='serraria'){
    shadowB(g,P,4,4,60,60,40);ibox(g,P,4,4,60,60,0,4,ST);
    ibox(g,P,8,10,40,52,4,22,WD);courses(g,P,8,10,40,52,4,22,5,.15);faceL(g,P,20,32,52,4,18,dk);
    roofS(g,P,st,8,10,40,52,26,12);band(g,P,8,10,40,52,22,m);
    for(let r=0;r<3;r++)for(let k=0;k<3;k++){const y=10+k*6+(r%2)*3;ibox(g,P,44,y,58,y+4,4+r*4,4,WD)}
    for(let r=0;r<3;r++)for(let k=0;k<3;k++){const p=P(58,10+k*6+2+(r%2)*3,4+r*4+2);ell(g,p[0],p[1],1.8,1.8,'#d8a868');ell(g,p[0],p[1],.8,.8,dk)}
    const sp=P(44,58,16);ln(g,...P(44,58,0),...P(44,58,16),dk,1.4);ell(g,sp[0],sp[1],7,4.5,'#c8ccd2');ell(g,sp[0],sp[1],2.6,1.8,'#7a7e86');
    flagP(g,P,38,54,30,m,12);return}
  if(type==='fundicao'){
    shadowB(g,P,4,4,60,60,50);ibox(g,P,4,4,60,60,0,5,ST);
    ibox(g,P,8,8,46,56,5,22,W2);courses(g,P,8,8,46,56,5,22,4,.2);roofS(g,P,st,8,8,46,56,27,10);band(g,P,8,8,46,56,20,m);
    ibox(g,P,38,14,48,24,27,30,ST);ibox(g,P,37,13,49,25,55,3,dk);
    faceL(g,P,18,34,56,5,14,dk);faceL(g,P,21,31,56,7,12,'#ff8a2a');faceL(g,P,23,29,56,8,10,'#ffd27a');
    ibox(g,P,50,44,60,54,5,4,'#c8ccd2');ibox(g,P,52,46,58,52,9,3,'#e2e6ea');ibox(g,P,50,30,58,40,5,8,WD);
    flagP(g,P,30,20,58,m,12);return}
  if(type==='refinaria'){
    shadowB(g,P,4,4,60,60,52);ibox(g,P,4,4,60,60,0,4,ST);
    const tank=(x,y,r,h,c)=>{ibox(g,P,x-r,y-r,x+r,y+r,4,h,c);const p=P(x,y,4+h);ell(g,p[0],p[1],r*1.25,r*.8,sh(c,1.2));ell(g,p[0],p[1],r*.6,r*.4,'#8a8e96')};
    tank(18,22,8,26,'#c8ccd2');tank(40,20,6,20,'#b8bcc4');tank(22,44,7,18,'#c8ccd2');
    band(g,P,10,14,26,30,20,m);
    lnp(g,P(18,22,14),P(40,20,12),dk,2);lnp(g,P(18,22,10),P(22,44,8),dk,2);
    ibox(g,P,44,40,50,46,4,44,ST);ibox(g,P,42,38,52,48,46,3,dk);
    const f=P(47,43,50);ell(g,f[0],f[1],3.4,3.4,'#ff9a3a');ell(g,f[0],f[1]-1,1.8,2.2,'#ffe08a');
    return}
  return paintBldN_prev(g,P,type,st,C,S)};
// texto de ajuda dos prédios que agora guarnecem
Object.assign(BDESC,{universidade:'Treina Eruditos. Eruditos estudam aqui (dentro ou ao redor). Cada um gera conhecimento, que paga as linhas da Biblioteca e as eras. Pode guarnecer até '+UNI_MAX+' eruditos.'});
if(BDESC.torre)BDESC.torre+=' Soldados guarnecidos dão mais flechas (+1 a cada 2).';
if(BDESC.forte)BDESC.forte+=' Soldados guarnecidos dão mais flechas (+1 a cada 2).';

// ---------- guarnição ----------
const GAR_CAP={tc:12,forte:10,torre:6,quartel:8,maravilha:8,universidade:UNI_MAX,casa:4,celeiro:4,deposito:4,serraria:4,fundicao:4,refinaria:4};
const GAR_NO=['muralha','fazenda','silo','doca','mina','pesca'];
function garCap(b){if(!b||b.dead||b.done<1||b.o>1||GAR_NO.includes(b.type))return 0;
  return GAR_CAP[b.type]!=null?GAR_CAP[b.type]:(BT[b.type].sz>=3?6:4)}
function garFull(b){return (b.cargo||[]).length>=garCap(b)}
function garOK(b,u){if(!b||!u||u.dead||u.k!=='u'||u.o!==b.o||isNav(u)||u.type==='pesc'||u.type==='trans'||garCap(b)<=0)return false;
  if(b.type==='universidade')return u.type==='erudito';
  return u.type!=='erudito'}
function garBon(b){if(!b.cargo||!b.cargo.length)return 0;
  let n=0;for(const id of b.cargo){const u=E.get(id);if(u&&!u.dead&&isMil(u))n++}return Math.min(4,Math.floor(n/2))}
// o prédio vazio não precisa de vez de vila: o aldeão só entra se o prédio não é de trabalho
function vNeed(b){return b.done<1||b.hp<b.mhp||b.type==='fazenda'||!!BT[b.type].drop||b.type==='doca'}
function garrisonOrder(us,b){let n=0;
  for(const u of us){if(!garOK(b,u)||garFull(b))continue;reset(u);u.patrol=null;u.st='gar';u.tg=b.id;u.mv=false;u.fail=0;n++}
  if(n&&b.o===0)toast('🏠 '+n+(n>1?' unidades indo':' unidade indo')+' para '+BT[b.type].n+(garFull(b)?' (cheio)':''));
  return n}
function garThink(u,dt){const b=E.get(u.tg);
  if(!b||b.dead||b.o!==u.o||!garOK(b,u)||garFull(b)){u.st='idle';u.mv=false;return}
  const ux=u.x/TS,uy=u.y/TS,dx=Math.max(b.tx-ux,0,ux-(b.tx+b.sz)),dy=Math.max(b.ty-uy,0,uy-(b.ty+b.sz));
  if(Math.hypot(dx,dy)<=.9){u.inT=b.id;(b.cargo||(b.cargo=[])).push(u.id);u.st='idle';u.mv=false;SEL=SEL.filter(i=>i!==u.id);if(u.o===0)snd('click');return}
  if(!u.mv){const p=freeAround(b,null,false);const c=ctr(b);setGoal(u,p?{x:p.x,y:p.y}:{x:c.x,y:c.y})}
  if(moveAlong(u,dt)){u.mv=false;u.fail++;if(u.fail>2)u.st='idle'}}
const updUnitN=updUnit;
updUnit=function(u,dt){if(u.inT){if(u.st!=='gar')u.st='idle';if(u.st==='gar')garThink(u,dt);return}
  if(u.st==='gar'){garThink(u,dt);return}return updUnitN(u,dt)};
// sai todo mundo do prédio (vivo, do lado de fora)
function garEject(b){if(!b.cargo||!b.cargo.length)return 0;
  const c=ctr(b),bx=Math.floor(c.x/TS),by=Math.floor(c.y/TS);let n=0;const ids=b.cargo.slice();b.cargo=[];
  for(const id of ids){const u=E.get(id);if(!u||u.dead)continue;u.inT=0;u.st='idle';u.path=null;u.mv=false;
    let p=null;for(const[dx,dy,d2]of SPIRAL){if(d2>25)break;const x=bx+dx,y=by+dy;if(!inMap(x,y)||!pass[idx(x,y)]||occ[idx(x,y)])continue;p=[x,y];break}
    if(p){u.x=(p[0]+.5)*TS;u.y=(p[1]+.5)*TS}else{u.x=c.x;u.y=c.y}
    n++}
  return n}
const killN=kill;
kill=function(e,by){if(e.k==='b'&&e.cargo&&e.cargo.length){const n=garEject(e);if(n&&e.o===0)toast('🏚 '+n+' saíram de '+BT[e.type].n+' antes que caísse')}killN(e,by)};
// toque num prédio seu com unidades selecionadas: guarnecer (aldeão só se o prédio não precisa de trabalho)
const clickAtN=clickAt;
clickAt=function(sx,sy,add){
  if(!placing&&G){const e=pickAt(sx,sy);
    if(e&&e.k==='b'&&e.o===0&&garCap(e)>0){const s=selEnts().filter(u=>u.k==='u'&&u.o===0);
      const us=s.filter(u=>garOK(e,u)&&!(u.type==='vill'&&vNeed(e)));
      if(us.length){garrisonOrder(us,e);const w=scrToW(sx,sy);mark(w.x,w.y,'#6f6');return}}}
  return clickAtN(sx,sy,add)};
// comandos: desguarnecer quando um prédio com gente dentro está selecionado
const getCmdsN=getCmds;
getCmds=function(){const out=getCmdsN();const s=selEnts();const e=s[0];
  if(s.length===1&&e.k==='b'&&e.o===0&&e.cargo&&e.cargo.length){
    out.splice(0,0,{ic:'📤',nm:'Desguarnecer ('+e.cargo.length+')',act:()=>{const n=garEject(e);toast(n?'📤 '+n+' saíram de '+BT[e.type].n:'Ninguém dentro')}});
    if(out.length>12)out.length=12}
  return out};
// a cada tick: eruditos dentro da Universidade estudam; a lista de quem está dentro se limpa sozinha
const ronTickN=ronTick;
ronTick=function(dt){ronTickN(dt);
  if(!G)return;
  for(const b of G.B){if(b.dead||!b.cargo||!b.cargo.length)continue;
    b.cargo=b.cargo.filter(id=>{const u=E.get(id);return u&&!u.dead&&u.inT===b.id});
    if(b.type==='universidade'&&b.done>=1&&b.o<2)for(const id of b.cargo){const u=E.get(id);if(!u||u.type!=='erudito')continue;
      const k=KNOW_RATE*dt*(u.o<2?MODS[u.o].gath.know:1)*(1+.1*lvl(u.o,'sci'))*gmult(u.o);
      G.P[u.o].res.know+=k;G.st.gath[u.o]+=k;if(u.o===0)incAdd('know',k)}}};
