import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Copy, Loader2, QrCode, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";
import { ELITE_OFFER } from "@/lib/eliteOffer";
import { cn } from "@/lib/utils";
import { BLACK_FRIDAY_PLANS, type CheckoutOffer } from "@/components/checkout/checkout-plans";

export type PixPlan = "monthly" | "semiannual" | "annual";

export const PIX_PLAN_INFO: Record<PixPlan, { label: string; price: string; value: number; period: string }> = {
  monthly: { label: "Elite Mensal", price: ELITE_OFFER.monthlyPrice, value: 97, period: "30 dias de acesso" },
  semiannual: { label: "Elite Semestral", price: ELITE_OFFER.semiannualPrice, value: 347, period: "6 meses de acesso" },
  annual: { label: "Elite Anual", price: ELITE_OFFER.annualPrice, value: 482, period: "12 meses de acesso" },
};

const pixInfo = (plan: PixPlan, offer: CheckoutOffer) => {
  const info = PIX_PLAN_INFO[plan];
  if (!offer) return info;
  const bf = BLACK_FRIDAY_PLANS[plan];
  return { ...info, label: `${info.label} · Black`, price: bf.price, value: bf.valueCents / 100 };
};

export function isPixPlan(value: unknown): value is PixPlan {
  return value === "monthly" || value === "semiannual" || value === "annual";
}

/** Caminho da página /pix (exige login; usado por quem não está logado e pelo e-mail de renovação). */
export function pixCheckoutPath(plan: PixPlan) {
  return `/pix?plano=${plan}`;
}

type Charge = {
  correlationID: string;
  brCode: string;
  qrCodeImage: string | null;
  paymentLinkUrl: string | null;
  expiresDate: string | null;
};

const POLL_MS = 4000;
const NUDGE_MS = 10 * 60 * 1000;

/**
 * Enquanto false, o botão "Pagar com Pix" só aparece para admins (fase de testes).
 * Troque para true para liberar para todos os clientes.
 */
export const PIX_ENABLED_FOR_EVERYONE = true;

function useCountdown(expiresDate: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresDate) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [expiresDate]);
  const remaining = expiresDate ? Math.max(0, Date.parse(expiresDate) - now) : null;
  const label = remaining === null ? "" : `${String(Math.floor(remaining / 60000)).padStart(2, "0")}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0")}`;
  return { remaining, label };
}

