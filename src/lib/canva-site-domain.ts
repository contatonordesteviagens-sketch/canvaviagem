export const CANVA_VIAGEM_DOMAIN = "canvaviagem.com";

export const RESERVED_CANVA_SITE_SLUGS = new Set([
  "www",
  "app",
  "admin",
  "api",
  "painel",
  "blog",
  "sites",
]);

export type CanvaSiteSlugError = "too_short" | "too_long" | "invalid" | "reserved";

export const buildCanvaSiteSlug = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const validateCanvaSiteSlug = (slug: string): CanvaSiteSlugError | null => {
  if (slug.length < 3) return "too_short";
  if (slug.length > 63) return "too_long";
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) return "invalid";
  if (RESERVED_CANVA_SITE_SLUGS.has(slug)) return "reserved";
  return null;
};

export const getCanvaSiteUrl = (slug: string) =>
  `https://${buildCanvaSiteSlug(slug)}.${CANVA_VIAGEM_DOMAIN}`;

export const normalizeCanvaSiteUrl = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const hostname = parsed.hostname.toLowerCase();
    const isCanvaHost = hostname === CANVA_VIAGEM_DOMAIN || hostname.endsWith(`.${CANVA_VIAGEM_DOMAIN}`);
    if (!isCanvaHost) return "";
    parsed.protocol = "https:";
    parsed.username = "";
    parsed.password = "";
    return parsed.href.replace(/\/$/, "");
  } catch {
    return "";
  }
};

export const extractCanvaSiteSlug = (value: string) => {
  const normalizedUrl = normalizeCanvaSiteUrl(value);
  if (normalizedUrl) {
    const parsed = new URL(normalizedUrl);
    if (parsed.hostname === CANVA_VIAGEM_DOMAIN) {
      const legacyMatch = parsed.pathname.match(/^\/view\/([^/]+)/i);
      return buildCanvaSiteSlug(legacyMatch?.[1] || "");
    }
    return buildCanvaSiteSlug(parsed.hostname.slice(0, -(`.${CANVA_VIAGEM_DOMAIN}`.length)));
  }
  return buildCanvaSiteSlug(value);
};
