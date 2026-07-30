import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { assertOfficialSupabaseProject } from "../_shared/officialProjectGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// This endpoint powered an abandoned embedded checkout with a stale product
// and a caller-controlled return URL. The canonical flow is create-checkout.
serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    assertOfficialSupabaseProject("create-subscription");
  } catch {
    return new Response(JSON.stringify({ error: "Service configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      error: "Este checkout foi substituido. Use o fluxo de assinatura atual.",
      checkout_function: "create-checkout",
    }),
    {
      status: 410,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
