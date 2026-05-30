import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFabricaContext, type Pacote, type Depoimento as Testimonio } from "@/hooks/useFabricaContext";
import { supabase } from "@/integrations/supabase/client";
import { downloadLandingHTML, buildLandingHTML, generateUpdatePackagesPrompt } from "@/lib/fabrica-html-export-es";
import {
  Plus,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Palette,
  Rocket,
  Copy,
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

const LOVABLE_INVITE_URL = "https://lovable.dev/invite/2ZD6VL6";
const PRESET_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#000000"];
const FABRICA_SITE_STORAGE_CONTENT_TYPE = "image/webp";

export const Phase4LandingBuilderES = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  const { state, update, systemUpdate, undo, redo, canUndo, canRedo, isHydrated } = useFabricaContext();
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

  // Enlace de los eventos de clic en el iframe para edición visual en tiempo real
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.head || !doc.body) return;

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

    // ðŸ§  5. CONTINUIDADE DO DIAGNÓSTICO (Ponto 3):
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
    const SYNC_KEY = "fabrica-phase4-autosync-v1";
    localStorage.removeItem(SYNC_KEY);
    update({
      selectedPackages: [],
      siteContent: {
        ...state.siteContent,
        heroHeadline: "",
        heroSubheadline: "",
        heroCtaLabel: "Hablar por WhatsApp",
        finalCtaTitle: "¿Listo para tu próximo viaje?",
        finalCtaLabel: "Llamar por WhatsApp",
        galleryImages: [],
      },
    });
    setAutoSyncDone(false);
    setAutoSyncFields([]);
    toast.success("Sitio restaurado a la plantilla en blanco.");
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

  const handleDownload = () => {
    setDownloadCount((c) => c + 1);
    downloadLandingHTML(state, downloadCount + 1, user?.id);
    toast.success(`Versión ${downloadCount + 1} descargada! Súbela a Lovable, Vercel o Netlify.`);
  };

  return (
    <div className="max-w-3xl lg:max-w-[1550px] mx-auto transition-all duration-300">
      {/* ── Banner de Auto-Sync da Fase 3 ── */}
      {autoSyncDone && autoSyncFields.length > 0 && (
        <div className="rounded-2xl p-4 border bg-emerald-500/10 border-emerald-500/25 flex items-start gap-3 mb-6">
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
          <button
            onClick={resetSiteToBlank}
            className="flex-shrink-0 text-[10px] font-bold text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 rounded-lg px-3 py-1.5 transition-all whitespace-nowrap"
            title="Limpiar todo y comenzar de cero"
          >
            Limpiar sitio
          </button>
        </div>
      )}

      {!autoSyncDone && (state.destinos?.[0] || state.lastPrice) && (
        <div className="rounded-2xl p-4 border bg-white/[0.04] border-white/10 flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg flex-shrink-0">🔄</span>
            <p className="text-[11px] text-white/50 leading-snug">
              Datos de la Fábrica ya sincronizados con este sitio.
              <span className="ml-1 text-white/30">Edita haciendo clic en la vista previa al lado o usa los ajustes.</span>
            </p>
          </div>
          <button
            onClick={resetSiteToBlank}
            className="flex-shrink-0 text-[10px] font-bold text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 rounded-lg px-3 py-1.5 transition-all whitespace-nowrap"
          >
            Empezar de cero
          </button>
        </div>
      )}

      {/* Grid lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          {/* PUBLICAÇÃO DIRETA NO VERCEL (Movido para o topo) */}
          <PublishOnLovableCard primaryColor={state.primaryColor} html={previewHTML} onBack={onBack} onNext={onNext} />

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
              <p className="text-xs text-white/50 mt-3">Aplicado en botones, encabezados y CTAs.</p>
            </FabricaCard>

            <FabricaCard title="👁️ Secciones del sitio">
              <p className="text-xs text-white/50 mb-3">
                Elige lo que aparece en el sitio. Desmarca cualquier sección para eliminarla (también se elimina del HTML exportado).
              </p>
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

            <FabricaCard title="✨ Efeitos Visuais & Campanhas">
              <p className="text-xs text-white/50 mb-4">
                Adicione efeitos visuais flutuantes na tela para destacar campanhas e ofertas especiais de forma sutil.
              </p>
              
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

          {/* BARRA DE AÇÕES INFERIOR FIXA */}
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
                background: `linear-gradient(135deg, ${state.primaryColor}, #FCD34D)`,
                boxShadow: `0 8px 24px ${state.primaryColor}55`,
              }}
            >
              <Download className="w-4 h-4" /> Descargar HTML {downloadCount > 0 && `(v${downloadCount})`}
            </button>
          </div>


        </div>

        {/* Painel Direito: Preview do Site (7 colunas em lg, Sticky) */}
        <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-zinc-950 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                </div>
                <div className="ml-3 px-3 py-1 rounded-lg bg-white/[0.04] text-[11px] font-mono text-white/50 w-44 sm:w-64 truncate border border-white/5">
                  https://{(state.agencyName || "sua-agencia").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-")}.vercel.app
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
                <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/15">
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

            <div className="p-4 bg-zinc-950/40 relative">
              <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-300 font-semibold flex items-center justify-center gap-2">
                <Pencil className="w-4 h-4 text-amber-400" />
                💡 <strong>Haz clic en cualquier texto del sitio para escribir</strong> o <strong>toca una foto</strong> para cambiarla en vivo en la pantalla!
              </div>

              <div className="transition-all duration-300 ease-in-out">
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHTML}
                  className={`bg-white transition-all duration-300 shadow-xl ${
                    previewMode === "mobile"
                      ? "w-[375px] h-[720px] mx-auto border-[10px] border-zinc-800 rounded-[36px]"
                      : "w-full h-[1150px] border border-white/10 rounded-2xl"
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
        <span className="text-[10px] text-white/40 italic">â†’ "Hola, tengo interés en {pacote.title || "..."}"</span>
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
                toast.success("Imagem removida");
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
  const [newUrl, setNewUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 3MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onAdd(dataUrl);
    };
    reader.readAsDataURL(file);
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
          Nenhuma imagem ainda. Adicione abaixo ðŸ‘‡
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
            if (newUrl.trim()) {
              onAdd(newUrl.trim());
              setNewUrl("");
            }
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
        className="w-full py-2.5 rounded-lg border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 text-xs font-semibold flex items-center justify-center gap-2"
      >
        <Upload className="w-3.5 h-3.5" /> O sube desde tu computadora
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

const PublishOnLovableCard = ({
  primaryColor,
  html,
  onBack,
  onNext,
}: {
  primaryColor: string;
  html: string;
  onBack: () => void;
  onNext: () => void;
}) => {
  const { state, update } = useFabricaContext();
  const { user } = useAuth();

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // ── ESTADOS Y FUNCIONES PARA LA PUBLICACIÓN EN 1-CLIC EN VERCEL ──
  const [vercelSubdomain, setVercelSubdomain] = useState(() => {
    if (state.siteContent.vercelUrl) {
      return state.siteContent.vercelUrl.replace("https://", "").replace(".vercel.app", "");
    }
    const rawAgency = state.agencyName || "";
    return rawAgency
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // elimina acentos
      .replace(/[^a-z0-9]/g, "-") // solo minusculas y guiones
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  });

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

    setIsPublishing(true);
    try {
      // Bypass Supabase Storage RLS entirely by saving to public_sites table
      const { error: dbError } = await supabase
        .from("public_sites")
        .upsert({
          id: state.projectId || user.id,
          owner_id: user.id,
          html: html
        });

      if (dbError) {
        throw dbError;
      }


      const internalUrl = `${window.location.origin}/view/${state.projectId || user.id}`;
      setPublishedUrl(internalUrl);
      toast.success("🚀 ¡SITIO PUBLICADO CON ÉXITO!");

      if (typeof window !== "undefined" && (window as any).confetti) {
        (window as any).confetti();
      }

    } catch (err: any) {
      console.error("Publish error:", err);
      toast.error(`Error al publicar: ${err.message || "Verifica tu conexión"}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      toast.success("¡HTML copiado! Pégalo en Lovable para generar la web.");
    } catch {
      toast.error("No se pudo copiar. Usa el botón Descargar HTML.");
    }
  };

  const copyUpdatePrompt = async () => {
    try {
      const prompt = generateUpdatePackagesPrompt(state);
      await navigator.clipboard.writeText(prompt);
      toast.success("🚀 ¡Prompt de actualización copiado! Ahora pégalo en el chat de tu Lovable.");
    } catch {
      toast.error("Error al copiar el prompt.");
    }
  };

  return (
    <div
      className="rounded-3xl p-6 sm:p-8 border-2 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}18, #FCD34D08)`,
        borderColor: `${primaryColor}55`,
        boxShadow: `0 20px 60px ${primaryColor}22`,
      }}
    >
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: primaryColor }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Publicar Sitio
            </h3>
          </div>
        </div>


        {/* PUBLICACIÓN DIRECTA */}
        <div 
          className="my-4 p-6 rounded-2xl border-2 backdrop-blur-xl transition-all relative overflow-hidden text-left"
          style={{ 
            borderColor: state.siteContent.vercelUrl ? "#10B98188" : `${primaryColor}44`,
            background: state.siteContent.vercelUrl 
              ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,0,0,0.4))"
              : "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(0,0,0,0.4))",
            boxShadow: state.siteContent.vercelUrl ? "0 10px 30px rgba(16,185,129,0.1)" : "none"
          }}
        >

          {/* Si ya está publicado, muestra el enlace destacado */}
          {state.siteContent.vercelUrl && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">¡Tu sitio está en línea! 🌟</div>
                <a 
                  href={state.siteContent.vercelUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white hover:underline flex items-center gap-1.5 mt-0.5 group"
                >
                  {state.siteContent.vercelUrl}
                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                </a>
              </div>
              <a 
                href={state.siteContent.vercelUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all text-center"
              >
                Acceder al Sitio del Cliente
              </a>
            </div>
          )}

          {/* Form de Publicación */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                NOMBRE DEL DOMINIO (ENLACE DEL SITIO):
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-r-0 rounded-l-lg text-xs text-white/40 select-none">
                  https://
                </span>
                <input
                  type="text"
                  value={vercelSubdomain}
                  onChange={(e) => setVercelSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  placeholder="nombre-de-tu-agencia"
                  className="flex-1 bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white font-semibold outline-none focus:border-white/30"
                />
                <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-l-0 rounded-r-lg text-xs text-white/40 select-none">
                  .vercel.app
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Meta Pixel ID (Opcional):
                </label>
                <input
                  type="text"
                  value={state.metaPixelId || ""}
                  onChange={(e) => update({ metaPixelId: e.target.value })}
                  placeholder="Ex: 123456789012345"
                  className="w-full bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white rounded-lg outline-none focus:border-white/30"
                />
              </div>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleDownload}
                className="py-3 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all text-sm bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
              >
                <Download className="w-4 h-4" /> 1. Descargar HTML
              </button>

              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all text-sm hover:brightness-110"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, #F59E0B)` }}
              >
                🚀 2. Abrir Vercel (Upload)
              </a>
            </div>

            {/* VERCEL MANUAL INSTRUCTIONS */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <h4 className="text-xs font-bold text-white tracking-wide uppercase mb-3 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-emerald-400" /> Cómo publicar gratis
              </h4>
              <div className="space-y-3 text-[11px] text-white/70 leading-relaxed mb-4">
                <div className="flex gap-2 items-start">
                  <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5">1</span>
                  <p>
                    Haz clic en el botón verde <strong className="text-emerald-400">"Descargar HTML"</strong> arriba para guardar el archivo en tu computadora.
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5">2</span>
                  <p>
                    Crea una nueva carpeta en tu computadora y coloca el archivo HTML descargado dentro. Renombra el archivo a <strong className="text-emerald-400">index.html</strong> si es necesario.
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5">3</span>
                  <p>
                    ¡Accede a Vercel con el botón amarillo y arrastra esa carpeta al panel para publicar inmediatamente!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Temporariamente oculto - voltar depois */}
        {false && (
        <details className="mt-6 p-4 rounded-xl border border-white/10 bg-white/[0.02] group text-left">
          <summary className="list-none cursor-pointer text-sm font-semibold text-white/60 hover:text-white transition-colors flex items-center gap-2">
            <span>Opciones Avanzadas (Lovable)</span>
          </summary>
          <div className="mt-4 space-y-4">
            <p className="text-xs text-white/60 leading-relaxed">
              ¿Quieres personalizar fuentes, layout avanzado o usar dominio propio? Edita en Lovable y pide ediciones avanzadas por IA.
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="text-xs text-white/50 bg-black/40 p-3 rounded-lg border border-white/5">
                <strong className="text-white">Paso 1:</strong> Copia el prompt de actualización abajo.
              </div>
              <div className="text-xs text-white/50 bg-black/40 p-3 rounded-lg border border-white/5">
                <strong className="text-white">Paso 2:</strong> Abre Lovable y pega el prompt en el chat.
              </div>
              <div className="text-xs text-white/50 bg-black/40 p-3 rounded-lg border border-white/5">
                <strong className="text-white">Paso 3:</strong> ¡Deja que Lovable genere tu sitio actualizado!
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={copyUpdatePrompt}
                className="flex-1 py-3 px-3 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/[0.04] transition-all text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4" /> 1. Copiar Prompt
              </button>
              <a
                href={LOVABLE_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-3 rounded-lg bg-white/[0.06] border border-white/15 text-white text-xs font-semibold hover:bg-white/[0.10] transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> 2. Abrir Lovable <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </details>
        )}

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
              background: primaryColor, 
              color: primaryColor === "#000000" ? "#ffffff" : "#000000",
              border: primaryColor === "#000000" ? "1px solid rgba(255,255,255,0.3)" : "none",
              boxShadow: `0 0 20px ${primaryColor}55`
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
  const { state } = useFabricaContext();
  const primaryColor = state.primaryColor || "#F59E0B";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="bg-white/[0.03] border rounded-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden"
      style={{
        borderColor: isOpen ? `${primaryColor}66` : "rgba(255, 255, 255, 0.06)",
        boxShadow: isOpen ? `0 10px 30px ${primaryColor}15` : "none",
      }}
    >
      {/* Header clicável para abrir/fechar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none select-none group"
      >
        <h3
          className="text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2"
          style={{ color: isOpen ? primaryColor : "rgba(255, 255, 255, 0.6)" }}
        >
          {isOpen && (
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            />
          )}
          {title}
        </h3>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 text-sm font-black"
          style={{
            borderColor: isOpen ? `${primaryColor}66` : "rgba(255, 255, 255, 0.15)",
            backgroundColor: isOpen ? `${primaryColor}15` : "transparent",
            color: isOpen ? primaryColor : "rgba(255, 255, 255, 0.6)",
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


