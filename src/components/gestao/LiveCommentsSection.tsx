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
  Download
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
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formTime, setFormTime] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("live_stream_comments");
    if (saved) {
      try {
        setComments(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved comments, using default", e);
        setComments([...DEFAULT_SCHEDULED_COMMENTS]);
        localStorage.setItem("live_stream_comments", JSON.stringify(DEFAULT_SCHEDULED_COMMENTS));
      }
    } else {
      setComments([...DEFAULT_SCHEDULED_COMMENTS]);
      localStorage.setItem("live_stream_comments", JSON.stringify(DEFAULT_SCHEDULED_COMMENTS));
    }
  }, []);

  // Sync to localStorage
  const saveComments = (newComments: ScheduledComment[]) => {
    // Sort chronologically by time (convert MM:SS to seconds)
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
    // Find absolute index in the main array
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

  // Form Validation and Submit
  const handleSave = () => {
    if (!formUsername.trim()) {
      toast.error("O campo @usuario é obrigatório.");
      return;
    }
    if (!formMessage.trim()) {
      toast.error("O campo comentário é obrigatório.");
      return;
    }
    
    // Time validation (MM:SS)
    const timeRegex = /^[0-9]{1,3}:[0-5][0-9]$/;
    if (!timeRegex.test(formTime)) {
      toast.error("O tempo de vídeo deve estar no formato MM:SS (ex: 00:18 ou 68:20).");
      return;
    }

    const cleanUsername = formUsername.trim().replace(/^@/, ""); // remove leading @ if user typed it
    const newCommentItem: ScheduledComment = {
      time: formTime,
      username: cleanUsername,
      message: formMessage.trim()
    };

    let updated = [...comments];

    if (editingIndex !== null) {
      // Edit mode
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
      // Add mode
      updated.push(newCommentItem);
      toast.success("Comentário adicionado!");
    }

    saveComments(updated);
    setDialogOpen(false);
  };

  // Export JSON or CSV for safety backup
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
            <div className="max-h-[600px] overflow-y-auto">
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

      {/* Add / Edit Dialog */}
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
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/95 gap-2">
              <Check className="w-4 h-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
