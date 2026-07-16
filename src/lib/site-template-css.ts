import { normalizeSiteTemplateId, type SiteTemplateId } from "@/lib/site-template-catalog";

const HORIZONTE_ES_CSS = `
/* HORIZONTE (paridade ES): consultoria visual com imagem ampla e ritmo calmo. */
body.template-horizonte{--t-paper:var(--brand-bg);--t-deep:var(--brand-dark);background:var(--t-paper)}
body.template-horizonte h1,
body.template-horizonte h2,
body.template-horizonte h3,
body.template-horizonte h4{font-family:'Sora',sans-serif;letter-spacing:-.045em}
body.template-horizonte .container{max-width:1280px;padding-left:clamp(20px,5vw,72px);padding-right:clamp(20px,5vw,72px)}
body.template-horizonte .site-header{position:absolute;inset:0 0 auto;background:transparent;border:0;backdrop-filter:none}
body.template-horizonte .nav-wrap{padding-top:22px;padding-bottom:22px;border-bottom:1px solid rgba(255,255,255,.3)}
body.template-horizonte .brand,
body.template-horizonte .nav-links a{color:#fff}
body.template-horizonte .nav-cta,
body.template-horizonte .btn{border-radius:999px}
body.template-horizonte .hero{min-height:780px;padding:126px 0 0;background:var(--t-deep)}
body.template-horizonte .hero::before{opacity:.8;filter:saturate(.88)}
body.template-horizonte .hero::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.12))}
body.template-horizonte .hero .container{position:relative;z-index:1}
body.template-horizonte .hero-grid{min-height:490px;align-items:end}
body.template-horizonte .hero-content{max-width:730px;padding:42px 0 58px;border:0;background:transparent;box-shadow:none;backdrop-filter:none}
body.template-horizonte .hero h1{font-size:clamp(46px,7vw,88px);line-height:.96}
body.template-horizonte .stats-bar{margin:0;border:0;border-radius:24px 24px 0 0;background:var(--t-paper);color:var(--background-contrast);box-shadow:none}
body.template-horizonte .stat-num{font-family:'Sora',sans-serif;color:var(--background-contrast)}
body.template-horizonte .stat-label{color:var(--background-contrast);opacity:1}
body.template-horizonte section{padding:clamp(76px,9vw,126px) 0}
body.template-horizonte .section-title{font-size:clamp(34px,5vw,62px)}
body.template-horizonte #destinos{background:color-mix(in srgb,var(--brand-bg) 55%,#fff 45%)}
body.template-horizonte #destinos .section-eyebrow,
body.template-horizonte #destinos .section-title{text-align:left;margin-left:0;padding-left:0}
body.template-horizonte .destinos-grid{grid-template-columns:1.18fr .82fr;grid-auto-rows:minmax(290px,auto);gap:22px}
body.template-horizonte .dest-card{position:relative;min-height:290px;border:0;border-radius:24px;background:var(--t-deep);color:#fff}
body.template-horizonte .dest-card:first-child{grid-row:span 2}
body.template-horizonte .dest-img-wrap{position:absolute;inset:0;height:100%;aspect-ratio:auto}
body.template-horizonte .dest-img-wrap::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 20%,rgba(0,0,0,.84))}
body.template-horizonte .dest-body{position:relative;z-index:1;min-height:inherit;justify-content:flex-end;padding:88px 28px 28px}
body.template-horizonte .dest-body h3,
body.template-horizonte .price-value,
body.template-horizonte .price-main{color:#fff}
body.template-horizonte .dest-body p,
body.template-horizonte .dest-loc{color:rgba(255,255,255,.74)}
body.template-horizonte .equipe{background:var(--t-deep);color:#fff}
body.template-horizonte .equipe-img{border-radius:160px 160px 24px 24px}
body.template-horizonte footer{background:var(--t-deep)}
@media(max-width:840px){
  body.template-horizonte .nav-toggle span{background:#fff}
  body.template-horizonte .nav-links{background:var(--t-paper)}
  body.template-horizonte .nav-links a{color:var(--brand-ink)}
  body.template-horizonte .destinos-grid{grid-template-columns:1fr}
  body.template-horizonte .dest-card:first-child{grid-row:auto}
}
@media(max-width:560px){
  body.template-horizonte .hero{min-height:660px;padding-top:96px}
  body.template-horizonte .hero h1{font-size:clamp(40px,13vw,58px)}
}
`;

