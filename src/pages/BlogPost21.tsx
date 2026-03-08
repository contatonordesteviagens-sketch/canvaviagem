import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, BarChart2, TrendingUp, DollarSign } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost21 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: "Como Montar um Calendário de Conteúdo para Agência de Viagem", url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Como Montar um Calendário de Conteúdo para Agência de Viagem 2026 | Canva Viagem</title>
                <meta name="description" content="Aprenda a criar um calendário de conteúdo eficiente para sua agência de viagem. Planejamento mensal, semanal e datas sazonais do turismo que geram mais vendas." />
                <meta name="keywords" content="calendário de conteúdo agência de viagem, planejar posts instagram turismo, calendário editorial agente de viagem, datas importantes turismo 2026" />
                <link rel="canonical" href="https://canvaviagem.com/blog/calendario-conteudo-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Como Montar um Calendário de Conteúdo para Agência de Viagem" />
                <meta property="og:description" content="Planejamento completo de conteúdo mensal e semanal para agentes de viagem que querem postar com estratégia." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Como Montar um Calendário de Conteúdo para Agência de Viagem",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-25", "dateModified": "2026-03-25",
                    "url": "https://canvaviagem.com/blog/calendario-conteudo-agencia-de-viagem",
                    "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Calendário de Conteúdo</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full mb-6">Planejamento · Conteúdo</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Como Montar um Calendário de Conteúdo para Agência de Viagem
                        <span className="text-primary"> que Realmente Funciona</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">25 de março de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">11 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop" alt="Calendário de conteúdo para agência de viagem" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            O maior inimigo do agente de viagem no Instagram não é a concorrência — é a improvisação. Acordar todo dia sem saber o que postar é o caminho mais rápido para postar cada vez menos e perder visibilidade. <strong className="text-slate-900">Um calendário de conteúdo bem planejado resolve esse problema de uma vez por todas.</strong>
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">📅 O Calendário Anual do Turismo</h2>
                        <p className="text-slate-600 leading-relaxed">O turismo tem sazonalidade previsível. Aproveitá-la é a decisão mais inteligente que um agente pode tomar no planejamento de conteúdo.</p>

                        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-900 text-white">
                                    <tr>
                                        <th className="text-left py-3 px-5 font-bold">Mês</th>
                                        <th className="text-left py-3 px-4 font-bold">Foco de Conteúdo</th>
                                        <th className="text-left py-3 px-4 font-bold">Público-Alvo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { mes: "Jan–Fev", foco: "Carnaval, Nordeste, Verão", publico: "Famílias, Grupos" },
                                        { mes: "Março", foco: "Destinos de Páscoa, Nacional", publico: "Casais, Famílias" },
                                        { mes: "Abril–Maio", foco: "Europa (clima bom), Lua de mel", publico: "Casais, Noivos" },
                                        { mes: "Junho–Julho", foco: "Frio: Gramado, Campos do Jordão, Europa", publico: "Famílias (férias escolares)" },
                                        { mes: "Agosto–Set", foco: "Orlando, EUA, Cruzeiros", publico: "Famílias, Adultos" },
                                        { mes: "Out–Nov", foco: "Black Friday Viagens, Fim de Ano", publico: "Todos os segmentos" },
                                        { mes: "Dezembro", foco: "Réveillon, Natal Luz, Maldivas, EUA", publico: "Grupos, Casais, Famílias" },
                                    ].map((row, i) => (
                                        <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-t border-gray-100`}>
                                            <td className="py-3 px-5 font-bold text-slate-900">{row.mes}</td>
                                            <td className="py-3 px-4 text-slate-600">{row.foco}</td>
                                            <td className="py-3 px-4 text-slate-500 text-xs">{row.publico}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6">📱 Modelo de Calendário Semanal (Para Copiar)</h2>
                        <div className="space-y-3">
                            {[
                                { dia: "Segunda", tipo: "📸 Reel de Destino", desc: "Vídeo curto de 15-30s sobre um destino da semana. Use gancho: 'Você sabia que dá para ir pra esse paraíso por menos de R$3.000?'" },
                                { dia: "Terça", tipo: "📚 Carrossel Educativo", desc: "Lista de dicas ('5 coisas que você precisa saber antes de viajar para...'). Alto salvamento = alto alcance." },
                                { dia: "Quarta", tipo: "💰 Oferta da Semana", desc: "Post de destaque com pacote disponível, preço e CTA para contato. Simples, direto, com imagem atraente." },
                                { dia: "Quinta", tipo: "❓ Story Interativo", desc: "Enquete, quiz ou caixinha de perguntas sobre preferências de viagem. Mantém engajamento e gera insights do cliente." },
                                { dia: "Sexta", tipo: "⭐ Depoimento de Cliente", desc: "Foto/texto de cliente satisfeito + destino. Prova social é o conteúdo que mais converte a decisão de contratar." },
                                { dia: "Sábado", tipo: "✨ Inspiração Visual", desc: "Imagem espetacular de um destino com legenda motivacional ou fato curioso. Alto compartilhamento orgânico." },
                                { dia: "Domingo", tipo: "🗣️ Bastidores / Pessoal", desc: "Um pouco de você: onde você estaria agora, destino favorito, história de viagem. Humaniza o perfil." },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <div className="w-20 flex-shrink-0">
                                        <span className="font-black text-slate-900 text-xs">{item.dia}</span>
                                        <p className="text-[11px] text-slate-500 mt-1">{item.tipo}</p>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            {[
                                { icon: <BarChart2 size={24} className="text-blue-500 mx-auto mb-2" />, title: "Planeje mensalmente", desc: "Reserve 2 horas por mês para definir os temas e pautas do mês inteiro antes de ele começar." },
                                { icon: <TrendingUp size={24} className="text-emerald-500 mx-auto mb-2" />, title: "Analise semanalmente", desc: "Toda segunda, veja os 3 posts de maior alcance da semana anterior. Faça mais do que funciona." },
                                { icon: <DollarSign size={24} className="text-amber-500 mx-auto mb-2" />, title: "Vincule a vendas", desc: "Para cada conteúdo de venda, planeje 3 posts de valor antes. Prepara o terreno para o cliente dizer sim." },
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                                    {item.icon}
                                    <p className="font-black text-slate-900 text-sm mb-1">{item.title}</p>
                                    <p className="text-slate-500 text-xs">{item.desc}</p>
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

export default BlogPost21;
