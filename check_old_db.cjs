const { createClient } = require("@supabase/supabase-js");

const url = "https://mgdsjxasolxoclchyqdx.supabase.co";
const key = "sb_secret_REMOVED_FOR_SECURITY"; 

const supabase = createClient(url, key);

async function check() {
  console.log("Checking OLD database (mgdsjxasolxoclchyqdx)...");

  const { data: profiles, error: pErr } = await supabase.from("profiles").select("*");
  console.log("Profiles count:", profiles ? profiles.length : 0, pErr ? pErr.message : "");

  const { data: subs, error: sErr } = await supabase.from("subscriptions").select("*");
  console.log("Subscriptions count:", subs ? subs.length : 0, sErr ? sErr.message : "");
  
  if (subs && subs.length > 0) {
      // Find the most recent subscription
      const recent = subs.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
      console.log("Most recent subscription updated_at:", recent.updated_at);
      console.log("Most recent subscription product_id:", recent.product_id);
  }
}

check();
