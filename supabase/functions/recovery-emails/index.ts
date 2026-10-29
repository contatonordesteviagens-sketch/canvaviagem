// E-mails de recuperação de quem gerou Pix / abriu o cartão e NÃO pagou.
// Roda de hora em hora (pg_cron). Regras:
// - E-mail 1 "pronta" após 1 h, 2 "desconto" no 3º dia, 3 "contato" no 7º dia (RECOVERY_SCHEDULE_HOURS).
// - Cada tipo no máximo 1 vez por e-mail (recovery_email_log). Manda só o tipo mais recente que já venceu.
// - Ignora quem pagou (Pix COMPLETED, cartão completed ou assinatura ativa) e quem pediu para sair.
// - Só tentativas dos últimos 8 dias: ligar o sistema não dispara e-mail para a base antiga.
//
// POST (servidor ou admin): roda o envio. Admin pode mandar { test_to, kind } para receber um teste.
// GET ?sair=<email>&t=<assinatura>: descadastro (link do rodapé). Pública, assinada com HMAC.
import { Resend } from "https://esm.sh/resend@2.0.0";
import { adminClient, userFromRequest } from "../_shared/wooviAuth.ts";
import { canonicalSiteUrl } from "../_shared/siteUrl.ts";
import { renderRecoveryEmail, RECOVERY_SCHEDULE_HOURS, type RecoveryKind } from "../_shared/recoveryEmails.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const HOUR = 60 * 60 * 1000;
const MAX_AGE_HOURS = 8 * 24;
const MAX_PER_RUN = 60;
const KINDS: RecoveryKind[] = ["contato", "desconto", "pronta"]; // do mais tardio ao mais cedo

