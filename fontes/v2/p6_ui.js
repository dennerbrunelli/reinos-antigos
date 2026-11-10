
// =========================================================
//   SONS E MÚSICA (gerados na hora, sem arquivos)
// =========================================================
let AC=null,MG=null,SG=null,NB=null,WF=null;
// cadeia de áudio: efeitos → compressor → alto-falante, com um pouco de eco (sala) e posição esquerda/direita
let CMP=null,RV=null;
function audio(){
  if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();
    CMP=AC.createDynamicsCompressor();CMP.threshold.value=-18;CMP.knee.value=12;CMP.ratio.value=4;CMP.attack.value=.004;CMP.release.value=.2;CMP.connect(AC.destination);
    MG=AC.createGain();MG.gain.value=.2;MG.connect(CMP);SG=AC.createGain();SG.gain.value=.7;
    // filtro de "calor": tira o agudo mais fino dos efeitos, pra não ficar estridente (pedido do Denner)
    WF=AC.createBiquadFilter();WF.type='lowpass';WF.frequency.value=6800;WF.Q.value=.5;SG.connect(WF);WF.connect(CMP);
    NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    // eco curto gerado na hora (sem arquivo)
    try{const L=AC.sampleRate*1.3|0,ir=AC.createBuffer(2,L,AC.sampleRate);for(let c=0;c<2;c++){const x=ir.getChannelData(c);for(let i=0;i<L;i++)x[i]=(Math.random()*2-1)*Math.pow(1-i/L,3.2)}
      const cv=AC.createConvolver();cv.buffer=ir;RV=AC.createGain();RV.gain.value=.35;RV.connect(cv);cv.connect(CMP)}catch(e){RV=null}
  }catch(e){return null}}
  if(AC.state==='suspended')AC.resume();return AC;
}
function tone(f,d,type,v,f2,delay,out,att){const t=AC.currentTime+(delay||0);const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(att||.012));g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(out||SG);o.start(t);o.stop(t+d+.05)}
function noise(d,v,fc,q,delay,out,ft,fc2){const t=AC.currentTime+(delay||0);const s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type=ft||'bandpass';f.frequency.setValueAtTime(fc,t);if(fc2)f.frequency.exponentialRampToValueAtTime(fc2,t+d);f.Q.value=q||1;const g=AC.createGain();
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(out||SG);s.start(t,Math.random()*.5,d+.05)}
// metal: várias parciais que não combinam (soa como lâmina ou picareta)
function metal(fs,d,v,delay,out){fs.forEach((f,i)=>tone(f,d*(1-i*.18),'sine',v/(1+i*.6),f*.995,delay,out,.006))}
// metais (trompa): serra filtrada que abre no ataque
function brass(f,d,v,delay,out){const t=AC.currentTime+(delay||0);const o=AC.createOscillator(),o2=AC.createOscillator(),lp=AC.createBiquadFilter(),g=AC.createGain();o.type='sawtooth';o2.type='sawtooth';o.frequency.value=f;o2.frequency.value=f*1.004;
  lp.type='lowpass';lp.frequency.setValueAtTime(f*1.2,t);lp.frequency.linearRampToValueAtTime(f*5,t+.07);lp.frequency.exponentialRampToValueAtTime(f*2.2,t+d);lp.Q.value=1.5;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.05);g.gain.setValueAtTime(v,t+d*.7);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(out||SG);o.start(t);o2.start(t);o.stop(t+d+.05);o2.stop(t+d+.05)}
// cada som nasce num ponto: mais à esquerda/direita conforme a tela, mais baixo se estiver longe do centro
function voice(pan,vol,wet){const g=AC.createGain();g.gain.value=vol;let n=g;if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=pan;g.connect(p);n=p}n.connect(SG);if(RV&&wet){const s=AC.createGain();s.gain.value=wet;n.connect(s);s.connect(RV)}return g}
const lastSnd={};
const SGAP={leaves:170,hoe:230,flesh:200,splash:300,chop:220,mine:220,hammer:260,clash:110,thud:120,stomp:220,hitb:160,arrow:90,bow:90,knife:110,hit:80,throw:150,catapult:280,boom:200,shot:200,chant:600,die:140,bleat:300,roar:900,trumpet:900,sink:400,collapse:350,place:150};
// "calor" de combate: sobe quando há briga perto do jogador, esfria sozinho — usado pra deixar
// a música mais tensa na guerra e mais calma na paz (a mesma psicologia de música ambiente de
// loja/elevador: andamento e volume puxam o clima de quem está jogando, pedido pelo Denner)
const COMBAT_SND={clash:1,hitb:.8,hit:.5,thud:.6,stomp:.7,arrow:.4,bow:.4,knife:.5,shot:1,catapult:.8,boom:1,die:.3};
function snd(k,e){
  if(k&&COMBAT_SND[k]&&(!e||e.o!==GAIA))MUSH=Math.min(1,MUSH+COMBAT_SND[k]*.1);
  if(!OPT.snd||!k)return;
  let pan=0,vol=1;
  if(e&&running){const p=w2s(e.x,e.y);if(p.x<-60||p.x>VW+60||p.y<TOPH-30||p.y>VH+30)return;
    pan=clamp((p.x-VW/2)/(VW*.6),-1,1)*.75;const dc=hyp(p.x-VW/2,p.y-VH/2)/Math.max(VW,VH);vol=clamp(1.05-dc*.9,.45,1)*clamp(.55+Z*.45,.6,1.15)}
  const now=performance.now(),gap=SGAP[k]||60;
  if(lastSnd[k]&&now-lastSnd[k]<gap)return;lastSnd[k]=now;
  if(!audio())return;
  const r=1+(Math.random()-.5)*.14,o=voice(pan,vol,{boom:.5,collapse:.5,age:.4,alert:.3,win:.4,lose:.4,shot:.6,roar:.3,trumpet:.3,convert:.5,chant:.5,done:.3}[k]||.12);
  switch(k){
  case'click':tone(1500*r,.03,'triangle',.03,900,0,o);noise(.02,.06,3500,2,0,o);break;
  case'sel':tone(620*r,.07,'triangle',.05,700,0,o);tone(930*r,.09,'sine',.03,0,.045,o);break;
  // machado na madeira: estalo seco + "toc" oco do tronco + lascas
  case'chop':noise(.018,.35,3600*r,1,0,o,'highpass');tone(210*r,.12,'triangle',.16,105,0,o,.004);tone(118*r,.16,'sine',.2,70,.006,o,.004);noise(.09,.45,1150*r,2.2,.006,o,'bandpass',520);for(let i=0;i<3;i++)noise(.025,.08,2400+Math.random()*1600,1.5,.05+i*.035+Math.random()*.02,o);break;
  // picareta na pedra: "tim" metálico + cascalho caindo
  case'mine':metal([1850*r,2820*r,3900*r],.17,.04,0,o);noise(.025,.22,4200,1.4,0,o,'highpass');for(let i=0;i<4;i++)noise(.04,.16,900+Math.random()*1400,1,.06+i*.045+Math.random()*.03,o,'lowpass');break;
  // enxada na terra: batida abafada no chão + atrito arrastando a terra
  case'hoe':tone(96*r,.13,'sine',.2,52,0,o,.002);noise(.12,.5,620*r,.7,0,o,'lowpass',220);noise(.26,.2,2100*r,1.3,.07,o,'bandpass',700);noise(.18,.1,4200,1,.1,o,'highpass');break;
  // colher frutos: folhas mexendo + galhinho + a fruta soltando
  case'leaves':for(let i=0;i<5;i++)noise(.05+Math.random()*.05,.13,2600+Math.random()*3200,.7,i*.04+Math.random()*.02,o,'bandpass');noise(.012,.12,6200,2,.12,o);tone(520*r,.05,'sine',.03,340,.16,o,.003);break;
  // carne: perfura (molhado, grave) e rasga (estalos curtos)
  case'flesh':noise(.1,.4,700*r,3,0,o,'bandpass',260);tone(170*r,.09,'triangle',.06,80,0,o,.003);for(let i=0;i<5;i++)noise(.018,.2,1800+Math.random()*2400,2.5,.06+i*.028+Math.random()*.012,o,'bandpass');noise(.16,.18,420,1.5,.08,o,'lowpass',160);break;
  case'splash':noise(.32,.3,1400*r,.6,0,o,'bandpass',500);for(let i=0;i<3;i++)tone(500+Math.random()*500,.06,'sine',.025,260,.08+i*.07,o);break;
  case'hammer':tone(115*r,.09,'sine',.22,58,0,o);noise(.05,.35,1300,1.2,0,o);metal([2200*r,3100*r],.08,.02,.005,o);break;
  case'clash':metal([2100*r,3000*r,4100*r],.3,.045,0,o);noise(.07,.22,3600,1,0,o,'highpass');break;
  case'thud':noise(.07,.45,420*r,1,0,o);tone(125*r,.08,'sine',.16,68,0,o);break;
  case'stomp':tone(72*r,.3,'sine',.35,38,0,o);noise(.22,.55,260,.7,0,o,'lowpass');break;
  case'hitb':noise(.09,.35,820*r,1,0,o);tone(185*r,.09,'triangle',.08,120,0,o,.004);break;
  case'arrow':case'bow':tone(250*r,.14,'triangle',.06,170,0,o,.003);noise(.22,.16,2800*r,.9,.02,o,'bandpass',900);break;
  case'knife':noise(.11,.13,3800*r,1.2,0,o,'bandpass',2100);metal([2800*r,3800*r],.09,.016,.03,o);break;
  case'hit':noise(.045,.4,1500*r,1.2,0,o);tone(270*r,.05,'triangle',.06,170,0,o);break;
  case'throw':noise(.17,.16,1900*r,.9,0,o,'bandpass',700);break;
  case'catapult':tone(95*r,.32,'sawtooth',.03,62,0,o);noise(.17,.35,320,.8,.04,o);tone(60,.2,'sine',.15,40,.04,o);break;
  case'boom':noise(.75,.85,190,.6,0,o,'lowpass',80);tone(72,.65,'sine',.38,32,0,o);noise(.28,.45,950,.8,0,o);break;
  case'shot':noise(.26,.95,1300,.5,0,o,'bandpass',500);tone(92,.32,'sine',.32,40,0,o);noise(.7,.22,420,.5,.05,o,'lowpass');break;
  case'die':tone(200*r,.38,'sawtooth',.025,105,0,o,.02);tone(200*r*1.5,.3,'triangle',.02,150,0,o,.02);noise(.12,.15,600,1,0,o);break;
  case'bleat':tone(560*r,.14,'square',.018,480,0,o);tone(540*r,.18,'square',.016,430,.13,o);break;
  case'roar':tone(150*r,.75,'sawtooth',.06,68,0,o,.08);tone(152*r,.75,'sawtooth',.05,70,0,o,.08);noise(.65,.32,520,.6,0,o,'lowpass',220);break;
  case'trumpet':tone(420*r,.26,'sawtooth',.04,690,0,o,.03);tone(690*r,.45,'sawtooth',.045,380,.22,o);break;
  case'sink':noise(.6,.35,500,.8,0,o,'lowpass',150);for(let i=0;i<4;i++)tone(300+Math.random()*300,.08,'sine',.04,120,.1+i*.11,o);break;
  case'collapse':noise(1.1,.75,320,.5,0,o,'lowpass',90);for(let i=0;i<5;i++)noise(.06,.4,900+Math.random()*900,1.2,.05+i*.13+Math.random()*.05,o);tone(55,.8,'sine',.3,30,0,o);break;
  case'coin':metal([2650*r,3980*r,5300*r],.22,.035,0,o);metal([3150*r,4700*r],.18,.03,.07,o);break;
  case'place':tone(110*r,.12,'sine',.22,60,0,o);noise(.08,.35,700,1,0,o);break;
  case'convert':[440,554,659,880].forEach((f,i)=>tone(f,.6,'sine',.05,0,i*.09,o,.08));metal([1760,2640],.8,.015,.3,o);break;
  case'chant':for(const[f,dl]of[[294,0],[370,.05],[440,.1]])tone(f,.8,'sine',.024,f*1.01,dl,o,.15);break;
  case'done':metal([880,1320,1980],1.1,.06,0,o);noise(.05,.3,1600,1.5,0,o);break;
  case'unit':brass(330,.22,.05,0,o);brass(495,.32,.05,.16,o);break;
  case'age':[[392,0],[523,.18],[659,.36]].forEach(([f,d])=>brass(f,.3,.05,d,o));[523,659,784].forEach(f=>brass(f,1.2,.04,.6,o));tone(65,1.2,'sine',.2,60,.6,o);break;
  case'alert':brass(196,.42,.07,0,o);brass(233,.5,.07,.46,o);break;
  case'win':[523,659,784,1046,784,1046].forEach((f,i)=>brass(f,.34,.05,i*.18,o));break;
  case'lose':[392,349,311,262].forEach((f,i)=>brass(f,.55,.05,i*.32,o));break;
  }
}
// som de quem morre: gente geme, bicho faz o seu barulho, barco afunda, prédio desaba
function killSnd(e){if(!running||!G)return;const ui=e.k==='u';if(!ui&&e.k!=='b')return;
  if(e.o!==0&&!(vis&&vis[ui?tileOf(e.x,e.y):idx(e.tx,e.ty)]))return;
  if(e.k==='b'){if(e.type==='fazenda'||e.type==='muralha')return;snd('collapse',ctr(e));return}
  snd(e.o===GAIA?({gaz:'bleat',leao:'roar',elfs:'trumpet'}[e.type]):isNav(e)?'sink':'die',e)}
