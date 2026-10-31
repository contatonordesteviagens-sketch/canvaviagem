// Pix via Woovi (OpenPix): planos, chamadas à API e liberação do Elite.
// Usado por woovi-create-charge, woovi-charge-status e woovi-webhook.
//
// Regras (docs/segundo-cerebro/2026-10-29 .../06):
// - O usuário é identificado pelo user_id gravado no correlationID, não pelo e-mail.
// - Pix não é recorrente: current_period_end SEMPRE preenchido (30/180/365 dias).
//   Vencido = bloqueia sozinho via isPaidSubscriptionCurrent().
// - A liberação só acontece depois de consultar a cobrança na API da Woovi
//   (status COMPLETED e valor certo). O webhook sozinho nunca libera nada.

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { canonicalSiteUrl } from "./siteUrl.ts";

export type PixPlan = "monthly" | "semiannual" | "annual";

export const PIX_PLANS: Record<PixPlan, { valueCents: number; days: number; productId: string; label: string }> = {
  monthly: { valueCents: 9700, days: 30, productId: "monthly_access_pix", label: "Elite Mensal" },
  semiannual: { valueCents: 34700, days: 180, productId: "semiannual_access_pix", label: "Elite Semestral" },
  annual: { valueCents: 48200, days: 365, productId: "annual_access_pix", label: "Elite Anual" },
};

/** Tempo para pagar o QR Code (segundos). */
export const PIX_EXPIRES_IN_SECONDS = 60 * 60;

// Black Friday: 50% para sempre. Quem pagou com esse valor renova com esse valor, mesmo depois de a campanha fechar.
export const BLACK_FRIDAY_OPEN = true;
export const PIX_BLACK_FRIDAY_CENTS: Record<PixPlan, number> = { monthly: 4850, semiannual: 17350, annual: 24100 };

export function isPixPlan(value: unknown): value is PixPlan {
  return value === "monthly" || value === "semiannual" || value === "annual";
}

/** API de produção por padrão; WOOVI_API_URL=https://api.woovi-sandbox.com para testes. */
export function wooviApiBase(): string {
  return (Deno.env.get("WOOVI_API_URL") || "https://api.woovi.com").replace(/\/+$/, "");
}

const UUID_RE = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const CORRELATION_RE = new RegExp(`^cv-(monthly|semiannual|annual)-(${UUID_RE})-([0-9a-z]+)$`, "i");

export function buildCorrelationId(plan: PixPlan, userId: string): string {
  const nonce = Date.now().toString(36) + crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  return `cv-${plan}-${userId}-${nonce}`;
}

export function parseCorrelationId(correlationID: unknown): { plan: PixPlan; userId: string } | null {
  if (typeof correlationID !== "string") return null;
  const m = CORRELATION_RE.exec(correlationID.trim());
  if (!m) return null;
  return { plan: m[1].toLowerCase() as PixPlan, userId: m[2].toLowerCase() };
}

export type WooviCharge = {
  correlationID: string;
  value: number;
  status: string; // ACTIVE | COMPLETED | EXPIRED
  brCode?: string;
  qrCodeImage?: string;
  paymentLinkUrl?: string;
  expiresDate?: string;
  paidAt?: string;
  updatedAt?: string;
  createdAt?: string;
};