const OFFERS_CSS = `
/* OFERTAS: vitrine comercial para preço, condição e comparação rápida. */
body.template-ofertas{
  --t-surface:color-mix(in srgb,var(--brand-bg) 72%,#fff 28%);
  --t-line:color-mix(in srgb,var(--brand) 22%,transparent);
  background:var(--t-surface);
  font-family:'Sora',sans-serif;
}
body.template-ofertas h1,
body.template-ofertas h2,
body.template-ofertas h3,
body.template-ofertas h4{font-family:'Sora',sans-serif;letter-spacing:-.045em}
body.template-ofertas .container{max-width:1320px}
body.template-ofertas .site-header{border-top:5px solid var(--brand);background:color-mix(in srgb,#fff 94%,var(--brand-bg) 6%)}
body.template-ofertas .nav-wrap{padding-top:11px;padding-bottom:11px}
body.template-ofertas .nav-cta,
body.template-ofertas .btn{border-radius:6px;font-family:'Sora',sans-serif;font-weight:700}
body.template-ofertas .hero{min-height:610px;padding:92px 0 80px;background:var(--brand-dark)}
body.template-ofertas .hero::before{opacity:.5;filter:saturate(.8) contrast(1.08)}
body.template-ofertas .hero::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--brand-dark) 0%,color-mix(in srgb,var(--brand-dark) 82%,transparent) 52%,transparent 100%)}
body.template-ofertas .hero .container{position:relative;z-index:1}
body.template-ofertas .hero-content{max-width:650px;padding:clamp(24px,4vw,46px);border:1px solid rgba(255,255,255,.2);border-left:8px solid var(--brand-secondary);border-radius:8px;background:color-mix(in srgb,var(--brand-dark) 76%,transparent);box-shadow:none;backdrop-filter:blur(5px)}
body.template-ofertas .hero h1{font-size:clamp(40px,6vw,72px);line-height:.98}
body.template-ofertas .hero p.lead{max-width:54ch}
body.template-ofertas .stats-bar{position:relative;z-index:2;margin-top:-44px;border:1px solid var(--t-line);border-radius:8px;background:#fff;box-shadow:0 18px 45px rgba(0,0,0,.09)}
body.template-ofertas .stat-num{font-family:'Sora',sans-serif;color:#111827}
body.template-ofertas .stat-label{color:#111827;opacity:1}
body.template-ofertas section{padding:clamp(62px,7vw,96px) 0}
body.template-ofertas .section-eyebrow,
body.template-ofertas .section-title{text-align:left;margin-left:0;margin-right:0;padding-left:0}
body.template-ofertas .section-title{font-size:clamp(32px,4vw,50px)}
body.template-ofertas .processo{background:#fff}
body.template-ofertas .proc-grid{gap:0;border-top:1px solid var(--t-line);border-bottom:1px solid var(--t-line)}
body.template-ofertas .proc-card{border:0;border-right:1px solid var(--t-line);border-radius:0;background:transparent;box-shadow:none}
body.template-ofertas .proc-card:last-child{border-right:0}
body.template-ofertas .proc-card:hover{transform:none;box-shadow:none;background:var(--t-surface)}
body.template-ofertas .proc-num{border-radius:6px;background:var(--brand);color:var(--brand-contrast)}
body.template-ofertas #destinos{background:var(--t-surface)}
body.template-ofertas .destinos-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
body.template-ofertas .destinos-grid[data-package-count="1"]{grid-template-columns:1fr}
body.template-ofertas .dest-card{display:grid;grid-template-columns:minmax(150px,.78fr) minmax(0,1.22fr);min-height:300px;border:1px solid var(--t-line);border-radius:10px;background:#fff;box-shadow:none}
body.template-ofertas .dest-card:hover{transform:translateY(-3px);border-color:var(--brand);box-shadow:0 18px 36px rgba(0,0,0,.09)}
body.template-ofertas .dest-img-wrap{height:100%;aspect-ratio:auto;border-radius:0}
body.template-ofertas .dest-tag{border-radius:4px;background:var(--brand-secondary);color:var(--secondary-contrast)}
body.template-ofertas .dest-body{padding:24px}
body.template-ofertas .dest-body h3{font-size:clamp(22px,2.4vw,31px)}
body.template-ofertas .price-value,
body.template-ofertas .price-main{font-family:'Sora',sans-serif;color:var(--brand-dark)}
body.template-ofertas .dest-cta{border-top:1px solid var(--t-line);font-weight:800;color:var(--brand-dark)}
body.template-ofertas .equipe{background:#fff}
body.template-ofertas .equipe-img{border-radius:10px}
body.template-ofertas .depo-card,
body.template-ofertas .orc-form,
body.template-ofertas .faq-item{border-radius:10px}
body.template-ofertas .final-cta{border-radius:0}
body.template-ofertas footer{background:var(--brand-dark)}
@media(max-width:980px){
  body.template-ofertas .destinos-grid{grid-template-columns:1fr}
}
@media(max-width:640px){
  body.template-ofertas .site-header{border-top-width:4px}
  body.template-ofertas .hero{min-height:600px;padding-top:80px}
  body.template-ofertas .hero-content{border-left-width:5px}
  body.template-ofertas .stats-bar{margin-top:-24px}
  body.template-ofertas .proc-card{border-right:0;border-bottom:1px solid var(--t-line)}
  body.template-ofertas .dest-card{grid-template-columns:1fr}
  body.template-ofertas .dest-img-wrap{height:auto;aspect-ratio:16/10}
}
`;

