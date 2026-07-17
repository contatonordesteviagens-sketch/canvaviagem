import { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";

type BrandPalette = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
};

type BrandPaletteEditorProps = BrandPalette & {
  onChange: (patch: Partial<BrandPalette>) => void;
  compact?: boolean;
  locale?: "pt" | "es";
};

const DEFAULT_PALETTE: BrandPalette = {
  primaryColor: "#F59E0B",
  secondaryColor: "#FCD34D",
  backgroundColor: "#F4F6F9",
};

const PALETTES: Array<{ name: string; colors: BrandPalette }> = [
  { name: "Solar", colors: DEFAULT_PALETTE },
  { name: "Oceano", colors: { primaryColor: "#0E7490", secondaryColor: "#38BDF8", backgroundColor: "#F0F9FF" } },
  { name: "Floresta", colors: { primaryColor: "#166534", secondaryColor: "#84CC16", backgroundColor: "#F7FEE7" } },
  { name: "Premium", colors: { primaryColor: "#1E293B", secondaryColor: "#D4A853", backgroundColor: "#F8F5EE" } },
];

const COPY = {
  pt: {
    roles: [
      { key: "primaryColor", label: "Marca principal", hint: "Botões, links e ações principais" },
      { key: "secondaryColor", label: "Marca secundária", hint: "Destaques, selos e detalhes" },
      { key: "backgroundColor", label: "Fundo da marca", hint: "Seções claras e áreas de apoio" },
    ],
    quick: "Paletas rápidas",
    restore: "Restaurar padrão",
    saved: "Salvo automaticamente e compartilhado entre a Fábrica, os anúncios e todos os modelos de site.",
    select: "Selecionar",
    hex: "Código hexadecimal de",
    sectionHint: "Esta mudança vale somente para o fundo selecionado.",
    useColor: "Usar a cor",
    modelDefault: "Usar padrão do modelo",
    paletteNames: { Solar: "Solar", Oceano: "Oceano", Floresta: "Floresta", Premium: "Premium" },
  },
  es: {
    roles: [
      { key: "primaryColor", label: "Marca principal", hint: "Botones, enlaces y acciones principales" },
      { key: "secondaryColor", label: "Marca secundaria", hint: "Destacados, sellos y detalles" },
      { key: "backgroundColor", label: "Fondo de la marca", hint: "Secciones claras y áreas de apoyo" },
    ],
    quick: "Paletas rápidas",
    restore: "Restaurar predeterminado",
    saved: "Guardado automáticamente y compartido entre la Fábrica, los anuncios y todos los modelos del sitio.",
    select: "Seleccionar",
    hex: "Código hexadecimal de",
    sectionHint: "Este cambio se aplica solamente al fondo seleccionado.",
    useColor: "Usar el color",
    modelDefault: "Usar el valor del modelo",
    paletteNames: { Solar: "Solar", Oceano: "Océano", Floresta: "Bosque", Premium: "Premium" },
  },
} as const;

type ColorRole = { key: keyof BrandPalette; label: string; hint: string };

const normalizeHex = (value: string) => {
  const clean = value.trim().toUpperCase();
  const prefixed = clean.startsWith("#") ? clean : `#${clean}`;
  return /^#[0-9A-F]{6}$/.test(prefixed) ? prefixed : null;
};

function ColorRoleField({
  role,
  value,
  onChange,
  compact = false,
  locale = "pt",
}: {
  role: ColorRole;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  locale?: "pt" | "es";
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    const normalized = normalizeHex(draft);
    if (normalized) {
      setDraft(normalized);
      onChange(normalized);
    } else {
      setDraft(value);
    }
  };

  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.035] ${compact ? "p-2.5" : "p-3"}`}>
      <div className="mb-2 min-w-0">
        <div className="truncate text-[11px] font-bold text-white">{role.label}</div>
        {!compact && <div className="mt-0.5 text-[10px] leading-relaxed text-white/40">{role.hint}</div>}
      </div>
      <div className="flex items-center gap-2">
        <label
          className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full border border-white/20"
          style={{ backgroundColor: value }}
          aria-label={`${COPY[locale].select} ${role.label.toLowerCase()}`}
        >
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            aria-label={`${COPY[locale].select} ${role.label.toLowerCase()}`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <input
          value={draft}
          onChange={(event) => {
            const next = event.target.value.toUpperCase();
            setDraft(next);
            const normalized = normalizeHex(next);
            if (normalized) onChange(normalized);
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
              event.currentTarget.blur();
            }
          }}
          maxLength={7}
          spellCheck={false}
          aria-label={`${COPY[locale].hex} ${role.label.toLowerCase()}`}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-white outline-none transition-colors focus:border-white/35"
        />
      </div>
    </div>
  );
}

export function BrandPaletteEditor({
  primaryColor,
  secondaryColor,
  backgroundColor,
  onChange,
  compact = false,
  locale = "pt",
}: BrandPaletteEditorProps) {
  const current = { primaryColor, secondaryColor, backgroundColor };
  const copy = COPY[locale];
  const roles = copy.roles as readonly ColorRole[];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2.5 min-[430px]:grid-cols-3">
        {roles.map((role) => (
          <ColorRoleField
            key={role.key}
            role={role}
            value={current[role.key]}
            onChange={(value) => onChange({ [role.key]: value })}
            compact={compact}
            locale={locale}
          />
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{copy.quick}</span>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_PALETTE)}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/45 transition-colors hover:text-white"
          >
            <RotateCcw className="h-3 w-3" /> {copy.restore}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {PALETTES.map((palette) => {
            const active = roles.every((role) => current[role.key].toUpperCase() === palette.colors[role.key].toUpperCase());
            return (
              <button
                key={palette.name}
                type="button"
                onClick={() => onChange(palette.colors)}
                className={`group min-w-0 rounded-xl border p-2 text-left transition-all ${
                  active ? "border-white/45 bg-white/10" : "border-white/10 bg-white/[0.025] hover:border-white/25"
                }`}
                aria-pressed={active}
              >
                <div className="mb-2 flex overflow-hidden rounded-md border border-black/10">
                  {roles.map((role) => (
                    <span key={role.key} className="h-5 flex-1" style={{ backgroundColor: palette.colors[role.key] }} />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-1 text-[9px] font-semibold text-white/65 min-[430px]:text-[10px]">
                  <span className="truncate">{copy.paletteNames[palette.name as keyof typeof copy.paletteNames]}</span>
                  {active && <Check className="h-3 w-3 text-emerald-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] leading-relaxed text-white/35">
        {copy.saved}
      </p>
    </div>
  );
}

export function SectionBackgroundEditor({
  label,
  value,
  paletteColors,
  onChange,
  onReset,
  locale = "pt",
}: {
  label: string;
  value: string;
  paletteColors: string[];
  onChange: (value: string) => void;
  onReset: () => void;
  locale?: "pt" | "es";
}) {
  const copy = COPY[locale];
  return (
    <div className="space-y-3">
      <ColorRoleField
        role={{ key: "backgroundColor", label, hint: copy.sectionHint }}
        value={value}
        onChange={onChange}
        locale={locale}
      />
      <div className="flex flex-wrap items-center gap-2">
        {paletteColors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="h-9 w-9 rounded-full border border-white/20 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/60"
            style={{ backgroundColor: color }}
            aria-label={`${copy.useColor} ${color}`}
          />
        ))}
        <button
          type="button"
          onClick={onReset}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[10px] font-semibold text-white/55 transition-colors hover:border-white/25 hover:text-white"
        >
          <RotateCcw className="h-3 w-3" /> {copy.modelDefault}
        </button>
      </div>
    </div>
  );
}
