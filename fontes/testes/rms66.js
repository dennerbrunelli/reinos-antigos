const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const pg=await b.newPage({viewport:{width:800,height:360},hasTouch:true,isMobile:true});
 await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(1200);await pg.tap('#bnew');await pg.waitForTimeout(800);await pg.tap('#bstart');await pg.waitForTimeout(7000);
 const r=await pg.evaluate(async()=>{const an=AC.createAnalyser();an.fftSize=2048;CMP.connect(an);const d=new Float32Array(2048);const out=[];
   for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,300));an.getFloatTimeDomainData(d);let s=0;for(const x of d)s+=x*x;out.push(Math.sqrt(s/d.length).toFixed(4))}
   snd('done');await new Promise(r=>setTimeout(r,150));an.getFloatTimeDomainData(d);let s=0;for(const x of d)s+=x*x;out.push('efeito '+Math.sqrt(s/d.length).toFixed(4));return out});
 console.log(r.join(' '));await b.close()})();
