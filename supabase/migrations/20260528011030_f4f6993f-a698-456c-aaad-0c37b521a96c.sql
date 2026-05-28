
-- public_sites: restrict UPDATE/DELETE to owner or admin
DROP POLICY IF EXISTS "Authenticated users can update sites" ON public.public_sites;
DROP POLICY IF EXISTS "Authenticated users can delete sites" ON public.public_sites;
DROP POLICY IF EXISTS "Authenticated users can publish sites" ON public.public_sites;

CREATE POLICY "Owners or admins can update sites"
ON public.public_sites
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id OR public.is_admin())
WITH CHECK (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Owners or admins can delete sites"
ON public.public_sites
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Authenticated users can publish own sites"
ON public.public_sites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id OR public.is_admin());

-- user_suggestions: require non-null user_id matching auth.uid()
DROP POLICY IF EXISTS "Authenticated users can insert suggestions" ON public.user_suggestions;

CREATE POLICY "Authenticated users can insert own suggestions"
ON public.user_suggestions
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);
