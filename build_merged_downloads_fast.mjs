import fs from 'fs';
import path from 'path';

const linksPath = path.resolve('legendas', 'final_links.txt');
const templatesPath = path.resolve('src/data/templates.ts');
const outputPath = path.resolve('src/data/downloads.ts');

const content = fs.readFileSync(linksPath, 'utf8');
const lines = content.split('\n');

const rawDownloads = [];
let currentCategory = 'internacionais';
let currentTitle = null;

const normalizeName = (str) => {
  return str
    .replace(/^(BASE\s+RELLS\s+|base\s+reels\s+|BASE\s+REELS\s+)/i, '')
    .replace(/^(Eva|Mel|Bia)\s*-\s*/i, '') // Remove influencer prefixes
    .replace(/\s*-\s*REELS\s*$/i, '')
    .replace(/:\s*$/, '') // remove trailing colon
    .replace(/\(\d+\)$/, '') // remove (1), (2), etc
    .replace(/\s+\d+$/, '') // remove trailing standalone numbers like " 1", " 2"
    .trim();
};

for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trim();
  if (!line) continue;
  
  if (line.toLowerCase().startsWith('internacionais')) {
    currentCategory = 'internacionais';
    continue;
  } else if (line.toLowerCase().startsWith('nacionais')) {
    currentCategory = 'nacionais';
    continue;
  } else if (line.toLowerCase().startsWith('extras')) {
    currentCategory = 'extras';
    continue;
  } else if (line.startsWith('===')) {
    continue;
  }
  
  if (line.startsWith('http')) {
    if (currentTitle) {
      rawDownloads.push({
        title: normalizeName(currentTitle),
        url: line,
        category: currentCategory
      });
      currentTitle = null;
    }
  } else {
    currentTitle = line;
  }
}

// Read templates.ts and extract all drive_url
const templatesCode = fs.readFileSync(templatesPath, 'utf8');

// Match simple objects that have title and drive_url
const titleRegex = /"title":\s*"([^"]+)"/g;
const driveUrlRegex = /"drive_url":\s*"([^"]+)"/g;

// A simple approach: split by "title": and look ahead for drive_url
const blocks = templatesCode.split(/"title":\s*/);
blocks.shift(); // remove everything before first title

for (const block of blocks) {
  const matchTitle = /^"([^"]+)"/.exec(block);
  if (!matchTitle) continue;
  
  const title = matchTitle[1];
  
  const matchDriveUrl = /"drive_url":\s*"([^"]+)"/.exec(block);
  if (!matchDriveUrl) continue;
  
  const drive_url = matchDriveUrl[1];
  
  // Try to determine category roughly
  let cat = 'extras';
  if (block.includes('"category": "nacional"')) cat = 'nacionais';
  if (block.includes('"category": "internacional"')) cat = 'internacionais';

  rawDownloads.push({
    title: normalizeName(title),
    url: drive_url,
    category: cat
  });
}

// Filter duplicates by URL and resolve names
const uniqueDownloads = new Map();

for (const item of rawDownloads) {
  const url = item.url.trim();
  if (!uniqueDownloads.has(url)) {
    uniqueDownloads.set(url, item);
  } else {
    // If we already have it, maybe prefer the shorter name?
    const existing = uniqueDownloads.get(url);
    if (item.title.length < existing.title.length && item.title.length > 2) {
       uniqueDownloads.set(url, item);
    }
  }
}

const finalDownloads = Array.from(uniqueDownloads.values());

// Capitalize first letters just to be clean
finalDownloads.forEach(item => {
  item.title = item.title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
});

// Sort
finalDownloads.sort((a, b) => a.title.localeCompare(b.title));

const tsContent = `export interface DownloadItem {
  title: string;
  url: string;
  category: 'nacionais' | 'internacionais' | 'extras';
}

export const downloadLinks: DownloadItem[] = ${JSON.stringify(finalDownloads, null, 2)};
`;

fs.writeFileSync(outputPath, tsContent, 'utf8');
console.log(`Generated ${finalDownloads.length} unique links into src/data/downloads.ts`);