async function wooviFetch(path: string, init: RequestInit = {}) {
  const appId = Deno.env.get("WOOVI_APP_ID");
  if (!appId) throw new Error("WOOVI_APP_ID não configurado");
  const res = await fetch(`${wooviApiBase()}${path}`, {
    ...init,
    headers: { Authorization: appId, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* resposta não-JSON */ }
  if (!res.ok) {
    const msg = json?.error || json?.message || text.slice(0, 200) || `HTTP ${res.status}`;
    throw new Error(`Woovi ${res.status}: ${msg}`);
  }
  return json;
}

export async function createWooviCharge(params: {
  plan: PixPlan;
  userId: string;
  email: string;
  name?: string;
  blackFriday?: boolean;
}): Promise<WooviCharge> {
  const cfg = PIX_PLANS[params.plan];
  const label = params.blackFriday ? `${cfg.label} Black Friday` : cfg.label;
  const body: Record<string, unknown> = {
    correlationID: buildCorrelationId(params.plan, params.userId),
    value: params.blackFriday ? PIX_BLACK_FRIDAY_CENTS[params.plan] : cfg.valueCents,
    comment: `Canva Viagem - ${label}`,
    expiresIn: PIX_EXPIRES_IN_SECONDS,
    additionalInfo: [
      { key: "Plano", value: label },
      { key: "Conta", value: params.email },
    ],
    // Preenche a coluna "Cliente" no painel da Woovi.
    customer: { name: params.name || params.email.split("@")[0], email: params.email },
  };
  let json: any;
  try {
    json = await wooviFetch("/api/v1/charge", { method: "POST", body: JSON.stringify(body) });
  } catch (err) {
    // Se a Woovi recusar o bloco do cliente, a cobrança sai sem ele (o e-mail continua em "Conta").
    console.warn("[WOOVI] Cobrança com cliente recusada, tentando sem:", (err as Error).message);
    delete body.customer;
    json = await wooviFetch("/api/v1/charge", { method: "POST", body: JSON.stringify(body) });
  }
  const charge = json?.charge;
  if (!charge?.correlationID || !charge?.brCode) throw new Error("Resposta da Woovi sem cobrança");
  return charge as WooviCharge;
}

/**
 * Guarda/atualiza a cobrança em pix_charges (funil e recuperação de quem não pagou).
 * Nunca derruba o pagamento: erro aqui só vai para o log.
 */
export async function savePixCharge(db: SupabaseClient, charge: WooviCharge | null, email?: string | null): Promise<void> {
  if (!charge?.correlationID) return;
  const parsed = parseCorrelationId(charge.correlationID);
  if (!parsed) return;
  try {
    let normalized = email?.toLowerCase().trim() || null;
    if (!normalized) {
      const { data } = await db.auth.admin.getUserById(parsed.userId);
      normalized = data?.user?.email?.toLowerCase().trim() || null;
    }
    const status = ["ACTIVE", "COMPLETED", "EXPIRED"].includes(charge.status) ? charge.status : "ACTIVE";
    const row: Record<string, unknown> = {
      correlation_id: charge.correlationID,
      user_id: parsed.userId,
      email: normalized,
      plan: parsed.plan,
      value_cents: Number(charge.value) || PIX_PLANS[parsed.plan].valueCents,
      status,
      payment_link_url: charge.paymentLinkUrl ?? null,
      expires_at: charge.expiresDate ?? null,
      updated_at: new Date().toISOString(),
    };
    if (status === "COMPLETED") row.paid_at = charge.paidAt ?? charge.updatedAt ?? new Date().toISOString();
    if (charge.createdAt) row.created_at = charge.createdAt;
    const { error } = await db.from("pix_charges").upsert(row, { onConflict: "correlation_id" });
    if (error) console.warn("[WOOVI] pix_charges não gravou:", error.message);
  } catch (err) {
    console.warn("[WOOVI] pix_charges falhou:", (err as Error).message);
  }
}

/** Lista as cobranças da Woovi num intervalo de datas (para recuperar as antigas). */
export async function listWooviCharges(startIso: string, endIso: string): Promise<WooviCharge[]> {
  const all: WooviCharge[] = [];
  for (let skip = 0; skip < 5000; skip += 100) {
    const qs = new URLSearchParams({ start: startIso, end: endIso, skip: String(skip), limit: "100" });
    const json = await wooviFetch(`/api/v1/charge?${qs.toString()}`);
    const page: WooviCharge[] = json?.charges ?? [];
    all.push(...page);
    if (!json?.pageInfo?.hasNextPage || page.length === 0) break;
  }
  return all;
}

export async function getWooviCharge(correlationID: string): Promise<WooviCharge | null> {
  try {
    const json = await wooviFetch(`/api/v1/charge/${encodeURIComponent(correlationID)}`);
    return (json?.charge as WooviCharge) ?? null;
  } catch (err) {
    if (String((err as Error).message).includes(" 404")) return null;
    throw err;
  }
}

// ─── Assinatura do webhook (x-webhook-signature = base64(RSA-SHA256(corpo bruto))) ───

let cachedKeys: { keys: CryptoKey[]; at: number } | null = null;

async function loadWebhookPublicKeys(): Promise<CryptoKey[]> {
  if (cachedKeys && Date.now() - cachedKeys.at < 6 * 60 * 60 * 1000) return cachedKeys.keys;
  const res = await fetch(`${wooviApiBase()}/api/v1/webhook/public-keys`);
  if (!res.ok) throw new Error(`public-keys HTTP ${res.status}`);
  const json = await res.json();
  const pems: string[] = (json?.public_keys ?? []).map((k: any) => k?.key).filter((k: unknown) => typeof k === "string");
  const keys: CryptoKey[] = [];
  for (const pem of pems) {
    const b64 = pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, "").replace(/\s+/g, "");
    const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    keys.push(await crypto.subtle.importKey("spki", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]));
  }
  if (!keys.length) throw new Error("Nenhuma chave pública retornada");
  cachedKeys = { keys, at: Date.now() };
  return keys;
}

