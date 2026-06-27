import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const env = config({ path: "./.env", export: true });
const url = env.VITE_SUPABASE_URL || Deno.env.get("VITE_SUPABASE_URL");
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");

const supabase = createClient(url, key);

async function check() {
  const email = "arquivoslucashenrique@gmail.com"; // User's email
  
  console.log("Checking for email:", email);
  
  // Get user profile
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
