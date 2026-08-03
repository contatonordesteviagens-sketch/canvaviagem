import { memo } from "react";
import { UpgradePromptDialog } from "@/components/UpgradePromptDialog";

const PremiumGateModalComponent = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <UpgradePromptDialog
    open={isOpen}
    onOpenChange={(open) => !open && onClose()}
    feature="premium_content"
    source="premium_library"
  />
);

export const PremiumGateModal = memo(PremiumGateModalComponent);
