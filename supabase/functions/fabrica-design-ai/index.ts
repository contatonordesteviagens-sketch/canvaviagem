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
    const { 
      format, 
      destination, 
      price, 
      highlights, 
      promoName, 
      currencySymbol, 
      duration, 
      primaryColor, 
      secondaryColor,
      variation
    } = body;
    const isStory = format === "story";
    const width = 1080;
    const height = isStory ? 1920 : 1080;
    const safeY = isStory ? 1500 : 850;

    const inputPrimary = primaryColor || "#0C2340";
    const inputSecondary = secondaryColor || "#F59E0B";

    // CONSTANTES PARA IMAGENS GOLDEN STANDARD (BASE64)
    // TODO: Insert Base64 Square Image here
    const SQUARE_GOLDEN_REF_BASE64 = "";

    // TODO: Insert Base64 Story Image here
    const STORY_GOLDEN_REF_BASE64 = "";

    const referenceImageBase64 = isStory ? STORY_GOLDEN_REF_BASE64 : SQUARE_GOLDEN_REF_BASE64;

    const promptText = `Você é um Engenheiro de UI/UX sênior e Diretor de Arte de alta fidelidade.
Seu objetivo é projetar e compor matematicamente um layout de anúncio de viagem impressionante sobre uma imagem de fundo (que já está inserida no canvas).
Você deve calcular e posicionar perfeitamente as caixas de fundo e os textos para que nada fique desalinhado ou ultrapasse a tela.

DIMENSÕES DO CANVAS E REGRAS DE LAYOUT:
- Largura (width): ${width}px
- Altura (height): ${height}px
- ZONA MORTA (RODAPÉ): Nunca posicione nenhuma caixa ou texto abaixo de Y = ${safeY}px (Y > ${safeY} é reservado estritamente para o branding/logo e contatos da agência que serão renderizados por cima).

CORES OBRIGATÓRIAS DA IDENTIDADE DO CLIENTE:
- Cor Primária (Fundo dos cartões/caixas principais, painéis): ${inputPrimary}
- Cor Secundária (Destaques comerciais, badges, faixas secundárias, preços, pílulas de destaque): ${inputSecondary}
- Para textos sobre fundo escuro (como ${inputPrimary}), use a cor branca ("#FFFFFF"). Para textos sobre fundo claro, use preto/cinza-escuro ("#111111").

DADOS DINÂMICOS DO PACOTE DE VIAGEM A INSERIR NO DESIGN:
- Destino/Título Principal: ${destination}
- Preço: ${currencySymbol} ${price}
- Período/Duração: ${duration}
- Benefícios/Highlights (Gere pequenas caixas ou linhas para estes itens): ${Array.isArray(highlights) ? highlights.join(", ") : ""}
- Chamada da Promoção (badge de destaque): ${promoName}

CRITICAL INSTRUCTION: You are designing for a ${format} canvas. Look at the attached reference image. It represents the perfect structural layout, visual balance, and mathematical alignment (Golden Standard) for this specific format. 
Your task is to generate a JSON array of 'elements' (type, x, y, width, height, backgroundColor, color, fontSize, content) that MIMICS the exact positioning, padding, and hierarchy seen in this reference image. 
For Stories (9:16), ensure Y-coordinates respect safe zones (do not place elements below Y=1700).
Apply the user's specific text (Destination, Price, Highlights) and exact colors (Primary: ${inputPrimary}, Secondary: ${inputSecondary}).

CRITICAL REQUIREMENT FOR DIVERSITY:
This is generation request number: ${variation || 1}. You MUST use this variation seed to design a radically unique structural layout:
- If variation is 1: Focus strictly on bottom-heavy layouts (main cards, prices, and benefits aligned at the bottom of the canvas, between Y = ${isStory ? 800 : 450} and Y = ${safeY}).
- If variation is 2: Focus strictly on split/sidebar layouts (main boxes and elements aligned horizontally either strictly to the left or strictly to the right).
- If variation is 3: Focus strictly on floating, minimalist, highly transparent cards or central capsules located near the center of the canvas.
DO NOT repeat the same coordinates from previous variations. Maximize structural variety!

GERAÇÃO DO DESIGN:
Você deve planejar o layout criando uma composição harmoniosa. Insira:
1. Pelo menos uma caixa de fundo de cartão ("box") com cantos arredondados usando a Cor Primária (${inputPrimary}) ou uma opacidade translúcida como "rgba(12, 35, 64, 0.85)".
2. Elementos de texto ("text") posicionados perfeitamente em cima dessas caixas, calculando corretamente o 'x', 'y', 'width' (largura disponível) e 'height'.
3. Uma pílula de destaque/badge ("box") com a Cor Secundária (${inputSecondary}) para destacar a chamada "${promoName}".
4. O preço em tamanho de fonte gigante (ex: 64px a 96px) posicionado para alto impacto.
5. Outros detalhes (período, lista de benefícios) organizados de forma limpa.

Retorne EXCLUSIVAMENTE um objeto JSON válido contendo a raiz 'elements' (array de objetos). Não envolva em markdown. Não escreva explicações fora do JSON.
Cada elemento no array 'elements' deve seguir estritamente um destes formatos:

Se type for "box":
{
  "type": "box",
  "x": number,
  "y": number,
  "width": number,
  "height": number,
  "backgroundColor": string (aceita hex ou rgba),
  "borderColor": string (opcional),
  "borderWidth": number (opcional),
  "borderRadius": number (opcional)
}

Se type for "text":
{
  "type": "text",
  "x": number,
  "y": number,
  "width": number,
  "height": number,
  "content": string (texto dinâmico mapeado),
  "color": string (hex/rgb),
  "fontSize": number (em pixels),
  "fontFamily": "Inter" | "Playfair Display" | "Arial",
  "fontWeight": "bold" | "normal" | "900",
  "textAlign": "left" | "center" | "right"
}

Retorne APENAS o JSON puro.`;

    const parts: any[] = [];
    if (referenceImageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: referenceImageBase64
        }
      });
    }
    parts.push({ text: promptText });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `Você é um Engenheiro de UI/UX sênior e Diretor de Arte especializado em compor coordenadas matemáticas precisas de elementos gráficos em Canvas (1080x1080 ou 1080x1920) para anúncios de turismo premium de luxo. Sua única função é calcular coordenadas sem colisão e retornar a lista estruturada de elementos in JSON.` }],
        },
        contents: [
          { role: "user", parts },
        ],
        generationConfig: {
          temperature: 1.0,
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
      throw new Error("JSON de layout dinâmico inválido.");
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
