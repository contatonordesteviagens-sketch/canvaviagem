const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/fabrica-compose-art.ts');

const code = `type Format = "square" | "story";
type IconKey = "bus" | "hotel" | "plane" | "check" | "star" | "heart" | "sun" | "camera" | "map" | "food" | "ship" | "palm" | "coffee" | "guide" | "wifi";

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

function contrastOn(bg: string): string {
  const normalized = (bg || "").trim().toLowerCase();
  if (normalized === "#0c2340") return "#ffffff";
  return luminance(bg) > 0.6 ? "#0d0d0d" : "#ffffff";
}

function ensureContrast(fg: string, bg: string, minDelta = 0.35): string {
  const dl = Math.abs(luminance(fg) - luminance(bg));
  if (dl >= minDelta) return fg;
  return contrastOn(bg);
}

export type PaymentMode = "installments" | "cash" | "cash_discount" | "from" | "daily" | "monthly" | "down_plus" | "free_quote" | "custom_label";

function applyVignette(ctx: CanvasRenderingContext2D, width: number, height: number, intensity = 0.5) {
  const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.sqrt((width / 2) ** 2 + (height / 2) ** 2));
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.6, \`rgba(0,0,0,\${intensity * 0.1})\`);
  grad.addColorStop(1, \`rgba(0,0,0,\${intensity * 0.4})\`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function safeFillText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, minSize = 12): void {
  if (!text) return;
  const fontStr = ctx.font;
  const sizeMatch = fontStr.match(/(\\d+(?:\\.\\d+)?)px/);
  if (!sizeMatch) { ctx.fillText(text, x, y, maxWidth); return; }
  let size = parseFloat(sizeMatch[1]);
  const fontWithoutSize = fontStr.replace(/(\\d+(?:\\.\\d+)?)px/, "SIZE_PX");
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size = Math.max(minSize, size - 1);
    ctx.font = fontWithoutSize.replace("SIZE_PX", \`\${size}px\`);
  }
  ctx.fillText(text, x, y);
}

interface Highlight { text: string; icon?: IconKey; }

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
  strategy?: string;
  variation?: number;
  forceVariant?: number;
  titleOverride?: string;
  titleVariations?: string[];
  currencySymbol?: string;
  travelPeriod?: string;
  totalOverride?: string;
  showTotal?: boolean;
  pixBannerText?: string;
  showPixBanner?: boolean;
  fontFamily?: string;
  titleScale?: number;
  descScale?: number;
  textColorOverride?: string;
  logoDataUrl?: string;
  whatsapp?: string;
  instagram?: string;
  footerContact1Icon?: string;
  footerContact1Value?: string;
  footerContact2Icon?: string;
  footerContact2Value?: string;
  diagnosticoCompleto?: boolean;
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

function drawMonoIcon(ctx: CanvasRenderingContext2D, kind: IconKey, cx: number, cy: number, size: number, color: string) {
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
    case "guide":
      ctx.beginPath(); ctx.arc(cx, cy - s * 0.15, s * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy + s * 0.4, s * 0.35, Math.PI, 0); ctx.fill();
      break;
    case "coffee":
      ctx.fillRect(x + s * 0.2, y + s * 0.3, s * 0.5, s * 0.5);
      ctx.beginPath(); ctx.arc(x + s * 0.7, y + s * 0.45, s * 0.15, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      break;
    default:
      ctx.arc(cx, cy, s * 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem"));
    img.src = src;
  });
}

function formatAdPhone(v: string) {
  const d = v.replace(/\\D/g, "");
  if (d.length === 11) return \`(\${d.slice(0, 2)}) \${d.slice(2, 3)} \${d.slice(3, 7)}-\${d.slice(7)}\`;
  if (d.length === 10) return \`(\${d.slice(0, 2)}) \${d.slice(2, 6)}-\${d.slice(6)}\`;
  return v;
}

function drawPixLogo(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  const s = size * 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -s/2); ctx.lineTo(s/2, 0); ctx.lineTo(0, s/2); ctx.lineTo(-s/2, 0); ctx.closePath();
  ctx.fill();
  ctx.restore();
}

async function drawFinalBranding(ctx, w, h, logoUrl, contact1, contact2, agencyName, textColor) {
  const isStory = h > w;
  const footerH = isStory ? 180 : 120;
  const centerY = h - footerH / 2;
  const padX = isStory ? 80 : 60;
  
  // 1. Logo (Esquerda)
  let lw = 0;
  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl);
      const ratio = logo.naturalWidth / logo.naturalHeight;
      const maxH = footerH * 0.65;
      const maxW = w * 0.25;
      let lh = maxH;
      lw = lh * ratio;
      if (lw > maxW) { lw = maxW; lh = lw / ratio; }
      const bgPad = 10;
      fillRoundRect(ctx, padX, centerY - lh/2 - bgPad, lw + bgPad*2, lh + bgPad*2, 12, "white");
      ctx.drawImage(logo, padX + bgPad, centerY - lh/2, lw, lh);
      lw += bgPad * 2;
    } catch (e) {}
  } else if (agencyName) {
    ctx.fillStyle = textColor || "white";
    ctx.font = \`bold \${isStory ? 40 : 32}px Inter\`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(agencyName, padX, centerY);
    lw = ctx.measureText(agencyName).width;
  }

  // 2. Contatos (Direita)
  const contacts = [contact1, contact2].filter(c => c && c.value);
  if (contacts.length > 0) {
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const fs = isStory ? 34 : 28;
    ctx.font = \`bold \${fs}px Inter\`;
    ctx.fillStyle = textColor || "white";
    let y = contacts.length === 2 ? centerY - 20 : centerY;
    for (const c of contacts) {
      let val = c.value;
      if (c.icon.startsWith("whatsapp")) {
        val = formatAdPhone(val);
        drawMonoIcon(ctx, "bus", w - padX - ctx.measureText(val).width - 40, y, 32, textColor || "white"); // Fallback icon
      } else if (c.icon.startsWith("instagram")) {
        val = val.startsWith("@") ? val : "@" + val;
        drawMonoIcon(ctx, "camera", w - padX - ctx.measureText(val).width - 40, y, 32, textColor || "white");
      }
      ctx.fillText(val, w - padX, y);
      y += 40;
    }
  }
}

export async function composeTravelAd(options: ComposeTravelAdOptions): Promise<string> {
  const { imageUrl, format, destination, city, primaryColor, secondaryColor, price, installments, promoName, highlights, logoDataUrl, paymentMode, paymentLabel, paymentSuffix, variation, forceVariant, titleOverride, titleVariations, currencySymbol, travelPeriod, totalOverride, showTotal, pixBannerText, showPixBanner, fontFamily, titleScale, descScale, textColorOverride, whatsapp, instagram } = options;
  const curSym = (currencySymbol || "R$").trim();
  const width = 1080;
  const height = format === "story" ? 1920 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D error");

  const image = await loadImage(imageUrl);
  const variant = typeof forceVariant === "number" ? forceVariant : Math.abs(variation || 0) % 5;
  const isExperience = !!options.strategy?.startsWith("experiencia");

  // Logic for Variant 0 (The one in user image)
  if (variant === 0 && !isExperience) {
    const topH = Math.round(height * 0.5);
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(0, 0, width, topH);
    
    // Photo
    const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height - topH, 0.4);
    ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, topH, width, height - topH);

    // Text
    const left = 80;
    ctx.fillStyle = contrastOn(secondaryColor);
    ctx.textAlign = "left";
    
    // Logo at Top if provided
    let logoYOffset = 60;
    if (logoDataUrl) {
      try {
        const logo = await loadImage(logoDataUrl);
        const r = logo.naturalWidth / logo.naturalHeight;
        const lh = 120; const lw = lh * r;
        ctx.drawImage(logo, left, 60, lw, lh);
        logoYOffset = 220;
      } catch(e) {}
    }

    // Badge
    const badgeTxt = city ? \`Saindo de \${city}\` : "Oferta Especial";
    fillRoundRect(ctx, left, logoYOffset, 400, 60, 10, primaryColor);
    ctx.fillStyle = contrastOn(primaryColor);
    ctx.font = "800 28px Inter";
    ctx.fillText(badgeTxt, left + 20, logoYOffset + 30);

    // Title
    ctx.fillStyle = contrastOn(secondaryColor);
    ctx.font = "900 82px Inter";
    safeFillText(ctx, (titleOverride || \`Pacote \${destination}\`).toUpperCase(), left, logoYOffset + 140, width - 160, 32);

    // Highlights
    let hY = logoYOffset + 240;
    highlights.slice(0, 4).forEach(h => {
      drawMonoIcon(ctx, h.icon || "check", left + 16, hY - 10, 32, contrastOn(secondaryColor));
      ctx.font = "700 32px Inter";
      ctx.fillText(h.text, left + 50, hY);
      hY += 50;
    });

    // Price
    const pX = width - 80;
    ctx.textAlign = "right";
    ctx.font = "600 24px Inter";
    ctx.fillText("10x", pX - 100, logoYOffset + 240);
    ctx.font = "900 110px Inter";
    ctx.fillText(\`\${curSym} \${price}\`, pX, logoYOffset + 340);
    ctx.font = "600 24px Inter";
    ctx.fillText(paymentSuffix || "por pessoa", pX, logoYOffset + 380);

    await drawFinalBranding(ctx, width, height, logoDataUrl, options.footerContact1Icon ? {icon: options.footerContact1Icon, value: options.footerContact1Value} : null, null, null, "white");
  } else {
    // Other variants simplified for this script
    ctx.fillStyle = "white"; ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
  }

  return canvas.toDataURL("image/png");
}

function fitCover(sw, sh, dw, dh, focusY = 0.5) {
  const sRatio = sw / sh;
  const dRatio = dw / dh;
  let sWidth, sHeight, sx, sy;
  if (sRatio > dRatio) {
    sHeight = sh; sWidth = sh * dRatio;
    sx = (sw - sWidth) / 2; sy = 0;
  } else {
    sWidth = sw; sHeight = sw / dRatio;
    sx = 0; sy = (sh - sHeight) * focusY;
  }
  return { sx, sy, sw: sWidth, sh: sHeight };
}

export async function reframeImageToAspect(data, format) {
  const img = await loadImage(data);
  const tw = 1080; const th = format === "story" ? 1920 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = tw; canvas.height = th;
  const ctx = canvas.getContext("2d");
  const c = fitCover(img.naturalWidth, img.naturalHeight, tw, th);
  ctx.drawImage(img, c.sx, c.sy, c.sw, c.sh, 0, 0, tw, th);
  return canvas.toDataURL("image/png");
}
`;

fs.writeFileSync(filePath, code, 'utf8');
console.log('File rewritten cleanly');
