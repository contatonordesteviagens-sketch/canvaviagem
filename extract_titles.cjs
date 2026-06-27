const fs = require('fs');
const content = fs.readFileSync('src/data/templates.ts', 'utf8');
const titles = [...content.matchAll(/"title"\s*:\s*"([^"]+)"/g)].map(m => m[1]);
fs.writeFileSync('titles.txt', titles.join('\n'));
