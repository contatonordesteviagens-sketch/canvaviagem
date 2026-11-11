import { useEffect, useState } from "react";

/**
 * Devolve o valor só depois que a pessoa para de digitar (300 ms por padrão).
 * O campo continua respondendo na hora; quem espera é a filtragem ou a consulta que depende do valor.
 * Campo vazio vale na hora: limpar a busca não fica esperando.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (value === "" || value === null || value === undefined) {
      setDebounced(value);
      return;
    }
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
