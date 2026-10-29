import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentType, type DragEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Check, X, Plus, MapPin, Sparkles, Download, Mic, Upload, Infinity as InfinityIcon,
  Instagram, MessageCircle, LayoutTemplate, Images, Globe, Video, Users, Megaphone, Smartphone, Monitor,
  CalendarDays, LayoutDashboard, Play, Lock, ShieldCheck, Palette, PenLine, BadgeCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";
import { ELITE_OFFER } from "@/lib/eliteOffer";
import { BrandMark, Eyebrow, delay, useReveal } from "@/components/cv-cream/shared";
import { siteOfferDemos } from "@/lib/site-offer-demos";
import AutoplayLoopVideo from "@/components/travel-agency-content/AutoplayLoopVideo";
import antesAmador from "@/assets/antes_amador.png";
import depoisPremium from "@/assets/depois_premium.png";
import heroDashboard from "@/assets/hero_dashboard.jpg";
import dashboardInterno from "@/assets/dashboard_interno.png";
import showcaseAds from "@/assets/images/showcase-ad-creation.png";
import showcasePages from "@/assets/images/showcase-landing-pages.png";
import showcaseCrm from "@/assets/images/showcase-crm.png";
import showcaseScheduler from "@/assets/images/showcase-scheduler.png";
import showcaseMedia from "@/assets/images/showcase-premium-medias.png";

export const ONBOARDING_PATH = "/onboarding";
export const ONBOARDING_DESTINO_KEY = "cv-onboarding-destino";
export const ONBOARDING_LOGO_KEY = "cv-onboarding-logo";

type Icon = ComponentType<{ className?: string }>;

// Peças reais saídas da Fábrica (mesma faixa da página de carrosséis).
const STRIP = [
  "cancun-glass-01", "cancun-card-01", "cancun-editorial-01", "gramado-offer-01", "cancun-glass-02", "cancun-card-02",
  "cancun-editorial-02", "gramado-offer-02", "cancun-glass-03", "cancun-card-03", "cancun-editorial-03", "gramado-offer-05", "cancun-glass-04",
].map((n) => `/travel-carousel-assets/${n}.webp`);

const builtFor: { label: string; icon: Icon }[] = [
  { label: "Anúncios", icon: Megaphone },
  { label: "Instagram Feed", icon: Instagram },
  { label: "Stories", icon: LayoutTemplate },
  { label: "Carrosséis", icon: Images },
  { label: "Site", icon: Globe },
  { label: "Vídeos", icon: Video },
  { label: "WhatsApp", icon: MessageCircle },
];

const steps = [
  { n: "01", icon: Mic, title: "Mande um áudio", text: "Fale o destino, os dias e o valor, do jeito que você fala com um cliente. Se preferir, digite." },
  { n: "02", icon: Sparkles, title: "Receba tudo pronto", text: "Anúncio, carrossel, stories, a página do pacote e o vídeo saem montados, já com a sua logo." },
  { n: "03", icon: Download, title: "Publique e venda", text: "Baixe, poste no Instagram, impulsione o anúncio e mande o site no WhatsApp." },
];

type ToolTab = "principais" | "videos" | "artes" | "sites" | "ia" | "venda";
const TOOL_TABS: { id: ToolTab; label: string }[] = [
  { id: "principais", label: "Principais" }, { id: "videos", label: "Vídeos" }, { id: "artes", label: "Artes" },
  { id: "sites", label: "Sites" }, { id: "ia", label: "IA" }, { id: "venda", label: "Venda" },
];
const TOOLS: { img: string; title: string; text: string; icon: Icon; tags: ToolTab[] }[] = [
  { img: showcaseAds, title: "Anúncios prontos para impulsionar", text: "Pacote, preço e condições viram anúncio de feed e stories em segundos, com a sua marca.", icon: Megaphone, tags: ["principais", "artes", "ia"] },
  { img: showcasePages, title: "Site com a página de cada pacote", text: "Roteiro, fotos e valor organizados num link para mandar no WhatsApp e passar confiança.", icon: Globe, tags: ["principais", "sites", "venda"] },
  { img: showcaseCrm, title: "Seus clientes organizados", text: "Quem pediu orçamento pelo site cai numa lista com nome, WhatsApp e destino. Nada se perde.", icon: Users, tags: ["principais", "venda"] },
  { img: showcaseScheduler, title: "Calendário de postagens", text: "O que postar em cada dia da semana, já com as peças prontas. Chega de improviso.", icon: CalendarDays, tags: ["principais", "artes"] },
  { img: showcaseMedia, title: "Vídeos e artes por destino", text: "Reels, stories e artes de turismo prontos para adaptar à sua agência e postar hoje.", icon: Video, tags: ["principais", "videos", "artes"] },
  { img: dashboardInterno, title: "Tudo no mesmo painel", text: "Anúncios, carrosséis, site, vídeos e clientes sem trocar de ferramenta o tempo todo.", icon: LayoutDashboard, tags: ["principais", "ia", "sites", "videos"] },
];

