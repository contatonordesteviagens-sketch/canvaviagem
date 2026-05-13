import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, Zap } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost44 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Manus AI Para Agência de Viagem: O Assistente Autônomo Que Trabalha Por Você",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Manus AI Para Agência de Viagem: Agente Autônomo</title>
                <meta name="description" content="Entenda o que é o Manus AI, o primeiro agente autônomo de IA, e como automatizar pesquisas e roteiros complexos na sua agência." />
                <meta name="keywords" content="Manus AI para agência de viagem, agente autônomo IA turismo, automação agência de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/manus-ai-para-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Manus AI: A Revolução da IA Autônoma No Turismo" />
                <meta property="og:description" content="Coloque sua agência no piloto automático com o Manus AI." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/webinar/manus_ai_agencia_1773093400004_1773103364569.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-6 italic">Série IA · Autonomous Agent</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Manus AI Para Agência de Viagem: <span className="text-emerald-600">Piloto Automático</span></h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">9 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/webinar/manus_ai_agencia_1773093400004_1773103364569.png"
                                alt="Tecnologia Manus AI em operação"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed text-justify">
                            <p className="text-xl font-medium text-slate-800 italic">Imagine um assistente que pesquisa, compara e monta propostas enquanto você atende clientes no WhatsApp.</p>

                            <p>O Manus AI é o primeiro agente autônomo de inteligência artificial geral. Diferente do ChatGPT, que responde perguntas, o Manus executa tarefas completas do início ao fim por conta própria.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Que é Mente e Mãos?</h2>
                            <p>O nome Manus vem do latim para "Mão". A proposta é unir o raciocínio à execução. Ele pode navegar em sites, ler PDFs de operadoras e consolidar resultados sem sua supervisão constante.</p>

                            <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 my-10">
                                <h4 className="flex items-center gap-2 font-black text-emerald-900 mb-4"><Zap size={20} /> Exemplo de Task Autônoma</h4>
                                <p className="text-emerald-900/80 italic font-mono text-sm leading-relaxed">"Pesquise opções de hotel em Santorini para lua de mel, compare preços de voos e monte um documento organizado com as 3 melhores opções."</p>
                            </div>

                            <BlogCTA type="awareness" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Fim do Trabalho Braçal</h2>
                            <p>O Manus faz o trabalho bruto — pesquisa técnica e organização. Você faz o que gera valor: o atendimento humano e o fechamento da venda.</p>

                            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-12 my-12 text-center shadow-2xl relative overflow-hidden">
                                <h3 className="text-3xl font-black mb-6 italic">Libere Seu Tempo</h3>
                                <p className="mb-8 text-emerald-100 text-xl max-w-2xl mx-auto font-medium">Sua única tarefa na Aula Secreta é aprender a delegar o chato para a IA e focar no lucro.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-white text-emerald-900 font-black px-10 py-4 rounded-xl hover:bg-emerald-50 transition-all shadow-xl">Garantir Minha Vaga <ArrowRight size={20} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2026 Canva Viagem. Menos tela, mais vendas.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost44;
