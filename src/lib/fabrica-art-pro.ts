/**
 * LAYOUTS PRO — redesenho das artes V0–V8 a partir das referências de mercado
 * (CVC, Decolar, Clube Turismo, Enseada, Batata Turismo, hotéis de luxo).
 *
 * Princípios (skill `design-artes-fabrica` e nota 15 do segundo cérebro):
 * - BLOCOS FLEXÍVEIS: todo cartão/painel/bloco é medido antes de ser pintado;
 *   a altura acompanha o texto. Nunca sobra bloco vazio nem texto vazando.
 * - ALINHAMENTO: dentro de um bloco todos os elementos partem da mesma linha
 *   à esquerda (ou do mesmo centro) e respeitam a mesma largura máxima.
 * - RODAPÉ RESERVADO: o conteúdo termina acima de `F.footerTop` (logo + contatos).
 * - Um único ponto focal (preço na oferta, headline na experiência); texto só
 *   dentro de cartão, bloco ou véu; ícones sempre com rótulo quando há espaço.
 *
 * Cada primitiva aceita `dry` (só mede) para a passada de medição.
 */
import {
  applyVignette,
  contrastOn,
  drawFinalBranding,
  drawMonoIcon,
  drawPixLogo,
  fillRoundRect,
  fitCover,
  roundRect,
  safeFillText,
  shadeColor,
  wrapTextSafe,
  type IconKey,
} from "@/lib/fabrica-compose-art";

export interface ProHighlight { text: string; icon: IconKey }

export interface ProPrice {
  has: boolean;
  sym: string;
  intPart: string;
  cents: string;
  topLabel: string;
  prefix: string;
  suffix: string;
  total: string;
  pixText: string;
}

export interface ProContact { icon: string; value: string }

export interface ProArtModel {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  format: "square" | "story";
  image: HTMLImageElement;
  primary: string;
  secondary: string;
  destination: string;
  city: string;
  promoName: string;
  headline: string;
  subtitle: string;
  travelPeriod: string;
  highlights: ProHighlight[];
  price: ProPrice;
  isExperience: boolean;
  fontFamily: string;
  logoDataUrl?: string;
  logoFormat: "circle" | "square";
  contact1?: ProContact;
  contact2?: ProContact;
  textColorOverride?: string;
}

export const CTA_TEXT = "RESERVE AGORA";

// ───────────────────────── utilitários ─────────────────────────

const isLight = (hex: string) => contrastOn(hex) !== "#ffffff";

type Fonts = { sans: string; display: string; serif: string };
const fontsOf = (m: ProArtModel): Fonts => {
  const user = (m.fontFamily || "").trim();
  const isSerifUser = /playfair|georgia|serif|garamond|merriweather/i.test(user);
  const sans = user ? `${user}, Inter, Arial, sans-serif` : "Inter, Arial, sans-serif";
  return {
    sans,
    display: user ? sans : "Outfit, Inter, Arial, sans-serif",
    serif: isSerifUser ? sans : "'Playfair Display', Georgia, serif",
  };
};

function setFont(ctx: CanvasRenderingContext2D, weight: number | string, size: number, family: string) {
  ctx.font = `${weight} ${Math.round(size)}px ${family}`;
}

function fitSize(ctx: CanvasRenderingContext2D, text: string, maxW: number, weight: number | string, size: number, family: string, minSize = 18) {
  let s = size;
  setFont(ctx, weight, s, family);
  while (ctx.measureText(text).width > maxW && s > minSize) {
    s -= 2;
    setFont(ctx, weight, s, family);
  }
  return s;
}

type ParaOpts = { weight: number | string; size: number; family: string; color: string; maxLines: number; lineHeight?: number; align?: CanvasTextAlign; minSize?: number; letterSpacing?: number };

/** Mede um parágrafo: linhas, tamanho final e altura. */
function measurePara(ctx: CanvasRenderingContext2D, text: string, maxW: number, o: ParaOpts) {
  let size = o.size;
  const minSize = o.minSize ?? Math.round(o.size * 0.6);
  let lines: string[] = [];
  for (;;) {
    setFont(ctx, o.weight, size, o.family);
    lines = wrapTextSafe(ctx, text, maxW, o.maxLines + 1, minSize);
    if (lines.length <= o.maxLines || size <= minSize) break;
    size -= 2;
  }
  lines = lines.slice(0, o.maxLines);
  const lh = o.lineHeight ? o.lineHeight * (size / o.size) : size * 1.08;
  return { lines, size, lh, h: lines.length * lh, width: Math.max(0, ...lines.map((l) => ctx.measureText(l).width)) };
}

/** Parágrafo. Devolve a altura. `dry` só mede. */
function paragraph(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, o: ParaOpts, dry = false): number {
  if (!text) return 0;
  const mm = measurePara(ctx, text, maxW, o);
  if (dry) return mm.h;
  ctx.save();
  setFont(ctx, o.weight, mm.size, o.family);
  ctx.fillStyle = o.color;
  ctx.textAlign = o.align ?? "left";
  ctx.textBaseline = "alphabetic";
  if (o.letterSpacing && "letterSpacing" in ctx) (ctx as any).letterSpacing = `${o.letterSpacing}px`;
  mm.lines.forEach((ln, i) => safeFillText(ctx, ln, x, y + mm.size * 0.92 + i * mm.lh, maxW, 10));
  ctx.restore();
  return mm.h;
}

type PillOpts = { bg: string; fg: string; size: number; family: string; weight?: number | string; h?: number; padX?: number; align?: "left" | "center" | "right"; maxW?: number; stroke?: string };
const pillH = (o: PillOpts) => o.h ?? Math.round(o.size * 1.9);

/** Pílula. Devolve a largura. */
function pill(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, o: PillOpts, dry = false): number {
  const h = pillH(o);
  const padX = o.padX ?? Math.round(o.size * 0.9);
  const size = fitSize(ctx, text, (o.maxW ?? 9999) - padX * 2, o.weight ?? 800, o.size, o.family, 14);
  const w = Math.ceil(ctx.measureText(text).width + padX * 2);
  if (dry) return w;
  const left = o.align === "center" ? x - w / 2 : o.align === "right" ? x - w : x;
  ctx.save();
  if (o.bg !== "transparent") fillRoundRect(ctx, left, y, w, h, h / 2, o.bg);
  if (o.stroke) {
    ctx.strokeStyle = o.stroke;
    ctx.lineWidth = 3;
    roundRect(ctx, left + 1.5, y + 1.5, w - 3, h - 3, h / 2);
    ctx.stroke();
  }
  ctx.fillStyle = o.fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  setFont(ctx, o.weight ?? 800, size, o.family);
  ctx.fillText(text, left + w / 2, y + h / 2 + 1);
  ctx.restore();
  return w;
}

type ListOpts = { size: number; family: string; color: string; iconColor?: string; gap?: number; columns?: 1 | 2 };
/** Lista de benefícios com ícone. Devolve a altura. */
function iconList(ctx: CanvasRenderingContext2D, items: ProHighlight[], x: number, y: number, maxW: number, o: ListOpts, dry = false): number {
  if (!items.length) return 0;
  const gap = o.gap ?? Math.round(o.size * 1.8);
  const icon = Math.round(o.size * 1.25);
  const cols = o.columns ?? 1;
  const colW = cols === 2 ? maxW / 2 : maxW;
  const rows = cols === 2 ? Math.ceil(items.length / 2) : items.length;
  if (dry) return rows * gap;
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  items.forEach((h, i) => {
    const col = cols === 2 ? i % 2 : 0;
    const row = cols === 2 ? Math.floor(i / 2) : i;
    const cx = x + col * colW;
    const cy = y + row * gap + gap / 2;
    drawMonoIcon(ctx, h.icon, cx + icon / 2, cy, icon, o.iconColor ?? o.color, 1.6);
    ctx.fillStyle = o.color;
    setFont(ctx, 600, o.size, o.family);
    safeFillText(ctx, h.text, cx + icon * 1.55, cy + 1, colW - icon * 1.8, Math.round(o.size * 0.7));
  });
  ctx.restore();
  return rows * gap;
}

/** Linha "Dezembro | ✈ 🏨 🍳". Devolve a altura. */
function iconStrip(ctx: CanvasRenderingContext2D, m: ProArtModel, x: number, y: number, color: string, size = 26, dry = false): number {
  const f = fontsOf(m);
  if (dry) return size * 2;
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  let cx = x;
  const cy = y + size;
  if (m.travelPeriod) {
    setFont(ctx, 700, size, f.sans);
    ctx.fillStyle = color;
    ctx.fillText(m.travelPeriod, cx, cy);
    cx += ctx.measureText(m.travelPeriod).width + size * 0.8;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(cx, cy - size * 0.7, 2, size * 1.4);
    ctx.globalAlpha = 1;
    cx += size * 0.9;
  }
  m.highlights.slice(0, 5).forEach((h) => {
    drawMonoIcon(ctx, h.icon, cx + size * 0.6, cy, size * 1.25, color, 1.6);
    cx += size * 1.7;
  });
  ctx.restore();
  return size * 2;
}

