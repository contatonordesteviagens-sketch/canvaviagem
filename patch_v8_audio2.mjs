import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove .toUpperCase() from strings in V8
const textDefsStart = code.indexOf('const promoText = (promoName || "SUPER OFERTA")');
const textDefsEnd = code.indexOf('const pillH = Math.round(width * (isStoryV8Luxury');

if (textDefsStart === -1 || textDefsEnd === -1) {
    console.error("Could not find text definitions bounds!", textDefsStart, textDefsEnd);
    process.exit(1);
}

const newTextDefs = `const promoText = (promoName || "SUPER OFERTA").trim();
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
      const escapedDest = destinationText.replace(/[.*+?^\\${}()|[\\]\\\\]/g, "\\\\$&");
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
      const priceLabel = (pricePrefix || paymentLabel || topLabel || "PRECO").toString().trim();
      let priceText = mainPrice || \`\${curSym} \${price}\`.trim();
      if (hideCents) priceText = priceText.replace(/[.,]\\d{2}\\s*$/, "");
      const suffixText = (paymentSuffix || bottomSuffix || "").trim();
      const ctaText = (pixBannerText || "RESERVAR AGORA").trim();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      `;

code = code.substring(0, textDefsStart) + newTextDefs + code.substring(textDefsEnd);

// 2. Adjust V8 layout and ordering inside the block
const layoutStart = code.indexOf('const ctaH = Math.round(width * (isStoryV8Luxury ? 0.074 : 0.062));');
const layoutEnd = code.indexOf('// Draw CTA');

if (layoutStart === -1 || layoutEnd === -1) {
    console.error("Could not find layout bounds!", layoutStart, layoutEnd);
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
      
      // Fixed width reduction logic as user requested "1cm de cada lado" -> meaning about 10% reduction
      const priceBoxW = Math.round(width * (isStoryV8Luxury ? 0.41 : 0.38)); 
      const cardW = Math.round(width * (isStoryV8Luxury ? 0.35 : 0.31)); 
      
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
      safeFillText(ctx, priceLabel, myPriceBoxX + 24, priceBoxY + Math.round(priceBoxH * 0.20), priceBoxW - 48, 12); 
      
      const priceMatch = priceText.match(/^([^\\d]*?)\\s*([\\d. ]+)([,.]\\d{1,2})?$/);
      const priceSymbol = (priceMatch?.[1] || curSym || "").trim();
      const priceMain = (priceMatch?.[2] || priceText).trim();
      const priceCents = (priceMatch?.[3] || "").trim();
      const priceMainSize = Math.round(width * (isStoryV8Luxury ? 0.090 : 0.082)); 
      const priceSmallSize = Math.round(priceMainSize * 0.46);
      
      // Center the price in the box vertically now that we have more room
      const priceBaseY = priceBoxY + Math.round(priceBoxH * 0.50); 
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

      `;

code = code.substring(0, layoutStart) + newLayout + code.substring(layoutEnd);
fs.writeFileSync(file, code);
console.log('V8 Fine Tuning Patched Successfully!');
