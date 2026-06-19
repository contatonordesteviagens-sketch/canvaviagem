import fs from 'fs';
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(path, 'utf8');

const reps = [
  { from: 'ctx.fillText(topLabelRender, priceCenterX, ringY + 32); // Movido para cima', to: 'ctx.fillText(topLabelRender, priceCenterX, ringY + 28); // Movido para cima' },
  { from: 'const priceBaseY = ringY + 105; // Movido para cima', to: 'const priceBaseY = ringY + 115; // Movido para cima' },
  { from: 'ctx.fillText(bottomSuffix || "por pessoa", priceCenterX, ringY + 140); // Movido para cima', to: 'ctx.fillText(bottomSuffix || "por pessoa", priceCenterX, ringY + 144); // Movido para cima' }
];

let replacedCount = 0;
for (const rep of reps) {
  if (content.includes(rep.from)) {
    content = content.replace(rep.from, rep.to);
    replacedCount++;
  }
}

console.log("Replaced " + replacedCount + " items.");
if (replacedCount > 0) {
  fs.writeFileSync(path, content, 'utf8');
}
