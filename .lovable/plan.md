

# Plano: Corrigir Fluxo Pos-Pagamento com Pixels + WhatsApp Confiavel

## Resumo

Reverter para o fluxo com a pagina `/pos-pagamento` como destino apos pagamento, adicionar rastreamento de pixels **somente quando vem do checkout**, e implementar WhatsApp com link de acesso **pronto na mensagem** (100% confiavel, sem depender da Zaia).

---

## Problemas Identificados

| Problema | Causa |
|----------|-------|
| WhatsApp nao foi enviado automaticamente | O Payment Link do Stripe nao passa pelo Edge Function `create-checkout`. O webhook do Stripe deveria disparar, mas pode nao estar configurado corretamente no painel do Stripe |
| Pixels podem disparar em acessos manuais | A pagina `/pos-pagamento` dispara Purchase/Subscribe sempre que e aberta, sem verificar se veio do checkout |
| Zaia nao e 100% confiavel | Depende de resposta externa; usuario nao tem garantia de receber mensagem |

---

## Solucao

### 1. Redirecionar Payment Link para /pos-pagamento

**Acao no Stripe Dashboard:**
- Acessar Stripe > Payment Links
- Editar o link `https://buy.stripe.com/cNi28s2PEa2Q6aD9wU8so03`
- Alterar Success URL para: `https://canvaviagem.lovable.app/pos-pagamento?source=checkout`

### 2. Adicionar Pixels com Condicao (somente apos checkout)

**Arquivo:** `src/pages/PosPagamento.tsx`

Atualmente dispara sempre:
```typescript
useEffect(() => {
  trackPurchase(9.90, 'BRL');
  trackSubscribe(9.90, 'BRL', 9.90 * 12);
}, []);
```

Alterar para verificar `?source=checkout`:
```typescript
const [searchParams] = useSearchParams();
const sourceFromUrl = searchParams.get('source');
const [tracked, setTracked] = useState(false);

useEffect(() => {
  if (!tracked && sourceFromUrl === 'checkout') {
    console.log('[Meta Debug] Tracking conversion - source=checkout');
    trackPurchase(9.90, 'BRL');
    trackSubscribe(9.90, 'BRL', 9.90 * 12);
    setTracked(true);
  }
}, [tracked, sourceFromUrl]);
```

### 3. WhatsApp com Link de Acesso Pronto (100% Confiavel)

**Problema atual:** O botao "Receber no WhatsApp" chama a Zaia, que pode nao responder.

**Solucao:** Gerar o Magic Link localmente e abrir o WhatsApp com a mensagem ja pronta contendo o link de acesso.

**Fluxo novo:**
1. Usuario clica em "Receber no WhatsApp"
2. Sistema gera o Magic Link (via `send-magic-link`)
3. Abre o WhatsApp com mensagem pre-preenchida: "Ola, sou [nome] e meu link de acesso e: [magic-link]"
4. Usuario envia a mensagem para si mesmo ou para suporte
5. O link de acesso ja esta na mensagem - garantido funcionar

**Alteracao em `src/pages/PosPagamento.tsx`:**

```typescript
const handleWhatsAppAccess = async () => {
  // ... validacoes existentes ...

  setIsLoadingWhatsApp(true);

  try {
    // Gerar Magic Link via edge function existente
    const { data, error } = await supabase.functions.invoke("send-magic-link", {
      body: { 
        email: email.toLowerCase().trim(), 
        name: name.trim(),
        phone: cleanPhone(phone)
      },
    });

    if (error || !data?.success) {
      toast.error("Erro ao gerar link. Tente por email.");
      return;
    }

    // Buscar o token gerado para montar o link
    // Como send-magic-link ja envia email, vamos apenas abrir WhatsApp
    // com mensagem de suporte + instrucao
    const whatsappMessage = encodeURIComponent(
      `Ola! Sou ${name.trim()} e acabei de adquirir o Canva Viagem.\n\n` +
      `Meu email: ${email.toLowerCase().trim()}\n\n` +
      `Enviamos o link de acesso para seu email. Verifique sua caixa de entrada!`
    );
    const whatsappUrl = `https://wa.me/5585986411294?text=${whatsappMessage}`;
    
    window.open(whatsappUrl, "_blank");
    toast.success("Link enviado por email! WhatsApp aberto para suporte.");
    setMagicLinkSent(true);
  } catch (error) {
    toast.error("Erro ao processar.");
  } finally {
    setIsLoadingWhatsApp(false);
  }
};
```

**Alternativa mais robusta** (gerar link e incluir na mensagem do WhatsApp):

Para isso, precisamos criar uma nova Edge Function que retorna o Magic Link (em vez de so enviar email):

```typescript
// Nova Edge Function: generate-magic-link-url
// Retorna o link em vez de enviar email
// Assim o WhatsApp pode incluir o link diretamente
```

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/PosPagamento.tsx` | Adicionar condicao `source=checkout` para pixels; modificar WhatsApp para gerar link pronto |
| `supabase/functions/generate-magic-link-url/index.ts` | (Novo) Retorna o Magic Link URL sem enviar email |

---

## Fluxo Final

```text
USUARIO FAZ PAGAMENTO NO STRIPE (Payment Link)
           |
           v
STRIPE REDIRECIONA PARA:
  /pos-pagamento?source=checkout
           |
           v
[Pagina /pos-pagamento]
           |
           +---> Verifica source=checkout -> Dispara Meta Pixels (Purchase + Subscribe)
           |
           +---> Usuario preenche: Nome, Email, Telefone
           |
           +---> Botao "Enviar Link por Email" -> Envia Magic Link por email
           |     OU
           +---> Botao "Receber no WhatsApp" -> Gera Magic Link + Abre WhatsApp com link pronto
           |
           v
USUARIO CLICA NO LINK (email ou WhatsApp)
           |
           v
[/auth/verify?token=xxx]
           |
           v
ACESSO COMPLETO
```

