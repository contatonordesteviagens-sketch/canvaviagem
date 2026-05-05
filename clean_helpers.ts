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

// Lumin├óncia relativa (0..1) de uma cor hex.
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
 * Garante contraste m├¡nimo entre `fg` (cor preferida do usuario) e `bg`.
 * Se a diferenca de lumin├óncia for baixa, devolve preto/branco em vez de `fg`.
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

/**
 * Aplica um efeito de vinheta (bordas escurecidas) para dar profundidade
 * e focar a atenc├úo no centro da imagem/conteudo.
 */
function applyVignette(ctx: CanvasRenderingContext2D, width: number, height: number, intensity = 0.5) {
  const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.sqrt((width / 2) ** 2 + (height / 2) ** 2));
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.6, `rgba(0,0,0,${intensity * 0.1})`);
  grad.addColorStop(1, `rgba(0,0,0,${intensity * 0.4})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * 🛡️ safeFillText — desenha texto garantindo que caiba em maxWidth.
 * Reduz o tamanho da fonte automaticamente até caber, nunca trunca com "...".
 * @param ctx  Canvas context (deve ter ctx.font já configurado com tamanho-base)
 * @param text Texto a renderizar
 * @param x, y  Posição
 * @param maxWidth  Largura máxima em pixels
 * @param minSize  Tamanho mínimo de fonte (default 12px) — abaixo disso para de reduzir
 */
function safeFillText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  minSize = 12
): void {
  if (!text) return;
  // Parse current font to get size and family
  const fontStr = ctx.font;
  const sizeMatch = fontStr.match(/(\d+(?:\.\d+)?)px/);
  if (!sizeMatch) { ctx.fillText(text, x, y, maxWidth); return; }
  let size = parseFloat(sizeMatch[1]);
  const fontWithoutSize = fontStr.replace(/(\d+(?:\.\d+)?)px/, "SIZE_PX");
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size = Math.max(minSize, size - 1);
    ctx.font = fontWithoutSize.replace("SIZE_PX", `${size}px`);
  }
  ctx.fillText(text, x, y);
}

/**
 * 🛡️ wrapTextSafe — quebra texto em linhas que cabem em maxWidth.
 * Também reduz a fonte se uma única palavra não couber.
 * Retorna array de linhas prontas para renderizar.
 */
function wrapTextSafe(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  minSize = 12
): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      // Single word wider than maxWidth — shrink font
      const fontStr = ctx.font;
      const sizeMatch = fontStr.match(/(\d+(?:\.\d+)?)px/);
      if (sizeMatch) {
        let size = parseFloat(sizeMatch[1]);
        const fontWithoutSize = fontStr.replace(/(\d+(?:\.\d+)?)px/, "SIZE_PX");
        while (ctx.measureText(w).width > maxWidth && size > minSize) {
          size = Math.max(minSize, size - 1);
          ctx.font = fontWithoutSize.replace("SIZE_PX", `${size}px`);
        }
      }
      cur = w;
    }
    if (lines.length >= maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines.slice(0, maxLines);
}

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
  /** Forca uma variante espec├¡fica (0..2 para Sua Imagem + Oferta + 1:1). Quando definido, ignora variation%N. */
  forceVariant?: number;
  /** Quando definido, sobrescreve o pool aleatorio de headlines e usa este texto como t├¡tulo principal em todas as variantes. */
  titleOverride?: string;
  /** Pool de variac├Áes de t├¡tulo (uma por variante). Se fornecido, tem prioridade sobre titleOverride: usa-se titleVariations[variantIndex % len]. */
  titleVariations?: string[];
  /** S├¡mbolo de moeda exibido antes do preco (R$, US$, Ôé¼, ┬ú, AR$). Default "R$". */
  currencySymbol?: string;
  /** V4: per├¡odo exibido na linha de informac├Áes (ex.: "5 dias", "Janeiro", "12 a 18/01"). */
  travelPeriod?: string;
  /** V3: texto livre do "Total" (ex.: "R$ 1.999 por casal"). Se vazio, calcula automatico. */
  totalOverride?: string;
  /** V3: controla se a linha de total aparece no box. Default true. */
  showTotal?: boolean;
  /** V3: texto da faixa azul do Pix. Default "{N}% OFF A VISTA NO pix". */
  pixBannerText?: string;
  /** V3: mostra/esconde a faixa azul do Pix. Default true. */
  showPixBanner?: boolean;
  /** Fam├¡lia de fonte global a aplicar em TODOS os textos do anuncio. Default: Inter. */
  fontFamily?: string;
  /** Multiplicador de escala global para t├¡tulos/precos/textos grandes (>=22px). Default 1. */
  titleScale?: number;
  /** Multiplicador de escala global para descric├úo/labels/textos pequenos (<22px). Default 1. */
  descScale?: number;
  /** Cor que substitui o texto branco padr├úo (#fff/#ffffff). ├Ütil para alinhar texto ├á identidade da marca. */
  textColorOverride?: string;
  /** Opc├Áes de Branding (Logo e Contatos) unificadas no motor principal */
  logoDataUrl?: string;
  whatsapp?: string;
  instagram?: string;
  footerContact1Icon?: string;
  footerContact1Value?: string;
  footerContact2Icon?: string;
  footerContact2Value?: string;
  isExperience?: boolean;
}

/** Formata telefone no padr├úo (XX) 9 XXXX-XXXX */
export function formatAdPhone(val: string): string {
  const d = (val || "").replace(/\D/g, "");
  if (d.length > 11) return val;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return d;
}

/** Desenha ├¡cone do WhatsApp colorido */
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
    
    // Bal├úo Branco
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(0, -size * 0.02, size * 0.4, 0.7, 5.5);
    ctx.lineTo(-size * 0.35, size * 0.45);
    ctx.closePath();
    ctx.fill();

    // Fone Verde
    ctx.fillStyle = "#25D366";
    ctx.lineWidth = size * 0.10; // Aumentado para 0.10 (mais vis├¡vel)
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.22, 0.8, 2.3);
    ctx.stroke();
    // Pontas do fone
    ctx.save(); ctx.rotate(0.8); ctx.fillRect(size * 0.16, -size * 0.08, size * 0.12, size * 0.16); ctx.restore();
    ctx.save(); ctx.rotate(2.3); ctx.fillRect(size * 0.16, -size * 0.08, size * 0.12, size * 0.16); ctx.restore();
  } else {
    // MODO MONOCROM├üTICO (Recorte real usando buffer)
    const buffer = document.createElement("canvas");
    buffer.width = size;
    buffer.height = size;
    const bctx = buffer.getContext("2d");
    if (bctx) {
      bctx.translate(size/2, size/2);
      bctx.fillStyle = customColor;
      // Bal├úo
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

/** Desenha ├¡cone do Instagram com gradiente oficial */
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
    // C├ómera
    ctx.lineWidth = size * 0.08; 
    ctx.strokeRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
    ctx.beginPath(); ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(size * 0.18, -size * 0.18, size * 0.04, 0, Math.PI * 2); ctx.fill();
  } else {
    // MODO MONOCROM├üTICO
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

/** Desenha ├¡cone de Site / Globo */
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
 * DESENHA O BRANDING FINAL (Rodape, Logo, WhatsApp, Instagram)
 * Unificado para evitar cache e garantir consistencia.
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
  // So adiciona contatos que tenham valor preenchido (evita ├¡cones vazios)
  if (contact1 && contact1.icon !== "none" && contact1.value && contact1.value.trim()) contactsToDraw.push(contact1);
  if (contact2 && contact2.icon !== "none" && contact2.value && contact2.value.trim()) contactsToDraw.push(contact2);

  if (!logoUrl && contactsToDraw.length === 0) return;

  const isStory = ch > cw;
  const footerHeight = isStory ? 120 : 100;
  // Move o rodape para cima da barra de mensagens do Instagram (aprox 280px do fundo)
  const safeBottomMargin = isStory ? 340 : 20; // Subido de 280 para 340 para limpar a reply bar do Instagram
  const footerY = ch - footerHeight - safeBottomMargin;

  // 1. Fundo do Rodapé (VÉU GRADIENTE ESCURO)
  // O usuário prefere SEMPRE o véu escuro com letras brancas para garantir o look "Premium".
  const veilStartY = footerY - 80; // Aumentado de 50 para 80 para garantir que o texto não fique no "limbo"
  const grad = ctx.createLinearGradient(0, veilStartY, 0, ch);
  grad.addColorStop(0, "rgba(0,0,0,0.0)");
  grad.addColorStop(0.2, "rgba(0,0,0,0.7)"); // Escurece mais rápido
  grad.addColorStop(1, "rgba(0,0,0,0.96)"); // Quase preto na base
  
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
  } else if (agencyName && agencyName.trim() && agencyName.trim().toUpperCase() !== "SUA AGÊNCIA") {
    // WORDMARK FALLBACK — 🛡️ BLINDAGEM: so exibe se usuario configurou nome real
    const name = agencyName.trim().toUpperCase();
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
  // Revertido para Bold (700) e tamanhos mais impactantes conforme desejo do usuario
  const fontSize = isStory ? 36 : 30; 
  const safeFont = fontFamily || "Inter";
  ctx.font = `700 ${fontSize}px ${safeFont}, sans-serif`;
  
  // Rodape sempre BRANCO com sombra escura (look classico Canva Viagem)
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 6;

  let textRightX = cw - (isStory ? 80 : 60); // Sincronizado com a margem do logo
  const itemGap = 20; // Aumentado o gap entre ├¡cone e texto
  const logoEdge = logoUrl ? (padX + lw + bgPad * 2 + 30) : padX;
  const maxAvailableWidth = textRightX - logoEdge;

  let yPos = contactsToDraw.length === 2 ? centerY + (footerHeight * 0.18) : centerY;

  for (const c of contactsToDraw) {
    let displayValue = c.value;
    if (c.icon.startsWith("whatsapp")) displayValue = formatAdPhone(c.value);
    if (c.icon.startsWith("instagram")) displayValue = c.value.startsWith("@") ? c.value : `@${c.value}`;

    // Auto-shrink para evitar colis├úo
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
  bus: "bus",
  hotel: "hotel",
  plane: "plane",
  check: "check",
  star: "star",
  heart: "heart",
  sun: "sun",
  camera: "camera",
  map: "map",
  food: "food",
  ship: "ship",
  palm: "palm",
  coffee: "coffee",
  guide: "guide",
  wifi: "wifi",
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
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const s = size;
  const x = cx - s / 2;
  const y = cy - s / 2;

  ctx.beginPath();
  switch (kind) {
    case "plane":
      ctx.translate(cx, cy); ctx.rotate(-Math.PI / 4);
      ctx.moveTo(0, -s * 0.4); ctx.lineTo(s * 0.05, -s * 0.3); ctx.lineTo(s * 0.05, 0);
      ctx.lineTo(s * 0.4, s * 0.2); ctx.lineTo(s * 0.4, s * 0.3); ctx.lineTo(s * 0.05, s * 0.2);
      ctx.lineTo(s * 0.05, s * 0.4); ctx.lineTo(s * 0.15, s * 0.5); ctx.lineTo(0, s * 0.45);
      ctx.lineTo(-s * 0.15, s * 0.5); ctx.lineTo(-s * 0.05, s * 0.4); ctx.lineTo(-s * 0.05, s * 0.2);
      ctx.lineTo(-s * 0.4, s * 0.3); ctx.lineTo(-s * 0.4, s * 0.2); ctx.lineTo(-s * 0.05, 0);
      ctx.lineTo(-s * 0.05, -s * 0.3); ctx.closePath(); ctx.fill();
      break;
    case "bus":
      roundRect(ctx, x + s * 0.1, y + s * 0.25, s * 0.8, s * 0.5, s * 0.1); ctx.fill();
      ctx.beginPath(); ctx.arc(x + s * 0.3, y + s * 0.75, s * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + s * 0.7, y + s * 0.75, s * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = "destination-out";
      ctx.fillRect(x + s * 0.15, y + s * 0.3, s * 0.7, s * 0.2); ctx.restore();
      break;
    case "hotel":
      ctx.fillRect(x + s * 0.1, y + s * 0.75, s * 0.8, s * 0.2);
      ctx.fillRect(x + s * 0.2, y + s * 0.4, s * 0.6, s * 0.35);
      ctx.fillRect(x + s * 0.45, y + s * 0.15, s * 0.1, s * 0.25);
      break;
    case "check":
      ctx.moveTo(x + s * 0.2, y + s * 0.5); ctx.lineTo(x + s * 0.45, y + s * 0.75);
      ctx.lineTo(x + s * 0.85, y + s * 0.25); ctx.stroke();
      break;
    case "star":
      for (let i = 0; i < 5; i++) {
        const a1 = (i * 72 - 90) * Math.PI / 180;
        ctx.lineTo(cx + Math.cos(a1) * s * 0.45, cy + Math.sin(a1) * s * 0.45);
        const a2 = (i * 72 - 54) * Math.PI / 180;
        ctx.lineTo(cx + Math.cos(a2) * s * 0.2, cy + Math.sin(a2) * s * 0.2);
      }
      ctx.closePath(); ctx.fill();
      break;
    case "food":
      ctx.moveTo(x + s * 0.3, y + s * 0.1); ctx.lineTo(x + s * 0.3, y + s * 0.5);
      ctx.moveTo(x + s * 0.2, y + s * 0.1); ctx.lineTo(x + s * 0.2, y + s * 0.4);
      ctx.moveTo(x + s * 0.4, y + s * 0.1); ctx.lineTo(x + s * 0.4, y + s * 0.4);
      ctx.stroke();
      ctx.fillRect(x + s * 0.6, y + s * 0.1, s * 0.15, s * 0.8);
      break;
    case "wifi":
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(cx, cy + s * 0.3, s * (0.2 + i * 0.2), -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();
      }
      break;
    case "camera":
      roundRect(ctx, x + s * 0.1, y + s * 0.3, s * 0.8, s * 0.5, s * 0.1); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy + s * 0.55, s * 0.15, 0, Math.PI * 2);
      ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.fill(); ctx.restore();
      break;
    default:
      ctx.arc(cx, cy, s * 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}square" | "story";
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

// Lumin├óncia relativa (0..1) de uma cor hex.
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
 * Garante contraste m├¡nimo entre `fg` (cor preferida do usuario) e `bg`.
 * Se a diferenca de lumin├óncia for baixa, devolve preto/branco em vez de `fg`.
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

/**
 * Aplica um efeito de vinheta (bordas escurecidas) para dar profundidade
 * e focar a atenc├úo no centro da imagem/conteudo.
 */
function applyVignette(ctx: CanvasRenderingContext2D, width: number, height: number, intensity = 0.5) {
  const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.sqrt((width / 2) ** 2 + (height / 2) ** 2));
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.6, `rgba(0,0,0,${intensity * 0.1})`);
  grad.addColorStop(1, `rgba(0,0,0,${intensity * 0.4})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * 🛡️ safeFillText — desenha texto garantindo que caiba em maxWidth.
 * Reduz o tamanho da fonte automaticamente até caber, nunca trunca com "...".
 * @param ctx  Canvas context (deve ter ctx.font já configurado com tamanho-base)
 * @param text Texto a renderizar
 * @param x, y  Posição
 * @param maxWidth  Largura máxima em pixels
 * @param minSize  Tamanho mínimo de fonte (default 12px) — abaixo disso para de reduzir
 */
function safeFillText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  minSize = 12
): void {
  if (!text) return;
  // Parse current font to get size and family
  const fontStr = ctx.font;
  const sizeMatch = fontStr.match(/(\d+(?:\.\d+)?)px/);
  if (!sizeMatch) { ctx.fillText(text, x, y, maxWidth); return; }
  let size = parseFloat(sizeMatch[1]);
  const fontWithoutSize = fontStr.replace(/(\d+(?:\.\d+)?)px/, "SIZE_PX");
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size = Math.max(minSize, size - 1);
    ctx.font = fontWithoutSize.replace("SIZE_PX", `${size}px`);
  }
  ctx.fillText(text, x, y);
}

