import { verifyFabricaEliteAccess } from "../_shared/fabricaAccess.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SYSTEM_PROMPT = `Você é um mentor sênior em neurovendas e fechamento de turismo.
Ajude agentes de viagens a responder clientes no WhatsApp de forma ética, curta e consultiva.

Regras:
1. Cada resposta sugerida deve ter no máximo 2 ou 3 frases.
2. Priorize benefício e clareza, sem inventar preço, disponibilidade ou condições.
3. Termine as opções com uma pergunta útil; use dupla escolha somente quando for natural.
4. Não prometa resultado garantido e não use pressão enganosa.
5. Responda em português brasileiro.
6. Retorne somente JSON válido, sem markdown, no formato:
{
  "analysis": "feedback curto para o agente",
  "options": [
    {
      "content": "resposta pronta",
      "technique": "nome curto da técnica",
      "methodology": "por que funciona",
      "psychologyTip": "orientação prática",
      "branches": {
        "positive": "próxima resposta se o cliente aceitar",
        "negative": "próxima resposta se o cliente recusar"
      }
    }
  ]
}
Gere exatamente 3 opções.`;

type HistoryItem = {
  role?: unknown;
  content?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseModelJson(value: unknown) {
  if (typeof value !== "string") return null;
  const cleaned = value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Método não permitido" }, 405);

  try {
    const access = await verifyFabricaEliteAccess(req, corsHeaders);
    if (!access.ok) return access.response;

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) return jsonResponse({ error: "IA temporariamente indisponível" }, 503);

    const body = await req.json().catch(() => ({}));
    const currentInput = cleanText(body.currentInput, 2500);
    if (!currentInput) return jsonResponse({ error: "Escreva a mensagem do cliente" }, 400);

    const history = Array.isArray(body.history)
      ? (body.history as HistoryItem[])
          .slice(-6)
          .map((item) => ({
            role: item?.role === "user" ? "Agente" : "Mentor",
            content: cleanText(item?.content, 1200),
          }))
          .filter((item) => item.content)
      : [];

    const profileName = cleanText(body.userProfile?.full_name, 120) || "agente";
    const agencyName = cleanText(body.userProfile?.agency_name, 160);
    const conversationContext = history.length
      ? history.map((item) => `${item.role}: ${item.content}`).join("\n")
      : "Sem histórico anterior.";

    const prompt = `Agente: ${profileName}
Agência: ${agencyName || "não informada"}

Contexto recente:
${conversationContext}

Mensagem atual do cliente:
${currentInput}

Analise a oportunidade e gere 3 respostas prontas.`;

    const image = typeof body.image === "string" ? body.image : "";
    if (image && (!image.startsWith("data:image/") || image.length > 7_000_000)) {
      return jsonResponse({ error: "A imagem precisa ter no máximo 5 MB" }, 413);
    }

    const userContent = image
      ? [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: image } },
        ]
      : prompt;

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      console.error("[VENDEDOR-IA] upstream", upstream.status, detail.slice(0, 300));
      if (upstream.status === 429) {
        return jsonResponse({ error: "Muitas solicitações. Tente novamente em instantes." }, 429);
      }
      return jsonResponse({ error: "Não foi possível gerar as respostas agora" }, 502);
    }

    const payload = await upstream.json();
    const parsed = parseModelJson(payload?.choices?.[0]?.message?.content);
    if (!parsed || !Array.isArray(parsed.options)) {
      return jsonResponse({ error: "A IA retornou uma resposta incompleta. Tente novamente." }, 502);
    }

    const options = parsed.options
      .slice(0, 3)
      .map((option: Record<string, unknown>) => ({
        content: cleanText(option?.content, 1200),
        technique: cleanText(option?.technique, 120),
        rationale: "",
        methodology: cleanText(option?.methodology, 500),
        source: "",
        psychologyTip: cleanText(option?.psychologyTip, 500),
        branches: {
          positive: cleanText((option?.branches as Record<string, unknown>)?.positive, 700),
          negative: cleanText((option?.branches as Record<string, unknown>)?.negative, 700),
        },
      }))
      .filter((option: { content: string }) => option.content);

    if (!options.length) {
      return jsonResponse({ error: "A IA não gerou opções válidas. Tente novamente." }, 502);
    }

    return jsonResponse({
      text: cleanText(parsed.analysis, 1000) || "Preparei opções objetivas para esta conversa.",
      options,
    });
  } catch (error) {
    console.error("[VENDEDOR-IA]", error);
    return jsonResponse({ error: "Serviço temporariamente indisponível" }, 500);
  }
});
