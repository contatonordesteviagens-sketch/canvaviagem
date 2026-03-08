import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, Target, CheckCircle, Zap } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost7 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Guia de Tráfego Pago para Agentes de Viagem (Meta Ads 2026)",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Guia de Tráfego Pago para Agentes de Viagem (Meta Ads 2026) | Canva Viagem</title>
                <meta
                    name="description"
                    content="Saiba como investir em anúncios no Instagram e Facebook para atrair leads qualificados para sua agência de viagens gastando pouco."
                />
                <meta
                    name="keywords"
                    content="tráfego pago agência de viagem, anúncios instagram turismo, meta ads turismo, leads agência de viagem"
                />
                <link rel="canonical" href="https://canvaviagem.com/blog/trafego-pago-agentes-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Guia de Tráfego Pago para Agentes de Viagem (Meta Ads 2026)" />
                <meta property="og:description" content="Pare de depender do orgânico e escale suas vendas com anúncios estratégicos." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <div className="min-h-screen bg-gray-50 text-slate-900">
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">Voltar ao site</span>
                        </Link>
                        <Link to="/" className="text-xl font-bold text-slate-800 tracking-tight">
                            Canva Viagem
                        </Link>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-6 py-12 pb-32">
                    <nav className="text-sm text-slate-400 mb-6 font-medium">
                        <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                        <span className="mx-2">/</span>
                        <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-600">Tráfego Pago</span>
                    </nav>

                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-6">
                        Anúncios · Performance
                    </span>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Guia de Tráfego Pago para
                        <span className="text-indigo-600"> Agentes (Meta Ads 2026)</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Calendar size={14} className="text-primary" />
                            <span className="font-medium">11 de março de 2026</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock size={14} className="text-primary" />
                            <span className="font-medium">12 minutos de leitura</span>
                        </div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium">
                            <Share2 size={14} />
                            <span>Compartilhar</span>
                        </button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="rounded-2xl overflow-hidden shadow-xl mb-10 border border-gray-200">
                            <img
                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop"
                                alt="Dashboard de marketing digital"
                                className="w-full h-auto"
                            />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            O orgânico está cada vez mais difícil. Em 2026, agências que querem previsibilidade precisam investir em tráfego pago. Não é gasto, é investimento com retorno mensurável.
                        </p>

                        <BlogCTA type="awareness" className="my-10 shadow-indigo-50" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">O "Feijão com Arroz" que funciona</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Para agências de viagens, o objetivo mais comum deve ser "Mensagens". Você quer que o cliente veja o anúncio e caia direto no seu WhatsApp para que você possa fazer a venda consultiva.
                        </p>

                        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 my-10 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Target className="text-indigo-500" /> Público-Alvo
                            </h3>
                            <p className="text-slate-700 text-sm">
                                "Não segmente apenas por interesses em viagem. Use a localização e a faixa etária do seu cliente ideal. Muitas vezes, um público amplo focado na sua região converte melhor que um público segmentado demais."
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Criativos que Convertem</h2>
                        <p className="text-slate-600 leading-relaxed">
                            O criativo (imagem ou vídeo do anúncio) é responsável por 70% do sucesso. Vídeos reais de destinos com uma legenda impactante tendem a performar muito melhor que flyers estáticos de operadoras.
                        </p>

                        <ul className="space-y-4 text-slate-600">
                            <li className="flex gap-3">
                                <CheckCircle className="text-indigo-500 mt-1 flex-shrink-0" />
                                <span><strong className="text-slate-900">Foque na Dor ou Desejo:</strong> "Cansado da rotina? Conheça o paraíso de Maragogi" é melhor que "Pacote Maragogi R$ 1.500".</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="text-indigo-500 mt-1 flex-shrink-0" />
                                <span><strong className="text-slate-900">Call to Action Claro:</strong> Sempre diga o que fazer: "Toque no botão e peça seu orçamento via WhatsApp".</span>
                            </li>
                        </ul>

                        <BlogCTA type="consideration" className="my-10" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Métricas que Importam</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Não olhe apenas para o CTR. O que importa no final do dia é o CPL (Custo por Lead) e o ROAS (Retorno sobre Investimento em Anúncios). Quantos contatos chegaram e quantos pacotes você fechou?
                        </p>

                        <BlogCTA type="decision" className="my-16 shadow-indigo-100" />
                    </div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-slate-400 text-sm font-medium">© 2026 Canva Viagem. Todos os direitos reservados.</p>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default BlogPost7;
