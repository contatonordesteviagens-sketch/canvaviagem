// Busca de fotos do Anúncio: corrige o destino digitado pela metade ("Pari" → "Paris"),
// junta duas buscas para trazer mais variedade e sugere palavras ligadas ao destino.
import { supabase } from "@/integrations/supabase/client";

export type SearchPhoto = { id: string | number; url: string; thumb: string; alt?: string };

const RELATED: Record<string, { name: string; terms: string[] }> = {
  paris: { name: "Paris", terms: ["Torre Eiffel", "Museu do Louvre", "Montmartre Paris", "Arco do Triunfo"] },
  "rio de janeiro": { name: "Rio de Janeiro", terms: ["Cristo Redentor", "Pão de Açúcar", "Copacabana", "Ipanema"] },
  "fernando de noronha": { name: "Fernando de Noronha", terms: ["Morro Dois Irmãos", "Baía do Sancho", "Noronha mergulho"] },
  maragogi: { name: "Maragogi", terms: ["Galés de Maragogi", "Maragogi praia", "Alagoas piscinas naturais"] },
  gramado: { name: "Gramado", terms: ["Canela Rio Grande do Sul", "Serra Gaúcha", "Gramado inverno"] },
  jericoacoara: { name: "Jericoacoara", terms: ["Pedra Furada Jericoacoara", "Lagoa do Paraíso", "Jericoacoara dunas"] },
  "porto de galinhas": { name: "Porto de Galinhas", terms: ["Piscinas naturais Porto de Galinhas", "Pernambuco praia"] },
  bonito: { name: "Bonito", terms: ["Bonito Mato Grosso do Sul", "Gruta do Lago Azul", "Flutuação rio Bonito"] },
  buzios: { name: "Búzios", terms: ["Armação dos Búzios", "Praia de Geribá", "Rua das Pedras Búzios"] },
  cancun: { name: "Cancún", terms: ["Chichén Itzá", "Tulum", "Isla Mujeres", "Cancún resort"] },
  "punta cana": { name: "Punta Cana", terms: ["Bávaro praia", "República Dominicana praia", "Punta Cana resort"] },
  orlando: { name: "Orlando", terms: ["Orlando Florida", "Orlando parques", "Disney World"] },
  lisboa: { name: "Lisboa", terms: ["Torre de Belém", "Alfama Lisboa", "Sintra Portugal", "Elétrico de Lisboa"] },
  santiago: { name: "Santiago", terms: ["Santiago Chile", "Valle Nevado", "Valparaíso Chile"] },
  bariloche: { name: "Bariloche", terms: ["Lago Nahuel Huapi", "Cerro Catedral", "Bariloche neve"] },
  maldivas: { name: "Maldivas", terms: ["Maldives overwater", "Maldivas resort", "Maldivas praia"] },
};

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const distance = (a: string, b: string) => {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = row;
  }
  return prev[b.length];
};

/** Devolve o nome conhecido do destino, ou null quando não reconhece o texto. */
export function matchKnownDestination(query: string, extra: string[] = []): string | null {
  const q = fold(query);
  if (q.length < 3) return null;
  const names = [...Object.values(RELATED).map((r) => r.name), ...extra];
  const unique = [...new Map(names.map((n) => [fold(n), n])).entries()];
  const exact = unique.find(([f]) => f === q);
  if (exact) return exact[1];
  const prefix = unique.filter(([f]) => f.startsWith(q));
  if (prefix.length === 1) return prefix[0][1];
  if (q.length >= 4) {
    const near = unique.filter(([f]) => distance(f, q) === 1);
    if (near.length === 1) return near[0][1];
  }
  return null;
}

export function relatedPhotoTerms(destination: string, isEs = false): string[] {
  const d = destination.trim();
  if (!d) return [];
  const known = RELATED[fold(d)];
  if (known) return known.terms;
  return isEs
    ? [`${d} lugares turísticos`, `${d} centro histórico`, `${d} paisaje`, `${d} hotel`]
    : [`${d} pontos turísticos`, `${d} centro histórico`, `${d} paisagem`, `${d} hotel`];
}

const invoke = async (query: string, perPage: number, engine: string, page: number): Promise<SearchPhoto[]> => {
  const { data, error } = await supabase.functions.invoke("fabrica-search-photos", { body: { query, perPage, engine, page } });
  if (error) throw error;
  return (data?.photos as SearchPhoto[]) || [];
};

/** A busca principal manda; a segunda (palavra ligada ao destino) só acrescenta o que ainda não veio. */
export async function fetchDestinationPhotos(query: string, engine: string, page = 1): Promise<SearchPhoto[]> {
  const extraTerm = relatedPhotoTerms(query)[0];
  const [main, extra] = await Promise.all([
    invoke(query, 24, engine, page),
    extraTerm ? invoke(extraTerm, 12, engine, page).catch(() => [] as SearchPhoto[]) : Promise.resolve([] as SearchPhoto[]),
  ]);
  const seen = new Set<string>();
  return [...main, ...extra].filter((p) => {
    const key = String(p.url || p.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
