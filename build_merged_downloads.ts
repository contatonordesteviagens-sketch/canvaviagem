import fs from 'fs';
import path from 'path';
import { templates, feedTemplates, storyTemplates, weeklyStories } from './src/data/templates';

const linksPath = path.resolve('legendas', 'final_links.txt');
const outputPath = path.resolve('src/data/downloads.ts');

const content = fs.readFileSync(linksPath, 'utf8');
const lines = content.split('\n');

const rawDownloads: any[] = [];
let currentCategory = 'internacionais';
let currentTitle: string | null = null;

const normalizeName = (str: string) => {
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

// Add Paris and Africa fallbacks
rawDownloads.push({
  title: 'Paris',
  url: 'https://drive.google.com/drive/folders/10LWKcjLVA6L1FLkzRGDpDmCkKlTHoNOu',
  category: 'internacionais'
});

rawDownloads.push({
  title: 'África',
  url: 'https://drive.google.com/drive/folders/10LWKcjLVA6L1FLkzRGDpDmCkKlTHoNOu',
  category: 'internacionais'
});

// Merge with templates
const allTemplates = [...templates, ...feedTemplates, ...storyTemplates, ...weeklyStories];

for (const t of allTemplates) {
  if (t.drive_url) {
    let cat = 'extras';
    if (t.category === 'nacional' || t.category === 'nacionais') cat = 'nacionais';
    if (t.category === 'internacional' || t.category === 'internacionais') cat = 'internacionais';
    
    rawDownloads.push({
      title: normalizeName(t.title),
      url: t.drive_url,
      category: cat
    });
  }
}

// Filter duplicates by URL and resolve names
const uniqueDownloads = new Map<string, any>();

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
  item.title = item.title.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
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
