// Legenda pronta para o post, feita com o que está na arte (destino, período, o que inclui, preço e contato).
// Regra da casa: primeiro o valor (destino, experiência, inclusos), o preço sempre por último. Nada inventado.
import type { Arte, Marca } from "./arte-nova";

const hashtag = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]/g, "");

function linhaPreco(a: Arte): string {
  const preco = a.preco.trim();
  if (a.pagamento === "free_quote" || !preco) return "💬 Valores e datas: me chame que eu passo tudo certinho.";
  const valor = `R$ ${preco}`;
  const resto = a.complemento ? ` ${a.complemento}` : "";
  if (a.pagamento === "installments") return `💰 ${a.prefixo ? `${a.prefixo} ` : ""}${a.parcelas} de ${valor}${resto}`;
  if (a.pagamento === "cash") return `💰 ${valor} à vista${resto}`;
  if (a.pagamento === "from") return `💰 A partir de ${valor}${resto}`;
  return `💰 ${a.prefixo ? `${a.prefixo} ` : ""}${valor}${resto}`;
}

/** WhatsApp como se lê: (11) 91234-5678 */
export function zapDeLer(numero: string): string {
  const d = (numero || "").replace(/\D/g, "");
  const local = d.length > 11 && d.startsWith("55") ? d.slice(2) : d;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return (numero || "").trim();
}

function linhaContato(m: Marca): string {
  const zap = zapDeLer(m.whatsapp || "");
  if (zap) return `📲 Chame no WhatsApp ${zap} e garanta a sua vaga.`;
  return "📲 Chame no direct ou no WhatsApp e garanta a sua vaga.";
}

/** Quantas legendas diferentes existem (para o botão "Outra legenda"). */
export const TOTAL_LEGENDAS = 4;

/** Legenda número `n` (0 a TOTAL_LEGENDAS-1) para a arte. */
export function gerarLegenda(a: Arte, m: Marca, n = 0): string {
  const d = a.destino.trim() || "o seu destino";
  const inclusos = a.inclusos.filter((i) => i.trim());
  const lista = inclusos.length ? inclusos.map((i) => `✅ ${i}`).join("\n") : "";
  const periodo = a.periodo.trim() ? `🗓️ ${a.periodo.trim()}` : "";
  const tags = `#${hashtag(d)} #viagem #pacotedeviagem #ferias #agenciadeviagens`;
  const blocos = (partes: string[]) => partes.filter((p) => p !== "").join("\n\n");
  switch (((n % TOTAL_LEGENDAS) + TOTAL_LEGENDAS) % TOTAL_LEGENDAS) {
    case 1:
      return blocos([
        `Já pensou em ${d} sem se preocupar com nada? 🌴`,
        "A gente cuida de cada detalhe para você só aproveitar.",
        [periodo, lista ? `No pacote:\n${lista}` : ""].filter(Boolean).join("\n\n"),
        linhaPreco(a),
        linhaContato(m),
        tags,
      ]);
    case 2:
      return blocos([
        `${a.promo ? `${a.promo.toUpperCase()} ✈️` : "✈️"} ${a.titulo || `${d} te espera`}`,
        [periodo, lista].filter(Boolean).join("\n"),
        linhaPreco(a),
        "Vagas limitadas para este período. 👇",
        linhaContato(m),
        tags,
      ]);
    case 3:
      return blocos([
        `Salva este post e manda para quem vai com você para ${d}! 💛`,
        lista ? `Tudo que já está incluso:\n${lista}` : "",
        periodo,
        linhaPreco(a),
        linhaContato(m),
        tags,
      ]);
    default:
      return blocos([
        `✈️ ${a.titulo || `Partiu ${d}?`}`,
        `${d} do jeito certo: roteiro pronto, tudo reservado e alguém para te ajudar do começo ao fim.`,
        [periodo, lista ? `O pacote inclui:\n${lista}` : ""].filter(Boolean).join("\n\n"),
        linhaPreco(a),
        linhaContato(m),
        tags,
      ]);
  }
}

/** Nome do modelo sem o detalhe de visual ("Lua de mel · faixa com imagem" -> "Lua de mel"). */
export const nomeLimpo = (nome: string) => nome.split(" · ")[0].trim();

/** Legenda do VÍDEO: feita só com o que aparece nas cenas (nada de incluso que o vídeo não mostra). */
export function legendaDoVideo(falas: string[], nome: string, m: Marca, n = 0): string {
  const frases = falas.map((f) => f.replace(/\s+/g, " ").replace(/[.\s]+$/, "").trim()).filter((f) => f && !/whatsapp|escr[ií]benos/i.test(f));
  const abre = frases[0] || nomeLimpo(nome);
  const itens = frases.slice(1).filter((f) => f.length <= 90).slice(0, 7);
  const lista = itens.map((i) => `✨ ${i}`).join("\n");
  const titulo = nomeLimpo(nome);
  const tags = [`#${hashtag(titulo).toLowerCase()}`, "#viagem", "#agenciadeviagens", "#ferias", "#pacotedeviagem"].filter((t) => t.length > 1).join(" ");
  const blocos = (partes: string[]) => partes.filter((p) => p !== "").join("\n\n");
  switch (((n % TOTAL_LEGENDAS) + TOTAL_LEGENDAS) % TOTAL_LEGENDAS) {
    case 1:
      return blocos([`${abre} 🌴`, "A gente cuida de cada detalhe para você só aproveitar.", lista, linhaContato(m), tags]);
    case 2:
      return blocos([`Salva este vídeo e manda para quem vai com você! 💛`, `${abre}.`, lista, linhaContato(m), tags]);
    case 3:
      return blocos([`Qual dessas você quer viver primeiro? 👇`, lista || `${abre}.`, linhaContato(m), tags]);
    default:
      return blocos([`✈️ ${abre}`, lista, linhaContato(m), tags]);
  }
}
