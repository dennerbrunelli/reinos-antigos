
// =========================================================
//   ARTE DO GPT: imagens prontas no lugar dos desenhos do código
//   (o que ainda não chegou continua desenhado pelo código)
// =========================================================
const GA={};
const GA_TEX=['grama','seca','terra','areia','raso','fundo'];
// pixels das texturas do chão (256x256) para o terreno; null se alguma faltar
function gaTexAll(){try{return gaTexAll0()}catch(e){return null}}
function gaTexAll0(){const o={};for(const t of GA_TEX){const im=GA['t_'+t];if(!im)return null;const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.drawImage(im,0,0,256,256);o[t]=g.getImageData(0,0,256,256).data}return o}
const GA_FILES=(()=>{const f=[];for(const k in GPTART.u)for(const v of GPTART.u[k].team?[0,1]:[2])f.push('u_'+k+'_'+v);
  for(const st in GPTART.b){const ats=new Set(Object.values(GPTART.b[st]).map(m=>m.at));for(const at of ats)for(const v of[0,1])f.push('b_'+st+'_'+at+'_'+v)}for(const at of new Set(Object.values(GPTART.n).map(m=>m.at)))f.push('n_'+at);if(GPTART.x)for(const at of new Set(Object.values(GPTART.x).map(m=>m.at)))for(const v of[0,1])f.push('x_'+at+'_'+v);for(const t of GA_TEX)f.push('t_'+t);return f})();
// carrega tudo em segundo plano; o jogo espera isto antes de começar uma partida
const ARTP=Promise.all(GA_FILES.map(f=>new Promise(res=>{const im=new Image();im.onload=()=>{GA[f]=im;res()};im.onerror=()=>res();im.src='assets/gpt/'+f+'.webp'})));
function gaCut(img,r){const c=document.createElement('canvas');c.width=r[2];c.height=r[3];c.getContext('2d').drawImage(img,r[0],r[1],r[2],r[3],0,0,r[2],r[3]);return c}
function gaFlip(src){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(src,0,0);return c}
function gaThumb(src,size){const bb=bbox(src);const c=document.createElement('canvas');c.width=c.height=size*2;const g=c.getContext('2d');const s=Math.min(size*2/bb.w,size*2/bb.h)*.94;g.drawImage(src,bb.x,bb.y,bb.w,bb.h,(c.width-bb.w*s)/2,(c.height-bb.h*s)/2,bb.w*s,bb.h*s);return c.toDataURL()}
const GA_NOWALL={muralha:1,alicerce:1};
// ---------- andar: escolhe a ordem dos quadros e acerta tamanho/tronco de cada um ----------
// as folhas do GPT não formam um ciclo de passos (os quadros vão encolhendo e o corpo pula de lugar);
// aqui cada quadro de andar ganha uma escala e um deslocamento para o tronco ficar firme e só as pernas mexerem
const WALK={};
function gaWalk(k,m,img){
  const nc=m.dead?9:8,rows=m.rows||2,fw=img.width/nc,fh=img.height/rows;
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);
  const D=g.getImageData(0,0,c.width,c.height).data,cls=(UT[k]||UT[k.slice(0,-1)]||{cls:'animal'}).cls;
  const hum=!['cav','arqcav','elef','cerco','animal','navio'].includes(cls);
  const S=SHEET[k+(m.team?0:GAIA)],axs=S.ax*SS,ays=S.ay*SS;
  const stat=(r,f)=>{let top=1e9,bot=-1;const x0=Math.round(f*fw),y0=Math.round(r*fh),W=Math.round(fw),H=Math.round(fh);
    for(let y=0;y<H;y++){const o=((y0+y)*c.width+x0)*4;for(let x=0;x<W;x++)if(D[o+x*4+3]>140){if(y<top)top=y;bot=y;break}}
    if(bot<0)return null;const h=bot-top;let sx=0,n=0,fl=1e9,fr=-1;
    for(let y=top;y<=bot;y++){const o=((y0+y)*c.width+x0)*4;for(let x=0;x<W;x++)if(D[o+x*4+3]>140){if(y<top+h*.4){sx+=x;n++}if(y>=bot-h*.12){if(x<fl)fl=x;if(x>fr)fr=x}}}
    return{top,bot,h,cx:n?sx/n:W/2,sp:fr-fl}};
  const fx=[];let seq=[1,2,3,4];
  for(let r=0;r<rows;r++){const st=[0,1,2,3,4].map(f=>stat(r,f));if(st.some(s=>!s)){fx.push(null);continue}
    if(r===0&&hum){const w=[1,2,3,4].sort((a,b)=>st[b].sp-st[a].sp),W1=w[0],W2=st[w[1]].sp>=st[W1].sp*.7?w[1]:W1,nar=w.filter(f=>f!==W1&&f!==W2).sort((a,b)=>st[a].sp-st[b].sp);
      seq=[W1,nar[0]||w[3],W2,nar[1]||nar[0]||w[3]]}
    const o={};if(hum){const href=Math.max(...[1,2,3,4].map(f=>st[f].h)),cref=[1,2,3,4].reduce((a,f)=>a+st[f].cx,0)/4,bref=st[0].bot;
      for(const f of[1,2,3,4]){const s=clamp(href/st[f].h,1,1.12);o[f]={s,dx:((cref-axs)-(st[f].cx-axs)*s)/SS,dy:((bref-ays)-(st[f].bot-ays)*s)/SS}}}
    fx.push(o)}
  WALK[k]={hum,seq,fx,cyc:hum?S.ay*.8:S.w*.9};
}
// ---------- cores de time 3 a 8: a arte só existe em azul (_0) e vermelho (_1) ----------
// Em vez de cair no boneco antigo, repinta o azul da folha _0 com a cor do time. Guarda o resultado
// para não refazer a cada partida, e só repinta a folha de uma unidade quando ela aparece pela 1ª vez.
const GA_TEAM={};
function hex2hsl(hx){const r=parseInt(hx.slice(1,3),16)/255,g=parseInt(hx.slice(3,5),16)/255,b=parseInt(hx.slice(5,7),16)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;let h=0,s=0;
  if(d){s=d/(1-Math.abs(2*l-1));h=mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s,l]}
