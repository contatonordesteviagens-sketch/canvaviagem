import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Search, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Clock, 
  User, 
  Check, 
  AlertCircle,
  FileText,
  Download,
  Video,
  ShoppingBag,
  Eye,
  Settings2,
  Tag,
  Sparkles,
  Link as LinkIcon,
  Zap,
  HelpCircle,
  Layers
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { DEFAULT_SCHEDULED_COMMENTS, ScheduledComment } from "@/data/scheduledComments";

// Preset Single Comments Data
interface CommentPreset {
  category: "social" | "purchase" | "question";
  username: string;
  message: string;
  label: string;
}

const SINGLE_COMMENT_PRESETS: CommentPreset[] = [
  // Prova Social / Elogios
  { category: "social", label: "Uso todo dia", username: "GiseleDestinos", message: "Assino o canva viagem uso todo dia me salva demais!" },
  { category: "social", label: "Suporte Incrível", username: "DuduPeloMundo", message: "Esse suporte do elite é de outro planeta!" },
  { category: "social", label: "Feed Premium", username: "KarinaViagens", message: "Já mudei meu feed com o Canva Viagem, clientes amando!" },
  { category: "social", label: "Velocidade I.A", username: "AlinePeloMundo", message: "Chocada com a velocidade q gera as fotos com preco!" },
  
  // Compra Confirmada (FOMO)
  { category: "purchase", label: "COMPRADO! Acesso Ok", username: "PedroViagens", message: "COMPRADO! Já chegou meu acesso no e-mail, muito rápido!" },
  { category: "purchase", label: "Assinei agora", username: "AnaPeloMundo", message: "Assinei agora mesmo! Ansiosa para começar!" },
  { category: "purchase", label: "Garantido com Desconto", username: "DiegoExpedicoes", message: "Consegui assinar com desconto! Cupom funcionou perfeito!" },
  { category: "purchase", label: "Já sou Aluna", username: "CarlaTurismo", message: "Já sou aluna do Elite, melhor investimento que fiz!" },

  // Dúvidas / Preço
  { category: "question", label: "Funciona celular?", username: "RafaDeFerias", message: "Tem q ter notebook ou dá pra fazer tudo pelo celular?" },
  { category: "question", label: "Como assinar?", username: "MariEmJericoacoara", message: "Como faz pra assinar? Libera o link logo Lucas!" },
  { category: "question", label: "Formato Reels?", username: "RobertoTrilhas", message: "Lucas, os criativos já vem no formato de reels e stories?" },
  { category: "question", label: "Limites diários", username: "ValdirTur", message: "Quais os limites de geração diária na Fábrica I.A?" },
];

// Preset Packages Data
interface PresetPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  comments: Omit<ScheduledComment, "time">[];
}

const PRESET_PACKS: PresetPack[] = [
  {
    id: "pack_purchase",
    name: "🔥 Pack Compra Confirmada (Gera FOMO e Pressão)",
    description: "Injeta 5 comentários de compra confirmada simulando alta conversão após liberação do link.",
    icon: "ShoppingBag",
    comments: [
      { username: "PedroViagens", message: "COMPRADO! Acesso liberado no e-mail super rápido!" },
      { username: "AnaPeloMundo", message: "Assinei! O cupom de desconto da live funcionou perfeito!" },
      { username: "DiegoExpedicoes", message: "Garantido! Ansioso pra mexer na fábrica de anúncios hoje!" },
      { username: "SandraRoteiros", message: "Consegui assinar! O suporte já me mandou os bônus no whats!" },
      { username: "MuriloTrilhas", message: "Acabei de fechar o plano anual, melhor investimento!" }
    ]
  },
  {
    id: "pack_social",
    name: "⭐ Pack Prova Social (Aquece a Audiência)",
    description: "Injeta 5 comentários elogiando o Canva Viagem e a Fábrica I.A.",
    icon: "Sparkles",
    comments: [
      { username: "GiseleDestinos", message: "Uso o canva viagem todo dia, me economiza horas de postagem!" },
      { username: "CarlaTurismo", message: "O suporte do Elite responde em minutos, é surreal de bom!" },
      { username: "DuduPeloMundo", message: "Esse gerador de anúncios é o futuro, facilidade extrema!" },
      { username: "KarinaViagens", message: "Meus anúncios agora parecem feitos por agência de R$ 5k!" },
      { username: "PatriciaLemos", message: "O melhor de tudo é que dá pra colocar nossa logo e cores!" }
    ]
  },
  {
    id: "pack_questions",
    name: "❓ Pack Dúvidas (Prepara Venda)",
    description: "Injeta 5 perguntas comuns de clientes interessados para justificar suas respostas.",
    icon: "HelpCircle",
    comments: [
      { username: "Jr99", message: "Qual vai ser o preço do Canva Viagem na live de hoje?" },
      { username: "MariEmJericoacoara", message: "Lucas, libera o link de inscrição logo por favor!" },
      { username: "RafaDeFerias", message: "Consigo criar anúncios e mexer em tudo pelo celular?" },
      { username: "RobertoTrilhas", message: "Já vem com os textos e hashtags prontas também?" },
      { username: "AmandaTurismo", message: "Tem templates para destinos internacionais e nacionais?" }
    ]
  }
];

