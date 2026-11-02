
// =========================================================
//   AS 8 ERAS (como no Rise of Nations)
//   Antiga · Clássica · Medieval · Pólvora · Iluminismo · Industrial · Moderna · Informação
//   avança na Biblioteca, sem exigir outros prédios
// =========================================================
// era antiga (0..6 de antes) -> era nova (0..7)
const AGE_MAP=[0,0,1,2,3,5,6];
for(const t in UT)if(UT[t].age!=null)UT[t].age=AGE_MAP[UT[t].age];
for(const t in BT)if(BT[t].age!=null)BT[t].age=AGE_MAP[BT[t].age];
for(const t in TECH)if(TECH[t].age!=null)TECH[t].age=AGE_MAP[TECH[t].age];
for(let i=0;i<MILAGE.length;i++)MILAGE[i]=AGE_MAP[MILAGE[i]];
// ajustes para encher as eras novas
UT.fuzil.age=4;                       // Iluminismo: fuzileiro
UT.tanque.age=6;UT.assalto.age=6;     // Moderna
BT.silo.age=7;                        // Informação: Silo de Mísseis
BT.refinaria.age=5;BT.fabrica.age=5;UT.artilharia.age=5;UT.encour.age=5;
// Rise: a era se pesquisa na Biblioteca (o requisito vira "ter uma Biblioteca")
for(let a=1;a<=MAXAGE;a++)AGEREQ[a]=['biblioteca','biblioteca'];
ageReqMsg=function(p){const P=G.P[p];if(P.age>=MAXAGE)return null;return hasReq(p,'biblioteca')?null:'Requer uma Biblioteca'};
// caça: faca na Antiga, arco a partir da Clássica, arma a partir da Pólvora
huntTier=function(o){const a=G.P[o].age;return a>=3?2:a>=1?1:0};
// ícones das eras: reaproveita os antigos e cria Iluminismo e Moderna
{const E=ERA_ART.slice(),emo=(c1,c2,ch)=>g=>{medal(g,c1,c2);g.font='34px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ch,40,42)};
  const NEW=[E[0],E[2],E[3],E[4],emo('#d8c08a','#4a3418','📜'),E[5],emo('#8aa8c8','#1a2a3a','✈️'),E[6]];
  for(let i=0;i<NEW.length;i++)ERA_ART[i]=NEW[i]||E[0];for(const k in ICO)if(/^era/.test(k))delete ICO[k]}
// partidas salvas antes: as eras antigas viram as novas
const loadGame8=loadGame;
loadGame=function(){const ok=loadGame8();if(ok&&G&&!G.era8){for(const P of G.P)if(P&&P.age!=null)P.age=AGE_MAP[Math.min(6,P.age)];G.era8=1}return ok};
const newGame8=newGame;
newGame=function(o){newGame8(o);G.era8=1};
window.__RA.newGame=newGame;
// atalho: seleciona a Biblioteca (onde se avança de era)
function quickLib(){const t=G.B.filter(b=>!b.dead&&b.o===0&&b.type==='biblioteca'&&b.done>=1);if(!t.length){toast('📚 Construa uma Biblioteca: é nela que se avança de era');return}
  const b=t[UI.idleIdx++%t.length];SEL=[b.id];const c=ctr(b);centerOn(c.x,c.y);UI.sig='';updHUD(true)}
