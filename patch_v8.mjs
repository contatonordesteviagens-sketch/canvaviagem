import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

// Fix 1: Remove checkmark and center DEZEMBRO pill
code = code.replace(
  /ctx\.fillStyle = onGold;\s*drawMonoIcon\(ctx, "check".*?safeFillText\(ctx, infoText, width \/ 2 \+ infoH \* 0\.15, infoY \+ infoH \/ 2 \+ 1, infoW - infoH \* 1\.5, 12\);/s,
  `ctx.fillStyle = onGold;\n        safeFillText(ctx, infoText, width / 2, infoY + infoH / 2 + 1, infoW - 32, 12);`
);

// Fix 2: Unify box heights and overlap
// We need to inject the unified height logic.
const unifiedLogic = `      const priceBoxX = pad;
      const minContentGap = Math.round(height * 0.03);
      const contentY = Math.max(
        Math.round(height * (isStoryV8Luxury ? 0.455 : 0.425)),
        Math.round(infoY + (periodText ? Math.round(width * (isStoryV8Luxury ? 0.064 : 0.054)) : 0) + minContentGap)
      );
      
      const ctaH = Math.round(width * (isStoryV8Luxury ? 0.074 : 0.062));
      const brandSafeTop = isStoryV8Luxury ? height - 270 : height - 155;
      const ctaY = Math.min(
        Math.round(height * (isStoryV8Luxury ? 0.775 : 0.735)),
        brandSafeTop - ctaH - Math.round(height * 0.026)
      );
      
      const unifiedY = contentY;
      const unifiedH = Math.min(
        Math.round(height * (isStoryV8Luxury ? 0.275 : 0.35)),
        Math.max(180, ctaY - unifiedY - Math.round(height * 0.035))
      );

      const priceBoxY = unifiedY;
      const priceBoxW = Math.round(width * (isStoryV8Luxury ? 0.50 : 0.43));
      const priceBoxH = unifiedH;`;

code = code.replace(
  /const priceBoxX = pad;.*?const priceBoxH = Math\.round\(height \* \(isStoryV8Luxury \? 0\.165 : 0\.235\)\);/s,
  unifiedLogic
);

// Fix 3: Set cardY, cardH, and cardX to overlap
code = code.replace(
  /const cardW = Math\.round\(width \* \(isStoryV8Luxury \? 0\.38 : 0\.30\)\);\s*const cardX = width - pad - cardW;\s*const cardY = contentY - Math\.round\(height \* \(isStoryV8Luxury \? 0\.01 : 0\.005\)\);\s*const ctaH = Math\.round\(width \* \(isStoryV8Luxury \? 0\.074 : 0\.062\)\);\s*const brandSafeTop = isStoryV8Luxury \? height - 270 : height - 155;\s*const ctaY = Math\.min\([\s\S]*?Math\.round\(height \* 0\.035\)\)\s*\);/s,
  `const cardW = Math.round(width * (isStoryV8Luxury ? 0.38 : 0.30));\n      const cardX = priceBoxX + priceBoxW - 20; // OVERLAP\n      const cardY = unifiedY;\n      const cardH = unifiedH;`
);

// Fix 4: Arrow in CTA -> to →
code = code.replace(
  /const ctaTextFinal = \`\$\{ctaText\} ->\`;/g,
  `const ctaTextFinal = \`\$\{ctaText\} →\`;`
);

// Fix 5: Ensure price is centered vertically in the taller black box
// We want priceLabel, priceText, and suffixText to scale well in the new priceBoxH.
// priceBoxH * 0.22, 0.64, 0.82 are still used, they will spread out naturally.
// But we should verify if we need to adjust them slightly. 0.22 and 0.82 are fine.
// Wait, 0.64 might be a bit too high or low. Let's make it 0.58 so it's centered!
code = code.replace(
  /const priceBaseY = priceBoxY \+ Math\.round\(priceBoxH \* 0\.64\);/g,
  `const priceBaseY = priceBoxY + Math.round(priceBoxH * 0.58);`
);


fs.writeFileSync(file, code);
console.log('V8 Patched successfully!');
