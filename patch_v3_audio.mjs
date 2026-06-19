import fs from 'fs';
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Add bottom shadow gradient
const brandingStr = `        // VÃ©u Gradiente Escuro do rodapÃ©
        await drawFinalBranding(`;

const brandingRep = `        // Sombreamento base (Áudio)
        const localGrad = ctx.createLinearGradient(0, height - 250, 0, height);
        localGrad.addColorStop(0, "transparent");
        localGrad.addColorStop(1, "rgba(0,0,0,0.85)");
        ctx.fillStyle = localGrad;
        ctx.fillRect(0, height - 250, width, 250);

        // VÃ©u Gradiente Escuro do rodapÃ©
        await drawFinalBranding(`;
content = content.replace(brandingStr, brandingRep);

// 2. Adjust Base Yellow Box Height
content = content.replace('const baseBoxH = topPadding + benefitsH + priceBlockTopGap + ringH + 40;', 'const baseBoxH = topPadding + benefitsH + priceBlockTopGap + ringH + 10;');

// 3. Move Destino down 0.5cm (15px)
content = content.replace('safeFillText(ctx, destinoUp, cx, boxY + 125, boxW - 80, 24);', 'safeFillText(ctx, destinoUp, cx, boxY + 140, boxW - 80, 24);');

// 4. Badges (Promo + Date)
const badgeStr = `        // Titulo "PACOTE" como Badge
        const pacoteText = (promoName || "PACOTE").trim().toUpperCase();
        ctx.font = "900 32px Inter, Arial, sans-serif";
        const pacoteW = ctx.measureText(pacoteText).width + 70;
        const pacoteH = 52;
        const badgeY = boxY + 84;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
        fillRoundRect(ctx, cx - pacoteW/2, badgeY - pacoteH/2, pacoteW, pacoteH, pacoteH/2, navy);
        ctx.restore();
        
        ctx.fillStyle = yellow;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pacoteText, cx, badgeY + 4);
        ctx.textBaseline = "alphabetic";`;

const badgeRep = `        // Titulo "PACOTE" e "DATA" como Badges (Áudio)
        const pacoteText = (promoName || "PACOTE").trim().toUpperCase();
        ctx.font = "900 32px Inter, Arial, sans-serif";
        const pacoteW = ctx.measureText(pacoteText).width + 50;
        const pacoteH = 52;
        const badgeY = boxY + 65; // Subiu 0.5cm
        
        const dateText = (travelDate || "").trim().toUpperCase();
        const dateW = dateText ? ctx.measureText(dateText).width + 50 : 0;
        const gap = 16;
        const totalBadgeW = dateText ? pacoteW + gap + dateW : pacoteW;
        const badgeStartX = cx - totalBadgeW / 2;

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
        fillRoundRect(ctx, badgeStartX, badgeY - pacoteH/2, pacoteW, pacoteH, pacoteH/2, navy);
        if (dateText) {
          fillRoundRect(ctx, badgeStartX + pacoteW + gap, badgeY - pacoteH/2, dateW, pacoteH, pacoteH/2, navy);
        }
        ctx.restore();
        
        ctx.fillStyle = yellow;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pacoteText, badgeStartX + pacoteW/2, badgeY + 4);
        if (dateText) {
          ctx.fillText(dateText, badgeStartX + pacoteW + gap + dateW/2, badgeY + 4);
        }
        ctx.textBaseline = "alphabetic";`;
content = content.replace(badgeStr, badgeRep);

// 5. Move Price Block up
content = content.replace('const priceBlockTopGap = 35;', 'const priceBlockTopGap = 15;'); // Movido para cima ~20px (quase 1cm)

// 6. Dynamic Green Box Width (this is tricky, so we'll rewrite the green box portion)
// Find the green box part
const greenBoxStart = `        // Bloco de PreÃ§o
        const ringX = boxX + 40;
        const ringY = priceBlockY;
        const ringW = boxW - 80;`;
