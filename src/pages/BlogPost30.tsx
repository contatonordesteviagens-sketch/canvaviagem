import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost30 = () => {
    const handleShare = () => {
        if (navigator.share) { navigator.share({ title: "Primeiro Mês como Agente de Viagem: O Que Esperar e Como Não Desistir", url: window.location.href }); }
        else { navigator.clipboard.writeText(window.location.href); }
    };

    return (
        <>
            <Helmet>
                <title>Primeiro Mês como Agente de Viagem: O Que Esperar</title>
                <meta name="description" content="O que esperar no primeiro mês como agente de viagem autônomo. Primeiros clientes, resultados realistas e como não desistir." />
                <meta name="keywords" content="primeiro mês agente de viagem, começar agência de viagem, agente de turismo iniciante" />
                <link rel="canonical" href="https://canvaviagem.com/blog/primeiro-mes-agente-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Primeiro Mês como Agente de Viagem: O Que Esperar" />
                <meta property="og:description" content="Um guia honesto sobre os desafios e vitórias do seu primeiro mês no turismo." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/updated/invisibilidade_updated.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/assets/blog/updated/invisibilidade_updated.png" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Primeiro Mês como Agente de Viagem: O Que Esperar",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-04-04", "dateModified": "2026-04-04",
                    "url": "https://canvaviagem.com/blog/primeiro-mes-agente-de-viagem",
                    "image": "/assets/blog/updated/invisibilidade_updated.png"
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
                        <span className="text-slate-600">Primeiro Mês como Agente</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full mb-6">Webinar · Algoritmo</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Primeiro Mês como Agente:
                        <span className="text-primary"> O Que Esperar (Guia Honesto)</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">11 de abril de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">12 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="/assets/blog/updated/invisibilidade_updated.png" alt="Primeiro mês como agente de viagem" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Todo mundo começa do zero. E o maior perigo do primeiro mês não é a falta de clientes — é a <strong className="text-slate-900">expectativa errada</strong> que faz as pessoas desistirem antes de colher os resultados. Este guia é honesto sobre o que vai acontecer e o que fazer em cada fase.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">📅 Semana a Semana: O Que Acontece de Verdade</h2>

                        {[
                            { week: "Semana 1", title: "Configuração e primeiros passos", desc: "Criação do Instagram, WhatsApp Business, credenciamento nas primeiras operadoras. Publicação dos primeiros 5-7 posts. Poucos seguidores, alcance baixo. É NORMAL. Você está construindo o alicerce.", metric: "Métrica real: 50-200 seguidores, 2-10 curtidas por post" },
                            { week: "Semana 2", title: "Primeiros contatos e aprendizado", desc: "Alguns amigos e conhecidos começam a comentar. Talvez 1-3 contatos no WhatsApp pedindo orçamento. A maioria ainda não compra — são curiosas. Continue postando, responsa tudo com entusiasmo.", metric: "Métrica real: 1-5 contatos no WhatsApp, 0-1 venda" },
                            { week: "Semana 3", title: "Consistência começa a dar sinal", desc: "O Instagram começa a entender seu perfil. Posts de Reels podem começar a ter alcance maior. Follow-up com leads da semana 2. Alguns já estão decidindo.", metric: "Métrica real: 200-500 seguidores, 3-8 consultas" },
                            { week: "Semana 4", title: "Primeira venda — o divisor de águas", desc: "A maioria dos agentes fecha a primeira venda no período de 20 a 45 dias. Quando acontece, é transformador. Você prova para si mesmo que funciona. A partir daqui, o ritmo acelera.", metric: "Métrica real: 1-3 vendas, R$200 a R$2.000 de comissão" },
                        ].map((item, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-lg">{item.week}</span>
                                    <h3 className="font-black text-slate-900 text-base">{item.title}</h3>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                                <div className="bg-slate-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-slate-500 text-xs font-medium">📊 {item.metric}</p>
                                </div>
                            </div>
                        ))}

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">⚠️ Os 5 Erros Que Fazem Iniciantes Desistir</h2>
                        {[
                            "Postar por 2 semanas, ver poucos resultados e parar. O Instagram leva 60-90 dias para começar a crescer de forma consistente.",
                            "Esperar que os clientes venham até você sem publicar conteúdo. O Instagram não é uma vitrine passiva — é um motor ativo.",
                            "Comparar seus 30 dias com o resultado de alguém com 2 anos de perfil.",
                            "Não fazer follow-up. 80% das vendas acontecem após o 2º ou 3º contato. Quem pergunta no WhatsApp e não recebe empurraozinho, desiste.",
                            "Tratar o começo como teste. Quem começa 'para ver se funciona' desiste antes de ver. Quem começa como decisão definitiva, cresce.",
                        ].map((erro, i) => (
                            <div key={i} className="flex gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
                                <span className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center font-black text-xs flex-shrink-0">{i + 1}</span>
                                <p className="text-red-700 text-sm leading-relaxed">{erro}</p>
                            </div>
                        ))}

                        <div className="bg-slate-900 text-white rounded-2xl p-8 mt-4">
                            <h3 className="font-black text-xl mb-4">🚀 A Mensagem dos Agentes que Deram Certo</h3>
                            <p className="text-slate-300 text-sm leading-relaxed mb-4">"O primeiro mês foi o mais difícil. Achei que não funcionaria. Mas eu me comprometi com 3 meses antes de julgar. No terceiro mês, fiz R$4.800 de comissão. Hoje, no décimo, estou em R$11.000/mês. Quase desisti na semana 3."</p>
                            <p className="text-slate-500 text-xs">— Relato de agente autônomo brasileiro com 10 meses de perfil</p>
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

export default BlogPost30;
