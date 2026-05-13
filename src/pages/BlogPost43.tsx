import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, Sparkles } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost43 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Claude IA Para Agência de Viagem: O Assistente Que Escreve Como Consultora Premium",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Claude IA Para Agência de Viagem: Redação Premium</title>
                <meta name="description" content="Conheça o Claude, o assistente de IA da Anthropic, e veja como criar propostas e conteúdo que não parecem robóticos para seu público premium." />
                <meta name="keywords" content="Claude IA para agência de viagem, Anthropic Claude turismo, assistente IA para agente de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/claude-ia-para-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Claude IA: Textos Premium Para Agências" />
                <meta property="og:description" content="Fuja da escrita robótica com a IA mais sofisticada do mercado." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/updated/claude_ia_updated.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/assets/blog/updated/claude_ia_updated.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full mb-6 italic">Série IA · Luxury Writing</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Claude Para Agência de Viagem: <span className="text-amber-600">Voz Humana</span></h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">11 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/updated/claude_ia_updated.png"
                                alt="Agente de viagem revisando texto do Claude"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed text-justify">
                            <p className="text-xl font-medium text-slate-800 italic">O Claude, desenvolvido pela Anthropic, se destaca por uma qualidade específica: ele não soa como robô.</p>

                            <p>Enquanto o ChatGPT é excelente para estrutura, o Claude brilha na nuance. Se você vende roteiros de luxo ou atende clientes de alto padrão, o tom de voz importa. Uma legenda escrita pelo Claude tem uma cadência humana que gera confiança imediata.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Por Que Usar o Claude?</h2>
                            <p>Ele é excepcionalmente bom em três frentes: **Raciocínio Aprofundado**, **Textos Longos e Coerentes** e **Personalização de Tom**.</p>

                            <div className="bg-amber-50 p-8 rounded-2xl border border-amber-100 my-10">
                                <h4 className="flex items-center gap-2 font-black text-amber-900 mb-4"><Sparkles size={20} /> Prompt Para Proposta Luxury</h4>
                                <p className="text-amber-900/80 italic font-mono text-sm leading-relaxed">"Você é uma consultora de viagens de luxo. Crie uma proposta para [DESTINO] para um casal em lua de mel. Tom: sofisticado, caloroso, evite clichês de folheto turístico."</p>
                            </div>

                            <BlogCTA type="decision" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">A Diferença Está no Detalhe</h2>
                            <p>Vender um pacote de R$ 15.000 com uma legenda genérica cria uma dissonância. O Claude permite que você produza textos no nível da consultoria que você oferece.</p>

                            <div className="bg-gradient-to-br from-amber-700 to-amber-900 text-white rounded-3xl p-12 my-12 text-center shadow-2xl relative overflow-hidden">
                                <h3 className="text-3xl font-black mb-6 italic">Domine a Escrita Premium</h3>
                                <p className="mb-8 text-amber-100 text-xl max-w-2xl mx-auto font-medium">Sua agência merece uma voz de autoridade. Descubra o mapa completo na nossa Aula Secreta.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-white text-amber-900 font-black px-10 py-4 rounded-xl hover:bg-amber-50 transition-all shadow-xl">Garantir Vaga <ArrowRight size={20} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2026 Canva Viagem. Tecnologia com alma para agentes de valor.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost43;
