const fs = require('fs');
let content = fs.readFileSync('src/lib/fabrica-compose-art.ts', 'utf8');

const target = `            const curY = cy + index * 48;
            ctx.font = \`700 26px \${safeFont}, sans-serif\`;
            
            if (isWhatsapp) {
              await drawWhatsAppContact(ctx, contactX + 18, curY, 32);
              ctx.fillText(displayValue, contactX + 48, curY);
            } else if (c.icon.startsWith("instagram")) {
              drawAdInstagramIcon(ctx, contactX + 18, curY, 32, "gradient");
              ctx.fillText(displayValue, contactX + 48, curY);
            } else {
              drawAdWebsiteIcon(ctx, contactX + 18, curY, 32, "#ffffff");
              ctx.fillText(displayValue, contactX + 48, curY);
            }
          }
          ctx.restore();
        }
      }
      applyFilmGrain(ctx, width, height, 0.04);
    return canvas.toDataURL("image/png");
    }`;

const hasCRLF = content.includes(target.replace(/\n/g, '\r\n'));
const normalizedTarget = hasCRLF ? target.replace(/\n/g, '\r\n') : target;

if (content.includes(normalizedTarget)) {
  content = content.replace(normalizedTarget, "");
  fs.writeFileSync('src/lib/fabrica-compose-art.ts', content, 'utf8');
  console.log("Successfully deleted leftovers!");
} else {
  console.log("Leftovers target not found!");
}
