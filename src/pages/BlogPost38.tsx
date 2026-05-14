import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, Paintbrush } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost38 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Como Ter um Perfil de Agência Premium Sem Gastar R$ 1 com Designer",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Perfil Premium Sem Designer: O Guia do Agente de Viagem</title>
                <meta name="description" content="Você não precisa de uma agência de marketing para ter um Instagram de luxo. Descubra os pilares do design premium que você mesma pode aplicar." />
                <meta name="keywords" content="design para agência de viagem, instagram premium turismo, como criar posts bonitos viagem, identidade visual agente de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/perfil-agencia-premium-sem-designer" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Perfil Premium Sem Designer: Como Fazer?" />
                <meta property="og:description" content="Aprenda a criar impacto visual que gera autoridade imediata sem depender de ninguém." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/webinar/perfil_sem_designer_1773093380500.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full mb-6 italic">Webinar 2026 · Design Estratégico</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">Como Ter um Perfil de Agência Premium <span className="text-purple-600">Sem Gastar R$ 1</span> com Designer</h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">8 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200 bg-white p-2">
                            <img
                                src="/assets/blog/webinar/perfil_sem_designer_1773093380500.png"
                                alt="Exemplo de design premium de agência feito de forma simples e elegante"
                                className="w-full h-auto object-cover rounded-xl"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed">
                            <p className="text-xl font-medium text-slate-800">A primeira coisa que seu cliente avalia antes de te dar um cartão de crédito com limite de R$ 20.000 é: <strong>"Esse negócio parece profissional?"</strong>.</p>

                            <p>No digital, "profissional" é sinônimo de estética cuidada. Se o seu perfil parece um amontoado de posts coloridos, fontes cada uma de um jeito e fotos de baixa qualidade, você está transmitindo insegurança.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Mito do "Pack de Templates"</h2>
                            <p>Muitas agentes acham que a solução é comprar um pacote com 300 templates genéricos. O problema? O seu perfil fica com cara de "loja de R$ 1,99". Tudo igual a todo mundo.</p>
                            <p>Design premium não é sobre ser complexo, é sobre ser **consistente** e **limpo**. Menos é quase sempre mais quando falamos de vender viagens de alto valor.</p>

                            <div className="bg-purple-50 border-l-4 border-purple-500 p-8 my-10 rounded-r-2xl">
                                <h4 className="font-black text-purple-900 text-xl mb-4 flex items-center gap-2"><Paintbrush className="text-purple-600" /> Os 3 Pilares do Visual Premium:</h4>
                                <ul className="space-y-3 font-medium text-purple-800 list-disc list-inside">
                                    <li><strong>Paleta Proibida:</strong> Evite cores muito vibrantes e infantis. Use tons sóbrios, pastéis ou o clássico Dark Mode (azul marinho e roxo profundo).</li>
                                    <li><strong>Respiro:</strong> Deixe as margens livres. Não tente preencher cada centímetro do post com texto.</li>
                                    <li><strong>Imagens de Impacto:</strong> Se a foto do hotel for ruim, não poste. Use bancos de imagens premium ou ferramentas de IA para gerar desejo.</li>
                                </ul>
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Design que Vende</h2>
                            <p>O objetivo do seu design não é ganhar um prêmio de arte, é facilitar a leitura e gerar desejo. Quando você usa o design certo, o cliente para o scroll, lê seu conteúdo e sente que você é uma autoridade no assunto.</p>

                            <BlogCTA type="awareness" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">A Ferramenta é o de Menos</h2>
                            <p>Você pode usar Canva, Photoshop ou IA. O que importa é a estratégia por trás da imagem. No próximo webinar, vou mostrar como eu crio artes que parecem ter custado centenas de reais em menos de 5 minutos.</p>

                            <div className="bg-slate-900 text-white rounded-3xl p-10 my-12 text-center shadow-2xl">
                                <h3 className="text-3xl font-black mb-6 italic">Tenha um Perfil que Atrai Clientes de Elite</h3>
                                <p className="mb-8 text-slate-300 text-lg">Descubra o sistema visual que as melhores agências do Brasil utilizam para se destacar no Instagram.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-purple-600 text-white font-black px-10 py-4 rounded-xl hover:bg-purple-500 transition-all transform hover:scale-105">Quero Meu Perfil Premium <ArrowRight size={20} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2026 Canva Viagem. Design e autoridade para agentes de viagem autônomos.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost38;
