

# Plano: Corrigir E-mails + Adicionar Nome do Usuário

## Diagnóstico do Problema de E-mail

Após análise dos logs, **os e-mails estão sendo enviados com sucesso**:
- Edge function retorna `{"success":true}` 
- Tabela `email_events` registra envios
- Tabela `magic_link_tokens` cria tokens

**Causa provável**: E-mails estão indo para **SPAM** ou há problema no Resend (limite atingido, domínio não verificado, etc).

**Recomendação**: Verificar no painel do Resend (resend.com) o status dos e-mails enviados e confirmar que o domínio `rochadigitalmidia.com.br` está verificado.

---

## Alterações a Implementar

### 1. Página Pós-Pagamento (`src/pages/PosPagamento.tsx`)

**Mudanças de texto:**
- Alterar "Acesso Imediato" → "Libere Seu Acesso"
- Alterar descrição → "Preencha abaixo e envie o e-mail para liberar automaticamente seu acesso"

**Adicionar campo de nome:**
- Novo input para nome do usuário antes do e-mail
- Enviar nome junto com e-mail para a edge function

### 2. Database Migration

**Adicionar coluna `name` na tabela `profiles`:**
```sql
ALTER TABLE profiles ADD COLUMN name TEXT;
```

### 3. Edge Function `send-magic-link`

**Alterações:**
- Receber `name` além de `email`
- Salvar nome na tabela `magic_link_tokens` (nova coluna)

### 4. Edge Function `verify-magic-link`

**Alterações:**
- Recuperar nome do token
- Salvar nome na tabela `profiles` ao criar/atualizar usuário

### 5. Tabela `magic_link_tokens`

**Adicionar coluna:**
```sql
ALTER TABLE magic_link_tokens ADD COLUMN name TEXT;
```

### 6. Header/Index - Saudação Personalizada

**Exibir "Olá, [Nome]" no Header:**
- Buscar nome do perfil do usuário logado
- Mostrar saudação no lugar de "Entrar" quando logado

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/PosPagamento.tsx` | Adicionar campo nome, alterar textos |
| `supabase/functions/send-magic-link/index.ts` | Receber e salvar nome |
| `supabase/functions/verify-magic-link/index.ts` | Salvar nome no perfil |
| `src/components/Header.tsx` | Exibir "Olá, [Nome]" |
| `src/contexts/AuthContext.tsx` | Buscar nome do perfil |
| Database | 2 migrations (profiles.name + magic_link_tokens.name) |

---

## Fluxo Após Implementação

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    NOVO FLUXO PÓS-PAGAMENTO                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   1. Usuário preenche:                                                  │
│      ┌─────────────────────────────────────────────┐                   │
│      │ Nome:  [João da Silva                    ]  │                   │
│      │ Email: [joao@email.com                   ]  │                   │
│      │ [    Liberar Meu Acesso    ]                │                   │
│      └─────────────────────────────────────────────┘                   │
│                                                                         │
│   2. Sistema salva nome + email no token                               │
│                                                                         │
│   3. Usuário clica no link do e-mail                                   │
│                                                                         │
│   4. Sistema cria/atualiza perfil COM o nome                           │
│                                                                         │
│   5. Na plataforma, Header exibe:                                      │
│      ┌──────────────────────────────────────────┐                      │
│      │  🏠 Canva Viagem         Olá, João! 👋   │                      │
│      └──────────────────────────────────────────┘                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Seção Técnica

### Migration 1: Adicionar coluna `name` em `profiles`
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
```

### Migration 2: Adicionar coluna `name` em `magic_link_tokens`
```sql
ALTER TABLE magic_link_tokens ADD COLUMN IF NOT EXISTS name TEXT;
```

### Código do PosPagamento (resumo das mudanças)
```tsx
// Novo state para nome
const [name, setName] = useState("");

// Novo input antes do email
<Input
  type="text"
  placeholder="Seu nome"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>

// Enviar nome na request
const { data, error } = await supabase.functions.invoke("send-magic-link", {
  body: { email: email.toLowerCase().trim(), name: name.trim() },
});
```

### Código do Header (exibir nome)
```tsx
// Buscar perfil com nome
const [userName, setUserName] = useState<string | null>(null);

useEffect(() => {
  if (user) {
    supabase
      .from("profiles")
      .select("name")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setUserName(data?.name));
  }
}, [user]);

// No JSX
{user ? (
  <span className="text-sm font-medium">
    Olá, {userName || user.email?.split("@")[0]}! 👋
  </span>
) : (
  <Link to="/auth">Entrar</Link>
)}
```

