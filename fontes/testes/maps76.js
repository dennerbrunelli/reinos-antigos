const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:800,height:360}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(300);
 const r=await pg.evaluate(()=>{const out=[];for(const m of MAP_ORD)for(const [sz,np] of [['peq',2],['gig',8]]){try{__RA.newGame({civ:'gregos',map:m,size:sz,np,diff:'normal'});
   const tcs=G.B.filter(b=>b.type==='tc').length;let minD=1e9;const T=G.B.filter(b=>b.type==='tc');for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++)minD=Math.min(minD,hyp(T[i].tx-T[j].tx,T[i].ty-T[j].ty));
   out.push(m+' '+sz+' tcs='+tcs+'/'+np+' dist='+Math.round(minD))}catch(e){out.push(m+' '+sz+' ERRO '+e.message)}}return out});
 console.log(r.join('\n'));console.log('ERROS',errs.slice(0,4));await b.close()})();
