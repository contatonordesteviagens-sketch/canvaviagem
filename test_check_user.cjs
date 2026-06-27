const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAzMjEyMywiZXhwIjoyMDg0NjA4MTIzfQ.t9R845W1P2m-V0V6Q8qHlDk1gWbFhB6Vp4vGfC31VEE";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const email = "arquivoslucashenrique@gmail.com";
  const { data: profile } = await supabase.from('profiles').select('user_id').eq('email', email).single();
  if (profile) {
    const { data: sub } = await supabase.from('subscriptions').select('*').eq('user_id', profile.user_id);
    console.log("Subscriptions para", email, ":", sub);
  } else {
    console.log("Profile not found for", email);
  }
}
check();
