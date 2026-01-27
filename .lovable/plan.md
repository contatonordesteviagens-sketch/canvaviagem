

# Plano: Capturar Telefone + Integrar Zaia no Pós-Pagamento

## Resumo das Preferências

| Configuração | Escolha |
|-------------|---------|
| Telefone | Opcional |
| WhatsApp (Zaia) | Sob demanda (botão separado) |
| Formato telefone | Somente números BR (DDD + número) |
| Consentimento | Sem checkbox |

---

## Diagnóstico do Problema de E-mail

Os e-mails estão sendo enviados com sucesso (confirmado pelos logs). O problema é provavelmente:

1. **Spam/Filtros** - E-mails indo para pasta de spam
2. **Rate Limit** - Muitos envios para o mesmo e-mail em sequência
3. **Validação de domínio** - Verificar no Resend se o domínio está totalmente validado

**Ação recomendada:** Acessar [resend.com](https://resend.com) e verificar o status dos e-mails enviados + validação do domínio.

---

## Alterações a Implementar

### 1. Database Migrations

**Adicionar coluna `phone` em `magic_link_tokens`:**
```sql
ALTER TABLE magic_link_tokens ADD COLUMN IF NOT EXISTS phone TEXT;
```

**Adicionar coluna `phone` em `profiles`:**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
```

### 2. Página Pós-Pagamento (`src/pages/PosPagamento.tsx`)

**Adicionar:**
- Campo de telefone opcional (com máscara DDD + número)
- Validação formato BR (apenas números, 10-11 dígitos)
- Botão "Receber no WhatsApp" (separado do envio de e-mail)
- Estado para controlar se usuário quer WhatsApp

**Novo fluxo de formulário:**
```
┌─────────────────────────────────────────┐
│  Seu nome (obrigatório)                 │
│  [João da Silva                      ]  │
├─────────────────────────────────────────┤
│  Seu e-mail (obrigatório)               │
│  [joao@email.com                     ]  │
├─────────────────────────────────────────┤
│  WhatsApp (opcional)                    │
│  [(85) 98641-1294                    ]  │
├─────────────────────────────────────────┤
│  [📧 Enviar Link por E-mail]            │
│                                         │
│  ou                                     │
│                                         │
│  [📱 Receber no WhatsApp]               │
│  (Iniciar conversa com nossa IA)        │
└─────────────────────────────────────────┘
```

### 3. Edge Function `send-magic-link`

**Modificações:**
- Receber parâmetro `phone` (opcional)
- Salvar telefone na tabela `magic_link_tokens`
- Personalizar e-mail com nome do usuário

### 4. Nova Edge Function `trigger-zaia-welcome`

**Função dedicada para chamar Zaia sob demanda:**
- Recebe `email`, `name`, `phone`
- Chama webhook `ZAIA_WEBHOOK_WELCOME`
- Retorna sucesso para abrir WhatsApp

### 5. Edge Function `verify-magic-link`

**Modificações:**
- Recuperar telefone do token
- Salvar telefone no perfil do usuário

---

## Formato do Telefone BR

**Validação:**
- Aceitar apenas números
- Mínimo 10 dígitos (DDD + 8 dígitos fixo)
- Máximo 11 dígitos (DDD + 9 dígitos celular)
- Salvar no formato limpo: `8598641294` ou `85986411294`

**Máscara visual no input:**
```
(85) 98641-1294  →  salva como: 85986411294
```

---

## Fluxo "Sob Demanda" para Zaia

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE ACESSO PÓS-PAGAMENTO                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   OPÇÃO 1: E-mail (padrão)                                                 │
│   ════════════════════════                                                 │
│                                                                             │
│   [Usuário preenche nome + email]                                          │
│             │                                                               │
│             ▼                                                               │
│   [Clica "Enviar Link por E-mail"]                                         │
│             │                                                               │
│             ▼                                                               │
│   [Edge function envia e-mail via Resend]                                  │
│             │                                                               │
│             ▼                                                               │
│   [Usuário recebe e-mail e clica no link]                                  │
│                                                                             │
│                                                                             │
│   OPÇÃO 2: WhatsApp (sob demanda)                                          │
│   ════════════════════════════════                                          │
│                                                                             │
│   [Usuário preenche nome + email + telefone]                               │
│             │                                                               │
│             ▼                                                               │
│   [Clica "Receber no WhatsApp"]                                            │
│             │                                                               │
│             ▼                                                               │
│   [Edge function chama ZAIA_WEBHOOK_WELCOME]                               │
│             │                                                               │
│             ▼                                                               │
│   [Abre WhatsApp com link pré-preenchido]                                  │
│             │                                                               │
│             ▼                                                               │
│   [Zaia inicia conversa e envia link de acesso]                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Database | 2 migrations (phone em tokens + phone em profiles) |
| `src/pages/PosPagamento.tsx` | Adicionar campo telefone + botão WhatsApp |
| `supabase/functions/send-magic-link/index.ts` | Receber e salvar telefone |
| `supabase/functions/verify-magic-link/index.ts` | Salvar telefone no perfil |
| Nova: `supabase/functions/trigger-zaia-welcome/index.ts` | Chamar Zaia sob demanda |

---

## Texto do Botão WhatsApp

```
📱 Receber no WhatsApp
Fale com nossa IA e receba o link de acesso
```

Ao clicar, o sistema:
1. Salva nome + email + telefone no banco
2. Chama API da Zaia com os dados
3. Abre link do WhatsApp: `https://wa.me/5585986411294?text=Olá, sou {nome} e quero meu acesso!`

---

## Seção Técnica

### Máscara de Telefone (helper function)

```typescript
const formatPhoneBR = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica máscara
  if (limited.length <= 2) return `(${limited}`;
  if (limited.length <= 7) return `(${limited.slice(0,2)}) ${limited.slice(2)}`;
  if (limited.length <= 11) return `(${limited.slice(0,2)}) ${limited.slice(2,7)}-${limited.slice(7)}`;
  
  return `(${limited.slice(0,2)}) ${limited.slice(2,7)}-${limited.slice(7,11)}`;
};

const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

const isValidBRPhone = (phone: string): boolean => {
  const clean = cleanPhone(phone);
  return clean.length >= 10 && clean.length <= 11;
};
```

### Nova Edge Function `trigger-zaia-welcome`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, phone } = await req.json();

    if (!email || !phone) {
      return new Response(
        JSON.stringify({ error: "Email e telefone são obrigatórios para WhatsApp" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const webhookUrl = Deno.env.get("ZAIA_WEBHOOK_WELCOME");
    
    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: "Webhook não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Chamar Zaia
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name: name || email.split("@")[0],
        phone,
        timestamp: new Date().toISOString(),
      }),
    });

    const responseText = await response.text();
    
    console.log("[ZAIA-WELCOME] Response:", response.status, responseText);

    // Salvar dados no banco para referência
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabaseAdmin
      .from("magic_link_tokens")
      .insert({
        email: email.toLowerCase().trim(),
        token: crypto.randomUUID(), // token placeholder
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        name: name?.trim() || null,
        phone: phone.replace(/\D/g, ''),
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "WhatsApp acionado com sucesso",
        whatsappUrl: `https://wa.me/5585986411294?text=${encodeURIComponent(`Olá, sou ${name || 'cliente'} e quero meu acesso ao Canva Viagem!`)}`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in trigger-zaia-welcome:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Modificação do PosPagamento (resumo)

```tsx
// Novos states
const [phone, setPhone] = useState("");
const [isLoadingWhatsApp, setIsLoadingWhatsApp] = useState(false);

// Função para WhatsApp
const handleWhatsAppAccess = async () => {
  if (!name.trim() || !email || !phone) {
    toast.error("Preencha nome, e-mail e telefone para WhatsApp.");
    return;
  }
  
  if (!isValidBRPhone(phone)) {
    toast.error("Telefone inválido. Use DDD + número.");
    return;
  }

  setIsLoadingWhatsApp(true);

  try {
    const { data, error } = await supabase.functions.invoke("trigger-zaia-welcome", {
      body: { 
        email: email.toLowerCase().trim(), 
        name: name.trim(),
        phone: cleanPhone(phone)
      },
    });

    if (error || !data?.success) {
      toast.error("Erro ao acionar WhatsApp.");
      return;
    }

    // Abrir WhatsApp
    window.open(data.whatsappUrl, "_blank");
    toast.success("WhatsApp aberto! Aguarde a mensagem.");
  } catch (error) {
    toast.error("Erro ao processar.");
  } finally {
    setIsLoadingWhatsApp(false);
  }
};
```

### Config.toml (nova função)

```toml
[functions.trigger-zaia-welcome]
verify_jwt = false
```

