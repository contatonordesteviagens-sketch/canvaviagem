import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Paginação de listas longas: mostra uma página por vez e libera as próximas no botão "Carregar mais".
 * A lista completa continua disponível para quem chama (contadores e exportação CSV usam todos os itens).
 * Quando o filtro ou a busca mudam (resetKey), volta para a primeira página.
 */
export function useLoadMore<T>(items: T[], pageSize = 50, resetKey: unknown = "") {
  const [limit, setLimit] = useState(pageSize);

  useEffect(() => {
    setLimit(pageSize);
  }, [resetKey, pageSize]);

  const visible = useMemo(() => items.slice(0, limit), [items, limit]);

  return {
    visible,
    total: items.length,
    shown: visible.length,
    hasMore: items.length > limit,
    loadMore: () => setLimit((n) => n + pageSize),
    showAll: () => setLimit(items.length),
  };
}

type LoadMoreProps = {
  shown: number;
  total: number;
  hasMore: boolean;
  onLoadMore: () => void;
  pageSize?: number;
  /** nome do item no plural: "usuários", "legendas"... */
  label?: string;
  className?: string;
};

export function LoadMore({ shown, total, hasMore, onLoadMore, pageSize = 50, label = "itens", className = "" }: LoadMoreProps) {
  if (!total) return null;
  const proximos = Math.min(pageSize, total - shown);
  return (
    <div className={`flex flex-col items-center gap-2 py-4 ${className}`}>
      <p className="text-xs text-muted-foreground">
        Mostrando {shown} de {total} {label}
      </p>
      {hasMore && (
        <Button variant="outline" size="sm" onClick={onLoadMore}>
          Carregar mais {proximos}
        </Button>
      )}
    </div>
  );
}
