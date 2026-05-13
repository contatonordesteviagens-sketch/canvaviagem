import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost22 = () => {
    const handleShare = () => {
        if (navigator.share) { navigator.share({ title: "IA para Agentes de Viagem: 7 Ferramentas que Economizam Horas por Semana", url: window.location.href }); }
        else { navigator.clipboard.writeText(window.location.href); }
    };

    const tools = [
        { num: "01", name: "ChatGPT (OpenAI)", use: "Criar roteiros personalizados, responder dúvidas de clientes, escrever posts de Instagram e legendas, gerar descrições de destinos. O mais versátil.", tip: "Prompt: 'Crie um roteiro de 7 dias em Lisboa e Porto para um casal em lua de mel com perfil cultural e gastronômico. Orçamento médio.'" },
        { num: "02", name: "Gemini (Google)", use: "Excelente para pesquisar destinos e consolidar informações de múltiplas fontes. Integrado ao Google Workspace. Bom para criar propostas mais completas.", tip: "Use para perguntas do tipo: 'Quais voos diretos do Brasil para Lisboa existem em junho 2026 e seus preços médios?'" },
        { num: "03", name: "Canva IA (Magic Studio)", use: "Gera textos para suas artes, sugere designs baseados no conteúdo e remove fundos automaticamente. Dentro do Canva, sem precisar sair da ferramenta.", tip: "Use o 'Magic Write' para gerar a legenda de um post direto no Canva enquanto cria a arte." },
        { num: "04", name: "ElevenLabs (Voz IA)", use: "Gera narração de voz para seus Reels sem precisar gravar. Você escreve o script; a IA faz a narração com voz natural. Diferencial enorme para quem tem vergonha de aparecer.", tip: "Ideal para Reels de destinos com narração: 'Conheça o lugar mais bonito da Europa que poucos brasileiros conhecem...'" },
        { num: "05", name: "Perplexity AI", use: "Pesquisa avançada com fontes citadas. Perfeito para buscar informações atualizadas sobre vistos, vacinas, moeda e requisitos de entrada para cada destino.", tip: "Pergunta: 'Quais os requisitos de visto para brasileiros entrarem no Japão em 2026?'" },
        { num: "06", name: "Descript", use: "Editor de vídeo que edita pelo texto. Você faz a transcrição do vídeo e exclui partes só apagando o texto. Revoluciona a edição de Reels e depoimentos.", tip: "Grave um vídeo de 5 min, use o Descript para deixar os melhores 30 segundos em minutos." },
        { num: "07", name: "Notion IA", use: "Organiza seu negócio e gera conteúdo para CRM, follow-up, propostas de pacote e base de conhecimento de clientes. Tudo em um só lugar.", tip: "Crie um template de proposta e peça à IA para preencher com os dados do cliente automaticamente." },
    ];

    return (
        <>
            <Helmet>
                <title>IA para Agentes de Viagem: 7 Ferramentas que Economizam Horas por Semana</title>
                <meta name="description" content="Descubra as 7 melhores ferramentas de inteligência artificial para agentes de viagem em 2026. ChatGPT, Canva IA, ElevenLabs e mais. Economize horas e aumente as vendas." />
                <meta name="keywords" content="inteligência artificial agente de viagem, IA para turismo, ChatGPT agência de viagem, ferramentas IA turismo 2026, automatizar agência de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/ia-para-agentes-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="IA para Agentes de Viagem: 7 Ferramentas que Mudam o Jogo" />
                <meta property="og:description" content="As 7 ferramentas de IA que agentes de viagem estão usando para economizar horas e vender mais em 2026." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "IA para Agentes de Viagem: 7 Ferramentas que Economizam Horas por Semana",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-26", "dateModified": "2026-03-26",
                    "url": "https://canvaviagem.com/blog/ia-para-agentes-de-viagem",
                    "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">IA para Agentes de Viagem</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full mb-6">Webinar · Design Premium</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Profissionalismo Sem Designer:
                        <span className="text-primary"> Como Ter um Perfil Premium Sozinho</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">19 de abril de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">12 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop" alt="Inteligência artificial para agentes de viagem 2026" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Em 2026, agentes de viagem que não usam IA estão em desvantagem competitiva. Não é exagero: <strong className="text-slate-900">as ferramentas certas economizam de 5 a 15 horas por semana</strong> — tempo que pode ser reinvestido em atendimento, vendas e crescimento.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <p className="text-slate-600 leading-relaxed">A boa notícia: a maioria dessas ferramentas tem versão gratuita suficiente para começar. E o impacto na qualidade do conteúdo e na velocidade de produção é imediato. Aqui estão as 7 que todo agente de viagem deveria conhecer.</p>

                        {tools.map((tool) => (
                            <div key={tool.num} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">{tool.num}</span>
                                    <h2 className="text-lg font-black text-slate-900">{tool.name}</h2>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{tool.use}</p>
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                    <p className="text-blue-700 text-xs font-semibold">💡 Como usar: {tool.tip}</p>
                                </div>
                            </div>
                        ))}

                        <div className="bg-slate-900 text-white rounded-2xl p-8">
                            <h3 className="font-black text-lg mb-4">🎯 Resumo: Comece por Aqui</h3>
                            <div className="space-y-3 text-sm text-slate-300">
                                <p><strong className="text-white">Nível iniciante:</strong> ChatGPT + Canva IA. Resolve 80% das suas necessidades de criação de conteúdo.</p>
                                <p><strong className="text-white">Nível intermediário:</strong> Adicione Perplexity para pesquisa e ElevenLabs para narração de Reels.</p>
                                <p><strong className="text-white">Nível avançado:</strong> Descript para edição de vídeo e Notion IA para organização e CRM.</p>
                                <p className="text-slate-400 text-xs mt-4">* Nenhuma dessas ferramentas substitui a sua inteligência e conhecimento de destinos. Elas amplificam — não substituem — o que você já sabe.</p>
                            </div>
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

export default BlogPost22;
