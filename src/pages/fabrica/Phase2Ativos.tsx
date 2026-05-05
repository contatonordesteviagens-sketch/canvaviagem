import { useFabricaContext } from "@/hooks/useFabricaContext";
import { useContentItems, useCaptions } from "@/hooks/useContent";
import { getOfertasByNiche, type OfertaTemplate } from "@/data/fabrica-ofertas";
import { Copy, ExternalLink, ArrowRight, CheckCircle2, Plus, Trash2, Pencil, X, Check, Package } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const CHECKLIST_30: { week: string; tasks: { key: string; text: string }[] }[] = [
  {
    week: "Semana 1 — Bases",
    tasks: [
      { key: "s1-1", text: "Atualizar bio + foto de perfil + destaques" },
      { key: "s1-2", text: "Postar 1 carrossel apresentando a agência" },
      { key: "s1-3", text: "Gravar 1 Reels com gancho forte" },
    ],
  },
  {
    week: "Semana 2 — Provas e Ofertas",
    tasks: [
      { key: "s2-1", text: "Coletar e postar 3 depoimentos" },
      { key: "s2-2", text: "Lançar 1 oferta-âncora do nicho" },
      { key: "s2-3", text: "Postar 2 Reels (1 educativo + 1 emocional)" },
    ],
  },
  {
    week: "Semana 3 — Tráfego e Engajamento",
    tasks: [
      { key: "s3-1", text: "Subir 1 campanha de mensagens R$ 10/dia" },
      { key: "s3-2", text: "Postar 4x por semana + stories diários" },
      { key: "s3-3", text: "Responder TODOS comentários e DMs em até 1h" },
    ],
  },
  {
    week: "Semana 4 — Conversão",
    tasks: [
      { key: "s4-1", text: "Lançar oferta de 'última semana do mês'" },
      { key: "s4-2", text: "Coletar mais 3 depoimentos" },
      { key: "s4-3", text: "Análise: o que mais converteu? Replicar." },
    ],
  },
];

// ─── Package Manager State ───────────────────────────────────────────────────
interface PackageItem extends OfertaTemplate {
  id: string;
  isCustom?: boolean;
}

