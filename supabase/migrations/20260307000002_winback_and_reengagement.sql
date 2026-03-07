-- =============================================
-- Tabela winback_emails: rastreia envio de emails para ex-assinantes
-- Trigger: quando subscriptions.status vira 'canceled', insere aqui
-- =============================================

CREATE TABLE IF NOT EXISTS public.winback_emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email text NOT NULL,
  name text,
  canceled_at timestamp with time zone DEFAULT now() NOT NULL,
  winback_1_sent_at timestamp with time zone,  -- D+7
  winback_2_sent_at timestamp with time zone,  -- D+21
  winback_3_sent_at timestamp with time zone,  -- D+45
  reactivated_at timestamp with time zone,
  unsubscribed boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE public.winback_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block direct access to winback emails"
ON public.winback_emails
AS RESTRICTIVE
FOR ALL
USING (false)
WITH CHECK (false);

CREATE INDEX idx_winback_pending ON public.winback_emails (canceled_at)
  WHERE reactivated_at IS NULL AND unsubscribed = false;

-- =============================================
-- Trigger: quando status vira 'canceled' em subscriptions,
-- cria entrada em winback_emails automaticamente
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_subscription_canceled()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text;
  v_name text;
BEGIN
  -- Só age quando status muda para 'canceled'
  IF NEW.status = 'canceled' AND (OLD.status IS NULL OR OLD.status != 'canceled') THEN
    -- Buscar email e nome do perfil
    SELECT p.email, p.name INTO v_email, v_name
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id
    LIMIT 1;

    IF v_email IS NOT NULL THEN
      INSERT INTO public.winback_emails (user_id, email, name, canceled_at)
      VALUES (NEW.user_id, v_email, v_name, now())
      ON CONFLICT (user_id) DO UPDATE SET
        canceled_at = now(),
        reactivated_at = NULL,
        winback_1_sent_at = NULL,
        winback_2_sent_at = NULL,
        winback_3_sent_at = NULL;
    END IF;
  END IF;

  -- Quando reativa: marca como reativado
  IF NEW.status = 'active' AND OLD.status = 'canceled' THEN
    UPDATE public.winback_emails
    SET reactivated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_subscription_canceled ON public.subscriptions;
CREATE TRIGGER on_subscription_canceled
  AFTER UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_subscription_canceled();

-- =============================================
-- Coluna reengagement em user_email_automations
-- Rastreia email de reativação para assinantes inativos
-- =============================================

ALTER TABLE public.user_email_automations
  ADD COLUMN IF NOT EXISTS reengagement_sent_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_email_automations_reengagement
  ON public.user_email_automations (reengagement_sent_at)
  WHERE reengagement_sent_at IS NULL AND unsubscribed = false;
