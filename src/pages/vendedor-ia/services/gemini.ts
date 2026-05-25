import { GeneratedOption, Message, UserProfile } from "../types";

const DEFAULT_GEMINI_KEY = "AIzaSyBqZ0IOgfYIprzdfirVQUiE6hbtWOS1Tw0";

export const getGeminiApiKey = (): string => {
  const customKey = localStorage.getItem("ia_vendedor_custom_key");
  if (customKey && customKey.trim().startsWith("AIzaSy")) {
    return customKey.trim();
  }
  return DEFAULT_GEMINI_KEY;
};

export const generateChatResponse = async (
  currentInput: string,
  history: Message[],
  userProfile?: UserProfile | null,
  image?: string
): Promise<{ text: string; options: GeneratedOption[]; isError?: boolean }> => {
  try {
    const apiKey = getGeminiApiKey();
    
    // Constrói o histórico formatado (últimas 6 mensagens)
    const conversationContext = history
      .slice(-6)
      .map((msg) => `${msg.role === 'user' ? 'Agente' : 'Mentor'}: ${msg.content}`)
      .join('\n');

    const systemInstruction = `
      VOCÊ É UM MENTOR SENIOR EM NEUROVENDAS E FECHAMENTO DE TURISMO.
      Seu objetivo é transformar o agente ${userProfile?.full_name || 'VIP'} em uma máquina de vendas.

      DIRETRIZES DE OURO (ESTILO WHATSAPP):
      1. SCRIPTS CURTOS: Máximo 2 a 3 frases por opção.
      2. TOM PESSOAL: Acolhedor e consultivo.
      3. VALOR > PREÇO: Enfatize benefícios e experiências.
      4. PRECIFICAÇÃO PSICOLÓGICA: Use parcelamento atrativo.
      5. TÉCNICA OU/OU: Termine sempre com pergunta de dupla escolha.

      MUITO IMPORTANTE: Responda obrigatoriamente no formato JSON estruturado seguindo o esquema definido.
    `;

    const promptText = `
      Contexto da Conversa:
      ${conversationContext}

      O que o cliente disse agora: "${currentInput}"

      Dê seu feedback de Mentor e gere 3 opções de resposta de alta conversão.
    `;

    const parts: any[] = [];

    // Se houver uma imagem em base64 (ex: captura de tela)
    if (image && image.includes("base64,")) {
      const mimeType = image.split(',')[0].split(':')[1].split(';')[0];
      const base64Data = image.split(',')[1];
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }

    parts.push({ text: promptText });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts
          }
        ],
        systemInstruction: {
          parts: [
            { text: systemInstruction }
          ]
        },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              analysis: { type: "STRING" },
              options: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    content: { type: "STRING" },
                    technique: { type: "STRING" },
                    methodology: { type: "STRING" },
                    psychologyTip: { type: "STRING" },
                    branches: {
                      type: "OBJECT",
                      properties: {
                        positive: { type: "STRING" },
                        negative: { type: "STRING" }
                      },
                      required: ["positive", "negative"]
                    }
                  },
                  required: ["content", "technique", "methodology", "psychologyTip", "branches"]
                }
              }
            },
            required: ["analysis", "options"]
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {}
      
      const errorMsg = errorJson?.error?.message || `HTTP ${response.status}: ${errorText.substring(0, 80)}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      throw new Error("A IA não retornou um conteúdo válido ou estruturado.");
    }

    const result = JSON.parse(candidateText.trim());

    return {
      text: result.analysis || "Analisando a oportunidade...",
      options: result.options || []
    };
  } catch (error: any) {
    console.error("Gemini API Client Error:", error);
    
    let errorMessage = `Erro ao calibrar resposta: ${error.message || 'Erro desconhecido'}. Tente novamente.`;
    
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('API_KEY_INVALID')) {
      errorMessage = "⚠️ Limite de gastos mensal atingido no Google AI Studio ou chave inválida. Verifique em Configurações > Chave do AI Studio.";
    }
    
    return { 
      text: errorMessage,
      options: [],
      isError: true
    };
  }
};