type PriceOpts = { fg: string; accentBg: string; accentFg: string; size?: number; align?: "left" | "right" | "center"; showTotal?: boolean };
/** Largura natural do último bloco de preço medido (para caixas que se ajustam ao conteúdo). */
let LAST_PRICE_WIDTH = 0;
export const priceNaturalWidth = () => LAST_PRICE_WIDTH;
/** Bloco de preço estilo CVC. Devolve a altura. */
function priceBlock(ctx: CanvasRenderingContext2D, m: ProArtModel, x: number, y: number, maxW: number, o: PriceOpts, dry = false): number {
  const f = fontsOf(m);
  const p = m.price;
  const S = o.size ?? 150;
  const align = o.align ?? "left";
  const ax = align === "center" ? x + maxW / 2 : align === "right" ? x + maxW : x;
  const ta: CanvasTextAlign = align === "center" ? "center" : align === "right" ? "right" : "left";
  let cy = y;
  ctx.save();
  ctx.textBaseline = "alphabetic";

  if (p.prefix) {
    const ps = Math.round(S * 0.18);
    if (!dry) {
      setFont(ctx, 700, ps, f.sans);
      ctx.fillStyle = o.fg;
      ctx.textAlign = ta;
      ctx.fillText(p.prefix.toUpperCase(), ax, cy + ps);
    }
    cy += Math.round(S * 0.30);
  }

  const pillLabel = (p.topLabel || "").trim();
  const pillSize = Math.round(S * 0.26);
  const pH = Math.round(pillSize * 1.8);
  setFont(ctx, 900, pillSize, f.display);
  const pillW = pillLabel ? Math.ceil(ctx.measureText(pillLabel).width + pillSize * 1.2) : 0;
  const symSize = Math.round(S * 0.30);
  const centsSize = Math.round(S * 0.32);
  let numSize = S;
  const measure = () => {
    setFont(ctx, 800, symSize, f.display);
    const symW = ctx.measureText(p.sym).width + symSize * 0.25;
    setFont(ctx, 900, numSize, f.display);
    const numW = ctx.measureText(p.intPart).width;
    setFont(ctx, 800, centsSize, f.display);
    const centsW = p.cents ? ctx.measureText(`,${p.cents}`).width : 0;
    return { symW, numW, centsW, total: (pillW ? pillW + pillSize * 0.7 : 0) + symW + numW + centsW };
  };
  let mm = measure();
  while (mm.total > maxW && numSize > Math.max(56, S * 0.6)) {
    numSize -= 4;
    mm = measure();
  }
  // Rótulo largo ("ENTRADA +", "À VISTA · 5% OFF"): se não cabe ao lado do número
  // nem com o número reduzido, a pílula sobe para a linha de cima.
  let stackedPill = false;
  if (pillLabel && mm.total > maxW) {
    stackedPill = true;
    numSize = S;
    const noPill = () => { const r = measure(); return r.total - (pillW + pillSize * 0.7); };
    while (noPill() > maxW && numSize > 56) numSize -= 4;
    mm = measure();
    mm.total -= pillW + pillSize * 0.7;
    if (!dry) {
      const px = align === "center" ? x + (maxW - pillW) / 2 : align === "right" ? x + maxW - pillW : x;
      pill(ctx, px, cy, pillLabel, { bg: o.accentBg, fg: o.accentFg, size: pillSize, family: f.display, weight: 900, h: pH, padX: pillSize * 0.6 });
    }
    cy += pH + 10;
  }
  const startX = align === "center" ? x + (maxW - mm.total) / 2 : align === "right" ? x + maxW - mm.total : x;
  const baseline = cy + numSize * 0.78;
  if (!dry) {
    let cx = startX;
    if (pillLabel && !stackedPill) {
      pill(ctx, cx, baseline - pH - numSize * 0.05, pillLabel, { bg: o.accentBg, fg: o.accentFg, size: pillSize, family: f.display, weight: 900, h: pH, padX: pillSize * 0.6 });
      cx += pillW + pillSize * 0.7;
    }
    ctx.textAlign = "left";
    ctx.fillStyle = o.fg;
    setFont(ctx, 800, symSize, f.display);
    ctx.fillText(p.sym, cx, baseline - numSize * 0.42);
    cx += mm.symW;
    setFont(ctx, 900, numSize, f.display);
    ctx.fillText(p.intPart, cx, baseline);
    cx += mm.numW;
    if (p.cents) {
      setFont(ctx, 800, centsSize, f.display);
      ctx.fillText(`,${p.cents}`, cx, baseline - numSize * 0.42);
    }
  }
  cy += Math.round(numSize * 0.9);

  const small = Math.round(S * 0.17);
  const tail = [p.suffix, (o.showTotal ?? true) && p.total ? `Total ${p.total}` : ""].filter(Boolean).join("  ·  ");
  setFont(ctx, 600, small, f.sans);
  const tailW = tail ? Math.min(maxW, ctx.measureText(tail).width) : 0;
  setFont(ctx, 700, Math.round(S * 0.18), f.sans);
  const prefixW = p.prefix ? ctx.measureText(p.prefix.toUpperCase()).width : 0;
  LAST_PRICE_WIDTH = Math.ceil(Math.max(mm.total, tailW, prefixW, stackedPill ? pillW : 0));
  if (tail) {
    cy += small * 0.4;
    if (!dry) {
      setFont(ctx, 600, small, f.sans);
      ctx.fillStyle = o.fg;
      ctx.globalAlpha = 0.85;
      ctx.textAlign = ta;
      safeFillText(ctx, tail, ax, cy + small, maxW, 14);
    }
    cy += small * 1.3;
  }
  ctx.restore();
  return cy - y;
}

/** Faixa "5% OFF À VISTA NO pix" no rodapé de um cartão. */
function pixStripe(ctx: CanvasRenderingContext2D, m: ProArtModel, x: number, y: number, w: number, h: number, bg: string, radiusBottom: number) {
  const f = fontsOf(m);
  const fg = contrastOn(bg);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - radiusBottom);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radiusBottom, y + h);
  ctx.lineTo(x + radiusBottom, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radiusBottom);
  ctx.closePath();
  ctx.fillStyle = bg;
  ctx.fill();
  const text = m.price.pixText.replace(/\s*pix\s*$/i, "").trim();
  const size = Math.round(h * 0.42);
  setFont(ctx, 900, size, f.sans);
  const tw = ctx.measureText(text).width;
  const pixW = size * 2.4;
  const startX = x + (w - tw - pixW) / 2;
  ctx.fillStyle = fg;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, startX, y + h / 2 + 1);
  drawPixLogo(ctx, startX + tw + size * 0.9, y + h / 2, size * 1.1, fg);
  setFont(ctx, 800, size, f.sans);
  ctx.fillText("pix", startX + tw + size * 1.6, y + h / 2 + 1);
  ctx.restore();
}

type ExpOpts = { fg: string; ctaBg: string; ctaFg: string; size?: number; align?: "left" | "center"; serif?: boolean; withHeadline?: boolean; withSubtitle?: boolean };
/** Bloco de experiência: headline + subtítulo + CTA (no lugar do preço). Devolve a altura. */
function experienceBlock(ctx: CanvasRenderingContext2D, m: ProArtModel, x: number, y: number, maxW: number, o: ExpOpts, dry = false): number {
  const f = fontsOf(m);
  const S = o.size ?? 64;
  const align = o.align ?? "left";
  const ax = align === "center" ? x + maxW / 2 : x;
  let cy = y;
  if (o.withHeadline ?? true) {
    cy += paragraph(ctx, m.headline, ax, cy, maxW, { weight: o.serif ? 700 : 900, size: S, family: o.serif ? f.serif : f.display, color: o.fg, maxLines: 3, align, lineHeight: S * 1.04 }, dry);
    cy += S * 0.25;
  }
  if (m.subtitle && (o.withSubtitle ?? true)) {
    cy += paragraph(ctx, m.subtitle, ax, cy, maxW, { weight: 500, size: Math.round(S * 0.46), family: f.sans, color: o.fg, maxLines: 2, align }, dry);
    cy += S * 0.35;
  }
  const ctaSize = Math.max(26, Math.round(S * 0.48));
  const h = Math.round(ctaSize * 2.1);
  pill(ctx, ax, cy, CTA_TEXT, { bg: o.ctaBg, fg: o.ctaFg, size: ctaSize, family: f.sans, weight: 900, align: align === "center" ? "center" : "left", padX: ctaSize * 1.2, h }, dry);
  cy += h;
  return cy - y;
}

