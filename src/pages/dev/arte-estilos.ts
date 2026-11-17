// Textos prontos de viagem e selos de preço, cada um com um estilo diferente (no jeito dos "estilos de texto" do Canva).
// Cada peça vira uma imagem (PNG) desenhada aqui; o texto e o preço continuam editáveis: é só desenhar de novo.

import { capturarPecas, type Peca } from "./arte-pecas";
export type Preco = { prefixo: string; parcelas: string; valor: string; sufixo: string; antes: string };
export type Desenho = { src: string; w: number; r: number };

export const ESTILOS_TEXTO: { id: string; nome: string; texto: string; cor: string }[] = [
  { id: "partiu", nome: "Partiu", texto: "PARTIU\nFÉRIAS!", cor: "#F5F906" },
  { id: "ultimas", nome: "Últimas vagas", texto: "ÚLTIMAS VAGAS", cor: "#E11D2E" },
  { id: "sonhos", nome: "Sonhos", texto: "A VIAGEM DOS\nSEUS SONHOS", cor: "#F5F906" },
  { id: "bora", nome: "Bora", texto: "Bora viajar?", cor: "#F5F906" },
  { id: "lua", nome: "Lua de mel", texto: "Lua de mel\nDOS SONHOS", cor: "#F5F906" },
  { id: "black", nome: "Black Friday", texto: "BLACK FRIDAY\nDE VIAGENS", cor: "#F5F906" },
  { id: "embarque", nome: "Embarque", texto: "PROMOÇÃO\nEmbarque imediato", cor: "#F5F906" },
  { id: "ferias", nome: "Férias", texto: "FÉRIAS\nem família", cor: "#F5F906" },
  { id: "relampago", nome: "Relâmpago", texto: "PROMOÇÃO RELÂMPAGO", cor: "#F5F906" },
  { id: "allinc", nome: "All inclusive", texto: "ALL INCLUSIVE", cor: "#0B63CE" },
  { id: "saidas", nome: "Saídas", texto: "Saídas confirmadas", cor: "#16A34A" },
  { id: "proximo", nome: "Próximo destino", texto: "seu próximo\nDESTINO", cor: "#F5F906" },
  { id: "anos70", nome: "Anos 70", texto: "VERÃO\nCHEGOU", cor: "#FFB000" },
  { id: "neonluz", nome: "Neon", texto: "OFERTA\nESPECIAL", cor: "#FF2BD6" },
  { id: "cosmico", nome: "Cósmico", texto: "Viva o\nextraordinário", cor: "#7DD3FC" },
  { id: "bolha", nome: "Bolha", texto: "Pacote completo", cor: "#0B63CE" },
  { id: "aerobica", nome: "Aeróbica", texto: "Fim de semana\nno paraíso", cor: "#FF5E62" },
  { id: "fliperama", nome: "Fliperama", texto: "PRÓXIMA\nPARADA", cor: "#39FF14" },
  { id: "faroeste", nome: "Faroeste", texto: "AVENTURA\nNA SERRA", cor: "#E8B04A" },
  { id: "graffiti", nome: "Graffiti", texto: "Bora pra\npraia!", cor: "#F5F906" },
  { id: "vazado", nome: "Vazado", texto: "VAGAS LIMITADAS", cor: "#F5F906" },
  { id: "tresd", nome: "3D", texto: "DESTINO\nDO MÊS", cor: "#F5F906" },
];

