import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Crown, Calendar, LogOut, ExternalLink, Loader2, Factory, Trash2, FileDown, MessageCircle } from "lucide-react";
import { useDiagnosticos, useDeleteDiagnostico } from "@/hooks/useFabricaDiagnosticos";
import { generateDiagnosticoPDF } from "@/lib/fabrica-pdf";
import { hasEliteAccess, hasStartAccess } from "@/lib/planAccess";

interface ProfileData {
  name: string | null;
  email: string | null;
}

export default function MinhaConta() {
  const { user, subscription, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>({ name: null, email: null });
  const [loadingPortal, setLoadingPortal] = useState(false);
  const { data: diagnosticos = [] } = useDiagnosticos();
  const deleteDiag = useDeleteDiagnostico();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("user_id", user.id)
        .maybeSingle();
      setProfile({
        name: (data as { name?: string | null; email?: string | null } | null)?.name || null,
        email: (data as { name?: string | null; email?: string | null } | null)?.email || user.email || null,
      });
    };
    fetchProfile();
  }, [user]);

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-dashboard", {});
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      // fallback: redirect to plans page
      navigate("/inicio");
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const displayName = profile.name || user?.email?.split("@")[0] || "Usuário";
  const displayEmail = profile.email || user?.email || "";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Minha Conta</h1>

        {/* Perfil */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Meu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
              {avatarLetter}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-sm text-muted-foreground truncate">{displayEmail}</p>
            </div>
          </CardContent>
        </Card>

        {/* Plano */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              Meu Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription.loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Verificando plano...</span>
              </div>
            ) : (() => {
              const isElite = hasEliteAccess(subscription);
              const isStart = hasStartAccess(subscription);

              return (
                <>
                  <div className="flex items-center gap-3">
                    {subscription.subscribed ? (
                      <Badge className={isElite ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs px-3 py-1 font-extrabold" : "bg-blue-600 text-white hover:bg-blue-700 text-xs px-3 py-1 font-extrabold"}>
                        {isElite ? "ELITE" : "START"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        Gratuito
                      </Badge>
                    )}
                    {subscription.subscribed && (
                      <span className="text-sm text-muted-foreground">
                        {isElite ? "Acesso total e ilimitado à Fábrica" : "Acesso completo ao acervo"}
                      </span>
                    )}
                  </div>

                  {subscription.subscribed && subscription.subscriptionEnd && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Acesso até: {formatDate(subscription.subscriptionEnd)}</span>
                    </div>
                  )}

                  {subscription.subscribed ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleManageSubscription}
                      disabled={loadingPortal}
                    >
                      {loadingPortal ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      Gerenciar Assinatura
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => navigate("/inicio")}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Ver Planos PRO
                    </Button>
                  )}

                  {(isStart || !subscription.subscribed) && (
                    <div style={{
                      marginTop: 20,
                      padding: 16,
                      borderRadius: 14,
                      background: "linear-gradient(135deg, #071a2e 0%, #0d2640 100%)",
                      border: "1px solid rgba(0, 229, 255, 0.2)"
                    }}>
                      <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 800, color: "#00E5FF", display: "flex", alignItems: "center", gap: 6 }}>
                        <Crown size={14} /> DESTAQUE-SE COM O PLANO ELITE
                      </p>
                      <p style={{ margin: "0 0 12px", fontSize: 11.5, color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.5 }}>
                        Desbloqueie a <strong>Fábrica de Anúncios ILIMITADA</strong> e o <strong>Criador de Sites de Viagem em 1 Clique</strong> para parar de parecer amador e vender pacotes no automático!
                      </p>
                      <Button 
                        size="sm"
                        className="w-full bg-[#00E5FF] text-[#050D1A] hover:bg-[#00c2db] font-extrabold text-[11px] uppercase tracking-wider h-9 border-none"
                        onClick={() => navigate("/inicio")}
                      >
                        Fazer Upgrade para Elite →
                      </Button>
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Suporte & Ajuda WhatsApp */}
        <Card className="mb-4 border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-500" />
              Suporte Exclusivo via WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Precisa de ajuda ou tem alguma dúvida? Fale diretamente com nossa equipe de suporte no WhatsApp.
            </p>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold"
              onClick={() => window.open("https://api.whatsapp.com/send/?phone=5585998458995&text=Canva+Viagem", "_blank")}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Falar com Suporte (WhatsApp) →
            </Button>
          </CardContent>
        </Card>

        {/* Sair */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da conta
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
