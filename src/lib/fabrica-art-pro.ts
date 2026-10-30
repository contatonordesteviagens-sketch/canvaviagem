/**
 * LAYOUTS PRO — redesenho das artes V0–V8 a partir das referências de mercado
 * (CVC, Decolar, Clube Turismo, Enseada, Batata Turismo, hotéis de luxo).
 *
 * Regras que todos os layouts obedecem (nota 15 do segundo cérebro):
 * - grid com margem lateral fixa; stories respeitam 250px no topo e ~310px na base;
 * - um único ponto focal (preço na oferta, headline na experiência);
 * - texto nunca solto sobre foto crua: sempre dentro de cartão, bloco ou véu;
 * - bloco de cor chapada no máximo ~40% da arte e sempre denso;
 * - ícones sempre com rótulo; logo e contatos discretos (drawFinalBranding).
 *
 * Este arquivo só desenha. Quem monta o modelo é `composeTravelAd` (fabrica-compose-art.ts).
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
  sym: string;         // "R$"
  intPart: string;     // "1.499"
  cents: string;       // "90" ou ""
  topLabel: string;    // "10x" | "A VISTA" ...
  prefix: string;      // "a partir de"
  suffix: string;      // "por pessoa"
  total: string;       // "R$ 1.499,00" ou ""
  pixText: string;     // "5% OFF À VISTA NO PIX" ou ""
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

const CTA_TEXT = "RESERVE AGORA";
const CTA_TEXT_SOFT = "Reserve agora";

// ───────────────────────── utilitários de desenho ─────────────────────────

const isLight = (hex: string) => contrastOn(hex) !== "#ffffff";

type Fonts = { sans: string; display: string; serif: string };
const fontsOf = (m: ProArtModel): Fonts => {
  const user = (m.fontFamily || "").trim();
  const sans = user ? `${user}, Inter, Arial, sans-serif` : "Inter, Arial, sans-serif";
  return {
    sans,
    display: user ? sans : "Outfit, Inter, Arial, sans-serif",
    serif: "'Playfair Display', Georgia, serif",
  };
};

function setFont(ctx: CanvasRenderingContext2D, weight: number | string, size: number, family: string) {
  ctx.font = `${weight} ${size}px ${family}`;
}

/** Reduz a fonte até `text` caber em `maxW`. Devolve o tamanho final. */
function fitSize(ctx: CanvasRenderingContext2D, text: string, maxW: number, weight: number | string, size: number, family: string, minSize = 18) {
  let s = size;
  setFont(ctx, weight, s, family);
  while (ctx.measureText(text).width > maxW && s > minSize) {
    s -= 2;
    setFont(ctx, weight, s, family);
  }
  return s;
}

/** Texto em várias linhas; devolve a altura ocupada. */
function paragraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  opts: { weight: number | string; size: number; family: string; color: string; maxLines: number; lineHeight?: number; align?: CanvasTextAlign; minSize?: number; letterSpacing?: number },
): number {
  if (!text) return 0;
  let size = opts.size;
  const minSize = opts.minSize ?? Math.round(opts.size * 0.6);
  let lines: string[] = [];
  // encolhe até caber em maxLines
  for (;;) {
    setFont(ctx, opts.weight, size, opts.family);
    lines = wrapTextSafe(ctx, text, maxW, opts.maxLines + 1, minSize);
    if (lines.length <= opts.maxLines || size <= minSize) break;
    size -= 2;
  }
  lines = lines.slice(0, opts.maxLines);
  const lh = opts.lineHeight ?? size * 1.08;
  ctx.save();
  ctx.fillStyle = opts.color;
  ctx.textAlign = opts.align ?? "left";
  ctx.textBaseline = "alphabetic";
  if (opts.letterSpacing && "letterSpacing" in ctx) (ctx as any).letterSpacing = `${opts.letterSpacing}px`;
  lines.forEach((ln, i) => safeFillText(ctx, ln, x, y + size + i * lh, maxW, minSize));
  ctx.restore();
  return lines.length * lh;
}

