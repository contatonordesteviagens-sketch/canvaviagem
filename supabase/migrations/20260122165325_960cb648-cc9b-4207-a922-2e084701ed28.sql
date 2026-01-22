-- Tabela para rastrear envio de emails automatizados (Drip Campaign)
CREATE TABLE IF NOT EXISTS public.user_email_automations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  name text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  email_1_sent_at timestamp with time zone,
  email_2_sent_at timestamp with time zone,
  email_3_sent_at timestamp with time zone,
  unsubscribed boolean DEFAULT false NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.user_email_automations ENABLE ROW LEVEL SECURITY;

-- Política: Bloquear acesso direto (apenas service role via Edge Functions)
CREATE POLICY "Block direct access to email automations"
ON public.user_email_automations
FOR ALL
USING (false)
WITH CHECK (false);

-- Índice para consultas de campanhas pendentes
CREATE INDEX idx_email_automations_pending 
  ON public.user_email_automations (created_at) 
  WHERE email_1_sent_at IS NULL 
     OR email_2_sent_at IS NULL 
     OR email_3_sent_at IS NULL;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_email_automations_updated_at
  BEFORE UPDATE ON public.user_email_automations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função que cria registro de automação quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user_email_automation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_email_automations (user_id, email, name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;

-- Trigger que dispara após novo usuário no auth.users
CREATE TRIGGER on_auth_user_created_email_automation
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_email_automation();