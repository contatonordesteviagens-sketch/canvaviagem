import type { FabricaState } from "@/hooks/useFabricaContext";
import { normalizeSiteTemplateId } from "@/lib/site-template-catalog";
import { getSiteTemplateCss } from "@/lib/site-template-css";
import { resolveFabricaCrmFormId } from "@/lib/fabrica-crm-publication";
import { createUniquePackageSlug, suggestPackageSegment } from "@/lib/package-details";

const SB_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SB_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const scriptJson = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

// Imagens premium padrão por destino (fallback quando o usuário não enviou foto)
const DEFAULT_DEST_IMG = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";

const sanitizeImageUrl = (value: unknown, fallback = DEFAULT_DEST_IMG) => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (/^data:image\/(?:png|jpe?g|webp|gif|avif);base64,[a-z0-9+/=\s]+$/i.test(raw)) {
    return raw.replace(/\s/g, "");
  }
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : fallback;
  } catch {
    return fallback;
  }
};

// Helpers de cor — gera tons mais escuros/claros pra header e gradientes
function hexToRgb(hex: string) {
  const rgbMatch = hex.trim().match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/i);
  if (rgbMatch) {
    return {
      r: Math.max(0, Math.min(255, Number(rgbMatch[1]))),
      g: Math.max(0, Math.min(255, Number(rgbMatch[2]))),
      b: Math.max(0, Math.min(255, Number(rgbMatch[3]))),
    };
  }
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(v, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const linearize = (value: number) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}
function contrastRatio(first: number, second: number) {
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}
function darken(hex: string, amount = 0.7) {
  const { r, g, b } = hexToRgb(hex);
  let factor = 1 - amount;
  let candidate = { r: Math.round(r * factor), g: Math.round(g * factor), b: Math.round(b * factor) };
  while (contrastRatio(relativeLuminance(candidate), 1) < 4.5 && factor > 0.05) {
    factor = Math.max(0.05, factor - 0.05);
    candidate = { r: Math.round(r * factor), g: Math.round(g * factor), b: Math.round(b * factor) };
  }
  return `rgb(${candidate.r}, ${candidate.g}, ${candidate.b})`;
}
function contrastText(hex: string) {
  const backgroundLuminance = relativeLuminance(hexToRgb(hex));
  const dark = "#111827";
  const darkRatio = contrastRatio(backgroundLuminance, relativeLuminance(hexToRgb(dark)));
  const lightRatio = contrastRatio(backgroundLuminance, 1);
  return darkRatio >= lightRatio ? dark : "#ffffff";
}

