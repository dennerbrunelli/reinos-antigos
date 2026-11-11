
// =========================================================
//   DESENHOS (tudo gerado por código)
// =========================================================
const SS=2;
function mkC(w,h){const c=document.createElement('canvas');c.width=Math.ceil(w*SS);c.height=Math.ceil(h*SS);const g=c.getContext('2d');g.scale(SS,SS);g.lineJoin='round';g.lineCap='round';return[c,g]}
function sh(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=clamp(r*f|0,0,255);g=clamp(g*f|0,0,255);b=clamp(b*f|0,0,255);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
function poly(g,pts,fill,stroke,lw){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||.6;g.stroke()}}
function ell(g,x,y,rx,ry,c){if(c)g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,7);g.fill()}
function circ(g,x,y,r,c){if(c)g.fillStyle=c;g.beginPath();g.arc(x,y,Math.max(.1,r),0,7);g.fill()}
function ln(g,x0,y0,x1,y1,c,w){g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke()}
function lnp(g,a,b,c,w){ln(g,a[0],a[1],b[0],b[1],c,w)}
const LT=1.08,LL=.86,LR=.66;
function ibox(g,P,x0,y0,x1,y1,z0,h,col,noTop){
  const e=sh(col,.5);
  poly(g,[P(x0,y1,z0),P(x1,y1,z0),P(x1,y1,z0+h),P(x0,y1,z0+h)],sh(col,LL),e);
  poly(g,[P(x1,y0,z0),P(x1,y1,z0),P(x1,y1,z0+h),P(x1,y0,z0+h)],sh(col,LR),e);
  if(!noTop)poly(g,[P(x0,y0,z0+h),P(x1,y0,z0+h),P(x1,y1,z0+h),P(x0,y1,z0+h)],sh(col,LT),e);
}
function courses(g,P,x0,y0,x1,y1,z0,h,step,a){
  g.globalAlpha=a||.18;
  for(let z=z0+step;z<z0+h-1;z+=step){lnp(g,P(x0,y1,z),P(x1,y1,z),'#000',.5);lnp(g,P(x1,y0,z),P(x1,y1,z),'#000',.5)}
  g.globalAlpha=1;
}
function gable(g,P,x0,y0,x1,y1,z,h,col,alongX){
  const e=sh(col,.45);
  if(alongX){const yc=(y0+y1)/2;
    poly(g,[P(x0,y0,z),P(x1,y0,z),P(x1,yc,z+h),P(x0,yc,z+h)],sh(col,1.05),e);
    poly(g,[P(x1,y0,z),P(x1,y1,z),P(x1,yc,z+h)],sh(col,LR),e);
    poly(g,[P(x0,y1,z),P(x1,y1,z),P(x1,yc,z+h),P(x0,yc,z+h)],sh(col,.9),e);
    g.globalAlpha=.25;for(let x=x0+4;x<x1;x+=4)lnp(g,P(x,y1,z),P(x,yc,z+h),'#000',.4);g.globalAlpha=1;
  }else{const xc=(x0+x1)/2;
    poly(g,[P(x0,y0,z),P(x0,y1,z),P(xc,y1,z+h),P(xc,y0,z+h)],sh(col,1.05),e);
    poly(g,[P(x0,y1,z),P(x1,y1,z),P(xc,y1,z+h)],sh(col,LL),e);
    poly(g,[P(x1,y0,z),P(x1,y1,z),P(xc,y1,z+h),P(xc,y0,z+h)],sh(col,.75),e);
    g.globalAlpha=.25;for(let y=y0+4;y<y1;y+=4)lnp(g,P(x1,y,z),P(xc,y,z+h),'#000',.4);g.globalAlpha=1;
  }
}
function pyr(g,P,x0,y0,x1,y1,z,h,col){const a=P((x0+x1)/2,(y0+y1)/2,z+h),e=sh(col,.45);
  poly(g,[P(x0,y0,z),P(x1,y0,z),a],sh(col,1.12),e);poly(g,[P(x0,y0,z),P(x0,y1,z),a],sh(col,1.02),e);
  poly(g,[P(x0,y1,z),P(x1,y1,z),a],sh(col,LL),e);poly(g,[P(x1,y0,z),P(x1,y1,z),a],sh(col,LR),e)}
function frustum(g,P,x0,y0,x1,y1,z,h,ins,col){const e=sh(col,.45);const X0=x0+ins,Y0=y0+ins,X1=x1-ins,Y1=y1-ins;
  poly(g,[P(x0,y1,z),P(x1,y1,z),P(X1,Y1,z+h),P(X0,Y1,z+h)],sh(col,LL),e);
  poly(g,[P(x1,y0,z),P(x1,y1,z),P(X1,Y1,z+h),P(X1,Y0,z+h)],sh(col,LR),e);
  poly(g,[P(X0,Y0,z+h),P(X1,Y0,z+h),P(X1,Y1,z+h),P(X0,Y1,z+h)],sh(col,LT),e)}
function cyl(g,P,cx,cy,r,z0,h,col){const a=P(cx,cy,z0),b=P(cx,cy,z0+h),rw=r*1.41,rh=r*.71;
  const gr=g.createLinearGradient(a[0]-rw,0,a[0]+rw,0);gr.addColorStop(0,sh(col,1.1));gr.addColorStop(.45,sh(col,.95));gr.addColorStop(1,sh(col,.6));
  g.fillStyle=gr;g.beginPath();g.ellipse(a[0],a[1],rw,rh,0,0,Math.PI);g.lineTo(b[0]-rw,b[1]);g.ellipse(b[0],b[1],rw,rh,0,Math.PI,0,true);g.closePath();g.fill();
  ell(g,b[0],b[1],rw,rh,sh(col,1.12))}
