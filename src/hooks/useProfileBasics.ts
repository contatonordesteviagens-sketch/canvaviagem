import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProfileBasics = { name: string | null; email: string | null };

export const profileBasicsKey = (userId: string | undefined) => ["profile-basics", userId] as const;

/**
 * Nome e e-mail do perfil de quem está logado, com cache.
 * O cabeçalho aparece em quase todas as telas e buscava o nome de novo a cada troca de página;
 * agora a consulta é feita uma vez e reaproveitada (cabeçalho e Minha Conta usam a mesma).
 */
export const useProfileBasics = (userId: string | undefined) =>
  useQuery({
    queryKey: profileBasicsKey(userId),
    enabled: !!userId,
    queryFn: async (): Promise<ProfileBasics> => {
      const { data } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("user_id", userId!)
        .maybeSingle();
      const row = data as { name?: string | null; email?: string | null } | null;
      return { name: row?.name || null, email: row?.email || null };
    },
    staleTime: 1000 * 60 * 10,
  });

/** Atualiza o nome no cache (depois de salvar em Minha Conta ou ao chegar o aviso em tempo real). */
export const useSetProfileName = () => {
  const queryClient = useQueryClient();
  return (userId: string, name: string | null) =>
    queryClient.setQueryData<ProfileBasics>(profileBasicsKey(userId), (prev) => ({
      name: name || null,
      email: prev?.email ?? null,
    }));
};
