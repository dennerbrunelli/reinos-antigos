
// =========================================================
//   MAPA
// =========================================================
function blob(cx,cy,r,fn){
  const p1=RNG()*6,p2=RNG()*6,a1=.22+RNG()*.15,a2=.08+RNG()*.12;
  for(let y=Math.floor(cy-r*1.5);y<=cy+r*1.5;y++)for(let x=Math.floor(cx-r*1.5);x<=cx+r*1.5;x++){
    if(!inMap(x,y))continue;const dx=x-cx,dy=y-cy,a=Math.atan2(dy,dx);
    const rr=r*(1+a1*Math.sin(a*3+p1)+a2*Math.sin(a*5+p2));
    if(dx*dx+dy*dy<=rr*rr)fn(x,y,Math.sqrt(dx*dx+dy*dy)/rr);
  }
}
const SPIRAL=(()=>{const a=[];for(let y=-20;y<=20;y++)for(let x=-20;x<=20;x++)a.push([x,y,x*x+y*y]);a.sort((p,q)=>p[2]-q[2]);return a})();
function mkPlayer(civ){return{civ,res:{food:200,wood:200,gold:100,wealth:50,know:0,oil:0},age:0,mil:0,cap:0,pop:0,techs:[],ai:null}}
function newGame(o){
  const seed=(Math.random()*1e9)|0;RNG=mulberry32(seed);
  if(o.map==='rand'||!MAPS[o.map]){const L=MAP_ORD.filter(k=>k!=='arena');o=Object.assign({},o,{map:L[(Math.random()*L.length)|0]})}
  setMapSize((MAPSZ[o.size]||MAPSZ.med).s);const MP=mapSpec(o.map),S=MW/72,A=S*S;
  // NP = jogadores reais nesta partida (2 a MAX_PLAYERS), limitado pelo que o tamanho do mapa recomenda (MAPSZ.pl)
  NP=clamp(Math.round(o.np||2),2,Math.min(MAX_PLAYERS,(MAPSZ[o.size]||MAPSZ.med).pl||2));
  const civs=[o.civ];
  for(let p=1;p<NP;p++){
    const want=o.ais?o.ais[p-1]:(p===1?o.ai:null);
    const free=CIVS.filter(c=>!civs.includes(c.id)),pool=free.length?free:CIVS;// sorteia sem repetir povo
    civs.push(want&&want!=='rand'&&CIVS.some(c=>c.id===want)?want:pool[(RNG()*pool.length)|0].id);
  }
  const z=()=>new Array(NP).fill(0);
  G={v:2,seed,diff:o.diff,map:o.map,t:0,nid:1,U:[],B:[],R:[],pj:[],fx:[],carc:{},terr:new Array(N).fill(0),exp:new Array(N).fill(0),
     P:civs.map(mkPlayer),st:{kill:z(),lost:z(),gath:z(),city:z()},won:z(),tw:z(),over:false,mw:MW,size:o.size||'med',dryB:MP.dry||0};
  E=new Map();occ.fill(0);STAT=[];MODS=[];
  for(let p=0;p<NP;p++)recompute(p);
  const starts=NP===2?[[12,MH-13],[MW-13,12]]:genStarts(NP,13);G.starts=starts;
  const far=(x,y,d)=>starts.every(s=>hyp(s[0]-x,s[1]-y)>d);
  // água: cada mapa desenha a sua
  MP.water(S,starts,far);
  // tira pocinhas de 1 quadrado
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=idx(x,y);if(!G.terr[i])continue;let n=0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])if(inMap(x+a,y+b)&&G.terr[idx(x+a,y+b)])n++;if(n<=1)G.terr[i]=0}
  for(let i=0;i<N;i++){pass[i]=G.terr[i]===1?0:1;wpass[i]=G.terr[i]?1:0}   // terr 2 = vau (raso): passa gente e barco
  const noRes=new Uint8Array(N);
  for(const s of starts)for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++)if(inMap(s[0]+x,s[1]+y)&&x*x+y*y<=27)noRes[idx(s[0]+x,s[1]+y)]=1;
  const wdist=waterDist();
  const canRes=(x,y)=>inMap(x,y)&&G.terr[idx(x,y)]===0&&occ[idx(x,y)]===0&&!noRes[idx(x,y)];
  const AMT={tree:90,berry:150,gold:400,stone:350};const RT={tree:'wood',berry:'food',gold:'gold',stone:'stone'};
  const put=(sub,x,y)=>{if(!canRes(x,y))return false;const i=idx(x,y);const r={id:G.nid++,k:'r',rt:RT[sub],sub,tx:x,ty:y,amt:AMT[sub],v:(RNG()*3)|0};
    if(sub==='tree'&&wdist[i]<=2&&RNG()<.75)r.v=3;G.R.push(r);E.set(r.id,r);occ[i]=r.id;pass[i]=0;return true};
  const cluster=(sub,cx,cy,n)=>{let c=0;for(const[dx,dy]of SPIRAL){if(c>=n)break;if(put(sub,Math.round(cx)+dx,Math.round(cy)+dy))c++}};
  const at=(s,ang,d)=>{for(let i=0;i<24;i++){const a=ang+i*.45;const x=s[0]+Math.cos(a)*d,y=s[1]+Math.sin(a)*d;if(x>3&&y>3&&x<MW-4&&y<MH-4&&!G.terr[idx(x|0,y|0)])return[x,y]}return[s[0]+d*.7,s[1]-d*.7]};
  for(const s of starts){
    const a0=RNG()*Math.PI*2;
    let p=at(s,a0,6.5);cluster('berry',p[0],p[1],6);
    p=at(s,a0+1.9,9);cluster('gold',p[0],p[1],5);
    p=at(s,a0+3.4,10);cluster('stone',p[0],p[1],4);// vira minério de metal (o Rise não tem pedra)
    p=at(s,a0+4.8,9);blob(p[0],p[1],3,(x,y)=>{if(RNG()<.9)put('tree',x,y)});
    p=at(s,a0+2.7,14);blob(p[0],p[1],2.6,(x,y)=>{if(RNG()<.85)put('tree',x,y)});
    p=at(s,a0+.9,17);cluster('gold',p[0],p[1],4);
  }
  for(let k=0;k<Math.round(20*A*(MP.fo??1));k++)for(let tr=0;tr<40;tr++){const cx=3+RNG()*(MW-6),cy=3+RNG()*(MH-6);if(!far(cx,cy,10)||G.terr[idx(cx|0,cy|0)])continue;blob(cx,cy,2+RNG()*3.5,(x,y,d)=>{if(RNG()<1.05-d*.35)put('tree',x,y)});break}
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const e=Math.min(x,y,MW-1-x,MH-1-y);if(e===0&&RNG()<.85||e===1&&RNG()<.45||e===2&&RNG()<.12)put('tree',x,y)}
  const extra=(sub,cnt,n,d)=>{for(let k=0;k<cnt;k++)for(let tr=0;tr<50;tr++){const cx=5+RNG()*(MW-10),cy=5+RNG()*(MH-10);if(!far(cx,cy,d)||G.terr[idx(cx|0,cy|0)])continue;cluster(sub,cx,cy,n);break}};
  extra('gold',Math.round(4*A*(MP.go??1)),4,15);extra('stone',Math.round(4*A*(MP.go??1)),3,15);extra('berry',Math.round(4*A*(MP.be??1)),5,13);
  // peixes
  const fish=(x,y,deep)=>{const i=idx(x,y);if(!G.terr[i]||occ[i])return false;const r={id:G.nid++,k:'r',rt:'food',sub:'fish',tx:x,ty:y,amt:deep?300:200,deep:deep?1:0,v:(RNG()*2)|0};G.R.push(r);E.set(r.id,r);occ[i]=r.id;return true};
  const shore=[],deep=[];
  for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){const i=idx(x,y);if(!G.terr[i])continue;if(wdist[i]===0){let land=false,deepw=true;for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){if(!inMap(x+a,y+b))continue;if(!G.terr[idx(x+a,y+b)]){deepw=false;if(Math.abs(a)+Math.abs(b)===1)land=true}}if(land)shore.push([x,y]);else if(deepw)deep.push([x,y])}}
  const pickFrom=(arr,n,ok)=>{let c=0;for(let tr=0;tr<n*30&&c<n&&arr.length;tr++){const p=arr[(RNG()*arr.length)|0];if(ok&&!ok(p))continue;let near=false;for(const r of G.R)if(r.sub==='fish'&&hyp(r.tx-p[0],r.ty-p[1])<3){near=true;break}if(near)continue;if(fish(p[0],p[1],arr===deep))c++}};
  for(const s of starts)pickFrom(shore,3,p=>hyp(p[0]-s[0],p[1]-s[1])<20);
  {const wet=['mar','ilhas','litoral','delta','lagos'].includes(o.map);pickFrom(shore,Math.round((wet?9:6)*A));pickFrom(deep,Math.round((wet?12:3)*A))}
  // animais
  const spawnA=(type,x,y)=>{x=Math.round(x);y=Math.round(y);if(!inMap(x,y)||!pass[idx(x,y)]||noRes[idx(x,y)])return;spawnUnit(type,GAIA,(x+.5)*TS,(y+.5)*TS)};
  const herd=(type,cx,cy,n)=>{let c=0;for(const[dx,dy]of SPIRAL){if(c>=n)break;const x=Math.round(cx)+dx*2,y=Math.round(cy)+dy*2;if(inMap(x,y)&&pass[idx(x,y)]&&!noRes[idx(x,y)]){spawnA(type,x,y);c++}}};
  for(const s of starts){const a=RNG()*6.28;let p=at(s,a,11);herd('gaz',p[0],p[1],5);p=at(s,a+3.1,18);spawnA('elfs',p[0],p[1]);p=at(s,a+1.6,21);spawnA('leao',p[0],p[1]);p=at(s,a+4.4,23);spawnA('leao',p[0],p[1])}
  for(let k=0;k<Math.round(4*A*(MP.an??1));k++)for(let tr=0;tr<40;tr++){const cx=5+RNG()*(MW-10),cy=5+RNG()*(MH-10);if(!far(cx,cy,15)||!pass[idx(cx|0,cy|0)])continue;herd('gaz',cx,cy,3+(RNG()*2|0));break}
  for(let k=0;k<Math.round(3*A*(MP.an??1));k++)for(let tr=0;tr<40;tr++){const cx=5+RNG()*(MW-10),cy=5+RNG()*(MH-10);if(!far(cx,cy,18)||!pass[idx(cx|0,cy|0)])continue;spawnA(k?'elfs':'leao',cx,cy);break}
  for(let i=1;i<starts.length;i++)ensurePath(starts[0],starts[i]);
  for(let p=0;p<NP;p++){
    const s=starts[p];G.P[p].capId=placeBld('tc',p,s[0]-1,s[1]-1,true).id;
    for(let i=0;i<3;i++)spawnUnit('vill',p,(s[0]-1+i+.5)*TS,(s[1]+2.5)*TS);
    spawnUnit('bat',p,(s[0]+2.5)*TS,(s[1]+1.5)*TS);
  }
  // detalhes do mapa (florestas fechadas, anel de ouro, serras, muralhas da Arena) e caminho garantido entre as bases
  if(MP.extra){MP.extra({put,cluster,blob,st:starts,far});for(let i=1;i<starts.length;i++)ensurePath(starts[0],starts[i])}
  // times: 'ffa' todos contra todos · 't2' dois times (você + metade das IAs) · 'vs' todas as IAs juntas contra você
  G.rel=[];for(let p=0;p<NP;p++)G.rel.push(new Array(NP).fill(0));
  {const tm=o.times||'ffa',team=p=>tm==='vs'?(p?1:0):tm==='t2'?p%2:p;// 't2': você (0) com 2,4,6 contra 1,3,5,7
    for(let a=0;a<NP;a++)for(let b=0;b<NP;b++)if(a!==b&&team(a)===team(b))G.rel[a][b]=1}
  for(let p=1;p<NP;p++)G.P[p].ai={nextAtk:DIFF[o.diff].first,wave:DIFF[o.diff].wave,atk:false,threat:0};
  recountPop();
}
function waterDist(){
  const dw=new Uint8Array(N).fill(99),q=[];for(let i=0;i<N;i++)if(G.terr[i]){dw[i]=0;q.push(i)}
  for(let h=0;h<q.length;h++){const c=q[h],cx=c%MW,cy=c/MW|0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+a,ny=cy+b;if(!inMap(nx,ny))continue;const ni=idx(nx,ny);if(dw[ni]>dw[c]+1){dw[ni]=dw[c]+1;q.push(ni)}}}
  return dw;
}
function ensurePath(a,b){
  const seen=new Uint8Array(N),q=[idx(a[0],a[1])];seen[q[0]]=1;
  for(let h=0;h<q.length;h++){const c=q[h],cx=c%MW,cy=c/MW|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(!inMap(nx,ny))continue;const ni=idx(nx,ny);if(seen[ni]||!pass[ni])continue;seen[ni]=1;q.push(ni)}}
  if(seen[idx(b[0],b[1])])return;
  // abre um caminho dando a volta pelo canto (longe do mar)
  const mid=[a[0]<MW/2?6:MW-7,b[1]<MH/2?6:MH-7];
  for(const[p,q2]of[[a,mid],[mid,b]]){const n=Math.ceil(hyp(q2[0]-p[0],q2[1]-p[1]));
    for(let i=0;i<=n;i++){const x=Math.round(p[0]+(q2[0]-p[0])*i/n),y=Math.round(p[1]+(q2[1]-p[1])*i/n);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(!inMap(X,Y))continue;const j=idx(X,Y);
        if(occ[j]){const r=E.get(occ[j]);if(r&&r.k==='r'){r.dead=true;E.delete(r.id);occ[j]=0}}
        G.terr[j]=0;pass[j]=1;wpass[j]=0}}}
  G.R=G.R.filter(r=>!r.dead);
}

