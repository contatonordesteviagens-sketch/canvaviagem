import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthVerify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Token não encontrado na URL.");
      return;
    }

    verifyToken();
  }, [token]);

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
        } catch (e) {
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

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        console.error("Session error:", sessionError);
        setStatus("error");
        setErrorMessage("Erro ao criar sessão. Tente novamente.");
        return;
      }

      setStatus("success");

      // Redirecionar após 3 segundos (mais tempo para ler a mensagem)
      setTimeout(() => {
        navigate("/", { replace: true });
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
                    : "Você entrou no Plano Grátis da plataforma."}
                </p>
                {!isSubscribed && (
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
                      onClick={() => navigate("/#pricing")}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Ver Planos Premium
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-4 italic">
                  Redirecionando para a plataforma...
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
