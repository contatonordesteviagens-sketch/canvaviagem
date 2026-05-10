const fs = require('fs');
let content = fs.readFileSync('src/lib/fabrica-compose-art.ts', 'utf8');

const target = "        await drawFinalBranding(\r\n          ctx, width, height, logoDataUrl, \r\n          options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : u    if (variant === 0) {";

const replacement = `        await drawFinalBranding(
          ctx, width, height, logoDataUrl, 
          options.footerContact1Icon ? { icon: options.footerContact1Icon, value: options.footerContact1Value || '' } : (whatsapp ? { icon: 'whatsapp_green', value: whatsapp } : undefined), 
          options.footerContact2Icon ? { icon: options.footerContact2Icon, value: options.footerContact2Value || '' } : (instagram ? { icon: 'instagram_gradient', value: instagram } : undefined),
          effectiveTextColor,
          userFamily,
          false
        );
        applyFilmGrain(ctx, width, height, 0.04);
        return canvas.toDataURL("image/png");
      }
    }

    const logoH = hasLogo ? 130 : 0;
    const destUp = (destination || "DESTINO").toUpperCase();

    if (variant === 0) {`;

if (content.includes(target)) {
  content = content.replace(target, replacement.replace(/\n/g, '\r\n'));
  fs.writeFileSync('src/lib/fabrica-compose-art.ts', content, 'utf8');
  console.log("Success with CR-LF!");
} else {
  const targetNL = target.replace(/\r\n/g, '\n');
  if (content.includes(targetNL)) {
    content = content.replace(targetNL, replacement.replace(/\r\n/g, '\n'));
    fs.writeFileSync('src/lib/fabrica-compose-art.ts', content, 'utf8');
    console.log("Success with NL!");
  } else {
    console.log("Target not found!");
  }
}
