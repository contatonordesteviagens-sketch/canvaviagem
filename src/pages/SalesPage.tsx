import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { Check, X, Star, Lock, Shield, Play, ArrowRight, Zap } from "lucide-react";
import { trackViewContent, trackInitiateCheckout } from "@/lib/meta-pixel";
import { CountdownTimer } from "@/components/planos/CountdownTimer";

// ────────────────────────────────────────────────────────────
// CONFIG
// ────────────────────────────────────────────────────────────
const STRIPE = {
  monthly: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
  annual: "https://buy.stripe.com/dRm8wQ75U1wk7eH9wU8so09",
};

const T = {
  bg: "#0A0F1E",
  bgDeep: "#06091A",
  card: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  accent: "#00D4FF",
  text: "#FFFFFF",
  text2: "rgba(255,255,255,0.65)",
  text3: "rgba(255,255,255,0.4)",
};

const STORAGE_KEY = "cv_offer_72h_expires";
const DURATION_72H = 72 * 60 * 60 * 1000;

// ────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Renata Vasconcelos", agency: "Dream Travel · São Paulo, SP",
    metric: "🚀 Engajamento +340% em 15 dias", photo: "/assets/renata.png",
    text: "Minha agência era invisível no Instagram. Em 15 dias fechei 3 pacotes para o Nordeste só pelos Reels. O design premium faz toda a diferença." },
  { name: "Carlos Eduardo", agency: "Cadu Viagens · Recife, PE",
    metric: "🚀 ROI 12x em 30 dias", photo: "/assets/carlos.png",
    text: "Antes eu perdia 3h num post. Agora posto em 2 minutos. Os vídeos são cinematográficos — meu cliente acha que tenho equipe." },
  { name: "Ana Paula Silva", agency: "Viaje Mais · Curitiba, PR",
    metric: "🚀 84 leads em 45 dias", photo: "/assets/ana.png",
    text: "Assinei com medo por ser barato, mas a qualidade é de agência de publicidade. Nunca mais fico sem postar." },
  { name: "Marcos Oliveira", agency: "Prime Agência · Florianópolis, SC",
    metric: "🚀 Ticket +R$1.2k em 60 dias",
    text: "Os vídeos passam credibilidade gigante. Atrai cliente de alto padrão que antes ignorava minha agência." },
  { name: "Julia Lima", agency: "Agente Conectada · BH, MG",
    metric: "🚀 Engajamento +280% em 21 dias",
    text: "Nunca tive tantos salvamentos em um post. O conteúdo cinematográfico realmente para o scroll do cliente." },
];

const PAINS = [
  { emoji: "👻", title: "Instagram Fantasma", text: "Seu perfil está parado porque você não tem as manhas (e nem o tempo) de criar conteúdo todo dia." },
  { emoji: "🎨", title: "Artes 'Amadoras'", text: "Você contratou designer e recebeu algo que parece feito no Word por uma criança." },
  { emoji: "😤", title: "Inveja do Concorrente", text: "Seu vizinho posta Reels épicos e você não faz ideia de como ele consegue aquele visual." },
  { emoji: "😨", title: "Medo de Não Ser Levado a Sério", text: "Você já perdeu orçamentos de alto padrão porque seu feed não passa segurança." },
];

const ARSENAL = [
  { icon: "🎬", title: "250+ Vídeos 4K UHD", text: "Pareça que você filmou no destino, sem sair do escritório." },
  { icon: "🎨", title: "400+ Artes Estratégicas", text: "Posts carrossel, ofertas e institucionais prontos para Canva." },
  { icon: "🤖", title: "11 Assistentes de IA", text: "Legendas e copy treinadas no mercado de viagem.",
    sample: "✨ \"Imagine acordar com vista pro mar de Maragogi 🌊 — pacote 5 dias com tudo incluso a partir de R$1.890. Garanta sua data 👇\"" },
  { icon: "💬", title: "Scripts WhatsApp", text: "Mensagens que convertem lead em cliente pagante.",
    sample: "💬 \"Oi [nome]! Vi que você curtiu nosso post de Maragogi 🩵 Posso te mandar 3 datas com o melhor preço pra setembro?\"" },
  { icon: "📅", title: "Calendário de Conteúdo", text: "Saiba o que postar e quando postar para máxima escala." },
  { icon: "🎯", title: "Estratégia de Marketing", text: "Guia passo a passo do Instagram ao fechamento." },
];

