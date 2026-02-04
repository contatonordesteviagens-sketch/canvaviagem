-- 1. Adicionar política RESTRICTIVE para bloquear anon em abandoned_checkouts
CREATE POLICY "Deny all anonymous access on abandoned_checkouts"
  ON public.abandoned_checkouts
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- Remover política PERMISSIVE redundante
DROP POLICY IF EXISTS "Block anonymous select on abandoned_checkouts" ON public.abandoned_checkouts;

-- 2. Remover política redundante em profiles (RESTRICTIVE já cobre o bloqueio)
DROP POLICY IF EXISTS "Block anonymous select on profiles" ON public.profiles;