/** Pílula com texto. Devolve a largura. */
function pill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  o: { bg: string; fg: string; size: number; family: string; weight?: number | string; h?: number; padX?: number; align?: "left" | "center" | "right"; maxW?: number; stroke?: string },
): number {
  const h = o.h ?? Math.round(o.size * 1.9);
  const padX = o.padX ?? Math.round(o.size * 0.9);
  const maxTextW = (o.maxW ?? 9999) - padX * 2;
  const size = fitSize(ctx, text, maxTextW, o.weight ?? 800, o.size, o.family, 14);
  const w = Math.ceil(ctx.measureText(text).width + padX * 2);
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

/** Lista vertical de benefícios com ícone. Devolve a altura. */
function iconList(
  ctx: CanvasRenderingContext2D,
  items: ProHighlight[],
  x: number,
  y: number,
  maxW: number,
  o: { size: number; family: string; color: string; iconColor?: string; gap?: number; iconBg?: string; columns?: 1 | 2 },
): number {
  if (!items.length) return 0;
  const gap = o.gap ?? Math.round(o.size * 1.9);
  const icon = Math.round(o.size * 1.25);
  const cols = o.columns ?? 1;
  const colW = cols === 2 ? maxW / 2 : maxW;
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  items.forEach((h, i) => {
    const col = cols === 2 ? i % 2 : 0;
    const row = cols === 2 ? Math.floor(i / 2) : i;
    const cx = x + col * colW;
    const cy = y + row * gap + gap / 2;
    if (o.iconBg) fillRoundRect(ctx, cx, cy - icon * 0.8, icon * 1.6, icon * 1.6, icon * 0.5, o.iconBg);
    drawMonoIcon(ctx, h.icon, cx + icon * 0.8, cy, icon, o.iconColor ?? o.color, 1.6);
    ctx.fillStyle = o.color;
    setFont(ctx, 600, o.size, o.family);
    safeFillText(ctx, h.text, cx + icon * 1.9, cy + 1, colW - icon * 2.2, Math.round(o.size * 0.7));
  });
  ctx.restore();
  const rows = cols === 2 ? Math.ceil(items.length / 2) : items.length;
  return rows * gap;
}

/** Linha "7 dias | ✈ 🏨 🍳" estilo CVC. Devolve a altura. */
function iconStrip(ctx: CanvasRenderingContext2D, m: ProArtModel, x: number, y: number, color: string, size = 26): number {
  const f = fontsOf(m);
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
    ctx.fillStyle = color;
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

/**
 * Bloco de preço estilo CVC: "a partir de" · pílula "10X" · R$ 149,90 · total.
 * Alinhado à esquerda em `x`. Devolve a altura ocupada.
 */
function priceBlock(
  ctx: CanvasRenderingContext2D,
  m: ProArtModel,
  x: number,
  y: number,
  maxW: number,
  o: { fg: string; accentBg: string; accentFg: string; size?: number; align?: "left" | "right" | "center"; showTotal?: boolean },
): number {
  const f = fontsOf(m);
  const p = m.price;
  const S = o.size ?? 150; // tamanho do número
  const align = o.align ?? "left";
  let cursorY = y;

  ctx.save();
  ctx.textBaseline = "alphabetic";

  // 1. prefixo
  if (p.prefix) {
    setFont(ctx, 700, Math.round(S * 0.18), f.sans);
    ctx.fillStyle = o.fg;
    ctx.textAlign = align === "center" ? "center" : align === "right" ? "right" : "left";
    ctx.fillText(p.prefix.toUpperCase(), align === "center" ? x + maxW / 2 : align === "right" ? x + maxW : x, cursorY + Math.round(S * 0.18));
    cursorY += Math.round(S * 0.30);
  }

  // 2. pílula + preço: mede tudo para alinhar
  const pillLabel = (p.topLabel || "").trim();
  const pillSize = Math.round(S * 0.26);
  const pillH = Math.round(pillSize * 1.8);
  setFont(ctx, 900, pillSize, f.display);
  const pillW = pillLabel ? Math.ceil(ctx.measureText(pillLabel).width + pillSize * 1.2) : 0;
  const symSize = Math.round(S * 0.30);
  const centsSize = Math.round(S * 0.32);
  let numSize = S;
  setFont(ctx, 900, numSize, f.display);
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
  while (mm.total > maxW && numSize > 60) {
    numSize -= 4;
    mm = measure();
  }
  const groupW = mm.total;
  const startX = align === "center" ? x + (maxW - groupW) / 2 : align === "right" ? x + maxW - groupW : x;
  const baseline = cursorY + numSize * 0.78;
  let cx = startX;
  if (pillLabel) {
    pill(ctx, cx, baseline - pillH - numSize * 0.05, pillLabel, { bg: o.accentBg, fg: o.accentFg, size: pillSize, family: f.display, weight: 900, h: pillH, padX: pillSize * 0.6 });
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
  cursorY += Math.round(numSize * 0.9);

  // 3. sufixo + total
  const small = Math.round(S * 0.17);
  setFont(ctx, 600, small, f.sans);
  ctx.fillStyle = o.fg;
  ctx.globalAlpha = 0.85;
  ctx.textAlign = align === "center" ? "center" : align === "right" ? "right" : "left";
  const tx = align === "center" ? x + maxW / 2 : align === "right" ? x + maxW : x;
  const tail = [p.suffix, (o.showTotal ?? true) && p.total ? `Total ${p.total}` : ""].filter(Boolean).join("  ·  ");
  if (tail) {
    cursorY += small * 0.4;
    safeFillText(ctx, tail, tx, cursorY + small, maxW, 14);
    cursorY += small * 1.3;
  }
  ctx.restore();
  return cursorY - y;
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

/** Bloco de experiência: headline + subtítulo + CTA. Substitui o bloco de preço. Devolve a altura. */
function experienceBlock(
  ctx: CanvasRenderingContext2D,
  m: ProArtModel,
  x: number,
  y: number,
  maxW: number,
  o: { fg: string; ctaBg: string; ctaFg: string; size?: number; align?: "left" | "center"; serif?: boolean; withHeadline?: boolean; withSubtitle?: boolean },
): number {
  const f = fontsOf(m);
  const S = o.size ?? 64;
  const align = o.align ?? "left";
  let cy = y;
  if (o.withHeadline ?? true) {
    cy += paragraph(ctx, m.headline, align === "center" ? x + maxW / 2 : x, cy, maxW, { weight: o.serif ? 700 : 900, size: S, family: o.serif ? f.serif : f.display, color: o.fg, maxLines: 3, align, lineHeight: S * 1.04 });
    cy += S * 0.25;
  }
  if (m.subtitle && (o.withSubtitle ?? true)) {
    cy += paragraph(ctx, m.subtitle, align === "center" ? x + maxW / 2 : x, cy, maxW, { weight: 500, size: Math.round(S * 0.46), family: f.sans, color: o.fg, maxLines: 2, align });
    cy += S * 0.35;
  }
  // CTA: nunca menor que 26px, para ser clicável aos olhos
  const ctaSize = Math.max(26, Math.round(S * 0.48));
  const ctaX = align === "center" ? x + maxW / 2 : x;
  pill(ctx, ctaX, cy, CTA_TEXT, { bg: o.ctaBg, fg: o.ctaFg, size: ctaSize, family: f.sans, weight: 900, align: align === "center" ? "center" : "left", padX: ctaSize * 1.2, h: Math.round(ctaSize * 2.1) });
  cy += Math.round(ctaSize * 2.1);
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

/** Véu escuro vertical (de `from` até `to`), para texto sobre foto. */
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

function legalLine(ctx: CanvasRenderingContext2D, m: ProArtModel, y: number, color = "rgba(255,255,255,0.75)") {
  const f = fontsOf(m);
  const parts = [m.city ? `Saída de ${m.city}` : "", m.travelPeriod ? `Período: ${m.travelPeriod}` : "", "Valores por pessoa, sujeitos a disponibilidade."];
  const text = parts.filter(Boolean).join(" · ");
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  setFont(ctx, 500, 18, f.sans);
  safeFillText(ctx, text, m.width / 2, y, m.width - 120, 12);
  ctx.restore();
}

async function branding(m: ProArtModel, contactColor?: string) {
  await drawFinalBranding(m.ctx, m.width, m.height, m.logoDataUrl, m.contact1, m.contact2, m.textColorOverride, m.fontFamily, false, m.logoFormat, false, contactColor);
}

/** Geometria comum. */
function frame(m: ProArtModel) {
  const story = m.format === "story";
  return {
    story,
    M: story ? 80 : 72,                  // margem lateral
    top: story ? 250 : 72,               // primeiro Y útil
    bottom: story ? 1540 : 910,          // último Y útil (acima do rodapé de branding)
    footerTop: story ? m.height - 350 : m.height - 140,
  };
}

/** Escolhe o par (fundo do cartão, cor de destaque) a partir das cores da marca. */
function brandPair(m: ProArtModel) {
  const primaryLight = isLight(m.primary);
  const secondaryLight = isLight(m.secondary);
  // cartão sempre na cor clara se houver uma; destaque na outra
  if (secondaryLight && !primaryLight) return { card: m.secondary, accent: m.primary };
  if (primaryLight && !secondaryLight) return { card: m.primary, accent: m.secondary };
  if (secondaryLight && primaryLight) return { card: m.secondary, accent: shadeColor(m.primary, -45) };
  return { card: "#ffffff", accent: m.primary };
}

// ───────────────────────────── LAYOUTS ─────────────────────────────

/** V0 — "Enseada": bloco superior denso (headline, pílula, benefícios | preço) + foto embaixo. */
async function layoutV0(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const { card, accent } = brandPair(m);
  const fg = contrastOn(card);
  const k = F.story ? 1.25 : 1; // stories: tudo um pouco maior para o bloco ficar denso
  const x = F.M;
  const w = width - F.M * 2;
  const headSize = F.story ? 96 : 78;
  const priceSize = F.story ? 150 : 118;

  // Mede o conteúdo antes de pintar: a altura do bloco acompanha o texto
  // (destino longo = duas linhas), em vez de o texto vazar para a foto.
  setFont(ctx, 900, headSize, f.display);
  const headLines = Math.min(2, wrapTextSafe(ctx, m.headline, w, 3, Math.round(headSize * 0.6)).length);
  const listRows = Math.min(4, m.highlights.length);
  const columnsH = Math.max(listRows * 50 * k, m.isExperience ? 64 * k * 1.9 : priceSize * 1.5 + (F.story && m.price.pixText ? 62 : 0));
  const startY = F.story ? F.top + 10 : 56;
  const contentH = (44 * k + 26) + headLines * headSize * 1.02 + 18 + (m.city ? 46 * k + 24 : 8) + columnsH;
  const blockH = Math.min(Math.round(height * (F.story ? 0.5 : 0.56)), Math.round(startY + contentH + 36));

  drawPhoto(m, 0, blockH, width, height - blockH, 0.5);
  veil(ctx, 0, height - 420, width, height, 0.7);
  ctx.fillStyle = card;
  ctx.fillRect(0, 0, width, blockH);

  let y = startY;

  // kicker
  const kickerW = pill(ctx, x, y, m.promoName.toUpperCase(), { bg: accent, fg: contrastOn(accent), size: 22 * k, family: f.sans, weight: 900, h: 44 * k, padX: 20 });
  if (m.travelPeriod) {
    pill(ctx, x + kickerW + 12, y, m.travelPeriod.toUpperCase(), { bg: "transparent", fg, size: 22 * k, family: f.sans, weight: 800, h: 44 * k, padX: 18, stroke: fg });
  }
  y += 44 * k + 26;

  // headline
  y += paragraph(ctx, m.headline, x, y, w, { weight: 900, size: headSize, family: f.display, color: fg, maxLines: 2, lineHeight: headSize * 1.02 });
  y += 18;

  // sub: cidade de saída
  if (m.city) {
    pill(ctx, x, y, `Saindo de ${m.city}`, { bg: accent, fg: contrastOn(accent), size: 24 * k, family: f.sans, weight: 800, h: 46 * k, padX: 20 });
    y += 46 * k + 24;
  } else {
    y += 8;
  }

  // duas colunas: benefícios | preço
  const colGap = 40;
  const leftW = Math.round(w * 0.46);
  const rightX = x + leftW + colGap;
  const rightW = w - leftW - colGap;
  const listH = iconList(ctx, m.highlights.slice(0, 4), x, y, leftW, { size: 28 * k, family: f.sans, color: fg, iconColor: accent, gap: 50 * k });
  if (m.isExperience) {
    experienceBlock(ctx, m, rightX, y, rightW, { fg, ctaBg: accent, ctaFg: contrastOn(accent), size: 64 * k, withHeadline: false });
  } else {
    const used = priceBlock(ctx, m, rightX, y - 6, rightW, { fg, accentBg: accent, accentFg: contrastOn(accent), size: priceSize, align: "right" });
    if (F.story && m.price.pixText) {
      pill(ctx, x + w, y + used + 12, m.price.pixText.toUpperCase(), { bg: accent, fg: contrastOn(accent), size: 24, family: f.sans, weight: 900, h: 50, padX: 22, align: "right" });
    }
  }
  y += Math.max(listH, 160);

  // linha de separação sutil entre bloco e foto
  ctx.fillStyle = accent;
  ctx.fillRect(0, blockH - 8, width, 8);

  if (!m.isExperience) legalLine(ctx, m, F.footerTop - 16);
  await branding(m);
}

/** V1 — "Conheça": painel claro lateral com título em faixa que invade a foto. */
async function layoutV1(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const panelW = Math.round(width * (F.story ? 0.56 : 0.5));
  const cream = "#F8F5EE";
  const ink = "#15171A";
  const accent = isLight(m.primary) ? shadeColor(m.primary, -45) : m.primary;

  drawPhoto(m, panelW, 0, width - panelW, height, 0.5);
  veil(ctx, panelW, height - 360, width - panelW, height, 0.75);
  ctx.fillStyle = cream;
  ctx.fillRect(0, 0, panelW, height);

  const x = F.M;
  const w = panelW - F.M - 36;
  let y = F.story ? F.top + 90 : 84;

  // kicker
  setFont(ctx, 700, 22, f.sans);
  ctx.fillStyle = accent;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  (ctx as any).letterSpacing = "3px";
  ctx.fillText(m.promoName.toUpperCase(), x, y + 22);
  (ctx as any).letterSpacing = "0px";
  y += 56;

  // faixa com o título, invadindo a foto
  const ribbonSize = F.story ? 86 : 64;
  setFont(ctx, 900, ribbonSize, f.display);
  const title1 = m.isExperience ? "Viva" : "Conheça";
  const lines = wrapTextSafe(ctx, `${m.destination}!`, panelW + 120 - x - 40, 2, 40);
  const ribbonH = 36 + ribbonSize * 0.95 + lines.length * ribbonSize * 1.0 + 24;
  const ribbonW = panelW + (F.story ? 90 : 120) - 0;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 10;
  fillRoundRect(ctx, -40, y, ribbonW + 40, ribbonH, 28, accent);
  ctx.restore();
  ctx.fillStyle = contrastOn(accent);
  setFont(ctx, 400, Math.round(ribbonSize * 0.8), f.display);
  ctx.fillText(title1, x, y + 36 + ribbonSize * 0.75);
  setFont(ctx, 900, ribbonSize, f.display);
  lines.forEach((ln, i) => ctx.fillText(ln, x, y + 36 + ribbonSize * 0.75 + (i + 1) * ribbonSize * 1.0));
  y += ribbonH + 44;

  // período / saída
  if (m.travelPeriod || m.city) {
    const sub = [m.travelPeriod, m.city ? `Saindo de ${m.city}` : ""].filter(Boolean).join(" · ");
    pill(ctx, x, y, sub.toUpperCase(), { bg: "transparent", fg: accent, size: F.story ? 24 : 20, family: f.sans, weight: 800, h: F.story ? 48 : 40, padX: 18, stroke: accent, maxW: w });
    y += (F.story ? 48 : 40) + 26;
  }

  // benefícios
  y += iconList(ctx, m.highlights.slice(0, 4), x, y, w, { size: F.story ? 38 : 30, family: f.sans, color: ink, iconColor: accent, gap: F.story ? 88 : 60 });
  y += F.story ? 44 : 28;

  // preço / CTA
  if (m.isExperience) {
    y += experienceBlock(ctx, m, x, y, w, { fg: ink, ctaBg: accent, ctaFg: contrastOn(accent), size: F.story ? 80 : 60, withHeadline: false });
  } else {
    const used = priceBlock(ctx, m, x, y, w, { fg: accent, accentBg: accent, accentFg: contrastOn(accent), size: F.story ? 164 : 110 });
    y += used + 16;
    if (m.price.pixText) {
      pill(ctx, x, y, m.price.pixText.toUpperCase(), { bg: accent, fg: contrastOn(accent), size: F.story ? 24 : 20, family: f.sans, weight: 900, h: F.story ? 50 : 42, padX: 20, maxW: w });
      y += (F.story ? 50 : 42) + 30;
    }
  }
  // story: frase de apoio para o painel não terminar no vazio
  if (F.story && m.subtitle && y + 80 < F.footerTop) {
    paragraph(ctx, m.subtitle, x, y + 20, w, { weight: 500, size: 30, family: f.serif, color: "#3A3F47", maxLines: 2 });
  }

  // linha fina decorativa
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(x, F.footerTop - 30, w, 2);
  ctx.globalAlpha = 1;

  await branding(m);
}

/** V2 — foto em cima, bloco claro embaixo com título em faixa (Santa Teresa). */
async function layoutV2(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const ink = "#15171A";
  const accent = isLight(m.primary) ? shadeColor(m.primary, -45) : m.primary;
  const soft = isLight(m.secondary) ? m.secondary : "#F2F4F7";
  const photoH = F.story ? 1150 : 560;
  const k = F.story ? 1.2 : 1;

  drawPhoto(m, 0, 0, width, photoH, 0.45);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, photoH, width, height - photoH);

  const x = F.M;
  const w = width - F.M * 2;
  // faixa do título sobre a emenda
  const ribbonSize = F.story ? 76 : 66;
  setFont(ctx, 900, ribbonSize, f.display);
  const text = `${m.isExperience ? "Viva" : "Conheça"} ${m.destination}!`;
  const size = fitSize(ctx, text, width - x - 40, 900, ribbonSize, f.display, 40);
  const tw = ctx.measureText(text).width;
  const ribbonH = Math.round(size * 1.5);
  const ribbonY = photoH - ribbonH / 2 - 10;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  fillRoundRect(ctx, -30, ribbonY, Math.min(width - 30, x + tw + 60) + 30, ribbonH, 24, accent);
  ctx.restore();
  ctx.fillStyle = contrastOn(accent);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  setFont(ctx, 900, size, f.display);
  ctx.fillText(text, x, ribbonY + ribbonH / 2 + 2);

  let y = ribbonY + ribbonH + 36;
  if (m.isExperience) {
    y += iconList(ctx, m.highlights.slice(0, 4), x, y, w, { size: 30 * k, family: f.sans, color: ink, iconColor: accent, gap: 56 * k, columns: 2 });
    y += 16;
    experienceBlock(ctx, m, x, y, w, { fg: ink, ctaBg: accent, ctaFg: contrastOn(accent), size: 60 * k, withHeadline: false });
  } else {
    const leftW = Math.round(w * 0.5);
    iconList(ctx, m.highlights.slice(0, 4), x, y, leftW, { size: 30 * k, family: f.sans, color: ink, iconColor: accent, gap: 58 * k });
    // preço em cartão suave à direita
    const cardX = x + leftW + 24;
    const cardW = w - leftW - 24;
    const cardH = F.story ? 280 : 220;
    fillRoundRect(ctx, cardX, y - 10, cardW, cardH, 28, soft);
    priceBlock(ctx, m, cardX + 28, y + 14, cardW - 56, { fg: contrastOn(soft) === "#ffffff" ? "#ffffff" : accent, accentBg: accent, accentFg: contrastOn(accent), size: F.story ? 118 : 96, align: "center" });
    y += Math.max(cardH, 4 * 58 * k);
    if (m.price.pixText) {
      y += 10;
      pill(ctx, x, y, m.price.pixText.toUpperCase(), { bg: accent, fg: contrastOn(accent), size: 22 * k, family: f.sans, weight: 800, h: 44 * k, padX: 20 });
    }
  }
  // site/contatos em tinta escura sobre o bloco branco
  await branding(m, ink);
}

/** V3 — cartão CVC: foto 100% + cartão arredondado na cor da marca com preço gigante e faixa Pix. */
async function layoutV3(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const { card, accent } = brandPair(m);
  const fg = contrastOn(card);

  drawPhoto(m, 0, 0, width, height, 0.4);
  veil(ctx, 0, height - 520, width, height, 0.72);

  const cardW = F.story ? width - F.M * 2 : Math.round(width * 0.66);
  const cardX = F.story ? F.M : F.M;
  const pad = 44;
  const innerW = cardW - pad * 2;
  // altura medida: cabeçalho + strip + preço/experiência + pix
  const headH = 150;
  const stripH = 56;
  const bodyH = m.isExperience ? 300 : (F.story ? 330 : 300);
  const pixH = !m.isExperience && m.price.pixText ? 64 : 0;
  const cardH = pad + headH + stripH + bodyH + pixH + (pixH ? 0 : pad * 0.6);
  const cardY = F.story ? Math.round(F.top + (F.bottom - F.top - cardH) / 2) : Math.max(F.top, Math.round(F.bottom - cardH - 36));

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 36, card);
  ctx.restore();

  let y = cardY + pad;
  const x = cardX + pad;
  // cabeçalho: PACOTE + destino
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  setFont(ctx, 900, 34, f.display);
  ctx.fillStyle = fg;
  (ctx as any).letterSpacing = "2px";
  ctx.fillText(m.promoName.toUpperCase(), x, y + 30);
  (ctx as any).letterSpacing = "0px";
  y += 44;
  y += paragraph(ctx, m.destination, x, y, innerW, { weight: 400, size: 64, family: f.display, color: fg, maxLines: 1, minSize: 36 });
  y += 14;
  y += iconStrip(ctx, m, x, y, fg, 26);
  y += 10;
  if (m.isExperience) {
    experienceBlock(ctx, m, x, y, innerW, { fg, ctaBg: accent, ctaFg: contrastOn(accent), size: 52 });
  } else {
    priceBlock(ctx, m, x, y, innerW, { fg, accentBg: accent, accentFg: contrastOn(accent), size: F.story ? 170 : 150 });
    if (pixH) pixStripe(ctx, m, cardX, cardY + cardH - pixH, cardW, pixH, accent, 36);
  }
  if (!m.isExperience) legalLine(ctx, m, F.footerTop - 16);
  await branding(m);
}

/** V4 — Decolar: foto em moldura no topo + bloco escuro com "Pacote | DESTINO" e dois cartões. */
async function layoutV4(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const base = isLight(m.primary) ? shadeColor(m.primary, -60) : m.primary;
  const accent = isLight(m.secondary) ? m.secondary : "#ffffff";
  const fg = contrastOn(base);

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);
  const topY = F.story ? F.top : 40;
  const photoH = F.story ? 760 : 470;
  drawPhoto(m, F.M - 20, topY, width - (F.M - 20) * 2, photoH, 0.45, 36);
  // selo no topo da foto
  pill(ctx, width / 2, topY + 28, m.promoName.toUpperCase(), { bg: accent, fg: contrastOn(accent), size: 24, family: f.sans, weight: 900, h: 50, padX: 24, align: "center" });

  let y = topY + photoH + 44;
  const x = F.M;
  const w = width - F.M * 2;
  // "Pacote | DESTINO"
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  setFont(ctx, 500, 40, f.display);
  ctx.fillStyle = fg;
  const label = m.isExperience ? "Experiência" : "Pacote";
  ctx.fillText(label, x, y + 40);
  const lw = ctx.measureText(label).width + 28;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(x + lw, y + 4, 2, 46);
  ctx.globalAlpha = 1;
  const destSize = fitSize(ctx, m.destination.toUpperCase(), w - lw - 28, 900, 58, f.display, 30);
  ctx.fillStyle = accent;
  setFont(ctx, 900, destSize, f.display);
  ctx.fillText(m.destination.toUpperCase(), x + lw + 28, y + 42);
  y += 86;

  // dois cartões
  const gap = 20;
  const leftW = Math.round(w * 0.58);
  const rightW = w - leftW - gap;
  const cardH = F.story ? 300 : 250;
  const soft = "rgba(255,255,255,0.10)";
  fillRoundRect(ctx, x, y, leftW, cardH, 26, soft);
  fillRoundRect(ctx, x + leftW + gap, y, rightW, cardH, 26, soft);
  if (m.isExperience) {
    experienceBlock(ctx, m, x + 28, y + 30, leftW - 56, { fg, ctaBg: accent, ctaFg: contrastOn(accent), size: 64, withHeadline: false });
  } else {
    priceBlock(ctx, m, x + 28, y + 22, leftW - 56, { fg, accentBg: accent, accentFg: contrastOn(accent), size: F.story ? 124 : 112, showTotal: true });
  }
  // cartão direito: o que inclui
  const rx = x + leftW + gap + 24;
  let ry = y + 26;
  if (m.travelPeriod) {
    setFont(ctx, 900, 30, f.display);
    ctx.fillStyle = accent;
    ctx.fillText(m.travelPeriod, rx, ry + 28);
    ry += 54;
  }
  iconList(ctx, m.highlights.slice(0, 4), rx, ry, rightW - 48, { size: 24, family: f.sans, color: fg, iconColor: accent, gap: 44 });
  if (m.isExperience) {
    // headline editorial em serifa abaixo dos cartões
    paragraph(ctx, m.headline, x, y + cardH + 22, w, { weight: 600, size: F.story ? 44 : 36, family: f.serif, color: fg, maxLines: 2 });
  } else {
    legalLine(ctx, m, F.footerTop - 16, "rgba(255,255,255,0.6)");
  }
  await branding(m);
}

/** V5 — Cartagena: cartão branco centrado com pílula na borda, ícones em pílulas e preço na cor da marca. */
async function layoutV5(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const accent = isLight(m.primary) ? shadeColor(m.primary, -45) : m.primary;
  const pop = isLight(m.secondary) && m.secondary.toLowerCase() !== "#ffffff" ? shadeColor(m.secondary, -10) : accent;

  drawPhoto(m, 0, 0, width, height, 0.45);
  applyVignette(ctx, width, height, 0.35);
  veil(ctx, 0, height - 420, width, height, 0.7);

  const cardW = width - F.M * 2;
  const cardX = F.M;
  const cardH = m.isExperience ? (F.story ? 560 : 500) : (F.story ? 620 : 540);
  const cardY = Math.round(F.top + (F.bottom - F.top - cardH) / 2) + (F.story ? 0 : 20);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 40, "#ffffff");
  ctx.restore();
  pill(ctx, width / 2, cardY - 26, m.promoName.toUpperCase(), { bg: pop, fg: contrastOn(pop), size: 26, family: f.sans, weight: 900, h: 52, padX: 26, align: "center" });

  const cx = width / 2;
  const innerW = cardW - 80;
  let y = cardY + 64;
  y += paragraph(ctx, m.destination, cx, y, innerW, { weight: 900, size: 74, family: f.display, color: accent, maxLines: 1, align: "center", minSize: 40 });
  y += 10;
  if (m.subtitle || m.city) {
    y += paragraph(ctx, m.isExperience ? m.subtitle : (m.city ? `Saindo de ${m.city}` : m.subtitle), cx, y, innerW, { weight: 500, size: 28, family: f.sans, color: "#3A3F47", maxLines: 1, align: "center" });
    y += 22;
  }
  // linha de ícones + pílulas
  const icons = m.highlights.slice(0, 4);
  const iconSize = 44;
  const pillTexts = [m.travelPeriod].filter(Boolean) as string[];
  setFont(ctx, 800, 22, f.sans);
  const pillsW = pillTexts.reduce((acc, t) => acc + ctx.measureText(t.toUpperCase()).width + 40 + 14, 0);
  const rowW = icons.length * (iconSize + 22) + pillsW;
  let rx = cx - rowW / 2;
  icons.forEach((h) => {
    drawMonoIcon(ctx, h.icon, rx + iconSize / 2, y + 22, iconSize, accent, 1.6);
    rx += iconSize + 22;
  });
  pillTexts.forEach((t) => {
    rx += pill(ctx, rx, y, t.toUpperCase(), { bg: accent, fg: contrastOn(accent), size: 22, family: f.sans, weight: 800, h: 44, padX: 20 }) + 14;
  });
  y += 44 + 34;
  if (m.isExperience) {
    // nomes dos benefícios em texto corrido
    const inc = icons.map((h) => h.text).join("  ·  ");
    y += paragraph(ctx, inc, cx, y, innerW, { weight: 600, size: 24, family: f.sans, color: "#3A3F47", maxLines: 2, align: "center" });
    y += 24;
    experienceBlock(ctx, m, cardX + 40, y, innerW, { fg: accent, ctaBg: pop, ctaFg: contrastOn(pop), size: 64, align: "center", withHeadline: false, withSubtitle: false });
  } else {
    priceBlock(ctx, m, cardX + 40, y, innerW, { fg: pop === accent ? accent : pop, accentBg: accent, accentFg: contrastOn(accent), size: F.story ? 150 : 136, align: "center" });
  }
  if (!m.isExperience) legalLine(ctx, m, F.footerTop - 16);
  await branding(m);
}

/** V6 — Tailândia: foto 64% + bloco inferior em duas colunas (destino | preço). */
async function layoutV6(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const accent = isLight(m.primary) ? shadeColor(m.primary, -45) : m.primary;
  // O bloco inclui a faixa do rodapé (logo à esquerda, contatos à direita), então o
  // conteúdo das colunas termina em F.footerTop.
  const blockH = F.story ? 640 : 440;
  const photoH = height - blockH;

  drawPhoto(m, 0, 0, width, photoH, 0.4);
  // bloco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, photoH, width, blockH);
  const splitX = Math.round(width * 0.5);
  ctx.fillStyle = accent;
  ctx.fillRect(splitX, photoH, width - splitX, blockH);

  // coluna esquerda: kicker, destino, período, ícones (centralizado na coluna)
  const lcx = splitX / 2;
  const colW = splitX - F.M * 1.3;
  let y = photoH + (F.story ? 64 : 44);
  setFont(ctx, 700, 20, f.sans);
  ctx.fillStyle = accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  (ctx as any).letterSpacing = "3px";
  ctx.fillText(m.promoName.toUpperCase(), lcx, y);
  (ctx as any).letterSpacing = "0px";
  y += 16;
  const destSize = F.story ? 84 : 66;
  y += paragraph(ctx, m.destination.toUpperCase(), lcx, y, colW, { weight: 900, size: destSize, family: f.display, color: accent, maxLines: 2, align: "center", minSize: 36, lineHeight: destSize * 0.98 });
  y += 14;
  if (m.travelPeriod || m.city) {
    y += paragraph(ctx, [m.travelPeriod, m.city ? `saindo de ${m.city}` : ""].filter(Boolean).join(" · "), lcx, y, colW, { weight: 600, size: 26, family: f.sans, color: "#3A3F47", maxLines: 1, align: "center" });
    y += 12;
  }
  // ícones em linha (só glifos), centralizados; os rótulos ficam para as variações com mais espaço
  const icons = m.highlights.slice(0, 4);
  const iconSize = 40;
  let ix = lcx - (icons.length * (iconSize + 18) - 18) / 2;
  icons.forEach((h) => {
    drawMonoIcon(ctx, h.icon, ix + iconSize / 2, y + iconSize / 2 + 8, iconSize, accent, 1.6);
    ix += iconSize + 18;
  });

  // coluna direita
  const rx = splitX + F.M - 10;
  const rw = width - splitX - (F.M - 10) * 2;
  const fg = contrastOn(accent);
  const ry = photoH + (F.story ? 80 : 44);
  if (m.isExperience) {
    experienceBlock(ctx, m, rx, ry, rw, { fg, ctaBg: fg, ctaFg: accent, size: 60, withHeadline: false });
  } else {
    const used = priceBlock(ctx, m, rx, ry, rw, { fg, accentBg: fg, accentFg: accent, size: F.story ? 136 : 112, align: "center" });
    const pillY = ry + used + 10;
    if (m.price.pixText && pillY + 46 < F.footerTop) {
      pill(ctx, splitX + (width - splitX) / 2, pillY, m.price.pixText.toUpperCase(), { bg: fg, fg: accent, size: 20, family: f.sans, weight: 900, h: 42, padX: 18, align: "center", maxW: rw });
    }
  }
  // headline da experiência em serifa sobre a foto, dentro de véu
  if (m.isExperience) {
    veil(ctx, 0, photoH - 460, width, photoH, 0.8);
    paragraph(ctx, m.headline, F.M, photoH - 50 - 2 * 66, width - F.M * 2, { weight: 700, size: 64, family: f.serif, color: "#ffffff", maxLines: 2, lineHeight: 66 });
  }
  // contatos ficam sobre a coluna da cor da marca: cor de contraste dela
  await branding(m, fg);
}

/** V7 — Gricel: título em bloco no alto, faixa branca na base com o que inclui. */
async function layoutV7(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const accent = isLight(m.primary) ? shadeColor(m.primary, -45) : m.primary;
  const accentFg = contrastOn(accent);
  // Faixa branca "o que inclui". No quadrado ela é o rodapé (contatos em tinta escura
  // dentro dela); no story ela fica acima da zona que o Instagram cobre e o rodapé
  // continua sobre a foto.
  const bandH = F.story ? 160 : 300;
  const bandTop = F.story ? 1380 : height - bandH;

  drawPhoto(m, 0, 0, width, height, 0.5);
  veil(ctx, 0, 0, width, F.story ? 900 : 520, 0.6, true);
  if (F.story) veil(ctx, 0, height - 420, width, height, 0.75);

  const x = F.M;
  const w = Math.round(width * 0.78);
  let y = F.story ? F.top + 10 : 56;
  // kicker em pílula
  pill(ctx, x, y, m.promoName.toUpperCase(), { bg: accent, fg: accentFg, size: 22, family: f.sans, weight: 900, h: 44, padX: 20 });
  y += 44 + 22;
  // destino em bloco de cor
  const destSize = F.story ? 88 : 74;
  setFont(ctx, 900, destSize, f.display);
  const lines = wrapTextSafe(ctx, m.destination.toUpperCase(), w - 60, 2, 40);
  const blockH = lines.length * destSize * 1.0 + 50;
  const blockW = Math.min(w, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 60);
  fillRoundRect(ctx, x, y, blockW, blockH, 20, "#ffffff");
  ctx.fillStyle = accent;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  lines.forEach((ln, i) => ctx.fillText(ln, x + 30, y + 25 + destSize * 0.85 + i * destSize));
  y += blockH + 22;
  // subtítulo em pílula
  if (m.travelPeriod || m.city) {
    const sub = [m.travelPeriod, m.city ? `Saindo de ${m.city}` : ""].filter(Boolean).join(" · ");
    pill(ctx, x, y, sub, { bg: accent, fg: accentFg, size: 24, family: f.sans, weight: 700, h: 48, padX: 22, maxW: w });
    y += 48 + 22;
  }
  // preço/CTA em pílula grande
  if (m.isExperience) {
    y += paragraph(ctx, m.headline, x, y, w, { weight: 700, size: 52, family: f.serif, color: "#ffffff", maxLines: 2 });
    y += 24;
    pill(ctx, x, y, CTA_TEXT, { bg: accent, fg: accentFg, size: 28, family: f.sans, weight: 900, h: 64, padX: 32 });
  } else {
    const p = m.price;
    const label = `${p.prefix ? p.prefix.toUpperCase() + " " : ""}${p.topLabel ? p.topLabel + " " : ""}${p.sym} ${p.intPart}${p.cents ? "," + p.cents : ""}`;
    pill(ctx, x, y, label, { bg: accent, fg: accentFg, size: F.story ? 44 : 40, family: f.display, weight: 900, h: F.story ? 92 : 84, padX: 36, maxW: width - x * 2 });
    y += (F.story ? 92 : 84) + 14;
    setFont(ctx, 600, 24, f.sans);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.textAlign = "left";
    ctx.fillText([p.suffix, p.total ? `total ${p.total}` : ""].filter(Boolean).join(" · "), x + 6, y + 24);
  }
  // faixa branca: o que inclui
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, bandTop, width, bandH);
  const items = m.highlights.slice(0, 5);
  const slot = (width - F.M * 2) / Math.max(1, items.length);
  const iy = bandTop + 30;
  items.forEach((h, i) => {
    const cx = F.M + slot * i + slot / 2;
    drawMonoIcon(ctx, h.icon, cx, iy + 24, 48, accent, 1.6);
    paragraph(ctx, h.text, cx, iy + 64, slot - 16, { weight: 700, size: 20, family: f.sans, color: "#15171A", maxLines: 2, align: "center", minSize: 14 });
  });
  await branding(m, F.story ? undefined : "#15171A");
}

