import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";

const BlogPost28 = () => {
    const handleShare = () => {
        if (navigator.share) { navigator.share({ title: "Como Criar uma Identidade Visual para Agência de Viagem do Zero", url: window.location.href }); }
        else { navigator.clipboard.writeText(window.location.href); }
    };

    return (
        <>
            <Helmet>
                <title>Como Criar uma Identidade Visual para Agência de Viagem do Zero | Canva Viagem</title>
                <meta name="description" content="Aprenda a criar uma identidade visual profissional para sua agência de viagem do zero. Cores, fontes, logo e estratégia de marca para se destacar no Instagram." />
                <meta name="keywords" content="identidade visual agência de viagem, criar logo agência de viagem, marca agência de turismo, branding agência de viagem, visual agência de viagem instagram" />
                <link rel="canonical" href="https://canvaviagem.com/blog/identidade-visual-agencia-de-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="Identidade Visual para Agência de Viagem: Como Criar do Zero" />
                <meta property="og:description" content="Guia completo de branding e identidade visual para agências de viagem que precisam se destacar no Instagram." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1558655146-364adaf1fcc9?q=80&w=800&auto=format&fit=crop" />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "Como Criar uma Identidade Visual para Agência de Viagem do Zero",
                    "author": { "@type": "Organization", "name": "Canva Viagem" },
                    "publisher": { "@type": "Organization", "name": "Canva Viagem", "logo": { "@type": "ImageObject", "url": "https://canvaviagem.com/favicon.png" } },
                    "datePublished": "2026-04-02", "dateModified": "2026-04-02",
                    "url": "https://canvaviagem.com/blog/identidade-visual-agencia-de-viagem",
                    "image": "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?q=80&w=800&auto=format&fit=crop"
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
                        <span className="text-slate-600">Identidade Visual Agência de Viagem</span>
                    </nav>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full mb-6">Branding · Design</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-slate-900">
                        Identidade Visual para Agência de Viagem:
                        <span className="text-primary"> Como Criar do Zero Sem Ser Designer</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14} className="text-primary" /><span className="font-medium">02 de abril de 2026</span></div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full"><Clock size={14} className="text-primary" /><span className="font-medium">10 minutos de leitura</span></div>
                        <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1558655146-364adaf1fcc9?q=80&w=1200&auto=format&fit=crop" alt="Identidade visual para agência de viagem" className="w-full h-auto" />
                        </div>

                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            O Instagram é visual. E a primeira impressão que um potencial cliente tem da sua agência é julgada em menos de 3 segundos. <strong className="text-slate-900">Perfis com identidade visual consistente e profissional convertem até 3x mais</strong> do que perfis visualmente desorganizados — mesmo com conteúdo de qualidade similar.
                        </p>

                        <BlogCTA type="awareness" className="my-10" />

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-6">🎨 Os 5 Pilares da Identidade Visual</h2>

                        {[
                            { num: "01", title: "Paleta de Cores (2 a 4 cores)", desc: "Escolha cores que transmitam a emoção do seu nicho. Azul turquesa e areia: praias. Verde e terra: ecoturismo. Dourado e escuro: luxo e premium. Azul escuro e branco: clássico e confiável." },
                            { num: "02", title: "Tipografia (1 fonte principal + 1 complementar)", desc: "A fonte diz muito sobre sua personalidade. Serif (como Playfair): clássico, premium. Sans-serif (como Inter, Poppins): moderno, clean, jovem. Script: criativo, artesanal. Use máximo 2 fontes." },
                            { num: "03", title: "Logo (símbolo + nome da agência)", desc: "Pode ser texto estilizado ou ícone + texto. No Canva, use o criador de logo. A logo precisa funcionar em fundo claro E escuro. Simples é sempre melhor — logos complexos ficam ruins pequenos." },
                            { num: "04", title: "Tom de Voz e Persona Visual", desc: "Decida: seu perfil é mais formal ou descontraído? Mais inspiracional ou informativo? Consistência no tom via legenda + visual é o que cria reconhecimento de marca." },
                            { num: "05", title: "Templates Padronizados", desc: "Crie (ou adote) templates padronizados para posts de feed, stories e destaques. Quando alguém vê seu post no feed sem ver seu nome, deve reconhecer que é você. Isso é identidade visual funcionando." },
                        ].map((item) => (
                            <div key={item.num} className="flex gap-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <span className="text-3xl font-black text-slate-100 flex-shrink-0">{item.num}</span>
                                <div>
                                    <h3 className="font-black text-slate-900 text-base mb-2">{item.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-4">🔍 As Paletas de Cor Mais Eficazes para Turismo</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { style: "Praia & Tropical", colors: ["#0077B6", "#00B4D8", "#F4A261", "#FEFAE0"], names: ["Azul mar", "Aqua", "Areia quente", "Branco areia"] },
                                { style: "Luxo & Premium", colors: ["#0A0A0A", "#1A1A2E", "#C9A84C", "#F5F5F5"], names: ["Preto", "Azul marinho", "Dourado", "Branco"] },
                                { style: "Aventura & Natureza", colors: ["#2D6A4F", "#40916C", "#95D5B2", "#F4F3EE"], names: ["Verde escuro", "Verde", "Menta", "Creme"] },
                                { style: "Moderno & Clean", colors: ["#7B2FBE", "#9D4EDD", "#E0AAFF", "#F8F9FA"], names: ["Roxo", "Violeta", "Lavanda", "Cinza claro"] },
                            ].map((palette, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                    <p className="font-black text-slate-900 text-sm mb-3">{palette.style}</p>
                                    <div className="flex gap-2">
                                        {palette.colors.map((color, j) => (
                                            <div key={j} className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 rounded-xl border border-gray-100 shadow-sm" style={{ backgroundColor: color }} />
                                                <span className="text-[10px] text-slate-400">{palette.names[j]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-4">
                            <p className="font-black text-blue-900 mb-2">💡 O Atalho Profissional</p>
                            <p className="text-blue-700 text-sm leading-relaxed">Em vez de criar tudo do zero e gastar semanas testando combinações, use uma biblioteca de templates já padronizados para o nicho de turismo. Você adapta a paleta de cor para a sua identidade e mantém toda a estrutura profissional pronta.</p>
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

export default BlogPost28;
