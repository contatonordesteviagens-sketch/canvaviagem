import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, Smartphone, MessageCircle, Camera } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost14 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: "Instagram para Agente de Viagens: Guia Definitivo 2026", url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const tips = [
        { num: "01", title: "Bio que converte em 5 segundos", desc: "Sua bio é seu cartão de visita. Ela precisa responder: quem você ajuda, com o quê e como entrar em contato. Exemplo: '✈️ Agente de Viagens | Destinos Nacionais e Europa | Orçamento grátis no link 👇'", icon: <Smartphone size={20} className="text-blue-500" /> },
        { num: "02", title: "Foto de perfil profissional (não selfie)", desc: "Sua foto de perfil define a percepção de credibilidade. Use uma foto com boa iluminação, fundo neutro ou de viagem e expressão confiante. Avatar ou logo só funcionam quando a agência já tem marca conhecida.", icon: <Camera size={20} className="text-purple-500" /> },
        { num: "03", title: "Destaques organizados e informativos", desc: "Crie destaques: 'Destinos', 'Depoimentos', 'Pacotes', 'Sobre mim', 'Como contratar'. Visitantes que chegam ao seu perfil navegam pelos destaques antes de mandar mensagem. Um destaque bem feito substitui um site completo.", icon: <Camera size={20} className="text-rose-500" /> },
        { num: "04", title: "Frequência de 4 a 5 posts por semana no feed", desc: "O algoritmo do Instagram prioriza perfis que publicam regularmente. Abaixo de 3 posts por semana, o alcance cai dramaticamente. Acima de 5, começa a ter retorno exponencial.", icon: <Smartphone size={20} className="text-emerald-500" /> },
        { num: "05", title: "Stories diários para manter o engajamento", desc: "Stories são o canal de conversão mais direto. 'Veja o destino do dia', enquetes ('Você prefere praia ou montanha?'), reagendamentos de pacotes, depoimentos de clientes. Cada Story mantém seu nome no topo da memória do seguidor.", icon: <Camera size={20} className="text-amber-500" /> },
        { num: "06", title: "Reels com gancho nos primeiros 3 segundos", desc: "Reels viralizam. Mas apenas os que prendem atenção nos 3 primeiros segundos. Use perguntas ('Você sabia que...?'), dados surpreendentes ('Dubai custa menos que Miami?') ou afirmações provocativas ('Parar de viajar está te custando dinheiro.').", icon: <Smartphone size={20} className="text-indigo-500" /> },
        { num: "07", title: "Responda TODOS os comentários e DMs", desc: "Comentário respondido = alcance orgânico dobrado. DM respondida em menos de 1h = chance de venda 3x maior. Configurar respostas automáticas no Instagram Business para as perguntas mais frequentes economiza tempo e aumenta conversão.", icon: <MessageCircle size={20} className="text-cyan-500" /> },
    ];

    return (
        <>
            <Helmet>
                <title>Instagram para Agente de Viagens: Guia Definitivo 2026 | Canva Viagem</title>
                <meta name="description" content="Guia completo de Instagram para agente de viagens em 2026. Como configurar o perfil, que conteúdo publicar, frequência ideal e como transformar seguidores em clientes." />
                <meta name="keywords" content="instagram para agente de viagens, perfil agência de viagem instagram, como crescer no instagram viagens, conteúdo instagram turismo, bio instagram agência de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/instagram-para-agente-de-viagens" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Instagram para Agente de Viagens: O Guia Definitivo 2026" />
                <meta property="og:description" content="Aprenda a montar e crescer um perfil de Instagram para agência de viagem que vende de verdade." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Instagram para Agente de Viagens: O Guia Definitivo 2026",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-18", "dateModified": "2026-03-18",
                    "url": "https://canvaviagem.com/blog/instagram-para-agente-de-viagens",
                    "image": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Instagram para Agente de Viagens</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-pink-600 bg-pink-50 border border-pink-100 px-3 py-1 rounded-full mb-6">Instagram · Estratégia</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Instagram para Agente de Viagens:
                        <span className="text-primary"> O Guia Definitivo 2026</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">18 de março de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">13 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1200&auto=format&fit=crop" alt="Instagram para agentes de viagem" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Em 2026, o Instagram não é mais uma rede social de lazer para agentes de viagem. <strong className="text-slate-900">É o principal canal de vendas.</strong> Mais de 70% dos clientes que contratam agentes autônomos hoje os descobriram pelo Instagram. Ainda assim, 9 em cada 10 agentes estão usando a plataforma de forma errada.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <p className="text-slate-600 leading-relaxed">
                            Não se trata de ter milhões de seguidores. Trata-se de ter o <strong>tipo certo de presença</strong> — conteúdo estratégico que aparece para as pessoas certas, no momento certo, e que as converte em consultas e vendas. Aqui estão os 7 pilares de um Instagram que vende.
                        </p>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">
                            ✅ Os 7 Pilares de um Instagram que Vende Viagens
                        </h2>

                        {tips.map((tip) => (
                            <div key={tip.num} className="flex gap-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                    {tip.icon}
                                    <span className="text-2xl font-black text-slate-200">{tip.num}</span>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 mb-2 text-base">{tip.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{tip.desc}</p>
                                </div>
                            </div>
                        ))}

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6">
                            📅 Calendário Semanal de Conteúdo
                        </h2>

                        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-900 text-white">
                                    <tr>
                                        <th className="text-left py-3 px-5 font-bold">Dia</th>
                                        <th className="text-left py-3 px-4 font-bold">Tipo de Post</th>
                                        <th className="text-left py-3 px-4 font-bold">Objetivo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { dia: "Segunda", tipo: "Reel — Dica de Destino", obj: "Alcance & Viralização" },
                                        { dia: "Terça", tipo: "Carrossel — Roteiro ou Lista", obj: "Salvamentos & Autoridade" },
                                        { dia: "Quarta", tipo: "Post de Oferta em Destaque", obj: "Conversão direta" },
                                        { dia: "Quinta", tipo: "Story com Enquete ou Quiz", obj: "Engajamento & Interação" },
                                        { dia: "Sexta", tipo: "Depoimento de cliente", obj: "Prova social & Confiança" },
                                        { dia: "Sábado", tipo: "Bastidores / pessoal", obj: "Conexão humana" },
                                        { dia: "Domingo", tipo: "Post inspiracional de viagem", obj: "Desejo & Sonho" },
                                    ].map((row, i) => (
                                        <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-t border-gray-100`}>
                                            <td className="py-3 px-5 font-bold text-slate-900">{row.dia}</td>
                                            <td className="py-3 px-4 text-slate-600">{row.tipo}</td>
                                            <td className="py-3 px-4 text-slate-500 text-xs">{row.obj}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mt-6">
                            <p className="font-black text-rose-900 mb-2">⚡ O Maior Problema: Criar Conteúdo Todo Dia</p>
                            <p className="text-rose-700 text-sm leading-relaxed">Seguir esse calendário exige produzir conteúdo de alta qualidade 7 dias por semana. Agentes que tentam criar tudo do zero desistem em menos de 30 dias. A solução está em ter uma biblioteca de conteúdo pronto — vídeos, artes e templates editáveis — que transformam o processo de horas em minutos.</p>
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

export default BlogPost14;
