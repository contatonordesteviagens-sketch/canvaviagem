// Link da arte para a equipe (como no Canva): /anuncios/arte/<destino>-v<modelo>-<código>
// No banco: tabela fabrica_artes_compartilhadas + funções ler/salvar (migração 20261116120000).
// Enquanto a tabela não existe (ou sem login), o link fica guardado neste aparelho: serve para testar,
// mas só abre aqui. A tela avisa isso com clareza.
import { supabase } from "@/integrations/supabase/client";
import { levesParaConta } from "@/lib/biblioteca-artes";

export type Acesso = "privado" | "ver" | "editar";
export type ArteLink = {
  slug: string; nome: string; destino: string; variant: number; formato: "square" | "story";
  acesso: Acesso; capa: string; dados: unknown[]; ehDono: boolean; atualizadoEm: number; local: boolean;
};

const LOCAL = "cv-links-artes";
const DISPOSITIVO = "cv-dispositivo";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
export const novoSlug = (destino: string, variant: number) =>
  `${semAcento(destino).slice(0, 40) || "arte"}-v${variant + 1}-${Math.random().toString(36).slice(2, 7)}`;
export const urlDoLink = (slug: string) => `${window.location.origin}/anuncios/arte/${slug}`;

function meuDispositivo() {
  try {
    let id = localStorage.getItem(DISPOSITIVO);
    if (!id) { id = Math.random().toString(36).slice(2, 12); localStorage.setItem(DISPOSITIVO, id); }
    return id;
  } catch { return "este-aparelho"; }
}
type Guardado = Omit<ArteLink, "ehDono" | "local"> & { dono: string };
const lerLocais = (): Record<string, Guardado> => { try { return JSON.parse(localStorage.getItem(LOCAL) || "{}"); } catch { return {}; } };
const gravarLocais = (m: Record<string, Guardado>) => localStorage.setItem(LOCAL, JSON.stringify(m));
const faltaBanco = (e: { code?: string; message?: string } | null) =>
  !!e && (["42P01", "PGRST205", "PGRST202", "42883"].includes(e.code || "") || /does not exist|could not find/i.test(e.message || ""));

/** Cria ou atualiza o link. Devolve o código e se ficou só neste aparelho. */
export async function publicarLink(p: { slug: string; nome: string; destino: string; variant: number; formato: "square" | "story"; acesso: Acesso; capa: string; dados: unknown[] }): Promise<{ local: boolean }> {
  const { data: sessao } = await sb.auth.getSession();
  const uid: string | undefined = sessao?.session?.user?.id;
  if (uid) {
    const { error } = await sb.from("fabrica_artes_compartilhadas").upsert({
      slug: p.slug, dono: uid, nome: p.nome, destino: p.destino, variant: p.variant, formato: p.formato,
      acesso: p.acesso, capa: await levesParaConta(p.capa), dados: await levesParaConta(p.dados), atualizado_em: new Date().toISOString(),
    });
    if (!error) return { local: false };
    if (!faltaBanco(error)) throw new Error(error.message || "Não consegui criar o link.");
  }
  const m = lerLocais();
  m[p.slug] = { ...p, dono: meuDispositivo(), atualizadoEm: Date.now() };
  gravarLocais(m);
  return { local: true };
}

/** Abre a arte pelo código do link (null: não existe ou é privada de outra pessoa). */
export async function lerLink(slug: string): Promise<ArteLink | null> {
  const { data, error } = await sb.rpc("ler_arte_compartilhada", { p_slug: slug });
  if (!error && Array.isArray(data) && data[0]) {
    const r = data[0];
    return { slug: r.slug, nome: r.nome, destino: r.destino, variant: r.variant, formato: r.formato, acesso: r.acesso, capa: r.capa, dados: r.dados || [], ehDono: !!r.eh_dono, atualizadoEm: Date.parse(r.atualizado_em) || Date.now(), local: false };
  }
  const g = lerLocais()[slug];
  if (!g) return null;
  const ehDono = g.dono === meuDispositivo();
  if (g.acesso === "privado" && !ehDono) return null;
  return { ...g, ehDono, local: true };
}

/** Salva as mudanças de quem pode editar pelo link. */
export async function salvarNoLink(slug: string, dados: unknown[], capa: string): Promise<boolean> {
  const { data, error } = await sb.rpc("salvar_arte_compartilhada", { p_slug: slug, p_dados: await levesParaConta(dados), p_capa: await levesParaConta(capa) });
  if (!error) return !!data;
  const m = lerLocais();
  if (!m[slug]) return false;
  m[slug] = { ...m[slug], dados, capa, atualizadoEm: Date.now() };
  gravarLocais(m);
  return true;
}
