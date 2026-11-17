// Projetos de arte da Fábrica, para reabrir e continuar depois.
// Duas camadas:
// 1) o aparelho (IndexedDB): salva na hora, funciona sem internet;
// 2) a conta (tabela fabrica_artes_projetos): abre em qualquer aparelho. As imagens não vão dentro do
//    projeto: sobem para o armazenamento (thumbnails/sites/<usuário>/assets) e o projeto guarda o endereço.
// Enquanto a tabela não existe no banco (migração 20261116120000), fica só no aparelho, sem erro.
import { supabase } from "@/integrations/supabase/client";

export interface ProjetoArte {
  id: string;
  nome: string;
  destino: string;
  criadoEm: number;
  atualizadoEm: number;
  /** miniatura da primeira página (endereço ou data URL pequena) */
  capa: string;
  /** páginas: o estado do editor de cada uma (JSON) */
  paginas: unknown[];
  /** true quando a última versão também está na conta */
  naConta?: boolean;
}

const DB = "cv-artes-projetos";
const LOJA = "projetos";
// vídeos que a pessoa enviou: o endereço blob: some quando a página fecha, então o arquivo fica guardado aqui
const MIDIAS = "midias";
const MARCA_MIDIA = "cvmidia:";
const MAXIMO = 60;
const TABELA = "fabrica_artes_projetos";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

function abrir(): Promise<IDBDatabase> {
  return new Promise((ok, erro) => {
    if (!("indexedDB" in window)) return erro(new Error("Este navegador não guarda projetos."));
    const req = indexedDB.open(DB, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(LOJA)) db.createObjectStore(LOJA, { keyPath: "id" }).createIndex("atualizadoEm", "atualizadoEm");
      if (!db.objectStoreNames.contains(MIDIAS)) db.createObjectStore(MIDIAS);
    };
    req.onsuccess = () => ok(req.result);
    req.onerror = () => erro(req.error || new Error("Não consegui abrir os projetos."));
  });
}

function pedir<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((ok, erro) => {
    r.onsuccess = () => ok(r.result);
    r.onerror = () => erro(r.error || new Error("Falha nos projetos."));
  });
}

// ——— vídeos enviados ———
const idDoBlob = new Map<string, string>();
async function guardarMidia(url: string): Promise<string> {
  const pronto = idDoBlob.get(url);
  if (pronto) return MARCA_MIDIA + pronto;
  const blob = await (await fetch(url)).blob();
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const db = await abrir();
  await pedir(db.transaction(MIDIAS, "readwrite").objectStore(MIDIAS).put(blob, id));
  db.close();
  idDoBlob.set(url, id);
  return MARCA_MIDIA + id;
}
async function lerMidia(id: string): Promise<Blob | null> {
  try {
    const db = await abrir();
    const b = (await pedir(db.transaction(MIDIAS, "readonly").objectStore(MIDIAS).get(id))) as Blob | undefined;
    db.close();
    return b || null;
  } catch { return null; }
}
async function trocarTextos(valor: unknown, f: (s: string) => Promise<string>): Promise<unknown> {
  if (typeof valor === "string") return f(valor);
  if (Array.isArray(valor)) return Promise.all(valor.map((v) => trocarTextos(v, f)));
  if (valor && typeof valor === "object") {
    const pares = await Promise.all(Object.entries(valor).map(async ([k, v]) => [k, await trocarTextos(v, f)] as const));
    return Object.fromEntries(pares);
  }
  return valor;
}
/** Antes de guardar: troca os blob: (vídeos enviados) por uma marca que aponta para o arquivo guardado no aparelho. */
const comMidiasGuardadas = (paginas: unknown[]) =>
  trocarTextos(paginas, async (s) => (s.startsWith("blob:") ? guardarMidia(s).catch(() => s) : s)) as Promise<unknown[]>;
/** Ao abrir: troca a marca pelo arquivo de novo. O que não estiver neste aparelho continua com a marca (o editor avisa). */
const comMidiasAbertas = (paginas: unknown[]) =>
  trocarTextos(paginas, async (s) => {
    if (!s.startsWith(MARCA_MIDIA)) return s;
    const id = s.slice(MARCA_MIDIA.length);
    const b = await lerMidia(id);
    if (!b) return s;
    const url = URL.createObjectURL(b);
    idDoBlob.set(url, id);
    return url;
  }) as Promise<unknown[]>;
/** true quando o endereço é de um vídeo enviado que não está neste aparelho */
export const midiaFaltando = (s: unknown) => typeof s === "string" && s.startsWith(MARCA_MIDIA);

