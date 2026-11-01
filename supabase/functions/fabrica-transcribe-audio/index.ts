// Transcrição de áudio via Lovable AI Gateway (OpenAI gpt-4o-mini-transcribe)
// Recebe multipart/form-data com `file`. Retorna SSE (default) ou JSON (?stream=false).

import { verifyFabricaEliteAccess } from "../_shared/fabricaAccess.ts";
import { adminClient } from "../_shared/wooviAuth.ts";

// Cada áudio custa crédito de IA. O limite é por cliente, por dia de Brasília.
const DAILY_AUDIO_LIMIT = 10;
const AUDIO_EVENT = "audio_transcrito";

function startOfBrasiliaDay() {
  const day = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return `${day}T03:00:00.000Z`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MIME_TO_EXT: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/wave": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const access = await verifyFabricaEliteAccess(req, corsHeaders);
    if (!access.ok) return access.response;

    const db = adminClient();
    const { count: audiosHoje, error: countError } = await db
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", access.userId)
      .eq("event_type", AUDIO_EVENT)
      .gte("created_at", startOfBrasiliaDay());
    if (countError) console.error("Limite de áudio: falha na contagem", countError.message);
    const usados = audiosHoje ?? 0;
    if (usados >= DAILY_AUDIO_LIMIT) {
      return new Response(
        JSON.stringify({ error: "Você já mandou os áudios de hoje. Amanhã libera de novo. Enquanto isso, é só digitar." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ error: "Request must be multipart/form-data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Missing 'file' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (file.size < 1024) {
      return new Response(
        JSON.stringify({ error: "Áudio muito curto. Tente gravar novamente." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (file.size > 25 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Áudio acima de 25MB. Reduza o tempo de gravação." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const wantStream = url.searchParams.get("stream") !== "false";

    const mime = (file.type || "audio/webm").split(";")[0];
    const ext = MIME_TO_EXT[mime] || "webm";
    const filename = `recording.${ext}`;

    const upstream = new FormData();
    upstream.append("model", "openai/gpt-4o-mini-transcribe");
    upstream.append("file", file, filename);
    // Sem idioma explícito, falas curtas vêm transcritas em inglês.
    upstream.append("language", url.searchParams.get("language") === "es" ? "es" : "pt");
    if (wantStream) upstream.append("stream", "true");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
        body: upstream,
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Transcribe upstream error", response.status, errText);
      return new Response(
        JSON.stringify({ error: `Transcribe failed: ${response.status}`, detail: errText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: logError } = await db.from("analytics_events").insert({
      user_id: access.userId,
      session_id: `audio-${crypto.randomUUID()}`,
      event_type: AUDIO_EVENT,
      event_data: {},
      url_path: "/fabrica",
    });
    if (logError) console.error("Limite de áudio: falha ao registrar", logError.message);

    if (wantStream) {
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ ...data, audios_restantes: DAILY_AUDIO_LIMIT - usados - 1 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("fabrica-transcribe-audio error", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
