/**
 * EDITOR VISUAL DE AJUSTE FINO DA ARTE — SOMENTE ADMIN
 *
 * Funciona para TODAS as variações (V0…V8 e as futuras), porque os elementos
 * são capturados automaticamente pelo gravador do canvas
 * (`src/lib/fabrica-art-recorder.ts`): cada texto, ícone, imagem e forma vira
 * um bloco editável.
 *
 * O que dá para fazer em cada bloco:
 *   • mover (arrastar ou setas), escalar, girar
 *   • esconder
 *   • trazer para frente / enviar para trás (z-index)
 *   • trocar o texto, inclusive quebrando em várias linhas ("10x\nde")
 *
 * Salvar:
 *   • "Aplicar só nesta arte" → vale apenas para a imagem atual
 *   • "Salvar como padrão da variação" → grava em `fabrica_art_tweak_presets`
 *     e TODOS os usuários passam a gerar essa variação já ajustada.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpToLine,
  Eye,
  EyeOff,
  Loader2,
  Move,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  artVariantLabel,
  isEmptyTweakMap,
  type ArtElementBox,
  type ArtElementTweak,
  type ArtTweakMap,
} from "@/lib/fabrica-art-tweaks";
import { saveArtTweakPreset } from "@/lib/fabrica-art-tweak-presets";
import { composeTravelAd } from "@/lib/fabrica-compose-art";

interface ArtTweakEditorProps {
  open: boolean;
  onClose: () => void;
  composeOptions: any;
  category: string;
  variant: number;
  format: string;
  initialTweaks?: ArtTweakMap;
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
  const [showBoxes, setShowBoxes] = useState(true);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; x: number; y: number; dx: number; dy: number } | null>(null);
  const renderToken = useRef(0);

  useEffect(() => {
    if (open) {
      setTweaks(initialTweaks || {});
      setSelected(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const render = useCallback(
    async (map: ArtTweakMap) => {
      const token = ++renderToken.current;
      setRendering(true);
      try {
        let boxes: ArtElementBox[] = [];
        const img = await composeTravelAd({
          ...composeOptions,
          forceVariant: variant,
          artTweaks: map,
          onArtElements: (els: ArtElementBox[]) => { boxes = els.slice(); },
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
    const t = setTimeout(() => { void render(tweaks); }, 160);
    return () => clearTimeout(t);
  }, [open, tweaks, render]);

  const patch = (id: string, data: Partial<ArtElementTweak>) =>
    setTweaks((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...data } }));

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
    patch(d.id, {
      dx: Math.round(d.dx + (e.clientX - d.x) / k),
      dy: Math.round(d.dy + (e.clientY - d.y) / k),
    });
  };

  const onPointerUp = () => { dragRef.current = null; };

  const nudge = (dx: number, dy: number) => {
    if (!selected) return;
    const cur = tweaks[selected] || {};
    patch(selected, { dx: (cur.dx || 0) + dx, dy: (cur.dy || 0) + dy });
  };

  const bringTo = (delta: number) => {
    if (!selected) return;
    const cur = tweaks[selected] || {};
    patch(selected, { z: (cur.z || 0) + delta });
  };

  const resetAll = () => { setTweaks({}); setSelected(null); };
  const resetOne = () => {
    if (!selected) return;
    setTweaks((prev) => {
      const next = { ...prev };
      delete next[selected];
      return next;
    });
  };

  const selectedBox = elements.find((e) => e.id === selected) || null;
  const st: ArtElementTweak = (selected && tweaks[selected]) || {};
  const label = useMemo(() => artVariantLabel(category, variant, format), [category, variant, format]);

  const handleSavePreset = async () => {
    setSaving(true);
    try {
      await saveArtTweakPreset(category, variant, format, tweaks);
      toast.success("Padrão salvo — todos os usuários passam a gerar essa variação ajustada.");
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
    <div className="fixed inset-0 z-[2000] overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Ajuste fino da arte</h2>
            <p className="text-xs text-muted-foreground">
              {label} · arraste qualquer bloco · {elements.length} elementos detectados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBoxes((v) => !v)}>
              {showBoxes ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showBoxes ? "Ocultar caixas" : "Mostrar caixas"}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
          <div
            ref={stageRef}
            className="relative w-full select-none overflow-hidden rounded-lg border border-border bg-muted"
            style={{ aspectRatio: `${CANVAS_W} / ${canvasH}` }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {preview && (
              <img src={preview} alt="Prévia da arte em ajuste" className="pointer-events-none h-full w-full object-contain" />
            )}
            {rendering && (
              <div className="absolute inset-0 grid place-items-center bg-background/40">
                <Loader2 className="h-6 w-6 animate-spin text-foreground" />
              </div>
            )}
            {showBoxes && elements.map((box) => {
              const isSel = selected === box.id;
              return (
                <div
                  key={box.id}
                  onPointerDown={(e) => onPointerDown(e, box)}
                  className={`absolute cursor-move rounded-[2px] border transition-colors ${
                    isSel ? "border-2 border-primary bg-primary/10" : "border-primary/30 hover:border-primary/80"
                  }`}
                  style={{
                    left: `${(box.x / CANVAS_W) * 100}%`,
                    top: `${(box.y / canvasH) * 100}%`,
                    width: `${(box.w / CANVAS_W) * 100}%`,
                    height: `${(box.h / canvasH) * 100}%`,
                    minWidth: 6,
                    minHeight: 6,
                  }}
                  title={box.label}
                />
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-3 text-card-foreground">
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold">
                <Move className="h-3.5 w-3.5" /> Elementos da arte
              </p>
              {elements.length === 0 ? (
                <p className="text-xs text-muted-foreground">Gerando… aguarde o desenho da arte.</p>
              ) : (
                <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
                  {elements.map((el) => (
                    <button
                      key={el.id}
                      onClick={() => setSelected(el.id)}
                      className={`block w-full truncate rounded border px-2 py-1 text-left text-[11px] ${
                        selected === el.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted text-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {tweaks[el.id]?.hidden ? "🚫 " : ""}{el.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selected && (
              <div className="space-y-3 rounded-lg border border-border bg-card p-3 text-card-foreground">
                <p className="truncate text-xs font-semibold">{selectedBox?.label || selected}</p>

                <div className="grid grid-cols-3 gap-1.5">
                  <span />
                  <Button variant="outline" size="sm" onClick={() => nudge(0, -8)}><ArrowUp className="h-4 w-4" /></Button>
                  <span />
                  <Button variant="outline" size="sm" onClick={() => nudge(-8, 0)}><ArrowLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => nudge(0, 8)}><ArrowDown className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => nudge(8, 0)}><ArrowRight className="h-4 w-4" /></Button>
                </div>

                <div>
                  <p className="mb-1 text-[11px] text-muted-foreground">
                    Tamanho: {Math.round((st.scale ?? 1) * 100)}%
                  </p>
                  <Slider
                    min={20}
                    max={300}
                    step={2}
                    value={[Math.round((st.scale ?? 1) * 100)]}
                    onValueChange={(v) => patch(selected, { scale: v[0] / 100 })}
                  />
                </div>

                <div>
                  <p className="mb-1 text-[11px] text-muted-foreground">Rotação: {st.rotate ?? 0}°</p>
                  <Slider
                    min={-45}
                    max={45}
                    step={1}
                    value={[st.rotate ?? 0]}
                    onValueChange={(v) => patch(selected, { rotate: v[0] })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => bringTo(1)}>
                    <ArrowUpToLine className="mr-1 h-4 w-4" /> Frente
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => bringTo(-1)}>
                    <ArrowDownToLine className="mr-1 h-4 w-4" /> Trás
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Camada: {st.z ?? 0} · Posição: {st.dx || 0}px / {st.dy || 0}px
                </p>

                <Button
                  variant={st.hidden ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => patch(selected, { hidden: !st.hidden })}
                >
                  {st.hidden ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                  {st.hidden ? "Mostrar elemento" : "Esconder elemento"}
                </Button>

                {selectedBox?.kind === "text" && (
                  <div>
                    <p className="mb-1 text-[11px] text-muted-foreground">
                      Texto (use Enter para quebrar linha — ex.: “10x” em cima, “de” embaixo)
                    </p>
                    <Textarea
                      rows={3}
                      className="text-xs"
                      value={st.text ?? selectedBox.text ?? ""}
                      onChange={(e) => patch(selected, { text: e.target.value })}
                    />
                  </div>
                )}

                <Button variant="ghost" size="sm" className="w-full" onClick={resetOne}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Zerar este elemento
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={resetAll} disabled={isEmptyTweakMap(tweaks)}>
                <RotateCcw className="mr-2 h-4 w-4" /> Zerar todos os ajustes
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
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar como padrão da variação
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
