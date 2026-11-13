import { useEffect, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { BrandMark } from "@/components/cv-cream/shared";
import { PieES } from "@/components/cv-cream/PlanesES";

/** Marcador visível para os dados do titular que ainda faltam. Nunca inventar: o Lucas preenche. */
export const DATOS_EMPRESA_PENDIENTE = "[DATOS_EMPRESA: pendiente]";

/** Moldura das páginas legais em espanhol (/es/terminos, /es/privacidad). */
export function LegalES({ title, updated, description, children }: { title: string; updated: string; description?: string; children: ReactNode }) {
  useEffect(() => {
    const anterior = document.documentElement.lang;
    document.documentElement.lang = "es";
    // Chegando por /es/privacidad#cookies: a página é carregada sob demanda, então a âncora é levada à mão.
    // Com um pequeno atraso, para valer depois de qualquer rolagem ao topo feita na troca de rota.
    const id = window.location.hash.slice(1);
    const timer = window.setTimeout(() => {
      const alvo = id ? document.getElementById(id) : null;
      if (alvo) alvo.scrollIntoView();
      else window.scrollTo(0, 0);
    }, 80);
    return () => { window.clearTimeout(timer); document.documentElement.lang = anterior; };
  }, []);

  return (
    <div lang="es-ES" className="cv-cream min-h-screen px-4 pb-10">
      <Helmet>
        <html lang="es" />
        <title>{`${title} | Canva Viagem`}</title>
        {description && <meta name="description" content={description} />}
        {description && <meta property="og:description" content={description} />}
      </Helmet>
      <header className="mx-auto flex max-w-3xl justify-start pt-6">
        <a href="/es/inicio" aria-label="Canva Viagem"><BrandMark size={36} /></a>
      </header>
      <main className="mx-auto max-w-3xl pt-10">
        <h1 className="text-[32px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[40px]">{title}</h1>
        <p className="mt-3 text-[14px]" style={{ color: "var(--cv-muted)" }}>Última actualización: {updated}</p>
        <div className="mt-8 flex flex-col gap-8">{children}</div>
      </main>
      <PieES />
    </div>
  );
}

export function SeccionLegal({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-[20px] font-extrabold leading-snug">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-[15px] leading-7" style={{ color: "var(--cv-muted)" }}>{children}</div>
    </section>
  );
}

export const enlaceLegal = "font-semibold underline";
