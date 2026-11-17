// Tradução dos textos do vídeo (português → outro idioma). Grátis e automática, sem gastar IA:
// 1) o tradutor que já vem no Chrome do computador (no próprio aparelho; na 1ª vez de cada idioma o Chrome baixa o idioma);
// 2) onde ele não existe (celular, Safari, outros navegadores), o tradutor público e gratuito MyMemory.

export type IdiomaVideo = "es" | "en" | "fr" | "it" | "de";
export const IDIOMAS_VIDEO: { id: IdiomaVideo; nome: string }[] = [
  { id: "es", nome: "Espanhol" },
  { id: "en", nome: "Inglês" },
  { id: "fr", nome: "Francês" },
  { id: "it", nome: "Italiano" },
  { id: "de", nome: "Alemão" },
];

type TradutorChrome = { translate: (t: string) => Promise<string>; destroy?: () => void };
type ApiTradutor = {
  availability: (o: { sourceLanguage: string; targetLanguage: string }) => Promise<string>;
  create: (o: { sourceLanguage: string; targetLanguage: string; monitor?: (m: EventTarget) => void }) => Promise<TradutorChrome>;
};

/** Em que etapa a tradução está (para a tela explicar a espera). */
export type EtapaTraducao = "baixando" | "traduzindo";

const api = () => (globalThis as unknown as { Translator?: ApiTradutor }).Translator;
/** O aparelho tem o tradutor do Chrome? (sem ele, usa o tradutor público) */
export const temTradutorChrome = () => !!api();

/** Desiste de uma promessa que não responde (o tradutor do Chrome às vezes trava sem avisar). */
const comPrazo = <T,>(p: Promise<T>, ms: number): Promise<T> =>
  Promise.race([p, new Promise<T>((_, falha) => setTimeout(() => falha(new Error("sem resposta")), ms))]);

const maiusculo = (t: string) => /[A-ZÀ-Ý]{2}/.test(t) && t === t.toUpperCase();

/** Abre o tradutor do Chrome. Devolve null se ele não existir ou não servir. */
async function tradutorDoChrome(para: IdiomaVideo, aoAvancar?: (p: number, etapa: EtapaTraducao) => void): Promise<{ tr: TradutorChrome; baixou: boolean } | null> {
  const tradutor = api();
  if (!tradutor) return null;
  let disp = "";
  try { disp = await comPrazo(tradutor.availability({ sourceLanguage: "pt", targetLanguage: para }), 5000); } catch { return null; }
  if (disp === "unavailable") return null;
  const baixar = disp !== "available";
  if (baixar) aoAvancar?.(0.02, "baixando");
  let parado: ReturnType<typeof setTimeout> | undefined;
  try {
    const tr = await new Promise<TradutorChrome>((ok, falha) => {
      // sem nenhum sinal em 15 s, o Chrome não vai baixar (ex.: navegador embutido): usa o tradutor público
      const vigiar = (ms: number) => { clearTimeout(parado); parado = setTimeout(() => falha(new Error("parado")), ms); };
      vigiar(15000);
      tradutor.create({
        sourceLanguage: "pt", targetLanguage: para,
        monitor: (m) => m.addEventListener("downloadprogress", (e) => { vigiar(45000); aoAvancar?.(Math.max(0.02, ((e as unknown as { loaded: number }).loaded || 0) * 0.5), "baixando"); }),
      }).then(ok, falha);
    });
    return { tr, baixou: baixar };
  } catch (e) {
    console.warn("[tradução] tradutor do Chrome não abriu, usando o público", e);
    return null;
  } finally { clearTimeout(parado); }
}

/** Tradutor público e gratuito (MyMemory). Um texto por vez. */
async function traduzirPublico(t: string, para: IdiomaVideo): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=pt-BR|${para}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Não consegui traduzir agora. Confira a internet e tente de novo.");
  const j = await r.json() as { responseData?: { translatedText?: string }; responseStatus?: number | string };
  const txt = j.responseData?.translatedText || "";
  if (Number(j.responseStatus) !== 200 || !txt || /MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(txt)) throw new Error("O tradutor grátis chegou no limite de hoje. Tente amanhã ou use o Chrome do computador.");
  return txt;
}

/** Traduz uma lista de textos (sem repetir) e devolve original → tradução. */
export async function traduzirTextos(textos: string[], para: IdiomaVideo, aoAvancar?: (p: number, etapa: EtapaTraducao) => void): Promise<Map<string, string>> {
  const unicos = [...new Set(textos.map((t) => t.trim()).filter((t) => /[A-Za-zÀ-ÿ]/.test(t)))];
  if (!unicos.length) return new Map();
  let chrome = await tradutorDoChrome(para, aoAvancar);
  const base = chrome?.baixou ? 0.5 : 0;
  // se o tradutor do Chrome travar num texto, passa para o tradutor público e segue
  const um = async (t: string) => {
    if (chrome) {
      try { return await comPrazo(chrome.tr.translate(t), 15000); }
      catch (e) { console.warn("[tradução] Chrome travou, usando o público", e); chrome.tr.destroy?.(); chrome = null; }
    }
    return traduzirPublico(t, para);
  };
  const out = new Map<string, string>();
  try {
    for (let i = 0; i < unicos.length; i++) {
      const t = unicos[i];
      // maiúsculas atrapalham o tradutor: traduz em minúsculas e volta para maiúsculas
      let r = maiusculo(t) ? (await um(t.toLowerCase())).toUpperCase() : await um(t);
      // o tradutor grátis às vezes põe aspas em palavras estrangeiras (Y «RESORTS»): tira se o original não tinha
      if (r && !/[«»"“”]/.test(t)) r = r.replace(/[«»"“”]/g, "");
      out.set(t, (r || t).trim());
      aoAvancar?.(base + (1 - base) * ((i + 1) / unicos.length), "traduzindo");
    }
  } finally { chrome?.tr.destroy?.(); }
  return out;
}
