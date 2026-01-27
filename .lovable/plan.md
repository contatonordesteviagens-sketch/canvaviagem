
# Plano: Magic Link Personalizado via Resend

## Objetivo
Substituir o email de Magic Link padrão do sistema por um email personalizado enviado via Resend, com o design da marca Canva Viagem.

---

## Arquitetura da Solucao

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUXO ATUAL (Problema)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Usuario → Solicita Magic Link → Sistema envia email generico → Usuario    │
│                                  (sem personalizacao)                       │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUXO NOVO (Solucao)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Usuario → Solicita Magic Link → Edge Function gera token                   │
│                                → Salva token no banco                       │
│                                → Envia email via Resend (template custom)   │
│                                                                             │
│  Usuario clica no link → Edge Function valida token                         │
│                        → Gera sessao de autenticacao                        │
│                        → Redireciona para o app                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Criar Tabela de Tokens

**Migracao SQL**

```sql
CREATE TABLE magic_link_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indice para busca rapida por token
CREATE INDEX idx_magic_link_tokens_token ON magic_link_tokens(token);

-- RLS: Apenas o sistema pode acessar
ALTER TABLE magic_link_tokens ENABLE ROW LEVEL SECURITY;
```

---

## 2. Edge Function: send-magic-link

**Arquivo: `supabase/functions/send-magic-link/index.ts`**

Funcionalidades:
- Recebe o email do usuario
- Gera um token unico (UUID + hash)
- Salva o token no banco com expiracao de 1 hora
- Envia email via Resend com template personalizado

```typescript
// Pseudocodigo
const token = crypto.randomUUID();
const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

// Salvar no banco
await supabase.from("magic_link_tokens").insert({
  email,
  token,
  expires_at: expiresAt,
});

// Criar link
const magicLink = `https://canvaviagem.lovable.app/auth/verify?token=${token}`;

// Enviar via Resend com template personalizado
await resend.emails.send({
  from: "Canva Viagem <lucas@rochadigitalmidia.com.br>",
  to: email,
  subject: "Seu Link de Acesso - Canva Viagem",
  html: templateHTML, // Template personalizado
});
```

---

## 3. Edge Function: verify-magic-link

**Arquivo: `supabase/functions/verify-magic-link/index.ts`**

Funcionalidades:
- Recebe o token via URL
- Valida se o token existe e nao expirou
- Marca o token como usado
- Cria ou atualiza o usuario no auth.users
- Retorna um token de sessao valido

```typescript
// Pseudocodigo
const { data: tokenData } = await supabase
  .from("magic_link_tokens")
  .select("*")
  .eq("token", token)
  .single();

if (!tokenData || tokenData.expires_at < new Date() || tokenData.used_at) {
  return { error: "Token invalido ou expirado" };
}

// Marcar como usado
await supabase.from("magic_link_tokens").update({ used_at: new Date() });

// Gerar sessao para o usuario usando Admin API
const { data: { user, session } } = await supabaseAdmin.auth.admin.generateLink({
  type: 'magiclink',
  email: tokenData.email,
});
```

---

## 4. Template de Email Personalizado

Design baseado na identidade Canva Viagem:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 16px;
      padding: 40px;
    }
    .logo { text-align: center; margin-bottom: 30px; }
    .button { 
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="logo-canva-viagem.png" alt="Canva Viagem" width="150">
    </div>
    <h1>Seu Link de Acesso</h1>
    <p>Clique no botao abaixo para acessar sua conta:</p>
    <p style="text-align: center;">
      <a href="{{MAGIC_LINK}}" class="button">Acessar Minha Conta</a>
    </p>
    <p><small>Este link expira em 1 hora.</small></p>
  </div>
</body>
</html>
```

---

## 5. Atualizar Pagina pos-pagamento

**Arquivo: `src/pages/PosPagamento.tsx`**

Alterar para chamar a nova Edge Function em vez do `signInWithOtp`:

```typescript
// ANTES
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: `${window.location.origin}/` },
});

// DEPOIS
const { data, error } = await supabase.functions.invoke("send-magic-link", {
  body: { email },
});
```

---

## 6. Criar Pagina de Verificacao

**Arquivo: `src/pages/AuthVerify.tsx` (NOVO)**

Pagina que recebe o token e autentica o usuario:

```typescript
// Extrair token da URL
const token = searchParams.get("token");

// Verificar token via Edge Function
const { data, error } = await supabase.functions.invoke("verify-magic-link", {
  body: { token },
});

if (data.session) {
  // Setar sessao no Supabase client
  await supabase.auth.setSession(data.session);
  navigate("/"); // Redirecionar para home
} else {
  // Mostrar erro
}
```

---

## 7. Adicionar Rota

**Arquivo: `src/App.tsx`**

```typescript
<Route path="/auth/verify" element={<AuthVerify />} />
```

---

## Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/functions/send-magic-link/index.ts` | CRIAR |
| `supabase/functions/verify-magic-link/index.ts` | CRIAR |
| `src/pages/PosPagamento.tsx` | ATUALIZAR |
| `src/pages/AuthVerify.tsx` | CRIAR |
| `src/pages/Auth.tsx` | ATUALIZAR (usar novo fluxo) |
| `src/App.tsx` | ATUALIZAR (adicionar rota) |
| Migracao SQL | CRIAR tabela magic_link_tokens |

---

## Beneficios

| Antes | Depois |
|-------|--------|
| Email generico do sistema | Email com design Canva Viagem |
| Remetente: no-reply@auth.lovable.cloud | Remetente: lucas@rochadigitalmidia.com.br |
| Sem controle sobre o conteudo | Controle total do HTML/CSS |
| Nao rastreia aberturas | Rastreia via Resend (opens/clicks) |

---

## Seguranca

- Tokens tem expiracao de 1 hora
- Tokens sao marcados como usados apos primeiro uso
- Validacao server-side via Edge Function
- Uso de Service Role Key apenas no backend
