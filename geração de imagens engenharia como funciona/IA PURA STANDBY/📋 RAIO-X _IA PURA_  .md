📋 RAIO-X "IA PURA" — PARTE 1: Ingestão & Edge Function

Modo auditoria. Nenhum arquivo alterado.

\---

1\. 🎯 GATILHO (Frontend) — \`Phase3ArtFactory.tsx\` linhas 1328-1378

Quando o usuário clica em Gerar com \`genMode \=== "ai"\`, o sistema exige uma foto da galeria Pexels (\`selectedPhotoUrl\`) — sem foto, aborta com toast.

Em seguida, dispara \`supabase.functions.invoke("fabrica-design-ai", { body: ... })\`. Payload exato:

\`\`\`ts  
{  
  format,                  // "square" | "story" ✅  
  destination,             // string  
  price: formattedPriceForAd || price,  
  duration: travelPeriod || "5 NOITES",  
  highlights: highlightTexts,        // string\[\] achatado  
  promoName,  
  currencySymbol,  
  primaryColor,            // ✅ ENVIADO  
  secondaryColor,          // ✅ ENVIADO  
  variation: idx \+ 1,      // 1..3  
  excludeStyles: exclude,  // rotação anti-repetição  
  userGeminiKey: localStorage.getItem("user\_gemini\_api\_key") || ""  
}  
\`\`\`

⚠️ Achados críticos da Parte 1  
\- Cores são enviadas, mas NÃO são usadas no prompt (ver §2). Pure dead-weight no payload.  
\- Dimensões NÃO são enviadas como pixels. Só vai \`format: "square"|"story"\`. O backend nunca informa à IA que a tela é 1080×1080 ou 1080×1920. Isso é tratado pelo renderer (Canvas) mais tarde.  
\- \`userGeminiKey\` ainda vai no payload — apesar do toast dizer "IA Pura segura no servidor". A edge function ignora essa chave (não lê do body). Mas continua sendo enviada no fio (não é exfiltração, é seu próprio localStorage).  
\- O fluxo dispara 1× ou 3× em paralelo (\`Promise.all\`) conforme \`isBatchMode\`. 3 chamadas simultâneas à mesma key → risco de 429 em cascata.

\---

2\. 📜 EDGE FUNCTION — \`supabase/functions/fabrica-design-ai/index.ts\`

Chave  
Linha 9: \`Deno.env.get("IA\_PURA\_GEMINI\_KEY") || Deno.env.get("USER\_GEMINI\_API\_KEY")\` — fallback duplo. Se ambas existirem, usa \`IA\_PURA\_GEMINI\_KEY\`.

System Prompt (linha 102, literal):  
\> "Você é um diretor de arte sênior de agências de turismo e luxo de altíssimo padrão. Sua única função é receber os dados do anúncio e escolher de forma inteligente qual dos 8 Estilos Premium pré-definidos (de A a H) é o esteticamente mais adequado para compor a imagem de fundo."

User Prompt (linhas 52-93, resumido):  
Lista os 8 estilos (A=NY Editorial, B=Caribe Resort, C=Quiet Luxury Safari, D=Jaecoo Premium, E=Circuito Card, F=Vertical Sidebar, G=Column Split, H=Header+Bottom). Pede:  
\`\`\`json  
{ "style": "A"|...|"H", "justification": "..." }  
\`\`\`

🚨 CONSTATAÇÕES GRAVES  
| \# | Achado | Impacto |  
|---|--------|---------|  
| 1 | \`primaryColor\`/\`secondaryColor\` são desestruturados (linha 36-37) e NUNCA interpolados no prompt | A IA escolhe estilo às cegas; cores do usuário ignoradas |  
| 2 | Não há instrução de limites matemáticos da tela (1080×1080 / 1080×1920) | A IA não conhece o canvas — coordenadas absolutas viriam alucinadas se fossem pedidas (mas hoje só pede letra A-H) |  
| 3 | O contrato JSON pede SÓ \`{style, justification}\` — NÃO pede coordenadas, elementos, x/y/width/height/cores. Toda a renderização vem de templates hardcoded no renderer | A "IA Pura" hoje é uma "IA Seletora de Template" — não desenha layout dinâmico |  
| 4 | \`temperature: 0.7\`, \`responseMimeType: "application/json"\` | Bom — força MIME JSON nativo do Gemini |

\---

3\. 🧹 SANITIZAÇÃO — linhas 141-152

\`\`\`ts  
const rawText \= data?.candidates?.\[0\]?.content?.parts?.map(p \=\> p.text || "").join("") ?? "";  
if (\!rawText) throw new Error("IA não retornou conteúdo.");

const cleaned \= rawText.replace(/\`\`\`json/gi, "").replace(/\`\`\`/g, "").trim();  
const start \= cleaned.indexOf("{");  
const end \= cleaned.lastIndexOf("}");  
const jsonOutput \= JSON.parse(cleaned.substring(start, end \+ 1));

if (\!jsonOutput || \!jsonOutput.style) throw new Error("JSON de layout inválido.");  
\`\`\`

✅ O que funciona  
\- Remove \`\`\`\` \`\`\`json \`\`\`\` e \`\`\`\` \`\`\` \`\`\`\` (case-insensitive).  
\- Faz "JSON slice" do primeiro \`{\` até o último \`}\` → tolera lixo no entorno.  
\- Valida \`jsonOutput.style\` presente.

⚠️ Fragilidades  
\- Não tem \`try/catch\` no \`JSON.parse\` — qualquer vírgula extra, aspas curvas ou control-char \`\\x00-\\x1F\` derruba a função com \`500\` (foi exatamente a causa do erro \`"position 155 (line 9 column 4)"\` que você teve). A "blindagem com comma-repair" mencionada no resumo da sessão anterior NÃO está presente no código atual — provavelmente foi revertida ou nunca foi commitada.  
\- Não lida com \`\[\` (array) — só objeto. OK pois o schema pede objeto.  
\- Não sanitiza control-chars invisíveis.

\---

4\. 🛡️ TRATAMENTO DE FALHAS

No backend (\`index.ts\`)  
| Cenário | Resposta |  
|---|---|  
| Chave faltando | 500 \+ msg acionável |  
| Gemini 429 | repassa 429 |  
| Gemini 402 | repassa 402 |  
| Gemini 400/401/403 | 400 "chave inválida" |  
| Gemini 5xx ou outro | 500 genérico |  
| \`rawText\` vazio | throw → catch 500 |  
| \`JSON.parse\` falha | throw não tratado → cai no catch externo, 500 com mensagem do erro nativo do V8 (foi o que você viu) |  
| \`\!jsonOutput.style\` | throw → 500 "JSON de layout inválido" |  
| Timeout | ❌ Nenhum \`AbortController\` — espera indefinidamente o Gemini. Supabase Edge corta em \~150s e devolve 504 sem mensagem útil |

No frontend (\`Phase3ArtFactory.tsx\` linhas 1449-1457)  
\`\`\`ts  
catch (error: any) {  
  console.error("ERRO\_IA\_PURA\_CATCH:", error);  
  toast.error("Erro ao gerar design da IA: " \+ (error?.message || "desconhecido"));  
  toast.info("Carregando layout de segurança (V0)...");  
  setForcedVariant(0);  
  setGenMode("photo");  
  setTimeout(() \=\> generate(), 500);   // re-dispara em modo foto V0  
}  
\`\`\`  
\- Fallback automático para modo "Foto Real" V0 após 500ms — bom UX.  
\- ⚠️ Não há limite de retentativas: se o modo foto V0 também falhar, pode entrar em loop dependendo do código (não auditei \`generate()\` completo, mas como muda \`genMode\`, ele não volta para \`"ai"\` no retry).  
\- ⚠️ Quando 1 das 3 paralelas falha, \`Promise.all\` rejeita tudo — perde os 2 layouts que vieram OK e cai no fallback. Deveria ser \`Promise.allSettled\`.

\---

🚨 SÍNTESE DOS GARGALOS

| Severidade | Problema | Local |  
|---|---|---|  
| 🔴 ALTA | Cores do usuário são enviadas mas ignoradas no prompt | \`fabrica-design-ai/index.ts\` L52-93 |  
| 🔴 ALTA | \`JSON.parse\` sem \`try/catch\` → 500 ao menor desvio | \`fabrica-design-ai/index.ts\` L148 |  
| 🔴 ALTA | \`Promise.all\` no batch — 1 falha derruba os 3 | \`Phase3ArtFactory.tsx\` L1346 |  
| 🟡 MÉDIA | Sem \`AbortController\`/timeout no fetch Gemini | \`fabrica-design-ai/index.ts\` L95 |  
| 🟡 MÉDIA | Sem sanitização de control-chars invisíveis | \`fabrica-design-ai/index.ts\` L145 |  
| 🟢 BAIXA | \`userGeminiKey\` ainda no payload (não lido pelo server) | \`Phase3ArtFactory.tsx\` L1366 |  
| 🟢 BAIXA | Dimensões reais (1080×1080 / 1080×1920) nunca chegam ao prompt | ambos |

Conclusão da Parte 1: o "Motor de Layout Dinâmico" hoje NÃO é dinâmico — é um seletor A-H. As cores e dimensões trafegam mas não influenciam decisão da IA. Toda a renderização visual real acontece no \`fabrica-compose-art.ts\` (Parte 2/3 já auditadas).

 

📋 RAIO-X "IA PURA" — PARTE 2: Motor Canvas & Matemática Gráfica

Auditoria somente-leitura. \`src/lib/fabrica-compose-art.ts\` → \`renderIAPuraLayout\` (linhas 3406-3911).

\---

🧭 ARQUITETURA REAL DO RENDERER (descoberta-chave)

A função \`renderIAPuraLayout\` tem DOIS caminhos mutuamente exclusivos controlados por um \`if/else\`:

\`\`\`ts  
if (layoutJson && layoutJson.style) {  
   // ► CAMINHO 1: Templates HARDCODED A-H (é este que roda hoje)  
} else if (layoutJson && layoutJson.elements) {  
   // ► CAMINHO 2: Renderer dinâmico real (FALLBACK histórico, nunca acionado)  
}  
\`\`\`

A edge function \`fabrica-design-ai\` retorna \`{ style: "A"|...|"H" }\` → sempre cai no Caminho 1\. O Caminho 2 (elements\[\]) é código morto na prática — ficou de versão antiga.

Esta dualidade é a causa raiz das suas perguntas: você pensa estar auditando coordenadas dinâmicas da IA, mas o que renderiza é template fixo com apenas 4 strings (destination/price/duration/promoName) sendo injetadas em posições fixas.

\---

1\. 🗺️ MAPEAMENTO DE COORDENADAS

Caminho 1 (Templates A-H — REAL)  
Pixels absolutos hardcoded no canvas 1080×1080 ou 1080×1920. A IA NÃO envia nenhuma coordenada — só a letra. Exemplos:

\`\`\`ts  
// Estilo A  
ctx.fillText(destination, cw/2, isStory ? 480 : 260, cw \- 120, 24);  
// Estilo B (card lateral)  
const cardX \= cw \- cardW \- 60;   // 540px  
const cardY \= isStory ? 300 : 150;  
\`\`\`

Cada estilo tem branches \`isStory ? X : Y\` próprios → suporte aos dois formatos é manual. ✅ Sem overflow porque tudo foi posicionado à mão.

Caminho 2 (elements\[\] — MORTO)  
Pixels absolutos puros — \`ctx.fillRect(el.x, el.y, el.width||0, el.height||0)\`. Sem normalização, sem escala. Se a IA mandasse coordenadas de story (1920) num canvas square (1080), saía cortado — mas isso nunca chega a executar.

\---

2\. ✂️ QUEBRA DE LINHA E LIMITES

Caminho 1 (atual): NÃO usa \`wrapTextSafe\`  
Usa \`safeFillText(ctx, text, x, y, maxWidth, minSize)\`:  
\- Definida em \~linha 95-105: faz shrink-to-fit num laço \`while measureText \> maxWidth && size \> minSize { size-- }\`.  
\- NÃO quebra em duas linhas. Apenas reduz a fonte até caber, com mínimo (12-48px conforme chamada).  
\- Se mesmo na fonte mínima não couber, o texto vaza (porque o último \`fillText\` é executado independente do tamanho final).

Existe \`wrapTextSafe\` no arquivo (linha 112\) com auto-wrap real, mas só é usada nos compositores tradicionais V0-V4 (\`renderTravelAd\`), NUNCA dentro de \`renderIAPuraLayout\`.

Caminho 2 (morto)  
Tem laço completo de auto-wrap palavra-por-palavra (linhas \~3870-3900) — inclusive quebra por caractere quando uma palavra é maior que \`maxWidth\`. Esse código robusto está inacessível pelo fluxo atual.

🚨 Implicação  
Quando o usuário digita um destino longo ("Combo Praias do Nordeste Brasileiro"), no Estilo A com \`destFs=100\`, o shrink só vai até 24px. Se ainda for maior que 960px, escapa o canvas. Esse é provavelmente o "texto vazando" que você está vendo.

\---

3\. 🎨 CORES E FALLBACKS

Aplicação das cores do usuário (Caminho 1\)  
| Onde | Como |  
|---|---|  
| Pílula de preço (A, D, F, G) | \`options.secondaryColor \\|\\| "\#F59E0B"\` |  
| Cards, painéis (B, E, G, H) | \`options.primaryColor \\|\\| "\#0C2340"\` |  
| Texto sobre pílula | \`contrastOn(options.secondaryColor)\` ✅ |  
| Wordmark/título | sempre \`\#ffffff\` (branco hardcoded) |

✅ As cores ENTRAM nos templates. Inclusive com fallback de contraste automático nos botões.

Opacidade dos blocos sobre a foto  
Vários estilos usam rgba hardcoded:  
\- Estilo B card: \`"rgba(255, 255, 255, 0.92)"\` → 92% opaco (quase tapa a foto).  
\- Estilo D bloco base: \`"rgba(0,0,0,0.85)"\` → 85% opaco.  
\- Estilo G painel preço: \`"rgba(255,255,255,0.12)"\` → bem translúcido.

⚠️ A IA não controla essas opacidades — são fixas por template. Se o usuário quer mais "respiro" da foto, não tem botão.

Caminho 2 (morto)  
Aplica \`el.backgroundColor\` direto. Fallback: \`"rgba(0,0,0,0.5)"\` se ausente. RGBA respeitado nativamente pelo Canvas API. Mas inacessível.

\---

4\. 🛡️ SAFE ZONES & \`drawFinalBranding\`

✅ Sempre chamada como Passo 4 (linhas 3902-3910), depois dos templates A-H, com flag \`isIAPura: true\`.

Comportamento com \`isIAPura=true\` (linha 406+)  
\`\`\`ts  
const footerHeight \= isStory ? 80 : 60;        // mais compacto  
const panelBottom \= ch \- 30;                   // colado no fundo  
const footerY \= panelBottom \- footerHeight;  
const veilStartY \= footerY \- 80;               // véu gradiente preto começa 80px acima  
\`\`\`

| Formato | footerY | véu começa | Comentário |  
|---|---|---|---|  
| Square 1080 | Y=990 | Y=910 | Footer ocupa Y=990-1050 |  
| Story 1920  | Y=1810 | Y=1730 | Footer ocupa Y=1810-1890 |

🚨 Risco de colisão por estilo  
| Estilo | Último bloco | Y final | Colide com véu (910/1730)? |  
|---|---|---|---|  
| A square | Botão CTA \`bY=750\`, h=60 | 810 | ✅ sem colisão |  
| B square | Card \`cardY=150\` \+ \`cardH=620\` | 770 | ✅ sem colisão |  
| B story | Card \`cardY=300\` \+ \`cardH=1000\` | 1300 | ✅ folga |  
| D square | Bloco base \`blockY=660\` \+ \`blockH=300\` | 960 | ❌ invade véu (910) e parte do footer (990) |  
| D story | Bloco base \`blockY=1200\` \+ \`blockH=480\` | 1680 | ⚠️ encosta no véu (1730), marginal |  
| E square | Pix pill no fundo do card | depende do \`cardH\` | depende |  
| G | Painel preço dentro da coluna | varia | provável colisão |  
| H square | subCard com price \`subCardY \+ 110+\` | \~900-960 | ❌ provável colisão com véu |

Garantia real: \`drawFinalBranding\` é desenhado por cima (paint order). O véu cobre parcialmente o final do bloco D/H, e a logo \+ contatos vão por cima de tudo. Não há clipping nem bounds-check: o bloco da IA continua desenhado embaixo, só que mascarado pelo gradiente. Visualmente, o último item do card D fica "embaçado" pelo véu escuro.

Não existe nenhuma checagem "se elementY \+ h \> footerY então mover/cortar" — é puramente ordem de pintura.

\---

🚨 SÍNTESE DOS GARGALOS DO RENDERER

| Severidade | Problema | Local |  
|---|---|---|  
| 🔴 ALTA | A "IA Pura" não é dinâmica — é seletor de template A-H. Toda dor de coordenadas vem de templates hardcoded, não da IA | L3440-3801 |  
| 🔴 ALTA | \`safeFillText\` só faz shrink, não quebra linha → títulos longos escapam o canvas | função L95-105 |  
| 🟡 MÉDIA | Estilos D/H em formato square colidem o último bloco com a zona do véu/footer (Y \> 910\) | L3580-3801 |  
| 🟡 MÉDIA | Opacidade dos cards (0.92, 0.85) é hardcoded → sufoca a foto de fundo nos estilos B/D | L3497, L3586 |  
| 🟢 BAIXA | Caminho \`layoutJson.elements\` tem auto-wrap robusto, mas é código morto | L3802-3902 |  
| 🟢 BAIXA | Sem bounds-check antes de pintar — depende 100% da ordem de paint para "ocultar" colisões | toda função |

\---

💡 OBSERVAÇÃO FINAL CRUZADA COM PARTE 1

Você suspeitava de "JSON com x/y errados da IA". A verdade técnica é inversa: a IA hoje não manda x/y nenhum. Todo problema visual da IA Pura é defeito dos templates hardcoded A-H, não da IA Gemini. A IA Gemini só escolhe a letra — e mesmo essa escolha hoje ignora as cores do usuário (Parte 1 §2).

Para realmente ter "IA de Layout Dinâmico" seria preciso (a) trocar o contrato do prompt para pedir \`elements\[\]\` com x/y/width/height, (b) reativar o Caminho 2, (c) endurecer com bounds-check \+ clamp \+ auto-wrap (que já existe lá). Hoje, o caminho dinâmico está construído mas desligado.

📋 Pontos finais relevantes da IA Pura — o que ainda não foi dito

Pontos importantes que não apareceram nas Partes 1 e 2 e podem morder você:

\---

1\. 🔄 Fluxo de RETRY infinito disfarçado

No catch da IA Pura (\`Phase3ArtFactory.tsx\` L1453-1456):  
\`\`\`ts  
setForcedVariant(0);  
setGenMode("photo");  
setTimeout(() \=\> generate(), 500);  
\`\`\`  
\- Muda \`genMode\` para \`"photo"\` e re-dispara \`generate()\`.  
\- Se o erro original foi rate-limit (429) ou falta de chave, o modo foto também pode falhar (usa a mesma \`LOVABLE\_API\_KEY\` no \`fabrica-generate-ad\`).  
\- Não há contador de retentativas → em cenário de queda da API o usuário pode ver toasts em cascata sem entender.

\---

2\. 📦 Limite diário NÃO trava a geração, só conta

\`incrementAiPureDailyCount\` (chamado em L1440) só incrementa depois do sucesso. Não há \`if (aiPureCount \>= LIMITE) return\` antes do \`invoke\`. O contador \`setAiPureCount\` aparece na UI ("Gerações IA Pura hoje"), mas não é enforcer — usuário pode estourar à vontade. Se a intenção é limite real, falta o gate.

\---

3\. 🖼️ \`reframeImageToAspect\` roda no cliente — perdas silenciosas

\`reframeImageToAspect(refImage, format)\` (L1383) carrega a foto Pexels via \`\<img crossOrigin\>\` e recompõe num canvas para o aspect-ratio final. Riscos:  
\- CORS: se Pexels não enviar header correto numa imagem, \`canvas.toDataURL()\` lança "tainted canvas" → cai no catch e ativa fallback foto V0.  
\- A imagem reframed é base64 dataURL (pode ser 2-4 MB cada). Em \`isBatchMode\`, são 3 dataURLs em memória \+ 3 canvases 1080×1920 simultâneos. Em mobile com 2-3GB RAM pode dar OOM silencioso.

\---

4\. 🎨 \`selectedPhotoUrl\` precisa ser de Pexels

A UI obriga "Selecione uma Foto Real na galeria". Se o usuário tentar IA Pura sem clicar em foto, o toast aborta antes do invoke. Mas: não há fallback automático para usar uma foto default — bloqueia 100%. Se a galeria Pexels falhar (ver \`fabrica-search-photos\` nos logs), o usuário fica impossibilitado de usar IA Pura, mesmo com cota.

\---

5\. 💾 \`localStorage\` ainda guarda \`user\_gemini\_api\_key\`

Mesmo com a nova arquitetura "segura no servidor", o frontend continua lendo e enviando \`localStorage.getItem("user\_gemini\_api\_key")\` no payload (L1366). Implicações:  
\- Usuários antigos que cadastraram chave ainda têm ela no navegador → vai por XHR no payload (não é exfiltração para terceiros, mas trafega).  
\- A edge function ignora esse campo (não desestrutura \`userGeminiKey\`). Código morto que dá falsa sensação de "modo híbrido".

Se quiser higienizar: \`localStorage.removeItem("user\_gemini\_api\_key")\` \+ apagar do payload.

\---

6\. 📊 Falta observabilidade

A edge function \`fabrica-design-ai\` só faz \`console.error\` em casos específicos. Não loga:  
\- Qual estilo a IA escolheu (\`jsonOutput.style\`).  
\- Latência do Gemini.  
\- \`excludeStyles\` recebidos vs estilo final (para detectar se a IA respeita a restrição).

Resultado: você não consegue saber se a IA está enviesada para um estilo só (ex: sempre A). Suspeita comum em diretores de arte → todo anúncio fica parecido.

\---

7\. 🧪 \`variation\` é semântico, não criativo

O payload manda \`variation: idx \+ 1\`. No prompt vira:  
\> "This is variation index/number: 2\. Please select a style that maximizes visual diversity..."

Não há seed numérico nem \`temperature\` aumentado por variação. Como \`temperature: 0.7\` é fixo, as 3 variações tendem a convergir no mesmo estilo. A diversificação real vem só do \`excludeStyles\` rotativo (idx=1 exclui A,C; idx=2 exclui A,B,D,G). Ou seja: só 3 dos 8 estilos são realmente acessíveis no batch (E, F, H sempre passam, B só na primeira, C só na primeira).

\---

8\. 🔤 Dependência de fontes não-locais

Estilos A, C, E usam \`'Playfair Display'\` (serif). Não há \`@font-face\` carregado para Playfair no Canvas context. O browser só consegue desenhar a fonte se ela já estiver carregada no DOM. Se a página \`/fabrica\` não tem Playfair em CSS (não vi \`\<link\>\` de Google Fonts para ela), o canvas renderiza fallback (Georgia/Times) → estilo "editorial" fica com look genérico.

Vale conferir com \`document.fonts.check('900 76px "Playfair Display"')\` antes do \`fillText\`.

\---

9\. 🧊 Estado órfão após erro

Quando o catch dispara \`setGenMode("photo")\`, ele persiste o modo. Se o usuário não notar e tentar de novo, vai gerar em modo foto sem perceber. Não há \`setGenMode("ai")\` depois do sucesso do fallback → UX silenciosamente muda de aba.

\---

10\. 🪞 \`syncGeneratedPackageToSite\` roda também no IA Pura

L1436: \`await syncGeneratedPackageToSite(finalImages\[finalImages.length \- 1\], refImage)\`.  
Sobe a imagem gerada e a foto bruta original para o pacote do site público. Em \`isBatchMode\` só sincroniza a última das 3 — as outras 2 ficam órfãs. Se for intencional, ok. Se não, perde 2/3 do batch para o site.

\---

⛳ Resumo executivo dos 10 pontos

| \# | Severidade | Tema |  
|---|---|---|  
| 1 | 🟡 | Retry sem cap pode espiralar |  
| 2 | 🟡 | Limite diário não é enforcer |  
| 3 | 🟡 | OOM/CORS no reframe client-side em batch |  
| 4 | 🟢 | Sem foto Pexels \= sem IA Pura (sem fallback) |  
| 5 | 🟢 | \`userGeminiKey\` legado no payload |  
| 6 | 🟡 | Zero observabilidade do estilo escolhido |  
| 7 | 🔴 | Batch de 3 só acessa 3-4 estilos dos 8 |  
| 8 | 🔴 | Playfair Display pode não estar carregada → fallback de fonte |  
| 9 | 🟢 | \`genMode\` persiste após fallback sem reset |  
| 10 | 🟢 | Site só recebe a última imagem do batch |

Aguardando ordem para corrigir qualquer um.

