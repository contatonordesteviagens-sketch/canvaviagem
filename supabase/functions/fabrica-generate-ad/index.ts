// Edge function: fabrica-generate-ad
// Gera anúncios de turismo com Lovable AI (Google Gemini Flash Image Preview)
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getTemplateById, pickContrastText, CRITICAL_CONTRAST_HEADER, type MasterPromptVars } from "./master-prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Strategy = "ancora" | "vitrine" | "matriz" | "gancho";
type Format = "square" | "story";

type GeminiImagePart = {
  inline_data?: { data?: string; mime_type?: string };
  inlineData?: { data?: string; mimeType?: string };
};

interface Highlight {
  text: string;
  icon?: string;
}

interface AdParams {
  strategy: Strategy;
  format?: Format;
  photoOnly?: boolean;
  canvasOnly?: boolean;
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

function extractGeminiImageUrl(data: any): string | undefined {
  const parts: GeminiImagePart[] = data?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) =>
    p?.inline_data?.data || p?.inlineData?.data
  );
  const inline = imgPart?.inline_data || imgPart?.inlineData;
  if (!inline?.data) return undefined;
  const mime = inline.mime_type || inline.mimeType || "image/png";
  return `data:${mime};base64,${inline.data}`;
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
    const forcePhotoOnly = body.photoOnly === true || body.canvasOnly === true;

    if (!body.templateId && !forcePhotoOnly && !body.customPrompt) {
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

    if (forcePhotoOnly) {
      const dest = body.destination || "destino paradisíaco";
      const scene = nicheToScene(body.niche, dest);
      const rawPrompt = body.customPrompt || `Fotografia de viagem ultra-realista e hiper-detalhada de ${dest}.
Cena: ${scene}.
${safeZoneRules(format)}
Estilo: fotografia editorial de viagem profissional, qualidade cinematográfica, iluminação natural perfeita, cores vivas e saturadas.`;
      prompt = `${rawPrompt}

REGRA ABSOLUTA DE SAÍDA: gere SOMENTE uma fotografia/fundo limpo. É PROIBIDO desenhar qualquer texto, letra, número, preço, moeda, logo, marca, ícone, botão, card, faixa, selo, etiqueta, watermark, assinatura, QR code, interface social ou elemento gráfico. Nenhuma tipografia pode aparecer na imagem. O Canvas do aplicativo desenhará toda a interface depois.`;
      usedTemplateId = body.templateId || "custom";
    } else if (body.customPrompt) {
      prompt = body.customPrompt;
      usedTemplateId = body.templateId || "custom";
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

      const primaryHex = (body.primaryColor || "#0c2340").toUpperCase();
      const secondaryHex = (body.secondaryColor || "#FCD34D").toUpperCase();

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
        primaryHex,
        secondaryHex,
        primaryTextHex: pickContrastText(primaryHex),
        secondaryTextHex: pickContrastText(secondaryHex),
        agencyName: body.agencyName || "",
        highlights: (body.highlights || []).map((h) => typeof h === "string" ? h : h.text),
        creativeSeed: `${tpl.id}-v${variation}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        forbiddenHeadlines: body.forbiddenHeadlines || [],
        forbiddenLayouts: body.forbiddenLayouts || [],
        format,
      };

      prompt = `${CRITICAL_CONTRAST_HEADER}\n\n${tpl.builder(vars)}`;
      usedTemplateId = tpl.id;

      // ── V0 / V1 _Experiencia · LUXO override ────────────────────────────
      // V0 = LUXO/DESEJO (chiaroscuro premium, negative space topo/centro)
      // V1 = LUXO CINEMATOGRÁFICO (rim lighting editorial, espaço central livre)
      if (isExperiencia) {
        const destLuxo = body.destination || "destino paradisíaco";
        const isV1 = variation === 1;
        const isV2 = variation === 2;
        const isV3 = variation === 3;
        if (isV3) {
          // V3_Experiencia · NOTURNA / DARK PREMIUM (cinematic aerial night)
          prompt = `A highly detailed, ultra-high-resolution cinematic aerial night photograph of ${destLuxo}. The city grid or landscape is illuminated by warm streetlights and glowing building windows against the deep, dark night. Photorealistic, high-contrast dark aesthetic, perfect for a high-end premium travel advertisement.
${safeZoneRules(format)}
Sem texto, sem logos, sem watermarks, sem ícones e sem pictogramas na imagem.`;
        } else if (isV2) {
          // V2_Experiencia · DRONE AÉREO PREMIUM (cenário para painéis de UI luxuosos)
          prompt = `Fotografia profissional de drone, altamente detalhada e de altíssima resolução. Vista aérea espetacular, imersiva e cinematográfica de ${destLuxo}. Composição limpa, iluminação natural brilhante de golden hour, fotorrealista. Cenário de luxo e alto padrão. A imagem serve como um cenário de fundo premium, deixando espaço livre para sobreposição de painéis de interface.
${safeZoneRules(format)}
Sem texto, sem logos, sem watermarks, sem ícones e sem pictogramas na imagem.`;
        } else if (isV1) {
          prompt = `Fotografia editorial de viagens de luxo, cinematográfica e de altíssima qualidade (8K). Uma tomada ampla e ultrarrealista de ${destLuxo}. A iluminação é rim lighting (luz de contorno), criando uma luz suave, serena e exclusiva. Composição limpa, sem desfoque de movimento. A atmosfera geral é de uma beleza estonteante e de alto padrão. Espaço central livre e escurecido sutilmente para sobreposição de tipografia branca perfeitamente nítida.
${safeZoneRules(format)}
Sem texto, sem logos, sem watermarks, sem ícones e sem pictogramas na imagem.`;
        } else {
          prompt = `Fotografia publicitária comercial de altíssimo padrão, hiper-realista e cinematográfica. Um cenário de extremo luxo e exclusividade em ${destLuxo}. Iluminação dramática e profunda (chiaroscuro ou sunset premium) que combine com um tom profundo e sofisticado. A imagem deve ter foco perfeito (sharp focus) no cenário ao fundo, deixando OBRIGATORIAMENTE o centro e a parte superior levemente escurecidos e com 'negative space' absoluto (sem elementos visuais concorrentes) para a perfeita leitura de fontes serifadas brancas e botões. Qualidade 8k, nítida.
${safeZoneRules(format)}
Sem texto, sem logos, sem watermarks, sem ícones e sem pictogramas na imagem.`;
        }
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

        const geminiModelCandidates = [
          "gemini-2.5-flash-image",
          "gemini-2.0-flash-exp-image-generation",
          "gemini-2.0-flash-preview-image-generation",
          "gemini-2.5-flash-image-preview",
        ];
        let lastStatus = 0;
        let lastErrText = "";

        for (const modelName of geminiModelCandidates) {
          const gemResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${USER_GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(geminiBody),
            }
          );
          lastStatus = gemResp.status;

          if (gemResp.ok) {
            const gemData = await gemResp.json();
            imageUrl = extractGeminiImageUrl(gemData);
            if (imageUrl) {
              provider = "user_gemini";
              break;
            }
            lastErrText = "Gemini respondeu sem imagem inline.";
            break;
          }

          lastErrText = await gemResp.text();
          if (gemResp.status !== 404) break;
        }

        if (!imageUrl) {
          console.warn("User Gemini failed:", lastStatus, lastErrText.slice(0, 300));
          const userKeyActionableError = lastStatus === 401 || lastStatus === 403 || lastStatus === 429;
          if (userKeyActionableError) {
            const message = lastStatus === 429
              ? "Sua cota do Gemini foi atingida. Aguarde ou verifique o faturamento da sua chave Gemini."
              : "Sua chave Gemini é inválida ou foi revogada. Atualize-a em Configurações.";
            return new Response(JSON.stringify({ error: message, provider: "user_gemini", action: "update_user_key", fallback: false }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
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
        return new Response(JSON.stringify({
          error: "Créditos esgotados no provedor de IA. A chave Gemini do projeto não conseguiu gerar a imagem antes do fallback.",
          provider,
          action: "add_user_key",
          fallback: false,
        }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
