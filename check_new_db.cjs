const { createClient } = require("@supabase/supabase-js");

const url = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const key = "sb_secret_WTEG07TbKdVHynh6Vnlylw_j7-hjl9V"; // from user screenshot

const supabase = createClient(url, key);

async function check() {
  const { data: profiles, error: pErr } = await supabase.from("profiles").select("email").limit(5);
  console.log("Profiles in new DB:", profiles ? profiles.length : 0, pErr ? pErr.message : "OK");

  const { data: sales, error: hErr } = await supabase.from("hotmart_sales").select("*").limit(5);
  console.log("Hotmart Sales table in new DB:", sales ? "Exists" : "Error", hErr ? hErr.message : "OK");
  
  const { data: subs, error: sErr } = await supabase.from("subscriptions").select("*").limit(5);
  console.log("Subscriptions in new DB:", subs ? subs.length : 0, sErr ? sErr.message : "OK");
}

check();
