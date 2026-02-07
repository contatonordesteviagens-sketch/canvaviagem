import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { CheckoutForm } from "./CheckoutForm";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface StripeCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StripeCheckoutModal = ({ isOpen, onClose }: StripeCheckoutModalProps) => {
    const { user } = useAuth();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [guestEmail, setGuestEmail] = useState("");
    const [step, setStep] = useState<"email" | "payment">("email");

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            if (user) {
                setStep("payment"); // Skip email step if logged in
                setGuestEmail(user.email || "");
            } else {
                setStep("email");
                setClientSecret(null);
            }
        }
    }, [isOpen, user]);

    // Trigger payment initialization when step becomes 'payment'
    useEffect(() => {
        const createSubscription = async () => {
            if (!isOpen || step !== "payment" || clientSecret) return; // Prevent double call

            setIsLoading(true);
            try {
                let headers: any = {};
                let body: any = {};

                if (user) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        headers.Authorization = `Bearer ${session.access_token}`;
                    }
                } else {
                    if (!guestEmail) throw new Error("Email required");
                    body.email = guestEmail;
                }

                const { data, error } = await supabase.functions.invoke("create-subscription", {
                    headers,
                    body
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
                if (!user) setStep("email"); // Go back to email if failed
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen && step === "payment") {
            createSubscription();
        }
    }, [isOpen, step, user, guestEmail, clientSecret]);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestEmail || !guestEmail.includes("@")) {
            toast.error("Digite um email válido.");
            return;
        }
        setStep("payment");
    };

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
                    <DialogTitle className="text-center text-xl font-bold">
                        {step === "email" ? "Identifique-se" : "Assinatura Premium"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {step === "email"
                            ? "Digite seu email para iniciar a assinatura e liberar seu acesso."
                            : "Complete seus dados de pagamento para liberar acesso imediato."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === "email" ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="pl-10 h-10"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-11">
                                Continuar <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    ) : isLoading ? (
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