// Helper para estruturar o preço visualmente (como E-commerce)
function parsePriceHTML(priceStr: string): string {
  const s = esc(priceStr);
  // Captura Moeda + Valor (ex: $ 1.499,90)
  const regex = /^(.*?)(R\$|US\$|€|£|AR\$)\s?([\d.,]+)(.*)$/i;
  const m = s.match(regex);
  
  if (!m) return `<div class="price-main">${s}</div>`;

  const prefix = m[1]?.trim() || "";
  const symbol = m[2]?.trim() || "$";
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
  const projectId = resolveFabricaCrmFormId(state.projectId);
  const formId = projectId;
  const color = state.primaryColor || "#0F2742";
  const secondaryColor = state.secondaryColor || "#D4A853";
  const backgroundColor = state.backgroundColor || "#F4F6F9";
  const colorDark = darken(color, 0.45);
  const colorContrast = contrastText(color);
  const secondaryContrast = contrastText(secondaryColor);
  const backgroundContrast = contrastText(backgroundColor);
  const darkContrast = contrastText(colorDark);
  const rawWpp = (state.whatsapp || "").replace(/\D/g, "");
  // Usa o DDI salvo no estado (padrão Brasil +55)
  const dialCode = (state.whatsappDialCode || "55").replace(/\D/g, "");
  const wpp = rawWpp ? (rawWpp.startsWith(dialCode) ? rawWpp : `${dialCode}${rawWpp}`) : "";
  const sc = state.siteContent;
  const sectionBackgroundAttr = (key: string) => {
    const value = sc.sectionColors?.[key];
    const safeValue = value && /^#[0-9a-f]{6}$/i.test(value) ? value : "";
    return `data-site-section="${key}"${safeValue ? ` style="--section-bg:${safeValue};--section-contrast:${contrastText(safeValue)}"` : ""}`;
  };
  const templateId = normalizeSiteTemplateId(sc.templateId);
  const templateVariantCss = getSiteTemplateCss(templateId);
  const agencia = state.agencyName || "Agencia de Viajes";
  const cidade = state.city || "Brasil";
  const agencyEmail = state.agencyEmail || `contacto@${(agencia || "agencia").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  const socialIcons = renderSocialIcons(state);
  const footerSocialIcons = renderSocialIcons(state, "footer-socials");
  const logoUrl = sanitizeImageUrl(state.logoBase64, "");

  // ----- SISTEMA DE ANIMAÇÕES SAZONAIS E TEMÁTICAS -----
  let seasonalStyles = "";
  let seasonalScripts = "";

  if (sc.animationEffect === "neve") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes snowFall {
    0% { transform: translateY(-10vh) translateX(0) scale(0.5); opacity: 0; }
    20% { opacity: 0.8; }
    80% { opacity: 0.8; }
    100% { transform: translateY(110vh) translateX(20px) scale(1); opacity: 0; }
  }
  .snow-particle {
    position: fixed; top: -10px;
    background: white; border-radius: 50%;
    pointer-events: none; z-index: 2147483647;
    animation: snowFall linear forwards;
    filter: blur(1px);
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const snowInt = setInterval(() => {
      const s = document.createElement('div');
      s.className = 'snow-particle';
      const size = Math.random() * 4 + 2;
      s.style.width = size + 'px'; s.style.height = size + 'px';
      s.style.left = (Math.random() * window.innerWidth) + 'px';
      s.style.animationDuration = (Math.random() * 5 + 5) + 's';
      s.style.opacity = Math.random() * 0.5 + 0.3;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 10000);
    }, 200);
    if (dStr !== "always") setTimeout(() => clearInterval(snowInt), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "confete") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes confeteFall {
    0% { transform: translateY(-10vh) rotate(0deg) rotateX(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(110vh) rotate(360deg) rotateX(360deg); opacity: 0; }
  }
  .confete-particle {
    position: fixed; top: -10px; width: 8px; height: 16px;
    pointer-events: none; z-index: 2147483647;
    animation: confeteFall linear forwards;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const cInt = setInterval(() => {
      const c = document.createElement('div');
      c.className = 'confete-particle';
      c.style.left = (Math.random() * window.innerWidth) + 'px';
      c.style.background = ['var(--brand)', '#00e5a0', '#00b8ff', '#fcd34d', '#ff4b72'][Math.floor(Math.random()*5)];
      c.style.animationDuration = (Math.random() * 4 + 4) + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 9000);
    }, 150);
    if (dStr !== "always") setTimeout(() => clearInterval(cInt), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "junina_bandeiras") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  .junina-flags {
    position: fixed; top: 0; left: 0; right: 0; height: 30px;
    background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 L15,30 L30,0 Z" fill="%23ff4b72"/><path d="M30,0 L45,30 L60,0 Z" fill="%2300e5a0"/><path d="M60,0 L75,30 L90,0 Z" fill="%2300b8ff"/><path d="M90,0 L105,30 L120,0 Z" fill="%23fcd34d"/></svg>');
    background-size: 120px 30px; background-repeat: repeat-x;
    z-index: 2147483647; transform-origin: top center;
    animation: flagSwing 3s ease-in-out infinite alternate;
    pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }
  @keyframes flagSwing {
    0% { transform: perspective(500px) rotateX(10deg); }
    100% { transform: perspective(500px) rotateX(-10deg); }
  }
}
`;
    seasonalScripts = `
  const durationStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const flags = document.createElement('div');
    flags.className = 'junina-flags';
    document.body.appendChild(flags);
    if (durationStr !== "always") setTimeout(() => flags.remove(), parseInt(durationStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "natal_luzes") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  .natal-luzes {
    position: fixed; top: 0; left: 0; right: 0; height: 12px;
    z-index: 2147483647; pointer-events: none;
    background: radial-gradient(circle at 10px 6px, #ff4b72 4px, transparent 5px),
                radial-gradient(circle at 35px 6px, #00e5a0 4px, transparent 5px),
                radial-gradient(circle at 60px 6px, #00b8ff 4px, transparent 5px),
                radial-gradient(circle at 85px 6px, #fcd34d 4px, transparent 5px);
    background-size: 100px 12px;
    animation: twinkle 1.5s ease-in-out infinite alternate;
  }
  @keyframes twinkle {
    0% { opacity: 0.5; filter: drop-shadow(0 0 4px rgba(255,255,255,0.6)); }
    100% { opacity: 1; filter: drop-shadow(0 0 12px rgba(255,255,255,1)) drop-shadow(0 0 6px #fcd34d); }
  }
}
`;
    seasonalScripts = `
  const durationStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const lights = document.createElement('div');
    lights.className = 'natal-luzes';
    document.body.appendChild(lights);
    if (durationStr !== "always") setTimeout(() => lights.remove(), parseInt(durationStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "eco_folhas") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes leafFall {
    0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(110vh) translateX(50px) rotate(360deg); opacity: 0; }
  }
  .leaf-particle {
    position: fixed; top: -20px; width: 24px; height: 24px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232e8b57"><path d="M17,8 C17,8 15,2 9,2 C3,2 2,8 2,8 C2,8 4,14 10,14 C16,14 17,8 17,8 Z"/></svg>');
    background-size: contain; background-repeat: no-repeat;
    pointer-events: none; z-index: 2147483647;
    animation: leafFall linear forwards;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const lInt = setInterval(() => {
      const l = document.createElement('div');
      l.className = 'leaf-particle';
      l.style.left = (Math.random() * window.innerWidth) + 'px';
      const s = Math.random() * 0.6 + 0.5;
      l.style.transform = 'scale(' + s + ')';
      l.style.animationDuration = (Math.random() * 6 + 7) + 's';
      l.style.opacity = Math.random() * 0.4 + 0.6;
      document.body.appendChild(l);
      setTimeout(() => l.remove(), 14000);
    }, 400);
    if (dStr !== "always") setTimeout(() => clearInterval(lInt), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "praia_bolhas") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes bubbleRise {
    0% { transform: translateY(105vh) translateX(0) scale(0.5); opacity: 0; }
    20% { opacity: 0.5; }
    80% { opacity: 0.5; }
    100% { transform: translateY(-10vh) translateX(-30px) scale(1.2); opacity: 0; }
  }
  .bubble-particle {
    position: fixed; bottom: -20px;
    pointer-events: none; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.6);
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.1));
    z-index: 2147483647; animation: bubbleRise linear forwards;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const bInt = setInterval(() => {
      const b = document.createElement('div');
      b.className = 'bubble-particle';
      b.style.left = (Math.random() * window.innerWidth) + 'px';
      const s = Math.random() * 12 + 4;
      b.style.width = s + 'px'; b.style.height = s + 'px';
      b.style.animationDuration = (Math.random() * 6 + 6) + 's';
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 12000);
    }, 300);
    if (dStr !== "always") setTimeout(() => clearInterval(bInt), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "junina_baloes") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes baloesSobe {
    0% { transform: translateY(110vh) scale(0.8) rotate(-5deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-20vh) scale(1) rotate(5deg); opacity: 0; }
  }
  .f-balao {
    position: fixed; bottom: -100px; width: 40px; height: 60px;
    background-color: var(--brand); border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
    pointer-events: none; z-index: 2147483647;
    animation: baloesSobe 10s ease-in forwards;
    box-shadow: inset -5px -5px 10px rgba(0,0,0,0.2);
  }
  .f-balao::after {
    content: ''; position: absolute; bottom: -8px; left: 16px;
    border-left: 4px solid transparent; border-right: 4px solid transparent;
    border-bottom: 8px solid var(--brand);
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const colors = ['#ff4b72', '#00e5a0', '#00b8ff', '#fcd34d', 'var(--brand)'];
    const baloesInt = setInterval(() => {
      const b = document.createElement('div');
      b.className = 'f-balao';
      b.style.left = (Math.random() * window.innerWidth) + 'px';
      const c = colors[Math.floor(Math.random()*colors.length)];
      b.style.backgroundColor = c;
      b.style.setProperty('--brand', c); 
      b.style.animationDuration = (Math.random() * 4 + 8) + 's';
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 15000);
    }, 3000);
    if (dStr !== "always") setTimeout(() => clearInterval(baloesInt), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "junina_fagulhas") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes fagulha {
    0% { transform: translateY(100vh) translateX(0); opacity: 1; }
    100% { transform: translateY(0vh) translateX(30px); opacity: 0; }
  }
  .f-fagulha {
    position: fixed; bottom: -10px; width: 6px; height: 6px;
    background: #ffaa00; border-radius: 50%;
    box-shadow: 0 0 10px #ff4500, 0 0 20px #ff0000;
    pointer-events: none; z-index: 2147483647;
    animation: fagulha 4s ease-out forwards;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const fInt = setInterval(() => {
      const f = document.createElement('div');
      f.className = 'f-fagulha';
      f.style.left = (Math.random() * window.innerWidth) + 'px';
      f.style.animationDuration = (Math.random() * 3 + 2) + 's';
      document.body.appendChild(f);
      setTimeout(() => f.remove(), 6000);
    }, 150);
    if (dStr !== "always") setTimeout(() => clearInterval(fInt), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "natal_estrela") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes shootingStarFast {
    0% { transform: translate(120vw, -20vh) rotate(-45deg); opacity: 1; }
    100% { transform: translate(-20vw, 80vh) rotate(-45deg); opacity: 1; }
  }
  .f-estrela {
    position: fixed; width: 150px; height: 3px;
    background: linear-gradient(90deg, transparent, #fff);
    pointer-events: none; z-index: 2147483647;
    animation: shootingStarFast 4s linear infinite;
    box-shadow: 0 0 20px #fff;
  }
  .f-estrela::before {
    content: ''; position: absolute; right: -5px; top: -4px;
    width: 10px; height: 10px; background: #fff; border-radius: 50%;
    box-shadow: 0 0 20px 5px #fff;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const e = document.createElement('div');
    e.className = 'f-estrela';
    document.body.appendChild(e);
    if (dStr !== "always") setTimeout(() => e.remove(), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "reveillon_fogos") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes fogoExplode {
    0% { transform: scale(0.1); opacity: 1; }
    100% { transform: scale(3); opacity: 0; }
  }
  .f-fogo {
    position: fixed; border-radius: 50%; pointer-events: none; z-index: 2147483647;
    animation: fogoExplode 1.5s ease-out forwards;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const fgInt = setInterval(() => {
      const c = ['#fcd34d', '#ff4b72', '#00e5a0', '#00b8ff', 'var(--brand)'][Math.floor(Math.random()*5)];
      const fg = document.createElement('div');
      fg.className = 'f-fogo';
      const s = Math.random() * 100 + 50;
      fg.style.width = s + 'px'; fg.style.height = s + 'px';
      fg.style.left = (Math.random() * window.innerWidth) + 'px';
      fg.style.top = (Math.random() * (window.innerHeight/1.5)) + 'px';
      fg.style.background = \`radial-gradient(circle, \${c} 10%, transparent 50%)\`;
      document.body.appendChild(fg);
      setTimeout(() => fg.remove(), 2000);
    }, 600);
    if (dStr !== "always") setTimeout(() => clearInterval(fgInt), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "reveillon_poeira") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes poeiraRise {
    0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
  }
  .gold-particle {
    position: fixed; width: 4px; height: 4px; background: #d4af37;
    box-shadow: 0 0 6px #f9e596; border-radius: 50%;
    pointer-events: none; z-index: 2147483647;
    animation: poeiraRise linear forwards;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const pInt = setInterval(() => {
      const p = document.createElement('div');
      p.className = 'gold-particle';
      p.style.left = (Math.random() * window.innerWidth) + 'px';
      p.style.animationDuration = (Math.random() * 6 + 6) + 's';
      const scale = Math.random() * 0.8 + 0.4;
      p.style.transform = 'scale(' + scale + ')';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 12000);
    }, 250);
    if (dStr !== "always") setTimeout(() => clearInterval(pInt), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "carnaval_mascaras") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes confeteCai {
    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity: 1; }
  }
  .f-confete-carnaval {
    position: fixed; width: 10px; height: 20px;
    pointer-events: none; z-index: 2147483647;
    animation: confeteCai linear forwards;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const cInt = setInterval(() => {
      const c = document.createElement('div');
      c.className = 'f-confete-carnaval';
      c.style.left = (Math.random() * window.innerWidth) + 'px';
      c.style.backgroundColor = ['#ff0055', '#00ffaa', '#00aaff', '#ffdd00', 'var(--brand)'][Math.floor(Math.random()*5)];
      c.style.animationDuration = (Math.random() * 4 + 4) + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 9000);
    }, 200);
    if (dStr !== "always") setTimeout(() => clearInterval(cInt), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "pascoa_orelhas") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes orelhaSobe {
    0%, 100% { transform: translateY(100%); }
    20%, 80% { transform: translateY(0%); }
  }
  .f-orelhas {
    position: fixed; bottom: 0; right: 5%; width: 100px; height: 120px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><path d="M20,120 C20,60 10,10 30,10 C50,10 40,60 40,120 Z M60,120 C60,60 50,10 70,10 C90,10 80,60 80,120 Z" fill="%23fff" stroke="%23eee" stroke-width="2"/><path d="M25,120 C25,70 18,20 30,20 C42,20 35,70 35,120 Z M65,120 C65,70 58,20 70,20 C82,20 75,70 75,120 Z" fill="%23ff99aa"/></svg>');
    background-size: cover; pointer-events: none; z-index: 2147483647;
    animation: orelhaSobe 6s ease-in-out infinite; transform-origin: bottom;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const o = document.createElement('div');
    o.className = 'f-orelhas';
    document.body.appendChild(o);
    if (dStr !== "always") setTimeout(() => o.remove(), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "pascoa_pegadas") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes pegadaFade {
    0% { opacity: 0; transform: scale(0.5); }
    20% { opacity: 0.6; transform: scale(1); }
    80% { opacity: 0.6; }
    100% { opacity: 0; }
  }
  .f-pegada {
    position: fixed; width: 30px; height: 30px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><circle cx="15" cy="20" r="8" fill="%23fff"/><circle cx="7" cy="8" r="4" fill="%23fff"/><circle cx="15" cy="5" r="4" fill="%23fff"/><circle cx="23" cy="8" r="4" fill="%23fff"/></svg>');
    background-size: cover; pointer-events: none; z-index: 2147483647;
    animation: pegadaFade 3s ease-in-out forwards; filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const pgInt = setInterval(() => {
      const p = document.createElement('div');
      p.className = 'f-pegada';
      p.style.left = (Math.random() * window.innerWidth) + 'px';
      p.style.top = (Math.random() * window.innerHeight) + 'px';
      p.style.transform = \`rotate(\${Math.random() * 360}deg)\`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3500);
    }, 1500);
    if (dStr !== "always") setTimeout(() => clearInterval(pgInt), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "praia_ondas") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes ondaMove {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .f-onda {
    position: fixed; bottom: 0; left: 0; width: 200%; height: 60px;
    background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,60 C300,0 300,60 600,30 C900,0 900,60 1200,30 L1200,60 L0,60 Z" fill="rgba(0,184,255,0.2)"/></svg>');
    background-size: 50% 100%; pointer-events: none; z-index: 2147483647;
    animation: ondaMove 6s linear infinite;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const o = document.createElement('div');
    o.className = 'f-onda';
    document.body.appendChild(o);
    if (dStr !== "always") setTimeout(() => o.remove(), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "praia_sol") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes solGira {
    0% { transform: rotate(0deg); opacity: 0.5; }
    50% { opacity: 0.8; }
    100% { transform: rotate(360deg); opacity: 0.5; }
  }
  .f-sol {
    position: fixed; top: -150px; left: -150px; width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(255,230,0,0.5) 0%, rgba(255,230,0,0) 70%);
    pointer-events: none; z-index: 2147483647; mix-blend-mode: screen;
    animation: solGira 15s linear infinite;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const s = document.createElement('div');
    s.className = 'f-sol';
    document.body.appendChild(s);
    if (dStr !== "always") setTimeout(() => s.remove(), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "eco_borboletas") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes borboletaVoa {
    0% { transform: translate(0, 100vh) scale(0.5); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translate(100vw, -20vh) scale(1.5); opacity: 0; }
  }
  .f-borboleta {
    position: fixed; width: 30px; height: 30px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2300e5a0"><path d="M12,2 C12,2 10,8 4,10 C10,12 12,18 12,18 C12,18 14,12 20,10 C14,8 12,2 12,2 Z"/></svg>');
    background-size: cover; pointer-events: none; z-index: 2147483647;
    animation: borboletaVoa 8s ease-in-out forwards;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const bbInt = setInterval(() => {
      const b = document.createElement('div');
      b.className = 'f-borboleta';
      b.style.left = (Math.random() * window.innerWidth / 2) + 'px';
      b.style.animationDuration = (Math.random() * 4 + 6) + 's';
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 10000);
    }, 2500);
    if (dStr !== "always") setTimeout(() => clearInterval(bbInt), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "cruzeiro_navio") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes navioPassa {
    0% { transform: translateX(-200px); }
    100% { transform: translateX(120vw); }
  }
  .f-navio {
    position: fixed; bottom: 20px; left: 0; width: 120px; height: 60px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><path d="M10,40 L90,40 L100,20 L0,20 Z" fill="%23fff"/><rect x="20" y="10" width="60" height="10" fill="%23ddd"/><rect x="30" y="0" width="10" height="10" fill="%23ff4b72"/><rect x="60" y="0" width="10" height="10" fill="%23ff4b72"/></svg>');
    background-size: cover; pointer-events: none; z-index: 2147483647;
    animation: navioPassa 25s linear infinite;
    filter: drop-shadow(0 5px 5px rgba(0,0,0,0.2));
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const n = document.createElement('div');
    n.className = 'f-navio';
    document.body.appendChild(n);
    if (dStr !== "always") setTimeout(() => n.remove(), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "cruzeiro_gotas") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes gotaCai {
    0% { transform: translateY(-20px); opacity: 0; }
    20% { opacity: 0.8; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  .f-gota {
    position: fixed; top: 0; width: 4px; height: 15px;
    background: linear-gradient(to bottom, transparent, rgba(0,184,255,0.8));
    border-radius: 50%; pointer-events: none; z-index: 2147483647;
    animation: gotaCai 1.5s linear forwards;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const gtInt = setInterval(() => {
      const g = document.createElement('div');
      g.className = 'f-gota';
      g.style.left = (Math.random() * window.innerWidth) + 'px';
      g.style.animationDuration = (Math.random() * 1 + 1) + 's';
      document.body.appendChild(g);
      setTimeout(() => g.remove(), 3000);
    }, 150);
    if (dStr !== "always") setTimeout(() => clearInterval(gtInt), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "internacional_aviao") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes aviaoVoo {
    0% { transform: translate(-100px, 80vh) scale(0.5) rotate(20deg); }
    50% { transform: translate(50vw, 20vh) scale(1) rotate(0deg); }
    100% { transform: translate(120vw, 50vh) scale(0.5) rotate(40deg); }
  }
  .f-aviao {
    position: fixed; width: 60px; height: 60px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23fff"><path d="M2,12 L22,2 L15,22 L11,14 L2,12 Z"/></svg>');
    background-size: cover; pointer-events: none; z-index: 2147483647;
    animation: aviaoVoo 10s ease-in-out infinite;
    filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3));
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const a = document.createElement('div');
    a.className = 'f-aviao';
    document.body.appendChild(a);
    if (dStr !== "always") setTimeout(() => a.remove(), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "internacional_bussola") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes bussolaGira {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .f-bussola {
    position: fixed; bottom: 30px; right: 30px; width: 80px; height: 80px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="%23fff" stroke-width="4"/><path d="M50,10 L60,50 L50,90 L40,50 Z" fill="%23ff4b72"/><circle cx="50" cy="50" r="5" fill="%23fff"/></svg>');
    background-size: cover; pointer-events: none; z-index: 2147483647;
    animation: bussolaGira 25s linear infinite; opacity: 0.5;
    filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const bs = document.createElement('div');
    bs.className = 'f-bussola';
    document.body.appendChild(bs);
    if (dStr !== "always") setTimeout(() => bs.remove(), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "luxo_aurora") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes auroraMove {
    0% { transform: translateX(-10%); opacity: 0.3; }
    50% { opacity: 0.6; }
    100% { transform: translateX(10%); opacity: 0.3; }
  }
  .f-aurora {
    position: fixed; top: 0; left: -20%; width: 140%; height: 30vh;
    background: radial-gradient(ellipse at 50% -20%, rgba(138,43,226,0.3) 0%, rgba(0,255,128,0.1) 40%, transparent 70%);
    pointer-events: none; z-index: 2147483647; mix-blend-mode: screen;
    animation: auroraMove 15s alternate infinite ease-in-out;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const au = document.createElement('div');
    au.className = 'f-aurora';
    document.body.appendChild(au);
    if (dStr !== "always") setTimeout(() => au.remove(), parseInt(dStr) * 1000);
  }
`;
  } else if (sc.animationEffect === "luxo_reflexo") {
    seasonalStyles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes reflexoPassa {
    0% { transform: skewX(-20deg) translateX(-100vw); }
    20%, 100% { transform: skewX(-20deg) translateX(200vw); }
  }
  .f-reflexo {
    position: fixed; top: 0; bottom: 0; width: 150px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    pointer-events: none; z-index: 2147483647;
    animation: reflexoPassa 6s infinite;
  }
}
`;
    seasonalScripts = `
  const dStr = "${sc.animationDuration || 'always'}";
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const rx = document.createElement('div');
    rx.className = 'f-reflexo';
    document.body.appendChild(rx);
    if (dStr !== "always") setTimeout(() => rx.remove(), parseInt(dStr) * 1000);
  }
