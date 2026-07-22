import { useState, useRef, useEffect, useId } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFabricaContext, type AgencyType, type Pacote, type Depoimento as Testimonio } from "@/hooks/useFabricaContext";
import { supabase } from "@/integrations/supabase/client";
import { downloadLandingHTML, buildLandingHTML } from "@/lib/fabrica-html-export-es";
import { CloudSaveIndicatorES } from "@/components/fabrica/CloudSaveIndicatorES";
import { BrandPaletteEditor, SectionBackgroundEditor } from "@/components/fabrica/BrandPaletteEditor";
import { SiteTemplateSelector } from "@/components/fabrica/SiteTemplateSelector";
import { useDiagnosticos, type DiagnosticoSalvo } from "@/hooks/useFabricaDiagnosticos";
import { ProjectSwitchDialog } from "@/components/fabrica/ProjectSwitchDialog";
import { getSiteTemplateDefinition } from "@/lib/site-template-catalog";
import { publishFabricaSite } from "@/lib/fabrica-site-publisher";
import {
  Plus,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Palette,
  Rocket,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  ImagePlus,
  Pencil,
  Check,
  X,
  Link as LinkIcon,
  Upload,
   Undo,
  Redo,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import type { SectionVisibility } from "@/hooks/useFabricaContext";
import {
  PACKAGE_AVAILABILITY_OPTIONS,
  PACKAGE_SEGMENT_OPTIONS,
  buildPackageSlug,
  linesToList,
  suggestPackageSegment,
} from "@/lib/package-details";
import {
  buildCanvaSiteSlug as buildSiteSlug,
  extractCanvaSiteSlug,
  normalizeCanvaSiteUrl,
  validateCanvaSiteSlug,
} from "@/lib/canva-site-domain";

const FABRICA_SITE_STORAGE_CONTENT_TYPE = "image/webp";
const UI_ACCENT = "#F5F906";
const UI_ACCENT_SOFT = "rgba(245, 158, 11, 0.12)";
const UI_ACCENT_BORDER = "rgba(245, 158, 11, 0.75)";
const UI_ACCENT_SHADOW = "rgba(245, 158, 11, 0.24)";
const SITE_SECTION_LABELS_ES: Record<string, string> = {
  header: "Encabezado y menú",
  hero: "Portada del sitio",
  processo: "Cómo funciona",
  destinos: "Destinos y paquetes",
  porQue: "Equipo y agencia",
  depoimentos: "Testimonios",
  orcamento: "Presupuesto",
  faq: "Preguntas frecuentes",
  finalCta: "Llamada final",
  mapa: "Mapa y dirección",
  footer: "Pie de página",
};

const PACKAGE_SEGMENT_LABELS_ES: Record<string, string> = {
  passeio: "Paseo / receptivo",
  pacote: "Paquete / emisivo",
  "sob-medida": "Viaje a medida / lujo",
  grupo: "Grupo / excursión",
  cruzeiro: "Crucero",
  aventura: "Aventura / ecoturismo",
  religioso: "Turismo religioso",
  corporativo: "Corporativo / evento",
  outro: "Otro",
};

const PACKAGE_AVAILABILITY_LABELS_ES: Record<string, string> = {
  disponivel: "Disponible",
  "ultimas-vagas": "Últimas plazas",
  "saida-confirmada": "Salida confirmada",
  "sob-consulta": "Bajo consulta",
  "lista-de-espera": "Lista de espera",
  esgotado: "Agotado",
};

const PACKAGE_GUIDANCE_ES = {
  description: "Explica cómo será la experiencia, para quién está indicada y cuál es su principal diferencial.",
  dates: "Ej.: del 15 al 20/11/2026 o salidas diarias",
  duration: "Ej.: 6 días y 5 noches",
  departure: "Ej.: salida desde Fortaleza",
  meetingPoint: "Ej.: recepción del hotel a las 07:30",
  accommodation: "Ej.: hotel 4 estrellas, habitación doble y desayuno",
  priceDetails: "Ej.: valor por persona en habitación doble; tasas incluidas",
  highlights: "Una información por línea\nAtardecer en las dunas\nGuía local especializado",
  included: "Un ítem por línea\nAlojamiento\nTraslados\nDesayuno",
  itinerary: "Una etapa por línea\nDía 1: llegada y recepción\nDía 2: paseo principal",
  requirements: "Un ítem por línea\nEdad mínima de 12 años\nLlevar calzado cerrado",
  documents: "Un ítem por línea\nDocumento oficial con foto\nPasaporte vigente",
};

const optimizeImageBlobToWebp = async (blob: Blob, maxDimension = 1600) => {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("No se pudo preparar la imagen.");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const webpBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!webpBlob) throw new Error("Este navegador no pudo convertir la imagen a WebP.");
  return webpBlob;
};

