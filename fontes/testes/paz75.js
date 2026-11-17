const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
 const pg=await b.newPage({viewport:{width:800,height:360},deviceScaleFactor:1});
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(400);
 const r=await pg.evaluate(()=>{const out={};
   __RA.newGame({civ:'gregos',map:'terra',diff:'normal',size:'gra',np:3,paz:'5'});__RA.startGame();running=true;paused=false;OPT.snd=false;
   out.pz=JSON.stringify(G.pz);out.peace=peace(0,1)+'/'+foe(0,1)+'/'+calm(1,2);
   calcDom();
   const tc1=G.B.find(x=>x.o===1&&x.type==='tc'),c1=ctr(tc1),tc0=G.B.find(x=>x.o===0&&x.type==='tc'),c0=ctr(tc0);
   // soldado meu colado no inimigo, fora do território dele (no meu)
   const a=spawnUnit('hopl',0,c0.x+3*TS,c0.y),e=spawnUnit('hopl',1,c0.x+3.6*TS,c0.y);
   orderAttack(a,e);out.ordered=a.st;
   for(let i=0;i<40;i++)step(.25);out.hpAfter10=a.hp+'/'+e.hp;
   // tropa minha dentro do território dele: morre pelo atrito; batedor não
   const inv=spawnUnit('hopl',0,c1.x+2*TS,c1.y+2*TS),bat=spawnUnit('bat',0,c1.x-2*TS,c1.y+2*TS);
   out.domInv=DOM[tileOf(inv.x,inv.y)];
   for(let i=0;i<40;i++)step(.25);out.inv=inv.dead+' hp'+Math.round(inv.hp);out.bat=bat.dead+' hp'+Math.round(bat.hp);
   out.chip=$('pzc').textContent+' vis='+$('pzc').style.display;
   $('bdip').click();out.panel=$('dipp').innerText.replace(/\s+/g,' ').slice(0,220);
   dipWar(1);out.warBlocked=relOf(1);
   // fim da paz
   G.t=G.pz.t+.5;for(let i=0;i<8;i++)step(.25);out.after=G.pz.on+' foe='+foe(0,1);
   for(let i=0;i<40;i++)step(.25);out.fight=Math.round(a.hp)+'/'+Math.round(e.hp);
   // ---- diplomacia: acordo de paz no meio do jogo
   __RA.newGame({civ:'gregos',map:'terra',diff:'normal',size:'gra',np:3});__RA.startGame();running=true;paused=false;
   out.noPz=JSON.stringify(G.pz);calcDom();
   const T1=G.B.find(x=>x.o===1&&x.type==='tc'),C1=ctr(T1),T0=G.B.find(x=>x.o===0&&x.type==='tc'),C0=ctr(T0);
   const mine=[];for(let i=0;i<3;i++)mine.push(spawnUnit('hopl',0,C1.x+2*TS+i*6,C1.y+2*TS));
   G.t=200;out.prop=dipProposePeace(1);out.rel=relOf(1)+' peace='+peace(0,1)+' ally='+ally(0,1)+' foe='+foe(0,1);
   out.retreat=mine.map(u=>u.st+':'+(u.pzg>G.t)).join(',');
   for(let i=0;i<120;i++)step(.25);out.retAlive=mine.filter(u=>!u.dead).length;
   const x=spawnUnit('hopl',0,C0.x+3*TS,C0.y),y=spawnUnit('hopl',1,C0.x+3.6*TS,C0.y);for(let i=0;i<20;i++)step(.25);out.calmHp=x.hp+'/'+y.hp;
   out.again=dipPeaceWhyNot(1);
   dipWar(1);out.warRel=relOf(1)+' foe='+foe(0,1);for(let i=0;i<30;i++)step(.25);out.warHp=Math.round(x.hp)+'/'+Math.round(y.hp);
   out.reask=dipPeaceWhyNot(1);
   // IA forte demais recusa
   G.dip.war[2]=-999;G.dip.hit[2]=-999;G.dip.ask[2]=-999;const T2=G.B.find(x=>x.o===2&&x.type==='tc'),C2=ctr(T2);for(let i=0;i<20;i++)spawnUnit('hopl',2,C2.x+i*4,C2.y+40);
   out.strong=dipPeaceWhyNot(2);G.P[0].res.gold=500;dipGift(2);out.afterGift=dipPeaceWhyNot(2);
   // IA fraca pede paz
   for(const u of G.U)if(u.o===2&&isMil(u))u.dead=true;G.U=G.U.filter(u=>!u.dead);for(let i=0;i<12;i++)spawnUnit('hopl',0,C0.x+i*4,C0.y+40);
   G.dip.offer=null;G.dip.off[2]=-999;G.t=900;G.dip.war[2]=-999;G.dip.hit[2]=-999;dipAITick();out.offer=JSON.stringify(G.dip.offer);
   $('dipp').style.display='block';dipDraw();out.panel2=$('dipp').innerText.replace(/\s+/g,' ').slice(0,260);
   if($('dipy'))$('dipy').click();out.acc=relOf(1)+''+relOf(2);
   // aliança -> só paz
   dipJoin(2);out.al=relOf(2);dipUnally(2);out.unal=relOf(2)+' vis='+ally(0,2);
   // ---- paz até a era
   __RA.newGame({civ:'gregos',map:'terra',diff:'normal',size:'gra',np:3,paz:'a2',fim:'7'});__RA.startGame();running=true;
   out.pzEra=JSON.stringify(G.pz)+' '+$('pzc').textContent;G.P[2].age=2;for(let i=0;i<6;i++)step(.25);out.eraEnd=G.pz.on;
   __RA.newGame({civ:'gregos',map:'terra',diff:'normal',size:'gra',np:2,paz:'a2',era:'2'});out.pzInv=JSON.stringify(G.pz);
   return out});
 console.log(JSON.stringify(r,null,1));
 await pg.evaluate(()=>{running=false;$('menu')&&($('menu').style.display='');});
 console.log('ERROS',errs.slice(0,8));await b.close()})();
