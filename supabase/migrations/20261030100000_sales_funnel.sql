-- Funil de vendas: guardar cada cobrança Pix e cada checkout de cartão no nosso banco,
-- para saber quem gerou Pix / abriu o cartão e não pagou (recuperação por e-mail).
-- Só cria tabelas e uma função de leitura para admin. Não altera nem apaga dados existentes.

-- ─── Pix (Woovi) ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pix_charges (
  correlation_id text PRIMARY KEY,
  user_id uuid,
  email text,
  plan text NOT NULL,
  value_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',          -- ACTIVE | COMPLETED | EXPIRED
  payment_link_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  paid_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pix_charges_email_idx ON public.pix_charges (email);
CREATE INDEX IF NOT EXISTS pix_charges_user_idx ON public.pix_charges (user_id);
CREATE INDEX IF NOT EXISTS pix_charges_status_idx ON public.pix_charges (status, created_at DESC);

ALTER TABLE public.pix_charges ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pix_charges FROM anon, authenticated;
GRANT ALL ON public.pix_charges TO service_role;

-- ─── Cartão (Stripe Checkout) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.card_checkouts (
  session_id text PRIMARY KEY,
  user_id uuid,
  email text,
  plan text,
  ui_mode text,
  status text NOT NULL DEFAULT 'open',            -- open | completed | expired
  recovery_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS card_checkouts_email_idx ON public.card_checkouts (email);
CREATE INDEX IF NOT EXISTS card_checkouts_status_idx ON public.card_checkouts (status, created_at DESC);

ALTER TABLE public.card_checkouts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.card_checkouts FROM anon, authenticated;
GRANT ALL ON public.card_checkouts TO service_role;

-- ─── Funil por e-mail (Gestão, só admin) ──────────────────────────────────
-- Etapas: email → quiz_iniciado → quiz_concluido → checkout_aberto → pix_gerado / cartao_aberto → pagou
CREATE OR REPLACE FUNCTION public.admin_funnel_leads()
RETURNS TABLE (
  email text,
  user_id uuid,
  stage text,
  quiz_steps integer,
  quiz_finished boolean,
  plan_selected text,
  pix_status text,
  pix_plan text,
  pix_value_cents integer,
  pix_created_at timestamptz,
  pix_link text,
  card_status text,
  card_plan text,
  card_created_at timestamptz,
  card_recovery_url text,
  subscribed boolean,
  first_seen_at timestamptz,
  last_activity_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH people AS (
    SELECT lower(c.email) AS email, min(c.first_seen_at) AS first_seen_at, max(c.last_seen_at) AS last_seen_at
    FROM public.email_captures c GROUP BY lower(c.email)
    UNION
    SELECT lower(u.email), u.created_at, coalesce(u.last_sign_in_at, u.created_at)
    FROM auth.users u WHERE u.email IS NOT NULL
  ),
  people_one AS (
    SELECT email, min(first_seen_at) AS first_seen_at, max(last_seen_at) AS last_seen_at FROM people GROUP BY email
  ),
  accounts AS (
    SELECT lower(u.email) AS email, u.id AS user_id FROM auth.users u WHERE u.email IS NOT NULL
  ),
  quiz AS (
    SELECT e.user_id,
           count(*) FILTER (WHERE e.event_type = 'onboarding_step')::int AS steps,
           bool_or(e.event_type = 'onboarding_step' AND e.event_data->>'kind' = 'offer') AS finished,
           (array_agg(e.event_data->>'billing_cycle' ORDER BY e.created_at DESC) FILTER (WHERE e.event_type = 'plan_selected'))[1] AS plan_selected,
           max(e.created_at) AS last_at
    FROM public.analytics_events e
    WHERE e.event_type IN ('onboarding_step', 'plan_selected') AND e.user_id IS NOT NULL
    GROUP BY e.user_id
  ),
  pix AS (
    SELECT DISTINCT ON (lower(p.email)) lower(p.email) AS email, p.status, p.plan, p.value_cents, p.created_at, p.payment_link_url
    FROM public.pix_charges p WHERE p.email IS NOT NULL
    ORDER BY lower(p.email), (p.status = 'COMPLETED') DESC, p.created_at DESC
  ),
  card AS (
    SELECT DISTINCT ON (lower(k.email)) lower(k.email) AS email, k.status, k.plan, k.created_at, k.recovery_url
    FROM public.card_checkouts k WHERE k.email IS NOT NULL
    ORDER BY lower(k.email), (k.status = 'completed') DESC, k.created_at DESC
  ),
  subs AS (
    SELECT s.user_id,
           (s.status IN ('active', 'trialing') AND (s.current_period_end IS NULL OR s.current_period_end > now())) AS active
    FROM public.subscriptions s
  )
  SELECT
    p.email,
    a.user_id,
    CASE
      WHEN coalesce(s.active, false) OR pix.status = 'COMPLETED' OR card.status = 'completed' THEN 'pagou'
      WHEN pix.email IS NOT NULL THEN 'pix_gerado'
      WHEN card.email IS NOT NULL THEN 'cartao_aberto'
      WHEN q.plan_selected IS NOT NULL THEN 'checkout_aberto'
      WHEN coalesce(q.finished, false) THEN 'quiz_concluido'
      WHEN coalesce(q.steps, 0) > 0 THEN 'quiz_iniciado'
      ELSE 'email'
    END AS stage,
    coalesce(q.steps, 0),
    coalesce(q.finished, false),
    q.plan_selected,
    pix.status, pix.plan, pix.value_cents, pix.created_at, pix.payment_link_url,
    card.status, card.plan, card.created_at, card.recovery_url,
    coalesce(s.active, false),
    p.first_seen_at,
    greatest(p.last_seen_at, q.last_at, pix.created_at, card.created_at)
  FROM people_one p
  LEFT JOIN accounts a ON a.email = p.email
  LEFT JOIN quiz q ON q.user_id = a.user_id
  LEFT JOIN pix ON pix.email = p.email
  LEFT JOIN card ON card.email = p.email
  LEFT JOIN subs s ON s.user_id = a.user_id
  WHERE public.is_admin()
  ORDER BY greatest(p.last_seen_at, q.last_at, pix.created_at, card.created_at) DESC NULLS LAST;
$$;
REVOKE ALL ON FUNCTION public.admin_funnel_leads() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_funnel_leads() TO authenticated;
