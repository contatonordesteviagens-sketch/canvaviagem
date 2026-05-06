import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Star, Shield, Play, ArrowRight } from "lucide-react";
import { trackViewContent, trackInitiateCheckout } from "@/lib/meta-pixel";
import { ProductDemo } from "../components/planos/ProductDemo";
import { CountdownTimer } from "../components/planos/CountdownTimer";
import { StickyTopBar } from "../components/planos/StickyTopBar";
import { SocialProofToast } from "../components/planos/SocialProofToast";
import { MobileFloatingCTA } from "../components/planos/MobileFloatingCTA";

// ────────────────────────────────────────────────────────────
// CONFIG
// ────────────────────────────────────────────────────────────
const STRIPE = {
  monthly: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
  annual: "https://buy.stripe.com/dRm8wQ75U1wk7eH9wU8so09",
};

const T = {
  bg: "#050D1A",
  bgDeep: "#03070F",
  card: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  accent: "#00E5FF",
  text: "#FFFFFF",
  text2: "rgba(255,255,255,0.65)",
  text3: "rgba(255,255,255,0.4)",
};

const DEMO_VIDEO_URL = "https://www.youtube.com/embed/dvInvZZ7fLY?autoplay=1";

// ────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────
// 2 case-studies fortes + 4 depoimentos rápidos
const CASES = [
  {
    name: "Renata Vasconcelos",
    agency: "Dream Travel · São Paulo, SP",
    handle: "@dreamtravel.sp",
    instaUrl: "https://instagram.com/dreamtravel.sp",
    headline: "Fechou R$ 8.420 em 31 dias com 4 posts",
    text: "Eu postava 1x por semana, sem retorno. Em 31 dias usando o Canva Viagem postei 4 vídeos do Nordeste, recebi 11 DMs e fechei 3 pacotes que somaram R$ 8.420 só na primeira mensalidade.",
    metrics: ["+11 DMs em 31 dias", "3 pacotes fechados", "R$ 8.420 em vendas"],
    photo: "/assets/renata.png",
  },
  {
    name: "Carlos Eduardo",
    agency: "Cadu Viagens · Recife, PE",
    handle: "@caduviagens",
    instaUrl: "https://instagram.com/caduviagens",
    headline: "De 3h por post para 2 minutos — fechou R$ 12.700 em 45 dias",
    text: "Antes eu travava 3 horas para um único post no Canva. Agora pego o vídeo pronto, troco logo, posto. Em 45 dias fechei 5 pacotes Caribe que somaram R$ 12.700 — sem aumentar tráfego pago.",
    metrics: ["2 min por post", "5 pacotes Caribe", "R$ 12.700 em 45 dias"],
    photo: "/assets/carlos.png",
  },
];

const QUICK_TESTIMONIALS = [
  { name: "Ana Paula Silva", agency: "Viaje Mais · Curitiba, PR", handle: "@viajemais.cwb", instaUrl: "https://instagram.com/viajemais.cwb",
    text: "Achei barato demais e quase não comprei. Em 21 dias fechei 2 pacotes que pagaram a anuidade 80x." },
  { name: "Marcos Oliveira", agency: "Prime Agência · Floripa, SC", handle: "@primeflorianopolis", instaUrl: "https://instagram.com/primeflorianopolis",
    text: "Cliente de R$ 4.500/pacote começou a me chamar depois que mudei o feed. Vídeo cinematográfico = autoridade." },
  { name: "Julia Lima", agency: "Agente Conectada · BH, MG", handle: "@agenteconectada", instaUrl: "https://instagram.com/agenteconectada",
    text: "Nunca tive tantos salvamentos. As IAs escrevem legenda melhor do que eu — sem exagero." },
  { name: "Rafael Mendes", agency: "Mendes Tour · Salvador, BA", handle: "@mendestour.ssa", instaUrl: "https://instagram.com/mendestour.ssa",
    text: "Saí da agência em 3 meses e abri a minha. O Canva Viagem foi 100% do meu marketing inicial." },
];

const PAINS = [
  { emoji: "👻", title: "Instagram Fantasma", text: "Você posta uma vez por semana (no susto) e o engajamento é zero. Cliente passa direto." },
  { emoji: "🎨", title: "Designer Entregou Lixo", text: "Pagou R$ 800 por umas artes que parecem feitas no Word. E ele sumiu no WhatsApp." },
  { emoji: "💸", title: "Cliente Premium Te Ignora", text: "Quem paga R$ 8.000 por pacote olha seu perfil 3 segundos e vai para o concorrente." },
];