function gaTeam(img,o,key){const ck=key+'|'+o;if(GA_TEAM[ck])return GA_TEAM[ck];
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);
  const[bh,bs,bl]=hex2hsl(COL[0].m),[th,ts,tl]=hex2hsl(COL[o].m),ks=ts/bs,kl=clamp(tl/bl,.85,1.3);
  const I=g.getImageData(0,0,c.width,c.height),D=I.data;
  for(let i=0;i<D.length;i+=4){if(D[i+3]<8)continue;const r=D[i]/255,gg=D[i+1]/255,b=D[i+2]/255;if(b<=r||b<gg*.92)continue;// só o que puxa pro azul
    const mx=b,mn=Math.min(r,gg),d=mx-mn;if(d<.12)continue;const l=(mx+mn)/2,s=d/(1-Math.abs(2*l-1));if(s<.3)continue;
    const h=((r-gg)/d+4)*60;if(h<195||h>262)continue;
    const s2=Math.min(1,s*ks),l2=Math.min(.97,l*kl),C=(1-Math.abs(2*l2-1))*s2,hp=th/60,X=C*(1-Math.abs(hp%2-1)),m=l2-C/2;
    let R=0,G2=0,B=0;if(hp<1){R=C;G2=X}else if(hp<2){R=X;G2=C}else if(hp<3){G2=C;B=X}else if(hp<4){G2=X;B=C}else if(hp<5){R=X;B=C}else{R=C;B=X}
    D[i]=(R+m)*255;D[i+1]=(G2+m)*255;D[i+2]=(B+m)*255}
  g.putImageData(I,0,0);return GA_TEAM[ck]=c}
