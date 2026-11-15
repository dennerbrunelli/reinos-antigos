const {chromium}=require('playwright');const civ=process.argv[2]||'alemaes',out=process.argv[3]||'civ.png';
(async()=>{const b=await chromium.launch();const errs=[];const pg=await b.newPage({viewport:{width:800,height:360},deviceScaleFactor:2,hasTouch:true});
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(300);
 await pg.evaluate(([civ,TIPOS])=>{__RA.newGame({civ,map:'terra',diff:'normal',size:'med'});__RA.startGame();OPT.snd=false;OPT.mus=false;for(let i=0;i<N;i++)G.exp[i]=1;
  const s=G.starts[0];let k=0;for(const t of TIPOS.split(',')){const x=s[0]+4+(k%4)*5,y=s[1]-6+((k/4)|0)*13;try{placeBld(t,0,x,y,true)}catch(e){}k++}
  const tc=G.B.find(x=>x.o===0&&x.type==='tc'),c=ctr(tc);Z=.62;centerOn(c.x+TS*7,c.y-TS*2)},[civ,process.env.TIPOS||'casa,celeiro,mercado,deposito,torre,quartel,templo,estabulo']);
 await pg.waitForTimeout(2600);await pg.screenshot({path:out});console.log(await pg.evaluate(()=>civOf(0).st),'ERROS',errs.slice(0,5));await b.close()})();
