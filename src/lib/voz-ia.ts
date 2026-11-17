// Voz de IA grátis, gerada no próprio aparelho (Piper, código aberto). Nada vai para servidor nosso e não custa nada.
// Na primeira vez cada voz baixa uma vez (~60 MB) e fica guardada no navegador; depois sai na hora.
// Vozes em português (Brasil), espanhol, inglês, francês, italiano e alemão. O Piper não tem voz feminina em português do Brasil.
import { PATH_MAP, TtsSession, stored } from "@mintplex-labs/piper-tts-web";
// o motor (onnxruntime) vai junto com o site, na mesma versão do código (o padrão da biblioteca aponta para outra versão)
import ortMjs from "onnxruntime-web/ort-wasm-simd-threaded.mjs?url";
import ortWasm from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";
import { textoParaFala } from "@/lib/narracao";
import { prepararVoz, type VozGravada } from "@/lib/voz-gravada";

export type IdiomaIA = "pt" | "es" | "en" | "fr" | "it" | "de";
export type VozIA = { id: string; nome: string; genero: "F" | "M"; idioma: IdiomaIA; sotaque: string; mb: number };

// vozes que a biblioteca não lista: vêm do repositório oficial do Piper (mesmo site, outra pasta)
const OFICIAL = "../../../../rhasspy/piper-voices/resolve/main/";
const EXTRAS: Record<string, string> = {
  "pt_BR-cadu-medium": OFICIAL + "pt/pt_BR/cadu/medium/pt_BR-cadu-medium.onnx",
  "pt_BR-jeff-medium": OFICIAL + "pt/pt_BR/jeff/medium/pt_BR-jeff-medium.onnx",
  "es_AR-daniela-high": OFICIAL + "es/es_AR/daniela/high/es_AR-daniela-high.onnx",
};
Object.assign(PATH_MAP as Record<string, string>, EXTRAS);

export const VOZES_IA: VozIA[] = [
  { id: "pt_BR-faber-medium", nome: "Fabrício", genero: "M", idioma: "pt", sotaque: "Brasil", mb: 63 },
  { id: "pt_BR-cadu-medium", nome: "Cadu", genero: "M", idioma: "pt", sotaque: "Brasil", mb: 63 },
  { id: "pt_BR-jeff-medium", nome: "Jeff", genero: "M", idioma: "pt", sotaque: "Brasil", mb: 63 },
  { id: "pt_BR-edresson-low", nome: "Éder", genero: "M", idioma: "pt", sotaque: "Brasil", mb: 63 },
  { id: "es_AR-daniela-high", nome: "Daniela", genero: "F", idioma: "es", sotaque: "Argentina", mb: 114 },
  { id: "es_ES-davefx-medium", nome: "David", genero: "M", idioma: "es", sotaque: "Espanha", mb: 63 },
  { id: "es_MX-claude-high", nome: "Claudio", genero: "M", idioma: "es", sotaque: "México", mb: 63 },
  { id: "es_MX-ald-medium", nome: "Aldo", genero: "M", idioma: "es", sotaque: "México", mb: 63 },
  { id: "en_US-amy-medium", nome: "Amy", genero: "F", idioma: "en", sotaque: "EUA", mb: 63 },
  { id: "en_US-kristin-medium", nome: "Kristin", genero: "F", idioma: "en", sotaque: "EUA", mb: 64 },
  { id: "en_US-lessac-medium", nome: "Lessac", genero: "F", idioma: "en", sotaque: "EUA", mb: 63 },
  { id: "en_GB-alba-medium", nome: "Alba", genero: "F", idioma: "en", sotaque: "Inglaterra", mb: 63 },
  { id: "en_US-ryan-medium", nome: "Ryan", genero: "M", idioma: "en", sotaque: "EUA", mb: 63 },
  { id: "en_US-joe-medium", nome: "Joe", genero: "M", idioma: "en", sotaque: "EUA", mb: 63 },
  { id: "en_GB-alan-medium", nome: "Alan", genero: "M", idioma: "en", sotaque: "Inglaterra", mb: 63 },
  { id: "fr_FR-siwis-medium", nome: "Siwis", genero: "F", idioma: "fr", sotaque: "França", mb: 63 },
  { id: "fr_FR-tom-medium", nome: "Tom", genero: "M", idioma: "fr", sotaque: "França", mb: 63 },
  { id: "it_IT-paola-medium", nome: "Paola", genero: "F", idioma: "it", sotaque: "Itália", mb: 63 },
  { id: "it_IT-riccardo-x_low", nome: "Riccardo", genero: "M", idioma: "it", sotaque: "Itália", mb: 28 },
  { id: "de_DE-kerstin-low", nome: "Kerstin", genero: "F", idioma: "de", sotaque: "Alemanha", mb: 63 },
  { id: "de_DE-thorsten-medium", nome: "Thorsten", genero: "M", idioma: "de", sotaque: "Alemanha", mb: 63 },
];
export const IDIOMAS_IA: { id: IdiomaIA; nome: string }[] = [
  { id: "pt", nome: "Português" }, { id: "es", nome: "Espanhol" }, { id: "en", nome: "Inglês" },
  { id: "fr", nome: "Francês" }, { id: "it", nome: "Italiano" }, { id: "de", nome: "Alemão" },
];
export const vozIA = (id?: string) => VOZES_IA.find((v) => v.id === id) || VOZES_IA[0];
export const AMOSTRA: Record<IdiomaIA, string> = {
  pt: "Sua próxima viagem começa aqui. Chame no WhatsApp.",
  es: "Tu próximo viaje empieza aquí. Escríbenos por WhatsApp.",
  en: "Your next trip starts here. Message us on WhatsApp.",
  fr: "Votre prochain voyage commence ici. Écrivez-nous sur WhatsApp.",
  it: "Il tuo prossimo viaggio inizia qui. Scrivici su WhatsApp.",
  de: "Ihre nächste Reise beginnt hier. Schreiben Sie uns auf WhatsApp.",
};

