
# Plano: Hardening de Seguranca para Tabelas com PII

## Contexto do Problema

Os alertas de seguranca apontam dois riscos principais:

| Tabela | Dados Sensiveis | Risco |
|--------|----------------|-------|
| `abandoned_checkouts` | email, amount, recovered | Harvesting de emails, phishing direcionado |
| `profiles` | email, phone, name, stripe_customer_id | Roubo de dados de clientes, fraude |

**Situacao Atual:**
- Admins podem ler TODOS os registros via `is_admin()`
- Emails armazenados em texto plano
- Nenhum audit log para acesso a dados sensiveis
- Se credenciais admin forem comprometidas, atacante tem acesso total

---

## Solucao Proposta: Defesa em Profundidade

### 1. Criar Views com Mascaramento de Email

Em vez de expor emails completos, criar views que mascararem dados sensiveis:

```sql
-- View mascarada para abandoned_checkouts
CREATE VIEW public.abandoned_checkouts_masked
WITH (security_invoker=on) AS
SELECT 
  id,
  session_id,
  -- Mascara email: lu***@gmail.com
  CONCAT(
    LEFT(email, 2), 
    '***@', 
    SPLIT_PART(email, '@', 2)
  ) as email_masked,
  created_at,
  recovered_at,
  recovered,
  amount
FROM public.abandoned_checkouts;

-- View mascarada para profiles (admin)
CREATE VIEW public.profiles_admin_view
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  CONCAT(LEFT(email, 2), '***@', SPLIT_PART(email, '@', 2)) as email_masked,
  name,
  -- Mascara telefone: (85) 9****-1234
  CASE 
    WHEN phone IS NOT NULL THEN 
      CONCAT(LEFT(phone, 5), '****-', RIGHT(phone, 4))
    ELSE NULL 
  END as phone_masked,
  created_at,
  first_visit_at,
  utm_source,
  utm_medium,
  utm_campaign,
  -- Mascara stripe ID parcialmente
  CASE 
    WHEN stripe_customer_id IS NOT NULL THEN 
      CONCAT('cus_***', RIGHT(stripe_customer_id, 4))
    ELSE NULL 
  END as stripe_id_masked
FROM public.profiles;
```

### 2. Bloquear Acesso Direto as Tabelas Base

Atualizar RLS para que admins usem APENAS as views mascaradas:

```sql
-- Remover politica permissiva de admin em abandoned_checkouts
DROP POLICY IF EXISTS "Admins can read abandoned checkouts" ON abandoned_checkouts;

-- Criar politica mais restritiva
CREATE POLICY "Admins read via masked view only" 
ON abandoned_checkouts FOR SELECT
USING (false);  -- Bloqueia SELECT direto

-- Dar acesso apenas a view
GRANT SELECT ON public.abandoned_checkouts_masked TO authenticated;
```

### 3. Funcao para Acesso Completo com Auditoria

Para casos onde o admin PRECISA do email completo (ex: suporte), criar funcao auditada:

```sql
-- Funcao que retorna email completo E registra no audit_log
CREATE OR REPLACE FUNCTION public.get_customer_email_audited(
  p_record_id uuid,
  p_table_name text,
  p_reason text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_user_id uuid;
BEGIN
  -- Verificar se e admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  v_user_id := auth.uid();
  
  -- Buscar email conforme tabela
  IF p_table_name = 'abandoned_checkouts' THEN
    SELECT email INTO v_email 
    FROM abandoned_checkouts 
    WHERE id = p_record_id;
  ELSIF p_table_name = 'profiles' THEN
    SELECT email INTO v_email 
    FROM profiles 
    WHERE id = p_record_id;
  ELSE
    RAISE EXCEPTION 'Invalid table';
  END IF;
  
  -- Registrar acesso no audit_log
  INSERT INTO audit_log (
    table_name, 
    record_id, 
    action, 
    user_id,
    user_email,
    new_data
  ) VALUES (
    p_table_name,
    p_record_id,
    'PII_ACCESS',
    v_user_id,
    (SELECT email FROM auth.users WHERE id = v_user_id),
    jsonb_build_object('reason', p_reason, 'accessed_at', now())
  );
  
  RETURN v_email;
END;
$$;
```

### 4. Atualizar Frontend para Usar Views Mascaradas

**Arquivo: `src/hooks/useAdminDashboard.ts`**

Atualizar queries para usar views mascaradas:

