// Artes de teste da primeira página: montadas no navegador do visitante, sem conta e sem custo por arte.
// A logo não sai do aparelho. Preço e textos são de exemplo e a marca d'água fica gravada na imagem.
import { extractPaletteFromCanvas } from "@/lib/extract-palette";

export const ONBOARDING_PATH = "/onboarding";
export const ONBOARDING_DESTINO_KEY = "cv-onboarding-destino";
export const ONBOARDING_LOGO_KEY = "cv-onboarding-logo";
const TRIAL_RESULT_KEY = "cv-inicio-artes";

/** O teste vale uma vez por aparelho: quem recarrega a página vê as mesmas artes, e o quiz mostra essas artes. */
export type TrialResult = { destino: string; arts: string[] };

export function readTrialResult(): TrialResult | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(TRIAL_RESULT_KEY) || "null") as TrialResult | null;
    return parsed?.destino && Array.isArray(parsed.arts) && parsed.arts.length ? parsed : null;
  } catch {
    return null;
  }
}

export function saveTrialResult(result: TrialResult) {
  try { localStorage.setItem(TRIAL_RESULT_KEY, JSON.stringify(result)); } catch { /* sem espaço: o teste só não fica guardado */ }
}

export type TrialDestino = {
  id: string;
  nome: string;
  photo: number;
  /** Valor de exemplo da parcela, em reais. */
  parcela: string;
  internacional?: boolean;
};

export const TRIAL_DESTINOS: TrialDestino[] = [
  { id: "noronha", nome: "Fernando de Noronha", photo: 12271415, parcela: "690" },
  { id: "maragogi", nome: "Maragogi", photo: 35858830, parcela: "249" },
  { id: "porto", nome: "Porto de Galinhas", photo: 30016379, parcela: "229" },
  { id: "rio", nome: "Rio de Janeiro", photo: 11051182, parcela: "199" },
  { id: "foz", nome: "Foz do Iguaçu", photo: 623174, parcela: "219" },
  { id: "gramado", nome: "Gramado", photo: 22809319, parcela: "289" },
  { id: "jeri", nome: "Jericoacoara", photo: 35772293, parcela: "279" },
  { id: "cancun", nome: "Cancún", photo: 20210509, parcela: "690", internacional: true },
  { id: "orlando", nome: "Orlando", photo: 8183994, parcela: "890", internacional: true },
  { id: "paris", nome: "Paris", photo: 16496484, parcela: "990", internacional: true },
  { id: "santiago", nome: "Santiago", photo: 37309391, parcela: "490", internacional: true },
  { id: "machu", nome: "Machu Picchu", photo: 37885473, parcela: "790", internacional: true },
];

