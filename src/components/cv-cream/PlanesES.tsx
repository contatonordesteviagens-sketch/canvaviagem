import { ArrowRight, BadgeCheck, ChevronDown, ShieldCheck } from "lucide-react";
import { BrandMark, Eyebrow, delay } from "@/components/cv-cream/shared";
import { trackESInitiateCheckout } from "@/lib/meta-pixel-es";
import {
  CHECKOUT_ES, GARANTIA_DIAS_ES, MOEDA_ISO_ES, PLANOS_ES, SUPORTE_EMAIL_ES, formatPrecio, type PlanoES,
} from "@/lib/precos-es";

/** Ir al pago. Los enlaces y los precios salen de precos-es.ts (única fuente). */
export function irAlPagoES(plano: PlanoES) {
  trackESInitiateCheckout(PLANOS_ES[plano].precoMes, MOEDA_ISO_ES);
  window.open(CHECKOUT_ES[plano], "_blank", "noopener,noreferrer");
}

// PROVISÓRIO: la lista exacta de Start está pendiente de confirmar con Lucas. Solo se promete lo que el producto ya separa como biblioteca.
const INCLUYE_START = ["Biblioteca de contenidos de viajes en la plataforma"];

const INCLUYE_ELITE = [
  "Vídeo del paquete a partir de un audio o de la foto del paquete",
  "Anuncios para feed y stories con tu logo",
  "Carruseles por destino",
  "Web con botón a tu WhatsApp",
  "Clientes ordenados en un solo sitio",
  "Calendario de qué publicar cada día",
  "Agentes de IA",
];

/** Planes: aquí, y solo aquí, aparece el precio (después de todo el valor). */
export function PlanesES({ id = "planes", compact = false }: { id?: string; compact?: boolean }) {
  return (
    <section id={id} className={`scroll-mt-24 px-4 ${compact ? "pb-16 pt-6" : "py-16 sm:py-24"}`}>
      <div className="mx-auto max-w-4xl">
        {!compact && (
          <div className="cv-reveal mx-auto max-w-2xl text-center">
            <Eyebrow>Planes</Eyebrow>
            <h2 className="cv-h2 mt-4">Elige tu plan</h2>
            <p className="mt-4 text-lg" style={{ color: "var(--cv-muted)" }}>
              Lo que has visto arriba, con tu logo, en el plan que mejor te encaje. Pago seguro con tarjeta. Sin permanencia: cancelas cuando quieras.
            </p>
          </div>
        )}

        <div className="cv-reveal mt-10 grid gap-4 md:grid-cols-2" style={delay(80)}>
          <div className="cv-card flex flex-col p-6">
            <p className="text-[15px] font-extrabold">Start</p>
            <ul className="mt-4 flex flex-1 flex-col gap-3">
              {INCLUYE_START.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[15px] font-semibold leading-6">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--cv-accent)" }} /> {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[34px] font-extrabold leading-tight tracking-[-0.02em]" style={{ color: "var(--cv-hl)" }}>
              {formatPrecio(PLANOS_ES.start.precoMes)} <span className="text-[14px] font-semibold" style={{ color: "var(--cv-muted)" }}>/mes</span>
            </p>
            <p className="text-[13px]" style={{ color: "var(--cv-muted)" }}>Cancela cuando quieras</p>
            <button type="button" onClick={() => irAlPagoES("start")} className="cv-btn mt-4 h-12 w-full px-6 text-[15px]">
              Empezar con Start <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="cv-card flex flex-col p-6" style={{ borderColor: "var(--cv-primary)", borderWidth: 2 }}>
            <p className="text-[15px] font-extrabold">Elite <span className="ml-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold" style={{ background: "var(--cv-soft)", color: "var(--cv-primary-ink)" }}>RECOMENDADO</span></p>
            <p className="mt-3 text-[13px] font-bold uppercase tracking-[0.6px]" style={{ color: "var(--cv-muted)" }}>Todo lo de Start, y además</p>
            <ul className="mt-3 flex flex-1 flex-col gap-3">
              {INCLUYE_ELITE.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[15px] font-semibold leading-6">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--cv-accent)" }} /> {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[34px] font-extrabold leading-tight tracking-[-0.02em]" style={{ color: "var(--cv-hl)" }}>
              {formatPrecio(PLANOS_ES.elite.precoMes)} <span className="text-[14px] font-semibold" style={{ color: "var(--cv-muted)" }}>/mes</span>
            </p>
            <p className="text-[13px]" style={{ color: "var(--cv-muted)" }}>Cancela cuando quieras</p>
            <button type="button" onClick={() => irAlPagoES("elite")} className="cv-btn mt-4 h-12 w-full px-6 text-[15px]">
              Empezar con Elite <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="cv-reveal mx-auto mt-8 max-w-2xl text-center" style={delay(140)}>
          <p className="inline-flex items-center gap-1.5 text-[15px] font-bold">
            <ShieldCheck className="h-5 w-5" /> Garantía de {GARANTIA_DIAS_ES} días
          </p>
          <p className="mt-2 text-[15px] leading-6" style={{ color: "var(--cv-muted)" }}>
            Crea el material de un paquete real de tu agencia. Si no te encaja, pide el reembolso dentro del plazo de la garantía.
          </p>
          <p className="mt-3 text-[13px]" style={{ color: "var(--cv-muted)" }}>
            Cobro en dólares (US$) · Pago con tarjeta · Sin permanencia
          </p>
        </div>
      </div>
    </section>
  );
}

