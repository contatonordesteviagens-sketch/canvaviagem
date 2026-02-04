-- Block anonymous access to abandoned_checkouts
CREATE POLICY "Block anonymous select on abandoned_checkouts"
ON public.abandoned_checkouts
FOR SELECT
TO anon
USING (false);

-- Block anonymous access to profiles (explicit deny for anon role)
CREATE POLICY "Block anonymous select on profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);