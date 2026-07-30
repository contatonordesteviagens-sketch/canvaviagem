-- Freemium entitlements are account-scoped and append-only. Customer projects,
-- sites and CRM data are never deleted or mutated by access changes.

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS billing_provider text,
  ADD COLUMN IF NOT EXISTS billing_cycle text;

CREATE TABLE IF NOT EXISTS public.fabrica_usage_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capability text NOT NULL CHECK (capability IN ('ad_export', 'carousel_export')),
  idempotency_key text NOT NULL,
  project_id text,
  status text NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'committed', 'released')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, capability, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_fabrica_usage_owner_capability
  ON public.fabrica_usage_ledger (user_id, capability, status, created_at DESC);

ALTER TABLE public.fabrica_usage_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own fabrica usage" ON public.fabrica_usage_ledger;
CREATE POLICY "Users can read own fabrica usage"
  ON public.fabrica_usage_ledger
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.reserve_fabrica_usage(
  p_user_id uuid,
  p_capability text,
  p_idempotency_key text,
  p_project_id text,
  p_metadata jsonb,
  p_limit integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_row public.fabrica_usage_ledger%ROWTYPE;
  active_count integer;
  reserved_id uuid;
BEGIN
  IF p_capability NOT IN ('ad_export', 'carousel_export') THEN
    RAISE EXCEPTION 'invalid_capability';
  END IF;

  IF p_limit < 0 OR length(p_idempotency_key) < 8 OR length(p_idempotency_key) > 180 THEN
    RAISE EXCEPTION 'invalid_usage_request';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_capability));

  SELECT *
    INTO existing_row
    FROM public.fabrica_usage_ledger
   WHERE user_id = p_user_id
     AND capability = p_capability
     AND idempotency_key = p_idempotency_key;

  IF FOUND AND existing_row.status = 'committed' THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'duplicate', true,
      'reservation_id', existing_row.id,
      'remaining', GREATEST(p_limit - (
        SELECT count(*)::integer
          FROM public.fabrica_usage_ledger
         WHERE user_id = p_user_id
           AND capability = p_capability
           AND status = 'committed'
      ), 0)
    );
  END IF;

  IF FOUND
     AND existing_row.status = 'reserved'
     AND existing_row.expires_at > now() THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'duplicate', true,
      'reservation_id', existing_row.id,
      'remaining', GREATEST(p_limit - (
        SELECT count(*)::integer
          FROM public.fabrica_usage_ledger
         WHERE user_id = p_user_id
           AND capability = p_capability
           AND (
             status = 'committed'
             OR (status = 'reserved' AND expires_at > now())
           )
      ), 0)
    );
  END IF;

  UPDATE public.fabrica_usage_ledger
     SET status = 'released', updated_at = now()
   WHERE user_id = p_user_id
     AND capability = p_capability
     AND status = 'reserved'
     AND expires_at <= now();

  SELECT count(*)::integer
    INTO active_count
    FROM public.fabrica_usage_ledger
   WHERE user_id = p_user_id
     AND capability = p_capability
     AND (
       status = 'committed'
       OR (status = 'reserved' AND expires_at > now())
     );

  IF active_count >= p_limit THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', 0);
  END IF;

  INSERT INTO public.fabrica_usage_ledger (
    user_id,
    capability,
    idempotency_key,
    project_id,
    metadata,
    status,
    expires_at
  )
  VALUES (
    p_user_id,
    p_capability,
    p_idempotency_key,
    NULLIF(p_project_id, ''),
    COALESCE(p_metadata, '{}'::jsonb),
    'reserved',
    now() + interval '15 minutes'
  )
  ON CONFLICT (user_id, capability, idempotency_key)
  DO UPDATE SET
    project_id = EXCLUDED.project_id,
    metadata = EXCLUDED.metadata,
    status = 'reserved',
    expires_at = EXCLUDED.expires_at,
    updated_at = now()
  RETURNING id INTO reserved_id;

  RETURN jsonb_build_object(
    'allowed', true,
    'duplicate', false,
    'reservation_id', reserved_id,
    'remaining', GREATEST(p_limit - active_count - 1, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_fabrica_usage(
  uuid, text, text, text, jsonb, integer
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_fabrica_usage(
  uuid, text, text, text, jsonb, integer
) TO service_role;

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
      )
    );
$$;

REVOKE ALL ON FUNCTION public.has_fabrica_full_access(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_fabrica_full_access(uuid)
  TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.can_create_fabrica_project(p_user_id uuid)
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
      public.has_fabrica_full_access(p_user_id)
      OR (
        SELECT count(*) < 1
        FROM public.fabrica_diagnosticos
        WHERE user_id = p_user_id
      )
    );
$$;

REVOKE ALL ON FUNCTION public.can_create_fabrica_project(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_create_fabrica_project(uuid)
  TO authenticated, service_role;

-- The RLS count above controls normal inserts. This trigger serializes concurrent
-- inserts for the same free account so two requests cannot both pass the count.
CREATE OR REPLACE FUNCTION public.enforce_fabrica_project_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.has_fabrica_full_access(NEW.user_id) THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> NEW.user_id THEN
    RAISE EXCEPTION 'project_owner_mismatch';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('fabrica-project:' || NEW.user_id::text));

  -- A conta pode materializar cada publicacao antiga que ja lhe pertence.
  -- A excecao so existe dentro da RPC autenticada abaixo e exige que o site
  -- esteja orfao; ela nao libera a criacao comum de novos projetos.
  IF NULLIF(current_setting('app.fabrica_recovery_site_id', true), '') IS NOT NULL
    AND NEW.level_name = 'Site publicado recuperado'
    AND EXISTS (
      SELECT 1
      FROM public.public_sites site
      WHERE site.id = current_setting('app.fabrica_recovery_site_id', true)
        AND site.owner_id = NEW.user_id
        AND site.project_id IS NULL
    )
  THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.fabrica_diagnosticos
    WHERE user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'free_project_limit_reached';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_fabrica_project_limit() FROM PUBLIC;

DROP TRIGGER IF EXISTS enforce_fabrica_project_limit
  ON public.fabrica_diagnosticos;
CREATE TRIGGER enforce_fabrica_project_limit
  BEFORE INSERT ON public.fabrica_diagnosticos
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_fabrica_project_limit();

-- Free and legacy accounts can keep and edit the project they already own.
-- Only the creation of additional projects is limited.
DROP POLICY IF EXISTS "Users can create their own diagnosticos"
  ON public.fabrica_diagnosticos;
CREATE POLICY "Users can create their own diagnosticos"
  ON public.fabrica_diagnosticos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.can_create_fabrica_project(auth.uid())
  );

