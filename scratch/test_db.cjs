import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // or ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: subs } = await supabase.from('subscriptions').select('product_id, status').limit(10);
  console.log("Subscriptions:", subs);
  
  const { data: sites } = await supabase.from('public_sites').select('id, owner_id, slug, html_url, is_active, custom_domain').limit(5);
  console.log("Sites:", sites);
}

check();
