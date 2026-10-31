import { useEffect, useState } from "react";
import { SUPABASE_PUBLIC_KEY, SUPABASE_PUBLIC_URL } from "@/lib/supabase-public";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";

/**
 * Login com Google pelo Lovable Cloud (credenciais gerenciadas: o Supabase sozinho recusa com 400).
 * Depois do retorno, a sessão entra no Supabase e a própria página de login redireciona para
 * `redirectTo` (quiz, checkout...) ou / ou /inicio.
 */
// Botão desligado a pedido do Lucas: a tela do Google com o nome Lovable afastava leads.
let googleEnabledCache: boolean | null = false;

/** Pergunta ao projeto se o Google está ligado; se não estiver, o botão some em vez de abrir uma tela de erro. */
async function isGoogleEnabled(): Promise<boolean> {
  if (googleEnabledCache !== null) return googleEnabledCache;
  try {
    const res = await fetch(`${SUPABASE_PUBLIC_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_PUBLIC_KEY } });
    const data = await res.json();
    googleEnabledCache = Boolean(data?.external?.google);
  } catch {
    googleEnabledCache = false;
  }
  return googleEnabledCache;
}

function useGoogleEnabled() {
  const [enabled, setEnabled] = useState<boolean | null>(googleEnabledCache);
  useEffect(() => {
    let alive = true;
    isGoogleEnabled().then((ok) => { if (alive) setEnabled(ok); });
    return () => { alive = false; };
  }, []);
  return enabled;
}

export function GoogleSignInButton({ redirectTo }: { redirectTo?: string | null }) {
  const [loading, setLoading] = useState(false);
  const enabled = useGoogleEnabled();

  if (!enabled) return null;

  const handleClick = async () => {
    setLoading(true);
    const back = new URL("/login", window.location.origin);
    if (redirectTo) back.searchParams.set("redirect", redirectTo);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: back.toString() });
    // Redirecionou para o Google: a página vai trocar sozinha.
    if (result.redirected) return;
    if (result.error) {
      console.error("Google OAuth error:", result.error);
      toast.error("Não foi possível entrar com o Google agora. Use o e-mail abaixo.");
    }
    // Sem erro e sem redirecionar: a sessão já entrou e a página de login segue sozinha.
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-[15px] font-semibold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:shadow disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
      )}
      Continuar com Google
    </button>
  );
}

/** Só aparece junto com o botão do Google; sem ele, "ou com e-mail" ficaria solto na tela. */
export function AuthDivider() {
  const enabled = useGoogleEnabled();
  if (!enabled) return null;
  return (
    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <span className="h-px flex-1 bg-slate-200" /> ou com e-mail <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
