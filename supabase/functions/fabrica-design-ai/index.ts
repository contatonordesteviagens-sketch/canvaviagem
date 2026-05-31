import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyFabricaEliteAccess } from "../_shared/fabricaAccess.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_KEY = Deno.env.get("IA_PURA_GEMINI_KEY") || Deno.env.get("USER_GEMINI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const access = await verifyFabricaEliteAccess(req, corsHeaders);
    if (!access.ok) return access.response;

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Chave IA Pura não configurada no servidor. Adicione IA_PURA_GEMINI_KEY em Secrets." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { format, destination, price, highlights, promoName, currencySymbol, duration, primaryColor, secondaryColor } = body;
    const isStory = format === "story";

    const promptText = `Crie um layout moderno e de alta conversão para um pacote de viagem.
Destino: ${destination}
Preço: ${currencySymbol} ${price}
Duração: ${duration}
Destaques: ${Array.isArray(highlights) ? highlights.join(", ") : ""}
Promoção: ${promoName}

O formato do canvas é ${isStory ? "1080x1920" : "1080x1080"}.

CRITICAL COLOR RULES:
You MUST use the exact colors provided by the user:
- Primary Box Color (main dark elements background): ${primaryColor || "#0c2340"}.
- Highlight/Pill Color (accents or highlight badges): ${secondaryColor || "#FCD34D"}.
DO NOT invent other colors like orange, red, green, etc., unless they match the colors provided here.

CABRESTO ESPACIAL (GRID SYSTEM):
Siga este grid mental rigoroso no canvas de largura 1080px:
1. Título e Destaque: Posicionados com X=80 (alinhamento à esquerda). O width do texto do título não deve ultrapassar 920.
2. Card de Benefícios (Inclusos): Uma grande caixa (type 'box') no rodapé. Inicie em X=40, Y=${isStory ? "1100" : "650"}, width=1000, height=${isStory ? "520" : "300"}. A cor de fundo DEVE ser escura translúcida (ex: rgba(0,0,0,0.85)).
3. Preço e Inclusos: Devem ser gerados como textos ou pequenas pílulas aninhadas DENTRO das coordenadas do Card de Benefícios para que fiquem protegidas, coesas e não fiquem flutuando aleatoriamente.
Todos os elementos de texto devem respeitar estritamente estas coordenadas para não colidirem e não vazarem da tela.

Retorne EXCLUSIVAMENTE um JSON válido com a estrutura:
{
  "elements": [
    {
      "type": "box",
      "x": 40,
      "y": ${isStory ? "1100" : "650"},
      "width": 1000,
      "height": ${isStory ? "520" : "300"},
      "backgroundColor": "rgba(0,0,0,0.85)",
      "borderRadius": 24
    },
    {
      "type": "text",
      "x": 80,
      "y": ${isStory ? "400" : "200"},
      "content": "${destination.toUpperCase()}",
      "fontSize": 72,
      "fontFamily": "Inter",
      "color": "#FFFFFF",
      "fontWeight": "bold",
      "width": 920
    }
  ]
}
You MUST return ONLY the raw, minified JSON object. Do NOT wrap in markdown. Do NOT add any conversational text.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "You are a layout designer. Respond ONLY with raw minified JSON. No markdown, no prose." }],
        },
        contents: [
          { role: "user", parts: [{ text: promptText }] },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos da API de IA esgotados. Verifique a cobrança/limite da sua chave." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      return new Response(JSON.stringify({ error: "Chave IA Pura inválida, sem permissão ou com API desativada." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const errTxt = await response.text().catch(() => "");
      console.error("Gemini API error:", response.status, errTxt);
      return new Response(JSON.stringify({ error: "Falha na API de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawText: string = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") ?? "";
    if (!rawText) throw new Error("IA não retornou conteúdo.");

    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const jsonOutput = JSON.parse(cleaned.substring(start, end + 1));

    if (!jsonOutput || !Array.isArray(jsonOutput.elements)) {
      throw new Error("JSON de layout inválido.");
    }

    return new Response(JSON.stringify({ provider: "secure_gemini", layout: jsonOutput }), {
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