const EXPERIENCES_CSS = `
/* EXPERIÊNCIAS: descoberta visual para receptivo, passeios e vivências locais. */
body.template-experiencias{
  --t-wash:color-mix(in srgb,var(--brand-bg) 78%,#fff 22%);
  --t-deep:color-mix(in srgb,var(--brand-dark) 88%,#000 12%);
  background:var(--t-wash);
}
body.template-experiencias .container{max-width:1280px;padding-left:clamp(20px,4vw,56px);padding-right:clamp(20px,4vw,56px)}
body.template-experiencias .site-header{position:absolute;inset:0 0 auto;background:transparent;border:0;backdrop-filter:none}
body.template-experiencias .nav-wrap{padding-top:22px;padding-bottom:22px;border-bottom:1px solid rgba(255,255,255,.32)}
body.template-experiencias .brand,
body.template-experiencias .nav-links a{color:#fff}
body.template-experiencias .nav-cta{border-radius:999px;background:var(--brand-secondary);color:var(--secondary-contrast)!important}
body.template-experiencias .hero{min-height:820px;padding:128px 0 42px;border-radius:0 0 48px 48px;background:var(--t-deep);overflow:hidden}
body.template-experiencias .hero::before{opacity:.88;filter:saturate(1.12)}
body.template-experiencias .hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08) 10%,rgba(0,0,0,.72) 100%)}
body.template-experiencias .hero .container{position:relative;z-index:1}
body.template-experiencias .hero-grid{min-height:650px;align-items:end}
body.template-experiencias .hero-content{max-width:790px;padding:0 0 40px;border:0;background:transparent;box-shadow:none;backdrop-filter:none}
body.template-experiencias .hero h1{font-family:'Sora',sans-serif;font-size:clamp(46px,7.6vw,96px);font-weight:800;line-height:.92;letter-spacing:-.055em}
body.template-experiencias .hero p.lead{max-width:650px;font-size:clamp(17px,2vw,22px)}
body.template-experiencias .hero .btn{border-radius:999px}
body.template-experiencias .stats-bar{margin-top:-18px;border:0;border-radius:26px;background:var(--brand-bg);color:var(--background-contrast);box-shadow:0 24px 55px rgba(0,0,0,.12)}
body.template-experiencias .stat-num{font-family:'Sora',sans-serif;color:var(--background-contrast)}
body.template-experiencias .stat-label{color:var(--background-contrast);opacity:1}
body.template-experiencias section{padding:clamp(74px,9vw,124px) 0}
body.template-experiencias .section-title{font-family:'Sora',sans-serif;font-size:clamp(34px,5vw,64px);letter-spacing:-.05em}
body.template-experiencias .processo{background:var(--t-wash)}
body.template-experiencias .proc-card{border:0;border-radius:26px;background:#fff;box-shadow:none}
body.template-experiencias .proc-num{border-radius:50%;background:var(--brand-secondary);color:var(--secondary-contrast)}
body.template-experiencias #destinos{background:#fff}
body.template-experiencias #destinos .section-eyebrow,
body.template-experiencias #destinos .section-title{text-align:left;margin-left:0;padding-left:0;max-width:820px}
body.template-experiencias .destinos-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-auto-rows:minmax(390px,auto);gap:18px}
body.template-experiencias .dest-card{position:relative;grid-column:span 4;display:block;min-width:0;min-height:390px;border:0;border-radius:28px;background:var(--t-deep);color:#fff;overflow:hidden}
body.template-experiencias .dest-card:first-child{grid-column:span 8}
body.template-experiencias .destinos-grid[data-package-count="1"] .dest-card:first-child{grid-column:1/-1}
body.template-experiencias .destinos-grid[data-package-count="2"] .dest-card{grid-column:span 6}
body.template-experiencias .dest-img-wrap{position:absolute;inset:0;height:100%;aspect-ratio:auto}
body.template-experiencias .dest-img-wrap::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 22%,rgba(0,0,0,.84) 100%)}
body.template-experiencias .dest-tag{position:absolute!important;z-index:3;top:18px;left:18px;border-radius:999px;background:var(--brand-secondary);color:var(--secondary-contrast)}
body.template-experiencias .dest-overlay{display:none}
body.template-experiencias .dest-body{position:relative;z-index:2;display:flex;min-height:390px;justify-content:flex-end;padding:88px 24px 24px}
body.template-experiencias .dest-body h3,
body.template-experiencias .price-value,
body.template-experiencias .price-main{color:#fff}
body.template-experiencias .dest-body h3{font-family:'Sora',sans-serif;font-size:clamp(25px,3vw,40px);line-height:1}
body.template-experiencias .dest-loc,
body.template-experiencias .dest-body p,
body.template-experiencias .price-row-top,
body.template-experiencias .price-row-bottom{color:rgba(255,255,255,.76)}
body.template-experiencias .dest-cta{width:max-content;color:#fff;border-color:rgba(255,255,255,.34)}
body.template-experiencias .equipe{background:var(--brand-dark);color:#fff}
body.template-experiencias .equipe-img{border-radius:50% 50% 24px 24px}
body.template-experiencias .depo-bg{background:var(--t-wash)}
body.template-experiencias .depo-card{border:0;border-radius:26px;background:#fff}
body.template-experiencias .orc-form,
body.template-experiencias .faq-item{border-radius:24px}
body.template-experiencias footer{background:var(--t-deep)}
@media(max-width:900px){
  body.template-experiencias .nav-toggle span{background:#fff}
  body.template-experiencias .nav-links{background:var(--brand-bg)}
  body.template-experiencias .nav-links a{color:var(--brand-ink)}
  body.template-experiencias .dest-card,
  body.template-experiencias .dest-card:first-child{grid-column:span 6}
}
@media(max-width:640px){
  body.template-experiencias .hero{min-height:690px;border-radius:0 0 28px 28px;padding-top:102px}
  body.template-experiencias .hero-grid{min-height:540px}
  body.template-experiencias .hero h1{font-size:clamp(42px,13vw,62px)}
  body.template-experiencias .stats-bar{border-radius:20px}
  body.template-experiencias .destinos-grid{display:grid;grid-template-columns:1fr;grid-auto-rows:auto}
  body.template-experiencias .dest-card,
  body.template-experiencias .dest-card:first-child{grid-column:1;min-height:410px}
}
`;

