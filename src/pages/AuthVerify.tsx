import { useEffect, useRef, useState } from "react";
import { NavegadorInternoAviso } from "@/components/jornada/NavegadorInternoAviso";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isEliteProduct, isStartProduct } from "@/lib/planAccess";
import { ehCaminhoES, ehFluxoES } from "@/lib/idioma-es";
import { AUTH_TEXTOS } from "@/lib/auth-textos";

const pendingAuthStateKey = "cv:pending-auth-checkout";
// sem destino definido: biblioteca ("/"), nunca a página de vendas
const fallbackPath = "/";

const getSafeRedirect = (value: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("\\") || /[\u0000-\u001F\u007F]/.test(value)) return null;
  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.origin !== window.location.origin) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
};

const hashNormalizedEmail = async (email: string) => {
  if (!globalThis.crypto?.subtle) return null;
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(email.trim().toLowerCase()),
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const AuthVerify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const redirectFromUrl = searchParams.get("redirect");
  // Idioma da tela: espanhol só para quem vem do fluxo /es (regra única em src/lib/idioma-es.ts).
  const es = ehFluxoES();
  const t = AUTH_TEXTOS[es ? "es" : "pt"];
  let pendingCheckoutState: { path: string; emailHash: string; createdAt: number } | null = null;
  try {
    const pendingState = JSON.parse(localStorage.getItem(pendingAuthStateKey) || "null") as {
      path?: string;
      emailHash?: string;
      createdAt?: number;
    } | null;
    const isFresh = Boolean(
      pendingState?.createdAt && Date.now() - pendingState.createdAt <= 30 * 60 * 1000,
    );
    if (isFresh && pendingState?.path && pendingState?.emailHash) {
      pendingCheckoutState = {
        path: pendingState.path,
        emailHash: pendingState.emailHash,
        createdAt: pendingState.createdAt as number,
      };
    } else {
      localStorage.removeItem(pendingAuthStateKey);
    }
  } catch {
    localStorage.removeItem(pendingAuthStateKey);
  }
  const safeRedirectFromUrl = getSafeRedirect(redirectFromUrl);
  const safeRedirectFromBrowser = getSafeRedirect(pendingCheckoutState?.path || null);
  // Fluxo espanhol: assinante volta para a biblioteca /es; quem ainda não assinou, para os planos em espanhol.
  const fallbackDoIdioma = es ? "/es/planos" : fallbackPath;
  const redirectTo = safeRedirectFromUrl || safeRedirectFromBrowser || fallbackDoIdioma;
  const hasOfferRedirect = Boolean(safeRedirectFromUrl || safeRedirectFromBrowser);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const verificationTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage(t.tokenAusente);
      return;
    }
    if (verificationTokenRef.current === token) return;
    verificationTokenRef.current = token;

    verifyToken();
    // verifyToken intentionally reads the current token and redirect from this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (status === "error") {
      localStorage.removeItem(pendingAuthStateKey);
    }
  }, [status]);

  const verifyToken = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("verify-magic-link", {
        body: { token },
      });

      if (error) {
        let detailedError: string = t.erroVerificar;

        // O Supabase JS esconde o body do erro em caso de 400/500 nas Edge Functions.
        // Lemos a resposta original para mostrar a mensagem real (ex.: link reenviado).
        try {
          const context = (error as { context?: Response }).context;
          if (context && typeof context.json === "function") {
            const body = await context.clone().json();
            if (body?.error) detailedError = es ? t.linkInvalido : body.error;
          } else if (error.message?.includes("non-2xx status code")) {
            detailedError = t.linkInvalido;
          } else {
            detailedError = es ? detailedError : error.message || detailedError;
          }
        } catch {
          detailedError = error.message?.includes("non-2xx status code")
            ? t.linkInvalido
            : es ? detailedError : error.message || detailedError;
        }

        setStatus("error");
        setErrorMessage(detailedError);
        return;
      }


      if (!data?.success) {
        setStatus("error");
        setErrorMessage(es ? t.erroToken : data?.error || t.erroToken);
        return;
      }

      // Track subscription status for UI
      setIsSubscribed(!!data.subscribed);
      setProductId(data.product_id || null);

      // Configurar sessão com os tokens recebidos
      const { access_token, refresh_token } = data.session;

      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        console.error("Session error:", sessionError);
        setStatus("error");
        setErrorMessage(t.erroSessao);
        return;
      }

      // ─── ESCREVE SUBSCRIPTION NO CACHE DO AUTHCONTEXT ──────────────────
      // verify-magic-link já confirmou o status da assinatura na Stripe.
      // Escrevemos esse resultado no cache do AuthContext ANTES de navegar,
      // para que o ProtectedRoute leia o cache instantaneamente e nunca
      // precise esperar por uma chamada check-subscription que pode falhar.
      const userId = sessionData.user?.id;
      if (userId && data.subscribed) {
        try {
          const subscriptionSnapshot = {
            subscribed: true,
            productId: data.product_id || null,
            subscriptionEnd: data.subscription_end || null,
            status: data.status || "active",
            trialEnd: data.trial_end || null,
            billingCycle: data.billing_cycle || null,
            billingProvider: data.billing_provider || "stripe",
            loading: false,
          };
          localStorage.setItem(
            `cv-sub-cache-v3-${userId}`,
            JSON.stringify({ data: subscriptionSnapshot, timestamp: Date.now() }),
          );
        } catch {
          // ignora erros de localStorage
        }
      }
      // ────────────────────────────────────────────────────────────────────

      let verifiedRedirectTo = redirectTo;
      if (!safeRedirectFromUrl && pendingCheckoutState) {
        const authenticatedEmail = sessionData.user?.email;
        const authenticatedEmailHash = authenticatedEmail
          ? await hashNormalizedEmail(authenticatedEmail)
          : null;
        if (!authenticatedEmailHash || authenticatedEmailHash !== pendingCheckoutState.emailHash) {
          localStorage.removeItem(pendingAuthStateKey);
          verifiedRedirectTo = fallbackDoIdioma;
        }
      }

      if (data.subscribed) {
        verifiedRedirectTo = es ? "/es" : "/";
      } else if (es && ehCaminhoES(verifiedRedirectTo) && /^\/es\/?$/.test(verifiedRedirectTo)) {
        // /es é a biblioteca de assinantes: sem assinatura, a pessoa vai para os planos em espanhol.
        verifiedRedirectTo = "/es/planos";
      }

      setStatus("success");

      // Redirecionar após 2 segundos
      setTimeout(() => {
        localStorage.removeItem(pendingAuthStateKey);
        navigate(verifiedRedirectTo, { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Verify error:", error);
      setStatus("error");
      setErrorMessage(t.erroVerificacao);
    }
  };

  return (
    <div lang={es ? "es-ES" : undefined} className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center border-primary/20 shadow-2xl">
        <CardContent className="pt-12 pb-8 px-8 space-y-6">
          {status === "loading" && (
            <>
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {t.verificando}
                </h1>
                <p className="text-muted-foreground">
                  {t.aguarde}
                </p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <NavegadorInternoAviso className="mb-2" lang={es ? "es" : "pt"} />
              <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-primary">
                  {isSubscribed ? (
                    isEliteProduct(productId) ? t.okElite :
                    isStartProduct(productId) ? t.okStart :
                    t.okPremium
                  ) : t.okConta}
                </h1>
                <p className="text-muted-foreground">
                  {isSubscribed
                    ? t.okAssinante
                    : t.okSemAssinatura}
                </p>
                {!isSubscribed && (
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
                      onClick={() => navigate(t.planosVerifyPath)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t.verPlanosPremium}
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-4 italic">
                  {hasOfferRedirect
                    ? t.redirecionando
                    : t.outroAparelho}
                </p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-destructive">
                  {t.erroTitulo}
                </h1>
                <p className="text-muted-foreground">
                  {errorMessage}
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => navigate(t.loginPath)}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t.novoLink}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate(t.homePath)}
                  className="w-full"
                >
                  {t.voltarHome}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthVerify;
