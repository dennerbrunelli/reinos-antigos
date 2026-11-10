// =========================================================
//   PARTÍCULAS DE COMBATE E DE CENÁRIO (tudo desenhado por código, leve para celular)
//   faísca de espada · lasca e poeira de prédio · fumaça e fogo em prédio ferido ·
//   nuvem de poeira no desabamento · poeira de cavalaria e máquinas andando
//   Não entra no jogo salvo: é só enfeite, recriado a cada momento.
// =========================================================
const PART=[];const PART_MAX=260;
let partLast=0,partAcc=0;
// k: 's' faísca · 'd' poeira · 'm' fumaça · 'f' chama · 'c' lasca
function pEmit(k,x,y,h,n,spread){if(!OPT||OPT.fx===false)return;const I=x-y,J=(x+y)/2-(h||0);
  for(let i=0;i<n;i++){if(PART.length>=PART_MAX)PART.shift();const a=Math.random()*6.283,s=spread||1;
    if(k==='s')PART.push({k,x:I,y:J,vx:Math.cos(a)*(30+Math.random()*50),vy:-20-Math.random()*60,t:0,T:.25+Math.random()*.22,r:1.8+Math.random()*1.4});
    else if(k==='c')PART.push({k,x:I,y:J,vx:Math.cos(a)*(18+Math.random()*34)*s,vy:-40-Math.random()*50,t:0,T:.5+Math.random()*.35,r:2+Math.random()*2,c:Math.random()<.5?'#8a7a66':'#5e5040'});
    else if(k==='d')PART.push({k,x:I+(Math.random()-.5)*10*s,y:J+(Math.random()-.5)*5*s,vx:Math.cos(a)*8*s,vy:-4-Math.random()*8,t:0,T:.7+Math.random()*.6,r:4+Math.random()*5*s});
    else if(k==='m')PART.push({k,x:I+(Math.random()-.5)*14*s,y:J,vx:7+Math.random()*7,vy:-20-Math.random()*14,t:0,T:2+Math.random()*1.6,r:6+Math.random()*6});
    else if(k==='f')PART.push({k,x:I+(Math.random()-.5)*7,y:J+Math.random()*3,vx:(Math.random()-.5)*8,vy:-34-Math.random()*30,t:0,T:.4+Math.random()*.35,r:4+Math.random()*4})}}
// bolinhas macias prontas (desenhar imagem é bem mais leve no celular do que traçar círculo a cada partícula)
const PSPR={};
function pSprite(k){const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),gr=g.createRadialGradient(16,16,0,16,16,16);
  if(k==='d'){gr.addColorStop(0,'rgba(214,196,160,.9)');gr.addColorStop(1,'rgba(214,196,160,0)')}
  else if(k==='m'){gr.addColorStop(0,'rgba(38,34,31,.95)');gr.addColorStop(.6,'rgba(52,47,43,.5)');gr.addColorStop(1,'rgba(60,55,50,0)')}
  else{gr.addColorStop(0,'rgba(255,246,190,1)');gr.addColorStop(.35,'rgba(255,170,50,.95)');gr.addColorStop(.75,'rgba(214,70,20,.55)');gr.addColorStop(1,'rgba(160,40,10,0)')}
  g.fillStyle=gr;g.fillRect(0,0,32,32);return c}
function partSeen(x,y){return vis[tileOf(x,y)]}
// golpes: faísca no corpo a corpo, poeira na flechada, lasca quando acerta prédio
const dealDmgFx=dealDmg;
dealDmg=function(att,t,base){if(t&&!t.dead&&running){
    if(t.k==='u'){if(partSeen(t.x,t.y)){const a=E.get(att.id),rng=a&&a.k==='u'&&ST(a).rng>0;pEmit(rng?'d':'s',t.x,t.y,12,rng?1:4,.5)}}
    else{const c=ctr(t);if(partSeen(c.x,c.y)){pEmit('c',c.x,c.y,t.sz*10,3,1);pEmit('d',c.x,c.y,t.sz*8,1,1.5)}}}
  dealDmgFx(att,t,base)};
