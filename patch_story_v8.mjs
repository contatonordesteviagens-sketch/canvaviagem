import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

// Title size slightly larger for story
code = code.replace(
    'const leadSize = Math.round(width * (isStoryV8Luxury ? 0.044 : 0.038));',
    'const leadSize = Math.round(width * (isStoryV8Luxury ? 0.048 : 0.038));'
);
code = code.replace(
    'const destBase = Math.round(width * (isStoryV8Luxury ? 0.076 : 0.065));',
    'const destBase = Math.round(width * (isStoryV8Luxury ? 0.085 : 0.065));'
);

// Date Pill: make it hug text tightly in both
code = code.replace(
    'const infoW = Math.min(width - pad * 2, Math.max(width * 0.28, ctx.measureText(infoText).width + 44));',
    'const infoW = Math.min(width - pad * 2, ctx.measureText(infoText).width + 56);'
);

// Height: Story boxes are too tall!
code = code.replace(
    'const preferredH = Math.round(height * (isStoryV8Luxury ? 0.22 : 0.23)); // Smaller default',
    'const preferredH = Math.round(height * (isStoryV8Luxury ? 0.18 : 0.23)); // Stories were too tall'
);

// Widths: Make story boxes narrower
code = code.replace(
    'const gap = Math.round(width * 0.022); // Tighter gap to bring them to center\n      const priceBoxW = Math.round(width * (isStoryV8Luxury ? 0.40 : 0.38)); // Reduced by ~1cm\n      const cardW = Math.round(width * (isStoryV8Luxury ? 0.33 : 0.30)); // Reduced by ~1-2cm',
    'const gap = Math.round(width * 0.022);\n      const priceBoxW = Math.round(width * (isStoryV8Luxury ? 0.38 : 0.38)); // Narrower in story\n      const cardW = Math.round(width * (isStoryV8Luxury ? 0.30 : 0.30)); // Narrower in story'
);

// Price size: Scale down slightly in story to fit the narrower box
code = code.replace(
    'const priceMainSize = Math.round(width * (isStoryV8Luxury ? 0.090 : 0.082));',
    'const priceMainSize = Math.round(width * (isStoryV8Luxury ? 0.085 : 0.082));'
);

// Move total up a bit so it doesn't clip if the box is shorter
code = code.replace(
    'safeFillText(ctx, totalOverride.trim(), myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.86), priceBoxW - 40, 10);',
    'safeFillText(ctx, totalOverride.trim(), myPriceBoxX + 20, priceBoxY + Math.round(priceBoxH * 0.88), priceBoxW - 40, 10);'
);

// Push CTA button up a bit in story mode to avoid crowding the footer
code = code.replace(
    'Math.round(height * (isStoryV8Luxury ? 0.775 : 0.85)),',
    'Math.round(height * (isStoryV8Luxury ? 0.76 : 0.85)),'
);

fs.writeFileSync(file, code);
console.log('Story layout tweaks applied');
