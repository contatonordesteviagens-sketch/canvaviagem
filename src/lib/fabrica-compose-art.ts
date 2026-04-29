type Format = "square" | "story";
type IconKey = "bus" | "hotel" | "plane" | "check" | "star" | "heart" | "sun" | "camera" | "map" | "food" | "ship" | "palm" | "coffee" | "guide" | "wifi";

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
  } = options;

  const width = 1080;
  const height = format === "story" ? 1920 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D não suportado");

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

  const safeTop = format === "story" ? 270 : 120;
  const safeBottom = format === "story" ? 345 : 120;
  const panelBottom = height - safeBottom;
  const left = 80;
  const right = width - 80;
  const contentWidth = right - left;
  const shownHighlights = highlights.slice(0, format === "story" ? 5 : 4);
  const badgeText = cityFmt ? `Saindo de ${cityFmt}` : "Pacote completo";
  const titleText = `Conheça ${destFmt}!`;

  const resolvePaymentCopy = () => {
    switch (paymentMode) {
      case "cash":
        return { topLabel: paymentLabel || "À VISTA", mainPrice: `R$ ${price}`, bottomSuffix: paymentSuffix || "/pessoa" };
      case "cash_discount":
        return { topLabel: paymentLabel || "À VISTA · 5% OFF", mainPrice: `R$ ${price}`, bottomSuffix: paymentSuffix || "/pessoa" };
      case "from":
        return { topLabel: paymentLabel || "A PARTIR DE", mainPrice: `R$ ${price}`, bottomSuffix: paymentSuffix || "/pessoa" };
      case "daily":
        return { topLabel: paymentLabel || "DIÁRIA POR", mainPrice: `R$ ${price}`, bottomSuffix: paymentSuffix || "/diária" };
      case "monthly":
        return { topLabel: paymentLabel || "MENSAL POR", mainPrice: `R$ ${price}`, bottomSuffix: paymentSuffix || "/mês" };
      case "down_plus":
        return { topLabel: paymentLabel || `ENTRADA + ${installments}`, mainPrice: `R$ ${price}`, bottomSuffix: paymentSuffix || "/pessoa" };
      case "free_quote":
        return { topLabel: paymentLabel || "CONSULTE", mainPrice: paymentSuffix ? "" : "VALORES", bottomSuffix: paymentSuffix || "no WhatsApp" };
      case "custom_label":
        return { topLabel: paymentLabel || installments, mainPrice: `R$ ${price}`, bottomSuffix: paymentSuffix || "/pessoa" };
      case "installments":
      default:
        return { topLabel: paymentLabel || installments, mainPrice: `R$ ${price}`, bottomSuffix: paymentSuffix || "/pessoa" };
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

  const drawPriceCard = (x: number, y: number, w: number, h: number, align: "left" | "right" = "right") => {
    fillRoundRect(ctx, x, y, w, h, 36, secondaryColor);
    const innerPad = 28;
    const innerW = w - innerPad * 2;
    const tx = align === "right" ? x + w - innerPad : x + innerPad;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#111111";
    if (topLabel) {
      let labelSize = 30;
      ctx.font = `900 ${labelSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(topLabel).width > innerW && labelSize > 18) {
        labelSize -= 2;
        ctx.font = `900 ${labelSize}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(topLabel, tx, y + 42);
    }
    if (mainPrice) {
      let priceFontSize = 58;
      ctx.font = `900 ${priceFontSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(mainPrice).width > innerW && priceFontSize > 28) {
        priceFontSize -= 4;
        ctx.font = `900 ${priceFontSize}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(mainPrice, tx, y + h / 2 + 10);
    }
    if (bottomSuffix) {
      let suffixSize = 22;
      ctx.font = `800 ${suffixSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(bottomSuffix).width > innerW && suffixSize > 14) {
        suffixSize -= 2;
        ctx.font = `800 ${suffixSize}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(bottomSuffix, tx, y + h - 24);
    }
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

  // Fundo opaco com a cor primária — evita qualquer "borda branca" caso a foto
  // não cubra todo o canvas por algum motivo (ex.: imagem com transparência ou aspecto inesperado).
  ctx.fillStyle = primaryColor || "#0a0a0a";
  ctx.fillRect(0, 0, width, height);

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
    const pillsH = drawHighlightsBlock(left, topY + 396, panelW - left - 36, format === "story" ? 5 : 4, false);
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
    drawTextBlock(ctx, titleText, left, lowerY + 136, leftColW, 72, 2, { baseFontSize: 68, minFontSize: 40 });
    drawPromoKicker(left, lowerY + 294);

    const rightColX = left + leftColW + 24;
    const rightColW = contentWidth - leftColW - 24;
    const pillsH = drawHighlightsBlock(rightColX, lowerY + 8, rightColW, format === "story" ? 5 : 4, true);
    const priceY = Math.min(panelBottom - 180, lowerY + pillsH + 40);
    drawPriceCard(rightColX, priceY, rightColW, 154, "right");
  } else if (strategy === "gancho") {
    const heroH = panelBottom;
    const crop = fitCover(image.naturalWidth, image.naturalHeight, width, heroH, format === "story" ? 0.38 : 0.42);
    ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, heroH);

    const overlay = ctx.createLinearGradient(0, 0, 0, heroH);
    overlay.addColorStop(0, "rgba(0,0,0,0.12)");
    overlay.addColorStop(0.5, "rgba(0,0,0,0.28)");
    overlay.addColorStop(1, "rgba(0,0,0,0.82)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, heroH);

    fillRoundRect(ctx, left, panelBottom - (format === "story" ? 720 : 470), contentWidth, format === "story" ? 630 : 370, 42, "rgba(7,10,18,0.68)");
    drawBadge(left + 28, panelBottom - (format === "story" ? 670 : 432), 320);
    ctx.fillStyle = "#ffffff";
    drawTextBlock(ctx, titleText, left + 28, panelBottom - (format === "story" ? 510 : 300), contentWidth - 56, format === "story" ? 78 : 64, 2, { baseFontSize: format === "story" ? 78 : 60, minFontSize: 42 });
    drawPromoKicker(left + 28, panelBottom - (format === "story" ? 348 : 200));
    // 5 pills compactos à esquerda; card de preço à direita não sobrepõe
    const pillsLimit = format === "story" ? 5 : 4;
    const pillsW = contentWidth - 360;
    drawHighlightsBlock(left + 28, panelBottom - (format === "story" ? 320 : 180), pillsW, pillsLimit, true, true);
    drawPriceCard(right - 320, panelBottom - (format === "story" ? 250 : 174), 292, 146, "right");
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

    const textY = format === "story" ? panelBottom - 520 : height - 330;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = "700 30px Inter, Arial, sans-serif";
    ctx.fillText(cityFmt ? `Saindo de ${cityFmt}` : "Experiência completa", left, textY);
    drawTextBlock(ctx, `Viva ${destFmt}`, left, textY + 96, contentWidth, 92, 2, { fontWeight: "800", baseFontSize: format === "story" ? 88 : 70, minFontSize: 44 });
    ctx.font = "500 30px Inter, Arial, sans-serif";
    ctx.fillText("Momentos que ficam para sempre", left, textY + (format === "story" ? 245 : 205));

    const smallItems = shownHighlights.slice(0, 3).map((h) => h.text).join("   •   ");
    ctx.font = "700 25px Inter, Arial, sans-serif";
    ctx.fillText(`•   ${smallItems}`, left, Math.min(panelBottom - 96, textY + (format === "story" ? 332 : 270)));
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
    ctx.fillText(city ? `Saindo de ${city}` : "Roteiro especial", left, safeTop + 54);
    drawTextBlock(ctx, `Descubra ${destination}`, left, safeTop + 170, columnW, 78, 3, { fontWeight: "800", baseFontSize: 74, minFontSize: 42 });
    ctx.fillStyle = "#2b2118";
    ctx.font = "500 29px Inter, Arial, sans-serif";
    drawTextBlock(ctx, "Uma experiência pensada para viver o destino com calma, beleza e curadoria.", left, safeTop + 420, columnW, 42, 4, { fontWeight: "500", baseFontSize: 29, minFontSize: 22 });
    ctx.font = "700 26px Inter, Arial, sans-serif";
    shownHighlights.slice(0, 4).forEach((item, idx) => {
      ctx.fillStyle = primaryColor;
      ctx.fillText("•", left, safeTop + 620 + idx * 62);
      ctx.fillStyle = "#2b2118";
      ctx.fillText(item.text, left + 34, safeTop + 620 + idx * 62);
    });
    ctx.font = "700 24px Inter, Arial, sans-serif";
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
    ctx.fillText(city ? `Saindo de ${city}` : "Roteiro especial", width / 2, safeTop + 96);
    ctx.textAlign = "left";
    drawTextBlock(ctx, destination, left + 42, panelBottom - 360, contentWidth - 84, 86, 2, { fontWeight: "800", baseFontSize: format === "story" ? 92 : 70, minFontSize: 44 });
    ctx.font = "500 30px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Uma viagem para sentir, viver e lembrar", width / 2, panelBottom - 165);
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
    drawTextBlock(ctx, `Viva ${destination}`, left, photoH - 210, contentWidth, 78, 2, { fontWeight: "800", baseFontSize: format === "story" ? 78 : 62, minFontSize: 40 });

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, photoH, width, height - photoH);
    ctx.fillStyle = primaryColor;
    ctx.font = "700 30px Inter, Arial, sans-serif";
    ctx.fillText("Experiências selecionadas", left, photoH + 92);
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

    const pillsH = drawHighlightsBlock(left, cursorY, contentWidth, format === "story" ? 5 : 4, false);
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