// música ambiente: escala antiga (frígia dominante), lira dedilhada, bordão e tambor
const MUS={on:false,t:0,beat:0,timer:0,motif:[],scale:[0,1,4,5,7,8,10],root:146.83,bar:0,mood:'paz'};
let MUSH=0;
// clima geral do jogo (além do calor momentâneo do combate): muda a escala/tom da música,
// só na virada de frase (a cada 4 compassos), pra não trocar de tom no meio de uma nota.
// Paz = relaxada; Corrida por era = mais brilhante/ambiciosa; Crise = grave e pesada;
// Vitória à vista = maior e triunfante. Pedido do Denner: a música deve contar o que o
// jogador está vivendo, não só a guerra.
const MOODS={
  paz:{scale:[0,1,4,5,7,8,10],root:146.83,energy:0},
  corrida:{scale:[0,2,4,7,9,11],root:174.61,energy:.28},
  crise:{scale:[0,1,3,5,7,8,10],root:116.54,energy:.3},
  vitoria:{scale:[0,2,4,7,9,11],root:195.998,energy:.4},
};
function moodNow(){
  if(!G||!G.P||!G.B||!running)return'paz';
  const tc0=G.B.find(b=>!b.dead&&b.o===0&&b.type==='tc');
  if((tc0&&tc0.down)||G.P[0].grace||(G.tw&&G.tw[1]>=1))return'crise';
  if((G.won&&G.won[0]>=1)||(G.tw&&G.tw[0]>=1))return'vitoria';
  if(G.B.some(b=>!b.dead&&b.o===0&&(b.type==='tc'||b.type==='biblioteca')&&b.q&&b.q.includes('age')))return'corrida';
  return'paz'}
function newMotif(){MUS.motif=[];for(let i=0;i<8;i++)MUS.motif.push(Math.random()<.25?null:((Math.random()*9)|0))}
function musicStart(){if(!OPT.mus||MUS.on||!audio())return;MUS.on=true;MUS.t=AC.currentTime+.2;MUS.beat=0;newMotif();
  MUS.dr=[];for(const f of[73.42,110]){const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.0001;g.gain.linearRampToValueAtTime(.05,AC.currentTime+3);o.connect(g);g.connect(MG);o.start();MUS.dr.push([o,g])}
  MUS.timer=setInterval(musicTick,120)}
function musicStop(){if(!MUS.on)return;MUS.on=false;clearInterval(MUS.timer);for(const[o,g]of MUS.dr||[]){try{g.gain.linearRampToValueAtTime(.0001,AC.currentTime+.8);o.stop(AC.currentTime+1)}catch(e){}}MUS.dr=[]}
function pluck(f,t,v){const o=AC.createOscillator(),o2=AC.createOscillator(),g=AC.createGain();o.type='triangle';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2.003;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+1.6);o.connect(g);o2.connect(g);g.connect(MG);o.start(t);o2.start(t);o.stop(t+1.7);o2.stop(t+1.7)}
function musicTick(){
  if(!AC||!MUS.on)return;
  MUSH=Math.max(0,MUSH-.006); // esfria sozinho quando a briga passa
  const moodKey=moodNow(),mood=MOODS[moodKey]||MOODS.paz;
  const h=Math.min(1,MUSH+mood.energy),bt=.46-.15*h; // na paz, andamento mais lento (relaxa e prende o jogador); na guerra/crise/corrida, acelera (tensão)
  if(MG)MG.gain.setTargetAtTime(.2*(1+.35*h),AC.currentTime,.6); // um pouco mais alto quando está quente
  while(MUS.t<AC.currentTime+.4){
    const t=MUS.t,b=MUS.beat%16,dt=t-AC.currentTime;
    if(b%8===0)tone(92,.28,'sine',.16+.08*h,48,dt,MG);
    if(b%8===4)tone(92,.22,'sine',.09+.05*h,52,dt,MG);
    if(b%4===2&&Math.random()<.7+.25*h)noise(.05,.08+.05*h,1300,1.5,dt,MG);
    if(h>.4&&b%4===0)noise(.04,.06*h,2600,1.2,dt,MG,'highpass'); // percussão extra de guerra
    if(b%2===0){const n=MUS.motif[(b/2+(MUS.bar%2?3:0))%8];if(n!=null){const sc=MUS.scale,deg=sc[n%7],oct=n>=7?2:1;const f=MUS.root*Math.pow(2,deg/12)*oct;pluck(f,t,.07+Math.random()*.03+h*.03);if(Math.random()<.25+.2*h)pluck(f*1.5,t+bt,.04)}}
    MUS.t+=bt;MUS.beat++;
    if(MUS.beat%16===0){MUS.bar++;if(MUS.bar%4===0){newMotif();
      if(MUS.mood!==moodKey){MUS.mood=moodKey;MUS.scale=mood.scale.slice();MUS.root=mood.root}
      else if(moodKey==='paz'&&Math.random()<.4)MUS.scale=MUS.scale[2]===4?[0,2,3,5,7,8,10]:[0,1,4,5,7,8,10]}}
  }
}

