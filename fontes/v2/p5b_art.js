
// =========================================================
//   ARTE v3 — personagens animados, árvores, minas e terreno com relevo
//   (desenhos originais gerados por código)
// =========================================================
const OL='rgba(24,13,4,.62)';
// tamanhos dos desenhos: [largura, altura, âncora x, âncora y (pés)]
(function(){const H=[46,64,23,58],M=[68,74,34,67];
  for(const t of['vill','guer','espa','hopl','arq','arqc','sac'])UT[t].spr=H;
  for(const t of['bat','cav','arqcav'])UT[t].spr=M;
  UT.carro.spr=[76,66,38,59];UT.elef.spr=[92,92,46,82];UT.elfs.spr=[86,74,43,66];
  UT.pedra.spr=[70,62,35,54];UT.bal.spr=[70,58,35,50];
  UT.pesc.spr=[76,70,38,52];UT.trans.spr=[90,80,45,58];UT.bguer.spr=[92,92,46,70];UT.trir.spr=[108,100,54,76];
  UT.gaz.spr=[50,46,25,40];UT.leao.spr=[58,44,29,38];})();
const SKINS={egito:'#b97c4e',grego:'#d6a174',babilonia:'#b9844f',oriental:'#e2b487'};
function limb(g,x0,y0,x1,y1,w0,w1,col){const a=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(a),ny=Math.cos(a);g.beginPath();g.moveTo(x0+nx*w0/2,y0+ny*w0/2);g.lineTo(x1+nx*w1/2,y1+ny*w1/2);g.arc(x1,y1,w1/2,a+Math.PI/2,a-Math.PI/2,true);g.lineTo(x0-nx*w0/2,y0-ny*w0/2);g.arc(x0,y0,w0/2,a-Math.PI/2,a+Math.PI/2,true);g.closePath();g.fillStyle=col;g.fill();g.strokeStyle=OL;g.lineWidth=.55;g.stroke()}
function blobS(g,x,y,rx,ry,col,ol){const r=Math.max(rx,ry);const gr=g.createRadialGradient(x-rx*.4,y-ry*.45,r*.08,x,y,r*1.08);gr.addColorStop(0,sh(col,1.3));gr.addColorStop(.55,col);gr.addColorStop(1,sh(col,.62));g.fillStyle=gr;g.beginPath();g.ellipse(x,y,Math.max(.2,rx),Math.max(.2,ry),0,0,7);g.fill();if(ol!==false){g.strokeStyle=OL;g.lineWidth=.55;g.stroke()}}
function polyS(g,pts,col,x0,x1){const gr=g.createLinearGradient(x0,0,x1,0);gr.addColorStop(0,sh(col,1.22));gr.addColorStop(.5,col);gr.addColorStop(1,sh(col,.68));poly(g,pts,gr,OL,.55)}
// ---------- pessoas ----------
const HUM={vill:{hat:'straw'},guer:{hat:'band',wpn:'club'},guerA:{hat:'band',wpn:'axe'},espa:{hat:'helm',wpn:'sword',shield:'rect',armor:'#a9a9b5'},
  hopl:{hat:'crest',wpn:'spear',shield:'round',armor:'#c9a24a',greaves:1},arq:{hat:'band',wpn:'bow',quiver:1},arqc:{hat:'helm',wpn:'bow',quiver:1,armor:'#8c7558'},
  sac:{hat:'hood',wpn:'staff',robe:'#f0e7d3'}};
