-- The secure reserve_fabrica_usage overload reads and writes `fingerprint`,
-- but production only retained `server_fingerprint`. Restore the missing
-- client-device signal so reservations no longer fail with PostgreSQL 42703.

ALTER TABLE public.fabrica_usage_ledger
ADD COLUMN IF NOT EXISTS fingerprint text;

CREATE INDEX IF NOT EXISTS idx_fabrica_usage_ledger_capability_fingerprint
  ON public.fabrica_usage_ledger (capability, fingerprint)
  WHERE fingerprint IS NOT NULL;
