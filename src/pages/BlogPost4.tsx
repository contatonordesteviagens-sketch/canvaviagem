import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, MapPin, Star, Compass } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost4 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "7 Destinos Nacionais para Vender Muito em 2026",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>7 Destinos Nacionais para Vender Muito em 2026 | Canva Viagem</title>
                <meta
                    name="description"
                    content="Descubra os destinos tendência no Brasil para 2026. Saiba o que oferecer para seus clientes e como vender pacotes nacionais com alta conversão."
                />
                <meta
                    name="keywords"
                    content="destinos nacionais 2026, destinos tendência brasil, agência de viagem destinos, vender pacotes nacionais, turismo brasil 2026"
                />
                <link rel="canonical" href="https://canvaviagem.com/blog/destinos-nacionais-tendencia-2026" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="7 Destinos Nacionais para Vender Muito em 2026" />
                <meta property="og:description" content="Os destinos que vão bombar no Brasil em 2026 e como sua agência pode lucrar com eles." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "7 Destinos Nacionais para Vender Muito em 2026",
                    "description": "Uma análise detalhada dos destinos tendência no Brasil que sua agência precisa oferecer agora.",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-08",
                    "dateModified": "2026-03-08",
                    "url": "https://canvaviagem.com/blog/destinos-nacionais-tendencia-2026"
                })}</script>
            </Helmet>

            <div className="min-h-screen bg-gray-50 text-slate-900">
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">Voltar ao site</span>
                        </Link>
                        <Link to="/" className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                        <span className="text-slate-600">Destinos Tendência 2026</span>
                    </nav>

                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full mb-6">
                        Destinos · Tendências 2026
                    </span>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        7 Destinos Nacionais para
                        <span className="text-green-600"> Vender Muito em 2026</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Calendar size={14} className="text-primary" />
                            <span className="font-medium">8 de março de 2026</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock size={14} className="text-primary" />
                            <span className="font-medium">10 minutos de leitura</span>
                        </div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium">
                            <Share2 size={14} />
                            <span>Compartilhar</span>
                        </button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="rounded-2xl overflow-hidden shadow-xl mb-10">
                            <img
                                src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1200&auto=format&fit=crop"
                                alt="Destinos tendência no Brasil 2026"
                                className="w-full h-auto"
                            />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            O turismo nacional nunca esteve tão forte. Em 2026, a busca por experiências autênticas, contato com a natureza e "slow travel" no Brasil atingiu o ápice. Para sua agência vender mais, é preciso estar onde o desejo do cliente está.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. Lençóis Maranhenses, MA</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Após o reconhecimento pela UNESCO, a demanda explodiu. O foco em 2026 são as experiências de luxo sustentável e roteiros personalizados que fogem do óbvio.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. Jalapão, TO</h2>
                        <p className="text-slate-600 leading-relaxed">
                            O destino preferido dos amantes de aventura e isolamento. Em 2026, as agências que vendem "glamping" (acampamento de luxo) no Jalapão estão vendo as maiores margens de lucro.
                        </p>

                        <BlogCTA type="consideration" className="my-10" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Alter do Chão, PA</h2>
                        <p className="text-slate-600 leading-relaxed">
                            O "Caribe Amazônico" consolidou-se como o destino de ecoturismo número 1. Vender Alter do Chão é vender conexão com a cultura local e praias de rio inacreditáveis.
                        </p>

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 my-10">
                            <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <Compass className="text-blue-600" /> Dica de Ouro para Agentes
                            </h3>
                            <p className="text-blue-800 text-sm italic">
                                "Não venda apenas o destino. Venda a conveniência. Em 2026, o cliente busca quem resolve toda a logística de destinos complexos como esses."
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. Chapada dos Veadeiros, GO</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Bem-estar e misticismo. O público que busca saúde mental e detox digital tem a Chapada como refúgio principal.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Fernando de Noronha, PE</h2>
                        <p className="text-slate-600 leading-relaxed">
                            O clássico que nunca morre, mas agora com foco total em exclusividade. Em 2026, vender Noronha exige conhecimento profundo sobre as novas taxas e regras de preservação.
                        </p>

                        <BlogCTA type="decision" className="my-16 shadow-green-100" />
                    </div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-slate-400 text-sm font-medium">© 2026 Canva Viagem. Todos os direitos reservados.</p>
                        <div className="flex justify-center gap-6 mt-4">
                            <Link to="/termos" className="text-slate-500 hover:text-primary text-xs font-bold uppercase tracking-widest transition-colors">Termos</Link>
                            <Link to="/privacidade" className="text-slate-500 hover:text-primary text-xs font-bold uppercase tracking-widest transition-colors">Privacidade</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default BlogPost4;
