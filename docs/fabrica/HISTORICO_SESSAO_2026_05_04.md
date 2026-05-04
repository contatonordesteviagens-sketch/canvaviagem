# 📖 Histórico Completo: Fábrica de Anúncios — Sessão 04/05/2026

## 🎯 Objetivo do Projeto
Estabilizar, testar a fundo e lançar a **Fábrica de Anúncios** (`/fabrica`) em produção. A plataforma permite agências de viagem gerarem anúncios profissionais para Instagram (Story 9:16 e Feed Quadrado 1:1) com IA + Canvas.

---

## 🔑 Acesso e Credenciais

| Item | Valor |
|---|---|
| URL da ferramenta | https://canvaviagem.com/fabrica |
| Senha (desativada) | `rickbread` |
| Repositório GitHub | `contatonordesteviagens-sketch/canvaviagem-6647054a` |
| Branch | `main` |
| Deploy automático | Lovable.dev (auto-deploy via push no GitHub) |
| Arquivo principal Canvas | `src/lib/fabrica-compose-art.ts` |
| Arquivo UI | `src/pages/fabrica/Phase3ArtFactory.tsx` |
| Prompts IA | `supabase/functions/fabrica-generate-ad/` |

---

## 📋 Pedidos do Usuário (Cronológico)

### 1. Acesso público
- **Pedido**: Remover senha e liberar `/fabrica` ao público sem login
- **Feito**: Removido `ComingSoonGate` do `Phase3ArtFactory.tsx`

### 2. Branding profissional
- **Pedido**: Ícones WhatsApp/Instagram finos e elegantes; fonte dos contatos mais suave
- **Feito v1**: Ícones finos (lineWidth 0.07), fonte Medium 500
- **Revertido**: Usuário rejeitou — ficou "muito ruim"
- **Feito v2 (FINAL)**: Revertido para Bold 700, véu escuro, sombra forte

### 3. Véu do rodapé
- **Pedido**: "Preferia a sombra escura de baixo e a letra branca"
- **Regra gravada**: Véu gradiente SEMPRE escuro + texto SEMPRE branco #ffffff + bold 700

### 4. Espaçamento Stories — overlaps
- **Problema**: Price card, contatos e botões do Instagram se sobrepondo
- **Correções aplicadas**:
  - `safeBottom` (motor principal): `420 → 580px`
  - `safeBottomMargin` (drawFinalBranding): `280 → 340px`
  - V0 Experiência: `blockBottom` dinâmico com `brandingSafeY = height - 520`
  - V1 Experiência: `padBottom` = `520px` (antes: 280px)
  - Price cards: cap em `panelBottom - 300` em todos os layouts

### 5. ancora/matriz stories — painel lateral
- **Problema**: estratégias usavam split horizontal (azul/foto) que ficava horrível no Story 9:16
- **Feito**: Quando `format === "story"`, ancora e matriz usam **foto full-bleed + gradiente + painel semi-transparente** na base
- **Regra**: Square mantém layout original

### 6. Preço inconsistente (vírgula pequena)
- **Problema**: Font size do preço variava aleatoriamente entre gerações
- **Feito**: Substituído `while` loop por tamanho fixo baseado no comprimento do texto:
  - ≤8 chars → 56px | 9-11 → 50px | 12-14 → 44px | 15+ → 38px

### 7. vitrine/fallback Story — conteúdo sobre botões
- **Problema**: Painel calculado de cima para baixo, ultrapassava panelBottom e invadia o branding
- **Feito**: Painel agora calculado **de panelBottom PARA CIMA** — `bottomHeight = panelBottom - photoHeight`
- **Story**: foto = 42%, painel = 534px (termina em panelBottom=1340)
- **Square**: foto = 38%, painel = ~550px

### 8. travelPeriod e pixBannerText ignorados
- **Problema**: Duração (ex: "5 dias") e texto do banner PIX eram ignorados em alguns layouts
- **Feito**: `travelPeriod` tem prioridade sobre highlight em `drawPriceCard` e V3 box
- **Feito**: `pixBannerText` personalizado substituí o texto hardcoded "5% OFF À VISTA NO PIX"

