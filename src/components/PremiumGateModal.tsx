import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Checkout links by language
const STRIPE_LINKS = {
  pt: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
  es: "https://buy.stripe.com/bJedRa3TIej6cz15gE8so04",
};

interface PremiumGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useNavigate } from "react-router-dom";

export const PremiumGateModal = ({ isOpen, onClose }: PremiumGateModalProps) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const translations = {
    pt: {
      title: "🎁 Teste Grátis por 3 Dias!",
      description: "Experimente TUDO sem pagar nada! Cancele quando quiser.",
      price: "R$ 29,00",
      period: "/mês",
      trial: "Após 3 dias de teste grátis",
      cta: "Começar Teste Grátis Agora",
      close: "Voltar",
      features: [
        "✅ 3 dias grátis para testar tudo",
        "+250 templates de vídeos editáveis",
        "Legendas prontas ilimitadas",
        "Ferramentas de IA exclusivas",
        "Cancele quando quiser, sem taxas",
      ],
    },
    es: {
      title: "🎁 ¡Prueba Gratis por 3 Días!",
      description: "¡Prueba TODO sin pagar nada! Cancela cuando quieras.",
      price: "$9,09",
      period: "/mes",
      trial: "Después de 3 días de prueba gratis",
      cta: "Comenzar Prueba Gratis Ahora",
      close: "Volver",
      features: [
        "✅ 3 días gratis para probar todo",
        "+250 plantillas de videos editables",
        "Subtítulos listos ilimitados",
        "Herramientas de IA exclusivas",
        "Cancela cuando quieras, sin cargos",
      ],
    },
  };

  const content = translations[language] || translations.pt;
  const checkoutUrl = STRIPE_LINKS[language] || STRIPE_LINKS.pt;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Features */}
          <div className="space-y-3">
            {content.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-accent" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="text-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-2 border-green-200 dark:border-green-800">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-1">🎁 Teste Grátis por 3 Dias</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-primary">{content.price}</span>
              <span className="text-muted-foreground">{content.period}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{content.trial}</p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => {
              // Navigate to plans page instead of direct checkout
              navigate("/planos");
              onClose();
            }}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold py-6 text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {content.cta}
          </Button>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            {content.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
