const fs = require('fs');

const path = 'src/data/templates.ts';
let content = fs.readFileSync(path, 'utf8');

// The duplicate descriptions look like:
// , "description": "..." , "description": "..."
// We need to remove the second one. 
// Let's use a regex that matches two identical "description" keys separated by whitespace and commas, 
// or simply any duplicate keys in an object literal.
// Actually, since we appended them at the end, maybe we can just find any object that has multiple "description" keys.

// A safer way: since it's just ` , "description": "..." , "description": "..." }`,
// Let's replace the duplicate trailing descriptions.
// Let's just run a regex to find all "description": "..." and if there are multiple in one block, remove the duplicates.

const blocks = content.split('}');
for (let i = 0; i < blocks.length; i++) {
  let block = blocks[i];
  
  // Find all matches of "description": "..."
  const descRegex = /(,\s*"description"\s*:\s*".*?")/g;
  const matches = [...block.matchAll(descRegex)];
  
  if (matches.length > 1) {
    // Keep only the first one
    const firstMatch = matches[0][0];
    // Replace all with empty, then add back the first one at the end, or just replace the duplicates
    // But wait, the matches might have different values? No, the error says duplicate key.
    // Let's just remove all description matches from the block, and then append the first one back.
    let cleanBlock = block.replace(descRegex, '');
    blocks[i] = cleanBlock + firstMatch;
  }
}

let newContent = blocks.join('}');

// Also need to check if there are duplicate drive_url keys?
const blocks2 = newContent.split('}');
for (let i = 0; i < blocks2.length; i++) {
  let block = blocks2[i];
  const driveRegex = /(,\s*"drive_url"\s*:\s*".*?")/g;
  const matches = [...block.matchAll(driveRegex)];
  if (matches.length > 1) {
    const firstMatch = matches[0][0];
    let cleanBlock = block.replace(driveRegex, '');
    blocks2[i] = cleanBlock + firstMatch;
  }
}
newContent = blocks2.join('}');

fs.writeFileSync(path, newContent);
console.log('Fixed duplicate keys.');
