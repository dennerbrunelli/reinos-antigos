
// =========================================================
//   MAPAS (mistura do Age e do Rise) E TAMANHOS
//   15 tipos + aleatório · Pequeno, Médio, Grande, Gigante
//   terr: 0 terra, 1 água, 2 vau (água rasa: passa gente e barco)
// =========================================================
const MAPSZ={peq:{n:'Pequeno',s:64,pl:2},med:{n:'Médio',s:80,pl:4},gra:{n:'Grande',s:100,pl:6},gig:{n:'Gigante',s:128,pl:8}};
// muda o tamanho do mapa e refaz todas as tabelas que dependem dele
function setMapSize(s){if(s===MW&&occ.length===s*s)return;MW=MH=s;N=s*s;
  occ=new Int32Array(N);pass=new Uint8Array(N);wpass=new Uint8Array(N);vis=new Uint8Array(N);
  DOM=new Int8Array(N).fill(-1);DOMS=new Float32Array(N);
  gS=new Float32Array(N);fr=new Int32Array(N);stp=new Uint32Array(N);cls=new Uint32Array(N);stamp=0;HP=new Int32Array(N*8);HF=new Float32Array(N*8);
  BW=Math.ceil(MW*TS/BC);BH=Math.ceil(MH*TS/BC);buckets=Array.from({length:BW*BH},()=>[]);
  fogC.width=MW;fogC.height=MH;fogI=fogG.createImageData(MW,MH);fogDirty=true;
  mmBase.width=MW*2;mmBase.height=MH*2;MS=MMW/2/MW;mmDirty=true}
// ---------- Etapa 1 do plano de multijogador (ver PLANO_multijogador.md): gera N posições
// iniciais bem espalhadas pelo mapa, num anel ao redor do centro. Ainda NÃO é usado pela
// partida de verdade (hoje `newGame` continua usando só 2 cantos fixos) — isto é só a
// função geométrica, testada sozinha, antes de encaixar no resto do motor.
function genStarts(n,margin){
  margin=margin==null?12:margin;
  const cx=MW/2,cy=MH/2,R=Math.max(1,Math.min(MW,MH)/2-margin);
  const a0=typeof RNG==='function'?RNG():Math.random(); // gira o anel (0-1; se o RNG da partida existir, usa ele)
  const pts=[];
  for(let i=0;i<n;i++){
    const a=a0*Math.PI*2+i*(Math.PI*2/n);
    let x=Math.round(cx+Math.cos(a)*R),y=Math.round(cy+Math.sin(a)*R);
    x=Math.max(margin,Math.min(MW-1-margin,x));y=Math.max(margin,Math.min(MH-1-margin,y));
    pts.push([x,y]);
  }
  return pts;
}
// menor distância entre quaisquer dois pontos iniciais (pra checar se não ficaram colados)
function startsMinDist(pts){let m=Infinity;for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)m=Math.min(m,hyp(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]));return m===Infinity?0:m}
// ---------- ferramentas de desenho do mapa ----------
const setW=(x,y,v)=>{x=Math.round(x);y=Math.round(y);if(inMap(x,y))G.terr[idx(x,y)]=v};
function lake(cx,cy,r,v){blob(cx,cy,r,(x,y)=>{G.terr[idx(x,y)]=v??1})}
// rio sinuoso de A até B; "fords" = quantos vaus (lugares rasos para atravessar)
function river(ax,ay,bx,by,w,fords,wig){const n=Math.ceil(hyp(bx-ax,by-ay)*2),ph=RNG()*6,nx=-(by-ay),ny=bx-ax,l=hyp(nx,ny)||1;
  const pts=[];for(let i=0;i<=n;i++){const t=i/n,o=Math.sin(t*Math.PI*2.2+ph)*(wig??4)*Math.sin(t*Math.PI);pts.push([ax+(bx-ax)*t+nx/l*o,ay+(by-ay)*t+ny/l*o])}
  for(const[x,y]of pts)for(let b=-w;b<=w;b++)for(let a=-w;a<=w;a++)if(a*a+b*b<=w*w+.5)setW(x+a,y+b,1);
  for(let f=1;f<=fords;f++){const p=pts[Math.round(n*f/(fords+1))];for(let b=-w-1;b<=w+1;b++)for(let a=-w-1;a<=w+1;a++)if(a*a+b*b<=(w+1.6)**2)setW(p[0]+a,p[1]+b,2)}
  return pts}
