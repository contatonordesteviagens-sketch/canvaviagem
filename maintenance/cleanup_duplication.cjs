const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/fabrica-compose-art.ts');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Keep everything from the start until the SECOND "interface ComposeTravelAdOptions"
let secondInterfaceStart = -1;
let interfaceCount = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('interface ComposeTravelAdOptions')) {
    interfaceCount++;
    if (interfaceCount === 2) {
      secondInterfaceStart = i;
      break;
    }
  }
}

if (secondInterfaceStart !== -1) {
  // Truncate before the second interface definition
  // But wait, the second interface might be part of the second block which is the one we WANT to keep if it has the fixes?
  // No, the first block also has the fixes if I applied them earlier.
  
  // Let's just keep the first 1421 lines (helpers) and the first composeTravelAd.
  // Actually, I'll just truncate at line 1421 and see what happens.
}

// SIMPLER: The file has two identical blocks.
const content = fs.readFileSync(filePath, 'utf8');
const searchStr = 'export async function composeTravelAd';
const parts = content.split(searchStr);

if (parts.length > 2) {
    // Keep Part 0 and Part 1
    const cleanContent = parts[0] + searchStr + parts[1];
    fs.writeFileSync(filePath, cleanContent, 'utf8');
    console.log('File truncated at second composeTravelAd');
} else {
    console.log('No duplication of composeTravelAd found');
}
