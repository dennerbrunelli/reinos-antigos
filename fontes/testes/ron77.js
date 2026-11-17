const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(async()=>{await ARTP});await pg.waitForTimeout(300);
 const r=await pg.evaluate(()=>{const out={};__RA.newGame({civ:'gregos',map:'terra',size:'med',np:2,diff:'normal'});__RA.startGame();running=true;paused=false;OPT.snd=false;calcDom();
  const P=G.P[0];Object.assign(P.res,{food:3000,wood:3000,gold:3000});
  out.mtn=Object.values(G.mtn).map(m=>m.n).join(',');
  const tc=G.B.find(b=>b.o===0&&b.type==='tc'),C=ctr(tc);
  const find=(type,cx,cy,r0,r1)=>{for(let r=r0;r<=r1;r++)for(let a=0;a<48;a++){const X=Math.round(cx+Math.cos(a/48*6.283)*r),Y=Math.round(cy+Math.sin(a/48*6.283)*r);if(validSite(type,X,Y,0,0))return[X,Y]}return null};
  const v=G.U.filter(u=>u.o===0&&u.type==='vill');
  // árvore sem acampamento
  const tree=G.R.filter(x=>x.sub==='tree'&&DOM[idx(x.tx,x.ty)]===0).sort((a,b2)=>hyp(a.tx-tc.tx,a.ty-tc.ty)-hyp(b2.tx-tc.tx,b2.ty-tc.ty))[0];
  out.treeNoCamp=orderGather(v[0],tree);
  const s=find('deposito',tree.tx,tree.ty,1,5);out.campSite=!!s;const w0=P.res.wood;const camp=placeBld('deposito',0,s[0],s[1],true);onBuilt(camp);out.campBonus=P.res.wood-w0+' cap='+siteCap(camp);
  out.treeCamp=orderGather(v[0],tree)+' tg='+(v[0].tg===camp.id);orderGather(v[1],camp);
  const w1=P.res.wood;for(let i=0;i<4*30;i++)step(.25);out.wood30=Math.round(P.res.wood-w1)+' st='+v[0].st+'/'+v[1].st+' work='+v[0].work;
  // mina
  out.minaEra0=domWhy('mina',0,0,0)||canBuildType(0,'mina');P.age=1;
  const rock=G.R.filter(x=>x.mt&&DOM[idx(x.tx,x.ty)]===0).sort((a,b2)=>hyp(a.tx-tc.tx,a.ty-tc.ty)-hyp(b2.tx-tc.tx,b2.ty-tc.ty))[0];
  out.rockInTerr=!!rock;if(rock){const ms=find('mina',rock.tx,rock.ty,1,4);out.mineSite=!!ms;
   if(ms){const mi=placeBld('mina',0,ms[0],ms[1],true);onBuilt(mi);out.mineCap=siteCap(mi)+' mtn='+G.mtn[mi.mt].n;const ms2=find('mina',rock.tx,rock.ty,1,6);out.secondMine=ms2?domWhy('mina',ms2[0],ms2[1],0):'nenhum lugar';
    orderGather(v[2],rock);const g0=P.res.gold;for(let i=0;i<4*20;i++)step(.25);out.gold20=Math.round(P.res.gold-g0)+' st='+v[2].st+' lsub='+v[2].lsub}}
  // raio da cidade
  out.celeiroLonge=domWhy('celeiro',tc.tx+14,tc.ty,0);const cs=find('celeiro',tc.tx,tc.ty,4,9);placeBld('celeiro',0,cs[0],cs[1],true);const cs2=find('celeiro',tc.tx,tc.ty,4,9);out.celeiro2=cs2?'achou lugar (ERRO)':'ok, nenhum lugar';
  out.celeiro2why=domWhy('celeiro',cs[0]+3,cs[1],0);
  out.forteNear=domWhy('forte',tc.tx+5,tc.ty,0);
  out.torreInf=infR({type:'torre',o:0})+' forte='+infR({type:'forte',o:0});
  // reforço
  const before=boostOf(0,'wood',camp);const sr=find('serraria',tc.tx,tc.ty,3,10);if(sr){const sb=placeBld('serraria',0,sr[0],sr[1],true);out.boost=before+'→'+boostOf(0,'wood',camp)+' campCity='+!!cityOfB(camp);P.techs.push('serra');out.boost1=boostOf(0,'wood',camp)}
  out.foraFront=domWhy('quartel',MW-10,MH-10,0);
  return out});
 console.log(JSON.stringify(r,null,1));console.log('ERROS',errs.slice(0,6));await b.close()})();
