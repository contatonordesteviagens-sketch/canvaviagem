import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFabricaContext, type Pacote, type Depoimento, type SocialLink, type SocialType } from "@/hooks/useFabricaContext";
import { supabase } from "@/integrations/supabase/client";
import { downloadLandingHTML, buildLandingHTML, generateUpdatePackagesPrompt } from "@/lib/fabrica-html-export";
import { CloudSaveIndicator } from "@/components/fabrica/CloudSaveIndicator";
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
const CANVA_VIAGEM_DOMAIN = "canvaviagem.com";
const FABRICA_SITE_STORAGE_CONTENT_TYPE = "image/webp";
const CANVA_VIAGEM_SITE_BASE_URL = `https://${CANVA_VIAGEM_DOMAIN}/view`;

const buildSiteSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

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
  const { state, update, systemUpdate, undo, redo, canUndo, canRedo, isHydrated } = useFabricaContext();
  const { user } = useAuth();
  const [previewing, setPreviewing] = useState(true);
  const [downloadCount, setDownloadCount] = useState(0);
  const [autoSyncDone, setAutoSyncDone] = useState(false);
  const [autoSyncFields, setAutoSyncFields] = useState<string[]>([]);
  const [pickingHeroImage, setPickingHeroImage] = useState(false);

  // ── ESTADOS E REF PARA EDIÇÃO VISUAL DIRETA E INTUITIVA NA PRÉVIA ──
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
      toast.success("Logo atualizada com sucesso!");
    } else if (activeImageEdit.type === "hero") {
      updSite({ heroImageUrl: url });
      toast.success("Banner principal atualizado com sucesso!");
    } else if (activeImageEdit.type === "about") {
      updSite({ aboutImageUrl: url });
      toast.success("Foto da equipe/empresa atualizada!");
    } else if (activeImageEdit.type === "package" && activeImageEdit.packageId) {
      updPacote(activeImageEdit.packageId, { imageUrl: url });
      toast.success("Foto do pacote atualizada com sucesso!");
    }

    // Adiciona ao banco de imagens para reuso se já não estiver lá
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

  // Bind dos eventos de clique no iframe para edição visual em tempo real
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.head || !doc.body) return;

      // Injeta estilos de hover, focus e indicador visual de edição
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

      // 1. Textos editáveis (contenteditable)
      const textSelectors = [
        ".brand-name",
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
        ".btn",
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
          
          // Hero
          if (el.classList.contains("brand-name")) update({ agencyName: textVal });
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
              const steps = [...(state.siteContent.processoSteps || [])];
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
              const feats = [...(state.siteContent.equipeFeatures || [])];
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
          
          // Pacotes dinâmicos
          else if (el.closest(".dest-card")) {
            const destCard = el.closest(".dest-card");
            const allCards = Array.from(doc.querySelectorAll(".dest-card"));
            const idx = allCards.indexOf(destCard as Element);
            if (idx !== -1 && state.selectedPackages[idx]) {
              const pkgId = state.selectedPackages[idx].id;
              if (el.tagName === "H3") updPacote(pkgId, { title: textVal });
              else if (el.tagName === "P") updPacote(pkgId, { description: textVal });
              else if (el.classList.contains("price-value") || el.classList.contains("price-main")) updPacote(pkgId, { price: textVal });
              else if (el.classList.contains("dest-tag")) updPacote(pkgId, { category: textVal } as any);
            }
          }
          // Depoimentos
          else if (el.closest(".depo-card")) {
            const depoCard = el.closest(".depo-card");
            const allDepos = Array.from(doc.querySelectorAll(".depo-card"));
            const idx = allDepos.indexOf(depoCard as Element);
            if (idx !== -1 && state.depoimentos[idx]) {
              if (el.classList.contains("depo-text")) updDepo(idx, { text: textVal });
              else if (el.classList.contains("depo-name")) updDepo(idx, { name: textVal });
            }
          }
        });
      });

      // 2. Imagens clicáveis/trocáveis
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
    const SYNC_KEY = "fabrica-phase4-autosync-v1";
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
        patches["siteContent.heroSubheadline"] = `Roteiros para ${ds.join(", ")} e outros destinos incríveis. Atendimento personalizado e suporte 24h.`;
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
        heroCtaLabel: "Falar no WhatsApp",
        finalCtaTitle: "Pronto para sua próxima viagem?",
        finalCtaLabel: "Chamar no WhatsApp",
        galleryImages: [],
      },
    });
    setAutoSyncDone(false);
    setAutoSyncFields([]);
    toast.success("Site resetado para o modelo em branco.");
  };

  // Pacotes
  const addPacote = () => {
    const novo: Pacote = {
      id: String(Date.now()),
      title: "Novo pacote",
      description: "Descreva o que está incluso",
      price: "R$ 0,00",
      imageUrl: "",
      ctaLabel: "Quero esse",
    };
    update({ selectedPackages: [...state.selectedPackages, novo] });
  };
  const updPacote = (id: string, patch: Partial<Pacote>) => {
    update({ selectedPackages: state.selectedPackages.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
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

  const handleDownload = () => {
    setDownloadCount((c) => c + 1);
    downloadLandingHTML(state, downloadCount + 1, user?.id);
    toast.success(`Versão ${downloadCount + 1} baixada! Suba pro Lovable, Vercel ou Netlify.`);
  };

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="max-w-3xl lg:max-w-[1550px] mx-auto transition-all duration-300">
      {/* ── Indicador de salvamento na nuvem ── */}
      <div className="flex justify-end mb-3">
        <CloudSaveIndicator />
      </div>
      {/* ── Banner de Auto-Sync da Fase 3 ── */}
      {autoSyncDone && autoSyncFields.length > 0 && (
        <div className="rounded-2xl p-4 border bg-emerald-500/10 border-emerald-500/25 flex items-start gap-3 mb-6">
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
          <button
            onClick={resetSiteToBlank}
            className="flex-shrink-0 text-[10px] font-bold text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 rounded-lg px-3 py-1.5 transition-all whitespace-nowrap"
            title="Limpar tudo e começar do zero"
          >
            Limpar site
          </button>
        </div>
      )}

      {!autoSyncDone && (state.destinos?.[0] || state.lastPrice) && (
        <div className="rounded-2xl p-4 border bg-white/[0.04] border-white/10 flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg flex-shrink-0">🔄</span>
            <p className="text-[11px] text-white/50 leading-snug">
              Dados da Fábrica já sincronizados com este site.
              <span className="ml-1 text-white/30">Edite clicando na prévia ao lado ou use as configurações.</span>
            </p>
          </div>
          <button
            onClick={resetSiteToBlank}
            className="flex-shrink-0 text-[10px] font-bold text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 rounded-lg px-3 py-1.5 transition-all whitespace-nowrap"
          >
            Começar do zero
          </button>
        </div>
      )}

      {/* Grid lateral */}
      <div className="flex flex-col-reverse gap-8 items-stretch">
        {/* Painel Esquerdo: Opções de Configuração (5 colunas em lg) */}
        <div className="w-full space-y-6">
          {/* PUBLICAÇÃO DIRETA NO VERCEL (Movido para o topo) */}
          <PublishOnLovableCard primaryColor={state.primaryColor} html={previewHTML} onBack={onBack} onNext={onNext} />

          <div className="border-b border-white/10 pb-4 pt-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-400" />
              ⚙️ Ajustes Finos e Configurações Avançadas do Site:
            </h4>
          </div>

            <FabricaCard title="📦 Pacotes oferecidos">
              <FieldText
                label="Título da seção"
                value={state.siteContent.pacotesTitle}
                onChange={(v) => updSite({ pacotesTitle: v })}
              />
              <div className="space-y-3 mt-4">
                {state.selectedPackages.map((p) => (
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
                  <Plus className="w-4 h-4" /> Adicionar pacote
                </button>
              </div>
            </FabricaCard>

          <div className="space-y-6">
            <FabricaCard title="🎨 Cor primária do site">
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
              <p className="text-xs text-white/50 mt-3">Aplicada em botões, headers e CTAs.</p>
            </FabricaCard>

            <FabricaCard title="📍 Endereço e Mapa">
              <div className="space-y-3">
                <FieldText
                  label="Endereço da Agência"
                  value={state.address || ""}
                  onChange={(v) => update({ address: v })}
                  placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                />
                <p className="text-xs text-white/50">
                  Ao preencher o endereço, um Google Map interativo responsivo será exibido automaticamente no rodapé do seu site! Deixe em branco caso não queira exibir o mapa.
                </p>
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
              <p className="text-xs text-white/50 mb-3">
                Escolha o que aparece no site. Desmarque qualquer seção pra removê-la (some também do HTML exportado).
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { key: "hero", label: "Topo (Hero)" },
                    { key: "processo", label: "Como funciona (3 passos)" },
                    { key: "destinos", label: "Destinos / Pacotes" },
                    { key: "porQue", label: "Por que nós / Equipe" },
                    { key: "depoimentos", label: "Depoimentos" },
                    { key: "orcamento", label: "Formulário de orçamento" },
                    { key: "faq", label: "Perguntas Frequentes" },
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
          <div className="flex gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 mt-6">
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 font-semibold hover:bg-white/[0.08] flex items-center justify-center gap-2"
            >
              Voltar
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              style={{
                background: `linear-gradient(135deg, ${state.primaryColor}, #FCD34D)`,
                boxShadow: `0 8px 24px ${state.primaryColor}55`,
              }}
            >
              <Download className="w-4 h-4" /> Baixar HTML {downloadCount > 0 && `(v${downloadCount})`}
            </button>
          </div>


        </div>

        {/* Painel Direito: Preview do Site (7 colunas em lg, Sticky) */}
        <div className="w-full space-y-6">
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

                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Editor Visual
                </span>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/40 relative">
              <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-300 font-semibold flex items-center justify-center gap-2">
                <Pencil className="w-4 h-4 text-amber-400" />
                💡 <strong>Clique em qualquer texto do site para digitar</strong> ou <strong>toque em uma foto</strong> para trocá-la ao vivo na tela!
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


      {/* 🖼️ MODAL GLOBAL DE SELEÇÃO DE IMAGEM (DISPARADO AO CLICAR NA PRÉVIA) */}
      {globalPickingImage && activeImageEdit && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => {
                setGlobalPickingImage(false);
                setActiveImageEdit(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.04] text-white/50 hover:bg-white/[0.1] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Trocar Foto {activeImageEdit.type === "logo" ? "da Logo" : activeImageEdit.type === "hero" ? "do Banner" : activeImageEdit.type === "about" ? "da Equipe / Agência" : "do Pacote"}
              </h3>
            </div>

            <p className="text-xs text-white/60 mb-4">
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

      {pickingImage && (
        <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-3">
          <div className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Escolher imagem</div>

          {/* Galeria salva */}
          {gallery.length > 0 && (
            <div>
              <div className="text-[10px] text-white/40 mb-2">Do seu banco:</div>
              <div className="grid grid-cols-4 gap-2">
                {gallery.map((url) => (
                  <button
                    key={url}
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
        <Upload className="w-3.5 h-3.5" /> Ou faça upload do seu computador
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
  const [canvaViagemSubdomain, setCanvaViagemSubdomain] = useState(() => {
    if (state.siteContent.canvaViagemUrl) {
      const savedUrl = state.siteContent.canvaViagemUrl.replace(/\/$/, "");
      if (savedUrl.includes(`/${CANVA_VIAGEM_DOMAIN}/view/`)) {
        return savedUrl.split("/").pop() || "";
      }
      return savedUrl.replace("https://", "").replace(`.${CANVA_VIAGEM_DOMAIN}`, "");
    }
    return buildSiteSlug(state.agencyName || "");
  });
  const [isCanvaViagemPublishing, setIsCanvaViagemPublishing] = useState(false);

  // ── ESTADOS E FUNÇÕES PARA A PUBLICAÇÃO 1-CLIQUE NO VERCEL ──
  const [vercelSubdomain, setVercelSubdomain] = useState(() => {
    if (state.siteContent.vercelUrl) {
      return state.siteContent.vercelUrl.replace("https://", "").replace(".vercel.app", "");
    }
    const rawAgency = state.agencyName || "";
    return rawAgency
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/[^a-z0-9]/g, "-") // apenas minusculas e hifens
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  });

  const [isVercelDeploying, setIsVercelDeploying] = useState(false);
  const [customVercelToken, setCustomVercelToken] = useState(() => localStorage.getItem("vercel_token") || "");
  const [showVercelConfig, setShowVercelConfig] = useState(false);

  const handleVercelPublish = async () => {
    const token = (import.meta.env.VITE_VERCEL_TOKEN || customVercelToken || "").trim();
    if (!token) {
      toast.error("Vercel Token não configurado! Clique em 'Configurar Conta' abaixo e insira seu token.");
      setShowVercelConfig(true);
      return;
    }

    const cleanSubdomain = vercelSubdomain
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!cleanSubdomain) {
      toast.error("Por favor, digite um nome de subdomínio válido.");
      return;
    }

    setIsVercelDeploying(true);
    const toastId = toast.loading("Preparando publicação no Vercel...");

    try {
      toast.loading("Otimizando imagens do site (isso pode levar alguns segundos)...", { id: toastId });
      
      let finalHtml = html;
      const base64Regex = /src="(data:image\/[^;]+;base64,[^"]+)"/g;
      const matches = [...finalHtml.matchAll(base64Regex)];
      
      for (let i = 0; i < matches.length; i++) {
        const fullMatch = matches[i][0];
        const base64Data = matches[i][1];
        
        try {
          const mimeType = base64Data.split(';')[0].split(':')[1];
          const b64Data = base64Data.split(',')[1];
          const byteCharacters = atob(b64Data);
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let j = 0; j < slice.length; j++) {
              byteNumbers[j] = slice.charCodeAt(j);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          const blob = new Blob(byteArrays, { type: mimeType });
          
          const ext = mimeType.split('/')[1] || 'webp';
          const filename = `vercel_assets/${user?.id || 'anon'}_${Date.now()}_${i}.${ext}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("thumbnails")
            .upload(filename, blob, { contentType: mimeType, upsert: true });
            
          if (!uploadError && uploadData) {
            const publicUrl = supabase.storage.from("thumbnails").getPublicUrl(filename).data.publicUrl;
            finalHtml = finalHtml.replace(fullMatch, `src="${publicUrl}"`);
          }
        } catch (e) {
          console.warn("Falha ao fazer upload da imagem base64", e);
        }
      }

      toast.loading("Enviando código otimizado para o Vercel...", { id: toastId });

      const domain = `${cleanSubdomain}.vercel.app`;
      const liveUrl = `https://${domain}`;

      if (state.siteContent.vercelUrl && state.siteContent.vercelUrl !== liveUrl) {
        try {
          const oldSlug = state.siteContent.vercelUrl.replace("https://", "").replace(".vercel.app", "").replace(/\/$/, "");
          if (oldSlug && oldSlug !== cleanSubdomain) {
            await fetch(`https://api.vercel.com/v9/projects/${oldSlug}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        } catch (e) {
          console.error("Erro ao deletar projeto antigo no Vercel:", e);
        }
      }

      // Envia deploy para o Vercel usando API v13
      const res = await fetch("https://api.vercel.com/v13/deployments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanSubdomain,
          files: [
            {
              file: "index.html",
              data: btoa(unescape(encodeURIComponent(finalHtml))),
              encoding: "base64",
            },
          ],
          projectSettings: {
            framework: null,
          },
          target: "production",
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.error?.message || "Erro na resposta da API Vercel");
      }

      // Salva no estado global
      update({
        siteContent: {
          ...state.siteContent,
          vercelUrl: liveUrl,
        },
      });

      toast.success("🚀 PARABÉNS! SEU SITE ESTÁ NO AR NO VERCEL!", { id: toastId });

      if (typeof window !== "undefined" && (window as any).confetti) {
        (window as any).confetti();
      }
    } catch (err: any) {
      console.error("Vercel Deploy Error:", err);
      toast.error(`Erro ao publicar no Vercel: ${err.message || "Tente novamente"}`, { id: toastId });
    } finally {
      setIsVercelDeploying(false);
    }
  };

  const handleSaveToken = (val: string) => {
    setCustomVercelToken(val);
    localStorage.setItem("vercel_token", val.trim());
    if (val.trim()) {
      toast.success("Vercel Token salvo localmente!");
    }
  };

  const handleDirectPublish = async () => {
    if (!user?.id) {
      toast.error("Faça login para publicar.");
      return;
    }

    setIsPublishing(true);
    try {
      const blob = new Blob([html], { type: FABRICA_SITE_STORAGE_CONTENT_TYPE });
      const fileName = `sites/${user.id}.html`;
      
      const rawName = state.agencyName || `agencia-${user.id.substring(0,4)}`;
      const cleanSlug = rawName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const slugName = `sites/${cleanSlug}.html`;

      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(fileName, blob, {
          contentType: FABRICA_SITE_STORAGE_CONTENT_TYPE,
          upsert: true,
          cacheControl: '0'
        });

      if (uploadError) throw uploadError;

      if (cleanSlug.length > 2) {
         await supabase.storage.from("thumbnails").upload(slugName, blob, { contentType: FABRICA_SITE_STORAGE_CONTENT_TYPE, upsert: true, cacheControl: '0' }).catch(e => console.warn("Subdomain upload error:", e));
      }

      const internalUrl = `${window.location.origin}/view/${user.id}`;
      setPublishedUrl(internalUrl);
      toast.success("🚀 SITE PUBLICADO COM SUCESSO!");

      if (typeof window !== "undefined" && (window as any).confetti) {
        (window as any).confetti();
      }

    } catch (err: any) {
      console.error("Publish error:", err);
      toast.error(`Erro ao publicar: ${err.message || "Verifique sua conexão"}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCanvaViagemPublish = async () => {
    if (!user?.id) {
      toast.error("Faça login para publicar.");
      return;
    }

    const cleanSlug = buildSiteSlug(canvaViagemSubdomain || state.agencyName || "");

    if (cleanSlug.length < 3) {
      toast.error("Digite um subdomínio com pelo menos 3 caracteres.");
      return;
    }

    const reserved = new Set(["www", "app", "admin", "api", "painel", "blog"]);
    if (reserved.has(cleanSlug)) {
      toast.error("Esse subdomínio é reservado. Escolha outro nome.");
      return;
    }

    setIsCanvaViagemPublishing(true);
    const toastId = toast.loading("Publicando no link Canva Viagem...");

    try {
      toast.loading("Otimizando imagens do site para o Canva Viagem (isso pode levar alguns segundos)...", { id: toastId });
      let finalHtml = html;
      const base64Regex = /src="(data:image\/[^;]+;base64,[^"]+)"/g;
      const matches = [...finalHtml.matchAll(base64Regex)];
      
      for (let i = 0; i < matches.length; i++) {
        const fullMatch = matches[i][0];
        const base64Data = matches[i][1];
        
        try {
          const mimeType = base64Data.split(';')[0].split(':')[1];
          const b64Data = base64Data.split(',')[1];
          const byteCharacters = atob(b64Data);
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let j = 0; j < slice.length; j++) {
              byteNumbers[j] = slice.charCodeAt(j);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          const blob = new Blob(byteArrays, { type: mimeType });
          
          const ext = mimeType.split('/')[1] || 'webp';
          const filename = `vercel_assets/${user?.id || 'anon'}_${Date.now()}_cv_${i}.${ext}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("thumbnails")
            .upload(filename, blob, { contentType: mimeType, upsert: true });
            
          if (!uploadError && uploadData) {
            const publicUrl = supabase.storage.from("thumbnails").getPublicUrl(filename).data.publicUrl;
            finalHtml = finalHtml.replace(fullMatch, `src="${publicUrl}"`);
          }
        } catch (e) {
          console.warn("Falha ao fazer upload da imagem base64 no Canva Viagem", e);
        }
      }

      toast.loading("Enviando código para o Canva Viagem...", { id: toastId });

      const liveUrl = `${CANVA_VIAGEM_SITE_BASE_URL}/${cleanSlug}`;
      const fileName = `sites/${cleanSlug}.webp`; // bypass RLS

      if (state.siteContent.canvaViagemUrl && state.siteContent.canvaViagemUrl !== liveUrl) {
        try {
          const oldUrl = state.siteContent.canvaViagemUrl.replace(/\/$/, "");
          let oldSlug = "";
          if (oldUrl.includes(`/${CANVA_VIAGEM_DOMAIN}/view/`)) {
            oldSlug = oldUrl.split("/").pop() || "";
          } else {
            oldSlug = oldUrl.replace("https://", "").replace(`.${CANVA_VIAGEM_DOMAIN}`, "");
          }
          if (oldSlug && oldSlug !== cleanSlug) {
            await supabase.storage.from("thumbnails").remove([`sites/${oldSlug}.html`, `sites/${oldSlug}.webp`]);
          }
        } catch (e) {
          console.error("Erro ao deletar antigo Supabase:", e);
        }
      }

      const blob = new Blob([finalHtml], { type: FABRICA_SITE_STORAGE_CONTENT_TYPE });
      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(fileName, blob, {
          contentType: FABRICA_SITE_STORAGE_CONTENT_TYPE,
          upsert: true,
          cacheControl: "0",
        });

      if (uploadError) throw uploadError;

      await supabase.storage
        .from("thumbnails")
        .upload(`sites/${user.id}.webp`, blob, {
          contentType: FABRICA_SITE_STORAGE_CONTENT_TYPE,
          upsert: true,
          cacheControl: "0",
        })
        .catch((error) => console.warn("User mirror upload error:", error));

      update({
        siteContent: {
          ...state.siteContent,
          canvaViagemUrl: liveUrl,
        },
      });

      toast.success("Site publicado no link Canva Viagem!", { id: toastId });
    } catch (err: any) {
      console.error("Canva Viagem publish error:", err);
      toast.error(`Erro ao publicar: ${err.message || "tente novamente"}`, { id: toastId });
    } finally {
      setIsCanvaViagemPublishing(false);
    }
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      toast.success("HTML copiado! Cole no Lovable para gerar o site.");
    } catch {
      toast.error("Não foi possível copiar. Use o botão Baixar HTML.");
    }
  };

  const copyUpdatePrompt = async () => {
    try {
      const prompt = generateUpdatePackagesPrompt(state);
      await navigator.clipboard.writeText(prompt);
      toast.success("🚀 Prompt de atualização copiado! Agora cole no chat do seu Lovable.");
    } catch {
      toast.error("Erro ao copiar prompt.");
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
              Publique seu site
            </h3>
          </div>
        </div>

        <p className="text-sm text-white/70 mb-5 leading-relaxed">
          Escolha a sua opção preferida para publicar ou baixar o código completo do seu site perfeitamente como ele está:
        </p>

        {/* PUBLICAÇÃO DIRETA */}
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

          {/* Se já estiver publicado, mostra o link em destaque */}
          {state.siteContent.vercelUrl && (
            <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Seu Site está Online! 🌟</div>
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
                className="px-4 py-2 rounded-lg bg-white hover:bg-gray-200 text-black font-bold text-xs transition-all text-center"
              >
                Acessar Site do Cliente
              </a>
            </div>
          )}

          {/* Form de Publicação */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                NOME DO DOMÍNIO (LINK DO SITE):
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-r-0 rounded-l-lg text-xs text-white/40 select-none">
                  https://
                </span>
                <input
                  type="text"
                  value={vercelSubdomain}
                  onChange={(e) => setVercelSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  placeholder="nome-da-sua-agencia"
                  className="flex-1 bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white font-semibold outline-none focus:border-white/30"
                />
                <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-l-0 rounded-r-lg text-xs text-white/40 select-none">
                  .vercel.app
                </span>
              </div>
            </div>



            {showVercelConfig && (
              <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Vercel Access Token:
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={customVercelToken}
                    onChange={(e) => setCustomVercelToken(e.target.value)}
                    placeholder="Sua chave secreta da Vercel"
                    className="flex-1 bg-black/40 border border-amber-500/20 px-3 py-2 text-sm text-white rounded-lg outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => handleSaveToken(customVercelToken)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition-all"
                  >
                    Salvar Token
                  </button>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  Crie um token em <a href="https://vercel.com/account/tokens" target="_blank" className="text-amber-400 hover:underline">vercel.com/account/tokens</a> e cole aqui.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleVercelPublish}
                disabled={isVercelDeploying}
                className="py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:brightness-110 disabled:brightness-50 disabled:cursor-not-allowed transition-all text-sm"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, #F59E0B)`,
                  boxShadow: `0 4px 12px ${primaryColor}33`
                }}
              >
                {isVercelDeploying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    Publicar Site
                  </>
                )}
              </button>

              <button
                onClick={handleVercelPublish}
                disabled={isVercelDeploying}
                className="py-3.5 px-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 hover:brightness-110 disabled:brightness-50 disabled:cursor-not-allowed transition-all text-sm"
                style={{ 
                  background: "linear-gradient(135deg, #10B981, #34D399)",
                  boxShadow: "0 4px 12px rgba(16,185,129,0.2)"
                }}
              >
                {isVercelDeploying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    Atualizar Site
                  </>
                )}
              </button>
            </div>
          </div>
        </div>


        {/* PUBLICAÇÃO EM SUBDOMÍNIO CANVA VIAGEM */}
        <div className="my-4 p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl text-left">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.18em] mb-1">
                Nova opção
              </div>
              <h4 className="text-lg font-black text-white leading-tight">
                Publicar com link Canva Viagem
              </h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Gera um link seguro no seu domínio principal, como canvaviagem.com/view/nome-da-agencia.
              </p>
            </div>
            <LinkIcon className="w-5 h-5 text-white/40 flex-shrink-0" />
          </div>

          {state.siteContent.canvaViagemUrl && (
            <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Link Canva Viagem publicado</div>
                <a
                  href={state.siteContent.canvaViagemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white hover:underline flex items-center gap-1.5 mt-0.5 group"
                >
                  {state.siteContent.canvaViagemUrl}
                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                </a>
              </div>
              <a
                href={state.siteContent.canvaViagemUrl}
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
          <div className="flex items-center mb-3">
            <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-r-0 rounded-l-lg text-xs text-white/40 select-none">
              https://canvaviagem.com/view/
            </span>
            <input
              type="text"
              value={canvaViagemSubdomain}
              onChange={(e) => setCanvaViagemSubdomain(buildSiteSlug(e.target.value))}
              placeholder="nome-da-agencia"
              className="flex-1 min-w-0 bg-white/[0.02] border border-white/10 rounded-r-lg px-3 py-2 text-sm text-white font-semibold outline-none focus:border-white/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <button
              onClick={handleCanvaViagemPublish}
              disabled={isCanvaViagemPublishing}
              className="py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm border border-white/20 bg-white/5"
            >
              {isCanvaViagemPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Publicando...
                </>
              ) : (
                <>Publicar no Canva Viagem</>
              )}
            </button>

            <button
              onClick={handleCanvaViagemPublish}
              disabled={isCanvaViagemPublishing}
              className="py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm border border-white/20 bg-transparent"
            >
              {isCanvaViagemPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>Atualizar Canva Viagem</>
              )}
            </button>
          </div>

          <p className="text-[10px] text-white/45 mt-3 leading-relaxed">
            Essa opção salva o HTML no Supabase e usa o SSL que já existe no domínio principal.
          </p>
        </div>


        <div className="mt-6 p-5 rounded-xl border border-white/10 bg-white/[0.02] text-left">
          <h4 className="text-sm font-bold text-white mb-4">Configurações de Rastreamento</h4>
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
                className="w-full bg-black/20 border border-white/10 px-3 py-2.5 text-sm text-white rounded-lg outline-none focus:border-white/30 transition-colors"
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
                className="w-full bg-black/20 border border-white/10 px-3 py-2.5 text-sm text-white rounded-lg outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>
        </div>

        <details className="mt-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] group text-left">
          <summary className="list-none cursor-pointer text-sm font-semibold text-white/60 hover:text-white transition-colors flex items-center gap-2">
            <span>Opções Avançadas (Lovable)</span>
          </summary>
          <div className="mt-4 space-y-4">
            <p className="text-xs text-white/60 leading-relaxed">
              Quer customizar fontes, layout avançado ou usar domínio próprio? Você pode enviar o seu site para o Lovable e pedir edições avançadas por IA.
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="text-xs text-white/50 bg-black/40 p-3 rounded-lg border border-white/5">
                <strong className="text-white">Passo 1:</strong> Copie o prompt de atualização abaixo.
              </div>
              <div className="text-xs text-white/50 bg-black/40 p-3 rounded-lg border border-white/5">
                <strong className="text-white">Passo 2:</strong> Abra o Lovable e cole o prompt no chat.
              </div>
              <div className="text-xs text-white/50 bg-black/40 p-3 rounded-lg border border-white/5">
                <strong className="text-white">Passo 3:</strong> Deixe o Lovable gerar o seu site atualizado!
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
            onClick={onNext}
            className="flex-[2] py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            style={{ 
              background: "#ffffff", 
              color: "#000000",
              border: "none",
              boxShadow: "0 0 20px rgba(255,255,255,0.4)"
            }}
          >
            Avançar para a próxima fase <Rocket className="w-5 h-5" />
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

