import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, ArrowRight, MessageCircle, RefreshCw, Sparkles } from "lucide-react";
import { trackPurchase, trackSubscribe } from "@/lib/meta-pixel";
import { trackESPurchase, trackESSubscribe } from "@/lib/meta-pixel-es";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SpanishPixel } from "@/components/SpanishPixel";

// Lightweight canvas confetti
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

    for (let i = 0; i < 160; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 300,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
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
        p.vy += 0.05;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      frame++;
      if (frame < 200) animId = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
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

const Obrigado = () => {
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
    if (!tracked && sourceFromUrl === "checkout") {
      trackPurchase(29.0, "BRL");
      trackSubscribe(29.0, "BRL", 29.0 * 12);
      trackESPurchase(9.09, "USD");
      trackESSubscribe(9.09, "USD", 9.09 * 12);
      setTracked(true);
    }
  }, [tracked, sourceFromUrl]);

  // Hide confetti after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Por favor, insira seu email."); return; }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-magic-link", {
        body: { email: email.toLowerCase().trim() },
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
      toast.success("Link de acesso enviado! Verifique seu email.");
    } catch {
      toast.error("Erro ao processar. Tente novamente.");
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
      if (error || !data?.success) { toast.error(data?.error || "Erro ao reenviar link."); return; }
      setMagicLinkSent(true);
      toast.success("Link reenviado com sucesso!");
    } catch {
      toast.error("Erro ao processar.");
    } finally {
      setIsLoading(false);
    }
  };

  const supportWhatsAppUrl =
    "https://wa.me/5585986411294?text=Fiz%20a%20compra%20do%20Canva%20Viagem%20e%20gostaria%20de%20suporte";

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      <SpanishPixel />
      {showConfetti && <ConfettiCanvas />}

      {/* Background glow orbs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Celebration header */}
        <div className="text-center mb-6 animate-fade-in">
          {/* Animated GIF */}
          <div className="flex justify-center mb-4">
            <img
              src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjZ4aDh1M3FzYWhodHZ6N294NGQ2OWZxOGRraHN4c2pwZWs5d3ZkdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/yoJC2GnSClbPOkV0eA/giphy.gif"
              alt="Celebração"
              className="w-32 h-32 object-contain"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
            🎉 Parabéns!<br />
            <span className="bg-gradient-to-r from-yellow-300 to-pink-400 bg-clip-text text-transparent">
              Conteúdo de viagens<br />pra sempre!
            </span>
          </h1>
          <p className="text-white/70 text-sm md:text-base mt-2">
            Seu acesso está garantido. Agora é só receber o link e voar! ✈️
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">

          {!magicLinkSent ? (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="font-bold text-white text-base flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  Informe o e-mail usado no pagamento
                </p>
                <p className="text-xs text-white/60">
                  Use <strong className="text-white/90">exatamente o mesmo e-mail</strong> da compra no Stripe
                </p>
              </div>

              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="text-center text-base h-12 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-yellow-300 focus:bg-white/25"
                onKeyDown={(e) => e.key === "Enter" && handleSendMagicLink(e as any)}
              />

              <Button
                onClick={handleSendMagicLink}
                className="btn-shine w-full h-13 text-base font-black bg-gradient-to-r from-yellow-400 to-yellow-300 text-black hover:from-yellow-300 hover:to-yellow-200 shadow-xl py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Enviando...</>
                ) : (
                  <><Mail className="mr-2 h-5 w-5" />Receber meu acesso agora →</>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="bg-green-400/20 border border-green-400/40 rounded-2xl p-4">
                <p className="text-green-200 font-bold text-base flex items-center justify-center gap-2 mb-1">
                  <Mail className="h-5 w-5" />
                  Link enviado para {email}!
                </p>
                <p className="text-green-300/80 text-xs">
                  Verifique sua caixa de entrada — e também a pasta de spam. O link expira em 1 hora.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleResendLink}
                disabled={isLoading}
                className="w-full h-11 font-semibold border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reenviando...</>
                ) : (
                  <><RefreshCw className="mr-2 h-4 w-4" />Reenviar link</>
                )}
              </Button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-white/20" />
            <span className="text-xs text-white/40 uppercase font-semibold">ou</span>
            <div className="flex-1 border-t border-white/20" />
          </div>

          {/* Login existing */}
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="w-full h-11 font-bold text-sm border-white/30 text-white hover:bg-white/10 bg-transparent"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Já tenho conta — Fazer Login
          </Button>

          {/* Support */}
          <a
            href={supportWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="btn-shine w-full h-11 bg-green-500 hover:bg-green-600 text-white font-bold shadow-md">
              <MessageCircle className="mr-2 h-4 w-4" />
              Suporte no WhatsApp
            </Button>
          </a>

          <p className="text-center text-xs text-white/40">
            Se o e-mail não chegar em 5 minutos, fale com o suporte acima.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Obrigado;
