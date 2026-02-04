-- Tabela para bloco de notas do admin
CREATE TABLE public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem gerenciar notas
CREATE POLICY "Admins podem ver notas"
ON public.admin_notes
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins podem inserir notas"
ON public.admin_notes
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins podem atualizar notas"
ON public.admin_notes
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins podem deletar notas"
ON public.admin_notes
FOR DELETE
USING (public.is_admin());

-- Tabela para tracking de page views
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  page_path text NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário pode inserir views (anônimo ou logado)
CREATE POLICY "Usuarios podem inserir views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

-- Apenas admins podem ver todas as views
CREATE POLICY "Admins podem ver todas views"
ON public.page_views
FOR SELECT
USING (public.is_admin());

-- Trigger para updated_at nas notas
CREATE TRIGGER update_admin_notes_updated_at
BEFORE UPDATE ON public.admin_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();