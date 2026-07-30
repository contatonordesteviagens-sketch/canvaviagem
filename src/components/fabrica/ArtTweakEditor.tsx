/**
 * EDITOR VISUAL DE AJUSTE FINO DA ARTE — SOMENTE ADMIN
 *
 * Permite arrastar e redimensionar os blocos registrados pelo motor de
 * composição (título, selos, benefícios, preço) e salvar:
 *   • só nesta arte (aplica na imagem atual)
 *   • como padrão da variação (todos os usuários passam a gerar assim)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Move, RotateCcw, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { composeTravelAd } from "@/lib/fabrica-compose-art";
import {
  artVariantLabel,
  isEmptyTweakMap,
  type ArtElementBox,
  type ArtTweakMap,
} from "@/lib/fabrica-art-tweaks";
import { saveArtTweakPreset } from "@/lib/fabrica-art-tweak-presets";

interface ArtTweakEditorProps {
  open: boolean;
  onClose: () => void;
  /** Opções exatas usadas para compor a arte. */
  composeOptions: any;
  category: string;
  variant: number;
  format: string;
  initialTweaks?: ArtTweakMap;
  /** Aplica o resultado na arte atual da galeria. */
  onApply: (image: string, tweaks: ArtTweakMap) => void;
}

const CANVAS_W = 1080;

