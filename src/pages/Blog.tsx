import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import SeoMetadata from "@/components/SeoMetadata";

const blogPosts = [
    // ─── Posts originais ──────────────────────────────────────────────────────────
    {
        title: "Marketing Digital para Agência de Viagem: O Guia Completo 2026",
        excerpt: "Descubra as estratégias que realmente funcionam para vender pacotes turísticos no novo cenário digital.",
        date: "07 Mar 2026", author: "Lucas Rocha", readTime: "8 min",
        image: "/artes/marketing_digital_agencia_art_premium_1772960978935.png",
        slug: "marketing-digital-para-agencia-de-viagem", category: "Marketing"
    },
    {
        title: "Como Criar Conteúdo para Agência de Viagem Sem Gravar Vídeo",
        excerpt: "Aprenda a manter um perfil profissional e atraente no Instagram sem precisar aparecer ou editar vídeos complexos.",
        date: "05 Mar 2026", author: "Lucas Rocha", readTime: "5 min",
        image: "/artes/woman_travel_agent_laptop_cafe_realistic_1772961080945.png",
        slug: "como-criar-conteudo-agencia-de-viagem-sem-gravar-video", category: "Conteúdo"
    },
    {
        title: "O Que Postar no Instagram da Sua Agência de Viagem",
        excerpt: "Um guia prático com ideias de posts que geram desejo de viagem e convertem seguidores em clientes.",
        date: "01 Mar 2026", author: "Lucas Rocha", readTime: "6 min",
        image: "/artes/instagram_content_strategy_turismo_premium_1772961022191.png",
        slug: "o-que-postar-no-instagram-agencia-de-viagem", category: "Instagram"
    },
    {
        title: "7 Destinos Nacionais para Vender Muito em 2026",
        excerpt: "Uma análise detalhada dos destinos tendência no Brasil que sua agência precisa oferecer agora.",
        date: "08 Mar 2026", author: "Lucas Rocha", readTime: "10 min",
        image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800&auto=format&fit=crop",
        slug: "destinos-nacionais-tendencia-2026", category: "Destinos"
    },
    {
        title: "Como Converter Seguidores em Clientes no WhatsApp",
        excerpt: "O script exato que as agências de sucesso usam para fechar vendas pelo aplicativo de mensagens.",
        date: "09 Mar 2026", author: "Lucas Rocha", readTime: "7 min",
        image: "/artes/hands_holding_phone_whatsapp_business_realistic_1772961106417.png",
        slug: "converter-seguidores-whatsapp", category: "Vendas"
    },
    {
        title: "Como Fechar Vendas de Grupos e Faturar 5x Mais",
        excerpt: "Vender para grupos é o caminho mais curto para escalar o faturamento da sua agência.",
        date: "10 Mar 2026", author: "Lucas Rocha", readTime: "10 min",
        image: "https://images.unsplash.com/photo-1539635278303-d4002c07dee3?q=80&w=800&auto=format&fit=crop",
        slug: "fechar-vendas-grupos-viagem", category: "Estratégia"
    },
    {
        title: "Guia de Tráfego Pago para Agentes de Viagem (Meta Ads 2026)",
        excerpt: "Saiba como investir em anúncios no Instagram para atrair leads qualificados gastando pouco.",
        date: "11 Mar 2026", author: "Lucas Rocha", readTime: "12 min",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
        slug: "trafego-pago-agentes-viagem", category: "Anúncios"
    },
    {
        title: "O Poder do Nicho: Por que Agências Especialistas Ganham Mais",
        excerpt: "Descubra por que focar em um nicho específico pode transformar sua agência em uma referência.",
        date: "12 Mar 2026", author: "Lucas Rocha", readTime: "9 min",
        image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop",
        slug: "poder-nicho-turismo", category: "Nicho"
    },
    {
        title: "Como usar o ChatGPT para Criar Roteiros Irresistíveis em Minutos",
        excerpt: "Aprenda prompts exatos para usar a IA na criação de roteiros que encantam seus clientes.",
        date: "13 Mar 2026", author: "Lucas Rocha", readTime: "7 min",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
        slug: "chatgpt-roteiros-viagem", category: "IA"
    },
    {
        title: "Atendimento que Fideliza: O Segredo do Pós-Venda no Turismo",
        excerpt: "Aprenda como encantar seus clientes depois que a viagem termina e transformar viajantes em fãs.",
        date: "14 Mar 2026", author: "Lucas Rocha", readTime: "8 min",
        image: "https://images.unsplash.com/photo-1556740734-7f9a2b7a0f42?q=80&w=800&auto=format&fit=crop",
        slug: "pos-venda-fidelizacao-turismo", category: "Fidelização"
    },
    // ─── 20 Novos Posts SEO ───────────────────────────────────────────────────────
    {
        title: "Como Ganhar Dinheiro Extra com Viagens em 2026",
        excerpt: "Descubra como brasileiros comuns estão faturando de R$2.000 a R$15.000 por mês como agentes autônomos.",
        date: "15 Mar 2026", author: "Lucas Rocha", readTime: "10 min",
        image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=800&auto=format&fit=crop",
        slug: "como-ganhar-dinheiro-extra-com-viagens", category: "Renda Extra"
    },
    {
        title: "Como se Tornar Agente de Viagens sem Experiência em 2026",
        excerpt: "O guia completo para quem quer começar do zero no turismo — sem faculdade, sem escritório, sem estoque.",
        date: "16 Mar 2026", author: "Lucas Rocha", readTime: "11 min",
        image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800&auto=format&fit=crop",
        slug: "como-se-tornar-agente-de-viagens", category: "Carreira"
    },
    {
        title: "Quanto Ganha um Agente de Viagens no Brasil em 2026?",
        excerpt: "Números reais de quanto agentes autônomos faturam mensalmente — do iniciante ao profissional consolidado.",
        date: "17 Mar 2026", author: "Lucas Rocha", readTime: "9 min",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop",
        slug: "quanto-ganha-agente-de-viagens", category: "Carreira"
    },
    {
        title: "Instagram para Agente de Viagens: O Guia Definitivo 2026",
        excerpt: "Como construir um perfil que atrai seguidores qualificados e converte clientes diariamente.",
        date: "18 Mar 2026", author: "Lucas Rocha", readTime: "13 min",
        image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=800&auto=format&fit=crop",
        slug: "instagram-para-agente-de-viagens", category: "Instagram"
    },
    {
        title: "Os 5 Destinos Internacionais que Mais Vendem para Agentes Brasileiros",
        excerpt: "Quais destinos geram mais comissão e mais demanda dos clientes? Análise completa com dados de 2026.",
        date: "19 Mar 2026", author: "Lucas Rocha", readTime: "10 min",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop",
        slug: "destinos-internacionais-mais-vendem-agentes", category: "Destinos"
    },
    {
        title: "Script de Vendas pelo WhatsApp para Agentes de Viagem",
        excerpt: "10 scripts prontos para atender, cotar e fechar pacotes pelo WhatsApp. Copie, adapte e use hoje.",
        date: "20 Mar 2026", author: "Lucas Rocha", readTime: "12 min",
        image: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=800&auto=format&fit=crop",
        slug: "script-vendas-whatsapp-agente-viagens", category: "Vendas"
    },
    {
        title: "Canva para Agência de Viagem: Artes Profissionais sem Ser Designer",
        excerpt: "Como usar o Canva para criar posts profissionais para sua agência sem nenhum conhecimento de design.",
        date: "21 Mar 2026", author: "Lucas Rocha", readTime: "11 min",
        image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=800&auto=format&fit=crop",
        slug: "canva-para-agencia-de-viagem", category: "Design"
    },
    {
        title: "Lua de Mel: Como Vender Pacotes Premium e Ganhar Comissões Altas",
        excerpt: "O nicho de lua de mel é um dos mais lucrativos do turismo. Aprenda a vender e criar conteúdo para esse público.",
        date: "22 Mar 2026", author: "Lucas Rocha", readTime: "10 min",
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop",
        slug: "vender-pacotes-lua-de-mel-agente-viagem", category: "Lua de Mel"
    },
    {
        title: "Os 6 Melhores Destinos Nacionais para Família em 2026",
        excerpt: "Guia completo com os melhores destinos no Brasil para viajar em família, com dicas de época e perfil.",
        date: "23 Mar 2026", author: "Lucas Rocha", readTime: "9 min",
        image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800&auto=format&fit=crop",
        slug: "melhores-destinos-nacionais-familia-2026", category: "Família"
    },
    {
        title: "Trabalhar de Casa com Turismo: Realidade ou Ilusão em 2026?",
        excerpt: "Como agentes autônomos estão faturando de casa com turismo, só com celular, WhatsApp e Instagram.",
        date: "24 Mar 2026", author: "Lucas Rocha", readTime: "9 min",
        image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
        slug: "trabalhar-de-casa-com-turismo", category: "Home Office"
    },
    {
        title: "Como Montar um Calendário de Conteúdo para Agência de Viagem",
        excerpt: "Planejamento completo de conteúdo mensal e semanal para agentes que querem postar com estratégia.",
        date: "25 Mar 2026", author: "Lucas Rocha", readTime: "11 min",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop",
        slug: "calendario-conteudo-agencia-de-viagem", category: "Planejamento"
    },
    {
        title: "IA para Agentes de Viagem: 7 Ferramentas que Mudam o Jogo em 2026",
        excerpt: "As 7 ferramentas de inteligência artificial que economizam horas por semana e multiplicam a produtividade.",
        date: "26 Mar 2026", author: "Lucas Rocha", readTime: "12 min",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
        slug: "ia-para-agentes-de-viagem", category: "IA"
    },
    {
        title: "Como Criar um Grupo de Viagem Lucrativo pelo WhatsApp",
        excerpt: "Os 5 modelos de grupos de viagem mais lucrativos e como usar o WhatsApp para montar excursões que vendem.",
        date: "27 Mar 2026", author: "Lucas Rocha", readTime: "11 min",
        image: "https://images.unsplash.com/photo-1539635278303-d4002c07dee3?q=80&w=800&auto=format&fit=crop",
        slug: "criar-grupo-viagem-lucrativo-whatsapp", category: "Grupos"
    },
    {
        title: "Reels para Agência de Viagem: Como Criar Vídeos que Viralizam",
        excerpt: "5 hooks testados que param o scroll, a estrutura ideal de Reels e como atrair clientes com vídeos de 30 segundos.",
        date: "28 Mar 2026", author: "Lucas Rocha", readTime: "10 min",
        image: "https://images.unsplash.com/photo-1536240478700-b869ad10a2ab?q=80&w=800&auto=format&fit=crop",
        slug: "reels-agencia-de-viagem", category: "Reels"
    },
    {
        title: "Seguro Viagem: Tudo que um Agente Precisa Saber para Vender e Orientar",
        excerpt: "Guia completo de seguro viagem para agentes. Como indicar, quais coberturas importam e como ganhar comissão.",
        date: "29 Mar 2026", author: "Lucas Rocha", readTime: "10 min",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop",
        slug: "seguro-viagem-guia-agente-turismo", category: "Seguro"
    },
    {
        title: "Roteiro de Europa para Brasileiros: Planejamento Completo 2026",
        excerpt: "Guia completo com roteiro, visto Schengen, melhor época e conselhos para organizar a viagem dos sonhos.",
        date: "30 Mar 2026", author: "Lucas Rocha", readTime: "13 min",
        image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop",
        slug: "roteiro-europa-brasileiros-2026", category: "Europa"
    },
    {
        title: "Cruzeiros para Brasileiros: Vale a Pena? Guia Completo 2026",
        excerpt: "Tudo sobre cruzeiros: itinerários, companhias, quando vale a pena e comissões para agentes por venda.",
        date: "01 Abr 2026", author: "Lucas Rocha", readTime: "11 min",
        image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=800&auto=format&fit=crop",
        slug: "cruzeiros-para-brasileiros-2026", category: "Cruzeiros"
    },
    {
        title: "Identidade Visual para Agência de Viagem: Como Criar do Zero",
        excerpt: "Os 5 pilares do branding para agências. Cores, fontes, logo e estratégia de marca para se destacar.",
        date: "02 Abr 2026", author: "Lucas Rocha", readTime: "10 min",
        image: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?q=80&w=800&auto=format&fit=crop",
        slug: "identidade-visual-agencia-de-viagem", category: "Branding"
    },
    {
        title: "Como Fidelizar Clientes de Viagem: O Guia Completo de Pós-Venda",
        excerpt: "Estratégias para transformar viajantes em clientes recorrentes que indicam sua agência para todo mundo.",
        date: "03 Abr 2026", author: "Lucas Rocha", readTime: "10 min",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
        slug: "fidelizar-clientes-agencia-de-viagem", category: "Fidelização"
    },
    {
        title: "Primeiro Mês como Agente de Viagem: O Que Esperar (Guia Honesto)",
        excerpt: "Guia honesto sobre o primeiro mês como agente autônomo — resultados reais, erros a evitar e como não desistir.",
        date: "04 Abr 2026", author: "Lucas Rocha", readTime: "12 min",
        image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800&auto=format&fit=crop",
        slug: "primeiro-mes-agente-de-viagem", category: "Iniciante"
    },
];

const Blog = () => {
    return (
        <div className="min-h-screen bg-background">
            <SeoMetadata
                title="Blog Canva Viagem | Estratégias de Marketing para Agentes de Viagem 2026"
                description="Aprenda a escalar sua agência de viagem com as melhores dicas de marketing digital, conteúdo para Instagram, automação de WhatsApp e vendas de pacotes turísticos."
            />
            <Header />

            <main className="container mx-auto px-4 py-12 md:py-20">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Blog Canva Viagem
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Estratégias validadas para transformar sua agência em uma máquina de vendas.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">{blogPosts.length} artigos publicados</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map((post, index) => (
                        <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-muted/50 group">
                            <Link to={`/blog/${post.slug}`}>
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </Link>
                            <CardHeader className="p-5 pb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                </div>
                                <Link to={`/blog/${post.slug}`}>
                                    <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                        {post.title}
                                    </CardTitle>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {post.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {post.readTime}
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild className="p-0 hover:bg-transparent">
                                        <Link to={`/blog/${post.slug}`} className="flex items-center gap-1 text-primary text-xs font-bold">
                                            Ler <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Blog;
