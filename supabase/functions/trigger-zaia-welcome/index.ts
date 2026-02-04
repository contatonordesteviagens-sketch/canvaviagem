import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, phone } = await req.json();

    if (!email || !phone) {
      return new Response(
        JSON.stringify({ error: "Email e telefone são obrigatórios para WhatsApp" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone format (10-11 digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return new Response(
        JSON.stringify({ error: "Telefone inválido. Use DDD + número (10-11 dígitos)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const webhookUrl = Deno.env.get("ZAIA_WEBHOOK_WELCOME");
    
    if (!webhookUrl) {
      console.error("[ZAIA-WELCOME] ZAIA_WEBHOOK_WELCOME not configured");
      return new Response(
        JSON.stringify({ error: "Serviço de WhatsApp não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userName = name?.trim() || email.split("@")[0];

    // Call Zaia webhook
    console.log("[ZAIA-WELCOME] Calling webhook for:", email);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        name: userName,
        phone: cleanPhone,
        timestamp: new Date().toISOString(),
      }),
    });

    const responseText = await response.text();
    console.log("[ZAIA-WELCOME] Webhook response:", response.status, responseText);

    // Save data to database for reference
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Save token for tracking (even though access will come via WhatsApp)
    await supabaseAdmin
      .from("magic_link_tokens")
      .insert({
        email: email.toLowerCase().trim(),
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        name: userName,
        phone: cleanPhone,
      });

    // Build WhatsApp URL
    const whatsappMessage = encodeURIComponent(
      `Olá, sou ${userName} e quero meu acesso ao Canva Viagem!`
    );
    const whatsappUrl = `https://wa.me/5585986411294?text=${whatsappMessage}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "WhatsApp acionado com sucesso",
        whatsappUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[ZAIA-WELCOME] Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
