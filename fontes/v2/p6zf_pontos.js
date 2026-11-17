// =========================================================
// PONTUAÇÃO DAS NAÇÕES (como o Rise of Nations e o Age)
//   · Rise: a pontuação total é a soma de 7 partes: Exército, Combate, Território, Cidades,
//     Economia, Pesquisa e Maravilhas.
//   · Rise: no canto de baixo à direita fica o "Data Display" com o nome, a cor, a era,
//     a porcentagem de território e a pontuação de cada nação; dos outros só se vê o total.
//   · Age: a pontuação de todos fica sempre à vista no canto da tela.
// =========================================================
const PT_ROM=['I','II','III','IV','V','VI','VII','VIII'];
function armyVal(p){let v=0;for(const u of G.U){if(u.dead||u.o!==p||!isMil(u))continue;const c=UT[u.type]&&UT[u.type].cost||{};for(const k in c)v+=c[k]}return v/10}
scoreOf=function(p){const S=G.st||{},P=G.P[p];if(!P)return{exe:0,cmb:0,ter:0,cid:0,eco:0,pes:0,mar:0,mil:0,tec:0,soc:0,tot:0};
  const exe=Math.round(armyVal(p));
  const cmb=Math.round(((S.kill&&S.kill[p])||0)*12+((S.bk&&S.bk[p])||0)*35);
  const ter=Math.round(domShare(p)*1000);
  const bl=G.B.filter(b=>!b.dead&&b.o===p&&b.done>=1);
  const cid=Math.round(bl.filter(b=>b.type==='tc').length*150+bl.filter(b=>b.type!=='muralha'&&b.type!=='tc').length*4);
  const eco=Math.round(((S.gath&&S.gath[p])||0)/10);
  const pes=Math.round(P.age*150+(P.techs?P.techs.length:0)*20+((P.mil||0)+(P.cvc||0)+(P.com||0)+(P.sci||0))*25);
  const mar=bl.filter(b=>b.type==='maravilha').length*400;
  return{exe,cmb,ter,cid,eco,pes,mar,mil:exe+cmb,tec:pes,soc:ter+cid+mar,tot:exe+cmb+ter+cid+eco+pes+mar}};
// ---------- DATA DISPLAY (como o do Rise): texto solto no canto, sem janela ----------
// Tocar no texto (ou no botão 📊) troca o que aparece: Nações → Economia → Exército → Pesquisas → escondido.
const DD_M=[['pol','Nações'],['eco','Economia'],['mil','Exército'],['pes','Pesquisas'],['off','']];
let DDM=0;try{DDM=+(localStorage.getItem('imperio_dd')||0)%DD_M.length}catch(e){}
{const css=document.createElement('style');css.textContent=`
#pPts{background:none!important;border:none!important;box-shadow:none!important;min-width:0}
#pPts>.ph{display:none!important}
#ptsl{padding:0;font-size:11.5px;line-height:1.28;color:#fff;text-shadow:0 0 2px #000,0 1px 2px #000,1px 0 2px #000;cursor:pointer;user-select:none}
#ptsl .pr{display:flex;align-items:center;gap:5px;white-space:nowrap;justify-content:flex-end}
#ptsl .pr i{width:8px;height:8px;border-radius:50%;border:1px solid #000;flex:none;box-shadow:0 0 2px #000}
#ptsl .pr .nm{max-width:96px;overflow:hidden;text-overflow:ellipsis}
#ptsl .pr .ea{min-width:34px;text-align:center;color:#ffd96a;font-weight:700;font-size:10.5px}
#ptsl .pr .tr{min-width:28px;text-align:right;color:#cfe6ff}
#ptsl .pr b{min-width:40px;text-align:right}
#ptsl .pr.eu .nm{color:#ffe9a8;font-weight:700}
#ptsl .pr.mo{opacity:.45;text-decoration:line-through}
#ptsl .ti{display:flex;justify-content:flex-end;align-items:center;gap:5px;font-size:10px;color:#ffd96a;font-weight:700;letter-spacing:.3px}
#ptsl .ti u{text-decoration:none;display:inline-flex;width:20px;height:20px;align-items:center;justify-content:center;border-radius:50%;background:rgba(20,14,6,.7);border:1px solid #f2d27a99;font-size:11px;text-shadow:none}
#ptsl .ek{display:flex;justify-content:flex-end;gap:6px;white-space:nowrap}
#ptsl .ek span{min-width:34px;text-align:right}`;document.head.appendChild(css)}
function ptsAging(p){return G.B.some(b=>!b.dead&&b.o===p&&b.q&&b.q[0]==='age')}
function ddPol(){const rows=[];for(let p=0;p<NP;p++){if(!G.P[p])continue;rows.push({p,s:scoreOf(p).tot,dead:!G.B.some(b=>!b.dead&&b.o===p&&b.type==='tc')&&!G.U.some(u=>!u.dead&&u.o===p&&u.type==='vill')})}
  rows.sort((a,b)=>(a.dead-b.dead)||(b.s-a.s));let h='';
  for(const r of rows){const p=r.p,P=G.P[p],rel=p===0?'':ally(p,0)?' 🤝':peace(p,0)?' 🕊':'';
    const era=PT_ROM[P.age]+(ptsAging(p)&&P.age<7?'▸'+PT_ROM[P.age+1]:'');
    h+='<div class="pr'+(p===0?' eu':'')+(r.dead?' mo':'')+'"><span class="nm">'+civOf(p).n+rel+'</span><span class="ea">'+era+'</span><span class="tr">'+Math.round(domShare(p)*100)+'%</span><b>'+r.s.toLocaleString('pt-BR')+'</b><i style="background:'+COL[p].m+'"></i></div>'}
  return h}
