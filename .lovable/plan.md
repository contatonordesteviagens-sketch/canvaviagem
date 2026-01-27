

# Plano: Redesign da Página "Próximo Nível"

## Resumo das Alterações

Redesenhar a página `/proximo-nivel` para:
1. Aplicar a identidade visual do Canva Viagem (branco, azul, roxo)
2. Adicionar botão CTA no Hero que ancora para a seção de preços
3. Atualizar o link do botão principal para: `https://pay.hotmart.com/X100779687E?checkoutMode=10`

---

## Mudanças Visuais Principais

### Cores Atuais → Cores Novas

| Elemento | Atual (Laranja) | Novo (Canva) |
|----------|-----------------|--------------|
| Gradiente Hero | `from-orange-500 to-amber-500` | `from-primary to-accent` (roxo → cyan) |
| Badges/Tags | `bg-orange-500/10 text-orange-600` | `bg-primary/10 text-primary` |
| Ícones | `text-orange-500` | `text-primary` ou `text-accent` |
| Cards módulos | `border-orange-200/50` | `border-primary/20` |
| Seção problema | `bg-red-50` | `bg-red-50` (mantém - é intencional) |
| CTA principal | `from-orange-500 to-amber-500` | `from-primary to-accent` |

---

## Estrutura da Página Redesenhada

### 1. Hero Section

**Novo layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Badge: Treinamento Exclusivo]                             │
│                                                             │
│        AGENTE LUCRATIVO®                                    │
│   O próximo nível para quem quer vender viagens...         │
│                                                             │
│   ┌────────────────┐                                        │
│   │  [VÍDEO 9:16] │                                        │
│   └────────────────┘                                        │
│                                                             │
│   [🚀 ATIVAR AGORA]  [📍 VER INVESTIMENTO ↓]               │
│    (Hotmart)          (Scroll para #pricing)               │
└─────────────────────────────────────────────────────────────┘
```

**Alterações:**
- Gradiente de fundo: `from-primary/10 via-background to-accent/10`
- Badge: `bg-primary/10 text-primary border-primary/20`
- Título: `bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`
- **2 botões lado a lado:**
  - Botão primário: "ATIVAR AGENTE LUCRATIVO AGORA" → link Hotmart
  - Botão secundário: "VER INVESTIMENTO" → ancora para `#pricing`

---

### 2. Seções de Conteúdo

Atualizar todas as seções para usar cores do design system:

**Cards de Módulos:**
```tsx
// De:
<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">

// Para:
<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent">
```

**Ícones:**
```tsx
// De:
<Zap className="h-8 w-8 text-orange-500" />

// Para:
<Zap className="h-8 w-8 text-primary" />
```

**Seção "Ideia Simples":**
```tsx
// De:
<section className="py-12 bg-gradient-to-br from-orange-50 to-amber-50">

// Para:
<section className="py-12 bg-gradient-to-br from-primary/5 to-accent/5">
```

---

### 3. Seção de Preços (id="pricing")

Adicionar `id="pricing"` para permitir scroll anchor:

```tsx
<section id="pricing" className="py-16 md:py-24 bg-gradient-to-br from-primary to-accent">
```

Manter o design de preços mas com cores consistentes.

---

## Arquivo a Modificar

### `src/pages/ProximoNivel.tsx`

**Alteração 1 - URL do Hotmart:**
```tsx
// De:
const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/X100779687E?off=1b820216&checkoutMode=10";

// Para:
const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/X100779687E?checkoutMode=10";
```

**Alteração 2 - Função de scroll:**
```tsx
const scrollToPricing = () => {
  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
};
```

**Alteração 3 - Hero com 2 botões:**
```tsx
<div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
  <Button 
    onClick={handleCTAClick}
    size="lg"
    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-lg px-8 py-6 h-auto font-bold shadow-lg"
  >
    <Rocket className="mr-2 h-5 w-5" />
    ATIVAR AGORA
  </Button>
  
  <Button 
    onClick={scrollToPricing}
    variant="outline"
    size="lg"
    className="border-primary/30 text-primary hover:bg-primary/10 text-lg px-8 py-6 h-auto font-semibold"
  >
    <ArrowDown className="mr-2 h-5 w-5" />
    Ver Investimento
  </Button>
</div>
```

**Alteração 4 - Cores do design system:**

Substituições em massa:
- `from-orange-500` → `from-primary`
- `to-amber-500` → `to-accent`
- `text-orange-600` → `text-primary`
- `text-orange-500` → `text-primary`
- `text-amber-600` → `text-accent`
- `bg-orange-500/10` → `bg-primary/10`
- `border-orange-500/20` → `border-primary/20`
- `bg-orange-100` → `bg-primary/10`
- `bg-orange-50` → `bg-primary/5`
- `from-orange-950/20` → `from-primary/10`

**Alteração 5 - Seção de preços:**
```tsx
<section id="pricing" className="py-16 md:py-24 bg-gradient-to-br from-primary to-accent">
  {/* Conteúdo existente mantido */}
</section>
```

---

## Novo Import Necessário

```tsx
import { ArrowDown } from "lucide-react";
```

---

## Resultado Visual Esperado

A página terá:
- ✅ Identidade visual consistente com o resto do app (roxo/cyan)
- ✅ Botão de ação principal visível no Hero
- ✅ Botão secundário que leva para a seção de preços
- ✅ Cards e ícones usando cores do brand
- ✅ Link correto para o Hotmart (sem parâmetro `off`)

---

## Comparação Visual

**Antes (Laranja/Amber):**
- Hero com gradiente laranja
- Badges e ícones laranja
- CTA laranja no final da página

**Depois (Roxo/Cyan - Canva):**
- Hero com gradiente roxo → cyan
- Badges roxos, ícones roxos
- 2 CTAs no Hero (um para compra, outro para scroll)
- Visual consistente com `/planos` e resto do app

