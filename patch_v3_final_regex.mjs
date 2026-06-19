import fs from 'fs';
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/ctx\.font = "900 28px Inter, Arial, sans-serif";\s*const customBanner/,
  'ctx.font = "900 26px Inter, Arial, sans-serif";\n          \n          const customBanner');

content = content.replace(/ctx\.font = "800 26px Inter, Arial, sans-serif";\s*const pixLabelW = ctx\.measureText\("pix"\)\.width;/,
  'ctx.font = "800 24px Inter, Arial, sans-serif";\n            const pixLabelW = ctx.measureText("pix").width;');

content = content.replace(/ctx\.font = "900 26px Inter, Arial, sans-serif";\s*ctx\.fillText\("pix",/,
  'ctx.font = "900 24px Inter, Arial, sans-serif";\n            ctx.fillText("pix",');

fs.writeFileSync(path, content, 'utf8');
console.log("Regex replacements applied for Pix.");
