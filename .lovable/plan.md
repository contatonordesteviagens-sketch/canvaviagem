

# Plano: Redesign da Seção "O que você vai aprender"

## Resumo

Redesenhar completamente a seção de módulos (linhas 343-438) com:
1. Novo design visual inspirado na imagem (cards arredondados com ícones coloridos)
2. Novo conteúdo fornecido pelo usuário (3 módulos com descrições detalhadas)
3. Manter as cores do design system (branco, azul/cyan, roxo)

---

## Novo Conteúdo dos Módulos

### MÓDULO 01 - Inteligência Artificial para Vender Viagens
**Subtítulo:** Use I.A como uma equipe de vendas trabalhando para você 24 horas por dia.

**Bullet points:**
- Criar anúncios, roteiros, textos e criativos com IA
- Construir páginas, sistemas e estruturas de venda com IA
- Atender viajantes no WhatsApp com agentes de IA
- Operar como se tivesse vários assistentes vendendo por você

**Conclusão:** Com IA é possível ter mais produtividade com menos esforço e mais vendas.

---

### MÓDULO 02 - Onde e Para Quem Vender
**Subtítulo:** Precisão Máxima, Menos Desperdício com Anúncios

**Descrição:** Públicos que mais compram viagens pra você parar de gastar dinheiro tentando acertar no escuro. Aqui você aprende a anunciar com estratégia reduzindo erros e economizando verba.

**Bullet points:**
- Como evitar curiosos e focar em quem realmente compra
- Como reduzir desperdício em Meta, Google e outras plataformas
- Como anunciar com mais resultado mesmo com orçamento baixo
- Como jogar o jogo das plataformas sem cair na armadilha de gastar cada vez mais

**Conclusão:** Menos prejuízo. Mais controle. Mais resultado.

---

### MÓDULO 03 - Os 3 Pilares da Venda de Viagens
**Subtítulo:** A estrutura que transforma interesse em confiança, e confiança em vendas, mesmo quando você não está online.

**Bullet points:**
- Como tornar o viajante seguro para comprar pela internet
- Como construir uma presença profissional e confiável
- Como organizar conteúdo, anúncios e atendimento em um único sistema
- Como fazer sua estrutura trabalhar enquanto você foca nas vendas

**Conclusão:** Vou te dar uma máquina de vendas rodando todos os dias.

---

## Design Visual (Baseado na Imagem)

### Estrutura Geral

