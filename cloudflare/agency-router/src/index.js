const APEX_HOST = "canvaviagem.com";
const AGENCY_HOST_SUFFIX = `.${APEX_HOST}`;
const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api", "painel", "blog", "sites"]);
const WHATSAPP_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.148-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.895 9.825 9.825 0 0 1 2.9 6.988c-.003 5.45-4.437 9.884-9.893 9.884M20.463 3.488A11.815 11.815 0 0 0 12.056 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.89 11.89 0 0 0 5.689 1.448h.005c6.559 0 11.895-5.335 11.898-11.893a11.82 11.82 0 0 0-3.49-8.413Z"/></svg>`;
const WHATSAPP_RUNTIME_FIX = `<style id="cv-whatsapp-edge-fix">
.wpp-float{position:fixed!important;left:auto!important;right:max(20px,env(safe-area-inset-right))!important;bottom:max(20px,env(safe-area-inset-bottom))!important;width:58px!important;height:58px!important;border-radius:50%!important;background:#25D366!important;color:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:9999!important;overflow:visible!important}
.wpp-float svg{display:block!important;width:31px!important;height:31px!important;fill:currentColor!important}
@media(max-width:640px){.wpp-float{right:max(16px,env(safe-area-inset-right))!important;bottom:max(16px,env(safe-area-inset-bottom))!important;width:54px!important;height:54px!important}.wpp-float svg{width:29px!important;height:29px!important}}
</style>`;

function upgradePublishedSiteWhatsApp(html) {
  if (!html || !html.includes("wpp-float")) return html;
  const withBrandIcon = html.replace(
    /<a([^>]*class="[^"]*\bwpp-float\b[^"]*"[^>]*)>[\s\S]*?<\/a>/gi,
    (_match, attributes) => `<a${attributes}>${WHATSAPP_SVG}</a>`,
  );
  if (withBrandIcon.includes('id="cv-whatsapp-edge-fix"')) return withBrandIcon;
  if (/<\/head>/i.test(withBrandIcon)) {
    return withBrandIcon.replace(/<\/head>/i, `${WHATSAPP_RUNTIME_FIX}</head>`);
  }
  return `${WHATSAPP_RUNTIME_FIX}${withBrandIcon}`;
}

function getSingleSubdomain(hostname) {
  const normalizedHost = hostname.toLowerCase();
  if (!normalizedHost.endsWith(AGENCY_HOST_SUFFIX)) return "";
  const slug = normalizedHost.slice(0, -AGENCY_HOST_SUFFIX.length);
  if (!slug || slug.includes(".")) return "";
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(slug) ? slug : "";
}

function getAgencySlug(hostname) {
  const slug = getSingleSubdomain(hostname);
  return slug && !RESERVED_SUBDOMAINS.has(slug) ? slug : "";
}

function isReservedSubdomain(hostname) {
  return RESERVED_SUBDOMAINS.has(getSingleSubdomain(hostname));
}

function rewriteApexRedirect(response, originalUrl) {
  const location = response.headers.get("location");
  if (!location) return response;

  let redirectUrl;
  try {
    redirectUrl = new URL(location, `https://${APEX_HOST}`);
  } catch {
    return response;
  }
  if (redirectUrl.hostname !== APEX_HOST) return response;

  redirectUrl.protocol = originalUrl.protocol;
  redirectUrl.username = "";
  redirectUrl.password = "";
  redirectUrl.hostname = originalUrl.hostname;
  redirectUrl.port = originalUrl.port;
  const headers = new Headers(response.headers);
  headers.set("location", redirectUrl.toString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function fetchApex(request) {
  const originalUrl = new URL(request.url);
  const upstreamUrl = new URL(request.url);
  upstreamUrl.protocol = "https:";
  upstreamUrl.hostname = APEX_HOST;
  upstreamUrl.port = "";

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", originalUrl.hostname);
  headers.set("x-forwarded-proto", originalUrl.protocol.slice(0, -1));
  headers.delete("x-canva-viagem-agency");
  const upstreamRequest = new Request(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });
  return rewriteApexRedirect(await fetch(upstreamRequest), originalUrl);
}

function isLikelyAssetPath(pathname) {
  return /\.[a-z0-9]{2,8}$/i.test(pathname) && !pathname.toLowerCase().endsWith(".html");
}

async function fetchPublishedSite(request, env, slug) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Método não permitido.", {
      status: 405,
      headers: { allow: "GET, HEAD" },
    });
  }

  const requestUrl = new URL(request.url);
  if (isLikelyAssetPath(requestUrl.pathname)) {
    return new Response("Recurso não encontrado.", { status: 404 });
  }

  if (!env?.SUPABASE_URL || !env?.SUPABASE_ANON_KEY) {
    return new Response("Canva Viagem: roteador não configurado.", { status: 503 });
  }

  let endpoint;
  try {
    const supabaseUrl = new URL(env.SUPABASE_URL);
    if (supabaseUrl.protocol !== "https:") throw new Error("invalid protocol");
    endpoint = new URL("/rest/v1/public_sites", supabaseUrl);
  } catch {
    return new Response("Canva Viagem: roteador não configurado.", { status: 503 });
  }
  endpoint.searchParams.set("id", `eq.${slug}`);
  endpoint.searchParams.set("is_active", "eq.true");
  endpoint.searchParams.set("select", "html,locale");
  endpoint.searchParams.set("limit", "1");

  let upstream;
  try {
    upstream = await fetch(endpoint, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        accept: "application/json",
      },
    });
  } catch {
    return new Response("Canva Viagem: falha temporária ao carregar o site.", { status: 502 });
  }
  if (!upstream.ok) {
    return new Response("Canva Viagem: falha temporária ao carregar o site.", { status: 502 });
  }

  let rows;
  try {
    rows = await upstream.json();
  } catch {
    return new Response("Canva Viagem: resposta inválida da publicação.", { status: 502 });
  }
  const publishedSite = Array.isArray(rows) ? rows[0] : null;
  if (!publishedSite || typeof publishedSite.html !== "string" || !publishedSite.html.trim()) {
    return new Response("Site não encontrado.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const responseHeaders = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "public, max-age=0, must-revalidate",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
  });
  if (publishedSite.locale) responseHeaders.set("content-language", String(publishedSite.locale));
  const responseHtml = upgradePublishedSiteWhatsApp(publishedSite.html);
  return new Response(request.method === "HEAD" ? null : responseHtml, {
    status: 200,
    headers: responseHeaders,
  });
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    if (requestUrl.pathname === "/__health" && requestUrl.hostname.endsWith(".workers.dev")) {
      return Response.json({ ok: true, service: "canva-viagem-agency-router" });
    }

    if (isReservedSubdomain(requestUrl.hostname)) return fetchApex(request);

    const agencySlug = getAgencySlug(requestUrl.hostname);
    if (!agencySlug) {
      return new Response("Canva Viagem: subdomínio inválido.", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    return fetchPublishedSite(request, env, agencySlug);
  },
};

export {
  fetchPublishedSite,
  getAgencySlug,
  isLikelyAssetPath,
  isReservedSubdomain,
  rewriteApexRedirect,
  upgradePublishedSiteWhatsApp,
};
