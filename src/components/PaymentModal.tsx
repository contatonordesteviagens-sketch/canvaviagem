import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, QrCode, Copy, CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmCard: () => void;
    isLoading: boolean;
}

export const PaymentModal = ({ isOpen, onClose, onConfirmCard, isLoading }: PaymentModalProps) => {
    const [paymentMethod, setPaymentMethod] = useState<"selection" | "pix">("selection");

    const pixKey = "financeiro@rochadigitalmidia.com.br";
    const whatsappNumber = "5585986411294"; // Updated to match the one found in code previously

    const handleCopyPix = () => {
        navigator.clipboard.writeText(pixKey);
        toast.success("Chave PIX copiada!");
    };

    const handleWhatsApp = () => {
        const message = encodeURIComponent("Olá! Fiz o pagamento do Canva Viagem via PIX e gostaria de liberar meu acesso. Segue o comprovante:");
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    };

    const resetModal = () => {
        setPaymentMethod("selection");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={resetModal}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">
                        {paymentMethod === "selection" ? "Como você prefere pagar?" : "Pagamento via PIX"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {paymentMethod === "selection"
                            ? "Escolha a forma mais prática para você liberar seu acesso."
                            : "Faça o PIX e envie o comprovante para liberação imediata."}
                    </DialogDescription>
                </DialogHeader>

                {paymentMethod === "selection" ? (
                    <div className="grid gap-4 py-4">
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col items-center justify-center gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                            onClick={onConfirmCard}
                            disabled={isLoading}
                        >
                            <CreditCard className="h-6 w-6 text-primary" />
                            <span className="font-semibold text-lg">Cartão de Crédito</span>
                            <span className="text-xs text-muted-foreground font-normal">Liberação automática imediata</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-20 flex flex-col items-center justify-center gap-2 border-2 hover:border-accent hover:bg-accent/5 transition-all"
                            onClick={() => setPaymentMethod("pix")}
                        >
                            <QrCode className="h-6 w-6 text-accent" />
                            <span className="font-semibold text-lg">PIX</span>
                            <span className="text-xs text-muted-foreground font-normal">Liberação manual (WhatsApp)</span>
                        </Button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                            <Lock className="h-3 w-3" />
                            <span>Pagamento 100% Seguro e Criptografado</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 py-2">
                        <div className="bg-secondary/30 p-4 rounded-lg border-2 border-dashed border-primary/20 flex flex-col items-center gap-3">
                            <div className="bg-white p-2 rounded-lg">
                                <QrCode className="h-24 w-24 text-black" />
                            </div>
                            <div className="text-center w-full">
                                <p className="text-xs text-muted-foreground mb-1">Chave E-mail</p>
                                <div className="flex items-center gap-2 bg-background border p-2 rounded-md w-full">
                                    <code className="text-sm flex-1 truncate">{pixKey}</code>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCopyPix}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold"
                                onClick={handleWhatsApp}
                            >
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                DÁ O OK NO ZAP
                            </Button>
                            <p className="text-xs text-center text-muted-foreground px-4">
                                Importante: Após o pagamento, é **obrigatório** enviar o comprovante no WhatsApp para ativarmos sua conta.
                            </p>
                        </div>

                        <div className="pt-2 text-center">
                            <Button variant="link" size="sm" onClick={() => setPaymentMethod("selection")} className="text-muted-foreground">
                                Voltar para opções
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
