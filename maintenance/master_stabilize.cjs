const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/fabrica-compose-art.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. FIX ENCODING (Comprehensive)
const encodingMap = {
    '├Ç': 'À', '├Á': 'Á', '├é': 'Â', '├â': 'Ã', '├ê': 'È', '├ë': 'É', '├è': 'Ê', '├ì': 'Í', '├ô': 'Ó', '├Ó': 'Ó', '├Ô': 'Ô', '├ò': 'Õ', '├║': 'Ú', '├º': 'ç',
    '├á': 'á', '├í': 'á', '├ó': 'â', '├ú': 'ã', '├⌐': 'é', '├¬': 'ê', '├¡': 'í', '├│': 'ó', '├┤': 'ô', '├╡': 'õ', '├║': 'ú', '├º': 'ç',
    'ÔÇö': '—', '┬À': '·', 'ÔË': '', 'ÔöÇ': '─', 'Ôö┬': '┬', 'ÔöÉ': '┐', 'Ôöé': '│', 'Ôöñ': '┤', 'Ôòö': '└', 'Ôòù': '┘', 'Ôòí': '┴', 'Ôò┤': '┬', 'Ôòó': '├', 'Ôò╣': '┼',
    'ÔÇÖ': "'", 'ÔÇô': '-', 'ÔÇª': '...', 'ÔÇÜ': ',', 'ÔÇÜ': ',', 'ÔÇÜ': ',', 'ÔÇÜ': ',', 'ÔÇÜ': ',', 'ÔÇÜ': ',',
    'ÔÇ£': '"', 'ÔÇØ': '"', 'ÔÇË': '', 'ÔÇÜ': ','
};

Object.entries(encodingMap).forEach(([key, val]) => {
    const re = new RegExp(key, 'g');
    content = content.replace(re, val);
});

// Normalize all non-standard characters to standard ones
content = content.replace(/ÔöÇ/g, '─');
content = content.replace(/┬À/g, '·');

// 2. UPGRADE drawFinalBranding to support skipping the logo
const brandingDefStart = content.indexOf('export async function drawFinalBranding(');
const brandingDefEnd = content.indexOf(')', brandingDefStart);
if (brandingDefStart !== -1 && !content.includes('skipLogo?: boolean', brandingDefStart)) {
    content = content.replace('fontFamily: string = "Inter"', 'fontFamily: string = "Inter", skipLogo?: boolean');
}

// Inside drawFinalBranding, wrap logo logic in !skipLogo
const logoLogicStart = content.indexOf('if (logoUrl) {', brandingDefStart);
if (logoLogicStart !== -1) {
    content = content.replace('if (logoUrl) {', 'if (logoUrl && !skipLogo) {');
}

// 3. UPGRADE V0, V1, V2, V3, V4 to use TOP LOGO
// I'll add a helper function inside composeTravelAd to draw the prominent logo
const helperLogo = `
  const drawProminentLogo = async (ctx: CanvasRenderingContext2D, x: number, y: number, maxHeight: number = 140) => {
    if (!hasLogo || !logoDataUrl) return 0;
    try {
      const logoImg = await loadImage(logoDataUrl);
      const r = logoImg.naturalWidth / logoImg.naturalHeight;
      const lh = maxHeight;
      const lw = lh * r;
      const bgP = 15;
      fillRoundRect(ctx, x, y, lw + bgP*2, lh + bgP*2, 16, "#ffffff");
      ctx.drawImage(logoImg, x + bgP, y + bgP, lw, lh);
      return y + lh + bgP * 2;
    } catch(e) { return 0; }
  };
`;

// Inject helperLogo after the initial constants in composeTravelAd
const injectPos = content.indexOf('const panelBottom = RULES.PANEL_BOTTOM;');
if (injectPos !== -1) {
    content = content.substring(0, injectPos) + helperLogo + content.substring(injectPos);
}

// Update V0, V1, V2, V3, V4 to use drawProminentLogo and skip logo in branding
const variants = ['variant === 0', 'variant === 1', 'variant === 2', 'variant === 3', 'variant === 4'];
variants.forEach(v => {
    let start = content.indexOf(v);
    if (start === -1) return;
    
    // Find branding call for this variant
    let brandingCall = content.indexOf('await drawFinalBranding(', start);
    if (brandingCall !== -1) {
        let closingParen = content.indexOf(');', brandingCall);
        if (closingParen !== -1) {
            content = content.substring(0, closingParen) + ', undefined, true' + content.substring(closingParen);
        }
    }
    
    // For V0, I already added some manual logic, let's clean it and use the helper
    if (v === 'variant === 0') {
        const v0LogoSearch = 'if (hasLogo && logoDataUrl) {';
        const v0LogoEnd = 'badgeY = logoH + 36;';
        const v0Start = content.indexOf(v0LogoSearch, start);
        const v0End = content.indexOf(v0LogoEnd, v0Start);
        if (v0Start !== -1 && v0End !== -1) {
            const v0NewLogo = `const logoBottomY = await drawProminentLogo(ctx, left, 40, 140);\n      const badgeY = Math.max(logoBottomY + 30, 170);`;
            content = content.substring(0, v0Start) + v0NewLogo + content.substring(v0End + v0LogoEnd.length);
        }
    } else {
        // For other variants, inject at the beginning of the block
        let blockStart = content.indexOf('{', start) + 1;
        content = content.substring(0, blockStart) + '\n      await drawProminentLogo(ctx, 40, 40, 120);' + content.substring(blockStart);
    }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Final Branding and Encoding Stabilization Complete');
