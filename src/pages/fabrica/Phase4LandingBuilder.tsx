import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFabricaContext, type Pacote, type Depoimento } from "@/hooks/useFabricaContext";
import { supabase } from "@/integrations/supabase/client";
import { downloadLandingHTML, buildLandingHTML, generateUpdatePackagesPrompt } from "@/lib/fabrica-html-export";
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
} from "lucide-react";
import { toast } from "sonner";
import type { SectionVisibility } from "@/hooks/useFabricaContext";

const LOVABLE_INVITE_URL = "https://lovable.dev/invite/2ZD6VL6";
const PRESET_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#000000"];

export const Phase4LandingBuilder = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  const { state, update, undo, redo, canUndo, canRedo } = useFabricaContext();
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
    type: "logo" | "hero" | "package";
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
      if (!doc) return;

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
            // Se for dentro de um pacote (destination card)
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

            // Se for dentro de um depoimento
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
    const SYNC_KEY = "fabrica-phase4-autosync-v1";
    const lastSyncHash = localStorage.getItem(SYNC_KEY);
    const dest = (state.destinos?.[0] || "").trim();
    const currentHash = [dest, state.lastPrice, state.lastPaymentMode, state.agencyName].join("|");

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

    update(rootPatches);
    setAutoSyncFields(synced);
    setAutoSyncDone(true);
    localStorage.setItem(SYNC_KEY, currentHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Banner de Auto-Sync da Fase 3 ── */}
      {autoSyncDone && autoSyncFields.length > 0 && (
        <div className="rounded-2xl p-4 border bg-emerald-500/10 border-emerald-500/25 flex items-start gap-3">
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

      {/* Banner para o caso de o site já estar sincronizado (não é a primeira vez) */}
      {!autoSyncDone && (state.destinos?.[0] || state.lastPrice) && (
        <div className="rounded-2xl p-4 border bg-white/[0.04] border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg flex-shrink-0">🔄</span>
            <p className="text-[11px] text-white/50 leading-snug">
              Dados da Fábrica já sincronizados com este site.
              <span className="ml-1 text-white/30">Edite clicando na prévia abaixo ou use as configurações.</span>
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

      {/* 🖥️ PREVIEW INTERATIVO AO VIVO (COM EDITOR DIRECT-CLICK & SIMULADOR DE DISPOSITIVO) */}
      <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            </div>
            <div className="ml-3 px-3 py-1 rounded-lg bg-white/[0.04] text-[11px] font-mono text-white/50 w-60 sm:w-80 truncate border border-white/5">
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
              Editor Visual Ativo
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
                  : "w-full h-[800px] border border-white/10 rounded-2xl"
              }`}
              title="Preview"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-amber-400" />
          ⚙️ Ajustes Finos e Configurações Avançadas do Site:
        </h4>
      </div>

      {/* PAINEL DE CONTROLES AVANÇADOS (ABAIXO DA PRÉVIA) */}
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

        {/* VISIBILIDADE DAS SEÇÕES */}
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

        {/* HERO editável */}
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

        {/* GALERIA de imagens */}
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

        {/* PACOTES editáveis */}
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

        {/* DEPOIMENTOS */}
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

        {/* FAQ */}
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

        {/* CTA Final */}
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

      {/* ── BARRA DE AÇÕES INFERIOR FIXA ── */}
      <div className="flex gap-3 sticky bottom-4 z-10 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
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

      {/* PUBLICAÇÃO DIRETA NO VERCEL */}
      <PublishOnLovableCard primaryColor={state.primaryColor} html={previewHTML} onBack={onBack} onNext={onNext} />

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
                Trocar Foto {activeImageEdit.type === "logo" ? "da Logo" : activeImageEdit.type === "hero" ? "do Banner" : "do Pacote"}
              </h3>
            </div>

            <p className="text-xs text-white/60 mb-4">
              Clique em uma das imagens do seu banco abaixo para aplicar ou envie uma nova do seu computador:
            </p>

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
            ) : (
              <div className="text-xs text-white/40 italic text-center py-6 border border-dashed border-white/10 rounded-xl mb-4 bg-black/10">
                Nenhuma imagem no banco de imagens ainda. Faça upload ou cole um link abaixo!
              </div>
            )}

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
      toast.loading("Enviando código para o Vercel (sem limites)...", { id: toastId });

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
              data: btoa(unescape(encodeURIComponent(html))),
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

      const domain = `${cleanSubdomain}.vercel.app`;
      const liveUrl = `https://${domain}`;

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
      const blob = new Blob([html], { type: 'text/html' });
      const fileName = `sites/${user.id}.html`;
      
      const rawName = state.agencyName || `agencia-${user.id.substring(0,4)}`;
      const cleanSlug = rawName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const slugName = `sites/${cleanSlug}.html`;

      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(fileName, blob, {
          contentType: 'text/html',
          upsert: true
        });

      if (uploadError) throw uploadError;

      if (cleanSlug.length > 2) {
         await supabase.storage.from("thumbnails").upload(slugName, blob, { contentType: 'text/html', upsert: true }).catch(e => console.warn("Subdomain upload error:", e));
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
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #FCD34D)`,
              boxShadow: `0 0 20px ${primaryColor}55`,
            }}
          >
            <Rocket className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
              PASSO FINAL · 100% GRÁTIS
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Publique seu site no ar em <span style={{ color: primaryColor }}>1 Clique</span>
            </h3>
          </div>
        </div>

        <p className="text-sm text-white/70 mb-5 leading-relaxed">
          Escolha a sua opção preferida para publicar ou baixar o código completo do seu site perfeitamente como ele está:
        </p>

        {/* 🚀 SUPER RECURSO: PUBLICAÇÃO EXPRESSA VERCEL EM 1-CLIQUE */}
        <div 
          className="my-6 p-6 rounded-2xl border-2 backdrop-blur-xl transition-all relative overflow-hidden text-left"
          style={{ 
            borderColor: state.siteContent.vercelUrl ? "#10B98188" : `${primaryColor}44`,
            background: state.siteContent.vercelUrl 
              ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,0,0,0.4))"
              : "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(0,0,0,0.4))",
            boxShadow: state.siteContent.vercelUrl ? "0 10px 30px rgba(16,185,129,0.1)" : "none"
          }}
        >
          {/* Tag de Destaque */}
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
            Recomendado
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{ 
                borderColor: state.siteContent.vercelUrl ? "#10B98188" : `${primaryColor}44`,
                background: state.siteContent.vercelUrl ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)"
              }}
            >
              <Rocket className={`w-5 h-5 ${state.siteContent.vercelUrl ? "text-emerald-400" : "text-amber-400"}`} />
            </div>
            <div>
              <h4 className="text-base font-black text-white tracking-wide">
                🚀 Publicação Direta e Expressa no Vercel
              </h4>
              <p className="text-xs text-white/50">
                Coloque o site completo da sua agência no ar instantaneamente, sem precisar de código ou configurações chatas!
              </p>
            </div>
          </div>

          {/* Se já estiver publicado, mostra o link em destaque */}
          {state.siteContent.vercelUrl && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Seu Site está Online! 🌟</div>
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
                Acessar Site do Cliente
              </a>
            </div>
          )}

          {/* Form de Publicação */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                Nome do Domínio (Link do Site):
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
              <p className="text-[10px] text-white/40 mt-1.5 italic">
                Apenas letras, números e traços. Seu site ficará visível mundialmente no link acima.
              </p>
            </div>

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
                    <Rocket className="w-4 h-4" />
                    Publicar Novo Site 🚀
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
                    <Rocket className="w-4 h-4 animate-bounce" />
                    Atualizar Site Existente ⚡
                  </>
                )}
              </button>
            </div>

            {/* Configuração de Token para o Administrador */}
            <div className="border-t border-white/5 pt-3 mt-2">
              <button
                type="button"
                onClick={() => setShowVercelConfig(!showVercelConfig)}
                className="text-[11px] font-semibold text-white/40 hover:text-white/60 transition-colors flex items-center gap-1.5"
              >
                ⚙️ {showVercelConfig ? "Ocultar" : "Mostrar"} Configurações do Desenvolvedor (Vercel API)
              </button>

              {showVercelConfig && (
                <div className="mt-3 p-4 rounded-xl bg-black/50 border border-white/10 space-y-3">
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    💡 <strong>Para o Proprietário do App:</strong> Para que seus clientes publiquem em 1-clique gratuitamente sem que precisem inserir nenhuma chave, configure a variável <strong>VITE_VERCEL_TOKEN</strong> no arquivo <strong>.env</strong> do seu projeto com o seu Token do Vercel.
                  </p>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-white/50 uppercase">
                      Ou insira o Token do Vercel manualmente neste navegador:
                    </label>
                    <input
                      type="password"
                      value={customVercelToken}
                      onChange={(e) => handleSaveToken(e.target.value)}
                      placeholder="Cole seu token vercel_..."
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/30"
                    />
                    {(import.meta.env.VITE_VERCEL_TOKEN || customVercelToken) && (
                      <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                        ✓ Token configurado! Você e seus clientes já podem publicar com 1 clique.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-white/60 mb-4 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
          Para personalizar fontes, alterar o layout avançado ou conectar seu próprio domínio oficial, use o <strong className="text-white">Lovable</strong>:
        </p>

        <div className="space-y-2.5 mb-6">
          {[
            { n: 1, t: "Baixe ou copie o HTML do seu site (botões abaixo)" },
            { n: 2, t: "Crie sua conta grátis no Lovable usando o link abaixo" },
            { n: 3, t: "Cole o HTML, clique em Publicar e seu site está no ar 🚀" },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-3 bg-black/30 border border-white/[0.06] rounded-xl p-3 text-left">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-black"
                style={{ background: primaryColor }}
              >
                {s.n}
              </div>
              <p className="text-sm text-white/85 leading-snug pt-0.5">{s.t}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-2.5 mb-2.5">
          <button
            onClick={copyHtml}
            className="py-3 px-3 rounded-xl bg-white/[0.06] border border-white/15 text-white font-semibold hover:bg-white/[0.10] transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <Copy className="w-4 h-4" /> Copiar HTML Completo
          </button>
          <button
            onClick={() => downloadLandingHTML(state, undefined, user?.id)}
            className="py-3 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-semibold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <Download className="w-4 h-4" /> Baixar HTML Local
          </button>
          <a
            href={LOVABLE_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-3 rounded-xl font-black text-black flex items-center justify-center gap-2 hover:brightness-110 transition-all text-xs sm:text-sm"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #FCD34D)`,
              boxShadow: `0 8px 24px ${primaryColor}55`,
            }}
          >
            <Sparkles className="w-4 h-4" /> Abrir Lovable
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* NOVO BOTÃO DE ATUALIZAÇÃO CIRÚRGICA */}
        <div className="mb-3">
          <button
            onClick={copyUpdatePrompt}
            className="w-full py-3 px-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 text-sm font-bold text-white hover:bg-amber-500/10"
            style={{
              borderColor: `${primaryColor}77`,
              color: "#FCD34D"
            }}
          >
            <Rocket className="w-4 h-4" /> Copiar Atualização (Só Pacotes Novos) ⚡
          </button>
          <p className="text-[10px] text-white/40 text-center mt-1.5 italic">
            Use este botão caso seu site já esteja pronto e queira apenas adicionar novos pacotes sem reconstruir tudo.
          </p>
        </div>

        <p className="text-[11px] text-white/50 text-center">
          ✓ Sem cartão de crédito · ✓ Domínio grátis incluído · ✓ Suporte a domínio próprio
        </p>

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
            className="flex-[2] py-4 rounded-xl font-black text-black flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            style={{ background: primaryColor }}
          >
            Próximo Passo: Diagnóstico <Rocket className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
const FabricaCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-xl">
    <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">{title}</h3>
    {children}
  </div>
);
