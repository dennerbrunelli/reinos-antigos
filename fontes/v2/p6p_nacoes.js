
// =========================================================
//   NAÇÕES DO RISE (etapa 6, opção 2: acrescentar aos 12 que já existem)
//   Nomes de povos históricos; poderes, textos e efeitos são originais.
//   Arquitetura: cada povo usa um dos estilos. O estilo europeu é novo.
//   Tropas únicas por povo: ainda não (dependem de arte nova).
// =========================================================
STY.europa={nm:'Europeia',wall:'#d9d2c0',wall2:'#bfb6a0',roof:'#4a5a6a',rt:'gable',stone:'#a8a296',wood:'#6a4a2a',acc:'#8a1f2a',sw:'#c9c3b0'};

CIVS.push(
  {id:'astecas',n:'Astecas',st:'babilonia',d:['Templos com +20% de vida','Colheita 10% mais rápida'],fx:(T,m)=>{m.bldHp.templo=1.2;m.gath.food*=1.1}},
  {id:'maias',n:'Maias',st:'babilonia',d:['Conhecimento 25% mais rápido','Aldeões 5% mais rápidos'],fx:(T,m)=>{m.gath.know*=1.25;T.vill.spd*=1.05}},
  {id:'incas',n:'Incas',st:'babilonia',d:['Caça 25% mais rápida','Muralhas com +20% de vida'],fx:(T,m)=>{m.gath.hunt*=1.25;m.bldHp.muralha=1.2}},
  {id:'nubios',n:'Núbios',st:'egito',d:['Ouro 15% mais rápido','Arqueiros atiram 20% mais rápido'],fx:(T,m)=>{m.gath.gold*=1.15;forCls(T,['arq','arqcav'],t=>{t.cd/=1.2})}},
  {id:'mongois',n:'Mongóis',st:'oriental',d:['Cavalaria 20% mais rápida','Cavalaria custa 10% menos'],fx:(T,m)=>{forCls(T,['cav','arqcav'],t=>{t.spd*=1.2});m.costMul.cav=.9}},
  {id:'turcos',n:'Turcos',st:'oriental',d:['Arqueiros atiram 20% mais rápido','Infantaria com +10 de vida'],fx:(T)=>{forCls(T,['arq','arqcav'],t=>{t.cd/=1.2});forCls(T,['inf'],t=>{t.hp+=10})}},
  {id:'bantos',n:'Bantos',st:'oriental',d:['Caça 30% mais rápida','Aldeões com +5 de vida'],fx:(T,m)=>{m.gath.hunt*=1.3;T.vill.hp+=5}},
  {id:'romanos',n:'Romanos',st:'europa',d:['Infantaria com +10 de vida','Fazendas rendem 15% mais'],fx:(T,m)=>{forCls(T,['inf'],t=>{t.hp+=10});m.gath.farm*=1.15}},
  {id:'britanicos',n:'Britânicos',st:'europa',d:['Barcos de guerra 20% mais rápidos','Madeira 10% mais rápida'],fx:(T,m)=>{T.bguer.spd*=1.2;T.trir.spd*=1.2;m.gath.wood*=1.1}},
  {id:'franceses',n:'Franceses',st:'europa',d:['Cavalaria com +10% de vida','Fazendas rendem 10% mais'],fx:(T,m)=>{forCls(T,['cav'],t=>{t.hp=Math.round(t.hp*1.1)});m.gath.farm*=1.1}},
  {id:'alemaes',n:'Alemães',st:'europa',d:['Armas de cerco com +30% de vida','Conhecimento 15% mais rápido'],fx:(T,m)=>{forCls(T,['cerco'],t=>{t.hp=Math.round(t.hp*1.3)});m.gath.know*=1.15}},
  {id:'russos',n:'Russos',st:'europa',d:['Infantaria com +10 de vida','Aldeões 10% mais rápidos'],fx:(T)=>{forCls(T,['inf'],t=>{t.hp+=10});T.vill.spd*=1.1}},
  {id:'espanhois',n:'Espanhóis',st:'europa',d:['Ouro 15% mais rápido','Navios custam 20% menos'],fx:(T,m)=>{m.gath.gold*=1.15;m.costMul.navio=.8}},
);

// poderes dos novos povos (acionados pelo Centro Urbano)
Object.assign(POWER,{
  astecas:{n:'Sacrifício ao Sol',ic:'☀️',d:'Ganha 150 de comida na hora.',cd:150,dur:0,on(o){G.P[o].res.food+=150}},
  maias:{n:'Calendário',ic:'🗓',d:'Ganha 100 de conhecimento na hora.',cd:180,dur:0,on(o){G.P[o].res.know+=100}},
  incas:{n:'Mita',ic:'🧺',d:'Colheita 25% mais rápida por 40 s.',cd:180,dur:40,on(o){bfSet(o,'gath',1.25,40)}},
  nubios:{n:'Tributo do Ouro',ic:'🪙',d:'Ganha 100 de ouro na hora.',cd:150,dur:0,on(o){G.P[o].res.gold+=100}},
  mongois:{n:'Arco da Estepe',ic:'🐴',d:'Cavalaria e arqueiros 30% mais fortes por 25 s.',cd:170,dur:25,on(o){bfSet(o,'atk',1.3,25,['cav','arqcav','arq'])}},
  turcos:{n:'Janízaros',ic:'🛡',d:'Infantaria e arqueiros 25% mais fortes por 25 s.',cd:170,dur:25,on(o){bfSet(o,'atk',1.25,25,['inf','arq'])}},
  bantos:{n:'Tambores da Aldeia',ic:'🥁',d:'Colheita 25% mais rápida por 30 s.',cd:160,dur:30,on(o){bfSet(o,'gath',1.25,30)}},
  romanos:{n:'Estradas Romanas',ic:'🛣',d:'Tropas 25% mais rápidas por 30 s.',cd:170,dur:30,on(o){bfSet(o,'spd',1.25,30)}},
  britanicos:{n:'Marinha Real',ic:'⚓',d:'Navios 40% mais rápidos por 30 s.',cd:160,dur:30,on(o){bfSet(o,'spd',1.4,30,['navio'])}},
  franceses:{n:'Vinho e Pão',ic:'🥖',d:'Ganha 150 de comida e 60 de riqueza na hora.',cd:150,dur:0,on(o){G.P[o].res.food+=150;G.P[o].res.wealth+=60}},
  alemaes:{n:'Relógio de Precisão',ic:'⏱',d:'Colheita 20% mais rápida por 30 s.',cd:170,dur:30,on(o){bfSet(o,'gath',1.2,30)}},
  russos:{n:'Inverno Russo',ic:'❄️',d:'Cura 35% da vida de todas as suas tropas perto da capital.',cd:150,dur:0,on(o){healNear(o,35)}},
  espanhois:{n:'Galeões de Prata',ic:'💰',d:'Ganha 100 de ouro e 100 de riqueza na hora.',cd:150,dur:0,on(o){G.P[o].res.gold+=100;G.P[o].res.wealth+=100}},
});
