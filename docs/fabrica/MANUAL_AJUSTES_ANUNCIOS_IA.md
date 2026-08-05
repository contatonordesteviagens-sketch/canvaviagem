# MANUAL MESTRE — Ajustes Finos nas Gerações de Anúncio (Fábrica / F1)

> Documento para ser entregue a qualquer IA (ChatGPT, Antigravity/Google IDE, Claude, Cursor).
> Objetivo: permitir que comandos simples em português ("espaça os ícones da V1 em 1 cm", "sobe o preço 10px", "troca o ícone de hotel") sejam traduzidos em edições **cirúrgicas e isoladas** no código, sem quebrar as outras artes.

---

## 1. ARQUITETURA — leia antes de tocar em qualquer linha

O gerador de imagens **não é HTML/CSS**. É desenho imperativo em **HTML5 Canvas 2D**.
Não existe DOM, não existe CSS, não existe flexbox. Tudo é `ctx.fillText`, `ctx.drawImage`, `fillRoundRect` em coordenadas absolutas de pixel.

### Arquivos

| Arquivo | Papel |
|---|---|
| `src/lib/fabrica-compose-art.ts` | **MOTOR**. ~5.900 linhas. Todas as variantes V0–V8 vivem aqui. É o único arquivo que se edita para ajuste visual. |
| `src/pages/fabrica/Phase3ArtFactory.tsx` | UI PT: formulário, rotação/sorteio de variantes, `DISABLED_VARIANTS`. |
| `src/pages/fabrica/Phase3ArtFactoryES.tsx` | Mesma coisa em espanhol. |
| `src/components/fabrica/F1CarouselBuilder.tsx` | Carrosséis (3–7 slides). Motor próprio, **não** confundir com as variantes. |
| `src/lib/fabrica-art-tweaks.ts` | Camada de ajuste sem código (offsets salvos no banco pelo Editor de Artes admin). |
| `V1_LAYOUT_SPEC.json` | Spec detalhada da V1 (coordenadas, tokens, camadas). Anexe junto do prompt quando o alvo for V1. |

### Ponto de entrada

```ts
export async function composeTravelAd(options: ComposeTravelAdOptions): Promise<ComposeAdResult>
```
Linha ~877 de `fabrica-compose-art.ts`.

### Seleção da variante (linha ~1369)

```ts
const TOTAL_VARIANTS = 9;
const variant = forceVariant != null
  ? ((forceVariant % TOTAL_VARIANTS) + TOTAL_VARIANTS) % TOTAL_VARIANTS
  : Math.abs(variation) % TOTAL_VARIANTS;
```

### Mapa dos branches (a coisa mais importante deste manual)

Cada arte é um bloco `if (variant === N) { ... }` **totalmente isolado**. Localização aproximada (confirme com busca, os números mudam a cada edição):

| Variante | Início do branch |
|---|---|
| V8 | `if (variant === 8)` — linha ~1377 |
| V6 | `if (variant === 6)` — linha ~1672 |
| V3 | `if (variant === 3)` — linha ~1944 |
| V0 | `if (variant === 0)` — linha ~2665 |
| V1 | `if (variant === 1)` — linha ~2964 |
| V2 | `if (variant === 2)` — linha ~3581 |
| V4 | `if (variant === 4)` — linha ~4033 |
| V5 | `if (variant === 5)` — linha ~4332 |
| V7 | `if (variant === 7)` — linha ~4586 |

Como localizar com segurança antes de editar:

```bash
rg -n "if \(variant === 1\)" src/lib/fabrica-compose-art.ts
```

Dentro de cada branch, Feed (1:1) e Story (9:16) são o **mesmo bloco**, diferenciados por:

```ts
const isStory = format === "story";
// ou
if (format === "story") { ... }
```

> Se o pedido for "só no story", o ajuste vai dentro do `if (format === "story")` daquele branch. Nunca fora.

---

## 2. AS 7 LEIS INVIOLÁVEIS

