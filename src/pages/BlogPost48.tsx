import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, BookOpen } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost48 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Google NotebookLM Para Agência de Viagem: Como Organizar Pesquisas e Criar Conteúdo Baseado em Dados",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Google NotebookLM Para Agência de Viagem: Curadoria IA</title>
                <meta name="description" content="O Google NotebookLM é a ferramenta definitiva para agentes de viagem que precisam organizar propostas, sintetizar guias e criar conteúdo baseado em documentos." />
                <meta name="keywords" content="Google NotebookLM agência de viagem, curadoria viagens IA, organizar pesquisas turismo" />
                <link rel="canonical" href="https://canvaviagem.com/blog/google-notebooklm-para-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Google NotebookLM: Sua Cérebro Digital no Turismo" />
                <meta property="og:description" content="Organize propostas e roteiros complexos com o NotebookLM." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/updated/google_notebooklm_updated.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/assets/blog/updated/google_notebooklm_updated.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-6 italic">Série IA · Document Insight</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Google NotebookLM No Turismo: <span className="text-indigo-700">Mente Organizada</span></h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">9 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/updated/google_notebooklm_updated.png"
                                alt="Agente de viagem organizando documentos com NotebookLM"
                                className="w-full h-auto object-cover opacity-90 brightness-95"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed text-justify">
                            <p className="text-xl font-medium text-slate-800 italic">O NotebookLM não é apenas um chat — é um caderno inteligente que entende os seus documentos específicos.</p>

                            <p>Imagine carregar 10 PDFs de catálogos de hotéis ou operadoras e poder perguntar: "Qual hotel tem a melhor política para crianças?". O NotebookLM lê tudo e responde com precisão, citando a página do documento.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Fim do Caos dos PDFs</h2>
                            <p>Agentes de viagem lidam com excesso de informação. O NotebookLM serve como sua segunda memória. Você pode até pedir para ele criar um roteiro baseado apenas nos hotéis que você gosta e já pesquisou.</p>

                            <div className="bg-indigo-50 p-8 rounded-2xl border border-indigo-100 my-10">
                                <h4 className="flex items-center gap-2 font-black text-indigo-900 mb-4"><BookOpen size={20} /> Automação de Curadoria</h4>
                                <p className="text-indigo-900/80 italic font-mono text-sm leading-relaxed">"Baseado nestes links/PDFs sobre [DESTINO], crie 5 curiosidades que nenhum outro agente sabe para eu postar no meu Stories."</p>
                            </div>

                            <BlogCTA type="consideration" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Profissionalismo Com Base em Dados</h2>
                            <p>Quando você responde um cliente com dados precisos e rápidos, sua autoridade sobe 10 níveis. O NotebookLM é o seu cérebro de consultora em esteroides.</p>

                            <div className="bg-gradient-to-br from-indigo-800 to-indigo-950 text-white rounded-3xl p-12 my-12 text-center shadow-2xl relative overflow-hidden">
                                <h3 className="text-3xl font-black mb-6 italic">Organize o Sucesso</h3>
                                <p className="mb-8 text-indigo-100 text-xl max-w-2xl mx-auto font-medium">Descubra o sistema completo de organização IA no webinar Mapa da Agência 5 Estrelas.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-white text-indigo-900 font-black px-10 py-4 rounded-xl hover:bg-slate-50 transition-all shadow-xl">Garantir Minha Vaga <ArrowRight size={20} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2026 Canva Viagem. Inteligência que organiza, design que vende.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost48;
