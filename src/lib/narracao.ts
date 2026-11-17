/** Narração dos vídeos: vozes grátis (Azure Speech, faixa gratuita de 500 mil letras por mês), roteiro feito
 *  a partir das cenas, texto pronto para falar (números e siglas por extenso), revisor de pronúncia e de tempo,
 *  e o pedido da voz ao servidor (função "narrar"). A chave da voz fica só no servidor. */
import { supabase } from "@/integrations/supabase/client";

export type Idioma = "pt-BR" | "es-ES";
export type Tom = "alegre" | "normal" | "calmo";
export type Voz = { id: string; nome: string; genero: "F" | "M"; idioma: Idioma; jeito: string };
export type Narracao = { ligada: boolean; voz: string; vel: number; tom: Tom; legendas: boolean };

/** 8 vozes neurais: 2 femininas e 2 masculinas em cada idioma */
export const VOZES: Voz[] = [
  { id: "pt-BR-FranciscaNeural", nome: "Francisca", genero: "F", idioma: "pt-BR", jeito: "Clara e simpática" },
  { id: "pt-BR-ThalitaNeural", nome: "Thalita", genero: "F", idioma: "pt-BR", jeito: "Jovem e animada" },
  { id: "pt-BR-AntonioNeural", nome: "Antonio", genero: "M", idioma: "pt-BR", jeito: "Firme, de locutor" },
  { id: "pt-BR-DonatoNeural", nome: "Donato", genero: "M", idioma: "pt-BR", jeito: "Calmo e próximo" },
  { id: "es-ES-ElviraNeural", nome: "Elvira", genero: "F", idioma: "es-ES", jeito: "Clara (Espanha)" },
  { id: "es-ES-XimenaNeural", nome: "Ximena", genero: "F", idioma: "es-ES", jeito: "Jovem (Espanha)" },
  { id: "es-ES-AlvaroNeural", nome: "Álvaro", genero: "M", idioma: "es-ES", jeito: "Firme (Espanha)" },
  { id: "es-ES-ArnauNeural", nome: "Arnau", genero: "M", idioma: "es-ES", jeito: "Calmo (Espanha)" },
];
export const vozDe = (id: string | undefined) => VOZES.find((v) => v.id === id) || VOZES[0];
export const NARRACAO_PADRAO: Narracao = { ligada: false, voz: VOZES[0].id, vel: 1.1, tom: "alegre", legendas: true };
/** O tom muda a altura e o ritmo da voz (funciona em todas as vozes). */
export const TONS: Record<Tom, { nome: string; pitch: string; ritmo: number }> = {
  alegre: { nome: "Alegre", pitch: "+6%", ritmo: 1.04 },
  normal: { nome: "Normal", pitch: "+0%", ritmo: 1 },
  calmo: { nome: "Calmo", pitch: "-5%", ritmo: 0.94 },
};