1. **Uma variante por vez.** Mexeu na V1? Nenhuma linha fora de `if (variant === 1)`.
2. **Nunca refatore helpers globais** (`safeFillText`, `drawMonoIcon`, `fillRoundRect`, `wrapTextSafe`, `fitCover`, `drawFinalBranding`) para resolver problema de uma variante. Se precisar de comportamento diferente, crie uma variável local dentro do branch ou passe um parâmetro **opcional com default igual ao atual**.
3. **Nunca use `ctx.fillText` cru** em texto do usuário. Use `safeFillText(ctx, text, x, y, maxWidth, baseFontSize)` — ele reduz a fonte até caber.
4. **Nunca altere `TOTAL_VARIANTS`** sem criar o branch correspondente. Índice sem branch cai silenciosamente na V0.
5. **Ajuste local, nunca em cascata.** Para mover um elemento, some um offset **naquele elemento**, não na variável base compartilhada por vários (`baseY`, `cardY`, `blockTop`). Se somar na base, tudo desce junto.
6. **Nada pode sobrepor** logo, Instagram, telefone (o rodapé é desenhado por `drawFinalBranding`) nem sair da tela.
7. **Nomes compostos nunca perdem palavra.** Máx. 2 linhas, reduzir fonte progressivamente, nunca iniciar linha 2 com `DE / DA / DO / DOS / DAS / E`.

---

## 3. TABELA DE CONVERSÃO — linguagem humana → pixel

Canvas Feed = **1080×1080**. Story = **1080×1920**.

| O usuário diz | Traduza para |
|---|---|
| 1 cm | **≈ 40 px** |
| 0,5 cm | ≈ 20 px |
| 1 mm | ≈ 4 px |
| "um tiquinho" / "2px" | 2–4 px (literal, aplique exatamente o que ele pediu) |
| "um pouco" | 2–5% da dimensão do elemento |
| "médio" | 6–10% |
| "bem maior" / "muito" | >10% |
| "sobe" | **subtrai** do Y |
| "desce" | **soma** no Y |
| "esquerda" | subtrai do X |
| "direita" | soma no X |
| "aumenta a fonte" | +4 a +8 px no `fontSize` daquele texto |
| "espaça os ícones" | aumenta o `gap`/`step`/`slotH` do loop de ícones |

> **Regra do literal:** se o usuário disser um número em px, aplique **exatamente** esse número. Não arredonde, não "melhore".

---

## 4. RECEITAS POR TIPO DE PEDIDO

### 4.1 Mover um texto
Ache o `safeFillText(...)` daquele texto no branch e some/subtraia no argumento **Y**:
```ts
safeFillText(ctx, priceLabel, x, priceY - 10, maxW, 34); //  -10 = sobe 10px
```

### 4.2 Mudar tamanho de fonte
Altere o `baseFontSize` (último argumento de `safeFillText`) ou o `ctx.font`:
```ts
ctx.font = `900 ${priceSize}px Inter, Arial, sans-serif`;
```
Depois **reveja a distância para o elemento de baixo** — preço maior encosta no "POR PESSOA".

### 4.3 Espaçar ícones / benefícios
Os benefícios são desenhados em loop. Procure por `benefit`, `slotH`, `gap`, `step`, `rowH` dentro do branch:
```ts
const benefitSlotH = (cardH - benefitPadY * 2) / Math.max(1, numRows);
```
Para "espaçar 1 cm", **não** mude só o gap: aumente o gap **e** o `cardH` na mesma proporção, senão o último item vaza do card.

### 4.4 Trocar um ícone
Ícones são desenhados por `drawMonoIcon(ctx, iconName, cx, cy, size, color, strokeWidth?)`.
Troque só a string `iconName`. Confirme que a chave existe olhando o `switch` dentro de `drawMonoIcon` (linha ~609) — chave inexistente = ícone vazio.

### 4.5 Trocar cor
Nunca hardcode. Use os campos reais: `primaryColor`, `secondaryColor`, e proteja o contraste:
```ts
ctx.fillStyle = getSafeColor(primaryColor, "#ffffff");
```

