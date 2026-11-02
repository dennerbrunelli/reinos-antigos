'use strict';
/* =========================================================
   IMPÉRIO (antes "Reinos Antigos")
   Estratégia em tempo real offline, visão em diagonal (isométrica).
   Tudo (desenhos, sons e música) é gerado pelo próprio código.
   Feito para rodar leve no celular (Galaxy A05s).
   ========================================================= */
const TS=32,TOPH=30;let MW=72,MH=72,N=MW*MH;   // tamanho do mapa muda por partida (setMapSize)
// população como no Rise of Nations: sem casas; começa em 50, cada Organização Militar dá +25 (até 200) e a Maravilha dá +50 (até 250)
const POP_BASE=50,POP_STEP=25,POP_MIL=200,POP_WONDER=50,MAXPOP=250;
const MIL_N=6,MILAGE=[0,1,1,2,2,3],MILTIME=[30,35,40,45,50,60],ROMAN=['','I','II','III','IV','V','VI','VII','VIII'];
const MILCOST=[{food:100,wood:50},{food:150,gold:50},{food:200,gold:100},{food:300,gold:150},{food:400,gold:250},{food:500,gold:350}];
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const idx=(x,y)=>y*MW+x;
const inMap=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH;
const hyp=Math.hypot;
// os 6 recursos do Rise: comida, madeira, metal (chave interna 'gold'), riqueza, conhecimento e petróleo (eras industriais)
const RES=['food','wood','gold','wealth','know','oil'];
const RNM={food:'comida',wood:'madeira',gold:'metal',wealth:'riqueza',know:'conhecimento',oil:'petróleo',stone:'metal'};
const AGES=['Era Antiga','Era Clássica','Era Medieval','Era da Pólvora','Era do Iluminismo','Era Industrial','Era Moderna','Era da Informação'];
const MAXAGE=7;
const AGECOST=[null,{food:350,wealth:60},{food:700,wealth:150,know:100},{food:1000,gold:400,wealth:250,know:250},{food:1300,gold:700,wealth:400,know:450},{food:1700,gold:1000,wealth:600,know:700},{food:2200,gold:1300,wealth:900,know:1000,oil:300},{food:2800,gold:1700,wealth:1200,know:1400,oil:600}];
const AGETIME=[0,50,65,80,95,110,130,150];
// para avançar de era: ter 2 prédios diferentes desta lista (da era atual)
const AGEREQ=[null,['celeiro','deposito','quartel','doca'],['mercado','arquearia','estabulo'],['templo','academia','oficina']];
const COL=[{m:'#2f6fd8',d:'#1b438c',l:'#a7c8ff'},{m:'#cf3328',d:'#86201a',l:'#ffab9f'},{m:'#c8b890',d:'#8a7a5a',l:'#eee'}];

