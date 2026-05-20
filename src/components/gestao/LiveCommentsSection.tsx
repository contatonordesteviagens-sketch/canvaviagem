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
  Link as LinkIcon
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
    setDialogOpen(true);
  };

  // Open Dialog for Edit
  const handleOpenEdit = (index: number, comment: ScheduledComment) => {
    setEditingIndex(index);
    setFormUsername(comment.username);
    setFormMessage(comment.message);
    setFormTime(comment.time);
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

    saveComments(updated);
    setDialogOpen(false);
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