### 4.6 Adicionar um elemento novo
Adicione **no final do branch** (para ficar por cima) ou logo após o painel de fundo (para ficar por baixo). Nunca no meio do fluxo de cálculo de outro bloco. Declare todas as coordenadas em variáveis novas com sufixo da variante (`badgeYV1`, `iconGapV1`) para não colidir com nomes existentes.

### 4.7 Ajuste em TODAS as artes de uma vez
Só existem 2 formas legítimas:
- **(a)** o pedido é sobre o rodapé/branding → edite `drawFinalBranding` (é compartilhado de propósito);
- **(b)** o pedido é sobre um helper de texto/contraste → edite o helper, mas **teste V0..V8 nos dois formatos**.

Se o pedido for "sobe o preço em todas as artes", **não** invente um helper: faça o mesmo ajuste, repetido, dentro de cada um dos 9 branches, e liste no diff quais branches mudaram. É mais verboso e é o certo.

---

## 5. FORMATO DE COMANDO (o que o usuário escreve)

O usuário escreve simples. A IA deve **reescrever internamente** no formato abaixo antes de codar, e mostrar essa interpretação:

```
VARIANTE:   V1
FORMATO:    Feed (1:1) e Story (9:16)  |  ou só um deles
ELEMENTO:   ícones de benefícios (linha de 4 ícones do card inferior)
MUDANÇA:    aumentar o espaçamento horizontal entre eles em 40px (1 cm)
RESTRIÇÃO:  o último ícone não pode passar da margem direita; card cresce se necessário
NÃO ALTERAR: V0, V2..V8, helpers globais, rodapé, preço
```

Se algum campo estiver ambíguo (ex.: usuário não disse se é Feed ou Story), **pergunte antes de editar**.

---

## 6. PROTOCOLO DE EXECUÇÃO OBRIGATÓRIO PARA A IA

1. `rg -n "if \(variant === N\)" src/lib/fabrica-compose-art.ts` → confirme a linha inicial real.
2. Leia o branch inteiro (do `if` até o `}` de fechamento) antes de editar.
3. Reescreva o pedido no formato de 6 campos da seção 5 e mostre ao usuário.
4. Faça a edição **mínima**: idealmente 1 a 5 linhas.
5. Entregue **diff**, nunca o arquivo inteiro reescrito.
6. Valide:
   ```bash
   npx tsc --noEmit
   ```
7. Declare no final: quais linhas mudaram, qual variante, quais formatos, e o que **não** foi tocado.

### Checklist antes de dar por concluído
- [ ] Só o branch alvo foi alterado?
- [ ] Feed e Story continuam corretos?
- [ ] Nenhum texto sobrepõe outro?
- [ ] Nada saiu do canvas (margem lateral mínima 65px; Story: topo 250px e base 250px livres)?
- [ ] Nome de destino composto ainda aparece inteiro?
- [ ] Preço não encosta no complemento ("POR PESSOA")?
- [ ] Rodapé (logo/Instagram/telefone) intacto e legível?
- [ ] `TOTAL_VARIANTS` inalterado (a menos que uma variante nova tenha sido criada)?
- [ ] `npx tsc --noEmit` passou?

---

## 7. SAFE ZONES (obrigatório)

- **Laterais:** mínimo 65 px em qualquer formato.
- **Story topo:** 250 px reservados (barra de progresso + @usuário do Instagram).
- **Story base:** 250 px reservados (barra de resposta).
- **Área útil de texto no Story:** retângulo central de 1080×1420.
- Fundo/foto: sempre tela cheia (`fitCover`), nunca deixar borda preta.

---

## 8. ALTERNATIVA SEM CÓDIGO — Editor de Artes (Admin)

Para **mover, escalar, esconder, girar, trocar texto** de um elemento existente, não é preciso mexer no motor.
O admin (`lucashenriquephd@gmail.com`) tem o `ArtTweakEditor`, que salva offsets `{dx, dy, scale, rotate, hidden, text}` por elemento na tabela `fabrica_art_tweak_presets`, chaveados por `categoria::variante::formato`.

Use o editor quando: reposicionar / redimensionar / ocultar.
Use código quando: adicionar elemento novo, mudar ícone, mudar lógica de quebra de texto, mudar cor condicional, mudar layout estrutural.

