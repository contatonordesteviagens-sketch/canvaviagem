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
  Undo2,
  Redo2,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash,
  Copy,
  Square,
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
  
  // State
  const [tweaks, setTweaks] = useState<ArtTweakMap>(initialTweaks || {});
  const [history, setHistory] = useState<ArtTweakMap[]>([initialTweaks || {}]);
  const [pointer, setPointer] = useState(0);
  
  const [elements, setElements] = useState<ArtElementBox[]>([]);
  const [preview, setPreview] = useState<string>("");
  const [rendering, setRendering] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [showBoxes, setShowBoxes] = useState(true);
  
  // Drag & Marquee Refs
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ type?: 'move' | 'scale'; corner?: string; items: { id: string; startDx: number; startDy: number; startScale: number, startScaleX: number, startScaleY: number }[]; x: number; y: number } | null>(null);
  const [marquee, setMarquee] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const marqueeRef = useRef<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  
  const renderToken = useRef(0);

  // Initialize
  useEffect(() => {
    if (open) {
      setTweaks(initialTweaks || {});
      setHistory([initialTweaks || {}]);
      setPointer(0);
      setSelected(new Set());
    }
  }, [open, initialTweaks]);

  // History Actions
  const pushHistory = useCallback((newTweaks: ArtTweakMap) => {
    setHistory((prev) => {
      const newH = prev.slice(0, pointer + 1);
      newH.push(newTweaks);
      if (newH.length > 50) newH.shift();
      return newH;
    });
    setPointer((prev) => Math.min(prev + 1, 50));
  }, [pointer]);

  const undo = useCallback(() => {
    if (pointer > 0) {
      const p = pointer - 1;
      setPointer(p);
      setTweaks(history[p]);
    }
  }, [pointer, history]);

  const redo = useCallback(() => {
    if (pointer < history.length - 1) {
      const p = pointer + 1;
      setPointer(p);
      setTweaks(history[p]);
    }
  }, [pointer, history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, undo, redo]);

  // Renderer
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
        setPreview(img.url || (typeof img === 'string' ? img : ""));
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

  // Actions
  const patch = (updates: Record<string, Partial<ArtElementTweak>>, commit = true) => {
    const next = { ...tweaks };
    for (const [id, data] of Object.entries(updates)) {
      next[id] = { ...(next[id] || {}), ...data };
    }
    setTweaks(next);
    if (commit) pushHistory(next);
  };

  const patchSelected = (data: Partial<ArtElementTweak>, commit = true) => {
    if (selected.size === 0) return;
    const updates: Record<string, Partial<ArtElementTweak>> = {};
    selected.forEach(id => { updates[id] = data; });
    patch(updates, commit);
  };

  
  const onPointerDownHandle = (e: React.PointerEvent, box: ArtElementBox, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    // Select only this box if not selected
    let newSel = new Set(selected);
    if (!newSel.has(box.id)) {
      newSel = new Set([box.id]);
      setSelected(newSel);
    }
    
    const items = Array.from(newSel).map(id => ({
      id,
      startDx: tweaks[id]?.dx || 0,
      startDy: tweaks[id]?.dy || 0,
      startScale: tweaks[id]?.scale || 1,
      startScaleX: tweaks[id]?.scaleX || tweaks[id]?.scale || 1,
      startScaleY: tweaks[id]?.scaleY || tweaks[id]?.scale || 1,
    }));
    dragRef.current = { type: 'scale', corner, items, x: e.clientX, y: e.clientY };
  };

  const scaleFactor = () => {
    const el = stageRef.current;
    if (!el) return 1;
    return el.clientWidth / CANVAS_W;
  };

  // Drag Handlers
  const onPointerDownBox = (e: React.PointerEvent, box: ArtElementBox) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    let newSel = new Set(selected);
    if (e.ctrlKey || e.metaKey) {
      if (newSel.has(box.id)) newSel.delete(box.id);
      else newSel.add(box.id);
    } else {
      if (!newSel.has(box.id)) {
        newSel = new Set([box.id]);
      }
    }
    setSelected(newSel);
    
    const items = Array.from(newSel).map(id => ({
      id,
      startDx: tweaks[id]?.dx || 0,
      startDy: tweaks[id]?.dy || 0,
      startScale: tweaks[id]?.scale || 1,
      startScaleX: tweaks[id]?.scaleX || tweaks[id]?.scale || 1,
      startScaleY: tweaks[id]?.scaleY || tweaks[id]?.scale || 1,
    }));
    dragRef.current = { type: 'move', items, x: e.clientX, y: e.clientY };
  };

  const onPointerDownStage = (e: React.PointerEvent) => {
    e.preventDefault();
    const el = stageRef.current;
    if (!el) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    if (!e.ctrlKey && !e.metaKey) setSelected(new Set());
    
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const m = { startX: x, startY: y, endX: x, endY: y };
    setMarquee(m);
    marqueeRef.current = m;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragRef.current) {
      const d = dragRef.current;
      const k = scaleFactor() || 1;
      const deltaX = (e.clientX - d.x) / k;
      const deltaY = (e.clientY - d.y) / k;
      
      const updates: Record<string, Partial<ArtElementTweak>> = {};
      d.items.forEach(item => {
        if (d.type === 'scale') {
           // We map dragging delta to scale proportional to typical element size (e.g. 100px base)
           // If dragging right/down, it scales up.
           const dist = (deltaX + deltaY) / 100; 
           let scaleDelta = dist;
           if (d.corner === 'nw') scaleDelta = -dist;
           else if (d.corner === 'ne') scaleDelta = (deltaX - deltaY) / 100;
           else if (d.corner === 'sw') scaleDelta = (deltaY - deltaX) / 100;
           else if (d.corner === 'se') scaleDelta = dist;
           
           if (['e', 'w', 'n', 's'].includes(d.corner!)) {
               if (d.corner === 'e' || d.corner === 'w') {
                   const sxDelta = d.corner === 'w' ? -deltaX / 100 : deltaX / 100;
                   const newScaleX = Math.max(0.1, Math.min(5, item.startScaleX + sxDelta));
                   updates[item.id] = { scaleX: Number(newScaleX.toFixed(2)) };
               } else {
                   const syDelta = d.corner === 'n' ? -deltaY / 100 : deltaY / 100;
                   const newScaleY = Math.max(0.1, Math.min(5, item.startScaleY + syDelta));
                   updates[item.id] = { scaleY: Number(newScaleY.toFixed(2)) };
               }
           } else {
               const newScale = Math.max(0.1, Math.min(5, item.startScale + scaleDelta));
               updates[item.id] = { scale: Number(newScale.toFixed(2)) };
           }
        } else {
           updates[item.id] = {
             dx: Math.round(item.startDx + deltaX),
             dy: Math.round(item.startDy + deltaY),
           };
        }
      });
      patch(updates, false);
    }
    
    if (marqueeRef.current) {
      const el = stageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      setMarquee(prev => prev ? { ...prev, endX: newX, endY: newY } : null);
      marqueeRef.current = { ...marqueeRef.current, endX: newX, endY: newY };
    }
  };

  const onPointerUp = () => {
    if (dragRef.current) {
      dragRef.current = null;
      pushHistory(tweaks); // commit the move
    }
    if (marqueeRef.current) {
      const k = scaleFactor() || 1;
      const { startX, startY, endX, endY } = marqueeRef.current;
      const minX = Math.min(startX, endX) / k;
      const maxX = Math.max(startX, endX) / k;
      const minY = Math.min(startY, endY) / k;
      const maxY = Math.max(startY, endY) / k;
      
      const newSel = new Set(selected);
      elements.forEach(box => {
        const boxMinX = box.x;
        const boxMaxX = box.x + box.w;
        const boxMinY = box.y;
        const boxMaxY = box.y + box.h;
        if (boxMinX < maxX && boxMaxX > minX && boxMinY < maxY && boxMaxY > minY) {
           newSel.add(box.id);
        }
      });
      setSelected(newSel);
      setMarquee(null);
      marqueeRef.current = null;
    }
  };

  const nudge = (dx: number, dy: number) => {
    if (selected.size === 0) return;
    const updates: Record<string, Partial<ArtElementTweak>> = {};
    selected.forEach(id => {
      const cur = tweaks[id] || {};
      updates[id] = { dx: (cur.dx || 0) + dx, dy: (cur.dy || 0) + dy };
    });
    patch(updates, true);
  };

  const bringTo = (delta: number) => {
    if (selected.size === 0) return;
    const updates: Record<string, Partial<ArtElementTweak>> = {};
    selected.forEach(id => {
      const cur = tweaks[id] || {};
      updates[id] = { z: (cur.z || 0) + delta };
    });
    patch(updates, true);
  };

  const resetAll = () => { 
    setTweaks({}); 
    pushHistory({});
    setSelected(new Set()); 
  };
  
  const resetSelected = () => {
    if (selected.size === 0) return;
    const next = { ...tweaks };
    selected.forEach(id => { delete next[id]; });
    setTweaks(next);
    pushHistory(next);
  };

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

  // Derive first selected box properties for UI (scale, rotate, text, etc)
  const firstSelectedId = Array.from(selected)[0];
  const firstSelectedBox = firstSelectedId ? elements.find((e) => e.id === firstSelectedId) : null;
  const firstSt: ArtElementTweak = (firstSelectedId && tweaks[firstSelectedId]) || {};
  
  // Mixed state logic
  let mixedHidden = false;
  let allHidden = true;
  selected.forEach(id => {
    const isHidden = !!tweaks[id]?.hidden;
    if (isHidden) mixedHidden = true;
    if (!isHidden) allHidden = false;
  });
  const showHideIcon = allHidden ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />;
  const showHideLabel = allHidden ? "Mostrar seleção" : "Esconder seleção";

  return createPortal(
    <div className="fixed inset-0 z-[2000] overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Ajuste fino da arte</h2>
            <p className="text-xs text-muted-foreground">
              {label} · {elements.length} elementos detectados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={pointer === 0} title="Desfazer (Ctrl+Z)">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={pointer === history.length - 1} title="Refazer (Ctrl+Y)">
              <Redo2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
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
            className="relative w-full select-none overflow-hidden rounded-lg border border-border bg-muted cursor-crosshair"
            style={{ aspectRatio: `${CANVAS_W} / ${canvasH}` }}
            onPointerDown={onPointerDownStage}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {preview && (
              <img src={preview} alt="Prévia da arte em ajuste" className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
            )}
            {rendering && (
              <div className="absolute inset-0 grid place-items-center bg-background/40">
                <Loader2 className="h-6 w-6 animate-spin text-foreground" />
              </div>
            )}
            {showBoxes && elements.map((box) => {
              const isSel = selected.has(box.id);
              return (
<div
                  key={box.id}
                  onPointerDown={(e) => onPointerDownBox(e, box)}
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
                >
                  {isSel && selected.size === 1 && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 h-3 w-3 cursor-nwse-resize rounded-full border border-primary bg-white pointer-events-auto" onPointerDown={(e) => onPointerDownHandle(e, box, 'nw')} />
                      <div className="absolute -top-1.5 -right-1.5 h-3 w-3 cursor-nesw-resize rounded-full border border-primary bg-white pointer-events-auto" onPointerDown={(e) => onPointerDownHandle(e, box, 'ne')} />
                      <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 cursor-nesw-resize rounded-full border border-primary bg-white pointer-events-auto" onPointerDown={(e) => onPointerDownHandle(e, box, 'sw')} />
                      <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize rounded-full border border-primary bg-white pointer-events-auto" onPointerDown={(e) => onPointerDownHandle(e, box, 'se')} />
                      
                      <div className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 cursor-ew-resize rounded-full border border-primary bg-white pointer-events-auto" onPointerDown={(e) => onPointerDownHandle(e, box, 'w')} />
                      <div className="absolute top-1/2 -right-1.5 h-3 w-3 -translate-y-1/2 cursor-ew-resize rounded-full border border-primary bg-white pointer-events-auto" onPointerDown={(e) => onPointerDownHandle(e, box, 'e')} />
                      <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 cursor-ns-resize rounded-full border border-primary bg-white pointer-events-auto" onPointerDown={(e) => onPointerDownHandle(e, box, 'n')} />
                      <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 cursor-ns-resize rounded-full border border-primary bg-white pointer-events-auto" onPointerDown={(e) => onPointerDownHandle(e, box, 's')} />
                    </>
                  )}
                </div>
              );
            })}
            
            {marquee && (
              <div
                className="absolute border border-blue-500 bg-blue-500/20 pointer-events-none"
                style={{
                  left: Math.min(marquee.startX, marquee.endX),
                  top: Math.min(marquee.startY, marquee.endY),
                  width: Math.abs(marquee.startX - marquee.endX),
                  height: Math.abs(marquee.startY - marquee.endY),
                }}
              />
            )}
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
                  {elements.map((el) => {
                    const isSel = selected.has(el.id);
                    return (
                      <button
                        key={el.id}
                        onClick={(e) => {
                          let newSel = new Set(selected);
                          if (e.ctrlKey || e.metaKey) {
                            if (newSel.has(el.id)) newSel.delete(el.id);
                            else newSel.add(el.id);
                          } else {
                            newSel = new Set([el.id]);
                          }
                          setSelected(newSel);
                        }}
                        className={`block w-full truncate rounded border px-2 py-1 text-left text-[11px] ${
                          isSel
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted text-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {tweaks[el.id]?.hidden ? "🚫 " : ""}{el.label}
                      </button>
                    )
                  })}
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => {
                const id = `custom_shape_${Date.now()}`;
                pushHistory({ ...tweaks, [id]: { custom: { kind: 'shape', w: 200, h: 200, bg: '#ffffff' }, dx: 0, dy: 0, z: 999 } });
              }}><Square className="h-4 w-4 mr-2" /> Adicionar Quadrado</Button>
            </div>

            {selected.size > 0 && (
              <div className="space-y-3 rounded-lg border border-border bg-card p-3 text-card-foreground">
                <p className="truncate text-xs font-semibold">
                  {selected.size === 1 ? firstSelectedBox?.label || firstSelectedId : `${selected.size} elementos selecionados`}
                </p>

                
                <div>
                  <p className="mb-1 text-[11px] text-muted-foreground">
                    Opacidade: {selected.size > 1 ? "Misto" : `${Math.round((firstSt.opacity ?? 1) * 100)}%`}
                  </p>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[Math.round((firstSt.opacity ?? 1) * 100)]}
                    onValueChange={(v) => patchSelected({ opacity: v[0] / 100 })}
                  />
                </div>

                {selected.size === 1 && firstSelectedBox?.kind === "text" && (
                  <div className="flex gap-2">
                     <Button variant={firstSt.align === 'left' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => patchSelected({ align: 'left' })}><AlignLeft className="h-4 w-4" /></Button>
                     <Button variant={firstSt.align === 'center' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => patchSelected({ align: 'center' })}><AlignCenter className="h-4 w-4" /></Button>
                     <Button variant={firstSt.align === 'right' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => patchSelected({ align: 'right' })}><AlignRight className="h-4 w-4" /></Button>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1 text-red-500 hover:text-red-600" onClick={() => patchSelected({ hidden: true })}><Trash className="h-4 w-4 mr-2"/> Remover</Button>
                  {selected.size === 1 && (
                     <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                        const originalId = firstSelectedId;
                        const cloneId = `clone_${Date.now()}`;
                        pushHistory({
                           ...tweaks,
                           [cloneId]: { cloneOf: originalId, dx: (firstSt.dx || 0) + 20, dy: (firstSt.dy || 0) + 20 }
                        });
                        setSelected(new Set([cloneId]));
                     }}><Copy className="h-4 w-4 mr-2"/> Duplicar</Button>
                  )}
                </div>

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
                    Tamanho: {selected.size > 1 ? "Misto" : `${Math.round((firstSt.scale ?? 1) * 100)}%`}
                  </p>
                  <Slider
                    min={20}
                    max={300}
                    step={2}
                    value={[Math.round((firstSt.scale ?? 1) * 100)]}
                    onValueChange={(v) => patchSelected({ scale: v[0] / 100 })}
                  />
                </div>

                <div>
                  <p className="mb-1 text-[11px] text-muted-foreground">
                    Rotação: {selected.size > 1 ? "Misto" : `${firstSt.rotate ?? 0}°`}
                  </p>
                  <Slider
                    min={-45}
                    max={45}
                    step={1}
                    value={[firstSt.rotate ?? 0]}
                    onValueChange={(v) => patchSelected({ rotate: v[0] })}
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
                
                {selected.size === 1 && (
                  <p className="text-[11px] text-muted-foreground">
                    Camada: {firstSt.z ?? 0} · Posição: {firstSt.dx || 0}px / {firstSt.dy || 0}px
                  </p>
                )}

                <Button
                  variant={allHidden ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => patchSelected({ hidden: !allHidden })}
                >
                  {showHideIcon}
                  {showHideLabel}
                </Button>

                {selected.size === 1 && firstSelectedBox?.kind === "text" && (
                  <div>
                    <p className="mb-1 text-[11px] text-muted-foreground">
                      Texto (use Enter para quebrar linha — ex.: “10x” em cima, “de” embaixo)
                    </p>
                    <Textarea
                      rows={3}
                      className="text-xs"
                      value={firstSt.text ?? firstSelectedBox.text ?? ""}
                      onChange={(e) => patchSelected({ text: e.target.value })}
                    />
                  </div>
                )}

                <Button variant="ghost" size="sm" className="w-full" onClick={resetSelected}>
                  <RotateCcw className="mr-2 h-4 w-4" /> 
                  {selected.size === 1 ? "Zerar este elemento" : "Zerar itens selecionados"}
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
