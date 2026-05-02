type Format = "square" | "story";
type IconKey = "bus" | "hotel" | "plane" | "check" | "star" | "heart" | "sun" | "camera" | "map" | "food" | "ship" | "palm" | "coffee" | "guide" | "wifi";

export type PaymentMode =
  | "installments"
  | "installments_no_interest"
  | "cash"
  | "cash_discount"
  | "cash_pix_off"
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
  /** Quantidade de dias do pacote (ex: "7 dias"). Quando definido, sobrescreve a leitura via highlights[0]. */
  pacoteDays?: string;
  /** Ícones do pacote (ordem visual da linha de ícones do card CVC). */
  pacoteIcons?: IconKey[];
  /** Quando true, omite os centavos do preço principal (ex: 229 ao invés de 229,00). */
  hideCents?: boolean;
  /** Quando true, força exibir a faixa "5% OFF À VISTA NO PIX" no card CVC (V3/V4). Default: liga sozinho quando paymentMode = "cash_pix_off". */
  showPixStripe?: boolean;
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
    forceVariant,
    titleOverride,
    titleVariations,
    currencySymbol,
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
    // 6 variantes válidas: V0/V1/V2 (originais aprovados) + V3/V4/V5 (CVC fullbleed-topo-esquerdo,
    // CVC card centralizado topo, Split editorial 50/50 estilo Maragogi).
    const variant = typeof forceVariant === "number"
      ? ((forceVariant % 6) + 6) % 6
      : Math.abs(variation) % 6;
    const logoH = hasLogo ? 130 : 0;
    const destUp = (destination || "DESTINO").toUpperCase();

    // ── V0 · REF "Enseada" — painel cor TOPO + foto EMBAIXO ─────────────────
    // Painel superior (cor secundária) com altura ADAPTATIVA: encolhe quando há
    // pouco texto, expande quando o usuário adiciona mais benefits.
    if (variant === 0) {
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
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(0, 0, width, topH);

      // 6) Badge "Saindo de"
      const badgeY = logoH + 28;
      fillRoundRect(ctx, left, badgeY, 500, badgeH, 8, primaryColor);
      ctx.fillStyle = secondaryColor;
      ctx.font = "800 26px Inter, Arial, sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(badgeText, left + 20, badgeY + badgeH / 2);
      ctx.textBaseline = "alphabetic";

      // 7) Headline (1 linha, fonte adaptativa)
      ctx.fillStyle = primaryColor;
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

      ctx.fillStyle = primaryColor;
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
      ctx.fillStyle = primaryColor; ctx.globalAlpha = 0.2;
      ctx.fillRect(priceX - 24, rowTopY, 2, contentRowH);
      ctx.globalAlpha = 1;

      // Preço — agora CENTRALIZADO dentro do bloco direito
      const priceCenterX = priceX + priceBlockW / 2;
      ctx.textAlign = "center";
      ctx.fillStyle = primaryColor; ctx.font = "600 22px Inter, Arial, sans-serif";
      ctx.fillText((topLabel || "por apenas").toString(), priceCenterX, rowTopY + 28);
      const priceStr = mainPrice || `${curSym} ${price}`;
      // Auto-shrink do preço pra não vazar do bloco direito
      let priceFs = 64;
      ctx.font = `900 ${priceFs}px Inter, Arial, sans-serif`;
      while (ctx.measureText(priceStr).width > priceBlockW - 20 && priceFs > 30) {
        priceFs -= 4;
        ctx.font = `900 ${priceFs}px Inter, Arial, sans-serif`;
      }
      ctx.fillStyle = primaryColor;
      ctx.fillText(priceStr, priceCenterX, rowTopY + 92);
      ctx.font = "600 20px Inter, Arial, sans-serif"; ctx.fillStyle = primaryColor;
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
      // Fundo esquerdo (cor primária)
      ctx.fillStyle = primaryColor; ctx.fillRect(0, 0, panelW, height);
      // Fundo direito (cor secundária)
      ctx.fillStyle = secondaryColor; ctx.fillRect(panelW, 0, width - panelW, height);
      // Texto no painel esquerdo
      const px = left; const pw = panelW - left - 24;
      ctx.fillStyle = secondaryColor;
      ctx.font = "900 22px Inter, Arial, sans-serif";
      ctx.fillText((promoName || "OFERTA ESPECIAL").toUpperCase(), px, logoH + 54);
      // Destino grande
      ctx.fillStyle = "#ffffff";
      drawTextBlock(ctx, destUp, px, logoH + 100, pw, 78, 2, { fontWeight: "900", baseFontSize: 72, minFontSize: 36 });

      // Headline (titleText escolhido pelo usuário) — abaixo do destino
      ctx.fillStyle = secondaryColor;
      ctx.font = "800 24px Inter, Arial, sans-serif";
      drawTextBlock(ctx, titleText, px, logoH + 240, pw, 30, 2, { fontWeight: "800", baseFontSize: 24, minFontSize: 16 });

      // Benefits — até 6 itens em pílulas, altura adaptativa
      const benefitsListV1 = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 6);
      const hlStart = logoH + 320;
      const pillH = benefitsListV1.length <= 4 ? 68 : benefitsListV1.length === 5 ? 56 : 50;
      const pillGap = benefitsListV1.length <= 4 ? 14 : 10;
      const pillFont = benefitsListV1.length <= 4 ? 28 : benefitsListV1.length === 5 ? 24 : 22;
      benefitsListV1.forEach((h, i) => {
        const py = hlStart + i * (pillH + pillGap);
        fillRoundRect(ctx, px, py, pw, pillH, pillH / 2, "rgba(255,255,255,0.14)");
        ctx.fillStyle = secondaryColor; ctx.font = `700 ${pillFont}px Inter, Arial, sans-serif`;
        ctx.textBaseline = "middle";
        ctx.fillText(ICON_SYMBOL[h.icon || "check"] || "✓", px + 18, py + pillH / 2);
        ctx.fillStyle = "#ffffff";
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
      // Price card no painel esquerdo, base — usa topLabel custom se houver
      fillRoundRect(ctx, px, height - 200, pw, 172, 16, "rgba(0,0,0,0.3)");
      ctx.fillStyle = secondaryColor; ctx.font = "700 22px Inter, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((topLabel || "APENAS HOJE:").toString().toUpperCase(), px + pw / 2, height - 168);
      ctx.fillStyle = "#ffffff";
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

      // Lista completa de benefits (até 6) — TODOS devem aparecer
      const benefitsListV2 = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 6);
      const benefitsCountV2 = Math.max(1, benefitsListV2.length);

      // 1) Card de preço — ancorado à base e centralizado para não pesar só à esquerda
      const priceCardW = Math.round(width * 0.66);
      const priceCardH = 168;
      const priceCardX = Math.round((width - priceCardW) / 2);
      const priceCardY = height - 56 - priceCardH;
      fillRoundRect(ctx, priceCardX, priceCardY, priceCardW, priceCardH, 16, primaryColor);
      ctx.fillStyle = secondaryColor; ctx.font = "700 24px Inter, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((topLabel || "por apenas").toString(), priceCardX + priceCardW / 2, priceCardY + 40);
      ctx.fillStyle = "#ffffff";
      // Auto-shrink preço V2
      const priceStrV2 = mainPrice || `${curSym} ${price}`;
      let pfsV2 = 64;
      ctx.font = `900 ${pfsV2}px Inter, Arial, sans-serif`;
      while (ctx.measureText(priceStrV2).width > priceCardW - 40 && pfsV2 > 28) {
        pfsV2 -= 4;
        ctx.font = `900 ${pfsV2}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(priceStrV2, priceCardX + priceCardW / 2, priceCardY + 108);
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
      fillRoundRect(ctx, 0, faixaY, width, faixaH, 0, primaryColor);
      ctx.fillStyle = "#ffffff";
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
        ctx.fillStyle = primaryColor;
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

    // ─────────────────────────────────────────────────────────────────────────
    // Helper: card "CVC" amarelo arredondado (PACOTE/DESTINO + ícones + 12X+R$
    // gigante + Total + faixa PIX). Usado por V3 e V4.
    // ─────────────────────────────────────────────────────────────────────────
    const drawCvcStyleCard = (cardX: number, cardY: number, cardW: number, opts?: { tagText?: string }) => {
      const cardH = 380;
      const radius = 28;
      // Sombra suave
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 8;
      fillRoundRect(ctx, cardX, cardY, cardW, cardH, radius, secondaryColor);
      ctx.restore();

      ctx.fillStyle = primaryColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      const cx = cardX + cardW / 2;
      const innerPad = 28;
      const innerW = cardW - innerPad * 2;

      // Etiqueta superior
      ctx.font = `900 28px Inter, Arial, sans-serif`;
      ctx.fillText((opts?.tagText || "PACOTE").toUpperCase(), cx, cardY + 50);

      // Destino grande (até 2 linhas se couber)
      const destUpper = (destination || "DESTINO").toUpperCase();
      let destSize = 64;
      ctx.font = `900 ${destSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(destUpper).width > innerW && destSize > 28) {
        destSize -= 4;
        ctx.font = `900 ${destSize}px Inter, Arial, sans-serif`;
      }
      ctx.fillText(destUpper, cx, cardY + 50 + destSize + 10);

      // Linha "X dias" + ícones
      const firstHL = highlights[0];
      const firstHLText = typeof firstHL === "string" ? firstHL : (firstHL?.text || "");
      const days = firstHLText.match(/(\d+)\s*dias?/i)?.[0] || "5 dias";
      ctx.font = `700 26px Inter, Arial, sans-serif`;
      ctx.fillText(`${days}   ✈   🚌   🏨   ☕   📷`, cx, cardY + 50 + destSize + 60);

      // "a partir de" + 12X selo + preço
      const baseLineY = cardY + 220;
      ctx.font = `600 18px Inter, Arial, sans-serif`;
      ctx.fillText("a partir de", cx, baseLineY);

      const installmentsText = (installments || "12X").toUpperCase().replace(/\s+/g, "");
      const priceText = mainPrice || `${curSym} ${price}`;
      let priceFs = 78;
      ctx.font = `900 ${priceFs}px Inter, Arial, sans-serif`;
      while (ctx.measureText(priceText).width > innerW * 0.62 && priceFs > 36) {
        priceFs -= 4;
        ctx.font = `900 ${priceFs}px Inter, Arial, sans-serif`;
      }
      const priceW = ctx.measureText(priceText).width;
      const badgeW = 96;
      const badgeH = 70;
      const gap = 16;
      const groupW = badgeW + gap + priceW;
      const groupX = cx - groupW / 2;
      const priceY = baseLineY + 70;

      // Selo 12X
      fillRoundRect(ctx, groupX, priceY - badgeH / 2 - 6, badgeW, badgeH, 14, primaryColor);
      ctx.fillStyle = secondaryColor;
      ctx.font = `900 28px Inter, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(installmentsText, groupX + badgeW / 2, priceY - 6);
      ctx.font = `700 11px Inter, Arial, sans-serif`;
      ctx.fillText("sem juros", groupX + badgeW / 2, priceY + 16);

      // Preço gigante
      ctx.fillStyle = primaryColor;
      ctx.textAlign = "left";
      ctx.font = `900 ${priceFs}px Inter, Arial, sans-serif`;
      ctx.fillText(priceText, groupX + badgeW + gap, priceY + priceFs / 3);

      // Total por pessoa
      ctx.fillStyle = primaryColor;
      ctx.font = `600 18px Inter, Arial, sans-serif`;
      ctx.textAlign = "center";
      if (bottomSuffix) {
        ctx.fillText(bottomSuffix, cx, cardY + 308);
      }

      // Faixa PIX inferior (cor primária)
      const stripeH = 48;
      const stripeY = cardY + cardH - stripeH;
      ctx.save();
      roundRect(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.clip();
      ctx.fillStyle = primaryColor;
      ctx.fillRect(cardX, stripeY, cardW, stripeH);
      ctx.restore();
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 20px Inter, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("5% OFF À VISTA NO PIX  💠", cx, stripeY + 30);

      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    };

    // ── V3 · CVC FULLBLEED — foto cobre, card amarelo no canto SUPERIOR ESQUERDO ──
    if (variant === 3) {
      const c3 = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.55);
      ctx.drawImage(image, c3.sx, c3.sy, c3.sw, c3.sh, 0, 0, width, height);
      // Vinheta inferior pra texto/marca caso queira
      const g3 = ctx.createLinearGradient(0, height * 0.65, 0, height);
      g3.addColorStop(0, "rgba(0,0,0,0)");
      g3.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = g3;
      ctx.fillRect(0, height * 0.65, width, height * 0.35);

      // Card no canto superior esquerdo
      const cardW = Math.round(width * 0.50);
      const cardX = 60;
      const cardY = 60 + (hasLogo ? 100 : 0);
      drawCvcStyleCard(cardX, cardY, cardW, { tagText: "PACOTE" });

      // Caption inferior (1 linha discreta) — usa titleText ou subtítulo
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 24px Inter, Arial, sans-serif";
      ctx.textAlign = "left";
      const cap = (titleText || subtitleText || "").trim();
      if (cap) {
        let cs = 24;
        ctx.font = `700 ${cs}px Inter, Arial, sans-serif`;
        while (ctx.measureText(cap).width > contentWidth && cs > 14) {
          cs -= 2;
          ctx.font = `700 ${cs}px Inter, Arial, sans-serif`;
        }
        ctx.fillText(cap, left, height - 60);
      }
      return canvas.toDataURL("image/png");
    }

    // ── V4 · CVC FULLBLEED — foto cobre, card amarelo CENTRALIZADO no TOPO ──
    if (variant === 4) {
      const c4 = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.62);
      ctx.drawImage(image, c4.sx, c4.sy, c4.sw, c4.sh, 0, 0, width, height);
      const g4 = ctx.createLinearGradient(0, 0, 0, height * 0.55);
      g4.addColorStop(0, "rgba(0,0,0,0.25)");
      g4.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g4;
      ctx.fillRect(0, 0, width, height * 0.55);

      const cardW = Math.round(width * 0.62);
      const cardX = Math.round((width - cardW) / 2);
      const cardY = 80 + (hasLogo ? 110 : 0);
      drawCvcStyleCard(cardX, cardY, cardW, { tagText: "CIRCUITO" });

      // Headline inferior (caption)
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      const cap2 = (titleText || "").trim();
      if (cap2) {
        let cs2 = 30;
        ctx.font = `800 ${cs2}px Inter, Arial, sans-serif`;
        while (ctx.measureText(cap2).width > contentWidth && cs2 > 16) {
          cs2 -= 2;
          ctx.font = `800 ${cs2}px Inter, Arial, sans-serif`;
        }
        ctx.fillText(cap2, width / 2, height - 70);
      }
      ctx.textAlign = "left";
      return canvas.toDataURL("image/png");
    }

    // ── V5 · SPLIT EDITORIAL 50/50 — esquerda creme + foto direita ──
    // Estilo "Conheça Maragogi": coluna creme à esquerda com badge título flutuante
    // (cor primária, arredondado), benefits com ícones, card de preço; foto na direita.
    if (variant === 5) {
      const splitX = Math.round(width * 0.48);
      // Esquerda: creme suave
      ctx.fillStyle = "#fbf6ec";
      ctx.fillRect(0, 0, splitX, height);
      // Direita: foto preenchendo
      const c5 = fitCover(image.naturalWidth, image.naturalHeight, width - splitX, height, 0.40);
      ctx.drawImage(image, c5.sx, c5.sy, c5.sw, c5.sh, splitX, 0, width - splitX, height);

      // Badge "@instagram" topo-esquerdo (mantém vibe da ref, mas discreto)
      const tagY = 80 + (hasLogo ? 120 : 0);
      ctx.fillStyle = primaryColor;
      ctx.font = "800 22px Inter, Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`✈  ${cityFmt ? `Saindo de ${cityFmt}` : "Pacote completo"}`, 60, tagY);

      // Badge título flutuante — atravessa o split (sai um pouco para a foto)
      const titleBoxY = tagY + 50;
      const titleBoxX = 40;
      const titleBoxW = splitX - titleBoxX + 80; // estende sobre a foto
      // Calcula altura proporcional ao título
      ctx.textAlign = "left";
      let v5Size = 80;
      ctx.font = `900 ${v5Size}px Inter, Arial, sans-serif`;
      const t5 = (titleText || "Conheça o destino").trim();
      while (ctx.measureText(t5).width > titleBoxW - 80 && v5Size > 36) {
        v5Size -= 4;
        ctx.font = `900 ${v5Size}px Inter, Arial, sans-serif`;
      }
      // Word-wrap até 2 linhas
      const wordsT = t5.split(/\s+/);
      const linesT: string[] = [];
      let curT = "";
      for (const w of wordsT) {
        const tst = curT ? `${curT} ${w}` : w;
        if (ctx.measureText(tst).width <= titleBoxW - 80) curT = tst;
        else { if (curT) linesT.push(curT); curT = w; if (linesT.length === 1) break; }
      }
      if (curT && linesT.length < 2) linesT.push(curT);
      const titleBoxH = linesT.length * (v5Size * 1.05) + 50;

      // Sombra suave do badge
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 6;
      fillRoundRect(ctx, titleBoxX, titleBoxY, titleBoxW, titleBoxH, 18, primaryColor);
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${v5Size}px Inter, Arial, sans-serif`;
      linesT.forEach((ln, i) => {
        ctx.fillText(ln, titleBoxX + 36, titleBoxY + 50 + i * v5Size * 1.05);
      });

      // Benefits (até 4) com ícone grande e label
      const benY = titleBoxY + titleBoxH + 60;
      const benList = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 4);
      benList.forEach((h, i) => {
        const by = benY + i * 80;
        ctx.fillStyle = primaryColor;
        ctx.font = "700 50px Inter, Arial, sans-serif";
        ctx.fillText(ICON_SYMBOL[h.icon || "check"] || "✓", 70, by + 50);
        ctx.fillStyle = "#1a1a1a";
        let bfs = 42;
        ctx.font = `800 ${bfs}px Inter, Arial, sans-serif`;
        const benMaxW = splitX - 160;
        while (ctx.measureText(h.text).width > benMaxW && bfs > 22) {
          bfs -= 2;
          ctx.font = `800 ${bfs}px Inter, Arial, sans-serif`;
        }
        ctx.fillText(h.text, 150, by + 48);
      });

      // Card de preço (cor primária, arredondado) — na base esquerda
      const cardW5 = Math.round(splitX * 0.78);
      const cardH5 = 110;
      const cardX5 = 50;
      const cardY5 = height - cardH5 - 80;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.20)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      fillRoundRect(ctx, cardX5, cardY5, cardW5, cardH5, cardH5 / 2, primaryColor);
      ctx.restore();

      // Etiqueta "A partir de"  +  parcelas/preço
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.font = "700 16px Inter, Arial, sans-serif";
      const labelTop = (topLabel || "A partir de").toString();
      ctx.fillText(labelTop, cardX5 + 30, cardY5 + 38);
      ctx.font = "700 18px Inter, Arial, sans-serif";
      ctx.fillText(`${(installments || "10x").toLowerCase()} ${curSym}`, cardX5 + 30, cardY5 + 70);

      // Preço gigante centralizado-direita
      const priceStr5 = (priceValueText || "0,00");
      let pfs5 = 56;
      ctx.font = `900 ${pfs5}px Inter, Arial, sans-serif`;
      while (ctx.measureText(priceStr5).width > cardW5 * 0.55 && pfs5 > 28) {
        pfs5 -= 4;
        ctx.font = `900 ${pfs5}px Inter, Arial, sans-serif`;
      }
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "right";
      ctx.fillText(priceStr5, cardX5 + cardW5 - 28, cardY5 + cardH5 / 2 + pfs5 / 3);

      ctx.textAlign = "left";

      // Linha sutil sob o card (vibe Maragogi)
      ctx.strokeStyle = primaryColor;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(50, cardY5 + cardH5 + 30);
      ctx.lineTo(splitX - 60, cardY5 + cardH5 + 30);
      ctx.stroke();
      ctx.globalAlpha = 1;

      return canvas.toDataURL("image/png");
    }

    // Fallback (não deve cair aqui — todas as 6 variantes têm return acima)
    const cF = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.4);
    ctx.drawImage(image, cF.sx, cF.sy, cF.sw, cF.sh, 0, 0, width, height);
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
