(globalThis as any).import = { meta: { env: { VITE_SUPABASE_URL: "" } } };
import { buildLandingHTML } from "./src/lib/fabrica-html-export.ts";

const state = {
  primaryColor: "#0F2742",
  siteContent: {
    animationEffect: "namorados_pulse",
    animationLocation: "all",
  },
  selectedPackages: [],
  depoimentos: [],
};

const html = buildLandingHTML(state as any);
console.log("has pulse animation:", html.includes("romanticPulse"));
console.log("has query selector:", html.includes("document.querySelectorAll"));
console.log("HTML length:", html.length);
