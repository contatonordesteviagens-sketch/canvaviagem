// Cria a cobrança Pix (Woovi) para o usuário LOGADO.
// Entrada: { plan: "monthly" | "semiannual" | "annual" } + Authorization: Bearer <sessão>
// Saída:   { correlationID, value, brCode, qrCodeImage, paymentLinkUrl, expiresDate }
import { adminClient, userFromRequest } from "../_shared/wooviAuth.ts";
import { corsHeaders, createWooviCharge, isPixPlan, json, PIX_PLANS } from "../_shared/woovi.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const db = adminClient();
    const user = await userFromRequest(req, db);
    if (!user?.email) return json({ error: "Faça login para pagar com Pix" }, 401);

    const body = await req.json().catch(() => ({}));
    const plan = body?.plan;
    if (!isPixPlan(plan)) return json({ error: "Plano inválido" }, 400);

    const charge = await createWooviCharge({ plan, userId: user.id, email: user.email.toLowerCase().trim() });
    console.log("[WOOVI-CREATE] Cobrança criada", { userId: user.id, plan, correlationID: charge.correlationID });

    return json({
      correlationID: charge.correlationID,
      value: PIX_PLANS[plan].valueCents,
      brCode: charge.brCode,
      qrCodeImage: charge.qrCodeImage ?? null,
      paymentLinkUrl: charge.paymentLinkUrl ?? null,
      expiresDate: charge.expiresDate ?? null,
    });
  } catch (err) {
    console.error("[WOOVI-CREATE] Erro:", (err as Error).message);
    return json({ error: "Não foi possível gerar o Pix agora. Tente de novo em instantes." }, 502);
  }
});