// =========================================================
//   INTERFACE
// =========================================================
let toastT=0;
function toast(m){const t=$('toast');t.innerHTML=m;t.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>t.style.display='none',2800)}
function hasReq(p,t){return G.B.some(b=>!b.dead&&b.o===p&&b.type===t&&b.done>=1)}
function canBuildType(p,t){const T=BT[t],P=G.P[p];if(P.age<T.age)return'Requer '+AGES[T.age];if(T.req&&!hasReq(p,T.req))return'Requer '+BT[T.req].n;
  if(t==='maravilha'&&G.B.some(b=>!b.dead&&b.o===p&&b.type==='maravilha'))return'Só pode haver uma Maravilha';if(!afford(p,T.cost))return'Faltam recursos: '+costTxt(T.cost);return null}
function canTrain(b,t){const P=G.P[b.o];if(P.age<UT[t].age)return'Requer '+AGES[UT[t].age];if(b.q.length>=6)return'Fila cheia';const c=costOf(b.o,t);if(!afford(b.o,c))return'Faltam recursos: '+costTxt(c);return null}
function canResearch(b,id){const T=TECH[id],P=G.P[b.o];if(P.techs.includes(id))return'Já pesquisado';if(G.B.some(x=>!x.dead&&x.o===b.o&&x.q.includes('t:'+id)))return'Já está pesquisando';
  if(P.age<T.age)return'Requer '+AGES[T.age];if(T.req&&!P.techs.includes(T.req))return'Requer '+TECH[T.req].n;if(!afford(b.o,T.cost))return'Faltam recursos: '+costTxt(T.cost);return null}
function ageReqMsg(p){const P=G.P[p];if(P.age>=MAXAGE)return null;const need=AGEREQ[P.age+1];const got=need.filter(t=>hasReq(p,t));if(got.length>=2)return null;
  return'Construa 2 destes: '+need.map(t=>BT[t].n).join(', ')}
