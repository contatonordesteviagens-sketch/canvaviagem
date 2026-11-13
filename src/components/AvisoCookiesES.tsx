import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ehCaminhoES } from "@/lib/idioma-es";
import { consentimientoCookiesES, guardarConsentimientoCookiesES, type ConsentimientoCookiesES } from "@/lib/cookies-es";
import { ehFluxoESAtual, iniciarRastreamento } from "@/lib/rastreamento-consentimento";

/**
 * Aviso de cookies só para os caminhos que começam com /es. Nas páginas brasileiras não aparece.
 * Consentimento de verdade: nas rotas do fluxo espanhol, os pixels do Meta, a etiqueta do Google Ads e a
 * analítica identificável só entram depois do "Aceptar" (index.html + src/lib/rastreamento-consentimento.ts).
 * "Rechazar" ou sem escolha: nada carrega.
 */
export function AvisoCookiesES() {
  const { pathname, search } = useLocation();
  const [escolha, setEscolha] = useState<ConsentimientoCookiesES | null>(consentimientoCookiesES);

  // Navegação SPA: quem sai do fluxo espanhol para uma rota brasileira sem ter aceitado cai na regra
  // brasileira, e o rastreamento carrega ali (se já carregou, não faz nada).
  useEffect(() => {
    if (!ehFluxoESAtual()) iniciarRastreamento();
  }, [pathname, search]);

  if (!ehCaminhoES(pathname) || escolha) return null;

  const escolher = (valor: ConsentimientoCookiesES) => {
    guardarConsentimientoCookiesES(valor);
    setEscolha(valor);
  };

  return (
    <div
      lang="es-ES"
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-3"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="flex w-full max-w-2xl flex-col gap-3 rounded-2xl border p-4 shadow-[0_18px_40px_-18px_rgba(0,0,0,.45)] sm:flex-row sm:items-center"
        style={{ pointerEvents: "auto", background: "#ffffff", color: "#201c13", borderColor: "#e3dcc6" }}
      >
        <p className="flex-1 text-[13px] leading-5">
          Solo cargamos los píxeles de Meta y Google Ads (para medir nuestra publicidad) y nuestra analítica si pulsas «Aceptar». Si rechazas, no se carga nada.{" "}
          <a href="/es/privacidad#cookies" className="font-semibold underline">Más información</a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => escolher("rechazado")}
            className="h-10 flex-1 rounded-full border px-4 text-[13px] font-bold sm:flex-none"
            style={{ borderColor: "#201c13", background: "#ffffff", color: "#201c13" }}
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => escolher("aceptado")}
            className="h-10 flex-1 rounded-full px-4 text-[13px] font-bold sm:flex-none"
            style={{ background: "#201c13", color: "#ffffff" }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
