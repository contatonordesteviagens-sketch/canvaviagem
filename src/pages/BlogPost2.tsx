import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost2 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Como Criar Conteúdo para Agência de Viagem Sem Gravar Vídeo",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>Como Criar Conteúdo para Agência de Viagem Sem Gravar Vídeo | Canva Viagem</title>
                <meta
                    name="description"
                    content="Aprenda como criar conteúdo profissional para sua agência de viagem no Instagram sem precisar aparecer, gravar ou editar vídeos. Método simples e que funciona."
                />
                <meta
                    name="keywords"
                    content="como criar conteúdo agência de viagem, conteúdo pronto agência de viagem, vídeos prontos instagram agência de viagem, marketing digital agência de viagem sem gravar, canva agência de viagem"
                />
                <link rel="canonical" href="https://canvaviagem.com/blog/como-criar-conteudo-agencia-de-viagem-sem-gravar-video" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Como Criar Conteúdo para Agência de Viagem Sem Gravar Vídeo" />
                <meta property="og:description" content="O método que agentes de viagem usam para postar todo dia no Instagram sem aparecer na câmera." />
                <meta property="og:image" content="https://canvaviagem.com/blog/img-como-criar-conteudo-sem-gravar.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://canvaviagem.com/blog/img-como-criar-conteudo-sem-gravar.png" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "Como Criar Conteúdo para Agência de Viagem Sem Gravar Vídeo",
                    "description": "O método que agentes de viagem usam para postar todo dia no Instagram sem aparecer na câmera.",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-03-07",
                    "dateModified": "2026-03-07",
                    "url": "https://canvaviagem.com/blog/como-criar-conteudo-agencia-de-viagem-sem-gravar-video"
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
                        <span className="text-slate-600">Criar conteúdo sem gravar vídeo</span>
                    </nav>

                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-600 bg-purple-400/10 px-3 py-1 rounded-full mb-6">
                        Conteúdo & Estratégia
                    </span>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                        Como Criar Conteúdo para Agência de Viagem
                        <span className="text-purple-600"> Sem Gravar Vídeo</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Calendar size={14} className="text-primary" />
                            <span className="font-medium">7 de março de 2026</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock size={14} className="text-primary" />
                            <span className="font-medium">7 minutos de leitura</span>
                        </div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium">
                            <Share2 size={14} />
                            <span>Compartilhar</span>
                        </button>
                    </div>

                    <div className="prose prose-slate prose-lg max-w-none space-y-8">

                        {/* Imagem Hero */}
                        <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                            <img
                                src="/blog/img-como-criar-conteudo-sem-gravar.png"
                                alt="Método de 3 passos para criar conteúdo para agência de viagem sem gravar vídeo"
                                className="w-full object-cover"
                                loading="eager"
                            />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            "Não consigo criar conteúdo porque não sei gravar vídeo" — essa é a frase que mais trava agentes de viagem no Instagram.
                            E a boa notícia é que você não precisa gravar nada para ter um perfil profissional e ativo.
                        </p>

                        <p className="text-slate-600 leading-relaxed">
                            Neste artigo você vai entender como funciona o método que agentes de viagem de todo o Brasil estão usando para postar todo dia — sem aparecer na câmera, sem editar no celular, sem contratar um designer.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Por que a maioria dos agentes não posta?</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Existe uma crença de que para ter um Instagram bom, você precisa de três coisas: câmera profissional, habilidade de edição e muito tempo. Nenhuma dessas três é verdade.
                        </p>

                        <BlogCTA type="free" className="my-10" />

                        <p className="text-slate-600 leading-relaxed">
                            O que você precisa, na verdade, é de <strong className="text-slate-900">conteúdo visual de qualidade</strong> e <strong className="text-slate-900">consistência</strong>. E dá para ter os dois sem gravar um segundo de vídeo sequer.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Os 3 tipos de conteúdo que funcionam sem câmera</h2>

                        <h3 className="text-xl font-semibold text-slate-800 mt-8 mb-3">1. Vídeos com imagens e texto (o que mais vira Reel)</h3>
                        <p className="text-slate-600 leading-relaxed">
                            O formato mais eficiente atualmente no Instagram é o Reel com transições de fotos e texto em cima. Você usa fotos de banco de imagem do destino, coloca uma legenda impactante e música. Isso gera alcance altíssimo — e você não aparece em momento algum.
                        </p>

                        <h3 className="text-xl font-semibold text-slate-800 mt-8 mb-3">2. Carrosséis educativos</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Carrosséis são o tipo de post com maior taxa de salvamento no Instagram — e salvamentos são o melhor sinal de que o conteúdo tem valor. Um carrossel do tipo "7 coisas que você precisa saber antes de viajar para Maldivas" funciona muito bem e pode ser feito inteiramente com texto e imagens estáticas.
                        </p>

                        <BlogCTA type="main" className="my-10" />

                        <h3 className="text-xl font-semibold text-slate-800 mt-8 mb-3">3. Reels com vídeos de estoque</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Existem milhares de vídeos gratuitos de destinos turísticos em plataformas como Pexels e Pixabay. Você pega um vídeo de Santorini, por exemplo, adiciona texto com "Pacote Grécia saindo de R$X por pessoa, 7 noites", coloca uma música popular e publica como Reel. Simples assim.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">O método dos 3 passos para criar conteúdo rápido</h2>

                        <div className="space-y-6">
                            <div className="flex gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <span className="text-2xl font-black text-blue-600 flex-shrink-0">1</span>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-1">Escolha o tema do post</h4>
                                    <p className="text-slate-600 text-sm">Use a lista de 30 ideias do nosso artigo anterior. Ou simplesmente pense: "o que meu cliente pergunta mais?" Isso vira post.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                                <span className="text-2xl font-black text-purple-600 flex-shrink-0">2</span>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-1">Pegue um template pronto</h4>
                                    <p className="text-slate-600 text-sm">Use um vídeo pronto do Canva Viagem ou um template no Canva gratuito. Edite apenas: nome do destino, preço e o logo da sua agência.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <span className="text-2xl font-black text-blue-600 flex-shrink-0">3</span>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-1">Escreva a legenda e publique</h4>
                                    <p className="text-slate-600 text-sm">A legenda não precisa ser longa. 3-5 linhas com a informação principal + um CTA claro: "Quer saber mais? Me chama no WhatsApp!"</p>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Quanto tempo leva no dia a dia?</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Usando templates prontos, cada post demora entre 5 e 15 minutos para estar pronto. Postar 4 vezes por semana = 1 hora dedicada ao Instagram por semana.
                        </p>

                        <BlogCTA type="sale" className="my-16 shadow-purple-200" />
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

export default BlogPost2;
