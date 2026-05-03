// Edge function: fabrica-generate-ad
// Gera anúncios de turismo com Lovable AI (Google Gemini Flash Image Preview)
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getTemplateById, type MasterPromptVars } from "./master-prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Strategy = "ancora" | "vitrine" | "matriz" | "gancho";
type Format = "square" | "story";

interface Highlight {
  text: string;
  icon?: string;
}

interface AdParams {
  strategy: Strategy;
  format?: Format;
  photoOnly?: boolean;
  destination: string;
  niche?: string;
  agencyName?: string;
  agencyType?: string;
  city?: string;
  primaryColor?: string;
  secondaryColor?: string;
  hasLogo?: boolean;
  price?: string;
  installments?: string;
  promoName?: string;
  highlights?: (string | Highlight)[];
  ctaText?: string;
  variation?: number;
  templateId?: string;
  packageType?: string;
  duration?: string;
  forbiddenHeadlines?: string[];
  forbiddenLayouts?: string[];
}

// ===== Cena por nicho =====
function nicheToScene(niche?: string, destination?: string): string {
  const dest = destination || "destino brasileiro";
  switch ((niche || "").toLowerCase()) {
    case "nordeste":
      return `praia tropical paradisíaca de ${dest}, mar turquesa cristalino, falésias coloridas, areia clara, céu azul ensolarado`;
    case "sul":
      return `paisagem de ${dest}, arquitetura colonial europeia, vinícolas, montanhas verdes, clima ameno`;
    case "internacional":
      return `cartão-postal icônico de ${dest}, marcos arquitetônicos famosos, cenário cosmopolita`;
    case "cruzeiro":
      return `navio de cruzeiro luxuoso ancorado em baía de ${dest}, deck panorâmico, mar profundo`;
    case "aventura":
      return `paisagem natural selvagem de ${dest}, cachoeiras, trilhas, natureza preservada`;
    case "luademel":
      return `cenário romântico de ${dest}, pôr-do-sol dourado, atmosfera íntima`;
    default:
      return `paisagem deslumbrante de ${dest}, qualidade de cartão-postal, iluminação cinematográfica`;
  }
}

