-- Keep the primary administrator aligned across RBAC, Fabrica entitlements and
-- the database access helpers. The email fallback already exists in is_admin();
-- this forward migration repairs the missing role and closes the newer helpers.

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'lucashenriquephd@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

CREATE OR REPLACE FUNCTION public.has_fabrica_full_access(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (
      auth.role() = 'service_role'
      OR auth.uid() = p_user_id
    )
    AND (
      EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = p_user_id
          AND role = 'admin'
      )
      OR EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = p_user_id
          AND lower(email) = 'lucashenriquephd@gmail.com'
      )
      OR EXISTS (
        SELECT 1
        FROM public.subscriptions
        WHERE user_id = p_user_id
          AND status IN ('active', 'trialing')
          AND product_id IN (
            'prod_UTFsXcKq8m0mol',
            'prod_UTSmPe3GPt8iHt',
            'prod_UTFlCWzNqvqSNx',
            'hotmart_elite',
            'elite_ticto',
            'monthly_access_pix',
            'annual_access_pix'
          )
          AND (
            (
              status = 'active'
              AND (current_period_end IS NULL OR current_period_end > now())
            )
            OR (
              status = 'trialing'
              AND COALESCE(trial_ends_at, current_period_end) > now()
            )
          )
      )
    );
$$;

REVOKE ALL ON FUNCTION public.has_fabrica_full_access(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_fabrica_full_access(uuid)
  TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.fabrica_full_access_internal(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id
      AND role = 'admin'
  ) OR EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = p_user_id
      AND lower(email) = 'lucashenriquephd@gmail.com'
  ) OR EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = p_user_id
      AND status IN ('active', 'trialing')
      AND product_id IN (
        'prod_UTFsXcKq8m0mol',
        'prod_UTSmPe3GPt8iHt',
        'prod_UTFlCWzNqvqSNx',
        'hotmart_elite',
        'elite_ticto',
        'monthly_access_pix',
        'annual_access_pix'
      )
      AND (
        (
          status = 'active'
          AND (current_period_end IS NULL OR current_period_end > now())
        )
        OR (
          status = 'trialing'
          AND COALESCE(trial_ends_at, current_period_end) > now()
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.fabrica_full_access_internal(uuid) FROM PUBLIC;

UPDATE public.public_sites
SET
  is_active = true,
  suspended_at = NULL,
  suspension_reason = NULL
WHERE owner_id IN (
  SELECT id
  FROM auth.users
  WHERE lower(email) = 'lucashenriquephd@gmail.com'
);