
# Plano: Correcoes no Fluxo de Pagamento e Integracao WhatsApp

## Resumo das Alteracoes

Implementar as correcoes documentadas para melhorar a experiencia pos-pagamento, garantindo que:
1. O telefone seja extraido do Stripe e salvo no perfil
2. O usuario seja redirecionado para `/pos-pagamento` com email/nome pre-preenchidos
3. A integracao com Zaia receba o telefone para automacao WhatsApp

---

## Alteracoes Identificadas

### 1. `supabase/functions/stripe-webhook/index.ts`

**Problema atual:** 
- A funcao `triggerZaiaWebhook` nao aceita telefone
- O telefone do cliente nao esta sendo extraido de `session.customer_details?.phone`
- O telefone nao esta sendo salvo no perfil

**Correcoes:**

| Local | Alteracao |
|-------|-----------|
| Linha 47-49 | Atualizar assinatura da funcao para aceitar `phone?: string` |
| Linha 61-66 | Incluir telefone no payload do webhook (se disponivel) |
| Linha 197-285 | Modificar `handleCheckoutCompleted` para extrair e salvar telefone |

**Codigo atualizado para `triggerZaiaWebhook`:**
```typescript
async function triggerZaiaWebhook(
  webhookEnvVar: string, 
  data: { email: string; name?: string; phone?: string }  // Adicionar phone
) {
  // ...
  body: JSON.stringify({
    email: data.email,
    name: data.name || data.email.split("@")[0],
    phone: data.phone || undefined,  // Incluir se disponivel
    timestamp: new Date().toISOString(),
  }),
  // ...
}
```

**Codigo atualizado para `handleCheckoutCompleted`:**
```typescript
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any, resend: any) {
  // ... codigo existente ...
  
  // NOVO: Extrair telefone do customer_details
  const customerPhone = session.customer_details?.phone || null;
  const cleanedPhone = customerPhone ? customerPhone.replace(/\D/g, '') : null;
  
  logStep("Checkout details", { 
    email: redactEmail(email), 
    stripeCustomerId, 
    stripeSubscriptionId,
    hasPhone: !!cleanedPhone  // Log se tem telefone
  });

  // ... codigo existente de criar usuario ...

  // ATUALIZADO: Incluir telefone no upsert do perfil
  const profileData: Record<string, any> = {
    user_id: userId,
    email,
    name: customerName,
    stripe_customer_id: stripeCustomerId,
    updated_at: new Date().toISOString(),
  };
  
  if (cleanedPhone) {
    profileData.phone = cleanedPhone;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profileData, { onConflict: "user_id" });

  // ... codigo existente ...

  // ATUALIZADO: Passar telefone para Zaia
  await triggerZaiaWebhook("ZAIA_WEBHOOK_WELCOME", { 
    email, 
    name: customerName,
    phone: cleanedPhone || undefined
  });
}
```

---

### 2. `supabase/functions/create-checkout/index.ts`

**Problema atual:**
- Linha 93: Redireciona para `/obrigado` (pagina estatica)
- Nao passa email/nome como parametros na URL

**Correcoes:**

| Local | Alteracao |
|-------|-----------|
| Linha 81-94 | Mudar `success_url` de `/obrigado` para `/pos-pagamento?email=...&name=...` |

**Codigo atualizado:**
```typescript
const origin = req.headers.get("origin") || "https://lovable.dev";

// Obter nome do usuario com fallbacks
const userName = user.user_metadata?.name || 
                 user.user_metadata?.full_name || 
                 user.email?.split('@')[0] || 
                 'usuario';

const session = await stripe.checkout.sessions.create({
  customer: customerId,
  customer_email: customerId ? undefined : user.email,
  line_items: [
    {
      price: PRICE_ID,
      quantity: 1,
    },
  ],
  mode: "subscription",
  // CORRIGIDO: Redirecionar para pos-pagamento com email/nome pre-preenchidos
  success_url: `${origin}/pos-pagamento?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(userName)}`,
  cancel_url: `${origin}/planos?canceled=true`,
  // ... resto do codigo ...
});
```

---

## Arquivos a Modificar

| Arquivo | Tipo | Alteracoes |
|---------|------|------------|
| `supabase/functions/stripe-webhook/index.ts` | Modificar | Extracao de telefone + Zaia helper |
| `supabase/functions/create-checkout/index.ts` | Modificar | URL de redirecionamento |

---

## Fluxo Atualizado

```text
USUARIO FAZ PAGAMENTO NO STRIPE
           |
           v
[checkout.session.completed]
           |
           +---> Extrai email, nome, TELEFONE
           |
           +---> Cria/atualiza usuario no Supabase
           |
           +---> Salva telefone no profiles (se disponivel)
           |
           +---> Dispara Zaia webhook com phone
           |
           v
REDIRECIONA PARA:
  /pos-pagamento?email=usuario@email.com&name=Nome
           |
           v
[PosPagamento.tsx]
           |
           +---> Email/nome pre-preenchidos via URL params
           |
           +---> Usuario escolhe: Magic Link ou WhatsApp
           |
           v
ACESSO LIBERADO
```

---

## Secao Tecnica

### Tipo da Sessao Stripe (customer_details)

A estrutura `session.customer_details` inclui:
```typescript
customer_details: {
  email: string | null;
  name: string | null;
  phone: string | null;  // <- Novo campo utilizado
  address: { ... };
}
```

### Limpeza do Telefone

O telefone vem do Stripe em formatos variados (ex: `+55 85 98641-1294`).
A limpeza remove todos os caracteres nao-numericos:

```typescript
const cleanedPhone = customerPhone 
  ? customerPhone.replace(/\D/g, '') 
  : null;
// Resultado: "5585986411294"
```

### Encoding de URL

Caracteres especiais no nome sao tratados com `encodeURIComponent`:
```typescript
// Nome: "João Silva"
// URL: /pos-pagamento?email=...&name=Jo%C3%A3o%20Silva
```

---

## Criterios de Aceitacao

- [ ] Telefone extraido de `session.customer_details?.phone`
- [ ] Telefone limpo (apenas digitos) salvo na tabela `profiles`
- [ ] Webhook Zaia recebe telefone no payload (quando disponivel)
- [ ] `success_url` redireciona para `/pos-pagamento`
- [ ] Email e nome pre-preenchidos na pagina pos-pagamento
- [ ] Caracteres especiais no nome nao quebram a URL
- [ ] Log inclui `hasPhone: true/false` para debug

---

## Compatibilidade

As alteracoes sao retrocompativeis:
- Se o telefone nao estiver disponivel no Stripe, o sistema continua funcionando
- O campo `phone` na tabela `profiles` ja existe e aceita NULL
- A pagina `/pos-pagamento` ja trata parametros de URL opcionais
