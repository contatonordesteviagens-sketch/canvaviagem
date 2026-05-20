
CREATE OR REPLACE FUNCTION public.append_webinar_lead_comment(
  p_whatsapp text,
  p_message text,
  p_time text,
  p_playback_second integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_source jsonb;
  new_comment jsonb;
BEGIN
  IF p_whatsapp IS NULL OR p_message IS NULL OR length(trim(p_message)) = 0 THEN
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

  new_comment := jsonb_build_object(
    'time', p_time,
    'message', left(p_message, 1000),
    'timestamp', (extract(epoch from now()) * 1000)::bigint,
    'playbackSecond', p_playback_second,
    'answered', false
  );

  current_source := jsonb_set(
    current_source,
    '{comments}',
    COALESCE(current_source->'comments', '[]'::jsonb) || new_comment,
    true
  );
  current_source := jsonb_set(current_source, '{lastActiveAt}', to_jsonb((extract(epoch from now()) * 1000)::bigint), true);

  UPDATE public.webinar_leads
  SET source = current_source::text
  WHERE whatsapp = p_whatsapp;
END;
$$;

REVOKE ALL ON FUNCTION public.append_webinar_lead_comment(text, text, text, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.append_webinar_lead_comment(text, text, text, integer) TO anon, authenticated;
