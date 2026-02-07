import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserInfoCard } from "@/components/UserInfoCard";
import { trackViewContent, trackInitiateCheckout } from "@/lib/meta-pixel";
import { Loader2, Check, Plane, Settings, Video, Image, MessageSquare, Bot, Calendar, Sparkles, RefreshCw, Users, FileText, Shield, Clock, Infinity, GraduationCap } from "lucide-react";
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
      <Header />
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-5xl">
        {user && <UserInfoCard />}

        {/* HERO SECTION - Badge de Marketing */}
        <section className="text-center mb-12 md:mb-20">
          <Badge className="mb-6 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 text-sm md:text-base font-semibold">
            <Sparkles className="h-4 w-4 mr-2" />
            🏆 A Primeira Ferramenta de Marketing Completa do Brasil
          </Badge>

          {/* Headline com Gradiente */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Venda Mais Viagens
            </span>
            <br />
            <span className="text-foreground">O Ano Inteiro</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            {t('plans.heroSubtitle')}
          </p>

          {/* GIF Hero */}
          <img src={heroGif} alt="Vídeos de viagens profissionais" className="mx-auto rounded-2xl shadow-2xl max-w-xs md:max-w-2xl mb-6" />

          {/* Badges de Prova Social */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <Check className="h-4 w-4 mr-2 text-primary" />
              {t('plans.lessThanPerVideo')}
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <Shield className="h-4 w-4 mr-2 text-accent" />
              {t('plans.approvedAgencies')}
            </Badge>
          </div>

          {/* CTA Button below pricing text - Green Anchor */}
          <a href="#preco" className="inline-block mt-6">
            <Button size="lg" className="px-8 py-6 text-base md:text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white">
              <Sparkles className="mr-2 h-5 w-5" />
              Ver Preços
            </Button>
          </a>
        </section>

        {/* GRID DE GIFS FORMATO REELS */}
        <section className="mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            {t('plans.proofTitle')}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
            {proofGifs.map((gif, index) => <div key={index} className="rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform duration-300">
                <img src={gif} alt={`Exemplo de vídeo ${index + 1}`} className="w-full aspect-[9/16] object-cover" />
              </div>)}
          </div>
        </section>

        {/* SEÇÃO "O QUE É CANVA VIAGEM?" */}
        <section className="mb-12 md:mb-20">
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
        </section>

        {/* VÍDEOS YOUTUBE COM OVERLAY - 2 por linha no mobile */}
        <section className="mb-12 md:mb-20">
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
        </section>

        {/* CARD DE PREÇO APRIMORADO */}
        <section id="preco" className="mb-12 md:mb-20 scroll-mt-20">
          <Card className="max-w-2xl mx-auto border-2 border-primary/20 shadow-xl relative">
            {/* Floating Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full shadow-lg text-xs md:text-sm font-semibold whitespace-nowrap">
                ✨ 3 Dias Grátis
              </div>
            </div>

            <CardContent className="p-8 md:p-12 text-center pt-10 md:pt-12">
              <h3 className="text-lg md:text-xl font-bold mb-3">Tenha acesso a todas as ferramentas</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                Vídeos, artes, robôs, influencers e todo o acesso
              </p>

              <p className="text-xl md:text-2xl line-through text-muted-foreground mb-2">De R$197</p>

              {/* Custom Price Display */}
              <div className="flex items-baseline justify-center mb-6 gap-1">
                <span className="text-2xl md:text-3xl font-bold text-primary opacity-70">R$</span>
                <span className="text-5xl md:text-6xl font-black text-primary">29</span>
                <span className="text-2xl md:text-3xl font-bold text-primary opacity-70">,00</span>
                <span className="text-xl md:text-2xl text-muted-foreground ml-1">/mês</span>
              </div>

              <Button size="lg" onClick={handleCheckout} disabled={checkoutLoading} className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-sm md:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-white">
                {checkoutLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
                    <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Começar Teste Grátis de 3 Dias
                  </>}
              </Button>

              <p className="text-xs font-medium text-center mt-4 flex items-center justify-center gap-1.5">
                <Shield className="h-3 w-3 text-green-600" />
                <span className="text-muted-foreground">🔒 Pagamento seguro</span>
              </p>
              <p className="text-xs text-center text-muted-foreground mt-2">
                {t('plans.instantAccess')}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* SEÇÃO DE GARANTIA */}
        <section className="mb-12 md:mb-20">
          <div className="bg-accent/10 border-l-4 border-accent p-6 md:p-8 rounded-xl">
            <div className="flex flex-col items-center text-center">
              <img src={garantia7dias} alt="Garantia 7 dias incondicional" className="w-20 md:w-28 mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4">{t('plans.guaranteeTitle')}</h3>
              <p className="text-lg text-muted-foreground max-w-xl">
                {t('plans.guaranteeDesc')}
              </p>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF CVC/DECOLAR */}
        <section className="mb-8 md:mb-12 text-center">
          <p className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Seu perfil melhor do que o da CVC e Decolar? 😅</p>
          <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmo1NGh5cGxiZG1vdHl3bmZxNTBxd2h0aDBsbXkxa2xhNWk4bmE4aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MpVJ9IjphA5p6sO8Zr/giphy.gif" alt="Perfil profissional" className="mx-auto rounded-xl shadow-lg max-w-full w-full md:max-w-md" />
        </section>

        {/* Alert para usuários logados sem assinatura */}
        {user && <div className="bg-secondary border border-border rounded-lg p-3 md:p-4 mb-6 md:mb-8">
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
          </div>}

        {/* FAQ REDUZIDO - 5 PERGUNTAS ESSENCIAIS */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('plans.faqTitle')}</h2>
          <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
            {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base md:text-lg">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </section>

        {/* CTA FINAL COM PULSE */}
        <section className="mb-12">
          <div className="text-center">
            <Button size="lg" onClick={handleCheckout} disabled={checkoutLoading} className="text-xl px-12 h-16 bg-gradient-to-r from-primary to-accent animate-pulse shadow-2xl hover:shadow-3xl transition-all duration-300">
              {checkoutLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>
                  <Sparkles className="mr-2 h-6 w-6" />
                  {t('plans.ctaFinal')}
                </>}
            </Button>
            <p className="text-sm font-medium mt-4 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>🔒 Pagamento Seguro</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {t('plans.instantAccess')}
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>;
};
export default Planos;