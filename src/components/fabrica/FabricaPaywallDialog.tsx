import { UpgradePromptDialog } from "@/components/UpgradePromptDialog";
import type { UpgradeFeature } from "@/lib/eliteOffer";

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
  return (
    <UpgradePromptDialog
      open={open}
      onOpenChange={onOpenChange}
      feature={feature}
      source="fabrica_paywall"
      title={title}
      description={description}
    />
  );
}