export function PixCheckoutModal({
  open,
  onOpenChange,
  plan,
  redirectTo = "/fabrica",
  quick = false,
  offer = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PixPlan;
  redirectTo?: string;
  /** Black Friday: o servidor cobra o valor da Black. */
  offer?: CheckoutOffer;
  /** No quiz: relógio de 10 minutos para incentivar o pagamento. O Pix continua valendo depois dele. */
  quick?: boolean;
}) {
  const navigate = useNavigate();
  const { refreshSubscription } = useAuth();
  const info = pixInfo(plan, offer);
  const [charge, setCharge] = useState<Charge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const requestedRef = useRef<string | null>(null);
  const { remaining, label } = useCountdown(charge?.expiresDate ?? null);
  const expired = remaining === 0;
  const [nudgeEnd, setNudgeEnd] = useState<string | null>(null);
  const nudge = useCountdown(quick ? nudgeEnd : null);
  const timerLabel = quick ? nudge.label : label;
  const timerOver = quick && nudge.remaining === 0;

  const createCharge = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCharge(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("woovi-create-charge", { body: { plan, quick, ...(offer ? { offer } : {}) } });
      if (fnError || !data?.brCode) throw new Error(data?.error || fnError?.message || "Falha ao gerar o Pix");
      setCharge(data as Charge);
      setNudgeEnd(new Date(Date.now() + NUDGE_MS).toISOString());
      trackMetaEvent("InitiateCheckout", { value: info.value, currency: "BRL", content_name: `Canva Viagem ${info.label}`, content_category: "pix" });
    } catch (err) {
      console.error("[Pix] Falha ao criar cobrança:", err);
      setError("Não foi possível gerar o Pix agora. Tente de novo em instantes.");
    } finally {
      setLoading(false);
    }
  }, [plan, quick, offer, info.label, info.value]);

  // Gera uma cobrança por abertura do modal (por plano).
  useEffect(() => {
    if (!open) {
      requestedRef.current = null;
      setPaid(false);
      return;
    }
    if (requestedRef.current === plan) return;
    requestedRef.current = plan;
    void createCharge();
  }, [open, plan, createCharge]);

  // Confirmação automática: consulta a cada 4s enquanto o modal está aberto.
  useEffect(() => {
    if (!open || !charge || paid || expired) return;
    let stopped = false;
    const tick = async () => {
      const { data } = await supabase.functions.invoke("woovi-charge-status", { body: { correlationID: charge.correlationID } });
      if (stopped || data?.status !== "COMPLETED") return;
      stopped = true;
      setPaid(true);
      trackMetaEvent("Purchase", { value: info.value, currency: "BRL", content_name: "Canva Viagem Elite", content_category: `pix_${plan}`, content_type: "product" }, undefined, `purchase_${charge.correlationID}`);
      toast.success("Pix confirmado!");
      await refreshSubscription().catch(() => undefined);
      window.setTimeout(() => {
        onOpenChange(false);
        navigate(redirectTo);
      }, 1500);
    };
    const id = window.setInterval(() => void tick(), POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [open, charge, paid, expired, plan, info.value, refreshSubscription, onOpenChange, navigate, redirectTo]);

  const copy = async () => {
    if (!charge) return;
    try {
      await navigator.clipboard.writeText(charge.brCode);
      toast.success("Código Pix copiado! Cole no app do seu banco.");
    } catch {
      toast.error("Não deu para copiar. Selecione o código e copie manualmente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-600" /> Pagar com Pix
          </DialogTitle>
          <DialogDescription>
            {info.label} · <b>{info.price}</b> · {info.period}
          </DialogDescription>
        </DialogHeader>

        {paid ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-600" />
            <p className="text-lg font-bold">Pagamento confirmado!</p>
            <p className="text-sm text-muted-foreground">Liberando o seu acesso…</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-3 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" /> Gerando seu Pix…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button type="button" onClick={() => void createCharge()} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">
              <RefreshCw className="h-4 w-4" /> Tentar de novo
            </button>
          </div>
        ) : charge ? (
          <div className="flex flex-col items-center gap-3">
            {!expired && timerOver ? (
              <p className="w-full rounded-xl bg-amber-50 px-3 py-2 text-center text-[14px] font-semibold text-amber-900">
                Seu tempo acabou, mas este Pix continua valendo. Faça o pagamento para liberar o acesso.
              </p>
            ) : !expired && timerLabel && (
              <p className="w-full rounded-xl bg-emerald-50 py-2 text-center text-[14px] font-semibold text-emerald-800">
                Pague em <b className="tabular-nums text-[18px]">{timerLabel}</b>
              </p>
            )}
            <div className={cn("rounded-2xl border bg-white p-2", expired && "opacity-30")}>
              {charge.qrCodeImage ? (
                <img src={charge.qrCodeImage} alt="QR Code Pix" width={200} height={200} className="h-[200px] w-[200px]" />
              ) : (
                <div className="grid h-[200px] w-[200px] place-items-center text-xs text-muted-foreground">Use o código abaixo</div>
              )}
            </div>

            {expired ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-sm font-semibold text-red-600">Este Pix expirou.</p>
                <button type="button" onClick={() => void createCharge()} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">
                  <RefreshCw className="h-4 w-4" /> Gerar novo Pix
                </button>
              </div>
            ) : (
              <>
                <button type="button" onClick={() => void copy()} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-[16px] font-bold text-white hover:bg-emerald-700">
                  <Copy className="h-5 w-5" /> Copiar código Pix
                </button>
                <p className="line-clamp-2 w-full break-all rounded-lg bg-muted px-3 py-2 font-mono text-[10px] leading-snug text-muted-foreground">{charge.brCode}</p>
                <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Aguardando pagamento. A liberação é automática.
                </p>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Botão "Pagar com Pix". Logado → abre o modal. Sem login → vai para /login e volta em /pix.
 */
export function PayWithPixButton({
  plan,
  className,
  children,
  redirectTo,
  quick,
  offer = null,
}: {
  plan: PixPlan;
  className?: string;
  children?: React.ReactNode;
  redirectTo?: string;
  quick?: boolean;
  offer?: CheckoutOffer;
}) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!PIX_ENABLED_FOR_EVERYONE && !isAdmin) return null;

  const onClick = () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(pixCheckoutPath(plan))}`);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/40 py-2.5 text-[12px] font-bold text-emerald-700 transition-colors hover:bg-emerald-50",
          className,
        )}
      >
        {children ?? (<><QrCode className="h-4 w-4" /> Pagar com Pix</>)}
      </button>
      {user && <PixCheckoutModal open={open} onOpenChange={setOpen} plan={plan} redirectTo={redirectTo} quick={quick} offer={offer} />}
    </>
  );
}
