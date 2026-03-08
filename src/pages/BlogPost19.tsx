import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, Plane, Sun, MapPin } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost19 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: "Melhores Destinos Nacionais para Viajar com Família em 2026", url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const destinations = [
        { name: "Maragogi, AL", emoji: "🏖️", desc: "As piscinas naturais mais bonitas do Brasil. Água turquesa, areia branca, temperatura perfeita. Ideal para famílias com crianças pequenas pelo fácil acesso às piscinas rasas.", highlight: "Alta demanda em julho e dezembro" },
        { name: "Porto de Galinhas, PE", emoji: "🐠", desc: "Destino clássico de família que nunca sai de moda. Jangadas nas piscinas naturais, praia, gastronomia local. Muito procurado por famílias de todas as regiões do Brasil.", highlight: "Melhor época: de setembro a novembro" },
        { name: "Gramado & Canela, RS", emoji: "🌲", desc: "O destino de frio favorito do Brasil. No inverno, tempestade de encomenda. No natal, Natal Luz famoso mundialmente. Perfeito para famílias que querem fugir do calor.", highlight: "Pico: junho a agosto e dezembro" },
        { name: "Bonito, MS", emoji: "🐟", desc: "Ecoturismo de classe internacional. Rio de Prata, Abismo de Anhumas, boia cross. Para famílias aventureiras que querem natureza sem abrir mão do conforto.", highlight: "Agendamento antecipado obrigatório" },
        { name: "Campos do Jordão, SP", emoji: "⛰️", desc: "A Suíça brasileira. Festival de Inverno em julho atrai turistas nacionais. Fondue, arquitetura europeia, trilhas e atividades para toda família.", highlight: "Julho: alta temporada garantida" },
        { name: "Florianópolis, SC", emoji: "🏄", desc: "42 praias para todos os gostos: surf, piscinas naturais, lagoa, dunas. Infraestrutura turística superior. Uma das mais completas do Brasil para família.", highlight: "Alta temporada: dezembro a fevereiro" },
    ];

    return (
        <>
            <Helmet>
                <title>Melhores Destinos Nacionais para Família em 2026 | Canva Viagem</title>
                <meta name="description" content="Descubra os melhores destinos nacionais para viajar em família em 2026. Maragogi, Porto de Galinhas, Gramado, Bonito e mais. Guia completo de destinos com filhos." />
                <meta name="keywords" content="destinos nacionais família 2026, melhores praias para família brasil, viagem nacional criança, onde viajar brasil com família, destino família agência de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/melhores-destinos-nacionais-familia-2026" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Melhores Destinos Nacionais para Família em 2026" />
                <meta property="og:description" content="Guia completo com os melhores destinos no Brasil para viajar em família, com dicas de época e perfil de cliente." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Melhores Destinos Nacionais para Família em 2026",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-23", "dateModified": "2026-03-23",
                    "url": "https://canvaviagem.com/blog/melhores-destinos-nacionais-familia-2026",
                    "image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Destinos Nacionais para Família</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full mb-6">Destinos · Família</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Os 6 Melhores Destinos Nacionais para Família em 2026 —
                        <span className="text-primary"> Guia Completo para Agentes</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">23 de março de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">9 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1200&auto=format&fit=crop" alt="Destinos nacionais para família" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Famílias com crianças são um dos segmentos mais ativos do turismo nacional. Elas viajam nas férias de julho e janeiro de forma quase obrigatória — e quando encontram um agente de confiança que <strong className="text-slate-900">entende do destino e facilita tudo</strong>, a fidelidade é altíssima.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <div className="grid grid-cols-3 gap-3 my-8">
                            {[
                                { icon: <Sun size={20} className="text-amber-500 mx-auto mb-1" />, label: "Praias", count: "3 destinos" },
                                { icon: <MapPin size={20} className="text-emerald-500 mx-auto mb-1" />, label: "Serra/Natureza", count: "2 destinos" },
                                { icon: <Plane size={20} className="text-blue-500 mx-auto mb-1" />, label: "Urbano", count: "1 destino" }
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-center">
                                    {item.icon}
                                    <p className="font-black text-slate-900 text-xs">{item.label}</p>
                                    <p className="text-slate-500 text-xs">{item.count}</p>
                                </div>
                            ))}
                        </div>

                        {destinations.map((dest, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-2xl">{dest.emoji}</span>
                                    <h2 className="text-xl font-black text-slate-900">{i + 1}. {dest.name}</h2>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{dest.desc}</p>
                                <div className="bg-sky-50 border border-sky-100 rounded-xl p-3">
                                    <p className="text-sky-700 text-xs font-semibold">⏰ {dest.highlight}</p>
                                </div>
                            </div>
                        ))}

                        <div className="bg-slate-900 text-white rounded-2xl p-8 mt-8">
                            <h3 className="font-black text-xl mb-4">🎯 Como Vender Mais para Famílias</h3>
                            <ul className="space-y-3 text-slate-300 text-sm">
                                <li className="flex gap-3"><span className="text-primary">→</span><span>Crie posts com as frases mais pesquisadas: "melhores praias para levar filho pequeno", "destino barato para família"</span></li>
                                <li className="flex gap-3"><span className="text-primary">→</span><span>Filmes de viagem curtos passando imagens de piscinas naturais e crianças em destinos geram muito compartilhamento</span></li>
                                <li className="flex gap-3"><span className="text-primary">→</span><span>Ofereça pacotes com seguro viagem e assistência 24h — isso é decisivo para pais</span></li>
                                <li className="flex gap-3"><span className="text-primary">→</span><span>Faça posts de "qual destino para julho?" a partir de março — é quando as famílias começam a planejar</span></li>
                            </ul>
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

export default BlogPost19;
