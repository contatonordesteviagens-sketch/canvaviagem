import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, Compass, CheckCircle, Award } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost8 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "O Poder do Nicho: Por que Agências Especialistas Ganham Mais",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>O Poder do Nicho: Por que Agências Especialistas Ganham Mais | Canva Viagem</title>
                <meta
                    name="description"
                    content="Descubra por que focar em um nicho específico de viagens pode transformar sua agência em uma referência e aumentar sua lucratividade."
                />
                <meta
                    name="keywords"
                    content="nicho turismo, especialização agência de viagem, como se destacar no turismo, lucratividade agência de viagem"
                />
                <link rel="canonical" href="https://canvaviagem.com/blog/poder-nicho-turismo" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="O Poder do Nicho: Por que Agências Especialistas Ganham Mais" />
                <meta property="og:description" content="Quem tenta vender para todo mundo acaba não vendendo para ninguém." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop" />
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
                        <span className="text-slate-600">Poder do Nicho</span>
                    </nav>

                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full mb-6">
                        Posicionamento · Nicho
                    </span>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        O Poder do Nicho: Por que Agências
                        <span className="text-amber-600"> Especialistas Ganham Mais</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Calendar size={14} className="text-primary" />
                            <span className="font-medium">12 de março de 2026</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock size={14} className="text-primary" />
                            <span className="font-medium">9 minutos de leitura</span>
                        </div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium">
                            <Share2 size={14} />
                            <span>Compartilhar</span>
                        </button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="rounded-2xl overflow-hidden shadow-xl mb-10 border border-gray-200">
                            <img
                                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop"
                                alt="Mapa e acessórios de viagem focada"
                                className="w-full h-auto"
                            />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            No mercado de turismo de 2026, a "agência que vende tudo para todos" está morrendo. O futuro pertence aos especialistas. Quem foca, fatura mais.
                        </p>

                        <BlogCTA type="awareness" className="my-10 shadow-amber-50" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">O Perigo do "Generalista"</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Quando você vende de tudo, você compete com as grandes OTAs (Decolar, Booking) apenas por preço. Quando você é especialista em um nicho, o cliente não busca preço, busca a sua curadoria.
                        </p>

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 my-10 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Compass className="text-amber-500" /> Exemplos de Sucesso
                            </h3>
                            <p className="text-slate-700 text-sm">
                                "Agências focadas em: Viagens de Lua de Mel, Destinos de Neve, Cruzeiros Disney, ou até nichos mais específicos como 'Viagens solo para mulheres 50+'. A barreira de entrada é menor e a conversão é maior."
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Como Escolher seu Nicho</h2>
                        <p className="text-slate-600 leading-relaxed">
                            O nicho ideal está no cruzamento de três fatores: O que você ama/conhece, o que o mercado demanda e onde estão os clientes com maior poder aquisitivo.
                        </p>

                        <ul className="space-y-4 text-slate-600">
                            <li className="flex gap-3">
                                <CheckCircle className="text-amber-500 mt-1 flex-shrink-0" />
                                <span><strong className="text-slate-900">Torne-se a Autoridade:</strong> Consuma todo o conteúdo possível sobre aquele nicho. Visite os destinos, conheça os hotéis.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="text-amber-500 mt-1 flex-shrink-0" />
                                <span><strong className="text-slate-900">Fale a Língua do Público:</strong> Um público de "Ecoturismo" tem dores e desejos completamente diferentes de um público de "Luxo em Paris".</span>
                            </li>
                        </ul>

                        <BlogCTA type="consideration" className="my-10" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">A Escada do Lucro</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Ao ser especialista, você pode cobrar taxas de consultoria. O cliente paga feliz para ter a garantia de que a viagem dos sonhos será perfeita sob a supervisão de um mestre no assunto.
                        </p>

                        <BlogCTA type="decision" className="my-16 shadow-amber-100" />
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

export default BlogPost8;
