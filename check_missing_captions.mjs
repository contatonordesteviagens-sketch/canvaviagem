import fs from 'fs';
import path from 'path';

const templatesPath = path.resolve('src/data/templates.ts');
let content = fs.readFileSync(templatesPath, 'utf8');

const blocks = content.split('}');
let missingDesc = [];

for (let block of blocks) {
  const titleMatch = block.match(/"?title"?\s*:\s*["']([^"']+)["']/);
  if (!titleMatch) continue;
  
  const typeMatch = block.match(/"?type"?\s*:\s*["']([^"']+)["']/);
  const type = typeMatch ? typeMatch[1] : '';
  
  if (type !== 'video' && type !== 'seasonal') continue;
  
  const title = titleMatch[1];
  
  // Since description is added as `"description": "..."`
  const hasDesc = block.includes('"description":');
  
  if (!hasDesc) {
    missingDesc.push(title);
  }
}

console.log(`Encontrados ${missingDesc.length} vídeos sem legenda:`);
missingDesc.forEach(title => console.log(`- ${title}`));
