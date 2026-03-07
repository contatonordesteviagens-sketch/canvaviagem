-- Backfill: inserir ex-assinantes já cancelados na tabela winback_emails
-- Garante que os 16 cancelados atuais entrem na sequência de win-back
-- Usa updated_at como canceled_at (melhor aproximação disponível)

INSERT INTO public.winback_emails (user_id, email, name, canceled_at)
SELECT
  s.user_id,
  p.email,
  p.name,
  s.updated_at AS canceled_at
FROM public.subscriptions s
JOIN public.profiles p ON p.user_id = s.user_id
WHERE s.status = 'canceled'
  AND p.email IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;
