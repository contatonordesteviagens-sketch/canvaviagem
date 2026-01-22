import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SortableCardProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
}

export const SortableCard = ({ id, children, disabled = false }: SortableCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50"
      )}
    >
      {!disabled && (
        <button
          className={cn(
            "absolute -left-2 top-1/2 -translate-y-1/2 z-10",
            "p-1 rounded bg-muted opacity-0 group-hover:opacity-100",
            "cursor-grab active:cursor-grabbing transition-opacity",
            "hover:bg-accent"
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      {children}
    </div>
  );
};
