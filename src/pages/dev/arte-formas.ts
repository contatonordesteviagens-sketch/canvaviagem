// Formas do editor (como no Canva): linhas, formas básicas, polígonos, estrelas, setas, fluxograma,
// balões de fala, nuvens, corações e faixas. Cada forma é um caminho SVG; vira imagem na cor escolhida
// ou serve de molde para recortar uma foto ("formas de imagem").

export type Forma = {
  id: string;
  nome: string;
  /** largura e altura do desenho (viewBox) */
  w: number;
  h: number;
  /** caminho SVG */
  d: string;
  /** furos (regra par-ímpar) */
  par?: boolean;
  /** só o contorno (sem recheio) */
  contorno?: boolean;
  /** linha: tracejado, ponta de seta e espessura */
  linha?: { dash?: number[]; seta?: 0 | 1 | 2; redonda?: boolean; grossura?: number };
};

export type CategoriaForma = { id: string; nome: string; formas: Forma[] };

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Polígono regular de n lados, ponta para cima. */
function poligono(n: number, w = 100, h = 100): string {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / n;
    pts.push(`${r2(w / 2 + (w / 2) * Math.cos(a))} ${r2(h / 2 + (h / 2) * Math.sin(a))}`);
  }
  return `M${pts.join("L")}Z`;
}

/** Estrela de n pontas; dentro = raio de dentro (0 a 1). */
function estrela(n: number, dentro: number): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / n;
    const r = i % 2 ? 50 * dentro : 50;
    pts.push(`${r2(50 + r * Math.cos(a))} ${r2(50 + r * Math.sin(a))}`);
  }
  return `M${pts.join("L")}Z`;
}

/** Círculo como caminho. */
const circ = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;

const CORACAO = "M50 88C20 66 0 50 0 28C0 12 12 0 27 0C38 0 46 6 50 15C54 6 62 0 73 0C88 0 100 12 100 28C100 50 80 66 50 88Z";
const NUVEM = "M30 90A30 30 0 0 1 25 30A35 35 0 0 1 90 18A28 28 0 0 1 125 50A22 22 0 0 1 115 90Z";

