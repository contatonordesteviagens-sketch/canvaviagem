import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAllContentItems, ContentItem } from "@/hooks/useContent";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  ExternalLink,
  Loader2,
  Filter,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const contentTypes = [
  { value: "video", label: "Vídeo" },
  { value: "feed", label: "Feed" },
  { value: "story", label: "Story" },
  { value: "seasonal", label: "Sazonal" },
  { value: "weekly-story", label: "Story Semanal" },
  { value: "resource", label: "Recurso" },
  { value: "download", label: "Download" },
];

const categories = [
  { value: "nacional", label: "Nacional" },
  { value: "internacional", label: "Internacional" },
  { value: "influencer-eva", label: "Influencer Eva" },
  { value: "influencer-mel", label: "Influencer Mel" },
  { value: "influencer-bia", label: "Influencer Bia" },
];

interface ContentFormData {
  title: string;
  url: string;
  type: string;
  category: string;
  icon: string;
  description: string;
  image_url: string;
  is_new: boolean;
  is_active: boolean;
  display_order: number;
}

const defaultFormData: ContentFormData = {
  title: "",
  url: "",
  type: "video",
  category: "",
  icon: "🎬",
  description: "",
  image_url: "",
  is_new: false,
  is_active: true,
  display_order: 0,
};

export default function ContentManager() {
  const queryClient = useQueryClient();
  const { data: contentItems, isLoading } = useAllContentItems();
  
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState<ContentFormData>(defaultFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      const { error } = await supabase.from("content_items").insert({
        ...data,
        category: data.category || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
      queryClient.invalidateQueries({ queryKey: ["video-templates"] });
      toast.success("Conteúdo criado com sucesso!");
      setIsDialogOpen(false);
      setFormData(defaultFormData);
    },
    onError: (error) => {
      toast.error("Erro ao criar conteúdo: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContentFormData> }) => {
      const { error } = await supabase
        .from("content_items")
        .update({
          ...data,
          category: data.category || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
      queryClient.invalidateQueries({ queryKey: ["video-templates"] });
      toast.success("Conteúdo atualizado com sucesso!");
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData(defaultFormData);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar conteúdo: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("content_items")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
      queryClient.invalidateQueries({ queryKey: ["video-templates"] });
      toast.success("Conteúdo removido!");
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      toast.error("Erro ao remover conteúdo: " + error.message);
    },
  });

  // Filter content
  const filteredContent = contentItems?.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  }) || [];

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      url: item.url,
      type: item.type,
      category: item.category || "",
      icon: item.icon,
      description: item.description || "",
      image_url: item.image_url || "",
      is_new: item.is_new,
      is_active: item.is_active,
      display_order: item.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.url) {
      toast.error("Preencha título e URL");
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData(defaultFormData);
  };

  const handleGenerateThumbnail = async () => {
    if (!formData.title.trim()) {
      toast.error("Digite um título primeiro para gerar a capa");
      return;
    }

    setIsGeneratingThumbnail(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-thumbnail", {
        body: { title: formData.title },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setFormData((prev) => ({ ...prev, image_url: data.imageUrl }));
      toast.success("Capa gerada com sucesso!");
    } catch (err) {
      console.error("Thumbnail generation error:", err);
      toast.error(err instanceof Error ? err.message : "Erro ao gerar capa");
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      video: "bg-blue-500/80",
      feed: "bg-green-500/80",
      story: "bg-purple-500/80",
      seasonal: "bg-orange-500/80",
      "weekly-story": "bg-pink-500/80",
      resource: "bg-yellow-500/80",
      download: "bg-cyan-500/80",
    };
    return colors[type] || "bg-muted";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Conteúdos</h1>
          <p className="text-muted-foreground">
            {contentItems?.length || 0} conteúdos cadastrados
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {contentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Ícone</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="w-20">Novo</TableHead>
                <TableHead className="w-20">Ativo</TableHead>
                <TableHead className="w-32 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.id} className={!item.is_active ? "opacity-50" : ""}>
                  <TableCell className="text-xl">{item.icon}</TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <Badge className={`${getTypeBadge(item.type)} text-white`}>
                      {contentTypes.find((t) => t.value === item.type)?.label || item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.category ? (
                      <Badge variant="outline">
                        {categories.find((c) => c.value === item.category)?.label || item.category}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.is_new && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Novo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? "default" : "destructive"}>
                      {item.is_active ? "Sim" : "Não"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(item.url, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteConfirmId(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Conteúdo" : "Novo Conteúdo"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Maldivas"
              />
            </div>

            <div className="space-y-2">
              <Label>URL do Canva *</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://www.canva.com/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ícone (emoji)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🎬"
                />
              </div>

              <div className="space-y-2">
                <Label>Ordem de exibição</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição opcional..."
                rows={2}
              />
            </div>

            {/* AI Magic Thumbnail Generator */}
            <div className="space-y-2">
              <Label>Imagem de Capa</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://... ou gere com IA"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateThumbnail}
                  disabled={isGeneratingThumbnail || !formData.title.trim()}
                  className="shrink-0 gap-2"
                >
                  {isGeneratingThumbnail ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isGeneratingThumbnail ? "Gerando..." : "Gerar com IA"}
                </Button>
              </div>
              
              {/* Image Preview */}
              {formData.image_url && (
                <div className="mt-2 rounded-lg overflow-hidden border bg-muted/50">
                  <img 
                    src={formData.image_url} 
                    alt="Preview da capa" 
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Dica: A IA gera capas com base no título. Você pode editar a URL manualmente se preferir.
              </p>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_new}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                />
                <Label>Marcar como novo</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Ativo</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingItem ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja desativar este conteúdo?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
