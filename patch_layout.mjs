import fs from 'fs';
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(path, 'utf8');

// The replacements we want to make:
const replacements = [
  // 1. rowGap
  { from: "const rowGap = 95;", to: "const rowGap = 70;" },
  
  // 2. topPadding
  { from: "const topPadding = 250;", to: "const topPadding = 225;" },
  
  // 3. priceBlockTopGap
  { from: "const priceBlockTopGap = 65;", to: "const priceBlockTopGap = 45;" },
  
  // 4. ringH
  { from: "const ringH = 190;", to: "const ringH = 160;" },
  
  // 5. stripeGap
  { from: "const stripeGap = 35;", to: "const stripeGap = 25;" },
  
  // 6. stripeH
  { from: "const stripeH = 64;", to: "const stripeH = 72;" },
  
  // 7. pacoteH (badge height)
  { from: "const pacoteH = 64;", to: "const pacoteH = 56;" },
  
  // 8. pacoteText size
  { from: "ctx.font = \"900 38px Inter, Arial, sans-serif\";\n        const pacoteW = ctx.measureText(pacoteText).width + 70;", to: "ctx.font = \"900 32px Inter, Arial, sans-serif\";\n        const pacoteW = ctx.measureText(pacoteText).width + 70;" },
  
  // 9. Destino
  { from: "let destSize = 68;", to: "let destSize = 58;" },
  { from: "safeFillText(ctx, destinoUp, cx, boxY + 165, boxW - 80, 24);", to: "safeFillText(ctx, destinoUp, cx, boxY + 145, boxW - 80, 24);" },
  
  // 10. benefits text size
  { from: "let bfs = isDuration ? 37 : 49;", to: "let bfs = isDuration ? 34 : 38;" },
  
  // 11. Top label text size ("A PARTIR DE") and Y
  { from: "ctx.font = \"800 24px Inter, Arial, sans-serif\";\n        ctx.fillText(topLabelRender, priceCenterX, ringY + 36);", to: "ctx.font = \"800 28px Inter, Arial, sans-serif\";\n        ctx.fillText(topLabelRender, priceCenterX, ringY + 32);" },
  
  // 12. Price size
  { from: "let priceSize = 100;", to: "let priceSize = 95;" },
  { from: "const priceBaseY = ringY + 128;", to: "const priceBaseY = ringY + 105;" },
  
  // 13. Bottom suffix text size ("por pessoa") and Y
  { from: "ctx.font = \"800 22px Inter, Arial, sans-serif\";\n        ctx.fillText(bottomSuffix || \"por pessoa\", priceCenterX, ringY + 172);", to: "ctx.font = \"800 26px Inter, Arial, sans-serif\";\n        ctx.fillText(bottomSuffix || \"por pessoa\", priceCenterX, ringY + 140);" },
  
  // 14. Pix banner text size
  { from: "ctx.font = \"900 24px Inter, Arial, sans-serif\";\n          \n          const customBanner", to: "ctx.font = \"900 28px Inter, Arial, sans-serif\";\n          \n          const customBanner" },
  { from: "ctx.font = \"800 24px Inter, Arial, sans-serif\";\n            const pixLabelW = ctx.measureText(\"pix\").width;", to: "ctx.font = \"800 26px Inter, Arial, sans-serif\";\n            const pixLabelW = ctx.measureText(\"pix\").width;" },
  { from: "ctx.font = \"900 24px Inter, Arial, sans-serif\";\n            ctx.fillText(\"pix\"", to: "ctx.font = \"900 26px Inter, Arial, sans-serif\";\n            ctx.fillText(\"pix\"" }
];

let replacedCount = 0;
for (const rep of replacements) {
  if (content.includes(rep.from)) {
    content = content.replace(rep.from, rep.to);
    replacedCount++;
  } else {
    console.warn("Could not find string:\n" + rep.from);
  }
}

console.log("Replaced " + replacedCount + " out of " + replacements.length);
if (replacedCount > 0) {
    fs.writeFileSync(path, content, 'utf8');
}
