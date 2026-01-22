import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CaptionCardProps {
  destination: string;
  text: string;
  hashtags: string;
}

export const CaptionCard = ({ destination, text, hashtags }: CaptionCardProps) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${text}\n\n${hashtags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="bg-card rounded-2xl shadow-canva hover:shadow-canva-hover transition-all duration-300 overflow-hidden border-none p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
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
