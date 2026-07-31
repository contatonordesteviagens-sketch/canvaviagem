const fs = require('fs');
const file = 'src/lib/fabrica-compose-art.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/secondaryColor \|\| \"#F59E0B\"/g, 'secondaryColor || \"#171717\"');
content = content.replace(/secondaryColor \|\| \"#FCD34D\"/g, 'secondaryColor || \"#171717\"');
fs.writeFileSync(file, content);
console.log('Done!');