function selEnts(){return SEL.map(getE).filter(e=>e&&!e.dead&&!e.inT)}
function getCmds(){
  const s=selEnts();const out=[];if(!s.length)return out;
  const own=s.filter(e=>e.o===0);if(!own.length)return out;
  if(own[0].k==='u'){
    const us=own.filter(e=>e.k==='u');
    if(us.some(u=>u.type==='vill')){const PG=[ECO,typeof CIV!=='undefined'?CIV:[],MIL],pn=(UI.page||0)%3,list=PG[pn];
      for(const t of list){const r=canBuildType(0,t);out.push({img:THUMB['b'+t],nm:BT[t].n,cost:BT[t].cost,dis:r,lock:G.P[0].age<BT[t].age,act:()=>startPlace(t)})}
      {const nx=(pn+1)%3;out.push({ic:['🏠','🏛️','⚔️'][nx],nm:'Ver '+['prédios de economia','prédios da cidade','prédios militares'][nx],act:()=>{UI.page=nx;UI.sig=''}})}}
    const tr=us.find(u=>u.type==='trans'&&u.cargo&&u.cargo.length);if(tr)out.push({ic:'⚓',nm:'Desembarcar aqui',act:()=>us.forEach(u=>{if(u.cargo&&u.cargo.length){u.ux=null;unloadAll(u)}})});
    out.push({ic:'✋',nm:'Parar',act:()=>us.forEach(orderStop)});
  }else if(own[0].k==='b'){
    const b=own[0];
    if(b.done>=1){
      for(const t of BT[b.type].train||[]){const r=canTrain(b,t);const T=STAT[0][t];out.push({img:THUMB['u'+(t==='guer'&&T.axe?'guerA':t)],nm:T.n,cost:costOf(0,t),dis:r,lock:G.P[0].age<UT[t].age,cnt:b.q.filter(q=>q===t).length,
        act:n=>{for(let i=0;i<(n||1);i++){const w=canTrain(b,t);if(w){if(i===0)toast(w);break}pay(0,costOf(0,t));b.q.push(t)}}})}
      if(b.type==='biblioteca'&&G.P[0].age<ENDAGE()){const a=G.P[0].age+1,c=AGECOST[a];const busy=G.B.some(x=>!x.dead&&x.o===0&&x.q.includes('age'));const rq=ageReqMsg(0);
        out.push({ic:'⬆️',nm:'Avançar: '+AGES[a],cost:c,dis:busy?'Já está avançando':rq?rq:!afford(0,c)?'Faltam recursos: '+costTxt(c):null,cnt:b.q.includes('age')?1:0,act:()=>{pay(0,c);b.q.push('age')}})}
      if(b.type==='biblioteca'&&(G.P[0].mil||0)<MIL_N){const P=G.P[0],ml=P.mil||0,c=MILCOST[ml],ra=MILAGE[ml],busy=G.B.some(x=>!x.dead&&x.o===0&&x.q.includes('mil'));
        out.push({ic:'🎖️',nm:'Organização Militar '+ROMAN[ml+1],d:'População máxima +'+POP_STEP+' (agora '+P.cap+')',cost:c,dis:busy?'Já está pesquisando':P.age<ra?'Requer '+AGES[ra]:!afford(0,c)?'Faltam recursos: '+costTxt(c):null,lock:P.age<ra,cnt:b.q.includes('mil')?1:0,act:()=>{pay(0,c);b.q.push('mil')}})}
      for(const id of BT[b.type].res||[]){if(G.P[0].techs.includes(id))continue;const T=TECH[id];const r=canResearch(b,id);
        out.push({tech:T.ic,nm:T.n,d:T.d,cost:T.cost,dis:r,lock:G.P[0].age<T.age,cnt:b.q.includes('t:'+id)?1:0,act:()=>{pay(0,T.cost);b.q.push('t:'+id)}})}
    }
  }
  return out.slice(0,12);
}
function runCmd(c,n){if(c.dis){toast(c.dis);return}snd('click');c.act(n);UI.sig='';updHUD(true)}
function btnHTML(c){
  const face=c.img?'<img src="'+c.img+'">':c.tech?'<span class="tch">'+c.tech+'</span>':c.ic;
  return face+(c.lock?'<span class="lk">🔒</span>':'')+'<i></i>';
}
function updHUD(force){
  if(!G)return;const P=G.P[0];
  $('rf').textContent=P.res.food|0;$('rw').textContent=P.res.wood|0;$('rg').textContent=P.res.gold|0;$('rs').textContent=P.res.wealth|0;$('rk').textContent=P.res.know|0;$('ro').textContent=P.res.oil|0;$('roil').style.display=P.age>=5||P.res.oil>0?'':'none';
  $('rp').textContent=P.pop+'/'+P.cap;$('rp').style.color=P.pop>=P.cap?'var(--bad)':'';
  const ab=G.B.find(b=>!b.dead&&b.o===0&&b.q[0]==='age');
  $('age').textContent=AGES[P.age]+(ab?' ⬆'+Math.floor(ab.qt/AGETIME[P.age+1]*100)+'%':'');
  const m=G.t/60|0,sx=G.t%60|0;$('clock').textContent=m+':'+(sx<10?'0':'')+sx;
  // relógio de vitória: o do seu time primeiro; senão, o do inimigo que está mais perto de vencer
  {let mw=0,mt=0,fw=0,ft=0;const tw=G.tw||[];for(let o=0;o<NP;o++){const w=G.won[o]||0,t=tw[o]||0;if(ally(o,0)){mw=Math.max(mw,w);mt=Math.max(mt,t)}else{fw=Math.max(fw,w);ft=Math.max(ft,t)}}
    $('won').textContent=mw?'🏛 '+fmtT(WONDER_T-mw):fw?'⚠️🏛 '+fmtT(WONDER_T-fw):mt?'🗺 '+fmtT(TERR_T-mt):ft?'⚠️🗺 '+fmtT(TERR_T-ft):''}
  const idle=G.U.filter(u=>!u.dead&&!u.inT&&u.o===0&&u.type==='vill'&&u.st==='idle').length;$('nidle').textContent=idle||'';$('qidle').classList.toggle('off',!idle);
  SEL=SEL.filter(id=>{const e=E.get(id);return e&&!e.dead&&!e.inT});
  const s=selEnts(),info=$('info');
  const h=s.length?infoHTML(s):'<div class="bd" style="opacity:.75;font-style:italic;align-self:center">'+civOf(0).n+' · '+styOf(0).nm+' · 🗺 '+Math.round(domShare(0)*100)+'% da terra · 🏘 '+G.B.filter(b=>!b.dead&&b.o===0&&b.type==='tc'&&b.done>=1).length+'/'+CITY_MAX+'<br>'+civOf(0).d.map(x=>'✦ '+x).join('<br>')+'</div>';
  if(h!==info._h){info._h=h;info.innerHTML=h}
  const cmds=getCmds();const sig=SEL.join(',')+'|'+UI.page+'|'+P.age+'|'+cmds.length+'|'+(s[0]&&s[0].done>=1)+'|'+P.techs.length+'|'+cmds.map(c=>c.lock?1:0).join('');
  const box=$('cmds');
  if(sig!==UI.sig||force){UI.sig=sig;box.innerHTML='';
    cmds.forEach((c,i)=>{const b=document.createElement('button');b.className='cb';b.innerHTML=btnHTML(c);b.onclick=()=>{const cc=getCmds()[i];if(cc){runCmd(cc);if(!cc.dis&&cc.cost&&!placing)toast('<b>'+cc.nm+'</b> · '+costTxt(cc.cost)+(cc.d?'<br>'+cc.d:''))}};box.appendChild(b)})}
  [...box.children].forEach((b,i)=>{const c=cmds[i];if(!c)return;b.classList.toggle('off',!!c.dis);b.querySelector('i').textContent=c.cnt?c.cnt:''});
  $('placebar').style.display=placing&&inputMode!=='pad'?'flex':'none';
}
function fmtT(s){s=Math.max(0,s|0);return(s/60|0)+':'+(s%60<10?'0':'')+(s%60)}
function infoHTML(s){
  const x='<button class="cb x">✖</button>';
  const por=src=>'<div class="por"><img src="'+src+'"></div>';
  if(s.length>1){const c={};for(const e of s){const k=e.k==='u'?'u'+e.type:'b'+e.type;c[k]=(c[k]||0)+1}
    return x+'<div class="bd"><div class="t">'+s.length+' selecionados</div><div class="grp">'+Object.entries(c).map(([k,v])=>'<span><img src="'+(THUMB[k]||'')+'"><b>'+v+'</b></span>').join('')+'</div></div>'}
  const e=s[0];
  if(e.k==='r'){const nm={tree:'Árvore',berry:'Arbusto de frutas',gold:'Mina de metal',stone:'Minério de metal',fish:e.deep?'Cardume (só barcos)':'Peixes',carc:'Carne de caça',oil:'Petróleo (Era Industrial)'}[e.sub];
    return x+por(THUMB['r'+(e.sub==='fish'?'fish1':e.sub)]||THUMB.rtree)+'<div class="bd"><div class="t">'+nm+'</div><div class="st">'+rimg(e.rt)+' '+Math.ceil(e.amt)+' de '+RNM[e.rt]+'</div></div>'}
  if(e.k==='u'){const T=ST(e);const own=e.o===0?'':e.o===GAIA?'':' <span style="color:#ff8a7a">(inimigo)</span>';
    const stt={idle:'Parado',move:'Andando',gather:e.lsub==='farm'?'Cultivando':e.lsub==='tree'?'Cortando madeira':e.lsub==='gold'||e.lsub==='stone'?'Minerando metal':e.lsub==='fish'?'Pescando':UT[e.lsub]||e.lsub==='carc'?'Caçando'+(e.hunting&&G.t-e.hunting<2?' com '+HUNTW[huntTier(e.o)].n:''):'Colhendo frutas',
      return:'Levando recursos',build:'Construindo',attack:'Atacando',convert:'Convertendo',heal:'Curando',board:'Embarcando',unload:'Indo desembarcar',study:'Estudando (gera conhecimento)',trade:'Levando mercadorias (rota de comércio)',rare:'Cuidando de um recurso raro'}[e.st]||'';
    let st='❤️'+Math.ceil(e.hp)+'/'+T.hp+(T.atk?' ⚔️'+T.atk:'')+(T.arm?' 🛡️'+T.arm:'')+(T.rng?' 🎯'+T.rng:'');
    if(e.type==='sac')st+=' ✨'+Math.floor(e.faith)+'%';
    if(e.cargo)st+=' · carga '+e.cargo.length+'/'+UT[e.type].cap;
    return x+por(THUMB['u'+(e.type==='guer'&&T.axe?'guerA':e.type)])+'<div class="bd"><div class="t">'+T.n+own+'</div><div class="hp"><div style="width:'+clamp(e.hp/T.hp*100,0,100)+'%"></div></div><div class="st">'+st+'<br>'+stt+(e.carry>0?' · '+rimg(e.ct)+(e.carry|0):'')+(e.att>ATTR_DELAY?' · <span style="color:#ff8a7a">⚠️ sem suprimento</span>':'')+'</div></div>'}
  const T=BT[e.type];let h=x+por(THUMB['b'+e.type])+'<div class="bd"><div class="t">'+T.n+(e.o!==0?' <span style="color:#ff8a7a">(inimigo)</span>':'')+'</div><div class="hp"><div style="width:'+(e.hp/e.mhp*100)+'%"></div></div><div class="st">';
  if(e.done<1)return h+'Em construção: '+Math.floor(e.done*100)+'%</div></div>';
  if(e.type==='fazenda')return h+rimg('food')+' '+Math.ceil(e.food)+' de comida</div></div>';
  h+='❤️'+Math.ceil(e.hp)+'/'+e.mhp;
  if(e.type==='tc'){h+=' · '+(e.id===G.P[e.o].capId?'👑 Capital':'🏘 Cidade');if(e.down)h+='<br><span style="color:#ff8a7a">Derrubado'+(e.cp>0?': '+(e.cpo===0?'você está tomando':'sendo tomado')+' '+Math.floor(e.cp/CAPT_T*100)+'%':'')+'</span>'}
  if(e.o===0&&e.q.length){const it=e.q[0],tt=itemTime(e,it);h+=' · '+(e.wait?'<span style="color:#ff8a7a">População no limite!</span>':Math.floor(e.qt/tt*100)+'%')+'</div><div class="qq">'+
    e.q.map((q,i)=>'<span data-qi="'+i+'">'+(q==='age'?'⬆️':q==='mil'?'🎖️':q==='nuke'?'☢️':q==='emp'?'⚡':q.startsWith('ln:')?LINES[q.slice(3)].ic:q.startsWith('t:')?TECH[q.slice(2)].ic:'<img src="'+THUMB['u'+q]+'">')+'</span>').join('')+'</div></div>'}
  else h+=(T.train&&e.o===0?'<br>Toque no chão: ponto de encontro':T.drop&&e.o===0?'<br>Recebe: '+T.drop.map(k=>rimg(k)).join(' '):'')+'</div></div>';
  return h;
}
function cancelQ(i){const b=selEnts()[0];if(!b||b.k!=='b'||b.o!==0)return;const it=b.q[i];if(it==null)return;refund(0,itemCost(0,it));b.q.splice(i,1);if(i===0)b.qt=0;updHUD(true)}
function startPlace(t){
  const r=canBuildType(0,t);if(r){toast(r);return}
  const T=BT[t];const w=inputMode==='pad'?scrToW(PAD.cx,PAD.cy):{x:camX,y:camY};
  placing={type:t,tx:Math.round(w.x/TS-T.sz/2),ty:Math.round(w.y/TS-T.sz/2),ok:false,a:null,b:null};
  if(inputMode!=='pad')toast(t==='muralha'?'🧱 Toque no começo e no fim da muralha, depois ✔️':'Toque onde quer: <b>'+T.n+'</b> — depois ✔️');
  updHUD(true);
}
function confirmPlace(keep){
  if(!placing)return;const T=BT[placing.type];
  const tl=placingTiles().filter(t=>t.ok);
  if(!tl.length){toast(domWhy(placing.type,placing.tx,placing.ty,0)||'Não dá para construir aí');return}
  const vs=selEnts().filter(e=>e.k==='u'&&e.type==='vill');let first=null,n=0;
  for(const t of tl){if(!afford(0,T.cost))break;pay(0,T.cost);const b=placeBld(placing.type,0,t.tx,t.ty,false);if(!first)first=b;n++}
  if(!n){toast('Faltam recursos: '+costTxt(T.cost));placing=null;updHUD(true);return}
  vs.forEach(v=>orderBuild(v,first));snd('place');
  if(!keep||!afford(0,T.cost)||placing.type==='muralha')placing=null;
  updHUD(true);
}

