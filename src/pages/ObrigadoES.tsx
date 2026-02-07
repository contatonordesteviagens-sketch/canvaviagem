import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Mail, Loader2, ArrowRight, MessageCircle, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SpanishPixel } from "@/components/SpanishPixel";
import logo from "@/assets/logo.png";

const ES_PIXEL_ID = "1560736461820497";

const ObrigadoES = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const emailFromUrl = searchParams.get('email');
    const sourceFromUrl = searchParams.get('source');
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [tracked, setTracked] = useState(false);

    useEffect(() => {
        if (emailFromUrl) {
            setEmail(decodeURIComponent(emailFromUrl));
        }
    }, [emailFromUrl]);

    // Track conversion for Spanish version
    useEffect(() => {
        if (!tracked && sourceFromUrl === 'checkout') {
            console.log('[Meta ES Debug] === CONVERSION TRACKING (Spanish) ===');
            console.log('[Meta ES Debug] Page: /es/obrigado');
            console.log('[Meta ES Debug] Pixel:', ES_PIXEL_ID);

            if (typeof window !== 'undefined' && window.fbq) {
                // Track Purchase - $9.09 USD
                window.fbq('trackSingle', ES_PIXEL_ID, 'Purchase', {
                    value: 9.09,
                    currency: 'USD'
                });
                console.log('[Meta ES Debug] Purchase tracked: $9.09 USD');

                // Track Subscribe - $9.09 USD
                window.fbq('trackSingle', ES_PIXEL_ID, 'Subscribe', {
                    value: 9.09,
                    currency: 'USD',
                    predicted_ltv: 9.09 * 12
                });
                console.log('[Meta ES Debug] Subscribe tracked: $9.09 USD (LTV: $109.08)');
            }

            setTracked(true);
            console.log('[Meta ES Debug] === TRACKING COMPLETE ===');
        }
    }, [tracked, sourceFromUrl]);

    const handleSendMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("Por favor, introduce tu email.");
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke("send-magic-link", {
                body: { email: email.toLowerCase().trim() },
            });

            if (error || !data?.success) {
                const errorMsg = data?.error || error?.message || "Error al enviar el enlace";
                if (errorMsg.includes("rate limit") || errorMsg.includes("muitas tentativas")) {
                    toast.error("Demasiados intentos. Espera unos minutos.");
                } else {
                    toast.error(errorMsg);
                }
                console.error("Magic link error:", error || data?.error);
                return;
            }

            setMagicLinkSent(true);
            toast.success("¡Enlace de acceso enviado! Verifica tu email.");
        } catch (error) {
            console.error("Error sending magic link:", error);
            toast.error("Error al procesar. Intenta nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendLink = async () => {
        setMagicLinkSent(false);
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke("send-magic-link", {
                body: { email: email.toLowerCase().trim() },
            });

            if (error || !data?.success) {
                toast.error(data?.error || "Error al reenviar enlace.");
                return;
            }

            setMagicLinkSent(true);
            toast.success("¡Enlace reenviado con éxito!");
        } catch (error) {
            toast.error("Error al procesar.");
        } finally {
            setIsLoading(false);
        }
    };

    const supportWhatsAppUrl = "https://wa.me/5585986411294?text=Hola%2C%20realic%C3%A9%20la%20compra%20de%20Canva%20Viagem%20y%20necesito%20soporte.%20%C2%BFMe%20puedes%20ayudar%3F";
    const generalWhatsAppUrl = "https://wa.me/5585986411294?text=Hola%2C%20me%20gustar%C3%ADa%20obtener%20informaci%C3%B3n%20sobre%20Canva%20Viagem.";

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
            <SpanishPixel />
            <Card className="w-full max-w-lg text-center border-primary/20 shadow-2xl">
                <CardContent className="pt-12 pb-8 px-6 md:px-8 space-y-6">
                    {/* Logo */}
                    <div className="flex justify-center mb-2">
                        <img src={logo} alt="Canva Viagem" className="h-16 md:h-20 w-auto" />
                    </div>

                    {/* Success Icon */}
                    <div className="relative mx-auto w-16 h-16 md:w-20 md:h-20">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                        <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-2">
                            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            ¡Canva Viagem Liberado!
                            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                        </h1>
                        <p className="text-base md:text-lg text-foreground font-semibold">
                            Tu acceso está liberado
                        </p>
                    </div>

                    {/* Magic Link Form */}
                    {!magicLinkSent ? (
                        <div className="space-y-5 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-5 md:p-6 border-2 border-primary/20">
                            <div className="space-y-2">
                                <p className="font-bold text-base md:text-lg text-foreground">
                                    📧 Introduce tu email para recibir tu acceso
                                </p>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Usa <strong>exactamente el mismo email</strong> que usaste para el pago
                                </p>
                            </div>

                            <Input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="text-center text-base md:text-lg h-12 md:h-14 border-2 border-primary/30 focus:border-primary font-medium"
                            />

                            <Button
                                onClick={handleSendMagicLink}
                                className="w-full h-12 md:h-14 text-base md:text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
                                size="lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="mr-2 h-5 w-5" />
                                        Enviar Enlace de Acceso
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 md:p-5">
                                <p className="text-green-800 dark:text-green-200 font-bold text-base md:text-lg flex items-center justify-center gap-2 mb-2">
                                    <Mail className="h-5 w-5" />
                                    Enlace enviado a {email}
                                </p>
                                <p className="text-green-700 dark:text-green-300 text-sm md:text-base">
                                    Verifica tu bandeja de entrada. <strong>¡No olvides revisar la carpeta de spam!</strong> El enlace expira en 1 hora.
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleResendLink}
                                disabled={isLoading}
                                className="w-full h-12 font-semibold border-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Reenviando...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Reenviar Enlace por Email
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Separator */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-muted"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-semibold">
                            <span className="bg-card px-3 text-muted-foreground">o</span>
                        </div>
                    </div>

                    {/* Already have account */}
                    <Button
                        variant="outline"
                        onClick={() => navigate("/auth")}
                        className="w-full h-12 font-bold text-base border-2 hover:bg-primary/10"
                    >
                        <ArrowRight className="mr-2 h-5 w-5" />
                        ¿Ya tienes cuenta? Iniciar Sesión
                    </Button>

                    {/* Support */}
                    <div className="bg-gradient-to-br from-muted/80 to-muted/50 rounded-xl p-4 md:p-5 border-2 border-muted space-y-3">
                        <p className="font-bold text-sm md:text-base">¿Necesitas ayuda?</p>

                        {/* Support Button - Purchase Help */}
                        <a
                            href={supportWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <Button
                                variant="default"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11"
                            >
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Soporte - Hice la Compra
                            </Button>
                        </a>

                        {/* General WhatsApp */}
                        <a
                            href={generalWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-semibold w-full justify-center"
                        >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp: (85) 9 8641-1294
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ObrigadoES;
