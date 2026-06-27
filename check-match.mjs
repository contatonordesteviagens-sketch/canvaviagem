import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const fileContent = fs.readFileSync('src/data/downloads.ts', 'utf-8');
const match = fileContent.match(/export const downloadLinks: DownloadItem\[\] = (\[[\s\S]*?\]);/);
let downloadLinks = [];
if (match) {
  downloadLinks = eval(match[1]);
}

async function check() {
  const { data, error } = await supabase
    .from('content_items')
    .select('id, title, type')
    .in('type', ['video', 'seasonal']);

  if (error) {
    console.error(error);
    return;
  }
  
  let matches = 0;
  for (const v of data) {
    const link = downloadLinks.find(l => l.title.toLowerCase().trim() === v.title.toLowerCase().trim() || l.title.toLowerCase().includes(v.title.toLowerCase()) || v.title.toLowerCase().includes(l.title.toLowerCase()));
    if (link) matches++;
    else console.log("NO MATCH:", v.title);
  }
  console.log(`Matched ${matches} out of ${data.length} videos`);
}

check();
