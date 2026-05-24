
import { GeneratedOption, Message, UserProfile } from "../types";

/**
 * Limpa a resposta da IA caso ela venha envolta em blocos de código markdown
 */
const cleanJsonResponse = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : text;
  } catch (e) {
    return text;
  }
};

/**
 * Gera uma resposta de vendas de alta conversão usando o servidor.
 */
export const generateChatResponse = async (
  currentInput: string,
  history: Message[],
  userProfile?: UserProfile | null,
  image?: string
): Promise<{ text: string; options: GeneratedOption[]; isError?: boolean }> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentInput,
        history,
        userProfile,
        image
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        throw new Error(`Resposta do servidor não é JSON: ${errorText.substring(0, 50)}...`);
      }
      throw new Error(errorData.error || 'Server error');
    }

    const result = await response.json();
    
    return {
      text: result.analysis || "Analizando a oportunidade...",
      options: result.options || []
    };
  } catch (error: any) {
    console.error("AI Error:", error);
    
    let errorMessage = `Erro ao calibrar resposta: ${error.message || 'Erro desconhecido'}. Tente novamente.`;
    
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('billing') || error.message?.includes('spend')) {
      errorMessage = "⚠️ Limite de gastos mensal atingido no Google AI Studio. Verifique em https://ai.studio/spend";
    }
    
    return { 
      text: errorMessage,
      options: [],
      isError: true
    };
  }
};