export const novoIdProjeto = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

async function gravarLocal(item: ProjetoArte) {
  const db = await abrir();
  const loja = db.transaction(LOJA, "readwrite").objectStore(LOJA);
  await pedir(loja.put(item));
  const todos = (await pedir(loja.getAll())) as ProjetoArte[];
  if (todos.length > MAXIMO) {
    todos.sort((a, b) => a.atualizadoEm - b.atualizadoEm).slice(0, todos.length - MAXIMO).forEach((v) => loja.delete(v.id));
  }
  db.close();
}

async function lerLocal(id: string): Promise<ProjetoArte | null> {
  try {
    const db = await abrir();
    const p = (await pedir(db.transaction(LOJA, "readonly").objectStore(LOJA).get(id))) as ProjetoArte | undefined;
    db.close();
    return p || null;
  } catch { return null; }
}

async function listarLocal(): Promise<ProjetoArte[]> {
  try {
    const db = await abrir();
    const lista = (await pedir(db.transaction(LOJA, "readonly").objectStore(LOJA).getAll())) as ProjetoArte[];
    db.close();
    return lista;
  } catch { return []; }
}

// ——— conta ———
async function usuario(): Promise<string | null> {
  try { const { data } = await sb.auth.getSession(); return data?.session?.user?.id || null; } catch { return null; }
}
const faltaTabela = (e: { code?: string; message?: string } | null) =>
  !!e && (["42P01", "PGRST205", "PGRST202"].includes(e.code || "") || /does not exist|could not find/i.test(e.message || ""));

const IMAGEM = /^data:image\/(png|jpeg|webp);base64,/;
const subidas = new Map<string, string>();

async function resumo(texto: string) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 24);
}

/** Sobe uma imagem data: para o armazenamento da conta e devolve o endereço público (a mesma imagem sobe uma vez só). */
async function subirImagem(dataUrl: string, uid: string): Promise<string> {
  const chave = await resumo(dataUrl);
  const pronta = subidas.get(chave);
  if (pronta) return pronta;
  const tipo = dataUrl.slice(5, dataUrl.indexOf(";"));
  const ext = tipo === "image/jpeg" ? "jpg" : tipo.split("/")[1];
  const caminho = `sites/${uid}/assets/arte-${chave}.${ext}`;
  const blob = await (await fetch(dataUrl)).blob();
  const { error } = await sb.storage.from("thumbnails").upload(caminho, blob, { contentType: tipo, upsert: false, cacheControl: "31536000" });
  if (error && !/exist|duplicate/i.test(error.message || "")) throw error;
  const url: string = sb.storage.from("thumbnails").getPublicUrl(caminho).data.publicUrl;
  subidas.set(chave, url);
  return url;
}

