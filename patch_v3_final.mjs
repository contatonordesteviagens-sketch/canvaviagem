import fs from 'fs';
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(path, 'utf8');

const reps = [
  // Heights and gaps
  { from: 'const topPadding = 225;', to: 'const topPadding = 195;' },
  { from: 'const rowGap = 70;', to: 'const rowGap = 55;' },
  { from: 'const priceBlockTopGap = 45;', to: 'const priceBlockTopGap = 35;' },
  { from: 'const stripeGap = 25;', to: 'const stripeGap = 15;' },
  { from: 'const stripeH = 72;', to: 'const stripeH = 60;' },
  { from: 'const ringH = 160;', to: 'const ringH = 150;' },
  { from: 'const pacoteH = 56;', to: 'const pacoteH = 52;' },
  
  // Destino
  { from: 'let destSize = 58;', to: 'let destSize = 54;' },
  { from: 'safeFillText(ctx, destinoUp, cx, boxY + 145, boxW - 80, 24);', to: 'safeFillText(ctx, destinoUp, cx, boxY + 125, boxW - 80, 24);' },
  
  // Benefits
  { from: 'const iconSize = 64;', to: 'const iconSize = 54;' },
  { from: 'let bfs = isDuration ? 34 : 38;', to: 'let bfs = 32;' },
  
  // Price and texts
  { from: 'let priceSize = 95;', to: 'let priceSize = 85;' },
  { from: 'const priceBaseY = ringY + 115;', to: 'const priceBaseY = ringY + 105;' },
  { from: 'ctx.fillText(bottomSuffix || "por pessoa", priceCenterX, ringY + 144);', to: 'ctx.fillText(bottomSuffix || "por pessoa", priceCenterX, ringY + 135);' },
  { from: 'ctx.font = "900 28px Inter, Arial, sans-serif";\n          \n          const customBanner', to: 'ctx.font = "900 26px Inter, Arial, sans-serif";\n          \n          const customBanner' },
  { from: 'ctx.font = "800 26px Inter, Arial, sans-serif";\n            const pixLabelW = ctx.measureText("pix").width;', to: 'ctx.font = "800 24px Inter, Arial, sans-serif";\n            const pixLabelW = ctx.measureText("pix").width;' },
  { from: 'ctx.font = "900 26px Inter, Arial, sans-serif";\n            ctx.fillText("pix",', to: 'ctx.font = "900 24px Inter, Arial, sans-serif";\n            ctx.fillText("pix",' }
];

let replacedCount = 0;
for (const rep of reps) {
  if (content.includes(rep.from)) {
    content = content.replace(rep.from, rep.to);
    replacedCount++;
  } else {
    console.warn("Could not find string:\n" + rep.from);
  }
}

console.log("Replaced " + replacedCount + " items.");
if (replacedCount > 0) {
  fs.writeFileSync(path, content, 'utf8');
}
