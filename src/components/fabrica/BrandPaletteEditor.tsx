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

const ROLES: Array<{ key: keyof BrandPalette; label: string; hint: string }> = [
  { key: "primaryColor", label: "Marca principal", hint: "Botões, links e ações principais" },
  { key: "secondaryColor", label: "Marca secundária", hint: "Destaques, selos e detalhes" },
  { key: "backgroundColor", label: "Fundo da marca", hint: "Seções claras e áreas de apoio" },
];

const normalizeHex = (value: string) => {
  const clean = value.trim().toUpperCase();
  const prefixed = clean.startsWith("#") ? clean : `#${clean}`;
  return /^#[0-9A-F]{6}$/.test(prefixed) ? prefixed : null;
};

function ColorRoleField({
  role,
  value,
  onChange,
}: {
  role: (typeof ROLES)[number];
  value: string;
  onChange: (value: string) => void;
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
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <div className="mb-2">
        <div className="text-xs font-bold text-white">{role.label}</div>
        <div className="mt-0.5 text-[10px] leading-relaxed text-white/40">{role.hint}</div>
      </div>
      <div className="flex items-center gap-2">
        <label
          className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/15"
          style={{ backgroundColor: value }}
          aria-label={`Selecionar ${role.label.toLowerCase()}`}
        >
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
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
          aria-label={`Código hexadecimal de ${role.label.toLowerCase()}`}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white outline-none transition-colors focus:border-white/35"
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
}: BrandPaletteEditorProps) {
  const current = { primaryColor, secondaryColor, backgroundColor };

  return (
    <div className="space-y-4">
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>
        {ROLES.map((role) => (
          <ColorRoleField
            key={role.key}
            role={role}
            value={current[role.key]}
            onChange={(value) => onChange({ [role.key]: value })}
          />
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Paletas rápidas</span>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_PALETTE)}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/45 transition-colors hover:text-white"
          >
            <RotateCcw className="h-3 w-3" /> Restaurar padrão
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PALETTES.map((palette) => {
            const active = ROLES.every((role) => current[role.key].toUpperCase() === palette.colors[role.key].toUpperCase());
            return (
              <button
                key={palette.name}
                type="button"
                onClick={() => onChange(palette.colors)}
                className={`group rounded-xl border p-2 text-left transition-all ${
                  active ? "border-white/45 bg-white/10" : "border-white/10 bg-white/[0.025] hover:border-white/25"
                }`}
                aria-pressed={active}
              >
                <div className="mb-2 flex overflow-hidden rounded-md border border-black/10">
                  {ROLES.map((role) => (
                    <span key={role.key} className="h-5 flex-1" style={{ backgroundColor: palette.colors[role.key] }} />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-white/65">
                  <span>{palette.name}</span>
                  {active && <Check className="h-3 w-3 text-emerald-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] leading-relaxed text-white/35">
        Esta paleta é compartilhada entre a Fábrica, os anúncios e os dois modelos de site. Você pode alterar cada peça depois sem perder o padrão da marca.
      </p>
    </div>
  );
}