/** Troca, em qualquer ponto do projeto, as imagens data: (pesadas) pelo endereço no armazenamento. */
async function subirVideo(origem: string, uid: string): Promise<string> {
  const pronta = subidas.get(origem);
  if (pronta) return pronta;
  const blob = origem.startsWith(MARCA_MIDIA) ? await lerMidia(origem.slice(MARCA_MIDIA.length)) : await (await fetch(origem)).blob();
  if (!blob || blob.size > 45 * 1024 * 1024) return origem;
  const tipo = blob.type || "video/mp4";
  const ext = tipo.includes("webm") ? "webm" : tipo.includes("quicktime") ? "mov" : "mp4";
  const caminho = `sites/${uid}/assets/video-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await sb.storage.from("thumbnails").upload(caminho, blob, { contentType: tipo, upsert: false, cacheControl: "31536000" });
  if (error) { console.warn("vídeo não subiu para a conta:", error.message); return origem; }
  const url: string = sb.storage.from("thumbnails").getPublicUrl(caminho).data.publicUrl;
  subidas.set(origem, url);
  return url;
}

async function semImagensPesadas(valor: unknown, uid: string): Promise<unknown> {
  if (typeof valor === "string") {
    if (valor.startsWith("blob:") || valor.startsWith(MARCA_MIDIA)) return subirVideo(valor, uid).catch(() => valor);
    return IMAGEM.test(valor) && valor.length > 1500 ? subirImagem(valor, uid) : valor;
  }
  if (Array.isArray(valor)) return Promise.all(valor.map((v) => semImagensPesadas(v, uid)));
  if (valor && typeof valor === "object") {
    const pares = await Promise.all(Object.entries(valor).map(async ([k, v]) => [k, await semImagensPesadas(v, uid)] as const));
    return Object.fromEntries(pares);
  }
  return valor;
}

/** Para quem guarda artes na conta (link, projeto): troca as imagens pesadas pelo endereço no armazenamento. */
export async function levesParaConta<T>(valor: T): Promise<T> {
  const uid = await usuario();
  return uid ? ((await semImagensPesadas(valor, uid)) as T) : valor;
}

async function enviarParaConta(item: ProjetoArte): Promise<boolean> {
  const uid = await usuario();
  if (!uid) return false;
  try {
    const dados = await semImagensPesadas(item.paginas, uid);
    const capa = (await semImagensPesadas(item.capa, uid)) as string;
    const { error } = await sb.from(TABELA).upsert({
      id: item.id, dono: uid, nome: item.nome, destino: item.destino, capa, dados,
      criado_em: new Date(item.criadoEm).toISOString(), atualizado_em: new Date(item.atualizadoEm).toISOString(),
    });
    if (error) { if (!faltaTabela(error)) console.warn("projeto não foi para a conta:", error.message); return false; }
    return true;
  } catch (e) {
    console.warn("projeto não foi para a conta:", e);
    return false;
  }
}

/** Salva (ou atualiza) o projeto no aparelho e, com login, na conta. */
export async function salvarProjeto(p: Omit<ProjetoArte, "criadoEm" | "atualizadoEm" | "naConta"> & { criadoEm?: number }): Promise<ProjetoArte> {
  const antes = await lerLocal(p.id);
  p = { ...p, paginas: await comMidiasGuardadas(p.paginas) };
  const item: ProjetoArte = { ...p, criadoEm: antes?.criadoEm || p.criadoEm || Date.now(), atualizadoEm: Date.now(), naConta: false };
  await gravarLocal(item);
  if (await enviarParaConta(item)) {
    item.naConta = true;
    await gravarLocal(item).catch(() => null);
  }
  return item;
}

type Linha = { id: string; nome: string; destino: string; capa: string; dados?: unknown[]; criado_em: string; atualizado_em: string };
const daLinha = (r: Linha): ProjetoArte => ({
  id: r.id, nome: r.nome, destino: r.destino, capa: r.capa, paginas: r.dados || [],
  criadoEm: Date.parse(r.criado_em) || Date.now(), atualizadoEm: Date.parse(r.atualizado_em) || Date.now(), naConta: true,
});

/** Todos os projetos: os da conta e os só deste aparelho, o mais novo primeiro. */
export async function listarProjetos(): Promise<ProjetoArte[]> {
  const locais = await listarLocal();
  const porId = new Map(locais.map((p) => [p.id, p]));
  if (await usuario()) {
    const { data, error } = await sb.from(TABELA).select("id,nome,destino,capa,criado_em,atualizado_em").order("atualizado_em", { ascending: false }).limit(200);
    if (!error && Array.isArray(data)) {
      for (const r of data as Linha[]) {
        const local = porId.get(r.id);
        const nuvem = daLinha(r);
        // sem as páginas: elas só descem quando o projeto é aberto
        if (!local || nuvem.atualizadoEm > local.atualizadoEm) porId.set(r.id, { ...nuvem, paginas: local?.paginas || [] });
        else porId.set(r.id, { ...local, naConta: true });
      }
    }
  }
  return [...porId.values()].sort((a, b) => b.atualizadoEm - a.atualizadoEm);
}

/** Abre o projeto: a versão mais nova entre a do aparelho e a da conta. */
export async function lerProjeto(id: string): Promise<ProjetoArte | null> {
  const local = await lerLocal(id);
  if (await usuario()) {
    const { data, error } = await sb.from(TABELA).select("*").eq("id", id).maybeSingle();
    if (!error && data) {
      const nuvem = daLinha(data as Linha);
      if (!local || nuvem.atualizadoEm >= local.atualizadoEm) {
        await gravarLocal(nuvem).catch(() => null);
        return { ...nuvem, paginas: await comMidiasAbertas(nuvem.paginas) };
      }
    }
  }
  return local && { ...local, paginas: await comMidiasAbertas(local.paginas) };
}

export async function removerProjeto(id: string): Promise<void> {
  try {
    const db = await abrir();
    await pedir(db.transaction(LOJA, "readwrite").objectStore(LOJA).delete(id));
    db.close();
  } catch { /* segue */ }
  if (await usuario()) await sb.from(TABELA).delete().eq("id", id);
}