function drawPhoto(m: ProArtModel, x: number, y: number, w: number, h: number, focusY = 0.45, radius = 0) {
  const { ctx, image } = m;
  const c = fitCover(image.naturalWidth, image.naturalHeight, w, h, focusY);
  ctx.save();
  if (radius > 0) {
    roundRect(ctx, x, y, w, h, radius);
    ctx.clip();
  }
  ctx.drawImage(image, c.sx, c.sy, c.sw, c.sh, x, y, w, h);
  ctx.restore();
}

function veil(ctx: CanvasRenderingContext2D, x: number, from: number, w: number, to: number, strength = 0.78, up = false) {
  const g = ctx.createLinearGradient(0, from, 0, to);
  if (up) {
    g.addColorStop(0, `rgba(0,0,0,${strength})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
  } else {
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${strength})`);
  }
  ctx.fillStyle = g;
  ctx.fillRect(x, Math.min(from, to), w, Math.abs(to - from));
}

function kickerText(ctx: CanvasRenderingContext2D, m: ProArtModel, x: number, y: number, color: string, align: CanvasTextAlign = "left", size = 22, dry = false): number {
  const f = fontsOf(m);
  if (dry) return size + 12;
  ctx.save();
  setFont(ctx, 700, size, f.sans);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  (ctx as any).letterSpacing = "3px";
  ctx.fillText(m.promoName.toUpperCase(), x, y + size);
  (ctx as any).letterSpacing = "0px";
  ctx.restore();
  return size + 12;
}

function legalLine(ctx: CanvasRenderingContext2D, m: ProArtModel, y: number, color = "rgba(255,255,255,0.75)") {
  const f = fontsOf(m);
  const parts = [m.city ? `Saída de ${m.city}` : "", m.travelPeriod ? `Período: ${m.travelPeriod}` : "", "Valores por pessoa, sujeitos a disponibilidade."];
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  setFont(ctx, 500, 18, f.sans);
  safeFillText(ctx, parts.filter(Boolean).join(" · "), m.width / 2, y, m.width - 120, 12);
  ctx.restore();
}

async function branding(m: ProArtModel, contactColor?: string) {
  await drawFinalBranding(m.ctx, m.width, m.height, m.logoDataUrl, m.contact1, m.contact2, m.textColorOverride, m.fontFamily, false, m.logoFormat, false, contactColor);
}

/** Geometria comum. O rodapé (logo + contatos) ocupa [footerTop, footerTop + footerH]. */
function frame(m: ProArtModel) {
  const story = m.format === "story";
  const footerH = story ? 120 : 100;
  const footerTop = story ? m.height - 350 : m.height - 140;
  return {
    story,
    M: story ? 80 : 72,
    top: story ? 250 : 72,
    footerTop,
    footerH,
    footerBottom: footerTop + footerH,
    bottom: footerTop - 28, // último Y útil para conteúdo
  };
}

function brandPair(m: ProArtModel) {
  const primaryLight = isLight(m.primary);
  const secondaryLight = isLight(m.secondary);
  if (secondaryLight && !primaryLight) return { card: m.secondary, accent: m.primary };
  if (primaryLight && !secondaryLight) return { card: m.primary, accent: m.secondary };
  if (secondaryLight && primaryLight) return { card: m.secondary, accent: shadeColor(m.primary, -45) };
  return { card: "#ffffff", accent: m.primary };
}

/**
 * Mede o conteúdo (`dry`) e, se não couber em `maxH`, repete com escala menor.
 * Devolve a escala escolhida e a altura medida.
 */
function fitScale(content: (k: number, dry: boolean) => number, maxH: number): { k: number; h: number } {
  const steps = [1, 0.92, 0.85, 0.78, 0.7];
  let h = 0;
  for (const k of steps) {
    h = content(k, true);
    if (h <= maxH) return { k, h };
  }
  return { k: steps[steps.length - 1], h };
}

// ───────────────────────────── LAYOUTS ─────────────────────────────

/** V0 — "Enseada": bloco superior denso + foto. Bloco cresce/encolhe com o texto. */
async function layoutV0(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const { card, accent } = brandPair(m);
  const fg = contrastOn(card);
  const x = F.M;
  const w = width - F.M * 2;
  const startY = F.story ? F.top + 20 : 56;
  const K = F.story ? 1.25 : 1;

  const content = (k: number, dry: boolean): number => {
    let y = startY;
    const kw = pill(ctx, x, y, m.promoName.toUpperCase(), { bg: accent, fg: contrastOn(accent), size: 22 * K * k, family: f.sans, weight: 900, h: 44 * K * k, padX: 20 }, dry);
    if (m.travelPeriod) pill(ctx, x + kw + 12, y, m.travelPeriod.toUpperCase(), { bg: "transparent", fg, size: 22 * K * k, family: f.sans, weight: 800, h: 44 * K * k, padX: 18, stroke: fg }, dry);
    y += 44 * K * k + 24;
    const hs = (F.story ? 96 : 78) * k;
    y += paragraph(ctx, m.headline, x, y, w, { weight: 900, size: hs, family: f.display, color: fg, maxLines: 2, lineHeight: hs * 1.02 }, dry);
    y += 16;
    if (m.city) {
      pill(ctx, x, y, `Saindo de ${m.city}`, { bg: accent, fg: contrastOn(accent), size: 24 * K * k, family: f.sans, weight: 800, h: 46 * K * k, padX: 20 }, dry);
      y += 46 * K * k + 22;
    } else {
      y += 6;
    }
    const leftW = Math.round(w * 0.46);
    const rightX = x + leftW + 40;
    const rightW = w - leftW - 40;
    const listH = iconList(ctx, m.highlights.slice(0, 5), x, y, leftW, { size: 28 * K * k, family: f.sans, color: fg, iconColor: accent, gap: 50 * K * k }, dry);
    let rightH = 0;
    if (m.isExperience) {
      rightH = experienceBlock(ctx, m, rightX, y, rightW, { fg, ctaBg: accent, ctaFg: contrastOn(accent), size: 64 * K * k, withHeadline: false }, dry);
    } else {
      rightH = priceBlock(ctx, m, rightX, y - 6, rightW, { fg, accentBg: accent, accentFg: contrastOn(accent), size: (F.story ? 150 : 118) * k, align: "right" }, dry);
      if (m.price.pixText) {
        pill(ctx, x + w, y + rightH + 8, m.price.pixText.toUpperCase(), { bg: accent, fg: contrastOn(accent), size: 20 * K * k, family: f.sans, weight: 900, h: 42 * K * k, padX: 20, align: "right" }, dry);
        rightH += 8 + 42 * K * k;
      }
    }
    y += Math.max(listH, rightH);
    return y;
  };

  const maxBlock = Math.round(height * (F.story ? 0.52 : 0.6));
  const { k, h: endY } = fitScale(content, maxBlock - 40);
  const blockH = Math.min(maxBlock, endY + 40);

  drawPhoto(m, 0, blockH, width, height - blockH, 0.5);
  veil(ctx, 0, height - 420, width, height, 0.7);
  ctx.fillStyle = card;
  ctx.fillRect(0, 0, width, blockH);
  ctx.fillStyle = accent;
  ctx.fillRect(0, blockH - 8, width, 8);
  content(k, false);
  if (!m.isExperience) legalLine(ctx, m, F.footerTop - 14);
  await branding(m);
}

