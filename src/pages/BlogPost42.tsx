import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, Search } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost42 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Google Gemini Para Agência de Viagem: O Guia Completo Para Vender Mais",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Google Gemini Para Agência de Viagem: Guia Completo</title>
                <meta name="description" content="Descubra como usar o Google Gemini para pesquisar destinos, planejar roteiros e atrair mais clientes para sua agência de viagem." />
                <meta name="keywords" content="Google Gemini para agência de viagem, inteligência artificial Google turismo, Gemini prompts agente de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/google-gemini-para-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Google Gemini no Turismo: Guia Prático" />
                <meta property="og:description" content="A potência do Google integrada ao seu atendimento de viagens." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/updated/google_gemini_updated.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/assets/blog/updated/google_gemini_updated.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6 italic">Série IA · Google Ecosystem</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Google Gemini Para Agência de Viagem: <span className="text-blue-600">O Guia Completo</span></h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">10 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/updated/google_gemini_updated.png"
                                alt="Agente de viagem usando Google Gemini"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed text-justify">
                            <p className="text-xl font-medium text-slate-800 italic">O Google Gemini é a resposta da maior empresa de tecnologia do mundo à revolução da IA.</p>

                            <p>Para agentes de viagem, a integração do Gemini com o ecossistema Google (Maps, Drive, Gmail) é um diferencial absoluto. Você pode pesquisar informações em tempo real e resumir e-mails de operadoras em segundos.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">As 5 Aplicações Poderosas</h2>
                            <ul className="space-y-4">
                                <li><strong>Pesquisa em Tempo Real:</strong> Requisitos de visto e clima atualizados.</li>
                                <li><strong>Análise de Imagens:</strong> Envie uma foto de hotel e peça a legenda ideal.</li>
                                <li><strong>Síntese de E-mails:</strong> Peça ao Gemini para resumir as promoções da semana no Gmail.</li>
                                <li><strong>Roteiros com Google Maps:</strong> Planos de viagem integrados a links reais de localização.</li>
                            </ul>

                            <BlogCTA type="consideration" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6 flex items-center gap-2"><Search className="text-blue-600" /> Prompt de Inteligência de Mercado</h2>
                            <div className="bg-slate-900 text-slate-100 p-8 rounded-2xl my-10 font-mono text-sm leading-relaxed shadow-xl">
                                "Pesquise agências de viagem especializadas em [NICHO] no Instagram. Analise o tipo de conteúdo que mais engaja e sugira 10 temas de posts que eu poderia criar para me diferenciar."
                            </div>

                            <p>O Gemini facilita a sua vida técnica. Mas para converter seguidor em cliente, você precisa de um posicionamento profissional.</p>

                            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-3xl p-12 my-12 text-center shadow-2xl relative overflow-hidden">
                                <h3 className="text-3xl font-black mb-6 italic">IA + Design Premium</h3>
                                <p className="mb-8 text-blue-200 text-xl max-w-2xl mx-auto font-medium">No webinar Mapa da Agência 5 Estrelas, revelamos como dominar o mercado usando as ferramentas de IA do Google.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-white text-blue-900 font-black px-10 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-xl">Inscreva-se Gratuitamente <ArrowRight size={20} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2026 Canva Viagem. O futuro do turismo é integrado e inteligente.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost42;
