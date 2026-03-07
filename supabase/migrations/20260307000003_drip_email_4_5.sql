-- Adicionar colunas email_4 e email_5 ao drip campaign
-- email_4 = D+14: Agente Lucrativo introdução
-- email_5 = D+30: Agente Lucrativo última chance

ALTER TABLE public.user_email_automations
  ADD COLUMN IF NOT EXISTS email_4_sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS email_5_sent_at timestamp with time zone;

-- Atualizar índice para incluir os novos emails pendentes
DROP INDEX IF EXISTS idx_email_automations_pending;

CREATE INDEX idx_email_automations_pending
  ON public.user_email_automations (created_at)
  WHERE unsubscribed = false
    AND (
      email_1_sent_at IS NULL OR
      email_2_sent_at IS NULL OR
      email_3_sent_at IS NULL OR
      email_4_sent_at IS NULL OR
      email_5_sent_at IS NULL
    );
