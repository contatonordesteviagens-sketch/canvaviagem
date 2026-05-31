import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/fabricaAccess.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada no servidor." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { format, destination, price, highlights, promoName, currencySymbol, duration } = body;
    const isStory = format === "story";

    const promptText = `Crie um layout moderno e de alta conversão para um pacote de viagem.
Destino: ${destination}
Preço: ${currencySymbol} ${price}
Duração: ${duration}
Destaques: ${Array.isArray(highlights) ? highlights.join(", ") : ""}
Promoção: ${promoName}

O formato do canvas é ${isStory ? "1080x1920" : "1080x1080"}.
Crie blocos translúcidos e posicionamento de textos.

Retorne EXCLUSIVAMENTE um JSON válido com a estrutura:
{
  "elements": [
    {
      "type": "box",
      "x": 50,
      "y": ${isStory ? "1400" : "800"},
      "width": 980,
      "height": 200,
      "backgroundColor": "rgba(0,0,0,0.6)",
      "borderRadius": 24
    },
    {
      "type": "text",
      "x": 100,
      "y": ${isStory ? "1450" : "850"},
      "content": "${(destination || "DESTINO").toUpperCase()}",
      "fontSize": 64,
      "fontFamily": "Inter",
      "color": "#FFFFFF",
      "fontWeight": "bold"
    }
  ]
}
You MUST return ONLY the raw, minified JSON object. Do NOT wrap in markdown. Do NOT add any conversational text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a layout designer. Respond ONLY with raw minified JSON. No markdown, no prose." },
          { role: "user", content: promptText },
        ],
        temperature: 0.7,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace Lovable." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const errTxt = await response.text().catch(() => "");
      console.error("AI gateway error:", response.status, errTxt);
      return new Response(JSON.stringify({ error: "Falha no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawText: string = data?.choices?.[0]?.message?.content ?? "";
    if (!rawText) throw new Error("IA não retornou conteúdo.");

    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const jsonOutput = JSON.parse(cleaned.substring(start, end + 1));

    if (!jsonOutput || !Array.isArray(jsonOutput.elements)) {
      throw new Error("JSON de layout inválido.");
    }

    return new Response(JSON.stringify({ provider: "lovable_ai", layout: jsonOutput }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("fabrica-design-ai error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
