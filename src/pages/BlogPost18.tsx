import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, Heart, Users, TrendingUp } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost18 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: "Viagem de Lua de Mel: Como Vender Pacotes Premium como Agente", url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Viagem de Lua de Mel: Como Vender Pacotes Premium como Agente | Canva Viagem</title>
                <meta name="description" content="Aprenda como agentes de viagem podem vender pacotes de lua de mel premium com tickets altos. Roteiros de Maldivas, Paris, Bali e Grécia com comissões de R$1.000 a R$5.000." />
                <meta name="keywords" content="lua de mel destinos agente de viagem, como vender lua de mel turismo, pacotes lua de mel agência, viagem de noivos agente de viagem, destinos românticos 2026" />
                <link rel="canonical" href="https://canvaviagem.com/blog/vender-pacotes-lua-de-mel-agente-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Lua de Mel: Como Vender Pacotes Premium e Ganhar Comissões Altas" />
                <meta property="og:description" content="O nicho de lua de mel é um dos mais lucrativos do turismo. Aprenda a vender e a criar conteúdo para esse público." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Viagem de Lua de Mel: Como Vender Pacotes Premium como Agente",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-22", "dateModified": "2026-03-22",
                    "url": "https://canvaviagem.com/blog/vender-pacotes-lua-de-mel-agente-viagem",
                    "image": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Vender Lua de Mel</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full mb-6">Lua de Mel · Premium</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Lua de Mel: O Nicho Mais Lucrativo do Turismo —
                        <span className="text-primary"> Como se Especializar e Vender Mais</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">22 de março de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">10 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop" alt="Casal em viagem de lua de mel" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Lua de mel é diferente de qualquer outra viagem. O casal não está procurando o mais barato — está procurando o <strong className="text-slate-900">mais perfeito</strong>. E isso significa tickets altos, clientes dispostos a investir e comissões que podem representar semanas de trabalho em uma única venda.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: <Heart size={24} className="text-rose-500 mx-auto mb-2" />, title: "Ticket Médio Alto", desc: "R$15.000 a R$60.000 por casal. Comissão de 10% = R$1.500 a R$6.000 por venda." },
                                { icon: <Users size={24} className="text-pink-500 mx-auto mb-2" />, title: "Clientes Fiéis", desc: "Casais de lua de mel que têm boa experiência voltam pra aniversários, filhos, etc." },
                                { icon: <TrendingUp size={24} className="text-purple-500 mx-auto mb-2" />, title: "Demanda Constante", desc: "No Brasil, há cerca de 1 milhão de casamentos por ano. A demanda não para." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                                    {item.icon}
                                    <p className="font-black text-slate-900 text-sm mb-1">{item.title}</p>
                                    <p className="text-slate-500 text-xs">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6">💎 Os 5 Destinos de Lua de Mel Mais Vendidos</h2>
                        {[
                            { dest: "🇲🇻 Maldivas", ticket: "R$25.000 – R$60.000", why: "O destino dos sonhos de 80% dos casais brasileiros. Overwater bungalows, mar cristalino. É o top não negociável." },
                            { dest: "🇬🇷 Grécia (Santorini + Atenas)", ticket: "R$15.000 – R$30.000", why: "Cenário iconicamente romântico. Fotos incríveis. Cada hotel em Santorini é uma experiência." },
                            { dest: "🇮🇹 Itália (Roma + Amalfi + Veneza)", ticket: "R$18.000 – R$35.000", why: "Cultura, gastronomia e romance. Casais com perfil mais culto adoram o roteiro clássico italiano." },
                            { dest: "🇧🇦 Bali, Indonésia", ticket: "R$12.000 – R$22.000", why: "Tendência crescente. Exótico, fotogênico, acessível. Geração Y está escolhendo muito." },
                            { dest: "🇦🇪 Dubai + Abu Dhabi", ticket: "R$10.000 – R$25.000", why: "Luxo acessível comparado às Maldivas. Casais que querem exclusividade sem gastar o dobro." },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <span className="text-2xl flex-shrink-0 mt-0.5">{item.dest.split(" ")[0]}</span>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="font-black text-slate-900 text-base">{item.dest.split(" ").slice(1).join(" ")}</h3>
                                        <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">{item.ticket}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.why}</p>
                                </div>
                            </div>
                        ))}

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6">📱 Como Atrair Casais no Instagram</h2>
                        <p className="text-slate-600 leading-relaxed">O segredo para atrair clientes de lua de mel no Instagram é criar conteúdo que <strong>desperta o sonho</strong>. Vídeos de overwater bungalows, fotos de por do sol em Santorini, scripts inspiracionais sobre compartilhar o mundo com quem você ama. Esse tipo de conteúdo emocional é o que hace o casal mandar DM perguntando "quanto custa?"</p>
                        <p className="text-slate-600 leading-relaxed">Use hashtags específicas: #luademel, #lademelbrasileiros, #noivado, #casamento2026, #destinosromânticos. E crie uma série de highlights dedicados a cada destino romântico.</p>

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

export default BlogPost18;
