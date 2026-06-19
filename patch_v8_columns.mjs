import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. Calculate priceBoxW dynamically based on cents
code = code.replace(
    '      const gap = Math.round(width * 0.022); // Tighter gap to bring them to center\r\n      const priceBoxW = Math.round(width * (isStoryV8Luxury ? 0.40 : 0.35)); // Reduced by ~1cm',
    `      const gap = Math.round(width * 0.022); // Tighter gap to bring them to center
      const tempPriceMatch = priceText.match(/^([^\\d]*?)\\s*([\\d. ]+)([,.]\\d{1,2})?$/);
      const hasCents = tempPriceMatch?.[3] && !hideCents;
      const priceBoxBaseW = Math.round(width * (isStoryV8Luxury ? 0.40 : 0.35));
      const priceBoxW = hasCents ? priceBoxBaseW : priceBoxBaseW - Math.round(width * 0.06);`
);

// 2. Change Yellow Box to 2 Columns
code = code.replace(
    ']).slice(0, 5); // Allow up to 5 icons!',
    ']).slice(0, 6); // Allow up to 6 icons!'
);

const oldLoop = `      const benefitGap = cardH / Math.max(1, benefitItems.length);
      ctx.textAlign = "center";
      benefitItems.forEach((item, idx) => {
        const cy = cardY + benefitGap * idx + benefitGap / 2;
        // Make icons slightly smaller
        const iconSz = Math.round(width * 0.032);
        const iconY = cy - Math.round(width * 0.020);
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.beginPath();
        ctx.arc(cardX + cardW / 2, iconY - iconSz * 0.1, iconSz * 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawMonoIcon(ctx, (item.icon || "check") as IconKey, cardX + cardW / 2, iconY, iconSz, onGold);
        ctx.fillStyle = onGold;
        ctx.font = \`800 \${Math.round(width * (isStoryV8Luxury ? 0.019 : 0.017))}px Inter, Arial, sans-serif\`;
        const lines = wrapTextSafe(ctx, String(item.text || ""), cardW - 30, 2, 9);
        lines.forEach((line, lineIdx) => {
          safeFillText(ctx, line, cardX + cardW / 2, cy + Math.round(width * 0.02) + lineIdx * Math.round(width * 0.02), cardW - 20, 9);
        });
      });`;

const newLoop = `      const numRows = Math.ceil(benefitItems.length / 2);
      const benefitGap = cardH / Math.max(1, numRows);
      ctx.textAlign = "center";
      benefitItems.forEach((item, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        let cx = cardX + (col === 0 ? cardW * 0.25 : cardW * 0.75);
        if (idx === benefitItems.length - 1 && benefitItems.length % 2 !== 0) {
            cx = cardX + cardW / 2; // center odd last item
        }
        const cy = cardY + benefitGap * row + benefitGap / 2;
        
        const iconSz = Math.round(width * 0.032);
        const iconY = cy - Math.round(width * 0.020);
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.beginPath();
        ctx.arc(cx, iconY - iconSz * 0.1, iconSz * 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawMonoIcon(ctx, (item.icon || "check") as IconKey, cx, iconY, iconSz, onGold);
        
        ctx.fillStyle = onGold;
        ctx.font = \`800 \${Math.round(width * (isStoryV8Luxury ? 0.017 : 0.015))}px Inter, Arial, sans-serif\`;
        const lines = wrapTextSafe(ctx, String(item.text || ""), cardW / 2 - 15, 3, 9);
        lines.forEach((line, lineIdx) => {
          safeFillText(ctx, line, cx, cy + Math.round(width * 0.02) + lineIdx * Math.round(width * 0.018), cardW / 2 - 10, 9);
        });
      });`;

code = code.replace(oldLoop, newLoop);

fs.writeFileSync(file, code);
console.log('Script ran successfully');