export const LiveCommentsSection = () => {
  const [comments, setComments] = useState<ScheduledComment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Video Settings State
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/watch?v=Xqcw-NpPz08");
  
  // Offer Settings State
  const [offerStatus, setOfferStatus] = useState<"hidden" | "visible" | "scheduled">("scheduled");
  const [offerTime, setOfferTime] = useState("50:00");
  const [offerTitle, setOfferTitle] = useState("🔥 OFERTA EXCLUSIVA DA LIVE LIBERADA!");
  const [offerDesc, setOfferDesc] = useState("Adquira o Canva Viagem Vitalício + Fábrica de Anúncios I.A com Desconto!");
  const [offerPrice, setOfferPrice] = useState("Apenas 12x de R$ 29,70 ou R$ 297 à vista");
  const [offerCheckoutUrl, setOfferCheckoutUrl] = useState("/planos");
  const [offerBannerUrl, setOfferBannerUrl] = useState("");

  // Dialog State for Comments
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formTime, setFormTime] = useState("");

  // Bulk Pack Settings
  const [selectedPackId, setSelectedPackId] = useState("pack_purchase");
  const [packStartTime, setPackStartTime] = useState("50:00");
  const [packInterval, setPackInterval] = useState(15); // 15 seconds spacing

  // Custom Presets State
  interface CustomCommentPreset {
    id: string;
    time: string;
    username: string;
    message: string;
    label: string;
  }
  const [customPresets, setCustomPresets] = useState<CustomCommentPreset[]>([]);
  const [presetLabel, setPresetLabel] = useState("");
  const [presetTime, setPresetTime] = useState("");
  const [presetUsername, setPresetUsername] = useState("");
  const [presetMessage, setPresetMessage] = useState("");
  const [saveAsPresetCheckbox, setSaveAsPresetCheckbox] = useState(false);
  const [activePresetTab, setActivePresetTab] = useState<"standard" | "custom">("standard");

  // Load everything from localStorage on mount
  useEffect(() => {
    // 1. Comments
    const savedComments = localStorage.getItem("live_stream_comments");
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (e) {
        console.error("Error parsing saved comments, using default", e);
        setComments([...DEFAULT_SCHEDULED_COMMENTS]);
        localStorage.setItem("live_stream_comments", JSON.stringify(DEFAULT_SCHEDULED_COMMENTS));
      }
    } else {
      setComments([...DEFAULT_SCHEDULED_COMMENTS]);
      localStorage.setItem("live_stream_comments", JSON.stringify(DEFAULT_SCHEDULED_COMMENTS));
    }

    // 2. Video URL
    const savedVideo = localStorage.getItem("live_stream_video_url");
    if (savedVideo) {
      setVideoUrl(savedVideo);
    }

    // 3. Offer Settings
    const savedOffer = localStorage.getItem("live_stream_offer_settings");
    if (savedOffer) {
      try {
        const parsed = JSON.parse(savedOffer);
        setOfferStatus(parsed.status || "scheduled");
        setOfferTime(parsed.time || "50:00");
        setOfferTitle(parsed.title || "🔥 OFERTA EXCLUSIVA DA LIVE LIBERADA!");
        setOfferDesc(parsed.description || "Adquira o Canva Viagem Vitalício + Fábrica de Anúncios I.A com Desconto!");
        setOfferPrice(parsed.price || "Apenas 12x de R$ 29,70 ou R$ 297 à vista");
        setOfferCheckoutUrl(parsed.checkoutUrl || "/planos");
        setOfferBannerUrl(parsed.bannerUrl || "");
      } catch (e) {
        console.error("Error parsing saved offer settings", e);
      }
    }

    // 4. Custom Presets
    const savedCustomPresets = localStorage.getItem("live_stream_custom_presets");
    if (savedCustomPresets) {
      try {
        setCustomPresets(JSON.parse(savedCustomPresets));
      } catch (e) {
        console.error("Error parsing saved custom presets", e);
      }
    } else {
      const defaultCustom: CustomCommentPreset[] = [
        {
          id: "preset_1",
          label: "Boas-vindas Fábio",
          time: "00:18",
          username: "Fabiotravell",
          message: "opa cheguei"
        },
        {
          id: "preset_2",
          label: "Boas-vindas Jr99",
          time: "00:26",
          username: "Jr99",
          message: "boraaa"
        },
        {
          id: "preset_3",
          label: "Cidade Sorocaba",
          time: "00:47",
          username: "PedroViagens",
          message: "São Paulo Sorocaba"
        },
        {
          id: "preset_4",
          label: "Elogio Canva Viagem",
          time: "01:29",
          username: "GiseleDestinos",
          message: "Assino o canva viagem uso todo dia me salva demais"
        }
      ];
      setCustomPresets(defaultCustom);
      localStorage.setItem("live_stream_custom_presets", JSON.stringify(defaultCustom));
    }
  }, []);

  // Sync comments to localStorage
  const saveComments = (newComments: ScheduledComment[]) => {
    const sorted = [...newComments].sort((a, b) => {
      const parseTimeToSeconds = (t: string) => {
        const parts = t.split(":");
        if (parts.length !== 2) return 0;
        const minutes = parseInt(parts[0], 10) || 0;
        const seconds = parseInt(parts[1], 10) || 0;
        return minutes * 60 + seconds;
      };
      return parseTimeToSeconds(a.time) - parseTimeToSeconds(b.time);
    });

    setComments(sorted);
    localStorage.setItem("live_stream_comments", JSON.stringify(sorted));
  };

  // Save Video settings
  const handleSaveVideoSettings = () => {
    if (!videoUrl.trim()) {
      toast.error("O link ou ID do vídeo não pode estar em branco.");
      return;
    }
    localStorage.setItem("live_stream_video_url", videoUrl.trim());
    toast.success("Link do vídeo da transmissão atualizado com sucesso!");
  };

  // Save Offer Settings
  const handleSaveOfferSettings = () => {
    if (offerStatus === "scheduled") {
      const timeRegex = /^[0-9]{1,3}:[0-5][0-9]$/;
      if (!timeRegex.test(offerTime)) {
        toast.error("O tempo de vídeo deve estar no formato MM:SS (ex: 50:00).");
        return;
      }
    }
    if (!offerTitle.trim()) {
      toast.error("O título da oferta é obrigatório.");
      return;
    }
    if (!offerCheckoutUrl.trim()) {
      toast.error("O link de checkout/compra é obrigatório.");
      return;
    }

    const settings = {
      status: offerStatus,
      time: offerTime,
      title: offerTitle.trim(),
      description: offerDesc.trim(),
      price: offerPrice.trim(),
      checkoutUrl: offerCheckoutUrl.trim(),
      bannerUrl: offerBannerUrl.trim()
    };

    localStorage.setItem("live_stream_offer_settings", JSON.stringify(settings));
    toast.success("Configurações da oferta salvas com sucesso!");
  };

  // Filtered comments based on search
  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      const usernameMatch = comment.username.toLowerCase().includes(searchQuery.toLowerCase());
      const messageMatch = comment.message.toLowerCase().includes(searchQuery.toLowerCase());
      const timeMatch = comment.time.includes(searchQuery);
      return usernameMatch || messageMatch || timeMatch;
    });
  }, [comments, searchQuery]);

  // Open Dialog for Add
  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormUsername("");
    setFormMessage("");
    setFormTime("");
    setSaveAsPresetCheckbox(false);
    setDialogOpen(true);
  };

  // Open Dialog for Edit
  const handleOpenEdit = (index: number, comment: ScheduledComment) => {
    setEditingIndex(index);
    setFormUsername(comment.username);
    setFormMessage(comment.message);
    setFormTime(comment.time);
    setSaveAsPresetCheckbox(false);
    setDialogOpen(true);
  };

  // Delete Comment
  const handleDelete = (index: number) => {
    const commentToDelete = filteredComments[index];
    const actualIndex = comments.findIndex(
      (c) => c.time === commentToDelete.time && 
             c.username === commentToDelete.username && 
             c.message === commentToDelete.message
    );

    if (actualIndex !== -1) {
      const updated = [...comments];
      updated.splice(actualIndex, 1);
      saveComments(updated);
      toast.success("Comentário excluído com sucesso!");
    }
  };

  // Restore Default 107 Comments
  const handleRestoreDefault = () => {
    if (window.confirm("Tem certeza que deseja restaurar a lista padrão de 107 comentários da live? Isso apagará suas alterações personalizadas.")) {
      saveComments(DEFAULT_SCHEDULED_COMMENTS);
      toast.success("Comentários restaurados para o padrão original!");
    }
  };

  // Form Validation and Submit for Comments
  const handleSaveComment = () => {
    if (!formUsername.trim()) {
      toast.error("O campo @usuario é obrigatório.");
      return;
    }
    if (!formMessage.trim()) {
      toast.error("O campo comentário é obrigatório.");
      return;
    }
    
    const timeRegex = /^[0-9]{1,3}:[0-5][0-9]$/;
    if (!timeRegex.test(formTime)) {
      toast.error("O tempo de vídeo deve estar no formato MM:SS (ex: 00:18 ou 68:20).");
      return;
    }

    const cleanUsername = formUsername.trim().replace(/^@/, ""); 
    const newCommentItem: ScheduledComment = {
      time: formTime,
      username: cleanUsername,
      message: formMessage.trim()
    };

    let updated = [...comments];

    if (editingIndex !== null) {
      const commentToEdit = filteredComments[editingIndex];
      const actualIndex = comments.findIndex(
        (c) => c.time === commentToEdit.time && 
               c.username === commentToEdit.username && 
               c.message === commentToEdit.message
      );

      if (actualIndex !== -1) {
        updated[actualIndex] = newCommentItem;
        toast.success("Comentário atualizado!");
      }
    } else {
      updated.push(newCommentItem);
      toast.success("Comentário adicionado!");
    }

    // Save as Custom Preset if checkbox is checked
    if (saveAsPresetCheckbox) {
      const newPreset: CustomCommentPreset = {
        id: `custom_preset_${Date.now()}`,
        label: `Predef. - ${cleanUsername}`,
        time: formTime,
        username: cleanUsername,
        message: formMessage.trim()
      };
      const updatedPresets = [...customPresets, newPreset];
      setCustomPresets(updatedPresets);
      localStorage.setItem("live_stream_custom_presets", JSON.stringify(updatedPresets));
      setSaveAsPresetCheckbox(false); // Reset checkbox
      toast.success("Comentário também foi salvo como predefinição!");
    }

    saveComments(updated);
    setDialogOpen(false);
  };

  // Custom Preset Helpers
  const handleSaveCustomPreset = () => {
    if (!presetLabel.trim()) {
      toast.error("O campo identificador da predefinição é obrigatório.");
      return;
    }
    if (!presetUsername.trim()) {
      toast.error("O campo @usuario é obrigatório.");
      return;
    }
    if (!presetMessage.trim()) {
      toast.error("O campo comentário é obrigatório.");
      return;
    }
    
    const timeRegex = /^[0-9]{1,3}:[0-5][0-9]$/;
    if (!timeRegex.test(presetTime)) {
      toast.error("O tempo de vídeo deve estar no formato MM:SS (ex: 00:18 ou 68:20).");
      return;
    }

    const cleanUsername = presetUsername.trim().replace(/^@/, "");
    const newPreset: CustomCommentPreset = {
      id: `custom_preset_${Date.now()}`,
      label: presetLabel.trim(),
      time: presetTime.trim(),
      username: cleanUsername,
      message: presetMessage.trim()
    };

    const updatedPresets = [...customPresets, newPreset];
    setCustomPresets(updatedPresets);
    localStorage.setItem("live_stream_custom_presets", JSON.stringify(updatedPresets));
    
    // Clear inputs
    setPresetLabel("");
    setPresetTime("");
    setPresetUsername("");
    setPresetMessage("");
    
    toast.success("Nova predefinição salva com sucesso!");
  };

  const handleDeleteCustomPreset = (id: string) => {
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem("live_stream_custom_presets", JSON.stringify(updated));
    toast.success("Predefinição excluída da biblioteca.");
  };

  const handleApplyCustomPreset = (preset: CustomCommentPreset) => {
    const newCommentItem: ScheduledComment = {
      time: preset.time,
      username: preset.username,
      message: preset.message
    };

    const duplicate = comments.some(
      c => c.time === preset.time && 
           c.username === preset.username && 
           c.message === preset.message
    );

    if (duplicate) {
      toast.warning(`Este comentário já está agendado em ${preset.time}.`);
      return;
    }

    const updated = [...comments, newCommentItem];
    saveComments(updated);
    toast.success(`Comentário de @${preset.username} agendado para o tempo ${preset.time}!`);
  };

  // Preset 1-Click Fill handler
  const handleSelectPreset = (preset: CommentPreset) => {
    setEditingIndex(null);
    setFormUsername(preset.username);
    setFormMessage(preset.message);
    
    // Guess next time logic: use the time of the last comment + 10s, or "50:00"
    let suggestedTime = "50:00";
    if (comments.length > 0) {
      const lastComment = comments[comments.length - 1];
      const parts = lastComment.time.split(":");
      if (parts.length === 2) {
        let mins = parseInt(parts[0], 10) || 0;
        let secs = parseInt(parts[1], 10) || 0;
        secs += 10;
        if (secs >= 60) {
          mins += Math.floor(secs / 60);
          secs = secs % 60;
        }
        suggestedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }
    
    setFormTime(suggestedTime);
    setDialogOpen(true);
    toast.success(`Predefinição de @${preset.username} carregada com sucesso!`);
  };

  // Bulk Inject preset pack handler
  const handleInjectPack = () => {
    const timeRegex = /^[0-9]{1,3}:[0-5][0-9]$/;
    if (!timeRegex.test(packStartTime)) {
      toast.error("O tempo inicial de injeção deve estar no formato MM:SS (ex: 50:00).");
      return;
    }

    const pack = PRESET_PACKS.find(p => p.id === selectedPackId);
    if (!pack) return;

    // Calculate time sequences
    const parts = packStartTime.split(":");
    let mins = parseInt(parts[0], 10) || 0;
    let secs = parseInt(parts[1], 10) || 0;
    let totalSecs = mins * 60 + secs;

    const newComments: ScheduledComment[] = [];

    pack.comments.forEach((c, i) => {
      const currentTotalSecs = totalSecs + (i * packInterval);
      const currentMins = Math.floor(currentTotalSecs / 60);
      const currentSecs = currentTotalSecs % 60;
      const formattedTime = `${String(currentMins).padStart(2, '0')}:${String(currentSecs).padStart(2, '0')}`;
      
      newComments.push({
        time: formattedTime,
        username: c.username,
        message: c.message
      });
    });

    const updated = [...comments, ...newComments];
    saveComments(updated);
    toast.success(`Pacote "${pack.name}" com 5 comentários injetado e ordenado com sucesso!`);
  };

  // Export JSON for backup
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(comments, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `comentarios-live-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Backup dos comentários baixado com sucesso!");
  };

  return (
    <div className="space-y-6">
      
      {/* SEÇÃO 1: BIBLIOTECA DE PREDEFINIÇÕES & INSERÇÃO RÁPIDA (SOLICITADA PELO USUÁRIO) */}
      <Card className="border border-cyan-500/20 bg-card/65 backdrop-blur-sm shadow-[0_4px_20px_rgba(6,182,212,0.05)]">
        <CardHeader className="border-b border-muted-foreground/10 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            Biblioteca de Comentários Predefinidos
          </CardTitle>
          <CardDescription>
            Agilize a criação da live! Use predefinições de alta conversão para preencher o formulário com um clique ou criar predefinições customizadas de tempo, nome e comentário.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* SELETOR DE ABAS */}
          <div className="flex gap-2 p-1 bg-muted/30 border border-muted-foreground/10 rounded-lg w-fit">
            <button
              onClick={() => setActivePresetTab("standard")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all duration-300 flex items-center gap-1.5 ${
                activePresetTab === "standard"
                  ? "bg-cyan-500 text-black shadow-[0_2px_10px_rgba(6,182,212,0.15)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Padrão & Pacotes
            </button>
            <button
              onClick={() => setActivePresetTab("custom")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all duration-300 flex items-center gap-1.5 ${
                activePresetTab === "custom"
                  ? "bg-cyan-500 text-black shadow-[0_2px_10px_rgba(6,182,212,0.15)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Zap className="w-4 h-4" />
              Predefinições com Tempo (Tempo, Nome, Comentário)
            </button>
          </div>

          {activePresetTab === "standard" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COLUNA 1 & 2: MODELOS INDIVIDUAIS (1-CLICK FILL) */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Modelos Individuais de Alta Conversão (Clique para Preencher)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Categoria 1: Prova Social */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      ⭐ Prova Social
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {SINGLE_COMMENT_PRESETS.filter(p => p.category === "social").map((preset, idx) => (
                        <Button
                          key={`social-${idx}`}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectPreset(preset)}
                          className="justify-start text-left text-xs font-semibold py-1.5 h-auto truncate border-muted-foreground/15 hover:bg-emerald-500/5 hover:border-emerald-500/30 group"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                          <span className="truncate" title={preset.message}>{preset.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Categoria 2: Compra Confirmada */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                      🔥 Compra (FOMO)
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {SINGLE_COMMENT_PRESETS.filter(p => p.category === "purchase").map((preset, idx) => (
                        <Button
                          key={`purchase-${idx}`}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectPreset(preset)}
                          className="justify-start text-left text-xs font-semibold py-1.5 h-auto truncate border-muted-foreground/15 hover:bg-cyan-500/5 hover:border-cyan-500/30 group"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                          <span className="truncate" title={preset.message}>{preset.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Categoria 3: Dúvidas */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      ❓ Dúvidas & Perguntas
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {SINGLE_COMMENT_PRESETS.filter(p => p.category === "question").map((preset, idx) => (
                        <Button
                          key={`question-${idx}`}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectPreset(preset)}
                          className="justify-start text-left text-xs font-semibold py-1.5 h-auto truncate border-muted-foreground/15 hover:bg-amber-500/5 hover:border-amber-500/30 group"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5 text-muted-foreground group-hover:text-amber-400 transition-colors" />
                          <span className="truncate" title={preset.message}>{preset.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUNA 3: INJEÇÃO DE PACOTES EM LOTE (BULK PACKS) */}
              <div className="border-t lg:border-t-0 lg:border-l border-muted-foreground/10 pt-4 lg:pt-0 lg:pl-6 space-y-4">
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Injetar Pacotes em Lote (Lançamento)
                </h4>
                
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Escolha o Pacote Temático</label>
                    <select
                      value={selectedPackId}
                      onChange={(e) => setSelectedPackId(e.target.value)}
                      className="w-full rounded-md border border-muted-foreground/15 bg-muted/30 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {PRESET_PACKS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        Início (MM:SS)
                      </label>
                      <Input
                        size={5}
                        placeholder="50:00"
                        value={packStartTime}
                        onChange={(e) => setPackStartTime(e.target.value)}
                        className="bg-muted/30 border-muted-foreground/15 h-8 text-xs font-mono"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase">
                        Espaçamento
                      </label>
                      <select
                        value={packInterval}
                        onChange={(e) => setPackInterval(parseInt(e.target.value, 10))}
                        className="w-full rounded-md border border-muted-foreground/15 bg-muted/30 px-2 py-1.5 text-xs text-foreground h-8 focus:outline-none"
                      >
                        <option value={10}>10 segundos</option>
                        <option value={15}>15 segundos</option>
                        <option value={20}>20 segundos</option>
                        <option value={30}>30 segundos</option>
                      </select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleInjectPack}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-black text-xs h-9 tracking-wide uppercase shadow-[0_2px_10px_rgba(6,182,212,0.15)] flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-black" />
                    Injetar 5 Comentários
                  </Button>

                  <p className="text-[10px] text-muted-foreground text-center leading-tight">
                    Adiciona 5 comentários em sequência espaçados pelo tempo selecionado a partir do tempo inicial.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* COLUNA 1: FORMULÁRIO DE CADASTRO DE PREDEFINIÇÃO */}
              <div className="space-y-4 bg-muted/10 border border-muted-foreground/10 p-4 rounded-xl">
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Nova Predefinição Completa
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-muted-foreground uppercase">Nome da Predefinição / Etiqueta</label>
                    <Input
                      placeholder="Ex: Boas-vindas Fábio"
                      value={presetLabel}
                      onChange={(e) => setPresetLabel(e.target.value)}
                      className="bg-card border-muted-foreground/15 h-9 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-muted-foreground uppercase flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        Tempo (MM:SS)
                      </label>
                      <Input
                        placeholder="00:18"
                        value={presetTime}
                        onChange={(e) => setPresetTime(e.target.value)}
                        className="bg-card border-muted-foreground/15 h-9 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-muted-foreground uppercase flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        @usuario
                      </label>
                      <Input
                        placeholder="Fabiotravell"
                        value={presetUsername}
                        onChange={(e) => setPresetUsername(e.target.value)}
                        className="bg-card border-muted-foreground/15 h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-muted-foreground uppercase">Comentário</label>
                    <Input
                      placeholder="opa cheguei"
                      value={presetMessage}
                      onChange={(e) => setPresetMessage(e.target.value)}
                      className="bg-card border-muted-foreground/15 h-9 text-xs"
                    />
                  </div>

                  <Button 
                    onClick={handleSaveCustomPreset}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-black text-xs h-9 tracking-wide uppercase shadow-[0_2px_10px_rgba(6,182,212,0.15)] flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Salvar na Biblioteca
                  </Button>
                </div>
              </div>

              {/* COLUNA 2 & 3: GRID DE PREDEFINIÇÕES CADASTRADAS */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Predefinições de Comentários Cadastradas ({customPresets.length})
                </h4>

                {customPresets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                    {customPresets.map((preset) => (
                      <div 
                        key={preset.id} 
                        className="bg-card border border-muted-foreground/15 p-3 rounded-xl space-y-3 shadow-sm hover:border-cyan-500/30 transition-all duration-300 relative group flex flex-col justify-between"
                      >
                        <button 
                          onClick={() => handleDeleteCustomPreset(preset.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors duration-200"
                          title="Excluir Predefinição"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center pr-6">
                            <span className="font-black text-xs text-foreground uppercase tracking-wider truncate" title={preset.label}>
                              {preset.label}
                            </span>
                            <Badge variant="outline" className="font-mono text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-2 py-0.5">
                              {preset.time}
                            </Badge>
                          </div>

                          <div className="text-[11px] text-muted-foreground bg-muted/20 p-2 rounded-lg border border-muted-foreground/5 font-mono leading-relaxed truncate-2-lines">
                            <span className="text-primary font-bold">@{preset.username}: </span>
                            "{preset.message}"
                          </div>
                        </div>

                        <Button 
                          size="sm" 
                          onClick={() => handleApplyCustomPreset(preset)} 
                          className="w-full bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black font-black text-[10px] h-7.5 tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1"
                        >
                          <Zap className="w-3 h-3" />
                          Agendar Comentário
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] border border-dashed border-muted-foreground/15 rounded-xl bg-muted/5 gap-2 text-center p-4">
                    <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                    <p className="text-xs font-semibold text-muted-foreground">Nenhuma predefinição com tempo cadastrada.</p>
                    <p className="text-[10px] text-muted-foreground max-w-xs">Use o formulário ao lado para criar predefinições contendo tempo, nome de usuário e comentário.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GRID DE CONFIGURAÇÕES DE TRANSMISSÃO & OFERTAS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* CARD 1: CONTROLE DE VÍDEO DA TRANSMISSÃO */}
        <Card className="border border-muted-foreground/10 bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Vídeo da Transmissão (Replay)
            </CardTitle>
            <CardDescription>
              Substitua o vídeo do YouTube exibido na live de replay para os usuários (/live-aovivo).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="video-url" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                URL ou ID do Vídeo do YouTube
              </label>
              <Input
                id="video-url"
                placeholder="Ex: https://www.youtube.com/watch?v=Xqcw-NpPz08 ou Xqcw-NpPz08"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="bg-muted/30 border-muted-foreground/15"
              />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Suporta links completos do YouTube, links curtos (youtu.be) ou diretamente o ID de 11 caracteres do vídeo.
              </p>
            </div>
            
            <div className="pt-2 flex justify-between items-center">
              {/* Mini Preview do Iframe */}
              <div className="text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-muted-foreground/5 font-mono">
                Ativo: {videoUrl.includes("watch?v=") ? videoUrl.split("watch?v=")[1]?.substring(0,11) : videoUrl.substring(0,11)}...
              </div>
              <Button onClick={handleSaveVideoSettings} className="bg-primary text-primary-foreground hover:bg-primary/95 gap-2">
                <Check className="w-4 h-4" />
                Salvar Vídeo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: BANNER GRANDE DE PREÇO & OFERTA E BOTÃO DE CHECKOUT */}
        <Card className="border border-muted-foreground/10 bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Banner de Preço & Oferta da Live
            </CardTitle>
            <CardDescription>
              Programe o aparecimento automático de um banner e botão de compra para os planos quando falar de preços.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* PRIMEIRA LINHA: STATUS E TEMPO */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Exibição do Banner</label>
                <select
                  value={offerStatus}
                  onChange={(e) => setOfferStatus(e.target.value as any)}
                  className="w-full rounded-md border border-muted-foreground/15 bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="hidden">🚫 Ocultar Banner</option>
                  <option value="visible">👁️ Sempre Mostrar</option>
                  <option value="scheduled">⏱️ Agendado por Tempo</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  Aparecer em (MM:SS)
                </label>
                <Input
                  placeholder="50:00"
                  value={offerTime}
                  disabled={offerStatus !== "scheduled"}
                  onChange={(e) => setOfferTime(e.target.value)}
                  className="bg-muted/30 border-muted-foreground/15"
                />
              </div>
            </div>

            {/* SEGUNDA LINHA: TÍTULO DA OFERTA E PREÇO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Título da Oferta</label>
                <Input
                  placeholder="Ex: 🔥 OFERTA EXCLUSIVA DA LIVE!"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="bg-muted/30 border-muted-foreground/15 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Preço/Texto de Destaque</label>
                <Input
                  placeholder="Ex: Apenas 12x de R$ 29,70 ou R$ 297"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="bg-muted/30 border-muted-foreground/15 text-sm"
                />
              </div>
            </div>

            {/* TERCEIRA LINHA: DESCRIÇÃO DA OFERTA */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Descrição Curta</label>
              <Input
                placeholder="Ex: Canva Viagem Vitalício + Fábrica de Anúncios com Desconto!"
                value={offerDesc}
                onChange={(e) => setOfferDesc(e.target.value)}
                className="bg-muted/30 border-muted-foreground/15 text-sm"
              />
            </div>

            {/* QUARTA LINHA: LINK DE COMPRA & BANNER PERSONALIZADO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  Link de Compra (Checkout)
                </label>
                <Input
                  placeholder="Ex: https://checkout.hotmart.com/..."
                  value={offerCheckoutUrl}
                  onChange={(e) => setOfferCheckoutUrl(e.target.value)}
                  className="bg-muted/30 border-muted-foreground/15 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  URL da Imagem do Banner (Opcional)
                </label>
                <Input
                  placeholder="https://suaimagem.com/banner.png"
                  value={offerBannerUrl}
                  onChange={(e) => setOfferBannerUrl(e.target.value)}
                  className="bg-muted/30 border-muted-foreground/15 text-sm"
                  title="Se deixado em branco, a plataforma gerará automaticamente um banner moderno em degradê CSS"
                />
              </div>
            </div>

            {/* BOTÃO DE SALVAR CONFIGURAÇÕES */}
            <div className="pt-2 flex justify-end">
              <Button onClick={handleSaveOfferSettings} className="bg-primary text-primary-foreground hover:bg-primary/95 gap-2">
                <Check className="w-4 h-4" />
                Salvar Oferta
              </Button>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* CARD DO GERENCIADOR DE COMENTÁRIOS DA LIVE (EXISTENTE E SEGURO) */}
      <Card className="border border-muted-foreground/10 bg-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Gerenciador de Comentários da Live
              </CardTitle>
              <CardDescription>
                Adicione, edite e remova os comentários agendados que aparecem automaticamente no replay da live (/live-aovivo).
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRestoreDefault}
                className="gap-2 text-muted-foreground border-muted-foreground/20 hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar Padrão
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportJSON}
                className="gap-2 text-muted-foreground border-muted-foreground/20 hover:text-foreground"
              >
                <Download className="w-4 h-4" />
                Exportar Backup
              </Button>
              <Button 
                onClick={handleOpenAdd}
                size="sm" 
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/95"
              >
                <Plus className="w-4 h-4" />
                Novo Comentário
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por @usuario, comentário ou tempo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/30 border-muted-foreground/10 focus:border-primary/30"
              />
            </div>
            <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>Total de Comentários: <Badge variant="secondary" className="ml-1 font-bold">{comments.length}</Badge></span>
            </div>
          </div>

          <div className="rounded-md border border-muted-foreground/15 overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[120px] font-bold">Tempo de Vídeo</TableHead>
                    <TableHead className="w-[200px] font-bold">@usuario</TableHead>
                    <TableHead className="font-bold">Comentário</TableHead>
                    <TableHead className="w-[120px] text-right font-bold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComments.length > 0 ? (
                    filteredComments.map((comment, index) => (
                      <TableRow key={`${comment.time}-${comment.username}-${index}`} className="hover:bg-muted/20">
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-sm px-2.5 py-0.5 bg-primary/5 text-primary border-primary/20">
                            {comment.time}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          <span className="text-muted-foreground">@</span>{comment.username}
                        </TableCell>
                        <TableCell className="max-w-md truncate text-muted-foreground text-sm" title={comment.message}>
                          {comment.message}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleOpenEdit(index, comment)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="w-8 h-8 text-muted-foreground/60" />
                          <p>Nenhum comentário encontrado para a busca atual.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog for Comments */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border border-muted-foreground/20 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
              {editingIndex !== null ? <Edit3 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
              {editingIndex !== null ? "Editar Comentário" : "Adicionar Comentário"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingIndex !== null 
                ? "Modifique os detalhes do comentário nos campos abaixo." 
                : "Preencha os campos abaixo para programar um novo comentário na live."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="form-time" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Tempo de Vídeo <span className="text-xs text-muted-foreground font-normal">(formato MM:SS, ex: 00:18 ou 68:20)</span>
              </label>
              <Input
                id="form-time"
                placeholder="00:18"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                className="bg-muted/30 border-muted-foreground/15"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="form-username" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-4 h-4 text-muted-foreground" />
                @usuario <span className="text-xs text-muted-foreground font-normal">(nome do usuário sem o @)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">@</span>
                <Input
                  id="form-username"
                  placeholder="Fabiotravell"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="pl-7 bg-muted/30 border-muted-foreground/15"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="form-message" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Comentário <span className="text-xs text-muted-foreground font-normal">(conteúdo da mensagem)</span>
              </label>
              <Input
                id="form-message"
                placeholder="opa cheguei"
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                className="bg-muted/30 border-muted-foreground/15"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="save-as-preset"
                checked={saveAsPresetCheckbox}
                onChange={(e) => setSaveAsPresetCheckbox(e.target.checked)}
                className="h-4 w-4 rounded border-muted-foreground/30 bg-muted/30 text-primary focus:ring-primary"
              />
              <label
                htmlFor="save-as-preset"
                className="text-xs font-semibold text-muted-foreground cursor-pointer select-none"
              >
                Salvar também na Biblioteca de Predefinições com Tempo
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-muted-foreground/20">
              Cancelar
            </Button>
            <Button onClick={handleSaveComment} className="bg-primary text-primary-foreground hover:bg-primary/95 gap-2">
              <Check className="w-4 h-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
