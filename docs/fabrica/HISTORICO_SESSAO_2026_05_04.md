# 📖 Histórico Completo: Fábrica de Anúncios — Sessão 04/05/2026

## 🔑 Acesso e Deploy

| Item | Valor |
|---|---|
| URL | https://canvaviagem.com/fabrica |
| GitHub | `contatonordesteviagens-sketch/canvaviagem-6647054a` (branch `main`) |
| Arquivo principal | `src/lib/fabrica-compose-art.ts` |
| UI | `src/pages/fabrica/Phase3ArtFactory.tsx` |
| Deploy | Lovable auto-deploy ao push no GitHub |
| Token Git | `gho_REMOVED_FOR_SECURITY` (no remote URL) |

## ⚠️ BUG CRÍTICO DESCOBERTO

**`const bgPad` duplicado em `drawFinalBranding` (linhas ~299 e ~305)**  
- Causou falha silenciosa do Vite/esbuild em TODOS os builds  
- **Nenhum deploy desta sessão funcionou até este bug ser removido**  
- Commit da correção: `4b6a068`  
- Após essa correção, todos os fixes subsequentes deployaram corretamente

## 📋 Problemas e Correções (Ordem Cronológica)

### 1. Acesso público liberado
- Removido `ComingSoonGate` de `Phase3ArtFactory.tsx`

### 2. ancora/matriz em Story — painel lateral (split)
- **Bug**: estratégias usavam split horizontal (azul esq + foto dir) em Story 9:16
- **Fix**: `if (format === "story")` → foto full-bleed + gradiente escuro + painel base
- **Arquivo**: `fabrica-compose-art.ts` ~linha 3205

### 3. vitrine fallback Story — conteúdo invasivo
- **Bug**: `bottomHeight = 770` + `photoHeight = height - safeBottom - 770` = painel de 770px que ultrapassava `panelBottom` e entrava na zona do branding (1440px)
- **Fix**: painel calculado DE panelBottom PARA CIMA: `bottomHeight = panelBottom - photoHeight`; `photoHeight = 42%` (Story) ou `38%` (Square)
- **Regra**: Painel SEMPRE termina em `panelBottom = height - safeBottom`

### 4. vitrine square — price card nunca desenhado
- **Bug**: `if (cursorY <= priceCapY)` falhava porque highlights empurravam cursorY para ~772 e priceCapY=660
- **Fix**: Removida condição; price card sempre desenhado em `Math.min(cursorY, panelBottom - 160)`
- **Para story**: `Math.min(cursorY, panelBottom - 310)`

### 5. gancho story — price card overflow
- **Bug**: `priceCardY = pillsY + pillsCount * 70 + 20` com 6 pills = overflow além de panelBottom
- **Fix**: `Math.min(priceCardYRaw, panelBottom - 310)`
- **Fix adicional**: panelH reduzido de 920 → 780px para story

### 6. Ícones de contato vazios
- **Bug**: Instagram @ e ⊕ telefone apareciam sem valor quando campos não preenchidos
- **Fix**: `contact1.value.trim()` antes de adicionar ao `contactsToDraw[]`
- **Arquivo**: `drawFinalBranding` ~linha 273

### 7. Preço inconsistente (vírgula pequena)
- **Bug**: while-loop de shrink causava tamanho variável entre gerações
- **Fix**: Tamanho fixo por comprimento do texto (≤8→56px, ≤11→50px, ≤14→44px, >14→38px)

### 8. Highlights 2 colunas no Square
- **Bug**: 5 highlights × 82px = 466px, overflow do painel (550px disponíveis)
- **Fix**: Square usa 2 colunas × 2 pills cada = ~130px total

## 📐 Zonas de Segurança (Story 1080×1920)

```
0px      ──── topo da tela (câmera frontal área)
280px    ──── safeTop (conteúdo começa aqui)
         [zona de conteúdo]
1340px   ──── panelBottom = 1920 - 580 (TODO conteúdo TERMINA AQUI)
         [gap de 100px]
1440px   ──── branding footer começa (footerY = 1920 - 140 - 340)
         [logo + contatos]
1580px   ──── branding footer termina
         [zona morta Instagram]
1920px   ──── base da tela
```

## 🏗️ Estratégias por Categoria

Para `oferta_pacote`: `["matriz", "gancho", "ancora", "vitrine"]` (ciclo)

| Estratégia | Square | Story |
|---|---|---|
| `ancora` | Painel sólido esq + foto dir | Full-bleed foto + painel base 48% |
| `matriz` | Foto topo + 2 cols | Full-bleed foto + conteúdo vertical |
| `gancho` | Full-bleed + dark panel 500px | Full-bleed + dark panel 780px |
| `vitrine` | Foto 38% + painel azul | Foto 42% + painel azul |

## ⚠️ Regras Obrigatórias de Design

1. Rodapé SEMPRE: véu escuro + texto #ffffff + Bold 700
2. Conteúdo NUNCA abaixo de `panelBottom = height - safeBottom`
3. Ícones de contato: NUNCA desenhar sem valor preenchido (`.trim()` check)
4. ancora/matriz: NUNCA usar split lateral em Story
5. Preço: tamanho fixo (não aleatório) por comprimento do texto

## 🚀 Commits desta Sessão

| Hash | Descrição |
|---|---|
| `da2b4f1` | ancora+matriz: full-bleed story |
| `dce755a` | vitrine: foto 55%, preço consistente |
| `d20a1e9` | vitrine: painel de panelBottom para cima (CRITICAL) |
| `e0ec55e` | ícones vazios + square 2-col highlights |
| `4b6a068` | **BUGFIX: remove const bgPad duplicado** |
| `último` | gancho overflow + vitrine price card sempre desenhado |

## 📁 Arquivos Críticos

| Arquivo | Função |
|---|---|
| `src/lib/fabrica-compose-art.ts` | Motor Canvas — todo rendering |
| `src/pages/fabrica/Phase3ArtFactory.tsx` | UI + lógica de geração |
| `src/data/fabrica-categories.ts` | Categorias + estratégias |
| `docs/fabrica/KNOWLEDGE_AD_FACTORY.md` | Guidelines de design |
