import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { CheckoutForm } from "./CheckoutForm";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StripeCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StripeCheckoutModal = ({ isOpen, onClose }: StripeCheckoutModalProps) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const createSubscription = async () => {
            if (!isOpen) return;

            setIsLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    toast.error("Você precisa estar logado.");
                    onClose();
                    return;
                }

                const { data, error } = await supabase.functions.invoke("create-subscription", {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`
                    }
                });

                if (error) throw error;

                if (data?.clientSecret) {
                    setClientSecret(data.clientSecret);
                } else {
                    throw new Error("Falha ao iniciar pagamento");
                }
            } catch (error) {
                console.error("Error creating subscription:", error);
                toast.error("Erro ao iniciar o checkout. Tente novamente.");
                onClose();
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen && !clientSecret) {
            createSubscription();
        }
    }, [isOpen, clientSecret, onClose]);

    const appearance = {
        theme: 'stripe' as const,
        labels: 'floating' as const,
    };

    const options = {
        clientSecret,
        appearance,
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">Assinatura Premium</DialogTitle>
                    <DialogDescription className="text-center">
                        Complete seus dados de pagamento para liberar acesso imediato.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Preparando checkout seguro...</p>
                        </div>
                    ) : clientSecret ? (
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm />
                        </Elements>
                    ) : (
                        <div className="text-center text-red-500">
                            Não foi possível carregar o formulário.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