function poseOf(fr,w){
  const p={sw:0,bob:0,aa:.28,ae:.35,wa:.55,ba:-.15,be:.35,draw:0};
  if(fr>=1&&fr<=4){const k=fr-1;p.sw=[1,.35,-1,-.35][k];p.bob=[0,1.3,0,1.3][k];p.aa=.28-p.sw*.5;p.ba=-.15+p.sw*.5}
  if(w==='spear'){p.aa=.4-p.sw*.2;p.ae=.15;p.wa=3.06}
  if(w==='bow'){p.aa=1.4;p.ae=.08;p.wa=1.5708;p.ba=1.25;p.be=.7}
  if(w==='staff'){p.aa=.55;p.ae=.05;p.wa=3.1}
  if(!w){p.wa=.9}
  if(fr>=5){const k=fr-5;
    if(w==='spear'){p.aa=[1.05,1.35,1.55][k];p.ae=[.5,.25,.02][k];p.wa=[1.78,1.64,1.58][k]}
    else if(w==='bow'){p.draw=[.25,.7,1][k];p.ba=[1.2,1.05,.95][k];p.be=[.9,1.6,2.2][k]}
    else if(w==='staff'){p.aa=[2.5,2.7,2.85][k];p.ae=.05;p.wa=3.1;p.ba=[2.2,2.5,2.7][k];p.be=.1}
    else{p.aa=[2.75,1.75,.75][k];p.ae=[.45,.3,.12][k];p.wa=[3.5,2.2,.95][k]}}
  return p;
}
function headgear(g,hx,hy,hat,back,C){
  const hair='#2e1b0e';
  if(hat==='straw'){g.fillStyle=hair;g.beginPath();g.arc(hx,hy-.6,4.4,Math.PI*.95,Math.PI*2.05);g.fill();
    blobS(g,hx,hy-3,8.4,2.5,'#d9bc68');blobS(g,hx,hy-4.6,4.2,2.6,'#e2c878');ln(g,hx-4,hy-3.6,hx+4,hy-3.6,'#9a6a2a',.9);return}
  if(hat==='band'){g.fillStyle=hair;g.beginPath();g.arc(hx,hy-.4,4.6,Math.PI*(back?.0:.95),Math.PI*2.05);g.fill();if(back){circ(g,hx,hy,4.4,hair)}ln(g,hx-4.4,hy-2.2,hx+4.4,hy-2.2,C.d,1.4);if(!back)ln(g,hx-4.6,hy-2.2,hx-7,hy+.5,C.d,1);return}
  if(hat==='helm'){g.fillStyle=hair;if(back)circ(g,hx,hy,4.4,hair);blobS(g,hx,hy-1.6,5,3.8,'#a8a8b2');ibx(g,hx-5,hy-1,10,1.4,'#7a7a84');if(!back)ibx(g,hx+2.6,hy-1,1.3,3.2,'#8a8a94');return}
  if(hat==='crest'){if(back)circ(g,hx,hy,4.4,hair);blobS(g,hx,hy-1.4,5.1,4,'#d2a446');if(!back)ibx(g,hx+1.8,hy-1,1.5,4,'#b08a36');
    g.fillStyle=C.d;g.beginPath();g.moveTo(hx-6,hy-2);g.quadraticCurveTo(hx-1,hy-12.5,hx+6,hy-4.5);g.lineTo(hx+3.5,hy-3.5);g.quadraticCurveTo(hx-1,hy-8.5,hx-4,hy-1.5);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=.5;g.stroke();return}
  if(hat==='hood'){g.fillStyle='#e6dcc6';g.beginPath();if(back)g.arc(hx,hy,5.3,0,7);else{g.moveTo(hx+1,hy);g.arc(hx,hy,5.3,Math.PI*.32,Math.PI*1.72);g.lineTo(hx+1.5,hy-3.5)}g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=.5;g.stroke();return}
  g.fillStyle=hair;g.beginPath();g.arc(hx,hy-.5,4.5,Math.PI,Math.PI*2);g.fill();
}
function weapon(g,hx,hy,wa,cfg,C,p,bh){
  const dx=Math.sin(wa),dy=Math.cos(wa),w=cfg.wpn;
  if(w==='club'){limb(g,hx-dx*2,hy-dy*2,hx+dx*12,hy+dy*12,2,3.6,'#7a4e26');blobS(g,hx+dx*12,hy+dy*12,2.6,2.6,'#6a4220')}
  else if(w==='axe'){limb(g,hx-dx*2,hy-dy*2,hx+dx*13,hy+dy*13,1.8,1.8,'#7a5230');const ex=hx+dx*11.5,ey=hy+dy*11.5,nx=-dy,ny=dx;poly(g,[[ex,ey],[ex+nx*5.5+dx*3,ey+ny*5.5+dy*3],[ex+nx*6-dx*3,ey+ny*6-dy*3]],'#c8ccd2',OL,.5)}
  else if(w==='sword'){const ex=hx+dx*13,ey=hy+dy*13;g.strokeStyle='#4a4a52';g.lineWidth=2.6;g.beginPath();g.moveTo(hx+dx*2,hy+dy*2);g.lineTo(ex,ey);g.stroke();g.strokeStyle='#e8ecf2';g.lineWidth=1.5;g.stroke();
    ln(g,hx+dx*1.8-dy*2.6,hy+dy*1.8+dx*2.6,hx+dx*1.8+dy*2.6,hy+dy*1.8-dx*2.6,'#9a7a3a',1.6);circ(g,hx-dx*1.5,hy-dy*1.5,1.2,'#9a7a3a')}
  else if(w==='spear'){ln(g,hx-dx*12,hy-dy*12,hx+dx*24,hy+dy*24,'#3a2410',2.4);ln(g,hx-dx*12,hy-dy*12,hx+dx*24,hy+dy*24,'#8a6236',1.4);const tx=hx+dx*24,ty=hy+dy*24;poly(g,[[tx+dx*5,ty+dy*5],[tx-dy*1.8,ty+dx*1.8],[tx+dy*1.8,ty-dx*1.8]],'#dfe3ea',OL,.5)}
  else if(w==='staff'){ln(g,hx-dx*14,hy-dy*14,hx+dx*12,hy+dy*12,'#5a3a1e',2);ln(g,hx-dx*14,hy-dy*14,hx+dx*12,hy+dy*12,'#9a6c3a',1.1);blobS(g,hx+dx*13.5,hy+dy*13.5,2.4,2.4,'#f0c84a')}
  else if(w==='bow'){const r=11;g.strokeStyle='#3a220c';g.lineWidth=2.4;g.beginPath();g.arc(hx-3,hy,r,-1.15,1.15);g.stroke();g.strokeStyle='#8a5a2a';g.lineWidth=1.4;g.stroke();
    const t1=[hx-3+Math.cos(-1.15)*r,hy+Math.sin(-1.15)*r],t2=[hx-3+Math.cos(1.15)*r,hy+Math.sin(1.15)*r];
    const sx=p.draw>0&&bh?bh[0]:t1[0],sy=p.draw>0&&bh?bh[1]:hy;g.strokeStyle='rgba(240,236,220,.9)';g.lineWidth=.6;g.beginPath();g.moveTo(t1[0],t1[1]);g.lineTo(sx,sy);g.lineTo(t2[0],t2[1]);g.stroke();
    if(p.draw>0&&bh){ln(g,bh[0],bh[1],hx+6,hy,'#c8a878',1);poly(g,[[hx+8,hy],[hx+5,hy-1.4],[hx+5,hy+1.4]],'#dfe3ea')}}
}
function shield(g,x,y,kind,C,back){
  if(kind==='round'){blobS(g,x,y,7.6,8.4,'#c9a046');blobS(g,x,y,5.6,6.3,back?sh(C.m,.8):C.m,false);ln(g,x-5,y,x+5,y,sh(C.m,1.4),1);circ(g,x,y,1.6,'#e8c86a')}
  else{const gr=g.createLinearGradient(x-5,0,x+5,0);gr.addColorStop(0,sh(C.m,1.2));gr.addColorStop(1,sh(C.m,.7));g.fillStyle=gr;g.beginPath();g.roundRect?g.roundRect(x-5,y-8,10,15,2.5):g.rect(x-5,y-8,10,15);g.fill();g.strokeStyle='#c8ccd2';g.lineWidth=1.1;g.stroke();circ(g,x,y-.5,1.8,'#d8d8e0')}
}
function drawHuman(g,cx,gy,cfg,C,skin,fr,back,meta){
  const p=poseOf(fr,cfg.wpn),y=gy-p.bob,m=C.m;
  const sk2=sh(skin,.78);
  ell(g,cx,gy,10,3.6,'rgba(0,0,0,.3)');
  const hipY=y-16,shY=y-28;
  const legCol=cfg.greaves?'#b48e3c':skin;
  const leg=(hx,a,col)=>{const kx=hx+Math.sin(a)*7.4,ky=hipY+Math.cos(a)*7.4;const fx=kx+Math.sin(a*.45)*7.8,fy=Math.min(gy-.8,ky+Math.cos(a*.45)*7.8);limb(g,hx,hipY,kx,ky,4.2,3.3,col);limb(g,kx,ky,fx,fy,3.3,2.6,col);g.fillStyle='#4a2c14';g.beginPath();g.ellipse(fx+1.5,fy+.3,2.8,1.4,0,0,7);g.fill()};
  const arm=(sx,a,e,col)=>{const ex=sx+Math.sin(a)*6.2,ey=shY+Math.cos(a)*6.2;const hx=ex+Math.sin(a+e)*5.8,hy=ey+Math.cos(a+e)*5.8;limb(g,sx,shY,ex,ey,3.6,3,col);limb(g,ex,ey,hx,hy,3,2.6,col);circ(g,hx,hy,1.7,col);return[hx,hy]};
  let bh=null;
  const front=()=>{const h=arm(cx+3.2,p.aa,p.ae,skin);if(cfg.wpn)weapon(g,h[0],h[1],p.wa,cfg,C,p,bh);if(meta)meta[fr]={hx:h[0]-cx,hy:h[1]-gy,wa:p.wa}};
  if(cfg.quiver&&!back){g.fillStyle='#6a3e1c';g.save();g.translate(cx-5,y-27);g.rotate(-.35);g.fillRect(-2,0,4,11);g.restore();ln(g,cx-7,y-29,cx-8,y-31,'#e8e0c8',1)}
  if(back&&cfg.wpn)front();
  bh=arm(cx-3.2,p.ba,p.be,sk2);
  if(!cfg.robe){leg(cx-2.1,-p.sw*.45,sh(legCol,.8));leg(cx+2.1,p.sw*.45,legCol)}
  if(cfg.robe){const sw=p.sw*1.3;polyS(g,[[cx-5.8,shY+1],[cx+5.8,shY+1],[cx+8.5+sw,gy-.8],[cx-8.5+sw,gy-.8]],cfg.robe,cx-9,cx+9);ln(g,cx-1,shY+3,cx-1+sw,gy-2,sh(cfg.robe,.8),1.1);ln(g,cx-6,y-15,cx+6.5,y-13.5,m,2.8)}
  else{polyS(g,[[cx-5.8,y-21.5],[cx+5.8,y-21.5],[cx+7.4,y-9.6],[cx-7.4,y-9.6]],m,cx-7.4,cx+7.4);for(const f of[-3.4,0,3.4])ln(g,cx+f,y-18.5,cx+f*1.3,y-10.2,sh(m,.72),.6)}
  const tor=cfg.armor||m;
  if(!cfg.robe){polyS(g,[[cx-5.9,shY-.6],[cx+5.9,shY-.6],[cx+5.2,y-15.5],[cx-5.2,y-15.5]],tor,cx-6,cx+6);
    if(cfg.armor){ln(g,cx-4.4,shY+3,cx+4.4,shY+3,sh(cfg.armor,1.35),.8);ln(g,cx+.5,shY+1,cx+.5,y-16.5,sh(cfg.armor,.7),.6)}else ln(g,cx-5,shY+1,cx+4,y-17,sh(m,1.35),1.3);
    ln(g,cx-5.6,y-16,cx+5.6,y-16,'#5a3a1a',1.7);circ(g,cx+.6,y-16,1,'#c9a24a')}
  if(cfg.shield&&!back)shield(g,cx-6.5,y-19.5,cfg.shield,C,false);
  if(cfg.quiver&&back){g.fillStyle='#6a3e1c';g.save();g.translate(cx+2,y-27);g.rotate(.3);g.fillRect(-2,0,4,11);g.restore()}
  ibx(g,cx-1.1,shY-3.2,2.6,3.4,sk2);
  const hx=cx+.7,hy=y-33;
  blobS(g,hx,hy,4.5,4.8,skin);
  if(!back){circ(g,hx+2.3,hy-.4,.7,'#1a0e06');ln(g,hx+3.7,hy+.7,hx+4.6,hy+1.5,sk2,.9);ln(g,hx+1.8,hy+2.6,hx+3.2,hy+2.5,sh(skin,.6),.6)}
  headgear(g,hx,hy,cfg.hat,back,C);
  if(cfg.shield&&back)shield(g,cx-.5,y-21,cfg.shield,C,true);
  if(!(back&&cfg.wpn))front();
}
// ---------- cavalos e montados ----------
function horse(g,cx,gy,coat,fr,barding){
  const c2=sh(coat,.7),ph=fr>=1&&fr<=4?(fr-1)/4:0,mv=fr>=1&&fr<=4;
  ell(g,cx,gy,19,5,'rgba(0,0,0,.3)');
  const s=Math.sin(ph*6.283),c=Math.cos(ph*6.283),k=mv?.55:0;
  const leg=(x,a,col)=>{const ky=gy-8.5,kx=x+Math.sin(a)*5;const fx=kx+Math.sin(a*1.4)*4.5,fy=gy-.6;limb(g,x,gy-17,kx,ky,4.2,3,col);limb(g,kx,ky,fx,fy,2.8,2.3,col);ell(g,fx+.8,fy+.1,2,1.1,'#1e140a')};
  leg(cx-11,-s*k,c2);leg(cx+10,c*k,c2);
  g.strokeStyle=sh(coat,.45);g.lineWidth=2.6;g.beginPath();g.moveTo(cx-15,gy-21);g.quadraticCurveTo(cx-21,gy-16+(mv?s*2:0),cx-19,gy-7);g.stroke();
  blobS(g,cx,gy-20,16,7.5,coat);ell(g,cx+1,gy-15.5,12,2.2,sh(coat,.78));
  if(barding){g.fillStyle=barding;g.beginPath();g.moveTo(cx-14,gy-25);g.lineTo(cx+12,gy-25);g.lineTo(cx+11,gy-13);g.lineTo(cx-13,gy-13);g.closePath();g.fill();g.strokeStyle='#d8c070';g.lineWidth=.8;g.stroke()}
  polyS(g,[[cx+9,gy-24],[cx+15,gy-36],[cx+21,gy-35],[cx+16,gy-19]],coat,cx+9,cx+21);
  blobS(g,cx+21.5,gy-34,6.2,3.6,coat);ell(g,cx+26.5,gy-33,2,2,sh(coat,.6));poly(g,[[cx+18,gy-38],[cx+19.5,gy-42],[cx+20.5,gy-37.5]],coat,OL,.5);
  ln(g,cx+11,gy-27,cx+17,gy-38,'#22140a',2.2);circ(g,cx+22,gy-35,.9,'#111');
  leg(cx-8,s*k,coat);leg(cx+12,-c*k,coat);
}
function rider(g,cx,gy,cfg,C,skin,fr,meta){
  const p=poseOf(fr,cfg.wpn),y=gy-25,m=C.m;
  const shY=y-14.5;
  limb(g,cx-1,y-2,cx+3,y+6,4,3.2,skin);limb(g,cx+3,y+6,cx+2.5,y+12,3.2,2.6,skin);ell(g,cx+3.6,y+12.3,2.4,1.2,'#4a2c14');
  const arm=(sx,a,e,col)=>{const ex=sx+Math.sin(a)*6,ey=shY+Math.cos(a)*6;const hx=ex+Math.sin(a+e)*5.6,hy=ey+Math.cos(a+e)*5.6;limb(g,sx,shY,ex,ey,3.4,2.9,col);limb(g,ex,ey,hx,hy,2.9,2.5,col);circ(g,hx,hy,1.6,col);return[hx,hy]};
  const bh=arm(cx-3,p.ba,p.be,sh(skin,.78));
  polyS(g,[[cx-5.6,shY-.6],[cx+5.6,shY-.6],[cx+5.4,y-1],[cx-5.4,y-1]],cfg.armor||m,cx-6,cx+6);ln(g,cx-5.5,y-2,cx+5.5,y-2,'#5a3a1a',1.5);
  if(cfg.shield)shield(g,cx-6,y-6,cfg.shield,C,false);
  const hx=cx+.6,hy=y-19.5;blobS(g,hx,hy,4.4,4.6,skin);circ(g,hx+2.2,hy-.4,.7,'#1a0e06');headgear(g,hx,hy,cfg.hat,false,C);
  const h=arm(cx+3,p.aa,p.ae,skin);if(cfg.wpn)weapon(g,h[0],h[1],p.wa,cfg,C,p,bh);
}
const MOUNT={bat:{coat:'#a0703e',r:{hat:'band',wpn:'spear'}},cav:{coat:'#4e3424',bard:1,r:{hat:'helm',wpn:'spear',armor:'#a9a9b5',shield:'round'}},arqcav:{coat:'#7a5434',r:{hat:'band',wpn:'bow',quiver:1}}};
function drawMounted(g,cx,gy,type,C,skin,fr){const M=MOUNT[type];horse(g,cx-2,gy,M.coat,fr,M.bard?C.m:null);rider(g,cx-3,gy-1,M.r,C,skin,fr)}
// ---------- elefante, carro, cerco ----------
function elephantA(g,cx,gy,col,fr,war,C,skin){
  const ph=fr>=1&&fr<=4?(fr-1)/4:0,mv=fr>=1&&fr<=4,s=Math.sin(ph*6.283)*(mv?1:0);
  ell(g,cx,gy,25,6,'rgba(0,0,0,.3)');
  const leg=(x,o,c)=>{limb(g,x,gy-22,x+o,gy-1,8,6.6,c);ell(g,x+o,gy-.5,4,1.6,sh(col,.5))};
  leg(cx-14,-s*2.5,sh(col,.72));leg(cx+10,s*2.5,sh(col,.72));
  blobS(g,cx,gy-28,23,15,col);
  g.globalAlpha=.25;for(let i=0;i<5;i++)ln(g,cx-12+i*6,gy-36,cx-14+i*6,gy-20,'#000',.5);g.globalAlpha=1;
  blobS(g,cx+20,gy-33,10,11,col);blobS(g,cx+14,gy-33,7.5,10,sh(col,.86));
  g.strokeStyle=OL;g.lineWidth=6.4;g.beginPath();g.moveTo(cx+27,gy-30);g.quadraticCurveTo(cx+35,gy-16,cx+30,gy-5+(mv?s*2:0));g.stroke();g.strokeStyle=col;g.lineWidth=5.2;g.stroke();
  g.strokeStyle='#f4ecd8';g.lineWidth=2.2;g.beginPath();g.moveTo(cx+25,gy-25);g.quadraticCurveTo(cx+34,gy-22,cx+35,gy-29);g.stroke();
  circ(g,cx+24,gy-36,1.1,'#111');ln(g,cx-22,gy-28,cx-26,gy-16,sh(col,.6),2);
  leg(cx-9,s*2.5,col);leg(cx+15,-s*2.5,col);
  if(war){ibx(g,cx-13,gy-56,24,14,'#8a5a2a');ibx(g,cx-13,gy-56,24,4,C.m);ibx(g,cx-13,gy-46,24,3,sh(C.m,.7));blobS(g,cx-1,gy-42,18,4.6,'#c9a24a',false);
    const p=poseOf(fr,'spear');circ(g,cx-2,gy-61,4.3,skin);headgear(g,cx-2,gy-61,'helm',false,C);ibx(g,cx-6,gy-58,8,6,C.m);const dx=Math.sin(p.wa),dy=Math.cos(p.wa);ln(g,cx+3-dx*8,gy-55-dy*8,cx+3+dx*20,gy-55+dy*20,'#8a6236',1.6)}
}
function chariot(g,cx,gy,C,skin,fr){
  ell(g,cx,gy,28,5.5,'rgba(0,0,0,.3)');horse(g,cx+12,gy,'#8a5a32',fr,null);
  ln(g,cx-4,gy-16,cx+6,gy-18,'#5a3a1e',2);
  polyS(g,[[cx-26,gy-27],[cx-6,gy-27],[cx-6,gy-12],[cx-26,gy-14]],C.m,cx-26,cx-6);ibx(g,cx-26,gy-28,20,2.2,'#c9a24a');
  const rot=(fr%4)*.4;g.strokeStyle='#3a2410';g.lineWidth=2.6;g.beginPath();g.ellipse(cx-16,gy-9,8,9,0,0,7);g.stroke();for(let a=0;a<4;a++){const t=rot+a*.785;ln(g,cx-16+Math.cos(t)*8,gy-9+Math.sin(t)*9,cx-16-Math.cos(t)*8,gy-9-Math.sin(t)*9,'#7a5230',1.1)}circ(g,cx-16,gy-9,1.8,'#c9a24a');
  const p=poseOf(fr,'spear');limb(g,cx-16,gy-34,cx-12,gy-27,5,4,C.m);blobS(g,cx-15,gy-39,4.2,4.4,skin);headgear(g,cx-15,gy-39,'helm',false,C);
  const dx=Math.sin(p.wa),dy=Math.cos(p.wa);ln(g,cx-12-dx*10,gy-31-dy*10,cx-12+dx*20,gy-31+dy*20,'#8a6236',1.6);
}
function siege(g,cx,gy,type,C,fr){
  ell(g,cx,gy,26,6,'rgba(0,0,0,.3)');const rot=(fr%4)*.5;
  const wheel=(x)=>{g.strokeStyle='#3a2410';g.lineWidth=2.8;g.beginPath();g.ellipse(x,gy-7,6,7,0,0,7);g.stroke();for(let a=0;a<3;a++){const t=rot+a*1.05;ln(g,x+Math.cos(t)*6,gy-7+Math.sin(t)*7,x-Math.cos(t)*6,gy-7-Math.sin(t)*7,'#7a5230',1)}};
  wheel(cx-14);wheel(cx+12);
  polyS(g,[[cx-22,gy-17],[cx+20,gy-17],[cx+20,gy-10],[cx-22,gy-10]],'#8a6034',cx-22,cx+20);ibx(g,cx-22,gy-17,42,2.2,C.m);
  if(type==='pedra'){limb(g,cx-8,gy-17,cx-2,gy-34,3.4,2.8,'#6a4626');limb(g,cx+6,gy-17,cx-2,gy-34,3.4,2.8,'#6a4626');
    const a=fr>=5?[-.2,.6,1.2][fr-5]:-.35;const ex=cx-2-Math.cos(a)*24,ey=gy-30-Math.sin(a)*24;limb(g,cx+12,gy-18,ex,ey,3,2.4,'#9a7040');blobS(g,ex,ey,4.8,3.4,'#5a4026');if(fr<6)blobS(g,ex,ey-2.4,2.8,2.8,'#8a8a88');
    ibx(g,cx+9,gy-23,7,7,'#5a5a5a')}
  else{limb(g,cx,gy-17,cx,gy-27,3.2,3,'#6a4626');polyS(g,[[cx-16,gy-30],[cx+20,gy-30],[cx+20,gy-26],[cx-16,gy-26]],'#8a6034',cx-16,cx+20);
    const pull=fr>=5?[1,.5,0][fr-5]:1;g.strokeStyle='#4a2a14';g.lineWidth=2.4;g.beginPath();g.moveTo(cx+8,gy-44);g.quadraticCurveTo(cx+17,gy-29,cx+8,gy-14);g.stroke();
    const sx=cx+8-pull*14;ln(g,cx+8,gy-44,sx,gy-29,'#ddd',.7);ln(g,cx+8,gy-14,sx,gy-29,'#ddd',.7);if(pull>.3)ln(g,sx,gy-29,cx+22,gy-29,'#cfcfcf',1.4)}
}
// ---------- barcos ----------
function boat(g,cx,gy,type,C,fr){
  const m=C.m,mv=fr>=1&&fr<=4,os=mv?[0,.5,1,.5][fr-1]:.3;
  const L={pesc:50,trans:70,bguer:72,trir:90}[type],wood={pesc:'#8a6236',trans:'#7a5530',bguer:'#6a4a2c',trir:'#5a3e24'}[type];
  ell(g,cx,gy-6,L*.62,8,'rgba(255,255,255,.2)');ell(g,cx,gy-5,L*.56,6,'rgba(10,30,60,.25)');
  if(type==='bguer'||type==='trir'){const n=type==='trir'?9:6;for(let i=0;i<n;i++){const x=cx-L*.38+i*(L*.76/(n-1));ln(g,x,gy-13,x-5+os*7,gy-1,'#3a2410',1.4)}}
  const hp=[[cx-L*.5,gy-19],[cx+L*.42,gy-19],[cx+L*.56,gy-28],[cx+L*.47,gy-9],[cx-L*.4,gy-6],[cx-L*.55,gy-15]];
  polyS(g,hp,wood,cx-L*.5,cx+L*.5);
  g.globalAlpha=.3;for(let i=1;i<4;i++)ln(g,cx-L*.48,gy-19+i*3.2,cx+L*.45,gy-19+i*3.2,'#000',.5);g.globalAlpha=1;
  ln(g,cx-L*.49,gy-16.5,cx+L*.44,gy-16.5,m,2.4);ln(g,cx-L*.5,gy-19,cx+L*.42,gy-19,sh(wood,1.4),1);
  if(type==='trir')poly(g,[[cx+L*.47,gy-11],[cx+L*.62,gy-9],[cx+L*.47,gy-7]],'#b08a4a',OL,.5);
  const sail=(x,top,bot,w,stripe)=>{ln(g,x,bot,x,top-5,'#4a2e14',2);ln(g,x-w/2,top,x+w/2,top,'#4a2e14',1.6);
    const gr=g.createLinearGradient(x-w/2,0,x+w/2,0);gr.addColorStop(0,'#fbf6e8');gr.addColorStop(1,'#cfc4a8');g.fillStyle=gr;g.beginPath();g.moveTo(x-w/2,top);g.lineTo(x+w/2,top);g.quadraticCurveTo(x+w/2+5,(top+bot)/2,x+w/2,bot-5);g.lineTo(x-w/2,bot-5);g.quadraticCurveTo(x-w/2+4,(top+bot)/2,x-w/2,top);g.fill();g.strokeStyle=OL;g.lineWidth=.6;g.stroke();
    if(stripe){g.fillStyle=stripe;g.fillRect(x-w/2+1,(top+bot)/2-3.5,w-1,6)}};
  if(type==='pesc'){sail(cx-3,gy-50,gy-19,18,null);blobS(g,cx+12,gy-25,3.2,3.4,'#d6a174');ibx(g,cx+10,gy-23,5,4,m);g.strokeStyle='rgba(235,225,195,.75)';g.lineWidth=.6;for(let i=0;i<5;i++)ln(g,cx-22+i*3,gy-21,cx-26+i*3,gy-7,'rgba(235,225,195,.75)',.6)}
  if(type==='trans'){sail(cx,gy-60,gy-19,30,sh(m,1.05));for(let i=0;i<3;i++)ibx(g,cx-26+i*9,gy-25,7,6,'#a87a3e')}
  if(type==='bguer'){sail(cx-2,gy-66,gy-19,28,m);ibx(g,cx+20,gy-25,9,6,C.d)}
  if(type==='trir'){sail(cx-6,gy-74,gy-19,34,m);sail(cx+24,gy-50,gy-19,15,null);ibx(g,cx-38,gy-27,10,8,C.d)}
}
// ---------- animais ----------
function animal(g,cx,gy,type,fr){
  const mv=fr>=1&&fr<=4,ph=mv?(fr-1)/4:0,s=Math.sin(ph*6.283),c=Math.cos(ph*6.283);
  if(type==='gaz'){ell(g,cx,gy,13,3.4,'rgba(0,0,0,.3)');const leg=(x,a,col)=>{limb(g,x,gy-14,x+Math.sin(a)*4,gy-7,2.2,1.6,col);limb(g,x+Math.sin(a)*4,gy-7,x+Math.sin(a)*5,gy-.6,1.6,1.3,col)};
    leg(cx-8,-s*.6,'#8a5a30');leg(cx+7,c*.6,'#8a5a30');blobS(g,cx,gy-17,12,5.6,'#c8925a');ell(g,cx,gy-13.6,8.5,2.4,'#f2e6cc');
    polyS(g,[[cx+7,gy-19],[cx+12,gy-30],[cx+16,gy-28],[cx+12,gy-16]],'#c8925a',cx+7,cx+16);blobS(g,cx+15.5,gy-30,4.4,2.8,'#c8925a');
    ln(g,cx+14,gy-32,cx+11,gy-40,'#2a1a0a',1.3);ln(g,cx+16,gy-32,cx+16,gy-40,'#2a1a0a',1.3);circ(g,cx+16.5,gy-30.5,.75,'#111');ln(g,cx-11,gy-18,cx-13.5,gy-14,'#3a2a1a',1.6);
    leg(cx-6,s*.6,'#a8723e');leg(cx+9,-c*.6,'#a8723e');return}
  if(type==='leao'){ell(g,cx,gy,17,3.8,'rgba(0,0,0,.3)');const leg=(x,a,col)=>limb(g,x,gy-12,x+Math.sin(a)*5,gy-.8,3.6,2.8,col);
    leg(cx-10,-s*.5,'#a8742e');leg(cx+8,c*.5,'#a8742e');g.strokeStyle='#c8902e';g.lineWidth=2;g.beginPath();g.moveTo(cx-14,gy-16);g.quadraticCurveTo(cx-22,gy-18,cx-20,gy-27+(mv?s*2:0));g.stroke();blobS(g,cx-20,gy-27,2,2.6,'#6a3e14');
    blobS(g,cx,gy-15,14,6.6,'#d6a046');blobS(g,cx+13,gy-18,8.4,9,'#7a4a1e');blobS(g,cx+15,gy-17,5,4.8,'#d6a046');circ(g,cx+17.5,gy-18.5,.85,'#111');ell(g,cx+19.6,gy-15.4,1.7,1.2,'#3a2a1a');
    leg(cx-7,s*.5,'#d0983c');leg(cx+11,-c*.5,'#d0983c');return}
  if(type==='elfs')elephantA(g,cx,gy,'#8e8a84',fr,false);
}
// ---------- folhagem, árvores e recursos ----------
function crown(g,cx,cy,rx,ry,base,R,n){
  blobS(g,cx,cy,rx,ry,sh(base,.75),false);
  for(let i=0;i<n;i++){const a=R()*6.283,r=Math.sqrt(R());const x=cx+Math.cos(a)*rx*r*.82,y=cy+Math.sin(a)*ry*r*.82;const lit=clamp(1.05-(x-cx)/rx*.22-(y-cy)/ry*.28+(R()-.5)*.15,.62,1.4);const s=2.6+R()*4.2;blobS(g,x,y,s,s*.82,sh(base,lit),false)}
  for(let i=0;i<n*.6;i++){const a=R()*6.283,r=Math.sqrt(R());const x=cx+Math.cos(a)*rx*r*.8,y=cy+Math.sin(a)*ry*r*.8;if(x>cx+rx*.25&&y>cy)continue;circ(g,x,y,.7+R()*.8,sh(base,1.55))}
  g.strokeStyle='rgba(20,30,10,.35)';g.lineWidth=.6;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.stroke();
}
function bark(g,x0,y0,x1,y1,w0,w1,col){limb(g,x0,y0,x1,y1,w0,w1,col);g.globalAlpha=.35;for(let i=0;i<4;i++){const t=.2+i*.2;ln(g,x0+(x1-x0)*t-1,y0+(y1-y0)*t,x0+(x1-x0)*t+1,y0+(y1-y0)*t-2,'#1e1006',.6)}g.globalAlpha=1}
function paintTree(g,v){
  const R=mulberry32(1000+v*77),cx=30,gy=86;ell(g,cx+3,gy-2,17,5.5,'rgba(0,0,0,.32)');
  if(v<=2){const base=['#3e7d2c','#4a8a30','#356f2a'][v];bark(g,cx,gy-2,cx+1,gy-30,7,5,'#6a4626');bark(g,cx+1,gy-24,cx-9,gy-36,3.6,2.4,'#6a4626');bark(g,cx+1,gy-27,cx+10,gy-38,3.4,2.2,'#6a4626');
    crown(g,cx-8,gy-44,13,11,base,R,22);crown(g,cx+9,gy-46,13,11,base,R,22);crown(g,cx,gy-56,16,13,base,R,32);return}
  if(v<=4){const base=v===3?'#2f6a34':'#2a5e3a';bark(g,cx,gy-2,cx,gy-18,5,4,'#5a3a1e');
    for(let i=0;i<5;i++){const y=gy-14-i*12,w=19-i*3.3;const gr=g.createLinearGradient(cx-w,0,cx+w,0);gr.addColorStop(0,sh(base,1.3));gr.addColorStop(.5,base);gr.addColorStop(1,sh(base,.6));
      g.fillStyle=gr;g.beginPath();g.moveTo(cx,y-17);for(let k=0;k<=6;k++){const t=k/6;g.lineTo(cx+w*t,y-17+17*t+(k%2?2.5:0))}for(let k=6;k>=0;k--){const t=k/6;g.lineTo(cx-w*t,y-17+17*t+(k%2?2.5:0))}g.closePath();g.fill();g.strokeStyle='rgba(15,30,10,.45)';g.lineWidth=.6;g.stroke()}return}
  if(v<=6){const lean=v===5?6:-5;g.strokeStyle='#5a3e1e';g.lineWidth=5;g.beginPath();g.moveTo(cx,gy-2);g.quadraticCurveTo(cx+lean*1.4,gy-34,cx+lean,gy-62);g.stroke();g.strokeStyle='#9a7448';g.lineWidth=3.2;g.stroke();
    for(let i=1;i<9;i++){const t=i/9;const x=cx+lean*1.4*2*t*(1-t)+lean*t*t,y=gy-2-60*t;ln(g,x-2.4,y,x+2.4,y,'#5a3e1e',.8)}
    const t=[cx+lean,gy-62];for(let i=0;i<9;i++){const a=i/9*6.283+.2;const ex=t[0]+Math.cos(a)*22,ey=t[1]+8+Math.sin(a)*5+Math.abs(Math.cos(a))*6;g.strokeStyle=i%2?'#3f7a2a':'#2f6a24';g.lineWidth=2.4;g.beginPath();g.moveTo(t[0],t[1]);g.quadraticCurveTo((t[0]+ex)/2,t[1]-7,ex,ey);g.stroke();
      for(let k=1;k<7;k++){const q=k/7;const px=t[0]+(ex-t[0])*q,py=t[1]+(ey-t[1])*q-Math.sin(q*3.14)*6;ln(g,px,py,px+Math.cos(a+1.4)*3,py+3.2,i%2?'#4f8a32':'#3a7428',1)}}
    circ(g,t[0]-2,t[1]+2,2.2,'#6a4a1e');circ(g,t[0]+2,t[1]+2.6,2.2,'#5a3e18');return}
  bark(g,cx,gy-2,cx-2,gy-26,5,3.6,'#6a4626');bark(g,cx-2,gy-24,cx-12,gy-34,2.8,2,'#6a4626');bark(g,cx-2,gy-24,cx+10,gy-35,2.8,2,'#6a4626');
  g.save();g.translate(cx,gy-40);g.scale(1,.42);crown(g,0,0,26,24,'#5a7a2a',R,40);g.restore();
}
function rocks(g,cx,cy,cols,R,n){
  for(let i=0;i<n;i++){const a=i/n*6.283+R()*.6,r=i?7+R()*5:0;const x=cx+Math.cos(a)*r*1.4,y=cy+Math.sin(a)*r*.7,s=5+R()*4.5;
    const top=[[x-s,y-s*.3],[x-s*.3,y-s*1.05],[x+s*.6,y-s*.9],[x+s,y-s*.2]],l=[[x-s,y-s*.3],[x+s*.05,y-s*.05],[x+s*.05,y+s*.65],[x-s*.85,y+s*.35]],rr=[[x+s*.05,y-s*.05],[x+s,y-s*.2],[x+s*.8,y+s*.5],[x+s*.05,y+s*.65]];
    poly(g,l,sh(cols[0],1),OL,.5);poly(g,rr,sh(cols[0],.7),OL,.5);poly(g,top.concat([[x+s*.05,y-s*.05]]),sh(cols[1],1.05),OL,.5)}
}
function paintRes(g,k){
  const R=mulberry32(k.length*131);
  if(k==='berry'){ell(g,30,40,19,6,'rgba(0,0,0,.3)');crown(g,30,26,17,12,'#3a7a2e',R,30);
    for(let i=0;i<14;i++){const x=16+R()*28,y=17+R()*16;for(let j=0;j<3;j++){const bx=x+(j-1)*1.8,by=y+(j%2)*1.6;circ(g,bx,by,1.6,'#b8203e');circ(g,bx-.5,by-.5,.55,'#ff9ab0')}}return}
  if(k==='gold'){ell(g,30,40,22,7,'rgba(0,0,0,.3)');rocks(g,30,30,['#7a6a50','#9a8a6a'],R,6);
    for(let i=0;i<11;i++){const x=14+R()*32,y=20+R()*16;poly(g,[[x-2.4,y],[x,y-2.6],[x+2.6,y],[x,y+1.8]],'#f0c43a','#8a6a10',.4);circ(g,x-.6,y-.8,.6,'#fff6c0')}return}
  if(k==='stone'){ell(g,30,40,22,7,'rgba(0,0,0,.3)');rocks(g,30,30,['#8a877f','#b5b1a8'],R,7);return}
  if(k==='fish0'||k==='fish1'){g.strokeStyle='rgba(220,240,255,.55)';g.lineWidth=1;for(let i=0;i<2;i++){g.beginPath();g.ellipse(30,26,13+i*7,5.5+i*3,0,0,7);g.stroke()}
    for(const[x,y,s]of(k==='fish1'?[[21,24,1.3],[36,28,1.1],[29,19,1.2]]:[[23,24,1],[36,27,.9]])){g.fillStyle='rgba(30,60,80,.8)';g.beginPath();g.ellipse(x,y,5*s,2*s,0,0,7);g.fill();poly(g,[[x-5*s,y],[x-8*s,y-2*s],[x-8*s,y+2*s]],'rgba(30,60,80,.8)')}return}
  if(k==='carc'){ell(g,26,24,16,4.5,'rgba(0,0,0,.25)');blobS(g,26,20,13,5.5,'#8a4a2a');blobS(g,23,19,8,3.2,'#b4442e',false);for(let i=0;i<4;i++)ln(g,18+i*4.2,16.5,19+i*4.2,22,'#f2e8d4',1.1)}
}
// ---------- folhas de animação (sprite sheets) ----------
let SHEET={},META={};
function mkSheet(key,w,h,ax,ay,fn){
  const fw=w*SS,fh=h*SS;const c=document.createElement('canvas');c.width=fw*8;c.height=fh*2;const g=c.getContext('2d');const meta=[[],[]];
  for(let dir=0;dir<2;dir++)for(let fr=0;fr<8;fr++){g.save();g.translate(fr*fw,dir*fh);g.beginPath();g.rect(0,0,fw,fh);g.clip();g.scale(SS,SS);g.lineJoin='round';g.lineCap='round';fn(g,ax,ay,fr,dir,meta[dir]);g.restore()}
  SHEET[key]={c,w,h,ax,ay};META[key]=meta;
}
function frameCanvas(key,fr,dir){const S=SHEET[key];const c=document.createElement('canvas');c.width=S.w*SS;c.height=S.h*SS;c.getContext('2d').drawImage(S.c,fr*S.w*SS,dir*S.h*SS,S.w*SS,S.h*SS,0,0,S.w*SS,S.h*SS);return c}
let GRAIN=null;
function grain(c){
  if(!GRAIN){GRAIN=document.createElement('canvas');GRAIN.width=GRAIN.height=128;const g=GRAIN.getContext('2d'),im=g.createImageData(128,128);const R=mulberry32(99);for(let i=0;i<128*128;i++){const v=R()*255|0;im.data[i*4]=v;im.data[i*4+1]=v;im.data[i*4+2]=v;im.data[i*4+3]=255}g.putImageData(im,0,0)}
  const g=c.getContext('2d');g.save();g.globalCompositeOperation='overlay';g.globalAlpha=.16;g.fillStyle=g.createPattern(GRAIN,'repeat');g.fillRect(0,0,c.width,c.height);
  g.globalCompositeOperation='destination-in';g.globalAlpha=1;g.restore();
}
function bldCanvas(type,o){
  const T=BT[type],sz=T.sz,S=sz*TS,M=34,W=sz*64+M*2,top=T.h+22,H=top+sz*32+10;
  const[c,g]=mkC(W,H);const P=(x,y,z)=>[W/2+(x-y),top+(x+y)/2-(z||0)];
  paintBld(g,P,type,styOf(o),COL[o],S);
  const tmp=document.createElement('canvas');tmp.width=c.width;tmp.height=c.height;const tg=tmp.getContext('2d');tg.drawImage(c,0,0);
  tg.globalCompositeOperation='overlay';tg.globalAlpha=.08;if(!GRAIN)grain(document.createElement('canvas'));tg.fillStyle=tg.createPattern(GRAIN,'repeat');tg.fillRect(0,0,tmp.width,tmp.height);
  tg.globalCompositeOperation='destination-in';tg.globalAlpha=1;tg.drawImage(c,0,0);
  const bb=bbox(tmp);return{c:tmp,dk:o===0?tmp:darkCopy(tmp),W,H,top,bt:bb.y/SS};
}
function buildSprites(){
  SPR={};THUMB={};SHEET={};META={};
  for(let o=0;o<2;o++){
    const C=COL[o],skin=SKINS[civOf(o).st]||'#d6a174';
    for(const t in BT){if(t==='fazenda')continue;SPR['b'+t+o]=bldCanvas(t,o)}
    for(const t of['vill','guer','guerA','espa','hopl','arq','arqc','sac']){const sp=UT[t==='guerA'?'guer':t].spr;mkSheet(t+o,sp[0],sp[1],sp[2],sp[3],(g,ax,ay,fr,dir,meta)=>drawHuman(g,ax,ay,HUM[t],C,skin,fr,dir===1,meta))}
    for(const t of['bat','cav','arqcav']){const sp=UT[t].spr;mkSheet(t+o,sp[0],sp[1],sp[2],sp[3],(g,ax,ay,fr)=>drawMounted(g,ax,ay,t,C,skin,fr))}
    {const sp=UT.carro.spr;mkSheet('carro'+o,sp[0],sp[1],sp[2],sp[3],(g,ax,ay,fr)=>chariot(g,ax,ay,C,skin,fr))}
    {const sp=UT.elef.spr;mkSheet('elef'+o,sp[0],sp[1],sp[2],sp[3],(g,ax,ay,fr)=>elephantA(g,ax,ay,'#8a8a88',fr,true,C,skin))}
    for(const t of['pedra','bal']){const sp=UT[t].spr;mkSheet(t+o,sp[0],sp[1],sp[2],sp[3],(g,ax,ay,fr)=>siege(g,ax,ay,t,C,fr))}
    for(const t of['pesc','trans','bguer','trir']){const sp=UT[t].spr;mkSheet(t+o,sp[0],sp[1],sp[2],sp[3],(g,ax,ay,fr)=>boat(g,ax,ay,t,C,fr))}
    extraSheets(o,C,skin);
  }
  for(const t of['gaz','leao','elfs']){const sp=UT[t].spr;mkSheet(t+'2',sp[0],sp[1],sp[2],sp[3],(g,ax,ay,fr)=>animal(g,ax,ay,t,fr))}
  for(let v=0;v<8;v++){const[c,g]=mkC(60,92);paintTree(g,v);SPR['tree'+v]={c,dk:darkCopy(c),w:60,h:92,ax:30,ay:84}}
  for(const k of['berry','gold','stone','fish0','fish1','carc']){const[c,g]=mkC(60,48);paintRes(g,k);SPR[k]={c,dk:darkCopy(c),w:60,h:48,ax:30,ay:k==='carc'?28:40}}
  const th=(src,size)=>{const bb=bbox(src);const c=document.createElement('canvas');c.width=c.height=size*2;const g=c.getContext('2d');const s=Math.min(size*2/bb.w,size*2/bb.h)*.94;g.drawImage(src,bb.x,bb.y,bb.w,bb.h,(c.width-bb.w*s)/2,(c.height-bb.h*s)/2,bb.w*s,bb.h*s);return c.toDataURL()};
  for(const t in BT){if(t==='fazenda')continue;THUMB['b'+t]=th(SPR['b'+t+'0'].c,40)}
  {const[c,g]=mkC(96,56);const P=(x,y)=>[48+(x-y),4+(x+y)/2];paintFarmIcon(g,P);THUMB.bfazenda=th(c,40)}
  for(const t in UT){THUMB['u'+t]=th(frameCanvas(t+(UT[t].cls==='animal'?2:0),0,0),40)}
  THUMB.uguerA=th(frameCanvas('guerA0',0,0),40);
  for(const k of['berry','gold','stone','fish1','carc'])THUMB['r'+k]=th(SPR[k].c,40);
  THUMB.rtree=th(SPR.tree0.c,40);
}
function faceTo(u,x,y){const dI=(x-u.x)-(y-u.y),dJ=(x-u.x)+(y-u.y);if(Math.abs(dI)>1.5)u.face=dI>0?1:-1;if(Math.abs(dJ)>2)u.fb=dJ<0?1:0}
function hT0(u){return u.hunting&&G.t-u.hunting<.4}
function villTask(u,hT){
  if(hT>=0)return null;
  if(u.st==='build')return{v:'villT',t:'martelo'};if(u.st!=='gather')return null;const s=u.lsub;
  if(s==='tree')return{v:null,t:'machado'};if(s==='gold'||s==='stone')return{v:'villT',t:'picareta'};if(s==='farm')return{v:'villT',t:'enxada'};
  if(s==='berry')return{v:'villH',t:'colher'};if(s==='fish')return{v:'villH',t:'faca'};return{v:'villH',t:'faca'}}
