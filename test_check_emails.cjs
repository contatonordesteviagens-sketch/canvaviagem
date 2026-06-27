const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAzMjEyMywiZXhwIjoyMDg0NjA4MTIzfQ.t9R845W1P2m-V0V6Q8qHlDk1gWbFhB6Vp4vGfC31VEE";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmails() {
  const email = "arquivoslucashenrique@gmail.com";
  const { data: events } = await supabase
    .from('email_events')
    .select('*')
    .eq('recipient_email', email)
    .order('created_at', { ascending: false })
    .limit(10);
    
  console.log("Últimos eventos de email para", email, ":");
  console.log(JSON.stringify(events, null, 2));
}
checkEmails();
