import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Pencil, X, ImagePlus } from "lucide-react";
import { ContentItem } from "@/hooks/useContent";

type EditableItem = {
  id: string;
  title: string;
  url: string;
  is_active?: boolean;
};

interface FeaturedCardProps {
  item: ContentItem;
  onUploadImage: (id: string, file: File) => void;
  onRemoveFromFeatured: (id: string) => void;
  onEdit: (item: EditableItem) => void;
}

export const FeaturedCard = ({ 
  item, 
  onUploadImage, 
  onRemoveFromFeatured, 
  onEdit 
}: FeaturedCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(item.id, file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="relative overflow-hidden group">
      {/* Image or Placeholder */}
      <div className="aspect-[9/16] relative">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40 flex items-center justify-center">
            <ImagePlus className="h-12 w-12 text-amber-400" />
          </div>
        )}
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            {item.image_url ? "Trocar" : "Upload"}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit({
              id: item.id,
              title: item.title,
              url: item.url,
              is_active: item.is_active,
            })}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => onRemoveFromFeatured(item.id)}
          >
            <X className="h-4 w-4 mr-1" />
            Remover
          </Button>
        </div>
        
        {/* Hidden file input for upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      
      {/* Title */}
      <div className="p-2 bg-card">
        <p className="text-sm font-medium truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground truncate">{item.icon}</p>
      </div>
    </Card>
  );
};
