import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, HeartHandshake, CheckCircle, Star } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost10 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Atendimento que Fideliza: O Segredo do Pós-Venda no Turismo",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Atendimento que Fideliza: O Segredo do Pós-Venda no Turismo | Canva Viagem</title>
                <meta
                    name="description"
                    content="Aprenda como encantar seus clientes depois que a viagem termina e transformar viajantes ocasionais em fãs fiéis da sua agência."
                />
                <meta
                    name="keywords"
                    content="pós-venda turismo, fidelização agência de viagem, atendimento ao cliente turismo, como manter clientes agência viagem"
                />
                <link rel="canonical" href="https://canvaviagem.com/blog/pos-venda-fidelizacao-turismo" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Atendimento que Fideliza: O Segredo do Pós-Venda no Turismo" />
                <meta property="og:description" content="Manter um cliente custa 7x menos do que atrair um novo." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1556740734-7f9a2b7a0f42?q=80&w=800&auto=format&fit=crop" />
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
                        <span className="text-slate-600">Pós-Venda e Fidelização</span>
                    </nav>

                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full mb-6">
                        Fidelização · Relacionamento
                    </span>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Atendimento que Fideliza: O Segredo do
                        <span className="text-rose-600"> Pós-Venda no Turismo</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Calendar size={14} className="text-primary" />
                            <span className="font-medium">14 de março de 2026</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock size={14} className="text-primary" />
                            <span className="font-medium">8 minutos de leitura</span>
                        </div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium">
                            <Share2 size={14} />
                            <span>Compartilhar</span>
                        </button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="rounded-2xl overflow-hidden shadow-xl mb-10 border border-gray-200">
                            <img
                                src="https://images.unsplash.com/photo-1556740734-7f9a2b7a0f42?q=80&w=1200&auto=format&fit=crop"
                                alt="Atendimento ao cliente de excelência"
                                className="w-full h-auto"
                            />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Fidelizar um cliente é muito mais barato do que conquistar um novo. No turismo, um cliente satisfeito viaja com você a vida toda e ainda indica sua agência para amigos.
                        </p>

                        <BlogCTA type="awareness" className="my-10 shadow-rose-50" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">A Experiência no Retorno</h2>
                        <p className="text-slate-600 leading-relaxed">
                            O pós-venda não começa quando o cliente volta, mas no dia seguinte ao retorno. Envie uma mensagem perguntando como foi a viagem. Isso mostra que você se importa com a experiência, não apenas com a venda.
                        </p>

                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 my-10 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <HeartHandshake className="text-rose-500" /> Gatilho de Reconexão
                            </h3>
                            <p className="text-slate-700 text-sm">
                                "Olá [Nome], tudo bem? Vi que vocês retornaram ontem. Espero que tenham aproveitado cada minuto em [Destino]! Se tiver um tempinho, adoraria saber qual foi a parte favorita de vocês e se deu tudo certo com o hotel."
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Transformando Feedback em Marketing</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Aproveite o entusiasmo do retorno para pedir uma avaliação no Google Meu Negócio ou um depoimento por escrito. Isso é combustível para atrair novos clientes.
                        </p>

                        <ul className="space-y-4 text-slate-600">
                            <li className="flex gap-3">
                                <CheckCircle className="text-rose-500 mt-1 flex-shrink-0" />
                                <span><strong className="text-slate-900">Mimos Selecionados:</strong> Enviar um pequeno mimo (como um porta-passaporte personalizado) antes da próxima viagem faz o cliente se sentir especial.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="text-rose-500 mt-1 flex-shrink-0" />
                                <span><strong className="text-slate-900">Aniversários:</strong> Não mande e-mails robóticos. Mande uma mensagem humana no WhatsApp desejando parabéns e oferecendo uma condição especial.</span>
                            </li>
                        </ul>

                        <BlogCTA type="consideration" className="my-10" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">O Ciclo da Próxima Viagem</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Depois de saber o que o cliente gostou, você já pode começar a "plantar a semente" para o próximo ano. "Já que você amou esse resort em Alagoas, ano que vem você vai adorar conhecer nossa opção em Porto de Galinhas."
                        </p>

                        <BlogCTA type="decision" className="my-16 shadow-rose-100" />
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

export default BlogPost10;
