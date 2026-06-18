import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

const oldCtaLogic = `      fillRoundRect(ctx, ctaX, ctaY, ctaW, ctaH, 16, accent);
      ctx.lineWidth = 3;
      ctx.strokeStyle = gold;
      roundRect(ctx, ctaX + 1.5, ctaY + 1.5, ctaW - 3, ctaH - 3, 14);
      ctx.stroke();
      ctx.restore();
      ctx.textAlign = "center";
      ctx.fillStyle = gold;
      safeFillText(ctx, ctaTextFinal, width / 2, ctaY + ctaH / 2 + 2, ctaW - ctaH, 12);`;

const newCtaLogic = `      fillRoundRect(ctx, ctaX, ctaY, ctaW, ctaH, 16, gold); // Botão Sólido vibrante
      ctx.restore();
      ctx.textAlign = "center";
      ctx.fillStyle = onGold; // Texto escuro (contraste)
      safeFillText(ctx, ctaTextFinal, width / 2, ctaY + ctaH / 2 + 2, ctaW - ctaH, 12);`;

code = code.replace(oldCtaLogic, newCtaLogic);
fs.writeFileSync(file, code);
console.log('CTA patched successfully!');
