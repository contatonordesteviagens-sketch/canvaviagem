import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserInfoCard } from "@/components/UserInfoCard";
import { trackViewContent, trackInitiateCheckout } from "@/lib/meta-pixel";
import { 
  Loader2, Check, Plane, Settings, Video, Image, MessageSquare, 
  Bot, Calendar, Sparkles, RefreshCw, Users, FileText, Shield, Clock, Infinity 
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import garantia7dias from "@/assets/garantia-7-dias.png";

// GIFs e Videos constants
const heroGif = "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm5kcmcybmE2aTFkOTU3ZDNqYmZkbHQ2YjRibjB1NjFtN2RoNWdrMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6osnZ6joYcPfERZsaE/giphy.gif";

const proofGifs = [
  "https://media4.giphy.com/media/tJPdq4gvTvr8CgIyWI/giphy.gif",
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWt3MGhsd3g1MnJtbzlkMDloczlhdTJvNWhubjZ4Z3FtNnJkeDd1aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZQZVm01DFW3qHY0ZKs/giphy.gif",
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3J2anV0aTVkYWowbDl1ZXFtNnB4ZWUwcnVnZTVzOW91ZzNncGNvNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mbylDFYWSU46XeLcsS/giphy.gif",
  "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXQ1dHAxM2JxcWM0N3VqdWhibnBtcDR5eWVmNTZwaGI1NTJjeml3diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VcFJaM72FG76eG75In/giphy.gif",
  "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExa24wbWJoa2swZXVyY3h5eDgxY3FhdWR2cHg5MDhrN3p2ZGExYWtpNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/22QqF0ECtSnOvpiQLZ/giphy.gif",
  "https://media4.giphy.com/media/VVMI7dobalrJhKmQOZ/giphy.gif",
];

const youtubeVideos = [
  { id: "dvInvZZ7fLY", title: "Fernando de Noronha Takes" },
  { id: "vUgCtB-yUPg", title: "Veneza Itália" },
  { id: "KsGg1kWgFjA", title: "Fernando de Noronha" },
  { id: "QcwzHP3Y3Nc", title: "Jalapão" },
];

// Benefícios com destaque
const benefits = [
  { icon: Video, text: "+ 250 Vídeos Prontos", highlight: true },
  { icon: MessageSquare, text: "Suporte WhatsApp", highlight: false },
  { icon: Calendar, text: "Calendário Anual de Posts", highlight: false },
  { icon: FileText, text: "Texto e Legendas", highlight: false },
  { icon: Sparkles, text: "Aula Edição no Canva", highlight: false },
  { icon: Shield, text: "Livres de direitos autorais", highlight: false },
  { icon: Bot, text: "10 Agentes de I.A de Marketing", highlight: true },
  { icon: Image, text: "Bônus: 200 Artes de Viagens", highlight: false },
  { icon: Users, text: "Bônus: 3 Influenciadoras", highlight: false },
  { icon: Infinity, text: "Atualizações e Garantia", highlight: false },
];

// FAQs reduzido focado em objeções
const faqs = [
  {
    question: "Como funciona o acesso?",
    answer: "Após a confirmação do pagamento, você recebe um email com o link de acesso. É instantâneo! Você entra na plataforma e já pode baixar todos os 250+ vídeos."
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim! Não há fidelidade. Você pode cancelar a qualquer momento e continua tendo acesso até o final do período pago."
  },
  {
    question: "Os vídeos têm direitos autorais?",
    answer: "Não! Todos os vídeos são livres de direitos autorais para uso comercial. Você pode usar em seus clientes sem problemas."
  },
  {
    question: "Como funciona o suporte?",
    answer: "Você tem acesso direto ao nosso WhatsApp de suporte. Respondemos em até 24h úteis e ajudamos com qualquer dúvida sobre a plataforma."
  },
  {
    question: "Preciso de conhecimento técnico?",
    answer: "Não! Tudo é simples. Baixe os vídeos, edite no Canva (temos aula ensinando) e poste. Em 2 minutos você tem conteúdo profissional pronto."
  }
];

const Planos = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    user,
    loading: authLoading,
    subscription,
    refreshSubscription,
  } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Track view content
  useEffect(() => {
    trackViewContent('Página de Planos');
  }, []);

  // Handle success/cancel redirects from Stripe
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success === "true") {
      toast.success("Pagamento realizado com sucesso!");
      refreshSubscription();
      navigate("/sucesso");
    } else if (canceled === "true") {
      toast.info("Pagamento cancelado.");
      window.history.replaceState({}, "", "/planos");
    }
  }, [searchParams, refreshSubscription, navigate]);

  const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/cNi28s2PEa2Q6aD9wU8so03";

  const handleCheckout = async () => {
    trackInitiateCheckout(37.90, 'BRL');
    setCheckoutLoading(true);

    if (user) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const { data, error } = await supabase.functions.invoke("create-checkout", {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
          if (!error && data?.url) {
            window.open(data.url, '_blank');
            toast.info("O checkout foi aberto em uma nova aba. Complete o pagamento e volte aqui!");
            setCheckoutLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Checkout error:", error);
      }
    }

    window.open(STRIPE_PAYMENT_LINK, '_blank');
    toast.info("O checkout foi aberto em uma nova aba. Após o pagamento, verifique seu email!");
    setCheckoutLoading(false);
  };

  const handleRefreshSubscription = async () => {
    setRefreshLoading(true);
    try {
      await refreshSubscription();
      toast.success("Status da assinatura atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Você precisa estar logado.");
        navigate("/auth");
        return;
      }
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (error) {
        console.error("Portal error:", error);
        toast.error("Erro ao acessar portal. Tente novamente.");
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setPortalLoading(false);
    }
  };

  if (authLoading || subscription.loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  // If user has active subscription, show different view
  if (subscription.subscribed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-4xl">
          <UserInfoCard />
          
          <div className="text-center mb-8 md:mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Assinante Ativo
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Você está a bordo! ✈️</h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Aproveite todos os recursos do Canva Viagens
            </p>
          </div>

          <Card className="border-primary border-2 mb-8">
            <CardHeader className="text-center p-4 md:p-6">
              <div className="h-16 w-16 md:h-20 md:w-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Plane className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <CardTitle className="text-xl md:text-2xl">Assinatura Mensal</CardTitle>
              <p className="text-sm md:text-base text-muted-foreground">Plano ativo: Decolando ✈️</p>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
              <div className="p-3 md:p-4 bg-primary/10 rounded-lg text-center">
                <p className="font-semibold text-primary flex items-center justify-center gap-2 text-sm md:text-base">
                  <Check className="h-4 w-4 md:h-5 md:w-5" />
                  Acesso completo liberado
                </p>
                {subscription.subscriptionEnd && (
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Próxima renovação: {new Date(subscription.subscriptionEnd).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/")} className="w-full" size="lg">
                  <Plane className="mr-2 h-4 w-4" />
                  Acessar Plataforma
                </Button>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={handleManageSubscription} disabled={portalLoading} className="flex-1">
                    {portalLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <Settings className="mr-2 h-4 w-4" />
                        Gerenciar Assinatura
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" onClick={handleRefreshSubscription} disabled={refreshLoading} className="flex-1">
                    {refreshLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar Status
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-5xl">
        {user && <UserInfoCard />}

        {/* HERO SECTION - Badge de Urgência Animado */}
        <section className="text-center mb-12 md:mb-20">
          <Badge className="mb-6 px-6 py-2 bg-gradient-to-r from-primary to-accent text-white animate-pulse border-0">
            <Sparkles className="h-4 w-4 mr-2" />
            OFERTA EXCLUSIVA - Apenas R$37,90/mês
          </Badge>
          
          {/* Headline com Gradiente */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              VENDA + VIAGENS
            </span>
            <br />
            <span className="text-foreground">O ANO INTEIRO!</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Tenha acesso a <span className="text-primary font-bold">250 vídeos de viagens</span>
            <br />e poste em <span className="text-accent font-bold">2 minutos</span>.
          </p>
          
          {/* GIF Hero */}
          <img 
            src={heroGif} 
            alt="Vídeos de viagens profissionais" 
            className="mx-auto rounded-2xl shadow-2xl max-w-xs md:max-w-2xl mb-6"
          />
          
          {/* Badges de Prova Social */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <Check className="h-4 w-4 mr-2 text-primary" />
              Menos de R$ 0,50 por vídeo
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <Shield className="h-4 w-4 mr-2 text-accent" />
              Aprovado por +500 Agências
            </Badge>
          </div>
        </section>

        {/* GRID DE GIFS COM HOVER EFFECTS */}
        <section className="mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            SEU PERFIL BONITO E PROFISSIONAL EM 1 DIA!
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {proofGifs.map((gif, index) => (
              <div key={index} className="rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
                <img 
                  src={gif} 
                  alt={`Exemplo de vídeo ${index + 1}`}
                  className="w-full h-48 md:h-64 object-cover"
                />
              </div>
            ))}
          </div>
        </section>

        {/* SEÇÃO "O QUE VOCÊ RECEBE" MELHORADA */}
        <section className="mb-12 md:mb-20">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 md:p-12 rounded-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              O que é o Pack de Vídeos?
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-8">
              Você recebe o link para baixar mais de 250 vídeos de destinos nacionais e internacionais para publicar.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
                    item.highlight 
                      ? 'bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg' 
                      : 'bg-background/50 hover:bg-background/80'
                  }`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${item.highlight ? 'text-white' : 'text-primary'}`} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VÍDEOS YOUTUBE COM OVERLAY */}
        <section className="mb-12 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Veja Exemplos Reais dos Vídeos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {youtubeVideos.map((video) => (
              <div key={video.id} className="bg-black rounded-xl overflow-hidden shadow-xl relative group">
                <iframe
                  className="w-full aspect-[9/16]"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pointer-events-none">
                  <p className="text-white text-sm font-medium">{video.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CARD DE PREÇO APRIMORADO */}
        <section className="mb-12 md:mb-20">
          <Card className="max-w-2xl mx-auto border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8 md:p-12 text-center">
              <p className="text-2xl line-through text-muted-foreground mb-2">de R$ 197,00</p>
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-5xl md:text-6xl font-black text-primary">R$ 37,90</span>
                <span className="text-xl text-muted-foreground ml-2">/mês</span>
              </div>
              
              <Button 
                size="lg" 
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {checkoutLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Quero meu acesso!
                  </>
                )}
              </Button>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="h-4 w-4" /> garantia de 7 dias
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> pagamento seguro
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Cancele quando quiser • Acesso imediato após confirmação
              </p>
            </CardContent>
          </Card>
        </section>

        {/* SEÇÃO DE GARANTIA */}
        <section className="mb-12 md:mb-20">
          <div className="bg-accent/10 border-l-4 border-accent p-6 md:p-8 rounded-xl">
            <div className="flex flex-col items-center text-center">
              <img 
                src={garantia7dias}
                alt="Garantia 7 dias incondicional"
                className="w-20 md:w-28 mb-4"
              />
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Garantia Total de 7 Dias</h3>
              <p className="text-lg text-muted-foreground max-w-xl">
                Em 3 dias seu perfil vai ter o dobro de engajamento ou{' '}
                <span className="font-bold text-accent">devolvo seu dinheiro</span>.
              </p>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF CVC/DECOLAR */}
        <section className="mb-12 md:mb-20 text-center">
          <p className="text-xl md:text-2xl font-semibold">
            Seu perfil vai ficar parecido com o da{' '}
            <span className="text-primary font-bold">CVC</span> e{' '}
            <span className="text-accent font-bold">Decolar</span>, concorda?
          </p>
        </section>

        {/* Alert para usuários logados sem assinatura */}
        {user && (
          <div className="bg-secondary border border-border rounded-lg p-3 md:p-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary/10 rounded-full p-2 shrink-0">
                <Plane className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <p className="text-foreground text-sm md:text-base">
                <strong>Você ainda não possui um plano ativo.</strong> Assine agora para liberar todos os recursos!
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefreshSubscription} disabled={refreshLoading} className="w-full sm:w-auto">
              {refreshLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar status da assinatura
                </>
              )}
            </Button>
          </div>
        )}

        {/* FAQ REDUZIDO - 5 PERGUNTAS ESSENCIAIS */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base md:text-lg">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA FINAL COM PULSE */}
        <section className="mb-12">
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="text-xl px-12 h-16 bg-gradient-to-r from-primary to-accent animate-pulse shadow-2xl hover:shadow-3xl transition-all duration-300"
            >
              {checkoutLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Sparkles className="mr-2 h-6 w-6" />
                  Começar Agora por R$ 37,90/mês
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              ✨ Acesso imediato • 🔒 Pagamento 100% seguro • ✅ Cancele quando quiser
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Planos;
