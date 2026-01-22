import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentItem } from "@/hooks/useContent";

interface SelectFeaturedModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableVideos: ContentItem[];
  onSelect: (id: string) => void;
}

export const SelectFeaturedModal = ({
  isOpen,
  onClose,
  availableVideos,
  onSelect,
}: SelectFeaturedModalProps) => {
  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecionar Vídeo para Destaque</DialogTitle>
          <DialogDescription>
            Escolha um vídeo para aparecer na seção de destaques com imagem personalizada.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {availableVideos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum vídeo disponível para destaque.</p>
              <p className="text-sm mt-1">Todos os vídeos já estão em destaque ou não há vídeos cadastrados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-1">
              {availableVideos.map((video) => (
                <Button
                  key={video.id}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-start justify-start text-left"
                  onClick={() => handleSelect(video.id)}
                >
                  <span className="text-2xl mb-1">{video.icon}</span>
                  <span className="text-sm font-medium truncate w-full">
                    {video.title}
                  </span>
                  {video.category && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {video.category}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