```
┌──────────────────────────────────────────────────────────────────┐
│   CONTEÚDO EXCLUSIVO (badge roxo)                                │
│                                                                  │
│   O que você vai                                                 │
│   aprender   (aprender em verde/accent)                          │
│                                                                  │
│   Um passo a passo completo do básico ao avançado...            │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  [🤖]  MÓDULO 01                                        │   │
│   │        Inteligência Artificial para Vender Viagens      │   │
│   │        ...descrição e bullets...                        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  [🎯]  MÓDULO 02                                        │   │
│   │        Onde e Para Quem Vender                          │   │
│   │        ...descrição e bullets...                        │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  [🔑]  MÓDULO 03                                        │   │
│   │        Os 3 Pilares da Venda de Viagens                 │   │
│   │        ...descrição e bullets...                        │   │
│   └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Estilo dos Cards (similar à imagem)

- **Fundo:** Cards brancos com bordas arredondadas (`rounded-2xl`)
- **Ícone:** Círculo colorido com gradiente (`bg-gradient-to-br from-primary to-accent`) contendo ícone branco
- **Badge do módulo:** Tag pequena em verde/accent (`bg-accent/10 text-accent`)
- **Título:** Texto bold preto/foreground
- **Descrição:** Texto muted-foreground
- **Bullets:** Ícones check verdes com texto

### Ícones por Módulo

| Módulo | Ícone Lucide | Cor |
|--------|--------------|-----|
| 01 - IA | `Bot` ou `Cpu` | primary → accent |
| 02 - Anúncios | `Target` ou `Megaphone` | primary → accent |
| 03 - Pilares | `Key` ou `Layers` | primary → accent |

---

## Alterações no Código

### 1. Adicionar novos ícones nos imports (linha 5-24)

```typescript
import { 
  // ... existentes ...
  Bot,
  Key,
  Layers
} from "lucide-react";
```

### 2. Redesenhar a Seção de Módulos (linhas 343-438)

**Novo código:**

```tsx
{/* Modules Section */}
<section className="py-12 md:py-16 bg-muted/30">
  <div className="container mx-auto px-4 max-w-4xl">
    <div className="text-center space-y-6">
      {/* Badge */}
      <div className="inline-block">
        <span className="text-primary text-sm font-semibold uppercase tracking-wider">
          Conteúdo Exclusivo
        </span>
      </div>
      
      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold">
        O que você vai{" "}
        <span className="text-accent">aprender</span>
      </h2>
      
      <p className="text-muted-foreground max-w-xl mx-auto">
        Um passo a passo completo do básico ao avançado para acelerar suas vendas.
      </p>

      {/* Module Cards */}
      <div className="grid gap-6 pt-4">
        
        {/* Module 1 - IA */}
        <Card className="text-left border-0 shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full uppercase">
                  Módulo 01
                </span>
                <h3 className="text-xl font-bold">
                  Inteligência Artificial para Vender Viagens Todos os Dias
                </h3>
                <p className="text-muted-foreground">
                  Use I.A como uma equipe de vendas trabalhando para você 24 horas por dia.
                </p>
                <ul className="space-y-2 pt-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Criar anúncios, roteiros, textos e criativos com IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Construir páginas, sistemas e estruturas de venda com IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Atender viajantes no WhatsApp com agentes de IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Operar como se tivesse vários assistentes vendendo por você</span>
                  </li>
                </ul>
                <p className="text-sm font-medium text-primary pt-2">
                  Com IA é possível ter mais produtividade com menos esforço e mais vendas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module 2 - Anúncios */}
        <Card className="text-left border-0 shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Target className="h-7 w-7 text-white" />
              </div>
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full uppercase">
                  Módulo 02
                </span>
                <h3 className="text-xl font-bold">
                  Onde e Para Quem Vender: Precisão Máxima, Menos Desperdício
                </h3>
                <p className="text-muted-foreground">
                  Públicos que mais compram viagens pra você parar de gastar dinheiro tentando acertar no escuro. Aqui você aprende a anunciar com estratégia reduzindo erros e economizando verba.
                </p>
                <ul className="space-y-2 pt-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Como evitar curiosos e focar em quem realmente compra</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Como reduzir desperdício em Meta, Google e outras plataformas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Como anunciar com mais resultado mesmo com orçamento baixo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Como jogar o jogo das plataformas sem cair na armadilha de gastar cada vez mais</span>
                  </li>
                </ul>
                <p className="text-sm font-medium text-primary pt-2">
                  Menos prejuízo. Mais controle. Mais resultado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module 3 - Pilares */}
        <Card className="text-left border-0 shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Key className="h-7 w-7 text-white" />
              </div>
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full uppercase">
                  Módulo 03
                </span>
                <h3 className="text-xl font-bold">
                  Os 3 Pilares da Venda de Viagens no Piloto Automático
                </h3>
                <p className="text-muted-foreground">
                  A estrutura que transforma interesse em confiança, e confiança em vendas, mesmo quando você não está online.
                </p>
                <ul className="space-y-2 pt-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Como tornar o viajante seguro para comprar pela internet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Como construir uma presença profissional e confiável</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Como organizar conteúdo, anúncios e atendimento em um único sistema</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Como fazer sua estrutura trabalhar enquanto você foca nas vendas</span>
                  </li>
                </ul>
                <p className="text-sm font-medium text-primary pt-2">
                  Vou te dar uma máquina de vendas rodando todos os dias.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  </div>
</section>
```

---

## Resumo das Mudanças

| Item | Alteração |
|------|-----------|
| **Imports** | Adicionar `Bot`, `Key` |
| **Título** | "O que você vai **aprender**" com "aprender" em accent (cyan) |
| **Badge** | "CONTEÚDO EXCLUSIVO" em roxo |
| **Cards** | Novo design com ícones em círculos gradiente, badges de módulo, bullets com check cyan |
| **Conteúdo** | Novos textos conforme fornecido pelo usuário |
| **Cores** | Primary (roxo), Accent (cyan), checks em accent |

---

## Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/ProximoNivel.tsx` | **MODIFICAR** - Atualizar imports e redesenhar seção de módulos (linhas 5-24 e 343-438) |

