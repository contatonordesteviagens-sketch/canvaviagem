# Padrao de botoes e selecoes da Fabrica

Data: 2026-06-16

## Regra principal

A cor escolhida pelo usuario em `primaryColor` e `secondaryColor` pertence ao resultado gerado: artes, previews, sites e templates exportados.

A interface da Fabrica pertence ao produto. Por isso, botoes, pills, cards selecionados, bordas de destaque, overlays de selecao e atalhos F1/F2/F3/F4/F5 devem usar sempre o amarelo fixo:

```ts
const UI_ACCENT = "#F5F906";
const UI_ACCENT_SOFT = "rgba(245, 249, 6, 0.12)";
const UI_ACCENT_BORDER = "rgba(245, 249, 6, 0.75)";
```

Isso evita o bug em que, ao selecionar preto como cor da marca/anuncio, os botoes ficam pretos e o usuario nao consegue enxergar o que esta ativo.

## Onde aplicar

- Formatos de arte: feed, story, safe zones.
- Chips de destinos, filtros, fotos e opcoes.
- Botoes de buscar, salvar, avancar, gerar, publicar, baixar e adicionar.
- Cards ou paineis selecionados em F1, F2, F3, F4 e F5.
- Overlays de item selecionado, checks e bordas ativas.

## Onde nao aplicar

- Swatches de cor, porque eles precisam mostrar a cor real escolhida pelo usuario.
- Preview da arte, preview do site e componentes `V0/V1/V2/V3Experiencia`, porque eles representam o material final gerado.
- HTML exportado do site, quando a intencao for respeitar a identidade visual escolhida pelo usuario.

## Checklist para novos agentes

Antes de adicionar nova versao ou novo controle:

1. Se o elemento e controle da Fabrica, use `UI_ACCENT`.
2. Se o elemento e saida gerada para o cliente final, pode usar `state.primaryColor` ou `state.secondaryColor`.
3. Nunca use `state.primaryColor` em `background`, `borderColor`, `boxShadow` ou `linear-gradient` de botoes da interface.
4. Depois da mudanca, rode uma busca como:

```powershell
rg -n --glob "*.tsx" --glob "!scratch/**" "background: state\.primaryColor|borderColor:.*state\.primaryColor|linear-gradient\(135deg, \$\{state\.primaryColor\}|background: primaryColor|borderColor:.*primaryColor|linear-gradient\(135deg, \$\{primaryColor" src/pages/fabrica src/components/fabrica
```

Se aparecer em componente de UI, corrija para `UI_ACCENT`. Se aparecer em preview/exportacao, documente mentalmente como excecao e nao altere sem pedido do usuario.

