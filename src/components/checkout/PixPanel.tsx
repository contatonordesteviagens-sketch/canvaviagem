import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Copy, ExternalLink, Loader2, QrCode, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";
import { cn } from "@/lib/utils";
import { CHECKOUT_PLANS, type CheckoutCycle } from "./checkout-plans";

/**
 * Vira true quando a Woovi estiver com o Pix Automático (recorrente) ligado.
 * Enquanto for false, a página fala a verdade: o Pix paga o período e avisamos antes de vencer.
 */
export const PIX_RENOVA_SOZINHO = false;

type Charge = {
  correlationID: string;
  brCode: string;
  qrCodeImage: string | null;
  paymentLinkUrl: string | null;
  expiresDate: string | null;
};

const POLL_MS = 4000;
const TAX_ID_KEY = "cv-checkout-taxid";

// ─── CPF / CNPJ ──────────────────────────────────────────────────────────────
export function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 14);
}

export function formatTaxId(digits: string) {
  const d = onlyDigits(digits);
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function validCpf(d: string) {
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

function validCnpj(d: string) {
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(d[i]) * w, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}

export function isValidTaxId(value: string) {
  const d = onlyDigits(value);
  return d.length === 11 ? validCpf(d) : d.length === 14 ? validCnpj(d) : false;
}

function useCountdown(expiresDate: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresDate) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [expiresDate]);
  const remaining = expiresDate ? Math.max(0, Date.parse(expiresDate) - now) : null;
  const label = remaining === null
    ? ""
    : `${String(Math.floor(remaining / 60000)).padStart(2, "0")}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0")}`;
  return { remaining, label };
}

/**
 * Aba "Pix": CPF/CNPJ do titular → "Gerar Pix" → QR Code e copia-e-cola na própria página,
 * com confirmação automática (consulta a cada 4 s) e ida para a Fábrica quando pagar.
 * Fala com as funções woovi-create-charge / woovi-charge-status (contrato do agente da Woovi);
 * envia também `taxId` para o Pix Automático quando ele estiver ligado.
 */