const EXPEDITIONS_CSS = `
/* EXPEDIÇÕES: percurso, natureza e leitura de jornada com estrutura mais firme. */
body.template-expedicoes{
  --t-night:color-mix(in srgb,var(--brand-dark) 86%,#050505 14%);
  --t-mist:color-mix(in srgb,var(--brand-bg) 68%,#fff 32%);
  background:var(--t-mist);
  font-family:'Sora',sans-serif;
}
body.template-expedicoes h1,
body.template-expedicoes h2,
body.template-expedicoes h3,
body.template-expedicoes h4{font-family:'Sora',sans-serif;letter-spacing:-.05em}
body.template-expedicoes .container{max-width:1260px}
body.template-expedicoes .site-header{background:var(--t-night);border:0;color:#fff}
body.template-expedicoes .brand,
body.template-expedicoes .nav-links a{color:#fff}
body.template-expedicoes .nav-cta{border-radius:2px;background:var(--brand-secondary);color:var(--secondary-contrast)!important}
body.template-expedicoes .hero{min-height:720px;padding:110px 0 90px;background:var(--t-night)}
body.template-expedicoes .hero::before{opacity:.62;filter:saturate(.8) contrast(1.18)}
body.template-expedicoes .hero::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--t-night) 0%,color-mix(in srgb,var(--t-night) 72%,transparent) 54%,transparent 100%)}
body.template-expedicoes .hero .container{position:relative;z-index:1}
body.template-expedicoes .hero-content{max-width:700px;padding:32px 0 32px 30px;border:0;border-left:10px solid var(--brand-secondary);border-radius:0;background:transparent;box-shadow:none;backdrop-filter:none}
body.template-expedicoes .hero h1{font-size:clamp(46px,7vw,86px);font-weight:800;line-height:.94}
body.template-expedicoes .hero .btn{border-radius:2px}
body.template-expedicoes .hero .btn-outline{border-radius:0;border-width:0 0 2px;padding-left:2px;padding-right:2px}
body.template-expedicoes .stats-bar{margin-top:-28px;border:0;border-radius:0;background:var(--brand-secondary);color:var(--secondary-contrast);box-shadow:none}
body.template-expedicoes .stat-num,
body.template-expedicoes .stat-label{color:var(--secondary-contrast);opacity:1}
body.template-expedicoes section{padding:clamp(72px,8vw,112px) 0}
body.template-expedicoes .section-eyebrow,
body.template-expedicoes .section-title{text-align:left;margin-left:0;padding-left:0}
body.template-expedicoes .section-title{font-size:clamp(36px,5.6vw,68px)}
body.template-expedicoes .processo{background:var(--t-mist)}
body.template-expedicoes .proc-grid{display:block;border-top:2px solid var(--brand-dark)}
body.template-expedicoes .proc-card{display:grid;grid-template-columns:70px minmax(180px,.7fr) 1.3fr;gap:20px;align-items:start;padding:24px 0;border:0;border-bottom:1px solid color-mix(in srgb,var(--brand-dark) 18%,transparent);border-radius:0;background:transparent;box-shadow:none}
body.template-expedicoes .proc-card:hover{transform:none;box-shadow:none;border-color:var(--brand)}
body.template-expedicoes .proc-num{width:auto;height:auto;margin:0;border-radius:0;background:transparent;color:var(--brand);font-size:32px;justify-content:flex-start}
body.template-expedicoes .proc-card h3{margin-top:4px}
body.template-expedicoes #destinos{background:var(--t-night);color:#fff}
body.template-expedicoes #destinos .section-eyebrow,
body.template-expedicoes #destinos .section-title{color:#fff}
body.template-expedicoes .destinos-grid{display:flex;flex-direction:column;gap:22px}
body.template-expedicoes .dest-card{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(340px,.92fr);min-height:360px;border:1px solid rgba(255,255,255,.14);border-radius:0;background:color-mix(in srgb,var(--t-night) 88%,#fff 12%);color:#fff}
body.template-expedicoes .dest-card:nth-child(even) .dest-img-wrap{grid-column:2;grid-row:1}
body.template-expedicoes .dest-card:nth-child(even) .dest-body{grid-column:1;grid-row:1}
body.template-expedicoes .dest-img-wrap{height:100%;aspect-ratio:auto}
body.template-expedicoes .dest-tag{border-radius:0;background:var(--brand-secondary);color:var(--secondary-contrast)}
body.template-expedicoes .dest-body{padding:clamp(26px,4vw,48px);justify-content:center}
body.template-expedicoes .dest-body h3,
body.template-expedicoes .price-value,
body.template-expedicoes .price-main{color:#fff}
body.template-expedicoes .dest-loc,
body.template-expedicoes .dest-body p,
body.template-expedicoes .price-row-top,
body.template-expedicoes .price-row-bottom{color:rgba(255,255,255,.7)}
body.template-expedicoes .dest-cta{color:var(--brand-secondary);border-color:rgba(255,255,255,.2)}
body.template-expedicoes .equipe-img,
body.template-expedicoes .depo-card,
body.template-expedicoes .orc-form,
body.template-expedicoes .faq-item{border-radius:0}
body.template-expedicoes .final-cta{background:var(--brand-secondary);color:var(--secondary-contrast)}
body.template-expedicoes .final-cta h2{color:var(--secondary-contrast)}
body.template-expedicoes .final-cta .btn{background:var(--t-night);color:#fff}
body.template-expedicoes footer{background:var(--t-night)}
@media(max-width:840px){
  body.template-expedicoes .nav-toggle span{background:#fff}
  body.template-expedicoes .nav-links{background:var(--t-night)}
  body.template-expedicoes .proc-card{grid-template-columns:52px 1fr}
  body.template-expedicoes .proc-card p{grid-column:2}
  body.template-expedicoes .dest-card{grid-template-columns:1fr}
  body.template-expedicoes .dest-card:nth-child(even) .dest-img-wrap,
  body.template-expedicoes .dest-card:nth-child(even) .dest-body{grid-column:1;grid-row:auto}
  body.template-expedicoes .dest-img-wrap{height:auto;aspect-ratio:16/10}
}
@media(max-width:560px){
  body.template-expedicoes .hero{min-height:650px;padding-top:90px}
  body.template-expedicoes .hero-content{padding-left:20px;border-left-width:6px}
  body.template-expedicoes .hero h1{font-size:clamp(42px,13vw,60px)}
}
`;

