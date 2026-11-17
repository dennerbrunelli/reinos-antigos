const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(300);
 const r=await pg.evaluate(()=>{__RA.newGame({civ:'gregos',map:'terra',size:'gra',np:3,diff:'normal'});__RA.startGame();running=false;
  const out={};const P=G.P[0];
  const tc=G.B.find(b=>b.o===0&&b.type==='tc');
  for(const age of [0,3,7]){P.age=age;const ag={};
   // aldeão: 3 páginas
   const v=G.U.find(u=>u.o===0&&u.type==='vill');SEL=[v.id];
   for(let p=0;p<3;p++){UI.page=p;ag['vill'+p]=getCmds().map(c=>c.nm+(c.lock?'🔒':''))}
   for(const t in BT){let b=G.B.find(x=>x.o===0&&x.type===t&&!x.dead);
     if(!b){let ok=false;for(let r=8;r<40&&!ok;r++)for(let a=0;a<24&&!ok;a++){const X=tc.tx+Math.round(Math.cos(a/24*6.28)*r),Y=tc.ty+Math.round(Math.sin(a/24*6.28)*r);
       try{if(t==='doca')continue;b=placeBld(t,0,X,Y,true);if(b){b.done=1;ok=true}}catch(e){}}}
     if(!b){ag[t]='(não coloquei)';continue}
     SEL=[b.id];try{ag[t]=getCmds().map(c=>c.nm+(c.lock?'🔒':''))}catch(e){ag[t]='ERRO '+e.message}}
   out['era'+age]=ag}
  return out});
 require('fs').writeFileSync('dump76b.json',JSON.stringify(r,null,1));console.log('ERROS',errs.slice(0,5));await b.close()})();