// ferramenta desenhada na ponta do cabo (ou na mão), na posição medida de cada quadro
function drawVillTool(t,S,fr,dir,u){const M=GPTART.u.vill.tool&&GPTART.u.vill.tool[dir+'_'+fr];if(!M)return;
  const X=v=>-S.ax+v/SS,Y=v=>-S.ay+v/SS,cx=X(M.c[0]),cy=Y(M.c[1]);let px=X(M.p[0]),py=Y(M.p[1]);
  let dx=cx-px,dy=cy-py;const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;let nx=-dy,ny=dx;if(nx*.6-ny*.8<0){nx=-nx;ny=-ny}
  const OLc='rgba(20,12,6,.9)';ctx.lineCap='round';ctx.lineJoin='round';
  const P=(pts,fill)=>{ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=OLc;ctx.lineWidth=.7;ctx.stroke()};
  if(t==='enxada'){// lâmina larga dobrada para a frente
    P([[cx-dx*.5,cy-dy*.5],[cx+nx*2+dx*.8,cy+ny*2+dy*.8],[cx+nx*6.5-dx*1.2,cy+ny*6.5-dy*1.2],[cx+nx*6-dx*3.6,cy+ny*6-dy*3.6],[cx+nx*1.2-dx*2,cy+ny*1.2-dy*2]],'#8c9098');
    ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(cx+nx*6.2-dx*1.4,cy+ny*6.2-dy*1.4);ctx.lineTo(cx+nx*5.8-dx*3.2,cy+ny*5.8-dy*3.2);ctx.stroke()}
  else if(t==='picareta'){// ferro curvo com duas pontas
    ctx.beginPath();ctx.moveTo(cx-nx*5.2+dx*.4,cy-ny*5.2+dy*.4);ctx.quadraticCurveTo(cx+dx*2.6,cy+dy*2.6,cx+nx*5.2+dx*.4,cy+ny*5.2+dy*.4);ctx.strokeStyle=OLc;ctx.lineWidth=3.2;ctx.stroke();ctx.strokeStyle='#6e737c';ctx.lineWidth=1.9;ctx.stroke();
    ctx.strokeStyle='rgba(220,225,235,.55)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(cx-nx*3.2+dx*1.1,cy-ny*3.2+dy*1.1);ctx.quadraticCurveTo(cx+dx*2.1,cy+dy*2.1,cx+nx*3.2+dx*1.1,cy+ny*3.2+dy*1.1);ctx.stroke()}
  else if(t==='martelo'){// cabeça de martelo (ferro)
    P([[cx-nx*3.4,cy-ny*3.4],[cx+nx*3.4,cy+ny*3.4],[cx+nx*3.4+dx*2.6,cy+ny*3.4+dy*2.6],[cx-nx*3.4+dx*2.6,cy-ny*3.4+dy*2.6]],'#5c6068')}
  else if(t==='faca'){// faca curta na mão (cortando: vai e volta)
    const cut=hT0(u)?0:Math.sin(u.an*1.8)*1.6;px+=dx*cut;py+=dy*cut;const ex=px+dx*7.5,ey=py+dy*7.5;ctx.strokeStyle='#4a2c12';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(px-dx*1.5,py-dy*1.5);ctx.lineTo(px+dx*1.6,py+dy*1.6);ctx.stroke();
    P([[px+dx*1.6+nx*1.1,py+dy*1.6+ny*1.1],[ex,ey],[px+dx*1.6-nx*.9,py+dy*1.6-ny*.9]],'#e4e8ee')}
  else if(t==='arpao'){const ex=px+dx*15,ey=py+dy*15;ctx.strokeStyle='#5a3a1c';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px-dx*5,py-dy*5);ctx.lineTo(ex,ey);ctx.stroke();P([[ex+nx*1.4,ey+ny*1.4],[ex+dx*4,ey+dy*4],[ex-nx*1.4,ey-ny*1.4]],'#c8ccd2')}
  else if(t==='colher'){// frutinhas na mão e uma folha caindo
    if(fr===5){for(const[a,b,c]of[[0,0,'#c0283a'],[1.6,.8,'#8a1830'],[.4,1.7,'#d8364a']]){ctx.fillStyle=c;ctx.beginPath();ctx.arc(px+a-1,py+b-1,1.25,0,7);ctx.fill()}}
    const ph=(performance.now()/900+u.id*.37)%1;if(ph<.6){ctx.globalAlpha=1-ph/.6;ctx.fillStyle='#4e8a2e';ctx.beginPath();ctx.ellipse(px+4+ph*5,py+2+ph*14,1.6,.8,ph*4,0,7);ctx.fill();ctx.globalAlpha=1}}}
