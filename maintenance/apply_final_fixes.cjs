const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/fabrica-compose-art.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Variant 0 Logo Placement
const v0Search = '      // 5) Pinta painel\n      ctx.fillStyle = v0PanelBg;\n      ctx.fillRect(0, 0, width, topH);';
const v0Replace = `      // 5) Pinta painel
      ctx.fillStyle = v0PanelBg;
      ctx.fillRect(0, 0, width, topH);

      // 5.1) Branding Superior (Logo) - Tornando a marca do agente PROEMINENTE
      if (hasLogo && logoDataUrl) {
        try {
          const logoImg = await loadImage(logoDataUrl);
          const r = logoImg.naturalWidth / logoImg.naturalHeight;
          const lh = 110; // Aumentado para mais destaque
          const lw = lh * r;
          const bgP = 12;
          // Moldura branca para destacar a logo sobre o fundo colorido
          fillRoundRect(ctx, left, 40, lw + bgP*2, lh + bgP*2, 14, "#ffffff");
          ctx.drawImage(logoImg, left + bgP, 40 + bgP, lw, lh);
        } catch(e) {}
      }

      // 6) Badge "Saindo de"
      const badgeY = logoH + 36;`;

if (content.includes(v0Search)) {
    content = content.replace(v0Search, v0Replace);
    // Also remove the old badgeY line which is now redundant (if it matches exactly)
    content = content.replace('      const badgeY = logoH + 28;', '');
    console.log('Fixed V0 logo placement');
} else {
    console.warn('Could not find V0 target');
}

// 2. Fix drawFinalBranding icons
const brandingSearch = '    if (c.icon === "whatsapp_green") drawAdWhatsAppIcon(ctx, iconX, yPos, currentIconSize, "green");\n    else if (c.icon === "whatsapp_custom") drawAdWhatsAppIcon(ctx, iconX, yPos, currentIconSize, "custom", ctx.fillStyle);\n    else if (c.icon === "instagram_gradient") drawAdInstagramIcon(ctx, iconX, yPos, currentIconSize, "gradient");\n    else if (c.icon === "instagram_custom") drawAdInstagramIcon(ctx, iconX, yPos, currentIconSize, "custom", ctx.fillStyle);\n    else if (c.icon === "website") drawAdWebsiteIcon(ctx, iconX, yPos, currentIconSize, ctx.fillStyle);';
const brandingReplace = `    // 🛡️ BLINDAGEM DE ICONES: Usa desenho matemático (Canvas Path) em vez de emojis
    if (c.icon === "whatsapp_green" || c.icon === "whatsapp_custom") {
      drawAdWhatsAppIcon(ctx, iconX, yPos, currentIconSize, c.icon === "whatsapp_green" ? "green" : "custom", ctx.fillStyle);
    } else if (c.icon === "instagram_gradient" || c.icon === "instagram_custom") {
      drawAdInstagramIcon(ctx, iconX, yPos, currentIconSize, c.icon === "instagram_gradient" ? "gradient" : "custom", ctx.fillStyle);
    } else if (c.icon === "website" || c.icon === "phone" || c.icon === "link") {
      drawAdWebsiteIcon(ctx, iconX, yPos, currentIconSize, ctx.fillStyle);
    } else {
      // Fallback robusto
      drawMonoIcon(ctx, "check", iconX, yPos, currentIconSize, ctx.fillStyle);
    }`;

if (content.includes(brandingSearch)) {
    content = content.replace(brandingSearch, brandingReplace);
    console.log('Fixed drawFinalBranding icons');
} else {
    console.warn('Could not find branding target');
}

fs.writeFileSync(filePath, content, 'utf8');