export const trialPhotoUrl = (photo: number, width: number) =>
  `https://images.pexels.com/photos/${photo}/pexels-photo-${photo}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

// Modelos 1, 5 e 9: bloco de cor em cima, moldura de cor e foto inteira com o destino grande.
const TRIAL_VARIANTS = [0, 4, 8];
const DEFAULT_COLORS = { primary: "#0B3B8C", secondary: "#FFD400" };
// Boa para ver no celular, pequena demais para virar anúncio.
const OUTPUT_SIZE = 540;
const LOGO_MAX_SIZE = 400;

export type TrialLogo = { dataUrl: string; primary: string; secondary: string; lightOnly: boolean };

function loadLocalImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("imagem inválida"));
    img.src = src;
  });
}

const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("não foi possível ler o arquivo"));
    reader.readAsDataURL(file);
  });

const isLightColor = (hex: string) => {
  const value = parseInt(hex.replace("#", ""), 16);
  return 0.299 * ((value >> 16) & 255) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255) > 150;
};

const hueOf = (hex: string) => {
  const value = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (!delta) return 0;
  const hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return (hue * 60 + 360) % 360;
};

/** Secundária quase igual à principal é só um tom claro da mesma cor, e o cartão fica desbotado. */
const sameHue = (a: string, b: string) => {
  const diff = Math.abs(hueOf(a) - hueOf(b));
  return Math.min(diff, 360 - diff) < 30;
};

/** Logo só de traços claros em fundo transparente, como logo branca, some no fundo branco. */
function isLightOnlyLogo(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const { data } = ctx.getImageData(0, 0, width, height);
  let total = 0;
  let light = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    total++;
    if (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2] > 200) light++;
  }
  return total > 0 && light / total > 0.85;
}

/** Reduz a logo e tira as cores dela. Falha em formato que o navegador não abre (ex.: HEIC do iPhone). */
export async function prepareTrialLogo(file: File): Promise<TrialLogo> {
  const img = await loadLocalImage(await readFile(file));
  const scale = Math.min(1, LOGO_MAX_SIZE / Math.max(img.naturalWidth || LOGO_MAX_SIZE, img.naturalHeight || LOGO_MAX_SIZE));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round((img.naturalWidth || LOGO_MAX_SIZE) * scale));
  canvas.height = Math.max(1, Math.round((img.naturalHeight || LOGO_MAX_SIZE) * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const { primary, secondary } = extractPaletteFromCanvas(ctx, canvas.width, canvas.height);
  const lightOnly = isLightOnlyLogo(ctx, canvas.width, canvas.height);
  // Cor clara como cor principal vira painel apagado: nesse caso ela fica de destaque, sobre um fundo escuro.
  if (primary && isLightColor(primary)) {
    return { dataUrl: canvas.toDataURL("image/png"), primary: "#141414", secondary: primary, lightOnly };
  }
  return {
    dataUrl: canvas.toDataURL("image/png"),
    primary: primary || DEFAULT_COLORS.primary,
    secondary: secondary && !(primary && sameHue(primary, secondary)) ? secondary : primary ? "#FFFFFF" : DEFAULT_COLORS.secondary,
    lightOnly,
  };
}

/** No teste a logo é o que mais importa: vai grande no canto, em fundo que contrasta com ela. */
function drawTrialLogo(ctx: CanvasRenderingContext2D, canvasWidth: number, logo: HTMLImageElement, lightOnly: boolean, variant: number) {
  const height = 72;
  const width = Math.min(165, Math.max(height, height * (logo.naturalWidth / logo.naturalHeight)));
  const pad = 10;
  const chipW = width + pad * 2;
  const chipH = height + pad * 2;
  const x = canvasWidth - chipW - (variant === 4 ? 30 : 18);
  // Sempre sobre a foto, longe do texto: canto de cima no Modelo 9, fim da foto no 5, embaixo no 1.
  const y = variant === 8 ? 18 : variant === 4 ? 287 - chipH - 12 : canvasWidth - 32 - chipH - 30;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.28)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = lightOnly ? "#141414" : "#fff";
  ctx.beginPath();
  ctx.roundRect(x, y, chipW, chipH, 16);
  ctx.fill();
  ctx.restore();
  const fit = Math.min(width / logo.naturalWidth, height / logo.naturalHeight);
  const w = logo.naturalWidth * fit;
  const h = logo.naturalHeight * fit;
  ctx.drawImage(logo, x + (chipW - w) / 2, y + (chipH - h) / 2, w, h);
}

async function finishTrialArt(url: string, logo: TrialLogo | null, variant: number): Promise<string> {
  const img = await loadLocalImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = Math.round((img.naturalHeight / img.naturalWidth) * OUTPUT_SIZE);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  if (logo) drawTrialLogo(ctx, canvas.width, await loadLocalImage(logo.dataUrl), logo.lightOnly, variant);

  // Marca em três linhas, passando pelo preço e pela logo: não sai com um corte e dá trabalho para apagar.
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 7);
  ctx.font = "800 58px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(0,0,0,.18)";
  ctx.fillStyle = "rgba(255,255,255,.34)";
  for (const offsetY of [-170, 0, 170]) {
    ctx.strokeText("CANVA VIAGEM", 0, offsetY);
    ctx.fillText("CANVA VIAGEM", 0, offsetY);
  }
  ctx.restore();

  const bandHeight = 32;
  ctx.fillStyle = "rgba(0,0,0,.62)";
  ctx.fillRect(0, canvas.height - bandHeight, canvas.width, bandHeight);
  ctx.font = "700 14px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText("Arte de teste feita no Canva Viagem", canvas.width / 2, canvas.height - bandHeight / 2);

  return canvas.toDataURL("image/jpeg", 0.74);
}

/** Entrega as artes uma a uma. Se uma falhar, as outras seguem. */
export async function generateTrialArts(
  destino: TrialDestino,
  logo: TrialLogo | null,
  onArt: (url: string) => void,
): Promise<number> {
  const { composeTravelAd } = await import("@/lib/fabrica-compose-art");
  let done = 0;
  for (const variant of TRIAL_VARIANTS) {
    try {
      const { url } = await composeTravelAd({
        imageUrl: trialPhotoUrl(destino.photo, 1400),
        format: "square",
        destination: destino.nome,
        city: "",
        primaryColor: logo?.primary ?? DEFAULT_COLORS.primary,
        secondaryColor: logo?.secondary ?? DEFAULT_COLORS.secondary,
        price: destino.parcela,
        currencySymbol: "R$",
        hideCents: true,
        installments: "10x",
        promoName: "Oferta especial",
        highlights: [
          destino.internacional ? { text: "Passagem aérea", icon: "aviao" } : { text: "Transporte incluso", icon: "onibus" },
          { text: "Hospedagem", icon: "placa-do-hotel" },
          { text: "Café da manhã", icon: "cafe-da-manha" },
          { text: "Guia local", icon: "guia-turistico" },
        ],
        hasLogo: false,
        paymentMode: "installments",
        paymentLabel: "10x",
        paymentSuffix: "por pessoa",
        pricePrefix: "a partir de",
        strategy: "vitrine",
        variation: variant,
        forceVariant: variant,
        titleOverride: `Pacote ${destino.nome}`,
        titleVariations: [`Pacote ${destino.nome}`, `Você precisa conhecer ${destino.nome}`, `${destino.nome} te espera`],
        showPixBanner: false,
        showTotal: false,
        fontFamily: "Inter",
      } as unknown as Parameters<typeof composeTravelAd>[0]);
      onArt(await finishTrialArt(url, logo, variant));
      done++;
    } catch (error) {
      console.error("Arte de teste:", error);
    }
  }
  return done;
}
