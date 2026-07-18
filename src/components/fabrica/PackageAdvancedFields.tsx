import { ChevronDown, Trash2 } from "lucide-react";
import type { AgencyType, Pacote } from "@/hooks/useFabricaContext";
import {
  PACKAGE_AVAILABILITY_OPTIONS,
  PACKAGE_SEGMENT_OPTIONS,
  buildPackageSlug,
  getPackageGuidance,
  linesToList,
  suggestPackageSegment,
} from "@/lib/package-details";

type Locale = "pt" | "es";

interface PackageAdvancedFieldsProps {
  pacote: Pacote;
  agencyType: AgencyType;
  onChange: (patch: Partial<Pacote>) => void;
  locale?: Locale;
  defaultOpen?: boolean;
}

type PackageListKey =
  | "highlights"
  | "included"
  | "notIncluded"
  | "itinerary"
  | "requirements"
  | "documents"
  | "accessibility";

function hasAdvancedPackageDetails(pacote: Pacote): boolean {
  return Boolean(
    pacote.badge ||
      pacote.subtitle ||
      pacote.longDescription ||
      pacote.travelDates ||
      pacote.duration ||
      pacote.departureLocation ||
      pacote.meetingPoint ||
      pacote.accommodation ||
      pacote.priceDetails ||
      pacote.paymentTerms ||
      pacote.availability ||
      pacote.highlights?.length ||
      pacote.included?.length ||
      pacote.notIncluded?.length ||
      pacote.itinerary?.length ||
      pacote.requirements?.length ||
      pacote.documents?.length ||
      pacote.accessibility?.length ||
      pacote.cancellationPolicy ||
      pacote.importantNotes ||
      pacote.faq?.length,
  );
}

