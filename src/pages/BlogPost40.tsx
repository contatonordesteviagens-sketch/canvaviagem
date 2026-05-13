import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, Map } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost40 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "O Mapa da Agência 5 Estrelas: O Caminho Para o Próximo Nível",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>O Mapa da Agência 5 Estrelas: Guia de Crescimento</title>
                <meta name="description" content="Descubra os 5 pilares para transformar uma agência amadora em um negócio de alto faturamento e autoridade no mercado de turismo." />
                <meta name="keywords" content="crescimento agência de viagem, como escalar agência de turismo, marketing para agentes autônomos, gestão agência de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/mapa-agencia-viagem-5-estrelas" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="O Mapa da Agência 5 Estrelas: Você Está Pronto?" />
                <meta property="og:description" content="O guia definitivo para sair do amadorismo e se tornar uma referência no turismo." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/webinar/mapa_agencia_5_estrelas_convite_1773093394115.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-6 italic">Webinar 2026 · Plano de Carreira</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">O Mapa da Agência 5 Estrelas: O Caminho Para o <span className="text-indigo-600">Próximo Nível</span></h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">10 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/webinar/mapa_agencia_5_estrelas_convite_1773093394115.png"
                                alt="Ilustração de um mapa estratégico para agências de viagem"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed">
                            <p className="text-xl font-medium text-slate-800 italic">"Onde você quer que sua agência esteja daqui a 12 meses?"</p>

                            <p>Muitos agentes trabalham muito, mas sentem que estão correndo em círculos. Eles vendem hoje para pagar o boleto de amanhã. Isso não é um negócio 5 estrelas, é um emprego de exaustão.</p>

                            <p>O **Mapa da Agência 5 Estrelas** é a metodologia que separa os agentes que "tentam a sorte" dos empresários que dominam o mercado. Vamos explorar os 5 marcos dessa jornada.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Os 5 Marcos da Jornada</h2>

                            <div className="space-y-6 my-10">
                                {[
                                    { step: "1", title: "Fundação Profissional", desc: "Sair do amadorismo visual e ter uma identidade que gera confiança imediata." },
                                    { step: "2", title: "Atração Magnética", desc: "Criar conteúdo que atrai o cliente certo, não apenas curiosos atrás de preço." },
                                    { step: "3", title: "Processo de Venda Consultiva", desc: "Transformar o 'me passa um orçamento' em uma conversa de valor e autoridade." },
                                    { step: "4", title: "Fidelização e Indicação", desc: "Criar fãs que vendem por você e voltam todos os anos." },
                                    { step: "5", title: "Escala Sustentável", desc: "Ter sistemas que permitem vender mais gastando menos tempo na execução." }
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4 items-start bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0">{item.step}</div>
                                        <div>
                                            <h4 className="font-black text-slate-900 mb-1">{item.title}</h4>
                                            <p className="text-slate-600 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Em qual marco você está hoje?</h2>
                            <p>A maioria das agências trava no marco 1 ou 2. Elas têm medo de investir no visual ou não sabem como atrair pessoas qualificadas. Identificar onde você está é o primeiro passo para avançar.</p>

                            <BlogCTA type="decision" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6 flex items-center gap-2"><Map className="text-indigo-600" /> Seu Convite Para o Próximo Nível</h2>
                            <p>Este mapa não é teórico. Ele foi construído no campo de batalha, observando o que realmente funciona para agentes autônomos que faturam alto. Na próxima semana, vou revelar todos os detalhes desse mapa.</p>

                            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 text-white rounded-3xl p-12 my-12 text-center shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <h3 className="text-3xl md:text-5xl font-black mb-8 italic">O Seu Lugar no topo das Agências</h3>
                                <p className="mb-10 text-indigo-200 text-xl max-w-3xl mx-auto font-medium">Não deixe o seu sonho de agência ser engolido pelo cansaço do amadorismo. Siga o mapa.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-white text-indigo-900 font-black px-12 py-5 rounded-xl hover:bg-indigo-50 transition-all shadow-xl hover:-translate-y-1">Garantir Minha Vaga no Webinar <ArrowRight size={22} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2026 Canva Viagem. O futuro do turismo é profissional, humano e digital.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost40;
