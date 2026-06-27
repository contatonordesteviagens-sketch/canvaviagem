import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('content_items')
    .select('id, title, type')
    .in('type', ['video', 'seasonal']);

  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${data.length} videos`);
  data.slice(0, 5).forEach(v => console.log(v.title));
}

check();
