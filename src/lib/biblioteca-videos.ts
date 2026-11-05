// Biblioteca de vídeos prontos, guardada no próprio aparelho (IndexedDB).
// Os arquivos são grandes (10 a 16 MB cada); o registro de que foram gerados vai para o banco à parte.

export interface VideoSalvo {
  id: string;
  nome: string;
  destino: string;
  estilo: number;
  ocasiao: string;
  criadoEm: number;
  tamanho: number;
  blob: Blob;
  capa: string; // data URL pequena
}

const DB = "cv-videos-prontos";
const LOJA = "videos";
const MAXIMO = 30;

function abrir(): Promise<IDBDatabase> {
  return new Promise((ok, erro) => {
    if (!("indexedDB" in window)) return erro(new Error("Este navegador não guarda vídeos."));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(LOJA)) db.createObjectStore(LOJA, { keyPath: "id" }).createIndex("criadoEm", "criadoEm");
    };
    req.onsuccess = () => ok(req.result);
    req.onerror = () => erro(req.error || new Error("Não consegui abrir a biblioteca."));
  });
}

function pedir<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((ok, erro) => {
    r.onsuccess = () => ok(r.result);
    r.onerror = () => erro(r.error || new Error("Falha na biblioteca."));
  });
}

export async function salvarVideo(v: Omit<VideoSalvo, "id" | "criadoEm">): Promise<VideoSalvo> {
  const db = await abrir();
  const item: VideoSalvo = { ...v, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, criadoEm: Date.now() };
  const tx = db.transaction(LOJA, "readwrite");
  await pedir(tx.objectStore(LOJA).put(item));
  // mantém só os mais recentes, para não lotar o aparelho
  const todos = await pedir(tx.objectStore(LOJA).index("criadoEm").getAllKeys());
  if (todos.length > MAXIMO) {
    const antigos = (await pedir(tx.objectStore(LOJA).index("criadoEm").getAll())).sort((a, b) => a.criadoEm - b.criadoEm).slice(0, todos.length - MAXIMO);
    for (const a of antigos) tx.objectStore(LOJA).delete(a.id);
  }
  db.close();
  return item;
}

export async function listarVideos(): Promise<VideoSalvo[]> {
  try {
    const db = await abrir();
    const lista = await pedir(db.transaction(LOJA, "readonly").objectStore(LOJA).getAll());
    db.close();
    return lista.sort((a, b) => b.criadoEm - a.criadoEm);
  } catch {
    return [];
  }
}

export async function removerVideo(id: string): Promise<void> {
  const db = await abrir();
  await pedir(db.transaction(LOJA, "readwrite").objectStore(LOJA).delete(id));
  db.close();
}

export async function contarVideos(): Promise<number> {
  try {
    const db = await abrir();
    const n = await pedir(db.transaction(LOJA, "readonly").objectStore(LOJA).count());
    db.close();
    return n;
  } catch {
    return 0;
  }
}
