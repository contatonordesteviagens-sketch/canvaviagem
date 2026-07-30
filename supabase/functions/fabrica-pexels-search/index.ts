import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { verifyFabricaAuthenticatedAccess } from "../_shared/fabricaAccess.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método não permitido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 },
      )
    }

    const access = await verifyFabricaAuthenticatedAccess(req, corsHeaders)
    if (!access.ok) return access.response

    const body = await req.json()
    const query = typeof body?.query === "string" ? body.query.trim().slice(0, 120) : ""
    const apiKey = Deno.env.get('PEXELS_API_KEY')

    if (!apiKey) {
      throw new Error("PEXELS_API_KEY is missing")
    }

    if (query.length < 2) {
      return new Response(
        JSON.stringify({ error: "Informe um destino válido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      )
    }

    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`, {
      headers: {
        Authorization: apiKey
      }
    })

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const photos = (data.photos || []).map((p: any) => ({
      id: p.id,
      url: p.src?.large2x || p.src?.large || p.src?.original,
      thumb: p.src?.medium || p.src?.small,
      alt: p.alt || query,
      width: p.width,
      height: p.height,
    }))

    return new Response(
      JSON.stringify({ photos }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error("fabrica-pexels-search error:", error)
    return new Response(
      JSON.stringify({ error: "Não foi possível buscar fotos agora" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
