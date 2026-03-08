import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, BookOpen, Users, TrendingUp } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost12 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: "Como se Tornar Agente de Viagens sem Experiência", url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Como se Tornar Agente de Viagens sem Experiência em 2026 | Canva Viagem</title>
                <meta name="description" content="Aprenda o passo a passo para se tornar agente de viagens autônomo em 2026, mesmo sem experiência no setor. Descubra cursos, credenciamentos e como captar os primeiros clientes." />
                <meta name="keywords" content="como ser agente de viagens, tornar se agente de viagem, agente de viagem autônomo, trabalhar com viagens, como começar agencia de viagem" />
                <link rel="canonical" href="https://canvaviagem.com/blog/como-se-tornar-agente-de-viagens" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Como se Tornar Agente de Viagens em 2026 (Guia Completo)" />
                <meta property="og:description" content="Passo a passo para começar a trabalhar com turismo sem experiência prévia." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "Como se Tornar Agente de Viagens sem Experiência em 2026",
                    "description": "Guia completo para iniciar no turismo sem experiência prévia.",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-16",
                    "dateModified": "2026-03-16",
                    "url": "https://canvaviagem.com/blog/como-se-tornar-agente-de-viagens",
                    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"
                })}</script>
            </Helmet>

            <div className="min-h-screen bg-gray-50 text-slate-900">
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">Voltar ao site</span>
                        </Link>
                        <Link to="/" className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Canva Viagem</Link>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-6 py-12 pb-32">
                    <nav className="text-sm text-slate-400 mb-6 font-medium">
                        <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                        <span className="mx-2">/</span>
                        <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-600">Como ser Agente de Viagens</span>
                    </nav>

                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">
                        Carreira · Turismo
                    </span>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Como se Tornar Agente de Viagens em 2026:
                        <span className="text-primary"> O Passo a Passo Completo</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Calendar size={14} className="text-primary" /><span className="font-medium">16 de março de 2026</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock size={14} className="text-primary" /><span className="font-medium">11 minutos de leitura</span>
                        </div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium">
                            <Share2 size={14} /><span>Compartilhar</span>
                        </button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img
                                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
                                alt="Praia paradisíaca representando o sonho de trabalhar com viagens"
                                className="w-full h-auto"
                            />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Você provavelmente já pensou nisso: <strong className="text-slate-900">"E se eu pudesse trabalhar com algo que amo?"</strong> Para muitas pessoas, viagens são essa paixão. A boa notícia: existe uma profissão inteira construída em torno disso — e ela nunca foi tão acessível para quem está começando do zero.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <p className="text-slate-600 leading-relaxed">
                            Ser agente de viagens autônomo não exige diploma, capital inicial alto ou experiência prévia. O que exige é método, presença digital e constância. Neste guia, vou mostrar exatamente o caminho que dezenas de agentes percorreram nos últimos dois anos.
                        </p>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6">
                            📋 O Que é um Agente de Viagens Autônomo?
                        </h2>

                        <p className="text-slate-600 leading-relaxed">
                            Um agente de viagens autônomo é um intermediário entre o cliente final e as operadoras turísticas. Você recomenda, organiza e vende pacotes de viagem, passagens e hotéis — recebendo uma <strong>comissão de 7% a 15%</strong> sobre cada venda.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                            {[
                                { icon: <BookOpen size={28} className="text-blue-500 mx-auto mb-3" />, title: "Sem Formação Obrigatória", desc: "Não existe regulamentação formal que exija diploma para atuar como agente autônomo." },
                                { icon: <Users size={28} className="text-purple-500 mx-auto mb-3" />, title: "Trabalho Remoto", desc: "Atendimento pelo WhatsApp, Instagram e telefone. Sem ponto físico obrigatório." },
                                { icon: <TrendingUp size={28} className="text-emerald-500 mx-auto mb-3" />, title: "Crescimento Escalável", desc: "Quanto mais clientes e conteúdo, mais comissões chegam — inclusive enquanto você dorme." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                                    {item.icon}
                                    <p className="font-bold text-slate-900 text-sm mb-1">{item.title}</p>
                                    <p className="text-slate-500 text-xs">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6">
                            🗺️ Passo a Passo para Começar
                        </h2>

                        {[
                            { step: "1", title: "Credenciamento como Agente Autônomo", desc: "Procure operadoras turísticas como CVC, Flytour, Trend, Schultz e outras. O cadastro como agente parceiro é gratuito e te dá acesso ao sistema de reservas e às comissões. Você pode se credenciar em várias operadoras ao mesmo tempo.", tip: "Dica: comece com 2 ou 3 operadoras e vá ampliando conforme dominar cada sistema." },
                            { step: "2", title: "Crie seu Perfil Profissional nas Redes", desc: "Instagram e WhatsApp Business são os dois canais obrigatórios. Nome do perfil, bio clara ('Agente de Viagens | Destinos Nacionais e Internacionais | Orçamento sem compromisso'), foto profissional e link de contato.", tip: "Dica: não precisa ter um CNPJ para começar. Pode atuar como pessoa física inicialmente." },
                            { step: "3", title: "Defina seu Nicho de Especialização", desc: "Agentes que especializam em um segmento vendem muito mais. Escolha: turismo nacional, Europa, lua de mel, viagens em família, mochilão, cruzeiros. Especialista atrai cliente certo e cobra mais.", tip: "Dica: comece com destinos que você conhece bem ou que tem mais demanda na sua região." },
                            { step: "4", title: "Comece a Publicar Conteúdo", desc: "Publique 4 a 5 vezes por semana no Instagram sobre destinos, dicas de viagem e ofertas. Conteúdo é a forma mais barata de atrair clientes sem pagar anúncios. Reels e carrosséis de destinos têm alto potencial de viralização.", tip: "Dica: o maior problema dos iniciantes é não saber o que postar. Use conteúdo pronto para eliminar esse gargalo." },
                            { step: "5", title: "Faça as Primeiras Vendas para o Círculo Próximo", desc: "Seus primeiros clientes quase sempre são pessoas conhecidas: família, amigos, colegas. Ofereça orçamento personalizado, seja ágil nas respostas e supere a expectativa. Cada cliente satisfeito indica outros.", tip: "Dica: uma venda de viagem de lua de mel para um casal pode gerar R$300 a R$800 de comissão numa única transação." }
                        ].map((item) => (
                            <div key={item.step} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black text-lg flex-shrink-0">{item.step}</span>
                                    <h3 className="font-black text-slate-900 text-lg">{item.title}</h3>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                    <p className="text-blue-700 text-xs font-semibold">{item.tip}</p>
                                </div>
                            </div>
                        ))}

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-14 mb-6">
                            ❓ Perguntas Frequentes de Quem Está Começando
                        </h2>

                        {[
                            { q: "Preciso abrir empresa para trabalhar como agente?", a: "Não no início. Você pode atuar como pessoa física recebendo comissões. Mas quando o faturamento crescer (acima de R$3.000/mês), vale abrir um MEI para profissionalizar e ter acesso a mais operadoras." },
                            { q: "Quanto tempo leva para fazer a primeira venda?", a: "Agentes que criam conteúdo desde o primeiro dia relatam primeiras vendas entre 30 e 90 dias. Os que só esperam indicações demoram mais." },
                            { q: "Precisa viajar muito para ser agente de viagens?", a: "Não. Muitos agentes de sucesso nunca priorizaram viagens pessoais. O que importa é conhecimento de destinos, bom atendimento e capacidade de pesquisar." },
                            { q: "Qual a comissão média de um pacote nacional?", a: "Entre 7% e 12%. Num pacote de R$3.000 para Natal, você recebe de R$210 a R$360 por venda." }
                        ].map((item, i) => (
                            <div key={i} className="border border-gray-200 bg-white rounded-2xl p-6 space-y-2">
                                <p className="font-black text-slate-900 text-base">❓ {item.q}</p>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                            </div>
                        ))}

                        <BlogCTA type="consideration" className="my-10" />

                        <div className="bg-slate-50 border border-gray-200 rounded-2xl p-8">
                            <h3 className="font-black text-slate-900 mb-4">Conclusão: Começar é a Etapa Mais Difícil (e a Mais Importante)</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                O mercado de turismo está crescendo. Os clientes estão no Instagram. As operadoras querem parceiros. A única coisa que falta — em quase todos os casos — é <strong>a decisão de dar o primeiro passo</strong>. Quem começou há 6 meses hoje já tem uma renda extra consistente. Daqui a 6 meses, você pode estar no mesmo lugar.
                            </p>
                        </div>
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

export default BlogPost12;
