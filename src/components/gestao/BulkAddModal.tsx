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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BulkItem {
  title: string;
  url: string;
}

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: { title: string; url: string; type: string; category: string | null; icon: string }[]) => Promise<void>;
  isSaving?: boolean;
}

const contentTypes = [
  { value: "video", label: "Vídeo Reel", icon: "🎬" },
  { value: "seasonal", label: "Sazonal", icon: "📅" },
  { value: "feed", label: "Arte Feed", icon: "🖼️" },
  { value: "story", label: "Story", icon: "📱" },
  { value: "weekly-story", label: "Story Semanal", icon: "📱" },
  { value: "resource", label: "Recurso", icon: "📥" },
  { value: "download", label: "Download", icon: "📥" },
];

const categories = [
  { value: "nacional", label: "Nacional" },
  { value: "internacional", label: "Internacional" },
  { value: "influencer-eva", label: "Influencer Eva" },
  { value: "influencer-mel", label: "Influencer Mel" },
  { value: "influencer-bia", label: "Influencer Bia" },
];

const initialItems = (): BulkItem[] => [
  { title: "", url: "" },
  { title: "", url: "" },
  { title: "", url: "" },
  { title: "", url: "" },
  { title: "", url: "" },
];

export const BulkAddModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
}: BulkAddModalProps) => {
  const [items, setItems] = useState<BulkItem[]>(initialItems);
  const [type, setType] = useState("video");
  const [category, setCategory] = useState<string | null>(null);

  const selectedType = contentTypes.find(t => t.value === type);
  const icon = selectedType?.icon || "🎬";

  const validItems = items.filter(i => i.title.trim() && i.url.trim());

  const handleItemChange = (index: number, field: keyof BulkItem, value: string) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddRows = () => {
    setItems(prev => [...prev, ...initialItems()]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (validItems.length === 0) return;

    const itemsToSave = validItems.map(item => ({
      title: item.title.trim(),
      url: item.url.trim(),
      type,
      category,
      icon,
    }));

    await onSave(itemsToSave);
    
    // Reset form
    setItems(initialItems());
    setType("video");
    setCategory(null);
  };

  const handleClose = () => {
    setItems(initialItems());
    setType("video");
    setCategory(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Adicionar em Massa</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="grid gap-2">
            <Label>Tipo de Conteúdo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
        </div>

        <div className="border rounded-lg">
          <div className="grid grid-cols-[1fr_1fr_40px] gap-2 p-3 bg-muted/50 border-b font-medium text-sm">
            <span>Título</span>
            <span>URL</span>
            <span></span>
          </div>
          
          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_40px] gap-2 items-center">
                  <Input
                    placeholder="Nome do conteúdo..."
                    value={item.title}
                    onChange={(e) => handleItemChange(index, "title", e.target.value)}
                  />
                  <Input
                    placeholder="https://canva.com/..."
                    value={item.url}
                    onChange={(e) => handleItemChange(index, "url", e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRow(index)}
                    disabled={items.length <= 1}
                    className="h-9 w-9"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Button variant="outline" onClick={handleAddRows} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Adicionar mais 5 linhas
        </Button>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {validItems.length} item(s) válido(s)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={validItems.length === 0 || isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Importar {validItems.length} item(s)
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
