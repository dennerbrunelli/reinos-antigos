const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:800,height:360}});
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});
 const r=await pg.evaluate(()=>{__RA.newGame({civ:'gregos',map:'terra',diff:'facil',size:'med'});__RA.startGame();OPT.snd=false;const s=G.starts[0];const out={};
  const sel=(ids)=>{SEL=ids;return getCmds().map(c=>c.nm||c.ic)};
  const v=G.U.find(u=>u.o===0&&u.type==='vill');out.aldeao=sel([v.id]);
  const h=spawnUnit('hopl',0,(s[0]+5)*TS,(s[1]+5)*TS);out.soldado=sel([h.id]);
  const sc=G.U.find(u=>u.o===0&&UT[u.type].cls==='cav')||spawnUnit('cav',0,(s[0]+6)*TS,(s[1]+5)*TS);out.batedor=[sc.type,...sel([sc.id])];
  const tc=G.B.find(b=>b.o===0&&b.type==='tc');out.centro=sel([tc.id]);
  for(const t of ['quartel','torre','mercado','biblioteca']){const bb=placeBld(t,0,s[0]+8,s[1]-8+(['quartel','torre','mercado','biblioteca'].indexOf(t))*4,true);if(bb)out[t]=sel([bb.id])}
  return out});
 for(const k in r)console.log(k+': '+r[k].join(' | '));await b.close()})();
