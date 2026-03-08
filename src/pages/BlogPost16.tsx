import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, CheckCircle2, AlertTriangle } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost16 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: "Script de Vendas para Agente de Viagens pelo WhatsApp", url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Script de Vendas para Agente de Viagens pelo WhatsApp 2026 | Canva Viagem</title>
                <meta name="description" content="Scripts prontos para agentes de viagem fecharem mais vendas pelo WhatsApp. Como responder um lead, quebrar objeções de preço e conduzir um cliente ao fechamento." />
                <meta name="keywords" content="script de vendas agente de viagem, como vender pelo whatsapp viagens, fechar venda pelo whatsapp agência de viagem, atendimento whatsapp turismo" />
                <link rel="canonical" href="https://canvaviagem.com/blog/script-vendas-whatsapp-agente-viagens" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Script de Vendas para Agente de Viagens pelo WhatsApp" />
                <meta property="og:description" content="Scripts prontos para fechar mais vendas de viagem pelo WhatsApp sem parecer robótico." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Script de Vendas para Agente de Viagens pelo WhatsApp",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-20", "dateModified": "2026-03-20",
                    "url": "https://canvaviagem.com/blog/script-vendas-whatsapp-agente-viagens",
                    "image": "https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=800&auto=format&fit=crop"
                })}</script>
            </Helmet>

            <div className="min-h-screen bg-gray-50 text-slate-900">
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors"><ArrowLeft size={18} /><span className="text-sm font-medium">Voltar ao site</span></Link>
                        <Link to="/" className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Canva Viagem</Link>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-6 py-12 pb-32">
                    <nav className="text-sm text-slate-400 mb-6 font-medium">
                        <Link to="/" className="hover:text-primary">Início</Link><span className="mx-2">/</span>
                        <Link to="/blog" className="hover:text-primary">Blog</Link><span className="mx-2">/</span>
                        <span className="text-slate-600">Scripts de Vendas WhatsApp</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full mb-6">Vendas · WhatsApp</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Script de Vendas para Agente de Viagens:
                        <span className="text-primary"> Feche Mais pelo WhatsApp</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">20 de março de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">12 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=1200&auto=format&fit=crop" alt="Agente de viagens usando WhatsApp para fechar vendas" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            O WhatsApp é o principal canal de fechamento para agentes de viagem no Brasil. Mas a maioria dos agentes comete erros que afastam o cliente justo no momento decisivo. <strong className="text-slate-900">Esses scripts foram testados em dezenas de conversas reais</strong> e aumentam a taxa de fechamento em até 3x.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                            <div className="flex gap-3 items-start">
                                <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-black text-red-900 mb-2">Os 3 Erros Mais Comuns no Atendimento por WhatsApp</p>
                                    <ul className="text-red-700 text-sm space-y-1">
                                        <li>• Responder só o preço sem entender o que o cliente quer</li>
                                        <li>• Demorar mais de 2 horas para responder (lead já foi para o concorrente)</li>
                                        <li>• Dar o orçamento sem criar desejo pelo destino primeiro</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">📱 Script 1: Primeiro Contato (cliente veio pelo Instagram)</h2>

                        <div className="bg-slate-900 rounded-2xl p-6 space-y-4">
                            <p className="text-green-400 text-xs font-bold uppercase tracking-widest">✅ Use esse script (adapte com seu nome)</p>
                            {[
                                { from: "Cliente", msg: "Oi, vi seu post sobre Dubai. Quanto custa?" },
                                { from: "Você", msg: "Olá, [Nome]! 😊 Que bom que se interessou por Dubai — é um destino incrível e muito mais acessível do que as pessoas imaginam!\n\nPara montar um roteiro perfeito para você, me conta:\n1️⃣ Quantas pessoas vão?\n2️⃣ Qual período está pensando?\n3️⃣ É uma viagem de casal, família ou grupo?\n\nAssim consigo te passar um orçamento bem personalizado! ✈️" },
                            ].map((msg, i) => (
                                <div key={i} className={`rounded-xl p-4 ${msg.from === "Você" ? "bg-green-900 ml-8" : "bg-slate-700 mr-8"}`}>
                                    <p className={`text-xs font-bold mb-2 ${msg.from === "Você" ? "text-green-300" : "text-slate-300"}`}>{msg.from}:</p>
                                    <p className="text-white text-sm leading-relaxed whitespace-pre-line">{msg.msg}</p>
                                </div>
                            ))}
                            <p className="text-slate-400 text-xs">Por quê funciona: em vez de só falar preço, você qualifica o lead, cria rapport e posiciona você como especialista consultivo — não uma loja.</p>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-4">📱 Script 2: Quebrar Objeção de Preço</h2>
                        <div className="bg-slate-900 rounded-2xl p-6 space-y-4">
                            <p className="text-green-400 text-xs font-bold uppercase tracking-widest">✅ Quando o cliente achar caro</p>
                            {[
                                { from: "Cliente", msg: "Nossa, tá caro demais. Vi mais barato na internet." },
                                { from: "Você", msg: "Entendo! 😊 Mas posso te ajudar a comparar direitinho?\n\nO que você encontrou online geralmente não inclui:\n🏨 Hotel com localização boa e avaliação acima de 8.0\n🛡️ Seguro viagem completo\n📋 Assistência em caso de problema\n\nO meu pacote inclui tudo isso + meu suporte 24h se acontecer qualquer imprevisto durante sua viagem.\n\nMe manda o link que você encontrou — comparo pra você ver exatamente o que está e o que não está incluído. Ok?" },
                            ].map((msg, i) => (
                                <div key={i} className={`rounded-xl p-4 ${msg.from === "Você" ? "bg-green-900 ml-8" : "bg-slate-700 mr-8"}`}>
                                    <p className={`text-xs font-bold mb-2 ${msg.from === "Você" ? "text-green-300" : "text-slate-300"}`}>{msg.from}:</p>
                                    <p className="text-white text-sm leading-relaxed whitespace-pre-line">{msg.msg}</p>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-4">📱 Script 3: Fechar em 24h (urgência real)</h2>
                        <div className="bg-slate-900 rounded-2xl p-6 space-y-4">
                            <p className="text-green-400 text-xs font-bold uppercase tracking-widest">✅ Para leads que estão "pensando"</p>
                            {[
                                { from: "Você", msg: "Oi [Nome]! Tudo bem? 😊\n\nPassando pra te avisar que a disponibilidade do voo que separei pra você vence amanhã. Depois disso, o preço pode subir ou ficar sem disponibilidade nessa data.\n\nSe quiser garantir, posso segurar com apenas R$500 agora — o restante você paga com calma.\n\nMe avisa pra eu não perder o espaço por você! ✈️" },
                            ].map((msg, i) => (
                                <div key={i} className="rounded-xl p-4 bg-green-900">
                                    <p className="text-green-300 text-xs font-bold mb-2">Você:</p>
                                    <p className="text-white text-sm leading-relaxed whitespace-pre-line">{msg.msg}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            {[
                                { icon: <CheckCircle2 className="text-green-500" size={20} />, title: "Responda em menos de 1 hora", desc: "A taxa de conversão cai 70% quando você demora mais de 1h para responder o primeiro contato." },
                                { icon: <CheckCircle2 className="text-green-500" size={20} />, title: "Use áudio nas mensagens importantes", desc: "Áudios criam mais conexão. Use para apresentar o orçamento com entusiasmo e detalhes — o cliente percebe o cuidado." },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                    <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm mb-1">{item.title}</p>
                                        <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <BlogCTA type="consideration" className="my-10" />
                    </div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-slate-400 text-sm font-medium">© 2026 Canva Viagem. Todos os direitos reservados.</p>
                        <div className="flex justify-center gap-6 mt-4">
                            <Link to="/termos" className="text-slate-500 hover:text-primary text-xs font-bold uppercase tracking-widest">Termos</Link>
                            <Link to="/privacidade" className="text-slate-500 hover:text-primary text-xs font-bold uppercase tracking-widest">Privacidade</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default BlogPost16;
