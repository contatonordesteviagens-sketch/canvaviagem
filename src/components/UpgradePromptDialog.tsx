import { useNavigate } from "react-router-dom";
import { Crown, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ELITE_OFFER, buildUpgradePath, type UpgradeFeature } from "@/lib/eliteOffer";

type UpgradePromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: UpgradeFeature;
  source?: string;
  title?: string;
  description?: string;
};

export function UpgradePromptDialog({
  open,
  onOpenChange,
  feature,
  source,
  title,
  description,
}: UpgradePromptDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = !user;
  const isPremiumOnlyFeature = feature !== "ad_export" && feature !== "carousel_export";

  const returnTo = typeof window !== "undefined"
    ? `${window.location.pathname}${window.location.search}`
    : "/";

  const promptTitle = isGuest && !isPremiumOnlyFeature
    ? "Crie sua conta gratuita para baixar"
    : title ?? (isGuest && isPremiumOnlyFeature
      ? "Este recurso faz parte do Plano Elite"
      : "Recurso exclusivo do Plano Elite");

  const promptDescription = isGuest && !isPremiumOnlyFeature
    ? "Sua conta gratuita libera 3 anúncios e 2 carrosséis para baixar. Seu projeto continua aqui depois do cadastro."
    : description ?? (isGuest && isPremiumOnlyFeature
      ? `Você pode conhecer e configurar este recurso gratuitamente. Para concluir esta ação, teste o Plano Elite por ${ELITE_OFFER.freeTrialDays} dias.`
      : `Desbloqueie este recurso agora e teste ${ELITE_OFFER.freeTrialDays} dias grátis.`);

  const handleUpgrade = () => {
    const path = buildUpgradePath(feature, returnTo);
    const separator = path.includes("?") ? "&" : "?";
    onOpenChange(false);
    navigate(source ? `${path}${separator}source=${encodeURIComponent(source)}` : path);
  };

  const handlePrimaryAction = () => {
    if (isGuest && !isPremiumOnlyFeature) {
      onOpenChange(false);
      navigate(`/auth?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }

    handleUpgrade();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {isGuest && !isPremiumOnlyFeature
              ? <UserPlus className="h-6 w-6 text-primary" />
              : <Crown className="h-6 w-6 text-primary" />}
          </div>
          <DialogTitle className="text-center text-xl">
            {promptTitle}
          </DialogTitle>
          <DialogDescription className="text-center">
            {promptDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full rounded-full" onClick={handlePrimaryAction}>
            {isGuest && !isPremiumOnlyFeature
              ? "Criar conta grátis"
              : isGuest && isPremiumOnlyFeature
                ? "Conhecer o Plano Elite"
                : `Liberar acesso por ${ELITE_OFFER.monthlyPrice}/mês`}
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Agora não
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradePromptDialog;