const HOW_IT_WORKS = [
  { num: "1", title: "ESCOLHE", text: "250+ vídeos 4K por destino. Maragogi, Caribe, Europa — atualizados toda semana." },
  { num: "2", title: "PERSONALIZA", text: "Abre no Canva, troca o logo, ajusta a cor da marca. Em 2 minutos está pronto." },
  { num: "3", title: "POSTA", text: "Calendário pronto + scripts de WhatsApp para converter o DM em pacote vendido." },
];

// Comparativo justo: pack único vs designer freelancer vs Canva Viagem
const COMPARISON = [
  { feature: "Investimento",  hotmart: "R$ 197 uma vez", design: "R$ 1.500 / mês", us: "R$ 197 / ano" },
  { feature: "Conteúdo",      hotmart: "150 reels fixos", design: "4–8 entregas/mês", us: "250+ vídeos · atualização semanal" },
  { feature: "Atualizações",  hotmart: "❌ Nenhuma", design: "Depende dele", us: "✅ Acesso vitalício à evolução" },
  { feature: "IAs e Scripts", hotmart: "❌ Não tem", design: "❌ Não tem", us: "✅ 11 IAs + scripts WhatsApp" },
  { feature: "Suporte",       hotmart: "Só do produtor", design: "1 freelancer", us: "WhatsApp time da plataforma" },
];

const FAQS = [
  { q: "Quanto tempo por dia eu preciso?", a: "Em média 5 a 10 minutos. Você escolhe o vídeo do destino, abre no Canva, troca seu logo e posta. Quem usa o calendário pronto faz um lote semanal de 30 minutos e fica liberado a semana inteira." },
  { q: "Funciona se eu não souber Canva?", a: "Sim. Tudo é editável em arrastar e soltar — não precisa saber design. Os templates já vêm posicionados, com fonte certa, cores certas. Você só substitui o logo e o texto." },
  { q: "Posso usar comercialmente?", a: "Sim. Sua assinatura libera uso ilimitado para a sua agência: posts, anúncios, story, WhatsApp, site. O que você não pode é revender os arquivos brutos." },
  { q: "E se eu cancelar, perco os vídeos baixados?", a: "Não. Tudo o que você baixou e usou nas suas redes continua seu para sempre. Você só perde acesso ao acervo novo e às atualizações." },
  { q: "Tem suporte em português via WhatsApp?", a: "Sim, no plano anual. Atendimento humano em horário comercial — não chatbot. Tempo médio de resposta: 2 horas." },
  { q: "Os vídeos são exclusivos?", a: "Não exclusivos no sentido literal — mas com 250+ vídeos por destino e a customização do Canva (seu logo, sua cor, sua legenda), a chance de aparecer igual ao concorrente é mínima." },
  { q: "Qual a diferença do pack único da Hotmart?", a: "O pack é uma fatia parada no tempo (150 reels e fim). Aqui você tem 250+ vídeos, +400 artes, 11 IAs, scripts de WhatsApp, calendário e novas entregas toda semana — pelo mesmo preço cobrado uma vez no pack." },
  { q: "Funciona pra agência pequena (1 pessoa)?", a: "Foi feito justamente pra você. Quem trabalha sozinho é quem mais ganha tempo: 5 minutos por dia substituem um designer e um social media." },
];

// ────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────────
const InitialAvatar = ({ name, idx, size = 56 }: { name: string; idx: number; size?: number }) => {
  const colors = ["#7F77DD", "#1D9E75", "#D85A30", "#D4537E", "#378ADD", "#BA7517"];
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[idx % colors.length],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.32, fontWeight: 700, color: "#fff", flexShrink: 0,
      border: `2px solid ${T.accent}33` }}>{initials}</div>
  );
};

