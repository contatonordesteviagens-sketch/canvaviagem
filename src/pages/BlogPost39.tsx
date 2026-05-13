import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, AlertCircle } from "lucide-react";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { motion } from "framer-motion";

const BlogPost39 = () => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "8 Sinais de Alerta: Seu Instagram Está Afastando Seus Clientes de Viagem?",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <Helmet>
                <title>8 Sinais de Alerta no Instagram da Agência de Viagem</title>
                <meta name="description" content="Se você posta e ninguém te chama, algo está errado. Identifique os erros fatais que destroem a conversão do seu perfil de turismo." />
                <meta name="keywords" content="erros instagram agência de viagem, como vender viagens no instagram, marketing digital para turismo 2026, conversão instagram agência" />
                <link rel="canonical" href="https://canvaviagem.com/blog/sinais-alerta-instagram-agencia-viagem" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="8 Sinais de Alerta: Seu Instagram Está Afastando Clientes?" />
                <meta property="og:description" content="Descubra se o seu perfil está cometendo os erros que matam as vendas no turismo." />
                <meta property="og:image" content="https://canvaviagem.com/assets/blog/updated/sinais_alerta_updated.png" />
            </Helmet>

            <div className="min-h-screen bg-gray-50 text-slate-900">
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">Voltar ao site</span>
                        </Link>
                        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">Canva Viagem</Link>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-6 py-12 pb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full mb-6 italic">Webinar 2026 · Diagnóstico de Perfil</span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">8 Sinais de Alerta: Seu Instagram Está <span className="text-red-600">Afastando</span> Seus Clientes?</h1>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /><span className="font-medium">9 de março de 2026</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /><span className="font-medium">7 min de leitura</span></div>
                            <button onClick={handleShare} className="flex items-center gap-1.5 ml-auto text-slate-500 hover:text-primary transition-colors font-medium"><Share2 size={14} /><span>Compartilhar</span></button>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-gray-200">
                            <img
                                src="/assets/blog/updated/sinais_alerta_updated.png"
                                alt="Checklist de erros comuns no perfil de uma agência de viagem"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8 text-slate-700 leading-relaxed">
                            <p className="text-xl font-medium text-slate-800">Você posta com dedicação, escolhe fotos bonitas, mas o direct continua em silêncio. O problema pode não ser o algoritmo, mas sinais silenciosos que você está enviando.</p>

                            <p>No mercado de turismo, o seu Instagram não é apenas uma rede social, é o seu cartão de visitas e sua plataforma de confiança. Vamos analisar os 8 sinais de que o seu perfil precisa de uma intervenção estratégica urgente.</p>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6 text-center italic">O Check-up do Seu Perfil</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
                                {[
                                    { title: "Bio Confusa", desc: "Se o cliente não entende em 3 segundos o que você faz e para quem." },
                                    { title: "Amadorismo Visual", desc: "Artes poluídas ou fontes que dificultam a leitura rápida." },
                                    { title: "Excesso de Preço", desc: "Parecer um catálogo de supermercado em vez de uma curadoria." },
                                    { title: "Link Quebrado", desc: "A forma mais rápida de perder uma venda por pura negligência técnica." },
                                    { title: "Falta de Rosto", desc: "Ninguém gosta de comprar de uma logo fria e impessoal." },
                                    { title: "Destaques Vazios", desc: "Ignorar o lugar onde o cliente tira as dúvidas mais importantes." }
                                ].map((item, index) => (
                                    <div key={index} className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <h4 className="font-black text-red-600 mb-2 flex items-center gap-2 italic"><AlertCircle size={18} /> {item.title}</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">A Solução Não É Postar Mais</h2>
                            <p>Muitas agências acham que a solução é aumentar a frequência. Errado. Se você está enviando os sinais errados, postar mais só vai afastar mais pessoas. O segredo é **limpar** a comunicação e focar no que gera autoridade imediata.</p>

                            <BlogCTA type="consideration" className="my-16" />

                            <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Como Mudar a Rota Hoje</h2>
                            <p>Comece pela sua bio. Ela deve responder: **Qual problema você resolve? Para quem? Por que você?**. Depois, mude o foco dos seus próximos 3 posts para educação e autoridade, não oferta de preço.</p>

                            <div className="bg-slate-900 text-white rounded-3xl p-10 my-12 text-center shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <h3 className="text-2xl md:text-3xl font-black mb-6">Seus Clientes Merecem um Perfil Profissional</h3>
                                <p className="mb-8 text-slate-400 text-lg">Descubra como transformar seu Instagram em um imã de orçamentos qualificados na Aula Secreta.</p>
                                <Link to="/aula-secreta" className="inline-flex items-center gap-2 bg-red-600 text-white font-black px-10 py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg">Diagnosticar Meu Perfil Gratis <ArrowRight size={20} /></Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2026 Canva Viagem. Auditoria estratégica para negócios de turismo.</p>
                </footer>
            </div>
        </>
    );
};

export default BlogPost39;
