import fs from 'fs';
import path from 'path';

const templatesPath = path.resolve('src/data/templates.ts');
let content = fs.readFileSync(templatesPath, 'utf8');

const blocks = content.split('}');
let totalVideos = 0;
let videosWithDesc = 0;

for (let block of blocks) {
  const titleMatch = block.match(/title\s*:\s*["']([^"']+)["']/);
  if (!titleMatch) continue;
  
  const typeMatch = block.match(/type\s*:\s*["']([^"']+)["']/);
  const type = typeMatch ? typeMatch[1] : '';
  
  if (type !== 'video' && type !== 'seasonal') continue;
  
  totalVideos++;
  if (block.includes('"description":')) {
    videosWithDesc++;
  }
}

console.log(`Total de vídeos no arquivo: ${totalVideos}`);
console.log(`Vídeos com legenda: ${videosWithDesc}`);
