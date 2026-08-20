import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// O HTML de produção inclui um fallback semântico para crawlers e usuários sem
// JavaScript. Removemos apenas esse fallback depois que o aplicativo carrega.
document.getElementById("seo-fallback")?.remove();

createRoot(document.getElementById("root")!).render(<App />);
