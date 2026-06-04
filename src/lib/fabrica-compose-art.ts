
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

// LuminÃ¢ncia relativa (0..1) de uma cor hex.
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

// Retorna um tom profundo ou claro derivado do fundo, em vez de preto/branco puro.
function contrastOn(bg: string): string {
  const normalized = (bg || "").trim().toLowerCase();
  if (normalized === "#0c2340") return "#ffffff";
  return luminance(bg) > 0.6 ? shadeColor(bg, -80) : "#ffffff";
}

/**
 * Garante contraste mÃ­nimo entre `fg` (cor preferida do usuario) e `bg`.
 * Se a diferenca de luminÃ¢ncia for baixa, devolve preto/branco em vez de `fg`.
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const getRGB = (hex: string) => {
    let cleanHex = (hex || "").trim().replace("#", "");
    if (cleanHex.length === 3) cleanHex = cleanHex.split("").map((c) => c + c).join("");
    if (cleanHex.length !== 6) return [0.5, 0.5, 0.5];
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  };
  
  const [r1, g1, b1] = getRGB(hex1);
  const [r2, g2, b2] = getRGB(hex2);
  
  const l1 = 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
  const l2 = 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2;
  
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

function ensureContrast(fg: string, bg: string, minDelta = 0.35): string {
  const ratio = getContrastRatio(fg, bg);
  if (ratio >= 4.5) return fg; // WCAG AA standard
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
 * e focar a atencÃ£o no centro da imagem/conteudo.
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
 * ðŸ›¡ï¸ safeFillText â€” desenha texto garantindo que caiba em maxWidth.
 * Reduz o tamanho da fonte automaticamente atÃ© caber, nunca trunca com "...".
 * @param ctx  Canvas context (deve ter ctx.font jÃ¡ configurado com tamanho-base)
 * @param text Texto a renderizar
 * @param x, y  PosiÃ§Ã£o
 * @param maxWidth  Largura mÃ¡xima em pixels
 * @param minSize  Tamanho mÃ­nimo de fonte (default 12px) â€” abaixo disso para de reduzir
 */
function safeFillText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  minSize = 16
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
 * ðŸ›¡ï¸ wrapTextSafe â€” quebra texto em linhas que cabem em maxWidth.
 * TambÃ©m reduz a fonte se uma Ãºnica palavra nÃ£o couber.
 * Retorna array de linhas prontas para renderizar.
 */
function wrapTextSafe(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  minSize = 16
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
      // Single word wider than maxWidth - shrink font or force break
      if (ctx.measureText(w).width > maxWidth) {
        let shrunk = false;
        const fontStr = ctx.font;
        const sizeMatch = fontStr.match(/(\d+(?:\.\d+)?)px/);
        if (sizeMatch) {
          let size = parseFloat(sizeMatch[1]);
          const fontWithoutSize = fontStr.replace(/(\d+(?:\.\d+)?)px/, "SIZE_PX");
          while (ctx.measureText(w).width > maxWidth && size > minSize) {
            size -= 1;
            ctx.font = fontWithoutSize.replace("SIZE_PX", `${size}px`);
            shrunk = true;
          }
        }
        // Even after shrinking, if word is too big, let it break gracefully instead of hanging forever
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
  imageLuminance?: number;
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
  logoFormat?: "circle" | "square";
  paymentMode?: PaymentMode;
  paymentLabel?: string;
  paymentSuffix?: string;
  strategy?: "ancora" | "vitrine" | "matriz" | "gancho" | "experiencia_hero" | "experiencia_editorial" | "experiencia_postcard" | "experiencia_lifestyle";
  variation?: number;
  /** Forca uma variante especÃ­fica (0..2 para Sua Imagem + Oferta + 1:1). Quando definido, ignora variation%N. */
  forceVariant?: number;
  /** Quando definido, sobrescreve o pool aleatorio de headlines e usa este texto como tÃ­tulo principal em todas as variantes. */
  titleOverride?: string;
  /** Pool de variacÃes de tÃ­tulo (uma por variante). Se fornecido, tem prioridade sobre titleOverride: usa-se titleVariations[variantIndex % len]. */
  titleVariations?: string[];
  /** SÃ­mbolo de moeda exibido antes do preco (R$, US$, Ã”Ã©Â¼, â”¬Ãº, AR$). Default "R$". */
  currencySymbol?: string;
  /** V4: perÃ­odo exibido na linha de informacÃes (ex.: "5 dias", "Janeiro", "12 a 18/01"). */
  travelPeriod?: string;
  /** V3: texto livre do "Total" (ex.: "R$ 1.999 por casal"). Se vazio, calcula automatico. */
  totalOverride?: string;
  /** Prefixo customizavel para o valor (ex: "a partir de", "Por apenas"). Se vazio, apaga o texto. */
  pricePrefix?: string;
  /** V3: controla se a linha de total aparece no box. Default true. */
  showTotal?: boolean;
  /** V3: texto da faixa azul do Pix. Default "{N}% OFF A VISTA NO pix". */
  pixBannerText?: string;
  /** V3: mostra/esconde a faixa azul do Pix. Default true. */
  showPixBanner?: boolean;
  /** FamÃ­lia de fonte global a aplicar em TODOS os textos do anuncio. Default: Inter. */
  fontFamily?: string;
  /** Multiplicador de escala global para tÃ­tulos/precos/textos grandes (>=22px). Default 1. */
  titleScale?: number;
  /** Multiplicador de escala global para descricÃ£o/labels/textos pequenos (<22px). Default 1. */
  descScale?: number;
  /** Cor que substitui o texto branco padrÃ£o (#fff/#ffffff). Ãštil para alinhar texto Ã¡ identidade da marca. */
  textColorOverride?: string;
  /** OpcÃes de Branding (Logo e Contatos) unificadas no motor principal */
  logoDataUrl?: string;
  whatsapp?: string;
  whatsappDialCode?: string;
  instagram?: string;
  footerContact1Icon?: string;
  footerContact1Value?: string;
  footerContact2Icon?: string;
  footerContact2Value?: string;
  isExperience?: boolean;
  hideCents?: boolean;
}

/** Formata telefone no padrÃ£o (XX) 9 XXXX-XXXX */
export let __currentDialCode = "55";

export function formatAdPhone(val: string, explicitDialCode?: string): string {
  if (!val) return "";
  const d = val.replace(/\D/g, "");
  const dial = (explicitDialCode || __currentDialCode || "55").replace(/\D/g, "");
  
  if (dial === "55" && !val.startsWith("+") && d.length <= 11) {
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  }
  
  if (val.startsWith("+")) return val;
  if (d.startsWith(dial)) return `+${d}`;
  return `+${dial} ${val}`;
}

/** Desenha Ã­cone do WhatsApp colorido */
function drawAdWhatsAppIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colorMode: "green" | "custom" = "green", customColor: string = "#ffffff") {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 4;

  // Fundo Verde Oficial do WhatsApp (Sempre Verde Oficial para consistÃªncia e blindagem)
  ctx.fillStyle = "#25D366";
  ctx.beginPath(); 
  ctx.arc(0, 0, size * 0.48, 0, Math.PI * 2); 
  ctx.fill();
  
  // BalÃ£o Branco
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(0, -size * 0.02, size * 0.4, 0.7, 5.5);
  ctx.lineTo(-size * 0.35, size * 0.45);
  ctx.closePath();
  ctx.fill();

  // Fone Verde - Desenho em Vetor de Alta Fidelidade (Curvado Oficial do WhatsApp)
  ctx.fillStyle = "#25D366";
  ctx.strokeStyle = "#25D366";
  ctx.lineWidth = size * 0.10;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  ctx.beginPath();
  ctx.arc(0, -size * 0.02, size * 0.20, 0.7, 2.4);
  ctx.stroke();
  
  // Almofadas curvas do fone (microfone e fone de ouvido do logo do WhatsApp)
  ctx.save();
  ctx.translate(0, -size * 0.02);
  ctx.rotate(0.65);
  ctx.beginPath();
  ctx.ellipse(size * 0.20, 0, size * 0.07, size * 0.11, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  ctx.save();
  ctx.translate(0, -size * 0.02);
  ctx.rotate(2.45);
  ctx.beginPath();
  ctx.ellipse(size * 0.20, 0, size * 0.07, size * 0.11, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/** Desenha Ã­cone do Instagram com gradiente oficial */
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
    // CÃ¢mera
    ctx.lineWidth = size * 0.08; 
    ctx.strokeRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
    ctx.beginPath(); ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(size * 0.18, -size * 0.18, size * 0.04, 0, Math.PI * 2); ctx.fill();
  } else {
    // MODO MONOCROMÃTICO
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

/** Desenha Ã­cone de Site / Globo */
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
 * Desenha o Ã­cone OFICIAL do WhatsApp a partir do asset PNG (`/assets/whatsapp-icon.png`).
 * Centralizado em (x, y) com lado `size`. Usado por TODOS os layouts (V0â€“V4, Feed e Stories).
 * Cacheia a imagem para evitar reload a cada frame.
 */
let __waIconCache: HTMLImageElement | null = null;
export async function drawWhatsAppIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  try {
    if (!__waIconCache) {
      __waIconCache = await loadImage("/assets/whatsapp-icon.png");
    }
    const prevSmoothing = ctx.imageSmoothingEnabled;
    const prevQuality = (ctx as any).imageSmoothingQuality;
    ctx.imageSmoothingEnabled = true;
    (ctx as any).imageSmoothingQuality = "high";
    ctx.drawImage(__waIconCache, x - size / 2, y - size / 2, size, size);
    ctx.imageSmoothingEnabled = prevSmoothing;
    (ctx as any).imageSmoothingQuality = prevQuality;
  } catch {
    drawAdWhatsAppIcon(ctx, x, y, size, "green");
  }
}

/**
 * @deprecated Mantido como alias para retrocompatibilidade. Use drawWhatsAppIcon.
 * Todos os layouts (V0â€“V4, Feed/Stories) passam por aqui â€” substituiÃ§Ã£o centralizada.
 */
export async function drawWhatsAppContact(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  return drawWhatsAppIcon(ctx, x, y, size);
}

/**
 * Reduz progressivamente o font-size do ctx para que o texto caiba no maxWidth especificado.
 */
export function fitUrlText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, initialSize: number, fontFamily: string): number {
  let size = initialSize;
  ctx.font = `700 ${size}px ${fontFamily}, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 14) {
    size -= 1;
    ctx.font = `700 ${size}px ${fontFamily}, sans-serif`;
  }
  return size;
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
  textColorOverride?: string,
  fontFamily: string = "Inter",
  skipLogo: boolean = false,
  logoFormat: "circle" | "square" = "circle",
  isIAPura: boolean = false
) {
  const contactsToDraw: { icon: string; value: string }[] = [];
  // So adiciona contatos que tenham valor preenchido (evita Ã­cones vazios)
  if (contact1 && contact1.icon !== "none" && contact1.value && contact1.value.trim()) contactsToDraw.push(contact1);
  if (contact2 && contact2.icon !== "none" && contact2.value && contact2.value.trim()) contactsToDraw.push(contact2);

  if (!logoUrl && contactsToDraw.length === 0) return;

  const isStory = ch > cw;
  const footerHeight = isIAPura ? (isStory ? 80 : 60) : (isStory ? 120 : 100);
  
  // TAREFA 3 â€” ANCORAGEM DE BASE (CHÃƒO DA GAIOLA)
  // O footerY deve ser calculado retroativamente a partir de PANEL_BOTTOM menos a altura do rodapÃ©.
  // Ajustado para ficar muito mais prÃ³ximo do chÃ£o da arte (80px no quadrado, 150px no story)
  const panelBottom = isIAPura ? (ch - 30) : (isStory ? ch - 150 : ch - 40);
  const footerY = panelBottom - footerHeight;

  // 1. Fundo do RodapÃ© (VÃ‰U GRADIENTE ESCURO) - REMOVIDO
  // SubstituÃ­do por sombras precisas nos elementos para nÃ£o estragar a foto de fundo.
  
  const padX = isStory ? 80 : 60; // Mais margem lateral
  const bgPad = isStory ? 10 : 8;
  const centerY = footerY + footerHeight / 2;

  // 2. Logo (Esquerda)
  let lw = 0;
  let lh = 0;

  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl);
      const maxLogoH = footerHeight * 0.85 * 0.85; // Reduzido em 15% para um aspecto premium e minimalista
      const maxLogoW = cw * 0.35;
      const ratio = logo.naturalWidth / logo.naturalHeight;
      lh = maxLogoH;
      lw = lh * ratio;
      if (lw > maxLogoW) {
        lw = maxLogoW;
        lh = lw / ratio;
      }
      
      ctx.save();
      // Desenha a logo sem fundo branco e sem borda, mas mantÃ©m uma sombra sutil para contraste
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 5;
      
      if (logoFormat === "circle") {
        ctx.beginPath();
        ctx.arc(padX + lw / 2, centerY, Math.min(lw, lh) / 2, 0, Math.PI * 2);
        ctx.clip();
      } else if (logoFormat === "square") {
        roundRect(ctx, padX, centerY - lh / 2, lw, lh, 16);
        ctx.clip();
      }

      ctx.drawImage(logo, padX, centerY - lh / 2, lw, lh);
      ctx.restore();
    } catch (e) {
      console.warn("Falha ao carregar logo para branding", e);
    }
  }
  // ðŸ›¡ï¸ BLINDAGEM: Wordmark de texto sÃ³ aparece se o usuÃ¡rio EXPLICITAMENTE
  // NÃƒO tiver logo e tiver preenchido o nome de uma agÃªncia com mais de 3 letras.
  // Nunca usar cidade, destino ou fallback automÃ¡tico como wordmark.
  // Desativado por padrÃ£o pois causava apariÃ§Ã£o de "FORTALEZA VIAGENS" indesejada.
  // Para reativar, passe agencyName explicitamente com o nome real da agÃªncia.
  /* else if (agencyName ...) { ... } */

  // 3. Contatos (Direita)
  ctx.save();
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  // Revertido para Bold (700) e tamanhos mais impactantes conforme desejo do usuario
  const fontSize = isStory ? 36 : 30; 
  const safeFont = fontFamily || "Inter";
  ctx.font = `700 ${fontSize}px ${safeFont}, sans-serif`;
  
  // Rodape sempre BRANCO com sombra difusa e profunda para contraste natural
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 4;

  let textRightX = cw - (isStory ? 80 : 60); // Sincronizado com a margem do logo
  const itemGap = 20; // Aumentado o gap entre Ã­cone e texto
  const logoEdge = logoUrl ? (padX + lw + bgPad * 2 + 30) : padX;
  const maxAllowedWidthForContacts = isStory ? (cw * 0.70) : (cw * 0.45);

  // Aumentado o espaÃ§amento vertical entre os dois contatos (de 0.18 para 0.22)
  let yPos = contactsToDraw.length === 2 ? centerY + (footerHeight * 0.22) : centerY;

  for (const c of contactsToDraw) {
    let displayValue = c.value;
    if (c.icon.startsWith("whatsapp")) displayValue = formatAdPhone(c.value);
    if (c.icon.startsWith("instagram")) displayValue = c.value.startsWith("@") ? c.value : `@${c.value}`;

    // Auto-shrink para evitar colisÃ£o (Quadro Inteligente de URL DinÃ¢mica unificado)
    const isWebsite = c.icon.startsWith("website");
    const maxAllowedWidthPerItem = maxAllowedWidthForContacts * (isWebsite ? 0.75 : 0.95);

    let currentFontSize = fontSize;
    ctx.font = `700 ${currentFontSize}px ${safeFont}, sans-serif`;
    while (ctx.measureText(displayValue).width > maxAllowedWidthPerItem && currentFontSize > 14) {
      currentFontSize -= 1;
      ctx.font = `700 ${currentFontSize}px ${safeFont}, sans-serif`;
    }
    const iconSizeFactor = 1.35;
    let currentIconSize = currentFontSize * iconSizeFactor;

    ctx.fillText(displayValue, textRightX, yPos);
    const textWidth = ctx.measureText(displayValue).width;
    const iconX = textRightX - textWidth - itemGap - currentIconSize/2;

    if (c.icon === "whatsapp_green" || c.icon === "whatsapp_custom" || c.icon.startsWith("whatsapp")) {
      await drawWhatsAppContact(ctx, iconX, yPos, currentIconSize);
    } else if (c.icon === "instagram_gradient" || c.icon.startsWith("instagram")) {
      drawAdInstagramIcon(ctx, iconX, yPos, currentIconSize, "gradient");
    } else if (c.icon === "instagram_custom") {
      drawAdInstagramIcon(ctx, iconX, yPos, currentIconSize, "custom", ctx.fillStyle);
    } else if (c.icon === "website" || c.icon.startsWith("website")) {
      drawAdWebsiteIcon(ctx, iconX, yPos, currentIconSize, ctx.fillStyle);
    }

    // Aumentado o pulo para a linha de cima (de 0.36 para 0.44)
    yPos -= (footerHeight * 0.44);
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
    if (src && !src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
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

function fillGlassRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  bgColor: string,
  borderColor = "rgba(255, 255, 255, 0.25)"
) {
  ctx.save();
  // Ambient glow shadow for glassmorphism
  ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  
  ctx.fillStyle = bgColor;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  // Inner highlight reflection
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  roundRect(ctx, x + 1, y + 1, w - 2, h - 2, r - 1);
  ctx.stroke();
  
  ctx.restore();
}

function drawPremiumShadow(
  ctx: CanvasRenderingContext2D,
  drawFn: () => void,
  intensity = 1
) {
  ctx.save();
  // Pass 1: Ambient soft shadow
  ctx.shadowColor = `rgba(0, 0, 0, ${0.08 * intensity})`;
  ctx.shadowBlur = 32;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;
  drawFn();

  // Pass 2: Sharp contact shadow
  ctx.shadowColor = `rgba(0, 0, 0, ${0.16 * intensity})`;
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 8;
  drawFn();
  ctx.restore();
}

function drawMonoIcon(
  ctx: CanvasRenderingContext2D,
  kind: IconKey | string,
  cx: number,
  cy: number,
  size: number,
  color: string,
) {
  const emojis: Record<string, string> = {
    check: "✅", bus: "🚌", hotel: "🏨", plane: "✈️", ship: "🛳️", palm: "🌴",
    sun: "☀️", food: "🍽️", coffee: "☕", map: "🗺️", camera: "📷", star: "⭐",
    heart: "❤️", guide: "🙋‍♂️", user: "👤", wifi: "📶"
  };
  
  if (emojis[kind as string]) {
    ctx.save();
    ctx.font = `${size * 1.2}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emojis[kind as string], cx, cy);
    ctx.restore();
    return;
  }

  // fallback se a chave não existir
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, size/2, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

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
  const off = size * 0.28; // distÃ¢ncia do centro
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

