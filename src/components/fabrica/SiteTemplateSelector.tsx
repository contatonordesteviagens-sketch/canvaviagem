import { Check } from "lucide-react";
import {
  SITE_TEMPLATE_CATALOG,
  normalizeSiteTemplateId,
  type SiteTemplateId,
  type SiteTemplateLocale,
} from "@/lib/site-template-catalog";

interface SiteTemplateSelectorProps {
  selected: unknown;
  onSelect: (templateId: SiteTemplateId) => void;
  locale?: SiteTemplateLocale;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  heroImageUrl?: string;
}

const copy = {
  pt: {
    title: "Escolha o modelo do site",
    support: "Troque o visual sem perder textos, imagens ou as cores da sua agência.",
    count: "6 modelos",
    selected: "Selecionado",
  },
  es: {
    title: "Elige el modelo del sitio",
    support: "Cambia el visual sin perder textos, imágenes ni los colores de tu agencia.",
    count: "6 modelos",
    selected: "Seleccionado",
  },
} as const;

const TemplatePreview = ({
  templateId,
  primaryColor,
  secondaryColor,
  backgroundColor,
  heroImageUrl,
}: Omit<SiteTemplateSelectorProps, "selected" | "onSelect" | "locale"> & {
  templateId: SiteTemplateId;
}) => {
  const style = {
    "--preview-primary": primaryColor || "#0F7490",
    "--preview-secondary": secondaryColor || "#38BDF8",
    "--preview-background": backgroundColor || "#F0F9FF",
  } as React.CSSProperties;

  return (
    <div
      aria-hidden="true"
      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[var(--preview-background)] min-[560px]:h-auto min-[560px]:w-full min-[560px]:aspect-[16/10] template-preview-${templateId}`}
      style={style}
    >
      {heroImageUrl ? (
        <img src={heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      ) : (
        <div className="absolute inset-0 bg-[var(--preview-primary)] opacity-30" />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/35" />
      <div className="absolute left-2 right-2 top-2 flex items-center justify-between">
        <span className="h-1.5 w-5 rounded-full bg-white/90" />
        <span className="h-1 w-6 rounded-full bg-white/65" />
      </div>

      {templateId === "standard" && (
        <>
          <span className="absolute bottom-5 left-2 h-1.5 w-10 rounded-full bg-white" />
          <span className="absolute bottom-2 left-2 h-2.5 w-7 rounded bg-[var(--preview-secondary)]" />
        </>
      )}
      {templateId === "horizonte" && (
        <>
          <span className="absolute bottom-7 left-2 h-1.5 w-14 bg-white" />
          <span className="absolute bottom-4 left-2 h-1 w-10 bg-white/75" />
          <span className="absolute bottom-0 left-2 right-2 h-2 rounded-t-full bg-[var(--preview-background)]" />
        </>
      )}
      {templateId === "ofertas" && (
        <div className="absolute bottom-2 left-2 right-2 grid grid-cols-3 gap-1">
          {[0, 1, 2].map((item) => (
            <span key={item} className="relative h-6 rounded-sm bg-white/90">
              <i className="absolute bottom-1 left-1 h-1 w-3 rounded bg-[var(--preview-primary)]" />
            </span>
          ))}
        </div>
      )}
      {templateId === "experiencias" && (
        <div className="absolute bottom-2 left-2 right-2 grid h-8 grid-cols-[1.4fr_.6fr] gap-1">
          <span className="rounded-md border border-white/70 bg-[var(--preview-primary)]/70" />
          <span className="grid gap-1">
            <i className="rounded-sm bg-white/85" />
            <i className="rounded-sm bg-[var(--preview-secondary)]" />
          </span>
        </div>
      )}
      {templateId === "expedicoes" && (
        <>
          <span className="absolute -bottom-3 -left-2 h-12 w-20 -skew-x-12 bg-[var(--preview-primary)]/90" />
          <span className="absolute bottom-2 left-2 h-1.5 w-12 bg-white" />
          <span className="absolute bottom-5 right-2 h-4 w-1 bg-[var(--preview-secondary)]" />
        </>
      )}
      {templateId === "excursoes" && (
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          {[0, 1, 2, 3].map((item) => (
            <span key={item} className="relative z-10 h-2 w-2 rounded-full border border-white bg-[var(--preview-primary)]" />
          ))}
          <span className="absolute bottom-[3px] left-1 right-1 h-px bg-white/80" />
        </div>
      )}
    </div>
  );
};

export const SiteTemplateSelector = ({
  selected,
  onSelect,
  locale = "pt",
  primaryColor,
  secondaryColor,
  backgroundColor,
  heroImageUrl,
}: SiteTemplateSelectorProps) => {
  const activeTemplateId = normalizeSiteTemplateId(selected);
  const labels = copy[locale];

  return (
    <fieldset className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <legend className="sr-only">{labels.title}</legend>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">{labels.title}</h3>
          <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-white/55">{labels.support}</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-semibold text-white/55">
          {labels.count}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 min-[560px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6" data-testid="site-template-selector">
        {SITE_TEMPLATE_CATALOG.map((template) => {
          const templateCopy = template.copy[locale];
          const active = activeTemplateId === template.id;
          const nameId = `site-template-${template.id}-name-${locale}`;
          const descriptionId = `site-template-${template.id}-description-${locale}`;

          return (
            <label
              key={template.id}
              className={`group relative flex min-h-20 cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-left transition-colors focus-within:ring-2 focus-within:ring-[#F5F906] focus-within:ring-offset-2 focus-within:ring-offset-zinc-950 min-[560px]:min-h-0 min-[560px]:flex-col min-[560px]:items-stretch min-[560px]:p-3 ${
                active
                  ? "border-[#F5F906] bg-[#F5F906]/10"
                  : "border-white/10 bg-black/15 hover:border-white/25 hover:bg-white/[0.04]"
              }`}
            >
              <input
                type="radio"
                name="site-template"
                value={template.id}
                checked={active}
                onChange={() => onSelect(template.id)}
                aria-labelledby={nameId}
                aria-describedby={descriptionId}
                data-testid={`site-template-${template.id}`}
                className="sr-only"
              />
              <TemplatePreview
                templateId={template.id}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                backgroundColor={backgroundColor}
                heroImageUrl={heroImageUrl}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span id={nameId} className="text-xs font-bold text-white">{templateCopy.label}</span>
                  {active && (
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5F906] text-zinc-950">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span id={descriptionId} className="mt-1 block text-[11px] font-semibold leading-snug text-white/70">
                  {templateCopy.audience}
                </span>
                <span className="mt-1 hidden text-[11px] leading-snug text-white/65 min-[900px]:block xl:hidden">
                  {templateCopy.summary}
                </span>
                {active && <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-[#F5F906]">{labels.selected}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};
