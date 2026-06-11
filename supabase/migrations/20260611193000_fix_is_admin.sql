-- Atualizar a função is_admin() para verificar a tabela user_roles e o e-mail correto
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica se o usuário tem a role 'admin' na tabela user_roles
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Fallback para o e-mail de admin fixo
  RETURN (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN ('lucashenriquephd@gmail.com')
  ) IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
