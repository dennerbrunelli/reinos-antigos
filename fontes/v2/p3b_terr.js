
// =========================================================
//   FRONTEIRAS E CIDADES (a parte do Rise of Nations na fusão)
// =========================================================
const INF_CAP=13,INF_CITY=10,INF_TORRE=4;           // raio de influência em quadrados (com 8 não cabiam as fazendas)
const CITY_MAX=4,CITY_MIN_OWN=18,CITY_MIN_EN=12;    // limite de cidades e distância entre elas
const CAPT_T=30,CAPT_R=5,CAPT_IMM=60;               // tomada: segundos, raio, proteção depois de tomada
const ATTR_DELAY=15,ATTR_RATE=.005,ATTR_FLOOR=.25;  // atrito: espera, perda por segundo, vida mínima
const TERR_WIN=.65,TERR_T=180,GRACE_T=120,CAP_PEN=120;
// prédios que podem ficar em terra neutra (fora da fronteira); o resto só dentro da sua fronteira
const NEUTRAL_OK={deposito:1,celeiro:1,doca:1,torre:1,muralha:1,tc:1};
let DOM=new Int8Array(N).fill(-1),DOMS=new Float32Array(N);
let domDirty=true,domEdges=[[],[],[],[],[],[],[],[]],DOMCNT=new Array(MAX_PLAYERS).fill(0),LANDN=0;

// raio de influência de um prédio pronto (capital 13, cidade 10, torre 4)
function infR(b){const cv=(G.P[b.o]&&G.P[b.o].cvc)||0;if(b.type==='torre')return INF_TORRE;if(b.type==='forte')return 8+cv;if(b.type==='tc')return(b.id===G.P[b.o].capId?INF_CAP:INF_CITY)+cv;return 0}

// calcula o dono de cada quadrado: quem tem a influência mais forte ali
function calcDom(){
  DOM.fill(-1);DOMS.fill(0);
  for(const b of G.B){if(b.dead||b.o>=NP||b.done<1)continue;const r=infR(b);if(!r)continue;
    const c=ctr(b),cx=c.x/TS,cy=c.y/TS;
    for(let y=Math.max(0,Math.floor(cy-r));y<=Math.min(MH-1,Math.floor(cy+r));y++)
      for(let x=Math.max(0,Math.floor(cx-r));x<=Math.min(MW-1,Math.floor(cx+r));x++){
        const s=r-hyp(x+.5-cx,y+.5-cy);if(s<=0)continue;const i=y*MW+x;if(s>DOMS[i]){DOMS[i]=s;DOM[i]=b.o}}}
  const cnt=new Array(NP).fill(0);let land=0;
  for(let i=0;i<N;i++)if(G.terr[i]===0){land++;const d=DOM[i];if(d>=0)cnt[d]++}
  const edges=[];for(let p=0;p<NP;p++)edges.push(msEdges(p));
  domEdges=edges;DOMCNT=cnt;LANDN=land;domDirty=false;mmDirty=true;
}
// contorno suave do território (quadrados em marcha): corta os cantos em diagonal em vez de fazer escadinha.
// cada trecho guarda: ponto A, ponto B e a direção para dentro do território (em quadrados)
const MS_T=[null,[[3,0]],[[0,1]],[[3,1]],[[1,2]],[[3,0],[1,2]],[[0,2]],[[3,2]],[[2,3]],[[0,2]],[[0,1],[2,3]],[[1,2]],[[3,1]],[[0,1]],[[3,0]],null];
function msEdges(o){
  const L=[],v=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH&&DOM[y*MW+x]===o?1:0;
  for(let y=-1;y<MH;y++)for(let x=-1;x<MW;x++){
    const a=v(x,y),b=v(x+1,y),c=v(x+1,y+1),d=v(x,y+1),k=a|b<<1|c<<2|d<<3,segs=MS_T[k];if(!segs)continue;
    const P=[[x+1,y+.5],[x+1.5,y+1],[x+1,y+1.5],[x+.5,y+1]];   // meio das bordas: cima, direita, baixo, esquerda
    const Cn=[[a,x+.5,y+.5],[b,x+1.5,y+.5],[c,x+1.5,y+1.5],[d,x+.5,y+1.5]];
    for(const[i,j]of segs){const A=P[i],B=P[j],mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2;let nx=-(B[1]-A[1]),ny=B[0]-A[0];const l=Math.hypot(nx,ny);nx/=l;ny/=l;
      let best=null,bd=9;for(const q of Cn){if(!q[0])continue;const dd=Math.hypot(q[1]-mx,q[2]-my);if(dd<bd){bd=dd;best=q}}
      if(best&&(best[1]-mx)*nx+(best[2]-my)*ny<0){nx=-nx;ny=-ny}
      L.push(A[0],A[1],B[0],B[1],nx,ny)}}
  return L;
}
const domShare=o=>LANDN?DOMCNT[o]/LANDN:0;