```typescript
// Exemplo: buscar checkouts abandonados
const { data: abandonedCheckouts } = await supabase
  .from("abandoned_checkouts_masked")  // <- View mascarada
  .select("*")
  .order("created_at", { ascending: false });

// Se precisar email completo (com auditoria)
const getFullEmail = async (recordId: string, reason: string) => {
  const { data, error } = await supabase.rpc('get_customer_email_audited', {
    p_record_id: recordId,
    p_table_name: 'abandoned_checkouts',
    p_reason: reason
  });
  return data;
};
```

### 5. Adicionar Trigger de Alerta para Acessos Suspeitos

```sql
-- Funcao que alerta sobre multiplos acessos PII
CREATE OR REPLACE FUNCTION public.check_pii_access_pattern()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_access_count integer;
BEGIN
  -- Contar acessos PII nos ultimos 5 minutos
  SELECT COUNT(*) INTO v_access_count
  FROM audit_log
  WHERE action = 'PII_ACCESS'
    AND user_id = NEW.user_id
    AND created_at > now() - interval '5 minutes';
  
  -- Se mais de 10 acessos em 5 min, registrar alerta
  IF v_access_count > 10 THEN
    INSERT INTO audit_log (
      table_name, record_id, action, user_id, new_data
    ) VALUES (
      'security_alert', gen_random_uuid(), 'EXCESSIVE_PII_ACCESS',
      NEW.user_id,
      jsonb_build_object(
        'alert', 'Excessive PII access detected',
        'count', v_access_count,
        'period', '5 minutes'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_pii_access_pattern
AFTER INSERT ON audit_log
FOR EACH ROW
WHEN (NEW.action = 'PII_ACCESS')
EXECUTE FUNCTION check_pii_access_pattern();
```

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| Migration SQL | Criar views mascaradas, funcoes auditadas, triggers |
| `src/hooks/useAdminDashboard.ts` | Usar views mascaradas |
| `src/hooks/useEmailDashboard.ts` | Usar views mascaradas |
| `src/pages/Gestao.tsx` | Adicionar botao "Ver email completo" com confirmacao |

---

## Resumo da Migracao SQL

```sql
-- 1. Criar views mascaradas
CREATE VIEW abandoned_checkouts_masked ...
CREATE VIEW profiles_admin_view ...

-- 2. Dar permissao as views
GRANT SELECT ON abandoned_checkouts_masked TO authenticated;
GRANT SELECT ON profiles_admin_view TO authenticated;

-- 3. Criar funcao de acesso auditado
CREATE FUNCTION get_customer_email_audited(...) ...

-- 4. Criar trigger de alerta
CREATE FUNCTION check_pii_access_pattern() ...
CREATE TRIGGER audit_pii_access_pattern ...

-- 5. Atualizar RLS para bloquear acesso direto (opcional, mais restritivo)
-- DROP POLICY "Admins can read abandoned checkouts" ON abandoned_checkouts;
```

---

## Fluxo de Acesso Admin Atualizado

```text
ADMIN LOGADO
      |
      v
[Dashboard Gestao]
      |
      +---> Lista abandonos: usa VIEW mascarada
      |     email_masked: "lu***@gmail.com"
      |
      +---> Precisa email completo?
            |
            v
      [Modal de Confirmacao]
      "Motivo do acesso: [__________]"
      [Confirmar]
            |
            v
      [RPC: get_customer_email_audited]
            |
            +---> Retorna email
            +---> Registra no audit_log
            +---> Verifica padrao de acesso
```

---

## Criterios de Aceitacao

- [ ] Views mascaradas criadas para `abandoned_checkouts` e `profiles`
- [ ] Dashboards admin usam views mascaradas por padrao
- [ ] Funcao `get_customer_email_audited` registra todos os acessos PII
- [ ] Trigger alerta sobre padroes suspeitos (>10 acessos em 5 min)
- [ ] Emails completos so acessiveis com motivo registrado
- [ ] Audit log mostra historico de acessos PII

---

## Secao Tecnica: Porque Esta Abordagem

1. **Views com `security_invoker=on`**: Herdam permissoes do usuario chamador, respeitando RLS
2. **SECURITY DEFINER nas funcoes**: Permite acesso controlado as tabelas base
3. **Audit trail**: Rastreabilidade completa de quem acessou o que
4. **Deteccao de anomalias**: Trigger identifica comportamento de harvesting
5. **Principio do minimo privilegio**: Admin so ve dados completos quando necessario

Esta solucao mantem a funcionalidade do dashboard mas adiciona camadas de protecao contra comprometimento de credenciais admin.
