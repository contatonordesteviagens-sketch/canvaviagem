
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect } from "react";

interface StripeCheckoutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'stripe-buy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                'buy-button-id': string;
                'publishable-key': string;
            };
        }
    }
}

export function StripeCheckoutModal({ open, onOpenChange }: StripeCheckoutModalProps) {

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://js.stripe.com/v3/buy-button.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] flex flex-col items-center justify-center py-10">
                <h2 className="text-xl font-bold mb-6 text-center">Finalizar Assinatura</h2>

                {/* Stripe Buy Button provided by user */}
                <stripe-buy-button
                    buy-button-id="buy_btn_1Sy0KYLXUoWoiE4TMJIgGrJ6"
                    publishable-key="pk_live_51SnPUhLXUoWoiE4TnMl4F5nX7vb1jLjYNqBvcJCJ9OGmq7KpMIBtaMDdGqheu1GU0hKgccdVb2R77zrxIzF3gvwt00TNCSsQ4s"
                >
                </stripe-buy-button>

                <p className="text-sm text-muted-foreground mt-6 text-center">
                    Você será redirecionado para o ambiente seguro da Stripe.
                </p>
            </DialogContent>
        </Dialog>
    );
}
