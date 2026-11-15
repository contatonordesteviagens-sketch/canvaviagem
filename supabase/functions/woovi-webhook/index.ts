// Webhook da Woovi: OPENPIX:CHARGE_COMPLETED → libera o Elite.
//
// Segurança em duas camadas:
// 1. x-webhook-signature (RSA-SHA256 do corpo bruto) conferida com as chaves públicas da Woovi.
// 2. A cobrança é CONSULTADA na API da Woovi com o nosso App ID antes de liberar
//    (status COMPLETED + valor do plano). Um POST forjado nunca libera acesso.
//
// O teste de cadastro da Woovi ({ data_criacao, event } sem "charge") recebe 200 com corpo vazio.
import { adminClient } from "../_shared/wooviAuth.ts";
import { enrichFromProfile, sendPurchaseToMeta } from "../_shared/metaCapi.ts";
import { getWooviCharge, grantEliteFromCharge, parseCorrelationId, savePixCharge, verifyWebhookSignature } from "../_shared/woovi.ts";

const ok = () => new Response(null, { status: 200 });
const log = (step: string, details?: unknown) =>
  console.log(`[WOOVI-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

/** Mesmo event_id do navegador (PixCheckout/PixPanel): a Meta une os dois e conta uma compra só. Falha aqui não pode travar a liberação. */
async function sendPixPurchaseToMeta(db: ReturnType<typeof adminClient>, correlationID: string, value: number, userId?: string) {
  try {
    const { data: row } = await db.from("pix_charges")
      .select("email,fbp,fbc,client_ip,client_user_agent").eq("correlation_id", correlationID).maybeSingle();
    let email = row?.email ?? null;
    if (!email && userId) email = (await db.auth.admin.getUserById(userId)).data?.user?.email ?? null;
    const match = await enrichFromProfile(db, {
      email, userId, fbp: row?.fbp, fbc: row?.fbc, ip: row?.client_ip, userAgent: row?.client_user_agent,
    });
    const result = await sendPurchaseToMeta({
      eventId: `purchase_${correlationID}`, value, currency: "BRL",
      sourceUrl: "https://canvaviagem.com/checkout", match, log,
    });
    log("Compra enviada à Meta", { correlationID, ...result });
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
