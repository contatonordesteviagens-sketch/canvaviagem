import fs from 'fs';
import path from 'path';

const linksPath = path.resolve('legendas', 'final_links.txt');
const outputPath = path.resolve('src/data/downloads.ts');

const content = fs.readFileSync(linksPath, 'utf8');
const lines = content.split('\n');

const downloads = [];
let currentCategory = 'internacionais';
let currentTitle = null;

const normalizeName = (str) => {
  return str
    .replace(/^BASE\s+RELLS\s+/i, '')
    .replace(/^base\s+reels\s+/i, '')
    .replace(/^BASE\s+REELS\s+/i, '')
    .replace(/\s*-\s*REELS\s*$/i, '')
    .replace(/:\s*$/, '') // remove trailing colon
    .replace(/\(1\)$/, '') // remove (1)
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
      downloads.push({
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

// Add Paris and Africa as requested by the user, with fallback URLs, so they appear in the list.
downloads.push({
  title: 'Paris',
  url: 'https://drive.google.com/drive/folders/10LWKcjLVA6L1FLkzRGDpDmCkKlTHoNOu', // International fallback
  category: 'internacionais'
});

downloads.push({
  title: 'África',
  url: 'https://drive.google.com/drive/folders/10LWKcjLVA6L1FLkzRGDpDmCkKlTHoNOu', // International fallback
  category: 'internacionais'
});

// Sort downloads alphabetically by title within their categories
downloads.sort((a, b) => a.title.localeCompare(b.title));

const tsContent = `export interface DownloadItem {
  title: string;
  url: string;
  category: 'nacionais' | 'internacionais' | 'extras';
}

export const downloadLinks: DownloadItem[] = ${JSON.stringify(downloads, null, 2)};
`;

fs.writeFileSync(outputPath, tsContent, 'utf8');
console.log(`Generated ${downloads.length} links into src/data/downloads.ts`);
