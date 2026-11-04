import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { verifyFabricaEliteAccess } from "../_shared/fabricaAccess.ts";

// Vídeo pronto: recebe o que o agente falou no áudio (já transcrito),
// preenche os campos do vídeo com IA e busca vídeos reais do destino no Pexels.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SYSTEM_PROMPT = `Você monta um vídeo de stories (3 quadros) para uma agência de viagens brasileira.
O agente falou num áudio como é o pacote. Extraia e devolva SÓ um JSON com:
{
  "destino": "nome do destino como o brasileiro escreve, com acento (ex.: Jericoacoara, Cancún, Porto de Galinhas)",
  "chamada": "frase curta e animada para o 1º quadro, até 32 caracteres, sobre o destino (ex.: As dunas mais lindas do Ceará)",
  "preco": "preço no formato R$ 3.500, ou \\"\\" se o agente não falou preço",
  "pessoas": "para quem é, começando com 'para' (ex.: para o casal, para 2 pessoas, por pessoa), ou \\"\\"",
  "itens": ["até 4 itens inclusos que o agente falou, cada um com até 24 caracteres, ex.: Hospedagem 4 noites, Transfer ida e volta, Passeio Rota Leste"],
  "agencia": "nome da agência se o agente falou, senão \\"\\"",
  "whatsapp": "telefone se o agente falou, no formato (88) 99999-9999, senão \\"\\"",
  "buscas": ["3 termos curtos EM INGLÊS para achar vídeos reais desse destino num banco de vídeos, do mais específico ao mais genérico (ex.: Jericoacoara, Jericoacoara dunes, Brazil beach dunes)"]
}
Regras: não invente preço, telefone nem nome de agência. Itens só do que o agente falou; se ele não falou nenhum, devolva []. Corrija erros comuns de transcrição em nomes de lugares.`;

type Video = { id: number; url: string; width: number; height: number; duration: number; thumb: string };

async function buscarPexels(apiKey: string, termos: string[]): Promise<Video[]> {
  const achados: Video[] = [];
  const vistos = new Set<number>();
  // primeiro só vídeos em pé; se faltar, aceita deitados (o vídeo corta para stories)
  for (const orientacao of ["portrait", ""]) {
    for (const termo of termos) {
      if (achados.length >= 6) break;
      const q = `https://api.pexels.com/videos/search?query=${encodeURIComponent(termo)}&per_page=10&size=medium${orientacao ? `&orientation=${orientacao}` : ""}`;
      const r = await fetch(q, { headers: { Authorization: apiKey } });
      if (!r.ok) continue;
      const d = await r.json();
      for (const v of d.videos || []) {
        if (vistos.has(v.id) || (v.duration ?? 0) < 5) continue;
        const files = (v.video_files || []).filter((f: any) => f.file_type === "video/mp4" && f.width && f.height);
        // o arquivo mais leve que ainda cubra 720 de largura no stories
        files.sort((a: any, b: any) => Math.abs(Math.min(a.width, a.height) - 720) - Math.abs(Math.min(b.width, b.height) - 720));
        const f = files[0];
        if (!f) continue;
        vistos.add(v.id);
        achados.push({ id: v.id, url: f.link, width: f.width, height: f.height, duration: v.duration, thumb: v.image });
        if (achados.length >= 6) break;
      }
    }
    if (achados.length >= 3) break;
  }
  return achados;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const access = await verifyFabricaEliteAccess(req, corsHeaders);
    if (!access.ok) return access.response;

    const body = await req.json().catch(() => ({}));
    const texto = typeof body?.text === "string" ? body.text.trim().slice(0, 2000) : "";
    if (texto.length < 5) return json({ error: "Não entendi o áudio. Fale de novo o destino e o preço." }, 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
    if (!LOVABLE_API_KEY || !PEXELS_API_KEY) throw new Error("Chaves do servidor ausentes");

    const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: texto },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!ai.ok) {
      console.error("fabrica-video-pronto ai", ai.status, await ai.text().catch(() => ""));
      return json({ error: ai.status === 429 ? "Muita gente usando agora. Tente em alguns segundos." : "A IA não respondeu. Tente de novo." }, 502);
    }
    const raw = (await ai.json())?.choices?.[0]?.message?.content || "";
    let campos: any = {};
    try {
      campos = JSON.parse(String(raw).replace(/^```(?:json)?\s*|\s*```$/g, ""));
    } catch {
      return json({ error: "Não entendi o pacote. Fale o destino, o preço e o que está incluso." }, 422);
    }

    const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
    const dados = {
      destino: s(campos.destino, 40),
      chamada: s(campos.chamada, 40),
      preco: s(campos.preco, 20),
      pessoas: s(campos.pessoas, 30),
      itens: Array.isArray(campos.itens) ? campos.itens.map((i: unknown) => s(i, 28)).filter(Boolean).slice(0, 4) : [],
      agencia: s(campos.agencia, 40),
      whatsapp: s(campos.whatsapp, 20),
    };
    if (!dados.destino) return json({ error: "Não peguei o destino. Fale para onde é o pacote.", dados }, 422);

    const buscas = (Array.isArray(campos.buscas) ? campos.buscas : [])
      .map((b: unknown) => s(b, 60))
      .filter(Boolean)
      .slice(0, 3);
    if (!buscas.includes(dados.destino)) buscas.unshift(dados.destino);

    const videos = await buscarPexels(PEXELS_API_KEY, buscas);
    return json({ dados, videos, buscas });
  } catch (e) {
    console.error("fabrica-video-pronto error", e);
    return json({ error: "Não consegui montar agora. Tente de novo." }, 500);
  }
});
