import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";

const BlogPost = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "O que Postar no Instagram da Sua Agência de Viagem",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>O que Postar no Instagram da Sua Agência de Viagem (30 Ideias) | Canva Viagem</title>
                <meta
                    name="description"
                    content="Descubra 30 ideias do que postar no Instagram da sua agência de viagem hoje mesmo. Conteúdo pronto, estratégico e que atrai clientes — sem precisar gravar vídeo."
                />
                <meta
                    name="keywords"
                    content="o que postar no instagram agência de viagem, ideias posts agência de viagem, conteúdo instagram agência de viagem, reels agência de viagem, marketing digital agência de viagem"
                />
                <link rel="canonical" href="https://canvaviagem.com/blog/o-que-postar-no-instagram-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="O que Postar no Instagram da Sua Agência de Viagem (30 Ideias)" />
                <meta property="og:description" content="30 ideias de conteúdo para sua agência de viagem aparecer todo dia no Instagram e atrair mais clientes." />
                <meta property="og:image" content="https://canvaviagem.com/blog/img-instagram-agencia-viagem.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/blog/img-instagram-agencia-viagem.png" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "O que Postar no Instagram da Sua Agência de Viagem (30 Ideias)",
                    "description": "Descubra 30 ideias do que postar no Instagram da sua agência de viagem hoje mesmo.",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-07",
                    "dateModified": "2026-03-07",
                    "url": "https://canvaviagem.com/blog/o-que-postar-no-instagram-agencia-de-viagem",
                    "mainEntityOfPage": "https://canvaviagem.com/blog/o-que-postar-no-instagram-agencia-de-viagem"
                })}</script>
            </Helmet>

            <div className="min-h-screen bg-gray-50 text-gray-900">
                {/* Header */}
                <header className="border-b border-gray-200 bg-white py-4 px-6 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft size={18} />
                            <span className="text-sm">Voltar ao site</span>
                        </Link>
                        <Link to="/" className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Canva Viagem
                        </Link>
                    </div>
                </header>

                {/* Artigo */}
                <main className="max-w-4xl mx-auto px-6 py-12">

                    {/* Breadcrumb */}
                    <nav className="text-sm text-gray-400 mb-6">
                        <Link to="/" className="hover:text-gray-700">Início</Link>
                        <span className="mx-2">/</span>
                        <span className="hover:text-gray-700 cursor-pointer">Blog</span>
                        <span className="mx-2">/</span>
                        <span className="text-gray-600">O que postar no Instagram</span>
                    </nav>

                    {/* Tag de categoria */}
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full mb-6">
                        Instagram & Conteúdo
                    </span>

                    {/* Título */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-gray-900">
                        O que Postar no Instagram da Sua Agência de Viagem
                        <span className="text-blue-600"> (30 Ideias Prontas)</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>7 de março de 2026</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>8 minutos de leitura</span>
                        </div>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1.5 ml-auto text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <Share2 size={14} />
                            <span>Compartilhar</span>
                        </button>
                    </div>

                    {/* Conteúdo */}
                    <div className="prose prose-gray prose-lg max-w-none space-y-8">

                        {/* Imagem Hero */}
                        <div className="mb-8 rounded-2xl overflow-hidden border border-white/10">
                            <img
                                src="/blog/img-instagram-agencia-viagem.png"
                                alt="Instagram de agência de viagem com posts profissionais de destinos — o que postar"
                                className="w-full object-cover"
                                loading="eager"
                            />
                        </div>

                        <p className="text-xl text-gray-700 leading-relaxed">
                            Você sabe que precisa postar no Instagram da sua agência de viagem. Mas chega a hora e bate aquela travada: <em>"O que eu posto hoje?"</em>
                        </p>

                        <p className="text-white/70 leading-relaxed">
                            Isso acontece com a maioria dos agentes de viagem. Não é falta de vontade — é falta de um plano e de conteúdo pronto para usar.
                            Neste artigo você vai encontrar 30 ideias concretas de posts que funcionam, organizadas por tipo. Use como calendário editorial e nunca mais fique sem postar.
                        </p>

                        {/* CTA inline */}
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 my-10">
                            <p className="font-semibold text-gray-900 mb-2">🎯 Quer pular direto para o conteúdo pronto?</p>
                            <p className="text-gray-600 text-sm mb-4">O Canva Viagem tem 250+ vídeos prontos para você publicar no Instagram da sua agência. Editáveis no Canva. A partir de R$29/mês ou R$197/ano.</p>
                            <Link to="/planos" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm">
                                Ver conteúdo pronto →
                            </Link>
                        </div>

                        {/* Infográfico tipos de conteúdo */}
                        <figure className="my-8 rounded-2xl overflow-hidden border border-white/10">
                            <img
                                src="/blog/img-tipos-conteudo-agencia-viagem.png"
                                alt="Infográfico com 6 tipos de conteúdo para agência de viagem no Instagram: Destinos, Bastidores, Educativo, Promoções, Interativo e Humor"
                                className="w-full object-cover"
                                loading="lazy"
                            />
                            <figcaption className="text-center text-white/30 text-xs py-2 px-4">
                                Os 6 tipos de conteúdo que toda agência de viagem deve usar no Instagram
                            </figcaption>
                        </figure>

                        {/* Seção 1 */}
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Posts de Destinos (o tipo que mais atrai cliques)</h2>
                        <p className="text-white/70 leading-relaxed">
                            Destinos são o conteúdo número 1 em agências de viagem. O viajante sonha, e você é quem realiza o sonho. Use esses formatos:
                        </p>
                        <ul className="space-y-3 text-white/70">
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">01.</span><span><strong className="text-white">Foto ou Reel do destino</strong> com uma curiosidade que as pessoas não sabem. Ex: "Sabia que Maragogi tem a água mais transparente do Brasil?"</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">02.</span><span><strong className="text-white">Comparativo de destinos</strong>: "Maldivas ou Noronha? Veja qual é ideal para você."</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">03.</span><span><strong className="text-white">Destinos do mês</strong>: "5 destinos perfeitos para viajar em agosto com a família."</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">04.</span><span><strong className="text-white">Destino + preço estimado</strong>: "Quanto custa viajar para a Disney em 2026?"</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">05.</span><span><strong className="text-white">Destino nacional pouco conhecido</strong>: "3 lugares incríveis no Brasil que você provavelmente ainda não foi."</span></li>
                        </ul>

                        {/* Seção 2 */}
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. Posts de Bastidores (criam conexão)</h2>
                        <p className="text-white/70 leading-relaxed">
                            Pessoas compram de pessoas. Mostrar o dia a dia da sua agência gera confiança — e confiança gera venda.
                        </p>
                        <ul className="space-y-3 text-white/70">
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">06.</span><span><strong className="text-white">Depoimento de cliente viajando</strong> com foto ou vídeo enviado por ele.</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">07.</span><span><strong className="text-white">Antes e depois de uma viagem organizada por você.</strong></span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">08.</span><span><strong className="text-white">Sua história como agente</strong>: por que você escolheu trabalhar com viagens?</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">09.</span><span><strong className="text-white">Roteiro personalizado que você montou</strong> para um cliente (sem dados pessoais).</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">10.</span><span><strong className="text-white">Missão do dia</strong>: "hoje organizei a viagem de lua de mel de um casal para Portugal."</span></li>
                        </ul>

                        {/* Seção 3 */}
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Posts Educativos (aumentam sua autoridade)</h2>
                        <p className="text-white/70 leading-relaxed">
                            Ensinar é uma das formas mais poderosas de vender. Quando você educa, as pessoas te veem como especialista — e especialistas cobram mais.
                        </p>
                        <ul className="space-y-3 text-white/70">
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">11.</span><span><strong className="text-white">Dica de passagem barata</strong>: "Como encontrar voos baratos com 3 meses de antecedência."</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">12.</span><span><strong className="text-white">O que levar na mala</strong> para um destino específico (praia, frio, Europa).</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">13.</span><span><strong className="text-white">Documentos necessários</strong>: "O que você precisa ter em dia para viajar para os EUA."</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">14.</span><span><strong className="text-white">Erros que os viajantes cometem</strong>: "5 erros que as pessoas cometem ao planejar a primeira viagem internacional."</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">15.</span><span><strong className="text-white">Seguro viagem</strong>: por que contratar e o que cobre.</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">16.</span><span><strong className="text-white">Alta vs Baixa temporada</strong>: qual é melhor para viajar para cada destino.</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">17.</span><span><strong className="text-white">Visto</strong>: quais países o brasileiro não precisa de visto.</span></li>
                        </ul>

                        {/* Seção 4 */}
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Posts de Oferta e Promoção</h2>
                        <p className="text-white/70 leading-relaxed">
                            Sim, você pode e deve postar ofertas. Mas o segredo é não só fazer isso — misture com os outros tipos.
                        </p>
                        <ul className="space-y-3 text-white/70">
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">18.</span><span><strong className="text-white">Pacote da semana</strong> com preço e o que está incluso (passagem, hotel, transfer).</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">19.</span><span><strong className="text-white">Última hora</strong>: "Pacote saindo este fim de semana. Vagas limitadas."</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">20.</span><span><strong className="text-white">Parcelamento</strong>: mostre que é possível viajar pagando pouco por mês.</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">21.</span><span><strong className="text-white">Promoção de data comemorativa</strong>: aniversário, Dia das Mães, Natal, Reveillon.</span></li>
                        </ul>

                        {/* Seção 5 */}
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Posts Interativos (aumentam o alcance)</h2>
                        <p className="text-white/70 leading-relaxed">
                            O algoritmo do Instagram ama comentários, salvamentos e compartilhamentos. Use formatos que geram ação.
                        </p>
                        <ul className="space-y-3 text-white/70">
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">22.</span><span><strong className="text-white">Enquete</strong>: "Praia ou campo? Diz aqui nos comentários."</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">23.</span><span><strong className="text-white">Complete a frase</strong>: "Meu próximo destino dos sonhos é ___."</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">24.</span><span><strong className="text-white">Esse ou aquele</strong>: "Paris ou Roma? Cada um que posta qual escolheria."</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">25.</span><span><strong className="text-white">Marque alguém</strong>: "Marca aquela pessoa que está devendo uma viagem com você!"</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">26.</span><span><strong className="text-white">Pergunta direta</strong>: "Para onde você quer viajar até o final deste ano?"</span></li>
                        </ul>

                        {/* Seção 6 */}
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">6. Posts com Humor e Cultura Pop</h2>
                        <p className="text-white/70 leading-relaxed">
                            Leveza no feed aumenta o alcance. Posts engraçados são compartilháveis.
                        </p>
                        <ul className="space-y-3 text-white/70">
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">27.</span><span><strong className="text-white">Meme de viagem</strong>: algo que todo viajante vai se identificar.</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">28.</span><span><strong className="text-white">Reação ao orçamento vs realidade</strong>: meme mostrando o antes e depois do cliente que achou caro.</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">29.</span><span><strong className="text-white">Frases de viagem</strong>: citações motivacionais sobre viajar que fazem as pessoas salvar.</span></li>
                            <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">30.</span><span><strong className="text-white">Meme adaptado para o nicho</strong>: use um meme popular e adapte para o cotidiano de agente de viagem.</span></li>
                        </ul>

                        {/* Frequência de postagem */}
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Com que Frequência Postar?</h2>
                        <p className="text-white/70 leading-relaxed">
                            A resposta é: poste mais do que você está postando agora. O mínimo é 4 vezes por semana.
                            Mas o que a maioria das agências de viagem faz? Menos de 1 vez por semana — e aí clama que "o Instagram não funciona".
                        </p>
                        <p className="text-white/70 leading-relaxed">
                            O problema não é o Instagram. É a falta de constância. E a falta de constância vem da falta de conteúdo pronto.
                        </p>

                        {/* CTA final */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 my-10 text-center">
                            <h3 className="text-2xl font-bold text-white mb-3">150 Posts Prontos para Você Publicar Agora</h3>
                            <p className="text-white/80 mb-6 max-w-lg mx-auto">
                                O Canva Viagem tem 150 vídeos profissionais editáveis no Canva — com destinos nacionais e internacionais, hooks de alta conversão e layout premium. Por R$47 uma única vez.
                            </p>
                            <Link
                                to="/planos"
                                className="inline-block bg-white text-purple-700 font-bold px-8 py-3 rounded-xl hover:bg-white/90 transition-opacity text-sm"
                            >
                                Quero os 150 vídeos prontos por R$47 →
                            </Link>
                        </div>

                    </div>
                </main>

                {/* Footer simples */}
                <footer className="border-t border-white/10 py-8 px-6 text-center text-white/30 text-sm">
                    <p>© 2026 Canva Viagem. Todos os direitos reservados.</p>
                    <div className="flex justify-center gap-4 mt-2">
                        <Link to="/termos" className="hover:text-white/60 transition-colors">Termos</Link>
                        <Link to="/privacidade" className="hover:text-white/60 transition-colors">Privacidade</Link>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default BlogPost;