// =========================================================
//   SELEÇÃO E CLIQUES
// =========================================================
function isoToScr(I,J){const ci=camX-camY,cj=(camX+camY)/2;return{x:VW/2+(I-ci)*Z,y:CYc()+(J-cj)*Z}}
function pickAt(sx,sy){
  let best=null,bd=1;
  for(const u of G.U){if(u.dead||u.inT)continue;if(u.o!==0&&!vis[tileOf(u.x,u.y)])continue;const p=w2s(u.x,u.y);const sp=UT[u.type].spr;
    const cy=p.y-sp[3]*.45*Z,rx=Math.max(16,sp[0]*.42*Z),ry=Math.max(18,sp[3]*.55*Z);const dx=(sx-p.x)/rx,dy=(sy-cy)/ry,d=dx*dx+dy*dy;if(d<bd){bd=d;best=u}}
  if(best)return best;
  const w=scrToW(sx,sy);let bb=null,bdep=-1;
  for(const b of G.B){if(b.dead)continue;if(b.o!==0&&!G.exp[idx(b.tx,b.ty)])continue;
    let hit=w.x>=b.tx*TS&&w.x<(b.tx+b.sz)*TS&&w.y>=b.ty*TS&&w.y<(b.ty+b.sz)*TS;
    if(!hit&&b.type!=='fazenda'){const I0=(b.tx-b.ty)*TS,J0=(b.tx+b.ty)*TS/2;const p0=isoToScr(I0-b.sz*TS*.85,J0-BT[b.type].h*.85),p1=isoToScr(I0+b.sz*TS*.85,J0+b.sz*TS*.5);hit=sx>=p0.x&&sx<=p1.x&&sy>=p0.y&&sy<=p1.y}
    if(hit){const d=depthOf(b);if(d>bdep){bdep=d;bb=b}}}
  if(bb)return bb;
  let br=null,brd=-1;const tx=w.x/TS|0,ty=w.y/TS|0;
  for(let dy=-1;dy<=3;dy++)for(let dx=-1;dx<=3;dx++){const X=tx+dx,Y=ty+dy;if(!inMap(X,Y))continue;const id=occ[idx(X,Y)];const r=id&&E.get(id);if(!r||r.k!=='r'||!G.exp[idx(X,Y)])continue;
    const I=(X-Y)*TS,J=(X+Y+1)*TS/2,h=r.sub==='tree'?74:30;const p0=isoToScr(I-24,J-h),p1=isoToScr(I+24,J+6);if(sx>=p0.x&&sx<=p1.x&&sy>=p0.y&&sy<=p1.y){const d=X+Y;if(d>brd){brd=d;br=r}}}
  if(br)return br;
  for(const r of G.R){if(r.dead||!r.walk)continue;const p=w2s(r.x,r.y);if(hyp(sx-p.x,sy-p.y)<20)return r}
  return null;
}
function clickAt(sx,sy,add){
  const w=scrToW(sx,sy);
  if(placing){const T=BT[placing.type];const tx=Math.round(w.x/TS-T.sz/2),ty=Math.round(w.y/TS-T.sz/2);
    if(placing.type==='muralha'){if(!placing.a||placing.done2){placing.a=[tx,ty];placing.b=null;placing.done2=false;if(inputMode==='pad'){placing.waitB=true}}else{placing.b=[tx,ty];if(inputMode==='pad')confirmPlace(false)}}
    else{placing.tx=tx;placing.ty=ty;if(inputMode==='pad')confirmPlace(add)}return}
  const e=pickAt(sx,sy);const s=selEnts();const ownUnits=s.filter(x=>x.k==='u'&&x.o===0);
  if(e&&e.o===0&&e.k==='u'){
    if(ownUnits.length&&!add&&!SEL.includes(e.id)){const land=ownUnits.filter(u=>!isNav(u));
      if(e.type==='trans'&&land.length&&land.length===ownUnits.length){smartOrder(ownUnits,e,w.x,w.y,0);mark(e.x,e.y,'#6f6');return}
      if(ownUnits.some(u=>u.type==='sac')&&e.hp<ST(e).hp&&ownUnits.every(u=>u.type==='sac')){smartOrder(ownUnits,e,w.x,w.y,0);mark(e.x,e.y,'#6f6');return}}
    if(add){if(SEL.includes(e.id))SEL=SEL.filter(i=>i!==e.id);else SEL.push(e.id)}else SEL=[e.id];snd('sel');updHUD();return}
  if(e&&e.k==='b'&&e.o===0){
    const vs=ownUnits.filter(u=>u.type==='vill'),fb=ownUnits.filter(u=>u.type==='pesc'&&u.carry>0);
    if((vs.length&&(e.done<1||e.hp<e.mhp||e.type==='fazenda'||(BT[e.type].drop&&vs.some(v=>v.carry>0))))||(fb.length&&e.type==='doca')){smartOrder(ownUnits,e,w.x,w.y,0);mark(w.x,w.y,'#6f6');return}
    SEL=[e.id];snd('sel');updHUD();return}
  if(ownUnits.length){const r=smartOrder(ownUnits,e,w.x,w.y,0);mark(w.x,w.y,r==='atk'?'#ff5a4a':r==='res'?'#ffe08a':'#7f7');return}
  if(s.length===1&&s[0].k==='b'&&s[0].o===0&&BT[s[0].type].train&&s[0].done>=1){s[0].rally={x:w.x,y:w.y,id:e&&(e.k==='r'||e.o===GAIA)?e.id:0};mark(w.x,w.y,'#6cf');return}
  if(e){SEL=[e.id];updHUD();return}
  if(s.length){SEL=[];updHUD()}
}
function mark(x,y,c){UI.mk={x,y,t:0,c};snd('click')}
function onScreen(x,y){const p=w2s(x,y);return p.x>0&&p.x<VW&&p.y>TOPH&&p.y<VH-PANH}
function selectSameType(sx,sy){
  const e=pickAt(sx,sy);if(!e||e.o!==0)return false;
  if(e.k==='u')SEL=G.U.filter(u=>!u.dead&&!u.inT&&u.o===0&&u.type===e.type&&onScreen(u.x,u.y)).map(u=>u.id);
  else SEL=G.B.filter(b=>!b.dead&&b.o===0&&b.type===e.type&&onScreen(ctr(b).x,ctr(b).y)).map(b=>b.id);
  updHUD();return true;
}
function boxSelect(b,add){
  const x0=Math.min(b.x0,b.x1),x1=Math.max(b.x0,b.x1),y0=Math.min(b.y0,b.y1),y1=Math.max(b.y0,b.y1);
  const ids=G.U.filter(u=>{if(u.dead||u.inT||u.o!==0)return false;const p=w2s(u.x,u.y);return p.x>=x0-6&&p.x<=x1+6&&p.y>=y0-6&&p.y<=y1+24}).map(u=>u.id);
  if(!ids.length&&!add)return;   // caixa vazia: mantém o que já estava selecionado
  SEL=add?[...new Set([...SEL,...ids])]:ids;if(ids.length)snd('sel');updHUD();
}
function quickIdle(){const vs=G.U.filter(u=>!u.dead&&!u.inT&&u.o===0&&u.type==='vill'&&u.st==='idle');if(!vs.length){toast('Nenhum aldeão parado');return}const u=vs[UI.idleIdx++%vs.length];SEL=[u.id];centerOn(u.x,u.y);updHUD()}
function quickArmy(){const us=G.U.filter(u=>!u.dead&&!u.inT&&u.o===0&&u.type!=='vill'&&u.type!=='pesc'&&!UT[u.type].civ);if(!us.length){toast('Você não tem soldados');return}SEL=us.map(u=>u.id);const c=us.reduce((a,u)=>({x:a.x+u.x/us.length,y:a.y+u.y/us.length}),{x:0,y:0});centerOn(c.x,c.y);updHUD()}
function quickTC(){const t=G.B.filter(b=>!b.dead&&b.o===0&&b.type==='tc');if(!t.length){toast('Sem Centro Urbano!');return}const b=t[UI.idleIdx++%t.length];SEL=[b.id];const c=ctr(b);centerOn(c.x,c.y);updHUD()}
function quickVills(){SEL=G.U.filter(u=>!u.dead&&!u.inT&&u.o===0&&u.type==='vill').map(u=>u.id);updHUD()}
$('qidle').onclick=quickIdle;$('qarmy').onclick=quickArmy;$('qtc').onclick=quickTC;
$('pok').onclick=()=>confirmPlace(false);$('pno').onclick=()=>{placing=null;updHUD(true)};
$('bmenu').onclick=()=>openPause();
$('info').addEventListener('pointerdown',ev=>{const x=ev.target.closest('.x');if(x){SEL=[];updHUD(true);return}const q=ev.target.closest('[data-qi]');if(q)cancelQ(+q.dataset.qi)});

// =========================================================
//   TOQUE NA TELA
// =========================================================
let inputMode='touch',selBox=null,hoverEnt=null;
const ptrs=new Map();let tm=null,ts0=null,lpT=0,pin=null,lastTap={t:0,x:0,y:0};
cv.addEventListener('pointerdown',e=>{
  if(!running)return;setMode('touch');
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY});
  if(ptrs.size===1){tm='pend';ts0={x:e.clientX,y:e.clientY};clearTimeout(lpT);
    lpT=setTimeout(()=>{if(tm==='pend'&&!placing&&ptrs.size===1&&(()=>{const p=[...ptrs.values()][0];return hyp(p.x-ts0.x,p.y-ts0.y)<6})()){tm='box';selBox={x0:ts0.x,y0:ts0.y,x1:ts0.x,y1:ts0.y};try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}}},600)}
  else if(ptrs.size===2){tm='pinch';clearTimeout(lpT);selBox=null;const[a,b]=[...ptrs.values()];const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;pin={d:hyp(a.x-b.x,a.y-b.y)||1,z:Z,w:scrToW(mx,my)}}
});
cv.addEventListener('pointermove',e=>{
  const p=ptrs.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;
  if(tm==='pend'&&hyp(p.x-ts0.x,p.y-ts0.y)>10){tm='pan';clearTimeout(lpT)}
  if(tm==='pan'){panScreen(-(p.x-p.lx),-(p.y-p.ly))}
  if(tm==='box'){selBox.x1=p.x;selBox.y1=p.y}
  if(tm==='pinch'&&ptrs.size>=2){const[a,b]=[...ptrs.values()];const d=hyp(a.x-b.x,a.y-b.y);Z=clamp(pin.z*d/pin.d,.45,1.7);const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;const w=scrToW(mx,my);camX+=pin.w.x-w.x;camY+=pin.w.y-w.y;clampCam()}
  p.lx=p.x;p.ly=p.y;
});
function ptrUp(e){
  const p=ptrs.get(e.pointerId);if(!p)return;ptrs.delete(e.pointerId);clearTimeout(lpT);
  if(tm==='pend'&&e.type==='pointerup'){const now=performance.now();
    if(now-lastTap.t<320&&hyp(p.x-lastTap.x,p.y-lastTap.y)<30&&!placing){if(!selectSameType(p.x,p.y))clickAt(p.x,p.y,false);lastTap.t=0}
    else{clickAt(p.x,p.y,false);lastTap={t:now,x:p.x,y:p.y}}}
  if(tm==='box'&&selBox){boxSelect(selBox,false);selBox=null}
  if(ptrs.size===0)tm=null;else if(tm==='pinch')tm='none';
}
addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerup',ptrUp);cv.addEventListener('pointercancel',ptrUp);
let mmDown=false;
const mmGo=e=>{const w=mmToWorld(e.clientX,e.clientY);centerOn(w.x,w.y)};
mm.addEventListener('pointerdown',e=>{mmDown=true;mmGo(e);try{mm.setPointerCapture(e.pointerId)}catch(_){}});
mm.addEventListener('pointermove',e=>{if(mmDown)mmGo(e)});
mm.addEventListener('pointerup',()=>mmDown=false);mm.addEventListener('pointercancel',()=>mmDown=false);
function setMode(m){if(inputMode===m)return;inputMode=m;updHUD(true)}