// ---------- UNIDADES ----------
// hp vida · atk ataque · arm armadura · rng alcance (quadrados) · spd velocidade (quadrados/s) · cd intervalo de ataque
// los visão · t tempo de treino · at onde treina · spr [largura, altura, âncora x, âncora y] do desenho
const UT={
  vill:{n:'Aldeão',hp:25,atk:3,arm:0,rng:0,spd:1.2,cd:1.5,los:4,cost:{food:50},t:12,age:0,at:'tc',cls:'vill',spr:[32,46,16,42]},
  guer:{n:'Guerreiro',hp:40,atk:3,arm:0,rng:0,spd:1.2,cd:1.4,los:4,cost:{food:50},t:14,age:0,at:'quartel',cls:'inf',spr:[32,46,16,42]},
  espa:{n:'Espadachim',hp:60,atk:7,arm:1,rng:0,spd:1.2,cd:1.4,los:4,cost:{food:35,gold:15},t:18,age:2,at:'quartel',cls:'inf',spr:[32,46,16,42]},
  hopl:{n:'Hoplita',hp:120,atk:14,arm:5,rng:0,spd:.9,cd:1.6,los:4,cost:{food:60,gold:40},t:24,age:2,at:'academia',cls:'inf',spr:[36,52,18,47]},
  arq:{n:'Arqueiro',hp:35,atk:3,arm:0,rng:5,spd:1.2,cd:1.6,los:7,cost:{food:40,wood:20},t:16,age:1,at:'arquearia',cls:'arq',spr:[32,46,16,42]},
  arqc:{n:'Arqueiro Composto',hp:45,atk:5,arm:0,rng:6,spd:1.2,cd:1.6,los:8,cost:{food:40,gold:20},t:18,age:2,at:'arquearia',cls:'arq',spr:[32,46,16,42]},
  arqcav:{n:'Arqueiro a Cavalo',hp:60,atk:5,arm:1,rng:6,spd:2,cd:1.6,los:8,cost:{food:50,gold:70},t:24,age:3,at:'arquearia',cls:'arqcav',spr:[54,56,27,50]},
  bat:{n:'Batedor',hp:60,atk:3,arm:0,rng:0,spd:2.3,cd:1.4,los:9,cost:{food:100},t:18,age:1,at:'estabulo',cls:'cav',spr:[54,56,27,50]},
  cav:{n:'Cavaleiro',hp:120,atk:8,arm:1,rng:0,spd:2,cd:1.5,los:5,cost:{food:70,gold:80},t:24,age:2,at:'estabulo',cls:'cav',spr:[54,58,27,52]},
  carro:{n:'Carro de Guerra',hp:100,atk:7,arm:1,rng:0,spd:1.9,cd:1.5,los:5,cost:{food:40,wood:60},t:22,age:2,at:'estabulo',cls:'cav',bon:{sac:10},resist:2,spr:[64,52,32,46]},
  elef:{n:'Elefante de Guerra',hp:300,atk:15,arm:0,rng:0,spd:.9,cd:2,los:5,cost:{food:170,gold:40},t:30,age:3,at:'estabulo',cls:'elef',splash:.7,spr:[74,72,37,64]},
  pedra:{n:'Lança-pedras',hp:75,atk:30,arm:0,rng:10,spd:.8,cd:5,los:10,cost:{wood:180,gold:80},t:30,age:2,at:'oficina',cls:'cerco',splash:1,bon:{bld:40},spr:[58,50,29,44]},
  bal:{n:'Balista',hp:60,atk:24,arm:0,rng:9,spd:.9,cd:3,los:10,cost:{wood:100,gold:80},t:28,age:3,at:'oficina',cls:'cerco',bon:{bld:16},spr:[58,46,29,40]},
  sac:{n:'Sacerdote',hp:25,atk:0,arm:0,rng:6,spd:.8,cd:1,los:8,cost:{wealth:100},t:30,age:2,at:'templo',cls:'sac',spr:[32,50,16,45]},
  pesc:{n:'Barco Pesqueiro',hp:45,atk:0,arm:0,rng:0,spd:1.6,cd:1,los:5,cost:{wood:50},t:16,age:0,at:'doca',cls:'navio',naval:1,carry:15,spr:[66,58,33,44]},
  trans:{n:'Barco de Transporte',hp:150,atk:0,arm:0,rng:0,spd:1.7,cd:1,los:5,cost:{wood:150},t:25,age:1,at:'doca',cls:'navio',naval:1,cap:5,spr:[78,66,39,50]},
  bguer:{n:'Barco de Guerra',hp:120,atk:5,arm:0,rng:6,spd:1.8,cd:1.8,los:7,cost:{wood:135},t:30,age:1,at:'doca',cls:'navio',naval:1,war:1,spr:[78,74,39,58]},
  trir:{n:'Trirreme',hp:200,atk:8,arm:1,rng:7,spd:1.9,cd:1.6,los:8,cost:{wood:135,gold:75},t:36,age:2,at:'doca',cls:'navio',naval:1,war:1,spr:[92,82,46,64]},
  gaz:{n:'Gazela',hp:8,atk:0,arm:0,rng:0,spd:1.3,cd:1,los:4,cls:'animal',food:150,flee:1,spr:[42,38,21,33]},
  elfs:{n:'Elefante Selvagem',hp:110,atk:9,arm:0,rng:0,spd:1.1,cd:2,los:4,cls:'animal',food:300,fight:1,spr:[70,64,35,57]},
  leao:{n:'Leão',hp:30,atk:4,arm:0,rng:0,spd:1.6,cd:1.3,los:4,cls:'animal',food:100,fight:1,aggro:3,spr:[48,36,24,31]},
};
// ---------- PRÉDIOS ----------
// sz tamanho em quadrados · t tempo de construção (1 aldeão) · h altura do desenho · pg página do menu (0 econ., 1 militar)
const BT={
  tc:{n:'Centro Urbano',sz:3,hp:600,cost:{food:300,wood:200,gold:100},t:60,age:1,drop:['food','wood','gold','stone','oil'],train:['vill'],pop:5,los:7,pg:0,shoot:{atk:2,rng:6,cd:2},h:78},
  casa:{n:'Casa',sz:2,hp:120,cost:{wood:30},t:15,age:0,pop:4,los:2,pg:0,h:46},
  celeiro:{n:'Celeiro',sz:2,hp:300,cost:{wood:120},t:30,age:0,drop:['food'],los:3,pg:0,res:['sentinela','muralhaF'],h:52},
  deposito:{n:'Depósito',sz:2,hp:300,cost:{wood:120},t:30,age:0,drop:['wood','gold','stone','oil'],los:3,pg:0,res:['couro','ferraria','escudo','arcos','forja'],h:42},
  doca:{n:'Doca',sz:2,hp:350,cost:{wood:100},t:30,age:0,water:1,train:['pesc','trans','bguer','trir'],dropN:['food'],los:5,pg:0,res:['velas','casco'],h:52},
  mercado:{n:'Mercado',sz:3,hp:400,cost:{wood:150},t:40,age:1,req:'celeiro',los:3,pg:0,res:['enxada','serra','picareta','roda','arado','irrigacao'],h:50},
  fazenda:{n:'Fazenda',sz:3,hp:80,cost:{wood:75},t:15,age:1,req:'mercado',walk:1,los:1,pg:0,h:0},
  maravilha:{n:'Maravilha',sz:4,hp:4000,cost:{wood:1000,gold:800,wealth:600,know:300},t:400,age:3,los:6,pg:0,h:140},
  quartel:{n:'Quartel',sz:3,hp:450,cost:{wood:125},t:35,age:0,train:['guer','espa'],res:['machado','espadaL'],los:4,pg:1,h:56},
  arquearia:{n:'Arquearia',sz:3,hp:450,cost:{wood:150},t:35,age:1,req:'quartel',train:['arq','arqc','arqcav'],los:4,pg:1,h:52},
  estabulo:{n:'Estábulo',sz:3,hp:450,cost:{wood:150},t:35,age:1,req:'quartel',train:['bat','cav','carro','elef'],los:4,pg:1,h:50},
  academia:{n:'Academia',sz:3,hp:450,cost:{wood:200},t:45,age:2,req:'quartel',train:['hopl'],res:['falange'],los:4,pg:1,h:62},
  templo:{n:'Templo',sz:3,hp:450,cost:{wood:200},t:45,age:2,train:['sac'],res:['fe','medicina'],los:5,pg:1,h:86},
  oficina:{n:'Oficina de Cerco',sz:3,hp:450,cost:{wood:200},t:45,age:2,train:['pedra','bal'],los:4,pg:1,h:54},
  torre:{n:'Torre',sz:1,hp:250,cost:{wood:75,gold:75},t:40,age:1,los:7,pg:1,shoot:{atk:3,rng:6,cd:2},h:100},
  muralha:{n:'Muralha',sz:1,hp:200,cost:{wood:5},t:6,age:1,los:1,pg:1,wall:1,h:34},
};
const ECO=['celeiro','deposito','doca','mercado','fazenda','tc','maravilha'];
const MIL=['quartel','arquearia','estabulo','academia','templo','oficina','torre','muralha'];

