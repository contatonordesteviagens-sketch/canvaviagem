import { supabase } from "@/integrations/supabase/client";
import { GeneratedOption, Message, UserProfile } from "../types";

type VendedorResponse = {
  text?: string;
  options?: GeneratedOption[];
  error?: string;
};

export const generateChatResponse = async (
  currentInput: string,
  history: Message[],
  userProfile?: UserProfile | null,
  image?: string,
): Promise<{ text: string; options: GeneratedOption[]; isError?: boolean }> => {
  try {
    const { data, error } = await supabase.functions.invoke<VendedorResponse>(
      "vendedor-generate-response",
      {
        body: {
          currentInput,
          history: history.slice(-6).map(({ role, content }) => ({ role, content })),
          userProfile: userProfile
            ? {
                full_name: userProfile.full_name,
                agency_name: userProfile.agency_name,
              }
            : null,
          image,
        },
      },
    );

    if (error) throw error;
    if (!data || data.error) throw new Error(data?.error || "Resposta vazia da IA");

    return {
      text: data.text || "Preparei opções objetivas para esta conversa.",
      options: Array.isArray(data.options) ? data.options : [],
    };
  } catch (error) {
    console.error("Vendedor IA:", error);
    return {
      text: "Não consegui gerar as respostas agora. Confirme sua conexão e tente novamente.",
      options: [],
      isError: true,
    };
  }
};