function toolFor(u){if(u.st==='build')return'hammer';if(u.st!=='gather')return null;const s=u.lsub;return s==='tree'?'axe':s==='gold'||s==='stone'?'pick':s==='farm'?'hoe':UT[s]?'spear':null}
function drawUnit(u,selSet){
  const T=ST(u);let key=(u.type==='guer'&&T.axe?'guerA':u.type)+u.o,S=SHEET[key];if(!S)return;
  // aldeão andando: folha nova de 8 quadros em ciclo (pernas cruzando)
  const w8=u.type==='vill'&&u.mv&&SHEET['villW'+u.o];if(w8){key='villW'+u.o;S=w8}
  const I=u.x-u.y,J=(u.x+u.y)/2;
  const dir=UT[u.type].naval||UT[u.type].cls==='cav'||UT[u.type].cls==='elef'||UT[u.type].cls==='cerco'||UT[u.type].cls==='animal'||UT[u.type].cls==='arqcav'?0:(u.fb?1:0);
  // passo: o ciclo anda junto com a distância percorrida (o pé não escorrega no chão)
  const W=S.gpt&&WALK[key.slice(0,-1)];
  const md=hyp(u.x-(u._lx??u.x),u.y-(u._ly??u.y));u._lx=u.x;u._ly=u.y;
  if(md>0&&md<24)u._wp=((u._wp||0)+md/(w8?S.ay*.95:S.wf?S.wcyc:W?W.cyc:40))%1;
  let fr=0,bob=0,fx=null;
  if(w8){fr=((u._wp||0)*8|0)%8}
  else if(S.wf&&u.mv){fr=S.ws+((u._wp||0)*S.wf|0)%S.wf}   // folhas com ciclo próprio de 7 ou 8 quadros
  else if(u.mv){const p=u._wp||0,k=(p*4|0)%4;
    if(W){fr=W.seq[k];bob=W.hum?1.7*(.5-.5*Math.cos(4*Math.PI*(p-.125))):1.1*(.5-.5*Math.cos(4*Math.PI*p));fx=W.fx[dir]&&W.fx[dir][fr]}
    else fr=1+k}
  else if(u.work){if(u.st==='attack'&&T.cd){const ph=1-clamp(u.cd/T.cd,0,1);fr=ph<.22?7:ph<.7?5:6}else fr=5+((u.an/1.4|0)%3)}
  if(isNav(u))bob=Math.sin(performance.now()/420+u.id)*1.3;
  const hT=u.type==='vill'&&u.hunting&&G.t-u.hunting<.4&&!u.mv?huntTier(u.o):-1;if(hT>=0)fr=0;// caçando bicho vivo: fica de pé com a faca, o arco ou a arma
  // cada trabalho com a sua ferramenta (a arte do aldeão só tem machado: aqui o machado sai e entra a ferramenta certa)
  let VT=null;if(u.type==='vill'&&S.gpt&&!w8&&fr>=5&&fr<=7){VT=villTask(u,hT);if(VT){
      // 1º: arte própria do trabalho (folha vw_*); 2º: aldeão sem machado + ferramenta desenhada
      const A=VT.t==='faca'&&hT>=0?null:SHEET['vw_'+VT.t+u.o];
      if(A){S=A;VT.art=1;if(VT.t==='colher')fr=5+((u.an/2|0)%3)}
      else if(!VT.v){VT=null}else{const S2=SHEET[VT.v+u.o];if(S2)S=S2;else VT=null;if(VT&&VT.t==='colher')fr=5+((u.an/2.4|0)%2);if(VT&&VT.t==='faca'&&hT<0)fr=5}}}
  ctx.save();ctx.translate(I,J-bob);if(u.face<0)ctx.scale(-1,1);
  if(fx){ctx.translate(fx.dx,fx.dy);if(fx.s!==1)ctx.scale(fx.s,fx.s)}
  ctx.drawImage(S.c,fr*S.w*SS,dir*S.h*SS,S.w*SS,S.h*SS,-S.ax,-S.ay,S.w,S.h);
  if(VT&&!VT.art)drawVillTool(VT.t,S,fr,dir,u);else if(!VT&&hT>=0)drawHuntTool(hT,S,u);
  if(u.type==='vill'){const md=META[key]&&META[key][dir]&&META[key][dir][fr];const tl=toolFor(u);
    if(md&&tl){const hx=md.hx,hy=md.hy,wa=md.wa,dx=Math.sin(wa),dy=Math.cos(wa);
      ctx.strokeStyle='#3a2410';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(hx-dx*2,hy-dy*2);ctx.lineTo(hx+dx*11,hy+dy*11);ctx.stroke();ctx.strokeStyle='#8a6236';ctx.lineWidth=1.2;ctx.stroke();
      const ex=hx+dx*10,ey=hy+dy*10,nx=-dy,ny=dx;ctx.fillStyle=tl==='hoe'?'#9a9a9a':'#c8ccd2';ctx.beginPath();
      if(tl==='axe'){ctx.moveTo(ex,ey);ctx.lineTo(ex+nx*5+dx*2.5,ey+ny*5+dy*2.5);ctx.lineTo(ex+nx*5.5-dx*2.5,ey+ny*5.5-dy*2.5)}
      else if(tl==='pick'){ctx.moveTo(ex+nx*6-dx*2,ey+ny*6-dy*2);ctx.lineTo(ex,ey);ctx.lineTo(ex-nx*6-dx*2,ey-ny*6-dy*2);ctx.lineTo(ex,ey+1.5)}
      else if(tl==='hammer'){ctx.rect(ex-2.5,ey-2.5,5,5)}
      else if(tl==='hoe'){ctx.moveTo(ex,ey);ctx.lineTo(ex+nx*4,ey+ny*4);ctx.lineTo(ex+nx*4+dx*2,ey+ny*4+dy*2)}
      else{ctx.moveTo(ex+dx*4,ey+dy*4);ctx.lineTo(ex-nx*1.6,ey-ny*1.6);ctx.lineTo(ex+nx*1.6,ey+ny*1.6)}
      ctx.closePath();ctx.fill()}}
  ctx.restore();
  if(u.carry>0&&(u.type==='vill'||u.type==='pesc')){const cx=I-(u.face>0?13:-7),cy=J-30;
    if(u.ct==='wood'){ctx.fillStyle='#7a4e24';ctx.fillRect(cx,cy,7,3);ctx.fillRect(cx,cy+3.4,7,3);ctx.fillStyle='#c89a5a';ctx.fillRect(cx+6,cy,1.4,6.4)}
    else{ctx.fillStyle=u.ct==='food'?'#b8402a':u.ct==='gold'?'#f0c840':'#a8a49c';ctx.beginPath();ctx.arc(cx+3.5,cy+3.5,3.4,0,7);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=.6;ctx.stroke()}}
  if(u.st==='convert'&&u.cv>0){ctx.strokeStyle='rgba(255,236,150,.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(I,J-S.ay-4,4+Math.sin(performance.now()/120)*2,0,7);ctx.stroke()}
  if(selSet.has(u.id)||(u.hp<T.hp&&u.o===0)){const f=clamp(u.hp/T.hp,0,1),y=J-S.ay+2,w=isNav(u)?30:20;ctx.fillStyle='#000';ctx.fillRect(I-w/2-1,y-1,w+2,5);ctx.fillStyle='#3a0b07';ctx.fillRect(I-w/2,y,w,3);ctx.fillStyle=f>.5?'#4ad04a':f>.25?'#e0d040':'#e04040';ctx.fillRect(I-w/2,y,w*f,3)}
  if(u.cargo&&u.cargo.length){ctx.fillStyle='#000a';ctx.fillRect(I-9,J+4,18,10);ctx.fillStyle='#fff';ctx.font='bold 8px serif';ctx.textAlign='center';ctx.fillText(u.cargo.length+'/'+UT[u.type].cap,I,J+12)}
}
// ---------- terreno com relevo ----------
let SHORE=[];
function tnoise(per){// ruído que se repete sem emenda
  const L=new Float32Array(per*per);const R=mulberry32(G.seed^per);for(let i=0;i<L.length;i++)L[i]=R();
  return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,s=t=>t*t*(3-2*t);const X0=((xi%per)+per)%per,Y0=((yi%per)+per)%per,X1=(X0+1)%per,Y1=(Y0+1)%per;
    const a=L[Y0*per+X0],b=L[Y0*per+X1],c=L[Y1*per+X0],d=L[Y1*per+X1];return a+(b-a)*s(xf)+(c-a)*s(yf)+(a-b-c+d)*s(xf)*s(yf)}}
