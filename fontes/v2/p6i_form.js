
// =========================================================
//   FORMAÇÕES E POSTURAS (o melhor do Age of Empires e do Rise of Nations)
//   Postura (cada tropa): Agressiva · Defensiva · Firme · Sem ataque
//   Formação (o seu exército): Livre · Linha · Caixa · Espaçada · Flanco
//   Em formação o grupo anda junto, na velocidade do mais lento (como no Rise)
// =========================================================
const POSES={
  agr:{n:'Agressiva',ic:'⚔️',c:'#c03a2a',d:'Persegue qualquer inimigo que enxergar.'},
  def:{n:'Defensiva',ic:'🛡️',c:'#2f6fc0',d:'Ataca quem chegar perto, mas não se afasta muito e volta para o lugar.'},
  firme:{n:'Firme',ic:'🧱',c:'#8a6a3a',d:'Não sai do lugar: só ataca quem estiver ao alcance da arma.'},
  sem:{n:'Sem ataque',ic:'🕊️',c:'#7a8a96',d:'Não ataca nem revida (bom para passar sem brigar ou fugir).'}};
const POSE_ORD=['agr','def','firme','sem'];
const FORMS={
  livre:{n:'Livre',ic:'✳️',d:'Cada um vai do seu jeito, o mais rápido possível.'},
  linha:{n:'Linha',ic:'➖',d:'Corpo a corpo na frente, arqueiros e atiradores atrás, cerco no fundo.'},
  caixa:{n:'Caixa',ic:'🔲',d:'Corpo a corpo em volta; arqueiros, cerco e general protegidos no meio.'},
  espaco:{n:'Espaçada',ic:'⁘',d:'Linha bem aberta: sofre menos com catapultas, canhões e explosões.'},
  flanco:{n:'Flanco',ic:'⋀',d:'Duas alas de corpo a corpo nos lados e os de longe no centro, para cercar o inimigo.'}};
const FORM_ORD=['livre','linha','caixa','espaco','flanco'];
UI.form=(OPT&&OPT.form)||'linha';
function stanceOf(u){return u.pos||'agr'}
function reachOf(T){return T.rng?T.rng*TS+TS*.5:26}
// revidar quando apanha: depende da postura
function canRetal(t,a){if(t.o!==0)return true;const S=stanceOf(t);if(S==='sem')return false;if(S==='firme')return distTo(t,a)<=reachOf(ST(t));return true}
// perseguição limitada para Defensiva e Firme
const doAttack6=doAttack;
doAttack=function(u,T,dt){
  if(u.o===0&&u.auto){const S=stanceOf(u),t=E.get(u.tg),end=!t||t.dead||t.inT;
    if(S==='sem'){u.st='idle';u.auto=0;u.mv=false;return}
    if(S==='firme'&&!end&&distTo(u,t)>reachOf(T)){u.st='idle';u.mv=false;u.scan=.3;u.auto=0;u.path=null;return}
    if(S==='def'&&u.gx!=null&&(end||hyp(u.x-u.gx,u.y-u.gy)>6*TS||(t&&hyp(t.x-u.gx,t.y-u.gy)>9*TS))){u.auto=0;if(hyp(u.x-u.gx,u.y-u.gy)>TS*.6)orderMove(u,u.gx,u.gy);else{u.st='idle';u.mv=false}return}}
  doAttack6(u,T,dt)};
