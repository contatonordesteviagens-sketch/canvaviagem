import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, Video } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost47 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Google Veo 3: A Nova Fronteira da Criação de Vídeos de Viagem Com IA",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Google Veo 3 Para Agência de Viagem: Vídeos com IA</title>
                <meta name="description" content="Conheça o Google Veo 3, a ferramenta de vídeo generativo que permite criar Reels e vídeos paradisíacos para sua agência de viagem usando apenas texto." />
                <meta name="keywords" content="Google Veo 3 agência de viagem, vídeo IA turismo, criação vídeos viagem inteligência artificial" />
                <link rel="canonical" href="https://canvaviagem.com/blog/google-veo-3-para-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Google Veo 3: Vídeos de Viagem Gerados por IA" />
                <meta property="og:description" content="Crie vídeos cinematográficos para sua agência em segundos." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/updated/google_veo3_updated.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/assets/blog/updated/google_veo3_updated.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full mb-6 italic">Série IA · Video Generation</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Google Veo 3 Para Agência de Viagem: <span className="text-rose-600">O Cinema da IA</span></h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">10 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/updated/google_veo3_updated.png"
                                alt="Vídeo cinematográfico gerado pelo Google Veo 3"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed text-justify">
                            <p className="text-xl font-medium text-slate-800 italic">O Google Veo 3 é a ferramenta de inteligência artificial de vídeo mais avançada da história, capaz de criar clipes de 1080p e 4K com alto realismo.</p>

                            <p>Para o agente de viagem, isso resolve o maior gargalo do Instagram: a falta de vídeos de qualidade (Reels). Com o Veo 3, você digita uma descrição de praia e a IA gera um vídeo cinematográfico original e sem direitos autorais.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Vídeos Gerados vs Vídeos Reais</h2>
                            <p>O segredo não é substituir o vídeo real, mas complementar. Use o Veo 3 para criar clipes de "ambiente" ou destinos que você ainda não visitou, mantendo o seu Feed sempre hipnotizante.</p>

                            <div className="bg-rose-50 p-8 rounded-2xl border border-rose-100 my-10">
                                <h4 className="flex items-center gap-2 font-black text-rose-900 mb-4"><Video size={20} /> Prompt de Vídeo</h4>
                                <p className="text-rose-900/80 italic font-mono text-sm leading-relaxed">"Video cinematográfico de um drone sobrevoando as águas cristalinas das Maldivas durante o pôr do sol, estilo 4K, câmera lenta."</p>
                            </div>

                            <BlogCTA type="awareness" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Domine o Vídeo Antes da Concorrência</h2>
                            <p>A maioria das agências ainda usa vídeos de baixa qualidade baixados da internet. Ao usar o Veo 3, você se posiciona no topo da pirâmide visual do turismo.</p>

                            <div className="bg-gradient-to-br from-rose-900 to-black text-white rounded-3xl p-12 my-12 text-center shadow-2xl relative overflow-hidden">
                                <h3 className="text-3xl font-black mb-6 italic">Visualize o Futuro</h3>
                                <p className="mb-8 text-rose-100 text-xl max-w-2xl mx-auto font-medium">No webinar Mapa da Agência 5 Estrelas, mostramos o passo a passo para criar esse impacto visual.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-white text-rose-900 font-black px-10 py-4 rounded-xl hover:bg-rose-50 transition-all shadow-xl">Garantir Minha Vaga <ArrowRight size={20} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2026 Canva Viagem. O conteúdo que hipnotiza, a venda que acontece.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost47;