/** V1 — "Conheça": painel claro à esquerda com altura pelo conteúdo; título em faixa que invade a foto. */
async function layoutV1(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const panelW = Math.round(width * (F.story ? 0.58 : 0.52));
  const cream = "#F8F5EE";
  const ink = "#15171A";
  const accent = isLight(m.primary) ? shadeColor(m.primary, -45) : m.primary;
  const x = F.M;
  const w = panelW - F.M - 40;
  const startY = F.story ? F.top + 30 : 72;
  const K = F.story ? 1.15 : 1;

  const content = (k: number, dry: boolean): number => {
    let y = startY;
    y += kickerText(ctx, m, x, y, accent, "left", 22 * K * k, dry) + 10;
    // faixa do título
    const rs = (F.story ? 80 : 64) * K * k;
    const t1 = m.isExperience ? "Viva" : "Conheça";
    const mm = measurePara(ctx, `${m.destination}!`, panelW + (F.story ? 90 : 120) - x - 40, { weight: 900, size: rs, family: f.display, color: "", maxLines: 2, lineHeight: rs });
    const ribbonH = 30 + rs * 0.78 + mm.lines.length * mm.lh + 26;
    if (!dry) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 10;
      fillRoundRect(ctx, -40, y, panelW + (F.story ? 90 : 120) + 40, ribbonH, 28, accent);
      ctx.restore();
      ctx.fillStyle = contrastOn(accent);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      setFont(ctx, 400, rs * 0.78, f.display);
      ctx.fillText(t1, x, y + 30 + rs * 0.62);
      setFont(ctx, 900, mm.size, f.display);
      mm.lines.forEach((ln, i) => ctx.fillText(ln, x, y + 30 + rs * 0.78 + (i + 1) * mm.lh - mm.lh * 0.1));
    }
    y += ribbonH + 36;
    if (m.travelPeriod || m.city) {
      const sub = [m.travelPeriod, m.city ? `Saindo de ${m.city}` : ""].filter(Boolean).join(" · ");
      pill(ctx, x, y, sub.toUpperCase(), { bg: "transparent", fg: accent, size: 20 * K * k, family: f.sans, weight: 800, h: 40 * K * k, padX: 18, stroke: accent, maxW: w }, dry);
      y += 40 * K * k + 24;
    }
    y += iconList(ctx, m.highlights.slice(0, 5), x, y, w, { size: 30 * K * k, family: f.sans, color: ink, iconColor: accent, gap: 60 * K * k }, dry);
    y += 22;
    if (m.isExperience) {
      y += experienceBlock(ctx, m, x, y, w, { fg: ink, ctaBg: accent, ctaFg: contrastOn(accent), size: 64 * K * k, withHeadline: false }, dry);
    } else {
      y += priceBlock(ctx, m, x, y, w, { fg: accent, accentBg: accent, accentFg: contrastOn(accent), size: (F.story ? 150 : 110) * k }, dry) + 14;
      if (m.price.pixText) {
        pill(ctx, x, y, m.price.pixText.toUpperCase(), { bg: accent, fg: contrastOn(accent), size: 20 * K * k, family: f.sans, weight: 900, h: 42 * K * k, padX: 20, maxW: w }, dry);
        y += 42 * K * k;
      }
    }
    return y;
  };

  const { k, h: endY } = fitScale(content, F.bottom - startY);
  const panelH = Math.min(height, endY + 44);
  // story: o painel começa logo abaixo da zona que o Instagram cobre, como um cartão
  // encostado na borda esquerda; quadrado: começa no topo.
  const panelTop = F.story ? F.top - 50 : 0;
  drawPhoto(m, 0, 0, width, height, 0.5);
  veil(ctx, 0, height - 400, width, height, 0.75);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 8;
  ctx.fillStyle = cream;
  ctx.beginPath();
  const r = panelH < height ? 44 : 0;
  const rt = panelTop > 0 ? 44 : 0;
  ctx.moveTo(0, panelTop);
  ctx.lineTo(panelW - rt, panelTop);
  ctx.quadraticCurveTo(panelW, panelTop, panelW, panelTop + rt);
  ctx.lineTo(panelW, panelH - r);
  ctx.quadraticCurveTo(panelW, panelH, panelW - r, panelH);
  ctx.lineTo(0, panelH);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  content(k, false);
  await branding(m);
}

/** V2 — foto em cima, bloco claro embaixo com altura pelo conteúdo; faixa de título sobre a emenda. */
async function layoutV2(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const ink = "#15171A";
  const accent = isLight(m.primary) ? shadeColor(m.primary, -45) : m.primary;
  const soft = isLight(m.secondary) ? m.secondary : "#F2F4F7";
  const x = F.M;
  const w = width - F.M * 2;
  const K = F.story ? 1.2 : 1;

  // faixa de título (medida fora do conteúdo porque fica sobre a emenda)
  const text = `${m.isExperience ? "Viva" : "Conheça"} ${m.destination}!`;
  const rsize = fitSize(ctx, text, width - x - 40, 900, (F.story ? 76 : 66) * K, f.display, 36);
  const ribbonW = Math.ceil(ctx.measureText(text).width);
  const ribbonH = Math.round(rsize * 1.5);

  const content = (k: number, dry: boolean, y0 = 0): number => {
    let y = y0;
    if (m.isExperience) {
      y += iconList(ctx, m.highlights.slice(0, 6), x, y, w, { size: 30 * K * k, family: f.sans, color: ink, iconColor: accent, gap: 56 * K * k, columns: 2 }, dry);
      y += 14;
      y += experienceBlock(ctx, m, x, y, w, { fg: ink, ctaBg: accent, ctaFg: contrastOn(accent), size: 60 * K * k, withHeadline: false }, dry);
    } else {
      const leftW = Math.round(w * 0.5);
      const cardX = x + leftW + 24;
      const cardW = w - leftW - 24;
      const listH = iconList(ctx, m.highlights.slice(0, 5), x, y, leftW, { size: 30 * K * k, family: f.sans, color: ink, iconColor: accent, gap: 58 * K * k }, dry);
      const priceH = priceBlock(ctx, m, cardX + 28, y + 24, cardW - 56, { fg: contrastOn(soft) === "#ffffff" ? "#ffffff" : accent, accentBg: accent, accentFg: contrastOn(accent), size: (F.story ? 118 : 96) * k, align: "center" }, true);
      const cardH = priceH + 48;
      if (!dry) {
        fillRoundRect(ctx, cardX, y, cardW, cardH, 28, soft);
        priceBlock(ctx, m, cardX + 28, y + 24, cardW - 56, { fg: contrastOn(soft) === "#ffffff" ? "#ffffff" : accent, accentBg: accent, accentFg: contrastOn(accent), size: (F.story ? 118 : 96) * k, align: "center" });
      }
      y += Math.max(listH, cardH);
      if (m.price.pixText) {
        y += 14;
        pill(ctx, x, y, m.price.pixText.toUpperCase(), { bg: accent, fg: contrastOn(accent), size: 20 * K * k, family: f.sans, weight: 800, h: 42 * K * k, padX: 20 }, dry);
        y += 42 * K * k;
      }
    }
    return y - y0;
  };

  const maxContent = F.bottom - (F.top + 300) - ribbonH;
  const { k, h: contentH } = fitScale((kk, dry) => content(kk, dry, 0), maxContent);
  const contentTop = F.bottom - contentH;
  const photoH = contentTop - 30 - ribbonH / 2 - 10;

  drawPhoto(m, 0, 0, width, photoH, 0.45);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, photoH, width, height - photoH);
  const ribbonY = photoH - ribbonH / 2 - 10;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  fillRoundRect(ctx, -30, ribbonY, Math.min(width - 30, x + ribbonW + 60) + 30, ribbonH, 24, accent);
  ctx.restore();
  ctx.fillStyle = contrastOn(accent);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  setFont(ctx, 900, rsize, f.display);
  ctx.fillText(text, x, ribbonY + ribbonH / 2 + 2);
  content(k, false, contentTop);
  await branding(m, ink);
}

/** V3 — cartão CVC com altura pelo conteúdo. */
async function layoutV3(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const { card, accent } = brandPair(m);
  const fg = contrastOn(card);
  const cardW = F.story ? width - F.M * 2 : Math.round(width * 0.68);
  const cardX = F.M;
  const pad = 44;
  const innerW = cardW - pad * 2;
  const x = cardX + pad;
  const pixH = !m.isExperience && m.price.pixText ? 64 : 0;

  const content = (k: number, dry: boolean, y0 = 0): number => {
    let y = y0;
    y += kickerText(ctx, m, x, y, fg, "left", 30 * k, dry) + 4;
    y += paragraph(ctx, m.destination, x, y, innerW, { weight: 400, size: 64 * k, family: f.display, color: fg, maxLines: 1, minSize: 34 }, dry) + 12;
    y += iconStrip(ctx, m, x, y, fg, 26 * k, dry) + 8;
    if (m.isExperience) {
      y += experienceBlock(ctx, m, x, y, innerW, { fg, ctaBg: accent, ctaFg: contrastOn(accent), size: 54 * k }, dry);
    } else {
      y += priceBlock(ctx, m, x, y, innerW, { fg, accentBg: accent, accentFg: contrastOn(accent), size: (F.story ? 170 : 150) * k }, dry);
    }
    return y - y0;
  };

  const { k, h: contentH } = fitScale((kk, dry) => content(kk, dry), F.bottom - F.top - pad * 2 - pixH);
  const cardH = pad + contentH + (pixH ? 24 + pixH : pad);
  const cardY = F.story ? Math.round(F.top + (F.bottom - F.top - cardH) / 2) : Math.max(F.top, F.bottom - cardH);

  drawPhoto(m, 0, 0, width, height, 0.4);
  veil(ctx, 0, height - 520, width, height, 0.72);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 36, card);
  ctx.restore();
  content(k, false, cardY + pad);
  if (pixH) pixStripe(ctx, m, cardX, cardY + cardH - pixH, cardW, pixH, accent, 36);
  if (!m.isExperience) legalLine(ctx, m, F.footerTop - 14);
  await branding(m);
}