---

## 9. ERROS PROIBIDOS (lista negra)

- Refatorar V0–V5 para consertar V6+.
- Reescrever o layout inteiro quando o pedido era de 2 px.
- Alterar `TOTAL_VARIANTS` sem branch.
- Usar `ctx.fillText` direto em conteúdo do usuário.
- Fallback que corta palavra do destino.
- Gerar `TOTAL: TOTAL R$...` (duplicação de rótulo).
- Inventar cidade de origem não selecionada pelo usuário.
- Colocar qualquer coisa sobre logo, Instagram ou telefone.
- Devolver o arquivo de 5.900 linhas reescrito "por segurança".

---

## 10. PROMPT PRONTO — copie e cole na outra IA

```
Você é o agente especialista do motor Canvas 2D da Fábrica de Anúncios (Canva Viagem).

CONTEXTO OBRIGATÓRIO:
- Motor: src/lib/fabrica-compose-art.ts (~5900 linhas), HTML5 Canvas 2D imperativo. Não é HTML/CSS.
- Cada arte é um branch isolado: if (variant === N) { ... }. V0..V8.
- Feed = 1080x1080, Story = 1080x1920, diferenciados por `format === "story"` DENTRO do mesmo branch.
- 1 cm = 40 px. "sobe" = subtrai Y. "desce" = soma Y.
- Leia o manual completo em docs/fabrica/MANUAL_AJUSTES_ANUNCIOS_IA.md antes de agir.

REGRAS INVIOLÁVEIS:
1. Altere EXCLUSIVAMENTE o branch da variante pedida. Zero linhas fora dele.
2. Não refatore helpers globais (safeFillText, drawMonoIcon, fillRoundRect, wrapTextSafe, fitCover, drawFinalBranding).
3. Todo texto de usuário usa safeFillText, nunca ctx.fillText.
4. Ajuste por offset LOCAL no elemento, nunca na variável base compartilhada (evitar cascata).
5. Medidas em px são literais: 2px significa exatamente 2px.
6. Nada sobrepõe logo/Instagram/telefone, nada sai do canvas.
7. Não altere TOTAL_VARIANTS.

PROCEDIMENTO:
1. Localize o branch com: rg -n "if \(variant === N\)" src/lib/fabrica-compose-art.ts
2. Leia o branch inteiro.
3. Reescreva meu pedido no formato: VARIANTE / FORMATO / ELEMENTO / MUDANÇA / RESTRIÇÃO / NÃO ALTERAR — e me mostre.
4. Faça a edição mínima (1 a 5 linhas se possível).
5. Me entregue APENAS o DIFF, não o arquivo inteiro.
6. Rode npx tsc --noEmit.
7. Liste no final: linhas alteradas, variante, formatos afetados, e o que ficou intocado.

MEU PEDIDO:
<<< escreva aqui em português simples, ex.: "espaçar em 1 centímetro os ícones da variação V1" >>>
```

---

## 11. EXEMPLOS RESOLVIDOS

**Pedido:** "espaçar em 1 centímetro os ícones da variação v1"
→ VARIANTE V1 · FORMATO ambos · ELEMENTO linha de ícones de benefícios · MUDANÇA gap +40px · RESTRIÇÃO último ícone dentro da margem 65px, aumentar largura/altura do card se necessário · NÃO ALTERAR demais variantes, preço, rodapé.
Edição: variável de gap/slot dentro de `if (variant === 1)` + compensação do container.

**Pedido:** "sobe o preço 2px na V6, só o preço"
→ Alterar apenas a baseline do preço dentro de `if (variant === 6)`:
`const priceBaseY = rightY + T.priceSize - 24;` → subtrair 2. Não mover o bloco inteiro nem o "POR PESSOA".

**Pedido:** "no story da V8 o CTA está colado no rodapé"
→ Só dentro de `if (variant === 8)` e dentro do ramo `format === "story"`, subir o Y do CTA até respeitar os 250px de base. Feed permanece idêntico.

---

*Última revisão: agosto/2026. Fonte de verdade do código: `src/lib/fabrica-compose-art.ts`.*
