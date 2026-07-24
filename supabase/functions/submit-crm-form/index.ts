import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type FormField = {
  id: string;
  label?: string;
  required?: boolean;
  visible?: boolean;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const cleanText = (value: unknown, max = 500) =>
  String(value ?? "")
    .trim()
    .slice(0, max);

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const raw = await req.text();
    if (raw.length > 30_000) {
      return json({ error: "Payload too large" }, 413);
    }

    const body = JSON.parse(raw);
    const formId = cleanText(body.form_id || body.embed_key, 140);
    if (!formId || !/^[a-zA-Z0-9_-]{3,140}$/.test(formId)) {
      return json({ error: "Invalid form_id" }, 400);
    }

    const payload = typeof body.payload === "object" && body.payload !== null && !Array.isArray(body.payload)
      ? body.payload
      : {};
    const normalized = typeof body.normalized === "object" && body.normalized !== null && !Array.isArray(body.normalized)
      ? body.normalized
      : {};

    if (payload.website || payload.company_url || payload.fax_number) {
      return json({ ok: true, spam: true });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: form, error: formError } = await supabase
      .from("crm_forms")
      .select("id, owner_id, project_id, fields, status")
      .or(`id.eq.${formId},embed_key.eq.${formId}`)
      .eq("status", "active")
      .maybeSingle();

    if (formError) throw formError;
    if (!form) return json({ error: "Form not found" }, 404);

    // Limite por formulário + origem. A RPC é adicionada pela migration nova;
    // durante um rollout gradual, a ausência temporária dela não derruba leads.
    const forwardedIp = cleanText(
      req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0],
      80,
    );
    const fingerprint = await sha256(`${forwardedIp || "unknown"}|${cleanText(req.headers.get("user-agent"), 240)}`);
    const { data: rateAllowed, error: rateError } = await supabase.rpc("check_crm_form_rate_limit", {
      p_form_id: form.id,
      p_fingerprint: fingerprint,
      p_limit: 8,
      p_window_seconds: 600,
    });
    if (rateError) {
      console.warn("crm rate limit unavailable during rollout", rateError.message);
    } else if (rateAllowed === false) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "600" },
      });
    }

    const fields = Array.isArray(form.fields) ? (form.fields as FormField[]) : [];
    const payloadRecord = payload as Record<string, unknown>;
    const submittedFieldIds = new Set(Object.keys(payloadRecord));
    const missing = fields
      .filter((field) => field.visible !== false && field.required)
      // O site principal, o pop-up rápido e formulários incorporados podem
      // exibir subconjuntos diferentes do mesmo formulário canônico. Campos
      // enviados continuam validados; campos que essa variante não renderizou
      // não transformam uma captura legítima em fallback invisível.
      .filter((field) => submittedFieldIds.has(field.id))
      .filter((field) => !cleanText(payloadRecord[field.id], 1000))
      .map((field) => field.label || field.id);

    if (missing.length) {
      return json({ error: "Missing required fields", missing }, 400);
    }

    if (!Object.values(payloadRecord).some((value) => cleanText(value, 1000))) {
      return json({ error: "Empty submission" }, 400);
    }

    const payloadName = cleanText(payloadRecord.nome ?? payloadRecord.name, 180);
    const payloadEmail = cleanText(payloadRecord.email, 180);
    const payloadPhone = cleanText(payloadRecord.wpp ?? payloadRecord.phone, 80);
    if (!payloadName || (!payloadEmail && !payloadPhone)) {
      return json({ error: "Name and contact are required" }, 400);
    }

    const normalizedName = cleanText((normalized as Record<string, unknown>).name || payloadName, 180);
    const normalizedEmail = cleanText((normalized as Record<string, unknown>).email || payloadEmail, 180);
    const normalizedPhone = cleanText((normalized as Record<string, unknown>).phone || payloadPhone, 80);
    const normalizedInterest = cleanText((normalized as Record<string, unknown>).interest, 180);

    const { data: submission, error: insertError } = await supabase
      .from("crm_form_submissions")
      .insert({
        form_id: form.id,
        owner_id: form.owner_id,
        payload,
        normalized_name: normalizedName || null,
        normalized_email: normalizedEmail || null,
        normalized_phone: normalizedPhone || null,
        normalized_interest: normalizedInterest || null,
        source_url: cleanText(body.source_url, 1000) || null,
        source_domain: cleanText(body.source_domain, 180) || null,
        user_agent: cleanText(body.user_agent, 500) || null,
        utm_source: cleanText(body.utm_source, 120) || null,
        utm_medium: cleanText(body.utm_medium, 120) || null,
        utm_campaign: cleanText(body.utm_campaign, 120) || null,
        status: "novo",
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    await supabase.from("analytics_events").insert({
      user_id: form.owner_id,
      event_type: "lead_captured",
      session_id: `crm_${crypto.randomUUID()}`,
      event_data: {
        ...normalized,
        agency_id: form.owner_id,
        project_id: form.project_id || form.id,
        form_id: form.id,
        source_domain: cleanText(body.source_domain, 180),
        submission_id: submission.id,
        status: "novo",
        ingestion: "validated_v1",
      },
    });

    return json({ ok: true, id: submission.id });
  } catch (error) {
    console.error("submit-crm-form error", error);
    return json({ error: "Internal error" }, 500);
  }
});
