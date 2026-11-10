# Plano: abrir o motor para mais de 2 jogadores (base para diplomacia/alianças)

Escrito depois de mapear todo o código (`fontes/v2/*.js`). Isto NÃO foi implementado ainda —
é o roteiro pra fazer com segurança, em etapas testáveis, sem quebrar o jogo de 2 jogadores
que já está no ar (Versão 44).

## Por que não foi direto pro código hoje

Contei **51 pontos em 16 arquivos** que assumem exatamente 2 jogadores reais (`p<2`,
`o<2`, `o>1`, `for(p=0;p<2;p++)`). Isso toca economia, IA, território, mercado, combate,
visual (cores por jogador) e vitória/derrota. Fazer isso de uma vez, de madrugada, sem
testes específicos pra múltiplos jogadores, é a receita pra quebrar o jogo sem perceber.
Prefiro ir por etapas, testando cada uma, como fiz com guarnecimento/captura/Espião.

## Decisão de design

Hoje `o===2` é o dono especial "ninguém" (bichos, recursos — "gaia"). Os jogadores reais
são sempre `0` e `1`. Para abrir pra N jogadores:

- Criar uma constante `NP` = número de jogadores reais nesta partida (2 a 6, escolhido na
  tela de configurar partida). `G.P` passa a ter `NP` posições (hoje são sempre 2).
- O dono "ninguém" deixa de ser o número fixo `2` e passa a ser `NP` (ou seja, sempre o
  número logo depois do último jogador real). Então os bichos/recursos, que hoje nascem
  com `o:2`, passam a nascer com `o:NP`.
- Toda checagem `o<2` (equivalente a "é um jogador real") vira `o<NP`.
- Toda checagem `o>1` (equivalente a "não é um jogador real, ignora") vira `o>=NP`.
- Todo laço `for(p=0;p<2;p++)` vira `for(p=0;p<NP;p++)`.
- `MODS[o]`/`STAT[o]` (hoje arrays de 2 posições, uma por jogador) passam a ter `NP`
  posições, uma por civilização escolhida por cada jogador/IA daquela partida.

Isso é mecânico e seguro de revisar arquivo por arquivo, porque o padrão se repete.

## Lista de pontos por arquivo (todos os 51, já localizados)

- **p2_data.js** (2 pontos) — `ST()` e `bldMaxHp()`: trocar `o<2` por `o<NP`.
- **p3_world.js** (7 pontos) — laço de `popCap`/população (linha ~67, ~148), contagem de
  mortes/abates (~137), ataque automático (~312), coleta (~400), conversão (~462), cura
  (~480), checagem de navio vs não-navio (~554).
- **p3b_terr.js** (6 pontos) — fronteira (~21), `validSite` (~49), checagem de cidade perto
  de inimigo (~56), `ensureCapital` em laço (~99), captura de cidade (~103), domínio (~108).
- **p3c_ron.js** (6 pontos) — `ronGath`/`ronSpd` (~56-57), imposto de Cívica em laço (~127),
  atrito (~132), cura por Ervas Medicinais em laço (~136), ruínas (~138).
- **p3d_res.js** (2 pontos) — conhecimento (~33), mercado em laço (~40).
- **p3f_maps.js** (1 ponto, o mais importante) — `extra(ctx)` gera só 2 posições iniciais
  no mapa (~46). **Isto precisa virar N posições espalhadas pelo mapa** (ver seção própria
  abaixo — é o ponto de maior risco/trabalho de todo o plano).
- **p4_ai.js** (1 ponto) — detecção de inimigo com navio (~101). Mas o problema maior aqui
  não está nesta lista: hoje só existe UMA chamada de `aiTick` pensada pro jogador 1 — isso
  precisa virar um laço chamando `aiTick(p)` pra cada `p` de 1 até `NP-1`.
- **p5_gfx.js** (4 pontos) — cores de território no minimapa (~288, ~426), corpos (~434,
  ~456): todos em laço fixo de 2, viram laço de `NP`.
- **p5b_art.js** (1 ponto) — variantes de cor de sprite por jogador (~256): laço de `NP`.
- **p5c_art.js** (2 pontos) — o mesmo, pra arte do GPT (~52, ~56).
- **p6_ui.js** (3 pontos, tela de fim de jogo) — `checkEnd()`: quem caiu (~532), Maravilha
  (~539), território (~541). Aqui também é onde entra a regra de vitória em time (ver
  seção de diplomacia).
- **p6g_mkt.js** (2 pontos) — limite de captura de recurso raro (~14), atualização do
  mercado em laço (~21).
- **p6j_ronecon.js** (7 pontos) — toda a lógica de coleta de recursos (acampamento,
  bônus, limites) usa `o<2` pra decidir se é um jogador "de verdade".
