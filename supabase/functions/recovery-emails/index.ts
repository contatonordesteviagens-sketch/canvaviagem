// E-mails de recuperação de quem gerou Pix / abriu o cartão e NÃO pagou.
// Roda de hora em hora (pg_cron). Regras:
// - E-mail 1 "pronta" após 1 h, 2 "desconto" no 3º dia, 3 "contato" no 7º dia (RECOVERY_SCHEDULE_HOURS).
// - Quem só deixou o e-mail ou fez o quiz: 6 e-mails, lead1 a lead6 (LEAD_SCHEDULE_HOURS), do mais recente vencido.
// - Cada tipo no máximo 1 vez por e-mail (recovery_email_log). Manda só o tipo mais recente que já venceu.
// - Ignora quem pagou (Pix COMPLETED, cartão completed ou assinatura ativa) e quem pediu para sair.
// - Só tentativas dos últimos 8 dias: ligar o sistema não dispara e-mail para a base antiga.
//
// POST (servidor ou admin): roda o envio. Admin pode mandar { test_to, kind } para receber um teste.
// GET ?sair=<email>&t=<assinatura>: descadastro (link do rodapé). Pública, assinada com HMAC.
import { Resend } from "https://esm.sh/resend@2.0.0";
import { adminClient, userFromRequest } from "../_shared/wooviAuth.ts";
import { claimJobRun } from "../_shared/jobRuns.ts";
import { canonicalSiteUrl } from "../_shared/siteUrl.ts";
import { BF_CAMPAIGN, BF_SCHEDULE_DAYS, renderRecoveryEmail, RECOVERY_SCHEDULE_HOURS, LEAD_SCHEDULE_HOURS, type BlackFridayKind, type LeadKind, type RecoveryKind } from "../_shared/recoveryEmails.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const HOUR = 60 * 60 * 1000;
const MAX_AGE_HOURS = 8 * 24;
const MAX_PER_RUN = 60;
const KINDS: ("contato" | "desconto" | "pronta")[] = ["contato", "desconto", "pronta"]; // do mais tardio ao mais cedo
const LEAD_KINDS: LeadKind[] = ["lead6", "lead5", "lead4", "lead3", "lead2", "lead1"];
const LEAD_MAX_AGE_HOURS = 11 * 24;

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

/** Link que entra logado e leva à página de planos, com a origem do e-mail para o rastreamento. */
async function resumeLink(db: ReturnType<typeof adminClient>, email: string, campaign: string) {
  const token = crypto.randomUUID();
  const { error } = await db.from("magic_link_tokens").insert({
    email,
    token,
    expires_at: new Date(Date.now() + 7 * 24 * HOUR).toISOString(),
  });
  const planos = `/planos?utm_source=email&utm_medium=nurture&utm_campaign=${encodeURIComponent(campaign)}`;
  if (error) return `${canonicalSiteUrl()}${planos}`;
  return `${canonicalSiteUrl()}/auth/verify?token=${token}&redirect=${encodeURIComponent(planos)}`;
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

async function sendOne(email: string, kind: RecoveryKind, vars: { firstName: string; payUrl: string; neverSubscribed?: boolean }) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) throw new Error("RESEND_API_KEY não configurado");
  const unsub = await unsubscribeUrl(email);
  const { subject, html } = renderRecoveryEmail(kind, { ...vars, unsubscribeUrl: unsub });
  // A campanha sai pelo Brevo: rejeição nela não pode travar o link de login, que sai pelo Resend.
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  if (brevoKey && (kind.startsWith("bf") || kind === "novidades" || kind === "frio1")) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": brevoKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Canva Viagem", email: "lucas@rochadigitalmidia.com.br" },
        to: [{ email }],
        replyTo: { email: Deno.env.get("RECOVERY_REPLY_TO") || "lucas@rochadigitalmidia.com.br" },
        subject,
        htmlContent: html,
        headers: { "List-Unsubscribe": `<${unsub}>` },
      }),
    });
    if (!response.ok) throw new Error(`Brevo ${response.status}: ${(await response.text()).slice(0, 200)}`);
    return;
  }
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

