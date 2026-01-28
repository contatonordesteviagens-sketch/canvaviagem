
# Plano: Corrigir Vulnerabilidades de Segurança do Banco de Dados

## Resumo dos Problemas

| Problema | Tabela/View | Severidade | Causa |
|----------|-------------|------------|-------|
| Emails expostos | `abandoned_checkouts` | Alto | Política SELECT permite role `public` |
| Dados de pagamento | `subscriptions` | Alto | Política SELECT permite role `public` |
| Dados de marketing | `traffic_sources` | Médio | Sem política SELECT para bloquear anônimos |
| View insegura | `marketing_stats` | Médio | Criada sem `security_invoker=on` |

---

## O que sera feito

### 1. Corrigir `abandoned_checkouts`

Alterar a política SELECT para aplicar apenas a usuários autenticados:

```sql
-- Remover política atual
DROP POLICY "Admins can read abandoned checkouts" ON public.abandoned_checkouts;

-- Criar nova política restrita a admins autenticados
CREATE POLICY "Admins can read abandoned checkouts" 
ON public.abandoned_checkouts 
FOR SELECT 
TO authenticated
USING (is_admin());
```

### 2. Corrigir `subscriptions`

Alterar as políticas SELECT para aplicar apenas a usuários autenticados:

```sql
-- Remover políticas atuais
DROP POLICY "Users can view their own subscription" ON public.subscriptions;
DROP POLICY "Admins can view all subscriptions" ON public.subscriptions;

-- Recriar com role authenticated apenas
CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions 
FOR SELECT 
TO authenticated
USING (is_admin());
```

### 3. Corrigir `traffic_sources`

Adicionar política que bloqueia SELECT para não-admins:

```sql
-- Bloquear SELECT para anônimos (já existe política para admins)
CREATE POLICY "Block anonymous select on traffic_sources"
ON public.traffic_sources
FOR SELECT
TO anon
USING (false);
```

### 4. Corrigir `marketing_stats` view

Recriar a view com `security_invoker=on` para respeitar RLS do usuário que faz a query:

```sql
-- Recriar view com security_invoker
DROP VIEW IF EXISTS public.marketing_stats;

CREATE VIEW public.marketing_stats 
WITH (security_invoker=on) AS
SELECT 
  COALESCE(ts.utm_source, 'Direto') AS source,
  COALESCE(ts.utm_medium, '-') AS medium,
  COALESCE(ts.utm_campaign, '-') AS campaign,
  count(DISTINCT ts.session_id) AS visitors,
  count(DISTINCT CASE WHEN ts.user_id IS NOT NULL THEN ts.user_id END) AS leads,
  count(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END) AS subscribers,
  COALESCE(sum(CASE WHEN s.status = 'active' THEN 9.90 ELSE 0 END), 0) AS revenue,
  CASE 
    WHEN count(DISTINCT ts.session_id) > 0 
    THEN round((count(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END)::numeric 
                / count(DISTINCT ts.session_id)::numeric) * 100, 2)
    ELSE 0 
  END AS conversion_rate
FROM traffic_sources ts
LEFT JOIN subscriptions s ON ts.user_id = s.user_id AND s.status = 'active'
GROUP BY ts.utm_source, ts.utm_medium, ts.utm_campaign
ORDER BY count(DISTINCT ts.session_id) DESC;
```

---

## Resultado Esperado

- Usuarios anonimos nao conseguem ler dados de nenhuma tabela sensivel
- Apenas admins autenticados podem ver `abandoned_checkouts`, `traffic_sources` e `marketing_stats`
- Usuarios autenticados so podem ver suas proprias assinaturas
- A view `marketing_stats` respeita RLS das tabelas subjacentes

---

## Arquivos a Modificar

| Tipo | Alteracao |
|------|-----------|
| Migracao SQL | Corrigir politicas RLS das 3 tabelas |
| Migracao SQL | Recriar view `marketing_stats` com `security_invoker=on` |

---

## Secao Tecnica

### Por que `roles: {public}` e um problema?

No PostgreSQL/Supabase, o role `public` inclui TODOS os usuarios, incluindo anonimos. Mesmo que a politica tenha `auth.uid() = user_id`, o scanner de seguranca alerta porque:

1. E uma ma pratica de seguranca permitir que roles anonimos tentem acessar dados sensiveis
2. Se houver um bug na funcao `auth.uid()`, dados podem vazar
3. Dificulta auditorias de seguranca

### O que e `security_invoker=on`?

Por padrao, views no PostgreSQL usam as permissoes do **criador** da view (geralmente `postgres` com acesso total). Com `security_invoker=on`, a view usa as permissoes do **usuario que faz a query**, respeitando RLS.

### Diagrama do Fluxo de Acesso Corrigido

```text
Usuario Anonimo
      |
      v
  [RLS Check]
      |
      +---> abandoned_checkouts: BLOQUEADO (TO authenticated)
      |
      +---> subscriptions: BLOQUEADO (TO authenticated)
      |
      +---> traffic_sources: BLOQUEADO (USING false para anon)
      |
      +---> marketing_stats: BLOQUEADO (security_invoker respeita RLS)

Usuario Autenticado (nao-admin)
      |
      v
  [RLS Check]
      |
      +---> abandoned_checkouts: BLOQUEADO (is_admin() = false)
      |
      +---> subscriptions: SO PROPRIOS DADOS (user_id = auth.uid())
      |
      +---> traffic_sources: BLOQUEADO (is_admin() = false)
      |
      +---> marketing_stats: BLOQUEADO (depende de traffic_sources/subscriptions)

Admin Autenticado
      |
      v
  [RLS Check]
      |
      +---> ACESSO TOTAL A TODOS OS DADOS
```
