

# Plano: Corrigir Entregabilidade de E-mails + Configurar SITE_URL

## Diagnóstico

Os e-mails **estão sendo enviados com sucesso** (confirmado pelos logs). O problema é de **entregabilidade**:

| Item | Atual | Problema |
|------|-------|----------|
| Remetente | `lucas@rochadigitalmidia.com.br` | ✅ Domínio verificado |
| Link no e-mail | `canvaviagem.lovable.app` | ⚠️ Domínio diferente |
| Resultado | E-mails vão para spam | Incompatibilidade de domínios |

O Resend alertou exatamente isso: "URLs incompatíveis podem acionar filtros de spam"

---

## Solução

### 1. Adicionar Segredo `SITE_URL`

Adicionar a variável de ambiente `SITE_URL` para garantir que o link correto seja usado:

```
SITE_URL = https://canvaviagem.lovable.app
```

### 2. Atualizar Edge Function `send-magic-link`

Modificar para usar o domínio correto e adicionar logs de diagnóstico:

**Alterações:**
- Adicionar log do URL base usado
- Melhorar tratamento de erros
- Adicionar verificação de limites

### 3. Recomendação (Opcional mas Ideal)

Para máxima entregabilidade, o ideal seria:

**Opção A - Verificar novo domínio no Resend:**
- Adicionar `canvaviagem.com` (ou subdomínio) no Resend
- Usar remetente `noreply@canvaviagem.com`

**Opção B - Usar domínio existente no link:**
- Se você tiver `rochadigitalmidia.com.br` apontando para o app
- Configurar redirect para o Lovable app

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Segredo `SITE_URL` | Adicionar (https://canvaviagem.lovable.app) |
| `supabase/functions/send-magic-link/index.ts` | Adicionar logs + melhorar tratamento |

---

## Código Atualizado

### Edge Function `send-magic-link`

```typescript
// Adicionar no início do try block
console.log("[MAGIC-LINK] Request received for:", email);

// Alterar a criação do link para logar o URL usado
const baseUrl = Deno.env.get("SITE_URL") || "https://canvaviagem.lovable.app";
console.log("[MAGIC-LINK] Using base URL:", baseUrl);
const magicLink = `${baseUrl}/auth/verify?token=${token}`;

// Melhorar log de erro
if (emailResponse.error) {
  console.error("[MAGIC-LINK] Resend error details:", JSON.stringify(emailResponse.error));
  return new Response(
    JSON.stringify({ error: "Erro ao enviar email. Tente novamente." }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

---

## Passos para Verificar Entrega

1. **Verifique o Resend Dashboard:**
   - Acesse [resend.com](https://resend.com)
   - Vá em "Logs" ou "Activity"
   - Veja o status do último e-mail enviado

2. **Verifique a Pasta Spam:**
   - Os e-mails podem estar chegando, mas na pasta de spam
   - Marque como "Não é spam" para treinar o filtro

3. **Verificação de Domínio:**
   - Em "Domains" no Resend, confirme que `rochadigitalmidia.com.br` está totalmente verificado (SPF, DKIM, DMARC)

---

## Seção Técnica

### Logs Adicionais

```typescript
// No início da função
console.log("[MAGIC-LINK] Processing request:", { 
  email: email.substring(0, 5) + "***", // Parcialmente mascarado por segurança
  hasName: !!name,
  hasPhone: !!phone 
});

// Após inserir token
console.log("[MAGIC-LINK] Token created:", { tokenId: token.substring(0, 8) + "..." });

// Antes de enviar email
console.log("[MAGIC-LINK] Sending email to:", email);
console.log("[MAGIC-LINK] Magic link URL:", magicLink.replace(token, "TOKEN_MASKED"));

// Após sucesso
console.log("[MAGIC-LINK] Email sent successfully:", {
  emailId: emailResponse.data?.id,
  recipient: email
});
```

### Verificar Status no Resend

Os possíveis status são:
- `sent` - Email foi aceito pelo servidor
- `delivered` - Email foi entregue na caixa de entrada
- `bounced` - Email foi rejeitado
- `complained` - Marcado como spam pelo destinatário

