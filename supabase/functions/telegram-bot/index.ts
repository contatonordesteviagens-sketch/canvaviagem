import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? ""
const ADMIN_ID = Deno.env.get("ADMIN_CHAT_ID") ?? ""
const GITHUB_TOKEN = Deno.env.get("GITHUB_PAT") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

const REPO = "contatonordesteviagens-sketch/canvaviagem-6647054a"

const AGENDA = [
    { num: 4, titulo: "7 Erros que Agentes Cometem no Instagram", slug: "erros-agentes-viagem-instagram", status: "⏳ Pendente" },
    { num: 5, titulo: "Como Conseguir Clientes pelo Instagram", slug: "como-conseguir-clientes-agencia-viagem", status: "⏳ Pendente" },
    { num: 6, titulo: "Templates Canva para Agência de Viagem", slug: "templates-canva-agencia-viagem", status: "⏳ Pendente" },
    { num: 7, titulo: "Como Montar Calendário de Conteúdo", slug: "calendario-conteudo-agencia-viagem", status: "⏳ Pendente" },
    { num: 8, titulo: "IA para Agência de Viagem", slug: "ia-agencia-de-viagem", status: "⏳ Pendente" },
]

serve(async (req) => {
    try {
        const body = await req.json()
        const message = body?.message
        if (!message) return new Response("OK")

        const chatId = String(message.chat?.id)
        const text = message.text ?? ""

        // Segurança: só o admin pode controlar
        if (chatId !== ADMIN_ID) {
            await send(chatId, "⛔ Acesso não autorizado.")
            return new Response("OK")
        }

        // === COMANDOS ===

        if (text === "/start") {
            await send(chatId, `👋 *Olá, Lucas!* Sou o bot do Canva Viagem.\n\n*Comandos disponíveis:*\n📊 /dashboard — Métricas do site\n📅 /agenda — Próxima fila de artigos\n🚀 /deploy — Forçar novo deploy agora\n📝 /artigo — Criar próximo artigo da fila\n💰 /mrr — Ver receita do mês no Stripe\nℹ️ /help — Ver todos os comandos`)
        }

        else if (text === "/help") {
            await send(chatId, `*Comandos do Canva Viagem Bot:*\n\n/start — Boas-vindas\n/dashboard — Visitas, leads e conversão\n/agenda — Fila de artigos do blog\n/deploy — Forçar redeploy do site\n/artigo — Criar próximo artigo da fila\n/mrr — Receita mensal (Stripe)\n/help — Esta mensagem`)
        }

        else if (text === "/agenda") {
            const linhas = AGENDA.map(a => `${a.status} *Artigo ${a.num}:* ${a.titulo}`).join("\n")
            await send(chatId, `📅 *Fila de Artigos do Blog:*\n\n${linhas}\n\nEnvie /artigo para criar o próximo.`)
        }

        else if (text === "/dashboard") {
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
            let dashText = `📊 *Dashboard Canva Viagem*\n📅 ${new Date().toLocaleDateString("pt-BR")}\n\n`

            try {
                const { count: users } = await supabase.from("profiles").select("*", { count: "exact", head: true })
                dashText += `👤 Usuários cadastrados: *${users ?? "N/A"}*\n`
            } catch { dashText += "👤 Usuários: dados indisponíveis\n" }

            dashText += `\n🌐 Site: canvaviagem.com\n📝 Artigos publicados: 3\n⏳ Artigos na fila: ${AGENDA.length}`
            await send(chatId, dashText)
        }

        else if (text === "/deploy") {
            await send(chatId, "🚀 Iniciando deploy do site... aguarde!")

            if (GITHUB_TOKEN) {
                const res = await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Accept": "application/vnd.github.v3+json", "Content-Type": "application/json" },
                    body: JSON.stringify({ event_type: "manual-deploy-telegram" })
                })

                if (res.ok || res.status === 204) {
                    await send(chatId, "✅ Deploy acionado com sucesso! O site será atualizado em 2-3 minutos.")
                } else {
                    await send(chatId, "⚠️ Comando enviado. Verifique o status em github.com → Actions")
                }
            } else {
                await send(chatId, "⚠️ GITHUB_PAT não configurado. Deploy via push manual necessário.")
            }
        }

        else if (text.startsWith("/artigo")) {
            const proximo = AGENDA.find(a => a.status.includes("Pendente"))
            if (proximo) {
                await send(chatId, `📝 *Próximo artigo da fila:*\n\n*Artigo ${proximo.num}:* ${proximo.titulo}\n🔗 Slug: /blog/${proximo.slug}\n\nPara criar, abra o Antigravity e diga:\n"Crie o artigo ${proximo.num}: ${proximo.titulo}"`)
            } else {
                await send(chatId, "✅ Todos os artigos da fila foram criados! Adicione mais na skill canvaviagem_blog_autonomo.")
            }
        }

        else if (text === "/mrr") {
            await send(chatId, `💰 *Receita do Mês*\n\nPara ver o MRR em tempo real, use o comando na skill Stripe:\n/stripe-dashboard\n\nOu acesse: dashboard.stripe.com`)
        }

        else if (message.voice || message.audio) {
            await send(chatId, `🎤 Recebi seu áudio!\n\nTranscrição automática de áudio requer integração com Whisper (OpenAI). \n\nPor enquanto, use os comandos de texto:\n/dashboard /agenda /deploy /artigo`)
        }

        else {
            await send(chatId, `Não entendi "${text}".\n\nUse /help para ver todos os comandos disponíveis.`)
        }

        return new Response("OK")
    } catch (err) {
        console.error(err)
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
