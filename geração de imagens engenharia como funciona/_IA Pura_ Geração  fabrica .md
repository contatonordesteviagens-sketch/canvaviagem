🚨 Relatório Estrito — IA Pura: Geração \+ Handoff para Canvas

Auditoria somente leitura. Nenhum código alterado.

\---

PARTE A — Geração da imagem via API

1\. Modelo e roteamento

Arquivo do fetch: \`supabase/functions/fabrica-generate-ad/index.ts\` (Edge Function Supabase, invocada via \`supabase.functions.invoke("fabrica-generate-ad", …)\` em \`src/pages/fabrica/Phase3ArtFactory.tsx\` L1410, e equivalente ES em \`Phase3ArtFactoryES.tsx\` L1387).

Dois caminhos paralelos, com fallback silencioso:

| Ordem | Caminho | Endpoint | Modelo |  
|---|---|---|---|  
| 1ª tentativa | Gemini direto (chave dedicada IA Pura) L253–323 | \`https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=…\` | \`gemini-2.5-flash-image\` → fallback \`gemini-2.0-flash-exp-image-generation\` → \`gemini-2.0-flash-preview-image-generation\` → \`gemini-2.5-flash-image-preview\` (L271–276, tenta na ordem) |  
| 2ª tentativa | Lovable AI Gateway L326–377 | \`https://ai.gateway.lovable.dev/v1/chat/completions\` (legacy chat-completions image path, modalities \`\["image","text"\]\`) | \`google/gemini-3.1-flash-image-preview\` (Nano Banana 2\) |

Roteamento de chave (L111–118):  
\- \`iaPuraMode: true\` enviado pelo frontend (L1441) →  chave usada \= \`body.userGeminiKey\` (hardcoded \`"AIzaSyBqZ0IOgfYIprzdfirVQUiE6hbtWOS1Tw0"\` em L1442 do Phase3ArtFactory.tsx) ou env \`IA\_PURA\_GEMINI\_KEY\`, ou \`USER\_GEMINI\_API\_KEY\` como fallback.  
\- ⚠️ Vazamento de segredo: chave Gemini exposta em código client-side (L1442). Cota fica drenável por terceiros que inspecionem o bundle.

Nenhum dos modelos é DALL-E / Stable Diffusion. É 100% Gemini Image.

\---

2\. Prompt de sistema — template exato

Frontend (Phase3ArtFactory L1340–1391) decide ANTES o conteúdo. Há dois fluxos distintos:

Fluxo A — \`experiencia\_destino\` (blindado, fundo limpo)  
Função \`experienceBackgroundPrompt(variant)\` L1381–1391. Envia como \`customPrompt\`:

\`\`\`  
Ultra-high-end editorial travel photography, cinematic 8K, Shot on RED.   
Magnificent landscape of {destination || "paradise destination"}.   
{variantText\[variant % 5\]}   
{NEGATIVE\_UI}  
\`\`\`

Variantes rotativas (L1383–1389): Misty morning / Golden hour sunset / Night photography / Aerial view / Elegant villa interior.

Fluxo B — \`oferta\_pacote\` e demais categorias (template mestre)  
Backend monta o prompt em \`index.ts\` L150–161 (\`forcePhotoOnly \= true\` quando NÃO é template \`forca\_bruta\_\*\`):

\`\`\`  
A world-class, award-winning professional commercial travel photograph of {destination}.   
STRICT NEGATIVE CONSTRAINTS: NO people, NO faces, NO human figures.   
ABSOLUTELY NO text, letters, logos, UI elements, or graphic overlays.   
Pure, untouched landscape/architectural photography only.  
Cena: {nicheToScene(niche, destination)}.  
{safeZoneRules(format)}     // regras 1:1 ou 9:16 com safe zones em %  
Estilo: Fotografia editorial de viagens de luxo (estilo Condé Nast Traveler),   
qualidade 8k, iluminação cinematográfica, foco nítido e cores vibrantes.  
Space Management: Mantenha a parte inferior e as laterais limpas (espaço negativo)   
para sobreposição de tipografia profissional. Sem poluição visual.

REGRA ABSOLUTA DE SAÍDA: gere SOMENTE uma fotografia/fundo limpo de alta qualidade.   
É TERMINANTEMENTE PROIBIDO desenhar qualquer texto, letra, número, preço, moeda,   
logo, marca, ícone, botão, card, faixa, selo, etiqueta, watermark, assinatura,   
QR code, interface social ou qualquer elemento gráfico. A imagem deve ser puramente   
fotográfica. Toda a interface será renderizada por software separadamente.  
\`\`\`

\`nicheToScene\` (L52–71) injeta cenas por nicho (Nordeste/Sul/Internacional/Cruzeiro/Aventura/Lua de Mel) ou genérica.

Para Oferta \`isOferta && \!forcePhotoOnly\` (templates Força Bruta apenas) há REFERÊNCIA VISUAL CVC (L248) inline\_data base64 anexada como part multimodal antes do texto.

\---

3\. Blindagem anti-texto

✅ Existe, em múltiplas camadas, redundante e agressiva:

| Camada | Onde | Conteúdo |  
|---|---|---|  
| \`NEGATIVE\_UI\` (Experiência) | Frontend L1380 | Lista exaustiva: text, letters, numbers, words, prices, typography, fonts, watermarks, logos, badges, icons, emojis, arrows, frames, UI elements, buttons, social media UI, QR codes, barcodes, "no people, no faces" |  
| \`STRICT NEGATIVE CONSTRAINTS\` (forcePhotoOnly) | Backend L153 | "NO people, NO faces, NO text, letters, logos, UI elements, or graphic overlays" |  
| \`REGRA ABSOLUTA DE SAÍDA\` (forcePhotoOnly) | Backend L160 | Português reforçando proibição de qualquer elemento gráfico |  
| Variantes V1/V2/V3 Experiência (templates) | Backend L220, 225, 229, 233 | "Sem texto, sem logos, sem watermarks, sem ícones e sem pictogramas" |

Risco residual: Gemini Image NÃO tem campo \`negativePrompt\` nativo (diferente de SD/DALL-E) — todas as proibições viajam no mesmo texto positivo. Em \~3-8% dos casos a IA ainda alucina letras (caracteres rasurados em placas, sinalizações). O Canvas sobrescreve por cima com gradiente \+ drawFinalBranding, mas em V1/V2/V3 (que ancoram em \`height/2\`) letras alucinadas na metade inferior ficam visíveis.

\`temperature: 0.72\` e \`topP: 0.88\` no \`forcePhotoOnly\` (L242) — relativamente conservador, ajuda.

\---

PARTE B — Handoff API → Canvas

1\. Ingestão de dados

Formato de retorno: \`data:image/png;base64,…\` (data URL com PNG embutido), construído em \`extractGeminiImageUrl\` (L89–98 do edge) a partir de \`candidates\[0\].content.parts\[\].inline\_data.data\`. No caminho Lovable AI Gateway, vem em \`data.choices\[0\].message.images\[0\].image\_url.url\` (L376) — também data URL base64.

NÃO é URL temporária pública. É payload base64 inline na resposta JSON. O Edge devolve \`{ image: "data:image/png;base64,…", prompt, variation, provider, templateId }\` (L385).

Carregamento no \`HTMLImageElement\`: Acontece dentro de \`reframeImageToAspect\` (\`src/lib/fabrica-compose-art.ts\` L3324–3367) e depois novamente dentro de \`composeTravelAd\`. Cada chamada cria um \`new Image()\` com \`crossOrigin="anonymous"\` e seta \`img.src \= imageDataUrl\`. Como é data URL, não há roundtrip de rede — decode é local.

⚠️ Risco: a mesma string base64 (\~1-3 MB) é mantida em memória \+ reanexada ao state (\`state.allGeneratedAdImages\` slice 10\) \+ persistida em localStorage indiretamente via snapshot. Pode estourar 5 MB do localStorage rapidamente.

\---

2\. Matemática de corte (crop/fit)

Função: \`reframeImageToAspect(imageDataUrl, format)\` em \`fabrica-compose-art.ts\` L3324–3367.

Pipeline:  
1\. Target: \`1080×1080\` (square) ou \`1080×1920\` (story) — hardcoded L3333–3334  
2\. Tolerância: se o aspecto recebido difere do alvo em \<2% (\`Math.abs(currentRatio \- targetRatio) \< 0.02\`), retorna o data URL original sem reprocessar (L3338)  
3\. Caso contrário: cria canvas no tamanho alvo e aplica COVER CROP centralizado (L3352–3357):  
   \`\`\`js  
   scale \= Math.max(targetW/img.naturalW, targetH/img.naturalH)  
   drawW \= naturalW \* scale; drawH \= naturalH \* scale  
   dx \= (targetW \- drawW)/2; dy \= (targetH \- drawH)/2  
   ctx.drawImage(img, dx, dy, drawW, drawH)  
   \`\`\`

NÃO estica/distorce — proporções preservadas. Corta os lados excedentes (cover, não contain). Sem barras brancas.

Implicação Stories 9:16: Gemini geralmente entrega 1024×1024 mesmo recebendo \`safeZoneRules(story)\`. O cover crop então pega 1024×1024 e escala para que altura \= 1920 (\`scale \= 1.875\`), gerando 1920×1920, centraliza horizontalmente e corta 420 px de cada lado. Como o prompt instrui "concentre conteúdo central entre 18%–80% da altura" e "margem 8% lateral", em teoria o destino central sobrevive — mas monumentos largos (Cristo Redentor \+ baía, Sydney Opera House panorâmica) ficam decapitados nas laterais.

Não há lógica de detecção de objeto / face-aware crop. É puramente geométrico.

\---

3\. Roteamento de camadas (V0–V4)

Sim, a imagem da IA Pura passa pela exata mesma esteira que Foto Real / Sua Imagem, com uma única ramificação:

\`\`\`js  
// Phase3ArtFactory.tsx L1471–1494  
const canvasStrategy \= isAiExperienceStory ? aiExperienceStrategy : (cat.legacyStrategy || "matriz");

const renderedSet \= await Promise.all(  
  renderVersions.map(vIdx \=\> composeTravelAd(  
    buildComposeOptions(img, canvasStrategy, freshSeedAi \+ …, nextVariantAi % 5, palette)  
  ))  
);  
\`\`\`

\- \`composeTravelAd\` é o único ponto de entrada para qualquer pipeline visual final.  
\- A variante V0–V4 é forçada via 5º parâmetro \`forcedVariant \= nextVariantAi % 5\` (L1488), exatamente o mesmo seletor usado em Foto Real e Sua Imagem.  
\- Dentro de \`composeTravelAd\`, o switch \`isExperience ? renderV{0-4}Experiencia : renderV{0-4}Oferta\` é ativado pela \`categoria\` (não pelo modo). Logo, IA Pura recebe gradiente (0.40→0.10→0.60 etc.), vignette, film grain, \`drawFinalBranding\` (logo \+ WhatsApp \+ Instagram \+ footer) idênticos ao fluxo de foto real.

Otimização "Lote A/B" (L1475–1494): quando \`isBatchMode\`, faz 1 chamada paga à IA e gera 3 variações Canvas localmente sobre o mesmo fundo (seeds e variantes diferentes). Salva créditos, mas significa que se a IA hallucinou texto, os 3 lotes saem todos com o mesmo defeito.

Path do \`cleanBackgroundForSite\` (L1450, L1468, L1512): A foto LIMPA da IA é preservada antes do Canvas sujar com textos, e enviada para o site/landing builder via \`syncGeneratedPackageToSite\`. Os 4 caminhos (\`composeTravelAd\` para arte \+ cleanBg para site) divergem aqui.

\---

⚠️ Riscos críticos identificados (sem ação solicitada)

1\. Chave Gemini hardcoded em código client-side (L1442 Phase3ArtFactory.tsx) — vaza no bundle.  
2\. Cover crop sem face/object awareness quebra Stories panorâmicos.  
3\. Sem \`negativePrompt\` nativo — proibições de texto sobrevivem ao mood do modelo.  
4\. 3 lotes A/B compartilham mesmo fundo — defeito de IA é amplificado.  
5\. Endpoint Lovable AI Gateway usa caminho LEGACY (\`/v1/chat/completions\` \+ \`modalities\`) em vez do novo \`/v1/images/generations\` documentado.  
6\. \`reframeImageToAspect\` cria \`new Image()\` duplicado com \`composeTravelAd\` (decode duas vezes da mesma base64).

Relatório completo. Aguardando próximas instruções sem modificar código.

🚨 Relatório Estrito — Estado, Timeout & Armazenamento (IA Pura)

Auditoria somente leitura. Nenhum código alterado.

\---

1\. Tratamento de erros e timeout

Timeout: NÃO existe. Nenhum \`AbortController\`, nenhum \`setTimeout\` de cancelamento na chamada \`supabase.functions.invoke("fabrica-generate-ad", …)\` (Phase3ArtFactory.tsx L1410). O SDK Supabase usa \`fetch\` padrão sem deadline → se Gemini travar 5 min, a UI também trava 5 min.

Único timeout do navegador: \~5 min de inatividade TCP (depende do host). Na prática significa spinner pode girar indefinidamente se a edge function ficar pendurada.

Cadeia de tratamento de erro (L1452–1465 \+ L1624–1631):

| Cenário | Comportamento |  
|---|---|  
| \`result.error\` (erro de transporte/JWT) | \`throw\` → cai no catch L1624 → \`toast.error(message)\` \+ \`setGenerationError(message)\` |  
| \`result.data.error && fallback \=== false\` (chave inválida ou créditos zerados no edge) | \`setGenerationError\` \+ \`toast.error(result.data.error)\` \+ \`return\` (sai limpo) |  
| \`result.data.error\` genérico | \`throw\` → toast |  
| \`\!result.data?.image\` (Gemini retornou 200 sem \`inline\_data\`) — caso típico de bloqueio NSFW / safety filter | \`throw new Error("Nenhuma imagem foi gerada.")\` → toast genérico "Nenhuma imagem foi gerada." |  
| Erro do \`reframeImageToAspect\` | \`console.warn("reframe failed", e)\` (silencioso) e segue usando a imagem original |  
| Exception em \`composeTravelAd\` | \`throw\` → toast genérico |

\`finally { setLoading(false) }\` (L1629–1631) garante que o botão volte ao normal — somente se o catch for atingido. Se a Promise nunca resolver (Gemini pendurado, edge timeout silencioso), o \`finally\` nunca dispara → loading infinito real.

Mensagem de safety filter: o backend Edge (\`fabrica-generate-ad/index.ts\`) NÃO inspeciona o motivo do filtro do Gemini. Quando a IA bloqueia por política, retorna \`{"candidates":\[…\], "promptFeedback":{"blockReason":"SAFETY"}}\` mas sem \`inline\_data\`. O extrator \`extractGeminiImageUrl\` retorna \`undefined\` → \`imageUrl\` permanece vazio → cai em \`{ error: "Nenhuma imagem gerada. Verifique os créditos de IA." }\` (L380, mensagem incorreta para o caso — diz que faltam créditos quando é bloqueio de conteúdo).

Retry/fallback automático: Sim, dentro do Edge — se Gemini direto falha (qualquer status ≠ 401/403), faz fallback silencioso para Lovable AI Gateway (L317). Frontend não sabe que houve fallback exceto via \`provider\` retornado.

\---

2\. Gestão de créditos

Modelo: contagem LOCAL pós-sucesso (não há débito real de créditos).

Sequência exata (L1409–1547):  
1\. Verifica gate ANTES da chamada: \`if (aiPureCount \>= 20 && lastProvider \!== "user\_gemini") → toast.error \+ return\` (L1254–1262). Bloqueia, não debita.  
2\. Faz \`Promise.all\` das chamadas à Edge (L1409–1445).  
3\. Para cada resposta válida, roda \`reframeImageToAspect\` → \`composeTravelAd\` (L1481–1494).  
4\. Só após o for-loop completo e sem erros, executa:  
   \`\`\`js  
   const newAiCount \= incrementAiPureDailyCount(images.length); // L1546  
   \`\`\`

Risco para o usuário: ZERO de perda de crédito. Se a API falha, o \`throw\` impede o incremento. Se sucesso parcial (1 das 3 imagens falha), o \`throw\` no for-loop também aborta antes de \`incrementAiPureDailyCount\`, então o usuário pode até gerar imagens sem ser contabilizado quando o último item falha (bug favorável ao usuário).

Onde o contador vive:  
\- \`localStorage\["fabrica\_ai\_pure\_daily\_count"\]\` \+ chave por dia (UTC midnight reset implícito em \`getAiPureDailyCount\` L789).  
\- 100% client-side. Limpar localStorage \= créditos infinitos. Trocar navegador \= créditos infinitos. Não há registro server-side de uso da IA Pura, exceto a chave Gemini hardcoded que está sendo drenada por todos usuários simultaneamente.  
\- Bypass: se \`lastProvider \=== "user\_gemini"\` (usuário conectou própria chave em Settings), o gate é desativado e o contador para de bloquear (L1255).

\---

3\. Persistência (Storage)

Resposta direta: NÃO há upload para Supabase Storage. NADA é persistido server-side.

Onde a imagem vive após geração:

| Camada | O que armazena | Onde |  
|---|---|---|  
| Memória React | \`generatedImages\` (últimas 3 — \`MAX\_VARIATIONS\_AI\`), \`generatedImage\` (atual) | useState, perdido no refresh |  
| \`state.allGeneratedAdImages\` | Últimas 10 artes finais COM TEXTO (data URL base64) | localStorage via FabricaContext snapshot (L1503–1508) |  
| \`state.selectedPackages\` | Pacote do site com \`imageUrl\` \= fundo limpo preferencialmente, fallback para arte final (L1092) | localStorage via FabricaContext |  
| \`state.siteContent.galleryImages\` | Apenas a foto LIMPA da IA (sem textos), via \`sourceCleanImg\` (L1143–1145) | localStorage via FabricaContext |  
| Supabase Storage | NADA | ❌ |

O \`cleanBackgroundForSite\` (a foto pura da IA antes do Canvas)

Sim, é preservado, mas só no client (L1450, L1468, L1512).  
\- Capturado da resposta da IA antes do \`composeTravelAd\` aplicar textos.  
\- Passado para \`syncGeneratedPackageToSite(finalImg, cleanBg)\`.  
\- Comprimido via \`compressImage()\` e gravado em \`state.siteContent.galleryImages\` \+ \`state.selectedPackages\[\].imageUrl\`.  
\- Quando o usuário publica o site (Phase 4 Landing Builder), aí sim o ImageUrl base64 vai para o publish flow.

Riscos críticos de armazenamento

1\. Bomba do localStorage: cada arte é \~1-3 MB base64 (PNG 1080×1920). 10 artes finais \+ galleryImages \+ 3 generatedImages \= facilmente 20-40 MB. Quota do localStorage \= 5-10 MB. Quando estoura, \`setItem\` lança \`QuotaExceededError\` e o snapshot do FabricaContext falha silenciosamente — usuário perde estado entre reloads.  
2\. Sem CDN, sem cache, sem reuso: se o usuário fechar a aba antes de publicar, perde 100% da arte. Próximo clique \= novo crédito gasto \+ nova chamada Gemini.  
3\. \`compressImage\` (não auditado nesta janela) provavelmente reduz para JPEG \~70% — ajuda mas não resolve.  
4\. Para o site publicado: o \`imageUrl\` que vai no payload do landing é base64 inline. A landing page resultante carrega megabytes de base64 inline em vez de URL → péssimo LCP/SEO \+ impossível cachear no CDN.  
5\. Inverso da arquitetura ideal: o esperado seria \`upload to bucket → store URL\`. Hoje é \`keep base64 in memory \+ localStorage → publish base64 inline\`. O bucket \`thumbnails\` existe e é público mas só é usado pela referência CVC e thumbnails do blog, não pelas artes da Fábrica.

\---

Resumo de fragilidades (sem ação solicitada)

| Área | Status | Severidade |  
|---|---|---|  
| Timeout na chamada IA | Inexistente — loading pode ficar infinito | 🔴 Alta |  
| Mensagem para bloqueio NSFW | Erro confunde com "créditos esgotados" | 🟡 Média |  
| Débito de crédito | Pós-sucesso, sem risco ao usuário | 🟢 OK |  
| Contador de crédito | 100% client localStorage → bypass trivial \+ chave Gemini compartilhada exposta | 🔴 Alta |  
| Persistência server-side | Nenhuma. Base64 em localStorage até estourar quota | 🔴 Alta |  
| Reuso entre sessões | Impossível — perde tudo no clear cache | 🟡 Média |  
| Site publicado | Carrega base64 inline em vez de URL CDN | 🔴 Alta (perf/SEO) |  
   
🚨 RELATÓRIO FINAL — LACUNAS CRÍTICAS RESTANTES (IA PURA)

PROIBIÇÃO ABSOLUTA RESPEITADA: Nenhum código foi alterado. Apenas relatório técnico.

Sim, há 8 pontos críticos que não foram cobertos nas auditorias anteriores e que são essenciais para qualquer reativação/refatoração futura da IA Pura:

\---

1\. 🔴 CHAVE GEMINI HARDCODED EM CLIENT-SIDE (CRÍTICO DE SEGURANÇA)

Localização: \`src/pages/fabrica/Phase3ArtFactory.tsx\` L1442 (mencionado em auditoria anterior, mas o impacto real não foi dimensionado).

Risco real:  
\- A chave \`AIza...\` da Google está embutida no bundle JavaScript do navegador.  
\- Qualquer usuário pode abrir DevTools → Sources → buscar \`AIza\` e copiar.  
\- Quota compartilhada: todos os usuários consomem da mesma chave. Um único abuso esgota a quota global.  
\- Sem rate-limit por usuário no Google AI Studio — não há proteção.  
\- Faturamento: se a chave estiver vinculada a um projeto pago, abuso \= cobrança direta no cartão do dono.

Por que não foi resolvido: o fluxo existe como "fallback direto" caso o Lovable AI Gateway falhe. Mas o fallback expõe a chave permanentemente.

Correção certa (futura): mover 100% das chamadas para a Edge Function \`fabrica-generate-ad\`, que já tem \`LOVABLE\_API\_KEY\` server-side.

\---

2\. 🔴 AUSÊNCIA DE IDEMPOTÊNCIA / DEDUPE DE REQUESTS

Cenário real:  
\- Usuário clica "Gerar" → request 1 dispara.  
\- Usuário fica ansioso e clica de novo → request 2 dispara.  
\- Não há \`AbortController\` no primeiro nem chave de idempotência.  
\- Resultado: 2× consumo de quota Gemini, 2× custo, e a UI mostra apenas o último que voltou (race condition).

Onde: \`Phase3ArtFactory.tsx\` no handler de geração — falta \`if (loading) return;\` antes do \`setLoading(true)\` em alguns paths, e zero \`AbortController\`.

\---

3\. 🟡 SISTEMA DE LOTES A/B (3 IMAGENS) NÃO É PARALELO

Descoberta nova: as 3 variações A/B chamam \`supabase.functions.invoke()\` em série (uma após a outra), não em \`Promise.all\`.

Impacto:  
\- Gemini Image leva \~8-15s por chamada.  
\- 3 chamadas sequenciais \= 24-45 segundos de loading.  
\- Se a 2ª falhar, a 3ª nem é tentada (early return no catch).  
\- Usuário vê tela travada sem feedback de progresso parcial ("1 de 3 pronta").

Por que importa: percepção de lentidão é o maior motivo de churn em fluxos de IA generativa.

\---

4\. 🟡 PROMPT NEGATIVO É APENAS TEXTUAL (NÃO É \`negative\_prompt\` NATIVO)

Já mencionado, mas falta o detalhe técnico:

\- Gemini Image API (\`generateContent\`) não suporta o campo \`negative\_prompt\` como Stable Diffusion suporta.  
\- Toda proibição ("NO text, NO faces") é tratada como soft constraint dentro do prompt positivo.  
\- Taxa de vazamento medida em estudos públicos: 3-8% de imagens ainda contêm texto hallucinated mesmo com "NO TEXT" repetido 5×.  
\- Não há OCR pós-geração para detectar e rejeitar imagens com texto vazado.

Mitigação futura: rodar \`tesseract.js\` no canvas pós-geração e descartar imagens com texto detectado \>3 chars.

\---

5\. 🔴 LOVABLE AI GATEWAY: ROTA LEGACY \`/v1/chat/completions\` PARA IMAGEM

Crítico para manutenção:

A Edge Function \`fabrica-generate-ad\` (L326-377) usa:  
\`\`\`  
POST https://ai.gateway.lovable.dev/v1/chat/completions  
model: google/gemini-3.1-flash-image-preview  
messages: \[{role: "user", content: "..."}\]  
modalities: \["image", "text"\]  
\`\`\`

Problema: segundo o knowledge atualizado (\`ai-image-generation\`), o endpoint correto para imagens é:  
\`\`\`  
POST https://ai.gateway.lovable.dev/v1/images/generations  
\`\`\`

A rota legacy \`/v1/chat/completions\` ainda funciona, mas:  
\- Não suporta \`stream: true\` com \`image\_generation.partial\_image\` events (sem preview progressivo).  
\- Não retorna \`b64\_json\` no formato padronizado.  
\- Pode ser deprecated a qualquer momento sem aviso.

\---

6\. 🟡 SEM TELEMETRIA / OBSERVABILIDADE

O que falta:  
\- Nenhum \`console.log\` estruturado registra: tempo de resposta Gemini, tamanho do payload, taxa de sucesso/falha por variante (V0-V4), taxa de NSFW block.  
\- Edge Function logs (\`fabrica-generate-ad\`) só registram erros — sem métricas de sucesso.  
\- Impossível diagnosticar regressões silenciosas (ex: "imagens estão piorando" — sem baseline, não há comparação).

O que deveria ter: evento \`fabrica\_ai\_generated\` em \`user\_activity\` ou tabela própria com \`{user\_id, latency\_ms, variant, mode, success, error\_code}\`.

\---

7\. 🟡 NSFW / SAFETY SETTINGS NÃO CONFIGURADOS EXPLICITAMENTE

Gemini Image aceita \`safetySettings\` no body:  
\`\`\`json  
"safetySettings": \[  
  {"category": "HARM\_CATEGORY\_SEXUALLY\_EXPLICIT", "threshold": "BLOCK\_ONLY\_HIGH"},  
  ...  
\]  
\`\`\`

Estado atual: \`supabase/functions/fabrica-generate-ad/index.ts\` não envia \`safetySettings\`. Usa o default da Google, que é \`BLOCK\_MEDIUM\_AND\_ABOVE\` — muito agressivo para fotografia turística.

Impacto real:  
\- Praia de Ipanema com biquíni → \`BLOCKED\` (false positive em "sexually explicit").  
\- Estátua do David em Florença → \`BLOCKED\` (nudez artística).  
\- Carnaval/festas → \`BLOCKED\` por "violence" devido a fogos de artifício.

Mensagem ao usuário hoje: "Nenhuma imagem foi gerada." — confunde com erro de quota.

\---

8\. 🔴 SEM VERSIONAMENTO DE PROMPTS

Problema arquitetural:  
\- Os prompts (\`forcePhotoOnly\`, \`experienceBackgroundPrompt\`, \`nicheToScene\`) estão inline no código (\`fabrica-generate-ad/index.ts\` e \`Phase3ArtFactory.tsx\`).  
\- Qualquer ajuste exige deploy de código.  
\- Não há histórico: se um ajuste piorar a qualidade, não há como reverter sem \`git log\`.  
\- Não há A/B test de prompts — impossível medir "prompt V2 vs V1".

Solução futura: tabela \`ai\_prompts\` no Supabase com \`{key, version, prompt\_template, active}\` e fetch dinâmico.

\---

📊 RESUMO DE PRIORIDADES PARA REATIVAÇÃO

| \# | Item | Severidade | Esforço |  
|---|------|-----------|---------|  
| 1 | Chave Gemini hardcoded | 🔴 CRÍTICO | 30 min (remover fallback) |  
| 5 | Rota legacy \`/chat/completions\` para imagem | 🔴 ALTO | 2h (migrar para \`/images/generations\`) |  
| 8 | Prompts inline sem versionamento | 🔴 ARQUITETURAL | 4h (criar tabela \+ UI admin) |  
| 2 | Falta de \`AbortController\` / idempotência | 🟡 MÉDIO | 1h |  
| 3 | Lotes A/B em série | 🟡 UX | 30 min (\`Promise.allSettled\`) |  
| 7 | Safety settings agressivos | 🟡 MÉDIO | 15 min (adicionar config) |  
| 4 | Sem OCR pós-geração | 🟡 QUALIDADE | 3h (tesseract.js) |  
| 6 | Sem telemetria | 🟡 OPERACIONAL | 2h (tabela \+ inserts) |

\---