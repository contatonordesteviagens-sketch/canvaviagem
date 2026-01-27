-- Tabela para armazenar tokens de magic link personalizados
CREATE TABLE public.magic_link_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para busca rápida por token
CREATE INDEX idx_magic_link_tokens_token ON public.magic_link_tokens(token);

-- Índice para limpeza de tokens expirados
CREATE INDEX idx_magic_link_tokens_expires_at ON public.magic_link_tokens(expires_at);

-- Habilitar RLS
ALTER TABLE public.magic_link_tokens ENABLE ROW LEVEL SECURITY;

-- Política: Bloquear acesso direto (apenas Edge Functions com service role podem acessar)
CREATE POLICY "Block direct access to magic_link_tokens"
ON public.magic_link_tokens
FOR ALL
USING (false)
WITH CHECK (false);