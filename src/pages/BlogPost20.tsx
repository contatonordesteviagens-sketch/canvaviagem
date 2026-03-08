import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, Wifi, Coffee, Home } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost20 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: "Trabalhar de Casa com Turismo: É Possível em 2026?", url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Trabalhar de Casa com Turismo: É Possível em 2026? | Canva Viagem</title>
                <meta name="description" content="Descubra se é possível trabalhar de casa com turismo em 2026. Como agentes de viagem autônomos estão construindo negócios rentáveis só com celular e WhatsApp." />
                <meta name="keywords" content="trabalhar de casa turismo, home office agência de viagem, agente de viagem home office, trabalho remoto turismo, trabalhar com viagem de casa" />
                <link rel="canonical" href="https://canvaviagem.com/blog/trabalhar-de-casa-com-turismo" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Trabalhar de Casa com Turismo: É Possível em 2026?" />
                <meta property="og:description" content="Como agentes autônomos estão faturando de casa com turismo, só com celular, WhatsApp e Instagram." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Trabalhar de Casa com Turismo: É Possível em 2026?",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-24", "dateModified": "2026-03-24",
                    "url": "https://canvaviagem.com/blog/trabalhar-de-casa-com-turismo",
                    "image": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Trabalhar de Casa com Turismo</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-6">Home Office · Renda Extra</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Trabalhar de Casa com Turismo:
                        <span className="text-primary"> Realidade ou Ilusão em 2026?</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">24 de março de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">9 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop" alt="Pessoa trabalhando de casa com turismo" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            A pandemia mudou a forma como o Brasil enxerga o trabalho remoto. E o turismo — ironicamente — foi um dos setores que mais se adaptou. Hoje, <strong className="text-slate-900">agentes de viagem autônomos faturam de R$2.000 a R$20.000 por mês sem sair de casa</strong>. Mas isso é realidade ou exceção?
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                            <p className="font-black text-emerald-900 mb-2 text-lg">✅ A Resposta Direta: Sim, é possível — e mais fácil do que parece</p>
                            <p className="text-emerald-700 text-sm leading-relaxed">Agentes de viagem autônomos não precisam de ponto físico, CNPJ inicial, funcionários ou investimento alto. O negócio pode ser operado 100% pelo celular, com WhatsApp como canal de atendimento e Instagram como canal de aquisição.</p>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">🏠 Como Funciona o Dia a Dia do Agente Home Office</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: <Home size={24} className="text-blue-500 mx-auto mb-2" />, title: "Manhã: Atendimento", desc: "Responder DMs, WhatsApp e dúvidas de leads. Enviar orçamentos personalizados. 1 a 2 horas." },
                                { icon: <Coffee size={24} className="text-amber-500 mx-auto mb-2" />, title: "Tarde: Conteúdo", desc: "Publicar posts e stories. Planejar conteúdo da semana. Estudar novos destinos. 1 a 2 horas." },
                                { icon: <Wifi size={24} className="text-purple-500 mx-auto mb-2" />, title: "Noite: Fechamento", desc: "Follow-up com leads quentes. Fechar vendas pelo WhatsApp. Confirmar reservas. 30 min a 1 hora." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                                    {item.icon}
                                    <p className="font-black text-slate-900 text-sm mb-1">{item.title}</p>
                                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-slate-600 leading-relaxed">No total, <strong>3 a 5 horas por dia</strong> são suficientes para um agente autônomo bem organizado gerar de R$3.000 a R$8.000/mês no começo. Para dobrar esses números, a principal alavanca é o volume de conteúdo no Instagram — que traduz diretamente em mais consultas por dia.</p>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">🔧 As Ferramentas Essenciais para o Agente Home Office</h2>

                        {[
                            { tool: "WhatsApp Business", use: "Canal principal de atendimento e fechamento de vendas. Configure mensagem automática de boas-vindas e catálogo de destinos.", free: true },
                            { tool: "Instagram Business", use: "Canal de aquisição de clientes. Posts, Reels e Stories construem audiência qualificada sem custo de anúncio.", free: true },
                            { tool: "Canva (gratuito)", use: "Criação de artes, posts, stories e materiais de vendas sem precisar contratar designer.", free: true },
                            { tool: "Google Drive / Sheets", use: "Controle de clientes, reservas, comissões e followup. Simples e gratuito por muitos anos.", free: true },
                            { tool: "Sistemas das Operadoras", use: "CVC, Flytour, Ancoradouro, Trend — cada uma tem seu portal de busca e reserva. Gratuito após o credenciamento.", free: true },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <div className="flex-shrink-0 mt-1">
                                    <span className={`text-xs font-black px-2 py-1 rounded-full ${item.free ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{item.free ? "GRÁTIS" : "PAGO"}</span>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-sm mb-1">{item.tool}</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed">{item.use}</p>
                                </div>
                            </div>
                        ))}

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-6">
                            <p className="font-black text-amber-900 mb-2">⚡ O Gargalo: Criar Conteúdo Profissional Diariamente</p>
                            <p className="text-amber-700 text-sm leading-relaxed">A principal barreira de quem quer trabalhar de casa com turismo é a produção de conteúdo. Criar posts profissionais de destinos do zero, todo dia, enquanto atende clientes e fecha vendas, rapidamente se torna insustentável. Agentes que resolvem esse problema — com templates prontos, vídeos editáveis e scripts — consistentemente performam melhor e com muito menos estresse.</p>
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

export default BlogPost20;
