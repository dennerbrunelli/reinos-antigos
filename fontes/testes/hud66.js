const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const pg=await b.newPage({viewport:{width:800,height:360},deviceScaleFactor:2,hasTouch:true,isMobile:true});
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(500);
 await pg.evaluate(()=>{__RA.newGame({civ:'russos',map:'terra',diff:'facil',size:'med',np:2});__RA.startGame();OPT.snd=false;OPT.mus=false});await pg.waitForTimeout(2500);
 await pg.evaluate(()=>{const t=G.B.find(b=>b.o===0&&b.type==='tc');G.P[0].res.food=999;t.q.push('vill','vill','vill');t.qt=5;SEL=[t.id];HS.p.obj.min=false;layoutHUD();updHUD(true)});await pg.waitForTimeout(500);await pg.screenshot({path:'/home/claude/trab/hud_tc.png'});
 await pg.evaluate(()=>{const v=G.U.find(u=>u.o===0&&u.type==='vill');SEL=[v.id];updHUD(true)});await pg.waitForTimeout(400);await pg.screenshot({path:'/home/claude/trab/hud_vill.png'});
 console.log('ERROS',errs.slice(0,5));await b.close()})();
