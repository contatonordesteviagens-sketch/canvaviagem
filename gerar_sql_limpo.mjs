import fs from 'fs';
import path from 'path';

const templatesTsPath = path.resolve('src/data/templates.ts');
const sqlOutputPath = path.resolve('migracao_legendas_limpa.sql');

const content = fs.readFileSync(templatesTsPath, 'utf8');

// Avaliar o arquivo TS para pegar a array templates
// Como tem exports e imports no arquivo original, a forma mais segura  usar regex ou extrair o array.
// Para ser 100% robusto, vou extrair via regex todas as ocorrncias de title, description e drive_url
const regex = /{[^{}]*title\s*:\s*["']([^"']+)["'][^{}]*}/g;
let match;
const items = [];

// Vamos usar eval depois de limpar o arquivo ts para um formato JS vlido
let rawData = content.substring(content.indexOf('export const templates = [') + 26, content.lastIndexOf('];'));
rawData = '[' + rawData + ']';

// Pra no lidar com erros de sintaxe no eval devido a tipos ou variveis faltando,
// vou extrair title, description e drive_url na raa com Regex.
const sqlCommands = [];
sqlCommands.push("-- Migracao de Legendas e Links do Drive (Forcado no BD)");
sqlCommands.push("-- Cole este script no SQL Editor do Supabase e clique em RUN\n");

// Extrair cada bloco de template { ... }
const blockRegex = /\{[\s\S]*?\}/g;
let blocks = content.match(blockRegex);

const seenTitles = new Set();

if (blocks) {
  for (const block of blocks) {
    const titleMatch = block.match(/title\s*:\s*["']([^"']+)["']/);
    if (!titleMatch) continue;
    const title = titleMatch[1];
    
    if (seenTitles.has(title)) continue; // evitar duplicados
    seenTitles.add(title);

    let description = '';
    const descMatch = block.match(/"description"\s*:\s*"([\s\S]*?)"(?=\s*[,}])/);
    if (descMatch) {
      description = descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }

    let driveUrl = '';
    const driveMatch = block.match(/"drive_url"\s*:\s*"([^"]+)"/);
    if (driveMatch) {
      driveUrl = driveMatch[1];
    }

    if (description || driveUrl) {
      let setClause = [];
      if (description) setClause.push(`description = '${description.replace(/'/g, "''")}'`);
      if (driveUrl) setClause.push(`drive_url = '${driveUrl.replace(/'/g, "''")}'`);

      if (setClause.length > 0) {
        sqlCommands.push(`UPDATE public.content_items SET ${setClause.join(', ')} WHERE title = '${title.replace(/'/g, "''")}';`);
      }
    }
  }
}

fs.writeFileSync(sqlOutputPath, sqlCommands.join('\n'), 'utf8');
console.log(`Script SQL gerado com sucesso em: ${sqlOutputPath}`);
