// Webhook da Woovi: OPENPIX:CHARGE_COMPLETED → libera o Elite.
//
// Segurança em duas camadas:
// 1. x-webhook-signature (RSA-SHA256 do corpo bruto) conferida com as chaves públicas da Woovi.
// 2. A cobrança é CONSULTADA na API da Woovi com o nosso App ID antes de liberar
//    (status COMPLETED + valor do plano). Um POST forjado nunca libera acesso.
//
// O teste de cadastro da Woovi ({ data_criacao, event } sem "charge") recebe 200 com corpo vazio.
import { adminClient } from "../_shared/wooviAuth.ts";
import { getWooviCharge, grantEliteFromCharge, parseCorrelationId, savePixCharge, verifyWebhookSignature } from "../_shared/woovi.ts";

const ok = () => new Response(null, { status: 200 });
const log = (step: string, details?: unknown) =>
  console.log(`[WOOVI-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

/** Mesmo event_id do navegador (PixCheckout): o Meta une os dois e conta uma compra só. Falha aqui não pode travar a liberação. */
async function sendPixPurchaseToMeta(db: ReturnType<typeof adminClient>, correlationID: string, value: number, userId?: string) {
  const accessToken = Deno.env.get("META_CAPI_TOKEN_2120347238758199");
  if (!accessToken || !(value > 0)) return;
  try {
    const userData: Record<string, unknown> = {};
    if (userId) {
      const { data } = await db.auth.admin.getUserById(userId);
      const email = data?.user?.email?.toLowerCase().trim();
      if (email) {
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
        userData.em = [Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")];
      }
    }
    const response = await fetch("https://graph.facebook.com/v18.0/2120347238758199/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        access_token: accessToken,
        data: [{
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: `purchase_${correlationID}`,
          event_source_url: "https://canvaviagem.com/checkout",
          action_source: "website",
          user_data: userData,
          custom_data: { value, currency: "BRL" },
        }],
      }),
    });
    if (!response.ok) log("Meta recusou a compra", { correlationID, status: response.status });
  } catch (err) {
    log("Falha ao avisar o Meta", { correlationID, message: (err as Error).message });
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });

  const rawBody = await req.text();
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(null, { status: 400 });
  }

  // Evento de teste enviado ao cadastrar o webhook no painel.
  if (!payload?.charge) {
    log("Evento sem cobrança (teste de cadastro)", { event: payload?.event ?? payload?.evento ?? null });
    return ok();
  }

  const signatureValid = await verifyWebhookSignature(rawBody, req.headers.get("x-webhook-signature"));
  if (signatureValid === false) {
    log("Assinatura inválida — ignorado");
    return new Response(null, { status: 401 });
  }
  if (signatureValid === null) log("Chaves públicas indisponíveis — seguindo só com a consulta na API");

  const event = payload.event;
  const correlationID = payload.charge?.correlationID;
  if (event !== "OPENPIX:CHARGE_COMPLETED" || !parseCorrelationId(correlationID)) {
    // Outros eventos ou cobranças que não são do Canva Viagem: confirma recebimento e ignora.
    log("Ignorado", { event, correlationID });
    return ok();
  }

  try {
    const charge = await getWooviCharge(correlationID);
    const db = adminClient();
    await savePixCharge(db, charge);
    const result = await grantEliteFromCharge(db, charge);
    log("Processado", { correlationID, ...result });
    if (result.granted) await sendPixPurchaseToMeta(db, correlationID, Number(charge?.value) / 100, result.userId);
    return ok();
  } catch (err) {
    // 500 faz a Woovi tentar de novo mais tarde.
    log("ERRO", { correlationID, message: (err as Error).message });
    return new Response(null, { status: 500 });
  }
});
