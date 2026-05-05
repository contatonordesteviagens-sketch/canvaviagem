const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/fabrica-compose-art.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Fix drawPriceCard collision detection
const drawPriceCardFix = `      // Quebra "R$ 229" em simbolo pequeno + valor gigante
      const priceParts = priceStr.match(/^(\\D+)\\s*([\\d.,]+)$/);
      const sym = priceParts ? priceParts[1].trim() : curSym;
      const valNum = priceParts ? priceParts[2].trim() : priceStr;

      // DEFENSIVE: Ajusta tamanho da fonte se o preco for MUITO longo (evita colisao com 10X)
      const leftReservedW = 120;
      const maxPriceW = priceGroupW - leftReservedW - minGap;
      let priceSize = 120;
      ctx.font = \`900 \${priceSize}px Inter, Arial, sans-serif\`;
      while (ctx.measureText(valNum).width > maxPriceW && priceSize > 44) {
        priceSize -= 4;
        ctx.font = \`900 \${priceSize}px Inter, Arial, sans-serif\`;
      }
      const valW = ctx.measureText(valNum).width;
      const symSize = Math.round(priceSize * 0.36);`;

const targetRegex = /\/\/ Quebra "R\$ 229" em s├¡mbolo pequeno \+ valor gigante[\s\S]*?const symSize = Math\.round\(priceSize \* 0\.36\);/;
// Since I already sanitized the file, the text might be different. 
// Let's search for the logic instead.

const searchString = 'const priceParts = priceStr.match(/^(\\D+)\\s*([\\d.,]+)$/);';
const endString = 'const symSize = Math.round(priceSize * 0.36);';

const startIndex = content.indexOf('const priceParts = priceStr.match(/^(\\D+)\\s*([\\d.,]+)$/);');
const endIndex = content.indexOf(endString, startIndex) + endString.length;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + drawPriceCardFix + content.substring(endIndex);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Price card collision fixed');
