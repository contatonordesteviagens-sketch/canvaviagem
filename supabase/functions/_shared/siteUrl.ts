const CANONICAL_SITE_URL = "https://canvaviagem.com";

/**
 * Base URL used to build magic links and redirects.
 *
 * Links must point straight at the production domain: sending users to
 * *.lovable.app adds a cross-domain 302 hop that some email clients
 * (Gmail's google.com/url wrapper in particular) fail to follow, leaving
 * the user staring at a blank page.
 */
export function canonicalSiteUrl(): string {
  const configured = (Deno.env.get("SITE_URL") || "").trim().replace(/\/+$/, "");
  if (!configured) return CANONICAL_SITE_URL;
  try {
    const host = new URL(configured).hostname;
    if (host.endsWith("lovable.app") || host.endsWith("lovableproject.com")) {
      return CANONICAL_SITE_URL;
    }
    return configured;
  } catch {
    return CANONICAL_SITE_URL;
  }
}
