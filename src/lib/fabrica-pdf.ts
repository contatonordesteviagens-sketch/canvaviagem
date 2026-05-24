import jsPDF from "jspdf";
import type { FabricaState } from "@/hooks/useFabricaContext";
import { calculateScore, getChecklistByLevel } from "./fabrica-scoring";

const COLORS = {
  bg: [13, 20, 37] as [number, number, number],
  primary: [245, 158, 11] as [number, number, number],
  text: [30, 30, 40] as [number, number, number],
  muted: [110, 110, 120] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  light: [248, 250, 252] as [number, number, number],
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;

// Remove apenas emojis/pictogramas; PRESERVA acentos PT (helvetica latin-1).
// Normaliza aspas curvas e caracteres tipograficos para ASCII equivalente.
function clean(text: string): string {
  if (!text) return "";
  return text
    // remove emojis e simbolos pictograficos
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{2300}-\u{23FF}]/gu, "")
    .replace(/[\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "")
    .replace(/[\u{200D}]/gu, "")
    // simbolos decorativos especificos
    .replace(/[▢●○■□◆◇★☆►▶◀◄→←↑↓]/g, "")
    .replace(/[✓✔]/g, "OK")
    .replace(/[✗✘]/g, "X")
    // aspas/traco tipograficos -> ASCII
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - 20) {
    addFooter(doc);
    doc.addPage();
    return 20;
  }
  return y;
}

function addFooter(doc: jsPDF) {
  const pageNum = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.text(
    clean(`Diagnóstico Canva Viagem · Página ${pageNum}`),
    PAGE_W / 2,
    PAGE_H - 10,
    { align: "center" }
  );
}

function sectionTitle(doc: jsPDF, title: string, y: number, color: [number, number, number] = COLORS.bg): number {
  y = ensureSpace(doc, y, 15);
  doc.setFillColor(...color);
  doc.rect(MARGIN, y, 4, 8, "F");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(clean(title), MARGIN + 8, y + 6);
  return y + 12;
}

