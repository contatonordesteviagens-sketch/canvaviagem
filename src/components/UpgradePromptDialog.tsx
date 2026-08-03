import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

  const handleUpgrade = () => {
    const returnTo = typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : undefined;
    const path = buildUpgradePath(feature, returnTo);
    const separator = path.includes("?") ? "&" : "?";
    onOpenChange(false);
    navigate(source ? `${path}${separator}source=${encodeURIComponent(source)}` : path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {title ?? "Recurso exclusivo do plano Elite"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description
              ?? `Desbloqueie este recurso agora e teste ${ELITE_OFFER.freeTrialDays} dias grátis.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full rounded-full" onClick={handleUpgrade}>
            Liberar acesso por {ELITE_OFFER.monthlyPrice}/mês
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
