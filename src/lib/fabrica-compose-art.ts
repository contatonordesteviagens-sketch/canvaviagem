
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
  const panelBottom = isIAPura ? (ch - 20) : (isStory ? ch - 150 : ch - 40);
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
  kind: IconKey,
  cx: number,
  cy: number,
  size: number,
  color: string,
) {
  ctx.save();
  const s = size / 24;
  ctx.translate(cx - 12 * s, cy - 12 * s);
  ctx.scale(s, s);
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const paths: Record<string, string[]> = {
    check: ["M20 6 9 17l-5-5"],
    bus: [
      "M4 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2",
      "M15 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2",
      "M4 11v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6",
      "M4 11V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v5",
      "M4 11h16",
      "M8 15h.01", "M16 15h.01"
    ],
    hotel: [
      "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18",
      "M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4",
      "M10 10h.01", "M14 10h.01", "M10 14h.01", "M14 14h.01",
      "M2 22h20"
    ],
    plane: [
      "M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 3-4 4-3-1-1 1 4 4 1-1-1-3 4-4 3 6 1.2-.7.6-1.1c.4-.2.7-.6.6-1.1z"
    ],
    ship: [
      "M2 21c.6.5 1.2 1 2.5 1 1.3 0 1.9-.5 2.5-1 .6-.5 1.2-1 2.5-1 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 1.3 0 1.9-.5 2.5-1 .6-.5 1.2-1 2.5-1 1.3 0 1.9.5 2.5 1",
      "M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76",
      "M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6",
      "M12 10v4"
    ],
    palm: [
      "M12 22V10",
      "M12 10a10 10 0 0 0-8 6",
      "M12 10a10 10 0 0 1 8 6",
      "M12 10a8 8 0 0 0-6-8",
      "M12 10a8 8 0 0 1 6-8"
    ],
    sun: [
      "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      "M12 2v2", "M12 20v2", "M5 5l1.5 1.5", "M17.5 17.5L19 19",
      "M2 12h2", "M20 12h2", "M5 19l1.5-1.5", "M17.5 6.5L19 5"
    ],
    food: [
      "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2",
      "M7 2v20",
      "M21 2l-6 6v14h4z"
    ],
    coffee: [
      "M18 8h1a4 4 0 0 1 0 8h-1",
      "M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z",
      "M6 1v3", "M10 1v3", "M14 1v3"
    ],
    map: [
      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z",
      "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
    ],
    camera: [
      "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z",
      "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
    ],
    star: [
      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    ],
    heart: [
      "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    ],
    guide: [
      "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      "M5 22v-2c0-2.2 1.8-4 4-4h6c2.2 0 4 1.8 4 4v2"
    ],
    user: [
      "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      "M5 22v-2c0-2.2 1.8-4 4-4h6c2.2 0 4 1.8 4 4v2"
    ],
    wifi: [
      "M5 12.55a11 11 0 0 1 14.08 0",
      "M1.42 9a16 16 0 0 1 21.16 0",
      "M8.53 16.11a6 6 0 0 1 6.95 0",
      "M12 20h.01"
    ]
  };

  const p = paths[kind] || paths['check'];
  p.forEach(d => {
    ctx.stroke(new Path2D(d));
  });

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
          const stripeY = boxY + boxH - 85;
          const stripeX = boxX + 40;
          const stripeW = boxW - 80;
          const stripeH = 64;
          fillRoundRect(ctx, stripeX, stripeY, stripeW, stripeH, 16, navyRaw);
          ctx.fillStyle = contrastOn(navyRaw);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "900 24px Inter, Arial, sans-serif";
          
          const pixText = `${descN}% OFF A VISTA NO`;
          const pixTextW = ctx.measureText(pixText).width;
          const pixIconSize = 32;
          const pixGap = 10;
          ctx.font = "800 24px Inter, Arial, sans-serif";
          const pixLabelW = ctx.measureText("pix").width;
          
          const pillPad = 8;
          const pillW = pixIconSize + pixGap + pixLabelW + pillPad * 2;
          const pillH = stripeH - 16;
          const totalPixW = pixTextW + pixGap + pillW;
          const pixStartX = stripeX + (stripeW - totalPixW) / 2;
          
          ctx.textAlign = "left";
          ctx.fillText(pixText, pixStartX, stripeY + stripeH / 2);
          const pillX = pixStartX + pixTextW + pixGap;
          const pillY = stripeY + (stripeH - pillH) / 2;
          fillRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, "#ffffff");
          
          const pxCx = pillX + pillPad + pixIconSize / 2;
          const pxCy = stripeY + stripeH / 2;
          drawPixLogo(ctx, pxCx, pxCy, pixIconSize, "#32BCAD");
          
          ctx.fillStyle = "#32BCAD";
          ctx.font = "900 24px Inter, Arial, sans-serif";
          ctx.fillText("pix", pillX + pillPad + pixIconSize + pixGap, stripeY + stripeH / 2);
          ctx.textBaseline = "alphabetic";
        }

        // VÃ©u Gradiente Escuro do rodapÃ©
        await drawFinalBranding(
          ctx,
          width,
          height,
          logoDataUrl,
          options.footerContact1Icon ? { icon: options.footerContact1Icon.startsWith("whatsapp") ? "whatsapp_green" : options.footerContact1Icon, value: options.footerContact1Value || "" } : (whatsapp ? { icon: "whatsapp_green", value: whatsapp } : undefined),
          options.footerContact2Icon ? { icon: options.footerContact2Icon.startsWith("whatsapp") ? "whatsapp_green" : options.footerContact2Icon, value: options.footerContact2Value || "" } : (instagram ? { icon: "instagram_gradient", value: instagram } : undefined),
          effectiveTextColor,
          userFamily,
          false
        );
        return canvas.toDataURL("image/png");
      } else {
        // [BG] Foto do destino cobrindo todo o canvas (primeira coisa a desenhar)
        const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.45);
        // Bypassed logo (drawProminentLogo called after drawImage is complete)

        // â”€â”€ Cores do V3 (box CVC) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // yellow  = cor secundÃ¡ria do usuÃ¡rio (fundo do box)
        // navy    = cor primÃ¡ria do usuÃ¡rio   (texto/anel dentro do box)
        // navyRaw = primaryColor normalizado  (para a faixa Pix)
        const yellow = secondaryColor || "#FCD34D";
        const yellowDark = shadeColor(yellow, -12);
        const navy = getSafeColor(yellow, primaryColor);
        const navyRaw = primaryColor || "#0c2340";

        ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);
        await drawProminentLogo(ctx, 40, 40, 120);

        // â”€â”€ Dados dinÃ¢micos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const destinoUp = (destination || "DESTINO").toUpperCase();
        const daysItem = highlights.find((h) => /\d+\s*dia/i.test(h?.text || ""));
        const daysText = (travelPeriod && travelPeriod.trim()) || (daysItem?.text || "").trim();
        // Ãcones: usa APENAS os selecionados pelo usuario (sem merge com defaults).
        // Se nenhum highlight tiver Ã­cone, usa um conjunto padrÃ£o mÃ­nimo.
        const iconList = (() => {
          const fromHl = highlights
            .map((h) => h?.icon)
            .filter((k) => !!k);
          if (fromHl.length === 0) {
            return ["plane", "hotel", "coffee", "camera"];
          }
          // dedup preservando ordem do usuario, maximo 5
          const seen = new Set();
          const out = [];
          for (const k of fromHl) {
            if (!seen.has(k)) {
              seen.add(k);
              out.push(k);
              if (out.length >= 5) break;
            }
          }
          return out;
        })();

        // Parcelas: extrai nÃºmero de "12x", "12 x", "12" etc.
        const instMatch = (installments || "12x").match(/(\d{1,2})\s*x?/i);
        const parcN = instMatch ? instMatch[1] : "12";
        const priceStr = mainPrice || `${curSym} ${price}`;
        // Calcula total = preco Ã— parcelas (se parcelado), formatando milhares com "." e centavos com ","
        const priceNumeric = parseFloat(((price || "").trim()).replace(/\./g, "").replace(",", "."));
        const totalMultiplier = (paymentMode === "cash" || paymentMode === "cash_discount") ? 1 : parseInt(parcN, 10);
        const totalNum = !isNaN(priceNumeric) ? priceNumeric * totalMultiplier : NaN;
        // Se preco nÃ£o tem centavos (inteiro), o total tambem nÃ£o tera.
        const priceHasDecimals = /[.,]\d{1,2}\s*$/.test((price || "").trim());
        const fmtBR = (n) => {
          const showDec = priceHasDecimals && n % 1 !== 0;
          return n.toLocaleString("pt-BR", {
            minimumFractionDigits: showDec ? 2 : 0,
            maximumFractionDigits: showDec ? 2 : 0,
          });
        };
        // Total: prioriza override do usuario; senÃ£o calcula automatico com sufixo
        const computedTotal = !isNaN(totalNum)
          ? `Total ${(paymentSuffix || "por pessoa").trim()}: ${curSym} ${fmtBR(totalNum)}`
          : "";
        const totalStr = (totalOverride && totalOverride.trim()) || computedTotal;
        // Desconto: extrai nÃºmero do promoName (ex.: "5% OFF") ou usa 5 como default
        const descMatch = (promoName || "").match(/(\d{1,2})\s*%/);
        const descN = descMatch ? descMatch[1] : "5";

        // â”€â”€ [BOX] amarelo arredondado â”€ â”€â”€â”€â”€â”€
        const boxX = (width - Math.round(width * 0.68)) / 2;
        const boxW = Math.round(width * 0.68); // Ajustado de 0.72 para 0.68 para ser menos "largo"
        const boxR = 36;
        const padTop = 36;
        const titleH = 50; const titleGap = 12;
        const destH = 60; const destGap = 18;
        const infoH = 42; const infoGap = 22;
        const priceBlockH = 160; 
        const totalH = (showTotal && totalStr) ? 36 : 0;
        const totalGap = totalH ? 14 : 0;
        const stripeH = 64;
        const stripeGap = showPixBanner ? 22 : 0;
        const padBottom = 36;

        const boxH = padTop + titleH + titleGap + destH + destGap + infoH + infoGap + priceBlockH + totalGap + totalH + (showPixBanner ? stripeGap + stripeH : 0) + padBottom;
        const safeBoxY = 180;

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 28; ctx.shadowOffsetY = 8;
        fillRoundRect(ctx, boxX, safeBoxY, boxW, boxH, boxR, yellow);
        ctx.restore();

        const cx = boxX + boxW / 2;
        let cursorY = safeBoxY + padTop + 32;
        ctx.fillStyle = navy; ctx.textAlign = "center"; ctx.font = "900 44px Inter, Arial, sans-serif";
        ctx.fillText("PACOTE", cx, cursorY);
        cursorY += titleGap + 48;

        ctx.font = "500 56px Inter, Arial, sans-serif";
        let destSize = 56;
        while (ctx.measureText(destinoUp).width > boxW - 80 && destSize > 32) {
          destSize -= 2; ctx.font = `500 ${destSize}px Inter, Arial, sans-serif`;
        }
        safeFillText(ctx, destinoUp, cx, cursorY, boxW - 80, 24);
        cursorY += destGap + 36;

        let benefitsFontSize = 36; ctx.font = `700 ${benefitsFontSize}px Inter, Arial, sans-serif`;
        let daysW = 0;
        if (daysText && daysText.trim()) {
          while (ctx.measureText(daysText).width > boxW * 0.45 && benefitsFontSize > 20) {
            benefitsFontSize -= 2; ctx.font = `700 ${benefitsFontSize}px Inter, Arial, sans-serif`;
          }
          daysW = ctx.measureText(daysText).width;
        }
        const sepGap = 18; const iconSize = Math.round(benefitsFontSize * 1.8); const iconGap = 18;
        const iconsTotal = iconList.length * iconSize + Math.max(0, iconList.length - 1) * iconGap;
        
        const hasDays = !!(daysText && daysText.trim());
        const sepW = hasDays ? 4 : 0;
        const actualGap = hasDays ? sepGap : 0;
        const infoTotalW = (hasDays ? daysW + actualGap : 0) + sepW + (hasDays ? actualGap : 0) + iconsTotal;
        
        let infoX = cx - infoTotalW / 2;
        ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = navy;
        
        if (hasDays) {
          safeFillText(ctx, daysText, infoX, cursorY, boxW * 0.5, 14);
          infoX += daysW + actualGap;
          ctx.fillRect(infoX, cursorY - 18, sepW, 36);
          infoX += sepW + actualGap;
        }
        iconList.forEach((k, i) => {
          drawMonoIcon(ctx, k, infoX + i * (iconSize + iconGap) + iconSize / 2, cursorY, iconSize, navy);
        });
        ctx.textBaseline = "alphabetic"; cursorY += 55;
        const ringX = boxX + 30;
        const ringY = cursorY;
        const ringW = boxW - 60;
        const ringH = priceBlockH - 8;
        ctx.save();
        ctx.fillStyle = yellowDark;
        roundRect(ctx, ringX, ringY, ringW, ringH, 24);
        ctx.fill();
        ctx.restore();

        const priceBlockY = ringY + 30;

        // Quebra "R$ 229" em simbolo pequeno + valor gigante
        const priceParts = priceStr.match(/^(\D+)\s*([\d.,]+)$/);
        const sym = priceParts ? priceParts[1].trim() : curSym;
        const valNum = priceParts ? priceParts[2].trim() : priceStr;

        const isCash = paymentMode === "cash" || paymentMode === "cash_discount";
        const isDownPlus = paymentMode === "down_plus";
        
        const topTxt = isCash ? "pagamento" : (isDownPlus ? "entrada +" : (pricePrefix !== undefined ? pricePrefix : "a partir de"));
        let mainTxt = `${parcN}X`;
        if (isCash) mainTxt = "A VISTA";
        else if (isDownPlus) {
          const clean = (installments || paymentLabel || "Entrada + 10x").replace(/entrada\s*\+?/i, "").trim();
          mainTxt = clean || `${parcN}X`;
        }
        const btmTxt = isCash ? (paymentSuffix || "por pessoa").trim() : (isDownPlus ? "parcelas" : "sem juros");

        // Tamanhos das fontes mais refinados para nÃ£o dominar (Task: centralizar e diminuir)
        let pTxtSize = isCash ? 32 : 46; 
        ctx.font = `900 ${pTxtSize}px Inter, Arial, sans-serif`;
        const mainTxtW = ctx.measureText(mainTxt).width;
        
        ctx.font = "600 18px Inter, Arial, sans-serif";
        const topTxtW = ctx.measureText(topTxt).width;
        const btmTxtW = ctx.measureText(btmTxt).width;
        
        const leftColW = Math.max(mainTxtW, topTxtW, btmTxtW);

        // Lado direito (preÃ§o)
        let priceSize = 110;
        ctx.font = `900 ${priceSize}px Inter, Arial, sans-serif`;
        let valW = ctx.measureText(valNum).width;
        
        // Se o valor for muito grande, reduz um pouco
        while (valW > ringW * 0.45 && priceSize > 48) {
           priceSize -= 4;
           ctx.font = `900 ${priceSize}px Inter, Arial, sans-serif`;
           valW = ctx.measureText(valNum).width;
        }
        
        const symSize = Math.round(priceSize * 0.36);
        ctx.font = `900 ${symSize}px Inter, Arial, sans-serif`;
        const symW = ctx.measureText(sym).width;
        const rightColW = symW + 12 + valW;

        // Layout Centralizado
        const midGap = 32;
        const totalW = leftColW + midGap + rightColW;
        const startX = ringX + (ringW - totalW) / 2;
        
        const leftColX = startX;
        const rightColX = startX + leftColW + midGap;

        // Desenhar Lado Esquerdo centralizado em si mesmo para harmonizar
        ctx.textAlign = "center";
        ctx.fillStyle = navy;
        const leftColCx = leftColX + leftColW / 2;
        
        ctx.font = "600 18px Inter, Arial, sans-serif";
        ctx.fillText(topTxt, leftColCx, priceBlockY - 2);
        
        ctx.font = `900 ${pTxtSize}px Inter, Arial, sans-serif`;
        ctx.fillText(mainTxt, leftColCx, priceBlockY + 36);
        
        ctx.font = "600 18px Inter, Arial, sans-serif";
        ctx.fillText(btmTxt, leftColCx, priceBlockY + 68);

        // Desenhar Lado Direito (alinhado pela baseline de mainTxt)
        // Baseline de mainTxt Ã© priceBlockY + 36. O valor gigante centraliza visualmente com isso
        const priceBaseY = priceBlockY + 60; 
        
        ctx.textAlign = "left";
        ctx.font = `900 ${symSize}px Inter, Arial, sans-serif`;
        ctx.fillText(sym, rightColX, priceBaseY - priceSize * 0.45);
        
        ctx.font = `900 ${priceSize}px Inter, Arial, sans-serif`;
        ctx.fillText(valNum, rightColX + symW + 12, priceBaseY);

        cursorY = ringY + ringH + totalGap;

        // [TOTAL] rodape do box (apenas se showTotal)
        if (totalH > 0) {
          ctx.textAlign = "center";
          ctx.font = "600 22px Inter, Arial, sans-serif";
          ctx.fillStyle = navy;
          ctx.fillText(totalStr, cx, cursorY + 22);
          cursorY += totalH;
        }

        // [PROMO] faixa horizontal com texto Pix (opcional)
        // Fundo da faixa = primaryColor (navy padrÃ£o). Texto sempre com contraste.
        if (showPixBanner) {
          const stripeY = safeBoxY + boxH - stripeH - 24;
          const stripeX = boxX + 40;
          const stripeW = boxW - 80;
          const stripeBg = navyRaw; // mantem a cor escolhida pelo usuario p/ a faixa
          const stripeFg = contrastOn(stripeBg); // texto preto/branco automatico
          fillRoundRect(ctx, stripeX, stripeY, stripeW, stripeH, 16, stripeBg);
          ctx.fillStyle = stripeFg;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "900 26px Inter, Arial, sans-serif";

          const customBanner = (pixBannerText || "").trim();
          if (customBanner) {
            ctx.fillText(customBanner, stripeX + stripeW / 2, stripeY + stripeH / 2 + 1);
          } else {
            // "{N}% OFF A VISTA NO  [pix]"
            const pixText = `${descN}% OFF A VISTA NO`;
            const pixTextW = ctx.measureText(pixText).width;
            const pixIconSize = 36;
            const pixGap = 12;
            ctx.font = "800 28px Inter, Arial, sans-serif";
            const pixLabelW = ctx.measureText("pix").width;
            ctx.font = "900 26px Inter, Arial, sans-serif";
            // pÃ­lula branca atras do logo+pix p/ garantir visibilidade da marca Pix
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
          options.footerContact1Icon ? { icon: options.footerContact1Icon.startsWith("whatsapp") ? "whatsapp_green" : options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined), 
          options.footerContact2Icon ? { icon: options.footerContact2Icon.startsWith("whatsapp") ? "whatsapp_green" : options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
          effectiveTextColor,
          userFamily,
          false
        );
        return canvas.toDataURL("image/png");
      }
    }

    const logoH = hasLogo ? 130 : 0;
    const destUp = (destination || "DESTINO").toUpperCase();

    if (variant === 0) {
      // REGRA GLOBAL DE LEGIBILIDADE: texto sempre tem que destacar do fundo.
      // Painel = secondaryColor â†’ texto principal = primaryColor com contraste garantido.
      // Badge  = primaryColor   â†’ texto da badge = secondaryColor com contraste garantido.
      const v0PanelBg = secondaryColor;
      const v0OnPanel = getSafeColor(v0PanelBg, primaryColor);
      const v0BadgeBg = primaryColor;
      const v0OnBadge = ensureContrast(secondaryColor, v0BadgeBg, 0.35);

      // 1) Calcula tamanho do tÃ­tulo para saber a altura real
      ctx.textAlign = "left";
      let titleSize = 78;
      ctx.font = `900 ${titleSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(titleText).width > contentWidth && titleSize > 38) {
        titleSize -= 4;
        ctx.font = `900 ${titleSize}px Inter, Arial, sans-serif`;
      }

      let benefitsList = highlights.filter((h) => h?.text && h.text.trim().length > 0);
      if (travelPeriod && travelPeriod.trim()) {
        const tp = travelPeriod.trim();
        benefitsList = benefitsList.filter(b => b.text.toLowerCase() !== tp.toLowerCase());
        benefitsList.unshift({ text: tp, icon: "calendar" as IconKey });
      }
      benefitsList = benefitsList.slice(0, 6);
      const benefitsCount = Math.max(1, benefitsList.length);
      const benefitLineH = benefitsCount <= 4 ? 44 : benefitsCount === 5 ? 38 : 34;
      const benefitsBlockH = benefitsCount * benefitLineH;

      // 3) Altura do bloco preÃ§o (fixa, ~120px)
      const priceBlockH = 120;
      const contentRowH = Math.max(benefitsBlockH, priceBlockH);

      // 4) Altura ADAPTATIVA do painel:
      const badgeH = 60;
      const topPaddingBeforeTitle = 40;
      const titleToContent = 50;
      const bottomPadding = 50;
      const safeAnchorY = isStory ? safeTop : (logoH + 28);
      
      const topH = Math.min(
        Math.round(height * 0.62),
        Math.max(
          Math.round(height * 0.46),
          safeAnchorY + badgeH + topPaddingBeforeTitle + titleSize + titleToContent + contentRowH + bottomPadding
        )
      );

      // 5) Pinta painel
      ctx.fillStyle = v0PanelBg;
      ctx.fillRect(0, 0, width, topH);

      // 6) Badge "Saindo de"
      const badgeY = safeAnchorY;
      if (city && city.trim() !== '' && city.trim().toLowerCase() !== 'fortaleza') {
        fillRoundRect(ctx, left, badgeY, 500, badgeH, 8, v0BadgeBg);
        ctx.fillStyle = v0OnBadge;
        ctx.font = "800 26px Inter, Arial, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(`Saindo de ${cityFmt}`, left + 20, badgeY + badgeH / 2);
        ctx.textBaseline = "alphabetic";
      }

      // 7) Headline (1 linha, fonte adaptativa)
      ctx.fillStyle = v0OnPanel;
      ctx.font = `900 ${titleSize}px Inter, Arial, sans-serif`;
      const titleY = Math.max(badgeY + badgeH + topPaddingBeforeTitle + titleSize, safeAnchorY + 12 + titleSize);
      safeFillText(ctx, titleText, left, titleY, width - left - 40, 22);

      // 8) Benefits + PreÃ§o lado a lado â€” preÃ§o ALINHADO Ã€ DIREITA pra eliminar
      //    o espaÃ§o em branco que sobrava no canto direito.
      const rowTopY = titleY + titleToContent;
      const benefitsX = left;
      // Largura do bloco de preÃ§o: ~46% da contentWidth, mÃ­nimo 380px
      const priceBlockW = Math.max(380, Math.round(contentWidth * 0.46));
      const priceX = width - 60 - priceBlockW; // encosta no padding direito
      const benefitsMaxW = priceX - 24 - benefitsX;

      ctx.fillStyle = v0OnPanel;
      const iconSize0 = 28;
      const iconTextGap = 42; // espaÃ§o reservado para o Ã­cone + margem
      benefitsList.forEach((b, i) => {
        const iconKey = (b.icon as IconKey) || (["bus", "map", "guide", "star"][i] as IconKey) || "check";
        const lineY = rowTopY + 28 + i * benefitLineH;
        // Desenha Ã­cone grÃ¡fico
        drawMonoIcon(ctx, iconKey, benefitsX + iconSize0 / 2, lineY - iconSize0 * 0.25, iconSize0, v0OnPanel);
        // Texto ao lado do Ã­cone, com auto-shrink
        let bfs = 26;
        ctx.font = `700 ${bfs}px Inter, Arial, sans-serif`;
        const textMaxW = benefitsMaxW - iconTextGap;
        while (ctx.measureText(b.text).width > textMaxW && bfs > 16) {
          bfs -= 2;
          ctx.font = `700 ${bfs}px Inter, Arial, sans-serif`;
        }
        ctx.textBaseline = "middle";
        safeFillText(ctx, b.text, benefitsX + iconTextGap, lineY - benefitLineH * 0.1, textMaxW, 14);
        ctx.textBaseline = "alphabetic";
      });

      // Divisor vertical
      ctx.fillStyle = v0OnPanel; ctx.globalAlpha = 0.2;
      ctx.fillRect(priceX - 24, rowTopY, 2, contentRowH);
      ctx.globalAlpha = 1;

      // PreÃ§o â€” agora CENTRALIZADO dentro do bloco direito
      const priceCenterX = priceX + priceBlockW / 2;
      ctx.textAlign = "center";
      ctx.fillStyle = v0OnPanel; ctx.font = "600 22px Inter, Arial, sans-serif";
      safeFillText(ctx, (topLabel || "por apenas").toString(), priceCenterX, rowTopY + 28, priceBlockW - 20, 14);
      const priceStr = mainPrice || `${curSym} ${price}`;
      // Auto-shrink do preÃ§o pra nÃ£o vazar do bloco direito
      let priceFs = 64;
      ctx.font = `900 ${priceFs}px Inter, Arial, sans-serif`;
      while (ctx.measureText(priceStr).width > priceBlockW - 20 && priceFs > 30) {
        priceFs -= 4;
        ctx.font = `900 ${priceFs}px Inter, Arial, sans-serif`;
      }
      ctx.fillStyle = v0OnPanel;
      safeFillText(ctx, priceStr, priceCenterX, rowTopY + 92, priceBlockW - 20, 24);
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
        effectiveTextColor,
        userFamily,
        false,
        logoFormat
      );
      return canvas.toDataURL("image/png");
    }



    // â”€â”€ V1 Â· REF "Black Friday" â€” painel escuro ESQUERDA + coluna fotos DIREITA â”€â”€
    // Painel primario na esquerda com texto/preco; coluna direita com foto empilhada
    if (variant === 1) {
      await drawProminentLogo(ctx, 40, 40, 120);
      // â”€â”€ V1 STORIES 9:16 â€” REFATORADO: painel esquerdo SÃ“LIDO + foto sangrada Ã¡ direita â”€
      const panelW = Math.round(width * 0.44);
      const photoX = panelW;
      const photoW = width - panelW;
      const v1PanelBg = primaryColor;
      const v1OnPanel = getSafeColor(v1PanelBg);
      const v1Accent  = getSafeColor(v1PanelBg, secondaryColor);

      // 1) PAINEL ESQUERDO solido
      ctx.fillStyle = v1PanelBg;
      ctx.fillRect(0, 0, panelW, height);

      // 2) FOTO sangrada Ã¡ direita (sem moldura)
      const c1 = fitCover(image.naturalWidth, image.naturalHeight, photoW, height, 0.40);
      ctx.drawImage(image, c1.sx, c1.sy, c1.sw, c1.sh, photoX, 0, photoW, height);

      // 3) Layout do painel
      const px = 56;
      const pw = panelW - px * 2;
      // Teto EXTREMAMENTE apertado no Feed para ganhar mÃ¡xima Ã¡rea Ãºtil vertical (subido para 24px)
      const logoReserve = format === "story" ? safeTop : (hasLogo ? 110 : 24);

      // 4) BADGE pÃ­lula
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
      safeFillText(ctx, badgeText, px + 20, badgeY + badgeH / 2, badgeW - 40, 14);
      ctx.textBaseline = "alphabetic";

      // 5) TÃTULO PRINCIPAL (Gap ajustado para 65px no feed p/ compensar baseline e nunca sobrepor!)
      const titleY = badgeY + badgeH + (format === "story" ? 40 : 65); 
      ctx.fillStyle = v1OnPanel; 
      
      // ComeÃ§a um pouco menor no feed (42px) para nÃ£o estourar no topo
      let mainTitleSize = format === "story" ? 48 : 42; 
      ctx.font = `900 ${mainTitleSize}px Inter, Arial, sans-serif`;

      const titleWords = (titleText || "").split(/\s+/).filter(Boolean);
      let titleLines: string[] = [];
      let currentLine = "";

      for (const w of titleWords) {
        const tryLine = currentLine ? `${currentLine} ${w}` : w;
        ctx.font = `900 ${mainTitleSize}px Inter, Arial, sans-serif`;
        if (ctx.measureText(tryLine).width > pw && currentLine) {
          titleLines.push(currentLine);
          currentLine = w;
        } else {
          currentLine = tryLine;
        }
      }
      if (currentLine) titleLines.push(currentLine);

      // Encolhimento dinÃ¢mico de seguranÃ§a do font-size para que caiba perfeitamente no pw
      while (titleLines.some(ln => ctx.measureText(ln).width > pw) && mainTitleSize > 24) {
        mainTitleSize -= 2;
        ctx.font = `900 ${mainTitleSize}px Inter, Arial, sans-serif`;
      }

      titleLines.forEach((ln, i) => {
        ctx.fillText(ln, px, titleY + i * (mainTitleSize + 8));
      });

      const titleBlockH = titleLines.length * (mainTitleSize + 8);

      // 7) PRICE CARD & BENEFITS - Engenharia dinÃ¢mica inteligente
      const priceBlockH = 200;
      
      // Ponto limite calculado: no feed, deixamos mais alto (height - 460) para garantir respiro na base
      const limitY = format === "story" ? height - 680 : height - 460;
      
      // 8) BENEFITS â€” pÃ­lulas adaptativas no espaco restante
      let benefitsListV1 = highlights.filter((h) => h?.text && h.text.trim().length > 0);
      if (travelPeriod && travelPeriod.trim()) {
        const tp = travelPeriod.trim();
        benefitsListV1 = benefitsListV1.filter(b => b.text.toLowerCase() !== tp.toLowerCase());
        benefitsListV1.unshift({ text: tp, icon: "calendar" as IconKey });
      }
      benefitsListV1 = benefitsListV1.slice(0, 6);
      const hlStart = titleY + titleBlockH + (format === "story" ? 24 : 16);
      
      // O espaÃ§o disponÃ­vel forÃ§a o encolhimento das pÃ­lulas, empurrando tudo para cima logicamente!
      const hlAvailH = limitY - hlStart; 
      const count = Math.max(1, benefitsListV1.length);
      const pillGap = 12;
      const pillH = Math.max(42, Math.min(68, Math.floor((hlAvailH - pillGap * (count - 1)) / count)));

      // O bloco de preÃ§o AGORA segue dinamicamente o fim dos benefÃ­cios TANTO no story QUANTO no feed!
      const lastBenefitY = hlStart + (count - 1) * (pillH + pillGap) + pillH;
      let priceBlockY = lastBenefitY + (format === "story" ? height * 0.08 : 28);
      
      // Fontes e Ã­cones aumentados em 20% para legibilidade impecÃ¡vel
      const pillFont = pillH >= 56 ? 28 : pillH >= 46 ? 24 : 20;
      const iconFont = pillH >= 56 ? 34 : 30;
      const pillBg = v1OnPanel === "#ffffff" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.14)";

      benefitsListV1.forEach((h, i) => {
        const py = hlStart + i * (pillH + pillGap);
        fillRoundRect(ctx, px, py, pw, pillH, 14, pillBg);
        ctx.fillStyle = v1Accent;
        ctx.font = `400 ${iconFont}px Inter, Arial, sans-serif`;
        ctx.textBaseline = "middle";
        drawMonoIcon(ctx, h.icon || "check", px + 22 + 32/2, py + pillH / 2, 32, v1Accent); // Ãcone aumentado para 32px (20% maior)
        ctx.fillStyle = v1OnPanel;
        let tf = pillFont;
        ctx.font = `700 ${tf}px Inter, Arial, sans-serif`;
        const maxTw = pw - 90; // Respiro ampliado
        while (ctx.measureText(h.text).width > maxTw && tf > 14) {
          tf -= 2;
          ctx.font = `700 ${tf}px Inter, Arial, sans-serif`;
        }
        safeFillText(ctx, h.text, px + 76, py + pillH / 2, pw - 90, 14); // Afastamento aumentado para 76px para o Ã­cone maior
        ctx.textBaseline = "alphabetic";
      });

      // 9) PRICE CARD overlay
      const priceCardOverlay = v1OnPanel === "#ffffff" ? "rgba(0,0,0,0.32)" : "rgba(255,255,255,0.28)";
      fillRoundRect(ctx, px, priceBlockY, pw, priceBlockH, 18, priceCardOverlay);
      ctx.textAlign = "center";
      ctx.fillStyle = v1Accent;
      ctx.font = "800 22px Inter, Arial, sans-serif";
      ctx.fillText((topLabel || "A VISTA").toString().toUpperCase(), px + pw / 2, priceBlockY + 36);
      ctx.fillStyle = v1OnPanel;
      
      let priceStrV1 = mainPrice || `${curSym} ${price}`;
      if (hideCents) {
        // Remove os decimais/centavos do final da string de preÃ§o caso desativado
        priceStrV1 = priceStrV1.replace(/[.,]\d{2}\s*$/, "");
      }

      let pfsV1 = 76;
      ctx.font = `900 ${pfsV1}px Inter, Arial, sans-serif`;
      while (ctx.measureText(priceStrV1).width > pw - 32 && pfsV1 > 30) {
        pfsV1 -= 4;
        ctx.font = `900 ${pfsV1}px Inter, Arial, sans-serif`;
      }
      const priceBaseY = priceBlockY + 36 + pfsV1 + 4;
      safeFillText(ctx, priceStrV1, px + pw / 2, priceBaseY, pw - 40, 24);
      ctx.fillStyle = v1Accent;
      ctx.font = "800 22px Inter, Arial, sans-serif"; // Negrito forte para legibilidade mÃ¡xima
      ctx.fillText(bottomSuffix || "por pessoa", px + pw / 2, priceBaseY + 30); // Ajustado Y para ser exatamente 30px abaixo da linha de base do valor principal
      ctx.textAlign = "left";

      await drawFinalBranding(
        ctx, width, height, logoDataUrl, 
        options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined), 
        options.footerContact2Icon ? { icon: options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
        effectiveTextColor,
        userFamily,
        false,
        logoFormat
      );
      if (false) {
        // ==========================================
        // DEDICATED RENDERER FOR V1 SQUARE 1:1 FOOTER
        // ==========================================
        const footerHeight = 100;
        const footerY = height - footerHeight - 20;
        const centerY = footerY + footerHeight / 2;

        // 1. VÃ©u Gradiente Escuro
        const veilStartY = footerY - 80;
        const grad = ctx.createLinearGradient(0, veilStartY, 0, height);
        grad.addColorStop(0, "rgba(0,0,0,0.0)");
        grad.addColorStop(0.2, "rgba(0,0,0,0.7)");
        grad.addColorStop(1, "rgba(0,0,0,0.96)");
        ctx.save();
        ctx.fillStyle = grad;
        ctx.fillRect(0, veilStartY, width, height - veilStartY);
        ctx.restore();

        // 2. Resolver Contatos
        const contact1 = options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined);
        const contact2 = options.footerContact2Icon ? { icon: options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined);

        const contactsToDraw: { icon: string; value: string }[] = [];
        if (contact1 && contact1.icon !== "none" && contact1.value && contact1.value.trim()) contactsToDraw.push(contact1);
        if (contact2 && contact2.icon !== "none" && contact2.value && contact2.value.trim()) contactsToDraw.push(contact2);

        if (contactsToDraw.length > 0) {
          ctx.save();
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 6;

          const textRightX = width - 60;
          const itemGap = 20;
          const safeFont = userFamily || "Inter";
          
          let yPos = contactsToDraw.length === 2 ? centerY + (footerHeight * 0.18) : centerY;

          for (const c of contactsToDraw) {
            let displayValue = c.value;
            const isWhatsapp = c.icon.startsWith("whatsapp");
            const isWebsite = c.icon === "website" || c.icon === "website_custom";
            
            if (isWhatsapp) displayValue = formatAdPhone(c.value);
            if (c.icon.startsWith("instagram")) displayValue = c.value.startsWith("@") ? c.value : `@${c.value}`;

            let currentFontSize = 22;
            const iconSizeFactor = 1.35;
            let currentIconSize = currentFontSize * iconSizeFactor;

            // REGRA MATEMÃTICA RIGOROSA DE LIMITE PARA ESTE TEXTO NA V1 QUADRADO
            const maxUrlWidth = width * 0.40;

            ctx.font = `700 ${currentFontSize}px ${safeFont}, sans-serif`;
            while (ctx.measureText(displayValue).width > maxUrlWidth && currentFontSize > 12) {
              currentFontSize -= 1;
              currentIconSize = currentFontSize * iconSizeFactor;
              ctx.font = `700 ${currentFontSize}px ${safeFont}, sans-serif`;
            }

            ctx.fillText(displayValue, textRightX, yPos);
            const textWidth = ctx.measureText(displayValue).width;
            const iconX = textRightX - textWidth - itemGap - currentIconSize / 2;

            if (isWhatsapp) {
              await drawWhatsAppContact(ctx, iconX, yPos, currentIconSize);
            } else if (c.icon.startsWith("instagram")) {
              drawAdInstagramIcon(ctx, iconX, yPos, currentIconSize, "gradient");
            } else if (isWebsite) {
              drawAdWebsiteIcon(ctx, iconX, yPos, currentIconSize, ctx.fillStyle as string);
            }

            yPos -= (footerHeight * 0.36);
          }
          ctx.restore();
        }
      } else {
        await drawFinalBranding(
          ctx, width, height, logoDataUrl, 
          options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined), 
          options.footerContact2Icon ? { icon: options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
          effectiveTextColor,
          userFamily,
          true,
          logoFormat
        );
      }
    return canvas.toDataURL("image/png");
    }

    // â”€â”€ V2 Â· REF "Santa Teresa" â€” foto topo + faixa headline + benefits + preco â”€â”€
    // Layout ADAPTATIVO: a foto cresce/encolhe conforme a quantidade de benefÃ­cios,
    // garantindo que TODOS os benefÃ­cios aparecam (ate 5) e que nÃ£o sobre espaco branco.
    if (variant === 2) {
      await drawProminentLogo(ctx, 40, 40, 120);

      if (format === "story") {
        // ============================================================
        // DEDICATED REENGINEERING FOR V2 STORIES (9:16)
        // ============================================================
        ctx.fillStyle = "#f7f4ef"; 
        ctx.fillRect(0, 0, width, height);

        const v2CardBg = primaryColor;
        const v2CardLabel = getSafeColor(v2CardBg, secondaryColor);
        const v2BenefitColor = getSafeColor("#f7f4ef", secondaryColor);
        const v2HeadlineColor = v2CardLabel;

        const benefitsListV2 = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 6);
        const benefitsCountV2 = Math.max(1, benefitsListV2.length);

        // 1) Dynamic Price Block - Mirror Feed logic to avoid being oversized & fix hardcoded labels
        const priceStrV2 = mainPrice || `${curSym} ${price}`;
        const topLabelTxt = (topLabel || installments || "por apenas").toString().toUpperCase();
        
        ctx.font = "700 24px Inter, Arial, sans-serif";
        const w1 = ctx.measureText(topLabelTxt).width;
        ctx.font = "900 74px Inter, Arial, sans-serif";
        const w2 = ctx.measureText(priceStrV2).width;
        ctx.font = "800 22px Inter, Arial, sans-serif";
        const w3 = ctx.measureText((bottomSuffix || "por pessoa").toUpperCase()).width;
        
        const maxContentW = Math.max(w1, w2, w3);
        const priceBlockW = Math.min(width * 0.8, Math.max(width * 0.45, Math.round(maxContentW + 100)));
        const priceCardH = 168;
        const priceCardX = Math.round((width - priceBlockW) / 2);
        // Securely anchor above the Instagram safe bottom zone (1440)
        const priceCardY = panelBottom - priceCardH - 35; 
        
        fillRoundRect(ctx, priceCardX, priceCardY, priceBlockW, priceCardH, 24, v2CardBg);
        
        // Subtle relief effect on card
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2.5;
        fillRoundRect(ctx, priceCardX + 1.5, priceCardY + 1.5, priceBlockW - 3, priceCardH - 3, 22, "transparent");
        ctx.stroke();
        ctx.restore();

        const cardCenterX = priceCardX + priceBlockW / 2;
        ctx.textAlign = "center";
        ctx.fillStyle = v2CardLabel;
        
        ctx.font = "800 24px Inter, Arial, sans-serif";
        safeFillText(ctx, topLabelTxt, cardCenterX, priceCardY + 45, priceBlockW - 40, 14);

        let pfsV2 = 74;
        ctx.font = `900 ${pfsV2}px Inter, Arial, sans-serif`;
        while (ctx.measureText(priceStrV2).width > priceBlockW - 50 && pfsV2 > 28) {
          pfsV2 -= 4;
          ctx.font = `900 ${pfsV2}px Inter, Arial, sans-serif`;
        }
        safeFillText(ctx, priceStrV2, cardCenterX, priceCardY + 108, priceBlockW - 50, 24);

        ctx.fillStyle = v2CardLabel;
        ctx.globalAlpha = 0.9;
        ctx.font = "800 22px Inter, Arial, sans-serif";
        ctx.fillText((bottomSuffix || "por pessoa").toUpperCase(), cardCenterX, priceCardY + 150);
        ctx.globalAlpha = 1.0;

        // Optional Travel Period injection between components
        let periodYOffset = 0;
        if (travelPeriod && travelPeriod.trim()) {
          ctx.fillStyle = v2BenefitColor;
          ctx.font = "900 36px Inter, Arial, sans-serif";
          ctx.fillText(travelPeriod.trim().toUpperCase(), width / 2, priceCardY - 52);
          periodYOffset = 72; // Allocates extra safety offset upwards
        }
        ctx.textAlign = "left";

        // 2) Intelligent Multi-line Headline Bar
        const resolvedTitle = (titleText || "").toUpperCase();
        ctx.font = "900 56px Inter, Arial, sans-serif";
        const titleLines = wrapTextSafe(ctx, resolvedTitle, contentWidth - 40, 2, 34);
        const isMultiLine = titleLines.length > 1;
        const faixaH = isMultiLine ? 190 : 135;

        // ðŸ›¡ï¸ DYNAMIC COLLISION PROTECTION ENGINE ðŸ›¡ï¸
        // Calculates guaranteed minimum vertical space reservation to prevent component overlaps.
        const benefitRowsV2 = Math.ceil(benefitsCountV2 / 2);
        const benefitGap = benefitRowsV2 <= 2 ? 82 : 68; 
        const benefitsEffectiveH = (benefitRowsV2 - 1) * benefitGap;
        
        // We require at least the highlights stack, the price floor, and reasonable empty buffers (70px total)
        const requiredBuff = 70; 
        const contentFloorLimit = priceCardY - periodYOffset;
        // Safe ceiling threshold for content based on strict stacking needs
        const maxSafeCeiling = contentFloorLimit - (benefitsEffectiveH + requiredBuff);

        // Re-evaluate optimal photo anchor to make it large, but fit inside constraints
        let photoBottom = 800; 
        // photoBottom + 16 (gap) + faixaH must not exceed maxSafeCeiling
        const photoConstraint = maxSafeCeiling - 16 - faixaH;
        photoBottom = Math.min(photoBottom, photoConstraint);
        
        const faixaY = photoBottom + 16;

        fillRoundRect(ctx, 0, faixaY, width, faixaH, 0, v2CardBg);
        ctx.fillStyle = v2HeadlineColor;
        ctx.textBaseline = "middle";
        
        const lineSpacing = 62;
        const textBlockH = isMultiLine ? lineSpacing : 0;
        const startTextY = (faixaY + faixaH / 2) - (textBlockH / 2);
        
        titleLines.forEach((txt, i) => {
           safeFillText(ctx, txt, left, startTextY + (i * lineSpacing), width - left - 40, 20);
        });
        ctx.textBaseline = "alphabetic";

        // 3) Expanded Photo Mask - Autonomously size-constrained to prevent content bleed
        const photoTop = safeTop - 20; 
        const fW2 = width - 32;
        const fH2 = photoBottom - photoTop; 
        const c2 = fitCover(image.naturalWidth, image.naturalHeight, fW2, fH2, 0.36);
        ctx.save();
        fillRoundRect(ctx, 16, photoTop, fW2, fH2, 22, "#ccc");
        ctx.clip();
        ctx.drawImage(image, c2.sx, c2.sy, c2.sw, c2.sh, 16, photoTop, fW2, fH2);
        ctx.restore();

        // 4) Mathematical Vertical Balancing (Safe Centering)
        const bfs = benefitRowsV2 <= 2 ? 38 : 32; 
        const contentCeilLimit = faixaY + faixaH;
        const verticalFreeSpace = contentFloorLimit - contentCeilLimit;
        
        // Anchor top at the precise vertical half-point of the computed gap
        const benefitsTop = contentCeilLimit + (verticalFreeSpace - benefitsEffectiveH) / 2;

        const colGapV2 = 28;
        const colWV2 = (contentWidth - colGapV2) / 2;

        benefitsListV2.forEach((h, i) => {
          let fs = bfs;
          const col = i % 2;
          const row = Math.floor(i / 2);
          const tx = left + col * (colWV2 + colGapV2);
          const ty = benefitsTop + row * benefitGap;
          
          const iconSizeV2 = Math.round(fs * 1.5);
          // Offset icon slightly upwards visually to accommodate text baseline
          drawMonoIcon(ctx, h.icon || "check", tx + iconSizeV2 / 2, ty - fs/6, iconSizeV2, v2BenefitColor);
          
          ctx.fillStyle = v2BenefitColor;
          ctx.font = `700 ${fs}px Inter, Arial, sans-serif`;
          const textX = tx + iconSizeV2 + 15;
          const textMaxW = colWV2 - (iconSizeV2 + 15);
          while (ctx.measureText(h.text).width > textMaxW && fs > 14) {
            fs -= 1;
            ctx.font = `700 ${fs}px Inter, Arial, sans-serif`;
          }
          ctx.fillText(h.text, textX, ty);
        });

      } else {
        // ============================================================
        // REENGINEERED SQUARE 1:1 LAYOUT (FULL PARITY WITH STORY ARCHITECTURE)
        // ============================================================
        ctx.fillStyle = "#f7f4ef"; 
        ctx.fillRect(0, 0, width, height);

        const v2CardBg = primaryColor;
        const v2CardLabel = getSafeColor(v2CardBg, secondaryColor);
        const v2BenefitColor = getSafeColor("#f7f4ef", secondaryColor);
        const v2HeadlineColor = v2CardLabel;

        const benefitsListV2 = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 6);
        const benefitsCountV2 = Math.max(1, benefitsListV2.length);

        // 1) Price block with full form parity (prefix + pill + price + suffix + total + pix)
        const isCashV2 = paymentMode === "cash" || paymentMode === "cash_discount";
        const isDownPlusV2 = paymentMode === "down_plus";
        const instMatchV2 = (installments || "10x").match(/(\d{1,2})\s*x/i);
        const parcNV2 = instMatchV2 ? instMatchV2[1] : "10";

        const prefixTxtV2 = (isCashV2
          ? (pricePrefix !== undefined ? pricePrefix : "pagamento")
          : (isDownPlusV2 ? (pricePrefix || "entrada +") : (pricePrefix !== undefined ? pricePrefix : "a partir de"))
        ).toString().toUpperCase();

        const pillTxtV2 = (isCashV2 ? "À VISTA" : `${parcNV2}X`).toUpperCase();

        const priceRawV2 = (price || "").trim();
        const priceNumV2 = parseFloat(priceRawV2.replace(/\./g, "").replace(",", "."));
        const hasCentsV2 = /[.,]\d{1,2}\s*$/.test(priceRawV2);
        const fmtBRV2 = (n: number) => {
          try { return n.toLocaleString("pt-BR", { minimumFractionDigits: hasCentsV2 ? 2 : 0, maximumFractionDigits: hasCentsV2 ? 2 : 0 }); }
          catch { return String(n); }
        };
        const priceValV2 = !isNaN(priceNumV2) ? fmtBRV2(priceNumV2) : priceRawV2;
        const priceStrV2 = `${curSym} ${priceValV2}`;

        const suffixTxtV2 = (paymentSuffix || (isDownPlusV2 ? "parcelas" : "por pessoa")).toString().toUpperCase();

        const totalMultV2 = isCashV2 ? 1 : parseInt(parcNV2, 10) || 1;
        const totalNumV2 = !isNaN(priceNumV2) ? priceNumV2 * totalMultV2 : NaN;
        const totalStrV2 = (totalOverride && totalOverride.trim())
          || (!isNaN(totalNumV2) ? `Total ${curSym} ${fmtBRV2(totalNumV2)}` : "");
        const showTotalV2 = showTotal && !!totalStrV2 && !isCashV2;

        const pixTxtV2 = (pixBannerText || "").trim().toUpperCase();
        const showPixV2 = pixTxtV2.length > 0;

        // Compute card width based on widest piece of content
        ctx.font = "800 24px Inter, Arial, sans-serif";
        const wPrefV2 = ctx.measureText(prefixTxtV2).width;
        ctx.font = "900 28px Inter, Arial, sans-serif";
        const wPillV2 = ctx.measureText(pillTxtV2).width + 36;
        ctx.font = "900 76px Inter, Arial, sans-serif";
        const wPriceV2 = ctx.measureText(priceStrV2).width;
        ctx.font = "800 22px Inter, Arial, sans-serif";
        const wSufV2 = ctx.measureText(suffixTxtV2).width;
        const maxContentWV2 = Math.max(wPrefV2, wPillV2, wPriceV2, wSufV2);
        const priceBlockW = Math.min(width * 0.84, Math.max(width * 0.5, Math.round(maxContentWV2 + 110)));
        const priceCardH = 232;
        const priceCardX = Math.round((width - priceBlockW) / 2);

        // Reserve space for total + pix badges below the card
        const extrasBelowH = (showTotalV2 ? 36 : 0) + (showPixV2 ? 46 : 0) + (showTotalV2 || showPixV2 ? 16 : 0);
        const priceCardY = panelBottom - priceCardH - extrasBelowH - 40;

        // Card body
        fillRoundRect(ctx, priceCardX, priceCardY, priceBlockW, priceCardH, 22, v2CardBg);
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.lineWidth = 2.5;
        fillRoundRect(ctx, priceCardX + 1.5, priceCardY + 1.5, priceBlockW - 3, priceCardH - 3, 20, "transparent");
        ctx.stroke();
        ctx.restore();

        const cardCenterX = priceCardX + priceBlockW / 2;

        // Prefix (top)
        if (prefixTxtV2) {
          ctx.fillStyle = v2CardLabel;
          ctx.font = "800 24px Inter, Arial, sans-serif";
          ctx.textAlign = "center";
          safeFillText(ctx, prefixTxtV2, cardCenterX, priceCardY + 38, priceBlockW - 40, 14);
        }

        // Installment pill
        const pillH = 38;
        const pillW = Math.max(72, wPillV2);
        const pillX = cardCenterX - pillW / 2;
        const pillY = priceCardY + 56;
        fillRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, v2CardLabel);
        ctx.fillStyle = v2CardBg;
        ctx.font = "900 22px Inter, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pillTxtV2, cardCenterX, pillY + pillH / 2 + 1);
        ctx.textBaseline = "alphabetic";

        // Price (auto-shrink)
        let pfsV2 = 76;
        ctx.font = `900 ${pfsV2}px Inter, Arial, sans-serif`;
        while (ctx.measureText(priceStrV2).width > priceBlockW - 50 && pfsV2 > 30) {
          pfsV2 -= 4;
          ctx.font = `900 ${pfsV2}px Inter, Arial, sans-serif`;
        }
        ctx.fillStyle = v2CardLabel;
        ctx.textAlign = "center";
        ctx.fillText(priceStrV2, cardCenterX, priceCardY + 158);

        // Suffix (bottom)
        if (suffixTxtV2) {
          ctx.font = "800 22px Inter, Arial, sans-serif";
          ctx.globalAlpha = 0.92;
          ctx.fillText(suffixTxtV2, cardCenterX, priceCardY + 200);
          ctx.globalAlpha = 1.0;
        }

        // Total line below card
        let extrasY = priceCardY + priceCardH + 18;
        if (showTotalV2) {
          ctx.fillStyle = primaryColor;
          ctx.font = "800 24px Inter, Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.globalAlpha = 0.85;
          ctx.fillText(totalStrV2, cardCenterX, extrasY);
          ctx.globalAlpha = 1.0;
          extrasY += 36;
        }

        // Pix badge below
        if (showPixV2) {
          ctx.font = "900 20px Inter, Arial, sans-serif";
          const pixW = ctx.measureText(pixTxtV2).width + 40;
          const pixH = 36;
          const pixX = cardCenterX - pixW / 2;
          fillRoundRect(ctx, pixX, extrasY, pixW, pixH, pixH / 2, secondaryColor);
          ctx.fillStyle = ensureContrast(secondaryColor, "#0a0a0a", 0.4);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(pixTxtV2, cardCenterX, extrasY + pixH / 2 + 1);
          ctx.textBaseline = "alphabetic";
        }

        // Travel period rendered as a small line ABOVE the price card (no longer overlapping benefits)
        let periodYOffset = 0;
        if (travelPeriod && travelPeriod.trim()) {
          ctx.fillStyle = v2CardBg;
          ctx.font = "900 30px Inter, Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(travelPeriod.trim().toUpperCase(), width / 2, priceCardY - 28);
          periodYOffset = 56;
        }
        ctx.textAlign = "left";

        // 2) Intelligent Multi-line Headline Bar (with optional promoName accent)
        const promoTagV2 = (promoName || "").trim().toUpperCase();
        const hasPromoV2 = promoTagV2.length > 0;
        const resolvedTitle = (titleText || "").toUpperCase();
        ctx.font = "900 52px Inter, Arial, sans-serif";
        const titleLines = wrapTextSafe(ctx, resolvedTitle, contentWidth - 40, 2, 32);
        const isMultiLine = titleLines.length > 1;
        const promoH = hasPromoV2 ? 34 : 0;
        const faixaH = (isMultiLine ? 150 : 110) + promoH;

        // ðŸ›¡ï¸ DYNAMIC COLLISION PROTECTION ENGINE ðŸ›¡ï¸
        const benefitRowsV2 = Math.ceil(benefitsCountV2 / 2);
        const benefitGap = benefitRowsV2 <= 2 ? 74 : 58;
        const benefitsEffectiveH = (benefitRowsV2 - 1) * benefitGap;
        
        // Fixed reservation buffer required for the mid-panel assets
        const requiredBuff = 60; 
        const contentFloorLimit = priceCardY - periodYOffset;
        const maxSafeCeiling = contentFloorLimit - (benefitsEffectiveH + requiredBuff);

        // Layout Positioning: TOP-DOWN with dynamic safety clamp
        let photoBottom = 480; 
        const photoConstraint = maxSafeCeiling - 16 - faixaH;
        photoBottom = Math.min(photoBottom, photoConstraint);
        
        const photoTop = safeTop - 20; // Typically 40 in square mode
        const faixaY = photoBottom + 16;

        fillRoundRect(ctx, 0, faixaY, width, faixaH, 0, v2CardBg);
        ctx.fillStyle = v2HeadlineColor;
        ctx.textBaseline = "middle";
        
        const lineSpacing = 58;
        const textBlockH = isMultiLine ? lineSpacing : 0;
        const startTextY = (faixaY + faixaH / 2) - (textBlockH / 2);

        titleLines.forEach((txt, i) => {
           safeFillText(ctx, txt, left, startTextY + (i * lineSpacing), width - left - 40, 20);
        });
        ctx.textBaseline = "alphabetic";

        // 3) The Expanded Photo Mask
        const fW2 = width - 32;
        const fH2 = photoBottom - photoTop;
        const c2 = fitCover(image.naturalWidth, image.naturalHeight, fW2, fH2, 0.36);
        ctx.save();
        fillRoundRect(ctx, 16, photoTop, fW2, fH2, 22, "#ccc");
        ctx.clip();
        ctx.drawImage(image, c2.sx, c2.sy, c2.sw, c2.sh, 16, photoTop, fW2, fH2);
        ctx.restore();

        // 4) Highlights Centering Module (Aligns content between panels)
        const bfs = benefitRowsV2 <= 2 ? 36 : 32;
        
        const contentCeilLimit = faixaY + faixaH;
        // Garante um respiro mÃ­nimo de 35px abaixo da faixa preta
        const topSpacing = 35;
        const contentCeilWithSpacing = contentCeilLimit + topSpacing;
        const verticalFreeSpace = contentFloorLimit - contentCeilWithSpacing;
        
        const benefitsTop = contentCeilWithSpacing + Math.max(0, (verticalFreeSpace - benefitsEffectiveH) / 2);

        const colGapV2 = 28;
        const colWV2 = (contentWidth - colGapV2) / 2;
        
        ctx.save();
        ctx.textBaseline = "middle";
        benefitsListV2.forEach((h, i) => {
          let fs = bfs;
          const col = i % 2;
          const row = Math.floor(i / 2);
          const tx = left + col * (colWV2 + colGapV2);
          const ty = benefitsTop + row * benefitGap;
          
          const iconSizeV2 = Math.round(fs * 1.4);
          // Desenha o Ã­cone centralizado perfeitamente na linha ty
          drawMonoIcon(ctx, h.icon || "check", tx + iconSizeV2/2, ty, iconSizeV2, v2BenefitColor);
          
          ctx.fillStyle = v2BenefitColor;
          ctx.font = `700 ${fs}px Inter, Arial, sans-serif`;
          const textX = tx + iconSizeV2 + 14;
          const textMaxW = colWV2 - (iconSizeV2 + 14);
          while (ctx.measureText(h.text).width > textMaxW && fs > 14) {
            fs -= 1;
            ctx.font = `700 ${fs}px Inter, Arial, sans-serif`;
          }
          // Desenha o texto centralizado na linha ty
          ctx.fillText(h.text, textX, ty);
        });
        ctx.restore();
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

    // â”€â”€ V4 Â· CIRCUITO BR â€” card azul flutuante centralizado + pÃ­lula Pix vazada â”€
    // Estrutura ref. anuncio "Circuito Portugal": foto cinematografica do destino
    // ocupando 100% do canvas; card primario arredondado centralizado mais abaixo
    // do meio (deixa ceu/paisagem visÃ­vel em cima); pÃ­lula Pix em formato pÃ­lula
    // "vazando" metade para fora da borda inferior do card.
    //
    // Mapeamento estrito form â†’ render:
    //   BG          â†’ image (Foto Real / Sua Imagem / IA Pura por Destino)
    //   card.bg     â†’ primaryColor
    //   tagline     â†’ promoName               cor: secondaryColor
    //   tÃ­tulo      â†’ titleText (resolvido)   cor: branco
    //   info        â†’ daysText | Ã­cones       cor: secondaryColor (mono)
    //   12X pill bg â†’ secondaryColor          texto: primaryColor
    //   "a partir de"/"sem juros"/"Total ..." â†’ branco
    //   R$ + valor  â†’ branco (valor SEM vÃ­rgula/centavos â€” absoluto)
    //   pix pill    â†’ bg secondaryColor, texto branco, vazando bottom: -28
    if (variant === 4) {
      await drawProminentLogo(ctx, 40, 40, 120);
      // [BG] foto cobre 100%
      const cBgV4 = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.42);
      ctx.drawImage(image, cBgV4.sx, cBgV4.sy, cBgV4.sw, cBgV4.sh, 0, 0, width, height);

      // â”€â”€ Dados â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const v4Primary = primaryColor || "#0B2B7A";
      const v4Secondary = secondaryColor || "#FFE600";
      const v4OnSecondary = ensureContrast(v4Primary, v4Secondary, 0.4); // contraste do texto sobre amarelo
      const destinoV4 = (destination || "DESTINO").toUpperCase();
      // Tagline do topo = promoName (se vazio, usa "PACOTE" como neutro)
      const taglineV4 = ((promoName || "PACOTE").trim()).toUpperCase();
      // TÃ­tulo = primeira linha do titleText OU destino (sem repetir tagline)
      const titleLineV4 = (() => {
        const t = (titleText || "").trim();
        const firstLine = t.split(/\r?\n/)[0] || t;
        // remove tagline duplicada se titleText comecar com ela
        return firstLine.replace(new RegExp(`^${taglineV4}\\s*`, "i"), "").trim() || destinoV4;
      })();

      const daysItemV4 = highlights.find((h) => /\d+\s*dia|\d+\s*noite|janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/i.test(h?.text || ""));
      const daysTextV4 = (travelPeriod?.trim() || daysItemV4?.text || "").trim();
      const iconListV4: IconKey[] = (() => {
        const fromHl = highlights
          .map((h) => h?.icon as IconKey | undefined)
          .filter((k): k is IconKey => !!k);
        if (fromHl.length === 0) return ["coffee", "users", "bus", "camera"] as IconKey[];
        const seen = new Set<IconKey>(); const out: IconKey[] = [];
        for (const k of fromHl) { if (!seen.has(k)) { seen.add(k); out.push(k); if (out.length >= 5) break; } }
        return out;
      })();

      // Chamada do pagamento sincronizada com o modo escolhido no formulario.
      const instMatchV4 = (installments || "10x").match(/(\d{1,2})\s*x/i);
      const parcNV4 = instMatchV4 ? instMatchV4[1] : "1";
      const leftTopV4 = (() => {
        if (paymentMode === "cash" || paymentMode === "cash_discount") return "pagamento";
        if (paymentMode === "down_plus") return "entrada +";
        return pricePrefix !== undefined ? pricePrefix : "a partir de";
      })();
      const pillTxt = (() => {
        if (paymentMode === "cash" || paymentMode === "cash_discount") return "A VISTA";
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

      // Preco V4 â€” respeita o toggle "Mostrar centavos" do formulario.
      // Se o `price` recebido ja vem com vÃ­rgula/centavos (ex: "423,00"), preserva.
      // Caso contrario, exibe absoluto (sem decimais).
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

      // Desconto p/ pÃ­lula Pix
      const descMatchV4 = (promoName || "").match(/(\d{1,2})\s*%/);
      const descNV4 = descMatchV4 ? descMatchV4[1] : "5";

      // â”€â”€ [CARD] dimensÃes e posicÃ£o (centralizado, mais abaixo do centro) â”€
      // V4 precisa ser compacto: evita o â€œmarâ€ de fundo primÃ¡rio entre a pÃ­lula 10X e o preÃ§o.
      const cardW = Math.round(width * (format === "story" ? 0.78 : 0.70));
      const cardMarginX = Math.round((width - cardW) / 2);
      // Altura adaptativa
      const cardPadTop = 36;
      const tagH = 50;
      const tagGap = 4;
      const titleH = 64;
      const titleGap = 16;
      const infoH = 42;
      const infoGap = 22;
      const priceBlockH = 150;
      const totalGap = (showTotal && totalStrV4) ? 12 : 0;
      const totalHv4 = (showTotal && totalStrV4) ? 24 : 0;
      const cardPadBottom = 36;
      const cardH = cardPadTop + tagH + tagGap + titleH + titleGap + infoH + infoGap + priceBlockH + totalGap + totalHv4 + cardPadBottom;

      // PosicÃ£o vertical: card comeca em ~32% para deixar ceu visÃ­vel em cima.
      const cardX = cardMarginX;
      const idealCardY = format === "story" ? Math.round(height * 0.24) : Math.round(height * 0.16);
      const cardY = Math.min(Math.max(isStory ? safeTop : 0, idealCardY), panelBottom - cardH - 20);
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

      // [TAGLINE] cor secundaria, peso black
      ctx.textAlign = "left";
      ctx.fillStyle = v4Secondary;
      let tagSize = 56;
      ctx.font = `900 ${tagSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(taglineV4).width > cardW - 80 && tagSize > 28) {
        tagSize -= 2;
        ctx.font = `900 ${tagSize}px Inter, Arial, sans-serif`;
      }
      safeFillText(ctx, taglineV4, cardX + 36, cyV4, cardW - 80, 12);
      cyV4 += tagGap + 56;

      // [TÃTULO/DESTINO] branco, regular (mais leve), maior
      ctx.fillStyle = "#ffffff";
      let titSize = 72;
      ctx.font = `400 ${titSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(titleLineV4).width > cardW - 80 && titSize > 36) {
        titSize -= 2;
        ctx.font = `400 ${titSize}px Inter, Arial, sans-serif`;
      }
      safeFillText(ctx, titleLineV4, cardX + 36, cyV4, cardW - 80, 18);
      cyV4 += titleGap + 26;

      // [INFO] dias | Ã­cones â€” todos secondaryColor
      const infoYv4 = cyV4 + 8;
      ctx.fillStyle = v4Secondary;
      ctx.font = "700 32px Inter, Arial, sans-serif";
      ctx.textBaseline = "middle";
      const infoStartX = cardX + 36;
      const hasDaysV4 = !!(daysTextV4 && daysTextV4.trim());
      let currentXv4 = infoStartX;
      if (hasDaysV4) {
        ctx.fillText(daysTextV4, currentXv4, infoYv4);
        const daysWv4 = ctx.measureText(daysTextV4).width;
        currentXv4 += daysWv4 + 14;
        ctx.fillText("|", currentXv4, infoYv4);
        const sepWv4 = ctx.measureText("|").width;
        currentXv4 += sepWv4 + 18;
      }
      
      // Ã­cones na mesma linha
      const iconSizeV4 = 44;
      const iconGapV4 = 14;
      let iconCursor = currentXv4;
      iconListV4.forEach((k) => {
        drawMonoIcon(ctx, k, iconCursor + iconSizeV4 / 2, infoYv4, iconSizeV4, v4Secondary);
        iconCursor += iconSizeV4 + iconGapV4;
      });
      ctx.textBaseline = "alphabetic";
      cyV4 += infoGap + 38;

      // [PRICE BLOCK] â€” esquerda: "a partir de" + pÃ­lula 12X + "sem juros"
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

      // PÃ­lula sincronizada com o modo de pagamento (10X / A VISTA / Entrada + parcelas)
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

      // "sem juros" abaixo da pÃ­lula
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 22px Inter, Arial, sans-serif";
      ctx.fillText(leftBottomV4, leftX, pillY + pillH + 28);

      // Direita: R$ + centavos pequenos; valor principal gigante.
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      // Auto-shrink valor
      const reservedLeftPrice = pillX + pillW + 20;
      const maxValW = rightEdge - reservedLeftPrice - 70; // reserva menor p/ aproximar R$ + valor da pÃ­lula
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
      safeFillText(ctx, mainValV4, mainRightX, priceBaseY, mainRightX - leftX - 40, 48);
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

      // [BADGE PIX] pÃ­lula vazada na borda inferior â€” bottom: -20
      if (showPixBanner) {
        const pixLabel = (pixBannerText && pixBannerText.trim())
          || `${descNV4}% OFF A VISTA NO`;
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

      const hexToRgbaV5 = (hexColor: string, alpha: number) => {
        const h = (hexColor || "#ffffff").replace("#", "");
        if (h.length !== 6) return `rgba(255, 255, 255, ${alpha})`;
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      // V5 correto: card horizontal compacto, com informaÃ§Ãµes Ã  esquerda e preÃ§o Ã  direita.
      const cardW = Math.round(width * (format === "story" ? 0.88 : 0.82));
      const cardX = Math.round((width - cardW) / 2);
      const cardH = format === "story" ? 420 : 315;
      const idealY = format === "story" ? Math.round(height * 0.43) : Math.round(height * 0.35);
      const cardY = Math.min(Math.max(safeTop, idealY), panelBottom - cardH - 72);
      const cardR = 26;
      const cardPadX = format === "story" ? 48 : 40;
      const cardInnerW = cardW - cardPadX * 2;
      const leftW = Math.round(cardInnerW * (format === "story" ? 0.55 : 0.58));
      const gapW = format === "story" ? 28 : 32;
      const rightW = cardInnerW - leftW - gapW;
      const leftX = cardX + cardPadX;
      const rightX = leftX + leftW + gapW;
      const rightCx = rightX + rightW / 2;
      const onCard = getSafeColor(v5Primary, "#ffffff");
      const mutedOnCard = hexToRgbaV5(onCard, 0.76);
      const accentOnCard = ensureContrast(v5Secondary, v5Primary, 0.35);

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.44)";
      ctx.shadowBlur = 34;
      ctx.shadowOffsetY = 12;
      fillRoundRect(ctx, cardX, cardY, cardW, cardH, cardR, hexToRgbaV5(v5Primary, 0.96));
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = hexToRgbaV5(v5Secondary, 0.86);
      ctx.lineWidth = 4;
      roundRect(ctx, cardX + 2, cardY + 2, cardW - 4, cardH - 4, cardR - 2);
      ctx.stroke();
      ctx.restore();

      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.fillStyle = accentOnCard;
      ctx.font = `900 ${format === "story" ? 25 : 21}px Inter, Arial, sans-serif`;
      safeFillText(ctx, taglineV5, leftX, cardY + (format === "story" ? 62 : 54), leftW, 12);

      let titleFsV5 = format === "story" ? 54 : 42;
      let titleLinesV5: string[] = [];
      const buildTitleLinesV5 = () => {
        const words = titleLineV5.split(/\s+/).filter(Boolean);
        const lines: string[] = [];
        let line = "";
        ctx.font = `900 ${titleFsV5}px Inter, Arial, sans-serif`;
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > leftW && line) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
        return lines;
      };
      do {
        titleLinesV5 = buildTitleLinesV5();
        if (titleLinesV5.length > 2 || titleLinesV5.some((ln) => ctx.measureText(ln).width > leftW)) titleFsV5 -= 2;
      } while ((titleLinesV5.length > 2 || titleLinesV5.some((ln) => ctx.measureText(ln).width > leftW)) && titleFsV5 > 28);

      ctx.fillStyle = onCard;
      ctx.font = `900 ${titleFsV5}px Inter, Arial, sans-serif`;
      const titleStartYV5 = cardY + (format === "story" ? 126 : 105);
      titleLinesV5.slice(0, 2).forEach((ln, i) => {
        safeFillText(ctx, ln, leftX, titleStartYV5 + i * (titleFsV5 + 8), leftW, 18);
      });

      const iconSizeV5 = format === "story" ? 69 : 57;
      const iconGapV5 = 18;
      const iconYV5 = cardY + cardH - (format === "story" ? 78 : 64);
      let iconX = leftX;
      iconListV5.slice(0, 4).forEach((k) => {
        fillRoundRect(ctx, iconX, iconYV5 - iconSizeV5 / 2, iconSizeV5, iconSizeV5, iconSizeV5 / 2, hexToRgbaV5(onCard, 0.12));
        drawMonoIcon(ctx, k, iconX + iconSizeV5 / 2, iconYV5, iconSizeV5 * 0.55, onCard);
        iconX += iconSizeV5 + iconGapV5;
      });

      if (daysTextV5) {
        const dayLabel = daysTextV5.toUpperCase();
        ctx.font = `900 ${format === "story" ? 20 : 17}px Inter, Arial, sans-serif`;
        const dayW = Math.min(leftW - (iconX - leftX) - 18, ctx.measureText(dayLabel).width + 34);
        if (dayW > 90) {
          const dayX = iconX + 8;
          fillRoundRect(ctx, dayX, iconYV5 - 24, dayW, 44, 22, hexToRgbaV5(v5Secondary, 0.18));
          ctx.fillStyle = accentOnCard;
          ctx.textAlign = "center";
          safeFillText(ctx, dayLabel, dayX + dayW / 2, iconYV5 + 6, dayW - 26, 10);
          ctx.textAlign = "left";
        }
      }

      ctx.fillStyle = hexToRgbaV5(onCard, 0.22);
      ctx.fillRect(rightX - gapW / 2, cardY + 46, 2, cardH - 92);

      const currencyLabelV5 = (currencySymbol || curSym || "R$").trim();
      let safePillTxt = pillTxtV5;
      if (safePillTxt === "Ã€ VISTA" || safePillTxt === "A VISTA" || safePillTxt === "? VISTA") safePillTxt = "À VISTA";
      let displayPrefix = (pricePrefix || leftTopV5 || "a partir de").toUpperCase();
      if ((paymentMode === "cash" || paymentMode === "cash_discount") && /^(À|Ã€|A|\?)\s*VISTA$/i.test(displayPrefix)) displayPrefix = "";

      ctx.textAlign = "center";
      ctx.fillStyle = mutedOnCard;
      ctx.font = `900 ${format === "story" ? 24 : 19}px Inter, Arial, sans-serif`;
      safeFillText(ctx, displayPrefix || "A PARTIR DE", rightCx, cardY + (format === "story" ? 95 : 78), rightW, 10);

      ctx.font = `900 ${format === "story" ? 30 : 25}px Inter, Arial, sans-serif`;
      const pillW = Math.min(rightW, ctx.measureText(safePillTxt).width + 48);
      const pillH = format === "story" ? 50 : 42;
      const pillY = cardY + (format === "story" ? 112 : 91);
      fillRoundRect(ctx, rightCx - pillW / 2, pillY, pillW, pillH, 14, v5Secondary);
      ctx.fillStyle = contrastOn(v5Secondary);
      ctx.textBaseline = "middle";
      safeFillText(ctx, safePillTxt, rightCx, pillY + pillH / 2 + 1, pillW - 28, 12);
      ctx.textBaseline = "alphabetic";

      const centsMatchV5 = valNumV5.match(/^(.+?)([,.]\d{1,2})$/);
      const mainValV5 = centsMatchV5 ? centsMatchV5[1] : valNumV5;
      const centsValV5 = centsMatchV5 ? centsMatchV5[2] : "";
      let valSize = format === "story" ? 118 : 92;
      let symSize = Math.round(valSize * 0.34);
      const measurePrice = () => {
        ctx.font = `900 ${symSize}px Inter, Arial, sans-serif`;
        const symW = ctx.measureText(currencyLabelV5).width;
        const centsW = centsValV5 ? ctx.measureText(centsValV5).width : 0;
        ctx.font = `900 ${valSize}px Inter, Arial, sans-serif`;
        return symW + 14 + ctx.measureText(mainValV5 || "CONSULTE").width + (centsW ? centsW + 8 : 0);
      };
      while (measurePrice() > rightW && valSize > 44) {
        valSize -= 4;
        symSize = Math.round(valSize * 0.34);
      }
      const priceY = cardY + (format === "story" ? 275 : 210);
      const totalPriceW = measurePrice();
      let drawX = rightCx - totalPriceW / 2;
      ctx.textAlign = "left";
      ctx.fillStyle = accentOnCard;
      ctx.font = `900 ${symSize}px Inter, Arial, sans-serif`;
      ctx.fillText(currencyLabelV5, drawX, priceY - valSize * 0.35);
      drawX += ctx.measureText(currencyLabelV5).width + 14;
      ctx.fillStyle = onCard;
      ctx.font = `900 ${valSize}px Inter, Arial, sans-serif`;
      ctx.fillText(mainValV5 || "CONSULTE", drawX, priceY);
      drawX += ctx.measureText(mainValV5 || "CONSULTE").width + 8;
      if (centsValV5) {
        ctx.font = `900 ${symSize}px Inter, Arial, sans-serif`;
        ctx.fillText(centsValV5, drawX, priceY - valSize * 0.45);
      }

      const bottomTxt = ((showTotal && totalOverride?.trim()) || paymentSuffix || "por pessoa").trim();
      if (bottomTxt) {
        ctx.textAlign = "center";
        ctx.fillStyle = mutedOnCard;
        ctx.font = `800 ${format === "story" ? 24 : 20}px Inter, Arial, sans-serif`;
        safeFillText(ctx, bottomTxt, rightCx, priceY + (format === "story" ? 44 : 36), rightW, 12);
      }

      if (showPixBanner) {
        const rawPixLabel = ((pixBannerText && pixBannerText.trim()) || "10% OFF NO PIX").toUpperCase();
        ctx.font = `900 ${format === "story" ? 22 : 18}px Inter, Arial, sans-serif`;
        const pixW = Math.min(rightW, ctx.measureText(rawPixLabel).width + 38);
        const pixH = format === "story" ? 42 : 34;
        const pixY = cardY + cardH - pixH - 20;
        fillRoundRect(ctx, rightCx - pixW / 2, pixY, pixW, pixH, pixH / 2, v5Secondary);
        ctx.fillStyle = contrastOn(v5Secondary);
        ctx.textBaseline = "middle";
        safeFillText(ctx, rawPixLabel, rightCx, pixY + pixH / 2 + 1, pixW - 28, 12);
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
    const lines = (titleText || "").toUpperCase().split(/\s+/);
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
  style?: string;
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



