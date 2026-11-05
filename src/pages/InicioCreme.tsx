import { useEffect, useRef, useState, type ChangeEvent, type ComponentType, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, MapPin, Sparkles, Download, Mic, Upload, Infinity as InfinityIcon, DollarSign,
  Instagram, Facebook, Youtube, MessageCircle, LayoutTemplate, Images, Globe, Video, Users, Megaphone, Smartphone, Monitor,
  ShieldCheck, Palette, PenLine, BadgeCheck, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { hasEliteAccess } from "@/lib/planAccess";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";
import { BrandMark, Eyebrow, delay, useReveal } from "@/components/cv-cream/shared";
import { ShowcaseRow, SHOWCASE_ADS, SHOWCASE_CAROUSELS } from "@/components/cv-cream/Showcase";
import { ArtTrial } from "@/components/cv-cream/ArtTrial";
import { resolveInicioVariant, trackInicioTeste } from "@/lib/inicio-teste";
import { siteOfferDemos } from "@/lib/site-offer-demos";
import { BLACK_FUNNEL_PATH, isBlackFunnel, markBlackFunnel } from "@/lib/black-funnel";
import heroDashboard from "@/assets/hero_dashboard.jpg";

import { ONBOARDING_DESTINO_KEY, ONBOARDING_LOGO_KEY, ONBOARDING_PATH, QUICK_LOGIN_PATH } from "@/lib/inicio-arte";

export { ONBOARDING_DESTINO_KEY, ONBOARDING_LOGO_KEY, ONBOARDING_PATH };

type Icon = ComponentType<{ className?: string }>;

const steps = [
  { n: "01", icon: Mic, title: "Mande um áudio", text: "Fale o destino, os dias e o valor, do jeito que você fala com um cliente. Se preferir, digite ou mande a foto do pacote." },
  { n: "02", icon: Sparkles, title: "Receba tudo pronto", text: "O vídeo do pacote, o anúncio, o carrossel e o site saem prontos em 1 minuto, já com a sua logo." },
  { n: "03", icon: Download, title: "Publique e venda", text: "Baixe, poste no Instagram, impulsione o anúncio e mande o site no WhatsApp." },
];

const compare = [
  ["Como pedir", "Manda um áudio", "Briefing e reunião"],
  ["Quando fica pronto", "Em segundos", "Em dias"],
  ["Quantidade", "Sem limite", "O que couber no contrato"],
  ["Anúncios e stories", "Inclusos", "Designer"],
  ["Carrosséis e legendas", "Inclusos", "Social media"],
  ["Site com cada pacote", "Incluso", "Programador"],
  ["Vídeo do seu pacote, a partir de um áudio", "Pronto em 1 minuto", "Editor de vídeo"],
  ["Clientes organizados", "Em um só lugar", "Outra ferramenta"],
  ["Quando funciona", "A qualquer hora", "Horário comercial"],
  ["Quanto você paga", "Uma assinatura", "Salários ou freelancers"],
] as const;

const delivery: { icon: Icon; title: string; text: string }[] = [
  { icon: MapPin, title: "Você fala o pacote", text: "Destino, dias e valor. Por áudio ou escrito." },
  { icon: Palette, title: "Escolhe um modelo", text: "Layouts prontos para feed, stories, carrossel e site." },
  { icon: PenLine, title: "Os textos já vêm prontos", text: "Legenda e chamada de venda, com a sua marca aplicada." },
  { icon: Download, title: "Baixa e publica", text: "Posta no Instagram e manda no WhatsApp." },
];

const GERADOR_ITENS = [
  "Imagens reais do destino, em tela cheia",
  "O que está incluso, item por item, com ícones",
  "A sua logo e o seu WhatsApp no final",
  "Estilos de Black Friday e de cada data do ano",
];
const GERADOR_VIDEOS = ["/inicio/gerador-video-black.mp4", "/inicio/gerador-video-promo.mp4"];

/** Seção da novidade: mostra os vídeos que a ferramenta gera a partir de um texto ou áudio. */
function GeradorVideo({ black, onStart }: { black: boolean; onStart: () => void }) {
  return (
    <section id="gerador-de-video" className="scroll-mt-24 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="cv-reveal mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-extrabold tracking-[0.6px]" style={{ background: "var(--cv-hl)", color: black ? "#0a0a0d" : "#16130d" }}>
            <Sparkles className="h-3.5 w-3.5" /> NOVO · GERADOR DE VÍDEO
          </span>
          <h2 className="cv-h2 mt-4">Fale o pacote. Em 1 minuto saem 3 vídeos prontos para os stories.</h2>
          <p className="mt-4 text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
            Mande um áudio, cole o texto do WhatsApp ou a foto da operadora. O vídeo mostra o destino, a experiência e o que está incluso, e fecha com o preço e o seu contato.
          </p>
        </div>
        <div className="mt-10 grid items-center gap-8 md:grid-cols-[1fr_1.1fr]">
          <div className="cv-reveal mx-auto grid w-full max-w-[420px] grid-cols-2 gap-3" style={delay(100)}>
            {GERADOR_VIDEOS.map((src, i) => (
              <video
                key={src}
                src={src}
                className="aspect-[9/16] w-full rounded-[22px] object-cover shadow-[0_24px_50px_-28px_rgba(0,0,0,.6)]"
                autoPlay
                muted
                loop
                playsInline
                preload={i === 0 ? "auto" : "metadata"}
                aria-label={`Exemplo de vídeo de pacote gerado ${i + 1}`}
              />
            ))}
          </div>
          <div className="cv-reveal" style={delay(180)}>
            <p className="text-[13px] font-bold uppercase tracking-[0.6px]" style={{ color: "var(--cv-muted)" }}>Os dois vídeos saíram de um único texto, sem edição</p>
            <ul className="mt-4 flex flex-col gap-3">
              {GERADOR_ITENS.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[16px] font-semibold leading-6">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--cv-accent)" }} /> {t}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[15px] leading-6" style={{ color: "var(--cv-muted)" }}>Cada vez que você gera, sai uma variação nova. A legenda do post já vem pronta para colar.</p>
            <button onClick={onStart} className="cv-btn mt-6 inline-flex h-12 items-center gap-2 px-6 text-[15px]">
              Quero gerar meus vídeos <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export const yearGifs = {
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
  useState(() => resolveInicioVariant(window.location.search));
  // A /inicio normal tira a marca da Black; a /black (InicioBlack) já marcou antes de chegar aqui.
  const [black] = useState(() => {
    if (window.location.pathname !== BLACK_FUNNEL_PATH) markBlackFunnel(false);
    return isBlackFunnel();
  });
  const [scrolled, setScrolled] = useState(false);
  const tracked = useRef(false);
  const pageRef = useReveal<HTMLDivElement>();

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackMetaEvent("ViewContent", { content_name: "Canva Viagem - Plataforma para Agências", content_category: "inicio_arte", content_type: "product" });
    trackInicioTeste("visita");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Todo caminho leva ao mesmo lugar: e-mail, quiz e pagamento. Assinante vai para a Fábrica. */
  const start = (source: string) => {
    trackInicioTeste("botao", { valor: source });
    if (user && subscription.subscribed) { navigate(hasEliteAccess(subscription) ? "/fabrica" : "/"); return; }
    navigate(user ? ONBOARDING_PATH : QUICK_LOGIN_PATH);
  };

  return (
    <div ref={pageRef} className={`cv-cream min-h-screen overflow-x-hidden${black ? " cv-black" : ""}`}>
      <Helmet>
        <title>Canva Viagem — Mande um áudio e receba o vídeo do pacote, anúncios, carrosséis e site prontos</title>
        {black && <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,900&display=swap" />}
        <meta name="description" content="Fale o destino, os dias e o valor do pacote. Em 1 minuto saem o vídeo do pacote, anúncios, carrosséis, stories e o site, com a sua logo. Sem limite de quantidade." />
      </Helmet>

      {/* Cabeçalho flutuante */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <div
          className="flex w-full max-w-5xl items-center justify-between rounded-full px-3 py-2 transition-all duration-300"
          style={{
            background: scrolled ? (black ? "rgba(10,10,13,0.6)" : "rgba(255,255,255,0.1)") : "transparent",
            border: "1px solid transparent",
            backdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
            boxShadow: "none",
          }}
        >
          <a href={black ? BLACK_FUNNEL_PATH : "/inicio"} aria-label="Canva Viagem" className="block h-[26px] w-[26px] overflow-hidden rounded-full">
            <img src={logo} alt="Canva Viagem" width={26} height={26} className="h-full w-full scale-[1.18] object-cover" />
          </a>
          <div className="flex items-center gap-1.5">
            {/* Já tem conta: entra com o e-mail (link de acesso). Acessar: cria a conta e segue para o teste. */}
            {!user && (
              <button
                onClick={() => { trackInicioTeste("botao", { valor: "header_entrar" }); navigate("/login?redirect=%2F"); }}
                className="h-9 shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold opacity-80 hover:opacity-100"
              >
                Entrar
              </button>
            )}
            <button onClick={() => start("header")} className="cv-btn h-9 shrink-0 whitespace-nowrap px-4 text-[13px]">
              {user ? "Ir para minha conta" : "Criar conta"}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* 1. Hero */}
        <section className="px-4 pb-8 pt-24 sm:pt-32">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            {black && <span className="cv-black-tag cv-pop mb-3">Black Friday · 50% vitalício</span>}
            <Eyebrow className="cv-pop">Para agências de viagens</Eyebrow>
            <h1 className="cv-pop mt-3 max-w-3xl text-balance text-[2.4rem] font-extrabold leading-[1.04] tracking-[-0.025em] sm:text-6xl md:text-[4.2rem]" style={delay(60)}>
              Mande um áudio. Receba sua agência de{" "}
              {black ? (
                <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900, color: "var(--cv-hl)" }}>viagens</em>
              ) : (
                <em className="font-bold" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "var(--cv-primary-ink)" }}>viagens</em>
              )}{" "}
              <span style={{ color: "var(--cv-hl)" }}>inteira pronta.</span>
            </h1>
            <p className="cv-pop mt-4 text-[19px] font-bold leading-6" style={delay(120)}>Escolha um destino e gere sua arte.</p>
            <p className="cv-pop mt-2 max-w-xl text-[15px] leading-6" style={{ ...delay(160), color: "var(--cv-muted)" }}>
              Fale o destino e, em 1 minuto, saem o vídeo do seu pacote, os anúncios, os carrosséis, os stories e o site. Tudo com a sua logo. Pode mandar até a foto do pacote da operadora.
            </p>
            <div className="cv-pop mt-6 w-full text-left" style={delay(220)}>
              <ArtTrial />
            </div>
            <div className="cv-pop mt-7 flex flex-col items-center gap-2" style={delay(300)}>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: "var(--cv-fg)", color: "var(--cv-bg)" }}>
                <InfinityIcon className="h-3.5 w-3.5" /> CRÉDITOS ILIMITADOS
              </span>
              <p className="text-[14px] font-semibold" style={{ color: "var(--cv-muted)" }}>{black ? "Disponível na Black Friday. Pode mudar a qualquer momento." : "Gere quantas mídias quiser: anúncios, carrosséis e stories, sem limite por dia."}</p>
            </div>
          </div>
        </section>

        {/* 2. Como funciona */}
        <section id="como-funciona" className="scroll-mt-24 px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Como funciona</Eyebrow>
              <h2 className="cv-h2 mt-4">Um áudio. Três passos. O mês inteiro resolvido.</h2>
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
            {/* Áudio em destaque */}
            <div className="cv-reveal mx-auto mt-8 grid max-w-3xl overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_40px_-26px_rgba(32,28,19,.35)] sm:grid-cols-2" style={{ borderColor: "var(--cv-line)" }}>
              <div className="p-6 text-center sm:text-left">
                <p className="text-[22px] font-extrabold leading-tight tracking-[-0.02em]">Fale da sua agência e do seu pacote</p>
                <p className="mt-2 text-[15px] leading-6" style={{ color: "var(--cv-muted)" }}>Exemplo: "Cancún, 7 dias, casal, R$ 8.000"</p>
                <p className="mt-2 text-[15px] font-bold">Tudo fica pronto em segundos.</p>
              </div>
              <button
                type="button"
                onClick={() => start("steps_audio")}
                className="cv-mic flex min-h-[150px] flex-col items-center justify-center gap-3 p-6 text-white"
                style={{ background: "linear-gradient(135deg, #7c5cff 0%, #6440e6 100%)" }}
              >
                <span className="relative grid h-20 w-20 place-items-center rounded-full bg-white/15">
                  <span className="cv-ping absolute inset-0 rounded-full bg-white/30" />
                  <Mic className="relative h-9 w-9" />
                </span>
                <span className="text-[17px] font-bold">Gravar áudio agora</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2b. Novidade: Gerador de vídeo (valor primeiro, exemplos reais gerados pela ferramenta) */}
        <GeradorVideo black={black} onStart={() => start("gerador_video")} />

        {/* 3. Créditos infinitos */}
        <section className="px-4 py-10 sm:py-14">
          <div className="cv-reveal mx-auto max-w-6xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-bold tracking-[0.6px]" style={{ color: "var(--cv-primary-ink)" }}>
              <InfinityIcon className="h-4 w-4" /> CRÉDITOS INFINITOS
            </span>
            <p className="mt-3 text-[20px] font-extrabold tracking-[-0.01em]">Faça quantas mídias quiser no mesmo dia.</p>
            <div className="mt-6">
              <ShowcaseRow pieces={SHOWCASE_ADS} alt="Anúncio feito na plataforma Canva Viagem" size="compact" reverse />
              <ShowcaseRow pieces={SHOWCASE_CAROUSELS} alt="Slide de carrossel feito na plataforma Canva Viagem" size="tiny" slow />
            </div>
          </div>
        </section>

        {/* 4. Tudo em um só lugar */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Tudo em um só lugar</Eyebrow>
              <h2 className="cv-h2 mt-4">Tudo que uma equipe inteira de marketing faria.</h2>
              <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Tudo que você precisa para vender muitas viagens online.</p>
            </div>
            <MarketingWheel black={black} />
            {!black && <TeamImage />}
          </div>
        </section>

        {/* 5. Sua logo em tudo */}
        {!black && <LogoDrop onDone={() => start("logo_upload")} />}

        {/* 6. Site pronto */}
        <SiteDemo onStart={() => start("site_demo_cta")} />

        {/* 7. 1 ano de conteúdo */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="cv-reveal text-center">
              <Eyebrow>Conteúdo pronto</Eyebrow>
              <h2 className="cv-h2 mt-4">1 ano de conteúdo para postar sem criar nada.</h2>
              <p className="mt-4 text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
                Todos os dias você já tem o que postar: vídeos Reels e artes por destino, com calendário dizendo o que vai em cada dia.
              </p>
            </div>
            <div className="cv-reveal mt-8" style={delay(140)}>
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
              <h2 className="cv-h2 mt-4">Canva Viagem ou uma equipe de marketing?</h2>
            </div>
            <div className="cv-reveal mt-10 overflow-hidden rounded-[32px] border" style={{ borderColor: "var(--cv-line)" }}>
              <table className="w-full text-left text-sm">
                <thead style={{ background: "var(--cv-head)" }}>
                  <tr>
                    <th className="px-3 py-4 font-medium sm:px-6" style={{ color: "var(--cv-muted)" }}><span className="sr-only">Comparação</span></th>
                    <th className="px-2 py-4 font-bold sm:px-6">Canva Viagem</th>
                    <th className="px-3 py-4 font-medium sm:px-6" style={{ color: "var(--cv-muted)" }}>Equipe de marketing</th>
                  </tr>
                </thead>
                <tbody>
                  {compare.map(([label, us, team]) => (
                    <tr key={label} className="border-t" style={{ borderColor: "var(--cv-line)" }}>
                      <td className="px-3 py-4 font-semibold sm:px-6">{label}</td>
                      <td className="px-2 py-4 font-bold sm:px-6" style={{ color: "var(--cv-hl)" }}>{us}</td>
                      <td className="px-3 py-4 sm:px-6" style={{ color: "var(--cv-muted)" }}>{team}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 9. Como te entregamos tudo pronto */}
        {!black && <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Sem mexer em nada</Eyebrow>
              <h2 className="cv-h2 mt-4">Como te entregamos tudo pronto</h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {delivery.map((e, i) => (
                <div key={e.title} className="cv-reveal cv-card p-5" style={delay(i * 90)}>
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full" style={{ background: "var(--cv-soft)", color: "var(--cv-primary-ink)" }}>
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
        </section>}
      </main>

      {/* 10. CTA final */}
      <section className="px-4 pb-10 pt-24" style={{ background: "linear-gradient(180deg, var(--cv-bg) 0%, var(--cv-glow-1) 55%, var(--cv-glow-2) 100%)" }}>
        {black ? <BlackFaq onStart={() => start("black_faq")} /> : <div className="cv-reveal mx-auto max-w-2xl text-center">
          <h2 className="cv-h2">Pare de postar no improviso.<br />Mande seu primeiro áudio.</h2>
          <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Destino, dias e valor. Você recebe anúncio, carrossel, stories e site com a sua logo, e vídeos prontos para postar.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => start("final_audio")} className="cv-btn h-14 w-full px-8 text-base sm:w-auto">
              <Mic className="h-4 w-4" /> Começar agora
            </button>
            <button onClick={() => start("final_cta")} className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border bg-white px-8 text-base font-semibold sm:w-auto" style={{ borderColor: "rgba(32,28,19,.15)" }}>
              Comece agora <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[13px]" style={{ color: "var(--cv-muted)" }}><ShieldCheck className="h-4 w-4" /> 7 dias de garantia · cancele quando quiser</p>
        </div>}
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

const BLACK_PRICES = [
  { name: "Mensal", was: "R$ 97", now: "R$ 48,50", per: "/mês", note: "Renova todo mês por R$ 48,50" },
  { name: "Semestral", was: "R$ 347", now: "R$ 173,50", per: "/6 meses", note: "Dá R$ 28,92 por mês" },
  { name: "Anual", was: "R$ 482", now: "R$ 241", per: "/ano", note: "Dá R$ 20,08 por mês", popular: true },
];

const BLACK_FAQ = [
  { q: "O desconto é vitalício mesmo?", a: "Sim. Quem assina na Black paga metade do preço enquanto continuar assinando. Não é só no primeiro mês: a renovação também sai com 50%." },
  { q: "O preço volta ao normal depois?", a: "Para quem assinou na Black, não: o seu valor fica o mesmo em todas as renovações. Quem cancelar e voltar depois que a Black acabar entra no preço normal." },
  { q: "Preciso saber design?", a: "Não. Você fala o destino, os dias e o valor, e o vídeo do pacote, o anúncio, o carrossel, os stories e o site saem prontos com a sua logo." },
  { q: "O vídeo é feito como?", a: "Você manda um áudio, um texto ou a foto do pacote. A plataforma acha o destino, busca imagens reais do lugar e monta 3 vídeos diferentes, inclusive no estilo Black Friday, com o seu preço, a sua logo e o seu WhatsApp. Sai em 1 minuto, pronto para os stories." },
  { q: "Posso pagar no Pix?", a: "Pode. No fim você escolhe cartão ou Pix, e o QR Code aparece na hora." },
  { q: "Posso cancelar quando quiser?", a: "Pode, sem multa. Só lembre que, cancelando, você perde o preço da Black." },
  { q: "E se eu não gostar?", a: "Você tem 7 dias de garantia para testar com um pacote real da sua agência." },
];

/** Fim da /black: preços com o valor de antes riscado e as dúvidas sobre o vitalício. */
function BlackFaq({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="cv-reveal text-center">
        <span className="cv-black-tag">Black Friday · 50% vitalício</span>
        <h2 className="cv-h2 mt-4">Metade do preço. <span style={{ color: "var(--cv-hl)" }}>Para sempre.</span></h2>
        <p className="mt-3 text-[15px] font-semibold" style={{ color: "var(--cv-muted)" }}>Por tempo limitado. Quem entra agora garante esse valor.</p>
      </div>
      <div className="cv-reveal mt-8 grid gap-3 sm:grid-cols-3" style={delay(100)}>
        {BLACK_PRICES.map((p) => (
          <div key={p.name} className="cv-card relative p-5 text-center" style={p.popular ? { borderColor: "rgba(236,199,104,.7)", borderWidth: 2, boxShadow: "0 20px 50px -30px rgba(233,191,92,.6)" } : undefined}>
            {p.popular && <span className="cv-gold-badge absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-[11px] font-extrabold">MAIS ESCOLHIDO</span>}
            <p className="text-[15px] font-extrabold">{p.name}</p>
            <p className="mt-2 text-[14px]" style={{ color: "var(--cv-muted)" }}>de <span className="line-through">{p.was}</span> por</p>
            <p className="text-[34px] font-extrabold leading-tight tracking-[-0.02em]" style={{ color: "var(--cv-hl)" }}>{p.now}</p>
            <p className="text-[13px]" style={{ color: "var(--cv-muted)" }}>{p.per}</p>
            <p className="mt-2 text-[13px] font-semibold">{p.note}</p>
          </div>
        ))}
      </div>
      <div className="cv-reveal mt-6 text-center" style={delay(160)}>
        <button onClick={onStart} className="cv-btn h-14 w-full px-8 text-base sm:w-auto">
          Quero a Black <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="cv-reveal mt-12 text-center">
        <Eyebrow>Dúvidas</Eyebrow>
        <h2 className="cv-h2 mt-4">Antes de você assinar</h2>
      </div>
      <div className="mt-6 grid gap-2 text-left">
        {BLACK_FAQ.map((item) => (
          <details key={item.q} className="cv-card group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold">
              {item.q} <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" style={{ color: "var(--cv-primary-ink)" }} />
            </summary>
            <p className="mt-2 text-[14px] leading-6" style={{ color: "var(--cv-muted)" }}>{item.a}</p>
          </details>
        ))}
      </div>
      <div className="mt-8 text-center">
        <button onClick={onStart} className="cv-btn h-14 w-full px-8 text-base sm:w-auto">
          Começar agora <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-4 flex justify-center items-center gap-1.5 text-[13px]" style={{ color: "var(--cv-muted)" }}><ShieldCheck className="h-4 w-4" /> 7 dias de garantia · cartão ou Pix</p>
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
      { label: "CRM", icon: Users, bg: "#6366f1" },
      { label: "Site", icon: Globe, bg: "#0ea5a0" },
      { label: "Vídeo", icon: Video, bg: "#f59e0b" },
    ];
    return (
      <div className="flex h-32 items-end justify-center gap-1.5 pb-3">
        {cards.map((c, i) => (
          <div key={c.label} className="cv-cascade relative flex h-[84px] w-[50px] flex-col items-center justify-end rounded-xl pb-2 text-white shadow-md" style={{ ...delay(i * 400), background: c.bg }}>
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
      <div className="relative flex items-center gap-3">
        <span className="absolute left-5 right-5 top-1/2 h-px -translate-y-1/2 border-t border-dashed border-[#cfc4a6]" />
        <span className="cv-travel absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full" style={{ background: "var(--cv-accent)" }} />
        {[
          { icon: Download, bg: "var(--cv-primary)" },
          { icon: Instagram, bg: "#ff3d8b" },
          { icon: Megaphone, bg: "#f59e0b" },
          { icon: MessageCircle, bg: "#25d366" },
          { icon: DollarSign, bg: "#16a34a" },
        ].map((s, i) => (
          <span key={i} className="cv-hop relative z-10 grid h-10 w-10 place-items-center rounded-full text-white shadow" style={{ ...delay(i * 650), background: s.bg }}>
            <s.icon className="h-4 w-4" />
          </span>
        ))}
      </div>
      <span className="rounded-full px-3 py-1 text-center text-[10px] font-bold" style={{ background: "var(--cv-sand)", color: "var(--cv-muted)" }}>baixar → postar → impulsionar → WhatsApp → vendas</span>
    </div>
  );
}

const WHEEL: { label: string[]; bg: string; ink: string }[] = [
  { label: ["Anúncios"], bg: "#4fae9f", ink: "#fff" },
  { label: ["Carrosséis"], bg: "#6fe3b4", ink: "#16130d" },
  { label: ["Stories"], bg: "#0fbfa3", ink: "#16130d" },
  { label: ["Site"], bg: "#4667e8", ink: "#fff" },
  { label: ["Vídeos"], bg: "#ffc61a", ink: "#16130d" },
  { label: ["Clientes", "organizados"], bg: "#f39a1f", ink: "#16130d" },
  { label: ["Calendário", "de posts"], bg: "#ea5545", ink: "#fff" },
  { label: ["Agentes", "de IA"], bg: "#e8345f", ink: "#fff" },
];

/** Roda de setas girando devagar para a direita. Os textos ficam sempre em pé, e os principais começam à esquerda. */
function MarketingWheel({ black = false }: { black?: boolean }) {
  const c = 200;
  const outer = 196;
  const inner = 112;
  const mid = (outer + inner) / 2;
  const step = 360 / WHEEL.length;
  const tip = 7;
  const gap = 1.5;
  const at = (radius: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(c + radius * Math.cos(a)).toFixed(2)} ${(c + radius * Math.sin(a)).toFixed(2)}`;
  };
  return (
    <div className={`cv-reveal relative mx-auto w-full max-w-[460px] ${black ? "mb-14 mt-12" : "mt-10"}`}>
      <svg viewBox="0 0 400 400" className="block h-auto w-full" role="img" aria-label="Anúncios, carrosséis, stories, site, vídeos, clientes organizados, calendário de posts e agentes de IA">
        <g className="cv-wheel">
          {WHEEL.map((seg, i) => {
            // Anúncios embaixo à esquerda, carrosséis à esquerda e stories em cima à esquerda.
            const start = 135 + i * step - step / 2 + gap;
            const end = start + step - gap * 2;
            const [x, y] = at(mid, (start + end) / 2 + tip / 2).split(" ");
            return (
              <g key={seg.label.join(" ")}>
                <path
                  fill={seg.bg}
                  d={`M ${at(outer, start)} A ${outer} ${outer} 0 0 1 ${at(outer, end)} L ${at(mid, end + tip)} L ${at(inner, end)} A ${inner} ${inner} 0 0 0 ${at(inner, start)} L ${at(mid, start + tip)} Z`}
                />
                <g transform={`translate(${x} ${y})`}>
                  <text className="cv-wheel-label" textAnchor="middle" fill={seg.ink} fontSize="12.5" fontWeight="800">
                    {seg.label.map((line, l) => (
                      <tspan key={line} x="0" dy={l === 0 ? (seg.label.length > 1 ? -3 : 4) : 15}>{line}</tspan>
                    ))}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
        <text textAnchor="middle" fontWeight="800" fill="var(--cv-fg)" fontSize="19">
          <tspan x="200" y="182">Tudo da sua</tspan>
          <tspan x="200" dy="24">agência em um</tspan>
          <tspan x="200" dy="24">só lugar</tspan>
        </text>
      </svg>
      {black && SOCIAL_CHIPS.map((c) => (
        <span key={c.label} className={`cv-float absolute inline-flex items-center gap-1 rounded-xl border px-1.5 py-1 text-[10px] font-bold shadow-lg backdrop-blur-md sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-1.5 sm:text-[14px] ${c.around}`} style={{ ...delay(c.d), ["--cv-rot" as string]: c.rot, background: "rgba(18,16,25,.88)", borderColor: "rgba(255,255,255,.14)" }}>
          <span className="grid h-5 w-5 place-items-center rounded-md text-white sm:h-7 sm:w-7 sm:rounded-lg" style={{ background: c.bg }}><c.icon className="h-3 w-3 sm:h-4 sm:w-4" /></span>
          {c.label}
        </span>
      ))}
    </div>
  );
}

const TikTokIcon: Icon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M16.6 2h-3.3v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .8.1V9.2a6.3 6.3 0 1 0 5.4 6.2V8.6a7.9 7.9 0 0 0 4.6 1.5V6.8a4.6 4.6 0 0 1-4.6-4.8Z" />
  </svg>
);

/** Redes sociais: na /inicio, flutuando sobre a foto; na /black, em volta da roda (cantos livres do círculo). */
const SOCIAL_CHIPS: { label: string; icon: Icon; bg: string; pos: string; around: string; rot: string; d: number }[] = [
  { label: "Instagram", icon: Instagram, bg: "#e1306c", pos: "left-0 top-[8%] sm:left-[-6%] sm:top-[14%]", around: "left-0 top-0 sm:-left-14 sm:top-4", rot: "-5deg", d: 0 },
  { label: "Facebook", icon: Facebook, bg: "#1877f2", pos: "left-0 bottom-[8%] sm:left-[-5%] sm:bottom-[20%]", around: "left-0 bottom-0 sm:-left-14 sm:bottom-4", rot: "4deg", d: 600 },
  { label: "TikTok", icon: TikTokIcon, bg: "#16130d", pos: "right-0 top-[8%] sm:right-[-6%] sm:top-[14%]", around: "right-0 top-0 sm:-right-14 sm:top-4", rot: "5deg", d: 1200 },
  { label: "YouTube", icon: Youtube, bg: "#ff0000", pos: "right-0 top-[44%] sm:right-[-7%]", around: "right-0 bottom-0 sm:-right-14 sm:bottom-4", rot: "-3deg", d: 1500 },
  { label: "WhatsApp", icon: MessageCircle, bg: "#25d366", pos: "right-0 bottom-[8%] sm:right-[-5%] sm:bottom-[14%]", around: "inset-x-0 -bottom-10 mx-auto w-max", rot: "-4deg", d: 1800 },
];

function TeamImage() {
  const chips = SOCIAL_CHIPS;
  return (
    <div className="cv-reveal relative mx-auto mt-10 max-w-4xl px-2 sm:px-10">
      <div className="overflow-hidden rounded-[32px] bg-[#0f172a] shadow-[0_30px_60px_-30px_rgba(15,23,42,.6)]">
        <img src={heroDashboard} alt="Agente de viagens no notebook com o painel do Canva Viagem aberto" className="block h-auto w-full" loading="lazy" />
      </div>
      {chips.map((c) => (
        <span key={c.label} className={`cv-float absolute inline-flex items-center gap-1 rounded-xl border border-white/30 bg-white/85 px-1.5 py-1 text-[10px] font-bold shadow-lg backdrop-blur-md sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-2 sm:text-[15px] ${c.pos}`} style={{ ...delay(c.d), ["--cv-rot" as string]: c.rot }}>
          <span className="grid h-5 w-5 place-items-center rounded-md text-white sm:h-7 sm:w-7 sm:rounded-lg" style={{ background: c.bg }}><c.icon className="h-3 w-3 sm:h-4 sm:w-4" /></span>
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
              <button key={d.id} type="button" onClick={() => setActiveId(d.id)} aria-pressed={on} className="cv-peek-in min-w-[240px] flex-1 rounded-[22px] border p-4 text-left transition-colors" style={{ background: on ? "#16130d" : "var(--cv-paper)", color: on ? "#fff" : "var(--cv-fg)", borderColor: on ? "#16130d" : "var(--cv-line)" }}>
                <p className="text-[11px] font-bold tracking-[1.2px]" style={{ color: on ? "#8fe3d9" : "#0ea5a0" }}>{d.templateLabel.toUpperCase()}</p>
                <p className="mt-1 text-[15px] font-extrabold">{d.agencyName}</p>
                <p className="text-[12px]" style={{ color: on ? "#cfc4a6" : "var(--cv-muted)" }}>{d.category}</p>
                <span className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-[0.6px]" style={{ background: on ? "rgba(255,255,255,.12)" : "#e8f7f5", color: on ? "#fff" : "#0f766e" }}>{on ? "✓ SELECIONADO" : "CLIQUE PARA VER"}</span>
              </button>
            );
          })}
        </div>

        <div className="cv-reveal mt-4 overflow-hidden rounded-[32px] bg-[#16130d] p-3 sm:p-5" style={delay(120)}>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#221d14] px-4 py-3 text-white" style={{ color: "#fff" }}>
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
    { label: "No anúncio", icon: Megaphone }, { label: "No carrossel", icon: Images }, { label: "No site", icon: Globe }, { label: "Nos stories", icon: LayoutTemplate },
  ];

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <div className="cv-reveal">
          <h2 className="cv-h2">Envie sua logo e pronto.</h2>
          <p className="mt-4 text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
            Ela entra no anúncio, no carrossel, nos stories e no site. Tudo sai com a sua logo, as suas cores, o seu WhatsApp e as suas redes sociais.
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
            style={{ borderColor: over ? "var(--cv-primary)" : "#d9cfb3", background: over ? "var(--cv-soft-2)" : "var(--cv-paper)" }}
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
