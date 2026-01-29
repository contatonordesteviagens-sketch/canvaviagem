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
import { Loader2, Check, Plane, Settings, Video, Image, MessageSquare, Bot, Calendar, Sparkles, RefreshCw, Users, FileText } from "lucide-react";
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
  { id: "vUgCtB-yUPg", title: "Veneza Italia" },
  { id: "KsGg1kWgFjA", title: "Fernando de Noronha" },
  { id: "QcwzHP3Y3Nc", title: "Jalapao" },
];

const deliverables = [
  { icon: Video, text: "+ 250 Vídeos Prontos" },
  { icon: MessageSquare, text: "Suporte Whatsapp" },
  { icon: Calendar, text: "Calendário Anual de Posts" },
  { icon: FileText, text: "Texto e Legendas" },
  { icon: Image, text: "Aula Edição no Canva" },
  { icon: Check, text: "Livres de direitos autorais" },
  { icon: Bot, text: "10 Agentes de I.A de Marketing" },
  { icon: Sparkles, text: "Bônus: 200 Artes de Viagens" },
  { icon: Users, text: "Bônus: 3 Influenciadoras" },
  { icon: RefreshCw, text: "Atualizações e Garantia" },
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
    trackInitiateCheckout(9.90, 'BRL');
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

  const faqs = [
    {
      question: "O que é um Canva Viagem?",
      answer: "São conteúdos prontos em vídeos no formato Reels, fotos, artes, feed, carrosseis e agentes de IA que você pode personalizar com as informações da sua Agência adicionando o logotipo ou publicar da forma que está."
    },
    {
      question: "É fácil de utilizar?",
      answer: "Sim! Todos os modelos são editáveis no CANVA PRO e estão prontos para garantir que você aproveite ao máximo e comece a usar hoje mesmo!"
    },
    {
      question: "Preciso de conhecimento em Design?",
      answer: "Não! Todos os Reels estão 100% prontos com vídeos, escrita e transições, caso queira você ainda pode personalizar tudo facilmente com o CANVA PRO."
    },
    {
      question: "E se eu precisar de suporte?",
      answer: "Nossa equipe está disponível para tirar todas as suas dúvidas e garantir que você utilize os Reels da melhor forma possível."
    },
    {
      question: "Como eu vou acessar os Canva Viagem para minha Agência?",
      answer: "Nós vamos te enviar o login de acesso via plataforma no seu email e para que você possa ter acesso aos vídeos, mídias e links de com todos as entregáveis."
    },
    {
      question: "Posso usar com o CANVA GRÁTIS?",
      answer: "Não! Será necessário ter o CANVA PRO para realizar as edições e downloads dos Reels. Isso ocorre pois os vídeos sem direitos autorais possuem licença especial para utilização com o CANVA PRO."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim! Você pode cancelar sua assinatura quando quiser, sem multas ou taxas adicionais. O acesso permanece ativo até o final do período pago."
    },
    {
      question: "Como funciona o pagamento?",
      answer: "O pagamento é mensal e renovado automaticamente. Você pode usar cartão de crédito ou débito via Stripe, a plataforma de pagamentos mais segura do mundo."
    },
    {
      question: "Os templates são realmente editáveis?",
      answer: "Sim! Todos os templates são editáveis diretamente no Canva. Basta clicar, editar o que quiser e baixar pronto para postar."
    },
    {
      question: "Posso usar para minha agência de viagens?",
      answer: "Absolutamente! O Canva Viagens foi criado especialmente para agentes de viagens e profissionais do turismo que querem produzir conteúdo profissional."
    },
    {
      question: "Quanto tempo leva para ter acesso?",
      answer: "O acesso é liberado imediatamente após a confirmação do pagamento. Você já pode começar a usar todos os recursos na hora!"
    },
    {
      question: "Vocês oferecem garantia?",
      answer: "Sim! Se por qualquer motivo você não ficar satisfeito, pode cancelar sua assinatura dentro dos primeiros 7 dias e solicitar reembolso."
    }
  ];

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

        {/* SEÇÃO 1: Hero Principal */}
        <section className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
            <span className="text-primary">VENDA + VIAGENS</span>
            <br />
            O ANO INTEIRO!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            Tenha acesso a 250 vídeos de viagens e poste em 2 minutos.
          </p>
          <img 
            src={heroGif} 
            alt="Vídeos de viagens" 
            className="mx-auto rounded-2xl shadow-lg max-w-xs md:max-w-md"
          />
          <Badge className="mt-4 bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
            Menos de R$ 0,50 centavos por vídeo
          </Badge>
        </section>

        {/* SEÇÃO 2: Prova Social GIFs */}
        <section className="mb-10 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Mais de 500 mídias e Vídeos Aprovados
            <span className="block text-primary">por Agências de Viagens</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {proofGifs.map((gif, index) => (
              <img 
                key={index}
                src={gif} 
                alt={`Exemplo de vídeo ${index + 1}`}
                className="w-full rounded-xl shadow-md aspect-[9/16] object-cover"
              />
            ))}
          </div>
        </section>

        {/* SEÇÃO 3: Perfil Profissional */}
        <section className="text-center mb-10 md:mb-16 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-6 md:p-10">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">
            SEU PERFIL BONITO
          </h2>
          <h3 className="text-xl md:text-3xl font-bold text-primary mb-6">
            E PROFISSIONAL EM 1 DIA!
          </h3>
          <img 
            src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmo1NGh5cGxiZG1vdHl3bmZxNTBxd2h0aDBsbXkxa2xhNWk4bmE4aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MpVJ9IjphA5p6sO8Zr/giphy.gif"
            alt="Perfil profissional"
            className="mx-auto rounded-xl shadow-lg max-w-[200px] md:max-w-[280px]"
          />
        </section>

        {/* SEÇÃO 4: O que é o Pack + Lista de Entregáveis */}
        <section className="mb-10 md:mb-16">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl">
                O que é o Pack de Vídeos?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground text-lg mb-8">
                Você recebe o link para baixar mais de 250 vídeos de destinos nacionais 
                e internacionais para publicar.
              </p>
              
              <h3 className="text-xl font-semibold text-center mb-6">O que você vai receber:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deliverables.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SEÇÃO 5: Preço com Garantia */}
        <section className="mb-10 md:mb-16 text-center">
          <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 text-white">
            <p className="text-lg opacity-80 line-through mb-2">de R$ 197</p>
            <p className="text-xl mb-2">por apenas</p>
            <div className="flex items-baseline justify-center mb-4">
              <span className="text-3xl font-bold">R$</span>
              <span className="text-7xl md:text-8xl font-extrabold mx-1">9</span>
              <span className="text-3xl font-bold">,90</span>
              <span className="text-xl opacity-80 ml-2">/mês</span>
            </div>
            
            <img 
              src={garantia7dias}
              alt="Garantia 7 dias incondicional"
              className="mx-auto w-24 md:w-32 mb-4"
            />
            
            <div className="flex items-center justify-center gap-4 text-sm opacity-80 mb-6">
              <span>garantia de 7 dias</span>
              <span>|</span>
              <span>pagamento seguro</span>
            </div>
            
            <Button 
              size="lg" 
              onClick={handleCheckout} 
              disabled={checkoutLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white pulse px-8 py-6 text-xl"
            >
              {checkoutLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "Quero meu acesso!"
              )}
            </Button>
          </div>
        </section>

        {/* SEÇÃO 6: Vídeos YouTube */}
        <section className="mb-10 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Veja exemplos de vídeos inclusos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {youtubeVideos.map((video) => (
              <div key={video.id} className="aspect-[9/16] rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </section>

        {/* Alert para usuários logados sem assinatura */}
        {user && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 md:p-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-2 shrink-0">
                <Plane className="h-4 w-4 md:h-5 md:w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-amber-800 dark:text-amber-200 text-sm md:text-base">
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

        {/* SEÇÃO 7: FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* SEÇÃO 8: CTA Final */}
        <Card className="bg-gradient-to-r from-primary to-accent text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Acesse hoje com 82% de DESCONTO</h2>
            <p className="mb-6 opacity-90">
              Isso aqui não é gatilho mental, essa oferta de lançamento do plano premium + atualização vitalícia pode mudar a qualquer momento.
              Clica aqui e aproveita 👇
            </p>
            <Button 
              size="lg" 
              onClick={handleCheckout} 
              disabled={checkoutLoading} 
              className="bg-orange-500 hover:bg-orange-600 text-white pulse flex flex-col items-center h-auto py-3 px-12"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-xs opacity-60 font-light mt-1">Abrindo...</span>
                </>
              ) : (
                <>
                  <span className="text-xl font-semibold">Quero meu acesso!</span>
                  <span className="opacity-60 font-light mt-0.5 text-sm">Canva Viagem Premium por R$ 9,90</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Planos;
