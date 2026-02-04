import { ExternalLink, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  id?: string;
  title: string;
  url: string;
  icon?: string;
  description?: string;
  isNew?: boolean;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPremiumRequired?: () => void;
}

export const ToolCard = ({ 
  id, 
  title, 
  url, 
  icon = "🤖", 
  description, 
  isNew, 
  onClick,
  isFavorite = false,
  onToggleFavorite,
  onPremiumRequired
}: ToolCardProps) => {
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
    e.preventDefault();
    // Check if premium gate should be triggered
    if (onPremiumRequired) {
      onPremiumRequired();
      return;
    }
    if (onClick) {
      onClick();
    }
    // Reutiliza a mesma aba externa para ferramentas
    window.open(url, 'canva-tools');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  return (
    <a
      href={url}
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
          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50"
            >
              <Heart 
                className={cn(
                  "w-4 h-4 transition-colors",
                  isFavorite ? "fill-red-500 text-red-500" : "text-white"
                )}
              />
            </button>
          )}

          {/* Badge NEW */}
          {isNew && (
            <span className={cn(
              "absolute top-2 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm",
              onToggleFavorite ? "left-2" : "right-2"
            )}>
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