/**
 * ðŸ›¡ï¸ SISTEMA DE BLINDAGEM DE TEXTO (NÃVEL 1)
 * Limpa artefatos de cÃ³digo, retornos de funÃ§Ã£o e caracteres corrompidos
 * que podem vir de respostas da IA ou erros de estado.
 */
function sanitizeAdText(text: string): string {
  if (!text) return "";
  // ðŸ›¡ï¸ Blindagem CirÃºrgica: remove lixo de IA sem quebrar o texto do usuÃ¡rio
  return text
    .replace(/return\s*\(/gi, "")     // Remove 'return ('
    .replace(/const\s+\w+\s*=/gi, "") // Remove 'const var ='
    .replace(/[<>]/g, "")             // Remove apenas tags < > suspeitas
    .trim();
}

export async function composeTravelAd(options: ComposeTravelAdOptions): Promise<string> {
  __currentDialCode = options.whatsappDialCode || "55";
  const {
    imageUrl,
    format,
    primaryColor,
    secondaryColor,
    price: rawPrice,
    installments: rawInstallments,
    hasLogo,
    paymentMode = "installments",
    paymentLabel,
    paymentSuffix,
    strategy = "vitrine",
    variation = 0,
    forceVariant,
    titleVariations,
    currencySymbol,
    travelPeriod,
    totalOverride,
    pricePrefix,
    showTotal: rawShowTotal = true,
    pixBannerText,
    showPixBanner: rawShowPixBanner = true,
    fontFamily,
    titleScale = 1,
    descScale = 1,
    textColorOverride,
    logoDataUrl,
    whatsapp,
    instagram,
    footerContact1Icon,
    footerContact1Value,
    footerContact2Icon,
    footerContact2Value,
    isExperience,
    hideCents,
    logoFormat = "circle",
  } = options;

  const destination = sanitizeAdText(options.destination || "");
  const city = sanitizeAdText(options.city || "");
  const promoName = sanitizeAdText(options.promoName || "");
  const titleOverride = sanitizeAdText(options.titleOverride || "");
  const highlights = (options.highlights || []).map(h => ({
    ...h,
    text: sanitizeAdText(h.text || "")
  }));

  // ðŸ›¡ï¸ Blindagem de ExperiÃªncia: garante que dados de preÃ§o nunca vazem para ads de luxo
  const price = isExperience ? "" : sanitizeAdText(rawPrice || "");
  const installments = isExperience ? "" : sanitizeAdText(rawInstallments || "");
  const showTotal = isExperience ? false : (rawShowTotal !== false);
  const showPixBanner = isExperience ? false : (rawShowPixBanner !== false);

  const curSym = (currencySymbol || "R$").trim();

  const width = 1080;
  const height = format === "story" ? 1920 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D nÃ£o suportado");

  // ====== Font customization global (famÃ­lia + escala tÃ­tulo/descricÃ£o) ======
  // Intercepta o setter de `font` e o `fillStyle` para que TODAS as variantes/categorias
  // respeitem as escolhas do usuario sem precisar reescrever cada ctx.font do arquivo.
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

  // â”€â”€ Inteligencia de Contraste â”€â”€
  // Se o usuario escolheu uma cor de texto especÃ­fica (textColorOverride), 
  // tentamos usa-la. Mas se ela nÃ£o tiver contraste com o fundo (bg),
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
  // V0/V1_Experiencia usam Playfair Display + Dancing Script â€” pre-carrega.
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

  // Pools de headlines â€” variantes que dependem do destino so entram se houver destino preenchido.
  // Frases banidas globalmente (alinhado com edge function): "O melhor de", "Seu proximo destino e esse".
  // ===========================================================================
  // ðŸ›¡ï¸ SISTEMA DE BLINDAGEM CANVA VIAGEM (NÃVEL 3) ðŸ›¡ï¸
  // ---------------------------------------------------------------------------
  // REGRA 1: SEGURANÃ‡A TOTAL INSTAGRAM (340px bottom offset em Stories).
  // REGRA 2: SEPARAÃ‡ÃƒO CATEGÃ“RICA (Experiencia != Oferta).
  // REGRA 3: HIGIENIZAÃ‡ÃƒO DE ESTADO (Nenhum dado de preco vaza para ads de luxo).
  // ===========================================================================
  const isStory = format === "story";
  const priceValueText = (price || "").trim();
  // ðŸ›¡ï¸ BLINDAGEM DE PREÃ‡O: Garante que o preÃ§o nunca chega ao canvas jÃ¡ formatado
  // com separadores duplicados (ex: "1.499,00" vindo de Intl.NumberFormat, que ao
  // passar pela regex abaixo somaria todos os dÃ­gitos erroneamente).
  // Normaliza sempre para dÃ­gitos + separador decimal simples antes de montar o string.
  const priceWithSymbol = (() => {
    if (!priceValueText) return "";
    // Se jÃ¡ comeÃ§a com sÃ­mbolo de moeda, usa como veio
    if (/^(R\$|US\$|AR\$|â‚¬|Â£|[A-Z]{1,3}\$)/i.test(priceValueText)) return priceValueText;
    return `${curSym} ${priceValueText}`.trim();
  })();

  const RULES = {
    SAFE_BOTTOM: isStory ? 310 : 150, // Updated for IG Story Bottom Safe Zone
    SAFE_TOP: isStory ? 250 : 60,     // Updated for IG Story Top Safe Zone
    LEFT: isStory ? 60 : 80,
    RIGHT: width - (isStory ? 60 : 80),
    PANEL_BOTTOM: height - (isStory ? 310 : 150)
  };

  
  const drawProminentLogo = async (ctx: CanvasRenderingContext2D, x: number, y: number, maxHeight: number = 140) => {
    return 0; // Bypassed: Logo is now exclusive to the bottom-left slot in drawFinalBranding
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
    "Uma experiencia diferente de tudo",
    "Dias que voce nÃ£o esquece",
    "Historias comecam aqui",
    "Memorias que voce leva pra vida",
  ];
  const experienceWithDest = hasDest
    ? [`${destFmt} como voce nunca viu`, `Viva ${destFmt} de verdade`]
    : [];
  const ofertaBase = [
    "Partiu viajar?",
    "Preco especial para viajar",
    "Vagas limitadas, garanta a sua",
  ];
  const ofertaWithDest = hasDest
    ? [`Pacote para ${destFmt}`, `${destFmt} te espera`, `Vamos para ${destFmt}?`]
    : [];

  const headlinePool = isExperience
    ? [...experienceBase, ...experienceWithDest]
    : [...ofertaBase, ...ofertaWithDest];

  // Sempre mostra ate 5 benefÃ­cios (story OU quadrado) â€” o usuario escolheu 5/5 e os 5 devem aparecer.
  const shownHighlights = highlights.slice(0, 6);
  const badgeText = cityFmt ? `Saindo de ${cityFmt}` : "Pacote completo";
  const variantIdx = typeof forceVariant === "number" ? Math.abs(forceVariant) : Math.abs(variation);
  const pickedFromVariations = (titleVariations && titleVariations.length > 0)
      ? (titleVariations[variantIdx % titleVariations.length] || "").trim()
      : undefined;
  const titleText = sanitizeAdText(
      typeof pickedFromVariations === "string"
        ? pickedFromVariations
        : typeof titleOverride === "string"
          ? titleOverride.trim()
          : headlinePool[Math.abs(variation) % headlinePool.length]
    );
  const subtitlePool = [
    "Roteiro pensado para viver melhor",
    "Beleza, conforto e boas memorias",
    "Uma viagem com outro ritmo",
    "Paisagens, sabores e historias",
    "Seu descanso comeca aqui",
  ];
  const subtitleText = subtitlePool[(Math.abs(variation) + 2) % subtitlePool.length];

  const resolvePaymentCopy = () => {
    const suffix = (fallback: string) => (typeof paymentSuffix === "string" ? paymentSuffix : fallback);
    switch (paymentMode) {
      case "cash":
        return { topLabel: paymentLabel || "A VISTA", mainPrice: priceWithSymbol, bottomSuffix: suffix("por pessoa") };
      case "cash_discount":
        return { topLabel: paymentLabel || "A VISTA Â· 5% OFF", mainPrice: priceWithSymbol, bottomSuffix: suffix("por pessoa") };
      case "from":
        return { topLabel: paymentLabel || "A PARTIR DE", mainPrice: priceWithSymbol, bottomSuffix: suffix("por pessoa") };
      case "daily":
        return { topLabel: paymentLabel || "DIÃRIA POR", mainPrice: priceWithSymbol, bottomSuffix: suffix("por diaria") };
      case "monthly":
        return { topLabel: paymentLabel || "MENSAL POR", mainPrice: priceWithSymbol, bottomSuffix: suffix("por mes") };
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
  const iconSize = compact ? 26 : 34;
  const baseTextFont = compact ? 24 : 30;
  const textStartX = compact ? 64 : 82;
  const iconX = compact ? 32 : 40;
  items.forEach((item, idx) => {
    fillRoundRect(ctx, x, y + idx * (pillH + gap), w, pillH, compact ? 30 : 40, inverted ? "rgba(255,255,255,0.16)" : "#ffffff");
    const iconColor = inverted ? "#ffffff" : primaryColor;
    drawMonoIcon(ctx, item.icon || "check", x + iconX, y + idx * (pillH + gap) + pillH / 2, iconSize, iconColor);
    ctx.fillStyle = inverted ? "#ffffff" : "#111111";
    let pillFont = baseTextFont;
    ctx.font = `800 ${pillFont}px Inter, Arial, sans-serif`;
    const textMaxW = w - textStartX - 24;
    while (ctx.measureText(item.text).width > textMaxW && pillFont > 16) {
      pillFont -= 2;
      ctx.font = `800 ${pillFont}px Inter, Arial, sans-serif`;
    }
    ctx.textBaseline = "middle";
    safeFillText(ctx, item.text, x + textStartX, y + idx * (pillH + gap) + pillH / 2, textMaxW, 14);
    ctx.textBaseline = "alphabetic";
  });
  return items.length * pillH + Math.max(0, items.length - 1) * gap;
};

  // Estilo CVC: caixa amarela densa com PACOTE/DESTINO no topo, linha de Ã­cones,
  // "a partir de" + selo de parcelas + R$ gigante, total por pessoa, e faixa azul escura "5% OFF A VISTA NO PIX".
  const drawPriceCard = (x: number, y: number, w: number, _h: number, _align: "left" | "right" = "right") => {
    // Altura do card (CVC e mais alto que o original): cresce conforme o conteudo.
    const cardH = 290;
    const radius = 22;
    // 1. Fundo amarelo (cor secundaria)
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
      // Linha unica com shrink moderado
      while (ctx.measureText(destUpper).width > innerW && destSize > 20) {
        destSize -= 1;
        ctx.font = `900 ${destSize}px Inter, Arial, sans-serif`;
      }
      safeFillText(ctx, destUpper, cx, y + 60, innerW, 16);
    }

    // 3. Linha de info: "X dias â€¢ âœˆï¸ ðŸ¨ â˜•"
    const firstHL = highlights[0];
    const firstHLText = typeof firstHL === "string" ? firstHL : (firstHL?.text || "");
    const daysFromHl = firstHLText.match(/(\d+)\s*dias?/i)?.[0];
    const days = (travelPeriod && travelPeriod.trim()) || daysFromHl || "Consulte";
    ctx.font = `700 17px Inter, Arial, sans-serif`;
    ctx.fillText(`${days}   â€¢   âœˆï¸   ðŸ¨   â˜•`, cx, y + 92);

    // 4. Texto acima do preco ("a partir de" ou "pagamento")
    const isCash = paymentMode === "cash" || paymentMode === "cash_discount";
    const isDownPlus = paymentMode === "down_plus";
    const topTxt = isCash ? "pagamento" : (isDownPlus ? "entrada +" : (pricePrefix !== undefined ? pricePrefix : "a partir de"));
    
    ctx.font = `600 13px Inter, Arial, sans-serif`;
    ctx.fillText(topTxt, cx, y + 118);

    // Calcula tamanhos do selo de parcelas e do preco lado a lado
    let installmentsText = "A VISTA";
    if (!isCash) {
       if (isDownPlus) {
          const clean = (installments || paymentLabel || "Entrada + 10x").replace(/entrada\s*\+?/i, "").trim();
          installmentsText = clean || "10X";
       } else {
          installmentsText = (installments || "12X").toUpperCase().replace(/\s+/g, "").replace(/\$/g, "");
          if (/^\d+X$/.test(installmentsText)) installmentsText = `${installmentsText.slice(0, -1)}x de`;
       }
    }
    const btmTxt = isCash ? (paymentSuffix || "por pessoa").trim() : (isDownPlus ? "parcelas" : "sem juros");
    
    const priceText = mainPrice || `${curSym} ${price}`;
    // Tamanho robusto para impacto visual
    const textLen = priceText.replace(/\s/g, "").length;
    const priceFontSize = textLen <= 8 ? 64 : textLen <= 11 ? 54 : textLen <= 14 ? 48 : 42;
    ctx.font = `900 ${priceFontSize}px Inter, Arial, sans-serif`;
    const priceW = ctx.measureText(priceText).width;

    // Selo arredondado de parcelas (cor primaria com texto secundario)
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
    safeFillText(ctx, installmentsText, groupX + badgeW / 2, priceY - 8, badgeW - 10, 10);
    ctx.font = `700 10px Inter, Arial, sans-serif`;
    ctx.fillText(btmTxt, groupX + badgeW / 2, priceY + 14);

    // Preco gigante
    ctx.fillStyle = cardTextColor;
    ctx.textAlign = "left";
    ctx.font = `900 ${priceFontSize}px Inter, Arial, sans-serif`;
    safeFillText(ctx, priceText, groupX + badgeW + gap, priceY + priceFontSize / 3, innerW - badgeW - gap, 24);

    // 5. Total por pessoa
    ctx.fillStyle = cardTextColor;
    ctx.font = `600 14px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    if (bottomSuffix) {
      safeFillText(ctx, bottomSuffix, cx, y + 220, innerW, 14);
    }

    // 6. Faixa PIX azul escura na base (cor primaria)
    const stripeH = 40;
    const stripeY = y + cardH - stripeH;
    fillRoundRect(ctx, x, stripeY, w, stripeH, radius, primaryColor);
    // re-quadra os cantos superiores da faixa (corta arredondamento topo)
    ctx.fillStyle = primaryColor;
    ctx.fillRect(x, stripeY, w, stripeH / 2);
    // re-arredonda so os cantos inferiores
    fillRoundRect(ctx, x, stripeY, w, stripeH, radius, primaryColor);
    ctx.fillRect(x, stripeY, w, 6);
    const pixText = (pixBannerText || "").trim() || "5% OFF A VISTA NO PIX  Â­Æ’Ã†Ã¡";
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
    // Evita duplicar quando o promoName ja e "OFERTA ESPECIAL" (ou contem).
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
    if (promoTrunc !== promoUpper) promoTrunc = promoTrunc.slice(0, -1) + "...";
    safeFillText(ctx, promoTrunc, x, y + (hasOfferKeyword ? 0 : 48), contentWidth - 40, 16);
  };

  const renderSafeSquareOffer = async () => {
    // Variantes ATIVAS: V0, V1, V2, V3, V4, V5 (todas implementadas).
    const TOTAL_VARIANTS = 6;
    let variant = typeof forceVariant === "number"
      ? ((forceVariant % TOTAL_VARIANTS) + TOTAL_VARIANTS) % TOTAL_VARIANTS
      : Math.abs(variation) % TOTAL_VARIANTS;

    // â”€â”€ V3 Â· ESTRUTURA (oferta com box destacado) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Spec estrutural â€” layout/visual ainda NÃƒO implementado.
    // PadrÃ£o identico a V0/V1/V2: early-branch por variante, lendo dos mesmos
    // dados dinÃ¢micos ja existentes no escopo de composeTravelAd().
    //
    // ÃREAS (de fundo â†’ frente):
    //   [BG]      Fundo com imagem turÃ­stica do destino  â†’ image (drawImage cover)
    //   [BOX]     Bloco principal central (card destacado sobre o BG)
    //     Ã”Ã¶Â£â”€ [TITLE]      Ãrea de tÃ­tulo            â†’ titleText
    //     Ã”Ã¶Â£â”€ [INFO]       Dias + Ã­cones (highlights)â†’ highlights[] (ICON_SYMBOL)
    //     Ã”Ã¶Â£â”€ [INSTALL]    Preco parcelado           â†’ installments / paymentLabel
    //     Ã”Ã¶Â£â”€ [TOTAL]      Valor total               â†’ mainPrice / price / curSym
    //     Ã”Ã¶Ã¶â”€ [PROMO]      Destaque promocional      â†’ promoName (desconto/badge)
    //
    // DADOS DINÃ‚MICOS REUTILIZADOS (ja disponÃ­veis no escopo):
    //   destination, destUp     â†’ nome do destino
    //   highlights[]            â†’ dias + Ã­cones (text + icon)
    //   installments            â†’ parcelas
    //   mainPrice / price       â†’ total
    //   curSym                  â†’ moeda
    //   promoName               â†’ destaque/desconto
    //   primaryColor / secondaryColor â†’ cores do box
    //   hasLogo, logoH          â†’ reserva de topo p/ logo
    // â”€â”€ V3 Â· REF "CVC" â€” foto cheia + BOX AMARELO destacado â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Estrutura: BG (foto destino) â†’ BOX amarelo arredondado no topo-esquerda
    // contendo: PACOTE / destino / dias+Ã­cones / "a partir de" + 12x sem juros
    // + R$ preco gigante / total por pessoa / faixa Pix com desconto.
    if (variant === 3) {
      if (format === "story") {
        // [BG] Foto do destino cobrindo todo o canvas (primeira coisa a desenhar)
        const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.45);
        // Bypassed logo (drawProminentLogo called after drawImage is complete)
        ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

        // â”€â”€ Cores do V3 (box CVC) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const yellow = secondaryColor || "#FCD34D";
        const yellowDark = shadeColor(yellow, -12);
        const navy = getSafeColor(yellow, primaryColor);
        const navyRaw = primaryColor || "#0c2340";

        const destinoUp = (destination || "DESTINO").toUpperCase();
        // Desconto: extrai nÃºmero do promoName (ex.: "5% OFF") ou usa 5 como default
        const descMatch = (promoName || "").match(/(\d{1,2})\s*%/);
        const descN = descMatch ? descMatch[1] : "5";

        const instMatch = (installments || "12x").match(/(\d{1,2})\s*x?/i);
        const parcN = instMatch ? instMatch[1] : "10";
        const priceStr = mainPrice || `${curSym} ${price}`;
        const topLabel = paymentLabel || (installments ? `${installments} de` : `${parcN}x de`);
        const bottomSuffix = paymentSuffix || "por pessoa";

        // Pre-calculo para altura dinamica
        const shownItems = highlights.filter(h => h && h.text && h.text.trim()).slice(0, 4);
        const benefitsList = shownItems.length > 0 ? shownItems.map(h => ({
          text: h.text,
          icon: h.icon || "check"
        })) : [
          { text: "Transporte", icon: "bus" },
          { text: "Hospedagem", icon: "hotel" },
          { text: "CafÃ© da manhÃ£", icon: "coffee" },
          { text: "Guia local", icon: "guide" }
        ];

        const rowGap = 80;
        const startY = safeTop + 230;
        const benefitsEnd = startY + (Math.ceil(benefitsList.length / 2) * rowGap);
        const priceBlockY = benefitsEnd + 55;
        const ringH = 210;

        const baseBoxH = (priceBlockY - safeTop) + ringH + 30;
        const stripeH = 64;
        const boxH = showPixBanner ? baseBoxH + stripeH + 30 : baseBoxH;

        // â”€â”€ [BOX] amarelo arredondado â”€ â”€â”€â”€â”€â”€
        const boxX = 40;
        const boxW = width - 80; // 1000px
        const boxY = safeTop; // Ancorado na Safe Zone

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 8;
        fillRoundRect(ctx, boxX, boxY, boxW, boxH, 36, yellow);
        ctx.restore();

        const cx = boxX + boxW / 2;

        // TÃ­tulo "PACOTE"
        ctx.fillStyle = navy;
        ctx.textAlign = "center";
        ctx.font = "900 38px Inter, Arial, sans-serif";
        ctx.fillText("PACOTE", cx, boxY + 70);

        // Destino (multiplicado por 1.2x)
        let destSize = 68;
        ctx.font = `900 ${destSize}px Inter, Arial, sans-serif`;
        while (ctx.measureText(destinoUp).width > boxW - 80 && destSize > 32) {
          destSize -= 2;
          ctx.font = `900 ${destSize}px Inter, Arial, sans-serif`;
        }
        safeFillText(ctx, destinoUp, cx, boxY + 140, boxW - 80, 24);

        // Grade de 4 BenefÃ­cios
        const colW = (boxW - 100) / 2; // 450px cada coluna
        const colGap = 40;
        const startX = boxX + 50;
        
        benefitsList.forEach((b, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const tx = startX + col * (colW + colGap);
          const ty = startY + row * rowGap;
          
          const iconSize = 64;
          drawMonoIcon(ctx, b.icon as IconKey, tx + iconSize/2, ty, iconSize, navy);
          
          const isDuration = /\d+\s*dia/i.test(b.text) || /noite/i.test(b.text);
          let bfs = isDuration ? 37 : 49;
          ctx.fillStyle = navy;
          ctx.font = `700 ${bfs}px Inter, Arial, sans-serif`;
          ctx.textAlign = "left";
          const textX = tx + iconSize + 14;
          const textMaxW = colW - (iconSize + 14);
          while (ctx.measureText(b.text).width > textMaxW && bfs > 16) {
            bfs -= 1;
            ctx.font = `700 ${bfs}px Inter, Arial, sans-serif`;
          }
          ctx.fillText(b.text, textX, ty + 10);
        });

        // Bloco de PreÃ§o
        const ringX = boxX + 40;
        const ringY = priceBlockY;
        const ringW = boxW - 80;

        // Alto Relevo
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.38)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 8;
        fillRoundRect(ctx, ringX, ringY, ringW, ringH, 24, yellowDark);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 3;
        roundRect(ctx, ringX + 1.5, ringY + 1.5, ringW - 3, ringH - 3, 22);
        ctx.stroke();
        ctx.restore();

        const priceCenterX = ringX + ringW / 2;
        ctx.textAlign = "center";
        ctx.fillStyle = navy;
        
        const isCash = paymentMode === "cash" || paymentMode === "cash_discount";
        const topLabelRender = isCash 
          ? (pricePrefix !== undefined ? pricePrefix : "A VISTA").toString().toUpperCase()
          : (topLabel || "Ã€ VISTA").toString().toUpperCase();
          
        ctx.font = "800 24px Inter, Arial, sans-serif";
        ctx.fillText(topLabelRender, priceCenterX, ringY + 45); // Movido para cima
        
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        
        let priceFs = 96;
        ctx.font = `900 ${priceFs}px Inter, Arial, sans-serif`;
        while (ctx.measureText(priceStr).width > ringW - 40 && priceFs > 30) {
          priceFs -= 4;
          ctx.font = `900 ${priceFs}px Inter, Arial, sans-serif`;
        }
        ctx.fillStyle = navy;
        safeFillText(ctx, priceStr, priceCenterX, ringY + 142, ringW - 40, 24); // Movido para baixo
        ctx.restore();
        
        ctx.fillStyle = navy;
        ctx.globalAlpha = 0.75;
        ctx.font = "800 22px Inter, Arial, sans-serif";
        ctx.fillText(bottomSuffix || "por pessoa", priceCenterX, ringY + 185); // Movido para baixo
        ctx.globalAlpha = 1;

        // Faixa de Desconto Pix no rodapÃ© do cartÃ£o amarelo
        if (showPixBanner) {
        const pixLabel = (pixBannerText && pixBannerText.trim())
          || `${descNV4}% OFF NO PIX`;
        ctx.font = "900 26px Inter, Arial, sans-serif";
        const pixLabelW = ctx.measureText(pixLabel).width;
        const pixPadX = 22;
        const pixTotalW = pixLabelW + pixPadX * 2;
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

        // texto centralizado
        ctx.fillStyle = v4OnSecondary;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 26px Inter, Arial, sans-serif";
        const midY = pixYbadge + pixHbadge / 2;
        ctx.fillText(pixLabel, pixXbadge + pixTotalW / 2, midY + 1);
        ctx.textBaseline = "alphabetic";
      }

      await drawFinalBranding(
        ctx, width, height, logoDataUrl, 
        options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined), 
        options.footerContact2Icon ? { icon: options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
        effectiveTextColor,
        userFamily,
        false,
        logoFormat
      );
      return canvas.toDataURL("image/png");
    }

    // â”€â”€ V5 Â· AURORA PREMIUM â€” glassmorphism card with glowing borders â”€
    if (variant === 5) {
      await drawProminentLogo(ctx, 40, 40, 120);
      // [BG] foto cobre 100%
      const cBgV5 = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.45);
      ctx.drawImage(image, cBgV5.sx, cBgV5.sy, cBgV5.sw, cBgV5.sh, 0, 0, width, height);

      // Gradient overlay for auroral glow
      const auroraGrad = ctx.createLinearGradient(0, height * 0.2, 0, height);
      auroraGrad.addColorStop(0, "rgba(0,0,0,0.1)");
      auroraGrad.addColorStop(0.5, "rgba(10, 15, 30, 0.6)");
      auroraGrad.addColorStop(1, "rgba(5, 8, 15, 0.95)");
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, 0, width, height);

      const v5Primary = primaryColor || "#7C3AED"; // Roxo elegante por padrÃ£o
      const v5Secondary = secondaryColor || "#FBBF24"; // Amarelo/Dourado quente
      const destinoV5 = (destination || "DESTINO").toUpperCase();
      const taglineV5 = ((promoName || "OPORTUNIDADE ÃšNICA").trim()).toUpperCase();
      const titleLineV5 = (() => {
        const t = (titleText || "").trim();
        const firstLine = t.split(/\r?\n/)[0] || t;
        return firstLine.replace(new RegExp(`^${taglineV5}\\s*`, "i"), "").trim() || destinoV5;
      })();

      const daysItemV5 = highlights.find((h) => /\d+\s*dia|\d+\s*noite|janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/i.test(h?.text || ""));
      const daysTextV5 = (travelPeriod?.trim() || daysItemV5?.text || "").trim();
      const iconListV5: IconKey[] = (() => {
        const fromHl = highlights
          .map((h) => h?.icon as IconKey | undefined)
          .filter((k): k is IconKey => !!k);
        if (fromHl.length === 0) return ["plane", "hotel", "coffee", "guide"] as IconKey[];
        const seen = new Set<IconKey>(); const out: IconKey[] = [];
        for (const k of fromHl) { if (!seen.has(k)) { seen.add(k); out.push(k); if (out.length >= 4) break; } }
        return out;
      })();

      const instMatchV5 = (installments || "12x").match(/(\d{1,2})\s*x/i);
      const parcNV5 = instMatchV5 ? instMatchV5[1] : "12";
      const leftTopV5 = (() => {
        if (pricePrefix && pricePrefix.trim() !== "") return pricePrefix;
        if (paymentMode === "cash" || paymentMode === "cash_discount") return "A VISTA";
        if (paymentMode === "down_plus") return "entrada +";
        return pricePrefix !== undefined ? pricePrefix : "a partir de";
      })();
            const pillTxtV5 = (() => {
        if (paymentLabel && paymentLabel.trim() !== "") return paymentLabel;
        if (paymentMode === "cash" || paymentMode === "cash_discount") return "Ã€ VISTA";
        if (paymentMode === "down_plus") {
          const clean = (installments || "Entrada + 12x").replace(/entrada\s*\+?/i, "").trim();
          return clean || `${parcNV5}X`;
        }
        return `${parcNV5}X`;
      })().toUpperCase();

      const priceRawV5 = (price || "").trim();
      const priceNumV5 = parseFloat(priceRawV5.replace(/\./g, "").replace(",", "."));
      const hasCentsV5 = /[.,]\d{1,2}\s*$/.test(priceRawV5);
      const fmtBRv5 = (n: number, withCents: boolean) =>
        n.toLocaleString("pt-BR", {
          minimumFractionDigits: withCents ? 2 : 0,
          maximumFractionDigits: withCents ? 2 : 0,
        });
      const valNumV5 = !isNaN(priceNumV5)
        ? fmtBRv5(priceNumV5, hasCentsV5)
        : priceRawV5;

      const totalMultiplierV5 = (paymentMode === "cash" || paymentMode === "cash_discount") ? 1 : parseInt(parcNV5, 10);
      const totalNumV5 = !isNaN(priceNumV5) ? priceNumV5 * totalMultiplierV5 : NaN;
      const totalStrV5 = (totalOverride && totalOverride.trim())
        || (!isNaN(totalNumV5) ? `Total: ${curSym} ${fmtBRv5(totalNumV5, hasCentsV5)}` : "");

      // Card dimensÃµes
      const cardW = Math.round(width * (format === "story" ? 0.86 : 0.78));
      const cardX = Math.round((width - cardW) / 2);
      const basePriceOffset = format === "story" ? 280 : 230;
      
      const willShowBottomTxt = showTotal ? !!(totalStrV5 || bottomSuffix) : !!bottomSuffix;
      let cardH = basePriceOffset + 10;
      if (willShowBottomTxt) cardH += 35;
      if (showPixBanner) cardH += 0; // Removido espaço extra para o Pix, diminuindo ~10% do bloco preto
      const cardY = format === "story" ? Math.round(height * 0.42) : Math.round(height * 0.40);
      const cardR = 32;

      // Desenha card Aurora semi-transparente
      const hexToRgbaV5 = (hexColor: string, alpha: number) => {
        const h = (hexColor || "#ffffff").replace("#", "");
        if (h.length !== 6) return `rgba(255, 255, 255, ${alpha})`;
        const r = parseInt(h.substring(0,2), 16);
        const g = parseInt(h.substring(2,4), 16);
        const b = parseInt(h.substring(4,6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      
      const v5TextMain = "#ffffff"; // Forcado para branco devido ao dark glow
      const v5TextMuted = hexToRgbaV5(v5TextMain, 0.7);
      const v5TextFaint = hexToRgbaV5(v5TextMain, 0.5);

      ctx.save();
      // Glow border is now secondary color
      ctx.shadowColor = v5Secondary;
      ctx.shadowBlur = 40;
      fillRoundRect(ctx, cardX - 3, cardY - 3, cardW + 6, cardH + 6, cardR, hexToRgbaV5(v5TextMain, 0.05));
      ctx.restore();

      ctx.save();
      // Glass card fill -> using primaryColor
      fillRoundRect(ctx, cardX, cardY, cardW, cardH, cardR, hexToRgbaV5(v5Primary, 0.92));
      
      // Card border stroke
      ctx.strokeStyle = hexToRgbaV5(v5TextMain, 0.15);
      ctx.lineWidth = 2;
      roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
      ctx.stroke();
      ctx.restore();

      const cxV5 = cardX + cardW / 2;
      const leftPadV5 = cardX + 40;

      // 1) Tagline
      ctx.textAlign = "left";
      ctx.fillStyle = v5Secondary;
      ctx.font = "900 20px Inter, Arial, sans-serif";
      safeFillText(ctx, taglineV5, leftPadV5, cardY + 45, cardW - 80, 12);

      // 2) TÃ­tulo Destino
      ctx.fillStyle = v5TextMain;
      ctx.font = "900 56px Inter, Arial, sans-serif";
      safeFillText(ctx, titleLineV5, leftPadV5, cardY + 105, cardW - 80, 18);

      // 3) Dias / Info
      if (daysTextV5) {
        ctx.fillStyle = v5TextMuted;
        ctx.font = "700 28px Inter, Arial, sans-serif";
        ctx.fillText(daysTextV5.toUpperCase(), leftPadV5, cardY + 155);
      }

      // 4) Icons Highlights (horizontal next to daysText)
      const iconSizeV5 = 44;
      const iconGapV5 = 12;
      const iconStartX = leftPadV5;
        const iconStartY = cardY + 165; // Below daysTextV5, slightly higher
      iconListV5.forEach((k, idx) => {
        const ix = iconStartX + idx * (iconSizeV5 + iconGapV5);
        fillRoundRect(ctx, ix, iconStartY, iconSizeV5, iconSizeV5, iconSizeV5 / 2, hexToRgbaV5(v5TextMain, 0.08));
        drawMonoIcon(ctx, k, ix + iconSizeV5 / 2, iconStartY + iconSizeV5 / 2, iconSizeV5 * 0.6, v5TextMain);
      });

      // 5) Price Block (Lado a lado: Prefix/Pill + Price)
      // Base Y para alinhar tudo
      const priceBaseY = cardY + basePriceOffset - 40; // Subiu mais 15px
      
      // Right-aligned Price Value
      ctx.fillStyle = v5TextMain;
      const rightX = cardX + cardW - 40;
      ctx.textAlign = "right";
      
      // Increased price size by ~30%
      let valSize = format === "story" ? 130 : 105;
      const symSize = Math.round(valSize * 0.35);
      const curSym = (currencySymbol || "R$").trim();
      
      // Centavos pequenos
      const centsMatchV5 = valNumV5.match(/^(.+?)([,.]\d{1,2})$/);
      const mainValV5 = centsMatchV5 ? centsMatchV5[1] : valNumV5;
      const centsValV5 = centsMatchV5 ? centsMatchV5[2] : "";
      
      ctx.font = `900 ${symSize}px Inter, Arial, sans-serif`;
      const centsW = centsMatchV5 ? ctx.measureText(centsValV5).width : 0;
      
      ctx.font = `900 ${valSize}px Inter, Arial, sans-serif`;
      const mainValW = ctx.measureText(mainValV5).width;
      
      // Desenha centavos pequenos (se houver) e o valor principal
      if (centsMatchV5) {
          ctx.font = `900 ${symSize}px Inter, Arial, sans-serif`;
          ctx.fillText(centsValV5, rightX, priceBaseY - valSize * 0.45);
          ctx.font = `900 ${valSize}px Inter, Arial, sans-serif`;
          ctx.fillText(mainValV5, rightX - centsW - 5, priceBaseY);
      } else {
          ctx.font = `900 ${valSize}px Inter, Arial, sans-serif`;
          ctx.fillText(valNumV5, rightX, priceBaseY);
      }
      
      const valW = mainValW + (centsW ? centsW + 5 : 0);
      
      // Moeda R$
      ctx.font = `900 ${symSize}px Inter, Arial, sans-serif`;
      ctx.fillStyle = v5Secondary;
      const symW = ctx.measureText(curSym).width;
      ctx.fillText(curSym, rightX - valW - 15, priceBaseY - valSize * 0.35);

      const priceLeftX = rightX - valW - 15 - symW - 25;

      // Pill & Prefix to the left of the price
      const pillH = 40;
      
      // Format Pill Text properly for bugged chars
      let safePillTxt = pillTxtV5;
      if (safePillTxt === "Ã€ VISTA" || safePillTxt === "A VISTA" || safePillTxt === "? VISTA") {
          safePillTxt = "À VISTA";
      }
      
      ctx.font = "900 24px Inter, Arial, sans-serif";
      const pillW = ctx.measureText(safePillTxt).width + 24;
      
      // Resolve prefix to measure its width
      let displayPrefix = (pricePrefix || leftTopV5).toUpperCase();
      if ((paymentMode === "cash" || paymentMode === "cash_discount") && (displayPrefix === "À VISTA" || displayPrefix === "Ã€ VISTA" || displayPrefix === "? VISTA" || displayPrefix === "A VISTA")) {
         displayPrefix = ""; // don't draw duplicate "A VISTA"
      }
      ctx.font = "800 18px Inter, Arial, sans-serif";
      const prefixW = displayPrefix ? ctx.measureText(displayPrefix).width : 0;
      
      const maxLeftW = Math.max(pillW, prefixW);
      const pillLeft = priceLeftX - maxLeftW; // Align left block so it doesn't overlap right block
      
      // Desenhar Pill
      const pillY = priceBaseY - pillH - 4; // Pill base aligns near bottom of numbers
      fillRoundRect(ctx, pillLeft, pillY, pillW, pillH, 8, v5Secondary);
      ctx.fillStyle = contrastOn(v5Secondary);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "900 24px Inter, Arial, sans-serif";
      ctx.fillText(safePillTxt, pillLeft + pillW / 2, pillY + pillH / 2 + 1);
      ctx.textBaseline = "alphabetic";

      // Prefix acima da Pill
      if (displayPrefix) {
        ctx.fillStyle = hexToRgbaV5(v5TextMain, 0.6);
        ctx.font = "800 18px Inter, Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(displayPrefix, pillLeft, pillY - 10);
      }

      // Total / Suffix
      let bottomTxt = showTotal ? (totalStrV5 || bottomSuffix) : bottomSuffix;
      // Trata bug "412341231" caso ele aparea do nada (se o usuario no quer isso)
      // Actually totalStrV5 currently evaluates to Total: R$ 150 because of default behavior
      if (bottomTxt) {
          ctx.fillStyle = v5TextMain;
          ctx.font = "700 22px Inter, Arial, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(bottomTxt, rightX, priceBaseY + 34);
        }

      // Pix/Promo Badge centralizado na borda inferior do card (50% dentro, 50% fora)
        if (showPixBanner) {
          const rawPixLabel = ((pixBannerText && pixBannerText.trim()) || "10% OFF NO PIX").replace(/[⭐🌟✨]/g, '').toUpperCase();
          
          ctx.font = "900 16px Inter, Arial, sans-serif";
          const textW = ctx.measureText(rawPixLabel).width;
          
          const pixPadX = 14;
          const pixW = textW + pixPadX * 2;
          const pixH = 32;
          
          // Posiciona no centro horizontal (cxV5) e vazando metade para fora na borda inferior (cardY + cardH)
          const pixX = cxV5 - pixW / 2;
          const pixY = cardY + cardH - pixH - 20; // Banner inteiro dentro do card
          
          // Draw yellow pill
          fillRoundRect(ctx, pixX, pixY, pixW, pixH + 10, 20, v5Secondary);
          
          ctx.fillStyle = contrastOn(v5Secondary);
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(rawPixLabel, cxV5, pixY + (pixH + 10) / 2 + 1);
          ctx.textBaseline = "alphabetic";
        }

      await drawFinalBranding(
        ctx, width, height, logoDataUrl, 
        options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined), 
        options.footerContact2Icon ? { icon: options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
        effectiveTextColor,
        userFamily,
        false,
        logoFormat
      );
      return canvas.toDataURL("image/png");
    }
    return canvas.toDataURL("image/png");
  };


  // ============================================================
  // V0_Experiencia Â· LUXO & DESEJO (canvas)
  // ============================================================
  const renderV0Experiencia = async (): Promise<string> => {
    await drawProminentLogo(ctx, 40, 40, 120);
    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.5);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(0,0,0,0.60)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.30)");
    grad.addColorStop(1, "rgba(0,0,0,0.80)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    applyVignette(ctx, width, height, 0.4);

    const cx = width / 2;
    const isStory = format === "story";
    const sans = `Inter, Arial, sans-serif`;
    const serif = `'Playfair Display', Georgia, serif`;

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";

    const promo = (promoName || "EXPERIÃŠNCIA EXCLUSIVA").toUpperCase();
    ctx.font = `800 ${isStory ? 44 : 36}px ${serif}`;
    const topAnchorY = isStory ? safeTop + 20 : 150;
    ctx.fillText(promo.split("").join("\u2009"), cx, topAnchorY);

    if (titleText) {
      ctx.font = `300 ${isStory ? 28 : 22}px ${sans}`;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      safeFillText(ctx, titleText.trim(), cx, topAnchorY + 70, width - 120, 16);
    }

    const brandingSafeY = panelBottom;
    const line2Y = brandingSafeY - (isStory ? 180 : 120);
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${isStory ? 110 : 78}px ${sans}`;
    safeFillText(ctx, (destFmt || destination || "DESTINO").toUpperCase(), cx, line2Y, width - 80, 24);

    await drawFinalBranding(
      ctx,
      width,
      height,
      logoDataUrl,
      footerContact1Icon ? { icon: footerContact1Icon, value: footerContact1Value || "" } : (whatsapp ? { icon: "whatsapp_green", value: whatsapp } : undefined),
      footerContact2Icon ? { icon: footerContact2Icon, value: footerContact2Value || "" } : (instagram ? { icon: "instagram_gradient", value: instagram } : undefined),
      effectiveTextColor,
      userFamily,
      false,
      logoFormat
    );
    return canvas.toDataURL("image/png");
  };

  // ============================================================
  // V1_Experiencia Â· LUXO CINEMATOGRÃFICO (canvas)
  // ============================================================
  const renderV1Experiencia = async (): Promise<string> => {
    await drawProminentLogo(ctx, 40, 40, 120);
    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.5);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(0,0,0,0.4)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.1)");
    grad.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    applyVignette(ctx, width, height, 0.35);

    const cx = width / 2;
    const isStory = format === "story";
    const serif = `'Playfair Display', Georgia, serif`;
    const sans = `Inter, Arial, sans-serif`;

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";

    const promo = (promoName || "Experiencia Ãšnica").toUpperCase();
    ctx.font = `800 ${isStory ? 32 : 24}px ${sans}`;
    ctx.fillStyle = secondaryColor;
    const topAnchorY = isStory ? safeTop + 40 : 150;
    ctx.fillText(promo.split("").join(" "), cx, topAnchorY);

    ctx.fillStyle = "#ffffff";
    const titSize = isStory ? 120 : 90;
    ctx.font = `900 ${titSize}px ${serif}`;
    const titLines = (titleText || "").toUpperCase().split(/\s+/);
    let line1 = titLines.slice(0, Math.ceil(titLines.length / 2)).join(" ");
    let line2 = titLines.slice(Math.ceil(titLines.length / 2)).join(" ");
    
    const midY = height / 2;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 15;
    ctx.fillText(line1, cx, midY - (line2 ? titSize * 0.4 : 0));
    if (line2) ctx.fillText(line2, cx, midY + titSize * 0.7);
    ctx.shadowBlur = 0;

    await drawFinalBranding(
      ctx,
      width,
      height,
      logoDataUrl,
      footerContact1Icon ? { icon: footerContact1Icon, value: footerContact1Value || "" } : (whatsapp ? { icon: "whatsapp_green", value: whatsapp } : undefined),
      footerContact2Icon ? { icon: footerContact2Icon, value: footerContact2Value || "" } : (instagram ? { icon: "instagram_gradient", value: instagram } : undefined),
      effectiveTextColor,
      userFamily,
      false,
      logoFormat
    );
    return canvas.toDataURL("image/png");
  };

  // ============================================================
  // V2_Experiencia Â· LUXO MATERIAL (canvas)
  // ============================================================
  const renderV2Experiencia = async (): Promise<string> => {
    await drawProminentLogo(ctx, 40, 40, 120);
    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.5);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(0,0,0,0.6)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.2)");
    grad.addColorStop(1, "rgba(0,0,0,0.7)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    applyVignette(ctx, width, height, 0.3);

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
    const lines = (titleText || "").split(/\s+/);
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

    await drawFinalBranding(
      ctx,
      width,
      height,
      logoDataUrl,
      footerContact1Icon ? { icon: footerContact1Icon, value: footerContact1Value || "" } : (whatsapp ? { icon: "whatsapp_green", value: whatsapp } : undefined),
      footerContact2Icon ? { icon: footerContact2Icon, value: footerContact2Value || "" } : (instagram ? { icon: "instagram_gradient", value: instagram } : undefined),
      effectiveTextColor,
      userFamily,
      false,
      logoFormat
    );
    return canvas.toDataURL("image/png");
  };

  // ============================================================
  // V3_Experiencia Â· DARK PREMIUM (canvas)
  // ============================================================
  const renderV3Experiencia = async (): Promise<string> => {
    await drawProminentLogo(ctx, 40, 40, 120);
    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.5);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(0,0,0,0.7)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.3)");
    grad.addColorStop(1, "rgba(0,0,0,0.85)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    applyVignette(ctx, width, height, 0.45);

    const cx = width / 2;
    const isStory = format === "story";
    const serif = `'Playfair Display', Georgia, serif`;
    const sans = `Inter, Arial, sans-serif`;

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";

    const titSize = isStory ? 140 : 100;
    ctx.font = `900 ${titSize}px ${sans}`;
    safeFillText(ctx, (titleText || "").toUpperCase(), cx, height / 2, width - 80, 28);

    ctx.font = `italic 600 ${isStory ? 32 : 24}px ${serif}`;
    ctx.fillStyle = secondaryColor;
    ctx.fillText(travelPeriod || "Uma jornada inesquecÃ­vel", cx, height / 2 + (isStory ? 80 : 60));

    await drawFinalBranding(
      ctx,
      width,
      height,
      logoDataUrl,
      footerContact1Icon ? { icon: footerContact1Icon, value: footerContact1Value || "" } : (whatsapp ? { icon: "whatsapp_green", value: whatsapp } : undefined),
      footerContact2Icon ? { icon: footerContact2Icon, value: footerContact2Value || "" } : (instagram ? { icon: "instagram_gradient", value: instagram } : undefined),
      effectiveTextColor,
      userFamily,
      false,
      logoFormat
    );
    return canvas.toDataURL("image/png");
  };

  // ============================================================
  // V4_Experiencia Â· CLEAN EDITORIAL (canvas)
  // ============================================================
  const renderV4Experiencia = async (): Promise<string> => {
    await drawProminentLogo(ctx, 40, 40, 120);
    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.42);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, width * 0.7, 0);
    grad.addColorStop(0, "rgba(0,0,0,0.75)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.2)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    applyVignette(ctx, width, height, 0.3);

    const isStory = format === "story";
    const serif = `'Playfair Display', Georgia, serif`;
    const sans = `Inter, Arial, sans-serif`;

    const padLeft = isStory ? 100 : 70;
    const topY = isStory ? Math.max(380, safeTop + 40) : 180;
    
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    if (promoName) {
      ctx.fillStyle = secondaryColor;
      ctx.font = `800 ${isStory ? 28 : 22}px ${sans}`;
      safeFillText(ctx, promoName.toUpperCase(), padLeft, topY, width - padLeft - 60, 14);
    }

    ctx.fillStyle = "#ffffff";
    let titSize = isStory ? 110 : 80;
    ctx.font = `900 ${titSize}px ${serif}`;
    const words = (titleText || "").toUpperCase().split(/\s+/);
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

    await drawFinalBranding(
      ctx,
      width,
      height,
      logoDataUrl,
      footerContact1Icon ? { icon: footerContact1Icon, value: footerContact1Value || "" } : (whatsapp ? { icon: "whatsapp_green", value: whatsapp } : undefined),
      footerContact2Icon ? { icon: footerContact2Icon, value: footerContact2Value || "" } : (instagram ? { icon: "instagram_gradient", value: instagram } : undefined),
      effectiveTextColor,
      userFamily,
      false,
      logoFormat
    );
    return canvas.toDataURL("image/png");
  };


  // â”€â”€ ROTEAMENTO FINAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  try {
    if (isExperience) {
      const v = typeof forceVariant === "number" ? forceVariant : variation;
      const variant = ((v % 6) + 6) % 6; 

      if (variant === 0) return await renderV0Experiencia();
      if (variant === 1) return await renderV1Experiencia();
      if (variant === 2) return await renderV2Experiencia();
      if (variant === 3) {
        // FORÃ‡ADO: opera exclusivamente na categoria Oferta de Destino (bypassa isExperience)
        return await renderSafeSquareOffer();
      }
      if (variant === 4) return await renderV4Experiencia();
      if (variant === 5) {
        // Reutiliza o motor Aurora Premium que Ã© altamente estÃ©tico e compatÃ­vel
        return await renderSafeSquareOffer();
      }
      
      return await renderV0Experiencia();
    }

    // Fallback para Ofertas (Matriz, Gancho, etc.)
    return await renderSafeSquareOffer();
  } catch (error) {
    console.error("Ad Engine Error:", error);
    // Fallback: tenta V0 antes de desistir; se tambÃ©m falhar, propaga o erro real
    try {
      return await renderV0Experiencia();
    } catch (innerErr) {
      const baseMsg = (error as Error)?.message || String(error);
      const innerMsg = (innerErr as Error)?.message || String(innerErr);
      throw new Error(
        baseMsg.includes("carregar imagem")
          ? "NÃ£o foi possÃ­vel carregar a foto selecionada (CORS / link bloqueado). Escolha outra foto da galeria ou cole um link de imagem direta (.jpg/.png)."
          : `Falha ao compor anÃºncio: ${baseMsg} | ${innerMsg}`
      );
    }
  }
}