/** Textos dos vídeos (cenas): títulos grandes, etiquetas e linhas pequenas, legíveis em cima do vídeo. */
export const ESTILOS_CENA: { id: string; nome: string; texto: string; cor: string }[] = [
  { id: "cenaTitulo", nome: "Título", texto: "PACOTES\nNACIONAIS", cor: "#FFFFFF" },
  { id: "cenaAmarelo", nome: "Título em destaque", texto: "DOS SONHOS", cor: "#FFC629" },
  { id: "cenaEtiqueta", nome: "Etiqueta", texto: "SEMPRE QUIS IR?", cor: "#FFC629" },
  { id: "cenaPequeno", nome: "Linha pequena", texto: "PERTO DE VOCÊ", cor: "#FFFFFF" },
  { id: "cenaFaixa", nome: "Frase na faixa", texto: "de água cristalina", cor: "#FFFFFF" },
  { id: "cenaPilula", nome: "Pílula", texto: "RESORTS", cor: "#FFC629" },
  { id: "cenaNumero", nome: "Número", texto: "01", cor: "#FFC629" },
];
const ehCena = (id: string) => ESTILOS_CENA.some((e) => e.id === id);
// títulos das cenas: Montserrat bem forte, com sombra para ler em cima de qualquer vídeo
function textoDeCena(id: string, texto: string, ac: string): Desenho {
  const m = medidor();
  const L = (texto || " ").split("\n");
  if (id === "cenaTitulo" || id === "cenaAmarelo" || id === "cenaNumero") {
    const tam = id === "cenaNumero" ? 150 : 132, f = `900 ${tam}px "Montserrat"`, lh = Math.round(tam * 1.08), P = 40;
    const w = Math.max(...L.map((l) => largura(m, f, l))) + P * 2, h = L.length * lh + P * 2;
    return pintar(w, h, (c) => {
      fonte(c, f); c.textAlign = "center";
      sombra(c, 34, 0, 6, "rgba(0,0,0,.55)");
      c.fillStyle = ac;
      L.forEach((l, i) => c.fillText(l, w / 2, P + (i + 1) * lh - tam * 0.2));
    });
  }
  if (id === "cenaPequeno") {
    const f = '800 44px "Montserrat"', lh = 58, P = 24;
    const w = Math.max(...L.map((l) => largura(m, f, l, 7))) + P * 2, h = L.length * lh + P * 2;
    return pintar(w, h, (c) => {
      fonte(c, f, 7); c.textAlign = "center";
      sombra(c, 18, 0, 3, "rgba(0,0,0,.6)");
      c.fillStyle = ac;
      L.forEach((l, i) => c.fillText(l, w / 2, P + (i + 1) * lh - 12));
    });
  }
  // etiqueta (texto escuro na caixa amarela), faixa (texto claro na caixa escura) e pílula (caixa escura com borda)
  const tam = id === "cenaEtiqueta" ? 84 : id === "cenaPilula" ? 58 : 46;
  const peso = id === "cenaFaixa" ? 700 : 900;
  const f = `${peso} ${tam}px "Montserrat"`, padX = tam * 0.55, padY = tam * 0.32, gap = tam * 0.16, S = 14;
  const ws = L.map((l) => largura(m, f, l) + padX * 2), hl = tam * 1.12 + padY * 2;
  const w = Math.max(...ws) + S * 2, h = L.length * hl + (L.length - 1) * gap + S * 2;
  return pintar(w, h, (c) => {
    fonte(c, f); c.textAlign = "center"; c.textBaseline = "middle";
    L.forEach((l, i) => {
      const bw = ws[i], x0 = (w - bw) / 2, y0 = S + i * (hl + gap);
      c.beginPath(); c.roundRect(x0, y0, bw, hl, id === "cenaPilula" ? hl / 2 : tam * 0.18);
      if (id === "cenaEtiqueta") { sombra(c, 22, 0, 6, "rgba(0,0,0,.35)"); c.fillStyle = ac; c.fill(); semSombra(c); c.fillStyle = contraste(ac); }
      else if (id === "cenaPilula") { c.fillStyle = "rgba(12,12,14,.88)"; c.fill(); c.lineWidth = 5; c.strokeStyle = ac; c.stroke(); c.fillStyle = "#FFFFFF"; }
      else { c.fillStyle = "rgba(14,14,16,.82)"; c.fill(); c.fillStyle = ac; }
      c.fillText(l, w / 2, y0 + hl / 2 + tam * 0.04);
    });
  });
}

export const ESTILOS_PRECO: { id: string; nome: string; cor: string }[] = [
  { id: "estrela", nome: "Estrela", cor: "#F5F906" },
  { id: "etiqueta", nome: "Etiqueta", cor: "#E11D2E" },
  { id: "selo", nome: "Selo redondo", cor: "#E11D2E" },
  { id: "faixa", nome: "Faixa preta", cor: "#F5F906" },
  { id: "balao", nome: "Balão", cor: "#F5F906" },
  { id: "cartao", nome: "Cartão", cor: "#F5F906" },
  { id: "pix", nome: "À vista", cor: "#16A34A" },
  { id: "depor", nome: "De / por", cor: "#E11D2E" },
];

export const CORES_RAPIDAS = ["#F5F906", "#111111", "#FFFFFF", "#E11D2E", "#F97316", "#16A34A", "#0B63CE", "#7C3AED"];

// ——— fontes ———
const FONTES_URL = "https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Oswald:wght@400;500;700&family=Poppins:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800&family=Montserrat:wght@300;400;600;700;800;900&family=Pacifico&family=Dancing+Script:wght@700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=Archivo+Black&family=Barlow+Condensed:wght@400;600;800&family=Raleway:wght@400;700;900&family=Nunito:wght@400;700;900&family=Lato:wght@400;700;900&family=Righteous&family=Abril+Fatface&family=Lora:wght@400;700&family=Lobster&family=Press+Start+2P&family=Rye&family=Permanent+Marker&family=Bungee&display=swap";
let fontesProntas: Promise<void> | null = null;
export function carregarFontes(): Promise<void> {
  if (fontesProntas) return fontesProntas;
  fontesProntas = (async () => {
    if (!document.querySelector("link[data-fontes-estilos]")) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = FONTES_URL;
      l.dataset.fontesEstilos = "1";
      document.head.appendChild(l);
      await new Promise((ok) => { l.onload = ok; l.onerror = ok; setTimeout(ok, 4000); });
    }
    const lista = ['400 80px "Anton"', '400 80px "Bebas Neue"', '700 80px "Oswald"', '900 80px "Poppins"', '800 80px "Poppins"',
      'italic 800 80px "Poppins"', '400 80px "Righteous"', '400 80px "Press Start 2P"', '400 80px "Rye"', '400 80px "Permanent Marker"', '400 80px "Bungee"', '900 80px "Nunito"', '400 80px "Archivo Black"', '900 80px "Montserrat"', '800 80px "Montserrat"', '700 80px "Montserrat"', '600 80px "Montserrat"',
      '300 80px "Montserrat"', '400 80px "Pacifico"', '700 80px "Dancing Script"', 'italic 700 80px "Playfair Display"'];
    await Promise.all(lista.map((f) => document.fonts.load(f).catch(() => null)));
  })();
  return fontesProntas;
}

