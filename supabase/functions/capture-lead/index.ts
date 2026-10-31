// Guarda o e-mail digitado na página inicial e as etapas do quiz de quem está sem sessão.
// Pública: não entrega dado nenhum de volta, só registra. Quem está logado usa o track normal.
import { adminClient } from "../_shared/wooviAuth.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const ok = () => new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const short = (v: unknown) => (typeof v === "string" ? v.slice(0, 40) : null);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return new Response("Método não permitido", { status: 405, headers: cors });

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").toLowerCase().trim().slice(0, 200);
    if (!EMAIL.test(email)) return ok();
    const db = adminClient();
    const event = body?.event;

    if (event === "lead") {
      await db.rpc("capture_email", { p_email: email, p_source: "inicio", p_metadata: { funnel: "inicio" } });
      return ok();
    }
    if (event !== "step" && event !== "plan") return ok();

    await db.rpc("capture_email", {
      p_email: email,
      p_source: "inicio",
      p_metadata: { funnel: "inicio", quiz_step: Number(body?.step) || null, quiz_kind: short(body?.kind) },
    });

    // Quem já tem conta aparece no funil da Gestão, que lê os eventos por usuário.
    const { data: profile } = await db.from("profiles").select("user_id").eq("email", email).maybeSingle();
    if (profile?.user_id) {
      await db.from("analytics_events").insert({
        user_id: profile.user_id,
        session_id: `quiz-anon-${crypto.randomUUID()}`,
        event_type: event === "plan" ? "plan_selected" : "onboarding_step",
        event_data: {
          step: Number(body?.step) || null,
          kind: short(body?.kind),
          key: short(body?.key),
          billing_cycle: short(body?.billing_cycle),
          ingestion: "quiz_sem_sessao_v1",
        },
        url_path: "/onboarding",
      });
    }
    return ok();
  } catch (err) {
    console.error("capture-lead:", err);
    return ok();
  }
});
