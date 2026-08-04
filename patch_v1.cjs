const fs = require('fs');
let code = fs.readFileSync('src/lib/fabrica-compose-art.ts', 'utf8');

// 1. Fix Benefits strokeWidth and empty text in V1
const benefitsRegex = /benefitsListV1\.forEach\(\(h, i\) => \{([\s\S]*?)ctx\.textBaseline = "alphabetic";\s*\}\);/;
const newBenefits = enefitsListV1.forEach((h, i) => {
        if (!h.text || !h.text.trim()) return;
        const py = hlStart + i * (pillH + pillGap);
        fillRoundRect(ctx, px, py, pw, pillH, 14, pillBg);
        ctx.fillStyle = v1Accent;
        ctx.font = \400 \px Inter, Arial, sans-serif\;
        ctx.textBaseline = "middle";
        drawMonoIcon(ctx, h.icon || "check", px + 22 + 32/2, py + pillH / 2, 32, v1Accent, 1.7);
        ctx.fillStyle = v1OnPanel;
        let tf = pillFont;
        ctx.font = \700 \px Inter, Arial, sans-serif\;
        const maxTw = pw - 90;
        while (ctx.measureText(h.text).width > maxTw && tf > 14) {
          tf -= 2;
          ctx.font = \700 \px Inter, Arial, sans-serif\;
        }
        safeFillText(ctx, h.text, px + 76, py + pillH / 2, pw - 90, 14);
        ctx.textBaseline = "alphabetic";
      });;
code = code.replace(benefitsRegex, newBenefits);

// 2. Fix Price Block in V1
const priceRegex = /\/\/ 9\) PRICE CARD overlay[\s\S]*?ctx\.textAlign = "left";/;
const newPrice = // 9) PRICE CARD overlay
      const priceCardOverlay = v1OnPanel === "#ffffff" ? "rgba(0,0,0,0.32)" : "rgba(255,255,255,0.28)";
      
      const pixTxtV1 = showPixBanner ? (pixBannerText || "").trim().toUpperCase() : "";
      const hasPixV1 = pixTxtV1.length > 0;
      const finalPriceBlockH = hasPixV1 ? 230 : 190;
      
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;
      fillRoundRect(ctx, px, priceBlockY, pw, finalPriceBlockH, 18, priceCardOverlay);
      ctx.restore();
      
      const topLabelRenderV1 = (() => {
        if (paymentMode === "installments" || paymentMode === "from") return pricePrefix || "a partir de";
        if (paymentMode === "down_plus") return pricePrefix || "Entrada +";
        return paymentLabel || pricePrefix || "a partir de";
      })().toString().toUpperCase();

      const instTextV1 = installments && (paymentMode === "installments" || paymentMode === "down_plus") 
        ? (installments.toLowerCase().includes("de") ? installments : \\ de\) 
        : "";

      let currentLabelY = priceBlockY + 32;
      ctx.textAlign = "center";
      
      if (instTextV1) {
         ctx.fillStyle = v1OnPanel;
         ctx.font = "900 16px Inter, Arial, sans-serif";
         ctx.fillText(instTextV1.toUpperCase(), px + pw / 2, currentLabelY);
         currentLabelY += 20;
      }
      ctx.fillStyle = v1Accent;
      ctx.font = "900 20px Inter, Arial, sans-serif";
      ctx.fillText(topLabelRenderV1, px + pw / 2, currentLabelY);

      currentLabelY += 10;

      const rawPrice = (mainPrice || price || "").trim();
      let pSym = (curSym || "R$").trim();
      let pInt = rawPrice;
      let pCents = "";

      if (pInt.toUpperCase().startsWith(pSym.toUpperCase())) {
          pInt = pInt.substring(pSym.length).trim();
      } else if (pInt.toUpperCase().startsWith("R$")) {
          pSym = "R$";
          pInt = pInt.substring(2).trim();
      }

      if (!hideCents) {
          const match = pInt.match(/^(.*?)([,.]\\d{2})$/);
          if (match) {
              pInt = match[1];
              pCents = match[2];
          }
      } else {
          pInt = pInt.replace(/[,.]\\d{2}$/, "");
      }

      let priceFsV1 = 76;
      let symWV1 = 0, intWV1 = 0, centsWV1 = 0, totalWV1 = 0;
      const calcPriceWidthsV1 = () => {
          ctx.font = \800 \px Inter, Arial, sans-serif\;
          symWV1 = ctx.measureText(pSym + " ").width;
          ctx.font = \900 \px Inter, Arial, sans-serif\;
          intWV1 = ctx.measureText(pInt).width;
          ctx.font = \800 \px Inter, Arial, sans-serif\;
          centsWV1 = pCents ? ctx.measureText(pCents).width : 0;
          totalWV1 = symWV1 + intWV1 + centsWV1;
      };

      calcPriceWidthsV1();
      while (totalWV1 > pw - 30 && priceFsV1 > 40) {
          priceFsV1 -= 4;
          calcPriceWidthsV1();
      }

      let startXV1 = (px + pw / 2) - totalWV1 / 2;
      const pyV1 = currentLabelY + priceFsV1 - 10;

      ctx.textAlign = "left";
      ctx.fillStyle = v1OnPanel;
      
      ctx.font = \800 \px Inter, Arial, sans-serif\;
      ctx.fillText(pSym, startXV1, pyV1 - priceFsV1 * 0.45);
      
      ctx.font = \900 \px Inter, Arial, sans-serif\;
      ctx.fillText(pInt, startXV1 + symWV1, pyV1);

      if (pCents) {
          ctx.font = \800 \px Inter, Arial, sans-serif\;
          ctx.fillText(pCents, startXV1 + symWV1 + intWV1, pyV1 - priceFsV1 * 0.45);
      }
      
      ctx.textAlign = "center";
      ctx.fillStyle = v1Accent;
      ctx.font = "800 20px Inter, Arial, sans-serif";
      ctx.fillText(bottomSuffix || "por pessoa", px + pw / 2, pyV1 + 30);
      
      if (hasPixV1) {
        const pixFsV1 = 18;
        ctx.font = \900 \px Inter, Arial, sans-serif\;
        const pixWV1 = ctx.measureText(pixTxtV1).width + 36;
        const pixHV1 = 36;
        const pixYV1 = pyV1 + 45;
        
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        fillRoundRect(ctx, (px + pw/2) - pixWV1/2, pixYV1, pixWV1, pixHV1, 18, v1Accent);
        ctx.restore();
        
        ctx.fillStyle = contrastOn(v1Accent);
        ctx.textBaseline = "middle";
        ctx.fillText(pixTxtV1, px + pw/2, pixYV1 + pixHV1/2 + 1);
        ctx.textBaseline = "alphabetic";
      }
      
      ctx.textAlign = "left";;