const hashBlob = async (blob: Blob) => {
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const normalizeExternalImageUrl = (value: string) => {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : "";
  } catch {
    return "";
  }
};
export const Phase4LandingBuilderES = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  const { data: savedProjects } = useDiagnosticos();
  const { state, update, systemUpdate, reset, undo, redo, switchProject, canUndo, canRedo, isHydrated } = useFabricaContext();
  const { user } = useAuth();
  const [previewing, setPreviewing] = useState(true);
  const [downloadCount, setDownloadCount] = useState(0);
  const [autoSyncDone, setAutoSyncDone] = useState(false);
  const [autoSyncFields, setAutoSyncFields] = useState<string[]>([]);
  const [pickingHeroImage, setPickingHeroImage] = useState(false);
  const [pendingProjectSwitch, setPendingProjectSwitch] = useState<DiagnosticoSalvo | null>(null);
  const [isSwitchingProject, setIsSwitchingProject] = useState(false);

  const loadSavedProject = async (project: DiagnosticoSalvo) => {
    const targetName = project.agency_name || "Sin nombre";
    const isRecovered = project.source === "published_recovery";
    setIsSwitchingProject(true);
    try {
      await switchProject(
        { ...project.state_snapshot, projectId: project.id },
        { preserveCurrentPhase: true },
      );
      setPendingProjectSwitch(null);
      if (isRecovered) toast.warning(`Sitio anterior "${targetName}" recuperado. Revisa los datos antes de volver a publicarlo.`);
      else toast.success(`Proyecto "${targetName}" cargado.`);
    } catch {
      toast.error("No se pudo guardar el proyecto actual. El cambio fue cancelado para proteger tus datos.");
    } finally {
      setIsSwitchingProject(false);
    }
  };

  const requestProjectSwitch = (project: DiagnosticoSalvo) => {
    if (project.id === state.projectId) {
      toast.info("Este proyecto ya está abierto.");
      return;
    }
    if (!state.agencyName) {
      void loadSavedProject(project);
      return;
    }
    setPendingProjectSwitch(project);
  };

  // ── ESTADOS Y REF PARA EDICIÓN VISUAL DIRECTA E INTUITIVA EN LA VISTA PREVIA ──
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const packageEditorShortcutRef = useRef<(packageId: string) => void>(() => undefined);
  const [activePackagePreviewId, setActivePackagePreviewId] = useState<string | null>(null);
  const [globalPickingImage, setGlobalPickingImage] = useState(false);
  const [globalEditingPalette, setGlobalEditingPalette] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const removeModeRef = useRef(false);
  const [activeColorSection, setActiveColorSection] = useState<string | null>(null);
  const colorModalCloseRef = useRef<HTMLButtonElement>(null);
  const imageModalCloseRef = useRef<HTMLButtonElement>(null);
  const colorDialogRef = useRef<HTMLElement>(null);
  const imageDialogRef = useRef<HTMLDivElement>(null);
  const modalReturnFocusRef = useRef<HTMLElement | null>(null);
  const [activeImageEdit, setActiveImageEdit] = useState<{
    type: "logo" | "hero" | "package" | "about";
    packageId?: string;
  } | null>(null);

  useEffect(() => {
    removeModeRef.current = removeMode;
  }, [removeMode]);

  useEffect(() => {
    const handlePackagePreviewMessage = (event: MessageEvent) => {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow || event.source !== iframeWindow) return;
      if (event.data?.type === "CV_PACKAGE_CLOSE") {
        setActivePackagePreviewId(null);
      }
    };
    window.addEventListener("message", handlePackagePreviewMessage);
    return () => window.removeEventListener("message", handlePackagePreviewMessage);
  }, []);

  useEffect(() => {
    if (!globalEditingPalette && !globalPickingImage) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalReturnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const frame = window.requestAnimationFrame(() => {
      if (globalPickingImage) imageModalCloseRef.current?.focus();
      else colorModalCloseRef.current?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (globalPickingImage) {
          setGlobalPickingImage(false);
          setActiveImageEdit(null);
        } else {
          setGlobalEditingPalette(false);
          setActiveColorSection(null);
        }
        return;
      }
      if (event.key !== "Tab") return;

      const activeDialog = globalPickingImage ? imageDialogRef.current : colorDialogRef.current;
      if (!activeDialog) return;
      const focusable = Array.from(activeDialog.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        activeDialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !activeDialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !activeDialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => modalReturnFocusRef.current?.focus());
    };
  }, [globalEditingPalette, globalPickingImage]);

  const applyGlobalImage = (url: string) => {
    if (!activeImageEdit) return;
    const galleryImages = state.siteContent.galleryImages.includes(url)
      ? state.siteContent.galleryImages
      : [...state.siteContent.galleryImages, url];

    if (activeImageEdit.type === "logo") {
      update({ logoBase64: url, siteContent: { ...state.siteContent, galleryImages } });
      toast.success("¡Logotipo actualizado con éxito!");
    } else if (activeImageEdit.type === "hero") {
      update({ siteContent: { ...state.siteContent, heroImageUrl: url, galleryImages } });
      toast.success("¡Banner principal actualizado con éxito!");
    } else if (activeImageEdit.type === "about") {
      update({ siteContent: { ...state.siteContent, aboutImageUrl: url, galleryImages } });
      toast.success("¡Foto del equipo/empresa actualizada!");
    } else if (activeImageEdit.type === "package" && activeImageEdit.packageId) {
      update({
        selectedPackages: state.selectedPackages.map((pacote) =>
          pacote.id === activeImageEdit.packageId ? { ...pacote, imageUrl: url } : pacote,
        ),
        siteContent: { ...state.siteContent, galleryImages },
      });
      toast.success("¡Foto del paquete actualizada con éxito!");
    }

    setGlobalPickingImage(false);
    setActiveImageEdit(null);
    setActivePackagePreviewId(null);
  };

  const iframeScrollY = useRef(0);

  // Enlace de los eventos de clic en el iframe para edición visual en tiempo real
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.head || !doc.body) return;
      if (doc.body.dataset.fabricaEditorInitialized === "true") return;
      doc.body.dataset.fabricaEditorInitialized = "true";
      doc.documentElement.classList.toggle("fabrica-remove-mode", removeModeRef.current);

      // Restaura o scroll para evitar pulos
      if (iframe.contentWindow) {
        iframe.contentWindow.scrollTo(0, iframeScrollY.current);
        iframe.contentWindow.addEventListener("scroll", () => {
          iframeScrollY.current = iframe.contentWindow?.scrollY || 0;
        });

        // Encaminhar atalhos de teclado (Shift+Ctrl+P) para a janela principal
        iframe.contentWindow.addEventListener("keydown", (e: KeyboardEvent) => {
          if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent("keydown", {
              key: e.key,
              code: e.code,
              ctrlKey: e.ctrlKey,
              shiftKey: e.shiftKey,
              altKey: e.altKey,
              metaKey: e.metaKey,
              bubbles: true
            }));
          }
        });
      }

      // Inyectar estilos de hover, focus e indicador visual de edición
      const style = doc.createElement("style");
      style.innerHTML = `
        [data-visual-editable] {
          position: relative !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        [data-visual-editable]:hover {
          outline: 2px dashed #F5F906 !important;
          outline-offset: 4px !important;
          background-color: rgba(245, 158, 11, 0.08) !important;
        }
        [data-visual-editable]:focus {
          outline: 2px solid #10B981 !important;
          outline-offset: 4px !important;
          background-color: rgba(16, 185, 129, 0.08) !important;
        }
        img[data-visual-editable]:hover {
          filter: brightness(0.8) !important;
        }
        [data-fabrica-color-section] { position: relative !important; }
        .fabrica-color-btn {
          position: absolute !important;
          top: 12px !important;
          right: 12px !important;
          z-index: 10001 !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          padding: 8px 11px !important;
          border: 1px solid rgba(255,255,255,.45) !important;
          border-radius: 999px !important;
          background: rgba(10,10,11,.82) !important;
          color: #fff !important;
          font: 700 11px/1 Inter, sans-serif !important;
          opacity: 0 !important;
          transform: translateY(-3px) !important;
          transition: opacity .18s ease, transform .18s ease !important;
          cursor: pointer !important;
          box-shadow: 0 8px 24px rgba(0,0,0,.24) !important;
        }
        .fabrica-package-edit-btn {
          position: absolute !important;
          top: 12px !important;
          right: 52px !important;
          z-index: 10002 !important;
          min-height: 36px !important;
          padding: 8px 11px !important;
          border: 1px solid rgba(255,255,255,.55) !important;
          border-radius: 999px !important;
          background: rgba(10,10,11,.9) !important;
          color: #fff !important;
          font: 700 11px/1 Inter, sans-serif !important;
          cursor: pointer !important;
          box-shadow: 0 8px 24px rgba(0,0,0,.24) !important;
        }
        .package-sheet > .fabrica-package-edit-btn {
          position: absolute !important;
          top: 18px !important;
          right: 74px !important;
          float: none !important;
          margin: 0 !important;
          width: max-content !important;
        }
        .fabrica-package-preview-btn {
          position: absolute !important;
          top: 12px !important;
          left: 12px !important;
          z-index: 10002 !important;
          min-height: 36px !important;
          padding: 8px 11px !important;
          border: 1px solid rgba(255,255,255,.55) !important;
          border-radius: 999px !important;
          background: rgba(10,10,11,.9) !important;
          color: #fff !important;
          font: 700 11px/1 Inter, sans-serif !important;
          cursor: pointer !important;
          box-shadow: 0 8px 24px rgba(0,0,0,.24) !important;
        }
        [data-fabrica-color-section]:hover > .fabrica-color-btn,
        .fabrica-color-btn:focus { opacity: 1 !important; transform: translateY(0) !important; }
        .fabrica-remove-btn {
          display: none !important;
          top: 4px !important;
          right: 4px !important;
          width: 24px !important;
          height: 24px !important;
          border: 1px solid rgba(255,255,255,.7) !important;
          font-size: 14px !important;
          opacity: .88 !important;
          box-shadow: 0 3px 10px rgba(0,0,0,.28) !important;
        }
        .fabrica-remove-mode .fabrica-remove-selected > .fabrica-remove-btn {
          display: flex !important;
        }
        @media (hover: none) {
          .fabrica-color-btn { opacity: 1 !important; transform: translateY(0) !important; }
        }
      `;
      doc.head.appendChild(style);

      // Fondos editables por sección sin interferir con enlaces ni formularios.
      doc.querySelectorAll("header.site-header, section, footer").forEach((section) => {
        section.setAttribute("data-fabrica-color-section", "true");
        const sectionKey = section.getAttribute("data-site-section") || "site";
        const button = doc.createElement("button");
        button.type = "button";
        button.className = "fabrica-color-btn";
        button.textContent = "Editar fondo";
        button.setAttribute("aria-label", `Editar el fondo de ${SITE_SECTION_LABELS_ES[sectionKey] || "esta sección"}`);
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          setActiveColorSection(sectionKey);
          setGlobalEditingPalette(true);
        });
        section.appendChild(button);

        section.addEventListener("click", (event) => {
          const target = event.target as Element | null;
          if (!target || typeof target.closest !== "function") return;
          const interactive = target.closest(
            'a,button,input,select,textarea,summary,[contenteditable="true"],[data-visual-editable="true"]',
          );
          if (interactive) return;
          setActiveColorSection(sectionKey);
          setGlobalEditingPalette(true);
        });
      });

      const openPackageEditor = (packageId: string, afterSectionOpen = false) => {
        if (!packageId) return;
        const packagesCard = window.document.querySelector('[data-fabrica-card="packages"]');
        const packagesTrigger = packagesCard?.querySelector<HTMLButtonElement>(':scope > button[aria-expanded]');
        if (!afterSectionOpen && packagesTrigger?.getAttribute("aria-expanded") === "false") {
          packagesTrigger.click();
          window.setTimeout(() => openPackageEditor(packageId, true), 80);
          return;
        }
        const editor = window.document.getElementById(`package-editor-${packageId}`);
        if (!editor) {
          toast.error("No fue posible localizar este paquete en el editor.");
          return;
        }
        const advanced = editor.querySelector("details") as HTMLDetailsElement | null;
        if (advanced) advanced.open = true;
        editor.style.scrollMarginTop = "88px";
        editor.scrollIntoView({ behavior: "smooth", block: "start" });
        editor.animate(
          [
            { boxShadow: "0 0 0 0 rgba(245,158,11,0)" },
            { boxShadow: "0 0 0 4px rgba(245,158,11,.7)" },
            { boxShadow: "0 0 0 0 rgba(245,158,11,0)" },
          ],
          { duration: 1200, easing: "ease-out" },
        );
      };
      packageEditorShortcutRef.current = (packageId: string) => openPackageEditor(packageId);

      doc.querySelectorAll(".dest-card").forEach((card) => {
        const packageId = card.getAttribute("data-package-id") || "";
        const packageIndex = Number(card.getAttribute("data-package-index"));
        const previewButton = doc.createElement("button");
        previewButton.type = "button";
        previewButton.className = "fabrica-package-preview-btn";
        previewButton.textContent = "Ver detalles";
        previewButton.setAttribute("aria-label", "Ver los detalles de este paquete");
        previewButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          // En el editor móvil el modal vive dentro del iframe. Alinear la
          // vista antes de abrirlo mantiene cerrar/editar siempre visibles.
          iframeRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
          doc.getElementById("package-modal")?.setAttribute("data-editor-package-id", packageId);
          const iframeWindow = doc.defaultView as (Window & {
            openPackageDetails?: (index: number, trigger?: Element) => void;
          }) | null;
          iframeWindow?.openPackageDetails?.(packageIndex, card);
          setActivePackagePreviewId(packageId);
          window.setTimeout(() => {
            iframeRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
          }, 0);
        });
        const editButton = doc.createElement("button");
        editButton.type = "button";
        editButton.className = "fabrica-package-edit-btn";
        editButton.textContent = "Editar paquete";
        editButton.setAttribute("aria-label", "Editar toda la información de este paquete");
        editButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          setActivePackagePreviewId(null);
          openPackageEditor(packageId);
        });
        card.append(previewButton, editButton);
        card.addEventListener("click", () => {
          doc.getElementById("package-modal")?.setAttribute("data-editor-package-id", packageId);
        });
      });

      const packageSheet = doc.querySelector(".package-sheet");
      if (packageSheet) {
        const editButton = doc.createElement("button");
        editButton.type = "button";
        editButton.className = "fabrica-package-edit-btn";
        editButton.textContent = "Editar información";
        editButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          const modal = doc.getElementById("package-modal");
          const packageId = modal?.getAttribute("data-editor-package-id") || modal?.getAttribute("data-current-package-id") || "";
          const iframeWindow = doc.defaultView as (Window & {
            closePackageDetails?: (restoreFocus?: boolean, syncLocation?: boolean) => void;
          }) | null;
          iframeWindow?.closePackageDetails?.(false, false);
          setActivePackagePreviewId(null);
          openPackageEditor(packageId);
        });
        packageSheet.prepend(editButton);
      }

      const packageModal = doc.getElementById("package-modal");
      packageModal?.querySelector(".package-close")?.addEventListener("click", () => {
        setActivePackagePreviewId(null);
      });
      packageModal?.addEventListener("click", (event) => {
        if (event.target === packageModal) setActivePackagePreviewId(null);
      });

      doc.querySelectorAll(".btn,.nav-cta,.dest-cta,.wpp-float").forEach((button) => {
        button.setAttribute("title", "Haz clic para editar el texto · doble clic para editar los colores");
        button.addEventListener("dblclick", (event) => {
          event.preventDefault();
          event.stopPropagation();
          setActiveColorSection(null);
          setGlobalEditingPalette(true);
        });
      });

      // 1. Textos editables (contenteditable)
      const textSelectors = [
        ".brand-name",
        "[data-site-edit-key]",
        ".hero h1",
        ".hero p.lead",
        ".hero .eyebrow",
        ".foot-brand",
        "footer .foot-grid > div > p",
        ".contact-item span",
        ".dest-card h3",
        ".dest-card p",
        ".price-value",
        ".price-main",
        ".dest-tag",
        ".depo-text",
        ".depo-name",
        "summary",
        ".faq-item p"
      ].join(",");

      const editableTexts = doc.querySelectorAll(textSelectors);
      editableTexts.forEach((el) => {
        if (el.closest("#lead-modal") || el.closest("#package-modal")) return;
        el.setAttribute("data-visual-editable", "true");
        el.setAttribute("contenteditable", "true");
        
        el.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
        });

        el.addEventListener("blur", () => {
          const textVal = (el as HTMLElement).innerText.trim();
          
          if (el.classList.contains("brand-name")) {
            update({ agencyName: textVal });
          } else if (el.getAttribute("data-site-edit-key")) {
            updSite({ [el.getAttribute("data-site-edit-key") as string]: textVal } as any);
          } else if (el.tagName === "H1" && el.closest(".hero")) {
            updSite({ heroHeadline: textVal });
          } else if (el.classList.contains("lead") && el.closest(".hero")) {
            updSite({ heroSubheadline: textVal });
          } else if (el.classList.contains("eyebrow") && el.closest(".hero")) {
            updSite({ heroEyebrow: textVal });
          } else if (el.classList.contains("foot-brand")) {
            update({ agencyName: textVal });
          } else if (el.closest("footer") && el.tagName === "P") {
            updSite({ footerText: textVal });
          } else if (el.closest(".contact-item") && el.tagName === "SPAN") {
            const label = el.closest(".contact-item")?.querySelector("strong")?.textContent?.toLowerCase() || "";
            if (label.includes("whatsapp")) {
              update({ whatsapp: textVal.replace(/\D/g, "") });
            } else if (label.includes("mail")) {
              update({ agencyEmail: textVal });
            } else if (label.includes("ubic") || label.includes("local")) {
              update({ city: textVal });
            } else {
              updSite({ atendimentoText: textVal });
            }
          } else {
            // Si es dentro de un paquete (destination card)
            const destCard = el.closest(".dest-card");
            if (destCard) {
              const pkgId = destCard.getAttribute("data-package-id");
              if (pkgId && state.selectedPackages.some((pkg) => String(pkg.id) === pkgId)) {
                if (el.tagName === "H3") {
                  updPacote(pkgId, { title: textVal });
                } else if (el.tagName === "P") {
                  updPacote(pkgId, { description: textVal });
                } else if (el.classList.contains("price-value") || el.classList.contains("price-main")) {
                  updPacote(pkgId, { price: textVal });
                } else if (el.classList.contains("dest-tag")) {
                  updPacote(pkgId, { badge: textVal });
                }
              }
            }

            // Si es dentro de un testimonio
            const depoCard = el.closest(".depo-card");
            if (depoCard) {
              const idx = Number(depoCard.getAttribute("data-depo-index"));
              if (idx !== -1 && state.depoimentos[idx]) {
                if (el.classList.contains("depo-text")) {
                  updDepo(idx, { text: textVal });
                } else if (el.classList.contains("depo-name")) {
                  updDepo(idx, { name: textVal });
                }
              }
            }
          }
        });
      });

      // 2. Imágenes seleccionables/cambiables
      const imgSelectors = [
        ".brand-logo",
        ".dest-img-wrap img",
        "#package-image",
        ".equipe-img",
        ".hero img"
      ].join(",");

      const editableImgs = doc.querySelectorAll(imgSelectors);
      editableImgs.forEach((el) => {
        el.setAttribute("data-visual-editable", "true");
        el.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (el.classList.contains("brand-logo")) {
            setActiveImageEdit({ type: "logo" });
            setGlobalPickingImage(true);
          } else if (el.classList.contains("equipe-img")) {
            setActiveImageEdit({ type: "about" });
            setGlobalPickingImage(true);
          } else if (el.closest(".hero") || el.classList.contains("hero")) {
            setActiveImageEdit({ type: "hero" });
            setGlobalPickingImage(true);
          } else if (el.id === "package-image") {
            const modal = doc.getElementById("package-modal");
            const packageId =
              modal?.getAttribute("data-editor-package-id") ||
              modal?.getAttribute("data-current-package-id") ||
              "";
            if (packageId) {
              setActiveImageEdit({ type: "package", packageId });
              setGlobalPickingImage(true);
            }
          } else {
            const destCard = el.closest(".dest-card");
            if (destCard) {
              const packageId = destCard.getAttribute("data-package-id");
              if (packageId && state.selectedPackages.some((pkg) => String(pkg.id) === packageId)) {
                setActiveImageEdit({ type: "package", packageId });
                setGlobalPickingImage(true);
              }
            }
          }
        });
      });

      // En el modo de eliminación, captura el clic antes de los editores.
      // Así se puede tocar directamente el contenido sin buscar un espacio vacío.
      doc.addEventListener("click", (event) => {
        if (!doc.documentElement.classList.contains("fabrica-remove-mode")) return;
        const target = event.target as Element | null;
        if (!target?.closest || target.closest(".fabrica-remove-btn")) return;
        const removable = target.closest("[data-visual-removable]");
        if (!removable) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        doc.querySelectorAll(".fabrica-remove-selected").forEach((item) =>
          item.classList.remove("fabrica-remove-selected"),
        );
        removable.classList.add("fabrica-remove-selected");
      }, true);

      // Lógica de elementos removíveis (X button)
      const removables = doc.querySelectorAll("[data-visual-removable]");
      removables.forEach(el => {
        const btn = doc.createElement("button");
        btn.textContent = "×";
        btn.className = "fabrica-remove-btn";
        btn.title = "Ocultar este elemento";
        btn.type = "button";
        btn.setAttribute("aria-label", "Ocultar este elemento");
        btn.style.cssText = "position:absolute; top:4px; right:4px; background:rgba(220,38,38,0.94); color:white; border:1px solid rgba(255,255,255,.7); border-radius:50%; width:24px; height:24px; cursor:pointer; font-size:14px; font-weight:bold; display:none; align-items:center; justify-content:center; z-index:10000; box-shadow:0 3px 10px rgba(0,0,0,0.28); line-height:1; font-family:sans-serif;";
        
        (el as HTMLElement).style.position = "relative";
        el.appendChild(btn);

        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          const id = el.getAttribute("data-visual-removable");
          if (id) {
            const currentHidden = state.siteContent.hiddenElements || [];
            if (!currentHidden.includes(id)) {
              updSite({ hiddenElements: [...currentHidden, id] });
              toast.success("¡Elemento ocultado del sitio!");
            }
          }
        });
      });
    };

    iframe.addEventListener("load", handleIframeLoad);
    handleIframeLoad(); // dispara una vez si ya está cargado

    return () => {
      iframe.removeEventListener("load", handleIframeLoad);
    };
  }, [state, state.selectedPackages, state.depoimentos]);
  // ── AUTO-SYNC: Injeta dados da Fase 3 na Fase 4 na primeira montagem ──
  // Só atua se o usuário ainda não personalizou o site (campos padrão).
  // Garante que todas as informações preenchidas nas fases anteriores
  // apareçam pré-populadas no construtor do site.
  useEffect(() => {
    if (!isHydrated) return;
    const SYNC_KEY = `fabrica-phase4-autosync-v2-es:${user?.id || "local"}:${state.projectId || "draft"}`;
    const lastSyncHash = localStorage.getItem(SYNC_KEY);
    const dest = (state.destinos?.[0] || "").trim();
    const currentHash = [dest, state.lastPrice, state.lastPaymentMode, state.agencyName, state.agencyType].join("|");

    // Se já sincronizou com esses mesmos dados, não re-sincroniza
    if (lastSyncHash === currentHash) return;
    if (!dest && !state.lastPrice) return; // nada para sincronizar

    const synced: string[] = [];
    const patches: Record<string, any> = {};

    // 1. Hero Headline — usa nome da agência + destino
    const heroDefault = state.siteContent.heroHeadline;
    if (!heroDefault || heroDefault === "" || heroDefault === `${state.agencyName} — Tu próximo viaje empieza aquí`) {
      const agency = state.agencyName?.trim();
      const headline = agency
        ? `${agency} — ${dest ? `Paquetes para ${dest} y mucho más!` : "Tu próximo viaje empieza aquí!"}`
        : dest ? `Tu próximo viaje es ${dest}` : "";
      if (headline) {
        patches["siteContent.heroHeadline"] = headline;
        synced.push("Título principal del sitio");
      }
    }

    // 2. Hero Subheadline — usa destinos cadastrados
    if (!state.siteContent.heroSubheadline) {
      const ds = (state.destinos || []).filter(Boolean).slice(0, 4);
      if (ds.length > 0) {
        patches["siteContent.heroSubheadline"] = `Rutas para ${ds.join(", ")} y otros destinos increíbles. Atención personalizada y soporte 24h.`;
        synced.push("Subtítulo del sitio");
      }
    }

    // 3. Pacote automático desabilitado aqui (gerenciado pela Fase 3 de forma acumulativa)


    // 4. CTA final — usa WhatsApp/Instagram se disponíveis
    if (!state.siteContent.finalCtaTitle || state.siteContent.finalCtaTitle === "¿Listo para tu próximo viaje?") {
      if (dest) {
        patches["siteContent.finalCtaTitle"] = `¿Vas a ${dest}? ¡Habla conmigo ahora!`;
        synced.push("CTA final");
      }
    }

    // 🧠 5. CONTINUIDADE DO DIAGNÓSTICO (Ponto 3):
    // Se o nível do usuário é baixo (menos que 3), o sistema INTUI que falta autoridade.
    // Logo, ele OBRIGA e ATIVA automaticamente os depoimentos e a sessão 'Por que Nós'.
    if (state.level && state.level < 3) {
      if (!state.siteContent.sections?.depoimentos) {
        patches["siteContent.sections.depoimentos"] = true;
        synced.push("Blindaje de Autoridad (Testimonios Activados)");
      }
      if (!state.siteContent.sections?.porQue) {
        patches["siteContent.sections.porQue"] = true;
        synced.push("Blindaje de Autoridad (Diferenciales Activados)");
      }
    }

    // 6. Sincronización Inteligente por Tipo de Agência (ES)
    const type = state.agencyType;
    const isAutonoma = type === "autonoma";
    const isCorp = type === "corporativa";
    const isLuxo = type === "luxo";

    if (!state.siteContent.heroEyebrow || state.siteContent.heroEyebrow === "Consultoria Premium de Viagens" || state.siteContent.heroEyebrow === "Consultoría Premium de Viajes") {
      let eyebrow = "Consultoría Premium de Viajes";
      if (isAutonoma) eyebrow = "Agente de Viajes Especialista";
      if (isCorp) eyebrow = "Gestión de Viajes Corporativos";
      if (isLuxo) eyebrow = "Viajes de Lujo a Medida";
      if (state.niche === "cruzeiro") eyebrow = "Especialista en Cruceros";
      patches["siteContent.heroEyebrow"] = eyebrow;
      synced.push("Identidad del Nicho/Agencia");
    }

    if (!state.siteContent.equipeEyebrow || state.siteContent.equipeEyebrow === "Nossa equipe" || state.siteContent.equipeEyebrow === "Nuestro equipo") {
      patches["siteContent.equipeEyebrow"] = isAutonoma ? "Sobre Mí" : "Nuestro equipo";
    }

    if (!state.siteContent.equipeTitle || state.siteContent.equipeTitle === "Uma equipe dedicada exclusivamente a você" || state.siteContent.equipeTitle === "Un equipo dedicado exclusivamente a ti") {
      patches["siteContent.equipeTitle"] = isAutonoma 
        ? "Atención dedicada exclusivamente a ti" 
        : isCorp 
        ? "Especialistas enfocados en tu empresa" 
        : "Un equipo dedicado exclusivamente a ti";
    }

    if (!state.siteContent.equipeIntro || state.siteContent.equipeIntro.startsWith("Cada viagem começa") || state.siteContent.equipeIntro.startsWith("Cada viaje comienza")) {
      patches["siteContent.equipeIntro"] = isAutonoma
        ? "Mi enfoque es planificar cada detalle de tu viaje. Conozco los destinos de cerca y cuido todo según tu perfil y momento."
        : isCorp
        ? "Ayudamos a tu empresa a ahorrar y tener total seguridad en los viajes de negocios. Atención rápida y eficiente."
        : "Cada viaje comienza con una conversación real. Nuestro equipo de expertos conoce los destinos de cerca — cada detalle pensado para tu perfil, tus sueños y tu momento.";
    }

    if (!state.siteContent.processoTitle || state.siteContent.processoTitle === "Sua viagem dos sonhos em 3 passos" || state.siteContent.processoTitle === "Tu viaje de ensueño en 3 pasos") {
      patches["siteContent.processoTitle"] = isCorp 
        ? "Gestión inteligente en 3 pasos" 
        : "Tu viaje de ensueño en 3 pasos";
    }

    if (synced.length === 0) return;

    // Aplica todos os patches de uma vez ao contexto compartilhado
    const sitePatches: Partial<typeof state.siteContent> = {};
    const rootPatches: any = {};

    for (const [k, v] of Object.entries(patches)) {
      if (k.startsWith("siteContent.")) {
        const field = k.replace("siteContent.", "") as any;
        sitePatches[field] = v;
      } else {
        rootPatches[k] = v;
      }
    }

    if (Object.keys(sitePatches).length > 0) {
      rootPatches.siteContent = { ...state.siteContent, ...sitePatches };
    }

    // Handle gallery separately
    if (patches["galleryImages"]) {
      rootPatches.siteContent = {
        ...(rootPatches.siteContent || state.siteContent),
        galleryImages: patches["galleryImages"],
      };
    }

    systemUpdate(rootPatches);
    setAutoSyncFields(synced);
    setAutoSyncDone(true);
    localStorage.setItem(SYNC_KEY, currentHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, state.agencyName, state.destinos, state.lastPaymentMode, state.lastPrice, state.level, state.projectId, state.siteContent, systemUpdate, user?.id]);

  const resetSiteToBlank = () => {
    const SYNC_KEY = `fabrica-phase4-autosync-v2-es:${user?.id || "local"}:${state.projectId || "draft"}`;
    localStorage.removeItem(SYNC_KEY);
    const currentPhase = state.currentPhase;
    reset();
    systemUpdate({ currentPhase });
    setAutoSyncDone(false);
    setAutoSyncFields([]);
    toast.success("¡Nuevo proyecto en blanco creado!");
  };

  // Pacotes
  const addPacote = () => {
    const packageId = String(Date.now());
    const novo: Pacote = {
      id: packageId,
      title: "Nuevo paquete",
      description: "Describe lo que está incluido",
      price: "$ 0,00",
      imageUrl: "",
      ctaLabel: "Quiero este",
      slug: buildPackageSlug(`nuevo-paquete-${packageId}`, packageId),
      segment: suggestPackageSegment(state.agencyType),
    };
    update({ selectedPackages: [...state.selectedPackages, novo] });
  };
  const updPacote = (id: string, patch: Partial<Pacote>) => {
    update({ selectedPackages: state.selectedPackages.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  };
  const delPacote = (id: string) => {
    update({ selectedPackages: state.selectedPackages.filter((p) => p.id !== id) });
  };

  // Testimonios
  const addDepo = () => update({ depoimentos: [...state.depoimentos, { name: "Cliente feliz", text: "¡Atención increíble!" }] });
  const updDepo = (i: number, patch: Partial<Testimonio>) => {
    update({ depoimentos: state.depoimentos.map((d, idx) => (idx === i ? { ...d, ...patch } : d)) });
  };
  const delDepo = (i: number) => update({ depoimentos: state.depoimentos.filter((_, idx) => idx !== i) });

  // Galeria de imagens (banco do usuário)
  const addToGallery = (url: string) => {
    if (!url.trim()) return;
    if (state.siteContent.galleryImages.includes(url)) return;
    update({
      siteContent: {
        ...state.siteContent,
        galleryImages: [...state.siteContent.galleryImages, url],
      },
    });
    toast.success("¡Imagen añadida al banco!");
  };
  const removeFromGallery = (url: string) => {
    update({
      siteContent: {
        ...state.siteContent,
        galleryImages: state.siteContent.galleryImages.filter((u) => u !== url),
      },
    });
  };

  // Site content
  const updSite = (patch: Partial<typeof state.siteContent>) => {
    update({ siteContent: { ...state.siteContent, ...patch } });
  };

  const toggleSection = (key: keyof SectionVisibility) => {
    updSite({
      sections: {
        ...state.siteContent.sections,
        [key]: !state.siteContent.sections[key],
      },
    });
  };

  const isVisible = (key: keyof SectionVisibility) => state.siteContent.sections[key] !== false;

  const previewHTML = buildLandingHTML(state, user?.id);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.documentElement.classList.toggle("fabrica-remove-mode", removeMode);
    if (!removeMode) {
      doc.querySelectorAll(".fabrica-remove-selected").forEach((element) =>
        element.classList.remove("fabrica-remove-selected"),
      );
    }
  }, [previewHTML, removeMode]);

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Shortcut Shift+Ctrl+P to toggle Mobile Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        setPreviewMode(prev => {
          const next = prev === 'desktop' ? 'mobile' : 'desktop';
          toast.success(next === 'mobile' ? "¡Modo Móvil (iPhone) Activado! 📱" : "¡Modo Computadora Activado! 💻");
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDownload = () => {
    setDownloadCount((c) => c + 1);
    downloadLandingHTML(state, downloadCount + 1, user?.id);
    toast.success(`¡Versión ${downloadCount + 1} descargada! El archivo HTML está listo para usar.`);
  };

  return (
    <div className="max-w-3xl lg:max-w-[1550px] mx-auto transition-all duration-300">
      <ProjectSwitchDialog
        open={Boolean(pendingProjectSwitch)}
        currentName={state.agencyName || "Sin nombre"}
        targetName={pendingProjectSwitch?.agency_name || "Sin nombre"}
        locale="es"
        busy={isSwitchingProject}
        onCancel={() => !isSwitchingProject && setPendingProjectSwitch(null)}
        onConfirm={() => pendingProjectSwitch && void loadSavedProject(pendingProjectSwitch)}
      />
      {/* ── SELETOR DE PROJETO PERMANENTE — Siempre visible sin importar el estado ── */}
      <div className="rounded-2xl p-3 border bg-white/[0.03] border-white/10 flex items-center gap-3 mb-4">
        <span className="text-base flex-shrink-0">📂</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/40 mb-1.5 font-semibold uppercase tracking-wider">
            Editando sitio: <span className="text-white/70 normal-case font-bold">{state.agencyName || "Sin nombre"}</span>
            {state.siteContent?.canvaViagemUrl && (
              <a href={normalizeCanvaSiteUrl(state.siteContent.canvaViagemUrl)} target="_blank" rel="noopener noreferrer"
                className="ml-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                ↗ {state.siteContent.canvaViagemUrl}
              </a>
            )}
          </p>
          {/* ✅ CORRECCIÓN CRÍTICA: selector siempre visible para TODOS los proyectos guardados */}
          {savedProjects && savedProjects.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const p = savedProjects!.find(x => x.id === val);
                if (!p || !p.state_snapshot) return;
                requestProjectSwitch(p);
              }}
              className="w-full max-w-md bg-white/[0.04] border border-white/15 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900">↕ Cambiar proyecto / Cargar otro sitio guardado...</option>
              {savedProjects.map((p) => {
                const snap = p.state_snapshot as any;
                const pkgCount = snap?.selectedPackages?.length || 0;
                const url = snap?.siteContent?.canvaViagemUrl || "";
                const isCurrent = p.id === state.projectId;
                const isRecovered = p.source === "published_recovery";
                const date = new Date(p.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
                return (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                    {isCurrent ? "● " : ""}{p.agency_name || "Sin Nombre"}{isRecovered ? " • Recuperado" : ""}{url ? ` — ${url}` : ""} • {pkgCount} paquete{pkgCount !== 1 ? "s" : ""} • {date}
                  </option>
                );
              })}
            </select>
          )}
        </div>
        <button
          onClick={resetSiteToBlank}
          className="flex-shrink-0 text-[10px] font-bold text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 rounded-lg px-3 py-1.5 transition-all whitespace-nowrap"
          title="Limpiar todo y comenzar un nuevo sitio desde cero"
        >
          Crear Nuevo Sitio
        </button>
      </div>

      <SiteTemplateSelector
        locale="es"
        selected={state.siteContent.templateId}
        onSelect={(templateId) => {
          updSite({ templateId });
          toast.success(`Modelo ${getSiteTemplateDefinition(templateId).copy.es.label} aplicado en la vista previa.`);
        }}
        primaryColor={state.primaryColor}
        secondaryColor={state.secondaryColor}
        backgroundColor={state.backgroundColor}
        heroImageUrl={state.siteContent.heroImageUrl}
      />

      {/* ── Banner de Auto-Sync (informativo, no bloquea el selector) ── */}
      {autoSyncDone && autoSyncFields.length > 0 && (
        <div className="rounded-2xl p-4 border bg-emerald-500/10 border-emerald-500/25 flex items-start gap-3 mb-4">
          <div className="text-2xl flex-shrink-0">✅</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white mb-1">
              ¡Sitio pre-llenado con tus datos de la Fábrica!
            </div>
            <p className="text-[11px] text-white/60 leading-snug">
              Importamos automáticamente: <strong className="text-emerald-300">{autoSyncFields.join(" · ")}</strong>.
              Puedes editar cualquier campo directamente en la vista previa a continuación o en los ajustes.
            </p>
          </div>
        </div>
      )}



      {/* Grid lateral */}
      <div className="flex flex-col-reverse gap-8 items-stretch">
        {/* Painel Esquerdo: Opções de Configuração (5 colunas em lg) */}
        <div className="w-full space-y-6">
          {/* PUBLICACIÓN DIRECTA EN CANVA VIAGEM */}
          <PublishSiteCardES html={previewHTML} onBack={onBack} onNext={onNext} />

          <div className="border-b border-white/10 pb-4 pt-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-400" />
              ⚙️ Ajustes Finos y Configuración Avanzada:
            </h4>
          </div>

            <FabricaCard title="📦 Paquetes ofrecidos" sectionId="packages">
              <FieldText
                label="Título de la sección"
                value={state.siteContent.pacotesTitle}
                onChange={(v) => updSite({ pacotesTitle: v })}
              />
              <div className="space-y-3 mt-4">
                {state.selectedPackages.filter(p => !p.isDraft).map((p) => (
                  <PacoteEditor
                     key={p.id}
                     pacote={p}
                     agencyType={state.agencyType}
                     gallery={state.siteContent.galleryImages}
                     onChange={(patch) => updPacote(p.id, patch)}
                     onDelete={() => delPacote(p.id)}
                   />
                ))}
                <button
                  onClick={addPacote}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Añadir paquete
                </button>
              </div>
            </FabricaCard>

          <div className="space-y-6">
            <FabricaCard title="Paleta de la marca">
              <BrandPaletteEditor
                locale="es"
                primaryColor={state.primaryColor}
                secondaryColor={state.secondaryColor}
                backgroundColor={state.backgroundColor || "#F4F6F9"}
                onChange={(patch) => update(patch)}
              />
            </FabricaCard>

            <FabricaCard title="👁️ Secciones del sitio">

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { key: "hero", label: "Encabezado (Hero)" },
                    { key: "processo", label: "Cómo funciona (3 pasos)" },
                    { key: "destinos", label: "Destinos / Paquetes" },
                    { key: "porQue", label: "Por qué nosotros / Equipo" },
                    { key: "depoimentos", label: "Testimonios" },
                    { key: "orcamento", label: "Formulario de presupuesto" },
                    { key: "faq", label: "Preguntas Frecuentes" },
                    { key: "ctaFinal", label: "CTA Final" },
                  ] as { key: keyof SectionVisibility; label: string }[]
                ).map(({ key, label }) => {
                  const on = isVisible(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleSection(key)}
                      className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        on
                          ? "bg-white/[0.06] border-white/20 text-white"
                          : "bg-white/[0.02] border-white/10 text-white/40 line-through"
                      }`}
                    >
                      <span className="truncate text-left">{label}</span>
                      {on ? <Eye className="w-4 h-4 flex-shrink-0" /> : <EyeOff className="w-4 h-4 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </FabricaCard>

            <FabricaCard title="✨ Efectos Visuales & Campañas">

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-wider">Efecto Animado</label>
                  <div className="relative">
                    <select
                      value={state.siteContent.animationEffect || "none"}
                      onChange={(e) => updSite({ animationEffect: e.target.value as any })}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#00ff88]/50 transition-colors appearance-none pr-8"
                    >
                      <option value="none" className="bg-zinc-900">Ninguno (Estándar)</option>
                      
                      <optgroup label="📅 Fechas Especiales">
                        <option value="junina_bandeiras" className="bg-zinc-900">🌽 Fiesta Junina (Banderines)</option>
                        <option value="junina_baloes" className="bg-zinc-900">🌽 Fiesta Junina (Globos)</option>
                        <option value="junina_fagulhas" className="bg-zinc-900">🔥 Fiesta Junina (Chispas)</option>
                        <option value="natal_luzes" className="bg-zinc-900">🎄 Especial Navidad (Luces)</option>
                        <option value="natal_estrela" className="bg-zinc-900">⭐ Especial Navidad (Estrella Guía)</option>
                        <option value="reveillon_fogos" className="bg-zinc-900">🎆 Año Nuevo (Micro-Fuegos)</option>
                        <option value="reveillon_poeira" className="bg-zinc-900">✨ Año Nuevo (Polvo de Oro)</option>
                        <option value="carnaval_mascaras" className="bg-zinc-900">🎭 Carnaval (Máscaras Flotantes)</option>
                        <option value="pascoa_orelhas" className="bg-zinc-900">🐰 Pascua (Orejas Curiosas)</option>
                        <option value="pascoa_pegadas" className="bg-zinc-900">🐾 Pascua (Huellas de Conejo)</option>
                        <option value="neve" className="bg-zinc-900">❄️ Nieve (Invierno)</option>
                        <option value="confete" className="bg-zinc-900">🎉 Lluvia de Confeti (Ofertas)</option>
                      </optgroup>

                      <optgroup label="🎯 Temas por Nicho (Todo el Año)">
                        <option value="eco_folhas" className="bg-zinc-900">🏔️ Ecoturismo (Hojas al Viento)</option>
                        <option value="eco_borboletas" className="bg-zinc-900">🦋 Ecoturismo (Mariposas)</option>
                        <option value="praia_bolhas" className="bg-zinc-900">🏖️ Playa (Burbujas de Agua)</option>
                        <option value="praia_ondas" className="bg-zinc-900">🌊 Playa (Olas Suaves)</option>
                        <option value="praia_sol" className="bg-zinc-900">☀️ Playa (Brillo del Sol)</option>
                        <option value="cruzeiro_navio" className="bg-zinc-900">🛳️ Crucero (Barco Navegante)</option>
                        <option value="cruzeiro_gotas" className="bg-zinc-900">💧 Crucero (Gotas de Rocío)</option>
                        <option value="internacional_aviao" className="bg-zinc-900">✈️ Internacional (Avión de Papel)</option>
                        <option value="internacional_bussola" className="bg-zinc-900">🧭 Internacional (Brújula Giratoria)</option>
                        <option value="luxo_aurora" className="bg-zinc-900">👑 Lujo (Aurora Boreal)</option>
                        <option value="luxo_reflexo" className="bg-zinc-900">✨ Lujo (Reflejo Metálico)</option>
                      </optgroup>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                      <ChevronDown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {state.siteContent.animationEffect && state.siteContent.animationEffect !== "none" && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-wider">Duración del Efecto</label>
                    <div className="relative">
                      <select
                        value={state.siteContent.animationDuration || "always"}
                        onChange={(e) => updSite({ animationDuration: e.target.value as any })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#00ff88]/50 transition-colors appearance-none pr-8"
                      >
                        <option value="always" className="bg-zinc-900">Todo el tiempo (Predeterminado)</option>
                        <option value="5" className="bg-zinc-900">Durar 5 segundos al abrir</option>
                        <option value="10" className="bg-zinc-900">Durar 10 segundos al abrir</option>
                        <option value="30" className="bg-zinc-900">Durar 30 segundos al abrir</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <ChevronDown className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FabricaCard>

            <FabricaCard title="✏️ Encabezado (Hero)">
              <div className="space-y-3">
                <FieldText
                  label="Título principal"
                  value={state.siteContent.heroHeadline}
                  onChange={(v) => updSite({ heroHeadline: v })}
                  placeholder={`${state.agencyName || "Tu Agencia"} — Tu próximo viaje comienza aquí`}
                />
                <FieldTextarea
                  label="Subtítulo"
                  value={state.siteContent.heroSubheadline}
                  onChange={(v) => updSite({ heroSubheadline: v })}
                  placeholder="Atención personalizada, itinerarios a medida..."
                />
                <FieldText
                  label="Texto del botón principal"
                  value={state.siteContent.heroCtaLabel}
                  onChange={(v) => updSite({ heroCtaLabel: v })}
                  placeholder="Hablar por WhatsApp"
                />
              </div>
            </FabricaCard>

            <FabricaCard title="🖼️ Banco de imágenes">
              <p className="text-xs text-white/50 mb-3">
                Guarda aquí las imágenes que generaste en la Fase 3 o pega enlaces externos. Estarán disponibles en el selector de fotos de la vista previa.
              </p>
              <ImageGallery
                images={state.siteContent.galleryImages}
                generatedAd={state.lastCleanPhoto || ""}
                onAdd={addToGallery}
                onRemove={removeFromGallery}
              />
            </FabricaCard>



            <FabricaCard title="⭐ Testimonios">
              <FieldText
                label="Título de la sección"
                value={state.siteContent.depoimentosTitle}
                onChange={(v) => updSite({ depoimentosTitle: v })}
              />
              <div className="space-y-3 mt-4">
                {state.depoimentos.map((d, i) => (
                  <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={d.name}
                        onChange={(e) => updDepo(i, { name: e.target.value })}
                        placeholder="Nombre del cliente"
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40"
                      />
                      <button
                        onClick={() => delDepo(i)}
                        className="p-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={d.text}
                      onChange={(e) => updDepo(i, { text: e.target.value })}
                      placeholder="Testimonio"
                      rows={2}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 resize-none"
                    />
                  </div>
                ))}
                <button
                  onClick={addDepo}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Añadir testimonio
                </button>
              </div>
            </FabricaCard>

            <FabricaCard title="❓ Preguntas Frecuentes (FAQ)">
              <FieldText
                label="Título de la sección"
                value={state.siteContent.faqTitle}
                onChange={(v) => updSite({ faqTitle: v })}
              />
              <div className="space-y-3 mt-4">
                {state.siteContent.faq.map((item, i) => (
                  <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={item.q}
                        onChange={(e) => {
                          const next = [...state.siteContent.faq];
                          next[i] = { ...next[i], q: e.target.value };
                          updSite({ faq: next });
                        }}
                        placeholder="Pregunta"
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40"
                      />
                      <button
                        onClick={() => updSite({ faq: state.siteContent.faq.filter((_, idx) => idx !== i) })}
                        className="p-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={item.a}
                      onChange={(e) => {
                        const next = [...state.siteContent.faq];
                        next[i] = { ...next[i], a: e.target.value };
                        updSite({ faq: next });
                      }}
                      placeholder="Respuesta"
                      rows={2}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 resize-none"
                    />
                  </div>
                ))}
                <button
                  onClick={() => updSite({ faq: [...state.siteContent.faq, { q: "¿Nueva pregunta?", a: "Respuesta..." }] })}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Añadir pregunta
                </button>
              </div>
            </FabricaCard>

            <FabricaCard title="🎯 CTA Final">
              <div className="space-y-3">
                <FieldText
                  label="Título"
                  value={state.siteContent.finalCtaTitle}
                  onChange={(v) => updSite({ finalCtaTitle: v })}
                />
                <FieldText
                  label="Texto del botón"
                  value={state.siteContent.finalCtaLabel}
                  onChange={(v) => updSite({ finalCtaLabel: v })}
                />
              </div>
            </FabricaCard>
          </div>

          {/* BARRA DE ACCIONES INFERIOR FIJA */}
          <div className="flex gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 mt-6">
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 font-semibold hover:bg-white/[0.08] flex items-center justify-center gap-2"
            >
              Atrás
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              style={{
                background: `linear-gradient(135deg, ${UI_ACCENT}, #FCD34D)`,
                boxShadow: `0 8px 24px ${UI_ACCENT_SHADOW}`,
              }}
            >
              <Download className="w-4 h-4" /> Descargar HTML {downloadCount > 0 && `(v${downloadCount})`}
            </button>
          </div>


        </div>

        {/* Painel Direito: Preview do Site */}
        <div className="w-full space-y-6 lg:sticky lg:top-24">
          <div className="bg-[#0A0A0C] border border-white/[0.07] rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            <div className="px-4 py-3 bg-black/60 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/70 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400/70 inline-block" />
                </div>
                <div className="ml-3 px-3 py-1.5 rounded-lg bg-white/[0.03] text-[10px] font-mono text-white/40 w-44 sm:w-64 truncate border border-white/[0.05] tracking-wide">
                  https://{(state.agencyName || "tu-agencia").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-")}.canvaviagem.com
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Histórico Desfazer/Refazer */}
                <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/15">
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={`p-1.5 rounded-md transition-all ${
                      canUndo ? "text-amber-400 hover:bg-white/10" : "text-white/20 cursor-not-allowed"
                    }`}
                    title="Deshacer cambio (Undo)"
                  >
                    <Undo className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={`p-1.5 rounded-md transition-all ${
                      canRedo ? "text-emerald-400 hover:bg-white/10" : "text-white/20 cursor-not-allowed"
                    }`}
                    title="Rehacer cambio (Redo)"
                  >
                    <Redo className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Seletor Dispositivo */}
                <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/10">
                  <button
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                      previewMode === "desktop" ? "bg-white text-zinc-900 shadow" : "text-white/60 hover:text-white"
                    }`}
                  >
                    Computadora
                  </button>
                  <button
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                      previewMode === "mobile" ? "bg-white text-zinc-900 shadow" : "text-white/60 hover:text-white"
                    }`}
                  >
                    Celular
                  </button>
                </div>

                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Editor Visual
                </span>
                <button
                  type="button"
                  aria-pressed={removeMode}
                  onClick={() => setRemoveMode((current) => !current)}
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-bold ${
                    removeMode
                      ? "border-red-400/50 bg-red-500/15 text-red-200"
                      : "border-white/10 text-white/45 hover:text-white"
                  }`}
                >
                  <X className="h-3 w-3" />
                  {removeMode ? "Toca el elemento" : "Quitar elemento"}
                </button>
                {(state.siteContent.hiddenElements?.length || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => updSite({ hiddenElements: [] })}
                    className="min-h-9 rounded-lg border border-white/10 px-2.5 text-[10px] font-bold text-white/45 hover:text-white"
                  >
                    Restaurar ({state.siteContent.hiddenElements?.length})
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 bg-black/50 relative">
              <div className="mb-3 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/10 text-center text-[11px] text-amber-300/80 font-semibold flex items-center justify-center gap-2">
                <Pencil className="w-3.5 h-3.5 text-amber-400" />
                💡 <strong>Haz clic en textos, iconos, fotos o fondos para editar.</strong> En botones, usa doble clic para abrir los colores.
              </div>

              <div className="transition-all duration-300 ease-in-out">
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHTML}
                  className={`bg-white transition-all duration-500 ${
                    previewMode === "mobile"
                      ? "w-full max-w-[375px] h-[720px] mx-auto border-[10px] border-zinc-800 rounded-[36px] shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
                      : "w-full h-[1150px] border border-white/[0.05] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                  }`}
                  title="Preview"
                />
              </div>
              {activePackagePreviewId && (
                <div className="fixed inset-x-3 top-16 z-[80] flex items-center gap-2 rounded-2xl border border-amber-400/40 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur md:hidden">
                  <button
                    type="button"
                    className="min-h-11 flex-1 rounded-xl bg-amber-400 px-4 text-sm font-black text-zinc-950"
                    onClick={() => {
                      const packageId = activePackagePreviewId;
                      const iframeWindow = iframeRef.current?.contentWindow as (Window & {
                        closePackageDetails?: () => void;
                      }) | null;
                      iframeWindow?.closePackageDetails?.();
                      setActivePackagePreviewId(null);
                      window.setTimeout(() => packageEditorShortcutRef.current(packageId), 0);
                    }}
                  >
                    Editar información
                  </button>
                  <button
                    type="button"
                    aria-label="Cerrar detalles del paquete"
                    className="grid min-h-11 min-w-11 place-items-center rounded-xl border border-white/15 text-xl text-white"
                    onClick={() => {
                      const iframeWindow = iframeRef.current?.contentWindow as (Window & {
                        closePackageDetails?: () => void;
                      }) | null;
                      iframeWindow?.closePackageDetails?.();
                      setActivePackagePreviewId(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {globalEditingPalette && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm">
          <aside
            ref={colorDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fabrica-color-dialog-title-es"
            aria-describedby="fabrica-color-dialog-description-es"
            tabIndex={-1}
            className="ml-auto h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-zinc-950 p-6 shadow-2xl"
          >
            <button
              ref={colorModalCloseRef}
              type="button"
              onClick={() => {
                setGlobalEditingPalette(false);
                setActiveColorSection(null);
              }}
              className="absolute right-4 top-4 rounded-lg bg-white/[0.04] p-1.5 text-white/50 transition-colors hover:bg-white/[0.1] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Cerrar editor de colores"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 pr-10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Edición visual</div>
              <h3 id="fabrica-color-dialog-title-es" className="mt-1 text-lg font-bold text-white">
                Fondo: {SITE_SECTION_LABELS_ES[activeColorSection || ""] || "Sección seleccionada"}
              </h3>
              <p id="fabrica-color-dialog-description-es" className="mt-1 text-xs leading-relaxed text-white/50">
                Este color se guardará solamente en este fondo. Las otras partes del sitio no cambiarán.
              </p>
            </div>

            {activeColorSection && (
              <SectionBackgroundEditor
                locale="es"
                label={`Color de ${SITE_SECTION_LABELS_ES[activeColorSection] || "fondo"}`}
                value={state.siteContent.sectionColors?.[activeColorSection] || state.backgroundColor || "#F4F6F9"}
                paletteColors={[state.primaryColor, state.secondaryColor, state.backgroundColor || "#F4F6F9", "#18181B"]}
                onChange={(color) => updSite({
                  sectionColors: {
                    ...(state.siteContent.sectionColors || {}),
                    [activeColorSection]: color,
                  },
                })}
                onReset={() => {
                  const sectionColors = { ...(state.siteContent.sectionColors || {}) };
                  delete sectionColors[activeColorSection];
                  updSite({ sectionColors });
                }}
              />
            )}

            <details className="mt-6 border-t border-white/10 pt-5">
              <summary className="cursor-pointer text-xs font-bold text-white/65 hover:text-white">
                Cambiar la paleta global de la marca
              </summary>
              <div className="mt-4">
                <BrandPaletteEditor
                  compact
                  locale="es"
                  primaryColor={state.primaryColor}
                  secondaryColor={state.secondaryColor}
                  backgroundColor={state.backgroundColor || "#F4F6F9"}
                  onChange={(patch) => update(patch)}
                />
              </div>
            </details>

            <button
              type="button"
              onClick={() => {
                setGlobalEditingPalette(false);
                setActiveColorSection(null);
              }}
              className="mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold text-zinc-950 transition-transform hover:scale-[1.01]"
              style={{ backgroundColor: UI_ACCENT }}
            >
              Finalizar edición
            </button>
          </aside>
        </div>
      )}

      {globalPickingImage && activeImageEdit && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setGlobalPickingImage(false);
              setActiveImageEdit(null);
            }
          }}
        >
          <div
            ref={imageDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fabrica-image-dialog-title-es"
            aria-describedby="fabrica-image-dialog-description-es"
            tabIndex={-1}
            className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900 p-5 shadow-2xl sm:p-6"
          >
            <button
              ref={imageModalCloseRef}
              type="button"
              onClick={() => {
                setGlobalPickingImage(false);
                setActiveImageEdit(null);
              }}
              className="absolute right-4 top-4 rounded-lg bg-white/[0.04] p-1.5 text-white/50 hover:bg-white/[0.1] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Cerrar selector de imágenes"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex items-center gap-2 pr-10">
              <Sparkles className="h-5 w-5 text-amber-400" aria-hidden="true" />
              <h3 id="fabrica-image-dialog-title-es" className="text-lg font-bold text-white">
                Cambiar {activeImageEdit.type === "logo" ? "logotipo" : activeImageEdit.type === "hero" ? "imagen principal" : activeImageEdit.type === "about" ? "foto del equipo" : "foto del paquete"}
              </h3>
            </div>
            <p id="fabrica-image-dialog-description-es" className="mb-4 text-xs leading-5 text-white/60">
              Reutiliza una imagen de tu banco, pega un enlace o selecciona una foto de tu dispositivo.
            </p>

            {state.siteContent.galleryImages.length > 0 ? (
              <div className="mb-4 grid max-h-56 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-white/5 bg-black/20 p-2 sm:grid-cols-4">
                {state.siteContent.galleryImages.map((url, index) => (
                  <button
                    key={`${url}-${index}`}
                    type="button"
                    onClick={() => applyGlobalImage(url)}
                    className="aspect-square overflow-hidden rounded-lg border-2 border-white/10 transition-all hover:border-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    aria-label={`Usar imagen ${index + 1} del banco`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-4 rounded-xl border border-dashed border-white/10 bg-black/10 py-6 text-center text-xs italic text-white/40">
                Tu banco todavía no tiene imágenes. Puedes pegar un enlace o subir una foto.
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="url"
                  aria-label="Enlace de la imagen"
                  placeholder="https://ejemplo.com/foto.jpg"
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    const url = normalizeExternalImageUrl(event.currentTarget.value);
                    if (!url) {
                      toast.error("Ingresa un enlace de imagen válido.");
                      return;
                    }
                    applyGlobalImage(url);
                  }}
                  className="min-h-11 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/60"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    const input = event.currentTarget.previousElementSibling as HTMLInputElement | null;
                    const url = normalizeExternalImageUrl(input?.value || "");
                    if (!url) {
                      toast.error("Ingresa un enlace de imagen válido.");
                      return;
                    }
                    applyGlobalImage(url);
                  }}
                  className="min-h-11 rounded-lg bg-white/[0.08] px-4 text-sm font-semibold text-white hover:bg-white/[0.15]"
                >
                  Aplicar
                </button>
              </div>

              <label className="block min-h-11 cursor-pointer rounded-lg border border-dashed border-white/20 bg-white/[0.02] py-3 text-center text-xs font-semibold text-white/60 transition-colors hover:border-white/40 hover:text-white">
                <Upload className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> Seleccionar del dispositivo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => applyGlobalImage(String(reader.result || ""));
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

/* ───────────── Sub-componentes ───────────── */

const FieldText = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <label className="block">
    <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
      <Pencil className="w-3 h-3" /> {label}
    </span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40"
    />
  </label>
);

const FieldTextarea = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <label className="block">
    <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
      <Pencil className="w-3 h-3" /> {label}
    </span>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 resize-none"
    />
  </label>
);

const PacoteEditor = ({
  pacote,
  agencyType,
  gallery,
  onChange,
  onDelete,
}: {
  pacote: Pacote;
  agencyType: AgencyType;
  gallery: string[];
  onChange: (patch: Partial<Pacote>) => void;
  onDelete: () => void;
}) => {
  const [pickingImage, setPickingImage] = useState(false);
  const [photoQuery, setPhotoQuery] = useState("");
  const [searchingPhotos, setSearchingPhotos] = useState(false);
  const [photos, setPhotos] = useState<Array<{ id: number; url: string; thumb: string; alt: string }>>([]);
  const effectiveSegment = pacote.segment || suggestPackageSegment(agencyType);
  const hasAdvancedDetails = Boolean(
    pacote.subtitle || pacote.longDescription || pacote.travelDates || pacote.duration || pacote.departureLocation ||
    pacote.meetingPoint || pacote.accommodation || pacote.priceDetails || pacote.paymentTerms ||
    pacote.availability || pacote.highlights?.length || pacote.included?.length ||
    pacote.notIncluded?.length || pacote.itinerary?.length || pacote.requirements?.length ||
    pacote.documents?.length || pacote.accessibility?.length || pacote.cancellationPolicy ||
    pacote.importantNotes || pacote.galleryImages?.length || pacote.faq?.length,
  );

  const updateList = (
    key: "highlights" | "included" | "notIncluded" | "itinerary" | "requirements" | "documents" | "accessibility",
    value: string,
  ) => onChange({ [key]: linesToList(value) } as Partial<Pacote>);

  const toggleGalleryImage = (url: string) => {
    const current = pacote.galleryImages || [];
    if (current.includes(url)) {
      onChange({ galleryImages: current.filter((item) => item !== url) });
      return;
    }
    if (current.length >= 5) {
      toast.error("Elige como máximo 5 imágenes por paquete.");
      return;
    }
    onChange({ galleryImages: [...current, url] });
  };

  const searchPhotos = async () => {
    const q = photoQuery.trim() || pacote.title.split(' ')[0] || ""; // default to first word of title
    if (!q) {
      toast.error("Ingrese el destino para buscar fotos");
      return;
    }
    setPhotoQuery(q);
    setSearchingPhotos(true);
    setPhotos([]);

    try {
      const { data, error } = await supabase.functions.invoke("fabrica-search-photos", {
        body: { query: q, perPage: 8, engine: "pexels" }
      });
      if (error) throw error;
      if (data?.photos) {
        setPhotos(data.photos);
        toast.success(`¡Fotos de ${q} cargadas con éxito!`);
      }
    } catch (err) {
      console.error("Error al buscar fotos:", err);
      toast.error("Error en la búsqueda de fotos.");
    } finally {
      setSearchingPhotos(false);
    }
  };

  return (
    <div id={`package-editor-${pacote.id}`} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 space-y-3 scroll-mt-24">
      <div className="flex gap-3">
        {/* Imagem do pacote */}
        <button
          onClick={() => setPickingImage((p) => !p)}
          className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-white/15 hover:border-white/40 transition-all relative group"
          style={pacote.imageUrl ? { borderStyle: "solid", borderColor: "rgba(255,255,255,0.2)" } : undefined}
        >
          {pacote.imageUrl ? (
            <>
              <img src={pacote.imageUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                <Pencil className="w-4 h-4" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/40 gap-1">
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Imagen</span>
            </div>
          )}
        </button>

        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              value={pacote.title}
              onChange={(e) => onChange({ title: e.target.value })}
              onBlur={(e) => {
                if (!pacote.slug || pacote.slug.startsWith("nuevo-paquete-")) {
                  onChange({ slug: buildPackageSlug(e.target.value, pacote.id) });
                }
              }}
              placeholder="Ej: Cancún 5 días"
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white placeholder:text-white/30 outline-none focus:border-white/40"
            />
            <button
              onClick={onDelete}
              className="p-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            value={pacote.price}
            onChange={(e) => onChange({ price: e.target.value })}
            placeholder="$ 1.997 / persona"
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40"
          />
          <input
            value={pacote.badge || ""}
            onChange={(e) => onChange({ badge: e.target.value })}
            placeholder="Sello de la tarjeta (ej.: Oferta, Grupo, Playa)"
            maxLength={32}
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40"
          />
        </div>
      </div>

      <textarea
        value={pacote.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Descripción (lo que está incluido)"
        rows={2}
        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 resize-none"
      />

      <div className="flex gap-2 items-center">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Botón:</span>
        <input
          value={pacote.ctaLabel || ""}
          onChange={(e) => onChange({ ctaLabel: e.target.value })}
          placeholder="Quiero este"
          className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/40"
        />
        <span className="text-[10px] text-white/40 italic">→ "Hola, tengo interés en {pacote.title || "..."}"</span>
      </div>

      <details className="group rounded-xl border border-white/10 bg-white/[0.025] open:bg-black/20">
        <summary
          data-testid={`package-advanced-toggle-${pacote.id}`}
          className="flex min-h-11 w-full cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 [&::-webkit-details-marker]:hidden"
        >
          <span>
            {hasAdvancedDetails ? "Editar más información" : "Añadir más información"}
            <span className="mt-0.5 block text-[10px] font-normal text-white/40">Opcional · aparece solamente en el detalle del paquete</span>
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform group-open:rotate-180" />
        </summary>

        <div className="space-y-5 rounded-xl border border-white/10 bg-black/25 p-3 sm:p-4">
          <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2.5 text-[11px] leading-relaxed text-amber-100/75">
            La Fábrica recomienda los campos según el tipo de paquete. Los campos vacíos no aparecen en el sitio ni cambian el formulario o el CRM.
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">Tipo de experiencia</span>
              <select
                value={effectiveSegment}
                onChange={(event) => onChange({ segment: event.target.value as Pacote["segment"] })}
                className="min-h-11 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-base text-white outline-none focus:border-white/40 sm:text-sm"
              >
                {PACKAGE_SEGMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{PACKAGE_SEGMENT_LABELS_ES[option.value] || option.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">Disponibilidad</span>
              <select
                value={pacote.availability || ""}
                onChange={(event) => onChange({ availability: (event.target.value || undefined) as Pacote["availability"] })}
                className="min-h-11 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-base text-white outline-none focus:border-white/40 sm:text-sm"
              >
                <option value="">No informar</option>
                {PACKAGE_AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{PACKAGE_AVAILABILITY_LABELS_ES[option.value] || option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">Subtítulo</span>
            <input
              value={pacote.subtitle || ""}
              onChange={(event) => onChange({ subtitle: event.target.value })}
              placeholder="Ej.: la experiencia más completa para conocer el destino"
              className="min-h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-base text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">Descripción completa</span>
            <textarea
              value={pacote.longDescription || ""}
              onChange={(event) => onChange({ longDescription: event.target.value })}
              placeholder={PACKAGE_GUIDANCE_ES.description}
              rows={5}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-base leading-relaxed text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Fechas o frecuencia", "travelDates", pacote.travelDates || "", PACKAGE_GUIDANCE_ES.dates],
              ["Duración", "duration", pacote.duration || "", PACKAGE_GUIDANCE_ES.duration],
              ["Origen / embarque", "departureLocation", pacote.departureLocation || "", PACKAGE_GUIDANCE_ES.departure],
              ["Encuentro / recogida", "meetingPoint", pacote.meetingPoint || "", PACKAGE_GUIDANCE_ES.meetingPoint],
              ["Alojamiento / cabina", "accommodation", pacote.accommodation || "", PACKAGE_GUIDANCE_ES.accommodation],
              ["Cómo se calcula el precio", "priceDetails", pacote.priceDetails || "", PACKAGE_GUIDANCE_ES.priceDetails],
              ["Pago", "paymentTerms", pacote.paymentTerms || "", "Ej.: entrada del 20% + 10 cuotas sin interés"],
              ["Enlace compartible", "slug", pacote.slug || buildPackageSlug(pacote.title, pacote.id), "ej.: jericoacoara-5-dias"],
            ].map(([label, key, value, placeholder]) => (
              <label className="block" key={key}>
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">{label}</span>
                <input
                  value={value}
                  onChange={(event) => onChange({ [key]: key === "slug" ? buildPackageSlug(event.target.value, pacote.id) : event.target.value } as Partial<Pacote>)}
                  maxLength={key === "slug" ? 120 : undefined}
                  placeholder={placeholder}
                  className="min-h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-base text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
                />
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {[
              ["Destacados", "highlights", pacote.highlights || [], PACKAGE_GUIDANCE_ES.highlights],
              ["Qué incluye", "included", pacote.included || [], PACKAGE_GUIDANCE_ES.included],
              ["Qué no incluye", "notIncluded", pacote.notIncluded || [], "Un ítem por línea\nBebidas\nGastos personales"],
              ["Itinerario resumido", "itinerary", pacote.itinerary || [], PACKAGE_GUIDANCE_ES.itinerary],
              ["Requisitos y qué llevar", "requirements", pacote.requirements || [], PACKAGE_GUIDANCE_ES.requirements],
              ["Documentos necesarios", "documents", pacote.documents || [], PACKAGE_GUIDANCE_ES.documents],
              ["Recursos de accesibilidad", "accessibility", pacote.accessibility || [], "Un recurso por línea\nTransporte adaptado: por confirmar\nAcceso sin escalones"],
            ].map(([label, key, value, placeholder]) => (
              <label className="block" key={key as string}>
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">{label as string}</span>
                <textarea
                  value={(value as string[]).join("\n")}
                  onChange={(event) => updateList(key as Parameters<typeof updateList>[0], event.target.value)}
                  placeholder={placeholder as string}
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-base leading-relaxed text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
                />
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">Política de cancelación</span>
              <textarea
                value={pacote.cancellationPolicy || ""}
                onChange={(event) => onChange({ cancellationPolicy: event.target.value })}
                placeholder="Ej.: cancelación gratuita hasta 7 días antes; después, consulta las condiciones."
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-base leading-relaxed text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">Información importante</span>
              <textarea
                value={pacote.importantNotes || ""}
                onChange={(event) => onChange({ importantNotes: event.target.value })}
                placeholder="Ej.: operación sujeta al clima; confirmación enviada por WhatsApp."
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-base leading-relaxed text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
              />
            </label>
          </div>

          {gallery.length > 0 && (
            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Galería del paquete</div>
                  <div className="mt-0.5 text-[10px] text-white/35">Reutiliza los enlaces del banco; elige hasta 5.</div>
                </div>
                <span className="text-[10px] text-white/45">{pacote.galleryImages?.length || 0}/5</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {gallery.map((url, index) => {
                  const selected = pacote.galleryImages?.includes(url);
                  return (
                    <button
                      key={url}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${selected ? "Quitar" : "Añadir"} imagen ${index + 1} de la galería del paquete`}
                      onClick={() => toggleGalleryImage(url)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${selected ? "border-amber-400" : "border-white/10 hover:border-white/35"}`}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      {selected && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-black"><Check className="h-3 w-3" /></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Preguntas de este paquete</div>
                <div className="mt-0.5 text-[10px] text-white/35">Si queda vacío, el sitio usa las preguntas generales.</div>
              </div>
              <button
                type="button"
                onClick={() => onChange({ faq: [...(pacote.faq || []), { question: "", answer: "" }] })}
                className="min-h-11 rounded-lg border border-white/10 px-3 text-xs font-semibold text-white/70 hover:bg-white/[0.05]"
              >
                + Añadir pregunta
              </button>
            </div>
            <div className="space-y-2">
              {(pacote.faq || []).map((item, index) => (
                <div key={`${pacote.id}-faq-${index}`} className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                  <div className="flex gap-2">
                    <input
                      value={item.question}
                      onChange={(event) => onChange({ faq: (pacote.faq || []).map((faq, faqIndex) => faqIndex === index ? { ...faq, question: event.target.value } : faq) })}
                      placeholder="Ej.: ¿Puedo cambiar la fecha?"
                      className="min-h-11 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-base text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
                    />
                    <button
                      type="button"
                      aria-label="Quitar pregunta"
                      onClick={() => onChange({ faq: (pacote.faq || []).filter((_, faqIndex) => faqIndex !== index) })}
                      className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={item.answer}
                    onChange={(event) => onChange({ faq: (pacote.faq || []).map((faq, faqIndex) => faqIndex === index ? { ...faq, answer: event.target.value } : faq) })}
                    placeholder="Escribe una respuesta objetiva."
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-base text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </details>

      {pickingImage && (
        <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-3">
          <div className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Elegir imagen</div>

          {/* Buscar no Pexels */}
          <div className="space-y-2">
            <div className="text-[10px] text-white/40">Buscar en la base gratuita:</div>
            <div className="flex gap-2">
              <input
                value={photoQuery}
                onChange={(e) => setPhotoQuery(e.target.value)}
                placeholder="Ej: Paris, Cancún..."
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/40"
                onKeyDown={(e) => e.key === 'Enter' && searchPhotos()}
              />
              <button
                onClick={searchPhotos}
                disabled={searchingPhotos}
                className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 font-bold text-xs hover:bg-blue-500/30 disabled:opacity-50"
              >
                {searchingPhotos ? "Buscando..." : "Buscar"}
              </button>
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {photos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onChange({ imageUrl: p.url });
                      setPickingImage(false);
                      toast.success("¡Imagen aplicada!");
                    }}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${pacote.imageUrl === p.url ? "border-blue-400" : "border-white/10 hover:border-white/40"
                      }`}
                  >
                    <img src={p.thumb} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Galeria salva */}
          {gallery.length > 0 && (
            <div>
              <div className="text-[10px] text-white/40 mb-2">De tu banco:</div>
              <div className="grid grid-cols-4 gap-2">
                {gallery.map((url) => (
                  <button
                    key={url}
                    onClick={() => {
                      onChange({ imageUrl: url });
                      setPickingImage(false);
                      toast.success("¡Imagen aplicada!");
                    }}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${pacote.imageUrl === url ? "border-amber-400" : "border-white/10 hover:border-white/40"
                      }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cole link */}
          <div className="flex gap-2">
            <input
              value={pacote.imageUrl || ""}
              onChange={(e) => onChange({ imageUrl: e.target.value })}
              placeholder="Pega la URL de la imagen (https://...)"
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/40"
            />
            <button
              onClick={() => {
                onChange({ imageUrl: "" });
                toast.success("Imagen eliminada");
              }}
              className="px-3 py-2 rounded-lg bg-white/[0.06] text-white/70 text-xs hover:bg-white/[0.1]"
            >
              Limpiar
            </button>
          </div>

          <button
            onClick={() => setPickingImage(false)}
            className="w-full py-2 rounded-lg bg-white/[0.06] text-white/70 text-xs hover:bg-white/[0.1] flex items-center justify-center gap-1"
          >
            <Check className="w-3 h-3" /> Pronto
          </button>
        </div>
      )}
    </div>
  );
};

const ImageGallery = ({
  images,
  generatedAd,
  onAdd,
  onRemove,
}: {
  images: string[];
  generatedAd: string;
  onAdd: (url: string) => void;
  onRemove: (url: string) => void;
}) => {
  const { user } = useAuth();
  const [newUrl, setNewUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!user?.id) {
      toast.error("Inicia sesión para subir una imagen desde tu computadora.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast.error("Imagen muy grande. Elige un archivo de hasta 12 MB.");
      return;
    }
    if (!/^image\/(?:jpeg|png|webp|gif|avif)$/i.test(file.type)) {
      toast.error("Formato no compatible. Usa JPG, PNG, WebP, GIF o AVIF.");
      return;
    }
    setUploadingImage(true);
    const toastId = toast.loading("Optimizando imagen para el sitio...");
    try {
      const webp = await optimizeImageBlobToWebp(file);
      const hash = await hashBlob(webp);
      const filePath = `sites/${user.id}/assets/${hash}.webp`;
      const { error } = await supabase.storage
        .from("thumbnails")
        .upload(filePath, webp, { contentType: FABRICA_SITE_STORAGE_CONTENT_TYPE, upsert: true });
      if (error) throw error;
      const publicUrl = supabase.storage.from("thumbnails").getPublicUrl(filePath).data.publicUrl;
      onAdd(publicUrl);
      toast.success("Imagen optimizada y añadida sin duplicar el archivo.", { id: toastId });
    } catch (error) {
      console.error("No se pudo optimizar la imagen del sitio", error);
      toast.error("No se pudo subir la imagen. Prueba otro archivo.", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Atalho: usar foto limpa gerada na Fase 3 */}
      {generatedAd && !images.includes(generatedAd) && (
        <button
          onClick={() => onAdd(generatedAd)}
          className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2 hover:bg-amber-500/15"
        >
          <Sparkles className="w-4 h-4" /> Agregar la foto limpia del destino (Fase 3) al banco
        </button>
      )}

      {/* Grid de imagens */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/20 group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 flex flex-col justify-between p-1.5 pointer-events-none">
                <div className="flex justify-between items-center w-full pointer-events-auto">
                  <button
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `banco-imagen-${Date.now()}.png`;
                      a.click();
                    }}
                    className="p-1.5 rounded-lg bg-black/80 backdrop-blur-md text-emerald-400 hover:bg-black hover:scale-105 active:scale-95 transition-all"
                    title="Descargar imagen original"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemove(url)}
                    className="p-1.5 rounded-lg bg-black/80 backdrop-blur-md text-red-400 hover:bg-black hover:scale-105 active:scale-95 transition-all"
                    title="Eliminar imagen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-white/40 italic text-center py-4 border border-dashed border-white/10 rounded-xl">
          Ninguna imagen aún. Añade abajo 👇
        </div>
      )}

      {/* Cole link */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Pega el enlace de la imagen (https://...)"
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40"
          />
        </div>
        <button
          onClick={() => {
            const safeUrl = normalizeExternalImageUrl(newUrl);
            if (!safeUrl) {
              toast.error("Pega un enlace de imagen válido que empiece con https:// o http://.");
              return;
            }
            onAdd(safeUrl);
            setNewUrl("");
          }}
          disabled={!newUrl.trim()}
          className="px-4 py-2 rounded-lg bg-white/[0.08] text-white text-sm font-semibold hover:bg-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Añadir
        </button>
      </div>

      {/* Upload local */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploadingImage}
        className="w-full py-2.5 rounded-lg border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 text-xs font-semibold flex items-center justify-center gap-2"
      >
        <Upload className="w-3.5 h-3.5" /> {uploadingImage ? "Optimizando imagen..." : "O sube desde tu computadora"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
};

const PublishSiteCardES = ({
  html,
  onBack,
  onNext,
}: {
  html: string;
  onBack: () => void;
  onNext: () => void;
}) => {
  const { state, update } = useFabricaContext();
  const { user } = useAuth();

  const [isPublishing, setIsPublishing] = useState(false);
  // ── PUBLICACIÓN EN 1 CLIC EN CANVA VIAGEM ──
  const [canvaViagemSubdomain, setCanvaViagemSubdomain] = useState<string>(() => buildSiteSlug(state.agencyName || ""));
  const subdomain = canvaViagemSubdomain;
  const setSubdomain = setCanvaViagemSubdomain;
  const finalSubdomain = buildSiteSlug(canvaViagemSubdomain || state.agencyName || "");

  useEffect(() => {
    if (state.siteContent.canvaViagemUrl) {
      setCanvaViagemSubdomain(extractCanvaSiteSlug(state.siteContent.canvaViagemUrl));
    } else {
      setCanvaViagemSubdomain(buildSiteSlug(state.agencyName || ""));
    }

  }, [state.projectId, state.siteContent.canvaViagemUrl, state.agencyName]);

  const handleDownload = () => {
    try {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const slug = (state.agencyName || "site").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "site";
      a.download = `${slug}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };


  const handleDirectPublish = async () => {
    if (!user?.id) {
      toast.error("Inicia sesión para publicar.");
      return;
    }

    const cleanSlug = buildSiteSlug(finalSubdomain);
    const slugError = validateCanvaSiteSlug(cleanSlug);
    if (slugError) {
      const messages = {
        too_short: "El enlace debe tener al menos 3 caracteres.",
        too_long: "El enlace debe tener como máximo 63 caracteres.",
        invalid: "Usa solamente letras, números y guiones, sin guion al inicio ni al final.",
        reserved: "Este subdominio está reservado. Elige otro nombre.",
      } as const;
      toast.error(messages[slugError]);
      return;
    }

    setIsPublishing(true);
    try {
      const result = await publishFabricaSite({
        state,
        userId: user.id,
        slug: cleanSlug,
        locale: "es",
      });
      update({
        projectId: result.projectId,
        crmForm: result.state.crmForm,
        logoBase64: result.state.logoBase64,
        selectedPackages: result.state.selectedPackages,
        siteContent: result.state.siteContent,
      });
      toast.success(
        <div>
          ¡Sitio publicado con éxito! 🎉
          <br />
          Tu enlace es: <b>{result.liveUrl}</b>
        </div>,
        { duration: 6000 }
      );
    } catch (err: any) {
      const raw = String(err?.message || "");
      if (raw.includes("another_owner") || raw.includes("site_slug_unavailable")) {
        toast.error("Esta dirección ya pertenece a otra cuenta. Elige otro subdominio.");
      } else if (raw.includes("another_project") || raw.includes("site_slug_belongs_to_another_project")) {
        toast.error("Esta dirección ya está vinculada a otro proyecto tuyo. Elige otro subdominio.");
      } else if (/network|fetch/i.test(raw)) {
        toast.error("Sin conexión con internet. Revisa tu red e inténtalo de nuevo.");
      } else if (raw.includes("site_publish_schema_sync_pending")) {
        toast.error("La publicación se está actualizando. Espera unos segundos e inténtalo de nuevo; tu sitio anterior sigue activo.");
      } else {
        toast.error("No fue posible publicar el sitio ahora. Inténtalo de nuevo en unos instantes.");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const siteUrl = normalizeCanvaSiteUrl(state.siteContent.canvaViagemUrl || "");
  const isPublished = !!siteUrl;

  return (
    <div
      className="rounded-3xl p-6 sm:p-8 border-2 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${UI_ACCENT_SOFT}, #FCD34D08)`,
        borderColor: UI_ACCENT_BORDER,
        boxShadow: `0 20px 60px ${UI_ACCENT_SHADOW}`,
      }}
    >
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: UI_ACCENT }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              ¡Publicar Sitio!
            </h3>
            <p className="text-xs sm:text-sm text-white/60 font-semibold">
              Tu sitio en vivo con 1 clic
            </p>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm">
          <p className="text-[13px] text-white/80 leading-relaxed font-medium">
            Acabamos de lanzar la publicación automática. ¡Elige un enlace y presiona publicar!
          </p>
        </div>

        {/* PUBLICACIÓN DIRECTA */}
        <div 
          className="my-4 p-6 rounded-2xl border-2 backdrop-blur-xl transition-all relative overflow-hidden text-left"
          style={{ 
            borderColor: isPublished ? "#10B98188" : UI_ACCENT_BORDER,
            background: isPublished 
              ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,0,0,0.4))"
              : "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(0,0,0,0.4))",
            boxShadow: isPublished ? "0 10px 30px rgba(16,185,129,0.1)" : "none"
          }}
        >
          {/* Se o site estiver publicado */}
          {isPublished && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">¡Tu sitio está en línea! 🌟</div>
                <a 
                  href={siteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white hover:underline flex items-center gap-1.5 mt-0.5 group"
                >
                  {siteUrl.replace("https://", "")}
                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                </a>
              </div>
              <a 
                href={siteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all text-center"
              >
                Acceder al Sitio
              </a>
            </div>
          )}

          {/* Form de Publicação */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2 flex justify-between">
                <span>Enlace personalizado</span>
                {isPublished && <span className="text-emerald-400 text-[10px]">Alterar mudará el enlace</span>}
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(buildSiteSlug(e.target.value))}
                  maxLength={63}
                  placeholder="nombre-de-tu-agencia"
                  className="flex-1 bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white font-semibold outline-none focus:border-white/30 rounded-l-lg border-r-0 text-right"
                  style={{ textAlign: "right" }}
                />
                <span className="px-3 py-2 bg-white/[0.04] border border-white/10 rounded-r-lg text-xs text-white/40 select-none border-l-0">
                  .canvaviagem.com
                </span>
              </div>
              <p className="text-[10px] text-white/40 mt-1">Usa solo letras minúsculas, números y guiones.</p>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Google Analytics ID (Opcional):
                </label>
                <input
                  type="text"
                  value={state.ga4Id || ""}
                  onChange={(e) => update({ ga4Id: e.target.value })}
                  placeholder="Ex: G-XXXXXXXXXX"
                  className="w-full bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white rounded-lg outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
              <button
                onClick={handleDirectPublish}
                disabled={isPublishing}
                className="py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                style={{ backgroundColor: UI_ACCENT, color: "#000000" }}
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>Publicar en Canva Viagem</>
                )}
              </button>

              <button
                onClick={handleDirectPublish}
                disabled={isPublishing}
                className="py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm border"
                style={{ borderColor: UI_ACCENT_BORDER, backgroundColor: "transparent" }}
              >
                {isPublishing ? "Actualizando..." : "Actualizar sitio"}
              </button>

              <button
                onClick={handleDownload}
                disabled={isPublishing}
                className="py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm border border-white/15"
              >
                <Download className="w-4 h-4" /> Descargar HTML
              </button>
            </div>

            <p className="text-[11px] text-white/50 mt-4 leading-relaxed">
              El HTML publicado se guarda en Supabase y el subdominio se entrega mediante la capa Cloudflare de Canva Viagem. No necesitas configurar un alojamiento externo.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 flex justify-center">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white/80 hover:text-white hover:bg-white/[0.10] transition-all text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Volver arriba
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onBack}
            className="flex-1 py-4 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 font-bold hover:bg-white/[0.08] transition-all"
          >
            Volver
          </button>
          <button
            onClick={onNext}
            className="flex-[2] py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            style={{ 
              background: UI_ACCENT,
              color: "#000000",
              border: "none",
              boxShadow: `0 0 20px ${UI_ACCENT_SHADOW}`
            }}
          >
            Siguiente Paso: Diagnóstico <Rocket className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const FabricaCard = ({
  title,
  children,
  sectionId,
}: {
  title: string;
  children: React.ReactNode;
  sectionId?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const triggerId = `${contentId}-trigger`;

  return (
    <div
      data-fabrica-card={sectionId}
      className="bg-white/[0.03] border rounded-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden"
      style={{
        borderColor: isOpen ? UI_ACCENT_BORDER : "rgba(255, 255, 255, 0.06)",
        boxShadow: isOpen ? `0 10px 30px ${UI_ACCENT_SHADOW}` : "none",
      }}
    >
      {/* Header clicável para abrir/fechar */}
      <button
        id={triggerId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center justify-between p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300/70 select-none group"
      >
        <h3
          className="text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2"
          style={{ color: isOpen ? UI_ACCENT : "rgba(255, 255, 255, 0.6)" }}
        >
          {isOpen && (
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
              style={{ backgroundColor: UI_ACCENT }}
            />
          )}
          {title}
        </h3>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 text-sm font-black"
          style={{
            borderColor: isOpen ? UI_ACCENT_BORDER : "rgba(255, 255, 255, 0.15)",
            backgroundColor: isOpen ? UI_ACCENT_SOFT : "transparent",
            color: isOpen ? UI_ACCENT : "rgba(255, 255, 255, 0.6)",
          }}
        >
          {isOpen ? "–" : "+"}
        </div>
      </button>

      {/* Conteúdo animado/renderizado se aberto */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!isOpen}
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[4000px] opacity-100 p-6 pt-0 border-t border-white/[0.04]" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        {children}
      </div>
    </div>
  );
};


