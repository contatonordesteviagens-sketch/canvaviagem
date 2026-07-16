import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFabricaContext, type Pacote, type Depoimento as Testimonio } from "@/hooks/useFabricaContext";
import { supabase } from "@/integrations/supabase/client";
import { downloadLandingHTML, buildLandingHTML } from "@/lib/fabrica-html-export-es";
import { CloudSaveIndicatorES } from "@/components/fabrica/CloudSaveIndicatorES";
import { SiteTemplateSelector } from "@/components/fabrica/SiteTemplateSelector";
import { useDiagnosticos } from "@/hooks/useFabricaDiagnosticos";
import { getSiteTemplateDefinition } from "@/lib/site-template-catalog";
import { persistFabricaProject } from "@/lib/fabrica-project-persistence";
import { checkCanvaSiteSlugAvailability } from "@/lib/fabrica-site-publication";
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
  buildCanvaSiteSlug as buildSiteSlug,
  extractCanvaSiteSlug,
  getCanvaSiteUrl,
  normalizeCanvaSiteUrl,
  validateCanvaSiteSlug,
} from "@/lib/canva-site-domain";

const PRESET_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#000000"];
const FABRICA_SITE_STORAGE_CONTENT_TYPE = "image/webp";
const UI_ACCENT = "#F5F906";
const UI_ACCENT_SOFT = "rgba(245, 249, 6, 0.12)";
const UI_ACCENT_BORDER = "rgba(245, 249, 6, 0.75)";
const UI_ACCENT_SHADOW = "rgba(245, 249, 6, 0.24)";

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
  const { state, update, systemUpdate, reset, undo, redo, canUndo, canRedo, isHydrated } = useFabricaContext();
  const { user } = useAuth();
  const [previewing, setPreviewing] = useState(true);
  const [downloadCount, setDownloadCount] = useState(0);
  const [autoSyncDone, setAutoSyncDone] = useState(false);
  const [autoSyncFields, setAutoSyncFields] = useState<string[]>([]);
  const [pickingHeroImage, setPickingHeroImage] = useState(false);

  // ── ESTADOS Y REF PARA EDICIÓN VISUAL DIRECTA E INTUITIVA EN LA VISTA PREVIA ──
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [globalPickingImage, setGlobalPickingImage] = useState(false);
  const [activeImageEdit, setActiveImageEdit] = useState<{
    type: "logo" | "hero" | "package" | "about";
    packageId?: string;
  } | null>(null);

  const applyGlobalImage = (url: string) => {
    if (!activeImageEdit) return;

    if (activeImageEdit.type === "logo") {
      update({ logoBase64: url });
      toast.success("¡Logotipo actualizado con éxito!");
    } else if (activeImageEdit.type === "hero") {
      updSite({ heroImageUrl: url });
      toast.success("¡Banner principal actualizado con éxito!");
    } else if (activeImageEdit.type === "about") {
      updSite({ aboutImageUrl: url });
      toast.success("¡Foto del equipo/empresa actualizada!");
    } else if (activeImageEdit.type === "package" && activeImageEdit.packageId) {
      updPacote(activeImageEdit.packageId, { imageUrl: url });
      toast.success("¡Foto del paquete actualizada con éxito!");
    }

    // Agregar al banco de imágenes para reutilización si aún no está allí
    if (!state.siteContent.galleryImages.includes(url)) {
      update({
        siteContent: {
          ...state.siteContent,
          galleryImages: [...state.siteContent.galleryImages, url],
        },
      });
    }

    setGlobalPickingImage(false);
    setActiveImageEdit(null);
  };

  const iframeScrollY = useRef(0);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "FABRICA_REMOVE" && e.data.elementId) {
        const currentHidden = state.siteContent.hiddenElements || [];
        if (!currentHidden.includes(e.data.elementId)) {
          updSite({ hiddenElements: [...currentHidden, e.data.elementId] });
          toast.success("¡Elemento eliminado del sitio!");
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [state.siteContent.hiddenElements]);

  // Enlace de los eventos de clic en el iframe para edición visual en tiempo real
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.head || !doc.body) return;

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
          outline: 2px dashed #F59E0B !important;
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
      `;
      doc.head.appendChild(style);

      // 1. Textos editables (contenteditable)
      const textSelectors = [
        ".brand-name",
        ".hero h1",
        ".hero p.lead",
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
          } else if (el.tagName === "H1" && el.closest(".hero")) {
            updSite({ heroHeadline: textVal });
          } else if (el.classList.contains("lead") && el.closest(".hero")) {
            updSite({ heroSubheadline: textVal });
          } else {
            // Si es dentro de un paquete (destination card)
            const destCard = el.closest(".dest-card");
            if (destCard) {
              const allCards = Array.from(doc.querySelectorAll(".dest-card"));
              const idx = allCards.indexOf(destCard);
              if (idx !== -1 && state.selectedPackages[idx]) {
                const pkgId = state.selectedPackages[idx].id;
                if (el.tagName === "H3") {
                  updPacote(pkgId, { title: textVal });
                } else if (el.tagName === "P") {
                  updPacote(pkgId, { description: textVal });
                } else if (el.classList.contains("price-value") || el.classList.contains("price-main")) {
                  updPacote(pkgId, { price: textVal });
                } else if (el.classList.contains("dest-tag")) {
                  updPacote(pkgId, { category: textVal } as any);
                }
              }
            }

            // Si es dentro de un testimonio
            const depoCard = el.closest(".depo-card");
            if (depoCard) {
              const allDepos = Array.from(doc.querySelectorAll(".depo-card"));
              const idx = allDepos.indexOf(depoCard);
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
          } else {
            const destCard = el.closest(".dest-card");
            if (destCard) {
              const allCards = Array.from(doc.querySelectorAll(".dest-card"));
              const idx = allCards.indexOf(destCard);
              if (idx !== -1 && state.selectedPackages[idx]) {
                setActiveImageEdit({ type: "package", packageId: state.selectedPackages[idx].id });
                setGlobalPickingImage(true);
              }
            }
          }
        });
      });

      // Lógica de elementos removíveis (X button)
      const removables = doc.querySelectorAll("[data-visual-removable]");
      removables.forEach(el => {
        const btn = doc.createElement("button");
        btn.innerHTML = "×";
        btn.className = "fabrica-remove-btn";
        btn.title = "Ocultar este elemento";
        btn.style.cssText = "position:absolute; top:-6px; right:-6px; background:rgba(239,68,68,0.9); color:white; border:1px solid #fff; border-radius:50%; width:16px; height:16px; cursor:pointer; font-size:10px; font-weight:bold; display:none; align-items:center; justify-content:center; z-index:10000; box-shadow:0 2px 4px rgba(0,0,0,0.15); line-height:1; font-family:sans-serif; padding-bottom:1px; transition:all 0.2s ease; backdrop-filter:blur(2px);";
        
        (el as HTMLElement).style.position = "relative";
        el.appendChild(btn);
        
        el.addEventListener("mouseenter", () => btn.style.display = "flex");
        el.addEventListener("mouseleave", () => btn.style.display = "none");
        
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          const id = el.getAttribute("data-visual-removable");
          if (id) {
            window.postMessage({ type: "FABRICA_REMOVE", elementId: id }, "*");
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
    const SYNC_KEY = "fabrica-phase4-autosync-v1-es";
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
  }, [isHydrated, state.agencyName, state.destinos, state.lastPaymentMode, state.lastPrice, state.level, state.siteContent, systemUpdate]);

  const resetSiteToBlank = () => {
    const SYNC_KEY = "fabrica-phase4-autosync-v1-es";
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
    const novo: Pacote = {
      id: String(Date.now()),
      title: "Nuevo paquete",
      description: "Describe lo que está incluido",
      price: "$ 0,00",
      imageUrl: "",
      ctaLabel: "Quiero este",
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
                const isRecovered = p.source === "published_recovery";
                const targetName = p.agency_name || 'Sin Nombre';
                const currentName = state.agencyName || 'Sin nombre';
                if (state.agencyName && p.id !== state.projectId) {
                  const ok = window.confirm(`⚠️ Estás editando "${currentName}".\n\n¿Deseas cargar "${targetName}"? Guarda antes si tienes cambios sin confirmar.`);
                  if (!ok) { e.target.value = ""; return; }
                }
                window.dispatchEvent(new CustomEvent("fabrica-load-snapshot", { detail: { ...p.state_snapshot, projectId: p.id } }));
                if (isRecovered) toast.warning(`Sitio anterior "${targetName}" recuperado. Revisa los datos antes de volver a publicarlo.`);
                else toast.success(`📂 ¡Proyecto "${targetName}" cargado!`);
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

            <FabricaCard title="📦 Paquetes ofrecidos">
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
            <FabricaCard title="🎨 Color primario del sitio">
              <div className="flex flex-wrap gap-3 items-center">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => update({ primaryColor: c })}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${
                      state.primaryColor === c ? "border-white scale-110" : "border-white/20"
                    }`}
                    style={{ background: c }}
                    aria-label={c}
                  />
                ))}
                <div className="flex items-center gap-2 ml-2">
                  <Palette className="w-4 h-4 text-white/50" />
                  <input
                    type="color"
                    value={state.primaryColor}
                    onChange={(e) => update({ primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
                  />
                </div>
              </div>

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

              <div className="flex items-center gap-3">
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
              </div>
            </div>

            <div className="p-5 bg-black/50 relative">
              <div className="mb-3 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/10 text-center text-[11px] text-amber-300/80 font-semibold flex items-center justify-center gap-2">
                <Pencil className="w-3.5 h-3.5 text-amber-400" />
                💡 <strong>Haz clic en cualquier texto del sitio para escribir</strong> o <strong>toca una foto</strong> para cambiarla en vivo!
              </div>

              <div className="transition-all duration-300 ease-in-out">
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHTML}
                  className={`bg-white transition-all duration-500 ${
                    previewMode === "mobile"
                      ? "w-[375px] h-[720px] mx-auto border-[10px] border-zinc-800 rounded-[36px] shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
                      : "w-full h-[1150px] border border-white/[0.05] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                  }`}
                  title="Preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>


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
  gallery,
  onChange,
  onDelete,
}: {
  pacote: Pacote;
  gallery: string[];
  onChange: (patch: Partial<Pacote>) => void;
  onDelete: () => void;
}) => {
  const [pickingImage, setPickingImage] = useState(false);
  const [photoQuery, setPhotoQuery] = useState("");
  const [searchingPhotos, setSearchingPhotos] = useState(false);
  const [photos, setPhotos] = useState<Array<{ id: number; url: string; thumb: string; alt: string }>>([]);

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
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 space-y-3">
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
            placeholder="$ 1.997 / pessoa"
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

  const publishToCanvaViagem = async (slug: string) => {
    const cleanSlug = buildSiteSlug(slug);
    const url = getCanvaSiteUrl(cleanSlug);
    return { success: true, url };
  };

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
      const persistedProject = await persistFabricaProject({ state, userId: user.id });
      const publishId = persistedProject.id;
      if (publishId !== state.projectId) update({ projectId: publishId });

      const availability = await checkCanvaSiteSlugAvailability({
        slug: cleanSlug,
        ownerId: user.id,
        projectId: publishId,
        currentUrl: state.siteContent.canvaViagemUrl,
      });
      if (!availability.allowed) {
        toast.error(availability.reason === "another_owner"
          ? `El dominio "${cleanSlug}.canvaviagem.com" ya pertenece a otra agencia.`
          : "Este dominio ya pertenece a otro proyecto de tu cuenta. Abre el proyecto original o elige otra dirección.");
        return;
      }

      let finalHtml = html;
      const embeddedImages = Array.from(new Set(
        finalHtml.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=]+/g) || [],
      ));
      for (const base64Data of embeddedImages) {
        const sourceBlob = await (await fetch(base64Data)).blob();
        const webpBlob = await optimizeImageBlobToWebp(sourceBlob);
        const hash = await hashBlob(webpBlob);
        const filename = `sites/${user.id}/assets/${hash}.webp`;
        const { error: uploadError } = await supabase.storage
          .from("thumbnails")
          .upload(filename, webpBlob, { contentType: FABRICA_SITE_STORAGE_CONTENT_TYPE, upsert: true });
        if (uploadError) throw uploadError;
        const publicUrl = supabase.storage.from("thumbnails").getPublicUrl(filename).data.publicUrl;
        finalHtml = finalHtml.split(base64Data).join(publicUrl);
      }
      if (/data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(finalHtml)) {
        throw new Error("No se pudieron optimizar todas las imágenes del sitio.");
      }

      // El slug público identifica el sitio; project_id conserva el vínculo con el proyecto.
      const { error: dbError } = await supabase
        .from("public_sites")
        .upsert({
          id: cleanSlug,
          owner_id: user.id,
          project_id: publishId,
          html: finalHtml,
          locale: 'es'
        });
      if (dbError) {
        throw new Error(dbError.message || "Error al guardar sitio en la base de datos.");
      }

      const result = await publishToCanvaViagem(cleanSlug);
      if (result.success) {
        const publishedState = {
          ...state,
          projectId: publishId,
          siteContent: { ...state.siteContent, canvaViagemUrl: result.url },
        };
        await persistFabricaProject({ state: publishedState, userId: user.id });
        update({
          projectId: publishId,
          siteContent: publishedState.siteContent,
        });
        toast.success(
          <div>
            ¡Sitio publicado con éxito! 🎉
            <br />
            Tu enlace es: <b>{result.url}</b>
          </div>,
          { duration: 6000 }
        );
      }
    } catch (err: any) {
      toast.error("Error al publicar: " + err.message);
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

const FabricaCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="bg-white/[0.03] border rounded-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden"
      style={{
        borderColor: isOpen ? UI_ACCENT_BORDER : "rgba(255, 255, 255, 0.06)",
        boxShadow: isOpen ? `0 10px 30px ${UI_ACCENT_SHADOW}` : "none",
      }}
    >
      {/* Header clicável para abrir/fechar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none select-none group"
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
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[4000px] opacity-100 p-6 pt-0 border-t border-white/[0.04]" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        {children}
      </div>
    </div>
  );
};


