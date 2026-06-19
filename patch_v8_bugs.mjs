import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

// Fix 1: ctaText respects showPixBanner
code = code.replace(
    'const ctaText = (pixBannerText || "RESERVAR AGORA").trim();',
    'const ctaText = (rawShowPixBanner !== false ? (pixBannerText || "RESERVAR AGORA") : "GARANTIR VAGA").trim();'
);

// Fix 2: Text Y positions in the black box
// Find block:
// safeFillText(ctx, priceLabel, myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.20) - 1, priceBoxW - 40, 12);
code = code.replace(
    'safeFillText(ctx, priceLabel, myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.20) - 1, priceBoxW - 40, 12);',
    'safeFillText(ctx, priceLabel, myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.16) - 1, priceBoxW - 40, 12);'
);

code = code.replace(
    'const priceBaseY = priceBoxY + Math.round(priceBoxH * 0.50);',
    'const priceBaseY = priceBoxY + Math.round(priceBoxH * 0.48);'
);

code = code.replace(
    'safeFillText(ctx, suffixText, myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.68), priceBoxW - 40, 10);',
    'safeFillText(ctx, suffixText, myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.65), priceBoxW - 40, 10);'
);

// Fix 3: Respect showTotal
code = code.replace(
    'if (totalOverride && totalOverride.trim() !== "") {',
    'if (rawShowTotal !== false && totalOverride && totalOverride.trim() !== "") {'
);

code = code.replace(
    'safeFillText(ctx, totalOverride.trim(), myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.88), priceBoxW - 40, 10);',
    'safeFillText(ctx, totalOverride.trim(), myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.84), priceBoxW - 40, 10);'
);
// In case it was 0.86 (before my last patch)
code = code.replace(
    'safeFillText(ctx, totalOverride.trim(), myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.86), priceBoxW - 40, 10);',
    'safeFillText(ctx, totalOverride.trim(), myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.84), priceBoxW - 40, 10);'
);


// Fix 4: Allow up to 5 icons, and add circle background (destaque) to each icon
code = code.replace(
    ']).slice(0, 4); // Allow 4 icons!',
    ']).slice(0, 5); // Allow up to 5 icons!'
);

code = code.replace(
    'drawMonoIcon(ctx, (item.icon || "check") as IconKey, cardX + cardW / 2, cy - Math.round(width * 0.018), Math.round(width * 0.035), onGold);',
    `const iconSz = Math.round(width * 0.032);\n        const iconY = cy - Math.round(width * 0.020);\n        ctx.save();\n        ctx.fillStyle = "rgba(0,0,0,0.06)";\n        ctx.beginPath();\n        ctx.arc(cardX + cardW / 2, iconY - iconSz * 0.1, iconSz * 1.1, 0, Math.PI * 2);\n        ctx.fill();\n        ctx.restore();\n        drawMonoIcon(ctx, (item.icon || "check") as IconKey, cardX + cardW / 2, iconY, iconSz, onGold);`
);

fs.writeFileSync(file, code);
console.log('Script ran successfully');
