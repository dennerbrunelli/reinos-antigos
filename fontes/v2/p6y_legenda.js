
// =========================================================
//   LEGENDA DOS BOTÕES (Versão 72): tocar ativa; SEGURAR o dedo mostra uma janela explicando
//   o que o botão faz (nome, custo, descrição e, no poder do povo, o efeito e o tempo de espera).
// =========================================================
const HELP_CMD=[
 ['Patrulhar','As tropas vão e voltam entre onde estão e o ponto que você tocar. Atacam quem aparecer no caminho.'],
 ['Atacar e avançar','Toque num ponto do mapa: as tropas andam até lá atacando todo inimigo que encontrarem, e depois seguem.'],
 ['Atacar o inimigo','Manda as tropas escolhidas contra o inimigo conhecido mais perto.'],
 ['Proteger','Toque numa unidade ou prédio seu: as tropas ficam junto e atacam quem chegar perto.'],
 ['Explorar','A unidade sai revelando o mapa sozinha e só para quando não houver mais terra escondida. Qualquer outra ordem cancela.'],
 ['Recuar','As tropas voltam para perto do Centro Urbano mais próximo.'],
 ['Parar','Cancela a ordem atual. A unidade fica onde está.'],
 ['Postura','Agressiva: persegue o inimigo. Defensiva: ataca e volta ao posto. Firme: só ataca quem chega ao alcance. Sem ataque: não reage.'],
 ['Formação','Como o grupo anda e para: Livre, Linha, Caixa, Espaçada ou Flanco. Em formação o grupo anda junto, no passo do mais lento.'],
 ['Excluir','Remove a unidade ou o prédio escolhido para liberar população ou espaço. Pede um segundo toque para confirmar.'],
 ['Tocar o sino','Os aldeões próximos largam o trabalho e correm para se abrigar no Centro Urbano, Torre ou Forte mais perto. Abrigados, ajudam a atirar flechas.'],
 ['Voltar ao trabalho','Os aldeões saem dos abrigos e voltam ao que estavam fazendo antes do sino.'],
 ['Desguarnecer','Todos que estão dentro do prédio saem.'],
 ['Coleta automática','Ligada: aldeão parado procura trabalho sozinho, seguindo o Plano de coleta.'],
 ['Plano de coleta','Diz em que os aldeões automáticos devem se concentrar: equilibrado, comida, madeira ou metal.'],
 ['Fila automática','Ligada: o Centro Urbano treina aldeões sem parar enquanto houver comida e população livre.'],
 ['Ver prédios','Mostra a lista de prédios da cidade e quantos você pode ter.'],
 ['Comprar e vender','Abre o mercado para trocar recursos por riqueza e riqueza por recursos.'],
 ['Avançar','Passa para a próxima era: libera unidades, prédios e pesquisas novos e deixa as tropas mais fortes.'],
 ['Organização Militar','Aumenta o limite de população em 25 e libera melhorias militares.'],
 ['Cívica','Permite mais cidades e aumenta o alcance das fronteiras.'],
 ['Comércio','Aumenta o limite de cada recurso e o ganho das caravanas e mercadores.'],
 ['Ciência','Deixa as pesquisas mais baratas e os eruditos mais produtivos.']];
const HELP_ID={qidle:['Aldeão parado','Seleciona o próximo aldeão sem trabalho e leva a câmera até ele. O número mostra quantos estão parados.'],
 qarmy:['Exército','Seleciona todas as suas tropas de uma vez. O número mostra quantos soldados você tem.'],
 qtc:['Centro Urbano','Leva a câmera até a sua capital e a seleciona.'],
 bdip:['Diplomacia','Propor aliança, declarar guerra ou enviar presentes às outras nações.'],
 bhud:['Interface','Mostra, esconde e muda de lugar os painéis da tela.']};
