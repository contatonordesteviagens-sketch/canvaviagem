// Consulta a cobrança na Woovi (polling do modal). Se já estiver paga, libera o Elite na hora —
// assim o acesso chega mesmo se o webhook atrasar ou falhar.
// Entrada: { correlationID } + Authorization: Bearer <sessão>
// Saída:   { status: "ACTIVE" | "COMPLETED" | "EXPIRED", granted: boolean }
import { adminClient, userFromRequest } from "../_shared/wooviAuth.ts";
import { corsHeaders, getWooviCharge, grantEliteFromCharge, json, parseCorrelationId } from "../_shared/woovi.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const db = adminClient();
    const user = await userFromRequest(req, db);
    if (!user) return json({ error: "Login necessário" }, 401);

    const { correlationID } = await req.json().catch(() => ({}));
    const parsed = parseCorrelationId(correlationID);
    // Só o dono da cobrança pode consultá-la.
    if (!parsed || parsed.userId !== user.id.toLowerCase()) return json({ error: "Cobrança não encontrada" }, 404);

    const charge = await getWooviCharge(correlationID);
    if (!charge) return json({ error: "Cobrança não encontrada" }, 404);

    if (charge.status === "COMPLETED") {
      const result = await grantEliteFromCharge(db, charge);
      return json({ status: "COMPLETED", granted: result.granted });
    }
    return json({ status: charge.status, granted: false });
  } catch (err) {
    console.error("[WOOVI-STATUS] Erro:", (err as Error).message);
    return json({ error: "Falha ao consultar o Pix" }, 502);
  }
});