export const FAQ_ES = [
  { q: "¿Necesito saber de diseño?", a: "No. Dices el destino, los días y el precio, y el vídeo del paquete, el anuncio, el carrusel, los stories y la web salen listos con tu logo." },
  { q: "¿Cómo se hace el vídeo?", a: "Mandas un audio o la foto del paquete. La plataforma localiza el destino, usa vídeos reales del lugar y monta varios vídeos en estilos distintos, con los servicios incluidos, el precio, tu logo y tu WhatsApp." },
  { q: "¿Cuántos vídeos puedo hacer?", a: "Hay un tope diario por cuenta." },
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí, sin permanencia." },
  { q: "¿Qué pasa si no me gusta?", a: `Tienes ${GARANTIA_DIAS_ES} días de garantía para probarlo con un paquete real de tu agencia.` },
  { q: "¿Cómo pago?", a: "Con tarjeta, de forma segura." },
];

/** Preguntas frecuentes: la respuesta sobre el precio y la garantía va al final de la lectura. */
export function FaqES() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="cv-reveal text-center">
        <Eyebrow>Dudas</Eyebrow>
        <h2 className="cv-h2 mt-4">Antes de empezar</h2>
      </div>
      <div className="mt-6 grid gap-2 text-left">
        {FAQ_ES.map((item) => (
          <details key={item.q} className="cv-card group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold">
              {item.q} <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" style={{ color: "var(--cv-primary-ink)" }} />
            </summary>
            <p className="mt-2 text-[14px] leading-6" style={{ color: "var(--cv-muted)" }}>{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

/**
 * Pie de las páginas ES.
 * Enlaza a los términos y a la privacidad en español (/es/terminos, /es/privacidad).
 * PENDIENTE: completar [DATOS_EMPRESA] en esas dos páginas (razón social, NIF/CNPJ, domicilio).
 */
export function PieES() {
  return (
    <footer className="mx-auto mt-24 flex max-w-5xl flex-col items-center justify-between gap-4 border-t pt-6 text-[13px] sm:flex-row" style={{ borderColor: "rgba(32,28,19,.12)", color: "var(--cv-muted)" }}>
      <BrandMark size={32} withName={false} />
      <div className="flex flex-wrap justify-center gap-5">
        <a href="/es/terminos" className="hover:underline">Términos</a>
        <a href="/es/privacidad" className="hover:underline">Privacidad</a>
        <a href="/es/privacidad#cookies" className="hover:underline">Cookies</a>
        <a href={`mailto:${SUPORTE_EMAIL_ES}`} className="hover:underline">Contacto</a>
      </div>
      <p>© {new Date().getFullYear()} Canva Viagem. Todos los derechos reservados.</p>
    </footer>
  );
}
