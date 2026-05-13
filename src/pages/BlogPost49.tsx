import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, Smartphone } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost49 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Meta AI Para Agência de Viagem: Como a IA do WhatsApp e Instagram Vai Revolucionar Suas Vendas",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Meta AI Para Agência de Viagem: WhatsApp e Instagram</title>
                <meta name="description" content="A Meta AI chegou no WhatsApp, Instagram e Facebook. Aprenda a usar o botão da Meta para responder clientes, criar imagens e agilizar seu atendimento no turismo." />
                <meta name="keywords" content="Meta AI agência de viagem, IA WhatsApp turismo, como usar Meta AI Instagram agente de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/meta-ai-para-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Meta AI: Sua Nova Parceira de Vendas no WhatsApp" />
                <meta property="og:description" content="Use a IA integrada onde seus clientes estão: WhatsApp e Instagram." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/updated/meta_ai_updated.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/assets/blog/updated/meta_ai_updated.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#0668E1] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6 italic">Série IA · Meta Ecosystem</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Meta AI No Turismo: <span className="text-[#0668E1]">Venda de WhatsApp</span></h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">8 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/updated/meta_ai_updated.png"
                                alt="Agente de viagem usando Meta AI no smartphone"
                                className="w-full h-auto object-cover opacity-90 brightness-95"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed text-justify">
                            <p className="text-xl font-medium text-slate-800 italic">A Meta AI está agora dentro das ferramentas que você mais usa: WhatsApp, Instagram e Facebook.</p>

                            <p>Isso significa que você não precisa sair da conversa com o cliente para ter ideias de legendas ou pesquisar informações. O botão da Meta AI é o seu "copiloto" de atendimento em tempo real.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">WhatsApp: O Campo de Batalha</h2>
                            <p>Para o agente autônomo, o fechamento acontece no WhatsApp. Use a Meta AI para reescrever suas propostas e deixá-las mais persuasivas com apenas um toque.</p>

                            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 my-10">
                                <h4 className="flex items-center gap-2 font-black text-[#0668E1] mb-4"><Smartphone size={20} /> Automação no Zap</h4>
                                <p className="text-blue-900/80 italic font-mono text-sm leading-relaxed">"/imagine uma imagem realista de uma família feliz na Disney para eu enviar agora no grupo de interesse de clientes."</p>
                            </div>

                            <BlogCTA type="decision" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6 text-center">IA Onipresente</h2>
                            <p>O poder da Meta AI é a conveniência. Mas lembre-se: a IA dá o texto, o Canva Viagem dá o visual de luxo que converte esse texto em dinheiro.</p>

                            <div className="bg-gradient-to-br from-[#0668E1] to-black text-white rounded-3xl p-12 my-12 text-center shadow-2xl relative overflow-hidden">
                                <h3 className="text-3xl font-black mb-6 italic">A Nova Era do Turismo</h3>
                                <p className="mb-8 text-blue-100 text-xl max-w-2xl mx-auto font-medium">Saiba como dominar a Meta AI na nossa Masterclass exclusiva "O Mapa da Agência 5 Estrelas".</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-white text-[#0668E1] font-black px-10 py-4 rounded-xl hover:bg-slate-50 transition-all shadow-xl">Inscreva-se Agora <ArrowRight size={20} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2026 Canva Viagem. Onde seus clientes estão, nós estamos.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost49;
