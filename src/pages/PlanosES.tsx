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
import { 
  Loader2, Check, Plane, Settings, Video, Image, MessageSquare, 
  Bot, Calendar, Sparkles, RefreshCw, Users, FileText, Shield, Clock, Infinity 
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import garantia7dias from "@/assets/garantia-7-dias.png";
import { SpanishPixel } from "@/components/SpanishPixel";

// GIFs e Videos constants
const heroGif = "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm5kcmcybmE2aTFkOTU3ZDNqYmZkbHQ2YjRibjB1NjFtN2RoNWdrMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6osnZ6joYcPfERZsaE/giphy.gif";

const proofGifs = [
  "https://media.giphy.com/media/OEXnFVFMGCAoIuvcfs/giphy.gif",
  "https://media.giphy.com/media/cA9Hq7AaawDVrbP4pn/giphy.gif",
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3J2anV0aTVkYWowbDl1ZXFtNnB4ZWUwcnVnZTVzOW91ZzNncGNvNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mbylDFYWSU46XeLcsS/giphy.gif",
  "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXQ1dHAxM2JxcWM0N3VqdWhibnBtcDR5eWVmNTZwaGI1NTJjeml3diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VcFJaM72FG76eG75In/giphy.gif",
  "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExa24wbWJoa2swZXVyY3h5eDgxY3FhdWR2cHg5MDhrN3p2ZGExYWtpNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/22QqF0ECtSnOvpiQLZ/giphy.gif",
  "https://media.giphy.com/media/OnG9sr0U3v4VFxm2oh/giphy.gif",
];

const youtubeVideos = [
  { id: "WQHy13ySG-g", title: "Video 1" },
  { id: "NYkxwcI2Cr0", title: "Video 2" },
  { id: "QYjziquV-YU", title: "Video 3" },
  { id: "VmX1raYC96E", title: "Video 4" },
];

// ⭐ CHECKOUT LINK USD FIXED ⭐
const STRIPE_LINK_ES = "https://buy.stripe.com/bJedRa3TIej6cz15gE8so04";

const PlanosES = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setLanguage } = useLanguage();
  const {
    user,
    loading: authLoading,
    subscription,
    refreshSubscription,
  } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // ⭐ Set document language on mount ⭐
  useEffect(() => {
    document.documentElement.lang = 'es';
    setLanguage('es');
  }, [setLanguage]);

  // Benefits with icons - Spanish
  const benefits = [
    { icon: Video, text: "+250 plantillas de videos editables", highlight: true },
    { icon: MessageSquare, text: "Soporte por WhatsApp", highlight: false },
    { icon: Calendar, text: "Calendario de publicaciones", highlight: false },
    { icon: FileText, text: "Subtítulos listos para copiar", highlight: false },
    { icon: Sparkles, text: "Integración con Canva Pro", highlight: false },
    { icon: Shield, text: "Sin derechos de autor", highlight: false },
    { icon: Bot, text: "Herramientas de IA exclusivas", highlight: true },
    { icon: Image, text: "Artes para feed y stories", highlight: false },
    { icon: Users, text: "Contenido con influencers", highlight: false },
    { icon: Infinity, text: "Actualizaciones semanales", highlight: false },
  ];

  // FAQs - Spanish
  const faqs = [
    { 
      question: "¿Cómo accedo a las plantillas?", 
      answer: "Después del pago, recibirás acceso inmediato a la plataforma con todas las plantillas editables en Canva." 
    },
    { 
      question: "¿Necesito Canva Pro?", 
      answer: "No es obligatorio, pero recomendamos Canva Pro para acceder a todas las funcionalidades de las plantillas." 
    },
    { 
      question: "¿Puedo cancelar en cualquier momento?", 
      answer: "Sí, puedes cancelar tu suscripción cuando quieras sin cargos adicionales." 
    },
    { 
      question: "¿Las plantillas son exclusivas?", 
      answer: "Sí, todas las plantillas son creadas exclusivamente para nuestra plataforma." 
    },
    { 
      question: "¿Cómo funciona la garantía?", 
      answer: "Tienes 7 días para probar. Si no te gusta, te devolvemos el 100% de tu dinero." 
    },
  ];

  // Track view content
  useEffect(() => {
    trackViewContent('Página de Planes ES');
  }, []);

  // Handle success/cancel redirects from Stripe
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success === "true") {
      toast.success("¡Pago realizado con éxito!");
      refreshSubscription();
      navigate("/sucesso");
    } else if (canceled === "true") {
      toast.info("Pago cancelado.");
      window.history.replaceState({}, "", "/es/planos");
    }
  }, [searchParams, refreshSubscription, navigate]);

  const handleCheckout = async () => {
    // Track with USD currency
    trackInitiateCheckout(9.09, 'USD');
    setCheckoutLoading(true);

    if (user) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const { data, error } = await supabase.functions.invoke("create-checkout", {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            },
            body: { language: 'es' }
          });
          if (!error && data?.url) {
            window.open(data.url, '_blank');
            toast.info("El checkout se abrió en una nueva pestaña. ¡Completa el pago y vuelve aquí!");
            setCheckoutLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Checkout error:", error);
      }
    }

    // Fallback to direct Stripe link
    window.open(STRIPE_LINK_ES, '_blank');
    toast.info("El checkout se abrió en una nueva pestaña. ¡Después del pago, revisa tu email!");
    setCheckoutLoading(false);
  };

  const handleRefreshSubscription = async () => {
    setRefreshLoading(true);
    try {
      await refreshSubscription();
      toast.success("¡Estado de la suscripción actualizado!");
    } catch (error) {
      toast.error("Error al actualizar el estado");
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Necesitas iniciar sesión.");
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
        toast.error("Error al acceder al portal. Intenta de nuevo.");
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Error al procesar. Intenta de nuevo.");
    } finally {
      setPortalLoading(false);
    }
  };

  if (authLoading || subscription.loading) {
    return (
      <div className="min-h-screen bg-background">
        <SpanishPixel />
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
        <SpanishPixel />
        <Header />
        <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-4xl">
          <UserInfoCard />
          
          <div className="text-center mb-8 md:mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Suscriptor Activo
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">¡Ya tienes acceso completo!</h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Disfruta de todas las plantillas y herramientas de la plataforma.
            </p>
          </div>

          <Card className="border-primary border-2 mb-8">
            <CardHeader className="text-center p-4 md:p-6">
              <div className="h-16 w-16 md:h-20 md:w-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Plane className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <CardTitle className="text-xl md:text-2xl">Canva Viagem Premium</CardTitle>
              <p className="text-sm md:text-base text-muted-foreground">Tu plan está activo</p>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
              <div className="p-3 md:p-4 bg-primary/10 rounded-lg text-center">
                <p className="font-semibold text-primary flex items-center justify-center gap-2 text-sm md:text-base">
                  <Check className="h-4 w-4 md:h-5 md:w-5" />
                  Acceso completo a todas las plantillas
                </p>
                {subscription.subscriptionEnd && (
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Próxima renovación: {new Date(subscription.subscriptionEnd).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/es")} className="w-full" size="lg">
                  <Plane className="mr-2 h-4 w-4" />
                  Acceder a la Plataforma
                </Button>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={handleManageSubscription} disabled={portalLoading} className="flex-1">
                    {portalLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <Settings className="mr-2 h-4 w-4" />
                        Gestionar Suscripción
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" onClick={handleRefreshSubscription} disabled={refreshLoading} className="flex-1">
                    {refreshLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualizar Estado
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
      <SpanishPixel />
      <Header />
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-5xl">
        {user && <UserInfoCard />}

        {/* HERO SECTION */}
        <section className="text-center mb-12 md:mb-20">
          <Badge className="mb-6 px-6 py-2 bg-gradient-to-r from-primary to-accent text-white animate-pulse border-0">
            <Sparkles className="h-4 w-4 mr-2" />
            ⚡ ¡OFERTA ESPECIAL!
          </Badge>
          
          {/* Headline con Gradiente */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              ¡Vende Más Viajes
            </span>
            <br />
            <span className="text-foreground">Todo el Año!</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            +250 plantillas de video editables en Canva
          </p>
          
          {/* GIF Hero */}
          <img 
            src={heroGif} 
            alt="Videos de viajes profesionales" 
            className="mx-auto rounded-2xl shadow-2xl max-w-xs md:max-w-2xl mb-6"
          />
          
          {/* Badges de Prova Social */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <Check className="h-4 w-4 mr-2 text-primary" />
              Menos de $0.04 por video
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <Shield className="h-4 w-4 mr-2 text-accent" />
              +1000 agencias ya usan
            </Badge>
          </div>
        </section>

        {/* GRID DE GIFS FORMATO REELS */}
        <section className="mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            🎬 Mira ejemplos de nuestros videos
          </h2>
          <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
            {proofGifs.map((gif, index) => (
              <div key={index} className="rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform duration-300">
                <img 
                  src={gif} 
                  alt={`Ejemplo de video ${index + 1}`}
                  className="w-full aspect-[9/16] object-cover"
                />
              </div>
            ))}
          </div>
        </section>

        {/* SEÇÃO "O QUE VOCÊ RECEBE" MELHORADA */}
        <section className="mb-12 md:mb-20">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 md:p-12 rounded-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              💎 ¿Qué recibes?
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-8">
              Todo lo que necesitas para crear contenido profesional
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
            📱 Algunos ejemplos de lo que tendrás
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

        {/* CARD DE PREÇO - USD */}
        <section className="mb-12 md:mb-20">
          <Card className="max-w-2xl mx-auto border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8 md:p-12 text-center">
              <p className="text-2xl line-through text-muted-foreground mb-2">$29,90</p>
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-5xl md:text-6xl font-black text-primary">$9,09</span>
                <span className="text-xl text-muted-foreground ml-2">/mes</span>
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
                    Suscribirse Ahora
                  </>
                )}
              </Button>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Pago seguro
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Acceso inmediato
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* GARANTIA */}
        <section className="mb-12 md:mb-20">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-8 md:p-12 rounded-3xl text-center">
            <img 
              src={garantia7dias} 
              alt="Garantía de 7 días" 
              className="mx-auto w-32 md:w-40 mb-6"
            />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Garantía de 7 Días
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Si no estás satisfecho con la plataforma, te devolvemos el 100% de tu dinero. 
              Sin preguntas, sin complicaciones.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            ❓ Preguntas Frecuentes
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`} 
                  className="bg-card rounded-lg border shadow-sm"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <span className="text-left font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="text-center pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            ¿Listo para vender más viajes?
          </h2>
          <Button 
            size="lg" 
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="h-14 px-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {checkoutLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                ¡Empezar Ahora por $9,09/mes!
              </>
            )}
          </Button>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default PlanosES;
