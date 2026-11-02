// Corrige o e-mail de acesso logo depois do pagamento no Pix e reenvia a confirmação para o e-mail certo.
// Entrada: { email } + Authorization: Bearer <sessão>. Só vale para quem pagou há pouco e uma vez por conta.
import { adminClient, userFromRequest } from "../_shared/wooviAuth.ts";
import { corsHeaders, isPixPlan, json, PIX_PLANS, sendPixConfirmationEmail } from "../_shared/woovi.ts";

const CORRECTION_WINDOW_MS = 2 * 60 * 60 * 1000;
const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const db = adminClient();
    const user = await userFromRequest(req, db);
    if (!user?.email) return json({ error: "Faça login para continuar" }, 401);

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").toLowerCase().trim();
    if (!VALID_EMAIL.test(email)) return json({ error: "Digite um e-mail válido" }, 400);
    const oldEmail = user.email.toLowerCase().trim();
    if (email === oldEmail) return json({ ok: true, changed: false });

    const { data: sub } = await db
      .from("subscriptions")
      .select("status, billing_provider, billing_cycle, current_period_end, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();
    const recent = sub?.updated_at && Date.now() - Date.parse(sub.updated_at) < CORRECTION_WINDOW_MS;
    if (sub?.status !== "active" || sub.billing_provider !== "pix" || !recent) {
      return json({ error: "Para trocar o e-mail, fale com o suporte" }, 403);
    }
    if (user.app_metadata?.purchase_email_corrected) return json({ error: "Para trocar o e-mail de novo, fale com o suporte" }, 403);

    const { error: updateError } = await db.auth.admin.updateUserById(user.id, {
      email,
      email_confirm: true,
      app_metadata: { ...user.app_metadata, purchase_email_corrected: true },
    });
    if (updateError) return json({ error: "Esse e-mail já tem uma conta. Fale com o suporte." }, 409);

    await db.from("profiles").update({ email, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    await db.from("pix_charges").update({ email }).eq("email", oldEmail);

    const name = (user.user_metadata?.name as string | undefined) || email.split("@")[0];
    const planLabel = isPixPlan(sub.billing_cycle) ? PIX_PLANS[sub.billing_cycle].label : "Elite";
    await sendPixConfirmationEmail(db, { email, name, planLabel, periodEnd: sub.current_period_end ?? "" }).catch((err) =>
      console.warn("[CONFIRM-EMAIL] Confirmação falhou:", (err as Error).message)
    );

    console.log("[CONFIRM-EMAIL] E-mail corrigido", { userId: user.id });
    return json({ ok: true, changed: true });
  } catch (err) {
    console.error("[CONFIRM-EMAIL] Erro:", (err as Error).message);
    return json({ error: "Não foi possível trocar o e-mail agora. Tente de novo." }, 500);
  }
});
