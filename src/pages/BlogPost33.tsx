import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost33 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Decolar e Booking São Seus Concorrentes? A Verdade Que Nenhum Curso de Turismo Te Conta",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Agente de Viagem vs Decolar: Como Ganhar do Menor Preço?</title>
                <meta name="description" content="A maioria dos agentes acha que o Decolar é o inimigo. Descubra por que isso é um equívoco e como posicionar sua agência acima da briga por preço." />
                <meta name="keywords" content="agente de viagem vs Decolar, como competir com Decolar agência pequena, posicionamento agência de viagem, diferencial agente de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/decolar-booking-concorrentes-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Decolar e Booking São Seus Concorrentes? A Verdade Revelada" />
                <meta property="og:description" content="Saia da guerra de preços e aprenda a vender valor real para o seu cliente." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/updated/decolar_vs_agencia_updated.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/assets/blog/updated/decolar_vs_agencia_updated.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6 italic">Webinar 2026 · Posicionamento</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Decolar e Booking São Seus Concorrentes? <span className="text-blue-600">A Verdade Inconveniente</span></h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">10 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/updated/decolar_vs_agencia_updated.png"
                                alt="Agente de viagem especialista atendendo o cliente com autoridade"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed">
                            <p className="text-xl font-medium text-slate-800">Se você sente aquele frio no estômago toda vez que alguém menciona o Decolar ou o Booking, este artigo foi escrito para você.</p>

                            <p>Essa sensação — esse medo de competir com plataformas bilionárias — está baseada em uma premissa incorreta. Enquanto você continuar operando com essa premissa, vai tomar decisões de marketing que enfraquecem o seu negócio.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Que as OTAs Realmente Vendem</h2>
                            <p>As OTAs (Online Travel Agencies) vendem conveniência transacional. Elas são mecanismos de busca e comparação de preços. Não há consultoria, não há curadoria, não há um ser humano avaliando se aquele pacote faz sentido.</p>

                            <p className="bg-blue-600 text-white p-6 rounded-2xl font-bold shadow-lg">Você vende uma coisa completamente diferente: <strong>segurança, curadoria e experiência personalizada.</strong></p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Por Que Você Está Perdendo Clientes para as Plataformas?</h2>
                            <p>A resposta é dolorosa: <strong>porque o seu marketing não está comunicando a diferença.</strong></p>
                            <p>Quando o seu Instagram é uma sequência de posts com preços, promoções e fotos de destinos — exatamente o mesmo formato das OTAs —, você está competindo no campo delas. No campo do preço, elas ganham sempre.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Campo Onde Você Sempre Ganha</h2>
                            <p>Existe um campo onde as OTAs não conseguem competir: a relação humana e a autoridade especializada. Para o seu cliente ideal, pagar R$ 500 de fee de consultoria não é custo, é investimento para garantir que as férias da família sejam perfeitas.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Como o Conteúdo Posiciona Você Acima das OTAs</h2>
                            <p>Quando você publica conteúdo que demonstra conhecimento real (ex: "Por que eu não recomendo cruzeiros no Mediterrâneo em agosto"), você cria autoridade. Você elimina a comparação de preço, porque o cliente agora confia no seu julgamento profissional.</p>

                            <BlogCTA type="decision" className="my-16" />

                            <div className="bg-white border-2 border-dashed border-blue-200 p-8 my-12 rounded-3xl">
                                <h3 className="text-2xl font-black mb-4 text-blue-600 text-center">Saia da Guerra de Preços</h3>
                                <p className="text-center mb-6">Pare de distribuir pacotes e comece a vender consultoria de verdade.</p>
                                <div className="text-center">
                                    <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-blue-600 text-white font-black px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors">Ver o Mapa da Agência 5 Estrelas <ArrowRight size={18} /></Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm mb-4">© 2026 Canva Viagem. Marketing e posicionamento para agentes autônomos.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost33;
