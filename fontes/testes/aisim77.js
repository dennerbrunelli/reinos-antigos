const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(300);
 const r=await pg.evaluate(()=>{__RA.newGame({civ:'gregos',map:'terra',size:'gra',np:4,diff:'normal'});__RA.startGame();running=true;OPT.snd=false;
  const log=[];for(let i=0;i<4*1500;i++){step(.25);if(i%(4*300)===0||i===4*1500-1){log.push(Math.round(G.t)+'s '+[1,2,3].map(p=>{const P=G.P[p];return 'P'+p+':era'+P.age+' v'+G.U.filter(u=>u.o===p&&u.type==='vill'&&!u.dead).length+' tec'+P.techs.length+' mil'+dipStr(p)}).join(' '))}}
  const cnt={};for(const b of G.B)if(b.o===1&&!b.dead)cnt[b.type]=(cnt[b.type]||0)+1;log.push('predios P1 '+JSON.stringify(cnt));log.push('techs P1 '+G.P[1].techs.join(','));
  const ut={};for(const u of G.U)if(u.o<NP&&!u.dead)ut[u.type]=(ut[u.type]||0)+1;log.push('unidades '+JSON.stringify(ut));log.push('gather '+JSON.stringify((()=>{const c={};for(const u of G.U)if(u.o===1&&u.type==='vill')c[u.st+':'+u.lsub]=(c[u.st+':'+u.lsub]||0)+1;return c})()));
  return log});
 console.log(r.join('\n'));console.log('ERROS',errs.slice(0,6));await b.close()})();
