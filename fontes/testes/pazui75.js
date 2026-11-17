const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
 const pg=await b.newPage({viewport:{width:800,height:360},deviceScaleFactor:1.5,hasTouch:true});
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(400);
 await pg.evaluate(()=>{$('bnew').click()});await pg.waitForTimeout(400);
 const has=await pg.evaluate(()=>!!$('qbpz')&&$('qbpz').textContent);console.log('row',has);
 await pg.evaluate(()=>{const r=$('qbpz');r.scrollIntoView()});await pg.screenshot({path:'pz_qb.png'});
 await pg.evaluate(()=>$('qbpz').click());await pg.waitForTimeout(200);await pg.screenshot({path:'pz_pick.png'});
 await pg.evaluate(()=>document.querySelector('#pzpick [data-v="10"]').click());await pg.waitForTimeout(200);
 console.log('val',await pg.evaluate(()=>SETUP.paz+' '+$('qbpz').textContent));
 await pg.evaluate(()=>$('bstart').click());await pg.waitForTimeout(2500);
 await pg.evaluate(()=>{running=true;for(let i=0;i<8;i++)step(.25)});await pg.waitForTimeout(600);
 console.log('jogo',await pg.evaluate(()=>JSON.stringify(G.pz)+' '+$('pzc').textContent));
 await pg.screenshot({path:'pz_game.png'});
 await pg.evaluate(()=>$('pzc').click());await pg.waitForTimeout(300);await pg.screenshot({path:'pz_dip.png'});
 // salvar e carregar mantém a paz
 console.log('load',await pg.evaluate(()=>{saveGame();const t=G.pz.t;loadGame();return JSON.stringify(G.pz)+' '+peace(0,1)}));
 console.log('ERROS',errs.slice(0,8));await b.close()})();