const ddLine=(ic,nm,v,x)=>'<div class="pr"><span class="nm">'+ic+' '+nm+'</span><b>'+v+'</b>'+(x!=null?'<span class="tr">'+x+'</span>':'')+'</div>';
function ddEco(){const c={food:0,wood:0,gold:0,oil:0,know:0,wealth:0,build:0,idle:0};
  for(const u of G.U){if(u.dead||u.o!==0)continue;
    if(u.type==='vill'){if(u.st==='gather'){const s=u.lsub;c[s==='tree'?'wood':s==='gold'||s==='stone'?'gold':s==='oil'?'oil':'food']++}else if(u.st==='build'||u.st==='repair')c.build++;else if(u.st==='idle')c.idle++;else c.food+=0}
    else if(u.type==='pesc')c.food++;else if(u.type==='erudito')c.know++;else if(u.type==='mercador'||u.type==='caravana')c.wealth++}
  const P=G.P[0];let R={};try{R=incRates()}catch(e){}const rate=k=>R[k]>0?'+'+R[k]+'/min':'';
  const vills=G.U.filter(u=>!u.dead&&u.o===0&&u.type==='vill').length;
  return ddLine('🌾','Comida',c.food,rate('food'))+ddLine('🪵','Madeira',c.wood,rate('wood'))+ddLine('⛏️','Metal',c.gold,rate('gold'))+(P.age>=5?ddLine('🛢️','Petróleo',c.oil,rate('oil')):'')+
    ddLine('📚','Eruditos',c.know,rate('know'))+ddLine('💰','Comércio',c.wealth,rate('wealth'))+ddLine('🔨','Construindo',c.build)+ddLine('💤','Parados',c.idle)+ddLine('👥','Aldeões',vills)}
function ddMil(){const c={inf:0,arq:0,cav:0,cerco:0,navio:0,tanque:0,sup:0};let n=0;
  for(const u of G.U){if(u.dead||u.o!==0||!isMil(u))continue;n++;const k=UT[u.type].cls;
    if(u.type==='general'||u.type==='espia')c.sup++;else if(k==='inf'&&ST(u).rng>1)c.arq++;else if(k==='inf')c.inf++;else if(k==='arq')c.arq++;else if(k==='cav'||k==='elef'||k==='arqcav')c.cav++;else if(k==='cerco')c.cerco++;else if(k==='navio')c.navio++;else if(k==='tanque')c.tanque++}
  const P=G.P[0];let foes=0;for(const u of G.U)if(!u.dead&&u.o<NP&&foe(u.o,0)&&isMil(u)&&vis[idx(u.x/TS|0,u.y/TS|0)])foes++;
  return ddLine('🗡️','Infantaria',c.inf)+ddLine('🏹','Atiradores',c.arq)+ddLine('🐎','Cavalaria',c.cav)+ddLine('🛞','Cerco',c.cerco)+(c.tanque?ddLine('🛡️','Blindados',c.tanque):'')+ddLine('⛵','Navios',c.navio)+(c.sup?ddLine('🎖️','Generais e espiões',c.sup):'')+
    ddLine('⚔️','Total',n,'pop '+P.pop+'/'+P.cap)+(foes?ddLine('👁️','Inimigos à vista',foes):'')}
