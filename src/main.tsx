import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// O HTML de produção inclui um fallback semântico para crawlers e usuários sem
// JavaScript. Removemos apenas esse fallback depois que o aplicativo carrega.
document.getElementById("seo-fallback")?.remove();

// Após um novo deploy, abas abertas podem pedir arquivos de páginas antigos
// que não existem mais. Recarregamos uma única vez para buscar a versão nova.
const RELOAD_KEY = "chunk-reload-at";
const reloadOnStaleChunk = () => {
  const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
  if (Date.now() - last < 10_000) return;
  sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  window.location.reload();
};
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  reloadOnStaleChunk();
});
window.addEventListener("unhandledrejection", (event) => {
  const msg = String((event.reason as Error)?.message || event.reason || "");
  if (/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(msg)) {
    event.preventDefault();
    reloadOnStaleChunk();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
