// ============================================================
// PROMPTS MESTRES — FOTO LIMPA PARA MOTOR CANVAS
// ------------------------------------------------------------
// REGRA DEFINITIVA: este arquivo NÃO descreve interface.
// A IA só pode gerar fotografia/fundo. Textos, preço, logo,
// botões, ícones, margens, contraste e HEX são responsabilidade
// exclusiva do Canvas em src/lib/fabrica-compose-art.ts.
// ============================================================

export interface MasterPromptVars {
  destination: string;
  destinationDescription: string;
  installments: string;
  installmentValue: string;
  totalValue: string;
  packageType: string;
  duration: string;
  promoName: string;
  city: string;
  primaryHex: string;
  secondaryHex: string;
  primaryTextHex?: string;
  secondaryTextHex?: string;
  agencyName: string;
  highlights: string[];
  creativeSeed?: string;
  forbiddenHeadlines?: string[];
  forbiddenLayouts?: string[];
  format?: "square" | "story";
}

export function pickContrastText(hex: string): "#000000" | "#FFFFFF" {
  const h = (hex || "").replace("#", "").trim();
  if (h.length !== 6) return "#FFFFFF";
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const L = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
  return L > 0.5 ? "#000000" : "#FFFFFF";
}

export const CRITICAL_CONTRAST_HEADER = `[PHOTO-ONLY SYSTEM COMMAND]
Generate only a clean photographic background. Do not render typography, logos, UI, buttons, cards, icons, badges, prices, currency symbols, labels, watermarks, frames, social-media chrome, QR codes, or any graphic-design layer. Final advertising interface is rendered later by deterministic Canvas code.`;

type MasterTemplate = {
  id: string;
  name: string;
  builder: (v: MasterPromptVars) => string;
};

const cleanPhotoPrompt = (v: MasterPromptVars, camera: string, mood: string): string => {
  const aspect = v.format === "story"
    ? "vertical 9:16 travel photograph, smartphone-story framing"
    : "square 1:1 travel photograph, balanced feed framing";

  return `${CRITICAL_CONTRAST_HEADER}

Create an ${aspect} of ${v.destination}.
Scene: ${v.destinationDescription || `recognizable travel scenery in ${v.destination}`}.
Camera direction: ${camera}.
Mood and light: ${mood}.

The result must be a realistic, high-resolution travel photograph only: natural light, authentic colors, strong destination atmosphere, clean open areas suitable for later overlay by software.

ABSOLUTE NEGATIVE RULES:
No text. No letters. No numbers. No words. No price. No currency. No typography. No logo. No brand mark. No watermark. No icon. No button. No card. No badge. No banner. No ribbon. No frame. No UI. No mockup. No social media interface. No QR code. No barcode. No graphic layout. No poster design. No ad composition.

The AI output is only the background image. Canvas code will draw every visible interface element afterward.`;
};

export function promptClassicVertical(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "wide premium commercial travel shot with clean foreground and natural horizon", "bright natural daylight, crisp catalog-quality realism");
}

export function promptCancunStyle(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "immersive beach or landmark hero shot with generous negative space", "tropical, vibrant, clear sky, polished tourism photography");
}

export function promptGramadoStyle(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "high drone or elevated panoramic angle showing scale and geography", "clean aerial daylight, refined contrast, cinematic clarity");
}

export function promptMaceioStyle(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "side-weighted composition with the main scenery offset and open space on one side", "commercial bright light, saturated but realistic travel colors");
}

export function promptTicketPixCard(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "simple panoramic destination view with uncluttered central area", "warm editorial daylight, premium calm atmosphere");
}

export function promptSideHeroPerformance(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "hero perspective with strong destination subject and empty overlay-safe regions", "dramatic sunrise or sunset, high-end tourism campaign realism");
}

export function promptYellowBoxCVC(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "full-bleed destination photograph, preferably aerial or postcard-recognizable", "crystalline natural light, vivid Brazilian travel catalog style");
}

export function promptIconicLandmark(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "cinematic full-bleed landmark or nature hero shot", "golden hour, aspirational editorial travel mood");
}

export function promptSplitYellowSide(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "soft editorial travel scene with calm negative space and no visual clutter", "gentle natural light, inviting atmosphere, refined realism");
}

export function promptElegantCenterCard(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "lifestyle-free destination shot, no people, no silhouettes, only place and atmosphere", "fresh daylight, organic premium Instagram travel feel");
}

