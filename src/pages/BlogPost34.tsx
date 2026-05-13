import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, AlertTriangle } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost34 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "O Perigo Silencioso de um Perfil Abandonado no Instagram: Por que Isso Mata sua Agência?",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>O Perfil Abandonado no Instagram: Por Que Sua Agência Perde Vendas?</title>
                <meta name="description" content="Um perfil sem postagens recentes é pior do que não ter perfil. Descubra como um feed desatualizado destrói a confiança do seu cliente de viagem." />
                <meta name="keywords" content="perfil abandonado instagram agência, autoridade digital turismo, marketing para agentes de viagem, confiança do cliente viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/perfil-abandonado-instagram-perigo-agencia-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="O Perigo Silencioso de um Perfil Abandonado no Instagram" />
                <meta property="og:description" content="Descubra por que a falta de postagens regulares está afastando seus melhores clientes." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/webinar/perfil_abandonado_1773093299043.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full mb-6 italic">Webinar 2026 · Autoridade Digital</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">O Perigo Silencioso de um <span className="text-red-600">Perfil Abandonado</span> no Instagram</h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">8 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/webinar/perfil_abandonado_1773093299043.png"
                                alt="Representação visual de um perfil de agência de viagem desatualizado e sem vida"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed">
                            <p className="text-xl font-medium text-slate-800">Imagine a cena: você recebe uma indicação de uma agência. Antes de entrar em contato, você busca o Instagram da empresa para "checar o trabalho".</p>

                            <p>O último post foi há 23 dias. O anterior, há dois meses. E nos Reels? Nada há semanas. Qual é o seu primeiro pensamento? <strong>"Será que essa agência ainda existe?"</strong> ou <strong>"Se eles não cuidam nem da própria casa, vão cuidar da minha viagem?"</strong>.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Efeito "Portas Fechadas" no Digital</h2>
                            <p>No mercado de viagens, você não vende um produto físico que o cliente leva na hora. Você vende uma promessa. E promessas exigem confiança absoluta.</p>
                            <p>Um perfil abandonado comunica negligência. Para o cliente que está prestes a transferir R$ 15.000 para uma viagem de família, o silêncio no seu feed soa como um sinal de alerta vermelho.</p>

                            <div className="bg-red-50 border-l-4 border-red-500 p-8 my-10 rounded-r-2xl">
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="text-red-500 mt-1 shrink-0" size={24} />
                                    <div>
                                        <h4 className="font-black text-red-900 text-xl mb-2">A Pior Mensagem que Você Pode Passar:</h4>
                                        <p className="text-red-800 italic text-lg">"Estou muito ocupada ou não tenho profissionalismo para manter meu negócio atualizado."</p>
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Como Manter o Fluxo Sem Enlouquecer</h2>
                            <p>O problema da maioria dos agentes não é preguiça — é a falta de um sistema. Eles tentam criar tudo na hora, do zero, e quando a semana fica corrida (emissões, cotações, imprevistos), a primeira coisa que morre é o Instagram.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Volume vs. Qualidade</h2>
                            <p>Você não precisa postar 3 vezes por dia. Mas precisa de consistência mínima. 3 posts estratégicos por semana são infinitamente melhores do que 7 posts aleatórios ou 15 dias de silêncio absoluto.</p>

                            <BlogCTA type="awareness" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Plano de Reativação</h2>
                            <p>Se o seu perfil está parado, não tente voltar com um "estive sumida mas voltei". Ninguém se importa. Volte entregando valor, mostrando os bastidores de um planejamento ou dando uma dica que economiza dinheiro do seu passageiro.</p>

                            <div className="bg-slate-900 text-white rounded-3xl p-10 my-12 shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-black mb-6 italic">Saia da Invisibilidade Hoje</h3>
                                    <p className="mb-8 text-slate-300 text-lg">Descubra o sistema que permite manter seu Instagram profissional com menos de 30 minutos por semana.</p>
                                    <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-blue-600 text-white font-black px-10 py-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all transform hover:scale-105">Quero Meu Perfil Estratégico <ArrowRight size={20} /></Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm mb-4">© 2026 Canva Viagem. Autoridade e confiança para o agente de viagem.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost34;