const Avatar = ({ name, photo, idx, size = 56 }: { name: string; photo?: string; idx: number; size?: number }) => {
  const [failed, setFailed] = useState(false);
  if (!photo || failed) return <InitialAvatar name={name} idx={idx} size={size} />;
  return <img src={photo} onError={() => setFailed(true)} alt={name}
    style={{ width: size, height: size, borderRadius: "50%", border: `2px solid ${T.accent}33`, objectFit: "cover", flexShrink: 0 }} />;
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

// Modal de vídeo demo (hero)
const VideoModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <AnimatePresence>{open && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 10002,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 960, position: "relative" }}>
        <button onClick={onClose} aria-label="Fechar"
          style={{ position: "absolute", top: -42, right: 0, background: "transparent", border: "none",
            color: "#fff", fontSize: 28, cursor: "pointer", fontWeight: 300 }}>✕</button>
        <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 16, overflow: "hidden",
          border: `1px solid ${T.accent}55`, boxShadow: `0 24px 80px ${T.accent}33` }}>
          <iframe style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            src={DEMO_VIDEO_URL} allow="autoplay; encrypted-media" allowFullScreen title="Tour pela plataforma" />
        </div>
      </motion.div>
    </motion.div>
  )}</AnimatePresence>
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
          <button id="cta-exit-intent" onClick={() => { onCta(); setOpen(false); }} style={{ width: "100%",
            background: T.accent, color: "#000", fontWeight: 900, fontSize: 16, padding: "18px",
            borderRadius: 14, border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5 }}>
            QUERO GARANTIR AGORA →
          </button>
          <p style={{ marginTop: 12, fontSize: 11, color: T.text3 }}>🔒 Garantia tripla · Cancele quando quiser</p>
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  );
};

