import fs from 'fs';
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const newLines = `          const customBanner = (pixBannerText || "").trim();
          if (customBanner) {
            ctx.fillText(customBanner, stripeX + stripeW / 2, stripeY + stripeH / 2 + 1);
          } else {
            const pixText = \`\${descN}% OFF A VISTA NO\`;
            const pixTextW = ctx.measureText(pixText).width;
            const pixIconSize = 32;
            const pixGap = 10;
            ctx.font = "800 24px Inter, Arial, sans-serif";
            const pixLabelW = ctx.measureText("pix").width;
            
            const pillPad = 8;
            const pillW = pixIconSize + pixGap + pixLabelW + pillPad * 2;
            const pillH = stripeH - 16;
            const totalPixW = pixTextW + pixGap + pillW;
            const pixStartX = stripeX + (stripeW - totalPixW) / 2;
            
            ctx.textAlign = "left";
            ctx.fillText(pixText, pixStartX, stripeY + stripeH / 2);
            const pillX = pixStartX + pixTextW + pixGap;
            const pillY = stripeY + (stripeH - pillH) / 2;
            fillRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, "#ffffff");
            
            const pxCx = pillX + pillPad + pixIconSize / 2;
            const pxCy = stripeY + stripeH / 2;
            drawPixLogo(ctx, pxCx, pxCy, pixIconSize, "#32BCAD");
            
            ctx.fillStyle = "#32BCAD";
            ctx.font = "900 24px Inter, Arial, sans-serif";
            ctx.fillText("pix", pillX + pillPad + pixIconSize + pixGap, stripeY + stripeH / 2);
          }`.split('\n');

// We know from the Select-Object that `ctx.textBaseline = "middle";` is line 1899 (0-indexed 1898)
// Let's find exactly where `const pixText = \`\${descN}% OFF A VISTA NO\`;` is.

let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const pixText = `${descN}% OFF A VISTA NO`;') && lines[i].includes('measureText') === false) {
        if (lines[i-1].includes('ctx.font = "900 24px Inter, Arial, sans-serif";') || lines[i-2].includes('ctx.font = "900 24px Inter, Arial, sans-serif";')) {
            startIndex = i;
            break;
        }
    }
}

for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].includes('ctx.textBaseline = "alphabetic";')) {
        endIndex = i;
        break;
    }
}

if (startIndex !== -1 && endIndex !== -1) {
    lines.splice(startIndex, endIndex - startIndex, ...newLines);
    fs.writeFileSync(path, lines.join('\n'), 'utf8');
    console.log("Successfully replaced lines " + startIndex + " to " + endIndex);
} else {
    console.log("Failed to find bounds. Start: " + startIndex + " End: " + endIndex);
}
