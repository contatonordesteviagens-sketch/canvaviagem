/**
 * Presets globais de ajuste fino das artes (tabela fabrica_art_tweak_presets).
 *
 * Leitura: pública (todo usuário gera a arte já ajustada).
 * Escrita: apenas admin (garantido por RLS).
 */
import { supabase } from "@/integrations/supabase/client";
import { artTweakPresetKey, type ArtTweakMap } from "@/lib/fabrica-art-tweaks";

let cache: Record<string, ArtTweakMap> = {};
let loaded = false;
let inflight: Promise<void> | null = null;

export async function loadArtTweakPresets(force = false): Promise<void> {
  if (loaded && !force) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("fabrica_art_tweak_presets")
        .select("category, variant, format, tweaks");
      if (error) throw error;
      const next: Record<string, ArtTweakMap> = {};
      (data || []).forEach((row: any) => {
        next[artTweakPresetKey(row.category, row.variant, row.format)] = (row.tweaks || {}) as ArtTweakMap;
      });
      cache = next;
      loaded = true;
    } catch (err) {
      // Falha de rede não pode impedir a geração das artes.
      console.warn("[art-tweaks] falha ao carregar presets", err);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function getArtTweakPreset(
  category: string,
  variant: number | undefined,
  format: string,
): ArtTweakMap | undefined {
  if (typeof variant !== "number") return undefined;
  return cache[artTweakPresetKey(category, variant, format)];
}

export async function saveArtTweakPreset(
  category: string,
  variant: number,
  format: string,
  tweaks: ArtTweakMap,
): Promise<void> {
  const { error } = await (supabase as any)
    .from("fabrica_art_tweak_presets")
    .upsert(
      { category, variant, format, tweaks, updated_at: new Date().toISOString() },
      { onConflict: "category,variant,format" },
    );
  if (error) throw error;
  cache[artTweakPresetKey(category, variant, format)] = tweaks;
  loaded = true;
}

export async function deleteArtTweakPreset(
  category: string,
  variant: number,
  format: string,
): Promise<void> {
  const { error } = await (supabase as any)
    .from("fabrica_art_tweak_presets")
    .delete()
    .eq("category", category)
    .eq("variant", variant)
    .eq("format", format);
  if (error) throw error;
  delete cache[artTweakPresetKey(category, variant, format)];
}
