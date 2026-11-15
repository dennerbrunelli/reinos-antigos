
// =========================================================
//   RECURSOS RAROS como no Rise of Nations (Versão 69)
//   · O mercador chega no recurso raro e "monta a barraca": a carroça vira uma casinha de comércio
//     (com a cor do dono) enquanto ele trabalha ali. Se sair, a barraca é desmontada.
//   · Raros e ruínas passam a ser desenhados na mesma ordem de profundidade que árvores, prédios e
//     unidades (antes eram pintados por baixo de tudo e as árvores da frente os cobriam).
//   · Árvores coladas num raro ou numa ruína são tiradas ao criar o mapa (e ao abrir um jogo salvo).
// =========================================================
function clearAroundRon(){if(!G||!G.R)return 0;let n=0;const pts=(G.rare||[]).concat(G.ruins||[]);if(!pts.length)return 0;
  for(const r of G.R){if(r.dead||r.walk||r.sub!=='tree')continue;
    for(const p of pts){const dx=r.tx-p.x,dy=r.ty-p.y;
      // raio 1,6 em volta, e um pouco mais para a frente (lado de baixo da tela), que é onde a copa cobre
      if(Math.hypot(dx,dy)<=1.6||(dx>=0&&dy>=0&&dx+dy<=3)){const i=idx(r.tx,r.ty);r.dead=true;E.delete(r.id);if(occ[i]===r.id){occ[i]=0;if(!G.terr[i])pass[i]=1}n++;break}}}
  if(n)G.R=G.R.filter(r=>!r.dead);return n}
{const nOld=newGame;newGame=function(o){nOld(o);try{clearAroundRon()}catch(e){}};window.__RA.newGame=newGame}
{const lOld=loadGame;loadGame=function(){const ok=lOld();if(ok)try{clearAroundRon()}catch(e){}return ok}}

// ---- desenho na ordem certa ----
const ronUp0=drawRonUp;
drawRonUp=function(){if(!G.rare)return;
  (G.ruins||[]).forEach((r,i)=>{r.vi=i});
  for(const r of G.rare){if(!G.exp[idx(r.x,r.y)])continue;drawList.push({k:'ron',t:'rare',r,_d:(r.x+r.y+1)*TS})}
  for(const r of G.ruins||[]){if(!G.exp[idx(r.x,r.y)])continue;drawList.push({k:'ron',t:'ruin',r,_d:(r.x+r.y+1)*TS})}};
function drawRonOne(e){const svR=G.rare,svU=G.ruins;
  // a função antiga desenha listas inteiras: dá a ela uma lista de um item só (sem renumerar as ruínas)
  const one=[e.r];one.forEach=function(){};
  G.rare=e.t==='rare'?one:[];G.ruins=e.t==='ruin'?one:[];G.ruins.forEach=function(){};
  try{ronUp0()}finally{G.rare=svR;G.ruins=svU}}

// ---- a barraca do mercador ----
function rareOfMerchant(u){if(u.type!=='mercador'||u.st!=='rare'||u.mv||u.rare==null||!G.rare)return null;const r=G.rare[u.rare];if(!r||r.w!==u.id)return null;
  return hyp((r.x+.5)*TS-u.x,(r.y+1.4)*TS-u.y)<TS*1.3?r:null}
function drawStall(u,r,a){const sp=SPR['bmercado'+u.o];if(!sp)return false;const lit=vis[idx(r.x,r.y)]||u.o===0;const img=lit?sp.c:sp.dk;
  const k=.5*(.55+.45*a);// "abre" em menos de 1 segundo
  const I0=(r.x-r.y)*TS,J0=(r.x+r.y+1-1.5)*TS/2;
  ctx.globalAlpha=Math.min(1,.25+a);ctx.drawImage(img,I0-sp.W*k/2,J0-sp.top*k+(1-a)*6,sp.W*k,sp.H*k);ctx.globalAlpha=1;return true}
{const dOld=drawUnit;drawUnit=function(e,selSet){
  if(e.k==='ron'){drawRonOne(e);return}
  const r=rareOfMerchant(e);
  if(r){e.hutT=Math.min(1,(e.hutT||0)+1/40);const a=1-Math.pow(1-e.hutT,3);
    if(a<1)dOld(e,selSet);// a carroça ainda aparece enquanto a barraca é montada
    if(drawStall(e,r,a)){
      if(selSet&&selSet.has&&selSet.has(e.id)){const I=(r.x-r.y)*TS,J=(r.x+r.y+1)*TS/2;ctx.strokeStyle='#ffffffcc';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(I,J,TS*.9,TS*.45,0,0,7);ctx.stroke()}
      // ícone do raro por cima da barraca, para saber o que está sendo explorado
      const I=(r.x-r.y)*TS,J=(r.x+r.y+1)*TS/2,by=J-TS*2.15+Math.sin(performance.now()/600+r.x)*1.2;
      ctx.fillStyle='rgba(30,20,8,.82)';ctx.strokeStyle='#e8c46a';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(I,by,12,0,7);ctx.fill();ctx.stroke();
      ctx.drawImage(rareImg(r.kind),I-11,by-11,22,22);return}
    return dOld(e,selSet)}
  if(e.type==='mercador')e.hutT=0;
  return dOld(e,selSet)}}
