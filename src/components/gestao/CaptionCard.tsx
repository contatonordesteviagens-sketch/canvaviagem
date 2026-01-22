import { Pencil, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CaptionCardProps {
  id: string;
  destination: string;
  text: string;
  hashtags: string;
  isActive?: boolean;
  onEdit: (item: { id: string; destination: string; text: string; hashtags: string; is_active?: boolean }) => void;
  onDelete?: (id: string, title: string) => void;
}

export const CaptionCard = ({
  id,
  destination,
  text,
  hashtags,
  isActive = true,
  onEdit,
  onDelete,
}: CaptionCardProps) => {
  const truncatedText = text.length > 100 ? text.substring(0, 100) + "..." : text;

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl border bg-card transition-all",
        isActive ? "border-border" : "border-destructive/30 bg-destructive/5 opacity-60"
      )}
    >
      {/* Status badge */}
      {!isActive && (
        <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
          Inativo
        </Badge>
      )}

      {/* Destination */}
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-primary" />
        <h3 className="font-medium text-foreground">{destination}</h3>
      </div>

      {/* Text preview */}
      <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
        {truncatedText}
      </p>

      {/* Hashtags preview */}
      <p className="text-xs text-primary/70 mb-3 truncate">
        {hashtags.substring(0, 50)}...
      </p>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => onEdit({ id, destination, text, hashtags, is_active: isActive })}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
        {onDelete && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(id, destination)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
