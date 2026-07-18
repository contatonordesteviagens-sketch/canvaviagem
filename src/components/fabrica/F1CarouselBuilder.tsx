import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useFabricaContext, type Pacote } from "@/hooks/useFabricaContext";

type CarouselFormat = "portrait" | "story";
type CarouselTemplate = "impact" | "itinerary" | "editorial";
type CarouselSlideKind = "cover" | "value" | "list" | "logistics" | "cta" | "custom";

interface CarouselSlide {
  id: string;
  kind: CarouselSlideKind;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  price: string;
  cta: string;
  imageUrl: string;
  focalY: number;
}

interface F1CarouselBuilderProps {
  sourceImage?: string;
  locale?: "pt" | "es";
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `slide_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const compact = (values: Array<string | undefined>) =>
  values.map((value) => (value || "").trim()).filter(Boolean);

const packageImage = (pacote?: Pacote, sourceImage?: string) =>
  sourceImage ||
  pacote?.imageUrl ||
  pacote?.galleryImages?.find(Boolean) ||
  "";

function createSlides(pacote: Pacote, imageUrl: string, isEs: boolean): CarouselSlide[] {
  const slides: CarouselSlide[] = [];
  const add = (slide: Omit<CarouselSlide, "id" | "focalY">) =>
    slides.push({ ...slide, id: createId(), focalY: 50 });

  add({
    kind: "cover",
    eyebrow: pacote.badge || (isEs ? "Viaje con planificación" : "Viaje com planejamento"),
    title: pacote.title,
    body: pacote.subtitle || pacote.description,
    bullets: [],
    price: pacote.price,
    cta: pacote.ctaLabel || (isEs ? "Solicitar detalles" : "Solicitar detalhes"),
    imageUrl,
  });

  const valueBody = pacote.longDescription || pacote.description;
  if (valueBody) {
    add({
      kind: "value",
      eyebrow: isEs ? "La experiencia" : "A experiência",
      title: isEs ? `Por qué elegir ${pacote.title}` : `Por que escolher ${pacote.title}`,
      body: valueBody,
      bullets: [],
      price: "",
      cta: "",
      imageUrl: pacote.galleryImages?.[1] || imageUrl,
    });
  }

  if (pacote.highlights?.length) {
    add({
      kind: "list",
      eyebrow: isEs ? "Lo mejor del viaje" : "O melhor da viagem",
      title: isEs ? "Puntos destacados" : "Destaques da experiência",
      body: "",
      bullets: pacote.highlights.slice(0, 6),
      price: "",
      cta: "",
      imageUrl: pacote.galleryImages?.[2] || imageUrl,
    });
  }

  if (pacote.included?.length) {
    add({
      kind: "list",
      eyebrow: isEs ? "Todo más claro" : "Tudo mais claro",
      title: isEs ? "Qué incluye" : "O que está incluído",
      body: pacote.notIncluded?.length
        ? isEs
          ? "Consulta también lo que no está incluido antes de reservar."
          : "Consulte também o que não está incluído antes de reservar."
        : "",
      bullets: pacote.included.slice(0, 6),
      price: "",
      cta: "",
      imageUrl: pacote.galleryImages?.[3] || imageUrl,
    });
  }

  if (pacote.itinerary?.length) {
    add({
      kind: "list",
      eyebrow: isEs ? "Paso a paso" : "Passo a passo",
      title: isEs ? "Cómo será el viaje" : "Como será a viagem",
      body: "",
      bullets: pacote.itinerary.slice(0, 6),
      price: "",
      cta: "",
      imageUrl: pacote.galleryImages?.[4] || imageUrl,
    });
  }

  const logistics = compact([
    pacote.travelDates && `${isEs ? "Fechas" : "Datas"}: ${pacote.travelDates}`,
    pacote.duration && `${isEs ? "Duración" : "Duração"}: ${pacote.duration}`,
    pacote.departureLocation && `${isEs ? "Salida" : "Saída"}: ${pacote.departureLocation}`,
    pacote.meetingPoint && `${isEs ? "Encuentro" : "Encontro"}: ${pacote.meetingPoint}`,
    pacote.accommodation && `${isEs ? "Alojamiento" : "Hospedagem"}: ${pacote.accommodation}`,
  ]);
  if (logistics.length) {
    add({
      kind: "logistics",
      eyebrow: isEs ? "Información práctica" : "Informações práticas",
      title: isEs ? "Planifica con tranquilidad" : "Planeje com tranquilidade",
      body: pacote.importantNotes || "",
      bullets: logistics.slice(0, 6),
      price: "",
      cta: "",
      imageUrl: pacote.galleryImages?.[5] || imageUrl,
    });
  }

  const middle = slides.slice(1, 6);
  const finalSlides = [slides[0], ...middle];
  if (finalSlides.length < 2) {
    finalSlides.push({
      id: createId(),
      kind: "value",
      eyebrow: isEs ? "Conoce el paquete" : "Conheça o pacote",
      title: pacote.title,
      body: pacote.description,
      bullets: [],
      price: "",
      cta: "",
      imageUrl,
      focalY: 50,
    });
  }

  finalSlides.push({
    id: createId(),
    kind: "cta",
    eyebrow: pacote.availability
      ? (isEs ? "Disponibilidad informada" : "Disponibilidade informada")
      : (isEs ? "Habla con la agencia" : "Fale com a agência"),
    title: isEs ? "¿Listo para recibir todos los detalles?" : "Pronto para receber todos os detalhes?",
    body: compact([pacote.priceDetails, pacote.paymentTerms]).join("\n"),
    bullets: [],
    price: pacote.price,
    cta: pacote.ctaLabel || (isEs ? "Reservar este paquete" : "Reservar este pacote"),
    imageUrl,
    focalY: 50,
  });

  return finalSlides.slice(0, 7);
}

function readableText(hex: string) {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return "#F8FAFC";
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(normalized.slice(index, index + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#111318" : "#F8FAFC";
}

function slideHasOverflowRisk(slide: CarouselSlide) {
  return slide.title.length > 74 || slide.body.length > 240 || slide.bullets.some((item) => item.length > 72);
}

function CarouselCanvas({
  slide,
  index,
  total,
  format,
  template,
  agencyName,
  logo,
  primary,
  secondary,
  background,
  canvasRef,
  exportMode = false,
}: {
  slide: CarouselSlide;
  index: number;
  total: number;
  format: CarouselFormat;
  template: CarouselTemplate;
  agencyName: string;
  logo: string;
  primary: string;
  secondary: string;
  background: string;
  canvasRef?: (node: HTMLDivElement | null) => void;
  exportMode?: boolean;
}) {
  const dimensions = format === "story"
    ? { width: exportMode ? 360 : "100%", aspectRatio: "9 / 16" }
    : { width: exportMode ? 432 : "100%", aspectRatio: "4 / 5" };
  const onPrimary = readableText(primary);
  const onBackground = readableText(background);
  const fullImage = template === "impact";
  const contentColor = template === "editorial" ? onBackground : onPrimary;
  const safePadding = format === "story" ? "13% 8% 18%" : "8%";

  return (
    <div
      ref={canvasRef}
      data-carousel-canvas
      style={{
        width: dimensions.width,
        aspectRatio: dimensions.aspectRatio,
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        background: template === "editorial" ? background : primary,
        color: contentColor,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {slide.imageUrl && (
        <img
          src={slide.imageUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            inset: template === "editorial" ? "5% 5% auto" : 0,
            width: template === "editorial" ? "90%" : "100%",
            height: template === "editorial" ? "42%" : "100%",
            objectFit: "cover",
            objectPosition: `center ${slide.focalY}%`,
            borderRadius: template === "editorial" ? "18px" : 0,
            zIndex: -2,
          }}
        />
      )}
      {fullImage && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -1,
            background: slide.imageUrl ? "rgba(8,10,14,.58)" : primary,
          }}
        />
      )}
      {template === "itinerary" && (
        <div
          style={{
            position: "absolute",
            right: "-18%",
            top: "-8%",
            width: "62%",
            aspectRatio: "1",
            borderRadius: "999px",
            background: secondary,
            opacity: 0.24,
            zIndex: -1,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: safePadding,
          display: "flex",
          flexDirection: "column",
          justifyContent: template === "editorial" ? "flex-end" : "space-between",
          gap: "5%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: template === "editorial" ? "2%" : 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            {logo && (
              <img
                src={logo}
                alt=""
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  objectFit: "contain",
                  background: "rgba(248,250,252,.92)",
                  padding: 3,
                }}
              />
            )}
            <strong
              style={{
                fontSize: 12,
                letterSpacing: ".02em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "70%",
              }}
            >
              {agencyName || "Agência de Viagens"}
            </strong>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, opacity: 0.72 }}>
            {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
        </div>

        <div style={{ marginTop: template === "editorial" ? "48%" : "auto" }}>
          {slide.eyebrow && (
            <div
              style={{
                display: "inline-flex",
                maxWidth: "100%",
                padding: "6px 10px",
                borderRadius: 999,
                background: secondary,
                color: readableText(secondary),
                fontSize: 10,
                lineHeight: 1.2,
                fontWeight: 900,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              {slide.eyebrow}
            </div>
          )}
          <h3
            style={{
              margin: 0,
              maxWidth: "96%",
              fontSize: format === "story" ? 30 : 34,
              lineHeight: 1.02,
              letterSpacing: "-.045em",
              fontWeight: 900,
              overflowWrap: "anywhere",
            }}
          >
            {slide.title}
          </h3>
          {slide.body && (
            <p
              style={{
                margin: "14px 0 0",
                whiteSpace: "pre-line",
                fontSize: format === "story" ? 14 : 15,
                lineHeight: 1.45,
                fontWeight: 550,
                opacity: 0.86,
              }}
            >
              {slide.body}
            </p>
          )}
          {slide.bullets.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "16px 0 0",
                display: "grid",
                gap: 8,
              }}
            >
              {slide.bullets.slice(0, 6).map((item, bulletIndex) => (
                <li
                  key={`${slide.id}-bullet-${bulletIndex}`}
                  style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 8, fontSize: 13, lineHeight: 1.3 }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 999,
                      background: secondary,
                      color: readableText(secondary),
                      fontSize: 10,
                      fontWeight: 900,
                    }}
                  >
                    {bulletIndex + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          {(slide.price || slide.cta) && (
            <div style={{ marginTop: 18, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
              {slide.price && (
                <div>
                  <span style={{ display: "block", fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", opacity: 0.68 }}>
                    Investimento
                  </span>
                  <strong style={{ display: "block", marginTop: 3, fontSize: 22, lineHeight: 1.1 }}>{slide.price}</strong>
                </div>
              )}
              {slide.cta && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 40,
                    padding: "9px 13px",
                    borderRadius: 12,
                    background: secondary,
                    color: readableText(secondary),
                    fontSize: 11,
                    fontWeight: 900,
                    textAlign: "center",
                  }}
                >
                  {slide.cta}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function F1CarouselBuilder({ sourceImage = "", locale = "pt" }: F1CarouselBuilderProps) {
  const { state, update } = useFabricaContext();
  const isEs = locale === "es";
  const packages = state.selectedPackages.filter((pacote) => !pacote.isDraft);
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || "");
  const selectedPackage = packages.find((pacote) => pacote.id === selectedPackageId) || packages[0];
  const [format, setFormat] = useState<CarouselFormat>("portrait");
  const [template, setTemplate] = useState<CarouselTemplate>("impact");
  const [slides, setSlides] = useState<CarouselSlide[]>(() =>
    selectedPackage ? createSlides(selectedPackage, packageImage(selectedPackage, sourceImage), isEs) : [],
  );
  const [activeSlideId, setActiveSlideId] = useState(slides[0]?.id || "");
  const [downloading, setDownloading] = useState(false);
  const exportRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeIndex = Math.max(0, slides.findIndex((slide) => slide.id === activeSlideId));
  const activeSlide = slides[activeIndex];

  const storageKey = useMemo(
    () => `fabrica-carousel-beta:${locale}:${state.projectId || "local"}:${selectedPackageId || "none"}`,
    [locale, selectedPackageId, state.projectId],
  );

  useEffect(() => {
    if (!selectedPackage) {
      setSlides([]);
      setActiveSlideId("");
      return;
    }
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          format?: CarouselFormat;
          template?: CarouselTemplate;
          slides?: CarouselSlide[];
        };
        const restoredSlides = (parsed.slides || []).map((slide) => ({
          ...slide,
          imageUrl: slide.imageUrl || packageImage(selectedPackage, sourceImage),
        }));
        if (restoredSlides.length) {
          setFormat(parsed.format || "portrait");
          setTemplate(parsed.template || "impact");
          setSlides(restoredSlides);
          setActiveSlideId(restoredSlides[0].id);
          return;
        }
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
    const nextSlides = createSlides(selectedPackage, packageImage(selectedPackage, sourceImage), isEs);
    setSlides(nextSlides);
    setActiveSlideId(nextSlides[0]?.id || "");
  }, [isEs, selectedPackage, sourceImage, storageKey]);

  useEffect(() => {
    if (!slides.length) return;
    const safeSlides = slides.map((slide) => ({
      ...slide,
      imageUrl: slide.imageUrl.startsWith("data:") ? "" : slide.imageUrl,
    }));
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ format, template, slides: safeSlides }));
      } catch {
        toast.error(isEs ? "No fue posible guardar el borrador en este navegador." : "Não foi possível salvar o rascunho neste navegador.");
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [format, isEs, slides, storageKey, template]);

  const patchSlide = (patch: Partial<CarouselSlide>) => {
    if (!activeSlide) return;
    setSlides((current) => current.map((slide) => (slide.id === activeSlide.id ? { ...slide, ...patch } : slide)));
  };

  const regenerate = () => {
    if (!selectedPackage) return;
    const nextSlides = createSlides(selectedPackage, packageImage(selectedPackage, sourceImage), isEs);
    setSlides(nextSlides);
    setActiveSlideId(nextSlides[0]?.id || "");
    toast.success(isEs ? "Carrusel actualizado con los datos del paquete." : "Carrossel atualizado com os dados do pacote.");
  };

  const addSlide = () => {
    const slide: CarouselSlide = {
      id: createId(),
      kind: "custom",
      eyebrow: isEs ? "Nuevo contenido" : "Novo conteúdo",
      title: isEs ? "Escribe el título" : "Escreva o título",
      body: "",
      bullets: [],
      price: "",
      cta: "",
      imageUrl: packageImage(selectedPackage, sourceImage),
      focalY: 50,
    };
    setSlides((current) => [...current, slide].slice(0, 10));
    setActiveSlideId(slide.id);
  };

  const duplicateSlide = () => {
    if (!activeSlide || slides.length >= 10) return;
    const copy = { ...activeSlide, id: createId() };
    setSlides((current) => {
      const index = current.findIndex((slide) => slide.id === activeSlide.id);
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    });
    setActiveSlideId(copy.id);
  };

  const removeSlide = () => {
    if (!activeSlide || slides.length <= 3) {
      toast.error(isEs ? "Mantén al menos 3 diapositivas." : "Mantenha pelo menos 3 slides.");
      return;
    }
    const next = slides.filter((slide) => slide.id !== activeSlide.id);
    setSlides(next);
    setActiveSlideId(next[Math.min(activeIndex, next.length - 1)]?.id || "");
  };

  const moveSlide = (direction: -1 | 1) => {
    const target = activeIndex + direction;
    if (target < 0 || target >= slides.length) return;
    setSlides((current) => {
      const next = [...current];
      [next[activeIndex], next[target]] = [next[target], next[activeIndex]];
      return next;
    });
  };

  const downloadAll = async () => {
    if (!slides.length) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      for (let index = 0; index < slides.length; index += 1) {
        const node = exportRefs.current[index];
        if (!node) continue;
        const scale = format === "story" ? 3 : 2.5;
        const canvas = await html2canvas(node, {
          backgroundColor: null,
          useCORS: true,
          allowTaint: false,
          scale,
          logging: false,
        });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png", 1);
        link.download = `carrossel-${(selectedPackage?.slug || selectedPackage?.title || "pacote")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}-${String(index + 1).padStart(2, "0")}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        await new Promise((resolve) => window.setTimeout(resolve, 120));
      }
      toast.success(isEs ? "Carrusel exportado en PNG." : "Carrossel exportado em PNG.");
    } catch {
      toast.error(
        isEs
          ? "No fue posible exportar. Usa una imagen del banco o una imagen cargada."
          : "Não foi possível exportar. Use uma imagem do banco ou uma imagem enviada.",
      );
    } finally {
      setDownloading(false);
    }
  };

  if (!selectedPackage) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#0F0F11] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#F5F906]">
          {isEs ? "Carrusel F1" : "Carrossel F1"}
        </p>
        <h2 className="mt-3 text-xl font-bold text-white">
          {isEs ? "Primero agrega un paquete" : "Primeiro adicione um pacote"}
        </h2>
        <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-white/55">
          {isEs
            ? "El carrusel usa el mismo paquete del Panel, Plan y Sitio. Así, precio, fechas e inclusiones no quedan duplicados."
            : "O carrossel usa o mesmo pacote do Painel, Plano e Site. Assim, preço, datas e inclusões não ficam duplicados."}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5" data-testid="f1-carousel-builder">
      <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#F5F906]">
              {isEs ? "Fuente única: paquete" : "Fonte única: pacote"}
            </p>
            <h2 className="mt-2 text-lg font-bold text-white">
              {isEs ? "Crea una secuencia lista para publicar" : "Crie uma sequência pronta para publicar"}
            </h2>
            <p className="mt-1 max-w-[65ch] text-xs leading-relaxed text-white/50">
              {isEs
                ? "Los campos vacíos se omiten. Ningún precio, fecha, inclusión o disponibilidad se inventa."
                : "Campos vazios são omitidos. Nenhum preço, data, inclusão ou disponibilidade é inventado."}
            </p>
          </div>
          <button
            type="button"
            onClick={downloadAll}
            disabled={downloading}
            className="min-h-11 rounded-xl bg-[#F5F906] px-4 text-sm font-extrabold text-zinc-950 transition-transform active:scale-[0.98] disabled:cursor-wait disabled:opacity-50"
          >
            {downloading
              ? (isEs ? "Exportando..." : "Exportando...")
              : (isEs ? `Descargar ${slides.length} PNG` : `Baixar ${slides.length} PNG`)}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-4">
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
              {isEs ? "Paquete sincronizado" : "Pacote sincronizado"}
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <select
                value={selectedPackage.id}
                onChange={(event) => setSelectedPackageId(event.target.value)}
                className="min-h-11 flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-[#F5F906]"
              >
                {packages.map((pacote) => (
                  <option key={pacote.id} value={pacote.id}>{pacote.title}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={regenerate}
                className="min-h-11 rounded-xl border border-white/15 px-4 text-xs font-bold text-white/75 hover:bg-white/[0.05] active:scale-[0.98]"
              >
                {isEs ? "Actualizar contenido" : "Atualizar conteúdo"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <fieldset>
                <legend className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                  {isEs ? "Formato" : "Formato"}
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {([
                    ["portrait", isEs ? "Feed 4:5" : "Feed 4:5"],
                    ["story", isEs ? "Historia 9:16" : "Story 9:16"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={format === value}
                      onClick={() => setFormat(value)}
                      className={`min-h-11 rounded-xl border px-3 text-xs font-bold ${
                        format === value
                          ? "border-[#F5F906] bg-[#F5F906] text-zinc-950"
                          : "border-white/10 text-white/60 hover:bg-white/[0.05]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                  {isEs ? "Modelo visual" : "Modelo visual"}
                </legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {([
                    ["impact", isEs ? "Impacto" : "Impacto"],
                    ["itinerary", isEs ? "Ruta" : "Roteiro"],
                    ["editorial", isEs ? "Editorial" : "Editorial"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={template === value}
                      onClick={() => setTemplate(value)}
                      className={`min-h-11 rounded-xl border px-2 text-[11px] font-bold ${
                        template === value
                          ? "border-[#F5F906] text-[#F5F906]"
                          : "border-white/10 text-white/55 hover:bg-white/[0.05]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {([
                ["primaryColor", isEs ? "Principal" : "Principal", state.primaryColor],
                ["secondaryColor", isEs ? "Secundaria" : "Secundária", state.secondaryColor],
                ["backgroundColor", isEs ? "Fondo" : "Fundo", state.backgroundColor || "#F4F6F9"],
              ] as const).map(([key, label, value]) => (
                <label key={key} className="rounded-xl border border-white/10 bg-white/[0.025] p-2">
                  <span className="block text-[9px] font-bold uppercase tracking-wide text-white/40">{label}</span>
                  <span className="mt-2 flex items-center gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(event) => update({ [key]: event.target.value })}
                      className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
                    />
                    <span className="truncate text-[10px] font-mono text-white/55">{value.toUpperCase()}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">{isEs ? "Secuencia" : "Sequência"}</h3>
                <p className="mt-0.5 text-[10px] text-white/40">
                  {isEs ? "Selecciona, ordena o agrega hasta 10." : "Selecione, ordene ou adicione até 10."}
                </p>
              </div>
              <button
                type="button"
                onClick={addSlide}
                disabled={slides.length >= 10}
                className="min-h-11 rounded-xl border border-white/15 px-3 text-xs font-bold text-white/70 hover:bg-white/[0.05] disabled:opacity-40"
              >
                {isEs ? "Agregar" : "Adicionar"}
              </button>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlideId(slide.id)}
                  aria-pressed={slide.id === activeSlide?.id}
                  className={`min-h-11 min-w-[132px] rounded-xl border px-3 py-2 text-left ${
                    slide.id === activeSlide?.id
                      ? "border-[#F5F906] bg-[#F5F906]/10"
                      : "border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="block text-[9px] font-bold uppercase tracking-wide text-white/35">
                    {isEs ? "Diapositiva" : "Slide"} {index + 1}
                  </span>
                  <span className="mt-1 block truncate text-xs font-semibold text-white/75">{slide.title}</span>
                </button>
              ))}
            </div>
          </div>

          {activeSlide && (
            <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white">
                  {isEs ? `Editar diapositiva ${activeIndex + 1}` : `Editar slide ${activeIndex + 1}`}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => moveSlide(-1)} disabled={activeIndex === 0} className="min-h-11 rounded-lg border border-white/10 px-3 text-xs text-white/65 disabled:opacity-30">
                    {isEs ? "Anterior" : "Anterior"}
                  </button>
                  <button type="button" onClick={() => moveSlide(1)} disabled={activeIndex === slides.length - 1} className="min-h-11 rounded-lg border border-white/10 px-3 text-xs text-white/65 disabled:opacity-30">
                    {isEs ? "Siguiente" : "Próximo"}
                  </button>
                  <button type="button" onClick={duplicateSlide} disabled={slides.length >= 10} className="min-h-11 rounded-lg border border-white/10 px-3 text-xs text-white/65 disabled:opacity-30">
                    {isEs ? "Duplicar" : "Duplicar"}
                  </button>
                  <button type="button" onClick={removeSlide} className="min-h-11 rounded-lg border border-red-400/25 px-3 text-xs text-red-200">
                    {isEs ? "Eliminar" : "Remover"}
                  </button>
                </div>
              </div>

              {slideHasOverflowRisk(activeSlide) && (
                <p className="mt-3 rounded-lg border border-amber-300/25 bg-amber-300/[0.08] px-3 py-2 text-[11px] text-amber-100/80">
                  {isEs
                    ? "Este texto puede quedar pequeño. Reduce el título, el texto o los elementos."
                    : "Este texto pode ficar pequeno. Reduza o título, o texto ou os itens."}
                </p>
              )}

              <div className="mt-4 grid grid-cols-1 gap-3">
                <CarouselField label={isEs ? "Etiqueta" : "Selo"}>
                  <input value={activeSlide.eyebrow} maxLength={42} onChange={(event) => patchSlide({ eyebrow: event.target.value })} className="f1-carousel-input" />
                </CarouselField>
                <CarouselField label={isEs ? "Título" : "Título"}>
                  <textarea value={activeSlide.title} maxLength={92} rows={2} onChange={(event) => patchSlide({ title: event.target.value })} className="f1-carousel-input resize-none" />
                </CarouselField>
                <CarouselField label={isEs ? "Texto" : "Texto"}>
                  <textarea value={activeSlide.body} maxLength={320} rows={4} onChange={(event) => patchSlide({ body: event.target.value })} className="f1-carousel-input resize-y" />
                </CarouselField>
                <CarouselField label={isEs ? "Elementos, uno por línea" : "Itens, um por linha"}>
                  <textarea
                    value={activeSlide.bullets.join("\n")}
                    rows={5}
                    onChange={(event) => patchSlide({ bullets: event.target.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 6) })}
                    className="f1-carousel-input resize-y"
                  />
                </CarouselField>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <CarouselField label={isEs ? "Precio" : "Preço"}>
                    <input value={activeSlide.price} maxLength={48} onChange={(event) => patchSlide({ price: event.target.value })} className="f1-carousel-input" />
                  </CarouselField>
                  <CarouselField label={isEs ? "Llamada a la acción" : "Chamada para ação"}>
                    <input value={activeSlide.cta} maxLength={52} onChange={(event) => patchSlide({ cta: event.target.value })} className="f1-carousel-input" />
                  </CarouselField>
                </div>
                <CarouselField label={isEs ? "Enlace de la imagen" : "Link da imagem"}>
                  <input value={activeSlide.imageUrl} onChange={(event) => patchSlide({ imageUrl: event.target.value })} placeholder="https://..." className="f1-carousel-input" />
                </CarouselField>
                <CarouselField label={isEs ? "Posición vertical de la foto" : "Posição vertical da foto"}>
                  <input type="range" min="0" max="100" value={activeSlide.focalY} onChange={(event) => patchSlide({ focalY: Number(event.target.value) })} className="w-full accent-[#F5F906]" />
                </CarouselField>
              </div>
            </div>
          )}
        </div>

        <aside className="xl:sticky xl:top-5 xl:self-start">
          <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                  {isEs ? "Vista previa" : "Prévia"}
                </p>
                <p className="mt-1 text-xs text-white/55">
                  {format === "story" ? "1080 × 1920" : "1080 × 1350"}
                </p>
              </div>
              <span className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-bold text-white/45">
                {activeIndex + 1}/{slides.length}
              </span>
            </div>
            <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
              {activeSlide && (
                <CarouselCanvas
                  slide={activeSlide}
                  index={activeIndex}
                  total={slides.length}
                  format={format}
                  template={template}
                  agencyName={state.agencyName}
                  logo={state.logoBase64}
                  primary={state.primaryColor}
                  secondary={state.secondaryColor}
                  background={state.backgroundColor || "#F4F6F9"}
                />
              )}
            </div>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-white/35">
              {isEs
                ? "Borrador guardado en este navegador. Las imágenes se renderizan solo al exportar."
                : "Rascunho salvo neste navegador. As imagens só são renderizadas na exportação."}
            </p>
          </div>
        </aside>
      </div>

      <div
        aria-hidden="true"
        style={{ position: "fixed", left: "-12000px", top: 0, pointerEvents: "none" }}
      >
        {slides.map((slide, index) => (
          <CarouselCanvas
            key={`export-${slide.id}`}
            slide={slide}
            index={index}
            total={slides.length}
            format={format}
            template={template}
            agencyName={state.agencyName}
            logo={state.logoBase64}
            primary={state.primaryColor}
            secondary={state.secondaryColor}
            background={state.backgroundColor || "#F4F6F9"}
            canvasRef={(node) => { exportRefs.current[index] = node; }}
            exportMode
          />
        ))}
      </div>

      <style>{`
        .f1-carousel-input {
          min-height: 44px;
          width: 100%;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 12px;
          background: rgba(255,255,255,.035);
          padding: 10px 12px;
          color: rgba(255,255,255,.9);
          font-size: 14px;
          outline: none;
        }
        .f1-carousel-input:focus {
          border-color: #F5F906;
          box-shadow: 0 0 0 2px rgba(245,249,6,.12);
        }
      `}</style>
    </section>
  );
}

function CarouselField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">{label}</span>
      {children}
    </label>
  );
}
