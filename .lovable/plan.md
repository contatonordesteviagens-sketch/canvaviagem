
# Plano: Recuperação de Compras Abandonadas e Pagamentos Recusados

## Visão Geral das Opções

Existem **3 cenários** de recuperação que podemos implementar:

| Cenário | Evento Stripe | Quando Acontece | Solução |
|---------|---------------|-----------------|---------|
| **Pagamento Recusado** | `invoice.payment_failed` | Cartão negado na renovação | ✅ Já implementado |
| **Carrinho Abandonado** | `checkout.session.expired` | Usuário saiu sem finalizar | ❌ Precisa implementar |
| **Checkout via Link Externo** | Stripe Payment Links | Você usa buy.stripe.com | ⚠️ Configuração no Stripe |

---

## Arquitetura da Solução

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUXO DE RECUPERAÇÃO                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. CHECKOUT ABANDONADO (checkout.session.expired)                          │
│     Usuario entra no checkout → Não finaliza → Stripe dispara evento        │
│     → Webhook recebe → Dispara email de recuperação com WhatsApp            │
│                                                                             │
│  2. PAGAMENTO RECUSADO (invoice.payment_failed) - JÁ IMPLEMENTADO           │
│     Renovação falha → Email já é enviado automaticamente                    │
│                                                                             │
│  3. STRIPE PAYMENT LINK (buy.stripe.com) - CONFIGURAÇÃO EXTERNA             │
│     Você pode habilitar recuperação diretamente no Dashboard do Stripe      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Habilitar Recuperação no Stripe Payment Link

Como você usa o link `buy.stripe.com/cNi28s2PEa2Q6aD9wU8so03`, o Stripe oferece recuperação nativa.

**No Dashboard do Stripe:**
1. Acesse **Settings → Checkout & Payment Links**
2. Ative **"Send a recovery email to customers who leave Checkout"**
3. O Stripe envia automaticamente email de recuperação

**Limitação:** O design do email é genérico do Stripe (não personalizado).

---

## 2. Implementar Webhook para Checkout Abandonado

Para ter **controle total** sobre o email de recuperação com a identidade Canva Viagem e incluir o WhatsApp:

### Alterações no stripe-webhook

**Arquivo:** `supabase/functions/stripe-webhook/index.ts`

**Adicionar novo handler:**

```typescript
case "checkout.session.expired":
  await handleCheckoutExpired(event.data.object, supabaseAdmin, resend);
  break;
```

**Nova função:**

```typescript
async function handleCheckoutExpired(session: Stripe.Checkout.Session, supabase: any, resend: any) {
  logStep("Processing checkout.session.expired", { sessionId: session.id });

  const email = session.customer_details?.email || session.customer_email;
  
  if (!email || !resend) {
    logStep("No email or Resend not configured, skipping recovery");
    return;
  }

  // Salvar tentativa abandonada no banco (para analytics)
  await supabase.from("abandoned_checkouts").insert({
    email,
    session_id: session.id,
    amount: session.amount_total,
    created_at: new Date().toISOString(),
  });

  // Enviar email de recuperação
  await sendRecoveryEmail(resend, email, session);
}
```

---

## 3. Template de Email de Recuperação

Design persuasivo com **WhatsApp** em destaque:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
      <p style="font-size: 40px; margin: 0;">🛒 💔</p>
      <h1 style="color: white; margin: 10px 0;">Você esqueceu algo...</h1>
    </div>
    
    <!-- Conteúdo -->
    <div style="padding: 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Oi! Percebemos que você estava prestes a desbloquear o arsenal completo 
        do <strong>Canva Viagens</strong>, mas algo interrompeu o processo.
      </p>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Acontece! Cartão deu problema? Precisou sair correndo? Estamos aqui para ajudar.
      </p>

      <!-- CTA Principal -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://buy.stripe.com/cNi28s2PEa2Q6aD9wU8so03" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          🚀 Finalizar Minha Compra
        </a>
      </div>

      <!-- WhatsApp -->
      <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 20px 0;">
        <p style="color: #166534; font-weight: bold; margin: 0 0 10px 0;">
          📞 Precisa de Ajuda?
        </p>
        <p style="color: #166534; margin: 0;">
          Fale diretamente com nossa equipe pelo WhatsApp:<br>
          <a href="https://wa.me/5585986411294" style="color: #22c55e; font-weight: bold; font-size: 18px;">
            (85) 9 8641-1294
          </a>
        </p>
      </div>

      <!-- Urgência -->
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          ⏰ Seu carrinho expira em breve. Não perca o acesso aos templates e robôs de IA!
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © 2025 Canva Viagens & Marketing.<br>
        Você recebeu este email porque iniciou uma compra.
      </p>
    </div>
    
  </div>
</body>
</html>
```

---

## 4. Criar Tabela de Analytics

Para rastrear carrinhos abandonados:

```sql
CREATE TABLE abandoned_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  session_id TEXT NOT NULL,
  amount INTEGER,
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE abandoned_checkouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read abandoned checkouts"
  ON abandoned_checkouts FOR SELECT USING (is_admin());
```

---

## 5. Habilitar Recuperação no create-checkout

Para checkouts internos, habilitar a recuperação automática do Stripe:

```typescript
const session = await stripe.checkout.sessions.create({
  // ... configs existentes ...
  
  // NOVO: Habilitar recuperação de carrinho abandonado
  after_expiration: {
    recovery: {
      enabled: true,
      allow_promotion_codes: true,
    },
  },
  consent_collection: {
    promotions: 'auto',
  },
  expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutos
});
```

---

## Resumo das Alterações

| Arquivo | Ação |
|---------|------|
| `supabase/functions/stripe-webhook/index.ts` | Adicionar handler `checkout.session.expired` |
| `supabase/functions/create-checkout/index.ts` | Habilitar `after_expiration.recovery` |
| Migração SQL | Criar tabela `abandoned_checkouts` |

---

## Configuração Recomendada no Stripe Dashboard

Para o **Payment Link** (`buy.stripe.com`):

1. Acesse **Stripe Dashboard → Settings → Checkout & Payment Links**
2. Ative: **"Abandoned cart recovery"**
3. Configure o tempo de espera (recomendo 1 hora)

Isso permite que o Stripe envie emails de recuperação nativos além dos nossos personalizados.

---

## Benefícios

| Antes | Depois |
|-------|--------|
| Sem recuperação de carrinhos | Email personalizado + WhatsApp |
| Sem dados de abandono | Dashboard com analytics |
| Apenas email de pagamento falho | Cobertura completa do funil |
| Design genérico Stripe | Identidade Canva Viagem |

