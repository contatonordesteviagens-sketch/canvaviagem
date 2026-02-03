

# Plano: Correção de Alertas de Segurança

## Resumo dos Problemas Identificados

O scanner de segurança identificou 3 alertas que precisam de atenção:

| Severidade | Problema | Tabela |
|------------|----------|--------|
| 🔴 Error | Emails de clientes podem ser expostos | `abandoned_checkouts` |
| 🔴 Error | Dados pessoais de clientes podem ser expostos | `profiles` |
| 🟡 Warning | Extensão instalada no schema `public` | `pg_net` |

---

## Problema 1: Tabela `abandoned_checkouts`

**Situação Atual:**
```
- "Admins can read abandoned checkouts" (PERMISSIVE para authenticated)
- "Block anonymous select" (PERMISSIVE para anon → false)
```

**Análise:** A política atual funciona tecnicamente, mas a estrutura é confusa. Cada role tem sua própria política PERMISSIVE. O `anon` role só pode acessar via sua política que retorna `false`, então está bloqueado. Porém, vou reforçar com uma política RESTRICTIVE para maior clareza e segurança.

**Solução:**
```sql
-- Adicionar política RESTRICTIVE para bloquear anon explicitamente
CREATE POLICY "Deny all anonymous access on abandoned_checkouts"
  ON public.abandoned_checkouts
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- Remover a política PERMISSIVE redundante
DROP POLICY IF EXISTS "Block anonymous select on abandoned_checkouts" ON public.abandoned_checkouts;
```

---

## Problema 2: Tabela `profiles`

**Situação Atual:**
```
- "Block anonymous access to profiles" (RESTRICTIVE para public → auth.uid() IS NOT NULL)
- "Block anonymous select on profiles" (PERMISSIVE para anon → false)
- Várias políticas para authenticated users
```

**Análise:** Já existe uma política RESTRICTIVE que bloqueia acesso anônimo. A política PERMISSIVE adicional para `anon` é redundante e pode causar confusão no scanner.

**Solução:**
```sql
-- Remover política redundante que confunde o scanner
DROP POLICY IF EXISTS "Block anonymous select on profiles" ON public.profiles;

-- A política RESTRICTIVE existente já cobre o bloqueio:
-- "Block anonymous access to profiles" → auth.uid() IS NOT NULL
```

---

## Problema 3: Extensão `pg_net` no Schema Public

**Situação Atual:**
A extensão `pg_net` está instalada no schema `public` em vez de um schema dedicado.

**Análise:** Este é um warning de boas práticas. A extensão deveria estar em um schema separado (ex: `extensions`) para isolamento, mas mover extensões existentes pode quebrar funcionalidades.

**Solução Recomendada:**
- Marcar como ignorado no scanner com justificativa
- A extensão `pg_net` é usada para chamadas HTTP em Edge Functions e foi instalada automaticamente pelo Lovable Cloud

---

## Resumo das Mudanças

| Tabela | Ação | Tipo |
|--------|------|------|
| `abandoned_checkouts` | Adicionar política RESTRICTIVE + remover redundante | SQL Migration |
| `profiles` | Remover política PERMISSIVE redundante | SQL Migration |
| `pg_net` extension | Ignorar alerta com justificativa | Update Finding |

---

## Script SQL Completo

```sql
-- 1. Reforçar bloqueio em abandoned_checkouts
CREATE POLICY "Deny all anonymous access on abandoned_checkouts"
  ON public.abandoned_checkouts
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block anonymous select on abandoned_checkouts" ON public.abandoned_checkouts;

-- 2. Limpar política redundante em profiles
DROP POLICY IF EXISTS "Block anonymous select on profiles" ON public.profiles;
```

---

## Notas Técnicas

**Por que usar RESTRICTIVE para bloqueio?**
- Políticas RESTRICTIVE são avaliadas com lógica AND
- Se qualquer política RESTRICTIVE retorna `false`, o acesso é negado
- Isso garante que mesmo se outras políticas forem adicionadas no futuro, o bloqueio permanece

**Por que remover as políticas PERMISSIVE de bloqueio?**
- Políticas PERMISSIVE com `USING (false)` para roles específicos funcionam, mas são confusas
- O scanner de segurança não consegue validar facilmente essa estrutura
- Manter apenas a abordagem RESTRICTIVE é mais clara e segura

