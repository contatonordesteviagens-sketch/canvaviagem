import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
  const { data, error } = await supabase
    .from('content_items')
    .select('title, description')
    .limit(5);
    
  if (error) {
    console.error("Erro:", error);
  } else {
    console.log("5 vídeos do banco de dados:");
    console.log(data);
  }
}

checkDB();
