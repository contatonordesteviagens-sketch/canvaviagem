// Aviso de renovação do Pix (Pix não é recorrente).
// Rodar 1x por dia (pg_cron). Manda e-mail para quem tem Elite via Pix vencendo daqui a ~3 dias
// e outro no dia do vencimento. Não altera nenhuma assinatura.
//
// Protegido: aceita o header "x-cron-secret" = WOOVI_CRON_SECRET ou, como os outros crons do
// projeto (drip, win-back), "Authorization: Bearer <service role>" lido do vault pelo pg_cron.
import { adminClient } from "../_shared/wooviAuth.ts";
import { isPixPlan, json, sendPixRenewalReminder } from "../_shared/woovi.ts";

const DAY = 24 * 60 * 60 * 1000;

function isAuthorized(req: Request): boolean {
  const cronSecret = Deno.env.get("WOOVI_CRON_SECRET");
  if (cronSecret && req.headers.get("x-cron-secret") === cronSecret) return true;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  return Boolean(serviceKey) && req.headers.get("Authorization") === `Bearer ${serviceKey}`;
}

Deno.serve(async (req) => {
  if (!isAuthorized(req)) return json({ error: "Não autorizado" }, 401);

  const db = adminClient();
  const now = Date.now();
  // Janelas de 24h: vence em 3 dias e vence hoje.
  const windows = [
    { from: now + 2 * DAY, to: now + 3 * DAY },
    { from: now, to: now + 1 * DAY },
  ];

  let sent = 0;
  const errors: string[] = [];
  for (const w of windows) {
    const { data, error } = await db
      .from("subscriptions")
      .select("user_id, current_period_end, billing_cycle")
      .eq("billing_provider", "pix")
      .eq("status", "active")
      .gte("current_period_end", new Date(w.from).toISOString())
      .lt("current_period_end", new Date(w.to).toISOString());
    if (error) {
      errors.push(error.message);
      continue;
    }
    for (const sub of data ?? []) {
      const { data: u } = await db.auth.admin.getUserById(sub.user_id);
      const email = u?.user?.email?.toLowerCase();
      if (!email) continue;
      const plan = isPixPlan(sub.billing_cycle) ? sub.billing_cycle : "monthly";
      try {
        await sendPixRenewalReminder(db, {
          email,
          name: (u!.user!.user_metadata?.name as string | undefined) || email.split("@")[0],
          periodEnd: sub.current_period_end!,
          plan,
        });
        sent++;
      } catch (err) {
        errors.push(`${sub.user_id}: ${(err as Error).message}`);
      }
    }
  }

  console.log("[WOOVI-RENEWAL] Avisos enviados", { sent, errors: errors.length });
  return json({ sent, errors });
});
