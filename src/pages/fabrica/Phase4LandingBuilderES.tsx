import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFabricaContext, type Pacote, type Testimonio } from "@/hooks/useFabricaContext";
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
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import type { SectionVisibility } from "@/hooks/useFabricaContext";

const LOVABLE_INVITE_URL = "https://lovable.dev/invite/2ZD6VL6";
const PRESET_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#000000"];

export const Phase4LandingBuilderES = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  const { state, update } = useFabricaContext();
  const { user } = useAuth();
  const [previewing, setPreviewing] = useState(true);
  const [downloadCount, setDownloadCount] = useState(0);
  const [autoSyncDone, setAutoSyncDone] = useState(false);
  const [autoSyncFields, setAutoSyncFields] = useState<string[]>([]);
  const [pickingHeroImage, setPickingHeroImage] = useState(false);

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

  const handleDownload = () => {
    setDownloadCount((c) => c + 1);
    downloadLandingHTML(state, downloadCount + 1, user?.id);
    toast.success(`Versión ${downloadCount + 1} descargada! Súbela a Lovable, Vercel o Netlify.`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Banner de Auto-Sync da Fase 3 ── */}
      {autoSyncDone && autoSyncFields.length > 0 && (
        <div className="rounded-2xl p-4 border bg-emerald-500/10 border-emerald-500/25 flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">✅</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white mb-1">
              ¡Sitio pre-llenado con tus datos de la Fábrica!
            </div>
            <p className="text-[11px] text-white/60 leading-snug">
              Importamos automaticamente: <strong className="text-emerald-300">{autoSyncFields.join(" Â· ")}</strong>.
              Você pode editar qualquer campo abaixo.
            </p>
          </div>
          <button
            onClick={resetSiteToBlank}
            className="flex-shrink-0 text-[10px] font-bold text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 rounded-lg px-3 py-1.5 transition-all whitespace-nowrap"
            title="Limpiar tudo e começar do zero"
          >
            Limpiar sitio
          </button>
        </div>
      )}

      {/* Banner para o caso de o site já estar sincronizado (não é a primeira vez) */}
      {!autoSyncDone && (state.destinos?.[0] || state.lastPrice) && (
        <div className="rounded-2xl p-4 border bg-white/[0.04] border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg flex-shrink-0">ðŸ”„</span>
            <p className="text-[11px] text-white/50 leading-snug">
              Datos de la Fábrica ya sincronizados con este sitio.
              <span className="ml-1 text-white/30">Edita los campos de abajo o</span>
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

      <FabricaCard title="🎨 Color primario del sitio">
        <div className="flex flex-wrap gap-3 items-center">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => update({ primaryColor: c })}
              className={`w-10 h-10 rounded-xl border-2 transition-all ${state.primaryColor === c ? "border-white scale-110" : "border-white/20"
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

      {/* VISIBILIDADE DAS SEÃ‡Ã•ES */}
      <FabricaCard title="ðŸ‘ï¸ Secciones del sitio">
        <p className="text-xs text-white/50 mb-3">
          Elige lo que aparece en el sitio. Desmarca cualquier sección para eliminarla (también desaparece del HTML exportado).
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
            ] as { key: keyof SectionVisibility; label: string }[]
          ).map(({ key, label }) => {
            const on = isVisible(key);
            return (
              <button
                key={key}
                onClick={() => toggleSection(key)}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${on
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
      <FabricaCard title="âœï¸ Encabezado del sitio (Hero)">
        <div className="space-y-3">
          <FieldText
            label="Título principal"
            value={state.siteContent.heroHeadline}
            onChange={(v) => updSite({ heroHeadline: v })}
            placeholder={`${state.agencyName || "Tu Agencia"} — Tu próximo viaje empieza aquí`}
          />
          <FieldTextarea
            label="Subtítulo"
            value={state.siteContent.heroSubheadline}
            onChange={(v) => updSite({ heroSubheadline: v })}
            placeholder="Atención personalizada, rutas a medida..."
          />
          <FieldText
            label="Texto del botón principal"
            value={state.siteContent.heroCtaLabel}
            onChange={(v) => updSite({ heroCtaLabel: v })}
            placeholder="Hablar por WhatsApp"
          />

          {/* NOVO: Editor dinâmico de Imagem de Fundo / Capa do Site */}
          <div className="pt-3 mt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-amber-400/70" /> Fondo del Sitio (Banner)
              </label>
              <button
                onClick={() => setPickingHeroImage(!pickingHeroImage)}
                className={`text-[10px] px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${pickingHeroImage ? "bg-red-500/20 text-red-300" : "bg-white/[0.06] hover:bg-white/[0.1] text-amber-300"
                  }`}
              >
                {pickingHeroImage ? "Fechar" : "Cambiar Imagen"}
              </button>
            </div>

            {!pickingHeroImage && (
              <div className="h-20 w-full bg-black/20 rounded-lg overflow-hidden relative group border border-white/5">
                <img
                  src={state.siteContent.heroImageUrl || state.siteContent.galleryImages?.[0] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80"}
                  className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-80"
                  alt="Banner actual"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-white/70 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    Imagen de Fondo Activa
                  </span>
                </div>
              </div>
            )}

            {pickingHeroImage && (
              <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <p className="text-[10px] text-white/40">Selecciona una imagen de tu banco generado automáticamente:</p>
                {state.siteContent.galleryImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                    {state.siteContent.galleryImages.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          updSite({ heroImageUrl: url });
                          setPickingHeroImage(false);
                          toast.success("Banner actualizado!");
                        }}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${(state.siteContent.heroImageUrl === url || (!state.siteContent.heroImageUrl && i === 0)) ? "border-amber-400" : "border-white/10 hover:border-white/40"
                          }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-white/40 text-center italic py-4 border border-dashed border-white/10 rounded-lg">
                    Aún no hay imágenes generadas en tu banco.
                  </div>
                )}

                <div className="flex gap-2 items-center pt-2 border-t border-white/10">
                  <input
                    placeholder="Pega un enlace externo (https://...)"
                    onChange={(e) => {
                      if (e.target.value.startsWith("http")) {
                        updSite({ heroImageUrl: e.target.value });
                        toast.success("¡Enlace de fondo aplicado!");
                      }
                    }}
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/30"
                  />
                  <button
                    onClick={() => {
                      updSite({ heroImageUrl: "" });
                      setPickingHeroImage(false);
                      toast.success("Fondo restaurado al predeterminado");
                    }}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.06] text-white/60 text-[10px] hover:bg-red-500/20 hover:text-red-300 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </FabricaCard>

      {/* GALERIA de imagens */}
      <FabricaCard title="ðŸ–¼ï¸ Banco de imágenes">
        <p className="text-xs text-white/50 mb-3">
          Guarda aquí las imágenes que generaste en la Fase 3 o pega enlaces externos. Luego, solo haz clic en 'Usar' en el paquete.
        </p>
        <ImageGallery
          images={state.siteContent.galleryImages}
          generatedAd={state.lastCleanPhoto || ""}
          onAdd={addToGallery}
          onRemove={removeFromGallery}
        />
      </FabricaCard>

      {/* PACOTES editáveis */}
      <FabricaCard title="📦 Paquetes ofrecidos">
        <FieldText
          label="Título de la sección"
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
            <Plus className="w-4 h-4" /> Añadir paquete
          </button>
        </div>
      </FabricaCard>

      {/* DEPOIMENTOS */}
      <FabricaCard title="â­ Testimonios">
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

      {/* FAQ */}
      <FabricaCard title="â“ Preguntas Frecuentes (FAQ)">
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

      {/* CTA Final */}
      <FabricaCard title="ðŸŽ¯ CTA Final">
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

      {/* AÃ‡Ã•ES */}
      <div className="flex gap-3 sticky bottom-4 z-10 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 font-semibold hover:bg-white/[0.08] flex items-center justify-center gap-2"
        >
          Volver
        </button>
        <button
          onClick={() => setPreviewing((p) => !p)}
          className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 font-semibold hover:bg-white/[0.08] flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" /> {previewing ? "Ocultar" : "Preview"}
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

      {previewing && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-4 py-2 bg-white/[0.04] text-xs text-white/60 font-semibold uppercase tracking-widest flex items-center justify-between">
            <span>Vista previa en vivo</span>
            <span className="text-white/40 normal-case tracking-normal">Se actualiza con cada edición âœ¨</span>
          </div>
          <iframe srcDoc={previewHTML} className="w-full h-[700px] bg-white" title="Preview" />
        </div>
      )}

      <PublishOnLovableCard primaryColor={state.primaryColor} html={previewHTML} onBack={onBack} onNext={onNext} />
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

  const [isVercelDeploying, setIsVercelDeploying] = useState(false);
  const [customVercelToken, setCustomVercelToken] = useState(() => localStorage.getItem("vercel_token") || "");
  const [showVercelConfig, setShowVercelConfig] = useState(false);

  const handleVercelPublish = async () => {
    const token = (import.meta.env.VITE_VERCEL_TOKEN || customVercelToken || "").trim();
    if (!token) {
      toast.error("¡Vercel Token no configurado! Haz clic en 'Configurar Cuenta' abajo e ingresa tu token.");
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
      toast.error("Por favor, escribe un nombre de subdomínio válido.");
      return;
    }

    setIsVercelDeploying(true);
    const toastId = toast.loading("Preparando publicación en Vercel...");

    try {
      toast.loading("Enviando código a Vercel (sin límites)...", { id: toastId });

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
              data: html,
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
        throw new Error(resData?.error?.message || "Error en la respuesta de la API de Vercel");
      }

      const domain = `${cleanSubdomain}.vercel.app`;
      const liveUrl = `https://${domain}`;

      update({
        siteContent: {
          ...state.siteContent,
          vercelUrl: liveUrl,
        },
      });

      toast.success("🚀 ¡FELICITACIONES! ¡TU SITIO WEB ESTÁ EN LÍNEA EN VERCEL!", { id: toastId });

      if (typeof window !== "undefined" && (window as any).confetti) {
        (window as any).confetti();
      }
    } catch (err: any) {
      console.error("Vercel Deploy Error:", err);
      toast.error(`Error al publicar en Vercel: ${err.message || "Inténtalo de nuevo"}`, { id: toastId });
    } finally {
      setIsVercelDeploying(false);
    }
  };

  const handleSaveToken = (val: string) => {
    setCustomVercelToken(val);
    localStorage.setItem("vercel_token", val.trim());
    if (val.trim()) {
      toast.success("¡Vercel Token guardado localmente!");
    }
  };

  const handleDirectPublish = async () => {
    if (!user?.id) {
      toast.error("Inicia sesión para publicar.");
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
              PASSO FINAL Â· 100% GRÁTIS
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Publique seu site no ar em <span style={{ color: primaryColor }}>2 minutos</span>
            </h3>
          </div>
        </div>

        <p className="text-sm text-white/70 mb-5 leading-relaxed">
          Para colocar seu site no ar, conecte-se ao <strong>Lovable</strong> e cole o seu código gerado:
        </p>


        <p className="text-xs text-white/60 mb-4 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
          Para personalizar fontes, alterar o layout avançado ou conectar seu próprio domínio oficial, use o <strong className="text-white">Lovable</strong>:
        </p>

        <div className="space-y-2.5 mb-6">
          {[
            { n: 1, t: "Descarga o copia el HTML de tu sitio (botones de arriba)" },
            { n: 2, t: "Crea tu cuenta gratis en Lovable usando el enlace de abajo" },
            { n: 3, t: "Pega el HTML, haz clic en Publicar y tu sitio estará en línea 🚀" },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-3 bg-black/30 border border-white/[0.06] rounded-xl p-3">
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

        {/* NOVO BOTÃƒO DE ATUALIZAÃ‡ÃƒO CIRÃšRGICA */}
        <div className="mb-3">
          <button
            onClick={copyUpdatePrompt}
            className="w-full py-3 px-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 text-sm font-bold text-white hover:bg-amber-500/10"
            style={{
              borderColor: `${primaryColor}77`,
              color: "#FCD34D"
            }}
          >
            <Rocket className="w-4 h-4" /> Copiar Actualización (Solo Paquetes Nuevos) âš¡
          </button>
          <p className="text-[10px] text-white/40 text-center mt-1.5 italic">
            Usa este botón si tu sitio ya está listo y solo quieres añadir paquetes nuevos sin reconstruir todo.
          </p>
        </div>

        {/* 🚀 SUPER RECURSO: PUBLICACIÓN EXPRESS VERCEL EN 1-CLIC */}
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
          {/* Tag de Destacado */}
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
                🚀 Publicación Directa y Express en Vercel
              </h4>
              <p className="text-xs text-white/50">
                ¡Pon el sitio web completo de tu agencia en línea al instante, sin necesidad de código ni configuraciones aburridas!
              </p>
            </div>
          </div>

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
                Nombre del Dominio (Enlace del Sitio):
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
              <p className="text-[10px] text-white/40 mt-1.5 italic">
                Solo letras, números y guiones. Tu sitio estará visible mundialmente en el enlace superior.
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
                    Publicar Nuevo Sitio 🚀
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
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 animate-bounce" />
                    Actualizar Sitio Existente ⚡
                  </>
                )}
              </button>
            </div>

            {/* Configuración de Token para o Administrador */}
            <div className="border-t border-white/5 pt-3 mt-2">
              <button
                type="button"
                onClick={() => setShowVercelConfig(!showVercelConfig)}
                className="text-[11px] font-semibold text-white/40 hover:text-white/60 transition-colors flex items-center gap-1.5"
              >
                ⚙️ {showVercelConfig ? "Ocultar" : "Mostrar"} Configuraciones del Desarrollador (Vercel API)
              </button>

              {showVercelConfig && (
                <div className="mt-3 p-4 rounded-xl bg-black/50 border border-white/10 space-y-3">
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    💡 <strong>Para el Propietario de la App:</strong> Para que tus clientes publiquen en 1-clic gratis sin necesidad de ingresar ninguna clave, configura la variable <strong>VITE_VERCEL_TOKEN</strong> en el archivo <strong>.env</strong> de tu proyecto con tu Token de Vercel.
                  </p>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-white/50 uppercase">
                      O ingresa el Token de Vercel manualmente en este navegador:
                    </label>
                    <input
                      type="password"
                      value={customVercelToken}
                      onChange={(e) => handleSaveToken(e.target.value)}
                      placeholder="Pega tu token vercel_..."
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/30"
                    />
                    {(import.meta.env.VITE_VERCEL_TOKEN || customVercelToken) && (
                      <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                        ✓ ¡Token configurado! Tú y tus clientes ya pueden publicar con 1 clic.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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
            className="flex-[2] py-4 rounded-xl font-black text-black flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            style={{ background: primaryColor }}
          >
            Siguiente Paso: Diagnóstico <Rocket className="w-5 h-5" />
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

