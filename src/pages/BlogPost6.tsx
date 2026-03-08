import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, Users, CheckCircle, TrendingUp } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost6 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Como Fechar Vendas de Grupos e Faturar 5x Mais",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Como Fechar Vendas de Grupos e Faturar 5x Mais | Canva Viagem</title>
                <meta
                    name="description"
                    content="Vender para grupos é o caminho mais curto para escalar o faturamento da sua agência. Aprenda como organizar, divulgar e fechar grupos lucrativos."
                />
                <meta
                    name="keywords"
                    content="vendas de grupos viagem, como montar grupos de viagem, turismo de grupos, escalar faturamento agência de viagem"
                />
                <link rel="canonical" href="https://canvaviagem.com/blog/fechar-vendas-grupos-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Como Fechar Vendas de Grupos e Faturar 5x Mais" />
                <meta property="og:description" content="O guia para transformar sua agência em uma máquina de vendas de grupos." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1539635278303-d4002c07dee3?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <div className="min-h-screen bg-gray-50 text-slate-900">
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">Voltar ao site</span>
                        </Link>
                        <Link to="/" className="text-xl font-bold text-slate-800 tracking-tight">
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
                        <span className="text-slate-600">Vendas de Grupos</span>
                    </nav>

                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">
                        Estratégia · Grupos
                    </span>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Como Fechar Vendas de Grupos e
                        <span className="text-blue-600"> Faturar 5x Mais</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Calendar size={14} className="text-primary" />
                            <span className="font-medium">10 de março de 2026</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock size={14} className="text-primary" />
                            <span className="font-medium">10 minutos de leitura</span>
                        </div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium">
                            <Share2 size={14} />
                            <span>Compartilhar</span>
                        </button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="rounded-2xl overflow-hidden shadow-xl mb-10 border border-gray-200">
                            <img
                                src="https://images.unsplash.com/photo-1539635278303-d4002c07dee3?q=80&w=1200&auto=format&fit=crop"
                                alt="Grupo de viajantes felizes"
                                className="w-full h-auto"
                            />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Se você quer parar de vender apenas passagens e começar a faturar alto, a resposta está nos grupos. Vender para 20 pessoas de uma vez exige esforço, mas o lucro é exponencialmente maior.
                        </p>

                        <BlogCTA type="awareness" className="my-10 shadow-blue-50" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Por que Grupos são a "Mina de Ouro"?</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Organizar um grupo permite que você negocie tarifas especiais com hotéis e receptivos, aumentando sua margem de lucro. Além disso, a dinâmica de grupo cria o senso de comunidade, o que facilita vendas futuras.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 my-10 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Users className="text-blue-500" /> O Poder da Prova Social
                            </h3>
                            <p className="text-slate-700 text-sm">
                                "Em um grupo, um cliente anima o outro. Quando você posta que faltam apenas 5 vagas, o gatilho da escassez atua com força total no grupo de interessados."
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Como Divulgar seu Grupo</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Não poste apenas o "card" com preço. Conte uma história. Mostre os benefícios exclusivos de viajar com a sua agência (receptivo próprio, guia acompanhante, kit viagem exclusivo).
                        </p>

                        <ul className="space-y-4 text-slate-600">
                            <li className="flex gap-3">
                                <CheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                                <span><strong className="text-slate-900">Reunião de Lançamento:</strong> Faça uma live ou reunião via Zoom para apresentar o roteiro e tirar dúvidas.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                                <span><strong className="text-slate-900">Lista de Espera:</strong> Crie um grupo de WhatsApp exclusivo para quem quer receber as informações do grupo antes de todo mundo.</span>
                            </li>
                        </ul>

                        <BlogCTA type="consideration" className="my-10" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Estratégia de Fechamento</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Ofereça um bônus para os primeiros 5 confirmados. Isso gera imediatismo e ajuda a fechar o quorum mínimo do grupo rapidamente.
                        </p>

                        <BlogCTA type="decision" className="my-16 shadow-blue-100" />
                    </div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-slate-400 text-sm font-medium">© 2026 Canva Viagem. Todos os direitos reservados.</p>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default BlogPost6;