// ---------- povos sem arte pintada própria (Europa, Oriente, Babilônia) ----------
// Em vez dos prédios cinzentos desenhados por código, usam a arte pintada mais próxima com o telhado
// repintado (ardósia na Europa, verde-jade no Oriente). É provisório até cada estilo ganhar arte própria.
const GA_STFB={europa:'grego',oriental:'grego',babilonia:'egito'};
const GA_ROOF={europa:[212,.2,.68],oriental:[158,.6,.7]};// matiz, fator de saturação, fator de brilho
function gaStyle(img,st0,key){const P=GA_ROOF[st0];if(!P)return img;const ck='st|'+st0+'|'+key;if(GA_TEAM[ck])return GA_TEAM[ck];
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);
  const I=g.getImageData(0,0,c.width,c.height),D=I.data,th=P[0];
  for(let i=0;i<D.length;i+=4){if(D[i+3]<8)continue;const r=D[i]/255,gg=D[i+1]/255,b=D[i+2]/255;if(r<=gg||gg<b)continue;// só tons de telha (vermelho > verde > azul)
    const d=r-b;if(d<.2)continue;const l=(r+b)/2,s=d/(1-Math.abs(2*l-1));if(s<.42)continue;const h=(gg-b)/d*60;if(h<7||h>30)continue;
    const s2=Math.min(1,s*P[1]),l2=l*P[2],C=(1-Math.abs(2*l2-1))*s2,hp=th/60,X=C*(1-Math.abs(hp%2-1)),m=l2-C/2;
    let R=0,G2=0,B=0;if(hp<1){R=C;G2=X}else if(hp<2){R=X;G2=C}else if(hp<3){G2=C;B=X}else if(hp<4){G2=X;B=C}else if(hp<5){R=X;B=C}else{R=C;B=X}
    D[i]=(R+m)*255;D[i+1]=(G2+m)*255;D[i+2]=(B+m)*255}
  g.putImageData(I,0,0);return GA_TEAM[ck]=c}
