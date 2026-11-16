const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=user-gesture-required']});const ctx=await b.newContext({...devices['Galaxy S9+ landscape']});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(1500);
 await pg.tap('#bnew');await pg.waitForTimeout(500);await pg.tap('#bstart');await pg.waitForTimeout(5000);
 await pg.evaluate(()=>AC.suspend());await pg.waitForTimeout(2000);
 console.log('badge visível:',await pg.evaluate(()=>$('sndfix')&&$('sndfix').style.display));
 await pg.tap('#sndfix');await pg.waitForTimeout(1500);
 console.log('depois:',await pg.evaluate(()=>({ac:AC.state,badge:$('sndfix').style.display,mus:Object.keys(MUSE).map(k=>MUSE[k].el.paused?'parado':'toca'),rep:sndReport()})));
 // simula áudio travado: troca o currentTime
 await pg.evaluate(()=>{AUD_STUCK=3;updSndBadge()});console.log('travado mostra:',await pg.evaluate(()=>$('sndfix').style.display));
 await pg.tap('#sndfix');await pg.waitForTimeout(1500);console.log('refeito:',await pg.evaluate(()=>({ac:AC.state,badge:$('sndfix').style.display,mus:Object.keys(MUSE).map(k=>MUSE[k].el.paused?'parado':'toca'),buf:!!SFX.buf})));
 console.log('ERROS',errs);await b.close()})();
