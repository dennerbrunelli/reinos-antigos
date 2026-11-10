
// =========================================================
//   INTELIGÊNCIA DO INIMIGO
// =========================================================
let AIP=1; // jogador que o computador está controlando agora
function findSite(type,cx,cy,minR,maxR){
  const sz=BT[type].sz,m=type==='fazenda'||BT[type].water?0:1;
  for(const[dx,dy,d2]of SPIRAL){if(d2<minR*minR)continue;if(d2>maxR*maxR)break;
    const tx=Math.round(cx+dx-sz/2),ty=Math.round(cy+dy-sz/2);if(validSite(type,tx,ty,m,AIP))return[tx,ty]}
  return null;
}
function findResLimited(sub,hb,maxD,tgc,lim){
  let best=null,bd=maxD*TS;
  if(UT[sub]){for(const a of G.U){if(a.dead||a.o!==GAIA||a.type!==sub)continue;if((tgc.get(a.id)||0)>=lim)continue;const d=hyp(a.x-hb.x,a.y-hb.y);if(d<bd){bd=d;best=a}}return best}
  for(const r of G.R){if(r.dead||r.sub!==sub||(r.bad&&G.t-r.bad<120))continue;if(sub==='fish'&&r.deep)continue;if((tgc.get(r.id)||0)>=lim)continue;const c=ctr(r),d=hyp(c.x-hb.x,c.y-hb.y);if(d<bd){bd=d;best=r}}
  return best;
}
function nearestFoe(p,from,naval){
  let best=null,bd=1e9;
  for(const u of G.U){if(u.dead||u.inT||u.o===p||u.o===GAIA)continue;if(naval&&!isNav(u))continue;const d=hyp(u.x-from.x,u.y-from.y)*(naval?1:1.2);if(d<bd){bd=d;best=u}}
  for(const b of G.B){if(b.dead||b.o===p)continue;if(naval&&!BT[b.type].water)continue;const c=ctr(b);const d=hyp(c.x-from.x,c.y-from.y)*(b.type==='fazenda'||b.type==='muralha'?1.4:1);if(d<bd){bd=d;best=b}}
  return best;
}
function intrNear(){return false}
function aiTick(p){
  AIP=p;
  const P=G.P[p],AI=P.ai,D=DIFF[G.diff],res=P.res;
  const mine=G.U.filter(u=>!u.dead&&u.o===p&&!u.inT);
  const vills=mine.filter(u=>u.type==='vill');
  const fishers=mine.filter(u=>u.type==='pesc');
  const navy=mine.filter(u=>UT[u.type].war);
  const priests=mine.filter(u=>u.type==='sac');
  const army=mine.filter(u=>u.type!=='vill'&&!isNav(u)&&u.type!=='sac'&&!UT[u.type].civ);
  const blds=G.B.filter(b=>!b.dead&&b.o===p);
  const tc=blds.find(b=>b.id===P.capId&&b.done>=1&&!b.down)||blds.find(b=>b.type==='tc'&&b.done>=1&&!b.down);
  const has=t=>blds.some(b=>b.type===t&&b.done>=1),any=t=>blds.some(b=>b.type===t);
  const hb=tc?ctr(tc):{x:(G.starts[p][0]+.5)*TS,y:(G.starts[p][1]+.5)*TS};
  const htx=hb.x/TS,hty=hb.y/TS;
  const busy=new Set();
  const pick=near=>{let best=null,bd=1e9;for(const v of vills){if(busy.has(v.id)||v.st==='build')continue;const d=hyp(v.x-near.x,v.y-near.y)*(v.st==='idle'?.5:1)*(v.ct==='food'?1.5:1);if(d<bd){bd=d;best=v}}if(best)busy.add(best.id);return best};
  // prédios que só podem ficar dentro da fronteira: se não couber perto, tenta perto das outras cidades
  const nearCities=type=>{for(const c of blds){if(c.type!=='tc'||c.done<1||c.down)continue;const cc=ctr(c);const s=findSite(type,cc.x/TS,cc.y/TS,3,10);if(s)return s}return null};
  const build=(type,cx,cy,minR,maxR)=>{if(!afford(p,BT[type].cost)||G.P[p].age<BT[type].age)return false;if(AI.nsT&&G.t-(AI.nsT[type]||-99)<20)return false;const s=findSite(type,cx,cy,minR,maxR)||findSite(type,cx,cy,maxR,maxR+8)||(!NEUTRAL_OK[type]?nearCities(type):null);if(!s){if(!NEUTRAL_OK[type])AI.noSite=G.t;(AI.nsT=AI.nsT||{})[type]=G.t;return false}
    const v=pick({x:(s[0]+1)*TS,y:(s[1]+1)*TS});if(!v)return false;pay(p,BT[type].cost);const b=placeBld(type,p,s[0],s[1],false);blds.push(b);orderBuild(v,b);return b};
  for(const b of blds){if(b.done<1){if((b.stuck||0)>=3&&b.done<.05){refund(p,BT[b.type].cost);kill(b);continue}
    const n=vills.filter(v=>v.st==='build'&&v.tg===b.id).length;if(n===0){const v=pick(ctr(b));if(v)orderBuild(v,b)}}}
  const queued=blds.reduce((s,b)=>s+b.q.filter(q=>q!=='age'&&!q.startsWith('t:')).length,0);
  // casas
  // população (como no Rise): Organização Militar no Centro Urbano quando chega perto do limite
  {const ml=P.mil||0,lb=blds.find(b=>b.type==='biblioteca'&&b.done>=1);if(lb&&lb.q.length<2&&ml<MIL_N&&P.age>=MILAGE[ml]&&P.pop+queued+14>=P.cap&&!blds.some(b=>b.q.includes('mil'))&&afford(p,MILCOST[ml])){pay(p,MILCOST[ml]);lb.q.push('mil')}}
  // aldeões
  const nextAge=P.age<ENDAGE()?AGECOST[P.age+1]:null;
  const ageGoal=P.age<ENDAGE()&&vills.length>=D.ageV[P.age];
  if(tc&&tc.q.length<2&&!tc.q.includes('age')&&vills.length+tc.q.length<(P.age===0?Math.min(D.vt,22):D.vt)&&afford(p,costOf(p,'vill'))&&!(ageGoal&&res.food>=nextAge.food*.6&&res.food<nextAge.food+50&&vills.length>8)){pay(p,costOf(p,'vill'));tc.q.push('vill')}
  // requisitos de era: 2 prédios diferentes da era atual
  if(P.age<ENDAGE()){const need=AGEREQ[P.age+1];const got=need.filter(t=>has(t)).length;
    if(got<2&&vills.length>=6){for(const t of need){if(any(t))continue;if(t==='doca')continue;
      const near=t==='celeiro'?(findRes('berry',hb.x,hb.y,14,p)||{tx:htx,ty:hty}):t==='deposito'?(findRes('tree',hb.x,hb.y,20,p)||{tx:htx,ty:hty}):{tx:htx+(G.starts[0][0]-htx)*.1,ty:hty+(G.starts[0][1]-hty)*.1};
      if(build(t,near.tx,near.ty,t==='celeiro'||t==='deposito'?1:4,t==='celeiro'||t==='deposito'?6:12))break;break}}
    {const lb=blds.find(b=>b.type==='biblioteca'&&b.done>=1);if(lb&&ageGoal&&got>=2&&!blds.some(b=>b.q.includes('age'))&&lb.q.length<2&&afford(p,nextAge)){pay(p,nextAge);lb.q.push('age')}}
  }
  const toward={x:htx+(G.starts[0][0]-htx)*.12,y:hty+(G.starts[0][1]-hty)*.12};
  if(vills.length>=7&&!any('quartel'))build('quartel',toward.x,toward.y,4,12);
  if(P.age>=1&&vills.length>=11&&!any('mercado'))build('mercado',htx,hty,4,12);
  if(P.age>=1&&vills.length>=12&&!any('arquearia'))build('arquearia',toward.x,toward.y,5,13);
  if(P.age>=1&&vills.length>=15&&!any('estabulo'))build('estabulo',htx,hty,5,14);
  if(P.age>=2&&!any('templo')&&res.wealth>=60)build('templo',htx,hty,5,14);
  if(P.age>=2&&!any('academia'))build('academia',toward.x,toward.y,5,14);
  if(P.age>=2&&vills.length>=16&&!any('oficina'))build('oficina',htx,hty,5,15);
  if(P.age>=1&&G.diff!=='facil'&&blds.filter(b=>b.type==='torre').length<(G.diff==='dificil'?3:1)&&afford(p,BT.torre.cost))build('torre',toward.x,toward.y,4,8);
  ronAI(p,blds,has,any,build,htx,hty,toward,vills,army,res);
  // expansão: fundar cidades novas perto de minas e florestas (aumenta a fronteira)
  const cities=blds.filter(b=>b.type==='tc');
  const cityMax={facil:1,normal:2,dificil:3}[G.diff];
  const crowded=AI.noSite&&G.t-AI.noSite<40; // faltou lugar dentro da fronteira
  if(P.age>=1&&(vills.length>=14||crowded)&&cities.length<cityMax&&!cities.some(b=>b.done<1)){
    const resv=ageGoal&&nextAge&&!crowded?nextAge:{};const okC=Object.keys(BT.tc.cost).every(k=>res[k]-(resv[k]||0)>=BT.tc.cost[k]);
    if(okC){let best=null,bd=1e9;
      for(const r of G.R){if(r.dead||r.walk||!(r.sub==='gold'||r.sub==='stone'||r.sub==='tree')||(r.badCity&&G.t-r.badCity<120))continue;const rx=r.tx+.5,ry=r.ty+.5;
        let dm=1e9;for(const c of cities){const cc=ctr(c);dm=Math.min(dm,hyp(cc.x/TS-rx,cc.y/TS-ry))}
        if(dm<CITY_MIN_OWN+1||dm>CITY_MIN_OWN+12)continue;
        const sc=hyp(rx-htx,ry-hty)+(r.sub==='tree'?8:0);if(sc<bd){bd=sc;best=r}}
      if(best){const b=build('tc',best.tx,best.ty,2,6);if(b){for(let k=0;k<2;k++){const v=pick(ctr(b));if(v)orderBuild(v,b)}}else best.badCity=G.t}}}
  // sem lugar e sem cidade nova: uma torre na beira empurra a fronteira
  if(crowded&&P.age>=1&&afford(p,BT.torre.cost)&&blds.filter(b=>b.type==='torre').length<{facil:2,normal:4,dificil:6}[G.diff]&&!blds.some(b=>b.type==='torre'&&b.done<1)){
    const a0=RNG()*6.28;for(let k=0;k<8;k++){const a=a0+k*.785;if(build('torre',htx+Math.cos(a)*(INF_CAP-1),hty+Math.sin(a)*(INF_CAP-1),0,3))break}}
  // depósitos perto dos recursos
  // acampamentos de lenhadores (como no Rise): 1 a cada 12 aldeões, perto de floresta sem acampamento
  {const camps=blds.filter(b=>b.type==='deposito');if(camps.length<1+Math.floor(vills.length/12)&&!camps.some(b=>b.done<1)){
    let best=null,bd=30*TS;for(const r of G.R){if(r.dead||r.sub!=='tree')continue;const c=ctr(r);if(camps.some(b=>hyp(ctr(b).x-c.x,ctr(b).y-c.y)<CAMP_R*TS))continue;if(DOM[idx(r.tx,r.ty)]!==p&&hyp(c.x-hb.x,c.y-hb.y)>14*TS)continue;const d=hyp(c.x-hb.x,c.y-hb.y);if(d<bd){bd=d;best=r}}
    if(best)build('deposito',best.tx,best.ty,1,4)}}
  const berry=findRes('berry',hb.x,hb.y,16,p);
  const berryFar=berry&&hyp((berry.tx+.5)*TS-hb.x,(berry.ty+.5)*TS-hb.y)>5*TS;
  if(!any('celeiro')&&(berryFar||vills.length>=9)){if(berryFar)build('celeiro',berry.tx,berry.ty,1,4);else build('celeiro',htx,hty,3,8)}
  // doca e barcos
  const dock=blds.find(b=>b.type==='doca');
  if(!dock&&vills.length>=8&&findRes('fish',hb.x,hb.y,22,p))build('doca',htx,hty,3,18);
  if(dock&&dock.done>=1){
    const fishLeft=G.R.some(r=>!r.dead&&r.sub==='fish'&&hyp((r.tx+.5)*TS-ctr(dock).x,(r.ty+.5)*TS-ctr(dock).y)<26*TS);
    if(fishLeft&&fishers.length+dock.q.filter(q=>q==='pesc').length<D.fish&&dock.q.length<2&&afford(p,costOf(p,'pesc'))&&P.pop+queued<P.cap){pay(p,costOf(p,'pesc'));dock.q.push('pesc')}
    const foeNav=G.U.some(u=>!u.dead&&u.o!==p&&u.o<NP&&isNav(u))||G.B.some(b=>!b.dead&&b.o!==p&&b.type==='doca');
    const nt=P.age>=UT.encour.age?'encour':P.age>=UT.galeao.age?'galeao':P.age>=UT.trir.age?'trir':'bguer';
    if(P.age>=1&&foeNav&&navy.length+dock.q.filter(q=>UT[q]&&UT[q].war).length<D.navy+P.age&&dock.q.length<2&&afford(p,costOf(p,nt))&&P.pop+queued<P.cap){pay(p,costOf(p,nt));dock.q.push(nt)}
  }
  for(const f of fishers){if(f.st==='idle'){const c=dock?ctr(dock):hb;const r=findRes('fish',c.x,c.y,30,p);if(r)orderGather(f,r)}}
  for(const s of navy){if(s.st==='idle'){const t=nearestFoe(p,s,true);if(t&&hyp(ctr(t).x-s.x,ctr(t).y-s.y)<40*TS)orderAttack(s,t)}}
  // divisão do trabalho
  const want=P.age===0?{food:.6,wood:.4,gold:0,stone:0}:P.age===1?{food:.48,wood:.34,gold:.14,stone:.04}:{food:.4,wood:.34,gold:.22,stone:.04};
  if(P.age===0&&vills.length>=D.ageV[0]-2){want.gold=.1;want.wood=.35}
  const cnt={food:0,wood:0,gold:0,stone:0};
  const tgc=new Map();
  const catOf=s=>s==='tree'?'wood':s==='gold'||s==='stone'?s:'food';
  for(const v of vills){if(v.st==='gather'||v.st==='return'){cnt[catOf(v.lsub)]++;if(v.st==='gather')tgc.set(v.tg,(tgc.get(v.tg)||0)+1)}}
  const foodTarget=()=>findResLimited('berry',hb,16,tgc,3)||findResLimited('carc',hb,18,tgc,4)||findResLimited('gaz',hb,18,tgc,3)||findResLimited('fish',hb,12,tgc,2)||findRes('farm',hb.x,hb.y,14,p);
  {const n=vills.length,need={};for(const k of RES)need[k]=want[k]*n-cnt[k]-res[k]/500+(want[k]>0&&res[k]<150?2:0);
   let hi='food',lo='wood';for(const k of RES){if(need[k]>need[hi])hi=k;if(need[k]<need[lo])lo=k}
   const okHi=hi==='food'?(!!foodTarget()||res.wood>=BT.fazenda.cost.wood):!!findRes(hi==='wood'?'tree':hi,hb.x,hb.y,40,p);
   if(okHi&&need[hi]-need[lo]>=2.5&&cnt[lo]>0){const v=vills.find(x=>(x.st==='gather'||x.st==='return')&&catOf(x.lsub)===lo&&!busy.has(x.id));if(v){orderStop(v);cnt[lo]--}}}
  for(const v of vills){
    if(v.st!=='idle'||busy.has(v.id))continue;
    let rt='wood',bd=-1e9;for(const k of RES){const s=want[k]*vills.length-cnt[k]-res[k]/500+(want[k]>0&&res[k]<150?2:0);if(s>bd){bd=s;rt=k}}
    let target=null;
    if(rt==='food'){
      target=foodTarget();
      if(!target){const gr=blds.find(b=>b.type==='celeiro'&&b.done>=1)||tc;const c=gr?ctr(gr):hb;
        if(afford(p,BT.fazenda.cost)){const s=findSite('fazenda',c.x/TS,c.y/TS,2,9)||findSite('fazenda',htx,hty,3,16)||findSite('fazenda',htx,hty,16,24)||nearCities('fazenda');if(s){pay(p,BT.fazenda.cost);const f=placeBld('fazenda',p,s[0],s[1],false);blds.push(f);orderBuild(v,f);busy.add(v.id);cnt.food++;continue}}}
      if(!target)rt='wood';
    }
    if(!target){const sub=rt==='wood'?'tree':rt;target=findResLimited(sub,hb,34,tgc,sub==='tree'?2:3)||findRes(sub,hb.x,hb.y,40,p)}
    if(target){orderGather(v,target);cnt[rt]++;tgc.set(target.id,(tgc.get(target.id)||0)+1)}
  }
  // tecnologias (quando sobra)
  const reserve=ageGoal&&nextAge?nextAge:{};
  const canSpend=c=>{for(const k in c){if(res[k]-(reserve[k]||0)<c[k])return false}return true};
  const prio=['serra','picareta','ferraria','couro','enxada','machado','roda','arcos','escudo','sentinela','arado','fe','medicina','velas','forja','espadaL','falange','casco','irrigacao'];
  for(const id of prio){const t=TECH[id];if(P.techs.includes(id)||t.age>P.age||(t.req&&!P.techs.includes(t.req)))continue;
    const b=blds.find(x=>x.type===t.at&&x.done>=1&&!x.q.length);if(!b)continue;if(blds.some(x=>x.q.includes('t:'+id)))continue;
    if(canSpend(t.cost)&&Object.keys(t.cost).every(k=>res[k]-t.cost[k]>=120)&&vills.length>=10){pay(p,t.cost);b.q.push('t:'+id);break}}
  // exército
  const minArmy={facil:2,normal:4,dificil:6}[G.diff]+P.age*3;
  const saving=ageGoal&&nextAge&&res.food>=nextAge.food*.5&&!intrNear();
  const spend=c=>army.length+queued<minArmy&&!saving?afford(p,c):canSpend(c);
  const prefer={fabrica:['tanque','artilharia'],quartel:['assalto','fuzil','mosq','espa','guer'],arquearia:['arqcav','arqc','arq'],estabulo:['elef','cav','carro','bat'],academia:['hopl'],oficina:['canhao','pedra','bal'],templo:['sac']};
  const maxArmy={facil:20,normal:45,dificil:75}[G.diff];
  for(const b of blds){if(b.done<1||b.q.length>=2||!prefer[b.type])continue;if(P.pop+queued>=P.cap||army.length+queued>=maxArmy)break;
    if(b.type==='templo'&&priests.length+b.q.length>=(G.diff==='facil'?1:2))continue;
    if(b.type==='oficina'&&army.filter(u=>UT[u.type].cls==='cerco').length>=3)continue;
    const opts=prefer[b.type].filter(t=>STAT[p][t].age<=P.age);
    for(const t of opts){const c=costOf(p,t);if(spend(c)){pay(p,c);b.q.push(t);break}}}
  // defesa
  let intr=null,id=1e9;
  for(const u of G.U){if(u.dead||u.inT||u.o===p||u.o===GAIA||isNav(u))continue;let near=false;for(const b of blds){if(distTo(u,b)<9*TS){near=true;break}}if(near){const d=hyp(u.x-hb.x,u.y-hb.y);if(d<id){id=d;intr=u}}}
  if(!intr&&AI.threat){const t=E.get(AI.threat);if(t&&!t.dead&&t.k==='u'&&hyp(t.x-hb.x,t.y-hb.y)<18*TS)intr=t;AI.threat=0}
  if(intr){for(const u of army){if(u.st!=='attack')orderAttack(u,intr)}for(const s of priests){if(s.st==='idle'&&s.faith>=100)orderConvert(s,intr)}}
  // ataque em ondas
  if(!AI.atk&&G.t>=AI.nextAtk&&army.length>=AI.wave){AI.atk=true;AI.nextAtk=G.t+D.int;AI.wave+=D.inc;if(running)toast('⚠️ O exército inimigo está marchando contra você!');snd('alert')}
  if(AI.atk){
    if(army.length<2)AI.atk=false;
    else{const tgt=nearestFoe(p,hb,false);if(tgt){for(const u of army){if(u.st==='idle'||(u.st==='move'&&!intr))orderAttack(u,tgt)}
      const c=ctr(tgt);for(const s of priests){if(s.st==='idle'&&hyp(s.x-c.x,s.y-c.y)>8*TS){const a=army[0];orderMove(s,a.x,a.y)}}}}
  }
  if(!tc&&!blds.some(b=>b.type==='tc'&&(b.done<1||b.down))&&P.age>=1&&vills.length){if(!build('tc',htx,hty,0,12))build('tc',vills[0].x/TS,vills[0].y/TS,0,14)}
}
