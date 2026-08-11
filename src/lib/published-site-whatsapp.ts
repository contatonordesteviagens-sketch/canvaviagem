const WHATSAPP_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.148-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.895 9.825 9.825 0 0 1 2.9 6.988c-.003 5.45-4.437 9.884-9.893 9.884M20.463 3.488A11.815 11.815 0 0 0 12.056 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.89 11.89 0 0 0 5.689 1.448h.005c6.559 0 11.895-5.335 11.898-11.893a11.82 11.82 0 0 0-3.49-8.413Z"/></svg>`;

const WHATSAPP_RUNTIME_FIX = `<style id="cv-whatsapp-runtime-fix">
.wpp-float{position:fixed!important;left:auto!important;right:max(20px,env(safe-area-inset-right))!important;bottom:max(20px,env(safe-area-inset-bottom))!important;width:58px!important;height:58px!important;border-radius:50%!important;background:#25D366!important;color:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:9999!important;overflow:visible!important}
.wpp-float svg{display:block!important;width:31px!important;height:31px!important;fill:currentColor!important}
@media(max-width:640px){.wpp-float{right:max(16px,env(safe-area-inset-right))!important;bottom:max(16px,env(safe-area-inset-bottom))!important;width:54px!important;height:54px!important}.wpp-float svg{width:29px!important;height:29px!important}}
</style>`;

/**
 * Corrige publicações antigas no momento da exibição, sem regravar o HTML do cliente.
 * Novas publicações já saem corrigidas diretamente pelos geradores.
 */
export const upgradePublishedSiteWhatsApp = (html: string): string => {
  if (!html || !html.includes("wpp-float")) return html;

  const withBrandIcon = html.replace(
    /<a([^>]*class="[^"]*\bwpp-float\b[^"]*"[^>]*)>[\s\S]*?<\/a>/gi,
    (_match, attributes: string) => `<a${attributes}>${WHATSAPP_SVG}</a>`,
  );

  if (withBrandIcon.includes('id="cv-whatsapp-runtime-fix"')) return withBrandIcon;
  if (/<\/head>/i.test(withBrandIcon)) {
    return withBrandIcon.replace(/<\/head>/i, `${WHATSAPP_RUNTIME_FIX}</head>`);
  }
  return `${WHATSAPP_RUNTIME_FIX}${withBrandIcon}`;
};
