#!/bin/bash
# uso: split_sons.sh pacote.mp3  -> gera assets/som/efeitos.ogg, m_paz.ogg e preenche SFXMAP
set -e
IN="$1"; S=/tmp/claude-0/-home-claude/0c0c3e1d-2c6b-5198-832a-e708066866a5/scratchpad
R=/home/claude/reinos-antigos; mkdir -p $R/assets/som
ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN"
python3 - "$IN" <<'EOF'
import json,subprocess,sys
T=json.load(open('/tmp/claude-0/-home-claude/0c0c3e1d-2c6b-5198-832a-e708066866a5/scratchpad/sons_tabela.json'))
src=sys.argv[1];R='/home/claude/reinos-antigos'
fxend=min(v[0] for v in T['mus'].values())-0.5
# efeitos: mono, 48 kbps opus (fica pequeno); tempos continuam os mesmos
subprocess.run(['ffmpeg','-loglevel','error','-y','-i',src,'-t',str(fxend),'-ac','1','-c:a','libopus','-b:a','56k',R+'/assets/som/efeitos.ogg'],check=True)
for k,(s,d) in T['mus'].items():
    subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',str(s),'-i',src,'-t',str(d),'-c:a','libopus','-b:a','80k',R+'/assets/som/m_'+k+'.ogg'],check=True)
p=R+'/fontes/v2/p6u_audio.js';c=open(p).read()
a=c.index('/*SFXMAP*/')+len('/*SFXMAP*/');b=c.index('/*FIM*/')
c=c[:a]+json.dumps(T['fx'],separators=(',',':'))+c[b:];open(p,'w').write(c)
print('ok')
EOF
ls -l $R/assets/som