/** V4 — Decolar: foto em moldura no topo + bloco da marca; a foto ocupa o que sobrar. */
async function layoutV4(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const base = isLight(m.primary) ? shadeColor(m.primary, -60) : m.primary;
  const accent = isLight(m.secondary) ? m.secondary : "#ffffff";
  const fg = contrastOn(base);
  const x = F.M;
  const w = width - F.M * 2;
  const topY = F.story ? F.top : 40;
  const gap = 20;
  const leftW = Math.round(w * 0.58);
  const rightW = w - leftW - gap;

  const content = (k: number, dry: boolean, y0 = 0): number => {
    let y = y0;
    // "Pacote | DESTINO"
    const label = m.isExperience ? "Experiência" : "Pacote";
    setFont(ctx, 500, 40 * k, f.display);
    const lw = ctx.measureText(label).width + 28;
    const ds = fitSize(ctx, m.destination.toUpperCase(), w - lw - 28, 900, 58 * k, f.display, 28);
    if (!dry) {
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      setFont(ctx, 500, 40 * k, f.display);
      ctx.fillStyle = fg;
      ctx.fillText(label, x, y + 40 * k);
      ctx.globalAlpha = 0.5;
      ctx.fillRect(x + lw, y + 4, 2, 46 * k);
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      setFont(ctx, 900, ds, f.display);
      ctx.fillText(m.destination.toUpperCase(), x + lw + 28, y + 42 * k);
    }
    y += 86 * k;
    // dois cartões com a mesma altura
    const leftH = m.isExperience
      ? experienceBlock(ctx, m, x + 28, y + 28, leftW - 56, { fg, ctaBg: accent, ctaFg: contrastOn(accent), size: 60 * k, withHeadline: false }, true)
      : priceBlock(ctx, m, x + 28, y + 24, leftW - 56, { fg, accentBg: accent, accentFg: contrastOn(accent), size: (F.story ? 124 : 112) * k }, true);
    const rx = x + leftW + gap + 24;
    let rightH = 0;
    if (m.travelPeriod) rightH += 54 * k;
    rightH += iconList(ctx, m.highlights.slice(0, 5), rx, 0, rightW - 48, { size: 24 * k, family: f.sans, color: fg, iconColor: accent, gap: 44 * k }, true);
    const cardH = Math.max(leftH, rightH) + 52;
    if (!dry) {
      const softBg = "rgba(255,255,255,0.10)";
      fillRoundRect(ctx, x, y, leftW, cardH, 26, softBg);
      fillRoundRect(ctx, x + leftW + gap, y, rightW, cardH, 26, softBg);
      if (m.isExperience) experienceBlock(ctx, m, x + 28, y + 28, leftW - 56, { fg, ctaBg: accent, ctaFg: contrastOn(accent), size: 60 * k, withHeadline: false });
      else priceBlock(ctx, m, x + 28, y + 24, leftW - 56, { fg, accentBg: accent, accentFg: contrastOn(accent), size: (F.story ? 124 : 112) * k });
      let ry = y + 26;
      if (m.travelPeriod) {
        setFont(ctx, 900, 30 * k, f.display);
        ctx.fillStyle = accent;
        ctx.textAlign = "left";
        ctx.fillText(m.travelPeriod, rx, ry + 28 * k);
        ry += 54 * k;
      }
      iconList(ctx, m.highlights.slice(0, 5), rx, ry, rightW - 48, { size: 24 * k, family: f.sans, color: fg, iconColor: accent, gap: 44 * k });
    }
    y += cardH;
    if (m.isExperience) {
      y += 22;
      y += paragraph(ctx, m.headline, x, y, w, { weight: 600, size: (F.story ? 44 : 36) * k, family: f.serif, color: fg, maxLines: 2 }, dry);
    }
    return y - y0;
  };

  const minPhoto = F.story ? 560 : 380;
  const { k, h: contentH } = fitScale((kk, dry) => content(kk, dry), F.bottom - (topY + minPhoto + 44));
  const contentTop = F.bottom - contentH;
  const photoH = contentTop - 44 - topY;

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);
  drawPhoto(m, F.M - 20, topY, width - (F.M - 20) * 2, photoH, 0.45, 36);
  pill(ctx, width / 2, topY + 28, m.promoName.toUpperCase(), { bg: accent, fg: contrastOn(accent), size: 24, family: f.sans, weight: 900, h: 50, padX: 24, align: "center" });
  content(k, false, contentTop);
  if (!m.isExperience) legalLine(ctx, m, F.footerTop - 14, "rgba(255,255,255,0.6)");
  await branding(m);
}

/** V5 — Cartagena: cartão branco centrado, tudo centralizado no mesmo eixo. */
async function layoutV5(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const accent = isLight(m.primary) ? shadeColor(m.primary, -45) : m.primary;
  // cor "pop" (selo e preço) só quando a secundária é saturada e escura o bastante
  // para ler sobre o cartão branco; creme/branco caem para a cor da marca.
  const secondaryPop = shadeColor(m.secondary, -10);
  const nearWhite = m.secondary.toLowerCase() === "#ffffff" || /^#f[0-9a-f]f[0-9a-f]e[0-9a-f]$/i.test(m.secondary) || /^#f[0-9a-f]e[0-9a-f]d[0-9a-f]$/i.test(m.secondary);
  const pop = isLight(m.secondary) && !nearWhite ? secondaryPop : accent;
  const priceColor = isLight(pop) ? accent : pop;
  const cardW = width - F.M * 2;
  const cardX = F.M;
  const cx = width / 2;
  const innerW = cardW - 80;
  const ix = cardX + 40;

  const content = (k: number, dry: boolean, y0 = 0): number => {
    let y = y0;
    y += paragraph(ctx, m.destination, cx, y, innerW, { weight: 900, size: 74 * k, family: f.display, color: accent, maxLines: 1, align: "center", minSize: 40 }, dry) + 8;
    const sub = m.isExperience ? m.subtitle : (m.city ? `Saindo de ${m.city}` : m.subtitle);
    if (sub) y += paragraph(ctx, sub, cx, y, innerW, { weight: 500, size: 28 * k, family: f.sans, color: "#3A3F47", maxLines: 1, align: "center" }, dry) + 20;
    // ícones + pílula do período, centralizados como um grupo
    const icons = m.highlights.slice(0, 5);
    const iconSize = 44 * k;
    const pills = [m.travelPeriod].filter(Boolean) as string[];
    const pillOpts: PillOpts = { bg: accent, fg: contrastOn(accent), size: 22 * k, family: f.sans, weight: 800, h: 44 * k, padX: 20 };
    const pillsW = pills.reduce((acc, t) => acc + pill(ctx, 0, 0, t.toUpperCase(), pillOpts, true) + 14, 0);
    const rowW = icons.length * (iconSize + 22) + pillsW;
    if (!dry) {
      let rx = cx - rowW / 2;
      icons.forEach((h) => {
        drawMonoIcon(ctx, h.icon, rx + iconSize / 2, y + 22 * k, iconSize, accent, 1.6);
        rx += iconSize + 22;
      });
      pills.forEach((t) => { rx += pill(ctx, rx, y, t.toUpperCase(), pillOpts) + 14; });
    }
    y += 44 * k + 28;
    if (m.isExperience) {
      const inc = icons.map((h) => h.text).join("  ·  ");
      y += paragraph(ctx, inc, cx, y, innerW, { weight: 600, size: 24 * k, family: f.sans, color: "#3A3F47", maxLines: 2, align: "center" }, dry) + 22;
      y += experienceBlock(ctx, m, ix, y, innerW, { fg: accent, ctaBg: pop, ctaFg: contrastOn(pop), size: 64 * k, align: "center", withHeadline: false, withSubtitle: false }, dry);
    } else {
      y += priceBlock(ctx, m, ix, y, innerW, { fg: priceColor, accentBg: accent, accentFg: contrastOn(accent), size: (F.story ? 150 : 136) * k, align: "center" }, dry);
    }
    return y - y0;
  };

  const padTop = 60, padBottom = 52;
  const { k, h: contentH } = fitScale((kk, dry) => content(kk, dry), F.bottom - F.top - padTop - padBottom - 40);
  const cardH = padTop + contentH + padBottom;
  const cardY = Math.round(F.top + (F.bottom - F.top - cardH) / 2);

  drawPhoto(m, 0, 0, width, height, 0.45);
  applyVignette(ctx, width, height, 0.35);
  veil(ctx, 0, height - 420, width, height, 0.7);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 40, "#ffffff");
  ctx.restore();
  pill(ctx, cx, cardY - 26, m.promoName.toUpperCase(), { bg: pop, fg: contrastOn(pop), size: 26, family: f.sans, weight: 900, h: 52, padX: 26, align: "center" });
  content(k, false, cardY + padTop);
  if (!m.isExperience) legalLine(ctx, m, F.footerTop - 14);
  await branding(m);
}

