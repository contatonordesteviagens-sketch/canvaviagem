import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const supabaseUrl = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
// Real anon key from local .env
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEdgeFunction() {
  console.log("Calling get-hotmart-sales on zdjt...");
  const { data, error } = await supabase.functions.invoke("get-hotmart-sales");
  console.log("Data length:", data ? data.length : "null");
  if (error) console.log("Error:", error);
  
  if (data && data.length > 0) {
      console.log("Sample Hotmart Sales:", data.slice(0, 2));
  }
}

testEdgeFunction();
