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
  const normalized = (bg || "").trim().toLowerCase();
  if (normalized === "#0c2340") return "#ffffff";
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
  /** Opções de Branding (Logo e Contatos) unificadas no motor principal */
  logoDataUrl?: string;
  whatsapp?: string;
  instagram?: string;
  footerContact1Icon?: string;
  footerContact1Value?: string;
  footerContact2Icon?: string;
  footerContact2Value?: string;
}

/** Formata telefone no padrão (XX) 9 XXXX-XXXX */
export function formatAdPhone(val: string): string {
  const d = (val || "").replace(/\D/g, "");
  if (d.length > 11) return val;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return d;
}

/** Desenha ícone do WhatsApp colorido */
function drawAdWhatsAppIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colorMode: "green" | "custom" = "green", customColor: string = "#ffffff") {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 4;

  if (colorMode === "green") {
    // Fundo Verde Oficial
    ctx.fillStyle = "#25D366";
    ctx.beginPath(); 
    ctx.arc(0, 0, size * 0.48, 0, Math.PI * 2); 
    ctx.fill();
    
    // Balão Branco
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(0, -size * 0.02, size * 0.4, 0.7, 5.5);
    ctx.lineTo(-size * 0.35, size * 0.45);
    ctx.closePath();
    ctx.fill();

    // Fone Verde
    ctx.fillStyle = "#25D366";
    ctx.lineWidth = size * 0.10; // Aumentado para 0.10 (mais visível)
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.22, 0.8, 2.3);
    ctx.stroke();
    // Pontas do fone
    ctx.save(); ctx.rotate(0.8); ctx.fillRect(size * 0.16, -size * 0.08, size * 0.12, size * 0.16); ctx.restore();
    ctx.save(); ctx.rotate(2.3); ctx.fillRect(size * 0.16, -size * 0.08, size * 0.12, size * 0.16); ctx.restore();
  } else {
    // MODO MONOCROMÁTICO (Recorte real usando buffer)
    const buffer = document.createElement("canvas");
    buffer.width = size;
    buffer.height = size;
    const bctx = buffer.getContext("2d");
    if (bctx) {
      bctx.translate(size/2, size/2);
      bctx.fillStyle = customColor;
      // Balão
      bctx.beginPath();
      bctx.arc(0, -size * 0.02, size * 0.4, 0.7, 5.5);
      bctx.lineTo(-size * 0.35, size * 0.45);
      bctx.closePath();
      bctx.fill();

      // Fura o fone
      bctx.globalCompositeOperation = "destination-out";
      bctx.lineWidth = size * 0.10; // Aumentado para 0.10
      bctx.lineCap = "round";
      bctx.beginPath();
      bctx.arc(0, 0, size * 0.22, 0.8, 2.3);
      bctx.stroke();
      bctx.save(); bctx.rotate(0.8); bctx.fillRect(size * 0.16, -size * 0.08, size * 0.12, size * 0.16); bctx.restore();
      bctx.save(); bctx.rotate(2.3); bctx.fillRect(size * 0.16, -size * 0.08, size * 0.12, size * 0.16); bctx.restore();
      
      ctx.drawImage(buffer, -size/2, -size/2);
    }
  }

  ctx.restore();
}

/** Desenha ícone do Instagram com gradiente oficial */
function drawAdInstagramIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colorMode: "gradient" | "custom" = "gradient", customColor: string = "#ffffff") {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 4;

  if (colorMode === "gradient") {
    const g = ctx.createRadialGradient(size * 0.1, size * 0.1, 0, 0, 0, size * 0.7);
    g.addColorStop(0, "#f09433"); 
    g.addColorStop(0.25, "#e6683c"); 
    g.addColorStop(0.5, "#dc2743");
    g.addColorStop(0.75, "#cc2366"); 
    g.addColorStop(1, "#bc1888");
    ctx.fillStyle = g;
    ctx.beginPath(); 
    ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.25); 
    ctx.fill();
    
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    // Câmera
    ctx.lineWidth = size * 0.08; 
    ctx.strokeRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
    ctx.beginPath(); ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(size * 0.18, -size * 0.18, size * 0.04, 0, Math.PI * 2); ctx.fill();
  } else {
    // MODO MONOCROMÁTICO
    const buffer = document.createElement("canvas");
    buffer.width = size;
    buffer.height = size;
    const bctx = buffer.getContext("2d");
    if (bctx) {
      bctx.translate(size/2, size/2);
      bctx.fillStyle = customColor;
      bctx.beginPath(); 
      bctx.roundRect(-size / 2, -size / 2, size, size, size * 0.25); 
      bctx.fill();
      
      bctx.globalCompositeOperation = "destination-out";
      bctx.lineWidth = size * 0.08;
      bctx.strokeRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
      bctx.beginPath(); bctx.arc(0, 0, size * 0.15, 0, Math.PI * 2); bctx.stroke();
      bctx.beginPath(); bctx.arc(size * 0.18, -size * 0.18, size * 0.04, 0, Math.PI * 2); bctx.fill();
      
      ctx.drawImage(buffer, -size/2, -size/2);
    }
  }

  ctx.restore();
}

