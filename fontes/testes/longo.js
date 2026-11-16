const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const pg=await b.newPage({viewport:{width:800,height:360}});
 pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});
 for(const cfg of [{np:6,size:'gig',map:'terra',times:'ffa'},{np:4,size:'gig',map:'ilhas',times:'t2'}]){
 const r=await pg.evaluate(async(cfg)=>{const out={cfg,erros:[]};__RA.newGame({civ:'shang',diff:'dificil',...cfg});__RA.startGame();OPT.snd=false;OPT.mus=false;
  // jogador humano também recebe IA, para a partida andar de verdade
  try{if(typeof mkAI==='function'&&!window.__ai0){}}catch(e){}
  for(let s=0;s<20*60*30;s++){try{__RA.step(.05)}catch(e){out.erros.push(String(e.stack||e.message).slice(0,300));if(out.erros.length>4)break}
   if(s%2400===0){try{__RA.render()}catch(e){out.erros.push('render '+String(e.stack||e.message).slice(0,300))}}
   if(G.over)break}
  out.t=G.t|0;out.eras=G.P.map(P=>P.age);out.vivos=G.P.map((_,p)=>G.U.filter(u=>!u.dead&&u.o===p).length);out.over=!!G.over;return out},cfg);
 console.log(JSON.stringify(r))}
 console.log('ERROS',errs.slice(0,6));await b.close()})();
