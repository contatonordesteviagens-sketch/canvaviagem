import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

const oldLogic = `      const unifiedY = contentY;
      const unifiedH = Math.min(
        Math.round(height * (isStoryV8Luxury ? 0.275 : 0.35)),
        Math.max(180, ctaY - unifiedY - Math.round(height * 0.035))
      );`;

const newLogic = `      // Determine unifiedH first
      const unifiedH = Math.min(
        Math.round(height * (isStoryV8Luxury ? 0.23 : 0.35)), // Make it slightly thinner in story
        Math.max(180, Math.round(height * 0.35))
      );

      // Anchor boxes to the bottom, just above the CTA, to free the middle of the photo!
      const desiredUnifiedY = ctaY - unifiedH - Math.round(height * (isStoryV8Luxury ? 0.05 : 0.035));
      const unifiedY = Math.max(contentY, desiredUnifiedY);`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync(file, code);
console.log('Layout anchored to bottom successfully!');
