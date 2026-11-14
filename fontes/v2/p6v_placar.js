
// =========================================================
//   PLACAR FINAL COMPLETO (Versão 66), no espírito do Age II e do Rise of Nations:
//   abas Resumo · Militar · Economia · Tecnologia · Linha do tempo (gráfico de pontos).
//   O jogo passa a anotar, durante a partida: recursos por tipo, prédios destruídos e perdidos,
//   maior exército, maior número de aldeões, quando cada era foi alcançada e os pontos a cada 20 s.
// =========================================================
function stInit(){if(!G||!G.st)return;const S=G.st,z=()=>new Array(NP).fill(0);
  if(!S.gt){S.gt=Array.from({length:NP},()=>({food:0,wood:0,gold:0,stone:0,oil:0}))}
  for(const k of['bk','bl','army','vmax','tmax','terr','conv'])if(!S[k])S[k]=z();
  if(!S.ageT)S.ageT=Array.from({length:NP},(_,p)=>[0]);if(!S.tl)S.tl=[];if(S.lastAge==null)S.lastAge=G.P.map(P=>P.age)}
// pontos: militar (abates e prédios derrubados), economia (recursos), tecnologia (eras e pesquisas), sociedade (terra e maravilha)
function scoreOf(p){const S=G.st,P=G.P[p];if(!P)return{mil:0,eco:0,tec:0,soc:0,tot:0};
  const mil=Math.round((S.kill[p]||0)*12+((S.bk&&S.bk[p])||0)*35);
  const eco=Math.round((S.gath[p]||0)/10);
  const tec=Math.round(P.age*150+(P.techs?P.techs.length:0)*20+(P.mil||0)*25);
  const soc=Math.round(domShare(p)*600+(G.B.some(b=>!b.dead&&b.o===p&&b.type==='maravilha'&&b.done>=1)?300:0));
  return{mil,eco,tec,soc,tot:mil+eco+tec+soc}}
// recursos por tipo: todo recurso coletado passa pelo limite de comércio (capAdd)
{const cOld=capAdd;capAdd=function(o,k,a){const g=cOld(o,k,a);try{if(o<NP&&G.st){stInit();const T=G.st.gt[o];if(T&&k in T)T[k]+=g}}catch(e){}return g}}
// prédios derrubados e perdidos
{const kOld=kill;kill=function(e,by){const was=e&&!e.dead;kOld(e,by);
  try{if(was&&e.k==='b'&&e.done>=1&&e.type!=='muralha'&&G.st){stInit();if(e.o<NP)G.st.bl[e.o]++;if(by!=null&&by<NP&&by!==e.o)G.st.bk[by]++}}catch(x){}}}
// a cada segundo: eras, maior exército, maior número de aldeões, território; a cada 20 s, a linha do tempo
{const ceOld=checkEnd;checkEnd=function(){try{stTick()}catch(e){}return ceOld()}}
function stTick(){if(!G||G.over)return;stInit();const S=G.st;
  const arm=new Array(NP).fill(0),vil=new Array(NP).fill(0);
  for(const u of G.U){if(u.dead||u.o>=NP)continue;if(u.type==='vill')vil[u.o]++;else if(isMil(u))arm[u.o]++}
  for(let p=0;p<NP;p++){S.army[p]=Math.max(S.army[p],arm[p]);S.vmax[p]=Math.max(S.vmax[p],vil[p]);S.terr[p]=Math.max(S.terr[p],domShare(p));
    const a=G.P[p].age;if(a>(S.lastAge[p]||0)){for(let k=(S.lastAge[p]||0)+1;k<=a;k++)S.ageT[p][k]=G.t;S.lastAge[p]=a}
    S.tmax[p]=Math.max(S.tmax[p],G.P[p].techs?G.P[p].techs.length:0)}
  const last=S.tl.length?S.tl[S.tl.length-1][0]:-99;
  if(G.t-last>=20){S.tl.push([Math.round(G.t)].concat(G.P.map((_,p)=>scoreOf(p).tot)));if(S.tl.length>400)S.tl=S.tl.filter((_,i)=>i%2===0)}}

