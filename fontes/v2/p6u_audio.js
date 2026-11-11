
// =========================================================
//   SONS GRAVADOS (Versão 63): efeitos e música feitos no ElevenLabs
//   Todos os efeitos ficam num arquivo só (assets/som/efeitos.ogg), um atrás do outro;
//   SFXMAP diz onde começa e quanto dura cada um. Cada efeito tem 1 a 3 variações,
//   sorteadas a cada toque (como nos jogos clássicos, pra não cansar o ouvido).
//   Se o arquivo não carregar, o jogo continua com os sons gerados pelo código.
// =========================================================
const SFXMAP=/*SFXMAP*/{}/*FIM*/;
const SFXALIAS={bow:'arrow',shot:'boom',place:'hammer',hitb:'clash',hit:'clash',win:'age'};
const SFXVOL={click:.55,sel:.6,coin:.7,chop:.75,mine:.75,hammer:.75,clash:.7,arrow:.7,die:.7};
const SFX={buf:null,tried:false,last:{}};
const MUSF={paz:null,guerra:null,src:{},g:{},on:false,tried:false};
function sfxLoad(){if(SFX.tried||!AC)return;SFX.tried=true;
  fetch('assets/som/efeitos.ogg').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(a=>new Promise((ok,no)=>AC.decodeAudioData(a,ok,no))).then(b=>{SFX.buf=b}).catch(()=>{});
  for(const k of['paz','guerra'])fetch('assets/som/m_'+k+'.ogg').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(a=>new Promise((ok,no)=>AC.decodeAudioData(a,ok,no))).then(b=>{MUSF[k]=b;if(MUS.on)musFileStart()}).catch(()=>{})}
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
  if(MG)MG.gain.setTargetAtTime(.32,AC.currentTime,.6)}}
