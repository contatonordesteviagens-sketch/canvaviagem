import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncToSupabase() {
  console.log('Iniciando sincronização...');
  const templatesTsPath = path.join(__dirname, 'src', 'data', 'templates.ts');
  const templatesContent = fs.readFileSync(templatesTsPath, 'utf8');

  const regex = /{[^}]*["']?title["']?\s*:\s*["']([^"']+)["'][^}]*}/g;
  let match;
  let updates = [];

  while ((match = regex.exec(templatesContent)) !== null) {
    const objectStr = match[0];
    const title = match[1];
    
    let description = null;
    let driveUrl = null;
    
    const descMatch = objectStr.match(/["']?description["']?\s*:\s*["']((?:[^"\\]|\\.)*)["']/);
    if (descMatch) {
      description = descMatch[1]
        .replace(/\\"/g, '"')
        .replace(/\\\\n/g, '\n')
        .replace(/\\n/g, '\n');
    }
    
    const driveMatch = objectStr.match(/["']?drive_url["']?\s*:\s*["']([^"']+)["']/);
    if (driveMatch) {
      driveUrl = driveMatch[1];
    }
    
    if (description || driveUrl) {
      updates.push({ title, description, driveUrl });
    }
  }

  console.log(`Encontrados ${updates.length} itens para atualizar.`);
  
  let successCount = 0;
  for (const item of updates) {
    const updateObj = {};
    if (item.description) updateObj.description = item.description;
    if (item.driveUrl) updateObj.drive_url = item.driveUrl;

    const { error } = await supabase
      .from('content_items')
      .update(updateObj)
      .eq('title', item.title);
      
    if (error) {
      console.error(`Erro ao atualizar ${item.title}:`, error);
    } else {
      successCount++;
    }
  }
  
  console.log(`Concluído! ${successCount} atualizados com sucesso.`);
}

syncToSupabase();
