import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFabricaContext } from "@/hooks/useFabricaContext";

// A jornada do assinante: 8 missões, do primeiro acesso à primeira venda.
// Cada tela mostra a missão da vez; a plataforma marca sozinha o que consegue
// e pede confirmação do que acontece fora dela (postar, colocar o link na bio).

export type MissaoId = "perfil" | "video" | "postar_video" | "anuncio" | "carrossel" | "site" | "divulgar_site" | "cliente";

export interface MissaoDef {
  id: MissaoId;
  titulo: string;
  porque: string;
  cta: string;
  caminho: string;
  /** "auto": a plataforma detecta; "confirmar": a pessoa toca em "Já fiz". */
  tipo: "auto" | "confirmar";
}

export const MISSOES: MissaoDef[] = [
  { id: "perfil", titulo: "Conte quem é a sua agência", porque: "Nome e WhatsApp entram sozinhos em tudo que você gerar.", cta: "Começar", caminho: "/fabrica", tipo: "auto" },
  { id: "video", titulo: "Gere seu primeiro vídeo", porque: "Fale o pacote e receba 3 vídeos prontos para postar.", cta: "Gerar vídeo", caminho: "/fabrica/video", tipo: "auto" },
  { id: "postar_video", titulo: "Poste o vídeo", porque: "Nos stories e no status do WhatsApp. É de graça e já traz cliente.", cta: "Ver como postar", caminho: "/fabrica/video", tipo: "confirmar" },
  { id: "anuncio", titulo: "Gere a arte do mesmo pacote", porque: "A imagem para o feed, com seu preço e seu WhatsApp.", cta: "Gerar arte", caminho: "/fabrica/anuncio", tipo: "auto" },
  { id: "carrossel", titulo: "Monte um carrossel", porque: "Várias imagens numa publicação só, mostrando o que tem no pacote.", cta: "Montar carrossel", caminho: "/fabrica/carrossel", tipo: "auto" },
  { id: "site", titulo: "Coloque seu site no ar", porque: "Quem clica no seu anúncio cai aqui e chama você no WhatsApp.", cta: "Publicar site", caminho: "/fabrica/site", tipo: "auto" },
  { id: "divulgar_site", titulo: "Espalhe o link do site", porque: "Na bio do Instagram e no WhatsApp dos clientes.", cta: "Pegar o link", caminho: "/fabrica/site", tipo: "confirmar" },
  { id: "cliente", titulo: "Receba o primeiro pedido de orçamento", porque: "Quando alguém pedir orçamento no site, aparece em Clientes.", cta: "Ver clientes", caminho: "/fabrica/crm", tipo: "auto" },
];

export const NIVEIS = [
  "Agência começando",
  "Agência apresentada",
  "Primeiro vídeo pronto",
  "Vídeo no ar",
  "Primeira arte pronta",
  "Carrossel pronto",
  "Agência no ar",
  "Link espalhado",
  "Primeiro cliente chegou",
];

export interface Missao extends MissaoDef {
  numero: number;
  feita: boolean;
}

const chave = (id: MissaoId) => `missao:${id}`;
const chaveRegistradas = (projeto: string) => `cv-jornada-registradas-${projeto || "local"}`;

export function useJornada() {
  const { state, update, isHydrated } = useFabricaContext();
  const { user } = useAuth();
  const [leads, setLeads] = useState(0);

  // Pedidos de orçamento (para a missão 8). Uma consulta leve, só a contagem.
  useEffect(() => {
    if (!user) return;
    let vivo = true;
    (supabase as any)
      .from("crm_form_submissions")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .then(({ count }: { count: number | null }) => {
        if (vivo) setLeads(count || 0);
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [user]);

  const marcada = useCallback((id: MissaoId) => Boolean(state.checklist30days?.[chave(id)]), [state.checklist30days]);

  const feitas: Record<MissaoId, boolean> = {
    perfil: Boolean(state.agencyName?.trim()) && Boolean(state.whatsapp?.trim()),
    video: marcada("video"),
    postar_video: marcada("postar_video"),
    anuncio: (state.allGeneratedAdImages?.length ?? 0) > 0 || Boolean(state.generatedAdImage) || marcada("anuncio"),
    carrossel: marcada("carrossel"),
    site: Boolean(state.siteContent?.canvaViagemUrl?.trim()) || marcada("site"),
    divulgar_site: marcada("divulgar_site"),
    cliente: leads > 0 || marcada("cliente"),
  };

  const missoes: Missao[] = MISSOES.map((m, i) => ({ ...m, numero: i + 1, feita: feitas[m.id] }));
  const concluidas = missoes.filter((m) => m.feita).length;
  const atual = missoes.find((m) => !m.feita) || null;

  // Registra no banco (user_activities) cada missão concluída, uma vez só. É o que a Gestão lê.
  const registrar = useCallback(
    async (ids: MissaoId[]) => {
      if (!user || ids.length === 0) return;
      for (const id of ids) {
        const numero = MISSOES.findIndex((m) => m.id === id) + 1;
        await (supabase.from("user_activities") as any)
          .insert({ user_id: user.id, activity_type: "missao", points_earned: 20, metadata: { missao: id, numero, de: MISSOES.length } })
          .then(() => undefined)
          .catch(() => undefined);
      }
    },
    [user],
  );

  const marcar = useCallback(
    (id: MissaoId) => {
      if (marcada(id)) return;
      update({ checklist30days: { ...(state.checklist30days || {}), [chave(id)]: true } });
    },
    [marcada, state.checklist30days, update],
  );

  // Comemora só o que foi concluído agora (não o que já estava feito ao abrir a tela).
  const assinatura = missoes.filter((m) => m.feita).map((m) => m.id).join(",");
  const vista = useRef<string | null>(null);
  useEffect(() => {
    if (!isHydrated || vista.current === assinatura) return;
    const anterior = vista.current;
    vista.current = assinatura;
    const agora = assinatura.split(",").filter(Boolean) as MissaoId[];
    const k = chaveRegistradas(state.projectId || "");
    let registradas: MissaoId[] = [];
    try {
      registradas = JSON.parse(localStorage.getItem(k) || "[]");
    } catch { /* sem storage */ }
    const novas = agora.filter((id) => !registradas.includes(id));
    if (novas.length) {
      try {
        localStorage.setItem(k, JSON.stringify([...registradas, ...novas]));
      } catch { /* sem storage */ }
      registrar(novas);
      // só comemora quando houve mudança durante o uso (anterior !== null)
      if (anterior !== null) {
        const n = agora.length;
        toast.success(`Missão ${novas.length > 1 ? "concluída" : `${MISSOES.findIndex((m) => m.id === novas[0]) + 1} concluída`}! 🏅`, {
          description: n < MISSOES.length ? `Seu nível agora: ${NIVEIS[n]}. Próxima: ${MISSOES[n]?.titulo ?? ""}` : "Você completou a jornada. Agora é rotina: 1 vídeo e 1 arte por semana.",
          duration: 7000,
        });
      }
    }
  }, [assinatura, isHydrated, registrar, state.projectId]);

  return { missoes, atual, concluidas, total: MISSOES.length, nivel: NIVEIS[concluidas], marcar, marcada, isHydrated };
}
