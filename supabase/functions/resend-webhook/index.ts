import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RESEND-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseServiceKey) {
    logStep("ERROR: SUPABASE_SERVICE_ROLE_KEY not configured");
    return new Response(JSON.stringify({ error: "Configuration error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const payload = await req.json();
    logStep("Received webhook", { type: payload.type });

    // Estrutura do webhook Resend:
    // { type: "email.sent" | "email.delivered" | "email.opened" | "email.clicked" | "email.bounced" | "email.complained",
    //   data: { email_id: "...", to: ["email@..."], subject: "...", ... } }

    const eventType = payload.type?.replace("email.", "") || "unknown";
    const emailId = payload.data?.email_id;
    const recipientEmail = payload.data?.to?.[0];

    // Determinar email_type baseado no subject ou metadata
    let emailType = null;
    const subject = payload.data?.subject || "";
    if (subject.includes("Bem-vindo") || subject.includes("Tutorial")) {
      emailType = "email_1";
    } else if (subject.includes("próximo passo")) {
      emailType = "email_2";
    } else if (subject.includes("Última chance")) {
      emailType = "email_3";
    }

    const { error } = await supabase.from("email_events").insert({
      email_id: emailId,
      type: eventType,
      recipient_email: recipientEmail,
      email_type: emailType,
      metadata: payload.data || {},
    });

    if (error) {
      logStep("Database error", { error: error.message });
      throw error;
    }

    logStep("Event saved successfully", { eventType, emailId, recipientEmail });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
