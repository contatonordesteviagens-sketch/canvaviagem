import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserInfoCard } from "@/components/UserInfoCard";
import { StripeBuyButton } from "@/components/StripeBuyButton";
import { 
  Loader2, 
  Check, 
  Plane, 
  Settings, 
  Video, 
  Image, 
  MessageSquare, 
  Bot, 
  Download, 
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Shield,
  Clock,
  RefreshCw,
  Infinity,
  Users,
  FileText
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Stripe Buy Button credentials
const STRIPE_BUY_BUTTON_ID = "buy_btn_1SnTjELXUoWoiE4TCTbE8tJg";
const STRIPE_PUBLISHABLE_KEY = "pk_live_51QNAV0LXUoWoiE4TypBZJzJZ8Jdg1PYkdqDy0L75uPD00xekOWqibE8Pk5rMhfeFAqNvq6f1o8T7MwE6OI12F8iq00Ps5tNzN3";

const Planos = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, subscription, refreshSubscription, signOut } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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

  // handleSubscribe is no longer needed as we use Stripe Buy Button directly

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
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error("Você precisa estar logado.");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Portal error:', error);
        toast.error("Erro ao acessar portal. Tente novamente.");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setPortalLoading(false);
    }
  };

  const benefits = [
    { icon: Calendar, title: "Calendário Anual de Postagens", description: "Reels, Stories, Feed e Carrosséis prontos" },
    { icon: Download, title: "Downloads Ilimitados", description: "Vídeos prontos nacionais e internacionais" },
    { icon: Image, title: "Templates 100% Editáveis", description: "Edite tudo diretamente no Canva" },
    { icon: Bot, title: "10 Robôs de IA", description: "Crie tudo de marketing e vendas" },
    { icon: Users, title: "3 Influenciadoras de I.A", description: "Eva, Mel e Bia prontas para usar" },
    { icon: Video, title: "Uso LIVRE de Direitos Autorais", description: "Vídeos e imagens em HD" },
    { icon: Sparkles, title: "Atualizações Vitalícias", description: "Acesso permanente a novidades" },
    { icon: FileText, title: "Legendas Prontas", description: "Textos de destinos e roteiros editáveis" },
  ];

  const comparisons = [
    { feature: "Vídeos Reels profissionais", without: false, with: true },
    { feature: "Artes para agência de viagens", without: false, with: true },
    { feature: "Legendas prontas para copiar", without: false, with: true },
    { feature: "Ferramentas de IA integradas", without: false, with: true },
    { feature: "Downloads ilimitados", without: false, with: true },
    { feature: "Atualizações semanais", without: false, with: true },
    { feature: "Suporte prioritário", without: false, with: true },
  ];

  const faqs = [
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
                <Button 
                  onClick={() => navigate("/")}
                  className="w-full"
                  size="lg"
                >
                  <Plane className="mr-2 h-4 w-4" />
                  Acessar Plataforma
                </Button>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="flex-1"
                  >
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
                  <Button 
                    variant="ghost" 
                    onClick={handleRefreshSubscription}
                    disabled={refreshLoading}
                    className="flex-1"
                  >
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
        <UserInfoCard />
        
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            <Clock className="h-3 w-3 mr-1" />
            Oferta por tempo limitado
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Transforme seu Marketing de Viagens
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Acesse centenas de templates profissionais e ferramentas de IA para criar conteúdo incrível para sua agência
          </p>
        </div>

        {/* Alert for non-subscribers */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 md:p-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-2 shrink-0">
              <Plane className="h-4 w-4 md:h-5 md:w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-amber-800 dark:text-amber-200 text-sm md:text-base">
              <strong>Você ainda não possui um plano ativo.</strong> Assine agora para liberar todos os recursos!
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefreshSubscription}
            disabled={refreshLoading}
            className="w-full sm:w-auto"
          >
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

        {/* Main Pricing Card */}
        <Card className="mb-12 overflow-hidden border-2 border-primary/20 shadow-xl">
          <div className="bg-gradient-to-r from-primary to-accent p-6 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Assinatura Mensal</h2>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold">R$ 37,90</span>
              <span className="text-xl opacity-80">/mês</span>
            </div>
          </div>
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Benefits List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">O que você recebe:</h3>
                {(showAllBenefits ? benefits : benefits.slice(0, 4)).map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{benefit.title}</p>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
                {benefits.length > 4 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAllBenefits(!showAllBenefits)}
                    className="w-full mt-2"
                  >
                    {showAllBenefits ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Ver menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Ver todos os benefícios
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* CTA Section */}
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <StripeBuyButton
                    buyButtonId={STRIPE_BUY_BUTTON_ID}
                    publishableKey={STRIPE_PUBLISHABLE_KEY}
                    customerEmail={user?.email}
                  />
                  
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      <span>Pagamento seguro</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Cancele quando quiser</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    ✨ Acesso imediato após confirmação do pagamento
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Compare e Decida</h2>
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-3 text-center font-semibold border-b">
                <div className="p-4">Recurso</div>
                <div className="p-4 bg-muted/50">Sem Plano</div>
                <div className="p-4 bg-primary/10 text-primary">Com Assinatura</div>
              </div>
              {comparisons.map((item, index) => (
                <div key={index} className="grid grid-cols-3 text-center border-b last:border-0">
                  <div className="p-4 text-left text-sm">{item.feature}</div>
                  <div className="p-4 bg-muted/50">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </div>
                  <div className="p-4 bg-primary/5">
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
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

        {/* Final CTA */}
        <Card className="bg-gradient-to-r from-primary to-accent text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Pronto para decolar? ✈️</h2>
            <p className="mb-6 opacity-90">
              Junte-se a centenas de agentes de viagens que já transformaram seu marketing
            </p>
            <div className="bg-white/10 rounded-lg p-4">
              <StripeBuyButton
                buyButtonId={STRIPE_BUY_BUTTON_ID}
                publishableKey={STRIPE_PUBLISHABLE_KEY}
                customerEmail={user?.email}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Planos;