// ---------- TECNOLOGIAS ----------
const MEL=['inf','cav','elef'];
function forCls(T,cl,fn){for(const k in T)if(cl.includes(T[k].cls))fn(T[k])}
const TECH={
  enxada:{n:'Enxada',ic:'🌾',at:'mercado',age:1,cost:{food:100,wood:75},t:40,d:'Fazendas rendem +75 de comida',fx:(T,m)=>{m.farmFood+=75}},
  serra:{n:'Serra de Bronze',ic:'🪚',at:'mercado',age:1,cost:{food:120,wood:75},t:40,d:'Madeira 20% mais rápido',fx:(T,m)=>{m.gath.wood*=1.2}},
  picareta:{n:'Picareta',ic:'⛏️',at:'mercado',age:1,cost:{food:100,wood:100},t:40,d:'Metal 20% mais rápido',fx:(T,m)=>{m.gath.gold*=1.2}},
  roda:{n:'Roda',ic:'🛞',at:'mercado',age:2,cost:{food:175,wood:75},t:60,d:'Aldeões andam 30% mais rápido',fx:T=>{T.vill.spd*=1.3}},
  arado:{n:'Arado de Bronze',ic:'🐂',at:'mercado',age:2,req:'enxada',cost:{food:200,wood:100},t:50,d:'Fazendas +75 de comida e 10% mais rápidas',fx:(T,m)=>{m.farmFood+=75;m.gath.farm*=1.1}},
  irrigacao:{n:'Irrigação',ic:'💧',at:'mercado',age:3,req:'arado',cost:{food:300,wood:150},t:60,d:'Fazendas +100 de comida e 10% mais rápidas',fx:(T,m)=>{m.farmFood+=100;m.gath.farm*=1.1}},
  couro:{n:'Armadura de Couro',ic:'🦺',at:'deposito',age:1,cost:{food:100},t:40,d:'Infantaria e arqueiros +1 de armadura',fx:T=>forCls(T,['inf','arq','arqcav'],t=>t.arm+=1)},
  ferraria:{n:'Ferraria',ic:'🔨',at:'deposito',age:1,cost:{food:150},t:45,d:'Ataque corpo a corpo +2',fx:T=>forCls(T,MEL,t=>t.atk+=2)},
  escudo:{n:'Escudo de Bronze',ic:'🛡️',at:'deposito',age:2,req:'couro',cost:{food:150,gold:75},t:50,d:'Infantaria e cavalaria +1 de armadura',fx:T=>forCls(T,['inf','cav','elef','arqcav'],t=>t.arm+=1)},
  arcos:{n:'Arcos Reforçados',ic:'🏹',at:'deposito',age:2,cost:{food:150,wood:100},t:50,d:'Arqueiros +1 de alcance e +1 de ataque',fx:T=>forCls(T,['arq','arqcav'],t=>{t.rng+=1;t.atk+=1})},
  forja:{n:'Forja de Ferro',ic:'⚒️',at:'deposito',age:3,req:'ferraria',cost:{food:250,gold:120},t:60,d:'Ataque corpo a corpo +3',fx:T=>forCls(T,MEL,t=>t.atk+=3)},
  sentinela:{n:'Torre Sentinela',ic:'🗼',at:'celeiro',age:2,cost:{food:120,gold:80},t:45,d:'Torres: +2 de ataque, +1 de alcance, +50% de vida',fx:(T,m)=>{m.tower.atk+=2;m.tower.rng+=1;m.bldHp.torre=(m.bldHp.torre||1)*1.5}},
  muralhaF:{n:'Muralha Forte',ic:'🧱',at:'celeiro',age:2,cost:{food:180,wood:100},t:50,d:'Muralhas com o dobro de vida',fx:(T,m)=>{m.bldHp.muralha=(m.bldHp.muralha||1)*2}},
  fe:{n:'Fé',ic:'✨',at:'templo',age:2,cost:{wealth:120},t:45,d:'Sacerdotes convertem 40% mais rápido',fx:(T,m)=>{m.conv*=1.4}},
  medicina:{n:'Medicina',ic:'🌿',at:'templo',age:2,cost:{wealth:150},t:45,d:'Sacerdotes curam 2x mais rápido',fx:(T,m)=>{m.heal*=2}},
  velas:{n:'Velas Grandes',ic:'⛵',at:'doca',age:1,cost:{food:75,wood:100},t:40,d:'Barcos 20% mais rápidos',fx:T=>forCls(T,['navio'],t=>{t.spd*=1.2})},
  casco:{n:'Casco Reforçado',ic:'🛶',at:'doca',age:2,cost:{food:150,wood:150},t:50,d:'Barcos +30% de vida',fx:T=>forCls(T,['navio'],t=>{t.hp=Math.round(t.hp*1.3)})},
  machado:{n:'Machadeiro',ic:'🪓',at:'quartel',age:1,cost:{food:100},t:40,d:'Guerreiros viram Machadeiros: +2 de ataque e +10 de vida',fx:T=>{const t=T.guer;t.n='Machadeiro';t.atk+=2;t.hp+=10;t.axe=1}},
  espadaL:{n:'Espada Longa',ic:'🗡️',at:'quartel',age:3,cost:{food:160,gold:50},t:50,d:'Espadachins: +3 de ataque e +20 de vida',fx:T=>{const t=T.espa;t.n='Espada Longa';t.atk+=3;t.hp+=20}},
  falange:{n:'Falange',ic:'🔱',at:'academia',age:3,cost:{food:300,gold:100},t:60,d:'Hoplitas: +4 de ataque e +40 de vida',fx:T=>{const t=T.hopl;t.n='Falange';t.atk+=4;t.hp+=40}},
};

