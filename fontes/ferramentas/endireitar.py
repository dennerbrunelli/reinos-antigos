# Endireita a base dos prédios pintados: o losango do chão de cada prédio passa a ser um losango
# isométrico perfeito (largura = 2 × altura, vértice de baixo no meio), igual ao chão do jogo.
# Antes, cada pintura vinha com o chão um pouco girado ou achatado e o prédio parecia "torto".
# Uso: python3 endireitar.py [--ver pasta]   (mexe em assets/gpt/b_*.webp e no p5c_gptdata.js)
import json,os,sys,numpy as np
from PIL import Image
R=os.path.dirname(os.path.abspath(__file__))+'/../..'
DATA=R+'/fontes/v2/p5c_gptdata.js';GPT=R+'/assets/gpt'
src=open(DATA).read();i0=src.index('{');i1=src.rindex('}')+1;D=json.loads(src[i0:i1])

def medir(al):
    h,w=al.shape;m=al>110
    bot=np.full(w,-1)
    for x in range(w):
        c=np.nonzero(m[:,x])[0]
        if len(c):bot[x]=c.max()
    yb=bot.max();xb=float(np.median(np.nonzero(bot>=yb-2)[0]))
    low=np.zeros_like(m);low[int(h*.45):]=m[int(h*.45):]
    cols=np.nonzero(low.any(0))[0];x0,x1=cols.min(),cols.max()
    def incl(a,b):
        xs=np.arange(int(a),int(b));ys=bot[xs];ok=ys>=0;xs,ys=xs[ok],ys[ok];n=len(xs)
        if n<8:return None
        k=n//2;sl=(ys[k:k*2]-ys[:k])/(xs[k:k*2]-xs[:k]);return float(np.median(sl))
    wl,wr=xb-x0,x1-xb
    sL=incl(x0+wl*.2,xb-wl*.15);sR=incl(xb+wr*.15,x1-wr*.2)
    return dict(yb=float(yb),xb=xb,x0=float(x0),x1=float(x1),sL=sL,sR=sR,h=h,w=w)

def afim(P,Q):# matriz 2x3 que leva os 3 pontos P nos 3 pontos Q
    A=[];b=[]
    for (x,y),(u,v) in zip(P,Q):A.append([x,y,1,0,0,0]);A.append([0,0,0,x,y,1]);b+= [u,v]
    s=np.linalg.solve(np.array(A,float),np.array(b,float));return s.reshape(2,3)