export default function ArtTweakEditor({
  open,
  onClose,
  composeOptions,
  category,
  variant,
  format,
  initialTweaks,
  onApply,
}: ArtTweakEditorProps) {
  const canvasH = format === "story" ? 1920 : 1080;
  const [tweaks, setTweaks] = useState<ArtTweakMap>(initialTweaks || {});
  const [elements, setElements] = useState<ArtElementBox[]>([]);
  const [preview, setPreview] = useState<string>("");
  const [rendering, setRendering] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; x: number; y: number; dx: number; dy: number } | null>(null);
  const renderToken = useRef(0);

  useEffect(() => {
    if (open) setTweaks(initialTweaks || {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const render = useCallback(
    async (map: ArtTweakMap) => {
      const token = ++renderToken.current;
      setRendering(true);
      try {
        const boxes: ArtElementBox[] = [];
        const img = await composeTravelAd({
          ...composeOptions,
          forceVariant: variant,
          artTweaks: map,
          onArtElements: (els: ArtElementBox[]) => boxes.push(...els),
        });
        if (token !== renderToken.current) return;
        setPreview(img);
        setElements(boxes);
      } catch (err: any) {
        if (token === renderToken.current) toast.error(err?.message || "Erro ao redesenhar a arte");
      } finally {
        if (token === renderToken.current) setRendering(false);
      }
    },
    [composeOptions, variant],
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => { void render(tweaks); }, 150);
    return () => clearTimeout(t);
  }, [open, tweaks, render]);

  const scaleFactor = () => {
    const el = stageRef.current;
    if (!el) return 1;
    return el.clientWidth / CANVAS_W;
  };

  const onPointerDown = (e: React.PointerEvent, box: ArtElementBox) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setSelected(box.id);
    const cur = tweaks[box.id] || {};
    dragRef.current = { id: box.id, x: e.clientX, y: e.clientY, dx: cur.dx || 0, dy: cur.dy || 0 };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const k = scaleFactor() || 1;
    const ndx = Math.round(d.dx + (e.clientX - d.x) / k);
    const ndy = Math.round(d.dy + (e.clientY - d.y) / k);
    setTweaks((prev) => ({ ...prev, [d.id]: { ...(prev[d.id] || {}), dx: ndx, dy: ndy } }));
  };

  const onPointerUp = () => { dragRef.current = null; };

  const nudge = (dx: number, dy: number) => {
    if (!selected) return;
    setTweaks((prev) => {
      const cur = prev[selected] || {};
      return { ...prev, [selected]: { ...cur, dx: (cur.dx || 0) + dx, dy: (cur.dy || 0) + dy } };
    });
  };

  const setScale = (value: number) => {
    if (!selected) return;
    setTweaks((prev) => ({ ...prev, [selected]: { ...(prev[selected] || {}), scale: value } }));
  };

  const resetAll = () => { setTweaks({}); setSelected(null); };

  const selectedTweak = selected ? tweaks[selected] || {} : {};
  const label = useMemo(() => artVariantLabel(category, variant, format), [category, variant, format]);

  const handleSavePreset = async () => {
    setSaving(true);
    try {
      await saveArtTweakPreset(category, variant, format, tweaks);
      toast.success("Padrão da variação salvo — todos passam a gerar ajustado.");
      if (preview) onApply(preview, tweaks);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível salvar o padrão");
    } finally {
      setSaving(false);
    }
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[2000] bg-background overflow-y-auto">
      <div className="mx-auto max-w-6xl p-4 md:p-6">

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Ajuste fino da arte</h2>
            <p className="text-xs text-muted-foreground">{label} · arraste os blocos na imagem</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
          <div
            ref={stageRef}
            className="relative w-full select-none rounded-lg overflow-hidden border border-border bg-muted"
            style={{ aspectRatio: `${CANVAS_W} / ${canvasH}` }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {preview && <img src={preview} alt="Prévia da arte em ajuste" className="w-full h-full object-contain pointer-events-none" />}
            {rendering && (
              <div className="absolute inset-0 grid place-items-center bg-background/40">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {elements.map((box) => {
              const isSel = selected === box.id;
              return (
                <div
                  key={box.id}
                  onPointerDown={(e) => onPointerDown(e, box)}
                  className={`absolute cursor-move rounded-sm border-2 transition-colors ${
                    isSel ? "border-primary bg-primary/10" : "border-primary/40 hover:border-primary/80 bg-transparent"
                  }`}
                  style={{
                    left: `${(box.x / CANVAS_W) * 100}%`,
                    top: `${(box.y / canvasH) * 100}%`,
                    width: `${(box.w / CANVAS_W) * 100}%`,
                    height: `${(box.h / canvasH) * 100}%`,
                  }}
                  title={box.label}
                >
                  <span className="absolute -top-5 left-0 text-[10px] font-semibold px-1 rounded bg-primary text-primary-foreground whitespace-nowrap">
                    {box.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Move className="h-3.5 w-3.5" /> Elemento</p>
              {elements.length === 0 ? (
                <p className="text-xs text-muted-foreground">Esta variação ainda não tem blocos ajustáveis.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {elements.map((el) => (
                    <button
                      key={el.id}
                      onClick={() => setSelected(el.id)}
                      className={`text-[11px] px-2 py-1 rounded border ${
                        selected === el.id ? "bg-primary text-primary-foreground border-primary" : "border-border"
                      }`}
                    >
                      {el.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selected && (
              <div className="rounded-lg border border-border p-3 space-y-3">
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <span />
                  <Button variant="outline" size="sm" onClick={() => nudge(0, -8)}>↑</Button>
                  <span />
                  <Button variant="outline" size="sm" onClick={() => nudge(-8, 0)}>←</Button>
                  <Button variant="outline" size="sm" onClick={() => nudge(0, 8)}>↓</Button>
                  <Button variant="outline" size="sm" onClick={() => nudge(8, 0)}>→</Button>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Tamanho: {Math.round((selectedTweak.scale ?? 1) * 100)}%
                  </p>
                  <Slider
                    min={50}
                    max={160}
                    step={2}
                    value={[Math.round((selectedTweak.scale ?? 1) * 100)]}
                    onValueChange={(v) => setScale(v[0] / 100)}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Deslocamento: {selectedTweak.dx || 0}px / {selectedTweak.dy || 0}px
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={resetAll} disabled={isEmptyTweakMap(tweaks)}>
                <RotateCcw className="h-4 w-4 mr-2" /> Zerar ajustes
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                disabled={!preview || rendering}
                onClick={() => { onApply(preview, tweaks); onClose(); }}
              >
                Aplicar só nesta arte
              </Button>
              <Button className="w-full" disabled={saving || rendering} onClick={handleSavePreset}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar como padrão da variação
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
