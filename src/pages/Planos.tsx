import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import SeoMetadata from "@/components/SeoMetadata";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserInfoCard } from "@/components/UserInfoCard";
import { trackViewContent, trackInitiateCheckout } from "@/lib/meta-pixel";
import { Loader2, Check, Plane, Settings, Video, Image, MessageSquare, Bot, Calendar, Sparkles, RefreshCw, Users, FileText, Shield, Clock, Infinity, GraduationCap, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import garantia7dias from "@/assets/garantia-7-dias.png";

// GIFs e Videos constants
const heroGif = "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm5kcmcybmE2aTFkOTU3ZDNqYmZkbHQ2YjRibjB1NjFtN2RoNWdrMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6osnZ6joYcPfERZsaE/giphy.gif";
const proofGifs = ["https://media4.giphy.com/media/tJPdq4gvTvr8CgIyWI/giphy.gif", "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWt3MGhsd3g1MnJtbzlkMDloczlhdTJvNWhubjZ4Z3FtNnJkeDd1aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZQZVm01DFW3qHY0ZKs/giphy.gif", "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3J2anV0aTVkYWowbDl1ZXFtNnB4ZWUwcnVnZTVzOW91ZzNncGNvNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mbylDFYWSU46XeLcsS/giphy.gif", "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXQ1dHAxM2JxcWM0N3VqdWhibnBtcDR5eWVmNTZwaGI1NTJjeml3diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VcFJaM72FG76eG75In/giphy.gif", "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExa24wbWJoa2swZXVyY3h5eDgxY3FhdWR2cHg5MDhrN3p2ZGExYWtpNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/22QqF0ECtSnOvpiQLZ/giphy.gif", "https://media4.giphy.com/media/VVMI7dobalrJhKmQOZ/giphy.gif"];
const youtubeVideos = [{
  id: "dvInvZZ7fLY",
  title: "Fernando de Noronha Takes"
}, {
  id: "vUgCtB-yUPg",
  title: "Veneza Itália"
}, {
  id: "KsGg1kWgFjA",
  title: "Fernando de Noronha"
}, {
  id: "QcwzHP3Y3Nc",
  title: "Jalapão"
}];

// Checkout links by language
const STRIPE_LINKS = {
  pt: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
  es: "https://buy.stripe.com/bJedRa3TIej6cz15gE8so04"
};
const Planos = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    setLanguage,
    t
  } = useLanguage();

  // Force PT language on this page
  const language = 'pt';
  useEffect(() => {
    document.documentElement.lang = 'pt';
    setLanguage('pt');
  }, [setLanguage]);
  const {
    user,
    loading: authLoading,
    subscription,
    refreshSubscription
  } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Benefits with icons - translated
  const benefits = [{
    icon: Video,
    text: t('plans.benefit.videos'),
    highlight: true
  }, {
    icon: MessageSquare,
    text: t('plans.benefit.whatsapp'),
    highlight: false
  }, {
    icon: Calendar,
    text: t('plans.benefit.calendar'),
    highlight: false
  }, {
    icon: FileText,
    text: t('plans.benefit.captions'),
    highlight: false
  }, {
    icon: Sparkles,
    text: t('plans.benefit.canva'),
    highlight: false
  }, {
    icon: Shield,
    text: t('plans.benefit.copyright'),
    highlight: false
  }, {
    icon: Bot,
    text: t('plans.benefit.ai'),
    highlight: true
  }, {
    icon: Image,
    text: t('plans.benefit.arts'),
    highlight: false
  }, {
    icon: Users,
    text: t('plans.benefit.influencers'),
    highlight: false
  }, {
    icon: Infinity,
    text: t('plans.benefit.updates'),
    highlight: false
  }];

  // FAQs - translated
  const faqs = [{
    question: t('plans.faq.1.question'),
    answer: t('plans.faq.1.answer')
  }, {
    question: t('plans.faq.2.question'),
    answer: t('plans.faq.2.answer')
  }, {
    question: t('plans.faq.3.question'),
    answer: t('plans.faq.3.answer')
  }, {
    question: t('plans.faq.4.question'),
    answer: t('plans.faq.4.answer')
  }, {
    question: t('plans.faq.5.question'),
    answer: t('plans.faq.5.answer')
  }];

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
  const handleCheckout = () => {
    // Track with BRL currency for PT version
    const price = 29.00;
    const currency = 'BRL';
    trackInitiateCheckout(price, currency);

    // Redirect directly to Stripe Payment Link
    window.location.href = STRIPE_LINKS.pt;
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
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Você precisa estar logado.");
        navigate("/auth");
        return;
      }
      const {
        data,
        error
      } = await supabase.functions.invoke("customer-portal", {
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
    return <div className="min-h-screen bg-background">
      <SeoMetadata
        title="Planos e Assinaturas"
        description="Escolha o melhor plano para sua agência de viagens. Acesso ilimitado a templates, vídeos e ferramentas de IA."
        keywords="assinar canva viagem, planos marketing turístico, assinatura agência de viagens"
      />
      <Header />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      <Footer />
    </div>;
  }

  // If user has active subscription, show different view
  if (subscription.subscribed) {
    return <div className="min-h-screen bg-background">
      <SeoMetadata
        title="Minha Assinatura"
        description="Gerencie sua conta e acesse o conteúdo exclusivo para assinantes da Canva Viagem."
      />
      <Header />
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-4xl">
        <UserInfoCard />

        <div className="text-center mb-8 md:mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            {t('plans.subscribedBadge')}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('plans.subscribedTitle')}</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            {t('plans.subscribedSubtitle')}
          </p>
        </div>

        <Card className="border-primary border-2 mb-8">
          <CardHeader className="text-center p-4 md:p-6">
            <div className="h-16 w-16 md:h-20 md:w-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
              <Plane className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            <CardTitle className="text-xl md:text-2xl">{t('plans.subscriptionPlan')}</CardTitle>
            <p className="text-sm md:text-base text-muted-foreground">{t('plans.activePlan')}</p>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
            <div className="p-3 md:p-4 bg-primary/10 rounded-lg text-center">
              <p className="font-semibold text-primary flex items-center justify-center gap-2 text-sm md:text-base">
                <Check className="h-4 w-4 md:h-5 md:w-5" />
                {t('plans.fullAccess')}
              </p>
              {subscription.subscriptionEnd && <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {t('plans.nextRenewal').replace('{date}', new Date(subscription.subscriptionEnd).toLocaleDateString('pt-BR'))}
              </p>}
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate("/")} className="w-full" size="lg">
                <Plane className="mr-2 h-4 w-4" />
                {t('plans.accessPlatform')}
              </Button>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={handleManageSubscription} disabled={portalLoading} className="flex-1">
                  {portalLoading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </> : <>
                    <Settings className="mr-2 h-4 w-4" />
                    {t('plans.manageSubscription')}
                  </>}
                </Button>
                <Button variant="ghost" onClick={handleRefreshSubscription} disabled={refreshLoading} className="flex-1">
                  {refreshLoading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('plans.refreshing')}
                  </> : <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('plans.refreshStatus')}
                  </>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>;
  }
  return <div className="min-h-screen bg-background">
    <SeoMetadata
      title="Planos e Assinaturas"
      description="Escolha o melhor plano para sua agência de viagens. Acesso ilimitado a templates, vídeos e ferramentas de IA."
      keywords="assinar canva viagem, planos marketing turístico, assinatura agência de viagens"
    />
    <Header />
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-5xl">
      {user && <UserInfoCard />}

      {/* HERO SECTION - G4 Professional Style */}
      <section className="relative mb-16 px-4">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/10 via-[#4FC3F7]/10 to-background rounded-3xl -mx-4 -my-8" />

        <div className="relative text-center max-w-4xl mx-auto">
          {/* Golden Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-300 dark:border-amber-700 mb-6 shadow-md">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-bold text-amber-800 dark:text-amber-200 tracking-wide">
              1° PLATAFORMA COMPLETA DE MARKETING PARA VIAGENS
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4">
            <span className="bg-gradient-to-r from-[#FF6B6B] via-[#FF8E53] to-[#4FC3F7] bg-clip-text text-transparent">
              Venda Mais Viagens
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#4FC3F7] to-[#FF6B6B] bg-clip-text text-transparent">
              O Ano Inteiro
            </span>
          </h1>

          {/* Value Prop Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 mb-4">
            <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-base font-semibold text-blue-900 dark:text-blue-100">
              250+ Vídeos Prontos + IA Integrada
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Vídeos, artes, stories, robôs de IA, calendário anual e tudo que você precisa para crescer sua agência
          </p>

          {/* Hero Visual - Placeholder Gradient (replace with generated team image) */}
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/20 to-[#4FC3F7]/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all" />
            <img
              loading="lazy"
              src={heroGif}
              alt="Plataforma CanvaViagem - Vídeos profissionais de viagens"
              className="relative mx-auto rounded-2xl shadow-2xl max-w-sm md:max-w-2xl w-full transform group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <a href="#preco" className="w-full max-w-md">
              <Button
                size="lg"
                className="w-full h-14 md:h-16 px-8 text-lg md:text-xl font-black rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:from-[#FF5252] hover:to-[#FF7F43] text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                ASSINAR AGORA
              </Button>
            </a>
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm md:text-base font-bold text-foreground">
                Acesso imediato • <span className="text-[#FF6B6B]">R$ 29/mês</span>
              </p>
              <p className="text-xs md:text-sm text-green-600 dark:text-green-400 font-semibold">
                ✓ Cancele quando quiser • Garantia de 7 dias
              </p>
            </div>
          </div>

          {/* Trust Indicators - Clean Badges (No User Counts) */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-border">
              <Shield className="h-4 w-4 text-primary" />
              <span>Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-border">
              <Clock className="h-4 w-4 text-primary" />
              <span>Acesso Imediato</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-border">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span>Atualização Semanal</span>
            </div>
          </div>
        </div>
      </section>

      {/* TELA DE DOR - RED FLAG MODERADA */}
      <section className="mb-16 md:mb-24 px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-black mb-4">
            <span className="text-red-600 dark:text-red-500">❌ Você está cansado disso?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A realidade de quem tenta fazer tudo sozinho sem as ferramentas certas...
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 hover:border-red-300 transition-all">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">⏰</div>
              <p className="font-bold mb-2">Horas editando</p>
              <p className="text-sm text-muted-foreground">Perder tardes inteiras no CapCut ou Premiere para fazer 1 vídeo</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 hover:border-red-300 transition-all">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">💸</div>
              <p className="font-bold mb-2">Gastando muito</p>
              <p className="text-sm text-muted-foreground">R$ 500 a R$ 2.000 por mês com equipe ou freelancers</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 hover:border-red-300 transition-all sm:col-span-2 md:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">😰</div>
              <p className="font-bold mb-2">Sem ideias</p>
              <p className="text-sm text-muted-foreground">Ficar olhando pra tela em branco sem saber o que postar hoje</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* APRESENTANDO A SOLUÇÃO - VISUAL */}
      <section className="mb-16 md:mb-24 text-center px-4">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-sm tracking-wide">
          ✨ APRESENTANDO A SOLUÇÃO
        </div>
        <h2 className="text-3xl md:text-5xl font-black mb-6 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          CanvaViagem
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          A primeira plataforma do mundo com 250+ vídeos de destinos prontos e editáveis.
        </p>

        {/* GRID DE GIFS FORMATO REELS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto mb-10">
          {proofGifs.slice(0, 4).map((gif, index) => <div key={index} className="rounded-xl overflow-hidden shadow-lg border-2 border-primary/10">
            <img src={gif} alt={`Exemplo de conteúdo ${index + 1}`} className="w-full aspect-[9/16] object-cover hover:scale-105 transition-transform duration-500" />
          </div>)}
        </div>

        {/* COMO FUNCIONA - 3 PASSOS SIMPLES */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl md:text-2xl font-bold mb-8">Como funciona? (Simples assim)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="relative pl-4 border-l-4 border-primary/30">
              <div className="text-5xl font-black text-primary/20 absolute -top-4 -left-3">1</div>
              <h4 className="text-lg font-bold mb-2">Escolha</h4>
              <p className="text-sm text-muted-foreground">Navegue por 250+ destinos: Disney, Maldivas, Paris, Nordeste...</p>
            </div>
            <div className="relative pl-4 border-l-4 border-primary/30">
              <div className="text-5xl font-black text-primary/20 absolute -top-4 -left-3">2</div>
              <h4 className="text-lg font-bold mb-2">Edite (se quiser)</h4>
              <p className="text-sm text-muted-foreground">Abra no Canva e coloque seu logo e cores em 1 clique.</p>
            </div>
            <div className="relative pl-4 border-l-4 border-primary/30">
              <div className="text-5xl font-black text-primary/20 absolute -top-4 -left-3">3</div>
              <h4 className="text-lg font-bold mb-2">Publique</h4>
              <p className="text-sm text-muted-foreground">Baixe e poste. Pronto! Seu perfil profissional em minutos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL - DEPOIMENTOS ESPECÍFICOS */}
      <section className="mb-16 md:mb-24 px-4 bg-muted/30 py-12 -mx-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Quem usa, recomenda 👇
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Depoimento 1 - REAL (WhatsApp) */}
            <Card className="border-none shadow-md bg-white dark:bg-card relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#25D366]"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-[#25D366] text-white p-1.5 rounded-full">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-sm">Agente de Viagens</span>
                  <span className="text-xs text-muted-foreground ml-auto">Via WhatsApp</span>
                </div>
                <p className="text-base italic text-foreground/80 leading-relaxed">
                  "Parabéns pelo trabalho, ajudou muito aqui. Tava batendo cabeça para criar vídeos dos lugares para postar"
                </p>
                <div className="mt-4 flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                </div>
              </CardContent>
            </Card>

            {/* Depoimento 2 - REAL (Instagram) */}
            <Card className="border-none shadow-md bg-white dark:bg-card relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#833AB4] via-[#FD1D1D] to-[#F77737]"></div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white p-1.5 rounded-full">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-sm">@vleviagens</span>
                  <span className="text-xs text-muted-foreground ml-auto">Via Instagram</span>
                </div>
                <p className="text-base italic text-foreground/80 leading-relaxed">
                  "Eu comprei, estou usando e é maravilhoso o conteúdo 🙏"
                </p>
                <div className="mt-4 flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS GRID - 'USE IA' */}
      <section className="mb-16 md:mb-24 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo incluso na plataforma</h2>
          <p className="text-muted-foreground">Sem pegadinhas. Você tem acesso a tudo.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { icon: Video, title: "250+ Vídeos", desc: "Completos e editáveis" },
            { icon: Bot, title: "Use IA", desc: "Marketing automático" },
            { icon: Calendar, title: "Calendário", desc: "365 dias prontos" },
            { icon: MessageSquare, title: "Legendas", desc: "Copywriting incluso" },
            { icon: Users, title: "Influencers", desc: "Avatares de turismo" },
            { icon: Image, title: "Banco Fotos", desc: "Alta qualidade" },
            { icon: Sparkles, title: "Artes/Stories", desc: "Templates prontos" },
            { icon: RefreshCw, title: "Updates", desc: "Novos toda semana" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm md:text-base mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLUG-AND-PLAY & EXCLUSIVIDADE - Nova Seção */}
      <section className="mb-12 md:mb-20">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 rounded-3xl p-6 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black mb-3 text-green-700 dark:text-green-300">
              ⚡ Pegou, Usou e Postou em 2 Minutos
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Sem design. Sem complicação. Só pegar e usar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Plug and Play */}
            <Card className="border-2 border-green-300 dark:border-green-700 bg-background/80">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <h3 className="text-xl font-bold">100% Plug-and-Play</h3>
                </div>
                <ul className="space-y-3 text-sm md:text-base">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span><strong>Não precisa</strong> saber design</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span><strong>Não precisa</strong> saber marketing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>Tudo <strong>100% pronto</strong> pra postar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span><strong>2 minutos</strong> pra criar e publicar</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Exclusividade */}
            <Card className="border-2 border-purple-300 dark:border-purple-700 bg-background/80">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center text-2xl">
                    ✨
                  </div>
                  <h3 className="text-xl font-bold">Conteúdo Exclusivo</h3>
                </div>
                <ul className="space-y-3 text-sm md:text-base">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>+250 vídeos</strong> únicos e exclusivos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Pode personalizar</strong> tudo que quiser</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Conteúdo novo</strong> toda semana</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Impossível</strong> todo mundo usar o mesmo</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Box */}
          <div className="mt-8 text-center bg-gradient-to-r from-green-500/10 to-purple-500/10 rounded-xl p-6 border-2 border-dashed border-green-300 dark:border-green-700">
            <p className="text-base md:text-lg font-bold text-foreground mb-2">
              🚀 <strong>Plataforma nova = Poucas pessoas usando</strong>
            </p>
            <p className="text-sm md:text-base text-muted-foreground">
              Aproveite agora e seja um dos primeiros a ter acesso ao conteúdo que <strong>ninguém mais tem</strong>
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO "O QUE É CANVA VIAGEM?" */}
      < section className="mb-12 md:mb-20" >
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 md:p-12 rounded-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            O que é o Canva Viagem?
          </h2>
          <p className="text-center text-muted-foreground text-base md:text-lg mb-8 max-w-3xl mx-auto">
            Você recebe acesso à plataforma completa de marketing, que tem tudo o que você precisa pra vender mais viagens, pra você só usar e publicar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
            <div className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all">
              <Video className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm md:text-base">Mais de 250 vídeos prontos</p>
                <p className="text-xs md:text-sm text-muted-foreground">Pega e publica</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all">
              <Calendar className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm md:text-base">Calendário com posts organizados</p>
                <p className="text-xs md:text-sm text-muted-foreground">Anual</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all">
              <FileText className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm md:text-base">Legendas para copiar e colar</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all">
              <Image className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm md:text-base">Artes de conteúdos e promoções</p>
                <p className="text-xs md:text-sm text-muted-foreground">100% editáveis no Canva, livres de direitos autorais</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-gradient-to-r from-primary to-accent text-white shadow-lg">
              <Bot className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm md:text-base">10 agentes de IA de marketing</p>
                <p className="text-xs md:text-sm opacity-90">Para viagens</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-gradient-to-r from-primary to-accent text-white shadow-lg">
              <Users className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm md:text-base">3 influenciadoras de IA</p>
                <p className="text-xs md:text-sm opacity-90">De viagens</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all">
              <RefreshCw className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm md:text-base">Atualizações semanais</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all">
              <MessageSquare className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm md:text-base">Suporte no WhatsApp</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all md:col-span-2">
              <GraduationCap className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm md:text-base">Aula de como usar a ferramenta e postar em 2 minutos</p>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* VÍDEOS YOUTUBE COM OVERLAY - 2 por linha no mobile */}
      < section className="mb-12 md:mb-20" >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Veja Exemplos Reais dos Vídeos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto">
          {youtubeVideos.map(video => <div key={video.id} className="bg-black rounded-xl overflow-hidden shadow-xl relative group">
            <iframe className="w-full aspect-[9/16]" src={`https://www.youtube.com/embed/${video.id}`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 md:p-3 pointer-events-none">
              <p className="text-white text-xs md:text-sm font-medium">{video.title}</p>
            </div>
          </div>)}
        </div>
      </section >

      {/* CARD DE PREÇO - G4 PROFESSIONAL STYLE */}
      < section id="preco" className="mb-16 md:mb-24 scroll-mt-20 px-4" >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-[#FF6B6B] to-[#4FC3F7] bg-clip-text text-transparent">
              Escolha seu Plano
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Tudo que você precisa para vender mais viagens, em um único lugar
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm md:text-base font-bold ${billingCycle === 'monthly' ? 'text-primary' : 'text-muted-foreground'}`}>Mensal</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-14 h-7 bg-muted rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className={`w-5 h-5 bg-primary rounded-full shadow-md transform transition-transform duration-200 ${billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm md:text-base font-bold ${billingCycle === 'annual' ? 'text-primary' : 'text-muted-foreground'}`}>
              Anual <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full ml-1">Economize 43%</span>
            </span>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto border-2 border-[#FF6B6B]/30 shadow-2xl relative overflow-hidden">
          {/* Background Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF6B6B] via-[#FF8E53] to-[#4FC3F7]" />

          {/* Floating Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full shadow-lg text-sm font-bold whitespace-nowrap flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              ACESSO IMEDIATO
            </div>
          </div>

          <CardContent className="p-8 md:p-12 text-center pt-12 md:pt-14">
            {/* Plan Title */}
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Plano Completo</h3>
            <p className="text-base md:text-lg text-muted-foreground mb-8">
              Acesso total à plataforma
            </p>

            {/* Value Comparison */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl p-6 mb-6 border border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">🚫 Contratar Pessoas:</p>
              <p className="text-xs text-muted-foreground mb-3">
                Editor de Vídeo + Social Media cobram em média:
              </p>
              <p className="text-3xl font-bold line-through text-red-500 mb-2">R$ 2.500/mês</p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-muted-foreground">+ R$ 300 por vídeo</span>
                <span className="text-muted-foreground">+ R$ 50 por arte</span>
              </div>
            </div>

            {/* Price Display */}
            <div className="mb-8">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-3xl md:text-4xl font-bold text-muted-foreground opacity-70">R$</span>
                <span className="text-6xl md:text-7xl font-black bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] bg-clip-text text-transparent">
                  {billingCycle === 'monthly' ? '29' : '16,41'}
                </span>
                <span className="text-2xl md:text-3xl text-muted-foreground">/mês</span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-sm text-muted-foreground mb-2">
                  R$ 197 cobrados anualmente
                </p>
              )}
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                💰 {billingCycle === 'monthly' ? 'Economize R$ 471/mês vs contratando equipe!' : 'Economia máxima: Menos de R$ 0,55 por dia!'}
              </p>
            </div>

            {/* What's Included */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 mb-8 text-left border border-blue-200 dark:border-blue-800">
              <p className="font-bold text-center text-lg mb-4">✨ Tudo Incluído:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="text-sm md:text-base">250+ Vídeos Editáveis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="text-sm md:text-base">Artes & Stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="text-sm md:text-base">10 Robôs de IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="text-sm md:text-base">3 Influencers de IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="text-sm md:text-base">Calendário Anual</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="text-sm md:text-base">Legendas Prontas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="text-sm md:text-base">Atualização Semanal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="text-sm md:text-base">Suporte WhatsApp</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full h-16 md:h-20 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:from-[#FF5252] hover:to-[#FF7F43] text-lg md:text-xl font-black shadow-2xl hover:shadow-3xl transition-all duration-300 text-white mb-6"
            >
              {checkoutLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                  ASSINAR AGORA
                </>
              )}
            </Button>

            {/* Guarantee Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Shield className="h-8 w-8 text-green-600" />
                <p className="font-black text-xl md:text-2xl text-green-900 dark:text-green-100">
                  Garantia de 7 Dias
                </p>
              </div>
              <p className="text-sm md:text-base text-center text-foreground leading-relaxed">
                Teste por <strong>7 dias completos</strong>. Se não gostar, <strong className="text-green-600">devolvemos 100%</strong> do seu dinheiro. Sem perguntas, sem burocracia.
              </p>
              <p className="text-sm text-center text-muted-foreground mt-3 italic">
                O risco é todo nosso. Você só tem a ganhar.
              </p>
            </div>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>🔒 Pagamento 100% Seguro via Stripe</span>
            </div>
          </CardContent>
        </Card>
      </section >

      {/* MARKETING 360° - Tudo Incluído */}
      < section className="mb-12 md:mb-20" >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-2 border-primary rounded-3xl p-8 md:p-10 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block mb-4">
                <div className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  🚀 EXCLUSIVO
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-3">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  O Primeiro APP de Marketing Turístico 360°
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Tudo que você precisa para vender mais viagens, em um único lugar
              </p>
            </div>

            {/* Grid de Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Feature 1 */}
              <div className="text-center p-4 bg-white/50 dark:bg-background/50 rounded-xl hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">🎬</div>
                <p className="font-bold text-sm">Vídeos Prontos</p>
                <p className="text-xs text-muted-foreground">+250 templates</p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-4 bg-white/50 dark:bg-background/50 rounded-xl hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">🎨</div>
                <p className="font-bold text-sm">Artes & Design</p>
                <p className="text-xs text-muted-foreground">Stories, posts, feeds</p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-4 bg-white/50 dark:bg-background/50 rounded-xl hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">📸</div>
                <p className="font-bold text-sm">Banco de Fotos</p>
                <p className="text-xs text-muted-foreground">Alta qualidade</p>
              </div>

              {/* Feature 4 */}
              <div className="text-center p-4 bg-white/50 dark:bg-background/50 rounded-xl hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">📱</div>
                <p className="font-bold text-sm">Social Media</p>
                <p className="text-xs text-muted-foreground">Calendário anual</p>
              </div>

              {/* Feature 5 */}
              <div className="text-center p-4 bg-white/50 dark:bg-background/50 rounded-xl hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">✍️</div>
                <p className="font-bold text-sm">Copywriting</p>
                <p className="text-xs text-muted-foreground">Legendas prontas</p>
              </div>

              {/* Feature 6 */}
              <div className="text-center p-4 bg-white/50 dark:bg-background/50 rounded-xl hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">🎯</div>
                <p className="font-bold text-sm">Estratégias</p>
                <p className="text-xs text-muted-foreground">Tráfego & vendas</p>
              </div>

              {/* Feature 7 */}
              <div className="text-center p-4 bg-white/50 dark:bg-background/50 rounded-xl hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">🤖</div>
                <p className="font-bold text-sm">IA Integrada</p>
                <p className="text-xs text-muted-foreground">Edição assistida</p>
              </div>

              {/* Feature 8 */}
              <div className="text-center p-4 bg-white/50 dark:bg-background/50 rounded-xl hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">⚡</div>
                <p className="font-bold text-sm">Automação</p>
                <p className="text-xs text-muted-foreground">Publique rápido</p>
              </div>
            </div>

            {/* CTA Bottom */}
            <div className="mt-8 text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border-2 border-dashed border-primary/30">
              <p className="text-base md:text-lg font-bold mb-2">
                ✨ Tudo isso por <span className="text-2xl text-primary">R$ 29/mês</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Sem custo extra. Sem módulos separados. Tudo incluído.
              </p>
            </div>
          </div>
        </div>
      </section >

      {/* TESTIMONIALS - PROVA SOCIAL */}
      < section className="mb-12 md:mb-20" >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">O Que as Agências de Viagens Estão Falando?</h2>
        <p className="text-center text-muted-foreground mb-8">Depoimentos reais de quem já está usando o TravelMarketing</p>

        {/* WhatsApp/Instagram Style Notifications */}
        <div className="mb-10 max-w-4xl mx-auto space-y-3">
          {/* WhatsApp Notification 1 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-l-4 border-green-500 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💬</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1">WhatsApp • há 2 horas</p>
                <p className="text-sm md:text-base font-medium text-foreground">
                  "Parabéns pelo trabalho, ajudou muito aqui. Tava batendo cabeça para criar vídeos dos lugares para postar"
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">- Cliente via WhatsApp</p>
              </div>
            </div>
          </div>

          {/* Instagram Notification 2 */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-100 dark:from-pink-950/30 dark:to-purple-900/30 border-l-4 border-pink-500 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📱</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-pink-700 dark:text-pink-400 font-semibold mb-1">Instagram • há 5 horas</p>
                <p className="text-sm md:text-base font-medium text-foreground">
                  "vleviagens comentou: Eu comprei, estou usando e é maravilhoso o conteúdo 🙏"
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">- @vleviagens</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Notification 3 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-l-4 border-green-500 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💬</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1">WhatsApp • ontem</p>
                <p className="text-sm md:text-base font-medium text-foreground">
                  "Gostou dos vídeos de viagens? Ficou muito bom, né? Obrigado 🙏"
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  "Top demais da conta meu amigo!!!"
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">- Agência de Turismo</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Notification 4 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-l-4 border-green-500 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💬</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1">WhatsApp • há 1 dia</p>
                <p className="text-sm md:text-base font-medium text-foreground">
                  "Eu me surpreendi com o tanto de seguidores que consegui em poucas horas"
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  "Ainda bem que eu peguei seu material, dá para eu ir editando fácil e postando nesse começo 👏"
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">- Agente de Viagens</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* COMPARISON TABLE */}
      < section className="mb-12 md:mb-20" >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Compare e Veja o Quanto Você Economiza</h2>
        <p className="text-center text-muted-foreground mb-8">Investir R$ 29/mês vs contratar profissionais</p>

        {/* MOBILE: Cards Empilhados */}
        <div className="md:hidden space-y-4 mb-8">
          {/* Card TravelMarketing - DESTAQUE */}
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-5">
              <div className="text-center mb-4">
                <Sparkles className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="font-black text-xl">TravelMarketing</p>
                <p className="text-3xl font-black text-green-600 mt-2">R$ 29/mês</p>
                <p className="text-xs text-green-600 font-semibold">✨ Tudo incluso</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span>Vídeos ilimitados</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span>Artes/Posts ilimitados</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span>10 Robôs de IA Marketing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span>3 Influencers IA de Viagens</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span>Calendário de Conteúdo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span>Suporte WhatsApp</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Contratar Pessoas */}
          <Card className="border opacity-70">
            <CardContent className="p-5">
              <div className="text-center mb-4">
                <p className="font-bold text-lg">Contratar Pessoas</p>
                <p className="text-2xl font-bold text-red-600 mt-2">R$ 2.500/mês</p>
                <p className="text-xs text-muted-foreground">Salário Médio Jr.</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>Salário + Encargos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>Precisa Treinar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>Feriados e Folgas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>Gestão de Pessoas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>Equipamentos Caros</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">⚠️</span>
                  <span className="text-muted-foreground">Risco Trabalhista</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Agência de Marketing */}
          <Card className="border opacity-60">
            <CardContent className="p-5">
              <div className="text-center mb-4">
                <p className="font-bold text-lg">Agência Marketing</p>
                <p className="text-2xl font-bold text-red-600 mt-2">R$ 2.000+/mês</p>
                <p className="text-xs text-muted-foreground">mensalidade</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>R$ 500/vídeo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>R$ 100/arte</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>Sem IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>Sem Influencers IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Calendário R$ 200/mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">⚠️</span>
                  <span className="text-muted-foreground">Email only</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DESKTOP: Tabela (hidden mobile) */}
        <div className="hidden md:block max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2">
                <th className="text-left p-3 md:p-4 text-sm md:text-base font-bold">Recurso</th>
                <th className="p-3 md:p-4 text-center bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 text-sm md:text-base font-bold">
                  <div className="flex flex-col items-center gap-1">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Canva Viagem
                  </div>
                </th>
                <th className="p-3 md:p-4 text-center text-sm md:text-base">Contratar Equipe<br /><span className="text-xs text-muted-foreground">Editor + Social Media</span></th>
                <th className="p-3 md:p-4 text-center text-sm md:text-base">Agência<br /><span className="text-xs text-muted-foreground">Marketing</span></th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 md:p-4 text-sm md:text-base">Vídeos ilimitados</td>
                <td className="p-3 md:p-4 text-center bg-primary/5">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                </td>
                <td className="p-3 md:p-4 text-center text-xs md:text-sm text-red-600">Limitado ao tempo</td>
                <td className="p-3 md:p-4 text-center text-xs md:text-sm text-red-600">Custo extra por vídeo</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 md:p-4 text-sm md:text-base">Artes/Posts ilimitados</td>
                <td className="p-3 md:p-4 text-center bg-primary/5">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                </td>
                <td className="p-3 md:p-4 text-center text-xs md:text-sm text-red-600">Demora na entrega</td>
                <td className="p-3 md:p-4 text-center text-xs md:text-sm text-red-600">Pacotes limitados</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 md:p-4 text-sm md:text-base">10 Robôs de IA Marketing</td>
                <td className="p-3 md:p-4 text-center bg-primary/5">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                </td>
                <td className="p-3 md:p-4 text-center text-xs md:text-sm">❌</td>
                <td className="p-3 md:p-4 text-center text-xs md:text-sm">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 md:p-4 text-sm md:text-base">3 Influencers IA de Viagens</td>
                <td className="p-3 md:p-4 text-center bg-primary/5">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                </td>
                <td className="p-3 md:p-4 text-center text-xs md:text-sm">❌</td>
                <td className="p-3 md:p-4 text-center text-xs md:text-sm">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 md:p-4 text-sm md:text-base">Calendário de Conteúdo</td>
                <td className="p-3 md:p-4 text-center bg-primary/5">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                </td>
                <td className="p-3 md:p-4 text-center text-xs md:text-sm text-red-600">Você que cria</td>
                <td className="p-3 md:p-4 text-center text-xs md:text-sm text-red-600">Pago à parte</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 md:p-4 text-sm md:text-base">Suporte WhatsApp</td>
                <td className="p-3 md:p-4 text-center bg-primary/5">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                </td>
                <td className="p-3 md:p-4 text-center text-xs md:text-sm">Fins de semana off</td>
                <td className="p-3 md:p-4 text-center text-xs md:text-sm">Chatbot / Email</td>
              </tr>
              <tr className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 font-bold">
                <td className="p-3 md:p-4 text-sm md:text-base">💰 Total por mês</td>
                <td className="p-3 md:p-4 text-center text-lg md:text-xl text-green-600">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl md:text-3xl font-black">R$ 29</span>
                    <span className="text-xs">✨ Tudo incluso</span>
                  </div>
                </td>
                <td className="p-3 md:p-4 text-center text-base md:text-lg text-red-600">
                  <div className="flex flex-col items-center">
                    <span className="font-bold">R$ 2.500+</span>
                    <span className="text-xs">Salário + Encargos</span>
                  </div>
                </td>
                <td className="p-3 md:p-4 text-center text-base md:text-lg text-red-600">
                  <div className="flex flex-col items-center">
                    <span className="font-bold">R$ 2.000+</span>
                    <span className="text-xs">mensalidade</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg md:text-xl font-bold text-green-600">
            🍕 Mais barato que uma pizza!
          </p>
        </div>
      </section >

      {/* FAQ MATADOR - Remove Objeções */}
      < section className="mb-12 md:mb-20" >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Perguntas Frequentes</h2>
        <p className="text-center text-muted-foreground mb-8">Tudo o que você precisa saber</p>

        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
              ❓ Preciso saber design para usar?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm md:text-base">
              <strong className="text-foreground">Não!</strong> A ferramenta é super intuitiva. Tudo já vem pronto: vídeos, artes, legendas.
              Você só escolhe o que quer e baixa. Em 2 minutos você cria um post profissional.
              Temos também uma aula completa mostrando como usar.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
              📱 Funciona no celular?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm md:text-base">
              <strong className="text-foreground">Sim!</strong> Canva Viagem funciona perfeitamente no celular, tablet e computador.
              Acesse de qualquer lugar, a qualquer hora. Ideal para quem trabalha em movimento.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
              ❌ Posso cancelar quando quiser?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm md:text-base">
              <strong className="text-foreground">Sim, sem letras miúdas!</strong> Você pode cancelar a qualquer momento, sem burocracias.
              E conforme a lei do consumidor, você tem 7 dias de garantia incondicional. Risco ZERO.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
              ⏱️ Quanto tempo leva para criar um post?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm md:text-base">
              <strong className="text-foreground">2 minutos!</strong> Escolha o vídeo ou arte → Personalize (opcional) → Baixe → Poste.
              Você pode criar conteúdo para a semana inteira em menos de 15 minutos.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
              📹 Os vídeos têm copyright?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm md:text-base">
              <strong className="text-foreground">Não!</strong> Todos os vídeos e artes são 100% livres de direitos autorais.
              Você pode usar com segurança no seu marketing sem preocupações.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
              🔄 Vocês adicionam conteúdo novo?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm md:text-base">
              <strong className="text-foreground">Toda semana!</strong> Adicionamos novos vídeos, artes e ferramentas de IA constantemente.
              Seu acesso garante todas as atualizações futuras sem custo adicional.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
              💬 Como funciona o suporte?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm md:text-base">
              Suporte direto via WhatsApp durante horário comercial. Respondemos rápido e ajudamos com qualquer dúvida!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
              🚀 Quando recebo o acesso?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm md:text-base">
              <strong className="text-foreground">Imediatamente!</strong> Assim que o pagamento for confirmado (geralmente instantâneo),
              você recebe o link de acesso por email. Em 2 minutos já está criando conteúdo!
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section >

      {/* SEÇÃO DE GARANTIA */}
      <section className="mb-12 md:mb-20">
        <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-500 p-8 rounded-3xl max-w-3xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-4 mb-4">
              <Shield className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black mb-4 text-green-800 dark:text-green-200">
              RISCO ZERO: Garantia de 7 Dias
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Você entra, usa tudo, baixa os vídeos, posta... Se em <strong>7 dias</strong> você achar que não valeu a pena, nós devolvemos <strong>100% do seu dinheiro</strong>.
            </p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              Sem letras miúdas. Sem perguntas. É só pedir e reembolsamos.
            </p>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF CVC/DECOLAR */}
      < section className="mb-8 md:mb-12 text-center" >
        <p className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Seu perfil melhor do que o da CVC e Decolar? 😅</p>
        <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmo1NGh5cGxiZG1vdHl3bmZxNTBxd2h0aDBsbXkxa2xhNWk4bmE4aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MpVJ9IjphA5p6sO8Zr/giphy.gif" alt="Perfil profissional" className="mx-auto rounded-xl shadow-lg max-w-full w-full md:max-w-md" />
      </section >

      {/* Alert para usuários logados sem assinatura */}
      {
        user && <div className="bg-secondary border border-border rounded-lg p-3 md:p-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/10 rounded-full p-2 shrink-0">
              <Plane className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <p className="text-foreground text-sm md:text-base">
              <strong>{t('plans.noActivePlan')}</strong>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefreshSubscription} disabled={refreshLoading} className="w-full sm:w-auto">
            {refreshLoading ? <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('plans.refreshing')}
            </> : <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('plans.refreshStatus')}
            </>}
          </Button>
        </div>
      }



      {/* CTA FINAL - ULTIMATUM */}
      <section className="mb-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-b from-transparent to-primary/5 rounded-3xl p-8 border border-primary/10">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Pronto para mudar o nível do seu marketing?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Não deixe para depois. O preço promocional pode acabar a qualquer momento.
          </p>

          <Button
            size="lg"
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="w-full max-w-md h-20 text-xl md:text-2xl font-black bg-[#25D366] hover:bg-[#128C7E] text-white shadow-xl hover:shadow-2xl transition-all scale-100 hover:scale-105 active:scale-95"
          >
            {checkoutLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <>
              <Sparkles className="mr-3 h-6 w-6" />
              QUERO VENDER MAIS AGORA
            </>}
          </Button>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Acesso Imediato</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Garantia de 7 dias</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancelamento fácil</span>
            </div>
          </div>
        </div>
      </section>


    </div >
    <Footer />
  </div >;
};
export default Planos;
