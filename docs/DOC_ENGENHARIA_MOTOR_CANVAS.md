# 📐 DOC_ENGENHARIA_MOTOR_CANVAS.md
### Bíblia Técnica do Motor de Geração de Imagens — Canva Viagem
> **Status:** Documento oficial. Toda nova variante, refactor ou bugfix em `fabrica-compose-art.ts` / `Phase3ArtFactory.tsx` DEVE ser validado contra este documento. Em caso de conflito entre código e este doc, **este doc vence** — abra um PR para atualizar o código, não o contrário.

---

## ÍNDICE

1. [Arquitetura de Dados (Fluxo)](#1-arquitetura-de-dados-fluxo)
2. [Leis da Física do Canvas (Regras Inegociáveis)](#2-leis-da-física-do-canvas-regras-inegociáveis)
3. [Mapeamento das Variantes (V0 → V6)](#3-mapeamento-das-variantes-v0--v6)
4. [Protocolo de Criação para Novas Variantes (V7+)](#4-protocolo-de-criação-para-novas-variantes-v7)
5. [Anti-padrões Proibidos (Hall of Shame)](#5-anti-padrões-proibidos)
6. [Glossário de Helpers Globais](#6-glossário-de-helpers-globais)

---

## 1. ARQUITETURA DE DADOS (FLUXO)

```text
┌────────────────────────────┐
│  Phase3ArtFactory.tsx      │  ← React state (controlled inputs)
│  (formulário do usuário)   │
└──────────────┬─────────────┘
               │ onSubmit / handleGenerate
               ▼
┌────────────────────────────┐
│  AdFormPayload (objeto)    │  ← consolidação tipada
│  {                         │
│    destination, city,      │
│    titleText, price,       │
│    installments,           │
│    paymentMode,            │
│    highlights[],           │
│    primaryColor,           │
│    secondaryColor,         │
│    logo, format,           │
│    forceVariant?, ...      │
│  }                         │
└──────────────┬─────────────┘
               │ composeTravelAd(payload)
               ▼
┌────────────────────────────┐
│  fabrica-compose-art.ts    │
│  ┌──────────────────────┐  │
│  │ Pre-render guards    │  │  — fonts, vignette setup, contraste
│  │ Variant resolver     │  │  — forceVariant ?? variation % TOTAL
│  │ if (variant === N)   │  │  — branch dedicado (V0..V5)
│  │ drawFinalBranding()  │  │  — footer SEMPRE por último
│  └──────────────────────┘  │
└──────────────┬─────────────┘
               │ canvas.toDataURL("image/png")
               ▼
        Preview + Download
```

### 1.1 Estado → Payload
- O componente `Phase3ArtFactory.tsx` mantém os inputs em `useState` locais.
- Antes do submit, todos os campos são consolidados em **um único objeto** `ComposeTravelAdOptions` (tipo exportado por `fabrica-compose-art.ts`).
- **Regra:** nada passa para o motor por contexto/global. Tudo vai por prop. Isso garante que o motor seja **puro**: dadas as mesmas opções, o output é determinístico.

### 1.2 Roteamento de Variantes
| Modo | Como funciona | Quando usar |
|---|---|---|
| **Automático** | `variantIdx = Math.abs(variation) % TOTAL_VARIANTS` onde `variation` vem da fila de geração (1 banner por solicitação). | Geração padrão da Fábrica. |
| **Manual** | `forceVariant: number` no payload → ignora `variation` e faz `((forceVariant % TOTAL) + TOTAL) % TOTAL`. | Preview no admin, testes A/B, regravar a mesma arte com outro layout. |

> 🛑 `TOTAL_VARIANTS` é a **única fonte de verdade**. Trocá-lo sem implementar o branch correspondente faz o índice extra cair silenciosamente em V0 (foi a causa raiz do bug "V6 = clone de V0").

### 1.3 Categorias
Existem **apenas duas** categorias ativas: **Oferta de Pacote** e **Experiência de Destino**. Cada categoria tem seu próprio roteador interno (`renderSafeSquareOffer`, `renderXExperiencia`). Variantes não são compartilhadas entre categorias — V3 de Oferta ≠ V3 de Experiência.

---

## 2. LEIS DA FÍSICA DO CANVAS (Regras Inegociáveis)

### Lei 1 — Sistema de Tokens (proibido ternário solto `isStory ? ... : ...`)

**Errado (legado):**
```ts
const titleSize = isStory ? 96 : 78;
const padX = isStory ? 60 : 40;
const cardY = isStory ? 420 : 240;
```

**Certo (token derivado de `width`/`height`):**
```ts
const T = {
  width, height,
  safeMargin: Math.round(width * 0.037),         // ~40px em 1080
  safeTop:    isStory ? Math.round(height * 0.06) : Math.round(height * 0.026),
  safeBottom: isStory ? Math.round(height * 0.115): Math.round(height * 0.13),
  titleSizeMax: Math.round(width * (isStory ? 0.089 : 0.072)),
  cardRadius:   Math.round(width * 0.026),
  iconBase:     Math.round(width * 0.029),
  // ... sempre em função de width/height
};
```

**Por quê:** quando todo o layout é função de `width`/`height`, mudar de 1080→1920 é só trocar dois números. Square e story passam a ser o **mesmo branch**, parametrizado.

### Lei 2 — `wrapTextSafe` é OBRIGATÓRIO para texto multi-linha

Toda string que pode quebrar em 2+ linhas (título, headline, benefícios longos) **deve** passar por:

```ts
const lines = wrapTextSafe(ctx, text, maxWidth, maxLines, minFontSize);
lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * lineH));
```

`safeFillText` (auto-shrink em 1 linha) só é permitido para textos curtos com tamanho previsível (pílulas, badges, labels de até 2 palavras).

> 🛑 Loop `while (ctx.measureText(t).width > w) { size -= 2 }` **dentro do branch** é proibido — use o helper global. Cada reimplementação local vira um bug futuro.

### Lei 3 — Box Model Dinâmico (medir ANTES de pintar)

**Padrão obrigatório para qualquer card com conteúdo variável:**

```ts
// 1) Medir cada peça
ctx.font = `900 ${prefixSize}px Inter`;   const wPref  = ctx.measureText(prefix).width;
ctx.font = `900 ${pillSize}px Inter`;     const wPill  = ctx.measureText(pillTxt).width + 36;
ctx.font = `900 ${priceSize}px Inter`;    const wPrice = ctx.measureText(priceStr).width;
ctx.font = `600 ${sufSize}px Inter`;      const wSuf   = ctx.measureText(suffix).width;

// 2) Calcular dimensão final do card
const contentW = Math.max(wPref, wPill, wPrice, wSuf);
const cardW    = Math.min(width * 0.84, Math.max(width * 0.5, contentW + 110));
const cardH    = padTop + prefH + gap + pillH + gap + priceH + gap + sufH + padBottom
                 + (showTotal ? totalH + 16 : 0)
                 + (showPix   ? pixH   + 16 : 0);

// 3) DESENHAR o background com as dimensões medidas
fillRoundRect(ctx, cardX, cardY, cardW, cardH, cardR, bgColor);

// 4) Pintar conteúdo
```

> 🛑 Desenhar `fillRoundRect` com altura fixa e depois "ver se cabe" é o caminho mais curto para texto vazando.

### Lei 4 — Safe Zones e Anti-Colisão

| Zona | Reserva | Quem ocupa |
|---|---|---|
| **Topo** | `logoH + 28` (square) / `height * 0.06` (story) | `drawProminentLogo` |
| **Rodapé** | ~140px (square) / ~220px (story) | `drawFinalBranding` (WhatsApp + Instagram + site) |
| **Laterais** | `width * 0.037` (~40px) | margem mínima de qualquer conteúdo |
| **Entre blocos** | mínimo 16px | gap interno |

**Regra anti-colisão:** o `cardY` final de qualquer card deve ser clampado:
```ts
const cardY = Math.min(
  Math.max(safeTop, idealCardY),
  panelBottom - cardH - 20  // ← 20px de respiro acima do footer
);
```

Onde `panelBottom = height - footerReservedH`. Nunca deixe um card calcular `cardY` sem clamp — em conteúdos longos, ele invade o footer.

### Lei 5 — Ordem de Empilhamento (z-order)

```
1. Foto/BG           (drawImage)
2. Vinheta/overlay   (applyVignette / gradient)
3. Cards/painéis     (fillRoundRect)
4. Bordas glow       (stroke)
5. Textos            (fillText / safeFillText / wrapTextSafe)
6. Logo prominente   (drawProminentLogo)  ← SEMPRE depois da foto
7. Footer branding   (drawFinalBranding)  ← SEMPRE último
```

Mudar a ordem = logo atrás da foto, ou texto coberto por card. **Não improvise.**

### Lei 6 — Contraste é Função, não Chute

```ts
const onCard   = getSafeColor(cardBg, "#ffffff");        // sempre passe pelo helper
const onAccent = ensureContrast(textColor, accentBg, 0.4); // delta mínimo de contraste
```

Cores hardcoded (`#ffffff`, `#000`) só são permitidas como **fallback** dentro dos helpers.

### Lei 7 — `ctx.save()` / `ctx.restore()` ao mudar estado global

Sempre que mexer em `shadowBlur`, `globalAlpha`, `transform`, `clip`, **embrulhe em save/restore**. Sem isso, a sombra do card vaza para o próximo texto.

---

## 3. MAPEAMENTO DAS VARIANTES (V0 → V6)

> `TOTAL_VARIANTS = 6` → índices válidos `0..5`. Atualmente **V6 NÃO existe** no código (slot reservado, cai em V0 por módulo). Documentado abaixo como `🔴 SLOT LIVRE`.

| # | Apelido | Estrutura visual | Square | Story | wrapTextSafe? |
|---|---|---|---|---|---|
| **V0** | Painel Topo Sólido | Painel `secondaryColor` ocupa 46–62% do topo; foto abaixo; título à esquerda; card de preço inline | ✅ | ✅ (mesmo branch) | ❌ (auto-shrink manual) |
| **V1** | Black Friday | Painel escuro vertical à esquerda + foto sangrada à direita; benefícios em pills; preço dentro do painel | ✅ (renderer dedicado) | ✅ (renderer dedicado) | ❌ |
| **V2** | Santa Teresa Editorial | Foto no topo + bloco inferior com headline, grid 2-col de benefícios e card de preço centralizado | ✅ (renderer dedicado) | ✅ (renderer dedicado) | ✅ **(único compliant)** |
| **V3** | CVC Box Amarelo | Foto cobre 100% + box arredondado `secondaryColor` topo-esquerda com PACOTE → destino → dias → preço gigante → faixa Pix | ✅ | ✅ | ❌ (só `safeFillText`) |
| **V4** | Card Central Vertical | Foto 100% + card vertical centrado: tagline → título → info → preço | ✅ | ✅ (parametrizado) | ❌ |
| **V5** | Aurora Premium | Foto 100% + overlay gradiente escuro + card horizontal glassmorphism (esquerda: texto / direita: preço) com borda glow | ✅ | ✅ (parametrizado) | ❌ (wrapping próprio inline) |
| **V6** | 🔴 SLOT LIVRE | **Não implementado.** Reservado para "Split Bottom" (Foto 65% topo / faixa sólida 35% rodapé dividida em 2 colunas). Atualmente cai em V0 silenciosamente. | — | — | — |

> Para liberar V6: implementar `if (variant === 6) { ... }` em `renderSafeSquareOffer` (e equivalente em Experiência) e incrementar `TOTAL_VARIANTS` para 7.

### 3.1 Duplicações conhecidas (a remover em refactor futuro)
- V4 e V5 compartilham 80% da lógica de cálculo de preço (`fmtBRv4`/`fmtBRv5`, `totalMultiplierV4`/`V5`). Extrair `computePriceModel()`.
- V2 (story) e V2 (square) são dois renderers separados quase idênticos. Extrair `renderV2Core(format)`.
- V3 (story) e V3 (square) mesmo problema.

---

## 4. PROTOCOLO DE CRIAÇÃO PARA NOVAS VARIANTES (V7+)

**SOP (Standard Operating Procedure) — 5 passos obrigatórios:**

### Passo 1 — Briefing Validado
Preencher integralmente o template `docs/fabrica/TEMPLATE_NOVA_VARIANTE.md`:
- Anatomia em **%** (não px)
- Hierarquia tipográfica com tamanhos
- Ponto focal da foto (`fy`)
- Ordem de empilhamento
- Prioridade de "quem cede" quando não cabe
- Casos de teste extremos (título longo, sem promo, 6 benefícios, etc.)

> 🛑 Sem briefing preenchido = PR rejeitado.

### Passo 2 — Reservar Slot
1. Confirmar próximo índice livre (atual: **V6**).
2. Atualizar `TOTAL_VARIANTS` no início de `renderSafeSquareOffer`.
3. Criar branch vazio `if (variant === N) { ... }` retornando um canvas de teste (cor sólida) para validar roteamento.

### Passo 3 — Implementar com Tokens (não pixels)
Todo valor numérico deve ser derivado de `width`/`height` ou de constantes do escopo. Toda string fixa deve passar por i18n (PT/ES). Toda fonte/cor passa pelos helpers globais (`getSafeColor`, `ensureContrast`).

### Passo 4 — Texto Blindado
- Título: **OBRIGATÓRIO** `wrapTextSafe(ctx, title, maxW, 2, minSize)`.
- Benefícios longos: `safeFillText` ou `wrapTextSafe` conforme caso.
- Pílulas/badges: `safeFillText`.
- **Nenhum** `ctx.fillText(textoDinâmico, ...)` direto sem proteção.

### Passo 5 — Validação contra Casos de Teste
Antes de marcar o PR como pronto, gerar a variante nos 8 cenários extremos do template:
1. Título 1 palavra / 2. Título 9 palavras / 3. Sem promo / 4. 6 benefícios longos
5. Preço R$ 99 / 6. Preço R$ 12.499,90 / 7. Sem logo / 8. Cores de baixo contraste

Capturar print de cada e anexar ao PR.

---

## 5. ANTI-PADRÕES PROIBIDOS

| ❌ Proibido | ✅ Correto | Motivo |
|---|---|---|
| `const padX = isStory ? 60 : 40` | `padX = Math.round(width * 0.037)` | Tokens responsivos. |
| `while (ctx.measureText(t).width > w) size -= 2` dentro do branch | `safeFillText` / `wrapTextSafe` | Helpers globais centralizam comportamento. |
| `ctx.fillText(titulo, x, y)` | `wrapTextSafe(...)` + loop de linhas | Anti-overflow. |
| `fillRoundRect(...); ... ctx.fillText(longText, ...)` | Medir → dimensionar card → desenhar | Box Model Dinâmico. |
| `fmtBRv7`, `pfsV7`, `priceStrV7` | Helper compartilhado `formatBRL`, `autoShrink` | Zero duplicação. |
| `ctx.fillStyle = "#ffffff"` (texto) | `getSafeColor(bg, "#fff")` | Contraste real. |
| `drawProminentLogo()` antes do `drawImage(foto)` | Logo SEMPRE depois da foto | z-order correto. |
| Hardcode `"PACOTE"`, `"a partir de"` | Vir como prop ou via i18n | PT/ES funcional. |
| `cardY = idealY` sem clamp | `cardY = clamp(safeTop, idealY, panelBottom - cardH - 20)` | Anti-colisão com footer. |
| `ctx.shadowBlur = 32; ...; ctx.fillText(...)` sem save/restore | `ctx.save(); ...; ctx.restore();` | Estado vaza para próximas operações. |
| Repetir `promoName` dentro do `titleText` | Remover prefixo com regex antes de desenhar | Evita "BLACK FRIDAY BLACK FRIDAY". |
| Assumir `highlights.length >= N` | Sempre validar com `Math.max(1, list.length)` | Crash em payload mínimo. |

---

## 6. GLOSSÁRIO DE HELPERS GLOBAIS

Localização: `src/lib/fabrica-compose-art.ts` (topo do arquivo).

| Helper | Assinatura | Quando usar |
|---|---|---|
| `wrapTextSafe` | `(ctx, text, maxW, maxLines, minSize) => string[]` | **TODO** título e texto multi-linha. |
| `safeFillText` | `(ctx, text, x, y, maxW, minSize) => void` | Texto 1 linha com auto-shrink. |
| `fitCover` | `(iw, ih, tw, th, fy?) => {sx,sy,sw,sh}` | Recorte cover de fotos. |
| `fillRoundRect` | `(ctx, x, y, w, h, r, color) => void` | Card/painel sólido. |
| `fillGlassRoundRect` | `(ctx, x, y, w, h, r, bgRgba, borderColor) => void` | Card vidro/glassmorphism. |
| `roundRect` | `(ctx, x, y, w, h, r) => void` | Path para `stroke` (bordas). |
| `drawMonoIcon` | `(ctx, key, x, y, size, color) => void` | Ícones mono de benefícios. |
| `drawProminentLogo` | `(ctx, x, y, size) => Promise<void>` | Logo grande no topo. |
| `drawFinalBranding` | `(ctx, ..., contacts, logoFormat) => Promise<void>` | Footer com contatos — **sempre por último**. |
| `getSafeColor` | `(bg, preferred) => string` | Cor de texto sobre fundo. |
| `ensureContrast` | `(fg, bg, minDelta?) => string` | Força delta mínimo de contraste. |
| `shadeColor` | `(hex, percent) => string` | Tom mais escuro/claro de uma cor. |
| `applyVignette` | `(ctx, w, h, intensity?) => void` | Escurece bordas. |
| `applyFilmGrain` | `(ctx, w, h, amount?) => void` | Textura sobre foto. |

---

## 🔒 ENFORCEMENT

1. **Code review obrigatório** para qualquer PR que toque `fabrica-compose-art.ts` ou adicione variante.
2. **Checklist de PR** deve incluir referência explícita a este documento: _"Validado contra DOC_ENGENHARIA_MOTOR_CANVAS.md, seções X/Y/Z."_
3. **Documento vivo:** ao mudar regra (ex: liberar V6), atualizar este arquivo **no mesmo PR** que faz a mudança no código.

---

**Última revisão:** baseada na auditoria de V0–V5 em `src/lib/fabrica-compose-art.ts` (4324 linhas).
**Responsável pela manutenção:** Tech Lead / Arquiteto do projeto.