function buildTerrain(){
  TPX=MW<=80?24:MW<=100?20:16;const PX=TPX,W=MW*PX;
  terrC=document.createElement('canvas');terrC.width=W;terrC.height=W;
  const g=terrC.getContext('2d');
  WDIST=waterDist();
  const wd=new Float32Array(N),fd=new Float32Array(N),hh=new Float32Array(N),dry=new Float32Array(N),shd=new Float32Array(N);
  for(let i=0;i<N;i++){const x=i%MW,y=i/MW|0;wd[i]=G.terr[i]?-Math.min(4,landDist(i)):WDIST[i];hh[i]=vnoise(x/8,y/8)*1.4+vnoise(x/3.5,y/3.5)*.45+Math.min(4,WDIST[i])*.18-(G.terr[i]?.6:0);dry[i]=clamp(vnoise(x/11+40,y/11+9)+(G.dryB||0),0,1)}
  for(const r of G.R)if(r.sub==='tree')fd[idx(r.tx,r.ty)]=1;
  const f2=new Float32Array(N);for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){let s=0,n=0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){if(!inMap(x+a,y+b))continue;s+=fd[idx(x+a,y+b)];n++}f2[idx(x,y)]=s/n}
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const hx=hh[idx(Math.min(MW-1,x+1),y)]-hh[idx(Math.max(0,x-1),y)],hy=hh[idx(x,Math.min(MH-1,y+1))]-hh[idx(x,Math.max(0,y-1))];shd[idx(x,y)]=clamp(1-(hx*.8+hy*.55)*.5,.74,1.2)}
  const n1=tnoise(64),n2=tnoise(16);
  const NT=new Float32Array(65536),NM=new Float32Array(65536);for(let y=0;y<256;y++)for(let x=0;x<256;x++){NT[y*256+x]=n1(x/4,y/4)*.65+n1(x/1.6+17,y/1.6+5)*.35;NM[y*256+x]=n2(x/16,y/16)}
  const img=g.createImageData(W,W),d=img.data;
  const TX=typeof gaTexAll==='function'?gaTexAll():null,TM=.72; // texturas do GPT misturadas com as cores do código
  const smp=(A,tx,ty)=>{const X=clamp(tx,0,MW-1.001),Y=clamp(ty,0,MH-1.001),xi=X|0,yi=Y|0,xf=X-xi,yf=Y-yi,i0=yi*MW+xi,i1=Math.min(MW-1,xi+1)+yi*MW,i2=xi+Math.min(MH-1,yi+1)*MW,i3=Math.min(MW-1,xi+1)+Math.min(MH-1,yi+1)*MW;return(A[i0]*(1-xf)+A[i1]*xf)*(1-yf)+(A[i2]*(1-xf)+A[i3]*xf)*yf};
  for(let py=0;py<W;py++){const ty=py/PX-.5;for(let px=0;px<W;px++){const tx=px/PX-.5;
    const n=NT[(py&255)*256+(px&255)],nm=NM[((py>>1)&255)*256+((px>>1)&255)];
    let w=smp(wd,tx,ty)+(nm-.5)*.9;const s=smp(shd,tx,ty),f=smp(f2,tx,ty),dr=smp(dry,tx,ty);
    let r,gg,b;
    if(w<-.05){const t=clamp(-w/3,0,1);r=70-t*52+n*14;gg=158-t*100+n*16;b=166-t*60+n*18;if(w>-.55){const k=(w+.55)/.5;r+=k*28;gg+=k*22;b+=k*10}}
    else if(w<.3){r=168+n*18;gg=148+n*16;b=106+n*12}
    else if(w<1){r=222+n*24-dr*8;gg=200+n*22-dr*8;b=146+n*16}
    else{const lush=clamp(1.15-dr*1.2+(nm-.5)*.6,0,1);r=128-lush*62+n*30;gg=134-lush*8+n*30;b=60-lush*22+n*14;
      const dirt=clamp((nm-.62)*5,0,1)*clamp(dr*1.6-.3,0,1);r=r*(1-dirt)+(146+n*22)*dirt;gg=gg*(1-dirt)+(116+n*18)*dirt;b=b*(1-dirt)+(74+n*12)*dirt;
      if(f>0){r=r*(1-f*.42)+42*f*.42;gg=gg*(1-f*.3)+64*f*.3;b=b*(1-f*.4)+24*f*.4}}
    if(TX){const q=(((((py*3)>>2)+37)&255)*256+((((px*3)>>2)+91)&255))*4;let A,tr,tg,tb;
      if(w<-.05){const t=clamp(-w/3,0,1),B=TX.fundo;A=TX.raso;tr=A[q]*(1-t)+B[q]*t;tg=A[q+1]*(1-t)+B[q+1]*t;tb=A[q+2]*(1-t)+B[q+2]*t;if(w>-.55){const kk=(w+.55)/.5;tr+=kk*24;tg+=kk*20;tb+=kk*10}}
      else if(w<1){A=TX.areia;const wet=w<.3?.8:1;tr=A[q]*wet;tg=A[q+1]*wet;tb=A[q+2]*wet}
      else{const lush=clamp(1.15-dr*1.2+(nm-.5)*.6,0,1),B=TX.seca;A=TX.grama;tr=B[q]+(A[q]-B[q])*lush;tg=B[q+1]+(A[q+1]-B[q+1])*lush;tb=B[q+2]+(A[q+2]-B[q+2])*lush;
        const dirt=clamp((nm-.62)*5,0,1)*clamp(dr*1.6-.3,0,1),D=TX.terra;tr=tr*(1-dirt)+D[q]*dirt;tg=tg*(1-dirt)+D[q+1]*dirt;tb=tb*(1-dirt)+D[q+2]*dirt;
        if(f>0){tr=tr*(1-f*.42)+42*f*.42;tg=tg*(1-f*.3)+64*f*.3;tb=tb*(1-f*.4)+24*f*.4}}
      r=tr*TM+r*(1-TM);gg=tg*TM+gg*(1-TM);b=tb*TM+b*(1-TM)}
    const k=(py*W+px)*4,ss=w<-.05?1:s;d[k]=r*ss;d[k+1]=gg*ss;d[k+2]=b*ss;d[k+3]=255}}
  g.putImageData(img,0,0);
  const R=mulberry32(G.seed+5);
  for(let i=0;i<14000;i++){const x=R()*W,y=R()*W,tx=x/PX|0,ty=y/PX|0;if(!inMap(tx,ty))continue;const ti=idx(tx,ty);if(G.terr[ti])continue;const wdv=WDIST[ti];const kk=R();
    if(wdv<=1){if(kk<.3){g.fillStyle='rgba(120,100,70,.5)';g.beginPath();g.arc(x,y,.9+R(),0,7);g.fill()}continue}
    if(kk<.75){const c=R()<.5?'rgba(40,80,20,.55)':'rgba(150,180,80,.5)';g.strokeStyle=c;g.lineWidth=.8;g.beginPath();g.moveTo(x,y);g.lineTo(x-1+R()*2,y-2.5-R()*2.5);g.moveTo(x+1.2,y);g.lineTo(x+1.2+R()*1.6,y-2-R()*2);g.stroke()}
    else if(kk<.86){g.fillStyle='rgba(110,100,85,.55)';g.beginPath();g.ellipse(x,y,1.4,1,0,0,7);g.fill()}
    else if(kk<.92){g.fillStyle=['#f2e27a','#f2f2e8','#e6a0c8','#d8604a'][R()*4|0];g.beginPath();g.arc(x,y,1.1,0,7);g.fill()}}
  SHORE=[];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(!G.terr[idx(x,y)])continue;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){if(inMap(x+a,y+b)&&!G.terr[idx(x+a,y+b)]){SHORE.push([(x+.5+a*.42)*TS,(y+.5+b*.42)*TS,a,b,hash2(x,y)])}}}
  stumps=null;stumpG=terrC.getContext('2d');
}
let TPX=24;
function stumpAt(tx,ty){if(!stumpG)return;const PX=TPX,x=tx*PX+PX/2,y=ty*PX+PX*.54;stumpG.fillStyle='rgba(60,40,18,.45)';stumpG.beginPath();stumpG.ellipse(x+1,y+1,3.4,2.2,0,0,7);stumpG.fill();stumpG.fillStyle='#8a6236';stumpG.beginPath();stumpG.ellipse(x,y,2.4,1.7,0,0,7);stumpG.fill();stumpG.fillStyle='#c8a070';stumpG.beginPath();stumpG.ellipse(x,y-.3,1.6,1.1,0,0,7);stumpG.fill()}

