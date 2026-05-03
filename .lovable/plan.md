## Reforçar prompts V0 (1/1/1 e 1/1/2) com regras críticas READ-TWICE

Vou substituir os dois blocos de prompt V0 em `supabase/functions/fabrica-generate-ad/master-prompts.ts` pelas versões reforçadas que você forneceu, mantendo as variáveis dinâmicas existentes (`v.primaryHex`, `v.installmentValue`, `v.destination`, etc.) e o cabeçalho de contraste já injetado pelo `index.ts`.

### Arquivo
`supabase/functions/fabrica-generate-ad/master-prompts.ts`

### Mudanças

**1. Bloco 1/1/1 V0 (linhas 574-614)** — atualizar para:
- Adicionar header `[CRITICAL SYSTEM RULES - READ TWICE: 1. NEVER use dark text on a dark background. 2. NEVER overlap elements; respect padding. 3. Icons MUST be single-color (monochromatic), NOT colorful.]`
- Reforçar: padding grande/explícito abaixo da logo (gap vazio obrigatório, nada pode tocar a logo)
- Tag pill: DARK pill com texto PURE WHITE (`originPill`)
- Headline: massive ultra-bold em `primaryTextHex`
- Linha vertical delicada dividindo
- Esquerda: 4 ícones MONOCROMÁTICOS (mesma cor, sem emojis coloridos) + texto LARGE
- Direita: bloco DARK rounded com "À VISTA" + "R$ valor" + "por pessoa", todo PURE WHITE
- Bottom half: foto 8K do destino

**2. Bloco 1/1/2 V0 (linhas 635-684)** — atualizar para:
- Adicionar mesmo header READ-TWICE
- TOP 20% e BOTTOM 20% safe zones vazias (mantido)
- TOP HALF (45%): foto full-width + logo top-left abaixo da safe zone
- BOTTOM HALF (55%): fundo sólido `primaryHex`
- Gap vazio + DARK pill button com PURE WHITE text (`originPill`)
- Headline massive em `primaryTextHex` (PURE WHITE sobre primary)
- Stack vertical de 4 itens com ícones MONOCROMÁTICOS (não pílulas brancas — apenas ícone + texto na cor primaryTextHex), respeitando regra "no overlap"
- Bloco de preço: rectangular DARK (não mais secondaryHex claro) com TODOS textos PURE WHITE — `promoName`, `PACOTE destino`, `duration`, "a partir de", badge `installmentLabel` + `R$ installmentValue` + "por pessoa", footer strip com `pixText`

### Sem mudanças
- `index.ts`, demais variações (V1/V2/V3/V4), front-end, contexto, tipos.
- Cabeçalho `CRITICAL_CONTRAST_HEADER` continua sendo prefixado automaticamente pelo `index.ts`.

### Resultado esperado
Os dois layouts V0 ficam com contraste reforçado, ícones monocromáticos garantidos, padding explícito abaixo da logo e bloco de preço sempre DARK + texto branco — eliminando os casos de pílulas vazias e dark-on-dark observados.