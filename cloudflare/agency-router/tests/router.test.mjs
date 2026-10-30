import assert from "node:assert/strict";
import test from "node:test";
import worker, {
  getAgencySlug,
  isLikelyAssetPath,
  isReservedSubdomain,
  rewriteApexRedirect,
  upgradePublishedSiteWhatsApp,
  cleanLegacyPublishedSite,
} from "../src/index.js";

const TEST_ENV = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_ANON_KEY: "public-anon-key",
};

test("aceita somente subdomínio simples de agência", () => {
  assert.equal(getAgencySlug("minha-agencia.canvaviagem.com"), "minha-agencia");
  assert.equal(getAgencySlug("WWW.canvaviagem.com"), "");
  assert.equal(getAgencySlug("a.sites.canvaviagem.com"), "");
  assert.equal(getAgencySlug("canvaviagem.com"), "");
  assert.equal(getAgencySlug("-invalido.canvaviagem.com"), "");
});

test("reconhece somente subdomínios reservados simples", () => {
  for (const name of ["www", "app", "admin", "api", "painel", "blog", "sites"]) {
    assert.equal(isReservedSubdomain(`${name}.canvaviagem.com`), true);
  }
  assert.equal(isReservedSubdomain("agencia.canvaviagem.com"), false);
  assert.equal(isReservedSubdomain("app.outro.canvaviagem.com"), false);
  assert.equal(isReservedSubdomain("app.example.com"), false);
});

