
// =========================================================
//   CENÁRIO VIVO: dia e noite, 4 estações, chuva/tempestade/neve,
//   luzes da cidade à noite, pássaros, folhas, pétalas e vaga-lumes.
//   (só visual: não muda regras do jogo)
// =========================================================
const DAY_T=360;                 // um dia inteiro = 6 minutos de jogo
const SEASON_DAYS=2;             // cada estação dura 2 dias (12 min); o ano todo = 48 min
const SEASONS=[
  {n:'Primavera',ic:'🌸',tint:'#a8f080',ta:.13,sat:0,wx:{rain:.4,storm:.1}},
  {n:'Verão',ic:'☀️',tint:'#ffd070',ta:.17,sat:0,wx:{rain:.15,storm:.2}},
  {n:'Outono',ic:'🍂',tint:'#ff8a3a',ta:.26,sat:0,wx:{rain:.45,storm:.1}},
  {n:'Inverno',ic:'❄️',tint:'#dce8ff',ta:.3,sat:.38,wx:{snow:.55}}];
// hora, estação e clima são escolhidos antes da partida e ficam fixos (G.cfg)
const CFG_HORA={aman:.27,dia:.5,tarde:.75,noite:0};
function dayPhase(){if(G&&G.cfg)return CFG_HORA[G.cfg.hora]??.5;return((G.t/DAY_T)+.28)%1}           // 0 = meia-noite, .25 = 6h, .5 = meio-dia
function seasonIdx(){if(G&&G.cfg)return G.cfg.est|0;return Math.floor(G.t/(DAY_T*SEASON_DAYS))%4}
function hourTxt(){const h=dayPhase()*24;return(h|0)+'h'}
// claridade do dia: 1 de dia, ~0 de noite, com amanhecer e entardecer suaves
function daylight(){const p=dayPhase();const s=Math.sin((p-.25)*Math.PI*2);return clamp(s*1.8+.35,0,1)}
function duskAmt(){const p=dayPhase();const a=Math.max(0,1-Math.abs(p-.27)/.06),b=Math.max(0,1-Math.abs(p-.75)/.06);return Math.max(a,b)}
function dayIcon(){const d=daylight(),k=duskAmt();return k>.35?(dayPhase()<.5?'🌅':'🌇'):d>.5?'☀️':'🌙'}

// ---------- tempo (clima) ----------
function wxTick(dt){
  if(G.cfg){const k=G.cfg.clima;if(!G.wx||G.wx.k!==k)G.wx={k,t:0,dur:1e12,i:k==='clear'?0:1,next:1e12,lt:G.t+6};else G.wx.i=k==='clear'?0:1;return}
  if(!G.wx)G.wx={k:'clear',t:0,dur:60,i:0,next:G.t+40};
  const W=G.wx,S=SEASONS[seasonIdx()];
  if(W.k==='clear'){W.i=Math.max(0,W.i-dt/8);
    if(G.t>=W.next){const r=Math.random(),pr=S.wx;let k=null;
      if(pr.snow&&r<pr.snow)k='snow';else if(pr.storm&&r<pr.storm)k='storm';else if(pr.rain&&r<(pr.rain+(pr.storm||0)))k='rain';
      if(k){W.k=k;W.t=G.t;W.dur=45+Math.random()*75;W.lt=G.t+4}W.next=G.t+50+Math.random()*70}}
  else{const age=G.t-W.t;W.i=clamp(Math.min(age/8,(W.dur-age)/8),0,1);
    if(seasonIdx()===3&&W.k!=='snow')W.k='snow';if(seasonIdx()!==3&&W.k==='snow')W.k='rain';
    if(age>=W.dur){W.k='clear';W.i=0;W.next=G.t+50+Math.random()*80}}
}
// som da chuva: chiado contínuo que acompanha a força da chuva
let RAIN_SRC=null,RAIN_G=null,THUNDER=0;
function rainSound(i){
  if(!OPT.snd||!running||paused||i<.05){if(RAIN_G&&AC)RAIN_G.gain.setTargetAtTime(0,AC.currentTime,.4);return}
  if(!audio())return;
  if(!RAIN_SRC){try{RAIN_SRC=AC.createBufferSource();RAIN_SRC.buffer=NB;RAIN_SRC.loop=true;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=2600;f.Q.value=.5;const f2=AC.createBiquadFilter();f2.type='lowpass';f2.frequency.value=6000;
    RAIN_G=AC.createGain();RAIN_G.gain.value=0;RAIN_SRC.connect(f);f.connect(f2);f2.connect(RAIN_G);RAIN_G.connect(SG);RAIN_SRC.start()}catch(e){RAIN_SRC=null;return}}
  RAIN_G.gain.setTargetAtTime(.045*i,AC.currentTime,.5)}
