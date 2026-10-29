import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Check, X, Plus, MapPin, Sparkles, Download, Link2,
  Palette, PenLine, BadgeCheck, Compass, Instagram, MessageCircle, LayoutTemplate, Images, Globe,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";
import { BrandMark, Eyebrow, delay, useReveal } from "@/components/cv-cream/shared";
import antesAmador from "@/assets/antes_amador.png";
import depoisPremium from "@/assets/depois_premium.png";

export const ONBOARDING_PATH = "/onboarding";
export const ONBOARDING_DESTINO_KEY = "cv-onboarding-destino";

const outputs = [
  { src: "/travel-carousel-assets/cancun-card-01.webp", label: "Feed", icon: Instagram, rot: "-6deg" },
  { src: "/travel-carousel-assets/cancun-editorial-01.webp", label: "Carrossel", icon: Images, rot: "3deg" },
  { src: "/travel-carousel-assets/cancun-glass-01.webp", label: "Story", icon: LayoutTemplate, rot: "-2deg" },
  { src: "/travel-carousel-assets/cancun-card-02.webp", label: "Página", icon: Globe, rot: "5deg" },
];

const builtFor = [
  { label: "Instagram Feed", icon: Instagram },
  { label: "Stories", icon: LayoutTemplate },
  { label: "Carrosséis", icon: Images },
  { label: "WhatsApp", icon: MessageCircle },
  { label: "Página de vendas", icon: Globe },
];

const steps = [
  { n: "01", icon: Link2, title: "Escolha o destino", text: "Digite o destino, os dias e o valor do pacote." },
  { n: "02", icon: Sparkles, title: "Receba tudo pronto", text: "A Fábrica de Artes monta posts, stories e carrosséis com a sua logo." },
  { n: "03", icon: Download, title: "Publique e venda", text: "Baixe, poste no Instagram e mande a página no WhatsApp." },
];

const compare = [
  ["Artes de viagem prontas por destino", true, false],
  ["Sua logo e cores aplicadas sozinhas", true, false],
  ["Textos de venda escritos pela IA", true, false],
  ["Carrosséis para feed e stories", true, true],
  ["Página de vendas do pacote", true, false],
  ["CRM para organizar os leads", true, false],
  ["Calendário de conteúdo pronto", true, false],
  ["Não precisa saber design", true, false],
  ["Funciona no celular", true, true],
  ["7 dias de garantia", true, false],
] as const;

const proofs = [
  { stat: "1ª venda em 24h", quote: "Em menos de 24 horas tive minha primeira venda para Disney usando os anúncios que a IA gerou.", name: "Maria S.", role: "agente autônoma, São Paulo", bg: "#fde4ef" },
  { stat: "5 pacotes fechados", quote: "Com pouca verba apareceu muita gente interessada. Fiz 23 orçamentos só ontem e fechei 5 pacotes.", name: "Ricardo T.", role: "agência de viagens, Curitiba", bg: "#ebe5ff" },
  { stat: "0 pedidos de desconto", quote: "Mandei a página com o roteiro organizado e a conversa mudou. O cliente entendeu o valor antes de perguntar o preço.", name: "Ana C.", role: "consultora de viagens, Rio de Janeiro", bg: "#f3e3d3" },
];

const faqs = [
  { q: "Preciso saber design ou dominar o Canva?", a: "Não. A plataforma foi pensada para agência de viagem que precisa vender, não para designer. Você parte de modelos prontos, ajusta destino, preço e logo, e publica." },
  { q: "Isso substitui o Canva Pro?", a: "Não é a mesma coisa. O Canva Pro é uma ferramenta genérica. O Canva Viagem entrega artes, IA, páginas, CRM e fluxos feitos para vender pacotes de viagem." },
  { q: "Funciona pelo celular?", a: "Sim. Dá para criar e baixar tudo pelo celular. Para montar páginas e organizar campanhas, o computador deixa mais confortável." },
  { q: "O pagamento é seguro?", a: "Sim. O pagamento é processado pela Stripe, com acesso imediato e garantia de 7 dias conforme as regras do checkout." },
  { q: "E se eu não gostar?", a: "Você tem 7 dias para testar com um pacote real da sua agência. Se não fizer sentido, peça o reembolso dentro do prazo da garantia." },
];