// ────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────
export default function SalesPage() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [ctaClicked, setCtaClicked] = useState(false);

  useEffect(() => { trackViewContent("Canva Viagem 10/10"); window.scrollTo(0, 0); }, []);

  const checkout = (plan: "monthly" | "annual" = "annual") => {
    setCtaClicked(true);
    trackInitiateCheckout(plan === "annual" ? 197 : 29.9);
    window.open(STRIPE[plan], "_blank");
  };

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh", overflowX: "hidden",
      fontFamily: "Inter, system-ui, sans-serif" }}>

      <ScrollProgressBar />
      <StickyTopBar onCheckout={() => checkout("annual")} />
      <SocialProofToast ctaClicked={ctaClicked} />
      <MobileFloatingCTA onCheckout={() => checkout("annual")} />

      <main style={{ paddingTop: "48px" }}>

      {/* ─── HERO ─── */}
      <section style={{ padding: "48px 20px 40px", textAlign: "center", position: "relative",
        background: `radial-gradient(ellipse at 50% 0%, ${T.accent}15 0%, transparent 60%)` }}>

        <div style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ display: "inline-flex", gap: 8, alignItems: "center",
            background: "rgba(255,255,255,0.04)", border: T.border, borderRadius: 100,
            padding: "6px 14px", fontSize: 10.5, color: T.accent, fontWeight: 700,
            letterSpacing: 1.2, marginBottom: 22, maxWidth: "100%" }}>
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              PARA AGÊNCIAS DE VIAGEM QUE QUEREM PARAR DE PARECER AMADORAS
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 style={{ fontSize: "clamp(26px, 5.5vw, 52px)", fontWeight: 900, lineHeight: 1.1,
            maxWidth: 920, margin: "0 auto 18px", letterSpacing: -1 }}>
            Poste como uma agência de{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.accent}, #fff)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              R$10.000/mês?
            </span>{" "}
            — em 5 minutos por dia, sem designer, sem agência!
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p style={{ fontSize: 16, color: T.text2, maxWidth: 620, margin: "0 auto 28px", lineHeight: 1.6 }}>
            <strong style={{ color: T.text }}>250+ vídeos 4K</strong> + <strong style={{ color: T.text }}>400 artes editáveis</strong> + <strong style={{ color: T.text }}>11 IAs treinadas no mercado de turismo</strong>. Você só troca o logo. <strong style={{ color: T.accent }}>R$ 16,41/mês.</strong>
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={0.15}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", marginBottom: 22 }}>
            <button id="cta-hero-checkout" 
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              className="hover:scale-[1.02] active:scale-95 transition-all"
              style={{ display: "inline-flex", gap: 10, alignItems: "center", justifyContent: "center",
                background: T.accent, color: "#000", fontWeight: 900, fontSize: 15,
                padding: "18px 28px", borderRadius: 14, border: "none", cursor: "pointer",
                width: "100%", maxWidth: 440, textTransform: "uppercase", letterSpacing: 0.5,
                boxShadow: `0 12px 40px ${T.accent}55` }}>
              Quero acesso agora — R$ 16,41/mês
            </button>
          </div>
        </Reveal>

        {/* Social proof */}
        <Reveal delay={0.2}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ color: "#FFD700", fontSize: 14, letterSpacing: 1 }}>★★★★★</div>
            <div style={{ fontSize: 13, color: T.text2 }}>
              <strong style={{ color: T.text }}>187 agências usando hoje</strong> · 4,9★ <span style={{ color: T.text3 }}>(62 avaliações verificadas)</span>
            </div>
          </div>
        </Reveal>
        </div>
      </section>

      <ProductDemo />


      {/* ─── DOR (3 cards) ─── */}
      <section style={{ padding: "70px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>VOCÊ SE IDENTIFICA?</p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, marginBottom: 36 }}>
              Vender viagens ficou impossível com um perfil "comum"
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
            gap: 16, marginBottom: 36 }}>
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
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section style={{ padding: "70px 20px", background: T.bgDeep }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>COMO FUNCIONA</p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, marginBottom: 40 }}>
              3 passos. 5 minutos. <span style={{ color: T.accent }}>Post no ar.</span>
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 20 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.08}>
                <div style={{ background: T.card, border: T.border, borderRadius: 20, padding: 32, height: "100%", textAlign: "left" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: `${T.accent}1a`,
                    border: `1px solid ${T.accent}55`, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 900, color: T.accent, marginBottom: 18 }}>{s.num}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8, letterSpacing: 1 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>



      {/* ─── PROVA SOCIAL — 2 case studies + carrossel ─── */}
      <section style={{ padding: "70px 20px", background: T.bgDeep }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Reveal>
              <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>RESULTADOS REAIS</p>
              <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900 }}>
                Quem virou a chave em 30 dias
              </h2>
            </Reveal>
          </div>

          {/* Cases */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
            gap: 24, marginBottom: 36 }}>
            {CASES.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.08}>
                <div style={{ background: T.card, border: `1px solid ${T.accent}33`, borderRadius: 20,
                  padding: 28, height: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ background: `${T.accent}15`, color: T.accent, fontSize: 13, fontWeight: 800,
                    padding: "10px 14px", borderRadius: 10, alignSelf: "flex-start", lineHeight: 1.4 }}>
                    📈 {c.headline}
                  </div>
                  <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.7, flex: 1, margin: 0 }}>"{c.text}"</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {c.metrics.map(m => (
                      <span key={m} style={{ fontSize: 11, fontWeight: 700, color: T.text2,
                        background: "rgba(255,255,255,0.04)", border: T.border, padding: "5px 10px", borderRadius: 6 }}>
                        {m}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", borderTop: T.border, paddingTop: 16 }}>
                    <Avatar name={c.name} photo={c.photo} idx={i} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{c.name}</p>
                      <p style={{ fontSize: 12, color: T.text3, margin: 0 }}>{c.agency}</p>
                      <a href={c.instaUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: T.accent, textDecoration: "none", fontWeight: 700 }}>
                        {c.handle} ↗
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Quick testimonials */}
          <Reveal>
            <p style={{ textAlign: "center", fontSize: 11, color: T.text3, letterSpacing: 2, fontWeight: 800, marginBottom: 18 }}>
              + DEZENAS DE AGÊNCIAS REPETINDO O MESMO PADRÃO
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 14 }}>
              {QUICK_TESTIMONIALS.map((q, i) => (
                <div key={q.name} style={{ background: T.card, border: T.border, borderRadius: 14, padding: 18 }}>
                  <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, margin: "0 0 12px" }}>"{q.text}"</p>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Avatar name={q.name} idx={i + 2} size={36} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{q.name}</p>
                      <a href={q.instaUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: T.accent, textDecoration: "none" }}>{q.handle} ↗</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── COMPARATIVO JUSTO (3 colunas) ─── */}
      <section style={{ padding: "70px 20px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Reveal>
              <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>COMPARATIVO HONESTO</p>
              <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, marginBottom: 12 }}>
                Veja onde seu dinheiro rende mais
              </h2>
              <p style={{ color: T.text2, fontSize: 14, maxWidth: 580, margin: "0 auto" }}>
                Não vamos te enganar comparando com agência de design de R$ 10.000. Olha as alternativas reais que você está considerando agora.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px", minWidth: 620 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px 14px", fontSize: 12, color: T.text3, fontWeight: 700 }}></th>
                    <th style={{ padding: "12px 14px", fontSize: 13, color: T.text2, fontWeight: 700, textAlign: "center" }}>
                      Pack único Hotmart
                    </th>
                    <th style={{ padding: "12px 14px", fontSize: 13, color: T.text2, fontWeight: 700, textAlign: "center" }}>
                      Designer freelancer
                    </th>
                    <th style={{ padding: "12px 14px", fontSize: 13, color: T.accent, fontWeight: 800, textAlign: "center", position: "relative" }}>
                      <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                        background: T.accent, color: "#000", fontSize: 9, fontWeight: 900, padding: "2px 8px",
                        borderRadius: 4, whiteSpace: "nowrap", letterSpacing: 0.5 }}>MELHOR ESCOLHA</div>
                      ✅ Canva Viagem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={row.feature}>
                      <td style={{ padding: "14px 14px", fontSize: 13, fontWeight: 700, color: T.text,
                        background: T.card, borderRadius: "10px 0 0 10px" }}>{row.feature}</td>
                      <td style={{ padding: "14px 14px", textAlign: "center", fontSize: 13, color: T.text3, background: T.card }}>{row.hotmart}</td>
                      <td style={{ padding: "14px 14px", textAlign: "center", fontSize: 13, color: T.text3, background: T.card }}>{row.design}</td>
                      <td style={{ padding: "14px 14px", textAlign: "center", fontSize: 13, fontWeight: 800, color: T.accent,
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

      {/* ─── OBJEÇÃO PRINCIPAL — "Por que tão barato?" ─── */}
      <section style={{ padding: "70px 20px", background: T.bgDeep }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Reveal>
            <p style={{ textAlign: "center", fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>
              A PERGUNTA QUE TODO MUNDO FAZ
            </p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, textAlign: "center", marginBottom: 36, lineHeight: 1.2 }}>
              "Por que tão barato? <span style={{ color: T.accent }}>Você não tá escondendo nada?"</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ background: T.card, border: T.border, borderRadius: 20, padding: "32px 28px",
              display: "flex", flexDirection: "column", gap: 18, fontSize: 15, color: T.text2, lineHeight: 1.7 }}>
              <p style={{ margin: 0 }}>
                <strong style={{ color: T.text }}>Resposta honesta:</strong> cobramos R$ 16/mês porque atendemos <strong style={{ color: T.text }}>187 agências</strong>, não 3 contas grandes. O custo de produzir um vídeo se divide entre todo mundo.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: T.text }}>Sem designer no meio</strong> = sem repasse de R$ 1.500/mês para você. A IA escreve as legendas; o time só revisa.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: T.text }}>Quanto mais agências entram</strong>, mais vídeos novos conseguimos produzir por semana. É por isso que o preço continua o mesmo desde 2023.
              </p>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 8, paddingTop: 18, borderTop: T.border }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${T.accent}`,
                  background: "linear-gradient(135deg, #1a2540, #0a1020)", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: T.accent, flexShrink: 0 }}>
                  LF
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, color: T.text, fontSize: 14 }}>Lucas Ferrari</p>
                  <p style={{ margin: 0, fontSize: 12, color: T.text3 }}>Fundador · Canva Viagem</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── PREÇO ─── */}
      <section id="pricing" style={{ padding: "70px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Reveal>
              <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>ACESSO IMEDIATO</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, marginBottom: 16 }}>Escolha seu plano</h2>
              <div style={{ display: "inline-flex", gap: 10, alignItems: "center", background: `${T.accent}10`,
                border: `1px solid ${T.accent}55`, borderRadius: 100, padding: "8px 16px", marginBottom: 8 }}>
                <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                  47 vagas restantes nesta semana
                </span>
              </div>
              <p style={{ color: T.text3, fontSize: 12, margin: 0 }}>
                (limitamos para garantir suporte por WhatsApp)
              </p>
            </Reveal>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(290px, 100%), 1fr))",
            gap: 24, alignItems: "start", marginTop: 32 }}>
            {/* MENSAL */}
            <Reveal>
              <div style={{ background: T.card, border: T.border, borderRadius: 24, padding: "40px 32px" }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: T.text3, letterSpacing: 2, marginBottom: 20 }}>PLANO MENSAL</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
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
                  ⭐ ECONOMIZE R$ 161 + R$ 50 EM BÔNUS
                </div>
                <p style={{ fontSize: 12, fontWeight: 800, color: T.accent, letterSpacing: 2, marginBottom: 20 }}>PLANO ANUAL PRO</p>
                <p style={{ fontSize: 13, color: T.text3, textDecoration: "line-through", marginBottom: 4 }}>de R$ 358,80/ano</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>R$</span>
                  <span style={{ fontSize: 64, fontWeight: 900, lineHeight: 1 }}>16</span>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>,41</span>
                  <span style={{ fontSize: 14, color: T.text3, marginLeft: 4 }}>/mês</span>
                </div>
                <p style={{ fontSize: 12, color: T.text2, marginBottom: 28 }}>R$ 197/ano · pago em até 12x · Stripe ou PIX</p>
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
                  ⚡ Acesso em 2 min · Cancele com 1 clique
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── GARANTIA TRIPLA ─── */}
      <section style={{ padding: "70px 20px", background: T.bgDeep }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ width: 90, height: 90, borderRadius: "50%", margin: "0 auto 24px",
              background: `${T.accent}15`, border: `2px solid ${T.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🛡️</div>
            <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>Garantia Tripla</h3>
            <p style={{ fontSize: 15, color: T.accent, fontWeight: 700, marginBottom: 28 }}>
              O risco é 100% meu — não seu.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left", marginBottom: 32 }}>
              {[
                { n: "1", t: "7 dias para testar tudo", s: "Acesso completo, sem letra miúda. Não gostou? Devolvo." },
                { n: "2", t: "Se postar 5x usando os templates e não gostar → devolvo 100%", s: "Você usa de verdade. Se a qualidade não te convencer, é 100% de volta." },
                { n: "3", t: "Se postar 5x e não receber pelo menos 1 DM → devolvo 100% + R$ 50 pelo seu tempo", s: "Você arrisca seu tempo? Eu pago pelo seu tempo se não funcionar." },
              ].map(g => (
                <div key={g.n} style={{ display: "flex", gap: 16, background: T.card,
                  border: `1px solid ${T.accent}33`, borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.accent,
                    color: "#000", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: 16, flexShrink: 0 }}>{g.n}</div>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1.4 }}>{g.t}</p>
                    <p style={{ margin: 0, fontSize: 13, color: T.text2, lineHeight: 1.6 }}>{g.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FAQ (8 perguntas) ─── */}
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

      {/* ─── CTA FINAL ─── */}
      <section style={{ padding: "80px 20px", textAlign: "center",
        background: `radial-gradient(ellipse at 50% 50%, ${T.accent}10 0%, ${T.bgDeep} 70%)` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal>
            <div style={{ width: 90, height: 90, borderRadius: "50%", margin: "0 auto 20px",
              border: `3px solid ${T.accent}`, padding: 3, boxShadow: `0 0 40px ${T.accent}33` }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%",
                background: "linear-gradient(135deg, #1a2540, #0a1020)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30, fontWeight: 900, color: T.accent }}>LF</div>
            </div>
            <p style={{ fontSize: 12, color: T.text3, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
              — Lucas Ferrari, fundador
            </p>
            <p style={{ fontSize: '12px', color: '#00E5FF', letterSpacing: '.1em', margin: '0 0 16px', fontWeight: 800 }}>
              🔥 47 VAGAS RESTANTES ESTA SEMANA
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '.1em', marginBottom: '16px' }}>
              (limitamos para garantir suporte por WhatsApp)
            </p>
            
            <CountdownTimer variant="block" />

            <h2 style={{ fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 900, margin: "32px 0 16px", lineHeight: 1.2 }}>
              Seu feed. Sua autoridade. <span style={{ color: T.accent }}>Sua decisão.</span>
            </h2>
            <p style={{ color: T.text2, fontSize: 15, marginBottom: 32, maxWidth: 540, margin: "0 auto 32px", lineHeight: 1.6 }}>
              Cada dia com feed parado é um cliente fechando com o concorrente. Em 5 minutos você posta e me prova que funciona.
            </p>
            <button id="cta-final" onClick={() => checkout("annual")}
              className="hover:scale-[1.03] active:scale-95 transition-all animate-pulse"
              style={{ background: T.accent, color: "#000", fontWeight: 900, fontSize: 17,
                padding: "20px 36px", borderRadius: 16, border: "none", cursor: "pointer",
                width: "100%", maxWidth: 480, textTransform: "uppercase", letterSpacing: 0.5,
                boxShadow: `0 16px 50px ${T.accent}66` }}>
              QUERO ACESSO AGORA — R$ 16,41/mês
            </button>
            <p style={{ marginTop: 14, fontSize: 12, color: T.text3 }}>
              Acesso em 2 min · Garantia tripla · Cancele quando quiser
            </p>
            <p style={{ marginTop: 24, fontSize: 11, color: T.text3 }}>CNPJ: 45.312.876/0001-22</p>
          </Reveal>
        </div>
      </section>

      </main>

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

      <ExitIntent onCta={() => checkout("annual")} />
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────

