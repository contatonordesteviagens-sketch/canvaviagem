import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost24 = () => {
    const handleShare = () => {
        if (navigator.share) { navigator.share({ title: "Reels para Agência de Viagem: Como Criar Vídeos que Viralizam", url: window.location.href }); }
        else { navigator.clipboard.writeText(window.location.href); }
    };

    const hooks = [
        { num: "1", hook: "A pergunta provocativa", ex: "'Você sabia que dá pra ir pra Europa por menos de R$4.000?'", why: "Desperta curiosidade imediata. Quem pensa que Europa é caro precisa ver isso." },
        { num: "2", hook: "O dado surpreendente", ex: "'Em Dubai, uma diária de hotel 5 estrelas custa menos do que em São Paulo.'", why: "Contradiz a percepção popular. Muito compartilhado por quem quer provar algo a um amigo." },
        { num: "3", hook: "A afirmação polêmica", ex: "'Quem não viaja pelo menos uma vez por ano está perdendo dinheiro.'", why: "Gera reações (concordância ou discordância) — o algoritmo ama isso." },
        { num: "4", hook: "O resultado por identificação", ex: "'Ela ganhou R$3.000 fazendo isso no celular em casa. Deixa eu te mostrar como.'", why: "O público se identifica. Conecta diretamente com a aspiração de renda extra." },
        { num: "5", hook: "O antes/depois", ex: "'Antes: sem saber nada sobre turismo. Depois de 6 meses: R$7.000/mês. O que mudou?'", why: "Formato de transformação é um dos mais consumidos e compartilhados nas redes." },
    ];

    return (
        <>
            <Helmet>
                <title>Reels para Agência de Viagem: Como Criar Vídeos que Viralizam 2026 | Canva Viagem</title>
                <meta name="description" content="Aprenda a criar Reels de alta performance para agência de viagem. Hooks que prendem, formatos que viralizam e como usar o algoritmo a favor para atrair clientes organicamente." />
                <meta name="keywords" content="reels agência de viagem, como fazer reels turismo, reels instagram viagem, vídeo para agente de viagem, conteudo video turismo instagram" />
                <link rel="canonical" href="https://canvaviagem.com/blog/reels-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Reels para Agência de Viagem: Como Criar Vídeos que Viralizam" />
                <meta property="og:description" content="Hooks, formatos e estratégias para criar Reels que viralizam e atraem clientes para sua agência de viagem." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1536240478700-b869ad10a2ab?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Reels para Agência de Viagem: Como Criar Vídeos que Viralizam",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-28", "dateModified": "2026-03-28",
                    "url": "https://canvaviagem.com/blog/reels-agencia-de-viagem",
                    "image": "https://images.unsplash.com/photo-1536240478700-b869ad10a2ab?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Reels para Agência de Viagem</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full mb-6">Reels · Vídeo</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Reels para Agência de Viagem:
                        <span className="text-primary"> Como Criar Vídeos que Viralizam (5 Hooks Testados)</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">28 de março de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">10 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1536240478700-b869ad10a2ab?q=80&w=1200&auto=format&fit=crop" alt="Reels para agência de viagem" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Reels são o formato de maior alcance orgânico no Instagram em 2026. Um único Reel bem feito pode trazer centenas de novos seguidores — e alguns deles se tornam clientes. <strong className="text-slate-900">O segredo está nos primeiros 3 segundos: o hook.</strong>
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                            <p className="font-black text-blue-900 mb-2">📌 A regra dos 3 segundos</p>
                            <p className="text-blue-700 text-sm leading-relaxed">O algoritmo do Instagram decide em 3 segundos se vai ou não distribuir seu Reel. Se o viewer pausar, assistir até o fim ou mandar para alguém, o alcance explode. Se ele scrollar, ninguém mais vê. O hook é o fator decisivo.</p>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">🎬 Os 5 Hooks que Mais Funcionam para Turismo</h2>

                        {hooks.map((h) => (
                            <div key={h.num} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">{h.num}</span>
                                    <h3 className="font-black text-slate-900 text-base">{h.hook}</h3>
                                </div>
                                <div className="bg-slate-900 rounded-xl p-3">
                                    <p className="text-green-300 text-xs font-bold mb-1">Exemplo:</p>
                                    <p className="text-white text-sm italic">"{h.ex}"</p>
                                </div>
                                <p className="text-slate-500 text-xs leading-relaxed">💡 {h.why}</p>
                            </div>
                        ))}

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">📹 Estrutura de um Reel Que Converte</h2>
                        <div className="space-y-3">
                            {[
                                { time: "0-3s", label: "HOOK", desc: "Frase ou legenda que PARA o scroll. Sem introdução, sem 'oi pessoal'." },
                                { time: "3-15s", label: "VALOR", desc: "Entrega o que prometeu no hook. Informação, dica, dado, destino mostrado." },
                                { time: "15-25s", label: "PROVA", desc: "Um exemplo real, depoimento, foto do destino, dado de referência." },
                                { time: "25-30s", label: "CTA", desc: "'Quer um orçamento personalizado? Me chama no WhatsApp / Link na bio.'" },
                            ].map((s, i) => (
                                <div key={i} className="flex gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <div className="w-14 flex-shrink-0 text-center">
                                        <span className="text-xs font-black text-slate-400">{s.time}</span>
                                        <p className="text-xs font-black text-primary mt-0.5">{s.label}</p>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-4">
                            <p className="font-black text-amber-900 mb-2">⚡ Não precisa aparecer no vídeo</p>
                            <p className="text-amber-700 text-sm leading-relaxed">Muitos agentes de sucesso nunca aparecem nos Reels. Use imagens e vídeos de destinos com texto sobreposto e narração em voz (sua voz ao vivo ou gerada por IA). O conteúdo é o que importa, não o rosto.</p>
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

export default BlogPost24;
