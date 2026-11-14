// =========================================================
//   BOTÕES DE COMANDO: todos com o mesmo estilo de medalhão, com nome embaixo, sem fileira de cadeados
//   - comandos que usavam emoji solto (🔁 🚨 🤖 ⚖️ 🏛 📤…) ganham desenho próprio em medalhão
//   - o que só libera daqui a duas eras ou mais não aparece; o que libera na próxima era aparece
//     apagado com o número da era no canto, em vez de cadeado
//   - cada botão mostra embaixo, em uma palavra, o que ele faz
// =========================================================
Object.assign(CMD_ART,{
  patrol:g=>{medal(g,'#5a8ac8','#162c52');for(const s of[1,-1]){g.save();g.translate(40,40);g.scale(s,s);stroke2(g,()=>{g.beginPath();g.arc(0,0,17,-2.6,-.35)},4.5,'#fff1c0');fillP(g,[[20,-10],[22,4],[9,-1]],'#fff1c0');g.restore()}},
  bell:g=>{medal(g,'#c8503c','#52120a');fillP(g,[[40,17],[52,26],[54,46],[60,54],[20,54],[26,46],[28,26]],'#f0c860');g.beginPath();g.arc(40,58,5,0,7);g.fillStyle='#f0c860';g.fill();g.lineWidth=2;g.strokeStyle='#1a0e04';g.stroke();
    stroke2(g,()=>{g.beginPath();g.moveTo(14,26);g.lineTo(20,32);g.moveTo(66,26);g.lineTo(60,32)},2.5,'#fff1c0')},
  gear:g=>{medal(g,'#4aa090','#123a34');const p=[];for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?22:16;p.push([40+Math.cos(a-.12)*r,40+Math.sin(a-.12)*r],[40+Math.cos(a+.12)*r,40+Math.sin(a+.12)*r])}fillP(g,p,'#e8ecf0');
    g.beginPath();g.arc(40,40,7,0,7);g.fillStyle='#123a34';g.fill();g.lineWidth=2;g.strokeStyle='#1a0e04';g.stroke()},
  scales:g=>{medal(g,'#c8a040','#4a3008');stroke2(g,()=>{g.beginPath();g.moveTo(40,18);g.lineTo(40,60);g.moveTo(20,26);g.lineTo(60,26);g.moveTo(30,60);g.lineTo(50,60)},3.5,'#fff1c0');
    for(const x of[20,60]){stroke2(g,()=>{g.beginPath();g.moveTo(x,26);g.lineTo(x-9,44);g.moveTo(x,26);g.lineTo(x+9,44)},1.6,'#fff1c0');fillP(g,[[x-11,44],[x+11,44],[x+6,50],[x-6,50]],'#f0c860')}},
  queue:g=>{medal(g,'#a07a50','#3a2410');fillP(g,[[26,18],[54,18],[54,22],[43,40],[54,58],[54,62],[26,62],[26,58],[37,40],[26,22]],'#e8ecf0');fillP(g,[[32,56],[48,56],[40,46]],'#f0c860');fillP(g,[[34,26],[46,26],[40,36]],'#f0c860')},
  city:g=>{medal(g,'#9aa0a8','#30343c');fillP(g,[[18,30],[40,16],[62,30]],'#f1e4c2');fillP(g,[[20,30],[60,30],[60,35],[20,35]],'#d8c79a');for(const x of[24,35,46,57])fillP(g,[[x-3,35],[x+3,35],[x+3,56],[x-3,56]],'#f1e4c2');fillP(g,[[17,56],[63,56],[63,62],[17,62]],'#d8c79a')},
  power:g=>{medal(g,'#9a62c8','#2c1250');const p=[];for(let i=0;i<16;i++){const a=i*Math.PI/8-Math.PI/2,r=i%2?10:24;p.push([40+Math.cos(a)*r,40+Math.sin(a)*r])}fillP(g,p,'#ffe08a')},
  ungar:g=>{medal(g,'#6a9a58','#1e3a14');fillP(g,[[20,60],[20,30],[40,18],[60,30],[60,60],[48,60],[48,42],[32,42],[32,60]],'#e8d8b0');stroke2(g,()=>{g.beginPath();g.moveTo(40,46);g.lineTo(40,66)},4,'#fff1c0');fillP(g,[[32,60],[48,60],[40,72]],'#fff1c0')},
  generic:g=>{medal(g,'#a08a60','#3a2a10')}
});
// versão "desligado": o mesmo desenho apagado, com uma barra vermelha atravessada
for(const k of['gear','queue'])CMD_ART[k+'Off']=g=>{g.save();g.filter='grayscale(.8) brightness(.75)';CMD_ART[k](g);g.restore();stroke2(g,()=>{g.beginPath();g.moveTo(18,62);g.lineTo(62,18)},5,'#e04030','#fff')};
// emoji que sobrar sem desenho próprio entra dentro de um medalhão, para não destoar
function emojiIcon(ic){const key='e'+ic;if(!ICO[key]){const[c,g]=icoC();CMD_ART.generic(g);g.font='32px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor='#000a';g.shadowBlur=4;g.fillText(ic,40,42);ICO[key]=c.toDataURL()}return ICO[key]}
const CMD_BYNAME=[['Patrulhar','patrol'],['Alarme','bell'],['Coleta automática','gear'],['Plano de coleta','scales'],['Fila automática','queue'],['Ver prédios','city'],['Desguarnecer','ungar']];
const CMD_SHORT={'Centro Urbano':'Cidade','Acampamento de lenhadores':'Lenhador','Ver prédios da cidade':'Prédios','Atacar o inimigo mais perto':'Atacar','Recuar para a cidade':'Recuar','Desembarcar aqui':'Desembarcar',
  'Coleta automática':'Auto','Plano de coleta':'Coleta','Fila automática de aldeões':'Fila','Oficina de Cerco':'Oficina','Silo de Mísseis':'Silo','Soldado de Assalto':'Assalto','Espada Longa':'Esp. Longa','Organização Militar':'Exército'};
function cmdShort(c){let n=String(c.nm||'').split(/[:·(]/)[0].trim();if(c.kind==='age')return'Avançar';if(c.pw)return'Poder';
  for(const k in CMD_SHORT)if(n.startsWith(k))return CMD_SHORT[k];
  n=n.replace(/ (I|II|III|IV|V|VI|VII|VIII)$/,'');if(n.length<=11)return n;const w=n.split(' ');return w[0].length>=4?w[0].slice(0,11):(w[0]+' '+(w[1]||'')).slice(0,11)}
const getCmdsBt=getCmds;
getCmds=function(){const P=G.P[0],pwN=typeof POWER!=='undefined'&&POWER[civOf(0).id]?POWER[civOf(0).id].n:null;
  const out=getCmdsBt().filter(c=>{if(!c.lock)return true;const a=c.kind==='u'&&UT[c.key]?UT[c.key].age:c.kind==='b'&&BT[c.key]?BT[c.key].age:null;if(a==null)return true;c.eraN=a;return a<=P.age+1});
  for(const c of out){const nm=String(c.nm),m=CMD_BYNAME.find(([k])=>nm.startsWith(k));
    if(m){c.img=cmdIcon(m[1]+(/deslig/i.test(nm)&&CMD_ART[m[1]+'Off']?'Off':''));continue}   // estes sempre com o desenho novo
    if(c.img||!c.ic)continue;
    if(pwN&&nm.startsWith(pwN)){c.pw=1;c.img=cmdIcon('power');continue}
    c.img=emojiIcon(c.ic)}
  return out};
const updHUDBt=updHUD;
updHUD=function(force){updHUDBt(force);if(!G||!running)return;const box=$('cmds');if(!box)return;const cs=getCmds(),n=box.children.length;
  [...box.children].forEach((b,i)=>{const c=cs[i];if(!c)return;const lb=cmdShort(c);if(b.dataset.lb!==lb)b.dataset.lb=lb;
    const er=c.lock&&c.eraN!=null?ROMAN[c.eraN+1]:'';if((b.dataset.era||'')!==er){if(er)b.dataset.era=er;else delete b.dataset.era}});
  if(document.body.classList.contains('free')){const cols='repeat('+Math.max(1,Math.min(6,n))+',46px)';if(box.style.gridTemplateColumns!==cols){box.style.gridTemplateColumns=cols;setTimeout(layoutHUD,0)}}
  else if(box.style.gridTemplateColumns)box.style.gridTemplateColumns=''};
{const css=document.createElement('style');css.textContent=`
.free #pCmd #cmds,.free #pCmd.one #cmds{grid-auto-flow:row;grid-auto-columns:auto;grid-template-rows:none;grid-auto-rows:54px;gap:1px 2px;min-width:46px;padding:2px 3px 0}
.free #pCmd .cb,.free #pCmd.one .cb{width:42px;height:42px;overflow:visible;justify-self:center}
.free #pCmd .cb img,.free #pCmd.one .cb img{width:38px;height:38px;border-radius:3px}
.free #pCmd .cb::after{content:attr(data-lb);position:absolute;top:calc(100% + 1px);left:50%;transform:translateX(-50%);width:48px;text-align:center;font:600 8.5px/1 Georgia,serif;color:#efe3c4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 1px #000;pointer-events:none}
.free #pCmd .cb.off::after{color:#b9a981}
#cmds .cb[data-era] .lk{display:none}
#cmds .cb[data-era]{filter:grayscale(.7) brightness(.62)}
#cmds .cb[data-era]::before{content:attr(data-era);position:absolute;right:2px;top:1px;font:700 10px/1 Georgia,serif;color:#f0c96a;text-shadow:0 0 2px #000,0 0 3px #000;z-index:2}
`;document.head.appendChild(css)}
