import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'wesley.wvx@gmail.com', // Let's pretend we don't have password, so this won't work.
    password: 'dummy'
  });
  
  // Try querying profiles directly as anon
  const { data, error } = await supabase.from('profiles').select('email, created_at').limit(5);
  console.log("Profiles Anon:", data, error);
}

test();
