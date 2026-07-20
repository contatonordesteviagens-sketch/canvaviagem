const fs = require('fs');

const tempContent = fs.readFileSync('src/data/templates.ts', 'utf8');
const downContent = fs.readFileSync('src/data/downloads.ts', 'utf8');

const driveMatches = [];
const regex = /"title":\s*"([^"]+)"[\s\S]*?"drive_url":\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(tempContent)) !== null) {
  driveMatches.push({ title: match[1], url: match[2] });
}

console.log('Total drive_url in templates.ts:', driveMatches.length);

let missing = 0;
const missingItems = [];
for (const item of driveMatches) {
  if (!downContent.includes(item.url)) {
    missing++;
    missingItems.push(item);
  }
}

console.log('Missing from downloads.ts:', missing);
if (missing > 0) {
  console.log('Sample missing items:', missingItems.slice(0, 10));
}
