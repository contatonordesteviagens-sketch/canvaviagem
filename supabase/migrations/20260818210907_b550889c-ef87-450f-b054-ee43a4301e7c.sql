ALTER TABLE public.webinar_leads ADD COLUMN IF NOT EXISTS session_token uuid;

CREATE UNIQUE INDEX IF NOT EXISTS webinar_leads_session_token_key ON public.webinar_leads (session_token) WHERE session_token IS NOT NULL;

-- Issue (once) a per-attendee session token when the lead row is created.
CREATE OR REPLACE FUNCTION public.claim_webinar_lead_session(p_whatsapp text, p_name text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_token uuid;
BEGIN
  IF p_whatsapp IS NULL OR length(trim(p_whatsapp)) = 0 OR p_whatsapp = 'global_live_settings' THEN
    RETURN NULL;
  END IF;

  SELECT session_token INTO v_token
  FROM public.webinar_leads
  WHERE whatsapp = p_whatsapp
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_token IS NULL THEN
    v_token := gen_random_uuid();
    UPDATE public.webinar_leads
       SET session_token = v_token
     WHERE whatsapp = p_whatsapp
       AND session_token IS NULL;
    SELECT session_token INTO v_token FROM public.webinar_leads WHERE whatsapp = p_whatsapp LIMIT 1;
    RETURN v_token;
  END IF;

  -- Token already issued: never hand it out again.
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_webinar_lead_session(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_webinar_lead_session(text, text) TO anon, authenticated, service_role;

-- Require the session token before mutating a lead record.
CREATE OR REPLACE FUNCTION public.append_webinar_lead_comment(p_whatsapp text, p_message text, p_time text, p_playback_second integer DEFAULT NULL::integer, p_session_token uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_source jsonb;
  new_comment jsonb;
BEGIN
  IF p_whatsapp IS NULL OR p_message IS NULL OR length(trim(p_message)) = 0 THEN
    RETURN;
  END IF;
  IF p_whatsapp = 'global_live_settings' OR p_session_token IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(source::jsonb, '{}'::jsonb) INTO current_source
  FROM public.webinar_leads
  WHERE whatsapp = p_whatsapp AND session_token = p_session_token
  LIMIT 1;

  IF current_source IS NULL THEN
    RETURN;
  END IF;

  new_comment := jsonb_build_object(
    'time', p_time,
    'message', left(p_message, 1000),
    'timestamp', (extract(epoch from now()) * 1000)::bigint,
    'playbackSecond', p_playback_second,
    'answered', false
  );

  current_source := jsonb_set(current_source, '{comments}', COALESCE(current_source->'comments', '[]'::jsonb) || new_comment, true);
  current_source := jsonb_set(current_source, '{lastActiveAt}', to_jsonb((extract(epoch from now()) * 1000)::bigint), true);

  UPDATE public.webinar_leads
  SET source = current_source::text
  WHERE whatsapp = p_whatsapp AND session_token = p_session_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_webinar_lead_session(p_whatsapp text, p_watch_time integer DEFAULT NULL::integer, p_last_playback_time integer DEFAULT NULL::integer, p_clicked_offer boolean DEFAULT NULL::boolean, p_left boolean DEFAULT false, p_session_token uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_source jsonb;
  now_ms bigint := (extract(epoch from now()) * 1000)::bigint;
BEGIN
  IF p_whatsapp IS NULL OR length(trim(p_whatsapp)) = 0 THEN
    RETURN;
  END IF;
  IF p_whatsapp = 'global_live_settings' OR p_session_token IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(source::jsonb, '{}'::jsonb) INTO current_source
  FROM public.webinar_leads
  WHERE whatsapp = p_whatsapp AND session_token = p_session_token
  LIMIT 1;

  IF current_source IS NULL THEN
    RETURN;
  END IF;

  current_source := current_source || jsonb_build_object('sourceType', 'live');

  IF p_watch_time IS NOT NULL THEN
    current_source := jsonb_set(current_source, '{watchTime}', to_jsonb(p_watch_time), true);
  END IF;
  IF p_last_playback_time IS NOT NULL THEN
    current_source := jsonb_set(current_source, '{lastPlaybackTime}', to_jsonb(p_last_playback_time), true);
  END IF;
  IF p_clicked_offer IS NOT NULL THEN
    current_source := jsonb_set(current_source, '{clickedOffer}', to_jsonb(p_clicked_offer), true);
  END IF;

  current_source := jsonb_set(current_source, '{lastActiveAt}', to_jsonb(now_ms), true);

  IF p_left THEN
    current_source := jsonb_set(current_source, '{leftAt}', to_jsonb(now_ms), true);
  END IF;

  UPDATE public.webinar_leads
  SET source = current_source::text
  WHERE whatsapp = p_whatsapp AND session_token = p_session_token;
END;
$$;

DROP FUNCTION IF EXISTS public.append_webinar_lead_comment(text, text, text, integer);
DROP FUNCTION IF EXISTS public.update_webinar_lead_session(text, integer, integer, boolean, boolean);