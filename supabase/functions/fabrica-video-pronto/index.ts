import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { verifyFabricaEliteAccess } from "../_shared/fabricaAccess.ts";

// Vídeo pronto: recebe o pacote (texto do áudio, texto colado, dados de um pacote
// da Fábrica ou a foto/print de um pacote), descobre o destino primeiro, preenche
// os campos com IA e busca vídeos reais do destino no Pexels (com fotos de reserva).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-video-lab, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SYSTEM_PROMPT = `Você monta um vídeo de stories (3 quadros) para uma agência de viagens brasileira.
Você recebe o pacote de um destes jeitos: o que o agente falou num áudio, um texto colado, os dados de um pacote cadastrado, ou a FOTO/PRINT de um pacote (de operadora, de post, de WhatsApp).
PRIMEIRO descubra o destino (o lugar da viagem). Se for foto, leia todo o texto da imagem e olhe também a paisagem.
Se o texto não disser um lugar específico (ex.: "Circuito Europeu", "Caribe", "Pacote de férias"), reconheça o lugar pela foto de fundo (monumentos, paisagens: Coliseu = Roma, Torre Eiffel = Paris, Cristo = Rio de Janeiro) e use esse lugar como destino. Se for um circuito com várias cidades, use a cidade que aparece na foto ou, sem foto clara, a região (ex.: Europa).
Devolva SÓ um JSON com:
{
  "destino": "nome do destino como o brasileiro escreve, com acento (ex.: Jericoacoara, Cancún, Porto de Galinhas)",
  "chamada": "frase curta e animada para o 1º quadro, até 32 caracteres, sobre o destino (ex.: As dunas mais lindas do Ceará). Se o pacote tiver nome próprio (ex.: Circuito Europeu), use-o aqui",
  "destaques": ["2 frases curtas, até 30 caracteres cada, sobre o que a pessoa vai viver no destino, para telas do vídeo (ex.: Dunas e lagoas cristalinas, Pôr do sol inesquecível)"],
  "pagamento": "installments se o preço for parcelado (ex.: 10x de R$ 349), down_plus se for entrada + parcelas, cash se for à vista ou só um valor, free_quote se não tiver preço",
  "parcelas": "só o número de parcelas com x (ex.: 10x), ou \\"\\"",
  "entrada": "valor da entrada no formato R$ 500, só se for entrada + parcelas, senão \\"\\"",
  "preco": "o valor principal no formato R$ 3.500 ou R$ 349,90 (no parcelado, o valor da parcela), ou \\"\\"",
  "precoAntigo": "se houver preço 'de' riscado ou anterior (ex.: de R$ 4.990 por R$ 3.490), o valor antigo no formato R$ 4.990, senão \"\"",
  "pessoas": "para quem é o preço, começando com 'para' ou 'por' (ex.: por pessoa, para o casal, para 2 pessoas), ou \\"\\"",
  "itens": ["até 4 itens inclusos, cada um com até 24 caracteres, ex.: Aéreo ida e volta, Hotel 5 noites, Café da manhã, Passeio Rota Leste"],
  "agencia": "nome da agência se aparecer, senão \\"\\"",
  "whatsapp": "telefone se aparecer, formato (88) 99999-9999, senão \\"\\"",
  "instagram": "@ do Instagram se aparecer, senão \\"\\"",
  "buscas": ["4 termos curtos EM INGLÊS para achar vídeos reais desse destino num banco de vídeos, do mais específico ao mais genérico (ex.: Jericoacoara, Jericoacoara dunes, Jericoacoara lagoon, Brazil beach dunes)"]
}
Regras: não invente preço, telefone, Instagram nem nome de agência. Itens só do que foi informado; se nada foi informado, devolva []. Corrija erros comuns de transcrição em nomes de lugares. Se não der para saber o destino, devolva "destino": "".`;

// Teste sem login (laboratório local): no máximo 30 chamadas por hora, somando todo mundo.
const LIMITE_SEM_LOGIN_POR_HORA = 30;

async function liberarSemLogin(): Promise<boolean> {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) return false;
  const db = createClient(url, key, { auth: { persistSession: false } });
  const desde = new Date(Date.now() - 3600_000).toISOString();
  const { count, error } = await db
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("event_type", "video_pronto_sem_login")
    .gte("created_at", desde);
  if (error || (count ?? 0) >= LIMITE_SEM_LOGIN_POR_HORA) return false;
  await db.from("analytics_events").insert({ event_type: "video_pronto_sem_login", url_path: "/dev/video-lab" });
  return true;
}

type Midia = { tipo: "video" | "foto"; url: string; width: number; height: number; thumb: string };

async function buscarPexels(apiKey: string, termos: string[]): Promise<Midia[]> {
  const achados: Midia[] = [];
  const vistos = new Set<string>();
  const add = (m: Midia, id: string) => {
    if (vistos.has(id)) return;
    vistos.add(id);
    achados.push(m);
  };
  // 1) vídeos em pé; 2) vídeos deitados (o vídeo corta para stories)
  for (const orientacao of ["portrait", ""]) {
    for (const termo of termos) {
      if (achados.length >= 10) break;
      const q = `https://api.pexels.com/videos/search?query=${encodeURIComponent(termo)}&per_page=10&size=medium${orientacao ? `&orientation=${orientacao}` : ""}`;
      const r = await fetch(q, { headers: { Authorization: apiKey } });
      if (!r.ok) continue;
      const d = await r.json();
      for (const v of d.videos || []) {
        if ((v.duration ?? 0) < 5) continue;
        const files = (v.video_files || []).filter((f: any) => f.file_type === "video/mp4" && f.width && f.height);
        files.sort((a: any, b: any) => Math.abs(Math.min(a.width, a.height) - 720) - Math.abs(Math.min(b.width, b.height) - 720));
        const f = files[0];
        if (!f) continue;
        add({ tipo: "video", url: f.link, width: f.width, height: f.height, thumb: v.image }, "v" + v.id);
        if (achados.length >= 10) break;
      }
    }
    if (achados.length >= 6) return achados;
  }
  // 3) faltou vídeo: completa com fotos em pé do destino (o vídeo anima com zoom)
  for (const termo of termos) {
    if (achados.length >= 6) break;
    const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(termo)}&per_page=6&orientation=portrait`, { headers: { Authorization: apiKey } });
    if (!r.ok) continue;
    const d = await r.json();
    for (const p of d.photos || []) {
      add({ tipo: "foto", url: p.src?.large2x || p.src?.large, width: p.width, height: p.height, thumb: p.src?.medium }, "p" + p.id);
      if (achados.length >= 6) break;
    }
  }
  return achados;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const semLogin = req.headers.get("x-video-lab") === "sem-login";
    if (!semLogin) {
      const access = await verifyFabricaEliteAccess(req, corsHeaders);
      if (!access.ok) return access.response;
    } else if (!(await liberarSemLogin())) {
      return json({ error: "Limite de testes sem login atingido nesta hora. Tente mais tarde." }, 429);
    }

    const body = await req.json().catch(() => ({}));
    if (typeof body?.buscar === "string" && body.buscar.trim().length >= 2) {
      const PEXELS = Deno.env.get("PEXELS_API_KEY");
      if (!PEXELS) throw new Error("Chave do Pexels ausente");
      const midias = await buscarPexels(PEXELS, [body.buscar.trim().slice(0, 60)]);
      return json({ midias });
    }
    const texto = typeof body?.text === "string" ? body.text.trim().slice(0, 4000) : "";
    const imagem = typeof body?.image === "string" && body.image.startsWith("data:image/") ? body.image : "";
    if (imagem.length > 7_000_000) return json({ error: "A imagem é grande demais. Mande um print menor." }, 413);
    if (texto.length < 3 && !imagem) return json({ error: "Mande o pacote: um áudio, um texto ou uma foto." }, 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
    if (!LOVABLE_API_KEY || !PEXELS_API_KEY) throw new Error("Chaves do servidor ausentes");

    const conteudo: unknown = imagem
      ? [
          { type: "text", text: texto ? `Informações extras do agente: ${texto}` : "Leia o pacote desta imagem." },
          { type: "image_url", image_url: { url: imagem } },
        ]
      : texto;

    const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: conteudo },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!ai.ok) {
      console.error("fabrica-video-pronto ai", ai.status, await ai.text().catch(() => ""));
      return json({ error: ai.status === 429 ? "Muita gente usando agora. Tente em alguns segundos." : "A IA não respondeu. Tente de novo." }, 502);
    }
    const raw = (await ai.json())?.choices?.[0]?.message?.content || "";
    let c: any = {};
    try {
      c = JSON.parse(String(raw).replace(/^```(?:json)?\s*|\s*```$/g, ""));
    } catch {
      return json({ error: "Não entendi o pacote. Fale o destino, o preço e o que está incluso." }, 422);
    }

    const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
    const modos = ["installments", "down_plus", "cash", "free_quote"];
    const dados = {
      destino: s(c.destino, 40),
      chamada: s(c.chamada, 40),
      pagamento: modos.includes(c.pagamento) ? c.pagamento : "cash",
      parcelas: s(c.parcelas, 6),
      entrada: s(c.entrada, 20),
      preco: s(c.preco, 20),
      precoAntigo: s(c.precoAntigo, 20),
      pessoas: s(c.pessoas, 30),
      destaques: Array.isArray(c.destaques) ? c.destaques.map((i: unknown) => s(i, 34)).filter(Boolean).slice(0, 2) : [],
      itens: Array.isArray(c.itens) ? c.itens.map((i: unknown) => s(i, 28)).filter(Boolean).slice(0, 4) : [],
      agencia: s(c.agencia, 40),
      whatsapp: s(c.whatsapp, 20),
      instagram: s(c.instagram, 40),
    };
    if (!dados.destino) return json({ error: "Não achei o destino. Diga ou mostre para onde é o pacote.", dados }, 422);

    const buscas = (Array.isArray(c.buscas) ? c.buscas : []).map((b: unknown) => s(b, 60)).filter(Boolean).slice(0, 4);
    if (!buscas.includes(dados.destino)) buscas.unshift(dados.destino);

    const midias = await buscarPexels(PEXELS_API_KEY, buscas);
    return json({ dados, midias, buscas });
  } catch (e) {
    console.error("fabrica-video-pronto error", e);
    return json({ error: "Não consegui montar agora. Tente de novo." }, 500);
  }
});