// =========================================================
//   ENTIDADES
// =========================================================
function spawnUnit(type,o,x,y){
  const u={id:G.nid++,k:'u',type,o,x,y,hp:0,st:'idle',tg:0,goal:null,path:null,pi:0,np:false,mv:false,cd:0,face:1,carry:0,ct:'',lastRes:0,lsub:'',fail:0,rp:0,scan:Math.random()*.5,an:Math.random()*6,stt:0,lpx:x,lpy:y,stk:0};
  u.hp=ST(u).hp;
  if(type==='sac')u.faith=100;
  if(UT[type].cap)u.cargo=[];
  if(o===GAIA){u.wt=5+Math.random()*10;u.hx=x;u.hy=y}
  G.U.push(u);E.set(u.id,u);return u;
}
function placeBld(type,o,tx,ty,done){
  const T=BT[type];
  const b={id:G.nid++,k:'b',type,o,tx,ty,sz:T.sz,hp:1,mhp:T.hp,done:done?1:0,q:[],qt:0,rally:null,cd:0,wait:false};
  b.mhp=bldMaxHp(b);b.hp=done?b.mhp:1;
  if(type==='fazenda'){b.food=FARMFOOD+(MODS[o]?MODS[o].farmFood:0);b.wk=0}
  G.B.push(b);E.set(b.id,b);markBld(b,true);
  if(!T.walk&&!T.water)for(const u of G.U){if(u.dead||u.inT||isNav(u))continue;const ux=u.x/TS,uy=u.y/TS;if(ux>=tx&&ux<tx+b.sz&&uy>=ty&&uy<ty+b.sz){const p=freeAround(b,null,false);u.x=p.x;u.y=p.y;u.path=null;u.np=u.mv}}
  return b;
}
function markBld(b,on){
  const T=BT[b.type];
  for(let y=b.ty;y<b.ty+b.sz;y++)for(let x=b.tx;x<b.tx+b.sz;x++){const i=idx(x,y);occ[i]=on?b.id:0;
    if(T.water)wpass[i]=on?0:1;else pass[i]=on?(T.walk?1:0):(G.terr[i]===0?1:0)}
}
function freeAround(b,near,naval){
  const PA=naval?wpass:pass;let best=null,bd=1e9;
  for(let r=1;r<7&&!best;r++){
    for(let y=b.ty-r;y<b.ty+b.sz+r;y++)for(let x=b.tx-r;x<b.tx+b.sz+r;x++){
      if(x>b.tx-r&&x<b.tx+b.sz+r-1&&y>b.ty-r&&y<b.ty+b.sz+r-1)continue;
      if(!inMap(x,y)||!PA[idx(x,y)])continue;
      const px=(x+.5)*TS,py=(y+.5)*TS;const d=near?hyp(px-near.x,py-near.y):-(x+y)+RNG()*.1;
      if(d<bd){bd=d;best={x:px,y:py}}
    }
  }
  return best||{x:(b.tx+b.sz+.5)*TS,y:(b.ty+b.sz+.5)*TS};
}
function kill(e,by){
  if(e.dead)return;
  e.dead=true;E.delete(e.id);G.dirty=true;killSnd(e);
  if(e.k==='u'){
    if(e.o<NP){G.st.lost[e.o]++;if(by!=null&&by<NP&&by!==e.o)G.st.kill[by]++}
    G.fx.push({k:'corpse',x:e.x,y:e.y,t:0,o:e.o,ty:e.type,sk:(e.type==='guer'&&ST(e).axe?'guerA':e.type),fc:e.face});releaseFarm(e);
    if(e.cargo)for(const id of e.cargo){const c=E.get(id);if(c){c.inT=0;kill(c,by)}}
    if(e.o===GAIA&&UT[e.type].food){const c={id:G.nid++,k:'r',rt:'food',sub:'carc',walk:1,x:e.x,y:e.y,tx:e.x/TS|0,ty:e.y/TS|0,amt:UT[e.type].food,of:e.type};G.R.push(c);E.set(c.id,c);G.carc[e.id]=c.id}
    if(isNav(e))G.fx.push({k:'splash',x:e.x,y:e.y,t:0});
  }
  if(e.k==='b'){markBld(e,false);if(e.type==='tc'||e.type==='torre')domDirty=true;G.fx.push({k:'rubble',x:e.tx*TS,y:e.ty*TS,s:e.sz,t:0,w:!!BT[e.type].water});if(by!=null&&by<2&&by!==e.o)G.st.kill[by]++;mmDirty=true;recountPop()}
  if(e.k==='r'&&!e.walk){const i=idx(e.tx,e.ty);occ[i]=0;if(!G.terr[i])pass[i]=1;mmDirty=true;if(e.sub==='tree')stumpAt(e.tx,e.ty)}
}
function popCap(p){const P=G.P[p];return Math.min(POP_MIL,POP_BASE+POP_STEP*(P.mil||0))+(G.B.some(b=>!b.dead&&b.o===p&&b.type==='maravilha'&&b.done>=1)?POP_WONDER:0)}
function recountPop(){
  for(let p=0;p<NP;p++){G.P[p].cap=popCap(p);let pop=0;for(const u of G.U)if(!u.dead&&u.o===p)pop++;G.P[p].pop=pop}
}

