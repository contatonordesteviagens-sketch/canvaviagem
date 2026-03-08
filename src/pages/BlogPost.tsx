import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

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
                <meta property="og:image" content="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1200&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1200&auto=format&fit=crop" />
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
                        <Link to="/" className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Canva Viagem
                        </Link>
                    </div>
                </header>

                {/* Artigo */}
                <main className="max-w-4xl mx-auto px-6 py-12 pb-32">

                    {/* Breadcrumb */}
                    <nav className="text-sm text-gray-400 mb-6">
                        <Link to="/" className="hover:text-gray-700">Início</Link>
                        <span className="mx-2">/</span>
                        <Link to="/blog" className="hover:text-gray-700">Blog</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-600">O que postar no Instagram</span>
                    </nav>

                    {/* Tag de categoria */}
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-400/10 px-3 py-1 rounded-full mb-6">
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
                        <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                            <img
                                src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop"
                                alt="Instagram de agência de viagem com posts profissionais de destinos — o que postar"
                                className="w-full object-cover"
                                loading="eager"
                            />
                        </div>

                        <p className="text-xl text-gray-700 leading-relaxed">
                            Você sabe que precisa postar no Instagram da sua agência de viagem. Mas chega a hora e bate aquela travada: <em>"O que eu posto hoje?"</em>
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. Posts de Destinos (o tipo que mais atrai cliques)</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Destinos são o conteúdo número 1 em agências de viagem. O viajante sonha, e você é quem realiza o sonho. Use esses formatos:
                        </p>
                        <ul className="space-y-3 text-slate-600">
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">01.</span><span><strong className="text-slate-900">Foto ou Reel do destino</strong> com uma curiosidade que as pessoas não sabem. Ex: "Sabia que Maragogi tem a água mais transparente do Brasil?"</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">02.</span><span><strong className="text-blue-600 font-bold">Comparativo de destinos</strong>: "Maldivas ou Noronha? Veja qual é ideal para você."</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">03.</span><span><strong className="text-slate-900">Destinos do mês</strong>: "5 destinos perfeitos para viajar em agosto com a família."</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">04.</span><span><strong className="text-slate-900">Destino + preço estimado</strong>: "Quanto custa viajar para a Disney em 2026?"</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">05.</span><span><strong className="text-slate-900">Destino nacional pouco conhecido</strong>: "3 lugares incríveis no Brasil que você provavelmente ainda não foi."</span></li>
                        </ul>

                        <BlogCTA type="awareness" className="my-12 shadow-blue-100" />

                        {/* Seção 2 */}
                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. Posts de Bastidores (criam conexão)</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Pessoas compram de pessoas. Mostrar o dia a dia da sua agência gera confiança — e confiança gera venda.
                        </p>
                        <ul className="space-y-3 text-slate-600">
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">06.</span><span><strong className="text-slate-900">Depoimento de cliente viajando</strong> com foto ou vídeo enviado por ele.</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">07.</span><span><strong className="text-slate-900">Antes e depois de uma viagem organizada por você.</strong></span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">08.</span><span><strong className="text-slate-900">Sua história como agente</strong>: por que você escolheu trabalhar com viagens?</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">09.</span><span><strong className="text-slate-900">Roteiro personalizado que você montou</strong> para um cliente (sem dados pessoais).</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">10.</span><span><strong className="text-slate-900">Missão do dia</strong>: "hoje organizei a viagem de lua de mel de um casal para Portugal."</span></li>
                        </ul>

                        <BlogCTA type="consideration" className="my-12" />

                        {/* Seção 3 */}
                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Posts Educativos (aumentam sua autoridade)</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Ensinar é uma das formas mais poderosas de vender. Quando você educa, as pessoas te veem como especialista — e especialistas cobram mais.
                        </p>
                        <ul className="space-y-3 text-slate-600">
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">11.</span><span><strong className="text-slate-900">Dica de passagem barata</strong>: "Como encontrar voos baratos com 3 meses de antecedência."</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">12.</span><span><strong className="text-slate-900">O que levar na mala</strong> para um destino específico (praia, frio, Europa).</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">13.</span><span><strong className="text-slate-900">Documentos necessários</strong>: "O que você precisa ter em dia para viajar para os EUA."</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">14.</span><span><strong className="text-slate-900">Erros que os viajantes cometem</strong>: "5 erros que as pessoas cometem ao planejar a primeira viagem internacional."</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">15.</span><span><strong className="text-slate-900">Seguro viagem</strong>: por que contratar e o que cobre.</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">16.</span><span><strong className="text-slate-900">Alta vs Baixa temporada</strong>: qual é melhor para viajar para cada destino.</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">17.</span><span><strong className="text-slate-900">Visto</strong>: quais países o brasileiro não precisa de visto.</span></li>
                        </ul>

                        {/* Seção 4 */}
                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. Posts de Oferta e Promoção</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Sim, você pode e deve postar ofertas. Mas o segredo é não só fazer isso — misture com os outros tipos.
                        </p>
                        <ul className="space-y-3 text-slate-600">
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">18.</span><span><strong className="text-slate-900">Pacote da semana</strong> com preço e o que está incluso (passagem, hotel, transfer).</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">19.</span><span><strong className="text-slate-900">Última hora</strong>: "Pacote saindo este fim de semana. Vagas limitadas."</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">20.</span><span><strong className="text-slate-900">Parcelamento</strong>: mostre que é possível viajar pagando pouco por mês.</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">21.</span><span><strong className="text-slate-900">Promoção de data comemorativa</strong>: aniversário, Dia das Mães, Natal, Reveillon.</span></li>
                        </ul>

                        {/* Seção 5 */}
                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Posts Interativos (aumentam o alcance)</h2>
                        <p className="text-slate-600 leading-relaxed">
                            O algoritmo do Instagram ama comentários, salvamentos e compartilhamentos. Use formatos que geram ação.
                        </p>
                        <ul className="space-y-3 text-slate-600">
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">22.</span><span><strong className="text-slate-900">Enquete</strong>: "Praia ou campo? Diz aqui nos comentários."</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">23.</span><span><strong className="text-slate-900">Complete a frase</strong>: "Meu próximo destino dos sonhos é ___."</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">24.</span><span><strong className="text-slate-900">Esse ou aquele</strong>: "Paris ou Roma? Cada um que posta qual escolheria."</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">25.</span><span><strong className="text-slate-900">Marque alguém</strong>: "Marca aquela pessoa que está devendo uma viagem com você!"</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">26.</span><span><strong className="text-slate-900">Pergunta direta</strong>: "Para onde você quer viajar até o final deste ano?"</span></li>
                        </ul>

                        {/* Seção 6 */}
                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">6. Posts com Humor e Cultura Pop</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Leveza no feed aumenta o alcance. Posts engraçados são compartilháveis.
                        </p>
                        <ul className="space-y-3 text-slate-600">
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">27.</span><span><strong className="text-slate-900">Meme de viagem</strong>: algo que todo viajante vai se identificar.</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">28.</span><span><strong className="text-slate-900">Reação ao orçamento vs realidade</strong>: meme mostrando o antes e depois do cliente que achou caro.</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">29.</span><span><strong className="text-slate-900">Frases de viagem</strong>: citações motivacionais sobre viajar que fazem as pessoas salvar.</span></li>
                            <li className="flex gap-3"><span className="text-blue-600 font-bold flex-shrink-0">30.</span><span><strong className="text-slate-900">Meme adaptado para o nicho</strong>: use um meme popular e adapte para o cotidiano de agente de viagem.</span></li>
                        </ul>

                        {/* Frequência de postagem */}
                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Com que Frequência Postar?</h2>
                        <p className="text-slate-700 leading-relaxed">
                            A resposta é: poste mais do que você está postando agora. O mínimo é 4 vezes por semana.
                            Mas o que a maioria das agências de viagem faz? Menos de 1 vez por semana — e aí clama que "o Instagram não funciona".
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            O problema não é o Instagram. É a falta de constância. E a falta de constância vem da falta de conteúdo pronto.
                        </p>

                        <BlogCTA type="decision" className="my-12 shadow-purple-200" />

                    </div>
                </main>

                {/* Footer simples */}
                <footer className="border-t border-gray-200 py-8 px-6 text-center text-gray-500 text-sm">
                    <p>© 2026 Canva Viagem. Todos os direitos reservados.</p>
                    <div className="flex justify-center gap-4 mt-2">
                        <Link to="/termos" className="hover:text-gray-900 transition-colors">Termos</Link>
                        <Link to="/privacidade" className="hover:text-gray-900 transition-colors">Privacidade</Link>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default BlogPost;
