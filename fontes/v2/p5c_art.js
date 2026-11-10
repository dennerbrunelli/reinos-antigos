
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
function applyGPTArt(){
  // unidades: folha 8 (ou 9 com o caído) colunas x 2 linhas, igual às do código
  for(const k in GPTART.u){const m=GPTART.u[k];
    for(const v of m.team?[0,1]:[2]){const img=GA['u_'+k+'_'+v];if(!img)continue;const nc=m.dead?9:8;
      const w=img.width/nc/SS,h=img.height/(m.rows||2)/SS,kx=w/m.w,ky=h/m.h,sk=v===2?GAIA:v;
      SHEET[k+sk]={c:img,w,h,ax:m.ax*kx,ay:m.ay*ky,gpt:1,dead:m.dead,wf:m.wf||0,ws:m.ws||0,wcyc:m.wf?(UT[k]&&['merc','cav','arqcav','elef','cerco'].includes(UT[k].cls)&&k!=='mercador'?w*.8:m.ay*ky*.95):0};delete META[k+sk]}
    const im0=GA['u_'+k+'_'+(m.team?0:2)];if(im0&&!WALK[k]&&!m.walk8&&!m.wf)try{gaWalk(k,m,im0)}catch(e){WALK[k]={hum:0,seq:[1,2,3,4],fx:[],cyc:40}}}
  // prédios gregos (azul para o jogador, vermelho para o inimigo)
  const B=GPTART.b.grego;
  for(let o=0;o<NP;o++){const st=civOf(o).st,BS=GPTART.b[st];if(!BS)continue;
    for(const t in BS){if(GA_NOWALL[t]||!BT[t])continue;const m=BS[t],img=GA['b_'+st+'_'+m.at+'_'+o];if(!img)continue;
      const c=gaCut(img,m.r);SPR['b'+t+o]={c,dk:o===0?c:darkCopy(c),W:m.W,H:m.H,top:m.top,bt:m.bt,gpt:1}}}
  // prédios iguais para todos os povos (Biblioteca, Forte)
  const BC=GPTART.b.comum;if(BC)for(let o=0;o<NP;o++)for(const t in BC){if(!BT[t]||(SPR['b'+t+o]&&SPR['b'+t+o].gpt))continue;const m=BC[t],img=GA['b_comum_'+m.at+'_'+o];if(!img)continue;const c=gaCut(img,m.r);SPR['b'+t+o]={c,dk:o===0?c:darkCopy(c),W:m.W,H:m.H,top:m.top,bt:m.bt,gpt:1}}
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
