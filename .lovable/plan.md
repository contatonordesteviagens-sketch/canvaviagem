

# Plano: Reorganização de Pixels e Consolidação de Páginas

## Resumo das Mudanças

O plano aborda os seguintes problemas:

1. **Pixel 4254631328136179** - O pixel está instalado e deveria funcionar, mas verificaremos se os eventos estão sendo disparados corretamente
2. **Remover pixels de compra da PosPagamento** - Mover todos os eventos Purchase/Subscribe exclusivamente para a página Obrigado
3. **Transformar página Obrigado** - Clonar funcionalidade de coleta de dados (nome, email, telefone) da PosPagamento
4. **Corrigir página Auth** - Adicionar campos de nome e telefone para permitir login completo

---

## Mudança 1: Remover Eventos de Compra da PosPagamento

**Arquivo:** `src/pages/PosPagamento.tsx`

**Remover:**
- Linhas 7-8: Imports de `trackPurchase`, `trackSubscribe`, `trackESPurchase`, `trackESSubscribe`
- Linhas 12, 26: Estado `tracked` e `setTracked`
- Linhas 39-59: Todo o `useEffect` que dispara os eventos de conversão
- Linha 198: Componente `<SpanishPixel />`
- Linha 12: Import do `SpanishPixel`

**Resultado:** A página PosPagamento passa a ser APENAS para coleta de dados, sem tracking de conversão.

---

## Mudança 2: Transformar Página Obrigado em Clone da PosPagamento

**Arquivo:** `src/pages/Obrigado.tsx`

**Adicionar:**
- Formulário completo com Nome, Email e Telefone
- Lógica de envio de Magic Link (via email e WhatsApp)
- Estados de loading e sucesso
- Tracking de conversão apenas quando `source=checkout` (já existe)
- Import do `SpanishPixel` para pixel ES

**Nova estrutura:**
```text
┌──────────────────────────────────────────┐
│           PÁGINA OBRIGADO                │
├──────────────────────────────────────────┤
│  ✓ Pagamento Confirmado!                 │
│                                          │
│  [Campo Nome]                            │
│  [Campo Email] (preenchido se vindo URL) │
│  [Campo Telefone]                        │
│                                          │
│  [Enviar por Email]                      │
│  ── ou ──                                │
│  [Receber no WhatsApp]                   │
│                                          │
│  ── ou ──                                │
│  [Já tenho conta - Fazer Login]          │
│                                          │
│  Suporte WhatsApp                        │
└──────────────────────────────────────────┘
```

**Tracking mantido:**
- `trackPurchase(29.00, 'BRL')` - PT
- `trackSubscribe(29.00, 'BRL')` - PT
- `trackESPurchase(9.09, 'USD')` - ES
- `trackESSubscribe(9.09, 'USD')` - ES

---

## Mudança 3: Corrigir Página de Auth com Nome e Telefone

**Arquivo:** `src/pages/Auth.tsx`

**Adicionar:**
- Campo de Nome (opcional - apenas para novos cadastros)
- Campo de Telefone (opcional)
- Passar nome e telefone para a função `send-magic-link`

**Nova estrutura do formulário:**
```text
┌──────────────────────────────────────────┐
│          CANVA VIAGENS                   │
├──────────────────────────────────────────┤
│  Acesse com seu email (sem senha!)       │
│                                          │
│  [Campo Email]                           │
│  [Campo Nome] (opcional)                 │
│  [Campo Telefone] (opcional)             │
│                                          │
│  [Enviar Link de Acesso]                 │
│                                          │
│  ── ainda não tem conta? ──              │
│  [Ver Planos e Assinar]                  │
└──────────────────────────────────────────┘
```

---

## Mudança 4: Verificação do Pixel 4254631328136179

**Análise:** O pixel está corretamente instalado no `index.html`. O problema pode estar em:

1. **Condição `source=checkout`** - Se o Stripe não redireciona com esse parâmetro, os eventos não disparam
2. **Usuário bloqueando pixels** - Ad blockers

**Ação:** Adicionar log mais detalhado e garantir que os eventos disparem

**Arquivo:** `src/pages/Obrigado.tsx` - Adicionar console.log específico:
```typescript
console.log('[Meta Debug] Tracking for pixel 4254631328136179');
```

---

## Resumo Visual do Fluxo

```text
FLUXO ATUAL (PROBLEMÁTICO):
┌──────────┐     ┌──────────────────┐     ┌──────────┐
│ Checkout │ --> │  PosPagamento    │ --> │ Obrigado │
│ (Stripe) │     │  ⚠️ Dispara Pixel │     │ Simples  │
└──────────┘     └──────────────────┘     └──────────┘
                        ↓
                 [Usuário reenvia link]
                        ↓
                 ⚠️ Dispara pixel NOVAMENTE!


NOVO FLUXO (CORRIGIDO):
┌──────────┐     ┌──────────────────┐
│ Checkout │ --> │     Obrigado     │
│ (Stripe) │     │  ✅ Dispara Pixel │
└──────────┘     │  ✅ Coleta dados  │
                 │  ✅ Envia Magic   │
                 └──────────────────┘

                 ┌──────────────────┐
                 │  PosPagamento    │  (Ainda existe para links antigos)
                 │  ❌ Sem pixel     │
                 │  ✅ Coleta dados  │
                 └──────────────────┘

                 ┌──────────────────┐
                 │      Auth        │  (Login normal)
                 │  ❌ Sem pixel     │
                 │  ✅ Nome/Telefone │
                 └──────────────────┘
```

---

## Arquivos Afetados

| Arquivo | Tipo de Mudança |
|---------|-----------------|
| `src/pages/PosPagamento.tsx` | Remover tracking |
| `src/pages/Obrigado.tsx` | Reescrever (clone da PosPagamento + tracking) |
| `src/pages/Auth.tsx` | Adicionar campos nome e telefone |

---

## Detalhes Técnicos

### Sobre o Pixel 4254631328136179:
- O pixel está inicializado no `index.html` linha 23: `fbq('init', '4254631328136179');`
- Quando usamos `fbq('track', 'Purchase', ...)` sem `trackSingle`, o evento é enviado para TODOS os pixels inicializados
- Portanto, o evento DEVERIA estar disparando para os 3 pixels (PT) + 1 pixel (ES via SpanishPixel)

### Por que o pixel pode não estar marcando:
1. O usuário pode estar acessando `/obrigado` sem o parâmetro `?source=checkout`
2. O Stripe pode estar redirecionando para outra URL
3. Ad blockers podem estar bloqueando

### Solução:
- Consolidar TODO o tracking na página `/obrigado`
- Garantir que o Stripe redirecione com `?source=checkout`
- Adicionar logs detalhados para debug