`;
  }

  const headline =
    sc.heroHeadline?.trim() || "Viajes que transforman para siempre";
  const subheadline =
    sc.heroSubheadline?.trim() ||
    `Itinerarios exclusivos y a medida para viajeros que no aceptan lo común. Desde la primera reunión hasta el regreso a casa, cuidamos cada detalle.`;

  const pacotes = state.selectedPackages.length
    ? state.selectedPackages.filter(p => !p.isDraft)
    : [
        { id: "1", title: "Itinerario a Medida", description: "Armamos tu itinerario ideal con alojamiento, transporte y tours.", price: "A consultar", imageUrl: "", ctaLabel: "Quiero este" },
      ];
  const visiblePackageCount = pacotes.reduce(
    (count, _package, index) => count + (sc.hiddenElements?.includes(`dest-card-${index}`) ? 0 : 1),
    0,
  );
  const sectionOrder = state.sectionOrder?.length
    ? state.sectionOrder
    : ["hero", "processo", "destinos", "porQue", "depoimentos", "orcamento", "faq"];

  const wppMsg = (titulo: string) =>
    wpp ? `https://wa.me/${wpp}?text=${encodeURIComponent(`¡Hola! Tengo interés en ${titulo}.`)}` : "#";

  const segmentLabels: Record<string, string> = {
    passeio: "Excursión / receptivo",
    pacote: "Paquete / emisivo",
    "sob-medida": "Viaje a medida",
    grupo: "Grupo / excursión",
    cruzeiro: "Crucero",
    aventura: "Aventura / ecoturismo",
    religioso: "Turismo religioso",
    corporativo: "Corporativo / evento",
    outro: "Experiencia",
  };
  const availabilityLabels: Record<string, string> = {
    disponivel: "Disponible",
    "ultimas-vagas": "Últimos lugares",
    "saida-confirmada": "Salida confirmada",
    "sob-consulta": "A consultar",
    "lista-de-espera": "Lista de espera",
    esgotado: "Agotado",
  };
  const usedPackageSlugs = new Set<string>();
  const packageDetailsJson = scriptJson(
    pacotes.map((p, index) => {
      const segment = p.segment || suggestPackageSegment(state.agencyType);
      const slug = createUniquePackageSlug(
        p.slug || p.title || "paquete",
        usedPackageSlugs,
        String(p.id || index + 1),
      );
      usedPackageSlugs.add(slug);
      const packageFaq = (p.faq || [])
        .filter((item) => item.question?.trim() && item.answer?.trim())
        .map((item) => ({ question: item.question.trim(), answer: item.answer.trim() }));
      const globalFaq = (sc.faq || []).slice(0, 4).map((item) => ({ question: item.q, answer: item.a }));
      const galleryImages = Array.from(new Set(
        [p.imageUrl, ...(p.galleryImages || [])]
          .map((url) => sanitizeImageUrl(url, ""))
          .filter(Boolean),
      )).slice(0, 5);

      return {
        id: String(p.id || index + 1),
        slug,
        title: p.title || "Paquete de viaje",
        subtitle: p.subtitle || "",
        description: p.longDescription || p.description || "Habla con la agencia para conocer todos los detalles de esta experiencia.",
        price: p.price || "A consultar",
        priceDetails: p.priceDetails || "",
        paymentTerms: p.paymentTerms || "",
        imageUrl: sanitizeImageUrl(p.imageUrl),
        galleryImages,
        category: segmentLabels[segment] || "Experiencia",
        availability: availabilityLabels[p.availability || ""] || "",
        travelDates: p.travelDates || "",
        duration: p.duration || "",
        departureLocation: p.departureLocation || "",
        meetingPoint: p.meetingPoint || "",
        accommodation: p.accommodation || "",
        highlights: p.highlights || [],
        included: p.included || [],
        notIncluded: p.notIncluded || [],
        itinerary: p.itinerary || [],
        requirements: p.requirements || [],
        documents: p.documents || [],
        accessibility: p.accessibility || [],
        cancellationPolicy: p.cancellationPolicy || "",
        importantNotes: p.importantNotes || "",
        agencyName: agencia,
        agencyEmail,
        agencyPhone: state.whatsapp || "—",
        agencyLocation: state.address?.trim() || cidade,
        faq: packageFaq.length ? packageFaq : globalFaq,
      };
    }),
  );

  // Stats default (a agência pode editar depois). Usamos números crescentes para autoridade.
  const stats = [
    { num: "12+", label: "Años de Experiencia" },
    { num: "15k+", label: "Viajeros Felices" },
    { num: "25", label: "Países Atendidos" },
    { num: "99%", label: "Satisfacción" },
  ];

  // Avatar com inicial — gera SVG inline pra não depender de rede
  const avatarSvg = (nome: string, bg: string) => {
    const initial = (nome || "?").trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='${bg}'/><text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='32' font-weight='700' fill='white'>${initial}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const heroImg = sanitizeImageUrl(
    sc.heroImageUrl || sc.galleryImages?.[0],
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
  );
  const aboutImg = sanitizeImageUrl(
    sc.aboutImageUrl,
    "https://img.freepik.com/fotos-gratis/voce-esta-pronto-para-suas-ferias-representante-de-vendas-dando-passaportes-e-passagens-de-aviao-para-uma-jovem-e-um-homem-para-sua-viagem-de-ferias-na-agencia-de-viagens_662251-2215.jpg?semt=ais_hybrid&w=740&q=80",
  );

  const quoteFormHtml = `<form class="orc-form" onsubmit="handleMainFormSubmit(event)">
        <div class="form-row">
          <div class="field"><label for="quote-name">Nombre completo</label><input id="quote-name" name="nome" autocomplete="name" required placeholder="Ej: Maria Silva"></div>
          <div class="field"><label for="quote-phone">WhatsApp</label><input id="quote-phone" type="tel" name="wpp" autocomplete="tel" required placeholder="(00) 00000-0000"></div>
        </div>
        <div class="form-row single">
          <div class="field"><label for="quote-email">E-mail</label><input id="quote-email" type="email" name="email" autocomplete="email" required placeholder="tu@email.com"></div>
        </div>
        <div class="form-row">
          <div class="field"><label for="quote-destination">Destino de interés</label><select id="quote-destination" name="destino"><option value="">Seleccionar…</option>${pacotes.map((p) => `<option>${esc(p.title)}</option>`).join("")}<option>Otro / a medida</option></select></div>
          <div class="field"><label for="quote-travelers">Nº de viajeros</label><input id="quote-travelers" type="number" name="viaj" min="1" value="2"></div>
        </div>
        <div class="form-row">
          <div class="field"><label for="quote-departure">Fecha de ida</label><input id="quote-departure" type="date" name="ida"></div>
          <div class="field"><label for="quote-return">Fecha de regreso</label><input id="quote-return" type="date" name="volta"></div>
        </div>
        <div class="form-row single">
          <div class="field"><label for="quote-notes">Observaciones (opcional)</label><textarea id="quote-notes" name="obs" placeholder="Preferencias, ocasión especial, presupuesto…"></textarea></div>
        </div>
        <button type="submit" class="btn form-submit">💬 Enviar por WhatsApp</button>
      </form>`;
  
  const cleanPixelId = state.metaPixelId ? state.metaPixelId.replace(/\D/g, '') : '';
  const pixelCode = cleanPixelId ? `
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${cleanPixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${cleanPixelId}&ev=PageView&noscript=1" /></noscript>
<!-- End Meta Pixel Code -->` : "";

  const rawGa4 = state.ga4Id || "";
  const matchGa4 = rawGa4.match(/G-[A-Z0-9]+/i);
  const cleanGa4Id = matchGa4 ? matchGa4[0].toUpperCase() : "";

  const ga4Code = cleanGa4Id ? `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${cleanGa4Id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${cleanGa4Id}');
</script>` : "";

  return `<!DOCTYPE html>
<html lang="es-ES">
<head>
${pixelCode}
${ga4Code}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(agencia)} — Consultoría Premium de Viajes</title>
<meta name="description" content="${esc(subheadline)}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@400;600;700;800&family=Playfair+Display:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
${templateVariantCss}
*{margin:0;padding:0;box-sizing:border-box}
:root{--brand:${color};--brand-dark:${colorDark};--brand-secondary:${secondaryColor};--brand-bg:${backgroundColor};--brand-contrast:${colorContrast};--secondary-contrast:${secondaryContrast};--background-contrast:${backgroundContrast};--brand-dark-contrast:${darkContrast};--brand-ink:${backgroundContrast};--ink:#0a0a0b;--muted:#5a6470;--soft:${backgroundColor}}
html{scroll-behavior:smooth;overflow-x:clip}
body{font-family:'Inter',sans-serif;color:var(--ink);background:var(--brand-bg);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
[data-site-section][style*="--section-bg"]{background:var(--section-bg)!important;color:var(--section-contrast)!important}
[data-site-section][style*="--section-bg"]>.container>:is(.section-title,.section-eyebrow,.eyebrow,h1,h2,h3,p){color:var(--section-contrast)!important}
.site-header[style*="--section-bg"] :is(.brand-name,.nav-links a:not(.nav-cta)){color:var(--section-contrast)!important}
.site-header[style*="--section-bg"] .nav-toggle span{background:var(--section-contrast)!important}
.hero[style*="--section-bg"] :is(.hero-content,.hero-content h1,.hero-content .lead,.hero-content .eyebrow,.stat-num,.stat-label){color:var(--section-contrast)!important}
#por-que[style*="--section-bg"] :is(.equipe-left>h2,.equipe-left>.eyebrow,.equipe-left>.intro,.feat h4,.feat p){color:var(--section-contrast)!important}
#orcamento[style*="--section-bg"] :is(.orc-info>h2,.orc-info>p,.orc-info>.eyebrow){color:var(--section-contrast)!important}
footer[style*="--section-bg"] :is(.foot-brand,.foot-grid>div>p,h4,li,li>a:not(.social-icon),.foot-bottom){color:var(--section-contrast)!important}
h1,h2,h3,h4{font-family:'Playfair Display',serif;letter-spacing:-0.02em;line-height:1.15;color:var(--ink)}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
.container{max-width:1180px;margin:0 auto;padding:0 24px}
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--brand);color:var(--brand-contrast);padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;transition:all .25s;border:none;cursor:pointer;font-family:'Inter',sans-serif}
.btn:hover{background:var(--brand-dark);color:var(--brand-dark-contrast);transform:translateY(-1px);box-shadow:0 12px 30px rgba(0,0,0,.18)}
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
.brand-dot{width:36px;height:36px;border-radius:8px;background:var(--brand);display:flex;align-items:center;justify-content:center;color:var(--brand-contrast);font-weight:800;font-size:16px}
.brand-name{font-weight:700;font-size:16px}
.nav-links{display:flex;gap:24px;align-items:center}
.nav-links a{font-size:14px;color:var(--muted);font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--ink)}
.nav-cta{padding:10px 18px;background:var(--brand);color:var(--brand-contrast) !important;border-radius:8px;font-weight:600}
.nav-cta:hover{background:var(--brand-dark);color:var(--brand-dark-contrast) !important}
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
.stats-bar{display:flex;flex-wrap:wrap;justify-content:center;gap:32px;margin-top:64px;padding:48px 24px;background:linear-gradient(rgba(15,39,66,0.85),rgba(15,39,66,0.85)),url("${heroImg}") center/cover;border-radius:16px;position:relative;z-index:1;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,0.2)}
.stats-bar > div{flex:1 1 180px;max-width:250px;}
.stat-num{font-family:'Playfair Display',serif;font-size:42px;font-weight:800;color:#fff;line-height:1}
.stat-label{font-size:12px;text-transform:uppercase;letter-spacing:1.5px;opacity:.7;margin-top:6px}
@media(max-width:640px){
  .hero{padding:44px 0 40px}
  .hero-content{padding:24px 20px;border-radius:18px}
  .hero-actions{flex-direction:column;gap:8px}
  .hero-actions .btn{width:100%;justify-content:center}
  .stats-bar{gap:32px 16px;margin-top:40px;padding:32px 16px}
  .stats-bar > div{flex:1 1 120px;max-width:100%;}
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
.proc-num{width:52px;height:52px;border-radius:50%;background:var(--brand);color:var(--brand-contrast);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:22px;font-weight:700;margin-bottom:20px}
.proc-card h3{font-size:22px;margin-bottom:12px}
.proc-card p{color:var(--muted);font-size:15px;line-height:1.7}
@media(max-width:840px){.proc-grid{grid-template-columns:1fr;gap:16px}.proc-card{padding:28px 22px}}

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
.equipe-left .badge-counter{display:inline-block;background:var(--brand);color:var(--brand-contrast);padding:8px 18px;border-radius:50px;font-weight:700;font-size:14px;margin-bottom:24px}
.equipe-left h2{font-size:clamp(28px,3.8vw,44px);margin-bottom:24px;color:#fff}
.equipe-left p.intro{font-size:16px;opacity:.75;line-height:1.8;margin-bottom:32px}
.equipe-features{display:grid;gap:20px;margin-bottom:36px}
.feat{display:flex;gap:14px;align-items:flex-start}
.feat-icon{flex-shrink:0;width:42px;height:42px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:18px}
.feat h4{font-family:'Inter',sans-serif;font-size:15px;font-weight:600;color:#fff;margin-bottom:4px}
.feat p{font-size:14px;opacity:.65;line-height:1.6}
.equipe-img{width:100%;aspect-ratio:4/5;border-radius:20px;overflow:hidden;background:url("https://img.freepik.com/fotos-gratis/voce-esta-pronto-para-suas-ferias-representante-de-vendas-dando-passaportes-e-passagens-de-aviao-para-uma-jovem-e-um-homem-para-sua-viagem-de-ferias-na-agencia-de-viagens_662251-2215.jpg?semt=ais_hybrid&w=740&q=80") center/cover}
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
.contact-icon{width:40px;height:40px;border-radius:10px;background:var(--brand);color:var(--brand-contrast);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
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
.foot-grid{display:grid;grid-template-columns:2fr 1fr 1.2fr;gap:48px;margin-bottom:48px}
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
.modal-icon{width:64px;height:64px;background:var(--brand);color:var(--brand-contrast);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 16px;box-shadow:0 12px 24px rgba(0,0,0,.1)}
body.lead-modal-open{overflow:hidden}
.modal-header h3{font-size:24px;margin-bottom:8px;font-family:'Playfair Display',serif}
.modal-header p{font-size:14px;color:var(--muted)}
.modal-form{display:grid;gap:16px}
.modal-form .field label{margin-bottom:6px}
.modal-form input{border-color:rgba(0,0,0,.12)}
.modal-submit{width:100%;justify-content:center;gap:10px;margin-top:8px}
.package-reservation-only .orc-grid{grid-template-columns:minmax(0,720px);justify-content:center}

/* DETALLES DEL PAQUETE */
body.package-modal-open{overflow:hidden}
#package-modal{position:fixed;inset:0;z-index:9998;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(12,17,14,.78);backdrop-filter:blur(10px)}
#package-modal.active{display:flex}
.package-sheet{position:relative;display:grid;grid-template-columns:minmax(300px,.9fr) minmax(360px,1.1fr);grid-template-rows:minmax(0,1fr);width:min(1120px,100%);height:min(780px,calc(100vh - 48px));max-height:calc(100vh - 48px);overflow:hidden;border-radius:28px;background:#fbfcfa;color:var(--ink);box-shadow:0 32px 90px rgba(10,18,13,.36)}
.package-not-found{grid-column:1/-1;display:grid;place-content:center;justify-items:center;min-height:100%;padding:clamp(44px,8vw,96px);text-align:center;background:linear-gradient(145deg,#fbfcfa,var(--soft))}
.package-not-found[hidden]{display:none}
.package-not-found-mark{display:grid;place-items:center;width:64px;height:64px;margin-bottom:22px;border-radius:20px;background:var(--brand);color:var(--brand-contrast);font-size:28px;font-weight:900}
.package-not-found h2{max-width:620px;margin:0 0 12px;font-size:clamp(30px,5vw,52px);line-height:1.05}
.package-not-found p{max-width:560px;margin:0 0 26px;color:var(--muted);font-size:16px;line-height:1.65}
.package-media{position:relative;min-height:0;height:100%;background:var(--soft);overflow:hidden}
.package-media::after{content:"";position:absolute;inset:50% 0 0;background:linear-gradient(180deg,transparent,rgba(10,16,12,.64))}
.package-media img{width:100%;height:100%;object-fit:cover}
.package-category{position:absolute;top:24px;left:24px;z-index:1;max-width:calc(100% - 48px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-radius:999px;background:var(--brand-secondary);color:var(--secondary-contrast);padding:9px 15px;font-size:11px;font-weight:800;line-height:1;text-transform:uppercase;letter-spacing:.12em}
.package-agency-on-image{position:absolute;z-index:1;left:28px;right:28px;bottom:28px;color:#f8faf7}
.package-agency-on-image strong{display:block;font-size:17px;margin-bottom:4px}
.package-agency-on-image span{font-size:13px;color:rgba(248,250,247,.78)}
.package-content{min-height:0;overflow-y:auto;padding:clamp(34px,5vw,58px)}
.package-close{position:absolute;z-index:4;top:18px;right:18px;width:44px;height:44px;border:1px solid rgba(23,27,24,.12);border-radius:50%;background:#f7f9f6;color:#202620;font-size:25px;line-height:1;cursor:pointer;box-shadow:0 8px 22px rgba(12,17,14,.12)}
.package-close:hover,.package-close:focus-visible{background:var(--brand);color:var(--brand-contrast);outline:3px solid color-mix(in srgb,var(--brand) 26%,transparent)}
.package-location{color:var(--brand);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.15em;margin-bottom:12px}
.package-location:empty{display:none}
.package-content h2{font-size:clamp(30px,4vw,48px);line-height:1.05;margin:0 48px 18px 0}
.package-subtitle{font-size:17px;font-weight:700;line-height:1.5;margin:-7px 0 14px;color:var(--ink)}
.package-subtitle:empty{display:none}
.package-description{color:var(--muted);font-size:16px;line-height:1.75;margin-bottom:24px}
.package-gallery{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:-8px 0 24px}
.package-gallery button{min-width:44px;min-height:44px;aspect-ratio:1;border:2px solid transparent;border-radius:10px;overflow:hidden;padding:0;background:var(--soft);cursor:pointer}
.package-gallery button.active{border-color:var(--brand)}
.package-gallery img{width:100%;height:100%;object-fit:cover}
.package-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:20px 0 24px}
.package-fact{min-width:0;border:1px solid rgba(23,27,24,.1);border-radius:13px;background:var(--soft);padding:13px 14px}
.package-fact span{display:block;color:var(--muted);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px}
.package-fact strong{display:block;font-family:'Inter',sans-serif;font-size:14px;line-height:1.45;overflow-wrap:anywhere}
.package-price-row{display:flex;align-items:baseline;justify-content:space-between;gap:20px;padding:20px 0;border-top:1px solid rgba(23,27,24,.12);border-bottom:1px solid rgba(23,27,24,.12)}
.package-price-row span{color:var(--muted);font-size:13px}
.package-price-row strong{font-size:22px;color:var(--ink);text-align:right}
.package-contact{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:24px 0;border-bottom:1px solid rgba(23,27,24,.12)}
.package-contact h3,.package-faq h3,.package-detail-section h3{font-family:'Inter',sans-serif;font-size:13px;text-transform:uppercase;letter-spacing:.12em;margin-bottom:10px}
.package-contact p{color:var(--muted);font-size:14px;line-height:1.65;overflow-wrap:anywhere}
.package-detail-section{padding:22px 0;border-bottom:1px solid rgba(23,27,24,.1)}
.package-detail-section p{color:var(--muted);font-size:14px;line-height:1.7;white-space:pre-line}
.package-detail-list{display:grid;gap:9px;list-style:none;margin:0;padding:0}
.package-detail-list li{position:relative;padding-left:22px;color:var(--muted);font-size:14px;line-height:1.55}
.package-detail-list li::before{content:"✓";position:absolute;left:0;top:0;color:var(--brand);font-weight:900}
.package-detail-section[data-list-style="minus"] .package-detail-list li::before{content:"–";color:#a33}
.package-detail-section[data-list-style="number"]{counter-reset:package-step}
.package-detail-section[data-list-style="number"] .package-detail-list li{counter-increment:package-step;padding-left:32px}
.package-detail-section[data-list-style="number"] .package-detail-list li::before{content:counter(package-step);display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--brand);color:var(--brand-contrast);font-size:11px;line-height:1}
.package-faq{padding:24px 0 8px}
.package-faq details{border-bottom:1px solid rgba(23,27,24,.1);padding:12px 0}
.package-faq summary{display:flex;align-items:center;justify-content:space-between;gap:16px;cursor:pointer;font-size:14px;font-weight:700;list-style:none}
.package-faq summary::-webkit-details-marker{display:none}
.package-faq summary::after{content:"+";font-size:20px;color:var(--brand)}
.package-faq details[open] summary::after{content:"−"}
.package-faq details p{padding:10px 30px 0 0;color:var(--muted);font-size:14px;line-height:1.6}
.package-reserve{width:100%;justify-content:center;margin-top:24px}
.package-note{text-align:center;color:var(--muted);font-size:12px;margin-top:10px}
@media(max-width:800px){
  #package-modal{padding:0;align-items:stretch}
  .package-sheet{display:block;width:100%;height:100dvh;max-height:100dvh;border-radius:0;overflow-y:auto}
  .package-media{min-height:34vh;height:34vh}
  .package-content{overflow:visible;padding:30px 18px calc(36px + env(safe-area-inset-bottom))}
  .package-close{position:fixed;top:max(12px,env(safe-area-inset-top));right:14px}
  .package-contact{grid-template-columns:1fr}
  .package-facts{grid-template-columns:1fr}
  .package-gallery{grid-template-columns:repeat(4,minmax(0,1fr))}
}
${seasonalStyles}
</style>
</head>
<body class="template-${templateId}" data-site-template="${templateId}">
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
<header class="site-header" ${sectionBackgroundAttr("header")}>
  <div class="container nav-wrap">
    <a href="#" class="brand">
      ${logoUrl
        ? `<img src="${esc(logoUrl)}" alt="${esc(agencia)}" class="brand-logo" data-ai-ignore="true" data-preserve-image="true"><span class="brand-name">${esc(agencia)}</span>`
        : `<span class="brand-dot">${esc(agencia.charAt(0).toUpperCase())}</span><span class="brand-name">${esc(agencia)}</span>`}
    </a>
    <button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="site-nav-links" onclick="toggleMobileMenu(this)">
      <span></span><span></span><span></span>
    </button>
    <nav id="site-nav-links" class="nav-links">
      <a href="#inicio">Inicio</a>
      <a href="#destinos">Destinos</a>
      <a href="#por-que">Por Qué Nosotros</a>
      <a href="#orcamento">Presupuesto</a>
      <a href="#" onclick="openLeadForm('WhatsApp Geral', 'https://wa.me/${wpp}');return false;" class="nav-cta">WhatsApp</a>
    </nav>
  </div>
</header>

${sectionOrder
  .map((secKey) => {
    if (secKey === "hero") {
      return sc.sections?.hero === false ? "" : `
<!-- HERO -->
<section id="inicio" class="hero" data-visual-removable="hero-section" ${sectionBackgroundAttr("hero")}>
  <div class="container">
    ${!sc.hiddenElements?.includes('hero-content') ? `
    <div class="hero-grid" data-visual-removable="hero-content">
      <div class="hero-content">
        ${!sc.hiddenElements?.includes('hero-eyebrow') ? `<span class="eyebrow" data-visual-removable="hero-eyebrow">Consultoría Premium de Viajes</span>` : ''}
        ${!sc.hiddenElements?.includes('hero-headline') ? `<h1 data-visual-removable="hero-headline">${esc(headline)}</h1>` : ''}
        ${!sc.hiddenElements?.includes('hero-sub') ? `<p class="lead" data-visual-removable="hero-sub">${esc(subheadline)}</p>` : ''}
        <div class="hero-actions">
          ${!sc.hiddenElements?.includes('hero-cta-1') ? `<a href="#orcamento" class="btn" data-visual-removable="hero-cta-1">${esc(sc.heroCtaLabel || "Solicitar Mi Itinerario")}</a>` : ''}
          ${!sc.hiddenElements?.includes('hero-cta-2') ? `<a href="#destinos" class="btn btn-outline" data-visual-removable="hero-cta-2">Ver Destinos</a>` : ''}
        </div>
      </div>
    </div>
    ` : ''}
    ${stats.some((s, i) => !sc.hiddenElements?.includes(`stat-${i}`)) ? `
    <div class="stats-bar">
      ${stats.map((s, i) => !sc.hiddenElements?.includes(`stat-${i}`) ? `<div data-visual-removable="stat-${i}"><div class="stat-num">${esc(s.num)}</div><div class="stat-label">${esc(s.label)}</div></div>` : '').join("")}
    </div>
    ` : ''}
  </div>
</section>`;
    }
    if (secKey === "processo") {
      return sc.sections?.processo === false ? "" : `
<!-- PROCESSO -->
<section class="processo" id="processo" data-visual-removable="processo-section" ${sectionBackgroundAttr("processo")}>
  <div class="container">
    ${!sc.hiddenElements?.includes('processo-eyebrow') ? `<div class="section-eyebrow eyebrow" data-visual-removable="processo-eyebrow">Proceso</div>` : ''}
    ${!sc.hiddenElements?.includes('processo-title') ? `<h2 class="section-title" data-visual-removable="processo-title">Tu viaje de ensueño en 3 pasos</h2>` : ''}
    <div class="proc-grid">
      ${!sc.hiddenElements?.includes('proc-step-0') ? `<div class="proc-card" data-visual-removable="proc-step-0"><div class="proc-num">1</div><h3>Consulta Personalizada</h3><p>Entendemos tus sueños, fechas, presupuesto y estilo en una charla de 30 minutos sin compromiso.</p></div>` : ''}
      ${!sc.hiddenElements?.includes('proc-step-1') ? `<div class="proc-card" data-visual-removable="proc-step-1"><div class="proc-num">2</div><h3>Curaduría Exclusiva</h3><p>Creamos un itinerario 100% personalizado com los mejores hoteles, tours y experiencias para tu perfil.</p></div>` : ''}
      ${!sc.hiddenElements?.includes('proc-step-2') ? `<div class="proc-card" data-visual-removable="proc-step-2"><div class="proc-num">3</div><h3>Embarque Tranquilo</h3><p>Nos encargamos de vuelos, alojamiento, traslados y soporte 24h durante todo tu viaje.</p></div>` : ''}
    </div>
  </div>
</section>`;
    }
    if (secKey === "destinos") {
      return sc.sections?.destinos === false ? "" : `
<!-- DESTINOS -->
<section id="destinos" ${sectionBackgroundAttr("destinos")}>
  <div class="container">
    <div class="section-eyebrow eyebrow">Destinos</div>
    <h2 class="section-title">${esc(sc.pacotesTitle || "Experiencias que quedan en la memoria")}</h2>
    <div class="destinos-grid" data-package-count="${visiblePackageCount}">
      ${pacotes
        .map(
          (p, i) => !sc.hiddenElements?.includes(`dest-card-${i}`) ? `<a href="#paquete-${esc(String(p.id || i + 1))}" onclick="openPackageDetails(${i}, this);return false;" class="dest-card" data-package-index="${i}" data-package-id="${esc(String(p.id || i + 1))}" data-visual-removable="dest-card-${i}" aria-haspopup="dialog" aria-label="Ver detalles de ${esc(p.title)}">
        <div class="dest-img-wrap">
          <img src="${esc(sanitizeImageUrl(p.imageUrl))}" alt="${esc(p.title)}" loading="lazy" data-ai-ignore="true" data-preserve-image="true">
          <span class="dest-tag">${esc(p.title.split(" ")[0] || "Destino")}</span>
          <div class="dest-overlay">Ver paquete →</div>
        </div>
        <div class="dest-body">
          <div class="dest-loc">${esc(cidade)}</div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          <div class="dest-price">${parsePriceHTML(p.price)}</div>
          <span class="dest-cta">Saber más →</span>
        </div>
      </a>` : ''
        )
        .join("")}
    </div>
  </div>
</section>`;
    }
    if (secKey === "porQue") {
      return sc.sections?.porQue === false ? "" : `
<!-- POR QUE NÓS / EQUIPE -->
<section id="por-que" class="equipe" ${sectionBackgroundAttr("porQue")}>
  <div class="container">
    <div class="equipe-grid" data-visual-removable="por-que-grid">
      <div class="equipe-left">
        ${!sc.hiddenElements?.includes('equipe-badge') ? `<span class="badge-counter" data-visual-removable="equipe-badge">+15k Clientes Satisfechos</span>` : ''}
        ${!sc.hiddenElements?.includes('equipe-eyebrow') ? `<div class="eyebrow" style="color:#fff;opacity:.6" data-visual-removable="equipe-eyebrow">Nuestro equipo</div>` : ''}
        ${!sc.hiddenElements?.includes('equipe-title') ? `<h2 data-visual-removable="equipe-title">Un equipo dedicado exclusivamente a ti</h2>` : ''}
        ${!sc.hiddenElements?.includes('equipe-intro') ? `<p class="intro" data-visual-removable="equipe-intro">Cada viaje comienza con una conversación real. Nuestro equipo de expertos conoce los destinos de cerca — cada detalle pensado para tu perfil, tus sueños y tu momento.</p>` : ''}
        <div class="equipe-features">
          ${!sc.hiddenElements?.includes('equipe-feat-0') ? `<div class="feat" data-visual-removable="equipe-feat-0"><div class="feat-icon">🛡️</div><div><h4>Seguridad y Confiabilidad</h4><p>Años de experiencia con miles de familias y socios verificados en todo el mundo.</p></div></div>` : ''}
          ${!sc.hiddenElements?.includes('equipe-feat-1') ? `<div class="feat" data-visual-removable="equipe-feat-1"><div class="feat-icon">📞</div><div><h4>Soporte 24h Durante el Viaje</h4><p>Nuestro equipo está disponible a cualquier hora. Cualquier imprevisto, lo resolvemos.</p></div></div>` : ''}
          ${!sc.hiddenElements?.includes('equipe-feat-2') ? `<div class="feat" data-visual-removable="equipe-feat-2"><div class="feat-icon">✨</div><div><h4>Experiencias Exclusivas</h4><p>Acceso a hoteles y experiencias no disponibles para el público en general.</p></div></div>` : ''}
          ${!sc.hiddenElements?.includes('equipe-feat-3') ? `<div class="feat" data-visual-removable="equipe-feat-3"><div class="feat-icon">💰</div><div><h4>Mejor Relación Calidad-Precio</h4><p>Nuestra red de socios ofrece condiciones especiales que no encontrarás en otros lugares.</p></div></div>` : ''}
        </div>
        ${!sc.hiddenElements?.includes('equipe-cta') ? `<a href="#" onclick="openLeadForm('Falar com Especialista', 'https://wa.me/${wpp}');return false;" class="btn" data-visual-removable="equipe-cta">Hablar con un experto</a>` : ''}
      </div>
      <div class="equipe-img" style="background-image: url('${esc(aboutImg)}')"></div>
    </div>
  </div>
</section>`;
    }
    if (secKey === "depoimentos") {
      return sc.sections?.depoimentos !== false && state.depoimentos.length > 0
        ? `
<!-- DEPOIMENTOS -->
<section class="depo-bg" ${sectionBackgroundAttr("depoimentos")}>
  <div class="container">
    <div class="section-eyebrow eyebrow">Testimonios</div>
    <h2 class="section-title">${esc(sc.depoimentosTitle || "Lo que dicen nuestros viajeros")}</h2>
    <div class="depo-grid">
      ${state.depoimentos
        .slice(0, 3)
        .map(
          (d, i) => !sc.hiddenElements?.includes(`depo-${i}`) ? `<div class="depo-card" data-visual-removable="depo-${i}">
        <div class="stars">★★★★★</div>
        <p class="depo-text">"${esc(d.text)}"</p>
        <div class="depo-author">
          <img src="${avatarSvg(d.name, color)}" class="depo-avatar" alt="${esc(d.name)}" data-ai-ignore="true" data-preserve-image="true">
          <div><div class="depo-name">${esc(d.name)}</div><div class="depo-meta">Cliente verificado</div></div>
        </div>
      </div>` : ''
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
<section id="orcamento" ${sectionBackgroundAttr("orcamento")}>
  <div class="container">
    <div class="orc-grid">
      <div class="orc-info">
        ${!sc.hiddenElements?.includes('orcamento-eyebrow') ? `<span class="eyebrow" data-visual-removable="orcamento-eyebrow">Presupuesto</span>` : ''}
        ${!sc.hiddenElements?.includes('orcamento-title') ? `<h2 style="margin-top:12px" data-visual-removable="orcamento-title">Habla con un consultor ahora</h2>` : ''}
        ${!sc.hiddenElements?.includes('orcamento-text') ? `<p data-visual-removable="orcamento-text">Completa el formulario y nuestro equipo te contactará en menos de 2 horas con una propuesta.</p>` : ''}
        <div class="contact-list">
          ${!sc.hiddenElements?.includes("contact-wpp") ? `<div class="contact-item" data-visual-removable="contact-wpp"><div class="contact-icon">💬</div><div><strong>WhatsApp</strong><span>${esc(state.whatsapp || "—")}</span></div></div>` : ''}
          ${!sc.hiddenElements?.includes("contact-email") ? `<div class="contact-item" data-visual-removable="contact-email"><div class="contact-icon">✉</div><div><strong>E-mail</strong><span>${esc(agencyEmail)}</span></div></div>` : ''}
          ${!sc.hiddenElements?.includes("contact-hours") ? `<div class="contact-item" data-visual-removable="contact-hours"><div class="contact-icon">🕐</div><div><strong>Atendimento</strong><span>Lun–Vie 8h–20h · Sáb 9h–15h</span></div></div>` : ''}
          ${!sc.hiddenElements?.includes("contact-location") ? `<div class="contact-item" data-visual-removable="contact-location"><div class="contact-icon">📍</div><div><strong>Localização</strong><span>${esc(cidade)}</span></div></div>` : ''}
        </div>
        ${socialIcons}
      </div>
      ${quoteFormHtml}
    </div>
  </div>
</section>`;
    }
    if (secKey === "faq") {
      return sc.sections?.faq !== false && sc.faq && sc.faq.length > 0
        ? `
<!-- FAQ -->
<section id="faq" ${sectionBackgroundAttr("faq")}>
  <div class="container">
    ${!sc.hiddenElements?.includes('faq-eyebrow') ? `<div class="section-eyebrow eyebrow" data-visual-removable="faq-eyebrow">Dudas</div>` : ''}
    ${!sc.hiddenElements?.includes('faq-title') ? `<h2 class="section-title" data-visual-removable="faq-title">${esc(sc.faqTitle || "Preguntas Frecuentes")}</h2>` : ''}
    <div class="faq-list">
      ${sc.faq.map((f, i) => !sc.hiddenElements?.includes(`faq-${i}`) ? `
      <details class="faq-item" data-visual-removable="faq-${i}">
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p>
      </details>
      ` : '').join("")}
    </div>
  </div>
</section>`
        : "";
    }
    return "";
  }).join("\n")}

${(sc.sections?.orcamento === false || !sectionOrder.includes("orcamento")) ? `
<!-- FORMULARIO PRINCIPAL BAJO DEMANDA: mantiene el CRM disponible al reservar -->
<section id="orcamento" class="package-reservation-only" data-package-reservation-only hidden ${sectionBackgroundAttr("orcamento")}>
  <div class="container">
    <div class="section-eyebrow eyebrow">Reserva</div>
    <h2 class="section-title">Cuéntale tus planes a la agencia</h2>
    <div class="orc-grid">${quoteFormHtml}</div>
  </div>
</section>` : ""}

<!-- FOOTER -->
<footer ${sectionBackgroundAttr("footer")}>
  <div class="container">
    <div class="foot-grid">
      <div>
        <div class="foot-brand">${esc(agencia)}</div>
        <p>Consultoría especializada en viajes premium e itinerarios a medida para quienes no aceptan lo común.</p>
        ${footerSocialIcons}
      </div>
      <div>
        <h4>Destinos</h4>
        <ul>${pacotes.slice(0, 5).map((p) => `<li><a href="#destinos">${esc(p.title)}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h4>Empresa</h4>
        <ul>
          <li><a href="#por-que">Sobre Nosotros</a></li>
          <li><a href="#processo">Cómo Funciona</a></li>
          <li><a href="#depo">Testimonios</a></li>
          <li><a href="#orcamento">Contacto</a></li>
        </ul>
      </div>
      <div>
        <h4>Contacto</h4>
        <ul>
          <li>${esc(state.whatsapp || "—")}</li>
          <li>${esc(cidade)}</li>
          <li>Lun–Vie 8h–20h</li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <div>© ${new Date().getFullYear()} ${esc(agencia)} · Todos los derechos reservados</div>
      <div>Hecho con ❤ por <a href="https://canvaviagem.com" target="_blank" style="text-decoration: underline; font-weight: 600; color: #fff;">Canva Viagem</a></div>
    </div>
  </div>
</footer>

${wpp && !sc.hiddenElements?.includes("contact-wpp-float") ? `<a href="#" onclick="openLeadForm('Botão Flutuante', 'https://wa.me/${wpp}');return false;" class="wpp-float" aria-label="WhatsApp" data-visual-removable="contact-wpp-float">💬</a>` : ''}

<!-- DETALLES DINÁMICOS DEL PAQUETE -->
<div id="package-modal" aria-hidden="true" onclick="if(event.target===this)closePackageDetails()">
  <div class="package-sheet" role="dialog" aria-modal="true" aria-labelledby="package-title">
    <button type="button" class="package-close" aria-label="Cerrar detalles del paquete" onclick="closePackageDetails()">&times;</button>
    <div class="package-not-found" id="package-not-found" hidden>
      <div class="package-not-found-mark" aria-hidden="true">!</div>
      <h2 id="package-not-found-title">Paquete no encontrado</h2>
      <p>Este enlace puede haber cambiado o el paquete ya no está disponible. Consulta las experiencias actuales de esta agencia.</p>
      <button type="button" class="btn" onclick="closePackageDetails()">Ver paquetes disponibles</button>
    </div>
    <div class="package-media" id="package-details-media">
      <img id="package-image" src="${DEFAULT_DEST_IMG}" alt="" data-ai-ignore="true" data-preserve-image="true">
      <span class="package-category" id="package-category">Destino</span>
      <div class="package-agency-on-image"><strong id="package-agency-image">${esc(agencia)}</strong><span id="package-location-image">${esc(state.address?.trim() || cidade)}</span></div>
    </div>
    <div class="package-content" id="package-details-content">
      <div class="package-location" id="package-location"></div>
      <h2 id="package-title">Detalles del paquete</h2>
      <p class="package-subtitle" id="package-subtitle"></p>
      <p class="package-description" id="package-description"></p>
      <div class="package-gallery" id="package-gallery" hidden></div>
      <div class="package-facts" id="package-facts" hidden></div>
      <div class="package-price-row"><span>Inversión</span><strong id="package-price">A consultar</strong></div>
      <div class="package-detail-section" id="package-commercial-section" hidden>
        <h3>Condiciones de la oferta</h3><p id="package-commercial"></p>
      </div>
      <div class="package-detail-section" id="package-highlights-section" hidden>
        <h3>Destacados</h3><ul class="package-detail-list" id="package-highlights"></ul>
      </div>
      <div class="package-detail-section" id="package-included-section" hidden>
        <h3>Qué incluye</h3><ul class="package-detail-list" id="package-included"></ul>
      </div>
      <div class="package-detail-section" id="package-not-included-section" data-list-style="minus" hidden>
        <h3>Qué no incluye</h3><ul class="package-detail-list" id="package-not-included"></ul>
      </div>
      <div class="package-detail-section" id="package-itinerary-section" data-list-style="number" hidden>
        <h3>Itinerario</h3><ol class="package-detail-list" id="package-itinerary"></ol>
      </div>
      <div class="package-detail-section" id="package-requirements-section" hidden>
        <h3>Requisitos y qué llevar</h3><ul class="package-detail-list" id="package-requirements"></ul>
      </div>
      <div class="package-detail-section" id="package-documents-section" hidden>
        <h3>Documentos necesarios</h3><ul class="package-detail-list" id="package-documents"></ul>
      </div>
      <div class="package-detail-section" id="package-accessibility-section" hidden>
        <h3>Accesibilidad</h3><ul class="package-detail-list" id="package-accessibility"></ul>
      </div>
      <div class="package-detail-section" id="package-important-section" hidden>
        <h3>Información importante</h3><p id="package-important"></p>
      </div>
      <div class="package-detail-section" id="package-cancellation-section" hidden>
        <h3>Cancelación y cambios</h3><p id="package-cancellation"></p>
      </div>
      <div class="package-contact">
        <div><h3>Atención de la agencia</h3><p><strong id="package-agency">${esc(agencia)}</strong><br><span id="package-agency-location">${esc(state.address?.trim() || cidade)}</span></p></div>
        <div><h3>Habla con nosotros</h3><p><span id="package-phone">${esc(state.whatsapp || "—")}</span><br><span id="package-email">${esc(agencyEmail)}</span></p></div>
      </div>
      <div class="package-faq" id="package-faq-section"><h3>Preguntas frecuentes</h3><div id="package-faq-list"></div></div>
      <button type="button" class="btn package-reserve" onclick="reserveCurrentPackage()">Reservar este paquete</button>
      <p class="package-note">Completarás tus datos en el siguiente paso.</p>
    </div>
  </div>
</div>

<!-- SMART LEAD CAPTURE MODAL -->
<div id="lead-modal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="lead-modal-title" onclick="if(event.target===this)closeModal()">
  <div class="modal-box" role="document">
    <button type="button" class="modal-close" aria-label="Cerrar formulario" onclick="closeModal()">&times;</button>
    <div class="modal-header">
      <div class="modal-icon">🌍</div>
      <h3 id="lead-modal-title">¡Falta poco para tu viaje!</h3>
      <p id="modal-subtitle">Tienes interés en: Geral</p>
    </div>
    <form class="modal-form" onsubmit="handleSubmitLead(event)">
      <div class="field">
        <label for="lead-name">Tu nombre</label>
        <input type="text" id="lead-name" autocomplete="name" required placeholder="Ej: Maria Silva">
      </div>
      <div class="field">
        <label for="lead-email">Tu e-mail</label>
        <input type="email" id="lead-email" autocomplete="email" required placeholder="tu@email.com">
      </div>
      <div class="field">
        <label for="lead-phone">Tu WhatsApp / celular</label>
        <input type="tel" id="lead-phone" autocomplete="tel" required placeholder="Ej: +54 9 11 1234-5678">
      </div>
      <button type="submit" class="btn modal-submit">🚀 Hablar en WhatsApp</button>
    </form>
  </div>
</div>

<!-- SISTEMA DE TELEMETRIA E INTEGRAÇÃO SILENCIOSA -->
<script>
  const CONFIG = {
    agencyId: "${esc(trackingId || state.agencyName || 'agencia_desconhecida')}",
    projectId: "${projectId}",
    formId: "${formId}",
    supabaseUrl: "${SB_URL}",
    supabaseKey: "${SB_KEY}"
  };

  function toggleMobileMenu(button) {
    const menu = document.getElementById("site-nav-links");
    if (!menu) return;
    const isOpen = menu.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  }

  document.querySelectorAll("#site-nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      const menu = document.getElementById("site-nav-links");
      const button = document.querySelector(".nav-toggle");
      menu?.classList.remove("open");
      button?.setAttribute("aria-expanded", "false");
      button?.setAttribute("aria-label", "Abrir menú");
    });
  });

  let pendingUrl = "";
  let currentTarget = "";
  let lastLeadTrigger = null;
  const PACKAGE_DETAILS = ${packageDetailsJson};
  let currentPackage = null;
  let lastPackageTrigger = null;

  function setPackageText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || "";
  }

  function renderPackageTextSection(sectionId, textId, value) {
    const section = document.getElementById(sectionId);
    const text = document.getElementById(textId);
    if (!section || !text) return;
    const content = String(value || "").trim();
    section.hidden = !content;
    text.textContent = content;
  }

  function renderPackageList(sectionId, listId, items) {
    const section = document.getElementById(sectionId);
    const list = document.getElementById(listId);
    if (!section || !list) return;
    const values = Array.isArray(items) ? items.map((item) => String(item || "").trim()).filter(Boolean) : [];
    list.replaceChildren();
    section.hidden = values.length === 0;
    values.forEach((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      list.appendChild(item);
    });
  }

  function renderPackageFacts(selected) {
    const container = document.getElementById("package-facts");
    if (!container) return;
    const facts = [
      ["Fechas", selected.travelDates],
      ["Duración", selected.duration],
      ["Salida / origen", selected.departureLocation],
      ["Encuentro / recogida", selected.meetingPoint],
      ["Alojamiento / cabina", selected.accommodation],
      ["Disponibilidad", selected.availability],
    ].filter((entry) => String(entry[1] || "").trim());
    container.replaceChildren();
    container.hidden = facts.length === 0;
    facts.forEach(([label, value]) => {
      const fact = document.createElement("div");
      const factLabel = document.createElement("span");
      const factValue = document.createElement("strong");
      fact.className = "package-fact";
      factLabel.textContent = label;
      factValue.textContent = value;
      fact.append(factLabel, factValue);
      container.appendChild(fact);
    });
  }

  function renderPackageGallery(selected) {
    const gallery = document.getElementById("package-gallery");
    const mainImage = document.getElementById("package-image");
    if (!gallery || !mainImage) return;
    const images = Array.isArray(selected.galleryImages)
      ? Array.from(new Set(selected.galleryImages.map((url) => String(url || "").trim()).filter(Boolean))).slice(0, 5)
      : [];
    gallery.replaceChildren();
    gallery.hidden = images.length < 2;
    images.forEach((url, index) => {
      const button = document.createElement("button");
      const image = document.createElement("img");
      button.type = "button";
      button.className = index === 0 ? "active" : "";
      button.setAttribute("aria-label", "Ver imagen " + (index + 1) + " de " + selected.title);
      image.src = url;
      image.alt = "";
      button.appendChild(image);
      button.addEventListener("click", () => {
        mainImage.src = url;
        mainImage.alt = selected.title;
        gallery.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      });
      gallery.appendChild(button);
    });
  }

  function renderPackageFaq(items) {
    const section = document.getElementById("package-faq-section");
    const list = document.getElementById("package-faq-list");
    if (!section || !list) return;
    list.replaceChildren();
    if (!items || !items.length) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    items.forEach((item) => {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const answer = document.createElement("p");
      summary.textContent = item.question || "Pregunta frecuente";
      answer.textContent = item.answer || "Consulta a nuestro equipo para obtener más información.";
      details.append(summary, answer);
      list.appendChild(details);
    });
  }

  function notifyPackageLocation(type, slug) {
    if (window.parent !== window) {
      window.parent.postMessage({ type, slug: slug || "" }, "*");
      return;
    }
    if (window.location.protocol === "file:") return;
    const nextUrl = new URL(window.location.href);
    if (type === "CV_PACKAGE_OPEN" && slug) {
      nextUrl.pathname = "/pacote/" + encodeURIComponent(slug);
      nextUrl.searchParams.delete("pacote");
    } else if (type === "CV_PACKAGE_CLOSE" && /^\/pacotes?\//.test(nextUrl.pathname)) {
      nextUrl.pathname = "/";
    }
    window.history.pushState({}, "", nextUrl.pathname + nextUrl.search + nextUrl.hash);
  }

  function openPackageDetails(index, trigger) {
    const selected = PACKAGE_DETAILS[index];
    const modal = document.getElementById("package-modal");
    if (!selected || !modal) return;
    const sheet = modal.querySelector(".package-sheet");
    const notFound = document.getElementById("package-not-found");
    const media = document.getElementById("package-details-media");
    const content = document.getElementById("package-details-content");
    sheet?.setAttribute("aria-labelledby", "package-title");
    if (notFound) notFound.hidden = true;
    if (media) media.hidden = false;
    if (content) content.hidden = false;
    currentPackage = selected;
    lastPackageTrigger = trigger || document.activeElement;
    const image = document.getElementById("package-image");
    image.src = selected.imageUrl;
    image.alt = selected.title;
    setPackageText("package-category", selected.category);
    setPackageText("package-agency-image", selected.agencyName);
    setPackageText("package-location-image", selected.agencyLocation);
    setPackageText("package-location", selected.availability || selected.travelDates);
    setPackageText("package-title", selected.title);
    setPackageText("package-subtitle", selected.subtitle);
    setPackageText("package-description", selected.description);
    setPackageText("package-price", selected.price);
    setPackageText("package-agency", selected.agencyName);
    setPackageText("package-agency-location", selected.agencyLocation);
    setPackageText("package-phone", selected.agencyPhone);
    setPackageText("package-email", selected.agencyEmail);
    renderPackageGallery(selected);
    renderPackageFacts(selected);
    renderPackageTextSection("package-commercial-section", "package-commercial", [selected.priceDetails, selected.paymentTerms].filter(Boolean).join("\\n"));
    renderPackageList("package-highlights-section", "package-highlights", selected.highlights);
    renderPackageList("package-included-section", "package-included", selected.included);
    renderPackageList("package-not-included-section", "package-not-included", selected.notIncluded);
    renderPackageList("package-itinerary-section", "package-itinerary", selected.itinerary);
    renderPackageList("package-requirements-section", "package-requirements", selected.requirements);
    renderPackageList("package-documents-section", "package-documents", selected.documents);
    renderPackageList("package-accessibility-section", "package-accessibility", selected.accessibility);
    renderPackageTextSection("package-important-section", "package-important", selected.importantNotes);
    renderPackageTextSection("package-cancellation-section", "package-cancellation", selected.cancellationPolicy);
    renderPackageFaq(selected.faq);
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("package-modal-open");
    modal.querySelector(".package-close")?.focus();
    notifyPackageLocation("CV_PACKAGE_OPEN", selected.slug);
    track("package_view", { target: selected.title, package_id: selected.id });
  }

  function showPackageNotFound(slug) {
    const modal = document.getElementById("package-modal");
    const sheet = modal?.querySelector(".package-sheet");
    const notFound = document.getElementById("package-not-found");
    const media = document.getElementById("package-details-media");
    const content = document.getElementById("package-details-content");
    if (!modal || !notFound) return;
    currentPackage = null;
    lastPackageTrigger = document.activeElement;
    sheet?.setAttribute("aria-labelledby", "package-not-found-title");
    notFound.hidden = false;
    if (media) media.hidden = true;
    if (content) content.hidden = true;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("package-modal-open");
    modal.querySelector(".package-close")?.focus();
    track("package_not_found", { package_slug: String(slug || "") });
  }

  function closePackageDetails(restoreFocus = true, syncLocation = true) {
    const modal = document.getElementById("package-modal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("package-modal-open");
    if (syncLocation) notifyPackageLocation("CV_PACKAGE_CLOSE", currentPackage && currentPackage.slug);
    if (restoreFocus && lastPackageTrigger && typeof lastPackageTrigger.focus === "function") lastPackageTrigger.focus();
  }

  function openPackageBySlug(slug) {
    const normalized = String(slug || "").trim().toLowerCase();
    if (!normalized) return false;
    const index = PACKAGE_DETAILS.findIndex((item) => item.slug === normalized);
    if (index < 0) {
      showPackageNotFound(normalized);
      return false;
    }
    const trigger = document.querySelector('[data-package-index="' + index + '"]');
    openPackageDetails(index, trigger);
    return true;
  }

  function reserveCurrentPackage() {
    if (!currentPackage) return;
    const selected = currentPackage;
    closePackageDetails(false);
    const quoteSection = document.getElementById("orcamento");
    const destinationSelect = quoteSection && quoteSection.querySelector('select[name="destino"]');
    if (!quoteSection || !destinationSelect) {
      track("package_cta_unavailable", { target: selected.title, package_id: selected.id });
      return;
    }
    if (quoteSection.hidden) quoteSection.hidden = false;
    destinationSelect.value = selected.title;
    destinationSelect.dispatchEvent(new Event("change", { bubbles: true }));
    destinationSelect.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    quoteSection.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    track("package_cta", { target: selected.title, package_id: selected.id });
  }

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
        user_id: CONFIG.agencyId,
        event_type: type,
        session_id: 'sess_' + Math.random().toString(36).slice(2, 11) + Date.now(),
        event_data: { 
          ...data, 
          agency_id: CONFIG.agencyId,
          project_id: CONFIG.projectId,
          userAgent: navigator.userAgent
        },
        created_at: new Date().toISOString()
      })
    }).catch(err => console.warn("Tracking off", err));
  }

  async function submitCrmLead(payload, normalized) {
    if (!CONFIG.supabaseUrl || !CONFIG.formId) return false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3500);
    const query = new URLSearchParams(window.location.search);
    try {
      const response = await fetch(CONFIG.supabaseUrl + "/functions/v1/submit-crm-form", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(CONFIG.supabaseKey ? { "apikey": CONFIG.supabaseKey } : {})
        },
        body: JSON.stringify({
          form_id: CONFIG.formId,
          embed_key: CONFIG.formId,
          payload,
          normalized,
          source_url: window.location.href,
          source_domain: window.location.hostname,
          user_agent: navigator.userAgent,
          utm_source: query.get("utm_source") || "",
          utm_medium: query.get("utm_medium") || "",
          utm_campaign: query.get("utm_campaign") || ""
        })
      });
      return response.ok;
    } catch (error) {
      console.warn("CRM submission off", error);
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function captureLead(payload, normalized) {
    const submitted = await submitCrmLead(payload, normalized);
    if (!submitted) {
      track("lead_captured", { ...payload, ...normalized, crm_fallback: true, status: "novo" });
    }
    return submitted;
  }

  function getPackageSlugFromLocation() {
    if (window.parent !== window || window.location.protocol === "file:") return "";
    const pathMatch = window.location.pathname.match(/^\/pacotes?\/([^/]+)/i);
    if (pathMatch) {
      try {
        return decodeURIComponent(pathMatch[1]).toLowerCase();
      } catch {
        return "";
      }
    }
    return (new URLSearchParams(window.location.search).get("pacote") || "").toLowerCase();
  }

  function syncPackageFromStandaloneLocation() {
    const slug = getPackageSlugFromLocation();
    const modal = document.getElementById("package-modal");
    if (slug) openPackageBySlug(slug);
    else if (modal?.classList.contains("active")) closePackageDetails(false, false);
  }

  window.addEventListener("message", (event) => {
    if (window.parent === window || event.source !== window.parent) return;
    const message = event.data;
    if (!message) return;
    if (message.type === "CV_OPEN_PACKAGE") openPackageBySlug(message.slug);
    if (message.type === "CV_CLOSE_PACKAGE") closePackageDetails(false, false);
  });

  // Registra a visita ÚNICA no carregamento da página para métricas reais
  window.onload = () => {
    const trackerKey = "cv_visit_" + CONFIG.projectId;
    if (!sessionStorage.getItem(trackerKey)) {
      track("page_view", { path: window.location.pathname });
      sessionStorage.setItem(trackerKey, "true"); // Marca como já visitou!
    }
    window.setTimeout(syncPackageFromStandaloneLocation, 0);
  };
  window.addEventListener("popstate", syncPackageFromStandaloneLocation);

  function openLeadForm(targetName, finalUrl) {
    currentTarget = targetName;
    pendingUrl = finalUrl;
    lastLeadTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    
    // Se já preencheu antes, não pergunta de novo, pula direto (experiência do usuário!)
    const savedName = localStorage.getItem("cv_lead_name");
    if (savedName) {
       track("click_whatsapp", { target: targetName, cached_user: savedName });
       window.location.href = finalUrl;
       return;
    }

    document.getElementById("modal-subtitle").innerText = "Interés: " + targetName;
    const modal = document.getElementById("lead-modal");
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lead-modal-open");
    window.requestAnimationFrame(() => document.getElementById("lead-name")?.focus());
    track("click_intent", { target: targetName });
  }

  function closeModal() {
    const modal = document.getElementById("lead-modal");
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lead-modal-open");
    lastLeadTrigger?.focus?.();
  }

  document.addEventListener("keydown", (event) => {
    const packageModal = document.getElementById("package-modal");
    const leadModal = document.getElementById("lead-modal");
    const activeModal = packageModal?.classList.contains("active")
      ? packageModal
      : leadModal?.classList.contains("active")
        ? leadModal
        : null;
    if (!activeModal) return;
    if (event.key === "Escape") {
      if (activeModal === packageModal) closePackageDetails();
      else closeModal();
      return;
    }
    if (event.key === "Tab") {
      const focusable = Array.from(activeModal.querySelectorAll('a[href],button:not([disabled]),summary,input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'))
        .filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  async function handleMainFormSubmit(e) {
    e.preventDefault();
    const f = e.target;
    const btn = f.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Aguarde...';
    btn.disabled = true;

    const payload = {
      nome: f.nome.value,
      wpp: f.wpp.value,
      email: f.email.value,
      destino: f.destino.value,
      viaj: f.viaj.value,
      ida: f.ida.value,
      volta: f.volta.value,
      obs: f.obs.value
    };
    await captureLead(payload, {
      name: payload.nome,
      phone: payload.wpp,
      email: payload.email,
      interest: payload.destino,
      travelers: payload.viaj,
      departure_date: payload.ida,
      return_date: payload.volta,
      notes: payload.obs
    });
    
    const msg = encodeURIComponent('¡Hola! Quiero un presupuesto.\\n\\nNombre: '+f.nome.value+'\\nWhatsApp: '+f.wpp.value+'\\nE-mail: '+f.email.value+'\\nDestino: '+f.destino.value+'\\nViajeros: '+f.viaj.value+'\\nIda: '+f.ida.value+'\\nVuelta: '+f.volta.value+'\\nObs: '+f.obs.value);
    
    btn.innerHTML = originalText;
    btn.disabled = false;
    window.location.href = "https://api.whatsapp.com/send?phone=${wpp}&text=" + msg;
  }

  async function handleSubmitLead(e) {
    e.preventDefault();
    const name = document.getElementById("lead-name").value;
    const phone = document.getElementById("lead-phone").value;
    const email = document.getElementById("lead-email").value;
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Aguarde...';
    btn.disabled = true;
    
    localStorage.setItem("cv_lead_name", name);

    await captureLead({
      nome: name,
      wpp: phone,
      email,
      destino: currentTarget
    }, {
      name,
      phone,
      email,
      interest: currentTarget
    });

    closeModal();
    btn.innerHTML = originalText;
    btn.disabled = false;
    
    let finalWppUrl = pendingUrl;
    if(finalWppUrl.indexOf("?") === -1) {
      finalWppUrl += "?text=" + encodeURIComponent("Hola, mi nombre es " + name + "!");
    } else {
      finalWppUrl += encodeURIComponent(" (Mi nombre es " + name + ")");
    }
    
    window.location.href = finalWppUrl;
  }
  
  ${seasonalScripts}
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

export const renderSocialIcons = (_state: FabricaState, _extraClass = "") => {
  return "";
};

/**
 * Gera um Prompt cirúrgico para o Lovable contendo APENAS o HTML dos pacotes novos,
 * evitando que o usuário precise reconstruir o site do zero.
 */
export function generateUpdatePackagesPrompt(state: FabricaState): string {
  const rawWpp = (state.whatsapp || "").replace(/\D/g, "");
  const dialCode = (state.whatsappDialCode || "55").replace(/\D/g, "");
  const wpp = rawWpp.startsWith(dialCode) ? rawWpp : `${dialCode}${rawWpp}`;
  const cidade = state.city || "Brasil";

  const pacotes = state.selectedPackages.length ? state.selectedPackages.filter(p => !p.isDraft) : [];
  
  if (pacotes.length === 0) {
    return "Aún no se ha generado ningún paquete. Por favor, crea anuncios en la Fase 3 primeiro.";
  }

  const wppMsg = (titulo: string) =>
    wpp ? `https://wa.me/${wpp}?text=${encodeURIComponent(`¡Hola! Tengo interés en ${titulo}.`)}` : "#";

  const cardsHTML = pacotes
    .map((p) => 
`<a href="${wppMsg(p.title)}" target="_blank" rel="noopener" class="dest-card">
  <div class="dest-img-wrap">
    <img src="${esc(sanitizeImageUrl(p.imageUrl))}" alt="${esc(p.title)}" loading="lazy" data-ai-ignore="true" data-preserve-image="true">
    <span class="dest-tag">${esc(p.title.split(" ")[0] || "Destino")}</span>
    <div class="dest-overlay">Ver paquete →</div>
  </div>
  <div class="dest-body">
    <div class="dest-loc">${esc(cidade)}</div>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.description)}</p>
    <div class="dest-price">${parsePriceHTML(p.price)}</div>
    <span class="dest-cta">Saber más →</span>
  </div>
</a>`)
    .join("\n");

  return `Lovable, por favor, actualiza mi sitio actual.
Agrega los siguientes paquetes actualizados en mi cuadrícula de destinos/paquetes existente.

INSTRUCCIÓN CRÍTICA: 
1. NO recrees el sitio desde cero. 
2. NO cambies los colores o el diseño actual. 
3. NO generes nuevas imágenes ficticias. Mantén los enlaces originales que estoy proporcionando.
4. SÓLO reemplaza o agrega las tarjetas de los paquetes en el div/grid que contiene la clase "destinos-grid".

Aquí está el bloque de código HTML que debe ser insertado:

\`\`\`html
${cardsHTML}
\`\`\`

¡Gracias!`;
}
