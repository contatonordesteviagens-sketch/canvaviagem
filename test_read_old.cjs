import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const supabaseUrl = "https://mgdsjxasolxoclchyqdx.supabase.co";
const supabaseKey = "sb_publishable_3R_9-_PSHlsG1eYRnJItRw_54SK9DqJ";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOld() {
  const { data, error } = await supabase.from("profiles").select("*").limit(1);
  console.log("Can read profiles?", data ? "Yes" : "No", error ? error.message : "");
}

checkOld();
