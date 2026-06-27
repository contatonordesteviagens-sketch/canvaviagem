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

    const payload = typeof body.payload === "object" && body.payload !== null ? body.payload : {};
    const normalized = typeof body.normalized === "object" && body.normalized !== null ? body.normalized : {};

    if (payload.website || payload.company_url || payload.fax_number) {
      return json({ ok: true, spam: true });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: form, error: formError } = await supabase
      .from("crm_forms")
      .select("id, owner_id, fields, status")
      .or(`id.eq.${formId},embed_key.eq.${formId}`)
      .eq("status", "active")
      .maybeSingle();

    if (formError) throw formError;
    if (!form) return json({ error: "Form not found" }, 404);

    const fields = Array.isArray(form.fields) ? (form.fields as FormField[]) : [];
    const missing = fields
      .filter((field) => field.visible !== false && field.required)
      .filter((field) => !cleanText((payload as Record<string, unknown>)[field.id], 1000))
      .map((field) => field.label || field.id);

    if (missing.length) {
      return json({ error: "Missing required fields", missing }, 400);
    }

    const normalizedName = cleanText((normalized as Record<string, unknown>).name, 180);
    const normalizedEmail = cleanText((normalized as Record<string, unknown>).email, 180);
    const normalizedPhone = cleanText((normalized as Record<string, unknown>).phone, 80);
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
        form_id: form.id,
        source_domain: cleanText(body.source_domain, 180),
        submission_id: submission.id,
        status: "novo",
      },
    });

    return json({ ok: true, id: submission.id });
  } catch (error) {
    console.error("submit-crm-form error", error);
    return json({ error: "Internal error" }, 500);
  }
});