function thunder(){if(!OPT.snd||!audio())return;const o=voice((Math.random()-.5)*.8,1,.6);const d=.4+Math.random()*1.2;
  noise(1.8,.9,140,.5,d,o,'lowpass',60);noise(.5,.5,500,.6,d,o,'lowpass',150);tone(48,1.6,'sine',.3,30,d,o)}

// ---------- efeitos das estações, do tempo e da noite no jogo (valem para os dois lados) ----------
const SEFX=['frutas, caça e fazendas +10%','madeira +10%','colheita! fazendas +20%','fazendas −40%, frutas −30%, tropas 12% mais lentas'];
const WXFX={rain:'🌧 Chuva: tropas 8% mais lentas',storm:'⛈ Tempestade: tropas 15% e barcos 20% mais lentos',snow:'❄️ Nevasca: tropas mais 10% lentas'};
function nightAmt(){return G?1-daylight():0}
function losMul(){return 1-.3*nightAmt()}                 // à noite as tropas enxergam até 30% menos
function seasonGath(cat){const s=seasonIdx();let m=1;
  if(s===0&&(cat==='food'||cat==='hunt'||cat==='farm'))m=1.1;
  else if(s===1&&cat==='wood')m=1.1;
  else if(s===2&&cat==='farm')m=1.2;
  else if(s===3){if(cat==='farm')m=.6;else if(cat==='food')m=.7}
  return m}
function seasonSpd(u){const W=G.wx;const nav=!!UT[u.type].naval;let m=1;
  if(!nav&&seasonIdx()===3)m*=.88;
  if(W&&W.i>.3){if(W.k==='snow'){if(!nav)m*=.9}else if(W.k==='storm')m*=nav?.8:.85;else if(W.k==='rain'&&!nav)m*=.92}
  return m}
// avisos quando muda a estação, começa o mau tempo ou cai a noite
function seasonCheck(){const si=seasonIdx(),S=SEASONS[si],W=G.wx||{k:'clear'},nt=nightAmt()>.6;
  if(G.sShow!==si){if(G.sShow!=null&&running)toast(S.ic+' Chegou '+(si?'o ':'a ')+S.n+': '+SEFX[si]);G.sShow=si}
  const wk=W.k!=='clear'&&W.i>.3?W.k:'clear';if(G.wShow!==wk){if(wk!=='clear'&&running)toast(WXFX[wk]);G.wShow=wk}
  if(G.nShow!==nt){if(nt&&running)toast('🌙 Anoiteceu: as tropas enxergam menos até o dia raiar');G.nShow=nt}}
function seasonInfo(){const si=seasonIdx(),S=SEASONS[si],W=G.wx||{k:'clear',i:0};
  return S.ic+' <b>'+S.n+'</b>: '+SEFX[si]+(W.k!=='clear'&&W.i>.3?'<br>'+WXFX[W.k]:'')+'<br>'+dayIcon()+' '+hourTxt()+(nightAmt()>.3?' · 🌙 visão das tropas −'+Math.round(30*nightAmt())+'%':' · dia claro')}

