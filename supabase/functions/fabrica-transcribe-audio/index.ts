// Transcrição de áudio via Lovable AI Gateway (OpenAI gpt-4o-mini-transcribe)
// Recebe multipart/form-data com `file`. Retorna SSE (default) ou JSON (?stream=false).

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
    upstream.append("model", "openai/whisper-1");
    upstream.append("file", file, filename);
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
    return new Response(JSON.stringify(data), {
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
