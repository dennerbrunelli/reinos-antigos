// =========================================================
//   PELE "BRONZE E ÉBANO" — a cara da interface (só aparência; nenhuma regra do jogo muda)
//   Sai o azul brilhante de botão de plástico; entram painéis escuros de ébano com filete de ouro velho,
//   texto cor de pergaminho e números alinhados. Carregada por último para valer sobre as peles antigas.
// =========================================================
{const css=document.createElement('style');css.id='pele';css.textContent=`
:root{--eb:#15100a;--eb2:#241a10;--br:#7d6233;--ou:#d8b468;--pg:#efe3c4;--sg:#b3392c;--ol:#8fb36a}
/* barra de cima: uma faixa só, sem pílulas */
#top{background:linear-gradient(#1f170d,#120d07);border-bottom:1px solid #d8b46899;box-shadow:0 2px 10px #000b,inset 0 -1px 0 #0008}
#top .r,#top .r:nth-child(n),#top .r.rk,#top .r.ro,#top .r.rpop{background:none!important;border:none;box-shadow:none;border-radius:0;height:24px;padding:0 9px 0 2px;border-right:1px solid #d8b46824}
#top .r:last-of-type{border-right:none}
#top .r img{width:19px;height:19px;filter:drop-shadow(0 1px 1px #000)}
#top .rv b{color:var(--pg);font-size:14px;font-variant-numeric:tabular-nums;letter-spacing:.2px;text-shadow:0 1px 1px #000}
#top .rv small{color:var(--ol);text-shadow:none}
#top .rpop small{color:#b9a981}
#wx{background:none;border:none;color:#cdbf9d;padding:0 4px;text-shadow:0 1px 1px #000}
#era,#age{color:var(--ou)}#clock{color:var(--pg);font-variant-numeric:tabular-nums}
#won{color:#f0c96a}
.tb,#top .tb{background:linear-gradient(#2c2216,#18120b);border:1px solid var(--br);color:var(--ou);box-shadow:inset 0 1px 0 #d8b46826;border-radius:4px}
/* painéis */
.pn,.clean .pn{background:rgba(18,13,8,.88);border:1px solid var(--br);border-radius:5px;box-shadow:0 4px 14px #000a,inset 0 0 0 1px #d8b46812}
.ph{background:linear-gradient(#2c2216,#1b140c);border-bottom:1px solid var(--br);color:var(--pg)}
.pn.tab:not(.min)>.ph{border-color:var(--br)}
.pbn{background:#120d07;border-color:#7d623399;color:var(--pg)}
.free #pSel,.free #pCmd,.free #pMap{background:rgba(18,13,8,.84);border-color:#7d6233}
.free #pObj,.free #pAl{background:rgba(18,13,8,.7);border-color:#7d623399}
#dock{background:linear-gradient(#1f170d,#120d07);border-top:1px solid #d8b46899}
/* botões de comando */
.cb{border:1px solid var(--br);border-radius:4px;background:linear-gradient(#30251a,#17110a);box-shadow:inset 0 1px 0 #d8b46822,0 1px 3px #000a}
.cb.pick{outline:2px solid var(--ou);outline-offset:-1px;filter:brightness(1.2)}
#quick .cb{border-radius:6px;background:linear-gradient(#30251a,#17110a)}
.mzb .cb{color:var(--ou)}
/* seleção */
#info{background:none;border:none;padding-left:2px}
#info .por{background:radial-gradient(#3b2e1c,#17110a);border:1px solid var(--ou);border-radius:4px}
#info .t{color:var(--ou)}#info .st{color:var(--pg)}
#info .hp{border-color:#000;background:#2a0f0a}#info .hp div{background:linear-gradient(#a6cf7e,#5d8a3a)}
#info .grp span{background:#0c0906;border-color:var(--br)}
#info .x{background:#120d07;border-color:#7d623399;color:var(--pg)}
#mmw{background:#0b0805;border:1px solid var(--br)}
#objl .ob{color:var(--pg)}#objl .ob i{border-color:var(--ou)}
#all .al{background:linear-gradient(90deg,#8f2a20,#4a120c);border-color:#d98a78}
/* aviso: faixa fina que não tapa a cidade */
#toast{top:36px;background:rgba(18,13,8,.92);color:var(--pg);border:1px solid #7d6233;border-left:3px solid var(--ou);border-radius:3px;padding:4px 12px;font-size:12.5px;font-weight:600;max-width:58%;box-shadow:0 3px 10px #000a}
/* telas de menu, pausa e ajustes */
.screen .mb{background:linear-gradient(#30251a,#17110a);border:1px solid var(--br);border-radius:5px;color:var(--pg);box-shadow:0 2px 6px #0008,inset 0 1px 0 #d8b46822}
.screen .mb.on{background:linear-gradient(#e2c27a,#b38a3c);border-color:#f3e0a8;color:#221606;text-shadow:none}
.screen .mb.f{outline:2px solid var(--ou);outline-offset:1px}
.screen .mb.go{background:linear-gradient(#6f8f45,#3f5a25);border-color:#c5dba0;color:#fff}
#card{background:linear-gradient(#f1e4c2,#dcc79a);border:1px solid #8a6a2c}
.sheet,.setp{background:linear-gradient(rgba(34,25,15,.95),rgba(15,11,6,.97));border:1px solid #d8b468aa;border-radius:8px;box-shadow:0 12px 34px #000d,inset 0 0 0 1px #d8b46814;color:var(--pg)}
.shh{border-bottom:1px solid #d8b46855}.shh b{color:var(--ou);letter-spacing:.3px}
#uiset,#pause{background:rgba(8,6,3,.7)}
#qb .qh{color:var(--ou);border-bottom-color:#d8b46866}
#qb .qp{background:rgba(10,7,4,.6);border-color:#7d623388;border-radius:5px}
#qb .qr{border-bottom-color:#d8b46826}
#mmw{background:radial-gradient(#231a10,#0b0805)}
#cw{background:radial-gradient(ellipse at 40% 40%,#2a2013,#0c0906 75%)}
#cw .cwm{background:linear-gradient(#274a63,#18303f);border:1px solid #d8b468aa;border-radius:6px}
#cw .cwc{background:rgba(18,13,8,.75);border-color:#7d623388;border-radius:5px}
#dipp{background:linear-gradient(rgba(34,25,15,.97),rgba(15,11,6,.98))!important;color:var(--pg)!important;border:1px solid #d8b468aa!important;border-radius:6px!important}
#dipp small{opacity:.85}
`;document.head.appendChild(css)}