/** Vozes já baixadas neste aparelho (saem na hora). */
export async function vozesBaixadas(): Promise<Set<string>> {
  try { return new Set(await stored()); } catch { return new Set(); }
}

export type Progresso = { fase: "baixando" | "gerando"; pct: number };
let fila: Promise<unknown> = Promise.resolve();

/** Gera a fala com a voz escolhida. Uma geração por vez (o motor é um só). */
export function gerarVozIA(texto: string, vozId: string, aoProgresso?: (p: Progresso) => void): Promise<VozGravada> {
  const v = vozIA(vozId);
  const falado = v.idioma === "pt" || v.idioma === "es" ? textoParaFala(texto, v.idioma === "pt" ? "pt-BR" : "es-ES") : texto;
  const tarefa = fila.then(async () => {
    if (!falado.trim()) throw new Error("Escreva o texto antes de gerar a voz.");
    // a biblioteca guarda uma sessão só e não troca de voz sozinha: começa outra quando a voz muda
    const atual = (TtsSession as unknown as { _instance: TtsSession | null })._instance;
    if (atual && atual.voiceId !== v.id) (TtsSession as unknown as { _instance: TtsSession | null })._instance = null;
    let blob: Blob;
    try {
      const sessao = await TtsSession.create({
        voiceId: v.id,
        wasmPaths: {
          onnxWasm: { mjs: ortMjs, wasm: ortWasm } as unknown as string,
          piperData: "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
          piperWasm: "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm",
        },
        progress: (p) => {
          if (p.url === "tts://inference-progress") aoProgresso?.({ fase: "gerando", pct: p.total ? p.loaded / p.total : 0 });
          else if (p.total) aoProgresso?.({ fase: "baixando", pct: p.loaded / p.total });
        },
      });
      aoProgresso?.({ fase: "gerando", pct: 0 });
      blob = await sessao.predict(falado);
    } catch (e) {
      console.error("[voz de IA]", e);
      (TtsSession as unknown as { _instance: TtsSession | null })._instance = null;
      throw new Error(navigator.onLine ? "Não consegui gerar a voz. Tente de novo." : "Sem internet para baixar a voz. Conecte e tente de novo.");
    }
    return prepararVoz(blob, "ia");
  });
  fila = tarefa.catch(() => undefined);
  return tarefa;
}