// ——— ajudantes de desenho ———
type Ctx = CanvasRenderingContext2D;
const fonte = (c: Ctx, f: string, espaco = 0) => {
  c.font = f;
  try { (c as unknown as { letterSpacing: string }).letterSpacing = `${espaco}px`; } catch { /* navegador antigo */ }
};
const largura = (c: Ctx, f: string, t: string, espaco = 0) => { fonte(c, f, espaco); return c.measureText(t).width; };
const contraste = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  const l = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return l > 0.6 ? "#111111" : "#FFFFFF";
};
/** Escurece (negativo) ou clareia (positivo) uma cor em hex. */
function shade(hex: string, p: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + (p / 100) * (p < 0 ? v : 255 - v))));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
let capturando: ((w: number, h: number, desenhar: (c: Ctx) => void) => void) | null = null;
function pintar(w: number, h: number, desenhar: (c: Ctx) => void): Desenho {
  if (capturando) { capturando(w, h, desenhar); return { src: "", w: Math.ceil(w), r: Math.ceil(h) / Math.ceil(w) }; }
  const cv = document.createElement("canvas");
  cv.width = Math.ceil(w); cv.height = Math.ceil(h);
  const c = cv.getContext("2d")!;
  c.textBaseline = "alphabetic";
  desenhar(c);
  return { src: cv.toDataURL("image/png"), w: cv.width, r: cv.height / cv.width };
}
const medidor = () => document.createElement("canvas").getContext("2d")!;
const linhas = (t: string, n: number) => { const l = t.split("\n"); while (l.length < n) l.push(""); return l; };
const sombra = (c: Ctx, blur: number, dx = 0, dy = 0, cor = "rgba(0,0,0,.45)") => { c.shadowColor = cor; c.shadowBlur = blur; c.shadowOffsetX = dx; c.shadowOffsetY = dy; };
const semSombra = (c: Ctx) => { c.shadowColor = "transparent"; c.shadowBlur = 0; c.shadowOffsetX = 0; c.shadowOffsetY = 0; };
function estrela(c: Ctx, cx: number, cy: number, rFora: number, rDentro: number, pontas: number) {
  c.beginPath();
  for (let i = 0; i < pontas * 2; i++) {
    const r = i % 2 ? rDentro : rFora, ang = (Math.PI * i) / pontas - Math.PI / 2;
    c.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
  }
  c.closePath();
}

