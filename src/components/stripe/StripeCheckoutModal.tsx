
import { useCallback, useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { loadStripe } from "@stripe/stripe-js";
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Use public key from env or fallback (user provided)
const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_live_51SnPUhLXUoWoiE4TnMl4F5nX7vb1jLjYNqBvcJCJ9OGmq7KpMIBtaMDdGqheu1GU0hKgccdVb2R77zrxIzF3gvwt00TNCSsQ4s"
);

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StripeCheckoutModal({ open, onOpenChange }: Props) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchClientSecret = useCallback(async () => {
        try {
            setError(null);
            const { data, error } = await supabase.functions.invoke("create-subscription");

            if (error) {
                console.error("Function error:", error);
                throw new Error(error.message || "Erro ao conectar com servidor");
            }

            if (data?.error) {
                throw new Error(data.error);
            }

            setClientSecret(data.clientSecret);
        } catch (err: any) {
            console.error("Checkout invalid:", err);
            setError(err.message);
            toast.error(`Erro: ${err.message}`);
        }
    }, []);

    useEffect(() => {
        if (open && !clientSecret) {
            fetchClientSecret();
        }
    }, [open, clientSecret, fetchClientSecret]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden bg-white">
                {error ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <p className="text-destructive font-bold">{error}</p>
                        <button onClick={() => window.location.reload()} className="underline">Recarregar</button>
                    </div>
                ) : clientSecret ? (
                    <EmbeddedCheckoutProvider
                        stripe={stripePromise}
                        options={{ clientSecret }}
                    >
                        <EmbeddedCheckout className="h-full w-full" />
                    </EmbeddedCheckoutProvider>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