// =========================================================
//   CONTROLE XBOX
// =========================================================
const PAD={cx:0,cy:0,prev:[],aT:0,aDown:false,aX:0,aY:0,lastA:0,rad:false,radI:-1,big:false,nav:0,navT:0};
function pollPad(dt){
  const pads=navigator.getGamepads?navigator.getGamepads():[];let gp=null;for(const p of pads)if(p&&p.connected){gp=p;break}
  if(!gp)return;
  const B=[];for(let i=0;i<17;i++){const b=gp.buttons[i];B[i]=!!(b&&(b.pressed||b.value>.5))}
  const pr=i=>B[i]&&!PAD.prev[i],rl=i=>!B[i]&&PAD.prev[i];
  const dz=v=>Math.abs(v)<.2?0:(v-Math.sign(v)*.2)/.8;
  const lx=dz(gp.axes[0]||0),ly=dz(gp.axes[1]||0),rx=dz(gp.axes[2]||0),ry=dz(gp.axes[3]||0);
  const anyIn=B.some(x=>x)||lx||ly||rx||ry;
  const scr=document.querySelector('.screen.on');
  if(scr){if(anyIn){musicStart();padScreen(scr,B,pr,lx,ly)}PAD.prev=B;return}
  if(!running){PAD.prev=B;return}
  if(anyIn&&inputMode!=='pad'){setMode('pad');if(!PAD.cx){PAD.cx=VW/2;PAD.cy=CYc()}}
  if(inputMode!=='pad'){PAD.prev=B;return}
  if(pr(9)){openPause();PAD.prev=B;return}
  if(B[7]&&!PAD.rad&&!PAD.big){const c=getCmds();if(c.length){PAD.rad=true;PAD.radI=-1;showRadial()}}
  if(PAD.rad){
    if(!B[7]){PAD.rad=false;$('radial').style.display='none';PAD.prev=B;return}
    const cmds=getCmds();
    if(Math.hypot(lx,ly)>.5){const n=cmds.length;let a=Math.atan2(ly,lx)+Math.PI/2;if(a<0)a+=Math.PI*2;PAD.radI=Math.round(a/(Math.PI*2/n))%n}
    if(pr(3)){UI.page^=1;UI.sig='';showRadial()}
    if(pr(0)&&PAD.radI>=0&&cmds[PAD.radI]){runCmd(cmds[PAD.radI],B[6]?5:1);if(placing){PAD.rad=false;$('radial').style.display='none'}else showRadial()}
    if(pr(1)){PAD.rad=false;$('radial').style.display='none'}
    if(PAD.rad)hiRadial();
    PAD.prev=B;return;
  }
  if(pr(5)){PAD.big=!PAD.big;mmBig(PAD.big)}
  if(PAD.big){const r=mm.getBoundingClientRect();PAD.cx=clamp(PAD.cx+lx*500*dt,r.left,r.right);PAD.cy=clamp(PAD.cy+ly*500*dt,r.top,r.bottom);
    if(pr(0)||pr(3)){const w=mmToWorld(PAD.cx,PAD.cy);centerOn(w.x,w.y);PAD.big=false;mmBig(false);PAD.cx=VW/2;PAD.cy=CYc()}
    if(pr(1)){PAD.big=false;mmBig(false);PAD.cx=VW/2;PAD.cy=CYc()}
    PAD.prev=B;return}
  const sp=650*dt;PAD.cx=clamp(PAD.cx+lx*Math.abs(lx)*sp+lx*sp*.4,0,VW);PAD.cy=clamp(PAD.cy+ly*Math.abs(ly)*sp+ly*sp*.4,TOPH,VH-PANH);
  const ed=26,cs=700*dt;
  if(PAD.cx<ed)panScreen(-cs,0);if(PAD.cx>VW-ed)panScreen(cs,0);if(PAD.cy<TOPH+ed)panScreen(0,-cs);if(PAD.cy>VH-PANH-ed)panScreen(0,cs);
  if(rx||ry)panScreen(rx*900*dt,ry*900*dt);
  if(placing){const w=scrToW(PAD.cx,PAD.cy),T=BT[placing.type];const tx=Math.round(w.x/TS-T.sz/2),ty=Math.round(w.y/TS-T.sz/2);if(placing.type==='muralha'&&placing.a)placing.b=[tx,ty];else{placing.tx=tx;placing.ty=ty}}
  hoverEnt=placing?null:pickAt(PAD.cx,PAD.cy);
  if(pr(0)){PAD.aDown=true;PAD.aT=0;PAD.aX=PAD.cx;PAD.aY=PAD.cy}
  if(PAD.aDown&&B[0]){PAD.aT+=dt;if(PAD.aT>.3&&!selBox&&!placing)selBox={x0:PAD.aX,y0:PAD.aY,x1:PAD.cx,y1:PAD.cy};if(selBox){selBox.x1=PAD.cx;selBox.y1=PAD.cy}}
  if(PAD.aDown&&rl(0)){PAD.aDown=false;
    if(selBox){boxSelect(selBox,B[6]);selBox=null}
    else{const now=performance.now();if(now-PAD.lastA<330&&!placing){selectSameType(PAD.cx,PAD.cy);PAD.lastA=0}else{clickAt(PAD.cx,PAD.cy,B[6]);PAD.lastA=now}}}
  if(pr(1)){if(placing){placing=null;updHUD(true)}else if(SEL.length){SEL=[];updHUD(true)}}
  if(pr(2)){selEnts().forEach(e=>{if(e.k==='u'&&e.o===0)orderStop(e)})}
  if(pr(3)&&UI.lastAlert)centerOn(UI.lastAlert.x,UI.lastAlert.y);
  if(pr(4)){const zs=[.55,.8,1.15];let i=zs.findIndex(z=>z>Z+.01);if(i<0)i=0;Z=zs[i]}
  if(pr(12))quickIdle();if(pr(13))quickTC();if(pr(14))quickArmy();if(pr(15))quickVills();
  PAD.prev=B;
}
function showRadial(){
  const cmds=getCmds();const r=$('radial');r.innerHTML='';r.style.display='block';const n=cmds.length,R=n>7?118:96;
  cmds.forEach((c,i)=>{const a=i/n*Math.PI*2-Math.PI/2;const b=document.createElement('div');b.className='cb'+(c.dis?' off':'');b.style.left=Math.cos(a)*R+'px';b.style.top=Math.sin(a)*R*.8+'px';b.innerHTML=btnHTML(c);if(c.cnt)b.querySelector('i').textContent=c.cnt;r.appendChild(b)});
  const l=document.createElement('div');l.className='lbl';l.id='rlbl';r.appendChild(l);hiRadial();
}
function hiRadial(){const r=$('radial'),cmds=getCmds();[...r.querySelectorAll('.cb')].forEach((b,i)=>b.classList.toggle('sel',i===PAD.radI));const l=$('rlbl');if(!l)return;const c=cmds[PAD.radI];
  l.innerHTML=c?c.nm+(c.cost?'<br>'+costTxt(c.cost):'')+(c.dis?'<br><span style="color:#a02010">'+c.dis+'</span>':''):'Aponte e aperte A<br><small>Y: troca a página</small>'}
function padScreen(scr,B,pr,lx,ly){
  const bs=[...scr.querySelectorAll('.mb')].filter(b=>b.offsetParent!==null);if(!bs.length)return;
  if(PAD.nav>=bs.length)PAD.nav=0;
  const now=performance.now();
  const up=pr(12)||(ly<-.6&&now-PAD.navT>250),dn=pr(13)||(ly>.6&&now-PAD.navT>250),lf=pr(14)||(lx<-.6&&now-PAD.navT>250),rt=pr(15)||(lx>.6&&now-PAD.navT>250);
  if(up||lf){PAD.nav=(PAD.nav-1+bs.length)%bs.length;PAD.navT=now}
  if(dn||rt){PAD.nav=(PAD.nav+1)%bs.length;PAD.navT=now}
  bs.forEach((b,i)=>b.classList.toggle('f',i===PAD.nav));
  if(pr(0))bs[PAD.nav].click();
  if(pr(1)){const bk=scr.querySelector('[data-back]');if(bk)bk.click()}
}

