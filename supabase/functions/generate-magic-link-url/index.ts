import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// SEGURANÇA (17/11/2026): esta função devolvia o link de acesso na resposta para
// QUALQUER e-mail, sem login. Quem chamasse com o e-mail de um cliente (ou do admin)
// entrava na conta dele. Agora ela só repassa para send-magic-link, que manda o link
// para a caixa de e-mail do dono (com limite de 3 pedidos a cada 15 minutos).
// O link NUNCA volta na resposta.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { email, name, phone } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@") || email.length > 254) {
      return json({ error: "Email é obrigatório e deve ser válido" }, 400);
    }

    const resposta = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-magic-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        name: typeof name === "string" ? name.slice(0, 120) : undefined,
        phone: typeof phone === "string" ? phone.slice(0, 30) : undefined,
      }),
    });
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      return json({ error: (dados as { error?: string }).error || "Erro ao enviar link de acesso" }, resposta.status);
    }
    return json({ success: true, sentVia: "email" });
  } catch (error) {
    console.error("[GENERATE-MAGIC-LINK-URL] Error:", error);
    return json({ error: "Erro interno ao processar solicitação" }, 500);
  }
});
