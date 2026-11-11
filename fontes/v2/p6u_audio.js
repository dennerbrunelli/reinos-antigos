
// =========================================================
//   SONS GRAVADOS (Versão 63): efeitos e música feitos no ElevenLabs
//   Todos os efeitos ficam num arquivo só (assets/som/efeitos.ogg), um atrás do outro;
//   SFXMAP diz onde começa e quanto dura cada um. Cada efeito tem 1 a 3 variações,
//   sorteadas a cada toque (como nos jogos clássicos, pra não cansar o ouvido).
//   Se o arquivo não carregar, o jogo continua com os sons gerados pelo código.
// =========================================================
const SFXMAP=/*SFXMAP*/{"age":[[0.0,0.8214]],"alert":[[1.1214,1.2916]],"arrow":[[2.713,0.4586]],"chop":[[3.4716,0.8]],"clash":[[4.5716,0.5689]],"click":[[5.4405,0.0987],[5.8392,0.1074],[6.2466,0.3425]],"coin":[[6.8891,1.0]],"collapse":[[8.1891,1.6602]],"die":[[10.1493,1.2]],"done":[[11.6493,0.3773]],"hammer":[[12.3266,0.7]],"mine":[[13.3266,0.9]],"sel":[[14.5266,0.7]]}/*FIM*/;
const SFXALIAS={bow:'arrow',shot:'boom',place:'hammer',hitb:'clash',hit:'clash',win:'age'};
const SFXVOL={click:.55,sel:.6,coin:.7,chop:.75,mine:.75,hammer:.75,clash:.7,arrow:.7,die:.7};
const SFX={buf:null,tried:false,last:{}};
const MUS_FILES=['paz']; // a de guerra entra aqui quando o arquivo m_guerra.ogg existir
const MUSF={paz:null,guerra:null,src:{},g:{},on:false,tried:false};
function sfxLoad(){if(SFX.tried||!AC)return;SFX.tried=true;
  fetch('assets/som/efeitos.ogg').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(a=>new Promise((ok,no)=>AC.decodeAudioData(a,ok,no))).then(b=>{SFX.buf=b}).catch(()=>{});
  for(const k of MUS_FILES)fetch('assets/som/m_'+k+'.ogg').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(a=>new Promise((ok,no)=>AC.decodeAudioData(a,ok,no))).then(b=>{MUSF[k]=b;if(MUS.on)musFileStart()}).catch(()=>{})}
// toca o efeito gravado; devolve false se não tiver (aí o código desenha o som como antes)
function sfxPlay(k,out,r){const key=SFXMAP[k]?k:SFXALIAS[k];const vs=key&&SFXMAP[key];if(!SFX.buf||!vs||!vs.length)return false;
  let i=(Math.random()*vs.length)|0;if(vs.length>1&&i===SFX.last[key])i=(i+1)%vs.length;SFX.last[key]=i;
  const[s,d]=vs[i],src=AC.createBufferSource(),g=AC.createGain();src.buffer=SFX.buf;
  src.playbackRate.value=k==='bow'||k==='hit'?1.12:r; // pequena variação de tom a cada toque
  g.gain.value=(SFXVOL[key]||.85)*(k==='hit'?.6:1);src.connect(g);g.connect(out);src.start(AC.currentTime,s,d);return true}
// música gravada: as duas faixas tocam juntas em laço e o "calor" da partida decide quanto se ouve de cada uma
function musFileStart(){if(!MUS.on||MUSF.on||!MUSF.paz||!AC)return;MUSF.on=true;
  for(const[o,g]of MUS.dr||[]){try{g.gain.setTargetAtTime(.0001,AC.currentTime,.3);o.stop(AC.currentTime+1.5)}catch(e){}}MUS.dr=[];
  for(const k of['paz','guerra']){if(!MUSF[k])continue;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=MUSF[k];s.loop=true;
    g.gain.value=.0001;g.gain.setTargetAtTime(k==='paz'?1:.0001,AC.currentTime,1.2);s.connect(g);g.connect(MG);s.start();MUSF.src[k]=s;MUSF.g[k]=g}}
function musFileStop(){if(!MUSF.on)return;MUSF.on=false;for(const k in MUSF.src){try{MUSF.g[k].gain.setTargetAtTime(.0001,AC.currentTime,.4);MUSF.src[k].stop(AC.currentTime+2)}catch(e){}}MUSF.src={};MUSF.g={}}
{const aOld=audio;audio=function(){const a=aOld();if(a&&!SFX.tried)sfxLoad();return a}}
{const mOld=musicStart;musicStart=function(){mOld();if(MUS.on&&MUSF.paz)musFileStart()}}
{const sOld=musicStop;musicStop=function(){musFileStop();sOld()}}
{const tOld=musicTick;musicTick=function(){
  if(!MUSF.on)return tOld();
  if(!AC||!MUS.on)return;
  MUSH=Math.max(0,MUSH-.006);
  const mk=moodNow(),mood=MOODS[mk]||MOODS.paz;MUS.mood=mk;
  // guerra entra com briga perto, crise ou corrida de era; a paz volta sozinha quando acalma
  const h=Math.min(1,MUSH*1.4+(mk==='crise'?.7:mk==='corrida'?.35:0));
  const war=MUSF.g.guerra?clamp((h-.25)/.45,0,1):0;
  if(MUSF.g.paz)MUSF.g.paz.gain.setTargetAtTime(Math.max(.0001,1-war),AC.currentTime,1.5);
  if(MUSF.g.guerra)MUSF.g.guerra.gain.setTargetAtTime(Math.max(.0001,war*1.05),AC.currentTime,1.5);
  if(MG)MG.gain.setTargetAtTime(.32,AC.currentTime,.6);
  // sem a faixa de guerra ainda: tambores de guerra por cima da música quando a briga esquenta
  if(!MUSF.g.guerra){if(MUS.t<AC.currentTime)MUS.t=AC.currentTime+.05;
    while(MUS.t<AC.currentTime+.4){const t=MUS.t,b=MUS.beat%8,dt=t-AC.currentTime,v=clamp((h-.3)/.5,0,1);
      if(v>0){if(b===0||b===3||b===6)tone(88,.3,'sine',.3*v,44,dt,MG);if(b===4)noise(.08,.18*v,900,1.2,dt,MG);if(b%2===1)noise(.04,.08*v,2400,1.5,dt,MG,'highpass')}
      MUS.t+=60/132/2;MUS.beat++}}}}