// ---------- a tela ----------
{const css=document.createElement('style');css.textContent=`
#end{justify-content:flex-start;padding:max(8px,env(safe-area-inset-top)) 12px 8px;gap:6px;overflow:hidden}
#end .ttl{font-size:clamp(28px,8vh,52px);line-height:1.25;padding-top:.12em;letter-spacing:8px;flex:none}
#end .card{flex:1 1 auto;min-height:0;overflow:auto;width:min(760px,96vw);max-width:none;padding:0;font-size:13px;display:flex;flex-direction:column}
#end #bend{flex:none;margin:0}
.ptabs{display:flex;gap:2px;padding:6px 6px 0;background:linear-gradient(#3a2a14,#2a1d0c);flex:none;overflow-x:auto}
.ptabs button{flex:1 0 auto;font:700 13px Georgia,serif;color:#e9d39a;background:#4a3518;border:1px solid #7a5a26;border-bottom:none;border-radius:6px 6px 0 0;padding:6px 10px;white-space:nowrap}
.ptabs button.on{background:linear-gradient(#f1e2bb,#e2cd9f);color:#2a1a08}
.pbody{padding:8px 12px 10px;overflow:auto;flex:1 1 auto;min-height:0}
.pmsg{font-weight:700;font-size:15px;text-align:center;margin:2px 0 4px}
.pmeta{text-align:center;opacity:.85;margin-bottom:6px}
.ptab{width:100%;border-collapse:collapse;font-size:12.5px}
.ptab th{font-size:11.5px;text-align:right;padding:3px 6px;border-bottom:2px solid #a77b2c;color:#5a3a10;white-space:nowrap}
.ptab th:nth-child(2),.ptab td:nth-child(2){text-align:left}
.ptab td{text-align:right;padding:3px 6px;border-bottom:1px solid #c9ad74;white-space:nowrap}
.ptab tr.me td{background:#f7ecc8;font-weight:700}
.ptab tr.out td{opacity:.55}
.ptab .sw{display:inline-block;width:11px;height:11px;border:1px solid #000;vertical-align:-1px}
.ptab td.best{color:#7a3d00;font-weight:700}
.pnote{font-size:11.5px;opacity:.8;margin-top:6px;font-style:italic;text-align:center}
#pgraf{width:100%;height:clamp(110px,calc(100vh - 240px),300px);display:block;background:#efe0b6;border:1px solid #a77b2c;border-radius:3px}
.pleg{display:flex;flex-wrap:wrap;gap:4px 12px;justify-content:center;margin-top:5px;font-size:12px}`;document.head.appendChild(css)}

let PL_TAB='res',PL_MSG='',PL_WIN=false;
const PL_TABS=[['res','🏆 Resumo'],['mil','⚔ Militar'],['eco','💰 Economia'],['tec','📜 Tecnologia'],['tl','📈 Linha do tempo']];
function plRow(p,cells){const out=G.P[p]&&G.P[p]._out;return'<tr class="'+(p===0?'me':'')+(out?' out':'')+'"><td><span class="sw" style="background:'+COL[p].m+'"></span></td><td>'+civOf(p).n+(p===0?' (você)':ally(p,0)?' 🤝':'')+'</td>'+cells.map(c=>'<td'+(c[1]?' class="best"':'')+'>'+c[0]+'</td>').join('')+'</tr>'}
function plTable(head,vals,fmt){// vals[p] = lista de números; destaca o maior de cada coluna
  const best=head.map((_,i)=>Math.max(...vals.map(v=>typeof v[i]==='number'?v[i]:-1)));
  return'<table class="ptab"><tr><th></th><th>Nação</th>'+head.map(h=>'<th>'+h+'</th>').join('')+'</tr>'+
    vals.map((v,p)=>plRow(p,v.map((x,i)=>[fmt?fmt(x,i):x,typeof x==='number'&&x>0&&x===best[i]&&vals.filter(w=>w[i]===best[i]).length===1]))).join('')+'</table>'}
const plN=x=>typeof x==='number'?Math.round(x).toLocaleString('pt-BR'):x;
function plBody(){stInit();const S=G.st,ps=G.P.map((_,p)=>p);
  if(PL_TAB==='res'){const sc=ps.map(scoreOf);
    return'<div class="pmsg">'+PL_MSG+'</div><div class="pmeta">'+civOf(0).n+' · '+NP+' nações · '+DIFF[G.diff].n+' · ⏱ '+fmtT(G.t)+' · '+AGES[G.P[0].age]+'</div>'+
      plTable(['Pontos','Militar','Economia','Tecnologia','Sociedade'],sc.map(s=>[s.tot,s.mil,s.eco,s.tec,s.soc]),plN)+
      '<div class="pnote">Pontos: militar = abates e prédios derrubados · economia = recursos coletados · tecnologia = eras e pesquisas · sociedade = terra dominada e Maravilha</div>'}
  if(PL_TAB==='mil')return plTable(['Abates','Perdas','Prédios derrubados','Prédios perdidos','Maior exército'],ps.map(p=>[S.kill[p],S.lost[p],S.bk[p],S.bl[p],S.army[p]]),plN)+
      '<div class="pnote">Abates e perdas contam soldados e aldeões. "Maior exército" é o máximo de soldados que a nação teve ao mesmo tempo.</div>';
  if(PL_TAB==='eco')return plTable(['🍖 Comida','🪵 Madeira','🪨 Pedra','🪙 Ouro','🛢 Petróleo','Total','Aldeões (máx.)'],ps.map(p=>{const T=S.gt[p]||{};return[T.food|0,T.wood|0,T.stone|0,T.gold|0,T.oil|0,S.gath[p]|0,S.vmax[p]]}),plN)+
      '<div class="pnote">O total também soma riqueza do comércio e conhecimento dos eruditos.</div>';
  if(PL_TAB==='tec'){const head=['Era alcançada','Pesquisas','Org. Militar','Terra (máx.)'];
    let t=plTable(head,ps.map(p=>[AGES[G.P[p].age].replace('Era ','').replace('da ','').replace('do ',''),(G.P[p].techs||[]).length,G.P[p].mil||0,Math.round(S.terr[p]*100)+'%']));
    const maxA=Math.max(...ps.map(p=>G.P[p].age));
    if(maxA>0){t+='<table class="ptab" style="margin-top:8px"><tr><th></th><th>Quando chegou na era</th>'+AGES.slice(1,maxA+1).map(a=>'<th>'+a.replace('Era ','').replace('da ','').replace('do ','')+'</th>').join('')+'</tr>'+
      ps.map(p=>{const at=S.ageT[p]||[];const v=[];for(let a=1;a<=maxA;a++)v.push(at[a]!=null?at[a]:null);
        const best=v.map((x,i)=>Math.min(...ps.map(q=>(S.ageT[q]||[])[i+1]).filter(y=>y!=null)));
        return plRow(p,v.map((x,i)=>[x==null?'—':fmtT(x),x!=null&&x===best[i]&&NP>1]))}).join('')+'</table>'}
    return t}
  if(PL_TAB==='tl')return'<canvas id="pgraf"></canvas><div class="pleg">'+ps.map(p=>'<span><span class="sw" style="display:inline-block;width:11px;height:11px;border:1px solid #000;vertical-align:-1px;background:'+COL[p].m+'"></span> '+civOf(p).n+'</span>').join('')+'</div><div class="pnote">Pontos de cada nação ao longo da partida (marcados a cada 20 segundos).</div>';
  return''}
