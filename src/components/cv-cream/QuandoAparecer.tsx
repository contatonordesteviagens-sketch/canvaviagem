import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Só mostra o conteúdo quando ele está perto de entrar na tela.
 * Serve para o que é pesado e fica embaixo (faixas de arte, vídeos): a primeira carga da página
 * fica leve e o arquivo só é baixado quando a pessoa chega lá.
 * O espaço é reservado antes (minHeight), então nada pula de lugar quando o conteúdo entra.
 * Navegador sem IntersectionObserver mostra tudo de uma vez, como era antes.
 */
export function QuandoAparecer({
  children,
  minHeight,
  margem = "400px",
  className = "",
  style,
}: {
  children: ReactNode;
  /** altura reservada enquanto o conteúdo não chega (evita salto de layout) */
  minHeight: number | string;
  /** quanto antes da tela começar a carregar */
  margem?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const alvo = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    if (visivel) return;
    const el = alvo.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisivel(true);
          obs.disconnect();
        }
      },
      { rootMargin: margem },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visivel, margem]);

  return (
    <div ref={alvo} className={className} style={{ minHeight: visivel ? undefined : minHeight, ...style }}>
      {visivel ? children : null}
    </div>
  );
}
