// Coloca no topo os conteúdos das datas que estão chegando (Black Friday, Natal, Réveillon, Carnaval),
// na ordem em que acontecem. Funciona pelo título, então vale para vídeos, artes e calendário sem mexer no banco.

type Data = { re: RegExp; fim: (ano: number) => Date };

// fim = último dia em que ainda faz sentido postar sobre a data
const DATAS: Data[] = [
  { re: /black\s*friday|black\s*fraide|\bblack\b/i, fim: (a) => new Date(a, 11, 1) },
  { re: /natal(?!\s*-\s*rn)|papai\s*noel|natalin/i, fim: (a) => new Date(a, 11, 26) },
  { re: /r[ée]veillon|ano\s*novo|virada/i, fim: (a) => new Date(a + 1, 0, 2) },
  { re: /carnaval|folia/i, fim: (a) => new Date(a + 1, 2, 10) },
];

// janela: a data entra no topo até ~160 dias antes de acontecer
const JANELA_MS = 160 * 24 * 60 * 60 * 1000;

/** Posição da data sazonal do item (0 = a mais próxima), ou null se não é de uma data que está chegando. */
export function posicaoSazonal(texto: string, agora = new Date()): number | null {
  const ano = agora.getMonth() <= 2 ? agora.getFullYear() - 1 : agora.getFullYear();
  const proximas = DATAS
    .map((d) => ({ d, fim: d.fim(ano) }))
    .filter(({ fim }) => fim.getTime() > agora.getTime() && fim.getTime() - agora.getTime() < JANELA_MS)
    .sort((a, b) => a.fim.getTime() - b.fim.getTime());
  const i = proximas.findIndex(({ d }) => d.re.test(texto));
  return i === -1 ? null : i;
}

/** Ordena mantendo a ordem original, mas com os itens sazonais da época na frente. */
export function sazonaisPrimeiro<T>(itens: T[], texto: (item: T) => string, agora = new Date()): T[] {
  return itens
    .map((item, i) => ({ item, i, p: posicaoSazonal(texto(item) || "", agora) }))
    .sort((a, b) => {
      if (a.p !== null || b.p !== null) {
        if (a.p === null) return 1;
        if (b.p === null) return -1;
        if (a.p !== b.p) return a.p - b.p;
      }
      return a.i - b.i;
    })
    .map((x) => x.item);
}
