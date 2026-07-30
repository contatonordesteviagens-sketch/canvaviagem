export type EngineType = "photo" | "custom" | "ia";
export type CategoriaType = "oferta" | "experiencia";
export type FormatType = "1:1" | "9:16";

export interface GeneratedArt {
  url: string;              // dataURL atual
  variant: number | null;   // 0..8 (null = IA Pura)
  engine: EngineType;
  categoria: CategoriaType;
  format: FormatType;
  strategyId: string;
  seed: number;
  createdAt: number;
}

export function formatVariantLabel(art: GeneratedArt): string {
  if (art.engine === "ia") {
    return `IA Pura · ${art.categoria === "oferta" ? "Oferta" : "Exp."}`;
  }
  const varLabel = art.variant !== null ? `V${art.variant}` : "Custom";
  const catLabel = art.categoria === "oferta" ? "Oferta" : "Exp.";
  return `${varLabel} · ${catLabel}`;
}
