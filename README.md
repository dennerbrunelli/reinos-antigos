# ⚔️ Império

Jogo de estratégia em tempo real para celular (antes chamado *Reinos Antigos*), com visão em diagonal e clima de jogo clássico dos anos 90. Funciona **sem internet** depois de aberto uma vez. É a fusão de dois clássicos: a economia e o clima do Age of Empires com as fronteiras e cidades do Rise of Nations. A arte (abertura, todas as unidades, barcos, cerco, animais, prédios gregos e egípcios, árvores, recursos e chão) foi pintada com o GPT; o que ainda não chegou, os sons e a música são gerados pelo próprio código.

**Jogar:** https://dennerbrunelli.github.io/reinos-antigos/

## Como instalar no celular
1. Abra o link acima no Chrome (com internet).
2. Toque no menu **⋮** → **Adicionar à tela inicial** (ou **Instalar app**).
3. Pronto: o ícone aparece na tela inicial e o jogo abre mesmo sem internet.
4. Quando sair uma versão nova: na tela inicial, toque em **🔄 Atualizar o jogo** (precisa de internet). O jogo salvo não se perde.

## O jogo
- 12 povos com 4 estilos de arquitetura (egípcia, grega, babilônica e oriental), cada um com vantagens próprias
- 8 eras como no Rise: Antiga, Clássica, Medieval, Pólvora, Iluminismo, Industrial, Moderna e Informação (avança na Biblioteca; petróleo, Fábrica, Silo com Bomba nuclear, Pulso EMP e o Relógio do Armagedom)
- Formações (Livre, Linha, Caixa, Espaçada, Flanco; o grupo anda no passo do mais lento) e posturas (Agressiva, Defensiva, Firme, Sem ataque)
- Interface no formato do Rise: barra de recursos em cima (com taxa por minuto e aviso quando o limite de comércio trava) e barra embaixo com minimapa, seleção e comandos. É o modo padrão; os outros modos ficam em 🧩 Interface
- Economia igual ao Rise: sem carregar, recursos infinitos com limite de trabalhadores, Acampamento de lenhadores, 5 fazendas por cidade, Celeiro/Serraria/Fundição/Refinaria
- **Fronteiras:** cada cidade tem o seu território. Casas, fazendas e quartéis só dentro dele; torres e cidades novas aumentam a fronteira
- **Várias cidades:** até 4 Centros Urbanos. Centro Urbano derrubado não some: quem cercar com soldados toma a cidade inteira
- **Exército do Rise:** espião (quartel; perto de uma base inimiga mostra o que ela tem), 🔁 patrulha (vai e volta entre dois pontos até você dar outra ordem) e tropas que ficam +6% mais fortes a cada era
- **Guarnecer:** cidadãos e tropas entram nos prédios (toque no prédio com as unidades selecionadas). Eruditos estudam dentro da Universidade; soldados na Torre e no Forte dão mais flechas; ao destruir um prédio, quem estava dentro sai vivo
- **Poder de cada povo** (⚡ no Centro Urbano, com tempo de espera): Bênção do Nilo, Carros de Assur, Zigurate, Falange, Rota Comercial, Labirinto, Jardins Suspensos, Carga Persa, Forja de Cerco, Bushido, Oráculo e Hino de Guerra
- **Atrito:** tropas paradas no território inimigo perdem vida aos poucos
- **População como no Rise:** sem casas; começa em 50 e cada Organização Militar (no Centro Urbano) dá +25, até 200; com a Maravilha de pé, até 250
- Comida de arbustos, caça (gazelas, elefantes selvagens, leões), peixes e fazendas
- Doca, barco pesqueiro, barco de transporte, barco de guerra e trirreme
- Templo e sacerdote (converte inimigos e cura), 20 tecnologias, muralhas e torres
- Mapas: Mar Interior e Continente · inimigo com 3 dificuldades
- Vitória por conquista, pela Maravilha (5 minutos de pé) ou por território (65% da terra por 3 minutos)
- Salva sozinho: dá para sair e continuar depois

## Controles
- **Toque:** tocar seleciona · arrastar move o mapa · segurar e arrastar faz caixa de seleção · 2 dedos dão zoom
- **Controle Xbox (Bluetooth):** analógico esquerdo move o cursor · A seleciona/ordena · segurar RT abre o menu de comandos · LT + A treina 5 · direcional acha aldeão parado, centro e exército · Start pausa

## Arquivos
- `index.html` — o jogo inteiro (desenhos, regras, inteligência do inimigo, sons e música)
- `sw.js` — guarda o jogo no celular para funcionar offline (ao atualizar o jogo, trocar a versão `imperio-v42` → `imperio-v43`)
- `manifest.json` e ícones — instalação como app