// =========================================================
//   MENUS, SALVAR E CARREGAR
// =========================================================
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));document.querySelectorAll('.mb.f').forEach(b=>b.classList.remove('f'));if(id)$(id).classList.add('on');PAD.nav=0;
  const a=!!id&&['menu','setup','help','end','quitc','bye'].includes(id);art.style.display=a?'block':'none';if(a&&!artOn){artOn=true;drawTitleArt()}if(!a)artOn=false}
const SAVEK='reinos_save2';
function hasSave(){try{return!!localStorage.getItem(SAVEK)}catch(e){return false}}
function saveGame(){if(!G||G.over)return;try{localStorage.setItem(SAVEK,JSON.stringify(G))}catch(e){console.warn('save',e)}}
function loadGame(){
  let s=null;try{s=JSON.parse(localStorage.getItem(SAVEK))}catch(e){}
  if(!s||s.v!==2)return false;G=s;setMapSize(G.mw||72);E=new Map();occ.fill(0);
  for(let i=0;i<N;i++){pass[i]=G.terr[i]===1?0:1;wpass[i]=G.terr[i]?1:0}
  for(const r of G.R){E.set(r.id,r);if(!r.walk){const i=idx(r.tx,r.ty);occ[i]=r.id;if(!G.terr[i])pass[i]=0}}
  for(const b of G.B){E.set(b.id,b);markBld(b,true)}
  for(const u of G.U){E.set(u.id,u);if(u.mv)u.np=true}
  return true;
}
function startGame(){
  RNG=mulberry32(G.seed+G.t|0);
  if(G.rel&&G.rel.length!==G.P.length)G.rel=null;
  NP=G.P.length;// jogo novo já veio com NP certo; jogo salvo recupera NP a partir de quantos jogadores tem
  STAT=[];MODS=[];for(let p=0;p<NP;p++)recompute(p);
  G.tw=G.tw||new Array(NP).fill(0);G.st.city=G.st.city||new Array(NP).fill(0);for(const P of G.P)P.mil=P.mil||0;
  for(let p=0;p<NP;p++)ensureCapital(p);calcDom();
  buildSprites();buildTerrain();mmDirty=true;
  SEL=[];placing=null;UI.sig='';UI.lastAlert=null;UI.page=0;
  const tc=G.B.find(b=>b.o===0&&b.type==='tc');const c=tc?ctr(tc):{x:G.starts[0][0]*TS,y:G.starts[0][1]*TS};
  resize();Z=.8;centerOn(c.x+TS,c.y+TS);
  recountPop();updVis();
  $('civn').textContent=civOf(0).n;
  $('hud').style.display='block';show(null);running=true;paused=false;
  updHUD(true);goFull();musicStart();
}
// tela de escolha
let SETUP={civ:OPT.civ||'gregos',map:OPT.map||'mar',diff:OPT.diff||'normal'};
function buildSetup(){
  const g=$('civg');g.innerHTML='';
  for(const c of CIVS){const b=document.createElement('button');b.className='mb';b.dataset.civ=c.id;b.innerHTML='<i style="background:'+STY[c.st].sw+'"></i><span>'+c.n+'<small>arquitetura '+STY[c.st].nm.toLowerCase()+'</small></span>';b.onclick=()=>{SETUP.civ=c.id;updSetup();snd('click')};g.appendChild(b)}
  document.querySelectorAll('[data-map]').forEach(b=>b.onclick=()=>{SETUP.map=b.dataset.map;updSetup();snd('click')});
  document.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>{SETUP.diff=b.dataset.diff;updSetup();snd('click')});
  updSetup();ARTP.then(updSetup);
}
// desenho da arquitetura do povo (Centro Urbano da arte do GPT; se o estilo ainda não tem arte, um emblema)
const CIVART={};
function civArt(st){if(CIVART[st]!==undefined)return CIVART[st];const B=GPTART.b[st],m=B&&B.tc,img=m&&GA['b_'+st+'_'+m.at+'_0'];
  if(!img){const em={babilonia:'🏺',oriental:'🏯',egito:'𓂀',grego:'🏛️'}[st]||'🏛️';const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d');
    g.fillStyle=STY[st].sw;g.beginPath();g.arc(80,80,70,0,7);g.fill();g.lineWidth=6;g.strokeStyle='#c9952e';g.stroke();g.font='84px "Noto Color Emoji","Apple Color Emoji",serif';g.textAlign='center';g.textBaseline='middle';g.fillText(em,80,86);return CIVART[st]=c.toDataURL()}
  return CIVART[st]=gaCut(img,m.r).toDataURL()}