/** Um texto pronto desenhado no estilo pedido. `cor` troca a cor principal do estilo. */
export async function desenharTexto(id: string, texto: string, cor?: string): Promise<Desenho> {
  await carregarFontes();
  if (ehCena(id)) return textoDeCena(id, texto, cor || ESTILOS_CENA.find((e) => e.id === id)!.cor);
  const est = ESTILOS_TEXTO.find((e) => e.id === id) || ESTILOS_TEXTO[0];
  const ac = cor || est.cor;
  const m = medidor();
  const P = 30;
  switch (est.id) {
    case "partiu": {
      const L = texto.split("\n"), f = '400 150px "Anton"', lh = 160;
      const w = Math.max(...L.map((l) => largura(m, f, l))) + P * 2 + 20, h = L.length * lh + P * 2 + 10;
      return pintar(w, h, (c) => {
        fonte(c, f); c.textAlign = "center"; c.lineJoin = "round";
        L.forEach((l, i) => {
          const y = P + (i + 1) * lh - 12;
          c.fillStyle = "#111"; c.fillText(l, w / 2 + 10, y + 10);
          c.lineWidth = 16; c.strokeStyle = "#111"; c.strokeText(l, w / 2, y);
          c.fillStyle = ac; c.fillText(l, w / 2, y);
        });
      });
    }
    case "ultimas": {
      const f = '700 92px "Oswald"', tw = largura(m, f, texto, 2), w = tw + 120, h = 150;
      return pintar(w + 12, h + 12, (c) => {
        c.fillStyle = "rgba(0,0,0,.35)"; c.beginPath(); c.roundRect(8, 10, w, h, h / 2); c.fill();
        c.fillStyle = ac; c.beginPath(); c.roundRect(0, 0, w, h, h / 2); c.fill();
        fonte(c, f, 2); c.fillStyle = contraste(ac); c.textAlign = "center"; c.fillText(texto, w / 2, 108);
      });
    }
    case "sonhos": {
      const [a, b] = linhas(texto, 2), f1 = '600 50px "Montserrat"', f2 = '400 180px "Bebas Neue"';
      const w = Math.max(largura(m, f1, a, 10), largura(m, f2, b, 2)) + P * 2 + 12, h = 60 + 170 + P * 2;
      return pintar(w, h, (c) => {
        c.textAlign = "center";
        sombra(c, 14); fonte(c, f1, 10); c.fillStyle = "#fff"; c.fillText(a, w / 2, P + 48);
        sombra(c, 0, 8, 8, "#111"); fonte(c, f2, 2); c.fillStyle = ac; c.fillText(b, w / 2, P + 60 + 160);
      });
    }
    case "bora": {
      const f = '900 104px "Poppins"', tw = largura(m, f, texto), w = tw + 100, h = 170;
      return pintar(w + 16, h + 16, (c) => {
        c.fillStyle = "#111"; c.fillRect(16, 16, w, h);
        c.fillStyle = ac; c.fillRect(0, 0, w, h);
        c.lineWidth = 8; c.strokeStyle = "#111"; c.strokeRect(4, 4, w - 8, h - 8);
        fonte(c, f); c.fillStyle = contraste(ac); c.textAlign = "center"; c.fillText(texto, w / 2, 122);
      });
    }
    case "lua": {
      const [a, b] = linhas(texto, 2), f1 = '400 130px "Pacifico"', f2 = '800 46px "Montserrat"';
      const w = Math.max(largura(m, f1, a), largura(m, f2, b, 14)) + P * 2 + 20, h = 190 + 70 + P;
      return pintar(w, h, (c) => {
        c.textAlign = "center";
        sombra(c, 18); fonte(c, f1); c.fillStyle = "#fff"; c.fillText(a, w / 2, P + 150);
        sombra(c, 10); fonte(c, f2, 14); c.fillStyle = ac; c.fillText(b, w / 2, P + 150 + 80);
      });
    }
    case "black": {
      const [a, b] = linhas(texto, 2), f1 = '400 140px "Anton"', f2 = '800 50px "Montserrat"';
      const w = Math.max(largura(m, f1, a, 2), largura(m, f2, b, 12)) + 100, h = 150 + 70 + 70;
      return pintar(w, h, (c) => {
        c.fillStyle = "#0A0A0A"; c.beginPath(); c.roundRect(0, 0, w, h, 18); c.fill();
        c.textAlign = "center";
        fonte(c, f1, 2); c.fillStyle = ac; c.fillText(a, w / 2, 172);
        fonte(c, f2, 12); c.fillStyle = "#fff"; c.fillText(b, w / 2, 250);
      });
    }
    case "embarque": {
      const [a, b] = linhas(texto, 2), f1 = '700 42px "Montserrat"', f2 = 'italic 700 112px "Playfair Display"';
      const w = Math.max(largura(m, f1, a, 12) + 160, largura(m, f2, b)) + P * 2, h = 60 + 140 + P * 2;
      return pintar(w, h, (c) => {
        c.textAlign = "center";
        const t1 = largura(c, f1, a, 12);
        c.fillStyle = ac; c.fillRect(w / 2 - t1 / 2 - 70, P + 28, 50, 5); c.fillRect(w / 2 + t1 / 2 + 20, P + 28, 50, 5);
        fonte(c, f1, 12); c.fillText(a, w / 2, P + 44);
        sombra(c, 18); fonte(c, f2); c.fillStyle = "#fff"; c.fillText(b, w / 2, P + 60 + 110);
      });
    }
    case "ferias": {
      const [a, b] = linhas(texto, 2), f1 = '400 180px "Anton"', f2 = '700 100px "Dancing Script"';
      const w = Math.max(largura(m, f1, a, 6), largura(m, f2, b) + 120) + P * 2, h = 190 + 90 + P;
      return pintar(w, h, (c) => {
        c.textAlign = "center"; c.lineJoin = "round";
        sombra(c, 12); fonte(c, f1, 6); c.lineWidth = 7; c.strokeStyle = "#fff"; c.strokeText(a, w / 2, P + 180);
        sombra(c, 10); fonte(c, f2); c.fillStyle = ac; c.fillText(b, w / 2 + 60, P + 180 + 70);
      });
    }
    case "relampago": {
      const f = 'italic 800 74px "Poppins"', tw = largura(m, f, texto), w = tw + 160, h = 130, k = 40;
      return pintar(w + k, h, (c) => {
        c.fillStyle = ac; c.beginPath(); c.moveTo(k, 0); c.lineTo(w + k, 0); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fill();
        c.fillStyle = "#111"; c.beginPath(); c.moveTo(k + 20, 0); c.lineTo(k + 44, 0); c.lineTo(44, h); c.lineTo(20, h); c.closePath(); c.fill();
        fonte(c, f); c.fillStyle = contraste(ac); c.textAlign = "center"; c.fillText(texto, (w + k) / 2 + 20, 92);
      });
    }
    case "allinc": {
      const f = '900 82px "Montserrat"', tw = largura(m, f, texto, 3), w = tw + 110, h = 150;
      return pintar(w, h, (c) => {
        c.fillStyle = ac; c.beginPath(); c.roundRect(0, 0, w, h, 26); c.fill();
        c.lineWidth = 6; c.strokeStyle = contraste(ac); c.beginPath(); c.roundRect(14, 14, w - 28, h - 28, 16); c.stroke();
        fonte(c, f, 3); c.fillStyle = contraste(ac); c.textAlign = "center"; c.fillText(texto, w / 2, 104);
      });
    }
    case "saidas": {
      const f = '800 66px "Poppins"', tw = largura(m, f, texto), h = 130, w = tw + h + 70;
      return pintar(w, h, (c) => {
        c.fillStyle = "#fff"; c.beginPath(); c.roundRect(0, 0, w, h, h / 2); c.fill();
        c.fillStyle = ac; c.beginPath(); c.arc(h / 2, h / 2, h / 2 - 12, 0, Math.PI * 2); c.fill();
        c.strokeStyle = contraste(ac); c.lineWidth = 12; c.lineCap = "round"; c.lineJoin = "round";
        c.beginPath(); c.moveTo(h / 2 - 24, h / 2 + 2); c.lineTo(h / 2 - 6, h / 2 + 20); c.lineTo(h / 2 + 26, h / 2 - 18); c.stroke();
        fonte(c, f); c.fillStyle = "#111"; c.textAlign = "left"; c.fillText(texto, h + 10, 88);
      });
    }
    case "anos70": {
      const L = texto.split("\n"), f = '400 150px "Righteous"', lh = 150;
      const w = Math.max(...L.map((l) => largura(m, f, l, 4))) + P * 2 + 40, h = L.length * lh + P * 2 + 30;
      return pintar(w, h, (c) => {
        fonte(c, f, 4); c.textAlign = "center"; c.lineJoin = "round";
        L.forEach((l, i) => {
          const y = P + (i + 1) * lh - 14;
          [["#C2185B", 24], ["#F4511E", 16], [ac, 8]].forEach(([cor, d]) => { c.fillStyle = cor as string; c.fillText(l, w / 2 + (d as number), y + (d as number)); });
          c.fillStyle = "#FFF3C4"; c.fillText(l, w / 2, y);
        });
      });
    }
    case "neonluz": {
      const L = texto.split("\n"), f = '400 130px "Righteous"', lh = 140;
      const w = Math.max(...L.map((l) => largura(m, f, l, 6))) + 160, h = L.length * lh + 120;
      return pintar(w, h, (c) => {
        fonte(c, f, 6); c.textAlign = "center"; c.lineJoin = "round";
        L.forEach((l, i) => {
          const y = 60 + (i + 1) * lh - 20;
          sombra(c, 40, 0, 0, ac); c.lineWidth = 6; c.strokeStyle = ac; c.strokeText(l, w / 2, y);
          sombra(c, 18, 0, 0, ac); c.fillStyle = "#FFFFFF"; c.fillText(l, w / 2, y);
        });
      });
    }
    case "cosmico": {
      const [a, b] = linhas(texto, 2), f1 = '700 90px "Dancing Script"', f2 = '700 120px "Dancing Script"';
      const w = Math.max(largura(m, f1, a), largura(m, f2, b)) + 160, h = 100 + 140 + 90;
      return pintar(w, h, (c) => {
        c.textAlign = "center";
        for (const blur of [40, 18]) { sombra(c, blur, 0, 0, ac); fonte(c, f1); c.fillStyle = "#fff"; c.fillText(a, w / 2, 45 + 90); fonte(c, f2); c.fillText(b, w / 2, 45 + 90 + 130); }
      });
    }
    case "bolha": {
      const f = '900 96px "Nunito"', tw = largura(m, f, texto), w = tw + 120, h = 170;
      return pintar(w + 14, h + 14, (c) => {
        c.fillStyle = "rgba(0,0,0,.3)"; c.beginPath(); c.roundRect(10, 14, w, h, h / 2); c.fill();
        c.fillStyle = ac; c.beginPath(); c.roundRect(0, 0, w, h, h / 2); c.fill();
        c.fillStyle = "rgba(255,255,255,.35)"; c.beginPath(); c.roundRect(30, 16, w - 60, 40, 20); c.fill();
        fonte(c, f); c.textAlign = "center"; c.lineJoin = "round"; c.lineWidth = 14; c.strokeStyle = shade(ac, -40); c.strokeText(texto, w / 2, 120);
        c.fillStyle = "#fff"; c.fillText(texto, w / 2, 120);
      });
    }
    case "aerobica": {
      const [a, b] = linhas(texto, 2), f1 = '400 96px "Pacifico"', f2 = '400 110px "Pacifico"';
      const w = Math.max(largura(m, f1, a), largura(m, f2, b)) + 120, h = 120 + 150 + 70;
      return pintar(w, h, (c) => {
        c.textAlign = "center";
        const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, ac); g.addColorStop(1, "#FFB000");
        sombra(c, 0, 6, 6, "#ffffff"); fonte(c, f1); c.fillStyle = g; c.fillText(a, w / 2, 30 + 100);
        fonte(c, f2); c.fillText(b, w / 2, 30 + 100 + 150);
      });
    }
    case "fliperama": {
      const L = texto.split("\n"), f = '400 84px "Press Start 2P"', lh = 120;
      const w = Math.max(...L.map((l) => largura(m, f, l))) + 120, h = L.length * lh + 90;
      return pintar(w, h, (c) => {
        fonte(c, f); c.textAlign = "center";
        L.forEach((l, i) => {
          const y = 40 + (i + 1) * lh - 20;
          c.fillStyle = "#111"; c.fillText(l, w / 2 + 8, y + 8);
          c.fillStyle = "#7C3AED"; c.fillText(l, w / 2 + 4, y + 4);
          c.fillStyle = ac; c.fillText(l, w / 2, y);
        });
      });
    }
    case "faroeste": {
      const L = texto.split("\n"), f = '400 128px "Rye"', lh = 140;
      const w = Math.max(...L.map((l) => largura(m, f, l, 2))) + 120, h = L.length * lh + 80;
      return pintar(w, h, (c) => {
        fonte(c, f, 2); c.textAlign = "center"; c.lineJoin = "round";
        L.forEach((l, i) => {
          const y = 30 + (i + 1) * lh - 16;
          c.fillStyle = "#3B1F0E"; c.fillText(l, w / 2 + 8, y + 8);
          c.lineWidth = 6; c.strokeStyle = "#3B1F0E"; c.strokeText(l, w / 2, y);
          c.fillStyle = ac; c.fillText(l, w / 2, y);
        });
      });
    }
    case "graffiti": {
      const L = texto.split("\n"), f = '400 130px "Permanent Marker"', lh = 135;
      const w = Math.max(...L.map((l) => largura(m, f, l))) + 140, h = L.length * lh + 90;
      return pintar(w, h, (c) => {
        fonte(c, f); c.textAlign = "center"; c.lineJoin = "round";
        L.forEach((l, i) => {
          const y = 40 + (i + 1) * lh - 20, x = w / 2 + (i % 2 ? 30 : -30);
          c.lineWidth = 22; c.strokeStyle = "#111"; c.strokeText(l, x + 6, y + 8);
          c.lineWidth = 14; c.strokeStyle = "#fff"; c.strokeText(l, x, y);
          c.fillStyle = ac; c.fillText(l, x, y);
        });
      });
    }
    case "vazado": {
      const f = '400 120px "Anton"', tw = largura(m, f, texto, 4), w = tw + 80, h = 170;
      return pintar(w, h, (c) => {
        fonte(c, f, 4); c.textAlign = "center"; c.lineJoin = "round";
        sombra(c, 10); c.lineWidth = 5; c.strokeStyle = ac; c.strokeText(texto, w / 2, 135);
      });
    }
    case "tresd": {
      const L = texto.split("\n"), f = '400 130px "Archivo Black"', lh = 140;
      const w = Math.max(...L.map((l) => largura(m, f, l))) + 120, h = L.length * lh + 90;
      return pintar(w, h, (c) => {
        fonte(c, f); c.textAlign = "center";
        L.forEach((l, i) => {
          const y = 30 + (i + 1) * lh - 18;
          for (let k = 14; k > 0; k -= 2) { c.fillStyle = shade(ac, -55); c.fillText(l, w / 2 + k, y + k); }
          c.fillStyle = ac; c.fillText(l, w / 2, y);
        });
      });
    }
    case "proximo":
    default: {
      const [a, b] = linhas(texto, 2), f1 = '300 72px "Montserrat"', f2 = '900 132px "Montserrat"';
      const w = Math.max(largura(m, f1, a), largura(m, f2, b, 4)) + P * 2, h = 80 + 140 + 40 + P;
      return pintar(w, h, (c) => {
        c.textAlign = "center";
        sombra(c, 16); fonte(c, f1); c.fillStyle = "#fff"; c.fillText(a, w / 2, P + 66);
        fonte(c, f2, 4); c.fillText(b, w / 2, P + 80 + 120);
        semSombra(c); c.fillStyle = ac; c.fillRect(w / 2 - 90, P + 80 + 145, 180, 14);
      });
    }
  }
}

