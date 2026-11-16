const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});
 const keys=['leaves','hoe','flesh','splash','thud','stomp','knife','throw','catapult','bleat','roar','trumpet','sink','convert','chant','lose','BELL','THUNDER'];
 fs.mkdirSync('/home/claude/trab/synth',{recursive:true});
 for(const k of keys){const r=await pg.evaluate(async(k)=>{
   AC=null;SFX.tried=true;SFX.buf=null;for(const x in lastSnd)delete lastSnd[x];lastWork=0;OPT.snd=1;running=false;
   const Real=window.AudioContext;window.AudioContext=function(){return new OfflineAudioContext(2,48000*5,48000)};window.webkitAudioContext=window.AudioContext;
   try{if(k==='BELL')bellSnd();else if(k==='THUNDER')thunder();else snd(k)}catch(e){return 'ERR '+e.message}
   const ctx=AC;window.AudioContext=Real;if(!ctx)return 'ERR sem contexto';
   const buf=await ctx.startRendering();AC=null;const L=buf.getChannelData(0),R=buf.getChannelData(1);const m=new Float32Array(L.length);let pk=0;for(let i=0;i<L.length;i++){m[i]=(L[i]+R[i])/2;pk=Math.max(pk,Math.abs(m[i]))}
   const u=new Uint8Array(m.buffer);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return pk.toFixed(4)+'|'+btoa(s)},k);
  if(r.startsWith('ERR')){console.log(k,r);continue}
  const [pk,b64]=r.split('|');fs.writeFileSync('/home/claude/trab/synth/'+k.toLowerCase()+'.f32',Buffer.from(b64,'base64'));console.log(k,'pico',pk)}
 await b.close()})();
