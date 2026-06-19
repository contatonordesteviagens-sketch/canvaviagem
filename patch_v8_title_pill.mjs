import fs from 'fs';
const file = 'src/lib/fabrica-compose-art.ts';
let code = fs.readFileSync(file, 'utf8');

// Title - Move up 2px
code = code.replace(
    'const titleStartY = pillY + pillH + Math.round(height * (isStoryV8Luxury ? 0.04 : 0.025)) + leadLineH / 2 - 2;',
    'const titleStartY = pillY + pillH + Math.round(height * (isStoryV8Luxury ? 0.04 : 0.025)) + leadLineH / 2 - 4;' // Moved 2px up
);

code = code.replace(
    'const destStartY = titleStartY + leadLines.length * leadLineH + Math.round(height * 0.012) + destLineH / 2;',
    'const destStartY = titleStartY + leadLines.length * leadLineH + Math.round(height * 0.012) + destLineH / 2 - 2;' // Moved 2px up
);

// Date pill - Move up 2px
code = code.replace(
    'const infoY = titleBottomY + Math.round(height * 0.026);',
    'const infoY = titleBottomY + Math.round(height * 0.026) - 2;' // Moved 2px up
);

fs.writeFileSync(file, code);
console.log('Patch applied successfully!');
