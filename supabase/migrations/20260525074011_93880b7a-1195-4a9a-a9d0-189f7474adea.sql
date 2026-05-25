-- Garantir que cada usuário tenha apenas um diagnóstico/estado principal salvo
-- Antes de criar a regra única, remove duplicados mantendo sempre o registro mais recente de cada usuário.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC, id DESC) AS rn
  FROM public.fabrica_diagnosticos
)
DELETE FROM public.fabrica_diagnosticos fd
USING ranked r
WHERE fd.id = r.id
  AND r.rn > 1;

-- Uma linha por usuário para o snapshot atual da Fábrica.
ALTER TABLE public.fabrica_diagnosticos
ADD CONSTRAINT fabrica_diagnosticos_user_id_key UNIQUE (user_id);

-- Índice para carregar rapidamente o estado atual do usuário.
CREATE INDEX IF NOT EXISTS idx_fabrica_diagnosticos_user_updated
ON public.fabrica_diagnosticos (user_id, updated_at DESC);

-- Trigger de updated_at para manter a data consistente em updates.
DROP TRIGGER IF EXISTS update_fabrica_diagnosticos_updated_at ON public.fabrica_diagnosticos;
CREATE TRIGGER update_fabrica_diagnosticos_updated_at
BEFORE UPDATE ON public.fabrica_diagnosticos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();