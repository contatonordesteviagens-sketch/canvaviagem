import fs from 'fs';

let orig = fs.readFileSync('v3_feed_original.ts', 'utf8');

// 1. Shrink padTop and padBottom to reduce empty space
orig = orig.replace('const padTop = 32;', 'const padTop = 24;');
orig = orig.replace('const padBottom = 48;', 'const padBottom = 32;');

// 2. Add highlight pill behind icons
orig = orig.replace(
  '        let iconX = cx - totalIconW / 2;\n        iconList.forEach(ic => {\n          drawIcon(ctx, ic, iconX, cursorY, iconSize);\n          iconX += iconSize + iconGap;\n        });',
  `        let iconX = cx - totalIconW / 2;
        
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        fillRoundRect(ctx, iconX - 20, cursorY - 14, totalIconW + 40, iconSize + 28, (iconSize + 28) / 2, "rgba(0,0,0,0.06)");
        ctx.restore();

        iconList.forEach(ic => {
          drawIcon(ctx, ic, iconX, cursorY, iconSize);
          iconX += iconSize + iconGap;
        });`
);

// 3. Shrink Pix Banner empty space and height
orig = orig.replace('const stripeH = 64;', 'const stripeH = 50;');
orig = orig.replace('simY += 24 + stripeH;', 'simY += 12 + stripeH;');
orig = orig.replace('const stripeY = cursorY + 24;', 'const stripeY = cursorY + 12;');

// The V3 Feed block in fabrica-compose-art.ts starts after `if (format === "story") { ... } else {`
const path = 'C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(path, 'utf8');

const lines = content.split(/\r?\n/);
let startIdx = -1;
let endIdx = -1;

for (let i = 1950; i < 2100; i++) {
  if (lines[i] && lines[i].includes('// [BG] Foto do destino cobrindo todo o canvas')) {
    startIdx = i;
    break;
  }
}

for (let i = startIdx; i < 2500; i++) {
  if (lines[i] && lines[i].includes('return canvas.toDataURL("image/png");')) {
    endIdx = i;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  // Strip trailing/leading newlines from orig
  const origLines = orig.split(/\r?\n/);
  // Re-insert into lines
  lines.splice(startIdx, endIdx - startIdx + 1, ...origLines);
  fs.writeFileSync(path, lines.join('\n'), 'utf8');
  console.log("V3 FEED successfully restored and patched!");
} else {
  console.log("Could not find V3 FEED block boundaries.");
}
