const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Counting profiles in Lovable DB...");
  const { data: profiles, error: err1 } = await supabase
    .from("profiles")
    .select("user_id");
  console.log("Profiles Count:", profiles?.length);

  const { data: subs, error: err2 } = await supabase
    .from("subscriptions")
    .select("id");
  console.log("Subscriptions Count:", subs?.length);
}

test();
