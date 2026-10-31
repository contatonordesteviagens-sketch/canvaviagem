// Vitrine usada na página inicial e no quiz: mesmas peças, mesma ordem.
export type ShowcasePiece = { src: string; w: number; h: number; newSet?: boolean };

const base = "/quiz-media/vitrine";

export const SHOWCASE_ADS: ShowcasePiece[] = Array.from({ length: 9 }, (_, i) => ({
  src: `${base}/ad-rio-${i + 1}.webp`,
  w: 540,
  h: 540,
}));

// Cada carrossel fica inteiro e na ordem da postagem: capa, miolo e fechamento.
const carousel = (name: string, frames: (string | number)[]): ShowcasePiece[] =>
  frames.map((f, i) => ({ src: `${base}/car-${name}-${f}.webp`, w: 480, h: 600, newSet: i === 0 }));

export const SHOWCASE_CAROUSELS: ShowcasePiece[] = [
  ...carousel("noronha", [1, 2, 3, 4, 5]),
  ...carousel("azul", [0, 1, 2]),
  ...carousel("preto", [3, 4, 5]),
  ...carousel("azul", [6, 7, 8]),
  ...carousel("preto", [9, 10, 11]),
  ...carousel("azul", [3, 4, 5]),
  ...carousel("preto", [0, 1, 2]),
  ...carousel("azul", [9, 10, 11]),
  ...carousel("preto", [6, 7, 8]),
];

/** Faixa infinita. Carrega tudo ao abrir: em faixa animada, o carregamento adiado deixava quadros vazios no celular. */
export function ShowcaseRow({
  pieces,
  alt,
  reverse = false,
  small = false,
  className = "",
}: {
  pieces: ShowcasePiece[];
  alt: string;
  reverse?: boolean;
  small?: boolean;
  className?: string;
}) {
  const items = [...pieces, ...pieces];
  return (
    <div className={`relative overflow-hidden rounded-[28px] py-2 ${className}`} style={{ maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)" }}>
      <div className="travel-mobile-marquee flex w-max items-center gap-4" style={reverse ? { animationDirection: "reverse", animationDuration: "120s" } : undefined}>
        {items.map((p, i) => (
          <img
            key={`${p.src}-${i}`}
            src={p.src}
            width={p.w}
            height={p.h}
            alt={i < pieces.length ? alt : ""}
            aria-hidden={i >= pieces.length}
            className={`w-auto shrink-0 rounded-2xl border-4 border-white object-cover shadow-md ${small ? "h-[170px]" : "h-[200px] sm:h-[260px]"}`}
            style={{ background: "var(--cv-sand)", aspectRatio: `${p.w} / ${p.h}`, marginLeft: p.newSet ? 24 : undefined }}
            loading="eager"
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}