function ddPes(){const P=G.P[0],L=[];
  for(const b of G.B){if(b.dead||b.o!==0||b.done<1)continue;for(const id of(BT[b.type].res||[])){const T=TECH[id];if(!T||P.techs.includes(id)||T.age>P.age||(T.req&&!P.techs.includes(T.req))||L.some(x=>x.id===id))continue;if(G.B.some(x=>!x.dead&&x.o===0&&x.q.includes('t:'+id)))continue;L.push({id,T,b,ok:afford(0,T.cost)})}}
  L.sort((a,b)=>(b.ok-a.ok));
  const lab=[];for(const b of G.B)if(!b.dead&&b.o===0&&b.q&&b.q.length){const q=b.q[0];if(typeof q==='string'&&q.startsWith('t:')&&TECH[q.slice(2)])lab.push('⏳ '+TECH[q.slice(2)].n)}
  let h=lab.slice(0,3).map(t=>'<div class="pr"><span class="nm" style="max-width:150px">'+t+'</span></div>').join('');
  h+=L.slice(0,6).map(x=>'<div class="pr"'+(x.ok?'':' style="opacity:.6"')+'><span class="nm" style="max-width:118px">'+(x.T.ic||'🔬')+' '+x.T.n.replace('Evoluir: ','⏫ ')+'</span><span class="tr" style="min-width:0;color:#ffd96a">'+BT[x.b.type].n.split(' ')[0]+'</span></div>').join('');
  if(!L.length&&!lab.length)h+='<div class="pr"><span class="nm" style="max-width:150px">Nada novo para pesquisar agora</span></div>';
  else if(L.length>6)h+='<div class="pr"><span class="nm">+'+(L.length-6)+' outras</span></div>';return h}
function ptsDraw(){const el=$('ptsl');if(!el||!G||!HS.p.pts||!HS.p.pts.v)return;const m=DD_M[DDM][0];
  const ti='<div class="ti">'+(m==='off'?'':DD_M[DDM][1])+'<u>📊</u></div>';
  const h=m==='pol'?ddPol()+ti:m==='eco'?ddEco()+ti:m==='mil'?ddMil()+ti:m==='pes'?ddPes()+ti:ti;
  if(el._h!==h){el.innerHTML=h;el._h=h;try{layoutHUD()}catch(e){}}}
{let acc=0;const rt=ronTick;ronTick=function(dt){rt(dt);acc+=dt;if(acc>=1){acc=0;try{ptsDraw()}catch(e){}}}}
{const sg=startGame;startGame=function(){sg();try{const el=$('ptsl');if(el)el._h='';ptsDraw();layoutHUD()}catch(e){}};window.__RA.startGame=startGame}
// tocar troca o modo (como o botão do Data Display do Rise)
$('ptsl').addEventListener('click',ev=>{ev.stopPropagation();if(!G)return;DDM=(DDM+1)%DD_M.length;try{localStorage.setItem('imperio_dd',DDM)}catch(e){}snd('click');$('ptsl')._h='';ptsDraw()});
try{HELP_ID.ptsl=['Painel de dados','Como no Rise: toque para trocar. Nações (era, % de terra e pontos), Economia (aldeões em cada trabalho), Exército (suas tropas por tipo), Pesquisas (o que dá para pesquisar) e escondido. Pontos = Exército + Combate + Território + Cidades + Economia + Pesquisa + Maravilhas.']}catch(e){}
