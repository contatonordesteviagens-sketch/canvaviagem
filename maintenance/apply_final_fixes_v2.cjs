const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/fabrica-compose-art.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize EOL
const originalContent = content;
content = content.replace(/\r\n/g, '\n');

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
          const lh = 110; 
          const lw = lh * r;
          const bgP = 12;
          fillRoundRect(ctx, left, 40, lw + bgP*2, lh + bgP*2, 14, "#ffffff");
          ctx.drawImage(logoImg, left + bgP, 40 + bgP, lw, lh);
        } catch(e) {}
      }

      // 6) Badge "Saindo de"
      const badgeY = logoH + 36;`;

if (content.includes(v0Search)) {
    content = content.replace(v0Search, v0Replace);
    content = content.replace('      const badgeY = logoH + 28;', '');
    console.log('Fixed V0 logo placement');
} else {
    // Try without spaces/tabs matching
    console.warn('Could not find V0 target with exact match');
}

// 2. Fix drawFinalBranding icons
const brandingSearchPart = 'if (c.icon === "whatsapp_green") drawAdWhatsAppIcon';
const brandingEndPart = 'drawAdWebsiteIcon(ctx, iconX, yPos, currentIconSize, ctx.fillStyle);';

const startIndex = content.indexOf(brandingSearchPart);
const endIndex = content.indexOf(brandingEndPart);

if (startIndex !== -1 && endIndex !== -1) {
    const partToReplace = content.substring(startIndex, endIndex + brandingEndPart.length);
    const brandingReplace = `// 🛡️ BLINDAGEM DE ICONES: Usa desenho matemático (Canvas Path) em vez de emojis
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
    content = content.substring(0, startIndex) + brandingReplace + content.substring(endIndex + brandingEndPart.length);
    console.log('Fixed drawFinalBranding icons via index');
}

fs.writeFileSync(filePath, content, 'utf8');
