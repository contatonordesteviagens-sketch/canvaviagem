import { Copy, Check, Heart, Megaphone, Crown, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { useState, memo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface OfferCardProps {
    id?: string;
    title: string;
    text: string;
    fullText?: string;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
    onPremiumRequired?: () => void;
    isPremium?: boolean;
    onSaveEdit?: (newText: string) => void;
}

const OfferCardComponent = ({
    id,
    title,
    text,
    fullText,
    isFavorite = false,
    onToggleFavorite,
    onPremiumRequired,
    isPremium = false,
    onSaveEdit
}: OfferCardProps) => {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editedText, setEditedText] = useState(fullText || text);

    const handleCopy = async () => {
        if (onPremiumRequired && isPremium) {
            onPremiumRequired();
            return;
        }
        const textToCopy = expanded ? (fullText || text) : text;
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExpand = () => {
        if (isPremium && onPremiumRequired) {
            onPremiumRequired();
            return;
        }
        setExpanded(!expanded);
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onToggleFavorite) {
            onToggleFavorite();
        }
    };

    const handleSaveEdit = () => {
        if (onSaveEdit) {
            onSaveEdit(editedText);
        }
        if (onToggleFavorite && !isFavorite) {
            onToggleFavorite();
        }
        setShowEditModal(false);
    };

    const handleOpenEdit = () => {
        if (isPremium && onPremiumRequired) {
            onPremiumRequired();
            return;
        }
        setEditedText(fullText || text);
        setShowEditModal(true);
    };

    // Extract icon from title (first emoji)
    const iconMatch = title.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
    const icon = iconMatch ? iconMatch[0] : '📢';
    const cleanTitle = title.replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u, '');

    return (
        <>
            <div className="bg-card rounded-2xl shadow-canva hover:shadow-canva-hover transition-all duration-300 overflow-hidden border border-border/40 p-4 md:p-5 space-y-3 relative group">
                {/* Premium Crown */}
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

                {/* Header - clickable to expand */}
                <button onClick={handleExpand} className="pt-1 flex items-center gap-3 w-full text-left pr-8">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 text-lg">
                        {icon}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-foreground leading-tight flex-1">{cleanTitle}</h3>
                    {expanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                </button>

                {/* Text Box */}
                <div className="bg-gradient-to-br from-secondary/50 to-secondary/20 rounded-xl p-4 border border-border/50 relative overflow-hidden group-hover:border-primary/20 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/30" />
                    <p className={cn(
                        "text-sm text-foreground/90 whitespace-pre-line leading-relaxed font-medium pl-2",
                        !expanded && "line-clamp-3"
                    )}>
                        {expanded ? (fullText || text) : text}
                    </p>
                    {expanded && (fullText || text).length > 100 && (
                        <div className="mt-3 flex justify-end">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">Texto Validado</span>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleCopy}
                        variant={copied ? "default" : "secondary"}
                        size="sm"
                        className={cn(
                            "flex-1 rounded-full font-semibold gap-1.5 transition-all duration-300 text-xs md:text-sm",
                            copied ? "bg-green-600 hover:bg-green-700 text-white" : "hover:bg-primary/10 hover:text-primary"
                        )}
                    >
                        {copied ? (
                            <><Check className="w-3.5 h-3.5" /><span>Copiado!</span></>
                        ) : (
                            <><Copy className="w-3.5 h-3.5" /><span>Copiar</span></>
                        )}
                    </Button>
                    {(fullText || expanded) && (
                        <Button
                            onClick={handleOpenEdit}
                            variant="outline"
                            size="sm"
                            className="rounded-full font-semibold gap-1.5 text-xs md:text-sm"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Editar</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="w-4 h-4" />
                            Editar Texto
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="min-h-[200px] text-sm leading-relaxed"
                            placeholder="Edite o texto aqui..."
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={async () => {
                                    await navigator.clipboard.writeText(editedText);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                variant="secondary"
                                className="flex-1 gap-2"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copiado!' : 'Copiar'}
                            </Button>
                            <Button
                                onClick={handleSaveEdit}
                                className="flex-1 gap-2"
                            >
                                <Heart className="w-4 h-4" />
                                Salvar nos Favoritos
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const OfferCard = memo(OfferCardComponent);