// ---------- POVOS ----------
// 4 estilos de arquitetura, cada um com 3 povos e vantagens próprias
const STY={
  egito:{nm:'Egípcia',wall:'#dcc28e',wall2:'#c5a56c',roof:'#d4b77c',rt:'flat',stone:'#cfb27a',wood:'#8a6234',acc:'#2f6c9e',sw:'#e8d29a'},
  grego:{nm:'Grega',wall:'#ece6d6',wall2:'#d6cebd',roof:'#b6573a',rt:'gable',stone:'#d9d3c4',wood:'#7a5a3a',acc:'#3f74ad',sw:'#f2eee4'},
  babilonia:{nm:'Babilônica',wall:'#c48f5d',wall2:'#a97648',roof:'#a0714a',rt:'flat',stone:'#b8946e',wood:'#7a5230',acc:'#2b5ea3',sw:'#c99a68'},
  oriental:{nm:'Oriental',wall:'#93673f',wall2:'#704c2d',roof:'#3c4b45',rt:'pyr',stone:'#9a958a',wood:'#6a4426',acc:'#b8352a',sw:'#3c4b45'},
};
const CIVS=[
  {id:'egipcios',n:'Egípcios',st:'egito',d:['Metal 20% mais rápido','Sacerdotes com +2 de alcance'],fx:(T,m)=>{m.gath.gold*=1.2;T.sac.rng+=2}},
  {id:'assirios',n:'Assírios',st:'egito',d:['Arqueiros atiram 30% mais rápido','Aldeões 10% mais rápidos'],fx:T=>{forCls(T,['arq','arqcav'],t=>{t.cd/=1.3});T.vill.spd*=1.1}},
  {id:'sumerios',n:'Sumérios',st:'egito',d:['Aldeões com +10 de vida','Fazendas rendem +100 de comida'],fx:(T,m)=>{T.vill.hp+=10;m.farmFood+=100}},
  {id:'gregos',n:'Gregos',st:'grego',d:['Infantaria 15% mais rápida','Barcos de guerra 20% mais rápidos'],fx:T=>{forCls(T,['inf'],t=>{t.spd*=1.15});T.bguer.spd*=1.2;T.trir.spd*=1.2}},
  {id:'fenicios',n:'Fenícios',st:'grego',d:['Madeira 15% mais rápido','Barcos custam 25% menos'],fx:(T,m)=>{m.gath.wood*=1.15;m.costMul.navio=.75}},
  {id:'minoicos',n:'Minoicos',st:'grego',d:['Pesca 30% mais rápida','Arqueiros com +1 de alcance'],fx:(T,m)=>{m.gath.fish*=1.3;m.gath.fishb*=1.3;forCls(T,['arq'],t=>{t.rng+=1})}},
  {id:'babilonios',n:'Babilônios',st:'babilonia',d:['Conhecimento 30% mais rápido','Torres e muralhas +60% de vida'],fx:(T,m)=>{m.gath.know*=1.3;m.bldHp.torre=1.6;m.bldHp.muralha=1.6}},
  {id:'persas',n:'Persas',st:'babilonia',d:['Caça 40% mais rápida','Cavalaria com +20% de vida'],fx:(T,m)=>{m.gath.hunt*=1.4;forCls(T,['cav','elef','arqcav'],t=>{t.hp=Math.round(t.hp*1.2)})}},
  {id:'hititas',n:'Hititas',st:'babilonia',d:['Armas de cerco com +50% de vida','Arqueiros com +1 de ataque'],fx:T=>{forCls(T,['cerco'],t=>{t.hp=Math.round(t.hp*1.5)});forCls(T,['arq','arqcav'],t=>{t.atk+=1})}},
  {id:'yamato',n:'Yamato',st:'oriental',d:['Cavalaria custa 25% menos','Barcos com +20% de vida'],fx:(T,m)=>{m.costMul.cav=.75;forCls(T,['navio'],t=>{t.hp=Math.round(t.hp*1.2)})}},
  {id:'shang',n:'Shang',st:'oriental',d:['Aldeões custam 35 de comida','Muralhas com +50% de vida'],fx:(T,m)=>{T.vill.cost.food=35;m.bldHp.muralha=1.5}},
  {id:'choson',n:'Choson',st:'oriental',d:['Espadachins com +20 de vida','Sacerdotes custam 30% menos'],fx:(T,m)=>{T.espa.hp+=20;m.costMul.sac=.7}},
];
const civOf=p=>CIVS.find(c=>c.id===G.P[p].civ)||CIVS[0];
const styOf=p=>STY[civOf(p).st];

