import { useState, useEffect } from "react";
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

interface EditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    title: string;
    url: string;
    is_active?: boolean;
  } | null;
  onSave: (id: string, data: { title: string; url: string; is_active: boolean }) => void;
  isSaving?: boolean;
}

export const EditModal = ({ 
  open, 
  onOpenChange, 
  item, 
  onSave,
  isSaving = false 
}: EditModalProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setUrl(item.url);
      setIsActive(item.is_active ?? true);
    }
  }, [item]);

  const handleSave = () => {
    if (item) {
      onSave(item.id, { title, url, is_active: isActive });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do item"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL / Link</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Ativo</Label>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