function applyGPTArt(){
  // unidades: folha 8 (ou 9 com o caído) colunas x 2 linhas, igual às do código
  for(const k in GPTART.u){const m=GPTART.u[k];
    for(const v of m.team?[0,1]:[2]){const img=GA['u_'+k+'_'+v];if(!img)continue;const nc=m.dead?9:8;
      const w=img.width/nc/SS,h=img.height/(m.rows||2)/SS,kx=w/m.w,ky=h/m.h,sk=v===2?GAIA:v;
      SHEET[k+sk]={c:img,w,h,ax:m.ax*kx,ay:m.ay*ky,gpt:1,dead:m.dead,wf:m.wf||0,ws:m.ws||0,wcyc:m.wf?(UT[k]&&['merc','cav','arqcav','elef','cerco'].includes(UT[k].cls)&&k!=='mercador'?w*.8:m.ay*ky*.95):0};delete META[k+sk];
      // times 3+: mesma folha, repintada só quando for usada pela primeira vez
      if(v===0)for(let o=2;o<NP;o++){const base=SHEET[k+'0'],kk=k+o;delete META[kk];
        Object.defineProperty(SHEET,kk,{configurable:true,enumerable:true,get(){const val=Object.assign({},base,{c:gaTeam(img,o,'u_'+k)});Object.defineProperty(SHEET,kk,{configurable:true,enumerable:true,writable:true,value:val});return val}})}}
    const im0=GA['u_'+k+'_'+(m.team?0:2)];if(im0&&!WALK[k]&&!m.walk8&&!m.wf)try{gaWalk(k,m,im0)}catch(e){WALK[k]={hum:0,seq:[1,2,3,4],fx:[],cyc:40}}}
  // prédios gregos (azul para o jogador, vermelho para o inimigo)
  const B=GPTART.b.grego;
  for(let o=0;o<NP;o++){const st0=civOf(o).st,st=GPTART.b[st0]?st0:GA_STFB[st0],BS=GPTART.b[st];if(!BS)continue;
    for(const t in BS){if(GA_NOWALL[t]||!BT[t])continue;const m=BS[t],i0=GA['b_'+st+'_'+m.at+'_0'];let img=GA['b_'+st+'_'+m.at+'_'+o]||(o>1&&i0?gaTeam(i0,o,'b_'+st+'_'+m.at):null);if(!img)continue;
      if(st!==st0)img=gaStyle(img,st0,'b_'+st+'_'+m.at+'_'+o);
      const c=gaCut(img,m.r);SPR['b'+t+o]={c,dk:o===0?c:darkCopy(c),W:m.W,H:m.H,top:m.top,bt:m.bt,gpt:1}}}
  // prédios iguais para todos os povos (Biblioteca, Forte)
  const BC=GPTART.b.comum;if(BC)for(let o=0;o<NP;o++)for(const t in BC){if(!BT[t]||(SPR['b'+t+o]&&SPR['b'+t+o].gpt))continue;const m=BC[t],i0=GA['b_comum_'+m.at+'_0'],img=GA['b_comum_'+m.at+'_'+o]||(o>1&&i0?gaTeam(i0,o,'b_comum_'+m.at):null);if(!img)continue;const c=gaCut(img,m.r);SPR['b'+t+o]={c,dk:o===0?c:darkCopy(c),W:m.W,H:m.H,top:m.top,bt:m.bt,gpt:1}}
  // recursos raros e ruínas (versão azul e vermelha)
  if(GPTART.x)for(const k in GPTART.x){const m=GPTART.x[k];for(const v of[0,1]){const img=GA['x_'+m.at+'_'+v];if(!img)continue;SPR['x_'+k+'_'+v]={c:gaCut(img,m.r),w:m.W,h:m.H,ax:m.xc,ay:m.cy}}}
  // alicerce (obra) para todos os estilos
  {const m=B.alicerce,img=GA['b_grego_'+m.at+'_0'];if(img){const c=gaCut(img,m.r);SPR.alic={c,W:m.W,H:m.H,top:m.top,dw:m.dw}}}
  // árvores e recursos
  const N=GPTART.n,nat=(nm,flip)=>{const m=N[nm],img=GA['n_'+m.at];if(!img)return null;let c=gaCut(img,m.r);if(flip)c=gaFlip(c);return{c,dk:darkCopy(c),m}};
  const TREES=['tree0','tree1','tree0','tree3','tree4','tree5','tree6','tree7'];
  TREES.forEach((nm,v)=>{const s=nat(nm,v===2);if(s)SPR['tree'+v]={c:s.c,dk:s.dk,w:s.m.W,h:s.m.H,ax:s.m.xc,ay:s.m.cy+5}});
  for(const nm of['berry','gold','stone']){const s=nat(nm);if(s)SPR[nm]={c:s.c,dk:s.dk,w:s.m.W,h:s.m.H,ax:s.m.xc,ay:s.m.cy+5}}
  {const s=nat('fish');if(s){const f={c:s.c,dk:s.dk,w:s.m.W,h:s.m.H,ax:s.m.W/2,ay:s.m.H/2-4};SPR.fish0=f;SPR.fish1=f}}
  for(const nm of['carc','carcE']){const s=nat(nm);if(s)SPR[nm]={c:s.c,dk:s.dk,w:s.m.W,h:s.m.H,ax:s.m.xc,ay:s.m.cy}}
  // miniaturas dos botões e do painel
  for(const k in GPTART.u){const o=GPTART.u[k].team?0:GAIA;if(!SHEET[k+o]||!SHEET[k+o].gpt)continue;const t=k==='guerA'?'guerA':k;THUMB['u'+t]=gaThumb(frameCanvas(k+o,0,0),40)}
  for(const t in BT){const s=SPR['b'+t+'0'];if(s&&s.gpt)THUMB['b'+t]=gaThumb(s.c,40)}
  for(const k of['berry','gold','stone','carc'])if(SPR[k])THUMB['r'+k]=gaThumb(SPR[k].c,40);
  if(SPR.fish1)THUMB.rfish1=gaThumb(SPR.fish1.c,40);if(SPR.tree0)THUMB.rtree=gaThumb(SPR.tree0.c,40);
}
// as folhas do GPT entram logo depois dos desenhos do código
const buildSpritesProc=buildSprites;
buildSprites=function(){buildSpritesProc();try{applyGPTArt()}catch(e){console.warn('arte',e)}};