/**
 * Reenquadra (cover crop) uma imagem qualquer para o aspecto pedido (story 9:16 ou square 1:1).
 * Garante que a IA, que normalmente devolve em ~quadrado, fique no formato correto da rede social.
 */
}

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
        // Se ja esta no aspecto desejado (tolerÃ¢ncia de 2%), retorna como veio.
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
        if (!ctx) return reject(new Error("Canvas 2D nÃ£o suportado"));

        // COVER CROP â€” preenche toda a tela 9:16 ou 1:1 sem barras laterais brancas.
        // O prompt da IA ja instrui a concentrar o conteudo importante no miolo central
        // (entre 18% e 82% da altura, com ~10% de margem lateral), de modo que o recorte
        // lateral nÃ£o corta texto, preco nem CTA. Isso elimina o efeito "moldura branca".
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

// ==============================================================================
// ðŸ¤– TAREFA 3: O Renderizador Universal de IA (Canvas 2D para JSON DinÃ¢mico)
// ==============================================================================

export interface IAElement {
  type: "box" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderRadius?: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  content?: string;
  textAlign?: "left" | "center" | "right";
  borderColor?: string;
  borderWidth?: number;
}

export interface IALayoutSchema {
  elements: IAElement[];
}

export async function renderIAPuraLayout(
  ctx: CanvasRenderingContext2D,
  options: ComposeTravelAdOptions,
  layoutJson: IALayoutSchema
): Promise<void> {
  const isStory = options.format === "story";
  const cw = 1080;
  const ch = isStory ? 1920 : 1080;

  // Passo 1: Desenhar Foto Real (Base)
  if (options.imageUrl) {
    const bg = await loadImage(options.imageUrl);
    const scale = Math.max(cw / bg.naturalWidth, ch / bg.naturalHeight);
    const dw = bg.naturalWidth * scale;
    const dh = bg.naturalHeight * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.drawImage(bg, dx, dy, dw, dh);
  } else {
    // Fundo preto caso nÃ£o tenha foto (embora obrigatÃ³rio pela UI)
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, cw, ch);
  }

  // Passo 2: Ancoragem de base (gradiente para o branding)
  const gradY = ch * 0.5;
  const grad = ctx.createLinearGradient(0, gradY, 0, ch);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.5, "rgba(0,0,0,0.5)");
  grad.addColorStop(1, "rgba(0,0,0,0.9)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, gradY, cw, ch - gradY);

  if (layoutJson && layoutJson.elements) {
    // Passo 3: Parse do JSON MatemÃ¡tico de elementos dinÃ¢micos com Auto-Layout e Auto-Contrast
    
    // 1. PrÃ©-processamento de Auto-Layout para ajustar o tamanho dos Boxes que possuem texto interno
    for (const textEl of layoutJson.elements) {
      if (textEl.type === "text") {
        const family = textEl.fontFamily || options.fontFamily || "Inter";
        const fontSize = textEl.fontSize || 32;
        const weight = textEl.fontWeight || "bold";
        ctx.font = `${weight} ${fontSize}px "${family}"`;
        
        const text = textEl.content || "";
        const maxWidth = textEl.width || (cw - textEl.x - 40);
        
        // Simular quebra de linha para calcular a altura real ocupada pelo texto
        const words = text.split(" ");
        let line = "";
        let lineCount = 1;
        
        for (let n = 0; n < words.length; n++) {
          const word = words[n];
          const testLine = line ? `${line} ${word}` : word;
          if (ctx.measureText(testLine).width > maxWidth && n > 0) {
            line = word;
            lineCount++;
          } else {
            line = testLine;
          }
        }
        
        const lineHeight = fontSize * 1.25;
        const totalTextHeight = lineCount * lineHeight;
        
        // Procurar se esse texto estÃ¡ dentro de algum Box
        for (const boxEl of layoutJson.elements) {
          if (boxEl.type === "box") {
            const isInside = 
              textEl.x >= boxEl.x - 10 &&
              textEl.x <= boxEl.x + (boxEl.width || 0) + 10 &&
              textEl.y >= boxEl.y - 10 &&
              textEl.y <= boxEl.y + (boxEl.height || 0) + 10;
              
            if (isInside) {
              // Auto-Layout: Ajustar altura e largura do Box dinamicamente
              const verticalOffset = textEl.y - boxEl.y;
              const paddingY = Math.max(20, verticalOffset); 
              const neededHeight = verticalOffset + totalTextHeight + paddingY;
              
              if ((boxEl.height || 0) < neededHeight) {
                boxEl.height = neededHeight;
              }

              // MediÃ§Ã£o de largura real mÃ¡xima de linha
              let maxLineWidth = 0;
              let tempLine = "";
              for (let n = 0; n < words.length; n++) {
                const word = words[n];
                const testLine = tempLine ? `${tempLine} ${word}` : word;
                if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                  const wMetrics = ctx.measureText(tempLine).width;
                  if (wMetrics > maxLineWidth) maxLineWidth = wMetrics;
                  tempLine = word;
                } else {
                  tempLine = testLine;
                }
              }
              if (tempLine) {
                const wMetrics = ctx.measureText(tempLine).width;
                if (wMetrics > maxLineWidth) maxLineWidth = wMetrics;
              }
              
              const horizontalOffset = textEl.x - boxEl.x;
              const paddingX = Math.max(30, horizontalOffset);
              const neededWidth = horizontalOffset + maxLineWidth + paddingX;
              if ((boxEl.width || 0) < neededWidth) {
                boxEl.width = neededWidth;
              }
              
              // Auto-Contrast: Se a cor do texto conflitar com a cor de fundo do Box, corrige usando ensureContrast!
              if (boxEl.backgroundColor && textEl.color) {
                textEl.color = ensureContrast(textEl.color, boxEl.backgroundColor, 0.4);
              }
            }
          }
        }
      }
    }

    // 2. RenderizaÃ§Ã£o real com os tamanhos e cores ajustados pelo Auto-Layout e Auto-Contrast
    for (const el of layoutJson.elements) {
      if (el.type === "box") {
        const hasBg = !!el.backgroundColor;
        const hasBorder = !!el.borderColor;
        
        if (hasBg || !hasBorder) {
          ctx.fillStyle = el.backgroundColor || "rgba(0,0,0,0.5)";
          if (el.borderRadius) {
            fillRoundRect(ctx, el.x, el.y, el.width || 0, el.height || 0, el.borderRadius, ctx.fillStyle);
          } else {
            ctx.fillRect(el.x, el.y, el.width || 0, el.height || 0);
          }
        }
        
        if (hasBorder) {
          ctx.strokeStyle = el.borderColor!;
          ctx.lineWidth = el.borderWidth || 2;
          if (el.borderRadius) {
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(el.x, el.y, el.width || 0, el.height || 0, el.borderRadius);
            } else {
              ctx.rect(el.x, el.y, el.width || 0, el.height || 0);
            }
            ctx.stroke();
          } else {
            ctx.strokeRect(el.x, el.y, el.width || 0, el.height || 0);
          }
        }
      } else if (el.type === "text") {
        ctx.fillStyle = el.color || "#FFFFFF";
        const weight = el.fontWeight || "bold";
        const family = el.fontFamily || options.fontFamily || "Inter";
        const fontSize = el.fontSize || 32;
        ctx.font = `${weight} ${fontSize}px "${family}"`;
        const align = el.textAlign || "left";
        ctx.textAlign = align;
        ctx.textBaseline = "top";

        const text = el.content || "";
        const maxWidth = el.width || (cw - el.x - 40);
        
        const words = text.split(" ");
        let line = "";
        let currentY = el.y;
        const lineHeight = fontSize * 1.25;

        const getDrawX = (lineText: string) => {
          if (align === "center") return el.x + maxWidth / 2;
          if (align === "right") return el.x + maxWidth;
          return el.x;
        };

        for (let n = 0; n < words.length; n++) {
          const word = words[n];
          if (ctx.measureText(word).width > maxWidth) {
            if (line) {
              ctx.fillText(line, getDrawX(line), currentY);
              currentY += lineHeight;
              line = "";
            }
            let subWord = "";
            for (let charIdx = 0; charIdx < word.length; charIdx++) {
              const testCharLine = subWord + word[charIdx];
              if (ctx.measureText(testCharLine).width > maxWidth) {
                ctx.fillText(subWord, getDrawX(subWord), currentY);
                currentY += lineHeight;
                subWord = word[charIdx];
              } else {
                subWord = testCharLine;
              }
            }
            line = subWord;
          } else {
            const testLine = line ? `${line} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
              ctx.fillText(line, getDrawX(line), currentY);
              line = word;
              currentY += lineHeight;
            } else {
              line = testLine;
            }
          }
        }
        if (line) {
          ctx.fillText(line, getDrawX(line), currentY);
        }
        ctx.textAlign = "left"; // reset
      }
    }
  } else if (layoutJson && layoutJson.style) {
    const style = layoutJson.style || "A";
    const sans = options.fontFamily ? `"${options.fontFamily}", Inter, Arial, sans-serif` : `Inter, Arial, sans-serif`;
    const serif = `'Playfair Display', Georgia, serif`;
    
    if (style === "A") {
      // === Estilo A: New York Editorial ===
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Destino/TÃ­tulo em Serifa Elegante
      ctx.fillStyle = "#ffffff";
      let destFs = isStory ? 100 : 76;
      ctx.font = `900 ${destFs}px ${serif}`;
      safeFillText(ctx, (options.destination || "Destino").toUpperCase(), cw / 2, isStory ? 480 : 260, cw - 120, 24);
      
      // PÃ­lula de PreÃ§o (Fita Dourada)
      const priceText = `${options.promoName || "OFERTA ESPECIAL"} â€¢ ${options.currencySymbol || "R$"} ${options.price}`;
      ctx.font = `800 28px ${sans}`;
      const pWidth = Math.min(cw - 160, ctx.measureText(priceText).width + 60);
      const pHeight = 64;
      const pX = (cw - pWidth) / 2;
      const pY = isStory ? 580 : 350;
      fillRoundRect(ctx, pX, pY, pWidth, pHeight, pHeight / 2, options.secondaryColor || "#F59E0B");
      
      ctx.fillStyle = contrastOn(options.secondaryColor || "#F59E0B");
      ctx.font = `900 26px ${sans}`;
      safeFillText(ctx, priceText, cw / 2, pY + pHeight / 2, pWidth - 40, 14);
      
      // BotÃ£o Vazado (Stroke)
      const btnText = "VER PREÃ‡OS AGORA âž”";
      ctx.font = `800 24px ${sans}`;
      const bWidth = Math.min(cw - 200, ctx.measureText(btnText).width + 60);
      const bHeight = 60;
      const bX = (cw - bWidth) / 2;
      const bY = isStory ? 1300 : 750;
      
      ctx.strokeStyle = options.secondaryColor || "#F59E0B";
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bX, bY, bWidth, bHeight, 12);
      } else {
        ctx.rect(bX, bY, bWidth, bHeight);
      }
      ctx.stroke();
      
      ctx.fillStyle = "#ffffff";
      safeFillText(ctx, btnText, cw / 2, bY + bHeight / 2, bWidth - 40, 14);
      
    } else if (style === "B") {
      // === Estilo B: Caribe Resort ===
      const cardW = 480;
      const cardH = isStory ? 1000 : 620;
      const cardX = cw - cardW - 60;
      const cardY = isStory ? 300 : 150;
      
      fillRoundRect(ctx, cardX, cardY, cardW, cardH, 24, "rgba(255, 255, 255, 0.92)");
      
      // TÃ­tulo no topo do Card
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = options.primaryColor || "#0C2340";
      ctx.font = `800 22px ${sans}`;
      safeFillText(ctx, (options.promoName || "ALL-INCLUSIVE").toUpperCase(), cardX + 40, cardY + 40, cardW - 80, 12);
      
      // Destaques do Card
      const cardHighlights = (options.highlights || []).slice(0, 4);
      cardHighlights.forEach((hl: any, idx) => {
        const hy = cardY + 110 + idx * 80;
        const iconKey = hl.icon || "star";
        drawMonoIcon(ctx, iconKey, cardX + 50, hy + 15, 32, options.secondaryColor || "#F59E0B");
        
        let hfs = 24;
        ctx.font = `700 ${hfs}px ${sans}`;
        ctx.fillStyle = "#333333";
        ctx.textBaseline = "middle";
        safeFillText(ctx, hl.text, cardX + 100, hy + 15, cardW - 140, 14);
      });
      
      // CTA base do Card
      const btnY = cardY + cardH - 100;
      fillRoundRect(ctx, cardX + 40, btnY, cardW - 80, 60, 12, options.primaryColor || "#0C2340");
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 22px ${sans}`;
      safeFillText(ctx, "COMPARE & BOOK NOW âž”", cardX + cardW / 2, btnY + 30, cardW - 120, 12);
      
      // Grande Badge de PreÃ§o Ã  esquerda
      const badgeW = 400;
      const badgeH = 220;
      const badgeX = 60;
      const badgeY = isStory ? 500 : 250;
      fillRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 18, options.primaryColor || "#0C2340");
      
      ctx.fillStyle = options.secondaryColor || "#F59E0B";
      ctx.font = `800 24px ${sans}`;
      safeFillText(ctx, "UP TO 45% OFF", badgeX + badgeW / 2, badgeY + 45, badgeW - 40, 14);
      
      ctx.fillStyle = "#ffffff";
      let pfsB = 76;
      ctx.font = `900 ${pfsB}px ${sans}`;
      const priceStrB = `${options.currencySymbol || "R$"} ${options.price}`;
      safeFillText(ctx, priceStrB, badgeX + badgeW / 2, badgeY + 100, badgeW - 40, 24);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 20px ${sans}`;
      ctx.globalAlpha = 0.8;
      safeFillText(ctx, options.paymentSuffix || "por pessoa", badgeX + badgeW / 2, badgeY + 160, badgeW - 40, 12);
      ctx.globalAlpha = 1.0;
      
    } else if (style === "C") {
      // === Estilo C: Quiet Luxury Safari ===
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Logo / Categoria
      ctx.fillStyle = options.secondaryColor || "#F59E0B";
      ctx.font = `800 26px ${sans}`;
      safeFillText(ctx, (options.promoName || "MDLULI SAFARI LODGE").toUpperCase(), cw / 2, isStory ? 420 : 200, cw - 120, 12);
      
      // Linha Serifada Convidativa
      ctx.fillStyle = "#ffffff";
      let serifSizeC = isStory ? 76 : 56;
      ctx.font = `italic 500 ${serifSizeC}px ${serif}`;
      safeFillText(ctx, options.destination || "Every moment, unforgettable", cw / 2, isStory ? 580 : 340, cw - 160, 20);
      
      ctx.font = `italic 300 ${isStory ? 34 : 26}px ${serif}`;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      safeFillText(ctx, options.travelPeriod || "Your safari story begins here", cw / 2, isStory ? 700 : 430, cw - 160, 14);
      
    } else if (style === "D") {
      // === Estilo D: Jaecoo/Jeep Premium ===
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${isStory ? 80 : 64}px ${sans}`;
      safeFillText(ctx, (options.destination || "DESTINO").toUpperCase(), cw / 2, isStory ? 320 : 160, cw - 120, 24);
      
      // Bloco de impacto na base
      const blockW = 1000;
      const blockH = isStory ? 480 : 300;
      const blockX = 40;
      const blockY = isStory ? 1200 : 660;
      
      fillRoundRect(ctx, blockX, blockY, blockW, blockH, 24, "rgba(0,0,0,0.85)");
      
      // Destaque inclinado
      const badgeW = 280;
      const badgeH = 56;
      fillRoundRect(ctx, blockX + 40, blockY + 40, badgeW, badgeH, 8, options.secondaryColor || "#F59E0B");
      ctx.fillStyle = contrastOn(options.secondaryColor || "#F59E0B");
      ctx.font = `900 24px ${sans}`;
      safeFillText(ctx, options.promoName || "Ã‰ ISSO MESMO", blockX + 40 + badgeW / 2, blockY + 40 + badgeH / 2, badgeW - 20, 12);
      
      // Detalhes / BenefÃ­cios
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${isStory ? 40 : 32}px ${sans}`;
      const descTextD = `${options.installments || "12X"} R$ ${options.price} ${options.paymentSuffix || ""}`;
      safeFillText(ctx, descTextD, blockX + 40, blockY + 140, blockW - 80, 16);
      
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = `700 24px ${sans}`;
      const bulletD = (options.highlights || []).map((h: any) => h.text || h).join(" â€¢ ");
      safeFillText(ctx, bulletD || "Emplacamento e insulfilm grÃ¡tis", blockX + 40, blockY + 220, blockW - 80, 14);
      
    } else if (style === "E") {
      // === Estilo E: Circuito Central Card ===
      const cardW = 920;
      const cardH = isStory ? 880 : 620;
      const cardX = (cw - cardW) / 2;
      const cardY = isStory ? 250 : 120;
      
      fillRoundRect(ctx, cardX, cardY, cardW, cardH, 40, options.primaryColor || "#0000D8");
      
      // TÃ­tulo do Pacote
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${isStory ? 64 : 52}px ${sans}`;
      safeFillText(ctx, (options.destination || "CIRCUITO PORTUGAL").toUpperCase(), cw / 2, cardY + 100, cardW - 80, 24);
      
      // DuraÃ§Ã£o / PerÃ­odo
      ctx.fillStyle = options.secondaryColor || "#F59E0B";
      ctx.font = `800 28px ${sans}`;
      safeFillText(ctx, options.travelPeriod || "5 dias | Roteiro Completo", cw / 2, cardY + 200, cardW - 80, 14);
      
      // Grupo de PreÃ§o
      ctx.fillStyle = "#ffffff";
      ctx.font = `600 24px ${sans}`;
      safeFillText(ctx, options.pricePrefix || "a partir de", cardX + 160, cardY + 310, 260, 12);
      
      // PÃ­lula 12X
      const pillTxt = options.installments || "12X";
      fillRoundRect(ctx, cardX + 60, cardY + 340, 200, 52, 10, options.secondaryColor || "#F59E0B");
      ctx.fillStyle = contrastOn(options.secondaryColor || "#F59E0B");
      ctx.font = `900 28px ${sans}`;
      safeFillText(ctx, pillTxt, cardX + 160, cardY + 366, 180, 12);
      
      // Valor
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${isStory ? 150 : 110}px ${sans}`;
      safeFillText(ctx, options.price, cardX + cardW - 60, cardY + 350, 480, 48);
      
      // Moeda
      ctx.font = `900 42px ${sans}`;
      safeFillText(ctx, options.currencySymbol || "R$", cardX + cardW - 60 - ctx.measureText(options.price).width - 20, cardY + 340, 120, 20);
      
      // Banner do Pix
      const pixY = cardY + cardH - 120;
      fillRoundRect(ctx, cardX + 60, pixY, cardW - 120, 72, 36, options.secondaryColor || "#F59E0B");
      ctx.fillStyle = contrastOn(options.secondaryColor || "#F59E0B");
      ctx.textAlign = "center";
      ctx.font = `900 24px ${sans}`;
      safeFillText(ctx, options.pixBannerText || "5% OFF Ã€ VISTA NO Pix", cw / 2, pixY + 36, cardW - 180, 12);
      
    } else if (style === "F") {
      // === Estilo F: Vertical Sidebar ===
      const sideW = isStory ? 200 : 150;
      fillRoundRect(ctx, 0, 0, sideW, ch, 0, options.secondaryColor || "#F59E0B");
      
      // Texto Vertical
      ctx.save();
      ctx.translate(sideW / 2, ch / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = contrastOn(options.secondaryColor || "#F59E0B");
      ctx.font = `900 36px ${sans}`;
      safeFillText(ctx, (options.destination || "CRUZEIROS").toUpperCase(), 0, 0, ch - 200, 18);
      ctx.restore();
      
      // ConteÃºdo flutuante na direita
      const cX = sideW + (cw - sideW) / 2;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Tag
      fillRoundRect(ctx, sideW + 60, isStory ? 350 : 200, cw - sideW - 120, 60, 30, options.primaryColor || "#0C2340");
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 20px ${sans}`;
      safeFillText(ctx, options.promoName || "Sua prÃ³xima viagem comeÃ§a aqui", cX, isStory ? 380 : 230, cw - sideW - 180, 12);
      
      // TÃ­tulo
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${isStory ? 80 : 64}px ${sans}`;
      safeFillText(ctx, options.destination || "Cruzeiros", cX, isStory ? 520 : 340, cw - sideW - 100, 24);
      
      // Card Parcelamento
      const cardY = isStory ? 700 : 480;
      const cardW = 380;
      const cardH = 140;
      fillRoundRect(ctx, cX - cardW / 2, cardY, cardW, cardH, 20, options.primaryColor || "#0C2340");
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 22px ${sans}`;
      safeFillText(ctx, `EM ATÃ‰ ${options.installments || "12X"}`, cX, cardY + 40, cardW - 40, 12);
      ctx.fillStyle = options.secondaryColor || "#F59E0B";
      ctx.font = `900 32px ${sans}`;
      safeFillText(ctx, `R$ ${options.price}`, cX, cardY + 96, cardW - 40, 14);
      
    } else if (style === "G") {
      // === Estilo G: Column Split ===
      const colW = isStory ? 440 : 380;
      fillRoundRect(ctx, 0, 0, colW, ch, 0, options.primaryColor || "#0C2340");
      
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      
      // TÃ­tulo da Marca
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 32px ${sans}`;
      safeFillText(ctx, options.promoName || "VIAGEM PREMIUM", 40, isStory ? 120 : 60, colW - 80, 14);
      
      // TÃ­tulo / Destino
      let destFsG = isStory ? 56 : 42;
      ctx.font = `900 ${destFsG}px ${sans}`;
      ctx.fillStyle = options.secondaryColor || "#F59E0B";
      safeFillText(ctx, options.destination || "Combo 3 Praias", 40, isStory ? 200 : 120, colW - 80, 20);
      
      // Bullets com Checkmark
      const bulletsG = (options.highlights || []).slice(0, 5);
      bulletsG.forEach((b: any, idx) => {
        const by = (isStory ? 340 : 210) + idx * 72;
        drawMonoIcon(ctx, "check", 50, by + 12, 28, "#16a34a");
        
        ctx.fillStyle = "#ffffff";
        ctx.font = `700 22px ${sans}`;
        ctx.textBaseline = "middle";
        safeFillText(ctx, b.text || b, 90, by + 12, colW - 130, 12);
      });
      
      // Bloco de PreÃ§o na base
      const priceY = isStory ? 1250 : 700;
      fillRoundRect(ctx, 30, priceY, colW - 60, 200, 20, "rgba(255,255,255,0.12)");
      
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = options.secondaryColor || "#F59E0B";
      ctx.font = `800 20px ${sans}`;
      safeFillText(ctx, options.pricePrefix || "DE R$ 670 POR", colW / 2, priceY + 36, colW - 100, 12);
      
      ctx.fillStyle = "#ffffff";
      let pfsG = 56;
      ctx.font = `900 ${pfsG}px ${sans}`;
      const priceStrG = `${options.currencySymbol || "R$"} ${options.price}`;
      safeFillText(ctx, priceStrG, colW / 2, priceY + 100, colW - 100, 20);
      
      ctx.font = `700 18px ${sans}`;
      ctx.fillStyle = options.secondaryColor || "#F59E0B";
      safeFillText(ctx, options.paymentSuffix || "APENAS HOJE", colW / 2, priceY + 160, colW - 100, 12);
      
    } else if (style === "H") {
      // === Estilo H: Header & Bottom Card ===
      const headW = 960;
      const headH = 88;
      const headX = (cw - headW) / 2;
      const headY = isStory ? 120 : 60;
      fillRoundRect(ctx, headX, headY, headW, headH, headH / 2, options.primaryColor || "#0C2340");
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 24px ${sans}`;
      safeFillText(ctx, options.promoName || "EXCLUSIVO NAS LOJAS DECOLAR", cw / 2, headY + headH / 2, headW - 60, 12);
      
      // Card Inferior
      const cardW = 1000;
      const cardH = isStory ? 520 : 320;
      const cardX = 40;
      const cardY = isStory ? 1220 : 660;
      fillRoundRect(ctx, cardX, cardY, cardW, cardH, 32, options.primaryColor || "#0C2340");
      
      // TÃ­tulo / Destino
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${isStory ? 48 : 38}px ${sans}`;
      safeFillText(ctx, (options.destination || "CANCÃšN").toUpperCase(), cardX + 60, cardY + 50, cardW - 120, 18);
      
      // PreÃ§o
      const subCardW = 440;
      const subCardH = isStory ? 300 : 160;
      const subCardY = cardY + 140;
      fillRoundRect(ctx, cardX + 40, subCardY, subCardW, subCardH, 20, "rgba(0,0,0,0.32)");
      
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = `700 18px ${sans}`;
      safeFillText(ctx, options.paymentLabel || "SEM JUROS", cardX + 70, subCardY + 36, subCardW - 60, 12);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 48px ${sans}`;
      safeFillText(ctx, `${options.installments || "12X"} R$ ${options.price}`, cardX + 70, subCardY + 100, subCardW - 60, 20);
      
      // Detalhes da viagem
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 26px ${sans}`;
      safeFillText(ctx, "Voo + Hotel", cardX + cardW - 60, subCardY + 36, 400, 14);
    }
  }

  // Passo 4: OBRIGATÃ“RIO (Branding Final & SeguranÃ§as - isIAPura = true para isolar rodapÃ©)
  await drawFinalBranding(
    ctx,
    cw,
    ch,
    options.logoDataUrl,
    { icon: options.footerContact1Icon || "none", value: options.footerContact1Value || "" },
    { icon: options.footerContact2Icon || "none", value: options.footerContact2Value || "" },
    options.textColorOverride,
    options.fontFamily || "Inter",
    false,
    options.logoFormat || "circle",
    true
  );
}



