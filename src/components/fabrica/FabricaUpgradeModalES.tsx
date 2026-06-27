import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Wand2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FabricaUpgradeModalESProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FABRICA_VIDEO_ID = "R2MyCdox--I";

export const FabricaUpgradeModalES = ({ open, onOpenChange }: FabricaUpgradeModalESProps) => {
  const navigate = useNavigate();
  const [mutedActive, setMutedActive] = useState(true);

  const handlePlansClick = () => {
    onOpenChange(false);
    navigate("/inicio");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden border-primary/20 bg-background p-0 shadow-2xl sm:rounded-2xl">
        <div className="relative aspect-video bg-muted">
          {mutedActive ? (
            <>
              <iframe
                className="absolute inset-0 h-full w-full border-0 pointer-events-none"
                src={`https://www.youtube.com/embed/${FABRICA_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${FABRICA_VIDEO_ID}&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
                title="Demostración de la Fábrica de Anuncios Canva Viajes"
                allow="autoplay; encrypted-media"
              />
              <button
                type="button"
                onClick={() => setMutedActive(false)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/45 transition-colors hover:bg-background/35"
              >
                <span className="rounded-full border border-primary/25 bg-background/90 px-4 py-1.5 text-[10px] font-black uppercase tracking-wide text-primary">
                  Ver con sonido
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-black uppercase tracking-wide text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Activar audio del video
                </span>
              </button>
            </>
          ) : (
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              src={`https://www.youtube.com/embed/${FABRICA_VIDEO_ID}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`}
              title="Demostración de la Fábrica de Anuncios Canva Viajes"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          )}
        </div>

        <div className="space-y-4 p-5 text-center sm:p-6">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Wand2 className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-black tracking-tight">
              La Fábrica de Anuncios se ha Liberado 🚀
            </DialogTitle>
            <DialogDescription className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
              Mira cómo la herramienta crea anuncios profesionales para viajes con foto, precio, cuotas y logo en pocos segundos.
            </DialogDescription>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={handlePlansClick} className="font-extrabold uppercase tracking-wide">
              Ir al Inicio
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Ahora no
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};