function treeVar(r){if(r.v===3)return 5+(r.id&1);const h=hash2(r.tx*3+1,r.ty*7+2);if(h<.3)return 3+(r.id&1);if(h>.92)return 7;return r.v%3}

// arma de caça na mão do aldeão (faca / arco / arma de fogo), desenhada por cima do boneco
function drawHuntTool(t,S,u){const hx=S.w*.18,hy=-S.ay*.52;ctx.lineCap='round';
  if(t===0){ctx.strokeStyle='#5a3416';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(hx-2,hy+2);ctx.lineTo(hx+1,hy-1);ctx.stroke();
    ctx.strokeStyle='#eef2f6';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(hx+1,hy-1);ctx.lineTo(hx+7,hy-6);ctx.stroke()}
  else if(t===1){const pull=u.shotT&&G.t-u.shotT<.2?0:4,R=11,cx=hx-3,e=1.1,ex=cx+Math.cos(e)*R,ey=Math.sin(e)*R;
    ctx.strokeStyle='#4a2a10';ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(cx,hy,R,-e,e);ctx.stroke();ctx.strokeStyle='#8a5a2a';ctx.lineWidth=1.2;ctx.stroke();
    ctx.strokeStyle='#efe6cc';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(ex,hy-ey);ctx.lineTo(ex-pull,hy);ctx.lineTo(ex,hy+ey);ctx.stroke();
    if(pull){ctx.strokeStyle='#d9c9a0';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(ex-pull,hy);ctx.lineTo(cx+R+5,hy);ctx.stroke()}}
  else{ctx.strokeStyle='#3a2616';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(hx-8,hy+4);ctx.lineTo(hx+12,hy-3);ctx.stroke();ctx.strokeStyle='#5a5a5a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(hx+2,hy);ctx.lineTo(hx+14,hy-4);ctx.stroke()}}