export function generateDiagnosticoPDF(state: FabricaState) {
  const doc = new jsPDF();
  const result = calculateScore(state);
  const { digitalScore, scoreBreakdown, levelName, levelDescription, gargalos } = result;
  const checklist = getChecklistByLevel(result.level, state);
  const scoreColor =
    digitalScore >= 70 ? COLORS.green : digitalScore >= 40 ? COLORS.amber : COLORS.red;

  // ========== HEADER ==========
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, PAGE_W, 55, "F");
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 55, PAGE_W, 2, "F");

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DIAGNÓSTICO CANVA VIAGEM", MARGIN, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  const agencyName = clean(state.agencyName || "Sua Agência").substring(0, 40);
  doc.text(agencyName, MARGIN, 30);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 220);
  const meta = clean([state.city, state.instagram ? `@${state.instagram}` : ""].filter(Boolean).join(" · "));
  if (meta) doc.text(meta, MARGIN, 40);

  doc.setFontSize(8);
  doc.setTextColor(160, 160, 180);
  doc.text(
    clean(`Gerado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`),
    MARGIN,
    48
  );

  // ========== SCORE CARD ==========
  let y = 70;
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, 40, 3, 3, "F");

  // Score circle
  doc.setFillColor(...scoreColor);
  doc.circle(MARGIN + 18, y + 20, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(`${digitalScore}`, MARGIN + 18, y + 22, { align: "center" });
  doc.setFontSize(7);
  doc.text("/ 100", MARGIN + 18, y + 28, { align: "center" });

  // Level info
  doc.setTextColor(...scoreColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(clean(`NÍVEL ${result.level} · ${levelName.toUpperCase()}`), MARGIN + 40, y + 12);

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const descLines = doc.splitTextToSize(clean(levelDescription), PAGE_W - MARGIN * 2 - 50);
  doc.text(descLines, MARGIN + 40, y + 19);

  y += 48;

  // ========== SCORE BREAKDOWN ==========
  y = sectionTitle(doc, "Score por Dimensão", y);
  const dimLabels: Record<string, string> = {
    presenca: "Presença Digital",
    conteudo: "Conteúdo",
    vendas: "Vendas",
    trafego: "Tráfego Pago",
    conversao: "Conversão",
  };
  Object.entries(scoreBreakdown).forEach(([k, v]) => {
    y = ensureSpace(doc, y, 9);
    const valColor: [number, number, number] = v >= 70 ? COLORS.green : v >= 40 ? COLORS.amber : COLORS.red;
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(dimLabels[k] || k, MARGIN, y);
    // Bar background
    doc.setFillColor(230, 230, 235);
    doc.roundedRect(MARGIN + 55, y - 3.5, 100, 4, 1, 1, "F");
    // Bar fill
    doc.setFillColor(...valColor);
    doc.roundedRect(MARGIN + 55, y - 3.5, (v as number), 4, 1, 1, "F");
    // Value
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...valColor);
    doc.text(`${v}/100`, PAGE_W - MARGIN, y, { align: "right" });
    y += 7;
  });

  y += 4;

  // ========== GARGALOS ==========
  y = sectionTitle(doc, "Gargalos Identificados", y);
  gargalos.forEach((g) => {
    const gColor =
      g.level === "red" ? COLORS.red : g.level === "amber" ? COLORS.amber : COLORS.green;
    const lines = doc.splitTextToSize(clean(g.text), PAGE_W - MARGIN * 2 - 8);
    const blockHeight = 8 + lines.length * 4 + 4;
    y = ensureSpace(doc, y, blockHeight);

    // Side bar
    doc.setFillColor(...gColor);
    doc.rect(MARGIN, y, 2, blockHeight - 4, "F");
    // Title
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gColor);
    doc.text(clean(g.dimension), MARGIN + 6, y + 5);
    // Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    doc.text(lines, MARGIN + 6, y + 11);
    y += blockHeight;
  });

  y += 4;

  // ========== PLANO DE AÇÃO ==========
  y = ensureSpace(doc, y, 20);
  y = sectionTitle(doc, "Plano de Ação 30/60/90 dias", y);

  const phases = [
    { title: "IMEDIATO (ATÉ 7 DIAS)", color: COLORS.red, items: checklist.imediato },
    { title: "PRÓXIMOS 15 DIAS", color: COLORS.amber, items: checklist.quinzeDias },
    { title: "MÊS 2 EM DIANTE", color: COLORS.green, items: checklist.mesDois },
  ];

  phases.forEach((phase) => {
    y = ensureSpace(doc, y, 14);
    // Phase badge
    doc.setFillColor(...phase.color);
    doc.roundedRect(MARGIN, y, 60, 6, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(phase.title, MARGIN + 30, y + 4.2, { align: "center" });
    y += 10;

    phase.items.forEach((it) => {
      const lines = doc.splitTextToSize(clean(it.text), PAGE_W - MARGIN * 2 - 12);
      const itemH = Math.max(7, lines.length * 4.5 + 2);
      y = ensureSpace(doc, y, itemH);
      // Checkbox
      doc.setDrawColor(...COLORS.muted);
      doc.setLineWidth(0.4);
      doc.roundedRect(MARGIN + 1, y - 3, 4, 4, 0.5, 0.5);
      // Text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.text(lines, MARGIN + 8, y);
      y += itemH;
    });
    y += 3;
  });

  // ========== CTA FINAL ==========
  y = ensureSpace(doc, y, 30);
  y += 4;
  doc.setFillColor(...COLORS.bg);
  doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, 22, 3, 3, "F");
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PRÓXIMO PASSO", MARGIN + 6, y + 8);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    clean("Acesse a Fábrica de Anúncios completa em canvaviagem.com/fabrica"),
    MARGIN + 6,
    y + 16
  );

  addFooter(doc);
  doc.save(
    `diagnostico-${(state.agencyName || "agencia").toLowerCase().replace(/\s+/g, "-")}.pdf`
  );
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
