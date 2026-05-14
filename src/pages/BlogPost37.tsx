import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, TrendingUp } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost37 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Agência vs Influenciador: Por Que Eles Ganham no Engajamento (e Como Copiar a Tática)?",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Agência vs Influenciador: O Segredo do Engajamento no Turismo</title>
                <meta name="description" content="Por que as pessoas comentam nos posts de influenciadores mas apenas ignoram as agências? Descubra como aplicar táticas de retenção no seu perfil." />
                <meta name="keywords" content="engajamento instagram turismo, marketing de influência para agência de viagem, como criar conteúdo de viagem engajador, agência de viagem instagram dicas" />
                <link rel="canonical" href="https://canvaviagem.com/blog/agencia-vs-influenciador-engajamento-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Agência vs Influenciador: Por Que Eles Ganham no Engajamento?" />
                <meta property="og:description" content="Aprenda a estratégia de conexão que transforma seguidores em admiradores e clientes." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/updated/agencia_vs_influenciador_updated.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/assets/blog/updated/agencia_vs_influenciador_updated.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-6 italic">Webinar 2026 · Estratégia de Conteúdo</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Agência vs Influenciador: Por Que Eles Ganham no <span className="text-emerald-600">Engajamento</span>?</h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">9 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/updated/agencia_vs_influenciador_updated.png"
                                alt="Diferença visual entre post de agência e post de influenciador"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed">
                            <p className="text-xl font-medium text-slate-800">Já percebeu que um influenciador de viagem posta uma foto tomando café e recebe 500 comentários, enquanto você posta um roteiro incrível e recebe 3 curtidas?</p>

                            <p>Isso acontece por um motivo simples: <strong>influenciadores vendem experiência e conexão humana. Agências costumam vender logística e transação.</strong></p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Segredo Não É o Destino, É o Ponto de Vista</h2>
                            <p>As pessoas não seguem influenciadores para ver fotos de aviões ou hotéis. Elas seguem pelo **julgamento** dessas pessoas. Elas querem saber: "O que você achou disso?".</p>
                            <p>O erro das agências é postar como um "folheto digital". O influenciador posta como um "amigo que viaja". Para ganhar no engajamento, você precisa assumir sua voz como especialista. Menos "Vejam este hotel" e mais "Três motivos pelos quais este hotel é perfeito para famílias com bebês".</p>

                            <div className="bg-emerald-50 border-2 border-emerald-100 p-8 my-10 rounded-2xl relative">
                                <TrendingUp className="text-emerald-500 absolute top-4 right-4" size={32} />
                                <h4 className="font-black text-emerald-900 text-xl mb-4 italic">O que você pode copiar hoje:</h4>
                                <ul className="space-y-4">
                                    <li><strong>Storytelling:</strong> Conte a história de um problema que você resolveu para um cliente (sem citar nomes).</li>
                                    <li><strong>Rosto no Feed:</strong> Pessoas se conectam com pessoas. Mostre quem está por trás do planejamento.</li>
                                    <li><strong>Opinião Forte:</strong> Não tenha medo de dizer o que você não recomenda. Isso gera autoridade.</li>
                                </ul>
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Humanize sua Autoridade</h2>
                            <p>Você é uma agente, não um bot de reservas. Quando o cliente percebe que há um cérebro estratégico e um coração apaixonado por viagens por trás do perfil, o engajamento acontece naturalmente. O segredo é equilibrar o profissionalismo da agência com a autenticidade do influenciador.</p>

                            <BlogCTA type="decision" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Saindo da Invisibilidade</h2>
                            <p>Agentes que dominam essa linguagem de conexão e autoridade não precisam "caçar" clientes. Os clientes chegam prontos para fechar, porque já sentem que conhecem e confiam na agente através do conteúdo.</p>

                            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-10 my-12 text-center shadow-xl">
                                <h3 className="text-2xl md:text-3xl font-black mb-6 italic underline decoration-emerald-300">Domine a Estratégia dos Grandes no Turismo</h3>
                                <p className="mb-8 text-emerald-50 text-lg mx-auto max-w-2xl">Descubra como criar um perfil que gera desejo e orçamentos orgânicos todos os dias.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-black px-10 py-4 rounded-xl hover:bg-emerald-50 transition-all shadow-lg">Garantir Minha Vaga <ArrowRight size={20} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2026 Canva Viagem. Conexão e vendas para agentes de viagem.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost37;
