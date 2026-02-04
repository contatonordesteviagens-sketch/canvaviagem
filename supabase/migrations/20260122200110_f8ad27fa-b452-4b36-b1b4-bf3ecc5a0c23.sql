-- =============================================
-- Corrigir políticas RLS para RESTRICTIVE
-- Isso garante que o bloqueio sempre prevaleça
-- =============================================

-- 1. Profiles - Converter para RESTRICTIVE
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;

CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- 2. User Email Automations - Converter para RESTRICTIVE  
DROP POLICY IF EXISTS "Block direct access to email automations" ON public.user_email_automations;

CREATE POLICY "Block direct access to email automations"
ON public.user_email_automations
AS RESTRICTIVE
FOR ALL
USING (false)
WITH CHECK (false);