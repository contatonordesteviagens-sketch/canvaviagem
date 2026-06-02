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

    // Increase density: 350 particles
    for (let i = 0; i < 350; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -50 - Math.random() * 800,
        vx: (Math.random() - 0.5) * 2, // Slower horizontal
        vy: 0.5 + Math.random() * 2,   // Slower vertical
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 7 + Math.random() * 10,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.1, // Slower spin
      });
    }

    let animId: number;
    let frame = 0;
    const TOTAL_FRAMES = 600; // ~10 seconds @60fps
    const FADE_FRAMES = 90;   // last 1.5s fade out
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fadeAlpha = frame > TOTAL_FRAMES - FADE_FRAMES
        ? Math.max(0, (TOTAL_FRAMES - frame) / FADE_FRAMES)
        : 1;
      ctx.globalAlpha = fadeAlpha;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.vy += 0.02; // Very low gravity for "floaty" effect
        // Recycle particles to keep density high during the full 10s
        if (p.y > canvas.height + 50 && frame < TOTAL_FRAMES - FADE_FRAMES) {
          p.x = Math.random() * canvas.width;
          p.y = -50 - Math.random() * 200;
          p.vy = 0.5 + Math.random() * 2;
          p.vx = (Math.random() - 0.5) * 2;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      frame++;
      if (frame < TOTAL_FRAMES) {
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
  const emailFromUrl = searchParams.get("email");
  const sourceFromUrl = searchParams.get("source");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [tracked, setTracked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (emailFromUrl) setEmail(decodeURIComponent(emailFromUrl));
  }, [emailFromUrl]);

  useEffect(() => {
    // Delay to ensure Meta Pixel is fully initialized from index.html
    const timer = setTimeout(() => {
      if (!tracked) {
        console.log('[Meta Pixel ES] Disparando Purchase e Subscribe...');
        trackESPurchase(29.00, 'USD');
        trackESSubscribe(29.00, 'USD', 29.00 * 12);
        
        // Google Ads conversion for ES (optional if configured)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'conversion', {
            send_to: 'AW-18034387036/QeQUCJ-g7Y0cENzQu5dD',
            value: 29.00,
            currency: 'USD',
            transaction_id: Date.now().toString(),
          });
        }
        setTracked(true);
      }
    }, 2500); // 2.5s delay to ensure all pixels are initialized

    return () => clearTimeout(timer);
  }, [tracked]);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 10500);
    return () => clearTimeout(t);
  }, []);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Por favor, introduce tu email."); return; }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-magic-link", {
        body: {
          email: email.toLowerCase().trim(),
          siteUrl: window.location.origin
        },
      });
      if (error || !data?.success) {
        const errorMsg = data?.error || error?.message || "Error al enviar el enlace";
        if (errorMsg.includes("rate limit") || errorMsg.includes("muitas tentativas")) {
          toast.error("Demasiados intentos. Espera unos minutos.");
        } else {
          toast.error(errorMsg);
        }
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
        body: {
          email: email.toLowerCase().trim(),
          siteUrl: window.location.origin
        },
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

  const supportWhatsAppUrl =
    "https://wa.me/5585986411294?text=Hice%20la%20compra%20de%20Canva%20Viagem%20y%20me%20gustar%C3%ADa%20recibir%20soporte";

  return (
    <div className="min-h-screen bg-[#03070F] flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Rich Background Effects to match SalesPage */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[100px] pointer-events-none" />

      <SpanishPixel />
      {showConfetti && <ConfettiCanvas />}

      <div className="w-full max-w-md flex flex-col items-center relative z-10 gap-8">
        {/* Celebration header with matching Typography and Palette */}
        <div className="text-center space-y-6 animate-fade-in" style={{ animationDuration: '1.2s' }}>
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-cyan-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHd3NmFpcm94ODFjaDM2cWthcWdoZjd4NHVuOGZ5bmowd2c1bnA0NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/yoJC2GnSClbPOkV0eA/giphy.gif"
                alt="Celebración"
                className="w-44 h-44 md:w-56 md:h-56 object-cover rounded-[2.5rem] shadow-2xl border-4 border-white/10 relative z-10 opacity-90"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter italic uppercase">
              ¡Felicidades!
            </h1>
            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent italic leading-tight">
              ¡Ahora tienes contenidos de viajes para siempre!
            </p>
          </div>
        </div>

        {/* Card redesigned as a sleek Dark Glass Container */}
        <div className="w-full bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl transition-all duration-500 backdrop-blur-md animate-scale-in">
          {!magicLinkSent ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="font-bold text-white text-lg md:text-xl">
                  Introduce exactamente el mismo email que usaste para la compra
                </p>
                <div className="h-1 w-12 bg-cyan-500 mx-auto rounded-full" />
              </div>

              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="text-center text-lg h-16 bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus:border-cyan-500 rounded-[1.25rem] transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleSendMagicLink(e as any)}
              />

              {/* Primary Button transformed into Cyan SalesPage Style */}
              <Button
                onClick={handleSendMagicLink}
                className="w-full h-16 text-lg font-black bg-[#00E5FF] text-black hover:bg-cyan-400 hover:scale-[1.02] shadow-[0_8px_32px_rgba(0,229,255,0.3)] border-none transition-all duration-300 rounded-[1.25rem] active:scale-95 uppercase tracking-widest"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-6 w-6 animate-spin" />Enviando...</>
                ) : (
                  <><Mail className="mr-2 h-6 w-6" />Recibir acceso ahora</>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-[2.5rem] p-8 animate-scale-in">
                <p className="text-cyan-400 font-bold text-xl mb-2">
                  ¡Enlace enviado a {email}!
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                  Verifica tu bandeja de entrada y spam. <br /> El enlace expira en 1 hora.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleResendLink}
                disabled={isLoading}
                className="w-full h-14 font-bold border-white/10 bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white rounded-[1.25rem] transition-all"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Reenviando...</>
                ) : (
                  <><RefreshCw className="mr-2 h-5 w-5" />Reenviar enlace</>
                )}
              </Button>
            </div>
          )}

          {/* Divider matching dark theme */}
          <div className="flex items-center gap-4 py-6">
            <div className="flex-1 border-t border-white/5" />
            <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">o</span>
            <div className="flex-1 border-t border-white/5" />
          </div>

          <div className="space-y-4">
            {/* Login fallback styled as clean ghost link */}
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
              className="w-full h-14 font-bold text-sm text-zinc-500 hover:text-white hover:bg-white/5 rounded-[1.25rem] gap-2 transition-colors"
            >
              <ArrowRight className="h-5 w-5" />
              Ya tengo cuenta — Iniciar sesión manualmente
            </Button>

            {/* Support Button matches the Floating Green styling */}
            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full h-14 bg-[#25D366] hover:bg-[#22c35e] hover:scale-[1.02] text-white font-black shadow-[0_8px_24px_rgba(37,211,102,0.25)] border-none rounded-[1.25rem] gap-2 transition-transform uppercase text-xs tracking-widest">
                <MessageCircle className="h-5 w-5 fill-current" />
                Soporte VIP WhatsApp
              </Button>
            </a>
          </div>
        </div>

        {/* Footer info styled cleanly */}
        <p className="text-center text-xs text-zinc-600 px-10 leading-relaxed font-medium animate-fade-in" style={{ animationDelay: '0.5s', animationDuration: '1.2s' }}>
          Si el email no llega en 5 minutos, <br /> habla con nuestro soporte arriba.
        </p>
      </div>
    </div>
  );
};

export default ObrigadoES;
