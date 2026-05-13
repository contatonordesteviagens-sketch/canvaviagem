import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, MessageSquare } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost41 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Manual do ChatGPT Para Agência de Viagem: Prompts Prontos Para Vender Mais",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>ChatGPT Para Agência de Viagem: Manual Completo</title>
                <meta name="description" content="Aprenda a usar o ChatGPT na sua agência de viagem com prompts prontos para criar legendas, roteiros, respostas a clientes e conteúdo para o Instagram." />
                <meta name="keywords" content="ChatGPT para agência de viagem, prompts ChatGPT agente de viagem, como usar ChatGPT turismo, inteligência artificial para agência de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/chatgpt-para-agencia-de-viagem-manual-completo" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Manual do ChatGPT Para Agência de Viagem" />
                <meta property="og:description" content="O guia definitivo para agentes de viagem autônomos criarem conteúdo em minutos." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/webinar/chatgpt_agencia_viagem_1773093400001_1773103323481.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-6 italic">Série IA · Automação</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Manual do ChatGPT Para Agência de Viagem: <span className="text-indigo-600">Prompts Prontos</span></h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">12 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/webinar/chatgpt_agencia_viagem_1773093400001_1773103323481.png"
                                alt="Agente de viagem usando ChatGPT"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed text-justify">
                            <p className="text-xl font-medium text-slate-800 italic">Se você é agente de viagem e ainda não incorporou o ChatGPT à sua rotina de trabalho, este artigo vai mudar isso.</p>

                            <p>O ChatGPT, desenvolvido pela OpenAI, é hoje a ferramenta de inteligência artificial mais usada no mundo. Mas existe uma diferença enorme entre usá-lo de forma genérica e usá-lo com método, com prompts calibrados para a realidade de uma agência de viagem.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">A Lógica do Prompt Perfeito</h2>
                            <p>Antes dos prompts prontos, entenda a estrutura que faz um prompt funcionar bem: <strong>[Persona] + [Tarefa] + [Contexto] + [Formato] + [Tom]</strong>.</p>

                            <div className="bg-indigo-50 p-8 rounded-2xl border border-indigo-100 my-10">
                                <h4 className="flex items-center gap-2 font-black text-indigo-900 mb-4"><MessageSquare size={20} /> Prompt Exemplo: Legenda de Destino</h4>
                                <p className="text-indigo-900/80 italic font-mono text-sm">"Você é especialista em marketing para agências de viagem no Brasil. Crie uma legenda para um post de Instagram sobre [DESTINO], com foco em despertar desejo em casais entre 30 e 45 anos. Tom: inspiracional, caloroso."</p>
                            </div>

                            <p>Para uma agente de viagem que precisa criar conteúdo diariamente, responder perguntas de clientes e montar roteiros, o ChatGPT funciona como um assistente que trabalha 24 horas.</p>

                            <BlogCTA type="awareness" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Prompts Para Atendimento</h2>
                            <p>Um dos maiores ganhos está no atendimento. Use este prompt para responder clientes que comparam seu preço com sites de busca:</p>

                            <div className="bg-slate-900 text-slate-100 p-8 rounded-2xl my-10 shadow-xl font-mono text-sm leading-relaxed">
                                "Escreva uma resposta de WhatsApp para um cliente que disse que encontrou o mesmo pacote mais barato no Decolar. A resposta deve ser consultiva, educada e destacar o suporte 24h e curadoria personalizada."
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">ChatGPT + Conteúdo Pronto</h2>
                            <p>O ChatGPT resolve o texto, mas o visual profissional é o que para o scroll. A combinação ideal é usar a IA para legendas e um acervo premium para o visual.</p>

                            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-3xl p-12 my-12 text-center shadow-2xl relative overflow-hidden">
                                <h3 className="text-3xl font-black mb-6 italic">O Mapa da Agência 5 Estrelas</h3>
                                <p className="mb-8 text-indigo-200 text-xl max-w-2xl mx-auto font-medium">Na Aula Secreta, mostramos como integrar o ChatGPT ao seu fluxo de trabalho real para vender mais.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-white text-indigo-900 font-black px-10 py-4 rounded-xl hover:bg-indigo-50 transition-all shadow-xl">Garantir Minha Vaga <ArrowRight size={20} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2026 Canva Viagem. Inteligência Artificial a serviço do agente autônomo.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost41;
