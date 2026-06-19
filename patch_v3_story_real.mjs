import fs from 'fs';
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

// Chunk 1: V3 STORY "SUPER OFERTA" badge (lines ~1725-1755)
let start1 = -1;
let end1 = -1;
for (let i = 1700; i < 1850; i++) {
  if (lines[i] && lines[i].includes('// Titulo "PACOTE" como Badge')) start1 = i;
  if (start1 !== -1 && lines[i] && lines[i].includes('ctx.textBaseline = "alphabetic";')) {
    end1 = i;
    break;
  }
}

if (start1 !== -1 && end1 !== -1) {
  const replacement1 = `        // Titulo "PACOTE" como Badge
        const pacoteText = (promoName || "PACOTE").trim().toUpperCase();
        ctx.font = "900 32px Inter, Arial, sans-serif";
        const pacoteW = ctx.measureText(pacoteText).width + 70;
        const pacoteH = 52;
        const badgeY = boxY + 64; // Subiu ~0.5cm (era 84)

        const dateText = (travelDate || "").trim().toUpperCase();
        const dateW = dateText ? ctx.measureText(dateText).width + 40 : 0;
        const gap = 12;
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
  lines.splice(start1, end1 - start1 + 1, replacement1);
  console.log("Chunk 1 (V3 Story SUPER OFERTA + Date) patched.");
} else {
  console.log("Chunk 1 NOT FOUND!");
}

// Chunk 2: V3 STORY Pix Banner (lines ~1880-1925)
let start2 = -1;
let end2 = -1;
// we search for the V3 Story Pix Banner by starting from the top again
for (let i = 1800; i < 2000; i++) {
  if (lines[i] && lines[i].includes('// Faixa de Desconto Pix no rodap')) start2 = i;
  if (start2 !== -1 && lines[i] && lines[i].includes('ctx.fillText("pix", pillX + pillPad + pixIconSize + pixGap, stripeY + stripeH / 2);')) {
    // we want to replace up to the end of the `if (showPixBanner)` block.
    // so we look 2 lines down.
    end2 = i + 3; 
    break;
  }
}

if (start2 !== -1 && end2 !== -1) {
  const replacement2 = `        // Faixa de Desconto Pix no rodapé do cartão amarelo
        if (showPixBanner) {
          const customBanner = (pixBannerText || "").trim();
          let totalPixW = 0;
          const pixText = \`\${descN}% OFF A VISTA NO\`;
          const pixIconSize = 32;
          const pixGap = 10;
          const pillPad = 8;
          let pillW = 0;

          ctx.font = "900 26px Inter, Arial, sans-serif";
          if (customBanner) {
            totalPixW = ctx.measureText(customBanner).width;
          } else {
            const pixTextW = ctx.measureText(pixText).width;
            ctx.font = "800 24px Inter, Arial, sans-serif";
            const pixLabelW = ctx.measureText("pix").width;
            pillW = pixIconSize + pixGap + pixLabelW + pillPad * 2;
            totalPixW = pixTextW + pixGap + pillW;
          }

          const stripeW = totalPixW + 60; // Margem de respiro justa
          const stripeX = cx - stripeW / 2; // Centralizado
          
          // Desce um pouco (+10px) e diminui a altura (stripeH = 50)
          const stripeY = boxY + boxH - 80;
          const myStripeH = 50; 
          
          fillRoundRect(ctx, stripeX, stripeY, stripeW, myStripeH, 25, navyRaw); // Bordas mais arredondadas
          ctx.fillStyle = contrastOn(navyRaw);
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
            ctx.fillText(pixText, pixStartX, stripeY + myStripeH / 2);
            
            const pillX = pixStartX + pixTextW + pixGap;
            const pillY = stripeY + (myStripeH - (myStripeH - 16)) / 2;
            const pillH = myStripeH - 16;
            fillRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, "#ffffff");
            
            const pxCx = pillX + pillPad + pixIconSize / 2;
            const pxCy = stripeY + myStripeH / 2;
            
            ctx.fillStyle = navyRaw;
            ctx.beginPath();
            ctx.arc(pxCx, pxCy, pixIconSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(pxCx - 4, pxCy - 6);
            ctx.lineTo(pxCx + 6, pxCy);
            ctx.lineTo(pxCx - 4, pxCy + 6);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = navyRaw;
            ctx.textAlign = "left";
            ctx.font = "800 24px Inter, Arial, sans-serif";
            ctx.fillText("pix", pillX + pillPad + pixIconSize + pixGap, stripeY + myStripeH / 2 + 1);
          }
          ctx.textBaseline = "alphabetic";
        }`;
  lines.splice(start2, end2 - start2 + 1, replacement2);
  console.log("Chunk 2 (V3 Story Pix Banner Width & Height) patched.");
} else {
  console.log("Chunk 2 NOT FOUND!");
}

// Write back with exact same line endings
fs.writeFileSync(path, lines.join('\n'), 'utf8');
