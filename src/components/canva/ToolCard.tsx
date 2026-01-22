import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  url: string;
  icon?: string;
  description?: string;
  isNew?: boolean;
  onClick?: () => void;
}

export const ToolCard = ({ title, url, icon = "🤖", description, isNew, onClick }: ToolCardProps) => {
  // Generate gradient based on title
  const getGradient = () => {
    const gradients = [
      "from-blue-100 to-blue-50",
      "from-purple-100 to-purple-50",
      "from-cyan-100 to-cyan-50",
      "from-pink-100 to-pink-50",
      "from-indigo-100 to-indigo-50",
    ];
    const index = title.length % gradients.length;
    return gradients[index];
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      onClick={handleClick}
    >
      <article className="flex flex-col cursor-pointer">
        {/* Image container */}
        <div className={cn(
          "relative w-full rounded-2xl overflow-hidden mb-3 shadow-canva transition-all duration-300 group-hover:shadow-canva-hover",
          "aspect-[16/10]"
        )}>
          {/* Badge NEW */}
          {isNew && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
              Novo
            </span>
          )}
          
          {/* Gradient background with icon */}
          <div className={cn(
            "w-full h-full bg-gradient-to-br flex items-center justify-center transition-transform duration-300 group-hover:scale-105",
            getGradient()
          )}>
            <span className="text-5xl">{icon}</span>
          </div>
        </div>
        
        {/* Text content */}
        <h4 className="font-bold text-foreground leading-tight mb-1 text-base group-hover:text-primary transition-colors">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
            {description}
          </p>
        )}
      </article>
    </a>
  );
};
