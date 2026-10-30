import { replacePortugueseSiteDefault } from "@/lib/fabrica-site-pt-defaults";
import { LEGACY_EXAMPLE_STATS } from "@/lib/site-honest-content";

/** Display-time compatibility for already-published Portuguese sites; never updates stored HTML. */
export function improvePublishedPortugueseSite(html: string, locale: string | null): string {
  if (locale !== "pt-BR" || !html.includes('lang="pt-BR"')) return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc.body.matches(".template-roteiros, .template-standard, .template-horizonte, .template-ofertas, .template-experiencias, .template-expedicoes, .template-excursoes")) return html;

  const selectors = [
    ".hero .eyebrow", ".hero .hero-actions .btn", ".stats-bar .stat-label",
    ".processo .section-eyebrow", ".processo .section-title", ".proc-card h3", ".proc-card p",
    "#destinos .section-eyebrow", "#destinos .section-title", "#por-que .badge-counter", "#por-que .eyebrow",
    "#por-que .equipe-left h2", "#por-que .equipe-left .intro", "#por-que .feat h4", "#por-que .feat p",
    "#orcamento .eyebrow", "#orcamento h2", "#orcamento .orc-info > p", "#orcamento .contact-item span", ".orc-form .form-submit",
    ".depo-bg .section-eyebrow", ".depo-bg .section-title", ".depo-verified", "#faq .section-eyebrow", "#faq .section-title", ".faq-item summary", ".faq-item p",
    ".final-cta h2", ".final-cta .btn", ".foot-desc", ".foot-grid h4", ".foot-grid li", ".foot-grid a", ".foot-bottom [data-site-edit-key]", ".site-header .nav-links a",
  ];
  for (const element of doc.querySelectorAll<HTMLElement>(selectors.join(","))) {
    if (element.children.length) continue;
    const text = element.textContent;
    const translated = replacePortugueseSiteDefault(text || "");
    if (translated === text) continue;
    // Texto de fábrica com número ou promessa que não tem versão neutra (selo "+15k", horário de exemplo): some.
    if (!translated) element.closest(".badge-counter, .contact-item, li")?.remove();
    else element.textContent = translated;
  }

  // Números de exemplo ("12+ anos", "15k+ viajantes", "25 países", "99% satisfação") publicados
  // antes da regra "só aparece o que a agência preencheu": somem na exibição.
  const sampleNums = new Set(LEGACY_EXAMPLE_STATS.map((s) => s.num));
  for (const stat of doc.querySelectorAll<HTMLElement>(".stats-bar .stat-num")) {
    const num = (stat.textContent || "").trim();
    // `.stat-num` é um div: `closest("div")` pegaria ele mesmo e deixaria o rótulo órfão.
    if (sampleNums.has(num)) (stat.closest("[data-visual-removable]") ?? stat.parentElement)?.remove();
  }
  const barLeft = doc.querySelector(".stats-bar");
  if (barLeft && !barLeft.querySelector(".stat-num")) barLeft.remove();

  // Subtítulo do topo em espanhol num site em português (padrão antigo do estado).
  for (const el of doc.querySelectorAll<HTMLElement>(".hero .eyebrow, title")) {
    if (/Consultor[íi]a Premium de Viajes/i.test(el.textContent || "")) el.textContent = (el.textContent || "").replace(/Consultor[íi]a Premium de Viajes/gi, "Consultoria Premium de Viagens");
  }

  const teamEyebrow = doc.querySelector<HTMLElement>('#por-que .eyebrow[style="color:#fff;opacity:.6"]');
  teamEyebrow?.removeAttribute("style");
  const style = doc.createElement("style");
  style.textContent = `
body:is(.template-ofertas,.template-excursoes) .equipe{color:var(--ink)}
body:is(.template-ofertas,.template-excursoes) .equipe-left h2,
body:is(.template-ofertas,.template-excursoes) .feat h4{color:var(--ink)}
body:is(.template-ofertas,.template-excursoes) .equipe .eyebrow{color:var(--brand-dark)}
body:is(.template-ofertas,.template-excursoes) .feat-icon{background:color-mix(in srgb,var(--brand) 10%,transparent)}
footer[style*="--section-bg"] [data-protected-brand]{color:var(--section-contrast)!important}
`;
  doc.head.appendChild(style);
  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}