const COMPARISON = [
  { feature: "Custo mensal", design: "R$1.500+", social: "R$900+", us: "R$16,41" },
  { feature: "Vídeos 4K", design: "Raro", social: "Não", us: "250+" },
  { feature: "Estratégia", design: "Limitada", social: "Genérica", us: "Específica de viagem" },
  { feature: "Autonomia", design: "Zero", social: "Pouca", us: "Total" },
  { feature: "Velocidade", design: "Dias", social: "Horas", us: "Minutos" },
];

const FAQS = [
  { q: "Os vídeos são exclusivos?", a: "Cada vídeo é o ponto de partida. Você adiciona seu logo e paleta no Canva e cria um post único. Com 250+ vídeos no acervo, a chance de dois concorrentes postarem o mesmo é mínima." },
  { q: "Preciso de Canva pago?", a: "Não. Tudo funciona perfeitamente no Canva gratuito. O Pro só ajuda com remoção de fundo — opcional." },
  { q: "Eu já comprei o Pack de 150 Reels, é a mesma coisa?", a: "Não. O Pack é uma fração do que entregamos. Aqui você tem +100 vídeos novos, 400+ artes, 11 IAs, scripts de WhatsApp, calendário e atualizações semanais." },
  { q: "Funciona para agência pequena?", a: "Foi desenhado pra você. Você sozinho consegue ter um perfil de multinacional em 5 minutos por dia." },
  { q: "Como recebo o acesso?", a: "Imediato. Assim que o pagamento (Stripe ou Hotmart) é confirmado, você recebe e-mail com login automático." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem letras miúdas. No mensal você cancela a qualquer momento. No anual, você garante 12 meses pelo menor preço." },
];

// ────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────────

const InitialAvatar = ({ name, idx }: { name: string; idx: number }) => {
  const colors = ["#7F77DD", "#1D9E75", "#D85A30", "#D4537E", "#378ADD", "#BA7517"];
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ width: 56, height: 56, borderRadius: "50%", background: colors[idx % colors.length],
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700,
      color: "#fff", flexShrink: 0, border: `2px solid ${T.accent}33` }}>{initials}</div>
  );
};

