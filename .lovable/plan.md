

# Plano: Configurar SITE_URL e Atualizar Edge Function

## Resumo

Configurar o segredo `SITE_URL` com o valor `https://canvaviagem.com` para que os links de acesso nos e-mails usem seu domínio personalizado, melhorando a entregabilidade.

---

## O que será feito

### 1. Adicionar Segredo SITE_URL

| Campo | Valor |
|-------|-------|
| Nome | `SITE_URL` |
| Valor | `https://canvaviagem.com` |

Este segredo será usado pela Edge Function para gerar links como:
```
https://canvaviagem.com/auth/verify?token=abc123...
```

### 2. Atualizar Edge Function `send-magic-link`

Adicionar logs de diagnóstico para monitorar o envio:

```typescript
// Log do URL base usado
console.log("[MAGIC-LINK] Using base URL:", baseUrl);

// Log detalhado em caso de erro
console.error("[MAGIC-LINK] Resend error details:", JSON.stringify(emailResponse.error));
```

---

## Resultado Esperado

- Links nos e-mails usarão `canvaviagem.com` (seu domínio)
- Compatibilidade entre remetente e links
- Menos chance de cair no spam
- Logs detalhados para diagnóstico

---

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Segredo `SITE_URL` | Criar com valor `https://canvaviagem.com` |
| `supabase/functions/send-magic-link/index.ts` | Adicionar logs de diagnóstico |

---

## Seção Técnica

### Alterações na Edge Function

A função já usa `Deno.env.get("SITE_URL")` com fallback. Vamos adicionar logs para facilitar debug:

```typescript
// Após receber request
console.log("[MAGIC-LINK] Processing request:", { 
  email: email.substring(0, 5) + "***",
  hasName: !!name,
  hasPhone: !!phone 
});

// Após gerar link
console.log("[MAGIC-LINK] Using base URL:", baseUrl);
console.log("[MAGIC-LINK] Magic link generated");

// Em caso de erro do Resend
console.error("[MAGIC-LINK] Resend error details:", JSON.stringify(emailResponse.error));
```

