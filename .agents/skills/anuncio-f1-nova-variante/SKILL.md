---
name: anuncio-f1-nova-variante
description: Criar uma nova variação de arte (V9, V10...) na Fábrica de Anúncios F1 do Canva Viagem a partir de uma imagem de referência. Ative quando o usuário mandar um print/referência e pedir "cria uma nova arte", "nova variação", "clona esse anúncio", "quero um modelo novo no F1", ou pedir para ocultar/reativar uma variante existente.
---

# Nova variante — Anúncio F1

Use junto da skill `anuncio-f1-ajustes` (mesmas leis invioláveis e mesmo motor).

## 1. Primeiro decida: é variante nova mesmo?
Se a referência é o mesmo layout com texto em posição diferente → **é ajuste**, use `anuncio-f1-ajustes`. Só crie variante nova quando a **anatomia estrutural** muda (divisão de blocos, posição da foto, cards).

## 2. Escreva a anatomia percentual antes de codar
```text
Foto:            x=0%  y=0%   w=100% h=55%
Bloco inferior:  x=0%  y=55%  w=100% h=45%
Coluna esquerda: x=0%  y=55%  w=50%  h=45%
Coluna direita:  x=50% y=55%  w=50%  h=45%
```
Mostre essa anatomia ao usuário e confirme antes de escrever código.

## 3. Mapeie cada texto para o campo real do formulário
```text
Destino     -> destination
Título      -> titleText / titleOverride / titleVariations
Dias/data   -> travelPeriod
Preço       -> price / mainPrice / currencySymbol
Prefixo     -> pricePrefix / paymentLabel
Complemento -> paymentSuffix / bottomSuffix
Pix         -> pixBannerText (só desenha se showPixBanner === true)
Logo/contatos -> drawFinalBranding
```
Nunca invente campo. Nunca invente cidade de origem não selecionada.

## 4. Implementação
1. Criar branch novo no fim da cadeia: `if (variant === 9) { ... }` em `src/lib/fabrica-compose-art.ts`.
2. Base recomendada: duplicar o bloco da V8 (card de preço flexível + grade de slots dos benefícios) e alterar só a composição.
3. Atualizar `const TOTAL_VARIANTS = 10;`.
4. Atualizar seletores/rotação em `Phase3ArtFactory.tsx` e `Phase3ArtFactoryES.tsx`.
5. Tratar Feed e Story no mesmo branch via `format === "story"`.
6. Documentar em `docs/fabrica/V9_NOME_DA_VARIANTE.md`.

### Card de preço flexível (padrão V8)
```ts
const hasCents = !!priceCents && !hideCents;
const hasTotalLine = rawShowTotal !== false && !!totalOverride && totalOverride.trim() !== "";
```
Altura = soma apenas das linhas que existem. Largura: com centavos > só total > mínima.

### Benefícios por slots (nunca por tentativa visual)
```ts
const benefitSlotH = (cardH - benefitPadY * 2) / Math.max(1, numRows);
const slotTop = cardY + benefitPadY + benefitSlotH * row;
const iconY = slotTop + benefitSlotH * 0.30;
const textStartY = slotTop + benefitSlotH * 0.58;
```

## 5. Ocultar / reativar variante (sem excluir)
Nunca apague um branch. Para tirar de circulação, adicione o índice em `DISABLED_VARIANTS` / `DISABLED_VARIANTS_PHOTO` em `Phase3ArtFactory.tsx`. Para reativar, remova do array. O código no motor permanece intacto.

## 6. Checklist antes de entregar
- [ ] Funciona com 4, 5 e 6 benefícios
- [ ] Funciona com e sem centavos
- [ ] Funciona com e sem valor total
- [ ] Destino cabe em Feed e Story
- [ ] CTA não colide com cards nem com o branding
- [ ] Safe zones (65px laterais; Story 250px topo/base)
- [ ] Variantes antigas intocadas
- [ ] `TOTAL_VARIANTS` bate com o número de branches
- [ ] `npx tsc --noEmit` passou
- [ ] Documentação criada em `docs/fabrica/`
