type Format = "square" | "story";
type IconKey = "bus" | "hotel" | "plane" | "check" | "star" | "heart" | "sun" | "camera" | "map" | "food" | "ship" | "palm" | "coffee" | "guide" | "wifi";

// Escurece (percent < 0) ou clareia (percent > 0) uma cor hex (#rgb / #rrggbb).
// Usado para derivar tons (ex.: anel mais escuro do box V3 a partir do secondaryColor).
function shadeColor(hex: string, percent: number): string {
  let h = (hex || "").trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return hex;
  const num = parseInt(h, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  r = Math.round((t - r) * p) + r;
  g = Math.round((t - g) * p) + g;
  b = Math.round((t - b) * p) + b;
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// Luminância relativa (0..1) de uma cor hex.
function luminance(hex: string): number {
  let h = (hex || "").trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return 0.5;
  const num = parseInt(h, 16);
  const r = ((num >> 16) & 0xff) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Retorna preto ou branco com melhor contraste sobre `bg`.
function contrastOn(bg: string): string {
  return luminance(bg) > 0.6 ? "#0d0d0d" : "#ffffff";
}

/**
 * Garante contraste mínimo entre `fg` (cor preferida do usuário) e `bg`.
 * Se a diferença de luminância for baixa, devolve preto/branco em vez de `fg`.
 */
function ensureContrast(fg: string, bg: string, minDelta = 0.35): string {
  const dl = Math.abs(luminance(fg) - luminance(bg));
  if (dl >= minDelta) return fg;
  return contrastOn(bg);
}

export type PaymentMode =
  | "installments"
  | "cash"
  | "cash_discount"
  | "from"
  | "daily"
  | "monthly"
  | "down_plus"
  | "free_quote"
  | "custom_label";

interface Highlight {
  text: string;
  icon?: IconKey;
}

interface ComposeTravelAdOptions {
  imageUrl: string;
  format: Format;
  destination: string;
  city?: string;
  primaryColor: string;
  secondaryColor: string;
  price: string;
  installments: string;
  promoName: string;
  highlights: Highlight[];
  hasLogo?: boolean;
  paymentMode?: PaymentMode;
  paymentLabel?: string;
  paymentSuffix?: string;
  strategy?: "ancora" | "vitrine" | "matriz" | "gancho" | "experiencia_hero" | "experiencia_editorial" | "experiencia_postcard" | "experiencia_lifestyle";
  variation?: number;
  /** Força uma variante específica (0..2 para Sua Imagem + Oferta + 1:1). Quando definido, ignora variation%N. */
  forceVariant?: number;
  /** Quando definido, sobrescreve o pool aleatório de headlines e usa este texto como título principal em todas as variantes. */
  titleOverride?: string;
  /** Pool de variações de título (uma por variante). Se fornecido, tem prioridade sobre titleOverride: usa-se titleVariations[variantIndex % len]. */
  titleVariations?: string[];
  /** Símbolo de moeda exibido antes do preço (R$, US$, €, £, AR$). Default "R$". */
  currencySymbol?: string;
  /** V4: período exibido na linha de informações (ex.: "5 dias", "Janeiro", "12 a 18/01"). */
  travelPeriod?: string;
  /** V3: texto livre do "Total" (ex.: "R$ 1.999 por casal"). Se vazio, calcula automático. */
  totalOverride?: string;
  /** V3: controla se a linha de total aparece no box. Default true. */
  showTotal?: boolean;
  /** V3: texto da faixa azul do Pix. Default "{N}% OFF À VISTA NO pix". */
  pixBannerText?: string;
  /** V3: mostra/esconde a faixa azul do Pix. Default true. */
  showPixBanner?: boolean;
  /** Família de fonte global a aplicar em TODOS os textos do anúncio. Default: Inter. */
  fontFamily?: string;
  /** Multiplicador de escala global para títulos/preços/textos grandes (>=22px). Default 1. */
  titleScale?: number;
  /** Multiplicador de escala global para descrição/labels/textos pequenos (<22px). Default 1. */
  descScale?: number;
  /** Cor que substitui o texto branco padrão (#fff/#ffffff). Útil para alinhar texto à identidade da marca. */
  textColorOverride?: string;
}

const ICON_SYMBOL: Record<IconKey, string> = {
  bus: "🚌",
  hotel: "🛏",
  plane: "✈",
  check: "✓",
  star: "★",
  heart: "♥",
  sun: "☀",
  camera: "📷",
  map: "⌖",
  food: "🍽",
  ship: "⛴",
  palm: "🌴",
  coffee: "☕",
  guide: "◎",
  wifi: "◉",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem base"));
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.restore();
}

/**
 * Desenha um ícone vetorial monocromático sólido para a V3 (sem emojis coloridos).
 * Tudo é desenhado como silhueta preenchida na cor `color` (geralmente navy).
 * Caixa de tamanho `size` × `size` centralizada em (cx, cy).
 */
function drawMonoIcon(
  ctx: CanvasRenderingContext2D,
  kind: IconKey,
  cx: number,
  cy: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  const s = size;
  const x = cx - s / 2;
  const y = cy - s / 2;

  switch (kind) {
    case "plane": {
      // Avião visto de cima — corpo + asas largas + cauda
      ctx.translate(cx, cy);
      ctx.rotate(-Math.PI / 6);
      ctx.beginPath();
      // fuselagem
      ctx.moveTo(0, -s * 0.46);
      ctx.lineTo(s * 0.06, -s * 0.34);
      // asa direita
      ctx.lineTo(s * 0.06, -s * 0.06);
      ctx.lineTo(s * 0.46, s * 0.14);
      ctx.lineTo(s * 0.46, s * 0.22);
      ctx.lineTo(s * 0.06, s * 0.16);
      // corpo p/ cauda
      ctx.lineTo(s * 0.06, s * 0.32);
      // cauda direita
      ctx.lineTo(s * 0.2, s * 0.42);
      ctx.lineTo(s * 0.2, s * 0.48);
      ctx.lineTo(0, s * 0.42);
      // espelha
      ctx.lineTo(-s * 0.2, s * 0.48);
      ctx.lineTo(-s * 0.2, s * 0.42);
      ctx.lineTo(-s * 0.06, s * 0.32);
      ctx.lineTo(-s * 0.06, s * 0.16);
      ctx.lineTo(-s * 0.46, s * 0.22);
      ctx.lineTo(-s * 0.46, s * 0.14);
      ctx.lineTo(-s * 0.06, -s * 0.06);
      ctx.lineTo(-s * 0.06, -s * 0.34);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "bus": {
      // Van/ônibus — corpo arredondado largo + 2 rodas grandes
      const bx = x + s * 0.05, by = y + s * 0.22, bw = s * 0.9, bh = s * 0.46;
      roundRect(ctx, bx, by, bw, bh, s * 0.14);
      ctx.fill();
      // rodas (silhueta sólida, levemente encostadas no corpo)
      ctx.beginPath();
      ctx.arc(bx + bw * 0.22, by + bh + s * 0.04, s * 0.13, 0, Math.PI * 2);
      ctx.arc(bx + bw * 0.78, by + bh + s * 0.04, s * 0.13, 0, Math.PI * 2);
      ctx.fill();
      // pequena saliência indicando para-brisa (recorte branco)
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      roundRect(ctx, bx + s * 0.1, by + s * 0.08, bw - s * 0.2, s * 0.16, s * 0.05);
      ctx.fill();
      ctx.restore();
      break;
    }
    case "hotel": {
      // Prédio: base + cobertura inclinada + janelas
      const hx = x + s * 0.1, hy = y + s * 0.28, hw = s * 0.8, hh = s * 0.6;
      ctx.fillRect(hx, hy, hw, hh);
      // telhado
      ctx.beginPath();
      ctx.moveTo(hx - s * 0.04, hy);
      ctx.lineTo(hx + hw + s * 0.04, hy);
      ctx.lineTo(hx + hw, hy - s * 0.12);
      ctx.lineTo(hx, hy - s * 0.12);
      ctx.closePath();
      ctx.fill();
      // janelas e porta (recortes)
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      const winS = s * 0.1;
      const gap = s * 0.08;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.fillRect(hx + s * 0.1 + c * (winS + gap), hy + s * 0.08 + r * (winS + gap * 0.6), winS, winS);
        }
      }
      // porta
      ctx.fillRect(hx + hw / 2 - s * 0.08, hy + hh - s * 0.2, s * 0.16, s * 0.2);
      ctx.restore();
      break;
    }
    case "coffee": {
      // Xícara cheia + alça + pires + vapor
      const cw = s * 0.62, ch = s * 0.42;
      const cxL = cx - cw / 2, cyT = cy - ch / 2 + s * 0.04;
      // corpo
      ctx.beginPath();
      ctx.moveTo(cxL, cyT);
      ctx.lineTo(cxL + cw, cyT);
      ctx.lineTo(cxL + cw - s * 0.06, cyT + ch);
      ctx.lineTo(cxL + s * 0.06, cyT + ch);
      ctx.closePath();
      ctx.fill();
      // alça
      ctx.lineWidth = s * 0.07;
      ctx.beginPath();
      ctx.arc(cxL + cw + s * 0.04, cyT + ch * 0.45, s * 0.13, -Math.PI / 2.2, Math.PI / 2.2);
      ctx.stroke();
      // pires
      roundRect(ctx, cx - s * 0.42, cyT + ch + s * 0.02, s * 0.84, s * 0.08, s * 0.04);
      ctx.fill();
      // vapor (3 fios)
      ctx.lineWidth = s * 0.06;
      ctx.lineCap = "round";
      for (let i = -1; i <= 1; i++) {
        const vx = cx + i * s * 0.16;
        ctx.beginPath();
        ctx.moveTo(vx, cyT - s * 0.04);
        ctx.quadraticCurveTo(vx + s * 0.08, cyT - s * 0.18, vx, cyT - s * 0.32);
        ctx.stroke();
      }
      break;
    }
    case "camera": {
      // Câmera: corpo + saliência do flash + lente com anel
      const bx = x + s * 0.05, by = y + s * 0.3, bw = s * 0.9, bh = s * 0.5;
      roundRect(ctx, bx, by, bw, bh, s * 0.1);
      ctx.fill();
      // saliência superior (visor)
      roundRect(ctx, x + s * 0.3, y + s * 0.18, s * 0.4, s * 0.16, s * 0.04);
      ctx.fill();
      // flash
      ctx.fillRect(x + s * 0.74, y + s * 0.2, s * 0.1, s * 0.1);
      // lente (anel grosso)
      ctx.beginPath();
      ctx.arc(cx, by + bh / 2, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(cx, by + bh / 2, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // ponto central da lente
      ctx.beginPath();
      ctx.arc(cx, by + bh / 2, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "ship": {
      // navio: casco trapezoidal + cabine
      ctx.beginPath();
      ctx.moveTo(x + s * 0.05, y + s * 0.62);
      ctx.lineTo(x + s * 0.95, y + s * 0.62);
      ctx.lineTo(x + s * 0.82, y + s * 0.86);
      ctx.lineTo(x + s * 0.18, y + s * 0.86);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(x + s * 0.28, y + s * 0.4, s * 0.44, s * 0.22);
      ctx.fillRect(x + s * 0.4, y + s * 0.22, s * 0.2, s * 0.18);
      break;
    }
    case "palm": {
      // palmeira simples
      ctx.fillRect(cx - s * 0.04, y + s * 0.4, s * 0.08, s * 0.5);
      ctx.beginPath();
      ctx.arc(cx, y + s * 0.38, s * 0.32, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "sun": {
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = s * 0.08;
      ctx.lineCap = "round";
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * s * 0.32, cy + Math.sin(a) * s * 0.32);
        ctx.lineTo(cx + Math.cos(a) * s * 0.44, cy + Math.sin(a) * s * 0.44);
        ctx.stroke();
      }
      break;
    }
    case "map": {
      // pin de mapa
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.05, s * 0.28, Math.PI, 0);
      ctx.lineTo(cx, cy + s * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.06, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }
    case "food": {
      // garfo (3 dentes) + faca
      ctx.lineWidth = s * 0.07;
      ctx.lineCap = "round";
      // garfo
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.22, y + s * 0.1);
      ctx.lineTo(cx - s * 0.22, y + s * 0.9);
      ctx.moveTo(cx - s * 0.34, y + s * 0.1);
      ctx.lineTo(cx - s * 0.34, y + s * 0.32);
      ctx.moveTo(cx - s * 0.1, y + s * 0.1);
      ctx.lineTo(cx - s * 0.1, y + s * 0.32);
      ctx.stroke();
      ctx.fillRect(cx - s * 0.36, y + s * 0.3, s * 0.28, s * 0.08);
      // faca
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.18, y + s * 0.1);
      ctx.lineTo(cx + s * 0.32, y + s * 0.1);
      ctx.lineTo(cx + s * 0.28, y + s * 0.46);
      ctx.lineTo(cx + s * 0.22, y + s * 0.46);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(cx + s * 0.22, y + s * 0.46, s * 0.06, s * 0.42);
      break;
    }
    case "check": {
      ctx.lineWidth = s * 0.16;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(x + s * 0.18, cy + s * 0.04);
      ctx.lineTo(x + s * 0.42, cy + s * 0.24);
      ctx.lineTo(x + s * 0.84, cy - s * 0.22);
      ctx.stroke();
      break;
    }
    case "star": {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (Math.PI * i) / 5;
        const r = i % 2 === 0 ? s * 0.45 : s * 0.2;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "heart": {
      ctx.beginPath();
      ctx.moveTo(cx, cy + s * 0.36);
      ctx.bezierCurveTo(cx - s * 0.6, cy - s * 0.06, cx - s * 0.24, cy - s * 0.42, cx, cy - s * 0.12);
      ctx.bezierCurveTo(cx + s * 0.24, cy - s * 0.42, cx + s * 0.6, cy - s * 0.06, cx, cy + s * 0.36);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "guide": {
      // pessoa: cabeça + tronco
      ctx.beginPath();
      ctx.arc(cx, y + s * 0.26, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.34, y + s * 0.92);
      ctx.quadraticCurveTo(cx, y + s * 0.4, cx + s * 0.34, y + s * 0.92);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "wifi": {
      ctx.lineWidth = s * 0.09;
      ctx.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy + s * 0.22, s * (0.18 + i * 0.14), -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy + s * 0.22, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: {
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.32, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

/**
 * Desenha o glifo do Pix (4 losangos formando um padrão de "X"/diamante).
 * Centralizado em (cx, cy), tamanho total `size`.
 */
function drawPixLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(cx, cy);
  // 4 losangos pequenos posicionados em N/S/L/O formando o glifo do Pix
  const r = size * 0.18; // metade do lado do losango
  const off = size * 0.28; // distância do centro
  const drawDiamond = (px: number, py: number) => {
    ctx.beginPath();
    ctx.moveTo(px, py - r);
    ctx.lineTo(px + r, py);
    ctx.lineTo(px, py + r);
    ctx.lineTo(px - r, py);
    ctx.closePath();
    ctx.fill();
  };
  drawDiamond(0, -off); // topo
  drawDiamond(off, 0);  // direita
  drawDiamond(0, off);  // base
  drawDiamond(-off, 0); // esquerda
  ctx.restore();
}

function fitCover(
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number,
  focusY = 0.45,
) {
  const sourceRatio = sourceW / sourceH;
  const targetRatio = targetW / targetH;

  if (sourceRatio > targetRatio) {
    const sw = sourceH * targetRatio;
    const sx = (sourceW - sw) / 2;
    return { sx, sy: 0, sw, sh: sourceH };
  }

  const sh = sourceW / targetRatio;
  const free = Math.max(0, sourceH - sh);
  const sy = free * focusY;
  return { sx: 0, sy: Math.min(free, sy), sw: sourceW, sh };
}

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
  options?: { fontWeight?: string; fontFamily?: string; baseFontSize?: number; minFontSize?: number },
) {
  const fw = options?.fontWeight ?? "900";
  const ff = options?.fontFamily ?? "Inter, Arial, sans-serif";
  const baseSize = options?.baseFontSize ?? 0;
  const minSize = options?.minFontSize ?? 28;

  // Auto-shrink: if any word is wider than maxWidth, scale the font down until it fits.
  let fontSize = baseSize;
  if (baseSize > 0) {
    const longest = text.trim().split(/\s+/).reduce((a, b) => (a.length >= b.length ? a : b), "");
    while (fontSize > minSize) {
      ctx.font = `${fw} ${fontSize}px ${ff}`;
      if (ctx.measureText(longest).width <= maxWidth) break;
      fontSize -= 4;
    }
    ctx.font = `${fw} ${fontSize}px ${ff}`;
    lineHeight = Math.round(fontSize * 1.05);
  }

  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) break;
  }

  if (current && lines.length < maxLines) lines.push(current);

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

export async function composeTravelAd(options: ComposeTravelAdOptions): Promise<string> {
  const {
    imageUrl,
    format,
    destination,
    city,
    primaryColor,
    secondaryColor,
    price,
    installments,
    promoName,
    highlights,
    hasLogo,
    paymentMode = "installments",
    paymentLabel,
    paymentSuffix,
    strategy = "vitrine",
    variation = 0,
    forceVariant,
    titleOverride,
    titleVariations,
    currencySymbol,
    travelPeriod,
    totalOverride,
    showTotal = true,
    pixBannerText,
    showPixBanner = true,
    fontFamily,
    titleScale = 1,
    descScale = 1,
    textColorOverride,
  } = options;
  const curSym = (currencySymbol || "R$").trim();
  const priceValueText = (price || "").trim();
  const priceWithSymbol = /^(R\$|US\$|AR\$|€|£|[A-Z]{1,3}\$)/i.test(priceValueText)
    ? priceValueText
    : `${curSym} ${priceValueText}`.trim();

  const width = 1080;
  const height = format === "story" ? 1920 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D não suportado");

  // ====== Font customization global (família + escala título/descrição) ======
  // Intercepta o setter de `font` e o `fillStyle` para que TODAS as variantes/categorias
  // respeitem as escolhas do usuário sem precisar reescrever cada ctx.font do arquivo.
  const userFamily = (fontFamily || "").trim();
  const wantsCustomFont = !!userFamily && userFamily.toLowerCase() !== "inter";
  const wantsScale = (titleScale !== 1) || (descScale !== 1);
  const wantsColorOverride = !!textColorOverride && /^#?[0-9a-f]{3,8}$/i.test(textColorOverride.replace("#", ""));
  const overrideColorHex = wantsColorOverride
    ? (textColorOverride!.startsWith("#") ? textColorOverride! : `#${textColorOverride}`)
    : "";

  if (wantsCustomFont || wantsScale) {
    const fontRe = /^(.*?)(\d+(?:\.\d+)?)px\s+(.+)$/; // captura: prefix(weight/style) | size | family
    const proto = Object.getPrototypeOf(ctx) as any;
    const desc = Object.getOwnPropertyDescriptor(proto, "font");
    if (desc && desc.set && desc.get) {
      const origSet = desc.set.bind(ctx);
      const origGet = desc.get.bind(ctx);
      Object.defineProperty(ctx, "font", {
        configurable: true,
        get: () => origGet(),
        set: (val: string) => {
          try {
            const m = String(val).match(fontRe);
            if (m) {
              const prefix = m[1].trim();
              const size = parseFloat(m[2]);
              const fam = wantsCustomFont ? `${userFamily}, Inter, Arial, sans-serif` : m[3];
              const scale = size >= 22 ? titleScale : descScale;
              const newSize = Math.max(8, Math.round(size * scale));
              origSet(`${prefix ? prefix + " " : ""}${newSize}px ${fam}`);
              return;
            }
          } catch {}
          origSet(val);
        },
      });
    }
  }

  // Override de cor: aplica a TODOS os textos (fillText/strokeText), preservando
  // backgrounds e elementos gráficos (fillRect, etc).
  if (wantsColorOverride) {
    const origFillText = ctx.fillText.bind(ctx);
    const origStrokeText = ctx.strokeText.bind(ctx);
    ctx.fillText = ((text: string, x: number, y: number, maxWidth?: number) => {
      const prev = ctx.fillStyle;
      ctx.fillStyle = overrideColorHex;
      if (maxWidth !== undefined) origFillText(text, x, y, maxWidth);
      else origFillText(text, x, y);
      ctx.fillStyle = prev;
    }) as any;
    ctx.strokeText = ((text: string, x: number, y: number, maxWidth?: number) => {
      const prev = ctx.strokeStyle;
      ctx.strokeStyle = overrideColorHex;
      if (maxWidth !== undefined) origStrokeText(text, x, y, maxWidth);
      else origStrokeText(text, x, y);
      ctx.strokeStyle = prev;
    }) as any;
  }

  // Garante que a fonte custom esteja carregada ANTES de qualquer fillText.
  if (wantsCustomFont && (document as any).fonts?.load) {
    try {
      await Promise.all([
        (document as any).fonts.load(`900 60px "${userFamily}"`),
        (document as any).fonts.load(`700 30px "${userFamily}"`),
        (document as any).fonts.load(`500 20px "${userFamily}"`),
        (document as any).fonts.load(`400 16px "${userFamily}"`),
      ]);
    } catch {}
  }
  // V0/V1_Experiencia usam Playfair Display + Dancing Script — pré-carrega.
  if (strategy.startsWith("experiencia_") && (document as any).fonts?.load) {
    try {
      await Promise.all([
        (document as any).fonts.load(`800 44px "Playfair Display"`),
        (document as any).fonts.load(`700 36px "Playfair Display"`),
        (document as any).fonts.load(`italic 500 24px "Playfair Display"`),
        (document as any).fonts.load(`600 32px "Dancing Script"`),
      ]);
    } catch {}
  }

  const image = await loadImage(imageUrl);

  // Title-case helper to evitar "saindo de fortaleza" minusculo
  const toTitle = (s?: string) =>
    (s || "")
      .trim()
      .toLocaleLowerCase("pt-BR")
      .split(/\s+/)
      .map((w) => (w.length <= 2 && /^(de|da|do|e)$/i.test(w) ? w : w.charAt(0).toLocaleUpperCase("pt-BR") + w.slice(1)))
      .join(" ");

  const cityFmt = toTitle(city);
  const destFmt = toTitle(destination);
  const isExperience = strategy.startsWith("experiencia_");
  const hasDest = destFmt.length > 0;

  // Pools de headlines — variantes que dependem do destino só entram se houver destino preenchido.
  // Frases banidas globalmente (alinhado com edge function): "O melhor de", "Seu próximo destino é esse".
  const experienceBase = [
    "Momentos que ficam para sempre",
    "Partiu viajar?",
    "Uma experiência diferente de tudo",
    "Dias que você não esquece",
    "Histórias começam aqui",
    "Memórias que você leva pra vida",
  ];
  const experienceWithDest = hasDest
    ? [`${destFmt} como você nunca viu`, `Viva ${destFmt} de verdade`]
    : [];
  const ofertaBase = [
    "Partiu viajar?",
    "Preço especial para viajar",
    "Vagas limitadas, garanta a sua",
  ];
  const ofertaWithDest = hasDest
    ? [`Pacote para ${destFmt}`, `${destFmt} te espera`, `Vamos para ${destFmt}?`]
    : [];

  const headlinePool = isExperience
    ? [...experienceBase, ...experienceWithDest]
    : [...ofertaBase, ...ofertaWithDest];

  const safeTop = format === "story" ? 270 : 120;
  const safeBottom = format === "story" ? 345 : 120;
  const panelBottom = height - safeBottom;
  const left = 80;
  const right = width - 80;
  const contentWidth = right - left;
  // Sempre mostra até 5 benefícios (story OU quadrado) — o usuário escolheu 5/5 e os 5 devem aparecer.
  const shownHighlights = highlights.slice(0, 6);
  const badgeText = cityFmt ? `Saindo de ${cityFmt}` : "Pacote completo";
  const variantIdx = typeof forceVariant === "number" ? Math.abs(forceVariant) : Math.abs(variation);
  const pickedFromVariations = (titleVariations && titleVariations.length > 0)
    ? (titleVariations[variantIdx % titleVariations.length] || "").trim()
    : "";
  const titleText = pickedFromVariations
    ? pickedFromVariations
    : (titleOverride && titleOverride.trim())
      ? titleOverride.trim()
      : headlinePool[Math.abs(variation) % headlinePool.length];
  const subtitlePool = [
    "Roteiro pensado para viver melhor",
    "Beleza, conforto e boas memórias",
    "Uma viagem com outro ritmo",
    "Paisagens, sabores e histórias",
    "Seu descanso começa aqui",
  ];
  const subtitleText = subtitlePool[(Math.abs(variation) + 2) % subtitlePool.length];

  const resolvePaymentCopy = () => {
    const suffix = (fallback: string) => (typeof paymentSuffix === "string" ? paymentSuffix : fallback);
    switch (paymentMode) {
      case "cash":
        return { topLabel: paymentLabel || "À VISTA", mainPrice: priceWithSymbol, bottomSuffix: suffix("por pessoa") };
      case "cash_discount":
        return { topLabel: paymentLabel || "À VISTA · 5% OFF", mainPrice: priceWithSymbol, bottomSuffix: suffix("por pessoa") };
      case "from":
        return { topLabel: paymentLabel || "A PARTIR DE", mainPrice: priceWithSymbol, bottomSuffix: suffix("por pessoa") };
      case "daily":
        return { topLabel: paymentLabel || "DIÁRIA POR", mainPrice: priceWithSymbol, bottomSuffix: suffix("por diária") };
      case "monthly":
        return { topLabel: paymentLabel || "MENSAL POR", mainPrice: priceWithSymbol, bottomSuffix: suffix("por mês") };
      case "down_plus":
        return { topLabel: paymentLabel || `ENTRADA + ${installments}`, mainPrice: priceWithSymbol, bottomSuffix: suffix("por pessoa") };
      case "free_quote":
        return { topLabel: paymentLabel || "CONSULTE", mainPrice: paymentSuffix ? "" : "VALORES", bottomSuffix: paymentSuffix || "no WhatsApp" };
      case "custom_label":
        return { topLabel: paymentLabel || installments, mainPrice: priceWithSymbol, bottomSuffix: suffix("por pessoa") };
      case "installments":
      default:
        return { topLabel: paymentLabel || installments, mainPrice: priceWithSymbol, bottomSuffix: suffix("por pessoa") };
    }
  };

  const { topLabel, mainPrice, bottomSuffix } = resolvePaymentCopy();

  const drawRoundedPhoto = (x: number, y: number, w: number, h: number, radius: number, focusY = 0.4) => {
    const crop = fitCover(image.naturalWidth, image.naturalHeight, w, h, focusY);
    ctx.save();
    roundRect(ctx, x, y, w, h, radius);
    ctx.clip();
    ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, x, y, w, h);
    ctx.restore();
  };

  const drawBadge = (x: number, y: number, maxW: number) => {
    ctx.font = "800 30px Inter, Arial, sans-serif";
    const badgeW = Math.min(maxW, ctx.measureText(badgeText).width + 48);
    fillRoundRect(ctx, x, y, badgeW, 66, 999, secondaryColor);
    ctx.fillStyle = "#111111";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, x + 24, y + 34);
    ctx.textBaseline = "alphabetic";
    return badgeW;
  };

  const drawHighlightsBlock = (x: number, y: number, w: number, limit = shownHighlights.length, inverted = false, compact = false) => {
    const items = shownHighlights.slice(0, limit);
    const pillH = compact ? 60 : 82;
    const gap = compact ? 10 : 14;
    const iconFont = compact ? 26 : 34;
    const baseTextFont = compact ? 24 : 30;
    const textStartX = compact ? 64 : 82;
    const iconX = compact ? 20 : 24;
    const textMaxW = w - textStartX - 24; // padding direito
    items.forEach((item, idx) => {
      fillRoundRect(ctx, x, y + idx * (pillH + gap), w, pillH, compact ? 30 : 40, inverted ? "rgba(255,255,255,0.16)" : "#ffffff");
      ctx.fillStyle = inverted ? "#ffffff" : primaryColor;
      ctx.font = `800 ${iconFont}px Inter, Arial, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(ICON_SYMBOL[item.icon || "check"] || "✓", x + iconX, y + idx * (pillH + gap) + pillH / 2 + 1);
      ctx.fillStyle = inverted ? "#ffffff" : "#111111";

      // Auto-shrink pill text so it never extends beyond pill width.
      let pillFont = baseTextFont;
      ctx.font = `800 ${pillFont}px Inter, Arial, sans-serif`;
      while (ctx.measureText(item.text).width > textMaxW && pillFont > 16) {
        pillFont -= 2;
        ctx.font = `800 ${pillFont}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(item.text, x + textStartX, y + idx * (pillH + gap) + pillH / 2 + 1);
    });
    ctx.textBaseline = "alphabetic";
    return items.length * pillH + Math.max(0, items.length - 1) * gap;
  };

  // Estilo CVC: caixa amarela densa com PACOTE/DESTINO no topo, linha de ícones,
  // "a partir de" + selo de parcelas + R$ gigante, total por pessoa, e faixa azul escura "5% OFF À VISTA NO PIX".
  const drawPriceCard = (x: number, y: number, w: number, _h: number, _align: "left" | "right" = "right") => {
    // Altura do card (CVC é mais alto que o original): cresce conforme o conteúdo.
    const cardH = 290;
    const radius = 22;
    // 1. Fundo amarelo (cor secundária)
    fillRoundRect(ctx, x, y, w, cardH, radius, secondaryColor);

    ctx.fillStyle = "#0d0d0d";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    const cx = x + w / 2;
    const innerPad = 22;
    const innerW = w - innerPad * 2;

    // 2. Etiqueta "PACOTE" + DESTINO no topo
    ctx.font = `800 18px Inter, Arial, sans-serif`;
    ctx.fillText("PACOTE", cx, y + 30);
    let destSize = 28;
    ctx.font = `900 ${destSize}px Inter, Arial, sans-serif`;
    const destUpper = (destination || "DESTINO").toUpperCase();
    while (ctx.measureText(destUpper).width > innerW && destSize > 16) {
      destSize -= 2;
      ctx.font = `900 ${destSize}px Inter, Arial, sans-serif`;
    }
    ctx.fillText(destUpper, cx, y + 60);

    // 3. Linha de info: "X dias ✈ 🚌 🏨 ☕"
    const firstHL = highlights[0];
    const firstHLText = typeof firstHL === "string" ? firstHL : (firstHL?.text || "");
    const days = firstHLText.match(/(\d+)\s*dias?/i)?.[0] || "5 dias";
    ctx.font = `700 17px Inter, Arial, sans-serif`;
    ctx.fillText(`${days}   ✈   🚌   🏨   ☕`, cx, y + 92);

    // 4. "a partir de" pequeno + selo "12X sem juros" colado ao R$ gigante
    ctx.font = `600 13px Inter, Arial, sans-serif`;
    ctx.fillText("a partir de", cx, y + 118);

    // Calcula tamanhos do selo de parcelas e do preço lado a lado
    const installmentsText = (installments || "12X").toUpperCase().replace(/\s+/g, "");
    const priceText = mainPrice || `${curSym} ${price}`;
    let priceFontSize = 56;
    ctx.font = `900 ${priceFontSize}px Inter, Arial, sans-serif`;
    while (ctx.measureText(priceText).width > innerW * 0.65 && priceFontSize > 32) {
      priceFontSize -= 2;
      ctx.font = `900 ${priceFontSize}px Inter, Arial, sans-serif`;
    }
    const priceW = ctx.measureText(priceText).width;

    // Selo arredondado de parcelas (cor primária com texto secundário)
    const badgeW = 78;
    const badgeH = 56;
    const gap = 14;
    const groupW = badgeW + gap + priceW;
    const groupX = cx - groupW / 2;
    const priceY = y + 168;

    fillRoundRect(ctx, groupX, priceY - badgeH / 2 - 4, badgeW, badgeH, 12, primaryColor);
    ctx.fillStyle = secondaryColor;
    ctx.font = `900 22px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(installmentsText, groupX + badgeW / 2, priceY - 8);
    ctx.font = `700 10px Inter, Arial, sans-serif`;
    ctx.fillText("sem juros", groupX + badgeW / 2, priceY + 14);

    // Preço gigante
    ctx.fillStyle = "#0d0d0d";
    ctx.textAlign = "left";
    ctx.font = `900 ${priceFontSize}px Inter, Arial, sans-serif`;
    ctx.fillText(priceText, groupX + badgeW + gap, priceY + priceFontSize / 3);

    // 5. Total por pessoa
    ctx.fillStyle = "#1a1a1a";
    ctx.font = `600 14px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    if (bottomSuffix) {
      ctx.fillText(bottomSuffix, cx, y + 220);
    }

    // 6. Faixa PIX azul escura na base (cor primária)
    const stripeH = 40;
    const stripeY = y + cardH - stripeH;
    fillRoundRect(ctx, x, stripeY, w, stripeH, radius, primaryColor);
    // re-quadra os cantos superiores da faixa (corta arredondamento topo)
    ctx.fillStyle = primaryColor;
    ctx.fillRect(x, stripeY, w, stripeH / 2);
    // re-arredonda só os cantos inferiores
    fillRoundRect(ctx, x, stripeY, w, stripeH, radius, primaryColor);
    ctx.fillRect(x, stripeY, w, 6);
    ctx.fillStyle = "#ffffff";
    ctx.font = `900 18px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("5% OFF À VISTA NO PIX  💠", cx, stripeY + 26);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  };

  const drawPromoKicker = (x: number, y: number, color = "#ffffff") => {
    const promoUpper = promoName.toUpperCase().trim();
    // Evita duplicar quando o promoName já é "OFERTA ESPECIAL" (ou contém).
    const hasOfferKeyword = /OFERTA\s*ESPECIAL/.test(promoUpper);
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    if (!hasOfferKeyword) {
      ctx.font = "900 26px Inter, Arial, sans-serif";
      ctx.fillText("OFERTA ESPECIAL", x, y);
    }
    ctx.font = "900 38px Inter, Arial, sans-serif";
    let promoTrunc = promoUpper;
    while (ctx.measureText(promoTrunc).width > contentWidth * 0.6 && promoTrunc.length > 3) {
      promoTrunc = promoTrunc.slice(0, -2);
    }
    if (promoTrunc !== promoUpper) promoTrunc = promoTrunc.slice(0, -1) + "…";
    ctx.fillText(promoTrunc, x, y + (hasOfferKeyword ? 0 : 48));
  };

  const renderSafeSquareOffer = () => {
    // Variantes ATIVAS: V0, V1, V2, V3, V4 (todas implementadas).
    const TOTAL_VARIANTS = 5;
    let variant = typeof forceVariant === "number"
      ? ((forceVariant % TOTAL_VARIANTS) + TOTAL_VARIANTS) % TOTAL_VARIANTS
      : Math.abs(variation) % TOTAL_VARIANTS;

    // ── V3 · ESTRUTURA (oferta com box destacado) ───────────────────────────
    // Spec estrutural — layout/visual ainda NÃO implementado.
    // Padrão idêntico a V0/V1/V2: early-branch por variante, lendo dos mesmos
    // dados dinâmicos já existentes no escopo de composeTravelAd().
    //
    // ÁREAS (de fundo → frente):
    //   [BG]      Fundo com imagem turística do destino  → image (drawImage cover)
    //   [BOX]     Bloco principal central (card destacado sobre o BG)
    //     ├─ [TITLE]      Área de título            → titleText
    //     ├─ [INFO]       Dias + ícones (highlights)→ highlights[] (ICON_SYMBOL)
    //     ├─ [INSTALL]    Preço parcelado           → installments / paymentLabel
    //     ├─ [TOTAL]      Valor total               → mainPrice / price / curSym
    //     └─ [PROMO]      Destaque promocional      → promoName (desconto/badge)
    //
    // DADOS DINÂMICOS REUTILIZADOS (já disponíveis no escopo):
    //   destination, destUp     → nome do destino
    //   highlights[]            → dias + ícones (text + icon)
    //   installments            → parcelas
    //   mainPrice / price       → total
    //   curSym                  → moeda
    //   promoName               → destaque/desconto
    //   primaryColor / secondaryColor → cores do box
    //   hasLogo, logoH          → reserva de topo p/ logo
    // ── V3 · REF "CVC" — foto cheia + BOX AMARELO destacado ─────────────────
    // Estrutura: BG (foto destino) → BOX amarelo arredondado no topo-esquerda
    // contendo: PACOTE / destino / dias+ícones / "a partir de" + 12x sem juros
    // + R$ preço gigante / total por pessoa / faixa Pix com desconto.
    if (variant === 3) {
      // [BG] Foto do destino cobrindo todo o canvas
      const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.45);
      ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

      // ── Dados dinâmicos ────────────────────────────────────────────────────
      const destinoUp = (destination || "DESTINO").toUpperCase();
      const daysItem = highlights.find((h) => /\d+\s*dia/i.test(h?.text || ""));
      const daysText = (daysItem?.text || "7 dias").trim();
      // Ícones: usa APENAS os selecionados pelo usuário (sem merge com defaults).
      // Se nenhum highlight tiver ícone, usa um conjunto padrão mínimo.
      const iconList: IconKey[] = (() => {
        const fromHl = highlights
          .map((h) => h?.icon as IconKey | undefined)
          .filter((k): k is IconKey => !!k && k !== "check");
        if (fromHl.length === 0) {
          return ["plane", "hotel", "coffee", "camera"] as IconKey[];
        }
        // dedup preservando ordem do usuário, máximo 5
        const seen = new Set<IconKey>();
        const out: IconKey[] = [];
        for (const k of fromHl) {
          if (!seen.has(k)) {
            seen.add(k);
            out.push(k);
            if (out.length >= 5) break;
          }
        }
        return out;
      })();

      // Parcelas: extrai número de "12x", "12 x", "12X sem juros" etc.
      const instMatch = (installments || "12x").match(/(\d{1,2})\s*x/i);
      const parcN = instMatch ? instMatch[1] : "12";
      const priceStr = mainPrice || `${curSym} ${price}`;
      // Calcula total = preço × parcelas, formatando milhares com "." e centavos com ","
      const priceNumeric = parseFloat(((price || "").trim()).replace(/\./g, "").replace(",", "."));
      const totalNum = !isNaN(priceNumeric) ? priceNumeric * parseInt(parcN, 10) : NaN;
      // Se preço não tem centavos (inteiro), o total também não terá.
      const priceHasDecimals = /[.,]\d{1,2}\s*$/.test((price || "").trim());
      const fmtBR = (n: number) => {
        const showDec = priceHasDecimals && n % 1 !== 0;
        return n.toLocaleString("pt-BR", {
          minimumFractionDigits: showDec ? 2 : 0,
          maximumFractionDigits: showDec ? 2 : 0,
        });
      };
      // Total: prioriza override do usuário; senão calcula automático com sufixo
      const computedTotal = !isNaN(totalNum)
        ? `Total ${(paymentSuffix || "por pessoa").trim()}: ${curSym} ${fmtBR(totalNum)}`
        : "";
      const totalStr = (totalOverride && totalOverride.trim()) || computedTotal;
      // Desconto: extrai número do promoName (ex.: "5% OFF") ou usa 5 como default
      const descMatch = (promoName || "").match(/(\d{1,2})\s*%/);
      const descN = descMatch ? descMatch[1] : "5";

      // ── [BOX] amarelo arredondado — altura DINÂMICA conforme conteúdo ─────
      const boxX = 60;
      const boxY = 70;
      const boxW = Math.round(width * 0.64);
      const boxR = 36;
      // V3 respeita as cores selecionadas pelo usuário:
      // - "yellow" = secondaryColor (fundo do box)
      // - "navy"   = primaryColor   (textos, ícones e faixa Pix)
      const yellow = secondaryColor || "#FFD400";
      const navyRaw = primaryColor || "#0B2B7A";
      // Garante contraste mínimo dos textos/ícones contra o fundo do box.
      // Se o usuário escolher duas cores claras (ou duas escuras), o navy vira
      // preto/branco automaticamente para manter legibilidade.
      const navy = ensureContrast(navyRaw, yellow, 0.35);
      const yellowDark = shadeColor(yellow, luminance(yellow) > 0.5 ? -12 : 18); // anel: escurece se claro, clareia se escuro

      // Pré-cálculos de altura por seção
      const padTop = 36;
      const titleH = 50; // "PACOTE"
      const titleGap = 12;
      const destH = 60;  // destino
      const destGap = 18;
      const infoH = 42;  // dias | ícones
      const infoGap = 22;
      const priceBlockH = 150; // bloco grande do preço com ring
      const totalH = (showTotal && (totalOverride || !isNaN(totalNum))) ? 36 : 0;
      const totalGap = totalH ? 14 : 0;
      const stripeH = 64;
      const stripeGap = showPixBanner ? 22 : 0;
      const padBottom = 36;

      const boxH =
        padTop + titleH + titleGap + destH + destGap + infoH + infoGap +
        priceBlockH + totalGap + totalH +
        (showPixBanner ? stripeGap + stripeH : 0) +
        padBottom;

      // sombra suave
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 8;
      fillRoundRect(ctx, boxX, boxY, boxW, boxH, boxR, yellow);
      ctx.restore();

      const cx = boxX + boxW / 2;
      let cursorY = boxY + padTop + 32; // baseline aproximada do título

      // [TITLE] PACOTE
      ctx.fillStyle = navy;
      ctx.textAlign = "center";
      ctx.font = "900 44px Inter, Arial, sans-serif";
      ctx.fillText("PACOTE", cx, cursorY);
      cursorY += titleGap + 40;

      // destino (maior, peso médio)
      ctx.font = "500 56px Inter, Arial, sans-serif";
      let destSize = 56;
      while (ctx.measureText(destinoUp).width > boxW - 80 && destSize > 32) {
        destSize -= 2;
        ctx.font = `500 ${destSize}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(destinoUp, cx, cursorY);
      cursorY += destGap + 36;

      // [INFO] dias | ícones (TODOS monocromáticos, mesma cor navy)
      ctx.font = "700 30px Inter, Arial, sans-serif";
      const daysW = ctx.measureText(daysText).width;
      const sepGap = 18;
      const iconSize = 40;
      const iconGap = 18;
      const iconsTotal = iconList.length * iconSize + Math.max(0, iconList.length - 1) * iconGap;
      const sepW = 4;
      const infoTotalW = daysW + sepGap + sepW + sepGap + iconsTotal;
      let infoX = cx - infoTotalW / 2;
      const infoY = cursorY;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = navy;
      ctx.fillText(daysText, infoX, infoY);
      infoX += daysW + sepGap;
      ctx.fillRect(infoX, infoY - 18, sepW, 36);
      infoX += sepW + sepGap;
      iconList.forEach((k, i) => {
        const ix = infoX + i * (iconSize + iconGap) + iconSize / 2;
        drawMonoIcon(ctx, k, ix, infoY, iconSize, navy);
      });
      ctx.textBaseline = "alphabetic";
      cursorY += infoGap + 28;

      // [PRICE BLOCK] anel amarelo escuro ao redor do preço
      const ringX = boxX + 30;
      const ringY = cursorY - 8;
      const ringW = boxW - 60;
      const ringH = priceBlockH - 8;
      ctx.save();
      ctx.fillStyle = yellowDark;
      roundRect(ctx, ringX, ringY, ringW, ringH, 24);
      ctx.fill();
      ctx.restore();

      const priceBlockY = ringY + 30;
      const priceGroupW = Math.min(ringW - 48, Math.round(width * 0.46));
      const priceGroupX = ringX + (ringW - priceGroupW) / 2;
      const leftColX = priceGroupX;
      const rightEdgeX = priceGroupX + priceGroupW;
      const minGap = 18;

      // Quebra "R$ 229" em símbolo pequeno + valor gigante
      const priceParts = priceStr.match(/^(\D+)\s*([\d.,]+)$/);
      const sym = priceParts ? priceParts[1].trim() : curSym;
      const valNum = priceParts ? priceParts[2].trim() : priceStr;

      const leftReservedW = 118;
      const maxPriceW = priceGroupW - leftReservedW - minGap - 58;
      let priceSize = 120;
      ctx.font = `900 ${priceSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(valNum).width > maxPriceW && priceSize > 64) {
        priceSize -= 4;
        ctx.font = `900 ${priceSize}px Inter, Arial, sans-serif`;
      }
      const valW = ctx.measureText(valNum).width;
      const symSize = Math.round(priceSize * 0.36);

      // Lado esquerdo
      ctx.textAlign = "left";
      ctx.fillStyle = navy;
      ctx.font = "600 20px Inter, Arial, sans-serif";
      ctx.fillText("a partir de", leftColX, priceBlockY);
      ctx.font = "900 56px Inter, Arial, sans-serif";
      ctx.fillText(`${parcN}X`, leftColX, priceBlockY + 60);
      ctx.font = "600 20px Inter, Arial, sans-serif";
      ctx.fillText("sem juros", leftColX, priceBlockY + 88);

      // Lado direito (preço gigante)
      ctx.textAlign = "right";
      ctx.font = `900 ${priceSize}px Inter, Arial, sans-serif`;
      ctx.fillText(valNum, rightEdgeX, priceBlockY + 84);
      ctx.font = `900 ${symSize}px Inter, Arial, sans-serif`;
      ctx.fillText(sym, rightEdgeX - valW - 8, priceBlockY + 84 - priceSize * 0.5);

      cursorY = ringY + ringH + totalGap;

      // [TOTAL] rodapé do box (apenas se showTotal)
      if (totalH > 0) {
        ctx.textAlign = "center";
        ctx.font = "600 22px Inter, Arial, sans-serif";
        ctx.fillStyle = navy;
        ctx.fillText(totalStr, cx, cursorY + 22);
        cursorY += totalH;
      }

      // [PROMO] faixa horizontal com texto Pix (opcional)
      // Fundo da faixa = primaryColor (navy padrão). Texto sempre com contraste.
      if (showPixBanner) {
        const stripeY = boxY + boxH - stripeH - 24;
        const stripeX = boxX + 40;
        const stripeW = boxW - 80;
        const stripeBg = navyRaw; // mantém a cor escolhida pelo usuário p/ a faixa
        const stripeFg = contrastOn(stripeBg); // texto preto/branco automático
        fillRoundRect(ctx, stripeX, stripeY, stripeW, stripeH, 16, stripeBg);
        ctx.fillStyle = stripeFg;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 26px Inter, Arial, sans-serif";

        const customBanner = (pixBannerText || "").trim();
        if (customBanner) {
          ctx.fillText(customBanner, stripeX + stripeW / 2, stripeY + stripeH / 2 + 1);
        } else {
          // "{N}% OFF À VISTA NO  [●pix]"
          const pixText = `${descN}% OFF À VISTA NO`;
          const pixTextW = ctx.measureText(pixText).width;
          const pixIconSize = 36;
          const pixGap = 12;
          ctx.font = "800 28px Inter, Arial, sans-serif";
          const pixLabelW = ctx.measureText("pix").width;
          ctx.font = "900 26px Inter, Arial, sans-serif";
          // pílula branca atrás do logo+pix p/ garantir visibilidade da marca Pix
          const pillPad = 10;
          const pillW = pixIconSize + pixGap + pixLabelW + pillPad * 2;
          const pillH = stripeH - 16;
          const totalPixW = pixTextW + pixGap + pillW;
          const pixStartX = stripeX + (stripeW - totalPixW) / 2;
          ctx.textAlign = "left";
          ctx.fillStyle = stripeFg;
          ctx.fillText(pixText, pixStartX, stripeY + stripeH / 2 + 1);
          const pillX = pixStartX + pixTextW + pixGap;
          const pillY = stripeY + (stripeH - pillH) / 2;
          fillRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, "#ffffff");
          const pxCx = pillX + pillPad + pixIconSize / 2;
          const pxCy = stripeY + stripeH / 2;
          drawPixLogo(ctx, pxCx, pxCy, pixIconSize, "#32BCAD");
          ctx.fillStyle = "#32BCAD";
          ctx.font = "900 28px Inter, Arial, sans-serif";
          ctx.fillText("pix", pillX + pillPad + pixIconSize + pixGap, stripeY + stripeH / 2 + 1);
        }
        ctx.textBaseline = "alphabetic";
      }

      return canvas.toDataURL("image/png");
    }

    const logoH = hasLogo ? 130 : 0;
    const destUp = (destination || "DESTINO").toUpperCase();

    // ── V0 · REF "Enseada" — painel cor TOPO + foto EMBAIXO ─────────────────
    // Painel superior (cor secundária) com altura ADAPTATIVA: encolhe quando há
    // pouco texto, expande quando o usuário adiciona mais benefits.
    if (variant === 0) {
      // REGRA GLOBAL DE LEGIBILIDADE: texto sempre tem que destacar do fundo.
      // Painel = secondaryColor → texto principal = primaryColor com contraste garantido.
      // Badge  = primaryColor   → texto da badge = secondaryColor com contraste garantido.
      const v0PanelBg = secondaryColor;
      const v0OnPanel = ensureContrast(primaryColor, v0PanelBg, 0.35);
      const v0BadgeBg = primaryColor;
      const v0OnBadge = ensureContrast(secondaryColor, v0BadgeBg, 0.35);
      // 1) Calcula tamanho do título para saber a altura real
      ctx.textAlign = "left";
      let titleSize = 78;
      ctx.font = `900 ${titleSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(titleText).width > contentWidth && titleSize > 38) {
        titleSize -= 4;
        ctx.font = `900 ${titleSize}px Inter, Arial, sans-serif`;
      }

      // 2) Quantidade de benefits que serão exibidos (até 6) — TODOS aparecem
      const benefitsList = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 6);
      const benefitsCount = Math.max(1, benefitsList.length);
      const benefitLineH = benefitsCount <= 4 ? 44 : benefitsCount === 5 ? 38 : 34;
      const benefitsBlockH = benefitsCount * benefitLineH;

      // 3) Altura do bloco preço (fixa, ~120px)
      const priceBlockH = 120;
      const contentRowH = Math.max(benefitsBlockH, priceBlockH);

      // 4) Altura ADAPTATIVA do painel:
      //    logo + badge(60) + gap(40) + título + gap(50) + content + padding(50)
      const badgeH = 60;
      const topPaddingBeforeTitle = 40;
      const titleToContent = 50;
      const bottomPadding = 50;
      const topH = Math.min(
        Math.round(height * 0.62),
        Math.max(
          Math.round(height * 0.46),
          logoH + 28 + badgeH + topPaddingBeforeTitle + titleSize + titleToContent + contentRowH + bottomPadding
        )
      );

      // 5) Pinta painel
      ctx.fillStyle = v0PanelBg;
      ctx.fillRect(0, 0, width, topH);

      // 6) Badge "Saindo de"
      const badgeY = logoH + 28;
      fillRoundRect(ctx, left, badgeY, 500, badgeH, 8, v0BadgeBg);
      ctx.fillStyle = v0OnBadge;
      ctx.font = "800 26px Inter, Arial, sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(badgeText, left + 20, badgeY + badgeH / 2);
      ctx.textBaseline = "alphabetic";

      // 7) Headline (1 linha, fonte adaptativa)
      ctx.fillStyle = v0OnPanel;
      ctx.font = `900 ${titleSize}px Inter, Arial, sans-serif`;
      const titleY = badgeY + badgeH + topPaddingBeforeTitle + titleSize;
      ctx.fillText(titleText, left, titleY);

      // 8) Benefits + Preço lado a lado — preço ALINHADO À DIREITA pra eliminar
      //    o espaço em branco que sobrava no canto direito.
      const rowTopY = titleY + titleToContent;
      const benefitsX = left;
      // Largura do bloco de preço: ~46% da contentWidth, mínimo 380px
      const priceBlockW = Math.max(380, Math.round(contentWidth * 0.46));
      const priceX = width - 60 - priceBlockW; // encosta no padding direito
      const benefitsMaxW = priceX - 24 - benefitsX;

      ctx.fillStyle = v0OnPanel;
      ctx.font = "700 26px Inter, Arial, sans-serif";
      const iconForIndex = (i: number, fallback: string) =>
        ICON_SYMBOL[(benefitsList[i]?.icon as IconKey) || (fallback as IconKey)] || ICON_SYMBOL.check;
      benefitsList.forEach((b, i) => {
        const icon = iconForIndex(i, ["bus", "map", "guide", "star"][i] || "check");
        const line = `${icon} ${b.text}`;
        // auto-shrink por linha pra caber na coluna esquerda
        let bfs = 26;
        ctx.font = `700 ${bfs}px Inter, Arial, sans-serif`;
        while (ctx.measureText(line).width > benefitsMaxW && bfs > 16) {
          bfs -= 2;
          ctx.font = `700 ${bfs}px Inter, Arial, sans-serif`;
        }
        ctx.fillText(line, benefitsX, rowTopY + 28 + i * benefitLineH);
      });

      // Divisor vertical
      ctx.fillStyle = v0OnPanel; ctx.globalAlpha = 0.2;
      ctx.fillRect(priceX - 24, rowTopY, 2, contentRowH);
      ctx.globalAlpha = 1;

      // Preço — agora CENTRALIZADO dentro do bloco direito
      const priceCenterX = priceX + priceBlockW / 2;
      ctx.textAlign = "center";
      ctx.fillStyle = v0OnPanel; ctx.font = "600 22px Inter, Arial, sans-serif";
      ctx.fillText((topLabel || "por apenas").toString(), priceCenterX, rowTopY + 28);
      const priceStr = mainPrice || `${curSym} ${price}`;
      // Auto-shrink do preço pra não vazar do bloco direito
      let priceFs = 64;
      ctx.font = `900 ${priceFs}px Inter, Arial, sans-serif`;
      while (ctx.measureText(priceStr).width > priceBlockW - 20 && priceFs > 30) {
        priceFs -= 4;
        ctx.font = `900 ${priceFs}px Inter, Arial, sans-serif`;
      }
      ctx.fillStyle = v0OnPanel;
      ctx.fillText(priceStr, priceCenterX, rowTopY + 92);
      ctx.font = "600 20px Inter, Arial, sans-serif"; ctx.fillStyle = v0OnPanel;
      ctx.globalAlpha = 0.7;
      ctx.fillText(bottomSuffix, priceCenterX, rowTopY + 120);
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";

      // 9) Foto MAIOR na base (porque o painel encolheu)
      const photoH0 = height - topH;
      const c0 = fitCover(image.naturalWidth, image.naturalHeight, width, photoH0, 0.42);
      ctx.drawImage(image, c0.sx, c0.sy, c0.sw, c0.sh, 0, topH, width, photoH0);
      return canvas.toDataURL("image/png");
    }

    // ── V1 · REF "Black Friday" — painel escuro ESQUERDA + coluna fotos DIREITA ──
    // Painel primário na esquerda com texto/preço; coluna direita com foto empilhada
    if (variant === 1) {
      const panelW = 460;
      const colX = panelW + 24; const colW = width - colX - 24;
      // REGRA DE LEGIBILIDADE: painel esquerdo = primaryColor → texto deve contrastar.
      // Accent = secondaryColor mas só se contrastar; caso contrário, fallback p/ branco/preto.
      const v1PanelBg = primaryColor;
      const v1OnPanel = contrastOn(v1PanelBg); // texto principal sempre legível
      const v1Accent = ensureContrast(secondaryColor, v1PanelBg, 0.35);
      // Fundo esquerdo (cor primária)
      ctx.fillStyle = v1PanelBg; ctx.fillRect(0, 0, panelW, height);
      // Fundo direito (cor secundária)
      ctx.fillStyle = secondaryColor; ctx.fillRect(panelW, 0, width - panelW, height);
      // Texto no painel esquerdo
      const px = left; const pw = panelW - left - 24;
      ctx.fillStyle = v1Accent;
      ctx.font = "900 22px Inter, Arial, sans-serif";
      ctx.fillText((promoName || "OFERTA ESPECIAL").toUpperCase(), px, logoH + 54);
      // Destino grande
      ctx.fillStyle = v1OnPanel;
      drawTextBlock(ctx, destUp, px, logoH + 100, pw, 78, 2, { fontWeight: "900", baseFontSize: 72, minFontSize: 36 });

      // Headline (titleText escolhido pelo usuário) — abaixo do destino
      ctx.fillStyle = v1Accent;
      ctx.font = "800 24px Inter, Arial, sans-serif";
      drawTextBlock(ctx, titleText, px, logoH + 240, pw, 30, 2, { fontWeight: "800", baseFontSize: 24, minFontSize: 16 });

      // Benefits — até 6 itens em pílulas, altura adaptativa
      const benefitsListV1 = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 6);
      const hlStart = logoH + 320;
      const pillH = benefitsListV1.length <= 4 ? 68 : benefitsListV1.length === 5 ? 56 : 50;
      const pillGap = benefitsListV1.length <= 4 ? 14 : 10;
      const pillFont = benefitsListV1.length <= 4 ? 28 : benefitsListV1.length === 5 ? 24 : 22;
      // Pílula com tinta no mesmo tom do painel mas mais clara/escura, p/ contraste consistente
      const pillBgV1 = v1OnPanel === "#ffffff" ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)";
      benefitsListV1.forEach((h, i) => {
        const py = hlStart + i * (pillH + pillGap);
        fillRoundRect(ctx, px, py, pw, pillH, pillH / 2, pillBgV1);
        ctx.fillStyle = v1Accent; ctx.font = `700 ${pillFont}px Inter, Arial, sans-serif`;
        ctx.textBaseline = "middle";
        ctx.fillText(ICON_SYMBOL[h.icon || "check"] || "✓", px + 18, py + pillH / 2);
        ctx.fillStyle = v1OnPanel;
        // Auto-shrink texto da pill
        let pf = pillFont;
        ctx.font = `700 ${pf}px Inter, Arial, sans-serif`;
        const maxTw = pw - 64;
        while (ctx.measureText(h.text).width > maxTw && pf > 14) {
          pf -= 2;
          ctx.font = `700 ${pf}px Inter, Arial, sans-serif`;
        }
        ctx.fillText(h.text, px + 52, py + pillH / 2);
        ctx.textBaseline = "alphabetic";
      });
      // Price card no painel esquerdo, base — overlay escuro/claro de acordo com o painel
      const priceCardOverlay = v1OnPanel === "#ffffff" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.25)";
      fillRoundRect(ctx, px, height - 200, pw, 172, 16, priceCardOverlay);
      ctx.fillStyle = v1Accent; ctx.font = "700 22px Inter, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((topLabel || "APENAS HOJE:").toString().toUpperCase(), px + pw / 2, height - 168);
      ctx.fillStyle = v1OnPanel;
      // Auto-shrink preço
      const priceStrV1 = mainPrice || `${curSym} ${price}`;
      let pfsV1 = 62;
      ctx.font = `900 ${pfsV1}px Inter, Arial, sans-serif`;
      while (ctx.measureText(priceStrV1).width > pw - 24 && pfsV1 > 28) {
        pfsV1 -= 4;
        ctx.font = `900 ${pfsV1}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(priceStrV1, px + pw / 2, height - 100);
      ctx.font = "600 20px Inter, Arial, sans-serif";
      ctx.fillText(bottomSuffix, px + pw / 2, height - 68);
      ctx.textAlign = "left";
      // Foto ÚNICA no lado direito (sem duplicação) — ocupa toda a altura
      const gap1 = 16;
      const pY = gap1;
      const photoH1 = height - gap1 * 2;
      const c1 = fitCover(image.naturalWidth, image.naturalHeight, colW, photoH1, 0.40);
      ctx.save();
      fillRoundRect(ctx, colX, pY, colW, photoH1, 20, "#000");
      ctx.clip();
      ctx.drawImage(image, c1.sx, c1.sy, c1.sw, c1.sh, colX, pY, colW, photoH1);
      ctx.restore();
      return canvas.toDataURL("image/png");
    }

    // ── V2 · REF "Santa Teresa" — foto topo + faixa headline + benefits + preço ──
    // Layout ADAPTATIVO: a foto cresce/encolhe conforme a quantidade de benefícios,
    // garantindo que TODOS os benefícios apareçam (até 5) e que não sobre espaço branco.
    if (variant === 2) {
      ctx.fillStyle = "#f7f4ef"; ctx.fillRect(0, 0, width, height);

      // REGRA DE CORES V2 (mapeamento estrito):
      // - card_background / faixa headline = user_primary_color
      // - TODOS os textos (tagline, título, duração, total, preço, parcelas) = user_secondary_color
      // - Ícones de amenities = user_secondary_color
      // - Discount badge: bg = user_secondary_color, texto branco fixo
      // ensureContrast só atua como fallback de segurança quando primária ≈ secundária.
      const v2CardBg = primaryColor;
      const v2OnCard = contrastOn(v2CardBg); // fallback de segurança
      const v2CardLabel = ensureContrast(secondaryColor, v2CardBg, 0.35);
      // Benefits ficam sobre fundo creme #f7f4ef → secundária com fallback contra creme.
      const v2BenefitColor = ensureContrast(secondaryColor, "#f7f4ef", 0.35);
      // Texto da faixa headline (sobre primária) = secundária com contraste garantido.
      const v2HeadlineColor = v2CardLabel;

      // Lista completa de benefits (até 6) — TODOS devem aparecer
      const benefitsListV2 = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 6);
      const benefitsCountV2 = Math.max(1, benefitsListV2.length);

      // 1) Card de preço — ancorado à base e centralizado para não pesar só à esquerda
      const priceCardW = Math.round(width * 0.66);
      const priceCardH = 168;
      const priceCardX = Math.round((width - priceCardW) / 2);
      const priceCardY = height - 56 - priceCardH;
      fillRoundRect(ctx, priceCardX, priceCardY, priceCardW, priceCardH, 16, v2CardBg);
      ctx.fillStyle = v2CardLabel; ctx.font = "700 24px Inter, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((topLabel || "por apenas").toString(), priceCardX + priceCardW / 2, priceCardY + 40);
      // Valor do preço usa a cor SECUNDÁRIA (ex.: amarelo) para destacar contra o card primário.
      // Se a secundária não tiver contraste suficiente, ensureContrast troca para branco/preto.
      ctx.fillStyle = v2CardLabel;
      // Auto-shrink preço V2
      const priceStrV2 = mainPrice || `${curSym} ${price}`;
      let pfsV2 = 64;
      ctx.font = `900 ${pfsV2}px Inter, Arial, sans-serif`;
      while (ctx.measureText(priceStrV2).width > priceCardW - 40 && pfsV2 > 28) {
        pfsV2 -= 4;
        ctx.font = `900 ${pfsV2}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(priceStrV2, priceCardX + priceCardW / 2, priceCardY + 108);
      ctx.fillStyle = v2CardLabel;
      ctx.font = "600 22px Inter, Arial, sans-serif";
      ctx.fillText(bottomSuffix, priceCardX + priceCardW / 2, priceCardY + 144);
      ctx.textAlign = "left";

      // 2) Faixa headline (altura adaptativa)
      const faixaH = 110;

      // 3) Cálculo de altura dos benefits — TODOS devem caber.
      const benefitRowsV2 = Math.ceil(benefitsCountV2 / 2);
      const benefitFontSize = benefitRowsV2 <= 2 ? 30 : 25;
      const benefitGap = benefitRowsV2 <= 2 ? 58 : 46;
      const benefitsBlockH = benefitRowsV2 * benefitGap;
      const benefitsTopPad = 32;
      const benefitsBottomPad = 28;
      const benefitsAreaH = benefitsTopPad + benefitsBlockH + benefitsBottomPad;

      // 4) Foto superior — calcula altura dinâmica para preencher tudo que sobra acima
      const photoTop = 16;
      const photoBottom = priceCardY - benefitsAreaH - faixaH - 16;
      const fW2 = width - 32;
      const fH2 = Math.max(Math.round(height * 0.34), photoBottom - photoTop);
      const c2 = fitCover(image.naturalWidth, image.naturalHeight, fW2, fH2, 0.36);
      ctx.save();
      fillRoundRect(ctx, 16, photoTop, fW2, fH2, 22, "#ccc");
      ctx.clip();
      ctx.drawImage(image, c2.sx, c2.sy, c2.sw, c2.sh, 16, photoTop, fW2, fH2);
      ctx.restore();

      // 5) Faixa horizontal com headline
      const faixaY = photoTop + fH2 + 16;
      fillRoundRect(ctx, 0, faixaY, width, faixaH, 0, v2CardBg);
      ctx.fillStyle = v2HeadlineColor;
      ctx.textAlign = "left";
      let v2Size = 52;
      ctx.font = `900 ${v2Size}px Inter, Arial, sans-serif`;
      while (ctx.measureText(titleText).width > contentWidth && v2Size > 28) {
        v2Size -= 4;
        ctx.font = `900 ${v2Size}px Inter, Arial, sans-serif`;
      }
      ctx.textBaseline = "middle";
      ctx.fillText(titleText, left, faixaY + faixaH / 2);
      ctx.textBaseline = "alphabetic";

      // 6) Benefits — duas colunas para ocupar o espaço inferior sem deixar vazio à direita
      const benefitsTop = faixaY + faixaH + benefitsTopPad;
      const colGapV2 = 28;
      const colWV2 = (contentWidth - colGapV2) / 2;
      benefitsListV2.forEach((h, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const tx = left + col * (colWV2 + colGapV2);
        const ty = benefitsTop + row * benefitGap;
        ctx.fillStyle = v2BenefitColor;
        let fs = benefitFontSize;
        const label = `${ICON_SYMBOL[h.icon || "check"]}  ${h.text}`;
        ctx.font = `700 ${fs}px Inter, Arial, sans-serif`;
        while (ctx.measureText(label).width > colWV2 && fs > 15) {
          fs -= 2;
          ctx.font = `700 ${fs}px Inter, Arial, sans-serif`;
        }
        ctx.fillText(label, tx, ty);
      });

      return canvas.toDataURL("image/png");
    }

    // ── V4 · CIRCUITO BR — card azul flutuante centralizado + pílula Pix vazada ─
    // Estrutura ref. anúncio "Circuito Portugal": foto cinematográfica do destino
    // ocupando 100% do canvas; card primário arredondado centralizado mais abaixo
    // do meio (deixa céu/paisagem visível em cima); pílula Pix em formato pílula
    // "vazando" metade para fora da borda inferior do card.
    //
    // Mapeamento estrito form → render:
    //   BG          → image (Foto Real / Sua Imagem / IA Pura por Destino)
    //   card.bg     → primaryColor
    //   tagline     → promoName               cor: secondaryColor
    //   título      → titleText (resolvido)   cor: branco
    //   info        → daysText | ícones       cor: secondaryColor (mono)
    //   12X pill bg → secondaryColor          texto: primaryColor
    //   "a partir de"/"sem juros"/"Total ..." → branco
    //   R$ + valor  → branco (valor SEM vírgula/centavos — absoluto)
    //   pix pill    → bg secondaryColor, texto branco, vazando bottom: -28
    if (variant === 4) {
      // [BG] foto cobre 100%
      const cBgV4 = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.42);
      ctx.drawImage(image, cBgV4.sx, cBgV4.sy, cBgV4.sw, cBgV4.sh, 0, 0, width, height);

      // ── Dados ────────────────────────────────────────────────────────────
      const v4Primary = primaryColor || "#0B2B7A";
      const v4Secondary = secondaryColor || "#FFE600";
      const v4OnSecondary = ensureContrast(v4Primary, v4Secondary, 0.4); // contraste do texto sobre amarelo
      const destinoV4 = (destination || "DESTINO").toUpperCase();
      // Tagline do topo = promoName (se vazio, usa "PACOTE" como neutro)
      const taglineV4 = ((promoName || "PACOTE").trim()).toUpperCase();
      // Título = primeira linha do titleText OU destino (sem repetir tagline)
      const titleLineV4 = (() => {
        const t = (titleText || destinoV4).trim();
        const firstLine = t.split(/\r?\n/)[0] || t;
        // remove tagline duplicada se titleText começar com ela
        return firstLine.replace(new RegExp(`^${taglineV4}\\s*`, "i"), "").trim() || destinoV4;
      })();

      const daysItemV4 = highlights.find((h) => /\d+\s*dia|\d+\s*noite|janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/i.test(h?.text || ""));
      const daysTextV4 = (travelPeriod?.trim() || daysItemV4?.text || "5 dias").trim();
      const iconListV4: IconKey[] = (() => {
        const fromHl = highlights
          .map((h) => h?.icon as IconKey | undefined)
          .filter((k): k is IconKey => !!k && k !== "check");
        if (fromHl.length === 0) return ["coffee", "users", "bus", "camera"] as IconKey[];
        const seen = new Set<IconKey>(); const out: IconKey[] = [];
        for (const k of fromHl) { if (!seen.has(k)) { seen.add(k); out.push(k); if (out.length >= 5) break; } }
        return out;
      })();

      // Chamada do pagamento sincronizada com o modo escolhido no formulário.
      const instMatchV4 = (installments || "10x").match(/(\d{1,2})\s*x/i);
      const parcNV4 = instMatchV4 ? instMatchV4[1] : "1";
      const leftTopV4 = (() => {
        if (paymentMode === "cash" || paymentMode === "cash_discount") return "pagamento";
        if (paymentMode === "down_plus") return "entrada +";
        return "a partir de";
      })();
      const pillTxt = (() => {
        if (paymentMode === "cash" || paymentMode === "cash_discount") return "À VISTA";
        if (paymentMode === "down_plus") {
          const clean = (installments || paymentLabel || "Entrada + 10x").replace(/entrada\s*\+?/i, "").trim();
          return clean || `${parcNV4}X`;
        }
        return `${parcNV4}X`;
      })().toUpperCase();
      const leftBottomV4 = (() => {
        if (paymentMode === "cash" || paymentMode === "cash_discount") return (paymentSuffix || "por pessoa").trim();
        if (paymentMode === "down_plus") return "parcelas";
        return "sem juros";
      })();

      // Preço V4 — respeita o toggle "Mostrar centavos" do formulário.
      // Se o `price` recebido já vem com vírgula/centavos (ex: "423,00"), preserva.
      // Caso contrário, exibe absoluto (sem decimais).
      const priceRawV4 = (price || "").trim();
      const priceNumV4 = parseFloat(priceRawV4.replace(/\./g, "").replace(",", "."));
      const hasCentsV4 = /[.,]\d{1,2}\s*$/.test(priceRawV4);
      const fmtBRv4 = (n: number, withCents: boolean) =>
        n.toLocaleString("pt-BR", {
          minimumFractionDigits: withCents ? 2 : 0,
          maximumFractionDigits: withCents ? 2 : 0,
        });
      const valNumV4 = !isNaN(priceNumV4)
        ? fmtBRv4(priceNumV4, hasCentsV4)
        : priceRawV4;

      // Total: usa override OU calcula (mesma regra de centavos)
      const totalMultiplierV4 = (paymentMode === "cash" || paymentMode === "cash_discount") ? 1 : parseInt(parcNV4, 10);
      const totalNumV4 = !isNaN(priceNumV4) ? priceNumV4 * totalMultiplierV4 : NaN;
      const totalStrV4 = (totalOverride && totalOverride.trim())
        || (!isNaN(totalNumV4) ? `Total ${(paymentSuffix || "por pessoa").trim()}: ${curSym} ${fmtBRv4(totalNumV4, hasCentsV4)}` : "");

      // Desconto p/ pílula Pix
      const descMatchV4 = (promoName || "").match(/(\d{1,2})\s*%/);
      const descNV4 = descMatchV4 ? descMatchV4[1] : "5";

      // ── [CARD] dimensões e posição (centralizado, mais abaixo do centro) ─
      // V4 precisa ser compacto: evita o “mar” de fundo primário entre a pílula 10X e o preço.
      const cardW = Math.round(width * (format === "story" ? 0.82 : 0.74));
      const cardMarginX = Math.round((width - cardW) / 2);
      // Altura adaptativa
      const cardPadTop = 36;
      const tagH = 56;
      const tagGap = 6;
      const titleH = 70;
      const titleGap = 18;
      const infoH = 46;
      const infoGap = 26;
      const priceBlockH = 170;
      const totalGap = (showTotal && totalStrV4) ? 14 : 0;
      const totalHv4 = (showTotal && totalStrV4) ? 28 : 0;
      const cardPadBottom = 36;
      const cardH = cardPadTop + tagH + tagGap + titleH + titleGap + infoH + infoGap + priceBlockH + totalGap + totalHv4 + cardPadBottom;

      // Posição vertical: card começa em ~32% para deixar céu visível em cima.
      const cardX = cardMarginX;
      const cardY = Math.round(height * 0.18);
      const cardR = 28;

      // Sombra suave
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.32)";
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 10;
      fillRoundRect(ctx, cardX, cardY, cardW, cardH, cardR, v4Primary);
      ctx.restore();

      const cxV4 = cardX + cardW / 2;
      let cyV4 = cardY + cardPadTop + 44; // baseline aproximada da tagline

      // [TAGLINE] cor secundária, peso black
      ctx.textAlign = "left";
      ctx.fillStyle = v4Secondary;
      let tagSize = 56;
      ctx.font = `900 ${tagSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(taglineV4).width > cardW - 80 && tagSize > 28) {
        tagSize -= 2;
        ctx.font = `900 ${tagSize}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(taglineV4, cardX + 36, cyV4);
      cyV4 += tagGap + 56;

      // [TÍTULO/DESTINO] branco, regular (mais leve), maior
      ctx.fillStyle = "#ffffff";
      let titSize = 72;
      ctx.font = `400 ${titSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(titleLineV4).width > cardW - 80 && titSize > 36) {
        titSize -= 2;
        ctx.font = `400 ${titSize}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(titleLineV4, cardX + 36, cyV4);
      cyV4 += titleGap + 26;

      // [INFO] dias | ícones — todos secondaryColor
      const infoYv4 = cyV4 + 8;
      ctx.fillStyle = v4Secondary;
      ctx.font = "700 32px Inter, Arial, sans-serif";
      ctx.textBaseline = "middle";
      const infoStartX = cardX + 36;
      ctx.fillText(daysTextV4, infoStartX, infoYv4);
      const daysWv4 = ctx.measureText(daysTextV4).width;
      // separador "|"
      ctx.fillText("|", infoStartX + daysWv4 + 14, infoYv4);
      const sepWv4 = ctx.measureText("|").width;
      // ícones na mesma linha
      const iconSizeV4 = 36;
      const iconGapV4 = 14;
      let iconCursor = infoStartX + daysWv4 + 14 + sepWv4 + 18;
      iconListV4.forEach((k) => {
        drawMonoIcon(ctx, k, iconCursor + iconSizeV4 / 2, infoYv4, iconSizeV4, v4Secondary);
        iconCursor += iconSizeV4 + iconGapV4;
      });
      ctx.textBaseline = "alphabetic";
      cyV4 += infoGap + 38;

      // [PRICE BLOCK] — esquerda: "a partir de" + pílula 12X + "sem juros"
      //                 direita: R$ pequeno + valor GIGANTE branco
      const priceY = cyV4;
      const priceGroupW = Math.min(cardW - 72, Math.round(width * (format === "story" ? 0.68 : 0.58)));
      const priceGroupX = cxV4 - priceGroupW / 2;
      const leftX = priceGroupX;
      const rightEdge = priceGroupX + priceGroupW;

      // Esquerda
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 22px Inter, Arial, sans-serif";
      ctx.fillText(leftTopV4, leftX, priceY + 24);

      // Pílula sincronizada com o modo de pagamento (10X / À VISTA / Entrada + parcelas)
      ctx.font = "900 38px Inter, Arial, sans-serif";
      const pillTxtW = ctx.measureText(pillTxt).width;
      const pillPadX = 18;
      const pillPadY = 8;
      const pillW = pillTxtW + pillPadX * 2;
      const pillH = 52;
      const pillX = leftX;
      const pillY = priceY + 36;
      fillRoundRect(ctx, pillX, pillY, pillW, pillH, 12, v4Secondary);
      ctx.fillStyle = v4OnSecondary;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(pillTxt, pillX + pillW / 2, pillY + pillH / 2 + 1);
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";

      // "sem juros" abaixo da pílula
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 22px Inter, Arial, sans-serif";
      ctx.fillText(leftBottomV4, leftX, pillY + pillH + 28);

      // Direita: R$ + centavos pequenos; valor principal gigante.
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      // Auto-shrink valor
      const reservedLeftPrice = pillX + pillW + 20;
      const maxValW = rightEdge - reservedLeftPrice - 70; // reserva menor p/ aproximar R$ + valor da pílula
      const centsMatchV4 = valNumV4.match(/^(.+?)([,.]\d{1,2})$/);
      const mainValV4 = centsMatchV4 ? centsMatchV4[1] : valNumV4;
      const centsValV4 = centsMatchV4 ? centsMatchV4[2] : "";
      let valSize = 140;
      ctx.font = `900 ${valSize}px Inter, Arial, sans-serif`;
      let smallPriceSize = Math.round(valSize * 0.34);
      let mainValWv4 = ctx.measureText(mainValV4).width;
      ctx.font = `700 ${smallPriceSize}px Inter, Arial, sans-serif`;
      let centsWv4 = centsValV4 ? ctx.measureText(centsValV4).width : 0;
      while (mainValWv4 + centsWv4 > maxValW && valSize > 64) {
        valSize -= 4;
        ctx.font = `900 ${valSize}px Inter, Arial, sans-serif`;
        mainValWv4 = ctx.measureText(mainValV4).width;
        smallPriceSize = Math.round(valSize * 0.34);
        ctx.font = `700 ${smallPriceSize}px Inter, Arial, sans-serif`;
        centsWv4 = centsValV4 ? ctx.measureText(centsValV4).width : 0;
      }
      const priceBaseY = priceY + 130;
      const mainRightX = rightEdge - centsWv4;
      ctx.font = `900 ${valSize}px Inter, Arial, sans-serif`;
      ctx.fillText(mainValV4, mainRightX, priceBaseY);
      if (centsValV4) {
        ctx.font = `700 ${smallPriceSize}px Inter, Arial, sans-serif`;
        ctx.fillText(centsValV4, rightEdge, priceBaseY - valSize * 0.08);
      }
      ctx.font = `700 ${smallPriceSize}px Inter, Arial, sans-serif`;
      ctx.fillText(curSym, mainRightX - mainValWv4 - 10, priceBaseY - valSize * 0.46);

      cyV4 = priceY + priceBlockH;

      // [TOTAL] (opcional)
      if (totalHv4 > 0) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.font = "600 22px Inter, Arial, sans-serif";
        ctx.fillText(totalStrV4, cxV4, cyV4 + 18);
      }

      // [BADGE PIX] pílula vazada na borda inferior — bottom: -20
      if (showPixBanner) {
        const pixLabel = (pixBannerText && pixBannerText.trim())
          || `${descNV4}% OFF À VISTA NO`;
        ctx.font = "900 26px Inter, Arial, sans-serif";
        const pixLabelW = ctx.measureText(pixLabel).width;
        const pixIconSize = 32;
        const pixGap = 10;
        ctx.font = "900 26px Inter, Arial, sans-serif";
        const pixWordW = ctx.measureText("pix").width;
        const pixPadX = 22;
        const pixTotalW = pixLabelW + pixGap + pixIconSize + 6 + pixWordW + pixPadX * 2;
        const pixHbadge = 60;
        const pixXbadge = cxV4 - pixTotalW / 2;
        const pixYbadge = cardY + cardH - pixHbadge / 2; // metade vazando para fora

        // sombra
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.28)";
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 6;
        fillRoundRect(ctx, pixXbadge, pixYbadge, pixTotalW, pixHbadge, pixHbadge / 2, v4Secondary);
        ctx.restore();

        // texto + logo pix
        ctx.fillStyle = v4OnSecondary;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "900 26px Inter, Arial, sans-serif";
        const txtX = pixXbadge + pixPadX;
        const midY = pixYbadge + pixHbadge / 2;
        ctx.fillText(pixLabel, txtX, midY + 1);
        const pxIconCx = txtX + pixLabelW + pixGap + pixIconSize / 2;
        drawPixLogo(ctx, pxIconCx, midY, pixIconSize, v4OnSecondary);
        ctx.font = "900 26px Inter, Arial, sans-serif";
        ctx.fillStyle = v4OnSecondary;
        ctx.fillText("pix", pxIconCx + pixIconSize / 2 + 6, midY + 1);
        ctx.textBaseline = "alphabetic";
      }

      return canvas.toDataURL("image/png");
    }


    // ── V3 · FULLBLEED com card centralizado flutuante ─────────────────────
    // Foto ocupa 100% da tela. Card semi-transparente centralizado na base.
    const c3 = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.38);
    ctx.drawImage(image, c3.sx, c3.sy, c3.sw, c3.sh, 0, 0, width, height);
    const g3 = ctx.createLinearGradient(0, height * 0.25, 0, height);
    g3.addColorStop(0, "rgba(0,0,0,0)"); g3.addColorStop(1, "rgba(0,0,0,0.86)");
    ctx.fillStyle = g3; ctx.fillRect(0, height * 0.25, width, height * 0.75);
    // Badge "Saindo de" sobre a foto
    drawBadge(left, logoH + 60, 480);
    // Destino gigante
    ctx.fillStyle = "#ffffff";
    let df3 = 92; ctx.font = `900 ${df3}px Inter, Arial, sans-serif`;
    while (ctx.measureText(destUp).width > contentWidth && df3 > 40) { df3 -= 5; ctx.font = `900 ${df3}px Inter, Arial, sans-serif`; }
    ctx.fillText(destUp, left, logoH + 176);
    // Card base transparente
    const cardY3 = 660;
    fillRoundRect(ctx, left - 20, cardY3, contentWidth + 40, 380, 28, "rgba(0,0,0,0.55)");
    // Headline
    ctx.fillStyle = secondaryColor; ctx.font = "700 30px Inter, Arial, sans-serif";
    ctx.fillText(titleText, left, cardY3 + 50);
    // Benefits 2 colunas
    const col3W = Math.floor(contentWidth / 2);
    highlights.slice(0, 4).forEach((h, i) => {
      const cx3 = left + (i % 2) * col3W;
      const cy3 = cardY3 + 90 + Math.floor(i / 2) * 72;
      ctx.fillStyle = "#ffffff"; ctx.font = "700 28px Inter, Arial, sans-serif";
      ctx.fillText(ICON_SYMBOL[h.icon || "check"] + " " + h.text, cx3, cy3);
    });
    // Preço
    ctx.fillStyle = secondaryColor; ctx.font = "900 72px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(mainPrice || `${curSym} ${price}`, width / 2, cardY3 + 312);
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "600 24px Inter, Arial, sans-serif";
    ctx.fillText([bottomSuffix, installments ? `${installments} sem juros` : ""].filter(Boolean).join(" · "), width / 2, cardY3 + 356);
    ctx.textAlign = "left";
    return canvas.toDataURL("image/png");
  };





  // Fundo inteligente: usa a cor primária como base, mas garante que a foto 
  // ocupe o máximo de espaço sem deixar "blocos" vazios nas margens de segurança.
  ctx.fillStyle = "#0a0a0a"; // Fundo neutro escuro sempre
  ctx.fillRect(0, 0, width, height);

  if (format === "square" && !isExperience) {
    return renderSafeSquareOffer();
  }

  // ============================================================
  // V0_Experiencia · ROTEAMENTO (estrutura lógica — sem layout ainda)
  // ------------------------------------------------------------
  // Renderiza SOMENTE quando a categoria "Experiência de Destino"
  // estiver selecionada (isExperience === true) e a variante forçada
  // for 0 (V0). Herda todos os dados do formulário lateral via
  // o escopo de composeTravelAd (destination, promoName, primaryColor,
  // secondaryColor, highlights, currencySymbol, fontFamily, etc.).
  //
  // ⚠️ Layout/CSS NÃO implementados ainda — placeholder mínimo.
  //    As variações da categoria "Oferta de Pacote" permanecem intactas.
  // ============================================================
  const renderV0Experiencia = (): string => {
    // ===== V0_Experiencia · LUXO & DESEJO (canvas) =====
    // Desenha: BG (cover) + overlay degradê + topo (promoName serif + adTitle)
    // + pílula (1º benefício/período) + headline (linha clara + linha black)
    // + CTA "RESERVE AGORA" (cor secundária) + rodapé legal.
    // O LOGO é composto depois pelo composeLogoOnImage (overlay automático).

    // 1) BG cover
    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.5);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

    // 2) Overlay degradê (from-black/60 via-black/30 to-black/80)
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(0,0,0,0.60)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.30)");
    grad.addColorStop(1, "rgba(0,0,0,0.80)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Helpers
    const cx = width / 2;
    const isStory = format === "story";
    // Reserva de topo p/ logo (composto depois)
    const topReserve = hasLogo ? (isStory ? 220 : 150) : (isStory ? 120 : 90);

    // Famílias
    const serif = `'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
    const sans = `Inter, Arial, sans-serif`;

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";

    // 3) TOPO · promoName (serif bold uppercase tracking-wider)
    const promoUpper = (promoName || "EXPERIÊNCIA EXCLUSIVA").toUpperCase();
    const promoSize = isStory ? 44 : 36;
    ctx.font = `800 ${promoSize}px ${serif}`;
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 8;
    // tracking simulado: insere espaços finos
    const tracked = promoUpper.split("").join("\u2009");
    ctx.fillText(tracked, cx, topReserve + promoSize);
    ctx.shadowBlur = 0;

    // adTitle (sans light)
    const subY = topReserve + promoSize + (isStory ? 56 : 44);
    if (titleText && titleText.trim()) {
      ctx.font = `300 ${isStory ? 28 : 22}px ${sans}`;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillText(titleText.trim(), cx, subY);
    }

    // 4) PÍLULA (bg branco translúcido, rounded-full)
    // V0_Experiencia NÃO usa highlights/ícones — apenas período da viagem se existir.
    const pillText = (() => {
      if (travelPeriod && travelPeriod.trim()) return travelPeriod.trim();
      return "";
    })();
    const pillY = subY + (isStory ? 50 : 38);
    if (pillText) {
      const pillFontSize = isStory ? 24 : 20;
      ctx.font = `500 ${pillFontSize}px ${sans}`;
      const padX = isStory ? 32 : 26;
      const padY = isStory ? 14 : 11;
      const tw = ctx.measureText(pillText).width;
      const pw = tw + padX * 2;
      const ph = pillFontSize + padY * 2;
      const px = cx - pw / 2;
      const py = pillY;
      // bg-white/20
      ctx.fillStyle = "rgba(255,255,255,0.20)";
      const r = ph / 2;
      ctx.beginPath();
      ctx.moveTo(px + r, py);
      ctx.lineTo(px + pw - r, py);
      ctx.arcTo(px + pw, py, px + pw, py + r, r);
      ctx.lineTo(px + pw, py + ph - r);
      ctx.arcTo(px + pw, py + ph, px + pw - r, py + ph, r);
      ctx.lineTo(px + r, py + ph);
      ctx.arcTo(px, py + ph, px, py + ph - r, r);
      ctx.lineTo(px, py + r);
      ctx.arcTo(px, py, px + r, py, r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.fillText(pillText, cx, py + ph / 2 + 1);
      ctx.textBaseline = "alphabetic";
    }

    // 5) HEADLINE PRINCIPAL (centro/baixo)
    // Linha 1: highlightLine (preço/desconto) em sans light
    // Linha 2: destino em sans black
    const highlightLine = (() => {
      if (priceWithSymbol && priceValueText) return priceWithSymbol;
      return "";
    })();
    const headlineLine2 = destFmt ? destFmt.toUpperCase() : "NESSA VIAGEM.";

    const blockBottom = height - (isStory ? 380 : 260); // espaço p/ CTA + legal
    const line2Size = isStory ? 110 : 78;
    const line1Size = isStory ? 56 : 42;
    const gap = isStory ? 14 : 10;

    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 10;

    // posiciona linha 2 acima do CTA
    const line2Y = blockBottom;
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${line2Size}px ${sans}`;
    // truncamento simples se passar
    let l2 = headlineLine2;
    while (ctx.measureText(l2).width > width - 80 && l2.length > 4) {
      l2 = l2.slice(0, -2);
    }
    if (l2 !== headlineLine2) l2 = l2.slice(0, -1) + "…";
    ctx.fillText(l2, cx, line2Y);

    if (highlightLine) {
      ctx.font = `300 ${line1Size}px ${sans}`;
      ctx.fillText(highlightLine, cx, line2Y - line2Size - gap + 8);
    }
    ctx.shadowBlur = 0;

    // 6) CTA "RESERVE AGORA" (cor secundária, rounded-md, tracking-wider)
    const ctaLabel = "RESERVE AGORA";
    const ctaFontSize = isStory ? 30 : 24;
    ctx.font = `800 ${ctaFontSize}px ${sans}`;
    const ctaTracked = ctaLabel.split("").join("\u2009");
    const ctaTw = ctx.measureText(ctaTracked).width;
    const ctaPadX = isStory ? 56 : 44;
    const ctaPadY = isStory ? 24 : 18;
    const ctaW = ctaTw + ctaPadX * 2;
    const ctaH = ctaFontSize + ctaPadY * 2;
    const ctaX = cx - ctaW / 2;
    const ctaY = line2Y + (isStory ? 60 : 40);
    const ctaR = isStory ? 10 : 8;

    // bg = cor secundária
    ctx.fillStyle = secondaryColor || "#FCD34D";
    ctx.beginPath();
    ctx.moveTo(ctaX + ctaR, ctaY);
    ctx.lineTo(ctaX + ctaW - ctaR, ctaY);
    ctx.arcTo(ctaX + ctaW, ctaY, ctaX + ctaW, ctaY + ctaR, ctaR);
    ctx.lineTo(ctaX + ctaW, ctaY + ctaH - ctaR);
    ctx.arcTo(ctaX + ctaW, ctaY + ctaH, ctaX + ctaW - ctaR, ctaY + ctaH, ctaR);
    ctx.lineTo(ctaX + ctaR, ctaY + ctaH);
    ctx.arcTo(ctaX, ctaY + ctaH, ctaX, ctaY + ctaH - ctaR, ctaR);
    ctx.lineTo(ctaX, ctaY + ctaR);
    ctx.arcTo(ctaX, ctaY, ctaX + ctaR, ctaY, ctaR);
    ctx.closePath();
    ctx.fill();

    // texto branco
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(ctaTracked, cx, ctaY + ctaH / 2 + 1);
    ctx.textBaseline = "alphabetic";

    // 7) Rodapé legal removido a pedido — fotos são reais, não há IA aqui.

    ctx.textAlign = "left";
    return canvas.toDataURL("image/png");
  };


  // ============================================================
  // V1_Experiencia · ROTEAMENTO (estrutura lógica — sem layout ainda)
  // ------------------------------------------------------------
  // Renderiza SOMENTE quando a categoria "Experiência de Destino"
  // estiver selecionada (isExperience === true) e a variante forçada
  // for 1 (V1). Herda os mesmos dados do formulário lateral via o
  // escopo de composeTravelAd.
  //
  // ⚠️ Layout/CSS NÃO implementados ainda — placeholder que reaproveita
  //    o canvas de V0_Experiencia para não quebrar o fluxo até o design
  //    da V1 ser definido. NÃO altera a renderização da V0.
  // ============================================================
  const renderV1Experiencia = (): string => {
    // ===== V1_Experiencia · LUXO CINEMATOGRÁFICO (canvas) =====
    // 3 blocos centralizados (topo · centro · slogan), todos em branco,
    // overlay sutil bg-black/30. Tipografia: Serif (Playfair) + Cursive
    // (Dancing Script) + Italic. Logo composto pelo overlay automático.

    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.5);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

    // Overlay sutil — bg-black/30
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const isStory = format === "story";

    const serif = `'Playfair Display', 'Bodoni Moda', Georgia, serif`;
    const script = `'Dancing Script', 'Great Vibes', cursive`;

    // Reservas de margem (px)
    const padTop = isStory ? (hasLogo ? 200 : 110) : (hasLogo ? 140 : 80);
    const padBottom = isStory ? 90 : 70;

    // Helper: shadow sutil (sempre ativa no V1 para garantir leitura sobre céu/fundo claro)
    const withShadow = (cb: () => void) => {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 10;
      cb();
      ctx.restore();
    };

    // Helper de tracking simulado (insere espaços finos entre letras)
    const trackText = (s: string) => s.split("").join("\u2009");

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";

    // ───────────────────────────────────────────────
    // BLOCO SUPERIOR — promoName (serif uppercase widest) + travelPeriod (cursive)
    // ───────────────────────────────────────────────
    const promo = (promoName || "").trim().toUpperCase();
    const promoSize = isStory ? 30 : 24;
    let topY = padTop;
    if (promo) {
      ctx.font = `600 ${promoSize}px ${serif}`;
      withShadow(() => ctx.fillText(trackText(promo), cx, topY));
      topY += promoSize + (isStory ? 18 : 14);
    }

    // travelPeriod (cursive)
    const period = (travelPeriod && travelPeriod.trim())
      ? travelPeriod.trim()
      : "uma jornada inesquecível";
    const periodSize = isStory ? 36 : 28;
    ctx.font = `600 ${periodSize}px ${script}`;
    withShadow(() => ctx.fillText(period, cx, topY + periodSize * 0.85));

    // ───────────────────────────────────────────────
    // BLOCO CENTRAL — experienceDescription (serif bold uppercase) + adTitle (serif normal)
    // ───────────────────────────────────────────────
    const benefitsText = ((highlights || [])
      .map((h: any) => (typeof h === "string" ? h : h?.text))
      .filter((t: any) => t && String(t).trim().length > 0)
      .join(" · ")) || (destination || "").toUpperCase();
    const desc = benefitsText.toUpperCase();

    // Quebra de linha simples (até 2 linhas)
    const wrapLines = (text: string, maxWidth: number, font: string): string[] => {
      ctx.font = font;
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let current = "";
      for (const w of words) {
        const next = current ? `${current} ${w}` : w;
        if (ctx.measureText(next).width <= maxWidth) {
          current = next;
        } else {
          if (current) lines.push(current);
          current = w;
        }
      }
      if (current) lines.push(current);
      return lines.slice(0, 2);
    };

    const maxTextW = width - (isStory ? 80 : 100);
    let descSize = isStory ? 72 : 56;
    let descFont = `800 ${descSize}px ${serif}`;
    let descLines = wrapLines(desc, maxTextW, descFont);
    while (descLines.some((l) => ctx.measureText(l).width > maxTextW) && descSize > 36) {
      descSize -= 4;
      descFont = `800 ${descSize}px ${serif}`;
      descLines = wrapLines(desc, maxTextW, descFont);
    }

    const adSize = isStory ? 26 : 22;
    const adFont = `400 ${adSize}px ${serif}`;
    const ad = (titleText || "").trim();

    const lineGap = Math.round(descSize * 0.18);
    const descBlockH = descLines.length * descSize + Math.max(0, descLines.length - 1) * lineGap;
    const adH = ad ? adSize + 14 : 0;
    const centerBlockH = descBlockH + adH;

    const centerY = (height / 2) - centerBlockH / 2 + descSize * 0.85;
    ctx.font = descFont;
    withShadow(() => {
      descLines.forEach((line, i) => {
        const y = centerY + i * (descSize + lineGap);
        ctx.fillText(line, cx, y);
      });
    });

    if (ad) {
      const adY = centerY + (descLines.length - 1) * (descSize + lineGap) + adSize + 18;
      ctx.font = adFont;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      withShadow(() => ctx.fillText(ad, cx, adY));
      ctx.fillStyle = "#ffffff";
    }

    // ───────────────────────────────────────────────
    // BLOCO INFERIOR — slogan (serif italic medium)
    // ───────────────────────────────────────────────
    const slogan = (paymentSuffix && paymentSuffix.trim())
      ? paymentSuffix.trim()
      : "Sua viagem começa aqui";
    const sloganSize = isStory ? 26 : 22;
    ctx.font = `italic 500 ${sloganSize}px ${serif}`;
    withShadow(() => ctx.fillText(slogan, cx, height - padBottom));

    ctx.textAlign = "left";
    return canvas.toDataURL("image/png");
  };

  if (isExperience && typeof forceVariant === "number" && forceVariant === 0) {
    return renderV0Experiencia();
  }
  if (isExperience && typeof forceVariant === "number" && forceVariant === 1) {
    return renderV1Experiencia();
  }
  // ============================================================
  // V2_Experiencia · ROTEAMENTO (estrutura lógica — sem layout ainda)
  // ------------------------------------------------------------
  // Reservado exclusivamente para a categoria "Experiência de Destino".
  // Layout/CSS ainda NÃO implementados — fallback temporário usa o
  // canvas da V1 para não quebrar o fluxo até o design ser definido.
  // NÃO altera renderização da V0 nem da V1.
  // ============================================================
  if (isExperience && typeof forceVariant === "number" && forceVariant === 2) {
    return renderV1Experiencia();
  }

  if (strategy === "ancora") {
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, width, height);

    const panelW = Math.round(width * 0.44);
    const photoX = panelW + 24;
    const photoY = safeTop - 30;
    const photoW = width - photoX - 42;
    const photoH = panelBottom - photoY;
    drawRoundedPhoto(photoX, photoY, photoW, photoH, 44, format === "story" ? 0.34 : 0.4);

    const topY = safeTop + 28;
    drawBadge(left, topY, panelW - left - 28);
    ctx.fillStyle = "#ffffff";
    drawTextBlock(ctx, titleText, left, topY + 150, panelW - left - 36, 70, 2, { baseFontSize: 66, minFontSize: 38 });
    drawPromoKicker(left, topY + 300);
    const pillsH = drawHighlightsBlock(left, topY + 396, panelW - left - 36, 5, false, format !== "story");
    drawPriceCard(left, Math.min(panelBottom - 170, topY + 420 + pillsH), panelW - left - 36, 146, "left");
  } else if (strategy === "matriz") {
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, width, height);

    const photoY = safeTop + 12;
    const photoH = format === "story" ? 500 : 360;
    drawRoundedPhoto(left, photoY, contentWidth, photoH, 44, 0.36);

    const lowerY = photoY + photoH + 34;
    const leftColW = Math.round(contentWidth * 0.5);
    drawBadge(left, lowerY, leftColW);
    ctx.fillStyle = "#ffffff";
    drawTextBlock(ctx, titleText, left, lowerY + 136, leftColW, 72, 4, { baseFontSize: 68, minFontSize: 34 });
    drawPromoKicker(left, lowerY + 294);

    const rightColX = left + leftColW + 24;
    const rightColW = contentWidth - leftColW - 24;
    const pillsH = drawHighlightsBlock(rightColX, lowerY + 8, rightColW, 5, true, format !== "story");
    const priceY = Math.min(panelBottom - 180, lowerY + pillsH + 40);
    drawPriceCard(rightColX, priceY, rightColW, 154, "right");
  } else if (strategy === "gancho") {
    // Foto de fundo cobre toda a tela com gradiente escurecido na base
    const heroH = panelBottom;
    const crop = fitCover(image.naturalWidth, image.naturalHeight, width, heroH, format === "story" ? 0.38 : 0.42);
    ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, heroH);
    const overlay = ctx.createLinearGradient(0, 0, 0, heroH);
    overlay.addColorStop(0, "rgba(0,0,0,0.08)");
    overlay.addColorStop(0.5, "rgba(0,0,0,0.25)");
    overlay.addColorStop(1, "rgba(0,0,0,0.88)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, heroH);

    const panelH = format === "story" ? 920 : 500;
    const panelY = panelBottom - panelH;
    fillRoundRect(ctx, left, panelY, contentWidth, panelH, 42, "rgba(7,10,18,0.78)");

    const badgeY = panelY + 28;
    drawBadge(left + 28, badgeY, 380);

    ctx.fillStyle = "#ffffff";
    const titleY = badgeY + 96;
    drawTextBlock(ctx, titleText, left + 28, titleY, contentWidth - 56, format === "story" ? 72 : 60, 2, { baseFontSize: format === "story" ? 68 : 58, minFontSize: 32 });

    // Destino em destaque (grande, abaixo do título)
    const destY = titleY + (format === "story" ? 164 : 136);
    let destFontSize = format === "story" ? 68 : 54;
    ctx.font = `900 ${destFontSize}px Inter, Arial, sans-serif`;
    const destStr = (destination || "").toUpperCase();
    while (ctx.measureText(destStr).width > contentWidth - 80 && destFontSize > 32) {
      destFontSize -= 4;
      ctx.font = `900 ${destFontSize}px Inter, Arial, sans-serif`;
    }
    ctx.fillStyle = secondaryColor;
    ctx.fillText(destStr, left + 28, destY);

    // 3 Pills compactos — abaixo do destino
    const pillsY = destY + (format === "story" ? 40 : 34);
    // Exibe até 6 destaques no formato compacto
    drawHighlightsBlock(left + 28, pillsY, contentWidth - 56, 6, true, true);

    // Price card — SEMPRE abaixo dos pills, sem Math.min que causava sobreposição
    // Cada pill compact = 70px.
    const pillsCount = highlights.slice(0, 6).length;
    const priceCardY = pillsY + pillsCount * 70 + 20;
    drawPriceCard(left + 28, priceCardY, contentWidth - 56, 290, "right");


  } else if (strategy === "experiencia_hero") {
    const heroH = format === "story" ? panelBottom : height;
    const crop = fitCover(image.naturalWidth, image.naturalHeight, width, heroH, format === "story" ? 0.34 : 0.38);
    ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, heroH);

    const veil = ctx.createLinearGradient(0, 0, 0, heroH);
    veil.addColorStop(0, "rgba(0,0,0,0.08)");
    veil.addColorStop(0.52, "rgba(0,0,0,0.10)");
    veil.addColorStop(1, "rgba(0,0,0,0.62)");
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, width, heroH);

    const textY = format === "story" ? panelBottom - 520 : height - 380;
    const titleY = format === "story" ? textY + 96 : textY + 92;
    const benefitsY = format === "story" ? textY + 332 : textY + 248;
    const footerY = format === "story" ? textY + 245 : textY + 318;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = "700 30px Inter, Arial, sans-serif";
    ctx.fillText(cityFmt ? `Saindo de ${cityFmt}` : "Experiência completa", left, textY);
    drawTextBlock(ctx, titleText, left, titleY, contentWidth, format === "story" ? 92 : 72, 2, { fontWeight: "800", baseFontSize: format === "story" ? 88 : 66, minFontSize: 42 });

    const smallItems = shownHighlights.slice(0, 3).map((h) => h.text).join("   •   ");
    ctx.font = `700 ${format === "story" ? 25 : 24}px Inter, Arial, sans-serif`;
    drawTextBlock(ctx, `•   ${smallItems}`, left, benefitsY, contentWidth, format === "story" ? 34 : 32, 2, { fontWeight: "700", baseFontSize: format === "story" ? 25 : 24, minFontSize: 18 });

    ctx.font = "500 30px Inter, Arial, sans-serif";
    ctx.fillText(subtitleText, left, footerY);
  } else if (strategy === "experiencia_editorial") {
    ctx.fillStyle = "#f7f2ea";
    ctx.fillRect(0, 0, width, height);
    const photoX = Math.round(width * 0.42);
    const photoY = safeTop - 40;
    const photoW = width - photoX - 48;
    const photoH = panelBottom - photoY - 44;
    drawRoundedPhoto(photoX, photoY, photoW, photoH, 34, 0.36);

    const columnW = photoX - left - 42;
    ctx.fillStyle = primaryColor;
    ctx.textAlign = "left";
    ctx.font = "700 28px Inter, Arial, sans-serif";
    ctx.fillText(cityFmt ? `Saindo de ${cityFmt}` : "Roteiro especial", left, safeTop + 54);
    drawTextBlock(ctx, titleText, left, safeTop + 170, columnW, 78, 3, { fontWeight: "800", baseFontSize: 74, minFontSize: 42 });
    ctx.fillStyle = "#2b2118";
    ctx.font = "500 38px Inter, Arial, sans-serif";
    drawTextBlock(ctx, "Uma experiência pensada para viver o destino com calma, beleza e curadoria.", left, safeTop + 420, columnW, 50, 4, { fontWeight: "500", baseFontSize: 38, minFontSize: 28 });
    ctx.font = "700 32px Inter, Arial, sans-serif";
    shownHighlights.slice(0, 4).forEach((item, idx) => {
      ctx.fillStyle = primaryColor;
      ctx.fillText("•", left, safeTop + 640 + idx * 70);
      ctx.fillStyle = "#2b2118";
      ctx.fillText(item.text, left + 38, safeTop + 640 + idx * 70);
    });
    ctx.font = "700 28px Inter, Arial, sans-serif";
    ctx.fillStyle = primaryColor;
    ctx.fillText("Consulte disponibilidade", left, Math.min(panelBottom - 90, safeTop + 930));
  } else if (strategy === "experiencia_postcard") {
    const heroH = panelBottom;
    const crop = fitCover(image.naturalWidth, image.naturalHeight, width, heroH, format === "story" ? 0.28 : 0.34);
    ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, heroH);

    const shade = ctx.createLinearGradient(0, 0, 0, heroH);
    shade.addColorStop(0, "rgba(0,0,0,0.18)");
    shade.addColorStop(0.48, "rgba(0,0,0,0.02)");
    shade.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, width, heroH);

    ctx.strokeStyle = "rgba(255,255,255,0.82)";
    ctx.lineWidth = 3;
    ctx.strokeRect(left, safeTop + 20, contentWidth, panelBottom - safeTop - 80);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "700 28px Inter, Arial, sans-serif";
    ctx.fillText(cityFmt ? `Saindo de ${cityFmt}` : "Roteiro especial", width / 2, safeTop + 96);
    ctx.textAlign = "left";
    drawTextBlock(ctx, destFmt, left + 42, panelBottom - 360, contentWidth - 84, 86, 2, { fontWeight: "800", baseFontSize: format === "story" ? 92 : 70, minFontSize: 44 });
    ctx.font = "500 30px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(subtitleText, width / 2, panelBottom - 165);
    ctx.textAlign = "left";
  } else if (strategy === "experiencia_lifestyle") {
    const photoH = Math.round(panelBottom * 0.76);
    const crop = fitCover(image.naturalWidth, image.naturalHeight, width, photoH, format === "story" ? 0.42 : 0.46);
    ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, photoH);
    const grad = ctx.createLinearGradient(0, photoH - 240, 0, photoH);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, photoH - 240, width, 240);
    ctx.fillStyle = "#ffffff";
    drawTextBlock(ctx, titleText, left, photoH - 210, contentWidth, 78, 2, { fontWeight: "800", baseFontSize: format === "story" ? 78 : 62, minFontSize: 40 });

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, photoH, width, height - photoH);
    ctx.fillStyle = primaryColor;
    ctx.font = "700 30px Inter, Arial, sans-serif";
    ctx.fillText(subtitleText, left, photoH + 92);
    ctx.fillStyle = "#1f2937";
    ctx.font = "500 30px Inter, Arial, sans-serif";
    drawTextBlock(ctx, "Um roteiro com beleza, conforto e momentos autênticos no destino.", left, photoH + 160, contentWidth, 42, 3, { fontWeight: "500", baseFontSize: 30, minFontSize: 22 });
    shownHighlights.slice(0, 3).forEach((item, idx) => {
      ctx.fillStyle = primaryColor;
      ctx.font = "800 28px Inter, Arial, sans-serif";
      ctx.fillText("—", left, photoH + 340 + idx * 58);
      ctx.fillStyle = "#1f2937";
      ctx.font = "700 27px Inter, Arial, sans-serif";
      ctx.fillText(item.text, left + 46, photoH + 340 + idx * 58);
    });
  } else {
    const bottomHeight = format === "story" ? 770 : 560;
    const photoHeight = height - safeBottom - bottomHeight;
    const bottomY = photoHeight;

    const crop = fitCover(image.naturalWidth, image.naturalHeight, width, photoHeight, format === "story" ? 0.35 : 0.4);
    ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, photoHeight);

    const photoGradient = ctx.createLinearGradient(0, photoHeight - 160, 0, photoHeight);
    photoGradient.addColorStop(0, "rgba(0,0,0,0)");
    photoGradient.addColorStop(1, "rgba(0,0,0,0.25)");
    ctx.fillStyle = photoGradient;
    ctx.fillRect(0, photoHeight - 160, width, 160);

    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, bottomY, width, bottomHeight);

    let cursorY = bottomY + 40;
    drawBadge(left, cursorY, contentWidth);
    cursorY += 92;

    ctx.fillStyle = "#ffffff";
    drawTextBlock(ctx, titleText, left, cursorY + 56, contentWidth, 80, 2, { baseFontSize: 76, minFontSize: 44 });
    cursorY += 168;

    const pillsH = drawHighlightsBlock(left, cursorY, contentWidth, 5, false);
    cursorY += pillsH + 28;

    drawPriceCard(left, cursorY, contentWidth, 168, "right");
    drawPromoKicker(left + 32, cursorY + 52, "#111111");
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  return canvas.toDataURL("image/png");
}

