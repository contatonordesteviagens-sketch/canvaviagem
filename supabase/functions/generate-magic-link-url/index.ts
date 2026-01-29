import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateLinkRequest {
  email: string;
  name?: string;
  phone?: string;
}

serve(async (req) => {
  console.log("[GENERATE-MAGIC-LINK-URL] Function started");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, phone }: GenerateLinkRequest = await req.json();
    console.log("[GENERATE-MAGIC-LINK-URL] Request received for email:", email?.substring(0, 3) + "***");

    // Validate email
    if (!email || !email.includes("@")) {
      console.log("[GENERATE-MAGIC-LINK-URL] Invalid email provided");
      return new Response(
        JSON.stringify({ error: "Email é obrigatório e deve ser válido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate unique token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    const cleanPhone = phone ? phone.replace(/\D/g, '') : null;

    console.log("[GENERATE-MAGIC-LINK-URL] Inserting token into database");

    const { error: insertError } = await supabaseAdmin
      .from("magic_link_tokens")
      .insert({
        email: email.toLowerCase().trim(),
        token,
        expires_at: expiresAt.toISOString(),
        name: name?.trim() || null,
        phone: cleanPhone,
      });

    if (insertError) {
      console.error("[GENERATE-MAGIC-LINK-URL] Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar link de acesso" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build magic link URL
    const baseUrl = Deno.env.get("SITE_URL") || "https://canvaviagem.lovable.app";
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    console.log("[GENERATE-MAGIC-LINK-URL] Magic link generated successfully");

    return new Response(
      JSON.stringify({ success: true, magicLink }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[GENERATE-MAGIC-LINK-URL] Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno ao processar solicitação" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
