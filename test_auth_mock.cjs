const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Requesting OTP for mock user...");
  const { data, error } = await supabase.auth.signInWithOtp({
    email: "arquivoslucashenrique+testebrabo@gmail.com"
  });
  console.log("OTP Error:", error);
  console.log("OTP Data:", data);
}

test();
