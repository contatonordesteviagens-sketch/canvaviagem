

# Plano: Integração dos Webhooks Zaia para Automação de Suporte via WhatsApp

## Objetivo

Disparar conversas automáticas da Zaia (IA no WhatsApp) quando ocorrerem os seguintes eventos:

| Webhook | Evento | Quando Dispara |
|---------|--------|----------------|
| `ZAIA_WEBHOOK_WELCOME` | Boas-vindas | Após pagamento confirmado (novo assinante) |
| `ZAIA_WEBHOOK_RECOVERY` | Recuperação de Carrinho | Checkout expirado (abandono) |
| `ZAIA_WEBHOOK_PAYMENT_FAILED` | Pagamento Falhou | Quando renovação falha |
| `ZAIA_WEBHOOK_CANCELLATION` | Cancelamento | Quando assinatura é cancelada |

---

## Como Funciona

Quando o evento ocorre no Stripe, o webhook `stripe-webhook` já processa e envia e-mail. Agora ele também vai disparar uma requisição HTTP para a Zaia, que inicia uma conversa automática no WhatsApp com o cliente.

---

## Alterações

### 1. Adicionar Segredos (4 URLs de Webhook)

| Nome do Segredo | Valor |
|-----------------|-------|
| `ZAIA_WEBHOOK_WELCOME` | `https://api.zaia.app/v1/webhook/agent-incoming-webhook-event/create?agentIncomingWebhookId=5557&key=77002eac-c569-4311-ab6f-781e59561fc8` |
| `ZAIA_WEBHOOK_RECOVERY` | `https://api.zaia.app/v1/webhook/agent-incoming-webhook-event/create?agentIncomingWebhookId=5558&key=71180ef4-54fb-4b41-9272-deb53194609c` |
| `ZAIA_WEBHOOK_PAYMENT_FAILED` | `https://api.zaia.app/v1/webhook/agent-incoming-webhook-event/create?agentIncomingWebhookId=5559&key=6b80870a-cd44-41db-87dc-a7051be4ca16` |
| `ZAIA_WEBHOOK_CANCELLATION` | `https://api.zaia.app/v1/webhook/agent-incoming-webhook-event/create?agentIncomingWebhookId=5560&key=a55cea2a-b1f1-4b58-b7c5-429ed63ef686` |

### 2. Modificar Edge Function `stripe-webhook`

**Arquivo:** `supabase/functions/stripe-webhook/index.ts`

**Adicionar função utilitária para chamar webhooks Zaia:**

```typescript
async function triggerZaiaWebhook(webhookEnvVar: string, data: { email: string; name?: string }) {
  const webhookUrl = Deno.env.get(webhookEnvVar);
  if (!webhookUrl) {
    logStep(`ZAIA webhook not configured: ${webhookEnvVar}`);
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        name: data.name || data.email.split("@")[0],
        // Zaia pode usar para personalizar a mensagem
      }),
    });
    logStep(`ZAIA webhook triggered: ${webhookEnvVar}`, { status: response.status });
  } catch (error) {
    logStep(`ERROR triggering ZAIA webhook: ${webhookEnvVar}`, { error: error.message });
  }
}
```

**Modificar handlers existentes para incluir chamada Zaia:**

| Handler | Webhook Zaia |
|---------|--------------|
| `handleCheckoutCompleted` | `ZAIA_WEBHOOK_WELCOME` |
| `handleCheckoutExpired` | `ZAIA_WEBHOOK_RECOVERY` |
| `handlePaymentFailed` | `ZAIA_WEBHOOK_PAYMENT_FAILED` |
| `handleSubscriptionDeleted` | `ZAIA_WEBHOOK_CANCELLATION` |

---