export const CATEGORIAS_FORMA: CategoriaForma[] = [
  {
    id: "linhas", nome: "Linhas",
    formas: [
      { id: "linha", nome: "Linha", w: 200, h: 24, d: "M6 12H194", linha: {} },
      { id: "linha-tracejada", nome: "Linha tracejada", w: 200, h: 24, d: "M6 12H194", linha: { dash: [18, 12] } },
      { id: "linha-pontilhada", nome: "Linha pontilhada", w: 200, h: 24, d: "M6 12H194", linha: { dash: [0.1, 16], redonda: true } },
      { id: "linha-grossa", nome: "Linha grossa", w: 200, h: 24, d: "M6 12H194", linha: { grossura: 2.2, redonda: true } },
      { id: "linha-seta", nome: "Seta", w: 200, h: 40, d: "M6 20H194", linha: { seta: 1 } },
      { id: "linha-seta-dupla", nome: "Seta dos dois lados", w: 200, h: 40, d: "M6 20H194", linha: { seta: 2 } },
      { id: "linha-seta-tracejada", nome: "Seta tracejada", w: 200, h: 40, d: "M6 20H194", linha: { seta: 1, dash: [18, 12] } },
    ],
  },
  {
    id: "basicas", nome: "Formas básicas",
    formas: [
      { id: "quadrado", nome: "Quadrado", w: 100, h: 100, d: "M0 0H100V100H0Z" },
      { id: "arredondado", nome: "Quadrado arredondado", w: 100, h: 100, d: "M16 0H84Q100 0 100 16V84Q100 100 84 100H16Q0 100 0 84V16Q0 0 16 0Z" },
      { id: "circulo", nome: "Círculo", w: 100, h: 100, d: circ(50, 50, 50) },
      { id: "elipse", nome: "Oval", w: 140, h: 100, d: "M0 50A70 50 0 1 0 140 50A70 50 0 1 0 0 50Z" },
      { id: "triangulo", nome: "Triângulo", w: 100, h: 100, d: "M50 0L100 100H0Z" },
      { id: "triangulo-reto", nome: "Triângulo retângulo", w: 100, h: 100, d: "M0 0L100 100H0Z" },
      { id: "losango", nome: "Losango", w: 100, h: 100, d: "M50 0L100 50L50 100L0 50Z" },
      { id: "paralelogramo", nome: "Paralelogramo", w: 140, h: 100, d: "M35 0H140L105 100H0Z" },
      { id: "trapezio", nome: "Trapézio", w: 100, h: 100, d: "M25 0H75L100 100H0Z" },
      { id: "semicirculo", nome: "Meio círculo", w: 100, h: 50, d: "M0 50A50 50 0 0 1 100 50Z" },
      { id: "arco", nome: "Arco", w: 100, h: 100, d: "M0 100V50A50 50 0 0 1 100 50V100Z" },
      { id: "anel", nome: "Anel", w: 100, h: 100, d: circ(50, 50, 50) + circ(50, 50, 30), par: true },
      { id: "cruz", nome: "Cruz", w: 100, h: 100, d: "M35 0H65V35H100V65H65V100H35V65H0V35H35Z" },
      { id: "quadrado-contorno", nome: "Quadrado (só a borda)", w: 100, h: 100, d: "M0 0H100V100H0Z", contorno: true },
      { id: "circulo-contorno", nome: "Círculo (só a borda)", w: 100, h: 100, d: circ(50, 50, 50), contorno: true },
      { id: "arredondado-contorno", nome: "Arredondado (só a borda)", w: 100, h: 100, d: "M16 0H84Q100 0 100 16V84Q100 100 84 100H16Q0 100 0 84V16Q0 0 16 0Z", contorno: true },
    ],
  },
  {
    id: "poligonos", nome: "Polígonos",
    formas: [
      { id: "pentagono", nome: "Pentágono", w: 100, h: 100, d: poligono(5) },
      { id: "hexagono", nome: "Hexágono", w: 100, h: 100, d: poligono(6) },
      { id: "heptagono", nome: "Heptágono", w: 100, h: 100, d: poligono(7) },
      { id: "octogono", nome: "Octógono", w: 100, h: 100, d: poligono(8) },
      { id: "decagono", nome: "Decágono", w: 100, h: 100, d: poligono(10) },
      { id: "hexagono-deitado", nome: "Hexágono deitado", w: 120, h: 100, d: "M30 0H90L120 50L90 100H30L0 50Z" },
    ],
  },
  {
    id: "estrelas", nome: "Estrelas",
    formas: [
      { id: "estrela-4", nome: "Estrela de 4 pontas", w: 100, h: 100, d: estrela(4, 0.38) },
      { id: "estrela-5", nome: "Estrela", w: 100, h: 100, d: estrela(5, 0.42) },
      { id: "estrela-6", nome: "Estrela de 6 pontas", w: 100, h: 100, d: estrela(6, 0.55) },
      { id: "estrela-8", nome: "Estrela de 8 pontas", w: 100, h: 100, d: estrela(8, 0.55) },
      { id: "explosao", nome: "Explosão", w: 100, h: 100, d: estrela(16, 0.68) },
      { id: "selo", nome: "Selo", w: 100, h: 100, d: estrela(24, 0.86) },
      { id: "estrela-contorno", nome: "Estrela (só a borda)", w: 100, h: 100, d: estrela(5, 0.42), contorno: true },
    ],
  },
  {
    id: "setas", nome: "Setas",
    formas: [
      { id: "seta-direita", nome: "Seta para a direita", w: 120, h: 80, d: "M0 25H75V0L120 40L75 80V55H0Z" },
      { id: "seta-esquerda", nome: "Seta para a esquerda", w: 120, h: 80, d: "M120 25H45V0L0 40L45 80V55H120Z" },
      { id: "seta-cima", nome: "Seta para cima", w: 80, h: 120, d: "M25 120V45H0L40 0L80 45H55V120Z" },
      { id: "seta-baixo", nome: "Seta para baixo", w: 80, h: 120, d: "M25 0V75H0L40 120L80 75H55V0Z" },
      { id: "seta-dupla", nome: "Seta dupla", w: 140, h: 80, d: "M0 40L35 0V25H105V0L140 40L105 80V55H35V80Z" },
      { id: "chevron", nome: "Divisa", w: 100, h: 80, d: "M0 0H60L100 40L60 80H0L40 40Z" },
      { id: "seta-etiqueta", nome: "Seta etiqueta", w: 120, h: 70, d: "M0 0H85L120 35L85 70H0Z" },
    ],
  },
  {
    id: "fluxograma", nome: "Formas de fluxograma",
    formas: [
      { id: "fluxo-processo", nome: "Processo", w: 140, h: 90, d: "M0 0H140V90H0Z" },
      { id: "fluxo-terminal", nome: "Início ou fim", w: 140, h: 70, d: "M35 0H105A35 35 0 0 1 105 70H35A35 35 0 0 1 35 0Z" },
      { id: "fluxo-decisao", nome: "Decisão", w: 140, h: 90, d: "M70 0L140 45L70 90L0 45Z" },
      { id: "fluxo-dados", nome: "Dados", w: 140, h: 90, d: "M30 0H140L110 90H0Z" },
      { id: "fluxo-documento", nome: "Documento", w: 140, h: 100, d: "M0 0H140V82Q105 62 70 82T0 82Z" },
      { id: "fluxo-preparacao", nome: "Preparação", w: 140, h: 80, d: "M30 0H110L140 40L110 80H30L0 40Z" },
      { id: "fluxo-manual", nome: "Entrada manual", w: 140, h: 90, d: "M0 25L140 0V90H0Z" },
      { id: "fluxo-banco", nome: "Banco de dados", w: 100, h: 120, d: "M0 15A50 15 0 0 1 100 15V105A50 15 0 0 1 0 105Z" },
    ],
  },
  {
    id: "baloes", nome: "Balões de fala",
    formas: [
      { id: "balao-quadrado", nome: "Balão retangular", w: 120, h: 100, d: "M10 0H110Q120 0 120 10V65Q120 75 110 75H45L20 100L25 75H10Q0 75 0 65V10Q0 0 10 0Z" },
      { id: "balao-redondo", nome: "Balão redondo", w: 120, h: 100, d: "M60 0C93 0 120 17 120 38C120 59 93 76 60 76C52 76 45 75 38 73L12 96L20 66C7 59 0 49 0 38C0 17 27 0 60 0Z" },
      { id: "balao-direita", nome: "Balão (ponta à direita)", w: 120, h: 100, d: "M10 0H110Q120 0 120 10V65Q120 75 110 75H95L100 100L75 75H10Q0 75 0 65V10Q0 0 10 0Z" },
      { id: "balao-pensamento", nome: "Balão de pensamento", w: 140, h: 120, d: NUVEM + circ(30, 102, 8) + circ(14, 114, 5) },
      { id: "balao-grito", nome: "Balão de grito", w: 100, h: 100, d: estrela(12, 0.72) },
    ],
  },
  {
    id: "nuvens", nome: "Nuvens",
    formas: [
      { id: "nuvem", nome: "Nuvem", w: 140, h: 90, d: NUVEM },
      { id: "nuvem-fofa", nome: "Nuvem fofa", w: 100, h: 70, d: "M20 70A20 20 0 0 1 14 32A22 22 0 0 1 48 14A24 24 0 0 1 86 30A20 20 0 0 1 82 70Z" },
      { id: "nuvem-larga", nome: "Nuvem larga", w: 180, h: 80, d: "M24 80A24 24 0 0 1 22 34A26 26 0 0 1 66 18A32 32 0 0 1 124 16A28 28 0 0 1 160 40A20 20 0 0 1 156 80Z" },
      { id: "nuvem-contorno", nome: "Nuvem (só a borda)", w: 140, h: 90, d: NUVEM, contorno: true },
    ],
  },
  {
    id: "coracoes", nome: "Corações",
    formas: [
      { id: "coracao", nome: "Coração", w: 100, h: 88, d: CORACAO },
      { id: "coracao-pontudo", nome: "Coração pontudo", w: 100, h: 90, d: "M50 90L8 48A24 24 0 0 1 50 12A24 24 0 0 1 92 48Z" },
      { id: "coracao-contorno", nome: "Coração (só a borda)", w: 100, h: 88, d: CORACAO, contorno: true },
    ],
  },
  {
    id: "banners", nome: "Banners",
    formas: [
      { id: "faixa", nome: "Faixa", w: 160, h: 60, d: "M0 0H160L148 30L160 60H0L12 30Z" },
      { id: "fita", nome: "Fita com pontas", w: 170, h: 66, d: "M0 18H28V62H0L10 40Z" + "M18 4H152V54H18Z" + "M142 18H170L160 40L170 62H142Z" },
      { id: "faixa-ondulada", nome: "Faixa ondulada", w: 160, h: 60, d: "M0 10Q40 -5 80 10T160 10V50Q120 35 80 50T0 50Z" },
      { id: "marcador", nome: "Marcador", w: 70, h: 100, d: "M0 0H70V100L35 75L0 100Z" },
      { id: "bandeirola", nome: "Bandeirola", w: 100, h: 110, d: "M0 0H100V75L50 110L0 75Z" },
      { id: "etiqueta", nome: "Etiqueta", w: 140, h: 70, d: "M0 0H110L140 35L110 70H0Z" + circ(112, 35, 7), par: true },
    ],
  },
];