const DIFF={
  facil:{n:'Fácil',gm:.8,vt:18,first:720,wave:4,inc:1,int:270,ageV:[11,15,20,24,28,32,35,38],fish:3,navy:1},
  normal:{n:'Normal',gm:1,vt:30,first:480,wave:6,inc:2,int:220,ageV:[10,14,18,22,26,30,33,36],fish:4,navy:2},
  dificil:{n:'Difícil',gm:1.25,vt:40,first:330,wave:8,inc:2,int:170,ageV:[9,13,17,21,25,29,32,35],fish:6,navy:3},
};
// coleta por segundo
const GATH={food:.62,hunt:.9,fish:.55,fishb:.75,farm:.5,wood:.6,gold:.52,stone:.52,oil:.45};
const CARRY=10,FARMFOOD=250,WONDER_T=300;

// ---------- ESTADO ----------
let G=null,E=new Map();
let occ=new Int32Array(N),pass=new Uint8Array(N),wpass=new Uint8Array(N),vis=new Uint8Array(N);
let SEL=[],camX=0,camY=0,Z=.8,VW=innerWidth,VH=innerHeight,DPR=1;
let PANH=90;
// caça dos aldeões: começa na faca; com os arqueiros (Era das Ferramentas) vira arco e flecha;
// a arma de fogo já está pronta para quando existir a era da pólvora (era 5)
const HUNTW=[
  {n:'faca',rng:1.4,cd:1.1,bon:0,v:300,pk:'k',snd:'knife'},
  {n:'arco e flecha',rng:4.5,cd:1.5,bon:1,v:420,pk:'a',snd:'bow'},
  {n:'arma de fogo',rng:6,cd:2.2,bon:6,v:900,pk:'g',snd:'shot'}];
