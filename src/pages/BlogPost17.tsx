import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, Laptop, Zap, PenTool } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost17 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: "Canva para Agência de Viagem: Como Criar Artes Profissionais", url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Canva para Agência de Viagem: Como Criar Artes Profissionais 2026 | Canva Viagem</title>
                <meta name="description" content="Aprenda a usar o Canva para criar artes profissionais para sua agência de viagem. Templates gratuitos, dicas de design e como criar conteúdo de viagem que vende." />
                <meta name="keywords" content="canva para agência de viagem, templates canva agência de viagem, como usar canva turismo, artes profissionais agência, design agência de viagem canva grátis" />
                <link rel="canonical" href="https://canvaviagem.com/blog/canva-para-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Canva para Agência de Viagem: Artes Profissionais sem ser Designer" />
                <meta property="og:description" content="Como usar o Canva para criar posts profissionais para sua agência de viagem sem conhecimento de design." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Canva para Agência de Viagem: Como Criar Artes Profissionais",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-21", "dateModified": "2026-03-21",
                    "url": "https://canvaviagem.com/blog/canva-para-agencia-de-viagem",
                    "image": "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Canva para Agência de Viagem</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full mb-6">Design · Canva</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Canva para Agência de Viagem:
                        <span className="text-primary"> Artes Profissionais sem Ser Designer</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">21 de março de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">11 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=1200&auto=format&fit=crop" alt="design no canva para agência de viagem" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Você não precisa ser designer para ter um Instagram de agência de viagem bonito e profissional. O Canva transformou o design digital e colocou na mão de qualquer pessoa a capacidade de criar artes que <strong className="text-slate-900">param o scroll e geram consultas</strong>.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">🎨 Por Que o Canva é Indispensável para Agentes de Viagem</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: <Laptop size={26} className="text-blue-500 mx-auto mb-2" />, title: "100% Online e Gratuito", desc: "Sem instalar nada. Funciona no celular e no computador. Versão gratuita já é suficiente para a maioria das agências iniciantes." },
                                { icon: <Zap size={26} className="text-amber-500 mx-auto mb-2" />, title: "Templates Prontos", desc: "Milhares de templates de viagem, praia, avião, mala e destinos. Em 5 minutos você tem um post profissional." },
                                { icon: <PenTool size={26} className="text-purple-500 mx-auto mb-2" />, title: "Identidade Consistente", desc: "Salve suas cores, fontes e logo. Todos os posts ficam com a mesma identidade visual automaticamente." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                                    {item.icon}
                                    <p className="font-black text-slate-900 text-sm mb-1">{item.title}</p>
                                    <p className="text-slate-500 text-xs">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6">📱 Tipos de Arte Que Mais Convertem no Instagram</h2>

                        {[
                            { type: "1. Carrossel de Destino", desc: "7 a 10 slides mostrando fotos do destino + fatos interessantes + CTA de orçamento no último slide. É o tipo de post com maior taxa de salvamento — o algoritmo recompensa muito.", formato: "Formato: 1080x1080 ou 4:5 (1080x1350)" },
                            { type: "2. Comparativo de Preços", desc: "'Europa vs EUA: qual custa menos?' — posts comparativos geram muito engajamento porque todo mundo tem curiosidade. Coluna da esquerda vs coluna da direita, com ícones visuais.", formato: "Formato: Carrossel 1080x1080" },
                            { type: "3. Destaque de Oferta", desc: "Arte simples com fundo escuro, nome do destino grande, preço em destaque e CTA 'Consulte'. Sem ornamentos. Direto ao ponto. Funciona muito como Story.", formato: "Formato: Story 9:16 (1080x1920)" },
                            { type: "4. Dica Rápida (Quote)", desc: "'Sabia que você pode parcelar até 10x uma viagem para Portugal?' — dicas curtas em fundo gradiente com sua logo + CTA. Alta compartilhamento quando a dica é genuinamente útil.", formato: "Formato: 1080x1080" },
                            { type: "5. Post de Depoimento", desc: "Foto do cliente em viagem + texto do depoimento + nome (com permissão). Prova social é o tipo de conteúdo que mais converte leads que já estão considerando contratar.", formato: "Formato: 1080x1080 ou 4:5" },
                        ].map((item, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-2">
                                <h3 className="font-black text-slate-900 text-base">{item.type}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                                <span className="inline-block bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">{item.formato}</span>
                            </div>
                        ))}

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6">⚡ O Problema: Criar Tudo do Zero Consome Horas</h2>
                        <p className="text-slate-600 leading-relaxed">Criar um carrossel de 8 slides no Canva do zero — pesquisar fotos, escrever os textos, posicionar os elementos, exportar — pode levar de 45 minutos a 2 horas. Para quem posta 5 vezes por semana, isso é 10 horas semanais só em criação de conteúdo.</p>
                        <p className="text-slate-600 leading-relaxed">A solução que agentes profissionais estão usando: começar com <strong>templates prontos e editáveis de alta qualidade</strong>, onde você só precisa trocar o destino, o preço e sua logo. O que levava 2 horas passa a levar 5 minutos.</p>

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

export default BlogPost17;
