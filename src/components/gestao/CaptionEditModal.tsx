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
import { Textarea } from "@/components/ui/textarea";

interface CaptionEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    destination: string;
    text: string;
    hashtags: string;
    is_active?: boolean;
  } | null;
  onSave: (id: string, data: { destination: string; text: string; hashtags: string; is_active: boolean }) => void;
  isSaving?: boolean;
}

export const CaptionEditModal = ({ 
  open, 
  onOpenChange, 
  item, 
  onSave,
  isSaving = false 
}: CaptionEditModalProps) => {
  const [destination, setDestination] = useState("");
  const [text, setText] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (item) {
      setDestination(item.destination);
      setText(item.text);
      setHashtags(item.hashtags);
      setIsActive(item.is_active ?? true);
    }
  }, [item]);

  const handleSave = () => {
    if (item) {
      onSave(item.id, { destination, text, hashtags, is_active: isActive });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Legenda</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Destino</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Nome do destino"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text">Texto da Legenda</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Texto da legenda..."
              rows={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Textarea
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#hashtag1 #hashtag2"
              rows={3}
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
