import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost26 = () => {
    const handleShare = () => {
        if (navigator.share) { navigator.share({ title: "Roteiro de Europa para Brasileiros: O Planejamento Completo 2026", url: window.location.href }); }
        else { navigator.clipboard.writeText(window.location.href); }
    };

    return (
        <>
            <Helmet>
                <title>Roteiro de Europa para Brasileiros: Planejamento Completo 2026 | Canva Viagem</title>
                <meta name="description" content="Roteiro completo de Europa para brasileiros em 2026. Melhores países, cidades, dicas de visto Schengen, melhor época e como contratar um agente de viagem para garantir a perfeita experiência." />
                <meta name="keywords" content="roteiro europa para brasileiros, como planejar viagem europa, visto schengen brasileiro, destinos europa 2026, viagem europa agência de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/roteiro-europa-brasileiros-2026" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Roteiro de Europa para Brasileiros: Planejamento Completo 2026" />
                <meta property="og:description" content="Guia completo com roteiro, dicas de visto, melhor época e conselho de especialista para viagem à Europa em 2026." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Roteiro de Europa para Brasileiros: Planejamento Completo 2026",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-30", "dateModified": "2026-03-30",
                    "url": "https://canvaviagem.com/blog/roteiro-europa-brasileiros-2026",
                    "image": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Roteiro Europa para Brasileiros</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">Europa · Roteiro</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Roteiro de Europa para Brasileiros:
                        <span className="text-primary"> Planejamento Completo 2026</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">30 de março de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">13 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&auto=format&fit=crop" alt="Roteiro Europa para Brasileiros" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Europa é o destino dos sonhos de milhões de brasileiros. E em 2026 ela está mais acessível do que nos últimos 5 anos. <strong className="text-slate-900">Um roteiro bem planejado pode caber em R$12.000 a R$20.000 por pessoa — com tudo incluído.</strong> Mas requer atenção a vários detalhes. Este guia cobre tudo.
                        </p>

                        <BlogCTA type="free" className="my-10" />

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">🗺️ Roteiros Mais Populares para Brasileiros</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: "🇵🇹🇪🇸 Clássico Ibérico (12 dias)", cities: "Lisboa → Porto → Madrid → Barcelona", profile: "Primeira viagem à Europa. Idiomas próximos. Alta identidade cultural com Brasil.", budget: "R$ 12.000 – R$ 18.000" },
                                { title: "🇫🇷🇮🇹🇬🇷 Mediterrâneo (14 dias)", cities: "Paris → Nice → Roma → Atenas", profile: "Casais, cultura, gastronomia, fotografia. Uma das combinações mais desejadas.", budget: "R$ 16.000 – R$ 25.000" },
                                { title: "🇩🇪🇦🇹🇨🇭 Europa Central (10 dias)", cities: "Frankfurt → Munique → Viena → Zurique", profile: "Perfil mais culto. Arquitetura, museus, castelos. Inverno com neve é espetacular.", budget: "R$ 14.000 – R$ 22.000" },
                                { title: "🇬🇧🇮🇪🇮🇸 Europa do Norte (12 dias)", cities: "Londres → Edimburgo → Dublin → Reykjavik", profile: "Viajantes mais experientes. Aurora Boreal na Islândia é o grande atrativo.", budget: "R$ 18.000 – R$ 30.000" }
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
                                    <h3 className="font-black text-slate-900 text-base">{item.title}</h3>
                                    <p className="text-slate-500 text-xs font-medium">{item.cities}</p>
                                    <p className="text-slate-600 text-xs leading-relaxed">{item.profile}</p>
                                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{item.budget}</span>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-4">📋 Visto Schengen: O Que Brasileiros Precisam Saber</h2>
                        <div className="space-y-3">
                            {[
                                { label: "Quem precisa?", info: "Todos os brasileiros que viajam para países da zona Schengen (maioria dos países europeus)." },
                                { label: "Onde solicitar?", info: "No consulado do primeiro país de destino (o país onde você fica mais tempo)." },
                                { label: "Documentos principais", info: "Passaporte válido, extrato bancário (3 meses), comprovante de hospedagem, passagem aérea, seguro viagem (obrigatório, cobertura mínima €30.000), comprovante de renda." },
                                { label: "Prazo de solicitação", info: "Mínimo 4 semanas antes da viagem. Em alta temporada, solicite com 3 meses de antecedência." },
                                { label: "Custo", info: "€80 a €85 (taxa consular). Não reembolsável em caso de recusa." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <p className="font-black text-slate-900 text-sm">{item.label}</p>
                                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.info}</p>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-4">🌤️ Melhor Época para Visitar a Europa</h2>
                        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-900 text-white">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-bold">Período</th>
                                        <th className="text-left py-3 px-4 font-bold">Clima</th>
                                        <th className="text-left py-3 px-4 font-bold">Custo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { periodo: "Março – Maio", clima: "Primavera. Flores, temperatura agradável (10-20°C)", custo: "Médio (ótimo custo-benefício)" },
                                        { periodo: "Junho – Agosto", clima: "Verão. Quente, muita gente, atrações abertas", custo: "Alto (alta temporada)" },
                                        { periodo: "Setembro – Novembro", clima: "Outono. Colors, menos turistas, agradável", custo: "Médio-baixo (excelente época)" },
                                        { periodo: "Dezembro – Fevereiro", clima: "Inverno. Neve, mercados de Natal, Aurora (norte)", custo: "Alto no natal, baixo em jan/fev" },
                                    ].map((row, i) => (
                                        <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-t border-gray-100`}>
                                            <td className="py-3 px-4 font-bold text-slate-900 text-xs">{row.periodo}</td>
                                            <td className="py-3 px-4 text-slate-600 text-xs">{row.clima}</td>
                                            <td className="py-3 px-4 text-slate-500 text-xs">{row.custo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

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

export default BlogPost26;
