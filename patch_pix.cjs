const fs = require('fs');
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `          const pixText = \`\${descN}% OFF A VISTA NO\`;
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
          ctx.fillText(pixText, pixStartX, stripeY + stripeH / 2);`;

const newStr = `          const customBanner = (pixBannerText || "").trim();
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
            ctx.fillText("pix", pillX + pillPad + pixIconSize + 4, stripeY + stripeH / 2 + 2);
          }`;

// Find the target block and replace it
let replaced = false;

// Since the file has some lines below that need to be wrapped in the 'else' block, we will replace the block and append the closing brace.
const fullTargetStr = `          const pixText = \`\${descN}% OFF A VISTA NO\`;
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
          ctx.fillText("pix", pillX + pillPad + pixIconSize + 4, stripeY + stripeH / 2 + 2);`;

if (content.includes(fullTargetStr)) {
    content = content.replace(fullTargetStr, newStr);
    replaced = true;
} else {
    console.log("Could not find exact block. Let's do a more robust regex or split replacement.");
}

if (replaced) {
    fs.writeFileSync(path, content, 'utf8');
    console.log("Replaced successfully!");
}