// mortes: prédio desaba numa nuvem de poeira e lascas
const killFx=kill;
kill=function(e,by){if(e&&!e.dead&&running){
    if(e.k==='b'){const c=ctr(e);if(partSeen(c.x,c.y)){pEmit('d',c.x,c.y,6,8+e.sz*3,e.sz*2.2);pEmit('c',c.x,c.y,e.sz*8,6+e.sz*2,1.6);pEmit('m',c.x,c.y,e.sz*6,4,e.sz)}}
    else if(e.k==='u'&&e.o!==GAIA&&partSeen(e.x,e.y))pEmit('d',e.x,e.y,2,3,.8)}
  killFx(e,by)};
const PART_DUST={cav:1,arqcav:1,elef:1,cerco:1,merc:1};
function partAmbient(){
  // prédios feridos soltam fumaça; muito feridos, pegam fogo
  for(const b of G.B){if(b.dead||b.done<1||b.type==='fazenda'||b.type==='muralha')continue;const f=b.hp/b.mhp;if(f>=.6)continue;const c=ctr(b);if(!partSeen(c.x,c.y))continue;
    if(Math.random()<(.6-f)*3)pEmit('m',c.x,c.y,b.sz*13,1,b.sz*1.2);
    // focos de incêndio em pontos fixos do prédio (pelo id), para parecer fogo e não chuvisco
    if(f<.4){const n=f<.2?3:2;for(let i=0;i<n;i++){const h=(b.id*37+i*101)%97/97,h2=(b.id*53+i*71)%89/89;pEmit('f',c.x+(h-.5)*b.sz*TS*.7,c.y+(h2-.5)*b.sz*TS*.7,b.sz*(5+h*7),3,1);if(Math.random()<.5)pEmit('m',c.x+(h-.5)*b.sz*TS*.7,c.y+(h2-.5)*b.sz*TS*.7,b.sz*(9+h*7),1,.3)}}}
  // cavalaria, elefantes e máquinas levantam poeira andando
  for(const u of G.U){if(u.dead||u.inT||!u.mv)continue;if(!PART_DUST[UT[u.type].cls])continue;if(!partSeen(u.x,u.y))continue;if(Math.random()<.5)pEmit('d',u.x,u.y,0,1,.7)}}
function drawParts(){const now=performance.now();let dt=Math.min(.05,(now-partLast)/1000);partLast=now;if(paused||!running)dt=0;
  if(dt>0){partAcc+=dt;if(partAcc>.12){partAcc=0;partAmbient()}}
  if(!PART.length)return;
  for(let i=PART.length-1;i>=0;i--){const p=PART[i];p.t+=dt;if(p.t>=p.T){PART.splice(i,1);continue}
    p.x+=p.vx*dt;p.y+=p.vy*dt;const f=p.t/p.T;
    if(p.k==='s'){p.vy+=220*dt;ctx.globalAlpha=1-f;ctx.fillStyle=f<.4?'#fff6c8':'#ffb040';ctx.fillRect(p.x-p.r/2,p.y-p.r/2,p.r,p.r)}
    else if(p.k==='c'){p.vy+=260*dt;ctx.globalAlpha=1-f*f;ctx.fillStyle=p.c;ctx.fillRect(p.x-p.r/2,p.y-p.r/2,p.r,p.r)}
    else{const S=PSPR[p.k]||(PSPR[p.k]=pSprite(p.k));let r,al;
      if(p.k==='d'){al=.6*(1-f);r=p.r*(1+f*1.4)*1.5}
      else if(p.k==='m'){al=.7*(1-f)*Math.min(1,f*6);r=p.r*(1+f*2.2)*1.5}
      else{al=.9*(1-f*f);r=p.r*(1.25-f*.85)}
      ctx.globalAlpha=al;ctx.drawImage(S,p.x-r,p.y-r,r*2,r*2)}}
  ctx.globalAlpha=1}