---

## Secao Tecnica

### Nova Edge Function: generate-magic-link-url

```typescript
// supabase/functions/generate-magic-link-url/index.ts
// Gera token, salva no banco, retorna a URL (sem enviar email)
// Usado pelo WhatsApp para ter o link pronto na mensagem

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

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email e obrigatorio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const cleanPhone = phone ? phone.replace(/\D/g, '') : null;

    const { error: insertError } = await supabaseAdmin
      .from("magic_link_tokens")
      .insert({
        email: email.toLowerCase().trim(),
        token,
        expires_at: expiresAt.toISOString(),
        name: name?.trim() || null,
        phone: cleanPhone,
      });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Erro ao gerar link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseUrl = Deno.env.get("SITE_URL") || "https://canvaviagem.lovable.app";
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    return new Response(
      JSON.stringify({ success: true, magicLink }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Alteracao em PosPagamento.tsx - Pixel com Condicao

Linhas a modificar (atuais ~34-42):

```typescript
// ANTES:
useEffect(() => {
  console.log('[Meta Debug] window.fbq exists:', typeof window.fbq !== 'undefined');
  trackPurchase(9.90, 'BRL');
  trackSubscribe(9.90, 'BRL', 9.90 * 12);
  console.log('[Meta Debug] Purchase & Subscribe events dispatched (R$ 9,90)');
}, []);

// DEPOIS:
const sourceFromUrl = searchParams.get('source');
const [tracked, setTracked] = useState(false);

useEffect(() => {
  // Rastrear conversao SOMENTE quando vem do checkout
  if (!tracked && sourceFromUrl === 'checkout') {
    console.log('[Meta Debug] window.fbq exists:', typeof window.fbq !== 'undefined');
    console.log('[Meta Debug] source=checkout detected, tracking conversion');
    trackPurchase(9.90, 'BRL');
    trackSubscribe(9.90, 'BRL', 9.90 * 12);
    console.log('[Meta Debug] Purchase & Subscribe events dispatched (R$ 9,90)');
    setTracked(true);
  } else if (!sourceFromUrl || sourceFromUrl !== 'checkout') {
    console.log('[Meta Debug] No checkout source, skipping pixel tracking');
  }
}, [tracked, sourceFromUrl]);
```

### Alteracao em PosPagamento.tsx - WhatsApp com Link Pronto

Substituir a funcao `handleWhatsAppAccess` (linhas ~100-147):

```typescript
const handleWhatsAppAccess = async () => {
  if (!name.trim()) {
    toast.error("Por favor, insira seu nome.");
    return;
  }
  
  if (!email) {
    toast.error("Por favor, insira seu email.");
    return;
  }

  if (!phone) {
    toast.error("Por favor, insira seu WhatsApp.");
    return;
  }
  
  if (!isValidBRPhone(phone)) {
    toast.error("Telefone invalido. Use DDD + numero.");
    return;
  }

  setIsLoadingWhatsApp(true);

  try {
    // Gerar Magic Link URL diretamente (sem enviar email)
    const { data, error } = await supabase.functions.invoke("generate-magic-link-url", {
      body: { 
        email: email.toLowerCase().trim(), 
        name: name.trim(),
        phone: cleanPhone(phone)
      },
    });

    if (error || !data?.success || !data?.magicLink) {
      toast.error("Erro ao gerar link. Tente por email.");
      console.error("WhatsApp error:", error || data?.error);
      return;
    }

    // Abrir WhatsApp com o Magic Link ja na mensagem
    const whatsappMessage = encodeURIComponent(
      `Ola! Sou ${name.trim()} e acabei de adquirir o Canva Viagem!\n\n` +
      `Meu link de acesso:\n${data.magicLink}\n\n` +
      `Clique no link acima para entrar na plataforma!`
    );
    const whatsappUrl = `https://wa.me/${cleanPhone(phone)}?text=${whatsappMessage}`;
    
    window.open(whatsappUrl, "_blank");
    toast.success("WhatsApp aberto com seu link de acesso!");
    setMagicLinkSent(true);
  } catch (error) {
    console.error("Error generating WhatsApp link:", error);
    toast.error("Erro ao processar. Tente por email.");
  } finally {
    setIsLoadingWhatsApp(false);
  }
};
```

---

## Configuracao Necessaria no Stripe

Para que o fluxo funcione:

1. Acesse: `Stripe Dashboard > Payment Links`
2. Edite o link `cNi28s2PEa2Q6aD9wU8so03`
3. Em "After payment", configure:
   - **Redirect URL**: `https://canvaviagem.lovable.app/pos-pagamento?source=checkout`

---

## Beneficios

| Antes | Depois |
|-------|--------|
| WhatsApp dependia da Zaia responder | WhatsApp abre com link pronto na mensagem |
| Pixels disparavam em qualquer acesso | Pixels disparam apenas com `?source=checkout` |
| Conversao podia ser duplicada | Conversao rastreada uma unica vez |
| Usuario dependia de servico externo | Usuario tem controle total do link |

---

## Criterios de Aceitacao

- [ ] Pixels Purchase/Subscribe disparam somente com `?source=checkout`
- [ ] Botao "Receber no WhatsApp" gera Magic Link e abre WhatsApp com link pronto
- [ ] Usuario pode clicar no link do WhatsApp e acessar a plataforma
- [ ] Payment Link do Stripe redireciona para `/pos-pagamento?source=checkout`

