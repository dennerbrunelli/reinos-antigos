const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:800,height:360},deviceScaleFactor:1.5,hasTouch:true});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(300);
 await pg.evaluate(()=>{$('bnew').click()});await pg.waitForTimeout(300);await pg.evaluate(()=>$('bstart').click());await pg.waitForTimeout(3000);
 await pg.evaluate(()=>{const P=G.P[0];P.age=2;Object.assign(P.res,{food:3000,wood:3000,gold:3000,wealth:900,know:900});const tc=G.B.find(b=>b.o===0&&b.type==='tc');
   let q=null;for(let r=5;r<14&&!q;r++)for(let a=0;a<16&&!q;a++){const X=tc.tx+Math.round(Math.cos(a/16*6.28)*r),Y=tc.ty+Math.round(Math.sin(a/16*6.28)*r);let ok=!domWhy('quartel',X,Y,0);for(let y=Y;y<Y+3;y++)for(let x=X;x<X+3;x++){const i=idx(x,y);if(!pass[i]||occ[i]||G.terr[i])ok=false}if(ok){q=placeBld('quartel',0,X,Y,true);q.done=1}}
   window._q=q;SEL=[q.id];const c=ctr(q);centerOn(c.x,c.y);UI.sig='';updHUD(true)});
 await pg.waitForTimeout(800);await pg.screenshot({path:'q76.png'});
 await pg.evaluate(()=>{const v=G.U.find(u=>u.o===0&&u.type==='vill');SEL=[v.id];UI.page=0;UI.sig='';updHUD(true)});await pg.waitForTimeout(500);await pg.screenshot({path:'v76.png'});
 console.log('ERROS',errs.slice(0,4));await b.close()})();