- **p6m_exercito.js** (1 ponto) — melhoria de tropa por era (~50): hoje só melhora
  jogadores 0 e 1.
- **p6n_predios.js** (3 pontos) — guarnecimento (~72) e conhecimento da Universidade
  (~152-153).
- **p6o_poderes.js** (1 ponto) — poderes especiais de civilização (~46).

## O ponto mais delicado: posições iniciais no mapa (p3f_maps.js)

Hoje cada mapa gera exatamente 2 pontos de início, em cantos opostos, "bons" pro tipo de
terreno daquele mapa (praia, rio, etc. — cada mapa tem sua própria função `extra(ctx)`).
Pra N jogadores, cada um dos ~10 mapas do jogo precisa de uma função que:
1. Gera N pontos espalhados (não só 2 cantos — precisa de um círculo ou grade com N
   posições, tipo "divide o mapa em N fatias e põe um início em cada uma").
2. Garante distância mínima entre eles (hoje isso já existe pra 2 pontos; com mais
   jogadores em mapas pequenos, pode não caber distância boa — pode ser necessário um
   tamanho mínimo de mapa por N, ex.: mapas pequenos só liberam até 4 jogadores).
3. Mantém a qualidade do terreno ao redor de cada início (hoje cada mapa cuida disso no
   `extra(ctx)` dele; isso teria que generalizar pra "pra cada um dos N pontos", não só
   pra 2 fixos).

Esse é o item que eu recomendo fazer **primeiro e sozinho**, com teste automatizado
checando que N pontos nascem, todos em terreno válido, com distância mínima entre si —
antes de mexer em qualquer outro arquivo da lista.

## Diplomacia (depois da base pronta)

Só faz sentido depois do motor aceitar N jogadores. Vai precisar de:
- Uma matriz de relação entre jogadores: `G.rel[a][b]` = `'guerra'` ou `'aliado'` (ou
  `'neutro'`, se o Denner quiser esse meio-termo, mas ele pediu pra testar com o número
  máximo de nações, então talvez comece só com guerra/aliado pra ficar simples).
- IA tem que respeitar isso: não atacar aliado, dividir o alvo entre os inimigos reais.
- Tela de jogo mostrando quem é aliado de quem (cores, ícone).
- Vitória em time: se eu e um aliado dominamos o mapa juntos, isso conta como vitória
  pros dois (hoje `checkEnd` só pensa em "jogador 0 venceu ou perdeu").
- Pedido de aliança/quebra de aliança: comando novo, parecido com o "Alarme" que já
  existe — um botão, uma ação.

## Ordem recomendada de execução (cada etapa com teste antes de ir pra próxima)

1. ✅ **FEITO (Versão 45)** — `genStarts(n,margin)` em `p3f_maps.js`: gera N posições num
   anel ao redor do centro do mapa, girado aleatoriamente, com margem da borda. Testado nos
   4 tamanhos de mapa × 2/3/4/5/6/8 jogadores: todos dentro dos limites, e a distância
   mínima entre posições cai de forma previsível conforme N sobe. Os números bateram com o
   `pl` (jogadores recomendados) que o `MAPSZ` já tinha — Pequeno (até 2): ótimo espaço pra
   2, apertado a partir de 4; Médio (até 4), Grande (até 6) e Gigante (até 8) ficam com
   distância mínima de ~37-56 tiles no limite do que o campo deles recomenda, parecido com
   o espaço que o mapa Pequeno já tem hoje pra 2 jogadores. Isso confirma que os limites
   de `pl` por tamanho de mapa fazem sentido e devem ser respeitados na tela de configurar
   partida (não deixar escolher mais oponentes do que o mapa aguenta).
   **Ainda não está ligado ao jogo de verdade** — é só a função geométrica, pronta pra ser
   usada quando a Etapa 2 vier (hoje `newGame()` continua com os 2 cantos fixos de sempre).
