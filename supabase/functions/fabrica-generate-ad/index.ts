// Edge function: fabrica-generate-ad
// Gera anúncios de turismo com Lovable AI (Nano Banana 2)
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getTemplateById, MASTER_TEMPLATES, type MasterPromptVars } from "./master-prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdParams {
  strategy: string;
  format?: string;
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
  highlights?: any[];
  ctaText?: string;
  variation?: number;
  templateId?: string;
  packageType?: string;
  duration?: string;
  forbiddenHeadlines?: string[];
  forbiddenLayouts?: string[];
}

const CVC_REF_URL = "https://zdjtcwtakgizbsbbwtgc.supabase.co/storage/v1/object/public/thumbnails/fabrica-ref-cvc-style.jpg";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const USER_GEMINI_API_KEY = Deno.env.get("USER_GEMINI_API_KEY");

    if (!LOVABLE_API_KEY && !USER_GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "No API keys configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as AdParams;
    const templateId = body.templateId || "";
    const variation = typeof body.variation === "number" ? body.variation : Math.floor(Math.random() * 4);
    
    // Identifica tipos de anúncio
    const isExperiencia = templateId.startsWith("ED") || body.strategy === "vitrine" || body.strategy === "gancho";
    const isAutoridade = templateId.startsWith("dark_") || templateId.startsWith("DK");
    const isOferta = !isExperiencia && !isAutoridade;

    let prompt = "";
    let usedTemplateId = "";

    if (body.templateId) {
      const tpl = getTemplateById(body.templateId);
      if (tpl) {
        usedTemplateId = tpl.id;
        const vars: MasterPromptVars = {
          destination: (body.destination || "DESTINO").toUpperCase(),
          destinationDescription: "paisagem de viagem",
          installments: body.installments || "10x",
          installmentValue: body.price || "149,90",
          totalValue: "1.499,00",
          packageType: body.packageType || "Voo + Hotel",
          duration: body.duration || "5 NOITES",
          promoName: (body.promoName || "OFERTA").toUpperCase(),
          city: body.city || "sua cidade",
          primaryHex: body.primaryColor || "#0c2340",
          secondaryHex: body.secondaryColor || "#FCD34D",
          agencyName: body.agencyName || "",
          highlights: (body.highlights || []).map(h => typeof h === "string" ? h : h.text),
          creativeSeed: `${tpl.id}-${variation}-${Date.now()}`,
          forbiddenHeadlines: body.forbiddenHeadlines || [],
        };
        prompt = tpl.builder(vars);
      }
    }

    if (!prompt) {
      prompt = `Gere um anúncio de viagem para ${body.destination}.`;
    }

    // Chamada para Lovable AI Gateway
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
                { type: "text", text: "Siga este estilo de anúncio: " + prompt }
              ]
            : prompt
        }],
        modalities: ["image", "text"],
        temperature: 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: "Lovable API Error", detail: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "No image generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ image: imageUrl, prompt, variation, templateId: usedTemplateId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