export function promptEditorialVisual(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "asymmetric fine-art travel composition with large empty sky, water, sand, wall, or landscape area", "quiet luxury, contemplative natural light");
}

export function promptTopEditorialPhoto(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "minimal premium travel photograph, single clear subject, spacious composition", "soft luxury light, refined palette, gallery-level realism");
}

export function promptTwoSceneEditorial(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "one single sophisticated destination scene, not collage, not split-screen", "editorial natural texture, calm premium atmosphere");
}

export function promptDarkNeonGlassmorphism(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "dark studio travel still life with luggage, passport, airplane object, or globe as photographic objects only", "matte premium studio light, no neon, no UI, no typography");
}

export function promptDark3DIconsFloating(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "premium dark photographic still life of travel objects with lots of empty space", "soft directional studio light, matte materials, sober fintech-like mood");
}

export function promptDarkMinimalGeometric(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "minimal dark travel-object photograph with abstract route-like composition but no drawn symbols", "low-key studio lighting, elegant shadows, no graphic overlays");
}

export function promptDarkPersonBrutal(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "premium editorial travel business photograph without any text or interface", "controlled studio light, sober contrast, polished commercial realism");
}

export function promptDarkAirplanePremium(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "premium realistic airplane or travel-object photograph with clean dark background", "matte cinematic studio light, elegant negative space");
}

export function promptDarkGroupTravel(v: MasterPromptVars): string {
  return cleanPhotoPrompt(v, "realistic premium photograph of a tourism bus, luggage, or group-travel object scene without people", "commercial studio or outdoor light, clean uncluttered composition");
}

export function promptForcaBruta1x1V1(v: MasterPromptVars): string {
  return `[SYSTEM COMMAND: ISOLAMENTO DE ESTRUTURA. A instrução a seguir aplica-se ÚNICA E EXCLUSIVAMENTE à Nomenclatura: 1/1/1 (Modo: Foto Real | Estilo: Oferta de Pacote | Formato: Quadrado 1:1) associada à Versão de Layout: V1.]

IMAGEM: A high-end travel advertisement with a 1:1 square aspect ratio. The layout features a sharp vertical split perfectly down the middle.

LEFT PANEL (UI Design - 45% width): Solid ${v.primaryHex} background.

MANDATORY COLOR RULE: Every single letter, word, number, and icon on this left panel MUST BE RENDERED IN BRIGHT PURE WHITE color. No exceptions.

LOGO & SPACING: Top left corner: a minimalist logo placeholder. CRITICAL INSTRUCTION: You MUST leave a large empty vertical gap (padding) directly below the logo. Absolutely no text can touch the logo.

TYPOGRAPHY (ALL PURE WHITE): Starting below the empty gap: small PURE WHITE text '${v.promoName}'. Below that: massive, ultra-bold PURE WHITE text '${v.destination}'. Below that: medium PURE WHITE text '${v.city}'.

ICONS (PURE WHITE ONLY): A vertical stack of translucent pill-buttons. The AI MUST use perfectly matching solid PURE WHITE monochromatic icons (NO colorful emojis) next to PURE WHITE text: '${v.highlights[0] || "Transporte incluso"}', '${v.highlights[1] || "Hospedagem"}', '${v.highlights[2] || "Café da manhã"}', '${v.highlights[3] || "Guia local"}'.

PRICE BLOCK: At the bottom left, a darker rectangular highlight box. Inside it, stacked neatly: small PURE WHITE text '${v.installments}', massive extra-bold PURE WHITE text 'R$ ${v.installmentValue}', and small PURE WHITE text 'Total R$ ${v.totalValue}'.

RIGHT PANEL (Photo - 55% width): An 8k photorealistic image of ${v.destination} (vibrant scenery). The photo is framed like a card with slightly rounded corners and a ${v.secondaryHex} border.`;
}

