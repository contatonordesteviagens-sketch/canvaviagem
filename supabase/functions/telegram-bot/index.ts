import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? ""
const ADMIN_ID = Deno.env.get("ADMIN_CHAT_ID") ?? ""
const GITHUB_TOKEN = Deno.env.get("GITHUB_PAT") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? ""

const REPO = "contatonordesteviagens-sketch/canvaviagem-6647054a"

const BLOG_LINKS = [
    { title: "O que Postar no Instagram", url: "https://canvaviagem.com/blog/o-que-postar-no-instagram-agencia-de-viagem" },
    { title: "Conteúdo Sem Gravar Vídeo", url: "https://canvaviagem.com/blog/como-criar-conteudo-agencia-de-viagem-sem-gravar-video" },
    { title: "Guia de Marketing Digital 2026", url: "https://canvaviagem.com/blog/marketing-digital-para-agencia-de-viagem" }
]

const AGENDA = [
    { num: 4, titulo: "7 Erros que Agentes Cometem no Instagram", slug: "erros-agentes-viagem-instagram", status: "⏳ Pendente" },
    { num: 5, titulo: "Como Conseguir Clientes pelo Instagram", slug: "como-conseguir-clientes-agencia-viagem", status: "⏳ Pendente" },
    { num: 6, titulo: "Templates Canva para Agência de Viagem", slug: "templates-canva-agencia-viagem", status: "⏳ Pendente" },
]

serve(async (req) => {
    try {
        const body = await req.json()
        const message = body?.message
        if (!message) return new Response("OK")

        const chatId = String(message.chat?.id)
        let text = message.text ?? ""

        if (chatId !== ADMIN_ID) {
            await send(chatId, "⛔ Acesso não autorizado.")
            return new Response("OK")
        }

        // === PROCESSAMENTO DE ÁUDIO ===
        if (message.voice || message.audio) {
            const fileId = message.voice?.file_id || message.audio?.file_id
            await send(chatId, "🎤 *Processando sua voz, Lucas...*")

            try {
                const fileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`)
                const fileData = await fileRes.json()
                const filePath = fileData.result.file_path
                const audioUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`
                const audioRes = await fetch(audioUrl)
                const audioBlob = await audioRes.blob()

                const formData = new FormData()
                formData.append("file", audioBlob, "audio.oga")
                formData.append("model", "whisper-1")
                formData.append("language", "pt")

                const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` },
                    body: formData
                })

                if (!whisperRes.ok) {
                    const errBody = await whisperRes.json()
                    await send(chatId, `❌ Erro OpenAI: ${errBody.error?.message}`)
                    return new Response("OK")
                }

                const whisperData = await whisperRes.json()
                text = whisperData.text || ""
                await send(chatId, `📝 *Entendi:* "${text}"`)
            } catch (err) {
                await send(chatId, "❌ Erro ao converter áudio.")
                return new Response("OK")
            }
        }

        const lowerText = text.toLowerCase()
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
        const todayStart = `${new Date().toISOString().split('T')[0]}T00:00:00.000Z`

        if (lowerText.includes("/start")) {
            await send(chatId, `👋 *Central Canvaviagem!*\n\n🔗 *Links* - Ver posts publicados\n📝 *Exemplo* - Ver modelo de copy\n📊 *Dashboard* - Números de hoje\n🚀 *Deploy* - Publicar site`)
        }

        else if (lowerText.includes("link") || lowerText.includes("artigo") || lowerText.includes("postagem")) {
            const links = BLOG_LINKS.map(l => `🔗 [${l.title}](${l.url})`).join("\n")
            await send(chatId, `📝 *ARTIGOS PUBLICADOS NO BLOG:*\n\n${links}\n\n*Clique no link para abrir no navegador.*`)
        }

        else if (lowerText.includes("exemplo") || lowerText.includes("como vai ficar") || lowerText.includes("modelo")) {
            const exemploCopy = `📝 *EXEMPLO DE POST PARA INSTAGRAM:*\n\n*Headline:* Sabia que Maragogi tem a água mais transparente do Brasil?\n\n*Legenda:* Você não precisa ir para as Maldivas para encontrar o paraíso. Aqui no Alagoas, as galés de Maragogi oferecem um cenário surreal.\n\n💡 *Dica:* Vá na baixa temporada para pegar as piscinas mais vazias.\n\n🚀 *CTA:* Quer o roteiro completo? Comenta "EU QUERO" que te mando na DM!`
            await send(chatId, exemploCopy)
        }

        else if (lowerText.includes("dashboard") || lowerText.includes("hoje") || lowerText.includes("visitas")) {
            const { count: views } = await supabase.from("page_views").select("*", { count: "exact", head: true }).gte("viewed_at", todayStart)
            const { count: users } = await supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", todayStart)
            await send(chatId, `📊 *HOJE:* \n🌐 Visitas: *${views ?? 0}*\n👥 Novos Leads: *${users ?? 0}*`)
        }

        else if (lowerText.includes("deploy") || lowerText.includes("publicar")) {
            await send(chatId, "🚀 *Iniciando deploy...*")
            if (GITHUB_TOKEN) {
                await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Accept": "application/vnd.github.v3+json" },
                    body: JSON.stringify({ event_type: "manual-deploy-telegram" })
                })
                await send(chatId, "✅ GitHub acionado!")
            } else {
                await send(chatId, "⚠️ Falta GITHUB_PAT.")
            }
        }

        return new Response("OK")
    } catch (err) {
        return new Response("Error", { status: 500 })
    }
})

async function send(chatId: string, text: string) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" })
    })
}