const TODAS = new Map(CATEGORIAS_FORMA.flatMap((c) => c.formas).map((f) => [f.id, f]));
export const formaPorId = (id: string) => TODAS.get(id);

/** Formas que servem de molde para foto (todas as cheias, sem linhas e sem "só a borda"). */
export const MOLDES_IMAGEM: Forma[] = [
  "quadrado", "arredondado", "circulo", "elipse", "triangulo", "losango", "hexagono", "pentagono", "octogono",
  "estrela-5", "selo", "explosao", "coracao", "nuvem", "balao-redondo", "seta-direita", "arco", "marcador",
].map((id) => TODAS.get(id)!).filter(Boolean);

/** Espessura da linha e do contorno, em unidades do desenho. */
const grossuraDe = (f: Forma) => (f.linha ? 6 * (f.linha.grossura || 1) : Math.min(f.w, f.h) * 0.08);

/** Pinta a forma num contexto já escalado para as unidades do desenho. */
function pintarForma(x: CanvasRenderingContext2D, f: Forma, cor: string) {
  const p = new Path2D(f.d);
  x.fillStyle = cor; x.strokeStyle = cor;
  if (f.linha) {
    const g = grossuraDe(f);
    x.lineWidth = g;
    x.lineCap = f.linha.redonda || (f.linha.dash && f.linha.dash[0] < 1) ? "round" : "butt";
    const seta = f.linha.seta || 0;
    const ponta = g * 3.2;
    // a linha encurta onde entra a ponta da seta
    const y = f.h / 2;
    const x0 = 6 + (seta === 2 ? ponta * 0.8 : 0), x1 = f.w - 6 - (seta ? ponta * 0.8 : 0);
    x.setLineDash(f.linha.dash ? f.linha.dash.map((v) => v * (g / 6)) : []);
    x.beginPath(); x.moveTo(x0, y); x.lineTo(x1, y); x.stroke();
    x.setLineDash([]);
    const cabeca = (xp: number, dir: 1 | -1) => {
      x.beginPath(); x.moveTo(xp, y); x.lineTo(xp - dir * ponta, y - ponta * 0.62); x.lineTo(xp - dir * ponta, y + ponta * 0.62); x.closePath(); x.fill();
    };
    if (seta >= 1) cabeca(f.w - 6, 1);
    if (seta === 2) cabeca(6, -1);
    return;
  }
  if (f.contorno) {
    // a borda fica toda para dentro: encolhe o desenho pela metade da espessura
    const g = grossuraDe(f);
    x.save();
    x.translate(g / 2, g / 2);
    x.scale((f.w - g) / f.w, (f.h - g) / f.h);
    x.lineWidth = g / Math.min((f.w - g) / f.w, (f.h - g) / f.h);
    x.lineJoin = "round";
    x.stroke(p);
    x.restore();
    return;
  }
  x.fill(p, f.par ? "evenodd" : "nonzero");
}

