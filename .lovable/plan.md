# Adicionar Layout 1/1/2 V0 — Stories Split Horizontal

## Objetivo
Implementar versão **V0** da nomenclatura **1/1/2** (Foto Real · Oferta de Pacote · Stories 9:16): foto no topo (45%), bloco UI sólido na cor secundária no fundo (55%), respeitando safe zones de 20% topo/base do Instagram. Atualmente esse formato só renderiza V2 (full-bleed glass card).

## Arquivo a editar
`supabase/functions/fabrica-generate-ad/master-prompts.ts` — função `promptClassicVertical`, bloco Stories 9:16 (linhas ~485-558).

## Mudança técnica
1. Detectar versão a partir de `v.creativeSeed` (formato `<tplId>-v<N>-...`) via regex `/-v(\d+)-/`.
2. Se `ver === 0`, renderizar novo prompt V0 (split horizontal). Caso contrário, manter V2 atual (fallback).
3. V2 permanece intocado — zero impacto em chamadas existentes.

## Estrutura do prompt V0
- **Header:** `[SYSTEM COMMAND: ISOLAMENTO 1/1/2 V0]` — proíbe herdar V1/V2/V3 ou Experiência.
- **Safe zones:** topo 20% e base 20% completamente vazios.
- **Top 45%:** foto 8K full-width de `v.destination` + logo placeholder no canto superior-esquerdo.
- **Bottom 55%:** background sólido `v.secondaryHex`.
  - Pill `v.primaryHex` com texto escuro (`Saindo de {v.city}` ou `agencyName`).
  - Headline massivo BRANCO PURO (regra crítica de contraste sobre secondary).
  - Stack de 4 pills BRANCAS sólidas com ícone + texto escuro (de `v.highlights` ou defaults: Transporte/Hospedagem/Café/Guia).
- **Price block (acima da safe zone inferior):** retângulo sólido `v.primaryHex` com texto branco — promoName, "PACOTE {destino}", duração, "a partir de", badge `v.secondaryHex` com parcela, preço massivo, "por pessoa". Footer strip `v.secondaryHex` com `5% OFF À VISTA NO PIX`.
- **Regras finais:** zero overlapping, contraste máximo, aspect ratio 9:16 absoluto.

## Deploy
Após edição, redeploy de `fabrica-generate-ad`.

## Sem mudanças
Front-end, `index.ts`, V0 do 1/1/1 (square), V2 do 1/1/2 — todos preservados.
