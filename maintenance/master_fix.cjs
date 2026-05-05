const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/fabrica-compose-art.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Rewrite drawMonoIcon (Robust version)
const drawMonoIconCode = `function drawMonoIcon(
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
}`;

// 2. Restore V0 logic and fix topH
const V0_FIX = `      const v0BadgeBg = primaryColor;
      const v0OnBadge = ensureContrast(secondaryColor, v0BadgeBg, 0.35);
      // 1) Calcula tamanho do titulo para saber a altura real
      ctx.textAlign = "left";
      let titleSize = 78;
      ctx.font = \`900 \${titleSize}px Inter, Arial, sans-serif\`;
      while (ctx.measureText(titleText).width > contentWidth && titleSize > 38) {
        titleSize -= 4;
        ctx.font = \`900 \${titleSize}px Inter, Arial, sans-serif\`;
      }

      // 2) Quantidade de benefits que serao exibidos (ate 6) - TODOS aparecem
      const benefitsList = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 6);
      const benefitsCount = Math.max(1, benefitsList.length);
      const benefitLineH = benefitsCount <= 4 ? 44 : benefitsCount === 5 ? 38 : 34;
      const benefitsBlockH = benefitsCount * benefitLineH;

      // 3) Altura do bloco preco (fixa, ~120px)
      const priceBlockH = 120;
      const contentRowH = Math.max(benefitsBlockH, priceBlockH);

      // 4) Altura ADAPTATIVA do painel:
      const badgeH = 60;
      const topPaddingBeforeTitle = 60;
      const titleToContent = 50;
      const bottomPadding = 60;
      const topH = Math.min(
        Math.round(height * 0.54),
        Math.max(
          Math.round(height * 0.40),
          logoH + 40 + badgeH + topPaddingBeforeTitle + titleSize + titleToContent + contentRowH + bottomPadding
        )
      );`;

// Replace functions
function replaceBlock(startMarker, endMarker, newContent) {
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker, start);
  if (start !== -1 && end !== -1) {
    content = content.substring(0, start) + newContent + content.substring(end + endMarker.length);
    return true;
  }
  return false;
}

replaceBlock('function drawMonoIcon(', 'ctx.restore();\n}', drawMonoIconCode);

// Sanitization
content = content.replace(/├Ç/g, 'A').replace(/├í/g, 'a').replace(/├¬/g, 'e').replace(/├®/g, 'e').replace(/├│/g, 'o').replace(/├║/g, 'u').replace(/├º/g, 'c').replace(/├┤/g, 'o').replace(/├⌐/g, 'e').replace(/ÔùÅ/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Master fix applied successfully');