const Avatar = ({ name, photo, idx }: { name: string; photo?: string; idx: number }) => {
  const [failed, setFailed] = useState(false);
  if (!photo || failed) return <InitialAvatar name={name} idx={idx} />;
  return <img src={photo} onError={() => setFailed(true)} alt={name}
    style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${T.accent}33`, objectFit: "cover", flexShrink: 0 }} />;
};

// 72h countdown for top bar
const TopBarCountdown = () => {
  const [t, setT] = useState({ d: "00", h: "00", m: "00", s: "00" });
  useEffect(() => {
    let exp = parseInt(localStorage.getItem(STORAGE_KEY) || "0");
    if (!exp || exp <= Date.now()) { exp = Date.now() + DURATION_72H; localStorage.setItem(STORAGE_KEY, exp.toString()); }
    const tick = () => {
      let r = exp - Date.now();
      if (r <= 0) { exp = Date.now() + DURATION_72H; localStorage.setItem(STORAGE_KEY, exp.toString()); r = DURATION_72H; }
      const d = Math.floor(r / 86400000), h = Math.floor((r % 86400000) / 3600000),
            m = Math.floor((r % 3600000) / 60000), s = Math.floor((r % 60000) / 1000);
      setT({ d: String(d).padStart(2, "0"), h: String(h).padStart(2, "0"),
             m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0") });
    };
    tick(); const i = setInterval(tick, 1000); return () => clearInterval(i);
  }, []);
  return (
    <span style={{ fontFamily: "monospace", fontWeight: 800, color: T.accent, letterSpacing: 1, fontSize: 14 }}>
      {t.d}:{t.h}:{t.m}:{t.s}
    </span>
  );
};

const ScrollProgressBar = () => {
  const [w, setW] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setW(pct);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, height: 3, width: `${w}%`,
      background: T.accent, zIndex: 10000, transition: "width 0.1s", boxShadow: `0 0 8px ${T.accent}` }} />
  );
};

const FAQItem = ({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: T.card, border: open ? `1px solid ${T.accent}55` : T.border,
      borderRadius: 14, marginBottom: 10, overflow: "hidden", transition: "all 0.3s" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", padding: "18px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left",
        background: "transparent", border: "none", cursor: "pointer", color: open ? T.accent : T.text,
        fontWeight: 700, fontSize: 15, gap: 12 }}>
        <span>{q}</span>
        <span style={{ fontSize: 22, lineHeight: 1, transition: "transform 0.3s",
          transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
      </button>
      <AnimatePresence>{open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
          <div style={{ padding: "0 20px 20px", color: T.text2, fontSize: 14, lineHeight: 1.7 }}>{a}</div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
};

const Reveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, delay }}>
    {children}
  </motion.div>
);

// Exit intent popup
const ExitIntent = ({ onCta }: { onCta: () => void }) => {
  const [open, setOpen] = useState(false);
  const fired = useRef(false);
  useEffect(() => {
    if (sessionStorage.getItem("cv_exit_fired")) return;
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0 && !fired.current) {
        fired.current = true; sessionStorage.setItem("cv_exit_fired", "1"); setOpen(true);
      }
    };
    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, []);
  return (
    <AnimatePresence>{open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 10001,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
          style={{ background: T.bgDeep, border: `2px solid ${T.accent}`, borderRadius: 24,
            padding: "40px 32px", maxWidth: 460, textAlign: "center", position: "relative" }}>
          <button onClick={() => setOpen(false)} style={{ position: "absolute", top: 12, right: 16,
            background: "transparent", border: "none", color: T.text3, fontSize: 24, cursor: "pointer" }}>✕</button>
          <p style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>ESPERA!</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 12 }}>
            Última chance de garantir <span style={{ color: T.accent }}>42% OFF</span>
          </h2>
          <p style={{ color: T.text2, fontSize: 15, marginBottom: 24 }}>
            Você está prestes a sair sem garantir o preço de lançamento. Esse desconto não volta.
          </p>
          <button onClick={() => { onCta(); setOpen(false); }} style={{ width: "100%",
            background: T.accent, color: "#000", fontWeight: 900, fontSize: 16, padding: "18px",
            borderRadius: 14, border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5 }}>
            QUERO GARANTIR AGORA →
          </button>
          <p style={{ marginTop: 12, fontSize: 11, color: T.text3 }}>🔒 Garantia de 7 dias · Cancele quando quiser</p>
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  );
};

// ────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────
export default function SalesPage() {
  useEffect(() => { trackViewContent("Canva Viagem 10/10"); window.scrollTo(0, 0); }, []);

  const checkout = (plan: "monthly" | "annual" = "annual") => {
    trackInitiateCheckout(plan === "annual" ? 197 : 29.9);
    window.open(STRIPE[plan], "_blank");
  };

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh", overflowX: "hidden",
      paddingTop: 96, fontFamily: "Inter, system-ui, sans-serif" }}>

      <ScrollProgressBar />

      {/* ─── SEÇÃO 1 — TOP BAR ─── */}
      <div style={{ position: "fixed", top: 3, left: 0, right: 0, zIndex: 9999,
        background: T.bgDeep, borderBottom: `1px solid ${T.accent}`,
        padding: "10px 14px", display: "flex", alignItems: "center",
        justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <span className="animate-pulse" style={{ background: T.accent, color: "#000",
          fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 4, letterSpacing: 0.5 }}>42% OFF</span>
        <span style={{ fontSize: 12, color: T.text2, fontWeight: 600 }}>⚡ Encerra em</span>
        <TopBarCountdown />
        <button id="cta-topbar" onClick={() => checkout("annual")}
          style={{ background: T.accent, color: "#000", border: "none", borderRadius: 6,
            padding: "7px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer",
            textTransform: "uppercase", letterSpacing: 0.5 }}>
          Garantir →
        </button>
      </div>

      {/* ─── SEÇÃO 2 — HERO ─── */}
      <section style={{ padding: "60px 20px 40px", textAlign: "center", position: "relative",
        background: `radial-gradient(ellipse at 50% 0%, ${T.accent}15 0%, transparent 60%)` }}>
        <Reveal>
          <div style={{ display: "inline-flex", gap: 8, alignItems: "center",
            background: "rgba(255,255,255,0.04)", border: T.border, borderRadius: 100,
            padding: "6px 14px", fontSize: 11, color: T.accent, fontWeight: 700, letterSpacing: 1.5, marginBottom: 24 }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            A PLATAFORMA Nº1 PARA AGÊNCIAS DE VIAGENS
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 style={{ fontSize: "clamp(28px, 6vw, 56px)", fontWeight: 900, lineHeight: 1.1,
            maxWidth: 920, margin: "0 auto 20px", letterSpacing: -1, wordBreak: "break-word" }}>
            Seu feed parece amador enquanto seu concorrente parece ter uma{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.accent}, #fff)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              equipe de R$10.000/mês.
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p style={{ fontSize: 17, color: T.text2, maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.6 }}>
            <strong style={{ color: T.text }}>250+ vídeos 4K cinematográficos</strong> + <strong style={{ color: T.text }}>400 artes editáveis</strong>.
            Coloque seu logo em minutos e pareça uma agência multinacional.
          </p>
        </Reveal>

        {/* 3 phones mockup */}
        <Reveal delay={0.15}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 36, flexWrap: "wrap" }}>
            {[
              { city: "Maragogi", img: "/assets/real-destinations/dest-2.gif" },
              { city: "Paris",    img: "/assets/real-destinations/dest-new-2.gif" },
              { city: "Foz do Iguaçu", img: "/assets/real-destinations/dest-new-3.gif" },
            ].map((p, i) => (
              <motion.div key={p.city} initial={{ y: 0 }} animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                style={{ width: 110, height: 200, borderRadius: 18, overflow: "hidden",
                  border: "3px solid #1a2236", background: "#000",
                  boxShadow: "0 20px 60px rgba(0,212,255,0.15)", position: "relative",
                  transform: i === 1 ? "translateY(-12px)" : "" }}>
                <img src={p.img} alt={p.city} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                  padding: "20px 8px 8px", fontSize: 11, fontWeight: 800 }}>{p.city}</div>
              </motion.div>
            ))}
          </div>
        </Reveal>

        {/* Social proof */}
        <Reveal delay={0.2}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
            <div style={{ display: "flex" }}>
              {TESTIMONIALS.slice(0, 5).map((t, i) => (
                <div key={i} style={{ marginLeft: i ? -10 : 0, transform: `scale(0.65)` }}>
                  <Avatar name={t.name} photo={t.photo} idx={i} />
                </div>
              ))}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "#FFD700", fontSize: 13 }}>★★★★★</div>
              <div style={{ fontSize: 13, color: T.text2 }}>
                <strong style={{ color: T.text }}>187+ agências</strong> já dominam o feed
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={0.25}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", marginBottom: 24 }}>
            <button id="cta-hero" onClick={() => checkout("annual")}
              className="hover:scale-[1.02] active:scale-95 transition-all"
              style={{ background: T.accent, color: "#000", fontWeight: 900, fontSize: 16,
                padding: "18px 36px", borderRadius: 14, border: "none", cursor: "pointer",
                width: "100%", maxWidth: 420, textTransform: "uppercase", letterSpacing: 0.5,
                boxShadow: `0 12px 40px ${T.accent}55` }}>
              LIBERAR MEU ACESSO AGORA →
            </button>
            <button id="cta-hero-demo" onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              style={{ background: "transparent", color: T.text, fontWeight: 700, fontSize: 14,
                padding: "12px 24px", borderRadius: 12, border: T.border, cursor: "pointer" }}>
              ▶ Ver demonstração (2 min)
            </button>
          </div>
        </Reveal>

        {/* Trust badges */}
        <Reveal delay={0.3}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
            fontSize: 11, color: T.text3, fontWeight: 600 }}>
            <span>🔒 Pagamento Seguro</span>
            <span>✅ Hotmart Verified</span>
            <span>↩ Garantia 7 dias</span>
            <span>⚡ Acesso em 2 min</span>
          </div>
        </Reveal>
      </section>

      {/* ─── SEÇÃO 3 — DEMO VÍDEO ─── */}
      <section id="demo" style={{ padding: "60px 20px", background: T.bgDeep }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>VEJA POR DENTRO</p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, marginBottom: 32 }}>
              Veja a plataforma por dentro antes de decidir
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <DemoVideo />
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16, marginTop: 32, textAlign: "left" }}>
              {[
                "Como acessar os 250+ vídeos por destino",
                "Como colocar seu logo em 3 minutos",
                "Como os 11 assistentes de IA escrevem suas legendas",
              ].map(t => (
                <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: T.text2, fontSize: 14 }}>
                  <Check size={18} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} /> {t}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── SEÇÃO 4 — DOR ─── */}
      <section style={{ padding: "70px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>VOCÊ SE IDENTIFICA?</p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, marginBottom: 40 }}>
              Vender viagens ficou impossível com um perfil "comum"
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16, marginBottom: 40 }}>
            {PAINS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.05}>
                <div style={{ background: T.card, border: T.border, borderRadius: 18,
                  padding: 24, textAlign: "left", height: "100%" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{p.emoji}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <blockquote style={{ background: `${T.accent}08`, border: `1px solid ${T.accent}33`,
              borderLeft: `4px solid ${T.accent}`, borderRadius: 14, padding: "24px 28px",
              fontSize: 16, fontStyle: "italic", color: T.text2, maxWidth: 720, margin: "0 auto", lineHeight: 1.6 }}>
              "O mercado de luxo não perdoa o amadorismo. Seu feed é sua vitrine 24h por dia.
              <br/><strong style={{ color: T.text, fontStyle: "normal" }}>O que ela está dizendo sobre você agora?</strong>"
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ─── SEÇÃO 5 — ARSENAL ─── */}
      <section style={{ padding: "70px 20px", background: T.bgDeep }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Reveal>
              <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>TUDO INCLUSO</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, marginBottom: 12 }}>
                O Arsenal Completo para o seu Sucesso
              </h2>
              <p style={{ color: T.text2, fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
                Não é apenas um pacote de artes. É um sistema completo de aquisição de clientes.
              </p>
            </Reveal>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {ARSENAL.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.04}>
                <div style={{ background: T.card, border: T.border, borderRadius: 20, padding: 28, height: "100%" }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{a.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{a.title}</h3>
                  <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, marginBottom: a.sample ? 14 : 0 }}>{a.text}</p>
                  {a.sample && (
                    <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${T.accent}22`,
                      borderRadius: 10, padding: "12px 14px", fontSize: 12, color: T.text2, fontStyle: "italic" }}>
                      {a.sample}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 6 — ANTES E DEPOIS ─── */}
      <section style={{ padding: "70px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>O IMPACTO VISUAL</p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, marginBottom: 12 }}>
              Sua agência merece esse salto de autoridade
            </h2>
            <p style={{ color: T.text2, fontSize: 14, marginBottom: 32 }}>
              Arraste o cursor e veja a transformação instantânea do seu feed.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <BeforeAfterSlider />
          </Reveal>
        </div>
      </section>

      {/* ─── SEÇÃO 7 — DEPOIMENTOS ─── */}
      <section style={{ padding: "70px 20px", background: T.bgDeep }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Reveal>
              <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>RESULTADOS REAIS</p>
              <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900 }}>
                O que dizem os agentes que já mudaram de nível
              </h2>
            </Reveal>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.05}>
                <div style={{ background: T.card, border: T.border, borderRadius: 20,
                  padding: 28, height: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ background: `${T.accent}1a`, color: T.accent, fontSize: 12, fontWeight: 800,
                    padding: "6px 12px", borderRadius: 8, alignSelf: "flex-start" }}>{t.metric}</div>
                  <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.7, flex: 1 }}>"{t.text}"</p>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", borderTop: T.border, paddingTop: 16 }}>
                    <Avatar name={t.name} photo={t.photo} idx={i} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: T.text3, margin: 0 }}>{t.agency}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 8 — FUNDADOR ─── */}
      <section style={{ padding: "70px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ width: 130, height: 130, borderRadius: "50%", margin: "0 auto 24px",
              border: `3px solid ${T.accent}`, padding: 4, boxShadow: `0 0 40px ${T.accent}33` }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%",
                background: "linear-gradient(135deg, #1a2540, #0a1020)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 44, fontWeight: 900, color: T.accent }}>LF</div>
            </div>
            <h3 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>Lucas Ferrari</h3>
            <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 24 }}>
              ESTRATEGISTA & FUNDADOR DO CANVA VIAGEM
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
              {["📊 +5 anos no mercado de viagens", "🏢 +187 agências atendidas", "💰 R$2M+ em vendas geradas"].map(c => (
                <div key={c} style={{ background: T.card, border: T.border, borderRadius: 12,
                  padding: "10px 16px", fontSize: 13, fontWeight: 600, color: T.text2 }}>{c}</div>
              ))}
            </div>
            <blockquote style={{ fontSize: 17, fontStyle: "italic", color: T.text2, lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
              "Minha missão é simples: <strong style={{ color: T.text, fontStyle: "normal" }}>dar às agências o poder
              de um departamento de marketing multinacional</strong> por menos que uma pizza por mês.
              Pare de ser ignorado. Comece a ser desejado."
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ─── SEÇÃO 9 — COMPARATIVO ─── */}
      <section style={{ padding: "70px 20px", background: T.bgDeep }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Reveal>
              <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>CUSTO VS VALOR</p>
              <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900 }}>Quanto custa ser amador?</h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px", minWidth: 520 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, color: T.text3, fontWeight: 700 }}></th>
                    <th style={{ padding: "12px 16px", fontSize: 13, color: T.text2, fontWeight: 700, textAlign: "center" }}>Agência de Design</th>
                    <th style={{ padding: "12px 16px", fontSize: 13, color: T.text2, fontWeight: 700, textAlign: "center" }}>Social Media</th>
                    <th style={{ padding: "12px 16px", fontSize: 13, color: T.accent, fontWeight: 800, textAlign: "center", position: "relative" }}>
                      <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                        background: T.accent, color: "#000", fontSize: 9, fontWeight: 900, padding: "2px 8px",
                        borderRadius: 4, whiteSpace: "nowrap", letterSpacing: 0.5 }}>MAIS INTELIGENTE</div>
                      ✅ Canva Viagem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={row.feature}>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: T.text,
                        background: T.card, borderRadius: "10px 0 0 10px" }}>{row.feature}</td>
                      <td style={{ padding: "14px 16px", textAlign: "center", fontSize: 13, color: T.text3, background: T.card }}>{row.design}</td>
                      <td style={{ padding: "14px 16px", textAlign: "center", fontSize: 13, color: T.text3, background: T.card }}>{row.social}</td>
                      <td style={{ padding: "14px 16px", textAlign: "center", fontSize: 13, fontWeight: 800, color: T.accent,
                        background: `${T.accent}10`, borderRight: `2px solid ${T.accent}`, borderLeft: `2px solid ${T.accent}`,
                        borderTop: i === 0 ? `2px solid ${T.accent}` : "none",
                        borderBottom: i === COMPARISON.length - 1 ? `2px solid ${T.accent}` : "none",
                        borderRadius: i === 0 ? "10px 10px 0 0" : i === COMPARISON.length - 1 ? "0 0 10px 10px" : 0 }}>
                        {row.us}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── SEÇÃO 10 — PREÇOS ─── */}
      <section id="pricing" style={{ padding: "70px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Reveal>
              <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>ACESSO DE PRÓXIMO NÍVEL</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, marginBottom: 16 }}>Escolha seu plano</h2>
              <p style={{ color: T.text2, fontSize: 16, marginBottom: 28 }}>
                Acesso imediato a todo o ecossistema assim que confirmar.
              </p>
              <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 14 }}>OFERTA EXPIRA EM</p>
              <CountdownTimer variant="block" />
            </Reveal>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: 24, alignItems: "start", marginTop: 48 }}>
            {/* MENSAL */}
            <Reveal>
              <div style={{ background: T.card, border: T.border, borderRadius: 24, padding: "40px 32px" }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: T.text3, letterSpacing: 2, marginBottom: 20 }}>PLANO MENSAL</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>R$</span>
                  <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>29</span>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>,90</span>
                  <span style={{ fontSize: 14, color: T.text3, marginLeft: 4 }}>/mês</span>
                </div>
                <p style={{ fontSize: 12, color: T.text3, marginBottom: 28 }}>Cancele a qualquer momento</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Acesso ilimitado ao acervo", "400+ artes editáveis", "11 IAs especialistas", "Suporte via E-mail"].map(f => (
                    <li key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: T.text2 }}>
                      <Check size={16} color={T.text3} /> {f}
                    </li>
                  ))}
                </ul>
                <button id="cta-pricing-monthly" onClick={() => checkout("monthly")}
                  onMouseEnter={e => (e.currentTarget.style.background = `${T.accent}1a`)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  style={{ width: "100%", padding: 16, borderRadius: 12, border: `2px solid ${T.accent}`,
                    background: "transparent", color: T.accent, fontWeight: 800, fontSize: 14,
                    cursor: "pointer", letterSpacing: 0.5, transition: "background 0.2s" }}>
                  ASSINAR MENSAL
                </button>
              </div>
            </Reveal>

            {/* ANUAL */}
            <Reveal delay={0.1}>
              <div style={{ background: "linear-gradient(145deg, #071a2e 0%, #0d2640 100%)",
                border: `2px solid ${T.accent}`, borderRadius: 24, padding: "48px 32px 40px",
                position: "relative", boxShadow: `0 20px 60px ${T.accent}33` }}>
                <div className="animate-pulse" style={{ position: "absolute", top: 0, left: "50%",
                  transform: "translate(-50%,-50%)", background: T.accent, color: "#000", fontWeight: 900,
                  fontSize: 11, padding: "6px 16px", borderRadius: 100, whiteSpace: "nowrap",
                  boxShadow: `0 8px 20px ${T.accent}44` }}>
                  ⭐ MAIS ESCOLHIDO · ECONOMIZE R$160/ANO
                </div>
                <p style={{ fontSize: 12, fontWeight: 800, color: T.accent, letterSpacing: 2, marginBottom: 20 }}>PLANO ANUAL PRO</p>
                <p style={{ fontSize: 13, color: T.text3, textDecoration: "line-through", marginBottom: 4 }}>de R$358,80/ano</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>R$</span>
                  <span style={{ fontSize: 64, fontWeight: 900, lineHeight: 1 }}>16</span>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>,41</span>
                  <span style={{ fontSize: 14, color: T.text3, marginLeft: 4 }}>/mês</span>
                </div>
                <p style={{ fontSize: 12, color: T.text2, marginBottom: 28 }}>pago anualmente (R$197,00 vista ou 12x)</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {["TUDO DO MENSAL +", "Prioridade em novos destinos", "E-book: Scripts High-End 🎁",
                    "Suporte VIP via WhatsApp", "Acesso a lives exclusivas"].map((f, i) => (
                    <li key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14,
                      fontWeight: i === 0 ? 800 : 500, color: i === 0 ? T.accent : T.text }}>
                      <Check size={16} color={T.accent} /> {f}
                    </li>
                  ))}
                </ul>
                <button id="cta-pricing-pro" onClick={() => checkout("annual")}
                  className="hover:scale-[1.02] active:scale-95 transition-all"
                  style={{ width: "100%", padding: 18, borderRadius: 14, background: T.accent, color: "#000",
                    fontWeight: 900, fontSize: 15, cursor: "pointer", border: "none",
                    boxShadow: `0 12px 40px ${T.accent}55`, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  QUERO O PLANO ANUAL PRO →
                </button>
                <p style={{ textAlign: "center", fontSize: 12, color: T.text3, marginTop: 16 }}>
                  ⚡ Acesso liberado em menos de 2 minutos
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 11 — GARANTIA ─── */}
      <section style={{ padding: "70px 20px", background: T.bgDeep }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ width: 90, height: 90, borderRadius: "50%", margin: "0 auto 24px",
              background: `${T.accent}15`, border: `2px solid ${T.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🛡️</div>
            <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Garantia Blindada de 7 Dias</h3>
            <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.7, marginBottom: 28 }}>
              Se em 7 dias você olhar para o seu feed e não amar o que sua agência se tornou,
              basta um e-mail. Devolvemos cada centavo. <strong style={{ color: T.text }}>O risco é 100% nosso.</strong>
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {["STRIPE", "HOTMART"].map(b => (
                <span key={b} style={{ fontSize: 12, fontWeight: 700, color: T.text2,
                  border: T.border, borderRadius: 6, padding: "6px 14px", letterSpacing: 1 }}>{b}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── SEÇÃO 12 — FAQ ─── */}
      <section style={{ padding: "70px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Reveal>
              <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>PERGUNTAS FREQUENTES</p>
              <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900 }}>
                Dúvidas? <span style={{ opacity: 0.5 }}>Nós respondemos.</span>
              </h2>
            </Reveal>
          </div>
          {FAQS.map((f, i) => <FAQItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />)}
        </div>
      </section>

      {/* ─── SEÇÃO 13 — CTA FINAL ─── */}
      <section style={{ padding: "80px 20px", textAlign: "center",
        background: `radial-gradient(ellipse at 50% 50%, ${T.accent}10 0%, ${T.bgDeep} 70%)` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
              Você está a um clique de <span style={{ color: T.accent }}>ter esses mesmos números.</span>
            </h2>
            <p style={{ color: T.text2, fontSize: 16, marginBottom: 24 }}>
              Cada dia com feed amador é um cliente indo para o concorrente.
            </p>
            <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 14 }}>OFERTA EXPIRA EM</p>
            <div style={{ marginBottom: 32 }}><CountdownTimer variant="block" /></div>
            <button id="cta-final" onClick={() => checkout("annual")}
              className="hover:scale-[1.03] active:scale-95 transition-all animate-pulse"
              style={{ background: T.accent, color: "#000", fontWeight: 900, fontSize: 17,
                padding: "20px 36px", borderRadius: 16, border: "none", cursor: "pointer",
                width: "100%", maxWidth: 480, textTransform: "uppercase", letterSpacing: 0.5,
                boxShadow: `0 16px 50px ${T.accent}66` }}>
              QUERO MEU ACESSO AGORA →
            </button>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 20, flexWrap: "wrap",
              fontSize: 11, color: T.text3, fontWeight: 600 }}>
              <span>🔒 Pagamento seguro</span>
              <span>↩ Garantia 7 dias</span>
              <span>⚡ Acesso em 2 min</span>
            </div>
            <p style={{ marginTop: 28, fontSize: 11, color: T.text3 }}>CNPJ: 45.312.876/0001-22</p>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <div style={{ height: 80 }} />
      <footer style={{ background: T.bgDeep, borderTop: T.border, padding: "60px 20px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, letterSpacing: 1 }}>CANVA VIAGEM</div>
          <p style={{ fontSize: 13, color: T.text3, marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
            A plataforma definitiva para agências de turismo que buscam o próximo nível de autoridade e lucro.
          </p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
            {["Início", "Planos", "Termos", "Privacidade", "Suporte"].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: T.text2, textDecoration: "none", fontWeight: 600 }}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 11, color: T.text3 }}>
            © {new Date().getFullYear()} Canva Viagem · Todos os direitos reservados.<br/>
            <span style={{ fontSize: 10, opacity: 0.6 }}>Esta plataforma não possui vínculo oficial com a empresa Canva Pty Ltd.</span>
          </p>
        </div>
      </footer>

      {/* ─── MOBILE STICKY CTA ─── */}
      <MobileStickyBar onClick={() => checkout("annual")} />

      {/* ─── EXIT INTENT ─── */}
      <ExitIntent onCta={() => checkout("annual")} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SUBCOMPONENTS
// ────────────────────────────────────────────────────────────

function DemoVideo() {
  const [playing, setPlaying] = useState(false);
  return (
    <div onClick={() => setPlaying(true)}
      style={{ position: "relative", width: "100%", paddingTop: "56.25%",
        borderRadius: 16, overflow: "hidden", border: `1px solid ${T.accent}33`,
        cursor: playing ? "default" : "pointer",
        background: "linear-gradient(135deg, #0a1830 0%, #0d2040 100%)",
        boxShadow: `0 20px 60px ${T.accent}22` }}>
      {playing ? (
        <iframe style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          src="https://www.youtube.com/embed/dvInvZZ7fLY?autoplay=1"
          allow="autoplay; encrypted-media" allowFullScreen />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div className="hover:scale-110 transition-transform" style={{ width: 80, height: 80,
            borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center",
            justifyContent: "center", boxShadow: `0 0 40px ${T.accent}aa` }}>
            <Play size={36} color="#000" fill="#000" style={{ marginLeft: 4 }} />
          </div>
          <p style={{ color: T.text2, fontSize: 13, margin: 0 }}>▶ Tour de 2 minutos pela plataforma</p>
        </div>
      )}
    </div>
  );
}

function BeforeAfterSlider() {
  const before = "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&auto=format&q=70";
  const after  = "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&auto=format&q=80";
  return (
    <div style={{ position: "relative", borderRadius: 20, overflow: "hidden",
      border: T.border, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
      <ReactCompareSlider
        itemOne={<ReactCompareSliderImage src={before} alt="Feed amador" />}
        itemTwo={<ReactCompareSliderImage src={after} alt="Feed premium" />}
        style={{ height: 480 }}
      />
      <span style={{ position: "absolute", top: 14, left: 14, background: "rgba(220,38,38,0.95)",
        color: "#fff", fontSize: 11, fontWeight: 800, padding: "5px 10px", borderRadius: 6, letterSpacing: 0.5 }}>
        ✗ FEED AMADOR
      </span>
      <span style={{ position: "absolute", top: 14, right: 14, background: T.accent,
        color: "#000", fontSize: 11, fontWeight: 800, padding: "5px 10px", borderRadius: 6, letterSpacing: 0.5 }}>
        ✓ FEED DE LUXO
      </span>
    </div>
  );
}

function MobileStickyBar({ onClick }: { onClick: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => {
      const pricing = document.getElementById("pricing");
      const top = pricing?.getBoundingClientRect().top ?? 9999;
      setShow(window.scrollY > 500 && top > 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div className="md:hidden" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9997,
      background: T.bgDeep, borderTop: `1px solid ${T.accent}`, padding: "10px 14px",
      transform: show ? "translateY(0)" : "translateY(110%)", transition: "transform 0.3s ease",
      display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 10, color: T.text3 }}>Plano Anual Pro</p>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>R$16,41<span style={{ fontSize: 11, fontWeight: 500, color: T.text3 }}>/mês</span></p>
      </div>
      <button id="cta-mobile-float" onClick={onClick}
        style={{ background: T.accent, color: "#000", border: "none", borderRadius: 10,
          padding: "12px 18px", fontSize: 12, fontWeight: 800, cursor: "pointer",
          whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: 0.5 }}>
        Garantir →
      </button>
    </div>
  );
}
