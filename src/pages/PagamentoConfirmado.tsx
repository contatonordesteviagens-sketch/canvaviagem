import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { BrandMark } from "@/components/cv-cream/shared";
import "@/components/cv-cream/cream.css";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/** Depois do Pix: a pessoa confere o e-mail de acesso, que é o que ela usa para entrar em outro aparelho. */
export default function PagamentoConfirmado() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [current, setCurrent] = useState<string | null>(null);
  const email = current ?? user?.email ?? "";
  const [editing, setEditing] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const value = typed.toLowerCase().trim();
    const { data, error: fnError } = await supabase.functions.invoke("confirm-purchase-email", { body: { email: value } });
    setBusy(false);
    if (fnError || !data?.ok) {
      let message = data?.error as string | undefined;
      const response = (fnError as { context?: Response } | null)?.context;
      if (!message && response) message = await response.json().then((b) => b?.error).catch(() => undefined);
      setError(message || "Não foi possível trocar o e-mail agora. Tente de novo.");
      return;
    }
    await supabase.auth.refreshSession().catch(() => undefined);
    setCurrent(value);
    setChanged(Boolean(data.changed));
    setEditing(false);
  };

  return (
    <div className="cv-cream flex min-h-[100dvh] flex-col px-4">
      <Helmet><title>Pagamento confirmado — Canva Viagem</title></Helmet>
      <header className="flex justify-center pt-5"><BrandMark size={32} withName={false} /></header>
      <main className="flex flex-1 items-start justify-center pb-10 pt-8 sm:items-center">
        <div className="cv-card cv-pop w-full max-w-[440px] p-6 text-center shadow-[0_24px_50px_-30px_rgba(32,28,19,.35)] sm:p-8">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h1 className="mt-3 text-[26px] font-extrabold leading-tight tracking-[-0.02em]">Pagamento confirmado!</h1>
          <p className="mt-2 text-[15px] leading-6" style={{ color: "var(--cv-muted)" }}>
            Confira o seu e-mail de acesso. É com ele que você entra em qualquer aparelho.
          </p>

          {editing ? (
            <form onSubmit={save} className="mt-5 text-left">
              <div className="flex items-center gap-3 rounded-full border bg-white px-4" style={{ borderColor: "var(--cv-line)" }}>
                <Mail className="h-5 w-5 shrink-0" style={{ color: "var(--cv-muted)" }} />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  aria-label="E-mail correto"
                  placeholder="voce@suaagencia.com"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  required
                  disabled={busy}
                  className="h-14 w-full bg-transparent text-[16px] outline-none placeholder:text-[#9b917d]"
                />
              </div>
              {error && <p role="alert" className="mt-2 text-[14px] font-semibold" style={{ color: "#b3261e" }}>{error}</p>}
              <button type="submit" disabled={busy} className="cv-btn mt-3 h-14 w-full text-[16px]">
                {busy ? <><Loader2 className="h-5 w-5 animate-spin" /> Um instante…</> : "Salvar e-mail"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="mt-3 w-full text-center text-[14px] font-semibold" style={{ color: "var(--cv-muted)" }}>
                Voltar
              </button>
            </form>
          ) : (
            <>
              <p className="mt-5 break-all rounded-2xl p-4 text-[18px] font-extrabold" style={{ background: "var(--cv-sand)" }}>{email}</p>
              {changed && <p role="status" className="mt-2 text-[14px] font-semibold text-emerald-700">E-mail corrigido. Mandamos a confirmação para ele.</p>}
              <button type="button" onClick={() => navigate("/fabrica")} className="cv-btn mt-4 h-14 w-full text-[16px]">
                Sim, está correto <ArrowRight className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => { setTyped(email); setEditing(true); }} className="mt-3 w-full text-center text-[15px] font-bold underline">
                Corrigir o e-mail
              </button>
              <p className="mt-5 text-[13px] leading-5" style={{ color: "var(--cv-muted)" }}>
                Também mandamos a confirmação da compra para esse e-mail, com o link para entrar em outro aparelho.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
