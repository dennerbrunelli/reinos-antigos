
// =========================================================
//   SOM REFEITO DO ZERO (Versão 73)
//   O motor antigo (Web Audio) ficava mudo no celular do Denner. Este usa o tocador de áudio comum
//   do Android, o mesmo de qualquer site de música: cada som é um arquivo MP3 próprio em assets/audio.
//   Os sons que eram desenhados pelo código foram gravados em arquivo também. Nada depende mais do motor antigo.
// =========================================================
const A2={man:{"alert":["fx_alert1"],"arrow":["fx_arrow1"],"chop":["fx_chop1"],"clash":["fx_clash1"],"click":["fx_click1","fx_click2","fx_click3"],"coin":["fx_coin1"],"collapse":["fx_collapse1"],"die":["fx_die1"],"done":["fx_done1"],"hammer":["fx_hammer1"],"mine":["fx_mine1"],"sel":["fx_sel1"],"age":["fx_age1"],"boom":["fx_boom1"],"unit":["fx_unit1"],"bell":["fx_bell1"],"bleat":["fx_bleat1"],"catapult":["fx_catapult1"],"chant":["fx_chant1"],"convert":["fx_convert1"],"flesh":["fx_flesh1"],"hoe":["fx_hoe1"],"knife":["fx_knife1"],"leaves":["fx_leaves1"],"lose":["fx_lose1"],"roar":["fx_roar1"],"sink":["fx_sink1"],"splash":["fx_splash1"],"stomp":["fx_stomp1"],"throw":["fx_throw1"],"thud":["fx_thud1"],"thunder":["fx_thunder1"],"trumpet":["fx_trumpet1"]},url:{},pool:[],last:{},ok:0,fail:0,err:'',loaded:0,total:0,need:false,mus:{},musOn:false,timer:0,war:0};
const A2ALIAS={bow:'arrow',shot:'boom',place:'hammer',hitb:'clash',hit:'clash',win:'age'};
const A2VOL={click:.45,sel:.5,chop:.5,mine:.5,hoe:.55,hammer:.5,leaves:.5,flesh:.55,splash:.55,thud:.6,knife:.5,coin:.65,clash:.6,hit:.4,hitb:.55,arrow:.55,bow:.55,die:.6,stomp:.7,throw:.5,bleat:.5,done:.8,unit:.75,age:.95,win:.95,lose:.9,alert:.9,boom:.9,shot:.8,collapse:.9,bell:.9,thunder:.8};
if(OPT.vfx==null)OPT.vfx=1;if(OPT.vmu==null)OPT.vmu=.6;
function a2Src(n){return A2.url[n]||('assets/audio/'+n+'.mp3')}
function a2Load(){if(A2.total)return;const names=[].concat(...Object.values(A2.man),['mus_paz','mus_guerra']);A2.total=names.length;
  for(const n of names)fetch('assets/audio/'+n+'.mp3').then(r=>r.ok?r.blob():Promise.reject(new Error('http '+r.status))).then(b=>{A2.url[n]=URL.createObjectURL(new Blob([b],{type:'audio/mpeg'}));A2.loaded++;if(n.startsWith('mus_')&&A2.musOn)a2MusEl(n.slice(4))}).catch(e=>{A2.err='arquivo '+n+': '+(e&&e.message||e)})}
function a2El(name){const now=performance.now();let best=null;
  for(const p of A2.pool)if(!p.bl&&p.name===name&&(p.el.paused||p.el.ended)){best=p;break}
  if(!best&&A2.pool.length<10){best={el:new Audio(),name:'',t:0};best.el.preload='auto';A2.pool.push(best)}
  if(!best)for(const p of A2.pool)if(!p.bl&&(p.el.paused||p.el.ended)){best=p;break}
  if(!best){best=A2.pool[0];for(const p of A2.pool)if(p.t<best.t)best=p}
  if(best.name!==name||best.src!==a2Src(name)){best.name=name;best.src=a2Src(name);best.el.src=best.src}
  best.t=now;return best.el}
