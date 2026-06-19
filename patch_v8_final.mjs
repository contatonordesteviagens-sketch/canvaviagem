import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

// Title 2px above
code = code.replace(
    'const titleStartY = pillY + pillH + Math.round(height * (isStoryV8Luxury ? 0.04 : 0.025)) + leadLineH / 2;',
    'const titleStartY = pillY + pillH + Math.round(height * (isStoryV8Luxury ? 0.04 : 0.025)) + leadLineH / 2 - 2;'
);

// Date Pill (Amarelo da data) hugging text tighter
code = code.replace(
    'const infoW = Math.min(width - pad * 2, Math.max(width * 0.42, ctx.measureText(infoText).width + 84));',
    'const infoW = Math.min(width - pad * 2, Math.max(width * 0.28, ctx.measureText(infoText).width + 44));'
);

// Decrease Widths (Boxes thinner)
code = code.replace(
    'const priceBoxW = Math.round(width * (isStoryV8Luxury ? 0.45 : 0.41));\n      const cardW = Math.round(width * (isStoryV8Luxury ? 0.40 : 0.34));',
    'const priceBoxW = Math.round(width * (isStoryV8Luxury ? 0.40 : 0.36));\n      const cardW = Math.round(width * (isStoryV8Luxury ? 0.35 : 0.29));'
);

// Decrease preferred height
code = code.replace(
    'const preferredH = Math.round(height * (isStoryV8Luxury ? 0.25 : 0.26)); // Slightly smaller default\n      const unifiedH = Math.max(160, Math.min(maxAllowedH, preferredH));',
    'const preferredH = Math.round(height * (isStoryV8Luxury ? 0.22 : 0.23));\n      const unifiedH = Math.max(140, Math.min(maxAllowedH, preferredH));'
);

// Yellow Card: taller (1cm up, 0.5cm down)
code = code.replace(
    'const cardX = myPriceBoxX + priceBoxW + gap;\n      const cardY = unifiedY;\n      const cardH = unifiedH;',
    'const cardX = myPriceBoxX + priceBoxW + gap;\n      const cardY = unifiedY - Math.round(height * 0.015);\n      const cardH = unifiedH + Math.round(height * 0.022);'
);

// "A partir" 1px up
code = code.replace(
    'safeFillText(ctx, priceLabel, myPriceBoxX + 24, priceBoxY + Math.round(priceBoxH * 0.20), priceBoxW - 48, 12);',
    'safeFillText(ctx, priceLabel, myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.20) - 1, priceBoxW - 40, 12);'
);

// Move Price (centralized)
code = code.replace(
    'const priceBaseY = priceBoxY + Math.round(priceBoxH * 0.48) - 2; \n      const priceStartX = myPriceBoxX + 30;',
    'const priceBaseY = priceBoxY + Math.round(priceBoxH * 0.48);\n      const priceStartX = myPriceBoxX + 20;'
);
code = code.replace(
    'let priceCursorX = priceStartX + (priceSymbol ? ctx.measureText(priceSymbol).width + 12 : 0);',
    'let priceCursorX = priceStartX + (priceSymbol ? ctx.measureText(priceSymbol).width + 8 : 0);'
);

// Suffix and Total ordering!
const suffixTotalRegex = /      \/\/ Show Total Value if exists.*?      \}/s;
code = code.replace(
    `      // Show Total Value if exists
      if (totalOverride && totalOverride.trim() !== "") {
          ctx.textAlign = "left";
          ctx.fillStyle = onAccent;
          ctx.font = \`700 \${Math.round(width * 0.025)}px Inter, Arial, sans-serif\`;
          safeFillText(ctx, totalOverride.trim(), myPriceBoxX + 30, priceBoxY + Math.round(priceBoxH * 0.68), priceBoxW - 60, 10);
      }

      // Show Suffix text ("por pessoa") -> lower case, moved up 1px, smaller
      if (suffixText) {
        ctx.textAlign = "left";
        ctx.fillStyle = onAccent;
        ctx.font = \`800 \${Math.round(width * (isStoryV8Luxury ? 0.025 : 0.023))}px Inter, Arial, sans-serif\`;
        safeFillText(ctx, suffixText, myPriceBoxX + 30, priceBoxY + Math.round(priceBoxH * 0.86) - 1, priceBoxW - 60, 10);
      }`,
    `      // Show Suffix text ("por pessoa") -> Underneath price
      if (suffixText) {
        ctx.textAlign = "left";
        ctx.fillStyle = onAccent;
        ctx.font = \`800 \${Math.round(width * (isStoryV8Luxury ? 0.025 : 0.023))}px Inter, Arial, sans-serif\`;
        safeFillText(ctx, suffixText, myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.68), priceBoxW - 40, 10);
      }

      // Show Total Value if exists -> Last item, pushed down
      if (totalOverride && totalOverride.trim() !== "") {
          ctx.textAlign = "left";
          ctx.fillStyle = onAccent;
          ctx.font = \`700 \${Math.round(width * 0.025)}px Inter, Arial, sans-serif\`;
          safeFillText(ctx, totalOverride.trim(), myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.86), priceBoxW - 40, 10);
      }`
);

fs.writeFileSync(file, code);
console.log('Final patch completed successfully.');