// =========================================================
//   CAMINHOS (A*)
// =========================================================
let gS=new Float32Array(N),fr=new Int32Array(N),stp=new Uint32Array(N),cls=new Uint32Array(N);let stamp=0;
let HP=new Int32Array(N*8),HF=new Float32Array(N*8);let hn=0;
function hswap(a,b){let t=HP[a];HP[a]=HP[b];HP[b]=t;let f=HF[a];HF[a]=HF[b];HF[b]=f}
function hpush(i,f){let k=hn++;HP[k]=i;HF[k]=f;while(k>0){const p=(k-1)>>1;if(HF[p]<=HF[k])break;hswap(p,k);k=p}}
function hpop(){const top=HP[0];hn--;if(hn>0){HP[0]=HP[hn];HF[0]=HF[hn];let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<hn&&HF[l]<HF[m])m=l;if(r<hn&&HF[r]<HF[m])m=r;if(m===k)break;hswap(m,k);k=m}}return top}
const DIRS=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
function astar(sx,sy,goal,maxIt,PA){
  stamp++;hn=0;
  const si=idx(sx,sy),isR=goal.rw!=null;
  const hx=isR?goal.rx+goal.rw/2-.5:goal.gx,hy=isR?goal.ry+goal.rh/2-.5:goal.gy;
  const H=(x,y)=>{const dx=Math.abs(x-hx),dy=Math.abs(y-hy);return Math.max(dx,dy)+.414*Math.min(dx,dy)};
  const isG=isR?(x,y)=>x>=goal.rx-1&&x<=goal.rx+goal.rw&&y>=goal.ry-1&&y<=goal.ry+goal.rh:(x,y)=>x===goal.gx&&y===goal.gy;
  gS[si]=0;fr[si]=-1;stp[si]=stamp;hpush(si,H(sx,sy));
  let best=si,bh=1e9,it=0,ok=false;
  while(hn>0&&it++<maxIt){
    const c=hpop();if(cls[c]===stamp)continue;cls[c]=stamp;
    const cx=c%MW,cy=(c/MW)|0;
    if(isG(cx,cy)&&(c===si||PA[c])){best=c;ok=true;break}
    const h=H(cx,cy);if(h<bh){bh=h;best=c}
    for(let k=0;k<8;k++){const d=DIRS[k];const nx=cx+d[0],ny=cy+d[1];
      if(nx<0||ny<0||nx>=MW||ny>=MH)continue;const ni=ny*MW+nx;if(!PA[ni]||cls[ni]===stamp)continue;
      if(k>3&&(!PA[cy*MW+nx]||!PA[ny*MW+cx]))continue;
      const g=gS[c]+d[2];if(stp[ni]===stamp&&g>=gS[ni])continue;
      stp[ni]=stamp;gS[ni]=g;fr[ni]=c;hpush(ni,g+H(nx,ny)*1.05);}
  }
  const path=[];let c=best;while(c!==si&&c>=0){path.push(c);c=fr[c]}path.reverse();
  return{path,ok};
}
function lineClear(x0,y0,x1,y1,PA){
  const d=hyp(x1-x0,y1-y0),n=Math.ceil(d/8);if(n<1)return true;
  const nx=-(y1-y0)/d*6,ny=(x1-x0)/d*6;
  for(let i=1;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;
    if(!PA[tileOf(x,y)]||!PA[tileOf(x+nx,y+ny)]||!PA[tileOf(x-nx,y-ny)])return false}
  return true;
}
function computePath(u){
  const g=u.goal,PA=passFor(u);const sx=clamp(u.x/TS|0,0,MW-1),sy=clamp(u.y/TS|0,0,MH-1);
  let goal;
  if(g.rw!=null)goal=g;
  else{const gx=clamp(g.x/TS|0,0,MW-1),gy=clamp(g.y/TS|0,0,MH-1);goal=PA[idx(gx,gy)]?{gx,gy}:{rx:gx,ry:gy,rw:1,rh:1}}
  const r=astar(sx,sy,goal,4000,PA);u.pok=r.ok;
  const pts=[];for(const i of r.path){pts.push(((i%MW)+.5)*TS,((i/MW|0)+.5)*TS)}
  if(r.ok&&g.rw==null&&PA[tileOf(g.x,g.y)]){if(pts.length){pts[pts.length-2]=g.x;pts[pts.length-1]=g.y}else pts.push(g.x,g.y)}
  const out=[];let cx=u.x,cy=u.y,i=0;const n=pts.length/2;
  while(i<n){let j=Math.min(n-1,i+10);while(j>i&&!lineClear(cx,cy,pts[j*2],pts[j*2+1],PA))j--;out.push(pts[j*2],pts[j*2+1]);cx=pts[j*2];cy=pts[j*2+1];i=j+1}
  u.path=out;u.pi=0;
}

