const { createClient } = require("@supabase/supabase-js");

// New DB (From .env)
const urlNew = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
// From .env
const keyNewAnon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQxMTE3MzEsImV4cCI6MjAyNTY4NzczMX0.xxxx"; 
// wait, I need to read .env for the real anon key
const fs = require("fs");
const envLines = fs.readFileSync(".env", "utf8").split(/\r?\n/);
let keyNewReal = "";
for (const line of envLines) {
  if (line.startsWith("VITE_SUPABASE_PUBLISHABLE_KEY=")) {
    keyNewReal = line.split("=")[1].replace(/"/g, "").trim();
  }
}

// Old DB (From supabase CLI config or just use the user's screenshot)
const urlOld = "https://mgdsjxasolxoclchyqdx.supabase.co";
const keyOldAnon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZHNqeGFzb2x4b2NsY2h5cWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMyNDY5ODMsImV4cCI6MjAyODgyMjk4M30.xxxx"; // Wait, user screenshot had `sb_publishable_3R_9-_PSHlsG1eYRnJItRw_54SK9DqJ`

async function check(url, key, name) {
  try {
    const supabase = createClient(url, key);
    const { data: profiles, error: pErr } = await supabase.from("profiles").select("email").limit(5);
    console.log(`[${name}] Profiles:`, profiles ? profiles.length : `Error: ${pErr.message}`);
  } catch (e) {
    console.log(`[${name}] Exception:`, e.message);
  }
}

check(urlNew, keyNewReal, "NEW (Lovable)");
check(urlOld, "sb_publishable_3R_9-_PSHlsG1eYRnJItRw_54SK9DqJ", "OLD (mgdsj...)");
