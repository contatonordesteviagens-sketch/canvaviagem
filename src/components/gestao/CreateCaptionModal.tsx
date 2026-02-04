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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CreateCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    destination: string;
    text: string;
    hashtags: string;
    category: "nacional" | "internacional" | null;
    is_active: boolean;
  }) => Promise<void>;
  isSaving?: boolean;
}

export const CreateCaptionModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
}: CreateCaptionModalProps) => {
  const [destination, setDestination] = useState("");
  const [text, setText] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [category, setCategory] = useState<"nacional" | "internacional" | null>("nacional");
  const [isActive, setIsActive] = useState(true);

  const handleSave = async () => {
    if (!destination.trim() || !text.trim()) return;

    await onSave({
      destination: destination.trim(),
      text: text.trim(),
      hashtags: hashtags.trim(),
      category,
      is_active: isActive,
    });

    // Reset form
    setDestination("");
    setText("");
    setHashtags("");
    setCategory("nacional");
    setIsActive(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Legenda</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="destination">Destino *</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ex: Maldivas, Gramado, Paris..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="text">Texto da Legenda *</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreva a legenda completa..."
              className="min-h-[120px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#Viagem #Turismo #Destino"
            />
          </div>

          <div className="grid gap-2">
            <Label>Categoria</Label>
            <Select
              value={category || ""}
              onValueChange={(v) => setCategory(v as "nacional" | "internacional" | null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nacional">Nacional</SelectItem>
                <SelectItem value="internacional">Internacional</SelectItem>
              </SelectContent>
            </Select>
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
          <Button
            onClick={handleSave}
            disabled={!destination.trim() || !text.trim() || isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
