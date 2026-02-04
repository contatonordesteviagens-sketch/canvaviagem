-- =============================================
-- Corrigir page_views para exigir autenticação
-- Remove possibilidade de poluição de analytics
-- =============================================

-- Remover política que permite inserções anônimas
DROP POLICY IF EXISTS "Users can insert own page views" ON public.page_views;

-- Criar nova política que exige autenticação
CREATE POLICY "Authenticated users can insert own views"
ON public.page_views
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  auth.uid() = user_id
);