function huntTier(o){const a=G.P[o].age;return a>=4?2:a>=UT.arq.age?1:0}
let placing=null,pathBudget=0,running=false,paused=false;
let OPT={spd:1,qual:1,eco:0,snd:1,mus:1};
try{const o=JSON.parse(localStorage.getItem('reinos_opt2')||'null');if(o)OPT=Object.assign(OPT,o)}catch(e){}
function saveOpt(){try{localStorage.setItem('reinos_opt2',JSON.stringify(OPT))}catch(e){}}
let UI={page:0,sig:'',idleIdx:0,lastAlert:null,alertT:-99,mk:null};
let RNG=Math.random;
let STAT=[null,null],MODS=[null,null];
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const getE=id=>E.get(id);
const tileOf=(x,y)=>idx(clamp(x/TS|0,0,MW-1),clamp(y/TS|0,0,MH-1));
function ctr(e){if(e.k==='u'||(e.k==='r'&&e.walk))return{x:e.x,y:e.y};if(e.k==='b')return{x:(e.tx+e.sz/2)*TS,y:(e.ty+e.sz/2)*TS};return{x:(e.tx+.5)*TS,y:(e.ty+.5)*TS}}
function afford(p,c){const r=G.P[p].res;for(const k in c)if(r[k]<c[k])return false;return true}
function pay(p,c){const r=G.P[p].res;for(const k in c)r[k]-=c[k]}
function refund(p,c){const r=G.P[p].res;for(const k in c)r[k]+=c[k]}
const isNav=u=>!!UT[u.type].naval;
const passFor=u=>UT[u.type].naval?wpass:pass;
function ST(u){return u.o<2&&STAT[u.o]?STAT[u.o][u.type]:UT[u.type]}
function costOf(p,t){return STAT[p]?STAT[p][t].cost:UT[t].cost}
function freshMods(){return{gath:{food:1,hunt:1,fish:1,fishb:1,farm:1,wood:1,gold:1,stone:1,know:1,wealth:1,oil:1},farmFood:0,conv:1,heal:1,costMul:{},bldHp:{},tower:{atk:0,rng:0}}}
// recalcula os números de um jogador (povo + tecnologias)
function recompute(p){
  const P=G.P[p],T={};
  for(const k in UT)T[k]=Object.assign({},UT[k],{cost:Object.assign({},UT[k].cost||{}),bon:UT[k].bon?Object.assign({},UT[k].bon):null});
  const m=freshMods();civOf(p).fx(T,m);
  for(const id of P.techs)TECH[id].fx(T,m);
  for(const k in T){const cm=m.costMul[T[k].cls]||m.costMul[k];if(cm)for(const r in T[k].cost)T[k].cost[r]=Math.round(T[k].cost[r]*cm)}
  const old=STAT[p];STAT[p]=T;MODS[p]=m;
  if(old)for(const u of G.U){if(u.dead||u.o!==p)continue;const d=T[u.type].hp-old[u.type].hp;if(d>0)u.hp+=d}
  for(const b of G.B){if(b.dead||b.o!==p)continue;const nh=bldMaxHp(b);if(nh>b.mhp){if(b.done>=1)b.hp+=nh-b.mhp;b.mhp=nh}}
}
function bldMaxHp(b){const m=b.o<2?MODS[b.o]:null;return Math.round(BT[b.type].hp*(m&&m.bldHp[b.type]||1))}
