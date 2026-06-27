import fs from 'fs';
import path from 'path';

const templatesPath = path.resolve('src/data/templates.ts');
let content = fs.readFileSync(templatesPath, 'utf8');

const blocks = content.split('}');
let missingDesc = [];
let count = 0;

for (let block of blocks) {
  const titleMatch = block.match(/"?title"?\s*:\s*["']([^"']+)["']/);
  if (!titleMatch) continue;
  
  const typeMatch = block.match(/"?type"?\s*:\s*["']([^"']+)["']/);
  const type = typeMatch ? typeMatch[1] : '';
  
  const title = titleMatch[1];
  
  // We'll check all templates, not just videos
  const hasDesc = block.includes('"description":');
  
  if (!hasDesc) {
    missingDesc.push({ title, type });
  }
  count++;
}

console.log(`Total de itens verificados: ${count}`);
console.log(`Encontrados ${missingDesc.length} itens sem legenda:`);
const byType = {};
missingDesc.forEach(item => {
  if (!byType[item.type]) byType[item.type] = [];
  byType[item.type].push(item.title);
});

for (const type in byType) {
  console.log(`\nTipo: ${type || 'Desconhecido'} (${byType[type].length})`);
  byType[type].forEach(t => console.log(`- ${t}`));
}
