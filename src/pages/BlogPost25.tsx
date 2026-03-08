import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost25 = () => {
    const handleShare = () => {
        if (navigator.share) { navigator.share({ title: "Seguro Viagem: Tudo que um Agente Precisa Saber para Vender e Orientar", url: window.location.href }); }
        else { navigator.clipboard.writeText(window.location.href); }
    };

    return (
        <>
            <Helmet>
                <title>Seguro Viagem: O Que Todo Agente Precisa Saber para Vender e Orientar | Canva Viagem</title>
                <meta name="description" content="Guia completo de seguro viagem para agentes de turismo. O que cobrir, como indicar ao cliente, erros a evitar e como aumentar sua receita com essa venda adicional." />
                <meta name="keywords" content="seguro viagem agente de turismo, como vender seguro viagem, seguro viagem obrigatório, melhor seguro viagem 2026, seguro viagem comissão agente" />
                <link rel="canonical" href="https://canvaviagem.com/blog/seguro-viagem-guia-agente-turismo" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Seguro Viagem: Guia Completo para Agentes de Turismo 2026" />
                <meta property="og:description" content="Tudo que os agentes de viagem precisam saber sobre seguro viagem: como indicar, quais coberturas importam e como ganhar comissão extra com essa venda." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Seguro Viagem: O Que Todo Agente Precisa Saber", "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-29", "dateModified": "2026-03-29",
                    "url": "https://canvaviagem.com/blog/seguro-viagem-guia-agente-turismo",
                    "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop"
                })}</script>
            </Helmet>

            <div className="min-h-screen bg-gray-50 text-slate-900">
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors"><ArrowLeft size={18} /><span className="text-sm font-medium">Voltar ao site</span></Link>
                        <Link to="/" className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Canva Viagem</Link>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-6 py-12 pb-32">
                    <nav className="text-sm text-slate-400 mb-6 font-medium">
                        <Link to="/" className="hover:text-primary">Início</Link><span className="mx-2">/</span>
                        <Link to="/blog" className="hover:text-primary">Blog</Link><span className="mx-2">/</span>
                        <span className="text-slate-600">Seguro Viagem para Agentes</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full mb-6">Seguro · Proteção</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Seguro Viagem: Tudo que um Agente Precisa Saber para
                        <span className="text-primary"> Vender, Orientar e Ganhar Mais</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">29 de março de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">10 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop" alt="Seguro viagem documentos e proteção" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Seguro viagem é a venda adicional que mais agentes esquecem de oferecer — e por isso perdem dinheiro duas vezes: na comissão não recebida e na responsabilidade quando o cliente viaja sem proteção. <strong className="text-slate-900">Saber vender seguro é obrigação de todo agente profissional.</strong>
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">🛡️ Por Que Seguro Viagem é Obrigatório (Moralmente e Legalmente)</h2>
                        <div className="space-y-3">
                            {[
                                { title: "Países do Schengen (Europa)", desc: "O seguro viagem é OBRIGATÓRIO para obter o visto. Sem seguro, não há visto. Cobertura mínima de €30.000." },
                                { title: "Cuba", desc: "Seguro viagem obrigatório por lei cubana. Apresentado na imigração." },
                                { title: "Países do Mercosul", desc: "Não obrigatório por lei, mas altamente recomendado. Hospitais privados na Argentina, por exemplo, cobram fortunas de turistas." },
                                { title: "EUA e Canada", desc: "Não obrigatório, mas um dia de internação nos EUA pode custar US$5.000 a US$30.000. Sem seguro, o cliente pode perder tudo." },
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <p className="font-black text-slate-900 text-sm">{item.title}</p>
                                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">💰 Como o Agente Ganha com Seguro Viagem</h2>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                            <p className="font-black text-emerald-900 mb-2">Comissões Típicas por Apólice</p>
                            <div className="space-y-2 text-sm">
                                {[
                                    { seg: "Seguro Nacional (7 dias)", preco: "R$ 80 – R$ 150", comissao: "R$ 12 – R$ 30" },
                                    { seg: "Seguro Europa (10 dias)", preco: "R$ 150 – R$ 350", comissao: "R$ 25 – R$ 70" },
                                    { seg: "Seguro EUA (15 dias)", preco: "R$ 250 – R$ 600", comissao: "R$ 40 – R$ 120" },
                                    { seg: "Seguro Anual (múltiplas viagens)", preco: "R$ 800 – R$ 2.000", comissao: "R$ 130 – R$ 400" },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-2 border border-emerald-100">
                                        <span className="text-emerald-900 font-medium">{row.seg}</span>
                                        <span className="text-slate-500 text-xs">{row.preco}</span>
                                        <span className="text-emerald-700 font-black text-xs">{row.comissao} comissão</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-emerald-600 text-xs mt-3">* Comissões variam por seguradora e volume de vendas. Faça parceria com ao menos 2-3 seguradoras para ter opções.</p>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-4">🗣️ Como Abordar o Tema no Atendimento</h2>
                        <div className="bg-slate-900 rounded-2xl p-6 text-white">
                            <p className="text-green-300 text-xs font-bold mb-3">✅ Script certo (não invasivo, mas assertivo):</p>
                            <p className="text-slate-300 text-sm leading-relaxed italic">"[Nome], incluí a simulação do seguro viagem junto com o pacote. Para a Europa, é obrigatório, e já calculei com uma opção que te dá cobertura de €100.000 por apenas R$280 pela viagem inteira. Te mando o comparativo junto com o orçamento, tá?"</p>
                            <p className="text-slate-500 text-xs mt-3">Por quê funciona: não pergunta SE o cliente quer, apresenta como parte do processo. A maioria aceita quando vê o custo relativo ao risco.</p>
                        </div>

                        <BlogCTA type="consideration" className="my-10" />
                    </div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-slate-400 text-sm font-medium">© 2026 Canva Viagem. Todos os direitos reservados.</p>
                        <div className="flex justify-center gap-6 mt-4">
                            <Link to="/termos" className="text-slate-500 hover:text-primary text-xs font-bold uppercase tracking-widest">Termos</Link>
                            <Link to="/privacidade" className="text-slate-500 hover:text-primary text-xs font-bold uppercase tracking-widest">Privacidade</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default BlogPost25;
