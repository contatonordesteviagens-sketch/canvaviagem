import type { FabricaState } from "@/hooks/useFabricaContext";
import { calculateScore, getChecklistByLevel } from "./fabrica-scoring";

/**
 * Baixa o PDF do diagnóstico.
 * O desenho do PDF mora em fabrica-pdf-doc.ts e só é buscado aqui, na hora do clique: antes, abrir a
 * Fábrica ou a Minha Conta já baixava o jsPDF inteiro, mesmo para quem nunca pede o PDF.
 */
export async function generateDiagnosticoPDF(state: FabricaState) {
  const { generateDiagnosticoPDF: gerar } = await import("./fabrica-pdf-doc");
  return gerar(state);
}

export function buildWhatsappResumo(state: FabricaState): string {
  const result = calculateScore(state);
  const checklist = getChecklistByLevel(result.level, state);
  const top3 = result.gargalos.filter((g) => g.level !== "green").slice(0, 3);

  const fmtList = (items: { text: string }[]) =>
    items.map((i) => `- ${i.text}`).join("\n");

  return `*DIAGNÓSTICO CANVA VIAGEM*

*${state.agencyName || "Agencia"}*${state.city ? ` - ${state.city}` : ""}
${state.instagram ? `Instagram: @${state.instagram}\n` : ""}
*Score Digital: ${result.digitalScore}/100*
Nivel ${result.level} - ${result.levelName}

*Principais gargalos:*
${top3.map((g) => `• *${g.dimension}*: ${g.text}`).join("\n")}

*PLANO DE ACAO*

*IMEDIATO (ate 7 dias):*
${fmtList(checklist.imediato)}

*PROXIMOS 15 DIAS:*
${fmtList(checklist.quinzeDias)}

*MES 2 EM DIANTE:*
${fmtList(checklist.mesDois)}

Sistema completo: canvaviagem.com/fabrica`;
}

/**
 * Abre o WhatsApp com o resumo do diagnostico.
 * Se phoneFull (ex: "5511999998888") for passado, envia direto para esse numero.
 * Caso contrario, abre o seletor de contato (sem numero).
 */
export function openWhatsappWithResumo(state: FabricaState, phoneFull?: string) {
  const text = encodeURIComponent(buildWhatsappResumo(state));
  // wa.me funciona mais consistentemente que api.whatsapp.com (que pode bloquear iframe/preview)
  const cleanPhone = phoneFull ? phoneFull.replace(/\D/g, "") : "";
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${text}`
    : `https://wa.me/?text=${text}`;
  window.open(url, "_blank");
}
