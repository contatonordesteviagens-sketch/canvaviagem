
CREATE OR REPLACE FUNCTION public.update_webinar_lead_session(
  p_whatsapp text,
  p_watch_time integer DEFAULT NULL,
  p_last_playback_time integer DEFAULT NULL,
  p_clicked_offer boolean DEFAULT NULL,
  p_left boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_source jsonb;
  now_ms bigint := (extract(epoch from now()) * 1000)::bigint;
BEGIN
  IF p_whatsapp IS NULL OR length(trim(p_whatsapp)) = 0 THEN
    RETURN;
  END IF;
  IF p_whatsapp = 'global_live_settings' THEN
    RETURN;
  END IF;

  SELECT COALESCE(source::jsonb, '{}'::jsonb) INTO current_source
  FROM public.webinar_leads
  WHERE whatsapp = p_whatsapp
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
  WHERE whatsapp = p_whatsapp;
END;
$$;

REVOKE ALL ON FUNCTION public.update_webinar_lead_session(text, integer, integer, boolean, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.update_webinar_lead_session(text, integer, integer, boolean, boolean) TO anon, authenticated;
