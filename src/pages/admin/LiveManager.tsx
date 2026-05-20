import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DEFAULT_SCHEDULED_COMMENTS, ScheduledComment } from "@/data/scheduledComments";
import { ArrowLeft, Save, Trash2, Plus, ExternalLink, Video, Tag, Clock, ShoppingBag, Pencil, MessageSquare } from "lucide-react";

const LiveManager = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    else if (!authLoading && user && !isAdmin) navigate("/");
  }, [user, authLoading, isAdmin, navigate]);

  // ─── Video ─────────────────────────────────────────────────────────────────
  const [videoUrl, setVideoUrl] = useState("");

  // ─── Offer settings ────────────────────────────────────────────────────────
  const [offerSettings, setOfferSettings] = useState({
    status: "scheduled",
    time: "60:00",
    title: "🔥 OFERTA EXCLUSIVA DA LIVE LIBERADA!",
    description: "Adquira o Canva Viagem Vitalício + Fábrica de Anúncios I.A com Desconto!",
    price: "Apenas 12x de R$ 28,91 ou R$ 347 à vista",
    checkoutUrl: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
    bannerUrl: "",
  });

  // ─── Comments ──────────────────────────────────────────────────────────────
  const [comments, setComments] = useState<ScheduledComment[]>([]);
  const [newComment, setNewComment] = useState<ScheduledComment>({ time: "", username: "", message: "" });
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<ScheduledComment>({ time: "", username: "", message: "" });
  const [search, setSearch] = useState("");

  // ─── Pre-Play Comments ─────────────────────────────────────────────────────
  const [prePlayComments, setPrePlayComments] = useState([
    { id: "pre-1", username: "Fabiotravell", message: "aguardando começar..." },
    { id: "pre-2", username: "Jr99", message: "to esperando a live! bora" },
    { id: "pre-3", username: "AnaPeloMundo", message: "esperando aqui, ansiosa demais!" },
  ]);

  useEffect(() => {
    // Load video URL
    const savedVideo = localStorage.getItem("live_stream_video_url");
    if (savedVideo) setVideoUrl(savedVideo);

    // Load offer settings
    const savedOffer = localStorage.getItem("live_stream_offer_settings");
    if (savedOffer) {
      try { setOfferSettings(JSON.parse(savedOffer)); } catch {}
    }

    // Load comments
    const savedComments = localStorage.getItem("live_stream_comments");
    if (savedComments) {
      try { setComments(JSON.parse(savedComments)); } catch { setComments(DEFAULT_SCHEDULED_COMMENTS); }
    } else {
      setComments(DEFAULT_SCHEDULED_COMMENTS);
    }

    // Load pre-play comments
    const savedPrePlay = localStorage.getItem("live_stream_pre_play_comments");
    if (savedPrePlay) {
      try {
        const parsed = JSON.parse(savedPrePlay);
        const cleaned = parsed.map((c: any) => ({
          ...c,
          message: c.message.replace(" 🙌", "").replace("🙌", "")
        }));
        setPrePlayComments(cleaned);
      } catch {}
    }
  }, []);

  const savePrePlay = (list: typeof prePlayComments) => {
    setPrePlayComments(list);
    localStorage.setItem("live_stream_pre_play_comments", JSON.stringify(list));
  };

  // ─── Save video ────────────────────────────────────────────────────────────
  const saveVideo = () => {
    localStorage.setItem("live_stream_video_url", videoUrl.trim());
    toast.success("URL do vídeo salva com sucesso!");
  };

  // ─── Save offer ────────────────────────────────────────────────────────────
  const saveOffer = () => {
    localStorage.setItem("live_stream_offer_settings", JSON.stringify(offerSettings));
    toast.success("Configurações da oferta salvas!");
  };

  const resetOfferVisibility = () => {
    const updated = { ...offerSettings, status: "scheduled" };
    setOfferSettings(updated);
    localStorage.setItem("live_stream_offer_settings", JSON.stringify(updated));
    toast.success("Oferta revertida para aparecer no tempo programado!");
  };

  const showOfferNow = () => {
    const updated = { ...offerSettings, status: "visible" };
    setOfferSettings(updated);
    localStorage.setItem("live_stream_offer_settings", JSON.stringify(updated));
    toast.success("Oferta ativada para aparecer agora!");
  };

  // ─── Comments helpers ──────────────────────────────────────────────────────
  const saveComments = (list: ScheduledComment[]) => {
    const sorted = [...list].sort((a, b) => {
      const toSecs = (t: string) => {
        const [m, s] = t.split(":").map(Number);
        return m * 60 + (s || 0);
      };
      return toSecs(a.time) - toSecs(b.time);
    });
    setComments(sorted);
    localStorage.setItem("live_stream_comments", JSON.stringify(sorted));
  };

  const addComment = () => {
    if (!newComment.time || !newComment.username || !newComment.message) {
      toast.error("Preencha todos os campos: tempo, @usuário e comentário.");
      return;
    }
    saveComments([...comments, newComment]);
    setNewComment({ time: "", username: "", message: "" });
    toast.success("Comentário adicionado!");
  };

  const deleteComment = (idx: number) => {
    saveComments(comments.filter((_, i) => i !== idx));
    toast.success("Comentário removido.");
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditingComment({ ...comments[idx] });
  };

  const saveEdit = () => {
    if (editingIdx === null) return;
    const updated = comments.map((c, i) => (i === editingIdx ? editingComment : c));
    saveComments(updated);
    setEditingIdx(null);
    toast.success("Comentário atualizado!");
  };

  const resetToDefault = () => {
    saveComments(DEFAULT_SCHEDULED_COMMENTS);
    toast.success("Comentários restaurados para a lista padrão!");
  };

  const filtered = comments.filter(
    (c) =>
      c.username.toLowerCase().includes(search.toLowerCase()) ||
      c.message.toLowerCase().includes(search.toLowerCase()) ||
      c.time.includes(search)
  );

  if (authLoading) return null;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-16">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")} className="text-zinc-400 hover:text-white">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-lg font-black text-white">🎥 Gestão da Live</h1>
            <p className="text-xs text-zinc-500">Gerencie vídeo, oferta e comentários da transmissão</p>
          </div>
          <a href="/live-aovivo" target="_blank" rel="noopener noreferrer" className="ml-auto">
            <Button variant="outline" size="sm" className="text-xs border-zinc-700 text-zinc-300 hover:text-white">
              <ExternalLink size={13} className="mr-1" /> Ver Live
            </Button>
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── SEÇÃO 1: URL do Vídeo ─────────────────────────────────────────── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Video size={16} className="text-cyan-400" />
            <h2 className="font-black text-sm uppercase tracking-wider text-white">URL do Vídeo YouTube</h2>
          </div>
          <p className="text-xs text-zinc-400">Cole a URL completa ou o ID do vídeo do YouTube para exibir na live.</p>
          <div className="flex gap-2">
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... ou ID do vídeo"
              className="bg-zinc-950 border-zinc-700 text-zinc-100 rounded-xl flex-1"
            />
            <Button onClick={saveVideo} className="bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl px-5 flex-shrink-0">
              <Save size={14} className="mr-1" /> Salvar
            </Button>
          </div>
        </section>

        {/* ── SEÇÃO 2: Banner de Oferta ─────────────────────────────────────── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag size={16} className="text-emerald-400" />
            <h2 className="font-black text-sm uppercase tracking-wider text-white">Configurações da Oferta</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Ativar no Minuto</label>
              <Input
                value={offerSettings.time}
                onChange={(e) => setOfferSettings({ ...offerSettings, time: e.target.value })}
                placeholder="60:00"
                className="bg-zinc-950 border-zinc-700 text-zinc-100 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">URL de Checkout</label>
              <Input
                value={offerSettings.checkoutUrl}
                onChange={(e) => setOfferSettings({ ...offerSettings, checkoutUrl: e.target.value })}
                placeholder="https://buy.stripe.com/..."
                className="bg-zinc-950 border-zinc-700 text-zinc-100 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Título da Oferta</label>
              <Input
                value={offerSettings.title}
                onChange={(e) => setOfferSettings({ ...offerSettings, title: e.target.value })}
                placeholder="🔥 OFERTA EXCLUSIVA DA LIVE LIBERADA!"
                className="bg-zinc-950 border-zinc-700 text-zinc-100 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Descrição</label>
              <Input
                value={offerSettings.description}
                onChange={(e) => setOfferSettings({ ...offerSettings, description: e.target.value })}
                placeholder="Descrição da oferta..."
                className="bg-zinc-950 border-zinc-700 text-zinc-100 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Texto de Preço</label>
              <Input
                value={offerSettings.price}
                onChange={(e) => setOfferSettings({ ...offerSettings, price: e.target.value })}
                placeholder="Apenas 12x de R$ 28,91 ou R$ 347 à vista"
                className="bg-zinc-950 border-zinc-700 text-zinc-100 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">URL Banner Personalizado (opcional)</label>
              <Input
                value={offerSettings.bannerUrl}
                onChange={(e) => setOfferSettings({ ...offerSettings, bannerUrl: e.target.value })}
                placeholder="https://... (deixe vazio para usar layout padrão)"
                className="bg-zinc-950 border-zinc-700 text-zinc-100 rounded-xl"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={saveOffer} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl flex-1 sm:flex-none">
              <Save size={14} className="mr-1" /> Salvar Oferta
            </Button>
            <Button onClick={showOfferNow} variant="outline" className="border-amber-600/40 text-amber-400 hover:bg-amber-950/30 font-black rounded-xl flex-1 sm:flex-none text-xs">
              ⚡ Mostrar Agora
            </Button>
            <Button onClick={resetOfferVisibility} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white font-black rounded-xl flex-1 sm:flex-none text-xs">
              ⏰ Volta ao Agendado
            </Button>
          </div>

          <div className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 ${offerSettings.status === "visible" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40" : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/40"}`}>
            <span className={`h-2 w-2 rounded-full ${offerSettings.status === "visible" ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
            Status: {offerSettings.status === "visible" ? "ATIVA — aparecendo agora na live" : `AGENDADA — aparecerá no minuto ${offerSettings.time}`}
          </div>
        </section>

        {/* ── SEÇÃO 3: Comentários Agendados ───────────────────────────────── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-400" />
              <h2 className="font-black text-sm uppercase tracking-wider text-white">Comentários Agendados</h2>
            </div>
            <span className="text-xs bg-zinc-800 px-2 py-1 rounded-lg text-zinc-400 font-bold">
              {comments.length} comentários
            </span>
          </div>

          {/* Add new comment */}
          <div className="bg-zinc-950 border border-zinc-700/50 rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Adicionar Novo Comentário</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Tempo (MM:SS)</label>
                <Input
                  value={newComment.time}
                  onChange={(e) => setNewComment({ ...newComment, time: e.target.value })}
                  placeholder="01:30"
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 rounded-lg text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">@Usuário</label>
                <Input
                  value={newComment.username}
                  onChange={(e) => setNewComment({ ...newComment, username: e.target.value })}
                  placeholder="FulanoViagens"
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 rounded-lg text-sm"
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Comentário</label>
                <div className="flex gap-2">
                  <Input
                    value={newComment.message}
                    onChange={(e) => setNewComment({ ...newComment, message: e.target.value })}
                    placeholder="Texto do comentário..."
                    className="bg-zinc-900 border-zinc-700 text-zinc-100 rounded-lg text-sm flex-1"
                    onKeyDown={(e) => e.key === "Enter" && addComment()}
                  />
                  <Button onClick={addComment} size="icon" className="bg-blue-500 hover:bg-blue-400 text-white rounded-lg flex-shrink-0">
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por @usuário, comentário ou tempo..."
            className="bg-zinc-950 border-zinc-700 text-zinc-100 rounded-xl"
          />

          {/* Table */}
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <div className="grid grid-cols-[80px_140px_1fr_80px] bg-zinc-800/60 px-3 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-700/50">
              <span>Tempo</span>
              <span>@Usuário</span>
              <span>Comentário</span>
              <span className="text-right">Ações</span>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-sm">Nenhum comentário encontrado.</div>
              ) : (
                filtered.map((c, idx) => (
                  <div
                    key={`${c.time}-${idx}`}
                    className="grid grid-cols-[80px_140px_1fr_80px] items-center px-3 py-2.5 border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors"
                  >
                    {editingIdx === comments.indexOf(c) ? (
                      <>
                        <Input value={editingComment.time} onChange={(e) => setEditingComment({ ...editingComment, time: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100 rounded-lg text-xs h-7 px-2" />
                        <Input value={editingComment.username} onChange={(e) => setEditingComment({ ...editingComment, username: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100 rounded-lg text-xs h-7 px-2 mx-1" />
                        <Input value={editingComment.message} onChange={(e) => setEditingComment({ ...editingComment, message: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100 rounded-lg text-xs h-7 px-2" onKeyDown={(e) => e.key === "Enter" && saveEdit()} />
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" onClick={saveEdit} className="h-7 w-7 bg-emerald-600 hover:bg-emerald-500 rounded-lg"><Save size={12} /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingIdx(null)} className="h-7 w-7 text-zinc-400 hover:text-white rounded-lg">✕</Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-cyan-400 font-black text-xs font-mono">{c.time}</span>
                        <span className="text-zinc-300 font-bold text-xs truncate pr-2">@{c.username}</span>
                        <span className="text-zinc-400 text-xs truncate">{c.message}</span>
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" onClick={() => startEdit(comments.indexOf(c))} className="h-7 w-7 text-zinc-400 hover:text-cyan-400 rounded-lg"><Pencil size={12} /></Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteComment(comments.indexOf(c))} className="h-7 w-7 text-zinc-400 hover:text-red-400 rounded-lg"><Trash2 size={12} /></Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <Button variant="outline" onClick={resetToDefault} className="border-zinc-700 text-zinc-400 hover:text-white font-bold rounded-xl text-xs w-full">
            ↺ Restaurar lista padrão original
          </Button>
        </section>

        {/* ── SEÇÃO 4: Comentários de Espera (Antes do Play) ───────────────── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-pink-400" />
            <h2 className="font-black text-sm uppercase tracking-wider text-white">Comentários de Espera (Antes do Play)</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Estes 3 comentários aparecem fixos na tela de chat antes de o usuário clicar no Play (simulando que outras pessoas já estavam aguardando).
          </p>

          <div className="space-y-3">
            {prePlayComments.map((comment, index) => (
              <div key={comment.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-pink-400 uppercase tracking-wider">Comentário {index + 1}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase">@Usuário</label>
                    <Input
                      value={comment.username}
                      onChange={(e) => {
                        const updated = [...prePlayComments];
                        updated[index] = { ...updated[index], username: e.target.value };
                        savePrePlay(updated);
                      }}
                      placeholder="username"
                      className="bg-zinc-900 border-zinc-700 text-zinc-100 rounded-lg text-xs h-9 px-2.5"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase">Mensagem</label>
                    <Input
                      value={comment.message}
                      onChange={(e) => {
                        const updated = [...prePlayComments];
                        updated[index] = { ...updated[index], message: e.target.value };
                        savePrePlay(updated);
                      }}
                      placeholder="Sua mensagem..."
                      className="bg-zinc-900 border-zinc-700 text-zinc-100 rounded-lg text-xs h-9 px-2.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default LiveManager;
