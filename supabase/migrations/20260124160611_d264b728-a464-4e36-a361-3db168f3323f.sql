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