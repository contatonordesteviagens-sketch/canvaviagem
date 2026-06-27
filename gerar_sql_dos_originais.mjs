import fs from 'fs';
import path from 'path';

const legendasDir = path.resolve('legendas');
const linksPath = path.resolve('legendas', 'final_links.txt');
const sqlOutputPath = path.resolve('migracao_legendas_limpa.sql');

// Ler final_links.txt
let linksContent = '';
try {
  linksContent = fs.readFileSync(linksPath, 'utf8');
} catch(e) {
  console.log("Nenhum final_links.txt encontrado");
}

const linkMap = {};
if (linksContent) {
  const lines = linksContent.split('\n');
  for (const line of lines) {
    if (line.includes(' - ')) {
      let [title, url] = line.split(' - ');
      title = title.trim();
      url = url.trim();
      if (title && url) {
        linkMap[title] = url;
      }
    }
  }
}

const sqlCommands = [];
sqlCommands.push("-- Migracao de Legendas e Links do Drive (Forcado no BD)");
sqlCommands.push("-- Cole este script no SQL Editor do Supabase e clique em RUN\n");

// Ler todos os .txt em legendas (ignorando final_links.txt)
const files = fs.readdirSync(legendasDir);
for (const file of files) {
  if (file.endsWith('.txt') && file !== 'final_links.txt') {
    const title = file.replace('.txt', '');
    const content = fs.readFileSync(path.join(legendasDir, file), 'utf8');
    
    // Tratamento basico da string para SQL
    const safeContent = content.trim().replace(/'/g, "''");
    let driveUrl = linkMap[title] || '';
    const safeDriveUrl = driveUrl.replace(/'/g, "''");

    let setClause = [];
    if (safeContent) setClause.push(`description = '${safeContent}'`);
    if (safeDriveUrl) setClause.push(`drive_url = '${safeDriveUrl}'`);

    if (setClause.length > 0) {
      sqlCommands.push(`UPDATE public.content_items SET ${setClause.join(', ')} WHERE title = '${title.replace(/'/g, "''")}';`);
    }
  }
}

fs.writeFileSync(sqlOutputPath, sqlCommands.join('\n'), 'utf8');
console.log(`Script SQL gerado a partir dos arquivos originais em: ${sqlOutputPath}`);