test("encaminha reservados ao apex sem identidade de agência", async () => {
  const originalFetch = globalThis.fetch;
  const upstreamRequests = [];
  globalThis.fetch = async (request) => {
    upstreamRequests.push(request);
    return new Response("ok", { status: 200 });
  };

  try {
    for (const name of ["www", "app", "admin", "api", "painel", "blog", "sites"]) {
      const response = await worker.fetch(new Request(`https://${name}.canvaviagem.com/`, {
        headers: {
          host: "origem-forjada.example.com",
          "x-canva-viagem-agency": "identidade-forjada",
          "x-forwarded-host": "origem-forjada.example.com",
          "x-forwarded-proto": "http",
        },
      }), TEST_ENV);
      assert.equal(response.status, 200);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(upstreamRequests.length, 7);
  upstreamRequests.forEach((request, index) => {
    const reservedName = ["www", "app", "admin", "api", "painel", "blog", "sites"][index];
    assert.equal(new URL(request.url).hostname, "canvaviagem.com");
    assert.equal(request.headers.get("host"), null);
    assert.equal(request.headers.get("x-forwarded-host"), `${reservedName}.canvaviagem.com`);
    assert.equal(request.headers.get("x-forwarded-proto"), "https");
    assert.equal(request.headers.get("x-canva-viagem-agency"), null);
  });
});

test("busca somente o HTML público da agência no Supabase", async () => {
  const originalFetch = globalThis.fetch;
  let upstreamRequest;
  globalThis.fetch = async (input, init) => {
    upstreamRequest = new Request(input, init);
    return Response.json([{ html: "<!doctype html><title>Agência</title>", locale: "pt-BR" }]);
  };

  try {
    const response = await worker.fetch(new Request("https://minha-agencia.canvaviagem.com/pacote/lagoa-azul", {
      headers: { "x-canva-viagem-agency": "identidade-forjada" },
    }), TEST_ENV);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "<!doctype html><title>Agência</title>");
    assert.equal(response.headers.get("content-language"), "pt-BR");
  } finally {
    globalThis.fetch = originalFetch;
  }

  const upstreamUrl = new URL(upstreamRequest.url);
  assert.equal(upstreamUrl.hostname, "project.supabase.co");
  assert.equal(upstreamUrl.pathname, "/rest/v1/public_sites");
  assert.equal(upstreamUrl.searchParams.get("id"), "eq.minha-agencia");
  assert.equal(upstreamUrl.searchParams.get("is_active"), "eq.true");
  assert.equal(upstreamRequest.headers.get("apikey"), TEST_ENV.SUPABASE_ANON_KEY);
  assert.equal(upstreamRequest.headers.get("x-canva-viagem-agency"), null);
});

test("corrige o WhatsApp de publicações antigas sem regravar o HTML", () => {
  const legacyHtml = `<!doctype html><html><head><title>Agência</title></head><body><a href="#" class="wpp-float" aria-label="WhatsApp">💬</a></body></html>`;
  const upgraded = upgradePublishedSiteWhatsApp(legacyHtml);
  assert.match(upgraded, /id="cv-whatsapp-edge-fix"/);
  assert.match(upgraded, /class="wpp-float"/);
  assert.match(upgraded, /<svg viewBox="0 0 24 24"/);
  assert.doesNotMatch(upgraded, />💬<\/a>/);
  assert.match(upgraded, /left:auto!important/);
  assert.match(upgraded, /right:max\(20px,env\(safe-area-inset-right\)\)!important/);
  assert.equal(upgradePublishedSiteWhatsApp(upgraded), upgraded);
});

test("site suspenso ou inexistente redireciona para o Canva Viagem", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json([]);
  try {
    const response = await worker.fetch(new Request("https://sem-site.canvaviagem.com/"), TEST_ENV);
    assert.equal(response.status, 302);
    const location = new URL(response.headers.get("location"));
    assert.equal(location.origin + location.pathname, "https://canvaviagem.com/inicio");
    assert.equal(location.searchParams.get("utm_source"), "site_suspenso");
    assert.equal(location.searchParams.get("utm_campaign"), "sem-site");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("retorna 502 sem vazar detalhes quando o Supabase falha", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("detalhe privado", { status: 500 });
  try {
    const response = await worker.fetch(new Request("https://agencia.canvaviagem.com/"), TEST_ENV);
    assert.equal(response.status, 502);
    assert.doesNotMatch(await response.text(), /detalhe privado/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("retorna 502 quando a rede do Supabase falha", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError("network unavailable");
  };
  try {
    const response = await worker.fetch(new Request("https://agencia.canvaviagem.com/"), TEST_ENV);
    assert.equal(response.status, 502);
    assert.doesNotMatch(await response.text(), /network unavailable/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejeita host inválido sem consultar o upstream", async () => {
  const originalFetch = globalThis.fetch;
  let fetched = false;
  globalThis.fetch = async () => {
    fetched = true;
    return new Response("não deveria executar");
  };
  try {
    const response = await worker.fetch(new Request("https://app.outro.canvaviagem.com/"), TEST_ENV);
    assert.equal(response.status, 404);
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.equal(fetched, false);
});

test("rejeita escrita no hostname público da agência", async () => {
  const response = await worker.fetch(new Request("https://agencia.canvaviagem.com/", {
    method: "POST",
    body: "dados-do-formulario",
  }), TEST_ENV);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
});

test("não devolve HTML para caminho de asset inexistente", async () => {
  assert.equal(isLikelyAssetPath("/assets/app.js"), true);
  assert.equal(isLikelyAssetPath("/pacote/lagoa-azul"), false);
  const response = await worker.fetch(new Request("https://agencia.canvaviagem.com/assets/inexistente.js"), TEST_ENV);
  assert.equal(response.status, 404);
});

test("expõe health check somente na prévia workers.dev", async () => {
  const previewResponse = await worker.fetch(new Request(
    "https://canva-viagem-agency-router-preview.conta.workers.dev/__health",
  ), TEST_ENV);
  assert.equal(previewResponse.status, 200);

  const invalidResponse = await worker.fetch(new Request(
    "https://app.outro.canvaviagem.com/__health",
  ), TEST_ENV);
  assert.equal(invalidResponse.status, 404);
});

test("mantém o subdomínio ao reescrever redirect do apex", () => {
  const response = new Response(null, {
    status: 302,
    headers: { location: "https://canvaviagem.com/fabrica?origem=teste" },
  });
  const rewritten = rewriteApexRedirect(response, new URL("https://agencia.canvaviagem.com/"));
  assert.equal(rewritten.headers.get("location"), "https://agencia.canvaviagem.com/fabrica?origem=teste");
});

test("remove credenciais e porta inesperada ao reescrever redirect", () => {
  const response = new Response(null, {
    status: 302,
    headers: { location: "https://usuario:senha@canvaviagem.com:8443/fabrica" },
  });
  const rewritten = rewriteApexRedirect(response, new URL("https://agencia.canvaviagem.com/"));
  assert.equal(rewritten.headers.get("location"), "https://agencia.canvaviagem.com/fabrica");
});

test("não altera redirect externo", () => {
  const response = new Response(null, {
    status: 302,
    headers: { location: "https://example.com/continuar" },
  });
  const rewritten = rewriteApexRedirect(response, new URL("https://agencia.canvaviagem.com/"));
  assert.equal(rewritten.headers.get("location"), "https://example.com/continuar");
});

test("remove números de exemplo do gerador antigo e mantém o que a agência digitou", () => {
  const stat = (i, num, label) => `<div data-visual-removable="stat-${i}"><div class="stat-num">${num}</div><div class="stat-label">${label}</div></div>`;
  const html = `<html lang="pt-BR"><body><div class="stats-bar">${stat(0, "15", "Anos de Experiência")}${stat(1, "15k+", "Viajantes Felizes")}${stat(2, "25", "Países Atendidos")}${stat(3, "99%", "Satisfação")}</div></body></html>`;
  const out = cleanLegacyPublishedSite(html);
  assert.ok(out.includes('<div class="stat-num">15</div>'));
  assert.equal(out.includes("15k+"), false);
  assert.equal(out.includes("Países Atendidos"), false);
  assert.equal(out.includes("99%"), false);
});

test("apaga a barra de números quando todos eram de exemplo", () => {
  const stat = (i, num, label) => `<div data-visual-removable="stat-${i}"><div class="stat-num">${num}</div><div class="stat-label">${label}</div></div>`;
  const html = `<html lang="pt-BR"><body><section><div class="stats-bar">${stat(0, "12+", "Anos")}${stat(1, "15k+", "Viajantes")}${stat(2, "25", "Países")}${stat(3, "99%", "Satisfação")}</div></section></body></html>`;
  const out = cleanLegacyPublishedSite(html);
  assert.equal(out.includes("stats-bar"), false);
  assert.equal(out.includes("stat-num"), false);
});

test("traduz o subtítulo em espanhol só em site português e não mexe em HTML sem números", () => {
  const pt = `<html lang="pt-BR"><head><title>X — Consultoría Premium de Viajes</title></head><body><span class="eyebrow">Consultoría Premium de Viajes</span></body></html>`;
  assert.equal((cleanLegacyPublishedSite(pt).match(/Consultoria Premium de Viagens/g) || []).length, 2);
  const es = `<html lang="es"><body><span class="eyebrow">Consultoría Premium de Viajes</span></body></html>`;
  assert.equal(cleanLegacyPublishedSite(es), es);
  const plain = `<html lang="pt-BR"><body><p>Sem barra</p></body></html>`;
  assert.equal(cleanLegacyPublishedSite(plain), plain);
});
