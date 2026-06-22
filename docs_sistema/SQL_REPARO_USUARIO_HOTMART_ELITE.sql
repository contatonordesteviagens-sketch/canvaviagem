-- Reparo manual emergencial para comprador Hotmart Elite.
-- Banco correto: zdjtcwtakgizbsbbwtgc.
--
-- Use somente quando:
-- 1. A compra foi confirmada na Hotmart.
-- 2. O e-mail abaixo e o mesmo usado pelo comprador.
-- 3. O usuario ja tentou entrar/criar conta no Canva Viagem.
--
-- Troque os dois valores abaixo antes de executar:
--   comprador@example.com
--   HOTMART_TRANSACTION_ID

begin;

with target_user as (
  select id, lower(email) as email
  from auth.users
  where lower(email) = lower('comprador@example.com')
  limit 1
),
upsert_profile as (
  insert into public.profiles (
    user_id,
    email,
    name,
    updated_at
  )
  select
    id,
    email,
    split_part(email, '@', 1),
    now()
  from target_user
  on conflict (user_id) do update set
    email = excluded.email,
    updated_at = now()
  returning user_id
)
insert into public.subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  product_id,
  current_period_end,
  updated_at
)
select
  id,
  null,
  'hotmart:HOTMART_TRANSACTION_ID',
  'active',
  'hotmart_elite',
  now() + interval '365 days',
  now()
from target_user
on conflict (user_id) do update set
  stripe_customer_id = null,
  stripe_subscription_id = excluded.stripe_subscription_id,
  status = 'active',
  product_id = 'hotmart_elite',
  current_period_end = excluded.current_period_end,
  updated_at = now();

-- Deve retornar 1 linha. Se retornar 0, o usuario ainda nao existe em auth.users.
select
  u.id as user_id,
  u.email,
  s.status,
  s.product_id,
  s.current_period_end
from auth.users u
left join public.subscriptions s on s.user_id = u.id
where lower(u.email) = lower('comprador@example.com');

commit;
