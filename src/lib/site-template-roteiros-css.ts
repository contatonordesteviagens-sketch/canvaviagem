// Modelo "Roteiros" (principal): vitrine de pacotes logo depois do topo, cartões com
// saída, datas, preço "a partir de" e dois botões; barra fixa de WhatsApp no celular.
// Referências: site Aventuras 360° (Lucas), vitrine da Clube Turismo, topo da Teresa Perez.
// Regras: texto nunca solto sobre foto (véu), preço em cor de alto contraste,
// cor da marca só em detalhes e botões, toque ≥ 44px, texto ≥ 16px no celular.
export const ROTEIROS_CSS = `
body.template-roteiros{--r-dark:#121614;--r-paper:color-mix(in srgb,var(--brand-bg) 55%,#f6f3ec 45%);--r-line:rgba(18,22,20,.1);background:var(--brand-bg);font-size:16px}
body.template-roteiros h1,
body.template-roteiros h2,
body.template-roteiros h3,
body.template-roteiros h4{font-family:'Sora',sans-serif;letter-spacing:-.03em}
body.template-roteiros .eyebrow,
body.template-roteiros .section-eyebrow{display:inline-flex;align-items:center;gap:10px;color:var(--ink);font-size:12px;letter-spacing:.16em}
body.template-roteiros .eyebrow::before,
body.template-roteiros .section-eyebrow::before{content:"";width:22px;height:2px;border-radius:2px;background:var(--brand)}
body.template-roteiros .btn{border-radius:999px;min-height:48px;padding:13px 26px;font-size:16px;font-weight:700;justify-content:center}

/* Cabeçalho */
body.template-roteiros .site-header{background:rgba(255,255,255,.96)}
body.template-roteiros .nav-cta{border-radius:999px;min-height:44px;display:inline-flex;align-items:center}

/* Topo: foto inteira com véu; texto alinhado à esquerda, na parte de baixo */
body.template-roteiros .hero{min-height:min(86vh,720px);display:flex;align-items:flex-end;padding:120px 0 56px;background:var(--r-dark)}
body.template-roteiros .hero::before{opacity:1;mix-blend-mode:normal;filter:saturate(1.05)}
body.template-roteiros .hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.35) 45%,rgba(0,0,0,.82) 100%),linear-gradient(90deg,rgba(0,0,0,.45),transparent 70%)}
body.template-roteiros .hero .container{position:relative;z-index:1;width:100%}
body.template-roteiros .hero-content{max-width:680px;padding:0;background:transparent;border:0;backdrop-filter:none;box-shadow:none}
body.template-roteiros .hero .eyebrow{color:#fff;opacity:1}
body.template-roteiros .hero h1{color:#fff}
body.template-roteiros .hero h1{font-size:clamp(34px,5.4vw,64px);line-height:1.05;font-weight:800;margin:14px 0 16px}
body.template-roteiros .hero p.lead{font-size:18px;opacity:.92;max-width:560px;margin-bottom:28px}
body.template-roteiros .hero-actions .btn{flex:0 1 auto;min-width:200px}
body.template-roteiros .hero .btn-outline{border-color:rgba(255,255,255,.7);color:#fff}
body.template-roteiros .stats-bar{margin-top:36px;padding:18px 20px;border-radius:18px;background:rgba(0,0,0,.45);backdrop-filter:blur(8px);box-shadow:none;justify-content:flex-start;gap:12px 36px}
body.template-roteiros .stats-bar > div{flex:0 1 auto;text-align:left}
body.template-roteiros .stat-num{font-family:'Sora',sans-serif;font-size:28px}

/* Seções */
body.template-roteiros section{padding:72px 0}
body.template-roteiros .section-eyebrow{display:flex;justify-content:center}
body.template-roteiros .section-title{font-size:clamp(28px,3.6vw,44px);font-weight:700;margin-bottom:28px}

/* Vitrine de pacotes */
body.template-roteiros #destinos{background:var(--r-paper)}
body.template-roteiros .pkg-filter{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;margin:-8px 0 26px;justify-content:center;scrollbar-width:none}
body.template-roteiros .pkg-filter::-webkit-scrollbar{display:none}
body.template-roteiros .pkg-filter button{flex:0 0 auto;min-height:44px;padding:0 18px;border-radius:999px;border:1.5px solid var(--r-line);background:#fff;color:var(--ink);font:600 15px/1 'Inter',sans-serif;cursor:pointer}
body.template-roteiros .pkg-filter button[aria-pressed="true"]{background:var(--r-dark);border-color:var(--r-dark);color:#fff}
body.template-roteiros .destinos-grid{gap:24px}
body.template-roteiros .dest-card{border:0;border-radius:20px;box-shadow:0 10px 30px rgba(18,22,20,.08);background:#fff}
body.template-roteiros .dest-card:hover{transform:translateY(-4px)}
body.template-roteiros .dest-card[hidden]{display:none}
body.template-roteiros .dest-img-wrap{aspect-ratio:16/10}
body.template-roteiros .dest-tag{top:14px;left:14px;border-radius:999px;background:rgba(18,22,20,.78);color:#fff;font-size:12px;letter-spacing:.06em;padding:7px 12px;backdrop-filter:blur(6px)}
body.template-roteiros .dest-overlay{display:none}
body.template-roteiros .dest-body{padding:20px 20px 18px;gap:0}
body.template-roteiros .dest-kicker{display:flex;align-items:center;gap:8px;font:700 12px/1.3 'Inter',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
body.template-roteiros .dest-kicker::before{content:"";width:16px;height:2px;border-radius:2px;background:var(--brand);flex:0 0 auto}
body.template-roteiros .dest-body h3{font-size:21px;line-height:1.25;margin-bottom:8px}
body.template-roteiros .dest-body p{font-size:15px;line-height:1.55;margin-bottom:12px;flex:0 0 auto;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
body.template-roteiros .dest-meta{display:flex;align-items:center;gap:8px;font-size:15px;color:var(--ink);padding:10px 0;border-top:1px solid var(--r-line);margin-top:auto}
body.template-roteiros .dest-meta svg{flex:0 0 auto;color:var(--muted)}
body.template-roteiros .dest-price{margin:auto 0 16px}
body.template-roteiros .dest-meta + .dest-price{margin-top:6px}
body.template-roteiros .dest-price .price-value,
body.template-roteiros .dest-price .price-main{color:var(--ink)}
body.template-roteiros .dest-price .price-value{font-size:30px}
body.template-roteiros .dest-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
body.template-roteiros .dest-actions .dest-cta{border:1.5px solid var(--r-line);border-radius:999px;padding:0 12px;margin:0;min-height:46px;justify-content:center;color:var(--ink);font-size:15px}
body.template-roteiros .dest-reserve{display:inline-flex;align-items:center;justify-content:center;min-height:46px;border-radius:999px;background:var(--brand);color:var(--brand-contrast);font-weight:700;font-size:15px;text-decoration:none}
body.template-roteiros .dest-actions .dest-cta:only-child{grid-column:1/-1}

/* Como reservar: passos em lista */
body.template-roteiros .proc-grid{gap:16px}
body.template-roteiros .proc-card{border:1px solid var(--r-line);border-radius:18px;padding:24px 22px;box-shadow:none}
body.template-roteiros .proc-card:hover{transform:none;box-shadow:none;border-color:var(--r-line)}
body.template-roteiros .proc-num{width:40px;height:40px;font-family:'Sora',sans-serif;font-size:17px;background:var(--r-dark);color:#fff;margin-bottom:14px}
body.template-roteiros .proc-card h3{font-size:19px}
body.template-roteiros .proc-card p{font-size:16px}

/* Diferenciais em fundo escuro neutro (contraste garantido com qualquer cor da marca) */
body.template-roteiros .equipe{background:var(--r-dark)}
body.template-roteiros .equipe .eyebrow{color:#fff}
body.template-roteiros .equipe-img{border-radius:20px}
body.template-roteiros .feat-icon{border-radius:12px}

/* Orçamento */
body.template-roteiros #orcamento{background:var(--r-paper)}
body.template-roteiros .orc-form{border:0;border-radius:20px;box-shadow:0 10px 30px rgba(18,22,20,.08)}
body.template-roteiros .orc-form .form-submit{border-radius:999px}
body.template-roteiros .field input,
body.template-roteiros .field select,
body.template-roteiros .field textarea{border-radius:12px;min-height:48px}

/* FAQ, fechamento e rodapé: cores sólidas, sem degradê da marca */
body.template-roteiros .faq-item{border-radius:16px}
body.template-roteiros .final-cta{background:var(--r-dark)}
body.template-roteiros .final-cta .btn{background:var(--brand);color:var(--brand-contrast)}
body.template-roteiros footer{background:var(--r-dark);color:rgba(255,255,255,.72)}

/* Barra fixa de WhatsApp no celular */
body.template-roteiros .wa-bar{display:none}
@media (max-width:980px){
  body.template-roteiros .destinos-grid{grid-template-columns:repeat(2,1fr)}
  body.template-roteiros .proc-grid{grid-template-columns:1fr}
}
@media (max-width:640px){
  body.template-roteiros{padding-bottom:76px}
  body.template-roteiros .hero{min-height:calc(100svh - 64px);padding:96px 0 32px}
  body.template-roteiros .hero h1{font-size:clamp(32px,9vw,40px)}
  body.template-roteiros .hero p.lead{font-size:16px;margin-bottom:22px}
  body.template-roteiros .hero-actions .btn{width:100%;min-width:0}
  body.template-roteiros .stats-bar{margin-top:24px;gap:12px 24px}
  body.template-roteiros section{padding:56px 0}
  body.template-roteiros .pkg-filter{justify-content:flex-start;margin-left:-20px;margin-right:-20px;padding-left:20px;padding-right:20px}
  body.template-roteiros .destinos-grid{grid-template-columns:1fr}
  body.template-roteiros .wpp-float{display:none!important}
  body.template-roteiros .wa-bar{display:flex;position:fixed;left:12px;right:12px;bottom:12px;z-index:60;min-height:52px;align-items:center;justify-content:center;gap:10px;border-radius:999px;background:#1f9d55;color:#fff;font:700 16px/1 'Inter',sans-serif;text-decoration:none;box-shadow:0 10px 26px rgba(0,0,0,.25)}
}
`;
