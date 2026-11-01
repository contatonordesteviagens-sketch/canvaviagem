import { useEffect, useRef, useState, type ChangeEvent, type ComponentType, type DragEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Check, X, MapPin, Sparkles, Download, Mic, Upload, Infinity as InfinityIcon,
  Instagram, MessageCircle, LayoutTemplate, Images, Globe, Video, Users, Megaphone, Smartphone, Monitor,
  CalendarDays, ShieldCheck, Palette, PenLine, BadgeCheck, Bot,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";
import { BrandMark, Eyebrow, delay, useReveal } from "@/components/cv-cream/shared";
import { ShowcaseRow, SHOWCASE_ADS, SHOWCASE_CAROUSELS } from "@/components/cv-cream/Showcase";
import { ArtTrial } from "@/components/cv-cream/ArtTrial";
import { resolveInicioVariant, trackInicioTeste } from "@/lib/inicio-teste";
import { siteOfferDemos } from "@/lib/site-offer-demos";
import heroDashboard from "@/assets/hero_dashboard.jpg";

import { ONBOARDING_DESTINO_KEY, ONBOARDING_LOGO_KEY, ONBOARDING_PATH } from "@/lib/inicio-arte";

export { ONBOARDING_DESTINO_KEY, ONBOARDING_LOGO_KEY, ONBOARDING_PATH };

type Icon = ComponentType<{ className?: string }>;

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

const delivery: { icon: Icon; title: string; text: string }[] = [
  { icon: MapPin, title: "Você fala o pacote", text: "Destino, dias e valor. Por áudio ou escrito." },
  { icon: Palette, title: "Escolhe um modelo", text: "Layouts prontos para feed, stories, carrossel e site." },
  { icon: PenLine, title: "Os textos já vêm prontos", text: "Legenda e chamada de venda, com a sua marca aplicada." },
  { icon: Download, title: "Baixa e publica", text: "Posta no Instagram e manda no WhatsApp." },
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
  const [variant] = useState(() => resolveInicioVariant(window.location.search));
  const artTest = variant === "arte";
  const [scrolled, setScrolled] = useState(false);
  const tracked = useRef(false);
  const pageRef = useReveal<HTMLDivElement>();

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackMetaEvent("ViewContent", { content_name: "Canva Viagem - Plataforma para Agências", content_category: artTest ? "inicio_arte" : "inicio_creme", content_type: "product" });
    trackInicioTeste("visita");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Todo caminho leva ao mesmo lugar: e-mail → quiz → pagamento (e-mail novo não espera o link). Assinante vai para a Fábrica. */
  const start = (source: string) => {
    // No teste, o e-mail só aparece depois das artes: os botões da página levam até elas. "Acessar" continua sendo o login.
    if (artTest && source !== "header") {
      document.getElementById("teste-arte")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
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
            background: scrolled ? "rgba(255,255,255,0.1)" : "transparent",
            border: "1px solid transparent",
            backdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
            boxShadow: "none",
          }}
        >
          <a href="/inicio" aria-label="Canva Viagem" className="block h-[26px] w-[26px] overflow-hidden rounded-full">
            <img src={logo} alt="Canva Viagem" width={26} height={26} className="h-full w-full scale-[1.18] object-cover" />
          </a>
          <button onClick={() => start("header")} className="cv-btn h-9 shrink-0 whitespace-nowrap px-4 text-[13px]">
            Acessar
          </button>
        </div>
      </header>

      <main>
        {/* 1. Hero */}
        <section className="px-4 pb-6 pt-28 sm:pt-36">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Eyebrow className="cv-pop">Para agências de viagens sem equipe de marketing</Eyebrow>
            <h1 className="cv-pop mt-4 text-balance text-[2.5rem] font-extrabold leading-[1.02] tracking-[-0.025em] sm:text-6xl md:text-[4.4rem]" style={delay(60)}>
              {artTest ? (
                <>Escolha um destino. Veja o anúncio <span style={{ color: "var(--cv-primary-ink)" }}>pronto agora.</span></>
              ) : (
                <>Mande um áudio. Receba sua agência <span style={{ color: "var(--cv-primary-ink)" }}>inteira pronta.</span></>
              )}
            </h1>
            <p className="cv-pop mt-6 max-w-xl text-lg leading-7" style={{ ...delay(120), color: "var(--cv-muted)" }}>
              {artTest
                ? "Teste aqui mesmo, sem cadastro. Escolha o destino, envie a sua logo e veja como fica a arte da sua agência."
                : "Fale o destino, os dias e o valor, do jeito que você fala com um cliente. Em minutos saem o anúncio, o carrossel, os stories, a página do pacote e os vídeos, tudo com a sua logo."}
            </p>

            {artTest ? (
              <div className="cv-pop mt-8 w-full max-w-3xl text-left" style={delay(220)}>
                <ArtTrial />
              </div>
            ) : (
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
            )}
          </div>

          {/* Faixas de peças reais: as novas em destaque, as antigas menores embaixo */}
          <div className="cv-pop mx-auto mt-12 max-w-6xl" style={delay(380)}>
            <div className="mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-center gap-2 px-2 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold text-white"   style={{ background: "var(--cv-fg)" }}>
                <InfinityIcon className="h-3.5 w-3.5" /> CRÉDITOS ILIMITADOS
              </span>
              <p className="text-[14px] font-semibold" style={{ color: "var(--cv-muted)" }}>Gere quantas imagens quiser: anúncios, carrosséis e stories, sem limite por dia.</p>
            </div>
            <ShowcaseRow pieces={SHOWCASE_ADS} alt="Anúncio feito na plataforma Canva Viagem" size="compact" />
            <ShowcaseRow pieces={SHOWCASE_CAROUSELS} alt="Slide de carrossel feito na plataforma Canva Viagem" size="tiny" slow />
          </div>

          <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-2 rounded-full border bg-white px-4 py-3" style={{ borderColor: "var(--cv-line)" }}>
            <span className="mr-2 text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>SAI PRONTO PARA</span>
            {builtFor.map((b) => (
              <span key={b.label} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: "var(--cv-sand)" }}>
                <b.icon className="h-3.5 w-3.5" /> {b.label}
              </span>
            ))}
          </div>

          {/* Áudio em destaque: tela dividida */}
          <div className="cv-pop mx-auto mt-6 grid max-w-3xl overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_40px_-26px_rgba(32,28,19,.35)] sm:grid-cols-2" style={{ ...delay(460), borderColor: "var(--cv-line)" }}>
            <div className="p-6 text-center sm:text-left">
              <p className="text-[12px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-primary-ink)" }}>PREFERE FALAR?</p>
              <p className="mt-2 text-[22px] font-extrabold leading-tight tracking-[-0.02em]">Grave um áudio de 20 segundos.</p>
              <p className="mt-2 text-[14px] leading-6" style={{ color: "var(--cv-muted)" }}>"Cancún, 7 dias, casal, 8.900 reais" já basta. O resto sai pronto.</p>
            </div>
            <button
              type="button"
              onClick={() => start("hero_audio")}
              className="cv-mic flex min-h-[150px] flex-col items-center justify-center gap-3 p-6 text-white"
              style={{ background: "linear-gradient(135deg, #7c5cff 0%, #6440e6 100%)" }}
            >
              <span className="relative grid h-20 w-20 place-items-center rounded-full bg-white/15">
                <span className="cv-ping absolute inset-0 rounded-full bg-white/30" />
                <Mic className="relative h-9 w-9" />
              </span>
              <span className="text-[17px] font-bold">Gravar meu áudio</span>
            </button>
          </div>
        </section>

        {/* 2. Como funciona */}
        <section id="como-funciona" className="scroll-mt-24 px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Como funciona</Eyebrow>
              <h2 className="cv-h2 mt-4">Um áudio. Três passos. A semana inteira resolvida.</h2>
              <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Você fala → a gente monta → você publica. O resto é cliente chamando.</p>
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

        {/* 3. Créditos infinitos */}
        <section className="px-4 py-12 sm:py-16">
          <div className="cv-reveal mx-auto max-w-4xl rounded-[36px] border px-6 py-10 text-center sm:px-12 sm:py-14" style={{ background: "linear-gradient(180deg, #f4f0ff 0%, #ebe4ff 100%)", borderColor: "#d9ccff" }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-bold tracking-[0.6px]" style={{ color: "var(--cv-primary-ink)" }}>
              <InfinityIcon className="h-4 w-4" /> CRÉDITOS INFINITOS
            </span>
            <h2 className="cv-h2 mx-auto mt-5 max-w-2xl">Aqui não existe "acabaram os créditos".</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
              Faça 1 ou 1.000 peças no mesmo dia. <strong style={{ color: "var(--cv-fg)" }}>Ninguém te cobra a mais.</strong>
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {["30 stories", "12 anúncios", "4 carrosséis", "1 site novo"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-semibold shadow-sm">
                  {t} <span className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: "var(--cv-primary)" }}>0 créditos</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Tudo num só lugar: ecossistema + equipe */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Tudo num só lugar</Eyebrow>
              <h2 className="cv-h2 mt-4">Tudo o que uma equipe de marketing faria. Aqui, num só lugar.</h2>
              <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Cada parte conversa com a outra. Você só cuida de vender.</p>
            </div>
            <Ecosystem />
            <TeamImage />
          </div>
        </section>

        {/* 5. Sua logo em tudo (acima do site) */}
        {!artTest && <LogoDrop onDone={() => start("logo_upload")} />}

        {/* 6. Site pronto */}
        <SiteDemo onStart={() => start("site_demo_cta")} />

        {/* 7. 1 ano de conteúdo */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
            <div className="cv-reveal">
              <Eyebrow>Conteúdo pronto</Eyebrow>
              <h2 className="cv-h2 mt-4">1 ano de conteúdo para postar sem criar nada.</h2>
              <p className="mt-4 text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
                Nos dias em que você não quiser nem gravar um áudio, já tem o que postar: vídeos Reels e artes por destino, com calendário dizendo o que vai em cada dia.
              </p>
              <ul className="mt-6 space-y-2.5">
                {["Vídeos Reels de destinos, prontos para o seu Instagram", "Artes e stories de alta qualidade, editáveis", "Sua logo e @ entram sozinhos nas artes e carrosséis", "Calendário com o que postar em cada dia"].map((f) => (
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

        {/* 8. Comparação */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Comparação</Eyebrow>
              <h2 className="cv-h2 mt-4">O que você recebe aqui e no Canva comum</h2>
            </div>
            <div className="cv-reveal mt-10 overflow-hidden rounded-[32px] border" style={{ borderColor: "var(--cv-line)" }}>
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

        {/* 9. Como te entregamos tudo pronto */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Sem mexer em nada</Eyebrow>
              <h2 className="cv-h2 mt-4">Como te entregamos tudo pronto</h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {delivery.map((e, i) => (
                <div key={e.title} className="cv-reveal cv-card p-5" style={delay(i * 90)}>
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full" style={{ background: "#efe9ff", color: "var(--cv-primary-ink)" }}>
                      <e.icon className="h-5 w-5" />
                    </span>
                    <span className="text-lg font-extrabold text-[#e6dcc0]">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-5 font-extrabold">{e.title}</h3>
                  <p className="mt-1 text-[13px] leading-5" style={{ color: "var(--cv-muted)" }}>{e.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 10. CTA final */}
      <section className="px-4 pb-10 pt-24" style={{ background: "linear-gradient(180deg, var(--cv-bg) 0%, #e9defc 55%, #c9b8fb 100%)" }}>
        <div className="cv-reveal mx-auto max-w-2xl text-center">
          <h2 className="cv-h2">Pare de postar no improviso.<br />Mande seu primeiro áudio.</h2>
          <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Destino, dias e valor. Você recebe anúncio, carrossel, stories, site e vídeo com a sua logo.</p>
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

const ECO_NODES: { label: string; icon: Icon }[] = [
  { label: "Anúncios", icon: Megaphone },
  { label: "Carrosséis", icon: Images },
  { label: "Stories", icon: LayoutTemplate },
  { label: "Site", icon: Globe },
  { label: "Vídeos", icon: Video },
  { label: "Clientes organizados", icon: Users },
  { label: "Calendário de posts", icon: CalendarDays },
  { label: "Agentes de IA", icon: Bot },
];

/** Tudo se conecta: a sua agência no centro, cada entrega ligada a ela, com um ponto de luz correndo nas linhas. */
function Ecosystem() {
  const size = 340;
  const c = size / 2;
  const r = 128;
  const nodes = ECO_NODES.map((n, i) => {
    const a = (i / ECO_NODES.length) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
  });
  return (
    <div className="cv-reveal relative mx-auto mt-10 aspect-square w-full max-w-[420px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#e6dcc0" strokeDasharray="2 6" />
        {nodes.map((n, i) => (
          <g key={n.label}>
            <line x1={c} y1={c} x2={n.x} y2={n.y} stroke="#d9ccff" strokeWidth="2" />
            <line x1={c} y1={c} x2={n.x} y2={n.y} stroke="#7c5cff" strokeWidth="2" strokeLinecap="round" className="cv-flow" style={delay(i * 220)} />
          </g>
        ))}
      </svg>
      <div className="absolute left-1/2 top-1/2 grid h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-center shadow-[0_18px_40px_-18px_rgba(100,64,230,.55)] ring-4 ring-[#efe9ff]">
        <span className="px-2 text-[11px] font-extrabold leading-tight">Sua<br />agência</span>
      </div>
      {nodes.map((n, i) => (
        <div
          key={n.label}
          className="cv-float absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{ ...delay(i * 300), left: `${(n.x / size) * 100}%`, top: `${(n.y / size) * 100}%` }}
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-md" style={{ background: "var(--cv-primary)" }}>
            <n.icon className="h-5 w-5" />
          </span>
          <span className="max-w-[86px] rounded-full bg-white px-2 py-0.5 text-center text-[10px] font-bold leading-tight shadow-sm sm:text-[11px]">{n.label}</span>
        </div>
      ))}
    </div>
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
    <div className="cv-reveal relative mx-auto mt-10 max-w-4xl px-6 sm:px-10">
      <div className="overflow-hidden rounded-[32px] bg-[#0f172a] shadow-[0_30px_60px_-30px_rgba(15,23,42,.6)]">
        <img src={heroDashboard} alt="Agente de viagens no notebook com o painel do Canva Viagem aberto" className="block h-auto w-full" loading="lazy" />
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
          <h2 className="cv-h2 mt-4">Veja como o seu site ficaria</h2>
          <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Três modelos reais, com a página de cada pacote e o botão do WhatsApp. O seu sai assim, com a sua logo.</p>
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