// =========================================================
//   ORDENS
// =========================================================
function setGoal(u,goal){u.goal=goal;u.path=null;u.pi=0;u.np=true;u.mv=true;u.stt=0;u.stk=0;u.lpx=u.x;u.lpy=u.y}
function goalFor(e){
  if(e.k==='b'){if(BT[e.type].walk)return{x:(e.tx+e.sz/2)*TS,y:(e.ty+e.sz/2)*TS};return{rx:e.tx,ry:e.ty,rw:e.sz,rh:e.sz}}
  if(e.k==='r'){if(e.walk)return{x:e.x,y:e.y};return{rx:e.tx,ry:e.ty,rw:1,rh:1}}
  return{x:e.x,y:e.y};
}
function farmTaken(b,u){const w=b.wk&&E.get(b.wk);if(!w||w.dead||w===u)return false;return(w.st==='gather'&&w.tg===b.id)||(w.st==='return'&&w.lastRes===b.id)}
function releaseFarm(u){if(u.st==='gather'){const f=E.get(u.tg);if(f&&f.k==='b'&&f.wk===u.id)f.wk=0}}
function reset(u){releaseFarm(u);u.cv=0}
function orderMove(u,x,y){reset(u);u.st='move';u.tg=0;setGoal(u,{x,y})}
function orderAttack(u,t){if(!t||t.dead||ally(t.o,u.o))return;reset(u);u.auto=0;u.st='attack';u.tg=t.id;u.mv=false;u.rp=0;u.fail=0}
function canGather(u,r){
  if(u.type==='pesc')return r.k==='r'&&r.sub==='fish';
  if(u.type!=='vill')return false;
  if(r.k==='u')return r.o===GAIA&&UT[r.type].food>0;
  if(r.k==='b')return r.type==='fazenda';
  return true;
}
function lsubOf(r){return r.k==='u'?r.type:r.k==='b'?'farm':r.sub}
function orderGather(u,r){
  if(!canGather(u,r)){const c=ctr(r);orderMove(u,c.x,c.y);return false}
  reset(u);
  if(r.k==='b'){if(farmTaken(r,u))return false;r.wk=u.id}
  u.st='gather';u.tg=r.id;u.lastRes=r.id;u.lsub=lsubOf(r);if(r.k==='u')u.hunt=r.type;else if(r.sub==='carc')u.hunt=r.of;u.mv=false;u.fail=0;return true;
}
function orderBuild(u,b){if(u.type!=='vill')return;reset(u);u.st='build';u.tg=b.id;u.mv=false;u.fail=0}
function orderStop(u){reset(u);u.st='idle';u.tg=0;u.mv=false;u.path=null}
function orderReturn(u,d){reset(u);u.st='return';u.tg=d.id;u.mv=false;u.fail=0}
function orderConvert(u,t){if(!t||ally(t.o,u.o)||t.o===GAIA||t.k!=='u')return;reset(u);u.st='convert';u.tg=t.id;u.mv=false;u.fail=0}
function orderHeal(u,t){reset(u);u.st='heal';u.tg=t.id;u.mv=false;u.fail=0}
function orderBoard(u,boat){if(isNav(u))return;reset(u);u.st='board';u.tg=boat.id;u.mv=false;u.fail=0}
function orderUnload(b,x,y){reset(b);b.st='unload';b.tg=0;b.ux=x;b.uy=y;setGoal(b,{rx:clamp(x/TS|0,0,MW-1),ry:clamp(y/TS|0,0,MH-1),rw:1,rh:1})}
function groupMove(us,x,y){
  for(const nav of[false,true]){
    const g=us.filter(u=>isNav(u)===nav);if(!g.length)continue;const PA=nav?wpass:pass;
    const tx=clamp(x/TS|0,0,MW-1),ty=clamp(y/TS|0,0,MH-1);let k=0;
    const sorted=g.slice().sort((a,b)=>hyp(a.x-x,a.y-y)-hyp(b.x-x,b.y-y));
    for(const[dx,dy]of SPIRAL){if(k>=sorted.length)break;const X=tx+dx,Y=ty+dy;if(!inMap(X,Y)||!PA[idx(X,Y)])continue;
      const u=sorted[k++];const exact=k===1&&PA[idx(tx,ty)];orderMove(u,exact?x:(X+.5)*TS,exact?y:(Y+.5)*TS)}
  }
}
// ordem "inteligente": o que fazer quando toca/aperta A em algo
function smartOrder(us,tgt,x,y,o){
  if(!us.length)return;
  const land=us.filter(u=>!isNav(u)),nav=us.filter(u=>isNav(u));
  if(tgt&&tgt.k==='u'&&!ally(tgt.o,o)&&tgt.o!==GAIA){
    for(const u of us){const T=ST(u);if(u.type==='sac')orderConvert(u,tgt);else if(T.atk>0&&!(isNav(u)&&!T.war))orderAttack(u,tgt);else if(!isNav(u))orderMove(u,tgt.x,tgt.y)}return'atk'}
  if(tgt&&tgt.k==='b'&&!ally(tgt.o,o)){for(const u of us){const T=ST(u);if(T.atk>0&&u.type!=='sac'&&!(isNav(u)&&!T.war))orderAttack(u,tgt)}return'atk'}
  if(tgt&&tgt.k==='u'&&tgt.o===GAIA){for(const u of land){if(u.type==='vill'&&UT[tgt.type].food)orderGather(u,tgt);else if(ST(u).atk>0)orderAttack(u,tgt);else orderMove(u,tgt.x,tgt.y)}return'atk'}
  if(tgt&&tgt.k==='u'&&tgt.o===o){
    if(tgt.type==='trans'&&land.length){land.forEach(u=>orderBoard(u,tgt));return'own'}
    const pr=us.filter(u=>u.type==='sac');if(pr.length&&tgt.hp<ST(tgt).hp){pr.forEach(u=>orderHeal(u,tgt));return'own'}
  }
  if(tgt&&tgt.k==='r'){
    for(const u of us){if(canGather(u,tgt))orderGather(u,tgt);else{const c=ctr(tgt);groupMove([u],c.x,c.y)}}return'res'}
  if(tgt&&tgt.k==='b'&&tgt.o===o){
    const vs=land.filter(u=>u.type==='vill'),ms=land.filter(u=>u.type!=='vill');
    if(tgt.done<1||tgt.hp<tgt.mhp)vs.forEach(u=>orderBuild(u,tgt));
    else if(tgt.type==='fazenda'){let got=false;for(const u of vs){if(!got&&orderGather(u,tgt)!==false)got=true;else{const c=ctr(tgt);orderMove(u,c.x,c.y)}}}
    else if(BT[tgt.type].drop){for(const u of vs){if(u.carry>0&&BT[tgt.type].drop.includes(u.ct))orderReturn(u,tgt);else{const p=freeAround(tgt,u,false);orderMove(u,p.x,p.y)}}}
    else{const p=freeAround(tgt,null,false);groupMove(vs,p.x,p.y)}
    if(ms.length){const p=freeAround(tgt,null,false);groupMove(ms,p.x,p.y)}
    if(nav.length){if(tgt.type==='doca')nav.forEach(u=>{if(u.carry>0)orderReturn(u,tgt);else{const p=freeAround(tgt,u,true);orderMove(u,p.x,p.y)}});else{const c=ctr(tgt);groupMove(nav,c.x,c.y)}}
    return'own';
  }
  const water=G.terr[tileOf(x,y)]===1;
  if(nav.length){
    if(!water){for(const b of nav){if(b.cargo&&b.cargo.length)orderUnload(b,x,y);else groupMove([b],x,y)}}
    else groupMove(nav,x,y);
  }
  if(land.length)groupMove(land,x,y);
  return'move';
}

