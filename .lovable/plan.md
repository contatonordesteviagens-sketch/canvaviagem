## Problema atual no /fabrica → F3 · IA Art Factory

Hoje, o botão "Gerar" tem comportamento diferente em cada modo:


| Modo                         | Imagens geradas                             | Usa diretrizes estritas?   |
| ---------------------------- | ------------------------------------------- | -------------------------- |
| **Foto Real (Pexels)**       | 2 imagens (composição local em canvas)      | Não — é layout HTML/Canvas |
| **Sua Imagem (upload/link)** | 2 imagens (`fabrica-edit-photo` + canvas)   | Não                        |
| **IA Pura**                  | 2 imagens (2 templates mestres em paralelo) | **Sim** (já implementado)  |


As novas diretrizes estritas de UI/UX, Safe Zones do Instagram e tipografia premium que você passou **só se aplicam a prompts de IA generativa de imagem** — ou seja, ao modo IA Pura. Já estão implementadas no `master-prompts.ts` e são aplicadas a todos os 9 templates mestres.

## O que vou fazer agora

Para que **TODA geração** (qualquer modo) produza 2 variações:

### 1. Modo "Foto Real (Pexels)" — gerar 2 variações

- Rodar `composeTravelAd()` 2 vezes em paralelo, cada uma com um template/estratégia visual diferente (alternar entre os 4 layouts da estratégia, ou variar `variationCounter` 0 e 1).
- Salvar as 2 imagens em `generatedImages[]`.

### 2. Modo "Sua Imagem (upload/link)" — gerar 2 variações

- Mesmo padrão: rodar 2x em paralelo o pipeline `fabrica-edit-photo` + `composeTravelAd` com variações distintas.

### 3. Modo "IA Pura" — já está OK (gera 2 com 2 templates mestres distintos)

- Apenas confirmar que as diretrizes estritas (Safe Zones 15%/20%, tipografia Apple-like, anti-distorção, contraste absoluto) estão sendo enviadas no prompt — **já estão** via `COMMON_RULES` no `master-prompts.ts`.

### 4. UI

- O grid de exibição já suporta 2 imagens lado a lado (linha 929: `grid grid-cols-2 gap-3`). Cada uma com botão "Baixar" individual. Sem mudanças necessárias aqui.

### 5. Contador

- Incrementar `generationCount` por +2 em cada clique nos modos foto/custom (já é +N no modo IA).

## Arquivos a editar

- `src/pages/fabrica/Phase3ArtFactory.tsx` — refatorar os blocos `genMode === "photo"` (linhas 215-248) e o modo custom (linhas 326-391) para gerar 2 variações em paralelo via `Promise.all`.

Sem mudanças no edge function (já está correto). Sem mudanças em `master-prompts.ts` (diretrizes já aplicadas).

Aprovar para eu implementar?