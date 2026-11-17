#!/bin/bash
cd /home/claude/trab/testes
for t in paz75 ordens74 som73 grp73 tip72 sino72 guarda72 aggro72 raro69 placar66 hud66 gar35 gar38neg pw36 estilos36 uni38 cap39 alarm39 sabo40 snd42 mus43 mood44 starts45 np4 np8 setupui46 dip48 dip49 cw51 fx53 obra62 btn62; do f=$(ls $t*.js|head -1); out=$(timeout 300 node $f 2>&1); if echo "$out"|grep -q "TypeError\|ReferenceError\|ERR_\|ERROS \[ *'\|PAGEERR"; then echo "FALHA $t"; echo "$out"|tail -6; else echo "ok $t"; fi; done; echo FIM