const compare = [
  ["Fala o pacote num áudio e recebe tudo pronto", true, false],
  ["Sua logo e cores aplicadas sozinhas", true, false],
  ["Anúncios para feed e stories", true, false],
  ["Carrosséis prontos por destino", true, true],
  ["Site com a página de cada pacote", true, false],
  ["Seus clientes organizados num só lugar", true, false],
  ["Vídeos de destinos prontos para postar", true, false],
  ["Sem limite: 1 ou 1.000 peças no mesmo dia", true, false],
  ["Funciona no celular", true, true],
  ["7 dias de garantia", true, false],
] as const;

const faqs = [
  { q: "É ilimitado mesmo?", a: "Sim. Não existe crédito, cota nem contador. Você pode gerar uma peça ou mil no mesmo dia: anúncios, carrosséis, stories, páginas e vídeos. O ilimitado fica travado para quem assina agora." },
  { q: "Preciso saber design ou dominar o Canva?", a: "Não. Você fala ou digita o pacote e escolhe entre os modelos prontos. Destino, preço e logo entram sozinhos." },
  { q: "Preciso gravar áudio?", a: "Não. O áudio é o caminho mais rápido, mas você pode digitar destino, dias e valor e o resultado é o mesmo." },
  { q: "Funciona pelo celular?", a: "Sim. Dá para gravar o áudio, gerar e baixar tudo pelo celular. Para mexer no site com calma, o computador é mais confortável." },
  { q: "E se eu não gostar?", a: "Você tem 7 dias para testar com um pacote real da sua agência. Se não fizer sentido, peça o reembolso dentro do prazo da garantia." },
];

const engine: { icon: Icon; title: string; text: string }[] = [
  { icon: MapPin, title: "Entende o pacote", text: "Destino, dias, valor e o que está incluso, do seu áudio ou do que você digitou." },
  { icon: Palette, title: "Monta em modelos testados", text: "Layouts que agências usam todo dia, para feed, stories, carrossel e site." },
  { icon: PenLine, title: "Escreve o texto de venda", text: "Legenda, chamada do anúncio e descrição do pacote, no tom da sua agência." },
  { icon: BadgeCheck, title: "Aplica a sua marca", text: "Logo, cores e WhatsApp em todas as peças. Troca a logo, troca tudo." },
];

