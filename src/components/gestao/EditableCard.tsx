import { Pencil, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EditableCardProps {
  id: string;
  title: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  isNew?: boolean;
  onEdit: (item: { id: string; title: string; url: string; is_active?: boolean }) => void;
}

export const EditableCard = ({
  id,
  title,
  url,
  icon = "📄",
  isActive = true,
  isNew = false,
  onEdit,
}: EditableCardProps) => {
  const truncatedUrl = url.length > 40 ? url.substring(0, 40) + "..." : url;

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl border bg-card transition-all",
        isActive ? "border-border" : "border-destructive/30 bg-destructive/5 opacity-60"
      )}
    >
      {/* Status badges */}
      <div className="absolute top-2 right-2 flex gap-1">
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
      </div>

      {/* Icon and title */}
      <div className="flex items-start gap-3 mb-3 pr-16">
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

      {/* Edit button */}
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => onEdit({ id, title, url, is_active: isActive })}
      >
        <Pencil className="h-4 w-4 mr-2" />
        Editar
      </Button>
    </div>
  );
};
