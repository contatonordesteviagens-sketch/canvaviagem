import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    url: string;
    type: string;
    category: string | null;
    icon: string;
    is_new: boolean;
    is_active: boolean;
  }) => Promise<void>;
  isSaving?: boolean;
  itemType?: "content" | "tool";
}

const contentTypes = [
  { value: "video", label: "Vídeo Reel" },
  { value: "seasonal", label: "Sazonal" },
  { value: "feed", label: "Arte Feed" },
  { value: "story", label: "Story" },
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

const icons = [
  { value: "🎬", label: "🎬 Vídeo" },
  { value: "🖼️", label: "🖼️ Imagem" },
  { value: "📱", label: "📱 Story" },
  { value: "📅", label: "📅 Calendário" },
  { value: "📥", label: "📥 Download" },
  { value: "🤖", label: "🤖 IA" },
  { value: "✨", label: "✨ Destaque" },
  { value: "🎯", label: "🎯 Marketing" },
];

export const CreateItemModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  itemType = "content",
}: CreateItemModalProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("video");
  const [category, setCategory] = useState<string | null>(null);
  const [icon, setIcon] = useState("🎬");
  const [isNew, setIsNew] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const handleSave = async () => {
    if (!title.trim() || !url.trim()) return;

    await onSave({
      title: title.trim(),
      url: url.trim(),
      type: itemType === "tool" ? "tool" : type,
      category,
      icon,
      is_new: isNew,
      is_active: isActive,
    });

    // Reset form
    setTitle("");
    setUrl("");
    setType("video");
    setCategory(null);
    setIcon("🎬");
    setIsNew(false);
    setIsActive(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {itemType === "tool" ? "Nova Ferramenta" : "Novo Conteúdo"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do item..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {itemType === "content" && (
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Categoria (opcional)</Label>
            <Select value={category || ""} onValueChange={(v) => setCategory(v || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Ícone</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {icons.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_new">Marcar como Novo</Label>
            <Switch id="is_new" checked={isNew} onCheckedChange={setIsNew} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Ativo</Label>
            <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !url.trim() || isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
