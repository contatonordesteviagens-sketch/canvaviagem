import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost32 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "O Custo Real de Postar Sem Estratégia no Instagram da Sua Agência de Viagem",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>O Custo Real de Postar Sem Estratégia no Instagram da Sua Agência</title>
                <meta name="description" content="Postar qualquer coisa no Instagram da sua agência pode custar caro em tempo e autoridade. Entenda como criar uma estratégia que gera orçamentos reais." />
                <meta name="keywords" content="estratégia de conteúdo para agência de viagem, marketing para agência de viagem, como criar conteúdo para Instagram turismo, agente de viagem autônomo marketing" />
                <link rel="canonical" href="https://canvaviagem.com/blog/custo-de-postar-sem-estrategia-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="O Custo Real de Postar Sem Estratégia no Instagram da Sua Agência de Viagem" />
                <meta property="og:description" content="Descubra por que postar por postar está matando o engajamento da sua agência e como mudar isso." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/updated/custo_estrategia_updated.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/assets/blog/updated/custo_estrategia_updated.png" />
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
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6 italic">Webinar 2026 · Marketing Estratégico</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">O <span className="text-blue-600">Custo Real</span> de Postar Sem Estratégia no Instagram da Sua Agência</h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">13 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/updated/custo_estrategia_updated.png"
                                alt="Agente de viagem estressada analisando postagem sem engajamento"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed">
                            <p className="text-xl font-medium text-slate-800">"Pelo menos eu postei alguma coisa hoje." Se você já usou essa frase como consolo depois de publicar qualquer conteúdo no Instagram da sua agência, este artigo é para você.</p>

                            <p>Essa mentalidade — postar por postar, só para manter o perfil ativo — não é neutra. Ela tem um custo real, mensurável, que vai muito além do tempo gasto. Vamos falar sobre o que está acontecendo de verdade quando você publica sem estratégia.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Quando "Qualquer Coisa" É Pior do Que Nada</h2>

                            <p>Existe uma crença popular no marketing digital que diz que presença constante é sempre melhor do que ausência. Ela é verdadeira — mas só até certo ponto. A versão completa da verdade é esta: <strong>presença constante com conteúdo relevante é melhor do que ausência. Presença constante com conteúdo irrelevante treina o seu público a ignorar você.</strong></p>

                            <p>Isso tem a ver com um fenômeno de comportamento chamado condicionamento de atenção. Quando uma pessoa vê repetidamente posts seus que não geram nenhuma reação emocional, o cérebro dela aprende a ignorar os seus posts no feed.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">A Matemática do Tempo Invisível</h2>

                            <p>Imagine que você passa 45 minutos por dia criando conteúdo. Em um mês, são aproximadamente <strong>15 horas dedicadas ao Instagram</strong>.</p>
                            <p>Se a sua comissão média é de R$ 500, e você gasta uma hora por cotação, essas 15 horas poderiam representar 15 conversas de venda ativas. Se a sua taxa de fechamento for de 30%, isso se traduz em quatro a cinco vendas adicionais por mês — algo entre R$ 2.000 e R$ 2.500 de comissão perdida.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Quebrando o Ciclo da Comparação de Preço</h2>
                            <p>Quando o Instagram da sua agência é uma sequência de posts com preços e promoções, você está competindo com o Decolar e o Booking. No campo da comparação de preços, as OTAs ganham sempre.</p>

                            <div className="bg-white border border-gray-200 p-8 my-10 rounded-2xl shadow-sm">
                                <h4 className="font-black text-xl mb-4 text-slate-900">Os Três Tipos de Conteúdo que Funcionam:</h4>
                                <div className="space-y-4">
                                    <p><strong>1. Conteúdo que Educa:</strong> Resolve dúvidas reais do seu cliente ideal.</p>
                                    <p><strong>2. Conteúdo que Inspira:</strong> Faz o cliente sentir a viagem antes de comprar.</p>
                                    <p><strong>3. Conteúdo que Demonstra Autoridade:</strong> Mostra seu julgamento profissional e processo.</p>
                                </div>
                            </div>

                            <BlogCTA type="consideration" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Problema Não É Criatividade. É Sistema.</h2>
                            <p>A solução não é aprender a ser mais rápida no Canva. É ter o conteúdo pronto, estruturado e estratégico — que você só precisa personalizar e publicar. Quando o tempo de publicação cai de 45 minutos para menos de 5, você recupera 20 horas por mês para vender.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">O Que Fazer a Partir de Agora</h2>
                            <p>Faça um diagnóstico honesto: qual proporção do seu feed é oferta direta versus conteúdo de valor? Se você quer atrair clientes qualificados sem consumir seu dia todo, precisa de um método.</p>

                            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl p-10 my-12 text-center shadow-xl">
                                <h3 className="text-3xl font-black mb-6 italic">Pare de Perder Vendas por Falta de Estratégia</h3>
                                <p className="mb-8 text-blue-100 text-lg">Inscreva-se na Aula Secreta e descubra como estruturar seu Instagram para atrair orçamentos todos os dias.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-black px-10 py-4 rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg">Garantir Vaga Gratuita <ArrowRight size={20} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm mb-4">© 2026 Canva Viagem. Conteúdo estratégico para agentes de viagem.</p>
                    <div className="flex justify-center gap-6">
                        <Link to="/termos" className="text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">Termos</Link>
                        <Link to="/privacidade" className="text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">Privacidade</Link>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default BlogPost32;
