import { Copy, Check, Heart, Megaphone, Crown } from "lucide-react";
import { useState, memo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OfferCardProps {
    id?: string;
    title: string;
    text: string;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
    onPremiumRequired?: () => void;
    isPremium?: boolean;
}

const OfferCardComponent = ({
    id,
    title,
    text,
    isFavorite = false,
    onToggleFavorite,
    onPremiumRequired,
    isPremium = false
}: OfferCardProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (onPremiumRequired && isPremium) {
            onPremiumRequired();
            return;
        }
        await navigator.clipboard.writeText(text);
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
        <div className="bg-card rounded-2xl shadow-canva hover:shadow-canva-hover transition-all duration-300 overflow-hidden border border-border/40 p-5 space-y-4 relative group">
            {/* Premium Crown - bottom right */}
            {isPremium && (
                <div className="absolute bottom-3 right-3 p-1.5 rounded-full bg-gray-800/50 backdrop-blur-sm shadow-md z-10">
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>
            )}

            {/* Favorite Button */}
            {onToggleFavorite && (
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-secondary/50 backdrop-blur-sm transition-all hover:bg-secondary"
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
            <div className="pt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Megaphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground leading-tight">{title}</h3>
            </div>

            {/* Text Box */}
            <div className="bg-gradient-to-br from-secondary/50 to-secondary/20 rounded-xl p-5 border border-border/50 relative overflow-hidden group-hover:border-primary/20 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/30" />
                <p className="text-sm md:text-base text-foreground/90 whitespace-pre-line line-clamp-[10] leading-relaxed font-medium">
                    {text}
                </p>
                <div className="mt-4 flex justify-end">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">Texto Validado</span>
                </div>
            </div>

            {/* Copy button */}
            <Button
                onClick={handleCopy}
                variant={copied ? "default" : "secondary"}
                className={cn(
                    "w-full rounded-full font-semibold gap-2 transition-all duration-300",
                    copied ? "bg-green-600 hover:bg-green-700 text-white" : "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                )}
            >
                {copied ? (
                    <>
                        <Check className="w-4 h-4" />
                        <span>Texto Copiado!</span>
                    </>
                ) : (
                    <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Oferta</span>
                    </>
                )}
            </Button>
        </div>
    );
};

export const OfferCard = memo(OfferCardComponent);
