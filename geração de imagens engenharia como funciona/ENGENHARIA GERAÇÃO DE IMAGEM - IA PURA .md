Tenho tudo. Relatório técnico:

🔍 Relatório Diagnóstico — IA Pura (Layout Designer)

PARTE 1 — Payload Frontend → Edge Function

1.1 Ingestão de cores ✅  
\`Phase3ArtFactory.tsx\` (linhas 749–753) lê \`state.primaryColor\` / \`state.secondaryColor\` do \`FabricaState\` via \`useState\` \+ \`update()\`, e às linhas 1352–1353 elas são incluídas literalmente no payload:

\`\`\`ts  
// Phase3ArtFactory.tsx (1343-1356)  
supabase.functions.invoke("fabrica-design-ai", {  
  body: {  
    format,  
    destination, price, duration, highlights,  
    promoName, currencySymbol,  
    primaryColor,      // ← vindo do state  
    secondaryColor,    // ← vindo do state  
    userGeminiKey: localStorage.getItem("user\_gemini\_api\_key") || ""  // ⚠️ legado/morto  
  },  
});  
\`\`\`

⚠️ Observação: \`userGeminiKey\` continua sendo enviado mas o backend ignora (só usa \`IA\_PURA\_GEMINI\_KEY\` do servidor). Lixo no payload, sem risco.

1.2 System Prompt enviado ao Gemini  
Arquivo \`supabase/functions/fabrica-design-ai/index.ts\`. Há dois blocos:

A) \`systemInstruction\` (curto, anti-markdown):  
\`\`\`  
"You are a layout designer. Respond ONLY with raw minified JSON. No markdown, no prose."  
\`\`\`

B) \`contents\[0\]\` (user) — prompt principal (template literal):  
\`\`\`  
Crie um layout moderno e de alta conversão para um pacote de viagem.  
Destino: {destination}  
Preço: {currencySymbol} {price}  
Duração: {duration}  
Destaques: {highlights joined}  
Promoção: {promoName}

O formato do canvas é {1080x1920 | 1080x1080}.

CRITICAL COLOR RULES:  
You MUST use the exact colors provided by the user:  
\- Primary Box Color (main dark elements background): {primaryColor || "\#0c2340"}.  
\- Highlight/Pill Color (accents or highlight badges): {secondaryColor || "\#FCD34D"}.  
DO NOT invent other colors like orange, red, green, etc., unless they match the colors provided here.

CABRESTO ESPACIAL (GRID SYSTEM):  
1\. Título e Destaque: X=80, width máx 920\.  
2\. Card de Benefícios: box X=40, Y={1100|650}, width=1000, height={520|300}, fundo rgba(0,0,0,0.85), borderRadius 24\.  
3\. Preço e Inclusos: textos/pílulas DENTRO das coordenadas do Card.  
Todos os elementos devem respeitar estas coordenadas, sem colisão nem vazamento.

Retorne EXCLUSIVAMENTE um JSON válido com a estrutura: { "elements": \[ ... \] }  
You MUST return ONLY the raw, minified JSON object. Do NOT wrap in markdown.  
\`\`\`

✅ Cores obrigatórias: presentes (com fallback \`\#0c2340\` / \`\#FCD34D\` — isso pode ser problema se o front mandar string vazia, mas hoje sempre manda algo válido).  
✅ Width 920 no título: presente.  
⚠️ Limite de width só está explicitado para o título; para os demais elementos só há a regra implícita "DENTRO das coordenadas do card". A IA pode emitir \`width\` acima de 1080 em outros textos sem violar literalmente o prompt — o auto-wrap do renderer salva, mas o prompt não obriga width máximo global.

\---

PARTE 2 — Contrato JSON & Sanitização

2.1 Schema esperado (\`src/lib/fabrica-compose-art.ts\` linhas 3375–3393):

\`\`\`ts  
export interface IAElement {  
  type: "box" | "text";  
  x: number;  
  y: number;  
  width?: number;          // OPCIONAL  
  height?: number;         // OPCIONAL  
  backgroundColor?: string;// OPCIONAL  
  borderRadius?: number;   // OPCIONAL  
  color?: string;          // OPCIONAL  
  fontSize?: number;       // OPCIONAL  
  fontFamily?: string;     // OPCIONAL  
  fontWeight?: string;     // OPCIONAL  
  content?: string;        // OPCIONAL  
  textAlign?: "left"|"center"|"right"; // OPCIONAL  
}  
export interface IALayoutSchema { elements: IAElement\[\]; }  
\`\`\`

⚠️ Único campo realmente obrigatório: \`type\`, \`x\`, \`y\`. Todo o resto é \`?\` opcional. Não há validação Zod, nem checagem de bounds (x/y/width dentro do canvas), nem de tipos. Se a IA mandar \`x: "80"\` (string), o Canvas vai gerar NaN silenciosamente.

2.2 Sanitização de crases — \`supabase/functions/fabrica-design-ai/index.ts\`:

\`\`\`ts  
const rawText \= data?.candidates?.\[0\]?.content?.parts  
  ?.map(p \=\> p.text || "").join("") ?? "";  
if (\!rawText) throw new Error("IA não retornou conteúdo.");

const cleaned \= rawText.replace(/\`\`\`json/gi, "").replace(/\`\`\`/g, "").trim();  
const start \= cleaned.indexOf("{");  
const end \= cleaned.lastIndexOf("}");  
const jsonOutput \= JSON.parse(cleaned.substring(start, end \+ 1));

if (\!jsonOutput || \!Array.isArray(jsonOutput.elements)) {  
  throw new Error("JSON de layout inválido.");  
}  
\`\`\`

✅ Sanitização de crases intacta (remove \`\`\`\` \`\`\`json \`\`\`\` e \`\`\`\` \`\`\` \`\`\`\`, faz trim, e ainda recorta substring entre \`{\` e \`}\` como rede de segurança extra). Também usa \`responseMimeType: "application/json"\` na config do Gemini, o que reduz drasticamente a chance de vir markdown.

2.3 Fallbacks no renderer (\`fabrica-compose-art.ts\` 3430–3445):

| Propriedade ausente | Comportamento |  
|---|---|  
| \`box.backgroundColor\` | ✅ Fallback \`"rgba(0,0,0,0.5)"\` (linha 3432\) — preto translúcido. Não quebra. |  
| \`box.width\` / \`height\` | ⚠️ Fallback \`0\` → caixa invisível (não quebra, mas some). |  
| \`box.borderRadius\` | ✅ Se ausente, usa \`fillRect\` reto. |  
| \`text.color\` | ✅ Fallback \`"\#FFFFFF"\`. |  
| \`text.fontWeight\` | ✅ Fallback \`"bold"\`. |  
| \`text.fontFamily\` | ✅ Fallback \`options.fontFamily || "Inter"\`. |  
| \`text.fontSize\` | ✅ Fallback \`32\`. |  
| \`text.content\` | ✅ Fallback \`""\` (texto vazio, sem crash). |  
| \`text.width\` (para wrap) | ✅ Fallback \`cw \- 100\` \= 980px. |  
| \`text.textAlign\` | ✅ Fallback \`"left"\`. |

⚠️ Não há fallback para \`x\`/\`y\` — se a IA omitir, vira \`undefined\` e o Canvas desenha em \`NaN\` (nada aparece, sem crash).

\---

🚨 Pontos frágeis identificados (sem alterar)

1\. Prompt não restringe width máximo global dos elementos de texto fora do título → risco de overflow horizontal (mitigado parcialmente pelo auto-wrap).  
2\. Schema sem validação (todo campo opcional, sem Zod) → confia 100% no Gemini.  
3\. \`box.width=0\` fallback torna boxes mal-formados invisíveis silenciosamente — difícil debugar.  
4\. \`userGeminiKey\` no payload é código morto, pode ser removido.  
5\. Prompt fixa Card de Benefícios em Y=1100 (story) / Y=650 (square) — se a IA respeitar, fica colado no rodapé sempre, sem variação criativa entre gerações.

Aguardando instruções para correções.

🎨 Relatório — Motor Canvas & Auto-Wrap (IA Pura)

1\. AUTO-WRAP (quebra de linha) ✅ Implementado, com ressalvas

\`fabrica-compose-art.ts\` linhas 3450–3468, dentro do loop \`for (const el of layoutJson.elements)\` no branch \`type \=== "text"\`:

\`\`\`ts  
const text \= el.content || "";  
const maxWidth \= el.width || (cw \- 100);   // fallback 980px  
const words \= text.split(" ");  
let line \= "";  
let currentY \= el.y;  
const lineHeight \= fontSize \* 1.25;

for (let n \= 0; n \< words.length; n++) {  
  const testLine \= line ? \`${line} ${words\[n\]}\` : words\[n\];  
  const testWidth \= ctx.measureText(testLine).width;  
  if (testWidth \> maxWidth && n \> 0\) {  
    ctx.fillText(line, el.x, currentY);  
    line \= words\[n\];  
    currentY \+= lineHeight;       // desce uma linha  
  } else {  
    line \= testLine;  
  }  
}  
ctx.fillText(line, el.x, currentY);  
\`\`\`

Mecânica: clássico \`measureText\` em loop palavra-a-palavra. Quando a largura ultrapassa \`maxWidth\`, descarrega a linha acumulada e começa nova.

⚠️ Pontos fracos:  
\- Só quebra em espaços — uma palavra única gigante (ex.: "FERNANDODENORONHA" sem espaços) não quebra e vaza pela direita.  
\- Usa \`el.x\` como origem horizontal. Se a IA mandar \`textAlign: "center"\` ou \`"right"\`, o \`fillText(line, el.x, …)\` continua tratando \`el.x\` como âncora do alinhamento — pode parecer "fora do lugar" mesmo quebrando certo.  
\- O laço não testa overflow vertical: se o texto quebrar em 6 linhas, \`currentY\` cresce livremente e pode invadir o card de benefícios ou sumir pelo rodapé.  
\- \`maxWidth\` herda \`el.width\` da IA — se a IA omitir \`width\`, usa \`cw \- 100 \= 980\`, maior que os 920 instruídos no prompt, então elementos sem width estouram a margem esquerda definida no grid.

2\. ANCORAGEM DE RODAPÉ ✅ Última camada, isolada

Linha 3474–3487: após o loop de elementos, chama:

\`\`\`ts  
await drawFinalBranding(ctx, cw, ch, ..., isIAPura=true)  
\`\`\`

Função \`drawFinalBranding\` (linhas 385–430):

\- \`isIAPura=true\` ativa modo compacto:  
  \- \`footerHeight \= isStory ? 80 : 60\` (vs 120/100 padrão)  
  \- \`panelBottom \= ch \- 30\` → footer encostado no fundo absoluto  
  \- \`footerY \= panelBottom \- footerHeight\`

Coordenadas finais Y do footer:  
| Formato | \`ch\` | \`footerY\` | \`veilStartY\` (gradient) |  
|---|---|---|---|  
| Square 1080×1080 | 1080 | 990 (=1080-30-60) | 910 |  
| Story 1080×1920 | 1920 | 1810 (=1920-30-80) | 1730 |

⚠️ Colisão potencial com o Card de Benefícios (que o prompt fixa em):  
\- Square: Card \`Y=650, height=300\` → vai até Y=950. Veil escuro do footer começa em Y=910 → sobrepõe 40px do card (visualmente aceitável porque é gradiente escuro sobre fundo escuro, mas tecnicamente há overlap).  
\- Story: Card \`Y=1100, height=520\` → vai até Y=1620. Veil começa em Y=1730 → gap de 110px seguro.

O \`drawFinalBranding\` é sempre o Passo 4 e último, então pinta por cima de qualquer elemento que tenha invadido a zona — o branding nunca fica oculto, mas pode cobrir parte do conteúdo gerado pela IA no formato square.

3\. COORDENADAS: pixels absolutos

O renderer trata x/y/width/height como pixels absolutos sobre um canvas de tamanho fixo:

\`\`\`ts  
const cw \= 1080;  
const ch \= isStory ? 1920 : 1080;  
\`\`\`

Toda chamada é direta: \`ctx.fillRect(el.x, el.y, el.width || 0, el.height || 0)\` e \`ctx.fillText(line, el.x, currentY)\`. Nada é escalado, normalizado ou convertido.

Implicações:  
\- O Gemini precisa saber em qual formato está gerando. O prompt informa explicitamente (\`O formato do canvas é 1080x1920\` ou \`1080x1080\`) e fornece coordenadas Y diferentes para o card de benefícios por formato. ✅  
\- Sem clamp/bounds-check: se a IA mandar \`x: 1200\` num canvas de 1080, o Canvas desenha fora da área visível sem reclamar nem cortar.  
\- Sem DPI scaling: o canvas tem \`width=1080\` físico; exportado via \`toDataURL("image/png", 0.9)\` em 1:1.  
\- Se a IA confundir formato (ex.: gerar coordenadas de story num canvas square), o card aparece com \`Y=1100\` num canvas de altura 1080 → invisível totalmente.

\---

🚨 Resumo dos riscos de "vazamento"

| Risco | Causa | Mitigação atual |  
|---|---|---|  
| Texto vaza à direita | Palavra única longa sem espaço | ❌ Nenhuma — wrap só em espaços |  
| Texto vaza à esquerda | IA omite \`width\`, fallback é 980 em vez dos 920 do prompt | ❌ Sem clamp |  
| Texto vaza pelo rodapé | Muitas linhas após wrap empilham \`currentY\` sem teto | ❌ Sem teto vertical |  
| Card invade footer (square) | Card termina Y=950, veil começa Y=910 | ⚠️ Footer pinta por cima |  
| Card desaparece (mismatch de formato) | IA usa coords de story em canvas square | ❌ Sem bounds-check |  
| Elemento invisível | \`width=0\` fallback quando IA omite | ❌ Sem warning |

Aguardando ordem para qualquer correção.

📋 Pontos adicionais relevantes sobre a IA Pura

Além do que já cobri (payload, prompt, contrato JSON, renderer), seguem riscos/comportamentos que ainda não foram discutidos e podem causar dor:

1\. 🔑 Chave & secrets  
\- O secret ativo é \`IA\_PURA\_GEMINI\_KEY\`. A função também aceita \`USER\_GEMINI\_API\_KEY\` como fallback (linha 8 do \`index.ts\`). Ambos existem hoje no projeto → se alguém trocar um e esquecer do outro, pode usar a chave errada silenciosamente.  
\- O frontend ainda envia \`userGeminiKey: localStorage.getItem("user\_gemini\_api\_key")\` no payload. O backend ignora, mas é código morto que pode confundir auditoria futura.

2\. 🤖 Modelo & custo  
\- Usa \`gemini-2.5-flash\` direto na API do Google (\`generativelanguage.googleapis.com/v1beta\`), não o Lovable AI Gateway. Implicações:  
  \- Cobrança vai para a conta Google de quem é dono da \`IA\_PURA\_GEMINI\_KEY\`, não para o saldo Lovable.  
  \- Sem rate-limiting do Gateway; se a quota Google estourar, retorna 429/402 e o usuário vê erro genérico.  
  \- Não aproveita os modelos premium do Gateway (Gemini 2.5 Pro, GPT-5, etc.) que dariam layout melhor.

3\. 🛡️ Autorização  
\- Protegida por \`verifyFabricaEliteAccess\`. Só usuários Elite ou admin chamam. Se um Start tentar, recebe 401/403 antes mesmo da chave ser tocada.  
\- Sem rate-limiting próprio na função — um usuário Elite pode disparar a função em loop e consumir a quota do Google. Não há contador por-usuário/dia no servidor (o \`aiPureCount\` é só do frontend, fácil de burlar limpando localStorage).

4\. ⏱️ Sem timeout / sem retry  
\- \`fetch\` ao Gemini não tem \`AbortController\` nem timeout. Se o Google demorar 60s+, a Edge Function trava até o limite do Supabase (\~150s) e o usuário só vê spinner.  
\- Sem retry exponencial em 429 — falhou uma vez, falhou. O log da sessão de 30/05 menciona \`Promise.race\` de 25s, mas isso é em outra rota (Lote A/B), não nesta função.

5\. 🎨 IA não gera a imagem de fundo  
Reforçando porque é contraintuitivo: "IA Pura" é nome enganoso. A IA só desenha o JSON de layout (caixas e textos). O fundo continua sendo a Foto Real do Pexels selecionada pelo usuário (\`refImage\` → \`reframeImageToAspect\`). Se o usuário não escolher foto, a função joga toast "Selecione uma Foto Real" e aborta. Não há geração de imagem por IA aqui.

6\. 📐 Dados que a IA recebe mas não usa  
O frontend manda \`currencySymbol\` e \`duration\` no payload e o prompt cita ambos, mas o renderer (\`renderIAPuraLayout\`) recebe os mesmos dados via \`options\` e desenha o footer/branding próprio por cima. Se a IA emitir um text com o preço, e o \`drawFinalBranding\` também desenhar contatos, eles convivem — preço da IA fica na zona do card, contatos no rodapé. Não há sincronização: a IA não sabe que contatos/logo serão sobrepostos depois, então pode posicionar texto onde o branding vai pintar.

7\. 🎲 Não-determinismo  
\- \`temperature: 0.7\` → mesmo input gera layouts diferentes a cada clique. Para o usuário isso é "feature" (gerar 3 opções), mas significa que bugs visuais não são reproduzíveis facilmente.  
\- \`responseMimeType: "application/json"\` força JSON, mas a Gemini ainda pode emitir JSON sintaticamente válido com semântica ruim (x negativo, fontSize: 9999, etc.).

8\. 🧱 Lacunas que valem virar próximas tarefas (quando você liberar)  
| Prioridade | Item |  
|---|---|  
| 🔴 Alta | Adicionar \`AbortController\` com timeout de 20s no fetch ao Gemini |  
| 🔴 Alta | Validação Zod no JSON retornado (clamp x/y entre 0 e cw/ch, width ≤ cw, fontSize entre 16–200) |  
| 🟡 Média | Rate-limit por user\_id na função (ex.: 30 gerações/dia para Elite) |  
| 🟡 Média | Migrar para Lovable AI Gateway com \`google/gemini-2.5-pro\` (cobrança unificada \+ layouts melhores) |  
| 🟢 Baixa | Limpar \`userGeminiKey\` do payload e remover fallback \`USER\_GEMINI\_API\_KEY\` |  
| 🟢 Baixa | Avisar a IA no prompt sobre zona reservada do branding (ex.: "não posicione conteúdo Y \> 900 em square / Y \> 1700 em story") |  
| 🟢 Baixa | Quebrar palavras únicas longas com hifenização forçada quando \`measureText\` \> maxWidth |

Aguardo sua ordem para agir em qualquer um destes.

