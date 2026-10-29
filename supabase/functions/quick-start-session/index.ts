import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

/**
 * Entrada rápida da página inicial (/inicio → quiz).
 * E-mail NOVO: cria a conta e devolve a sessão na hora, sem esperar o clique no link.
 * E-mail que JÁ tem conta: não abre sessão nenhuma ({ existing: true }); a pessoa entra pelo link do e-mail.
 * O link de acesso e a captura para o e-mail marketing continuam com o send-magic-link, que o cliente
 * chama antes desta função. Exigimos esse link recente para herdar o limite de 3 pedidos a cada 15 min.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return json({ error: "Formato de email inválido" }, 400);
    }
    const normalizedEmail = email.toLowerCase().trim();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentLink } = await supabaseAdmin
      .from("magic_link_tokens")
      .select("id")
      .eq("email", normalizedEmail)
      .gte("created_at", fiveMinutesAgo)
      .limit(1)
      .maybeSingle();
    if (!recentLink) return json({ error: "Envie o e-mail de novo para continuar." }, 400);

    // Só cria se não existir. Conta existente = precisa confirmar pelo link.
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
      user_metadata: { quick_start: true },
    });
    if (createError) {
      const msg = createError.message || "";
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        return json({ success: true, existing: true });
      }
      console.error("[QUICK-START] Erro ao criar usuário:", createError);
      return json({ error: "Erro ao criar conta" }, 500);
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
    });
    const hashedToken = linkData?.properties?.hashed_token;
    if (linkError || !hashedToken) {
      console.error("[QUICK-START] Erro ao gerar link:", linkError);
      return json({ error: "Erro ao gerar sessão" }, 500);
    }

    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: hashedToken,
      type: "email",
    });
    if (sessionError || !sessionData.session) {
      console.error("[QUICK-START] Erro ao criar sessão:", sessionError);
      return json({ error: "Erro ao criar sessão" }, 500);
    }

    console.log("[QUICK-START] Conta nova criada e logada:", normalizedEmail.substring(0, 5) + "***");
    return json({
      success: true,
      existing: false,
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      },
    });
  } catch (error) {
    console.error("Error in quick-start-session:", error);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
