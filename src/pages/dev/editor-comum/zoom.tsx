// Zoom do palco, usado pelo editor de artes e pelo de vídeo.
// 1 = a peça inteira cabe na tela. Botões, Ctrl + rodinha, Ctrl +/-/0 (quem usa liga as teclas) e pinça com dois dedos.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Maximize, ZoomIn, ZoomOut } from "lucide-react";

export const ZOOM_MIN = 0.5, ZOOM_MAX = 4;

/** `aoComecarPinca`: chamado quando dois dedos tocam a tela (para cancelar um arrasto que tenha começado). */
export function useZoomPalco(aoComecarPinca?: () => void) {
  const [zoom, setZoomBruto] = useState(1);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;
  const zona = useRef<HTMLDivElement>(null);
  const centroZoom = useRef<{ x: number; y: number; ox?: number; oy?: number } | null>(null);
  const pinca = useRef<{ d: number; z: number; px: number; py: number } | null>(null);
  const aoPincar = useRef(aoComecarPinca);
  aoPincar.current = aoComecarPinca;

  // guarda o ponto que está no meio (ou embaixo dos dedos) para ele continuar no mesmo lugar depois do zoom
  const mudarZoom = (z: number, foco?: { x: number; y: number }) => {
    const el = zona.current;
    const nz = Math.round(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z)) * 100) / 100;
    if (el && nz !== zoomRef.current) {
      const r = el.getBoundingClientRect();
      const ox = foco ? foco.x - r.left : el.clientWidth / 2, oy = foco ? foco.y - r.top : el.clientHeight / 2;
      centroZoom.current = { x: (el.scrollLeft + ox) / Math.max(1, el.scrollWidth), y: (el.scrollTop + oy) / Math.max(1, el.scrollHeight), ox, oy };
    }
    zoomRef.current = nz;
    setZoomBruto(nz);
  };
  useLayoutEffect(() => {
    const el = zona.current, c = centroZoom.current;
    if (!el || !c) return;
    centroZoom.current = null;
    el.scrollLeft = c.x * el.scrollWidth - (c.ox ?? el.clientWidth / 2);
    el.scrollTop = c.y * el.scrollHeight - (c.oy ?? el.clientHeight / 2);
  }, [zoom]);
  const mudarZoomRef = useRef(mudarZoom);
  mudarZoomRef.current = mudarZoom;
  // Ctrl + rodinha do mouse (ou pinça no touchpad) faz zoom no ponto do mouse
  useEffect(() => {
    const el = zona.current;
    if (!el) return;
    const w = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      mudarZoomRef.current(zoomRef.current * Math.exp(-Math.max(-40, Math.min(40, e.deltaY)) / 200), { x: e.clientX, y: e.clientY });
    };
    el.addEventListener("wheel", w, { passive: false });
    return () => el.removeEventListener("wheel", w);
  }, []);
  // celular: dois dedos dão zoom e arrastam a tela
  const distDedos = (t: React.TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const meioDedos = (t: React.TouchList) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });
  const tocarZona = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    aoPincar.current?.();
    const el = zona.current, m = meioDedos(e.touches);
    if (!el) return;
    const r = el.getBoundingClientRect();
    pinca.current = { d: distDedos(e.touches), z: zoomRef.current, px: (el.scrollLeft + m.x - r.left) / Math.max(1, el.scrollWidth), py: (el.scrollTop + m.y - r.top) / Math.max(1, el.scrollHeight) };
  };
  const moverZona = (e: React.TouchEvent) => {
    const p = pinca.current, el = zona.current;
    if (!p || !el || e.touches.length !== 2) return;
    const m = meioDedos(e.touches), r = el.getBoundingClientRect();
    const nz = Math.round(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, (p.z * distDedos(e.touches)) / p.d)) * 100) / 100;
    centroZoom.current = { x: p.px, y: p.py, ox: m.x - r.left, oy: m.y - r.top };
    if (nz === zoomRef.current) { el.scrollLeft = p.px * el.scrollWidth - (m.x - r.left); el.scrollTop = p.py * el.scrollHeight - (m.y - r.top); centroZoom.current = null; }
    else setZoomBruto(nz);
  };
  const soltarZona = (e: React.TouchEvent) => { if (e.touches.length < 2) pinca.current = null; };

  return { zoom, zoomRef, zona, mudarZoom, tocarZona, moverZona, soltarZona };
}

/** A pílula de zoom: menos, valor (toque = ver tudo), mais e ver a peça inteira. */
export function BarraZoom({ zoom, mudarZoom, claro }: { zoom: number; mudarZoom: (z: number) => void; claro: boolean }) {
  return (
    <div data-zoom className="pointer-events-auto flex items-center rounded-full p-0.5 shadow-lg" style={{ background: claro ? "#FFFFFF" : "#1C1C20", color: claro ? "#111111" : "#FFFFFF", border: `1px solid ${claro ? "rgba(0,0,0,.14)" : "rgba(255,255,255,.15)"}` }}>
      <button data-zoom-menos aria-label="Diminuir o zoom" title="Diminuir (Ctrl -)" onClick={() => mudarZoom(zoom / 1.25)} disabled={zoom <= ZOOM_MIN} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/10 disabled:opacity-30"><ZoomOut className="h-4 w-4" /></button>
      <button data-zoom-valor aria-label="Zoom: voltar a ver tudo" title="Ver tudo (Ctrl 0)" onClick={() => mudarZoom(1)} className="min-w-[52px] rounded-full px-1 text-center text-[12px] font-black tabular-nums hover:bg-black/10">{Math.round(zoom * 100)}%</button>
      <button data-zoom-mais aria-label="Aumentar o zoom" title="Aumentar (Ctrl +)" onClick={() => mudarZoom(zoom * 1.25)} disabled={zoom >= ZOOM_MAX} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/10 disabled:opacity-30"><ZoomIn className="h-4 w-4" /></button>
      {zoom !== 1 && <button data-zoom-ajustar aria-label="Ver tudo" title="Ver tudo" onClick={() => mudarZoom(1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/10"><Maximize className="h-4 w-4" /></button>}
    </div>
  );
}
