    if (variant === 2) {
      await drawProminentLogo(ctx, 40, 40, 120);

      if (format === "story") {
        // ============================================================
        // DEDICATED REENGINEERING FOR V2 STORIES (9:16)
        // ============================================================
        ctx.fillStyle = "#f7f4ef"; 
        ctx.fillRect(0, 0, width, height);

        const v2CardBg = primaryColor;
        const v2CardLabel = getSafeColor(v2CardBg, secondaryColor);
        const v2BenefitColor = getSafeColor("#f7f4ef", secondaryColor);
        const v2HeadlineColor = v2CardLabel;

        const benefitsListV2 = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 6);
        const benefitsCountV2 = Math.max(1, benefitsListV2.length);

        // 1) Dynamic Price Block - Mirror Feed logic to avoid being oversized & fix hardcoded labels
        const priceStrV2 = mainPrice || `${curSym} ${price}`;
        const topLabelTxt = (topLabel || installments || "por apenas").toString().toUpperCase();
        
        ctx.font = "700 24px Inter, Arial, sans-serif";
        const w1 = ctx.measureText(topLabelTxt).width;
        ctx.font = "900 74px Inter, Arial, sans-serif";
        const w2 = ctx.measureText(priceStrV2).width;
        ctx.font = "800 22px Inter, Arial, sans-serif";
        const w3 = ctx.measureText((bottomSuffix || "por pessoa").toUpperCase()).width;
        
        const maxContentW = Math.max(w1, w2, w3);
        const priceBlockW = Math.min(width * 0.8, Math.max(width * 0.45, Math.round(maxContentW + 100)));
        const priceCardH = 168;
        const priceCardX = Math.round((width - priceBlockW) / 2);
        // Securely anchor above the Instagram safe bottom zone (1440)
        const priceCardY = panelBottom - priceCardH - 35; 
        
        fillRoundRect(ctx, priceCardX, priceCardY, priceBlockW, priceCardH, 24, v2CardBg);
        
        // Subtle relief effect on card
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2.5;
        fillRoundRect(ctx, priceCardX + 1.5, priceCardY + 1.5, priceBlockW - 3, priceCardH - 3, 22, "transparent");
        ctx.stroke();
        ctx.restore();

        const cardCenterX = priceCardX + priceBlockW / 2;
        ctx.textAlign = "center";
        ctx.fillStyle = v2CardLabel;
        
        ctx.font = "800 24px Inter, Arial, sans-serif";
        safeFillText(ctx, topLabelTxt, cardCenterX, priceCardY + 45, priceBlockW - 40, 14);

        let pfsV2 = 74;
        ctx.font = `900 ${pfsV2}px Inter, Arial, sans-serif`;
        while (ctx.measureText(priceStrV2).width > priceBlockW - 50 && pfsV2 > 28) {
          pfsV2 -= 4;
          ctx.font = `900 ${pfsV2}px Inter, Arial, sans-serif`;
        }
        safeFillText(ctx, priceStrV2, cardCenterX, priceCardY + 108, priceBlockW - 50, 24);

        ctx.fillStyle = v2CardLabel;
        ctx.globalAlpha = 0.9;
        ctx.font = "800 22px Inter, Arial, sans-serif";
        ctx.fillText((bottomSuffix || "por pessoa").toUpperCase(), cardCenterX, priceCardY + 150);
        ctx.globalAlpha = 1.0;

        // Optional Travel Period injection between components
        let periodYOffset = 0;
        if (travelPeriod && travelPeriod.trim()) {
          ctx.fillStyle = v2BenefitColor;
          ctx.font = "900 36px Inter, Arial, sans-serif";
          ctx.fillText(travelPeriod.trim().toUpperCase(), width / 2, priceCardY - 52);
          periodYOffset = 72; // Allocates extra safety offset upwards
        }
        ctx.textAlign = "left";

        // 2) Intelligent Multi-line Headline Bar
        const resolvedTitle = (titleText || "").toUpperCase();
        ctx.font = "900 56px Inter, Arial, sans-serif";
        const titleLines = wrapTextSafe(ctx, resolvedTitle, contentWidth - 40, 2, 34);
        const isMultiLine = titleLines.length > 1;
        const faixaH = isMultiLine ? 190 : 135;

        // ðŸ›¡ï¸ DYNAMIC COLLISION PROTECTION ENGINE ðŸ›¡ï¸
        // Calculates guaranteed minimum vertical space reservation to prevent component overlaps.
        const benefitRowsV2 = Math.ceil(benefitsCountV2 / 2);
        const benefitGap = benefitRowsV2 <= 2 ? 82 : 68; 
        const benefitsEffectiveH = (benefitRowsV2 - 1) * benefitGap;
        
        // We require at least the highlights stack, the price floor, and reasonable empty buffers (70px total)
        const requiredBuff = 70; 
        const contentFloorLimit = priceCardY - periodYOffset;
        // Safe ceiling threshold for content based on strict stacking needs
        const maxSafeCeiling = contentFloorLimit - (benefitsEffectiveH + requiredBuff);

        // Re-evaluate optimal photo anchor to make it large, but fit inside constraints
        let photoBottom = 800; 
        // photoBottom + 16 (gap) + faixaH must not exceed maxSafeCeiling
        const photoConstraint = maxSafeCeiling - 16 - faixaH;
        photoBottom = Math.min(photoBottom, photoConstraint);
        
        const faixaY = photoBottom + 16;

        fillRoundRect(ctx, 0, faixaY, width, faixaH, 0, v2CardBg);
        ctx.fillStyle = v2HeadlineColor;
        ctx.textBaseline = "middle";
        
        const lineSpacing = 62;
        const textBlockH = isMultiLine ? lineSpacing : 0;
        const startTextY = (faixaY + faixaH / 2) - (textBlockH / 2);
        
        titleLines.forEach((txt, i) => {
           safeFillText(ctx, txt, left, startTextY + (i * lineSpacing), width - left - 40, 20);
        });
        ctx.textBaseline = "alphabetic";

        // 3) Expanded Photo Mask - Autonomously size-constrained to prevent content bleed
        const photoTop = safeTop - 20; 
        const fW2 = width - 32;
        const fH2 = photoBottom - photoTop; 
        const c2 = fitCover(image.naturalWidth, image.naturalHeight, fW2, fH2, 0.36);
        ctx.save();
        fillRoundRect(ctx, 16, photoTop, fW2, fH2, 22, "#ccc");
        ctx.clip();
        ctx.drawImage(image, c2.sx, c2.sy, c2.sw, c2.sh, 16, photoTop, fW2, fH2);
        ctx.restore();

        // 4) Mathematical Vertical Balancing (Safe Centering)
        const bfs = benefitRowsV2 <= 2 ? 38 : 32; 
        const contentCeilLimit = faixaY + faixaH;
        const verticalFreeSpace = contentFloorLimit - contentCeilLimit;
        
        // Anchor top at the precise vertical half-point of the computed gap
        const benefitsTop = contentCeilLimit + (verticalFreeSpace - benefitsEffectiveH) / 2;

        const colGapV2 = 28;
        const colWV2 = (contentWidth - colGapV2) / 2;

        benefitsListV2.forEach((h, i) => {
          let fs = bfs;
          const col = i % 2;
          const row = Math.floor(i / 2);
          const tx = left + col * (colWV2 + colGapV2);
          const ty = benefitsTop + row * benefitGap;
          
          const iconSizeV2 = Math.round(fs * 1.5);
          // Offset icon slightly upwards visually to accommodate text baseline
          drawMonoIcon(ctx, h.icon || "check", tx + iconSizeV2 / 2, ty - fs/6, iconSizeV2, v2BenefitColor);
          
          ctx.fillStyle = v2BenefitColor;
          ctx.font = `700 ${fs}px Inter, Arial, sans-serif`;
          const textX = tx + iconSizeV2 + 15;
          const textMaxW = colWV2 - (iconSizeV2 + 15);
          while (ctx.measureText(h.text).width > textMaxW && fs > 14) {
            fs -= 1;
            ctx.font = `700 ${fs}px Inter, Arial, sans-serif`;
          }
          ctx.fillText(h.text, textX, ty);
        });

      } else {
        // ============================================================
        // REENGINEERED SQUARE 1:1 LAYOUT (FULL PARITY WITH STORY ARCHITECTURE)
        // ============================================================
        ctx.fillStyle = "#f7f4ef"; 
        ctx.fillRect(0, 0, width, height);

        const v2CardBg = primaryColor;
        const v2CardLabel = getSafeColor(v2CardBg, secondaryColor);
        const v2BenefitColor = getSafeColor("#f7f4ef", secondaryColor);
        const v2HeadlineColor = v2CardLabel;

        const benefitsListV2 = highlights.filter((h) => h?.text && h.text.trim().length > 0).slice(0, 6);
        const benefitsCountV2 = Math.max(1, benefitsListV2.length);

        // 1) Price block with full form parity (prefix + pill + price + suffix + total + pix)
        const isCashV2 = paymentMode === "cash" || paymentMode === "cash_discount";
        const isDownPlusV2 = paymentMode === "down_plus";
        const instMatchV2 = (installments || "10x").match(/(\d{1,2})\s*x/i);
        const parcNV2 = instMatchV2 ? instMatchV2[1] : "10";

        const prefixTxtV2 = (pricePrefix !== undefined ? pricePrefix : 
          (isCashV2 ? "pagamento" : (isDownPlusV2 ? "entrada +" : "a partir de"))
        ).toString().toUpperCase();

        const pillTxtV2 = (isCashV2 ? "À VISTA" : `${parcNV2}X`).toUpperCase();

        const priceRawV2 = (price || "").trim();
        const priceNumV2 = parseFloat(priceRawV2.replace(/\./g, "").replace(",", "."));
        const hasCentsV2 = /[.,]\d{1,2}\s*$/.test(priceRawV2);
        const fmtBRV2 = (n: number) => {
          try { return n.toLocaleString("pt-BR", { minimumFractionDigits: hasCentsV2 ? 2 : 0, maximumFractionDigits: hasCentsV2 ? 2 : 0 }); }
          catch { return String(n); }
        };
        const priceValV2 = !isNaN(priceNumV2) ? fmtBRV2(priceNumV2) : priceRawV2;
        const priceStrV2 = `${curSym} ${priceValV2}`;

        const suffixTxtV2 = (paymentSuffix || (isDownPlusV2 ? "parcelas" : "por pessoa")).toString().toUpperCase();

        const totalMultV2 = isCashV2 ? 1 : parseInt(parcNV2, 10) || 1;
        const totalNumV2 = !isNaN(priceNumV2) ? priceNumV2 * totalMultV2 : NaN;
        const totalStrV2 = (totalOverride && totalOverride.trim())
          || (!isNaN(totalNumV2) ? `Total ${curSym} ${fmtBRV2(totalNumV2)}` : "");
        const showTotalV2 = showTotal && !!totalStrV2 && !isCashV2;

        const pixTxtV2 = (pixBannerText || "").trim().toUpperCase();
        const showPixV2 = pixTxtV2.length > 0;

        // Compute card width based on widest piece of content
        ctx.font = "800 24px Inter, Arial, sans-serif";
        const wPrefV2 = ctx.measureText(prefixTxtV2).width;
        ctx.font = "900 28px Inter, Arial, sans-serif";
        const wPillV2 = ctx.measureText(pillTxtV2).width + 36;
        ctx.font = "900 76px Inter, Arial, sans-serif";
        const wPriceV2 = ctx.measureText(priceStrV2).width;
        ctx.font = "800 22px Inter, Arial, sans-serif";
        const wSufV2 = ctx.measureText(suffixTxtV2).width;
        const maxContentWV2 = Math.max(wPrefV2, wPillV2, wPriceV2, wSufV2);
        const priceBlockW = Math.min(width * 0.84, Math.max(width * 0.5, Math.round(maxContentWV2 + 110)));
        const priceCardH = 232;
        const priceCardX = Math.round((width - priceBlockW) / 2);

        // Reserve space for total + pix badges below the card
        const extrasBelowH = (showTotalV2 ? 36 : 0) + (showPixV2 ? 46 : 0) + (showTotalV2 || showPixV2 ? 16 : 0);
        const priceCardY = panelBottom - priceCardH - extrasBelowH - 40;

        // Card body
        fillRoundRect(ctx, priceCardX, priceCardY, priceBlockW, priceCardH, 22, v2CardBg);
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.lineWidth = 2.5;
        fillRoundRect(ctx, priceCardX + 1.5, priceCardY + 1.5, priceBlockW - 3, priceCardH - 3, 20, "transparent");
        ctx.stroke();
        ctx.restore();

        const cardCenterX = priceCardX + priceBlockW / 2;

        // Prefix (top)
        if (prefixTxtV2) {
          ctx.fillStyle = v2CardLabel;
          ctx.font = "800 24px Inter, Arial, sans-serif";
          ctx.textAlign = "center";
          safeFillText(ctx, prefixTxtV2, cardCenterX, priceCardY + 38, priceBlockW - 40, 14);
        }

        // Installment pill
        const pillH = 38;
        const pillW = Math.max(72, wPillV2);
        const pillX = cardCenterX - pillW / 2;
        const pillY = priceCardY + 56;
        fillRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, v2CardLabel);
        ctx.fillStyle = v2CardBg;
        ctx.font = "900 22px Inter, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pillTxtV2, cardCenterX, pillY + pillH / 2 + 1);
        ctx.textBaseline = "alphabetic";

        // Price (auto-shrink)
        let pfsV2 = 76;
        ctx.font = `900 ${pfsV2}px Inter, Arial, sans-serif`;
        while (ctx.measureText(priceStrV2).width > priceBlockW - 50 && pfsV2 > 30) {
          pfsV2 -= 4;
          ctx.font = `900 ${pfsV2}px Inter, Arial, sans-serif`;
        }
        ctx.fillStyle = v2CardLabel;
        ctx.textAlign = "center";
        ctx.fillText(priceStrV2, cardCenterX, priceCardY + 158);

        // Suffix (bottom)
        if (suffixTxtV2) {
          ctx.font = "800 22px Inter, Arial, sans-serif";
          ctx.globalAlpha = 0.92;
          ctx.fillText(suffixTxtV2, cardCenterX, priceCardY + 200);
          ctx.globalAlpha = 1.0;
        }

        // Total line below card
        let extrasY = priceCardY + priceCardH + 18;
        if (showTotalV2) {
          ctx.fillStyle = primaryColor;
          ctx.font = "800 24px Inter, Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.globalAlpha = 0.85;
          ctx.fillText(totalStrV2, cardCenterX, extrasY);
          ctx.globalAlpha = 1.0;
          extrasY += 36;
        }

        // Pix badge below
        if (showPixV2) {
          ctx.font = "900 20px Inter, Arial, sans-serif";
          const pixW = ctx.measureText(pixTxtV2).width + 40;
          const pixH = 36;
          const pixX = cardCenterX - pixW / 2;
          fillRoundRect(ctx, pixX, extrasY, pixW, pixH, pixH / 2, secondaryColor);
          ctx.fillStyle = "#0a0a0a";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(pixTxtV2, cardCenterX, extrasY + pixH / 2 + 1);
          ctx.textBaseline = "alphabetic";
        }

        // Travel period rendered as a small line ABOVE the price card (no longer overlapping benefits)
        let periodYOffset = 0;
        if (travelPeriod && travelPeriod.trim()) {
          ctx.fillStyle = v2CardBg;
          ctx.font = "900 30px Inter, Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(travelPeriod.trim().toUpperCase(), width / 2, priceCardY - 38);
          periodYOffset = 90;
        }
        ctx.textAlign = "left";

        // 2) Intelligent Multi-line Headline Bar (with optional promoName accent)
        const promoTagV2 = (promoName || "").trim().toUpperCase();
        const hasPromoV2 = promoTagV2.length > 0;
        const resolvedTitle = (titleText || "").toUpperCase();
        ctx.font = "900 52px Inter, Arial, sans-serif";
        const titleLines = wrapTextSafe(ctx, resolvedTitle, contentWidth - 40, 2, 32);
        const isMultiLine = titleLines.length > 1;
        const promoH = hasPromoV2 ? 28 : 0;
        const faixaH = (isMultiLine ? 134 : 96) + promoH;

        // ðŸ›¡ï¸ DYNAMIC COLLISION PROTECTION ENGINE ðŸ›¡ï¸
        const benefitRowsV2 = Math.ceil(benefitsCountV2 / 2);
        const benefitGap = benefitRowsV2 <= 2 ? 74 : 58;
        const benefitsEffectiveH = (benefitRowsV2 - 1) * benefitGap;
        
        // Fixed reservation buffer required for the mid-panel assets
        const requiredBuff = 60; 
        const contentFloorLimit = priceCardY - periodYOffset;
        const maxSafeCeiling = contentFloorLimit - (benefitsEffectiveH + requiredBuff);

        // Layout Positioning: TOP-DOWN with dynamic safety clamp
        let photoBottom = 480; 
        const photoConstraint = maxSafeCeiling - 16 - faixaH;
        photoBottom = Math.min(photoBottom, photoConstraint);
        
        const photoTop = safeTop - 20; // Typically 40 in square mode
        const faixaY = photoBottom + 16;

        fillRoundRect(ctx, 0, faixaY, width, faixaH, 0, v2CardBg);

        // Promo tagline accent at top of faixa
        if (hasPromoV2) {
          ctx.fillStyle = secondaryColor;
          ctx.font = "800 22px Inter, Arial, sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
          safeFillText(ctx, promoTagV2, left, faixaY + 28, width - left - 40, 14);
        }

        ctx.fillStyle = v2HeadlineColor;
        ctx.textBaseline = "middle";

        const lineSpacing = 58;
        const textBlockH = isMultiLine ? lineSpacing : 0;
        const titleZoneY = faixaY + promoH;
        const titleZoneH = faixaH - promoH;
        const startTextY = (titleZoneY + titleZoneH / 2) - (textBlockH / 2);

        titleLines.forEach((txt, i) => {
           safeFillText(ctx, txt, left, startTextY + (i * lineSpacing), width - left - 40, 20);
        });
        ctx.textBaseline = "alphabetic";

        // 3) The Expanded Photo Mask
        const fW2 = width - 32;
        const fH2 = photoBottom - photoTop;
        const c2 = fitCover(image.naturalWidth, image.naturalHeight, fW2, fH2, 0.36);
        ctx.save();
        fillRoundRect(ctx, 16, photoTop, fW2, fH2, 22, "#ccc");
        ctx.clip();
        ctx.drawImage(image, c2.sx, c2.sy, c2.sw, c2.sh, 16, photoTop, fW2, fH2);
        ctx.restore();

        // 4) Highlights Centering Module (Aligns content between panels)
        const bfs = benefitRowsV2 <= 2 ? 36 : 32;
        
        const contentCeilLimit = faixaY + faixaH;
        // Garante um respiro mÃ­nimo de 35px abaixo da faixa preta
        const topSpacing = 35;
        const contentCeilWithSpacing = contentCeilLimit + topSpacing;
        const verticalFreeSpace = contentFloorLimit - contentCeilWithSpacing;
        
        const benefitsTop = contentCeilWithSpacing + Math.max(0, (verticalFreeSpace - benefitsEffectiveH) / 2);

        const colGapV2 = 28;
        const colWV2 = (contentWidth - colGapV2) / 2;
        
        ctx.save();
        ctx.textBaseline = "middle";
        benefitsListV2.forEach((h, i) => {
          let fs = bfs;
          const col = i % 2;
          const row = Math.floor(i / 2);
          const tx = left + col * (colWV2 + colGapV2);
          const ty = benefitsTop + row * benefitGap;
          
          const iconSizeV2 = Math.round(fs * 1.4);
          // Desenha o Ã­cone centralizado perfeitamente na linha ty
          drawMonoIcon(ctx, h.icon || "check", tx + iconSizeV2/2, ty, iconSizeV2, v2BenefitColor);
          
          ctx.fillStyle = v2BenefitColor;
          ctx.font = `700 ${fs}px Inter, Arial, sans-serif`;
          const textX = tx + iconSizeV2 + 14;
          const textMaxW = colWV2 - (iconSizeV2 + 14);
          while (ctx.measureText(h.text).width > textMaxW && fs > 14) {
            fs -= 1;
            ctx.font = `700 ${fs}px Inter, Arial, sans-serif`;
          }
          // Desenha o texto centralizado na linha ty
          ctx.fillText(h.text, textX, ty);
        });
        ctx.restore();
      }

      await drawFinalBranding(
        ctx, width, height, logoDataUrl, 
        options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined), 
        options.footerContact2Icon ? { icon: options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
        effectiveTextColor,
        userFamily,
        false,
        logoFormat
      );
    return canvas.toDataURL("image/png");
    }

    // â”€â”€ V4 Â· CIRCUITO BR â€” card azul flutuante centralizado + pÃ­lula Pix vazada â”€
    // Estrutura ref. anuncio "Circuito Portugal": foto cinematografica do destino
    // ocupando 100% do canvas; card primario arredondado centralizado mais abaixo
    // do meio (deixa ceu/paisagem visÃ­vel em cima); pÃ­lula Pix em formato pÃ­lula
    // "vazando" metade para fora da borda inferior do card.
    //
    // Mapeamento estrito form â†’ render:
    //   BG          â†’ image (Foto Real / Sua Imagem / IA Pura por Destino)
    //   card.bg     â†’ primaryColor
    //   tagline     â†’ promoName               cor: secondaryColor
    //   tÃ­tulo      â†’ titleText (resolvido)   cor: branco
    //   info        â†’ daysText | Ã­cones       cor: secondaryColor (mono)
    //   12X pill bg â†’ secondaryColor          texto: primaryColor
    //   "a partir de"/"sem juros"/"Total ..." â†’ branco
    //   R$ + valor  â†’ branco (valor SEM vÃ­rgula/centavos â€” absoluto)
    //   pix pill    â†’ bg secondaryColor, texto branco, vazando bottom: -28
    if (variant === 4) {