import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, CheckCircle2 } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost29 = () => {
    const handleShare = () => {
        if (navigator.share) { navigator.share({ title: "Como Fidelizar Clientes de Viagem: O Guia do Pós-Venda", url: window.location.href }); }
        else { navigator.clipboard.writeText(window.location.href); }
    };

    return (
        <>
            <Helmet>
                <title>Como Fidelizar Clientes de Viagem: O Guia do Pós-Venda</title>
                <meta name="description" content="Aprenda a fidelizar clientes da sua agência de viagem com estratégias de pós-venda eficazes. Como transformar cada viajante em um cliente recorrente que indica sua agência." />
                <meta name="keywords" content="fidelizar clientes agência de viagem, pós venda turismo, reter clientes agência de turismo, cliente recorrente agência de viagem, programa fidelidade turismo" />
                <link rel="canonical" href="https://canvaviagem.com/blog/fidelizar-clientes-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Como Fidelizar Clientes de Viagem: Guia Completo de Pós-Venda" />
                <meta property="og:description" content="Estratégias de fidelização e pós-venda para agências de viagem transformarem viajantes em clientes recorrentes." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Como Fidelizar Clientes de Viagem: O Guia do Pós-Venda",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-04-03", "dateModified": "2026-04-03",
                    "url": "https://canvaviagem.com/blog/fidelizar-clientes-agencia-de-viagem",
                    "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Fidelizar Clientes de Viagem</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full mb-6">Webinar · Estratégia</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        O Custo Real de Postar Sem Estratégia:
                        <span className="text-primary"> Por que Você Perde Vendas Diariamente</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">12 de abril de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">10 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop" alt="Fidelização de clientes em agência de viagem" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            O maior custo de uma agência de viagem é conquistar um novo cliente. <strong className="text-slate-900">Reter um cliente existente custa 5x menos e gera 60% mais receita ao longo do tempo.</strong> Mas a maioria dos agentes abandona o cliente depois da viagem — perdendo a fonte mais poderosa de renda recorrente.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: "Probabilidade de vender para cliente existente", value: "60–70%" },
                                { label: "Probabilidade de vender para novo lead", value: "5–20%" },
                                { label: "Clientes que indicam novos clientes (quando bem atendidos)", value: "83%" }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-900 text-white rounded-2xl p-5 text-center">
                                    <p className="text-3xl font-black text-primary mb-2">{item.value}</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">📋 O Fluxo de Pós-Venda que Gera Recorrência</h2>

                        {[
                            { when: "D+1 (dia após a viagem)", action: "Mensagem de boas-vindas de volta", msg: "Mensagem no WhatsApp: 'Oiiii [Nome]! Chegou bem? Que saudade desse destino! Me conta tudo, adorei acompanhar pelos stories! 🥰'. Simples, humano, não comercial." },
                            { when: "D+7", action: "Coleta de depoimento", msg: "Peça um depoimento curto: 'Você toparia me deixar uma mensagem curta sobre a experiência? Pode ser por aqui mesmo ou em texto. Seus relatos ajudam muito outros viajantes que estão sonhando com o mesmo destino!'" },
                            { when: "D+30", action: "Recomendação personalizada", msg: "Com base em onde a pessoa viajou, sugira o próximo destino: 'Você que amou Portugal — já pensou em Espanha? O melhor mês está chegando e já tenho algumas opções incríveis. Quer que eu mande uma prévia?'" },
                            { when: "Aniversário e datas especiais", action: "Reconhecimento pessoal", msg: "Mande mensagem no aniversário do cliente. Se casado, no aniversário de casamento. Se foi lua de mel, no próximo aniversário: 'Feliz aniversário de casamento! Já se passou 1 ano desde aquela viagem incrível para [destino]. 😍'" },
                            { when: "Alta temporada (3 meses antes)", action: "Campanha antecipada", msg: "Em março você já prepara quem vai viajar em julho: 'Preciso de pelo menos 3 meses para garantir as melhores condições para julho. Se você já está pensando nas férias, esse é o momento de agir.' Cria urgência genuína." },
                        ].map((item, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.when}</p>
                                        <h3 className="font-black text-slate-900 text-base">{item.action}</h3>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-slate-600 text-xs leading-relaxed italic">{item.msg}</p>
                                </div>
                            </div>
                        ))}

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-4">⭐ Programa de Indicação</h2>
                        <p className="text-slate-600 leading-relaxed">A forma mais barata de adquirir novos clientes é através de indicações de clientes satisfeitos. Crie um programa simples: "Indicate um amigo que fechar uma viagem comigo e você ganha R$100 de desconto na sua próxima viagem." Com um volume pequeno de clientes ativos, isso gera um pipeline de novos leads sem custo de marketing.</p>

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

export default BlogPost29;
