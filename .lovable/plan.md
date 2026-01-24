

# Plano: Correção de Segurança RLS - Profiles e Subscriptions

## Situação Atual

Após análise detalhada, as políticas RLS atuais já são **restritivas**:

| Tabela | Política SELECT | Status |
|--------|-----------------|--------|
| `profiles` | `auth.uid() = user_id` | ✅ Correto |
| `subscriptions` | `auth.uid() = user_id` | ✅ Correto |

**Porém**, o painel administrativo (`UsersSection.tsx`) usa o hook `useActiveUsers` que precisa listar todos os usuários e assinaturas - e isso **não funciona** porque não há política de admin.

## Problema Identificado

O hook `useActiveUsers.ts` tenta:
1. Buscar **todas** as subscriptions → Bloqueado pelo RLS (só retorna a do próprio usuário)
2. Buscar **todos** os profiles → Bloqueado pelo RLS (só retorna o próprio perfil)

**Resultado**: O painel de usuários do admin provavelmente está vazio ou só mostra o próprio admin.

## Solução Proposta

Adicionar políticas de **leitura somente para admins** nas tabelas sensíveis, usando a função `is_admin()` que já existe e é SECURITY DEFINER:

### Migration SQL

```sql
-- ============================================
-- POLÍTICAS DE ADMIN PARA PROFILES
-- ============================================

-- Adicionar política para admins verem todos os profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin());

-- ============================================
-- POLÍTICAS DE ADMIN PARA SUBSCRIPTIONS
-- ============================================

-- Adicionar política para admins verem todas as subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (is_admin());
```

## Resultado Final das Políticas

### Tabela `profiles`:
| Política | Comando | Quem pode |
|----------|---------|-----------|
| `Users can view their own profile` | SELECT | Próprio usuário |
| `Admins can view all profiles` | SELECT | Admins |
| `Users can insert their own profile` | INSERT | Próprio usuário |
| `Users can update their own profile` | UPDATE | Próprio usuário |
| `Block anonymous access to profiles` | ALL | Bloqueia anônimos |

### Tabela `subscriptions`:
| Política | Comando | Quem pode |
|----------|---------|-----------|
| `Users can view their own subscription` | SELECT | Próprio usuário |
| `Admins can view all subscriptions` | SELECT | Admins |
| `Block direct subscription inserts` | INSERT | Ninguém (via webhook) |
| `Block direct subscription updates` | UPDATE | Ninguém (via webhook) |
| `Block direct subscription deletes` | DELETE | Ninguém (via webhook) |

## Segurança Mantida

1. **Usuários normais**: Só veem seus próprios dados ✅
2. **Usuários anônimos**: Bloqueados completamente ✅
3. **Admins**: Podem ver tudo (necessário para gestão) ✅
4. **Função is_admin()**: Já é SECURITY DEFINER e valida `auth.uid() IS NOT NULL` ✅

## Verificação Pós-Implementação

Após a migration, executar:
```sql
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'subscriptions');
```

Isso confirmará que as políticas estão corretas e o painel admin voltará a funcionar.