// por que não dá para construir aqui? ('' = pode)
function domWhy(type,tx,ty,o){
  if(o>=NP||!G)return'';const sz=BT[type].sz,need=!NEUTRAL_OK[type];
  for(let y=ty;y<ty+sz;y++)for(let x=tx;x<tx+sz;x++){const d=DOM[y*MW+x];
    if(d>=0&&d<NP&&d!==o)return'⛔ Não dá para construir no território inimigo';
    if(need&&d!==o)return'🚩 Só dentro da sua fronteira (a linha '+(o===0?'azul':'vermelha')+')'}
  if(type==='tc'){const cx=tx+sz/2,cy=ty+sz/2;let n=0;
    for(const b of G.B){if(b.dead||b.type!=='tc')continue;const d=hyp(b.tx+b.sz/2-cx,b.ty+b.sz/2-cy);
      if(b.o===o){n++;if(d<CITY_MIN_OWN)return'🏘 Cidade nova: pelo menos '+CITY_MIN_OWN+' quadrados longe das suas cidades'}
      else if(b.o<NP&&d<CITY_MIN_EN)return'🏘 Cidade nova: pelo menos '+CITY_MIN_EN+' quadrados longe das cidades inimigas'}
    if(n>=cityMax(o))return'🏘 Limite de '+cityMax(o)+' cidades · pesquise Cívica na Biblioteca para fundar mais'}
  return''}

// capital = o primeiro Centro Urbano; se ela cair, a cidade mais antiga vira capital
function ensureCapital(p){
  const P=G.P[p],c=P.capId&&E.get(P.capId);
  if(c&&!c.dead&&c.o===p)return c;
  let best=null;for(const b of G.B){if(b.dead||b.o!==p||b.type!=='tc'||b.done<1)continue;if(!best||b.id<best.id)best=b}
  const had=!!P.capId;P.capId=best?best.id:0;if(best&&had)domDirty=true;
  return best;
}
const isMil=u=>!UT[u.type].civ&&u.type!=='vill'&&u.type!=='pesc'&&u.type!=='trans';
const canCapture=u=>{const k=UT[u.type].cls;return k!=='vill'&&k!=='cerco'&&k!=='sac'&&!UT[u.type].civ&&!isNav(u)};

