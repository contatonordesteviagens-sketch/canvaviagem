import fs from 'fs';
import path from 'path';

const templatesPath = path.resolve('src/data/templates.ts');
const linksPath = path.resolve('legendas', 'final_links.txt');

const linksContent = fs.readFileSync(linksPath, 'utf8');
const lines = linksContent.split('\n');

const linkMap = [];
let currentTitle = null;

for (let line of lines) {
  line = line.trim();
  if (!line) continue;
  
  if (line.startsWith('http')) {
    if (currentTitle) {
      linkMap.push({ title: currentTitle, url: line });
      currentTitle = null;
    }
  } else {
    currentTitle = line;
  }
}

// Normalize strings for matching
const normalize = (str) => {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/base/g, '')
    .replace(/rells/g, '')
    .replace(/reels/g, '')
    .replace(/video/g, '')
    .replace(/[-:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

let content = fs.readFileSync(templatesPath, 'utf8');
const blocks = content.split('}');

let matchCount = 0;

for (let i = 0; i < blocks.length; i++) {
  let block = blocks[i];
  const titleMatch = block.match(/"?title"?\s*:\s*["']([^"']+)["']/);
  if (!titleMatch) continue;
  
  const originalTitle = titleMatch[1];
  const normTitle = normalize(originalTitle);
  
  // Clean old drive_url if any exists to replace cleanly
  block = block.replace(/,\s*"drive_url"\s*:\s*"[^"]*"/g, '');
  
  // Find matching link
  let matchedUrl = null;
  
  // Direct normal match
  let exactMatch = linkMap.find(item => normalize(item.title) === normTitle);
  if (exactMatch) {
    matchedUrl = exactMatch.url;
  } else {
    // Partial match
    let partialMatch = linkMap.find(item => {
      let nT = normalize(item.title);
      return nT.includes(normTitle) || normTitle.includes(nT);
    });
    if (partialMatch) {
      matchedUrl = partialMatch.url;
    }
  }
  
  if (matchedUrl) {
    matchCount++;
    block += `, "drive_url": ${JSON.stringify(matchedUrl)}`;
  }
  
  blocks[i] = block;
}

fs.writeFileSync(templatesPath, blocks.join('}'), 'utf8');
console.log(`Matched ${matchCount} out of ${linkMap.length} links!`);