// caminho em linha (para corredores e pontes de vau)
function line(ax,ay,bx,by,w,fn){const n=Math.ceil(hyp(bx-ax,by-ay));for(let i=0;i<=n;i++){const x=ax+(bx-ax)*i/n,y=ay+(by-ay)*i/n;for(let b=-w;b<=w;b++)for(let a=-w;a<=w;a++)if(a*a+b*b<=w*w+.5){const X=Math.round(x+a),Y=Math.round(y+b);if(inMap(X,Y))fn(X,Y)}}}
// ---------- os 15 mapas ----------
// water: desenha a água · fo/go/an/be: quantidade de floresta, metal, animais, frutas · dry: deserto · extra: detalhes depois dos recursos
const MAPS={
  mar:{n:'Mar Interior',ic:'🌊',src:'Age',dif:2,d:'Grande mar no meio: pesca, barcos e batalhas navais.',water(S,st,far){lake(MW/2+RNG()*2-1,MH/2+RNG()*2-1,18.5*S);
    for(let k=0;k<2;k++)for(let tr=0;tr<60;tr++){const cx=6+RNG()*(MW-12),cy=6+RNG()*(MH-12);if(!far(cx,cy,17)||hyp(cx-MW/2,cy-MH/2)<26*S)continue;lake(cx,cy,2.5+RNG()*1.5);break}}},
  terra:{n:'Continente',ic:'🌳',src:'Age',dif:1,d:'Terra firme com lagos pequenos. O clássico para começar.',water(S,st,far){for(let k=0;k<4*S*S;k++)for(let tr=0;tr<60;tr++){const cx=8+RNG()*(MW-16),cy=8+RNG()*(MH-16);if(!far(cx,cy,17))continue;lake(cx,cy,3+RNG()*3.5);break}}},
  arabia:{n:'Arábia',ic:'🏜',src:'Age',dif:3,fo:.45,dry:.38,go:1.2,d:'Deserto aberto, pouca madeira e ataques cedo. Mapa de campeonato.',water(S,st,far){for(let tr=0;tr<60;tr++){const cx=10+RNG()*(MW-20),cy=10+RNG()*(MH-20);if(far(cx,cy,20)){lake(cx,cy,2.5);break}}}},
  floresta:{n:'Floresta Negra',ic:'🌲',src:'Age',dif:4,fo:.4,d:'Mata fechada com poucos corredores. Muralhas valem ouro.',water(){},
    extra(ctx){const{put,st}=ctx;const keep=new Uint8Array(N);const S=MW/72;
      const mark=(x,y)=>{keep[idx(x,y)]=1};for(const s of st)blob(s[0],s[1],10*S,mark);blob(MW/2,MH/2,6*S,mark);
      // 3 corredores entre as bases (meio, e dois pelos lados)
      for(const off of[0,-.28,.28]){const mx=MW/2+off*MW,my=MH/2+off*MH;line(st[0][0],st[0][1],mx,my,1.5,mark);line(mx,my,st[1][0],st[1][1],1.5,mark)}
      for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=idx(x,y);if(keep[i]||G.terr[i])continue;if(vnoise(x/5,y/5)>.32||RNG()<.25)put('tree',x,y)}}},
  ilhas:{n:'Ilhas',ic:'🏝',src:'Age',dif:4,fo:.8,d:'Cada um na sua ilha, ligadas por vaus rasos. Domine o mar.',
    water(S,st){for(let i=0;i<N;i++)G.terr[i]=1;for(const s of st)blob(s[0]+(s[0]<MW/2?3:-3)*S,s[1]+(s[1]<MH/2?3:-3)*S,18*S,(x,y)=>{G.terr[idx(x,y)]=0});
      for(let k=0;k<3;k++){const cx=MW*(.3+RNG()*.4),cy=MH*(.3+RNG()*.4);blob(cx,cy,(5+RNG()*3)*S,(x,y)=>{G.terr[idx(x,y)]=0})}
      for(const off of[-.22,.22])line(st[0][0],st[0][1],MW/2+off*MW,MH/2+off*MH,1.6,(x,y)=>{if(G.terr[idx(x,y)])G.terr[idx(x,y)]=2}),line(MW/2+off*MW,MH/2+off*MH,st[1][0],st[1][1],1.6,(x,y)=>{if(G.terr[idx(x,y)])G.terr[idx(x,y)]=2})}},
  rios:{n:'Rios',ic:'🏞',src:'Rise',dif:3,d:'Um rio largo corta o mapa; só se atravessa pelos vaus.',water(S){river(0,0,MW-1,MH-1,Math.round(2*S),3,4*S);for(let k=0;k<2;k++){const c=k?[MW*.2,MH*.2]:[MW*.8,MH*.8];lake(c[0],c[1],3.5*S)}}},
  arena:{n:'Arena',ic:'🏟',src:'Age',dif:2,go:1.4,d:'Cada base começa cercada de muralhas com portões. Centro rico.',water(){},
    extra(ctx){const{st,cluster}=ctx;for(let p=0;p<st.length;p++){const s=st[p],R=11*MW/72;for(let a=0;a<Math.PI*2;a+=.045){const x=Math.round(s[0]+Math.cos(a)*R),y=Math.round(s[1]+Math.sin(a)*R);
        const gate=[.8,2.35,3.95,5.5].some(g=>Math.abs(a-g)<.13);if(gate||!inMap(x,y)||G.terr[idx(x,y)])continue;const o0=occ[idx(x,y)],r0=o0&&E.get(o0);if(r0&&r0.k==='r'){r0.dead=true;E.delete(r0.id);occ[idx(x,y)]=0;pass[idx(x,y)]=1}else if(o0)continue;placeBld('muralha',p,x,y,true)}}
      G.R=G.R.filter(r=>!r.dead);
      for(let k=0;k<3;k++)cluster('gold',MW/2+(RNG()-.5)*8,MH/2+(RNG()-.5)*8,5)}},
  cordilheira:{n:'Cordilheira',ic:'🏔',src:'Rise',dif:3,go:1.3,dry:.12,d:'Serras de minério cortam o mapa em vales. Metal de sobra, poucas passagens.',water(){},
    extra(ctx){const{put,st}=ctx;for(let k=0;k<3;k++){const t=.3+k*.2,cx=st[0][0]+(st[1][0]-st[0][0])*t,cy=st[0][1]+(st[1][1]-st[0][1])*t,ax=cx-MW*.24,ay=cy-MH*.24,bx=cx+MW*.24,by=cy+MH*.24;
        line(ax,ay,bx,by,1,(x,y)=>{if(st.some(s=>hyp(s[0]-x,s[1]-y)<12))return;const g=((x+y*3)%17)<2;if(!g)put(RNG()<.35?'gold':'tree',x,y)})}}},
  oasis:{n:'Oásis',ic:'🌴',src:'Age',dif:2,fo:.35,dry:.42,d:'Deserto com um lago cercado de palmeiras no meio. Todos disputam o centro.',water(S){lake(MW/2,MH/2,8*S)},
    extra(ctx){const{put}=ctx;const S=MW/72;for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const d=hyp(x-MW/2,y-MH/2);if(d>9*S&&d<13.5*S&&RNG()<.6)put('tree',x,y)}}},
  ouro:{n:'Corrida do Ouro',ic:'🪙',src:'Age',dif:3,d:'Muito metal no centro, protegido por um anel de floresta com duas entradas.',water(){},
    extra(ctx){const{put,cluster}=ctx;const S=MW/72;for(let k=0;k<4;k++)cluster('gold',MW/2+(RNG()-.5)*5*S,MH/2+(RNG()-.5)*5*S,6);
      for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const d=hyp(x-MW/2,y-MH/2),a=Math.atan2(y-MH/2,x-MW/2);if(d>7.5*S&&d<11*S&&Math.abs(Math.sin(a-Math.PI/4))>.25)put('tree',x,y)}}},
  amazonia:{n:'Amazônia',ic:'🐊',src:'Rise',dif:5,fo:2.1,an:1.8,d:'Selva fechada e rios. Difícil de andar, fácil de se perder.',water(S){river(0,MH*.35,MW*.65,MH-1,Math.round(1.4*S),2,3*S);river(MW*.35,0,MW-1,MH*.65,Math.round(1.4*S),2,3*S)}},
  delta:{n:'Delta do Nilo',ic:'🏺',src:'Rise',dif:3,dry:.33,go:.9,d:'Um rio desce e se divide em braços até o mar. Comida farta na beira.',
    water(S){river(0,0,MW*.5,MH*.5,Math.round(2*S),1,2*S);for(const t of[-.18,0,.18])river(MW*.5,MH*.5,MW*(.85+t),MH*(.85-t),Math.round(1.2*S),1,2*S);for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(x+y>MW*1.72)G.terr[idx(x,y)]=1}},
  lagos:{n:'Grandes Lagos',ic:'💧',src:'Rise',dif:2,d:'Vários lagos pelo mapa: barcos de pesca e caminhos tortos.',water(S,st,far){for(let k=0;k<7*S*S;k++)for(let tr=0;tr<60;tr++){const cx=7+RNG()*(MW-14),cy=7+RNG()*(MH-14);if(!far(cx,cy,14))continue;lake(cx,cy,(3.5+RNG()*3)*S);break}}},
  estepe:{n:'Estepe',ic:'🌾',src:'Rise',dif:3,fo:.3,an:2.6,be:1.6,dry:.15,d:'Campo aberto sem fim, muita caça e pouca madeira. Cavalaria manda.',water(){}},
  litoral:{n:'Litoral',ic:'⚓',src:'Age',dif:2,d:'Mar no canto do mapa: os dois têm praia, docas e pesca.',water(S){for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(x+y<MW*.55+Math.sin(x*.3)*2)G.terr[idx(x,y)]=1}},
};
const MAP_ORD=['terra','mar','arabia','floresta','ilhas','rios','arena','cordilheira','oasis','ouro','amazonia','delta','lagos','estepe','litoral'];
function mapSpec(id){return MAPS[id]||MAPS.terra}
