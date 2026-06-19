import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove .toUpperCase() from strings in V8
const textDefsStart = code.indexOf('const promoText = (promoName || "SUPER OFERTA").trim().toUpperCase();');
const textDefsEnd = code.indexOf('ctx.save();\n      ctx.shadowColor = "rgba(0,0,0,0.78)";', textDefsStart);

if (textDefsStart === -1 || textDefsEnd === -1) {
    console.error("Could not find text definitions bounds!");
    process.exit(1);
}

const newTextDefs = `      const promoText = (promoName || "SUPER OFERTA").trim();
      const destinationText = (destination || destFmt || "DESTINO").trim();
      const titleTemplateV8 = (titleText || titleOverride || "").trim();
      const titleTextV8 = titleTemplateV8
        .replace(/\\{destino\\}/ig, destinationText)
        .replace(/\\s+([!?.,])/g, "$1")
        .replace(/!{2,}/g, "!")
        .trim();
      const headline = titleTextV8 && !/^pacote\\s+\\{?destino\\}?$/i.test(titleTextV8)
        ? titleTextV8
        : destinationText;
      const escapedDest = destinationText.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&");
      const titleLeadRaw = titleTemplateV8
        ? titleTemplateV8
          .replace(/\\{destino\\}/ig, "")
          .replace(new RegExp(escapedDest, "ig"), "")
          .replace(/\\s+([!?.,])/g, "$1")
          .replace(/[!?.,]+$/g, "")
          .trim()
        : "";
      const titleLead = (titleLeadRaw || (headline !== destinationText ? headline : promoText));
      const periodText = (travelPeriod || "").trim();
      const priceLabel = (pricePrefix || paymentLabel || topLabel || "A partir de").toString().trim();
      let priceText = mainPrice || \`\${curSym} \${price}\`.trim();
      if (hideCents) priceText = priceText.replace(/[.,]\\d{2}\\s*$/, "");
      const suffixText = (paymentSuffix || bottomSuffix || "").trim();
      const ctaText = (pixBannerText || "Reservar Agora").trim();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const pillH = Math.round(width * (isStoryV8Luxury ? 0.07 : 0.056));
      const pillY = Math.round(height * (isStoryV8Luxury ? 0.055 : 0.04));
      ctx.font = \`900 \${Math.round(width * (isStoryV8Luxury ? 0.032 : 0.027))}px Inter, Arial, sans-serif\`;
      const promoW = Math.min(width - pad * 2, Math.max(width * 0.34, ctx.measureText(promoText).width + pillH * 1.55));
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.32)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 5;
      fillRoundRect(ctx, width / 2 - promoW / 2, pillY, promoW, pillH, pillH / 2, accent);
      ctx.restore();
      ctx.fillStyle = onAccent;
      safeFillText(ctx, promoText, width / 2, pillY + pillH / 2 + 1, promoW - 32, 14);

      const titleMaxW = width - pad * 2;
      const leadSize = Math.round(width * (isStoryV8Luxury ? 0.044 : 0.038));
      ctx.font = \`900 \${leadSize}px Inter, Arial, sans-serif\`;
      const leadLines = wrapTextSafe(ctx, titleLead, titleMaxW, 2, Math.round(leadSize * 0.62));
      const destBase = Math.round(width * (isStoryV8Luxury ? 0.076 : 0.065));
      ctx.font = \`900 \${destBase}px Inter, Arial, sans-serif\`;
      const destinationLines = wrapTextSafe(ctx, destinationText, titleMaxW, 2, Math.round(destBase * 0.54));
      const leadLineH = Math.round(leadSize * 0.94);
      const destLineH = Math.round(destBase * 0.9);
      const titleStartY = pillY + pillH + Math.round(height * (isStoryV8Luxury ? 0.04 : 0.025)) + leadLineH / 2;
      `;

code = code.substring(0, textDefsStart) + newTextDefs + code.substring(textDefsEnd);

// 2. Adjust V8 layout and ordering inside the block
const layoutStart = code.indexOf('const ctaH = Math.round(width * (isStoryV8Luxury ? 0.074 : 0.062));');
const layoutEnd = code.indexOf('ctx.save();\n      ctx.shadowColor = "rgba(0,0,0,0.35)";', layoutStart);

if (layoutStart === -1 || layoutEnd === -1) {
    console.error("Could not find layout bounds!");
    process.exit(1);
}

