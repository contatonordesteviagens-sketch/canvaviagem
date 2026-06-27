const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const envPath = path.join(__dirname, ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)="?(.*?)"?$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("URL:", url);

const supabase = createClient(url, key);

async function check() {
  const email = "arquivoslucashenrique@gmail.com";
  
  console.log("Checking for email:", email);
  
  const { data: profile, error: pErr } = await supabase.from("profiles").select("*").eq("email", email).maybeSingle();
  console.log("Profile:", profile, pErr);
  
  if (profile) {
    const { data: sub, error: sErr } = await supabase.from("subscriptions").select("*").eq("user_id", profile.user_id);
    console.log("Subscriptions:", sub, sErr);
  }
  
  const { data: sales, error: hErr } = await supabase.from("hotmart_sales").select("*").eq("h_email", email);
  console.log("Hotmart Sales:", sales, hErr);
  
  const { data: tokens, error: tErr } = await supabase.from("magic_link_tokens").select("*").eq("email", email).order('created_at', { ascending: false }).limit(2);
  console.log("Magic Link Tokens:", tokens, tErr);
}

check();