/**
 * 🛡️ wrapTextSafe — quebra texto em linhas que cabem em maxWidth.
 * Também reduz a fonte se uma única palavra não couber.
 * Retorna array de linhas prontas para renderizar.
 */
function wrapTextSafe(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  minSize = 12
): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      // Single word wider than maxWidth — shrink font
      const fontStr = ctx.font;
      const sizeMatch = fontStr.match(/(\d+(?:\.\d+)?)px/);
      if (sizeMatch) {
        let size = parseFloat(sizeMatch[1]);
        const fontWithoutSize = fontStr.replace(/(\d+(?:\.\d+)?)px/, "SIZE_PX");
        while (ctx.measureText(w).width > maxWidth && size > minSize) {
          size = Math.max(minSize, size - 1);
          ctx.font = fontWithoutSize.replace("SIZE_PX", `${size}px`);
        }
      }
      cur = w;
    }
    if (lines.length >= maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines.slice(0, maxLines);
}

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
  /** Forca uma variante espec├¡fica (0..2 para Sua Imagem + Oferta + 1:1). Quando definido, ignora variation%N. */
  forceVariant?: number;
  /** Quando definido, sobrescreve o pool aleatorio de headlines e usa este texto como t├¡tulo principal em todas as variantes. */
  titleOverride?: string;
  /** Pool de variac├Áes de t├¡tulo (uma por variante). Se fornecido, tem prioridade sobre titleOverride: usa-se titleVariations[variantIndex % len]. */
  titleVariations?: string[];
  /** S├¡mbolo de moeda exibido antes do preco (R$, US$, Ôé¼, ┬ú, AR$). Default "R$". */
  currencySymbol?: string;
  /** V4: per├¡odo exibido na linha de informac├Áes (ex.: "5 dias", "Janeiro", "12 a 18/01"). */
  travelPeriod?: string;
  /** V3: texto livre do "Total" (ex.: "R$ 1.999 por casal"). Se vazio, calcula automatico. */
  totalOverride?: string;
  /** V3: controla se a linha de total aparece no box. Default true. */
  showTotal?: boolean;
  /** V3: texto da faixa azul do Pix. Default "{N}% OFF A VISTA NO pix". */
  pixBannerText?: string;
  /** V3: mostra/esconde a faixa azul do Pix. Default true. */
  showPixBanner?: boolean;
  /** Fam├¡lia de fonte global a aplicar em TODOS os textos do anuncio. Default: Inter. */
  fontFamily?: string;
  /** Multiplicador de escala global para t├¡tulos/precos/textos grandes (>=22px). Default 1. */
  titleScale?: number;
  /** Multiplicador de escala global para descric├úo/labels/textos pequenos (<22px). Default 1. */
  descScale?: number;
  /** Cor que substitui o texto branco padr├úo (#fff/#ffffff). ├Ütil para alinhar texto ├á identidade da marca. */
  textColorOverride?: string;
  /** Opc├Áes de Branding (Logo e Contatos) unificadas no motor principal */
  logoDataUrl?: string;
  whatsapp?: string;
  instagram?: string;
  footerContact1Icon?: string;
  footerContact1Value?: string;
  footerContact2Icon?: string;
  footerContact2Value?: string;
  isExperience?: boolean;
}

