-- Tabela para registrar eventos do Resend (webhooks)
CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id text NOT NULL,
  type text NOT NULL,
  recipient_email text,
  email_type text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Politica: Service role pode inserir (via Edge Functions)
CREATE POLICY "Allow service role insert" ON public.email_events
  FOR INSERT WITH CHECK (true);

-- Politica: Usuarios autenticados podem ler para dashboard
CREATE POLICY "Allow authenticated read" ON public.email_events
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Indices para consultas rapidas
CREATE INDEX idx_email_events_type ON public.email_events (type);
CREATE INDEX idx_email_events_created_at ON public.email_events (created_at DESC);
CREATE INDEX idx_email_events_email_id ON public.email_events (email_id);