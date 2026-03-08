import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost27 = () => {
    const handleShare = () => {
        if (navigator.share) { navigator.share({ title: "Cruzeiros para Brasileiros: Vale a Pena? Guia Completo 2026", url: window.location.href }); }
        else { navigator.clipboard.writeText(window.location.href); }
    };

    return (
        <>
            <Helmet>
                <title>Cruzeiros para Brasileiros: Vale a Pena? Guia Completo 2026 | Canva Viagem</title>
                <meta name="description" content="Cruzeiros valem a pena para brasileiros em 2026? Descubra os melhores itinerários, companhias e como agentes de viagem vendem pacotes de cruzeiro com boas comissões." />
                <meta name="keywords" content="cruzeiro para brasileiros 2026, vale a pena fazer cruzeiro, cruzeiro agente de viagem comissão, pacotes cruzeiro brasil, melhor companhia cruzeiro brasil" />
                <link rel="canonical" href="https://canvaviagem.com/blog/cruzeiros-para-brasileiros-2026" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Cruzeiros para Brasileiros: Vale a Pena? Guia Completo 2026" />
                <meta property="og:description" content="Guia completo de cruzeiros para quem quer conhecer ou vender esse segmento em 2026." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Cruzeiros para Brasileiros: Vale a Pena? Guia Completo 2026",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-04-01", "dateModified": "2026-04-01",
                    "url": "https://canvaviagem.com/blog/cruzeiros-para-brasileiros-2026",
                    "image": "https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Cruzeiros para Brasileiros</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-cyan-600 bg-cyan-50 border border-cyan-100 px-3 py-1 rounded-full mb-6">Cruzeiros · Destinos</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Cruzeiros para Brasileiros:
                        <span className="text-primary"> Vale a Pena? Guia Completo 2026</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">01 de abril de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">11 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=1200&auto=format&fit=crop" alt="Cruzeiro no mar para brasileiros" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Cruzeiros são um dos segmentos que mais cresceu no turismo brasileiro nos últimos 3 anos. E para agentes de viagem, representam uma oportunidade única: <strong className="text-slate-900">tickets altos, clientes fiéis e comissões recorrentes</strong>. Mas afinal, vale a pena para o viajante brasileiro?
                        </p>

                        <BlogCTA type="free" className="my-10" />

                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                            <p className="font-black text-emerald-900 mb-2 text-lg">✅ A resposta: Vale muito — quando bem escolhido</p>
                            <p className="text-emerald-700 text-sm leading-relaxed">O cruzeiro oferece uma experiência "tudo incluído" que elimina a preocupação com hotel, traslado e alimentação. Por noite, muitas vezes é mais barato do que o mesmo número de noites em terra — e visita vários destinos em uma mesma viagem.</p>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">🚢 Os Itinerários Mais Vendidos para Brasileiros</h2>

                        {[
                            { name: "Costa Brasileira (Rio → Salvador → Fortaleza)", nights: "5-8 noites", price: "R$ 2.500 – R$ 6.000 por pessoa", peak: "Dezembro a Março", desc: "Ideal para quem está experimentando cruzeiro pela primeira vez. Partida do Brasil, sem voo internacional, custo menor." },
                            { name: "Mediterrâneo (Barcelona → Roma → Grécia)", nights: "8-12 noites", price: "R$ 6.000 – R$ 18.000 por pessoa", peak: "Maio a Setembro", desc: "O mais desejado pelos brasileiros. Combina os melhores destinos europeus em uma única viagem. Requer voo para Europa." },
                            { name: "Caribe (Miami → ilhas do Caribe)", nights: "7-10 noites", price: "R$ 5.000 – R$ 15.000 por pessoa", peak: "Outubro a Abril", desc: "Praias paradisíacas, clima tropical. Popular com famílias e casais. Combinado com dias em Miami é a opção mais completa." },
                            { name: "Norte da Europa (Noruega + Fiordes)", nights: "10-14 noites", price: "R$ 10.000 – R$ 30.000 por pessoa", peak: "Junho a Agosto", desc: "Nicho premium. Fiordes noruegueses são de tirar o fôlego. Clientela de alto poder aquisitivo que repete a experiência." },
                        ].map((item, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-2">
                                <h3 className="font-black text-slate-900 text-base">{item.name}</h3>
                                <div className="flex gap-3 flex-wrap">
                                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium">{item.nights}</span>
                                    <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold">{item.price}</span>
                                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Alta época: {item.peak}</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-4">💰 Como Agentes de Viagem Vendem Cruzeiros</h2>
                        <p className="text-slate-600 leading-relaxed">A comissão de cruzeiro varia de 10% a 16% do valor da cabine — muito acima da média de pacotes convencionais. Para um cruzeiro mediterrâneo de R$12.000 por casal, o agente pode receber de R$1.200 a R$1.920 por venda.</p>
                        <p className="text-slate-600 leading-relaxed">A estratégia mais eficaz: criar conteúdo de cruzeiro no Instagram (imagens aéreas de navios, vídeos de piscinas a bordo, comparativos de destinos) que captura a imaginação de pessoas que nunca pensaram em fazer um cruzeiro. Muitos clientes de cruzeiro são convertidos de viagens convencionais por um único post inspiracional.</p>

                        <BlogCTA type="main" className="my-10" />
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

export default BlogPost27;
