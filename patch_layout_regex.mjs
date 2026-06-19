import fs from 'fs';
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/ctx\.font = "900 38px Inter, Arial, sans-serif";\s*const pacoteW = ctx\.measureText\(pacoteText\)\.width \+ 70;/, 
  'ctx.font = "900 32px Inter, Arial, sans-serif";\n        const pacoteW = ctx.measureText(pacoteText).width + 70;');

content = content.replace(/ctx\.font = "800 24px Inter, Arial, sans-serif";\s*ctx\.fillText\(topLabelRender, priceCenterX, ringY \+ 36\);/,
  'ctx.font = "800 28px Inter, Arial, sans-serif";\n        ctx.fillText(topLabelRender, priceCenterX, ringY + 32);');

content = content.replace(/ctx\.font = "800 22px Inter, Arial, sans-serif";\s*ctx\.fillText\(bottomSuffix \|\| "por pessoa", priceCenterX, ringY \+ 172\);/,
  'ctx.font = "800 26px Inter, Arial, sans-serif";\n        ctx.fillText(bottomSuffix || "por pessoa", priceCenterX, ringY + 140);');

content = content.replace(/ctx\.font = "900 24px Inter, Arial, sans-serif";\s*const customBanner/,
  'ctx.font = "900 28px Inter, Arial, sans-serif";\n          \n          const customBanner');

fs.writeFileSync(path, content, 'utf8');
console.log("Regex replacements applied.");
