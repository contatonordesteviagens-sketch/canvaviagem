import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, Users, TrendingUp, Star } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost23 = () => {
    const handleShare = () => {
        if (navigator.share) { navigator.share({ title: "Como Criar um Grupo de Viagem Lucrativo pelo WhatsApp", url: window.location.href }); }
        else { navigator.clipboard.writeText(window.location.href); }
    };

    return (
        <>
            <Helmet>
                <title>Como Criar um Grupo de Viagem Lucrativo pelo WhatsApp</title>
                <meta name="description" content="Aprenda a criar e gerenciar grupos de viagem pelo WhatsApp para escalar as vendas da sua agência. Estratégias para grupos rentáveis e excursões." />
                <meta name="keywords" content="grupo de viagem whatsapp, como criar excursão, turismo de grupo agente de viagem, grupos viagem rentáveis" />
                <link rel="canonical" href="https://canvaviagem.com/blog/criar-grupo-viagem-lucrativo-whatsapp" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Como Criar um Grupo de Viagem Lucrativo pelo WhatsApp" />
                <meta property="og:description" content="Os segredos para montar e vender grupos de viagem de forma lucrativa usando o WhatsApp." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/updated/vendas_grupos_updated.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/assets/blog/updated/vendas_grupos_updated.png" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Como Criar um Grupo de Viagem Lucrativo pelo WhatsApp",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-27", "dateModified": "2026-03-27",
                    "url": "https://canvaviagem.com/blog/criar-grupo-viagem-lucrativo-whatsapp",
                    "image": "/assets/blog/updated/vendas_grupos_updated.png"
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
                        <span className="text-slate-600">Grupo de Viagem pelo WhatsApp</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">Webinar · Instagram</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Como Criar um
                        <span className="text-primary"> Grupo de Viagem Lucrativo pelo WhatsApp</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">18 de abril de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">11 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="/assets/blog/updated/vendas_grupos_updated.png" alt="Grupo de viagem pelo WhatsApp" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Vender para uma família ou casal é ótimo. Mas vender para um grupo de 20 pessoas ao mesmo tempo — com a mesma energia — é <strong className="text-slate-900">o divisor de águas do faturamento</strong> de muitos agentes. Um único grupo bem montado pode gerar R$5.000 a R$30.000 de comissão em uma venda.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: <Users size={24} className="text-blue-500 mx-auto mb-2" />, title: "Escala Real", desc: "Uma venda de grupo de 20 pessoas = 20 vendas individuais com o mesmo esforço de negociação." },
                                { icon: <TrendingUp size={24} className="text-emerald-500 mx-auto mb-2" />, title: "Negociação Favorável", desc: "Grupos têm poder de negociação com hotéis, transportes e operadoras. Você consegue preços melhores." },
                                { icon: <Star size={24} className="text-amber-500 mx-auto mb-2" />, title: "Indicações em Massa", desc: "Um grupo bem atendido vira uma fonte de indicações por anos. São 20 pessoas que te recomendam." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                                    {item.icon}
                                    <p className="font-black text-slate-900 text-sm mb-1">{item.title}</p>
                                    <p className="text-slate-500 text-xs">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">🗺️ Os 5 Modelos de Grupo Mais Lucrativos</h2>

                        {[
                            { type: "1. Excursão Nacional (ônibus fretado)", lucro: "R$ 2.000 – R$ 8.000 por viagem", desc: "Grupo de 40 a 50 pessoas para destinos nacionais como Maragogi, Serra Gaúcha, Bonito. Você organiza o roteiro, o transporte e a hospedagem. A margem varia de 15% a 25% do valor total." },
                            { type: "2. Viagem Internacional Temática", lucro: "R$ 8.000 – R$ 30.000 por grupo", desc: "Grupo de 15 a 25 pessoas para Europa, Disney ou Caribe. Pacote completo. A diferença está no ticket alto e na margem de negociação com operadoras para grupos grandes." },
                            { type: "3. Viagem Corporativa / Incentivo", lucro: "R$ 10.000 – R$ 50.000", desc: "Empresas que patrocinam viagens para funcionários de destaque. Um dos mercados menos explorados e mais lucrativos. Exige prospecção ativa em RH de empresas médias e grandes." },
                            { type: "4. Tour Temático (Enogastronômico, Religioso, Aventura)", lucro: "R$ 3.000 – R$ 15.000", desc: "Grupos por afinidade (amantes de vinho na Espanha, peregrinação a Fátima, trekking nas Dolomitas). Fácil de montar comunidade no Instagram antes de precificar." },
                            { type: "5. Retiro / Experiência Premium", lucro: "R$ 5.000 – R$ 25.000", desc: "Grupos menores (8 a 15 pessoas) em experiências de alto valor: safári, cruzeiro de luxo, retiro de bem-estar. Ticket por pessoa muito maior — e margem proporcional." },
                        ].map((item, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-2">
                                <h3 className="font-black text-slate-900 text-base">{item.type}</h3>
                                <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Potencial: {item.lucro}</span>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-4">📱 Como Usar o WhatsApp para Montar o Grupo</h2>
                        <div className="space-y-3">
                            {[
                                "Crie um grupo de curiosidade/interesse antes de definir o pacote: 'Grupo: Interesse em Viagem para Portugal 2026 ✈️'",
                                "Envie conteúdos de valor sobre o destino (dicas, videos, roteiros) antes de apresentar o preço",
                                "Faça uma enquete: 'Qual mês prefere viajar? Julho / Setembro / Outubro'",
                                "Após ter 10+ pessoas confirmadas, feche com a operadora e apresente o pacote oficial",
                                "Crie urgência real: 'Vagas limitadas a 20 pessoas. Pré-inscrição com R$300 de sinal até sexta-feira'"
                            ].map((step, i) => (
                                <div key={i} className="flex gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <span className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center font-black text-xs flex-shrink-0">{i + 1}</span>
                                    <p className="text-slate-600 text-sm leading-relaxed">{step}</p>
                                </div>
                            ))}
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

export default BlogPost23;
