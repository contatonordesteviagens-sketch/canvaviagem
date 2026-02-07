import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Redireciona para sucesso após pagamento
                return_url: `${window.location.origin}/sucesso`,
                payment_method_data: {
                    billing_details: {
                        // Pre-fill user data if available in context? 
                        // Elements handles most.
                    }
                }
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "Ocorreu um erro no pagamento.");
        } else {
            setMessage("Ocorreu um erro inesperado.");
        }

        if (error) {
            toast.error(error.message || "Erro no pagamento");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            {message && <div className="text-red-500 text-sm">{message}</div>}

            <Button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full h-12 text-lg bg-[#635BFF] hover:bg-[#534ac2]"
            >
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</>
                ) : (
                    <>
                        <Lock className="mr-2 h-4 w-4" />
                        Assinar Agora
                    </>
                )}
            </Button>

            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" /> Pagamento processado com segurança pela Stripe
            </p>
        </form>
    );
};