const BF_KINDS: BlackFridayKind[] = ["bf6", "bf5", "bf3", "bf4", "bf2", "bf1"]; // do mais tardio ao mais cedo
const BF_LEAD_WAIT_HOURS = 72;
// Resend grátis: 100 por dia, divididos com o link de login e os e-mails de compra. A campanha usa no máximo 70.
// Pelo Brevo, a cota é a do plano pago e não divide espaço com o login.
const BF_DAILY_CAP = Deno.env.get("BREVO_API_KEY") ? 400 : 70;
const bfRunning = () => Date.now() >= Date.parse(BF_CAMPAIGN.start) && Date.now() < Date.parse(BF_CAMPAIGN.end);

/** Link que entra logado e abre a página, com a origem do e-mail para o rastreamento. */
async function campaignLink(db: ReturnType<typeof adminClient>, email: string, path: string, medium: string, campaign: string) {
  const target = `${path}?utm_source=email&utm_medium=${medium}&utm_campaign=${encodeURIComponent(campaign)}`;
  const token = crypto.randomUUID();
  const { error } = await db.from("magic_link_tokens").insert({ email, token, expires_at: new Date(Date.now() + 7 * 24 * HOUR).toISOString() });
  if (error) return `${canonicalSiteUrl()}${target}`;
  return `${canonicalSiteUrl()}/auth/verify?token=${token}&redirect=${encodeURIComponent(target)}`;
}

// Quem só deixou o e-mail, do mais antigo ao mais novo. Só sai por pedido do admin, em levas pequenas.
const COLD_MAX_PER_CALL = 60;
const COLD_NOT_REAL = /(teste|test[._-]|@test|exemplo|example|mailinator|yopmail|tempmail|guerrillamail|lucashenrique|contatonordeste|canvaviagem|rochadigital|rzxv)/i;
const COLD_VALID = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const COLD_TYPO = /(\.con|\.cmo|\.comm)$|@(gmial|gmal|gamil|gnail|hotmal|hotmial|outlok)\./i;

async function runColdList(db: ReturnType<typeof adminClient>, limit: number, dryRun: boolean, onlyProven: boolean) {
  const firstSeen = new Map<string, number>();
  const keep = (rawEmail: unknown, at: unknown) => {
    const email = String(rawEmail ?? "").toLowerCase().trim();
    const ms = Date.parse(String(at ?? ""));
    if (!email || !Number.isFinite(ms)) return;
    firstSeen.set(email, Math.min(firstSeen.get(email) ?? ms, ms));
  };
  const userEmail = new Map<string, string>();
  // Prova de que a caixa existe: clicou em um link nosso ou entrou com o Google.
  // O login guarda todo e-mail digitado, mesmo com erro de digitação, e é daí que vêm as rejeições.
  const proven = new Set<string>();
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const u of data.users) {
      keep(u.email, u.created_at);
      if (u.email) userEmail.set(u.id, u.email.toLowerCase().trim());
      if (u.email && (u.app_metadata?.providers ?? []).includes("google")) proven.add(u.email.toLowerCase().trim());
    }
    if (data.users.length < 1000) break;
  }
  const { data: captures } = await db.from("email_captures").select("email,first_seen_at");
  for (const c of captures ?? []) keep(c.email, c.first_seen_at);
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("magic_link_tokens").select("email").not("used_at", "is", null).range(from, from + 999);
    if (error) throw error;
    for (const row of data ?? []) proven.add(String(row.email ?? "").toLowerCase().trim());
    if ((data?.length ?? 0) < 1000) break;
  }

  // Lista separada: ninguém que já assinou, tentou pagar, pediu para sair ou já recebeu e-mail nosso.
  const [{ data: subs }, { data: pix }, { data: cards }, { data: unsubs }, { data: logs }] = await Promise.all([
    db.from("subscriptions").select("user_id"),
    db.from("pix_charges").select("email"),
    db.from("card_checkouts").select("email"),
    db.from("email_unsubscribes").select("email"),
    db.from("recovery_email_log").select("email"),
  ]);
  const out = new Set<string>();
  for (const s of subs ?? []) { const e = userEmail.get(s.user_id); if (e) out.add(e); }
  for (const list of [pix, cards, unsubs, logs]) for (const row of list ?? []) out.add(String(row.email ?? "").toLowerCase().trim());

  const fullQueue = [...firstSeen.entries()]
    .filter(([email]) => !out.has(email) && COLD_VALID.test(email) && !COLD_NOT_REAL.test(email) && !COLD_TYPO.test(email))
    .sort((a, b) => a[1] - b[1]);
  const provenQueue = fullQueue.filter(([email]) => proven.has(email));
  const queue = onlyProven ? provenQueue : fullQueue;
  const base = { fila: fullQueue.length, fila_comprovada: provenQueue.length, de: queue[0] ? new Date(queue[0][1]).toISOString().slice(0, 10) : null };
  if (dryRun) return { ...base, dry_run: true };

  let sent = 0;
  const errors: string[] = [];
  let lastAt: number | null = null;
  for (const [email, at] of queue.slice(0, Math.min(limit, COLD_MAX_PER_CALL))) {
    const { error: logErr } = await db.from("recovery_email_log").insert({ email, kind: "frio1" });
    if (logErr) continue;
    try {
      const url = await campaignLink(db, email, "/black-friday", "lista_fria", "frio1");
      await sendOne(email, "frio1", { firstName: await firstName(db, null, email), payUrl: url });
      sent++;
      lastAt = at;
    } catch (err) {
      const message = (err as Error).message;
      errors.push(message.slice(0, 120));
      await db.from("recovery_email_log").delete().eq("email", email).eq("kind", "frio1");
      if (/quota|limit/i.test(message) || errors.length >= 3) break;
    }
  }
  return { ...base, enviados: sent, ate: lastAt ? new Date(lastAt).toISOString().slice(0, 10) : null, restantes: queue.length - sent, erros: errors };
}