code = code.replace(priceRegex, newPrice);

// 3. Fix Contact alignment in V1
const contactsRegex = /\/\/ 11\) Contatos na base do painel esquerdo[\s\S]*?ctx\.textBaseline = "alphabetic";/;
const newContacts = // 11) Contatos na base do painel esquerdo
      const contactFs = 18;
      ctx.font = \700 \px Inter, Arial, sans-serif\;
      ctx.fillStyle = v1OnPanel;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      let contactY = height - (format === "story" ? 80 : 130);
      
      if (instagram || options.footerContact2Value) {
        const val = options.footerContact2Value || instagram;
        const icon = options.footerContact2Icon || "instagram_gradient";
        if (icon === "instagram_gradient" || icon.startsWith("instagram")) {
            drawAdInstagramIcon(ctx, px + 18, contactY, 28, icon.includes("gradient") ? "gradient" : "custom", v1OnPanel);
        } else {
            drawAdWebsiteIcon(ctx, px + 18, contactY, 28, v1OnPanel);
        }
        ctx.fillStyle = v1OnPanel;
        safeFillText(ctx, val, px + 54, contactY + 14, pw - 54, contactFs);
        contactY -= 40;
      }

      if (whatsapp || options.footerContact1Value) {
        const val = options.footerContact1Value || whatsapp;
        const icon = options.footerContact1Icon || "whatsapp_green";
        if (icon.startsWith("whatsapp")) {
            drawAdWhatsAppIcon(ctx, px + 18, contactY, 28, "green");
        } else {
            drawAdWebsiteIcon(ctx, px + 18, contactY, 28, v1OnPanel);
        }
        ctx.fillStyle = v1OnPanel;
        safeFillText(ctx, val, px + 54, contactY + 14, pw - 54, contactFs);
      }
      ctx.textBaseline = "alphabetic";;
code = code.replace(contactsRegex, newContacts);

fs.writeFileSync('src/lib/fabrica-compose-art.ts', code);
