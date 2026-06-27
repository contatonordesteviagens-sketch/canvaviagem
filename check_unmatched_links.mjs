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
const templateTitles = [];

for (let block of blocks) {
  const titleMatch = block.match(/"?title"?\s*:\s*["']([^"']+)["']/);
  if (titleMatch) {
    templateTitles.push({ original: titleMatch[1], norm: normalize(titleMatch[1]) });
  }
}

let unmatched = [];

for (let link of linkMap) {
  const normTitle = normalize(link.title);
  
  let exactMatch = templateTitles.find(t => t.norm === normTitle);
  if (!exactMatch) {
    let partialMatch = templateTitles.find(t => t.norm.includes(normTitle) || normTitle.includes(t.norm));
    if (!partialMatch) {
      unmatched.push(link.title);
    }
  }
}

console.log(`Unmatched links (${unmatched.length}):`);
unmatched.forEach(t => console.log(t));
