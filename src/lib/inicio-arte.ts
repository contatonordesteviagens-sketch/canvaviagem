// Artes de teste da primeira página: montadas no navegador do visitante, sem conta e sem custo por arte.
// A logo não sai do aparelho. Preço e textos são de exemplo e a marca d'água fica gravada na imagem.
import { extractPaletteFromCanvas } from "@/lib/extract-palette";

export const ONBOARDING_PATH = "/onboarding";
export const ONBOARDING_DESTINO_KEY = "cv-onboarding-destino";
export const ONBOARDING_LOGO_KEY = "cv-onboarding-logo";

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
  { id: "santiago", nome: "Santiago", photo: 37184336, parcela: "490", internacional: true },
  { id: "machu", nome: "Machu Picchu", photo: 37885473, parcela: "790", internacional: true },
];

export const trialPhotoUrl = (photo: number, width: number) =>
  `https://images.pexels.com/photos/${photo}/pexels-photo-${photo}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

// Foto inteira + um cartão forte, cartão no centro e foto ao lado: três caras diferentes do mesmo pacote.
const TRIAL_VARIANTS = [3, 5, 9];
const DEFAULT_COLORS = { primary: "#0B3B8C", secondary: "#FFD400" };
const OUTPUT_SIZE = 720;
const LOGO_MAX_SIZE = 400;

export type TrialLogo = { dataUrl: string; primary: string; secondary: string };

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
  // Cor clara como cor principal vira painel apagado: nesse caso ela fica de destaque, sobre um fundo escuro.
  if (primary && isLightColor(primary)) {
    return { dataUrl: canvas.toDataURL("image/png"), primary: "#141414", secondary: primary };
  }
  return {
    dataUrl: canvas.toDataURL("image/png"),
    primary: primary || DEFAULT_COLORS.primary,
    secondary: secondary || (primary ? "#FFFFFF" : DEFAULT_COLORS.secondary),
  };
}

/** No teste a logo é o que mais importa: vai grande no canto, em fundo branco para qualquer cor de logo aparecer. */
function drawTrialLogo(ctx: CanvasRenderingContext2D, canvasWidth: number, logo: HTMLImageElement) {
  const height = 96;
  const width = Math.min(220, Math.max(height, height * (logo.naturalWidth / logo.naturalHeight)));
  const pad = 14;
  const chipW = width + pad * 2;
  const chipH = height + pad * 2;
  const x = canvasWidth - chipW - 24;
  const y = 24;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.28)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(x, y, chipW, chipH, 22);
  ctx.fill();
  ctx.restore();
  const fit = Math.min(width / logo.naturalWidth, height / logo.naturalHeight);
  const w = logo.naturalWidth * fit;
  const h = logo.naturalHeight * fit;
  ctx.drawImage(logo, x + (chipW - w) / 2, y + (chipH - h) / 2, w, h);
}

async function finishTrialArt(url: string, logo: TrialLogo | null): Promise<string> {
  const img = await loadLocalImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = Math.round((img.naturalHeight / img.naturalWidth) * OUTPUT_SIZE);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  if (logo) drawTrialLogo(ctx, canvas.width, await loadLocalImage(logo.dataUrl));

  // Uma marca grande no meio, que não sai com um corte, e a faixa de teste embaixo.
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 7);
  ctx.font = "800 84px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(0,0,0,.16)";
  ctx.fillStyle = "rgba(255,255,255,.3)";
  ctx.strokeText("CANVA VIAGEM", 0, 0);
  ctx.fillText("CANVA VIAGEM", 0, 0);
  ctx.restore();

  const bandHeight = 40;
  ctx.fillStyle = "rgba(0,0,0,.62)";
  ctx.fillRect(0, canvas.height - bandHeight, canvas.width, bandHeight);
  ctx.font = "700 18px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText("Arte de teste feita no Canva Viagem", canvas.width / 2, canvas.height - bandHeight / 2);

  return canvas.toDataURL("image/jpeg", 0.82);
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
      onArt(await finishTrialArt(url, logo));
      done++;
    } catch (error) {
      console.error("Arte de teste:", error);
    }
  }
  return done;
}
