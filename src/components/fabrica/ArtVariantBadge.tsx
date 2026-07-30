import { GeneratedArt, formatVariantLabel } from "@/lib/fabrica-art-types";

export function ArtVariantBadge({ art }: { art: GeneratedArt }) {
  if (!art) return null;
  return (
    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded shadow pointer-events-none z-50">
      {formatVariantLabel(art)}
    </div>
  );
}