const newLayout = `const ctaH = Math.round(width * (isStoryV8Luxury ? 0.074 : 0.062));
      const brandSafeTop = isStoryV8Luxury ? height - 270 : height - 155;
      const ctaY = Math.min(
        Math.round(height * (isStoryV8Luxury ? 0.775 : 0.84)), // Pushed CTA even further down
        brandSafeTop - ctaH - Math.round(height * (isStoryV8Luxury ? 0.026 : 0.015))
      );

      // Re-add contentY to avoid colliding with the DEZEMBRO pill (infoY)
      const minContentGap = Math.round(height * 0.035);
      const contentY = Math.max(
        Math.round(height * (isStoryV8Luxury ? 0.455 : 0.40)),
        Math.round(infoY + (periodText ? Math.round(width * (isStoryV8Luxury ? 0.064 : 0.054)) : 0) + minContentGap)
      );

      // Calculate maximum allowed height so it perfectly fits between contentY and ctaY
      const maxAllowedH = ctaY - contentY - Math.round(height * (isStoryV8Luxury ? 0.05 : 0.03));
      const preferredH = Math.round(height * (isStoryV8Luxury ? 0.22 : 0.23)); // Significantly smaller default height!
      const unifiedH = Math.max(150, Math.min(maxAllowedH, preferredH)); // Dynamic height based on available space

      // Anchor boxes to the bottom, just above the CTA
      const unifiedY = ctaY - unifiedH - Math.round(height * (isStoryV8Luxury ? 0.05 : 0.03));

      // Layout widths and X positions (Separated and thinner)
      const gap = Math.round(width * 0.025); // Slightly smaller gap
      
      // Calculate dynamic width for Price Box based on priceText length
      ctx.font = \`900 \${Math.round(width * (isStoryV8Luxury ? 0.095 : 0.082))}px Inter, Arial, sans-serif\`;
      const priceTextW = ctx.measureText(priceText).width;
      const basePriceBoxW = priceTextW + Math.round(width * 0.12); // Give it some padding
      // Bound the width so it's not too wide but shrinks when centavos are absent
      const priceBoxW = Math.max(Math.round(width * 0.32), Math.min(basePriceBoxW, Math.round(width * (isStoryV8Luxury ? 0.43 : 0.41))));
      
      const cardW = Math.round(width * (isStoryV8Luxury ? 0.35 : 0.31)); // Thinner icons card (-1cm each side)
      
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
      ctx.font = \`900 \${Math.round(width * (isStoryV8Luxury ? 0.031 : 0.026))}px Inter, Arial, sans-serif\`;
      safeFillText(ctx, priceLabel, myPriceBoxX + 24, priceBoxY + Math.round(priceBoxH * 0.20), priceBoxW - 48, 12); // Pushed down slightly
      
      const priceMatch = priceText.match(/^([^\\d]*?)\\s*([\\d. ]+)([,.]\\d{1,2})?$/);
      const priceSymbol = (priceMatch?.[1] || curSym || "").trim();
      const priceMain = (priceMatch?.[2] || priceText).trim();
      const priceCents = (priceMatch?.[3] || "").trim();
      const priceMainSize = Math.round(width * (isStoryV8Luxury ? 0.090 : 0.082)); // Slightly smaller
      const priceSmallSize = Math.round(priceMainSize * 0.46);
      
      // Center the price in the box vertically now that we have more room
      const priceBaseY = priceBoxY + Math.round(priceBoxH * 0.48); 
      const priceStartX = myPriceBoxX + 24;
      
      ctx.save();
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = onAccent;
      ctx.font = \`900 \${priceSmallSize}px Inter, Arial, sans-serif\`;
      ctx.fillText(priceSymbol, priceStartX, priceBaseY - Math.round(priceMainSize * 0.12));
      let priceCursorX = priceStartX + (priceSymbol ? ctx.measureText(priceSymbol).width + 8 : 0);
      ctx.font = \`900 \${priceMainSize}px Inter, Arial, sans-serif\`;
      ctx.fillText(priceMain, priceCursorX, priceBaseY);
      priceCursorX += ctx.measureText(priceMain).width + 4;
      if (priceCents && !hideCents) {
        ctx.font = \`900 \${priceSmallSize}px Inter, Arial, sans-serif\`;
        ctx.fillText(priceCents, priceCursorX, priceBaseY - Math.round(priceMainSize * 0.12));
      }
      ctx.restore();

      // Show Suffix text ("por pessoa") -> Reordered: Under the price
      if (suffixText) {
        ctx.textAlign = "left";
        ctx.fillStyle = onAccent;
        ctx.font = \`800 \${Math.round(width * (isStoryV8Luxury ? 0.025 : 0.023))}px Inter, Arial, sans-serif\`;
        safeFillText(ctx, suffixText, myPriceBoxX + 24, priceBoxY + Math.round(priceBoxH * 0.68), priceBoxW - 48, 10);
      }

      // Show Total Value if exists -> Reordered: Last item
      if (totalOverride && totalOverride.trim() !== "") {
          ctx.textAlign = "left";
          ctx.fillStyle = onAccent;
          ctx.font = \`700 \${Math.round(width * 0.025)}px Inter, Arial, sans-serif\`;
          safeFillText(ctx, totalOverride.trim(), myPriceBoxX + 24, priceBoxY + Math.round(priceBoxH * 0.86), priceBoxW - 48, 10);
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
      ]).slice(0, 4); 
      
      const benefitGap = cardH / Math.max(1, benefitItems.length);
      ctx.textAlign = "center";
      benefitItems.forEach((item, idx) => {
        const cy = cardY + benefitGap * idx + benefitGap / 2;
        // Make icons slightly smaller
        drawMonoIcon(ctx, (item.icon || "check") as IconKey, cardX + cardW / 2, cy - Math.round(width * 0.016), Math.round(width * 0.032), onGold);
        ctx.fillStyle = onGold;
        ctx.font = \`800 \${Math.round(width * (isStoryV8Luxury ? 0.019 : 0.017))}px Inter, Arial, sans-serif\`;
        const lines = wrapTextSafe(ctx, String(item.text || ""), cardW - 20, 2, 9);
        lines.forEach((line, lineIdx) => {
          safeFillText(ctx, line, cardX + cardW / 2, cy + Math.round(width * 0.02) + lineIdx * Math.round(width * 0.02), cardW - 10, 9);
        });
      });

      // Draw CTA
      ctx.font = \`900 \${Math.round(width * (isStoryV8Luxury ? 0.034 : 0.031))}px Inter, Arial, sans-serif\`;
      const ctaTextFinal = \`\${ctaText} →\`;
      const ctaW = Math.min(width - pad * 2, Math.max(width * 0.36, ctx.measureText(ctaTextFinal).width + ctaH * 1.85));
      const ctaX = width / 2 - ctaW / 2;
      
      `;

code = code.substring(0, layoutStart) + newLayout + code.substring(layoutEnd);
fs.writeFileSync(file, code);
console.log('V8 Fine Tuning Patched Successfully!');