function helpOf(c){const P=G.P[0];let h='<b style="font-size:16px;color:#f3d37a">'+String(c.nm||'').split(' · toque')[0]+'</b>';
  if(c.cost)h+='<div style="margin-top:3px">Custo: '+costTxt(c.cost)+'</div>';
  const pw=typeof POWER!=='undefined'&&POWER[civOf(0).id];
  if(c.pw&&pw){h+='<div style="margin-top:4px">'+pw.d+'</div><div style="opacity:.8;margin-top:3px">⏳ Espera entre usos: '+Math.round(pw.cd/60*10)/10+' min'+(pw.dur?' · dura '+pw.dur+' s':'')+'</div>'}
  else{if(c.d)h+='<div style="margin-top:4px">'+c.d+'</div>';
    const m=HELP_CMD.find(([k])=>String(c.nm||'').startsWith(k));if(m)h+='<div style="margin-top:4px">'+m[1]+'</div>';
    // unidade ou prédio: mostra os números
    const nm=String(c.nm||'').split(/[:·(]/)[0].trim();let ut=null;for(const k in UT){const S=STAT[0]&&STAT[0][k];if((S&&S.n===nm)||UT[k].n===nm){ut=k;break}}
    if(ut){const S=ST({type:ut,o:0});h+='<div style="margin-top:4px;opacity:.9">❤️ '+Math.round(S.hp)+' · ⚔️ '+Math.round(S.atk)+(S.rng?' · 🎯 alcance '+S.rng:'')+' · 🛡 '+(S.arm||0)+' · 👁 visão '+(UT[ut].los||4)+'</div>'}
    else{for(const k in BT)if(BT[k].n===nm){h+='<div style="margin-top:4px;opacity:.9">❤️ '+BT[k].hp+(BT[k].d?' · '+BT[k].d:'')+'</div>';break}}}
  if(c.lock)h+='<div style="margin-top:4px;color:#ff9a8a">🔒 '+(typeof c.lock==='string'?c.lock:'Ainda não liberado')+'</div>';
  else if(c.dis)h+='<div style="margin-top:4px;color:#ff9a8a">Indisponível agora'+(c.cost&&!afford(0,c.cost)?' · faltam recursos':'')+'</div>';
  return h}
{const css=document.createElement('style');css.textContent='#tip{position:fixed;z-index:80;display:none;max-width:min(340px,80vw);padding:10px 13px;border-radius:8px;background:linear-gradient(#2a1d0c,#150d04);border:2px solid #c9952f;color:#f1e6c8;font:14px/1.35 Georgia,serif;box-shadow:0 4px 18px #000c;pointer-events:none}#tip img{height:15px;vertical-align:-2px}';document.head.appendChild(css);
  const tip=document.createElement('div');tip.id='tip';document.body.appendChild(tip);
  let tm=null,ht=null,shown=false,eat=false,sx=0,sy=0;
  const hide=()=>{clearTimeout(tm);clearTimeout(ht);tm=null;if(shown){shown=false;tip.style.display='none'}};
  const show=(el,html)=>{tip.innerHTML=html;tip.style.display='block';shown=true;eat=true;const r=el.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
    let x=clamp(r.left+r.width/2-w/2,8,innerWidth-w-8),y=r.top-h-10;if(y<8)y=Math.min(innerHeight-h-8,r.bottom+10);tip.style.left=x+'px';tip.style.top=y+'px';try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}};
  document.addEventListener('pointerdown',e=>{hide();eat=false;if(!G||!running)return;const t=e.target.closest&&e.target.closest('#cmds .cb,#quick .cb,#quick button,#qidle,#qarmy,#qtc,#bdip,#bhud');if(!t)return;sx=e.clientX;sy=e.clientY;
    tm=setTimeout(()=>{let html=null;
      if(t.closest('#cmds')){const i=[...$('cmds').children].indexOf(t);const c=getCmds()[i];if(c)html=helpOf(c)}
      else{const H=HELP_ID[t.id]||HELP_ID[(t.closest('[id]')||{}).id];if(H)html='<b style="font-size:16px;color:#f3d37a">'+H[0]+'</b><div style="margin-top:4px">'+H[1]+'</div>'}
      if(html)show(t,html)},420)},true);
  document.addEventListener('pointermove',e=>{if(tm&&!shown&&hyp(e.clientX-sx,e.clientY-sy)>14)hide()},true);
  for(const ev of['pointerup','pointercancel'])document.addEventListener(ev,()=>{clearTimeout(tm);tm=null;if(shown){clearTimeout(ht);ht=setTimeout(hide,2200)}},true);
  // o toque longo só mostra a legenda: não ativa o botão
  document.addEventListener('click',e=>{if(eat){eat=false;e.stopPropagation();e.preventDefault()}},true);
  document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('#cmds,#quick'))e.preventDefault()})}
