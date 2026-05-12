import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Star, Shield, Play, ArrowRight, Briefcase, Users } from "lucide-react";
import { trackViewContent, trackInitiateCheckout } from "@/lib/meta-pixel";
import { ProductDemo } from "../components/planos/ProductDemo";
import { CountdownTimer } from "../components/planos/CountdownTimer";
import { StickyTopBar } from "../components/planos/StickyTopBar";
import { SocialProofToast } from "../components/planos/SocialProofToast";
import { MobileFloatingCTA } from "../components/planos/MobileFloatingCTA";
import lucasPortrait from "@/assets/lucas-ferrari-portrait.webp";
import depoimento1 from "@/assets/depoimento1.jpg";
import depoimento2 from "@/assets/depoimento2.png";
import depoimento3 from "@/assets/depoimento3.jpg";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { WorldMap } from "@/components/ui/map";

// ────────────────────────────────────────────────────────────
// CONFIG
// ────────────────────────────────────────────────────────────
const STRIPE = {
  smart_monthly: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
  smart_annual: "https://buy.stripe.com/dRm8wQ75U1wk7eH9wU8so09",
  elite_monthly: "https://buy.stripe.com/fZucN6bma6QEeH96kI8so0c",
  elite_annual: "https://buy.stripe.com/fZu14ogGugreeH9bF28so0d",
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



const PAINS = [
  { emoji: "👻", title: "Instagram Fantasma", text: "Você posta uma vez por semana (com medo) e o engajamento é zero. Cliente passa direto para o concorrente." },
  { emoji: "🎨", title: "Designer Entregou Lixo", text: "Pagou R$ 500 nas artes bonitas mas não vende." },
  { emoji: "💸", title: "Viajante de alta renda Te Ignora", text: "Quem paga R$ 8.000 por pacote olha seu perfil 3 segundos e vai para o concorrente com perfil e site top." },
  { emoji: "⏳", title: "Não Fazer Nada Custa Mais", text: "Cada dia com perfil e site parado são viagens que seu concorrente fecha no lugar de você. O custo real de não agir é muito mais que 8k/mês em vendas que você não faz." },
];

const HOW_IT_WORKS = [
  { num: "1", title: "ESCOLHE", text: "250+ vídeos 4K por destino. Maragogi, Caribe, Europa — atualizados toda semana." },
  { num: "2", title: "PERSONALIZA", text: "Abre no Canva, troca o logo, ajusta a cor da marca. Em 2 minutos está pronto." },
  { num: "3", title: "POSTA", text: "Calendário pronto + scripts de WhatsApp para converter o DM em pacote vendido." },
];

// Comparativo justo: pack único vs designer freelancer vs Canva Viagem
const COMPARISON = [
  { feature: "Investimento",  hotmart: "R$ 197 uma vez", design: "R$ 1.500 / mês", us: "A partir de R$ 197 / ano" },
  { feature: "Conteúdo",      hotmart: "150 reels fixos", design: "4–8 entregas/mês", us: "250+ vídeos 4K + Sites de Vendas" },
  { feature: "Atualizações",  hotmart: "❌ Nenhuma", design: "Depende dele", us: "✅ Acesso vitalício à evolução" },
  { feature: "IAs e Scripts", hotmart: "❌ Não tem", design: "❌ Não tem", us: "✅ 11 IAs + Fábrica de Anúncios" },
  { feature: "Suporte",       hotmart: "Só do produtor", design: "1 freelancer", us: "WhatsApp VIP direto com o Lucas" },
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
  return <img src={photo} onError={() => setFailed(true)} alt={name} width={size} height={size} loading="lazy"
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
const ExitIntent = ({ onCheckout }: { onCheckout: (plan: "smart_annual" | "elite_annual") => void }) => {
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
            padding: "40px 32px", maxWidth: 480, textAlign: "center", position: "relative" }}>
          <button onClick={() => setOpen(false)} style={{ position: "absolute", top: 12, right: 16,
            background: "transparent", border: "none", color: T.text3, fontSize: 24, cursor: "pointer" }}>✕</button>
          <p style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>OPORTUNIDADE ÚNICA</p>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text, marginBottom: 12, lineHeight: 1.2 }}>
            Não saia sem garantir o seu <span style={{ color: T.accent }}>Lote Promocional</span>
          </h2>
          <p style={{ color: T.text2, fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>
            Escolha abaixo a melhor opção de acesso para a sua agência antes que o preço suba na próxima virada de lote:
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Botão Plano Elite (Recomendado) */}
            <button 
              onClick={() => { onCheckout("elite_annual"); setOpen(false); }} 
              style={{ 
                width: "100%",
                background: "linear-gradient(135deg, #FF3366, #FF6600)",
                color: "#FFFFFF", 
                fontWeight: 900, 
                fontSize: 15, 
                padding: "16px 20px",
                borderRadius: 14, 
                border: "none", 
                cursor: "pointer", 
                textTransform: "uppercase", 
                letterSpacing: 0.5,
                boxShadow: "0 8px 24px rgba(255, 51, 102, 0.4)"
              }}
            >
              Garantir Plano Elite (R$ 347/ano) ⭐
            </button>

            {/* Botão Plano Start */}
            <button 
              onClick={() => { onCheckout("smart_annual"); setOpen(false); }} 
              style={{ 
                width: "100%",
                background: "transparent",
                color: T.text2, 
                fontWeight: 800, 
                fontSize: 14, 
                padding: "14px 20px",
                borderRadius: 14, 
                border: `1px solid rgba(255, 255, 255, 0.2)`, 
                cursor: "pointer", 
                textTransform: "uppercase", 
                letterSpacing: 0.5,
                transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"}
            >
              Garantir Plano Start (R$ 197/ano)
            </button>
          </div>
          
          <p style={{ marginTop: 18, fontSize: 11, color: T.text3 }}>🔒 Acesso em 2 min · Garantia tripla · Cancelamento simples</p>
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
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");
  const pricingRef = useRef<HTMLDivElement>(null);
  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.3,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const trackCtaClick = (ctaName: string) => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'cta_click',
      cta_name: ctaName
    });
    console.log(`[Analytics] Tracked click on CTA: ${ctaName}`);
  };

  useEffect(() => {
    trackViewContent("Canva Viagem 10/10");
    window.scrollTo(0, 0);

    // Dynamic SEO Title & Description
    document.title = "Canva Viagem — Poste como agência de R$10k/mês em 5 minutos";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'A plataforma de marketing definitiva para agências de viagens e turismo que buscam atrair viajantes de alta renda e fechar pacotes premium de forma consistente.');

    // Dynamic Open Graph tags
    const setOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    setOGTag("og:title", "Canva Viagem — Poste como agência de R$10k/mês em 5 minutos");
    setOGTag("og:description", "Crie posts de alta conversão no Canva em minutos.");
    // Prevenir carregar a foto gigante como OG Image
    setOGTag("og:image", "https://canvaviagem.com/og-image.jpg");
    setOGTag("og:type", "website");

    // Dynamic GTM script injection
    const gtmId = "GTM-XXXXXX";
    const gtmScript = document.createElement('script');
    gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
    document.head.appendChild(gtmScript);

    // Smooth scroll injection
    const style = document.createElement('style');
    style.innerHTML = 'html { scroll-behavior: smooth; }';
    document.head.appendChild(style);
  }, []);

  const checkout = (plan: "smart_monthly" | "smart_annual" | "elite_monthly" | "elite_annual" = "elite_annual") => {
    setCtaClicked(true);
    trackCtaClick(plan);
    let priceVal = 347;
    if (plan === "smart_monthly") priceVal = 29.9;
    else if (plan === "smart_annual") priceVal = 197;
    else if (plan === "elite_monthly") priceVal = 97;
    trackInitiateCheckout(priceVal);
    window.open(STRIPE[plan], "_blank");
  };

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh", overflowX: "hidden",
      fontFamily: "Inter, system-ui, sans-serif" }}>

      <ScrollProgressBar />
      <StickyTopBar onCheckout={() => checkout("elite_annual")} />
      <SocialProofToast ctaClicked={ctaClicked} />
      <MobileFloatingCTA onCheckout={() => checkout("elite_annual")} />

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
            maxWidth: 960, margin: "0 auto 18px", letterSpacing: -1 }}>
            Tenha um feed profissional de{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.accent}, #fff)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              R$ 10k/mês
            </span>{" "}
            e crie anúncios de viagens automáticos com Inteligência Artificial!
          </h1>
        </Reveal>

        {/* Video Demonstration directly under Headline */}
        <Reveal delay={0.1}>
          <div style={{ margin: "32px auto", maxWidth: 800 }}>
            <ProductDemo />
          </div>
        </Reveal>

        {/* Subheadline directly below Video */}
        <Reveal delay={0.15}>
          <p style={{ fontSize: 16, color: T.text2, maxWidth: 820, margin: "0 auto 28px", lineHeight: 1.6 }}>
            A única plataforma do mercado de turismo que combina <strong style={{ color: T.text }}>250+ vídeos 4K</strong> e <strong style={{ color: T.text }}>artes editáveis no Canva</strong> com a revolucionária <strong style={{ color: T.accent }}>Fábrica de Anúncios com I.A</strong> — onde você digita a oferta e recebe o anúncio pronto, com preços, parcelas e o seu logo em 5 segundos. <strong style={{ color: T.accent }}>A partir de R$ 16,41/mês.</strong>
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
              Quero começar agora — a partir de R$ 16,41/mês
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



      {/* ─── ANIMAÇÃO GLOBAL NETWORK (WORLD MAP) ─── */}
      <section style={{ padding: "60px 0 0px", background: T.bgDeep, overflow: "hidden", position: "relative" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "0 20px" }}>
          <Reveal>
            <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12, textTransform: "uppercase" }}>CONECTE-SE AO MUNDO</p>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, marginBottom: 16, lineHeight: 1.2, textTransform: "uppercase" }}>
              VENDA DESTINOS DE TODO O MUNDO
            </h2>
            <p style={{ color: T.text2, fontSize: 15, maxWidth: 600, margin: "0 auto 24px", lineHeight: 1.6 }}>
              Escale suas vendas com mídias de profissionais para os destinos mais cobiçados do mercado nacional e internacional.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div style={{ width: "100%", position: "relative", marginTop: 20 }}>
            <WorldMap 
              dots={[
                {
                  start: { lat: -2.7996, lng: -40.5128, label: "Jericoacoara", labelOffset: { x: 0, y: -2.5 } },
                  end: { lat: 51.5074, lng: -0.1278, label: "London", labelOffset: { x: 0, y: -2.5 } }
                },
                {
                  start: { lat: -22.9068, lng: -43.1729, label: "Rio", labelOffset: { x: 0, y: 2.5 } },
                  end: { lat: 25.2048, lng: 55.2708, label: "Dubai", labelOffset: { x: 2.5, y: 0 } }
                },
                {
                  start: { lat: -23.5505, lng: -46.6333, label: "São Paulo", labelOffset: { x: -3, y: 0 } },
                  end: { lat: 34.0522, lng: -118.2437, label: "Los Angeles", labelOffset: { x: -2.5, y: 0 } }
                },
                {
                  start: { lat: -8.0476, lng: -34.8770, label: "Recife", labelOffset: { x: 3, y: 0 } },
                  end: { lat: 48.8566, lng: 2.3522, label: "Paris", labelOffset: { x: 2.5, y: -2 } }
                }
              ]}
            />
          </div>
        </Reveal>
      </section>

      {/* ─── SEÇÃO FUNDADOR ─── */}
      <section style={{ padding: "70px 20px", background: T.bgDeep, borderBottom: T.border }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(26px, 4.5vw, 40px)", fontWeight: 900, marginBottom: 36 }}>
              Quem está por trás disso
            </h2>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, marginBottom: 40 }}>
            <Reveal>
              <div style={{ position: "relative" }}>
                <img 
                  src={lucasPortrait} 
                  alt="Lucas Ferrari" 
                  loading="lazy"
                  style={{ 
                    width: 140, 
                    height: 140, 
                    borderRadius: "50%", 
                    border: `3px solid ${T.accent}`,
                    boxShadow: `0 0 24px ${T.accent}33`,
                    objectFit: "cover" 
                  }} 
                  width={140}
                  height={140}
                />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.7, maxWidth: 680, margin: "0 auto" }}>
                Sou <strong style={{ color: T.text }}>Lucas Ferrari</strong>. Operei agência de viagens e fazendo marketing para outras agências de viagens por 10 anos, fechei mais de <strong style={{ color: T.accent }}>R$ 4 milhões em pacotes vendidos online</strong> para minha agência e meus clientes, e construí o Canva Viagem porque eu mesmo precisava disso e não encontrava.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <a 
                href="https://www.instagram.com/lucasferrari.pro/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: 8, 
                  color: T.accent, 
                  fontWeight: 800, 
                  fontSize: 15, 
                  textDecoration: "none",
                  background: `${T.accent}15`,
                  padding: "10px 20px",
                  borderRadius: 100,
                  border: `1px solid ${T.accent}44`,
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${T.accent}33`}
                onMouseLeave={e => e.currentTarget.style.background = `${T.accent}15`}
              >
                Me seguir no Instagram →
              </a>
            </Reveal>
          </div>

          {/* 3 cards de credencial */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            <Reveal delay={0.2}>
              <div style={{ background: T.card, border: T.border, borderRadius: 18, padding: 24, textAlign: "left", height: "100%", display: "flex", gap: 16, alignItems: "start" }}>
                <div style={{ color: T.accent, background: `${T.accent}10`, padding: 10, borderRadius: 12, flexShrink: 0 }}><Briefcase size={20} /></div>
                <div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 800, color: T.text }}>Experiência</h4>
                  <p style={{ margin: 0, fontSize: 13, color: T.text2, lineHeight: 1.5 }}>10 anos operando com agências de viagens emissivas e receptivas</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div style={{ background: T.card, border: T.border, borderRadius: 18, padding: 24, textAlign: "left", height: "100%", display: "flex", gap: 16, alignItems: "start" }}>
                <div style={{ color: T.accent, background: `${T.accent}10`, padding: 10, borderRadius: 12, flexShrink: 0 }}><Users size={20} /></div>
                <div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 800, color: T.text }}>Comunidade</h4>
                  <p style={{ margin: 0, fontSize: 13, color: T.text2, lineHeight: 1.5 }}>64 mil seguidores no Instagram @lucasferrari.pro</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div style={{ background: T.card, border: T.border, borderRadius: 18, padding: 24, textAlign: "left", height: "100%", display: "flex", gap: 16, alignItems: "start" }}>
                <div style={{ color: T.accent, background: `${T.accent}10`, padding: 10, borderRadius: 12, flexShrink: 0 }}><Star size={20} /></div>
                <div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 800, color: T.text }}>Pioneirismo</h4>
                  <p style={{ margin: 0, fontSize: 13, color: T.text2, lineHeight: 1.5 }}>1ª plataforma de marketing completa para viagens e turismo do mundo!</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      {/* ─── DOR (3 cards) ─── */}
      <section style={{ padding: "70px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>VOCÊ SE IDENTIFICA?</p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, marginBottom: 12 }}>
              Vender viagens ficou impossível com um perfil comum
            </h2>
            <p style={{ color: T.text2, fontSize: 15, marginBottom: 36, maxWidth: 600, margin: "0 auto 36px" }}>
              Se você se identifica com algum desses, continue lendo.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
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
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <Reveal>
              <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>RESULTADOS REAIS</p>
              <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900 }}>
                Quem virou a chave em 30 dias
              </h2>
            </Reveal>
          </div>

          {/* WhatsApp Print Testimonials Gallery */}
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 32, marginTop: 40 }}>
              <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>PROVA REAL INDISCUTÍVEL</p>
              <h3 style={{ fontSize: "clamp(20px, 3.5vw, 28px)", fontWeight: 900, marginBottom: 16 }}>
                Resultados diretos no WhatsApp de quem usa
              </h3>
            </div>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", 
              gap: 20, 
              marginBottom: 48 
            }}>
              {[depoimento1, depoimento2, depoimento3].map((img, index) => (
                <div key={index} style={{ 
                  background: T.card, 
                  border: `1px solid rgba(0, 229, 255, 0.15)`, 
                  borderRadius: 20, 
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                }} className="hover:scale-[1.03] hover:border-cyan-400 transition-all">
                  <img 
                    src={img} 
                    alt={`Resultado real ${index + 1}`} 
                    loading="lazy"
                    style={{ 
                      width: "100%", 
                      height: "auto", 
                      maxHeight: 480, 
                      objectFit: "contain" 
                    }} 
                    width={320}
                    height={480}
                  />
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
      <section id="pricing" ref={pricingRef} style={{ padding: "80px 20px", position: "relative" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Reveal>
              <p style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>ACESSO IMEDIATO</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, marginBottom: 24, display: "flex", justifyContent: "center" }}>
                <VerticalCutReveal
                  splitBy="words"
                  staggerDuration={0.12}
                  staggerFrom="first"
                  reverse={true}
                  containerClassName="justify-center"
                  transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 40,
                    delay: 0,
                  }}
                >
                  Escolha o seu plano
                </VerticalCutReveal>
              </h2>

              {/* TOGGLE MENSAL / ANUAL */}
              <div style={{ 
                display: "inline-flex", 
                background: "rgba(255, 255, 255, 0.04)", 
                border: "1px solid rgba(255, 255, 255, 0.1)", 
                borderRadius: "100px", 
                padding: "4px", 
                marginBottom: "32px" 
              }}>
                <button 
                  onClick={() => setBillingPeriod("annual")}
                  style={{ 
                    background: billingPeriod === "annual" ? T.accent : "transparent",
                    color: billingPeriod === "annual" ? "#000000" : T.text2,
                    border: "none",
                    borderRadius: "100px",
                    padding: "10px 24px",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  PAGAR ANUAL
                </button>
                <button 
                  onClick={() => setBillingPeriod("monthly")}
                  style={{ 
                    background: billingPeriod === "monthly" ? T.accent : "transparent",
                    color: billingPeriod === "monthly" ? "#000000" : T.text2,
                    border: "none",
                    borderRadius: "100px",
                    padding: "10px 24px",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  PAGAR MENSAL
                </button>
              </div>

              <div style={{ display: "inline-flex", gap: 8, alignItems: "center", background: `${T.accent}15`,
                border: `1px solid ${T.accent}44`, borderRadius: 100, padding: "8px 18px", marginBottom: 12 }}>
                <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                  Apenas 14 vagas restantes com acesso completo
                </span>
              </div>
              <p style={{ color: T.text3, fontSize: 12, margin: "0 auto 16px" }}>
                (as inscrições encerram automaticamente assim que as vagas forem preenchidas)
              </p>
            </Reveal>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
            gap: 32, alignItems: "stretch", marginTop: 40, maxWidth: 860, margin: "40px auto 0" }}>
            
            {/* PLANO START */}
            <TimelineContent
              as="div"
              animationNum={1}
              timelineRef={pricingRef}
              customVariants={revealVariants}
            >
              <div style={{ 
                background: "rgba(255, 255, 255, 0.02)", 
                border: "1px solid rgba(255, 255, 255, 0.08)", 
                borderRadius: 24, 
                padding: "48px 32px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
              }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 800, color: T.text3, letterSpacing: 2, marginBottom: 20 }}>PLANO START</p>
                  
                  {billingPeriod === "monthly" ? (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 22, fontWeight: 800 }}>R$</span>
                      <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>29</span>
                      <span style={{ fontSize: 22, fontWeight: 800 }}>,90</span>
                      <span style={{ fontSize: 14, color: T.text3, marginLeft: 4 }}>/mês</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 22, fontWeight: 800 }}>R$</span>
                      <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>16</span>
                      <span style={{ fontSize: 22, fontWeight: 800 }}>,41</span>
                      <span style={{ fontSize: 14, color: T.text3, marginLeft: 4 }}>/mês</span>
                    </div>
                  )}

                  <p style={{ fontSize: 12, color: T.text3, marginBottom: 28 }}>
                    {billingPeriod === "monthly" ? "Assinatura mensal recorrente" : "Equivalente a R$ 197,00 cobrados anualmente"}
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      "Acesso ilimitado a 400+ mídias de viagens",
                      "Reels, Stories, Artes feed de alta conversão",
                      "Modelos prontos e 100% editáveis no Canva",
                      "Texto e Copys de Ofertas de pacotes magnéticos",
                      "Influencers de I.A prontos para divulgar",
                      "Robôs de Inteligência Artificial tira-dúvidas",
                      "Suporte completo por WhatsApp"
                    ].map(f => (
                      <li key={f} style={{ display: "flex", gap: 10, alignItems: "start", fontSize: 13, color: T.text2 }}>
                        <span style={{ marginTop: 2, flexShrink: 0 }}><Check size={14} color={T.accent} /></span>
                        <span>{f}</span>
                      </li>
                    ))}
                    {[
                      "Fábrica: Gerador de Anúncios e Ofertas de viagens",
                      "Fábrica: Gerador de Sites de viagens de conversão",
                      "Diagnóstico e Plano de ação individual para escala"
                    ].map(f => (
                      <li key={f} style={{ display: "flex", gap: 10, alignItems: "start", fontSize: 13, color: "rgba(255,255,255,0.25)", textDecoration: "line-through" }}>
                        <span style={{ marginTop: 2, flexShrink: 0 }}><X size={14} color="rgba(255,255,255,0.2)" /></span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => checkout(billingPeriod === "monthly" ? "smart_monthly" : "smart_annual")}
                  onMouseEnter={e => (e.currentTarget.style.background = `${T.accent}1a`)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  style={{ width: "100%", padding: 16, borderRadius: 12, border: `2px solid ${T.accent}`,
                    background: "transparent", color: T.accent, fontWeight: 800, fontSize: 14,
                    cursor: "pointer", letterSpacing: 0.5, transition: "background 0.2s" }}
                >
                  Começar com o Start
                </button>
              </div>
            </TimelineContent>

            {/* PLANO ELITE */}
            <TimelineContent
              as="div"
              animationNum={2}
              timelineRef={pricingRef}
              customVariants={revealVariants}
            >
              <div style={{ 
                background: "linear-gradient(145deg, #071a2e 0%, #0d2640 100%)",
                border: `2px solid ${T.accent}`, 
                borderRadius: 24, 
                padding: "48px 32px 40px",
                position: "relative", 
                boxShadow: `0 20px 60px ${T.accent}33`,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ position: "absolute", top: 0, left: "50%",
                    transform: "translate(-50%,-50%)", background: T.accent, color: "#000", fontWeight: 900,
                    fontSize: 11, padding: "6px 16px", borderRadius: 100, whiteSpace: "nowrap",
                    boxShadow: `0 8px 20px ${T.accent}44` }}>
                    ⭐ RECOMENDADO PARA ESCALA
                  </div>
                  
                  <p style={{ fontSize: 12, fontWeight: 800, color: T.accent, letterSpacing: 2, marginBottom: 20 }}>PLANO ELITE</p>
                  
                  {billingPeriod === "monthly" ? (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 22, fontWeight: 800 }}>R$</span>
                      <span style={{ fontSize: 64, fontWeight: 900, lineHeight: 1 }}>97</span>
                      <span style={{ fontSize: 22, fontWeight: 800 }}>,00</span>
                      <span style={{ fontSize: 14, color: T.text3, marginLeft: 4 }}>/mês</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 22, fontWeight: 800 }}>R$</span>
                      <span style={{ fontSize: 64, fontWeight: 900, lineHeight: 1 }}>28</span>
                      <span style={{ fontSize: 22, fontWeight: 800 }}>,91</span>
                      <span style={{ fontSize: 14, color: T.text3, marginLeft: 4 }}>/mês</span>
                    </div>
                  )}

                  <p style={{ fontSize: 12, color: T.text2, marginBottom: 28 }}>
                    {billingPeriod === "monthly" ? "Assinatura mensal sem fidelidade" : "Equivalente a R$ 347,00 cobrados anualmente (Economia massiva)"}
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <li style={{ display: "flex", gap: 10, alignItems: "start", fontSize: 13, fontWeight: 800, color: T.accent }}>
                      <span style={{ marginTop: 2, flexShrink: 0 }}><Check size={14} color={T.accent} /></span>
                      <span>TUDO DO PLANO START +</span>
                    </li>
                    {[
                      "Gerador de Anúncios e Artes de Viagem ILIMITADO (fotos reais em 5 segundos)",
                      "Criador Automático de Sites de Venda para cada roteiro de viagem",
                      "Gerador de Legendas magnéticas prontas para copiar e colar",
                      "Plano de Ação e Checklist diário de postagens diárias",
                      "Diagnóstico e Plano de ação individualizado para escala",
                      "Suporte VIP no WhatsApp diretamente com Lucas Ferrari"
                    ].map(f => (
                      <li key={f} style={{ display: "flex", gap: 10, alignItems: "start", fontSize: 13, color: T.text }}>
                        <span style={{ marginTop: 2, flexShrink: 0 }}><Check size={14} color={T.accent} /></span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <button 
                    onClick={() => checkout(billingPeriod === "monthly" ? "elite_monthly" : "elite_annual")}
                    className="hover:scale-[1.02] active:scale-95 transition-all"
                    style={{ width: "100%", padding: 18, borderRadius: 14, background: T.accent, color: "#000",
                      fontWeight: 900, fontSize: 15, cursor: "pointer", border: "none",
                      boxShadow: `0 12px 40px ${T.accent}55`, textTransform: "uppercase", letterSpacing: 0.5 }}
                  >
                    Quero o Elite →
                  </button>
                  <p style={{ textAlign: "center", fontSize: 12, color: T.text3, marginTop: 16, marginBottom: 0 }}>
                    ⚡ Acesso imediato · Suporte garantido
                  </p>
                </div>
              </div>
            </TimelineContent>

          </div>

          {/* ANCORAGEM DE PREÇO */}
          <Reveal delay={0.25}>
            <div style={{ 
              maxWidth: 600, 
              margin: "48px auto 0", 
              background: "rgba(255,255,255,0.02)", 
              border: `1px solid rgba(0, 229, 255, 0.15)`, 
              borderRadius: 20, 
              padding: "28px",
              textAlign: "center"
            }}>
              <h4 style={{ fontSize: 16, fontWeight: 900, color: T.accent, marginBottom: 18, textTransform: "uppercase", letterSpacing: 1 }}>
                O que você deixa de ganhar sem isso:
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
                <li style={{ display: "flex", gap: 10, fontSize: 14, color: T.text2 }}>
                  <span style={{ color: "#FF3366" }}>✕</span>
                  <span><strong>Sem o Canva Viagem:</strong> feed parado = 0 DMs orgânicos por mês</span>
                </li>
                <li style={{ display: "flex", gap: 10, fontSize: 14, color: T.text }}>
                  <span style={{ color: T.accent }}>✓</span>
                  <span><strong>1 pacote vendido pelo feed:</strong> R$ 3.500 a R$ 8.000 de lucro</span>
                </li>
                <li style={{ display: "flex", gap: 10, fontSize: 14, color: T.accent, fontWeight: 800 }}>
                  <span style={{ color: T.accent }}>⭐</span>
                  <span><strong>Retorno do plano Elite em 1 venda:</strong> 2.300%</span>
                </li>
              </ul>
              <p style={{ fontSize: 12, color: T.text3, margin: 0 }}>
                1 pacote de viagem fechado paga 23 anos de assinatura.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── GARANTIA DUPLA ─── */}
      <section style={{ padding: "70px 20px", background: T.bgDeep }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ width: 90, height: 90, borderRadius: "50%", margin: "0 auto 24px",
              background: `${T.accent}15`, border: `2px solid ${T.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🛡️</div>
            <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>Garantia Dupla</h3>
            <p style={{ fontSize: 15, color: T.accent, fontWeight: 700, marginBottom: 28 }}>
              O risco é 100% meu — não seu.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left", marginBottom: 32 }}>
              {[
                { n: "1", t: "7 dias para testar tudo", s: "Acesso completo. Não gostou? Devolvo." },
                { n: "2", t: "Qualidade não convenceu?", s: "100% de volta." },
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

            {/* SECURE STRIPE BANNER */}
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: 12, 
              background: "rgba(255, 255, 255, 0.02)", 
              border: T.border, 
              borderRadius: 16, 
              padding: "20px",
              marginTop: 24
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                <span style={{ fontSize: 13, color: T.text2, display: "flex", alignItems: "center", gap: 6 }}>
                  🔒 Processado com segurança via
                </span>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/960px-Stripe_Logo%2C_revised_2016.svg.png" 
                  alt="Stripe" 
                  style={{ height: 16, objectFit: "contain", verticalAlign: "middle" }} 
                  width={70}
                  height={16}
                  loading="lazy"
                />
              </div>
              <p style={{ fontSize: 12, color: T.text3, margin: 0 }}>
                CNPJ: 45.312.876/0001-22 · Conexão Criptografada SSL 256-bits
              </p>
            </div>
          </Reveal>
        </div>
      </section>



      {/* ─── CTA FINAL ─── */}
      <section style={{ padding: "70px 20px", textAlign: "center",
        background: `radial-gradient(ellipse at 50% 50%, ${T.accent}10 0%, ${T.bgDeep} 70%)` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 900, margin: "24px 0 16px", lineHeight: 1.2 }}>
              Seu feed. Sua autoridade. <span style={{ color: T.accent }}>Sua decisão.</span>
            </h2>
            <p style={{ color: T.text2, fontSize: 15, marginBottom: 24, maxWidth: 540, margin: "0 auto 24px", lineHeight: 1.6 }}>
              Cada dia com feed parado é um pacote fechando com o concorrente. Em 5 minutos você prova que funciona.
            </p>
            <button id="cta-final" onClick={() => checkout("elite_annual")}
              aria-label="Quero acesso Elite"
              className="hover:scale-[1.03] active:scale-95 transition-all animate-pulse"
              style={{ background: T.accent, color: "#000", fontWeight: 900, fontSize: 17,
                padding: "20px 36px", borderRadius: 16, border: "none", cursor: "pointer",
                width: "100%", maxWidth: 480, textTransform: "uppercase", letterSpacing: 0.5,
                boxShadow: `0 16px 50px ${T.accent}66` }}>
              QUERO ACESSO ELITE — R$ 28,91/MÊS →
            </button>
            <p style={{ marginTop: 14, fontSize: 12, color: T.text3 }}>
              Acesso em 2 min · Garantia dupla · Cancele quando quiser
            </p>
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

      </main>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: T.bgDeep, borderTop: T.border, padding: "40px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, letterSpacing: 1, color: T.accent }}>CANVA VIAGEM</div>
          <p style={{ fontSize: 13, color: T.text3, marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
            A plataforma definitiva para agências de turismo que buscam o próximo nível de autoridade e lucro.
          </p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
            {["Início", "Planos", "Termos", "Privacidade", "Suporte"].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: T.text2, textDecoration: "none", fontWeight: 600 }} className="hover:text-cyan-400 transition-colors">{l}</a>
            ))}
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 24, opacity: 0.8 }}>
            <span style={{ fontSize: 11, color: T.text3 }}>Parceiro de pagamento oficial:</span>
            <span style={{ color: "#635BFF", display: "inline-flex", alignItems: "center" }}>
              <svg viewBox="0 0 60 25" fill="currentColor" style={{ height: 16 }}>
                <path d="M51.9 10.1c-1.3 0-2.1.7-2.1 1.8 0 1.6 2.2 1.3 2.2 3.6 0 1-.9 1.6-2.1 1.6-1.5 0-2.4-.7-2.4-.7l-.4 1.5s.9.6 2.7.6c2.4 0 3.9-1.2 3.9-3.2 0-2.5-3.8-2-3.8-3.7 0-1 .9-1.4 1.9-1.4 1.3 0 2 .5 2 .5l.4-1.4s-.7-.5-2.3-.5zm-8.8.1c-.8 0-1.4.3-1.7.7V3.5l-1.8.4v14.4l1.8-.4v-4.9c0-1.7 1.1-2.4 2.1-2.4.3 0 .6.1.6.1l.3-1.7c-.4-.1-.8-.1-1.3-.1zm-5.8-.1c-.9 0-1.5.4-1.8.8v-.6h-1.8v10.5h1.8v-4.9c0-1.6 1.1-2.4 2-2.4s1.4.6 1.4 1.7v5.6h1.8v-6.3c0-2.6-1.4-4.4-3.4-4.4zm-7.6 2.4l1.8-.3V10.3h-1.8v2.2zm0 5.8l1.8-.3v-4.2h-1.8v4.5zM21 7.1c0-.5.4-.9.9-.9.6 0 .9.4.9.9s-.4.9-.9.9c-.5 0-.9-.4-.9-.9zm-.9 3.2h1.8V18.3H20.1V10.3zm-3.2-.2c-1.3 0-2.1.7-2.1 1.8 0 1.6 2.2 1.3 2.2 3.6 0 1-.9 1.6-2.1 1.6-1.5 0-2.4-.7-2.4-.7l-.4 1.5s.9.6 2.7.6c2.4 0 3.9-1.2 3.9-3.2 0-2.5-3.8-2-3.8-3.7 0-1 .9-1.4 1.9-1.4 1.3 0 2 .5 2 .5l.4-1.4s-.7-.5-2.3-.5zm-6.2 3.8c-.1-.8-.6-1.2-1.3-1.2-.6 0-1.1.4-1.2 1.2h2.5zm1.5 1c0-2.3-1.6-4-4-4-2.5 0-4.1 1.8-4.1 4.1 0 2.5 1.7 4.1 4.3 4.1 1.6 0 2.8-.6 2.8-.6l-.4-1.4s-1 .5-2.3.5c-1.6 0-2.4-1-2.4-1.9h6.1v-.8z"/>
              </svg>
            </span>
          </div>

          <p style={{ fontSize: 11, color: T.text3, lineHeight: 1.6 }}>
            © 2026 Canva Viagem · Todos os direitos reservados. CNPJ: 45.312.876/0001-22<br/>
            <span style={{ fontSize: 10, opacity: 0.6 }}>Esta plataforma não possui vínculo oficial com a empresa Canva Pty Ltd.</span>
          </p>
        </div>
      </footer>

      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────

