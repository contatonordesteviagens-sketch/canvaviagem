import logoImage from "@/assets/logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, subscription } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  // Validate redirect parameter
  const isValidRedirect = (path: string | null): boolean => {
    if (!path) return false;
    if (!path.startsWith('/')) return false;
    if (path.startsWith('//')) return false;
    if (path.match(/^\/?(data|javascript):/i)) return false;
    if (path.includes('%')) return false;
    return true;
  };

  const rawRedirect = searchParams.get("redirect");
  const redirectTo = isValidRedirect(rawRedirect) ? rawRedirect : null;

  useEffect(() => {
    trackViewContent('Página de Login');
  }, []);

  useAssociateUtmToUser();

  useEffect(() => {
    if (!loading && !subscription.loading && user) {
      trackCompleteRegistration();
      trackEvent(ANALYTICS_EVENTS.LOGIN_COMPLETE, {
        userId: user.id,
        email: user.email
      });

      const attribution = getMarketingAttribution();
      if (attribution && (attribution.utm_source || attribution.utm_medium || attribution.utm_campaign)) {
        supabase
          .from("profiles")
          .update({
            utm_source: attribution.utm_source,
            utm_medium: attribution.utm_medium,
            utm_campaign: attribution.utm_campaign,
            referrer_url: attribution.referrer,
          })
          .eq("user_id", user.id)
          .is("utm_source", null)
          .then(() => {
            console.log("UTM data associated to profile");
          });
      }

      if (redirectTo) {
        navigate(redirectTo);
      } else if (subscription.subscribed) {
        navigate("/");
      } else {
        navigate("/planos");
      }
    }
  }, [user, loading, subscription, navigate, redirectTo]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneBR(e.target.value);
    setPhone(formatted);
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor, insira seu email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um email válido.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-magic-link", {
        body: {
          email: email.toLowerCase().trim(),
          name: name.trim() || null,
          phone: phone ? cleanPhone(phone) : null,
          siteUrl: window.location.origin // CRITICAL FIX: Add siteUrl
        },
      });

      if (error || !data?.success) {
        const errorMsg = data?.error || error?.message || "Erro ao enviar link";
        if (errorMsg.includes("rate limit") || errorMsg.includes("muitas tentativas")) {
          toast.error("Muitas tentativas. Aguarde alguns minutos.");
        } else {
          toast.error(errorMsg);
        }
        return;
      }

      setMagicLinkSent(true);
      toast.success("Link enviado! Verifique seu email.");
    } catch (error) {
      console.error("Error sending magic link:", error);
      toast.error("Erro ao processar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-magic-link", {
        body: {
          email: email.toLowerCase().trim(),
          name: name.trim() || null,
          phone: phone ? cleanPhone(phone) : null,
          siteUrl: window.location.origin
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Erro ao reenviar link.");
        return;
      }

      toast.success("Link reenviado!");
    } catch (error) {
      toast.error("Erro ao processar.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F0FB] dark:bg-background p-4 font-sans">
      <div className="w-full max-w-[440px] flex flex-col items-center animate-in fade-in zoom-in duration-500">

        {/* Top Logo Section */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white shadow-xl shadow-primary/10 flex items-center justify-center mb-4 border border-primary/5">
            <img src={logoImage} alt="Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
            Canva Viagem
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Sua plataforma de marketing especializada
          </p>
        </div>

        <Card className="w-full border-white/50 dark:border-white/10 shadow-2xl shadow-primary/5 rounded-[40px] bg-white/80 dark:bg-card/80 backdrop-blur-xl overflow-hidden">
          <CardContent className="pt-10 pb-10 px-8 lg:px-10">
            {!magicLinkSent ? (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">Acesse sua Conta</h2>
                  <p className="text-muted-foreground text-sm">
                    Entrar sem senha usando seu e-mail
                  </p>
                </div>

                <form onSubmit={handleSendMagicLink} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">E-mail de Acesso</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-14 pl-12 rounded-[20px] bg-white border-primary/10 focus:border-primary/30 focus:ring-primary/20 shadow-sm text-base"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground px-1 italic">
                      * Use o e-mail cadastrado na sua compra.
                    </p>
                  </div>

                  {showExtras ? (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Seu Nome (opcional)</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Como quer ser chamado?"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            className="h-13 pl-12 rounded-[18px] bg-white/50 border-primary/5"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">WhatsApp (opcional)</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(85) 9 0000-0000"
                            value={phone}
                            onChange={handlePhoneChange}
                            disabled={isLoading}
                            className="h-13 pl-12 rounded-[18px] bg-white/50 border-primary/5"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowExtras(true)}
                      className="text-[11px] font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-widest block mx-auto py-1"
                    >
                      + Adicionar Nome e WhatsApp
                    </button>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-15 rounded-[22px] text-base font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 btn-shine bg-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        Enviar Link de Acesso
                        <Mail className="ml-2 h-5 w-5 opacity-80" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-8 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Link Enviado! 📬</h2>
                    <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                      Enviamos um link mágico para <span className="font-bold text-foreground">{email}</span>. Clique no botão lá para entrar.
                    </p>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-3xl p-5 border border-primary/10 space-y-3">
                  <p className="text-xs text-center text-muted-foreground font-medium">
                    Não recebeu? Verifique a pasta de <span className="text-destructive font-bold">Spam</span> ou use o botão abaixo:
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleResendLink}
                    disabled={isLoading}
                    className="w-full h-12 rounded-2xl bg-white border-primary/10 group"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Reenviar Acesso
                        <RefreshCw className="ml-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setMagicLinkSent(false)}
                  className="w-full rounded-2xl text-muted-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar e usar outro e-mail
                </Button>
              </div>
            )}

            {/* Separator */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
                <span className="bg-white dark:bg-card px-4 text-muted-foreground/40 italic">Ainda não tem conta?</span>
              </div>
            </div>

            {/* Subscribe CTA */}
            <div className="space-y-6">
              <div className="text-center px-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Para acesso ilimitado aos nossos designs e estratégias, você precisa ser assinante.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/planos")}
                className="w-full h-14 rounded-2xl border-dashed border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                Conhecer Planos e Assinar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Footer */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Precisa de Ajuda?</p>
          <a
            href="https://wa.me/5585986411294?text=Ol%C3%A1%20adquiri%20o%20Canva%20Viagem.%20"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white dark:bg-card/50 px-6 py-3 rounded-2xl shadow-sm border border-black/5 hover:shadow-md transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
            </div>
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Suporte WhatsApp</span>
          </a>
          <p className="text-[10px] text-muted-foreground/40 font-medium">© 2025 Canva Viagem • Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
