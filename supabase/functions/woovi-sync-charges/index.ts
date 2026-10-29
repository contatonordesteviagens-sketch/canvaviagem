// Traz as cobranças Pix da Woovi para pix_charges (funil e recuperação de quem não pagou).
// Recupera as antigas (criadas antes de pix_charges existir) e atualiza status de pagas/expiradas.
// Só cobranças do Canva Viagem (correlationID cv-<plano>-<user_id>-...). Não libera acesso.
//
// Quem pode rodar: admin logado (botão na Gestão) ou o servidor (Bearer service role, ex.: pg_cron).
// Entrada opcional: { days?: number } (padrão 60, máx. 365). Saída: { found, saved, skipped }.
import { adminClient, userFromRequest } from "../_shared/wooviAuth.ts";
import { corsHeaders, json, listWooviCharges, parseCorrelationId, savePixCharge } from "../_shared/woovi.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const db = adminClient();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const isServer = Boolean(serviceKey) && req.headers.get("Authorization") === `Bearer ${serviceKey}`;
  if (!isServer) {
    const user = await userFromRequest(req, db);
    if (!user) return json({ error: "Login necessário" }, 401);
    const { data: role } = await db.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!role) return json({ error: "Só admin" }, 403);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const days = Math.min(Math.max(Number(body?.days) || 60, 1), 365);
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

    const charges = await listWooviCharges(start.toISOString(), end.toISOString());
    let saved = 0;
    let skipped = 0;
    for (const charge of charges) {
      if (!parseCorrelationId(charge.correlationID)) { skipped++; continue; }
      await savePixCharge(db, charge);
      saved++;
    }
    console.log("[WOOVI-SYNC] Concluído", { days, found: charges.length, saved, skipped });
    return json({ found: charges.length, saved, skipped });
  } catch (err) {
    console.error("[WOOVI-SYNC] Erro:", (err as Error).message);
    return json({ error: "Falha ao sincronizar com a Woovi" }, 502);
  }
});
