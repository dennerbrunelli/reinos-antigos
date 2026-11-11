import os,glob,json,numpy as np,librosa,pyloudnorm as pyln,soundfile as sf
SR=44100
IN='/workspace/in'
# nomes dos arquivos: <chave>__<n>.mp3 ; musica: M_<nome>.mp3
fx=sorted(glob.glob(IN+'/*__*.mp3'));mus=sorted(glob.glob(IN+'/M_*.mp3'))
meter=pyln.Meter(SR)
gap=np.zeros((int(SR*.3),2),np.float32)
parts=[];t=0.0;table={}
def add(a):
    global t
    parts.append(a);t+=len(a)/SR
for f in fx:
    k=os.path.basename(f).split('__')[0]
    y,_=librosa.load(f,sr=SR,mono=True)
    y,_=librosa.effects.trim(y,top_db=38,frame_length=512,hop_length=128)
    # curto demais nao precisa de 2s de cauda: limita
    mx={'click':.35,'sel':.7,'coin':1.0,'hammer':.7,'chop':.8,'mine':.9,'clash':.8,'arrow':.9,'die':1.2,'done':1.8,'alert':2.5,'age':3.5,'collapse':3.0,'boom':2.2,'unit':1.5}.get(k,2.5)
    y=y[:int(SR*mx)]
    fo=min(len(y)//3,int(SR*.06));
    if fo>0:y[-fo:]*=np.linspace(1,0,fo)
    try:
        L=meter.integrated_loudness(np.tile(y,max(1,int(.5*SR/len(y))+1)))
        y=pyln.normalize.loudness(y,L,-16.0 if k not in('click','sel') else -20.0)
    except Exception as e:pass
    p=np.max(np.abs(y));
    if p>0.89:y*=0.89/p
    st=round(t,4);add(np.stack([y,y],1).astype(np.float32));table.setdefault(k,[]).append([st,round(len(y)/SR,4)]);add(gap)
add(np.zeros((SR,2),np.float32))
mtab={}
for f in mus:
    k=os.path.basename(f)[2:-4]
    y,_=librosa.load(f,sr=SR,mono=False)
    if y.ndim==1:y=np.stack([y,y])
    y=y.T.copy()
    # laço sem emenda: os ultimos 2 s se misturam no comeco
    X=int(SR*2.0);head=y[:X].copy();tail=y[-X:].copy();w=np.linspace(0,1,X)[:,None]
    y=y[:-X];y[:X]=head*w+tail*(1-w)
    L=meter.integrated_loudness(y);y=pyln.normalize.loudness(y,L,-18.0)
    p=np.max(np.abs(y));
    if p>0.95:y*=0.95/p
    mtab[k]=[round(t,4),round(len(y)/SR,4)];add(y.astype(np.float32));add(np.zeros((SR,2),np.float32))
allw=np.concatenate(parts)
sf.write('/workspace/tmp_all.wav',allw,SR,subtype='PCM_16')
print(json.dumps({'fx':table,'mus':mtab,'total':round(t,3)}))