2. ✅ **FEITO (Versão 46)** — `NP` (jogadores reais) e `GAIA` (dono "ninguém" — bichos,
   ruínas, carcaças — hoje fixo em `MAX_PLAYERS=8`, nunca colide com um jogador real) criados
   em `p2_data.js`. Os 51 pontos do catálogo viraram `o<NP`/`o>=NP`/`for(p=0;p<NP;p++)`, e
   durante a varredura apareceram **mais de 30 pontos extras** que o grep original não pegou
   (toda checagem `.o===2` que queria dizer "é bicho/ruína", mais um punhado de `.o===1` que
   queria dizer "é o inimigo" em `p3_world.js`, `p6m_exercito.js`, `p6d_ron_ui.js`,
   `p6h_eras.js`) — todos corrigidos também, com `.o===GAIA` e `.o!==0&&.o<NP` no lugar.
   `newGame(o)` agora aceita `o.np` (2 a 8, limitado pelo `pl` do tamanho do mapa) e `o.ais`
   (lista de povos pros oponentes); sem esses campos, roda exatamente como antes (`NP=2`,
   2 cantos fixos). `COL` ganhou 8 cores de time distintas + 1 neutra pra `GAIA`.
   `buildSprites()`, `checkEnd()`, `calcDom()`, o mercado, a universidade, o espião, os
   poderes especiais e a IA (`aiTick` agora roda pra `p` de 1 até `NP-1`, não só pra `p=1`)
   foram todos generalizados.
   **Testado**: suíte de regressão completa (14 testes) passando sem diferença nenhuma com
   `NP=2` (comportamento idêntico ao de antes); e dois testes novos, `np4.js` (4 jogadores,
   mapa Grande) e `np8.js` (8 jogadores, mapa Gigante) — ambos de pé, cada jogador com sua
   cor, sua cidade, seu território, sua economia, zero erro de JavaScript, `checkEnd()` sem
   quebrar. **Ainda não ligado na tela de configurar partida** — por enquanto só dá pra
   testar chamando `newGame({...,np:4,ais:[...]})` direto no console; a Etapa 5 é expor isso
   na UI.
   Limitação conhecida (cosmética, não afeta a jogabilidade): a tela de fim de jogo e o HUD
   de "Maravilha/Território do inimigo" ainda falam de "o inimigo" no singular — com 3+
   jogadores eles mostram só o que o jogador 1 está fazendo, não o pior entre todos. Fica
   pra quando a tela de configurar partida (Etapa 5) entrar.
3. Repetir a geração de posições iniciais pros outros mapas (hoje só o algoritmo genérico do
   `genStarts` é usado pra qualquer N>2; os mapas especiais — Arena, Cordilheira — têm seus
   próprios ajustes extras que generalizamos parcialmente: Arena já cerca todas as N bases
   de muralha, Cordilheira ainda decora só o caminho entre os jogadores 0 e 1).
4. ✅ **FEITO junto com a Etapa 2** — IA rodando pra todos os `NP-1` oponentes (sem
   diplomacia ainda — todos contra todos, cada aldeão e soldado de cada IA se defende e
   persegue qualquer outro jogador real, não só o jogador 0).
5. ✅ **FEITO (Versão 47)** — Tela de configurar partida: nova opção "Oponentes" (1 a 7) na
   aba Partida. Ao clicar Iniciar, `SETUP.np = oponentes+1` é passado pro `newGame()`; se o
   tamanho do mapa escolhido não aguenta tantos (ex.: Pequeno só recomenda 2 jogadores), o
   jogo avisa na tela ("⚠️ Este tamanho de mapa aguenta bem até N oponente(s)") e o próprio
   motor já limita sozinho (testado: Pequeno + pedir 7 oponentes = parte com 2 mesmo assim,
   sem travar). Os povos dos oponentes extras são sorteados entre os 15 disponíveis (as 12
   nações originais + Alemães, e as outras que o módulo de nações acrescenta).
   **Com isso o jogo já é jogável de ponta a ponta com até 8 jogadores reais** — falta só a
   diplomacia (Etapa 6) pra virar aliados em vez de todos-contra-todos.
6. ✅ **FEITO (Versão 48)** — Diplomacia. `G.rel[a][b]=1` = aliados; `ally(a,b)`/`foe(a,b)`/
   `setRel(a,b,v)` em `p2_data.js`. Aliados não se atacam (ordens, mira automática, dano em
   área, conversão, sabotagem, captura de cidade, atrito em território), dividem a visão do
   mapa e vencem juntos (`checkEnd`). IA só mira em quem é inimigo dela.
   Tela de configurar: opção "Alianças" (todos contra todos / dois times / todos contra você).
   Em jogo: botão 🤝 (só com 3+ jogadores) abre o painel (`p6q_diplo.js`) para propor
   aliança ou declarar guerra. A IA recusa se você a atacou nos últimos 90 s, se você traiu
   a aliança nos últimos 5 min, ou se não sobraria nenhum inimigo. Quem se alia entra no seu
   time (rompe com os seus inimigos). Teste: `dip48.js`.
   Ainda não tem: IA propondo aliança por conta própria, tributo, e construir em terra aliada.

Cada etapa sobe pro GitHub sozinha, testada, sem deixar o jogo quebrado no meio do
caminho — do jeito que venho fazendo com guarnecimento, Alarme, Espião e som.
