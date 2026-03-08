import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, Bot, CheckCircle, Lightbulb } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost9 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Como usar o ChatGPT para Criar Roteiros Irresistíveis em Minutos",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Como usar o ChatGPT para Criar Roteiros Irresistíveis em Minutos | Canva Viagem</title>
                <meta
                    name="description"
                    content="Aprenda prompts exatos para usar a Inteligência Artificial na criação de roteiros personalizados que encantam seus clientes."
                />
                <meta
                    name="keywords"
                    content="chatgpt turismo, inteligência artificial agência de viagem, roteiros personalizados ia, produtividade agência viagem"
                />
                <link rel="canonical" href="https://canvaviagem.com/blog/chatgpt-roteiros-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Como usar o ChatGPT para Criar Roteiros Irresistíveis em Minutos" />
                <meta property="og:description" content="A IA não vai substituir o agente, mas o agente que usa IA vai substituir quem não usa." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop" />
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
                        <span className="text-slate-600">ChatGPT e Roteiros</span>
                    </nav>

                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-6">
                        IA · Inovação
                    </span>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Como usar o ChatGPT para Criar
                        <span className="text-emerald-600"> Roteiros em Minutos</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Calendar size={14} className="text-primary" />
                            <span className="font-medium">13 de março de 2026</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock size={14} className="text-primary" />
                            <span className="font-medium">7 minutos de leitura</span>
                        </div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium">
                            <Share2 size={14} />
                            <span>Compartilhar</span>
                        </button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="rounded-2xl overflow-hidden shadow-xl mb-10 border border-gray-200">
                            <img
                                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop"
                                alt="Inteligência Artificial e Viagens"
                                className="w-full h-auto"
                            />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            A Inteligência Artificial chegou para ser a sua assistente de marketing e operações. Em 2026, quem domina as ferramentas de IA produz 10x mais com o mesmo esforço.
                        </p>

                        <BlogCTA type="awareness" className="my-10 shadow-emerald-50" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">O Segredo do Prompt</h2>
                        <p className="text-slate-600 leading-relaxed">
                            O erro comum é pedir: "Crie um roteiro para Gramado". O resultado será genérico. O segredo é dar contexto. Quanto mais detalhes você der sobre o perfil dos clientes, melhor será o roteiro.
                        </p>

                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 my-10 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Bot className="text-emerald-500" /> Prompt de Mestre
                            </h3>
                            <p className="text-slate-700 text-sm">
                                "Atue como um especialista em turismo de luxo. Crie um roteiro de 5 dias para Gramado focado em um casal em lua de mel que ama gastronomia e experiências exclusivas. Inclua horários sugeridos e curiosidades sobre cada local."
                            </p>
                        </div>

                        <ul className="space-y-4 text-slate-600">
                            <li className="flex gap-3">
                                <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                                <span><strong className="text-slate-900">Personalização Extrema:</strong> Use a IA para criar opções de "Upgrade" para o roteiro, surpreendendo o cliente.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                                <span><strong className="text-slate-900">Curadoria é sua:</strong> A IA gera a base, mas você aplica o seu toque de especialista, validando se aqueles horários e locais fazem sentido.</span>
                            </li>
                        </ul>

                        <BlogCTA type="consideration" className="my-10" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Muito Além dos Roteiros</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Use também para criar legendas de posts, responder e-mails complexos ou até para sugerir temas de campanhas de vendas baseadas na sazonalidade do mercado.
                        </p>

                        <BlogCTA type="decision" className="my-16 shadow-emerald-100" />
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

export default BlogPost9;
