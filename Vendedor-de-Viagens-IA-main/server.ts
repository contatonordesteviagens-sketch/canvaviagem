
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";

// __dirname and __filename are not available in ESM by default,
// but for our bundled CJS server, we will use process.cwd() or path.resolve.

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Initialize Gemini
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada. Vá em Settings > Secrets.");
    }
    // Correct initialization for @google/genai
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // API Utils
  const usageStats = new Map<string, { count: number; date: string }>();
  const MAX_DAILY_MESSAGES = parseInt(process.env.MAX_DAILY_MESSAGES || '20', 10);

  // API Routes
  app.post('/api/chat', async (req, res) => {
    try {
      const { currentInput, history, userProfile, image } = req.body;
      
      // Rate limiting logic
      const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const ipKey = Array.isArray(userIp) ? userIp[0] : userIp;
      const today = new Date().toISOString().split('T')[0];

      const userStats = usageStats.get(ipKey);

      if (userStats && userStats.date === today) {
        if (userStats.count >= MAX_DAILY_MESSAGES) {
          return res.status(429).json({
            error: `Limite diário atingido! Você já enviou ${MAX_DAILY_MESSAGES} mensagens hoje. Volte amanhã ou peça para o administrador aumentar seu limite.`
          });
        }
        userStats.count += 1;
      } else {
        usageStats.set(ipKey, { count: 1, date: today });
      }

      console.log(`User ${ipKey} usage: ${usageStats.get(ipKey)?.count}/${MAX_DAILY_MESSAGES}`);

      const conversationContext = (history || [])
        .slice(-6)
        .map((msg: any) => `${msg.role === 'user' ? 'Agente' : 'Mentor'}: ${msg.content}`)
        .join('\n');

      const systemInstruction = `
        VOCÊ É UM MENTOR SENIOR EM NEUROVENDAS E FECHAMENTO DE TURISMO.
        Seu objetivo é transformar o agente ${userProfile?.full_name || ''} em uma máquina de vendas.

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

      const ai = getGenAI();
      
      console.log("[SERVER] Calling Gemini Flash via @google/genai...");

      const parts: any[] = [{ text: promptText }];
      
      if (image) {
        const mimeType = image.split(',')[0].split(':')[1].split(';')[0];
        const base64Data = image.split(',')[1];
        parts.unshift({ inlineData: { mimeType, data: base64Data } });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    content: { type: Type.STRING },
                    technique: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    methodology: { type: Type.STRING },
                    psychologyTip: { type: Type.STRING },
                    branches: {
                      type: Type.OBJECT,
                      properties: {
                        positive: { type: Type.STRING },
                        negative: { type: Type.STRING }
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
      });

      const text = response.text;
      
      if (!text) {
        console.error("Empty AI response received");
        throw new Error("A IA não retornou uma resposta válida.");
      }

      console.log("AI Response (first 100 chars):", text.substring(0, 100));

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(text);
      } catch (e) {
        console.warn("Direct JSON Parse failed, attempting cleanup...");
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          parsedResponse = JSON.parse(cleaned);
        } catch (e2) {
          console.error("Final parse failure. Raw text:", text);
          throw new Error("Ocorreu um erro ao processar o formato da resposta da IA. Por favor, tente novamente.");
        }
      }

      res.json(parsedResponse);
    } catch (error: any) {
      console.error("AI Error Detailed Log:", error);
      
      let errorMsg = error.message || "Erro desconhecido";
      
      // Special handling for the common errors we've been seeing
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        errorMsg = "O Google demorou demais para responder. Tente novamente.";
      } else if (errorMsg.includes('403') || errorMsg.includes('PERMISSION_DENIED')) {
        errorMsg = "Acesso Negado (403). Sua chave (Tw0) pode estar sem crédito ou você precisa aceitar os termos do Google Cloud Console.";
      } else if (errorMsg.includes('429') || errorMsg.includes('QUOTA')) {
        errorMsg = "Limite atingido! O Google pausou as respostas para você não gastar além da conta. Verifique seu teto de gastos.";
      } else if (errorMsg.includes('404') || errorMsg.includes('NOT_FOUND')) {
        errorMsg = "Erro 404: O Google não encontrou o modelo gemini-flash para sua chave. Verifique se você ativou a 'Generative Language API' no Google Cloud Console ou use uma nova chave do AI Studio.";
      }

      res.status(500).json({ 
        error: errorMsg,
        rawError: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Version 1.3.0 - ACTIVE`);
    console.log(`[SERVER] Running on http://0.0.0.0:${PORT}`);
  });
}

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
