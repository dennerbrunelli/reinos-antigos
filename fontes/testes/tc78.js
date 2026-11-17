const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:800,height:360},deviceScaleFactor:1.5,hasTouch:true});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(300);
 await pg.evaluate(()=>{$('bnew').click()});await pg.waitForTimeout(300);await pg.evaluate(()=>$('bstart').click());await pg.waitForTimeout(3000);
 const r=await pg.evaluate(()=>{calcDom();const out={};const tc=G.B.find(b=>b.o===0&&b.type==='tc');const P=G.P[0];P.age=1;Object.assign(P.res,{food:2000,wood:2000,gold:2000});
  let ok=0,tot=0,why={};for(let y=tc.ty-20;y<tc.ty+20;y++)for(let x=tc.tx-20;x<tc.tx+20;x++){if(!inMap(x,y))continue;const w=domWhy('tc',x,y,0);tot++;if(!w&&validSite('tc',x,y,0,0))ok++;else{const k=(w||'terreno/ocupado').slice(0,30);why[k]=(why[k]||0)+1}}
  out.okSpots=ok;out.why=why;
  // constrói uma e confere a nova fronteira
  let s=null;for(let y=tc.ty-20;y<tc.ty+20&&!s;y++)for(let x=tc.tx-20;x<tc.tx+20&&!s;x++)if(inMap(x,y)&&validSite('tc',x,y,0,0))s=[x,y];
  if(!s)return out;const d0=DOMCNT[0];const n=placeBld('tc',0,s[0],s[1],true);n.done=1;calcDom();out.newCity='dist '+Math.round(hyp(s[0]-tc.tx,s[1]-tc.ty))+' terra '+d0+'→'+DOMCNT[0];
  out.score=JSON.stringify(scoreOf(0));
  return out});
 console.log(JSON.stringify(r,null,1));
 await pg.evaluate(()=>{for(let i=0;i<12;i++)step(.25);ptsDraw();layoutHUD()});await pg.waitForTimeout(500);await pg.screenshot({path:'pts_livre.png'});
 await pg.evaluate(()=>{HS=hudDefault('rise');hudSave();layoutHUD();$('ptsl')._h='';ptsDraw()});await pg.waitForTimeout(500);await pg.screenshot({path:'pts_rise.png'});
 await pg.evaluate(()=>{HS=hudDefault('livre');hudSave();const v=G.U.find(u=>u.o===0&&u.type==='vill');SEL=[v.id];startPlace('tc');layoutHUD()});await pg.waitForTimeout(500);await pg.screenshot({path:'tc_place.png'});
 console.log('ERROS',errs.slice(0,4));await b.close()})();
