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
        isDragging && "opacity-50 z-50 shadow-lg"
      )}
    >
      {!disabled && (
        <button
          className={cn(
            "absolute left-2 top-2 z-50",
            "p-3 rounded-lg bg-black/80 backdrop-blur-sm",
            "opacity-100",
            "cursor-grab active:cursor-grabbing transition-all",
            "hover:bg-black/90 touch-none",
            "shadow-lg border border-white/20"
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-white" />
        </button>
      )}
      {children}
    </div>
  );
};
