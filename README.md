# ⚔️ Reinos Antigos

Jogo de estratégia em tempo real para celular, com visão em diagonal e clima de jogo clássico dos anos 90. Funciona **sem internet** depois de aberto uma vez. Todos os desenhos, sons e a música são gerados pelo próprio código.

**Jogar:** https://dennerbrunelli.github.io/reinos-antigos/

## Como instalar no celular
1. Abra o link acima no Chrome (com internet).
2. Toque no menu **⋮** → **Adicionar à tela inicial** (ou **Instalar app**).
3. Pronto: o ícone aparece na tela inicial e o jogo abre mesmo sem internet.
4. Quando sair uma versão nova: abra o jogo com internet, feche e abra de novo.

## O jogo
- 12 povos com 4 estilos de arquitetura (egípcia, grega, babilônica e oriental), cada um com vantagens próprias
- 4 eras: Pedra, Ferramentas, Bronze e Ferro (para avançar, construa 2 prédios da era atual)
- Comida de arbustos, caça (gazelas, elefantes selvagens, leões), peixes e fazendas
- Doca, barco pesqueiro, barco de transporte, barco de guerra e trirreme
- Templo e sacerdote (converte inimigos e cura), 20 tecnologias, muralhas e torres
- Mapas: Mar Interior e Continente · inimigo com 3 dificuldades
- Vitória destruindo o inimigo ou mantendo a Maravilha de pé por 5 minutos
- Salva sozinho: dá para sair e continuar depois

## Controles
- **Toque:** tocar seleciona · arrastar move o mapa · segurar e arrastar faz caixa de seleção · 2 dedos dão zoom
- **Controle Xbox (Bluetooth):** analógico esquerdo move o cursor · A seleciona/ordena · segurar RT abre o menu de comandos · LT + A treina 5 · direcional acha aldeão parado, centro e exército · Start pausa

## Arquivos
- `index.html` — o jogo inteiro (desenhos, regras, inteligência do inimigo, sons e música)
- `sw.js` — guarda o jogo no celular para funcionar offline (ao atualizar o jogo, trocar a versão `reinos-v3` → `reinos-v4`)
- `manifest.json` e ícones — instalação como app
