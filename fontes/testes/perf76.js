const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:800,height:360}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(300);
 for(const [sz,np] of [['peq',2],['med',4],['gra',6],['gig',8]]){
 const r=await pg.evaluate(([sz,np])=>{const t0=performance.now();__RA.newGame({civ:'gregos',map:'terra',size:sz,np,diff:'normal'});__RA.startGame();running=true;OPT.snd=false;const tg=performance.now()-t0;
  for(let i=0;i<4*240;i++)step(.25);const t1=performance.now();for(let i=0;i<4*60;i++)step(.25);const ms=(performance.now()-t1)/240;
  return sz+' MW='+MW+' gerar='+Math.round(tg)+'ms passo='+ms.toFixed(2)+'ms unidades='+G.U.length+' predios='+G.B.length+' recursos='+G.R.length},[sz,np]);console.log(r)}
 console.log('ERROS',errs.slice(0,4));await b.close()})();
