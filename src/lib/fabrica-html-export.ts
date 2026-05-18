import type { FabricaState } from "@/hooks/useFabricaContext";

const SB_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SB_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Imagens premium padrão por destino (fallback quando o usuário não enviou foto)
const DEFAULT_DEST_IMG = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";

// Helpers de cor — gera tons mais escuros/claros pra header e gradientes
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(v, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function darken(hex: string, amount = 0.7) {
  const { r, g, b } = hexToRgb(hex);
  const f = 1 - amount;
  return `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`;
}

// Helper para estruturar o preço visualmente (como E-commerce)
function parsePriceHTML(priceStr: string): string {
  const s = esc(priceStr);
  // Captura Moeda + Valor (ex: R$ 1.499,90)
  const regex = /^(.*?)(R\$|US\$|€|£|AR\$)\s?([\d.,]+)(.*)$/i;
  const m = s.match(regex);
  
  if (!m) return `<div class="price-main">${s}</div>`;

  const prefix = m[1]?.trim() || "";
  const symbol = m[2]?.trim() || "R$";
  const value = m[3]?.trim() || "";
  const suffix = m[4]?.trim() || "";

  return `<div class="price-stack">
    ${prefix ? `<div class="price-row-top">${prefix}</div>` : ""}
    <div class="price-row-main">
      <span class="price-symbol">${symbol}</span>
      <span class="price-value">${value}</span>
    </div>
    ${suffix ? `<div class="price-row-bottom">${suffix}</div>` : ""}
  </div>`;
}

export function buildLandingHTML(state: FabricaState, trackingId?: string): string {
  const color = state.primaryColor || "#0F2742";
  const colorDark = darken(color, 0.45);
  const rawWpp = (state.whatsapp || "").replace(/\D/g, "");
  const wpp = rawWpp.startsWith("55") ? rawWpp : `55${rawWpp}`;
  const sc = state.siteContent;
  const agencia = state.agencyName || "Agência de Viagens";
  const cidade = state.city || "Brasil";

  const headline =
    sc.heroHeadline?.trim() || "Viagens que transformam para sempre";
  const subheadline =
    sc.heroSubheadline?.trim() ||
    `Roteiros exclusivos e sob medida para viajantes que não aceitam o comum. Da primeira reunião ao retorno em casa — cuidamos de cada detalhe.`;

  const pacotes = state.selectedPackages.length
    ? state.selectedPackages
    : [
        { id: "1", title: "Roteiro Sob Medida", description: "Montamos o seu roteiro ideal com hospedagem, transporte e passeios.", price: "Sob consulta", imageUrl: "", ctaLabel: "Quero esse" },
      ];

  const wppMsg = (titulo: string) =>
    `https://wa.me/${wpp}?text=${encodeURIComponent(`Olá! Tenho interesse em ${titulo}.`)}`;

  // Stats default (a agência pode editar depois). Usamos números crescentes para autoridade.
  const stats = [
    { num: "12+", label: "Anos de Experiência" },
    { num: "15k+", label: "Viajantes Felizes" },
    { num: "25", label: "Países Atendidos" },
    { num: "99%", label: "Satisfação" },
  ];

  // Avatar com inicial — gera SVG inline pra não depender de rede
  const avatarSvg = (nome: string, bg: string) => {
    const initial = (nome || "?").trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='${bg}'/><text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='32' font-weight='700' fill='white'>${initial}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const heroImg = sc.heroImageUrl || sc.galleryImages?.[0] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80";
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(agencia)} — Consultoria Premium de Viagens</title>
<meta name="description" content="${esc(subheadline)}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@400;600;700;800&family=Playfair+Display:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding::root{--brand:${color};--brand-dark:${colorDark};--ink:#0a0a0b;--muted:#5a6470;--soft:${state.backgroundColor || "#f4f6f9"}}
html{scroll-behavior:smooth}
body{font-family:'Inter',sans-serif;color:var(--ink);background:#fff;line-height:1.6;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:'Playfair Display',serif;letter-spacing:-0.02em;line-height:1.15;color:var(--ink)}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
.container{max-width:1180px;margin:0 auto;padding:0 24px}
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--brand);color:#fff;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;transition:all .25s;border:none;cursor:pointer;font-family:'Inter',sans-serif}
.btn:hover{background:var(--brand-dark);transform:translateY(-1px);box-shadow:0 12px 30px rgba(0,0,0,.18)}
.btn-outline{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.4)}
.btn-outline:hover{background:#fff;color:var(--ink);border-color:#fff}
.btn-dark{background:var(--ink);color:#fff}
.btn-dark:hover{background:#222}
.eyebrow{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--brand)}

/* HEADER */
.site-header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,.06)}
.nav-wrap{display:flex;align-items:center;justify-content:space-between;padding:14px 0;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:16px;flex-shrink:0}
.brand-logo{height:48px;width:auto;max-width:180px;object-fit:contain;border-radius:6px}
.brand-dot{width:36px;height:36px;border-radius:8px;background:var(--brand);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px}
.brand-name{font-weight:700;font-size:16px}
.nav-links{display:flex;gap:24px;align-items:center}
.nav-links a{font-size:14px;color:var(--muted);font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--ink)}
.nav-cta{padding:10px 18px;background:var(--brand);color:#fff !important;border-radius:8px;font-weight:600}
.nav-cta:hover{background:var(--brand-dark);color:#fff !important}
.nav-toggle{display:none;background:none;border:none;cursor:pointer;width:40px;height:40px;flex-direction:column;justify-content:center;align-items:center;gap:5px;padding:0}
.nav-toggle span{display:block;width:22px;height:2px;background:var(--ink);border-radius:2px;transition:all .2s}
@media(max-width:840px){
  .nav-toggle{display:flex}
  .brand-logo{height:40px;max-width:140px}
  .nav-links{position:absolute;top:100%;right:16px;left:16px;flex-direction:column;background:#fff;border-radius:14px;padding:18px;gap:14px;align-items:stretch;box-shadow:0 16px 40px rgba(0,0,0,.12);border:1px solid rgba(0,0,0,.06);display:none}
  .nav-links.open{display:flex}
  .nav-links a{padding:10px 12px;text-align:center;border-radius:8px}
  .nav-links a:hover{background:var(--soft)}
  .nav-cta{text-align:center}
}

/* HERO */
.hero{position:relative;padding:64px 0 56px;background:linear-gradient(135deg,#0a1525 0%,#1a2c44 50%,${colorDark} 100%);color:#fff;overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;background:url("${heroImg}") center/cover;opacity:.2;mix-blend-mode:luminosity}
.hero-grid{position:relative;display:grid;grid-template-columns:1fr;gap:48px;align-items:center;z-index:1}
.hero-content{background:rgba(0,0,0,0.3);backdrop-filter:blur(10px);padding:40px;border-radius:24px;border:1px solid rgba(255,255,255,0.1);max-width:800px}
.hero .eyebrow{color:#fff;opacity:.8;display:inline-block;margin-bottom:12px}
.hero h1{font-size:clamp(34px,6vw,72px);font-weight:800;color:#fff;margin:0 0 20px;letter-spacing:-0.03em;line-height:1.1}
.hero p.lead{font-size:18px;opacity:.85;margin-bottom:32px;line-height:1.7}
.hero-actions{display:flex;flex-wrap:wrap;gap:12px}
.hero-actions .btn{flex:1 1 auto;min-width:160px;justify-content:center}
.stats-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:64px;padding:32px 0;border-top:1px solid rgba(255,255,255,.15);position:relative;z-index:1}
.stat-num{font-family:'Playfair Display',serif;font-size:42px;font-weight:800;color:#fff;line-height:1}
.stat-label{font-size:12px;text-transform:uppercase;letter-spacing:1.5px;opacity:.7;margin-top:6px}
@media(max-width:640px){
  .hero{padding:44px 0 40px}
  .hero-content{padding:24px 20px;border-radius:18px}
  .hero-actions{flex-direction:column;gap:8px}
  .hero-actions .btn{width:100%;justify-content:center}
  .stats-bar{grid-template-columns:repeat(2,1fr);gap:24px 12px;margin-top:40px;padding:24px 0}
  .stat-num{font-size:28px}
  .stat-label{font-size:11px;letter-spacing:1px}
  .hero p.lead{font-size:15px;margin-bottom:24px}
}

/* SECTIONS */
section{padding:80px 0}
.section-eyebrow{text-align:center;margin-bottom:12px}
.section-title{text-align:center;font-size:clamp(28px,4.4vw,48px);font-weight:700;margin-bottom:48px;max-width:720px;margin-left:auto;margin-right:auto;padding:0 8px}
@media(max-width:640px){
  section{padding:56px 0}
  .container{padding:0 18px}
  .section-title{margin-bottom:36px;font-size:26px}
}

/* PROCESSO */
.processo{background:var(--soft)}
.proc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.proc-card{background:#fff;padding:36px 28px;border-radius:16px;border:1px solid rgba(0,0,0,.05);transition:all .3s;position:relative}
.proc-card:hover{transform:translateY(-6px);box-shadow:0 20px 50px rgba(0,0,0,.08);border-color:var(--brand)}
.proc-num{width:52px;height:52px;border-radius:50%;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:22px;font-weight:700;margin-bottom:20px}
.proc-card h3{font-size:22px;margin-bottom:12px}
.proc-card p{color:var(--muted);font-size:15px;line-height:1.7}
@media(max-width:840px){/deep/ .proc-grid{grid-template-columns:1fr;gap:16px}.proc-card{padding:28px 22px}}

/* DESTINOS */
.destinos-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.dest-card{background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,.06);transition:all .35s;cursor:pointer;display:flex;flex-direction:column}
.dest-card:hover{transform:translateY(-8px);box-shadow:0 24px 60px rgba(0,0,0,.14)}
.dest-img-wrap{position:relative;aspect-ratio:4/3;overflow:hidden;background:#eee}
.dest-img-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .6s}
.dest-card:hover .dest-img-wrap img{transform:scale(1.06)}
.dest-tag{position:absolute;top:16px;left:16px;background:rgba(255,255,255,.95);color:var(--ink);padding:6px 14px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
.dest-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(0,0,0,.7));opacity:0;transition:opacity .3s;display:flex;align-items:flex-end;padding:20px;color:#fff;font-weight:600}
.dest-card:hover .dest-overlay{opacity:1}
.dest-body{padding:24px;display:flex;flex-direction:column;flex:1}
.dest-loc{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px}
.dest-body h3{font-size:22px;margin-bottom:8px}
.dest-body p{color:var(--muted);font-size:14px;flex:1;margin-bottom:20px}
.dest-price{margin-bottom:18px;font-family:'Sora',sans-serif}
.price-stack{display:flex;flex-direction:column;gap:1px}
.price-row-top{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:-2px}
.price-row-main{display:flex;align-items:baseline;gap:4px;line-height:1.1}
.price-symbol{font-size:16px;font-weight:700;color:var(--ink);opacity:0.8}
.price-value{font-size:32px;font-weight:800;color:var(--brand);letter-spacing:-0.03em}
.price-row-bottom{font-size:12px;color:var(--muted);font-weight:500}
.price-main{font-size:20px;font-weight:700;color:var(--brand)}
.dest-cta{display:inline-flex;align-items:center;gap:6px;color:var(--brand);font-weight:600;font-size:14px;border-top:1px solid rgba(0,0,0,.06);padding-top:16px;margin-top:auto}
@media(max-width:980px){.destinos-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.destinos-grid{grid-template-columns:1fr}}

/* EQUIPE / POR QUE NÓS */
.equipe{background:var(--ink);color:#fff}
.equipe h2,.equipe h3{color:#fff}
.equipe-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
.equipe-left .badge-counter{display:inline-block;background:var(--brand);color:#fff;padding:8px 18px;border-radius:50px;font-weight:700;font-size:14px;margin-bottom:24px}
.equipe-left h2{font-size:clamp(28px,3.8vw,44px);margin-bottom:24px;color:#fff}
.equipe-left p.intro{font-size:16px;opacity:.75;line-height:1.8;margin-bottom:32px}
.equipe-features{display:grid;gap:20px;margin-bottom:36px}
.feat{display:flex;gap:14px;align-items:flex-start}
.feat-icon{flex-shrink:0;width:42px;height:42px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:18px}
.feat h4{font-family:'Inter',sans-serif;font-size:15px;font-weight:600;color:#fff;margin-bottom:4px}
.feat p{font-size:14px;opacity:.65;line-height:1.6}
.equipe-img{width:100%;aspect-ratio:4/5;border-radius:20px;overflow:hidden;background:url("https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80") center/cover}
@media(max-width:840px){.equipe-grid{grid-template-columns:1fr;gap:40px}.equipe-img{max-width:420px;width:100%;margin:0 auto}}

/* DEPOIMENTOS */
.depo-bg{background:#fafbfc}
.depo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.depo-card{background:#fff;padding:32px;border-radius:16px;border:1px solid rgba(0,0,0,.05);transition:all .3s}
.depo-card:hover{box-shadow:0 16px 40px rgba(0,0,0,.06);border-color:var(--brand)}
.stars{color:#FBBC04;font-size:16px;letter-spacing:2px;margin-bottom:16px}
.depo-text{font-size:15px;line-height:1.7;color:var(--ink);margin-bottom:24px;font-style:italic}
.depo-author{display:flex;align-items:center;gap:14px}
.depo-avatar{width:48px;height:48px;border-radius:50%;flex-shrink:0}
.depo-name{font-weight:600;font-size:14px}
.depo-meta{font-size:12px;color:var(--muted)}
@media(max-width:980px){.depo-grid{grid-template-columns:1fr;gap:16px}}

/* ORÇAMENTO */
.orc-grid{display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:start}
.orc-info h2{font-size:clamp(28px,3.6vw,40px);margin-bottom:18px}
.orc-info > p{color:var(--muted);font-size:15px;margin-bottom:32px;line-height:1.7}
.contact-list{display:grid;gap:20px}
.contact-item{display:flex;gap:14px;align-items:flex-start;padding:18px;background:var(--soft);border-radius:12px}
.contact-icon{width:40px;height:40px;border-radius:10px;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.contact-item strong{display:block;font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;font-weight:600}
.contact-item span{font-size:15px;color:var(--ink);font-weight:500}
.orc-form{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:20px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,.04)}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.form-row.single{grid-template-columns:1fr}
.field label{display:block;font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.field input,.field select,.field textarea{width:100%;padding:13px 14px;border:1.5px solid rgba(0,0,0,.08);border-radius:10px;font-size:15px;font-family:'Inter',sans-serif;background:#fff;color:var(--ink);transition:border .2s;-webkit-appearance:none;appearance:none}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--brand)}
.field textarea{resize:vertical;min-height:90px}
.form-submit{width:100%;padding:16px;font-size:15px;justify-content:center;margin-top:8px}
@media(max-width:840px){.orc-grid{grid-template-columns:1fr;gap:32px}.form-row{grid-template-columns:1fr;gap:12px;margin-bottom:12px}.orc-form{padding:24px 20px;border-radius:16px}.contact-item{padding:14px}}

/* FAQ */
.faq-bg{background:var(--soft)}
.faq-list{max-width:780px;margin:0 auto}
.faq-item{background:#fff;border-radius:12px;margin-bottom:12px;border:1px solid rgba(0,0,0,.05);overflow:hidden;transition:all .2s}
.faq-item[open]{border-color:var(--brand);box-shadow:0 6px 20px rgba(0,0,0,.05)}
.faq-item summary{padding:20px 22px;font-weight:600;font-size:15px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px;color:var(--ink)}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary::after{content:"+";font-size:22px;color:var(--brand);font-weight:300;transition:transform .2s;flex-shrink:0}
.faq-item[open] summary::after{content:"–"}
.faq-item p{padding:0 22px 22px;color:var(--muted);font-size:14.5px;line-height:1.7}

/* FOOTER */
footer{background:var(--ink);color:#9ba3ad;padding:64px 0 28px}
.foot-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1.2fr;gap:48px;margin-bottom:48px}
.foot-brand{font-family:'Playfair Display',serif;font-size:22px;color:#fff;font-weight:700;margin-bottom:16px}
.foot-grid p{font-size:14px;line-height:1.7;margin-bottom:18px}
.foot-grid h4{font-family:'Inter',sans-serif;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#fff;margin-bottom:18px;font-weight:600}
.foot-grid ul{list-style:none}
.foot-grid li{margin-bottom:10px;font-size:14px}
.foot-grid li a:hover{color:var(--brand)}
.foot-bottom{border-top:1px solid rgba(255,255,255,.08);padding-top:24px;text-align:center;font-size:13px;display:flex;flex-direction:column;gap:6px}
@media(max-width:840px){.foot-grid{grid-template-columns:1fr 1fr;gap:32px;margin-bottom:36px}}
@media(max-width:560px){.foot-grid{grid-template-columns:1fr;gap:28px}footer{padding:48px 0 24px}}

/* WHATSAPP FLUTUANTE */
.wpp-float{position:fixed;bottom:20px;right:20px;background:#25D366;color:#fff;width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 10px 30px rgba(37,211,102,.5);z-index:99;transition:transform .2s}
.wpp-float:hover{transform:scale(1.08)}
@media(max-width:640px){.wpp-float{width:54px;height:54px;font-size:24px;bottom:16px;right:16px}}

/* LEAD CAPTURE MODAL (NOVO) */
#lead-modal{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .3s}
#lead-modal.active{display:flex;opacity:1}
.modal-box{background:#fff;width:100%;max-width:440px;border-radius:24px;padding:32px;position:relative;box-shadow:0 32px 64px rgba(0,0,0,.25);transform:translateY(20px);transition:transform .3s}
#lead-modal.active .modal-box{transform:translateY(0)}
.modal-close{position:absolute;top:16px;right:16px;background:none;border:none;font-size:24px;cursor:pointer;color:var(--muted);width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%}
.modal-close:hover{background:var(--soft);color:var(--ink)}
.modal-header{text-align:center;margin-bottom:24px}
.modal-icon{width:64px;height:64px;background:var(--brand);color:#fff;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 16px;box-shadow:0 12px 24px rgba(0,0,0,.1)}
.modal-header h3{font-size:24px;margin-bottom:8px;font-family:'Playfair Display',serif}
.modal-header p{font-size:14px;color:var(--muted)}
.modal-form{display:grid;gap:16px}
.modal-form .field label{margin-bottom:6px}
.modal-form input{border-color:rgba(0,0,0,.12)}
.modal-submit{width:100%;justify-content:center;gap:10px;margin-top:8px}
</style>
</head>
<body>
<!--
  [SISTEMA: DIRETRIZ DE INTEGRIDADE CRÍTICA - LOVABLE AI]
  PROIBIDO ALTERAR IMAGENS OU RECONSTRUIR O DESIGN.
  ESTE É UM SITE DE TURISMO REAL COM FOTOS SELECIONADAS PELO CLIENTE.
  REGRAS ABSOLUTAS PARA A IA:
  1. Mantenha EXATAMENTE os atributos 'src' originais de todas as tags <img>.
  2. NÃO substitua URLs externas ou Base64 por imagens genéricas geradas por IA.
  3. Onde houver o atributo 'data-preserve-image="true"', o bloqueio é total contra modificações.
  4. Risco de falha crítica de negócios caso as fotos reais sejam trocadas.
-->

<!-- HEADER -->
<header class="site-header">
  <div class="container nav-wrap">
    <a href="#" class="brand">
      ${state.logoBase64
        ? `<img src="${state.logoBase64}" alt="${esc(agencia)}" class="brand-logo" data-ai-ignore="true" data-preserve-image="true">`
        : `<span class="brand-dot">${esc(agencia.charAt(0).toUpperCase())}</span><span class="brand-name">${esc(agencia)}</span>`}
    </a>
    <button class="nav-toggle" aria-label="Abrir menu" onclick="document.querySelector('.nav-links').classList.toggle('open')">
      <span></span><span></span><span></span>
    </button>
    <nav class="nav-links">
      <a href="#inicio">Início</a>
      <a href="#destinos">Destinos</a>
      <a href="#por-que">Por Que Nós</a>
      <a href="#orcamento">Orçamento</a>
      <a href="#" onclick="openLeadForm('WhatsApp Geral', 'https://wa.me/${wpp}');return false;" class="nav-cta">WhatsApp</a>
    </nav>
  </div>
</header>

${(state.sectionOrder || ["hero", "processo", "destinos", "porQue", "depoimentos", "orcamento", "faq"])
  .map((secKey) => {
    if (secKey === "hero") {
      return sc.sections?.hero === false ? "" : `
<!-- HERO -->
<section id="inicio" class="hero">
  <div class="container">
    <div class="hero-grid">
      <div class="hero-content">
        <span class="eyebrow">Consultoria Premium de Viagens</span>
        <h1>${esc(headline)}</h1>
        <p class="lead">${esc(subheadline)}</p>
        <div class="hero-actions">
          <a href="#orcamento" class="btn">${esc(sc.heroCtaLabel || "Solicitar Meu Roteiro")}</a>
          <a href="#destinos" class="btn btn-outline">Ver Destinos</a>
        </div>
      </div>
    </div>
    <div class="stats-bar">
      ${stats.map((s) => `<div><div class="stat-num">${esc(s.num)}</div><div class="stat-label">${esc(s.label)}</div></div>`).join("")}
    </div>
  </div>
</section>`;
    }
    if (secKey === "processo") {
      return sc.sections?.processo === false ? "" : `
<!-- PROCESSO -->
<section class="processo">
  <div class="container">
    <div class="section-eyebrow eyebrow">Processo</div>
    <h2 class="section-title">Sua viagem dos sonhos em 3 passos</h2>
    <div class="proc-grid">
      <div class="proc-card"><div class="proc-num">1</div><h3>Consulta Personalizada</h3><p>Entendemos seus sonhos, datas, orçamento e estilo em uma conversa de 30 minutos sem compromisso.</p></div>
      <div class="proc-card"><div class="proc-num">2</div><h3>Curadoria Exclusiva</h3><p>Criamos um roteiro 100% personalizado com os melhores hotéis, passeios e experiências para o seu perfil.</p></div>
      <div class="proc-card"><div class="proc-num">3</div><h3>Embarque Tranquilo</h3><p>Cuidamos de passagens, hospedagem, transfers e suporte 24h durante toda a sua viagem.</p></div>
    </div>
  </div>
</section>`;
    }
    if (secKey === "destinos") {
      return sc.sections?.destinos === false ? "" : `
<!-- DESTINOS -->
<section id="destinos">
  <div class="container">
    <div class="section-eyebrow eyebrow">Destinos</div>
    <h2 class="section-title">${esc(sc.pacotesTitle || "Experiências que ficam na memória")}</h2>
    <div class="destinos-grid">
      ${pacotes
        .map(
          (p) => `<a href="#" onclick="openLeadForm('${esc(p.title)}', '${wppMsg(p.title)}');return false;" class="dest-card">
        <div class="dest-img-wrap">
          <img src="${esc(p.imageUrl || DEFAULT_DEST_IMG)}" alt="${esc(p.title)}" loading="lazy" data-ai-ignore="true" data-preserve-image="true">
          <span class="dest-tag">${esc(p.title.split(" ")[0] || "Destino")}</span>
          <div class="dest-overlay">Ver pacote →</div>
        </div>
        <div class="dest-body">
          <div class="dest-loc">${esc(cidade)}</div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          <div class="dest-price">${parsePriceHTML(p.price)}</div>
          <span class="dest-cta">Saiba mais →</span>
        </div>
      </a>`
        )
        .join("")}
    </div>
  </div>
</section>`;
    }
    if (secKey === "porQue") {
      return sc.sections?.porQue === false ? "" : `
<!-- POR QUE NÓS / EQUIPE -->
<section id="por-que" class="equipe">
  <div class="container">
    <div class="equipe-grid">
      <div class="equipe-left">
        <span class="badge-counter">+15k Clientes Satisfeitos</span>
        <div class="eyebrow" style="color:#fff;opacity:.6">Nossa equipe</div>
        <h2>Uma equipe dedicada exclusivamente a você</h2>
        <p class="intro">Cada viagem começa com uma conversa real. Nossa equipe de especialistas conhece os destinos de perto — cada detalhe pensado para o seu perfil, seus sonhos e o seu momento.</p>
        <div class="equipe-features">
          <div class="feat"><div class="feat-icon">🛡️</div><div><h4>Segurança e Confiabilidade</h4><p>Anos de atuação com milhares de famílias e parceiros verificados mundialmente.</p></div></div>
          <div class="feat"><div class="feat-icon">📞</div><div><h4>Suporte 24h Durante a Viagem</h4><p>Nossa equipe está disponível a qualquer hora. Qualquer imprevisto, resolvemos.</p></div></div>
          <div class="feat"><div class="feat-icon">✨</div><div><h4>Experiências Exclusivas</h4><p>Acesso a hotéis e experiências que não estão disponíveis para o público geral.</p></div></div>
          <div class="feat"><div class="feat-icon">💰</div><div><h4>Melhor Custo-Benefício</h4><p>Nossa rede de parceiros oferece condições especiais que você não encontra em outros lugares.</p></div></div>
        </div>
        <a href="#" onclick="openLeadForm('Falar com Especialista', 'https://wa.me/55${wpp}');return false;" class="btn">Falar com um especialista</a>
      </div>
      <div class="equipe-img"></div>
    </div>
  </div>
</section>`;
    }
    if (secKey === "depoimentos") {
      return sc.sections?.depoimentos !== false && state.depoimentos.length > 0
        ? `
<!-- DEPOIMENTOS -->
<section class="depo-bg">
  <div class="container">
    <div class="section-eyebrow eyebrow">Depoimentos</div>
    <h2 class="section-title">${esc(sc.depoimentosTitle || "O que nossos viajantes dizem")}</h2>
    <div class="depo-grid">
      ${state.depoimentos
        .slice(0, 3)
        .map(
          (d) => `<div class="depo-card">
        <div class="stars">★★★★★</div>
        <p class="depo-text">"${esc(d.text)}"</p>
        <div class="depo-author">
          <img src="${avatarSvg(d.name, color)}" class="depo-avatar" alt="${esc(d.name)}" data-ai-ignore="true" data-preserve-image="true">
          <div><div class="depo-name">${esc(d.name)}</div><div class="depo-meta">Cliente verificado</div></div>
        </div>
      </div>`
        )
        .join("")}
    </div>
  </div>
</section>`
        : "";
    }
    if (secKey === "orcamento") {
      return sc.sections?.orcamento === false ? "" : `
<!-- ORÇAMENTO -->
<section id="orcamento">
  <div class="container">
    <div class="orc-grid">
      <div class="orc-info">
        <span class="eyebrow">Orçamento</span>
        <h2 style="margin-top:12px">Fale com um consultor agora</h2>
        <p>Preencha o formulário e nossa equipe entrará em contato em até 2 horas com uma proposta personalizada.</p>
        <div class="contact-list">
          <div class="contact-item"><div class="contact-icon">💬</div><div><strong>WhatsApp</strong><span>${esc(state.whatsapp || "—")}</span></div></div>
          <div class="contact-item"><div class="contact-icon">✉</div><div><strong>E-mail</strong><span>contato@${esc((agencia || "agencia").toLowerCase().replace(/[^a-z0-9]/g, ""))}.com.br</span></div></div>
          <div class="contact-item"><div class="contact-icon">🕐</div><div><strong>Atendimento</strong><span>Seg–Sex 8h–20h · Sáb 9h–15h</span></div></div>
          <div class="contact-item"><div class="contact-icon">📍</div><div><strong>Localização</strong><span>${esc(cidade)}</span></div></div>
        </div>
      </div>
      <form class="orc-form" onsubmit="event.preventDefault();const f=this;const msg=encodeURIComponent('Olá! Quero um orçamento.\\n\\nNome: '+f.nome.value+'\\nWhatsApp: '+f.wpp.value+'\\nE-mail: '+f.email.value+'\\nDestino: '+f.destino.value+'\\nViajantes: '+f.viaj.value+'\\nIda: '+f.ida.value+'\\nVolta: '+f.volta.value+'\\nObs: '+f.obs.value);window.open('https://wa.me/${wpp}?text='+msg,'_blank')">
        <div class="form-row">
          <div class="field"><label>Nome Completo</label><input name="nome" required placeholder="Ex: Maria Silva"></div>
          <div class="field"><label>WhatsApp</label><input name="wpp" required placeholder="(00) 00000-0000"></div>
        </div>
        <div class="form-row single">
          <div class="field"><label>E-mail</label><input type="email" name="email" required placeholder="seu@email.com"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>Destino de Interesse</label><select name="destino"><option value="">Selecione…</option>${pacotes.map((p) => `<option>${esc(p.title)}</option>`).join("")}<option>Outro / sob medida</option></select></div>
          <div class="field"><label>Nº de Viajantes</label><input type="number" name="viaj" min="1" value="2"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>Data de Ida</label><input type="date" name="ida"></div>
          <div class="field"><label>Data de Volta</label><input type="date" name="volta"></div>
        </div>
        <div class="form-row single">
          <div class="field"><label>Observações (opcional)</label><textarea name="obs" placeholder="Preferências, ocasião especial, orçamento…"></textarea></div>
        </div>
        <button type="submit" class="btn form-submit">💬 Enviar pelo WhatsApp</button>
      </form>
    </div>
  </div>
</section>`;
    }
    if (secKey === "faq") {
      return sc.sections?.faq !== false && sc.faq && sc.faq.length > 0
        ? `
<!-- FAQ -->
<section class="faq-bg">
  <div class="container">
    <div class="section-eyebrow eyebrow">Dúvidas</div>
    <h2 class="section-title">${esc(sc.faqTitle || "Perguntas Frequentes")}</h2>
    <div class="faq-list">
      ${sc.faq.map((f) => `<details class="faq-item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}
    </div>
  </div>
</section>`
        : "";
    }
    return "";
  }).join("\n")}

<!-- FOOTER -->
<footer>
  <div class="container">
    <div class="foot-grid">
      <div>
        <div class="foot-brand">${esc(agencia)}</div>
        <p>Consultoria especializada em viagens premium e roteiros personalizados para quem não aceita o comum.</p>
      </div>
      <div>
        <h4>Destinos</h4>
        <ul>${pacotes.slice(0, 5).map((p) => `<li><a href="#destinos">${esc(p.title)}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h4>Empresa</h4>
        <ul>
          <li><a href="#por-que">Sobre Nós</a></li>
          <li><a href="#processo">Como Funciona</a></li>
          <li><a href="#depo">Depoimentos</a></li>
          <li><a href="#orcamento">Contato</a></li>
        </ul>
      </div>
      <div>
        <h4>Contato</h4>
        <ul>
          <li>${esc(state.whatsapp || "—")}</li>
          <li>${esc(cidade)}</li>
          <li>Seg–Sex 8h–20h</li>
        </ul>
      </div>
    <div class="foot-bottom">
      <div>© ${new Date().getFullYear()} ${esc(agencia)} · Todos os direitos reservados</div>
      <div>Feito com ❤ com <a href="https://canvaviagem.com" target="_blank" style="text-decoration: underline; font-weight: 600; color: #fff;">Canva Viagem</a></div>
    </div>
  </div>
</footer>

<a href="#" onclick="openLeadForm('Botão Flutuante', 'https://wa.me/${wpp}');return false;" class="wpp-float" aria-label="WhatsApp">💬</a>

<!-- SMART LEAD CAPTURE MODAL -->
<div id="lead-modal">
  <div class="modal-box">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <div class="modal-header">
      <div class="modal-icon">🌍</div>
      <h3>Falta pouco para sua viagem!</h3>
      <p id="modal-subtitle">Você tem interesse em: Geral</p>
    </div>
    <form class="modal-form" onsubmit="handleSubmitLead(event)">
      <div class="field">
        <label>Seu Nome</label>
        <input type="text" id="lead-name" required placeholder="Ex: Maria Silva">
      </div>
      <div class="field">
        <label>Seu WhatsApp / Celular</label>
        <input type="tel" id="lead-phone" required placeholder="(00) 90000-0000">
      </div>
      <button type="submit" class="btn modal-submit">🚀 Falar no WhatsApp</button>
    </form>
  </div>
</div>

<!-- SISTEMA DE TELEMETRIA E INTEGRAÇÃO SILENCIOSA -->
<script>
  const CONFIG = {
    agencyId: "${esc(trackingId || state.agencyName || 'agencia_desconhecida')}",
    supabaseUrl: "${SB_URL}",
    supabaseKey: "${SB_KEY}"
  };

  let pendingUrl = "";
  let currentTarget = "";

  function track(type, data) {
    if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) return Promise.resolve();
    return fetch(\`\${CONFIG.supabaseUrl}/rest/v1/analytics_events\`, {
      method: "POST",
      headers: {
        "apikey": CONFIG.supabaseKey,
        "Authorization": "Bearer " + CONFIG.supabaseKey,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        event_type: type,
        event_data: { 
          ...data, 
          agency_id: CONFIG.agencyId,
          userAgent: navigator.userAgent
        },
        created_at: new Date().toISOString()
      })
    }).catch(err => console.warn("Tracking off", err));
  }

  // Registra a visita ÚNICA no carregamento da página para métricas reais
  window.onload = () => {
    const trackerKey = "cv_visit_" + CONFIG.agencyId;
    if (!localStorage.getItem(trackerKey)) {
      track("page_view", { path: window.location.pathname });
      localStorage.setItem(trackerKey, "true"); // Marca como já visitou!
    }
  };

  function openLeadForm(targetName, finalUrl) {
    currentTarget = targetName;
    pendingUrl = finalUrl;
    
    // Se já preencheu antes, não pergunta de novo, pula direto (experiência do usuário!)
    const savedName = localStorage.getItem("cv_lead_name");
    if (savedName) {
       track("click_whatsapp", { target: targetName, cached_user: savedName });
       window.open(finalUrl, "_blank");
       return;
    }

    document.getElementById("modal-subtitle").innerText = "Interesse: " + targetName;
    document.getElementById("lead-modal").classList.add("active");
    track("click_intent", { target: targetName });
  }

  function closeModal() {
    document.getElementById("lead-modal").classList.remove("active");
  }

  function handleSubmitLead(e) {
    e.preventDefault();
    const name = document.getElementById("lead-name").value;
    const phone = document.getElementById("lead-phone").value;
    
    // Salva localmente para não chatear o cliente nas próximas vezes
    localStorage.setItem("cv_lead_name", name);

    // Envia silencioso pro banco de dados em segundo plano (SEM AWAIT para não bloquear popup)
    track("lead_captured", {
      name: name,
      phone: phone,
      interest: currentTarget
    });

    closeModal();
    
    // Redireciona pro WhatsApp anexando o nome no texto pra ficar ainda mais TOP
    let finalWppUrl = pendingUrl;
    if(finalWppUrl.indexOf("?") === -1) {
      finalWppUrl += "?text=" + encodeURIComponent("Olá, meu nome é " + name + "!");
    } else {
      finalWppUrl += encodeURIComponent(" (Meu nome é " + name + ")");
    }
    
    // Síncrono garante que o navegador não bloqueie o popup!
    window.open(finalWppUrl, "_blank");
  }
</script>

</body>
</html>`;
}

export function downloadLandingHTML(state: FabricaState, version?: number, trackingId?: string) {
  const html = buildLandingHTML(state, trackingId);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = (state.agencyName || "agencia").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const v = version ? `-v${version}` : `-v${Date.now().toString().slice(-4)}`;
  a.href = url;
  a.download = `site-${slug}${v}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Gera um Prompt cirúrgico para o Lovable contendo APENAS o HTML dos pacotes novos,
 * evitando que o usuário precise reconstruir o site do zero.
 */
export function generateUpdatePackagesPrompt(state: FabricaState): string {
  const rawWpp = (state.whatsapp || "").replace(/\D/g, "");
  const wpp = rawWpp.startsWith("55") ? rawWpp : `55${rawWpp}`;
  const cidade = state.city || "Brasil";

  const pacotes = state.selectedPackages.length ? state.selectedPackages : [];
  
  if (pacotes.length === 0) {
    return "Nenhum pacote foi gerado ainda. Por favor, crie anúncios na Fase 3 primeiro.";
  }

  const wppMsg = (titulo: string) =>
    `https://wa.me/${wpp}?text=${encodeURIComponent(`Olá! Tenho interesse em ${titulo}.`)}`;

  const cardsHTML = pacotes
    .map((p) => 
`<a href="${wppMsg(p.title)}" target="_blank" rel="noopener" class="dest-card">
  <div class="dest-img-wrap">
    <img src="${esc(p.imageUrl || DEFAULT_DEST_IMG)}" alt="${esc(p.title)}" loading="lazy" data-ai-ignore="true" data-preserve-image="true">
    <span class="dest-tag">${esc(p.title.split(" ")[0] || "Destino")}</span>
    <div class="dest-overlay">Ver pacote →</div>
  </div>
  <div class="dest-body">
    <div class="dest-loc">${esc(cidade)}</div>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.description)}</p>
    <div class="dest-price">${parsePriceHTML(p.price)}</div>
    <span class="dest-cta">Saiba mais →</span>
  </div>
</a>`)
    .join("\n");

  return `Lovable, por favor, atualize o meu site atual.
Adicione os seguintes pacotes atualizados na minha grade de destinos/pacotes existente.

INSTRUÇÃO CRÍTICA: 
1. NÃO recrie o site do zero. 
2. NÃO altere as cores ou o design atual. 
3. NÃO gere novas imagens fictícias. Mantenha os links originais que estou fornecendo.
4. APENAS substitua ou adicione os cards de pacotes na div/grid que contém a classe "destinos-grid".

Aqui está o bloco de código HTML que deve ser inserido:

\`\`\`html
${cardsHTML}
\`\`\`

Obrigado!`;
}

