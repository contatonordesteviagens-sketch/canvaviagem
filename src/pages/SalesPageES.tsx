import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, BadgeCheck, MessageCircle, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { trackESViewContent } from "@/lib/meta-pixel-es";
import { trackContact } from "@/lib/meta-pixel";
import { GARANTIA_DIAS_ES, suporteWhatsAppUrlES } from "@/lib/precos-es";
import { Eyebrow, delay, useReveal } from "@/components/cv-cream/shared";
import { FaqES, PieES, PlanesES } from "@/components/cv-cream/PlanesES";

/**
 * /es/planos: página de planes en español de España, con la marca única "Canva Viagem".
 * Valor primero (qué recibes); el precio solo aparece en la sección de planes.
 * Los precios, los enlaces de pago y el soporte salen de src/lib/precos-es.ts.
 */

const TITLE = "Planes de Canva Viagem: vídeo del paquete, anuncios, carruseles y web para tu agencia de viajes";
const DESCRIPTION = "Elige tu plan de Canva Viagem. Manda un audio y recibe el vídeo del paquete, anuncios, carruseles, stories y la web, con tu logo. Sin permanencia.";

const RECIBES = [
  "Vídeo del paquete a partir de un audio o de la foto del paquete",
  "Anuncios para feed y stories con tu logo",
  "Carruseles listos para cada destino",
  "Web con botón a tu WhatsApp",
  "Clientes ordenados en un solo sitio",
  "Calendario que te dice qué publicar cada día",
];

export default function SalesPageES() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const pageRef = useReveal<HTMLDivElement>();
  const tracked = useRef(false);

  useEffect(() => {
    document.documentElement.lang = "es";
    window.scrollTo(0, 0);
    if (tracked.current) return;
    tracked.current = true;
    trackESViewContent("Canva Viagem - Planes (ES)");
  }, []);

  return (
    <div ref={pageRef} className="cv-cream min-h-screen overflow-x-hidden">
      <Helmet>
        <html lang="es" />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
      </Helmet>

      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <div className="flex w-full max-w-5xl items-center justify-between rounded-full px-3 py-2">
          <a href="/es/inicio" aria-label="Canva Viagem" className="block h-[26px] w-[26px] overflow-hidden rounded-full">
            <img src={logo} alt="Canva Viagem" width={26} height={26} className="h-full w-full scale-[1.18] object-cover" />
          </a>
          {!user && (
            <button
              onClick={() => navigate("/login?redirect=%2F")}
              className="h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-bold"
              style={{ borderColor: "currentColor" }}
            >
              Ya soy cliente · Entrar
            </button>
          )}
        </div>
      </header>

      <main className="px-4 pb-10 pt-24 sm:pt-32">
        <section className="mx-auto max-w-3xl text-center">
          <Eyebrow className="cv-pop">Para agencias de viajes</Eyebrow>
          <h1 className="cv-pop mt-3 text-balance text-[2.2rem] font-extrabold leading-[1.05] tracking-[-0.025em] sm:text-5xl" style={delay(60)}>
            Manda un audio. Recibe tu agencia de viajes <span style={{ color: "var(--cv-hl)" }}>entera, lista.</span>
          </h1>
          <p className="cv-pop mt-4 text-[16px] leading-6" style={{ ...delay(120), color: "var(--cv-muted)" }}>
            Di el destino, los días y el precio, como se lo dirías a un cliente, y publica el material con tu logo.
          </p>
        </section>

        <section className="cv-reveal mx-auto mt-10 max-w-xl">
          <p className="text-center text-[13px] font-bold uppercase tracking-[0.6px]" style={{ color: "var(--cv-muted)" }}>Lo que recibes</p>
          <ul className="mt-4 flex flex-col gap-3">
            {RECIBES.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[16px] font-semibold leading-6">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--cv-accent)" }} /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center text-[14px]" style={{ color: "var(--cv-muted)" }}>
            Hay un tope diario de vídeos por cuenta.{" "}
            <a href="/es/inicio" className="inline-flex items-center gap-1 font-bold underline">Ver cómo funciona <ArrowRight className="h-3.5 w-3.5" /></a>
          </p>
        </section>

        <div className="mt-6">
          <PlanesES id="planes" />
        </div>

        <section className="px-0 pb-4 pt-8">
          <FaqES />
          <div className="cv-reveal mx-auto mt-12 max-w-md text-center">
            <p className="inline-flex items-center gap-1.5 text-[13px]" style={{ color: "var(--cv-muted)" }}>
              <ShieldCheck className="h-4 w-4" /> {GARANTIA_DIAS_ES} días de garantía · cancela cuando quieras
            </p>
            <a
              href={suporteWhatsAppUrlES("Hola, tengo una duda sobre Canva Viagem")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackContact()}
              className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-full border bg-white px-6 text-[14px] font-semibold"
              style={{ borderColor: "rgba(32,28,19,.15)" }}
            >
              <MessageCircle className="h-4 w-4" /> Escríbenos por WhatsApp
            </a>
          </div>
          <PieES />
        </section>
      </main>
    </div>
  );
}