function a2Play(k,vol,rate){const key=A2.man[k]?k:A2ALIAS[k];const vs=key&&A2.man[key];if(!vs)return false;
  let i=(Math.random()*vs.length)|0;if(vs.length>1&&i===A2.last[key])i=(i+1)%vs.length;A2.last[key]=i;
  const el=a2El(vs[i]);try{el.pause();el.currentTime=0}catch(e){}
  el.volume=clamp((vol==null?1:vol)*(A2VOL[k]||A2VOL[key]||.8)*OPT.vfx,0,1);try{el.preservesPitch=false;el.playbackRate=rate||1}catch(e){}
  const p=el.play();if(p&&p.then)p.then(()=>{A2.ok++;if(A2.err==='NotAllowedError')A2.err=''}).catch(e=>{A2.fail++;A2.err=e&&e.name||'erro';if(e&&e.name==='NotAllowedError')A2.need=true});else A2.ok++;return true}
// ---------- efeitos ----------
snd=function(k,e){
  if(k&&COMBAT_SND[k]&&(!e||e.o!==GAIA))MUSH=Math.min(1,MUSH+COMBAT_SND[k]*.1);
  if(!OPT.snd||!k)return;let vol=1;
  if(e&&running){const p=w2s(e.x,e.y);if(p.x<-60||p.x>VW+60||p.y<TOPH-30||p.y>VH+30)return;
    const dc=hyp(p.x-VW/2,p.y-VH/2)/Math.max(VW,VH);vol=clamp(1.05-dc*.9,.45,1)*clamp(.55+Z*.45,.6,1)}
  const now=performance.now(),wk=WORKSND[k],gap=wk?wk:Math.max(SGAP[k]||60,90);
  if(lastSnd[k]&&now-lastSnd[k]<gap)return;
  if(wk){if(now-lastWork<420)return;lastWork=now;vol*=.7}
  lastSnd[k]=now;a2Load();
  a2Play(k,vol,wk?[1,.97,1.03][(Math.random()*3)|0]:1+(Math.random()-.5)*.08)};
audio=function(){return null};// o motor antigo fica desligado
thunder=function(){if(OPT.snd){a2Load();a2Play('thunder',.6+Math.random()*.4,.85+Math.random()*.3)}};
bellSnd=function(){if(OPT.snd){a2Load();a2Play('bell',1,1)}};
// ---------- música: paz e guerra, misturadas pelo "calor" da partida ----------
function a2MusEl(k){let m=A2.mus[k];if(!m){m=A2.mus[k]={el:new Audio(),v:0,src:''};m.el.loop=true;m.el.preload='auto';m.el.volume=0}
  const s=a2Src('mus_'+k);if(m.src!==s){const t=m.el.currentTime||0,was=!m.el.paused;m.src=s;m.el.src=s;try{if(t)m.el.currentTime=t}catch(e){}if(was)a2MusPlay(k)}return m}
function a2MusPlay(k){const m=a2MusEl(k);if(!m.el.paused)return;const p=m.el.play();if(p&&p.catch)p.catch(e=>{if(e&&e.name==='AbortError')return;A2.err='música: '+(e&&e.name||'erro');if(e&&e.name==='NotAllowedError')A2.need=true})}
musicStart=function(){if(!OPT.mus||A2.musOn)return;A2.musOn=true;MUS.on=true;a2Load();a2MusPlay('paz');clearInterval(A2.timer);A2.timer=setInterval(musicTick,200)};
musicStop=function(){A2.musOn=false;MUS.on=false;clearInterval(A2.timer);for(const k in A2.mus){A2.mus[k].el.pause();A2.mus[k].v=0;A2.mus[k].el.volume=0}};
musicTick=function(){if(!A2.musOn)return;MUSH=Math.max(0,MUSH-.01);
  const mk=moodNow();MUS.mood=mk;const h=Math.min(1,MUSH*1.4+(mk==='crise'?.7:mk==='corrida'?.35:0));
  const alvo=clamp((h-.25)/.45,0,1);A2.war+=(alvo-A2.war)*.08;if(Math.abs(alvo-A2.war)<.01)A2.war=alvo;
  const base=OPT.vmu*(document.hidden?0:1);
  const P=a2MusEl('paz');P.el.volume=clamp(base*(1-A2.war*.92),0,1);if(P.el.paused&&!document.hidden)a2MusPlay('paz');
  if(A2.war>.02){const W=a2MusEl('guerra');W.el.volume=clamp(base*A2.war,0,1);if(W.el.paused&&!document.hidden)a2MusPlay('guerra')}
  else if(A2.mus.guerra&&!A2.mus.guerra.el.paused)A2.mus.guerra.el.pause()};
