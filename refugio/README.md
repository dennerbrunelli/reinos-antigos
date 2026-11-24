# 🏡 Refúgio

Jogo de sobrevivência de uma vila, para celular, com arte em pixel desenhada pelo próprio jogo (nenhuma imagem externa). Não tem guerra: o inimigo é o inverno, a fome e o frio. Funciona **sem internet** depois de aberto uma vez.

**Jogar:** https://dennerbrunelli.github.io/reinos-antigos/refugio/

## A história
Depois de três anos de seca em Pedra Alta, o barão expulsa cinco famílias. Elas atravessam a serra com uma carroça e chegam a um vale desconhecido. O **Diário de Dona Cida** conta a história em 10 capítulos, e cada capítulo tem um objetivo (primeiras casas, comida, lenha para o inverno, o primeiro bebê, o trigo, o ferreiro, a vila crescendo...).

## Como funciona
- **4 estações** (6 dias cada): neve no inverno, folhas caindo no outono, flores na primavera, dia e noite com janelas acesas
- **Moradores de verdade:** cada um tem nome, idade, família, fome, calor, saúde, ferramenta e roupa. Crescem, casam, têm filhos, envelhecem e morrem
- **Casas fazem a vila crescer:** casa vazia atrai um casal; jovens saem da casa dos pais quando há casa livre
- **Comida:** coletor (frutas e ervas), caçador (carne e couro), pescador e plantação de trigo (planta na primavera, colhe no fim do verão, a geada estraga o resto)
- **Frio:** as casas queimam lenha. Lenhador faz lenha de toras; alfaiate faz roupas de couro
- **Recursos:** marque árvores, pedras e ferro para os trabalhadores recolherem; silvicultor replanta a mata; pedreira e mina dão pedra e ferro sem acabar; ferreiro faz ferramentas
- **Trabalho:** toque numa cabana e use − / + para escolher quantas pessoas trabalham nela (sempre ficam 2 livres para construir)
- **Viajantes:** a partir do 2º ano, grupos de exilados pedem para morar no vale
- **Primeiros passos guiados** no jogo novo (com botão piscando) e o objetivo do capítulo sempre no canto 🎯
- Números sobem quando algo chega ao depósito; sons gravados de machado, martelo, sino e água
- Salva sozinho todo dia de manhã

## Controles
Arrastar move o mapa · pinça dá zoom · tocar mostra detalhes · nas ferramentas de arrastar (Recolher, Estrada) dois dedos movem o mapa · no computador: roda do mouse dá zoom, espaço pausa, 1–3 mudam a velocidade.

## Arquivos
- `index.html` — tela e estilo
- `js/arte.js` — toda a arte em pixel (chão, árvores, prédios, pessoas, cervos) por estação
- `js/mundo.js` — mapa, recursos, prédios e caminhos
- `js/gente.js` — moradores, trabalho, famílias, estações e o diário
- `js/tela.js` — desenho, toque, painéis, música e salvar
- `sons/` — efeitos gravados (os mesmos do Império)
- `sw.js` — guarda o jogo no celular (ao atualizar, trocar `refugio-v2` → `refugio-v3`)
