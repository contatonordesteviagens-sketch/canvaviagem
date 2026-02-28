import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, ArrowRight, MessageCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SpanishPixel } from "@/components/SpanishPixel";
import { trackESPurchase, trackESSubscribe } from "@/lib/meta-pixel-es";

/**
 * Slow & Abundant Confetti Component
 */
const ConfettiCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ["#FFB800", "#6D28D9", "#EC4899", "#10B981", "#3B82F6", "#F97316"];
        const particles: {
            x: number; y: number; vx: number; vy: number;
            color: string; size: number; angle: number; spin: number;
        }[] = [];

        // Density: 350 particles (same as PT)
        for (let i = 0; i < 350; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -50 - Math.random() * 800,
                vx: (Math.random() - 0.5) * 2,
                vy: 0.5 + Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 7 + Math.random() * 10,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.1,
            });
        }

        let animId: number;
        let frame = 0;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.angle += p.spin;
                p.vy += 0.02;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                ctx.restore();
            });
            frame++;
            if (frame < 180) { // 3 seconds
                animId = requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };
        animate();
        return () => cancelAnimationFrame(animId);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ width: "100vw", height: "100vh" }}
        />
    );
};

const ObrigadoES = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const emailFromUrl = searchParams.get('email');
    const sourceFromUrl = searchParams.get('source');
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [tracked, setTracked] = useState(false);
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        if (emailFromUrl) setEmail(decodeURIComponent(emailFromUrl));
    }, [emailFromUrl]);

    useEffect(() => {
        if (!tracked && sourceFromUrl === 'checkout') {
            trackESPurchase(9.09, 'USD');
            trackESSubscribe(9.09, 'USD', 9.09 * 12);
            setTracked(true);
        }
    }, [tracked, sourceFromUrl]);

    useEffect(() => {
        const t = setTimeout(() => setShowConfetti(false), 3000); // 3s
        return () => clearTimeout(t);
    }, []);

    const handleSendMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) { toast.error("Por favor, introduce tu email."); return; }
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("send-magic-link", {
                body: { email: email.toLowerCase().trim() },
            });
            if (error || !data?.success) {
                const errorMsg = data?.error || error?.message || "Error al enviar el enlace";
                toast.error(errorMsg);
                return;
            }
            setMagicLinkSent(true);
            toast.success("¡Enlace de acceso enviado! Verifica tu email.");
        } catch {
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
            if (error || !data?.success) { toast.error(data?.error || "Error al reenviar enlace."); return; }
            setMagicLinkSent(true);
            toast.success("¡Enlace reenviado con éxito!");
        } catch {
            toast.error("Error al procesar.");
        } finally {
            setIsLoading(false);
        }
    };

    const supportWhatsAppUrl = "https://wa.me/5585986411294?text=Hola%2C%20realic%C3%A9%20la%20compra%20de%20Canva%20Viagem%20y%20necesito%20soporte.%20%C2%BFMe%20puedes%20ayudar%3F";

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden text-center">
            <SpanishPixel />
            {showConfetti && <ConfettiCanvas />}

            <div className="w-full max-w-md relative z-10">
                <div className="flex justify-center mb-6 animate-scale-in" style={{ animationDuration: '3s' }}>
                    <img
                        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjZ4aDh1M3FzYWhodHZ6N294NGQ2OWZxOGRraHN4c2pwZWs5d3ZkdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/yoJC2GnSClbPOkV0eA/giphy.gif"
                        alt="Celebración"
                        className="w-56 h-56 md:w-64 md:h-64 object-cover rounded-2xl shadow-xl border-4 border-white"
                    />
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-black leading-tight mb-2 animate-fade-in" style={{ animationDuration: '3s' }}>
                    ¡Felicidades!
                    <br />
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                        ¡Ahora tienes contenidos de viajes para siempre!
                    </span>
                </h1>

                <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-6 md:p-10 shadow-2xl mx-2 mt-6">
                    {!magicLinkSent ? (
                        <div className="space-y-5">
                            <p className="font-bold text-zinc-900 text-lg">
                                Introduce exactamente el mismo email que usaste para el pago
                            </p>

                            <Input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="text-center text-lg h-14 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-yellow-500 rounded-2xl focus:ring-0"
                                onKeyDown={(e) => e.key === "Enter" && handleSendMagicLink(e as any)}
                            />

                            <Button
                                onClick={handleSendMagicLink}
                                className="btn-shine w-full h-14 text-lg font-black bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg border-none transition-all duration-300 rounded-2xl"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-6 w-6 animate-spin" />Enviando...</>
                                ) : (
                                    <><Mail className="mr-2 h-6 w-6" />Recibir mi acceso ahora</>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="bg-green-50 border border-green-100 rounded-3xl p-6">
                                <p className="text-green-800 font-bold text-lg mb-1">
                                    ¡Enlace enviado a {email}!
                                </p>
                                <p className="text-green-700/70 text-sm">
                                    Verifica tu bandeja de entrada y spam. El enlace expira en 1 hora.
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleResendLink}
                                disabled={isLoading}
                                className="w-full h-12 font-semibold border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-2xl"
                            >
                                <RefreshCw className="mr-2 h-5 w-5" />Reenviar enlace
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center gap-4 py-2">
                        <div className="flex-1 border-t border-zinc-100" />
                        <span className="text-xs text-zinc-300 uppercase font-bold">o</span>
                        <div className="flex-1 border-t border-zinc-100" />
                    </div>

                    <Button
                        variant="ghost"
                        onClick={() => navigate("/auth")}
                        className="w-full h-12 font-bold text-sm text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-2xl"
                    >
                        <ArrowRight className="mr-2 h-5 w-5" />
                        Ya tengo cuenta — Iniciar sesión manualmente
                    </Button>

                    <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Button className="btn-shine w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold shadow-md border-none rounded-2xl">
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Soporte en WhatsApp
                        </Button>
                    </a>
                </div>

                <p className="text-center text-xs text-zinc-300 mt-6 px-10 leading-relaxed">
                    Si el email no llega en 5 minutos, contacta con nuestro soporte arriba.
                </p>
            </div>
        </div>
    );
};

export default ObrigadoES;