// ===== Safe zones por formato =====
function safeZoneRules(format: Format): string {
  if (format === "story") {
    return `FORMATO VERTICAL 9:16 — para Stories e Reels.
GERE A IMAGEM DIRETAMENTE EM PROPORÇÃO VERTICAL 9:16 (mais alta do que larga, formato de celular em pé).
NÃO entregue uma composição quadrada — a tela é 1080x1920, vertical.
SAFE ZONES:
- Topo: faixa superior (15%) livre.
- Base: faixa inferior (20%) livre.
- Laterais: margem de 8% em cada lado.
Concentre TODO o conteúdo importante no MIOLO CENTRAL — entre 18% e 80% da altura.`;
  }
  return `FORMATO QUADRADO 1:1 — para o feed do Instagram (1080x1080).
GERE A IMAGEM EM PROPORÇÃO QUADRADA. Composição equilibrada, perfeita para o grid.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const USER_GEMINI_API_KEY = Deno.env.get("USER_GEMINI_API_KEY");

    if (!LOVABLE_API_KEY && !USER_GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Nenhuma chave de API configurada. Configure LOVABLE_API_KEY nos secrets do Supabase." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as AdParams & { customPrompt?: string };

    if (!body.templateId && !body.photoOnly && !body.customPrompt) {
      if (!body.strategy || !["ancora", "vitrine", "matriz", "gancho"].includes(body.strategy)) {
        return new Response(JSON.stringify({ error: "Strategy ou templateId inválido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // VARIAÇÃO REAL: seed único 0–999999 a cada chamada, garantindo arte diferente a cada clique
    const variation = typeof body.variation === "number"
      ? body.variation
      : Math.floor(Math.random() * 999999);
    const format: Format = (body.format as Format) || "story";

    // === Identifica categoria do template ===
    const tplId = body.templateId || "";
    const isExperiencia = tplId.startsWith("ED") || body.strategy === "vitrine" || body.strategy === "gancho";
    const isAutoridade = tplId.startsWith("dark_") || tplId.startsWith("DK");
    const isOferta = !isExperiencia && !isAutoridade;

    // === Monta o prompt ===
    let prompt: string;
    let usedTemplateId: string | null = null;
    let provider: "user_gemini" | "lovable_ai" = USER_GEMINI_API_KEY ? "user_gemini" : "lovable_ai";

    if (body.customPrompt) {
      prompt = body.customPrompt;
      usedTemplateId = body.templateId || "custom";
    } else if (body.photoOnly) {
      const dest = body.destination || "destino paradisíaco";
      const scene = nicheToScene(body.niche, dest);
      prompt = `Fotografia de viagem ultra-realista e hiper-detalhada de ${dest}.
Cena: ${scene}.
${safeZoneRules(format)}
Estilo: fotografia editorial de viagem profissional, sem texto, sem logos, sem watermarks.
Qualidade cinematográfica, iluminação natural perfeita, cores vivas e saturadas.`;
    } else if (body.templateId) {
      const tpl = getTemplateById(body.templateId);
      if (!tpl) {
        return new Response(JSON.stringify({ error: `Template "${body.templateId}" não encontrado` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const rawPrice = (body.price || "149,90").trim().replace(/[^\d.,]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "");
      const priceNumeric = parseFloat(rawPrice.replace(/\./g, "").replace(",", ".")) || 149.9;
      const installmentsCount = parseInt((body.installments || "10x").replace(/\D/g, "") || "10");
      const totalNum = priceNumeric * installmentsCount;
      const formatBR = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const vars: MasterPromptVars = {
        destination: (body.destination || "DESTINO").toUpperCase(),
        destinationDescription: nicheToScene(body.niche, body.destination),
        installments: String(installmentsCount),
        installmentValue: rawPrice || "149,90",
        totalValue: formatBR(totalNum),
        packageType: body.packageType || "Voo + Hotel",
        duration: body.duration || "5 NOITES",
        promoName: (body.promoName || "OFERTA EXCLUSIVA").toUpperCase(),
        city: body.city || "sua cidade",
        primaryHex: (body.primaryColor || "#0c2340").toUpperCase(),
        secondaryHex: (body.secondaryColor || "#FCD34D").toUpperCase(),
        agencyName: body.agencyName || "",
        highlights: (body.highlights || []).map((h) => typeof h === "string" ? h : h.text),
        creativeSeed: `${tpl.id}-v${variation}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        forbiddenHeadlines: body.forbiddenHeadlines || [],
        forbiddenLayouts: body.forbiddenLayouts || [],
        format,
      };

      prompt = tpl.builder(vars);
      usedTemplateId = tpl.id;

      // ── V0_Experiencia · LUXO override ──────────────────────────────────
      // Quando a categoria é "Experiência de Destino", substitui o prompt
      // visual por uma cena de altíssimo padrão com negative space no
      // centro/topo para leitura de fontes serifadas brancas e CTA.
      if (isExperiencia) {
        const destLuxo = body.destination || "destino paradisíaco";
        prompt = `Fotografia publicitária comercial de altíssimo padrão, hiper-realista e cinematográfica. Um cenário de extremo luxo e exclusividade em ${destLuxo}. Iluminação dramática e profunda (chiaroscuro ou sunset premium) que combine com um tom profundo e sofisticado. A imagem deve ter foco perfeito (sharp focus) no cenário ao fundo, deixando OBRIGATORIAMENTE o centro e a parte superior levemente escurecidos e com 'negative space' absoluto (sem elementos visuais concorrentes) para a perfeita leitura de fontes serifadas brancas e botões. Qualidade 8k, nítida.
${safeZoneRules(format)}
Sem texto, sem logos, sem watermarks na imagem.`;
      }
    } else {
      // Fallback: prompt genérico
      const dest = body.destination || "destino paradisíaco";
      prompt = `Anúncio de viagem profissional para ${dest}. ${safeZoneRules(format)}`;
    }

    const imageTemperature = body.photoOnly ? 0.72 : 1.1;
    const imageTopP = body.photoOnly ? 0.88 : 0.96;

    console.log("fabrica-generate-ad", { templateId: usedTemplateId, format, provider, isOferta, isAutoridade, isExperiencia });

    // Referência visual CVC — apenas para Ofertas
    const CVC_REF_URL = "https://zdjtcwtakgizbsbbwtgc.supabase.co/storage/v1/object/public/thumbnails/fabrica-ref-cvc-style.jpg";

    let imageUrl: string | undefined;

    // ===== Tentativa 1: User Gemini API Key =====
    if (!imageUrl && USER_GEMINI_API_KEY) {
      try {
        const geminiBody: Record<string, unknown> = {
          contents: [{
            parts: isOferta
              ? [
                  { inline_data: { mime_type: "image/jpeg", data: await fetchImageAsBase64(CVC_REF_URL) } },
                  { text: "Use este anúncio de agência de viagem como referência visual de layout e estilo. Replique a estrutura (foto de fundo + caixa de preço), mas use EXCLUSIVAMENTE as cores, destino e informações do prompt a seguir. PROIBIDO copiar logos ou marcas da referência.\n\n" + prompt },
                ]
              : [{ text: prompt }],
          }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
            temperature: imageTemperature,
            topP: imageTopP,
          },
        };

        const gemResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${USER_GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(geminiBody),
          }
        );

        if (gemResp.ok) {
          const gemData = await gemResp.json();
          const imgPart = gemData.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data?.mime_type?.startsWith("image/"));
          if (imgPart?.inline_data?.data) {
            imageUrl = `data:${imgPart.inline_data.mime_type};base64,${imgPart.inline_data.data}`;
          }
        } else {
          console.warn("User Gemini failed:", await gemResp.text());
          if (LOVABLE_API_KEY) provider = "lovable_ai";
        }
      } catch (e) {
        console.warn("User Gemini exception, falling back:", e);
        if (LOVABLE_API_KEY) provider = "lovable_ai";
      }
    }

    // ===== Tentativa 2: Lovable AI Gateway =====
    if (!imageUrl && LOVABLE_API_KEY) {
      provider = "lovable_ai";
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          messages: [{
            role: "user",
            content: isOferta
              ? [
                  { type: "image_url", image_url: { url: CVC_REF_URL } },
                  { type: "text", text: "Use este anúncio como referência visual de layout (foto de fundo + caixa de preço estilo agência brasileira). Replique a ESTRUTURA, mas use EXCLUSIVAMENTE as cores, destino e dados do prompt. PROIBIDO copiar logos ou marcas.\n\n" + prompt },
                ]
              : prompt,
          }],
          modalities: ["image", "text"],
          temperature: imageTemperature,
          top_p: imageTopP,
          max_tokens: 8192,
        }),
      });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Aguarde 1 minuto.", provider }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione sua chave Gemini em Configurações.", provider, action: "add_user_key" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!response.ok) {
        const errText = await response.text();
        console.error("Lovable AI error:", response.status, errText);
        return new Response(JSON.stringify({ error: "Falha ao gerar imagem", detail: errText, provider }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    }

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Nenhuma imagem gerada. Verifique os créditos de IA.", provider }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ image: imageUrl, prompt, variation, provider, templateId: usedTemplateId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("fabrica-generate-ad error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro inesperado no servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper: busca imagem externa e converte para base64
async function fetchImageAsBase64(url: string): Promise<string> {
  const resp = await fetch(url);
  const buf = await resp.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
