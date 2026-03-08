import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, MessageSquare, Phone, CheckCircle, Zap } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost5 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Como Converter Seguidores em Clientes no WhatsApp",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Como Converter Seguidores em Clientes no WhatsApp | Canva Viagem</title>
                <meta
                    name="description"
                    content="Aprenda o script exato e as estratégias de abordagem para transformar seguidores do Instagram em clientes pagantes no WhatsApp da sua agência."
                />
                <meta
                    name="keywords"
                    content="vendas whatsapp agência de viagem, converter seguidores whatsapp, script vendas turismo, fechamento vendas whatsapp, atendimento agência de viagem"
                />
                <link rel="canonical" href="https://canvaviagem.com/blog/converter-seguidores-whatsapp" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Como Converter Seguidores em Clientes no WhatsApp" />
                <meta property="og:description" content="O guia definitivo para fechar mais vendas de pacotes turísticos pelo WhatsApp." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "Como Converter Seguidores em Clientes no WhatsApp",
                    "description": "O script exato que as agências de sucesso usam para fechar vendas pelo aplicativo de mensagens.",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-09",
                    "dateModified": "2026-03-09",
                    "url": "https://canvaviagem.com/blog/converter-seguidores-whatsapp"
                })}</script>
            </Helmet>

            <div className="min-h-screen bg-gray-50 text-slate-900">
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">Voltar ao site</span>
                        </Link>
                        <Link to="/" className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Canva Viagem
                        </Link>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-6 py-12 pb-32">
                    <nav className="text-sm text-slate-400 mb-6 font-medium">
                        <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                        <span className="mx-2">/</span>
                        <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-600">Converter Seguidores no WhatsApp</span>
                    </nav>

                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full mb-6">
                        Vendas · WhatsApp
                    </span>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Como Converter Seguidores em
                        <span className="text-green-600"> Clientes no WhatsApp</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Calendar size={14} className="text-primary" />
                            <span className="font-medium">9 de março de 2026</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock size={14} className="text-primary" />
                            <span className="font-medium">8 minutos de leitura</span>
                        </div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium">
                            <Share2 size={14} />
                            <span>Compartilhar</span>
                        </button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="rounded-2xl overflow-hidden shadow-xl mb-10 border border-gray-200">
                            <img
                                src="https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=1200&auto=format&fit=crop"
                                alt="Atendimento de agência de viagem via WhatsApp"
                                className="w-full h-auto"
                            />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            O Instagram atrai o olhar. O WhatsApp fecha a venda. Em 2026, a agência que não domina a arte da conversa no Zap está perdendo dinheiro todos os dias.
                        </p>

                        <BlogCTA type="awareness" className="my-10 shadow-green-50" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">A Ponte: Do Direct ao WhatsApp</h2>
                        <p className="text-slate-600 leading-relaxed">
                            O maior erro dos agentes é tentar vender pacotes pelo Direct do Instagram. O Direct é raso e cheio de distrações. O objetivo deve ser sempre: levar o cliente para o WhatsApp o mais rápido possível.
                        </p>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-10 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Zap className="text-yellow-500" /> Gatilho de Transição
                            </h3>
                            <p className="text-slate-700 text-sm">
                                "Olá [Nome]! Que bom que gostou desse roteiro de [Destino]. Para eu te enviar os valores atualizados e as opções de voos, podemos falar pelo WhatsApp? É mais rápido para eu te mandar as fotos reais dos hotéis por lá."
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">A Primeira Impressão no Zap</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Em 2026, o cliente valoriza a rapidez, mas abomina a frieza de um robô. Seja humanizado. Use áudios curtos (máximo 40 segundos) e chame o cliente pelo nome.
                        </p>

                        <ul className="space-y-4 text-slate-600">
                            <li className="flex gap-3">
                                <CheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                <span><strong className="text-slate-900">Pergunte antes de oferecer:</strong> Entenda o motivo da viagem (férias, comemoração, lazer).</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                <span><strong className="text-slate-900">Use Prova Social:</strong> Envie um print de um cliente que acabou de voltar desse mesmo destino.</span>
                            </li>
                        </ul>

                        <BlogCTA type="consideration" className="my-10" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Fechamento: O Script de Sucesso</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Não termine a conversa com "Qualquer coisa me avisa". Termine com uma pergunta de fechamento ou opção dupla: "Prefere que eu reserve as vagas desse hotel agora ou quer incluir o seguro viagem antes?".
                        </p>

                        <BlogCTA type="decision" className="my-16 shadow-green-100" />
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

export default BlogPost5;
