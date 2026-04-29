import { useState, useRef } from "react";
import { useFabricaContext, type Pacote, type Depoimento } from "@/hooks/useFabricaContext";
import { downloadLandingHTML, buildLandingHTML } from "@/lib/fabrica-html-export";
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
  ImagePlus,
  Pencil,
  Check,
  X,
  Link as LinkIcon,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type { SectionVisibility } from "@/hooks/useFabricaContext";

const LOVABLE_INVITE_URL = "https://lovable.dev/invite/2ZD6VL6";
const PRESET_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#000000"];

export const Phase4LandingBuilder = () => {
  const { state, update } = useFabricaContext();
  const [previewing, setPreviewing] = useState(true);
  const [downloadCount, setDownloadCount] = useState(0);

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

  const previewHTML = buildLandingHTML(state);

  const handleDownload = () => {
    setDownloadCount((c) => c + 1);
    downloadLandingHTML(state, downloadCount + 1);
    toast.success(`Versão ${downloadCount + 1} baixada! Suba pro Lovable, Vercel ou Netlify.`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
          Salve aqui as imagens que você gerou na Fase 3 ou cole links externos. Depois é só clicar em "Usar" no pacote.
        </p>
        <ImageGallery
          images={state.siteContent.galleryImages}
          generatedAd={state.generatedAdImage}
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

      {/* AÇÕES */}
      <div className="flex gap-3 sticky bottom-4 z-10 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
        <button
          onClick={() => setPreviewing((p) => !p)}
          className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 font-semibold hover:bg-white/[0.08] flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" /> {previewing ? "Esconder preview" : "Ver preview"}
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
            <span>Preview ao vivo</span>
            <span className="text-white/40 normal-case tracking-normal">Atualiza a cada edição ✨</span>
          </div>
          <iframe srcDoc={previewHTML} className="w-full h-[700px] bg-white" title="Preview" />
        </div>
      )}

      <PublishOnLovableCard primaryColor={state.primaryColor} html={previewHTML} />
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
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      pacote.imageUrl === url ? "border-amber-400" : "border-white/10 hover:border-white/40"
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
      {/* Atalho: usar imagem gerada na Fase 3 */}
      {generatedAd && !images.includes(generatedAd) && (
        <button
          onClick={() => onAdd(generatedAd)}
          className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2 hover:bg-amber-500/15"
        >
          <Sparkles className="w-4 h-4" /> Adicionar a imagem gerada na Fase 3 ao banco
        </button>
      )}

      {/* Grid de imagens */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => onRemove(url)}
                className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
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

const PublishOnLovableCard = ({ primaryColor, html }: { primaryColor: string; html: string }) => {
  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      toast.success("HTML copiado! Cole no Lovable para gerar o site.");
    } catch {
      toast.error("Não foi possível copiar. Use o botão Baixar HTML.");
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
              Publique seu site no ar em <span style={{ color: primaryColor }}>2 minutos</span>
            </h3>
          </div>
        </div>

        <p className="text-sm text-white/70 mb-5 leading-relaxed">
          Use o <strong className="text-white">Lovable</strong> (a mesma plataforma que gerou esta Fábrica) para colocar seu site no ar com domínio{" "}
          <code className="text-[11px] bg-white/10 px-1.5 py-0.5 rounded">.lovable.app</code> de graça. Lá você consegue ajustar layout, cores e fontes com IA, e depois conectar seu domínio próprio.
        </p>

        <div className="space-y-2.5 mb-6">
          {[
            { n: 1, t: "Baixe ou copie o HTML do seu site (botões acima)" },
            { n: 2, t: "Crie sua conta grátis no Lovable usando o link abaixo" },
            { n: 3, t: "Cole o HTML, clique em Publicar e seu site está no ar 🚀" },
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

        <div className="grid sm:grid-cols-2 gap-2.5 mb-3">
          <button
            onClick={copyHtml}
            className="py-3 px-4 rounded-xl bg-white/[0.06] border border-white/15 text-white font-semibold hover:bg-white/[0.10] transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Copy className="w-4 h-4" /> Copiar HTML
          </button>
          <a
            href={LOVABLE_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 rounded-xl font-black text-black flex items-center justify-center gap-2 hover:brightness-110 transition-all text-sm"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #FCD34D)`,
              boxShadow: `0 8px 24px ${primaryColor}55`,
            }}
          >
            <Sparkles className="w-4 h-4" /> Abrir Lovable e Publicar
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
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
