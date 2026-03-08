import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import SeoMetadata from "@/components/SeoMetadata";

const blogPosts = [
    {
        title: "Marketing Digital para Agência de Viagem: O Guia Completo 2026",
        excerpt: "Descubra as estratégias que realmente funcionam para vender pacotes turísticos no novo cenário digital.",
        date: "07 Mar 2026",
        author: "Lucas Rocha",
        readTime: "8 min",
        image: "/blog/marketing-digital-2026.png",
        slug: "marketing-digital-para-agencia-de-viagem",
        category: "Marketing"
    },
    {
        title: "Como Criar Conteúdo para Agência de Viagem Sem Gravar Vídeo",
        excerpt: "Aprenda a manter um perfil profissional e atraente no Instagram sem precisar aparecer ou editar vídeos complexos.",
        date: "05 Mar 2026",
        author: "Lucas Rocha",
        readTime: "5 min",
        image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
        slug: "como-criar-conteudo-agencia-de-viagem-sem-gravar-video",
        category: "Conteúdo"
    },
    {
        title: "O Que Postar no Instagram da Sua Agência de Viagem",
        excerpt: "Um guia prático com ideias de posts que geram desejo de viagem e convertem seguidores em clientes.",
        date: "01 Mar 2026",
        author: "Lucas Rocha",
        readTime: "6 min",
        image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop",
        slug: "o-que-postar-no-instagram-agencia-de-viagem",
        category: "Instagram"
    },
    {
        title: "7 Destinos Nacionais para Vender Muito em 2026",
        excerpt: "Uma análise detalhada dos destinos tendência no Brasil que sua agência precisa oferecer agora.",
        date: "08 Mar 2026",
        author: "Lucas Rocha",
        readTime: "10 min",
        image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800&auto=format&fit=crop",
        slug: "destinos-nacionais-tendencia-2026",
        category: "Destinos"
    },
    {
        title: "Como Converter Seguidores em Clientes no WhatsApp",
        excerpt: "O script exato que as agências de sucesso usam para fechar vendas pelo aplicativo de mensagens.",
        date: "09 Mar 2026",
        author: "Lucas Rocha",
        readTime: "7 min",
        image: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=800&auto=format&fit=crop",
        slug: "converter-seguidores-whatsapp",
        category: "Vendas"
    },
    {
        title: "Como Fechar Vendas de Grupos e Faturar 5x Mais",
        excerpt: "Vender para grupos é o caminho mais curto para escalar o faturamento da sua agência.",
        date: "10 Mar 2026",
        author: "Lucas Rocha",
        readTime: "10 min",
        image: "https://images.unsplash.com/photo-1539635278303-d4002c07dee3?q=80&w=800&auto=format&fit=crop",
        slug: "fechar-vendas-grupos-viagem",
        category: "Estratégia"
    },
    {
        title: "Guia de Tráfego Pago para Agentes de Viagem (Meta Ads 2026)",
        excerpt: "Saiba como investir em anúncios no Instagram para atrair leads qualificados gastando pouco.",
        date: "11 Mar 2026",
        author: "Lucas Rocha",
        readTime: "12 min",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
        slug: "trafego-pago-agentes-viagem",
        category: "Anúncios"
    },
    {
        title: "O Poder do Nicho: Por que Agências Especialistas Ganham Mais",
        excerpt: "Descubra por que focar em um nicho específico pode transformar sua agência em uma referência.",
        date: "12 Mar 2026",
        author: "Lucas Rocha",
        readTime: "9 min",
        image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop",
        slug: "poder-nicho-turismo",
        category: "Nicho"
    },
    {
        title: "Como usar o ChatGPT para Criar Roteiros Irresistíveis em Minutos",
        excerpt: "Aprenda prompts exatos para usar a IA na criação de roteiros que encantam seus clientes.",
        date: "13 Mar 2026",
        author: "Lucas Rocha",
        readTime: "7 min",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
        slug: "chatgpt-roteiros-viagem",
        category: "IA"
    },
    {
        title: "Atendimento que Fideliza: O Segredo do Pós-Venda no Turismo",
        excerpt: "Aprenda como encantar seus clientes depois que a viagem termina e transformar viajantes em fãs.",
        date: "14 Mar 2026",
        author: "Lucas Rocha",
        readTime: "8 min",
        image: "https://images.unsplash.com/photo-1556740734-7f9a2b7a0f42?q=80&w=800&auto=format&fit=crop",
        slug: "pos-venda-fidelizacao-turismo",
        category: "Fidelização"
    }
];

const Blog = () => {
    return (
        <div className="min-h-screen bg-background">
            <SeoMetadata
                title="Blog Canva Viagem | Dicas de Marketing para Agentes de Viagem"
                description="Aprenda a escalar sua agência de viagem com as melhores dicas de marketing digital, conteúdo para Instagram e vendas."
            />
            <Header />

            <main className="container mx-auto px-4 py-12 md:py-24">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Blog Canva Viagem
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Estratégias validadas para transformar sua agência em uma máquina de vendas.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                            <CardHeader className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                </div>
                                <Link to={`/blog/${post.slug}`}>
                                    <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {post.title}
                                    </CardTitle>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 italic">
                                    "{post.excerpt}"
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                                        <Link to={`/blog/${post.slug}`} className="flex items-center gap-1 text-primary">
                                            Ler mais <ArrowRight className="h-4 w-4" />
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
