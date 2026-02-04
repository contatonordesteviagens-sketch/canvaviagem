-- Adicionar política de defesa em profundidade para bloquear acesso anônimo
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR ALL
USING (auth.uid() IS NOT NULL);