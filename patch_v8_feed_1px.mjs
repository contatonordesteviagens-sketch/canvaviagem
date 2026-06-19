import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. Text Y adjustments
// a partir
code = code.replace(
    'safeFillText(ctx, priceLabel, myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.16) - 1, priceBoxW - 40, 12);',
    'safeFillText(ctx, priceLabel, myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.16) - 2, priceBoxW - 40, 12);' // Subiu 1px
);

// por pessoa
code = code.replace(
    'safeFillText(ctx, suffixText, myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.65), priceBoxW - 40, 10);',
    'safeFillText(ctx, suffixText, myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.65) - 1, priceBoxW - 40, 10);' // Subiu 1px
);

// total
code = code.replace(
    'safeFillText(ctx, totalOverride.trim(), myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.84), priceBoxW - 40, 10);',
    'safeFillText(ctx, totalOverride.trim(), myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.84) - 1, priceBoxW - 40, 10);' // Subiu 1px
);


// 2. Black Box Size and Position
code = code.replace(
    'const priceBoxW = Math.round(width * (isStoryV8Luxury ? 0.40 : 0.38)); // Reduced by ~1cm',
    'const priceBoxW = Math.round(width * (isStoryV8Luxury ? 0.40 : 0.35)); // Reduced by ~1cm'
);

code = code.replace(
    'const startX = (width - totalBoxesW) / 2;',
    'const startX = (width - totalBoxesW) / 2 - (isStoryV8Luxury ? 0 : 20); // Moved a bit to the left'
);

fs.writeFileSync(file, code);
console.log('Done');