// tropa nova sai com a postura escolhida por último
const spawnUnit6=spawnUnit;
spawnUnit=function(type,o,x,y){const u=spawnUnit6(type,o,x,y);if(u&&o===0&&isMil(u)&&OPT.pose0&&OPT.pose0!=='agr')u.pos=OPT.pose0;return u};
// ---------- formação ----------
function formRole(u){const T=ST(u),c=UT[u.type].cls;if(c==='cerco')return 2;if(UT[u.type].civ||u.type==='general'||u.type==='sac'||u.type==='carroca')return 3;if(T.rng>2&&c!=='tanque')return 1;return 0}
function formSlots(form,n){// n=[corpo a corpo, longe, cerco, apoio] → posições {f (frente), r (direita), g (grupo)}
  const S=[],row=(g,cnt,f,wmax,dr)=>{let left=cnt,ff=f;while(left>0){const k=Math.min(wmax,left);for(let i=0;i<k;i++)S.push({g,f:ff,r:(i-(k-1)/2)*(dr||1)});left-=k;ff-=1}return ff};
  const W=Math.max(4,Math.min(12,Math.ceil(Math.sqrt((n[0]+n[1]+n[2]+n[3])*2.2))));
  if(form==='linha'||form==='espaco'){let f=0;if(n[0])f=row(0,n[0],f,W);if(n[1])f=row(1,n[1],f,W);if(n[2])f=row(2,n[2],f-.2,W,1.3);if(n[3])row(3,n[3],f,W)}
  else if(form==='flanco'){const half=Math.ceil(n[0]/2),wc=Math.max(3,Math.min(10,n[1]||3)),off=wc/2+1.6;let f=0;
    if(n[1])f=row(1,n[1],0,wc);
    const wing=(cnt,side)=>{const cols=2;for(let i=0;i<cnt;i++)S.push({g:0,f:.8-Math.floor(i/cols),r:side*(off+(i%cols))})};wing(half,-1);wing(n[0]-half,1);
    if(n[2])f=row(2,n[2],Math.min(f,-1)-.3,wc,1.3);if(n[3])row(3,n[3],f,wc)}
  else if(form==='caixa'){const inner=n[1]+n[2]+n[3],k=Math.max(1,Math.ceil(Math.sqrt(inner)));let s=k+2;while(4*(s-1)<n[0]&&s<14)s++;
    const per=[];for(let i=0;i<s;i++)per.push([0,i]);for(let i=1;i<s;i++)per.push([i,s-1]);for(let i=s-2;i>=0;i--)per.push([s-1,i]);for(let i=s-2;i>0;i--)per.push([i,0]);
    const c=(s-1)/2;for(let i=0;i<n[0];i++){const p=per[Math.floor(i*per.length/Math.max(1,n[0]))];S.push({g:0,f:c-p[0],r:p[1]-c})}
    let j=0;const kk=Math.max(1,s-2),o=(kk-1)/2;for(const g of[1,2,3])for(let i=0;i<n[g];i++,j++)S.push({g,f:o-Math.floor(j/kk)*(inner>kk*kk?.8:1),r:(j%kk)-o})}
  return S}
function formMove(us,x,y,form,dirIn){
  let cx=0,cy=0;for(const u of us){cx+=u.x;cy+=u.y}cx/=us.length;cy/=us.length;
  let dx=x-cx,dy=y-cy,L=hyp(dx,dy);if(dirIn){dx=dirIn[0];dy=dirIn[1];L=1}else if(L<TS*1.5){const d=G.fdir||[1,-1];dx=d[0];dy=d[1];L=hyp(dx,dy)}dx/=L;dy/=L;G.fdir=[dx,dy];
  const rx=-dy,ry=dx,sp=TS*(form==='espaco'?2:1.08);
  const grp=[[],[],[],[]];for(const u of us)grp[formRole(u)].push(u);
  const sl=formSlots(form,grp.map(g=>g.length));let mf=0,mr=0;for(const s of sl){mf+=s.f;mr+=s.r}mf/=sl.length||1;mr/=sl.length||1;
  const slow=Math.min(...us.map(u=>ST(u).spd*seasonSpd(u))),used=[];
  for(let g=0;g<4;g++){const ss=sl.filter(s=>s.g===g).sort((a,b)=>a.r-b.r||b.f-a.f),uu=grp[g].slice().sort((a,b)=>(a.x*rx+a.y*ry)-(b.x*rx+b.y*ry));
    uu.forEach((u,i)=>{const s=ss[i]||{f:0,r:0};let px=x+((s.f-mf)*dx+(s.r-mr)*rx)*sp,py=y+((s.f-mf)*dy+(s.r-mr)*ry)*sp;
      {const X0=px/TS|0,Y0=py/TS|0,near=(qx,qy)=>used.some(([ux,uy])=>hyp(ux-qx,uy-qy)<TS*.7);
        if(!inMap(X0,Y0)||!pass[idx(X0,Y0)]||near(px,py)){const X=clamp(X0,0,MW-1),Y=clamp(Y0,0,MH-1);for(const[a,b]of SPIRAL){const qx=(X+a+.5)*TS,qy=(Y+b+.5)*TS;if(inMap(X+a,Y+b)&&pass[idx(X+a,Y+b)]&&!near(qx,qy)){px=qx;py=qy;break}}}used.push([px,py])}
      orderMove(u,px,py);u.fspd=slow;u.gx=px;u.gy=py})}}
const groupMove6=groupMove;
groupMove=function(us,x,y){const land=us.filter(u=>!isNav(u));const f=UI.form||'linha';
  if(f!=='livre'&&land.length>=2&&land.every(u=>u.o===0&&isMil(u))){formMove(land,x,y,f);const nav=us.filter(u=>isNav(u));if(nav.length)groupMove6(nav,x,y);return}
  groupMove6(us,x,y)};
