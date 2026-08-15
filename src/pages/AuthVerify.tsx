import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const pendingAuthStateKey = "cv:pending-auth-checkout";
const fallbackPath = "/inicio?auth=verified";

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
  const redirectTo = safeRedirectFromUrl || safeRedirectFromBrowser || fallbackPath;
  const hasOfferRedirect = Boolean(safeRedirectFromUrl || safeRedirectFromBrowser);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const verificationTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Token não encontrado na URL.");
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
        let detailedError = "Erro ao verificar token";
        try {
          // If error message is a JSON string from Edge Function
          const errorBody = typeof error.message === 'string' && error.message.startsWith('{')
            ? JSON.parse(error.message)
            : error;
          detailedError = errorBody.error || error.message || detailedError;
        } catch {
          detailedError = error.message;
        }

        setStatus("error");
        setErrorMessage(detailedError);
        return;
      }

      if (!data?.success) {
        setStatus("error");
        setErrorMessage(data?.error || "Erro ao verificar token");
        return;
      }

      // Track subscription status for UI
      setIsSubscribed(!!data.subscribed);

      // Configurar sessão com os tokens recebidos
      const { access_token, refresh_token } = data.session;

      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        console.error("Session error:", sessionError);
        setStatus("error");
        setErrorMessage("Erro ao criar sessão. Tente novamente.");
        return;
      }

      let verifiedRedirectTo = redirectTo;
      if (!safeRedirectFromUrl && pendingCheckoutState) {
        const authenticatedEmail = sessionData.user?.email;
        const authenticatedEmailHash = authenticatedEmail
          ? await hashNormalizedEmail(authenticatedEmail)
          : null;
        if (!authenticatedEmailHash || authenticatedEmailHash !== pendingCheckoutState.emailHash) {
          localStorage.removeItem(pendingAuthStateKey);
          verifiedRedirectTo = fallbackPath;
        }
      }

      setStatus("success");

      // Redirecionar após 3 segundos (mais tempo para ler a mensagem)
      setTimeout(() => {
        localStorage.removeItem(pendingAuthStateKey);
        navigate(verifiedRedirectTo, { replace: true });
      }, 3000);
    } catch (error) {
      console.error("Verify error:", error);
      setStatus("error");
      setErrorMessage("Erro ao processar verificação.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center border-primary/20 shadow-2xl">
        <CardContent className="pt-12 pb-8 px-8 space-y-6">
          {status === "loading" && (
            <>
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Verificando seu acesso...
                </h1>
                <p className="text-muted-foreground">
                  Aguarde enquanto validamos seu link.
                </p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-primary">
                  {isSubscribed ? "Acesso Premium Confirmado! ✨" : "Conta Acessada! 👋"}
                </h1>
                <p className="text-muted-foreground">
                  {isSubscribed
                    ? "Tudo pronto! Aproveite seus recursos exclusivos."
                    : "Sua conta foi confirmada. Escolha uma assinatura para liberar a plataforma."}
                </p>
                {!isSubscribed && (
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
                      onClick={() => navigate("/inicio#planos")}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Ver Planos Premium
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-4 italic">
                  {hasOfferRedirect
                    ? "Redirecionando para concluir sua assinatura..."
                    : "Se você abriu o link em outro aparelho, escolha novamente a oferta na próxima tela."}
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
                  Erro na Verificação
                </h1>
                <p className="text-muted-foreground">
                  {errorMessage}
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Solicitar Novo Link
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Voltar para Home
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
