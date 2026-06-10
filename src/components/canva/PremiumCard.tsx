import { memo } from "react";
import { ExternalLink, Heart, Crown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface PremiumCardProps {
  id?: string;
  title: string;
  url: string;
  driveUrl?: string | null;
  imageUrl?: string;
  category?: string;
  isNew?: boolean;
  isPremium?: boolean;
  aspectRatio?: "9/16" | "4/5" | "1/1" | "16/10";
  variant?: "image" | "icon";
  icon?: string;
  contentType?: string; // 'video' | 'feed' | 'story' | 'weekly-story' | 'resource' | etc.
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPremiumRequired?: () => void;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}

// Color per content type
const getTypeGradient = (contentType?: string, title?: string) => {
  if (contentType === 'feed') {
    // Arts: pink/rosa
    return "from-pink-400 to-rose-500";
  }
  if (contentType === 'story' || contentType === 'weekly-story') {
    // Stories: orange/laranja
    return "from-orange-400 to-amber-500";
  }
  if (contentType === 'video' || contentType === 'seasonal') {
    // Videos: purple/violet
    return "from-violet-500 to-purple-600";
  }
  if (contentType === 'resource') {
    // Downloads: blue
    return "from-blue-400 to-cyan-500";
  }
  // Fallback: vary by title length
  const gradients = [
    "from-purple-400 to-pink-500",
    "from-blue-400 to-cyan-500",
    "from-orange-400 to-red-500",
    "from-green-400 to-teal-500",
    "from-indigo-400 to-purple-500",
    "from-pink-400 to-rose-500",
  ];
  const index = (title?.length || 0) % gradients.length;
  return gradients[index];
};

const PremiumCardComponent = ({
  id,
  title,
  url,
  imageUrl,
  category,
  isNew,
  isPremium,
  aspectRatio = "9/16",
  variant = "icon",
  icon = "📱",
  contentType,
  onClick,
  isFavorite = false,
  onToggleFavorite,
  onPremiumRequired,
  loading = "lazy",
  fetchPriority = "auto",
  driveUrl
}: PremiumCardProps) => {
  const gradient = getTypeGradient(contentType, title);
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (onPremiumRequired) {
      e.preventDefault();
      onPremiumRequired();
      return;
    }
    
    if (url.startsWith("/")) {
      e.preventDefault();
      if (onClick) onClick();
      navigate(url);
      return;
    }

    if (onClick) onClick();
    // Comportamento padrão de link (target="_blank") fará o trabalho
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite();
  };

  const isRelative = url.startsWith("/");

  return (
    <a
      href={url}
      target={isRelative ? undefined : "_blank"}
      rel={isRelative ? undefined : "noopener noreferrer"}
      className="group block relative"
      onClick={handleClick}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border-none transition-all duration-300",
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

        {/* Premium Badge (Crown) - bottom right */}
        {isPremium && (
          <div className="absolute bottom-14 md:bottom-[72px] right-2 md:right-3 z-30 p-1.5 rounded-full bg-gray-800/50 backdrop-blur-sm shadow-md transition-all duration-300">
            <Crown className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400 fill-amber-400" />
          </div>
        )}

        {/* Image or Colored Placeholder */}
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={title}
              loading={loading}
              fetchPriority={fetchPriority}
              decoding="async"
              className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          <div className={cn(
            "w-full h-full bg-gradient-to-br flex flex-col items-center justify-center p-3 md:p-4",
            gradient
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

          {/* CTA Button */}
          <div className="flex gap-2">
            <button className="flex-1 bg-white/95 backdrop-blur-sm text-foreground font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-sm transition-all duration-300 hover:bg-white active:scale-95 shadow-sm">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            {driveUrl && (
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(driveUrl, '_blank'); }} 
                className="flex-1 bg-primary text-primary-foreground font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-sm transition-all duration-300 hover:brightness-110 active:scale-95 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};

export const PremiumCard = memo(PremiumCardComponent);