/** V6 — Tailândia: foto + bloco inferior em duas colunas; o bloco mede as colunas. */
async function layoutV6(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const accent = isLight(m.primary) ? shadeColor(m.primary, -45) : m.primary;
  const fg = contrastOn(accent);
  const splitX = Math.round(width * 0.5);
  const lcx = splitX / 2;
  const colW = splitX - F.M * 1.3;
  const rx = splitX + F.M - 10;
  const rw = width - splitX - (F.M - 10) * 2;
  const rcx = splitX + (width - splitX) / 2;

  const left = (k: number, dry: boolean, y0 = 0): number => {
    let y = y0;
    y += kickerText(ctx, m, lcx, y, accent, "center", 20 * k, dry) + 2;
    const ds = (F.story ? 84 : 66) * k;
    y += paragraph(ctx, m.destination.toUpperCase(), lcx, y, colW, { weight: 900, size: ds, family: f.display, color: accent, maxLines: 2, align: "center", minSize: 34, lineHeight: ds * 0.98 }, dry) + 12;
    if (m.travelPeriod || m.city) {
      y += paragraph(ctx, [m.travelPeriod, m.city ? `saindo de ${m.city}` : ""].filter(Boolean).join(" · "), lcx, y, colW, { weight: 600, size: 26 * k, family: f.sans, color: "#3A3F47", maxLines: 1, align: "center" }, dry) + 14;
    }
    const icons = m.highlights.slice(0, 5);
    const iconSize = 40 * k;
    if (!dry) {
      let ix = lcx - (icons.length * (iconSize + 18) - 18) / 2;
      icons.forEach((h) => {
        drawMonoIcon(ctx, h.icon, ix + iconSize / 2, y + iconSize / 2, iconSize, accent, 1.6);
        ix += iconSize + 18;
      });
    }
    y += iconSize;
    return y - y0;
  };
  const right = (k: number, dry: boolean, y0 = 0): number => {
    let y = y0;
    if (m.isExperience) {
      y += experienceBlock(ctx, m, rx, y, rw, { fg, ctaBg: fg, ctaFg: accent, size: 60 * k, withHeadline: false }, dry);
    } else {
      y += priceBlock(ctx, m, rx, y, rw, { fg, accentBg: fg, accentFg: accent, size: (F.story ? 136 : 112) * k, align: "center" }, dry);
      if (m.price.pixText) {
        y += 10;
        pill(ctx, rcx, y, m.price.pixText.toUpperCase(), { bg: fg, fg: accent, size: 20 * k, family: f.sans, weight: 900, h: 42 * k, padX: 18, align: "center", maxW: rw }, dry);
        y += 42 * k;
      }
    }
    return y - y0;
  };

  const padTop = F.story ? 64 : 44;
  const maxH = F.bottom - (F.story ? 1100 : 560) - padTop;
  const both = (k: number, dry: boolean) => Math.max(left(k, dry), right(k, dry));
  const { k, h: contentH } = fitScale(both, maxH);
  const blockTop = F.bottom - contentH - padTop;
  // as duas colunas começam na mesma linha e ficam centradas verticalmente no espaço útil
  const lH = left(k, true), rH = right(k, true);
  const leftY = blockTop + padTop + (contentH - lH) / 2;
  const rightY = blockTop + padTop + (contentH - rH) / 2;

  drawPhoto(m, 0, 0, width, blockTop, 0.4);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, blockTop, width, height - blockTop);
  ctx.fillStyle = accent;
  ctx.fillRect(splitX, blockTop, width - splitX, height - blockTop);
  left(k, false, leftY);
  right(k, false, rightY);
  if (m.isExperience) {
    veil(ctx, 0, blockTop - 460, width, blockTop, 0.8);
    const hs = 64;
    const mm = measurePara(ctx, m.headline, width - F.M * 2, { weight: 700, size: hs, family: f.serif, color: "", maxLines: 2, lineHeight: hs * 1.04 });
    paragraph(ctx, m.headline, F.M, blockTop - 44 - mm.h, width - F.M * 2, { weight: 700, size: hs, family: f.serif, color: "#ffffff", maxLines: 2, lineHeight: hs * 1.04 });
  }
  await branding(m, fg);
}

/** V7 — um único cartão no alto (kicker, destino, período, preço/CTA alinhados à esquerda) + faixa "o que inclui". */
async function layoutV7(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const accent = isLight(m.primary) ? shadeColor(m.primary, -45) : m.primary;
  const accentFg = contrastOn(accent);
  const pad = 40;
  const cardX = F.M;
  const cardMaxW = Math.round(width * 0.82) - F.M;
  const innerW = cardMaxW - pad * 2;
  const x = cardX + pad;
  const items = m.highlights.slice(0, 5);
  // faixa "o que inclui"
  const labelH = 2 * 24 * 1.08;
  const bandContentH = 30 + 48 + 16 + labelH + 20;
  const bandH = F.story ? Math.round(bandContentH) : Math.round(bandContentH + F.footerH + 20);
  const bandTop = F.story ? F.bottom - bandH : height - bandH;

  let usedW = 0;
  const content = (k: number, dry: boolean, y0 = 0): number => {
    let y = y0;
    usedW = 0;
    const kw = pill(ctx, x, y, m.promoName.toUpperCase(), { bg: accentFg, fg: accent, size: 20 * k, family: f.sans, weight: 900, h: 40 * k, padX: 18 }, dry);
    usedW = Math.max(usedW, kw);
    y += 40 * k + 22;
    const ds = (F.story ? 88 : 72) * k;
    const mm = measurePara(ctx, m.destination.toUpperCase(), innerW, { weight: 900, size: ds, family: f.display, color: "", maxLines: 2, lineHeight: ds });
    usedW = Math.max(usedW, mm.width);
    y += paragraph(ctx, m.destination.toUpperCase(), x, y, innerW, { weight: 900, size: ds, family: f.display, color: accentFg, maxLines: 2, lineHeight: ds }, dry) + 16;
    if (m.travelPeriod || m.city) {
      const sub = [m.travelPeriod, m.city ? `Saindo de ${m.city}` : ""].filter(Boolean).join(" · ");
      const sm = measurePara(ctx, sub, innerW, { weight: 600, size: 26 * k, family: f.sans, color: "", maxLines: 1 });
      usedW = Math.max(usedW, sm.width);
      y += paragraph(ctx, sub, x, y, innerW, { weight: 600, size: 26 * k, family: f.sans, color: accentFg, maxLines: 1 }, dry) + 22;
    }
    if (m.isExperience) {
      const sm = measurePara(ctx, m.subtitle, innerW, { weight: 500, size: 28 * k, family: f.sans, color: "", maxLines: 2 });
      usedW = Math.max(usedW, sm.width, 330);
      y += experienceBlock(ctx, m, x, y, innerW, { fg: accentFg, ctaBg: accentFg, ctaFg: accent, size: 60 * k, withHeadline: false }, dry);
    } else {
      const pw = priceBlock(ctx, m, x, y, innerW, { fg: accentFg, accentBg: accentFg, accentFg: accent, size: (F.story ? 136 : 112) * k }, dry);
      usedW = Math.max(usedW, Math.min(innerW, 520 * k));
      y += pw;
    }
    return y - y0;
  };

  const startY = F.story ? F.top + 20 : 56;
  const { k, h: contentH } = fitScale((kk, dry) => content(kk, dry), bandTop - 40 - startY - pad * 2);
  content(k, true);
  const cardW = Math.min(cardMaxW, Math.round(usedW + pad * 2));
  const cardH = contentH + pad * 2;

  drawPhoto(m, 0, 0, width, height, 0.5);
  if (F.story) veil(ctx, 0, height - 420, width, height, 0.75);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.30)";
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 12;
  fillRoundRect(ctx, cardX, startY, cardW, cardH, 32, accent);
  ctx.restore();
  content(k, false, startY + pad);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, bandTop, width, bandH);
  const slot = (width - F.M * 2) / Math.max(1, items.length);
  const iy = bandTop + 30;
  items.forEach((h, i) => {
    const cx = F.M + slot * i + slot / 2;
    drawMonoIcon(ctx, h.icon, cx, iy + 24, 48, accent, 1.6);
    paragraph(ctx, h.text, cx, iy + 64, slot - 16, { weight: 700, size: 20, family: f.sans, color: "#15171A", maxLines: 2, align: "center", minSize: 14 });
  });
  await branding(m, F.story ? undefined : "#15171A");
}