// Centro Urbano chegou a 0 de vida: não cai, fica derrubado e pode ser tomado
function cityDown(t){
  t.down=1;t.cp=0;
  if(t.o===0){toast('⚠️ Seu Centro Urbano foi derrubado! Mande soldados ou o inimigo toma a cidade.');snd('alert');UI.lastAlert={x:ctr(t).x,y:ctr(t).y,t:G.t}}
  else if(t.o!==0&&t.o<NP&&running)toast('🏰 Centro Urbano inimigo derrubado! Fique perto com soldados para tomar a cidade.');
}
function captureCity(t,no){
  const old=t.o,wasCap=G.P[old].capId===t.id,c=ctr(t),R=infR(t)*TS;
  // no Rise, quem estava guarnecido (eruditos, soldados) sai quando a cidade é
  // conquistada — a cidade nem sempre é destruída, só muda de dono — então ejeta
  // antes de virar a posse, e as unidades continuam do dono antigo (garEject não mexe em u.o)
  if(t.cargo&&t.cargo.length)garEject(t);
  t.o=no;t.down=0;t.cp=0;t.imm=G.t+CAPT_IMM;t.q=[];t.qt=0;t.wait=false;t.rally=null;
  // a cidade vem junto: prédios do antigo dono dentro do raio dela mudam de lado
  for(const b of G.B){if(b.dead||b.o!==old||b===t||b.type==='tc'||b.type==='maravilha')continue;const bc=ctr(b);if(hyp(bc.x-c.x,bc.y-c.y)>R)continue;
    for(const u of G.U)if(!u.dead&&u.o===old&&(u.tg===b.id||u.lastRes===b.id)){releaseFarm(u);u.st='idle';u.tg=0;u.lastRes=0;u.path=null}
    if(b.cargo&&b.cargo.length)garEject(b);
    b.o=no;b.q=[];b.qt=0;b.wait=false;b.rally=null;if(b.wk)b.wk=0}
  for(const b of G.B)if(!b.dead&&b.o===no){const nh=bldMaxHp(b);if(nh!==b.mhp){b.hp=Math.min(nh,Math.round(b.hp*nh/b.mhp));b.mhp=nh}}
  t.hp=Math.round(t.mhp*.3);
  G.st.city[no]++;
  if(wasCap){G.P[old].pen=G.t+CAP_PEN;G.P[old].capId=0;ensureCapital(old)}
  ensureCapital(no);domDirty=true;mmDirty=true;recountPop();G.dirty=true;
  if(no===0){toast('🏰 Você tomou uma cidade inimiga!');snd('age')}
  else if(old===0){toast(wasCap?'👑 Sua capital foi tomada! Coleta 25% mais lenta por 2 minutos.':'⚠️ O inimigo tomou uma das suas cidades!');snd('alert')}
}
// roda a cada meio segundo: tomada de cidades, recuperação e atrito
function updCities(dt){
  for(let p=0;p<NP;p++)ensureCapital(p);
  for(const t of G.B){if(t.dead||t.type!=='tc'||t.done<1)continue;
    if(!t.down){if(t.hp>0)continue;cityDown(t)}
    const c=ctr(t),R=(CAPT_R+t.sz/2)*TS;let att=0,ao=-1,def=0;
    for(const u of G.U){if(u.dead||u.inT||u.o>=NP||!canCapture(u))continue;if(hyp(u.x-c.x,u.y-c.y)>R)continue;if(u.o===t.o)def++;else{att++;ao=u.o}}
    if(att&&!def&&!(t.imm>G.t)){t.cp=(t.cp||0)+dt;t.cpo=ao;if(t.cp>=CAPT_T)captureCity(t,ao)}
    else{t.cp=Math.max(0,(t.cp||0)-dt*.5);
      if(!att){t.hp=Math.min(t.mhp,t.hp+t.mhp*.01*dt);if(t.hp>=t.mhp*.25){t.down=0;t.cp=0;if(t.o===0)toast('🏛 Seu Centro Urbano voltou a funcionar.')}}}}
  // atrito: quem fica no território inimigo vai perdendo vida aos poucos (nunca morre disso)
  for(const u of G.U){if(u.dead||u.inT||u.o>=NP||isNav(u))continue;const d=DOM[tileOf(u.x,u.y)];
    if(d>=0&&d!==u.o&&!(u.sup>G.t)){u.att=(u.att||0)+dt;if(u.att>ATTR_DELAY){const mh=ST(u).hp,fl=mh*ATTR_FLOOR;if(u.hp>fl)u.hp=Math.max(fl,u.hp-mh*ATTR_RATE*dt*Math.max(.25,1-.12*((G.P[u.o]&&G.P[u.o].mil)||0)))}}
    else if(u.att)u.att=0}
}