## Fluxo de Automação

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        FLUXO DE AUTOMAÇÃO ZAIA                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   EVENTO STRIPE              EMAIL RESEND              WHATSAPP ZAIA            │
│   ═══════════════            ════════════              ══════════════           │
│                                                                                 │
│   ┌───────────────┐         ┌──────────────┐         ┌───────────────┐         │
│   │ checkout.     │────────▶│ Welcome      │────────▶│ WEBHOOK       │         │
│   │ completed     │         │ Email        │         │ WELCOME       │         │
│   └───────────────┘         └──────────────┘         └───────────────┘         │
│                                                                                 │
│   ┌───────────────┐         ┌──────────────┐         ┌───────────────┐         │
│   │ checkout.     │────────▶│ Recovery     │────────▶│ WEBHOOK       │         │
│   │ expired       │         │ Email        │         │ RECOVERY      │         │
│   └───────────────┘         └──────────────┘         └───────────────┘         │
│                                                                                 │
│   ┌───────────────┐         ┌──────────────┐         ┌───────────────┐         │
│   │ invoice.      │────────▶│ Payment      │────────▶│ WEBHOOK       │         │
│   │ payment_failed│         │ Failed Email │         │ PAYMENT_FAILED│         │
│   └───────────────┘         └──────────────┘         └───────────────┘         │
│                                                                                 │
│   ┌───────────────┐         ┌──────────────┐         ┌───────────────┐         │
│   │ subscription. │────────▶│ Cancellation │────────▶│ WEBHOOK       │         │
│   │ deleted       │         │ Email        │         │ CANCELLATION  │         │
│   └───────────────┘         └──────────────┘         └───────────────┘         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Dados Enviados para Zaia

Cada webhook receberá um JSON com:

```json
{
  "email": "cliente@email.com",
  "name": "Nome do Cliente"
}
```

A Zaia usará o e-mail para buscar o número de WhatsApp cadastrado e iniciar a conversa.

---

## Pré-requisito

**Importante:** Para que a Zaia consiga enviar mensagem no WhatsApp, o cliente precisa ter o número de telefone associado ao e-mail na Zaia ou ter interagido previamente com o número (85) 9 8641-1294.

Se o cliente nunca conversou com o número, a Zaia não conseguirá iniciar a conversa (limitação do WhatsApp Business).

---

## Seção Técnica

### Estrutura da Função `triggerZaiaWebhook`

```typescript
async function triggerZaiaWebhook(
  webhookEnvVar: string, 
  data: { email: string; name?: string; phone?: string }
) {
  const webhookUrl = Deno.env.get(webhookEnvVar);
  if (!webhookUrl) {
    logStep(`ZAIA webhook not configured: ${webhookEnvVar}`);
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        name: data.name || data.email.split("@")[0],
        phone: data.phone, // opcional, se disponível
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logStep(`ZAIA webhook error: ${webhookEnvVar}`, { 
        status: response.status, 
        error: errorText 
      });
    } else {
      logStep(`ZAIA webhook success: ${webhookEnvVar}`, { 
        status: response.status 
      });
    }
  } catch (error) {
    logStep(`ERROR triggering ZAIA webhook: ${webhookEnvVar}`, { 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}
```

### Modificações nos Handlers

**handleCheckoutCompleted:**
```typescript
// Após enviar welcome email
await triggerZaiaWebhook("ZAIA_WEBHOOK_WELCOME", { email, name: customerName });
```

**handleCheckoutExpired:**
```typescript
// Após enviar recovery email
await triggerZaiaWebhook("ZAIA_WEBHOOK_RECOVERY", { email });
```

**handlePaymentFailed:**
```typescript
// Após enviar payment failed email
await triggerZaiaWebhook("ZAIA_WEBHOOK_PAYMENT_FAILED", { email: profile.email });
```

**handleSubscriptionDeleted:**
```typescript
// Após enviar cancellation email
await triggerZaiaWebhook("ZAIA_WEBHOOK_CANCELLATION", { email: profile.email });
```

### Segredos a Adicionar

```
ZAIA_WEBHOOK_WELCOME = https://api.zaia.app/v1/webhook/agent-incoming-webhook-event/create?agentIncomingWebhookId=5557&key=77002eac-c569-4311-ab6f-781e59561fc8

ZAIA_WEBHOOK_RECOVERY = https://api.zaia.app/v1/webhook/agent-incoming-webhook-event/create?agentIncomingWebhookId=5558&key=71180ef4-54fb-4b41-9272-deb53194609c

ZAIA_WEBHOOK_PAYMENT_FAILED = https://api.zaia.app/v1/webhook/agent-incoming-webhook-event/create?agentIncomingWebhookId=5559&key=6b80870a-cd44-41db-87dc-a7051be4ca16

ZAIA_WEBHOOK_CANCELLATION = https://api.zaia.app/v1/webhook/agent-incoming-webhook-event/create?agentIncomingWebhookId=5560&key=a55cea2a-b1f1-4b58-b7c5-429ed63ef686
```

