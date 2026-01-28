-- Criar tabela para entradas do calendário dinâmico
CREATE TABLE public.calendar_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  caption_id UUID REFERENCES public.captions(id) ON DELETE SET NULL,
  day_of_year INTEGER NOT NULL,
  year INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(day_of_year, year)
);

-- Enable RLS
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read calendar entries" 
  ON public.calendar_entries 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert calendar entries"
  ON public.calendar_entries 
  FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update calendar entries"
  ON public.calendar_entries 
  FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Admins can delete calendar entries"
  ON public.calendar_entries 
  FOR DELETE 
  USING (is_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_calendar_entries_updated_at
  BEFORE UPDATE ON public.calendar_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();