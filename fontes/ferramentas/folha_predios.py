#!/usr/bin/env python3
"""Transforma uma folha de prédios gerada por IA numa folha do jogo.
uso: folha_predios.py imagem.png estilo AT tipo1,tipo2,...  [fundo=xadrez|magenta]
- tira o fundo (xadrez falso de transparência ou magenta), separa os prédios da esquerda para a direita,
  acha o losango da base de cada um e grava assets/gpt/b_<estilo>_<AT>_0.webp (azul) e _1.webp (vermelho),
  além de atualizar fontes/v2/p5c_gptdata.js com as medidas."""
import sys,json,os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
RAIZ=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SZ={'tc':3,'casa':2,'celeiro':2,'deposito':2,'mercado':3,'doca':2,'torre':1.12,'muralha':1,'quartel':3,'arquearia':3,'estabulo':3,'academia':3,'templo':3,'oficina':3,'maravilha':4,'alicerce':2,'biblioteca':3,'universidade':3,'serraria':2,'fundicao':2,'refinaria':2,'fazenda':3}
def tirar_fundo(a,modo):
    r,g,b=[a[...,i].astype(int) for i in range(3)]
    if modo=='magenta': cand=(r>150)&(b>150)&(g<110)&(abs(r-b)<70)
    else:
        # xadrez falso: descobre os dois tons de cinza olhando os cantos da imagem
        mn=np.minimum(np.minimum(r,g),b);mx=np.maximum(np.maximum(r,g),b);cz=(r+g+b)//3
        cant=np.concatenate([cz[:40,:40].ravel(),cz[:40,-40:].ravel(),cz[-40:,:40].ravel(),cz[-40:,-40:].ravel()])
        hist=np.bincount(cant,minlength=256);t1=int(hist.argmax());h2=hist.copy();h2[max(0,t1-18):t1+19]=0;t2=int(h2.argmax())
        print('tons do xadrez:',t1,t2)
        # O xadrez pintado pela IA vem nítido longe dos prédios e borrado perto deles, então não dá para confiar no
        # desenho da grade. O que ele tem de constante é ser cinza PURO (r=g=b) entre o tom escuro e o claro.
        # A pedra dos prédios é puxada para o bege ou para o azul, e o reboco é mais claro que o tom claro.
        claro=max(t1,t2);escuro=min(t1,t2);sem_cor=(mx-mn)<=9
        cand=sem_cor&(cz>escuro-28)&(cz<claro+14)
    lab,n=ndi.label(cand)
    borda=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    fundo=np.isin(lab,list(borda))
    # ilhas de fundo presas dentro de andaimes e cercas: regiões grandes da mesma cor também saem
    tam=ndi.sum(cand,lab,range(1,n+1))
    for i,t in enumerate(tam,1):
        if t>60 and i not in borda and modo=='magenta': fundo|=(lab==i)
    alpha=np.where(fundo,0,255).astype(np.uint8)
    # come 1 pixel da borda para tirar o halo claro
    m=alpha>0
    # o fundo "mordeu" pedacinhos de pedra cinza na beirada: fecha essas mordidas estreitas e os furinhos
    m=ndi.binary_closing(m,structure=np.ones((3,3)),iterations=2)|m
    furos,nf=ndi.label(~m);tf=ndi.sum(~m,furos,range(1,nf+1))
    for k,t in enumerate(tf,1):
        if t<60:m|=(furos==k)
    m=ndi.binary_erosion(m,iterations=1)
    if modo!='magenta':
        # sobras do xadrez: pixels sem cor, no tom do fundo e finos (somem numa abertura). Saem, para não ligar um prédio no outro.
        fino=m&~ndi.binary_opening(m,structure=np.ones((3,3)),iterations=2)
        m&=~(fino&sem_cor&(cz>escuro-22)&(cz<claro+22))
    return np.where(m,255,0).astype(np.uint8)
def borda_macia(m):
    # contorno suave (sem serrilhado): desfoca só a beirada, sem crescer para fora
    f=ndi.gaussian_filter(m.astype(float),.8);return (np.clip((f-.35)/.5,0,1)*255*m).astype(np.uint8)
