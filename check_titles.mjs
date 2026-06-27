import fs from 'fs';
import path from 'path';

// Let's connect to Supabase and fetch the actual titles to compare with localTemplates!
// Wait, I don't have the DB credentials directly, but I can read templates.ts and look at what could mismatch.
// Let's write a script that looks at templates.ts and checks if there are weird titles.
const templatesPath = path.resolve('src/data/templates.ts');
let content = fs.readFileSync(templatesPath, 'utf8');
const blocks = content.split('}');
let titles = [];
for (let block of blocks) {
  const titleMatch = block.match(/"?title"?\s*:\s*["']([^"']+)["']/);
  if (titleMatch) titles.push(titleMatch[1]);
}
console.log("Titles in localTemplates:", titles.join(', '));