-- Convert an owned legacy publication into an editable project without losing
-- it to the free one-project limit. The site row is locked, the snapshot is
-- created and the relation is written in the same transaction.
CREATE OR REPLACE FUNCTION public.materialize_fabrica_published_site(
  p_site_id text,
  p_project_id uuid,
  p_agency_name text,
  p_state_snapshot jsonb,
  p_digital_score integer DEFAULT 0,
  p_level integer DEFAULT 1,
  p_checklist_progress jsonb DEFAULT '{}'::jsonb
)
RETURNS public.fabrica_diagnosticos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  owned_site public.public_sites%ROWTYPE;
  existing_project public.fabrica_diagnosticos%ROWTYPE;
  recovered_project public.fabrica_diagnosticos%ROWTYPE;
  canonical_snapshot jsonb;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;
  IF p_site_id IS NULL OR length(trim(p_site_id)) = 0 OR p_project_id IS NULL THEN
    RAISE EXCEPTION 'invalid_recovery_identity';
  END IF;
  IF jsonb_typeof(COALESCE(p_state_snapshot, '{}'::jsonb)) <> 'object' THEN
    RAISE EXCEPTION 'invalid_project_snapshot';
  END IF;
  IF pg_column_size(COALESCE(p_state_snapshot, '{}'::jsonb)) > 5242880 THEN
    RAISE EXCEPTION 'project_snapshot_too_large';
  END IF;
  IF jsonb_typeof(COALESCE(p_checklist_progress, '{}'::jsonb)) <> 'object' THEN
    RAISE EXCEPTION 'invalid_checklist_progress';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('fabrica-project:' || current_user_id::text));

  SELECT *
  INTO owned_site
  FROM public.public_sites
  WHERE id = trim(p_site_id)
    AND owner_id = current_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'published_site_not_owned_or_missing';
  END IF;

  -- Retrying the same recovery is idempotent. Never overwrite the snapshot of
  -- a project that has already been materialized and edited.
  IF owned_site.project_id IS NOT NULL THEN
    SELECT *
    INTO existing_project
    FROM public.fabrica_diagnosticos
    WHERE id::text = owned_site.project_id::text
      AND user_id = current_user_id;

    IF FOUND THEN
      RETURN existing_project;
    END IF;

    RAISE EXCEPTION 'published_site_project_not_owned';
  END IF;

  SELECT *
  INTO existing_project
  FROM public.fabrica_diagnosticos
  WHERE id = p_project_id;

  IF FOUND THEN
    IF existing_project.user_id IS DISTINCT FROM current_user_id
      OR existing_project.level_name IS DISTINCT FROM 'Site publicado recuperado'
      OR existing_project.state_snapshot ->> 'projectId' IS DISTINCT FROM p_project_id::text
      OR position(
        lower(owned_site.id)
        IN lower(COALESCE(existing_project.state_snapshot #>> '{siteContent,canvaViagemUrl}', ''))
      ) = 0
    THEN
      RAISE EXCEPTION 'recovered_project_id_conflict';
    END IF;

    -- Compatibilidade com uma recuperação antiga que conseguiu criar o
    -- snapshot, mas perdeu a conexão antes de vincular exatamente este site.
    UPDATE public.public_sites
    SET project_id = existing_project.id,
        updated_at = now()
    WHERE id = owned_site.id
      AND owner_id = current_user_id;
    RETURN existing_project;
  END IF;

  canonical_snapshot := jsonb_set(
    COALESCE(p_state_snapshot, '{}'::jsonb),
    '{projectId}',
    to_jsonb(p_project_id::text),
    true
  );

  PERFORM set_config('app.fabrica_recovery_site_id', owned_site.id, true);

  INSERT INTO public.fabrica_diagnosticos (
    id,
    user_id,
    agency_name,
    digital_score,
    level,
    level_name,
    state_snapshot,
    checklist_progress,
    updated_at
  )
  VALUES (
    p_project_id,
    current_user_id,
    left(COALESCE(NULLIF(trim(p_agency_name), ''), 'Site recuperado'), 180),
    greatest(0, least(COALESCE(p_digital_score, 0), 100)),
    greatest(1, least(COALESCE(p_level, 1), 100)),
    'Site publicado recuperado',
    canonical_snapshot,
    COALESCE(p_checklist_progress, '{}'::jsonb),
    now()
  )
  RETURNING * INTO recovered_project;

  UPDATE public.public_sites
  SET project_id = recovered_project.id,
      updated_at = now()
  WHERE id = owned_site.id
    AND owner_id = current_user_id
    AND project_id IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'published_site_recovery_conflict';
  END IF;

  RETURN recovered_project;
END;
$$;

REVOKE ALL ON FUNCTION public.materialize_fabrica_published_site(
  text, uuid, text, jsonb, integer, integer, jsonb
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.materialize_fabrica_published_site(
  text, uuid, text, jsonb, integer, integer, jsonb
) TO authenticated, service_role;

-- Explicit deletion remains available to the owner on every tier. Forms are
-- detached and archived before the project is removed, preserving submissions
-- even when an older schema still carries cascade constraints.
CREATE OR REPLACE FUNCTION public.delete_fabrica_project(
  p_project_id uuid,
  p_legacy_slugs text[] DEFAULT '{}'::text[]
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  deleted_sites integer := 0;
  archived_forms integer := 0;
  deleted_projects integer := 0;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;
  IF p_project_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.fabrica_diagnosticos
    WHERE id = p_project_id
      AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'project_not_owned';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('fabrica-project:' || current_user_id::text));

  DELETE FROM public.public_sites
  WHERE owner_id = current_user_id
    AND (
      project_id::text = p_project_id::text
      OR (
        project_id IS NULL
        AND id = ANY (COALESCE(p_legacy_slugs, '{}'::text[]))
      )
    );
  GET DIAGNOSTICS deleted_sites = ROW_COUNT;

  UPDATE public.crm_forms
  SET project_id = NULL,
      status = 'archived',
      updated_at = now()
  WHERE owner_id = current_user_id
    AND (
      project_id = p_project_id
      OR id = p_project_id::text
      OR embed_key = p_project_id::text
    );
  GET DIAGNOSTICS archived_forms = ROW_COUNT;

  DELETE FROM public.fabrica_diagnosticos
  WHERE id = p_project_id
    AND user_id = current_user_id;
  GET DIAGNOSTICS deleted_projects = ROW_COUNT;

  IF deleted_projects <> 1 THEN
    RAISE EXCEPTION 'project_delete_failed';
  END IF;

  RETURN jsonb_build_object(
    'project_id', p_project_id,
    'deleted_sites', deleted_sites,
    'deleted_forms', 0,
    'archived_forms', archived_forms
  );
END;
$$;

REVOKE ALL ON FUNCTION public.delete_fabrica_project(uuid, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_fabrica_project(uuid, text[])
  TO authenticated;

-- Published sites remain online after downgrade. Only publishing or updating
-- the production artifact requires Elite; existing data is not touched.
DROP POLICY IF EXISTS "Authenticated users can publish own sites"
  ON public.public_sites;
CREATE POLICY "Authenticated users can publish own sites"
  ON public.public_sites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND public.has_fabrica_full_access(auth.uid())
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.fabrica_diagnosticos project
        WHERE project.id::text = public_sites.project_id::text
          AND project.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Owners or admins can update sites"
  ON public.public_sites;
CREATE POLICY "Owners or admins can update sites"
  ON public.public_sites
  FOR UPDATE
  TO authenticated
  USING (
    (
      auth.uid() = owner_id
      AND public.has_fabrica_full_access(auth.uid())
    )
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
    OR (
      auth.uid() = owner_id
      AND public.has_fabrica_full_access(auth.uid())
      AND (
        project_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.fabrica_diagnosticos project
          WHERE project.id::text = public_sites.project_id::text
            AND project.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Owners or admins can delete sites"
  ON public.public_sites;
CREATE POLICY "Owners or admins can delete sites"
  ON public.public_sites
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = owner_id
    OR public.is_admin()
  );

-- CRM records and captured leads are preserved on downgrade but only become
-- readable or manageable again when full access is restored.
DROP POLICY IF EXISTS "Users manage own crm forms" ON public.crm_forms;
DROP POLICY IF EXISTS "Elite users read own crm forms" ON public.crm_forms;
DROP POLICY IF EXISTS "Elite users create own crm forms" ON public.crm_forms;
DROP POLICY IF EXISTS "Elite users update own crm forms" ON public.crm_forms;
DROP POLICY IF EXISTS "Elite users delete own crm forms" ON public.crm_forms;
CREATE POLICY "Elite users read own crm forms"
  ON public.crm_forms
  FOR SELECT
  TO authenticated
  USING (
    (
      auth.uid() = owner_id
      AND public.has_fabrica_full_access(auth.uid())
    )
    OR public.is_admin()
  );
CREATE POLICY "Elite users create own crm forms"
  ON public.crm_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      auth.uid() = owner_id
      AND public.has_fabrica_full_access(auth.uid())
    )
    OR public.is_admin()
  );
CREATE POLICY "Elite users update own crm forms"
  ON public.crm_forms
  FOR UPDATE
  TO authenticated
  USING (
    (
      auth.uid() = owner_id
      AND public.has_fabrica_full_access(auth.uid())
    )
    OR public.is_admin()
  )
  WITH CHECK (
    (
      auth.uid() = owner_id
      AND public.has_fabrica_full_access(auth.uid())
    )
    OR public.is_admin()
  );
CREATE POLICY "Elite users delete own crm forms"
  ON public.crm_forms
  FOR DELETE
  TO authenticated
  USING (
    (
      auth.uid() = owner_id
      AND public.has_fabrica_full_access(auth.uid())
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users read own crm submissions"
  ON public.crm_form_submissions;
CREATE POLICY "Users read own crm submissions"
  ON public.crm_form_submissions
  FOR SELECT
  TO authenticated
  USING (
    (
      auth.uid() = owner_id
      AND public.has_fabrica_full_access(auth.uid())
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Elite users create own crm submissions"
  ON public.crm_form_submissions;
CREATE POLICY "Elite users create own crm submissions"
  ON public.crm_form_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      auth.uid() = owner_id
      AND public.has_fabrica_full_access(auth.uid())
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users update own crm submissions"
  ON public.crm_form_submissions;
CREATE POLICY "Users update own crm submissions"
  ON public.crm_form_submissions
  FOR UPDATE
  TO authenticated
  USING (
    (
      auth.uid() = owner_id
      AND public.has_fabrica_full_access(auth.uid())
    )
    OR public.is_admin()
  )
  WITH CHECK (
    (
      auth.uid() = owner_id
      AND public.has_fabrica_full_access(auth.uid())
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users delete own crm submissions"
  ON public.crm_form_submissions;
CREATE POLICY "Users delete own crm submissions"
  ON public.crm_form_submissions
  FOR DELETE
  TO authenticated
  USING (
    (
      auth.uid() = owner_id
      AND public.has_fabrica_full_access(auth.uid())
    )
    OR public.is_admin()
  );

-- The legacy publish RPC used SECURITY DEFINER and therefore bypassed all CRM
-- policies. Run it as the caller so the Elite checks above remain authoritative.
ALTER FUNCTION IF EXISTS public.publish_fabrica_crm_form(
  uuid, text, text, jsonb, jsonb
) SECURITY INVOKER;

-- Keep every authenticated mutation path behind the same RLS rules, including
-- functions created by older migrations.
ALTER FUNCTION IF EXISTS public.publish_fabrica_site(
  text, uuid, text, text
) SECURITY INVOKER;
ALTER FUNCTION IF EXISTS public.promote_fabrica_legacy_lead(
  uuid, text
) SECURITY INVOKER;

NOTIFY pgrst, 'reload schema';