const yearGifs = {
  main: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm5kcmcybmE2aTFkOTU3ZDNqYmZkbHQ2YjRibjB1NjFtN2RoNWdrMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6osnZ6joYcPfERZsaE/giphy.gif",
  previews: [
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3J2anV0aTVkYWowbDl1ZXFtNnB4ZWUwcnVnZTVzOW91ZzNncGNvNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mbylDFYWSU46XeLcsS/giphy.gif",
    "https://media4.giphy.com/media/VVMI7dobalrJhKmQOZ/giphy.gif",
    "https://media4.giphy.com/media/tJPdq4gvTvr8CgIyWI/giphy.gif",
  ],
};

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
    trackMetaEvent("ViewContent", { content_name: "Canva Viagem - Plataforma para Agências", content_category: "inicio_creme", content_type: "product" });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Todo caminho leva ao mesmo lugar: e-mail → quiz → pagamento (e-mail novo não espera o link). Assinante vai para a Fábrica. */
  const start = (source: string) => {
    const value = destino.trim();
    try {
      if (value) sessionStorage.setItem(ONBOARDING_DESTINO_KEY, value);
    } catch { /* sessionStorage indisponível */ }
    trackMetaEvent("Lead", { content_name: "inicio_creme_cta", content_category: source });
    if (user && subscription.subscribed) { navigate("/fabrica"); return; }
    navigate(user ? ONBOARDING_PATH : `/login?redirect=${encodeURIComponent(ONBOARDING_PATH)}&entrada=rapida`);
  };

  const onHeroSubmit = (e: FormEvent) => {
    e.preventDefault();
    start("hero_input");
  };

  return (
    <div ref={pageRef} className="cv-cream min-h-screen overflow-x-hidden">
      <Helmet>
        <title>Canva Viagem — Mande um áudio e receba anúncios, carrosséis, site e vídeos prontos</title>
        <meta name="description" content="Fale o destino, os dias e o valor do pacote. Em minutos saem anúncios, carrosséis, stories, o site e os vídeos, com a sua logo. Sem limite de quantidade." />
      </Helmet>

      {/* Cabeçalho flutuante */}
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
            Comece agora <ArrowRight className="hidden h-4 w-4 sm:block" />
          </button>
        </div>
      </header>

      <main>
        {/* 1. Hero */}
        <section className="px-4 pb-6 pt-28 sm:pt-36">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Eyebrow className="cv-pop">Para agências de viagens sem equipe de marketing</Eyebrow>
            <h1 className="cv-pop mt-4 text-balance text-[2.5rem] font-extrabold leading-[1.02] tracking-[-0.025em] sm:text-6xl md:text-[4.4rem]" style={delay(60)}>
              Mande um áudio. Receba sua agência <span style={{ color: "var(--cv-primary-ink)" }}>inteira pronta.</span>
            </h1>
            <p className="cv-pop mt-6 max-w-xl text-lg leading-7" style={{ ...delay(120), color: "var(--cv-muted)" }}>
              Fale o destino, os dias e o valor, do jeito que você fala com um cliente. Em minutos saem o anúncio, o carrossel, os stories, a página do pacote e os vídeos, tudo com a sua logo.
            </p>

            <form onSubmit={onHeroSubmit} className="cv-pop mt-8 w-full max-w-xl" style={delay(220)}>
              <div className="flex flex-col gap-2 rounded-[28px] border bg-white p-2 shadow-[0_18px_40px_-24px_rgba(32,28,19,.35)] sm:flex-row sm:items-center sm:rounded-full" style={{ borderColor: "var(--cv-line)" }}>
                <label className="flex flex-1 items-center gap-3 px-4 py-2">
                  <MapPin className="h-5 w-5 shrink-0" style={{ color: "var(--cv-muted)" }} />
                  <input
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Digite um destino: Cancún, Gramado, Disney..."
                    className="w-full bg-transparent text-[16px] outline-none placeholder:text-[#9b917d]"
                    aria-label="Destino do pacote"
                  />
                </label>
                <button type="submit" className="cv-btn h-12 px-7 text-[15px] sm:h-[52px]">
                  Criar agora <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

          </div>

          {/* Faixa infinita de peças reais */}
          <div className="cv-pop mx-auto mt-12 max-w-6xl" style={delay(380)}>
            <div className="mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-center gap-2 px-2 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold text-white" style={{ background: "var(--cv-primary)" }}>
                <InfinityIcon className="h-3.5 w-3.5" /> ILIMITADO · SEM CRÉDITOS
              </span>
              <p className="text-[14px] font-semibold" style={{ color: "var(--cv-muted)" }}>Carrosséis, anúncios e stories saindo da Fábrica agora. Pode fazer 1 ou 1.000 no mesmo dia.</p>
            </div>
            <Marquee />
          </div>
          <button
            type="button"
            onClick={() => start("hero_audio")}
            className="cv-pop cv-mic mx-auto mt-6 flex w-fit min-h-14 items-center gap-3 rounded-full border bg-white pl-2 pr-6 text-left shadow-[0_14px_30px_-20px_rgba(32,28,19,.4)]"
            style={{ ...delay(440), borderColor: "var(--cv-line)" }}
          >
            <span className="relative grid h-11 w-11 place-items-center rounded-full text-white" style={{ background: "var(--cv-primary)" }}>
              <span className="cv-ping absolute inset-0 rounded-full" style={{ background: "var(--cv-primary)" }} />
              <Mic className="relative h-5 w-5" />
            </span>
            <span>
              <span className="block text-[15px] font-bold">Ou grave um áudio</span>
              <span className="block text-[12px]" style={{ color: "var(--cv-muted)" }}>"Cancún, 7 dias, casal, 8.900 reais" já basta</span>
            </span>
          </button>

          <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-2 rounded-full border bg-white px-4 py-3" style={{ borderColor: "var(--cv-line)" }}>
            <span className="mr-2 text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>SAI PRONTO PARA</span>
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
              <h2 className="cv-h2 mt-4">Um áudio. Três passos. A semana inteira resolvida.</h2>
              <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Você fala → a Fábrica monta → você publica. O resto é cliente chamando.</p>
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
            <div className="cv-reveal mt-8 text-center">
              <button onClick={() => start("steps_cta")} className="cv-btn h-13 min-h-[52px] px-7 text-[15px]">
                <Mic className="h-4 w-4" /> Mandar meu primeiro áudio
              </button>
            </div>
          </div>
        </section>

        {/* 3. Ilimitado */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[36px] bg-[#16130d] px-6 py-12 text-[#f4ecd8] sm:px-12 sm:py-16">
            <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
              <div className="cv-reveal">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold tracking-[0.6px]">
                  <InfinityIcon className="h-4 w-4 text-[#ff8cbb]" /> SEM CRÉDITOS · SEM COTA · SEM CONTADOR
                </span>
                <h2 className="cv-h2 mt-5 text-white">Aqui não existe "acabou sua cota".</h2>
                <p className="mt-5 text-lg leading-7 text-[#d9d0b8]">
                  Outras ferramentas vendem por crédito: 50 artes por mês e tchau. Aqui você faz <strong className="text-white">1 ou 1.000 no mesmo dia.</strong>
                </p>
                <p className="mt-4 text-lg leading-7 text-[#d9d0b8]">
                  Terça saem 30 stories de Gramado. Quarta, 12 anúncios de Cancún para testar qual chama mais. Sábado o site inteiro de novo, porque o preço mudou. Ninguém te cobra por isso.
                </p>
                <p className="mt-4 text-lg font-semibold leading-7 text-white">
                  Quem posta mais, aparece mais. Quem aparece mais, fecha mais. Ganhe no volume.
                </p>
              </div>
              <div className="cv-reveal rounded-[28px] border border-white/10 bg-white/[0.04] p-6" style={delay(140)}>
                <p className="text-[11px] font-bold tracking-[1.2px] text-[#b9ae95]">UMA SEMANA DE FÁBRICA</p>
                <ul className="mt-4 space-y-3 text-[15px]">
                  {[
                    ["Ter", "30 stories de Gramado", "0 créditos"],
                    ["Qua", "12 anúncios de Cancún", "0 créditos"],
                    ["Qui", "4 carrosséis de Noronha", "0 créditos"],
                    ["Sáb", "Site republicado com preço novo", "0 créditos"],
                  ].map(([d, t, c]) => (
                    <li key={d} className="flex items-center gap-3 border-b border-white/10 pb-3 last:border-0 last:pb-0">
                      <span className="w-9 text-[12px] font-bold text-[#b9ae95]">{d}</span>
                      <span className="flex-1">{t}</span>
                      <span className="rounded-full bg-[#2b2417] px-2.5 py-0.5 text-[12px] font-bold text-[#ff8cbb]">{c}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-2xl border border-[#ff8cbb]/30 bg-[#ff8cbb]/10 p-4 text-[13px] leading-5 text-[#ffd6e6]">
                  <Lock className="mb-1 inline h-3.5 w-3.5" /> <strong>Ilimitado travado para quem assina agora.</strong> Planos novos podem vir com limite; quem já está dentro continua sem.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Escolha o que criar hoje */}
        <ToolsGrid onStart={() => start("tools_cta")} />

        {/* 5. Equipe inteira */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Sem contratar ninguém</Eyebrow>
              <h2 className="cv-h2 mt-4">Tudo o que uma equipe de marketing faria. Num só lugar.</h2>
              <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Designer, social media, editor de vídeo e programador: a Fábrica faz o trabalho dos quatro enquanto você atende.</p>
            </div>
            <TeamImage />
          </div>
        </section>

        {/* 6. Site pronto */}
        <SiteDemo onStart={() => start("site_demo_cta")} />

        {/* 7. Sua logo em tudo */}
        <LogoDrop onDone={() => start("logo_upload")} />

        {/* 8. 1 ano de conteúdo */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
            <div className="cv-reveal">
              <Eyebrow>Conteúdo pronto</Eyebrow>
              <h2 className="cv-h2 mt-4">1 ano de conteúdo para postar sem criar nada.</h2>
              <p className="mt-4 text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
                Nos dias em que você não quiser nem gravar um áudio, já tem o que postar: vídeos Reels e artes por destino, com calendário dizendo o que vai em cada dia.
              </p>
              <ul className="mt-6 space-y-2.5">
                {["Vídeos Reels de destinos, prontos para o seu Instagram", "Artes e stories de alta qualidade, editáveis", "Sua logo e @ entram sozinhos", "Calendário com o que postar em cada dia"].map((f) => (
                  <li key={f} className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-[14px] font-semibold" style={{ borderColor: "var(--cv-line)" }}>
                    <Check className="h-4 w-4 shrink-0 text-[#16a34a]" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => start("year_cta")} className="cv-btn mt-6 h-13 min-h-[52px] px-7 text-[15px]">Liberar meu conteúdo <ArrowRight className="h-4 w-4" /></button>
            </div>
            <div className="cv-reveal" style={delay(140)}>
              <div className="overflow-hidden rounded-[28px] bg-white p-3 shadow-[0_24px_50px_-30px_rgba(32,28,19,.45)]">
                <img src={yearGifs.main} alt="Vídeos Reels de destinos passando em celulares" className="w-full rounded-2xl object-cover" loading="lazy" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {yearGifs.previews.map((g, i) => (
                  <img key={g} src={g} alt={`Exemplo de Reels ${i + 1}`} className="aspect-[9/16] w-full rounded-2xl object-cover shadow-md" loading="lazy" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 9. Antes × depois + comparação */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Por que funciona</Eyebrow>
              <h2 className="cv-h2 mt-4">Seu post vende. Sua agência parece grande.</h2>
              <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>
                Cada peça sai com design profissional, texto de venda e a sua marca. O post feito às pressas passa batido no feed.
              </p>
            </div>
            <div className="mt-12 grid items-start gap-4 md:grid-cols-2">
              <div className="cv-reveal">
                <span className="mb-2 inline-block rounded-full border bg-white px-3 py-1 text-[11px] font-semibold" style={{ borderColor: "var(--cv-line)", color: "var(--cv-muted)" }}>Post feito às pressas</span>
                <div className="relative overflow-hidden rounded-[28px] bg-[#bdb7a7]">
                  <img src={antesAmador} alt="Post amador de agência de viagens" className="block h-auto w-full opacity-80 grayscale-[35%]" loading="lazy" />
                  <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[13px] font-bold text-white">14 curtidas</span>
                </div>
              </div>
              <div className="cv-reveal" style={delay(140)}>
                <span className="mb-2 inline-block rounded-full px-3 py-1 text-[11px] font-semibold text-white" style={{ background: "var(--cv-primary)" }}>Feito no Canva Viagem</span>
                <div className="relative overflow-hidden rounded-[28px] bg-white ring-2" style={{ ["--tw-ring-color" as string]: "var(--cv-primary)" }}>
                  <img src={depoisPremium} alt="Celular com posts profissionais criados no Canva Viagem" className="block h-auto w-full" loading="lazy" />
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
                    <th className="px-4 py-4 font-medium sm:px-6" style={{ color: "var(--cv-muted)" }}>O que você recebe</th>
                    <th className="px-2 py-4 text-center font-bold sm:px-6">Canva Viagem</th>
                    <th className="px-2 py-4 text-center font-medium sm:px-6" style={{ color: "var(--cv-muted)" }}>Canva comum</th>
                  </tr>
                </thead>
                <tbody>
                  {compare.map(([label, , them]) => (
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

        {/* 10. Como a Fábrica acerta */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div className="cv-reveal">
                <Eyebrow>Por dentro</Eyebrow>
                <h2 className="cv-h2 mt-4">Como a Fábrica acerta a arte sem você mexer em nada</h2>
                <p className="mt-4 text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
                  Ela junta o seu pacote, um modelo testado, o texto de venda e a sua marca. Gera várias versões de uma vez. Você escolhe a que mais gostou, ou pega a primeira e posta.
                </p>
              </div>
              <div className="cv-reveal overflow-hidden rounded-[28px] bg-[#16130d] shadow-[0_24px_50px_-30px_rgba(32,28,19,.6)]" style={delay(140)}>
                <AutoplayLoopVideo
                  src="/travel-carousel-assets/carousel-morph.mp4"
                  mobileAnimationSrc="/travel-carousel-assets/carousel-morph-mobile.webp"
                  label="Fábrica gerando variações de um carrossel"
                  className="aspect-video w-full object-cover"
                />
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

        {/* 11. Vídeo */}
        <VideoBlock />

        {/* 12. FAQ */}
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
      </main>

      {/* 13. CTA final */}
      <section className="px-4 pb-10 pt-24" style={{ background: "linear-gradient(180deg, var(--cv-bg) 0%, #e9defc 55%, #c9b8fb 100%)" }}>
        <div className="cv-reveal mx-auto max-w-2xl text-center">
          <h2 className="cv-h2">Pare de postar no improviso.<br />Mande seu primeiro áudio.</h2>
          <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Destino, dias e valor. A Fábrica devolve anúncio, carrossel, stories, site e vídeo com a sua logo.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => start("final_audio")} className="cv-btn h-14 w-full px-8 text-base sm:w-auto">
              <Mic className="h-4 w-4" /> Gravar um áudio
            </button>
            <button onClick={() => start("final_cta")} className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border bg-white px-8 text-base font-semibold sm:w-auto" style={{ borderColor: "rgba(32,28,19,.15)" }}>
              Comece agora <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[13px]" style={{ color: "var(--cv-muted)" }}><ShieldCheck className="h-4 w-4" /> 7 dias de garantia · cancele quando quiser</p>
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

/* ───────────────────────── blocos ───────────────────────── */

function Marquee() {
  const items = [...STRIP, ...STRIP];
  return (
    <div className="relative overflow-hidden rounded-[28px] py-2" style={{ maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)" }}>
      <div className="travel-mobile-marquee flex w-max gap-3 sm:gap-4">
        {items.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            aria-hidden={i >= STRIP.length}
            className="aspect-[4/5] w-[150px] shrink-0 rounded-2xl border-4 border-white object-cover shadow-md sm:w-[200px]"
            loading={i < 8 ? "eager" : "lazy"}
          />
        ))}
      </div>
    </div>
  );
}

/** Ilustrações animadas dos três passos: ouvir, montar, publicar. */
function StepIllustration({ index }: { index: number }) {
  if (index === 0) {
    const bars = [10, 18, 28, 16, 34, 22, 12, 26, 18, 30, 14, 20];
    return (
      <div className="flex h-32 items-center justify-center gap-4">
        <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full text-white" style={{ background: "var(--cv-accent)" }}>
          <span className="cv-ping absolute inset-0 rounded-full" style={{ background: "var(--cv-accent)" }} />
          <Mic className="relative h-6 w-6" />
        </span>
        <div className="flex h-12 items-center gap-[5px]">
          {bars.map((h, i) => (
            <span key={i} className="cv-wave w-[5px] rounded-full" style={{ ...delay(i * 90), height: h, background: i % 3 === 0 ? "var(--cv-primary)" : "#cfc4a6" }} />
          ))}
        </div>
      </div>
    );
  }
  if (index === 1) {
    const cards: { label: string; icon: Icon; bg: string }[] = [
      { label: "Anúncio", icon: Megaphone, bg: "var(--cv-primary)" },
      { label: "Carrossel", icon: Images, bg: "#ff3d8b" },
      { label: "Site", icon: Globe, bg: "#0ea5a0" },
      { label: "Vídeo", icon: Video, bg: "#f59e0b" },
    ];
    return (
      <div className="flex h-32 items-end justify-center gap-2 pb-3">
        {cards.map((c, i) => (
          <div key={c.label} className="cv-cascade relative flex h-[84px] w-14 flex-col items-center justify-end rounded-xl pb-2 text-white shadow-md" style={{ ...delay(i * 400), background: c.bg }}>
            <span className="cv-badge absolute -top-2 left-1/2 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full bg-white shadow" style={delay(i * 400 + 500)}>
              <BadgeCheck className="h-3.5 w-3.5 text-[#16a34a]" />
            </span>
            <c.icon className="mb-1 h-5 w-5" />
            <span className="text-[9px] font-bold">{c.label}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex h-32 flex-col items-center justify-center gap-4">
      <div className="relative flex items-center gap-5">
        <span className="absolute left-5 right-5 top-1/2 h-px -translate-y-1/2 border-t border-dashed border-[#cfc4a6]" />
        <span className="cv-travel absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full" style={{ background: "var(--cv-accent)" }} />
        {[
          { icon: Download, bg: "var(--cv-primary)" },
          { icon: Instagram, bg: "#ff3d8b" },
          { icon: Megaphone, bg: "#f59e0b" },
          { icon: MessageCircle, bg: "#25d366" },
        ].map((s, i) => (
          <span key={i} className="cv-hop relative z-10 grid h-10 w-10 place-items-center rounded-full text-white shadow" style={{ ...delay(i * 650), background: s.bg }}>
            <s.icon className="h-4 w-4" />
          </span>
        ))}
      </div>
      <span className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: "var(--cv-sand)", color: "var(--cv-muted)" }}>baixar → postar → impulsionar → WhatsApp</span>
    </div>
  );
}

function ToolsGrid({ onStart }: { onStart: () => void }) {
  const [tab, setTab] = useState<ToolTab>("principais");
  const visible = useMemo(() => TOOLS.filter((t) => t.tags.includes(tab)), [tab]);
  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="cv-reveal mx-auto max-w-2xl text-center">
          <Eyebrow>Ferramentas</Eyebrow>
          <h2 className="cv-h2 mt-4">Escolha o que você precisa criar hoje para a sua agência</h2>
        </div>
        <div className="cv-reveal mt-8 flex gap-2 overflow-x-auto pb-1 sm:justify-center" style={{ scrollbarWidth: "none" }}>
          {TOOL_TABS.map((t) => {
            const on = t.id === tab;
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-pressed={on} className="min-h-10 shrink-0 rounded-full border px-5 text-[14px] font-semibold transition-colors" style={{ background: on ? "var(--cv-fg)" : "#fff", color: on ? "#fff" : "var(--cv-fg)", borderColor: on ? "var(--cv-fg)" : "var(--cv-line)" }}>
                {t.label}
              </button>
            );
          })}
        </div>
        <div key={tab} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((t, i) => (
            <article key={t.title} className="cv-pop cv-card overflow-hidden" style={delay(i * 70)}>
              <img src={t.img} alt={t.title} className="aspect-[16/10] w-full object-cover" loading="lazy" />
              <div className="p-5">
                <span className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-bold" style={{ background: "#efe9ff" }}>
                  <t.icon className="h-4 w-4 text-[#6440e6]" /> {t.title}
                </span>
                <p className="mt-3 text-[14px] leading-6" style={{ color: "var(--cv-muted)" }}>{t.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="cv-reveal mt-8 text-center">
          <button onClick={onStart} className="cv-btn min-h-[52px] px-7 text-[15px]">Quero tudo isso na minha agência <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </section>
  );
}

function TeamImage() {
  const chips: { label: string; icon: Icon; pos: string; rot: string; d: number }[] = [
    { label: "Anúncios", icon: Megaphone, pos: "left-[-4%] top-[16%] sm:left-[-6%]", rot: "-6deg", d: 0 },
    { label: "Vídeos", icon: Video, pos: "left-[-2%] bottom-[22%] sm:left-[-5%]", rot: "4deg", d: 600 },
    { label: "Sites", icon: Globe, pos: "right-[-3%] top-[22%] sm:right-[-6%]", rot: "5deg", d: 1200 },
    { label: "Clientes", icon: Users, pos: "right-[-2%] bottom-[18%] sm:right-[-5%]", rot: "-4deg", d: 1800 },
  ];
  return (
    <div className="cv-reveal relative mx-auto mt-12 max-w-4xl px-6 sm:px-10">
      <div className="overflow-hidden rounded-[32px] bg-[#0f172a] shadow-[0_30px_60px_-30px_rgba(15,23,42,.6)]">
        <img src={heroDashboard} alt="Agente de viagens no notebook com o painel da Fábrica aberto" className="block h-auto w-full" loading="lazy" />
      </div>
      {chips.map((c) => (
        <span key={c.label} className={`cv-float absolute inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/80 px-3 py-2 text-[13px] font-bold shadow-xl backdrop-blur-md sm:px-4 sm:text-[15px] ${c.pos}`} style={{ ...delay(c.d), ["--cv-rot" as string]: c.rot }}>
          <span className="grid h-7 w-7 place-items-center rounded-lg text-white" style={{ background: "var(--cv-primary)" }}><c.icon className="h-4 w-4" /></span>
          {c.label}
        </span>
      ))}
    </div>
  );
}

function SiteDemo({ onStart }: { onStart: () => void }) {
  const [activeId, setActiveId] = useState(siteOfferDemos[0]?.id ?? "");
  const [mode, setMode] = useState<"desktop" | "mobile">(() => (typeof window !== "undefined" && window.innerWidth < 768 ? "mobile" : "desktop"));
  const demo = siteOfferDemos.find((d) => d.id === activeId) ?? siteOfferDemos[0];
  if (!demo) return null;
  return (
    <section id="demonstracao" className="scroll-mt-24 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="cv-reveal mx-auto max-w-2xl text-center">
          <Eyebrow>Seu site</Eyebrow>
          <h2 className="cv-h2 mt-4">Não imagine. Veja funcionando.</h2>
          <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Três modelos reais, com a página de cada pacote e o botão do WhatsApp. O seu sai assim, com a sua logo e o seu endereço.</p>
        </div>

        <div className="cv-reveal mt-10 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible" style={{ scrollbarWidth: "none" }}>
          {siteOfferDemos.map((d) => {
            const on = d.id === demo.id;
            return (
              <button key={d.id} type="button" onClick={() => setActiveId(d.id)} aria-pressed={on} className="min-w-[240px] flex-1 rounded-[22px] border p-4 text-left transition-colors" style={{ background: on ? "#16130d" : "#fff", color: on ? "#fff" : "var(--cv-fg)", borderColor: on ? "#16130d" : "var(--cv-line)" }}>
                <p className="text-[11px] font-bold tracking-[1.2px]" style={{ color: on ? "#8fe3d9" : "#0ea5a0" }}>{d.templateLabel.toUpperCase()}</p>
                <p className="mt-1 text-[15px] font-extrabold">{d.agencyName}</p>
                <p className="text-[12px]" style={{ color: on ? "#cfc4a6" : "var(--cv-muted)" }}>{d.category}</p>
                <span className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-[0.6px]" style={{ background: on ? "rgba(255,255,255,.12)" : "#e8f7f5", color: on ? "#fff" : "#0f766e" }}>{on ? "✓ SELECIONADO" : "CLIQUE PARA VER"}</span>
              </button>
            );
          })}
        </div>

        <div className="cv-reveal mt-4 overflow-hidden rounded-[32px] bg-[#16130d] p-3 sm:p-5" style={delay(120)}>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#221d14] px-4 py-3 text-white">
            <span className="truncate text-[14px] font-bold">{demo.agencyName}</span>
            <div className="flex shrink-0 rounded-full bg-black/40 p-1">
              {(["desktop", "mobile"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold transition-colors" style={{ background: mode === m ? "#fff" : "transparent", color: mode === m ? "#16130d" : "#cfc4a6" }}>
                  {m === "desktop" ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{m === "desktop" ? "Computador" : "Celular"}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 flex justify-center">
            <div className={mode === "mobile" ? "w-full max-w-[360px] overflow-hidden rounded-[32px] border-[6px] border-[#2c261b] bg-white" : "w-full overflow-hidden rounded-2xl bg-white"}>
              <div className="flex items-center gap-2 border-b bg-[#f3f1ea] px-3 py-2" style={{ borderColor: "#e6e1d2" }}>
                {mode === "desktop" && <span className="flex gap-1"><i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" /></span>}
                <span className="mx-auto truncate rounded-full bg-white px-3 py-0.5 text-[11px] text-[#6e6555]">modelo-{demo.id}.canvaviagem.com</span>
              </div>
              <iframe
                key={`${demo.id}-${mode}`}
                title={`Demonstração do site ${demo.agencyName}`}
                srcDoc={demo.html}
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
                className="block w-full border-0"
                style={{ height: mode === "mobile" ? 600 : 560 }}
              />
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-[#9b917d]">Demonstrações oficiais do Canva Viagem. Marcas, pacotes e valores são fictícios.</p>
        </div>
        <div className="cv-reveal mt-8 text-center">
          <button onClick={onStart} className="cv-btn min-h-[52px] px-7 text-[15px]">Quero meu site assim <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </section>
  );
}

/** Envio da logo: guarda no navegador e segue para o login → quiz. */
function LogoDrop({ onDone }: { onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setPreview(dataUrl);
      try {
        if (dataUrl.length < 1_500_000) sessionStorage.setItem(ONBOARDING_LOGO_KEY, dataUrl);
      } catch { /* sem storage */ }
      window.setTimeout(onDone, 900);
    };
    reader.readAsDataURL(file);
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };
  const onChange = (e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0]);

  const places: { label: string; icon: Icon }[] = [
    { label: "No anúncio", icon: Megaphone }, { label: "No carrossel", icon: Images }, { label: "No site", icon: Globe }, { label: "No vídeo", icon: Video },
  ];

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <div className="cv-reveal">
          <Eyebrow>Sua marca</Eyebrow>
          <h2 className="cv-h2 mt-4">Envie a logo uma vez. Ela entra em tudo.</h2>
          <p className="mt-4 text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
            Anúncio, carrossel, stories, site e vídeo saem com a sua logo, as suas cores e o seu WhatsApp. Trocou a logo? Troca em tudo.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {places.map((p, i) => (
              <span key={p.label} className="cv-logo-spot flex flex-col items-center gap-2 rounded-2xl border bg-white p-3 text-[12px] font-semibold" style={{ ...delay(i * 500), borderColor: "var(--cv-line)" }}>
                <span className="relative grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--cv-sand)" }}>
                  <p.icon className="h-5 w-5" />
                  <span className="cv-badge absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full text-white" style={{ ...delay(i * 500 + 300), background: "var(--cv-primary)" }}>
                    {preview ? <img src={preview} alt="" className="h-4 w-4 rounded-full object-cover" /> : <BadgeCheck className="h-3 w-3" />}
                  </span>
                </span>
                {p.label}
              </span>
            ))}
          </div>
        </div>
        <div
          className="cv-reveal"
          style={delay(140)}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-[32px] border-2 border-dashed bg-white p-8 text-center transition-colors"
            style={{ borderColor: over ? "var(--cv-primary)" : "#d9cfb3", background: over ? "#f6f3ff" : "#fff" }}
          >
            {preview ? (
              <img src={preview} alt="Sua logo" className="h-20 w-20 rounded-2xl object-contain" />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-full text-white" style={{ background: "var(--cv-primary)" }}><Upload className="h-6 w-6" /></span>
            )}
            <span className="text-[17px] font-extrabold">{preview ? "Logo recebida! Vamos montar sua conta…" : "Arraste sua logo aqui ou toque para enviar"}</span>
            <span className="text-[13px]" style={{ color: "var(--cv-muted)" }}>PNG, JPG ou SVG · do celular ou do computador</span>
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} aria-label="Enviar logo" />
          <p className="mt-3 text-center text-[12px]" style={{ color: "var(--cv-muted)" }}>Ainda não tem logo? Sem problema: dá para começar só com o nome da agência.</p>
        </div>
      </div>
    </section>
  );
}

function VideoBlock() {
  const [play, setPlay] = useState(false);
  return (
    <section className="px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="cv-reveal mx-auto max-w-2xl text-center">
          <Eyebrow>Em 1 minuto</Eyebrow>
          <h2 className="cv-h2 mt-4">Veja a Fábrica funcionando</h2>
        </div>
        <div className="cv-reveal mt-8 overflow-hidden rounded-[28px] bg-black shadow-[0_24px_50px_-30px_rgba(32,28,19,.6)]" style={delay(120)}>
          {play ? (
            <iframe
              className="aspect-video w-full"
              src={`https://www.youtube-nocookie.com/embed/${ELITE_OFFER.videoId}?autoplay=1&rel=0&modestbranding=1`}
              title="Apresentação do Canva Viagem"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button type="button" onClick={() => setPlay(true)} className="group relative block aspect-video w-full" aria-label="Assistir ao vídeo">
              <img src={`https://i.ytimg.com/vi/${ELITE_OFFER.videoId}/hqdefault.jpg`} alt="" className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" loading="lazy" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-16 w-16 place-items-center rounded-full text-white shadow-xl" style={{ background: "var(--cv-accent)" }}><Play className="ml-1 h-7 w-7 fill-current" /></span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