// ---------- números por extenso ----------
const UNI = { "pt-BR": ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"],
  "es-ES": ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"] };
const DEZ = { "pt-BR": ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"],
  "es-ES": ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"] };
const CEN = { "pt-BR": ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"],
  "es-ES": ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"] };
const VEINTI = ["veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];

function ate999(n: number, l: Idioma): string {
  const e = l === "pt-BR" ? " e " : " y ";
  if (n < 20) return UNI[l][n];
  if (n < 100) {
    if (l === "es-ES" && n < 30) return VEINTI[n - 20];
    const d = Math.floor(n / 10), u = n % 10;
    return DEZ[l][d] + (u ? e + UNI[l][u] : "");
  }
  if (n === 100) return l === "pt-BR" ? "cem" : "cien";
  const c = Math.floor(n / 100), r = n % 100;
  return CEN[l][c] + (r ? (l === "pt-BR" ? " e " : " ") + ate999(r, l) : "");
}
/** 1299 -> "mil duzentos e noventa e nove" (até 999 milhões) */
export function porExtenso(n: number, l: Idioma): string {
  n = Math.floor(Math.abs(n));
  if (n < 1000) return ate999(n, l);
  const pt = l === "pt-BR";
  const partes: string[] = [];
  const mi = Math.floor(n / 1e6), mil = Math.floor((n % 1e6) / 1000), r = n % 1000;
  if (mi) partes.push(mi === 1 ? (pt ? "um milhão" : "un millón") : `${ate999(mi, l)} ${pt ? "milhões" : "millones"}`);
  if (mil) partes.push(mil === 1 ? "mil" : `${ate999(mil, l).replace(/^uno$/, "un").replace(/ uno$/, " un")} mil`);
  if (r) partes.push(ate999(r, l));
  // português: "mil e duzentos" quando o resto é redondo ou menor que 100
  if (pt && r && (r < 100 || r % 100 === 0) && partes.length > 1) return partes.slice(0, -1).join(" ") + " e " + partes[partes.length - 1];
  return partes.join(" ");
}

const valor = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
function dinheiro(inteiro: number, centavos: number, l: Idioma, moeda: "real" | "euro" | "dolar"): string {
  const pt = l === "pt-BR";
  const nomes = { real: pt ? ["real", "reais"] : ["real", "reales"], euro: ["euro", "euros"], dolar: pt ? ["dólar", "dólares"] : ["dólar", "dólares"] }[moeda];
  let s = `${porExtenso(inteiro, l)} ${inteiro === 1 ? nomes[0] : nomes[1]}`;
  if (!pt) s = s.replace(/^uno /, "un ");
  if (centavos) s += `${pt ? " e " : " con "}${porExtenso(centavos, l)} ${pt ? (centavos === 1 ? "centavo" : "centavos") : centavos === 1 ? "céntimo" : "céntimos"}`;
  return s;
}

/** Siglas que se leem letra por letra (o resto em maiúsculas vira palavra normal). */
const SIGLAS = new Set(["CVC", "PIX", "USA", "EUA", "CNPJ", "CPF", "VIP", "TV", "SPA"]);
/** Palavras em inglês comuns em anúncio de viagem: troca pelo jeito que se fala (ou pela palavra no idioma). */
const TROCAS: Record<Idioma, [RegExp, string][]> = {
  "pt-BR": [[/\ball[ -]?inclusive\b/gi, "tudo incluído"], [/\btransfers?\b/gi, "traslado"], [/\bcheck[ -]?in\b/gi, "chequín"], [/\bcheck[ -]?out\b/gi, "checaute"], [/\bwhats ?app\b/gi, "uótsap"], [/\binstagram\b/gi, "instagrã"], [/\bresorts?\b/gi, "rizórt"], [/\bcity ?tour\b/gi, "passeio pela cidade"], [/\bfree\b/gi, "grátis"], [/\bonline\b/gi, "onláine"]],
  "es-ES": [[/\ball[ -]?inclusive\b/gi, "todo incluido"], [/\btransfers?\b/gi, "traslado"], [/\bcheck[ -]?in\b/gi, "registro"], [/\bwhats ?app\b/gi, "guasap"], [/\bresorts?\b/gi, "resort"], [/\bcity ?tour\b/gi, "paseo por la ciudad"], [/\bonline\b/gi, "en línea"]],
};

/** Deixa o texto pronto para a voz: dinheiro, números, parcelas, abreviações, símbolos e siglas por extenso. */
export function textoParaFala(texto: string, l: Idioma): string {
  const pt = l === "pt-BR";
  let s = " " + texto + " ";
  s = s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, " "); // emojis
  for (const [re, por] of TROCAS[l]) s = s.replace(re, por);
  // dinheiro: R$ 1.299,90 / € 899 / US$ 50
  s = s.replace(/(R\$|US\$|€|\$)\s?(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?/g, (_m, sim: string, int: string, cent?: string) =>
    " " + dinheiro(valor(int), cent ? Number(cent.padEnd(2, "0")) : 0, l, sim === "€" ? "euro" : sim === "R$" ? "real" : "dolar") + " ");
  s = s.replace(/(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?\s?(€|euros?)/gi, (_m, int: string, cent?: string) => " " + dinheiro(valor(int), cent ? Number(cent.padEnd(2, "0")) : 0, l, "euro") + " ");
  // parcelas e "3D/2N"
  s = s.replace(/(\d+)\s?x\s(sem|de|sin)\b/gi, (_m, n: string, p: string) => ` ${porExtenso(+n, l)} ${pt ? "vezes" : "cuotas"} ${p} `);
  s = s.replace(/\b(\d+)\s?x\b/gi, (_m, n: string) => ` ${porExtenso(+n, l)} ${pt ? "vezes" : "veces"} `);
  s = s.replace(/\b(\d+)\s?d\s?\/\s?(\d+)\s?n\b/gi, (_m, d: string, n: string) => pt ? ` ${porExtenso(+d, l)} dias e ${porExtenso(+n, l)} noites ` : ` ${porExtenso(+d, l)} días y ${porExtenso(+n, l)} noches `);
  s = s.replace(/\b(\d+)\s?(noites|dias|noches|días)\b/gi, (_m, n: string, p: string) => ` ${porExtenso(+n, l).replace(/^um$/, pt && /noite/i.test(p) ? "uma" : "um").replace(/^dois$/, pt && /noite/i.test(p) ? "duas" : "dois")} ${p} `);
  // porcentagem, ordinais, horas, km
  s = s.replace(/(\d+)\s?%/g, (_m, n: string) => ` ${porExtenso(+n, l)} ${pt ? "por cento" : "por ciento"} `);
  s = s.replace(/\b1º|\b1ª/g, (m) => (pt ? (m.endsWith("º") ? " primeiro " : " primeira ") : " primero "));
  s = s.replace(/\b(\d{1,2})h(\d{2})?\b/g, (_m, h: string, mm?: string) => ` ${porExtenso(+h, l)} ${pt ? (+h === 1 ? "hora" : "horas") : +h === 1 ? "hora" : "horas"}${mm && +mm ? `${pt ? " e " : " y "}${porExtenso(+mm, l)}` : ""} `);
  s = s.replace(/(\d+)\s?km\b/gi, (_m, n: string) => ` ${porExtenso(+n, l)} ${pt ? "quilômetros" : "kilómetros"} `);
  // abreviações
  const abrev: [RegExp, string][] = pt
    ? [[/\bc\/\s?/gi, "com "], [/\bp\/\s?/gi, "para "], [/\bs\/\s?/gi, "sem "], [/\bp\.?\s?p\.?\b/gi, "por pessoa"], [/\bvc\b/gi, "você"], [/\bq\b/gi, "que"], [/\bn[º°]\s?/gi, "número "], [/\bdr\.\s?/gi, "doutor "], [/\bsr\.\s?/gi, "senhor "]]
    : [[/\bc\/\s?/gi, "con "], [/\bp\/\s?/gi, "para "], [/\bs\/\s?/gi, "sin "], [/\bp\.?\s?p\.?\b/gi, "por persona"], [/\bn[º°]\s?/gi, "número "]];
  for (const [re, por] of abrev) s = s.replace(re, por);
  s = s.replace(/\s&\s/g, pt ? " e " : " y ").replace(/\s\+\s/g, pt ? " mais " : " más ");
  // números que sobraram
  s = s.replace(/\b\d{1,3}(?:\.\d{3})+\b|\b\d+\b/g, (m) => " " + porExtenso(valor(m), l) + " ");
  // símbolos de enfeite viram pausa
  s = s.replace(/\s*[|•·—–]\s*/g, ", ").replace(/[*_#~^<>{}[\]]/g, " ");
  // MAIÚSCULAS: siglas conhecidas letra a letra; o resto vira palavra normal (a voz não soletra)
  s = s.replace(/\b[A-ZÀ-Ý]{2,}\b/g, (w) => (SIGLAS.has(w) ? w.split("").join(" ") : w.charAt(0) + w.slice(1).toLowerCase()));
  s = s.replace(/\s+([,.!?;:])/g, "$1").replace(/([,.!?;:]){2,}/g, "$1").replace(/\s{2,}/g, " ").trim();
  return s;
}

// ---------- tempo ----------
/** Palavras por segundo na velocidade 1 (medido nas vozes neurais) */
const PPS: Record<Idioma, number> = { "pt-BR": 2.45, "es-ES": 2.65 };
export const palavrasDe = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);
/** Segundos que a fala leva (estimativa; a duração real vem do áudio quando a voz é gerada) */
export function tempoDaFala(texto: string, l: Idioma, vel: number, tom: Tom = "normal"): number {
  const n = palavrasDe(textoParaFala(texto, l));
  if (!n) return 0;
  const pausas = (texto.match(/[,.!?;:]/g) || []).length * 0.18;
  return n / (PPS[l] * vel * TONS[tom].ritmo) + pausas + 0.15;
}
/** Folga antes de a voz começar em cada cena, e depois que ela termina */
export const ENTRADA_VOZ = 0.25;
export const FOLGA_VOZ = 0.45;

// ---------- roteiro ----------
export type TextosCena = { titulo: string; destino: string; inclusos: string[]; preco: string; parcelas: string; soltos: string[]; livre: boolean };
const limpo = (s: string) => s.replace(/\s+/g, " ").trim();
/** Uma frase por cena, feita com o que aparece na tela (o que é falado bate com o que é mostrado). */
export function roteiroDasCenas(cenas: TextosCena[], l: Idioma, agencia = ""): string[] {
  const pt = l === "pt-BR";
  return cenas.map((c, i) => {
    const ultima = i === cenas.length - 1 && cenas.length > 1;
    // texto todo em maiúsculas vira normal (o roteiro é para ler e editar); linhas que continuam a frase se juntam
    // fora: @perfil, telefone e números de enfeite ("01", "#2", "3.")
    const soltos = c.soltos.map((t) => limpo(t.replace(/\s*[·•|]\s*/g, ", "))).filter((t) => t && !/^@|^\(?\d{2}\)?\s?\d{4,5}|^[#nº]?\d{1,2}[.)]?$/i.test(t))
      .map((t) => (t === t.toUpperCase() && /[A-ZÀ-Ý]{3}/.test(t) ? t.charAt(0) + t.slice(1).toLowerCase() : t));
    if (c.livre) {
      // junta sem ponto quando a linha seguinte continua a frase (começa minúscula ou a anterior termina em "em", "de", "para"...)
      const continua = (acc: string, x: string) => /^[a-zà-ý]/.test(x) || /^(e|y|com|con|para|por|de|da|do)\b/i.test(x) || /(?:^|\s)(em|en|de|da|do|para|com|con|no|na|a|o|e|y|por)$/i.test(acc);
      let t = soltos.reduce((acc, x, k) => (!acc ? x : (i === 0 && k === 1) || continua(acc, x) ? `${acc} ${/^[A-ZÀ-Ý](?![A-ZÀ-Ý])/.test(x) ? x.charAt(0).toLowerCase() + x.slice(1) : x}` : `${acc}. ${x}`), "").replace(/\.\s*\./g, ".");
      if (!t && i === 0 && c.destino) t = c.destino;
      if (ultima) t = t ? `${t}. ${pt ? "Chame no WhatsApp" : "Escríbenos por WhatsApp"}${agencia ? (pt ? " da " : " de ") + agencia : ""}.` : (pt ? "Chame no WhatsApp e reserve." : "Escríbenos por WhatsApp y reserva.");
      return limpo(t);
    }
    const nome = limpo(c.titulo || (c.destino ? (pt ? "Pacote " : "Paquete ") + c.destino : ""));
    const inc = c.inclusos.map(limpo).filter(Boolean).slice(0, 4);
    let t = nome;
    if (inc.length) {
      const lista = (inc.length > 1 ? inc.slice(0, -1).join(", ") + (pt ? " e " : " y ") + inc[inc.length - 1] : inc[0]).toLowerCase();
      t += t ? `, ${pt ? "com" : "con"} ${lista}` : `${pt ? "Com" : "Con"} ${lista}`;
    }
    // preço só se a pessoa colocou (nada de "consulte")
    if (c.preco && /\d/.test(c.preco)) t += `. ${pt ? "Por" : "Por"} ${c.parcelas ? c.parcelas + " " : ""}${c.preco}`;
    return limpo(t) + (t ? "." : "");
  });
}

// ---------- revisor ----------
export type AvisoFala = { nivel: "erro" | "atencao"; msg: string; cena: number; ajuste?: { dur: number } };
/** Agente revisor: confere cada fala antes de gerar a voz (tempo, espaços vazios, o que a voz vai ler errado). */
export function revisarNarracao(falas: string[], durs: number[], n: Narracao): AvisoFala[] {
  const v = vozDe(n.voz);
  const l = v.idioma;
  const pt = l === "pt-BR";
  const avisos: AvisoFala[] = [];
  falas.forEach((f, i) => {
    const txt = f.trim();
    if (!txt) return;
    const fala = tempoDaFala(txt, l, n.vel, n.tom);
    const cabe = durs[i] - ENTRADA_VOZ - 0.2;
    if (fala > cabe) avisos.push({ nivel: "erro", cena: i, msg: `Cena ${i + 1}: a fala leva ${fala.toFixed(1).replace(".", ",")} s e a cena tem ${durs[i].toFixed(1).replace(".", ",")} s. Encurte o texto ou deixe a cena mais longa.`, ajuste: { dur: Math.min(15, Math.ceil((fala + ENTRADA_VOZ + FOLGA_VOZ) * 10) / 10) } });
    else if (fala < durs[i] * 0.4 && durs[i] - fala > 2.2) avisos.push({ nivel: "atencao", cena: i, msg: `Cena ${i + 1}: sobra ${(durs[i] - fala).toFixed(1).replace(".", ",")} s em silêncio. Diminua a cena ou fale um pouco mais.`, ajuste: { dur: Math.max(2, Math.ceil((fala + ENTRADA_VOZ + FOLGA_VOZ) * 10) / 10) } });
    const falado = textoParaFala(txt, l);
    if (/\d/.test(falado)) avisos.push({ nivel: "atencao", cena: i, msg: `Cena ${i + 1}: tem número que a voz pode ler errado. Escreva por extenso.` });
    const ingles = txt.match(/\b(tour|travel|trip|sale|off|black friday|cruise|beach|hotel(?:s)? & resort)\b/gi);
    if (ingles) avisos.push({ nivel: "atencao", cena: i, msg: `Cena ${i + 1}: "${ingles[0]}" é inglês e pode sair com sotaque. ${pt ? "Prefira a palavra em português." : "Prefiere la palabra en español."}` });
    const caps = txt.match(/\b[A-Z]{2,}\b/g)?.filter((w) => !SIGLAS.has(w));
    if (caps && caps.length > 2) avisos.push({ nivel: "atencao", cena: i, msg: `Cena ${i + 1}: texto em letras maiúsculas é lido como palavra comum. Confira se é sigla.` });
    if (pt && /[ñ¿¡]/.test(txt)) avisos.push({ nivel: "erro", cena: i, msg: `Cena ${i + 1}: o texto parece espanhol e a voz é em português.` });
    if (!pt && /[ãõç]/i.test(txt)) avisos.push({ nivel: "erro", cena: i, msg: `Cena ${i + 1}: o texto parece português e a voz é em espanhol.` });
    if (palavrasDe(txt) > 28) avisos.push({ nivel: "atencao", cena: i, msg: `Cena ${i + 1}: frase longa. No vídeo curto, até 20 palavras por cena prende mais.` });
  });
  return avisos;
}

// ---------- voz (servidor) ----------
const cache = new Map<string, Promise<ArrayBuffer>>();
/** Pede a voz ao servidor (função "narrar"): devolve o MP3. A mesma fala com a mesma voz não é pedida duas vezes. */
export function gerarVoz(texto: string, n: Narracao): Promise<ArrayBuffer> {
  const v = vozDe(n.voz);
  const falado = textoParaFala(texto, v.idioma);
  const chave = [v.id, n.vel, n.tom, falado].join("|");
  const ja = cache.get(chave);
  if (ja) return ja;
  const p = (async () => {
    const { data, error } = await supabase.functions.invoke("narrar", { body: { texto: falado, voz: v.id, vel: n.vel * TONS[n.tom].ritmo, tom: TONS[n.tom].pitch } });
    if (error) throw new Error(/not found|404|Failed to send/i.test(error.message) ? "A voz ainda não está ligada no servidor." : "Não consegui gerar a voz agora. Tente de novo.");
    if (data instanceof ArrayBuffer) return data;
    if (data instanceof Blob) return data.arrayBuffer();
    if (data?.audio) return Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0)).buffer;
    throw new Error("Não consegui gerar a voz agora. Tente de novo.");
  })();
  cache.set(chave, p);
  p.catch(() => cache.delete(chave));
  return p;
}

/** Prévia só para ouvir o ritmo, com a voz do próprio aparelho (não vai para o vídeo). */
export function ouvirNoAparelho(texto: string, n: Narracao): () => void {
  const v = vozDe(n.voz);
  if (!("speechSynthesis" in window)) return () => undefined;
  const u = new SpeechSynthesisUtterance(textoParaFala(texto, v.idioma));
  u.lang = v.idioma;
  u.rate = n.vel * TONS[n.tom].ritmo;
  u.pitch = n.tom === "alegre" ? 1.1 : n.tom === "calmo" ? 0.92 : 1;
  const local = speechSynthesis.getVoices().filter((x) => x.lang.replace("_", "-").startsWith(v.idioma));
  const certa = local.find((x) => (v.genero === "F" ? /female|maria|francisca|helena|luciana|elvira|monica/i : /male|daniel|antonio|jorge|alvaro|felipe/i).test(x.name)) || local[0];
  if (certa) u.voice = certa;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
  return () => speechSynthesis.cancel();
}

/** Legenda: quebra a fala em pedaços curtos (até ~5 palavras) e divide o tempo da voz entre eles pelo tamanho. */
export function pedacosDaLegenda(texto: string, ini: number, dur: number): { t: string; a: number; b: number }[] {
  const palavras = texto.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (!palavras.length || dur <= 0) return [];
  const grupos: string[] = [];
  let atual: string[] = [];
  for (const p of palavras) {
    atual.push(p);
    if (atual.length >= 5 || /[.,!?;:]$/.test(p) && atual.length >= 2) { grupos.push(atual.join(" ")); atual = []; }
  }
  if (atual.length) grupos.push(atual.join(" "));
  const peso = grupos.map((g) => g.length + 4);
  const total = peso.reduce((s, x) => s + x, 0);
  let t = ini;
  return grupos.map((g, i) => { const d = (dur * peso[i]) / total; const r = { t: g, a: t, b: t + d }; t += d; return r; });
}
