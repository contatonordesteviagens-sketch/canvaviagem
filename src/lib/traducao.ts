// Tradução dos textos do vídeo (português → espanhol ou inglês).
// 1º tenta o tradutor que já vem no Chrome do computador (grátis, no próprio aparelho, nada sai daqui).
// 2º, se não houver (celular, Safari), pede ao servidor (função "traduzir-textos", IA do Lovable).
import { supabase } from "@/integrations/supabase/client";

export type IdiomaVideo = "es" | "en";
export const IDIOMAS_VIDEO: { id: IdiomaVideo; nome: string; bandeira: string }[] = [
  { id: "es", nome: "Espanhol", bandeira: "🇪🇸" },
  { id: "en", nome: "Inglês", bandeira: "🇺🇸" },
];

type TradutorChrome = { translate: (t: string) => Promise<string>; destroy?: () => void };
type ApiTradutor = {
  availability: (o: { sourceLanguage: string; targetLanguage: string }) => Promise<string>;
  create: (o: { sourceLanguage: string; targetLanguage: string; monitor?: (m: EventTarget) => void }) => Promise<TradutorChrome>;
};

const maiusculo = (t: string) => /[A-ZÀ-Ý]{2}/.test(t) && t === t.toUpperCase();

async function pelaChrome(textos: string[], para: IdiomaVideo, aoAvancar?: (p: number) => void): Promise<string[] | null> {
  const api = (globalThis as unknown as { Translator?: ApiTradutor }).Translator;
  if (!api) return null;
  try {
    const disp = await api.availability({ sourceLanguage: "pt", targetLanguage: para });
    if (disp === "unavailable") return null;
    const baixar = disp !== "available";
    // 1ª vez o Chrome baixa o idioma: mostra o avanço e desiste se ficar parado (aí vai pelo servidor)
    let parado: ReturnType<typeof setTimeout> | undefined;
    const tr = await new Promise<TradutorChrome>((ok, falha) => {
      const vigiar = () => { clearTimeout(parado); parado = setTimeout(() => falha(new Error("download do idioma parado")), 25000); };
      vigiar();
      api.create({
        sourceLanguage: "pt", targetLanguage: para,
        monitor: (m) => m.addEventListener("downloadprogress", (e) => { vigiar(); aoAvancar?.(((e as unknown as { loaded: number }).loaded || 0) * 0.5); }),
      }).then(ok, falha);
    }).finally(() => clearTimeout(parado));
    const base = baixar ? 0.5 : 0;
    const out: string[] = [];
    for (let i = 0; i < textos.length; i++) {
      const t = textos[i];
      // maiúsculas atrapalham o tradutor: traduz em minúsculas e volta para maiúsculas
      const r = maiusculo(t) ? (await tr.translate(t.toLowerCase())).toUpperCase() : await tr.translate(t);
      out.push(r);
      aoAvancar?.(base + (1 - base) * ((i + 1) / textos.length));
    }
    tr.destroy?.();
    return out;
  } catch (e) {
    console.warn("[tradução] tradutor do Chrome falhou, tentando o servidor", e);
    return null;
  }
}

async function peloServidor(textos: string[], para: IdiomaVideo): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke("traduzir-textos", { body: { textos, para } });
  if (error || !Array.isArray(data?.traducoes)) {
    console.error("[tradução] servidor", error || data);
    throw new Error(/not found|404|Failed to send/i.test(error?.message || "")
      ? "A tradução no celular ainda não está ligada. Use o Chrome no computador."
      : "Não consegui traduzir agora. Tente de novo.");
  }
  return data.traducoes as string[];
}

/** Traduz uma lista de textos (sem repetir) e devolve original → tradução. */
export async function traduzirTextos(textos: string[], para: IdiomaVideo, aoAvancar?: (p: number) => void): Promise<Map<string, string>> {
  const unicos = [...new Set(textos.map((t) => t.trim()).filter((t) => /[A-Za-zÀ-ÿ]/.test(t)))];
  if (!unicos.length) return new Map();
  const r = (await pelaChrome(unicos, para, aoAvancar)) ?? (await peloServidor(unicos, para));
  return new Map(unicos.map((t, i) => [t, (r[i] || t).trim()]));
}
