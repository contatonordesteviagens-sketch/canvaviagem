const fs = require('fs');
const path = require('path');

const templatesPath = path.join(__dirname, '..', 'src', 'data', 'templates.ts');
const downloadsPath = path.join(__dirname, '..', 'src', 'data', 'downloads.ts');

const templatesContent = fs.readFileSync(templatesPath, 'utf8');
const lines = templatesContent.split('\n');

let allLinks = [];
let currentTitle = '';
let currentUrl = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('title:')) {
    const match = line.match(/title:\s*["']([^"']+)["']/);
    if (match) currentTitle = match[1];
  } else if (line.includes('"title":')) {
    const match = line.match(/"title":\s*["']([^"']+)["']/);
    if (match) currentTitle = match[1];
  }
  
  if (line.includes('drive_url:')) {
    const match = line.match(/drive_url:\s*["']([^"']+)["']/);
    if (match) {
        allLinks.push({ title: currentTitle, url: match[1], category: 'extras' });
    }
  } else if (line.includes('"drive_url":')) {
    const match = line.match(/"drive_url":\s*["']([^"']+)["']/);
    if (match) {
        allLinks.push({ title: currentTitle, url: match[1], category: 'extras' });
    }
  }
}

console.log('Total found:', allLinks.length);

const uniqueLinks = [];
const seenUrls = new Set();
for (const link of allLinks) {
  if (!seenUrls.has(link.url) && link.title) {
    seenUrls.add(link.url);
    uniqueLinks.push(link);
  }
}

console.log('Unique found:', uniqueLinks.length);

const downloadsCode = "export interface DownloadItem {\n  title: string;\n  url: string;\n  category: 'nacionais' | 'internacionais' | 'extras';\n}\n\nexport const downloadLinks: DownloadItem[] = " + JSON.stringify(uniqueLinks, null, 2) + ";\n";

fs.writeFileSync(downloadsPath, downloadsCode, 'utf8');
console.log('Updated downloads.ts');
