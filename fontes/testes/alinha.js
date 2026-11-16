const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:560},deviceScaleFactor:1.5});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(300);
 const civ=process.argv[2]||'babilonios',tipos=(process.argv[3]||'casa,mercado,templo,quartel,torre,celeiro').split(',');
 await pg.evaluate(([civ,tipos])=>{__RA.newGame({civ,map:'terra',diff:'facil',size:'med'});__RA.startGame();OPT.snd=false;OPT.mus=false;for(let i=0;i<N;i++){G.exp[i]=1}
  const s=G.starts[0];let x=s[0]+4,y=s[1]-6;for(const t of tipos){const sz=BT[t].sz;
   for(let dy=0;dy<sz+1;dy++)for(let dx=0;dx<sz+1;dx++){const i=idx(x+dx,y+dy);if(occ[i]){const r=E.get(occ[i]);if(r&&r.k==='r'){r.dead=true;E.delete(r.id);occ[i]=0;pass[i]=1}}}
   const bb=placeBld(t,0,x,y,true);x+=sz+1;if(x>s[0]+16){x=s[0]+4;y+=4}}
  centerOn((s[0]+10)*TS,(s[1]-3)*TS);Z=1.2;
  
  const draw=()=>{for(const b of G.B){if(b.dead||b.o!==0)continue;const p=[[0,0],[b.sz,0],[b.sz,b.sz],[0,b.sz]].map(([a,c])=>w2s((b.tx+a)*TS,(b.ty+c)*TS));const g=document.getElementById('cv').getContext('2d');g.save();g.setTransform(DPR,0,0,DPR,0,0);g.strokeStyle='#ff0';g.lineWidth=1.5;g.beginPath();p.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));g.closePath();g.stroke();g.restore()}};
  window.__alinha=draw},[civ,tipos]);
 await pg.waitForTimeout(800);await pg.evaluate(()=>{__RA.render();__alinha()});
 await pg.screenshot({path:process.argv[4]||'/home/claude/trab/alinha.png'});console.log('ERROS',errs.slice(0,3));await b.close()})();
