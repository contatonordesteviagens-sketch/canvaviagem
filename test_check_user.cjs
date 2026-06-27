const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAzMjEyMywiZXhwIjoyMDg0NjA4MTIzfQ.t9R845W1P2m-V0V6Q8qHlDk1gWbFhB6Vp4vGfC31VEE";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  let output = "";
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) return console.log(error);
  
  const usersList = data.users || [];
  const latestUsers = usersList.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  
  for (const u of latestUsers) {
    output += `\nEmail: ${u.email} (ID: ${u.id})\n`;
    const { data: sub } = await supabase.from('subscriptions').select('*').eq('user_id', u.id).maybeSingle();
    output += "Subscription: " + JSON.stringify(sub) + "\n";
    const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', u.id).maybeSingle();
    output += "Profile: " + JSON.stringify(prof) + "\n";
    const { data: hotmart } = await supabase.from('hotmart_sales').select('*').eq('h_email', u.email).maybeSingle();
    output += "Hotmart Sale: " + JSON.stringify(hotmart) + "\n";
  }
  fs.writeFileSync('check.txt', output);
}

checkUser();
