import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plane, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const translations = {
  pt: {
    welcome: "Bem-vindo(a) a bordo!",
    activated: "Sua assinatura foi ativada com sucesso!",
    plan: "Plano Ativo: Assinatura Mensal",
    fullAccess: "Agora você tem acesso completo a todos os recursos do Canva Viagens!",
    unlocked: "✅ Recursos liberados:",
    features: [
      "Vídeos Reels editáveis",
      "Artes para Feed e Stories",
      "Legendas prontas",
      "Ferramentas de IA",
      "Downloads ilimitados",
    ],
    redirect: "Redirecionando para a plataforma em",
    seconds: "segundos...",
    accessNow: "Acessar Plataforma Agora",
  },
  en: {
    welcome: "Welcome aboard!",
    activated: "Your subscription has been activated successfully!",
    plan: "Active Plan: Monthly Subscription",
    fullAccess: "You now have full access to all Canva Viagens features!",
    unlocked: "✅ Unlocked features:",
    features: [
      "Editable Reels Videos",
      "Feed and Stories Designs",
      "Ready-to-use Captions",
      "AI Tools",
      "Unlimited Downloads",
    ],
    redirect: "Redirecting to the platform in",
    seconds: "seconds...",
    accessNow: "Access Platform Now",
  },
  es: {
    welcome: "¡Bienvenido/a a bordo!",
    activated: "¡Tu suscripción ha sido activada con éxito!",
    plan: "Plan Activo: Suscripción Mensual",
    fullAccess: "¡Ahora tienes acceso completo a todos los recursos de Canva Viagens!",
    unlocked: "✅ Recursos liberados:",
    features: [
      "Videos Reels editables",
      "Diseños para Feed y Stories",
      "Leyendas listas",
      "Herramientas de IA",
      "Descargas ilimitadas",
    ],
    redirect: "Redirigiendo a la plataforma en",
    seconds: "segundos...",
    accessNow: "Acceder a la Plataforma Ahora",
  },
};

const Sucesso = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useAuth();
  const { language } = useLanguage();
  const [countdown, setCountdown] = useState(5);

  const t = translations[language] || translations.pt;

  useEffect(() => {
    // Refresh subscription status
    refreshSubscription();

    // Countdown and redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, refreshSubscription]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center border-primary/20 shadow-2xl">
        <CardContent className="pt-12 pb-8 px-8 space-y-6">
          {/* Success Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6" />
              {t.welcome}
              <Sparkles className="h-6 w-6" />
            </h1>
            <p className="text-xl text-foreground">
              {t.activated}
            </p>
          </div>

          {/* Info */}
          <div className="bg-primary/10 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <Plane className="h-5 w-5" />
              <span>{t.plan}</span>
            </div>
            <p className="text-muted-foreground">
              {t.fullAccess}
            </p>
          </div>

          {/* Features unlocked */}
          <div className="text-left space-y-2 bg-muted/50 rounded-lg p-4">
            <p className="font-semibold text-sm text-foreground mb-3">{t.unlocked}</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {t.features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>

          {/* Redirect countdown */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t.redirect}{" "}
              <span className="font-bold text-primary">{countdown}</span> {t.seconds}
            </p>
            <Button onClick={() => navigate("/")} className="w-full" size="lg">
              <Plane className="mr-2 h-4 w-4" />
              {t.accessNow}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sucesso;