/** Desenha ícone de Site / Globo */
function drawAdWebsiteIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string = "#ffffff") {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.08;
  ctx.beginPath(); ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, size * 0.18, size * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-size * 0.45, 0); ctx.lineTo(size * 0.45, 0); ctx.stroke();
  ctx.restore();
}

/** 
 * DESENHA O BRANDING FINAL (Rodapé, Logo, WhatsApp, Instagram)
 * Unificado para evitar cache e garantir consistência.
 */
async function drawFinalBranding(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  logoUrl?: string,
  contact1?: { icon: string; value: string },
  contact2?: { icon: string; value: string },
  agencyName?: string,
  textColorOverride?: string,
  fontFamily: string = "Inter"
) {
  const contactsToDraw: { icon: string; value: string }[] = [];
  // Só adiciona contatos que tenham valor preenchido (evita ícones vazios)
  if (contact1 && contact1.icon !== "none" && contact1.value && contact1.value.trim()) contactsToDraw.push(contact1);
  if (contact2 && contact2.icon !== "none" && contact2.value && contact2.value.trim()) contactsToDraw.push(contact2);

  if (!logoUrl && contactsToDraw.length === 0) return;

  const isStory = ch > cw;
  const footerHeight = isStory ? 120 : 100;
  // Move o rodapé para cima da barra de mensagens do Instagram (aprox 280px do fundo)
  const safeBottomMargin = isStory ? 340 : 20; // Subido de 280 para 340 para limpar a reply bar do Instagram
  const footerY = ch - footerHeight - safeBottomMargin;

  // 1. Fundo do Rodapé (VÉU GRADIENTE ESCURO)
  // O usuário prefere SEMPRE o véu escuro com letras brancas para garantir o look "Premium".
  const veilStartY = footerY - 50;
  const grad = ctx.createLinearGradient(0, veilStartY, 0, ch);
  grad.addColorStop(0, "rgba(0,0,0,0.0)");
  grad.addColorStop(0.3, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0.92)");
  
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, veilStartY, cw, ch - veilStartY);
  ctx.restore();

  const padX = isStory ? 80 : 60; // Mais margem lateral
  const bgPad = isStory ? 10 : 8;
  const centerY = footerY + footerHeight / 2;

  // 2. Logo (Esquerda)
  let lw = 0;
  let lh = 0;

  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl);
      const maxLogoH = footerHeight * 0.85;
      const maxLogoW = cw * 0.35;
      const ratio = logo.naturalWidth / logo.naturalHeight;
      lh = maxLogoH;
      lw = lh * ratio;
      if (lw > maxLogoW) {
        lw = maxLogoW;
        lh = lw / ratio;
      }
      
      ctx.save();
      // Moldura Premium (Sombra suave e borda sutil)
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 5;
      
      const isSquareLogo = Math.abs(ratio - 1) < 0.2;
      const radius = isSquareLogo ? (lw + bgPad * 2) / 2 : 12;
      
      fillRoundRect(ctx, padX, centerY - lh / 2 - bgPad, lw + bgPad * 2, lh + bgPad * 2, radius, "#ffffff");
      
      ctx.drawImage(logo, padX + bgPad, centerY - lh / 2, lw, lh);
      ctx.restore();
    } catch (e) {
      console.warn("Falha ao carregar logo para branding", e);
    }
  } else {
    // WORDMARK FALLBACK
    const name = (agencyName || "Sua Agência").toUpperCase();
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    let wordmarkSize = isStory ? 44 : 36;
    ctx.font = `800 ${wordmarkSize}px ${fontFamily || 'Inter'}, sans-serif`;
    
    // Auto-shrink Wordmark
    const maxWordmarkW = cw * 0.45;
    while (ctx.measureText(name).width > maxWordmarkW && wordmarkSize > 18) {
      wordmarkSize -= 2;
      ctx.font = `800 ${wordmarkSize}px ${fontFamily || 'Inter'}, sans-serif`;
    }
    
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 10;
    ctx.fillText(name, padX, centerY);
    lw = ctx.measureText(name).width;
    ctx.restore();
  }

  // 3. Contatos (Direita)
  ctx.save();
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  // Revertido para Bold (700) e tamanhos mais impactantes conforme desejo do usuário
  const fontSize = isStory ? 36 : 30; 
  const safeFont = fontFamily || "Inter";
  ctx.font = `700 ${fontSize}px ${safeFont}, sans-serif`;
  
  // Rodapé sempre BRANCO com sombra escura (look clássico Canva Viagem)
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 6;

  let textRightX = cw - (isStory ? 80 : 60); // Sincronizado com a margem do logo
  const itemGap = 20; // Aumentado o gap entre ícone e texto
  const logoEdge = logoUrl ? (padX + lw + bgPad * 2 + 30) : padX;
  const maxAvailableWidth = textRightX - logoEdge;

  let yPos = contactsToDraw.length === 2 ? centerY + (footerHeight * 0.18) : centerY;

  for (const c of contactsToDraw) {
    let displayValue = c.value;
    if (c.icon.startsWith("whatsapp")) displayValue = formatAdPhone(c.value);
    if (c.icon.startsWith("instagram")) displayValue = c.value.startsWith("@") ? c.value : `@${c.value}`;

    // Auto-shrink para evitar colisão
    let currentFontSize = fontSize;
    const iconSizeFactor = 1.1;
    let currentIconSize = currentFontSize * iconSizeFactor;
    
    ctx.font = `700 ${currentFontSize}px ${safeFont}, sans-serif`;
    const safetyMargin = 40;
    while (ctx.measureText(displayValue).width + currentIconSize + itemGap + safetyMargin > maxAvailableWidth && currentFontSize > 16) {
      currentFontSize -= 1;
      currentIconSize = currentFontSize * iconSizeFactor;
      ctx.font = `700 ${currentFontSize}px ${safeFont}, sans-serif`;
    }

    ctx.fillText(displayValue, textRightX, yPos);
    const textWidth = ctx.measureText(displayValue).width;
    const iconX = textRightX - textWidth - itemGap - currentIconSize/2;

    if (c.icon === "whatsapp_green") drawAdWhatsAppIcon(ctx, iconX, yPos, currentIconSize, "green");
    else if (c.icon === "whatsapp_custom") drawAdWhatsAppIcon(ctx, iconX, yPos, currentIconSize, "custom", ctx.fillStyle);
    else if (c.icon === "instagram_gradient") drawAdInstagramIcon(ctx, iconX, yPos, currentIconSize, "gradient");
    else if (c.icon === "instagram_custom") drawAdInstagramIcon(ctx, iconX, yPos, currentIconSize, "custom", ctx.fillStyle);
    else if (c.icon === "website") drawAdWebsiteIcon(ctx, iconX, yPos, currentIconSize, ctx.fillStyle);

    yPos -= (footerHeight * 0.36);
  }
  ctx.restore();
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

