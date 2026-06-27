import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesTsPath = path.join(__dirname, 'src', 'data', 'templates.ts');
const sqlOutputPath = path.join(__dirname, 'migracao_legendas.sql');

const templatesContent = fs.readFileSync(templatesTsPath, 'utf8');

const regex = /{[^}]*["']?title["']?\s*:\s*["']([^"']+)["'][^}]*}/g;
let match;
let sqlScript = `-- Migração de Legendas e Links do Drive\n-- Cole este script no SQL Editor do Supabase e clique em RUN\n\n`;
let count = 0;

while ((match = regex.exec(templatesContent)) !== null) {
  const objectStr = match[0];
  const title = match[1];
  
  let description = null;
  let driveUrl = null;
  
  const descMatch = objectStr.match(/["']?description["']?\s*:\s*["']((?:[^"\\]|\\.)*)["']/);
  if (descMatch) {
    // 1. Remove escaped quotes \"
    // 2. Replace escaped literal newlines \\n with actual newlines \n
    // 3. Escape single quotes ' to '' for SQL
    description = descMatch[1]
      .replace(/\\"/g, '"')
      .replace(/\\\\n/g, '\n') // se tiver \\n
      .replace(/\\n/g, '\n')   // se tiver \n
      .replace(/'/g, "''");
  }
  
  const driveMatch = objectStr.match(/["']?drive_url["']?\s*:\s*["']([^"']+)["']/);
  if (driveMatch) {
    driveUrl = driveMatch[1].replace(/'/g, "''");
  }
  
  if (description || driveUrl) {
    let updateFields = [];
    if (description) updateFields.push(`description = '${description}'`);
    if (driveUrl) updateFields.push(`drive_url = '${driveUrl}'`);
    
    sqlScript += `UPDATE public.content_items SET ${updateFields.join(', ')} WHERE title = '${title.replace(/'/g, "''")}';\n`;
    count++;
  }
}

fs.writeFileSync(sqlOutputPath, sqlScript);
console.log(`✅ Script SQL gerado com sucesso em ${sqlOutputPath} com ${count} atualizações.`);