// =========================================================
//   UNIDADES
// =========================================================
function faceTo(u,x,y){const d=(x-u.x)-(y-u.y);if(Math.abs(d)>1.5)u.face=d>0?1:-1}
function moveAlong(u,dt){
  if(u.np){if(pathBudget<=0)return false;pathBudget--;u.np=false;computePath(u)}
  if(!u.path)return true;
  u.stt+=dt;if(u.stt>1){if(hyp(u.x-u.lpx,u.y-u.lpy)<5){u.stk++;if(u.stk>3)return true;u.np=true}u.stt=0;u.lpx=u.x;u.lpy=u.y}
  let step=ST(u).spd*TS*dt*(u.fleeT>0?1.8:1)*seasonSpd(u)*ronSpd(u);
  while(step>0){
    if(u.pi>=u.path.length)return true;
    const tx=u.path[u.pi],ty=u.path[u.pi+1];const dx=tx-u.x,dy=ty-u.y,d=hyp(dx,dy);
    faceTo(u,tx,ty);
    if(d<=step){u.x=tx;u.y=ty;u.pi+=2;step-=d}else{u.x+=dx/d*step;u.y+=dy/d*step;step=0}
  }
  u.an+=dt*10;
  return u.pi>=u.path.length;
}
function distTo(u,e){
  if(e.k==='u'||(e.k==='r'&&e.walk))return hyp(u.x-e.x,u.y-e.y);
  let rx,ry,rw;if(e.k==='b'){rx=e.tx*TS;ry=e.ty*TS;rw=e.sz*TS}else{rx=e.tx*TS;ry=e.ty*TS;rw=TS}
  const dx=Math.max(rx-u.x,0,u.x-(rx+rw)),dy=Math.max(ry-u.y,0,u.y-(ry+rw));return hyp(dx,dy);
}
function inReach(u,e,reach){
  if(e.k==='b'&&BT[e.type].walk)return u.x>e.tx*TS+2&&u.x<(e.tx+e.sz)*TS-2&&u.y>e.ty*TS+2&&u.y<(e.ty+e.sz)*TS-2;
  return distTo(u,e)<=reach;
}
function approach(u,e,dt,reach){
  if(inReach(u,e,reach)){if(u.mv){u.mv=false;u.path=null}u.fail=0;return true}
  if(!u.mv){setGoal(u,goalFor(e))}
  else if(e.k==='u'){u.rp-=dt;if(u.rp<=0){u.rp=.8;const g=u.goal;if(g&&g.x!=null&&hyp(g.x-e.x,g.y-e.y)>TS*.8)setGoal(u,goalFor(e))}}
  if(moveAlong(u,dt)){u.mv=false;if(!inReach(u,e,reach)){u.fail++;
    // caminho bloqueado por muralha/prédio inimigo: ataca o que está no caminho
    if(u.st==='attack'&&!u.pok&&u.o<NP&&ST(u).atk>0){let bb=null,bd=4*TS;for(const b of G.B){if(b.dead||ally(b.o,u.o))continue;const d=distTo(u,b);if(d<bd){bd=d;bb=b}}if(bb&&bb!==e){u.tg=bb.id;u.fail=0}}}}
  return false;
}
function findRes(sub,x,y,maxD,o){
  let best=null,bd=maxD*TS;
  if(sub==='farm'){for(const b of G.B){if(b.dead||b.o!==o||b.type!=='fazenda'||b.done<1)continue;if(farmTaken(b,null))continue;const c=ctr(b),d=hyp(c.x-x,c.y-y);if(d<bd){bd=d;best=b}}return best}
  if(UT[sub]){for(const a of G.U){if(a.dead||a.o!==GAIA||a.type!==sub)continue;const d=hyp(a.x-x,a.y-y);if(d<bd){bd=d;best=a}}return best}
  for(const r of G.R){if(r.dead||r.sub!==sub||(r.bad&&G.t-r.bad<120))continue;const c=ctr(r),d=hyp(c.x-x,c.y-y);if(d<bd){bd=d;best=r}}
  return best;
}
function findDrop(o,rt,x,y,skip,naval){
  let best=null,bd=1e9;
  for(const b of G.B){if(b.dead||b.o!==o||b.done<1||b.id===skip)continue;const T=BT[b.type];
    if(naval?!(T.dropN&&T.dropN.includes(rt)):!(T.drop&&T.drop.includes(rt)))continue;const c=ctr(b),d=hyp(c.x-x,c.y-y);if(d<bd){bd=d;best=b}}
  return best;
}
function gmult(o){return(o!==0&&o<NP?DIFF[G.diff].gm:1)*(G.P[o]&&G.P[o].pen>G.t?.75:1)}
function gatherCat(u,r){if(r.k==='b')return'farm';if(r.sub==='carc')return'hunt';if(r.sub==='fish')return u.type==='pesc'?'fishb':'fish';if(r.sub==='berry')return'food';return r.rt}