/**
 * Campanha da Black Friday: não faz nada fora das datas de BF_CAMPAIGN.
 * Ex-assinantes recebem a sequência bf1 a bf6; quem deixou o e-mail entra 3 dias depois de deixar;
 * assinante ativo recebe só "novidades". Cada tipo sai 1 vez por e-mail.
 */
async function runBlackFriday(db: ReturnType<typeof adminClient>, limit: number) {
  const startMs = Date.parse(BF_CAMPAIGN.start);
  if (Date.now() < Date.parse(BF_CAMPAIGN.novidades) || Date.now() >= Date.parse(BF_CAMPAIGN.end) || limit <= 0) return { active: false, sent: 0 };

  const { data: subs } = await db.from("subscriptions").select("user_id,status,current_period_end,created_at");
  const isActive = (s: any) => ["active", "trialing"].includes(s.status) && (!s.current_period_end || Date.parse(s.current_period_end) > Date.now());
  const userIds = (subs ?? []).map((s: any) => s.user_id);
  const { data: profiles } = userIds.length ? await db.from("profiles").select("user_id,email").in("user_id", userIds) : { data: [] as any[] };
  const emailOf = new Map((profiles ?? []).map((p: any) => [p.user_id, String(p.email ?? "").toLowerCase().trim()]));
  const active = new Set<string>();
  const former = new Set<string>();
  // Quem assinou durante a campanha já comprou a oferta: não recebe o e-mail de novidades com ela.
  const joinedNow = new Set<string>();
  for (const sub of subs ?? []) {
    const email = emailOf.get(sub.user_id);
    if (!email) continue;
    (isActive(sub) ? active : former).add(email);
    if (isActive(sub) && Date.parse(sub.created_at) >= startMs) joinedNow.add(email);
  }
  for (const email of active) former.delete(email);

  const { data: captures } = await db.from("email_captures").select("email,first_seen_at,metadata");
  const leads = (captures ?? [])
    .filter((c: any) => (c.metadata?.funnel === "inicio" || String(c.metadata?.redirect ?? "").startsWith("/onboarding")) && Date.now() - Date.parse(c.first_seen_at) >= BF_LEAD_WAIT_HOURS * HOUR)
    .map((c: any) => String(c.email ?? "").toLowerCase().trim())
    // E-mail com erro de digitação volta como rejeição: fica fora da campanha.
    .filter((email: string) => email && !active.has(email) && COLD_VALID.test(email) && !COLD_NOT_REAL.test(email) && !COLD_TYPO.test(email));
  const neverSubscribed = new Set(leads.filter((email: string) => !former.has(email)));
  for (const email of leads) former.add(email);

  const { data: unsubs } = await db.from("email_unsubscribes").select("email");
  const { data: logs } = await db.from("recovery_email_log").select("email,kind").or("kind.like.bf%,kind.eq.novidades");
  const skip = new Set((unsubs ?? []).map((u: any) => u.email));
  const sentKinds = new Set((logs ?? []).map((l: any) => `${l.email}:${l.kind}`));
  const days = (Date.now() - startMs) / (24 * HOUR);
  const due = days >= 0 ? BF_KINDS.find((k) => days >= BF_SCHEDULE_DAYS[k]) : undefined;

  const queue: { email: string; kind: RecoveryKind }[] = [];
  if (due) for (const email of former) if (!skip.has(email) && !sentKinds.has(`${email}:${due}`)) queue.push({ email, kind: due });
  const gotOffer = new Set((logs ?? []).filter((l: any) => String(l.kind).startsWith("bf")).map((l: any) => l.email));
  for (const email of active) {
    if (skip.has(email) || joinedNow.has(email) || gotOffer.has(email) || sentKinds.has(`${email}:novidades`)) continue;
    queue.push({ email, kind: "novidades" });
  }

  // O que não couber hoje sai nas próximas rodadas. Quem recebeu menos e-mails da campanha vai primeiro,
  // para que quem ficou de fora no dia 29 receba o último aviso no dia 30.
  const received = new Map<string, number>();
  for (const l of logs ?? []) received.set(l.email, (received.get(l.email) ?? 0) + 1);
  queue.sort((a, b) => (received.get(a.email) ?? 0) - (received.get(b.email) ?? 0));
  const { count: lastDay } = await db.from("recovery_email_log").select("email", { count: "exact", head: true })
    .gte("sent_at", new Date(Date.now() - 24 * HOUR).toISOString());
  const allowed = Math.min(limit, Math.max(0, BF_DAILY_CAP - (lastDay ?? 0)));

  let sent = 0;
  for (const item of queue) {
    if (sent >= allowed) break;
    const { error: logErr } = await db.from("recovery_email_log").insert({ email: item.email, kind: item.kind });
    if (logErr) continue;
    try {
      const url = item.kind === "novidades"
        ? await campaignLink(db, item.email, "/fabrica", "novidades", "novidades")
        : await campaignLink(db, item.email, "/black-friday", "winback", item.kind);
      await sendOne(item.email, item.kind, { firstName: await firstName(db, null, item.email), payUrl: url, neverSubscribed: neverSubscribed.has(item.email) });
      sent++;
    } catch (err) {
      console.error("[BLACK-FRIDAY]", (err as Error).message);
      await db.from("recovery_email_log").delete().eq("email", item.email).eq("kind", item.kind);
      if (/quota/i.test((err as Error).message)) break;
    }
  }
  console.log("[BLACK-FRIDAY] Execução", { fila: queue.length, permitidos: allowed, sent });
  return { active: true, sent, queue: queue.length };
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

  // ── Quem pode rodar: servidor (service role), admin, ou o pg_cron com a chave pública ──
  // Sem ser servidor nem admin, só a rodada normal (sem teste) e no máximo 1 vez a cada 20 min.
  // Cada e-mail já é mandado 1 vez só por pessoa (recovery_email_log), então repetir não reenvia nada.
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const isServer = Boolean(serviceKey) && req.headers.get("Authorization") === `Bearer ${serviceKey}`;
  let adminEmail: string | null = null;
  if (!isServer) {
    const user = await userFromRequest(req, db);
    if (user) {
      const { data: role } = await db.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (role) adminEmail = user.email?.toLowerCase() ?? null;
    }
  }

  const body = await req.json().catch(() => ({}));
  if (!isServer && !adminEmail) {
    if (body?.test_to) return json({ error: "Só admin" }, 403);
    if (!(await claimJobRun(db, "recovery-emails", 20 * 60 * 1000))) return json({ skipped: "já rodou nos últimos 20 min" });
  }

  // ── Teste (admin): manda um modelo para um e-mail, sem registrar ──
  if (body?.test_to) {
    if (!adminEmail && !isServer) return json({ error: "Só admin" }, 403);
    const kind: RecoveryKind = ["pronta", "desconto", "contato", "lead1", "lead2", "lead3", "lead4", "lead5", "lead6", "bf1", "bf2", "bf3", "bf4", "bf5", "bf6", "frio1", "novidades"].includes(body.kind) ? body.kind : "pronta";
    const to = String(body.test_to).toLowerCase().trim();
    const testUrl = kind.startsWith("bf") || kind === "frio1"
      ? `${canonicalSiteUrl()}/black-friday?utm_source=email&utm_medium=winback&utm_campaign=${kind}`
      : `${canonicalSiteUrl()}/checkout?plano=annual&metodo=pix`;
    await sendOne(to, kind, { firstName: "Lucas", payUrl: testUrl, neverSubscribed: Boolean(body.never_subscribed) });
    return json({ test: true, sent: kind, to });
  }

  // ── Lista fria (admin): quem só deixou o e-mail, do mais antigo ao mais novo ──
  if (body?.cold_list) {
    if (!adminEmail && !isServer) return json({ error: "Só admin" }, 403);
    const limit = Math.max(0, Math.floor(Number(body.limit) || 0));
    return json(await runColdList(db, limit, Boolean(body.dry_run), Boolean(body.only_proven)));
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

  // Quem deixou o e-mail na página inicial ou fez o quiz e não chegou ao pagamento.
  const leadEmails = new Set<string>();
  const leadSince = new Date(Date.now() - LEAD_MAX_AGE_HOURS * HOUR).toISOString();
  const { data: captures } = await db.from("email_captures").select("email,first_seen_at,last_seen_at,metadata").gte("last_seen_at", leadSince);
  for (const c of captures ?? []) {
    const meta = (c.metadata ?? {}) as { funnel?: string; redirect?: string | null };
    if (meta.funnel !== "inicio" && !String(meta.redirect ?? "").startsWith("/onboarding")) continue;
    const email = String(c.email ?? "").toLowerCase().trim();
    if (!email || byEmail.has(email)) continue;
    // Durante a campanha, quem já entrou nela não recebe também a sequência de preço cheio.
    if (bfRunning() && Date.now() - Date.parse(c.first_seen_at) >= BF_LEAD_WAIT_HOURS * HOUR) continue;
    byEmail.set(email, { email, userId: null, plan: "annual", method: "pix", at: Date.parse(c.last_seen_at), paid: false });
    leadEmails.add(email);
  }

  const emails = [...byEmail.keys()].filter((e) => !paidEmails.has(e));
  if (!emails.length) return json({ candidates: 0, sent: 0, blackFriday: await runBlackFriday(db, MAX_PER_RUN) });

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
    const isLead = leadEmails.has(email);
    const due: RecoveryKind | undefined = isLead
      ? LEAD_KINDS.find((k) => hours >= LEAD_SCHEDULE_HOURS[k])
      : KINDS.find((k) => hours >= RECOVERY_SCHEDULE_HOURS[k]);
    if (!due || sentKinds.get(email)?.has(due)) continue;

    // Assinatura ativa (pagou por outro caminho): não manda.
    if (!attempt.userId) {
      const { data: profile } = await db.from("profiles").select("user_id").eq("email", email).maybeSingle();
      attempt.userId = profile?.user_id ?? null;
    }
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
      const payUrl = isLead
        ? await resumeLink(db, email, due)
        : due === "pronta" ? await payLink(db, email, attempt.plan, attempt.method) : `${canonicalSiteUrl()}/checkout`;
      await sendOne(email, due, { firstName: name, payUrl });
      sent++;
    } catch (err) {
      errors.push(`${email.slice(0, 3)}***: ${(err as Error).message}`);
      await db.from("recovery_email_log").delete().eq("email", email).eq("kind", due);
    }
  }

  console.log("[RECOVERY] Execução", { candidates: emails.length, sent, errors: errors.length });
  return json({ candidates: emails.length, sent, errors, blackFriday: await runBlackFriday(db, MAX_PER_RUN - sent) });
});
