import { useEffect, useRef, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import logo from "@/assets/logo.png";
import {
  ArrowRight, MapPin, Sparkles, Download, Mic, DollarSign,
  Instagram, Facebook, Youtube, MessageCircle, LayoutTemplate, Images, Globe, Video, Users, Megaphone,
  ShieldCheck, Palette, PenLine, BadgeCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { trackESViewContent } from "@/lib/meta-pixel-es";
import { GARANTIA_DIAS_ES } from "@/lib/precos-es";
import { BrandMark, Eyebrow, delay, useReveal } from "@/components/cv-cream/shared";
import { FaqES, PieES, PlanesES } from "@/components/cv-cream/PlanesES";
import { LOGIN_ES_URL } from "@/lib/idioma-es";
import heroDashboard from "@/assets/hero_dashboard.webp";

/**
 * /es/inicio: misma estructura que la /inicio brasileña (InicioCreme), con copy es-ES.
 * El precio y la garantía solo salen en "Planes" (al final de la lectura).
 * Quedan fuera, hasta que existan versiones en español y en euros: la prueba de arte, la cinta de ejemplos,
 * los vídeos de muestra y las demos de web (ver informe de pendientes).
 */

type Icon = ComponentType<{ className?: string }>;

const TITLE = "Canva Viagem: manda un audio y recibe el vídeo de tu paquete, anuncios, carruseles y web listos";
const DESCRIPTION = "Di el destino, los días y el precio del paquete. Recibes el vídeo del paquete, anuncios, carruseles, stories y la web, con tu logo. Para agencias de viajes.";

const steps = [
  { n: "01", icon: Mic, title: "Manda un audio", text: "Di el destino, los días y el precio, como se lo dirías a un cliente. Si prefieres, escríbelo o manda la foto del paquete." },
  { n: "02", icon: Sparkles, title: "Recibe todo listo", text: "El vídeo del paquete, el anuncio, el carrusel y la web salen listos en pocos minutos, ya con tu logo." },
  { n: "03", icon: Download, title: "Publica y vende", text: "Descarga, publica en Instagram, impulsa el anuncio y manda la web por WhatsApp." },
];

const compare = [
  ["Cómo se pide", "Mandas un audio", "Briefing y reunión"],
  ["Cuándo está listo", "En minutos", "En días"],
  ["Cantidad", "Según tu plan (hay tope diario)", "Lo que quepa en el contrato"],
  ["Anuncios y stories", "Incluidos", "Diseñador gráfico"],
  ["Carruseles y textos", "Incluidos", "Community manager"],
  ["Web con cada paquete", "Incluida", "Programador"],
  ["Vídeo del paquete a partir de un audio", "Listo en minutos", "Editor de vídeo"],
  ["Clientes ordenados", "En un solo sitio", "Otra herramienta"],
  ["Cuándo funciona", "A cualquier hora", "En horario de oficina"],
  ["Cuánto pagas", "Una suscripción", "Nóminas o autónomos"],
] as const;

const delivery: { icon: Icon; title: string; text: string }[] = [
  { icon: MapPin, title: "Tú dices el paquete", text: "Destino, días y precio. Por audio o por escrito." },
  { icon: Palette, title: "Eliges un modelo", text: "Diseños listos para feed, stories, carrusel y web." },
  { icon: PenLine, title: "Los textos ya vienen hechos", text: "Texto del post y llamada a la venta, con tu marca aplicada." },
  { icon: Download, title: "Descargas y publicas", text: "Publica en Instagram y mándalo por WhatsApp." },
];

const GENERADOR_ITEMS = [
  "Vídeos reales de los destinos",
  "Varios estilos distintos",
  "Los servicios incluidos, uno a uno",
  "El precio, tu logo y tu WhatsApp al final",
];

// Antes había GIFs de terceros (Giphy) con texto en portugués. Ahora son bloques sin multimedia.
const CONTENIDO_LISTO = [
  ["Reels por destino", "Vídeos verticales listos para publicar, con imágenes reales del destino."],
  ["Diseños por destino", "Imágenes para feed y stories, sin partir de una página en blanco."],
  ["Calendario diario", "Te dice qué publicar cada día, para que no tengas que decidirlo tú."],
] as const;

export default function InicioES() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const tracked = useRef(false);
  const pageRef = useReveal<HTMLDivElement>();

  useEffect(() => {
    document.documentElement.lang = "es";
    if (tracked.current) return;
    tracked.current = true;
    trackESViewContent("Canva Viagem - Plataforma para agencias de viajes (ES)");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goPlanes = () => document.getElementById("planes")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div ref={pageRef} className="cv-cream min-h-screen overflow-x-hidden">
      <Helmet>
        <html lang="es" />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
      </Helmet>

      {/* Cabecera fija */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <div
          className="flex w-full max-w-5xl items-center justify-between rounded-full px-3 py-2 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(255,255,255,0.1)" : "transparent",
            border: "1px solid transparent",
            backdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
          }}
        >
          <a href="/es/inicio" aria-label="Canva Viagem" className="block h-[26px] w-[26px] overflow-hidden rounded-full">
            <img src={logo} alt="Canva Viagem" width={26} height={26} className="h-full w-full scale-[1.18] object-cover" />
          </a>
          <div className="flex items-center gap-1.5">
            {!user && (
              <button
                onClick={() => navigate(LOGIN_ES_URL)}
                className="h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-bold"
                style={{ borderColor: "currentColor" }}
              >
                Ya soy cliente · Entrar
              </button>
            )}
            <button onClick={() => (user ? navigate("/") : goPlanes())} className="cv-btn h-9 shrink-0 whitespace-nowrap px-4 text-[13px]">
              {user ? "Ir a mi cuenta" : "Ver planes"}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* 1. Hero */}
        <section className="px-4 pb-8 pt-24 sm:pt-32">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <Eyebrow className="cv-pop">Para agencias de viajes</Eyebrow>
            <h1 className="cv-pop mt-3 max-w-3xl text-balance text-[2.4rem] font-extrabold leading-[1.04] tracking-[-0.025em] sm:text-6xl md:text-[4.2rem]" style={delay(60)}>
              Manda un audio. Recibe tu agencia de{" "}
              <em className="font-bold" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "var(--cv-primary-ink)" }}>viajes</em>{" "}
              <span style={{ color: "var(--cv-hl)" }}>entera, lista.</span>
            </h1>
            <p className="cv-pop mt-5 max-w-xl text-[16px] leading-6" style={{ ...delay(160), color: "var(--cv-muted)" }}>
              Di el destino, los días y el precio, como se lo dirías a un cliente. Recibes el vídeo del paquete, los anuncios, los carruseles, los stories y la web, con tu logo. Puedes mandar hasta la foto del paquete del mayorista.
            </p>
            <div className="cv-pop mt-7 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row" style={delay(220)}>
              <button onClick={() => navigate("/es/onboarding")} className="cv-btn h-14 w-full px-8 text-base sm:w-auto">
                <Mic className="h-4 w-4" /> Empezar ahora
              </button>
              <a href="#como-funciona" className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border bg-white px-8 text-base font-semibold sm:w-auto" style={{ borderColor: "rgba(32,28,19,.15)" }}>
                Ver cómo funciona <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="cv-pop mt-7 flex flex-col items-center gap-2" style={delay(300)}>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: "var(--cv-fg)", color: "var(--cv-bg)" }}>
                MÁS ARTES CADA DÍA
              </span>
              <p className="text-[14px] font-semibold" style={{ color: "var(--cv-muted)" }}>Crea todos los anuncios, carruseles y stories que necesites en tu día a día.</p>
            </div>
          </div>
        </section>

        {/* 2. Cómo funciona */}
        <section id="como-funciona" className="scroll-mt-24 px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Cómo funciona</Eyebrow>
              <h2 className="cv-h2 mt-4">Un audio. Tres pasos. El mes entero resuelto.</h2>
              <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Tú hablas, nosotros lo montamos, tú publicas. Lo demás son clientes escribiéndote.</p>
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
            <div className="cv-reveal mx-auto mt-8 grid max-w-3xl overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_40px_-26px_rgba(32,28,19,.35)] sm:grid-cols-2" style={{ borderColor: "var(--cv-line)" }}>
              <div className="p-6 text-center sm:text-left">
                <p className="text-[22px] font-extrabold leading-tight tracking-[-0.02em]">Habla de tu agencia y de tu paquete</p>
                <p className="mt-2 text-[15px] leading-6" style={{ color: "var(--cv-muted)" }}>Ejemplo: «Punta Cana, 8 días, pareja, 1.450 € por persona en habitación doble»</p>
                <p className="mt-2 text-[15px] font-bold">Todo listo en minutos.</p>
              </div>
              <button
                type="button"
                onClick={goPlanes}
                className="cv-mic flex min-h-[150px] flex-col items-center justify-center gap-3 p-6 text-white"
                style={{ background: "#6440e6" }}
              >
                <span className="relative grid h-20 w-20 place-items-center rounded-full bg-white/15">
                  <span className="cv-ping absolute inset-0 rounded-full bg-white/30" />
                  <Mic className="relative h-9 w-9" />
                </span>
                <span className="text-[17px] font-bold">Grabar audio ahora</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2b. Novedad: generador de vídeo */}
        <section id="generador-de-video" className="scroll-mt-24 px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-extrabold tracking-[0.6px]" style={{ background: "var(--cv-hl)", color: "#fff" }}>
                <Sparkles className="h-3.5 w-3.5" /> NOVEDAD · VÍDEOS DE PAQUETES
              </span>
              <h2 className="cv-h2 mt-4">Tu paquete, en vídeo, a partir de un audio.</h2>
              <p className="mt-4 text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
                Mandas un audio o la foto de tu paquete y recibes vídeos en distintos estilos, con los servicios incluidos, el precio, tu logo y tu WhatsApp.
              </p>
            </div>
            <div className="cv-reveal mx-auto mt-8 max-w-xl" style={delay(120)}>
              <ul className="flex flex-col gap-3">
                {GENERADOR_ITEMS.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[16px] font-semibold leading-6">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--cv-accent)" }} /> {t}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[15px] leading-6" style={{ color: "var(--cv-muted)" }}>
                Cada vez que generas, sale una variación nueva, y el texto del post ya viene listo para pegar. Hay un tope diario de vídeos por cuenta.
              </p>
              <button onClick={goPlanes} className="cv-btn mt-6 inline-flex h-12 items-center gap-2 px-6 text-[15px]">
                Quiero crear mis vídeos <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* 4. Todo en un solo sitio */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Todo en un solo sitio</Eyebrow>
              <h2 className="cv-h2 mt-4">Todo lo que haría un equipo de marketing entero.</h2>
              <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Todo lo que necesitas para vender viajes por internet.</p>
            </div>
            <MarketingWheel />
            <TeamImage />
          </div>
        </section>

        {/* 5. Tu logo en todo */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="cv-reveal">
              <h2 className="cv-h2">Sube tu logo y listo.</h2>
              <p className="mt-4 text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
                Entra en el anuncio, el carrusel, los stories y la web. Todo sale con tu logo, tus colores, tu WhatsApp y tus redes sociales.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {([
                  { label: "En el anuncio", icon: Megaphone },
                  { label: "En el carrusel", icon: Images },
                  { label: "En la web", icon: Globe },
                  { label: "En los stories", icon: LayoutTemplate },
                ] as { label: string; icon: Icon }[]).map((p) => (
                  <span key={p.label} className="flex flex-col items-center gap-2 rounded-2xl border bg-white p-3 text-[12px] font-semibold" style={{ borderColor: "var(--cv-line)" }}>
                    <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--cv-sand)" }}><p.icon className="h-5 w-5" /></span>
                    {p.label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[13px]" style={{ color: "var(--cv-muted)" }}>¿Aún no tienes logo? Sin problema: puedes empezar solo con el nombre de la agencia.</p>
            </div>
          </div>
        </section>

        {/* 7. Contenido listo */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="cv-reveal text-center">
              <Eyebrow>Contenido listo</Eyebrow>
              <h2 className="cv-h2 mt-4">Contenido para publicar sin tener que inventar nada.</h2>
              <p className="mt-4 text-lg leading-7" style={{ color: "var(--cv-muted)" }}>
                Vídeos Reels y diseños por destino, con un calendario que te dice qué publicar cada día.
              </p>
            </div>
            <div className="cv-reveal mt-8" style={delay(140)}>
              <div className="grid gap-3 sm:grid-cols-3">
                {CONTENIDO_LISTO.map(([titulo, texto]) => (
                  <div key={titulo} className="rounded-[24px] bg-white p-5 shadow-[0_24px_50px_-30px_rgba(32,28,19,.45)]">
                    <h3 className="text-base font-bold">{titulo}</h3>
                    <p className="mt-2 text-sm leading-6" style={{ color: "var(--cv-muted)" }}>{texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. Comparación */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Comparación</Eyebrow>
              <h2 className="cv-h2 mt-4">Canva Viagem o un equipo de marketing</h2>
            </div>
            <div className="cv-reveal mt-10 overflow-hidden rounded-[32px] border" style={{ borderColor: "var(--cv-line)" }}>
              <table className="w-full text-left text-sm">
                <thead style={{ background: "var(--cv-head)" }}>
                  <tr>
                    <th className="px-3 py-4 font-medium sm:px-6" style={{ color: "var(--cv-muted)" }}><span className="sr-only">Comparación</span></th>
                    <th className="px-2 py-4 font-bold sm:px-6">Canva Viagem</th>
                    <th className="px-3 py-4 font-medium sm:px-6" style={{ color: "var(--cv-muted)" }}>Equipo de marketing</th>
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

        {/* 9. Cómo te lo entregamos todo listo */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="cv-reveal mx-auto max-w-2xl text-center">
              <Eyebrow>Sin tocar nada</Eyebrow>
              <h2 className="cv-h2 mt-4">Cómo te lo entregamos todo listo</h2>
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
        </section>

        {/* 10. Planes (precio al final, tras todo el valor) */}
        <PlanesES />
      </main>

      {/* 11-12. Preguntas frecuentes y cierre */}
      <section className="px-4 pb-10 pt-8" style={{ background: "linear-gradient(180deg, var(--cv-bg) 0%, var(--cv-glow-1) 55%, var(--cv-glow-2) 100%)" }}>
        <FaqES />
        <div className="cv-reveal mx-auto mt-24 max-w-2xl text-center">
          <h2 className="cv-h2">Deja de publicar a salto de mata.<br />Manda tu primer audio.</h2>
          <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>Destino, días y precio. Recibes anuncio, carrusel, stories y web con tu logo, y vídeos listos para publicar.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => navigate("/es/onboarding")} className="cv-btn h-14 w-full px-8 text-base sm:w-auto">
              <Mic className="h-4 w-4" /> Empezar ahora
            </button>
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[13px]" style={{ color: "var(--cv-muted)" }}>
            <ShieldCheck className="h-4 w-4" /> {GARANTIA_DIAS_ES} días de garantía · cancela cuando quieras
          </p>
        </div>
        <PieES />
      </section>
    </div>
  );
}

/* ───────────────────────── bloques ───────────────────────── */

/** Ilustraciones animadas de los tres pasos: escuchar, montar, publicar. */
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
      { label: "Anuncio", icon: Megaphone, bg: "var(--cv-primary)" },
      { label: "Carrusel", icon: Images, bg: "#ff3d8b" },
      { label: "CRM", icon: Users, bg: "#6366f1" },
      { label: "Web", icon: Globe, bg: "#0ea5a0" },
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
      <span className="rounded-full px-3 py-1 text-center text-[10px] font-bold" style={{ background: "var(--cv-sand)", color: "var(--cv-muted)" }}>descargar → publicar → impulsar → WhatsApp → ventas</span>
    </div>
  );
}

const WHEEL: { label: string[]; bg: string; ink: string }[] = [
  { label: ["Anuncios"], bg: "#4fae9f", ink: "#fff" },
  { label: ["Carruseles"], bg: "#6fe3b4", ink: "#16130d" },
  { label: ["Stories"], bg: "#0fbfa3", ink: "#16130d" },
  { label: ["Web"], bg: "#4667e8", ink: "#fff" },
  { label: ["Vídeos"], bg: "#ffc61a", ink: "#16130d" },
  { label: ["Clientes", "ordenados"], bg: "#f39a1f", ink: "#16130d" },
  { label: ["Calendario", "de posts"], bg: "#ea5545", ink: "#fff" },
  { label: ["Agentes", "de IA"], bg: "#e8345f", ink: "#fff" },
];

/** Rueda de flechas que gira despacio hacia la derecha. Los textos quedan siempre en pie. */
function MarketingWheel() {
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
    <div className="cv-reveal relative mx-auto mt-10 w-full max-w-[460px]">
      <svg viewBox="0 0 400 400" className="block h-auto w-full" role="img" aria-label="Anuncios, carruseles, stories, web, vídeos, clientes ordenados, calendario de posts y agentes de IA">
        <g className="cv-wheel">
          {WHEEL.map((seg, i) => {
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
          <tspan x="200" y="182">Todo tu negocio</tspan>
          <tspan x="200" dy="24">en un solo</tspan>
          <tspan x="200" dy="24">sitio</tspan>
        </text>
      </svg>
    </div>
  );
}

const TikTokIcon: Icon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M16.6 2h-3.3v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .8.1V9.2a6.3 6.3 0 1 0 5.4 6.2V8.6a7.9 7.9 0 0 0 4.6 1.5V6.8a4.6 4.6 0 0 1-4.6-4.8Z" />
  </svg>
);

const SOCIAL_CHIPS: { label: string; icon: Icon; bg: string; pos: string; rot: string; d: number }[] = [
  { label: "Instagram", icon: Instagram, bg: "#e1306c", pos: "left-0 top-[8%] sm:left-[-6%] sm:top-[14%]", rot: "-5deg", d: 0 },
  { label: "Facebook", icon: Facebook, bg: "#1877f2", pos: "left-0 bottom-[8%] sm:left-[-5%] sm:bottom-[20%]", rot: "4deg", d: 600 },
  { label: "TikTok", icon: TikTokIcon, bg: "#16130d", pos: "right-0 top-[8%] sm:right-[-6%] sm:top-[14%]", rot: "5deg", d: 1200 },
  { label: "YouTube", icon: Youtube, bg: "#ff0000", pos: "right-0 top-[44%] sm:right-[-7%]", rot: "-3deg", d: 1500 },
  { label: "WhatsApp", icon: MessageCircle, bg: "#25d366", pos: "right-0 bottom-[8%] sm:right-[-5%] sm:bottom-[14%]", rot: "-4deg", d: 1800 },
];

function TeamImage() {
  return (
    <div className="cv-reveal relative mx-auto mt-10 max-w-4xl px-2 sm:px-10">
      <div className="overflow-hidden rounded-[32px] bg-[#0f172a] shadow-[0_30px_60px_-30px_rgba(15,23,42,.6)]">
        <img src={heroDashboard} alt="Agente de viajes en el ordenador con el panel de Canva Viagem abierto" width={1024} height={640} className="block h-auto w-full" loading="lazy" decoding="async" />
      </div>
      {SOCIAL_CHIPS.map((c) => (
        <span key={c.label} className={`cv-float absolute inline-flex items-center gap-1 rounded-xl border border-white/30 bg-white/85 px-1.5 py-1 text-[10px] font-bold shadow-lg backdrop-blur-md sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-2 sm:text-[15px] ${c.pos}`} style={{ ...delay(c.d), ["--cv-rot" as string]: c.rot }}>
          <span className="grid h-5 w-5 place-items-center rounded-md text-white sm:h-7 sm:w-7 sm:rounded-lg" style={{ background: c.bg }}><c.icon className="h-3 w-3 sm:h-4 sm:w-4" /></span>
          {c.label}
        </span>
      ))}
    </div>
  );
}
