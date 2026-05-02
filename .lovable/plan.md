## Correções na V3 e melhorias no input de preço

Cinco ajustes coordenados — todos preservam V0/V1/V2 intactos.

---

### 1. Ícones todos da mesma cor (V3)

Hoje a linha "7 dias | ✈ 🚌 🏨 ☕ 📷" usa **emojis** via `ICON_SYMBOL`, que o navegador renderiza coloridos automaticamente (café marrom, xícara colorida, etc.).

**Solução**: na V3 substituir os emojis por **ícones vetoriais monocromáticos** sem espaçamentos vazios todos preenchidos, desenhados via `Path2D` na cor navy (#0B2B7A) — avião, ônibus, hotel, café e câmera, todos na mesma cor. Não afeta V0/V1/V2 que continuam usando os emojis. Adicionar apenas icones que foram selecionados pelo usuário, na imagem tem 1 icone à mais do avião que não foi selecionado, selecionei quatro opções de ícone e apareceu um ícone a mais de um avião. 

---

### 2. Sobreposição "10x R$200,00" (V3)

O lado esquerdo (`12X / sem juros`) e o preço gigante da direita estão colidindo quando o valor é grande (R$ 200,00 → 7 caracteres). 

**Solução**:

- Calcular largura real do preço gigante e **reduzir o font-size** automaticamente (130 → mín 80px) até caber em ~62% do box.
- Empurrar a coluna esquerda mais para a borda e a direita mais para fora, com **gap mínimo garantido de 30px** entre os dois blocos.
- Alinhar verticalmente o "12X" com o centro óptico do preço.

---

### 3. "Total por pessoa" editável

Hoje a V3 calcula `preço × parcelas` automaticamente e exibe `Total por pessoa: R$ X.XXX` — fixo.

**Solução**: adicionar dois novos campos opcionais no painel **VALOR (R$)**:

- Checkbox **"Mostrar total"** (on/off) — controla se a linha aparece.
- Campo de texto **"Total"** — livre. Se vazio, calcula automaticamente. Se preenchido, usa o que o usuário digitou (ex.: "R$ 1.999 por casal").
- Dropdown rápido com sugestões: "por pessoa", "por casal", "por pacote", "valor total".

Os valores ficam persistidos no `useFabricaContext` (`totalOverride`, `showTotal`) e são passados para o compositor.

---

### 4. Logo do Pix correta

Hoje desenho um losango ciano genérico. O símbolo oficial do Pix é composto por **4 losangos pequenos** formando um padrão de "X" (dois claros + dois escuros).

**Solução**: substituir o desenho atual por uma renderização vetorial mais fiel ao logotipo oficial do Pix — quatro losangos arredondados em branco/turquesa formando o glifo característico, mantido nas mesmas dimensões dentro da faixa azul.

---

### 5. Opção "Remover centavos" no campo VALOR (R$)

Pedido: ao marcar a checkbox, "423,43" vira "423"; "4234,XX" vira "4.234".

**Solução**:

- Adicionar checkbox **"Sem centavos"** ao lado do campo VALOR.
- Quando ativa: a função `formatPriceValue` é chamada com flag `noCents=true`, que zera a parte decimal e formata só o inteiro com separador de milhar (`Intl.NumberFormat` com `maximumFractionDigits: 0`).
- A flag fica persistida em `state.hideCents` no contexto e se aplica em todas as variantes (V0/V1/V2/V3) e no IA Pura (passada como parte do `installmentValue`/`totalValue` já formatados).
- Toggle 100% reversível: desmarcar restaura "423,43" automaticamente a partir do valor digitado.

---

## Detalhes técnicos

**Arquivos a editar:**

- `src/lib/fabrica-compose-art.ts` — bloco `if (variant === 3)`: novos ícones vetoriais (função `drawMonoIcon(ctx, kind, x, y, size, color)`), ajuste de layout do preço com auto-shrink, novo glifo Pix com 4 losangos, leitura de `totalOverride` / `showTotal`.
- `src/hooks/useFabricaContext.tsx` — adicionar `hideCents: boolean`, `totalOverride: string`, `showTotal: boolean` ao state e setters.
- `src/pages/fabrica/Phase3ArtFactory.tsx` — checkbox "Sem centavos" no campo VALOR, checkbox "Mostrar total" + input "Total" no bloco de pagamento, propagar via `composeTravelAd({ totalOverride, showTotal })`.
- `src/lib/fabrica-compose-art.ts` (interface) — aceitar `totalOverride?: string` e `showTotal?: boolean`.
- `formatPriceValue` — aceitar `{ noCents?: boolean }` e respeitar a flag.

**Não vou tocar:**

- V0, V1, V2 (layout, cores, tipografia).
- Lógica de rotação de variantes (V3 continua sorteada normalmente).
- Edge function de IA Pura (o prompt OP7 já está correto e os valores já chegam pré-formatados).

Após as mudanças, testarei mentalmente os 4 cenários: preço pequeno (R$ 99), médio (R$ 1.499,90), grande (R$ 12.999,00) e com centavos removidos (R$ 4.234) — todos devem caber sem sobreposição.