/** Desenha a forma como imagem (PNG transparente), com o lado maior em `lado` px. */
export function desenharForma(f: Forma, cor: string, lado = 640): { src: string; w: number; r: number } {
  const k = lado / Math.max(f.w, f.h);
  const c = document.createElement("canvas");
  c.width = Math.max(2, Math.round(f.w * k));
  c.height = Math.max(2, Math.round(f.h * k));
  const x = c.getContext("2d")!;
  x.scale(c.width / f.w, c.height / f.h);
  pintarForma(x, f, cor);
  return { src: c.toDataURL("image/png"), w: c.width, r: c.height / c.width };
}

/** Recorta uma imagem no formato da forma (a foto preenche a forma, como no Canva). */
export function recortarNaForma(fonte: CanvasImageSource & { width: number; height: number }, f: Forma): HTMLCanvasElement {
  const iw = fonte.width, ih = fonte.height;
  // mantém a largura da imagem; a altura segue a proporção da forma
  const W = Math.max(2, Math.round(iw));
  const H = Math.max(2, Math.round((iw * f.h) / f.w));
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d")!;
  // a foto cobre a forma inteira (corta o que sobra, centralizado)
  const s = Math.max(W / iw, H / ih);
  x.drawImage(fonte, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
  x.globalCompositeOperation = "destination-in";
  x.save();
  x.scale(W / f.w, H / f.h);
  x.fill(new Path2D(f.d), f.par ? "evenodd" : "nonzero");
  x.restore();
  return c;
}

/** SVG pequeno da forma para os botões do painel. `foto`: recheio de céu (moldura de imagem). */
export function svgDaForma(f: Forma, foto = false): string {
  const g = grossuraDe(f);
  const pad = f.linha ? 0 : f.contorno ? g / 2 : 0;
  const vb = `${-pad} ${-pad} ${f.w + pad * 2} ${f.h + pad * 2}`;
  let corpo: string;
  if (f.linha) {
    // no botão a linha é mais curta e mais grossa, para dar para ver o tracejado e a seta
    const sw = 7 * (f.linha.grossura || 1);
    const W = 100, y = 50, seta = f.linha.seta || 0, ponta = 7 * 3.2;
    const x0 = 4 + (seta === 2 ? ponta * 0.8 : 0), x1 = W - 4 - (seta ? ponta * 0.8 : 0);
    const dash = f.linha.dash ? ` stroke-dasharray="${f.linha.dash.map((v) => v * (sw / 7) * 0.9).join(" ")}"` : "";
    const cap = f.linha.redonda || (f.linha.dash && f.linha.dash[0] < 1) ? "round" : "butt";
    corpo = `<path d="M${x0} ${y}H${x1}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="${cap}"${dash} fill="none"/>`;
    const cab = (xp: number, dir: number) => `<path d="M${xp} ${y}L${xp - dir * ponta} ${y - ponta * 0.62}L${xp - dir * ponta} ${y + ponta * 0.62}Z" fill="currentColor"/>`;
    if (seta >= 1) corpo += cab(W - 4, 1);
    if (seta === 2) corpo += cab(4, -1);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">${corpo}</svg>`;
  } else if (f.contorno) {
    corpo = `<path d="${f.d}" fill="none" stroke="currentColor" stroke-width="${g}" stroke-linejoin="round"/>`;
  } else if (foto) {
    const id = `ceu-${f.id}`;
    corpo = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4FA8E0"/><stop offset="1" stop-color="#BEE3F8"/></linearGradient>`
      + `<clipPath id="m-${id}"><path d="${f.d}" clip-rule="${f.par ? "evenodd" : "nonzero"}"/></clipPath></defs>`
      + `<g clip-path="url(#m-${id})"><rect x="0" y="0" width="${f.w}" height="${f.h}" fill="url(#${id})"/>`
      + `<path d="M0 ${f.h}L${f.w * 0.3} ${f.h * 0.55}L${f.w * 0.5} ${f.h * 0.75}L${f.w * 0.7} ${f.h * 0.5}L${f.w} ${f.h}Z" fill="#2F86BF"/></g>`;
  } else {
    corpo = `<path d="${f.d}" fill="currentColor" fill-rule="${f.par ? "evenodd" : "nonzero"}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">${corpo}</svg>`;
}
