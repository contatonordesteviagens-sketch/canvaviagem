🔍 Auditoria Estrita — \`renderV0Experiencia\` → \`renderV4Experiencia\`

Arquivo: \`src/lib/fabrica-compose-art.ts\` (3303 linhas)  
Bloco auditado: L2933 – L3216  
Status: somente leitura — nenhum byte alterado.

\---

1\. 🎨 Mapeamento Visual (o que cada variante desenha exclusivamente)

Pipeline comum a todas (L2934–2944 e equivalentes):  
\`drawProminentLogo(40,40,120)\` → \`fitCover\` da imagem → gradiente vertical preto → \`applyVignette\` → bloco textual → \`drawFinalBranding\` → \`applyFilmGrain\`.

| Var | Identidade | Gradiente | Vinheta | Tipografia / Estética exclusiva |  
|---|---|---|---|---|  
| V0 Luxo & Desejo (L2933) | Centralizado | \`0.60 → 0.30 → 0.80\` | 0.40 | Promo \`Playfair 800\` com letter-spacing por \`\\u2009\` (thin-space); subtítulo \`Inter 300\`; destino em caixa-alta \`Inter 800\` 110px (story) ancorado em \`panelBottom − 180\`. |  
| V1 Luxo Cinematográfico (L2989) | Centralizado | \`0.40 → 0.10 → 0.60\` | 0.35 | Promo na secondaryColor com espaço entre letras; título Playfair 900 120px quebrado manualmente em 2 linhas (split por metade do array de palavras) em torno de \`midY\`; shadowBlur 15 durante o título. |  
| V2 Luxo Material (L3048) | Centralizado | \`0.60 → 0.20 → 0.70\` | 0.30 | Promo curta na \`secondaryColor\`; título Playfair 900 110px desenhado palavra-por-linha (\`split(/\\s+/).forEach\`); finaliza com traço horizontal (stroke 3px na \`secondaryColor\`) sob o título. |  
| V3 Dark Premium (L3108) | Centralizado | \`0.70 → 0.30 → 0.85\` (mais escuro) | 0.45 | Título Inter 900 140px no centro vertical exato (\`height/2\`) via \`safeFillText\`; subtítulo itálico Playfair 600 com \`travelPeriod\` 80px abaixo; grain elevado para \`0.05\`. |  
| V4 Clean Editorial (L3155) | Alinhado à esquerda | Horizontal \`0 → 0.7w\` \`0.75 → 0.20 → 0\` (lavagem só na metade esquerda) | 0.30 | \`padLeft 100\` / \`topY 380\`; promo em \`secondaryColor\`; título Playfair 900 com wrap real por \`measureText\` (única variante com auto-wrap correto), limitado a 3 linhas. |

\---

2\. ⚠️ Acoplamento (Crítico) — escopo & closures

Veredito: parcialmente acopladas, mas com escopo de leitura limpo.

\- ✅ Não consomem \`drawBadge\` (L1210) nem \`drawHighlightsBlock\` (L1222) — esses helpers vivem dentro do escopo do \`renderSafeSquareOffer\` e nunca são chamados pelas funções de Experiência. Logo, a categoria não herda o bug arquitetural das Ofertas.  
\- ✅ Não usam \`cursorY\` — \`cursorY\` é uma \`let\` local de outras renders (ex. L1722). As 5 Experiências usam coordenadas calculadas pontualmente (\`midY\`, \`topY\`, \`height/2\`, \`line2Y\`).  
\- ⚠️ Sofrem de closure-coupling sobre variáveis do escopo pai (\`composeArt\`):    
  \`width, height, ctx, image, format, promoName, titleText, destination, travelPeriod, secondaryColor, logoDataUrl, whatsapp, instagram, footerContact1Icon/Value, footerContact2Icon/Value, effectiveTextColor, userFamily, panelBottom\`.    
  Não há parâmetros — toda a render lê variáveis livres. Qualquer alteração nelas em outra parte do composer afeta as 5 ao mesmo tempo. Não é o mesmo bug das ofertas (sem mutação compartilhada), mas a superfície de acoplamento por closure é alta.  
\- ⚠️ Duplicação massiva: o bloco \`drawFinalBranding(...)\` (\~10 linhas com a árvore \`footerContact1Icon ? ... : whatsapp ? ...\`) é literalmente copiado 5× (L2971, 3030, 3090, 3137, 3203). Mesma duplicação para \`drawProminentLogo\`, \`fitCover\`, \`ctx.drawImage\`, \`createLinearGradient\`, \`applyVignette\`, \`applyFilmGrain\`.

\---

3\. 📐 Z-Index / Ordem de desenho

Ordem idêntica e rigorosa em todas:

1\. \`drawProminentLogo\` (logo de topo)  
2\. Imagem de fundo (\`drawImage\`)  
3\. Gradiente  
4\. Vinheta  
5\. Conteúdo textual da variante  
6\. \`drawFinalBranding\` ← sempre o penúltimo passo  
7\. \`applyFilmGrain\` ← último

✅ \`drawFinalBranding\` é o último elemento opaco em todas as 5 — logo, sombras/blur do título (ex. \`shadowBlur 15\` em V1, L3024–3028) não cobrem logo nem contatos do rodapé.

⚠️ Caveat 1: \`applyFilmGrain\` é desenhado por cima do branding. Em opacidade ≤ 0.05 isso é imperceptível, mas tecnicamente o branding não é o "top layer".    
⚠️ Caveat 2: O \`drawProminentLogo\` do topo (40,40,120) é redundante com o logo do \`drawFinalBranding\`. Ele aparece antes do gradiente, então gradiente \+ vinheta o escurecem — efeito visual oscila por variante.

\---

📊 Análise Matemática & Responsividade Feed (1:1) vs Stories (9:16)

1\. Ternários de formato — nós de ancoragem vertical

Todas as 5 detectam formato via closure literal \`const isStory \= format \=== "story"\`. Não há sistema de unidades relativas (vh/%); são constantes mágicas em pixels ramificadas por \`isStory\`. Inventário:

| Var | Linha | Ancoragem | Story | Feed |  
|---|---|---|---|---|  
| V0 | 2956 | promo font | 44 | 36 |  
| V0 | 2957 | promo Y | 300 | 150 |  
| V0 | 2960 | subtítulo font | 28 | 22 |  
| V0 | 2962 | subtítulo Y | 370 | 200 |  
| V0 | 2966 | \`line2Y \= panelBottom − offset\` | −180 | −120 |  
| V0 | 2968 | destino font | 110 | 78 |  
| V1 | 3012 | promo font | 32 | 24 |  
| V1 | 3014 | promo Y | 320 | 150 |  
| V1 | 3017 | título font | 120 | 90 |  
| V2 | 3070 | promo font | 24 | 18 |  
| V2 | 3072 | promo Y | 350 | 180 |  
| V2 | 3075 | título font | 110 | 80 |  
| V3 | 3129 | título font | 140 | 100 |  
| V3 | 3133 | subtítulo font | 32 | 24 |  
| V3 | 3135 | subtítulo offset | \+80 | \+60 |  
| V4 | 3172–73 | \`padLeft / topY\` | 100 / 380 | 70 / 180 |  
| V4 | 3180/85 | promo & title font | 28 / 110 | 22 / 80 |

Apenas V0 ancora-se em \`panelBottom\` (defesa contra colisão com branding). V1, V2, V3 ancoram em \`height / 2\` — vulnerável: se o branding crescer, há colisão. V4 parte do topo (\`topY\`) sem teto inferior.

\---

2\. Overflow de texto — wrap / auto-fit

| Var | Título | Subtítulo / \`travelPeriod\` |  
|---|---|---|  
| V0 | \`safeFillText\` com \`maxWidth \= width − 80\` → faz shrink-to-fit (reduz font até caber em 1 linha; mín 24px). Não quebra linha. | \`safeFillText(... 16)\` — shrink-to-fit. |  
| V1 | ❌ Sem \`safeFillText\`. Quebra em 2 linhas via \`split(/\\s+/)\` partido na metade do array. Não mede largura → texto muito longo vaza horizontalmente e/ou colide com \`drawFinalBranding\`. | n/d |  
| V2 | ❌ Sem \`safeFillText\`. Uma palavra por linha: se houver 5+ palavras a pilha vertical (\`titSize \* 0.95\`) invade o rodapé. | n/d |  
| V3 | ✅ \`safeFillText\` no título (shrink-to-fit, mín 28). | \`ctx.fillText(travelPeriod)\` direto, sem medição — pode sangrar lateralmente em strings longas. |  
| V4 | ✅ Única com wrap real: loop \`measureText\` quebrando por largura disponível, truncado em 3 linhas (\`lines.slice(0,3)\`) — palavras excedentes são silenciosamente descartadas. | promo via \`safeFillText\`. |

Resumo do risco de colisão com rodapé:  
\- V1 e V2: alto — sem proteção de \`panelBottom\`, sem wrap inteligente.  
\- V3: médio — título protegido, mas \`travelPeriod\` cru.  
\- V0 e V4: baixo.

\---

3\. Gestão do espaço vazio deixado pela ausência de Oferta

A flag \`isExperience\` zera os campos econômicos no início do composer (L983–986):

\`\`\`ts  
const price        \= isExperience ? "" : sanitizeAdText(rawPrice || "");  
const installments \= isExperience ? "" : sanitizeAdText(rawInstallments || "");  
const showTotal    \= isExperience ? false : (rawShowTotal \!== false);  
const showPixBanner= isExperience ? false : (rawShowPixBanner \!== false);  
\`\`\`

Como o canvas preenche o buraco do card de oferta?

\- ❌ Não preenche. As funções V0–V4 não consultam \`price\` nem o slot do card de oferta. Elas redesenham o canvas do zero a partir da foto de fundo \+ gradiente \+ texto. O "buraco" do card simplesmente não existe — não é um espaço reservado, é apenas pixels da foto+gradiente.  
\- 🎯 Compensação visual por gradiente inferior reforçado: cada variante carrega um stop final mais escuro na base (\`0.80\` V0, \`0.60\` V1, \`0.70\` V2, \`0.85\` V3) que parece um plinto e dá peso ao branding inferior — substitui visualmente a "massa" do card.  
\- 📐 Ancoragem inferior:  
  \- V0 amarra o headline ao \`panelBottom − 180/120\` para empurrar a tipografia para baixo e ocupar a zona onde estaria o card.  
  \- V1/V2/V3 ancoram em \`height/2\` → deixam a metade inferior visivelmente vazia (só foto+gradiente entre o título e o \`drawFinalBranding\`).  
  \- V4 é assimétrico (texto à esquerda) e aceita o vazio à direita como respiro editorial.

Conclusão arquitetural: não há um sistema de layout flow que redistribua o espaço — é responsabilidade implícita do designer de cada variante decidir como ocupar a metade inferior. V0 é a única com matemática explícita de plinto via \`panelBottom\`; as demais confiam apenas no gradiente para mascarar o vazio.

\---

🔍 Auditoria — Ingestão de Dados & Estado da Categoria Experiência

Somente leitura. Nenhum byte alterado.

\---

1\. 🎛️ Gatilho na UI — onde \`isExperience\` nasce

Importante: \`isExperience\` não é um campo do \`FabricaState\`. É um booleano derivado computado no momento da chamada de \`composeArt\`, sempre como:

\`\`\`ts  
isExperience: categoria \=== "experiencia\_destino"  
\`\`\`

Aparece em 4 call-sites na geração (\`Phase3ArtFactory.tsx\` L1279, 1486, 1614, 1692; mesmos pontos na variante ES). Não existe \`setIsExperience\` em lugar algum.

Fonte de verdade real: a variável local \`categoria: CategoriaId\` (L472) do componente \`Phase3ArtFactory\`, espelhada em \`state.lastCategoria\` (\`useFabricaContext.tsx\` L172/321) via \`update({ lastCategoria: c })\` (L619, dentro de \`setCategoria\`).

Como o botão está desativado hoje (\`Phase3ArtFactory.tsx\` L1964–2006):

\`\`\`tsx  
const isExperiencia \= c.id \=== "experiencia\_destino";  
\<button  
  disabled={isExperiencia}  
  onClick={() \=\> { if (\!isExperiencia) setCategoria(c.id); }}  
  className={isExperiencia  
    ? "opacity-35 cursor-not-allowed pointer-events-none"  
    : ...}  
\>  
  ...  
  {isExperiencia && \<span className="...animate-pulse"\>EM BREVE\</span\>}  
\</button\>  
\`\`\`

Defesas em camadas: \`disabled\` HTML \+ \`pointer-events-none\` \+ guarda no \`onClick\` \+ opacidade 35%. Não está oculto — está visível com badge "EM BREVE". A versão ES (\`Phase3ArtFactoryES.tsx\`) tem o mesmo padrão.

⚠️ Observação memorial vs. código: a memória \`Core › Fábrica Ads\` diz que a categoria "Experiência de Destino" foi REMOVIDA. O código contradiz isso: ela permanece em \`CATEGORIAS\` (\`src/data/fabrica-categories.ts\` L51), em \`CategoriaId\` (L11), nas funções \`renderV{0..4}Experiencia\`, em \`lastCategoria\` e em todas as ramificações de defaults/cores/highlights. A categoria está apenas em "stand-by visual", não excluída.

\---

2\. 📋 Contrato de dados — o que precisa estar setado quando \`isExperience \=== true\`

Releitura de \`composeArt\` (\`fabrica-compose-art.ts\`) cruzada com as 5 renders V0–V4:

Obrigatórios para não quebrar o Canvas  
| Campo | Origem no payload | Consumido por | Fallback no composer? |  
|---|---|---|---|  
| \`image\` (HTMLImageElement) | parâmetro | todas | ❌ quebra se \`null\` (sem ramo de fallback) |  
| \`width\`, \`height\`, \`format\` | parâmetro | todas | ❌ obrigatórios |  
| \`destination\` | \`state.destinos?.\[0\]\` | V0/V1/V3/V4 (\`destFmt || destination || "DESTINO"\`) | ✅ literal "DESTINO" |  
| \`titleOverride\` → vira \`titleText\` | montado em Phase3 | V0/V1/V2/V3/V4 | ✅ cai para \`destination\` em V1/V2/V3/V4, e em V0 cai para "DESTINO" |  
| \`promoName\` | \`state.lastPromoName\` | V0/V1/V2/V4 | ✅ literais ("EXPERIÊNCIA EXCLUSIVA", "Experiencia Única", "Exclusive") |  
| \`travelPeriod\` | \`state.lastTravelPeriod\` | V3 (subtítulo cinematográfico) | ✅ "Uma jornada inesquecível" |  
| \`logoDataUrl\`, \`effectiveTextColor\`, \`userFamily\`, \`secondaryColor\` | \`state.logoBase64\` / cor base | \`drawProminentLogo\` \+ \`drawFinalBranding\` \+ acentos | ⚠️ logo pode ser vazio; \`secondaryColor\` sem fallback (usado em V1/V2/V4 como cor da promo e em V2 como cor do stroke) |  
| \`whatsapp\`/\`instagram\` ou \`footerContact1/2Icon+Value\` | \`state\` | \`drawFinalBranding\` | ✅ ternário trata \`undefined\` |  
| \`panelBottom\` (constante \`RULES.PANEL\_BOTTOM\`) | módulo | V0 (ancoragem do destino) | ✅ constante |

Zerados de propósito pelo composer (L983–986)  
\`\`\`ts  
price \= "";  installments \= "";  showTotal \= false;  showPixBanner \= false;  
\`\`\`  
→ As 5 renders não leem essas variáveis, então o "zerar" é apenas seguro defensivo para qualquer helper compartilhado (não acionado nas Experiências).

O que não quebra mas degrada  
\- \`lastHighlights\` vazio → as 5 funções V0–V4 do composer não usam highlights (diferente dos componentes React \`V\*Experiencia.tsx\`). Sem impacto no canvas.  
\- \`lastPaymentSuffix\` (slogan): ignorado pelo canvas; só os componentes JSX o consomem.

Risco zero de "undefined access"  
Todas as 5 renders usam \`||\` fallback antes de \`safeFillText\`/\`fillText\`. Não há \`.toUpperCase()\` em variável que possa ser \`undefined\` sem \`||\` antes. Inspecionado L2955, 2969, 3011, 3019, 3069, 3077, 3131, 3187\.

\---

3\. 🛡️ Prevenção de vazamento — a flag pode ficar "presa"?

Pontuação de risco: 🟡 médio-baixo, mas com vetor real

A flag \`isExperience\` em si NÃO vaza — é derivada por turno de \`categoria \=== "experiencia\_destino"\` no ato da geração. Não existe estado booleano persistente.

Mas \`categoria\` SIM persiste — via \`state.lastCategoria\` no \`FabricaContext\`, que por sua vez:  
\- É serializado em \`localStorage\` por \`usuário\` (\`readPersistedState\` L392, \`useFabricaContext.tsx\` L172/321).  
\- É restaurado ao remontar o \`Phase3ArtFactory\` (L472 \`useState\<CategoriaId\>((state.lastCategoria as CategoriaId) || "oferta\_pacote")\` e L811 mesmo padrão em efeito de reset de projeto).

Cenários de vazamento

| Cenário | Vaza? | Razão |  
|---|---|---|  
| Usuário escolhe Experiência → recarrega página → gera nova arte esperando Oferta | 🔴 SIM | \`lastCategoria \= "experiencia\_destino"\` é re-hidratado; \`isExperience\` será \`true\` na próxima geração até o usuário tocar o tab — que está disabled. |  
| Hoje (categoria botão disabled) | 🟢 não | usuário nunca consegue selecionar Experiência via UI, então \`lastCategoria\` permanece "oferta\_pacote" para usuários novos. |  
| Usuário com \`lastCategoria\` legado (ex.: gravado antes do disable) | 🟡 latente | se algum perfil já tem \`experiencia\_destino\` no localStorage, ele dispara \`isExperience: true\` em toda geração, sem maneira de reverter pela UI (botão desabilitado). |  
| Clique "Novo Projeto" (\`FabricaDashboard\` dispatch \`fabrica-load-snapshot {}\`) → \`reset()\` | 🟢 não | \`defaultState.lastCategoria \= "oferta\_pacote"\` (L321). |  
| Trocar de projeto salvo via snapshot | 🟡 herda | \`state\_snapshot\` carregado pode trazer \`lastCategoria\` da época em que foi salvo. |

Pontos de reset existentes  
\- \`defaultState\` força \`"oferta\_pacote"\` (L321) — usado em \`reset()\` (L612 \`setState(defaultState)\`) e em \`freshState\` (L939).  
\- \`setCategoria(c)\` (L616–696) faz muito mais do que \`update({ lastCategoria: c })\`: limpa overrides de cor de texto, troca defaults condicionalmente — porém só é chamado pelo botão, que está desabilitado para a categoria de risco.

Vetor de vazamento não mitigado  
Não há migração defensiva no \`readPersistedState\`/hidratação que force \`lastCategoria\` para \`"oferta\_pacote"\` enquanto a categoria estiver em "stand-by". Logo, qualquer usuário com snapshot/localStorage histórico marcado como \`experiencia\_destino\` está hoje gerando Experiência sem botão para sair, e o composer está omitindo preço, parcelas, total e banner PIX silenciosamente (L983–986).

\---

📌 Resumo executivo

1\. Gatilho UI já existe e está corretamente bloqueado por 4 camadas (\`disabled\`, \`pointer-events-none\`, guarda no \`onClick\`, badge "EM BREVE"). Botão visível, não oculto.  
2\. Contrato mínimo para reativar com segurança: \`image\`, \`width/height/format\`, \`destination\` (com fallback), \`secondaryColor\`. \`promoName\`, \`titleOverride\`, \`travelPeriod\`, \`logoDataUrl\` têm fallbacks defensivos no composer. Nenhum risco de \`undefined.toUpperCase()\`.  
3\. Risco de vazamento existe via \`state.lastCategoria\` persistido em \`localStorage\`/snapshot. Recomendado (quando reativar ou reforçar o stand-by): sanitização na hidratação (\`readPersistedState\` → forçar \`"oferta\_pacote"\` se categoria estiver bloqueada) ou flag global de feature que sobreponha \`categoria\` antes da chamada a \`composeArt\`.

Pronto para a próxima diretriz.

🧩 Outros pontos relevantes da pipeline de geração de imagens (Fábrica)

Audit only — nada alterado. Itens que ainda não cobrimos nas auditorias anteriores e que impactam diretamente a geração das Experiências:

\---

1\. 🤖 Quem realmente gera o pixel — 3 caminhos distintos

A categoria Experiência pode passar por três engines diferentes dependendo do \`GenMode\` (X do código XYZ):

| Modo (X) | Engine | Onde mora |  
|---|---|---|  
| 1 · Foto Real | Pexels/Unsplash search → \`composeArt()\` Canvas 2D | \`Phase3ArtFactory.tsx\` L1190–1290 |  
| 2 · Sua Imagem | Upload do usuário → \`composeArt()\` Canvas 2D | mesmo caminho, \`image\` vem de \`URL.createObjectURL\` |  
| 3 · IA Pura | Lovable AI Gateway (\`gpt-image-2\` / Gemini image) → eventualmente passa por \`composeArt()\` para colar branding | \`Phase3ArtFactory.tsx\` L1315+ (\`isAiExperienceStory\`) |

⚠️ Risco específico de Experiência em IA Pura: o comentário no roteamento (\`fabrica-compose-art.ts\` L3229) diz "Experiência usa fluxo seguro sem texto da IA" — ou seja, o prompt enviado ao Gateway é sem overlay textual, e o composer deveria adicionar o texto por cima. Mas as 5 renders V0–V4 desenham sobre \`image\`: se a IA gerar uma foto já carregada de texto ou logos, o overlay tipográfico colide. Não há nenhum guard \`negativePrompt: "no text, no logo, no watermark"\` documentado na auditoria — vale verificar.

\---

2\. 🛡️ \`fabrica-generation-guard.ts\` — proteção de duplicatas

\`getForbiddenSets(categoria, mode, format)\` (chamado em L1213, 1322\) mantém conjuntos de hashes de imagens já usadas e estratégias recentes por categoria \+ modo \+ formato. Isso significa:

\- ✅ Se reativarem a Experiência, ela já tem isolamento de duplicatas próprio, não vai colidir com Ofertas.  
\- ⚠️ Porém os hashes são persistidos por \`scopedGenerationKey\` em localStorage. Um usuário com histórico legado de Experiência terá seu pool de "fotos proibidas" intacto desde a última vez que gerou — pode levar a "nenhuma foto disponível" se o histórico estiver saturado.

\---

3\. 🎨 \`drawFinalBranding\` — o helper que todas as 5 Experiências dependem

Vive em L382. É a única função responsável por logo \+ WhatsApp \+ Instagram no rodapé. Pontos críticos:

\- Recebe \`effectiveTextColor\` calculado fora do escopo das renders — se \`baseTextMode \=== "dark"\` for setado em Experiência sobre foto noturna, contato vira preto sobre preto.  
\- A constante \`RULES.PANEL\_BOTTOM\` (L1120 \`panelBottom\`) é a única defesa contra o título do V0 colidir com o branding. V1/V2/V3/V4 não a usam.  
\- Se ela for refatorada/movida, as 5 renders quebram juntas — alto acoplamento por closure já reportado.

\---

4\. 📐 Constantes mágicas vs. responsivo real

Toda a matemática das 5 renders assume \`width × height\` \= dimensões fixas (provavelmente 1080×1080 ou 1080×1920 do \`composeArt\` parent). Não há sistema de DPR/scale. Se algum dia mudar para 4K ou 3:4 LinkedIn, as 5 renders V0–V4 quebram silenciosamente — fonts em px absolutos, paddings em px absolutos, sem normalização.

\---

5\. 🖼️ \`applyFilmGrain\` & \`applyVignette\` — efeitos pós-processamento

\- \`applyFilmGrain\` é chamado depois de \`drawFinalBranding\` → tecnicamente granula sobre a logo. Em opacidade ≤ 0.05 é invisível, mas tecnicamente o branding não é o último layer.  
\- \`applyVignette\` na borda escurece os 4 cantos. Se o usuário escolher uma logo em PNG com fundo transparente posicionada no canto, a vinheta a obscurece.

\---

6\. 🌐 Versão ES (\`Phase3ArtFactoryES.tsx\`)

A categoria Experiência também está em \`disabled\` na variante ES (mesmo padrão de UI). Porém, se o vazamento de \`state.lastCategoria\` ocorrer no PT, ele persiste se o usuário trocar para ES — o contexto é compartilhado. Não há sanitização ao trocar idioma.

\---

7\. 🧾 Captions/copy gerados ao lado da arte

Em \`Phase3ArtFactory.tsx\` L406–446 existe um gerador de texto de legenda com ramo \`if (v.isExperience)\` → produz copy emocional ("Já imaginou viver…") em vez de copy de preço. Esse texto vai para clipboard/preview. Isso significa:

\- Mesmo se o canvas estiver gerando uma Oferta corretamente, se \`isExperience\` vazar em qualquer um dos 4 call-sites, a legenda fica emocional sem preço — quebra de conversão silenciosa.

\---

8\. 🔁 Cache de estratégias e rotação de variantes V0..V4

\`scopedStrategyHistoryKey(categoria, genMode, format)\` (L344) guarda histórico para forçar variantes distintas na próxima geração. Para Experiência: a rotação é entre V0..V4 do composer. O usuário não consegue forçar uma variante específica quando o botão da categoria está disabled — o seletor manual \`forcedVariant\` (L1957) também fica órfão para Experiência.

\---

9\. 📦 Onde não existe \`isExperience\` (boa notícia)

\- Não está no \`FabricaState\` persistido → não vaza por si só.  
\- Não está em edge functions / Supabase → não há resíduo server-side.  
\- Não está em URL/query string → não há deep-link envenenado.

O único vetor real de vazamento continua sendo \`state.lastCategoria\` no localStorage (já reportado).

\---

10\. 🚨 Recomendações silenciosas para quando reativar

(apenas registrar — não executar agora)

1\. Sanitização defensiva em \`readPersistedState\` enquanto categoria estiver bloqueada.  
2\. Negative prompt em IA Pura (\`no text, no logo, no watermark, no signage\`).  
3\. Unificar o bloco copy-pasted de \`drawFinalBranding(...)\` num helper único \`composeBranding(ctx, state)\`.  
4\. Adicionar \`safeFillText\` ao título de V1/V2 e ao \`travelPeriod\` de V3.  
5\. Ancorar V1/V2/V3 em \`panelBottom\` em vez de \`height/2\`.  
6\. Reordenar V0–V4: \`applyFilmGrain\` antes de \`drawFinalBranding\`.  
7\. Centralizar \`isExperience: categoria \=== "experiencia\_destino"\` numa única função \`buildComposePayload(state)\` em vez de 4 call-sites duplicados — evita esquecer um.

\---

Esses são os pontos da pipeline que ainda não tinham aparecido nas três auditorias anteriores. Pronto para a próxima instrução.  
