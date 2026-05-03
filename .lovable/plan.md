# Adicionar Layout 1/1/2 V4 — Card Central Flutuante

## Objetivo
Adicionar versão **V4** ao prompt de Stories 9:16 (Foto Real · Oferta de Pacote): foto full-bleed de fundo + card sólido na cor primária centralizado + pill na cor secundária sobreposta exatamente na borda inferior do card.

## Arquivo a editar
`supabase/functions/fabrica-generate-ad/master-prompts.ts` — função `promptClassicVertical`. Inserir novo branch `if (ver === 4)` logo antes do bloco V2 atual (após linha 551).

## Roteamento
Reutiliza o detector de versão já presente (`/-v(\d+)-/` em `creativeSeed`). Sem mudanças no `index.ts` ou no front-end. V0, V2 permanecem intocados.

## Estrutura do prompt V4
- **Header isolamento:** aplica só a 1/1/2 V4; proíbe herdar V0/V1/V2/V3/Experiência.
- **Safe zones Instagram:** topo 20% e base 20% vazios.
- **Background:** foto 8K full-bleed de `v.destination`.
- **Logo:** placeholder no canto superior-esquerdo, abaixo da safe zone.
- **Card central:** sólido `v.primaryHex`, retangular, cantos levemente arredondados, drop-shadow.
- **Conteúdo do card (texto BRANCO PURO obrigatório):**
  - `v.promoName` ultra-bold massivo
  - `v.destination` médio elegante
  - `v.duration` (datas) + linha de ícones minimalistas em `v.secondaryHex`
- **Bloco de preço (2 colunas dentro do card):**
  - Esquerda: "pagamento" + pill `v.secondaryHex` com parcela (texto escuro) + "por pessoa"
  - Direita: `R$ {v.installmentValue}` massivo branco
- **Pill flutuante de borda:** pill sólida `v.secondaryHex` com `5% OFF À VISTA NO PIX` sobreposta exatamente na borda inferior do card (50% dentro / 50% fora).
- **Regras finais:** contraste máximo, aspect ratio 9:16 absoluto, zero overlap de texto.

## Sem mudanças
Front-end, `index.ts`, V0/V2 do 1/1/2, V0 do 1/1/1 — todos preservados.