const greenBoxReplacement = `        // Bloco de Preço Dinâmico (Áudio)
        // Primeiro, precisamos calcular o tamanho do texto ANTES de desenhar o fundo verde!
        const symMatch = priceStr.match(/^([^\\d]+)\\s*(.*)$/);
        let pSym = "R$";
        let pVal = priceStr;
        if (symMatch) { pSym = symMatch[1].trim(); pVal = symMatch[2].trim(); }
        const centsMatch = pVal.match(/^(.*)(,\\d{2})$/);
        let pMain = pVal;
        let pCents = "";
        if (centsMatch) { pMain = centsMatch[1]; pCents = centsMatch[2]; }
        
        let priceSize = 85;
        let symSize = Math.round(priceSize * 0.45);
        let centSize = Math.round(priceSize * 0.5);
        
        ctx.font = \`900 \${priceSize}px Inter, Arial, sans-serif\`;
        let mainW = ctx.measureText(pMain).width;
        ctx.font = \`800 \${symSize}px Inter, Arial, sans-serif\`;
        let symW = ctx.measureText(pSym).width + 6;
        ctx.font = \`800 \${centSize}px Inter, Arial, sans-serif\`;
        let centW = pCents ? ctx.measureText(pCents).width + 4 : 0;
        let totalW = symW + mainW + centW;

        const isCash = paymentMode === "cash" || paymentMode === "cash_discount";
        const topLabelRender = isCash 
          ? (pricePrefix !== undefined ? pricePrefix : "A VISTA").toString().toUpperCase()
          : (topLabel || "À VISTA").toString().toUpperCase();
        
        ctx.font = "800 28px Inter, Arial, sans-serif";
        const topLabelW = ctx.measureText(topLabelRender).width;
        const bottomLabelW = ctx.measureText(bottomSuffix || "por pessoa").width;
        
        // Define a largura final do quadro verde abraçando o maior texto + padding de 80px (40 de cada lado)
        const maxTextW = Math.max(totalW, topLabelW, bottomLabelW);
        const ringW = Math.min(boxW - 40, maxTextW + 80);
        
        const ringX = cx - ringW / 2;
        const ringY = priceBlockY;`;

content = content.replace(greenBoxStart, greenBoxReplacement);

// Remove the duplicated symMatch and sizes further down, but keeping totalW while loop shrinker intact
const oldSymMatchCode = `        // Quebra "R$ 149,90" em partes
        const symMatch = priceStr.match(/^([^\\d]+)\\s*(.*)$/);
        let pSym = "R$";
        let pVal = priceStr;
        if (symMatch) { pSym = symMatch[1].trim(); pVal = symMatch[2].trim(); }
        const centsMatch = pVal.match(/^(.*)(,\\d{2})$/);
        let pMain = pVal;
        let pCents = "";
        if (centsMatch) { pMain = centsMatch[1]; pCents = centsMatch[2]; }
        
        let priceSize = 85;
        let symSize = Math.round(priceSize * 0.45);
        let centSize = Math.round(priceSize * 0.5);
        
        ctx.font = \`900 \${priceSize}px Inter, Arial, sans-serif\`;
        let mainW = ctx.measureText(pMain).width;
        ctx.font = \`800 \${symSize}px Inter, Arial, sans-serif\`;
        let symW = ctx.measureText(pSym).width + 6;
        ctx.font = \`800 \${centSize}px Inter, Arial, sans-serif\`;
        let centW = pCents ? ctx.measureText(pCents).width + 4 : 0;
        let totalW = symW + mainW + centW;`;

const shrinkWhileLoop = `        while (totalW > ringW - 60 && priceSize > 40) {`;

content = content.replace(oldSymMatchCode + '\n        \n' + shrinkWhileLoop, shrinkWhileLoop);
content = content.replace(oldSymMatchCode + '\r\n        \r\n' + shrinkWhileLoop, shrinkWhileLoop);

// Also remove `const isCash` and `const topLabelRender` that were duplicated down there
const oldTopLabelCode = `        const isCash = paymentMode === "cash" || paymentMode === "cash_discount";
        const topLabelRender = isCash 
          ? (pricePrefix !== undefined ? pricePrefix : "A VISTA").toString().toUpperCase()
          : (topLabel || "Ã€ VISTA").toString().toUpperCase();`;
// Notice the encoding issue with "À VISTA" as "Ã€ VISTA" in the file read. I will match via regex.

content = content.replace(/const isCash = paymentMode === "cash"[\s\S]*?toUpperCase\(\);/, '');

fs.writeFileSync(path, content, 'utf8');
console.log("Audio adjustments applied.");
