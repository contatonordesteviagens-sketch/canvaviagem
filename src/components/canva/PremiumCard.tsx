import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  title: string;
  url: string;
  imageUrl?: string;
  category?: string;
  isNew?: boolean;
  aspectRatio?: "9/16" | "4/5" | "1/1" | "16/10";
  variant?: "image" | "icon";
  icon?: string;
}

export const PremiumCard = ({ 
  title, 
  url, 
  imageUrl,
  category,
  isNew, 
  aspectRatio = "9/16",
  variant = "icon",
  icon = "📱"
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

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group block relative"
    >
      <div 
        className={cn(
          "relative overflow-hidden rounded-2xl border-none transition-all duration-300",
          "shadow-canva hover:shadow-canva-hover",
          "hover:scale-[1.02] active:scale-[0.98]",
        )}
        style={{ aspectRatio }}
      >
        {/* Badge NEW */}
        {isNew && (
          <span className="absolute top-3 right-3 z-20 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-md">
            Novo
          </span>
        )}
        
        {/* Category Badge */}
        {category && (
          <span className="absolute top-3 left-3 z-20 bg-primary/90 text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
            {category}
          </span>
        )}
        
        {/* Image or Placeholder */}
        {variant === "image" && imageUrl ? (
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
            "w-full h-full bg-gradient-to-br flex flex-col items-center justify-center p-4",
            getPlaceholderGradient()
          )}>
            <span className="text-4xl md:text-5xl mb-2">{icon}</span>
          </div>
        )}
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {/* Title */}
          <h3 className="text-white font-bold text-lg mb-3 drop-shadow-lg line-clamp-2">
            {title}
          </h3>
          
          {/* CTA Button */}
          <button className="w-full bg-white text-foreground font-medium py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white/90 active:scale-95 shadow-md min-h-[44px]">
            <ExternalLink className="w-4 h-4" />
            <span>Editar no Canva</span>
          </button>
        </div>
      </div>
    </a>
  );
};
