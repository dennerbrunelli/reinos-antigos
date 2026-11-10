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
SZ={'tc':3,'casa':2,'celeiro':2,'deposito':2,'mercado':3,'doca':2,'torre':1.12,'muralha':1,'quartel':3,'arquearia':3,'estabulo':3,'academia':3,'templo':3,'oficina':3,'maravilha':4,'alicerce':2,'biblioteca':3}
def tirar_fundo(a,modo):
    r,g,b=[a[...,i].astype(int) for i in range(3)]
    if modo=='magenta': cand=(r>150)&(b>150)&(g<110)&(abs(r-b)<70)
    else: cand=(np.minimum(np.minimum(r,g),b)>185)&((np.maximum(np.maximum(r,g),b)-np.minimum(np.minimum(r,g),b))<14)
    lab,n=ndi.label(cand)
    borda=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    fundo=np.isin(lab,list(borda))
    # ilhas de fundo presas dentro de andaimes e cercas: regiões grandes da mesma cor também saem
    tam=ndi.sum(cand,lab,range(1,n+1))
    for i,t in enumerate(tam,1):
        if t>60 and i not in borda and modo=='magenta': fundo|=(lab==i)
    alpha=np.where(fundo,0,255).astype(np.uint8)
    # come 1 pixel da borda para tirar o halo claro
    alpha=np.where(ndi.binary_erosion(alpha>0,iterations=1),255,0).astype(np.uint8)
    return alpha
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
    # prédios encostados: divisor de águas a partir dos "miolos" (picos da distância até a borda)
    from skimage.segmentation import watershed
    from skimage.feature import peak_local_max
    mask=ndi.binary_fill_holes(alpha>0);dt=ndi.gaussian_filter(ndi.distance_transform_edt(mask),3)
    lab=None
    for md in range(a.shape[1]//8,10,-6):
        pk=peak_local_max(dt,min_distance=md,labels=mask.astype(int),exclude_border=False)
        if len(pk)>=len(tipos):
            pk=pk[np.argsort(-dt[pk[:,0],pk[:,1]])][:len(tipos)];mk=np.zeros(mask.shape,int)
            for k,(y,x) in enumerate(pk,1):mk[y,x]=k
            lab=watershed(-dt,mk,mask=mask);break
    assert lab is not None,'não consegui separar os prédios'
    lab=np.where(alpha>0,lab,0);n=lab.max()
    if os.environ.get('DBG'):
        pal=np.random.RandomState(1).randint(40,255,(n+1,3));pal[0]=0;Image.fromarray(pal[lab].astype(np.uint8)).save(os.environ['DBG'])
    objs=[(sl,(lab[sl]==i+1).sum(),i+1) for i,sl in enumerate(ndi.find_objects(lab)) if sl is not None]
    objs=[o for o in objs if o[1]>1500];objs.sort(key=lambda o:o[0][1].start)
    print('prédios achados:',len(objs),'esperados:',len(tipos))
    assert len(objs)==len(tipos),'número de prédios diferente do esperado'
    recs=[];x=0;hmax=0
    for (sl,area,i),t in zip(objs,tipos):
        m=(lab[sl]==i);rgb=a[sl];h,w=m.shape
        # losango da base: vértice de baixo = ponto mais baixo; laterais = extremos esquerdo/direito da metade de baixo
        ys,xs=np.nonzero(m);yb=ys.max();xb=int(np.median(xs[ys>=yb-2]))
        low=ys>h*0.45;xl=xs[low].min();xr=xs[low].max()
        dpx=max(xb-xl,xr-xb)*2          # largura do losango em pixels (simétrico em torno do vértice de baixo)
        half=max(xb,w-1-xb)+2;W=half*2;ox=half-xb
        can=np.zeros((h+2,W,4),np.uint8);can[:h,ox:ox+w,:3]=rgb;can[:h,ox:ox+w,3]=np.where(m,255,0)
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