// ——— preço ———
const FV = (t: number) => `900 ${t}px "Montserrat"`;
/** "10x R$ 249": mede e desenha o bloco do preço (parcelas pequeno, R$ pequeno em cima, valor grande). */
function blocoPreco(c: Ctx, p: Preco, t: number) {
  const parc = p.parcelas.trim(), val = p.valor.trim() || "0";
  const fP = `800 ${Math.round(t * 0.34)}px "Montserrat"`, fR = `800 ${Math.round(t * 0.3)}px "Montserrat"`;
  const wP = parc ? largura(c, fP, parc) + t * 0.12 : 0, wR = largura(c, fR, "R$"), wV = largura(c, FV(t), val);
  const w = wP + wR + t * 0.06 + wV;
  const desenhar = (x: number, base: number, cor: string) => {
    c.textAlign = "left"; c.fillStyle = cor;
    if (parc) { fonte(c, fP); c.fillText(parc, x, base - t * 0.36); }
    fonte(c, fR); c.fillText("R$", x + wP, base - t * 0.42);
    fonte(c, FV(t)); c.fillText(val, x + wP + wR + t * 0.06, base);
  };
  return { w, desenhar };
}

/** As peças do selo de preço (cada texto e cada forma), para desagrupar. W e H: tamanho do selo inteiro. */
export async function pecasDoPreco(id: string, p: Preco, cor?: string): Promise<{ pecas: Peca[]; W: number; H: number }> {
  await carregarFontes();
  let out: { pecas: Peca[]; W: number; H: number } = { pecas: [], W: 1, H: 1 };
  capturando = (w, h, desenhar) => { out = { pecas: capturarPecas(w, h, desenhar), W: Math.ceil(w), H: Math.ceil(h) }; };
  try { await desenharPreco(id, p, cor); } finally { capturando = null; }
  return out;
}

