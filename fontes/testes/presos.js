const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const pg=await b.newPage({viewport:{width:800,height:360}});
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});
 for(const cfg of [{np:4,size:'gig',map:'terra'},{np:8,size:'gig',map:'terra'},{np:4,size:'gig',map:'terra'},{np:2,size:'pequeno',map:'ilhas'}]){
 const r=await pg.evaluate(async(cfg)=>{const out={cfg,erros:[]};
  try{__RA.newGame({civ:'gregos',diff:'dificil',...cfg});__RA.startGame();OPT.snd=false;OPT.mus=false;
   // o jogador 0 também vira IA para testar tudo
   if(typeof AI!=='undefined'&&!AI[0]){}
  }catch(e){out.erros.push('inicio '+e.message);return out}
  const last=new Map();let presos=new Map();let nan=0;
  for(let s=0;s<20*60*8;s++){ // 12 minutos de jogo
    try{__RA.step(.05)}catch(e){out.erros.push(String(e.message)+' @'+G.t.toFixed(0));if(out.erros.length>5)break}
    if(s%100===0){for(const u of G.U){if(u.dead)continue;if(!isFinite(u.x)||!isFinite(u.y)){nan++;continue}
      const k=u.id,p=last.get(k);const quer=u.mv&&!u.work;
      if(p&&quer&&Math.hypot(p[0]-u.x,p[1]-u.y)<1){presos.set(k,(presos.get(k)||0)+1)}else presos.delete(k);
      last.set(k,[u.x,u.y])}}}
  const P=[...presos.entries()].filter(([k,n])=>n>=6).map(([k,n])=>{const u=E.get(k);if(!u||u.dead)return null;const tx=u.x/TS|0,ty=u.y/TS|0;const viz=[];for(let dy=-1;dy<=1;dy++){let row='';for(let dx=-1;dx<=1;dx++){const i=idx(tx+dx,ty+dy);row+=(pass[i]?'.':'#')+(occ[i]?'o':'_')}viz.push(row)};return {t:u.type,o:u.o,st:u.st,n,pos:[(u.x/TS).toFixed(2),(u.y/TS).toFixed(2)],goal:u.goal&&[(u.goal.x/TS).toFixed(2),(u.goal.y/TS).toFixed(2)],path:u.path&&u.path.length,pi:u.pi,stuck:u.stuck,viz:viz.join('|'),agua:!!G.terr[idx(tx,ty)],k:Object.keys(u).filter(k=>/goal|path|stuck|bk|wait|blk|rep/i.test(k)).map(k=>k+'='+JSON.stringify(u[k]).slice(0,40)).join(' ')}}).filter(Boolean);
  out.t=G.t|0;out.nan=nan;out.presos=P.length;out.ex=P.slice(0,4);out.unid=G.U.filter(u=>!u.dead).length;out.over=!!G.over;return out},cfg);
 console.log(JSON.stringify(r))}
 console.log('ERROS',errs.slice(0,5));await b.close()})();
