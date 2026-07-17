-- A migration falha de forma segura se existirem publicações duplicadas.
-- A escolha do domínio que deve permanecer é uma decisão do usuário; nunca
-- apagamos sites existentes automaticamente durante um deploy de banco.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.public_sites
    WHERE project_id IS NOT NULL
    GROUP BY owner_id, project_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'duplicate_public_sites_require_review: republique ou remova as cópias antigas antes de aplicar esta migration';
  END IF;
END;
$$;

-- Uma publicação vinculada não pode sobreviver sem o projeto que a originou.
-- Isso também fecha a janela de corrida entre publicar e excluir um projeto.
ALTER TABLE public.public_sites
DROP CONSTRAINT IF EXISTS public_sites_project_id_fkey;

ALTER TABLE public.public_sites
ADD CONSTRAINT public_sites_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES public.fabrica_diagnosticos(id)
ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS public_sites_owner_project_unique
  ON public.public_sites (owner_id, project_id)
  WHERE project_id IS NOT NULL;

-- DML direto continua disponível durante o rollout, porém não pode associar
-- uma publicação a um projeto que pertença a outra conta.
DROP POLICY IF EXISTS "Owners or admins can update sites" ON public.public_sites;
DROP POLICY IF EXISTS "Owners or admins can delete sites" ON public.public_sites;
DROP POLICY IF EXISTS "Authenticated users can publish own sites" ON public.public_sites;

CREATE POLICY "Owners or admins can update sites"
ON public.public_sites
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id OR public.is_admin())
WITH CHECK (
  public.is_admin()
  OR (
    auth.uid() = owner_id
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.fabrica_diagnosticos project
        WHERE project.id = public_sites.project_id
          AND project.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Owners or admins can delete sites"
ON public.public_sites
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Authenticated users can publish own sites"
ON public.public_sites
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
  OR (
    auth.uid() = owner_id
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.fabrica_diagnosticos project
        WHERE project.id = public_sites.project_id
          AND project.user_id = auth.uid()
      )
    )
  )
);

-- Um formulário canônico pertence a exatamente um projeto. O vínculo permite
-- apagar formulário e submissões automaticamente quando o projeto é excluído.
ALTER TABLE public.crm_forms
ADD COLUMN IF NOT EXISTS project_id uuid
REFERENCES public.fabrica_diagnosticos(id)
ON DELETE CASCADE;

UPDATE public.crm_forms form
SET project_id = project.id
FROM public.fabrica_diagnosticos project
WHERE form.project_id IS NULL
  AND project.id::text = form.id
  AND project.user_id = form.owner_id;

CREATE UNIQUE INDEX IF NOT EXISTS crm_forms_project_unique
  ON public.crm_forms (project_id)
  WHERE project_id IS NOT NULL;

DROP POLICY IF EXISTS "Users manage own crm forms" ON public.crm_forms;
CREATE POLICY "Users manage own crm forms"
ON public.crm_forms
FOR ALL
TO authenticated
USING (
  public.is_admin()
  OR (
    auth.uid() = owner_id
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.fabrica_diagnosticos project
        WHERE project.id = crm_forms.project_id
          AND project.user_id = auth.uid()
      )
    )
  )
)
WITH CHECK (
  public.is_admin()
  OR (
    auth.uid() = owner_id
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.fabrica_diagnosticos project
        WHERE project.id = crm_forms.project_id
          AND project.user_id = auth.uid()
      )
    )
  )
);