/** V8 — NEW YORK: destino em serifa gigante, pílula de oferta e CTA, tudo no mesmo eixo central. */
async function layoutV8(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const accent = isLight(m.secondary) ? m.secondary : (isLight(m.primary) ? m.primary : "#F5C518");
  const accentFg = contrastOn(accent);
  const cx = width / 2;
  const maxW = width - F.M * 2;

  drawPhoto(m, 0, 0, width, height, 0.4);
  applyVignette(ctx, width, height, 0.35);
  veil(ctx, 0, 0, width, F.story ? 520 : 300, 0.55, true);
  veil(ctx, 0, height * 0.42, width, height, 0.88);

  // kicker no topo
  paragraph(ctx, m.isExperience ? m.headline : m.promoName, cx, F.top + 10, maxW, { weight: 500, size: 30, family: f.sans, color: "rgba(255,255,255,0.92)", maxLines: 1, align: "center" });

  const pH = F.story ? 76 : 68;
  const ctaH = F.story ? 72 : 64;
  const p = m.price;
  const offer = m.isExperience
    ? [m.travelPeriod, m.highlights.slice(0, 2).map((h) => h.text).join(" + ")].filter(Boolean).join(" · ")
    : `${p.prefix ? p.prefix + " " : ""}${p.topLabel ? p.topLabel + " " : ""}${p.sym} ${p.intPart}${p.cents ? "," + p.cents : ""}${p.suffix ? " " + p.suffix : ""}`;
  const stackH = pH + 18 + ctaH;
  let y = F.bottom - stackH;
  const destSize = fitSize(ctx, m.destination.toUpperCase(), maxW, 900, F.story ? 150 : 128, f.serif, 60);
  ctx.save();
  setFont(ctx, 900, destSize, f.serif);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 30;
  ctx.fillText(m.destination.toUpperCase(), cx, y - 36);
  ctx.restore();
  if (m.isExperience) {
    paragraph(ctx, m.subtitle, cx, y - 36 - destSize - 56, maxW, { weight: 500, size: 30, family: f.serif, color: "rgba(255,255,255,0.9)", maxLines: 1, align: "center" });
  }
  pill(ctx, cx, y, offer, { bg: accent, fg: accentFg, size: F.story ? 34 : 30, family: f.sans, weight: 800, h: pH, padX: 34, align: "center", maxW });
  y += pH + 18;
  pill(ctx, cx, y, m.isExperience ? CTA_TEXT : "RESERVAR AGORA", { bg: "transparent", fg: accent, size: F.story ? 28 : 26, family: f.sans, weight: 900, h: ctaH, padX: 34, align: "center", stroke: accent });
  await branding(m);
}

/** Coluna escura + coluna da marca: cores das duas colunas a partir da paleta. */
function columnPair(m: ProArtModel) {
  const dark = isLight(m.primary) ? shadeColor(m.primary, -60) : m.primary;
  const side = isLight(m.secondary) ? m.secondary : "#ffffff";
  return { dark, side };
}

/** V9 — "Combo" (Black Friday): coluna escura com headline, checklist em pílulas e preço; coluna da marca com a foto em moldura. */
async function layoutV9(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const { dark, side } = columnPair(m);
  const darkFg = contrastOn(dark);
  const sideFg = contrastOn(side);
  const splitX = Math.round(width * (F.story ? 0.6 : 0.58));
  const x = F.M;
  const w = splitX - F.M - 36;
  const K = F.story ? 1.15 : 1;

  const content = (k: number, dry: boolean, y0 = 0): number => {
    let y = y0;
    pill(ctx, x, y, m.promoName.toUpperCase(), { bg: side, fg: sideFg, size: 20 * K * k, family: f.sans, weight: 900, h: 40 * K * k, padX: 18 }, dry);
    y += 40 * K * k + 22;
    const hs = (F.story ? 80 : 66) * k;
    y += paragraph(ctx, m.isExperience ? m.headline : m.headline, x, y, w, { weight: 900, size: hs, family: f.display, color: darkFg, maxLines: 3, lineHeight: hs * 1.02 }, dry) + 22;
    // checklist em pílulas claras, uma por linha, todas com a mesma largura (a da coluna)
    const items = m.highlights.slice(0, 5);
    const ph = 46 * K * k;
    const icon = 26 * K * k;
    items.forEach((h) => {
      if (!dry) {
        fillRoundRect(ctx, x, y, w, ph, ph / 2, "#ffffff");
        fillRoundRect(ctx, x + 8, y + (ph - icon * 1.3) / 2, icon * 1.3, icon * 1.3, icon * 0.65, side === "#ffffff" ? dark : side);
        drawMonoIcon(ctx, "check", x + 8 + icon * 0.65, y + ph / 2, icon * 0.8, side === "#ffffff" ? darkFg : sideFg, 2);
        ctx.save();
        ctx.fillStyle = "#15171A";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        setFont(ctx, 700, 22 * K * k, f.sans);
        safeFillText(ctx, h.text, x + 8 + icon * 1.3 + 14, y + ph / 2 + 1, w - icon * 1.3 - 40, 14);
        ctx.restore();
      }
      y += ph + 10;
    });
    y += 14;
    if (m.isExperience) {
      y += experienceBlock(ctx, m, x, y, w, { fg: darkFg, ctaBg: side, ctaFg: sideFg, size: 60 * k, withHeadline: false }, dry);
    } else {
      y += priceBlock(ctx, m, x, y, w, { fg: darkFg, accentBg: side, accentFg: sideFg, size: (F.story ? 130 : 108) * k }, dry);
      if (m.price.pixText) {
        y += 10;
        pill(ctx, x, y, m.price.pixText.toUpperCase(), { bg: "transparent", fg: darkFg, size: 18 * K * k, family: f.sans, weight: 900, h: 40 * K * k, padX: 16, stroke: side, maxW: w }, dry);
        y += 40 * K * k;
      }
    }
    return y - y0;
  };

  const { k, h: contentH } = fitScale((kk, dry) => content(kk, dry), F.bottom - F.top);
  const startY = Math.round(F.top + (F.bottom - F.top - contentH) / 2);

  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, splitX, height);
  ctx.fillStyle = side;
  ctx.fillRect(splitX, 0, width - splitX, height);
  // uma foto só, em moldura arredondada, com a mesma margem da coluna
  const pad = 28;
  const fx = splitX + pad;
  const fw = width - splitX - pad * 2;
  const fTop = F.story ? F.top : 40;
  const fBottom = F.footerTop - 24;
  drawPhoto(m, fx, fTop, fw, fBottom - fTop, 0.5, 26);
  content(k, false, startY);
  await branding(m, sideFg);
}

/** V10 — "Jalapão": tudo centralizado numa coluna sobre a foto — nome em script, destino, local, data, ícones com rótulo e selo de preço. */
async function layoutV10(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const accent = isLight(m.secondary) ? m.secondary : (isLight(m.primary) ? m.primary : "#F5C518");
  const accentFg = contrastOn(accent);
  const cx = width / 2;
  const maxW = width - F.M * 2;
  const script = "'Dancing Script', 'Playfair Display', cursive";

  const content = (k: number, dry: boolean, y0 = 0): number => {
    let y = y0;
    y += paragraph(ctx, m.promoName, cx, y, maxW, { weight: 700, size: 52 * k, family: script, color: accent, maxLines: 1, align: "center" }, dry) + 2;
    const ds = (F.story ? 104 : 92) * k;
    y += paragraph(ctx, m.destination, cx, y, maxW, { weight: 900, size: ds, family: f.display, color: "#ffffff", maxLines: 2, align: "center", lineHeight: ds * 0.98 }, dry) + 14;
    if (m.city || m.isExperience) {
      const line = m.city ? `Saindo de ${m.city}` : m.subtitle;
      if (!dry) drawMonoIcon(ctx, "map", cx - (measurePara(ctx, line, maxW, { weight: 600, size: 28 * k, family: f.sans, color: "", maxLines: 1 }).width / 2) - 22, y + 16 * k, 28 * k, accent, 1.8);
      y += paragraph(ctx, line, cx + 14, y, maxW, { weight: 600, size: 28 * k, family: f.sans, color: "#ffffff", maxLines: 1, align: "center" }, dry) + 18;
    }
    if (m.travelPeriod) {
      pill(ctx, cx, y, m.travelPeriod.toUpperCase(), { bg: accent, fg: accentFg, size: 22 * k, family: f.sans, weight: 900, h: 44 * k, padX: 22, align: "center" }, dry);
      y += 44 * k + 26;
    }
    // ícones com rótulo embaixo, em linha centralizada
    const items = m.highlights.slice(0, 6);
    const slot = Math.min(150, maxW / Math.max(1, items.length));
    const startX = cx - (slot * items.length) / 2;
    const iconSize = 40 * k;
    if (!dry) {
      items.forEach((h, i) => {
        const ix = startX + slot * i + slot / 2;
        fillRoundRect(ctx, ix - iconSize * 0.8, y, iconSize * 1.6, iconSize * 1.6, iconSize * 0.8, "rgba(255,255,255,0.14)");
        drawMonoIcon(ctx, h.icon, ix, y + iconSize * 0.8, iconSize, "#ffffff", 1.6);
        paragraph(ctx, h.text, ix, y + iconSize * 1.6 + 8, slot - 10, { weight: 600, size: 16 * k, family: f.sans, color: "rgba(255,255,255,0.92)", maxLines: 2, align: "center", minSize: 12 });
      });
    }
    y += iconSize * 1.6 + 8 + 2 * 16 * k * 1.08 + 26;
    // selo de preço escuro
    const badgeW = Math.min(maxW, 620 * k);
    const bx = cx - badgeW / 2;
    // o subtítulo já apareceu na linha do pino quando não há cidade; aqui entra só com cidade
    const expOpts: ExpOpts = { fg: "#ffffff", ctaBg: accent, ctaFg: accentFg, size: 56 * k, align: "center", withHeadline: false, withSubtitle: !!m.city };
    const inner = m.isExperience
      ? experienceBlock(ctx, m, bx + 32, y + 28, badgeW - 64, expOpts, true)
      : priceBlock(ctx, m, bx + 32, y + 26, badgeW - 64, { fg: "#ffffff", accentBg: accent, accentFg: accentFg, size: (F.story ? 124 : 110) * k, align: "center" }, true);
    const badgeH = inner + 54;
    if (!dry) {
      fillRoundRect(ctx, bx, y, badgeW, badgeH, 30, "rgba(10,10,12,0.78)");
      if (m.isExperience) experienceBlock(ctx, m, bx + 32, y + 28, badgeW - 64, expOpts);
      else priceBlock(ctx, m, bx + 32, y + 26, badgeW - 64, { fg: "#ffffff", accentBg: accent, accentFg: accentFg, size: (F.story ? 124 : 110) * k, align: "center" });
    }
    y += badgeH;
    return y - y0;
  };

  const startY = F.story ? F.top + 10 : 48;
  const { k } = fitScale((kk, dry) => content(kk, dry), F.bottom - startY);

  drawPhoto(m, 0, 0, width, height, 0.5);
  veil(ctx, 0, 0, width, height * 0.62, 0.72, true);
  veil(ctx, 0, height * 0.6, width, height, 0.62);
  content(k, false, startY);
  await branding(m);
}

