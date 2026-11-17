export const isLocalPreviewEnabled = () => {
  // Só no servidor de desenvolvimento: o build de produção nunca libera nada por estar em localhost.
  if (!import.meta.env.DEV) return false;
  if (typeof window === "undefined") return false;

  const { hostname } = window.location;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  );
};
