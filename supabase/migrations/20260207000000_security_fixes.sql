-- 1. Fix "Admins can read abandoned checkouts" policy conflict
-- The linter reports that this unmasked policy exists alongside a masked one.
-- We drop the unmasked one to enforce security best practices (using masked views or specific allow-lists).
DROP POLICY IF EXISTS "Admins can read abandoned checkouts" ON public.abandoned_checkouts;

-- 2. Fix "Extension in Public" warning
-- Move pg_net extension to a dedicated extensions schema.
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_net SET SCHEMA extensions;
