

# Plano: Redesign da Página "Próximo Nível" com Identidade Visual Canva

## Resumo

Redesenhar completamente a página `/proximo-nivel` para:
1. Aplicar a identidade visual do Canva Viagem (tons de branco, azul/cyan e roxo)
2. Adicionar botão secundário no Hero que ancora para a seção de preços
3. Atualizar o link principal para: `https://pay.hotmart.com/X100779687E?checkoutMode=10`
4. Manter todo o texto e copy existente

---

## Alterações Detalhadas

### 1. Atualizar URL do Hotmart (Linha 22)

```typescript
// De:
const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/X100779687E?off=1b820216&checkoutMode=10";

// Para:
const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/X100779687E?checkoutMode=10";
```

### 2. Adicionar Função de Scroll + Novo Import

Adicionar `ArrowDown` nos imports e criar função `scrollToPricing`:

```typescript
import { ArrowDown } from "lucide-react";

const scrollToPricing = () => {
  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
};
```

### 3. Redesign do Hero Section (Linhas 35-80)

**Mudanças visuais:**
- Gradiente de fundo: `from-primary/10 via-background to-accent/10`
- Badge: `bg-primary/10 text-primary border-primary/20`
- Título: gradiente `from-primary to-accent`
- Borda do vídeo: `border-primary/20`

**Adicionar dois botões:**
```typescript
<div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
  <Button 
    onClick={handleCTAClick}
    size="lg"
    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-lg px-8 py-6 h-auto font-bold shadow-lg"
  >
    <Rocket className="mr-2 h-5 w-5" />
    ATIVAR AGENTE LUCRATIVO AGORA
  </Button>
  
  <Button 
    onClick={scrollToPricing}
    variant="outline"
    size="lg"
    className="border-primary/30 text-primary hover:bg-primary/10 text-lg px-8 py-6 h-auto font-semibold"
  >
    <ArrowDown className="mr-2 h-5 w-5" />
    VER INVESTIMENTO
  </Button>
</div>
```

### 4. Substituições de Cores em Massa

| Atual (Laranja) | Novo (Canva) |
|-----------------|--------------|
| `from-orange-500/10` | `from-primary/10` |
| `to-amber-500/10` | `to-accent/10` |
| `bg-orange-500/10` | `bg-primary/10` |
| `border-orange-500/20` | `border-primary/20` |
| `text-orange-600` | `text-primary` |
| `text-orange-500` | `text-primary` |
| `text-amber-600` | `text-accent` |
| `from-orange-500` | `from-primary` |
| `to-amber-500` | `to-accent` |
| `bg-orange-100` | `bg-primary/10` |
| `bg-orange-900/30` | `bg-primary/20` |
| `from-orange-50` | `from-primary/5` |
| `to-amber-50` | `to-accent/5` |
| `from-orange-950/20` | `from-primary/10` |
| `to-amber-950/20` | `to-accent/10` |
| `border-orange-200/50` | `border-primary/20` |
| `border-orange-900/30` | `border-primary/30` |

### 5. Seção de Preços - Adicionar ID (Linha 417)

```typescript
// De:
<section className="py-16 md:py-24 bg-gradient-to-br from-orange-500 to-amber-500">

// Para:
<section id="pricing" className="py-16 md:py-24 bg-gradient-to-br from-primary to-accent">
```

E atualizar o botão dentro da seção de preços:
```typescript
<Button 
  onClick={handleCTAClick}
  size="lg"
  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
>
```

### 6. CTA Final (Linha 473)

```typescript
// De:
className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"

// Para:
className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
```

---

## Mapeamento de Cores

As cores do design system Canva Viagem:
- **Primary (Roxo)**: `hsl(265 78% 54%)` → classes `primary`
- **Accent (Cyan)**: `hsl(180 100% 40%)` → classes `accent`
- **Background**: branco claro
- **Gradientes**: `from-primary to-accent` ou `from-primary/10 to-accent/10`

---

## Seções Afetadas

| Seção | Alteração |
|-------|-----------|
| Hero | Cores + 2 botões |
| Problem | Mantém vermelho (intencional) |
| Solution | `text-primary` nos ícones |
| Simple Idea | `from-primary/5 to-accent/5` no fundo |
| Fast Section | Ícones e círculos `primary` |
| Modules | Cards com bordas `primary/20`, números com gradiente `from-primary to-accent` |
| Who is it for | Mantém verde (intencional) |
| Pricing | `id="pricing"` + gradiente `from-primary to-accent` |
| Final CTA | Gradiente `from-primary to-accent` |

---

## Preview Visual

**Hero Redesenhado:**
```
┌─────────────────────────────────────────────────────────────┐
│  [✨ Treinamento Exclusivo] (badge roxo)                    │
│                                                             │
│        AGENTE LUCRATIVO®                                    │
│   (gradiente roxo → cyan)                                   │
│                                                             │
│   ┌────────────────┐                                        │
│   │  [VÍDEO 9:16] │  (borda roxa)                          │
│   └────────────────┘                                        │
│                                                             │
│   [🚀 ATIVAR AGORA]     [↓ VER INVESTIMENTO]               │
│    (botão roxo→cyan)     (outline roxo, scroll)            │
└─────────────────────────────────────────────────────────────┘
```

**Seção de Preços:**
```
┌─────────────────────────────────────────────────────────────┐
│  (fundo gradiente roxo → cyan)                              │
│                                                             │
│           💰 INVESTIMENTO                                   │
│           12x de R$ 10  ou  R$ 97/ano                       │
│                                                             │
│           [ATIVAR AGENTE LUCRATIVO®]                        │
│            (botão branco, texto roxo)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquivo Modificado

| Arquivo | Ação |
|---------|------|
| `src/pages/ProximoNivel.tsx` | **MODIFICAR** - Redesign completo de cores e adição de botão anchor |