function fitCover(iw: number, ih: number, tw: number, th: number, fy = 0.5) {
  const ratio = Math.max(tw / iw, th / ih);
  const sw = tw / ratio;
  const sh = th / ratio;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) * fy;
  return { sx, sy, sw, sh };
}

function applyFilmGrain(ctx: CanvasRenderingContext2D, width: number, height: number, amount = 0.05) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * amount * 255;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
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
    logoDataUrl,
    whatsapp,
    instagram,
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
  const effectiveTextColor = overrideColorHex || textColorOverride || undefined;

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

  // ── Inteligência de Contraste ──
  // Se o usuário escolheu uma cor de texto específica (textColorOverride), 
  // tentamos usá-la. Mas se ela não tiver contraste com o fundo (bg),
  // usamos contrastOn(bg) para garantir que o cliente consiga ler.
  const getSafeColor = (bg: string, preferred?: string) => {
    const target = preferred || overrideColorHex || "#ffffff";
    return ensureContrast(target, bg, 0.35);
  };

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
  const hasDest = destFmt.length > 0;

  // Pools de headlines — variantes que dependem do destino só entram se houver destino preenchido.
  // Frases banidas globalmente (alinhado com edge function): "O melhor de", "Seu próximo destino é esse".
  // ===========================================================================
  // 🛡️ SISTEMA DE BLINDAGEM CANVA VIAGEM (NÍVEL 3) 🛡️
  // ---------------------------------------------------------------------------
  // REGRA 1: SEGURANÇA TOTAL INSTAGRAM (340px bottom offset em Stories).
  // REGRA 2: SEPARAÇÃO CATEGÓRICA (Experiência != Oferta).
  // REGRA 3: HIGIENIZAÇÃO DE ESTADO (Nenhum dado de preço vaza para ads de luxo).
  // ===========================================================================
  const isExperience = !!options.isExperience; 
  const isStory = format === "story";
  const curSym = currencySymbol || "R$";

  // Higienização Imutável (Garante que nunca haverá preço em Experience)
  const price = isExperience ? "" : (options.price || "");
  const installments = isExperience ? "" : (options.installments || "");
  const showTotal = isExperience ? false : (options.showTotal !== false);
  const showPixBanner = isExperience ? false : (options.showPixBanner !== false);

  const RULES = {
    SAFE_BOTTOM: isStory ? 480 : 120, // Zona de exclusão absoluta para conteúdo dinâmico
    SAFE_TOP: isStory ? 280 : 60,
    LEFT: 80,
    RIGHT: width - 80,
    PANEL_BOTTOM: height - (isStory ? 480 : 120)
  };

  const panelBottom = RULES.PANEL_BOTTOM;
  const left = RULES.LEFT;
  const right = RULES.RIGHT;
  const contentWidth = right - left;
  const safeTop = RULES.SAFE_TOP;
  const safeBottom = RULES.SAFE_BOTTOM;

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
    
    const cardTextColor = contrastOn(secondaryColor);
    ctx.fillStyle = cardTextColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    const cx = x + w / 2;
    const innerPad = 22;
    const innerW = w - innerPad * 2;

    // 2. Etiqueta "PACOTE" + DESTINO no topo
    ctx.font = `800 18px Inter, Arial, sans-serif`;
    ctx.fillText("PACOTE", cx, y + 30);
    
    let destSize = 32; // Aumentado o tamanho inicial para ser mais "premium"
    const destUpper = (destination || "DESTINO").toUpperCase();
    ctx.font = `900 ${destSize}px Inter, Arial, sans-serif`;
    
    const words = destUpper.split(/\s+/);
    if (ctx.measureText(destUpper).width > innerW && words.length > 1) {
      // Tenta em 2 linhas se for longo
      const mid = Math.ceil(words.length / 2);
      const line1 = words.slice(0, mid).join(" ");
      const line2 = words.slice(mid).join(" ");
      destSize = 24;
      ctx.font = `900 ${destSize}px Inter, Arial, sans-serif`;
      ctx.fillText(line1, cx, y + 56);
      ctx.fillText(line2, cx, y + 56 + destSize * 1.1);
    } else {
      // Linha única com shrink moderado
      while (ctx.measureText(destUpper).width > innerW && destSize > 20) {
        destSize -= 1;
        ctx.font = `900 ${destSize}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(destUpper, cx, y + 60);
    }

    // 3. Linha de info: "X dias ✈ 🚌 🏨 ☕"
    const firstHL = highlights[0];
    const firstHLText = typeof firstHL === "string" ? firstHL : (firstHL?.text || "");
    const daysFromHl = firstHLText.match(/(\d+)\s*dias?/i)?.[0];
    const days = (travelPeriod && travelPeriod.trim()) || daysFromHl || "Consulte";
    ctx.font = `700 17px Inter, Arial, sans-serif`;
    ctx.fillText(`${days}   ✈   🚌   🏨   ☕`, cx, y + 92);

    // 4. "a partir de" pequeno + selo "12X sem juros" colado ao R$ gigante
    ctx.font = `600 13px Inter, Arial, sans-serif`;
    ctx.fillText("a partir de", cx, y + 118);

    // Calcula tamanhos do selo de parcelas e do preço lado a lado
    // Padroniza installments: ex "10x" -> "10x de"
    let installmentsText = (installments || "12X").toUpperCase().replace(/\s+/g, "").replace(/\$/g, "");
    if (/^\d+X$/.test(installmentsText)) installmentsText = `${installmentsText.slice(0, -1)}x de`;
    
    const priceText = mainPrice || `${curSym} ${price}`;
    // Tamanho robusto para impacto visual
    const textLen = priceText.replace(/\s/g, "").length;
    const priceFontSize = textLen <= 8 ? 64 : textLen <= 11 ? 54 : textLen <= 14 ? 48 : 42;
    ctx.font = `900 ${priceFontSize}px Inter, Arial, sans-serif`;
    const priceW = ctx.measureText(priceText).width;

    // Selo arredondado de parcelas (cor primária com texto secundário)
    ctx.font = `900 19px Inter, Arial, sans-serif`;
    const badgeW = Math.max(90, ctx.measureText(installmentsText).width + 24);
    const badgeH = 56;
    const gap = 12;
    const groupW = badgeW + gap + priceW;
    const groupX = cx - groupW / 2;
    const priceY = y + 168;

    fillRoundRect(ctx, groupX, priceY - badgeH / 2 - 4, badgeW, badgeH, 12, primaryColor);
    ctx.fillStyle = contrastOn(primaryColor);
    ctx.font = `900 19px Inter, Arial, sans-serif`; // Fonte levemente menor para caber "de"
    ctx.textAlign = "center";
    ctx.fillText(installmentsText, groupX + badgeW / 2, priceY - 8);
    ctx.font = `700 10px Inter, Arial, sans-serif`;
    ctx.fillText("sem juros", groupX + badgeW / 2, priceY + 14);

    // Preço gigante
    ctx.fillStyle = cardTextColor;
    ctx.textAlign = "left";
    ctx.font = `900 ${priceFontSize}px Inter, Arial, sans-serif`;
    ctx.fillText(priceText, groupX + badgeW + gap, priceY + priceFontSize / 3);

    // 5. Total por pessoa
    ctx.fillStyle = cardTextColor;
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
    const pixText = (pixBannerText || "").trim() || "5% OFF À VISTA NO PIX  💠";
    ctx.font = `900 18px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pixText, cx, stripeY + stripeH / 2 + 2);
    ctx.textBaseline = "alphabetic";

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

  const renderSafeSquareOffer = async () => {
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
      const daysText = (travelPeriod && travelPeriod.trim()) || (daysItem?.text || "").trim();
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

      // Safety: Se o box for grande demais (muitos benefícios/texto), escala o topo
      const safeBoxY = Math.min(boxY, panelBottom - boxH - 20);

      // sombra suave
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 8;
      fillRoundRect(ctx, boxX, safeBoxY, boxW, boxH, boxR, yellow);
      ctx.restore();

      const cx = boxX + boxW / 2;
      let cursorY = safeBoxY + padTop + 32; // baseline aproximada do título

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
      let benefitsFontSize = 30;
      ctx.font = `700 ${benefitsFontSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(daysText).width > boxW * 0.4 && benefitsFontSize > 20) {
        benefitsFontSize -= 2;
        ctx.font = `700 ${benefitsFontSize}px Inter, Arial, sans-serif`;
      }
      const daysW = ctx.measureText(daysText).width;
      const sepGap = 18;
      const iconSize = Math.round(benefitsFontSize * 1.33);
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

      await drawFinalBranding(
        ctx, width, height, logoDataUrl, 
        options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined), 
        options.footerContact2Icon ? { icon: options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
        cityFmt ? `${cityFmt} Viagens` : undefined,
        effectiveTextColor
      );
      applyFilmGrain(0.04);
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
      const v0OnPanel = getSafeColor(v0PanelBg, primaryColor);
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
      const titleY = Math.max(badgeY + badgeH + topPaddingBeforeTitle + titleSize, logoH + 40 + titleSize);
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
      await drawFinalBranding(
        ctx, width, height, logoDataUrl, 
        options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined), 
        options.footerContact2Icon ? { icon: options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
        cityFmt ? `${cityFmt} Viagens` : undefined,
        effectiveTextColor
      );
      applyFilmGrain(0.04);
    return canvas.toDataURL("image/png");
    }

    // ── V1 · REF "Black Friday" — painel escuro ESQUERDA + coluna fotos DIREITA ──
    // Painel primário na esquerda com texto/preço; coluna direita com foto empilhada
    if (variant === 1) {
      // ── V1 STORIES 9:16 — REFATORADO: painel esquerdo SÓLIDO + foto sangrada à direita ─
      const panelW = Math.round(width * 0.44);
      const photoX = panelW;
      const photoW = width - panelW;
      const v1PanelBg = primaryColor;
      const v1OnPanel = getSafeColor(v1PanelBg);
      const v1Accent  = getSafeColor(v1PanelBg, secondaryColor);

      // 1) PAINEL ESQUERDO sólido
      ctx.fillStyle = v1PanelBg;
      ctx.fillRect(0, 0, panelW, height);

      // 2) FOTO sangrada à direita (sem moldura)
      const c1 = fitCover(image.naturalWidth, image.naturalHeight, photoW, height, 0.40);
      ctx.drawImage(image, c1.sx, c1.sy, c1.sw, c1.sh, photoX, 0, photoW, height);

      // 3) Layout do painel
      const px = 56;
      const pw = panelW - px * 2;
      const logoReserve = hasLogo ? 230 : 80;

      // 4) BADGE pílula
      const badgeText = (promoName || "OFERTA ESPECIAL").toUpperCase();
      const badgeBg   = v1Accent;
      const badgeFg   = contrastOn(badgeBg);
      const badgeH    = 56;
      const badgeY    = logoReserve;
      ctx.font = "800 22px Inter, Arial, sans-serif";
      const badgeTextW = ctx.measureText(badgeText).width;
      const badgeW = Math.min(pw, badgeTextW + 40);
      fillRoundRect(ctx, px, badgeY, badgeW, badgeH, badgeH / 2, badgeBg);
      ctx.fillStyle = badgeFg;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(badgeText, px + 20, badgeY + badgeH / 2);
      ctx.textBaseline = "alphabetic";

      // 5) DESTINO
      const destY = badgeY + badgeH + 36;
      ctx.fillStyle = v1OnPanel;
      let destSize = 86;
      ctx.font = `900 ${destSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(destUp).width > pw && destSize > 44) {
        destSize -= 4;
        ctx.font = `900 ${destSize}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(destUp, px, destY + destSize * 0.85);

      // 6) Headline
      const subY = destY + destSize + 20;
      ctx.fillStyle = v1Accent;
      const subSize = 26;
      ctx.font = `700 ${subSize}px Inter, Arial, sans-serif`;
      const subWords = (titleText || "").split(/\s+/);
      const subLines: string[] = [];
      let curLine = "";
      for (const w of subWords) {
        const tryLine = curLine ? `${curLine} ${w}` : w;
        if (ctx.measureText(tryLine).width > pw && curLine) {
          subLines.push(curLine);
          curLine = w;
        } else {
          curLine = tryLine;
        }
        if (subLines.length >= 2) break;
      }
      if (curLine && subLines.length < 2) subLines.push(curLine);
      subLines.forEach((ln, i) => ctx.fillText(ln, px, subY + i * (subSize + 6)));
      const subBlockH = subLines.length * (subSize + 6);

      // 7) PRICE CARD ancorado no rodapé
      const priceBlockH = 200;
      const priceBlockY = panelBottom - priceBlockH;

      // 8) BENEFITS — pílulas adaptativas no espaço restante
      const benefitsListV1 = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 6);
      const hlStart = subY + subBlockH + 32;
      const hlAvailH = priceBlockY - 28 - hlStart;
      const count = Math.max(1, benefitsListV1.length);
      const pillGap = 14;
      const pillH = Math.max(44, Math.min(72, Math.floor((hlAvailH - pillGap * (count - 1)) / count)));
      const pillFont = pillH >= 60 ? 26 : pillH >= 50 ? 22 : 20;
      const iconFont = pillH >= 60 ? 30 : 26;
      const pillBg = v1OnPanel === "#ffffff" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.14)";

      benefitsListV1.forEach((h, i) => {
        const py = hlStart + i * (pillH + pillGap);
        fillRoundRect(ctx, px, py, pw, pillH, 14, pillBg);
        ctx.fillStyle = v1Accent;
        ctx.font = `400 ${iconFont}px Inter, Arial, sans-serif`;
        ctx.textBaseline = "middle";
        ctx.fillText(ICON_SYMBOL[h.icon || "check"] || "✓", px + 22, py + pillH / 2);
        ctx.fillStyle = v1OnPanel;
        let tf = pillFont;
        ctx.font = `700 ${tf}px Inter, Arial, sans-serif`;
        const maxTw = pw - 78;
        while (ctx.measureText(h.text).width > maxTw && tf > 14) {
          tf -= 2;
          ctx.font = `700 ${tf}px Inter, Arial, sans-serif`;
        }
        ctx.fillText(h.text, px + 64, py + pillH / 2);
        ctx.textBaseline = "alphabetic";
      });

      // 9) PRICE CARD overlay
      const priceCardOverlay = v1OnPanel === "#ffffff" ? "rgba(0,0,0,0.32)" : "rgba(255,255,255,0.28)";
      fillRoundRect(ctx, px, priceBlockY, pw, priceBlockH, 18, priceCardOverlay);
      ctx.textAlign = "center";
      ctx.fillStyle = v1Accent;
      ctx.font = "800 22px Inter, Arial, sans-serif";
      ctx.fillText((topLabel || "À VISTA").toString().toUpperCase(), px + pw / 2, priceBlockY + 42);
      ctx.fillStyle = v1OnPanel;
      const priceStrV1 = mainPrice || `${curSym} ${price}`;
      let pfsV1 = 76;
      ctx.font = `900 ${pfsV1}px Inter, Arial, sans-serif`;
      while (ctx.measureText(priceStrV1).width > pw - 32 && pfsV1 > 30) {
        pfsV1 -= 4;
        ctx.font = `900 ${pfsV1}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(priceStrV1, px + pw / 2, priceBlockY + 42 + pfsV1 + 8);
      ctx.fillStyle = v1Accent;
      ctx.font = "600 22px Inter, Arial, sans-serif";
      ctx.fillText(bottomSuffix || "por pessoa", px + pw / 2, priceBlockY + priceBlockH - 28);
      ctx.textAlign = "left";

      await drawFinalBranding(
        ctx, width, height, logoDataUrl, 
        options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined), 
        options.footerContact2Icon ? { icon: options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
        cityFmt ? `${cityFmt} Viagens` : undefined,
        effectiveTextColor
      );
      applyFilmGrain(0.04);
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
      const v2OnCard = getSafeColor(v2CardBg);
      const v2CardLabel = getSafeColor(v2CardBg, secondaryColor);
      // Benefits ficam sobre fundo creme #f7f4ef → secundária com fallback contra creme.
      const v2BenefitColor = getSafeColor("#f7f4ef", secondaryColor);
      // Texto da faixa headline (sobre primária) = secundária com contraste garantido.
      const v2HeadlineColor = v2CardLabel;

      // Lista completa de benefits (até 6) — TODOS devem aparecer
      const benefitsListV2 = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 6);
      const benefitsCountV2 = Math.max(1, benefitsListV2.length);

      // 1) Card de preço — ancorado à base e centralizado para não pesar só à esquerda
      const priceCardW = Math.round(width * 0.66);
      const priceCardH = 168;
      const priceCardX = Math.round((width - priceCardW) / 2);
      const priceCardY = panelBottom - priceCardH;
      fillRoundRect(ctx, priceCardX, priceCardY, priceCardW, priceCardH, 16, v2CardBg);
      ctx.fillStyle = v2CardLabel; ctx.font = "700 24px Inter, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((topLabel || "por apenas").toString(), priceCardX + priceCardW / 2, priceCardY + 40);
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

      // 3) Cálculo de altura dos benefits — TODOS devem caber.
      const benefitRowsV2 = Math.ceil(benefitsCountV2 / 2);
      const benefitFontSize = benefitRowsV2 <= 2 ? 30 : 25;
      const benefitGap = benefitRowsV2 <= 2 ? 58 : 46;
      const benefitsBlockH = benefitRowsV2 * benefitGap;
      const benefitsTopPad = 32;
      const benefitsBottomPad = 28;
      const benefitsAreaH = benefitsTopPad + benefitsBlockH + benefitsBottomPad;

      // 2) Faixa headline
      const faixaH = 110;
      const faixaY = priceCardY - benefitsAreaH - faixaH;

      // 4) Foto superior — calcula altura dinâmica para preencher tudo que sobra acima
      const photoTop = safeTop - 20; // Sobe um pouco mais a foto no V2
      const photoBottom = faixaY - 16;
      const fW2 = width - 32;
      const minPhotoH = Math.round(height * 0.28);
      const fH2 = Math.max(minPhotoH, photoBottom - photoTop);
      const c2 = fitCover(image.naturalWidth, image.naturalHeight, fW2, fH2, 0.36);
      ctx.save();
      fillRoundRect(ctx, 16, photoTop, fW2, fH2, 22, "#ccc");
      ctx.clip();
      ctx.drawImage(image, c2.sx, c2.sy, c2.sw, c2.sh, 16, photoTop, fW2, fH2);
      ctx.restore();

      // 5) Faixa horizontal com headline
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

      // 6) Benefits — duas colunas
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

      await drawFinalBranding(
        ctx, width, height, logoDataUrl, 
        options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined), 
        options.footerContact2Icon ? { icon: options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
        cityFmt ? `${cityFmt} Viagens` : undefined,
        effectiveTextColor
      );
      applyFilmGrain(ctx, width, height, 0.04);
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
      const daysTextV4 = (travelPeriod?.trim() || daysItemV4?.text || "").trim();
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
      const idealCardY = format === "story" ? Math.round(height * 0.24) : Math.round(height * 0.16);
      const cardY = Math.min(idealCardY, panelBottom - cardH - 20);
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
        const pixYbadge = Math.min(cardY + cardH - pixHbadge / 2, panelBottom - pixHbadge - 10);

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

  // ============================================================
  // V0_Experiencia · LUXO & DESEJO (canvas)
  // ============================================================
  const renderV0Experiencia = async (): Promise<string> => {
    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.5);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(0,0,0,0.60)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.30)");
    grad.addColorStop(1, "rgba(0,0,0,0.80)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const isStory = format === "story";
    const sans = `Inter, Arial, sans-serif`;
    const serif = `'Playfair Display', Georgia, serif`;

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";

    const promo = (promoName || "EXPERIÊNCIA EXCLUSIVA").toUpperCase();
    ctx.font = `800 ${isStory ? 44 : 36}px ${serif}`;
    ctx.fillText(promo.split("").join("\u2009"), cx, isStory ? 300 : 150);

    if (titleText) {
      ctx.font = `300 ${isStory ? 28 : 22}px ${sans}`;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillText(titleText.trim(), cx, isStory ? 370 : 200);
    }

    const brandingSafeY = panelBottom;
    const line2Y = brandingSafeY - (isStory ? 180 : 120);
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${isStory ? 110 : 78}px ${sans}`;
    ctx.fillText((destFmt || destination || "DESTINO").toUpperCase(), cx, line2Y);

    await drawFinalBranding(ctx, width, height, logoDataUrl, undefined, undefined, cityFmt ? `${cityFmt} Viagens` : undefined, effectiveTextColor);
    applyFilmGrain(ctx, width, height, 0.04);
    return canvas.toDataURL("image/png");
  };

  // ============================================================
  // V1_Experiencia · LUXO CINEMATOGRÁFICO (canvas)
  // ============================================================
  const renderV1Experiencia = async (): Promise<string> => {
    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.5);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(0,0,0,0.4)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.1)");
    grad.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const isStory = format === "story";
    const serif = `'Playfair Display', Georgia, serif`;
    const sans = `Inter, Arial, sans-serif`;

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";

    const promo = (promoName || "Experiência Única").toUpperCase();
    ctx.font = `800 ${isStory ? 32 : 24}px ${sans}`;
    ctx.fillStyle = secondaryColor;
    ctx.fillText(promo.split("").join(" "), cx, isStory ? 320 : 150);

    ctx.fillStyle = "#ffffff";
    const titSize = isStory ? 120 : 90;
    ctx.font = `900 ${titSize}px ${serif}`;
    const titLines = (titleText || destination).toUpperCase().split(/\s+/);
    let line1 = titLines.slice(0, Math.ceil(titLines.length / 2)).join(" ");
    let line2 = titLines.slice(Math.ceil(titLines.length / 2)).join(" ");
    
    const midY = height / 2;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 15;
    ctx.fillText(line1, cx, midY - (line2 ? titSize * 0.4 : 0));
    if (line2) ctx.fillText(line2, cx, midY + titSize * 0.7);
    ctx.shadowBlur = 0;

    await drawFinalBranding(ctx, width, height, logoDataUrl, undefined, undefined, cityFmt ? `${cityFmt} Viagens` : undefined, effectiveTextColor);
    applyFilmGrain(ctx, width, height, 0.04);
    return canvas.toDataURL("image/png");
  };

  // ============================================================
  // V2_Experiencia · LUXO MATERIAL (canvas)
  // ============================================================
  const renderV2Experiencia = async (): Promise<string> => {
    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.5);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(0,0,0,0.6)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.2)");
    grad.addColorStop(1, "rgba(0,0,0,0.7)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const isStory = format === "story";
    const serif = `'Playfair Display', Georgia, serif`;
    const sans = `Inter, Arial, sans-serif`;

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    const promo = (promoName || "Exclusive").toUpperCase();
    ctx.font = `800 ${isStory ? 24 : 18}px ${sans}`;
    ctx.fillStyle = secondaryColor;
    ctx.fillText(promo, cx, isStory ? 350 : 180);

    ctx.fillStyle = "#ffffff";
    const titSize = isStory ? 110 : 80;
    ctx.font = `900 ${titSize}px ${serif}`;
    const lines = (titleText || destination).toUpperCase().split(/\s+/);
    let curY = height / 2 - (lines.length * titSize * 0.5);
    lines.forEach((l, i) => {
      ctx.fillText(l, cx, curY + i * titSize * 0.95);
    });

    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 100, curY + lines.length * titSize * 0.95 + 40);
    ctx.lineTo(cx + 100, curY + lines.length * titSize * 0.95 + 40);
    ctx.stroke();

    await drawFinalBranding(ctx, width, height, logoDataUrl, undefined, undefined, cityFmt ? `${cityFmt} Viagens` : undefined, effectiveTextColor);
    applyFilmGrain(ctx, width, height, 0.04);
    return canvas.toDataURL("image/png");
  };

  // ============================================================
  // V3_Experiencia · DARK PREMIUM (canvas)
  // ============================================================
  const renderV3Experiencia = async (): Promise<string> => {
    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.5);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(0,0,0,0.7)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.3)");
    grad.addColorStop(1, "rgba(0,0,0,0.85)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const isStory = format === "story";
    const serif = `'Playfair Display', Georgia, serif`;
    const sans = `Inter, Arial, sans-serif`;

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";

    const titSize = isStory ? 140 : 100;
    ctx.font = `900 ${titSize}px ${sans}`;
    ctx.fillText((titleText || destination).toUpperCase(), cx, height / 2);

    ctx.font = `italic 600 ${isStory ? 32 : 24}px ${serif}`;
    ctx.fillStyle = secondaryColor;
    ctx.fillText(travelPeriod || "Uma jornada inesquecível", cx, height / 2 + (isStory ? 80 : 60));

    await drawFinalBranding(ctx, width, height, logoDataUrl, undefined, undefined, cityFmt ? `${cityFmt} Viagens` : undefined, effectiveTextColor);
    applyFilmGrain(ctx, width, height, 0.05);
    return canvas.toDataURL("image/png");
  };

  // ============================================================
  // V4_Experiencia · CLEAN EDITORIAL (canvas)
  // ============================================================
  const renderV4Experiencia = async (): Promise<string> => {
    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.42);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, width * 0.7, 0);
    grad.addColorStop(0, "rgba(0,0,0,0.75)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.2)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const isStory = format === "story";
    const serif = `'Playfair Display', Georgia, serif`;
    const sans = `Inter, Arial, sans-serif`;

    const padLeft = isStory ? 100 : 70;
    const topY = isStory ? 380 : 180;
    
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    if (promoName) {
      ctx.fillStyle = secondaryColor;
      ctx.font = `800 ${isStory ? 28 : 22}px ${sans}`;
      ctx.fillText(promoName.toUpperCase(), padLeft, topY);
    }

    ctx.fillStyle = "#ffffff";
    let titSize = isStory ? 110 : 80;
    ctx.font = `900 ${titSize}px ${serif}`;
    const words = (titleText || destination || "Experiência").toUpperCase().split(/\s+/);
    let lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > width - padLeft - 60) { lines.push(cur); cur = w; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    lines = lines.slice(0, 3);

    let currentY = topY + titSize + 20;
    lines.forEach((ln, i) => {
      ctx.fillText(ln, padLeft, currentY + i * titSize * 0.95);
    });

    await drawFinalBranding(ctx, width, height, logoDataUrl, undefined, undefined, cityFmt ? `${cityFmt} Viagens` : undefined, effectiveTextColor);
    applyFilmGrain(ctx, width, height, 0.04);
    return canvas.toDataURL("image/png");
  };


  // ── ROTEAMENTO FINAL ──────────────────────────────────────────────────────
  if (isExperience) {
    const v = typeof forceVariant === "number" ? forceVariant : variation;
    const variant = ((v % 5) + 5) % 5; 

    if (variant === 0) return await renderV0Experiencia();
    if (variant === 1) return await renderV1Experiencia();
    if (variant === 2) return await renderV2Experiencia();
    if (variant === 3) return await renderV3Experiencia();
    if (variant === 4) return await renderV4Experiencia();
    
    return await renderV0Experiencia();
  }


  // Fallback para Ofertas (Matriz, Gancho, etc.)
  return await renderSafeSquareOffer();
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