ver=None
if '--ver' in sys.argv:ver=sys.argv[sys.argv.index('--ver')+1];os.makedirs(ver,exist_ok=True)
rel=[]
for st,B in D['b'].items():
    for at in sorted(set(m['at'] for m in B.values())):
        tipos=[t for t,m in B.items() if m['at']==at];tipos.sort(key=lambda t:B[t]['r'][0])
        atl=[np.array(Image.open(f'{GPT}/b_{st}_{at}_{v}.webp').convert('RGBA')) for v in (0,1)]
        cortes=[];mudou=False
        for t in tipos:
            m=B[t];x,y,w,h=m['r'];c0=atl[0][y:y+h,x:x+w];c1=atl[1][y:y+h,x:x+w]
            g=medir(c0[...,3]);dw=m['dw']
            ok=g['sL'] is not None and g['sR'] is not None
            sL=g['sL'] if ok else .5;sR=-g['sR'] if ok else .5
            Dw=g['x1']-g['x0'];off=(g['xb']-(g['x0']+g['x1'])/2)/Dw
            # medida confiável? (raios de bandeira, árvores e barris podem enganar)
            confia=ok and .4<sL<.66 and .4<sR<.66 and abs(off)<.08 and t!='muralha'
            L=(g['x0'],g['yb']-sL*(g['xb']-g['x0']));Bv=(g['xb'],g['yb']);Rv=(g['x1'],g['yb']-sR*(g['x1']-g['xb']))
            cx=g['xb'];L2=(g['x0'],g['yb']-.5*(g['xb']-g['x0']));B2=(cx,g['yb']);R2=(g['x1'],g['yb']-.5*(g['x1']-g['xb']))
            desvio=max(abs(L[1]-L2[1]),abs(Rv[1]-R2[1]),abs(Bv[0]-B2[0]))
            if not confia or desvio<1.5:
                cortes.append((t,c0,c1,None,g,Dw if confia else None));rel.append((st,t,'mantido' if not confia else 'ok',round(desvio,1),round(sL,2),round(sR,2),round(off,2)));continue
            # só mexe na vertical (y' = d·x + e·y + f): as paredes continuam em pé, nada fica inclinado
            M=np.array([[L[0],L[1],1],[Bv[0],Bv[1],1],[Rv[0],Rv[1],1]],float);dd,ee,ff=np.linalg.solve(M,np.array([L2[1],B2[1],R2[1]]))
            if abs(dd)>.12 or not(.8<ee<1.25):
                cortes.append((t,c0,c1,None,g,None));rel.append((st,t,'mantido(forte)',round(desvio,1),round(sL,2),round(sR,2),round(off,2)));continue
            F=np.array([[1,0,0],[dd,ee,ff]],float)
            # caixa do resultado
            cs=np.array([[0,0,1],[w,0,1],[0,h,1],[w,h,1]],float)@F.T
            mnx,mny=cs[:,0].min(),cs[:,1].min();mxx,mxy=cs[:,0].max(),cs[:,1].max()
            half=max(B2[0]-mnx,mxx-B2[0])+2;W2=int(np.ceil(half*2));H2=int(np.ceil(mxy-min(0,mny)))+2
            dx=half-B2[0];dy=-min(0,mny)
            T=F.copy();T[0,2]+=dx;T[1,2]+=dy
            Ti=np.linalg.inv(np.vstack([T,[0,0,1]]))[:2]
            def warp(c):
                im=Image.fromarray(c,'RGBA');pre=np.array(im).astype(np.float32);pre[...,:3]*=pre[...,3:4]/255.
                imp=Image.fromarray(pre.astype(np.uint8),'RGBA').transform((W2,H2),Image.AFFINE,tuple(Ti.flatten()),resample=Image.BICUBIC)
                a=np.array(imp).astype(np.float32);al=a[...,3:4];a[...,:3]=np.where(al>0,a[...,:3]*255./np.maximum(al,1),0);return np.clip(a,0,255).astype(np.uint8)
            n0,n1=warp(c0),warp(c1);g2=dict(g);g2['yb']=B2[1]+dy
            cortes.append((t,n0,n1,True,g2,max(g['xb']-g['x0'],g['x1']-g['xb'])*2));mudou=True
            rel.append((st,t,'ENDIREITADO',round(desvio,1),round(sL,2),round(sR,2),round(off,2)))
            if ver:
                for nome,img,gg,DD in (('antes',c0,g,None),('depois',n0,g2,Dw)):
                    im=Image.fromarray(img,'RGBA');bg=Image.new('RGBA',im.size,(40,60,30,255));bg.alpha_composite(im)
                    from PIL import ImageDraw;dr=ImageDraw.Draw(bg);DDw=DD or (gg['x1']-gg['x0']);xb=(gg['x0']+gg['x1'])/2 if DD else gg['xb'];yb=gg['yb']
                    if DD:xb=n0.shape[1]/2;DDw=DD
                    dr.polygon([(xb-DDw/2,yb-DDw/4),(xb,yb),(xb+DDw/2,yb-DDw/4),(xb,yb-DDw/2)],outline=(255,255,0,255))
                    bg.save(f'{ver}/{st}_{t}_{nome}.png')
        if not mudou:continue
        # monta o atlas de novo e recalcula as medidas
        hmax=max(c[1].shape[0] for c in cortes)+2;Wt=sum(c[1].shape[1]+2 for c in cortes)
        novo=[np.zeros((hmax,Wt,4),np.uint8),np.zeros((hmax,Wt,4),np.uint8)];x=0
        for t,c0,c1,mud,g,Dw in cortes:
            h,w=c0.shape[:2];novo[0][:h,x:x+w]=c0;novo[1][:h,x:x+w]=c1;m=B[t]
            if mud:
                dw=m['dw'];k=dw/Dw;top=(g['yb']+1)*k-dw/2
                m.update(W=round(w*k,2),H=round(h*k,2),xc=round(w*k/2,2),top=round(top,2),cy=round(top+dw/4,2),bt=round(max(.5,h*k-(top+dw/2)),2))
            m['r']=[x,0,w,h];x+=w+2
        for v in (0,1):Image.fromarray(novo[v],'RGBA').save(f'{GPT}/b_{st}_{at}_{v}.webp',lossless=False,quality=92,method=6)
open(DATA,'w').write(src[:i0]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+src[i1:])
for r in rel:print(*r)
