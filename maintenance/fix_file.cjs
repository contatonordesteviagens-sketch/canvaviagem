const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/fabrica-compose-art.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix drawMonoIcon
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

const startMarker = 'function drawMonoIcon(';
const endMarker = 'ctx.restore();\n}';
const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex) + endMarker.length;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + drawMonoIconCode + content.substring(endIndex);
}

// 2. Fix garbled strings
content = content.replace(/├Ç/g, 'A')
                 .replace(/├í/g, 'a')
                 .replace(/├¬/g, 'e')
                 .replace(/├®/g, 'e')
                 .replace(/├│/g, 'o')
                 .replace(/├║/g, 'u')
                 .replace(/├º/g, 'c')
                 .replace(/├┤/g, 'o')
                 .replace(/├⌐/g, 'e')
                 .replace(/ÔùÅ/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('File fixed successfully');