/** V8 — NEW YORK: destino em serifa gigante sobre véu, pílula de oferta e CTA. */
async function layoutV8(m: ProArtModel) {
  const { ctx, width, height } = m;
  const F = frame(m);
  const f = fontsOf(m);
  const accent = isLight(m.secondary) ? m.secondary : (isLight(m.primary) ? m.primary : "#F5C518");
  const accentFg = contrastOn(accent);

  drawPhoto(m, 0, 0, width, height, 0.4);
  applyVignette(ctx, width, height, 0.35);
  veil(ctx, 0, 0, width, F.story ? 520 : 300, 0.55, true);
  veil(ctx, 0, height * 0.42, width, height, 0.88);

  const cx = width / 2;
  // kicker no topo
  setFont(ctx, 500, 30, f.sans);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(m.isExperience ? m.headline : m.promoName, cx, F.top + 40);

  // destino gigante
  const bottomY = F.bottom - (F.story ? 40 : 10);
  const pillH = F.story ? 76 : 68;
  const ctaH = F.story ? 72 : 64;
  const stackH = pillH + 18 + ctaH;
  let y = bottomY - stackH;
  const destSize = fitSize(ctx, m.destination.toUpperCase(), width - F.M * 2, 900, F.story ? 150 : 128, f.serif, 60);
  setFont(ctx, 900, destSize, f.serif);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 30;
  ctx.fillText(m.destination.toUpperCase(), cx, y - 36);
  ctx.shadowBlur = 0;
  if (m.isExperience) {
    // subtítulo editorial acima do destino
    paragraph(ctx, m.subtitle, cx, y - 36 - destSize - 60, width - F.M * 2, { weight: 500, size: 30, family: f.serif, color: "rgba(255,255,255,0.9)", maxLines: 1, align: "center" });
  }
  // pílula de oferta / período
  const p = m.price;
  const offer = m.isExperience
    ? [m.travelPeriod, m.highlights.slice(0, 2).map((h) => h.text).join(" + ")].filter(Boolean).join(" · ")
    : `${p.prefix ? p.prefix + " " : ""}${p.topLabel ? p.topLabel + " " : ""}${p.sym} ${p.intPart}${p.cents ? "," + p.cents : ""}${p.suffix ? " " + p.suffix : ""}`;
  pill(ctx, cx, y, offer, { bg: accent, fg: accentFg, size: F.story ? 34 : 30, family: f.sans, weight: 800, h: pillH, padX: 34, align: "center", maxW: width - F.M * 2 });
  y += pillH + 18;
  pill(ctx, cx, y, m.isExperience ? CTA_TEXT : "RESERVAR AGORA", { bg: "transparent", fg: accent, size: F.story ? 28 : 26, family: f.sans, weight: 900, h: ctaH, padX: 34, align: "center", stroke: accent });
  await branding(m);
}

const LAYOUTS: Record<number, (m: ProArtModel) => Promise<void>> = {
  0: layoutV0, 1: layoutV1, 2: layoutV2, 3: layoutV3, 4: layoutV4, 5: layoutV5, 6: layoutV6, 7: layoutV7, 8: layoutV8,
};

/** Variações já redesenhadas (as demais continuam no motor antigo até serem aprovadas). */
export const PRO_VARIANTS = new Set<number>([0, 1, 2, 3, 4, 5, 6, 7, 8]);

export async function renderProLayout(m: ProArtModel, variant: number): Promise<void> {
  const fn = LAYOUTS[variant];
  if (!fn) throw new Error(`Layout pro V${variant} não existe`);
  m.ctx.save();
  m.ctx.textAlign = "left";
  m.ctx.textBaseline = "alphabetic";
  await fn(m);
  m.ctx.restore();
}

// Referência rápida para quem for ajustar: CTA_TEXT_SOFT fica disponível para variações futuras.
export { CTA_TEXT, CTA_TEXT_SOFT };