/**
 * Reenquadra (cover crop) uma imagem qualquer para o aspecto pedido (story 9:16 ou square 1:1).
 * Garante que a IA, que normalmente devolve em ~quadrado, fique no formato correto da rede social.
 */
export async function reframeImageToAspect(
  imageDataUrl: string,
  format: Format
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const targetW = 1080;
        const targetH = format === "story" ? 1920 : 1080;
        // Se já está no aspecto desejado (tolerância de 2%), retorna como veio.
        const currentRatio = img.naturalWidth / img.naturalHeight;
        const targetRatio = targetW / targetH;
        if (Math.abs(currentRatio - targetRatio) < 0.02) {
          resolve(imageDataUrl);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas 2D não suportado"));

        // COVER CROP — preenche toda a tela 9:16 ou 1:1 sem barras laterais brancas.
        // O prompt da IA já instrui a concentrar o conteúdo importante no miolo central
        // (entre 18% e 82% da altura, com ~10% de margem lateral), de modo que o recorte
        // lateral não corta texto, preço nem CTA. Isso elimina o efeito "moldura branca".
        const scale = Math.max(targetW / img.naturalWidth, targetH / img.naturalHeight);
        const drawW = Math.round(img.naturalWidth * scale);
        const drawH = Math.round(img.naturalHeight * scale);
        const dx = Math.round((targetW - drawW) / 2);
        const dy = Math.round((targetH - drawH) / 2);
        ctx.drawImage(img, dx, dy, drawW, drawH);

        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Falha ao carregar imagem para reenquadrar"));
    img.src = imageDataUrl;
  });
}
