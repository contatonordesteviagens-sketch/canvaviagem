const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEdgeFunction() {
  console.log("Calling get-hotmart-sales on zdjt...");
  const { data, error } = await supabase.functions.invoke("get-hotmart-sales");
  console.log("Data length:", data ? data.length : "null");
  if (error) {
      console.log("Error object:", error);
      console.log("Error message:", error.message);
      if (error.context) {
          const res = await error.context.text();
          console.log("Error context:", res);
      }
  }
  
  if (data && data.length > 0) {
      console.log("Sample Hotmart Sales:", data.slice(0, 2));
  }
}

testEdgeFunction();
