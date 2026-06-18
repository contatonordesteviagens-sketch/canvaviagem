import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

const targetStart = 'const priceBoxX = pad;';
const targetEnd = 'return canvas.toDataURL("image/png");';

const idxStart = code.indexOf(targetStart);
let idxEnd = code.indexOf(targetEnd, idxStart);

if (idxStart === -1 || idxEnd === -1) {
    console.error("Could not find bounds!");
    process.exit(1);
}

// Find the closing brace after targetEnd
idxEnd = code.indexOf('}', idxEnd) + 1;

const newBlock = `
      // Define block heights and Y positions
      const unifiedH = Math.min(
        Math.round(height * (isStoryV8Luxury ? 0.25 : 0.35)), 
        Math.max(180, Math.round(height * 0.35))
      );

      const ctaH = Math.round(width * (isStoryV8Luxury ? 0.074 : 0.062));
      const brandSafeTop = isStoryV8Luxury ? height - 270 : height - 155;
      const ctaY = Math.min(
        Math.round(height * (isStoryV8Luxury ? 0.775 : 0.735)),
        brandSafeTop - ctaH - Math.round(height * 0.026)
      );

      // Anchor boxes to the bottom, just above the CTA
      const desiredUnifiedY = ctaY - unifiedH - Math.round(height * (isStoryV8Luxury ? 0.05 : 0.035));
      const unifiedY = Math.max(
        Math.round(height * (isStoryV8Luxury ? 0.455 : 0.425)), 
        desiredUnifiedY
      );

      // Layout widths and X positions (Separated)
      const gap = Math.round(width * 0.03); // Gap between boxes
      const priceBoxW = Math.round(width * (isStoryV8Luxury ? 0.45 : 0.43));
      const cardW = Math.round(width * (isStoryV8Luxury ? 0.40 : 0.35));
      
      // Center the two boxes together
      const totalBoxesW = priceBoxW + gap + cardW;
      const startX = (width - totalBoxesW) / 2;

      const myPriceBoxX = startX;
      const priceBoxY = unifiedY;
      const priceBoxH = unifiedH;

      const cardX = myPriceBoxX + priceBoxW + gap;
      const cardY = unifiedY;
      const cardH = unifiedH;

      // Draw Black Price Box
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.38)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 9;
      fillRoundRect(ctx, myPriceBoxX, priceBoxY, priceBoxW, priceBoxH, 26, accent);
      ctx.restore();

      ctx.textAlign = "left";
      ctx.fillStyle = onAccent;
      ctx.font = \`900 \${Math.round(width * (isStoryV8Luxury ? 0.031 : 0.029))}px Inter, Arial, sans-serif\`;
      safeFillText(ctx, priceLabel, myPriceBoxX + 30, priceBoxY + Math.round(priceBoxH * 0.18), priceBoxW - 60, 12);
      
      const priceMatch = priceText.match(/^([^\\d]*?)\\s*([\\d. ]+)([,.]\\d{1,2})?$/);
      const priceSymbol = (priceMatch?.[1] || curSym || "").trim();
      const priceMain = (priceMatch?.[2] || priceText).trim();
      const priceCents = (priceMatch?.[3] || "").trim();
      const priceMainSize = Math.round(width * (isStoryV8Luxury ? 0.095 : 0.088)); // Menor
      const priceSmallSize = Math.round(priceMainSize * 0.46);
      
      // Move price up 2px as requested
      const priceBaseY = priceBoxY + Math.round(priceBoxH * 0.48) - 2; 
      const priceStartX = myPriceBoxX + 30;
      
      ctx.save();
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = onAccent;
      ctx.font = \`900 \${priceSmallSize}px Inter, Arial, sans-serif\`;
      ctx.fillText(priceSymbol, priceStartX, priceBaseY - Math.round(priceMainSize * 0.12));
      let priceCursorX = priceStartX + (priceSymbol ? ctx.measureText(priceSymbol).width + 12 : 0);
      ctx.font = \`900 \${priceMainSize}px Inter, Arial, sans-serif\`;
      ctx.fillText(priceMain, priceCursorX, priceBaseY);
      priceCursorX += ctx.measureText(priceMain).width + 4;
      if (priceCents && !hideCents) {
        ctx.font = \`900 \${priceSmallSize}px Inter, Arial, sans-serif\`;
        ctx.fillText(priceCents, priceCursorX, priceBaseY - Math.round(priceMainSize * 0.12));
      }
      ctx.restore();

      // Show Total Value if exists
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
      }

      // Draw Yellow Card (Icons)
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.34)";
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 12;
      fillRoundRect(ctx, cardX, cardY, cardW, cardH, 24, gold);
      ctx.restore();

      const benefitItems = (highlights && highlights.length ? highlights : [
        { icon: "star" as IconKey, text: "Melhores experiencias" },
        { icon: "heart" as IconKey, text: "Atendimento premium" },
        { icon: "check" as IconKey, text: "Beneficios exclusivos" },
      ]).slice(0, 4); // Allow 4 icons!
      
      const benefitGap = cardH / Math.max(1, benefitItems.length);
      ctx.textAlign = "center";
      benefitItems.forEach((item, idx) => {
        const cy = cardY + benefitGap * idx + benefitGap / 2;
        // Make icons slightly smaller
        drawMonoIcon(ctx, (item.icon || "check") as IconKey, cardX + cardW / 2, cy - Math.round(width * 0.018), Math.round(width * 0.035), onGold);
        ctx.fillStyle = onGold;
        ctx.font = \`800 \${Math.round(width * (isStoryV8Luxury ? 0.019 : 0.017))}px Inter, Arial, sans-serif\`;
        const lines = wrapTextSafe(ctx, String(item.text || ""), cardW - 30, 2, 9);
        lines.forEach((line, lineIdx) => {
          safeFillText(ctx, line, cardX + cardW / 2, cy + Math.round(width * 0.02) + lineIdx * Math.round(width * 0.02), cardW - 20, 9);
        });
      });

      // Draw CTA
      ctx.font = \`900 \${Math.round(width * (isStoryV8Luxury ? 0.034 : 0.031))}px Inter, Arial, sans-serif\`;
      const ctaTextFinal = \`\${ctaText} →\`;
      const ctaW = Math.min(width - pad * 2, Math.max(width * 0.36, ctx.measureText(ctaTextFinal).width + ctaH * 1.85));
      const ctaX = width / 2 - ctaW / 2;
      
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      // Botão Sólido vibrante
      fillRoundRect(ctx, ctaX, ctaY, ctaW, ctaH, 16, gold); 
      ctx.restore();
      
      ctx.textAlign = "center";
      ctx.fillStyle = onGold; // Texto escuro
      safeFillText(ctx, ctaTextFinal, width / 2, ctaY + ctaH / 2 + 2, ctaW - ctaH, 12);

      await drawFinalBranding(
        ctx, width, height, logoDataUrl,
        options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined),
        options.footerContact2Icon ? { icon: options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
        "#ffffff",
        userFamily,
        false,
        logoFormat
      );
      return canvas.toDataURL("image/png");
    }
`

code = code.substring(0, idxStart) + 'const priceBoxX = pad;\n' + newBlock.trim() + code.substring(idxEnd);
fs.writeFileSync(file, code);
console.log('V8 Reference Design Patched Successfully!');