const generateId = () => `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const Phase2Ativos = ({ onNext, onBack }: Props) => {
  const { state, toggleChecklist } = useFabricaContext();
  const { data: videos = [] } = useContentItems(["video", "feed"]);
  const { data: captions = [] } = useCaptions();

  // ── Package Manager ────────────────────────────────────────────────────────
  const baseOfertas = getOfertasByNiche(state.niche);
  const [packages, setPackages] = useState<PackageItem[]>(() =>
    baseOfertas.map((o) => ({ ...o, id: generateId() }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");

  // Re-sync when niche changes
  useEffect(() => {
    const base = getOfertasByNiche(state.niche);
    setPackages(base.map((o) => ({ ...o, id: generateId() })));
    setEditingId(null);
    setShowAddForm(false);
  }, [state.niche]);

  const startEdit = (pkg: PackageItem) => {
    setEditingId(pkg.id);
    setEditTitle(pkg.title);
    setEditText(pkg.text);
    setShowAddForm(false);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    setPackages((prev) =>
      prev.map((p) => p.id === id ? { ...p, title: editTitle.trim(), text: editText.trim() } : p)
    );
    setEditingId(null);
    toast.success("Pacote atualizado!");
  };

  const removePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    toast.success("Pacote removido");
  };

  const addPackage = () => {
    if (!newTitle.trim()) { toast.error("Adicione um título ao pacote"); return; }
    const pkg: PackageItem = {
      id: generateId(),
      title: newTitle.trim(),
      text: newText.trim(),
      isCustom: true,
    };
    setPackages((prev) => [pkg, ...prev]);
    setNewTitle("");
    setNewText("");
    setShowAddForm(false);
    toast.success("Pacote adicionado!");
  };

  const duplicatePackage = (pkg: PackageItem) => {
    const copy: PackageItem = {
      ...pkg,
      id: generateId(),
      title: `${pkg.title} (cópia)`,
      isCustom: true,
    };
    setPackages((prev) => {
      const idx = prev.findIndex((p) => p.id === pkg.id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    toast.success("Pacote duplicado");
  };

  // ── Content filters ────────────────────────────────────────────────────────
  const userDestinos = state.destinos || [];
  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const matchesDestinos = (text: string) => {
    if (userDestinos.length === 0) return true;
    const t = normalize(text);
    return userDestinos.some((d) => {
      const nd = normalize(d);
      const main = nd.split(/[\s\-,]/)[0];
      return t.includes(main);
    });
  };
  const filteredVideos = userDestinos.length > 0
    ? videos.filter((v: any) => matchesDestinos(v.title || "")).slice(0, 12)
    : videos.slice(0, 8);
  const filteredCaptions = userDestinos.length > 0
    ? captions.filter((c: any) => matchesDestinos(c.destination || "") || matchesDestinos(c.text || "")).slice(0, 12)
    : captions.slice(0, 6);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {userDestinos.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Filtrando conteúdo para</div>
          <div className="flex flex-wrap gap-1.5">
            {userDestinos.map((d) => (
              <span key={d} className="px-2.5 py-1 rounded-full text-[11px] font-bold text-black" style={{ background: state.primaryColor }}>{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── PACKAGE MANAGER ── */}
      <FabricaCard title={`📦 Pacotes prontos para vender (${packages.length})`}>
        <div className="space-y-3">
          {/* Add button */}
          {!showAddForm ? (
            <button
              onClick={() => { setShowAddForm(true); setEditingId(null); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-white/20 text-white/50 hover:border-white/40 hover:text-white/80 transition-all text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Adicionar novo pacote
            </button>
          ) : (
            <div className="bg-white/[0.06] border border-white/20 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Novo pacote</div>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Maceió 5 Dias com Tudo Incluído"
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder={"✈️ Aéreo + Hotel 4★\n💸 12x sem juros\n📲 Garanta sua vaga!"}
                rows={4}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={addPackage}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-black"
                  style={{ background: state.primaryColor }}
                >
                  <Check className="w-4 h-4" /> Salvar pacote
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewTitle(""); setNewText(""); }}
                  className="px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Package list */}
          {packages.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Nenhum pacote. Adicione o primeiro!
            </div>
          ) : (
            packages.map((pkg) => (
              <div key={pkg.id} className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
                {editingId === pkg.id ? (
                  /* Edit mode */
                  <div className="p-4 space-y-3">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-white/[0.05] border border-white/20 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-white/40"
                    />
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={5}
                      className="w-full bg-white/[0.05] border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/40 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(pkg.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-black"
                        style={{ background: state.primaryColor }}
                      >
                        <Check className="w-4 h-4" /> Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white leading-snug">{pkg.title}</div>
                        {pkg.isCustom && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-black mt-1 inline-block" style={{ background: state.primaryColor }}>
                            SEU PACOTE
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(pkg)}
                          title="Editar"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/50 hover:text-white transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => duplicatePackage(pkg)}
                          title="Duplicar"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/50 hover:text-white transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removePackage(pkg.id)}
                          title="Remover"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed mb-3">{pkg.text}</p>
                    <button
                      onClick={() => copy(`${pkg.title}\n\n${pkg.text}`)}
                      className="text-xs px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <Copy className="w-3 h-3" /> Copiar texto
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {packages.length > 0 && (
            <div className="text-[11px] text-white/30 text-center pt-1">
              {packages.length} pacote{packages.length !== 1 ? "s" : ""} disponível{packages.length !== 1 ? "is" : ""} • edite, duplique ou remova conforme precisar
            </div>
          )}
        </div>
      </FabricaCard>

      <FabricaCard title="🎬 Vídeos recomendados para seus destinos">
        {filteredVideos.length === 0 ? (
          <p className="text-white/50 text-sm">Carregando vídeos...</p>
        ) : (
          <div className="space-y-2">
            {filteredVideos.map((v: any, i: number) => (
              <a key={v.id} href={v.url} target="_blank" rel="noopener" className="flex items-start gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 hover:border-white/20 transition-colors group">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0" style={{ background: `${state.primaryColor}33`, color: state.primaryColor }}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{v.title}</div>
                  <div className="text-[11px] text-white/50">{v.category || "Conteúdo"} • {v.type}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </FabricaCard>

      <FabricaCard title="✍️ Legendas prontas">
        {filteredCaptions.length === 0 ? (
          <p className="text-white/50 text-sm">Sem legendas disponíveis no momento.</p>
        ) : (
          <div className="space-y-3">
            {filteredCaptions.map((c: any) => (
              <div key={c.id} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: state.primaryColor }}>{c.destination}</div>
                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed mb-3">{c.text}</p>
                {c.hashtags && <p className="text-xs text-white/40 mb-3">{c.hashtags}</p>}
                <button onClick={() => copy(`${c.text}\n\n${c.hashtags || ""}`)} className="text-xs px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-colors flex items-center gap-1.5">
                  <Copy className="w-3 h-3" /> Copiar
                </button>
              </div>
            ))}
          </div>
        )}
      </FabricaCard>

      <FabricaCard title="📅 Plano de 30 dias">
        {CHECKLIST_30.map((wk) => (
          <div key={wk.week} className="mb-5 last:mb-0">
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: state.primaryColor }}>{wk.week}</div>
            <div className="space-y-1.5">
              {wk.tasks.map((t) => {
                const done = !!state.checklist30days[t.key];
                return (
                  <button key={t.key} onClick={() => toggleChecklist(t.key)} className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${done ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/[0.03] border-white/[0.06] hover:border-white/15"}`}>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${done ? "bg-emerald-500" : "border-2 border-white/20"}`}>
                      {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className={`text-sm ${done ? "text-white/50 line-through" : "text-white/85"}`}>{t.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </FabricaCard>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 font-semibold hover:bg-white/[0.08] transition-colors">
          Voltar
        </button>
        <button onClick={onNext} className="flex-[2] py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:brightness-110" style={{ background: `linear-gradient(135deg, ${state.primaryColor}, #FCD34D)`, boxShadow: `0 8px 24px ${state.primaryColor}55` }}>
          Avançar para Destinos Ads <ArrowRight className="w-4 h-4" />
        </button>
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
