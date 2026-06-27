import fs from 'fs';
import path from 'path';

const templatesPath = path.resolve('src/data/templates.ts');
const legendasDir = path.resolve('legendas');
const linksPath = path.resolve('legendas', 'final_links.txt');

// 1. Ler os links
const linksContent = fs.readFileSync(linksPath, 'utf8');
const linkMap = {};
for (const line of linksContent.split('\n')) {
  if (line.includes(' - ')) {
    let [title, url] = line.split(' - ');
    linkMap[title.trim()] = url.trim();
  }
}

// 2. Ler as legendas (ignorando final_links.txt)
const descMap = {};
const files = fs.readdirSync(legendasDir);
for (const file of files) {
  if (file.endsWith('.txt') && file !== 'final_links.txt') {
    const title = file.replace('.txt', '');
    const content = fs.readFileSync(path.join(legendasDir, file), 'utf8');
    descMap[title] = content.trim();
  }
}

// 3. Atualizar templates.ts
let content = fs.readFileSync(templatesPath, 'utf8');

// The best way to update without eval is to use regex or string replace.
// Since we want to fix the existing 'description': "..." and 'drive_url': "..." we can search for the title and then replace the description.
// Wait, replacing via regex on a TS file can be tricky if there are newlines in the description.
// Actually, earlier I added descriptions with weird characters. 
// Let's remove ALL existing `description` and `drive_url` from the objects first to clean them up,
// then append the correct ones.

// First, clean up existing 'description' and 'drive_url' keys from the templates string
const cleanDesc = /(,\s*"description"\s*:\s*".*?")/gs;
const cleanDrive = /(,\s*"drive_url"\s*:\s*".*?")/gs;

let blocks = content.split('}');
for (let i = 0; i < blocks.length; i++) {
  let block = blocks[i];
  const titleMatch = block.match(/title\s*:\s*["']([^"']+)["']/);
  if (!titleMatch) continue;
  
  const title = titleMatch[1];
  
  // Clean existing broken descriptions
  // Wait, my previous regex /.*?(?=")/gs might be too greedy.
  // The descriptions added earlier were at the end of the object, before the closing brace.
  // Because I split by '}', the block is everything INSIDE the object.
  // Let's remove the broken keys.
  block = block.replace(/,\s*"description"\s*:\s*"[^"]*"/g, '');
  block = block.replace(/,\s*"drive_url"\s*:\s*"[^"]*"/g, '');
  
  // Now add the correct ones
  let extra = '';
  if (descMap[title]) {
    // stringify to escape quotes and newlines
    extra += `, "description": ${JSON.stringify(descMap[title])}`;
  }
  if (linkMap[title]) {
    extra += `, "drive_url": ${JSON.stringify(linkMap[title])}`;
  }
  
  blocks[i] = block + extra;
}

const newContent = blocks.join('}');
fs.writeFileSync(templatesPath, newContent, 'utf8');
console.log("templates.ts atualizado com sucesso e limpo de caracteres estranhos.");
