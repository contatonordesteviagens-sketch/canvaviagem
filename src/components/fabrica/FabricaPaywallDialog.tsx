import { Check, LockKeyhole } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { buildUpgradePath, type UpgradeFeature } from "@/lib/eliteOffer";

type FabricaPaywallDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: UpgradeFeature;
  title: string;
  description: string;
};

export function FabricaPaywallDialog({
  open,
  onOpenChange,
  feature,
  title,
  description,
}: FabricaPaywallDialogProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { track } = useEntitlements();
  const isSpanish = location.pathname.startsWith("/es");
  const isGuest = !user;

  const continueAccess = () => {
    if (isGuest) {
      const returnTo = `${location.pathname}${location.search}`;
      onOpenChange(false);
      navigate(`/auth?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }
    track("upgrade_clicked", { feature, source: "fabrica_paywall" });
    onOpenChange(false);
    navigate(buildUpgradePath(feature, location.pathname));
  };

  const displayedTitle = isGuest
    ? (isSpanish ? "Crea tu cuenta gratis para continuar" : "Crie sua conta grátis para continuar")
    : title;
  const displayedDescription = isGuest
    ? (
      isSpanish
        ? "Tu borrador sigue guardado en este dispositivo. Al crear la cuenta, puedes guardar el proyecto y usar tus descargas gratuitas sin registrar una tarjeta."
        : "Seu rascunho continua salvo neste dispositivo. Ao criar a conta, você pode salvar o projeto e usar seus downloads gratuitos sem cadastrar cartão."
    )
    : description;
  const benefits = isGuest
    ? (
      isSpanish
        ? [
          "1 proyecto guardado en tu cuenta",
          "3 anuncios y 2 carruseles gratuitos",
          "Sin tarjeta y sin cobro automático",
        ]
        : [
          "1 projeto salvo na sua conta",
          "3 anúncios e 2 carrosséis gratuitos",
          "Sem cartão e sem cobrança automática",
        ]
    )
    : (
      isSpanish
        ? [
          "Tu proyecto y tus ediciones siguen guardados",
          "Descargas ilimitadas de anuncios y carruseles",
          "Sitio publicado, CRM y automatizaciones liberados",
        ]
        : [
          "Seu projeto e suas edições continuam salvos",
          "Downloads ilimitados de anúncios e carrosséis",
          "Site publicado, CRM e automações liberados",
        ]
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-md rounded-lg border border-zinc-700 bg-[#111113] p-0 text-white">
        <div className="p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/10">
            <LockKeyhole className="h-5 w-5 text-amber-300" />
          </div>
          <DialogTitle className="text-xl font-black">{displayedTitle}</DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-white/55">
            {displayedDescription}
          </DialogDescription>
          <div className="mt-5 space-y-2 rounded-lg border border-white/10 bg-white/[0.035] p-4">
            {benefits.map((item) => (
              <p key={item} className="flex items-start gap-2 text-xs text-white/75">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                {item}
              </p>
            ))}
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="min-h-11 rounded-lg border border-white/15 px-4 text-sm font-bold text-white/70 hover:bg-white/[0.05]"
            >
              {isSpanish ? "Seguir editando" : "Continuar editando"}
            </button>
            <button
              type="button"
              onClick={continueAccess}
              className="min-h-11 rounded-lg bg-[#F5F906] px-4 text-sm font-black text-zinc-950 hover:bg-[#F5F906]/90"
            >
              {isGuest
                ? (isSpanish ? "Crear cuenta gratis" : "Criar conta grátis")
                : (isSpanish ? "Ver Plan Elite" : "Ver Plano Elite")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
