import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost3 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Marketing Digital para Agência de Viagem: O Guia Completo 2026",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Marketing Digital para Agência de Viagem: Guia Completo 2026 | Canva Viagem</title>
                <meta
                    name="description"
                    content="Aprenda marketing digital para agência de viagem do zero. Os 7 erros que derrubam agentes no Instagram e como evitá-los. Estratégias que funcionam em 2026."
                />
                <meta
                    name="keywords"
                    content="marketing digital para agência de viagem, como conseguir clientes agência de viagem, instagram para agente de viagem, erros agência de viagem instagram, estratégia marketing turismo"
                />
                <link rel="canonical" href="https://canvaviagem.com/blog/marketing-digital-para-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Marketing Digital para Agência de Viagem: Guia Completo 2026" />
                <meta property="og:description" content="Os 7 erros que derrubam agentes no Instagram e as estratégias que estão funcionando em 2026." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "Marketing Digital para Agência de Viagem: Guia Completo 2026",
                    "description": "Os 7 erros que derrubam agentes no Instagram e as estratégias que realmente funcionam em 2026.",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-10",
                    "dateModified": "2026-03-10",
                    "url": "https://canvaviagem.com/blog/marketing-digital-para-agencia-de-viagem",
                    "image": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Marketing Digital para Agência</span>
                    </nav>

                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">
                        Marketing Digital · Estratégia
                    </span>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Marketing Digital para Agência de Viagem:
                        <span className="text-primary"> O Guia Completo 2026</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Calendar size={14} className="text-primary" />
                            <span className="font-medium">10 de março de 2026</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock size={14} className="text-primary" />
                            <span className="font-medium">12 minutos de leitura</span>
                        </div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium">
                            <Share2 size={14} />
                            <span>Compartilhar</span>
                        </button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img
                                src="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=1200&auto=format&fit=crop"
                                alt="Marketing digital para agência de viagem"
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Intro */}
                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            Em 2026, não basta ter uma agência de viagem boa. <strong className="text-slate-900">Você precisa ser encontrada.</strong> E o marketing digital deixou de ser opcional para se tornar o maior diferencial entre agentes que crescem e aqueles que ainda esperam o telefone tocar.
                        </p>

                        <BlogCTA type="awareness" className="my-10 shadow-blue-50" />

                        <p className="text-slate-600 leading-relaxed">
                            A boa notícia: a maioria dos agentes ainda erra nos mesmos pontos básicos. Isso significa que quem acertar <em>agora</em> vai sair na frente dos concorrentes por meses — ou anos.
                        </p>

                        {/* Bloco de benefícios rápidos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-10">
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                                <TrendingUp className="text-primary mx-auto mb-3" size={28} />
                                <p className="font-bold text-slate-900 text-sm">Alcance Orgânico</p>
                                <p className="text-slate-500 text-xs mt-1">Conteúdo certo gera clientes sem pagar por anúncio</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                                <CheckCircle2 className="text-green-500 mx-auto mb-3" size={28} />
                                <p className="font-bold text-slate-900 text-sm">Autoridade</p>
                                <p className="text-slate-500 text-xs mt-1">Quem ensina mais é contratado mais</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                                <AlertTriangle className="text-amber-500 mx-auto mb-3" size={28} />
                                <p className="font-bold text-slate-900 text-sm">Concorrência Alta</p>
                                <p className="text-slate-500 text-xs mt-1">Quem não está visível, não existe para o cliente</p>
                            </div>
                        </div>

                        {/* Erros */}
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6">
                            ❌ Os 7 Erros que Derrubam Agentes no Instagram
                        </h2>

                        <p className="text-slate-600 leading-relaxed">
                            Antes de falar o que fazer, é mais importante entender o que <strong>não fazer</strong>. Esses são os sete erros que aparecem repetidamente no perfil de agentes que reclamam que o Instagram "não funciona pra eles":
                        </p>

                        {[
                            {
                                num: "01",
                                title: "Postar só pacotes e preços",
                                desc: "Instagram não é catálogo. Quem só posta \"Grécia, R$X por pessoa\" está jogando fora a principal vantagem da plataforma: o potencial de criar desejo. Segue a regra 80/20: 80% conteúdo de valor, 20% oferta.",
                                color: "text-red-500 bg-red-50"
                            },
                            {
                                num: "02",
                                title: "Falta de consistência (postar quando lembra)",
                                desc: "O algoritmo favorece quem posta com frequência. Agentes que postam 1x por semana competem contra agentes que postam 5x. Não tem como ganhar.",
                                color: "text-orange-500 bg-orange-50"
                            },
                            {
                                num: "03",
                                title: "Bio vazia ou genérica",
                                desc: "A bio é a primeira coisa que alguém lê. Se ela disser \"Agência de viagens | ✈️🌍\" sem deixar claro para quem é, o visitante vai embora em 3 segundos.",
                                color: "text-yellow-600 bg-yellow-50"
                            },
                            {
                                num: "04",
                                title: "Não responder nos comentários nem DMs",
                                desc: "Em 2026, a métrica mais importante é conversas iniciadas. Ignorar comentários é jogar no lixo o alcance que você está construindo.",
                                color: "text-blue-500 bg-blue-50"
                            },
                            {
                                num: "05",
                                title: "Focar apenas em seguidores",
                                desc: "10.000 seguidores desengajados valem menos do que 500 seguidores que respondem, salvam e mandam mensagem. Qualidade sempre supera quantidade.",
                                color: "text-purple-500 bg-purple-50"
                            },
                            {
                                num: "06",
                                title: "Não ter CTA claro nos posts",
                                desc: "Toda publicação precisa de uma call-to-action: \"Manda DM\", \"Salva pra usar depois\", \"Comenta o destino dos seus sonhos\". Sem isso, o seguidor consome e vai embora.",
                                color: "text-pink-500 bg-pink-50"
                            },
                            {
                                num: "07",
                                title: "Não medir nada",
                                desc: "Se você não sabe quais posts geraram mais DMs ou cliques no link, você está voando às cegas. Revise o Instagram Insights semanalmente.",
                                color: "text-gray-600 bg-gray-100"
                            }
                        ].map((item) => (
                            <div key={item.num} className="flex gap-5 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                <span className={`text-2xl font-black flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                                    {item.num}
                                </span>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}

                        <BlogCTA type="consideration" className="my-10" />

                        {/* O que fazer */}
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-14 mb-6">
                            ✅ O Que Funciona em 2026: Estratégia Passo a Passo
                        </h2>

                        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-3">1. Defina com clareza para quem você anda captando</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Antes de postar qualquer coisa, responda: <em>Quem é meu cliente ideal?</em> Família que viaja nas férias? Casal em lua de mel? Viajante solo mochileiro? Cada perfil quer ver conteúdos completamente diferentes. Defina um avatar e escreva para ele.
                        </p>

                        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-3">2. Use a pirâmide de conteúdo</h3>
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="space-y-3">
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                    <p className="font-bold text-blue-700 text-sm">🔝 TOPO (30%) — Autoridade</p>
                                    <p className="text-slate-600 text-xs mt-1">Dicas, guias, roteiros. Conteúdo que te posiciona como especialista. Ex: "5 coisas que todo viajante deve saber antes de ir pra Europa"</p>
                                </div>
                                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                    <p className="font-bold text-purple-700 text-sm">🎯 MEIO (50%) — Relacionamento</p>
                                    <p className="text-slate-600 text-xs mt-1">Depoimentos, bastidores, curiosidades. Conteúdo que gera conexão. Ex: "Olha o que a cliente Marina disse depois da viagem pra Cancún"</p>
                                </div>
                                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                    <p className="font-bold text-green-700 text-sm">💰 BASE (20%) — Conversão</p>
                                    <p className="text-slate-600 text-xs mt-1">Ofertas, pacotes, preços. Mas sempre com CTA claro. Ex: "Pacote Maldivas: 7 noites com tudo incluso. DM aberto para consultar agenda"</p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-3">3. Formatos que mais performam agora</h3>
                        <ul className="space-y-3 text-slate-600">
                            <li className="flex gap-3 items-start">
                                <span className="text-green-500 font-bold mt-0.5">✓</span>
                                <span><strong className="text-slate-900">Reels com roteiro:</strong> vídeos de 15-30 segundos com começo (gancho), meio (dica/destino) e fim (CTA). Geram o maior alcance.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="text-green-500 font-bold mt-0.5">✓</span>
                                <span><strong className="text-slate-900">Carrosséis educativos:</strong> são os posts com maior taxa de salvamentos — o melhor sinal de valor para o algoritmo. "7 destinos baratos para 2026" é ouro.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="text-green-500 font-bold mt-0.5">✓</span>
                                <span><strong className="text-slate-900">Stories diários:</strong> mostram presença. Reações, enquetes, "link na bio" — os Stories são o melhor canal para leads quentes que já te seguem.</span>
                            </li>
                        </ul>

                        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-3">4. Frequência mínima que faz diferença</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Para começar a ver resultado orgânico: <strong className="text-slate-900">4 posts no feed por semana + stories diários</strong>. Abaixo disso, o algoritmo não te distribui bem. Acima, é ainda melhor — mas consistência vale mais que quantidade.
                        </p>

                        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-3">5. Google também é parte do jogo</h3>
                        <p className="text-slate-600 leading-relaxed">
                            O Instagram está crescendo como mecanismo de busca, mas o Google ainda domina quando alguém digita "agência de viagem para lua de mel em Fortaleza". Ter artigos no blog da sua agência nessas palavras-chave significa aparecer <em>antes</em> de anunciar.
                        </p>

                        {/* CTA final */}
                        <div className="bg-slate-900 rounded-3xl p-10 my-16 text-center shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>

                            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4 relative z-10">
                                ✅ 7 dias de garantia incondicional
                            </p>
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-4 relative z-10">
                                Pare de Começar Do Zero Toda Semana
                            </h3>
                            <p className="text-slate-300 mb-2 max-w-lg mx-auto text-base md:text-lg relative z-10">
                                Centenas de vídeos e artes prontos para sua agência. Estratégia de conteúdo para o Instagram sem gravar, sem aparecer, sem editar do zero.
                            </p>
                            <p className="text-slate-400 text-sm mb-8 relative z-10">
                                Plano Mensal: R$29/mês · Plano Anual: R$197 (economize R$151)
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
                                <Link to="/planos" className="inline-block bg-white text-slate-900 font-black px-8 py-4 rounded-2xl hover:bg-slate-100 transition-all text-base shadow-xl active:scale-95">
                                    QUERO O PLANO ANUAL R$197 →
                                </Link>
                                <Link to="/planos" className="inline-block bg-transparent border-2 border-white/30 text-white font-bold px-8 py-4 rounded-2xl hover:border-white/60 transition-all text-base active:scale-95">
                                    Ver plano mensal R$29
                                </Link>
                            </div>
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

export default BlogPost3;
