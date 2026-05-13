import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, Target } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost35 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Agência de Viagem: Você Tem um Negócio ou um Hobby Caro?",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Agência de Viagem: Negócio ou Hobby? O Papo Reto</title>
                <meta name="description" content="Muitos agentes de viagem trabalham 12 horas por dia, mas não vêem lucro real. Descubra se você está tratando sua agência como um negócio ou apenas um hobby." />
                <meta name="keywords" content="gestão agência de viagem, lucratividade turismo, agente de viagem autônomo dicas, negócio de viagens" />
                <link rel="canonical" href="https://canvaviagem.com/blog/agencia-de-viagem-negocio-ou-hobby-caro" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Agência de Viagem: Você Tem um Negócio ou um Hobby Caro?" />
                <meta property="og:description" content="O teste definitivo emocional e financeiro para agentes de viagem autônomos." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/updated/negocio_ou_hobby_updated.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/assets/blog/updated/negocio_ou_hobby_updated.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-6 italic">Webinar 2026 · Mentalidade</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Agência de Viagem: Você Tem um Negócio ou um <span className="text-indigo-600">Hobby Caro</span>?</h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">10 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/updated/negocio_ou_hobby_updated.png"
                                alt="Diferença entre a confusão do hobby e a organização profissional"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed">
                            <p className="text-xl font-medium text-slate-800">Este artigo pode doer um pouco, mas é o choque de realidade que salva contas bancárias.</p>

                            <p>Muitos agentes de viagem autônomos vivem no que chamamos de "limbo do empreendedor". Eles trabalham muito, estão sempre cansados, respondem WhatsApp às 23h, mas quando olham para o lucro no final do mês, a conta não fecha.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Sintoma do Hobby</h2>
                            <p>Um hobby é algo que você faz porque gosta, consome seu tempo e, geralmente, tira dinheiro do seu bolso. Um negócio é algo que resolve o problema de alguém de forma lucrativa e escalável.</p>

                            <p>Se você gasta 3 horas fazendo um post no Canva, 4 horas pesquisando um hotel sem saber se o cliente vai fechar, e não tem controle de quantas cotações viraram vendas, você está operando um hobby.</p>

                            <div className="bg-indigo-50 border-2 border-indigo-200 p-8 my-10 rounded-2xl">
                                <h4 className="font-black text-indigo-900 text-xl mb-4 flex items-center gap-2"><Target className="text-indigo-600" /> O Diferenciador de 2026:</h4>
                                <ul className="space-y-3 font-medium text-indigo-800 list-disc list-inside">
                                    <li>Processos automatizados para tarefas repetitivas.</li>
                                    <li>Posicionamento de autoridade (o cliente vem até você).</li>
                                    <li>Foco total em vendas de alta margem (ex: grupos e pacotes luxo).</li>
                                </ul>
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">A Transição para o Profissionalismo</h2>
                            <p>O primeiro passo para ter um negócio real é profissionalizar sua vitrine. Se seu Instagram parece amador, você vai atrair clientes "pesquisadores de preço" que sugam seu tempo e não compram.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Tempo é seu Ativo mais Caro</h2>
                            <p>O agente profissional sabe que seu tempo deve ser gasto fechando vendas e cuidando do passageiro. Todo o resto — criação de conteúdo, design, automação — deve ser feito de forma rápida e sistemática.</p>

                            <BlogCTA type="consideration" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Próximo Nível</h2>
                            <p>Se você quer parar de "brincar" de agência e começar a faturar como uma empresa de verdade, precisa mudar suas ferramentas e sua mentalidade.</p>

                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl p-10 my-12 text-center shadow-2xl skew-y-1">
                                <div className="-skew-y-1">
                                    <h3 className="text-3xl font-black mb-6">Transforme sua Paixão em Lucro Real</h3>
                                    <p className="mb-8 text-indigo-100 text-lg">Assista à Aula Secreta e aprenda o método das agências que faturam 5 digitos mensais no orgânico.</p>
                                    <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-black px-10 py-4 rounded-xl hover:bg-indigo-50 transition-all">Quero Profissionalizar Minha Agência <ArrowRight size={20} /></Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm mb-4">© 2026 Canva Viagem. Gestão e mentalidade para o turismo brasileiro.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost35;