const EXCURSIONS_CSS = `
/* EXCURSÕES: organização, datas e confiança para grupos e saídas programadas. */
body.template-excursoes{
  --t-paper:color-mix(in srgb,var(--brand-bg) 84%,#fff 16%);
  --t-rail:color-mix(in srgb,var(--brand) 34%,var(--brand-secondary) 66%);
  background:var(--t-paper);
}
body.template-excursoes .container{max-width:1240px}
body.template-excursoes .site-header{background:var(--t-paper);border-bottom:2px solid color-mix(in srgb,var(--brand) 18%,transparent)}
body.template-excursoes .brand-dot,
body.template-excursoes .nav-cta,
body.template-excursoes .btn{border-radius:999px}
body.template-excursoes .hero{min-height:680px;padding:112px 0 90px;background:var(--brand-dark)}
body.template-excursoes .hero::before{opacity:.46;filter:saturate(.75)}
body.template-excursoes .hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--brand-dark) 74%,transparent),var(--brand-dark))}
body.template-excursoes .hero .container{position:relative;z-index:1}
body.template-excursoes .hero-grid{justify-items:center;text-align:center}
body.template-excursoes .hero-content{max-width:820px;border:0;background:transparent;box-shadow:none;backdrop-filter:none}
body.template-excursoes .hero h1{font-family:'Sora',sans-serif;font-size:clamp(44px,6.8vw,82px);font-weight:800;line-height:.96;letter-spacing:-.055em}
body.template-excursoes .hero p.lead{margin-left:auto;margin-right:auto;max-width:680px}
body.template-excursoes .hero-actions{justify-content:center}
body.template-excursoes .stats-bar{position:relative;margin-top:-34px;border:2px dashed color-mix(in srgb,var(--brand) 38%,transparent);border-radius:18px;background:#fff;box-shadow:0 18px 44px rgba(0,0,0,.1)}
body.template-excursoes .stats-bar::before,
body.template-excursoes .stats-bar::after{content:"";position:absolute;top:50%;width:22px;height:22px;border-radius:50%;background:var(--t-paper);transform:translateY(-50%)}
body.template-excursoes .stats-bar::before{left:-13px}
body.template-excursoes .stats-bar::after{right:-13px}
body.template-excursoes .stat-num{font-family:'Sora',sans-serif;color:#111827}
body.template-excursoes .stat-label{color:#111827;opacity:1}
body.template-excursoes section{padding:clamp(70px,8vw,110px) 0}
body.template-excursoes .section-title{font-family:'Sora',sans-serif;font-size:clamp(34px,5vw,60px);letter-spacing:-.05em}
body.template-excursoes .processo{background:#fff}
body.template-excursoes .proc-grid{position:relative;gap:36px}
body.template-excursoes .proc-grid::before{content:"";position:absolute;top:39px;left:16%;right:16%;height:2px;background:var(--t-rail)}
body.template-excursoes .proc-card{position:relative;border:0;border-radius:18px;background:transparent;box-shadow:none}
body.template-excursoes .proc-card:hover{transform:none;box-shadow:none}
body.template-excursoes .proc-num{position:relative;z-index:1;border:6px solid #fff;border-radius:50%;background:var(--brand);color:var(--brand-contrast);box-sizing:content-box}
body.template-excursoes #destinos{background:var(--t-paper)}
body.template-excursoes #destinos .section-eyebrow,
body.template-excursoes #destinos .section-title{text-align:left;margin-left:0;padding-left:0}
body.template-excursoes .destinos-grid{display:grid;grid-template-columns:1fr;gap:18px;counter-reset:excursao}
body.template-excursoes .dest-card{position:relative;display:grid;grid-template-columns:minmax(230px,.66fr) minmax(0,1.34fr);min-height:280px;border:1px solid color-mix(in srgb,var(--brand) 20%,transparent);border-radius:20px;background:#fff;box-shadow:none;counter-increment:excursao;overflow:hidden}
body.template-excursoes .dest-card::after{content:counter(excursao,decimal-leading-zero);position:absolute;right:20px;top:14px;font-family:'Sora',sans-serif;font-size:42px;font-weight:800;line-height:1;color:color-mix(in srgb,var(--brand) 18%,transparent);pointer-events:none}
body.template-excursoes .dest-img-wrap{height:100%;aspect-ratio:auto}
body.template-excursoes .dest-tag{border-radius:999px;background:var(--brand-secondary);color:var(--secondary-contrast)}
body.template-excursoes .dest-body{padding:clamp(24px,4vw,42px) 72px clamp(24px,4vw,42px) clamp(24px,4vw,42px)}
body.template-excursoes .dest-body h3{font-family:'Sora',sans-serif;font-size:clamp(26px,3vw,38px)}
body.template-excursoes .price-value,
body.template-excursoes .price-main{color:var(--brand-dark)}
body.template-excursoes .dest-cta{width:max-content;border:1px solid var(--brand);border-radius:999px;padding:9px 16px;color:var(--brand-dark)}
body.template-excursoes .equipe{background:#fff}
body.template-excursoes .equipe-img{border-radius:28px}
body.template-excursoes .depo-card,
body.template-excursoes .orc-form,
body.template-excursoes .faq-item{border-radius:18px}
body.template-excursoes footer{background:var(--brand-dark)}
@media(max-width:840px){
  body.template-excursoes .proc-grid::before{display:none}
  body.template-excursoes .dest-card{grid-template-columns:1fr}
  body.template-excursoes .dest-img-wrap{height:auto;aspect-ratio:16/9}
}
@media(max-width:560px){
  body.template-excursoes .hero{min-height:640px;padding-top:92px}
  body.template-excursoes .hero h1{font-size:clamp(40px,13vw,58px)}
  body.template-excursoes .stats-bar{margin-top:-20px}
  body.template-excursoes .dest-body{padding:28px 24px}
  body.template-excursoes .dest-card::after{right:16px;top:12px;font-size:34px}
}
`;

const TEMPLATE_CSS: Partial<Record<SiteTemplateId, string>> = {
  horizonte: HORIZONTE_ES_CSS,
  ofertas: OFFERS_CSS,
  experiencias: EXPERIENCES_CSS,
  expedicoes: EXPEDITIONS_CSS,
  excursoes: EXCURSIONS_CSS,
};

export const getSiteTemplateCss = (templateId: unknown): string =>
  TEMPLATE_CSS[normalizeSiteTemplateId(templateId)] ?? "";
