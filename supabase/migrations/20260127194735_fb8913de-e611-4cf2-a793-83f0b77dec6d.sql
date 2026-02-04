-- 1. Add UTM columns to profiles table for permanent attribution
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text,
ADD COLUMN IF NOT EXISTS referrer_url text,
ADD COLUMN IF NOT EXISTS first_visit_at timestamptz DEFAULT now();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_utm_source ON public.profiles(utm_source);

-- 2. Create analytics_events table for granular funnel tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  session_id text,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  url_path text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_session ON public.analytics_events(session_id);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert events (anonymous tracking)
CREATE POLICY "Allow insert for all" ON public.analytics_events
FOR INSERT WITH CHECK (true);

-- Only admins can read events
CREATE POLICY "Admins can read all events" ON public.analytics_events
FOR SELECT USING (public.is_admin());

-- 3. Create marketing_stats view for aggregated data
CREATE OR REPLACE VIEW public.marketing_stats AS
SELECT 
  COALESCE(ts.utm_source, 'Direto') as source,
  COALESCE(ts.utm_medium, '-') as medium,
  COALESCE(ts.utm_campaign, '-') as campaign,
  COUNT(DISTINCT ts.session_id) as visitors,
  COUNT(DISTINCT CASE WHEN ts.user_id IS NOT NULL THEN ts.user_id END) as leads,
  COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END) as subscribers,
  COALESCE(SUM(CASE WHEN s.status = 'active' THEN 9.90 ELSE 0 END), 0) as revenue,
  CASE 
    WHEN COUNT(DISTINCT ts.session_id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END)::numeric / COUNT(DISTINCT ts.session_id)::numeric) * 100, 2)
    ELSE 0 
  END as conversion_rate
FROM public.traffic_sources ts
LEFT JOIN public.subscriptions s ON ts.user_id = s.user_id AND s.status = 'active'
GROUP BY ts.utm_source, ts.utm_medium, ts.utm_campaign
ORDER BY visitors DESC;