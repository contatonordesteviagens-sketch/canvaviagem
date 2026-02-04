-- Tabela para rastreamento de fontes de tráfego (UTM)
CREATE TABLE public.traffic_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  landing_page TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_traffic_sources_session ON public.traffic_sources(session_id);
CREATE INDEX idx_traffic_sources_user ON public.traffic_sources(user_id);
CREATE INDEX idx_traffic_sources_utm_source ON public.traffic_sources(utm_source);
CREATE INDEX idx_traffic_sources_created ON public.traffic_sources(created_at);

-- Enable RLS
ALTER TABLE public.traffic_sources ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can insert traffic sources" 
ON public.traffic_sources 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all traffic sources" 
ON public.traffic_sources 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can update their own traffic sources" 
ON public.traffic_sources 
FOR UPDATE 
USING (user_id = auth.uid());

-- Adicionar coluna para associar assinatura à fonte de tráfego
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS traffic_source_id UUID REFERENCES public.traffic_sources(id);