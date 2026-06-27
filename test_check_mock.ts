import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const supabaseUrl = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Checking mock user in profiles...");
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", "arquivoslucashenrique+testebrabo@gmail.com");
  console.log("Profile:", profile);

  console.log("Checking mock user in subscriptions...");
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("product_id", "hotmart_elite");
  console.log("Subscriptions with hotmart_elite:", subs?.length);
  
  // Try to find the specific subscription by finding the user ID
  if (profile && profile.length > 0) {
    const { data: userSubs } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", profile[0].user_id);
    console.log("Mock user subscription:", userSubs);
  }
}

test();
