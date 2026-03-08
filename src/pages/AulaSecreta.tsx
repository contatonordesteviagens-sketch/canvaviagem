import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

// ─── Types ───────────────────────────────────────────────────────────────────
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const TARGET_DATE = new Date("2026-03-18T20:00:00-03:00");

const DISCOVERIES = [
  {
    num: "01",
    title: "Por que postar foto bonita de destino está acabando com o seu alcance",
    desc: "O erro que 95% das agências cometem — e por que isso espanta exatamente o cliente que você quer.",
  },
  {
    num: "02",
    title: "O Efeito UAU — como gerar autoridade antes do cliente te chamar",
    desc: "Como seu feed faz o cliente decidir confiar em você 3 segundos antes de mandar a primeira mensagem.",
  },
  {
    num: "03",
    title: "Os 3 erros que travam o Instagram de toda agência pequena",
    desc: "Você provavelmente comete todos os três. E a solução de cada um é mais simples do que você imagina.",
  },
  {
    num: "04",
    title: "Por que você não é concorrente do Decolar — e como usar isso a seu favor",
    desc: "A virada de chave que separa agências que sobrevivem das que prosperam em 2026.",
  },
  {
    num: "05",
    title: "Como ter 5 meses de conteúdo pronto sem criar nada do zero",
    desc: "O sistema que transforma 15 minutos por dia em presença diária no feed dos seus clientes ideais.",
  },
  {
    num: "06",
    title: "O plano de 4 semanas para começar a receber orçamentos orgânicos",
    desc: "Exatamente o que fazer na semana 1, 2, 3 e 4 — sem adivinhar, sem improvisar.",
  },
];

const FAQS = [
  {
    q: "Preciso saber editar vídeo para participar?",
    a: "Não. Os conteúdos são entregues prontos. Você não precisa editar nada — só baixar e publicar. Esta aula foi feita especialmente para quem não tem tempo de aprender design.",
  },
  {
    q: "Funciona para agências de cidades pequenas?",
    a: "Sim. Turismo não tem fronteira no Instagram. Uma agência do interior pode atender cliente de São Paulo, do Rio, de qualquer cidade. Já aconteceu com quem usa nosso sistema.",
  },
  {
    q: "Já tentei postar e não funcionou. Por quê desta vez seria diferente?",
    a: "A diferença é consistência + conteúdo certo. Uma semana não forma hábito de compra no cliente. 5 meses sim. E agora você vai ter exatamente esse conteúdo pronto para postar todo dia, sem inventar.",
  },
  {
    q: "A aula é gratuita mesmo? Vai ter alguma venda?",
    a: "Sim, é 100% gratuita. Você vai receber o mapa completo para profissionalizar sua agência no Instagram. Se ao final quiser ir além com ferramentas prontas, você vai ter essa opção — mas sem nenhuma obrigação.",
  },
];

// ─── Hooks ───────────────────────────────────────────────────────────────────
function useCountdown(): TimeLeft {
  const calc = (): TimeLeft => {
    const diff = TARGET_DATE.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState<TimeLeft>(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "rgba(112,0,255,0.15)", border: "1px solid rgba(112,0,255,0.3)",
      borderRadius: 12, padding: "14px 20px", minWidth: 72,
    }}>
      <span style={{
        fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 800,
        background: "linear-gradient(135deg,#00D1FF,#7000FF)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        lineHeight: 1,
      }}>{pad(value)}</span>
      <span style={{ fontSize: 11, color: "#B0B0C0", fontWeight: 600, marginTop: 6, letterSpacing: "0.5px" }}>{label}</span>
    </div>
  );
}

function Countdown({ time }: { time: TimeLeft }) {
  const sep = <span style={{ fontSize: 28, fontWeight: 800, color: "#7000FF", marginBottom: 20 }}>:</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <CountdownBlock value={time.days} label="Dias" />
      {sep}
      <CountdownBlock value={time.hours} label="Horas" />
      {sep}
      <CountdownBlock value={time.minutes} label="Min" />
      {sep}
      <CountdownBlock value={time.seconds} label="Seg" />
    </div>
  );
}

function GlassCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 20,
      ...style,
    }}>{children}</div>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: 2,
      color: "#00D1FF", textTransform: "uppercase", marginBottom: 16,
    }}>{children}</span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
      {children}
    </h2>
  );
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: "linear-gradient(135deg,#00D1FF,#7000FF)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    }}>{children}</span>
  );
}

function PrimaryButton({ children, onClick, type = "button", style = {} }: {
  children: React.ReactNode; onClick?: () => void;
  type?: "button" | "submit"; style?: React.CSSProperties;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        background: "linear-gradient(135deg,#00D1FF,#7000FF)",
        color: "white", border: "none", padding: "18px 36px",
        fontSize: 16, fontWeight: 800, borderRadius: 50, cursor: "pointer",
        boxShadow: "0 10px 30px rgba(112,0,255,0.4)",
        fontFamily: "Inter, sans-serif", letterSpacing: "0.5px",
        width: "100%", transition: "transform 0.2s, box-shadow 0.2s",
        ...style,
      }}
      onMouseEnter={e => { (e.target as HTMLButtonElement).style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
    >{children}</button>
  );
}

function FormInput({ id, placeholder, type = "text", value, onChange }: {
  id: string; placeholder: string; type?: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      required
      style={{
        width: "100%", background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
        padding: "16px 20px", fontSize: 16, color: "#fff", outline: "none",
        fontFamily: "Inter, sans-serif",
      }}
      onFocus={e => { e.target.style.borderColor = "#7000FF"; e.target.style.background = "rgba(112,0,255,0.1)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
    />
  );
}

// ─── Registration Form ────────────────────────────────────────────────────────
function RegistrationForm({ onSuccess }: { onSuccess: (name: string) => void }) {
  const [name, setName] = useState("");
  const [wpp, setWpp] = useState("");

  const handleWpp = (v: string) => {
    let d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length >= 7) d = d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    else if (d.length >= 3) d = d.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    else if (d.length >= 1) d = d.replace(/^(\d{0,2})/, "($1");
    setWpp(d);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = wpp.replace(/\D/g, "");
    if (clean.length < 10) return;
    const leads = JSON.parse(localStorage.getItem("canvaviagem_leads") || "[]");
    leads.push({ name, whatsapp: clean, timestamp: new Date().toISOString(), source: "aula_secreta_18_03" });
    localStorage.setItem("canvaviagem_leads", JSON.stringify(leads));
    onSuccess(name.split(" ")[0]);
    setName("");
    setWpp("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <FormInput id="name" placeholder="Seu nome completo" value={name} onChange={setName} />
      <FormInput id="wpp" placeholder="WhatsApp com DDD (ex: 11 99999-9999)" type="tel" value={wpp} onChange={handleWpp} />
      <PrimaryButton type="submit" style={{ fontSize: 17, padding: "20px 36px" }}>
        🔓 QUERO MINHA VAGA GRATUITA
      </PrimaryButton>
    </form>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard style={{ overflow: "hidden", border: open ? "1px solid rgba(112,0,255,0.4)" : undefined }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: "none", border: "none", padding: "24px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
          cursor: "pointer", color: "#fff", fontFamily: "Inter, sans-serif",
          fontSize: 17, fontWeight: 600, textAlign: "left",
        }}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span style={{
          fontSize: 24, color: "#00D1FF", flexShrink: 0, lineHeight: 1,
          transform: open ? "rotate(45deg)" : "none", transition: "transform 0.3s",
        }}>+</span>
      </button>
      {open && (
        <p style={{
          padding: "0 32px 28px", fontSize: 15, color: "#B0B0C0",
          lineHeight: 1.7, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20,
        }}>{a}</p>
      )}
    </GlassCard>
  );
}

// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({ firstName, onClose }: { firstName: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <GlassCard style={{ maxWidth: 440, width: "100%", padding: "48px 40px", textAlign: "center", borderColor: "rgba(0,229,160,0.3)" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 16, color: "#00E5A0" }}>
          Vaga Garantida!
        </h3>
        <p style={{ fontSize: 16, color: "#B0B0C0", marginBottom: 12, lineHeight: 1.6 }}>
          Sua inscrição na <strong style={{ color: "#fff" }}>Aula Secreta de 18/03</strong> foi confirmada, <strong style={{ color: "#fff" }}>{firstName}</strong>!
        </p>
        <p style={{ fontSize: 14, color: "#B0B0C0", marginBottom: 28, lineHeight: 1.6 }}>
          Salve a data: <strong style={{ color: "#fff" }}>18/03 às 20h.</strong><br />
          Vamos te avisar no WhatsApp antes de começar.
        </p>
        <PrimaryButton
          onClick={onClose}
          style={{ background: "linear-gradient(135deg,#00E5A0,#00B8FF)", fontSize: 15, padding: "16px 32px" }}
        >
          PERFEITO, ESTOU PRONTO! ✓
        </PrimaryButton>
      </GlassCard>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const AulaSecreta = () => {
  const time = useCountdown();
  const [modalName, setModalName] = useState<string | null>(null);

  const s = {
    page: {
      minHeight: "100vh",
      background: "#050510",
      color: "#fff",
      fontFamily: "Inter, sans-serif",
      overflowX: "hidden" as const,
    } as React.CSSProperties,
    container: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" } as React.CSSProperties,
    section: { padding: "100px 0" } as React.CSSProperties,
  };

  return (
    <>
      <Helmet>
        <title>Aula Secreta — O Mapa da Agência 5 Estrelas | Canva Viagem</title>
        <meta name="description" content="Descubra o sistema que as melhores agências de viagem usam para vender todo dia no Instagram. Aula Secreta gratuita — 18/03/2026." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Background glow */}
      <div style={{
        position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none",
        background: "radial-gradient(circle at 50% 0%,rgba(112,0,255,.18),transparent 55%),radial-gradient(circle at 0% 100%,rgba(0,209,255,.07),transparent 40%)",
      }} />

      <div style={s.page}>

        {/* ── NAVBAR ── */}
        <nav style={{ margin: "20px 24px 0", position: "sticky", top: 20, zIndex: 1000 }}>
          <GlassCard style={{ padding: "0 24px" }}>
            <div style={{ ...s.container, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0" }}>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 800 }}>
                CANVA<span style={{ color: "#00D1FF" }}>VIAGEM</span>
              </span>
              <div style={{
                background: "rgba(255,255,255,0.08)", padding: "6px 16px", borderRadius: 50,
                fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#00D1FF",
                border: "1px solid rgba(0,209,255,0.2)",
              }}>AULA SECRETA • 18/03</div>
            </div>
          </GlassCard>
        </nav>

        {/* ── HERO ── */}
        <header style={{ ...s.container, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", padding: "80px 24px" }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{
              display: "inline-block", background: "rgba(112,0,255,0.2)", color: "#B080FF",
              padding: "8px 20px", borderRadius: 50, fontSize: 13, fontWeight: 700,
              marginBottom: 24, border: "1px solid rgba(112,0,255,0.35)", width: "fit-content", letterSpacing: "0.5px",
            }}>RESERVADO PARA AGENTES DE VIAGEM</span>

            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(32px,4vw,50px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
              "Sua agência some do Instagram no fim de semana.<br />
              <GradientText>Seus clientes não."</GradientText>
            </h1>

            <p style={{ color: "#B0B0C0", fontSize: 17, marginBottom: 36, lineHeight: 1.7 }}>
              O que as agências de luxo da Oscar Freire fazem para vender todo dia — enquanto você briga com o sistema de emissão.
            </p>

            {/* Countdown */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 14, color: "#B0B0C0", marginBottom: 12, fontWeight: 600 }}>⏳ A aula começa em:</p>
              <Countdown time={time} />
            </div>

            {/* Form */}
            <RegistrationForm onSuccess={setModalName} />
            <p style={{ marginTop: 14, color: "#FF6B6B", fontSize: 13, fontWeight: 600 }}>
              ⚠️ Vagas limitadas. Inscrições encerram em breve.
            </p>
          </div>

          {/* Right — Preview card */}
          <GlassCard style={{ padding: 30 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  background: "rgba(112,0,255,0.3)", color: "#C090FF", padding: "6px 14px",
                  borderRadius: 50, fontSize: 12, fontWeight: 700, border: "1px solid rgba(112,0,255,0.4)",
                }}>🔐 AULA SECRETA</span>
                <span style={{ fontSize: 13, color: "#00D1FF", fontWeight: 600 }}>18 de Março • 20h</span>
              </div>

              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>
                O Mapa da Agência<br /><GradientText>5 Estrelas</GradientText>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20 }}>
                {["Como ter 5 meses de conteúdo pronto","O Efeito UAU no seu Instagram","De 0 a 15 orçamentos por semana","Sem ser designer. Sem gastar horas.","100% gratuito"].map(t => (
                  <div key={t} style={{ fontSize: 15, color: "#B0B0C0" }}>✅ {t}</div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20 }}>
                <div style={{
                  width: 48, height: 48, background: "linear-gradient(135deg,#00D1FF,#7000FF)",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 16, flexShrink: 0,
                }}>LH</div>
                <div>
                  <strong style={{ display: "block", fontSize: 15 }}>Lucas Henrique</strong>
                  <span style={{ fontSize: 13, color: "#B0B0C0" }}>Criador do Canva Viagem</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </header>

        {/* ── PREMISSAS ── */}
        <section style={{ padding: "80px 0" }}>
          <div style={s.container}>
            <GlassCard style={{ padding: "56px" }}>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 800 }}>Vamos ser racionais:</h3>
              <div style={{ display: "flex", gap: 32, marginTop: 48 }}>
                {[
                  { n: "01", t: "Toda semana surgem novos viajantes pesquisando agências no Instagram." },
                  { n: "02", t: "Eles te julgam em 0.3 segundos pela aparência do seu perfil." },
                  { n: "03", t: "Agência com perfil amador só atrai cliente que pede desconto." },
                ].map(({ n, t }) => (
                  <div key={n} style={{ flex: 1 }}>
                    <GradientText><span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 44, fontWeight: 800, display: "block", marginBottom: 16 }}>{n}</span></GradientText>
                    <p style={{ fontSize: 16, color: "#B0B0C0", lineHeight: 1.6 }}>{t}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 52, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center", fontSize: 19, color: "#B0B0C0", lineHeight: 1.6 }}>
                <strong style={{ color: "#fff" }}>Conclusão Inevitável:</strong> Ou você aprende a ser designer à noite — ou usa o sistema que já entrega tudo pronto para você postar em <strong style={{ color: "#fff" }}>30 segundos.</strong>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ── O QUE VOCÊ VAI DESCOBRIR ── */}
        <section style={s.section}>
          <div style={s.container}>
            <SectionTag>O QUE VOCÊ VAI DESCOBRIR</SectionTag>
            <SectionTitle>Uma aula. <GradientText>Cinco meses de resultado.</GradientText></SectionTitle>
            <p style={{ color: "#B0B0C0", fontSize: 17, maxWidth: 680, lineHeight: 1.7, marginBottom: 56 }}>
              Nesta aula secreta de 60 minutos, você vai aprender o sistema que agências premium usam para nunca mais ficar sem o que postar.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {DISCOVERIES.map(({ num, title, desc }) => (
                <GlassCard key={num} style={{ padding: 32 }}>
                  <GradientText><span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 36, fontWeight: 800, display: "block", marginBottom: 16, lineHeight: 1 }}>{num}</span></GradientText>
                  <h4 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{title}</h4>
                  <p style={{ fontSize: 14, color: "#B0B0C0", lineHeight: 1.6 }}>{desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── PARA QUEM É ── */}
        <section style={s.section}>
          <div style={s.container}>
            <SectionTitle>Esta aula foi feita para <GradientText>você?</GradientText></SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 48 }}>
              <GlassCard style={{ overflow: "hidden" }}>
                <div style={{ padding: "20px 32px", fontWeight: 700, fontSize: 16, background: "rgba(0,229,160,0.12)", borderBottom: "1px solid rgba(0,229,160,0.2)", color: "#00E5A0" }}>
                  ✅ Esta aula É para você se...
                </div>
                <ul style={{ listStyle: "none", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {["Você é agente de viagem ou dono de pequena agência","Sabe que precisa do Instagram mas não sabe o que postar","Já tentou criar conteúdo e travou na tela em branco","Quer mais orçamentos chegando sem depender de indicação","Não tem tempo para aprender design mas quer presença digital","Quer que sua agência pareça grande sem gastar muito"].map(item => (
                    <li key={item} style={{ fontSize: 15, color: "#B0B0C0", paddingLeft: 20, position: "relative", lineHeight: 1.5 }}>
                      <span style={{ position: "absolute", left: 0, color: "#00E5A0", fontWeight: 700 }}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>

              <GlassCard style={{ overflow: "hidden" }}>
                <div style={{ padding: "20px 32px", fontWeight: 700, fontSize: 16, background: "rgba(255,70,70,0.1)", borderBottom: "1px solid rgba(255,70,70,0.2)", color: "#FF7070" }}>
                  ❌ Esta aula NÃO é para você se...
                </div>
                <ul style={{ listStyle: "none", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {["Você quer aprender 'estratégias complexas de marketing digital'","Está buscando curso demorado com horas de teoria","Acha que marketing digital não funciona para o turismo","Prefere continuar dependendo 100% de indicação"].map(item => (
                    <li key={item} style={{ fontSize: 15, color: "#B0B0C0", paddingLeft: 20, position: "relative", lineHeight: 1.5 }}>
                      <span style={{ position: "absolute", left: 0, color: "#FF7070", fontWeight: 700 }}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* ── BENEFÍCIOS ── */}
        <section style={s.section}>
          <div style={s.container}>
            <SectionTag>O QUE MUDA NA SUA AGÊNCIA</SectionTag>
            <SectionTitle>Você vai <GradientText>sentir a diferença</GradientText> em 30 dias</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, marginTop: 48 }}>
              {[
                { icon: "😌", title: "Alívio Imediato", desc: "Nunca mais abra o aplicativo sem saber o que postar. Você vai ter conteúdo pronto para mais de 5 meses — sem criar nada do zero." },
                { icon: "💎", title: "Autoridade Premium", desc: 'O cliente vai abrir seu Instagram, ver 6 meses de posts profissionais, e pensar: "essa agência é séria." — antes de te contratar.' },
                { icon: "⏳", title: "3 Horas de Volta Todo Mês", desc: "São 3 horas semanais que você perdia brigando no Canva. 12 horas por mês. De volta para o que realmente vende: o atendimento." },
              ].map(({ icon, title, desc }) => (
                <GlassCard key={title} style={{ padding: "40px 32px" }}>
                  <div style={{ fontSize: 42, marginBottom: 20 }}>{icon}</div>
                  <h4 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 14 }}>{title}</h4>
                  <p style={{ fontSize: 15, color: "#B0B0C0", lineHeight: 1.7 }}>{desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── AUTORIDADE ── */}
        <section style={s.section}>
          <div style={s.container}>
            <GlassCard style={{ padding: 60 }}>
              <SectionTag>QUEM VAI TE MOSTRAR ISSO</SectionTag>
              <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(32px,4vw,48px)", fontWeight: 800, marginBottom: 16, background: "linear-gradient(135deg,#00D1FF,#7000FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", width: "fit-content" }}>
                Lucas Henrique
              </h2>
              <p style={{ color: "#B0B0C0", fontSize: 17, maxWidth: 560, lineHeight: 1.7, marginBottom: 40 }}>
                Criador do Canva Viagem — o maior ecossistema de conteúdo digital para agências de viagem no Brasil.
              </p>
              <div style={{ display: "flex", gap: 48, marginBottom: 40 }}>
                {[
                  { num: "500+", label: "Agências atendidas" },
                  { num: "150+", label: "Vídeos para o nicho" },
                  { num: "100%", label: "Foco em agência de viagem" },
                ].map(({ num, label }) => (
                  <div key={label}>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{num}</div>
                    <div style={{ fontSize: 13, color: "#B0B0C0", marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
              <blockquote style={{ borderLeft: "3px solid #7000FF", paddingLeft: 24, fontSize: 18, color: "#B0B0C0", fontStyle: "italic", lineHeight: 1.7, maxWidth: 600 }}>
                "Eu não ensino teoria de marketing. Eu entrego o sistema pronto para você usar amanhã cedo."
                <cite style={{ display: "block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "#00D1FF", fontStyle: "normal" }}>— Lucas Henrique</cite>
              </blockquote>
            </GlassCard>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={s.section}>
          <div style={s.container}>
            <SectionTag>DÚVIDAS FREQUENTES</SectionTag>
            <SectionTitle>Perguntas que todo mundo <GradientText>sempre pergunta</GradientText></SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 48 }}>
              {FAQS.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{ padding: "100px 0 120px" }}>
          <div style={s.container}>
            <GlassCard style={{ padding: 60, textAlign: "center", borderTop: "3px solid transparent", backgroundImage: "linear-gradient(rgba(255,255,255,0.05),rgba(255,255,255,0.05)),linear-gradient(135deg,#00D1FF,#7000FF)", backgroundOrigin: "border-box", backgroundClip: "padding-box,border-box" }}>
              <SectionTag>GARANTA SUA VAGA AGORA</SectionTag>
              <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 800, margin: "16px 0 32px" }}>
                As inscrições encerram em:
              </h2>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Countdown time={time} />
              </div>
              <p style={{ fontSize: 18, color: "#B0B0C0", margin: "36px 0 32px", lineHeight: 1.6 }}>
                É gratuito. É ao vivo. É no dia <strong style={{ color: "#fff" }}>18/03/2026 às 20h.</strong>
              </p>
              <div style={{ maxWidth: 700, margin: "0 auto" }}>
                <RegistrationForm onSuccess={setModalName} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 24, marginTop: 32, fontSize: 14, color: "#B0B0C0", fontWeight: 600 }}>
                <span>🔒 100% Gratuito</span>
                <span>📱 Acesso no celular</span>
                <span>🎁 Bônus para inscritos</span>
                <span>⏱️ 60 minutos</span>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ padding: "60px 0 40px", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
          <div style={s.container}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
              CANVA<span style={{ color: "#00D1FF" }}>VIAGEM</span>
            </div>
            <p style={{ color: "#B0B0C0", fontSize: 14, marginBottom: 8 }}>© 2026 Canva Viagem — Lucas Henrique. Todos os direitos reservados.</p>
            <p style={{ fontSize: 12, color: "#B0B0C0", maxWidth: 500, margin: "0 auto", opacity: 0.6 }}>
              Este é um evento online gratuito. Ao se inscrever, você concorda em receber comunicações da Canva Viagem via WhatsApp.
            </p>
          </div>
        </footer>
      </div>

      {/* ── MODAL ── */}
      {modalName && <SuccessModal firstName={modalName} onClose={() => setModalName(null)} />}
    </>
  );
};

export default AulaSecreta;
