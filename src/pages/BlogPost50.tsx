import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, Medal } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost50 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "O Guia Definitivo de IA Para Agências de Viagem em 2026: O Que Realmente Funciona",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>O Guia Definitivo de IA Para Agência de Viagem 2026</title>
                <meta name="description" content="O resumo de tudo: ChatGPT, Gemini, Claude, Manus AI e muito mais. Entenda o ecossistema de Inteligência Artificial e como ele vai triplicar o faturamento da sua agência." />
                <meta name="keywords" content="futuro agência de viagem 2026, inteligência artificial turismo guia, IA para agentes de viagem lucrativa" />
                <link rel="canonical" href="https://canvaviagem.com/blog/guia-definitivo-ia-para-agencia-de-viagem-2026" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="O Futuro Chegou: Guia IA 2026 Para Turistólogos" />
                <meta property="og:description" content="Não seja substituído pela IA. Use-a para se tornar insubstituível." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/webinar/mapa_agencia_5_estrelas_convite_1773093394115.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#FFD700] bg-slate-900 px-3 py-1 rounded-full mb-6 italic border border-primary/20">Guia Final · Edição 2026</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Guia Definitivo de IA No Turismo: <span className="text-primary italic">O Que Importa</span></h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">15 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/webinar/mapa_agencia_5_estrelas_convite_1773093394115.png"
                                alt="Agência de viagem do futuro 2026"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed text-justify">
                            <p className="text-xl font-medium text-slate-800 italic">Chegamos ao final da nossa série de IA. Mas este é apenas o começo da revolução para a sua agência de viagem.</p>

                            <p>Em 2026, quem não domina as ferramentas de Inteligência Artificial não será substituído pela IA em si, mas será substituído por **outro agente que domina a IA**. O jogo mudou. A velocidade é a nova moeda do turismo.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Resumo da Ópera</h2>
                            <ul className="space-y-4">
                                <li><strong>ChatGPT/Claude:</strong> A voz da sua marca e a mente criativa.</li>
                                <li><strong>Gemini/Perplexity:</strong> Seus olhos no mercado e pesquisa técnica.</li>
                                <li><strong>Manus AI:</strong> Suas mãos que executam no automático.</li>
                                <li><strong>Veo 3:</strong> Seu estúdio de cinema particular.</li>
                            </ul>

                            <div className="bg-slate-900 text-white p-10 rounded-3xl my-10 border-l-8 border-primary shadow-2xl">
                                <h4 className="flex items-center gap-2 font-black text-primary mb-4 text-2xl uppercase tracking-tighter"><Medal size={24} /> O Próximo Passo: Inscreva-se</h4>
                                <p className="text-slate-300 italic text-lg leading-relaxed">"O conhecimento sem ação gera frustração. A ação sem design gera pobreza. Una IA + Design + Vendas no Mapa da Agência 5 Estrelas."</p>
                            </div>

                            <BlogCTA type="decision" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6 text-center">Sua Jornada Começa Agora</h2>
                            <p>Você tem as ferramentas. Agora você precisa do Mapa. O webinar de 18/03 é o marco zero para a sua agência faturar o que sempre sonhou enquanto trabalha menos.</p>

                            <div className="bg-gradient-to-br from-primary via-indigo-900 to-black text-white rounded-3xl p-16 my-12 text-center shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                <h3 className="text-4xl md:text-5xl font-black mb-8 italic tracking-tighter">O MAPA DA AGÊNCIA 5 ESTRELAS</h3>
                                <p className="mb-10 text-primary-foreground/90 text-2xl max-w-3xl mx-auto font-black uppercase leading-tight">O evento que vai separar as amadoras das agências milionárias.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-3 bg-white text-primary font-black px-12 py-6 rounded-2xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.3)] text-xl">QUERO MEU ACESSO GRATUITO <ArrowRight size={24} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm font-bold">© 2026 Canva Viagem. Liderando a revolução digital no turismo brasileiro.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost50;
