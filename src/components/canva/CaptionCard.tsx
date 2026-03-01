import { Copy, Check, Heart, Crown } from "lucide-react";
import { useState, memo } from "react";
import { cn } from "@/lib/utils";

interface CaptionCardProps {
  id?: string;
  destination: string;
  text: string;
  hashtags: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPremiumRequired?: () => void;
  isPremium?: boolean;
}

const CaptionCardComponent = ({
  id,
  destination,
  text,
  hashtags,
  isFavorite = false,
  onToggleFavorite,
  onPremiumRequired,
  isPremium = false
}: CaptionCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Check if premium gate should be triggered
    if (onPremiumRequired) {
      onPremiumRequired();
      return;
    }
    await navigator.clipboard.writeText(`${text}\n\n${hashtags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-canva hover:shadow-canva-hover transition-all duration-300 overflow-hidden border-none p-5 space-y-4 relative group">
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg z-10 flex items-center gap-1">
          <Crown className="w-3 h-3 fill-white" />
          <span>Premium</span>
        </div>
      )}
      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-secondary transition-all hover:bg-secondary/80"
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
            )}
          />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pr-8">
        <h3 className="text-lg font-bold text-primary">{destination}</h3>
        <span className="text-2xl">✍️</span>
      </div>

      {/* Caption preview */}
      <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-4 leading-relaxed">
        {text}
      </p>

      {/* Hashtags */}
      <p className="text-xs text-accent font-medium truncate">
        {hashtags}
      </p>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={cn(
          "w-full py-3 px-4 rounded-full font-medium flex items-center justify-center gap-2 transition-all duration-300 min-h-[44px]",
          copied
            ? "bg-green-500 text-white"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            <span>Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copiar Legenda</span>
          </>
        )}
      </button>
    </div>
  );
};
export const CaptionCard = memo(CaptionCardComponent);