function faceL(g,P,x0,x1,y,z0,z1,c){poly(g,[P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],c)}
function faceR(g,P,x,y0,y1,z0,z1,c){poly(g,[P(x,y0,z0),P(x,y1,z0),P(x,y1,z1),P(x,y0,z1)],c)}
function flagP(g,P,x,y,z,col,h){h=h||20;const a=P(x,y,z),b=P(x,y,z+h);lnp(g,a,b,'#3a2a18',1.3);poly(g,[b,[b[0]+12,b[1]+3.5],[b[0]+1,b[1]+8]],col,sh(col,.5))}
function crenL(g,P,x0,x1,y,z,s,col){for(let x=x0;x<x1-1;x+=s*2)ibox(g,P,x,y-s*.8,Math.min(x+s,x1),y,z,s*.9,col)}
function crenR(g,P,x,y0,y1,z,s,col){for(let y=y0;y<y1-1;y+=s*2)ibox(g,P,x-s*.8,y,x,Math.min(y+s,y1),z,s*.9,col)}
function shadowB(g,P,x0,y0,x1,y1,h){const s=Math.min(h*.45,40);g.fillStyle='rgba(20,12,0,.28)';g.beginPath();const pts=[P(x0,y0,0),P(x1,y0,0),P(x1+s,y0+s*.3,0),P(x1+s,y1+s*.3,0),P(x0+s*.2,y1+s*.3,0),P(x0,y1,0)];g.moveTo(...pts[0]);for(const p of pts)g.lineTo(...p);g.closePath();g.fill()}
function roofS(g,P,st,x0,y0,x1,y1,z,h){
  if(st.rt==='gable')gable(g,P,x0-3,y0-3,x1+3,y1+3,z,h,st.roof,(x1-x0)>=(y1-y0));
  else if(st.rt==='pyr'){pyr(g,P,x0-6,y0-6,x1+6,y1+6,z,h*.75,st.roof);const c=P((x0+x1)/2,(y0+y1)/2,z+h*.75);ln(g,c[0],c[1],c[0],c[1]-6,'#c9a24a',1.6)}
  else{ibox(g,P,x0-2,y0-2,x1+2,y1+2,z,3,st.roof);if(st===STY.babilonia){crenL(g,P,x0-2,x1+2,y1+2,z+3,3,st.wall2);crenR(g,P,x1+2,y0-2,y1+2,z+3,3,st.wall2)}}
}
function band(g,P,x0,y0,x1,y1,z,c){faceL(g,P,x0,x1,y1,z,z+3,c);faceR(g,P,x1,y0,y1,z,z+3,sh(c,.8))}
function stall(g,P,x,y,c1,c2){
  for(const[a,b]of[[x,y],[x+16,y],[x,y+12],[x+16,y+12]])ibox(g,P,a,b,a+1.5,b+1.5,0,12,'#6a4626');
  ibox(g,P,x,y+2,x+17,y+12,0,6,'#8a6438');
  for(let i=0;i<5;i++){ell(g,...P(x+3+i*3,y+7,7),1.6,1.2,['#d03a3a','#e8b830','#6aa83a','#e07a20','#9a3a9a'][i])}
  for(let i=0;i<4;i++){const a=x+i*4.5-1,b=a+4.5;poly(g,[P(a,y-1,14),P(b,y-1,14),P(b,y+14,9),P(a,y+14,9)],i%2?c1:c2,sh(c2,.6),.3)}
}
// ---------- prédios ----------
function paintBld(g,P,type,st,C,S){
  const m=C.m,W=st.wall,W2=st.wall2,R=st.roof,ST=st.stone,WD=st.wood,dk='#2c1b0c';
  switch(type){
  case'casa':{shadowB(g,P,10,10,54,54,34);const a=12,b=52;ibox(g,P,a,a,b,b,0,20,W);if(st.rt==='flat')courses(g,P,a,a,b,b,0,20,5,.12);
    faceL(g,P,26,37,b,0,13,dk);faceR(g,P,b,22,31,9,15,dk);band(g,P,a,a,b,b,16,m);roofS(g,P,st,a,a,b,b,20,16);
    if(st===STY.egito){ibox(g,P,16,16,30,30,23,8,W2);ell(g,...P(56,44,2),3,2,'#b06a3a')}
    ell(g,...P(40,56,2),2.6,2,'#9a5a2a');break}
  case'tc':{shadowB(g,P,4,4,92,92,70);ibox(g,P,4,4,92,92,0,7,ST);courses(g,P,4,4,92,92,0,7,3.5,.2);
    ibox(g,P,62,10,82,30,7,40,W2);roofS(g,P,st,62,10,82,30,47,12);ibox(g,P,10,62,30,82,7,40,W2);roofS(g,P,st,10,62,30,82,47,12);
    ibox(g,P,22,22,74,74,7,32,W);if(st.rt==='flat')courses(g,P,22,22,74,74,7,32,6,.12);
    faceL(g,P,40,56,74,7,28,dk);faceL(g,P,42,54,74,26,30,dk);faceR(g,P,74,32,40,20,30,dk);faceR(g,P,74,56,64,20,30,dk);
    band(g,P,22,22,74,74,33,m);roofS(g,P,st,22,22,74,74,39,24);
    flagP(g,P,72,20,60,m,22);flagP(g,P,20,72,60,m,22);break}
  case'celeiro':{shadowB(g,P,8,10,54,52,40);ibox(g,P,8,10,54,52,0,24,W);faceL(g,P,22,40,52,0,16,dk);ln(g,...P(22,52,16),...P(40,52,0),'#c8a870',1);ln(g,...P(40,52,16),...P(22,52,0),'#c8a870',1);
    band(g,P,8,10,54,52,20,m);roofS(g,P,st,8,10,54,52,24,16);
    for(const[x,y]of[[58,30],[58,44],[44,60]]){const p=P(x,y,3);ell(g,p[0],p[1],5,3.6,'#d9b24a');ell(g,p[0],p[1]-1,4,2.5,'#ecd27a')}break}
  case'deposito':{shadowB(g,P,4,4,60,60,26);
    for(const[a,b]of[[6,6],[54,6],[6,54]])ibox(g,P,a,b,a+4,b+4,0,20,WD);
    ibox(g,P,14,24,26,36,0,9,'#a87a3e');ibox(g,P,30,30,40,40,0,7,'#94683a');ibox(g,P,14,40,24,50,0,6,'#b8894a');
    for(let i=0;i<3;i++){const p=P(42,14+i*5,3+i%2*4);ell(g,p[0],p[1],3,3,'#7a5230');ell(g,p[0],p[1],1.8,1.8,'#c8935a')}
    ell(g,...P(46,48,1),5,3,'#e2c040');ell(g,...P(46,48,3),3,2,'#f6dc6a');
    ibox(g,P,54,54,58,58,0,20,WD);
    if(st.rt==='gable')gable(g,P,2,2,62,62,20,12,R,true);else if(st.rt==='pyr')pyr(g,P,0,0,64,64,20,14,R);else{ibox(g,P,2,2,62,62,20,3,R)}
    band(g,P,4,4,60,60,17,m);break}
  case'doca':{ibox(g,P,0,0,64,64,-2,5,'#8a6236');g.globalAlpha=.3;for(let x=6;x<64;x+=6)lnp(g,P(x,0,3),P(x,64,3),'#3a2412',.5);g.globalAlpha=1;
    for(const[a,b]of[[0,60],[60,60],[60,0]])ibox(g,P,a,b,a+4,b+4,-2,8,'#5a3c1e');
    ibox(g,P,36,6,58,28,3,16,W);faceL(g,P,42,50,28,3,12,dk);band(g,P,36,6,58,28,15,m);roofS(g,P,st,36,6,58,28,19,11);
    ibox(g,P,14,36,22,44,3,6,'#a87a3e');const p=P(12,18,4);g.strokeStyle='#d8c49a';g.lineWidth=1.2;g.beginPath();g.ellipse(p[0],p[1],4,2,0,0,7);g.stroke();
    flagP(g,P,6,6,3,m,26);break}
  case'mercado':{shadowB(g,P,4,4,92,92,44);ibox(g,P,4,4,92,92,0,3,ST);
    ibox(g,P,40,8,78,38,3,24,W);faceL(g,P,52,64,38,3,17,dk);band(g,P,40,8,78,38,22,m);roofS(g,P,st,40,8,78,38,27,15);
    stall(g,P,12,20,m,'#f2ead2');stall(g,P,14,56,'#d8a038','#f2ead2');stall(g,P,54,60,m,'#f2ead2');
    for(const[x,y]of[[78,50],[82,56],[36,80]]){const q=P(x,y,3);ell(g,q[0],q[1]-3,2.8,4,'#b0623a');ell(g,q[0],q[1]-7,1.6,1.2,'#8a4a2a')}break}
  case'quartel':{shadowB(g,P,6,6,90,90,50);
    ibox(g,P,6,6,90,12,0,10,ST);ibox(g,P,6,12,12,90,0,10,ST);
    ibox(g,P,16,16,62,48,0,30,W);faceL(g,P,32,44,48,0,18,dk);band(g,P,16,16,62,48,26,m);roofS(g,P,st,16,16,62,48,30,18);
    const d=P(70,66,0),d2=P(70,66,18);lnp(g,d,d2,'#6a4626',2);lnp(g,P(64,66,13),P(76,66,13),'#6a4626',2);ell(g,d2[0],d2[1],2.6,2.6,'#c8a070');
    for(let i=0;i<4;i++)lnp(g,P(30+i*4,66,0),P(30+i*4,68,20),'#9a9a9a',1);lnp(g,P(28,67,14),P(46,67,14),'#6a4626',1.4);
    ibox(g,P,60,84,90,90,0,8,ST);ibox(g,P,84,40,90,84,0,8,ST);
    const f=P(86,20,10);lnp(g,f,[f[0],f[1]-34],'#3a2a18',1.6);poly(g,[[f[0],f[1]-34],[f[0]+16,f[1]-31],[f[0]+14,f[1]-20],[f[0],f[1]-22]],m,sh(m,.5));break}
  case'arquearia':{shadowB(g,P,10,10,62,40,46);ibox(g,P,10,10,62,40,0,26,W);faceL(g,P,28,40,40,0,16,dk);band(g,P,10,10,62,40,22,m);roofS(g,P,st,10,10,62,40,26,16);
    for(const[x,y]of[[40,72],[72,62]]){const c=P(x,y,14);lnp(g,P(x-3,y,0),c,'#6a4626',1.4);lnp(g,P(x+3,y,0),c,'#6a4626',1.4);
      for(const[r,col]of[[7,'#f2ead2'],[5.2,'#c8302a'],[3.4,'#f2ead2'],[1.6,'#c8302a']])ell(g,c[0],c[1]-4,r,r*1.05,col)}
    ibox(g,P,78,30,82,90,0,6,WD);break}
  case'estabulo':{shadowB(g,P,8,8,88,38,40);ibox(g,P,8,8,88,38,0,22,W);for(let x=14;x<86;x+=14)faceL(g,P,x,x+8,38,0,13,dk);band(g,P,8,8,88,38,18,m);roofS(g,P,st,8,8,88,38,22,16);
    for(let x=10;x<=90;x+=10)lnp(g,P(x,88,0),P(x,88,9),'#6a4626',1.4);lnp(g,P(10,88,7),P(90,88,7),'#7a5230',1.2);lnp(g,P(10,88,3.5),P(90,88,3.5),'#7a5230',1.2);
    for(let y=44;y<=88;y+=11)lnp(g,P(90,y,0),P(90,y,9),'#6a4626',1.4);lnp(g,P(90,44,7),P(90,88,7),'#7a5230',1.2);
    for(const[x,y]of[[24,60],[34,66]]){const p=P(x,y,3);ell(g,p[0],p[1],6,4,'#d9b24a');ell(g,p[0],p[1]-1,5,3,'#ecd27a')}break}
  case'academia':{shadowB(g,P,4,4,92,92,60);ibox(g,P,4,4,92,92,0,6,ST);ibox(g,P,22,18,74,66,6,30,W);faceL(g,P,42,54,66,6,26,dk);
    for(let x=12;x<=84;x+=12)cyl(g,P,x,82,3,6,30,st.sw);for(let y=12;y<=72;y+=12)cyl(g,P,84,y,3,6,30,st.sw);
    if(st.rt==='gable')gable(g,P,6,6,90,90,36,20,R,true);else if(st.rt==='pyr')pyr(g,P,0,0,96,96,36,26,R);else{ibox(g,P,6,6,90,90,36,5,R);band(g,P,6,6,90,90,37,m)}
    flagP(g,P,48,48,st.rt==='flat'?41:52,m,18);break}
  case'templo':{shadowB(g,P,4,4,92,92,80);
    if(st===STY.egito){ibox(g,P,8,8,88,88,0,4,ST);ibox(g,P,20,14,80,60,4,28,W);frustum(g,P,10,56,40,76,4,46,4,W2);frustum(g,P,56,56,86,76,4,46,4,W2);faceL(g,P,40,56,68,4,30,dk);
      band(g,P,14,60,36,72,40,m);for(const x of[60,70,80])faceL(g,P,x-2,x,76,10,40,st.acc)}
    else if(st===STY.babilonia){frustum(g,P,4,4,92,92,0,18,6,W);frustum(g,P,16,16,80,80,18,18,6,W2);frustum(g,P,28,28,68,68,36,16,4,W);ibox(g,P,36,36,60,60,52,16,'#2b5ea3');pyr(g,P,34,34,62,62,68,10,'#d9b24a');
      poly(g,[P(42,92,0),P(54,92,0),P(54,74,36),P(42,74,36)],sh(W,.7),sh(W,.4))}
    else if(st===STY.oriental){for(let i=0;i<3;i++){const a=14+i*10,b=82-i*10,z=i*24;ibox(g,P,a+4,a+4,b-4,b-4,z,16,W);pyr(g,P,a-4,a-4,b+4,b+4,z+16,10,R)}const c=P(48,48,82);ln(g,c[0],c[1],c[0],c[1]-14,'#c9a24a',2)}
    else{ibox(g,P,4,4,92,92,0,4,ST);ibox(g,P,8,8,88,88,4,4,ST);ibox(g,P,24,22,72,70,8,34,W);
      for(let x=14;x<=86;x+=9)cyl(g,P,x,84,2.8,8,34,st.sw);for(let y=14;y<=76;y+=9)cyl(g,P,86,y,2.8,8,34,st.sw);gable(g,P,8,8,90,90,42,22,R,true)}
    flagP(g,P,10,10,4,m,24);break}
  case'oficina':{shadowB(g,P,10,10,60,44,44);ibox(g,P,10,10,60,44,0,26,W2);faceL(g,P,24,44,44,0,18,dk);band(g,P,10,10,60,44,22,m);roofS(g,P,st,10,10,60,44,26,14);
    const c=P(76,30,16);g.strokeStyle='#6a4626';g.lineWidth=2.4;g.beginPath();g.ellipse(c[0],c[1],10,11,0,0,7);g.stroke();for(let a=0;a<6;a++){const ca=Math.cos(a*1.05),sa=Math.sin(a*1.05);ln(g,c[0],c[1],c[0]+ca*10,c[1]+sa*11,'#7a5230',1.4)}
    for(let i=0;i<3;i++)ibox(g,P,20+i*3,60,70,64,i*3.5,3.5,'#9a6c3a');
    lnp(g,P(40,80,0),P(66,74,22),'#7a5230',2.2);lnp(g,P(56,84,0),P(66,74,22),'#7a5230',2.2);break}
  case'torre':{shadowB(g,P,4,4,28,28,90);ibox(g,P,5,5,27,27,0,70,ST);courses(g,P,5,5,27,27,0,70,7,.2);
    for(const z of[22,46])faceL(g,P,14,17,27,z,z+8,dk),faceR(g,P,27,14,17,z,z+8,dk);
    band(g,P,5,5,27,27,66,m);ibox(g,P,2,2,30,30,70,7,ST);crenL(g,P,2,30,30,77,3.5,ST);crenR(g,P,30,2,30,77,3.5,ST);
    if(st.rt==='pyr')pyr(g,P,0,0,32,32,77,18,R);flagP(g,P,16,16,st.rt==='pyr'?92:77,m,18);break}
  case'muralha':{ibox(g,P,2,2,30,30,0,24,ST);courses(g,P,2,2,30,30,0,24,6,.22);crenL(g,P,2,30,30,24,4,ST);crenR(g,P,30,2,30,24,4,ST);break}
  case'maravilha':{shadowB(g,P,4,4,124,124,120);
    if(st===STY.egito){pyr(g,P,6,6,122,122,0,116,'#e6d29c');g.globalAlpha=.15;for(let z=10;z<110;z+=10){const k=58*(1-z/116);lnp(g,P(64-k,64+k,z),P(64+k,64+k,z),'#000',.5);lnp(g,P(64+k,64-k,z),P(64+k,64+k,z),'#000',.5)}g.globalAlpha=1;
      pyr(g,P,52,52,76,76,92,24,'#f3cc4c');for(const[x,y]of[[118,16],[16,118]]){ibox(g,P,x-3,y-3,x+3,y+3,0,46,'#d8c08a');pyr(g,P,x-3,y-3,x+3,y+3,46,6,'#f3cc4c')}flagP(g,P,104,104,0,m,26)}
    else if(st===STY.babilonia){frustum(g,P,4,4,124,124,0,26,8,W);frustum(g,P,20,20,108,108,26,24,8,W2);frustum(g,P,36,36,92,92,50,22,6,W);ibox(g,P,46,46,82,82,72,22,'#2b5ea3');faceL(g,P,58,70,82,72,88,'#d9b24a');pyr(g,P,44,44,84,84,94,14,'#d9b24a');
      poly(g,[P(56,124,0),P(72,124,0),P(72,100,50),P(56,100,50)],sh(W,.7),sh(W,.4));flagP(g,P,64,64,108,m,22)}
    else if(st===STY.oriental){for(let i=0;i<4;i++){const a=16+i*11,b=112-i*11,z=i*26;ibox(g,P,a+4,a+4,b-4,b-4,z,16,i%2?W2:W);band(g,P,a+4,a+4,b-4,b-4,z+12,m);pyr(g,P,a-6,a-6,b+6,b+6,z+16,12,R)}const c=P(64,64,116);ln(g,c[0],c[1],c[0],c[1]-26,'#d9b24a',2.4);for(let i=0;i<4;i++)ell(g,c[0],c[1]-6-i*5,3.5-i*.5,1.6,'#d9b24a')}
    else{ibox(g,P,2,2,126,126,0,5,ST);ibox(g,P,8,8,120,120,5,5,ST);ibox(g,P,14,14,114,114,10,5,ST);ibox(g,P,30,28,98,96,15,44,W);
      for(let x=20;x<=112;x+=10)cyl(g,P,x,110,3.4,15,44,st.sw);for(let y=20;y<=100;y+=10)cyl(g,P,110,y,3.4,15,44,st.sw);
      gable(g,P,14,14,116,116,59,28,R,true);band(g,P,14,14,116,116,59,m);flagP(g,P,116,64,59,m,24)}
    break}
  case'universidade':{shadowB(g,P,4,4,92,92,70);ibox(g,P,4,4,92,92,0,6,ST);courses(g,P,4,4,92,92,0,6,3,.2);
    ibox(g,P,10,30,86,70,6,28,W);faceL(g,P,30,46,70,6,22,dk);faceL(g,P,56,72,70,6,22,dk);band(g,P,10,30,86,70,28,m);
    if(st.rt==='gable')gable(g,P,8,28,88,72,34,14,R,true);else if(st.rt==='pyr')pyr(g,P,8,28,88,72,34,18,R);else{ibox(g,P,8,28,88,72,34,4,R)}
    ibox(g,P,34,8,62,32,6,52,W2);faceL(g,P,42,54,32,10,40,dk);band(g,P,34,8,62,32,50,m);ibox(g,P,32,6,64,34,58,4,ST);
    pyr(g,P,38,12,58,30,62,16,'#3d6fc0');flagP(g,P,48,21,78,m,14);
    for(const x of[16,26,66,76])cyl(g,P,x,72,2.6,6,26,st.sw);break}
  case'biblioteca':{shadowB(g,P,4,4,92,92,64);ibox(g,P,4,4,92,92,0,6,ST);courses(g,P,4,4,92,92,0,6,3,.2);
    ibox(g,P,16,14,80,70,6,34,W);faceL(g,P,40,56,70,6,24,dk);for(const x of[24,34,62,72])faceL(g,P,x,x+5,70,16,30,'#3a2a18');
    for(let x=12;x<=84;x+=12)cyl(g,P,x,80,3,6,34,st.sw);band(g,P,16,14,80,70,34,m);
    if(st.rt==='gable')gable(g,P,8,8,88,84,40,18,R,true);else if(st.rt==='pyr')pyr(g,P,4,4,92,88,40,22,R);else{ibox(g,P,8,8,88,84,40,5,R);band(g,P,8,8,88,84,41,m)}
    ibox(g,P,40,40,56,56,st.rt==='flat'?45:50,14,W2);pyr(g,P,38,38,58,58,st.rt==='flat'?59:64,10,'#3d6fc0');flagP(g,P,48,48,st.rt==='flat'?69:74,m,14);break}
  case'forte':{shadowB(g,P,2,2,94,94,72);ibox(g,P,6,6,90,90,0,8,ST);
    ibox(g,P,8,8,88,16,8,30,ST);ibox(g,P,8,16,16,88,8,30,ST);courses(g,P,8,8,88,16,8,30,6,.2);courses(g,P,8,16,16,88,8,30,6,.2);
    crenL(g,P,8,88,16,38,4,ST);crenR(g,P,88,8,16,38,4,ST);
    ibox(g,P,30,30,70,70,8,40,W);faceL(g,P,44,56,70,8,26,dk);band(g,P,30,30,70,70,44,m);crenL(g,P,30,70,70,48,4,W);crenR(g,P,70,30,70,48,4,W);
    for(const[x,y]of[[4,4],[78,4],[4,78],[78,78]]){ibox(g,P,x,y,x+16,y+16,8,52,ST);courses(g,P,x,y,x+16,y+16,8,52,7,.22);crenL(g,P,x,y+16,y+16,60,3.5,ST);crenR(g,P,x+16,y,y+16,60,3.5,ST)}
    flagP(g,P,50,50,48,m,24);break}
  }
}
// ---------- unidades ----------
const SKIN='#d8a06c';
function body(g,cx,gy,col,dk,robe){
  ell(g,cx,gy,8,3.2,'rgba(0,0,0,.32)');
  if(!robe){ln(g,cx-2.6,gy-9,cx-3.4,gy-1,'#3a2a1a',3.2);ln(g,cx+2.6,gy-9,cx+3.2,gy-1,'#3a2a1a',3.2);ell(g,cx-3.6,gy-.5,2.2,1.1,'#2a1a0c');ell(g,cx+3.8,gy-.5,2.2,1.1,'#2a1a0c');
    g.fillStyle=col;g.beginPath();g.moveTo(cx-6,gy-21);g.lineTo(cx+6,gy-21);g.lineTo(cx+7,gy-9);g.lineTo(cx-7,gy-9);g.closePath();g.fill();
    ln(g,cx-7,gy-10,cx+7,gy-10,dk,2);ln(g,cx-6,gy-20,cx+6,gy-20,sh(col,1.25),1)}
  else{g.fillStyle=col;g.beginPath();g.moveTo(cx-5.5,gy-22);g.lineTo(cx+5.5,gy-22);g.lineTo(cx+8,gy);g.lineTo(cx-8,gy);g.closePath();g.fill();ln(g,cx,gy-21,cx,gy-1,dk,2.4)}
  ln(g,cx-6,gy-19,cx-8,gy-11,SKIN,2.4);ln(g,cx+6,gy-19,cx+8.5,gy-12,SKIN,2.4);
  circ(g,cx,gy-25.5,4.4,SKIN);circ(g,cx+2,gy-25.5,.8,'#2a1a0c');
}
function horse(g,cx,gy,coat,arm){
  ell(g,cx,gy,15,4,'rgba(0,0,0,.3)');
  for(const[a,b]of[[-9,-8],[-5,-8],[7,-8],[11,-8]])ln(g,cx+a,gy+b,cx+a+(a<0?-1:1),gy-.5,sh(coat,.7),2.4);
  ell(g,cx+1,gy-13,13,6.5,coat);ell(g,cx+1,gy-15,11,3.5,sh(coat,1.12));
  g.fillStyle=coat;g.beginPath();g.moveTo(cx+8,gy-17);g.lineTo(cx+14,gy-30);g.lineTo(cx+19,gy-29);g.lineTo(cx+15,gy-15);g.closePath();g.fill();
  ell(g,cx+19,gy-28,5.5,3.2,coat);ln(g,cx+10,gy-20,cx+15,gy-31,'#2a1a0c',2);circ(g,cx+19,gy-29.5,.8,'#111');
  ln(g,cx-11,gy-15,cx-16,gy-6,'#2a1a0c',2.4);
  if(arm){g.fillStyle=arm;g.beginPath();g.moveTo(cx-10,gy-18);g.lineTo(cx+9,gy-18);g.lineTo(cx+8,gy-8);g.lineTo(cx-9,gy-8);g.closePath();g.fill()}
}
function rider(g,cx,gy,col,dk,helm){
  g.fillStyle=col;g.beginPath();g.moveTo(cx-5,gy-35);g.lineTo(cx+5,gy-35);g.lineTo(cx+5,gy-22);g.lineTo(cx-5,gy-22);g.closePath();g.fill();
  ln(g,cx-2,gy-22,cx+3,gy-14,dk,3);circ(g,cx,gy-39,4.2,SKIN);
  if(helm)ell(g,cx,gy-41,4.6,3,helm);
}
function elephant(g,cx,gy,col,war){
  ell(g,cx,gy,22,5.5,'rgba(0,0,0,.3)');
  for(const a of[-13,-6,8,14])ibx(g,cx+a-3,gy-14,6,14,sh(col,.75));
  ell(g,cx,gy-22,20,13,col);ell(g,cx-2,gy-27,16,7,sh(col,1.1));
  ell(g,cx+18,gy-26,8,9,col);ell(g,cx+13,gy-27,6,8,sh(col,.85));
  g.strokeStyle=col;g.lineWidth=4.5;g.beginPath();g.moveTo(cx+24,gy-24);g.quadraticCurveTo(cx+30,gy-12,cx+26,gy-4);g.stroke();
  g.strokeStyle='#f2ead2';g.lineWidth=2;g.beginPath();g.moveTo(cx+22,gy-20);g.quadraticCurveTo(cx+30,gy-18,cx+31,gy-24);g.stroke();
  circ(g,cx+21,gy-29,1,'#111');ln(g,cx-20,gy-22,cx-24,gy-12,sh(col,.7),2);
  if(war){ibx(g,cx-11,gy-44,20,12,war.m);ibx(g,cx-11,gy-44,20,3,sh(war.m,1.3));ell(g,cx-1,gy-34,15,4,'#c9a24a');circ(g,cx-2,gy-48,4,SKIN);ell(g,cx-2,gy-50,4.4,2.6,'#aaa');ln(g,cx+5,gy-46,cx+18,gy-58,'#ccc',1.4)}
}
function ibx(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
function hull(g,cx,gy,len,col,stripe){
  ell(g,cx,gy-6,len*.62,7,'rgba(255,255,255,.18)');
  g.fillStyle=col;g.beginPath();g.moveTo(cx-len*.5,gy-17);g.lineTo(cx+len*.42,gy-17);g.lineTo(cx+len*.55,gy-25);g.lineTo(cx+len*.46,gy-9);g.lineTo(cx-len*.4,gy-7);g.lineTo(cx-len*.54,gy-14);g.closePath();g.fill();
  g.fillStyle=sh(col,.7);g.beginPath();g.moveTo(cx-len*.46,gy-11);g.lineTo(cx+len*.46,gy-11);g.lineTo(cx+len*.44,gy-9);g.lineTo(cx-len*.4,gy-7);g.closePath();g.fill();
  ln(g,cx-len*.48,gy-15,cx+len*.44,gy-15,stripe,2);ln(g,cx-len*.5,gy-17,cx+len*.42,gy-17,sh(col,1.3),1);
}
function sail(g,x,top,bot,w,c1,stripe){ln(g,x,bot,x,top-4,'#5a3a1e',1.8);ln(g,x-w/2,top,x+w/2,top,'#5a3a1e',1.4);
  g.fillStyle=c1;g.beginPath();g.moveTo(x-w/2,top);g.lineTo(x+w/2,top);g.quadraticCurveTo(x+w/2+4,(top+bot)/2,x+w/2,bot-4);g.lineTo(x-w/2,bot-4);g.quadraticCurveTo(x-w/2+3,(top+bot)/2,x-w/2,top);g.fill();
  if(stripe){g.fillStyle=stripe;g.fillRect(x-w/2+1,(top+bot)/2-3,w-1,5)}}
function paintUnit(g,type,C,v){
  const m=C.m,dk=C.d;
  const sp=UT[type].spr,cx=sp[2],gy=sp[3];
  switch(type){
  case'vill':body(g,cx,gy,m,dk);ell(g,cx,gy-28,7.5,2.4,'#d8b860');ell(g,cx,gy-29.5,4,2.4,'#c8a850');break;
  case'guer':body(g,cx,gy,m,dk);g.strokeStyle='#3a2a1a';g.lineWidth=2;g.beginPath();g.arc(cx,gy-27,4.6,Math.PI,0);g.stroke();
    if(v){ln(g,cx+8,gy-12,cx+11,gy-30,'#6a4626',1.8);poly(g,[[cx+9,gy-31],[cx+16,gy-33],[cx+15,gy-25],[cx+10,gy-27]],'#c8c8c8','#666')}
    else{ln(g,cx+8,gy-12,cx+12,gy-29,'#7a5230',2.6);ell(g,cx+12,gy-29,2.4,3.2,'#6a4626')}break;
  case'espa':body(g,cx,gy,m,dk);ell(g,cx,gy-28,4.8,3.4,'#a8a8b0');ibx(g,cx-1,gy-34,2,5,dk);ln(g,cx+8,gy-12,cx+13,gy-29,'#e8e8e8',2);ln(g,cx+6,gy-14,cx+10,gy-14,'#8a6a3a',2);
    poly(g,[[cx-11,gy-21],[cx-4,gy-22],[cx-4,gy-8],[cx-11,gy-9]],dk,'#000');ell(g,cx-7.5,gy-15,1.6,2.4,'#d8c070');break;
  case'hopl':body(g,cx,gy,m,dk);ell(g,cx,gy-28,5,3.6,'#c9a24a');g.fillStyle=dk;g.beginPath();g.moveTo(cx-6,gy-31);g.quadraticCurveTo(cx,gy-41,cx+6,gy-31);g.lineTo(cx,gy-33);g.closePath();g.fill();
    ln(g,cx+9,gy-44,cx+9,gy-4,'#6a4626',1.6);poly(g,[[cx+9,gy-48],[cx+11,gy-42],[cx+7,gy-42]],'#ddd');ell(g,cx-7,gy-16,7,8,'#c9a24a');ell(g,cx-7,gy-16,5,6,m);circ(g,cx-7,gy-16,1.6,'#c9a24a');break;
  case'arq':body(g,cx,gy,m,dk);ln(g,cx-4,gy-28,cx+4,gy-28,'#c83a2a',1.6);g.strokeStyle='#6a4626';g.lineWidth=1.6;g.beginPath();g.arc(cx+5,gy-17,10,-1.2,1.2);g.stroke();ln(g,cx+8.6,gy-26.3,cx+8.6,gy-7.7,'#ddd',.6);ibx(g,cx-10,gy-23,3,11,'#7a4a2a');break;
  case'arqc':body(g,cx,gy,m,dk);ell(g,cx,gy-28,4.8,3.2,'#a8a8b0');g.strokeStyle='#4a2a14';g.lineWidth=2;g.beginPath();g.moveTo(cx+4,gy-30);g.quadraticCurveTo(cx+14,gy-26,cx+10,gy-17);g.quadraticCurveTo(cx+14,gy-8,cx+4,gy-4);g.stroke();ln(g,cx+4,gy-30,cx+4,gy-4,'#ddd',.6);ibx(g,cx-10,gy-23,3,11,'#7a4a2a');break;
  case'sac':body(g,cx,gy,'#f2ead6','#c9a24a',true);ln(g,cx-6,gy-21,cx+6,gy-12,m,2.6);ell(g,cx,gy-28,5,3.2,'#e8e0cc');ln(g,cx+9,gy-36,cx+9,gy,'#8a6236',1.6);circ(g,cx+9,gy-37,2.4,'#e2c040');break;
  case'bat':horse(g,cx,gy,'#a0703e');rider(g,cx-1,gy,m,dk,'#5a3a1e');ln(g,cx+4,gy-30,cx+12,gy-38,'#ccc',1.2);break;
  case'cav':horse(g,cx,gy,'#5a3e2a',m);rider(g,cx-1,gy,m,dk,'#b0b0b8');ln(g,cx-2,gy-28,cx+24,gy-42,'#d8d8d8',1.6);poly(g,[[cx+24,gy-42],[cx+28,gy-45],[cx+25,gy-40]],'#eee');break;
  case'arqcav':horse(g,cx,gy,'#7a5434');rider(g,cx-1,gy,m,dk,'#5a3a1e');g.strokeStyle='#6a4626';g.lineWidth=1.6;g.beginPath();g.arc(cx+5,gy-30,8,-1.2,1.2);g.stroke();break;
  case'carro':{ell(g,cx,gy,24,5,'rgba(0,0,0,.3)');const hx=cx+10;horse(g,hx,gy,'#8a5a32');
    ibx(g,cx-22,gy-22,16,12,m);ibx(g,cx-22,gy-22,16,2.5,sh(m,1.3));ln(g,cx-6,gy-14,hx-6,gy-14,'#6a4626',1.8);
    g.strokeStyle='#4a3018';g.lineWidth=2.4;g.beginPath();g.ellipse(cx-14,gy-8,7,8,0,0,7);g.stroke();for(let a=0;a<4;a++)ln(g,cx-14+Math.cos(a*.8)*7,gy-8+Math.sin(a*.8)*8,cx-14-Math.cos(a*.8)*7,gy-8-Math.sin(a*.8)*8,'#6a4a28',1);
    g.fillStyle=m;g.fillRect(cx-18,gy-34,8,12);circ(g,cx-14,gy-37,4,SKIN);ell(g,cx-14,gy-39,4.4,2.4,'#aaa');break}
  case'elef':elephant(g,cx,gy,'#8a8a88',C);break;
  case'pedra':{ell(g,cx,gy,22,5,'rgba(0,0,0,.3)');for(const a of[-14,10]){g.strokeStyle='#4a3018';g.lineWidth=2.6;g.beginPath();g.ellipse(cx+a,gy-6,5,6,0,0,7);g.stroke()}
    ibx(g,cx-20,gy-14,38,6,'#8a6034');ibx(g,cx-20,gy-14,38,2,m);ln(g,cx-8,gy-14,cx-2,gy-28,'#6a4626',3);ln(g,cx+6,gy-14,cx-2,gy-28,'#6a4626',3);
    ln(g,cx+12,gy-12,cx-14,gy-36,'#9a7040',2.6);ell(g,cx-15,gy-38,4.5,3,'#5a4026');circ(g,cx-15,gy-40,2.4,'#888');ibx(g,cx+9,gy-18,6,7,'#5a5a5a');break}
  case'bal':{ell(g,cx,gy,22,5,'rgba(0,0,0,.3)');for(const a of[-12,12]){g.strokeStyle='#4a3018';g.lineWidth=2.4;g.beginPath();g.ellipse(cx+a,gy-6,5,6,0,0,7);g.stroke()}
    ibx(g,cx-18,gy-14,36,5,'#8a6034');ibx(g,cx-18,gy-14,36,2,m);ln(g,cx,gy-14,cx,gy-24,'#6a4626',3);ln(g,cx-14,gy-26,cx+18,gy-26,'#8a6034',3);
    g.strokeStyle='#5a3a1e';g.lineWidth=2.2;g.beginPath();g.moveTo(cx+6,gy-38);g.quadraticCurveTo(cx+14,gy-26,cx+6,gy-14);g.stroke();ln(g,cx+6,gy-38,cx-6,gy-26,'#ddd',.7);ln(g,cx+6,gy-14,cx-6,gy-26,'#ddd',.7);ln(g,cx-6,gy-26,cx+20,gy-26,'#ccc',1.2);break}
  case'pesc':hull(g,cx,gy,46,'#8a6236',m);sail(g,cx-2,gy-46,gy-17,16,'#efe6cf',null);circ(g,cx+10,gy-23,3,SKIN);ibx(g,cx+8,gy-21,5,4,m);
    g.strokeStyle='rgba(230,220,190,.7)';g.lineWidth=.6;for(let i=0;i<4;i++){ln(g,cx-20+i*3,gy-19,cx-24+i*3,gy-8,'rgba(230,220,190,.7)',.6)}break;
  case'trans':hull(g,cx,gy,64,'#7a5530',m);sail(g,cx,gy-54,gy-17,28,'#ece2c8',sh(m,1.1));for(let i=0;i<3;i++)ibx(g,cx-24+i*8,gy-22,6,5,'#a87a3e');break;
  case'bguer':hull(g,cx,gy,64,'#6a4a2c',m);for(let i=0;i<6;i++)ln(g,cx-22+i*8,gy-12,cx-26+i*8,gy-2,'#4a3018',1.2);sail(g,cx-2,gy-60,gy-17,26,'#f2ead6',m);ibx(g,cx+18,gy-22,8,5,dk);break;
  case'trir':hull(g,cx,gy,80,'#5a3e24',m);for(let i=0;i<9;i++){ln(g,cx-32+i*8,gy-12,cx-36+i*8,gy-1,'#4a3018',1.2);ln(g,cx-30+i*8,gy-14,cx-33+i*8,gy-5,'#5a3a1e',1)}
    poly(g,[[cx+36,gy-12],[cx+46,gy-10],[cx+36,gy-8]],'#b08a4a');sail(g,cx-4,gy-66,gy-17,32,'#f2ead6',m);sail(g,cx+22,gy-44,gy-17,14,'#f2ead6',null);break;
  case'gaz':{ell(g,cx,gy,11,3,'rgba(0,0,0,.3)');for(const a of[-7,-4,6,9])ln(g,cx+a,gy-10,cx+a,gy,'#7a5030',1.6);ell(g,cx,gy-14,11,5,'#c8925a');ell(g,cx,gy-11.5,8,2.4,'#f0e2c8');
    g.fillStyle='#c8925a';g.beginPath();g.moveTo(cx+7,gy-16);g.lineTo(cx+12,gy-26);g.lineTo(cx+15,gy-24);g.lineTo(cx+11,gy-14);g.closePath();g.fill();ell(g,cx+14,gy-26,4,2.5,'#c8925a');
    ln(g,cx+13,gy-28,cx+11,gy-35,'#3a2a1a',1.2);ln(g,cx+15,gy-28,cx+15,gy-35,'#3a2a1a',1.2);circ(g,cx+15,gy-26.5,.7,'#111');ln(g,cx-10,gy-15,cx-12,gy-12,'#3a2a1a',1.6);break}
  case'elfs':elephant(g,cx,gy,'#8e8a84',null);break;
  case'leao':{ell(g,cx,gy,15,3.4,'rgba(0,0,0,.3)');for(const a of[-9,-5,6,10])ln(g,cx+a,gy-9,cx+a,gy,'#a8742e',2.6);ell(g,cx,gy-13,13,6,'#d8a048');
    ell(g,cx+12,gy-16,7.5,8,'#7a4a1e');ell(g,cx+14,gy-15,4.6,4.4,'#d8a048');circ(g,cx+16,gy-16,.8,'#111');ell(g,cx+18,gy-13,1.6,1.2,'#3a2a1a');
    g.strokeStyle='#c8902e';g.lineWidth=1.8;g.beginPath();g.moveTo(cx-12,gy-14);g.quadraticCurveTo(cx-20,gy-16,cx-18,gy-24);g.stroke();ell(g,cx-18,gy-24,1.8,2.4,'#7a4a1e');break}
  }
}
// ---------- recursos ----------
function paintTree(g,v,dark){
  const cx=22,gy=64;ell(g,cx,gy-2,13,4.6,'rgba(0,0,0,.3)');
  if(v===3){g.strokeStyle='#7a5a32';g.lineWidth=3.4;g.beginPath();g.moveTo(cx-2,gy-2);g.quadraticCurveTo(cx+4,gy-24,cx+1,gy-44);g.stroke();
    const t=[cx+1,gy-44];for(let i=0;i<7;i++){const a=i/7*Math.PI*2;g.strokeStyle=i%2?'#3f7a2a':'#2f6a24';g.lineWidth=3.2;g.beginPath();g.moveTo(t[0],t[1]);g.quadraticCurveTo(t[0]+Math.cos(a)*10,t[1]-8+Math.sin(a)*3,t[0]+Math.cos(a)*16,t[1]+5+Math.abs(Math.sin(a))*4);g.stroke()}
    circ(g,t[0]-2,t[1]+2,2,'#6a4a1e');circ(g,t[0]+2,t[1]+2,2,'#6a4a1e');return}
  ibx(g,cx-2.5,gy-18,5,16,'#5a3a1e');
  const cs=[['#2c6526','#3c8232','#58a444'],['#245a2c','#356f3a','#4e9150'],['#356a24','#4a8a2c','#6aa83a']][v];
  if(v===1){for(let i=0;i<4;i++){const y=gy-16-i*11,w=15-i*3;poly(g,[[cx,y-16],[cx+w,y],[cx-w,y]],i%2?cs[1]:cs[0])}poly(g,[[cx,gy-62],[cx+4,gy-52],[cx-4,gy-52]],cs[2])}
  else{circ(g,cx,gy-30,14,cs[0]);circ(g,cx-7,gy-34,9,cs[1]);circ(g,cx+7,gy-36,9,cs[1]);circ(g,cx,gy-42,8,cs[1]);circ(g,cx-3,gy-44,5,cs[2]);circ(g,cx+5,gy-32,4,cs[2])}
}
function paintRes(g,k){
  if(k==='berry'){ell(g,24,30,15,5,'rgba(0,0,0,.3)');circ(g,16,22,9,'#356f2c');circ(g,30,21,10,'#2c6526');circ(g,23,15,9,'#428a36');
    for(const[x,y]of[[12,20],[16,13],[22,10],[28,14],[32,20],[25,22],[18,24],[29,27],[13,27],[22,17]])circ(g,x,y,1.9,'#d6305a');return}
  if(k==='gold'||k==='stone'){const a=k==='gold'?['#7a6018','#c9a22c','#ffe36a']:['#55524d','#8e8a84','#c8c4bc'];ell(g,24,30,17,6,'rgba(0,0,0,.3)');
    circ(g,15,24,9,a[0]);circ(g,31,23,10,a[0]);circ(g,22,17,9,a[1]);circ(g,32,19,6,a[1]);circ(g,13,20,5,a[1]);circ(g,20,14,3.2,a[2]);circ(g,30,17,2.2,a[2]);
    if(k==='gold'){for(const[x,y]of[[16,22],[26,25],[35,22]])circ(g,x,y,1.3,'#fff6c0')}return}
  if(k==='fish0'||k==='fish1'){g.strokeStyle='rgba(220,240,255,.55)';g.lineWidth=1;for(let i=0;i<2;i++){g.beginPath();g.ellipse(24,22,12+i*6,5+i*2.5,0,0,7);g.stroke()}
    for(const[x,y,s]of(k==='fish1'?[[16,20,1.3],[30,24,1.1],[24,16,1.2]]:[[18,20,1],[30,23,.9]])){g.fillStyle='rgba(40,70,90,.75)';g.beginPath();g.ellipse(x,y,5*s,2*s,0,0,7);g.fill();poly(g,[[x-5*s,y],[x-8*s,y-2*s],[x-8*s,y+2*s]],'rgba(40,70,90,.75)')}return}
  if(k==='carc'){ell(g,20,18,14,4,'rgba(0,0,0,.25)');ell(g,20,14,12,5,'#7a4a2a');ell(g,18,13,8,3,'#a8432e');for(let i=0;i<4;i++)ln(g,13+i*4,11,14+i*4,16,'#f0e6d0',1)}
}
let SPR={},THUMB={},RIMG={};
function bbox(c){const g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=0,y1=0;for(let y=0;y<c.height;y+=2)for(let x=0;x<c.width;x+=2){if(d[(y*c.width+x)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}if(x1<x0)return{x:0,y:0,w:c.width,h:c.height};return{x:x0,y:y0,w:x1-x0+2,h:y1-y0+2}}
function darkCopy(c){const d=document.createElement('canvas');d.width=c.width;d.height=c.height;const g=d.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(10,8,30,.45)';g.fillRect(0,0,d.width,d.height);return d}
function bldCanvas(type,o){
  const T=BT[type],sz=T.sz,S=sz*TS,M=34,W=sz*64+M*2,top=T.h+22,H=top+sz*32+10;
  const[c,g]=mkC(W,H);const P=(x,y,z)=>[W/2+(x-y),top+(x+y)/2-(z||0)];
  paintBld(g,P,type,styOf(o),COL[o],S);const bb=bbox(c);return{c,dk:darkCopy(c),W,H,top,bt:bb.y/SS};
}
function buildSprites(){
  SPR={};THUMB={};
  for(let o=0;o<MAX_PLAYERS;o++){
    for(const t in BT){if(t==='fazenda')continue;SPR['b'+t+o]=bldCanvas(t,o)}
    for(const t in UT){if(UT[t].cls==='animal')continue;const sp=UT[t].spr;const[c,g]=mkC(sp[0],sp[1]);paintUnit(g,t,COL[o],0);SPR['u'+t+o]=c}
    {const sp=UT.guer.spr;const[c,g]=mkC(sp[0],sp[1]);paintUnit(g,'guer',COL[o],1);SPR['uguerA'+o]=c}
  }
  for(const t of['gaz','elfs','leao']){const sp=UT[t].spr;const[c,g]=mkC(sp[0],sp[1]);paintUnit(g,t,COL[GAIA],0);SPR['u'+t+GAIA]=c}
  for(let v=0;v<4;v++){const[c,g]=mkC(44,70);paintTree(g,v);SPR['tree'+v]={c,dk:darkCopy(c)}}
  for(const k of['berry','gold','stone','fish0','fish1','carc']){const[c,g]=mkC(48,36);paintRes(g,k);SPR[k]={c,dk:darkCopy(c)}}
  // miniaturas para os botões
  const th=(src,sw,sh2,size)=>{const bb=bbox(src);const c=document.createElement('canvas');c.width=c.height=size*2;const g=c.getContext('2d');const s=Math.min(size*2/bb.w,size*2/bb.h)*.94;g.drawImage(src,bb.x,bb.y,bb.w,bb.h,(c.width-bb.w*s)/2,(c.height-bb.h*s)/2,bb.w*s,bb.h*s);return c.toDataURL()};
  for(const t in BT){if(t==='fazenda')continue;const s=SPR['b'+t+'0'];THUMB['b'+t]=th(s.c,s.c.width,s.c.height,40)}
  {const[c,g]=mkC(96,56);const P=(x,y)=>[48+(x-y),4+(x+y)/2];paintFarmIcon(g,P);THUMB.bfazenda=th(c,c.width,c.height,40)}
  for(const t in UT){const s=SPR['u'+t+(UT[t].cls==='animal'?GAIA:0)];THUMB['u'+t]=th(s,s.width,s.height,40)}
  THUMB.uguerA=th(SPR.uguerA0,SPR.uguerA0.width,SPR.uguerA0.height,40);
  for(const k of['berry','gold','stone','fish1','carc'])THUMB['r'+k]=th(SPR[k].c,SPR[k].c.width,SPR[k].c.height,40);
  THUMB.rtree=th(SPR.tree0.c,SPR.tree0.c.width,SPR.tree0.c.height,40);
}
function paintFarmIcon(g,P){poly(g,[P(0,0),P(88,0),P(88,88),P(0,88)],'#7a5530');for(let i=0;i<6;i++){g.strokeStyle='#5a3a1e';g.lineWidth=2;const a=P(4,8+i*14),b=P(84,8+i*14);ln(g,a[0],a[1],b[0],b[1],'#5a3a1e',2);for(let j=0;j<7;j++){const q=P(8+j*11,4+i*14);ell(g,q[0],q[1],2.2,3,'#7ab83a')}}}
// ícones de recursos (barra de cima)
function buildResIcons(){
  const mk=f=>{const[c,g]=mkC(20,20);f(g);return c.toDataURL()};
  RIMG.food=mk(g=>{ell(g,9,11,7,5.5,'#b0482a');ell(g,8,10,5,3.6,'#d8644a');ln(g,14,14,18,18,'#f0e6d0',2.4);circ(g,18.5,18.5,1.6,'#f0e6d0')});
  RIMG.wood=mk(g=>{ibx(g,3,6,14,9,'#8a5a2a');ibx(g,3,6,14,2,'#a8743a');ell(g,17,10.5,3,4.5,'#d8a868');ell(g,17,10.5,1.6,2.6,'#a8743a')});
  // metal: lingotes; riqueza: moedas; conhecimento: livro; petróleo: gota
  RIMG.gold=mk(g=>{const bar=(x,y,c1,c2)=>{g.fillStyle=c1;g.beginPath();g.moveTo(x,y);g.lineTo(x+9,y);g.lineTo(x+11,y+4);g.lineTo(x-2,y+4);g.closePath();g.fill();g.fillStyle=c2;g.fillRect(x+1,y,7,1.3)};bar(2,13,'#6f7c8c','#c8d4e2');bar(9,13,'#6f7c8c','#c8d4e2');bar(5.5,8.6,'#8a98aa','#e4ecf6')});
  RIMG.wealth=mk(g=>{circ(g,8,12,6.5,'#a8801c');circ(g,8,12,5.2,'#f0c840');circ(g,13,9,6.5,'#a8801c');circ(g,13,9,5.2,'#f6d24a');circ(g,11.6,7.6,1.8,'#fff1a0')});
  RIMG.know=mk(g=>{g.fillStyle='#1d4a8a';g.fillRect(3,4,14,13);g.fillStyle='#f2ead8';g.fillRect(4.5,5.5,5,10);g.fillRect(10.5,5.5,5,10);g.fillStyle='#8aa';for(let i=0;i<4;i++){g.fillRect(5.5,7+i*2,3,.8);g.fillRect(11.5,7+i*2,3,.8)}g.fillStyle='#e2bd62';g.fillRect(9.4,4,1.2,13)});
  RIMG.oil=mk(g=>{g.fillStyle='#111';g.beginPath();g.moveTo(10,2);g.quadraticCurveTo(17,11,15,14);g.arc(10,13.5,5.2,0,Math.PI);g.quadraticCurveTo(3,11,10,2);g.fill();g.fillStyle='#6a6a7a';g.beginPath();g.ellipse(8,12,1.4,2.4,0,0,7);g.fill()});
  RIMG.stone=RIMG.gold;
  document.querySelectorAll('[data-ri]').forEach(el=>el.src=RIMG[el.dataset.ri]);
}
const rimg=k=>'<img src="'+RIMG[k]+'">';
function costTxt(c){return Object.keys(c).map(k=>rimg(k)+c[k]).join(' ')}

// =========================================================
//   TERRENO
// =========================================================
let terrC=null,stumps=null,stumpG=null,WDIST=null;
function hash2(x,y){let h=x*374761393+y*668265263+G.seed;h=(h^(h>>13))*1274126177;return((h^(h>>16))&0xffff)/65535}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const s=t=>t*t*(3-2*t);const a=hash2(xi,yi),b=hash2(xi+1,yi),c=hash2(xi,yi+1),d=hash2(xi+1,yi+1);return a+(b-a)*s(xf)+(c-a)*s(yf)+(a-b-c+d)*s(xf)*s(yf)}
function buildTerrain(){
  const PX=16,W=MW*PX;
  terrC=document.createElement('canvas');terrC.width=W;terrC.height=W;
  const g=terrC.getContext('2d');const img=g.createImageData(W,W);const d=img.data;
  WDIST=waterDist();
  const wd=new Float32Array(N);for(let i=0;i<N;i++)wd[i]=G.terr[i]?-Math.min(4,landDist(i)):WDIST[i];
  const fd=new Float32Array(N);for(const r of G.R)if(r.sub==='tree')fd[idx(r.tx,r.ty)]=1;
  const smp=(A,x,y)=>{const X=clamp(x,0,MW-1.001),Y=clamp(y,0,MH-1.001),xi=X|0,yi=Y|0,xf=X-xi,yf=Y-yi;const a=A[idx(xi,yi)],b=A[idx(Math.min(MW-1,xi+1),yi)],c=A[idx(xi,Math.min(MH-1,yi+1))],e=A[idx(Math.min(MW-1,xi+1),Math.min(MH-1,yi+1))];return(a*(1-xf)+b*xf)*(1-yf)+(c*(1-xf)+e*xf)*yf};
  for(let py=0;py<W;py++)for(let px=0;px<W;px++){
    const tx=px/PX-.5,ty=py/PX-.5;const w=smp(wd,tx,ty)+(vnoise(px/9,py/9)-.5)*.6;
    const n=vnoise(px/48,py/48)*.55+vnoise(px/14,py/14)*.3+hash2(px,py)*.15;
    const f=smp(fd,tx,ty);const dirt=clamp((vnoise(px/30+50,py/30)-.62)*4,0,1);
    let r,gg,b;
    if(w<-.1){const dp=clamp(-w/3,0,1);r=58-dp*38+n*12;gg=128-dp*58+n*16;b=158-dp*30+n*18;
      if(w>-.6){const s=(w+.6)/.5;r+=s*40;gg+=s*40;b+=s*24}}
    else if(w<.9){const s=clamp((w+.1)/1,0,1);r=214-s*14+n*16;gg=192-s*10+n*14;b=134-s*6+n*10;if(w<.12){r=236;gg=232;b=210}}
    else{r=86+n*40;gg=126+n*38;b=46+n*16;
      r=r*(1-dirt*.55)+150*dirt*.55;gg=gg*(1-dirt*.55)+122*dirt*.55;b=b*(1-dirt*.55)+70*dirt*.55;
      if(f>0){r*=1-f*.32;gg*=1-f*.22;b*=1-f*.3}}
    const k=(py*W+px)*4;d[k]=r;d[k+1]=gg;d[k+2]=b;d[k+3]=255;
  }
  g.putImageData(img,0,0);
  for(let i=0;i<3600;i++){const x=hash2(i,7)*W,y=hash2(i,13)*W;const tx=x/PX|0,ty=y/PX|0;if(!inMap(tx,ty)||G.terr[idx(tx,ty)]||WDIST[idx(tx,ty)]<2)continue;
    const k=i%23;g.fillStyle=k===0?'#e8dc78':k===1?'#e6a0c0':k===2?'#f2f2e8':k<6?'rgba(130,120,100,.55)':'rgba(30,70,15,.5)';
    if(k<3)g.fillRect(x,y,1.6,1.6);else if(k<6){g.beginPath();g.arc(x,y,1.3,0,7);g.fill()}else g.fillRect(x,y,1,2.6)}
  stumps=document.createElement('canvas');stumps.width=W;stumps.height=W;stumpG=stumps.getContext('2d');
}
function landDist(i){const x=i%MW,y=i/MW|0;for(let r=1;r<5;r++)for(let b=-r;b<=r;b++)for(let a=-r;a<=r;a++){if(Math.max(Math.abs(a),Math.abs(b))!==r)continue;const X=x+a,Y=y+b;if(inMap(X,Y)&&!G.terr[idx(X,Y)])return r-.5}return 4}
function stumpAt(tx,ty){if(!stumpG)return;const PX=16;stumpG.fillStyle='rgba(70,50,25,.35)';stumpG.beginPath();stumpG.arc(tx*PX+8,ty*PX+9,1.8,0,7);stumpG.fill();stumpG.fillStyle='rgba(160,125,80,.55)';stumpG.beginPath();stumpG.arc(tx*PX+8,ty*PX+8.6,1.1,0,7);stumpG.fill()}

// ---------- névoa ----------
const fogC=document.createElement('canvas');fogC.width=MW;fogC.height=MH;const fogG=fogC.getContext('2d');let fogI=fogG.createImageData(MW,MH);let fogDirty=true;
function drawFogTex(){for(let i=0;i<N;i++){fogI.data[i*4]=6;fogI.data[i*4+1]=4;fogI.data[i*4+2]=2;fogI.data[i*4+3]=!G.exp[i]?255:vis[i]?0:120}fogG.putImageData(fogI,0,0);fogDirty=false}
const circCache={};
function circOff(r){if(circCache[r])return circCache[r];const a=[];for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r)a.push(x,y);return circCache[r]=a}
function updVis(){
  vis.fill(0);
  const mark=(cx,cy,r)=>{const o=circOff(r);for(let i=0;i<o.length;i+=2){const x=cx+o[i],y=cy+o[i+1];if(x>=0&&y>=0&&x<MW&&y<MH){const j=y*MW+x;vis[j]=1;G.exp[j]=1}}};
  for(const u of G.U)if(!u.dead&&!u.inT&&ally(u.o,0))mark(u.x/TS|0,u.y/TS|0,Math.max(2,Math.round(ST(u).los*losMul())));
  for(const b of G.B)if(!b.dead&&ally(b.o,0))mark(b.tx+(b.sz>>1),b.ty+(b.sz>>1),BT[b.type].los+(b.sz>>1));
  if(G.revealAI)for(const b of G.B)if(!b.dead&&b.o===1)for(let y=b.ty;y<b.ty+b.sz;y++)for(let x=b.tx;x<b.tx+b.sz;x++)G.exp[idx(x,y)]=1;
  fogDirty=true;
}

// ---------- minimapa (losango) ----------
const mm=$('mm'),mg=mm.getContext('2d');const MMW=344,MMH=172;let MS=MMW/2/MW;
const mmBase=document.createElement('canvas');mmBase.width=MW*2;mmBase.height=MH*2;const mbg=mmBase.getContext('2d');let mmDirty=true;
function drawMMBase(){mbg.fillStyle='#557a2e';mbg.fillRect(0,0,MW*2,MH*2);for(let i=0;i<N;i++){if(G.terr[i]){mbg.fillStyle='#2e6a9a';mbg.fillRect((i%MW)*2,(i/MW|0)*2,2,2)}else if(WDIST&&WDIST[i]===1){mbg.fillStyle='#cdb47a';mbg.fillRect((i%MW)*2,(i/MW|0)*2,2,2)}}
  for(let i=0;i<N;i++){const d=DOM[i];if(d<0)continue;mbg.fillStyle=d?'rgba(225,60,45,.33)':'rgba(70,140,255,.36)';mbg.fillRect((i%MW)*2,(i/MW|0)*2,2,2)}
  for(const r of G.R){if(r.dead||r.walk||(r.sub==='oil'&&G.P[0].age<5))continue;mbg.fillStyle=r.sub==='oil'?'#111':r.sub==='tree'?'#1d4a19':r.sub==='gold'?'#f0c840':r.sub==='stone'?'#b8b4ac':r.sub==='fish'?'#7ab8e8':'#e05080';mbg.fillRect(r.tx*2,r.ty*2,2,2)}mmDirty=false}
const mmXY=(x,y)=>[MMW/2+(x-y)/TS*MS,(x+y)/TS*MS/2];
function drawMM(){
  if(mmDirty)drawMMBase();
  mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,MMW,MMH);
  mg.setTransform(MS/2,MS/4,-MS/2,MS/4,MMW/2,0);mg.imageSmoothingEnabled=false;mg.drawImage(mmBase,0,0);
  for(const b of G.B){if(b.dead)continue;if(b.o!==0&&!G.exp[idx(b.tx,b.ty)])continue;mg.fillStyle=COL[b.o].m;mg.fillRect(b.tx*2,b.ty*2,b.sz*2,b.sz*2)}
  mg.setTransform(MS,MS/2,-MS,MS/2,MMW/2,0);mg.imageSmoothingEnabled=true;mg.drawImage(fogC,0,0);
  mg.setTransform(1,0,0,1,0,0);
  for(const u of G.U){if(u.dead||u.inT)continue;if(u.o!==0&&!vis[tileOf(u.x,u.y)])continue;const p=mmXY(u.x,u.y);mg.fillStyle=u.o===GAIA?'#e8d8a8':COL[u.o].l;mg.fillRect(p[0]-1.5,p[1]-1.5,3,3)}
  const c=[scrToW(0,TOPH),scrToW(VW,TOPH),scrToW(VW,VH-PANH),scrToW(0,VH-PANH)].map(w=>mmXY(w.x,w.y));
  mg.strokeStyle='#fff';mg.lineWidth=1.5;mg.beginPath();mg.moveTo(...c[0]);for(const p of c)mg.lineTo(...p);mg.closePath();mg.stroke();
  if(UI.lastAlert&&G.t-UI.lastAlert.t<6&&((G.t*4|0)%2)){const p=mmXY(UI.lastAlert.x,UI.lastAlert.y);mg.strokeStyle='#f33';mg.lineWidth=2.5;mg.beginPath();mg.arc(p[0],p[1],9,0,7);mg.stroke()}
}
function mmToWorld(cx,cy){const r=mm.getBoundingClientRect();const mx=(cx-r.left)/r.width*MMW,my=(cy-r.top)/r.height*MMH;const I=(mx-MMW/2)/MS,J=my/(MS/2);return{x:clamp((J+I)/2,0,MW)*TS,y:clamp((J-I)/2,0,MH)*TS}}

// =========================================================
//   CÂMERA E DESENHO DA TELA (isométrico)
// =========================================================
const cv=$('cv');const ctx=cv.getContext('2d',{alpha:false});
const CYc=()=>TOPH+(VH-TOPH-PANH)/2;
function w2s(x,y){const ci=camX-camY,cj=(camX+camY)/2;return{x:VW/2+(x-y-ci)*Z,y:CYc()+((x+y)/2-cj)*Z}}
function scrToW(sx,sy){const ci=camX-camY,cj=(camX+camY)/2;const I=ci+(sx-VW/2)/Z,J=cj+(sy-CYc())/Z;return{x:J+I/2,y:J-I/2}}
function panScreen(dx,dy){const dI=dx/Z,dJ=dy/Z;camX+=dJ+dI/2;camY+=dJ-dI/2;clampCam()}
function clampCam(){camX=clamp(camX,0,MW*TS);camY=clamp(camY,0,MH*TS)}
function centerOn(x,y){camX=x;camY=y;clampCam()}
function resize(){VW=innerWidth;VH=innerHeight;DPR=Math.min(devicePixelRatio||1,OPT.qual?1.6:1);cv.width=Math.round(VW*DPR);cv.height=Math.round(VH*DPR);cv.style.width=VW+'px';cv.style.height=VH+'px';Z=clamp(Z,.45,1.7);if(artOn)drawTitleArt()}
addEventListener('resize',resize);
const drawList=[];
function depthOf(e){if(e.k==='u')return e.x+e.y;if(e.k==='b')return(e.tx+e.ty+e.sz)*TS;if(e.walk)return e.x+e.y;return(e.tx+e.ty+1)*TS}
function render(){
  const ci=camX-camY,cj=(camX+camY)/2,s=DPR*Z,ox=DPR*(VW/2-Z*ci),oy=DPR*(CYc()-Z*cj);
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);
  const cs=[scrToW(0,0),scrToW(VW,0),scrToW(0,VH),scrToW(VW,VH)];
  const x0=Math.min(cs[0].x,cs[1].x,cs[2].x,cs[3].x)-TS*3,x1=Math.max(cs[0].x,cs[1].x,cs[2].x,cs[3].x)+TS*3,y0=Math.min(cs[0].y,cs[1].y,cs[2].y,cs[3].y)-TS*3,y1=Math.max(cs[0].y,cs[1].y,cs[2].y,cs[3].y)+TS*4;
  const inV=(x,y)=>x>x0&&x<x1&&y>y0&&y<y1;
  // ----- chão (transformação em losango)
  ctx.setTransform(s,s*.5,-s,s*.5,ox,oy);ctx.imageSmoothingEnabled=true;
  ctx.drawImage(terrC,0,0,MW*TS,MH*TS);
  // ondas
  const tt=performance.now()/1000;ctx.strokeStyle='rgba(235,245,255,.35)';ctx.lineWidth=1.4;ctx.beginPath();
  for(let ty=Math.max(0,y0/TS|0);ty<Math.min(MH,y1/TS);ty++)for(let tx=Math.max(0,x0/TS|0);tx<Math.min(MW,x1/TS);tx++){const i=idx(tx,ty);if(!G.terr[i]||!G.exp[i])continue;const h=hash2(tx,ty);if(h>.45)continue;const ph=Math.sin(tt*1.3+h*40);if(ph<.2)continue;const px=(tx+h)*TS,py=(ty+hash2(ty,tx))*TS;ctx.moveTo(px-5,py+ph*2);ctx.lineTo(px+5,py+ph*2)}
  ctx.stroke();
  // espuma na beira da água
  ctx.strokeStyle='#f4fbff';ctx.lineWidth=1.6;
  for(const p of SHORE){if(p[0]<x0||p[0]>x1||p[1]<y0||p[1]>y1)continue;if(!G.exp[tileOf(p[0],p[1])])continue;const ph=Math.sin(tt*1.5+p[4]*30),o=ph*2.2;
    ctx.globalAlpha=.22+.2*ph;const tx=-p[3]*12,ty=p[2]*12,cx=p[0]-p[2]*o,cy=p[1]-p[3]*o;ctx.beginPath();ctx.moveTo(cx-tx,cy-ty);ctx.quadraticCurveTo(cx+p[2]*2,cy+p[3]*2,cx+tx,cy+ty);ctx.stroke()}
  ctx.globalAlpha=1;
  // fronteiras: faixa na cor de cada dono, do lado de dentro do território
  for(let o=0;o<NP;o++){const L=domEdges[o];if(!L.length)continue;ctx.beginPath();let n=0;
    for(let k=0;k<L.length;k+=6){const ax=L[k],ay=L[k+1],bx=L[k+2],by=L[k+3],nx=L[k+4],ny=L[k+5],mx=(ax+bx)*TS/2,my=(ay+by)*TS/2;
      if(mx<x0||mx>x1||my<y0||my>y1)continue;if(!G.exp[idx(clamp(Math.floor((ax+bx)/2+nx*.5),0,MW-1),clamp(Math.floor((ay+by)/2+ny*.5),0,MH-1))])continue;
      ctx.moveTo(ax*TS+nx*3,ay*TS+ny*3);ctx.lineTo(bx*TS+nx*3,by*TS+ny*3);n++}
    if(!n)continue;ctx.lineCap='round';ctx.strokeStyle=COL[o].m;ctx.globalAlpha=.24;ctx.lineWidth=12;ctx.stroke();ctx.strokeStyle=o===0?'#4f97ff':COL[o].m;ctx.globalAlpha=1;ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle=COL[o].l;ctx.globalAlpha=.7;ctx.lineWidth=1;ctx.stroke()}
  ctx.globalAlpha=1;ctx.lineCap='butt';
  // coisas no chão
  for(const f of G.fx){if(!inV(f.x,f.y))continue;
    if(f.k==='corpse'&&f.o<NP&&!(SHEET[(f.sk||f.ty)+f.o]||{}).dead){ctx.globalAlpha=Math.max(0,1-f.t/12)*.6;ctx.fillStyle='#3a2a1c';ctx.beginPath();ctx.arc(f.x+3,f.y+2,5,0,7);ctx.fill()}
    if(f.k==='rubble'&&!f.w){ctx.globalAlpha=Math.max(0,1-f.t/25)*.9;for(let i=0;i<f.s*f.s*4;i++){ctx.fillStyle=i%2?'#5a4a3a':'#3a2e22';ctx.fillRect(f.x+((i*37)%(f.s*TS)),f.y+((i*53)%(f.s*TS)),5,4)}}}
  ctx.globalAlpha=1;
  for(const b of G.B){if(b.dead||b.type!=='fazenda')continue;if(b.o!==0&&!G.exp[idx(b.tx,b.ty)])continue;const X=b.tx*TS,Y=b.ty*TS,W=b.sz*TS;if(!inV(X+W/2,Y+W/2))continue;
    ctx.globalAlpha=b.done<1?.55:1;ctx.fillStyle='#7a5530';ctx.fillRect(X+2,Y+2,W-4,W-4);const f=b.done<1?0:clamp(b.food/(FARMFOOD+MODS[b.o].farmFood),0,1);
    for(let i=0;i<7;i++){ctx.fillStyle='#5e3e20';ctx.fillRect(X+4,Y+6+i*13,W-8,3);if(f>0){ctx.fillStyle=f>.5?'#86b63a':'#c8b040';for(let j=0;j<9;j++)ctx.fillRect(X+6+j*10,Y+2+i*13,4,4*Math.max(.35,f))}}
    ctx.fillStyle=COL[b.o].m;ctx.fillRect(X+2,Y+2,5,5);ctx.globalAlpha=1}
  // sombra/seleção de prédios e alicerces
  const selSet=new Set(SEL);
  for(const b of G.B){if(b.dead)continue;const X=b.tx*TS,Y=b.ty*TS,W=b.sz*TS;if(!inV(X,Y))continue;
    if(b.done<1&&b.type!=='fazenda'){ctx.fillStyle='rgba(120,90,50,.5)';ctx.fillRect(X+2,Y+2,W-4,W-4);ctx.strokeStyle='#e8c88a';ctx.setLineDash([5,4]);ctx.lineWidth=1.4;ctx.strokeRect(X+2,Y+2,W-4,W-4);ctx.setLineDash([])}
    if(selSet.has(b.id)){ctx.strokeStyle=b.o===0?'#fff':ally(b.o,0)?'#7dffa0':'#ff6a5a';ctx.lineWidth=2;ctx.strokeRect(X,Y,W,W)}}
  for(const id of SEL){const u=E.get(id);if(!u||u.k!=='u'||u.inT)continue;ctx.strokeStyle=u.o===0?'#fff':u.o===GAIA?'#ffe08a':ally(u.o,0)?'#7dffa0':'#ff6a5a';ctx.lineWidth=1.6;const r=isNav(u)?22:UT[u.type].cls==='elef'?16:10;ctx.beginPath();ctx.arc(u.x,u.y,r,0,7);ctx.stroke()}
  for(const id of SEL){const r=E.get(id);if(!r||r.k!=='r')continue;ctx.strokeStyle='#ffe08a';ctx.lineWidth=1.6;ctx.strokeRect(r.walk?r.x-12:r.tx*TS,r.walk?r.y-12:r.ty*TS,24,24)}
  if(placing)drawPlacingFlat();
  if(UI.mk&&UI.mk.t<.6){const k=UI.mk;ctx.strokeStyle=k.c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(k.x,k.y,14*(1-k.t)+2,0,7);ctx.stroke()}
  drawRonGround();
  // névoa
  if(fogDirty)drawFogTex();ctx.drawImage(fogC,0,0,MW*TS,MH*TS);
  // ----- desenhos em pé (sem inclinação)
  ctx.setTransform(s,0,0,s,ox,oy);
  // corpos caídos (arte do GPT), por baixo de tudo
  for(const f of G.fx){if(f.k!=='corpse'||f.o>=NP)continue;const S=SHEET[(f.sk||f.ty)+f.o];if(!S||!S.dead||!inV(f.x,f.y))continue;if(f.o!==0&&!vis[tileOf(f.x,f.y)])continue;
    const I=f.x-f.y,J=(f.x+f.y)/2;ctx.globalAlpha=clamp(1.4-f.t/9,0,1);ctx.save();ctx.translate(I,J);if(f.fc<0)ctx.scale(-1,1);ctx.drawImage(S.c,8*S.w*SS,0,S.w*SS,S.h*SS,-S.ax,-S.ay,S.w,S.h);ctx.restore()}
  ctx.globalAlpha=1;
  drawList.length=0;
  drawRonUp();
  for(const r of G.R){if(r.dead||(r.sub==='oil'&&G.P[0].age<5))continue;const c=r.walk?r:{x:(r.tx+.5)*TS,y:(r.ty+.5)*TS};if(!inV(c.x,c.y))continue;if(!G.exp[r.walk?tileOf(r.x,r.y):idx(r.tx,r.ty)])continue;r._d=depthOf(r);drawList.push(r)}
  for(const b of G.B){if(b.dead||b.type==='fazenda')continue;const c=ctr(b);if(!inV(c.x,c.y))continue;if(b.o!==0&&!G.exp[idx(b.tx,b.ty)])continue;b._d=depthOf(b);drawList.push(b)}
  for(const u of G.U){if(u.dead||u.inT)continue;if(!inV(u.x,u.y))continue;if(u.o!==0&&!vis[tileOf(u.x,u.y)])continue;u._d=depthOf(u);drawList.push(u)}
  drawList.sort((a,b)=>a._d-b._d);
  for(const e of drawList){
    if(e.k==='r'){const lit=vis[e.walk?tileOf(e.x,e.y):idx(e.tx,e.ty)];
      if(e.walk){const sp=SPR[e.of==='elfs'&&SPR.carcE?'carcE':'carc'];const I=e.x-e.y,J=(e.x+e.y)/2;ctx.drawImage(lit?sp.c:sp.dk,I-sp.ax,J-sp.ay,sp.w,sp.h);continue}
      const I=(e.tx-e.ty)*TS,J=(e.tx+e.ty+1)*TS/2;
      const sp=e.sub==='tree'?SPR['tree'+(e.tv!=null?e.tv:(e.tv=treeVar(e)))]:e.sub==='fish'?SPR['fish'+(e.deep?1:0)]:SPR[e.sub];
      ctx.drawImage(lit?sp.c:sp.dk,I-sp.ax,J+(e.sub==='fish'?-4:5)-sp.ay,sp.w,sp.h)}
    else if(e.k==='b'){const sp=SPR['b'+e.type+e.o],I0=(e.tx-e.ty)*TS,J0=(e.tx+e.ty)*TS/2;const lit=vis[idx(e.tx+(e.sz>>1),e.ty+(e.sz>>1))];const img=lit?sp.c:sp.dk;
      if(e.done<1){if(e.type==='muralha'||!SPR.alic){if(SPR.alic&&e.type!=='muralha'){const a=SPR.alic,k=e.sz*64/a.dw;ctx.drawImage(a.c,I0-a.W*k/2,J0-a.top*k,a.W*k,a.H*k)}
        const cut=sp.H*(1-e.done)*.85+sp.H*.15*(e.done<.05?1:0);const top=Math.max(0,sp.top-8);const cc=Math.max(cut,0);
        if(e.done>0)ctx.drawImage(img,0,cc*SS,img.width,img.height-cc*SS,I0-sp.W/2,J0-sp.top+cc,sp.W,sp.H-cc);
        if(!SPR.alic||e.type==='muralha'){ctx.strokeStyle='#8a6a3a';ctx.lineWidth=1.4;}const h=(BT[e.type].h*e.done)+6;if(!SPR.alic||e.type==='muralha')for(const[a,b]of[[0,0],[e.sz,0],[0,e.sz],[e.sz,e.sz]]){const I=I0+(a-b)*TS,J=J0+(a+b)*TS/2;ctx.beginPath();ctx.moveTo(I,J);ctx.lineTo(I,J-h);ctx.stroke()}}else drawObra(e,sp,img,I0,J0)}
      else ctx.drawImage(img,I0-sp.W/2,J0-sp.top,sp.W,sp.H);
    }
    else drawUnit(e,selSet);
  }
  // tiros
  for(const p of G.pj){const I=p.x-p.y,J=(p.x+p.y)/2;
    if(p.kind==='s'){const f=p.t/p.T,hh=Math.sin(f*Math.PI)*60;ctx.fillStyle='#6a6a6a';ctx.beginPath();ctx.arc(I,J-12-hh,3.5,0,7);ctx.fill()}
    else if(p.kind==='k'){const f=p.t/p.T,hh=Math.sin(f*Math.PI)*7;ctx.save();ctx.translate(I,J-12-hh);ctx.rotate(p.t*24);
      ctx.strokeStyle='#eef2f6';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(5.5,0);ctx.stroke();ctx.strokeStyle='#6a3e1a';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-3.5,0);ctx.stroke();ctx.restore()}
    else if(p.kind==='g'){const dI=(p.tx-p.ty)-(p.sx-p.sy),dJ=((p.tx+p.ty)-(p.sx+p.sy))/2,a=Math.atan2(dJ,dI);ctx.strokeStyle='rgba(255,236,160,.9)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(I,J-12);ctx.lineTo(I-Math.cos(a)*14,J-12-Math.sin(a)*14);ctx.stroke()}
    else{const dI=(p.tx-p.ty)-(p.sx-p.sy),dJ=((p.tx+p.ty)-(p.sx+p.sy))/2,f=p.t/p.T,H=p.kind==='b'?6:16,hh=Math.sin(f*Math.PI)*H;
      // a flecha acompanha a curva: sobe de bico para cima e desce de bico para baixo
      const a=Math.atan2(dJ,dI)-Math.cos(f*Math.PI)*(p.kind==='b'?.15:.45)*Math.sign(dI||1);const L=p.kind==='b'?10:p.kind==='l'?9:8,x0=I,y0=J-12-hh,x1=I-Math.cos(a)*L,y1=y0-Math.sin(a)*L;
      ctx.strokeStyle=p.kind==='l'?'#8a6236':'#d9c9a0';ctx.lineWidth=p.kind==='b'?2:1.2;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
      if(p.kind==='a'){ctx.fillStyle='#4a4a4a';ctx.beginPath();ctx.arc(x0,y0,1.2,0,7);ctx.fill();ctx.strokeStyle='#f4f0e6';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1+Math.cos(a)*2.4,y1+Math.sin(a)*2.4);ctx.stroke()}}}
  for(const f of G.fx){const I=f.x-f.y,J=(f.x+f.y)/2;
    if(f.k==='boom'&&f.t<.6){ctx.fillStyle='rgba(255,200,90,'+(1-f.t/.6)+')';ctx.beginPath();ctx.arc(I,J-4,6+f.t*34,0,7);ctx.fill();ctx.fillStyle='rgba(90,80,70,'+(.6-f.t)+')';ctx.beginPath();ctx.arc(I+6,J-14-f.t*20,8+f.t*20,0,7);ctx.fill()}
    if(f.k==='glow'&&f.t<1.2){ctx.strokeStyle='rgba(255,240,170,'+(1-f.t/1.2)+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(I,J-16,10+f.t*22,0,7);ctx.stroke()}
    if(f.k==='spark'&&f.t<.8){ctx.fillStyle='rgba(180,255,170,'+(1-f.t/.8)+')';ctx.beginPath();ctx.arc(I,J-20-f.t*16,2,0,7);ctx.fill()}
    if(f.k==='splash'&&f.t<1){ctx.strokeStyle='rgba(230,245,255,'+(1-f.t)+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(I,J,10+f.t*26,5+f.t*13,0,0,7);ctx.stroke()}}
  // barras de vida de prédios selecionados e ponto de encontro
  for(const id of SEL){const e=E.get(id);if(!e||e.k!=='b')continue;const sp=SPR['b'+e.type+e.o];if(!sp)continue;const I0=(e.tx-e.ty)*TS,J0=(e.tx+e.ty)*TS/2;const y=J0-sp.top+sp.bt-8,w=e.sz*34;
    ctx.fillStyle='#000';ctx.fillRect(I0-w/2-1,y-1,w+2,6);ctx.fillStyle='#3a0b07';ctx.fillRect(I0-w/2,y,w,4);ctx.fillStyle='#4ad04a';ctx.fillRect(I0-w/2,y,w*e.hp/e.mhp,4)}
  for(const b of G.B){if(b.dead||!b.down)continue;if(b.o!==0&&!G.exp[idx(b.tx,b.ty)])continue;const sp=SPR['b'+b.type+b.o];if(!sp)continue;const I0=(b.tx-b.ty)*TS,J0=(b.tx+b.ty)*TS/2,y=J0-sp.top+sp.bt-20,w=b.sz*34;
    ctx.fillStyle='rgba(0,0,0,.8)';ctx.fillRect(I0-w/2-1,y-1,w+2,7);ctx.fillStyle=b.cp>0?COL[b.cpo].m:'#777';ctx.fillRect(I0-w/2,y,w*clamp((b.cp||0)/CAPT_T,0,1),5);
    ctx.font='bold 13px serif';ctx.textAlign='center';ctx.fillStyle=b.cp>0?COL[b.cpo].l:'#ddd';ctx.fillText('⚑',I0,y-4)}
  if(SEL.length===1){const b=E.get(SEL[0]);if(b&&b.k==='b'&&b.rally&&b.o===0)flagAt(b.rally.x,b.rally.y)}
  drawParts();
  if(placing)drawPlacingSprite();
  // tela
  ctx.setTransform(DPR,0,0,DPR,0,0);
  drawAtmos();
  if(selBox){ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.fillStyle='rgba(255,255,255,.12)';const x=Math.min(selBox.x0,selBox.x1),y=Math.min(selBox.y0,selBox.y1),w=Math.abs(selBox.x1-selBox.x0),h=Math.abs(selBox.y1-selBox.y0);ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h)}
  if(inputMode==='pad'){const c=PAD.cx,y=PAD.cy;const h=hoverEnt;ctx.fillStyle=h?(h.k==='r'||h.o===GAIA?'#ffe08a':h.o===0?'#fff':'#ff6a5a'):'#f2e2b0';ctx.strokeStyle='#2a1808';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(c,y);ctx.lineTo(c+15,y+6);ctx.lineTo(c+7,y+8);ctx.lineTo(c+4,y+16);ctx.closePath();ctx.fill();ctx.stroke()}
}
function drawUnit(u,selSet){
  const T=ST(u),sp=UT[u.type].spr;const I=u.x-u.y,J=(u.x+u.y)/2;
  const bob=isNav(u)?Math.sin(performance.now()/400+u.id)*1.2:u.mv?Math.abs(Math.sin(u.an))*1.6:u.work?Math.abs(Math.sin(u.an))*1:0;
  const img=SPR['u'+(u.type==='guer'&&T.axe?'guerA':u.type)+u.o];
  ctx.save();ctx.translate(I,J-bob);if(u.face<0)ctx.scale(-1,1);ctx.drawImage(img,-sp[2],-sp[3],sp[0],sp[1]);
  if(u.type==='vill'){const sw=u.work?Math.sin(u.an*1.2)*.9:0;ctx.translate(6,-22);ctx.rotate(sw);ctx.strokeStyle='#6a4626';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(7,-9);ctx.stroke();ctx.fillStyle='#c8c8c8';ctx.fillRect(5,-12,5,3)}
  ctx.restore();
  if(u.carry>0&&(u.type==='vill'||u.type==='pesc')){ctx.fillStyle=u.ct==='wood'?'#8a5a2a':u.ct==='food'?'#c8402a':u.ct==='gold'?'#f0c840':'#aaa';ctx.fillRect(I-(u.face>0?11:-6),J-24,5,6)}
  if(u.st==='convert'&&u.cv>0){ctx.strokeStyle='rgba(255,236,150,.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(I,J-sp[3]-6,4+Math.sin(performance.now()/120)*2,0,7);ctx.stroke()}
  if(selSet.has(u.id)||(u.hp<T.hp&&u.o===0)){const f=clamp(u.hp/T.hp,0,1),y=J-sp[3]-6,w=isNav(u)?28:18;ctx.fillStyle='#000';ctx.fillRect(I-w/2-1,y-1,w+2,5);ctx.fillStyle='#3a0b07';ctx.fillRect(I-w/2,y,w,3);ctx.fillStyle=f>.5?'#4ad04a':f>.25?'#e0d040':'#e04040';ctx.fillRect(I-w/2,y,w*f,3)}
  if(u.cargo&&u.cargo.length){ctx.fillStyle='#000a';ctx.fillRect(I-8,J+4,16,9);ctx.fillStyle='#fff';ctx.font='bold 8px serif';ctx.textAlign='center';ctx.fillText(u.cargo.length+'/'+UT[u.type].cap,I,J+11)}
}
function flagAt(x,y){const I=x-y,J=(x+y)/2;ctx.strokeStyle='#3a2a18';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(I,J);ctx.lineTo(I,J-22);ctx.stroke();ctx.fillStyle=COL[0].m;ctx.beginPath();ctx.moveTo(I,J-22);ctx.lineTo(I+13,J-18);ctx.lineTo(I,J-13);ctx.fill()}
function placingTiles(){
  if(!placing)return[];
  if(placing.type==='muralha'){const a=placing.a||[placing.tx,placing.ty],b=placing.b||a;return lineTiles(a,b).map(([x,y])=>({tx:x,ty:y,ok:validSite('muralha',x,y,0,0)}))}
  return[{tx:placing.tx,ty:placing.ty,ok:validSite(placing.type,placing.tx,placing.ty,0,0)}];
}
function drawPlacingFlat(){const T=BT[placing.type],W=T.sz*TS;const tl=placingTiles();const enough=afford(0,{stone:(T.cost.stone||0)*tl.length,wood:T.cost.wood||0,gold:T.cost.gold||0,food:T.cost.food||0});placing.ok=tl.length&&tl.every(t=>t.ok)&&enough;
  for(const t of tl){ctx.fillStyle=t.ok&&enough?'rgba(90,230,90,.35)':'rgba(240,70,60,.4)';ctx.fillRect(t.tx*TS,t.ty*TS,W,W)}}
function drawPlacingSprite(){const T=BT[placing.type];if(T.walk)return;ctx.globalAlpha=.6;for(const t of placingTiles()){const sp=SPR['b'+placing.type+'0'];const I0=(t.tx-t.ty)*TS,J0=(t.tx+t.ty)*TS/2;ctx.drawImage(sp.c,I0-sp.W/2,J0-sp.top,sp.W,sp.H)}ctx.globalAlpha=1}

// ---------- arte da tela de abertura ----------
const art=$('art');let artOn=true;
// pintura de abertura (arte do GPT); se não carregar, usa o desenho feito no código
const TITLEIMG=new Image();TITLEIMG.onload=()=>{if(artOn)drawTitleArt()};TITLEIMG.src='assets/abertura.jpg';
function drawTitleArt(){
  const W=innerWidth,H=innerHeight,d=Math.min(devicePixelRatio||1,1.5);art.width=W*d;art.height=H*d;const g=art.getContext('2d');g.setTransform(d,0,0,d,0,0);
  if(TITLEIMG.complete&&TITLEIMG.naturalWidth){
    const iw=TITLEIMG.naturalWidth-8,ih=TITLEIMG.naturalHeight-8,s=Math.max(W/iw,H/ih),dw=iw*s,dh=ih*s;
    g.imageSmoothingQuality='high';g.drawImage(TITLEIMG,4,4,iw,ih,(W-dw)/2,(H-dh)/2,dw,dh);
    let v=g.createLinearGradient(0,0,W,0);v.addColorStop(0,'rgba(12,7,2,.12)');v.addColorStop(.3,'rgba(12,7,2,.32)');v.addColorStop(.5,'rgba(12,7,2,.5)');v.addColorStop(.7,'rgba(12,7,2,.32)');v.addColorStop(1,'rgba(12,7,2,.12)');g.fillStyle=v;g.fillRect(0,0,W,H);
    v=g.createLinearGradient(0,0,0,H);v.addColorStop(0,'rgba(12,7,2,.35)');v.addColorStop(.3,'rgba(12,7,2,0)');v.addColorStop(.8,'rgba(12,7,2,0)');v.addColorStop(1,'rgba(12,7,2,.55)');g.fillStyle=v;g.fillRect(0,0,W,H);
    return}
  const R=mulberry32(7);
  let gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#1a1440');gr.addColorStop(.38,'#7a3a52');gr.addColorStop(.62,'#e0784a');gr.addColorStop(.74,'#f6c26a');gr.addColorStop(1,'#3a2410');g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<60;i++){g.fillStyle='rgba(255,255,240,'+(R()*.6)+')';g.fillRect(R()*W,R()*H*.3,1.2,1.2)}
  const sx=W*.62,sy=H*.68;gr=g.createRadialGradient(sx,sy,0,sx,sy,H*.5);gr.addColorStop(0,'rgba(255,240,190,.95)');gr.addColorStop(.12,'rgba(255,214,130,.8)');gr.addColorStop(.35,'rgba(255,160,90,.25)');gr.addColorStop(1,'rgba(255,140,80,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.fillStyle='#fff3c8';g.beginPath();g.arc(sx,sy,H*.075,0,7);g.fill();
  const hill=(y,amp,col,seed)=>{const r=mulberry32(seed);g.fillStyle=col;g.beginPath();g.moveTo(0,H);let x=0;g.lineTo(0,y);while(x<W){const nx=x+40+r()*80;g.quadraticCurveTo(x+(nx-x)/2,y-amp*r(),nx,y+(r()-.5)*amp*.4);x=nx}g.lineTo(W,H);g.closePath();g.fill()};
  hill(H*.7,H*.06,'#8a4a3e',3);
  // pirâmides e zigurate ao longe
  g.fillStyle='#6e3a34';const py=(x,b,h)=>{g.beginPath();g.moveTo(x-b,H*.73);g.lineTo(x,H*.73-h);g.lineTo(x+b,H*.73);g.fill()};py(W*.16,H*.17,H*.2);py(W*.28,H*.11,H*.13);
  g.fillStyle='#5e3230';const zx=W*.84;for(let i=0;i<4;i++){const w=H*(.2-i*.042),h=H*.045;g.fillRect(zx-w/2,H*.73-h*(i+1),w,h+1)}
  hill(H*.76,H*.05,'#4a2a26',9);
  // rio com reflexo
  gr=g.createLinearGradient(0,H*.8,0,H);gr.addColorStop(0,'#c86a48');gr.addColorStop(1,'#3a2a3a');g.fillStyle=gr;g.beginPath();g.moveTo(0,H*.84);g.quadraticCurveTo(W*.4,H*.78,W,H*.86);g.lineTo(W,H*.93);g.quadraticCurveTo(W*.5,H*.86,0,H*.95);g.fill();
  g.fillStyle='rgba(255,230,160,.55)';for(let i=0;i<10;i++){const w=30-i*2;g.fillRect(sx-w/2+(R()-.5)*8,H*.83+i*5,w,1.6)}
  // ruína de templo
  g.fillStyle='#2a1612';const tx=W*.5;g.fillRect(tx-H*.16,H*.75,H*.32,H*.02);for(let i=0;i<6;i++){if(i===4)continue;g.fillRect(tx-H*.14+i*H*.056,H*.75-H*.14,H*.022,H*.14)}g.fillRect(tx-H*.15,H*.75-H*.155,H*.2,H*.02);
  // primeiro plano
  hill(H*.9,H*.05,'#1c0f0a',21);
  const palm=(x,y,s)=>{g.strokeStyle='#120a06';g.lineWidth=4*s;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+12*s,y-60*s,x+4*s,y-110*s);g.stroke();const t=[x+4*s,y-110*s];g.lineWidth=3*s;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;g.beginPath();g.moveTo(t[0],t[1]);g.quadraticCurveTo(t[0]+Math.cos(a)*30*s,t[1]-18*s,t[0]+Math.cos(a)*48*s,t[1]+12*s+Math.abs(Math.sin(a))*14*s);g.stroke()}};
  palm(W*.07,H*.97,H/420);palm(W*.13,H,H/520);palm(W*.93,H*.98,H/450);
  g.strokeStyle='#1a0e10';g.lineWidth=1.4;for(let i=0;i<7;i++){const bx=W*.62+i*16+R()*10,by=H*.36+R()*30;g.beginPath();g.moveTo(bx-5,by-2);g.quadraticCurveTo(bx-2,by-5,bx,by);g.quadraticCurveTo(bx+2,by-5,bx+5,by-2);g.stroke()}
  gr=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.6)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,W,H);
}