function plDraw(){const c=$('pgraf');if(!c)return;const S=G.st;const tl=S.tl.slice();tl.push([Math.round(G.t)].concat(G.P.map((_,p)=>scoreOf(p).tot)));
  const dpr=Math.min(2,window.devicePixelRatio||1),W=c.clientWidth||600,H=c.clientHeight||200;c.width=W*dpr;c.height=H*dpr;const g=c.getContext('2d');g.scale(dpr,dpr);
  const L=46,R=22,T=10,B=24,tmax=Math.max(60,tl[tl.length-1][0]);let vmax=10;for(const r of tl)for(let i=1;i<r.length;i++)vmax=Math.max(vmax,r[i]);
  const nice=x=>{const m=Math.pow(10,Math.floor(Math.log10(x)));return Math.ceil(x/m)*m};vmax=nice(vmax*1.05);
  const X=t=>L+(W-L-R)*t/tmax,Y=v=>T+(H-T-B)*(1-v/vmax);
  g.font='11px Georgia,serif';g.fillStyle='#5a3a10';g.strokeStyle='rgba(90,58,16,.18)';g.lineWidth=1;
  for(let i=0;i<=4;i++){const v=vmax*i/4,y=Y(v);g.beginPath();g.moveTo(L,y);g.lineTo(W-R,y);g.stroke();g.textAlign='right';g.fillText(plN(v),L-5,y+4)}
  const step=tmax>1800?600:tmax>600?300:60;g.textAlign='center';for(let t=0;t<=tmax;t+=step){g.fillText(fmtT(t),X(t),H-7)}
  for(let p=NP-1;p>=0;p--){g.strokeStyle=COL[p].m;g.lineWidth=p===0?3:1.8;g.beginPath();tl.forEach((r,i)=>{const x=X(r[0]),y=Y(r[p+1]||0);i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()}}
function plRender(){$('ends').innerHTML='<div class="ptabs">'+PL_TABS.map(([k,n])=>'<button data-k="'+k+'" class="'+(k===PL_TAB?'on':'')+'">'+n+'</button>').join('')+'</div><div class="pbody">'+plBody()+'</div>';
  $('ends').querySelectorAll('.ptabs button').forEach(b=>b.onclick=()=>{snd('click');PL_TAB=b.dataset.k;plRender()});
  if(PL_TAB==='tl')requestAnimationFrame(plDraw)}
{const eOld=endGame;endGame=function(win,msg){
  try{stInit();stTick();for(let p=0;p<NP;p++)G.P[p]._out=!G.U.some(u=>!u.dead&&u.o===p)&&!G.B.some(b=>!b.dead&&b.o===p&&b.type==='tc')}catch(e){}
  eOld(win,msg);PL_WIN=win;PL_MSG=msg+'<br><i style="font-weight:400;font-size:13px">'+(win?'Seu nome será lembrado pelas próximas gerações.':'Até os grandes impérios começaram com uma derrota. Tente outra vez!')+'</i>';PL_TAB='res';
  try{plRender()}catch(e){console.warn('placar',e)}}}
window.addEventListener('resize',()=>{if(PL_TAB==='tl'&&$('end')&&$('end').style.display!=='none')plDraw()});