const FUNCTION_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/recovery-emails`;

async function sign(email: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`sair:${email}`));
  return Array.from(new Uint8Array(sig).slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function unsubscribeUrl(email: string) {
  return `${FUNCTION_URL}?sair=${encodeURIComponent(email)}&t=${await sign(email)}`;
}

function page(title: string, text: string, status = 200) {
  return new Response(
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:#fbf6e9;font-family:Arial,Helvetica,sans-serif;color:#201c13;">
<div style="max-width:440px;margin:15vh auto;padding:32px 24px;background:#fffdf7;border:1px solid #ece2ba;border-radius:24px;text-align:center;">
<h1 style="font-size:24px;margin:0 0 12px;">${title}</h1><p style="font-size:16px;line-height:1.6;color:#6e6555;margin:0;">${text}</p>
<a href="${canonicalSiteUrl()}" style="display:inline-block;margin-top:24px;color:#6440e6;font-weight:bold;">canvaviagem.com</a></div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

/** Link que entra logado na conta e abre o pagamento (mesmo fluxo do send-magic-link). */
async function payLink(db: ReturnType<typeof adminClient>, email: string, plan: string, method: "pix" | "cartao") {
  const token = crypto.randomUUID();
  const { error } = await db.from("magic_link_tokens").insert({
    email,
    token,
    expires_at: new Date(Date.now() + 7 * 24 * HOUR).toISOString(),
  });
  const checkout = `/checkout?plano=${encodeURIComponent(plan || "annual")}&metodo=${method}`;
  if (error) return `${canonicalSiteUrl()}${checkout}`;
  return `${canonicalSiteUrl()}/auth/verify?token=${token}&redirect=${encodeURIComponent(checkout)}`;
}

async function firstName(db: ReturnType<typeof adminClient>, userId: string | null, email: string) {
  if (userId) {
    const { data } = await db.auth.admin.getUserById(userId);
    const name = (data?.user?.user_metadata?.name as string | undefined) || (data?.user?.user_metadata?.full_name as string | undefined);
    if (name) return name.trim().split(/\s+/)[0];
  }
  const { data: profile } = await db.from("profiles").select("name").eq("email", email).maybeSingle();
  if (profile?.name) return String(profile.name).trim().split(/\s+/)[0];
  return "";
}

async function sendOne(email: string, kind: RecoveryKind, vars: { firstName: string; payUrl: string }) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) throw new Error("RESEND_API_KEY não configurado");
  const unsub = await unsubscribeUrl(email);
  const { subject, html } = renderRecoveryEmail(kind, { ...vars, unsubscribeUrl: unsub });
  const from = Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>";
  const replyTo = Deno.env.get("RECOVERY_REPLY_TO") || "lucas@rochadigitalmidia.com.br";
  const { error } = await new Resend(resendKey).emails.send({
    from,
    to: [email],
    reply_to: replyTo,
    subject,
    html,
    headers: { "List-Unsubscribe": `<${unsub}>` },
  });
  if (error) throw new Error(error.message ?? String(error));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const db = adminClient();
  const url = new URL(req.url);

  // ── Descadastro ──
  if (req.method === "GET") {
    const email = (url.searchParams.get("sair") ?? "").toLowerCase().trim();
    const t = url.searchParams.get("t") ?? "";
    if (!email || t !== (await sign(email))) return page("Link inválido", "Esse link de descadastro não é válido.", 400);
    await db.from("email_unsubscribes").upsert({ email }, { onConflict: "email" });
    return page("Pronto", "Você não vai mais receber esses e-mails.");
  }
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  // ── Quem pode rodar: servidor (pg_cron) ou admin ──
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const isServer = Boolean(serviceKey) && req.headers.get("Authorization") === `Bearer ${serviceKey}`;
  let adminEmail: string | null = null;
  if (!isServer) {
    const user = await userFromRequest(req, db);
    if (!user) return json({ error: "Login necessário" }, 401);
    const { data: role } = await db.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!role) return json({ error: "Só admin" }, 403);
    adminEmail = user.email?.toLowerCase() ?? null;
  }

  const body = await req.json().catch(() => ({}));

  // ── Teste (admin): manda um modelo para um e-mail, sem registrar ──
  if (body?.test_to) {
    if (!adminEmail && !isServer) return json({ error: "Só admin" }, 403);
    const kind: RecoveryKind = ["pronta", "desconto", "contato"].includes(body.kind) ? body.kind : "pronta";
    const to = String(body.test_to).toLowerCase().trim();
    await sendOne(to, kind, { firstName: "Lucas", payUrl: `${canonicalSiteUrl()}/checkout?plano=annual&metodo=pix` });
    return json({ test: true, sent: kind, to });
  }

  // ── Envio automático ──
  const since = new Date(Date.now() - MAX_AGE_HOURS * HOUR).toISOString();
  const [{ data: pix }, { data: cards }] = await Promise.all([
    db.from("pix_charges").select("email,user_id,plan,status,created_at").gte("created_at", since),
    db.from("card_checkouts").select("email,user_id,plan,status,created_at").gte("created_at", since),
  ]);

  type Attempt = { email: string; userId: string | null; plan: string; method: "pix" | "cartao"; at: number; paid: boolean };
  const byEmail = new Map<string, Attempt>();
  const paidEmails = new Set<string>();
  const add = (row: any, method: "pix" | "cartao", paid: boolean) => {
    const email = String(row.email ?? "").toLowerCase().trim();
    if (!email) return;
    if (paid) { paidEmails.add(email); return; }
    const at = Date.parse(row.created_at);
    const prev = byEmail.get(email);
    if (!prev || at > prev.at) byEmail.set(email, { email, userId: row.user_id ?? null, plan: row.plan ?? "annual", method, at, paid });
  };
  for (const r of pix ?? []) add(r, "pix", r.status === "COMPLETED");
  for (const r of cards ?? []) add(r, "cartao", r.status === "completed");

  const emails = [...byEmail.keys()].filter((e) => !paidEmails.has(e));
  if (!emails.length) return json({ candidates: 0, sent: 0 });

  const [{ data: unsubs }, { data: logs }, { data: anyPaid }] = await Promise.all([
    db.from("email_unsubscribes").select("email").in("email", emails),
    db.from("recovery_email_log").select("email,kind").in("email", emails),
    db.from("pix_charges").select("email").in("email", emails).eq("status", "COMPLETED"),
  ]);
  const skip = new Set<string>([...(unsubs ?? []).map((u: any) => u.email), ...(anyPaid ?? []).map((p: any) => p.email)]);
  const sentKinds = new Map<string, Set<string>>();
  for (const l of logs ?? []) {
    if (!sentKinds.has(l.email)) sentKinds.set(l.email, new Set());
    sentKinds.get(l.email)!.add(l.kind);
  }

  let sent = 0;
  const errors: string[] = [];
  for (const email of emails) {
    if (sent >= MAX_PER_RUN) break;
    if (skip.has(email)) continue;
    const attempt = byEmail.get(email)!;
    const hours = (Date.now() - attempt.at) / HOUR;
    const due = KINDS.find((k) => hours >= RECOVERY_SCHEDULE_HOURS[k]);
    if (!due || sentKinds.get(email)?.has(due)) continue;

    // Assinatura ativa (pagou por outro caminho): não manda.
    if (attempt.userId) {
      const { data: sub } = await db.from("subscriptions").select("status,current_period_end").eq("user_id", attempt.userId).maybeSingle();
      const active = sub && ["active", "trialing"].includes(sub.status) && (!sub.current_period_end || Date.parse(sub.current_period_end) > Date.now());
      if (active) continue;
    }

    try {
      // Registra antes de mandar: se duas execuções colidirem, só uma passa (chave email+kind).
      const { error: logErr } = await db.from("recovery_email_log").insert({ email, kind: due });
      if (logErr) continue;
      const name = await firstName(db, attempt.userId, email);
      const payUrl = due === "pronta" ? await payLink(db, email, attempt.plan, attempt.method) : `${canonicalSiteUrl()}/checkout`;
      await sendOne(email, due, { firstName: name, payUrl });
      sent++;
    } catch (err) {
      errors.push(`${email.slice(0, 3)}***: ${(err as Error).message}`);
      await db.from("recovery_email_log").delete().eq("email", email).eq("kind", due);
    }
  }

  console.log("[RECOVERY] Execução", { candidates: emails.length, sent, errors: errors.length });
  return json({ candidates: emails.length, sent, errors });
});