export function PackageAdvancedFields({
  pacote,
  agencyType,
  onChange,
  locale = "pt",
  defaultOpen = false,
}: PackageAdvancedFieldsProps) {
  const isEs = locale === "es";
  const effectiveSegment = pacote.segment || suggestPackageSegment(agencyType);
  const guidance = getPackageGuidance(effectiveSegment);
  const hasDetails = hasAdvancedPackageDetails(pacote);

  const updateList = (key: PackageListKey, value: string) => {
    onChange({ [key]: linesToList(value) } as Partial<Pacote>);
  };

  const listFields: Array<{
    label: string;
    key: PackageListKey;
    value: string[];
    placeholder: string;
  }> = [
    {
      label: isEs ? "Puntos destacados" : "Destaques",
      key: "highlights",
      value: pacote.highlights || [],
      placeholder: guidance.highlights,
    },
    {
      label: isEs ? "Qué incluye" : "O que inclui",
      key: "included",
      value: pacote.included || [],
      placeholder: guidance.included,
    },
    {
      label: isEs ? "Qué no incluye" : "O que não inclui",
      key: "notIncluded",
      value: pacote.notIncluded || [],
      placeholder: isEs ? "Un ítem por línea\nBebidas\nGastos personales" : "Um item por linha\nBebidas\nDespesas pessoais",
    },
    {
      label: isEs ? "Itinerario resumido" : "Roteiro resumido",
      key: "itinerary",
      value: pacote.itinerary || [],
      placeholder: guidance.itinerary,
    },
    {
      label: isEs ? "Requisitos y qué llevar" : "Requisitos e o que levar",
      key: "requirements",
      value: pacote.requirements || [],
      placeholder: guidance.requirements,
    },
    {
      label: isEs ? "Documentos necesarios" : "Documentos necessários",
      key: "documents",
      value: pacote.documents || [],
      placeholder: guidance.documents,
    },
    {
      label: isEs ? "Recursos de accesibilidad" : "Recursos de acessibilidade",
      key: "accessibility",
      value: pacote.accessibility || [],
      placeholder: isEs
        ? "Un recurso por línea\nTransporte adaptado: por confirmar\nAcceso sin escalones"
        : "Um recurso por linha\nTransporte adaptado: a confirmar\nAcesso sem degraus",
    },
  ];

  return (
    <details
      className="group rounded-xl border border-white/10 bg-white/[0.025] open:bg-black/20"
      open={defaultOpen || undefined}
    >
      <summary
        data-testid={`package-advanced-toggle-${pacote.id}`}
        className="flex min-h-11 w-full cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 [&::-webkit-details-marker]:hidden"
      >
        <span>
          {hasDetails
            ? isEs
              ? "Editar más información"
              : "Editar mais informações"
            : isEs
              ? "Agregar más información"
              : "Adicionar mais informações"}
          <span className="mt-0.5 block text-[10px] font-normal text-white/40">
            {isEs
              ? "Opcional · aparece en el detalle del paquete, sitio y futuros carruseles"
              : "Opcional · aparece no detalhe do pacote, site e futuros carrosséis"}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform group-open:rotate-180" />
      </summary>

      <div className="space-y-5 rounded-xl border border-white/10 bg-black/25 p-3 sm:p-4">
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2.5 text-[11px] leading-relaxed text-amber-100/75">
          {isEs
            ? "Los campos vacíos no aparecen en el sitio. El formulario y el CRM permanecen sin cambios."
            : "Campos vazios não aparecem no site. O formulário e o CRM permanecem sem alterações."}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={isEs ? "Tipo de experiencia" : "Tipo de experiência"}>
            <select
              value={effectiveSegment}
              onChange={(event) => onChange({ segment: event.target.value as Pacote["segment"] })}
              className="min-h-11 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-base text-white outline-none focus:border-white/40 sm:text-sm"
            >
              {PACKAGE_SEGMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={isEs ? "Disponibilidad" : "Disponibilidade"}>
            <select
              value={pacote.availability || ""}
              onChange={(event) =>
                onChange({ availability: (event.target.value || undefined) as Pacote["availability"] })
              }
              className="min-h-11 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-base text-white outline-none focus:border-white/40 sm:text-sm"
            >
              <option value="">{isEs ? "No informar" : "Não informar"}</option>
              {PACKAGE_AVAILABILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label={isEs ? "Sello del paquete" : "Selo do pacote"}
            value={pacote.badge || ""}
            onChange={(value) => onChange({ badge: value })}
            placeholder={isEs ? "Ej.: Oferta, Grupo, Playa" : "Ex.: Oferta, Grupo, Praia"}
            maxLength={32}
          />
          <TextField
            label={isEs ? "Texto del botón" : "Texto do botão"}
            value={pacote.ctaLabel || ""}
            onChange={(value) => onChange({ ctaLabel: value })}
            placeholder={isEs ? "Reservar este paquete" : "Reservar este pacote"}
            maxLength={48}
          />
        </div>

        <TextField
          label={isEs ? "Subtítulo" : "Subtítulo"}
          value={pacote.subtitle || ""}
          onChange={(value) => onChange({ subtitle: value })}
          placeholder={
            isEs
              ? "Ej.: La experiencia más completa para conocer el destino"
              : "Ex.: A experiência mais completa para conhecer o destino"
          }
        />

        <TextAreaField
          label={isEs ? "Descripción completa" : "Descrição completa"}
          value={pacote.longDescription || ""}
          onChange={(value) => onChange({ longDescription: value })}
          placeholder={guidance.description}
          rows={5}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            [isEs ? "Fechas o frecuencia" : "Datas ou frequência", "travelDates", pacote.travelDates || "", guidance.dates],
            [isEs ? "Duración" : "Duração", "duration", pacote.duration || "", guidance.duration],
            [isEs ? "Origen / embarque" : "Origem / embarque", "departureLocation", pacote.departureLocation || "", guidance.departure],
            [isEs ? "Encuentro / recogida" : "Encontro / retirada", "meetingPoint", pacote.meetingPoint || "", guidance.meetingPoint],
            [isEs ? "Alojamiento / cabina" : "Hospedagem / cabine", "accommodation", pacote.accommodation || "", guidance.accommodation],
            [isEs ? "Cómo se calcula el precio" : "Como o preço é calculado", "priceDetails", pacote.priceDetails || "", guidance.priceDetails],
            [isEs ? "Forma de pago" : "Pagamento", "paymentTerms", pacote.paymentTerms || "", isEs ? "Ej.: 20% de entrada + 10 cuotas" : "Ex.: Entrada de 20% + 10 parcelas sem juros"],
            [isEs ? "Enlace compartible" : "Link compartilhável", "slug", pacote.slug || buildPackageSlug(pacote.title, pacote.id), "ex.: jericoacoara-5-dias"],
          ].map(([label, key, value, placeholder]) => (
            <TextField
              key={key}
              label={label}
              value={value}
              onChange={(nextValue) =>
                onChange({
                  [key]: key === "slug" ? buildPackageSlug(nextValue, pacote.id) : nextValue,
                } as Partial<Pacote>)
              }
              placeholder={placeholder}
              maxLength={key === "slug" ? 120 : undefined}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {listFields.map((field) => (
            <TextAreaField
              key={field.key}
              label={field.label}
              value={field.value.join("\n")}
              onChange={(value) => updateList(field.key, value)}
              placeholder={field.placeholder}
              rows={4}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <TextAreaField
            label={isEs ? "Política de cancelación" : "Política de cancelamento"}
            value={pacote.cancellationPolicy || ""}
            onChange={(value) => onChange({ cancellationPolicy: value })}
            placeholder={
              isEs
                ? "Ej.: Cancelación gratuita hasta 7 días antes."
                : "Ex.: Cancelamento gratuito até 7 dias antes."
            }
            rows={4}
          />
          <TextAreaField
            label={isEs ? "Información importante" : "Importante saber"}
            value={pacote.importantNotes || ""}
            onChange={(value) => onChange({ importantNotes: value })}
            placeholder={
              isEs
                ? "Ej.: Operación sujeta al clima; confirmación por WhatsApp."
                : "Ex.: Operação sujeita ao clima; confirmação enviada por WhatsApp."
            }
            rows={4}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                {isEs ? "Preguntas de este paquete" : "Perguntas deste pacote"}
              </div>
              <div className="mt-0.5 text-[10px] text-white/35">
                {isEs ? "Si queda vacío, el sitio usa las preguntas generales." : "Se ficar vazio, o site usa as perguntas gerais."}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange({ faq: [...(pacote.faq || []), { question: "", answer: "" }] })}
              className="min-h-11 rounded-lg border border-white/10 px-3 text-xs font-semibold text-white/70 hover:bg-white/[0.05]"
            >
              {isEs ? "+ Agregar pregunta" : "+ Adicionar pergunta"}
            </button>
          </div>
          <div className="space-y-2">
            {(pacote.faq || []).map((item, index) => (
              <div key={`${pacote.id}-faq-${index}`} className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                <div className="flex gap-2">
                  <input
                    value={item.question}
                    onChange={(event) =>
                      onChange({
                        faq: (pacote.faq || []).map((faq, faqIndex) =>
                          faqIndex === index ? { ...faq, question: event.target.value } : faq,
                        ),
                      })
                    }
                    placeholder={isEs ? "Ej.: ¿Puedo cambiar la fecha?" : "Ex.: Posso remarcar a data?"}
                    className="min-h-11 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-base text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
                  />
                  <button
                    type="button"
                    aria-label={isEs ? "Eliminar pregunta" : "Remover pergunta"}
                    onClick={() =>
                      onChange({ faq: (pacote.faq || []).filter((_, faqIndex) => faqIndex !== index) })
                    }
                    className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  value={item.answer}
                  onChange={(event) =>
                    onChange({
                      faq: (pacote.faq || []).map((faq, faqIndex) =>
                        faqIndex === index ? { ...faq, answer: event.target.value } : faq,
                      ),
                    })
                  }
                  placeholder={isEs ? "Escribe una respuesta objetiva." : "Escreva a resposta de forma objetiva."}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-base text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">{label}</span>
      {children}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <Field label={label}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="min-h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-base text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
      />
    </Field>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
}) {
  return (
    <Field label={label}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-base leading-relaxed text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
      />
    </Field>
  );
}
