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
  variation?: number;
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
    variation = 0,
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
    "Sua próxima viagem começa agora",
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
  const shownHighlights = highlights.slice(0, 5);
  const badgeText = cityFmt ? `Saindo de ${cityFmt}` : "Pacote completo";
  const titleText = headlinePool[Math.abs(variation) % headlinePool.length];
  const subtitlePool = [
    "Roteiro pensado para viver melhor",
    "Beleza, conforto e boas memórias",
    "Uma viagem com outro ritmo",
    "Paisagens, sabores e histórias",
    "Seu descanso começa aqui",
  ];
  const subtitleText = subtitlePool[(Math.abs(variation) + 2) % subtitlePool.length];

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
    const priceText = mainPrice || `R$ ${price}`;
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
    const variant = Math.abs(variation) % 4;
    const logoH = hasLogo ? 130 : 0;
    const destUp = (destination || "DESTINO").toUpperCase();

    // ── V0 · REF "Enseada" — painel claro/cor TOPO + foto EMBAIXO ──────────
    // Exatamente como nas refs 1 e 2: fundo sólido com texto em cima, foto na base
    if (variant === 0) {
      // Topo: fundo na cor secundária (amarelo/cor de acento)
      const topH = 520;
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(0, 0, width, topH);
      // Logo zone
      // Badge "Saindo de" no topo
      ctx.fillStyle = primaryColor;
      fillRoundRect(ctx, left, logoH + 36, 500, 66, 8, primaryColor);
      ctx.fillStyle = secondaryColor;
      ctx.font = "800 28px Inter, Arial, sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(badgeText, left + 20, logoH + 36 + 33);
      ctx.textBaseline = "alphabetic";
      // Headline enorme
      ctx.fillStyle = primaryColor;
      drawTextBlock(ctx, titleText, left, logoH + 148, contentWidth, 80, 2, { fontWeight: "900", baseFontSize: 88, minFontSize: 48 });
      // Separador + Benefits + Preço lado a lado
      const benefitsX = left; const priceX = left + 380;
      ctx.fillStyle = primaryColor;
      ctx.font = "700 32px Inter, Arial, sans-serif";
      ctx.fillText(ICON_SYMBOL["bus"] + " " + (highlights[0]?.text || "Transporte"), benefitsX, logoH + 310);
      ctx.fillText(ICON_SYMBOL["map"] + " " + (highlights[1]?.text || highlights[0]?.text || ""), benefitsX, logoH + 358);
      ctx.fillText(ICON_SYMBOL["guide"] + " " + (highlights[2]?.text || highlights[0]?.text || ""), benefitsX, logoH + 406);
      // Divisor vertical
      ctx.fillStyle = primaryColor; ctx.globalAlpha = 0.2;
      ctx.fillRect(priceX - 20, logoH + 280, 2, 140);
      ctx.globalAlpha = 1;
      // Preço lado direito
      ctx.fillStyle = "#555"; ctx.font = "600 22px Inter, Arial, sans-serif";
      ctx.fillText("por apenas", priceX, logoH + 310);
      ctx.fillStyle = primaryColor; ctx.font = "900 64px Inter, Arial, sans-serif";
      const priceStr = mainPrice || `R$ ${price}`;
      ctx.fillText(priceStr, priceX, logoH + 388);
      ctx.font = "600 22px Inter, Arial, sans-serif"; ctx.fillStyle = "#555";
      ctx.fillText("/pessoa", priceX, logoH + 422);
      // Foto na base
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
      // Fundo esquerdo (cor primária)
      ctx.fillStyle = primaryColor; ctx.fillRect(0, 0, panelW, height);
      // Fundo direito (cor secundária)
      ctx.fillStyle = secondaryColor; ctx.fillRect(panelW, 0, width - panelW, height);
      // Texto no painel esquerdo
      const px = left; const pw = panelW - left - 24;
      ctx.fillStyle = secondaryColor;
      ctx.font = "900 22px Inter, Arial, sans-serif";
      ctx.fillText((promoName || "OFERTA ESPECIAL").toUpperCase(), px, logoH + 54);
      ctx.fillStyle = "#ffffff";
      drawTextBlock(ctx, destUp, px, logoH + 100, pw, 88, 2, { fontWeight: "900", baseFontSize: 84, minFontSize: 40 });
      // Benefits como lista com check
      const hlStart = logoH + 290;
      highlights.slice(0, 4).forEach((h, i) => {
        fillRoundRect(ctx, px, hlStart + i * 82, pw, 68, 34, "rgba(255,255,255,0.14)");
        ctx.fillStyle = secondaryColor; ctx.font = "700 28px Inter, Arial, sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillText("✓", px + 18, hlStart + i * 82 + 34);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(h.text, px + 52, hlStart + i * 82 + 34);
        ctx.textBaseline = "alphabetic";
      });
      // Price card no painel esquerdo, base
      fillRoundRect(ctx, px, height - 200, pw, 172, 16, "rgba(0,0,0,0.3)");
      ctx.fillStyle = secondaryColor; ctx.font = "700 22px Inter, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("APENAS HOJE:", px + pw / 2, height - 168);
      ctx.fillStyle = "#ffffff"; ctx.font = "900 62px Inter, Arial, sans-serif";
      ctx.fillText(mainPrice || `R$ ${price}`, px + pw / 2, height - 100);
      ctx.font = "600 20px Inter, Arial, sans-serif";
      ctx.fillText("/pessoa", px + pw / 2, height - 68);
      ctx.textAlign = "left";
      // Fotos no lado direito: 2 empilhadas
      const gap1 = 16; const photoH1 = (height - gap1 * 3) / 2;
      [0, 1].forEach(i => {
        const pY = gap1 + i * (photoH1 + gap1);
        const c1 = fitCover(image.naturalWidth, image.naturalHeight, colW, photoH1, 0.38);
        ctx.save();
        fillRoundRect(ctx, colX, pY, colW, photoH1, 20, "#000");
        ctx.clip();
        ctx.drawImage(image, c1.sx, c1.sy, c1.sw, c1.sh, colX, pY, colW, photoH1);
        ctx.restore();
      });
      return canvas.toDataURL("image/png");
    }

    // ── V2 · REF "Santa Teresa" — 2 fotos canto superior + faixa + benefits ──
    // Topo: fundo branco/claro com logo. Foto canto superior direito.
    // Faixa de cor com headline. Metade inferior: benefits + preço.
    if (variant === 2) {
      ctx.fillStyle = "#f7f4ef"; ctx.fillRect(0, 0, width, height);
      // Foto superior DIREITA (60% largura, 44% altura)
      const fW2 = Math.round(width * 0.58); const fH2 = Math.round(height * 0.44);
      const c2 = fitCover(image.naturalWidth, image.naturalHeight, fW2, fH2, 0.36);
      ctx.save();
      fillRoundRect(ctx, width - fW2 - 16, 16, fW2, fH2, 22, "#ccc");
      ctx.clip();
      ctx.drawImage(image, c2.sx, c2.sy, c2.sw, c2.sh, width - fW2 - 16, 16, fW2, fH2);
      ctx.restore();
      // Faixa horizontal colorida (cor primária)
      const faixaY = fH2 + 28; const faixaH = 140;
      fillRoundRect(ctx, 0, faixaY, width, faixaH, 0, primaryColor);
      ctx.fillStyle = "#ffffff"; ctx.font = "900 56px Inter, Arial, sans-serif";
      drawTextBlock(ctx, titleText + " " + destUp + "!", left, faixaY + 94, contentWidth, 64, 1, { fontWeight: "900", baseFontSize: 56, minFontSize: 32 });
      // Benefits abaixo da faixa
      const belowY = faixaY + faixaH + 28;
      highlights.slice(0, 3).forEach((h, i) => {
        ctx.fillStyle = primaryColor; ctx.font = "700 32px Inter, Arial, sans-serif";
        ctx.fillText(ICON_SYMBOL[h.icon || "check"] + "  " + h.text, left, belowY + i * 68);
      });
      // Preço
      fillRoundRect(ctx, left, belowY + 228, 420, 86, 12, primaryColor);
      ctx.fillStyle = secondaryColor; ctx.font = "700 22px Inter, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("por apenas", left + 210, belowY + 264);
      ctx.fillStyle = "#ffffff"; ctx.font = "900 50px Inter, Arial, sans-serif";
      ctx.fillText(mainPrice || `R$ ${price}` + " /p.", left + 210, belowY + 318);
      ctx.textAlign = "left";
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
    ctx.fillText(mainPrice || `R$ ${price}`, width / 2, cardY3 + 312);
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "600 24px Inter, Arial, sans-serif";
    ctx.fillText("/pessoa · " + (installments || "10x") + " sem juros", width / 2, cardY3 + 356);
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
    // Exibe os 5 destaques no formato compacto para caber tudo
    drawHighlightsBlock(left + 28, pillsY, contentWidth - 56, 5, true, true);

    // Price card — SEMPRE abaixo dos pills, sem Math.min que causava sobreposição
    // Se tivermos 5 pills, a altura aumenta. Cada pill compact = 70px.
    const pillsCount = highlights.slice(0, 5).length;
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