// ---------- partículas e luzes (tudo em coordenadas da tela) ----------
const LIGHTB={tc:90,torre:46,templo:70,maravilha:120,doca:50,mercado:44,quartel:40,academia:44};
let atmLast=0,FLASH=0,BIRDS=null;
function hsh(i){const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function drawAtmos(){
  if(!G)return;const now=performance.now()/1000,rdt=Math.min(.1,now-(atmLast||now));atmLast=now;
  const W=G.wx||{k:'clear',i:0},si=seasonIdx(),S=SEASONS[si],dl=daylight(),dk=duskAmt(),night=1-dl,hi=OPT.qual;
  const g=ctx;g.save();
  // estação: cor do ar (no gráfico Leve vira um véu simples)
  if(hi){g.globalCompositeOperation='soft-light';g.globalAlpha=S.ta;g.fillStyle=S.tint;g.fillRect(0,0,VW,VH);
    if(S.sat){g.globalCompositeOperation='saturation';g.globalAlpha=S.sat;g.fillStyle='#808080';g.fillRect(0,0,VW,VH);
      // geada: o chão fica esbranquiçado no inverno
      g.globalCompositeOperation='screen';g.globalAlpha=.16;g.fillStyle='#c8d8f0';g.fillRect(0,0,VW,VH)}}
  else{g.globalAlpha=S.ta*.35;g.fillStyle=S.tint;g.fillRect(0,0,VW,VH)}
  // céu fechado escurece
  if(W.i>0){g.globalCompositeOperation='multiply';g.globalAlpha=(W.k==='storm'?.42:.28)*W.i;g.fillStyle='#7a8496';g.fillRect(0,0,VW,VH)}
  // amanhecer/entardecer alaranjado
  if(dk>0){g.globalCompositeOperation=hi?'soft-light':'source-over';g.globalAlpha=(hi?.42:.12)*dk;g.fillStyle='#ff8a40';g.fillRect(0,0,VW,VH)}
  // noite azulada
  if(night>.01){g.globalCompositeOperation='multiply';g.globalAlpha=.62*night;g.fillStyle='#24356e';g.fillRect(0,0,VW,VH)}
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  // luzes da cidade à noite (fogueiras e janelas)
  if(night>.2&&running!==null){g.globalCompositeOperation='lighter';const fl=.85+.15*Math.sin(now*7)*Math.sin(now*3.1);
    for(const b of G.B){const R0=LIGHTB[b.type];if(!R0||b.dead||b.done<1)continue;if(b.o!==0&&!G.exp[idx(b.tx,b.ty)])continue;
      const c=ctr(b),p=w2s(c.x,c.y);const R=R0*Z;if(p.x<-R||p.x>VW+R||p.y<-R||p.y>VH+R)continue;
      const gr=g.createRadialGradient(p.x,p.y-R*.35,2,p.x,p.y-R*.35,R);gr.addColorStop(0,'rgba(255,190,90,'+(.42*night*fl)+')');gr.addColorStop(1,'rgba(255,140,40,0)');
      g.fillStyle=gr;g.fillRect(p.x-R,p.y-R*1.35,R*2,R*2)}
    // vaga-lumes nas noites de verão e primavera
    if(si<2&&W.i<.3){g.fillStyle='rgba(220,255,120,.9)';for(let i=0;i<26;i++){const x=(hsh(i)*VW+Math.sin(now*.6+i)*30)%VW,y=TOPH+hsh(i+50)*(VH-TOPH-PANH)+Math.cos(now*.8+i*2)*14,a=.5+.5*Math.sin(now*3+i*1.7);
      if(a<.15)continue;g.globalAlpha=a*night;g.beginPath();g.arc(x,y,1.6,0,7);g.fill()}g.globalAlpha=1}
    g.globalCompositeOperation='source-over'}
  // chuva / neve
  if(W.i>0){const n=Math.round((W.k==='snow'?240:W.k==='storm'?230:160)*W.i*(hi?1:.6));
    if(W.k==='snow'){g.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<n;i++){const sp=22+hsh(i)*26,y=((now*sp+hsh(i+7)*VH*1.2)%(VH*1.2))-VH*.1,x=((hsh(i+3)*VW*1.2+Math.sin(now*.9+i)*18+now*8)%(VW*1.1))-VW*.05,r=1.3+hsh(i+11)*2.2;g.globalAlpha=.6+hsh(i+5)*.4;g.beginPath();g.arc(x,y,r,0,7);g.fill()}g.globalAlpha=1}
    else{g.strokeStyle='rgba(205,220,255,'+(.38+.15*W.i)+')';g.lineWidth=1;g.beginPath();const sl=W.k==='storm'?.35:.18;
      for(let i=0;i<n;i++){const sp=520+hsh(i)*260,L=11+hsh(i+2)*9,y=((now*sp+hsh(i+7)*VH*1.3)%(VH*1.3))-VH*.15,x=((hsh(i+3)*VW*1.3-y*sl)%(VW*1.15)+VW*1.15)%(VW*1.15)-VW*.05;g.moveTo(x,y);g.lineTo(x+L*sl,y+L)}
      g.stroke();
      // respingos no chão
      g.strokeStyle='rgba(225,235,255,.45)';g.beginPath();for(let i=0;i<Math.round(n/5);i++){const x=Math.random()*VW,y=TOPH+Math.random()*(VH-TOPH);g.moveTo(x-2.5,y);g.quadraticCurveTo(x,y-2.5,x+2.5,y)}g.stroke();
      if(W.k==='storm'&&running&&!paused){if(G.t>=(W.lt||0)){W.lt=G.t+6+Math.random()*12;FLASH=1;thunder()}}}}
  if(FLASH>0){g.fillStyle='rgba(235,240,255,'+(FLASH*.55)+')';g.fillRect(0,0,VW,VH);FLASH=Math.max(0,FLASH-rdt*2.6)}
  // folhas caindo no outono, pétalas na primavera
  if((si===2||si===0)&&W.k!=='snow'&&dl>.2){const n=si===2?26:16;for(let i=0;i<n;i++){const sp=26+hsh(i)*22,y=((now*sp+hsh(i+9)*VH*1.2)%(VH*1.2))-VH*.1,x=((hsh(i+4)*VW*1.2+Math.sin(now*1.3+i)*26+now*14)%(VW*1.1))-VW*.05;
    g.save();g.translate(x,y);g.rotate(now*2+i);g.globalAlpha=.85*dl;g.fillStyle=si===2?['#d8642a','#c8402a','#e8a030','#a8501e'][i%4]:['#ffd0e0','#ffb8d0','#fff0f6'][i%3];g.beginPath();g.ellipse(0,0,si===2?3.4:2.4,si===2?1.8:1.5,0,0,7);g.fill();g.restore()}}
  // pássaros cruzando o céu de dia
  if(dl>.6&&W.i<.4&&running){if(!BIRDS||BIRDS.t>BIRDS.T){BIRDS=Math.random()<.5?{t:0,T:14,y:TOPH+30+Math.random()*(VH*.4),d:Math.random()<.5?1:-1,n:3+(Math.random()*5|0)}:{t:-8-Math.random()*16,T:0}}
    BIRDS.t+=rdt;if(BIRDS.T&&BIRDS.t>0){const f=BIRDS.t/BIRDS.T;g.strokeStyle='rgba(30,26,22,.75)';g.lineWidth=1.3;g.beginPath();
      for(let i=0;i<BIRDS.n;i++){const x=(BIRDS.d>0?-40+f*(VW+80):VW+40-f*(VW+80))-BIRDS.d*(i%2?1:-1)*0-BIRDS.d*i*12,y=BIRDS.y+Math.abs(i-BIRDS.n/2)*7+Math.sin(now*3+i)*3,w=Math.sin(now*11+i*2)*3;
        g.moveTo(x-5,y-w);g.quadraticCurveTo(x-2,y-2,x,y);g.quadraticCurveTo(x+2,y-2,x+5,y-w)}g.stroke()}}
  g.restore();
  rainSound(W.k!=='snow'?W.i:0);
}
