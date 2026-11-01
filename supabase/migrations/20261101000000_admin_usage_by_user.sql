-- Gestão > Uso: o que cada conta fez na plataforma, lido de analytics_events. Só admin.
-- Eventos de visitantes dos sites publicados ficam com user_id do dono e têm agency_id, site_id ou
-- ingestion = validated_v1: entram como visita e clique, nunca como uso ou tempo na plataforma.
CREATE OR REPLACE FUNCTION public.admin_usage_by_user(p_days integer DEFAULT NULL)
RETURNS TABLE (
  user_id uuid,
  events jsonb,
  screens jsonb,
  sessions integer,
  active_seconds integer,
  first_fabrica_at timestamptz,
  first_art_at timestamptz,
  last_event_at timestamptz,
  site_visits integer,
  site_clicks integer,
  site_avg_seconds integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT e.user_id, e.session_id, e.event_type, e.url_path, e.created_at, e.event_data,
           (e.event_data ? 'agency_id' OR e.event_data ? 'site_id' OR e.event_data->>'ingestion' = 'validated_v1') AS from_site
    FROM public.analytics_events e
    WHERE e.user_id IS NOT NULL
      AND (p_days IS NULL OR e.created_at >= now() - make_interval(days => p_days))
  ),
  app AS (SELECT * FROM base WHERE NOT from_site),
  by_event AS (
    SELECT t.user_id, jsonb_object_agg(t.event_type, t.n) AS events
    FROM (SELECT a.user_id, a.event_type, count(*)::int AS n FROM app a GROUP BY a.user_id, a.event_type) t
    GROUP BY t.user_id
  ),
  by_screen AS (
    SELECT t.user_id, jsonb_object_agg(t.url_path, t.n) AS screens
    FROM (
      SELECT a.user_id, a.url_path, count(*)::int AS n FROM app a
      WHERE a.event_type = 'fabrica_opened' AND a.url_path IS NOT NULL
      GROUP BY a.user_id, a.url_path
    ) t
    GROUP BY t.user_id
  ),
  gaps AS (
    SELECT a.user_id,
           extract(epoch FROM a.created_at - lag(a.created_at) OVER (PARTITION BY a.user_id ORDER BY a.created_at)) AS gap
    FROM app a
    WHERE a.url_path LIKE '/fabrica%'
  ),
  by_time AS (
    -- Aproximado: soma os intervalos entre eventos da Fábrica. Pausa acima de 15 minutos abre outra sessão.
    -- O session_id dos eventos do produto muda a cada evento, por isso as sessões saem das pausas.
    SELECT g.user_id, (1 + count(*) FILTER (WHERE g.gap > 900))::int AS sessions,
           coalesce(sum(g.gap) FILTER (WHERE g.gap <= 900), 0)::int AS active_seconds
    FROM gaps g GROUP BY g.user_id
  ),
  by_user AS (
    SELECT a.user_id,
           min(a.created_at) FILTER (WHERE a.event_type = 'fabrica_opened') AS first_fabrica_at,
           min(a.created_at) FILTER (WHERE a.event_type = 'ad_preview_generated') AS first_art_at,
           max(a.created_at) AS last_event_at
    FROM app a GROUP BY a.user_id
  ),
  by_site AS (
    SELECT b.user_id,
           count(*) FILTER (WHERE b.event_type = 'page_view')::int AS site_visits,
           count(*) FILTER (WHERE b.event_type IN ('click_whatsapp', 'package_cta'))::int AS site_clicks,
           avg(CASE WHEN b.event_type = 'time_on_site' AND coalesce(b.event_data->>'duration', '') ~ '^\d{1,6}$'
                    THEN least((b.event_data->>'duration')::int, 3600) END)::int AS site_avg_seconds
    FROM base b WHERE b.from_site GROUP BY b.user_id
  ),
  ids AS (SELECT DISTINCT b.user_id FROM base b)
  SELECT i.user_id,
         coalesce(ev.events, '{}'::jsonb),
         coalesce(sc.screens, '{}'::jsonb),
         coalesce(ti.sessions, 0),
         coalesce(ti.active_seconds, 0),
         u.first_fabrica_at,
         u.first_art_at,
         u.last_event_at,
         coalesce(si.site_visits, 0),
         coalesce(si.site_clicks, 0),
         si.site_avg_seconds
  FROM ids i
  LEFT JOIN by_event ev ON ev.user_id = i.user_id
  LEFT JOIN by_screen sc ON sc.user_id = i.user_id
  LEFT JOIN by_time ti ON ti.user_id = i.user_id
  LEFT JOIN by_user u ON u.user_id = i.user_id
  LEFT JOIN by_site si ON si.user_id = i.user_id
  WHERE public.is_admin();
$$;

REVOKE ALL ON FUNCTION public.admin_usage_by_user(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_usage_by_user(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_usage_by_user(integer) TO authenticated;
