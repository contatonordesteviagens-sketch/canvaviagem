
# Plano: Corrigir Edge Function verify-magic-link

## Problema Identificado

O erro **"Tokens not found in link"** ocorre porque o método `generateLink` do Supabase Auth mudou seu comportamento. A URL retornada **não contém mais** `access_token` e `refresh_token` diretamente na hash.

### Causa Raiz

O código atual (linhas 146-151) tenta extrair tokens assim:

```typescript
const hashParams = new URL(linkData.properties.action_link).hash.substring(1);
const params = new URLSearchParams(hashParams);
const accessToken = params.get("access_token");  // null
const refreshToken = params.get("refresh_token"); // null
```

Isso não funciona porque o Supabase agora usa PKCE e retorna um `hashed_token` nas propriedades.

---

## Solucao

Usar `verifyOtp` com o `hashed_token` para gerar a sessao diretamente no servidor:

```typescript
// Gerar link de login
const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
  type: "magiclink",
  email: email,
});

// Extrair hashed_token das propriedades
const hashedToken = linkData?.properties?.hashed_token;

// Verificar OTP para criar sessao
const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
  token_hash: hashedToken,
  type: "email",
});

// sessionData contem { session: { access_token, refresh_token } }
```

---

## Alteracoes no Arquivo

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/verify-magic-link/index.ts` | Substituir extracao de URL hash por `verifyOtp` com `hashed_token` |

---

## Codigo Atualizado

```typescript
// Gerar link de login para o usuario (linhas 132-144)
const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
  type: "magiclink",
  email: email,
});

if (linkError || !linkData) {
  console.error("Error generating link:", linkError);
  return new Response(
    JSON.stringify({ error: "Erro ao gerar sessao" }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Extrair hashed_token das propriedades
const hashedToken = linkData.properties?.hashed_token;

if (!hashedToken) {
  console.error("Hashed token not found in link properties:", JSON.stringify(linkData.properties));
  return new Response(
    JSON.stringify({ error: "Erro ao processar autenticacao" }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Verificar OTP para criar sessao
const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
  token_hash: hashedToken,
  type: "email",
});

if (sessionError || !sessionData.session) {
  console.error("Error verifying OTP:", sessionError);
  return new Response(
    JSON.stringify({ error: "Erro ao criar sessao" }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

const accessToken = sessionData.session.access_token;
const refreshToken = sessionData.session.refresh_token;
```

---

## Secao Tecnica

### Por que isso aconteceu?

O Supabase Auth migrou para o fluxo PKCE (Proof Key for Code Exchange) para maior seguranca. O metodo antigo de extrair tokens diretamente da URL hash nao funciona mais.

### Novo Fluxo

```text
1. generateLink({type: "magiclink", email})
      |
      v
2. Retorna linkData.properties.hashed_token
      |
      v
3. verifyOtp({token_hash, type: "email"})
      |
      v
4. Retorna sessionData.session.access_token/refresh_token
      |
      v
5. Retorna tokens para o frontend
```

### Logs de Diagnostico Adicionados

```typescript
console.log("[VERIFY-MAGIC-LINK] Processing token verification");
console.log("[VERIFY-MAGIC-LINK] Hashed token obtained, verifying OTP...");
console.log("[VERIFY-MAGIC-LINK] Session created successfully for:", email);
```

---

## Resultado Esperado

- Magic Links funcionando corretamente
- Usuario sera autenticado ao clicar no link
- Sessao valida sera retornada para o frontend
- Logs detalhados para monitoramento

