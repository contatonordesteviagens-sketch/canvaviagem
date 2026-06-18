import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

const oldGradient = `      const overlay = ctx.createLinearGradient(0, 0, 0, height);
      overlay.addColorStop(0, "rgba(0,0,0,0.66)");
      overlay.addColorStop(isStoryV8Luxury ? 0.34 : 0.28, "rgba(0,0,0,0.34)");
      overlay.addColorStop(0.58, "rgba(0,0,0,0.08)");
      overlay.addColorStop(1, "rgba(0,0,0,0.60)");`;

const newGradient = `      const overlay = ctx.createLinearGradient(0, 0, 0, height);
      overlay.addColorStop(0, "rgba(0,0,0,0.70)");
      overlay.addColorStop(isStoryV8Luxury ? 0.25 : 0.28, "rgba(0,0,0,0.45)");
      overlay.addColorStop(0.45, "rgba(0,0,0,0.0)");
      overlay.addColorStop(0.65, "rgba(0,0,0,0.0)");
      overlay.addColorStop(0.85, "rgba(0,0,0,0.60)");
      overlay.addColorStop(1, "rgba(0,0,0,0.85)");`;

code = code.replace(oldGradient, newGradient);
fs.writeFileSync(file, code);
console.log('Gradient patched successfully!');
