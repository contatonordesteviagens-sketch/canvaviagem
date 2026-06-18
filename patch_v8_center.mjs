import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

const oldPriceLogic = `      ctx.textAlign = "left";
      ctx.fillStyle = onAccent;
      ctx.font = \`900 \${Math.round(width * (isStoryV8Luxury ? 0.033 : 0.031))}px Inter, Arial, sans-serif\`;
      safeFillText(ctx, priceLabel, priceBoxX + 34, priceBoxY + Math.round(priceBoxH * 0.22), priceBoxW - 68, 12);
      const priceMatch = priceText.match(/^([^\\d]*?)\\s*([\\d. ]+)([,.]\\d{1,2})?$/);
      const priceSymbol = (priceMatch?.[1] || curSym || "").trim();
      const priceMain = (priceMatch?.[2] || priceText).trim();
      const priceCents = (priceMatch?.[3] || "").trim();
      const priceMainSize = Math.round(width * (isStoryV8Luxury ? 0.105 : 0.098));
      const priceSmallSize = Math.round(priceMainSize * 0.46);
      const priceBaseY = priceBoxY + Math.round(priceBoxH * 0.58);
      const priceStartX = priceBoxX + 34;
      ctx.save();
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = onAccent;
      ctx.font = \`900 \${priceSmallSize}px Inter, Arial, sans-serif\`;
      ctx.fillText(priceSymbol, priceStartX, priceBaseY - Math.round(priceMainSize * 0.12));
      let priceCursorX = priceStartX + (priceSymbol ? ctx.measureText(priceSymbol).width + 12 : 0);
      ctx.font = \`900 \${priceMainSize}px Inter, Arial, sans-serif\`;
      ctx.fillText(priceMain, priceCursorX, priceBaseY);
      priceCursorX += ctx.measureText(priceMain).width + 4;
      if (priceCents) {
        ctx.font = \`900 \${priceSmallSize}px Inter, Arial, sans-serif\`;
        ctx.fillText(priceCents, priceCursorX, priceBaseY - Math.round(priceMainSize * 0.12));
      }
      ctx.restore();
      if (suffixText) {
        ctx.font = \`900 \${Math.round(width * (isStoryV8Luxury ? 0.031 : 0.029))}px Inter, Arial, sans-serif\`;
        safeFillText(ctx, suffixText, priceBoxX + 36, priceBoxY + Math.round(priceBoxH * 0.82), priceBoxW - 72, 12);
      }`;

const newPriceLogic = `      ctx.textAlign = "center";
      ctx.fillStyle = onAccent;
      ctx.font = \`900 \${Math.round(width * (isStoryV8Luxury ? 0.033 : 0.031))}px Inter, Arial, sans-serif\`;
      safeFillText(ctx, priceLabel, priceBoxX + priceBoxW / 2, priceBoxY + Math.round(priceBoxH * 0.22), priceBoxW - 68, 12);
      
      const priceMatch = priceText.match(/^([^\\d]*?)\\s*([\\d. ]+)([,.]\\d{1,2})?$/);
      const priceSymbol = (priceMatch?.[1] || curSym || "").trim();
      const priceMain = (priceMatch?.[2] || priceText).trim();
      const priceCents = (priceMatch?.[3] || "").trim();
      const priceMainSize = Math.round(width * (isStoryV8Luxury ? 0.105 : 0.098));
      const priceSmallSize = Math.round(priceMainSize * 0.46);
      const priceBaseY = priceBoxY + Math.round(priceBoxH * 0.58);
      
      ctx.save();
      ctx.font = \`900 \${priceSmallSize}px Inter, Arial, sans-serif\`;
      const symW = priceSymbol ? ctx.measureText(priceSymbol).width + 12 : 0;
      const centW = priceCents ? ctx.measureText(priceCents).width + 4 : 0;
      ctx.font = \`900 \${priceMainSize}px Inter, Arial, sans-serif\`;
      const mainW = ctx.measureText(priceMain).width;
      
      const totalW = symW + mainW + centW;
      let priceStartX = priceBoxX + (priceBoxW - totalW) / 2;
      
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = onAccent;
      ctx.textAlign = "left"; 
      if (priceSymbol) {
        ctx.font = \`900 \${priceSmallSize}px Inter, Arial, sans-serif\`;
        ctx.fillText(priceSymbol, priceStartX, priceBaseY - Math.round(priceMainSize * 0.12));
      }
      let priceCursorX = priceStartX + symW;
      ctx.font = \`900 \${priceMainSize}px Inter, Arial, sans-serif\`;
      ctx.fillText(priceMain, priceCursorX, priceBaseY);
      priceCursorX += mainW + 4;
      if (priceCents) {
        ctx.font = \`900 \${priceSmallSize}px Inter, Arial, sans-serif\`;
        ctx.fillText(priceCents, priceCursorX, priceBaseY - Math.round(priceMainSize * 0.12));
      }
      ctx.restore();
      
      if (suffixText) {
        ctx.textAlign = "center";
        ctx.font = \`900 \${Math.round(width * (isStoryV8Luxury ? 0.031 : 0.029))}px Inter, Arial, sans-serif\`;
        safeFillText(ctx, suffixText, priceBoxX + priceBoxW / 2, priceBoxY + Math.round(priceBoxH * 0.82), priceBoxW - 72, 12);
      }`;

code = code.replace(oldPriceLogic, newPriceLogic);
fs.writeFileSync(file, code);
console.log('Price block centered successfully!');
