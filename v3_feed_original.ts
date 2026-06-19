          false
        );
        return canvas.toDataURL("image/png");
      } else {
        // [BG] Foto do destino cobrindo todo o canvas (primeira coisa a desenhar)
        const cBg = fitCover(image.naturalWidth, image.naturalHeight, width, height, 0.45);
        // Bypassed logo (drawProminentLogo called after drawImage is complete)

        // ├óÔÇØÔé¼├óÔÇØÔé¼ Cores do V3 (box CVC) ├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼
        // yellow  = cor secund├â┬íria do usu├â┬írio (fundo do box)
        // navy    = cor prim├â┬íria do usu├â┬írio   (texto/anel dentro do box)
        // navyRaw = primaryColor normalizado  (para a faixa Pix)
        const yellow = secondaryColor || "#FCD34D";
        const yellowDark = shadeColor(yellow, -12);
        const navy = getSafeColor(yellow, primaryColor);
        const navyRaw = primaryColor || "#0c2340";

        ctx.drawImage(image, cBg.sx, cBg.sy, cBg.sw, cBg.sh, 0, 0, width, height);
        await drawProminentLogo(ctx, 40, 40, 120);

        // ├óÔÇØÔé¼├óÔÇØÔé¼ Dados din├â┬ómicos ├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼
        const destinoUp = (destination || "DESTINO").toUpperCase();
        const daysItem = highlights.find((h) => /\d+\s*dia/i.test(h?.text || ""));
        const daysText = (travelPeriod && travelPeriod.trim()) || (daysItem?.text || "").trim();
        // ├â┬ìcones: usa APENAS os selecionados pelo usuario (sem merge com defaults).
        // Se nenhum highlight tiver ├â┬¡cone, usa um conjunto padr├â┬úo m├â┬¡nimo.
        const iconList = (() => {
          const fromHl = highlights
            .map((h) => h?.icon)
            .filter((k) => !!k);
          if (fromHl.length === 0) {
            return ["plane", "hotel", "coffee", "camera"];
          }
          // dedup preservando ordem do usuario, maximo 5
          const seen = new Set();
          const out = [];
          for (const k of fromHl) {
            if (!seen.has(k)) {
              seen.add(k);
              out.push(k);
              if (out.length >= 5) break;
            }
          }
          return out;
        })();

        // Parcelas: extrai n├â┬║mero de "12x", "12 x", "12" etc.
        const instMatch = (installments || "12x").match(/(\d{1,2})\s*x?/i);
        const parcN = instMatch ? instMatch[1] : "12";
        const priceStr = mainPrice || `${curSym} ${price}`;
        // Calcula total = preco ├âÔÇö parcelas (se parcelado), formatando milhares com "." e centavos com ","
        const priceNumeric = parseFloat(((price || "").trim()).replace(/\./g, "").replace(",", "."));
        const totalMultiplier = (paymentMode === "cash" || paymentMode === "cash_discount") ? 1 : parseInt(parcN, 10);
        const totalNum = !isNaN(priceNumeric) ? priceNumeric * totalMultiplier : NaN;
        // Se preco n├â┬úo tem centavos (inteiro), o total tambem n├â┬úo tera.
        const priceHasDecimals = /[.,]\d{1,2}\s*$/.test((price || "").trim());
        const fmtBR = (n) => {
          const showDec = priceHasDecimals && n % 1 !== 0;
          return n.toLocaleString("pt-BR", {
            minimumFractionDigits: showDec ? 2 : 0,
            maximumFractionDigits: showDec ? 2 : 0,
          });
        };
        // Total: prioriza override do usuario; sen├â┬úo calcula automatico com sufixo
        const computedTotal = !isNaN(totalNum)
          ? `Total ${(paymentSuffix || "por pessoa").trim()}: ${curSym} ${fmtBR(totalNum)}`
          : "";
        const totalStr = (totalOverride && totalOverride.trim()) || computedTotal;
        // Desconto: extrai n├â┬║mero do promoName (ex.: "5% OFF") ou usa 5 como default
        const descMatch = (promoName || "").match(/(\d{1,2})\s*%/);
        const descN = descMatch ? descMatch[1] : "5";

        // ├óÔÇØÔé¼├óÔÇØÔé¼ [BOX] amarelo arredondado ├óÔÇØÔé¼ ├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼├óÔÇØÔé¼
        const boxX = (width - Math.round(width * 0.68)) / 2;
        const boxW = Math.round(width * 0.68); // Ajustado de 0.72 para 0.68 para ser menos "largo"
        const boxR = 36;
        const padTop = 36;
        const titleGap = 24;
        const destGap = 18;
        const totalH = (showTotal && totalStr) ? 36 : 0;
        const totalGap = totalH ? 14 : 0;
        const stripeH = 64;
        const padBottom = 48; // Aumentado para respirar melhor

        const priceBlockH = 130; // Reduzido de 160 para remover espaco vazio dentro do box
        const ringH = priceBlockH - 8;

        // Calculo dinamico exato do Box
        let simY = padTop + 32;       // Altura base do pacote
        simY += titleGap + 48;        // Pos pacote
        simY += destGap + 36;         // Pos destino
        simY += 55;                   // Pos icones
        simY += ringH;                // Pos bloco de preco
        simY += totalGap + totalH;    // Pos total
        if (showPixBanner) {
          simY += 24 + stripeH;       // Pos pix (stripeGap + stripeH)
        }
        
        const boxH = simY + padBottom;
        const safeBoxY = 180;

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 28; ctx.shadowOffsetY = 8;
        fillRoundRect(ctx, boxX, safeBoxY, boxW, boxH, boxR, yellow);
        ctx.restore();

        const cx = boxX + boxW / 2;
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
        ctx.textBaseline = "alphabetic";
        
        cursorY += titleGap + 48;

        // Restaura cor para o destino
        ctx.fillStyle = navy;
        ctx.textAlign = "center";
        
        ctx.font = "500 56px Inter, Arial, sans-serif";
        let destSize = 56;
        while (ctx.measureText(destinoUp).width > boxW - 80 && destSize > 32) {
          destSize -= 2; ctx.font = `500 ${destSize}px Inter, Arial, sans-serif`;
        }
        safeFillText(ctx, destinoUp, cx, cursorY, boxW - 80, 24);
        cursorY += destGap + 36;

        let benefitsFontSize = 36; ctx.font = `700 ${benefitsFontSize}px Inter, Arial, sans-serif`;
        let daysW = 0;
        if (daysText && daysText.trim()) {
          while (ctx.measureText(daysText).width > boxW * 0.45 && benefitsFontSize > 20) {
            benefitsFontSize -= 2; ctx.font = `700 ${benefitsFontSize}px Inter, Arial, sans-serif`;
          }
          daysW = ctx.measureText(daysText).width;
        }
        const sepGap = 24; const iconSize = Math.round(benefitsFontSize * 1.8); const iconGap = 18;
        const iconsTotal = iconList.length * iconSize + Math.max(0, iconList.length - 1) * iconGap;
        
        const hasDays = !!(daysText && daysText.trim());
        const sepW = 0;
        const actualGap = hasDays ? sepGap : 0;
        const infoTotalW = (hasDays ? daysW + actualGap : 0) + iconsTotal;
        
        let infoX = cx - infoTotalW / 2;
        ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = navy;
        
        if (hasDays) {
          safeFillText(ctx, daysText, infoX, cursorY, boxW * 0.5, 14);
          infoX += daysW + actualGap;
        }
        iconList.forEach((k, i) => {
          drawMonoIcon(ctx, k, infoX + i * (iconSize + iconGap) + iconSize / 2, cursorY, iconSize, navy);
        });
        ctx.textBaseline = "alphabetic"; cursorY += 55;
        const ringX = boxX + 30;
        const ringY = cursorY;
        const ringW = boxW - 60;
        ctx.save();
        ctx.fillStyle = yellowDark;
        roundRect(ctx, ringX, ringY, ringW, ringH, 24);
        ctx.fill();
        ctx.restore();

        const priceBlockY = ringY + 30;

        const isCash = paymentMode === "cash" || paymentMode === "cash_discount";
        const isDownPlus = paymentMode === "down_plus";
        
        const topTxt = pricePrefix !== undefined ? pricePrefix : (isCash ? "pagamento" : (isDownPlus ? "entrada +" : "a partir de"));
        let mainTxt = `${parcN}X`;
        if (isCash) mainTxt = "A VISTA";
        else if (isDownPlus) {
          const clean = (installments || paymentLabel || "Entrada + 10x").replace(/entrada\s*\+?/i, "").trim();
          mainTxt = clean || `${parcN}X`;
        }
        const btmTxt = isCash ? (paymentSuffix || "por pessoa").trim() : (isDownPlus ? "parcelas" : "sem juros");

        // Quebra preco com centavos (V0 style)
        let pStr = priceStr.trim();
        let pSym = curSym;
        let pMain = pStr;
        let pCents = "";
        
        const symMatch = pStr.match(/^(\D+)\s*(.*)$/);
        if (symMatch) {
           pSym = symMatch[1].trim();
           pMain = symMatch[2].trim();
        }
        
        const centsMatch = pMain.match(/^([\d.]+)(,\d{2})$/);
        if (centsMatch) {
           pMain = centsMatch[1];
           pCents = centsMatch[2];
        }

        // Tamanhos esquerdos
        let pTxtSize = isCash ? 32 : 46; 
        ctx.font = `900 ${pTxtSize}px Inter, Arial, sans-serif`;
        const mainTxtW = ctx.measureText(mainTxt).width;
        
        ctx.font = "600 20px Inter, Arial, sans-serif";
        const topTxtW = ctx.measureText(topTxt.toUpperCase()).width;
        
        ctx.font = "600 18px Inter, Arial, sans-serif";
        const btmTxtW = ctx.measureText(btmTxt).width;
        
        const leftColW = Math.max(mainTxtW, topTxtW, btmTxtW);

        // Lado direito (preco)
        let priceSize = 120;
        ctx.font = `900 ${priceSize}px Inter, Arial, sans-serif`;
        let valW = ctx.measureText(pMain).width;
        
        while (valW > ringW * 0.40 && priceSize > 48) {
           priceSize -= 4;
           ctx.font = `900 ${priceSize}px Inter, Arial, sans-serif`;
           valW = ctx.measureText(pMain).width;
        }
        
        const symSize = Math.round(priceSize * 0.45);
        ctx.font = `900 ${symSize}px Inter, Arial, sans-serif`;
        const symW = ctx.measureText(pSym).width;
        
        const centsSize = Math.round(priceSize * 0.50);
        ctx.font = `900 ${centsSize}px Inter, Arial, sans-serif`;
        const centsW = pCents ? ctx.measureText(pCents).width : 0;
        
        const rightColW = symW + 12 + valW + (pCents ? 6 + centsW : 0);

        // Layout Centralizado
        const midGap = 40;
        const totalW = leftColW + midGap + rightColW;
        const startX = ringX + (ringW - totalW) / 2;
        
        const leftColX = startX;
        const rightColX = startX + leftColW + midGap;

        // Desenhar Lado Esquerdo centralizado
        ctx.textAlign = "center";
        ctx.fillStyle = navy;
        const leftColCx = leftColX + leftColW / 2;
        
        ctx.font = "600 20px Inter, Arial, sans-serif";
        ctx.fillText(topTxt.toUpperCase(), leftColCx, priceBlockY - 2);
        
        ctx.font = `900 ${pTxtSize}px Inter, Arial, sans-serif`;
        ctx.fillText(mainTxt, leftColCx, priceBlockY + 36);
        
        ctx.font = "600 18px Inter, Arial, sans-serif";
        ctx.fillText(btmTxt, leftColCx, priceBlockY + 68);

        // Desenhar Lado Direito
        const priceBaseY = priceBlockY + 70; 
        
        ctx.textAlign = "left";
        ctx.font = `800 ${symSize}px Inter, Arial, sans-serif`;
        ctx.fillText(pSym, rightColX, priceBaseY - priceSize + symSize + 8);
        
        ctx.font = `900 ${priceSize}px Inter, Arial, sans-serif`;
        ctx.fillText(pMain, rightColX + symW + 12, priceBaseY);
        
        if (pCents) {
           ctx.font = `800 ${centsSize}px Inter, Arial, sans-serif`;
           ctx.fillText(pCents, rightColX + symW + 12 + valW + 6, priceBaseY - priceSize + centsSize + 10);
        }

        cursorY = ringY + ringH + totalGap;

        // [TOTAL] rodape do box (apenas se showTotal)
        if (totalH > 0) {
          ctx.textAlign = "center";
          ctx.font = "600 22px Inter, Arial, sans-serif";
          ctx.fillStyle = navy;
          ctx.fillText(totalStr, cx, cursorY + 22);
          cursorY += totalH;
        }

        // [PROMO] faixa horizontal com texto Pix (opcional)
        // Fundo da faixa = primaryColor (navy padrao). Texto sempre com contraste.
        if (showPixBanner) {
          const stripeY = cursorY + 24;
          const stripeX = boxX + 40;
          const stripeW = boxW - 80;
          const stripeBg = navyRaw; // mantem a cor escolhida pelo usuario p/ a faixa
          const stripeFg = contrastOn(stripeBg); // texto preto/branco automatico
          fillRoundRect(ctx, stripeX, stripeY, stripeW, stripeH, 16, stripeBg);
          ctx.fillStyle = stripeFg;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "900 26px Inter, Arial, sans-serif";

          const customBanner = (pixBannerText || "").trim();
          if (customBanner) {
            ctx.fillText(customBanner, stripeX + stripeW / 2, stripeY + stripeH / 2 + 1);
          } else {
            // "{N}% OFF A VISTA NO  [pix]"
            const pixText = `${descN}% OFF A VISTA NO`;
            const pixTextW = ctx.measureText(pixText).width;
            const pixIconSize = 36;
            const pixGap = 12;
            ctx.font = "800 28px Inter, Arial, sans-serif";
            const pixLabelW = ctx.measureText("pix").width;
            ctx.font = "900 26px Inter, Arial, sans-serif";
            // p├â┬¡lula branca atras do logo+pix p/ garantir visibilidade da marca Pix
            const pillPad = 10;
            const pillW = pixIconSize + pixGap + pixLabelW + pillPad * 2;
            const pillH = stripeH - 16;
            const totalPixW = pixTextW + pixGap + pillW;
            const pixStartX = stripeX + (stripeW - totalPixW) / 2;
            ctx.textAlign = "left";
            ctx.fillStyle = stripeFg;
            ctx.fillText(pixText, pixStartX, stripeY + stripeH / 2 + 1);
            const pillX = pixStartX + pixTextW + pixGap;
            const pillY = stripeY + (stripeH - pillH) / 2;
            fillRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, "#ffffff");
            const pxCx = pillX + pillPad + pixIconSize / 2;
            const pxCy = stripeY + stripeH / 2;
            drawPixLogo(ctx, pxCx, pxCy, pixIconSize, "#32BCAD");
            ctx.fillStyle = "#32BCAD";
            ctx.font = "900 28px Inter, Arial, sans-serif";
            ctx.fillText("pix", pillX + pillPad + pixIconSize + pixGap, stripeY + stripeH / 2 + 1);
          }
          ctx.textBaseline = "alphabetic";
        }

        await drawFinalBranding(
          ctx, width, height, logoDataUrl, 
          options.footerContact1Icon ? { icon: options.footerContact1Icon.startsWith("whatsapp") ? "whatsapp_green" : options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined), 
          options.footerContact2Icon ? { icon: options.footerContact2Icon.startsWith("whatsapp") ? "whatsapp_green" : options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
          effectiveTextColor,
          userFamily,
          false
        );
        return canvas.toDataURL("image/png");
      }
    }

    const logoH = hasLogo ? 130 : 0;
    const destUp = (destination || "DESTINO").toUpperCase();

    if (variant === 0) {
      // REGRA GLOBAL DE LEGIBILIDADE: texto sempre tem que destacar do fundo.
      // Painel = secondaryColor ├óÔÇáÔÇÖ texto principal = primaryColor com contraste garantido.
      // Badge  = primaryColor   ├óÔÇáÔÇÖ texto da badge = secondaryColor com contraste garantido.
      const v0PanelBg = secondaryColor;
      const v0OnPanel = getSafeColor(v0PanelBg, primaryColor);
      const v0BadgeBg = primaryColor;
      const v0OnBadge = ensureContrast(secondaryColor, v0BadgeBg, 0.35);

      // 1) Calcula tamanho do t├â┬¡tulo para saber a altura real
      ctx.textAlign = "left";
      let titleSize = 78;
      ctx.font = `900 ${titleSize}px Inter, Arial, sans-serif`;
      while (ctx.measureText(titleText).width > contentWidth && titleSize > 38) {
        titleSize -= 4;
        ctx.font = `900 ${titleSize}px Inter, Arial, sans-serif`;
      }

      let benefitsList = highlights.filter((h) => h?.text && h.text.trim().length > 0);
      if (travelPeriod && travelPeriod.trim()) {
        const tp = travelPeriod.trim();
        benefitsList = benefitsList.filter(b => b.text.toLowerCase() !== tp.toLowerCase());
      }
      benefitsList = benefitsList.slice(0, 6);
      const benefitsCount = Math.max(1, benefitsList.length);
      const benefitLineH = benefitsCount <= 4 ? 44 : benefitsCount === 5 ? 38 : 34;
      const benefitsBlockH = benefitsCount * benefitLineH;

      // 3) Altura do bloco pre├ºo (agora maior para caber o PIX e prefixo)
      const priceBlockH = 160;
      const contentRowH = Math.max(benefitsBlockH, priceBlockH);

      // 4) Altura ADAPTATIVA do painel:
      const badgeH = 60;
      const topPaddingBeforeTitle = 40;
      const titleToContent = 50;
      const bottomPadding = 50;
      const safeAnchorY = isStory ? safeTop : (logoH + 28);
      
      const topH = Math.min(
        Math.round(height * 0.62),
        Math.max(
          Math.round(height * 0.46),
          safeAnchorY + badgeH + topPaddingBeforeTitle + titleSize + titleToContent + contentRowH + bottomPadding
        )
      );

      // 5) Pinta painel
      ctx.fillStyle = v0PanelBg;
      ctx.fillRect(0, 0, width, topH);

      // 6) Badges (Promo, Saindo de, Dias)
      const badges: string[] = [];
      if (promoName) badges.push(promoName.toUpperCase());
      if (city && city.trim() !== '' && city.trim().toLowerCase() !== 'fortaleza') badges.push(`Saindo de ${cityFmt}`);
      if (travelPeriod && travelPeriod.trim()) badges.push(travelPeriod.trim().toUpperCase());

      ctx.font = "800 24px Inter, Arial, sans-serif";
      const badgeGap = 15;
      let totalBadgeW = 0;
      const badgeWidths: number[] = [];
      badges.forEach(text => {
        const w = ctx.measureText(text).width + 30;
        badgeWidths.push(w);
        totalBadgeW += w;
      });
      if (badges.length > 0) totalBadgeW += badgeGap * (badges.length - 1);

      const badgeY = safeAnchorY;
      let badgeX = (width / 2) - (totalBadgeW / 2);

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.12)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      badges.forEach((text, i) => {
        const w = badgeWidths[i];
        fillRoundRect(ctx, badgeX, badgeY, w, badgeH, 12, v0BadgeBg);
        ctx.fillStyle = v0OnBadge;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(text, badgeX + w / 2, badgeY + badgeH / 2);
        badgeX += w + badgeGap;
      });
      ctx.restore();
      ctx.textBaseline = "alphabetic";

      // 7) Headline (1 linha, fonte adaptativa)
      ctx.fillStyle = v0OnPanel;
      ctx.font = `900 ${titleSize}px Inter, Arial, sans-serif`;
      const titleY = Math.max(badgeY + badgeH + topPaddingBeforeTitle + titleSize, safeAnchorY + 12 + titleSize);
      ctx.textAlign = "center";
      safeFillText(ctx, titleText, width / 2, titleY, width - 80, 22);

      // 8) Benefits + Pre├â┬ºo lado a lado ├óÔé¼ÔÇØ pre├â┬ºo ALINHADO ├âÔé¼ DIREITA pra eliminar
      //    o espa├â┬ºo em branco que sobrava no canto direito.
      const rowTopY = titleY + titleToContent;
      const benefitsX = left;
      // Largura do bloco de pre├â┬ºo: ~46% da contentWidth, m├â┬¡nimo 380px
      const priceBlockW = Math.max(380, Math.round(contentWidth * 0.46));
      const priceX = width - 60 - priceBlockW; // encosta no padding direito
      const benefitsMaxW = priceX - 24 - benefitsX;

      ctx.fillStyle = v0OnPanel;
      const iconSize0 = 28;
      const iconTextGap = 52; 
