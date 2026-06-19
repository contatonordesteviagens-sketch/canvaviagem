import fs from 'fs';
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Move "SUPER OFERTA" up by 0.5cm
content = content.replace('const badgeY = boxY + 65; // Subiu 0.5cm', 'const badgeY = boxY + 50; // Subiu mais 0.5cm (Áudio 2)');

// 2. Adjust Pix Banner (stripeW, stripeH, stripeY)
const pixStartStr = `          if (showPixBanner) {
            const stripeY = boxY + boxH - 94;
            const stripeX = boxX + 40;
            const stripeW = boxW - 80;
            const stripeH = 64;`;

// We'll calculate the text width first, just like we did for the green box!
// But wait, the text width is calculated INSIDE the else branch (if not customBanner).
// I'll rewrite the showPixBanner block for V3 Story.
const fullPixBlockOld = `          if (showPixBanner) {
            const stripeY = boxY + boxH - 94;
            const stripeX = boxX + 40;
            const stripeW = boxW - 80;
            const stripeH = 64;
            fillRoundRect(ctx, stripeX, stripeY, stripeW, stripeH, 16, navyRaw);
            ctx.fillStyle = contrastOn(navyRaw);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "900 26px Inter, Arial, sans-serif";
            
            const customBanner = (pixBannerText || "").trim();
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
            }
            ctx.textBaseline = "alphabetic";
          }`;

const fullPixBlockNew = `          if (showPixBanner) {
            const customBanner = (pixBannerText || "").trim();
            let totalPixW = 0;
            const pixText = \`\${descN}% OFF A VISTA NO\`;
            const pixIconSize = 32;
            const pixGap = 10;
            const pillPad = 8;
            let pillW = 0;
            
            ctx.font = "900 26px Inter, Arial, sans-serif";
            if (customBanner) {
              totalPixW = ctx.measureText(customBanner).width;
            } else {
              const pixTextW = ctx.measureText(pixText).width;
              ctx.font = "800 24px Inter, Arial, sans-serif";
              const pixLabelW = ctx.measureText("pix").width;
              pillW = pixIconSize + pixGap + pixLabelW + pillPad * 2;
              totalPixW = pixTextW + pixGap + pillW;
            }

            // DIMINUI A LARGURA: 60px de margem (30 de cada lado) em vez de tela cheia
            const stripeW = totalPixW + 60;
            const stripeX = cx - stripeW / 2;
            
            // TORNA ELE MENOR TAMBEM (altura) E DESCE UM POUCO
            const stripeH = 50; 
            const stripeY = boxY + boxH - 85; // Desceu (era -94) e compensado pela altura menor

            fillRoundRect(ctx, stripeX, stripeY, stripeW, stripeH, 25, navyRaw);
            ctx.fillStyle = contrastOn(navyRaw);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "900 24px Inter, Arial, sans-serif"; // Fonte um pouquinho menor para caber nos 50px
            
            if (customBanner) {
              ctx.fillText(customBanner, stripeX + stripeW / 2, stripeY + stripeH / 2 + 1);
            } else {
              ctx.font = "900 24px Inter, Arial, sans-serif";
              const pixTextW = ctx.measureText(pixText).width;
              const pixStartX = stripeX + (stripeW - totalPixW) / 2;
              
              ctx.textAlign = "left";
              ctx.fillText(pixText, pixStartX, stripeY + stripeH / 2 + 1);
              const pillX = pixStartX + pixTextW + pixGap;
              const pillH = stripeH - 12;
              const pillY = stripeY + (stripeH - pillH) / 2;
              fillRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, "#ffffff");
              
              const pxCx = pillX + pillPad + pixIconSize / 2;
              const pxCy = stripeY + stripeH / 2;
              drawPixLogo(ctx, pxCx, pxCy, pixIconSize, "#32BCAD");
              
              ctx.fillStyle = "#32BCAD";
              ctx.font = "900 22px Inter, Arial, sans-serif";
              ctx.fillText("pix", pillX + pillPad + pixIconSize + pixGap, stripeY + stripeH / 2 + 1);
            }
            ctx.textBaseline = "alphabetic";
          }`;

// Check if old block exists
if (content.includes(fullPixBlockOld)) {
  content = content.replace(fullPixBlockOld, fullPixBlockNew);
  console.log("Pix block successfully replaced!");
} else {
  console.log("WARNING: Could not find exact Pix block string. Let's try replacing line by line.");
  // Fallback
  content = content.replace('const stripeY = boxY + boxH - 94;', 'const stripeY = boxY + boxH - 85;');
  content = content.replace('const stripeX = boxX + 40;', 'const stripeX = cx - (boxW - 120) / 2;');
  content = content.replace('const stripeW = boxW - 80;', 'const stripeW = boxW - 120;');
  content = content.replace('const stripeH = 64;', 'const stripeH = 50;');
}

fs.writeFileSync(path, content, 'utf8');
console.log("Audio adjustments V3 applied.");