export function PixPanel({ plan, onSwitchToCard }: { plan: CheckoutCycle; onSwitchToCard: () => void }) {
  const navigate = useNavigate();
  const { refreshSubscription } = useAuth();
  const info = CHECKOUT_PLANS[plan];
  const [taxId, setTaxId] = useState(() => {
    try { return formatTaxId(sessionStorage.getItem(TAX_ID_KEY) || ""); } catch { return ""; }
  });
  const [touched, setTouched] = useState(false);
  const [charge, setCharge] = useState<Charge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const { remaining, label } = useCountdown(charge?.expiresDate ?? null);
  const expired = remaining === 0;
  const taxIdOk = isValidTaxId(taxId);
  const digits = onlyDigits(taxId);

  const createCharge = useCallback(async () => {
    if (!isValidTaxId(taxId)) {
      setTouched(true);
      return;
    }
    setLoading(true);
    setError(null);
    setCharge(null);
    try {
      try { sessionStorage.setItem(TAX_ID_KEY, onlyDigits(taxId)); } catch { /* sem storage */ }
      const { data, error: fnError } = await supabase.functions.invoke("woovi-create-charge", {
        body: { plan, taxId: onlyDigits(taxId) },
      });
      if (fnError || !data?.brCode) throw new Error(data?.error || fnError?.message || "Falha ao gerar o Pix");
      setCharge(data as Charge);
      trackMetaEvent("InitiateCheckout", { value: info.valueCents / 100, currency: "BRL", content_name: `Canva Viagem ${info.name}`, content_category: "pix" });
    } catch (err) {
      console.error("[Checkout Pix] Falha ao criar cobrança:", err);
      setError("O Pix não respondeu agora. Tente de novo em instantes ou pague no cartão.");
    } finally {
      setLoading(false);
    }
  }, [plan, taxId, info.name, info.valueCents]);

  // Troca de plano: zera a cobrança (o valor mudou).
  useEffect(() => {
    setCharge(null);
    setError(null);
    setPaid(false);
  }, [plan]);

  useEffect(() => {
    if (!charge || paid || expired) return;
    let stopped = false;
    const tick = async () => {
      const { data } = await supabase.functions.invoke("woovi-charge-status", { body: { correlationID: charge.correlationID } });
      if (stopped || data?.status !== "COMPLETED") return;
      stopped = true;
      setPaid(true);
      trackMetaEvent("Purchase", { value: info.valueCents / 100, currency: "BRL", content_name: "Canva Viagem Elite", content_category: `pix_${plan}`, content_type: "product" }, undefined, `purchase_${charge.correlationID}`);
      toast.success("Pix confirmado! Liberando sua Fábrica…");
      await refreshSubscription().catch(() => undefined);
      window.setTimeout(() => navigate("/fabrica"), 1500);
    };
    const id = window.setInterval(() => void tick(), POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [charge, paid, expired, plan, info.valueCents, refreshSubscription, navigate]);

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
    <section aria-labelledby="checkout-pix" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      {paid ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="h-14 w-14 text-emerald-600" />
          <p className="text-lg font-bold">Pagamento confirmado!</p>
          <p className="text-sm text-slate-500">Abrindo a Fábrica…</p>
        </div>
      ) : charge ? (
        <div className="flex flex-col items-center gap-4">
          <h2 id="checkout-pix" className="self-start text-[15px] font-bold text-slate-900">Pague com o app do seu banco</h2>
          <div className={cn("rounded-2xl border border-slate-200 bg-white p-3", expired && "opacity-30")}>
            {charge.qrCodeImage ? (
              <img src={charge.qrCodeImage} alt="QR Code Pix" width={220} height={220} className="h-[220px] w-[220px]" />
            ) : (
              <div className="grid h-[220px] w-[220px] place-items-center text-xs text-slate-500">Use o código abaixo</div>
            )}
          </div>

          {expired ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-semibold text-red-600">Este Pix expirou.</p>
              <button type="button" onClick={() => void createCharge()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-bold text-white">
                <RefreshCw className="h-4 w-4" /> Gerar novo Pix
              </button>
            </div>
          ) : (
            <>
              <button type="button" onClick={() => void copy()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white transition-colors hover:bg-emerald-500">
                <Copy className="h-4 w-4" /> Copiar código Pix
              </button>
              <p className="w-full break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-[10px] leading-snug text-slate-500">{charge.brCode}</p>
              <div className="flex w-full items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Aguardando pagamento…</span>
                {label && <span>Expira em <b className="tabular-nums">{label}</b></span>}
              </div>
              {charge.paymentLinkUrl && (
                <a href={charge.paymentLinkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">
                  Abrir página de pagamento <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </>
          )}
          <p className="text-center text-[11px] leading-relaxed text-slate-500">
            Abra o app do seu banco, escolha Pix → "Pix Copia e Cola" ou leia o QR Code. A liberação é automática em segundos.
          </p>
        </div>
      ) : (
        <>
          <label htmlFor="checkout-taxid" className="block text-[14px] font-bold text-slate-900">CPF ou CNPJ do titular</label>
          <input
            id="checkout-taxid"
            inputMode="numeric"
            autoComplete="off"
            value={taxId}
            onChange={(e) => setTaxId(formatTaxId(e.target.value))}
            onBlur={() => setTouched(true)}
            placeholder="CPF ou CNPJ"
            aria-invalid={touched && !taxIdOk}
            className={cn(
              "mt-2 min-h-12 w-full rounded-xl border px-3.5 text-[16px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20",
              touched && !taxIdOk ? "border-red-400" : "border-slate-300",
            )}
          />
          {touched && !taxIdOk && (
            <p className="mt-1.5 text-[12px] font-semibold text-red-600">
              {digits.length < 11 ? "Digite o CPF (11 números) ou o CNPJ (14 números)." : "Esse número não confere. Revise os dígitos."}
            </p>
          )}
          <p className="mt-2.5 text-[12px] leading-5 text-slate-500">
            O documento identifica o titular do pagamento — use o do dono da conta que vai pagar.{" "}
            {PIX_RENOVA_SOZINHO
              ? <>A cobrança de <b>{info.priceLong}{info.per}</b> renova automaticamente.</>
              : <>Você paga <b>{info.priceLong}</b> agora e libera o período inteiro. Antes de vencer, mandamos um novo Pix por e-mail.</>}
          </p>

          {error && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] leading-5 text-amber-900">
              {error}{" "}
              <button type="button" onClick={onSwitchToCard} className="font-bold underline">Pagar no cartão</button>
            </div>
          )}

          <button
            type="button"
            onClick={() => void createCharge()}
            disabled={loading}
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7c5cff] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#6440e6] disabled:opacity-60"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando seu Pix…</> : <><QrCode className="h-4 w-4" /> Gerar Pix de {info.priceLong} →</>}
          </button>
        </>
      )}
    </section>
  );
}
