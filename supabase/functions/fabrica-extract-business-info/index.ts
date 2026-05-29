import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const bodyData = await req.json();
    const { type, content, geminiApiKey } = bodyData;
    
    // API KEY usually injected by Supabase secrets or passed from client
    const apiKey = geminiApiKey || Deno.env.get("USER_GEMINI_API_KEY") || Deno.env.get("IA_PURA_GEMINI_KEY") || Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("API Key for Gemini is missing");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Você é um extrator de informações de negócios focado em Agências de Viagens.
Analise as informações fornecidas (texto de um site, conteúdo de um PDF ou descrição) e extraia um JSON estruturado.
O JSON DEVE ter o seguinte formato estrito:
{
  "agencyName": "Nome da agência ou empresa, se encontrado. Se não achar, string vazia",
  "niche": "Qual o tipo de agência (ex: autonoma, luxo, ecoturismo, etc). Se não achar, string vazia",
  "destinos": ["Destino 1", "Destino 2"],
  "packages": [
    {
      "title": "Nome do pacote (ex: Jericoacoara Mágico 4 Dias)",
      "description": "Lista simples em string do que está incluso (ex: ✔ Transporte ✔ Hospedagem)",
      "price": "Preço exato ou estimativa formatada (ex: R$ 450,00 ou Consulte)"
    }
  ]
}
Não retorne blocos de código (markdown \`\`\`json) na resposta, apenas o JSON puro, que será processado com JSON.parse(). Extraia o máximo de pacotes que conseguir.
`;

    let result;

    if (type === 'text') {
      // Direct text or scraped HTML text
      result = await model.generateContent([prompt, content]);
    } else if (type === 'pdf') {
      // Base64 PDF
      const pdfPart = {
        inlineData: {
          data: content.split(',')[1] || content,
          mimeType: "application/pdf"
        }
      };
      result = await model.generateContent([prompt, pdfPart]);
    } else if (type === 'image') {
      // Base64 Image
      const imagePart = {
        inlineData: {
          data: content.split(',')[1] || content,
          mimeType: "image/jpeg"
        }
      };
      result = await model.generateContent([prompt, imagePart]);
    } else if (type === 'images') {
      // Array of Base64 Images
      const parts = content.map((imgStr: string) => ({
        inlineData: {
          data: imgStr.split(',')[1] || imgStr,
          mimeType: "image/jpeg"
        }
      }));
      result = await model.generateContent([prompt, ...parts]);
    } else {
      throw new Error("Invalid type provided.");
    }

    const responseText = result.response.text().trim().replace(/^```json/, '').replace(/```$/, '').trim();
    let parsedJson;
    try {
      parsedJson = JSON.parse(responseText);
    } catch (e) {
      // Fallback se o JSON vier um pouco sujo
      console.error("Erro no parse JSON", responseText);
      throw new Error("O modelo não retornou um JSON válido.");
    }

    return new Response(JSON.stringify(parsedJson), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating extraction:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to extract info" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
