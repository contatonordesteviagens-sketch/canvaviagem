import { useEffect, useState, type ComponentType } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Check, CreditCard, Lock, QrCode, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CardPanel } from "@/components/checkout/CardPanel";
import { PixPanel, PIX_RENOVA_SOZINHO } from "@/components/checkout/PixPanel";
import { CHECKOUT_PLANS, isCheckoutCycle, plansFor, type CheckoutCycle, type CheckoutOffer } from "@/components/checkout/checkout-plans";
import { cn } from "@/lib/utils";
import { isLocalPreviewEnabled } from "@/lib/localPreview";

type Method = "cartao" | "pix";

const METHODS: { id: Method; title: string; sub: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "cartao", title: "Cartão de Crédito", sub: "crédito, Apple Pay e Google Pay", icon: CreditCard },
  { id: "pix", title: PIX_RENOVA_SOZINHO ? "Pix Automático" : "Pix", sub: PIX_RENOVA_SOZINHO ? "paga agora e renova sozinho" : "paga agora, acesso na hora", icon: QrCode },
];

function PlanDetails({ plan, offer, compact = false }: { plan: CheckoutCycle; offer: CheckoutOffer; compact?: boolean }) {
  const info = plansFor(offer)[plan];
  return (
    <div className={cn("text-[13px]", !compact && "mt-4 border-t border-slate-200 pt-4")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{info.name}</p>
          <p className="text-[12px] text-slate-500">Artes, carrosséis, site e CRM · {info.billing}</p>
        </div>
        <span className="whitespace-nowrap font-semibold">{info.priceLong}</span>
      </div>
      <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
        <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="whitespace-nowrap font-semibold">{info.priceLong}</span></div>
        <div className="flex justify-between text-[14px]"><span className="font-bold">Total devido hoje</span><span className="whitespace-nowrap font-bold">{info.priceLong}</span></div>
      </div>
      <ul className="mt-4 space-y-1.5 text-[12px] text-slate-600">
        {["Artes ilimitadas com a sua logo", "Site da agência publicado", "CRM de clientes no WhatsApp"].map((f) => (
          <li key={f} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> {f}</li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] leading-5 text-slate-500">
        Cancele quando quiser, em 2 cliques, direto no seu painel — sem ligação, sem multa. 7 dias de garantia para testar com um pacote real.
      </p>
    </div>
  );
}

/**
 * /checkout?plano=monthly|semiannual|annual&metodo=cartao|pix
 * Última tela do quiz: a pessoa escolhe como pagar sem sair do site.
 * Cartão (padrão) = Stripe embutida. Pix = Woovi, com QR na própria página.
 */
export default function Checkout() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const rawPlan = params.get("plano");
  const plan: CheckoutCycle = isCheckoutCycle(rawPlan) ? rawPlan : "annual";
  const [method, setMethod] = useState<Method>(params.get("metodo") === "pix" ? "pix" : "cartao");
  const offer: CheckoutOffer = params.get("oferta") === "black-friday" ? "black-friday" : null;
  const info = plansFor(offer)[plan];

  // Quem já assina não precisa pagar de novo (no localhost a tela fica visível para testes).
  useEffect(() => {
    if (subscription.subscribed && !isLocalPreviewEnabled()) navigate("/fabrica", { replace: true });
  }, [subscription.subscribed, navigate]);

  const choose = (next: Method) => {
    setMethod(next);
    const nextParams = new URLSearchParams(params);
    nextParams.set("metodo", next);
    setParams(nextParams, { replace: true });
  };

  const changePlan = (next: CheckoutCycle) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("plano", next);
    setParams(nextParams, { replace: true });
  };

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900">
      <Helmet><title>Pagamento — Canva Viagem {info.name}</title></Helmet>

      <header className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/onboarding"))}
          aria-label="Voltar"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-[17px] font-extrabold tracking-tight">Canva Viagem</span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#7c5cff]" aria-hidden />
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        <div role="radiogroup" aria-label="Forma de pagamento" className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          {METHODS.map((m) => {
            const on = m.id === method;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => choose(m.id)}
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors",
                  on ? "border-[#7c5cff] bg-[#f6f3ff]" : "border-slate-200 bg-white hover:border-slate-300",
                )}
              >
                <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border-2", on ? "border-[#7c5cff]" : "border-slate-300")}>
                  {on && <span className="h-2.5 w-2.5 rounded-full bg-[#7c5cff]" />}
                </span>
                <Icon className={cn("h-5 w-5 shrink-0", on ? "text-[#6440e6]" : "text-slate-500")} />
                <span className="min-w-0">
                  <span className={cn("block text-[15px] font-bold leading-tight", on ? "text-[#6440e6]" : "text-slate-900")}>{m.title}</span>
                  <span className="block text-[12px] text-slate-500">{m.sub}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
          {/* Resumo: no celular só o essencial fica acima do pagamento; o restante desce. */}
          <aside className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 lg:sticky lg:top-6 lg:self-start">
            <p className="text-[13px] text-slate-500">Assinar Canva Viagem{offer ? " · Black Friday: 50% para sempre" : ""}</p>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[32px] font-extrabold leading-none tracking-tight">{info.priceLong}</span>
              <span className="text-[13px] text-slate-500">{info.per}</span>
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(CHECKOUT_PLANS) as CheckoutCycle[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => changePlan(c)}
                  aria-pressed={c === plan}
                  className={cn(
                    "min-h-9 rounded-full border px-3 text-[12px] font-semibold transition-colors",
                    c === plan ? "border-[#7c5cff] bg-white text-[#6440e6]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                  )}
                >
                  {CHECKOUT_PLANS[c].name.replace("Elite ", "")}
                </button>
              ))}
            </div>

            <div className="hidden lg:block"><PlanDetails plan={plan} offer={offer} /></div>
          </aside>

          {/* Painel do método */}
          <div>
            {method === "cartao" ? <CardPanel plan={plan} offer={offer} /> : <PixPanel plan={plan} offer={offer} onSwitchToCard={() => choose("cartao")} />}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 lg:hidden"><PlanDetails plan={plan} offer={offer} compact /></div>
          </div>
        </div>

        <footer className="mt-8 space-y-1 text-center text-[11px] text-slate-400">
          <p className="inline-flex items-center gap-1.5"><Lock className="h-3 w-3" /> Pagamento processado por {method === "pix" ? "Woovi (Pix)" : "Stripe"} · dados criptografados</p>
          <p className="flex items-center justify-center gap-1.5"><ShieldCheck className="h-3 w-3" /> {info.name} · Cancele quando quiser em canvaviagem.com</p>
        </footer>
      </main>
    </div>
  );
}
