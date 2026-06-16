const fs = require('fs');
const path = require('path');

const projectRoot = 'C:\\Users\\win 10\\Desktop\\CANVA E FABRICA - JUNHO 26';
const file = path.join(projectRoot, 'src', 'lib', 'fabrica-compose-art.ts');
let content = fs.readFileSync(file, 'utf8');

const targetStr = \        safeFillText(ctx, btnTxtV5, cx, btnYV5 + btnH / 2 + 1, btnW - 30, 16);
        ctx.textBaseline = "alphabetic";
      }\;

if (content.includes(targetStr)) {
  console.log("Found targetStr!");
} else {
  console.log("Not found targetStr!");
}