function updUnit(u,dt){
  if(u.inT)return;
  const T=ST(u);
  if(u.cd>0)u.cd-=dt;
  if(u.fleeT>0)u.fleeT-=dt;
  u.work=false;
  if(u.type==='sac'&&u.faith<100)u.faith=Math.min(100,u.faith+dt*5);
  switch(u.st){
  case'idle':idleThink(u,T,dt);break;
  case'move':if(moveAlong(u,dt)){u.st='idle';u.mv=false;u.scan=0}break;
  case'gather':doGather(u,T,dt);break;
  case'return':doReturn(u,T,dt);break;
  case'build':doBuild(u,T,dt);break;
  case'attack':doAttack(u,T,dt);break;
  case'convert':doConvert(u,T,dt);break;
  case'heal':doHeal(u,T,dt);break;
  case'board':doBoard(u,T,dt);break;
  case'unload':if(moveAlong(u,dt)){u.mv=false;unloadAll(u);u.st='idle'}break;
  }
}
function idleThink(u,T,dt){
  u.scan-=dt;if(u.scan>0)return;u.scan=.5;
  if(u.o===GAIA){// animais
    if(UT[u.type].aggro){const v=nearestEnemy(u,UT[u.type].aggro*TS,false,true);if(v)orderAttack(u,v)}
    u.wt-=.5;if(u.wt<=0&&UT[u.type].flee){u.wt=8+Math.random()*14;const x=u.hx+(Math.random()-.5)*4*TS,y=u.hy+(Math.random()-.5)*4*TS;if(pass[tileOf(x,y)]){u.st='move';setGoal(u,{x,y})}}
    return;
  }
  const c=T.cls;
  if(c==='vill'||u.type==='pesc'||u.type==='trans')return;
  if(c==='sac'){
    if(u.o!==0&&u.o<NP&&u.faith>=100){const en=nearestEnemy(u,(T.rng+3)*TS,false);if(en&&en.type!=='sac'){orderConvert(u,en);return}}
    let best=null,bd=4*TS;for(const v of G.U){if(v.dead||v.inT||v.o!==u.o||v===u||isNav(v)||UT[v.type].cls==='cerco')continue;if(v.hp>=ST(v).hp)continue;const d=hyp(v.x-u.x,v.y-u.y);if(d<bd){bd=d;best=v}}
    if(best)orderHeal(u,best);return;
  }
  // postura (como no Age e no Rise): agressiva, defensiva, firme ou sem ataque
  const S=u.o===0?stanceOf(u):'agr';if(S==='sem')return;
  const R=S==='firme'?reachOf(T):T.los*losMul()*TS+(T.rng?TS:0);
  const en=nearestEnemy(u,R,u.o!==0&&u.o<NP);if(en){u.gx=u.x;u.gy=u.y;orderAttack(u,en);u.auto=1}
}
function doGather(u,T,dt){
  let r=E.get(u.tg);
  if(!r&&G.carc[u.tg]){const c=E.get(G.carc[u.tg]);if(c){u.tg=c.id;u.lastRes=c.id;u.lsub='carc';r=c}}
  if(r&&r.k==='u'){// caçando um animal vivo
    if(r.dead||r.o!==GAIA){u.st='idle';return}
    const HW=HUNTW[huntTier(u.o)];
    if(!approach(u,r,dt,HW.rng*TS))return;
    faceTo(u,r.x,r.y);u.work=true;u.hunting=G.t;
    if(u.cd<=0){u.cd=HW.cd;u.an+=2;u.shotT=G.t;G.pj.push({x:u.x,y:u.y-12,sx:u.x,sy:u.y-12,tx:r.x,ty:r.y,tg:r.id,dmg:ST(u).atk+HW.bon,att:{o:u.o,id:u.id},t:0,T:Math.max(.12,hyp(r.x-u.x,r.y-u.y)/HW.v),kind:HW.pk,home:true});snd(HW.snd,u)}
    return;
  }
  const bad=!r||r.dead||(r.k==='r'&&r.amt<=0)||(r.k==='b'&&(r.food<=0||r.done<1||farmTaken(r,u)));
  if(bad||u.fail>3){
    if(r&&!r.dead&&u.fail>3&&r.k==='r')r.bad=G.t;
    const c=r&&!r.dead?ctr(r):{x:u.x,y:u.y};
    if(r&&r.k==='b'&&r.wk===u.id)r.wk=0;
    let nr=findRes(u.lsub,c.x,c.y,u.lsub==='farm'?10:9,u.o);
    if(!nr&&u.lsub==='carc'&&u.hunt)nr=findRes(u.hunt,c.x,c.y,10,u.o);
    if(nr&&(u.fail<=3||nr!==r)){if(orderGather(u,nr)===false)u.st='idle';u.fail=0}
    else{if(u.carry>0)startReturn(u);else u.st='idle'}
    return;
  }
  const rt=r.k==='r'?r.rt:'food';
  if(u.ct!==rt){u.carry=0;u.ct=rt}
  const cap=T.carry||CARRY;
  if(u.carry>=cap){startReturn(u);return}
  if(!approach(u,r,dt,r.walk?18:(isNav(u)?30:24)))return;
  u.work=true;u.an+=dt*8;
  const c=ctr(r);faceTo(u,c.x,c.y);
  const cat=gatherCat(u,r);
  const rate=GATH[cat]*(u.o<NP?MODS[u.o].gath[cat]:1)*gmult(u.o)*seasonGath(cat)*ronGath(u.o,cat);
  let a=Math.min(rate*dt,cap-u.carry);
  if(r.k==='r'){a=Math.min(a,r.amt);r.amt-=a;if(r.amt<=.001)kill(r)}
  else{a=Math.min(a,r.food);r.food-=a;if(r.food<=.001){kill(r);
    if(afford(u.o,BT.fazenda.cost)&&validSite('fazenda',r.tx,r.ty,0,u.o)){pay(u.o,BT.fazenda.cost);const nf=placeBld('fazenda',u.o,r.tx,r.ty,false);u.carry+=a;u.st='build';u.tg=nf.id;u.mv=false;u.fail=0;if(u.o===0)toast('🌱 Fazenda replantada (−75 de madeira)');return}}}
  u.carry+=a;
  // som no instante do golpe (quadro 5 da animação), com o som de cada trabalho
  {const ber=u.lsub==='berry',ph=ber?(u.an/2|0)%3:(u.an/1.4|0)%3;if(ph!==u._ph&&(ber||ph===0)){const k=cat==='wood'?'chop':cat==='gold'||cat==='stone'?'mine':cat==='farm'?'hoe':cat==='hunt'?'flesh':ber?'leaves':cat==='fish'?'splash':'';if(k&&(ber?ph===0:true))snd(k,u)}u._ph=ph}
  if(u.carry>=cap-.001){u.carry=cap;startReturn(u)}
}
function startReturn(u){
  const d=findDrop(u.o,u.ct,u.x,u.y,u.badT&&G.t-u.badT<60?u.bad:0,isNav(u));
  if(!d){u.st='idle';return}
  const keep=u.lastRes,ls=u.lsub,h=u.hunt;orderReturn(u,d);u.lastRes=keep;u.lsub=ls;u.hunt=h;
}
function doReturn(u,T,dt){
  let d=E.get(u.tg);
  if(!d||d.dead||d.done<1||u.fail>3){if(d&&u.fail>3){u.bad=d.id;u.badT=G.t}d=findDrop(u.o,u.ct,u.x,u.y,u.badT&&G.t-u.badT<60?u.bad:0,isNav(u));if(!d){u.st='idle';return}u.tg=d.id;u.fail=0;u.mv=false}
  if(!approach(u,d,dt,isNav(u)?30:24))return;
  {const a=capAdd(u.o,u.ct,u.carry);G.P[u.o].res[u.ct]+=a;G.st.gath[u.o]+=a;if(u.o===0)incAdd(u.ct,a)}u.carry=0;
  const r=E.get(u.lastRes);
  if(r&&!r.dead&&(r.k!=='b'||!farmTaken(r,u))&&!(r.k==='r'&&r.amt<=0)){orderGather(u,r)}
  else{let nr=findRes(u.lsub,u.x,u.y,u.lsub==='farm'?10:14,u.o);if(!nr&&u.lsub==='carc'&&u.hunt)nr=findRes(u.hunt,u.x,u.y,12,u.o);if(!(nr&&orderGather(u,nr)!==false))u.st='idle'}
}
function doBuild(u,T,dt){
  const b=E.get(u.tg);
  if(!b||b.dead||u.fail>3||(b.done>=1&&b.hp>=b.mhp)){if(b&&!b.dead&&u.fail>3)b.stuck=(b.stuck||0)+1;u.st='idle';return}
  if(!approach(u,b,dt,24))return;
  u.work=true;u.an+=dt*8;
  const c=ctr(b);faceTo(u,c.x,c.y);
  const Bt=BT[b.type];
  if(b.done<1){
    b.done=Math.min(1,b.done+dt/Bt.t);b.hp=Math.min(b.mhp,b.hp+b.mhp*dt/Bt.t);
    {const ph=(u.an/1.4|0)%3;if(ph===0&&u._ph!==0)snd('hammer',u);u._ph=ph}
    if(b.done>=1){b.hp=Math.max(b.hp,b.mhp*.999);onBuilt(b)}
  }else b.hp=Math.min(b.mhp,b.hp+b.mhp*dt/(Bt.t*2));
}
function doAttack(u,T,dt){
  const t=E.get(u.tg);
  if(!t||t.dead||u.fail>4||t.inT||(t.k==='u'&&ally(t.o,u.o))||(t.k==='b'&&t.o!==u.o&&ally(t.o,u.o))){u.st='idle';u.scan=0;u.mv=false;return}
  if(u.o===0&&t.k==='u'&&!vis[tileOf(t.x,t.y)]&&distTo(u,t)>T.los*losMul()*TS){u.st='idle';return}
  if(u.o===GAIA&&(hyp(u.x-u.hx,u.y-u.hy)>8*TS||distTo(u,t)>6*TS)){u.hx=u.x;u.hy=u.y;u.st='idle';return}
  if(isNav(u)&&!T.war){u.st='idle';return}
  const reach=T.rng?T.rng*TS:(t.k==='u'?(T.cls==='elef'?26:20):24);
  if(!approach(u,t,dt,reach))return;
  u.work=true;
  const c=ctr(t);faceTo(u,c.x,c.y);
  if(u.cd<=0){u.cd=T.cd;u.an+=2;
    const att={o:u.o,id:u.id,bon:T.bon,weak:T.rng>0&&T.cls!=='cerco'&&T.cls!=='tanque',splash:T.splash};
    if(T.rng){const kind=UT[u.type].pk||(u.type==='pedra'?'s':u.type==='bal'?'b':'a');
      G.pj.push({x:u.x,y:u.y-12,sx:u.x,sy:u.y-12,tx:c.x,ty:c.y,tg:t.id,dmg:T.atk,att,t:0,T:Math.max(.25,hyp(c.x-u.x,c.y-u.y)/(kind==='s'?(UT[u.type].gun?380:220):kind==='b'?600:kind==='g'?900:420)),kind,home:kind!=='s'});
      snd(UT[u.type].gun?'shot':kind==='s'?'catapult':'arrow',u)}
    else{dealDmg(att,t,T.atk);snd(t.k==='b'?'hitb':t.o===GAIA?'flesh':T.cls==='elef'?'stomp':u.type==='vill'?'thud':'clash',u);
      if(T.splash&&t.k==='u'){for(const v of G.U){if(v===t||v.dead||v.inT||ally(v.o,u.o)||v.o===GAIA)continue;if(hyp(v.x-t.x,v.y-t.y)<T.splash*TS)dealDmg(att,v,T.atk*.5)}}}
  }
}
function doConvert(u,T,dt){
  const t=E.get(u.tg);
  if(!t||t.dead||t.inT||ally(t.o,u.o)||t.o===GAIA){u.st='idle';u.cv=0;return}
  if(!approach(u,t,dt,T.rng*TS))return;
  faceTo(u,t.x,t.y);
  if(u.faith<100){u.cv=0;return}
  u.work=true;u.cv=(u.cv||0)+dt*(u.o<NP?MODS[u.o].conv:1)/(UT[t.type].resist||1)/(t.type==='sac'?2:1);
  if(Math.random()<dt*1.2)snd('chant',u);
  if(u.cv>=5){convertUnit(t,u.o);u.faith=0;u.cv=0;u.st='idle'}
}
function convertUnit(t,o){
  const was=t.o;releaseFarm(t);t.o=o;t.st='idle';t.tg=0;t.path=null;t.mv=false;t.carry=0;
  t.hp=Math.min(t.hp,ST(t).hp);
  if(t.cargo)for(const id of t.cargo){const c=E.get(id);if(c)c.o=o}
  G.fx.push({k:'glow',x:t.x,y:t.y,t:0});
  if(was===0){SEL=SEL.filter(i=>i!==t.id);toast('⚠️ Um dos seus foi convertido pelo inimigo!');snd('alert')}
  if(o===0){toast('✨ Conversão! '+ST(t).n+' agora é seu.');snd('convert')}
  recountPop();
}
function doHeal(u,T,dt){
  const t=E.get(u.tg);
  if(!t||t.dead||t.inT||t.o!==u.o||t.hp>=ST(t).hp){u.st='idle';u.scan=1;return}
  if(!approach(u,t,dt,4*TS))return;
  faceTo(u,t.x,t.y);u.work=true;
  t.hp=Math.min(ST(t).hp,t.hp+dt*2*(u.o<NP?MODS[u.o].heal:1));
  if(Math.random()<dt*2)G.fx.push({k:'spark',x:t.x+(Math.random()-.5)*10,y:t.y,t:0});
}
function doBoard(u,T,dt){
  const b=E.get(u.tg);
  if(!b||b.dead||b.o!==u.o||!b.cargo||b.cargo.length>=UT[b.type].cap){u.st='idle';return}
  if(hyp(u.x-b.x,u.y-b.y)<=1.7*TS){u.inT=b.id;b.cargo.push(u.id);u.st='idle';u.mv=false;SEL=SEL.filter(i=>i!==u.id);if(u.o===0)snd('click');return}
  if(!u.mv)setGoal(u,{x:b.x,y:b.y});
  if(moveAlong(u,dt)){u.mv=false;u.fail++;if(u.fail>2)u.st='idle'}
}
function unloadAll(b){
  if(!b.cargo||!b.cargo.length)return;
  const bx=b.x/TS|0,by=b.y/TS|0;let k=0;const out=[];
  for(const[dx,dy,d2]of SPIRAL){if(d2>9)break;if(k>=b.cargo.length)break;const x=bx+dx,y=by+dy;if(!inMap(x,y)||!pass[idx(x,y)])continue;
    const u=E.get(b.cargo[k]);k++;if(!u)continue;u.inT=0;u.x=(x+.5)*TS;u.y=(y+.5)*TS;u.st='idle';u.path=null;out.push(u)}
  b.cargo=b.cargo.slice(k);
  if(out.length&&b.ux!=null&&pass[tileOf(b.ux,b.uy)])groupMove(out,b.ux,b.uy);
  if(b.cargo.length&&b.o===0)toast('Não dá para desembarcar aqui — chegue mais perto da praia');
}
function onBuilt(b){
  if(b.type==='tc'||b.type==='torre'){domDirty=true;ensureCapital(b.o)}
  recountPop();
  if(b.o===0){toast('🔨 '+BT[b.type].n+': construção concluída!');snd('done')}
  if(b.type==='maravilha')toast(b.o===0?'🏛 Maravilha pronta! Defenda por 5 minutos!':'⚠️ O inimigo ergueu uma Maravilha! Destrua em 5 minutos!');
  const others=G.U.filter(v=>!v.dead&&v.st==='build'&&v.tg===b.id);
  for(const v of others){
    if(b.type==='fazenda'){if(orderGather(v,b)!==false)continue}
    let nxt=null;for(const o of G.B){if(o.dead||o.o!==v.o||o.done>=1)continue;if(hyp(ctr(o).x-v.x,ctr(o).y-v.y)<8*TS){nxt=o;break}}
    if(nxt){orderBuild(v,nxt);continue}
    if(b.type==='celeiro'){const r=findRes('berry',v.x,v.y,8,v.o)||findRes('farm',v.x,v.y,8,v.o);if(r&&orderGather(v,r)!==false)continue}
    if(b.type==='deposito'){let r=null;for(const s of['tree','gold','stone']){const c=findRes(s,v.x,v.y,7,v.o);if(c&&(!r||distTo(v,c)<distTo(v,r)))r=c}if(r){orderGather(v,r);continue}}
    if(v.lastRes&&E.get(v.lastRes)){if(orderGather(v,E.get(v.lastRes))!==false)continue}
    v.st='idle';
  }
}
function dealDmg(att,t,base){
  if(!t||t.dead)return;
  let d=base;
  const au=E.get(att.id);if(au&&au.aura>G.t)d*=1.15;          // aura do General: +15% de ataque
  const tc=t.k==='b'?'bld':UT[t.type].cls;
  if(att.bon&&att.bon[tc])d+=att.bon[tc];
  if(t.k==='u')d-=ST(t).arm+(t.aura>G.t?1:0);
  if(t.k==='b'&&att.weak)d=Math.max(1,Math.round(d*.3));
  d=Math.max(1,d);
  t.hp-=d;
  onHit(t,att);
  if(t.hp<=0){if(t.k==='b'&&t.type==='tc'&&t.done>=1){t.hp=0;if(!t.down)cityDown(t)}else kill(t,att.o)}
}
function onHit(t,att){
  if(ally(t.o,att.o))return;
  const a=E.get(att.id);
  if(t.k==='u'&&t.o===GAIA){
    if(UT[t.type].flee&&a){const dx=t.x-a.x,dy=t.y-a.y,d=hyp(dx,dy)||1;let x=t.x+dx/d*5*TS,y=t.y+dy/d*5*TS;x=clamp(x,TS,(MW-1)*TS);y=clamp(y,TS,(MH-1)*TS);if(pass[tileOf(x,y)]){t.st='move';setGoal(t,{x,y});t.fleeT=3}}
    if(UT[t.type].fight&&a&&a.k==='u'&&t.st!=='attack')orderAttack(t,a);
    return;
  }
  if(t.k==='u'&&a&&a.k==='u'){
    const c=UT[t.type].cls;
    if(c!=='vill'&&c!=='sac'&&!(isNav(t)&&!ST(t).war)&&(t.st==='idle'||(t.st==='move'&&t.o!==0&&t.o<NP))&&canRetal(t,a)){if(t.st==='idle'){t.gx=t.x;t.gy=t.y}orderAttack(t,a);t.auto=1}
    if(t.o!==0&&t.o<NP&&c==='vill'&&t.hp<12&&t.st!=='move'){const p=G.starts[t.o];orderMove(t,(p[0]+.5)*TS,(p[1]+2.5)*TS)}
  }
  if(t.o!==0&&t.o<NP&&a)G.P[t.o].ai.threat=a.id;
  if(t.o===0){const c=ctr(t);if(G.t-UI.alertT>15){UI.alertT=G.t;toast(a&&a.o===GAIA?'⚠️ Um animal está atacando!':'⚠️ Você está sendo atacado!');snd('alert');try{navigator.vibrate&&navigator.vibrate([80,60,80])}catch(e){}}UI.lastAlert={x:c.x,y:c.y,t:G.t}}
}
const BC=64;let BW=Math.ceil(MW*TS/BC),BH=Math.ceil(MH*TS/BC);
let buckets=Array.from({length:BW*BH},()=>[]);
function rebuildBuckets(){for(const b of buckets)b.length=0;for(const u of G.U){if(u.dead||u.inT)continue;const bx=clamp(u.x/BC|0,0,BW-1),by=clamp(u.y/BC|0,0,BH-1);buckets[by*BW+bx].push(u)}}
function nearestEnemy(u,range,withBld,anyOwner){
  let best=null,bs=1e9;
  const x0=clamp((u.x-range)/BC|0,0,BW-1),x1=clamp((u.x+range)/BC|0,0,BW-1),y0=clamp((u.y-range)/BC|0,0,BH-1),y1=clamp((u.y+range)/BC|0,0,BH-1);
  for(let by=y0;by<=y1;by++)for(let bx=x0;bx<=x1;bx++)for(const e of buckets[by*BW+bx]){
    if(ally(e.o,u.o)||e.dead)continue;
    if(anyOwner){if(e.o===GAIA||isNav(e))continue}
    else if(e.o===GAIA&&e.type!=='leao')continue;
    if(u.o<NP&&isNav(u)!==isNav(e)&&!(ST(u).rng>0))continue;
    const d=hyp(e.x-u.x,e.y-u.y);if(d>range)continue;
    const sc=d+(UT[e.type].cls==='vill'?TS*3:0);if(sc<bs){bs=sc;best=e}
  }
  if(!best&&withBld){for(const b of G.B){if(b.dead||ally(b.o,u.o))continue;const d=distTo(u,b);if(d<range&&d<bs){bs=d;best=b}}}
  return best;
}
function separate(){
  for(const cell of buckets){for(let i=0;i<cell.length;i++){const a=cell[i];for(let j=i+1;j<cell.length;j++){const b=cell[j];
    if(isNav(a)!==isNav(b))continue;const rr=isNav(a)?30:12;
    const dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy;if(d2>=rr*rr||d2<.01)continue;const d=Math.sqrt(d2),p=(rr-d)*.25;const nx=dx/d*p,ny=dy/d*p;
    const am=a.mv?.3:1,bm=b.mv?.3:1;const PA=passFor(a);
    if(!a.work&&PA[tileOf(a.x-nx*am,a.y-ny*am)]){a.x-=nx*am;a.y-=ny*am}
    if(!b.work&&PA[tileOf(b.x+nx*bm,b.y+ny*bm)]){b.x+=nx*bm;b.y+=ny*bm}}}}
}