document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const k in A2.mus)A2.mus[k].el.pause();for(const p of A2.pool)p.el.pause()}else if(A2.musOn)a2MusPlay('paz')});
// o navegador só deixa tocar depois de um toque na tela: qualquer toque libera e religa o que faltou
// alguns Androids exigem que cada tocador seja "liberado" dentro de um toque: libera os 10 de uma vez, em silêncio
function a2Bless(){if(A2.blessed)return;A2.blessed=true;while(A2.pool.length<10){const p={el:new Audio(),name:'',t:0};p.el.preload='auto';A2.pool.push(p)}
  for(const p of A2.pool){if(!p.el.paused)continue;p.bl=1;p.name='fx_click1';p.src=a2Src('fx_click1');p.el.src=p.src;p.el.muted=true;
    const fim=()=>{try{p.el.pause();p.el.currentTime=0}catch(e){}p.el.muted=false;p.bl=0};const q=p.el.play();if(q&&q.then)q.then(fim).catch(()=>{p.el.muted=false;p.bl=0;A2.blessed=false});else fim()}}
for(const ev of['pointerdown','touchend','keydown'])document.addEventListener(ev,()=>{a2Load();a2Bless();if(OPT.mus&&!A2.musOn&&!running)musicStart();if(A2.need){A2.need=false;if(A2.musOn)a2MusPlay('paz')}},{passive:true});
// ---------- teste e volumes (em Opções) ----------
sndReport=function(){const mp=A2.mus.paz&&!A2.mus.paz.el.paused;
  return'Arquivos: '+A2.loaded+' de '+A2.total+' · Efeitos tocados: '+A2.ok+(A2.fail?' (falhas '+A2.fail+')':'')+' · Música: '+(!OPT.mus?'desligada':mp?'✅ tocando':'⏸ parada')+(A2.err?' · aviso: '+A2.err:'')+
    (A2.ok&&!A2.fail?'<br><b>Se aqui está ✅ e você não ouve nada:</b> aperte o botão de volume do celular, toque nos três pontinhos e suba o volume de <b>Mídia</b>. Confira também se há fone Bluetooth ligado.':'')};
{const b=$('bsndt');if(b){b.onclick=()=>{let mudou='';if(!OPT.snd){OPT.snd=1;mudou+=' · efeitos LIGADOS'}if(!OPT.mus){OPT.mus=1;mudou+=' · música LIGADA'}if(mudou){saveOpt();try{updOptBtns()}catch(e){}}
    a2Load();musicStart();a2Play('done',1,1);setTimeout(()=>a2Play('age',1,1),500);setTimeout(()=>{$('sndtt').innerHTML=sndReport()+mudou},1300)};
  const mk=(id,ic,key,nm)=>{const v=document.createElement('button');v.className='mb mi';v.id=id;const lv=[[1,'Alto'],[.6,'Médio'],[.3,'Baixo']];
    const upd=()=>{const c=lv.reduce((a,x)=>Math.abs(x[0]-OPT[key])<Math.abs(a[0]-OPT[key])?x:a,lv[0]);v.innerHTML='<b>'+ic+'</b><span>'+nm+': '+c[1]+'<small>Toque para mudar</small></span>'};upd();
    v.onclick=()=>{const i=lv.findIndex(x=>Math.abs(x[0]-OPT[key])<.05);OPT[key]=lv[(i+1)%lv.length][0];saveOpt();upd();if(key==='vfx')a2Play('coin',1,1);else musicTick()};
    b.after(v);v.style.display=b.style.display;new MutationObserver(()=>{v.style.display=b.style.display}).observe(b,{attributes:true,attributeFilter:['style']});return v};
  mk('bvmu','🎵','vmu','Volume da música');mk('bvfx','🔊','vfx','Volume dos efeitos')}}
