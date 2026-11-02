// Cria a cobrança Pix (Woovi) para o usuário LOGADO.
// Entrada: { plan: "monthly" | "semiannual" | "annual" } + Authorization: Bearer <sessão>
// Saída:   { correlationID, value, brCode, qrCodeImage, paymentLinkUrl, expiresDate }
import { adminClient, userFromRequest } from "../_shared/wooviAuth.ts";
import { corsHeaders, createWooviCharge, isPixPlan, PIX_QUICK_EXPIRES_IN_SECONDS, json, PIX_PLANS, savePixCharge, isBlackFridayOpen, PIX_BLACK_FRIDAY_CENTS } from "../_shared/woovi.ts";

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

    const email = user.email.toLowerCase().trim();
    const name = (user.user_metadata?.name as string | undefined) || undefined;
    const wantsBlackFriday = body?.offer === "black-friday";
    if (wantsBlackFriday && !isBlackFridayOpen()) {
      // Com a campanha fechada, só renova com desconto quem já pagou com o valor da oferta.
      const { data: paid } = await db.from("pix_charges").select("value_cents").eq("email", email).eq("status", "COMPLETED")
        .eq("value_cents", PIX_BLACK_FRIDAY_CENTS[plan]).limit(1);
      if (!paid?.length) return json({ error: "Oferta encerrada" }, 400);
    }
    const charge = await createWooviCharge({ plan, userId: user.id, email, name, blackFriday: wantsBlackFriday, expiresIn: body?.quick === true ? PIX_QUICK_EXPIRES_IN_SECONDS : undefined });
    console.log("[WOOVI-CREATE] Cobrança criada", { userId: user.id, plan, correlationID: charge.correlationID });
    await savePixCharge(db, charge, email);

    return json({
      correlationID: charge.correlationID,
      value: wantsBlackFriday ? PIX_BLACK_FRIDAY_CENTS[plan] : PIX_PLANS[plan].valueCents,
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
