🔬 RAIO-X DAS VARIANTES DO \`composeTravelAd\` — \`src/lib/fabrica-compose-art.ts\`

⚠️ Descoberta de Base (corrige a premissa do prompt)

\`\`\`ts  
// linha 1366  
const TOTAL\_VARIANTS \= 6;  
let variant \= ((forceVariant % 6\) \+ 6\) % 6;  
\`\`\`

Não existem 7 variantes. Existem 6: V0, V1, V2, V3, V4 e V5. Cada \`if (variant \=== N)\` aparece em apenas uma linha do arquivo:

| Variante | Branch (linha) | Status |  
|---|---|---|  
| V0 | 1907 | ✅ implementada |  
| V1 | 2052 (story+square) | ✅ implementada |  
| V2 | 2310 (story+square) | ✅ implementada |  
| V3 | 1398 (story+square) | ✅ implementada |  
| V4 | 2757 | ✅ implementada |  
| V5 | 3056 | ✅ implementada |  
| V6 | — | ❌ NÃO EXISTE NO CÓDIGO |

Se a UI/menu mostra um botão "V6", ele cai no \`% 6 \= 0\` → renderiza V0. Isso explica boa parte da queixa de "resultados duplicados". O comentário do próprio arquivo confirma:  
\`\`\`  
// linha 1365 — Variantes ATIVAS: V0, V1, V2, V3, V4, V5 (todas implementadas).  
\`\`\`

\---

1\) MAPEAMENTO INDIVIDUAL

Convenção: \`width=1080\` sempre; \`height=1080\` (square) ou \`1920\` (story). \`left ≈ 40px\`, \`safeTop\` reservado para logo no story.

V0 — PAINEL SUPERIOR SÓLIDO \+ foto embaixo  
\- Fundo: painel sólido \`secondaryColor\` no topo (\`fillRect(0,0,width, topH)\`). Foto aparece abaixo do painel (mesma posição em square/story).  
\- Altura do painel: adaptativa entre \`46%\` e \`62%\` da altura → \`topH \= clamp(height\*0.46, calc, height\*0.62)\`. Só esse cálculo já compensa a diferença square↔story.  
\- Título: \`x \= left (40)\`, \`y \= badgeY \+ badgeH \+ 40 \+ titleSize\`, fonte \`900 Inter\`, auto-shrink 78→38px (loop manual, não usa wrapTextSafe).  
\- Card de preço: bloco horizontal ancorado em \`priceCenterX\` à direita do painel; altura fixa \`priceBlockH=120\`.  
\- Story vs Square: muda só pelo \`safeAnchorY \= isStory ? safeTop : (logoH+28)\`; matemática idêntica.

V1 — PAINEL ESCURO À ESQUERDA \+ foto sangrada à DIREITA (ref. "Black Friday")  
\- Fundo: painel sólido escuro em uma coluna esquerda, foto cortada (cover) na coluna direita.  
\- Título: \`x \= px (dentro do painel esquerdo)\`, \`y \= titleY\`, fonte \`900\` em múltiplas linhas (loop próprio com \`ctx.fillText(ln, ...)\`, não usa wrapTextSafe).  
\- Benefícios: lista vertical de "pills" dentro do painel esquerdo, ícone+texto.  
\- Card de preço: dentro do mesmo painel esquerdo, embaixo dos benefícios. Auto-shrink do valor 76→30px.  
\- Story (linha 2054): "painel esquerdo sólido \+ foto sangrada à direita" (refatorado).  
\- Square (a partir de 2216): renderer dedicado com mesma matemática, só ajustando proporções.

V2 — FOTO NO TOPO \+ faixa headline \+ benefícios \+ card preço (ref. "Santa Teresa")  
\- Fundo: foto cobre apenas a faixa superior; bloco inferior tem fundo de cor (mais editorial).  
\- Título: USA \`wrapTextSafe\` (linhas 2390 e 2630), max 2 linhas, fonte 34/32px.  
\- Benefícios: grid de 2 colunas (\`colW \= (contentWidth-28)/2\`), com ícone mono à esquerda do texto.  
\- Card de preço: centralizado, largura adaptativa \`min(width\*0.84, max(width\*0.5, conteúdo+110))\`. Pílula "10X/À VISTA" \+ valor gigante \+ total \+ faixa Pix opcional.  
\- Story (2315) vs Square (2483): dois renderers separados com a mesma estrutura visual, apenas reduções de tamanho.

V3 — REF "CVC": foto cheia \+ BOX AMARELO destacado  
\- Fundo: foto cobre 100% (\`fitCover\` com \`fy=0.45\`).  
\- Box principal: retângulo arredondado amarelo (\`secondaryColor || \#FCD34D\`) posicionado topo-esquerda; conteúdo em coluna: "PACOTE" → destino → dias+ícones → "a partir de" → 12x → preço gigante → "por pessoa" → faixa Pix.  
\- Título/destino: \`safeFillText\` (linhas 1471, 1711\) — segura mas não quebra em 2 linhas.  
\- Preço: dentro de "ring" circular (story 1523-1551).  
\- Story (1399) vs Square (1611): branches separados; story tem box mais alto, square é mais compacto e desloca conteúdo de "destino" para coluna lateral.

V4 — CARD CENTRAL VERTICAL sobre foto cheia  
\- Fundo: foto cobre 100% (\`fy=0.42\`).  
\- Card: \`cardW \= width \* (story?0.78:0.70)\`, centralizado em X, posicionado em \`idealCardY \= height \* (story?0.24:0.16)\`. Altura somatória dos blocos (tagline \+ título \+ info \+ preço \+ total).  
\- Conteúdo do card: TAGLINE amarela → TÍTULO branco grande (peso 400\!) → linha de info (dias \+ ícones) → bloco preço (pílula 10X \+ valor gigante) → total opcional.  
\- Quebra de texto: apenas \`safeFillText\` (auto-shrink), não usa wrapTextSafe — força tudo em 1 linha.  
\- Story vs Square: mesmo branch, parametriza por \`format \=== "story"\` (\`cardW\`, \`idealCardY\`, etc.).

V5 — AURORA PREMIUM (glassmorphism)  
\- Fundo: foto cobre 100% \+ overlay de gradiente vertical escuro (\`auroraGrad\` rgba(0,0,0,0.1) → rgba(5,8,15,0.95)\`).  
\- \*\*Card horizontal:\*\* \`cardW \= width \* (story?0.88:0.82)\`, altura \*\*fixa\*\* \`story?420:315\`; dividido em \*\*coluna esquerda 55-58%\*\* (tagline+título+benefícios) e \*\*coluna direita\*\* (preço).  
\- \*\*Card style:\*\* fundo \`rgba(primary, 0.96)\` \+ borda glow \`secondaryColor\` 4px (look "glass").  
\- \*\*Título:\*\* quebra manual (loop próprio palavra-a-palavra, linhas 3177-3197) com auto-shrink. \*\*Não usa wrapTextSafe\*\* mas implementa lógica equivalente local.  
\- \*\*Story vs Square:\*\* mesmo branch; só parametriza dimensões.

\---

\#\# 2\) CLONES / DUPLICAÇÕES

| Par | Veredito | Evidência |  
|---|---|---|  
| \*\*V4 ≈ V5\*\* | \*\*🟠 Quase-clones funcionais\*\* | Ambos: foto 100% \+ card central com tagline amarela \+ título \+ info \+ preço grande. Diferenciação real é só: V5 tem overlay aurora \+ card horizontal 2-colunas \+ borda glow; V4 é vertical com sombra simples. A lógica de cálculo de preço/total/parcelas é praticamente \*\*copy-paste\*\* (\`hasCentsV4\`/\`hasCentsV5\`, \`fmtBRv4\`/\`fmtBRv5\`, \`totalMultiplierV4\`/\`V5\` — mesmas funções renomeadas). |  
| \*\*V3 (story) ↔ V3 (square)\*\* | \*\*🟠 Duplicação interna\*\* | Os comentários "── Cores do V3 (box CVC) ──" aparecem \*\*duas vezes\*\* (linhas 1405 e 1613\) com inicialização repetida (\`yellow\`, \`navy\`, \`navyRaw\`). Mesmo padrão visual em dois blocos quase idênticos. |  
| \*\*V2 (story) ↔ V2 (square)\*\* | \*\*🟠 Duplicação interna\*\* | Dois renderers (linhas 2310-2470 e 2483-2750+) com variáveis sufixadas \`V2\` duplicadas (\`benefitsListV2\`, \`priceStrV2\`, \`pfsV2\`, \`cardCenterX\`). |  
| \*\*V0 vs V1\*\* | ✅ Distintos | V0 \= painel horizontal topo; V1 \= painel vertical lateral. Não são clones. |  
| \*\*V0/V1 vs V2\*\* | ✅ Distintos | V2 inverte (foto topo, conteúdo bottom). |  
| \*\*"V6"\*\* | \*\*🔴 Inexistente\*\* | Cai em V0 por \`% 6\`. Esse é o clone mais óbvio que o usuário está vendo. |

\*\*Redundância de helpers locais:\*\* \`fmtBRv4\`, \`fmtBRv5\`, \`fmtBRV2\`, \`priceStrV1\`, \`pfsV1\`, \`pfsV2\` — cada variante reimplementa a mesma formatação BRL e auto-shrink de fonte. Poderia virar 1 utilitário.

\---

\#\# 3\) \`wrapTextSafe\` — quem usa, quem não usa

\`wrapTextSafe\` é definido na linha 138 (quebra em N linhas respeitando \`maxWidth\`). \`safeFillText\` (linha 111\) é o "irmão menor" que apenas faz auto-shrink em 1 linha.

| Variante | Título | Benefícios | Diagnóstico |  
|---|---|---|---|  
| \*\*V0\*\* | ❌ loop manual \`measureText\`/\`titleSize-=4\` | ✅ \`safeFillText\` (linha 2002\) | Título pode vazar se nenhum tamanho \>38px couber. Texto legado. |  
| \*\*V1\*\* | ❌ split manual \+ \`ctx.fillText(ln, ...)\` linha 2122 | ✅ \`safeFillText\` (2173) | Quebra de linha customizada \*\*sem proteção de overflow\*\*. Risco real de vazar. |  
| \*\*V2\*\* | ✅ \*\*\`wrapTextSafe\`\*\* (2390, 2630\) | ✅ \`safeFillText\` (2423, 2674\) | \*\*Variante mais segura.\*\* Único caso "à prova de bala". |  
| \*\*V3\*\* | ❌ só \`safeFillText\` (1471, 1711\) — 1 linha | ✅ \`safeFillText\` (1206, 1498\) | Destino com nome longo é truncado/encolhido, nunca quebra em 2 linhas. |  
| \*\*V4\*\* | ❌ \`safeFillText\` (2881, 2892\) — 1 linha | (texto não-multilinha) | Tagline e título forçados a 1 linha; auto-shrink só. |  
| \*\*V5\*\* | ❌ wrapping próprio embutido (3177-3197) | — | Reimplementa \`wrapTextSafe\` localmente em vez de usar o utilitário. |

\*\*Resumo:\*\* \*\*Apenas V2 usa \`wrapTextSafe\`.\*\* V0, V1, V3, V4 dependem de auto-shrink (\`safeFillText\`) — funcionam, mas títulos longos viram 1 linha minúscula em vez de 2 linhas confortáveis. V5 tem código legado equivalente, candidato a refator imediato.

\---

\#\# 📋 RESUMO PARA PLANO DE LIMPEZA

1\. \*\*"V6" é fantasma\*\* — o seletor manda 6 mas o módulo só tem 0..5; remova o botão ou implemente V6 de verdade.  
2\. \*\*V4 e V5\*\* competem pelo mesmo conceito (card central sobre foto) — diferenciar (ex.: V4 vertical compacto, V5 horizontal premium) \*\*OU\*\* colapsar uma delas.  
3\. \*\*V2 (story) e V2 (square)\*\* são dois renderers separados com 80% de código duplicado → extrair \`renderV2Common\`.  
4\. \*\*V3 (story) e V3 (square)\*\* mesma situação.  
5\. \*\*Migrar V0/V1/V3/V4/V5 para \`wrapTextSafe\`\*\* no título — só V2 está blindada hoje.  
6\. \*\*Extrair helpers compartilhados:\*\* \`fmtBR\`, \`computePriceStr\`, \`computeTotal\`, \`autoShrinkFont\` (estão duplicados em todo branch com sufixos V1..V5).

—--------

📐 TEMPLATE DE BRIEFING — NOVA VARIANTE DE ANÚNCIO (\`composeTravelAd\`)

Copie esta ficha, preencha TODOS os campos e envie junto com a imagem de referência. Campos vazios \= liberdade para alucinar. Tudo preenchido \= código matemático e previsível.

\---

🧬 0\. IDENTIDADE DA VARIANTE

\`\`\`  
NOME INTERNO:        V7 (próximo índice livre)  
APELIDO/REFERÊNCIA:  "CVC Black Friday" / "Decolar Premium" / etc.  
INSPIRAÇÃO:          marca/conta de Instagram/print anexado  
CATEGORIA:           \[ \] Oferta de Pacote   \[ \] Experiência de Destino  
FORMATOS A GERAR:    \[ \] 1:1 (1080×1080)   \[ \] 9:16 (1080×1920)  
DIFERENCIAL ÚNICO vs V0–V5 (1 frase):  
   → ex: "única variante com foto sangrada à direita \+ card vidro à esquerda"  
\`\`\`

\> ⚠️ Se o "diferencial único" couber em qualquer variante existente, não é uma variante nova — é refator.

\---

🖼️ 1\. ANATOMIA DO CANVAS (em %)

Sempre em porcentagem da largura/altura — nunca em pixels absolutos (eu converto). Use o sistema de coordenadas Canvas: \`(0,0)\` \= topo-esquerda.

\`\`\`  
FORMATO 1:1 (1080×1080)  
┌─────────────────────────────────────┐  
│ FOTO:        x=0%  y=0%  w=100% h=55%  
│ PAINEL/CARD: x=5%  y=58% w=90%  h=37%  
│ LOGO:        x=5%  y=2%  w=15%  
│ BADGE TOPO:  x=5%  y=6%  w=40%  h=6%  
└─────────────────────────────────────┘

FORMATO 9:16 (1080×1920)  
┌─────────────────────────────────────┐  
│ (mesma tabela acima, refeita para story)  
└─────────────────────────────────────┘  
\`\`\`

Preencha esta tabela para CADA formato:

| Bloco | x% | y% | w% | h% | Observação |  
|---|---|---|---|---|---|  
| Foto (BG) | | | | | \`fitCover fy=?\` (0=topo, 0.5=centro, 1=baixo) |  
| Overlay/gradiente | | | | | direção \+ 2-3 stops rgba |  
| Card principal | | | | | preenchimento sólido / vidro / borda |  
| Bloco título | | | | | |  
| Bloco benefícios | | | | | grid 1 ou 2 colunas? |  
| Card preço | | | | | retângulo, círculo, pílula |  
| Faixa Pix | | | | | só se aplicável |  
| Footer contato | | | | | já é renderizado por \`drawFinalBranding\` |

\---

🎨 2\. PALETA E MATERIAIS

\`\`\`  
primaryColor (fundo card):     \#\_\_\_\_\_\_  | uso: \_\_\_\_\_\_\_\_\_\_\_\_  
secondaryColor (destaque):     \#\_\_\_\_\_\_  | uso: \_\_\_\_\_\_\_\_\_\_\_\_  
Texto sobre primary:           \[ \] auto (ensureContrast)  \[ \] fixo \#\_\_\_\_\_\_  
Texto sobre secondary:         \[ \] auto                  \[ \] fixo \#\_\_\_\_\_\_

OVERLAYS:  
  Gradiente?   \[ \] não  \[ \] sim → direção: \_\_\_° | stops: rgba(...), rgba(...)  
  Sombra card? blur=\_\_  offsetY=\_\_  cor=rgba(0,0,0,0.\_\_)  
  Borda card?  width=\_\_  cor=\_\_\_\_\_\_  estilo=\[ \] sólida \[ \] glow \[ \] dashed

OPACIDADE DO CARD (se vidro/glass): rgba(primary, 0.\_\_)  
\`\`\`

\---

✍️ 3\. TIPOGRAFIA E HIERARQUIA

Liste do maior ao menor. Tamanhos em px para a base (square 1080). Story \= multiplicar por \~1.15.

\`\`\`  
1\. PREÇO GIGANTE         | font: Inter 900 | size: \_\_px | cor: \_\_\_\_\_\_ | align: \_\_  
2\. TÍTULO/HEADLINE       | font: \_\_\_ \_\_\_   | size: \_\_px | cor: \_\_\_\_\_\_ | align: \_\_  
                         | wrap: \[ \] 1 linha (auto-shrink) \[ \] N linhas (wrapTextSafe)  
                         | maxLines: \_\_  | minSize: \_\_px  
3\. DESTINO/SUBTÍTULO     | font: \_\_\_ \_\_\_   | size: \_\_px | cor: \_\_\_\_\_\_ | align: \_\_  
4\. BENEFÍCIOS            | font: Inter 700 | size: \_\_px | cor: \_\_\_\_\_\_ | ícone: sim/não  
5\. TAGLINE/PROMO         | font: Inter 900 | size: \_\_px | cor: \_\_\_\_\_\_  
6\. SUFIXO PREÇO          | font: Inter 600 | size: \_\_px | cor: \_\_\_\_\_\_  
7\. FAIXA PIX             | font: Inter 800 | size: \_\_px | cor: \_\_\_\_\_\_  
\`\`\`

Regra obrigatória de blindagem: se um texto pode exceder a largura disponível, marque qual proteção usar:  
\- \`safeFillText\` → 1 linha com auto-shrink  
\- \`wrapTextSafe\` → múltiplas linhas com auto-shrink (preferida para títulos longos)

\---

📏 4\. SAFE ZONES (não-negociável)

\`\`\`  
Margem mínima do canvas:        40 px (todos os lados em 1:1)  
                                40 px laterais / 120 px topo+rodapé (story)  
Reserva para logo prominente:   topo: logoH \+ 28 px  
Reserva para footer branding:   bottom: \~140 px (square) / \~220 px (story)  
Distância mínima entre blocos:  16 px  
Gap entre ícone e texto:        12-16 px  
Border-radius padrão dos cards: 24-28 px  
\`\`\`

Confirme se a sua variante respeita TODAS as 6 regras acima. Se quebra alguma, justifique.

\---

🔢 5\. DADOS DINÂMICOS QUE A VARIANTE CONSOME

Marque o que será exibido (e o que deve ser ignorado mesmo se preenchido):

\`\`\`  
\[ \] destination       \[ \] city (Saindo de)     \[ \] travelPeriod  
\[ \] titleText         \[ \] promoName             \[ \] highlights\[\] (até \_\_ itens)  
\[ \] mainPrice / price \[ \] installments          \[ \] paymentMode (cash/installments/down\_plus)  
\[ \] pricePrefix       \[ \] paymentSuffix         \[ \] paymentLabel  
\[ \] totalOverride     \[ \] showTotal             \[ \] pixBannerText  \[ \] showPixBanner  
\[ \] logo              \[ \] footer (WhatsApp/Instagram/site)  
\`\`\`

\---

📱 6\. ADAPTAÇÃO SQUARE ↔ STORY

Diga explicitamente uma das três opções:

\`\`\`  
\[ \] BRANCH ÚNICO \+ parametrização (preferido)  
    → mesma matemática, valores trocados por isStory ? A : B  
\[ \] DOIS BRANCHES separados  
    → justificar: "story tem layout fundamentalmente diferente porque \_\_\_"  
\[ \] SÓ UM FORMATO  
    → outro formato cai em fallback / outra variante  
\`\`\`

E descreva o que muda entre os dois:  
\- Foto: cobre 100% nos dois? Ou só 55% no square e 65% no story?  
\- Card: mesma proporção ou recoloca em Y diferente?  
\- Tamanhos de fonte: multiplicador para story?

\---

🧪 7\. CASOS DE TESTE OBRIGATÓRIOS

A variante precisa renderizar corretamente nestes cenários extremos:

\`\`\`  
\[1\] Título curto    (1 palavra: "Maragogi")  
\[2\] Título longo    ("Caribe Brasileiro com All Inclusive em Porto de Galinhas e Maragogi")  
\[3\] Sem promoName / Sem city / Sem travelPeriod  
\[4\] 6 benefícios com textos longos  
\[5\] Preço pequeno ("R$ 99") e gigante ("R$ 12.499,90")  
\[6\] paymentMode \= "cash" e "down\_plus"  
\[7\] Sem logo (hasLogo=false)  
\[8\] Cores extremas: primary=\#FFFFFF \+ secondary=\#FFFF00 (teste de contraste)  
\`\`\`

\---

🛡️ 8\. CHECKLIST FINAL (eu validarei antes de codificar)

\- \[ \] Todos os blocos têm coordenadas em % (não px absolutos)  
\- \[ \] Hierarquia tipográfica tem tamanhos numéricos definidos  
\- \[ \] Cada texto tem proteção declarada (\`safeFillText\` ou \`wrapTextSafe\`)  
\- \[ \] Adaptação square↔story explicitada  
\- \[ \] Diferencial único vs V0–V5 é real (não é só "outra cor")  
\- \[ \] Imagem de referência anexada em alta resolução (mínimo 800px no lado menor)  
\- \[ \] Você marcou na imagem (rabisco/setas) onde está cada bloco da tabela

\---

📎 9\. ANEXOS QUE DEVEM VIR JUNTO

1\. Print original da peça de referência (limpa).  
2\. Print marcado (com retângulos por cima dos blocos — pode ser à mão no celular).  
3\. (Opcional) Print da peça em outro formato se a marca já fez square+story.

\---

⚙️ COMO EU VOU PROCESSAR ISTO

Quando você enviar essa ficha preenchida, eu:

1\. Confirmo o \`variantIdx\` livre e atualizo \`TOTAL\_VARIANTS\`.  
2\. Crio um único branch \`if (variant \=== N) { ... }\` em \`renderSafeSquareOffer\` (e equivalente em Experiência se aplicável).  
3\. Converto todas as % para constantes derivadas de \`width\`/\`height\` no topo do branch.  
4\. Aplico \`wrapTextSafe\` em todo texto multilinha (regra nova do protocolo).  
5\. Reutilizo helpers compartilhados (\`fmtBR\`, \`fitCover\`, \`fillRoundRect\`, \`drawMonoIcon\`, \`drawFinalBranding\`) — proibido duplicar.  
6\. Rodo mentalmente os 8 casos de teste do item 7 antes de devolver o código.  
7\. Entrego com um comentário-cabeçalho documentando a anatomia (mesmo template acima embutido no código).

\---

Salve este template como \`docs/fabrica/TEMPLATE\_NOVA\_VARIANTE.md\` no projeto? Se sim, respondo com "salvar template" e eu crio o arquivo já versionado.

—-

🧩 COMPLEMENTOS CRÍTICOS QUE FALTARAM NO TEMPLATE

Sim — 6 pontos que ainda não estão cobertos e que historicamente são onde o código quebra. Adicione estes ao seu briefing antes de mandar qualquer V7+.

\---

1\. 🖼️ COMPORTAMENTO DA FOTO (o erro \#1 do passado)

A "imagem ignorou a proporção" geralmente é isso. Você precisa me dizer:

\`\`\`  
ENQUADRAMENTO:  
  \[ \] cover (corta para preencher) — padrão  
  \[ \] contain (mostra a foto inteira, sobra cor)  
  \[ \] split (foto só em parte da tela)

PONTO FOCAL VERTICAL (fy):  
  0.0 \= mostra topo da foto    (céu, horizonte alto)  
  0.5 \= centro                  (padrão)  
  1.0 \= base                    (pessoas, praia, chão)  
  → escolha em função do TIPO de foto que vai entrar

TRATAMENTO DA FOTO:  
  \[ \] vinheta (escurece bordas)  intensidade: 0.0–1.0  
  \[ \] film grain                  amount: 0.0–0.1  
  \[ \] overlay escuro              opacidade: 0.\_\_  
  \[ \] dessaturação                \[ \] preto e branco

GRADIENTE SOBRE A FOTO (para legibilidade do texto):  
  direção: top→bottom / bottom→top / radial  
  stops: rgba(0,0,0,0.0) → rgba(0,0,0,0.7)  
  cobre: foto inteira / só os 40% inferiores / só atrás do card  
\`\`\`

\---

2\. 🔄 ORDEM DE EMPILHAMENTO (z-index do Canvas)

Canvas 2D pinta na ordem em que você manda. Liste do fundo para a frente:

\`\`\`  
1\. \_\_\_\_\_\_\_\_\_ (ex: foto)  
2\. \_\_\_\_\_\_\_\_\_ (ex: gradiente sobre foto)  
3\. \_\_\_\_\_\_\_\_\_ (ex: vinheta)  
4\. \_\_\_\_\_\_\_\_\_ (ex: card)  
5\. \_\_\_\_\_\_\_\_\_ (ex: borda glow do card)  
6\. \_\_\_\_\_\_\_\_\_ (ex: textos)  
7\. \_\_\_\_\_\_\_\_\_ (ex: logo prominente)  
8\. \_\_\_\_\_\_\_\_\_ (ex: footer branding)  
\`\`\`

Se você não definir, eu chuto — e foi nessa hora que o logo já apareceu atrás da foto antes.

\---

3\. 🧮 PRIORIDADE QUANDO O CONTEÚDO NÃO CABE

Cenário real: título tem 9 palavras \+ 6 benefícios \+ Pix \+ total. Não cabe. Quem cede? Marque a ordem (1 \= primeiro a encolher/sumir):

\`\`\`  
\[ \] Reduzir tamanho do título  
\[ \] Reduzir tamanho do preço  
\[ \] Cortar benefícios para \_\_ no máximo  
\[ \] Esconder faixa Pix  
\[ \] Esconder linha "Total"  
\[ \] Esconder badge "Saindo de"  
\[ \] Esconder travelPeriod  
\[ \] Aumentar altura do card (empurra footer)  
\`\`\`

Sem isso, eu invento uma hierarquia e você reclama depois.

\---

4\. 🎯 ÍCONES DOS BENEFÍCIOS

\`\`\`  
ESTILO:  
  \[ \] mono (linha simples, 1 cor) — drawMonoIcon  
  \[ \] preenchido (filled)  
  \[ \] emoji nativo (✈️ 🏨 ☕)  
  \[ \] sem ícone (só texto)

POSIÇÃO RELATIVA AO TEXTO:  
  \[ \] esquerda  \[ \] direita  \[ \] acima  \[ \] dentro de pill

TAMANHO: \_\_px (geralmente 1.2× a fonte do texto)  
COR: \[ \] mesma cor do texto  \[ \] secondaryColor  \[ \] cor fixa \#\_\_\_\_\_\_  
GAP ícone↔texto: \_\_px  
\`\`\`

\---

5\. 🏷️ LOGO E FOOTER — INTERAÇÃO COM O LAYOUT

\`\`\`  
LOGO PROMINENTE (topo):  
  \[ \] aparece                    posição: x=\_\_% y=\_\_%  size=\_\_px  
  \[ \] não aparece nesta variante  
  \[ \] aparece SOBRE a foto        → preciso de fundo/sombra atrás?  
  \[ \] aparece SOBRE o card

FOOTER (WhatsApp/Instagram/site) — desenhado por drawFinalBranding:  
  \[ \] usa o footer padrão (recomendado)  
  \[ \] footer customizado nesta variante (descrever)  
    
RESERVA INFERIOR para o footer não colidir: \_\_px  
\`\`\`

\---

6\. 🌍 LOCALIZAÇÃO (PT vs ES)

O sistema já roda em \`/pt\` e \`/es\`. A variante precisa funcionar nos dois:

\`\`\`  
TEXTOS HARDCODED na variante (cuidado\!):  
  \[ \] "PACOTE"     → traduzir? ES \= "PAQUETE"  
  \[ \] "a partir de" → ES \= "desde"  
  \[ \] "por pessoa"  → ES \= "por persona"  
  \[ \] "Saindo de"   → ES \= "Saliendo de"  
  \[ \] "Total"       → ES \= "Total" (igual)  
  \[ \] outro: \_\_\_\_\_\_\_\_

REGRA: qualquer string fixa precisa passar por i18n OU vir como prop.  
\`\`\`

\---

7\. 🧨 ANTI-PADRÕES PROIBIDOS (já cometidos antes — não repetir)

Marque que você está ciente:

\`\`\`  
\[ \] NÃO usar pixels absolutos sem derivar de width/height  
\[ \] NÃO duplicar branch story/square se a matemática é a mesma  
\[ \] NÃO criar helpers locais (fmtBRv7, pfsV7...) — reusar do escopo  
\[ \] NÃO usar ctx.fillText direto em texto dinâmico — sempre safeFillText/wrapTextSafe  
\[ \] NÃO hardcodar cor de texto — usar ensureContrast/getSafeColor  
\[ \] NÃO desenhar logo antes da foto (fica atrás)  
\[ \] NÃO esquecer ctx.save()/ctx.restore() ao mudar shadow/alpha/transform  
\[ \] NÃO assumir que highlights tem N itens — sempre validar length  
\[ \] NÃO repetir o promoName dentro do titleText (gera "BLACK FRIDAY BLACK FRIDAY")  
\`\`\`

\---

8\. 📤 O QUE EU TE DEVOLVO

Para você validar antes de eu mexer no código:

1\. Mockup em ASCII do layout proposto (square \+ story lado a lado)  
2\. Tabela de coordenadas calculadas (convertidas de % para px)  
3\. Lista de strings i18n que vou precisar adicionar  
4\. Casos de teste que vou simular antes de entregar  
5\. Só depois da sua aprovação, eu escrevo o \`if (variant \=== N)\`

\---

⚡ TL;DR — FICHA MÍNIMA ABSOLUTA

Se você não quiser preencher tudo, o mínimo para eu não alucinar é:

1\. Imagem de referência marcada com retângulos  
2\. % de cada bloco (anatomia do canvas)  
3\. Hierarquia tipográfica com tamanhos  
4\. Ordem de empilhamento (8 camadas)  
5\. Prioridade de "quem cede" quando não cabe  
6\. Ponto focal da foto (fy)

Com esses 6 itens \+ o template anterior, é matematicamente impossível eu errar.

Quer que eu salve o template completo (V1 \+ V2 desta resposta) consolidado em \`docs/fabrica/TEMPLATE\_NOVA\_VARIANTE.md\`? Responda "salvar" e eu crio.

