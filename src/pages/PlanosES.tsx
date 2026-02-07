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
    { icon: Video, text: "+250 plantillas de videos editables", description: "Videos profesionales listos para editar en Canva con música y transiciones", highlight: true },
    { icon: MessageSquare, text: "Soporte por WhatsApp", description: "Resuelve tus dudas directamente con nuestro equipo", highlight: false },
    { icon: Calendar, text: "Calendario de publicaciones", description: "Planifica tu contenido con fechas especiales y festivos", highlight: false },
    { icon: FileText, text: "Subtítulos listos para copiar", description: "Textos optimizados para Instagram, Facebook y TikTok", highlight: false },
    { icon: Sparkles, text: "Integración con Canva Pro", description: "Compatibilidad total con Canva para edición fácil", highlight: false },
    { icon: Shield, text: "Sin derechos de autor", description: "Usa todo el contenido sin preocupaciones legales", highlight: false },
    { icon: Bot, text: "Herramientas de IA exclusivas", description: "Crea subtítulos y descripciones automáticamente con IA", highlight: true },
    { icon: Image, text: "Artes para feed y stories", description: "Diseños estáticos para complementar tus videos", highlight: false },
    { icon: Users, text: "Contenido con influencers", description: "Videos con creadores de viajes reconocidos", highlight: false },
    { icon: Infinity, text: "Actualizaciones semanales", description: "Nuevo contenido cada semana para mantenerte actualizado", highlight: false },
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SpanishPixel />
      <Header />
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-5xl overflow-x-hidden">
        {user && <UserInfoCard />}

        {/* HERO SECTION - Badge de Marketing */}
        <section className="text-center mb-12 md:mb-20">
          <div className="mb-6 px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border-2 border-blue-400/30 rounded-full inline-block shadow-lg">
            <p className="text-blue-700 dark:text-blue-300 text-xs md:text-sm font-bold flex items-center gap-2">
              🏆 La primera herramienta de marketing turístico más completa del mundo
            </p>
          </div>

          {/* Headline con Gradiente */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-2">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              TravelMarketing
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-4 font-medium">
            Marketing Profesional para Turismo
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            ¡Vende Más Viajes Todo el Año!
          </h2>

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
                  className={`flex flex-col gap-2 p-4 rounded-lg transition-all duration-200 ${item.highlight
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                    : 'bg-background/50 hover:bg-background/80'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-5 w-5 shrink-0 ${item.highlight ? 'text-white' : 'text-primary'}`} />
                    <span className="font-semibold">{item.text}</span>
                  </div>
                  <p className={`text-sm pl-8 ${item.highlight ? 'text-white/90' : 'text-muted-foreground'}`}>
                    {item.description}
                  </p>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-2xl lg:max-w-none mx-auto">
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

        {/* TESTIMONIOS - PROVA SOCIAL */}
        <section className="mb-12 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Lo Que Dicen Nuestros Clientes</h2>
          <p className="text-center text-muted-foreground mb-8">Agencias que ya están vendiendo más con TravelMarketing</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm md:text-base mb-4 italic">
                  "Aumenté mi engagement en 300% el primer mes. ¡Puedo publicar todos los días y mis clientes lo aman!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div>
                    <p className="font-semibold text-sm">María García</p>
                    <p className="text-xs text-muted-foreground">Agencia Viajes Soñados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2 border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm md:text-base mb-4 italic">
                  "Cerré 5 paquetes extra este mes solo con los videos de TravelMarketing. ¡Mejor inversión!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Juan López</p>
                    <p className="text-xs text-muted-foreground">Travel Expert</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm md:text-base mb-4 italic">
                  "Ahorré $800/mes que gastaba en diseñador. ¡Ahora creo todo yo misma en minutos!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Ana Rodríguez</p>
                    <p className="text-xs text-muted-foreground">Mundo Viajes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="mb-12 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Compara y Ve Cuánto Ahorras</h2>
          <p className="text-center text-muted-foreground mb-8">Invertir $9.09/mes vs contratar profesionales</p>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left p-3 md:p-4 text-sm md:text-base font-bold">Recurso</th>
                  <th className="p-3 md:p-4 text-center bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 text-sm md:text-base font-bold">
                    <div className="flex flex-col items-center gap-1">
                      <Sparkles className="h-5 w-5 text-primary" />
                      TravelMarketing
                    </div>
                  </th>
                  <th className="p-3 md:p-4 text-center text-sm md:text-base">Diseñador<br /><span className="text-xs text-muted-foreground">Freelancer</span></th>
                  <th className="p-3 md:p-4 text-center text-sm md:text-base">Agencia<br /><span className="text-xs text-muted-foreground">Marketing</span></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 md:p-4 text-sm md:text-base">Videos ilimitados</td>
                  <td className="p-3 md:p-4 text-center bg-primary/5">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="p-3 md:p-4 text-center text-xs md:text-sm text-red-600">$300/video</td>
                  <td className="p-3 md:p-4 text-center text-xs md:text-sm text-red-600">$500/video</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 md:p-4 text-sm md:text-base">Artes/Posts ilimitados</td>
                  <td className="p-3 md:p-4 text-center bg-primary/5">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="p-3 md:p-4 text-center text-xs md:text-sm text-red-600">$50/arte</td>
                  <td className="p-3 md:p-4 text-center text-xs md:text-sm text-red-600">$100/arte</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 md:p-4 text-sm md:text-base">10 Robots de IA Marketing</td>
                  <td className="p-3 md:p-4 text-center bg-primary/5">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="p-3 md:p-4 text-center text-xs md:text-sm">❌</td>
                  <td className="p-3 md:p-4 text-center text-xs md:text-sm">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 md:p-4 text-sm md:text-base">3 Influencers IA de Viajes</td>
                  <td className="p-3 md:p-4 text-center bg-primary/5">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="p-3 md:p-4 text-center text-xs md:text-sm">❌</td>
                  <td className="p-3 md:p-4 text-center text-xs md:text-sm">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 md:p-4 text-sm md:text-base">Calendario de Contenido</td>
                  <td className="p-3 md:p-4 text-center bg-primary/5">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="p-3 md:p-4 text-center text-xs md:text-sm">❌</td>
                  <td className="p-3 md:p-4 text-center text-xs md:text-sm text-red-600">$200/mes</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 md:p-4 text-sm md:text-base">Soporte WhatsApp</td>
                  <td className="p-3 md:p-4 text-center bg-primary/5">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="p-3 md:p-4 text-center text-xs md:text-sm">Por proyecto</td>
                  <td className="p-3 md:p-4 text-center text-xs md:text-sm">Solo email</td>
                </tr>
                <tr className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 font-bold">
                  <td className="p-3 md:p-4 text-sm md:text-base">💰 Total por mes</td>
                  <td className="p-3 md:p-4 text-center text-lg md:text-xl text-green-600">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl md:text-3xl font-black">$9.09</span>
                      <span className="text-xs">✨ Todo incluido</span>
                    </div>
                  </td>
                  <td className="p-3 md:p-4 text-center text-base md:text-lg text-red-600">
                    <div className="flex flex-col items-center">
                      <span className="font-bold">$600+</span>
                      <span className="text-xs">por proyecto</span>
                    </div>
                  </td>
                  <td className="p-3 md:p-4 text-center text-base md:text-lg text-red-600">
                    <div className="flex flex-col items-center">
                      <span className="font-bold">$2.000+</span>
                      <span className="text-xs">mensualidad</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <p className="text-lg md:text-xl font-bold text-green-600">
              🎉 ¡Ahorra hasta $1.970/mes = $23.640/año!
            </p>
          </div>
        </section>

        {/* CARD DE PREÇO - USD */}
        <section id="precio" className="mb-12 md:mb-20 scroll-mt-20">
          <Card className="max-w-2xl mx-auto border-2 border-primary/20 shadow-xl relative">
            {/* Floating Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full shadow-lg text-xs md:text-sm font-semibold whitespace-nowrap">
                ✨ 3 Días Gratis
              </div>
            </div>

            <CardContent className="p-8 md:p-12 text-center pt-10 md:pt-12">
              <h3 className="text-lg md:text-xl font-bold mb-3">Ten acceso a todas las herramientas</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                Videos, artes, robots, influencers y todo el acceso
              </p>

              {/* Price Comparison - Show Value */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg p-4 mb-4 border border-red-200 dark:border-red-800">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">¿Cuánto pagarías?</p>
                <p className="text-xs text-muted-foreground mb-2">Diseñador freelancer cobra:</p>
                <p className="text-2xl font-bold line-through text-red-500">$500/mes</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">↓ Ahorra $490 por mes = $5.880/año</p>
              </div>

              {/* Custom Price Display */}
              <div className="flex items-baseline justify-center mb-2 gap-1">
                <span className="text-2xl md:text-3xl font-bold text-primary opacity-70">$</span>
                <span className="text-5xl md:text-6xl font-black text-primary">9,09</span>
                <span className="text-xl md:text-2xl text-muted-foreground ml-1">/mes</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 font-bold mb-6">¡98% más barato que diseñador!</p>

              <Button size="lg" onClick={handleCheckout} disabled={checkoutLoading} className="w-full h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-base md:text-lg font-black shadow-xl hover:shadow-2xl transition-all duration-300 text-white animate-pulse hover:animate-none">
                {checkoutLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  🔥 EMPEZAR PRUEBA GRATIS AHORA
                </>}
              </Button>

              {/* Urgency - Limited spots */}
              <div className="mt-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <p className="text-xs md:text-sm font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1.5">
                  ⚡ Solo 23 cupos restantes este mes
                </p>
              </div>

              {/* Guarantee - Risk Free */}
              <div className="mt-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
                <p className="text-sm md:text-base font-bold text-green-700 dark:text-green-300 flex items-center justify-center gap-2 mb-1">
                  <Shield className="h-5 w-5" />
                  ✅ Garantía de 7 Días - Riesgo CERO
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  ¿No te gusta? Cancela en 7 días y recibe el 100% de tu dinero
                </p>
              </div>

              <p className="text-xs font-medium text-center mt-4 flex items-center justify-center gap-1.5">
                <span className="text-muted-foreground">🔒 Pago 100% seguro vía Stripe</span>
              </p>
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

        {/* FAQ MEJORADO - Remove Objeciones */}
        <section className="mb-12 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Preguntas Frecuentes</h2>
          <p className="text-center text-muted-foreground mb-8">Todo lo que necesitas saber</p>

          <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
                ❓ ¿Necesito saber diseño para usar?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">
                <strong className="text-foreground">¡No!</strong> La herramienta es super intuitiva. Todo viene listo: videos, artes, subtítulos.
                Tú solo eliges lo que quieres y descargas. En 2 minutos creas un post profesional.
                También tenemos una clase completa mostrando cómo usar.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
                📱 ¿Funciona en el móvil?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">
                <strong className="text-foreground">¡Sí!</strong> TravelMarketing funciona perfectamente en móvil, tablet y computadora.
                Accede desde cualquier lugar, a cualquier hora. Ideal para quien trabaja en movimiento.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
                ❌ ¿Puedo cancelar cuando quiera?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">
                <strong className="text-foreground">¡Sí, sin letra pequeña!</strong> Puedes cancelar en cualquier momento, sin burocracias.
                Y si cancelas en los primeros 7 días, devolvemos el 100% de tu dinero. Riesgo CERO.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
                ⏱️ ¿Cuánto tiempo lleva crear un post?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">
                <strong className="text-foreground">¡2 minutos!</strong> Elige el video o arte → Personaliza (opcional) → Descarga → Publica.
                Puedes crear contenido para toda la semana en menos de 15 minutos.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
                📹 ¿Los videos tienen copyright?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">
                <strong className="text-foreground">¡No!</strong> Todos los videos y artes son 100% libres de derechos de autor.
                Puedes usar con seguridad en tu marketing sin preocupaciones.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
                🔄 ¿Agregan contenido nuevo?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">
                <strong className="text-foreground">¡Cada semana!</strong> Agregamos nuevos videos, artes y herramientas de IA constantemente.
                Tu acceso garantiza todas las actualizaciones futuras sin costo adicional.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
                💬 ¿Cómo funciona el soporte?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">
                Soporte directo vía WhatsApp durante horario comercial. ¡Respondemos rápido y ayudamos con cualquier duda!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
                🚀 ¿Cuándo recibo el acceso?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">
                <strong className="text-foreground">¡Inmediatamente!</strong> Tan pronto como se confirme el pago (generalmente instantáneo),
                recibes el link de acceso por email. ¡En 2 minutos ya estás creando contenido!
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
