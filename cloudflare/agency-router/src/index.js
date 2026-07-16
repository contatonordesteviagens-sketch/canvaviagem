const APEX_HOST = "canvaviagem.com";
const AGENCY_HOST_SUFFIX = `.${APEX_HOST}`;
const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api", "painel", "blog", "sites"]);

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
  return new Response(request.method === "HEAD" ? null : publishedSite.html, {
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
};
