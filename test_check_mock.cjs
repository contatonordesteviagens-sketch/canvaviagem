const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Checking mock user in hotmart_sales...");
  const { data: sales, error: err } = await supabase
    .from("hotmart_sales")
    .select("*")
    .eq("h_email", "arquivoslucashenrique+testebrabo@gmail.com");
  console.log("Sales Error:", err);
  console.log("Sales:", sales);
}

test();
