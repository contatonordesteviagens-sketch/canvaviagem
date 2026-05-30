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
    const { format, destination, price, highlights, promoName, currencySymbol, duration } = body;
    const isStory = format === "story";

    const promptText = `Crie um layout moderno e de alta conversão para um pacote de viagem.
Destino: ${destination}
Preço: ${currencySymbol} ${price}
Duração: ${duration}
Destaques: ${highlights ? highlights.join(", ") : ""}
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
      "content": "${destination.toUpperCase()}",
      "fontSize": 64,
      "fontFamily": "Inter",
      "color": "#FFFFFF",
      "fontWeight": "bold"
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
