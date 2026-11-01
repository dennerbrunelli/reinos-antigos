# ⚔️ Reinos Antigos

Jogo de estratégia em tempo real para celular, no estilo dos clássicos de construir reinos. Funciona **sem internet** depois de aberto uma vez.

**Jogar:** https://dennerbrunelli.github.io/reinos-antigos/

## Como instalar no celular
1. Abra o link acima no Chrome (com internet).
2. Toque no menu **⋮** → **Adicionar à tela inicial** (ou **Instalar app**).
3. Pronto: o ícone aparece na tela inicial e o jogo abre mesmo sem internet.

## O jogo
- 4 eras: Pedra, Ferramentas, Bronze e Ferro
- Recursos: comida, madeira, ouro e pedra
- Unidades: aldeão, lanceiro, espadachim, arqueiro, batedor, cavaleiro e catapulta
- Inimigo controlado pelo computador (Fácil, Normal e Difícil)
- Vitória destruindo o inimigo ou mantendo a Maravilha de pé por 5 minutos
- Salva sozinho: dá para sair e continuar depois

## Controles
- **Toque:** tocar seleciona · arrastar move o mapa · segurar e arrastar faz caixa de seleção · 2 dedos dão zoom
- **Controle Xbox (Bluetooth):** analógico esquerdo move o cursor · A seleciona/ordena · segurar RT abre o menu de comandos · LT + A treina 5 · direcional acha aldeão parado, centro e exército · Start pausa

## Arquivos
- `index.html` — o jogo inteiro (desenhos, regras e inteligência do inimigo)
- `sw.js` — guarda o jogo no celular para funcionar offline (ao atualizar o jogo, trocar a versão `reinos-v1` → `reinos-v2`)
- `manifest.json` e ícones — instalação como app
