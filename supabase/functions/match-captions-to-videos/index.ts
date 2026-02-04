import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
}

interface CaptionMatch {
  destination: string;
  caption: string;
  hashtags: string;
  matchedVideos: Array<{
    videoId: string;
    videoTitle: string;
    adaptedCaption: string;
    confidence: number;
    selected: boolean;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get request body
    const { captionsText, includeWithCaption = false } = await req.json();

    if (!captionsText || typeof captionsText !== "string") {
      return new Response(JSON.stringify({ error: "captionsText is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[MATCH-CAPTIONS] Processing caption text, length:", captionsText.length);

    // Fetch videos from database
    let videosQuery = supabase
      .from("content_items")
      .select("id, title, description")
      .eq("type", "video")
      .eq("is_active", true);

    if (!includeWithCaption) {
      videosQuery = videosQuery.is("description", null);
    }

    const { data: videos, error: videosError } = await videosQuery;

    if (videosError) {
      console.error("[MATCH-CAPTIONS] Error fetching videos:", videosError);
      return new Response(JSON.stringify({ error: "Failed to fetch videos" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[MATCH-CAPTIONS] Found videos:", videos?.length);

    if (!videos || videos.length === 0) {
      return new Response(JSON.stringify({ 
        matches: [], 
        message: "Nenhum vídeo sem legenda encontrado" 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format video list for AI
    const videoList = videos.map((v: VideoItem) => `- ID: ${v.id} | Título: "${v.title}"`).join("\n");

    // AI prompt for matching
    const systemPrompt = `Você é um assistente especializado em fazer match entre legendas de redes sociais e vídeos de uma agência de viagens.

TAREFA: Analise o texto de legendas fornecido e faça match inteligente com os vídeos disponíveis.

REGRAS DE MATCHING:
1. Identifique o DESTINO principal de cada legenda (ex: "Jericoacoara", "Paris", "Maldivas")
2. Faça match com vídeos que tenham esse destino no título
3. Regras de similaridade de nomes:
   - "Jericoacoara", "Jeri", "Jericoacoara - CE", "Jericoacoara Takes" = mesmo destino
   - "Maragogi", "Maragogi - AL", "Maragogi 2" = mesmo destino
   - Variações com números (2, 3), "Takes", sufixos de estado (-BA, -CE) = mesmo destino
   - "5 Praias Floripa" = "Florianópolis"
   - "Mel Africa" = "África do Sul"
   - "5 Lugares Europa" = destinos europeus genéricos
4. Para cada match, ADAPTE a legenda:
   - Substitua telefones genéricos como "(99) 9 9999-9999" por "(00) 00000-0000"
   - Mantenha emojis e hashtags
   - Se a legenda menciona "Bia", "Eva" ou "Mel", crie versão genérica (remova o nome)
5. Confidence score:
   - 100 = match exato (título contém o destino exatamente)
   - 80 = match parcial (variação do nome do destino)
   - 60 = match contextual (relacionado mas não exato)

IMPORTANTE: 
- Um mesmo destino pode ter MÚLTIPLOS vídeos (ex: Jericoacoara pode ter 4 vídeos diferentes)
- Agrupe todos os vídeos do mesmo destino sob a mesma legenda
- Extraia também as hashtags da legenda (texto após # até o final)

Retorne APENAS um JSON válido no formato:
{
  "matches": [
    {
      "destination": "Nome do Destino",
      "caption": "Texto da legenda adaptada (sem hashtags)",
      "hashtags": "#Hashtag1 #Hashtag2 ...",
      "matchedVideos": [
        {
          "videoId": "uuid-do-video",
          "videoTitle": "Título do vídeo",
          "adaptedCaption": "Legenda adaptada para este vídeo específico",
          "confidence": 100,
          "selected": true
        }
      ]
    }
  ]
}`;

    const userPrompt = `VÍDEOS DISPONÍVEIS (sem legenda):
${videoList}

TEXTO COM LEGENDAS:
${captionsText}

Analise as legendas e faça match com os vídeos listados. Retorne APENAS o JSON.`;

    console.log("[MATCH-CAPTIONS] Calling AI for matching...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[MATCH-CAPTIONS] AI error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[MATCH-CAPTIONS] No content in AI response");
      return new Response(JSON.stringify({ error: "AI returned empty response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[MATCH-CAPTIONS] AI response received, parsing...");

    // Parse JSON from AI response (may have markdown code blocks)
    let parsed: { matches: CaptionMatch[] };
    try {
      // Remove markdown code blocks if present
      let jsonStr = content.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("[MATCH-CAPTIONS] JSON parse error:", parseError);
      console.error("[MATCH-CAPTIONS] Raw content:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate and count matches
    const matches = parsed.matches || [];
    const totalVideos = matches.reduce((acc, m) => acc + (m.matchedVideos?.length || 0), 0);

    console.log("[MATCH-CAPTIONS] Found matches:", matches.length, "Total videos matched:", totalVideos);

    return new Response(JSON.stringify({ 
      matches,
      stats: {
        totalDestinations: matches.length,
        totalVideosMatched: totalVideos,
        totalVideosAvailable: videos.length,
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[MATCH-CAPTIONS] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
