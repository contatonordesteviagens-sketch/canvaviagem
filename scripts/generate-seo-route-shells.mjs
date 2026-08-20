import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const siteUrl = "https://canvaviagem.com";

const routes = [
  {
    path: "/carrosseis-para-agencia-de-viagens",
    title: "Carrosséis para agência de viagens | Canva Viagem",
    description: "Crie carrosséis, artes para Feed e Stories para sua agência de viagens. Personalize destino, oferta, preço e identidade visual antes de publicar.",
    image: `${siteUrl}/travel-carousel-assets/cancun-card-01.webp`,
    fallback: `
      <main>
        <h1>Carrosséis para agência de viagens</h1>
        <p>O Canva Viagem ajuda agências de viagens a criar carrosséis para destinos, ofertas, roteiros e conteúdo editorial. Personalize preço, condições, logo e cores da agência antes de exportar para Feed ou Stories.</p>
        <h2>O que a ferramenta permite criar</h2>
        <ul>
          <li>Carrosséis para Feed nos formatos 4:5 e 1:1.</li>
          <li>Artes de oferta e versões verticais para Stories.</li>
          <li>Peças personalizadas com os dados da sua agência.</li>
        </ul>
        <p><a href="${siteUrl}/planos">Conheça os planos do Canva Viagem</a> ou leia o <a href="${siteUrl}/blog/canva-para-agencia-de-viagem">guia de conteúdo para agências de viagens</a>.</p>
      </main>`,
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${siteUrl}/carrosseis-para-agencia-de-viagens#webpage`,
          url: `${siteUrl}/carrosseis-para-agencia-de-viagens`,
          name: "Carrosséis para agência de viagens | Canva Viagem",
          description: "Criação de carrosséis, artes para Feed e Stories para agências de viagens.",
          inLanguage: "pt-BR",
          isPartOf: { "@id": `${siteUrl}/#website` },
          about: { "@type": "Thing", name: "Marketing para agências de viagens" },
        },
        {
          "@type": "SoftwareApplication",
          name: "Canva Viagem — Carrosséis para Agências",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: "pt-BR",
          url: `${siteUrl}/carrosseis-para-agencia-de-viagens`,
          description: "Ferramenta para criar carrosséis, artes de Feed e Stories para agências de viagens.",
          publisher: { "@type": "Organization", name: "Canva Viagem", url: siteUrl },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Carrosséis para agência de viagens", item: `${siteUrl}/carrosseis-para-agencia-de-viagens` },
          ],
        },
      ],
    },
  },
  {
    path: "/site-para-agencia-de-viagens",
    title: "Site para agência de viagens | Canva Viagem",
    description: "Crie e publique o site da sua agência de viagens sem programador. Escolha um modelo de turismo, adicione pacotes e receba pedidos de orçamento no WhatsApp.",
    image: `${siteUrl}/site-canva-viagem.webp`,
    fallback: `
      <main>
        <h1>Site para agência de viagens</h1>
        <p>O Canva Viagem permite publicar um site para agência de viagens com modelos feitos para turismo, páginas de pacotes, formulário de orçamento e botão de WhatsApp.</p>
        <h2>Como funciona</h2>
        <ol>
          <li>Escolha um modelo adequado à sua agência.</li>
          <li>Adicione sua marca, informações e pacotes de viagem.</li>
          <li>Publique o site e envie o endereço aos interessados.</li>
        </ol>
        <p>O site organiza a apresentação da agência e a captação de pedidos. Vendas dependem também da oferta, divulgação, atendimento e demanda.</p>
        <p><a href="${siteUrl}/planos">Conheça os planos do Canva Viagem</a> e veja o <a href="${siteUrl}/blog/marketing-digital-para-agencia-de-viagem">guia de marketing digital para agências</a>.</p>
      </main>`,
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${siteUrl}/site-para-agencia-de-viagens#webpage`,
          url: `${siteUrl}/site-para-agencia-de-viagens`,
          name: "Site para agência de viagens | Canva Viagem",
          description: "Construtor de sites para agências de viagens com pacotes, formulário de orçamento e WhatsApp.",
          inLanguage: "pt-BR",
          isPartOf: { "@id": `${siteUrl}/#website` },
          about: { "@type": "Thing", name: "Site para agência de viagens" },
        },
        {
          "@type": "SoftwareApplication",
          name: "Canva Viagem — Sites para Agências",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: "pt-BR",
          url: `${siteUrl}/site-para-agencia-de-viagens`,
          description: "Construtor de site para agências de viagens com modelos de turismo, páginas de pacotes, orçamento e WhatsApp.",
          publisher: { "@type": "Organization", name: "Canva Viagem", url: siteUrl },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Site para agência de viagens", item: `${siteUrl}/site-para-agencia-de-viagens` },
          ],
        },
      ],
    },
  },
];

const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const setMeta = (html, attribute, key, content) => {
  const matcher = new RegExp(`<meta\\s+${attribute}=["']${key}["'][^>]*>`, "i");
  const replacement = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  return matcher.test(html) ? html.replace(matcher, replacement) : html.replace("</head>", `  ${replacement}\n</head>`);
};

const buildRouteHtml = (baseHtml, route) => {
  const url = `${siteUrl}${route.path}`;
  let html = baseHtml.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(route.title)}</title>`);
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}" />`);
  html = setMeta(html, "name", "description", route.description);
  html = setMeta(html, "property", "og:title", route.title);
  html = setMeta(html, "property", "og:description", route.description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "og:image", route.image);
  html = setMeta(html, "name", "twitter:title", route.title);
  html = setMeta(html, "name", "twitter:description", route.description);
  html = setMeta(html, "name", "twitter:image", route.image);
  const schema = `<script type="application/ld+json">${JSON.stringify(route.schema)}</script>`;
  html = html.replace("</head>", `  ${schema}\n</head>`);
  return html.replace('<div id="root"></div>', `<div id="seo-fallback">${route.fallback}</div><div id="root"></div>`);
};

const distDir = join(process.cwd(), "dist");
const baseHtml = await readFile(join(distDir, "index.html"), "utf8");

for (const route of routes) {
  const target = join(distDir, route.path.slice(1), "index.html");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buildRouteHtml(baseHtml, route), "utf8");
}

// Vercel's filesystem handler serves each generated route shell before the SPA fallback.
// Keep a copy at the route's .html path for static hosts that do not resolve folder indexes.
for (const route of routes) {
  const source = join(distDir, route.path.slice(1), "index.html");
  await cp(source, join(distDir, `${route.path.slice(1)}.html`));
}