/** Selo de preço no estilo pedido. */
export async function desenharPreco(id: string, p: Preco, cor?: string): Promise<Desenho> {
  await carregarFontes();
  const est = ESTILOS_PRECO.find((e) => e.id === id) || ESTILOS_PRECO[0];
  const ac = cor || est.cor;
  const m = medidor();
  const fPre = '700 34px "Montserrat"', fSuf = '600 28px "Montserrat"';
  const pre = p.prefixo.trim(), suf = p.sufixo.trim();
  const centro = (c: Ctx, cx: number, top: number, t: number, corTx: string) => {
    let y = top;
    c.textAlign = "center"; c.fillStyle = corTx;
    if (pre) { fonte(c, fPre, 1); c.fillText(pre.toUpperCase(), cx, y + 30); y += 46; }
    const b = blocoPreco(c, p, t);
    b.desenhar(cx - b.w / 2, y + t * 0.86, corTx); y += t * 0.95;
    if (suf) { c.textAlign = "center"; c.fillStyle = corTx; fonte(c, fSuf); c.fillText(suf, cx, y + 30); y += 40; }
    return y;
  };
  const altura = (t: number) => (pre ? 46 : 0) + t * 0.95 + (suf ? 40 : 0);
  const largo = (t: number) => Math.max(blocoPreco(m, p, t).w, pre ? largura(m, fPre, pre.toUpperCase(), 1) : 0, suf ? largura(m, fSuf, suf) : 0);

  switch (est.id) {
    case "estrela": {
      const t = 130, R = Math.max(largo(t), altura(t)) / 2 + 95, S = R * 2 + 20;
      return pintar(S, S, (c) => {
        sombra(c, 0, 8, 10, "rgba(0,0,0,.3)");
        estrela(c, S / 2, S / 2, R, R * 0.86, 22); c.fillStyle = ac; c.fill();
        semSombra(c); c.lineWidth = 10; c.strokeStyle = "#E11D2E"; c.stroke();
        centro(c, S / 2, S / 2 - altura(t) / 2, t, contraste(ac));
      });
    }
    case "etiqueta": {
      const t = 120, w = largo(t) + 190, h = altura(t) + 70;
      return pintar(w + 10, h + 10, (c) => {
        sombra(c, 0, 8, 10, "rgba(0,0,0,.3)");
        c.fillStyle = ac; c.beginPath(); c.moveTo(0, h / 2); c.lineTo(80, 0); c.lineTo(w, 0); c.lineTo(w, h); c.lineTo(80, h); c.closePath(); c.fill();
        semSombra(c); c.fillStyle = "#fff"; c.beginPath(); c.arc(62, h / 2, 14, 0, Math.PI * 2); c.fill();
        centro(c, 80 + (w - 80) / 2, 35, t, contraste(ac));
      });
    }
    case "selo": {
      const t = 120, R = Math.max(largo(t), altura(t)) / 2 + 70, S = R * 2 + 16;
      return pintar(S, S, (c) => {
        sombra(c, 0, 6, 10, "rgba(0,0,0,.3)");
        c.fillStyle = ac; c.beginPath(); c.arc(S / 2, S / 2, R, 0, Math.PI * 2); c.fill();
        semSombra(c); c.setLineDash([14, 10]); c.lineWidth = 5; c.strokeStyle = contraste(ac);
        c.beginPath(); c.arc(S / 2, S / 2, R - 22, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
        centro(c, S / 2, S / 2 - altura(t) / 2, t, contraste(ac));
      });
    }
    case "faixa": {
      const t = 130, parc = p.parcelas.trim();
      const semParc = { ...p, parcelas: "" };
      const bW = blocoPreco(m, semParc, t).w, fParc = '900 64px "Montserrat"', wParc = parc ? largura(m, fParc, parc) + 60 : 0;
      const lin = Math.max(bW, pre ? largura(m, fPre, pre.toUpperCase(), 1) : 0, suf ? largura(m, fSuf, suf) : 0);
      const w = wParc + lin + 90, h = altura(t) + 50;
      return pintar(w, h, (c) => {
        c.fillStyle = "#0A0A0A"; c.fillRect(0, 0, w, h);
        if (parc) { c.fillStyle = ac; c.fillRect(0, 0, wParc, h); fonte(c, fParc); c.fillStyle = contraste(ac); c.textAlign = "center"; c.fillText(parc, wParc / 2, h / 2 + 24); }
        let y = 25; const cx = wParc + 45 + lin / 2;
        c.textAlign = "center";
        if (pre) { fonte(c, fPre, 1); c.fillStyle = "#fff"; c.fillText(pre.toUpperCase(), cx, y + 30); y += 46; }
        const b = blocoPreco(c, semParc, t); b.desenhar(cx - b.w / 2, y + t * 0.86, ac); y += t * 0.95;
        if (suf) { c.textAlign = "center"; fonte(c, fSuf); c.fillStyle = "#fff"; c.fillText(suf, cx, y + 30); }
      });
    }
    case "balao": {
      const t = 120, w = largo(t) + 120, h = altura(t) + 70, cauda = 60;
      return pintar(w + 10, h + cauda + 10, (c) => {
        sombra(c, 0, 8, 10, "rgba(0,0,0,.3)");
        c.fillStyle = ac; c.beginPath(); c.roundRect(0, 0, w, h, 40); c.fill();
        c.beginPath(); c.moveTo(w * 0.22, h - 2); c.lineTo(w * 0.16, h + cauda); c.lineTo(w * 0.4, h - 2); c.closePath(); c.fill();
        semSombra(c); c.lineWidth = 7; c.strokeStyle = "#111"; c.beginPath(); c.roundRect(3.5, 3.5, w - 7, h - 7, 37); c.stroke();
        centro(c, w / 2, 35, t, contraste(ac));
      });
    }
    case "cartao": {
      const t = 130, w = largo(t) + 110, h = altura(t) + 90;
      return pintar(w + 24, h + 24, (c) => {
        sombra(c, 24, 0, 8, "rgba(0,0,0,.3)");
        c.fillStyle = "#fff"; c.beginPath(); c.roundRect(12, 6, w, h, 30); c.fill();
        semSombra(c);
        const fim = centro(c, 12 + w / 2, 40, t, "#111");
        c.fillStyle = ac; c.beginPath(); c.roundRect(12 + w / 2 - 70, fim + 10, 140, 12, 6); c.fill();
      });
    }
    case "pix": {
      const t = 120, fTop = '800 32px "Montserrat"', topo = "À VISTA";
      const w = Math.max(largo(t), largura(m, fTop, topo, 4)) + 110, h = altura(t) + 120;
      return pintar(w, h, (c) => {
        c.fillStyle = ac; c.beginPath(); c.roundRect(0, 0, w, h, 34); c.fill();
        fonte(c, fTop, 4); c.fillStyle = contraste(ac); c.textAlign = "center"; c.fillText(topo, w / 2, 52);
        c.fillRect(w / 2 - 50, 68, 100, 4);
        centro(c, w / 2, 82, t, contraste(ac));
      });
    }
    case "depor":
    default: {
      const t = 130, antes = p.antes.trim(), fDe = '700 40px "Montserrat"', de = antes ? `De R$ ${antes}` : "";
      const fPor = '800 40px "Montserrat"', por = antes ? "por" : "Por apenas";
      const semPre = { ...p, prefixo: "" };
      const bw = blocoPreco(m, semPre, t).w;
      const w = Math.max(bw, de ? largura(m, fDe, de) : 0, largura(m, fPor, por), suf ? largura(m, fSuf, suf) : 0) + 110;
      const h = (de ? 56 : 0) + 52 + t * 0.95 + (suf ? 40 : 0) + 60;
      return pintar(w + 20, h + 20, (c) => {
        sombra(c, 22, 0, 8, "rgba(0,0,0,.3)");
        c.fillStyle = "#fff"; c.beginPath(); c.roundRect(10, 6, w, h, 28); c.fill();
        semSombra(c); c.textAlign = "center";
        let y = 36; const cx = 10 + w / 2;
        if (de) {
          fonte(c, fDe); c.fillStyle = "#6B6B70"; c.fillText(de, cx, y + 34);
          const dw = largura(c, fDe, de); c.fillStyle = "#E11D2E"; c.fillRect(cx - dw / 2 - 6, y + 20, dw + 12, 5); y += 56;
        }
        fonte(c, fPor); c.fillStyle = "#111"; c.textAlign = "center"; c.fillText(por, cx, y + 36); y += 52;
        const b = blocoPreco(c, semPre, t); b.desenhar(cx - b.w / 2, y + t * 0.86, ac); y += t * 0.95;
        if (suf) { c.textAlign = "center"; fonte(c, fSuf); c.fillStyle = "#3A3A3F"; c.fillText(suf, cx, y + 30); }
      });
    }
  }
}
