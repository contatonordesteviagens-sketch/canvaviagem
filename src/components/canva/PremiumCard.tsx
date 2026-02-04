import { ExternalLink, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  id?: string;
  title: string;
  url: string;
  imageUrl?: string;
  category?: string;
  isNew?: boolean;
  aspectRatio?: "9/16" | "4/5" | "1/1" | "16/10";
  variant?: "image" | "icon";
  icon?: string;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPremiumRequired?: () => void;
}

export const PremiumCard = ({ 
  id,
  title, 
  url, 
  imageUrl,
  category,
  isNew, 
  aspectRatio = "9/16",
  variant = "icon",
  icon = "📱",
  onClick,
  isFavorite = false,
  onToggleFavorite,
  onPremiumRequired
}: PremiumCardProps) => {
  // Generate a placeholder gradient based on title
  const getPlaceholderGradient = () => {
    const gradients = [
      "from-purple-400 to-pink-500",
      "from-blue-400 to-cyan-500",
      "from-orange-400 to-red-500",
      "from-green-400 to-teal-500",
      "from-indigo-400 to-purple-500",
      "from-pink-400 to-rose-500",
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
    // Reutiliza a mesma aba externa para templates do Canva
    window.open(url, 'canva-editor');
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
      className="group block relative"
      onClick={handleClick}
    >
      <div 
        className={cn(
          "relative overflow-hidden rounded-2xl border-none transition-all duration-300",
          "shadow-canva hover:shadow-canva-hover",
          "hover:scale-[1.02] active:scale-[0.98]",
        )}
        style={{ aspectRatio }}
      >
        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 md:top-3 right-2 md:right-3 z-30 p-1.5 md:p-2 rounded-full bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50"
          >
            <Heart 
              className={cn(
                "w-4 h-4 md:w-5 md:h-5 transition-colors",
                isFavorite ? "fill-red-500 text-red-500" : "text-white"
              )}
            />
          </button>
        )}

        {/* Badge NEW */}
        {isNew && (
          <span className={cn(
            "absolute top-2 md:top-3 z-20 bg-orange-500 text-white text-[9px] md:text-[10px] font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-full uppercase tracking-wide shadow-md",
            onToggleFavorite ? "left-2 md:left-3" : "right-2 md:right-3"
          )}>
            Novo
          </span>
        )}
        
        {/* Category Badge */}
        {category && !isNew && (
          <span className="absolute top-2 md:top-3 left-2 md:left-3 z-20 bg-primary/90 text-primary-foreground text-[10px] md:text-xs font-medium px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm">
            {category}
          </span>
        )}
        
        {/* Image or Placeholder */}
        {imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          <div className={cn(
            "w-full h-full bg-gradient-to-br flex flex-col items-center justify-center p-3 md:p-4",
            getPlaceholderGradient()
          )}>
            <span className="text-3xl md:text-5xl mb-2">{icon}</span>
          </div>
        )}
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-10">
          {/* Title */}
          <h3 className="text-white font-bold text-base md:text-lg mb-2 md:mb-3 drop-shadow-lg line-clamp-2">
            {title}
          </h3>
          
          {/* CTA Button - Compacto e elegante */}
          <button className="w-full bg-white/95 backdrop-blur-sm text-foreground font-medium py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-sm transition-all duration-300 hover:bg-white active:scale-95 shadow-sm">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
        </div>
      </div>
    </a>
  );
};