// velocidade do grupo: todos andam no passo do mais lento até chegar
const ronSpd6=ronSpd;
ronSpd=function(u){const s=ronSpd6(u);if(u.fspd){if(u.st!=='move'||!u.mv){u.fspd=0;return s}const b=ST(u).spd*seasonSpd(u);if(b>u.fspd)return s*u.fspd/b}return s};
// ---------- botões ----------
function poseIcon(k,big){const key='pose'+k;if(!ICO[key]){const[c,g]=icoC();const P=POSES[k];medal(g,P.c,'#1a1208');g.font='34px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(P.ic,40,41);ICO[key]=c.toDataURL()}return ICO[key]}
function formIcon(k){const key='form'+k;if(!ICO[key]){const[c,g]=icoC();medal(g,'#5a7a3a','#122008');g.fillStyle='#f4e7c0';g.strokeStyle='#1a1208';g.lineWidth=1.2;
    const dot=(x,y,r)=>{g.beginPath();g.arc(x,y,r||4,0,7);g.fill();g.stroke()};
    if(k==='livre'){for(const[x,y]of[[26,30],[44,24],[54,42],[32,50],[48,56],[22,44]])dot(x,y)}
    else if(k==='linha'){for(let i=0;i<5;i++)dot(18+i*11,32);g.fillStyle='#9ad0ff';for(let i=0;i<4;i++)dot(24+i*11,48)}
    else if(k==='espaco'){for(let i=0;i<3;i++)dot(18+i*22,30);g.fillStyle='#9ad0ff';for(let i=0;i<3;i++)dot(18+i*22,52)}
    else if(k==='caixa'){for(let i=0;i<4;i++){dot(20+i*13,20);dot(20+i*13,59)}dot(20,33);dot(20,46);dot(59,33);dot(59,46);g.fillStyle='#9ad0ff';dot(34,40);dot(46,40)}
    else if(k==='flanco'){for(const[x,y]of[[14,28],[22,36],[14,44],[66,28],[58,36],[66,44]])dot(x,y);g.fillStyle='#9ad0ff';dot(32,50);dot(40,50);dot(48,50)}
    ICO[key]=c.toDataURL()}return ICO[key]}
const getCmds6=getCmds;
getCmds=function(){const out=getCmds6();const s=selEnts();const us=s.filter(e=>e.k==='u'&&e.o===0&&!e.dead);
  if(!us.length||us.length!==s.length||!us.every(u=>isMil(u)&&!isNav(u)||(isNav(u)&&ST(u).war)))return out;
  const cur=stanceOf(us[0]),mixed=us.some(u=>stanceOf(u)!==cur),nx=POSE_ORD[(POSE_ORD.indexOf(cur)+1)%POSE_ORD.length];
  out.push({img:poseIcon(cur),trade:1,kind:'pose',nm:'Postura: '+POSES[cur].n+(mixed?' (misturada)':'')+' · toque para '+POSES[nx].n,act:()=>{for(const u of us){u.pos=nx;if(u.auto&&u.st==='attack'&&nx!=='agr'){u.auto=0;orderStop(u)}}OPT.pose0=nx;saveOpt();toast(POSES[nx].ic+' Postura '+POSES[nx].n+': '+POSES[nx].d);snd('click');UI.sig=''}});
  const land=us.filter(u=>!isNav(u));
  if(land.length>=2){const f=UI.form,nf=FORM_ORD[(FORM_ORD.indexOf(f)+1)%FORM_ORD.length];
    out.push({img:formIcon(f),trade:1,kind:'form',nm:'Formação: '+FORMS[f].n+' · toque para '+FORMS[nf].n,act:()=>{UI.form=nf;OPT.form=nf;saveOpt();
      if(nf!=='livre'){let cx=0,cy=0;for(const u of land){cx+=u.x;cy+=u.y}formMove(land,cx/land.length,cy/land.length,nf,G.fdir)}
      toast(FORMS[nf].ic+' Formação '+FORMS[nf].n+': '+FORMS[nf].d);snd('click');UI.sig=''}})}
  return out.slice(0,12)};
// ajuda
{const h=document.querySelector('#help .hb')||document.getElementById('helpb');const p=[...document.querySelectorAll('#help p, p')].find(e=>/^RUÍNAS E FORTE/.test(e.textContent));
  if(p){const n=document.createElement('p');n.innerHTML='<b>FORMAÇÕES E POSTURAS</b><br>Selecione o exército e use os 2 botões novos:<br>'+POSE_ORD.map(k=>POSES[k].ic+' <b>'+POSES[k].n+'</b>: '+POSES[k].d).join('<br>')+'<br>'+FORM_ORD.map(k=>FORMS[k].ic+' <b>'+FORMS[k].n+'</b>: '+FORMS[k].d).join('<br>')+'<br>Em formação o grupo anda junto, no passo do mais lento.';p.after(n)}}
