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

export const PremiumGateModal = ({ isOpen, onClose }: PremiumGateModalProps) => {
  const { language, t } = useLanguage();

  const translations = {
    pt: {
      title: "Conteúdo Exclusivo Premium",
      description: "Este recurso é exclusivo para assinantes Premium. Assine agora e tenha acesso ilimitado a todo o conteúdo!",
      price: "R$ 29,00",
      period: "/mês",
      cta: "Assinar Premium Agora",
      close: "Voltar",
      features: [
        "+250 templates de vídeos editáveis",
        "Legendas prontas ilimitadas",
        "Ferramentas de IA exclusivas",
        "Novos conteúdos toda semana",
      ],
    },
    es: {
      title: "Contenido Exclusivo Premium",
      description: "Esta función es exclusiva para suscriptores Premium. ¡Suscríbete ahora y obtén acceso ilimitado a todo el contenido!",
      price: "$9,09",
      period: "/mes",
      cta: "Suscribirse Premium Ahora",
      close: "Volver",
      features: [
        "+250 plantillas de videos editables",
        "Subtítulos listos ilimitados",
        "Herramientas de IA exclusivas",
        "Contenido nuevo cada semana",
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
          <div className="text-center py-4 bg-secondary/50 rounded-xl">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-primary">{content.price}</span>
              <span className="text-muted-foreground">{content.period}</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => {
              window.open(checkoutUrl, '_blank');
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
