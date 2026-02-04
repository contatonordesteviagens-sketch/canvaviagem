import { Pencil, ExternalLink, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EditableCardProps {
  id: string;
  title: string;
  url: string;
  icon?: string;
  description?: string | null;
  hasCaption?: boolean;
  isActive?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  onToggleFeatured?: (id: string) => void;
  onEdit: (item: { id: string; title: string; url: string; description?: string | null; is_active?: boolean }) => void;
  onDelete?: (id: string, title: string) => void;
}

export const EditableCard = ({
  id,
  title,
  url,
  icon = "📄",
  description,
  hasCaption = false,
  isActive = true,
  isNew = false,
  isFeatured = false,
  onToggleFeatured,
  onEdit,
  onDelete,
}: EditableCardProps) => {
  const truncatedUrl = url.length > 40 ? url.substring(0, 40) + "..." : url;

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl border bg-card transition-all",
        isActive ? "border-border" : "border-destructive/30 bg-destructive/5 opacity-60"
      )}
    >
      {/* Featured star button - top left */}
      {onToggleFeatured && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFeatured(id);
          }}
          className={cn(
            "absolute top-2 left-2 p-1.5 rounded-full transition-all z-10",
            isFeatured 
              ? "bg-amber-500 text-white shadow-md" 
              : "bg-muted text-muted-foreground hover:bg-amber-100 hover:text-amber-600"
          )}
          title={isFeatured ? "Remover destaque" : "Marcar como destaque"}
        >
          <Star className={cn("h-4 w-4", isFeatured && "fill-current")} />
        </button>
      )}

      {/* Status badges */}
      <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-[120px] justify-end">
        {isNew && (
          <Badge variant="secondary" className="text-xs">
            Novo
          </Badge>
        )}
        {!isActive && (
          <Badge variant="destructive" className="text-xs">
            Inativo
          </Badge>
        )}
        {hasCaption ? (
          <Badge variant="outline" className="text-xs border-green-500 text-green-600 bg-green-50">
            📝 Legenda
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 bg-amber-50">
            Sem legenda
          </Badge>
        )}
      </div>

      {/* Icon and title */}
      <div className={cn("flex items-start gap-3 mb-3 pr-16", onToggleFeatured && "pl-8")}>
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{title}</h3>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
          >
            {truncatedUrl}
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => onEdit({ id, title, url, description, is_active: isActive })}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
        {onDelete && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(id, title)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