function updSetup(){
  document.querySelectorAll('[data-civ]').forEach(b=>b.classList.toggle('on',b.dataset.civ===SETUP.civ));
  document.querySelectorAll('[data-map]').forEach(b=>b.classList.toggle('on',b.dataset.map===SETUP.map));
  document.querySelectorAll('[data-diff]').forEach(b=>b.classList.toggle('on',b.dataset.diff===SETUP.diff));
  const c=CIVS.find(x=>x.id===SETUP.civ);
  $('civd').innerHTML='<img class="cvimg" src="'+civArt(c.st)+'"><div><div class="cvn">'+c.n+'</div><span class="cvs">arquitetura '+STY[c.st].nm.toLowerCase()+'</span><ul>'+c.d.map(x=>'<li>'+x+'</li>').join('')+'</ul></div>';
}
$('bnew').onclick=()=>{musicStart();snd('click');buildSetup();show('setup')};
$('bback').onclick=()=>show('menu');
function loading(fn){$('load').style.display='flex';ARTP.then(()=>new Promise(r=>setTimeout(r,60))).then(()=>{try{fn()}finally{$('load').style.display='none'}})}
$('bstart').onclick=()=>{OPT.civ=SETUP.civ;OPT.map=SETUP.map;OPT.diff=SETUP.diff;saveOpt();loading(()=>{newGame(SETUP);startGame();toast('Dica: selecione os aldeões e mande coletar frutas, caçar e cortar madeira!')})};
$('bcont').onclick=()=>{musicStart();loading(()=>{if(loadGame())startGame()})};
let helpFrom='menu';
$('bhelp').onclick=()=>{helpFrom='menu';show('help')};
$('bhelp2').onclick=()=>{helpFrom='pause';show('help')};
$('bhelpx').onclick=()=>show(helpFrom);
function openPause(){if(!running)return;paused=true;updOptBtns();show('pause')}
$('bres').onclick=()=>{paused=false;show(null)};
$('bspd').onclick=()=>{OPT.spd=OPT.spd===1?1.5:OPT.spd===1.5?2:1;saveOpt();updOptBtns()};
$('bqual').onclick=()=>{OPT.qual=OPT.qual?0:1;saveOpt();resize();updOptBtns()};
$('bfps').onclick=()=>{OPT.eco=OPT.eco?0:1;saveOpt();updOptBtns()};
$('bord').onclick=()=>{OPT.tap2=OPT.tap2===0?1:0;saveOpt();updOptBtns();snd('click')};
$('bsnd').onclick=()=>{OPT.snd=OPT.snd?0:1;saveOpt();updOptBtns();snd('click')};
const togMus=()=>{OPT.mus=OPT.mus?0:1;saveOpt();if(OPT.mus)musicStart();else musicStop();updOptBtns()};
$('bmus').onclick=togMus;$('bmus2').onclick=togMus;
$('bquit').onclick=()=>{saveGame();running=false;$('hud').style.display='none';$('bcont').style.display=hasSave()?'flex':'none';show('menu')};
$('bend').onclick=()=>{$('bcont').style.display=hasSave()?'flex':'none';show('menu')};
// sair do jogo: salva, para a música e fecha o app
let quitFrom='menu';
$('bexit').onclick=()=>{quitFrom='menu';snd('click');show('quitc')};
$('bexit2').onclick=()=>{quitFrom='pause';snd('click');show('quitc')};
$('bqback').onclick=()=>show(quitFrom);
$('bqyes').onclick=quitGame;
function quitGame(){
  if(running){saveGame();running=false;paused=false;$('hud').style.display='none'}
  musicStop();try{if(AC)AC.suspend()}catch(e){}
  try{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(e){}
  try{window.close()}catch(e){}
  setTimeout(()=>show('bye'),400);// se o celular não deixar fechar sozinho
}
$('bbyeback').onclick=()=>{$('bcont').style.display=hasSave()?'flex':'none';try{if(AC&&OPT.mus)AC.resume()}catch(e){}if(OPT.mus)musicStart();show('menu')};
function updOptBtns(){$('bspd').textContent='⏩ Velocidade: '+OPT.spd+'x';$('bqual').textContent='🖼 Gráfico: '+(OPT.qual?'Bonito':'Leve');$('bfps').textContent='🔋 Economia de bateria: '+(OPT.eco?'Ligada':'Desligada');
  $('bord').textContent=OPT.tap2===0?'👆 Ordens: 1 toque (rápido)':'👆 Ordens: 2 toques (seguro)';$('bsnd').textContent=OPT.snd?'🔊 Sons':'🔇 Sons';$('bmus2').textContent=OPT.mus?'🎵 Música':'🔇 Música';$('bmust').textContent='Música: '+(OPT.mus?'Ligada':'Desligada')}
updOptBtns();
function endGame(win,msg){
  G.over=true;running=false;try{localStorage.removeItem(SAVEK)}catch(e){}
  $('hud').style.display='none';$('endt').textContent=win?'VITÓRIA':'DERROTA';snd(win?'win':'lose');
  $('ends').innerHTML='<b>'+msg+'</b><br><br>Povo: '+civOf(0).n+(NP===2?' · Inimigo: '+civOf(1).n:' · '+NP+' nações')+' · '+DIFF[G.diff].n+'<br>Tempo: '+fmtT(G.t)+' · Era alcançada: '+AGES[G.P[0].age]+'<br>Inimigos derrotados: '+G.st.kill[0]+' · Perdas: '+G.st.lost[0]+' · Recursos coletados: '+(G.st.gath[0]|0)+
    (NP>2?'<table style="margin:8px auto 0;border-collapse:collapse;font-size:12px"><tr><th></th><th style="text-align:left;padding:1px 6px">Nação</th><th style="padding:1px 6px">Abates</th><th style="padding:1px 6px">Perdas</th><th style="padding:1px 6px">Recursos</th></tr>'+G.P.map((P,p)=>'<tr><td><span style="display:inline-block;width:10px;height:10px;border:1px solid #000;background:'+COL[p].m+'"></span></td><td style="text-align:left;padding:1px 6px">'+civOf(p).n+(p===0?' (você)':ally(p,0)?' 🤝':'')+'</td><td>'+G.st.kill[p]+'</td><td>'+G.st.lost[p]+'</td><td>'+(G.st.gath[p]|0)+'</td></tr>').join('')+'</table>':'')+
    '<br><br><i>'+(win?'Seu nome será lembrado pelas próximas gerações.':'Até os grandes impérios começaram com uma derrota. Tente outra vez!')+'</i>';
  show('end');
}
function checkEnd(){
  // cai quem fica sem cidade, sem tropas e sem quartéis; só com aldeões, tem 2 minutos para reconstruir
  const strong=p=>G.B.some(b=>!b.dead&&b.o===p&&b.done>=1&&(b.type==='tc'||(BT[b.type].pg===1&&b.type!=='muralha')))||G.U.some(u=>!u.dead&&u.o===p&&isMil(u));
  const some=p=>G.U.some(u=>!u.dead&&u.o===p)||G.B.some(b=>!b.dead&&b.o===p&&b.type!=='fazenda'&&b.type!=='muralha');
  const out=new Array(NP).fill(false);
  for(let p=0;p<NP;p++){const P=G.P[p];if(strong(p)){P.grace=0;continue}if(!some(p)){out[p]=true;continue}
    if(!P.grace){P.grace=G.t||.01;if(running)toast(p===0?'⏳ Sem cidade e sem exército! Construa um Centro Urbano em 2 minutos.':'🏁 Um reino ficou sem cidade e sem exército: mais 2 minutos e ele cai.')}
    else if(G.t-P.grace>=GRACE_T)out[p]=true}
  if(out[0])return endGame(false,'Seu reino caiu.');
  let allFoesOut=true;for(let p=1;p<NP;p++)if(!out[p]&&!ally(p,0)){allFoesOut=false;break}
  if(allFoesOut)return endGame(true,NP===2?'Você derrotou o reino dos '+civOf(1).n+'!':'Você derrotou todos os reinos inimigos!');
  G.revealAI=NP===2&&!G.B.some(b=>!b.dead&&b.o===1&&b.type==='tc')&&!G.U.some(u=>!u.dead&&u.o===1&&u.type==='vill');
  const conq=G.cfg&&G.cfg.vic==='conq';
  for(let o=0;o<NP&&!conq;o++){const w=G.B.find(b=>!b.dead&&b.o===o&&b.type==='maravilha'&&b.done>=1);if(w){G.won[o]+=1;if(G.won[o]>=WONDER_T)return endGame(ally(o,0),o===0?'Sua Maravilha resistiu ao tempo!':ally(o,0)?'A Maravilha do seu aliado resistiu ao tempo!':'A Maravilha inimiga resistiu 5 minutos.')}else G.won[o]=0}
  // vitória por território: 65% da terra por 3 minutos
  for(let o=0;o<NP&&!conq;o++){if(domShare(o)>=TERR_WIN){G.tw[o]=(G.tw[o]||0)+1;if(G.tw[o]===1&&running)toast(o===0?'🗺 Você domina 65% da terra! Segure por 3 minutos.':ally(o,0)?'🗺 Seu aliado domina 65% da terra! Ajude a segurar por 3 minutos.':'⚠️ O inimigo domina 65% da terra! Tome cidades dele em 3 minutos.');
    if(G.tw[o]>=TERR_T)return endGame(ally(o,0),o===0?'Seu império dominou a terra!':ally(o,0)?'O império do seu aliado dominou a terra!':'O império inimigo dominou a terra.')}else G.tw[o]=0}
}
function goFull(){try{const d=document.documentElement;if(!document.fullscreenElement&&d.requestFullscreen)d.requestFullscreen({navigationUI:'hide'}).then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}).catch(()=>{})}catch(e){}
  try{if('wakeLock'in navigator)navigator.wakeLock.request('screen').catch(()=>{})}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.hidden){saveGame();if(running&&!paused)openPause();if(AC)AC.suspend()}else{if(AC&&OPT.mus)AC.resume();if(running){try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{})}catch(e){}}}});
document.addEventListener('pointerdown',()=>{if(!running&&OPT.mus)musicStart()},{once:true});

// =========================================================
//   LAÇO PRINCIPAL
// =========================================================
let last=0,acc={vis:0,ai:0,hud:0,end:0,save:0,mm:0,city:0};
function step(dt){
  G.t+=dt;pathBudget=6;wxTick(dt);seasonCheck();
  rebuildBuckets();
  for(const u of G.U)if(!u.dead)updUnit(u,dt);
  separate();
  for(const b of G.B)if(!b.dead)updBld(b,dt);
  updProj(dt);
  ronTick(dt);
  for(const f of G.fx)f.t+=dt;
  for(const r of G.R)if(r.walk&&!r.dead){r.amt-=dt*.08;if(r.amt<=0)kill(r)}
  if(G.fx.length>80||G.fx.some(f=>f.t>25))G.fx=G.fx.filter(f=>f.t<(f.k==='rubble'?25:f.k==='corpse'?12:f.k==='missile'?(f.T||4)+.1:f.k==='nukefx'?9:2));
  if(G.dirty){G.U=G.U.filter(u=>!u.dead);G.B=G.B.filter(b=>!b.dead);G.R=G.R.filter(r=>!r.dead);G.dirty=false}
  if(UI.mk)UI.mk.t+=dt;
  if(domDirty)calcDom();
  acc.city+=dt;if(acc.city>=.5){updCities(acc.city);acc.city=0}
  acc.vis+=dt;if(acc.vis>.25){acc.vis=0;updVis()}
  acc.ai+=dt;if(acc.ai>1){acc.ai=0;for(let p=1;p<NP;p++)aiTick(p);recountPop()}
  acc.end+=dt;if(acc.end>1){acc.end=0;checkEnd()}
}
function frame(ts){
  requestAnimationFrame(frame);
  const minDt=OPT.eco?1000/31:1000/61;
  if(ts-last<minDt)return;
  const rdt=Math.min(.1,(ts-last)/1000);last=ts;
  pollPad(rdt);
  if(!running||!G)return;
  if(!paused){let t=rdt*OPT.spd;while(t>0){const d=Math.min(.05,t);step(d);t-=d;if(!running)return}}
  render();
  acc.mm+=rdt;if(acc.mm>.3){acc.mm=0;drawMM()}
  acc.hud+=rdt;if(acc.hud>.25){acc.hud=0;updHUD()}
  acc.save+=rdt;if(acc.save>30){acc.save=0;saveGame()}
}
buildResIcons();
resize();show('menu');
requestAnimationFrame(frame);
$('bcont').style.display=hasSave()?'flex':'none';
if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__RA={get G(){return G},step,aiTick,newGame,startGame,getE,cam:()=>({x:camX,y:camY,z:Z}),sel:()=>SEL,plc:()=>placing,setCam:(x,y,z)=>{camX=x;camY=y;if(z)Z=z},updVis,render,drawMM,w2s,recompute};
window.__padState=()=>PAD;
// ---------- botão de atualizar: limpa a cópia guardada e baixa a versão nova ----------
const VERSAO='Versão 51';$('ver').textContent=VERSAO;
$('bupd').onclick=async()=>{snd('click');const t=$('updt');
  if(!navigator.onLine){t.textContent='📶 Sem internet. Ligue os dados ou o Wi-Fi e tente de novo.';return}
  t.textContent='🔄 Procurando a versão nova...';
  try{const r=await fetch('sw.js?'+Date.now(),{cache:'no-store'});if(!r.ok)throw 0}catch(e){t.textContent='📶 Não consegui falar com o servidor. Tente de novo com internet.';return}
  try{if(running)saveGame();if(navigator.serviceWorker&&navigator.serviceWorker.getRegistrations){for(const g of await navigator.serviceWorker.getRegistrations())await g.unregister()}if(window.caches)for(const k of await caches.keys())await caches.delete(k)}catch(e){}
  t.textContent='✅ Atualizando...';setTimeout(()=>location.reload(),300)};

// ---------- multijogador: ainda trancado (virá na versão completa) ----------
$('bmulti').onclick=()=>{snd('click');$('multit').textContent='🔒 Será liberado numa atualização futura, na versão completa (paga). Por enquanto: jogue contra o computador!'};
