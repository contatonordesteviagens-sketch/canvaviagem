import fs from 'fs';
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

// Chunk 1: Move "SUPER OFERTA" up and add date
let start1 = -1;
let end1 = -1;
for (let i = 2000; i < 2150; i++) {
  if (lines[i] && lines[i].includes('let cursorY = safeBoxY + padTop + 42;')) start1 = i;
  if (start1 !== -1 && lines[i] && lines[i].includes('ctx.fillText(pacoteText, cx, cursorY + 4);')) {
    end1 = i;
    break;
  }
}

if (start1 !== -1 && end1 !== -1) {
  const replacement1 = `        let cursorY = safeBoxY + padTop + 25; // Subiu ~0.5cm
        
        // Titulo Promoção + Data (Lado a Lado)
        const pacoteText = (promoName || "PACOTE").trim().toUpperCase();
        ctx.font = "900 28px Inter, Arial, sans-serif";
        const pacoteW = ctx.measureText(pacoteText).width + 50;
        const pacoteH = 50;
        
        const dateText = (travelDate || "").trim().toUpperCase();
        const dateW = dateText ? ctx.measureText(dateText).width + 40 : 0;
        const gap = 12;
        const totalBadgeW = dateText ? pacoteW + gap + dateW : pacoteW;
        const badgeStartX = cx - totalBadgeW / 2;

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
        fillRoundRect(ctx, badgeStartX, cursorY - pacoteH/2, pacoteW, pacoteH, pacoteH/2, navy);
        if (dateText) {
          fillRoundRect(ctx, badgeStartX + pacoteW + gap, cursorY - pacoteH/2, dateW, pacoteH, pacoteH/2, navy);
        }
        ctx.restore();
        
        ctx.fillStyle = yellow;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pacoteText, badgeStartX + pacoteW/2, cursorY + 4);
        if (dateText) {
          ctx.fillText(dateText, badgeStartX + pacoteW + gap + dateW/2, cursorY + 4);
        }`;
  lines.splice(start1, end1 - start1 + 1, replacement1);
  console.log("Chunk 1 (SUPER OFERTA + Date) patched.");
}

// Chunk 2: Pix Banner
let start2 = -1;
let end2 = -1;
for (let i = 2200; i < 2350; i++) {
  if (lines[i] && lines[i].includes('const stripeY = cursorY + 24;')) start2 = i;
  if (start2 !== -1 && lines[i] && lines[i].includes('ctx.fillText(pixText, pixStartX, stripeY + stripeH / 2 + 1);')) {
    end2 = i;
    break;
  }
}

if (start2 !== -1 && end2 !== -1) {
  const replacement2 = `          // Calcula a largura exata do texto primeiro para centralizar e diminuir a barra preta
          const customBanner = (pixBannerText || "").trim();
          let totalPixW = 0;
          const pixText = \`\${descN}% OFF A VISTA NO\`;
          const pixIconSize = 36;
          const pixGap = 12;
          const pillPad = 10;
          let pillW = 0;
          
          ctx.font = "900 26px Inter, Arial, sans-serif";
          if (customBanner) {
            totalPixW = ctx.measureText(customBanner).width;
          } else {
            const pixTextW = ctx.measureText(pixText).width;
            ctx.font = "800 28px Inter, Arial, sans-serif";
            const pixLabelW = ctx.measureText("pix").width;
            pillW = pixIconSize + pixGap + pixLabelW + pillPad * 2;
            totalPixW = pixTextW + pixGap + pillW;
          }

          // A faixa agora nao ocupa mais a tela toda! (diminuir a largura do bloco preto)
          const stripeW = totalPixW + 60; // Margem de respiro justa
          const stripeX = cx - stripeW / 2;
          
          // Desce um pouco (cursorY + 35 em vez de +24) e diminui a altura (stripeH = 50)
          const stripeY = cursorY + 35;
          const myStripeH = 50; 
          
          const stripeBg = navyRaw;
          const stripeFg = contrastOn(stripeBg);
          fillRoundRect(ctx, stripeX, stripeY, stripeW, myStripeH, 25, stripeBg); // Bordas mais arredondadas
          
          ctx.fillStyle = stripeFg;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          if (customBanner) {
            ctx.font = "900 24px Inter, Arial, sans-serif";
            ctx.fillText(customBanner, stripeX + stripeW / 2, stripeY + myStripeH / 2 + 1);
          } else {
            ctx.font = "900 24px Inter, Arial, sans-serif";
            const pixTextW = ctx.measureText(pixText).width;
            const pixStartX = stripeX + (stripeW - totalPixW) / 2;
            ctx.textAlign = "left";
            ctx.fillText(pixText, pixStartX, stripeY + myStripeH / 2 + 1);`;
  lines.splice(start2, end2 - start2 + 1, replacement2);
  console.log("Chunk 2 (Pix Banner Width & Height) patched.");
}

// Write back with exact same line endings
fs.writeFileSync(path, lines.join('\n'), 'utf8');
