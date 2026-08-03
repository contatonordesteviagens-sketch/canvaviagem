import { UpgradePromptDialog } from "@/components/UpgradePromptDialog";

interface FabricaUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FabricaUpgradeModal = ({ open, onOpenChange }: FabricaUpgradeModalProps) => (
  <UpgradePromptDialog
    open={open}
    onOpenChange={onOpenChange}
    feature="fabrica"
    source="header_marketing"
  />
);