### 9. Ícones de contato vazios
- **Problema**: Quando usuário não preenche telefone/instagram, os ícones @ e ⊕ aparecem sem valor
- **Feito**: `contactsToDraw` agora filtra `.trim()` — valor vazio = não renderiza nada

### 10. Highlights Square — overflow
- **Problema**: 5 highlights de 82px + gaps = 466px, vazava para fora do painel
- **Feito**: Square usa 2 colunas de 2 pills cada (compacto), economiza ~200px de altura

---

## 🏗️ Arquitetura do Motor Canvas

### Estratégias por Formato

| Estratégia | Square | Story |
|---|---|---|
| `ancora` | Painel lateral sólido + foto | Full-bleed foto + painel base translúcido |
| `matriz` | Foto topo + 2 colunas | Full-bleed foto + conteúdo vertical |
| `gancho` | Full-bleed + highlights | Full-bleed + highlights (inalterado) |
| `vitrine` (fallback) | Foto 38% + painel 62% | Foto 42% + painel 58% |
| `experiencia_hero` | Full-bleed V0 | Full-bleed V0 |

### Zonas de Segurança (Story 1080×1920px)

```
0px ─────────────────── topo da tela
│
280px ── safeTop (evita câmera/notificações)
│   [conteúdo começa aqui]
│
1340px ─ panelBottom = 1920 - 580
│   [todo conteúdo deve terminar aqui]
│   [price card cap: panelBottom - 300 = 1040]
│
1440px ─ branding footer começa (footerY = 1920 - 140 - 340)
│   [logo + contatos aqui]
│
1580px ─ branding footer termina
│
1600px ─ safe zone Instagram começa (botões nativos)
│
1920px ─ base da tela
```

### Variantes de Experiência de Destino (isExperience=true)

| Variante | Layout | Destaque |
|---|---|---|
| V0 | Foto full-bleed + overlay gradiente + CTA amarelo | "RESERVE AGORA" |
| V1 | Foto clean + tipografia serif (Playfair) + slogan | Minimalista premium |
| V2 | Foto + botão fosco + painéis laterais + CTA dourado | Mais visual |
| V3 | Dark premium + overlay forte + botão outline | Noturna |

---

## ⚠️ Regras de Design Invioláveis

1. **Rodapé de Branding**: SEMPRE véu escuro + texto #ffffff + Bold 700
2. **Safe Zone Story**: Conteúdo NUNCA abaixo de `panelBottom = 1340px` 
3. **Safe Zone Branding**: Footer SEMPRE abaixo de `1440px` (340px do fundo)
4. **Ícones Contato**: NUNCA desenhar ícone se o valor estiver vazio
5. **Estratégia Story**: anchor/matriz NUNCA usam split lateral em Story
6. **Preço**: Tamanho fixo (não aleatório) baseado no comprimento do texto

---

## 🗂️ Arquivos Críticos

| Arquivo | Função |
|---|---|
| `src/lib/fabrica-compose-art.ts` | Motor Canvas — todo rendering gráfico |
| `src/pages/fabrica/Phase3ArtFactory.tsx` | UI, estados, formulários, orquestração |
| `supabase/functions/fabrica-generate-ad/index.ts` | Edge function IA |
| `supabase/functions/fabrica-generate-ad/master-prompts.ts` | Prompts IA |
| `src/data/fabrica-categories.ts` | Categorias e estratégias |
| `docs/fabrica/KNOWLEDGE_AD_FACTORY.md` | Guidelines de design |

---

## 🚀 Status Final
- ✅ Acesso público liberado
- ✅ Branding premium (véu escuro + bold)
- ✅ Safe zones implementadas em todos os layouts
- ✅ Ícones vazios não mostram mais
- ✅ Highlights em 2 colunas no Square (sem overflow)
- ✅ Preço consistente entre gerações
- ⚠️ Pendente: testar V2 Experiência com dados reais após todas as correções
- ⚠️ Pendente: verificar V3/V4 Experiência em Stories
