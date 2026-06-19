import fs from 'fs';
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Revert duplicate Date badge (we keep only pacoteText)
content = content.replace(
  `        const cx = boxX + boxW / 2;
        let cursorY = safeBoxY + padTop + 25; // Subiu ~0.5cm
        
        // Titulo Promoção + Data (Lado a Lado)
        const pacoteText = (promoName || "PACOTE").trim().toUpperCase();
        ctx.font = "900 28px Inter, Arial, sans-serif";
        const pacoteW = ctx.measureText(pacoteText).width + 50;
        const pacoteH = 50;
        
        const dateText = (travelPeriod || "").trim().toUpperCase();
        const dateW = dateText ? ctx.measureText(dateText).width + 40 : 0;
        const gap = 12;
        const totalBadgeW = dateText ? pacoteW + gap + dateW : pacoteW;
        const badgeStartX = cx - totalBadgeW / 2;

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
        fillRoundRect(ctx, badgeStartX, cursorY - pacoteH/2, pacoteW, pacoteH, pacoteH/2, navy);
        if (dateText) {
          fillRoundRect(ctx, badgeStartX + pacoteW + gap, cursorY - pacoteH/2, dateW, pacoteH, pacoteH/2, navy);
        }
        ctx.restore();
        
        ctx.fillStyle = yellow;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pacoteText, badgeStartX + pacoteW/2, cursorY + 4);
        if (dateText) {
          ctx.fillText(dateText, badgeStartX + pacoteW + gap + dateW/2, cursorY + 4);
        }
        ctx.textBaseline = "alphabetic";`,
  `        const cx = boxX + boxW / 2;
        let cursorY = safeBoxY + padTop + 42;
        
        const pacoteText = (promoName || "PACOTE").trim().toUpperCase();
        ctx.font = "900 28px Inter, Arial, sans-serif";
        const pacoteW = ctx.measureText(pacoteText).width + 60;
        const pacoteH = 50;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
        fillRoundRect(ctx, cx - pacoteW/2, cursorY - pacoteH/2, pacoteW, pacoteH, pacoteH/2, navy);
        ctx.restore();
        
        ctx.fillStyle = yellow;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pacoteText, cx, cursorY + 4);
        ctx.textBaseline = "alphabetic";`
);

// 2. Add icon highlights
content = content.replace(
  `        iconList.forEach((k, i) => {
          drawMonoIcon(ctx, k, infoX + i * (iconSize + iconGap) + iconSize / 2, cursorY, iconSize, navy);
        });`,
  `        iconList.forEach((k, i) => {
          const ix = infoX + i * (iconSize + iconGap) + iconSize / 2;
          ctx.beginPath();
          ctx.arc(ix, cursorY, iconSize * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,0.06)";
          ctx.fill();
          drawMonoIcon(ctx, k, ix, cursorY, iconSize, navy);
        });`
);

// 3. Fix "por pessoa" alignment (it was placed at bottom of left column, but was too close)
content = content.replace(
  `ctx.fillText(btmTxt, leftColCx, priceBlockY + 68);`,
  `ctx.fillText(btmTxt, leftColCx, priceBlockY + 74);` // Move por pessoa down slightly
);

// 4. Reduce empty space
content = content.replace(
  `const padBottom = showPixBanner ? 100 : 60;`,
  `const padBottom = showPixBanner ? 30 : 20;`
);
content = content.replace(
  `simY += 24 + stripeH;       // Pos pix (stripeGap + stripeH)`,
  `simY += 12 + stripeH;       // Pos pix (stripeGap + stripeH)`
);

// 5. Adjust Pix Banner Y offset in V3 Feed
content = content.replace(
  `const stripeY = cursorY + 35;`,
  `const stripeY = cursorY + 12;`
);


fs.writeFileSync(path, content, 'utf8');
console.log("Feed patched!");
