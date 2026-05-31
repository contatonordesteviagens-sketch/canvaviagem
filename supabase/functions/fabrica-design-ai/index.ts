import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/fabricaAccess.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { format, destination, price, highlights, promoName, currencySymbol, duration, primaryColor, secondaryColor } = body;
    const isStory = format === "story";

    const promptText = `Crie um layout moderno e de alta conversão para um pacote de viagem.
Destino: ${destination}
Preço: ${currencySymbol} ${price}
Duração: ${duration}
Destaques: ${highlights ? highlights.join(", ") : ""}
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
Apenas o JSON, sem markdown.`;

    let provider = "gemini";
    let jsonOutput = null;

    if (GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          }
        }),
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        jsonOutput = JSON.parse(data.candidates[0].content.parts[0].text);
      }
    }

    if (!jsonOutput) {
      throw new Error("Failed to generate layout JSON");
    }

    return new Response(JSON.stringify({ provider, layout: jsonOutput }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