export function promptForcaBruta9x16V1(v: MasterPromptVars): string {
  return `[SYSTEM COMMAND: ISOLAMENTO DE ESTRUTURA E SAFE ZONES. A instrução a seguir aplica-se ÚNICA E EXCLUSIVAMENTE à Nomenclatura: 1/1/2 (Modo: Foto Real | Estilo: Oferta de Pacote | Formato: Stories Vertical 9:16) associada à Versão de Layout: V1.]

IMAGEM: A premium vertical 9:16 travel advertisement.

STRICT UI RULE (SAFE ZONES): The top 20% and the bottom 20% MUST remain completely empty of typography or logos.

BACKGROUND: Solid ${v.primaryHex} background stretching across the entire image.

MANDATORY COLOR RULE FOR ALL TEXT: Every single word and icon generated on the solid background MUST BE BRIGHT PURE WHITE.

TOP HALF UI (Safely below the top 20% zone):

Minimalist logo placeholder at the top left.

CRITICAL INSTRUCTION: Leave a large empty gap (padding) directly below the logo.

Starting below the gap: small PURE WHITE text '${v.promoName}'.

Massive, ultra-bold PURE WHITE text '${v.destination}'.

Medium PURE WHITE text '${v.city}'.

A vertical stack of pill-buttons using ONLY solid PURE WHITE monochromatic icons alongside PURE WHITE text: '${v.highlights[0] || "Transporte incluso"}', '${v.highlights[1] || "Hospedagem"}', '${v.highlights[2] || "Café da manhã"}', '${v.highlights[3] || "Guia local"}'.

BOTTOM HALF (Photo & Price): An 8k photorealistic image of ${v.destination} placed as a large card with rounded corners, showing a ${v.secondaryHex} border behind it. Overlapping the bottom left corner of the photo card (strictly ABOVE the bottom 20% safe zone) is a dark highlight box containing: small PURE WHITE text '${v.installments}', massive extra-bold PURE WHITE text 'R$ ${v.installmentValue}', and small PURE WHITE text 'Total R$ ${v.totalValue}'.`;
}

export const MASTER_TEMPLATES = [
  { id: "classic_vertical", name: "OP1 · Foto limpa", builder: promptClassicVertical },
  { id: "cancun_style", name: "OP2 · Foto limpa", builder: promptCancunStyle },
  { id: "gramado_style", name: "OP3 · Foto limpa", builder: promptGramadoStyle },
  { id: "maceio_style", name: "OP4 · Foto limpa", builder: promptMaceioStyle },
  { id: "ticket_pix_card", name: "OP5 · Foto limpa", builder: promptTicketPixCard },
  { id: "side_hero_performance", name: "OP6 · Foto limpa", builder: promptSideHeroPerformance },
  { id: "yellow_box_cvc", name: "OP7 · Foto limpa", builder: promptYellowBoxCVC },
  { id: "iconic_landmark", name: "ED1 · Foto limpa", builder: promptIconicLandmark },
  { id: "split_yellow_side", name: "ED2 · Foto limpa", builder: promptSplitYellowSide },
  { id: "elegant_center", name: "ED3 · Foto limpa", builder: promptElegantCenterCard },
  { id: "editorial_visual", name: "ED4 · Foto limpa", builder: promptEditorialVisual },
  { id: "top_editorial_photo", name: "ED5 · Foto limpa", builder: promptTopEditorialPhoto },
  { id: "two_scene_editorial", name: "ED6 · Foto limpa", builder: promptTwoSceneEditorial },
  { id: "dark_neon_glassmorphism", name: "DK1 · Foto limpa", builder: promptDarkNeonGlassmorphism },
  { id: "dark_3d_icons_floating", name: "DK2 · Foto limpa", builder: promptDark3DIconsFloating },
  { id: "dark_minimal_geometric", name: "DK3 · Foto limpa", builder: promptDarkMinimalGeometric },
  { id: "dark_person_brutal", name: "DK4 · Foto limpa", builder: promptDarkPersonBrutal },
  { id: "dark_airplane_premium", name: "DK5 · Foto limpa", builder: promptDarkAirplanePremium },
  { id: "dark_group_travel", name: "DK6 · Foto limpa", builder: promptDarkGroupTravel },
  { id: "forca_bruta_1x1_v1", name: "FB1 · Força Bruta 1:1", builder: promptForcaBruta1x1V1 },
  { id: "forca_bruta_9x16_v1", name: "FB2 · Força Bruta 9:16", builder: promptForcaBruta9x16V1 },
] as const;

export type MasterTemplateId = typeof MASTER_TEMPLATES[number]["id"];

export function getTemplateById(id: string) {
  return MASTER_TEMPLATES.find((t) => t.id === id);
}

export function pickRandomTemplates(n: number, exclude: string[] = []): typeof MASTER_TEMPLATES[number][] {
  const pool = MASTER_TEMPLATES.filter((t) => !exclude.includes(t.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