const scoreBars = [22, 30, 26, 38, 44, 92, 52, 34, 28, 40, 58, 99, 66, 42, 30, 36, 48, 86, 54, 38, 30, 26];
const peaks: Record<number, string> = { 5: "8.7", 11: "9.6", 17: "8.9" };

const engine = [
  { icon: MapPin, title: "Destino", text: "Cada destino com fotos, roteiro e argumentos próprios." },
  { icon: Palette, title: "Design", text: "Layouts testados em agências que vendem todo dia." },
  { icon: PenLine, title: "Copy", text: "Texto de venda escrito pela IA, no tom da sua agência." },
  { icon: BadgeCheck, title: "Marca", text: "Sua logo, cores e contato em todas as peças." },
];

export default function InicioCreme() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const [destino, setDestino] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const tracked = useRef(false);
  const pageRef = useReveal<HTMLDivElement>();

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackMetaEvent("ViewContent", {
      content_name: "Canva Viagem - Plataforma para Agências",
      content_category: "inicio_creme",
      content_type: "product",
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const start = (source: string) => {
    const value = destino.trim();
    try {
      if (value) sessionStorage.setItem(ONBOARDING_DESTINO_KEY, value);
    } catch { /* sessionStorage indisponível */ }
    trackMetaEvent("Lead", { content_name: "inicio_creme_cta", content_category: source });
    if (user && subscription.subscribed) { navigate("/fabrica"); return; }
    navigate(user ? ONBOARDING_PATH : `/login?redirect=${encodeURIComponent(ONBOARDING_PATH)}`);
  };

  const onHeroSubmit = (e: FormEvent) => {
    e.preventDefault();
    start("hero_input");
  };

  return (
    <div ref={pageRef} className="cv-cream min-h-screen overflow-x-hidden">
      <Helmet>
        <title>Canva Viagem — Artes que vendem viagens, prontas em minutos</title>
        <meta name="description" content="Digite um destino e receba posts, stories, carrosséis e uma página de vendas prontos com a cara da sua agência." />
      </Helmet>

      {/* Header flutuante */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <div
          className="flex w-full max-w-5xl items-center justify-between rounded-full px-3 py-2 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(255,255,255,0.88)" : "transparent",
            border: `1px solid ${scrolled ? "var(--cv-line)" : "transparent"}`,
            backdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
            boxShadow: scrolled ? "0 10px 30px -18px rgba(32,28,19,.35)" : "none",
          }}
        >
          <a href="/inicio" aria-label="Canva Viagem" className="pr-2"><BrandMark size={44} /></a>
          <button onClick={() => start("header")} className="cv-btn h-11 px-5 text-[15px] sm:h-[52px] sm:px-7 sm:text-base">
            <span className="sm:hidden">Começar grátis</span>
            <span className="hidden sm:inline">Começar — é grátis</span>
          </button>
        </div>
      </header>

      <main>
        {/* 1. Hero */}
        <section className="px-4 pb-10 pt-32 sm:pt-40">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h1 className="cv-pop text-balance text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.025em] sm:text-6xl md:text-[4.5rem]">
              Transforme qualquer destino em posts que <span style={{ color: "var(--cv-primary-ink)" }}>vendem viagens.</span>
            </h1>
            <p className="cv-pop mt-6 max-w-lg text-lg leading-7" style={{ ...delay(120), color: "var(--cv-muted)" }}>
              Digite um destino e receba artes, stories, carrosséis e uma página de vendas prontos, com a cara da sua agência, em minutos.
            </p>

            <form onSubmit={onHeroSubmit} className="cv-pop mt-8 w-full max-w-xl" style={delay(220)}>
              <div className="flex flex-col gap-2 rounded-[28px] border bg-white p-2 shadow-[0_18px_40px_-24px_rgba(32,28,19,.35)] sm:flex-row sm:items-center sm:rounded-full" style={{ borderColor: "var(--cv-line)" }}>
                <label className="flex flex-1 items-center gap-3 px-4 py-2">
                  <MapPin className="h-5 w-5 shrink-0" style={{ color: "var(--cv-muted)" }} />
                  <input
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Digite um destino: Cancún, Gramado, Disney..."
                    className="w-full bg-transparent text-[15px] outline-none placeholder:text-[#9b917d]"
                    aria-label="Destino do pacote"
                  />
                </label>
                <button type="submit" className="cv-btn h-12 px-7 text-[15px] sm:h-[52px]">
                  Criar artes <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
            <a href="#como-funciona" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--cv-muted)" }}>
              <Compass className="h-3.5 w-3.5" /> ou veja como funciona
            </a>
          </div>

          {/* Demonstração: destino → artes prontas */}
          <div className="cv-pop mx-auto mt-14 max-w-4xl rounded-[36px] bg-[#16130d] p-4 sm:p-6" style={delay(320)}>
            <div className="flex flex-col items-center gap-3 rounded-[26px] bg-[#221d14] px-4 py-4 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-3 text-[14px] text-[#e9dfc4]">
                <MapPin className="h-4 w-4 text-[#b9a8ff]" />
                <span className="font-semibold">Cancún</span>
                <span className="text-[#9b917d]">· 7 dias · casal · R$ 8.900</span>
              </div>
              <span className="cv-btn pointer-events-none h-10 px-5 text-[14px]">Criar artes <ArrowRight className="h-4 w-4" /></span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-6 sm:grid-cols-4 sm:gap-5 sm:pt-8">
              {outputs.map((o, i) => (
                <div key={o.label} className="cv-float" style={{ ...delay(i * 350), ["--cv-rot" as string]: o.rot }}>
                  <div className="overflow-hidden rounded-[20px] border-4 border-[#2c261b] bg-black shadow-xl">
                    <img src={o.src} alt={`Arte de ${o.label} gerada para Cancún`} className="aspect-[4/5] w-full object-cover" loading="lazy" />
                  </div>
                  <div className="mx-auto -mt-4 flex w-max items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-bold shadow-md">
                    <o.icon className="h-3.5 w-3.5" style={{ color: "var(--cv-accent)" }} /> {o.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-2 rounded-full border bg-white px-4 py-3" style={{ borderColor: "var(--cv-line)" }}>
            <span className="mr-2 text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>FEITO PARA</span>
            {builtFor.map((b) => (
              <span key={b.label} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: "var(--cv-sand)" }}>
                <b.icon className="h-3.5 w-3.5" /> {b.label}
              </span>
            ))}
          </div>
        </section>

        {/* 2. Como funciona */}
        <section id="como-funciona" className="scroll-mt-24 px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Como funciona</Eyebrow>
              <h2 className="cv-h2 mt-4">Três passos até o seu primeiro post vendendo</h2>
              <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Escolha o destino → receba as artes → publique e venda. Só isso.</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.n} className="cv-reveal cv-card p-5" style={delay(i * 120)}>
                  <div className="flex items-start justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: "var(--cv-accent-soft)", color: "var(--cv-accent)" }}>
                      <s.icon className="h-4 w-4" />
                    </span>
                    <span className="text-lg font-extrabold text-[#e6dcc0]">{s.n}</span>
                  </div>
                  <StepIllustration index={i} />
                  <h3 className="mt-4 text-base font-extrabold tracking-[-0.4px]">{s.title}</h3>
                  <p className="mt-1 text-sm leading-6" style={{ color: "var(--cv-muted)" }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Por que funciona */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Por que funciona</Eyebrow>
              <h2 className="cv-h2 mt-4">Seu post vende. Sua agência parece grande.</h2>
              <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>
                Cada arte sai com design profissional, texto de venda e a sua marca, enquanto o post feito às pressas passa batido no feed.
              </p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              <div className="cv-reveal">
                <span className="mb-2 inline-block rounded-full border bg-white px-3 py-1 text-[11px] font-semibold" style={{ borderColor: "var(--cv-line)", color: "var(--cv-muted)" }}>Post feito às pressas</span>
                <div className="relative overflow-hidden rounded-[28px] bg-[#bdb7a7]">
                  <img src={antesAmador} alt="Post amador de agência de viagens" className="aspect-[4/3] w-full object-cover opacity-80 grayscale-[35%]" loading="lazy" />
                  <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[13px] font-bold text-white">14 curtidas</span>
                </div>
              </div>
              <div className="cv-reveal" style={delay(140)}>
                <span className="mb-2 inline-block rounded-full px-3 py-1 text-[11px] font-semibold text-white" style={{ background: "var(--cv-primary)" }}>Feito no Canva Viagem</span>
                <div className="relative overflow-hidden rounded-[28px] ring-2" style={{ ["--tw-ring-color" as string]: "var(--cv-primary)" }}>
                  <img src={depoisPremium} alt="Post profissional criado no Canva Viagem" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold text-white" style={{ background: "var(--cv-primary)" }}>
                    <MessageCircle className="h-3.5 w-3.5" /> chuva de orçamentos
                  </span>
                </div>
              </div>
            </div>

            <div className="cv-reveal mt-6 overflow-hidden rounded-[32px] border" style={{ borderColor: "var(--cv-line)" }}>
              <table className="w-full text-left text-sm">
                <thead style={{ background: "#f6edd2" }}>
                  <tr>
                    <th className="px-4 py-4 font-medium sm:px-6" style={{ color: "var(--cv-muted)" }}>Recurso</th>
                    <th className="px-2 py-4 text-center font-bold sm:px-6">Canva Viagem</th>
                    <th className="px-2 py-4 text-center font-medium sm:px-6" style={{ color: "var(--cv-muted)" }}>Canva comum</th>
                  </tr>
                </thead>
                <tbody>
                  {compare.map(([label, us, them]) => (
                    <tr key={label} className="border-t" style={{ borderColor: "var(--cv-line)" }}>
                      <td className="px-4 py-4 sm:px-6">{label}</td>
                      <td className="px-2 py-4 sm:px-6"><Check className="mx-auto h-4 w-4 text-[#16a34a]" /></td>
                      <td className="px-2 py-4 sm:px-6">{them ? <Check className="mx-auto h-4 w-4 text-[#8a8170]" /> : <X className="mx-auto h-4 w-4 text-[#8a8170]" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. Prova */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Prova</Eyebrow>
              <h2 className="cv-h2 mt-4">Agências já estão vendendo com isso</h2>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {proofs.map((p, i) => (
                <figure key={p.name} className="cv-reveal flex flex-col rounded-[32px] p-8" style={{ ...delay(i * 120), background: p.bg }}>
                  <span className="text-[32px] font-semibold tracking-[-0.02em]">{p.stat}</span>
                  <blockquote className="mt-4 flex-1 text-[15px] leading-6">“{p.quote}”</blockquote>
                  <figcaption className="mt-6">
                    <p className="text-sm font-bold">{p.name}</p>
                    <p className="text-[13px]" style={{ color: "var(--cv-muted)" }}>{p.role}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* 5. FAQ */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <div className="cv-reveal text-center">
              <Eyebrow>Dúvidas</Eyebrow>
              <h2 className="cv-h2 mt-4">Perguntas, respondidas</h2>
            </div>
            <div className="mt-10 space-y-3">
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q} className="cv-reveal rounded-[32px] border" style={{ ...delay(i * 60), borderColor: "var(--cv-line)", background: "rgba(255,255,255,.88)", backdropFilter: "blur(16px) saturate(1.4)" }}>
                    <h3>
                      <button onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-semibold">
                        {f.q}
                        <Plus className="h-4 w-4 shrink-0 transition-transform duration-300" style={{ color: "var(--cv-muted)", transform: open ? "rotate(45deg)" : "none" }} />
                      </button>
                    </h3>
                    <div className="grid transition-all duration-300" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
                      <p className="overflow-hidden px-6 text-[15px] leading-6" style={{ color: "var(--cv-muted)", paddingBottom: open ? 20 : 0 }}>{f.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. Por dentro — Fábrica de Artes */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div className="cv-reveal">
                <Eyebrow>Por dentro</Eyebrow>
                <h2 className="cv-h2 mt-4">Conheça a Fábrica de Artes</h2>
                <p className="mt-4 text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
                  É o motor do Canva Viagem. Ele junta <strong className="text-[var(--cv-fg)]">destino, design, texto de venda e a sua marca</strong> e gera dezenas de variações de cada pacote.
                </p>
                <p className="mt-4 text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
                  As melhores vão para o seu feed. O resto nem precisa existir.
                </p>
              </div>
              <div className="cv-reveal cv-card p-6 shadow-[0_20px_50px_-30px_rgba(32,28,19,.4)] sm:p-8" style={delay(140)}>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>NOTA DE CONVERSÃO</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: "var(--cv-accent-soft)", color: "var(--cv-accent)" }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--cv-accent)" }} /> 3 artes campeãs
                  </span>
                </div>
                <div className="mt-6 flex h-48 items-end gap-[6px]">
                  {scoreBars.map((h, i) => (
                    <div key={i} className="relative flex h-full flex-1 items-end">
                      {peaks[i] && (
                        <span className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#efe9ff] px-2 py-0.5 text-[11px] font-semibold text-[#6440e6]" style={{ bottom: `calc(${h}% + 8px)` }}>
                          {peaks[i]}
                        </span>
                      )}
                      <div className="cv-bar w-full rounded-full" style={{ ...delay(i * 30), height: `${h}%`, background: peaks[i] ? "#ff3d8b" : "#e9e1cc" }} />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-[11px]" style={{ color: "var(--cv-muted)" }}>
                  <span>variação 1</span><span>variação 22</span>
                </div>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {engine.map((e, i) => (
                <div key={e.title} className="cv-reveal cv-card p-5" style={delay(i * 90)}>
                  <span className="grid h-11 w-11 place-items-center rounded-full" style={{ background: "var(--cv-accent-soft)", color: "var(--cv-accent)" }}>
                    <e.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-extrabold">{e.title}</h3>
                  <p className="mt-1 text-[13px] leading-5" style={{ color: "var(--cv-muted)" }}>{e.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 7. CTA final */}
      <section className="px-4 pb-10 pt-24" style={{ background: "linear-gradient(180deg, var(--cv-bg) 0%, #e9defc 55%, #c9b8fb 100%)" }}>
        <div className="cv-reveal mx-auto max-w-2xl text-center">
          <h2 className="cv-h2">Pare de postar no improviso.<br />Comece a vender.</h2>
          <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Escolha o destino → receba as artes → publique e venda.</p>
          <button onClick={() => start("final_cta")} className="cv-btn mt-8 h-14 px-8 text-base">
            Criar minhas artes <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <footer className="mx-auto mt-24 flex max-w-5xl flex-col items-center justify-between gap-4 border-t pt-6 text-[13px] sm:flex-row" style={{ borderColor: "rgba(32,28,19,.12)", color: "var(--cv-muted)" }}>
          <BrandMark size={32} withName={false} />
          <div className="flex gap-5">
            <a href="/termos" className="hover:underline">Termos</a>
            <a href="/privacidade" className="hover:underline">Privacidade</a>
          </div>
          <p>© {new Date().getFullYear()} Canva Viagem. Todos os direitos reservados.</p>
        </footer>
      </section>
    </div>
  );
}

function StepIllustration({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="flex w-44 items-center gap-2 rounded-full border px-3 py-2" style={{ background: "var(--cv-sand)", borderColor: "#e6dcc0" }}>
          <MapPin className="h-3.5 w-3.5 text-[#8a8170]" />
          <span className="h-1.5 flex-1 rounded-full bg-[#cfc4a6]" />
          <span className="h-5 w-10 rounded-full" style={{ background: "var(--cv-primary)" }} />
        </div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="flex h-32 items-end justify-center gap-3 pb-4">
        <span className="h-16 w-10 rounded-lg border" style={{ background: "var(--cv-sand)", borderColor: "#e6dcc0" }} />
        <span className="grid h-20 w-10 place-items-center rounded-lg" style={{ background: "#ff3d8b" }}><Sparkles className="h-4 w-4 text-white" /></span>
        <span className="h-12 w-10 rounded-lg border" style={{ background: "var(--cv-sand)", borderColor: "#e6dcc0" }} />
      </div>
    );
  }
  return (
    <div className="flex h-32 flex-col items-center justify-center gap-3">
      <span className="grid h-12 w-14 place-items-center rounded-lg border" style={{ background: "var(--cv-sand)", borderColor: "#e6dcc0" }}>
        <Download className="h-5 w-5 text-[#e01e72]" />
      </span>
      <div className="flex items-center gap-2">
        <span className="h-5 w-5 rounded-full" style={{ background: "var(--cv-primary)" }} />
        <span className="h-px w-5 border-t border-dashed border-[#cfc4a6]" />
        <span className="h-5 w-5 rounded-full bg-[#ff3d8b]" />
        <span className="h-px w-5 border-t border-dashed border-[#cfc4a6]" />
        <span className="h-5 w-5 rounded-full bg-[#25d366]" />
      </div>
    </div>
  );
}
