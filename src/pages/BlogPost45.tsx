import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, Target } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost45 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Perplexity AI Para Agência de Viagem: A Ferramenta de Pesquisa Definitiva",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Perplexity AI Para Agência de Viagem: Pesquisa Rápida</title>
                <meta name="description" content="O Perplexity AI é o motor de busca com IA que substitui horas de Google. Aprenda a pesquisar destinos e tendências em segundos com fontes verificadas." />
                <meta name="keywords" content="Perplexity AI para agência de viagem, ferramenta pesquisa IA turismo, Perplexity turismo como usar" />
                <link rel="canonical" href="https://canvaviagem.com/blog/perplexity-ai-para-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Perplexity AI: O Fim das Horas no Google" />
                <meta property="og:description" content="Encontre informações precisas e verificadas em segundos." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/webinar/perplexity_ai_agencia_1773093400005_1773103377139.png" />
            </Helmet>

            <div className="min-h-screen bg-gray-50 text-slate-900">
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">Voltar ao site</span>
                        </Link>
                        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">Canva Viagem</Link>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-6 py-12 pb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-6 italic">Série IA · Fast Search</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Perplexity AI Para Agência de Viagem: <span className="text-emerald-700">Expertise Instantânea</span></h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">8 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/webinar/perplexity_ai_agencia_1773093400005_1773103377139.png"
                                alt="Agente de viagem pesquisando no Perplexity AI"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed text-justify">
                            <p className="text-xl font-medium text-slate-800 italic">O Perplexity AI é o motor de busca com inteligência artificial que responde com fontes verificadas em tempo real.</p>

                            <p>No Google, você recebe links. No Perplexity, você recebe a resposta sintetizada, com fontes citadas ao lado. Para um agente que precisa de requisitos de visto ou clima atualizado agora, isso corta horas de pesquisa.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Usos Práticos No Turismo</h2>
                            <ul className="space-y-4">
                                <li><strong>Vistos e Regras:</strong> "Quais os requisitos atuais para brasileiros em [PAÍS]?"</li>
                                <li><strong>Tendências de 2026:</strong> "Quais destinos estão crescendo no Brasil agora?"</li>
                                <li><strong>Reviews Recentes:</strong> "Quais as reclamações mais comuns do hotel [NOME] este mês?"</li>
                            </ul>

                            <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 my-10">
                                <h4 className="flex items-center gap-2 font-black text-emerald-900 mb-4"><Target size={20} /> Prompt de Especialista</h4>
                                <p className="text-emerald-900/80 italic font-mono text-sm leading-relaxed">"Quais são as experiências mais exclusivas e menos turísticas em Santorini para um casal de alto padrão? Cite fontes confiáveis."</p>
                            </div>

                            <BlogCTA type="consideration" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Pesquisa Profunda, Conteúdo Pronto</h2>
                            <p>O Perplexity resolve a dúvida. O Canva Viagem resolve o post. Esse encaixe entre rapidez e visual premium é o que separa os profissionais dos amadores no Instagram.</p>

                            <div className="bg-gradient-to-br from-emerald-900 to-green-900 text-white rounded-3xl p-12 my-12 text-center shadow-2xl relative overflow-hidden">
                                <h3 className="text-3xl font-black mb-6 italic">Seja a Referência no Mercado</h3>
                                <p className="mb-8 text-emerald-100 text-xl max-w-2xl mx-auto font-medium">Na Aula Secreta, revelamos como usar o Perplexity para criar posts de autoridade que param o scroll.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-white text-emerald-900 font-black px-10 py-4 rounded-xl hover:bg-indigo-50 transition-all shadow-xl">Garantir Meu Lugar <ArrowRight size={20} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2026 Canva Viagem. Informação certa, no tempo certo.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost45;
