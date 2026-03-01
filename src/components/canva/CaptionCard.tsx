import { Copy, Check, Heart, Crown, ChevronDown, ChevronUp, Pencil, Save, X } from "lucide-react";
import { useState, memo } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CaptionCardProps {
  id?: string;
  destination: string;
  text: string;
  hashtags: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPremiumRequired?: () => void;
  isPremium?: boolean;
  onSaveEdit?: (newText: string, newHashtags: string) => void;
}

const CaptionCardComponent = ({
  id,
  destination,
  text,
  hashtags,
  isFavorite = false,
  onToggleFavorite,
  onPremiumRequired,
  isPremium = false,
  onSaveEdit,
}: CaptionCardProps) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editText, setEditText] = useState(text);
  const [editHashtags, setEditHashtags] = useState(hashtags);

  const handleCopy = async () => {
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
    if (onToggleFavorite) onToggleFavorite();
  };

  const handleOpenFullText = () => {
    if (isPremium && onPremiumRequired) {
      onPremiumRequired();
      return;
    }
    setShowEditModal(true);
    setEditText(text);
    setEditHashtags(hashtags);
  };

  const handleSaveEdit = () => {
    if (onSaveEdit) onSaveEdit(editText, editHashtags);
    if (onToggleFavorite && !isFavorite) onToggleFavorite(); // auto-favorite on edit
    setShowEditModal(false);
  };

  return (
    <>
      <div className="bg-card rounded-2xl shadow-canva hover:shadow-canva-hover transition-all duration-300 overflow-hidden border-none p-4 space-y-2 relative group">
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

        {/* Header - clickable to expand (blocked for premium) */}
        <button
          onClick={() => {
            if (isPremium && onPremiumRequired) {
              onPremiumRequired();
              return;
            }
            setExpanded(!expanded);
          }}
          className="flex items-center justify-between w-full pr-8 text-left"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-primary">{destination}</h3>
            <span className="text-lg">✍️</span>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </button>

        {/* Caption preview - minimized by default */}
        {!expanded ? (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {text}
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {text}
            </p>
            <p className="text-xs text-accent font-medium truncate">{hashtags}</p>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCopy}
                className={cn(
                  "flex-1 py-2 px-3 rounded-full font-medium flex items-center justify-center gap-1.5 transition-all duration-300 text-sm min-h-[40px]",
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {copied ? <><Check className="w-3.5 h-3.5" /><span>Copiado!</span></> : <><Copy className="w-3.5 h-3.5" /><span>Copiar</span></>}
              </button>
              <button
                onClick={handleOpenFullText}
                className="py-2 px-3 rounded-full font-medium flex items-center justify-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm min-h-[40px]"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              ✍️ {destination}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Texto da Legenda</label>
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Hashtags</label>
              <Textarea
                value={editHashtags}
                onChange={(e) => setEditHashtags(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
            <Button onClick={handleCopy} variant="secondary">
              <Copy className="w-4 h-4 mr-1" /> Copiar
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="w-4 h-4 mr-1" /> Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export const CaptionCard = memo(CaptionCardComponent);
