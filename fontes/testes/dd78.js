const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:800,height:360},deviceScaleFactor:1.5,hasTouch:true});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(300);
 await pg.evaluate(()=>{localStorage.setItem('imperio_dd','0');DDM=0;$('bnew').click()});await pg.waitForTimeout(300);await pg.evaluate(()=>{SETUP.np=4;$('bstart').click()});await pg.waitForTimeout(3000);
 await pg.evaluate(()=>{const P=G.P[0];P.age=2;Object.assign(P.res,{food:2000,wood:2000,gold:2000});for(let i=0;i<4*40;i++)step(.25);$('ptsl')._h='';ptsDraw();layoutHUD()});
 for(let m=0;m<5;m++){await pg.waitForTimeout(400);await pg.screenshot({path:'dd'+m+'.png'});await pg.evaluate(()=>$('ptsl').click())}
 console.log('ERROS',errs.slice(0,4));await b.close()})();
