import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, MapPin, Plane, Star } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost13 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: "Quanto Ganha um Agente de Viagens no Brasil", url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Quanto Ganha um Agente de Viagens no Brasil em 2026 | Canva Viagem</title>
                <meta name="description" content="Descubra quanto ganha um agente de viagens no Brasil em 2026 — salários, comissões e o potencial real de renda para autônomos. Dados reais e estratégias para maximizar ganhos." />
                <meta name="keywords" content="quanto ganha agente de viagens, salário agente de viagem, comissão agente de viagem, renda agente de turismo, agente de viagem autônomo ganhos" />
                <link rel="canonical" href="https://canvaviagem.com/blog/quanto-ganha-agente-de-viagens" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Quanto Ganha um Agente de Viagens no Brasil em 2026?" />
                <meta property="og:description" content="Salários, comissões e o potencial real de renda para agentes autônomos de turismo." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Quanto Ganha um Agente de Viagens no Brasil em 2026?",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-17", "dateModified": "2026-03-17",
                    "url": "https://canvaviagem.com/blog/quanto-ganha-agente-de-viagens",
                    "image": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Quanto ganha Agente de Viagens</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full mb-6">Carreira · Ganhos</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Quanto Ganha um Agente de Viagens no Brasil em 2026?
                        <span className="text-primary"> Os Números Reais</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">17 de março de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">9 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop" alt="dinheiro e passaporte representando ganhos de agente de viagens" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Essa é a primeira pergunta de quem está considerando entrar no turismo: <strong>"Vale a pena financeiramente?"</strong>. A resposta curta: <strong className="text-slate-900">depende muito de como você trabalha</strong>. A resposta longa — com os números reais — está aqui.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">📊 Tabela de Ganhos por Perfil</h2>

                        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-900 text-white">
                                    <tr>
                                        <th className="text-left py-4 px-5 font-bold">Perfil</th>
                                        <th className="text-center py-4 px-4 font-bold">Vendas/mês</th>
                                        <th className="text-center py-4 px-4 font-bold">Renda Estimada</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { perfil: "Iniciante (0-6 meses)", vendas: "2–5 pacotes", renda: "R$400 – R$2.000", color: "bg-white" },
                                        { perfil: "Em desenvolvimento (6–12 meses)", vendas: "5–15 pacotes", renda: "R$2.000 – R$6.000", color: "bg-slate-50" },
                                        { perfil: "Consolidado (1–3 anos)", vendas: "15–30 pacotes", renda: "R$6.000 – R$15.000", color: "bg-white" },
                                        { perfil: "Top performer (3+ anos)", vendas: "30+ pacotes", renda: "R$15.000 – R$40.000+", color: "bg-amber-50" },
                                    ].map((row, i) => (
                                        <tr key={i} className={`${row.color} border-t border-gray-100`}>
                                            <td className="py-4 px-5 font-medium text-slate-700">{row.perfil}</td>
                                            <td className="py-4 px-4 text-center text-slate-500">{row.vendas}</td>
                                            <td className="py-4 px-4 text-center font-bold text-slate-900">{row.renda}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="text-slate-500 text-xs italic">* Estimativas baseadas em ticket médio de R$2.500/pacote e comissão média de 10%. Valores podem variar significativamente por região e nicho.</p>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6">💡 O Que Diferencia Quem Ganha Mais</h2>

                        {[
                            { icon: <MapPin size={20} className="text-blue-500" />, title: "Especialização em nicho premium", desc: "Agentes de lua de mel, cruzeiros e viagens internacionais têm tickets maiores (R$5.000 a R$30.000 por venda). Uma única venda de lua de mel para Maldivas pode gerar R$2.000 a R$4.000 de comissão." },
                            { icon: <Plane size={20} className="text-purple-500" />, title: "Volume de conteúdo no Instagram", desc: "Os agentes com maior renda postam conteúdo diariamente. Isso gera leads constantes sem custo de anúncio. Um perfil de 10.000 seguidores engajados converte de 1 a 3 clientes por mês organicamente." },
                            { icon: <Star size={20} className="text-amber-500" />, title: "Sistema de Indicações", desc: "Agentes top performers têm um clube de clientes satisfeitos que indicam automaticamente. Uma boa experiência de atendimento é o marketing mais poderoso do turismo." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                                <div>
                                    <h3 className="font-black text-slate-900 mb-1 text-base">{item.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-8">
                            <p className="font-black text-amber-900 mb-2 text-lg">⚡ Simulação Rápida de Ganhos</p>
                            <p className="text-amber-800 text-sm leading-relaxed mb-4">Se você vender apenas <strong>2 pacotes de viagem por semana</strong>, com ticket médio de R$3.000 e comissão de 10%:</p>
                            <div className="space-y-2 text-sm">
                                <p className="text-amber-900"><strong>→ Por semana:</strong> R$600</p>
                                <p className="text-amber-900"><strong>→ Por mês:</strong> R$2.400</p>
                                <p className="text-amber-900"><strong>→ Por ano:</strong> R$28.800</p>
                                <p className="text-amber-700 text-xs mt-3">Isso operando 2h por dia no Instagram com conteúdo profissional.</p>
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6">🚀 Como Acelerar os Resultados</h2>
                        <p className="text-slate-600 leading-relaxed">O maior acelerador da renda no turismo é a <strong>presença constante no Instagram</strong>. Quem posta todo dia aparece para mais pessoas, gera mais consultas e fecha mais vendas. O problema: criar conteúdo profissional do zero todos os dias consome horas que poderiam ser dedicadas a atender mais clientes.</p>
                        <p className="text-slate-600 leading-relaxed">A solução que agentes de alto desempenho estão usando: <strong>conteúdo pronto e editável</strong> — vídeos de destinos, artes de Instagram e scripts de vendas — que permitem postar em minutos, não em horas.</p>

                        <BlogCTA type="consideration" className="my-10" />
                    </div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-slate-400 text-sm font-medium">© 2026 Canva Viagem. Todos os direitos reservados.</p>
                        <div className="flex justify-center gap-6 mt-4">
                            <Link to="/termos" className="text-slate-500 hover:text-primary text-xs font-bold uppercase tracking-widest transition-colors">Termos</Link>
                            <Link to="/privacidade" className="text-slate-500 hover:text-primary text-xs font-bold uppercase tracking-widest transition-colors">Privacidade</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default BlogPost13;