function base64ToBytes(b64: string) {
  try {
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

/** true = assinatura válida; false = inválida; null = não deu para verificar (chaves indisponíveis). */
export async function verifyWebhookSignature(rawBody: string, signature: string | null): Promise<boolean | null> {
  if (!signature) return false;
  let keys: CryptoKey[];
  try {
    keys = await loadWebhookPublicKeys();
  } catch (err) {
    console.warn("[WOOVI] Não foi possível carregar chaves públicas:", (err as Error).message);
    return null;
  }
  const sig = base64ToBytes(signature.trim());
  if (!sig) return false;
  const data = new TextEncoder().encode(rawBody);
  for (const key of keys) {
    if (await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, sig, data)) return true;
  }
  return false;
}

// ─── Liberação do acesso ─────────────────────────────────────────────────────

export type GrantResult =
  | { granted: true; userId: string; plan: PixPlan; periodEnd: string }
  | { granted: false; reason: string };

/**
 * Libera (ou renova) o Elite a partir de uma cobrança CONSULTADA na API da Woovi.
 * Idempotente: webhook e polling podem chamar para a mesma cobrança sem dar acesso em dobro.
 */
export async function grantEliteFromCharge(db: SupabaseClient, charge: WooviCharge | null): Promise<GrantResult> {
  if (!charge) return { granted: false, reason: "charge_not_found" };
  if (charge.status !== "COMPLETED") return { granted: false, reason: `status_${charge.status}` };

  const parsed = parseCorrelationId(charge.correlationID);
  if (!parsed) return { granted: false, reason: "foreign_correlation_id" };
  const cfg = PIX_PLANS[parsed.plan];
  if (Number(charge.value) !== cfg.valueCents && Number(charge.value) !== PIX_BLACK_FRIDAY_CENTS[parsed.plan]) {
    console.error("[WOOVI] Valor diferente do plano", { correlationID: charge.correlationID, value: charge.value });
    return { granted: false, reason: "value_mismatch" };
  }

  const { data: userData, error: userErr } = await db.auth.admin.getUserById(parsed.userId);
  if (userErr || !userData?.user) return { granted: false, reason: "user_not_found" };
  const user = userData.user;
  const email = (user.email ?? "").toLowerCase().trim();

  const paidAtMs = Date.parse(charge.paidAt ?? charge.updatedAt ?? "") || Date.now();

  const { data: existing } = await db
    .from("subscriptions")
    .select("status, product_id, current_period_end, billing_provider, updated_at")
    .eq("user_id", parsed.userId)
    .maybeSingle();

  // Já processada: a linha Pix foi atualizada depois do pagamento desta cobrança.
  if (existing?.billing_provider === "pix" && existing.updated_at && Date.parse(existing.updated_at) >= paidAtMs) {
    return { granted: true, userId: parsed.userId, plan: parsed.plan, periodEnd: existing.current_period_end ?? "" };
  }

  // Renovação antecipada: soma a partir do vencimento atual do Pix, se ainda estiver em dia.
  let baseMs = paidAtMs;
  if (existing?.billing_provider === "pix" && existing.status === "active" && existing.current_period_end) {
    const currentEnd = Date.parse(existing.current_period_end);
    if (Number.isFinite(currentEnd) && currentEnd > baseMs) baseMs = currentEnd;
  }
  const periodEnd = new Date(baseMs + cfg.days * 24 * 60 * 60 * 1000).toISOString();
  const nowIso = new Date().toISOString();

  const { data: profile } = await db.from("profiles").select("user_id").eq("user_id", parsed.userId).maybeSingle();
  const name = (user.user_metadata?.name as string | undefined) || email.split("@")[0];
  if (!profile) {
    await db.from("profiles").upsert({ user_id: parsed.userId, email, name, updated_at: nowIso }, { onConflict: "user_id" });
  }

  const { error: subErr } = await db.from("subscriptions").upsert({
    user_id: parsed.userId,
    status: "active",
    product_id: cfg.productId,
    billing_provider: "pix",
    billing_cycle: parsed.plan,
    current_period_end: periodEnd,
    updated_at: nowIso,
  }, { onConflict: "user_id" });
  if (subErr) throw subErr;

  console.log("[WOOVI] Elite liberado", { userId: parsed.userId, plan: parsed.plan, periodEnd });

  await sendPixConfirmationEmail(db, { email, name, planLabel: cfg.label, periodEnd }).catch((err) =>
    console.warn("[WOOVI] E-mail de confirmação falhou:", (err as Error).message)
  );

  return { granted: true, userId: parsed.userId, plan: parsed.plan, periodEnd };
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

async function createMagicLink(db: SupabaseClient, email: string, name: string, path = ""): Promise<string> {
  const token = crypto.randomUUID();
  await db.from("magic_link_tokens").insert({
    email,
    token,
    name,
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  });
  // /auth/verify lê "redirect" (não "next").
  const redirect = path ? `&redirect=${encodeURIComponent(path)}` : "";
  return `${canonicalSiteUrl()}/auth/verify?token=${token}${redirect}`;
}

// canvaviagem.com não está verificado no Resend: usar o remetente verificado (igual ao send-magic-link).
const FROM_EMAIL = () => Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>";

async function sendPixConfirmationEmail(db: SupabaseClient, p: { email: string; name: string; planLabel: string; periodEnd: string }) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey || !p.email) return;
  const link = await createMagicLink(db, p.email, p.name);
  await new Resend(resendKey).emails.send({
    from: FROM_EMAIL(),
    to: [p.email],
    subject: "✅ Pix confirmado — seu Elite está liberado",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9fafb; border-radius: 20px;">
        <h2 style="color: #1a1a1a;">Olá, ${p.name}!</h2>
        <p style="color: #4b5563; font-size: 16px;">Recebemos seu Pix. O plano <b>${p.planLabel}</b> está ativo até <b>${fmtDate(p.periodEnd)}</b>.</p>
        <a href="${link}" style="background: #000; color: #fff; padding: 18px 30px; text-decoration: none; border-radius: 12px; display: inline-block; margin: 25px 0; font-weight: bold;">ACESSAR A FÁBRICA →</a>
        <p style="color: #6b7280; font-size: 14px;">O Pix não renova sozinho. Alguns dias antes do vencimento a gente te avisa por e-mail para renovar.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 11px;">Por segurança, este link vale por 1 hora. Depois disso, entre normalmente pela página de login.</p>
      </div>
    `,
  });
}

export async function sendPixRenewalReminder(db: SupabaseClient, p: { email: string; name: string; periodEnd: string; plan: PixPlan; blackFriday?: boolean }) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) throw new Error("RESEND_API_KEY não configurado");
  const link = p.blackFriday
    ? `${canonicalSiteUrl()}/checkout?plano=${p.plan}&metodo=pix&oferta=black-friday`
    : `${canonicalSiteUrl()}/pix?plano=${p.plan}`;
  await new Resend(resendKey).emails.send({
    from: FROM_EMAIL(),
    to: [p.email],
    subject: `⏰ Seu acesso Elite vence em ${fmtDate(p.periodEnd)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9fafb; border-radius: 20px;">
        <h2 style="color: #1a1a1a;">Olá, ${p.name}!</h2>
        <p style="color: #4b5563; font-size: 16px;">Seu plano Elite pago via Pix vence em <b>${fmtDate(p.periodEnd)}</b>. Depois disso a Fábrica, os anúncios, o site e o CRM ficam bloqueados.</p>
        <p style="color: #4b5563; font-size: 16px;">Renove agora: os dias que faltam são somados ao novo período, você não perde nada.</p>
        <a href="${link}" style="background: #000; color: #fff; padding: 18px 30px; text-decoration: none; border-radius: 12px; display: inline-block; margin: 25px 0; font-weight: bold;">RENOVAR COM PIX →</a>
      </div>
    `,
  });
}

// ─── Utilitários HTTP ────────────────────────────────────────────────────────

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