def vermelho(rgba):
    import colorsys
    a=rgba.astype(float)/255;r,g,b=a[...,0],a[...,1],a[...,2]
    mx=np.max(a[...,:3],-1);mn=np.min(a[...,:3],-1);d=mx-mn;l=(mx+mn)/2
    s=np.where(d>0,d/(1-np.abs(2*l-1)+1e-9),0)
    h=np.where(mx==b,(r-g)/(d+1e-9)+4,0)*60
    m=(mx==b)&(d>.12)&(s>.3)&(h>195)&(h<262)&(a[...,3]>.03)
    out=rgba.copy()
    # azul -> vermelho: gira o matiz para ~4 graus mantendo luz e saturação
    C=(1-np.abs(2*l-1))*np.minimum(1,s*1.05);X=C*(1-abs((4/60)%2-1));mm=l-C/2
    out[...,0]=np.where(m,(C+mm)*255,out[...,0]);out[...,1]=np.where(m,(X+mm)*255,out[...,1]);out[...,2]=np.where(m,mm*255,out[...,2])
    return out
def main():
    img,st,at,tipos=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4].split(',')
    modo=(sys.argv[5] if len(sys.argv)>5 else 'xadrez')
    a=np.array(Image.open(img).convert('RGB'));alpha=tirar_fundo(a,modo)
    # prédios encostados um no outro: acha o "miolo" de cada um (erosão forte) e dá cada pixel ao miolo mais perto
    # 1º separa o que já está solto; 2º se faltar prédio, corta o grupo que tem a "cintura" mais fina
    from skimage.segmentation import watershed
    from skimage.feature import peak_local_max
    mask=alpha>0;lab,n0=ndi.label(mask,structure=np.ones((3,3)))
    tam=ndi.sum(mask,lab,range(1,n0+1));ok=[i+1 for i,t in enumerate(tam) if t>mask.sum()*.004]
    grande=np.where(np.isin(lab,ok),lab,0)
    # pedaço pequeno colado num prédio (bandeira, rede pendurada) fica com ele; poeira solta no fundo sai
    d,(iy,ix)=ndi.distance_transform_edt(grande==0,return_indices=True)
    lab=np.where(mask&(d<=14),grande[iy,ix],0)
    def cortar(m):
        # tenta dividir a peça m em duas pelo divisor de águas; devolve (largura do corte / raiz da menor parte, rótulos)
        cheio=ndi.binary_fill_holes(m);dt=ndi.gaussian_filter(ndi.distance_transform_edt(cheio),2.5)
        best=None
        for md in (int(m.shape[1]*.25),int(m.shape[1]*.18),int(m.shape[1]*.12),20,12):
            pk=peak_local_max(dt,min_distance=max(6,md),labels=cheio.astype(int),exclude_border=False)
            if len(pk)<2:continue
            pk=pk[np.argsort(-dt[pk[:,0],pk[:,1]])][:2];mk=np.zeros(m.shape,int);mk[pk[0][0],pk[0][1]]=1;mk[pk[1][0],pk[1][1]]=2
            w=watershed(-dt,mk,mask=cheio);a1=(w==1);a2=(w==2)
            corte=(ndi.binary_dilation(a1)&a2).sum();menor=min(a1.sum(),a2.sum())
            if menor<m.sum()*.08:continue
            sc=corte/np.sqrt(menor)
            if best is None or sc<best[0]:best=(sc,np.where(m,w,0))
        return best
    while len(np.unique(lab))-1<len(tipos):
        cands=[]
        for i in np.unique(lab)[1:]:
            sl=ndi.find_objects((lab==i).astype(int))[0];c=cortar(lab[sl]==i)
            if c:cands.append((c[0],i,sl,c[1]))
        assert cands,'não consegui separar os prédios'
        sc,i,sl,w=min(cands,key=lambda c:c[0]);sub=lab[sl];nv=lab.max()+1;sub[(sub==i)&(w==2)]=nv
    # renumera 1..n
    ids=np.unique(lab)[1:];mp=np.zeros(lab.max()+1,int);mp[ids]=np.arange(1,len(ids)+1);lab=mp[lab]
    lab=np.where(alpha>0,lab,0);n=lab.max()
    # cada prédio fica só com o corpo principal e o que está colado nele; fiapos distantes saem
    for i in range(1,n+1):
        mi=lab==i;c,nc=ndi.label(mi,structure=np.ones((3,3)))
        if nc<2:continue
        t=ndi.sum(mi,c,range(1,nc+1));corpo=c==(int(np.argmax(t))+1);perto=ndi.binary_dilation(corpo,iterations=14)
        for k in range(1,nc+1):
            if not (perto&(c==k)).any():lab[c==k]=0
    if os.environ.get('DBG'):
        pal=np.random.RandomState(1).randint(40,255,(n+1,3));pal[0]=0;Image.fromarray(pal[lab].astype(np.uint8)).save(os.environ['DBG'])
    objs=[(sl,(lab[sl]==i+1).sum(),i+1) for i,sl in enumerate(ndi.find_objects(lab)) if sl is not None]
    objs=[o for o in objs if o[1]>1500];objs.sort(key=lambda o:(o[0][1].start+o[0][1].stop)/2)
    print('prédios achados:',len(objs),'esperados:',len(tipos),[(o[0][1].start,o[0][1].stop,o[1]) for o in objs])
    assert len(objs)==len(tipos),'número de prédios diferente do esperado'
    recs=[];x=0;hmax=0
    for (sl,area,i),t in zip(objs,tipos):
        m=(lab[sl]==i);rgb=a[sl];h,w=m.shape
        # losango da base: vértice de baixo = ponto mais baixo; laterais = extremos esquerdo/direito da metade de baixo
        ys,xs=np.nonzero(m);yb=ys.max();xb=int(np.median(xs[ys>=yb-2]))
        low=ys>h*0.45;xl=xs[low].min();xr=xs[low].max()
        dpx=max(xb-xl,xr-xb)*2          # largura do losango em pixels (simétrico em torno do vértice de baixo)
        half=max(xb,w-1-xb)+2;W=half*2;ox=half-xb
        can=np.zeros((h+2,W,4),np.uint8);can[:h,ox:ox+w,:3]=rgb;can[:h,ox:ox+w,3]=borda_macia(m)
        dw=SZ[t]*64;k=dw/dpx
        recs.append(dict(t=t,can=can,k=k,dw=dw,yb=yb));hmax=max(hmax,h+2)
    Wt=sum(r['can'].shape[1]+2 for r in recs);atl=np.zeros((hmax,Wt,4),np.uint8);meta={}
    for r in recs:
        c=r['can'];h,w=c.shape[:2];atl[:h,x:x+w]=c;k=r['k'];dw=r['dw']
        top=(r['yb']+1)*k-dw/2
        meta[r['t']]={"W":round(w*k,2),"H":round(h*k,2),"xc":round(w*k/2,2),"top":round(top,2),"cy":round(top+dw/4,2),"bt":round(max(.5,h*k-(top+dw/2)),2),"dw":dw,"r":[x,0,w,h],"at":at}
        x+=w+2
    out=os.path.join(RAIZ,'assets','gpt')
    Image.fromarray(atl,'RGBA').save(os.path.join(out,f'b_{st}_{at}_0.webp'),lossless=False,quality=92,method=6)
    Image.fromarray(vermelho(atl),'RGBA').save(os.path.join(out,f'b_{st}_{at}_1.webp'),lossless=False,quality=92,method=6)
    f=os.path.join(RAIZ,'fontes','v2','p5c_gptdata.js');s=open(f,encoding='utf-8').read();i=s.index('{');j=s.rindex('}')+1;d=json.loads(s[i:j])
    d['b'].setdefault(st,{}).update(meta);open(f,'w',encoding='utf-8').write(s[:i]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[j:])
    print('ok',st,at,{t:(m['r'][2],m['r'][3],round(m['W']),round(m['H'])) for t,m in meta.items()})
main()
