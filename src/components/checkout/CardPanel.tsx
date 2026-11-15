import { getMetaMatchData } from "@/lib/meta-match";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { CreditCard, ExternalLink, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ELITE_OFFER, withCheckoutIdentity } from "@/lib/eliteOffer";
import type { CheckoutCycle, CheckoutOffer } from "./checkout-plans";

// Mesma chave pública usada no StripeCheckoutModal.
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_live_51SnPUhLXUoWoiE4TnMl4F5nX7vb1jLjYNqBvcJCJ9OGmq7KpMIBtaMDdGqheu1GU0hKgccdVb2R77zrxIzF3gvwt00TNCSsQ4s",
);

const PAYMENT_LINK: Record<CheckoutCycle, string> = {
  monthly: ELITE_OFFER.monthlyCheckoutUrl,
  semiannual: ELITE_OFFER.semiannualCheckoutUrl,
  annual: ELITE_OFFER.annualCheckoutUrl,
};

type State =
  | { kind: "loading" }
  | { kind: "embedded"; clientSecret: string }
  | { kind: "redirect"; url: string }
  | { kind: "error" };

/**
 * Aba "Cartão": o formulário da Stripe aparece dentro da página (checkout embutido).
 * Se a função ainda não souber responder em modo embutido (ou falhar), mostra um botão
 * que leva para a página segura da Stripe com a conta logada identificada. Nunca fica sem saída.
 */
export function CardPanel({ plan, offer = null }: { plan: CheckoutCycle; offer?: CheckoutOffer }) {
  const { user } = useAuth();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });
    // O link fixo cobra o preço cheio: na oferta, melhor avisar do que cobrar o valor errado.
    const fail = () => setState(offer ? { kind: "error" } : { kind: "redirect", url: withCheckoutIdentity(PAYMENT_LINK[plan], user) });
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: { billing_cycle: plan, ui_mode: "embedded", return_to: "/fabrica", ...(offer ? { offer } : {}), ...getMetaMatchData() },
        });
        if (cancelled) return;
        if (!error && typeof data?.clientSecret === "string" && data.clientSecret) {
          setState({ kind: "embedded", clientSecret: data.clientSecret });
          return;
        }
        if (!error && typeof data?.url === "string" && data.url) {
          setState({ kind: "redirect", url: data.url });
          return;
        }
        fail();
      } catch (err) {
        console.error("[Checkout] create-checkout falhou:", err);
        if (!cancelled) fail();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [plan, user, offer]);

  return (
    <section aria-labelledby="checkout-cartao" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 id="checkout-cartao" className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
        <CreditCard className="h-4 w-4 text-slate-500" /> Cartão
      </h2>
      <p className="mt-1 text-[12px] text-slate-500">Crédito, Apple Pay e Google Pay. Renova sozinho; cancele quando quiser.</p>

      <div className="mt-4">
        {state.kind === "loading" && (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 text-[13px] text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin" /> Abrindo o pagamento seguro…
          </div>
        )}

        {state.kind === "error" && (
          <p className="rounded-xl bg-slate-50 p-4 text-[13px] leading-5 text-slate-700">Não foi possível abrir o pagamento agora. Tente de novo em instantes ou pague com Pix.</p>
        )}

        {state.kind === "embedded" && (
          <div className="-mx-2 sm:mx-0">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: state.clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}

        {state.kind === "redirect" && (
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-[13px] leading-5 text-slate-700">
              Você conclui o pagamento em uma página segura da Stripe, já com o seu e-mail preenchido. Depois de pagar, voltamos para a Fábrica.
            </p>
            <a
              href={state.url}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7c5cff] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#6440e6]"
            >
              Continuar para o cartão <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <Lock className="h-3 w-3" /> Pagamento processado pela Stripe · dados criptografados
      </p>
    </section>
  );
}
