import { useFabricaContext } from "@/hooks/useFabricaContext";
import { useContentItems, useCaptions, useMarketingTools } from "@/hooks/useContent";
import { getOfertasByNiche, type OfertaTemplate } from "@/data/fabrica-ofertas";
import { Copy, ExternalLink, ArrowRight, CheckCircle2, Plus, Trash2, Pencil, X, Check, Package, Sparkles, Layout, Video, Film } from "lucide-react";
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
  const { state, update, toggleChecklist, isHydrated } = useFabricaContext();
  const { data: allContent = [], isLoading: loadingContent } = useContentItems(["video", "feed", "story", "weekly-story", "seasonal", "resource"]);
  const { data: captions = [], isLoading: loadingCaptions } = useCaptions();
  const { data: tools = [], isLoading: loadingTools } = useMarketingTools();

  // ── Package Manager ────────────────────────────────────────────────────────
  // ── Smart Package Linker ──
  // Inicializa pacotes templates no Contexto Global APENAS SE ESTIVER VAZIO, integrando nativamente com a Fase 2 (Site).
  useEffect(() => {
    if (!isHydrated) return;
    if (state.selectedPackages.length === 0) {
      const base = getOfertasByNiche(state.niche);
      const initial = base.map((o) => {
        // Smart Separator: Extrai o Preço do bloco de texto template
        const lines = o.text.split('\n');
        const priceLine = lines.find(l => l.includes("💸") || l.includes("R$")) || "Consulte valores";
        const desc = lines.filter(l => !l.includes("💸") && !l.includes("R$")).join(" ").replace(/\s+/g, " ").trim();
        
        return {
          id: generateId(),
          title: o.title,
          description: desc.slice(0, 120) || o.title,
          price: priceLine.replace("💸", "").trim(),
          imageUrl: "", 
          ctaLabel: "Reservar agora"
        };
      });
      update({ selectedPackages: initial });
    }
  }, [isHydrated, state.niche, state.selectedPackages.length, update]);

  const packages = state.selectedPackages;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const startEdit = (pkg: any) => {
    setEditingId(pkg.id);
    setEditTitle(pkg.title);
    setEditDesc(pkg.description);
    setEditPrice(pkg.price);
    setShowAddForm(false);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    const updated = packages.map((p) => 
      p.id === id ? { ...p, title: editTitle.trim(), description: editDesc.trim(), price: editPrice.trim() } : p
    );
    update({ selectedPackages: updated });
    setEditingId(null);
    toast.success("Pacote atualizado e vinculado ao Site!");
  };

  const removePackage = (id: string) => {
    const updated = packages.filter((p) => p.id !== id);
    update({ selectedPackages: updated });
    toast.success("Pacote removido");
  };

  const togglePublish = (id: string, currentDraft: boolean) => {
    const updated = packages.map(p => p.id === id ? { ...p, isDraft: !currentDraft } : p);
    update({ selectedPackages: updated });
    toast.success(currentDraft ? "Pacote aprovado e enviado para o site!" : "Pacote removido do site (rascunho).");
  };

  const addPackage = () => {
    if (!newTitle.trim()) { toast.error("Adicione um título ao pacote"); return; }
    const pkg = {
      id: generateId(),
      title: newTitle.trim(),
      description: newDesc.trim() || "Nova oferta especial.",
      price: newPrice.trim() || "Consulte",
      imageUrl: "",
      ctaLabel: "Reservar agora"
    };
    update({ selectedPackages: [pkg, ...packages] });
    setNewTitle("");
    setNewDesc("");
    setNewPrice("");
    setShowAddForm(false);
    toast.success("Novo pacote adicionado e já visível no Site!");
  };

  const duplicatePackage = (original: any) => {
    const pkg = {
      ...original,
      id: generateId(),
      title: `${original.title} (cópia)`,
    };
    update({ selectedPackages: [pkg, ...packages] });
    toast.success("Pacote duplicado");
  };

  // ── Smart Dynamic Content Engine ─────────────────────────────────────────────
  const userDestinos = state.destinos || [];
  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  const matchesDestinos = (text: string) => {
    if (userDestinos.length === 0) return true;
    const t = normalize(text || "");
    return userDestinos.some((d) => {
      const nd = normalize(d);
      const main = nd.split(/[\s\-,]/)[0]; // Extrai apenas a primeira palavra da busca
      return t.includes(main);
    });
  };

  // Categoriza Conteúdos (Exclui Influencers/Bia por solicitação do usuário)
  const isExcludedContent = (title: string) => {
    const t = (title || "").toLowerCase();
    return t.includes("bia") || t.includes("influencer");
  };

  const videos = allContent.filter(c => (c.type === 'video' || c.type === 'feed') && !isExcludedContent(c.title));
  const stories = allContent.filter(c => (c.type === 'story' || c.type === 'weekly-story' || c.type === 'seasonal') && !isExcludedContent(c.title));

  // Filtra Vídeos com Fallback Inteligente
  let filteredVideos = videos.filter((v: any) => matchesDestinos(v.title || "")).slice(0, 8);
  if (filteredVideos.length === 0) filteredVideos = videos.slice(0, 6); // Fallback de segurança

  // Filtra Stories
  let filteredStories = stories.filter((s: any) => matchesDestinos(s.title || "")).slice(0, 6);
  if (filteredStories.length === 0) filteredStories = stories.slice(0, 4); // Fallback

  // Filtra Ferramentas de IA & Scripts
  const filteredTools = tools.filter((t: any) => !t.title.toLowerCase().includes("vendedor de viagens")).slice(0, 6); // Ferramentas são globais de agência

  // Filtra Legendas com Fallback
  let filteredCaptions = captions.filter((c: any) => matchesDestinos(c.destination || "") || matchesDestinos(c.text || "")).slice(0, 10);
  if (filteredCaptions.length === 0) filteredCaptions = captions.slice(0, 4);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  // Gamificação: Calcula Progresso do Plano 30 Dias
  const totalTasks = CHECKLIST_30.reduce((acc, val) => acc + val.tasks.length, 0);
  const doneCount = Object.values(state.checklist30days).filter(Boolean).length;
  const pct = Math.round((doneCount / totalTasks) * 100);
  
  const getRank = (p: number) => {
    if (p >= 100) return { n: "Mestre Digital", e: "👑", c: "text-amber-400" };
    if (p >= 60) return { n: "Influenciador", e: "🔥", c: "text-purple-400" };
    if (p >= 30) return { n: "Engajado", e: "🚀", c: "text-blue-400" };
    return { n: "Iniciante", e: "🌱", c: "text-emerald-400" };
  };
  const rank = getRank(pct);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* GAMIFICAÇÃO NO TOPO DA FASE 4 */}
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-5 overflow-hidden relative shadow-2xl group">
         <div className="absolute top-0 right-0 w-32 h-32 blur-[50px] bg-emerald-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-all" />
         <div className="relative flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                  {rank.e}
               </div>
               <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Seu Nível Operacional</div>
                  <div className={`text-lg font-black tracking-tight ${rank.c}`}>{rank.n}</div>
               </div>
            </div>
            <div className="text-right">
               <div className="text-2xl font-black text-white">{pct}%</div>
               <div className="text-[9px] font-bold text-white/50 uppercase">Concluído</div>
            </div>
         </div>
         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
            <div 
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-emerald-300"
              style={{ width: `${pct}%` }}
            />
         </div>
         <p className="text-[10px] text-white/40 mt-2 text-center italic">Conclua o checklist de 30 dias abaixo para subir de nível!</p>
      </div>
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
                placeholder="Título (ex: Jericoacoara 5 Dias)"
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none"
              />
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Descrição curta das inclusões..."
                rows={2}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none resize-none"
              />
              <input
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Preço (ex: 10x de R$ 149,90)"
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none"
              />
              <div className="flex gap-2 pt-1">
                <button onClick={addPackage} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-black" style={{ background: state.primaryColor }}><Check className="w-4 h-4" /> Adicionar ao Site</button>
                <button onClick={() => { setShowAddForm(false); setNewTitle(""); setNewDesc(""); setNewPrice(""); }} className="px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* Package list */}
          {packages.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Nenhum pacote ativo. Adicione clicando acima!
            </div>
          ) : (
            packages.map((pkg) => (
              <div key={pkg.id} className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden transition-all hover:border-white/20">
                {editingId === pkg.id ? (
                  /* Edit mode */
                  <div className="p-4 space-y-3">
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-white/[0.05] border border-white/20 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none" />
                    <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} className="w-full bg-white/[0.05] border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none resize-none" />
                    <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full bg-white/[0.05] border border-white/20 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-400 focus:outline-none" />
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => saveEdit(pkg.id)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-black" style={{ background: state.primaryColor }}><Check className="w-4 h-4" /> Salvar no Site</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-white/60"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {pkg.imageUrl && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
                          <img src={pkg.imageUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white leading-snug mb-0.5">{pkg.title}</div>
                        <div className="text-xs text-white/60 line-clamp-2 mb-1.5 leading-relaxed">{pkg.description}</div>
                        <div className="inline-flex text-[11px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                          {pkg.price}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0 items-center">
                        {pkg.isDraft ? (
                          <button
                            onClick={() => togglePublish(pkg.id, true)}
                            title="Aprovar e Enviar para o Site"
                            className="h-7 px-2 flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/30 transition-all cursor-pointer mr-1"
                          >
                            <Check className="w-3 h-3 mr-1" /> Aprovar para o Site
                          </button>
                        ) : (
                          <span className="h-7 px-2 flex items-center justify-center rounded-lg bg-white/5 text-white/50 text-[9px] font-bold mr-1 uppercase tracking-wider border border-white/10">
                            No Site
                          </span>
                        )}
                        <button onClick={() => startEdit(pkg)} title="Editar" className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/50 hover:text-white transition-all"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => duplicatePackage(pkg)} title="Duplicar" className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/50 hover:text-white transition-all"><Copy className="w-3 h-3" /></button>
                        <button onClick={() => removePackage(pkg.id)} title="Remover" className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-all"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    {pkg.imageUrl ? (
                       <div className="text-[10px] text-emerald-400/80 flex items-center gap-1 mt-2 bg-emerald-500/5 py-1 px-2 rounded-md border border-emerald-500/10">
                          <Check className="w-3 h-3" /> Vinculado com Foto da Fase 3
                       </div>
                    ) : (
                       <div className="text-[10px] text-amber-400/80 flex items-center gap-1 mt-2 bg-amber-500/5 py-1 px-2 rounded-md border border-amber-500/10">
                          💡 Use a Fase 3 para criar o anúncio e imagem deste pacote
                       </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {packages.length > 0 && (
            <div className="text-[10px] text-white/30 text-center pt-1 uppercase tracking-widest font-bold">
              ✅ {packages.length} pacote{packages.length !== 1 ? "s" : ""} sincronizado{packages.length !== 1 ? "s" : ""} com seu site
            </div>
          )}
        </div>
      </FabricaCard>

      <FabricaCard title="🎬 Vídeos Reels e Templates para Seus Destinos">
        {loadingContent ? (
          <div className="h-24 bg-white/[0.03] animate-pulse rounded-xl" />
        ) : (filteredVideos.length === 0 && filteredStories.length === 0) ? (
          <p className="text-white/40 text-sm">Nenhum material de vídeo ou template encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...filteredVideos, ...filteredStories].map((item: any, idx: number) => (
              <a 
                key={`${item.id}-${idx}`} 
                href={item.url} 
                target="_blank" 
                rel="noopener" 
                className="flex items-center gap-3 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-white/[0.08] hover:border-emerald-500/30 rounded-xl p-3 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                  {item.image_url ? (
                     <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center bg-emerald-500/10 text-emerald-400 text-lg">
                        <Film className="w-5 h-5" />
                     </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-white leading-tight mb-0.5 truncate">{item.title}</div>
                  <div className="text-[10px] text-emerald-300/80 flex items-center gap-1">
                    <Video className="w-2.5 h-2.5" /> {item.subcategory || item.category || "Vídeos Reels"}
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-emerald-300 transition-colors relative z-10" />
              </a>
            ))}
          </div>
        )}
      </FabricaCard>

      <FabricaCard title="🤖 Robôs de IA e Ferramentas Estratégicas">
        {loadingTools ? (
          <div className="h-24 bg-white/[0.03] animate-pulse rounded-xl" />
        ) : filteredTools.length === 0 ? (
          <p className="text-white/40 text-sm">Nenhuma ferramenta carregada.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTools.map((tool: any) => (
              <a key={tool.id} href={tool.url} target="_blank" rel="noopener" className="flex items-center gap-3 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-white/[0.08] hover:border-purple-500/30 rounded-xl p-3.5 transition-all hover:shadow-lg hover:shadow-purple-500/5 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-xl shadow-inner">{tool.icon || "🤖"}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-white leading-tight mb-0.5">{tool.title}</div>
                  <div className="text-[10px] text-purple-300/80 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Inteligência Artificial
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-300 transition-colors relative z-10" />
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
          Avançar <ArrowRight className="w-4 h-4" />
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
