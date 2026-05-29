-- Drop the unique constraint to allow multiple projects per user
ALTER TABLE public.fabrica_diagnosticos
DROP CONSTRAINT IF EXISTS fabrica_diagnosticos_user_id_key;
