import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove uppercase
code = code.replace(
    'const promoText = (promoName || "SUPER OFERTA").trim().toUpperCase();',
    'const promoText = (promoName || "SUPER OFERTA").trim();'
);
code = code.replace(
    'const destinationText = (destination || destFmt || "DESTINO").trim().toUpperCase();',
    'const destinationText = (destination || destFmt || "DESTINO").trim();'
);
code = code.replace(
    '? titleTextV8.toUpperCase()',
    '? titleTextV8'
);
code = code.replace(
    'const titleLead = (titleLeadRaw || (headline !== destinationText ? headline : promoText)).toUpperCase();',
    'const titleLead = (titleLeadRaw || (headline !== destinationText ? headline : promoText));'
);
code = code.replace(
    'const periodText = (travelPeriod || "").trim().toUpperCase();',
    'const periodText = (travelPeriod || "").trim();'
);
code = code.replace(
    'const priceLabel = (pricePrefix || paymentLabel || topLabel || "PRECO").toString().trim().toUpperCase();',
    'const priceLabel = (pricePrefix || paymentLabel || topLabel || "PRECO").toString().trim();'
);
code = code.replace(
    'const suffixText = (paymentSuffix || bottomSuffix || "").trim().toUpperCase();',
    'const suffixText = (paymentSuffix || bottomSuffix || "").trim();'
);
code = code.replace(
    'const ctaText = (pixBannerText || "RESERVAR AGORA").trim().toUpperCase();',
    'const ctaText = (pixBannerText || "RESERVAR AGORA").trim();'
);

// 2. Fix layout constraints (Move CTA down, thinner boxes, shorter boxes)
code = code.replace(
    'Math.round(height * (isStoryV8Luxury ? 0.775 : 0.81)),',
    'Math.round(height * (isStoryV8Luxury ? 0.775 : 0.85)),'
);
code = code.replace(
    'brandSafeTop - ctaH - Math.round(height * (isStoryV8Luxury ? 0.026 : 0.015))',
    'brandSafeTop - ctaH - Math.round(height * (isStoryV8Luxury ? 0.026 : 0.012))'
);

code = code.replace(
    'const preferredH = Math.round(height * (isStoryV8Luxury ? 0.25 : 0.26)); // Slightly smaller default\n      const unifiedH = Math.max(160, Math.min(maxAllowedH, preferredH));',
    'const preferredH = Math.round(height * (isStoryV8Luxury ? 0.22 : 0.23));\n      const unifiedH = Math.max(140, Math.min(maxAllowedH, preferredH));'
);

code = code.replace(
    'const gap = Math.round(width * 0.03); // Gap between boxes\n      const priceBoxW = Math.round(width * (isStoryV8Luxury ? 0.45 : 0.41));\n      const cardW = Math.round(width * (isStoryV8Luxury ? 0.40 : 0.34));',
    'const gap = Math.round(width * 0.025);\n      const priceBoxW = Math.round(width * (isStoryV8Luxury ? 0.42 : 0.38));\n      const cardW = Math.round(width * (isStoryV8Luxury ? 0.35 : 0.31));'
);

// 3. Move elements inside the price box
code = code.replace(
    'safeFillText(ctx, priceLabel, myPriceBoxX + 30, priceBoxY + Math.round(priceBoxH * 0.18), priceBoxW - 60, 12);',
    'safeFillText(ctx, priceLabel, myPriceBoxX + 24, priceBoxY + Math.round(priceBoxH * 0.20), priceBoxW - 48, 12);'
);

code = code.replace(
    'const priceMainSize = Math.round(width * (isStoryV8Luxury ? 0.095 : 0.082)); // Menor',
    'const priceMainSize = Math.round(width * (isStoryV8Luxury ? 0.090 : 0.082));'
);

code = code.replace(
    '// Move price up 2px as requested\n      const priceBaseY = priceBoxY + Math.round(priceBoxH * 0.48) - 2; \n      const priceStartX = myPriceBoxX + 30;',
    'const priceBaseY = priceBoxY + Math.round(priceBoxH * 0.50);\n      const priceStartX = myPriceBoxX + 24;'
);

code = code.replace(
    'let priceCursorX = priceStartX + (priceSymbol ? ctx.measureText(priceSymbol).width + 12 : 0);',
    'let priceCursorX = priceStartX + (priceSymbol ? ctx.measureText(priceSymbol).width + 8 : 0);'
);

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
        safeFillText(ctx, suffixText, myPriceBoxX + 24, priceBoxY + Math.round(priceBoxH * 0.68), priceBoxW - 48, 10);
      }

      // Show Total Value if exists -> Last item
      if (totalOverride && totalOverride.trim() !== "") {
          ctx.textAlign = "left";
          ctx.fillStyle = onAccent;
          ctx.font = \`700 \${Math.round(width * 0.025)}px Inter, Arial, sans-serif\`;
          safeFillText(ctx, totalOverride.trim(), myPriceBoxX + 24, priceBoxY + Math.round(priceBoxH * 0.86), priceBoxW - 48, 10);
      }`
);

fs.writeFileSync(file, code);
console.log('Safe patch completed successfully.');