// =========================================================
//   PRÉDIOS, TIROS
// =========================================================
function updBld(b,dt){
  if(b.done<1||b.down)return;
  const T=BT[b.type];
  if(T.shoot){b.cd-=dt;if(b.cd<=0){const m=MODS[b.o],rng=T.shoot.rng+(b.type==='torre'?m.tower.rng:0);const c=ctr(b);const fake={x:c.x,y:c.y,o:b.o,type:'arq'};
    const en=nearestEnemy(fake,rng*TS+b.sz*TS/2,false);
    if(en){b.cd=T.shoot.cd;const atk=T.shoot.atk+(b.type==='torre'?m.tower.atk:0)+garBon(b);G.pj.push({x:c.x,y:c.y-40,sx:c.x,sy:c.y-40,tx:en.x,ty:en.y,tg:en.id,dmg:atk,att:{o:b.o,id:b.id,weak:true},t:0,T:hyp(en.x-c.x,en.y-c.y)/420,kind:'a',home:true})}else b.cd=.5}}
  if(!b.q.length)return;
  const P=G.P[b.o],it=b.q[0];
  const tt=itemTime(b,it);
  if(b.qt<tt)b.qt+=dt;
  if(b.qt<tt)return;
  if(it==='age'){P.age=Math.min(MAXAGE,P.age+1);b.q.shift();b.qt=0;b.wait=false;if(b.o===0){toast('🎺 Glória! Você chegou na '+AGES[P.age]+'!'+(P.age===5?'<br>🛢 O petróleo apareceu no mapa!':''));snd('age');mmDirty=true}else toast('O inimigo chegou na '+AGES[P.age]);return}
  if(it==='mil'){P.mil=(P.mil||0)+1;b.q.shift();b.qt=0;recountPop();if(b.o===0){toast('🎖️ Organização Militar '+ROMAN[P.mil]+': população máxima '+P.cap+'!');snd('done')}return}
  if(it==='nuke'||it==='emp'){b.q.shift();b.qt=0;const k=it==='nuke'?'nk':'ep';b[k]=(b[k]||0)+1;if(b.o===0){toast(it==='nuke'?'☢️ Bomba nuclear pronta no Silo! Selecione o Silo para lançar.':'⚡ Pulso EMP pronto no Silo!');snd('done')}return}
  if(it.startsWith('ln:')){lineDone(b,it);return}
  if(it.startsWith('t:')){const id=it.slice(2);if(!P.techs.includes(id))P.techs.push(id);recompute(b.o);b.q.shift();b.qt=0;if(b.o===0){toast('📜 Pesquisa concluída: '+TECH[id].n);snd('done')}return}
  if(P.pop<P.cap){const nav=!!UT[it].naval;const p=freeAround(b,b.rally||{x:(b.tx+b.sz/2)*TS,y:(b.ty+b.sz+2)*TS},nav);const u=spawnUnit(it,b.o,p.x,p.y);P.pop++;b.q.shift();b.qt=0;b.wait=false;
    if(b.o===0)snd('unit');
    if(b.rally){const rt=b.rally.id&&E.get(b.rally.id);if(rt&&canGather(u,rt))orderGather(u,rt);else if(passFor(u)[tileOf(b.rally.x,b.rally.y)])orderMove(u,b.rally.x,b.rally.y)}}
  else{const k=b.q.findIndex(x=>x==='mil'||x==='age'||x.startsWith('t:')||x.startsWith('ln:'));if(k>0){b.q.unshift(b.q.splice(k,1)[0]);b.qt=0;b.wait=false;return} // pesquisa na fila passa na frente quando a população está cheia
    if(!b.wait&&b.o===0)toast((P.mil||0)<MIL_N?'👥 População no limite! Pesquise a linha Militar na Biblioteca.':'👥 População no máximo.');b.wait=true}
}
function itemTime(b,it){if(it==='age')return AGETIME[G.P[b.o].age+1];if(it==='mil')return MILTIME[G.P[b.o].mil||0];if(it.startsWith('t:'))return TECH[it.slice(2)].t;return ST({o:b.o,type:it}).t}
function itemCost(p,it){if(it==='age')return AGECOST[G.P[p].age+1];if(it==='mil')return MILCOST[G.P[p].mil||0];if(it.startsWith('t:'))return TECH[it.slice(2)].cost;return costOf(p,it)}
function updProj(dt){
  for(const p of G.pj){
    p.t+=dt;
    if(p.home){const t=E.get(p.tg);if(t&&!t.dead){const c=ctr(t);p.tx=c.x;p.ty=c.y}}
    const f=Math.min(1,p.t/p.T);p.x=p.sx+(p.tx-p.sx)*f;p.y=p.sy+(p.ty-p.sy)*f;
    if(f>=1){p.done=true;
      if(p.kind==='s'){G.fx.push({k:'boom',x:p.tx,y:p.ty,t:0});snd('boom',p);
        for(const u of G.U){if(u.dead||u.inT||ally(u.o,p.att.o)||u.o===GAIA)continue;if(hyp(u.x-p.tx,u.y-p.ty)<TS*1.1)dealDmg(p.att,u,p.dmg)}
        for(const b of G.B){if(b.dead||ally(b.o,p.att.o))continue;if(distTo({x:p.tx,y:p.ty},b)<TS*.6)dealDmg(p.att,b,p.dmg)}}
      else{const t=E.get(p.tg);if(t&&!t.dead&&!t.inT){dealDmg(p.att,t,p.dmg);if(p.kind!=='b')snd(t.k==='b'?'hitb':t.o===GAIA?'flesh':'hit',p)}}
    }
  }
  G.pj=G.pj.filter(p=>!p.done);
}
function lineTiles(a,b){const pts=[];let x0=a[0],y0=a[1];const x1=b[0],y1=b[1];const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;for(let n=0;n<40;n++){pts.push([x0,y0]);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx}if(e2<=dx){err+=dx;y0+=sy}}return pts}
function validSite(type,tx,ty,margin,o){
  const T=BT[type],sz=T.sz;
  if(tx<1||ty<1||tx+sz>MW-1||ty+sz>MH-1)return false;
  if(T.water){let land=false,wat=false;
    for(let y=ty;y<ty+sz;y++)for(let x=tx;x<tx+sz;x++){const i=idx(x,y);if(G.terr[i]!==1||occ[i])return false;if(o===0&&!G.exp[i])return false}
    for(let y=ty-1;y<=ty+sz;y++)for(let x=tx-1;x<=tx+sz;x++){if(x>=tx&&x<tx+sz&&y>=ty&&y<ty+sz)continue;const i=idx(x,y);if(pass[i])land=true;if(wpass[i])wat=true}
    return land&&wat&&!domWhy(type,tx,ty,o)}
  for(let y=ty-margin;y<ty+sz+margin;y++)for(let x=tx-margin;x<tx+sz+margin;x++){
    if(!inMap(x,y))return false;const i=idx(x,y);
    const inside=x>=tx&&x<tx+sz&&y>=ty&&y<ty+sz;
    if(inside){if(G.terr[i]!==0||occ[i]!==0)return false;if(o===0&&!G.exp[i])return false}
    else if(!pass[i])return false;
  }
  return !domWhy(type,tx,ty,o);
}
