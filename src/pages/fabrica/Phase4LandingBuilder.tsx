import { useState, useRef, useEffect, useId } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFabricaContext, type AgencyType, type Pacote, type Depoimento, type SocialLink, type SocialType } from "@/hooks/useFabricaContext";
import { supabase } from "@/integrations/supabase/client";
import { downloadLandingHTML, buildLandingHTML } from "@/lib/fabrica-html-export";
import { CloudSaveIndicator } from "@/components/fabrica/CloudSaveIndicator";
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
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import type { SectionVisibility } from "@/hooks/useFabricaContext";
import {
  PACKAGE_AVAILABILITY_OPTIONS,
  PACKAGE_SEGMENT_OPTIONS,
  buildPackageSlug,
  createUniquePackageSlug,
  getPackageGuidance,
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
const SITE_SECTION_LABELS: Record<string, string> = {
  header: "Cabeçalho e menu",
  hero: "Topo do site",
  processo: "Como funciona",
  destinos: "Destinos e pacotes",
  porQue: "Equipe e agência",
  depoimentos: "Depoimentos",
  orcamento: "Orçamento",
  faq: "Perguntas frequentes",
  finalCta: "Chamada final",
  mapa: "Mapa e endereço",
  footer: "Rodapé",
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
    throw new Error("Não foi possível preparar a imagem.");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const webpBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!webpBlob) throw new Error("Este navegador não conseguiu converter a imagem para WebP.");
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

// Sugestões padrão de fotos para a seção "Equipe / Agência"
const TEAM_PRESET_IMAGES = [
  "https://img.freepik.com/fotos-gratis/voce-esta-pronto-para-suas-ferias-representante-de-vendas-dando-passaportes-e-passagens-de-aviao-para-uma-jovem-e-um-homem-para-sua-viagem-de-ferias-na-agencia-de-viagens_662251-2215.jpg?semt=ais_hybrid&w=740&q=80",
  "https://img.freepik.com/fotos-premium/agente-de-viagens-de-frente-sentada-atras-do-seu-local-de-trabalho-a-brincar-com-um-aviao-de-brinquedo_926199-2841227.jpg?semt=ais_hybrid&w=740&q=80",
  "https://img.freepik.com/fotos-premium/retrato-de-um-agente-de-viagens-em-uma-agencia-de-viagens-com-passaportes-e-passagens_199620-11415.jpg",
  "https://img.freepik.com/fotos-gratis/pessoas-em-filmagens-medias-na-agencia-de-viagens_52683-136429.jpg?semt=ais_hybrid&w=740&q=80",
];

const SOCIAL_OPTIONS: Array<{ type: SocialType; label: string; icon: string; placeholder: string }> = [
  { type: "instagram", label: "Instagram", icon: "📸", placeholder: "@suaagencia ou instagram.com/suaagencia" },
  { type: "facebook", label: "Facebook", icon: "f", placeholder: "facebook.com/suaagencia" },
  { type: "tiktok", label: "TikTok", icon: "♪", placeholder: "tiktok.com/@suaagencia" },
  { type: "youtube", label: "YouTube", icon: "▶", placeholder: "youtube.com/@suaagencia" },
  { type: "google", label: "Google", icon: "G", placeholder: "Perfil no Google ou Google Maps" },
  { type: "linkedin", label: "LinkedIn", icon: "in", placeholder: "linkedin.com/company/suaagencia" },
  { type: "x", label: "X/Twitter", icon: "𝕏", placeholder: "x.com/suaagencia" },
  { type: "site", label: "Site próprio", icon: "🌐", placeholder: "https://suaagencia.com.br" },
];

const normalizeSocialUrl = (type: SocialType, value: string) => {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const clean = v.replace(/^@/, "").replace(/^\/+/, "");
  if (type === "instagram") return `https://instagram.com/${clean.replace(/^instagram\.com\//, "")}`;
  if (type === "facebook") return `https://facebook.com/${clean.replace(/^facebook\.com\//, "")}`;
  if (type === "tiktok") return `https://tiktok.com/@${clean.replace(/^tiktok\.com\/@?/, "")}`;
  if (type === "youtube") return clean.includes("youtube.com") ? `https://${clean}` : `https://youtube.com/@${clean}`;
  if (type === "linkedin") return clean.includes("linkedin.com") ? `https://${clean}` : `https://linkedin.com/company/${clean}`;
  if (type === "x") return `https://x.com/${clean.replace(/^(x|twitter)\.com\//, "")}`;
  if (type === "google") return clean.includes("google.") || clean.includes("maps.") ? `https://${clean}` : `https://www.google.com/search?q=${encodeURIComponent(v)}`;
  return `https://${clean}`;
};

export const Phase4LandingBuilder = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  const { state, update, systemUpdate, reset, undo, redo, switchProject, canUndo, canRedo, isHydrated } = useFabricaContext();
  const { user } = useAuth();
  const { data: savedProjects } = useDiagnosticos();
  const [previewing, setPreviewing] = useState(true);
  const [downloadCount, setDownloadCount] = useState(0);
  const [autoSyncDone, setAutoSyncDone] = useState(false);
  const [autoSyncFields, setAutoSyncFields] = useState<string[]>([]);
  const [pickingHeroImage, setPickingHeroImage] = useState(false);
  const [pendingProjectSwitch, setPendingProjectSwitch] = useState<DiagnosticoSalvo | null>(null);
  const [isSwitchingProject, setIsSwitchingProject] = useState(false);

  const loadSavedProject = async (project: DiagnosticoSalvo) => {
    const targetName = project.agency_name || "Sem nome";
    const isRecovered = project.source === "published_recovery";
    setIsSwitchingProject(true);
    try {
      await switchProject(
        { ...project.state_snapshot, projectId: project.id },
        { preserveCurrentPhase: true },
      );
      setPendingProjectSwitch(null);
      if (isRecovered) toast.warning(`Site legado "${targetName}" recuperado. Revise os dados antes de republicar.`);
      else toast.success(`Projeto "${targetName}" carregado.`);
    } catch {
      toast.error("Não foi possível salvar o projeto atual. A troca foi cancelada para proteger suas alterações.");
    } finally {
      setIsSwitchingProject(false);
    }
  };

  const requestProjectSwitch = (project: DiagnosticoSalvo) => {
    if (project.id === state.projectId) {
      toast.info("Este projeto já está aberto.");
      return;
    }
    if (!state.agencyName) {
      void loadSavedProject(project);
      return;
    }
    setPendingProjectSwitch(project);
  };

  // ── ESTADOS E REF PARA EDIÇÃO VISUAL DIRETA E INTUITIVA NA PRÉVIA ──
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

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalReturnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const animationFrame = window.requestAnimationFrame(() => {
      if (globalPickingImage) imageModalCloseRef.current?.focus();
      else colorModalCloseRef.current?.focus();
    });

    const handleModalKeyDown = (event: KeyboardEvent) => {
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
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleModalKeyDown);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleModalKeyDown);
      document.body.style.overflow = previousBodyOverflow;
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
      toast.success("Logo atualizada com sucesso!");
    } else if (activeImageEdit.type === "hero") {
      update({ siteContent: { ...state.siteContent, heroImageUrl: url, galleryImages } });
      toast.success("Banner principal atualizado com sucesso!");
    } else if (activeImageEdit.type === "about") {
      update({ siteContent: { ...state.siteContent, aboutImageUrl: url, galleryImages } });
      toast.success("Foto da equipe/empresa atualizada!");
    } else if (activeImageEdit.type === "package" && activeImageEdit.packageId) {
      update({
        selectedPackages: state.selectedPackages.map((pacote) =>
          pacote.id === activeImageEdit.packageId ? { ...pacote, imageUrl: url } : pacote,
        ),
        siteContent: { ...state.siteContent, galleryImages },
      });
      toast.success("Foto do pacote atualizada com sucesso!");
    }

    setGlobalPickingImage(false);
    setActiveImageEdit(null);
    setActivePackagePreviewId(null);
  };

  const iframeScrollY = useRef(0);

  // Bind dos eventos de clique no iframe para edição visual em tempo real
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.head || !doc.body) return;
      if (doc.documentElement.dataset.fabricaEditorInitialized === "true") return;
      doc.documentElement.dataset.fabricaEditorInitialized = "true";
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

      // Injeta estilos de hover, focus e indicador visual de edição
      const style = doc.createElement("style");
      style.innerHTML = `
        [data-visual-editable] {
          cursor: pointer !important;
          transition: outline-color 0.18s ease, background-color 0.18s ease !important;
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

      // Fundos clicáveis: abre o editor da seção sem interferir em links ou no formulário.
      doc.querySelectorAll("header.site-header, section, footer").forEach((section) => {
        section.setAttribute("data-fabrica-color-section", "true");
        const sectionKey = section.getAttribute("data-site-section") || "site";
        const button = doc.createElement("button");
        button.type = "button";
        button.className = "fabrica-color-btn";
        button.textContent = "Editar fundo";
        button.setAttribute("aria-label", `Editar o fundo de ${SITE_SECTION_LABELS[sectionKey] || "esta seção"}`);
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
          toast.error("Não foi possível localizar este pacote no editor.");
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

      // No editor, cada card e o pop-up recebem um atalho para o mesmo pacote sincronizado.
      doc.querySelectorAll(".dest-card").forEach((card) => {
        const packageId = card.getAttribute("data-package-id") || "";
        const packageIndex = Number(card.getAttribute("data-package-index"));
        const previewButton = doc.createElement("button");
        previewButton.type = "button";
        previewButton.className = "fabrica-package-preview-btn";
        previewButton.textContent = "Ver detalhes";
        previewButton.setAttribute("aria-label", "Visualizar os detalhes deste pacote");
        previewButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          // No editor mobile o modal vive dentro do iframe. Alinhar a prévia
          // antes de abri-lo mantém fechar/editar sempre visíveis.
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
        editButton.textContent = "Editar pacote";
        editButton.setAttribute("aria-label", "Editar todas as informações deste pacote");
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
        editButton.textContent = "Editar informações";
        editButton.setAttribute("aria-label", "Editar as informações deste pacote");
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
        button.setAttribute("title", "Clique para editar o texto · duplo clique para editar as cores da marca");
        button.addEventListener("dblclick", (event) => {
          event.preventDefault();
          event.stopPropagation();
          setActiveColorSection(null);
          setGlobalEditingPalette(true);
        });
      });

      // 1. Textos editáveis (contenteditable)
      const textSelectors = [
        ".brand-name",
        "[data-site-edit-key]",
        ".hero h1",
        ".hero p.lead",
        ".hero .eyebrow",
        ".processo .section-eyebrow",
        ".processo .section-title",
        ".proc-num",
        ".proc-card h3",
        ".proc-card p",
        "#destinos .section-eyebrow",
        "#destinos .section-title",
        ".badge-counter",
        ".equipe .eyebrow",
        ".equipe h2",
        ".equipe p.intro",
        ".feat-icon",
        ".feat h4",
        ".feat p",
        ".orc-info .eyebrow",
        ".orc-info h2",
        ".orc-info p",
        ".contact-item span",
        "footer .foot-desc",
        "footer .foot-brand",
        "footer [data-site-edit-key]",
        "footer [data-site-contact]",
        ".btn",
        ".dest-card h3",
        ".dest-card p",
        ".dest-loc",
        // O CTA do card continua clicável para abrir os detalhes também na prévia.
        // O texto dele segue editável no campo "Botão" do pacote logo abaixo.
        ".price-value",
        ".price-main",
        ".dest-tag",
        ".depo-name",
        ".depo-text",
        ".depo-bg .section-title",
        "#faq .section-title",
        ".final-cta h2",
        ".stat-num",
        ".stat-label",
        "summary",
        ".faq-item p"
      ].join(",");

      const editableTexts = doc.querySelectorAll(textSelectors);
      editableTexts.forEach((el) => {
        // O formulário/CRM e o conteúdo dinâmico do pop-up não são editados "por acidente".
        // O atalho "Editar informações" do próprio pop-up leva ao pacote sincronizado.
        if (el.closest("#lead-modal") || el.closest("#package-modal")) return;
        el.setAttribute("data-visual-editable", "true");
        el.setAttribute("contenteditable", "true");
        
        el.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
        });

        el.addEventListener("blur", () => {
          const textVal = (el as HTMLElement).innerText.trim();
          
          // Hero
          if (el.classList.contains("brand-name")) update({ agencyName: textVal });
          else if (el.getAttribute("data-site-edit-key")) {
            updSite({ [el.getAttribute("data-site-edit-key") as string]: textVal } as any);
          }
          else if (el.tagName === "H1" && el.closest(".hero")) updSite({ heroHeadline: textVal });
          else if (el.classList.contains("lead") && el.closest(".hero")) updSite({ heroSubheadline: textVal });
          else if (el.classList.contains("eyebrow") && el.closest(".hero")) updSite({ heroEyebrow: textVal });
          // Processo
          else if (el.classList.contains("section-eyebrow") && el.closest(".processo")) updSite({ processoEyebrow: textVal });
          else if (el.classList.contains("section-title") && el.closest(".processo")) updSite({ processoTitle: textVal });
          else if (el.closest(".proc-card")) {
            const card = el.closest(".proc-card");
            const allCards = Array.from(doc.querySelectorAll(".proc-card"));
            const idx = allCards.indexOf(card as Element);
            if (idx !== -1) {
              const steps = (state.siteContent.processoSteps || []).map(s => ({ ...s }));
              if (!steps[idx]) steps[idx] = { num: "", title: "", desc: "" };
              if (el.classList.contains("proc-num")) steps[idx].num = textVal;
              else if (el.tagName === "H3") steps[idx].title = textVal;
              else if (el.tagName === "P") steps[idx].desc = textVal;
              updSite({ processoSteps: steps });
            }
          }
          // Destinos
          else if (el.classList.contains("section-eyebrow") && el.closest("#destinos")) updSite({ destinosEyebrow: textVal });
          else if (el.classList.contains("section-title") && el.closest("#destinos")) updSite({ pacotesTitle: textVal });
          // Equipe
          else if (el.classList.contains("badge-counter")) updSite({ equipeBadge: textVal });
          else if (el.classList.contains("eyebrow") && el.closest(".equipe")) updSite({ equipeEyebrow: textVal });
          else if (el.tagName === "H2" && el.closest(".equipe")) updSite({ equipeTitle: textVal });
          else if (el.classList.contains("intro") && el.closest(".equipe")) updSite({ equipeIntro: textVal });
          else if (el.closest(".feat")) {
            const feat = el.closest(".feat");
            const allFeats = Array.from(doc.querySelectorAll(".feat"));
            const idx = allFeats.indexOf(feat as Element);
            if (idx !== -1) {
              const feats = (state.siteContent.equipeFeatures || []).map(f => ({ ...f }));
              if (!feats[idx]) feats[idx] = { icon: "", title: "", desc: "" };
              if (el.classList.contains("feat-icon")) feats[idx].icon = textVal;
              else if (el.tagName === "H4") feats[idx].title = textVal;
              else if (el.tagName === "P") feats[idx].desc = textVal;
              updSite({ equipeFeatures: feats });
            }
          }
          // Orçamento e Contatos
          else if (el.classList.contains("eyebrow") && el.closest(".orc-info")) updSite({ orcamentoEyebrow: textVal });
          else if (el.tagName === "H2" && el.closest(".orc-info")) updSite({ orcamentoTitle: textVal });
          else if (el.tagName === "P" && el.closest(".orc-info")) updSite({ orcamentoText: textVal });
          else if (el.closest(".contact-item")) {
            const strongLabel = el.closest(".contact-item")?.querySelector("strong")?.innerText?.toLowerCase() || "";
            if (strongLabel.includes("atendimento")) {
              updSite({ atendimentoText: textVal });
            } else if (strongLabel.includes("whatsapp")) {
              const digits = textVal.replace(/\D/g, "");
              const dial = (state.whatsappDialCode || "55").replace(/\D/g, "");
              update({ whatsapp: digits.startsWith(dial) ? digits.slice(dial.length) : digits });
            } else if (strongLabel.includes("e-mail") || strongLabel.includes("email")) {
              update({ agencyEmail: textVal });
            } else if (strongLabel.includes("local") || strongLabel.includes("endereço")) {
              update({ address: textVal });
            }
          }
          // Footer
          else if (el.classList.contains("foot-desc")) updSite({ footerText: textVal });
          else if (el.classList.contains("foot-brand")) update({ agencyName: textVal });
          else if (el.closest("footer") && el.getAttribute("data-site-contact")) {
            const contactType = el.getAttribute("data-site-contact");
            if (contactType === "whatsapp") {
              const digits = textVal.replace(/\D/g, "");
              const dial = (state.whatsappDialCode || "55").replace(/\D/g, "");
              update({ whatsapp: digits.startsWith(dial) ? digits.slice(dial.length) : digits });
            } else if (contactType === "email") update({ agencyEmail: textVal });
            else if (contactType === "address") update({ address: textVal });
          }
          else if (el.closest("footer") && el.getAttribute("data-site-edit-key")) {
            updSite({ [el.getAttribute("data-site-edit-key") as string]: textVal } as any);
          }
          // Títulos, botões e chamadas
          else if (el.classList.contains("section-title") && el.closest(".depo-bg")) updSite({ depoimentosTitle: textVal });
          else if (el.classList.contains("section-title") && el.closest("#faq")) updSite({ faqTitle: textVal });
          else if (el.tagName === "H2" && el.closest(".final-cta")) updSite({ finalCtaTitle: textVal });
          else if (el.classList.contains("btn") && el.closest(".hero")) {
            const heroButtons = Array.from(doc.querySelectorAll(".hero .btn"));
            const index = heroButtons.indexOf(el);
            if (index === 0) updSite({ heroCtaLabel: textVal });
            else if (index === 1) updSite({ heroSecondaryCtaLabel: textVal });
          }
          else if (el.classList.contains("btn") && el.closest(".equipe")) updSite({ equipeCtaLabel: textVal });
          else if (el.classList.contains("form-submit")) updSite({ formSubmitLabel: textVal });
          else if (el.classList.contains("btn") && el.closest(".final-cta")) updSite({ finalCtaLabel: textVal });
          
          // Pacotes dinâmicos
          else if (el.closest(".dest-card")) {
            const destCard = el.closest(".dest-card");
            const pkgId = destCard?.getAttribute("data-package-id") || "";
            if (pkgId && state.selectedPackages.some((item) => item.id === pkgId)) {
              if (el.tagName === "H3") updPacote(pkgId, { title: textVal });
              else if (el.classList.contains("dest-loc")) update({ city: textVal });
              else if (el.tagName === "P") updPacote(pkgId, { description: textVal });
              else if (el.classList.contains("dest-cta")) updPacote(pkgId, { ctaLabel: textVal });
              else if (el.classList.contains("price-value") || el.classList.contains("price-main")) updPacote(pkgId, { price: textVal });
              else if (el.classList.contains("dest-tag")) updPacote(pkgId, { badge: textVal });
            }
          }
          // Depoimentos
          else if (el.closest(".depo-card")) {
            const depoCard = el.closest(".depo-card");
            const rawIndex = depoCard?.getAttribute("data-depo-index");
            const idx = rawIndex === null || rawIndex === undefined ? -1 : Number(rawIndex);
            if (Number.isInteger(idx) && idx >= 0 && state.depoimentos[idx]) {
              if (el.classList.contains("depo-text")) updDepo(idx, { text: textVal });
              else if (el.classList.contains("depo-name")) updDepo(idx, { name: textVal });
            }
          }
          // Perguntas frequentes
          else if (el.closest(".faq-item")) {
            const faqItem = el.closest(".faq-item");
            const rawIndex = faqItem?.getAttribute("data-faq-index");
            const idx = rawIndex === null || rawIndex === undefined ? -1 : Number(rawIndex);
            if (Number.isInteger(idx) && idx >= 0 && state.siteContent.faq[idx]) {
              const faq = state.siteContent.faq.map((item) => ({ ...item }));
              if (el.tagName === "SUMMARY") faq[idx].q = textVal;
              else if (el.tagName === "P") faq[idx].a = textVal;
              updSite({ faq });
            }
          }
          // Stats Banner
          else if (el.closest(".stats-bar > div") || el.classList.contains("stat-num") || el.classList.contains("stat-label")) {
            const statDiv = el.closest(".stats-bar > div");
            if (statDiv) {
              const allStats = Array.from(doc.querySelectorAll(".stats-bar > div"));
              const idx = allStats.indexOf(statDiv as Element);
              if (idx !== -1) {
                const stats = (state.siteContent.stats || [
                  { num: "12+", label: "Anos de Experiência" },
                  { num: "15k+", label: "Viajantes Felizes" },
                  { num: "25", label: "Países Atendidos" },
                  { num: "99%", label: "Satisfação" }
                ]).map(s => ({ ...s }));
                if (!stats[idx]) stats[idx] = { num: "", label: "" };
                if (el.classList.contains("stat-num")) stats[idx].num = textVal;
                else if (el.classList.contains("stat-label")) stats[idx].label = textVal;
                updSite({ stats });
              }
            }
          }
        });
      });

      // 2. Imagens clicáveis/trocáveis
      const imgSelectors = [
        ".brand-logo",
        ".dest-img-wrap img",
        "#package-image",
        ".equipe-img",
        ".hero img",
        ".hero"
      ].join(",");

      const editableImgs = doc.querySelectorAll(imgSelectors);
      editableImgs.forEach((el) => {
        el.setAttribute("data-visual-editable", "true");
        const isInsidePackageCard = Boolean(el.closest(".dest-card"));
        if (!isInsidePackageCard) {
          el.setAttribute("role", "button");
          el.setAttribute("tabindex", "0");
          el.setAttribute("aria-label", "Trocar esta imagem");
        }

        const openImageEditor = (e: Event) => {
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
              const packageId = destCard.getAttribute("data-package-id") || "";
              if (packageId && state.selectedPackages.some((item) => item.id === packageId)) {
                setActiveImageEdit({ type: "package", packageId });
                setGlobalPickingImage(true);
              }
            }
          }
        };

        el.addEventListener("click", openImageEditor);
        if (!isInsidePackageCard) {
          el.addEventListener("keydown", (event) => {
            const keyboardEvent = event as KeyboardEvent;
            if (keyboardEvent.key !== "Enter" && keyboardEvent.key !== " ") return;
            openImageEditor(keyboardEvent);
          });
        }
      });

      // No modo de remoção, captura o clique antes dos editores de texto e imagem.
      // Assim o usuário pode tocar diretamente no conteúdo, sem procurar uma área vazia.
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
        btn.type = "button";
        btn.textContent = "×";
        btn.className = "fabrica-remove-btn";
        btn.title = "Ocultar este elemento";
        btn.setAttribute("aria-label", "Ocultar este elemento do site");
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
              toast.success("Elemento ocultado do site!");
            }
          }
        });
      });
    };

    iframe.addEventListener("load", handleIframeLoad);
    handleIframeLoad(); // dispara uma vez caso já esteja carregado

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
    const SYNC_KEY = `fabrica-phase4-autosync-v2:${user?.id || "local"}:${state.projectId || "draft"}`;
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
    if (!heroDefault || heroDefault === "" || heroDefault === `${state.agencyName} — Sua próxima viagem começa aqui`) {
      const agency = state.agencyName?.trim();
      const headline = agency
        ? `${agency} — ${dest ? `Pacotes para ${dest} e muito mais!` : "Sua próxima viagem começa aqui!"}`
        : dest ? `Sua próxima viagem é ${dest}` : "";
      if (headline) {
        patches["siteContent.heroHeadline"] = headline;
        synced.push("Título principal do site");
      }
    }

    // 2. Hero Subheadline — usa destinos cadastrados
    if (!state.siteContent.heroSubheadline) {
      const ds = (state.destinos || []).filter(Boolean).slice(0, 4);
      if (ds.length > 0) {
        patches["siteContent.heroSubheadline"] = `Roteiros para ${ds.join(", ")} e outros destinos incríveis. Atendimento personalizado e acompanhamento em cada etapa.`;
        synced.push("Subtítulo do site");
      }
    }

    // 3. Pacote automático desabilitado aqui (gerenciado pela Fase 3 de forma acumulativa)


    // 4. CTA final — usa WhatsApp/Instagram se disponíveis
    if (!state.siteContent.finalCtaTitle || state.siteContent.finalCtaTitle === "Pronto para sua próxima viagem?") {
      if (dest) {
        patches["siteContent.finalCtaTitle"] = `Vai para ${dest}? Fala comigo agora!`;
        synced.push("CTA final");
      }
    }

    // 🧠 5. CONTINUIDADE DO DIAGNÓSTICO (Ponto 3):
    // Se o nível do usuário é baixo (menos que 3), o sistema INTUI que falta autoridade.
    // Logo, ele OBRIGA e ATIVA automaticamente os depoimentos e a sessão 'Por que Nós'.
    if (state.level && state.level < 3) {
      if (!state.siteContent.sections?.depoimentos) {
        patches["siteContent.sections.depoimentos"] = true;
        synced.push("Blindagem de Autoridade (Depoimentos Ativados)");
      }
      if (!state.siteContent.sections?.porQue) {
        patches["siteContent.sections.porQue"] = true;
        synced.push("Blindagem de Autoridade (Diferenciais Ativados)");
      }
    }

    // 6. Sincronização Inteligente por Tipo de Agência
    const type = state.agencyType;
    const isAutonoma = type === "autonoma";
    const isCorp = type === "corporativa";
    const isLuxo = type === "luxo";

    if (!state.siteContent.heroEyebrow || state.siteContent.heroEyebrow === "Consultoria Premium de Viagens") {
      let eyebrow = "Consultoria Premium de Viagens";
      if (isAutonoma) eyebrow = "Agente de Viagens Especialista";
      if (isCorp) eyebrow = "Gestão de Viagens Corporativas";
      if (isLuxo) eyebrow = "Viagens de Luxo Sob Medida";
      if (state.niche === "cruzeiro") eyebrow = "Especialista em Cruzeiros";
      patches["siteContent.heroEyebrow"] = eyebrow;
      synced.push("Identidade do Nicho/Agência");
    }

    if (!state.siteContent.equipeEyebrow || state.siteContent.equipeEyebrow === "Nossa equipe") {
      patches["siteContent.equipeEyebrow"] = isAutonoma ? "Sobre Mim" : "Nossa equipe";
    }

    if (!state.siteContent.equipeTitle || state.siteContent.equipeTitle === "Uma equipe dedicada exclusivamente a você") {
      patches["siteContent.equipeTitle"] = isAutonoma 
        ? "Atendimento dedicado exclusivamente a você" 
        : isCorp 
        ? "Especialistas focados na sua empresa" 
        : "Uma equipe dedicada exclusivamente a você";
    }

    if (!state.siteContent.equipeIntro || state.siteContent.equipeIntro.startsWith("Cada viagem começa com uma conversa")) {
      patches["siteContent.equipeIntro"] = isAutonoma
        ? "Meu foco é planejar cada detalhe da sua viagem. Conheço os destinos de perto e cuido de tudo para o seu perfil e momento."
        : isCorp
        ? "Ajudamos sua empresa a economizar e ter total segurança nas viagens de negócios. Atendimento rápido e eficiente."
        : "Cada viagem começa com uma conversa real. Nossa equipe de especialistas conhece os destinos de perto — cada detalhe pensado para o seu perfil, seus sonhos e o seu momento.";
    }

    if (!state.siteContent.processoTitle || state.siteContent.processoTitle === "Sua viagem dos sonhos em 3 passos") {
      patches["siteContent.processoTitle"] = isCorp 
        ? "Gestão inteligente em 3 passos" 
        : "Sua viagem dos sonhos em 3 passos";
    }

    if (synced.length === 0) return;

    // Aplica todos os patches de uma vez ao contexto compartilhado
    const sitePatches: Partial<typeof state.siteContent> = {};
    const sectionPatches: Partial<SectionVisibility> = {};
    const rootPatches: any = {};

    for (const [k, v] of Object.entries(patches)) {
      if (k.startsWith("siteContent.sections.")) {
        const sectionKey = k.replace("siteContent.sections.", "") as keyof SectionVisibility;
        sectionPatches[sectionKey] = Boolean(v);
      } else if (k.startsWith("siteContent.")) {
        const field = k.replace("siteContent.", "") as any;
        sitePatches[field] = v;
      } else {
        rootPatches[k] = v;
      }
    }

    if (Object.keys(sitePatches).length > 0 || Object.keys(sectionPatches).length > 0) {
      rootPatches.siteContent = {
        ...state.siteContent,
        ...sitePatches,
        sections: {
          ...state.siteContent.sections,
          ...sectionPatches,
        },
      };
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
    const SYNC_KEY = `fabrica-phase4-autosync-v2:${user?.id || "local"}:${state.projectId || "draft"}`;
    localStorage.removeItem(SYNC_KEY);
    const currentPhase = state.currentPhase;
    reset();
    systemUpdate({ currentPhase });
    setAutoSyncDone(false);
    setAutoSyncFields([]);
    toast.success("Novo projeto em branco criado!");
  };

  // Pacotes
  const addPacote = () => {
    const packageId = String(Date.now());
    const novo: Pacote = {
      id: packageId,
      title: "Novo pacote",
      description: "Descreva o que está incluso",
      price: "R$ 0,00",
      imageUrl: "",
      ctaLabel: "Quero esse",
      slug: buildPackageSlug(`novo-pacote-${packageId}`, packageId),
      segment: suggestPackageSegment(state.agencyType),
    };
    update({ selectedPackages: [...state.selectedPackages, novo] });
  };
  const updPacote = (id: string, patch: Partial<Pacote>) => {
    let normalizedPatch = patch;
    if (typeof patch.slug === "string") {
      const usedSlugs = state.selectedPackages
        .filter((item) => item.id !== id)
        .map((item) => item.slug || buildPackageSlug(item.title, item.id));
      normalizedPatch = {
        ...patch,
        slug: createUniquePackageSlug(patch.slug, usedSlugs, id),
      };
    }
    update({ selectedPackages: state.selectedPackages.map((p) => (p.id === id ? { ...p, ...normalizedPatch } : p)) });
  };
  const delPacote = (id: string) => {
    update({ selectedPackages: state.selectedPackages.filter((p) => p.id !== id) });
  };

  // Depoimentos
  const addDepo = () => update({ depoimentos: [...state.depoimentos, { name: "Cliente feliz", text: "Atendimento incrível!" }] });
  const updDepo = (i: number, patch: Partial<Depoimento>) => {
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
    toast.success("Imagem adicionada ao banco!");
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

  const addSocialLink = (type: SocialType) => {
    const exists = state.socialLinks?.some((link) => link.type === type && !link.url);
    if (exists) return;
    const next: SocialLink = { id: `${type}_${Date.now()}`, type, url: type === "instagram" ? state.instagram || "" : "" };
    update({ socialLinks: [...(state.socialLinks || []), next] });
  };

  const updateSocialLink = (id: string, patch: Partial<SocialLink>) => {
    update({ socialLinks: (state.socialLinks || []).map((link) => (link.id === id ? { ...link, ...patch } : link)) });
  };

  const removeSocialLink = (id: string) => {
    update({ socialLinks: (state.socialLinks || []).filter((link) => link.id !== id) });
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
  const activeSiteTemplate = getSiteTemplateDefinition(state.siteContent.templateId);

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

  const handleDownload = () => {
    setDownloadCount((c) => c + 1);
    downloadLandingHTML(state, downloadCount + 1, user?.id);
    toast.success(`Versão ${downloadCount + 1} baixada! O arquivo HTML está pronto.`);
  };

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Shortcut Shift+Ctrl+P to toggle Mobile Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        setPreviewMode(prev => {
          const next = prev === 'desktop' ? 'mobile' : 'desktop';
          toast.success(next === 'mobile' ? "Modo Mobile (iPhone) Ativado! 📱" : "Modo Computador Ativado! 💻");
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="max-w-3xl lg:max-w-[1550px] mx-auto transition-all duration-300">
      <ProjectSwitchDialog
        open={Boolean(pendingProjectSwitch)}
        currentName={state.agencyName || "Sem nome"}
        targetName={pendingProjectSwitch?.agency_name || "Sem nome"}
        busy={isSwitchingProject}
        onCancel={() => !isSwitchingProject && setPendingProjectSwitch(null)}
        onConfirm={() => pendingProjectSwitch && void loadSavedProject(pendingProjectSwitch)}
      />
      {/* ── Indicador de salvamento na nuvem ── */}
      <div className="flex justify-end mb-3">
        <CloudSaveIndicator />
      </div>
      {/* ── SELETOR DE PROJETO PERMANENTE — Sempre visível independente do estado ── */}
      <div className="rounded-2xl p-3 border bg-white/[0.03] border-white/10 flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <span className="text-base flex-shrink-0">📂</span>
        <div className="w-full flex-1 min-w-0">
          <p className="text-[10px] text-white/40 mb-1.5 font-semibold uppercase tracking-wider break-words">
            Editando site: <span className="text-white/70 normal-case font-bold">{state.agencyName || "Sem nome"}</span>
            {state.siteContent?.canvaViagemUrl && (
              <a href={normalizeCanvaSiteUrl(state.siteContent.canvaViagemUrl)} target="_blank" rel="noopener noreferrer"
                className="block sm:inline sm:ml-2 break-all text-emerald-400 hover:text-emerald-300 transition-colors">
                ↗ {state.siteContent.canvaViagemUrl}
              </a>
            )}
          </p>
          {/* ✅ CORREÇÃO CRÍTICA: seletor sempre visível para TODOS os projetos salvos */}
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
              <option value="" className="bg-zinc-900">↕ Trocar projeto / Carregar outro site salvo...</option>
              {savedProjects.map((p) => {
                const snap = p.state_snapshot as any;
                const pkgCount = snap?.selectedPackages?.length || 0;
                const url = snap?.siteContent?.canvaViagemUrl || "";
                const isCurrent = p.id === state.projectId;
                const isRecovered = p.source === "published_recovery";
                const date = new Date(p.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
                return (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                    {isCurrent ? "● " : ""}{p.agency_name || "Sem Nome"}{isRecovered ? " • Recuperado" : ""}{url ? ` — ${url}` : ""} • {pkgCount} pacote{pkgCount !== 1 ? "s" : ""} • {date}
                  </option>
                );
              })}
            </select>
          )}
        </div>
        <button
          onClick={resetSiteToBlank}
          className="w-full sm:w-auto flex-shrink-0 text-[10px] font-bold text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 rounded-lg px-3 py-1.5 transition-all whitespace-nowrap"
          title="Limpar tudo e começar um novo site do zero"
        >
          Criar Novo Site
        </button>
      </div>

      <SiteTemplateSelector
        selected={state.siteContent.templateId}
        onSelect={(templateId) => {
          updSite({ templateId });
          toast.success(`Modelo ${getSiteTemplateDefinition(templateId).copy.pt.label} aplicado na prévia.`);
        }}
        primaryColor={state.primaryColor}
        secondaryColor={state.secondaryColor}
        backgroundColor={state.backgroundColor}
        heroImageUrl={state.siteContent.heroImageUrl}
      />

      {/* ── Banner de Auto-Sync (informativo, não bloqueia o seletor) ── */}
      {autoSyncDone && autoSyncFields.length > 0 && (
        <div className="rounded-2xl p-4 border bg-emerald-500/10 border-emerald-500/25 flex items-start gap-3 mb-4">
          <div className="text-2xl flex-shrink-0">✅</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white mb-1">
              Site pré-preenchido com seus dados da Fábrica!
            </div>
            <p className="text-[11px] text-white/60 leading-snug">
              Importamos automaticamente: <strong className="text-emerald-300">{autoSyncFields.join(" · ")}</strong>.
              Você pode editar qualquer campo diretamente na prévia abaixo ou nas configurações.
            </p>
          </div>
        </div>
      )}



      {/* Grid lateral */}
      <div className="flex flex-col-reverse gap-8 items-stretch">
        {/* Painel Esquerdo: Opções de Configuração (5 colunas em lg) */}
        <div className="w-full space-y-6">
          {/* Publicação oficial do site (movida para o topo) */}
          <PublishSiteCard html={previewHTML} onBack={onBack} onNext={onNext} />

          <div className="border-b border-white/10 pb-4 pt-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-400" />
              ⚙️ Ajustes Finos e Configurações Avançadas do Site:
            </h4>
          </div>

            <FabricaCard title="📦 Pacotes oferecidos" sectionId="packages">
              <FieldText
                label="Título da seção"
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
                  <Plus className="w-4 h-4" /> Adicionar pacote
                </button>
              </div>
            </FabricaCard>

          <div className="space-y-6">
            <FabricaCard title="Paleta da marca">
              <BrandPaletteEditor
                primaryColor={state.primaryColor}
                secondaryColor={state.secondaryColor}
                backgroundColor={state.backgroundColor || "#F4F6F9"}
                onChange={(patch) => update(patch)}
              />
            </FabricaCard>

            <FabricaCard title="📍 Endereço e Mapa">
              <div className="space-y-3">
                <FieldText
                  label="Endereço da Agência"
                  value={state.address || ""}
                  onChange={(v) => update({ address: v })}
                  placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                />

              </div>
            </FabricaCard>

            <FabricaCard title="📊 Configurações de Rastreamento">
              <div className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
                      Meta Pixel ID (Opcional)
                    </label>
                    <input
                      type="text"
                      value={state.metaPixelId || ""}
                      onChange={(e) => update({ metaPixelId: e.target.value })}
                      placeholder="Ex: 123456789012345"
                      className="w-full bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm text-white rounded-lg outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
                      Google Analytics ID (Opcional)
                    </label>
                    <input
                      type="text"
                      value={state.ga4Id || ""}
                      onChange={(e) => update({ ga4Id: e.target.value })}
                      placeholder="Ex: G-XXXXXXXXXX"
                      className="w-full bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm text-white rounded-lg outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </FabricaCard>

            <FabricaCard title="🌐 Redes Sociais e Canais">
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SOCIAL_OPTIONS.map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => addSocialLink(option.type)}
                      className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:border-white/25 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="text-sm">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {(state.socialLinks || []).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-xs text-white/40 text-center">
                      Clique em uma rede acima para adicionar o link no site.
                    </div>
                  ) : (
                    (state.socialLinks || []).map((link) => {
                      const option = SOCIAL_OPTIONS.find((item) => item.type === link.type) || SOCIAL_OPTIONS[0];
                      return (
                        <div key={link.id} className="grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] gap-2 items-center rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <select
                            value={link.type}
                            onChange={(e) => updateSocialLink(link.id, { type: e.target.value as SocialType, url: "" })}
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                          >
                            {SOCIAL_OPTIONS.map((item) => (
                              <option key={item.type} value={item.type} className="bg-zinc-900">
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <input
                            value={link.url}
                            onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                            onBlur={(e) => updateSocialLink(link.id, { url: normalizeSocialUrl(link.type, e.target.value) })}
                            placeholder={option.placeholder}
                            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/30"
                          />
                          <button
                            type="button"
                            onClick={() => removeSocialLink(link.id)}
                            className="p-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 justify-self-start sm:justify-self-auto"
                            aria-label="Remover rede social"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </FabricaCard>

            <FabricaCard title="👁️ Seções do site">

              <div className="flex flex-col gap-2">
                {(() => {
                  const sectionLabels: Record<string, string> = {
                    hero: "Topo (Hero)",
                    processo: "Como funciona (3 passos)",
                    destinos: "Destinos / Pacotes",
                    porQue: "Por que nós / Equipe",
                    depoimentos: "Depoimentos",
                    orcamento: "Formulário de orçamento",
                    faq: "Perguntas Frequentes",
                    finalCta: "CTA Final"
                  };
                  const currentOrder = state.sectionOrder?.length 
                    ? state.sectionOrder.map((key) => key === "ctaFinal" ? "finalCta" : key)
                    : ["hero", "processo", "destinos", "porQue", "depoimentos", "orcamento", "faq", "finalCta"];
                  
                  // Garantir que todas as seções mapeadas existam na ordem (caso estado antigo não as tenha)
                  Object.keys(sectionLabels).forEach(key => {
                    if (!currentOrder.includes(key)) currentOrder.push(key);
                  });

                  const moveSection = (fromIndex: number, toIndex: number) => {
                    if (toIndex < 0 || toIndex >= currentOrder.length || fromIndex === toIndex) return;
                    const newOrder = [...currentOrder];
                    const [movedItem] = newOrder.splice(fromIndex, 1);
                    newOrder.splice(toIndex, 0, movedItem);
                    update({ sectionOrder: newOrder });
                  };

                  return currentOrder.filter(key => !!sectionLabels[key]).map((key, index) => {
                    const on = isVisible(key as keyof SectionVisibility);
                    return (
                      <div
                        key={key}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", index.toString());
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
                          const toIndex = index;
                          if (fromIndex !== toIndex && !isNaN(fromIndex)) {
                            const newOrder = [...currentOrder];
                            const [movedItem] = newOrder.splice(fromIndex, 1);
                            newOrder.splice(toIndex, 0, movedItem);
                            update({ sectionOrder: newOrder });
                          }
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-move select-none ${
                          on
                            ? "bg-white/[0.06] border-white/20 shadow-sm"
                            : "bg-white/[0.02] border-white/5 opacity-70"
                        }`}
                      >
                        <span className="text-xs font-black text-white/30 flex-shrink-0 w-4 text-right">
                          {index + 1}
                        </span>
                        <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle>
                            <circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle>
                          </svg>
                        </div>
                        <span className={`flex-1 truncate text-left text-sm font-semibold ${on ? "text-white" : "text-white/40 line-through"}`}>
                          {sectionLabels[key]}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(index, index - 1);
                            }}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
                            aria-label={`Mover ${sectionLabels[key]} para cima`}
                          >
                            <ChevronUp className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(index, index + 1);
                            }}
                            disabled={index === currentOrder.length - 1}
                            className="p-1.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
                            aria-label={`Mover ${sectionLabels[key]} para baixo`}
                          >
                            <ChevronDown className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSection(key as keyof SectionVisibility);
                          }}
                          className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 ${on ? "text-white" : "text-white/40"}`}
                          aria-label={`${on ? "Ocultar" : "Mostrar"} ${sectionLabels[key]}`}
                          aria-pressed={on}
                        >
                          {on ? <Eye className="w-4 h-4" aria-hidden="true" /> : <EyeOff className="w-4 h-4" aria-hidden="true" />}
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </FabricaCard>

            <FabricaCard title="✨ Efeitos Visuais & Campanhas">

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-wider">Efeito Animado</label>
                  <div className="relative">
                    <select
                      value={state.siteContent.animationEffect || "none"}
                      onChange={(e) => updSite({ animationEffect: e.target.value as any })}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#00ff88]/50 transition-colors appearance-none pr-8"
                    >
                      <option value="none" className="bg-zinc-900">Nenhum (Padrão)</option>
                      
                      <optgroup label="📅 Datas Comemorativas">
                        <option value="junina_bandeiras" className="bg-zinc-900">🌽 Festa Junina (Bandeirinhas)</option>
                        <option value="junina_baloes" className="bg-zinc-900">🌽 Festa Junina (Balões)</option>
                        <option value="junina_fagulhas" className="bg-zinc-900">🔥 Festa Junina (Fagulhas)</option>
                        <option value="natal_luzes" className="bg-zinc-900">🎄 Especial Natal (Luzes)</option>
                        <option value="natal_estrela" className="bg-zinc-900">⭐ Especial Natal (Estrela Guia)</option>
                        <option value="reveillon_fogos" className="bg-zinc-900">🎆 Ano Novo (Micro-Fogos)</option>
                        <option value="reveillon_poeira" className="bg-zinc-900">✨ Ano Novo (Poeira de Ouro)</option>
                        <option value="carnaval_mascaras" className="bg-zinc-900">🎭 Carnaval (Máscaras Flutuantes)</option>
                        <option value="pascoa_orelhas" className="bg-zinc-900">🐰 Páscoa (Orelhas Curiosas)</option>
                        <option value="pascoa_pegadas" className="bg-zinc-900">🐾 Páscoa (Pegadas de Coelho)</option>
                        <option value="neve" className="bg-zinc-900">❄️ Queda de Neve (Inverno)</option>
                        <option value="confete" className="bg-zinc-900">🎉 Chuva de Confetes (Ofertas)</option>
                      </optgroup>

                      <optgroup label="🎯 Temas por Nicho (Ano Todo)">
                        <option value="eco_folhas" className="bg-zinc-900">🏔️ Ecoturismo (Folhas ao Vento)</option>
                        <option value="eco_borboletas" className="bg-zinc-900">🦋 Ecoturismo (Borboletas)</option>
                        <option value="praia_bolhas" className="bg-zinc-900">🏖️ Praia (Bolhas de Água)</option>
                        <option value="praia_ondas" className="bg-zinc-900">🌊 Praia (Ondas Suaves)</option>
                        <option value="praia_sol" className="bg-zinc-900">☀️ Praia (Brilho do Sol)</option>
                        <option value="cruzeiro_navio" className="bg-zinc-900">🛳️ Cruzeiro (Navio Navegante)</option>
                        <option value="cruzeiro_gotas" className="bg-zinc-900">💧 Cruzeiro (Gotas de Orvalho)</option>
                        <option value="internacional_aviao" className="bg-zinc-900">✈️ Internacional (Avião de Papel)</option>
                        <option value="internacional_bussola" className="bg-zinc-900">🧭 Internacional (Bússola Giratória)</option>
                        <option value="luxo_aurora" className="bg-zinc-900">👑 Luxo (Aurora Boreal)</option>
                        <option value="luxo_reflexo" className="bg-zinc-900">✨ Luxo (Reflexo Metálico)</option>
                      </optgroup>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                      <ChevronDown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {state.siteContent.animationEffect && state.siteContent.animationEffect !== "none" && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-wider">Duração do Efeito</label>
                    <div className="relative">
                      <select
                        value={state.siteContent.animationDuration || "always"}
                        onChange={(e) => updSite({ animationDuration: e.target.value as any })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#00ff88]/50 transition-colors appearance-none pr-8"
                      >
                        <option value="always" className="bg-zinc-900">O tempo todo (Padrão)</option>
                        <option value="5" className="bg-zinc-900">Durar 5 segundos ao abrir</option>
                        <option value="10" className="bg-zinc-900">Durar 10 segundos ao abrir</option>
                        <option value="30" className="bg-zinc-900">Durar 30 segundos ao abrir</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <ChevronDown className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FabricaCard>

            <FabricaCard title="✏️ Topo do site (Hero)">
              <div className="space-y-3">
                <FieldText
                  label="Título principal"
                  value={state.siteContent.heroHeadline}
                  onChange={(v) => updSite({ heroHeadline: v })}
                  placeholder={`${state.agencyName || "Sua Agência"} — Sua próxima viagem começa aqui`}
                />
                <FieldTextarea
                  label="Subtítulo"
                  value={state.siteContent.heroSubheadline}
                  onChange={(v) => updSite({ heroSubheadline: v })}
                  placeholder="Atendimento personalizado, roteiros sob medida..."
                />
                <FieldText
                  label="Texto do botão principal"
                  value={state.siteContent.heroCtaLabel}
                  onChange={(v) => updSite({ heroCtaLabel: v })}
                  placeholder="Falar no WhatsApp"
                />
              </div>
            </FabricaCard>

            <FabricaCard title="🖼️ Banco de imagens">
              <p className="text-xs text-white/50 mb-3">
                Salve aqui as imagens que você gerou na Fase 3 ou cole links externos. Elas ficam disponíveis no seletor de fotos da prévia.
              </p>
              <ImageGallery
                images={state.siteContent.galleryImages}
                generatedAd={state.lastCleanPhoto || ""}
                onAdd={addToGallery}
                onRemove={removeFromGallery}
              />
            </FabricaCard>



            <FabricaCard title="⭐ Depoimentos">
              <FieldText
                label="Título da seção"
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
                        placeholder="Nome do cliente"
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
                      placeholder="Depoimento"
                      rows={2}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 resize-none"
                    />
                  </div>
                ))}
                <button
                  onClick={addDepo}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Adicionar depoimento
                </button>
              </div>
            </FabricaCard>

            <FabricaCard title="❓ Perguntas Frequentes (FAQ)">
              <FieldText
                label="Título da seção"
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
                        placeholder="Pergunta"
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
                      placeholder="Resposta"
                      rows={2}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 resize-none"
                    />
                  </div>
                ))}
                <button
                  onClick={() => updSite({ faq: [...state.siteContent.faq, { q: "Nova pergunta?", a: "Resposta..." }] })}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Adicionar pergunta
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
                  label="Texto do botão"
                  value={state.siteContent.finalCtaLabel}
                  onChange={(v) => updSite({ finalCtaLabel: v })}
                />
              </div>
            </FabricaCard>
          </div>

          {/* BARRA DE AÇÕES INFERIOR FIXA */}
          <div className="flex flex-col sm:flex-row gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 mt-6">
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 font-semibold hover:bg-white/[0.08] flex items-center justify-center gap-2"
            >
              Voltar ao Início
            </button>
            <button
              onClick={onNext}
              className="flex-[2] py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              Avançar <ArrowRight className="w-5 h-5" />
            </button>
          </div>


        </div>

        {/* Painel Direito: Preview do Site (7 colunas em lg, Sticky) */}
        <div className="w-full space-y-6">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-zinc-950 border-b border-white/10 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 w-full xl:flex-1">
                <div className="flex flex-shrink-0 gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                </div>
                <div className="ml-1 sm:ml-3 px-3 py-1 rounded-lg bg-white/[0.04] text-[11px] font-mono text-white/50 flex-1 min-w-0 max-w-full sm:max-w-64 truncate border border-white/5">
                  https://{(state.agencyName || "sua-agencia").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-")}.canvaviagem.com
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                {/* Histórico Desfazer/Refazer */}
                <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/15">
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={`p-1.5 rounded-md transition-all ${
                      canUndo ? "text-amber-400 hover:bg-white/10" : "text-white/20 cursor-not-allowed"
                    }`}
                    title="Desfazer alteração (Undo)"
                  >
                    <Undo className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={`p-1.5 rounded-md transition-all ${
                      canRedo ? "text-emerald-400 hover:bg-white/10" : "text-white/20 cursor-not-allowed"
                    }`}
                    title="Refazer alteração (Redo)"
                  >
                    <Redo className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Seletor Dispositivo */}
                <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/15">
                  <button
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                      previewMode === "desktop" ? "bg-white text-zinc-900 shadow" : "text-white/60 hover:text-white"
                    }`}
                  >
                    Computador
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

                <div
                  className="px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    borderColor: UI_ACCENT_BORDER,
                    backgroundColor: UI_ACCENT_SOFT,
                    color: UI_ACCENT,
                  }}
                >
                  Modelo: {activeSiteTemplate.copy.pt.label}
                </div>

                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 whitespace-nowrap">
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
                  {removeMode ? "Toque no item" : "Remover item"}
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

            <div className="p-4 bg-zinc-950/40 relative">
              <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-300 font-semibold flex items-center justify-center gap-2">
                <Pencil className="w-4 h-4 text-amber-400" />
                💡 <strong>Clique em textos, ícones, fotos ou fundos para editar.</strong> Em botões, use duplo clique para abrir as cores da marca.
              </div>

              <div className="transition-all duration-300 ease-in-out">
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHTML}
                  className={`bg-white transition-all duration-300 shadow-xl ${
                    previewMode === "mobile"
                      ? "w-full max-w-[375px] h-[720px] mx-auto border-[10px] border-zinc-800 rounded-[36px]"
                      : "w-full h-[1150px] border border-white/10 rounded-2xl"
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
                    Editar informações
                  </button>
                  <button
                    type="button"
                    aria-label="Fechar detalhes do pacote"
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


      {/* 🖼️ MODAL GLOBAL DE SELEÇÃO DE IMAGEM (DISPARADO AO CLICAR NA PRÉVIA) */}
      {globalEditingPalette && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <aside
            ref={colorDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fabrica-color-dialog-title"
            aria-describedby="fabrica-color-dialog-description"
            className="ml-auto h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-zinc-950 p-6 shadow-2xl"
          >
            <button
              ref={colorModalCloseRef}
              type="button"
              onClick={() => {
                setGlobalEditingPalette(false);
                setActiveColorSection(null);
              }}
              className="absolute right-4 top-4 rounded-lg bg-white/[0.04] p-1.5 text-white/50 transition-colors hover:bg-white/[0.1] hover:text-white"
              aria-label="Fechar editor de cores"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 pr-10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Edição visual</div>
              <h3 id="fabrica-color-dialog-title" className="mt-1 text-lg font-bold text-white">
                Fundo: {SITE_SECTION_LABELS[activeColorSection || ""] || "Seção selecionada"}
              </h3>
              <p id="fabrica-color-dialog-description" className="mt-1 text-xs leading-relaxed text-white/50">
                Esta cor será salva somente neste fundo. As outras partes do site não mudam.
              </p>
            </div>

            {activeColorSection && (
              <SectionBackgroundEditor
                label={`Cor de ${SITE_SECTION_LABELS[activeColorSection] || "fundo"}`}
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
                Alterar a paleta global da marca
              </summary>
              <div className="mt-4">
                <BrandPaletteEditor
                  compact
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
              Concluir edição
            </button>
          </aside>
        </div>
      )}

      {globalPickingImage && activeImageEdit && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div
            ref={imageDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fabrica-image-dialog-title"
            aria-describedby="fabrica-image-dialog-description"
            className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150 relative"
          >
            <button
              ref={imageModalCloseRef}
              type="button"
              onClick={() => {
                setGlobalPickingImage(false);
                setActiveImageEdit(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.04] text-white/50 hover:bg-white/[0.1] hover:text-white"
              aria-label="Fechar seletor de imagens"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 id="fabrica-image-dialog-title" className="text-lg font-bold text-white uppercase tracking-wider">
                Trocar Foto {activeImageEdit.type === "logo" ? "da Logo" : activeImageEdit.type === "hero" ? "do Banner" : activeImageEdit.type === "about" ? "da Equipe / Agência" : "do Pacote"}
              </h3>
            </div>

            <p id="fabrica-image-dialog-description" className="text-xs text-white/60 mb-4">
              {activeImageEdit.type === "about"
                ? "Escolha uma das sugestões de equipe abaixo, reuse uma imagem do seu banco, ou envie a sua própria:"
                : "Clique em uma das imagens do seu banco abaixo para aplicar ou envie uma nova do seu computador:"}
            </p>

            {/* Sugestões padrão para Equipe/Agência */}
            {activeImageEdit.type === "about" && (
              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-wider text-amber-400/80 font-semibold mb-2">Sugestões de Equipe</div>
                <div className="grid grid-cols-4 gap-2 p-2 border border-amber-400/20 rounded-xl bg-amber-400/[0.03]">
                  {TEAM_PRESET_IMAGES.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => applyGlobalImage(url)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all scale-95 hover:scale-100 ${
                        state.siteContent.aboutImageUrl === url ? "border-amber-400 ring-2 ring-amber-400/40" : "border-white/10 hover:border-amber-400"
                      }`}
                    >
                      <img src={url} alt={`Sugestão ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Galeria do usuário */}
            {state.siteContent.galleryImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto mb-4 p-2 custom-scrollbar border border-white/5 rounded-xl bg-black/20">
                {state.siteContent.galleryImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => applyGlobalImage(url)}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-white/10 hover:border-amber-400 transition-all scale-95 hover:scale-100"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : activeImageEdit.type !== "about" ? (
              <div className="text-xs text-white/40 italic text-center py-6 border border-dashed border-white/10 rounded-xl mb-4 bg-black/10">
                Nenhuma imagem no banco de imagens ainda. Faça upload ou cole um link abaixo!
              </div>
            ) : null}

            {/* Upload e URL */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cole link da imagem (https://...)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val.startsWith("http")) {
                        applyGlobalImage(val);
                      }
                    }
                  }}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousSibling as HTMLInputElement;
                    const val = input.value.trim();
                    if (val.startsWith("http")) {
                      applyGlobalImage(val);
                    }
                  }}
                  className="px-4 py-2 bg-white/[0.08] text-white text-sm font-semibold rounded-lg hover:bg-white/[0.15]"
                >
                  Aplicar
                </button>
              </div>

              <label className="block py-2.5 rounded-lg border border-dashed border-white/20 text-center text-white/60 hover:text-white hover:border-white/40 text-xs font-semibold cursor-pointer transition-colors bg-white/[0.02]">
                <Upload className="w-3.5 h-3.5 inline mr-1" /> Ou selecione do computador
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        applyGlobalImage(reader.result as string);
                      };
                      reader.readAsDataURL(f);
                    }
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
  const guidance = getPackageGuidance(effectiveSegment);
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
      toast.error("Escolha no máximo 5 imagens por pacote.");
      return;
    }
    onChange({ galleryImages: [...current, url] });
  };

  const searchPhotos = async () => {
    const q = photoQuery.trim() || pacote.title.split(' ')[0] || ""; // default to first word of title
    if (!q) {
      toast.error("Digite o destino para buscar fotos");
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
        toast.success(`Fotos de ${q} carregadas com sucesso!`);
      }
    } catch (err) {
      console.error("Erro ao buscar fotos:", err);
      toast.error("Erro na busca de fotos.");
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
              <span className="text-[10px] font-semibold">Imagem</span>
            </div>
          )}
        </button>

        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              value={pacote.title}
              onChange={(e) => onChange({ title: e.target.value })}
              onBlur={(e) => {
                if (!pacote.slug || pacote.slug.startsWith("novo-pacote-")) {
                  onChange({ slug: buildPackageSlug(e.target.value, pacote.id) });
                }
              }}
              placeholder="Ex: Jericoacoara 5 dias"
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
            placeholder="R$ 1.997 / pessoa"
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40"
          />
          <input
            value={pacote.badge || ""}
            onChange={(e) => onChange({ badge: e.target.value })}
            placeholder="Selo do card (ex.: Oferta, Grupo, Praia)"
            maxLength={32}
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40"
          />
        </div>
      </div>

      <textarea
        value={pacote.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Descrição (o que está incluso)"
        rows={2}
        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 resize-none"
      />

      <div className="flex gap-2 items-center">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Botão:</span>
        <input
          value={pacote.ctaLabel || ""}
          onChange={(e) => onChange({ ctaLabel: e.target.value })}
          placeholder="Quero esse"
          className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/40"
        />
        <span className="text-[10px] text-white/40 italic">→ "Olá, tenho interesse em {pacote.title || "..."}"</span>
      </div>

      <details className="group rounded-xl border border-white/10 bg-white/[0.025] open:bg-black/20">
        <summary
          data-testid={`package-advanced-toggle-${pacote.id}`}
          className="flex min-h-11 w-full cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 [&::-webkit-details-marker]:hidden"
        >
          <span>
            {hasAdvancedDetails ? "Editar mais informações" : "Adicionar mais informações"}
            <span className="mt-0.5 block text-[10px] font-normal text-white/40">Opcional · aparece somente no detalhe do pacote</span>
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform group-open:rotate-180" />
        </summary>

        <div className="rounded-xl border border-white/10 bg-black/25 p-3 sm:p-4 space-y-5">
          <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2.5 text-[11px] leading-relaxed text-amber-100/75">
            A Fábrica recomenda os campos conforme o tipo de pacote. Campos vazios não aparecem no site e não alteram o formulário nem o CRM.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">Tipo de experiência</span>
              <select
                value={effectiveSegment}
                onChange={(event) => onChange({ segment: event.target.value as Pacote["segment"] })}
                className="min-h-11 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-base text-white outline-none focus:border-white/40 sm:text-sm"
              >
                {PACKAGE_SEGMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">Disponibilidade</span>
              <select
                value={pacote.availability || ""}
                onChange={(event) => onChange({ availability: (event.target.value || undefined) as Pacote["availability"] })}
                className="min-h-11 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-base text-white outline-none focus:border-white/40 sm:text-sm"
              >
                <option value="">Não informar</option>
                {PACKAGE_AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">Subtítulo</span>
            <input
              value={pacote.subtitle || ""}
              onChange={(event) => onChange({ subtitle: event.target.value })}
              placeholder="Ex.: A experiência mais completa para conhecer o destino"
              className="min-h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-base text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">Descrição completa</span>
            <textarea
              value={pacote.longDescription || ""}
              onChange={(event) => onChange({ longDescription: event.target.value })}
              placeholder={guidance.description}
              rows={5}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-base leading-relaxed text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ["Datas ou frequência", "travelDates", pacote.travelDates || "", guidance.dates],
              ["Duração", "duration", pacote.duration || "", guidance.duration],
              ["Origem / embarque", "departureLocation", pacote.departureLocation || "", guidance.departure],
              ["Encontro / retirada", "meetingPoint", pacote.meetingPoint || "", guidance.meetingPoint],
              ["Hospedagem / cabine", "accommodation", pacote.accommodation || "", guidance.accommodation],
              ["Como o preço é calculado", "priceDetails", pacote.priceDetails || "", guidance.priceDetails],
              ["Pagamento", "paymentTerms", pacote.paymentTerms || "", "Ex.: Entrada de 20% + 10 parcelas sem juros"],
              ["Link compartilhável", "slug", pacote.slug || buildPackageSlug(pacote.title, pacote.id), "ex.: jericoacoara-5-dias"],
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[
              ["Destaques", "highlights", pacote.highlights || [], guidance.highlights],
              ["O que inclui", "included", pacote.included || [], guidance.included],
              ["O que não inclui", "notIncluded", pacote.notIncluded || [], "Um item por linha\nBebidas\nDespesas pessoais"],
              ["Roteiro resumido", "itinerary", pacote.itinerary || [], guidance.itinerary],
              ["Requisitos e o que levar", "requirements", pacote.requirements || [], guidance.requirements],
              ["Documentos necessários", "documents", pacote.documents || [], guidance.documents],
              ["Recursos de acessibilidade", "accessibility", pacote.accessibility || [], "Um recurso por linha\nTransporte adaptado: a confirmar\nAcesso sem degraus"],
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">Política de cancelamento</span>
              <textarea
                value={pacote.cancellationPolicy || ""}
                onChange={(event) => onChange({ cancellationPolicy: event.target.value })}
                placeholder="Ex.: Cancelamento gratuito até 7 dias antes; após esse prazo, consulte as condições."
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-base leading-relaxed text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/50">Importante saber</span>
              <textarea
                value={pacote.importantNotes || ""}
                onChange={(event) => onChange({ importantNotes: event.target.value })}
                placeholder="Ex.: Operação sujeita às condições climáticas; confirmação enviada por WhatsApp."
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-base leading-relaxed text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
              />
            </label>
          </div>

          {gallery.length > 0 && (
            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Galeria do pacote</div>
                  <div className="mt-0.5 text-[10px] text-white/35">Reutiliza os links do banco; escolha até 5.</div>
                </div>
                <span className="text-[10px] text-white/45">{pacote.galleryImages?.length || 0}/5</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {gallery.map((url, index) => {
                  const selected = pacote.galleryImages?.includes(url);
                  return (
                    <button
                      key={url}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${selected ? "Remover" : "Adicionar"} imagem ${index + 1} da galeria do pacote`}
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
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Perguntas deste pacote</div>
                <div className="mt-0.5 text-[10px] text-white/35">Se ficar vazio, o site usa as perguntas gerais.</div>
              </div>
              <button
                type="button"
                onClick={() => onChange({ faq: [...(pacote.faq || []), { question: "", answer: "" }] })}
                className="min-h-11 rounded-lg border border-white/10 px-3 text-xs font-semibold text-white/70 hover:bg-white/[0.05]"
              >
                + Adicionar pergunta
              </button>
            </div>
            <div className="space-y-2">
              {(pacote.faq || []).map((item, index) => (
                <div key={`${pacote.id}-faq-${index}`} className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                  <div className="flex gap-2">
                    <input
                      value={item.question}
                      onChange={(event) => onChange({ faq: (pacote.faq || []).map((faq, faqIndex) => faqIndex === index ? { ...faq, question: event.target.value } : faq) })}
                      placeholder="Ex.: Posso remarcar a data?"
                      className="min-h-11 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-base text-white placeholder:text-white/30 outline-none focus:border-white/40 sm:text-sm"
                    />
                    <button
                      type="button"
                      aria-label="Remover pergunta"
                      onClick={() => onChange({ faq: (pacote.faq || []).filter((_, faqIndex) => faqIndex !== index) })}
                      className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={item.answer}
                    onChange={(event) => onChange({ faq: (pacote.faq || []).map((faq, faqIndex) => faqIndex === index ? { ...faq, answer: event.target.value } : faq) })}
                    placeholder="Escreva a resposta de forma objetiva."
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
          <div className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Escolher imagem</div>

          {/* Buscar no Pexels */}
          <div className="space-y-2">
            <div className="text-[10px] text-white/40">Buscar no banco gratuito:</div>
            <div className="flex gap-2">
              <input
                value={photoQuery}
                onChange={(e) => setPhotoQuery(e.target.value)}
                placeholder="Ex: Paris, Cancún..."
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
                {photos.map((p, index) => (
                  <button
                    key={p.id}
                    aria-label={`Usar resultado ${index + 1}: ${p.alt || "imagem do destino"}`}
                    onClick={() => {
                      onChange({ imageUrl: p.url });
                      setPickingImage(false);
                      toast.success("Imagem aplicada!");
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
              <div className="text-[10px] text-white/40 mb-2">Do seu banco:</div>
              <div className="grid grid-cols-4 gap-2">
                {gallery.map((url, index) => (
                  <button
                    key={url}
                    aria-label={`Usar imagem ${index + 1} do banco`}
                    onClick={() => {
                      onChange({ imageUrl: url });
                      setPickingImage(false);
                      toast.success("Imagem aplicada!");
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
              placeholder="Cole a URL da imagem (https://...)"
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/40"
            />
            <button
              onClick={() => {
                onChange({ imageUrl: "" });
                toast.success("Imagem removida");
              }}
              className="px-3 py-2 rounded-lg bg-white/[0.06] text-white/70 text-xs hover:bg-white/[0.1]"
            >
              Limpar
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
      toast.error("Faça login para enviar uma imagem do computador.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast.error("Imagem muito grande. Escolha um arquivo de até 12 MB.");
      return;
    }
    if (!/^image\/(?:jpeg|png|webp|gif|avif)$/i.test(file.type)) {
      toast.error("Formato não suportado. Use JPG, PNG, WebP, GIF ou AVIF.");
      return;
    }
    setUploadingImage(true);
    const toastId = toast.loading("Otimizando imagem para o site...");
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
      toast.success("Imagem otimizada e adicionada sem duplicar o arquivo.", { id: toastId });
    } catch (error) {
      console.error("Falha ao otimizar imagem do site", error);
      toast.error("Não foi possível enviar a imagem. Tente outro arquivo.", { id: toastId });
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
          <Sparkles className="w-4 h-4" /> Adicionar a foto limpa do destino (Fase 3) ao banco
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
                      a.download = `banco-imagem-${Date.now()}.png`;
                      a.click();
                    }}
                    className="p-1.5 rounded-lg bg-black/80 backdrop-blur-md text-emerald-400 hover:bg-black hover:scale-105 active:scale-95 transition-all"
                    title="Baixar imagem original"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemove(url)}
                    className="p-1.5 rounded-lg bg-black/80 backdrop-blur-md text-red-400 hover:bg-black hover:scale-105 active:scale-95 transition-all"
                    title="Excluir imagem"
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
          Nenhuma imagem ainda. Adicione abaixo 👇
        </div>
      )}

      {/* Cole link */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Cole link da imagem (https://...)"
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40"
          />
        </div>
        <button
          onClick={() => {
            const safeUrl = normalizeExternalImageUrl(newUrl);
            if (!safeUrl) {
              toast.error("Cole um link de imagem válido começando com https:// ou http://.");
              return;
            }
            onAdd(safeUrl);
            setNewUrl("");
          }}
          disabled={!newUrl.trim()}
          className="px-4 py-2 rounded-lg bg-white/[0.08] text-white text-sm font-semibold hover:bg-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Adicionar
        </button>
      </div>

      {/* Upload local */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploadingImage}
        className="min-h-11 w-full py-2.5 rounded-lg border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 text-xs font-semibold flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-50"
      >
        <Upload className="w-3.5 h-3.5" /> {uploadingImage ? "Otimizando e enviando..." : "Ou faça upload do seu computador"}
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

const PublishSiteCard = ({
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

  const handleDownload = () => {
    try {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${buildSiteSlug(state.agencyName || "site") || "site"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("[Phase4] download failed", e);
    }
  };

  const [canvaViagemSubdomain, setCanvaViagemSubdomain] = useState(() => {
    if (state.siteContent.canvaViagemUrl) {
      return extractCanvaSiteSlug(state.siteContent.canvaViagemUrl);
    }
    return buildSiteSlug(state.agencyName || "");
  });
  const [isCanvaViagemPublishing, setIsCanvaViagemPublishing] = useState(false);

  useEffect(() => {
    if (state.siteContent.canvaViagemUrl) {
      setCanvaViagemSubdomain(extractCanvaSiteSlug(state.siteContent.canvaViagemUrl));
    } else {
      setCanvaViagemSubdomain(buildSiteSlug(state.agencyName || ""));
    }
  }, [state.projectId, state.siteContent.canvaViagemUrl, state.agencyName]);

  const handleCanvaViagemPublish = async () => {
    if (!user?.id) {
      toast.error("Faça login para publicar.");
      return;
    }

    // Fix #5: Bloqueia se o nome da agência está em branco (geraria slug inválido)
    if (!state.agencyName?.trim() && !canvaViagemSubdomain?.trim()) {
      toast.error("Preencha o nome da agência no painel inicial antes de publicar.", {
        description: "Volte à etapa 'Dados da Agência' e adicione o nome da sua agência.",
      });
      return;
    }

    const cleanSlug = buildSiteSlug(canvaViagemSubdomain || state.agencyName || "");
    const slugError = validateCanvaSiteSlug(cleanSlug);
    if (slugError) {
      const messages = {
        too_short: "O nome da agência precisa ter pelo menos 3 caracteres válidos para criar o link do site.",
        too_long: "O link deve ter no máximo 63 caracteres.",
        invalid: "Use somente letras, números e hífens, sem hífen no início ou no final.",
        reserved: "Esse subdomínio é reservado. Escolha outro nome.",
      } as const;
      toast.error(messages[slugError]);
      return;
    }

    setIsCanvaViagemPublishing(true);
    const toastId = toast.loading("Publicando no link Canva Viagem...");

    try {
      const result = await publishFabricaSite({
        state,
        userId: user.id,
        slug: cleanSlug,
        locale: "pt-BR",
        onProgress: (stage) => {
          if (stage === "assets") {
            toast.loading("Otimizando imagens do site...", { id: toastId });
          } else if (stage === "site") {
            toast.loading("Ativando o link no Canva Viagem...", { id: toastId });
          }
        },
      });

      update({
        projectId: result.projectId,
        crmForm: result.state.crmForm,
        logoBase64: result.state.logoBase64,
        selectedPackages: result.state.selectedPackages,
        siteContent: result.state.siteContent,
      });

      toast.success("Site publicado no link Canva Viagem!", { id: toastId });
    } catch (err: any) {
      // Fix #7b: Sanitiza mensagem técnica de banco antes de exibir ao usuário
      console.error("Canva Viagem publish error:", err);
      const rawMsg = err?.message || "";
      let friendlyMsg = "Não foi possível publicar. Tente novamente em instantes.";
      if (rawMsg.includes("another_owner") || rawMsg.includes("site_slug_unavailable")) {
        friendlyMsg = "Esse endereço já pertence a outra conta. Escolha outro subdomínio.";
      } else if (rawMsg.includes("another_project") || rawMsg.includes("site_slug_belongs_to_another_project")) {
        friendlyMsg = "Esse endereço já está ligado a outro projeto seu. Escolha outro subdomínio.";
      } else if (rawMsg.toLowerCase().includes("row-level") || rawMsg.toLowerCase().includes("rls") || rawMsg.toLowerCase().includes("policy")) {
        friendlyMsg = "Sessão expirada. Faça logout e login novamente para publicar.";
      } else if (rawMsg.toLowerCase().includes("network") || rawMsg.toLowerCase().includes("fetch")) {
        friendlyMsg = "Sem conexão com a internet. Verifique sua rede e tente de novo.";
      } else if (rawMsg.includes("site_publish_schema_sync_pending")) {
        friendlyMsg = "A publicação está sendo atualizada. Aguarde alguns segundos e tente novamente; seu site anterior continua no ar.";
      } else if (rawMsg.toLowerCase().includes("duplicate") || rawMsg.toLowerCase().includes("unique")) {
        friendlyMsg = "Já existe um site com esse endereço. Tente um subdomínio diferente.";
      }
      toast.error(friendlyMsg, { id: toastId });
    } finally {
      setIsCanvaViagemPublishing(false);
    }
  };

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
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Publique seu site
            </h3>
          </div>
        </div>

        <p className="text-sm text-white/70 mb-5 leading-relaxed">
          Escolha a sua opção preferida para publicar ou baixar o código completo do seu site perfeitamente como ele está:
        </p>

        {/* PUBLICAÇÃO EM SUBDOMÍNIO CANVA VIAGEM (PRIMÁRIA) */}
        <div className="my-4 p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl text-left">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.18em] mb-1">
                Publicação Principal
              </div>
              <h4 className="text-lg font-black text-white leading-tight">
                Publicar com link Canva Viagem
              </h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Gera um link seguro no seu domínio principal, como nomedaagencia.canvaviagem.com.
              </p>
            </div>
            <LinkIcon className="w-5 h-5 text-white/40 flex-shrink-0" />
          </div>

          {normalizeCanvaSiteUrl(state.siteContent.canvaViagemUrl || "") && (
            <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Link Canva Viagem publicado</div>
                <a
                  href={normalizeCanvaSiteUrl(state.siteContent.canvaViagemUrl || "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 break-all text-sm font-bold text-white hover:underline flex items-center gap-1.5 mt-0.5 group"
                >
                  {normalizeCanvaSiteUrl(state.siteContent.canvaViagemUrl || "")}
                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                </a>
              </div>
              <a
                href={normalizeCanvaSiteUrl(state.siteContent.canvaViagemUrl || "")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-white hover:bg-gray-200 text-black font-bold text-xs transition-all text-center"
              >
                Abrir site
              </a>
            </div>
          )}

          <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
            Link do cliente:
          </label>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto] mb-3">
            <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-r-0 rounded-tl-lg sm:rounded-l-lg text-xs text-white/40 select-none">
              https://
            </span>
            <input
              type="text"
              value={canvaViagemSubdomain}
              onChange={(e) => setCanvaViagemSubdomain(buildSiteSlug(e.target.value))}
              maxLength={63}
              placeholder="nome-da-agencia"
              className="min-w-0 w-full bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white font-semibold outline-none focus:border-white/30 rounded-tr-lg sm:rounded-none"
            />
            <span className="col-span-2 sm:col-span-1 px-3 py-2 bg-white/[0.04] border border-white/10 border-t-0 sm:border-t sm:border-l-0 rounded-b-lg sm:rounded-b-none sm:rounded-r-lg text-center sm:text-left text-xs text-white/40 select-none break-all">
              .canvaviagem.com
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <button
              onClick={handleCanvaViagemPublish}
              disabled={isCanvaViagemPublishing}
              className="py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              style={{
                backgroundColor: UI_ACCENT,
                color: "#000000"
              }}
            >
              {isCanvaViagemPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Publicando...
                </>
              ) : (
                <>Publicar no Canva Viagem</>
              )}
            </button>

            <button
              onClick={handleCanvaViagemPublish}
              disabled={isCanvaViagemPublishing}
              className="py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm border"
              style={{
                borderColor: UI_ACCENT_BORDER,
                color: "#ffffff",
                backgroundColor: "transparent"
              }}
            >
              {isCanvaViagemPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>Atualizar Site</>
              )}
            </button>
          </div>

          <p className="text-[10px] text-white/45 mt-3 leading-relaxed">
            O HTML fica salvo no Supabase e o domínio é entregue pela camada Cloudflare do Canva Viagem.
          </p>
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
            <ArrowLeft className="w-4 h-4" /> Voltar ao topo
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onBack}
            className="flex-1 py-4 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 font-bold hover:bg-white/[0.08] transition-all"
          >
            Voltar
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-4 rounded-xl border border-white/10 bg-white/[0.04] text-white font-bold hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Baixar HTML
          </button>
          <button
            onClick={onNext}
            className="flex-[2] py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          >
            Avançar para CRM <Rocket className="w-5 h-5" />
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
      {isOpen && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          className="animate-in fade-in duration-300 p-6 pt-0 border-t border-white/[0.04]"
        >
          {children}
        </div>
      )}
    </div>
  );
};