/** V11 — "Deals": título centrado no alto, caixa de preço + cartão de benefícios lado a lado e CTA de largura cheia. */
async function layoutV11(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const { dark } = columnPair(m);
  const accent = isLight(m.secondary) ? m.secondary : "#ffffff";
  const accentFg = contrastOn(accent);
  const darkFg = contrastOn(dark);
  const cx = width / 2;
  const x = F.M;
  const w = width - F.M * 2;
  const ctaH = F.story ? 84 : 76;
  const ctaY = F.bottom - ctaH;
  const gap = 20;
  const pad = 28;

  const content = (k: number, dry: boolean, y0 = 0): number => {
    let y = y0;
    pill(ctx, cx, y, m.promoName.toUpperCase(), { bg: accent, fg: accentFg, size: 22 * k, family: f.sans, weight: 900, h: 44 * k, padX: 22, align: "center" }, dry);
    y += 44 * k + 18;
    const hs = (F.story ? 96 : 84) * k;
    const titleOpts: ParaOpts = { weight: 900, size: hs, family: f.display, color: "#ffffff", maxLines: 2, align: "center", lineHeight: hs * 0.98 };
    const titleW = measurePara(ctx, m.destination.toUpperCase(), w, titleOpts).width;
    y += paragraph(ctx, m.destination.toUpperCase(), cx, y, w, titleOpts, dry) + 16;
    const inc = m.highlights.slice(0, 3).map((h) => h.text).join(" + ");
    if (inc) {
      pill(ctx, cx, y, inc, { bg: "rgba(255,255,255,0.92)", fg: "#15171A", size: 22 * k, family: f.sans, weight: 700, h: 46 * k, padX: 22, align: "center", maxW: w }, dry);
      y += 46 * k + 30;
    }
    // Duas caixas: cada uma com a largura do próprio conteúdo; juntas ocupam pelo
    // menos a largura do título e ficam centradas sob ele.
    const items = m.highlights.slice(0, 4);
    const maxLeftInner = Math.round(w * 0.55) - pad * 2;
    const priceOpts: PriceOpts = { fg: darkFg, accentBg: accent, accentFg, size: (F.story ? 124 : 108) * k, align: "center" };
    let leftInner = 0;
    let leftNeed = 0;
    if (m.isExperience) {
      const h1 = measurePara(ctx, m.headline, maxLeftInner, { weight: 800, size: 44 * k, family: f.display, color: "", maxLines: 3 });
      const h2 = measurePara(ctx, m.subtitle, maxLeftInner, { weight: 500, size: 24 * k, family: f.sans, color: "", maxLines: 2 });
      leftInner = h1.h + 14 + h2.h;
      leftNeed = Math.ceil(Math.max(h1.width, h2.width, 260));
    } else {
      leftInner = priceBlock(ctx, m, 0, 0, maxLeftInner, priceOpts, true);
      leftNeed = Math.min(maxLeftInner, priceNaturalWidth());
    }
    setFont(ctx, 700, 22 * k, f.sans);
    const rightNeed = Math.ceil(Math.max(200, ...items.map((h) => ctx.measureText(h.text).width)));
    const rowH = 40 * k + 10 + 22 * k * 1.1 + 16;
    const rightInner = items.length * rowH - 16;
    const boxH = Math.max(leftInner, rightInner) + 56;
    let leftW = leftNeed + pad * 2;
    let rightW = rightNeed + 40;
    const minTotal = Math.min(w, Math.max(titleW, leftW + gap + rightW));
    const extra = minTotal - (leftW + gap + rightW);
    if (extra > 0) { leftW += extra / 2; rightW += extra / 2; }
    const total = leftW + gap + rightW;
    const bx = cx - total / 2;
    if (!dry) {
      fillRoundRect(ctx, bx, y, leftW, boxH, 28, dark);
      fillRoundRect(ctx, bx + leftW + gap, y, rightW, boxH, 28, "rgba(255,255,255,0.94)");
      if (m.isExperience) {
        const used = paragraph(ctx, m.headline, bx + pad, y + 28, leftW - pad * 2, { weight: 800, size: 44 * k, family: f.display, color: darkFg, maxLines: 3 });
        paragraph(ctx, m.subtitle, bx + pad, y + 28 + used + 14, leftW - pad * 2, { weight: 500, size: 24 * k, family: f.sans, color: darkFg, maxLines: 2 });
      } else {
        priceBlock(ctx, m, bx + pad, y + 28 + (boxH - 56 - leftInner) / 2, leftW - pad * 2, priceOpts);
      }
      const rcx = bx + leftW + gap + rightW / 2;
      let ry = y + 28 + (boxH - 56 - rightInner) / 2;
      items.forEach((h) => {
        drawMonoIcon(ctx, h.icon, rcx, ry + 20 * k, 40 * k, dark, 1.6);
        paragraph(ctx, h.text, rcx, ry + 40 * k + 10, rightW - 24, { weight: 700, size: 22 * k, family: f.sans, color: "#15171A", maxLines: 1, align: "center" });
        ry += rowH;
      });
    }
    y += boxH;
    return y - y0;
  };

  const startY = F.story ? F.top + 10 : 48;
  const { k, h: contentH } = fitScale((kk, dry) => content(kk, dry), ctaY - 30 - startY);
  // CTA logo abaixo das caixas (conversa com o bloco), nunca abaixo do limite do rodapé
  const ctaTop = Math.min(ctaY, startY + contentH + 34);

  drawPhoto(m, 0, 0, width, height, 0.5);
  veil(ctx, 0, 0, width, Math.max(height * 0.5, ctaTop + ctaH + 60), 0.7, true);
  veil(ctx, 0, height * 0.6, width, height, 0.7);
  content(k, false, startY);
  // CTA centrado, com a largura do próprio texto
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  pill(ctx, cx, ctaTop, m.isExperience ? `${CTA_TEXT}  →` : "RESERVAR AGORA  →", { bg: accent, fg: accentFg, size: F.story ? 32 : 28, family: f.sans, weight: 900, h: ctaH, padX: 56, align: "center", maxW: w });
  ctx.restore();
  await branding(m);
}

const LAYOUTS: Record<number, (m: ProArtModel) => Promise<void>> = {
  0: layoutV0, 1: layoutV1, 2: layoutV2, 3: layoutV3, 4: layoutV4, 5: layoutV5, 6: layoutV6, 7: layoutV7, 8: layoutV8,
  9: layoutV9, 10: layoutV10, 11: layoutV11,
};

/** Total de variações do motor (a UI e o rodízio usam este número). */
export const PRO_TOTAL_VARIANTS = 12;

/** Variações já redesenhadas (as demais continuam no motor antigo até serem aprovadas). */
export const PRO_VARIANTS = new Set<number>(Array.from({ length: PRO_TOTAL_VARIANTS }, (_, i) => i));

export async function renderProLayout(m: ProArtModel, variant: number): Promise<void> {
  const fn = LAYOUTS[variant];
  if (!fn) throw new Error(`Layout pro V${variant} não existe`);
  m.ctx.save();
  m.ctx.textAlign = "left";
  m.ctx.textBaseline = "alphabetic";
  await fn(m);
  m.ctx.restore();
}