/** Formata telefone no padr├úo (XX) 9 XXXX-XXXX */
export function formatAdPhone(val: string): string {
  const d = (val || "").replace(/\D/g, "");
  if (d.length > 11) return val;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return d;
}

/** Desenha ├¡cone do WhatsApp colorido */
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
    
    // Bal├úo Branco
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(0, -size * 0.02, size * 0.4, 0.7, 5.5);
    ctx.lineTo(-size * 0.35, size * 0.45);
    ctx.closePath();
    ctx.fill();

    // Fone Verde
    ctx.fillStyle = "#25D366";
    ctx.lineWidth = size * 0.10; // Aumentado para 0.10 (mais vis├¡vel)
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.22, 0.8, 2.3);
    ctx.stroke();
    // Pontas do fone
    ctx.save(); ctx.rotate(0.8); ctx.fillRect(size * 0.16, -size * 0.08, size * 0.12, size * 0.16); ctx.restore();
    ctx.save(); ctx.rotate(2.3); ctx.fillRect(size * 0.16, -size * 0.08, size * 0.12, size * 0.16); ctx.restore();
  } else {
    // MODO MONOCROM├üTICO (Recorte real usando buffer)
    const buffer = document.createElement("canvas");
    buffer.width = size;
    buffer.height = size;
    const bctx = buffer.getContext("2d");
    if (bctx) {
      bctx.translate(size/2, size/2);
      bctx.fillStyle = customColor;
      // Bal├úo
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

/** Desenha ├¡cone do Instagram com gradiente oficial */
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
    // C├ómera
    ctx.lineWidth = size * 0.08; 
    ctx.strokeRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
    ctx.beginPath(); ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(size * 0.18, -size * 0.18, size * 0.04, 0, Math.PI * 2); ctx.fill();
  } else {
    // MODO MONOCROM├üTICO
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

/** Desenha ├¡cone de Site / Globo */
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
 * DESENHA O BRANDING FINAL (Rodape, Logo, WhatsApp, Instagram)
 * Unificado para evitar cache e garantir consistencia.
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
  // So adiciona contatos que tenham valor preenchido (evita ├¡cones vazios)
  if (contact1 && contact1.icon !== "none" && contact1.value && contact1.value.trim()) contactsToDraw.push(contact1);
  if (contact2 && contact2.icon !== "none" && contact2.value && contact2.value.trim()) contactsToDraw.push(contact2);

  if (!logoUrl && contactsToDraw.length === 0) return;

  const isStory = ch > cw;
  const footerHeight = isStory ? 120 : 100;
  // Move o rodape para cima da barra de mensagens do Instagram (aprox 280px do fundo)
  const safeBottomMargin = isStory ? 340 : 20; // Subido de 280 para 340 para limpar a reply bar do Instagram
  const footerY = ch - footerHeight - safeBottomMargin;

  // 1. Fundo do Rodapé (VÉU GRADIENTE ESCURO)
  // O usuário prefere SEMPRE o véu escuro com letras brancas para garantir o look "Premium".
  const veilStartY = footerY - 80; // Aumentado de 50 para 80 para garantir que o texto não fique no "limbo"
  const grad = ctx.createLinearGradient(0, veilStartY, 0, ch);
  grad.addColorStop(0, "rgba(0,0,0,0.0)");
  grad.addColorStop(0.2, "rgba(0,0,0,0.7)"); // Escurece mais rápido
  grad.addColorStop(1, "rgba(0,0,0,0.96)"); // Quase preto na base
  
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
  } else if (agencyName && agencyName.trim() && agencyName.trim().toUpperCase() !== "SUA AGÊNCIA") {
    // WORDMARK FALLBACK — 🛡️ BLINDAGEM: so exibe se usuario configurou nome real
    const name = agencyName.trim().toUpperCase();
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
  // Revertido para Bold (700) e tamanhos mais impactantes conforme desejo do usuario
  const fontSize = isStory ? 36 : 30; 
  const safeFont = fontFamily || "Inter";
  ctx.font = `700 ${fontSize}px ${safeFont}, sans-serif`;
  
  // Rodape sempre BRANCO com sombra escura (look classico Canva Viagem)
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 6;

  let textRightX = cw - (isStory ? 80 : 60); // Sincronizado com a margem do logo
  const itemGap = 20; // Aumentado o gap entre ├¡cone e texto
  const logoEdge = logoUrl ? (padX + lw + bgPad * 2 + 30) : padX;
  const maxAvailableWidth = textRightX - logoEdge;

  let yPos = contactsToDraw.length === 2 ? centerY + (footerHeight * 0.18) : centerY;

  for (const c of contactsToDraw) {
    let displayValue = c.value;
    if (c.icon.startsWith("whatsapp")) displayValue = formatAdPhone(c.value);
    if (c.icon.startsWith("instagram")) displayValue = c.value.startsWith("@") ? c.value : `@${c.value}`;

    // Auto-shrink para evitar colis├úo
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
  bus: "bus",
  hotel: "hotel",
  plane: "plane",
  check: "check",
  star: "star",
  heart: "heart",
  sun: "sun",
  camera: "camera",
  map: "map",
  food: "food",
  ship: "ship",
  palm: "palm",
  coffee: "coffee",
  guide: "guide",
  wifi: "wifi",
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
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const s = size;
  const x = cx - s / 2;
  const y = cy - s / 2;

  ctx.beginPath();
  switch (kind) {
      const cw = s * 0.62, ch = s * 0.42; const cxL = cx - cw / 2, cyT = cy - ch / 2 + s * 0.04;
      ctx.beginPath(); ctx.moveTo(cxL, cyT); ctx.lineTo(cxL + cw, cyT); ctx.lineTo(cxL + cw - s * 0.06, cyT + ch);
      ctx.lineTo(cxL + s * 0.06, cyT + ch); ctx.closePath(); ctx.fill();
      ctx.lineWidth = s * 0.07; ctx.beginPath();
      ctx.arc(cxL + cw + s * 0.04, cyT + ch * 0.45, s * 0.13, -Math.PI / 2.2, Math.PI / 2.2); ctx.stroke();
      roundRect(ctx, cx - s * 0.42, cyT + ch + s * 0.02, s * 0.84, s * 0.08, s * 0.04); ctx.fill();
      ctx.lineWidth = s * 0.06; ctx.lineCap = "round";
      for (let i = -1; i <= 1; i++) {
        const vx = cx + i * s * 0.16; ctx.beginPath(); ctx.moveTo(vx, cyT - s * 0.04);
        ctx.quadraticCurveTo(vx + s * 0.08, cyT - s * 0.18, vx, cyT - s * 0.32); ctx.stroke();
      } break;
    }
    case "camera": {
      const bx = x + s * 0.05, by = y + s * 0.3, bw = s * 0.9, bh = s * 0.5;
      roundRect(ctx, bx, by, bw, bh, s * 0.1); ctx.fill();
      roundRect(ctx, x + s * 0.3, y + s * 0.18, s * 0.4, s * 0.16, s * 0.04); ctx.fill();
      ctx.fillRect(x + s * 0.74, y + s * 0.2, s * 0.1, s * 0.1);
      ctx.beginPath(); ctx.arc(cx, by + bh / 2, s * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath(); ctx.arc(cx, by + bh / 2, s * 0.12, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(cx, by + bh / 2, s * 0.06, 0, Math.PI * 2); ctx.fill(); break;
    }
    case "ship": {
      ctx.beginPath(); ctx.moveTo(x + s * 0.05, y + s * 0.62); ctx.lineTo(x + s * 0.95, y + s * 0.62);
      ctx.lineTo(x + s * 0.82, y + s * 0.86); ctx.lineTo(x + s * 0.18, y + s * 0.86); ctx.closePath(); ctx.fill();
      ctx.fillRect(x + s * 0.28, y + s * 0.4, s * 0.44, s * 0.22);
      ctx.fillRect(x + s * 0.4, y + s * 0.22, s * 0.2, s * 0.18); break;
    }
    case "palm": {
      ctx.fillRect(cx - s * 0.04, y + s * 0.4, s * 0.08, s * 0.5);
      ctx.beginPath(); ctx.arc(cx, y + s * 0.38, s * 0.32, 0, Math.PI * 2); ctx.fill(); break;
    }
    case "sun": {
      ctx.beginPath(); ctx.arc(cx, cy, s * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = s * 0.08; ctx.lineCap = "round";
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * s * 0.32, cy + Math.sin(a) * s * 0.32);
        ctx.lineTo(cx + Math.cos(a) * s * 0.44, cy + Math.sin(a) * s * 0.44); ctx.stroke();
      } break;
    }
    case "map": {
      ctx.beginPath(); ctx.arc(cx, cy - s * 0.05, s * 0.28, Math.PI, 0); ctx.lineTo(cx, cy + s * 0.42);
      ctx.closePath(); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath(); ctx.arc(cx, cy - s * 0.06, s * 0.1, 0, Math.PI * 2); ctx.fill(); ctx.restore(); break;
    }
    case "food": {
      ctx.lineWidth = s * 0.07; ctx.lineCap = "round"; ctx.beginPath();
      ctx.moveTo(cx - s * 0.22, y + s * 0.1); ctx.lineTo(cx - s * 0.22, y + s * 0.9);
      ctx.moveTo(cx - s * 0.34, y + s * 0.1); ctx.lineTo(cx - s * 0.34, y + s * 0.32);
      ctx.moveTo(cx - s * 0.1, y + s * 0.1); ctx.lineTo(cx - s * 0.1, y + s * 0.32); ctx.stroke();
      ctx.fillRect(cx - s * 0.36, y + s * 0.3, s * 0.28, s * 0.08); ctx.beginPath();
      ctx.moveTo(cx + s * 0.18, y + s * 0.1); ctx.lineTo(cx + s * 0.32, y + s * 0.1);
      ctx.lineTo(cx + s * 0.28, y + s * 0.46); ctx.lineTo(cx + s * 0.22, y + s * 0.46);
      ctx.closePath(); ctx.fill(); ctx.fillRect(cx + s * 0.22, y + s * 0.46, s * 0.06, s * 0.42); break;
    }
    case "check": {
      ctx.lineWidth = s * 0.16; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(x + s * 0.18, cy + s * 0.04);
      ctx.lineTo(x + s * 0.42, cy + s * 0.24); ctx.lineTo(x + s * 0.84, cy - s * 0.22);
      ctx.stroke(); break;
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
      // pessoa: cabeca + tronco
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
 * Desenha o glifo do Pix (4 losangos formando um padr├úo de "X"/diamante).
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
  const off = size * 0.28; // dist├óncia do centro
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
    safeFillText(ctx, line, x, y + index * lineHeight, maxWidth, minSize > 0 ? minSize : 12);
  });
}

