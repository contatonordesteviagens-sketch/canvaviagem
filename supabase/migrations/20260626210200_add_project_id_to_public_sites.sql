ALTER TABLE public.public_sites
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.fabrica_diagnosticos(id) ON DELETE SET NULL;