CREATE OR REPLACE FUNCTION public.publish_fabrica_crm_form(
  p_project_id uuid,
  p_name text,
  p_description text,
  p_fields jsonb,
  p_settings jsonb
)
RETURNS public.crm_forms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  canonical_form_id text := p_project_id::text;
  published_form public.crm_forms%ROWTYPE;
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

  IF jsonb_typeof(COALESCE(p_fields, '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'invalid_form_fields';
  END IF;

  IF jsonb_typeof(COALESCE(p_settings, '{}'::jsonb)) <> 'object' THEN
    RAISE EXCEPTION 'invalid_form_settings';
  END IF;

  -- O projeto é a autoridade. Uma reserva maliciosa ou legada do UUID não
  -- pode impedir o proprietário verdadeiro de publicar o formulário.
  DELETE FROM public.crm_forms
  WHERE embed_key = canonical_form_id
    AND id <> canonical_form_id;

  INSERT INTO public.crm_forms (
    id,
    owner_id,
    project_id,
    name,
    description,
    fields,
    settings,
    embed_key,
    status
  )
  VALUES (
    canonical_form_id,
    current_user_id,
    p_project_id,
    left(COALESCE(NULLIF(trim(p_name), ''), 'Formulario principal'), 180),
    NULLIF(left(COALESCE(p_description, ''), 1000), ''),
    COALESCE(p_fields, '[]'::jsonb),
    COALESCE(p_settings, '{}'::jsonb),
    canonical_form_id,
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    owner_id = EXCLUDED.owner_id,
    project_id = EXCLUDED.project_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    fields = EXCLUDED.fields,
    settings = EXCLUDED.settings,
    embed_key = EXCLUDED.embed_key,
    status = 'active',
    updated_at = now()
  RETURNING * INTO published_form;

  RETURN published_form;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_fabrica_crm_form(uuid, text, text, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_fabrica_crm_form(uuid, text, text, jsonb, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.publish_fabrica_site(
  p_slug text,
  p_project_id uuid,
  p_html text,
  p_locale text DEFAULT 'pt-BR'
)
RETURNS public.public_sites
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  existing_site public.public_sites%ROWTYPE;
  published_site public.public_sites%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  IF p_slug IS NULL
    OR p_slug !~ '^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$'
    OR length(p_slug) > 63
    OR p_slug = ANY (ARRAY['www', 'app', 'admin', 'api', 'painel', 'blog', 'sites']) THEN
    RAISE EXCEPTION 'invalid_site_slug';
  END IF;

  IF p_project_id IS NULL THEN
    RAISE EXCEPTION 'project_required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.fabrica_diagnosticos
    WHERE id = p_project_id
      AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'project_not_owned';
  END IF;

  IF p_html IS NULL OR length(p_html) < 100 THEN
    RAISE EXCEPTION 'invalid_site_html';
  END IF;

  SELECT * INTO existing_site
  FROM public.public_sites
  WHERE id = p_slug;

  IF FOUND AND existing_site.owner_id <> current_user_id THEN
    RAISE EXCEPTION 'site_slug_unavailable';
  END IF;

  IF FOUND
    AND existing_site.project_id IS NOT NULL
    AND existing_site.project_id <> p_project_id THEN
    RAISE EXCEPTION 'site_slug_belongs_to_another_project';
  END IF;

  DELETE FROM public.public_sites
  WHERE owner_id = current_user_id
    AND project_id = p_project_id
    AND id <> p_slug;

  INSERT INTO public.public_sites (id, owner_id, project_id, html, locale)
  VALUES (
    p_slug,
    current_user_id,
    p_project_id,
    p_html,
    CASE WHEN p_locale = 'es' THEN 'es' ELSE 'pt-BR' END
  )
  ON CONFLICT (id) DO UPDATE SET
    project_id = EXCLUDED.project_id,
    html = EXCLUDED.html,
    locale = EXCLUDED.locale,
    updated_at = now()
  WHERE public.public_sites.owner_id = current_user_id
    AND (
      public.public_sites.project_id IS NULL
      OR public.public_sites.project_id = p_project_id
    )
  RETURNING * INTO published_site;

  IF published_site.id IS NULL THEN
    RAISE EXCEPTION 'site_publish_not_allowed';
  END IF;

  RETURN published_site;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_fabrica_site(text, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_fabrica_site(text, uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_fabrica_project(
  p_project_id uuid,
  p_legacy_slugs text[] DEFAULT '{}'::text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  deleted_sites integer := 0;
  deleted_forms integer := 0;
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

  DELETE FROM public.public_sites
  WHERE owner_id = current_user_id
    AND (
      project_id = p_project_id
      OR (
        project_id IS NULL
        AND id = ANY (COALESCE(p_legacy_slugs, '{}'::text[]))
      )
    );
  GET DIAGNOSTICS deleted_sites = ROW_COUNT;

  DELETE FROM public.crm_forms
  WHERE owner_id = current_user_id
    AND (
      project_id = p_project_id
      OR id = p_project_id::text
      OR embed_key = p_project_id::text
    );
  GET DIAGNOSTICS deleted_forms = ROW_COUNT;

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
    'deleted_forms', deleted_forms
  );
END;
$$;

REVOKE ALL ON FUNCTION public.delete_fabrica_project(uuid, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_fabrica_project(uuid, text[]) TO authenticated;

-- Proteção mínima contra abuso do formulário público. O endereço de rede nunca
-- é armazenado: a Edge Function envia apenas um hash não reversível combinado
-- com o user-agent. O incremento é atômico, inclusive sob requisições paralelas.
CREATE TABLE IF NOT EXISTS public.crm_form_rate_limits (
  form_id text NOT NULL REFERENCES public.crm_forms(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1 CHECK (request_count > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (form_id, fingerprint, window_start)
);

CREATE INDEX IF NOT EXISTS crm_form_rate_limits_updated_at_idx
  ON public.crm_form_rate_limits (updated_at);

ALTER TABLE public.crm_form_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_crm_form_rate_limit(
  p_form_id text,
  p_fingerprint text,
  p_limit integer DEFAULT 8,
  p_window_seconds integer DEFAULT 600
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  safe_limit integer := greatest(1, least(COALESCE(p_limit, 8), 100));
  safe_window integer := greatest(60, least(COALESCE(p_window_seconds, 600), 86400));
  bucket_start timestamptz;
  resulting_count integer;
BEGIN
  IF p_form_id IS NULL
    OR p_fingerprint IS NULL
    OR length(p_fingerprint) < 32
    OR NOT EXISTS (
      SELECT 1
      FROM public.crm_forms
      WHERE id = p_form_id
        AND status = 'active'
    ) THEN
    RETURN false;
  END IF;

  bucket_start := to_timestamp(
    floor(extract(epoch FROM clock_timestamp()) / safe_window) * safe_window
  );

  INSERT INTO public.crm_form_rate_limits (
    form_id,
    fingerprint,
    window_start,
    request_count,
    updated_at
  )
  VALUES (
    p_form_id,
    left(p_fingerprint, 128),
    bucket_start,
    1,
    now()
  )
  ON CONFLICT (form_id, fingerprint, window_start) DO UPDATE SET
    request_count = crm_form_rate_limits.request_count + 1,
    updated_at = now()
  WHERE crm_form_rate_limits.request_count < safe_limit
  RETURNING request_count INTO resulting_count;

  RETURN resulting_count IS NOT NULL AND resulting_count <= safe_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.check_crm_form_rate_limit(text, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_crm_form_rate_limit(text, text, integer, integer) FROM anon;
REVOKE ALL ON FUNCTION public.check_crm_form_rate_limit(text, text, integer, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_crm_form_rate_limit(text, text, integer, integer) TO service_role;

-- Evita a janela em que as funções já existem no Postgres, mas ainda não são
-- conhecidas pela API REST usada pelo frontend.
NOTIFY pgrst, 'reload schema';
